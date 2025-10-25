import { createClient, SupabaseClient } from "@supabase/supabase-js";
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

export class SupabaseProvider implements DatabaseAdapter {
  private client: SupabaseClient<Database>;

  constructor() {
    if (!databaseConfig.supabase?.url || !databaseConfig.supabase?.anonKey) {
      throw new Error("Supabase configuration is missing");
    }

    this.client = createClient<Database>(
      databaseConfig.supabase.url,
      databaseConfig.supabase.anonKey,
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
    ): Promise<DatabaseResult<AuthUser | null>> => {
      try {
        const { data, error } = await this.client.auth.signInWithPassword({
          email,
          password,
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
      profile: Omit<Profile, "created_at" | "updated_at">
    ): Promise<DatabaseResult<Profile>> => {
      try {
        const { data, error } = await this.client
          .from("profiles")
          .insert([profile])
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
        const channel = this.client
          .channel("subscription_changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "subscriptions",
            },
            async (payload) => {
              const {
                data: { session },
              } = await this.client.auth.getSession();
              if (
                session &&
                "user_id" in payload.new &&
                payload.new.user_id === session.user.id
              ) {
                callback(payload.new as Subscription);
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
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[SupabaseProvider]: ${message}`);
        throw error instanceof Error ? error : new Error(message);
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
          .or(`sender_id.eq.${userId1},sender_id.eq.${userId2}`)
          .or(`receiver_id.eq.${userId1},receiver_id.eq.${userId2}`);
        if (error) throw error;
        return { data: (data as Message[]) || [], error: null };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[SupabaseProvider]: ${message}`);
        throw error instanceof Error ? error : new Error(message);
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
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[SupabaseProvider]: ${message}`);
        throw error instanceof Error ? error : new Error(message);
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
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[SupabaseProvider]: ${message}`);
        throw error instanceof Error ? error : new Error(message);
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
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[SupabaseProvider]: ${message}`);
        throw error instanceof Error ? error : new Error(message);
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
        return { data: (data as Review[]) || [], error: null };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[SupabaseProvider]: ${message}`);
        throw error instanceof Error ? error : new Error(message);
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
        return { data: data as Review, error: null };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[SupabaseProvider]: ${message}`);
        throw error instanceof Error ? error : new Error(message);
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
        return { data: (data as Review[]) || [], error: null };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[SupabaseProvider]: ${message}`);
        throw error instanceof Error ? error : new Error(message);
      }
    },

    create: async (review: Omit<Review, "id">): Promise<DatabaseResult<Review>> => {
      try {
        const { data, error } = await this.client
          .from("reviews")
          .insert([review])
          .select()
          .single();
        if (error) throw error;
        return { data: data as Review, error: null };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[SupabaseProvider]: ${message}`);
        throw error instanceof Error ? error : new Error(message);
      }
    },

    update: async (
      id: string,
      updates: Partial<Review>
    ): Promise<DatabaseResult<Review>> => {
      try {
        const { data, error } = await this.client
          .from("reviews")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return { data: data as Review, error: null };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[SupabaseProvider]: ${message}`);
        throw error instanceof Error ? error : new Error(message);
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
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[SupabaseProvider]: ${message}`);
        throw error instanceof Error ? error : new Error(message);
      }
    },
  };
}
