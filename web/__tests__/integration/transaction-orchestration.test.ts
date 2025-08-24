import { TransactionService } from '../../lib/services/transaction'
import { AuthService } from '../../lib/services/auth'
import { WalletService } from '../../lib/services/wallet'
import { NotificationService } from '../../lib/services/notification'
import { supabaseServer } from '../../lib/config/supabase'
import { TransactionStatus, ErrorCodes } from '../../lib/types'

/**
 * Integration tests for Transaction Orchestration
 * Tests the complete end-to-end transaction flow including state machine transitions
 */

// Mock external dependencies but keep the orchestration logic
jest.mock('../../lib/config/supabase')
jest.mock('../../lib/services/notification')

const mockSupabase = supabaseServer as jest.Mocked<typeof supabaseServer>
const mockNotificationService = NotificationService as jest.Mocked<typeof NotificationService>

// Partial mock for services to test real orchestration logic
jest.mock('../../lib/services/auth', () => ({
  ...jest.requireActual('../../lib/services/auth'),
  getUserByPhone: jest.fn()
}))

jest.mock('../../lib/services/wallet', () => ({
  ...jest.requireActual('../../lib/services/wallet'),
  transferBetweenWallets: jest.fn()
}))

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>
const mockWalletService = WalletService as jest.Mocked<typeof WalletService>

