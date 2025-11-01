import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import type { Database } from "../types/supabase";
import type {
  DatabaseResult,
  AuthSession,
  AuthUser,
  Profile,
} from "./types";
import type DatabaseAdapter from "./adapter";
import type { Subscription, AIAgent, Project, Message, Review } from "../types";
import { databaseConfig } from "./config";
import { logAndReturnError } from "./error-helper";

// Helper: map a DB row (snake_case) into the domain Review shape (camelCase)
function mapRowToReview(row: any): Review {
  const response = row?.response ?? row?.response_json ?? null;
  return {
    id: row.id,
    agentId: row.agent_id ?? row.agentId ?? "",
    userId: row.user_id ?? row.userId ?? row.userId ?? "",
    userName: row.user_name ?? row.userName ?? row.userName ?? "",
    userAvatar: row.user_avatar ?? row.userAvatar ?? row.userAvatar ?? "",
    rating: row.rating ?? 0,
    comment: row.comment ?? "",
  date: row.created_at ?? row.date ?? new Date().toISOString(),
    helpful: row.helpful ?? 0,
    response: response
      ? {
          from: response.from ?? response.from_user ?? "",
          message: response.message ?? "",
          date: response.date ? String(response.date) : undefined,
        }
      : undefined,
  } as Review;
}

// Helper: map domain Review (or partial) into DB row payload (snake_case)
function mapReviewToRow(r: any): Record<string, unknown> {
  if (!r) return {};
  const payload: Record<string, unknown> = {};
  if (r.agentId !== undefined) payload.agent_id = r.agentId;
  if (r.userId !== undefined) payload.user_id = r.userId;
  if (r.userName !== undefined) payload.user_name = r.userName;
  if (r.userAvatar !== undefined) payload.user_avatar = r.userAvatar;
  if (r.rating !== undefined) payload.rating = r.rating;
  if (r.comment !== undefined) payload.comment = r.comment;
  if (r.helpful !== undefined) payload.helpful = r.helpful;
  if (r.response !== undefined) payload.response = r.response;
  return payload;
}

export class SupabaseProvider implements DatabaseAdapter {
  private client: SupabaseClient<Database>;

