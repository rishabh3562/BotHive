import type { Subscription, AIAgent, Project, Message, Review } from "../types";
import type { Profile, AuthUser } from "./types";
import type { ObjectId as ObjectIdType } from "mongodb";

// --- Internal MongoDB document (raw) types ---
export interface BaseDoc {
  _id: ObjectIdType;
  created_at: Date;
  updated_at: Date;
  [k: string]: unknown;
}

export interface ProfileDoc extends BaseDoc {
  full_name?: string;
  role?: string;
  email?: string;
  avatar_url?: string;
  stripe_customer_id?: string;
}

export interface UserDoc extends BaseDoc {
  email: string;
  password_hash: string;
  user_metadata: Record<string, unknown>;
}

export interface SubscriptionDoc extends BaseDoc {
  user_id: string;
  plan?: string;
  status?: string;
  cancel_at_period_end?: boolean;
}

export interface AgentDoc extends BaseDoc {
  name?: string;
  description?: string;
  price?: number;
  builder_id?: string;
  builder_name?: string;
  builder_avatar?: string;
  category?: string;
  tags?: string[];
  rating?: number;
  reviews?: number;
  imageUrl?: string;
  features?: string[];
  status?: string;
  moderationNotes?: string;
  performance?: {
    revenueGrowth?: number;
    userSatisfaction?: number;
    responseTime?: number;
    uptime?: number;
  };
  metrics?: {
    dailyUsers?: number[];
    monthlyRevenue?: number[];
    taskCompletion?: number;
  };
  techStack?: string[];
  requirements?: { cpu?: string; memory?: string; storage?: string };
  updates?: Array<{ date?: Date; version?: string; changes?: string[] }>;
  videoUrl?: string;
  files?: Array<{ name?: string; url?: string; size?: number; type?: string }>;
}

export interface ProjectDoc extends BaseDoc {
  recruiter_id?: string;
  title?: string;
  description?: string;
  budget?: number;
  duration?: string;
  status?: string;
  recruiter_name?: string;
  recruiter_avatar?: string;
  requirements?: string[];
  proposals?: unknown[];
  deadline?: Date;
  category?: string;
  skills?: string[];
}

// Proposal document shape when stored as embedded documents inside a Project
export interface ProposalDoc extends BaseDoc {
  project_id?: string;
  builder_id?: string;
  builder_name?: string;
  builder_avatar?: string;
  amount?: number;
  duration?: string;
  cover_letter?: string;
  status?: string;
}

export interface MessageDoc extends BaseDoc {
  sender_id?: string;
  receiver_id?: string;
  project_id?: string;
  content?: string;
  read?: boolean;
}

export interface ReviewDoc extends BaseDoc {
  agent_id?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  rating?: number;
  comment?: string;
  helpful?: number;
  response?: { from?: string; message?: string; date?: Date };
}

/**
 * Converts a raw ProfileDoc from MongoDB into a domain-safe Profile object.
 * Normalizes optional fields, converts ObjectId to string, and formats dates.
 */
export function mapProfileDocToProfile(d: ProfileDoc): Profile {
  const role = d.role === "builder" || d.role === "recruiter" || d.role === "admin" ? d.role : "builder";
  return {
    id: d._id.toString(),
    full_name: d.full_name ?? "",
    role,
    email: d.email ?? "",
    avatar_url: d.avatar_url ?? null,
    created_at: d.created_at.toISOString(),
    updated_at: d.updated_at.toISOString(),
    stripe_customer_id: d.stripe_customer_id ?? undefined,
  } as Profile;
}

/**
 * Converts a raw UserDoc from MongoDB into an AuthUser used by the app.
 * Copies over id, email and normalizes user_metadata to a plain object.
 */
export function mapUserDocToAuthUser(d: UserDoc): AuthUser {
  return {
    id: d._id.toString(),
    email: d.email,
    user_metadata: d.user_metadata || {},
  } as AuthUser;
}

/**
 * Converts a raw SubscriptionDoc from MongoDB into the app Subscription type.
 * Normalizes plan/status values to allowed enums and formats timestamps.
 */
export function mapSubscriptionDocToSubscription(d: SubscriptionDoc): Subscription {
  const allowedTiers = ["free", "basic", "pro", "enterprise"] as const;
  const tier = (typeof d.plan === "string" && (allowedTiers as readonly string[]).includes(d.plan))
    ? (d.plan as Subscription["tier"]) // safe cast after check
    : "free";

  const allowedStatuses = ["active", "canceled", "past_due", "trialing"] as const;
  const status = (typeof d.status === "string" && (allowedStatuses as readonly string[]).includes(d.status))
    ? (d.status as Subscription["status"]) // safe cast after check
    : "active";

  return {
    id: d._id.toString(),
    userId: d.user_id,
    tier,
    status,
    currentPeriodEnd: d.updated_at?.toISOString() ?? new Date().toISOString(),
    cancelAtPeriodEnd: d.cancel_at_period_end ?? false,
  } as Subscription;
}

