import type {
  User,
  Subscription,
  AIAgent,
  Project,
  Message,
  Review,
} from "../types";

// Common database operation result interface
export interface DatabaseResult<T = unknown> {
  data: T | null;
  error: Error | null;
}

// Authentication interfaces
export interface AuthSession {
  user: {
    id: string;
    email: string;
  } | null;
  access_token?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

// Profile interface
export interface Profile {
  id: string;
  full_name: string;
  role: "builder" | "recruiter" | "admin";
  email: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string;
}

// Database operation interfaces
// (DatabaseOperations and DatabaseProvider removed - providers now implement DatabaseAdapter)
