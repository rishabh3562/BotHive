/**
 * @jest-environment node
 */

import { POST } from "../../../../app/api/auth/signup/route";
import { NextRequest } from "next/server";

// Mock database adapter
const mockSignUp = jest.fn();
const mockSignIn = jest.fn();
const mockCreateProfile = jest.fn();

jest.mock("@/lib/database", () => ({
  initializeDatabase: jest.fn(),
  getDatabaseAdapter: jest.fn(() => ({
    auth: {
      signUp: mockSignUp,
      signIn: mockSignIn,
    },
    profiles: {
      create: mockCreateProfile,
    },
  })),
}));

describe("POST /auth/signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) =>
    ({
      json: async () => body,
    } as unknown as NextRequest);

  it("returns 400 if email is missing", async () => {
    const request = createRequest({
      password: "password123",
      full_name: "John Doe",
      role: "builder",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.email).toContain("Missing email field");
  });

  it("returns 400 if password is missing", async () => {
    const request = createRequest({
      email: "john@example.com",
      full_name: "John Doe",
      role: "builder",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.password).toContain("Missing password field");
  });

  it("returns 400 if full_name is missing", async () => {
    const request = createRequest({
      email: "john@example.com",
      password: "password123",
      role: "builder",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.full_name).toContain("Missing full name field");
  });

  it("returns 400 if role is invalid", async () => {
    const request = createRequest({
      email: "john@example.com",
      password: "password123",
      full_name: "John Doe",
      role: "invalid-role",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.role).toBeDefined();
  });

  it("returns 400 if strategy is invalid", async () => {
    const request = createRequest({
      email: "john@example.com",
      password: "password123",
      full_name: "John Doe",
      role: "builder",
      strategy: "invalid-strategy",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.strategy).toBeDefined();
    expect(body.errors.strategy?.[0]).toContain("Invalid enum value");
  });

  it("returns 201 and user data when signup is successful (bearer)", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        id: "1",
        email: "john@example.com",
        full_name: "John Doe",
        role: "builder",
        avatar_url: null,
        is_verified: false,
      },
      error: null,
    });

    mockCreateProfile.mockResolvedValue({
      data: {
        id: "1",
        full_name: "John Doe",
        role: "builder",
        avatar_url: null,
      },
      error: null,
    });

    mockSignIn.mockResolvedValue({
      data: {
        user: {
          id: "1",
          email: "john@example.com",
          full_name: "John Doe",
          role: "builder",
        },
        access_token: "token123",
        refresh_token: "refresh123",
      },
      error: null,
    });

    const request = createRequest({
      email: "john@example.com",
      password: "password123",
      full_name: "John Doe",
      role: "builder",
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.message).toBe("User created successfully");
    expect(body.user.email).toBe("john@example.com");
  });

  it("returns 400 if dbOperations returns an error", async () => {
    mockSignUp.mockResolvedValue({
      data: null,
      error: new Error("Email already exists"),
    });

    const request = createRequest({
      email: "john@example.com",
      password: "password123",
      full_name: "John Doe",
      role: "builder",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("Email already exists");
  });

  it("returns 500 if dbOperations returns no data and no error", async () => {
    mockSignUp.mockResolvedValue({
      data: null,
      error: null,
    });

    const request = createRequest({
      email: "john@example.com",
      password: "password123",
      full_name: "John Doe",
      role: "builder",
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toBe("Failed to create user");
  });
});
