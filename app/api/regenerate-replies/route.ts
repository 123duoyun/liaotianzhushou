import { NextResponse } from "next/server";
import { callOpenAIJson, validateReplies } from "../../../lib/ai";
import { buildRegenerateRepliesPrompt } from "../../../lib/prompt";
import type { RegenerateRepliesRequest } from "../../../lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegenerateRepliesRequest;
    const prompt = buildRegenerateRepliesPrompt({
      workspace: body.workspace,
      message: body.message,
      existingAnalysis: body.existingAnalysis,
      previousReplies: body.previousReplies ?? [],
      history: body.history ?? []
    });
    const raw = await callOpenAIJson({
      apiConfig: body.apiConfig,
      messages: [
        { role: "system", content: "你只输出可解析的 JSON。" },
        { role: "user", content: prompt }
      ]
    });

    return NextResponse.json({ replies: validateReplies(raw) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "换一批失败，请重试" },
      { status: 400 }
    );
  }
}
