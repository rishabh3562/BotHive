# Database Migration Guide

This guide explains how to migrate from the scattered Supabase imports to the new centralized database structure that supports both Supabase and MongoDB.

## Overview

The new database structure consists of 6 main files:

1. **`lib/database/config.ts`** - Database configuration and provider selection
2. **`lib/database/types.ts`** - Common database interfaces and types
3. **`lib/database/supabase.ts`** - Supabase-specific implementation
4. **`lib/database/mongodb.ts`** - MongoDB-specific implementation (server-side only)
5. **`lib/database/client.ts`** - Client-side database interface (API-based)
6. **`lib/database/index.ts`** - Main database interface and provider selection

## Important Notes

### MongoDB Client-Side Limitation

**MongoDB is server-side only** due to Node.js module dependencies. The solution provides:

- **Server-side**: Direct MongoDB operations
- **Client-side**: API-based operations through Next.js API routes
- **Automatic switching**: The system automatically uses the appropriate interface

### Supabase vs MongoDB

- **Supabase**: Works on both client and server side
- **MongoDB**: Server-side only, client-side operations go through API routes

## Configuration

### Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Database Provider Selection (required)
DATABASE_PROVIDER=supabase  # or 'mongodb'

# Supabase Configuration (required if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# MongoDB Configuration (required if using MongoDB)
MONGODB_URI=mongodb://localhost:27017/bothive
MONGODB_DATABASE=bothive
```

### Switching Database Providers

To switch between Supabase and MongoDB, simply change the `DATABASE_PROVIDER` environment variable:

```bash
# For Supabase
DATABASE_PROVIDER=supabase

# For MongoDB
DATABASE_PROVIDER=mongodb
```

## Usage

### Initialization

Initialize the database in your app startup (e.g., in `app/layout.tsx` or a middleware):

```typescript
import { initializeDatabase } from "@/lib/database";

// Initialize database on app startup
await initializeDatabase();
```

### Using the Database

Replace all direct Supabase imports with the centralized database interface:

#### Before (Scattered Supabase imports):

```typescript
import { supabase } from "@/lib/supabase/client";

// Authentication
const {
  data: { session },
} = await supabase.auth.getSession();
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Profiles
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .single();

// Projects
const { data: projects } = await supabase.from("projects").select("*");
```

#### After (Centralized database interface):

```typescript
import { db } from "@/lib/database";

// Authentication
const { data: session } = await db.auth().getSession();
const { data, error } = await db.auth().signIn(email, password);

// Profiles
const { data: profile } = await db.profiles().getById(userId);

// Projects
const { data: projects } = await db.projects().getAll();
```

### Available Operations

The centralized database provides these operation categories:

#### Authentication (`db.auth()`)

- `getSession()` - Get current session
- `signUp(email, password, metadata?)` - Sign up new user
- `signIn(email, password)` - Sign in user
- `signOut()` - Sign out user

#### Profiles (`db.profiles()`)

- `getById(id)` - Get profile by ID
- `create(profile)` - Create new profile
- `update(id, updates)` - Update profile
- `delete(id)` - Delete profile

#### Subscriptions (`db.subscriptions()`)

- `getByUserId(userId)` - Get subscription by user ID
- `create(subscription)` - Create subscription
- `update(id, updates)` - Update subscription
- `delete(id)` - Delete subscription
- `subscribeToChanges(userId, callback)` - Subscribe to real-time changes

#### Agents (`db.agents()`)

- `getAll()` - Get all agents
- `getById(id)` - Get agent by ID
- `create(agent)` - Create new agent
- `update(id, updates)` - Update agent
- `delete(id)` - Delete agent

#### Projects (`db.projects()`)

- `getAll()` - Get all projects
- `getById(id)` - Get project by ID
- `getByRecruiterId(recruiterId)` - Get projects by recruiter
- `create(project)` - Create new project
- `update(id, updates)` - Update project
- `delete(id)` - Delete project

#### Messages (`db.messages()`)

- `getAll()` - Get all messages
- `getById(id)` - Get message by ID
- `getByProjectId(projectId)` - Get messages by project
- `getByUsers(userId1, userId2)` - Get messages between users
- `create(message)` - Create new message
- `update(id, updates)` - Update message
- `delete(id)` - Delete message

#### Reviews (`db.reviews()`)

- `getAll()` - Get all reviews
- `getById(id)` - Get review by ID
- `getByAgentId(agentId)` - Get reviews by agent
- `create(review)` - Create new review
- `update(id, updates)` - Update review
- `delete(id)` - Delete review

## Migration Steps

### 1. Install MongoDB Dependency

```bash
npm install mongodb
```

### 2. Update Environment Variables

Add the required environment variables to your `.env.local` file.

### 3. Initialize Database

Add database initialization to your app startup:

```typescript
// In app/layout.tsx or similar
import { initializeDatabase } from "@/lib/database";

// Initialize on app startup
if (typeof window === "undefined") {
  initializeDatabase().catch(console.error);
}
```

### 4. Replace Supabase Imports

Replace all `import { supabase } from '@/lib/supabase/client'` with `import { db } from '@/lib/database'`.

### 5. Update Database Operations

Replace direct Supabase operations with the centralized database interface as shown in the usage examples above.

### 6. Create API Routes (for MongoDB)

If using MongoDB, create API routes for client-side operations. Example:

```typescript
// app/api/database/profiles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await getDatabase().profiles.getById(params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Benefits

1. **Centralized Database Logic**: All database operations are now in 6 files
2. **Easy Provider Switching**: Change database with a single environment variable
3. **Consistent API**: Same interface regardless of the underlying database
4. **Type Safety**: Full TypeScript support with consistent types
5. **No Scattered Imports**: Database imports are only in the centralized files
6. **Client-Server Compatibility**: Handles MongoDB client-side limitations automatically

## Architecture

### Supabase Mode

- **Client-side**: Direct Supabase operations
- **Server-side**: Direct Supabase operations

### MongoDB Mode

- **Client-side**: API-based operations through Next.js routes
- **Server-side**: Direct MongoDB operations

## Notes

- The MongoDB implementation includes basic authentication, but you may need to implement proper session management
- Real-time subscriptions work differently between Supabase and MongoDB (Supabase has built-in support, MongoDB requires Change Streams)
- Make sure to handle database initialization properly in your app startup
- Test thoroughly when switching between providers
- For MongoDB, create API routes for all client-side operations
