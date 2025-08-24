import { NextRequest, NextResponse } from 'next/server'
import { TransactionService } from '../../../../lib/services/transaction'
import { AuthService } from '../../../../lib/services/auth'
import type { SendTransactionRequest, ErrorCodes, ApiResponse, SendTransactionResponse } from '../../../../lib/types'

/**
 * POST /api/transactions/send - Create and initiate a new transaction
 * Requirements: 2.1, 2.4, 10.2, 10.3
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'MISSING_AUTH_HEADER' as ErrorCodes,
          message: 'Authentication required',
          timestamp: new Date()
        }
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let userPhone: string
    
    try {
      const decoded = await AuthService.validateToken(token)
      userPhone = decoded.phone
    } catch (authError: any) {
      const errorCode = authError.message as ErrorCodes
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: errorCode,
          message: 'Invalid or expired token',
          timestamp: new Date()
        }
      }, { status: 401 })
    }

    // Rate limiting check
    if (!AuthService.checkRateLimit(userPhone)) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED' as ErrorCodes,
          message: 'Too many requests. Please try again later.',
          timestamp: new Date()
        }
      }, { status: 429 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { receiver_phone, amount_usd, onramp_provider } = body as SendTransactionRequest

    // Validate required fields
    if (!receiver_phone || !amount_usd || !onramp_provider) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_REQUEST' as ErrorCodes,
          message: 'Missing required fields: receiver_phone, amount_usd, onramp_provider',
          timestamp: new Date()
        }
      }, { status: 400 })
    }

    // Validate amount format and limits
    if (typeof amount_usd !== 'number' || amount_usd <= 0 || amount_usd > 10000) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_REQUEST' as ErrorCodes,
          message: 'Amount must be a positive number between $1 and $10,000',
          timestamp: new Date()
        }
      }, { status: 400 })
    }

    // Validate receiver phone format
    const phoneRegex = /^\+50[56]\d{8}$/
    if (!phoneRegex.test(receiver_phone)) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_PHONE' as ErrorCodes,
          message: 'Invalid receiver phone number format. Must be +506XXXXXXXX or +505XXXXXXXX',
          timestamp: new Date()
        }
      }, { status: 400 })
    }

    // Check if sender and receiver are the same
    if (userPhone === receiver_phone) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_REQUEST' as ErrorCodes,
          message: 'Cannot send money to yourself',
          timestamp: new Date()
        }
      }, { status: 400 })
    }

    // Validate onramp provider
    const allowedProviders = ['stripe', 'paypal', 'local-bank', 'sinpe']
    if (!allowedProviders.includes(onramp_provider)) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_REQUEST' as ErrorCodes,
          message: `Invalid onramp provider. Allowed: ${allowedProviders.join(', ')}`,
          timestamp: new Date()
        }
      }, { status: 400 })
    }

    // Create transaction using TransactionService
    const transactionRequest: SendTransactionRequest = {
      receiver_phone,
      amount_usd,
      onramp_provider
    }

    const result = await TransactionService.createTransaction(userPhone, transactionRequest)

    return NextResponse.json<ApiResponse<SendTransactionResponse>>({
      success: true,
      data: result
    }, { status: 201 })

  } catch (error: any) {
    console.error('POST /api/transactions/send error:', error)

    // Map known errors to appropriate HTTP status codes
    const errorMappings: Record<string, { status: number; message: string }> = {
      'USER_NOT_FOUND': { status: 404, message: 'User not found' },
      'INVALID_PHONE': { status: 400, message: 'Invalid phone number format' },
      'INVALID_REQUEST': { status: 400, message: 'Invalid request parameters' },
      'TRANSACTION_LIMIT_EXCEEDED': { status: 403, message: 'Daily transaction limit exceeded' },
      'INSUFFICIENT_BALANCE': { status: 402, message: 'Insufficient balance' },
      'ONRAMP_SERVICE_UNAVAILABLE': { status: 503, message: 'Payment service temporarily unavailable' }
    }

    const mapping = errorMappings[error.message] || { status: 500, message: 'Internal server error' }
    const errorCode = error.message as ErrorCodes || 'INTERNAL_SERVER_ERROR'

    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: {
        code: errorCode,
        message: mapping.message,
        timestamp: new Date()
      }
    }, { status: mapping.status })
  }
}