import { NextResponse } from "next/server";
import { loadFullData, saveFullData } from "../../../lib/db";
import type { AppData } from "../../../lib/types";

export async function GET() {
  try {
    const data = await loadFullData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load data:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = (await request.json()) as AppData;
    await saveFullData(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save data:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
