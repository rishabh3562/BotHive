export type Role = 'builder' | 'recruiter' | 'admin';

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatar: string;
  subscription?: Subscription;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface AIAgent {
  id: string;
  title: string;
  description: string;
  price: number;
  builder: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  imageUrl: string;
  features: string[];
  created: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  performance: {
    revenueGrowth: number;
    userSatisfaction: number;
    responseTime: number;
    uptime: number;
  };
  metrics: {
    dailyUsers: number[];
    monthlyRevenue: number[];
    taskCompletion: number;
  };
  techStack: string[];
  requirements: {
    cpu: string;
    memory: string;
    storage: string;
  };
  updates: {
    date: string;
    version: string;
    changes: string[];
  }[];
  videoUrl?: string;
  files?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
}

export interface Review {
  id: string;
  agentId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  response?: {
    from: string;
    message: string;
    date: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  duration: string;
  status: 'open' | 'in_progress' | 'completed';
  recruiter: {
    id: string;
    name: string;
    avatar: string;
  };
  requirements: string[];
  proposals: Proposal[];
  created: string;
  deadline: string;
  category: string;
  skills: string[];
}

export interface Proposal {
  id: string;
  projectId: string;
  builder: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    completedProjects: number;
  };
  amount: number;
  duration: string;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  created: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  projectId?: string;
}

export interface ChatThread {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
  }[];
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
  projectId?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  tier: SubscriptionTier;
}

export interface cookieMethod{
  get(name: string): string | undefined;
  set(name: string, value: string, options?: Record<string, unknown>): void;
  remove(name: string, options?: Record<string, unknown>): void;
}