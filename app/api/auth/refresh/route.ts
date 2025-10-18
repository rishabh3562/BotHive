import { NextRequest, NextResponse } from "next/server";
import { dbOperations, type AuthStrategy } from "@/lib/database/operations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken, strategy = "bearer" } = body;

    // Validate required fields
    if (!refreshToken) {
      return NextResponse.json(
        { error: "Missing refresh token" },
        { status: 400 }
      );
    }

    // Validate strategy
    if (!["bearer", "cookie"].includes(strategy)) {
      return NextResponse.json(
        { error: "Invalid authentication strategy" },
        { status: 400 }
      );
    }

    // Refresh token
    const { data, error } = await dbOperations.auth.refreshToken(
      refreshToken,
      strategy as AuthStrategy
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: 500 }
      );
    }

    const { token, refreshToken: newRefreshToken } = data;

    // Create response
    const response = NextResponse.json({
      message: "Token refreshed successfully",
      token,
      refreshToken: newRefreshToken,
    });

    // Set cookie if using cookie strategy
    if (strategy === "cookie") {
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      response.cookies.set("refresh-token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
