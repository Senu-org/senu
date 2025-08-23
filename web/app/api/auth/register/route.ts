import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "../../../../lib/services/auth";
import type {
  RegisterUserRequest,
  ApiResponse,
  RegisterUserResponse,
} from "../../../../lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterUserRequest = await request.json();

    // Validate required fields
    if (!body.phone || !body.name || !body.country) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PHONE",
            message: "Phone number, name, and country are required",
            timestamp: new Date(),
          },
        } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Validate country
    if (!["CR", "NI"].includes(body.country)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PHONE",
            message: "Country must be CR (Costa Rica) or NI (Nicaragua)",
            timestamp: new Date(),
          },
        } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Register user using Auth Service
    const result = await AuthService.registerUser(body);

    // Generate JWT token for the new user
    const token = await AuthService.generateToken(body.phone);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...result,
          token,
        },
      } as ApiResponse<RegisterUserResponse & { token: string }>,
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Registration failed";

    // Return appropriate error response based on error type
    if (errorMessage.includes("already exists")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PHONE",
            message: "User already exists with this phone number",
            timestamp: new Date(),
          },
        } as ApiResponse<never>,
        { status: 409 }
      );
    }

    if (errorMessage.includes("Invalid phone")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PHONE",
            message:
              "Invalid phone number format. Use international format (+1234567890)",
            timestamp: new Date(),
          },
        } as ApiResponse<never>,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "WALLET_CREATION_FAILED",
          message: "Registration failed due to internal error",
          timestamp: new Date(),
        },
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
