import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { supabaseServer, TABLES } from "../config/supabase";
import { config } from "../config/env";
import type { User, JWTPayload } from "../types";

interface UserResponse {
  id?: string;
  name?: string;
  country?: "CR" | "NI";
  wallet_address?: string;
  wallet_address_external?: string;
  type_wallet?: string;
  kyc_status?: "pending" | "verified" | "rejected";
  [key: string]: unknown;
}

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Auth Service - centralized authentication logic

export class AuthService {
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  /**
   * Check if user exists and get user data via REST API
   */
  static async getUserByPhone(phoneNumber: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${phoneNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get user: ${response.statusText}`);
      }

      const userData = await response.json() as UserResponse;
      
      // Convert to User type
      return {
        id: userData.id || '',
        phone: phoneNumber,
        name: userData.name || '',
        country: userData.country,
        wallet_address: userData.wallet_address || '',
        wallet_address_external: userData.wallet_address_external,
        type_wallet: userData.type_wallet,
        kyc_status: userData.kyc_status || 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };
    } catch (error) {
      console.error('Error getting user by phone:', error);
      return null;
    }
  }



  /**
   * Update user data via REST API
   */
  static async updateUser(phoneNumber: string, updates: { name?: string; country?: string }): Promise<UserResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${phoneNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Check if user is registered (has name and country)
   */
  static async isUserRegistered(phoneNumber: string): Promise<boolean> {
    const user = await this.getUserByPhone(phoneNumber);
    return !!(user && user.name && user.country);
  }

  /**
   * Register user with complete information
   */
  static async register(phoneNumber: string, name: string, country: string): Promise<boolean> {
    try {
      // First check if user exists
      const existingUser = await this.getUserByPhone(phoneNumber);
      
      if (existingUser) {
        // Update existing user
        const updated = await this.updateUser(phoneNumber, { name, country });
        return !!updated;
      } else {
        // Create wallet (which creates user) and then update with name/country
        await this.createWallet(phoneNumber);
        const updated = await this.updateUser(phoneNumber, { name, country });
        return !!updated;
      }
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  }

  /**
   * Create wallet for user via REST API
   */
  static async createWallet(phoneNumber: string): Promise<boolean> {
    try {
      console.log(`Creating wallet for phone number: ${phoneNumber} in the url ${this.baseUrl}/api/wallets/create`);
      const response = await fetch(`${this.baseUrl}/api/wallets/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: parseInt(phoneNumber) }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error creating wallet:', error);
      return false;
    }
  }

  /**
   * Get user wallet address via REST API
   */
  static async getUserWalletAddress(phoneNumber: string): Promise<string | null> {
    try {
      const user = await this.getUserByPhone(phoneNumber);
      return user?.wallet_address || null;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  }

  /**
   * Generate JWT token for authenticated user
   * Requirements: 9.1, 10.4 - Security and token management
   */
  static async generateToken(phone: string): Promise<string> {
    try {
      // Get user data
      const { data: user, error } = await supabaseServer
        .from(TABLES.USERS)
        .select("id, phone")
        .eq("phone", phone)
        .single();

      if (error || !user) {
        throw new Error("USER_NOT_FOUND");
      }

      // Create JWT payload
      const payload: JWTPayload = {
        phone: user.phone,
        userId: user.id,
      };

      // Generate JWT token
      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: "senu-whatsapp-remittances",
        audience: "senu-users",
      } as jwt.SignOptions);

      return token;
    } catch (error) {
      console.error("AuthService.generateToken error:", error);
      throw error;
    }
  }

  /**
   * Validate JWT token and return user data
   * Requirements: 9.1, 10.4 - Authentication middleware
   */
  static async validateToken(token: string): Promise<JWTPayload> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: "senu-whatsapp-remittances",
        audience: "senu-users",
      }) as JWTPayload;

      // Ensure user still exists in database
      const { data: user, error } = await supabaseServer
        .from(TABLES.USERS)
        .select("id, phone")
        .eq("phone", decoded.phone)
        .single();

      if (error || !user) {
        throw new Error("USER_NOT_FOUND");
      }

      return decoded;
    } catch (error) {
      console.error("AuthService.validateToken error:", error);
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("INVALID_TOKEN");
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("TOKEN_EXPIRED");
      }
      throw error;
    }
  }

  /**
   * Check rate limiting for phone number
   * Requirements: 9.1, 10.4 - Rate limiting by phone
   */
  static checkRateLimit(phone: string): boolean {
    const now = Date.now();
    const key = `rate_limit_${phone}`;
    const limit = rateLimitStore.get(key);

    if (!limit || now > limit.resetTime) {
      // Reset or create new limit window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.rateLimit.windowMs,
      });
      return true;
    }

    if (limit.count >= config.rateLimit.maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment count
    limit.count++;
    rateLimitStore.set(key, limit);
    return true;
  }

  /**
   * Validate phone number format
   * Supports formats: +50688881111, +50588882222 (CR/NI)
   */
  private static isValidPhoneNumber(phone: string): boolean {
    // Basic validation for Costa Rica (+506) and Nicaragua (+505) phone numbers
    const phoneRegex = /^\+50[56]\d{8}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Generate temporary wallet address (to be replaced by WalletService)
   */
  private static generateTempWalletAddress(): string {
    // Generate a temporary address that will be replaced when wallet service creates the actual wallet
    return (
      "0x" +
      Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")
    );
  }

  /**
   * Hash password (for future use if needed)
   */
  private static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password (for future use if needed)
   */
  private static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}