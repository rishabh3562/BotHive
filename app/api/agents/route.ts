import { NextRequest, NextResponse } from "next/server";
import { dbOperations } from "@/lib/database/operations";
import {
  requireAuth,
  requireRole,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth";
import { captureApiException } from "@/lib/observability/sentry";
import mongoose from "mongoose";
import { CreateAgentSchema } from "./agents.schema";

// GET /api/agents - Get all agents (public)
export const GET = requireAuth()(async (request: AuthenticatedRequest) => {
  try {
    const { data: agents, error } = await dbOperations.agents.getAll();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(agents);
  } catch (error) {
    console.error("Get agents error:", error);
    captureApiException(error, request, { handler: "GET /api/agents" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const POST = requireRole(["builder"])(
  async (request: AuthenticatedRequest) => {
    try {
      const body = await request.json();

      const result = CreateAgentSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { errors: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { title, description, price, category, tags } = result.data;

      const { data: agent, error } = await dbOperations.agents.create({
        title,
        description,
        price,
        category,
        tags: tags || [],
        builder_id: new mongoose.Types.ObjectId(request.user!._id),
        status: "pending",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(agent, { status: 201 });
    } catch (error) {
      console.error("Create agent error:", error);
      captureApiException(error, request, { handler: "POST /api/agents" });
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
