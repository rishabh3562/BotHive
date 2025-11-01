import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter, initializeDatabase } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize database adapter
    await initializeDatabase();
    const db = getDatabaseAdapter();

    // Sign in user - adapter returns session with tokens
    const { data: session, error: signInError } = await db.auth.signIn(
      email,
      password
    );

    if (signInError) {
      return NextResponse.json(
        { error: signInError.message },
        { status: 401 }
      );
    }

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Failed to sign in" },
        { status: 500 }
      );
    }

    // Fetch profile data
    const { data: profile } = await db.profiles.getById(session.user.id);

    // Create response
    const response = NextResponse.json({
      message: "Signed in successfully",
      user: {
        id: session.user.id,
        email: session.user.email,
        full_name: profile?.full_name,
        role: profile?.role,
        avatar_url: profile?.avatar_url,
      },
    });

    // Set session cookies (httpOnly for security)
    if (session.access_token) {
      response.cookies.set("sb-access-token", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    if (session.refresh_token) {
      response.cookies.set("sb-refresh-token", session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
