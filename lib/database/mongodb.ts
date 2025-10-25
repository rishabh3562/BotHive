import bcrypt from 'bcryptjs';
import type {
  DatabaseResult,
  AuthSession,
  AuthUser,
  Profile,
} from "./types";
import { databaseConfig } from "./config";
import { logAndReturnError } from "./error-helper";

import type DatabaseAdapter from "./adapter";
import type { Subscription, AIAgent, Project, Message, Review } from "../types";
import type {
  MongoClient as MongoClientType,
  ObjectId as ObjectIdType,
  Db as DbType,
  Collection as CollectionType,
} from "mongodb";
import type {
  BaseDoc,
  ProfileDoc,
  UserDoc,
  SubscriptionDoc,
  AgentDoc,
  ProjectDoc,
  MessageDoc,
  ReviewDoc,
} from "./mongodb-types";
import {
  mapProfileDocToProfile,
  mapUserDocToAuthUser,
  mapSubscriptionDocToSubscription,
  mapAgentDocToAIAgent,
  mapProjectDocToProject,
  mapMessageDocToMessage,
  mapReviewDocToReview,
} from "./mongodb-types";

// Doc interfaces and mapping helpers have been moved to `mongodb-types.ts`.
// This file now focuses solely on the MongoDBProvider implementation.

// Only import MongoDB runtime on the server side. We keep strong type aliases above
let MongoClientRuntime: typeof MongoClientType | undefined;
let ObjectIdRuntime: typeof ObjectIdType | undefined;

if (typeof window === "undefined") {
  // Server-side only imports (require used at runtime)
  // Cast to the typed shape so we keep static types while using dynamic require
  const mongodb = require("mongodb") as unknown as {
    MongoClient: typeof MongoClientType;
    ObjectId: typeof ObjectIdType;
  };
  MongoClientRuntime = mongodb.MongoClient;
  ObjectIdRuntime = mongodb.ObjectId;
}

