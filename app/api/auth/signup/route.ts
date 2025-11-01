import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter, initializeDatabase } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, role } = body;

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["builder", "recruiter", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Initialize database adapter
    await initializeDatabase();
    const db = getDatabaseAdapter();

    // Create user with Supabase auth
    const { data: authUser, error: signUpError } = await db.auth.signUp(
      email,
      password,
      { full_name, role } // Pass metadata
    );

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    if (!authUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create profile record
    // The profile ID must match the auth user's ID
    const { data: profile, error: profileError } = await db.profiles.create({
      id: authUser.id,
      email: authUser.email,
      full_name,
      role,
    } as any);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // User was created but profile failed - still return success
      // The profile can be created later
    }

    // Sign in the user to get session tokens
    const { data: session, error: signInError } = await db.auth.signIn(
      email,
      password
    );

    if (signInError || !session) {
      // User created but couldn't sign in - they can sign in manually
      return NextResponse.json(
        {
          message: "User created successfully. Please sign in.",
          user: {
            id: authUser.id,
            email: authUser.email,
            full_name: profile?.full_name || full_name,
            role: profile?.role || role,
            avatar_url: profile?.avatar_url,
          },
        },
        { status: 201 }
      );
    }

    // Create response
    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: authUser.id,
          email: authUser.email,
          full_name: profile?.full_name || full_name,
          role: profile?.role || role,
          avatar_url: profile?.avatar_url,
        },
      },
      { status: 201 }
    );

    // Set session cookies
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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
