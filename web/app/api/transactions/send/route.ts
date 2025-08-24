import { NextRequest, NextResponse } from 'next/server'
import { TransactionService } from '../../../../lib/services/transaction'
import SupabaseRepository from '../../../../lib/repository/SupabaseRepository'
import type { SendTransactionRequest, ErrorCodes, ApiResponse } from '../../../../lib/types'

/**
 * POST /api/transactions/send - Create and initiate a new transaction
 * Requirements: 2.1, 2.4, 10.2, 10.3
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { receiver_phone, amount_usd, onramp_provider, sender_phone } = body as SendTransactionRequest & { sender_phone?: string }

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

    // Use sender_phone from request body or default to receiver_phone for demo
    const userPhone = sender_phone || receiver_phone;

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
    const allowedProviders = ['stripe', 'paypal', 'local-bank', 'sinpe', 'crypto']
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const transactionRequest: SendTransactionRequest = {
      receiver_phone,
      amount_usd,
      onramp_provider
    }

    // Create repository and service instances
    const walletRepository = new SupabaseRepository()
    const transactionService = new TransactionService(walletRepository)
    
    // Extract phone number without + prefix for the service
    const senderPhoneNumber = parseInt(userPhone.replace('+', ''))
    const receiverPhoneNumber = parseInt(receiver_phone.replace('+', ''))
    
    const result = await transactionService.createTransaction(senderPhoneNumber, receiverPhoneNumber, amount_usd.toString())

    return NextResponse.json<ApiResponse<{
      transactionId: string;
      sender: string;
      receiver: string;
      amount: number;
      status: string;
      timestamp: string;
      blockNumber?: number | bigint;
      gasUsed?: string;
      effectiveGasPrice?: string;
    }>>({
      success: true,
      data: {
        ...result,
        amount: parseFloat(result.amount)
      }
    }, { status: 201 })

  } catch (error: unknown) {
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

    const errorMessage = error instanceof Error ? error.message : 'INTERNAL_SERVER_ERROR';
    const mapping = errorMappings[errorMessage] || { status: 500, message: 'Internal server error' }
    const errorCode = errorMessage as ErrorCodes || 'INTERNAL_SERVER_ERROR'

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