import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter, initializeDatabase } from "@/lib/database";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookies to restore session
    const cookieStore = cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    // Initialize database adapter
    await initializeDatabase();
    const db = getDatabaseAdapter();

    // If we have a session, sign out through adapter
    if (accessToken) {
      // Restore session first (for Supabase provider)
      if (typeof (db as any).setSession === "function") {
        await (db as any).setSession(accessToken, refreshToken);
      }

      // Sign out through adapter
      await db.auth.signOut();
    }

    // Create response
    const response = NextResponse.json({
      message: "Signed out successfully",
    });

    // Clear session cookies
    response.cookies.set("sb-access-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("sb-refresh-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
