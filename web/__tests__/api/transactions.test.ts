import { NextRequest } from 'next/server'
import { POST as sendTransaction } from '../../app/api/transactions/send/route'
import { GET as getStatus } from '../../app/api/transactions/[id]/status/route'
import { POST as retryTransaction } from '../../app/api/transactions/[id]/retry/route'
import { TransactionService } from '../../lib/services/transaction'
import { AuthService } from '../../lib/services/auth'
import { TransactionStatus } from '../../lib/types'

// Mock services
jest.mock('../../lib/services/transaction')
jest.mock('../../lib/services/auth')

const mockTransactionService = TransactionService as jest.Mocked<typeof TransactionService>
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>

describe('/api/transactions API Routes', () => {
  const mockUserPhone = '+50688881111'
  const mockToken = 'valid-jwt-token'
  const mockTransactionId = 'test-transaction-123'

  const mockTransaction = {
    id: mockTransactionId,
    sender_phone: mockUserPhone,
    receiver_phone: '+50588882222',
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
    mockAuthService.validateToken.mockResolvedValue({
      phone: mockUserPhone,
      userId: 'user-123'
    })
    mockAuthService.checkRateLimit.mockReturnValue(true)
  })

  describe('POST /api/transactions/send', () => {
    const validRequestBody = {
      receiver_phone: '+50588882222',
      amount_usd: 100,
      onramp_provider: 'stripe'
    }

    const createMockRequest = (body: any, authHeader?: string) => {
      const headers = new Headers()
      if (authHeader) {
        headers.set('authorization', authHeader)
      }
      
      return new NextRequest('http://localhost/api/transactions/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })
    }

    it('should create transaction successfully with valid request', async () => {
      mockTransactionService.createTransaction.mockResolvedValue({
        transaction: mockTransaction,
        payment_url: 'https://mock-payment.stripe.com/pay/123'
      })

      const request = createMockRequest(validRequestBody, `Bearer ${mockToken}`)
      const response = await sendTransaction(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.transaction.id).toBe(mockTransactionId)
      expect(data.data.payment_url).toContain('stripe.com')
    })

    it('should require authentication', async () => {
      const request = createMockRequest(validRequestBody) // No auth header
      const response = await sendTransaction(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('MISSING_AUTH_HEADER')
    })

    it('should validate JWT token', async () => {
      mockAuthService.validateToken.mockRejectedValue(new Error('INVALID_TOKEN'))

      const request = createMockRequest(validRequestBody, 'Bearer invalid-token')
      const response = await sendTransaction(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_TOKEN')
    })

    it('should enforce rate limiting', async () => {
      mockAuthService.checkRateLimit.mockReturnValue(false)

      const request = createMockRequest(validRequestBody, `Bearer ${mockToken}`)
      const response = await sendTransaction(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('should validate required fields', async () => {
      const invalidBody = { amount_usd: 100 } // missing receiver_phone and onramp_provider

      const request = createMockRequest(invalidBody, `Bearer ${mockToken}`)
      const response = await sendTransaction(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_REQUEST')
      expect(data.error.message).toContain('Missing required fields')
    })

    it('should validate amount range', async () => {
      const invalidBody = { ...validRequestBody, amount_usd: 15000 } // exceeds max

      const request = createMockRequest(invalidBody, `Bearer ${mockToken}`)
      const response = await sendTransaction(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_REQUEST')
      expect(data.error.message).toContain('Amount must be')
    })

    it('should validate phone number format', async () => {
      const invalidBody = { ...validRequestBody, receiver_phone: '+1234567890' }

      const request = createMockRequest(invalidBody, `Bearer ${mockToken}`)
      const response = await sendTransaction(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_PHONE')
    })

    it('should prevent self-transactions', async () => {
      const selfTransferBody = { ...validRequestBody, receiver_phone: mockUserPhone }

      const request = createMockRequest(selfTransferBody, `Bearer ${mockToken}`)
      const response = await sendTransaction(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Cannot send money to yourself')
    })

    it('should validate onramp provider', async () => {
      const invalidBody = { ...validRequestBody, onramp_provider: 'invalid-provider' }

      const request = createMockRequest(invalidBody, `Bearer ${mockToken}`)
      const response = await sendTransaction(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Invalid onramp provider')
    })

    it('should handle transaction service errors', async () => {
      mockTransactionService.createTransaction.mockRejectedValue(new Error('USER_NOT_FOUND'))

      const request = createMockRequest(validRequestBody, `Bearer ${mockToken}`)
      const response = await sendTransaction(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('USER_NOT_FOUND')
    })
  })

  describe('GET /api/transactions/[id]/status', () => {
    const createMockRequest = (authHeader?: string) => {
      const headers = new Headers()
      if (authHeader) {
        headers.set('authorization', authHeader)
      }
      
      return new NextRequest(`http://localhost/api/transactions/${mockTransactionId}/status`, {
        method: 'GET',
        headers
      })
    }

    it('should return transaction status successfully', async () => {
      mockTransactionService.getTransactionStatus.mockResolvedValue({
        transaction: mockTransaction,
        estimated_completion: new Date(Date.now() + 300000) // 5 minutes from now
      })

      const request = createMockRequest(`Bearer ${mockToken}`)
      const response = await getStatus(request, { 
        params: Promise.resolve({ id: mockTransactionId }) 
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.transaction.id).toBe(mockTransactionId)
      expect(data.data.estimated_completion).toBeDefined()
    })

    it('should set appropriate cache headers for pending transactions', async () => {
      mockTransactionService.getTransactionStatus.mockResolvedValue({
        transaction: mockTransaction,
        estimated_completion: new Date(Date.now() + 300000)
      })

      const request = createMockRequest(`Bearer ${mockToken}`)
      const response = await getStatus(request, { 
        params: Promise.resolve({ id: mockTransactionId }) 
      })

      const cacheControl = response.headers.get('Cache-Control')
      const pollInterval = response.headers.get('X-Poll-Interval')

      expect(cacheControl).toContain('no-cache')
      expect(pollInterval).toBe('10000') // 10 seconds
    })

    it('should set longer cache for completed transactions', async () => {
      const completedTransaction = { 
        ...mockTransaction, 
        status: TransactionStatus.COMPLETED,
        completed_at: new Date()
      }
      
      mockTransactionService.getTransactionStatus.mockResolvedValue({
        transaction: completedTransaction,
        estimated_completion: new Date()
      })

      const request = createMockRequest(`Bearer ${mockToken}`)
      const response = await getStatus(request, { 
        params: Promise.resolve({ id: mockTransactionId }) 
      })

      const cacheControl = response.headers.get('Cache-Control')
      expect(cacheControl).toContain('max-age=3600') // 1 hour
    })

    it('should require authentication', async () => {
      const request = createMockRequest()
      const response = await getStatus(request, { 
        params: Promise.resolve({ id: mockTransactionId }) 
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('MISSING_AUTH_HEADER')
    })

    it('should handle transaction not found', async () => {
      mockTransactionService.getTransactionStatus.mockRejectedValue(new Error('TRANSACTION_NOT_FOUND'))

      const request = createMockRequest(`Bearer ${mockToken}`)
      const response = await getStatus(request, { 
        params: Promise.resolve({ id: 'non-existent' }) 
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('TRANSACTION_NOT_FOUND')
    })
  })

  describe('POST /api/transactions/[id]/retry', () => {
    const createMockRequest = (body: any = {}, authHeader?: string) => {
      const headers = new Headers()
      if (authHeader) {
        headers.set('authorization', authHeader)
      }
      
      return new NextRequest(`http://localhost/api/transactions/${mockTransactionId}/retry`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })
    }

    it('should retry failed transaction successfully', async () => {
      const retriedTransaction = { 
        ...mockTransaction, 
        status: TransactionStatus.INITIATED,
        metadata: { 
          ...mockTransaction.metadata, 
          retry_count: 1 
        }
      }
      
      mockTransactionService.retryTransaction.mockResolvedValue(retriedTransaction)

      const request = createMockRequest({}, `Bearer ${mockToken}`)
      const response = await retryTransaction(request, { 
        params: Promise.resolve({ id: mockTransactionId }) 
      })
      const data = await response.json()

      expect(response.status).toBe(202) // Accepted
      expect(data.success).toBe(true)
      expect(data.data.status).toBe(TransactionStatus.INITIATED)
    })

    it('should set Location header for status polling', async () => {
      mockTransactionService.retryTransaction.mockResolvedValue(mockTransaction)

      const request = createMockRequest({}, `Bearer ${mockToken}`)
      const response = await retryTransaction(request, { 
        params: Promise.resolve({ id: mockTransactionId }) 
      })

      const location = response.headers.get('Location')
      expect(location).toContain(`/api/transactions/${mockTransactionId}/status`)
    })

    it('should require authentication', async () => {
      const request = createMockRequest()
      const response = await retryTransaction(request, { 
        params: Promise.resolve({ id: mockTransactionId }) 
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('MISSING_AUTH_HEADER')
    })

    it('should handle non-retryable transaction', async () => {
      mockTransactionService.retryTransaction.mockRejectedValue(new Error('TRANSACTION_NOT_RETRYABLE'))

      const request = createMockRequest({}, `Bearer ${mockToken}`)
      const response = await retryTransaction(request, { 
        params: Promise.resolve({ id: mockTransactionId }) 
      })
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error.code).toBe('TRANSACTION_NOT_RETRYABLE')
      expect(data.error.message).toContain('Only failed transactions can be retried')
    })

    it('should enforce rate limiting', async () => {
      mockAuthService.checkRateLimit.mockImplementation((key: string) => {
        // Allow regular rate limit but deny retry rate limit
        return !key.startsWith('retry_')
      })

      const request = createMockRequest({}, `Bearer ${mockToken}`)
      const response = await retryTransaction(request, { 
        params: Promise.resolve({ id: mockTransactionId }) 
      })
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost/api/transactions/send', {
        method: 'POST',
        headers: { 'authorization': `Bearer ${mockToken}` },
        body: 'invalid-json{'
      })

      const response = await sendTransaction(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('should handle missing transaction ID parameter', async () => {
      const request = new NextRequest('http://localhost/api/transactions//status', {
        method: 'GET',
        headers: { 'authorization': `Bearer ${mockToken}` }
      })

      const response = await getStatus(request, { 
        params: Promise.resolve({ id: '' }) 
      })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.message).toContain('Transaction ID is required')
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete transaction flow via API', async () => {
      // 1. Create transaction
      mockTransactionService.createTransaction.mockResolvedValue({
        transaction: mockTransaction,
        payment_url: 'https://mock-payment.stripe.com/pay/123'
      })

      const sendRequest = new NextRequest('http://localhost/api/transactions/send', {
        method: 'POST',
        headers: { 'authorization': `Bearer ${mockToken}` },
        body: JSON.stringify({
          receiver_phone: '+50588882222',
          amount_usd: 100,
          onramp_provider: 'stripe'
        })
      })

      const sendResponse = await sendTransaction(sendRequest)
      expect(sendResponse.status).toBe(201)

      // 2. Check initial status
      mockTransactionService.getTransactionStatus.mockResolvedValue({
        transaction: mockTransaction,
        estimated_completion: new Date(Date.now() + 300000)
      })

      const statusRequest = new NextRequest(`http://localhost/api/transactions/${mockTransactionId}/status`, {
        method: 'GET',
        headers: { 'authorization': `Bearer ${mockToken}` }
      })

      const statusResponse = await getStatus(statusRequest, { 
        params: Promise.resolve({ id: mockTransactionId }) 
      })
      expect(statusResponse.status).toBe(200)

      // 3. Simulate failure and retry
      const failedTransaction = { ...mockTransaction, status: TransactionStatus.FAILED }
      mockTransactionService.getTransactionStatus.mockResolvedValue({
        transaction: failedTransaction,
        estimated_completion: new Date()
      })

      mockTransactionService.retryTransaction.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.INITIATED
      })

      const retryRequest = new NextRequest(`http://localhost/api/transactions/${mockTransactionId}/retry`, {
        method: 'POST',
        headers: { 'authorization': `Bearer ${mockToken}` },
        body: JSON.stringify({})
      })

      const retryResponse = await retryTransaction(retryRequest, { 
        params: Promise.resolve({ id: mockTransactionId }) 
      })
      expect(retryResponse.status).toBe(202)
    })
  })
})