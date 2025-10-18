import {
  User,
  Subscription,
  Agent,
  Review,
  Project,
  Proposal,
  Message,
  connectToDatabase,
  disconnectFromDatabase,
  verifyToken,
  verifyRefreshToken,
  checkRole,
  type IUser,
  type ISubscription,
  type IAgent,
  type IReview,
  type IProject,
  type IProposal,
  type IMessage,
  type JWTPayload,
  type UserRole,
  type AuthStrategy,
  type DatabaseResult,
} from "./mongoose";

// Authentication operations
export const authOperations = {
  // Sign up a new user
  async signUp(
    email: string,
    password: string,
    full_name: string,
    role: UserRole,
    strategy: AuthStrategy = "bearer"
  ): Promise<
    DatabaseResult<{ user: IUser; token: string; refreshToken: string }>
  > {
    try {
      await connectToDatabase();

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { data: null, error: new Error("User already exists") };
      }

      // Create new user
      const user = new User({
        email,
        password,
        full_name,
        role,
      });

      await user.save();

      // Generate tokens
      const token = await user.generateAuthToken(strategy);
      const refreshToken = user.generateRefreshToken();

      return {
        data: { user, token, refreshToken },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Sign in user
  async signIn(
    email: string,
    password: string,
    strategy: AuthStrategy = "bearer"
  ): Promise<
    DatabaseResult<{ user: IUser; token: string; refreshToken: string }>
  > {
    try {
      await connectToDatabase();

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return { data: null, error: new Error("Invalid credentials") };
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return { data: null, error: new Error("Invalid credentials") };
      }

      // Update last login
      user.last_login = new Date();
      await user.save();

      // Generate tokens
      const token = await user.generateAuthToken(strategy);
      const refreshToken = user.generateRefreshToken();

      return {
        data: { user, token, refreshToken },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Verify token and get user
  async verifyToken(
    token: string,
    strategy: AuthStrategy
  ): Promise<DatabaseResult<IUser>> {
    try {
      await connectToDatabase();

      const payload = verifyToken(token, strategy);
      const user = await User.findById(payload.userId);

      if (!user) {
        return { data: null, error: new Error("User not found") };
      }

      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Refresh token
  async refreshToken(
    refreshToken: string,
    strategy: AuthStrategy
  ): Promise<DatabaseResult<{ token: string; refreshToken: string }>> {
    try {
      await connectToDatabase();

      const payload = verifyRefreshToken(refreshToken);
      const user = await User.findById(payload.userId);

      if (!user) {
        return { data: null, error: new Error("User not found") };
      }

      const newToken = await user.generateAuthToken(strategy);
      const newRefreshToken = user.generateRefreshToken();

      return {
        data: { token: newToken, refreshToken: newRefreshToken },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<DatabaseResult<IUser>> {
    try {
      await connectToDatabase();
      const user = await User.findById(id);

      if (!user) {
        return { data: null, error: new Error("User not found") };
      }

      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Update user
  async updateUser(
    id: string,
    updates: Partial<IUser>
  ): Promise<DatabaseResult<IUser>> {
    try {
      await connectToDatabase();
      const user = await User.findByIdAndUpdate(id, updates, { new: true });

      if (!user) {
        return { data: null, error: new Error("User not found") };
      }

      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};

// User operations
export const userOperations = {
  // Get all users (admin only)
  async getAll(): Promise<DatabaseResult<IUser[]>> {
    try {
      await connectToDatabase();
      const users = await User.find().select("-password");
      return { data: users, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get user by ID
  async getById(id: string): Promise<DatabaseResult<IUser>> {
    try {
      await connectToDatabase();
      const user = await User.findById(id).select("-password");

      if (!user) {
        return { data: null, error: new Error("User not found") };
      }

      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Create user
  async create(
    userData: Omit<IUser, "_id" | "created_at" | "updated_at">
  ): Promise<DatabaseResult<IUser>> {
    try {
      await connectToDatabase();
      const user = new User(userData);
      await user.save();
      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Update user
  async update(
    id: string,
    updates: Partial<IUser>
  ): Promise<DatabaseResult<IUser>> {
    try {
      await connectToDatabase();
      const user = await User.findByIdAndUpdate(id, updates, {
        new: true,
      }).select("-password");

      if (!user) {
        return { data: null, error: new Error("User not found") };
      }

      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Delete user
  async delete(id: string): Promise<DatabaseResult<void>> {
    try {
      await connectToDatabase();
      const result = await User.findByIdAndDelete(id);

      if (!result) {
        return { data: null, error: new Error("User not found") };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};

// Subscription operations
export const subscriptionOperations = {
  // Get subscription by user ID
  async getByUserId(userId: string): Promise<DatabaseResult<ISubscription>> {
    try {
      await connectToDatabase();
      const subscription = await Subscription.findOne({ user_id: userId });
      return { data: subscription, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Create subscription
  async create(
    subscriptionData: Omit<ISubscription, "_id" | "created_at" | "updated_at">
  ): Promise<DatabaseResult<ISubscription>> {
    try {
      await connectToDatabase();
      const subscription = new Subscription(subscriptionData);
      await subscription.save();
      return { data: subscription, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Update subscription
  async update(
    id: string,
    updates: Partial<ISubscription>
  ): Promise<DatabaseResult<ISubscription>> {
    try {
      await connectToDatabase();
      const subscription = await Subscription.findByIdAndUpdate(id, updates, {
        new: true,
      });

      if (!subscription) {
        return { data: null, error: new Error("Subscription not found") };
      }

      return { data: subscription, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Delete subscription
  async delete(id: string): Promise<DatabaseResult<void>> {
    try {
      await connectToDatabase();
      const result = await Subscription.findByIdAndDelete(id);

      if (!result) {
        return { data: null, error: new Error("Subscription not found") };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};

// Agent operations
export const agentOperations = {
  // Get all agents
  async getAll(): Promise<DatabaseResult<IAgent[]>> {
    try {
      await connectToDatabase();
      const agents = await Agent.find({ status: "approved" }).populate(
        "builder_id",
        "full_name email"
      );
      return { data: agents, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get agent by ID
  async getById(id: string): Promise<DatabaseResult<IAgent>> {
    try {
      await connectToDatabase();
      const agent = await Agent.findById(id).populate(
        "builder_id",
        "full_name email"
      );

      if (!agent) {
        return { data: null, error: new Error("Agent not found") };
      }

      return { data: agent, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get agents by builder ID
  async getByBuilderId(builderId: string): Promise<DatabaseResult<IAgent[]>> {
    try {
      await connectToDatabase();
      const agents = await Agent.find({ builder_id: builderId }).populate(
        "builder_id",
        "full_name email"
      );
      return { data: agents, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Create agent
  async create(
    agentData: Omit<IAgent, "_id" | "created_at" | "updated_at">
  ): Promise<DatabaseResult<IAgent>> {
    try {
      await connectToDatabase();
      const agent = new Agent(agentData);
      await agent.save();
      return { data: agent, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Update agent
  async update(
    id: string,
    updates: Partial<IAgent>
  ): Promise<DatabaseResult<IAgent>> {
    try {
      await connectToDatabase();
      const agent = await Agent.findByIdAndUpdate(id, updates, {
        new: true,
      }).populate("builder_id", "full_name email");

      if (!agent) {
        return { data: null, error: new Error("Agent not found") };
      }

      return { data: agent, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Delete agent
  async delete(id: string): Promise<DatabaseResult<void>> {
    try {
      await connectToDatabase();
      const result = await Agent.findByIdAndDelete(id);

      if (!result) {
        return { data: null, error: new Error("Agent not found") };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};

// Review operations
export const reviewOperations = {
  // Get all reviews
  async getAll(): Promise<DatabaseResult<IReview[]>> {
    try {
      await connectToDatabase();
      const reviews = await Review.find()
        .populate("user_id", "full_name")
        .populate("agent_id", "title");
      return { data: reviews, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get review by ID
  async getById(id: string): Promise<DatabaseResult<IReview>> {
    try {
      await connectToDatabase();
      const review = await Review.findById(id)
        .populate("user_id", "full_name")
        .populate("agent_id", "title");

      if (!review) {
        return { data: null, error: new Error("Review not found") };
      }

      return { data: review, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get reviews by agent ID
  async getByAgentId(agentId: string): Promise<DatabaseResult<IReview[]>> {
    try {
      await connectToDatabase();
      const reviews = await Review.find({ agent_id: agentId })
        .populate("user_id", "full_name")
        .populate("agent_id", "title");
      return { data: reviews, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Create review
  async create(
    reviewData: Omit<IReview, "_id" | "created_at" | "updated_at">
  ): Promise<DatabaseResult<IReview>> {
    try {
      await connectToDatabase();
      const review = new Review(reviewData);
      await review.save();

      // Update agent rating
      await this.updateAgentRating(reviewData.agent_id.toString());

      return { data: review, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Update review
  async update(
    id: string,
    updates: Partial<IReview>
  ): Promise<DatabaseResult<IReview>> {
    try {
      await connectToDatabase();
      const review = await Review.findByIdAndUpdate(id, updates, { new: true })
        .populate("user_id", "full_name")
        .populate("agent_id", "title");

      if (!review) {
        return { data: null, error: new Error("Review not found") };
      }

      // Update agent rating
      await this.updateAgentRating(review.agent_id.toString());

      return { data: review, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Delete review
  async delete(id: string): Promise<DatabaseResult<void>> {
    try {
      await connectToDatabase();
      const review = await Review.findById(id);

      if (!review) {
        return { data: null, error: new Error("Review not found") };
      }

      await Review.findByIdAndDelete(id);

      // Update agent rating
      await this.updateAgentRating(review.agent_id.toString());

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Helper method to update agent rating
  async updateAgentRating(agentId: string): Promise<void> {
    const reviews = await Review.find({ agent_id: agentId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await Agent.findByIdAndUpdate(agentId, {
      rating: averageRating,
      reviews_count: reviews.length,
    });
  },
};

// Project operations
export const projectOperations = {
  // Get all projects
  async getAll(): Promise<DatabaseResult<IProject[]>> {
    try {
      await connectToDatabase();
      const projects = await Project.find().populate(
        "recruiter_id",
        "full_name email"
      );
      return { data: projects, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get project by ID
  async getById(id: string): Promise<DatabaseResult<IProject>> {
    try {
      await connectToDatabase();
      const project = await Project.findById(id).populate(
        "recruiter_id",
        "full_name email"
      );

      if (!project) {
        return { data: null, error: new Error("Project not found") };
      }

      return { data: project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get projects by recruiter ID
  async getByRecruiterId(
    recruiterId: string
  ): Promise<DatabaseResult<IProject[]>> {
    try {
      await connectToDatabase();
      const projects = await Project.find({
        recruiter_id: recruiterId,
      }).populate("recruiter_id", "full_name email");
      return { data: projects, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Create project
  async create(
    projectData: Omit<IProject, "_id" | "created_at" | "updated_at">
  ): Promise<DatabaseResult<IProject>> {
    try {
      await connectToDatabase();
      const project = new Project(projectData);
      await project.save();
      return { data: project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Update project
  async update(
    id: string,
    updates: Partial<IProject>
  ): Promise<DatabaseResult<IProject>> {
    try {
      await connectToDatabase();
      const project = await Project.findByIdAndUpdate(id, updates, {
        new: true,
      }).populate("recruiter_id", "full_name email");

      if (!project) {
        return { data: null, error: new Error("Project not found") };
      }

      return { data: project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Delete project
  async delete(id: string): Promise<DatabaseResult<void>> {
    try {
      await connectToDatabase();
      const result = await Project.findByIdAndDelete(id);

      if (!result) {
        return { data: null, error: new Error("Project not found") };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};

// Proposal operations
export const proposalOperations = {
  // Get all proposals
  async getAll(): Promise<DatabaseResult<IProposal[]>> {
    try {
      await connectToDatabase();
      const proposals = await Proposal.find()
        .populate("project_id", "title")
        .populate("builder_id", "full_name email");
      return { data: proposals, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get proposal by ID
  async getById(id: string): Promise<DatabaseResult<IProposal>> {
    try {
      await connectToDatabase();
      const proposal = await Proposal.findById(id)
        .populate("project_id", "title")
        .populate("builder_id", "full_name email");

      if (!proposal) {
        return { data: null, error: new Error("Proposal not found") };
      }

      return { data: proposal, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get proposals by project ID
  async getByProjectId(
    projectId: string
  ): Promise<DatabaseResult<IProposal[]>> {
    try {
      await connectToDatabase();
      const proposals = await Proposal.find({ project_id: projectId })
        .populate("project_id", "title")
        .populate("builder_id", "full_name email");
      return { data: proposals, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get proposals by builder ID
  async getByBuilderId(
    builderId: string
  ): Promise<DatabaseResult<IProposal[]>> {
    try {
      await connectToDatabase();
      const proposals = await Proposal.find({ builder_id: builderId })
        .populate("project_id", "title")
        .populate("builder_id", "full_name email");
      return { data: proposals, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Create proposal
  async create(
    proposalData: Omit<IProposal, "_id" | "created_at" | "updated_at">
  ): Promise<DatabaseResult<IProposal>> {
    try {
      await connectToDatabase();
      const proposal = new Proposal(proposalData);
      await proposal.save();
      return { data: proposal, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Update proposal
  async update(
    id: string,
    updates: Partial<IProposal>
  ): Promise<DatabaseResult<IProposal>> {
    try {
      await connectToDatabase();
      const proposal = await Proposal.findByIdAndUpdate(id, updates, {
        new: true,
      })
        .populate("project_id", "title")
        .populate("builder_id", "full_name email");

      if (!proposal) {
        return { data: null, error: new Error("Proposal not found") };
      }

      return { data: proposal, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Delete proposal
  async delete(id: string): Promise<DatabaseResult<void>> {
    try {
      await connectToDatabase();
      const result = await Proposal.findByIdAndDelete(id);

      if (!result) {
        return { data: null, error: new Error("Proposal not found") };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};

// Message operations
export const messageOperations = {
  // Get all messages
  async getAll(): Promise<DatabaseResult<IMessage[]>> {
    try {
      await connectToDatabase();
      const messages = await Message.find()
        .populate("sender_id", "full_name")
        .populate("receiver_id", "full_name");
      return { data: messages, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get message by ID
  async getById(id: string): Promise<DatabaseResult<IMessage>> {
    try {
      await connectToDatabase();
      const message = await Message.findById(id)
        .populate("sender_id", "full_name")
        .populate("receiver_id", "full_name");

      if (!message) {
        return { data: null, error: new Error("Message not found") };
      }

      return { data: message, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get messages by project ID
  async getByProjectId(projectId: string): Promise<DatabaseResult<IMessage[]>> {
    try {
      await connectToDatabase();
      const messages = await Message.find({ project_id: projectId })
        .populate("sender_id", "full_name")
        .populate("receiver_id", "full_name");
      return { data: messages, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get messages between two users
  async getByUsers(
    userId1: string,
    userId2: string
  ): Promise<DatabaseResult<IMessage[]>> {
    try {
      await connectToDatabase();
      const messages = await Message.find({
        $or: [
          { sender_id: userId1, receiver_id: userId2 },
          { sender_id: userId2, receiver_id: userId1 },
        ],
      })
        .populate("sender_id", "full_name")
        .populate("receiver_id", "full_name");
      return { data: messages, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Create message
  async create(
    messageData: Omit<IMessage, "_id" | "created_at" | "updated_at">
  ): Promise<DatabaseResult<IMessage>> {
    try {
      await connectToDatabase();
      const message = new Message(messageData);
      await message.save();
      return { data: message, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Update message
  async update(
    id: string,
    updates: Partial<IMessage>
  ): Promise<DatabaseResult<IMessage>> {
    try {
      await connectToDatabase();
      const message = await Message.findByIdAndUpdate(id, updates, {
        new: true,
      })
        .populate("sender_id", "full_name")
        .populate("receiver_id", "full_name");

      if (!message) {
        return { data: null, error: new Error("Message not found") };
      }

      return { data: message, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Delete message
  async delete(id: string): Promise<DatabaseResult<void>> {
    try {
      await connectToDatabase();
      const result = await Message.findByIdAndDelete(id);

      if (!result) {
        return { data: null, error: new Error("Message not found") };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Mark message as read
  async markAsRead(id: string): Promise<DatabaseResult<IMessage>> {
    try {
      await connectToDatabase();
      const message = await Message.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      )
        .populate("sender_id", "full_name")
        .populate("receiver_id", "full_name");

      if (!message) {
        return { data: null, error: new Error("Message not found") };
      }

      return { data: message, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};

// Export all operations
export const dbOperations = {
  auth: authOperations,
  users: userOperations,
  subscriptions: subscriptionOperations,
  agents: agentOperations,
  reviews: reviewOperations,
  projects: projectOperations,
  proposals: proposalOperations,
  messages: messageOperations,
};

// Export utility functions
export {
  connectToDatabase,
  disconnectFromDatabase,
  verifyToken,
  verifyRefreshToken,
  checkRole,
};

// Export types
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
  DatabaseResult,
};
