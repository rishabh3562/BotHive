export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: "builder" | "recruiter" | "admin";
          email: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: "builder" | "recruiter" | "admin";
          email: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: "builder" | "recruiter" | "admin";
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: string;
          status: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          trial_end: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier: string;
          status: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          trial_end?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: string;
          status?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          trial_end?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          builder_id: string;
          category: string;
          tags: string[];
          rating: number;
          reviews_count: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          builder_id: string;
          category: string;
          tags?: string[];
          rating?: number;
          reviews_count?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          builder_id?: string;
          category?: string;
          tags?: string[];
          rating?: number;
          reviews_count?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          agent_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          helpful_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          helpful_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          helpful_count?: number;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          budget: number;
          duration: string;
          status: string;
          recruiter_id: string;
          category: string;
          requirements: string[];
          skills: string[];
          created_at: string;
          deadline: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          budget: number;
          duration: string;
          status?: string;
          recruiter_id: string;
          category: string;
          requirements?: string[];
          skills?: string[];
          created_at?: string;
          deadline: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          budget?: number;
          duration?: string;
          status?: string;
          recruiter_id?: string;
          category?: string;
          requirements?: string[];
          skills?: string[];
          created_at?: string;
          deadline?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read: boolean;
          project_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read?: boolean;
          project_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          read?: boolean;
          project_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
// export type Database = {
//   public: {
//     Tables: {
//       users: {
//         Row: {
//           id: string;
//           name: string;
//           email: string;
//           role: "builder" | "recruiter" | "admin";
//           avatar: string;
//         };
//       };
//       subscriptions: {
//         Row: {
//           id: string;
//           userId: string;
//           tier: "free" | "basic" | "pro" | "enterprise";
//           status: "active" | "canceled" | "past_due" | "trialing";
//           currentPeriodEnd: string;
//           cancelAtPeriodEnd: boolean;
//           trialEnd?: string;
//           stripeCustomerId?: string;
//           stripeSubscriptionId?: string;
//         };
//       };
//     };
//   };
// };