  constructor() {
    // Validate we're running on the server
    if (typeof window !== "undefined") {
      throw new Error(
        "SECURITY ERROR: SupabaseProvider cannot be instantiated in browser. " +
        "All database operations must go through API routes."
      );
    }

    if (!databaseConfig.supabase?.url || !databaseConfig.supabase?.serviceRoleKey) {
      throw new Error(
        "Supabase configuration is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    // SECURITY: Using service role key for full admin access (server-only)
    this.client = createClient<Database>(
      databaseConfig.supabase.url,
      databaseConfig.supabase.serviceRoleKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }

  async initialize(): Promise<void> {
    // Supabase client is already initialized in constructor
  }

  async close(): Promise<void> {
    // Supabase doesn't require explicit cleanup
  }

  /**
   * Set the session from stored tokens (e.g., from cookies)
   * This allows the adapter to restore authentication state
   */
  async setSession(accessToken: string, refreshToken?: string): Promise<void> {
    await this.client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || "",
    });
  }

  // Auth operations exposed directly on the provider
  public auth = {
    getSession: async (): Promise<DatabaseResult<AuthSession | null>> => {
      try {
        const { data, error } = await this.client.auth.getSession();
        if (error) throw error;

        return {
          data: data.session
            ? {
                user: data.session.user
                  ? {
                      id: data.session.user.id,
                      email: data.session.user.email!,
                    }
                  : null,
                access_token: data.session.access_token,
              }
            : null,
          error: null,
        };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    signUp: async (
      email: string,
      password: string,
      metadata?: Record<string, unknown>
    ): Promise<DatabaseResult<AuthUser | null>> => {
      try {
        const { data, error } = await this.client.auth.signUp({
          email,
          password,
          options: { data: metadata },
        });
        if (error) throw error;

        return {
          data: data.user
            ? {
                id: data.user.id,
                email: data.user.email!,
                user_metadata: data.user.user_metadata,
              }
            : null,
          error: null,
        };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    signIn: async (
      email: string,
      password: string
    ): Promise<DatabaseResult<AuthSession | null>> => {
      try {
        const { data, error } = await this.client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        return {
          data: data.session
            ? {
                user: data.session.user
                  ? {
                      id: data.session.user.id,
                      email: data.session.user.email!,
                    }
                  : null,
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
              }
            : null,
          error: null,
        };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    signOut: async (): Promise<DatabaseResult<void>> => {
      try {
        const { error } = await this.client.auth.signOut();
        if (error) throw error;
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },
  };

  public profiles = {
    getById: async (id: string): Promise<DatabaseResult<Profile | null>> => {
      try {
        const { data, error } = await this.client
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();
        if (error) {
          // PostgREST returns a PGRST116 error when zero rows match .single().
          // Treat that as a not-found (null) result rather than an error.
          const e = error as { code?: string; message?: string } | undefined;
          if (e?.code === "PGRST116" || e?.message?.includes("0 rows")) {
            return { data: null, error: null };
          }
          throw error;
        }
        return { data: data as Profile, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    create: async (
      profile: Omit<Profile, "created_at" | "updated_at"> | Omit<Profile, "id" | "created_at" | "updated_at">
    ): Promise<DatabaseResult<Profile>> => {
      try {
        const payload = profile as any;

        // For profiles, the id should match the auth user's id
        // If no id is provided, generate one (though this shouldn't happen for user profiles)
        if (!payload.id) {
          payload.id = randomUUID();
        }

        const { data, error } = await this.client
          .from("profiles")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return { data: data as Profile, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    update: async (
      id: string,
      updates: Partial<Profile>
    ): Promise<DatabaseResult<Profile>> => {
      try {
        const { data, error } = await this.client
          .from("profiles")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return { data: data as Profile, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
        const { error } = await this.client
          .from("profiles")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },
  };

  public subscriptions = {
    getByUserId: async (userId: string): Promise<DatabaseResult<Subscription | null>> => {
      try {
        const { data, error } = await this.client
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .single();
        if (error) throw error;
        return { data: data as Subscription, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    create: async (subscription: Omit<Subscription, "id">): Promise<DatabaseResult<Subscription>> => {
      try {
        const { data, error } = await this.client
          .from("subscriptions")
          .insert([subscription])
          .select()
          .single();
        if (error) throw error;
        return { data: data as Subscription, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    update: async (
      id: string,
      updates: Partial<Subscription>
    ): Promise<DatabaseResult<Subscription>> => {
      try {
        const { data, error } = await this.client
          .from("subscriptions")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return { data: data as Subscription, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
        const { error } = await this.client
          .from("subscriptions")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    subscribeToChanges: async (
      userId: string,
      callback: (subscription: Subscription) => void
    ): Promise<DatabaseResult<() => void>> => {
      try {
        // Use server-side row filter so Supabase only sends changes for this user
        const channel = this.client
          .channel(`subscription_changes_${userId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "subscriptions",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              // payload.new contains the new row; deliver it directly
              if (payload && (payload as any).new) {
                const newRow = (payload as any).new;
                // Extra check to be defensive in case the client library returns unexpected shapes
                if (newRow.user_id === userId) {
                  callback(newRow as Subscription);
                }
              }
            }
          )
          .subscribe();

        return {
          data: () => {
            this.client.removeChannel(channel);
          },
          error: null,
        };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },
  };

  public agents = {
    getAll: async (): Promise<DatabaseResult<AIAgent[]>> => {
      try {
        const { data, error } = await this.client
          .from("agents")
          .select("*");
        if (error) throw error;
        return { data: (data as AIAgent[]) || [], error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    getById: async (id: string): Promise<DatabaseResult<AIAgent | null>> => {
      try {
        const { data, error } = await this.client
          .from("agents")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        return { data: data as AIAgent, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    create: async (agent: Omit<AIAgent, "id">): Promise<DatabaseResult<AIAgent>> => {
      try {
        const { data, error } = await this.client
          .from("agents")
          .insert([agent])
          .select()
          .single();
        if (error) throw error;
        return { data: data as AIAgent, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    update: async (
      id: string,
      updates: Partial<AIAgent>
    ): Promise<DatabaseResult<AIAgent>> => {
      try {
        const { data, error } = await this.client
          .from("agents")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return { data: data as AIAgent, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
        const { error } = await this.client
          .from("agents")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },
  };

  public projects = {
    getAll: async (): Promise<DatabaseResult<Project[]>> => {
      try {
        const { data, error } = await this.client
          .from("projects")
          .select("*");
        if (error) throw error;
        return { data: (data as Project[]) || [], error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    getById: async (id: string): Promise<DatabaseResult<Project | null>> => {
      try {
        const { data, error } = await this.client
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        return { data: data as Project, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    getByRecruiterId: async (
      recruiterId: string
    ): Promise<DatabaseResult<Project[]>> => {
      try {
        const { data, error } = await this.client
          .from("projects")
          .select("*")
          .eq("recruiter_id", recruiterId);
        if (error) throw error;
        return { data: (data as Project[]) || [], error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    create: async (project: Omit<Project, "id">): Promise<DatabaseResult<Project>> => {
      try {
        const { data, error } = await this.client
          .from("projects")
          .insert([project])
          .select()
          .single();
        if (error) throw error;
        return { data: data as Project, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    update: async (
      id: string,
      updates: Partial<Project>
    ): Promise<DatabaseResult<Project>> => {
      try {
        const { data, error } = await this.client
          .from("projects")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return { data: data as Project, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
        const { error } = await this.client
          .from("projects")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },
  };

  public messages = {
    getAll: async (): Promise<DatabaseResult<Message[]>> => {
      try {
        const { data, error } = await this.client
          .from("messages")
          .select("*");
        if (error) throw error;
        return { data: (data as Message[]) || [], error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    getById: async (id: string): Promise<DatabaseResult<Message | null>> => {
      try {
        const { data, error } = await this.client
          .from("messages")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        return { data: data as Message, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    getByProjectId: async (
      projectId: string
    ): Promise<DatabaseResult<Message[]>> => {
      try {
        const { data, error } = await this.client
          .from("messages")
          .select("*")
          .eq("project_id", projectId);
        if (error) throw error;
        return { data: (data as Message[]) || [], error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    getByUsers: async (
      userId1: string,
      userId2: string
    ): Promise<DatabaseResult<Message[]>> => {
      try {
        const { data, error } = await this.client
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),` +
            `and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
          );
        if (error) throw error;
        return { data: (data as Message[]) || [], error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    create: async (message: Omit<Message, "id">): Promise<DatabaseResult<Message>> => {
      try {
        const { data, error } = await this.client
          .from("messages")
          .insert([message])
          .select()
          .single();
        if (error) throw error;
        return { data: data as Message, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    update: async (
      id: string,
      updates: Partial<Message>
    ): Promise<DatabaseResult<Message>> => {
      try {
        const { data, error } = await this.client
          .from("messages")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return { data: data as Message, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
        const { error } = await this.client
          .from("messages")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },
  };

  public reviews = {
    getAll: async (): Promise<DatabaseResult<Review[]>> => {
      try {
        const { data, error } = await this.client
          .from("reviews")
          .select("*");
        if (error) throw error;
        // Normalize rows into domain Review shape (map snake_case -> camelCase)
  const mapped = (data as any[] || []).map(mapRowToReview) as Review[];
  return { data: mapped, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    getById: async (id: string): Promise<DatabaseResult<Review | null>> => {
      try {
        const { data, error } = await this.client
          .from("reviews")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
  return { data: data ? mapRowToReview(data as any) : null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    getByAgentId: async (
      agentId: string
    ): Promise<DatabaseResult<Review[]>> => {
      try {
        const { data, error } = await this.client
          .from("reviews")
          .select("*")
          .eq("agent_id", agentId);
        if (error) throw error;
  const mapped = (data as any[] || []).map(mapRowToReview) as Review[];
  return { data: mapped, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    create: async (review: Omit<Review, "id">): Promise<DatabaseResult<Review>> => {
      try {
        const payload = mapReviewToRow(review as any);
        const { data, error } = await this.client
          .from("reviews")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return { data: data ? mapRowToReview(data as any) : null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    update: async (
      id: string,
      updates: Partial<Review>
    ): Promise<DatabaseResult<Review>> => {
      try {
        const payload = mapReviewToRow(updates as any);
        const { data, error } = await this.client
          .from("reviews")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return { data: data ? mapRowToReview(data as any) : null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
        const { error } = await this.client
          .from("reviews")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'SupabaseProvider');
      }
    },
  };
}
