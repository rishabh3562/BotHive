import { NextRequest, NextResponse } from "next/server";
import { dbOperations, type AuthStrategy } from "@/lib/database/operations";
import { SignUpInput, SignUpSchema } from "./signup.schema";
import { captureApiException } from "@/lib/observability/sentry";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = SignUpSchema.safeParse(body);

    if(!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password, full_name, role, strategy = "bearer" } = result.data;

    // Create user
    const { data, error } = await dbOperations.auth.signUp(
      email,
      password,
      full_name,
      role,
      strategy as AuthStrategy
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const { user, token, refreshToken } = data;

    // Create response
    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: {
          _id: user._id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          avatar_url: user.avatar_url,
          is_verified: user.is_verified,
        },
        token,
        refreshToken,
      },
      { status: 201 }
    );

    // Set cookie if using cookie strategy
    if (strategy === "cookie") {
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      response.cookies.set("refresh-token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    captureApiException(error, request, { handler: "POST /api/auth/signup" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
