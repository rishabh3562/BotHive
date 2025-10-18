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
    anonKey: string;
  };
  mongodb?: {
    uri: string;
    database: string;
  };
}

// Centralized database configuration
export const databaseConfig: DatabaseConfig = {
  provider: DATABASE_PROVIDER,
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  mongodb: {
    uri: process.env.MONGODB_URI!,
    database: process.env.MONGODB_DATABASE || "bothive",
  },
};

// Validate configuration based on selected provider
export function validateDatabaseConfig(): void {
  if (DATABASE_PROVIDER === "supabase") {
    if (!databaseConfig.supabase?.url || !databaseConfig.supabase?.anonKey) {
      throw new Error(
        "Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
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
