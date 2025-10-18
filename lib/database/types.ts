import type {
  User,
  Subscription,
  AIAgent,
  Project,
  Message,
  Review,
} from "../types";

// Common database operation result interface
export interface DatabaseResult<T = any> {
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
  user_metadata?: Record<string, any>;
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
export interface DatabaseOperations {
  // Authentication
  auth: {
    getSession(): Promise<DatabaseResult<AuthSession>>;
    signUp(
      email: string,
      password: string,
      metadata?: Record<string, any>
    ): Promise<DatabaseResult<{ user: AuthUser | null }>>;
    signIn(
      email: string,
      password: string
    ): Promise<DatabaseResult<{ user: AuthUser | null }>>;
    signOut(): Promise<DatabaseResult<void>>;
  };

  // Profiles
  profiles: {
    getById(id: string): Promise<DatabaseResult<Profile>>;
    create(
      profile: Omit<Profile, "created_at" | "updated_at">
    ): Promise<DatabaseResult<Profile>>;
    update(
      id: string,
      updates: Partial<Profile>
    ): Promise<DatabaseResult<Profile>>;
    delete(id: string): Promise<DatabaseResult<void>>;
  };

  // Subscriptions
  subscriptions: {
    getByUserId(userId: string): Promise<DatabaseResult<Subscription>>;
    create(
      subscription: Omit<Subscription, "id">
    ): Promise<DatabaseResult<Subscription>>;
    update(
      id: string,
      updates: Partial<Subscription>
    ): Promise<DatabaseResult<Subscription>>;
    delete(id: string): Promise<DatabaseResult<void>>;
    subscribeToChanges(
      userId: string,
      callback: (subscription: Subscription) => void
    ): () => void;
  };

  // Agents
  agents: {
    getAll(): Promise<DatabaseResult<AIAgent[]>>;
    getById(id: string): Promise<DatabaseResult<AIAgent>>;
    create(agent: Omit<AIAgent, "id">): Promise<DatabaseResult<AIAgent>>;
    update(
      id: string,
      updates: Partial<AIAgent>
    ): Promise<DatabaseResult<AIAgent>>;
    delete(id: string): Promise<DatabaseResult<void>>;
  };

  // Projects
  projects: {
    getAll(): Promise<DatabaseResult<Project[]>>;
    getById(id: string): Promise<DatabaseResult<Project>>;
    getByRecruiterId(recruiterId: string): Promise<DatabaseResult<Project[]>>;
    create(project: Omit<Project, "id">): Promise<DatabaseResult<Project>>;
    update(
      id: string,
      updates: Partial<Project>
    ): Promise<DatabaseResult<Project>>;
    delete(id: string): Promise<DatabaseResult<void>>;
  };

  // Messages
  messages: {
    getAll(): Promise<DatabaseResult<Message[]>>;
    getById(id: string): Promise<DatabaseResult<Message>>;
    getByProjectId(projectId: string): Promise<DatabaseResult<Message[]>>;
    getByUsers(
      userId1: string,
      userId2: string
    ): Promise<DatabaseResult<Message[]>>;
    create(message: Omit<Message, "id">): Promise<DatabaseResult<Message>>;
    update(
      id: string,
      updates: Partial<Message>
    ): Promise<DatabaseResult<Message>>;
    delete(id: string): Promise<DatabaseResult<void>>;
  };

  // Reviews
  reviews: {
    getAll(): Promise<DatabaseResult<Review[]>>;
    getById(id: string): Promise<DatabaseResult<Review>>;
    getByAgentId(agentId: string): Promise<DatabaseResult<Review[]>>;
    create(review: Omit<Review, "id">): Promise<DatabaseResult<Review>>;
    update(
      id: string,
      updates: Partial<Review>
    ): Promise<DatabaseResult<Review>>;
    delete(id: string): Promise<DatabaseResult<void>>;
  };
}

// Database provider interface
export interface DatabaseProvider {
  operations: DatabaseOperations;
  initialize(): Promise<void>;
  close(): Promise<void>;
}
