/**
 * @deprecated SECURITY WARNING: Client-side Supabase access is deprecated
 *
 * This file previously exposed Supabase credentials to the browser, which is a security risk.
 * All database operations should now go through API routes at /api/database/*
 *
 * If you need to perform database operations from the client:
 * 1. Use the ClientDatabaseOperations class from '@/lib/database/client'
 * 2. Or make API calls to the appropriate /api/database/* endpoints
 *
 * This file is kept for backwards compatibility but will be removed in a future version.
 */

import { createClient } from '@supabase/supabase-js';
// import type { Database } from '@/lib/types/supabase';

// DEPRECATED: This client should no longer be used
// Environment variables NEXT_PUBLIC_SUPABASE_* have been removed for security
export const supabase = null;

// Log a warning if someone tries to use this deprecated client
if (typeof window !== "undefined") {
  console.warn(
    "[DEPRECATION WARNING] lib/supabase/client.ts is deprecated. " +
    "Use API routes (/api/database/*) for database operations instead. " +
    "See lib/database/client.ts for the proper client-side interface."
  );
}