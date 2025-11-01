/**
 * @jest-environment node
 */

import { POST } from "../../../../app/api/auth/signin/route";
import { NextRequest } from "next/server";

// Mock database adapter
const mockSignIn = jest.fn();
const mockGetById = jest.fn();

jest.mock("@/lib/database", () => ({
  initializeDatabase: jest.fn(),
  getDatabaseAdapter: jest.fn(() => ({
    auth: {
      signIn: mockSignIn,
    },
    profiles: {
      getById: mockGetById,
    },
  })),
}));

describe("POST /auth/signin ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if email is missing", async () => {
    const request = {
      json: async () => ({ password: "pass123" }),
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.email?.[0]).toBeDefined();
  });

  it("returns 400 if password is missing", async () => {
    const request = {
      json: async () => ({ email: "user@example.com" }),
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.password?.[0]).toBeDefined();
  });

  it("returns 400 if strategy is invalid", async () => {
    const request = {
      json: async () => ({
        email: "user@example.com",
        password: "pass123",
        strategy: "invalid-strategy",
      }),
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.strategy).toBeDefined();
    expect(body.errors.strategy?.[0]).toContain("Invalid enum value");
  });

  it("passes validation when all fields are valid", async () => {
    mockSignIn.mockResolvedValue({
      data: {
        user: {
          id: "1",
          email: "user@example.com",
          full_name: "Test User",
          role: "user",
          avatar_url: "",
          is_verified: true,
        },
        access_token: "token123",
        refresh_token: "refresh123",
      },
      error: null,
    });

    mockGetById.mockResolvedValue({
      data: {
        id: "1",
        full_name: "Test User",
        role: "builder",
        avatar_url: "",
      },
      error: null,
    });

    const request = {
      json: async () => ({
        email: "user@example.com",
        password: "pass123",
        strategy: "bearer",
      }),
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.message).toBe("Signed in successfully");
  });
});
