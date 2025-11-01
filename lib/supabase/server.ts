import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "../types/supabase";
import type { cookieMethod } from "../types";

/**
 * SECURITY: Server-only Supabase client using service role key
 *
 * This client has full admin access to Supabase and should ONLY be used:
 * - In API routes (app/api/*)
 * - In Server Components
 * - In Server Actions
 *
 * NEVER expose this client or its credentials to the browser/client-side
 */
export const createClient = (): SupabaseClient<Database> | null => {
  // Return null if Supabase is not configured
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
    return null;
  }

  // Validate we're running on the server
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY ERROR: Server-only Supabase client cannot be used in browser. " +
      "All database operations must go through API routes."
    );
  }

  const cookieStore = cookies();

  const client = supabaseCreateClient<Database>(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      // cookies: {
      //   get(name: string) {
      //     return cookieStore.get(name)?.value;
      //   },
      //   set(name: string, value: string, options: any) {
      //     try {
      //       cookieStore.set({ name, value, ...options });
      //     } catch (error) {
      //       // Handle cookie setting error
      //     }
      //   },
      //   remove(name: string, options: any) {
      //     try {
      //       cookieStore.delete({ name, ...options });
      //     } catch (error) {
      //       // Handle cookie removal error
      //     }
      //   },
      // } as cookieMethod,
    }
  );

  // Explicitly return the typed client
  return client as SupabaseClient<Database>;
};
