/**
 * @jest-environment node
 */

import { POST } from "../../../app/api/agents/route";
import { dbOperations } from "@/lib/database/operations";
import { NextRequest } from "next/server";


jest.mock('mongoose', () => ({
  Types: {
    ObjectId: jest.fn((id) => id),
  },
}));

// Mock the auth middleware to bypass authentication in tests
jest.mock("@/lib/middleware/auth", () => ({
  requireAuth: () => (handler: any) => handler,
  requireRole: () => (handler: any) => handler,
  AuthenticatedRequest: {} as any,
}));

jest.mock("@/lib/database/operations", () => ({
  dbOperations: {
    agents: {
      create: jest.fn(),
    },
  },
}));

describe("POST /api/agents - Input Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) =>
    ({
      json: async () => body,
      user: { _id: "user123", email: "builder@example.com", role: "builder", full_name: "Builder User" },
    } as unknown as NextRequest);

  it("returns 400 if title is missing", async () => {
    const request = createRequest({
      description: "Test agent",
      price: 100,
      category: "Real Estate",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.title).toContain("Missing title field");
  });

  it("returns 400 if description is missing", async () => {
    const request = createRequest({
      title: "Agent 1",
      price: 100,
      category: "Real Estate",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.description).toContain("Missing description field");
  });

it("returns 400 if price is missing", async () => {
  const request = createRequest({
    title: "Agent 1",
    description: "Test agent",
    category: "Real Estate",
  });

  const response = await POST(request);
  expect(response.status).toBe(400);

  const body = await response.json();
  expect(body.errors.price).toContain("Missing price field");
});

it("returns 400 if price is not positive", async () => {
  const request = createRequest({
    title: "Agent 1",
    description: "Test agent",
    price: -50,
    category: "Real Estate",
  });

  const response = await POST(request);
  expect(response.status).toBe(400);

  const body = await response.json();
  expect(body.errors.price).toContain("Price must be greater than 0");
});


  it("returns 400 if category is missing", async () => {
    const request = createRequest({
      title: "Agent 1",
      description: "Test agent",
      price: 100,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.errors.category).toContain("Missing category field");
  });

  it("returns 201 when body is valid", async () => {
    (dbOperations.agents.create as jest.Mock).mockResolvedValue({
      data: { id: "agent123", title: "Agent 1" },
      error: null,
    });

    const request = createRequest({
      title: "Agent 1",
      description: "Test agent",
      price: 100,
      category: "Real Estate",
      tags: ["tag1", "tag2"],
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.id).toBe("agent123");
  });

  it("returns 400 if dbOperations returns error", async () => {
    (dbOperations.agents.create as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error("DB error"),
    });

    const request = createRequest({
      title: "Agent 1",
      description: "Test agent",
      price: 100,
      category: "Real Estate",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("DB error");
  });

  it("returns 201 when tags are omitted", async () => {
  (dbOperations.agents.create as jest.Mock).mockResolvedValue({
    data: { id: "agent123", title: "Agent 1" },
    error: null,
  });

  const request = createRequest({
    title: "Agent 1",
    description: "Test agent",
    price: 100,
    category: "Real Estate",
  });

  const response = await POST(request);
  expect(response.status).toBe(201);
});
});
