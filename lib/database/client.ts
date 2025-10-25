import type {
  DatabaseResult,
  AuthSession,
  AuthUser,
  Profile,
} from "./types";
import type DatabaseAdapter from "./adapter";
import type { Subscription, AIAgent, Project, Message, Review } from "../types";

/**
 * Client-side database operations that work with both Supabase and MongoDB
 * For MongoDB, it uses API routes to communicate with the server
 */
class ClientDatabaseOperations implements DatabaseAdapter {
  private async makeApiCall<T>(
    endpoint: string,
    method: string = "GET",
    body?: unknown
  ): Promise<DatabaseResult<T>> {
    try {
      const response = await fetch(`/api/database/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { data: null, error: err };
    }
  }

  get auth() {
    return {
      getSession: async (): Promise<DatabaseResult<AuthSession | null>> => {
        return this.makeApiCall<AuthSession | null>("auth/session");
      },

      signUp: async (
        email: string,
        password: string,
        metadata?: Record<string, unknown>
      ): Promise<DatabaseResult<AuthUser | null>> => {
        const res = await this.makeApiCall<{ user: AuthUser | null }>(
          "auth/signup",
          "POST",
          { email, password, metadata }
        );
        if (res.error) return { data: null, error: res.error };
        return { data: res.data?.user ?? null, error: null };
      },

      signIn: async (
        email: string,
        password: string
      ): Promise<DatabaseResult<AuthUser | null>> => {
        const res = await this.makeApiCall<{ user: AuthUser | null }>(
          "auth/signin",
          "POST",
          { email, password }
        );
        if (res.error) return { data: null, error: res.error };
        return { data: res.data?.user ?? null, error: null };
      },

      signOut: async (): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>("auth/signout", "POST");
      },
    };
  }

  get profiles() {
    return {
      getById: async (id: string): Promise<DatabaseResult<Profile | null>> => {
        return this.makeApiCall<Profile | null>(`profiles/${id}`);
      },

      create: async (
        profile: Omit<Profile, "created_at" | "updated_at">
      ): Promise<DatabaseResult<Profile>> => {
        return this.makeApiCall<Profile>("profiles", "POST", profile);
      },

      update: async (
        id: string,
        updates: Partial<Profile>
      ): Promise<DatabaseResult<Profile>> => {
        return this.makeApiCall<Profile>(`profiles/${id}`, "PUT", updates);
      },

      delete: async (id: string): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>(`profiles/${id}`, "DELETE");
      },
    };
  }

  get subscriptions() {
    return {
      getByUserId: async (userId: string): Promise<DatabaseResult<Subscription | null>> => {
        return this.makeApiCall<Subscription | null>(`subscriptions/user/${userId}`);
      },

      create: async (subscription: Omit<Subscription, "id">): Promise<DatabaseResult<Subscription>> => {
        return this.makeApiCall<Subscription>("subscriptions", "POST", subscription);
      },

      update: async (
        id: string,
        updates: Partial<Subscription>
      ): Promise<DatabaseResult<Subscription>> => {
        return this.makeApiCall<Subscription>(`subscriptions/${id}`, "PUT", updates);
      },

      delete: async (id: string): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>(`subscriptions/${id}`, "DELETE");
      },

      subscribeToChanges: async (_userId: string, _callback: (subscription: Subscription) => void): Promise<DatabaseResult<() => void>> => {
        // No-op for client-side adapter for now
        return { data: () => {}, error: null };
      },
    };
  }

  get agents() {
    return {
      getAll: async (): Promise<DatabaseResult<AIAgent[]>> => {
        return this.makeApiCall<AIAgent[]>("agents");
      },

      getById: async (id: string): Promise<DatabaseResult<AIAgent | null>> => {
        return this.makeApiCall<AIAgent | null>(`agents/${id}`);
      },

      create: async (agent: Omit<AIAgent, "id">): Promise<DatabaseResult<AIAgent>> => {
        return this.makeApiCall<AIAgent>("agents", "POST", agent);
      },

      update: async (
        id: string,
        updates: Partial<AIAgent>
      ): Promise<DatabaseResult<AIAgent>> => {
        return this.makeApiCall<AIAgent>(`agents/${id}`, "PUT", updates);
      },

      delete: async (id: string): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>(`agents/${id}`, "DELETE");
      },
    };
  }

  get projects() {
    return {
      getAll: async (): Promise<DatabaseResult<Project[]>> => {
        return this.makeApiCall<Project[]>("projects");
      },

      getById: async (id: string): Promise<DatabaseResult<Project | null>> => {
        return this.makeApiCall<Project | null>(`projects/${id}`);
      },

      getByRecruiterId: async (
        recruiterId: string
      ): Promise<DatabaseResult<Project[]>> => {
        return this.makeApiCall<Project[]>(`projects/recruiter/${recruiterId}`);
      },

      create: async (project: Omit<Project, "id">): Promise<DatabaseResult<Project>> => {
        return this.makeApiCall<Project>("projects", "POST", project);
      },

      update: async (
        id: string,
        updates: Partial<Project>
      ): Promise<DatabaseResult<Project>> => {
        return this.makeApiCall<Project>(`projects/${id}`, "PUT", updates);
      },

      delete: async (id: string): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>(`projects/${id}`, "DELETE");
      },
    };
  }

  get messages() {
    return {
      getAll: async (): Promise<DatabaseResult<Message[]>> => {
        return this.makeApiCall<Message[]>("messages");
      },

      getById: async (id: string): Promise<DatabaseResult<Message | null>> => {
        return this.makeApiCall<Message | null>(`messages/${id}`);
      },

      getByProjectId: async (
        projectId: string
      ): Promise<DatabaseResult<Message[]>> => {
        return this.makeApiCall<Message[]>(`messages/project/${projectId}`);
      },

      getByUsers: async (
        userId1: string,
        userId2: string
      ): Promise<DatabaseResult<Message[]>> => {
        return this.makeApiCall<Message[]>(`messages/users/${userId1}/${userId2}`);
      },

      create: async (message: Omit<Message, "id">): Promise<DatabaseResult<Message>> => {
        return this.makeApiCall<Message>("messages", "POST", message);
      },

      update: async (
        id: string,
        updates: Partial<Message>
      ): Promise<DatabaseResult<Message>> => {
        return this.makeApiCall<Message>(`messages/${id}`, "PUT", updates);
      },

      delete: async (id: string): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>(`messages/${id}`, "DELETE");
      },
    };
  }

  get reviews() {
    return {
      getAll: async (): Promise<DatabaseResult<Review[]>> => {
        return this.makeApiCall<Review[]>("reviews");
      },

      getById: async (id: string): Promise<DatabaseResult<Review | null>> => {
        return this.makeApiCall<Review | null>(`reviews/${id}`);
      },

      getByAgentId: async (agentId: string): Promise<DatabaseResult<Review[]>> => {
        return this.makeApiCall<Review[]>(`reviews/agent/${agentId}`);
      },

      create: async (review: Omit<Review, "id">): Promise<DatabaseResult<Review>> => {
        return this.makeApiCall<Review>("reviews", "POST", review);
      },

      update: async (
        id: string,
        updates: Partial<Review>
      ): Promise<DatabaseResult<Review>> => {
        return this.makeApiCall<Review>(`reviews/${id}`, "PUT", updates);
      },

      delete: async (id: string): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>(`reviews/${id}`, "DELETE");
      },
    };
  }
}

// Export a singleton instance for client-side use
export const db = new ClientDatabaseOperations();
