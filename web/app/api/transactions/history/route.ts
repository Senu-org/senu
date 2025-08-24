import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth'
import { TransactionService } from '@/lib/services/transaction'
import { ApiResponse, ErrorCodes } from '@/lib/types'

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
      filteredTransactions = filteredTransactions.filter((tx) => tx.status === status)
    }
    
    if (startDate) {
      const start = new Date(startDate)
      filteredTransactions = filteredTransactions.filter((tx) => new Date(tx.timestamp) >= start)
    }
    
    if (endDate) {
      const end = new Date(endDate)
      filteredTransactions = filteredTransactions.filter((tx) => new Date(tx.timestamp) <= end)
    }

    // Add summary statistics
    const summary = {
      total_transactions: filteredTransactions.length,
      total_sent: filteredTransactions
        .filter((tx) => tx.sender === userPhone)
        .reduce((sum: number, tx) => sum + tx.amount, 0),
      total_received: filteredTransactions
        .filter((tx) => tx.receiver === userPhone)
        .reduce((sum: number, tx) => sum + tx.amount, 0),
      completed_count: filteredTransactions.filter((tx) => tx.status === 'completed').length,
      pending_count: filteredTransactions.filter((tx) => 
        !['completed', 'failed'].includes(tx.status)
      ).length,
      failed_count: filteredTransactions.filter((tx) => tx.status === 'failed').length
    }

    // Set cache headers
    const headers = new Headers()
    headers.set('Cache-Control', 'private, max-age=30') // 30 seconds cache

    return NextResponse.json<ApiResponse<{ 
      transactions: Array<{
        transactionId: string;
        sender: string;
        receiver: string;
        amount: number;
        status: string;
        timestamp: string;
      }>, 
      summary: typeof summary 
    }>>({
      success: true,
      data: {
        transactions: filteredTransactions,
        summary
      }
    }, { 
      status: 200,
      headers
    })

  } catch (error: unknown) {
    console.error('GET /api/transactions/history error:', error)

    // Map known errors to appropriate HTTP status codes
    const errorMappings: Record<string, { status: number; message: string }> = {
      'USER_NOT_FOUND': { status: 404, message: 'User not found' },
      'INVALID_REQUEST': { status: 400, message: 'Invalid request parameters' }
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