import { validateDatabaseConfig, DATABASE_PROVIDER } from "./config";
import type { DatabaseProvider, DatabaseOperations } from "./types";

// Global database instance
let databaseProvider: DatabaseProvider | null = null;

/**
 * Initialize the database provider based on configuration
 */
export async function initializeDatabase(): Promise<void> {
  try {
    validateDatabaseConfig();

    if (DATABASE_PROVIDER === "supabase") {
      // Import Supabase provider (works on both client and server)
      const { SupabaseProvider } = await import("./supabase");
      databaseProvider = new SupabaseProvider();
    } else if (DATABASE_PROVIDER === "mongodb") {
      // MongoDB is server-side only
      if (typeof window !== "undefined") {
        throw new Error(
          "MongoDB provider is server-side only. Use Supabase for client-side operations."
        );
      }
      const { MongoDBProvider } = await import("./mongodb");
      databaseProvider = new MongoDBProvider();
    } else {
      throw new Error(`Unsupported database provider: ${DATABASE_PROVIDER}`);
    }

    await databaseProvider.initialize();
    console.log(`Database initialized with provider: ${DATABASE_PROVIDER}`);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Get the database operations interface
 */
export function getDatabase(): DatabaseOperations {
  // If we're on the client side and using MongoDB, use the client interface
  if (typeof window !== "undefined" && DATABASE_PROVIDER === "mongodb") {
    const { clientDb } = require("./client");
    return clientDb;
  }

  if (!databaseProvider) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first."
    );
  }
  return databaseProvider.operations;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (databaseProvider) {
    await databaseProvider.close();
    databaseProvider = null;
  }
}

/**
 * Get the current database provider type
 */
export function getDatabaseProvider(): string {
  return DATABASE_PROVIDER;
}

// Export types for use in other files
export type {
  DatabaseOperations,
  DatabaseResult,
  AuthSession,
  AuthUser,
  Profile,
} from "./types";

// Convenience exports for common operations
export const db = {
  auth: () => getDatabase().auth,
  profiles: () => getDatabase().profiles,
  subscriptions: () => getDatabase().subscriptions,
  agents: () => getDatabase().agents,
  projects: () => getDatabase().projects,
  messages: () => getDatabase().messages,
  reviews: () => getDatabase().reviews,
};

// Export initialization function for use in app startup
export { initializeDatabase as init };
