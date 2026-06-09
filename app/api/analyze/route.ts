import { NextResponse } from "next/server";
import { callOpenAIJson, validateAnalysis } from "../../../lib/ai";
import { buildAnalysisPrompt } from "../../../lib/prompt";
import type { AnalyzeRequest } from "../../../lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const prompt = buildAnalysisPrompt({
      workspace: body.workspace,
      history: body.history ?? [],
      newMessage: body.newMessage
    });
    const raw = await callOpenAIJson({
      apiConfig: body.apiConfig,
      messages: [
        { role: "system", content: "你只输出可解析的 JSON。" },
        { role: "user", content: prompt }
      ]
    });

    return NextResponse.json({ analysis: validateAnalysis(raw) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "分析失败，请重试" },
      { status: 400 }
    );
  }
}
