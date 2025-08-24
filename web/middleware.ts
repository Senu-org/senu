import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { config as envConfig } from './lib/config/env'
import type { JWTPayload } from './lib/types'

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Paths that require authentication
const PROTECTED_PATHS = [
  '/api/transactions',
  '/api/wallets',
  '/api/notifications'
]

// Paths that are completely public (no rate limiting)
const PUBLIC_PATHS = [
  '/api/health',
  '/api/bot/webhook',
  '/',
  '/manifest.json',
  '/_next',
  '/favicon.ico'
]

// Paths that require rate limiting but no authentication
const RATE_LIMITED_PATHS = [
  '/api/auth'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public paths and static assets
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Get client IP for rate limiting
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  try {
    // Apply rate limiting for auth endpoints
    if (RATE_LIMITED_PATHS.some(path => pathname.startsWith(path))) {
      if (!checkRateLimit(clientIP)) {
        console.warn(`Rate limit exceeded for IP: ${clientIP}, Path: ${pathname}, User-Agent: ${userAgent}`)
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'RATE_LIMIT_EXCEEDED', 
              message: 'Too many requests. Please try again later.',
              timestamp: new Date() 
            } 
          },
          { status: 429 }
        )
      }
    }

    // Check if path requires authentication
    const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))
    
    if (isProtectedPath) {
      const authResult = await authenticateRequest(request)
      
      if (!authResult.success) {
        console.warn(`Authentication failed for IP: ${clientIP}, Path: ${pathname}, Error: ${authResult.error}`)
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: authResult.code || 'UNAUTHORIZED', 
              message: authResult.error || 'Authentication required',
              timestamp: new Date() 
            } 
          },
          { status: authResult.status || 401 }
        )
      }

      // Add user context to request headers for downstream handlers
      const response = NextResponse.next()
      response.headers.set('x-user-phone', authResult.payload!.phone)
      response.headers.set('x-user-id', authResult.payload!.userId)
      
      // Log successful authenticated request
      console.info(`Authenticated request: IP=${clientIP}, User=${authResult.payload!.phone}, Path=${pathname}`)
      
      return response
    }

    // For non-protected paths, just continue
    return NextResponse.next()

  } catch (error) {
    console.error('Middleware error:', error, {
      ip: clientIP,
      path: pathname,
      userAgent
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'Server error occurred',
          timestamp: new Date() 
        } 
      },
      { status: 500 }
    )
  }
}

// Authenticate JWT token from request
async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean
  payload?: JWTPayload
  error?: string
  code?: string
  status?: number
}> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        success: false, 
        error: 'Missing or invalid Authorization header', 
        code: 'MISSING_AUTH_HEADER',
        status: 401 
      }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, envConfig.jwt.secret, {
      issuer: 'senu-whatsapp-remittances',
      audience: 'senu-users'
    }) as JWTPayload

    return { success: true, payload: decoded }
    
  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { 
        success: false, 
        error: 'Invalid token', 
        code: 'INVALID_TOKEN',
        status: 401 
      }
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return { 
        success: false, 
        error: 'Token expired', 
        code: 'TOKEN_EXPIRED',
        status: 401 
      }
    }
    
    console.error('Token verification error:', error)
    return { 
      success: false, 
      error: 'Token verification failed', 
      code: 'AUTH_ERROR',
      status: 401 
    }
  }
}

// Rate limiting function
function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const key = `middleware_rate_limit_${identifier}`
  const limit = rateLimitStore.get(key)

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + envConfig.rateLimit.windowMs
    })
    return true
  }

  if (limit.count >= envConfig.rateLimit.maxRequests) {
    return false // Rate limit exceeded
  }

  // Increment count
  limit.count++
  rateLimitStore.set(key, limit)
  return true
}

// Get client IP address from request
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const xClientIP = request.headers.get('x-client-ip')
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  if (xRealIP) {
    return xRealIP
  }
  
  if (xClientIP) {
    return xClientIP
  }
  
  // Fallback to unknown if no IP headers are available
  return 'unknown'
}

// Configure which paths this middleware should run on
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
}