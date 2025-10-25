import { validateDatabaseConfig, DATABASE_PROVIDER } from "./config";
import type { DatabaseAdapter } from "./adapter";
import type { DatabaseResult } from "./types";

// Global database instance (the adapter)
let databaseProvider: DatabaseAdapter | null = null;

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

    if (databaseProvider) {
  // lifecycle.initialize may either return void (legacy providers) or a
  // DatabaseResult<void> (newer providers that follow the adapter contract).
  // Use a tighter type to make the union explicit during migration.
  type MaybeLifecycle = { initialize?: () => Promise<void | DatabaseResult<void>>; close?: () => Promise<void> };
      const lifecycle = databaseProvider as unknown as MaybeLifecycle;
      if (typeof lifecycle.initialize === "function") {
        const initResult = await lifecycle.initialize();
        // If the provider returned a DatabaseResult, check for errors and
        // throw so callers of initializeDatabase see a failure.
        if (initResult && typeof initResult === "object" && "error" in initResult) {
          if (initResult.error) {
            throw initResult.error;
          }
        }
      }
    }
    console.log(`Database initialized with provider: ${DATABASE_PROVIDER}`);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Get the database operations interface
 */
export function getDatabaseAdapter(): DatabaseAdapter {
  // If we're on the client side and using MongoDB, use the client adapter
  if (typeof window !== "undefined" && DATABASE_PROVIDER === "mongodb") {
    const { db } = require("./client");
    return db as DatabaseAdapter;
  }

  if (!databaseProvider) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first."
    );
  }

  return databaseProvider;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (databaseProvider) {
    type MaybeLifecycle = { initialize?: () => Promise<void>; close?: () => Promise<void> };
    const lifecycle = databaseProvider as unknown as MaybeLifecycle;
    if (typeof lifecycle.close === "function") {
      await lifecycle.close();
    }
  }
  databaseProvider = null;
}

/**
 * Get the current database provider type
 */
export function getDatabaseProvider(): string {
  return DATABASE_PROVIDER;
}

// Export types for use in other files
export type {
  DatabaseResult,
  AuthSession,
  AuthUser,
  Profile,
} from "./types";

// Convenience exports for common operations
// Convenience wrapper that forwards to the adapter
/**
 * Backwards-compatible alias used across the codebase. Returns the adapter.
 */
export function getDatabase(): DatabaseAdapter {
  return getDatabaseAdapter();
}

// Convenience exports for common operations (backwards-compatible)
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
