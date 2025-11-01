// Database provider configuration
export type DatabaseProvider = "supabase" | "mongodb";

// Environment variable to control which database to use
// Set to 'supabase' or 'mongodb'
export const DATABASE_PROVIDER: DatabaseProvider =
  (process.env.DATABASE_PROVIDER as DatabaseProvider) || "supabase";

// Database configuration interface
export interface DatabaseConfig {
  provider: DatabaseProvider;
  supabase?: {
    url: string;
    serviceRoleKey: string;
  };
  mongodb?: {
    uri: string;
    database: string;
  };
}

// Centralized database configuration
// SECURITY: Using server-only environment variables (no NEXT_PUBLIC_ prefix)
export const databaseConfig: DatabaseConfig = {
  provider: DATABASE_PROVIDER,
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || '',
    database: process.env.MONGODB_DATABASE || "bothive",
  },
};

// Validate configuration based on selected provider
export function validateDatabaseConfig(): void {
  if (DATABASE_PROVIDER === "supabase") {
    if (!databaseConfig.supabase?.url || !databaseConfig.supabase?.serviceRoleKey) {
      throw new Error(
        "Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only, not NEXT_PUBLIC_)"
      );
    }
  } else if (DATABASE_PROVIDER === "mongodb") {
    if (!databaseConfig.mongodb?.uri) {
      throw new Error("Missing MongoDB configuration. Please set MONGODB_URI");
    }
  } else {
    throw new Error(`Unsupported database provider: ${DATABASE_PROVIDER}`);
  }
}
