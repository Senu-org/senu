import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { supabaseServer, TABLES } from "../config/supabase";
import { config } from "../config/env";
import type { User, JWTPayload } from "../types";

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Auth Service - centralized authentication logic
export class AuthService {
  /**
   * Register a new user by phone number
   * Requirements: 1.1, 1.2, 1.4 - User registration and wallet creation
   */
  static async registerUser(
    phone: string,
    name: string,
    country: "CR" | "NI"
  ): Promise<User> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phone)) {
        throw new Error("INVALID_PHONE");
      }

      // Check if user already exists
      const { data: existingUser } = await supabaseServer
        .from(TABLES.USERS)
        .select("*")
        .eq("phone", phone)
        .single();

      if (existingUser) {
        throw new Error("USER_ALREADY_EXISTS");
      }

      // Create user in database
      const { data: user, error } = await supabaseServer
        .from(TABLES.USERS)
        .insert({
          phone,
          name,
          country,
          wallet_address: this.generateTempWalletAddress(), // Temporary until wallet service creates real one
          kyc_status: "pending",
        })
        .select()
        .single();

      if (error || !user) {
        console.error("Error creating user:", error);
        throw new Error("USER_CREATION_FAILED");
      }

      return {
        id: user.id,
        phone: user.phone,
        name: user.name,
        country: user.country ?? undefined,
        wallet_address: user.wallet_address,
        wallet_address_external: user.wallet_address_external ?? undefined,
        type_wallet: user.type_wallet ?? undefined,
        kyc_status: user.kyc_status,
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at),
      };
    } catch (error) {
      console.error("AuthService.registerUser error:", error);
      throw error;
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
   * Get user by phone number
   */
  static async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabaseServer
        .from(TABLES.USERS)
        .select("*")
        .eq("phone", phone)
        .single();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        phone: user.phone,
        name: user.name,
        country: user.country ?? undefined,
        wallet_address: user.wallet_address,
        wallet_address_external: user.wallet_address_external ?? undefined,
        type_wallet: user.type_wallet ?? undefined,
        kyc_status: user.kyc_status,
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at),
      };
    } catch (error) {
      console.error("AuthService.getUserByPhone error:", error);
      return null;
    }
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
