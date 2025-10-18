# Mongoose-Based Database Migration Guide

This guide explains the complete migration from Supabase to a Mongoose-based MongoDB system with JWT authentication and RBAC.

## 🎯 **Overview**

The new system provides:

- **Mongoose-based MongoDB integration** with full TypeScript support
- **JWT authentication** with refresh tokens
- **Role-Based Access Control (RBAC)** with three roles: builder, recruiter, admin
- **Two authentication strategies**: Bearer tokens and HTTP-only cookies
- **Centralized database operations** - no scattered database imports
- **Comprehensive API routes** with authentication middleware

## 📁 **New File Structure**

```
lib/
├── database/
│   ├── mongoose.ts          # Mongoose models, schemas, and utilities
│   ├── operations.ts        # Centralized database operations
│   ├── config.ts           # Database configuration
│   └── types.ts            # TypeScript interfaces
├── middleware/
│   └── auth.ts             # Authentication middleware and RBAC
└── ...

app/api/
├── auth/
│   ├── signup/route.ts     # User registration
│   ├── signin/route.ts     # User login
│   ├── refresh/route.ts    # Token refresh
│   └── signout/route.ts    # User logout
├── agents/route.ts         # Agent CRUD operations
├── projects/route.ts       # Project CRUD operations
└── ...
```

## 🔧 **Setup Instructions**

### 1. **Install Dependencies**

```bash
npm install mongoose bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### 2. **Environment Variables**

Add these to your `.env.local`:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bothive
MONGODB_DATABASE=bothive

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=30d

# Database Provider (set to mongodb)
DATABASE_PROVIDER=mongodb
```

### 3. **Database Initialization**

The database will be automatically initialized when you first access the `/init` route. This creates:

- Dummy users (admin, builder, recruiter)
- Sample agents, projects, reviews, and messages

## 🔐 **Authentication System**

### **Two Authentication Strategies**

#### **1. Bearer Token Strategy**

```typescript
// Client-side usage
const response = await fetch("/api/auth/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password",
    strategy: "bearer",
  }),
});

const { token } = await response.json();

// Use token in subsequent requests
const data = await fetch("/api/agents", {
  headers: { Authorization: `Bearer ${token}` },
});
```

#### **2. Cookie Strategy**

```typescript
// Client-side usage
const response = await fetch("/api/auth/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password",
    strategy: "cookie",
  }),
});

// Cookies are automatically set and sent with requests
const data = await fetch("/api/agents");
```

### **Role-Based Access Control**

Three user roles with specific permissions:

- **`admin`**: Full access to all resources
- **`builder`**: Can create/manage agents, submit proposals, send messages
- **`recruiter`**: Can create/manage projects, review proposals, send messages

## 🗄️ **Database Models**

### **User Model**

```typescript
interface IUser {
  email: string;
  password: string; // Hashed with bcrypt
  full_name: string;
  role: "builder" | "recruiter" | "admin";
  avatar_url?: string;
  stripe_customer_id?: string;
  is_verified: boolean;
  last_login?: Date;
}
```

### **Agent Model**

```typescript
interface IAgent {
  title: string;
  description: string;
  price: number;
  builder_id: ObjectId; // Reference to User
  category: string;
  tags: string[];
  rating: number;
  reviews_count: number;
  status: "pending" | "approved" | "rejected";
}
```

### **Project Model**

```typescript
interface IProject {
  title: string;
  description: string;
  budget: number;
  duration: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  recruiter_id: ObjectId; // Reference to User
  category: string;
  requirements: string[];
  skills: string[];
  deadline: Date;
}
```

## 🛠️ **API Usage Examples**

### **Authentication**

#### **Sign Up**

```typescript
const response = await fetch("/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
    full_name: "John Doe",
    role: "builder",
    strategy: "bearer",
  }),
});
```

#### **Sign In**

```typescript
const response = await fetch("/api/auth/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
    strategy: "bearer",
  }),
});

const { token, user } = await response.json();
```

#### **Refresh Token**

```typescript
const response = await fetch("/api/auth/refresh", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    refreshToken: "your-refresh-token",
    strategy: "bearer",
  }),
});
```

### **Agents API**

#### **Get All Agents (Public)**

```typescript
const response = await fetch("/api/agents");
const agents = await response.json();
```

#### **Create Agent (Builders Only)**

```typescript
const response = await fetch("/api/agents", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: "AI Writing Assistant",
    description: "Advanced writing assistant",
    price: 299,
    category: "Content Creation",
    tags: ["Writing", "AI"],
  }),
});
```

### **Projects API**

#### **Get All Projects (Public)**

