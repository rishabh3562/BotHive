import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";
import type {
  DatabaseProvider,
  DatabaseOperations,
  DatabaseResult,
  AuthSession,
  AuthUser,
  Profile,
} from "./types";
import { databaseConfig } from "./config";

export class SupabaseProvider implements DatabaseProvider {
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

  get operations(): DatabaseOperations {
    return {
      auth: {
        getSession: async (): Promise<DatabaseResult<AuthSession>> => {
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
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        signUp: async (
          email: string,
          password: string,
          metadata?: Record<string, any>
        ): Promise<DatabaseResult<{ user: AuthUser | null }>> => {
          try {
            const { data, error } = await this.client.auth.signUp({
              email,
              password,
              options: { data: metadata },
            });
            if (error) throw error;

            return {
              data: {
                user: data.user
                  ? {
                      id: data.user.id,
                      email: data.user.email!,
                      user_metadata: data.user.user_metadata,
                    }
                  : null,
              },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        signIn: async (
          email: string,
          password: string
        ): Promise<DatabaseResult<{ user: AuthUser | null }>> => {
          try {
            const { data, error } = await this.client.auth.signInWithPassword({
              email,
              password,
            });
            if (error) throw error;

            return {
              data: {
                user: data.user
                  ? {
                      id: data.user.id,
                      email: data.user.email!,
                      user_metadata: data.user.user_metadata,
                    }
                  : null,
              },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        signOut: async (): Promise<DatabaseResult<void>> => {
          try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            return { data: null, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },

      profiles: {
        getById: async (id: string): Promise<DatabaseResult<Profile>> => {
          try {
            const { data, error } = await this.client
              .from("profiles")
              .select("*")
              .eq("id", id)
              .single();
            if (error) throw error;
            return { data: data as Profile, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
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
          } catch (error) {
            return { data: null, error: error as Error };
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
          } catch (error) {
            return { data: null, error: error as Error };
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
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },

      subscriptions: {
        getByUserId: async (userId: string): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("subscriptions")
              .select("*")
              .eq("user_id", userId)
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        create: async (subscription: any): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("subscriptions")
              .insert([subscription])
              .select()
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        update: async (
          id: string,
          updates: any
        ): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("subscriptions")
              .update(updates)
              .eq("id", id)
              .select()
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
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
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        subscribeToChanges: (
          userId: string,
          callback: (subscription: any) => void
        ) => {
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
                  callback(payload.new);
                }
              }
            )
            .subscribe();

          return () => {
            this.client.removeChannel(channel);
          };
        },
      },

      agents: {
        getAll: async (): Promise<DatabaseResult<any[]>> => {
          try {
            const { data, error } = await this.client
              .from("agents")
              .select("*");
            if (error) throw error;
            return { data: data || [], error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getById: async (id: string): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("agents")
              .select("*")
              .eq("id", id)
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        create: async (agent: any): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("agents")
              .insert([agent])
              .select()
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        update: async (
          id: string,
          updates: any
        ): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("agents")
              .update(updates)
              .eq("id", id)
              .select()
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
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
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },

      projects: {
        getAll: async (): Promise<DatabaseResult<any[]>> => {
          try {
            const { data, error } = await this.client
              .from("projects")
              .select("*");
            if (error) throw error;
            return { data: data || [], error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getById: async (id: string): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("projects")
              .select("*")
              .eq("id", id)
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getByRecruiterId: async (
          recruiterId: string
        ): Promise<DatabaseResult<any[]>> => {
          try {
            const { data, error } = await this.client
              .from("projects")
              .select("*")
              .eq("recruiter_id", recruiterId);
            if (error) throw error;
            return { data: data || [], error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        create: async (project: any): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("projects")
              .insert([project])
              .select()
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        update: async (
          id: string,
          updates: any
        ): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("projects")
              .update(updates)
              .eq("id", id)
              .select()
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
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
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },

      messages: {
        getAll: async (): Promise<DatabaseResult<any[]>> => {
          try {
            const { data, error } = await this.client
              .from("messages")
              .select("*");
            if (error) throw error;
            return { data: data || [], error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getById: async (id: string): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("messages")
              .select("*")
              .eq("id", id)
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getByProjectId: async (
          projectId: string
        ): Promise<DatabaseResult<any[]>> => {
          try {
            const { data, error } = await this.client
              .from("messages")
              .select("*")
              .eq("project_id", projectId);
            if (error) throw error;
            return { data: data || [], error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getByUsers: async (
          userId1: string,
          userId2: string
        ): Promise<DatabaseResult<any[]>> => {
          try {
            const { data, error } = await this.client
              .from("messages")
              .select("*")
              .or(`sender_id.eq.${userId1},sender_id.eq.${userId2}`)
              .or(`receiver_id.eq.${userId1},receiver_id.eq.${userId2}`);
            if (error) throw error;
            return { data: data || [], error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        create: async (message: any): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("messages")
              .insert([message])
              .select()
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        update: async (
          id: string,
          updates: any
        ): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("messages")
              .update(updates)
              .eq("id", id)
              .select()
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
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
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },

      reviews: {
        getAll: async (): Promise<DatabaseResult<any[]>> => {
          try {
            const { data, error } = await this.client
              .from("reviews")
              .select("*");
            if (error) throw error;
            return { data: data || [], error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getById: async (id: string): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("reviews")
              .select("*")
              .eq("id", id)
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getByAgentId: async (
          agentId: string
        ): Promise<DatabaseResult<any[]>> => {
          try {
            const { data, error } = await this.client
              .from("reviews")
              .select("*")
              .eq("agent_id", agentId);
            if (error) throw error;
            return { data: data || [], error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        create: async (review: any): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("reviews")
              .insert([review])
              .select()
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        update: async (
          id: string,
          updates: any
        ): Promise<DatabaseResult<any>> => {
          try {
            const { data, error } = await this.client
              .from("reviews")
              .update(updates)
              .eq("id", id)
              .select()
              .single();
            if (error) throw error;
            return { data, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
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
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },
    };
  }
}
