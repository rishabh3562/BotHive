import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { databaseConfig } from "./config";
import type { DatabaseResult } from "./types";

// JWT Configuration
const JWT_SECRET: string = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_SECRET: string =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

// Authentication Strategy
export type AuthStrategy = "cookie" | "bearer";

// User Roles
export type UserRole = "builder" | "recruiter" | "admin";

// Base Document Interface
export interface BaseDocument extends Document {
  created_at: Date;
  updated_at: Date;
}

// User Interface
export interface IUser extends BaseDocument {
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  stripe_customer_id?: string;
  is_verified: boolean;
  last_login?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(strategy: AuthStrategy): Promise<string>;
  generateRefreshToken(): string;
}

// Subscription Interface
export interface ISubscription extends BaseDocument {
  user_id: mongoose.Types.ObjectId;
  tier: string;
  status: string;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  trial_end?: Date;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

// Agent Interface
export interface IAgent extends BaseDocument {
  title: string;
  description: string;
  price: number;
  builder_id: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  rating: number;
  reviews_count: number;
  status: string;
}

// Review Interface
export interface IReview extends BaseDocument {
  agent_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  helpful_count: number;
}

// Project Interface
export interface IProject extends BaseDocument {
  title: string;
  description: string;
  budget: number;
  duration: string;
  status: string;
  recruiter_id: mongoose.Types.ObjectId;
  category: string;
  requirements: string[];
  skills: string[];
  deadline: Date;
}

// Proposal Interface
export interface IProposal extends BaseDocument {
  project_id: mongoose.Types.ObjectId;
  builder_id: mongoose.Types.ObjectId;
  amount: number;
  duration: string;
  cover_letter: string;
  status: string;
}

// Message Interface
export interface IMessage extends BaseDocument {
  sender_id: mongoose.Types.ObjectId;
  receiver_id: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  project_id?: mongoose.Types.ObjectId;
}

// JWT Payload Interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  strategy: AuthStrategy;
}

// Use shared DatabaseResult from lib/database/types.ts to avoid duplicate public types

// User Schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // store hashed password in the DB as `password_hash` to avoid implying
    // plaintext storage
    // Note: Not marked as required here because the pre-save hook sets it
    password_hash: {
      type: String,
      minlength: 6,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["builder", "recruiter", "admin"],
      required: true,
    },
    avatar_url: {
      type: String,
      default: function (this: IUser) {
        // Avoid leaking raw email (PII) to Dicebear by hashing the email
        // into a deterministic non-PII seed. Use first 16 hex chars of SHA-256.
        try {
          const seed = crypto
            .createHash("sha256")
            .update(String(this.email || ""))
            .digest("hex")
            .slice(0, 16);
          return `https://api.dicebear.com/7.x/avatars/svg?seed=${seed}`;
        } catch (err) {
          // Fallback: don't include email-derived seed if hashing fails
          return `https://api.dicebear.com/7.x/avatars/svg?seed=anonymous`;
        }
      },
    },
    stripe_customer_id: String,
    is_verified: {
      type: Boolean,
      default: false,
    },
    last_login: Date,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      transform: function (doc, ret) {
        // Remove password_hash from JSON output for security
        delete (ret as any).password_hash;
        return ret;
      },
    },
  }
);

// Allow a virtual `password` field for setting a plaintext password; the
// value will be hashed into `password_hash` before persisting.
userSchema.virtual("password").set(function (this: IUser, pwd: string) {
  // store on a temporary property so pre-save can detect and hash it
  (this as any)._password = pwd;
});

// Hash password before saving if a plaintext password was provided
userSchema.pre("save", async function (next) {
  const self = this as any;

  // If _password is set (from virtual setter), hash it
  if (self._password) {
    try {
      const salt = await bcrypt.genSalt(12);
      self.password_hash = await bcrypt.hash(self._password, salt);
      // remove temporary field
      delete self._password;
      return next();
    } catch (error) {
      return next(error as Error);
    }
  }

  // If password_hash is already set (e.g., from direct assignment), skip hashing
  if (self.password_hash) {
    return next();
  }

  // If neither _password nor password_hash is set, this is an error
  return next(new Error("Password is required"));
});

// Compare password method against the stored hash
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const passwordHash = (this as any).password_hash;
  if (!passwordHash) {
    throw new Error("User has no password hash");
  }
  return bcrypt.compare(candidatePassword, passwordHash);
};

// Generate auth token method
userSchema.methods.generateAuthToken = async function (
  strategy: AuthStrategy
): Promise<string> {
  const payload: JWTPayload = {
    userId: this._id.toString(),
    email: this.email,
    role: this.role,
    strategy,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

// Generate refresh token method
userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    { userId: this._id.toString(), strategy: "refresh" },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );
};

// Subscription Schema
const subscriptionSchema = new Schema<ISubscription>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tier: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    current_period_end: {
      type: Date,
      required: true,
    },
    cancel_at_period_end: {
      type: Boolean,
      default: false,
    },
    trial_end: Date,
    stripe_customer_id: String,
    stripe_subscription_id: String,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Agent Schema
const agentSchema = new Schema<IAgent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    builder_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews_count: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Review Schema
const reviewSchema = new Schema<IReview>(
  {
    agent_id: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    helpful_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Project Schema
const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open",
    },
    recruiter_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    deadline: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Proposal Schema
const proposalSchema = new Schema<IProposal>(
  {
    project_id: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    builder_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,
      required: true,
    },
    cover_letter: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Message Schema
const messageSchema = new Schema<IMessage>(
  {
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    project_id: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Create models
// IMPORTANT: Check if models already exist to prevent "Cannot overwrite model" error in Next.js dev mode
export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);
export const Agent = mongoose.models.Agent || mongoose.model<IAgent>("Agent", agentSchema);
export const Review = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
export const Project = mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);
export const Proposal = mongoose.models.Proposal || mongoose.model<IProposal>("Proposal", proposalSchema);
export const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

// Database connection
let isConnected = false;

export async function connectToDatabase(): Promise<void> {
  if (isConnected) return;

  try {
    if (!databaseConfig.mongodb?.uri) {
      throw new Error("MongoDB URI is not configured");
    }

    await mongoose.connect(databaseConfig.mongodb.uri);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
    throw error;
  }
}

// JWT verification function
export function verifyToken(token: string, strategy: AuthStrategy): JWTPayload {
  let decoded: JWTPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }

  if (decoded.strategy !== strategy) {
    throw new Error("Invalid token strategy");
  }

  return decoded;
}

// Refresh token verification
export function verifyRefreshToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as {
      userId: string;
      strategy: string;
    };

    if (decoded.strategy !== "refresh") {
      throw new Error("Invalid refresh token");
    }

    return { userId: decoded.userId };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
}

// RBAC middleware helper
export function checkRole(allowedRoles: UserRole[]): (user: IUser) => boolean {
  return (user: IUser) => {
    return allowedRoles.includes(user.role);
  };
}

// Export all models and utilities
export const models = {
  User,
  Subscription,
  Agent,
  Review,
  Project,
  Proposal,
  Message,
};

export const auth = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  verifyToken,
  verifyRefreshToken,
  checkRole,
};