```typescript
const response = await fetch("/api/projects");
const projects = await response.json();
```

#### **Create Project (Recruiters Only)**

```typescript
const response = await fetch("/api/projects", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: "AI Development Project",
    description: "Need AI expert for project",
    budget: 15000,
    duration: "3 months",
    category: "Machine Learning",
    requirements: ["Python", "TensorFlow"],
    skills: ["AI", "ML"],
    deadline: new Date("2024-12-31").toISOString(),
  }),
});
```

## 🔒 **Authentication Middleware**

### **Basic Authentication**

```typescript
import { requireAuth } from "@/lib/middleware/auth";

export const GET = requireAuth()(async (request) => {
  // User is authenticated
  return NextResponse.json({ message: "Authenticated" });
});
```

### **Role-Based Authentication**

```typescript
import { requireRole, requireAdmin } from "@/lib/middleware/auth";

// Require specific roles
export const POST = requireRole(["builder"])(async (request) => {
  // Only builders can access
});

// Require admin
export const DELETE = requireAdmin()(async (request) => {
  // Only admins can access
});
```

### **Optional Authentication**

```typescript
import { optionalAuth } from "@/lib/middleware/auth";

export const GET = optionalAuth()(async (request) => {
  // User may or may not be authenticated
  if (request.user) {
    // User is authenticated
  } else {
    // User is not authenticated
  }
});
```

## 🚀 **Migration Steps**

### **1. Update Environment Variables**

- Set `DATABASE_PROVIDER=mongodb`
- Add MongoDB URI and JWT secrets

### **2. Install Dependencies**

```bash
npm install mongoose bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### **3. Initialize Database**

- Visit `/init` route to create dummy data
- This creates users, agents, projects, etc.

### **4. Update Frontend Code**

Replace Supabase calls with API calls:

**Before (Supabase):**

```typescript
import { supabase } from "@/lib/supabase/client";
const { data } = await supabase.from("agents").select("*");
```

**After (API):**

```typescript
const response = await fetch("/api/agents");
const data = await response.json();
```

### **5. Update Authentication**

Replace Supabase auth with JWT auth:

**Before (Supabase):**

```typescript
const { data } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

**After (JWT):**

```typescript
const response = await fetch("/api/auth/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, strategy: "bearer" }),
});
const { token, user } = await response.json();
```

## 🔧 **Development Workflow**

### **1. Start Development Server**

```bash
npm run dev
```

### **2. Initialize Database**

- Visit `http://localhost:3000/init`
- Click "Initialize Users" to create dummy data
- Use the created accounts for testing

### **3. Test API Endpoints**

Use tools like Postman or curl to test the API:

```bash
# Sign in
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"builder@bothive.com","password":"builder123","strategy":"bearer"}'

# Get agents
curl http://localhost:3000/api/agents
```

## 🛡️ **Security Features**

- **Password Hashing**: All passwords are hashed with bcrypt
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token refresh mechanism
- **Role-Based Access**: Granular permission control
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses

## 📊 **Database Collections**

The system creates these MongoDB collections:

- `users` - User accounts and profiles
- `agents` - AI agents created by builders
- `projects` - Projects posted by recruiters
- `reviews` - Reviews for agents
- `messages` - Messages between users
- `subscriptions` - User subscription data
- `proposals` - Proposals from builders to projects

## 🎯 **Benefits of the New System**

1. **Centralized Database Logic**: All database operations in one place
2. **Type Safety**: Full TypeScript support with interfaces
3. **Flexible Authentication**: Choose between tokens and cookies
4. **Role-Based Security**: Granular access control
5. **Scalable Architecture**: Easy to extend and maintain
6. **No Vendor Lock-in**: MongoDB can be self-hosted or cloud-based
7. **Better Performance**: Direct database access without external API calls

## 🚨 **Important Notes**

- **MongoDB Required**: Make sure MongoDB is running locally or use a cloud service
- **JWT Secrets**: Use strong, unique secrets for JWT tokens
- **Environment Variables**: All sensitive data should be in environment variables
- **Production**: Use HTTPS in production for secure cookie transmission
- **Backup**: Implement regular database backups for production

## 🔄 **Next Steps**

1. **Complete API Routes**: Create remaining CRUD endpoints
2. **Frontend Integration**: Update all frontend components to use new API
3. **Testing**: Add comprehensive tests for all endpoints
4. **Production Setup**: Configure MongoDB Atlas or self-hosted MongoDB
5. **Monitoring**: Add logging and monitoring for production use

This migration provides a robust, scalable foundation for your application with modern authentication and database practices.
