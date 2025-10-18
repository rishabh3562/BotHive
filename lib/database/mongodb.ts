import type {
  DatabaseProvider,
  DatabaseOperations,
  DatabaseResult,
  AuthSession,
  AuthUser,
  Profile,
} from "./types";
import { databaseConfig } from "./config";

// Only import MongoDB on the server side
let MongoClient: any;
let ObjectId: any;

if (typeof window === "undefined") {
  // Server-side only imports
  const mongodb = require("mongodb");
  MongoClient = mongodb.MongoClient;
  ObjectId = mongodb.ObjectId;
}

export class MongoDBProvider implements DatabaseProvider {
  private client: any;
  private db: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      throw new Error("MongoDB provider is server-side only");
    }

    if (!databaseConfig.mongodb?.uri) {
      throw new Error("MongoDB configuration is missing");
    }

    this.client = new MongoClient(databaseConfig.mongodb.uri);
  }

  async initialize(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(databaseConfig.mongodb?.database || "bothive");
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await this.client.close();
      console.log("Disconnected from MongoDB");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
  }

  private getCollection<T>(name: string): any {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db.collection<T>(name);
  }

  get operations(): DatabaseOperations {
    return {
      auth: {
        getSession: async (): Promise<DatabaseResult<AuthSession>> => {
          try {
            // For MongoDB, we'll need to implement session management
            // This is a simplified version - you might want to use a session store
            const sessionsCollection = this.getCollection("sessions");
            // Implementation would depend on your session management strategy
            return { data: null, error: null };
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
            const usersCollection = this.getCollection("users");

            // Check if user already exists
            const existingUser = await usersCollection.findOne({ email });
            if (existingUser) {
              throw new Error("User already exists");
            }

            // Create user document
            const userDoc = {
              _id: new ObjectId(),
              email,
              password, // In production, hash this password
              user_metadata: metadata || {},
              created_at: new Date(),
              updated_at: new Date(),
            };

            const result = await usersCollection.insertOne(userDoc);

            return {
              data: {
                user: {
                  id: result.insertedId.toString(),
                  email,
                  user_metadata: metadata || {},
                },
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
            const usersCollection = this.getCollection("users");

            const user = await usersCollection.findOne({ email, password });
            if (!user) {
              throw new Error("Invalid credentials");
            }

            return {
              data: {
                user: {
                  id: user._id.toString(),
                  email: user.email,
                  user_metadata: user.user_metadata || {},
                },
              },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        signOut: async (): Promise<DatabaseResult<void>> => {
          try {
            // Implementation would depend on your session management strategy
            return { data: null, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },

      profiles: {
        getById: async (id: string): Promise<DatabaseResult<Profile>> => {
          try {
            const profilesCollection = this.getCollection("profiles");
            const profile = await profilesCollection.findOne({
              _id: new ObjectId(id),
            });

            if (!profile) {
              throw new Error("Profile not found");
            }

            return {
              data: {
                id: profile._id.toString(),
                full_name: profile.full_name,
                role: profile.role,
                email: profile.email,
                avatar_url: profile.avatar_url,
                created_at: profile.created_at.toISOString(),
                updated_at: profile.updated_at.toISOString(),
                stripe_customer_id: profile.stripe_customer_id,
              },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        create: async (
          profile: Omit<Profile, "created_at" | "updated_at">
        ): Promise<DatabaseResult<Profile>> => {
          try {
            const profilesCollection = this.getCollection("profiles");

            const profileDoc = {
              _id: new ObjectId(profile.id),
              full_name: profile.full_name,
              role: profile.role,
              email: profile.email,
              avatar_url: profile.avatar_url,
              stripe_customer_id: profile.stripe_customer_id,
              created_at: new Date(),
              updated_at: new Date(),
            };

            const result = await profilesCollection.insertOne(profileDoc);

            return {
              data: {
                id: result.insertedId.toString(),
                full_name: profileDoc.full_name,
                role: profileDoc.role,
                email: profileDoc.email,
                avatar_url: profileDoc.avatar_url,
                created_at: profileDoc.created_at.toISOString(),
                updated_at: profileDoc.updated_at.toISOString(),
                stripe_customer_id: profileDoc.stripe_customer_id,
              },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        update: async (
          id: string,
          updates: Partial<Profile>
        ): Promise<DatabaseResult<Profile>> => {
          try {
            const profilesCollection = this.getCollection("profiles");

            const updateDoc = {
              ...updates,
              updated_at: new Date(),
            };
            delete updateDoc.id; // Remove id from updates

            const result = await profilesCollection.findOneAndUpdate(
              { _id: new ObjectId(id) },
              { $set: updateDoc },
              { returnDocument: "after" }
            );

            if (!result) {
              throw new Error("Profile not found");
            }

            return {
              data: {
                id: result._id.toString(),
                full_name: result.full_name,
                role: result.role,
                email: result.email,
                avatar_url: result.avatar_url,
                created_at: result.created_at.toISOString(),
                updated_at: result.updated_at.toISOString(),
                stripe_customer_id: result.stripe_customer_id,
              },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        delete: async (id: string): Promise<DatabaseResult<void>> => {
          try {
            const profilesCollection = this.getCollection("profiles");
            const result = await profilesCollection.deleteOne({
              _id: new ObjectId(id),
            });

            if (result.deletedCount === 0) {
              throw new Error("Profile not found");
            }

            return { data: null, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },

      subscriptions: {
        getByUserId: async (userId: string): Promise<DatabaseResult<any>> => {
          try {
            const subscriptionsCollection = this.getCollection("subscriptions");
            const subscription = await subscriptionsCollection.findOne({
              user_id: userId,
            });

            return { data: subscription, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        create: async (subscription: any): Promise<DatabaseResult<any>> => {
          try {
            const subscriptionsCollection = this.getCollection("subscriptions");
            const subscriptionDoc = {
              _id: new ObjectId(),
              ...subscription,
              created_at: new Date(),
              updated_at: new Date(),
            };

            const result = await subscriptionsCollection.insertOne(
              subscriptionDoc
            );
            return {
              data: { ...subscriptionDoc, id: result.insertedId.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        update: async (
          id: string,
          updates: any
        ): Promise<DatabaseResult<any>> => {
          try {
            const subscriptionsCollection = this.getCollection("subscriptions");
            const updateDoc = {
              ...updates,
              updated_at: new Date(),
            };

            const result = await subscriptionsCollection.findOneAndUpdate(
              { _id: new ObjectId(id) },
              { $set: updateDoc },
              { returnDocument: "after" }
            );

            return { data: result, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        delete: async (id: string): Promise<DatabaseResult<void>> => {
          try {
            const subscriptionsCollection = this.getCollection("subscriptions");
            await subscriptionsCollection.deleteOne({ _id: new ObjectId(id) });
            return { data: null, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        subscribeToChanges: (
          userId: string,
          callback: (subscription: any) => void
        ) => {
          // MongoDB doesn't have built-in real-time subscriptions like Supabase
          // You would need to implement this using MongoDB Change Streams or a separate solution
          // For now, return a no-op cleanup function
          return () => {
            // Cleanup logic for change stream subscription
          };
        },
      },

      agents: {
        getAll: async (): Promise<DatabaseResult<any[]>> => {
          try {
            const agentsCollection = this.getCollection("agents");
            const agents = await agentsCollection.find({}).toArray();
            return {
              data: agents.map((agent) => ({
                ...agent,
                id: agent._id.toString(),
              })),
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getById: async (id: string): Promise<DatabaseResult<any>> => {
          try {
            const agentsCollection = this.getCollection("agents");
            const agent = await agentsCollection.findOne({
              _id: new ObjectId(id),
            });

            if (!agent) {
              throw new Error("Agent not found");
            }

            return {
              data: { ...agent, id: agent._id.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        create: async (agent: any): Promise<DatabaseResult<any>> => {
          try {
            const agentsCollection = this.getCollection("agents");
            const agentDoc = {
              _id: new ObjectId(),
              ...agent,
              created_at: new Date(),
              updated_at: new Date(),
            };

            const result = await agentsCollection.insertOne(agentDoc);
            return {
              data: { ...agentDoc, id: result.insertedId.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        update: async (
          id: string,
          updates: any
        ): Promise<DatabaseResult<any>> => {
          try {
            const agentsCollection = this.getCollection("agents");
            const updateDoc = {
              ...updates,
              updated_at: new Date(),
            };

            const result = await agentsCollection.findOneAndUpdate(
              { _id: new ObjectId(id) },
              { $set: updateDoc },
              { returnDocument: "after" }
            );

            return {
              data: { ...result, id: result._id.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        delete: async (id: string): Promise<DatabaseResult<void>> => {
          try {
            const agentsCollection = this.getCollection("agents");
            await agentsCollection.deleteOne({ _id: new ObjectId(id) });
            return { data: null, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },

      projects: {
        getAll: async (): Promise<DatabaseResult<any[]>> => {
          try {
            const projectsCollection = this.getCollection("projects");
            const projects = await projectsCollection.find({}).toArray();
            return {
              data: projects.map((project) => ({
                ...project,
                id: project._id.toString(),
              })),
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getById: async (id: string): Promise<DatabaseResult<any>> => {
          try {
            const projectsCollection = this.getCollection("projects");
            const project = await projectsCollection.findOne({
              _id: new ObjectId(id),
            });

            if (!project) {
              throw new Error("Project not found");
            }

            return {
              data: { ...project, id: project._id.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getByRecruiterId: async (
          recruiterId: string
        ): Promise<DatabaseResult<any[]>> => {
          try {
            const projectsCollection = this.getCollection("projects");
            const projects = await projectsCollection
              .find({ recruiter_id: recruiterId })
              .toArray();
            return {
              data: projects.map((project) => ({
                ...project,
                id: project._id.toString(),
              })),
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        create: async (project: any): Promise<DatabaseResult<any>> => {
          try {
            const projectsCollection = this.getCollection("projects");
            const projectDoc = {
              _id: new ObjectId(),
              ...project,
              created_at: new Date(),
              updated_at: new Date(),
            };

            const result = await projectsCollection.insertOne(projectDoc);
            return {
              data: { ...projectDoc, id: result.insertedId.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        update: async (
          id: string,
          updates: any
        ): Promise<DatabaseResult<any>> => {
          try {
            const projectsCollection = this.getCollection("projects");
            const updateDoc = {
              ...updates,
              updated_at: new Date(),
            };

            const result = await projectsCollection.findOneAndUpdate(
              { _id: new ObjectId(id) },
              { $set: updateDoc },
              { returnDocument: "after" }
            );

            return {
              data: { ...result, id: result._id.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        delete: async (id: string): Promise<DatabaseResult<void>> => {
          try {
            const projectsCollection = this.getCollection("projects");
            await projectsCollection.deleteOne({ _id: new ObjectId(id) });
            return { data: null, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },

      messages: {
        getAll: async (): Promise<DatabaseResult<any[]>> => {
          try {
            const messagesCollection = this.getCollection("messages");
            const messages = await messagesCollection.find({}).toArray();
            return {
              data: messages.map((message) => ({
                ...message,
                id: message._id.toString(),
              })),
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getById: async (id: string): Promise<DatabaseResult<any>> => {
          try {
            const messagesCollection = this.getCollection("messages");
            const message = await messagesCollection.findOne({
              _id: new ObjectId(id),
            });

            if (!message) {
              throw new Error("Message not found");
            }

            return {
              data: { ...message, id: message._id.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getByProjectId: async (
          projectId: string
        ): Promise<DatabaseResult<any[]>> => {
          try {
            const messagesCollection = this.getCollection("messages");
            const messages = await messagesCollection
              .find({ project_id: projectId })
              .toArray();
            return {
              data: messages.map((message) => ({
                ...message,
                id: message._id.toString(),
              })),
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getByUsers: async (
          userId1: string,
          userId2: string
        ): Promise<DatabaseResult<any[]>> => {
          try {
            const messagesCollection = this.getCollection("messages");
            const messages = await messagesCollection
              .find({
                $or: [
                  { sender_id: userId1, receiver_id: userId2 },
                  { sender_id: userId2, receiver_id: userId1 },
                ],
              })
              .toArray();
            return {
              data: messages.map((message) => ({
                ...message,
                id: message._id.toString(),
              })),
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        create: async (message: any): Promise<DatabaseResult<any>> => {
          try {
            const messagesCollection = this.getCollection("messages");
            const messageDoc = {
              _id: new ObjectId(),
              ...message,
              created_at: new Date(),
              updated_at: new Date(),
            };

            const result = await messagesCollection.insertOne(messageDoc);
            return {
              data: { ...messageDoc, id: result.insertedId.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        update: async (
          id: string,
          updates: any
        ): Promise<DatabaseResult<any>> => {
          try {
            const messagesCollection = this.getCollection("messages");
            const updateDoc = {
              ...updates,
              updated_at: new Date(),
            };

            const result = await messagesCollection.findOneAndUpdate(
              { _id: new ObjectId(id) },
              { $set: updateDoc },
              { returnDocument: "after" }
            );

            return {
              data: { ...result, id: result._id.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        delete: async (id: string): Promise<DatabaseResult<void>> => {
          try {
            const messagesCollection = this.getCollection("messages");
            await messagesCollection.deleteOne({ _id: new ObjectId(id) });
            return { data: null, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },

      reviews: {
        getAll: async (): Promise<DatabaseResult<any[]>> => {
          try {
            const reviewsCollection = this.getCollection("reviews");
            const reviews = await reviewsCollection.find({}).toArray();
            return {
              data: reviews.map((review) => ({
                ...review,
                id: review._id.toString(),
              })),
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getById: async (id: string): Promise<DatabaseResult<any>> => {
          try {
            const reviewsCollection = this.getCollection("reviews");
            const review = await reviewsCollection.findOne({
              _id: new ObjectId(id),
            });

            if (!review) {
              throw new Error("Review not found");
            }

            return {
              data: { ...review, id: review._id.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        getByAgentId: async (
          agentId: string
        ): Promise<DatabaseResult<any[]>> => {
          try {
            const reviewsCollection = this.getCollection("reviews");
            const reviews = await reviewsCollection
              .find({ agent_id: agentId })
              .toArray();
            return {
              data: reviews.map((review) => ({
                ...review,
                id: review._id.toString(),
              })),
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        create: async (review: any): Promise<DatabaseResult<any>> => {
          try {
            const reviewsCollection = this.getCollection("reviews");
            const reviewDoc = {
              _id: new ObjectId(),
              ...review,
              created_at: new Date(),
              updated_at: new Date(),
            };

            const result = await reviewsCollection.insertOne(reviewDoc);
            return {
              data: { ...reviewDoc, id: result.insertedId.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        update: async (
          id: string,
          updates: any
        ): Promise<DatabaseResult<any>> => {
          try {
            const reviewsCollection = this.getCollection("reviews");
            const updateDoc = {
              ...updates,
              updated_at: new Date(),
            };

            const result = await reviewsCollection.findOneAndUpdate(
              { _id: new ObjectId(id) },
              { $set: updateDoc },
              { returnDocument: "after" }
            );

            return {
              data: { ...result, id: result._id.toString() },
              error: null,
            };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },

        delete: async (id: string): Promise<DatabaseResult<void>> => {
          try {
            const reviewsCollection = this.getCollection("reviews");
            await reviewsCollection.deleteOne({ _id: new ObjectId(id) });
            return { data: null, error: null };
          } catch (error) {
            return { data: null, error: error as Error };
          }
        },
      },
    };
  }
}
