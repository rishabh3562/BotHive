import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../../../../app/api/auth/signin/route";
import { NextRequest } from "next/server";
import { dbOperations } from "@/lib/database/operations";

vi.mock("@/lib/database/operations", () => ({
  dbOperations: {
    auth: {
      signIn: vi.fn(),
    },
  },
}));

describe("POST /auth/signin ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(body.errors.strategy?.[0]).toBe("Invalid enum value. Expected 'bearer' | 'cookie', received 'invalid-strategy'");
  });

  it("passes validation when all fields are valid", async () => {
    (dbOperations.auth.signIn as any).mockResolvedValue({
      data: {
        user: {
          _id: "1",
          email: "user@example.com",
          full_name: "Test User",
          role: "user",
          avatar_url: "",
          is_verified: true,
        },
        token: "token123",
        refreshToken: "refresh123",
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
