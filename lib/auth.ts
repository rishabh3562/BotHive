import { create } from "zustand";
import { User } from "./types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  setUser: (user) => set({ user }),
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Call session API endpoint (server-side checks cookies)
      const response = await fetch("/api/auth/session", {
        credentials: "include", // Important: send cookies
      });

      if (!response.ok) {
        set({ user: null, isLoading: false, error: null });
        return;
      }

      const data = await response.json();

      if (data.user) {
        set({
          user: {
            id: data.user.id,
            name: data.user.full_name,
            email: data.user.email,
            role: data.user.role,
            avatar:
              data.user.avatar_url ||
              `https://api.dicebear.com/7.x/avatars/svg?seed=${data.user.email}`,
          },
          isLoading: false,
          error: null,
        });
      } else {
        set({ user: null, isLoading: false, error: null });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error initializing auth:", message);
      set({
        user: null,
        isLoading: false,
        error: message || "Failed to initialize authentication",
      });
    }
  },
  signOut: async () => {
    try {
      // Call signout API endpoint
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include", // Important: send cookies
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      set({ user: null, isLoading: false, error: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error signing out:", message);
      set({
        user: null,
        isLoading: false,
        error: message || "Failed to sign out",
      });
    }
  },
}));
