import { TransactionService } from '../../lib/services/transaction'
import { AuthService } from '../../lib/services/auth'
import { WalletService } from '../../lib/services/wallet'
import { NotificationService } from '../../lib/services/notification'
import { supabaseServer } from '../../lib/config/supabase'
import { TransactionStatus, ErrorCodes } from '../../lib/types'

// Mock dependencies
jest.mock('../../lib/services/auth')
jest.mock('../../lib/services/wallet')
jest.mock('../../lib/services/notification')
jest.mock('../../lib/config/supabase')

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>
const mockWalletService = WalletService as jest.Mocked<typeof WalletService>
const mockNotificationService = NotificationService as jest.Mocked<typeof NotificationService>
const mockSupabase = supabaseServer as jest.Mocked<typeof supabaseServer>

describe('TransactionService', () => {
  const mockSenderPhone = '+50688881111'
  const mockReceiverPhone = '+50588882222'
  const mockTransactionId = 'test-transaction-123'
  
  const mockUser = {
    id: 'user-123',
    phone: mockSenderPhone,
    name: 'Test User',
    country: 'CR' as const,
    wallet_address: '0x123...',
    kyc_status: 'verified' as const,
    created_at: new Date(),
    updated_at: new Date()
  }

  const mockTransaction = {
    id: mockTransactionId,
    sender_phone: mockSenderPhone,
    receiver_phone: mockReceiverPhone,
    amount_usd: 100,
    amount_local: 52050,
    exchange_rate: 520.50,
    fees: {
      platform_fee: 2.5,
      onramp_fee: 3.0,
      offramp_fee: 1.5
    },
    status: TransactionStatus.INITIATED,
    metadata: {
      onramp_provider: 'stripe',
      offramp_provider: 'sinpe',
      user_agent: 'whatsapp-bot'
    },
    created_at: new Date(),
    completed_at: undefined,
    onramp_reference: undefined,
    offramp_reference: undefined,
    blockchain_tx_hash: undefined
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup common mocks
    mockAuthService.getUserByPhone.mockResolvedValue(mockUser)
    mockNotificationService.sendTransactionNotification.mockResolvedValue(undefined)
    
    // Setup Supabase mocks
    mockSupabase.from = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockTransaction, fees: JSON.stringify(mockTransaction.fees) },
            error: null
          })
        })
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockTransaction, fees: JSON.stringify(mockTransaction.fees) },
            error: null
          })
        }),
        or: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [{ ...mockTransaction, fees: JSON.stringify(mockTransaction.fees) }],
              error: null
            })
          })
        }),
        gte: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockTransaction, fees: JSON.stringify(mockTransaction.fees) },
              error: null
            })
          })
        })
      })
    })
  })

  describe('createTransaction', () => {
    const validRequest = {
      receiver_phone: mockReceiverPhone,
      amount_usd: 100,
      onramp_provider: 'stripe'
    }

    it('should create a new transaction successfully', async () => {
      const result = await TransactionService.createTransaction(mockSenderPhone, validRequest)

      expect(result.transaction).toMatchObject({
        id: mockTransactionId,
        sender_phone: mockSenderPhone,
        receiver_phone: mockReceiverPhone,
        amount_usd: 100,
        status: TransactionStatus.INITIATED
      })
      expect(result.payment_url).toContain('mock-payment.stripe.com')
      expect(mockNotificationService.sendTransactionNotification).toHaveBeenCalledWith(
        mockSenderPhone,
        'TRANSACTION_INITIATED',
        expect.any(Object)
      )
    })

    it('should validate sender exists', async () => {
      mockAuthService.getUserByPhone.mockResolvedValue(null)

      await expect(
        TransactionService.createTransaction(mockSenderPhone, validRequest)
      ).rejects.toThrow('USER_NOT_FOUND')
    })

    it('should validate receiver phone format', async () => {
      const invalidRequest = { ...validRequest, receiver_phone: '+1234567890' }

      await expect(
        TransactionService.createTransaction(mockSenderPhone, invalidRequest)
      ).rejects.toThrow('INVALID_PHONE')
    })

    it('should validate amount limits', async () => {
      const invalidRequest = { ...validRequest, amount_usd: 15000 }

      await expect(
        TransactionService.createTransaction(mockSenderPhone, invalidRequest)
      ).rejects.toThrow('INVALID_REQUEST')
    })

    it('should calculate fees correctly', async () => {
      const result = await TransactionService.createTransaction(mockSenderPhone, validRequest)

      expect(result.transaction.fees).toEqual({
        platform_fee: 2.5, // 2.5% of $100
        onramp_fee: 3.0,   // Fixed $3
        offramp_fee: 1.5   // 1.5% of $100
      })
    })

    it('should check transaction limits', async () => {
      // Mock recent transactions that exceed daily limit
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({
              data: Array(10).fill({ amount_usd: 100 }), // $1000 already spent
              error: null
            })
          })
        })
      })

      await expect(
        TransactionService.createTransaction(mockSenderPhone, { ...validRequest, amount_usd: 50 })
      ).rejects.toThrow('TRANSACTION_LIMIT_EXCEEDED')
    })
  })

  describe('getTransactionStatus', () => {
    it('should return transaction status with estimation', async () => {
      const result = await TransactionService.getTransactionStatus(mockTransactionId, mockSenderPhone)

      expect(result.transaction.id).toBe(mockTransactionId)
      expect(result.estimated_completion).toBeInstanceOf(Date)
    })

    it('should throw error for non-existent transaction', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' }
            })
          })
        })
      })

      await expect(
        TransactionService.getTransactionStatus('non-existent', mockSenderPhone)
      ).rejects.toThrow('TRANSACTION_NOT_FOUND')
    })
  })

  describe('retryTransaction', () => {
    const failedTransaction = {
      ...mockTransaction,
      status: TransactionStatus.FAILED
    }

    beforeEach(() => {
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...failedTransaction, fees: JSON.stringify(failedTransaction.fees) },
              error: null
            })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { 
                  ...failedTransaction, 
                  status: TransactionStatus.INITIATED,
                  fees: JSON.stringify(failedTransaction.fees)
                },
                error: null
              })
            })
          })
        })
      })
    })

    it('should retry a failed transaction', async () => {
      const result = await TransactionService.retryTransaction(mockTransactionId, mockSenderPhone)

      expect(result.status).toBe(TransactionStatus.INITIATED)
    })

    it('should not retry non-failed transaction', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockTransaction, fees: JSON.stringify(mockTransaction.fees) }, // INITIATED status
              error: null
            })
          })
        })
      })

      await expect(
        TransactionService.retryTransaction(mockTransactionId, mockSenderPhone)
      ).rejects.toThrow('TRANSACTION_NOT_RETRYABLE')
    })
  })

  describe('updateTransactionStatus', () => {
    it('should update status with valid transition', async () => {
      const result = await TransactionService.updateTransactionStatus(
        mockTransactionId,
        TransactionStatus.PAYMENT_PENDING
      )

      expect(result.status).toBe(TransactionStatus.PAYMENT_PENDING)
      expect(mockNotificationService.sendTransactionNotification).toHaveBeenCalled()
    })

    it('should reject invalid state transitions', async () => {
      await expect(
        TransactionService.updateTransactionStatus(
          mockTransactionId,
          TransactionStatus.COMPLETED // Can't go directly from INITIATED to COMPLETED
        )
      ).rejects.toThrow('INVALID_STATE_TRANSITION')
    })

    it('should add completion timestamp for final states', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockTransaction, fees: JSON.stringify(mockTransaction.fees) },
              error: null
            })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { 
                  ...mockTransaction, 
                  status: TransactionStatus.COMPLETED,
                  completed_at: new Date().toISOString(),
                  fees: JSON.stringify(mockTransaction.fees)
                },
                error: null
              })
            })
          })
        })
      })

      const result = await TransactionService.updateTransactionStatus(
        mockTransactionId,
        TransactionStatus.COMPLETED
      )

      expect(result.completed_at).toBeDefined()
    })
  })

  describe('State Machine Validation', () => {
    const validTransitions = [
      [TransactionStatus.INITIATED, TransactionStatus.PAYMENT_PENDING],
      [TransactionStatus.PAYMENT_PENDING, TransactionStatus.PAYMENT_CONFIRMED],
      [TransactionStatus.PAYMENT_CONFIRMED, TransactionStatus.BLOCKCHAIN_PENDING],
      [TransactionStatus.BLOCKCHAIN_PENDING, TransactionStatus.BLOCKCHAIN_CONFIRMED],
      [TransactionStatus.BLOCKCHAIN_CONFIRMED, TransactionStatus.WITHDRAWAL_PENDING],
      [TransactionStatus.WITHDRAWAL_PENDING, TransactionStatus.COMPLETED],
      [TransactionStatus.FAILED, TransactionStatus.INITIATED], // Retry
    ]

    const invalidTransitions = [
      [TransactionStatus.INITIATED, TransactionStatus.BLOCKCHAIN_CONFIRMED],
      [TransactionStatus.PAYMENT_PENDING, TransactionStatus.COMPLETED],
      [TransactionStatus.COMPLETED, TransactionStatus.FAILED],
      [TransactionStatus.COMPLETED, TransactionStatus.INITIATED],
    ]

    validTransitions.forEach(([from, to]) => {
      it(`should allow transition from ${from} to ${to}`, async () => {
        // Mock current transaction with 'from' status
        mockSupabase.from = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { 
                  ...mockTransaction, 
                  status: from,
                  fees: JSON.stringify(mockTransaction.fees)
                },
                error: null
              })
            })
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { 
                    ...mockTransaction, 
                    status: to,
                    fees: JSON.stringify(mockTransaction.fees)
                  },
                  error: null
                })
              })
            })
          })
        })

        const result = await TransactionService.updateTransactionStatus(mockTransactionId, to)
        expect(result.status).toBe(to)
      })
    })

    invalidTransitions.forEach(([from, to]) => {
      it(`should reject transition from ${from} to ${to}`, async () => {
        // Mock current transaction with 'from' status
        mockSupabase.from = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { 
                  ...mockTransaction, 
                  status: from,
                  fees: JSON.stringify(mockTransaction.fees)
                },
                error: null
              })
            })
          })
        })

        await expect(
          TransactionService.updateTransactionStatus(mockTransactionId, to)
        ).rejects.toThrow('INVALID_STATE_TRANSITION')
      })
    })
  })

  describe('getUserTransactions', () => {
    it('should return user transactions', async () => {
      const transactions = await TransactionService.getUserTransactions(mockSenderPhone, 10)

      expect(transactions).toHaveLength(1)
      expect(transactions[0].id).toBe(mockTransactionId)
    })

    it('should handle empty results', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        })
      })

      const transactions = await TransactionService.getUserTransactions(mockSenderPhone)
      expect(transactions).toEqual([])
    })
  })

  describe('Integration Tests', () => {
    it('should handle full transaction lifecycle', async () => {
      // Mock wallet service for blockchain transfer
      mockWalletService.transferBetweenWallets.mockResolvedValue({
        blockchain_tx_hash: '0xabc123...',
        estimated_confirmation_time: 300
      })

      // Create transaction
      const createResult = await TransactionService.createTransaction(mockSenderPhone, {
        receiver_phone: mockReceiverPhone,
        amount_usd: 50,
        onramp_provider: 'stripe'
      })

      expect(createResult.transaction.status).toBe(TransactionStatus.INITIATED)

      // Test status progression through state machine
      const transactionId = createResult.transaction.id

      // Progress through states
      await TransactionService.updateTransactionStatus(transactionId, TransactionStatus.PAYMENT_PENDING)
      await TransactionService.updateTransactionStatus(transactionId, TransactionStatus.PAYMENT_CONFIRMED)
      await TransactionService.updateTransactionStatus(transactionId, TransactionStatus.BLOCKCHAIN_PENDING)
      await TransactionService.updateTransactionStatus(transactionId, TransactionStatus.BLOCKCHAIN_CONFIRMED)
      
      const finalResult = await TransactionService.updateTransactionStatus(transactionId, TransactionStatus.COMPLETED)
      
      expect(finalResult.status).toBe(TransactionStatus.COMPLETED)
      expect(finalResult.completed_at).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error', code: 'DB_ERROR' }
            })
          })
        })
      })

      await expect(
        TransactionService.createTransaction(mockSenderPhone, {
          receiver_phone: mockReceiverPhone,
          amount_usd: 100,
          onramp_provider: 'stripe'
        })
      ).rejects.toThrow('INTERNAL_SERVER_ERROR')
    })

    it('should handle notification failures without affecting transaction', async () => {
      mockNotificationService.sendTransactionNotification.mockRejectedValue(
        new Error('Notification service down')
      )

      const result = await TransactionService.createTransaction(mockSenderPhone, {
        receiver_phone: mockReceiverPhone,
        amount_usd: 100,
        onramp_provider: 'stripe'
      })

      // Transaction should still be created successfully
      expect(result.transaction).toBeDefined()
      expect(result.transaction.status).toBe(TransactionStatus.INITIATED)
    })
  })
})