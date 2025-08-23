import { NextRequest } from "next/server";
import { AuthService } from "./services/auth";
import type { User } from "./types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthenticatedUser {
  phone: string;
  user: User;
}

/**
 * Extract and validate user from authenticated request
 * This should be used in API routes that require authentication
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser> {
  // Get phone from middleware-set header
  const userPhone = request.headers.get("x-user-phone");

  if (!userPhone) {
    // Fallback: try to extract from Authorization header
    const authHeader = request.headers.get("Authorization");
    const token = AuthService.extractBearerToken(authHeader);

    if (!token) {
      throw new Error("No authentication token provided");
    }

    const decoded = await AuthService.validateToken(token);
    const phone = decoded.phone;

    // Get full user data
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error || !user) {
      throw new Error("User not found");
    }

    return {
      phone,
      user: user as User,
    };
  }

  // Get full user data using phone from middleware
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", userPhone)
    .single();

  if (error || !user) {
    throw new Error("User not found");
  }

  return {
    phone: userPhone,
    user: user as User,
  };
}

/**
 * Check if a request is authenticated (has valid JWT)
 * This is a lighter check that doesn't fetch full user data
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = AuthService.extractBearerToken(authHeader);

    if (!token) {
      return false;
    }

    await AuthService.validateToken(token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract phone number from JWT token without full validation
 * Use only when you need quick phone extraction
 */
export function extractPhoneFromRequest(request: NextRequest): string | null {
  return request.headers.get("x-user-phone");
}
