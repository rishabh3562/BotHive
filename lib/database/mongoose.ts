import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { databaseConfig } from "./config";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

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
  password: string;
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

// Database Result Interface
export interface DatabaseResult<T = any> {
  data: T | null;
  error: Error | null;
}

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
    password: {
      type: String,
      required: true,
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
      default: function () {
        return `https://api.dicebear.com/7.x/avatars/svg?seed=${this.email}`;
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
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
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

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Generate refresh token method
userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    { userId: this._id.toString(), strategy: "refresh" },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
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
export const User = mongoose.model<IUser>("User", userSchema);
export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);
export const Agent = mongoose.model<IAgent>("Agent", agentSchema);
export const Review = mongoose.model<IReview>("Review", reviewSchema);
export const Project = mongoose.model<IProject>("Project", projectSchema);
export const Proposal = mongoose.model<IProposal>("Proposal", proposalSchema);
export const Message = mongoose.model<IMessage>("Message", messageSchema);

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
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    if (decoded.strategy !== strategy) {
      throw new Error("Invalid token strategy");
    }

    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
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

export type {
  IUser,
  ISubscription,
  IAgent,
  IReview,
  IProject,
  IProposal,
  IMessage,
  JWTPayload,
  UserRole,
  AuthStrategy,
};
