import { create } from 'zustand';
import { User } from './types';
import { supabase } from './supabase/client';

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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (session?.user) {
        // Fetch user profile including role with retry mechanism
        let retryCount = 0;
        let profile = null;
        
        while (retryCount < 3 && !profile) {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!profileError && data) {
            profile = data;
            break;
          }

          retryCount++;
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        }

        if (profile) {
          set({
            user: {
              id: session.user.id,
              name: profile.full_name,
              email: session.user.email!,
              role: profile.role,
              avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avatars/svg?seed=${session.user.email}`,
            },
            isLoading: false,
            error: null,
          });
        } else {
          // If profile is not found after retries, clear the session
          await supabase.auth.signOut();
          set({ user: null, isLoading: false, error: 'Profile not found' });
        }
      } else {
        set({ user: null, isLoading: false, error: null });
      }
    } catch (error: any) {
      console.error('Error initializing auth:', error);
      set({ 
        user: null, 
        isLoading: false, 
        error: error.message || 'Failed to initialize authentication'
      });
    }
  },
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, error: null });
    } catch (error: any) {
      console.error('Error signing out:', error);
      set({ error: error.message || 'Failed to sign out' });
    }
  },
}));