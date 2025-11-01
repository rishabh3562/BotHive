import type {
	DatabaseResult,
	AuthSession,
	AuthUser,
	Profile,
} from "./types";

import type { Subscription, AIAgent, Project, Message, Review } from "../types";

// DatabaseAdapter defines the shape of the database wrapper used by the app.
// Method names mirror the project's `DatabaseOperations` but each method
// returns a Promise<DatabaseResult<T>> with concrete types.
export interface DatabaseAdapter {
	/**
	 * Authentication-related operations.
	 * These methods wrap the underlying auth provider (e.g. Supabase) and
	 * return a DatabaseResult containing either the expected value or an Error.
	 */
	auth: {
		/**
		 * Gets the current authentication session, if any.
		 * @returns DatabaseResult containing the AuthSession or null when unauthenticated.
		 */
		getSession(): Promise<DatabaseResult<AuthSession | null>>;

		/**
		 * Registers a new user with email/password and optional metadata.
		 * @param email - User email address
		 * @param password - User password
		 * @param metadata - Optional arbitrary user metadata stored by the provider
		 * @returns DatabaseResult containing the created AuthUser or null.
		 */
		signUp(
			email: string,
			password: string,
			metadata?: Record<string, unknown>
		): Promise<DatabaseResult<AuthUser | null>>;

		/**
		 * Signs a user in using email and password credentials.
		 * @param email - User email
		 * @param password - User password
		 * @returns DatabaseResult containing the AuthSession with user and access_token.
		 */
		signIn(email: string, password: string): Promise<DatabaseResult<AuthSession | null>>;

		/**
		 * Signs the current user out.
		 * @returns DatabaseResult<void> indicating success or error.
		 */
		signOut(): Promise<DatabaseResult<void>>;
	};

	/**
	 * Profile-related operations for user profile CRUD.
	 */
	profiles: {
		/**
		 * Gets a single profile by its ID.
		 * @param id - Profile id
		 * @returns DatabaseResult containing the Profile or null if not found.
		 */
		getById(id: string): Promise<DatabaseResult<Profile | null>>;

		/**
		 * Creates a new profile. The caller must not provide id or timestamp fields.
		 * @param profile - Profile payload (without id/created_at/updated_at)
		 * @returns DatabaseResult containing the created Profile.
		 */
		create(profile: Omit<Profile, "id" | "created_at" | "updated_at">): Promise<DatabaseResult<Profile>>;

		/**
		 * Updates fields of an existing profile.
		 * @param id - Profile id to update
		 * @param updates - Partial profile fields to apply
		 * @returns DatabaseResult containing the updated Profile.
		 */
		update(id: string, updates: Partial<Profile>): Promise<DatabaseResult<Profile>>;

		/**
		 * Deletes a profile by id.
		 * @param id - Profile id to delete
		 * @returns DatabaseResult<void> indicating success or error.
		 */
		delete(id: string): Promise<DatabaseResult<void>>;
	};

	/**
	 * Subscription-related operations (e.g., billing / feature subscriptions).
	 */
	subscriptions: {
		/**
		 * Gets the subscription for a given user id.
		 * @param userId - User id to lookup
		 * @returns DatabaseResult containing the Subscription or null when none exists.
		 */
		getByUserId(userId: string): Promise<DatabaseResult<Subscription | null>>;

		/**
		 * Creates a new subscription record (id assigned by the database).
		 * @param subscription - Subscription payload without id
		 * @returns DatabaseResult containing the created Subscription.
		 */
		create(subscription: Omit<Subscription, "id">): Promise<DatabaseResult<Subscription>>;

		/**
		 * Updates an existing subscription by id.
		 * @param id - Subscription id to update
		 * @param updates - Partial subscription fields to apply
		 * @returns DatabaseResult containing the updated Subscription.
		 */
		update(id: string, updates: Partial<Subscription>): Promise<DatabaseResult<Subscription>>;

		/**
		 * Deletes a subscription by id.
		 * @param id - Subscription id to delete
		 * @returns DatabaseResult<void> indicating success or error.
		 */
		delete(id: string): Promise<DatabaseResult<void>>;

		/**
		 * Subscribes to realtime changes for the subscriptions table filtered by userId.
		 * The callback is invoked with the updated Subscription whenever a relevant
		 * change is observed. The returned DatabaseResult contains an unsubscribe
		 * function which must be called to stop receiving events.
		 *
		 * @param userId - User id to scope subscription events
		 * @param callback - Function invoked with the updated Subscription payload
		 * @returns DatabaseResult containing an unsubscribe function.
		 */
		subscribeToChanges(
			userId: string,
			callback: (subscription: Subscription) => void
		): Promise<DatabaseResult<() => void>>;
	};

