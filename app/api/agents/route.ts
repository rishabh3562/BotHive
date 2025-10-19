import { NextRequest, NextResponse } from "next/server";
import { dbOperations } from "@/lib/database/operations";
import {
  requireAuth,
  requireRole,
  type AuthenticatedRequest,
} from "@/lib/middleware/auth";
import mongoose from "mongoose";

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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

// POST /api/agents - Create agent (builders only)
export const POST = requireRole(["builder"])(
  async (request: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { title, description, price, category, tags } = body;

      // Validate required fields
      if (!title || !description || !price || !category) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Validate price
      if (price <= 0) {
        return NextResponse.json(
          { error: "Price must be greater than 0" },
          { status: 400 }
        );
      }

      // Create agent
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
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
