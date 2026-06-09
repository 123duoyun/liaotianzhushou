import { NextResponse } from "next/server";
import { upsertMessage, deleteMessage } from "../../../lib/db";
import type { Message } from "../../../lib/types";

export async function POST(request: Request) {
  try {
    const { workspaceId, message } = (await request.json()) as {
      workspaceId: string;
      message: Message;
    };
    await upsertMessage(workspaceId, message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to create message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { workspaceId, message } = (await request.json()) as {
      workspaceId: string;
      message: Message;
    };
    await upsertMessage(workspaceId, message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update message:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing message id" }, { status: 400 });
    }
    await deleteMessage(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