export class MongoDBProvider implements DatabaseAdapter {
  private client: MongoClientType;
  private db: DbType | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      throw new Error("MongoDB provider is server-side only");
    }

    if (!databaseConfig.mongodb?.uri) {
      throw new Error("MongoDB configuration is missing");
    }

    if (!MongoClientRuntime) {
      throw new Error('MongoDB runtime not available on this platform');
    }
    this.client = new MongoClientRuntime!(databaseConfig.mongodb.uri) as MongoClientType;
  }

  async initialize(): Promise<DatabaseResult<void>> {
    try {
      await this.client.connect();
      this.db = this.client.db(databaseConfig.mongodb?.database || "bothive");
      console.log("Connected to MongoDB");
      return { data: null, error: null };
    } catch (error: unknown) {
      return logAndReturnError(error, 'MongoDBProvider');
    }
  }

  async close(): Promise<void> {
    try {
      await this.client.close();
      console.log("Disconnected from MongoDB");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[MongoDBProvider]: ${message}`);
    }
  }

  private getCollection(name: string): CollectionType<Record<string, unknown>> {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db.collection(name) as CollectionType<Record<string, unknown>>;
  }

  // --- auth ---
  public auth = {
    getSession: async (): Promise<DatabaseResult<AuthSession | null>> => {
      try {
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    signUp: async (
      email: string,
      password: string,
      metadata?: Record<string, unknown>
    ): Promise<DatabaseResult<AuthUser | null>> => {
      try {
        const users = this.getCollection("users") as unknown as CollectionType<UserDoc>;
        const existing = await users.findOne({ email });
        if (existing) throw new Error("User already exists");

        // Hash password before storing
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        const oid = new ObjectIdRuntime!();
        const doc: UserDoc = { _id: oid, email, password_hash, user_metadata: metadata || {}, created_at: new Date(), updated_at: new Date() };
        const res = await users.insertOne(doc);
        const insertedUser: UserDoc = { ...doc, _id: res.insertedId };
        return { data: mapUserDocToAuthUser(insertedUser), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    signIn: async (email: string, password: string): Promise<DatabaseResult<AuthUser | null>> => {
      try {
        const users = this.getCollection("users") as unknown as CollectionType<UserDoc>;
        // Fetch by email and verify the hashed password in application code
        const user = await users.findOne({ email });
        if (!user) return { data: null, error: null };

        const isValid = await bcrypt.compare(password, (user as UserDoc).password_hash);
        if (!isValid) return { data: null, error: null };

        return { data: mapUserDocToAuthUser(user as UserDoc), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    signOut: async (): Promise<DatabaseResult<void>> => {
      try {
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },
  };

  // --- profiles ---
  public profiles = {
    getById: async (id: string): Promise<DatabaseResult<Profile | null>> => {
      try {
        const c = this.getCollection("profiles") as unknown as CollectionType<ProfileDoc>;
        const p = await c.findOne({ _id: new ObjectIdRuntime!(id) });
        if (!p) return { data: null, error: null };
        return { data: mapProfileDocToProfile(p as ProfileDoc), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    create: async (profile: Omit<Profile, "id" | "created_at" | "updated_at">): Promise<DatabaseResult<Profile>> => {
      try {
    // Enforce adapter contract: caller must not provide an id. Defensively
    // strip any incoming id and return a clear error if provided.
    if ((profile as any).id) {
      return { data: null, error: new Error('profiles.create forbids caller-provided id') };
    }

    const c = this.getCollection("profiles") as unknown as CollectionType<ProfileDoc>;
    const oid = new ObjectIdRuntime!();
    // strip id defensively in case callers cast around the types
    const { id: _omit, ...rest } = profile as Partial<Profile> & Record<string, unknown>;
    const doc: ProfileDoc = { _id: oid, ...(rest as Omit<Profile, "id">), created_at: new Date(), updated_at: new Date() } as ProfileDoc;
  const res = await c.insertOne(doc);
  const insertedProfile: ProfileDoc = { ...doc, _id: res.insertedId };
  return { data: mapProfileDocToProfile(insertedProfile), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    update: async (id: string, updates: Partial<Profile>): Promise<DatabaseResult<Profile>> => {
      try {
    const c = this.getCollection("profiles") as unknown as CollectionType<ProfileDoc>;
    const updateDoc = { ...updates, updated_at: new Date() } as Partial<ProfileDoc>;
    // remove id if present in updates
    const updatePayload = updateDoc as Record<string, unknown>;
    delete updatePayload.id;
    const res = await c.findOneAndUpdate({ _id: new ObjectIdRuntime!(id) }, { $set: updatePayload as Partial<ProfileDoc> }, { returnDocument: "after" });
      const updatedDoc = res && (res as any).value !== undefined ? (res as any).value : res;

      if (!updatedDoc) {
        return { data: null, error: null };
      }

      return { data: mapProfileDocToProfile(updatedDoc as ProfileDoc), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
        const c = this.getCollection("profiles") as unknown as CollectionType<ProfileDoc>;
        const res = await c.deleteOne({ _id: new ObjectIdRuntime!(id) });
        if (res.deletedCount === 0) return { data: null, error: null };
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },
  };

  // --- subscriptions ---
  public subscriptions = {
    getByUserId: async (userId: string): Promise<DatabaseResult<Subscription | null>> => {
      try {
  const c = this.getCollection("subscriptions") as unknown as CollectionType<SubscriptionDoc>;
  const s = await c.findOne({ user_id: userId });
  if (!s) return { data: null, error: null };
  return { data: mapSubscriptionDocToSubscription(s as SubscriptionDoc), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    create: async (subscription: Omit<Subscription, "id">): Promise<DatabaseResult<Subscription>> => {
      try {
  const c = this.getCollection("subscriptions") as unknown as CollectionType<SubscriptionDoc>;
  const oid = new ObjectIdRuntime!();
  const doc: SubscriptionDoc = {
    _id: oid,
      user_id: subscription.userId,
    plan: subscription.tier,
    status: subscription.status,
    created_at: new Date(),
    updated_at: new Date(),
  } as SubscriptionDoc;
  const res = await c.insertOne(doc);
  const insertedSub: SubscriptionDoc = { ...doc, _id: res.insertedId };
  return { data: mapSubscriptionDocToSubscription(insertedSub), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    update: async (id: string, updates: Partial<Subscription>): Promise<DatabaseResult<Subscription>> => {
      try {
    const c = this.getCollection("subscriptions") as unknown as CollectionType<SubscriptionDoc>;
    const updateDoc = { ...updates, updated_at: new Date() } as Partial<SubscriptionDoc>;
    const res = await c.findOneAndUpdate({ _id: new ObjectIdRuntime!(id) }, { $set: updateDoc }, { returnDocument: "after" });
    if (!res || !res.value) return { data: null, error: null };
    return { data: mapSubscriptionDocToSubscription(res.value as SubscriptionDoc), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
        const c = this.getCollection("subscriptions");
        await c.deleteOne({ _id: new ObjectIdRuntime!(id) });
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    subscribeToChanges: async (_userId: string, _callback: (subscription: Subscription) => void): Promise<DatabaseResult<() => void>> => {
      try {
        // No-op for MongoDB in this adapter
        return { data: () => {}, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },
  };

  // --- agents ---
  public agents = {
    getAll: async (): Promise<DatabaseResult<AIAgent[]>> => {
      try {
        const c = this.getCollection("agents") as unknown as CollectionType<AgentDoc>;
            const docs = await c.find({}).toArray();
            const mapped = docs.map((d) => mapAgentDocToAIAgent(d as AgentDoc));
            return { data: mapped, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    getById: async (id: string): Promise<DatabaseResult<AIAgent | null>> => {
      try {
  const c = this.getCollection("agents") as unknown as CollectionType<AgentDoc>;
  const doc = await c.findOne({ _id: new ObjectIdRuntime!(id) });
  if (!doc) return { data: null, error: null };
  return { data: mapAgentDocToAIAgent(doc as AgentDoc), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    create: async (agent: Omit<AIAgent, "id">): Promise<DatabaseResult<AIAgent>> => {
      try {
  const c = this.getCollection("agents") as unknown as CollectionType<AgentDoc>;
  const oid = new ObjectIdRuntime!();
  const doc: AgentDoc = {
    _id: oid,
    name: agent.title,
    description: agent.description,
    price: agent.price,
    builder_id: agent.builder?.id,
    builder_name: agent.builder?.name,
    builder_avatar: agent.builder?.avatar,
    category: agent.category,
    tags: agent.tags,
    rating: agent.rating,
    reviews: agent.reviews,
    imageUrl: agent.imageUrl,
    features: agent.features,
    created_at: new Date(),
    updated_at: new Date(),
    status: agent.status,
    moderationNotes: agent.moderationNotes,
    performance: agent.performance,
    metrics: agent.metrics,
    techStack: agent.techStack,
    requirements: agent.requirements,
    updates: agent.updates?.map((u) => ({ date: u.date ? new Date(u.date) : new Date(), version: u.version, changes: u.changes })) ?? [],
    videoUrl: agent.videoUrl,
    files: agent.files,
  };
  const res = await c.insertOne(doc);
  const inserted: AgentDoc = { ...doc, _id: res.insertedId };
  return { data: mapAgentDocToAIAgent(inserted), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    update: async (id: string, updates: Partial<AIAgent>): Promise<DatabaseResult<AIAgent>> => {
      try {
    const c = this.getCollection("agents") as unknown as CollectionType<AgentDoc>;
    const updateDoc = { ...updates, updated_at: new Date() } as Partial<AgentDoc>;
    const res = await c.findOneAndUpdate({ _id: new ObjectIdRuntime!(id) }, { $set: updateDoc }, { returnDocument: "after" });
    if (!res || !res.value) return { data: null, error: null };
    return { data: mapAgentDocToAIAgent(res.value as AgentDoc), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
  const c = this.getCollection("agents") as unknown as CollectionType<AgentDoc>;
  await c.deleteOne({ _id: new ObjectIdRuntime!(id) });
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },
  };

  // --- projects ---
  public projects = {
    getAll: async (): Promise<DatabaseResult<Project[]>> => {
      try {
        const c = this.getCollection("projects") as unknown as CollectionType<ProjectDoc>;
        const docs = await c.find({}).toArray();
        const mapped = docs.map((d) => mapProjectDocToProject(d as ProjectDoc));
        return { data: mapped, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    getById: async (id: string): Promise<DatabaseResult<Project | null>> => {
      try {
  const c = this.getCollection("projects") as unknown as CollectionType<ProjectDoc>;
  const doc = await c.findOne({ _id: new ObjectIdRuntime!(id) });
  if (!doc) return { data: null, error: null };
  return { data: mapProjectDocToProject(doc as ProjectDoc), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    getByRecruiterId: async (recruiterId: string): Promise<DatabaseResult<Project[]>> => {
      try {
        const c = this.getCollection("projects") as unknown as CollectionType<ProjectDoc>;
            const docs = await c.find({ recruiter_id: recruiterId }).toArray();
            const mapped = docs.map((d) => mapProjectDocToProject(d as ProjectDoc));
            return { data: mapped, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    create: async (project: Omit<Project, "id">): Promise<DatabaseResult<Project>> => {
      try {
  const c = this.getCollection("projects") as unknown as CollectionType<ProjectDoc>;
  const oid = new ObjectIdRuntime!();
  const doc: ProjectDoc = {
    _id: oid,
    title: project.title,
    description: project.description,
    budget: project.budget,
    duration: project.duration,
    status: project.status,
    recruiter_id: project.recruiter?.id,
    recruiter_name: project.recruiter?.name,
    recruiter_avatar: project.recruiter?.avatar,
    requirements: project.requirements,
  proposals: project.proposals ?? [],
    created_at: new Date(),
    updated_at: new Date(),
    deadline: project.deadline ? new Date(project.deadline) : undefined,
    category: project.category,
    skills: project.skills,
  };
  const res = await c.insertOne(doc);
  const inserted: ProjectDoc = { ...doc, _id: res.insertedId };
  return { data: mapProjectDocToProject(inserted), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    update: async (id: string, updates: Partial<Project>): Promise<DatabaseResult<Project>> => {
      try {
  const c = this.getCollection("projects") as unknown as CollectionType<ProjectDoc>;
  const updateDoc = { ...updates, updated_at: new Date() } as Partial<ProjectDoc>;
  const res = await c.findOneAndUpdate({ _id: new ObjectIdRuntime!(id) }, { $set: updateDoc }, { returnDocument: "after" });
  if (!res || !res.value) return { data: null, error: null };
  return { data: mapProjectDocToProject(res.value as ProjectDoc), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
  const c = this.getCollection("projects") as unknown as CollectionType<ProjectDoc>;
  await c.deleteOne({ _id: new ObjectIdRuntime!(id) });
        return { data: null, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },
  };

  // --- messages ---
  public messages = {
    getAll: async (): Promise<DatabaseResult<Message[]>> => {
      try {
        const c = this.getCollection("messages") as unknown as CollectionType<MessageDoc>;
        const docs = await c.find({}).toArray();
        const mapped = docs.map((d) => mapMessageDocToMessage(d as MessageDoc));
        return { data: mapped, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    getById: async (id: string): Promise<DatabaseResult<Message | null>> => {
      try {
  const c = this.getCollection("messages") as unknown as CollectionType<MessageDoc>;
  const doc = await c.findOne({ _id: new ObjectIdRuntime!(id) });
  if (!doc) return { data: null, error: null };
  return { data: mapMessageDocToMessage(doc as MessageDoc), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    getByProjectId: async (projectId: string): Promise<DatabaseResult<Message[]>> => {
      try {
        const c = this.getCollection("messages") as unknown as CollectionType<MessageDoc>;
            const docs = await c.find({ project_id: projectId }).toArray();
            const mapped = docs.map((d) => mapMessageDocToMessage(d as MessageDoc));
            return { data: mapped, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    getByUsers: async (userId1: string, userId2: string): Promise<DatabaseResult<Message[]>> => {
      try {
        const c = this.getCollection("messages") as unknown as CollectionType<MessageDoc>;
            const docs = await c.find({ $or: [ { sender_id: userId1, receiver_id: userId2 }, { sender_id: userId2, receiver_id: userId1 } ] }).toArray();
            const mapped = docs.map((d) => mapMessageDocToMessage(d as MessageDoc));
            return { data: mapped, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    create: async (message: Omit<Message, "id">): Promise<DatabaseResult<Message>> => {
      try {
  const c = this.getCollection("messages") as unknown as CollectionType<MessageDoc>;
  const oid = new ObjectIdRuntime!();
  const doc: MessageDoc = { _id: oid, ...message, created_at: new Date(), updated_at: new Date() } as MessageDoc;
  const res = await c.insertOne(doc);
  const inserted: MessageDoc = { ...doc, _id: res.insertedId };
  return { data: mapMessageDocToMessage(inserted), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    update: async (id: string, updates: Partial<Message>): Promise<DatabaseResult<Message>> => {
      try {
  const c = this.getCollection("messages") as unknown as CollectionType<MessageDoc>;
  const updateDoc = { ...updates, updated_at: new Date() } as Partial<MessageDoc>;
  const res = await c.findOneAndUpdate({ _id: new ObjectIdRuntime!(id) }, { $set: updateDoc }, { returnDocument: "after" });
  if (!res || !res.value) return { data: null, error: null };
  return { data: mapMessageDocToMessage(res.value as MessageDoc), error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
  const c = this.getCollection("messages") as unknown as CollectionType<MessageDoc>;
  await c.deleteOne({ _id: new ObjectIdRuntime!(id) });
        return { data: null, error: null };
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        return { data: null, error: err };
      }
    },
  };

  // --- reviews ---
  public reviews = {
    getAll: async (): Promise<DatabaseResult<Review[]>> => {
      try {
        const c = this.getCollection("reviews");
          const docs = await c.find({}).toArray();
          const mapped = docs.map((d) => mapReviewDocToReview(d as ReviewDoc));
          return { data: mapped, error: null };
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        return { data: null, error: err };
      }
    },

    getById: async (id: string): Promise<DatabaseResult<Review | null>> => {
      try {
        const c = this.getCollection("reviews");
        const doc = await c.findOne({ _id: new ObjectIdRuntime!(id) });
          if (!doc) return { data: null, error: null };
          return { data: mapReviewDocToReview(doc as ReviewDoc), error: null };
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        return { data: null, error: err };
      }
    },

    getByAgentId: async (agentId: string): Promise<DatabaseResult<Review[]>> => {
      try {
        const c = this.getCollection("reviews") as unknown as CollectionType<ReviewDoc>;
            const docs = await c.find({ agent_id: agentId }).toArray();
            const mapped = docs.map((d) => mapReviewDocToReview(d as ReviewDoc));
            return { data: mapped, error: null };
      } catch (error: unknown) {
        return logAndReturnError(error, 'MongoDBProvider');
      }
    },

    create: async (review: Omit<Review, "id">): Promise<DatabaseResult<Review>> => {
      try {
        const c = this.getCollection("reviews");
        const oid = new ObjectIdRuntime!();
          const doc: ReviewDoc = {
            _id: oid,
            // Persist the agent reference using the explicit agentId from the domain model
            agent_id: review.agentId,
            userId: review.userId,
            userName: review.userName,
            userAvatar: review.userAvatar,
            rating: review.rating,
            comment: review.comment,
            created_at: new Date(),
            updated_at: new Date(),
            helpful: review.helpful,
            response: review.response ? { from: review.response.from, message: review.response.message, date: review.response.date ? new Date(review.response.date) : undefined } : undefined,
          } as ReviewDoc;
          const res = await c.insertOne(doc);
          const inserted: ReviewDoc = { ...doc, _id: res.insertedId };
          return { data: mapReviewDocToReview(inserted), error: null };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(message);
        const err = error instanceof Error ? error : new Error(message);
        return { data: null, error: err };
      }
    },

    update: async (id: string, updates: Partial<Review>): Promise<DatabaseResult<Review>> => {
      try {
        const c = this.getCollection("reviews");
          // convert any string dates in updates.response to Date for ReviewDoc shape
          const resp = (updates as Partial<Review>).response;
          const responseDoc = resp ? { from: resp.from, message: resp.message, date: resp.date ? new Date(resp.date) : undefined } : undefined;
          const updateDoc: Partial<ReviewDoc> = { ...(updates as Partial<ReviewDoc>), updated_at: new Date(), response: responseDoc };
          const res = await c.findOneAndUpdate({ _id: new ObjectIdRuntime!(id) }, { $set: updateDoc }, { returnDocument: "after" });
          if (!res || !res.value) return { data: null, error: null };
          return { data: mapReviewDocToReview(res.value as ReviewDoc), error: null };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        return { data: null, error: err };
      }
    },

    delete: async (id: string): Promise<DatabaseResult<void>> => {
      try {
        const c = this.getCollection("reviews");
        await c.deleteOne({ _id: new ObjectIdRuntime!(id) });
        return { data: null, error: null };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        return { data: null, error: err };
      }
    },
  };
}
