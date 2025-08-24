import { NextRequest, NextResponse } from 'next/server'
import { TransactionService } from '../../../../../lib/services/transaction'
import { AuthService } from '../../../../../lib/services/auth'
import type { ErrorCodes, ApiResponse } from '../../../../../lib/types'

/**
 * POST /api/transactions/[id]/retry - Retry a failed transaction
 * Requirements: 10.2, 10.3
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const transactionId = id

    if (!transactionId) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_REQUEST' as ErrorCodes,
          message: 'Transaction ID is required',
          timestamp: new Date()
        }
      }, { status: 400 })
    }

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
    } catch (authError: unknown) {
      const errorCode = authError instanceof Error ? authError.message as ErrorCodes : 'AUTH_ERROR' as ErrorCodes;
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: errorCode,
          message: 'Invalid or expired token',
          timestamp: new Date()
        }
      }, { status: 401 })
    }

    // Rate limiting check for retry requests (stricter than status checks)
    if (!AuthService.checkRateLimit(`retry_${userPhone}`)) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED' as ErrorCodes,
          message: 'Too many retry requests. Please wait before trying again.',
          timestamp: new Date()
        }
      }, { status: 429 })
    }

    // Optional: Parse retry options from request body
    try {
      await request.json()
      // retryOptions = body || {} // Removed unused variable
    } catch {
      // Ignore JSON parsing errors, use empty options
    }

    // Retry the transaction
    const retriedTransaction = await TransactionService.retryTransaction(transactionId)

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Location', `/api/transactions/${transactionId}/status`)
    
    return NextResponse.json<ApiResponse<{
      originalTransactionId: string;
      status: string;
      timestamp: string;
      gasPriceIncrease: string;
      message: string;
    }>>({
      success: true,
      data: retriedTransaction
    }, { 
      status: 202, // Accepted - transaction is being processed
      headers
    })

  } catch (error: unknown) {
    console.error(`POST /api/transactions/${params}/retry error:`, error)

    // Map known errors to appropriate HTTP status codes
    const errorMappings: Record<string, { status: number; message: string }> = {
      'TRANSACTION_NOT_FOUND': { status: 404, message: 'Transaction not found' },
      'TRANSACTION_NOT_RETRYABLE': { status: 409, message: 'Transaction is not in a retryable state. Only failed transactions can be retried.' },
      'USER_NOT_FOUND': { status: 404, message: 'User not found' },
      'UNAUTHORIZED': { status: 403, message: 'Not authorized to retry this transaction' },
      'TRANSACTION_LIMIT_EXCEEDED': { status: 403, message: 'Daily transaction limit exceeded' },
      'MAX_RETRY_ATTEMPTS_EXCEEDED': { status: 409, message: 'Maximum retry attempts exceeded for this transaction' },
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
        timestamp: new Date(),
        details: error instanceof Error && 'details' in error ? (error as { details: Record<string, string | number | boolean | object> }).details : undefined
      }
    }, { status: mapping.status })
  }
}