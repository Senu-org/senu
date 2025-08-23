import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "./lib/services/auth";

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per window

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and some paths
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting for auth endpoints
  if (pathname.startsWith("/api/auth/")) {
    const clientIP = getClientIP(request);
    const rateLimitKey = `auth_${clientIP}`;

    if (!isWithinRateLimit(rateLimitKey)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
            timestamp: new Date(),
          },
        },
        { status: 429 }
      );
    }
  }

  // Apply JWT authentication for protected API routes
  const protectedPaths = [
    "/api/wallets/",
    "/api/transactions/",
    "/api/notifications/",
  ];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: authResult.error,
            timestamp: new Date(),
          },
        },
        { status: 401 }
      );
    }

    // Add user info to request headers for API routes
    const response = NextResponse.next();
    response.headers.set("x-user-phone", authResult.phone!);

    // Log authenticated request
    console.log(
      `Authenticated request: ${pathname} - User: ${authResult.phone}`
    );

    return response;
  }

  return NextResponse.next();
}

async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  phone?: string;
  error?: string;
}> {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = AuthService.extractBearerToken(authHeader);

    if (!token) {
      return {
        success: false,
        error: "No authorization token provided",
      };
    }

    const decoded = await AuthService.validateToken(token);

    return {
      success: true,
      phone: decoded.phone,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to connection remote address
  return "unknown";
}

function isWithinRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > entry.resetTime) {
    // Reset the window
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up expired rate limit entries periodically
setInterval(
  () => {
    const now = Date.now();
    const entries = Array.from(rateLimitStore.entries());
    for (const [key, entry] of entries) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
); // Clean up every 5 minutes

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
