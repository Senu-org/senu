import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "../../../../lib/services/auth";
import type { ApiResponse } from "../../../../lib/types";

interface LoginRequest {
  phone: string;
}

interface LoginResponse {
  user: any;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    // Validate required fields
    if (!body.phone) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PHONE",
            message: "Phone number is required",
            timestamp: new Date(),
          },
        } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Authenticate user using Auth Service
    const result = await AuthService.authenticateUser(body.phone);

    return NextResponse.json(
      {
        success: true,
        data: result,
      } as ApiResponse<LoginResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Login failed";

    // Return appropriate error response based on error type
    if (errorMessage.includes("User not found")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PHONE",
            message: "User not found with this phone number",
            timestamp: new Date(),
          },
        } as ApiResponse<never>,
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ONRAMP_SERVICE_UNAVAILABLE",
          message: "Login failed due to internal error",
          timestamp: new Date(),
        },
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
