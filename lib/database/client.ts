import type {
  DatabaseOperations,
  DatabaseResult,
  AuthSession,
  AuthUser,
  Profile,
} from "./types";

/**
 * Client-side database operations that work with both Supabase and MongoDB
 * For MongoDB, it uses API routes to communicate with the server
 */
class ClientDatabaseOperations implements DatabaseOperations {
  private async makeApiCall<T>(
    endpoint: string,
    method: string = "GET",
    body?: any
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
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  get auth() {
    return {
      getSession: async (): Promise<DatabaseResult<AuthSession>> => {
        return this.makeApiCall<AuthSession>("auth/session");
      },

      signUp: async (
        email: string,
        password: string,
        metadata?: Record<string, any>
      ): Promise<DatabaseResult<{ user: AuthUser | null }>> => {
        return this.makeApiCall<{ user: AuthUser | null }>(
          "auth/signup",
          "POST",
          { email, password, metadata }
        );
      },

      signIn: async (
        email: string,
        password: string
      ): Promise<DatabaseResult<{ user: AuthUser | null }>> => {
        return this.makeApiCall<{ user: AuthUser | null }>(
          "auth/signin",
          "POST",
          { email, password }
        );
      },

      signOut: async (): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>("auth/signout", "POST");
      },
    };
  }

  get profiles() {
    return {
      getById: async (id: string): Promise<DatabaseResult<Profile>> => {
        return this.makeApiCall<Profile>(`profiles/${id}`);
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
      getByUserId: async (userId: string): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>(`subscriptions/user/${userId}`);
      },

      create: async (subscription: any): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>("subscriptions", "POST", subscription);
      },

      update: async (
        id: string,
        updates: any
      ): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>(`subscriptions/${id}`, "PUT", updates);
      },

      delete: async (id: string): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>(`subscriptions/${id}`, "DELETE");
      },

      subscribeToChanges: (
        userId: string,
        callback: (subscription: any) => void
      ) => {
        // For client-side, we'll use polling or WebSocket if needed
        // For now, return a no-op cleanup function
        return () => {
          // Cleanup logic
        };
      },
    };
  }

  get agents() {
    return {
      getAll: async (): Promise<DatabaseResult<any[]>> => {
        return this.makeApiCall<any[]>("agents");
      },

      getById: async (id: string): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>(`agents/${id}`);
      },

      create: async (agent: any): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>("agents", "POST", agent);
      },

      update: async (
        id: string,
        updates: any
      ): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>(`agents/${id}`, "PUT", updates);
      },

      delete: async (id: string): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>(`agents/${id}`, "DELETE");
      },
    };
  }

  get projects() {
    return {
      getAll: async (): Promise<DatabaseResult<any[]>> => {
        return this.makeApiCall<any[]>("projects");
      },

      getById: async (id: string): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>(`projects/${id}`);
      },

      getByRecruiterId: async (
        recruiterId: string
      ): Promise<DatabaseResult<any[]>> => {
        return this.makeApiCall<any[]>(`projects/recruiter/${recruiterId}`);
      },

      create: async (project: any): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>("projects", "POST", project);
      },

      update: async (
        id: string,
        updates: any
      ): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>(`projects/${id}`, "PUT", updates);
      },

      delete: async (id: string): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>(`projects/${id}`, "DELETE");
      },
    };
  }

  get messages() {
    return {
      getAll: async (): Promise<DatabaseResult<any[]>> => {
        return this.makeApiCall<any[]>("messages");
      },

      getById: async (id: string): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>(`messages/${id}`);
      },

      getByProjectId: async (
        projectId: string
      ): Promise<DatabaseResult<any[]>> => {
        return this.makeApiCall<any[]>(`messages/project/${projectId}`);
      },

      getByUsers: async (
        userId1: string,
        userId2: string
      ): Promise<DatabaseResult<any[]>> => {
        return this.makeApiCall<any[]>(`messages/users/${userId1}/${userId2}`);
      },

      create: async (message: any): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>("messages", "POST", message);
      },

      update: async (
        id: string,
        updates: any
      ): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>(`messages/${id}`, "PUT", updates);
      },

      delete: async (id: string): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>(`messages/${id}`, "DELETE");
      },
    };
  }

  get reviews() {
    return {
      getAll: async (): Promise<DatabaseResult<any[]>> => {
        return this.makeApiCall<any[]>("reviews");
      },

      getById: async (id: string): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>(`reviews/${id}`);
      },

      getByAgentId: async (agentId: string): Promise<DatabaseResult<any[]>> => {
        return this.makeApiCall<any[]>(`reviews/agent/${agentId}`);
      },

      create: async (review: any): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>("reviews", "POST", review);
      },

      update: async (
        id: string,
        updates: any
      ): Promise<DatabaseResult<any>> => {
        return this.makeApiCall<any>(`reviews/${id}`, "PUT", updates);
      },

      delete: async (id: string): Promise<DatabaseResult<void>> => {
        return this.makeApiCall<void>(`reviews/${id}`, "DELETE");
      },
    };
  }
}

// Export a singleton instance for client-side use
export const clientDb = new ClientDatabaseOperations();