	/**
	 * AI Agent CRUD and lookup operations.
	 */
	agents: {
		/**
		 * Returns all agents available in the system.
		 * @returns DatabaseResult containing an array of agents (may be empty).
		 */
		getAll(): Promise<DatabaseResult<AIAgent[]>>;

		/**
		 * Gets a single agent by id.
		 * @param id - Agent id
		 * @returns DatabaseResult containing the agent or null if not found.
		 */
		getById(id: string): Promise<DatabaseResult<AIAgent | null>>;

		/**
		 * Creates a new agent record.
		 * @param agent - Agent payload without id
		 * @returns DatabaseResult containing the created agent.
		 */
		create(agent: Omit<AIAgent, "id">): Promise<DatabaseResult<AIAgent>>;

		/**
		 * Updates an existing agent.
		 * @param id - Agent id
		 * @param updates - Partial agent fields to apply
		 * @returns DatabaseResult containing the updated agent.
		 */
		update(id: string, updates: Partial<AIAgent>): Promise<DatabaseResult<AIAgent>>;

		/**
		 * Deletes an agent by id.
		 * @param id - Agent id to delete
		 * @returns DatabaseResult<void> indicating success or error.
		 */
		delete(id: string): Promise<DatabaseResult<void>>;
	};

	/**
	 * Project CRUD and lookup operations.
	 */
	projects: {
		/**
		 * Returns all projects.
		 * @returns DatabaseResult containing an array of projects.
		 */
		getAll(): Promise<DatabaseResult<Project[]>>;

		/**
		 * Gets a single project by id.
		 * @param id - Project id
		 * @returns DatabaseResult containing the Project or null.
		 */
		getById(id: string): Promise<DatabaseResult<Project | null>>;

		/**
		 * Gets projects owned/created by a specific recruiter.
		 * @param recruiterId - Recruiter id to filter projects
		 * @returns DatabaseResult containing an array of matching projects.
		 */
		getByRecruiterId(recruiterId: string): Promise<DatabaseResult<Project[]>>;

		/**
		 * Creates a new project record.
		 * @param project - Project payload without id
		 * @returns DatabaseResult containing the created Project.
		 */
		create(project: Omit<Project, "id">): Promise<DatabaseResult<Project>>;

		/**
		 * Updates an existing project by id.
		 * @param id - Project id
		 * @param updates - Partial project fields to apply
		 * @returns DatabaseResult containing the updated Project.
		 */
		update(id: string, updates: Partial<Project>): Promise<DatabaseResult<Project>>;

		/**
		 * Deletes a project by id.
		 * @param id - Project id to delete
		 * @returns DatabaseResult<void> indicating success or error.
		 */
		delete(id: string): Promise<DatabaseResult<void>>;
	};

	/**
	 * Message CRUD and query operations.
	 */
	messages: {
		/**
		 * Returns all messages.
		 * @returns DatabaseResult containing an array of messages.
		 */
		getAll(): Promise<DatabaseResult<Message[]>>;

		/**
		 * Gets a single message by id.
		 * @param id - Message id
		 * @returns DatabaseResult containing the Message or null.
		 */
		getById(id: string): Promise<DatabaseResult<Message | null>>;

		/**
		 * Gets messages belonging to a specific project.
		 * @param projectId - Project id to filter messages
		 * @returns DatabaseResult containing an array of messages.
		 */
		getByProjectId(projectId: string): Promise<DatabaseResult<Message[]>>;

		/**
		 * Gets messages exchanged between two users (by their ids).
		 * @param userId1 - First user id
		 * @param userId2 - Second user id
		 * @returns DatabaseResult containing an array of messages.
		 */
		getByUsers(userId1: string, userId2: string): Promise<DatabaseResult<Message[]>>;

		/**
		 * Creates a new message record.
		 * @param message - Message payload without id
		 * @returns DatabaseResult containing the created Message.
		 */
		create(message: Omit<Message, "id">): Promise<DatabaseResult<Message>>;

		/**
		 * Updates an existing message by id.
		 * @param id - Message id
		 * @param updates - Partial message fields to apply
		 * @returns DatabaseResult containing the updated Message.
		 */
		update(id: string, updates: Partial<Message>): Promise<DatabaseResult<Message>>;

		/**
		 * Deletes a message by id.
		 * @param id - Message id to delete
		 * @returns DatabaseResult<void> indicating success or error.
		 */
		delete(id: string): Promise<DatabaseResult<void>>;
	};

	/**
	 * Review CRUD and query operations.
	 */
	reviews: {
		/**
		 * Returns all reviews.
		 * @returns DatabaseResult containing an array of reviews.
		 */
		getAll(): Promise<DatabaseResult<Review[]>>;

		/**
		 * Gets a single review by id.
		 * @param id - Review id
		 * @returns DatabaseResult containing the Review or null.
		 */
		getById(id: string): Promise<DatabaseResult<Review | null>>;

		/**
		 * Gets reviews for a specific agent.
		 * @param agentId - Agent id to filter reviews
		 * @returns DatabaseResult containing an array of reviews.
		 */
		getByAgentId(agentId: string): Promise<DatabaseResult<Review[]>>;

		/**
		 * Creates a new review record.
		 * @param review - Review payload without id
		 * @returns DatabaseResult containing the created Review.
		 */
		create(review: Omit<Review, "id">): Promise<DatabaseResult<Review>>;

		/**
		 * Updates an existing review by id.
		 * @param id - Review id
		 * @param updates - Partial review fields to apply
		 * @returns DatabaseResult containing the updated Review.
		 */
		update(id: string, updates: Partial<Review>): Promise<DatabaseResult<Review>>;

		/**
		 * Deletes a review by id.
		 * @param id - Review id to delete
		 * @returns DatabaseResult<void> indicating success or error.
		 */
		delete(id: string): Promise<DatabaseResult<void>>;
	};

}

export default DatabaseAdapter;
