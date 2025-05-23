import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "../types/supabase";
import type { cookieMethod } from "../types";
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const createClient = () => {
  const cookieStore = cookies();

  return supabaseCreateClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
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
};