/**
 * Converts a raw AgentDoc from MongoDB into the domain AIAgent type.
 * Provides sensible defaults for optional fields and converts nested dates.
 */
export function mapAgentDocToAIAgent(d: AgentDoc): AIAgent {
  return {
    id: d._id.toString(),
    title: d.name ?? "",
    description: d.description ?? "",
    price: d.price ?? 0,
    builder: {
      id: d.builder_id ?? "",
      name: d.builder_name ?? "",
      avatar: d.builder_avatar ?? "",
    },
    category: d.category ?? "",
    tags: d.tags ?? [],
    rating: d.rating ?? 0,
    reviews: d.reviews ?? 0,
    imageUrl: d.imageUrl ?? "",
    features: d.features ?? [],
    created: d.created_at.toISOString(),
    status: d.status ?? "pending",
    moderationNotes: d.moderationNotes,
    performance: {
      revenueGrowth: d.performance?.revenueGrowth ?? 0,
      userSatisfaction: d.performance?.userSatisfaction ?? 0,
      responseTime: d.performance?.responseTime ?? 0,
      uptime: d.performance?.uptime ?? 0,
    },
    metrics: {
      dailyUsers: d.metrics?.dailyUsers ?? [],
      monthlyRevenue: d.metrics?.monthlyRevenue ?? [],
      taskCompletion: d.metrics?.taskCompletion ?? 0,
    },
    techStack: d.techStack ?? [],
    requirements: d.requirements ?? { cpu: "", memory: "", storage: "" },
    updates: (d.updates ?? []).map((u) => ({
      date: u?.date ? u.date.toISOString() : new Date().toISOString(),
      version: u?.version ?? "",
      changes: u?.changes ?? [],
    })),
    videoUrl: d.videoUrl,
    files: d.files,
  } as AIAgent;
}

/**
 * Converts a raw ProjectDoc from MongoDB into the domain Project type.
 * Maps recruiter info, normalizes proposals and converts date fields.
 */
export function mapProjectDocToProject(d: ProjectDoc): Project {
  return {
    id: d._id.toString(),
    title: d.title ?? "",
    description: d.description ?? "",
    budget: d.budget ?? 0,
    duration: d.duration ?? "",
    status: d.status ?? "open",
    recruiter: {
      id: d.recruiter_id ?? "",
      name: d.recruiter_name ?? "",
      avatar: d.recruiter_avatar ?? "",
    },
    requirements: d.requirements ?? [],
    proposals: Array.isArray(d.proposals)
      ? (d.proposals as (ProposalDoc | null | undefined)[]).map((p) => {
          const allowedStatuses = ["pending", "accepted", "rejected"] as const;
          const status = typeof p?.status === "string" && (allowedStatuses as readonly string[]).includes(p.status)
            ? (p.status as import("../types").Proposal["status"])
            : "pending";

          return {
            id: p?._id ? p._id.toString() : "",
            projectId: p?.project_id ?? d._id.toString(),
            builder: {
              id: p?.builder_id ?? "",
              name: p?.builder_name ?? "",
              avatar: p?.builder_avatar ?? "",
              rating: 0,
              completedProjects: 0,
            },
            amount: p?.amount ?? 0,
            duration: p?.duration ?? "",
            coverLetter: p?.cover_letter ?? "",
            status,
            created: p?.created_at ? p.created_at.toISOString() : new Date().toISOString(),
          } as import("../types").Proposal;
        })
      : [],
    created: d.created_at.toISOString(),
    deadline: d.deadline ? d.deadline.toISOString() : new Date().toISOString(),
    category: d.category ?? "",
    skills: d.skills ?? [],
  } as Project;
}

/**
 * Converts a raw MessageDoc from MongoDB into the domain Message type.
 * Maps sender/receiver ids, timestamp and defaults for optional fields.
 */
export function mapMessageDocToMessage(d: MessageDoc): Message {
  return {
    id: d._id.toString(),
    senderId: d.sender_id ?? "",
    receiverId: d.receiver_id ?? "",
    content: d.content ?? "",
    timestamp: d.created_at.toISOString(),
    read: d.read ?? false,
    projectId: d.project_id,
  } as Message;
}

/**
 * Converts a raw ReviewDoc from MongoDB into the domain Review type.
 * Normalizes rating/comment fields and converts created_at to an ISO date.
 */
export function mapReviewDocToReview(d: ReviewDoc): Review {
  return {
    id: d._id.toString(),
    agentId: d.agent_id ?? "",
    userId: d.userId ?? "",
    userName: d.userName ?? "",
    userAvatar: d.userAvatar ?? "",
    rating: d.rating ?? 0,
    comment: d.comment ?? "",
    date: d.created_at.toISOString(),
    helpful: d.helpful ?? 0,
    response: d.response
      ? {
          from: d.response.from ?? "",
          message: d.response.message ?? "",
          date: d.response.date ? d.response.date.toISOString() : undefined,
        }
      : undefined,
  } as Review;
}
