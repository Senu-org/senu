import { NextRequest } from 'next/server'
import { AuthService } from '../services/auth'
import type { User } from '../types'

/**
 * Utility functions for accessing authenticated user data in API routes
 * Requirements: 9.1, 10.4 - Authentication middleware integration
 */

/**
 * Get authenticated user from request headers (set by middleware)
 */
export function getAuthenticatedUser(request: NextRequest): {
  phone: string
  userId: string
} | null {
  const phone = request.headers.get('x-user-phone')
  const userId = request.headers.get('x-user-id')
  
  if (!phone || !userId) {
    return null
  }
  
  return { phone, userId }
}

/**
 * Get full user data for authenticated request
 */
export async function getAuthenticatedUserData(request: NextRequest): Promise<User | null> {
  const authData = getAuthenticatedUser(request)
  if (!authData) {
    return null
  }
  
  return await AuthService.getUserByPhone(authData.phone)
}

/**
 * Require authentication - throws error if user not authenticated
 */
export function requireAuth(request: NextRequest): {
  phone: string
  userId: string
} {
  const authData = getAuthenticatedUser(request)
  if (!authData) {
    throw new Error('UNAUTHORIZED')
  }
  
  return authData
}

/**
 * Require authentication with full user data
 */
export async function requireAuthWithUser(request: NextRequest): Promise<User> {
  const user = await getAuthenticatedUserData(request)
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  
  return user
}