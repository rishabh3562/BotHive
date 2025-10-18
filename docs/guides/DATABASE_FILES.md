# Centralized Database Files

This document lists all the files where database logic is now centralized, eliminating scattered imports across your codebase.

## Core Database Files

### 1. `lib/database/config.ts`

**Purpose**: Database configuration and provider selection
**Key Features**:

- Environment variable-based provider selection (`DATABASE_PROVIDER`)
- Configuration validation for both Supabase and MongoDB
- Centralized configuration management

### 2. `lib/database/types.ts`

**Purpose**: Common database interfaces and types
**Key Features**:

- Unified `DatabaseResult<T>` interface for all operations
- Common authentication interfaces (`AuthSession`, `AuthUser`)
- Profile and other entity interfaces
- `DatabaseOperations` interface defining all available operations

### 3. `lib/database/supabase.ts`

**Purpose**: Supabase-specific database implementation
**Key Features**:

- Implements `DatabaseProvider` interface for Supabase
- Handles all Supabase-specific operations
- Maintains compatibility with existing Supabase features
- Real-time subscription support

### 4. `lib/database/mongodb.ts`

**Purpose**: MongoDB-specific database implementation
**Key Features**:

- Implements `DatabaseProvider` interface for MongoDB
- Handles all MongoDB-specific operations
- Uses MongoDB native driver
- Basic authentication and session management

### 5. `lib/database/index.ts`

**Purpose**: Main database interface and provider selection
**Key Features**:

- Provider initialization and selection logic
- Global database instance management
- Convenience exports (`db.auth()`, `db.profiles()`, etc.)
- Database lifecycle management (init, close)

## Updated Files

The following files have been updated to use the centralized database structure:

### Authentication & State Management

- `lib/auth.ts` - Updated to use `db.auth()` instead of direct Supabase imports
- `lib/hooks/use-subscription.ts` - Updated to use `db.subscriptions()` instead of direct Supabase imports

### Pages

- `app/data/page.tsx` - Updated to use centralized database operations
- `app/auth/page.tsx` - Needs update (currently uses direct Supabase imports)
- `app/sign-in/page.tsx` - Needs update (currently uses direct Supabase imports)
- `app/sign-up/page.tsx` - Needs update (currently uses direct Supabase imports)
- `app/init/page.tsx` - Needs update (currently uses direct Supabase imports)
- `app/dashboard/recruiter/page.tsx` - Needs update (currently uses direct Supabase imports)

### API Routes

- `app/api/create-checkout-session/route.ts` - Needs update (currently uses direct Supabase imports)
- `app/api/create-portal-session/route.ts` - Needs update (currently uses direct Supabase imports)
- `app/api/webhooks/stripe/route.ts` - Needs update (currently uses direct Supabase imports)

## Benefits of This Structure

1. **Single Source of Truth**: All database logic is centralized in 5 files
2. **Easy Provider Switching**: Change database with one environment variable
3. **Consistent API**: Same interface regardless of underlying database
4. **Type Safety**: Full TypeScript support across all operations
5. **No Scattered Imports**: Database imports only exist in centralized files
6. **Maintainability**: Changes to database logic only require updates in centralized files

## Migration Status

- ✅ **Core Database Structure**: Complete
- ✅ **Configuration**: Complete
- ✅ **Types**: Complete
- ✅ **Supabase Provider**: Complete
- ✅ **MongoDB Provider**: Complete
- ✅ **Main Interface**: Complete
- ✅ **Auth System**: Updated
- ✅ **Subscription Hook**: Updated
- ✅ **Data Page**: Updated
- ⏳ **Remaining Pages**: Need updates
- ⏳ **API Routes**: Need updates

## Next Steps

1. Update remaining pages to use the centralized database interface
2. Update API routes to use the centralized database interface
3. Test the system with both Supabase and MongoDB providers
4. Add proper error handling and logging
5. Implement proper session management for MongoDB
6. Add database initialization to app startup
