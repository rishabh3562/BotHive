import { NextRequest, NextResponse } from "next/server";
import {
  dbOperations,
  verifyToken,
  checkRole,
  type AuthStrategy,
  type UserRole,
} from "../database/operations";

// Authentication middleware options
export interface AuthOptions {
  strategy?: AuthStrategy;
  requiredRoles?: UserRole[];
  optional?: boolean;
}

// Extended request with user
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    _id: string;
    email: string;
    role: UserRole;
    full_name: string;
  };
}

// Authentication middleware
export async function authenticate(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<{ request: AuthenticatedRequest; response?: NextResponse }> {
  const { strategy = "bearer", requiredRoles = [], optional = false } = options;

  try {
    let token: string | undefined;

    // Extract token based on strategy
    if (strategy === "bearer") {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    } else if (strategy === "cookie") {
      token = request.cookies.get("auth-token")?.value;
    }

    // If no token and authentication is optional, continue
    if (!token && optional) {
      return { request: request as AuthenticatedRequest };
    }

    // If no token and authentication is required, return error
    if (!token) {
      return {
        request: request as AuthenticatedRequest,
        response: NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        ),
      };
    }

    // Verify token
    const payload = verifyToken(token, strategy);

    // Get user from database
    const { data: user, error } = await dbOperations.auth.getUserById(
      payload.userId
    );

    if (error || !user) {
      return {
        request: request as AuthenticatedRequest,
        response: NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        ),
      };
    }

    // Check role permissions if required
    if (requiredRoles.length > 0) {
      const hasRole = checkRole(requiredRoles)(user);
      if (!hasRole) {
        return {
          request: request as AuthenticatedRequest,
          response: NextResponse.json(
            { error: "Insufficient permissions" },
            { status: 403 }
          ),
        };
      }
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      _id: String((user as any)._id),
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    };

    return { request: authenticatedRequest };
  } catch (error) {
    return {
      request: request as AuthenticatedRequest,
      response: NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      ),
    };
  }
}

// Higher-order function to create authenticated route handlers
export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { request: authenticatedRequest, response: authResponse } =
      await authenticate(request, options);

    if (authResponse) {
      return authResponse;
    }

    return handler(authenticatedRequest);
  };
}

// Role-based middleware helpers
export const requireAuth =
  (strategy: AuthStrategy = "bearer") =>
  (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) =>
    withAuth(handler, { strategy });

export const requireRole =
  (roles: UserRole[], strategy: AuthStrategy = "bearer") =>
  (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) =>
    withAuth(handler, { strategy, requiredRoles: roles });

export const requireAdmin = (strategy: AuthStrategy = "bearer") =>
  requireRole(["admin"], strategy);

export const requireBuilder = (strategy: AuthStrategy = "bearer") =>
  requireRole(["builder"], strategy);

export const requireRecruiter = (strategy: AuthStrategy = "bearer") =>
  requireRole(["recruiter"], strategy);

export const requireBuilderOrRecruiter = (strategy: AuthStrategy = "bearer") =>
  requireRole(["builder", "recruiter"], strategy);

// Optional authentication middleware
export const optionalAuth =
  (strategy: AuthStrategy = "bearer") =>
  (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) =>
    withAuth(handler, { strategy, optional: true });

// Utility function to get user from request
export function getUser(request: AuthenticatedRequest) {
  return request.user;
}

// Utility function to check if user has role
export function hasRole(
  request: AuthenticatedRequest,
  role: UserRole
): boolean {
  return request.user?.role === role;
}

// Utility function to check if user has any of the roles
export function hasAnyRole(
  request: AuthenticatedRequest,
  roles: UserRole[]
): boolean {
  return request.user ? roles.includes(request.user.role) : false;
}
