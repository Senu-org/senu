import { NextRequest, NextResponse } from 'next/server'
import { TransactionService } from '../../../../../lib/services/transaction'
import { AuthService } from '../../../../../lib/services/auth'
import type { ErrorCodes, ApiResponse, TransactionStatusResponse } from '../../../../../lib/types'

/**
 * GET /api/transactions/[id]/status - Get transaction status with polling support
 * Requirements: 2.4, 10.2
 */
export async function GET(
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

    // Check rate limiting for status requests (more lenient than transaction creation)
    if (!AuthService.checkRateLimit(`status_${userPhone}`)) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED' as ErrorCodes,
          message: 'Too many status requests. Please wait before trying again.',
          timestamp: new Date()
        }
      }, { status: 429 })
    }

    // Get transaction status
    const transactionStatus = await TransactionService.getTransactionStatus(transactionId, userPhone)

    // Add cache headers for different statuses
    const headers = new Headers()
    
    // For completed or failed transactions, allow longer caching
    if (['completed', 'failed'].includes(transactionStatus.transaction.status)) {
      headers.set('Cache-Control', 'public, max-age=3600') // 1 hour
    } else {
      // For pending transactions, minimal caching to enable polling
      headers.set('Cache-Control', 'no-cache, max-age=5') // 5 seconds
    }

    // Add polling recommendations in headers
    if (!['completed', 'failed'].includes(transactionStatus.transaction.status)) {
      headers.set('X-Poll-Interval', '10000') // Suggest 10 second polling interval
      headers.set('X-Retry-After', '10')
    }

    return NextResponse.json<ApiResponse<TransactionStatusResponse>>({
      success: true,
      data: transactionStatus
    }, { 
      status: 200,
      headers
    })

  } catch (error: any) {
    console.error(`GET /api/transactions/${params}/status error:`, error)

    // Map known errors to appropriate HTTP status codes
    const errorMappings: Record<string, { status: number; message: string }> = {
      'TRANSACTION_NOT_FOUND': { status: 404, message: 'Transaction not found' },
      'USER_NOT_FOUND': { status: 404, message: 'User not found' },
      'UNAUTHORIZED': { status: 403, message: 'Not authorized to view this transaction' }
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