describe('Transaction Orchestration Integration Tests', () => {
  const mockSenderPhone = '+50688881111'
  const mockReceiverPhone = '+50588882222'
  const mockTransactionId = 'test-transaction-orchestration-123'
  
  const mockSender = {
    id: 'sender-123',
    phone: mockSenderPhone,
    name: 'Test Sender',
    country: 'CR' as const,
    wallet_address: '0x1234...',
    kyc_status: 'verified' as const,
    created_at: new Date(),
    updated_at: new Date()
  }

  const mockReceiver = {
    id: 'receiver-123',
    phone: mockReceiverPhone,
    name: 'Test Receiver',
    country: 'NI' as const,
    wallet_address: '0x5678...',
    kyc_status: 'verified' as const,
    created_at: new Date(),
    updated_at: new Date()
  }

  let transactionStateHistory: any[] = []

  beforeEach(() => {
    jest.clearAllMocks()
    transactionStateHistory = []
    
    // Setup user mocks
    mockAuthService.getUserByPhone.mockImplementation((phone) => {
      if (phone === mockSenderPhone) return Promise.resolve(mockSender)
      if (phone === mockReceiverPhone) return Promise.resolve(mockReceiver)
      return Promise.resolve(null)
    })

    // Setup notification mock
    mockNotificationService.sendTransactionNotification.mockResolvedValue(undefined)

    // Setup wallet service mock
    mockWalletService.transferBetweenWallets.mockResolvedValue({
      blockchain_tx_hash: '0xabc123def456...',
      estimated_confirmation_time: 300
    })

    // Setup Supabase mocks with state tracking
    setupSupabaseMocks()
  })

  const setupSupabaseMocks = () => {
    // Mock transaction creation
    mockSupabase.from = jest.fn().mockImplementation((table) => {
      if (table === 'transactions') {
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: mockTransactionId,
                  sender_phone: mockSenderPhone,
                  receiver_phone: mockReceiverPhone,
                  amount_usd: 100,
                  amount_local: 3680, // NI rate
                  exchange_rate: 36.80,
                  fees: JSON.stringify({
                    platform_fee: 2.5,
                    onramp_fee: 3.0,
                    offramp_fee: 1.5
                  }),
                  status: TransactionStatus.INITIATED,
                  metadata: JSON.stringify({
                    onramp_provider: 'stripe',
                    offramp_provider: 'sinpe',
                    user_agent: 'whatsapp-bot'
                  }),
                  created_at: new Date().toISOString(),
                  completed_at: null,
                  onramp_reference: null,
                  offramp_reference: null,
                  blockchain_tx_hash: null
                },
                error: null
              })
            })
          }),
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockImplementation((field, value) => {
              if (field === 'id' && value === mockTransactionId) {
                const currentState = transactionStateHistory[transactionStateHistory.length - 1] || {
                  id: mockTransactionId,
                  status: TransactionStatus.INITIATED,
                  metadata: '{}',
                  fees: JSON.stringify({ platform_fee: 2.5, onramp_fee: 3.0, offramp_fee: 1.5 })
                }
                return {
                  single: jest.fn().mockResolvedValue({
                    data: currentState,
                    error: null
                  })
                }
              }
              if (field === 'sender_phone') {
                return {
                  gte: jest.fn().mockResolvedValue({
                    data: [], // No recent transactions
                    error: null
                  })
                }
              }
              return {
                single: jest.fn().mockResolvedValue({ data: null, error: null })
              }
            }),
            or: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [transactionStateHistory[transactionStateHistory.length - 1]].filter(Boolean),
                  error: null
                })
              })
            })
          }),
          update: jest.fn().mockImplementation((updateData) => {
            return {
              eq: jest.fn().mockImplementation((field, value) => {
                if (field === 'id' && value === mockTransactionId) {
                  const currentState = transactionStateHistory[transactionStateHistory.length - 1] || {
                    id: mockTransactionId,
                    sender_phone: mockSenderPhone,
                    receiver_phone: mockReceiverPhone,
                    amount_usd: 100,
                    amount_local: 3680,
                    exchange_rate: 36.80,
                    fees: JSON.stringify({ platform_fee: 2.5, onramp_fee: 3.0, offramp_fee: 1.5 }),
                    status: TransactionStatus.INITIATED,
                    metadata: JSON.stringify({
                      onramp_provider: 'stripe',
                      offramp_provider: 'sinpe',
                      user_agent: 'whatsapp-bot'
                    }),
                    created_at: new Date().toISOString(),
                    completed_at: null
                  }
                  
                  const newState = {
                    ...currentState,
                    ...updateData,
                    metadata: JSON.stringify({
                      ...JSON.parse(currentState.metadata || '{}'),
                      ...(updateData.metadata || {})
                    })
                  }
                  
                  transactionStateHistory.push(newState)
                  
                  return {
                    select: jest.fn().mockReturnValue({
                      single: jest.fn().mockResolvedValue({
                        data: newState,
                        error: null
                      })
                    })
                  }
                }
                return {
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: null, error: null })
                  })
                }
              })
            }
          })
        }
      }
      return {}
    })
  }

  describe('Complete Transaction Flow', () => {
    it('should orchestrate a successful transaction from start to completion', async () => {
      // Step 1: Create transaction
      const createResult = await TransactionService.createTransaction(mockSenderPhone, {
        receiver_phone: mockReceiverPhone,
        amount_usd: 100,
        onramp_provider: 'stripe'
      })

      expect(createResult.transaction.status).toBe(TransactionStatus.INITIATED)
      expect(createResult.payment_url).toContain('stripe.com')
      expect(transactionStateHistory).toHaveLength(0) // No updates yet

      // Step 2: Simulate on-ramp payment processing (automatically triggered)
      // Wait a bit to simulate async processing
      await new Promise(resolve => setTimeout(resolve, 100))

      // Manually trigger the orchestration to test the flow
      await TransactionService.processTransactionAsync(mockTransactionId)

      // Verify the complete state progression
      expect(transactionStateHistory.length).toBeGreaterThan(0)

      // Check that we went through all required states
      const statusProgression = transactionStateHistory.map(state => state.status)
      expect(statusProgression).toEqual([
        TransactionStatus.PAYMENT_PENDING,
        TransactionStatus.PAYMENT_CONFIRMED,
        TransactionStatus.BLOCKCHAIN_PENDING,
        TransactionStatus.BLOCKCHAIN_CONFIRMED,
        TransactionStatus.WITHDRAWAL_PENDING,
        TransactionStatus.COMPLETED,
        TransactionStatus.COMPLETED // Final update
      ])

      // Verify final state
      const finalState = transactionStateHistory[transactionStateHistory.length - 1]
      expect(finalState.status).toBe(TransactionStatus.COMPLETED)
      expect(finalState.completed_at).toBeTruthy()

      // Verify blockchain transfer was called
      expect(mockWalletService.transferBetweenWallets).toHaveBeenCalledWith({
        from_phone: mockSenderPhone,
        to_phone: mockReceiverPhone,
        amount_usd: 100,
        transaction_id: mockTransactionId
      })

      // Verify notifications were sent
      expect(mockNotificationService.sendTransactionNotification).toHaveBeenCalledTimes(8) // Initial + 6 status updates + final
    })

    it('should handle blockchain transfer failure and mark transaction as failed', async () => {
      // Setup wallet service to fail
      mockWalletService.transferBetweenWallets.mockRejectedValue(
        new Error('BLOCKCHAIN_TIMEOUT')
      )

      // Create transaction
      const createResult = await TransactionService.createTransaction(mockSenderPhone, {
        receiver_phone: mockReceiverPhone,
        amount_usd: 100,
        onramp_provider: 'stripe'
      })

      // Trigger orchestration
      await TransactionService.processTransactionAsync(mockTransactionId)

      // Verify failure handling
      const statusProgression = transactionStateHistory.map(state => state.status)
      expect(statusProgression).toContain(TransactionStatus.PAYMENT_PENDING)
      expect(statusProgression).toContain(TransactionStatus.PAYMENT_CONFIRMED)
      expect(statusProgression).toContain(TransactionStatus.BLOCKCHAIN_PENDING)
      
      // Should end in FAILED state due to blockchain error
      const finalState = transactionStateHistory[transactionStateHistory.length - 1]
      expect(finalState.status).toBe(TransactionStatus.FAILED)
      
      const finalMetadata = JSON.parse(finalState.metadata || '{}')
      expect(finalMetadata.error_message).toContain('BLOCKCHAIN_TIMEOUT')
    })

    it('should handle onramp payment failure', async () => {
      // Create a custom TransactionService method to simulate onramp failure
      const originalProcessOnRamp = (TransactionService as any).processOnRampPayment
      ;(TransactionService as any).processOnRampPayment = jest.fn().mockImplementation(async () => {
        await TransactionService.updateTransactionStatus(mockTransactionId, TransactionStatus.PAYMENT_PENDING)
        throw new Error('ONRAMP_SERVICE_UNAVAILABLE')
      })

      // Create transaction
      await TransactionService.createTransaction(mockSenderPhone, {
        receiver_phone: mockReceiverPhone,
        amount_usd: 100,
        onramp_provider: 'stripe'
      })

      // Trigger orchestration
      await TransactionService.processTransactionAsync(mockTransactionId)

      // Verify failure at onramp stage
      const statusProgression = transactionStateHistory.map(state => state.status)
      expect(statusProgression).toContain(TransactionStatus.PAYMENT_PENDING)
      expect(statusProgression[statusProgression.length - 1]).toBe(TransactionStatus.FAILED)

      // Restore original method
      ;(TransactionService as any).processOnRampPayment = originalProcessOnRamp
    })
  })

  describe('State Machine Validation in Orchestration', () => {
    it('should prevent invalid state transitions during orchestration', async () => {
      // Try to update from INITIATED directly to COMPLETED (invalid)
      await expect(
        TransactionService.updateTransactionStatus(
          mockTransactionId,
          TransactionStatus.COMPLETED
        )
      ).rejects.toThrow('INVALID_STATE_TRANSITION')

      // Verify no state was recorded
      expect(transactionStateHistory).toHaveLength(0)
    })

    it('should allow retry from FAILED state', async () => {
      // Create transaction in failed state
      transactionStateHistory.push({
        id: mockTransactionId,
        status: TransactionStatus.FAILED,
        metadata: JSON.stringify({ error_message: 'Test failure' }),
        fees: JSON.stringify({ platform_fee: 2.5, onramp_fee: 3.0, offramp_fee: 1.5 })
      })

      // Retry should reset to INITIATED
      const retriedTransaction = await TransactionService.retryTransaction(
        mockTransactionId,
        mockSenderPhone
      )

      expect(retriedTransaction.status).toBe(TransactionStatus.INITIATED)
      
      const finalState = transactionStateHistory[transactionStateHistory.length - 1]
      expect(finalState.status).toBe(TransactionStatus.INITIATED)
      
      const metadata = JSON.parse(finalState.metadata || '{}')
      expect(metadata.retry_count).toBe(1)
    })
  })

  describe('Error Recovery and Rollback', () => {
    it('should handle partial transaction failures gracefully', async () => {
      // Setup to fail at blockchain stage
      let callCount = 0
      mockWalletService.transferBetweenWallets.mockImplementation(async () => {
        callCount++
        if (callCount === 1) {
          throw new Error('BLOCKCHAIN_TIMEOUT')
        }
        // Succeed on retry
        return {
          blockchain_tx_hash: '0xretry123...',
          estimated_confirmation_time: 300
        }
      })

      // Create and process transaction
      await TransactionService.createTransaction(mockSenderPhone, {
        receiver_phone: mockReceiverPhone,
        amount_usd: 100,
        onramp_provider: 'stripe'
      })

      await TransactionService.processTransactionAsync(mockTransactionId)

      // Should fail first time
      let finalState = transactionStateHistory[transactionStateHistory.length - 1]
      expect(finalState.status).toBe(TransactionStatus.FAILED)

      // Now retry the transaction
      const retriedTransaction = await TransactionService.retryTransaction(
        mockTransactionId,
        mockSenderPhone
      )

      expect(retriedTransaction.status).toBe(TransactionStatus.INITIATED)

      // Process retry
      await TransactionService.processTransactionAsync(mockTransactionId)

      // Should succeed this time
      finalState = transactionStateHistory[transactionStateHistory.length - 1]
      expect(finalState.status).toBe(TransactionStatus.COMPLETED)
      expect(mockWalletService.transferBetweenWallets).toHaveBeenCalledTimes(2)
    })
  })

  describe('Notification Integration', () => {
    it('should send notifications at each major state change', async () => {
      await TransactionService.createTransaction(mockSenderPhone, {
        receiver_phone: mockReceiverPhone,
        amount_usd: 100,
        onramp_provider: 'stripe'
      })

      await TransactionService.processTransactionAsync(mockTransactionId)

      // Verify notification calls
      const notificationCalls = mockNotificationService.sendTransactionNotification.mock.calls
      
      // Should have initial notification + status updates
      expect(notificationCalls.length).toBeGreaterThan(5)
      
      // Check that different notification types were sent
      const notificationTypes = notificationCalls.map(call => call[1])
      expect(notificationTypes).toContain('TRANSACTION_INITIATED')
      expect(notificationTypes).toContain('STATUS_UPDATE')
      
      // Verify sender phone is consistent
      const senderPhones = notificationCalls.map(call => call[0])
      senderPhones.forEach(phone => {
        expect(phone).toBe(mockSenderPhone)
      })
    })

    it('should continue transaction processing even if notifications fail', async () => {
      // Make notifications fail
      mockNotificationService.sendTransactionNotification.mockRejectedValue(
        new Error('Notification service down')
      )

      await TransactionService.createTransaction(mockSenderPhone, {
        receiver_phone: mockReceiverPhone,
        amount_usd: 100,
        onramp_provider: 'stripe'
      })

      await TransactionService.processTransactionAsync(mockTransactionId)

      // Transaction should still complete despite notification failures
      const finalState = transactionStateHistory[transactionStateHistory.length - 1]
      expect(finalState.status).toBe(TransactionStatus.COMPLETED)
    })
  })

  describe('Performance and Timing', () => {
    it('should provide reasonable completion time estimates', async () => {
      const transaction = await TransactionService.createTransaction(mockSenderPhone, {
        receiver_phone: mockReceiverPhone,
        amount_usd: 100,
        onramp_provider: 'stripe'
      })

      const statusResponse = await TransactionService.getTransactionStatus(
        mockTransactionId,
        mockSenderPhone
      )

      // Estimate should be in the future
      expect(statusResponse.estimated_completion.getTime()).toBeGreaterThan(Date.now())
      
      // Should be reasonable (within 30 minutes for INITIATED state)
      const thirtyMinutesFromNow = Date.now() + (30 * 60 * 1000)
      expect(statusResponse.estimated_completion.getTime()).toBeLessThan(thirtyMinutesFromNow)
    })
  })
})