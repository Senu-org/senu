import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth";
import { ErrorCodes } from "@/lib/types";
import type { User, ApiResponse } from "@/lib/types";

interface LoginRequest {
  phone: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: LoginRequest = await request.json();
    const { phone } = body;

    // Validate required fields
    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INVALID_REQUEST,
            message: "Phone number is required",
            timestamp: new Date(),
          },
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Check rate limiting
    if (!AuthService.checkRateLimit(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.RATE_LIMIT_EXCEEDED,
            message: "Too many login attempts. Please try again later.",
            timestamp: new Date(),
          },
        } as ApiResponse<null>,
        { status: 429 }
      );
    }

    // Check if user exists
    const user = await AuthService.getUserByPhone(phone);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.USER_NOT_FOUND,
            message: "User not found. Please register first.",
            timestamp: new Date(),
          },
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Generate JWT token
    const token = await AuthService.generateToken(phone);

    const response: LoginResponse = {
      user,
      token,
    };

    return NextResponse.json(
      {
        success: true,
        data: response,
      } as ApiResponse<LoginResponse>,
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Login error:", error);

    // Handle specific error types
    if (error instanceof Error && error.message === "INVALID_PHONE") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INVALID_PHONE,
            message:
              "Invalid phone number format. Please use format: +50688881111",
            timestamp: new Date(),
          },
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.USER_NOT_FOUND,
            message: "User not found. Please register first.",
            timestamp: new Date(),
          },
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: "Login failed due to server error. Please try again.",
          timestamp: new Date(),
        },
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
