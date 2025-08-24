import { NextRequest, NextResponse } from 'next/server'
import { TransactionService } from '../../../../lib/services/transaction'
import { AuthService } from '../../../../lib/services/auth'
import type { ErrorCodes, ApiResponse, Transaction } from '../../../../lib/types'

/**
 * GET /api/transactions/history - Get transaction history for authenticated user
 * Requirements: 2.4, 10.2
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100) // Max 100
    const status = url.searchParams.get('status')
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')

    // Basic rate limiting
    if (!AuthService.checkRateLimit(`history_${userPhone}`)) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED' as ErrorCodes,
          message: 'Too many requests. Please wait before trying again.',
          timestamp: new Date()
        }
      }, { status: 429 })
    }

    // Get user transactions
    const transactions = await TransactionService.getUserTransactions(userPhone, limit)

    // Apply filters if provided
    let filteredTransactions = transactions
    
    if (status) {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === status)
    }
    
    if (startDate) {
      const start = new Date(startDate)
      filteredTransactions = filteredTransactions.filter(tx => tx.created_at >= start)
    }
    
    if (endDate) {
      const end = new Date(endDate)
      filteredTransactions = filteredTransactions.filter(tx => tx.created_at <= end)
    }

    // Add summary statistics
    const summary = {
      total_transactions: filteredTransactions.length,
      total_sent: filteredTransactions
        .filter(tx => tx.sender_phone === userPhone)
        .reduce((sum, tx) => sum + tx.amount_usd, 0),
      total_received: filteredTransactions
        .filter(tx => tx.receiver_phone === userPhone)
        .reduce((sum, tx) => sum + tx.amount_usd, 0),
      completed_count: filteredTransactions.filter(tx => tx.status === 'completed').length,
      pending_count: filteredTransactions.filter(tx => 
        !['completed', 'failed'].includes(tx.status)
      ).length,
      failed_count: filteredTransactions.filter(tx => tx.status === 'failed').length
    }

    // Set cache headers
    const headers = new Headers()
    headers.set('Cache-Control', 'private, max-age=30') // 30 seconds cache

    return NextResponse.json<ApiResponse<{ transactions: Transaction[], summary: typeof summary }>>({
      success: true,
      data: {
        transactions: filteredTransactions,
        summary
      }
    }, { 
      status: 200,
      headers
    })

  } catch (error: any) {
    console.error('GET /api/transactions/history error:', error)

    // Map known errors to appropriate HTTP status codes
    const errorMappings: Record<string, { status: number; message: string }> = {
      'USER_NOT_FOUND': { status: 404, message: 'User not found' },
      'INVALID_REQUEST': { status: 400, message: 'Invalid request parameters' }
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