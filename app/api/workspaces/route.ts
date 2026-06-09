import { NextResponse } from "next/server";
import { upsertWorkspace, deleteWorkspace } from "../../../lib/db";
import type { Workspace } from "../../../lib/types";

export async function POST(request: Request) {
  try {
    const ws = (await request.json()) as Workspace;
    upsertWorkspace(ws);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to create workspace:", error);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const ws = (await request.json()) as Workspace;
    upsertWorkspace(ws);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update workspace:", error);
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing workspace id" }, { status: 400 });
    }
    deleteWorkspace(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete workspace:", error);
    return NextResponse.json({ error: "Failed to delete workspace" }, { status: 500 });
  }
}
