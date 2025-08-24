import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth";
import { ErrorCodes } from "@/lib/types";
import type {
  RegisterUserRequest,
  RegisterUserResponse,
  ApiResponse,
  User,
} from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RegisterUserRequest = await request.json();
    const { phone, name, country } = body;

    // Validate required fields
    if (!phone || !name || !country) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INVALID_REQUEST,
            message: "Phone number, name, and country are required",
            timestamp: new Date(),
          },
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate country
    if (!["CR", "NI"].includes(country)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INVALID_COUNTRY,
            message: "Country must be CR (Costa Rica) or NI (Nicaragua)",
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
            message: "Too many registration attempts. Please try again later.",
            timestamp: new Date(),
          },
        } as ApiResponse<null>,
        { status: 429 }
      );
    }

    // Check if user already exists
    const existingUser = await AuthService.getUserByPhone(phone);
    if (existingUser) {
      // Generate token for existing user instead of creating duplicate
      const token = await AuthService.generateToken(phone);

      return NextResponse.json(
        {
          success: true,
          data: {
            user: existingUser,
            token,
            message: "User already exists. Logged in successfully.",
          },
        } as ApiResponse<{ user: User; token: string; message: string }>,
        { status: 200 }
      );
    }

    // Register new user
    const user = await AuthService.registerUser(phone, name, country);

    // Generate JWT token for the new user
    const token = await AuthService.generateToken(phone);

    // Prepare response - Note: wallet creation will be handled by WalletService in next task
    const response: RegisterUserResponse = {
      user,
      wallet: {
        id: "pending",
        phone: parseInt(phone.replace('+', '')),
        wallet_address: user.wallet_address, // Temporary address
        encrypterusershare: "pending",
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          ...response,
          token,
          message: "User registered successfully. Wallet creation in progress.",
        },
      } as ApiResponse<
        RegisterUserResponse & { token: string; message: string }
      >,
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

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

    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.USER_ALREADY_EXISTS,
            message: "A user with this phone number already exists",
            timestamp: new Date(),
          },
        } as ApiResponse<null>,
        { status: 409 }
      );
    }

    if (error instanceof Error && error.message === "USER_CREATION_FAILED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.USER_CREATION_FAILED,
            message: "Failed to create user. Please try again.",
            timestamp: new Date(),
          },
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: "Registration failed due to server error. Please try again.",
          timestamp: new Date(),
        },
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
