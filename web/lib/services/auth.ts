import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import type { User, RegisterUserRequest, RegisterUserResponse } from '../types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

export class AuthService {
  static async registerUser(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    const { phone, name, country } = request

    // Validate phone number format
    if (!this.isValidPhoneNumber(phone)) {
      throw new Error('Invalid phone number format')
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (existingUser) {
      throw new Error('User already exists with this phone number')
    }

    // Generate wallet address first
    const walletAddress = this.generateWalletAddress()
    
    // Create user in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        phone,
        name,
        country,
        wallet_address: walletAddress,
        kyc_status: 'pending'
      })
      .select()
      .single()

    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`)
    }

    // Create custodial wallet for the user
    const { data: wallet, error: walletError } = await supabase
      .from('custodial_wallets')
      .insert({
        user_phone: phone,
        blockchain_address: walletAddress,
        private_key_ref: this.generatePrivateKeyReference(),
        balance_usd: 0,
        nonce: 0
      })
      .select()
      .single()

    if (walletError) {
      // Rollback user creation if wallet creation fails
      await supabase.from('users').delete().eq('phone', phone)
      throw new Error(`Failed to create wallet: ${walletError.message}`)
    }

    return {
      user: user as User,
      wallet
    }
  }

  static async validateToken(token: string): Promise<{ phone: string; iat: number; exp: number }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { phone: string; iat: number; exp: number }
      
      // Verify user still exists in database
      const { data: user, error } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', decoded.phone)
        .single()

      if (error || !user) {
        throw new Error('User not found')
      }

      return decoded
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  static async generateToken(phone: string): Promise<string> {
    return jwt.sign({ phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  static async authenticateUser(phone: string): Promise<{ user: User; token: string }> {
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error || !user) {
      throw new Error('User not found')
    }

    // Generate JWT token
    const token = await this.generateToken(phone)

    return {
      user: user as User,
      token
    }
  }

  private static isValidPhoneNumber(phone: string): boolean {
    // Basic phone validation - accepts international format with country code
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phone)
  }

  private static generateWalletAddress(): string {
    // Generate a dummy Ethereum-like address for now
    // In production, this should integrate with Para Protocol or similar
    const chars = '0123456789abcdef'
    let address = '0x'
    for (let i = 0; i < 40; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return address
  }

  private static generatePrivateKeyReference(): string {
    // Generate a reference ID for KMS-stored private key
    return `kms_key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    return authHeader.substring(7)
  }
}