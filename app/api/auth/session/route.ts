import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter, initializeDatabase } from "@/lib/database";
import { cookies } from "next/headers";

// Mark as dynamic since we use cookies
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get tokens from cookies
    const cookieStore = cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { user: null, session: null },
        { status: 200 }
      );
    }

    // Initialize database adapter
    await initializeDatabase();
    const db = getDatabaseAdapter();

    // Restore session from cookies (for Supabase provider)
    if (typeof (db as any).setSession === "function") {
      await (db as any).setSession(accessToken, refreshToken);
    }

    // Get session from adapter
    const { data: session, error: sessionError } = await db.auth.getSession();

    if (sessionError || !session || !session.user) {
      // Clear invalid cookies
      const response = NextResponse.json(
        { user: null, session: null },
        { status: 200 }
      );

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
    }

    // Fetch profile data
    const { data: profile } = await db.profiles.getById(session.user.id);

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        full_name: profile?.full_name,
        role: profile?.role,
        avatar_url: profile?.avatar_url,
      },
      session: {
        access_token: session.access_token,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { user: null, session: null },
      { status: 200 }
    );
  }
}
