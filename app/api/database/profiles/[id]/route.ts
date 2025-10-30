import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { captureApiException } from "@/lib/observability/sentry";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await getDatabase().profiles.getById(params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get profile error:", error);
    captureApiException(error, request, {
      handler: "GET /api/database/profiles/[id]",
      profileId: params.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { data, error } = await getDatabase().profiles.update(
      params.id,
      body
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update profile error:", error);
    captureApiException(error, request, {
      handler: "PUT /api/database/profiles/[id]",
      profileId: params.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await getDatabase().profiles.delete(params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete profile error:", error);
    captureApiException(error, request, {
      handler: "DELETE /api/database/profiles/[id]",
      profileId: params.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
