import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../../../../app/api/auth/refresh/route";
import { dbOperations } from "@/lib/database/operations";
import { NextRequest } from "next/server";

vi.mock("@/lib/database/operations", () => ({
  dbOperations: {
    auth: {
      refreshToken: vi.fn(),
    },
  },
}));

describe("POST /refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if refreshToken is missing", async () => {
    const request = {
      json: async () => ({}),
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.refreshToken).toContain("Missing refresh token");
  });

  it("returns 401 if invalid refreshToken", async () => {
    (dbOperations.auth.refreshToken as any).mockResolvedValue({
      data: null,
      error: new Error("Invalid refresh token"),
    });

    const request = {
      json: async () => ({ refreshToken: "abc123" }),
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("Invalid refresh token");
  });

    it("returns 400 if strategy is invalid", async () => {
      const request = {
        json: async () => ({
          strategy: "invalid-strategy",
        }),
      } as unknown as NextRequest;
  
      const response = await POST(request);
      expect(response.status).toBe(400);
  
      const body = await response.json();
      expect(body.errors.strategy?.[0]).toBe("Invalid enum value. Expected 'bearer' | 'cookie', received 'invalid-strategy'");
    });

  it("returns 200 and tokens when successful", async () => {
    (dbOperations.auth.refreshToken as any).mockResolvedValue({
      data: { token: "token123", refreshToken: "refresh123" },
      error: null,
    });

    const request = {
      json: async () => ({ refreshToken: "abc123", strategy: "bearer" }),
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.message).toBe("Token refreshed successfully");
    expect(body.token).toBe("token123");
  });
});
