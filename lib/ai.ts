import type { Analysis, ApiConfig, ReplySuggestion } from "./types";

type ChatMessage = {
  role: "system" | "user";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
};

type Fetcher = typeof fetch;

export function extractJsonObject(content: string): unknown {
  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("AI 返回格式异常，请重试");
  }
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`AI 返回缺少字段：${label}`);
  }
  return value;
}

function validateReply(value: unknown): ReplySuggestion {
  const reply = value as Partial<ReplySuggestion>;
  return {
    style: requireString(reply.style, "reply.style") as ReplySuggestion["style"],
    emoji: requireString(reply.emoji, "reply.emoji"),
    text: requireString(reply.text, "reply.text"),
    strategy: requireString(reply.strategy, "reply.strategy")
  };
}

export function validateReplies(value: unknown): ReplySuggestion[] {
  const replies = (value as { replies?: unknown }).replies;
  if (!Array.isArray(replies) || replies.length !== 3) {
    throw new Error("AI 必须返回 3 条回复建议");
  }
  return replies.map(validateReply);
}

export function validateAnalysis(value: unknown): Analysis {
  const candidate = value as Partial<Analysis>;
  return {
    intent: {
      surface: requireString(candidate.intent?.surface, "intent.surface"),
      real: requireString(candidate.intent?.real, "intent.real"),
      emotion: requireString(candidate.intent?.emotion, "intent.emotion"),
      subtext: requireString(candidate.intent?.subtext, "intent.subtext")
    },
    risks: {
      misunderstand: requireString(candidate.risks?.misunderstand, "risks.misunderstand"),
      minefield: requireString(candidate.risks?.minefield, "risks.minefield"),
      atmosphere: requireString(candidate.risks?.atmosphere, "risks.atmosphere")
    },
    replies: validateReplies({ replies: candidate.replies }),
    advanced: typeof candidate.advanced === "string" ? candidate.advanced : undefined
  };
}

export async function callOpenAIJson({
  apiConfig,
  messages,
  fetcher = fetch
}: {
  apiConfig: ApiConfig;
  messages: ChatMessage[];
  fetcher?: Fetcher;
}): Promise<unknown> {
  if (!apiConfig.apiKey.trim()) {
    throw new Error("请先在左侧填写 API Key");
  }
  if (!apiConfig.baseUrl.trim()) {
    throw new Error("请先填写 API Base URL");
  }
  if (!apiConfig.model.trim()) {
    throw new Error("请先填写模型名称");
  }

  const baseUrl = apiConfig.baseUrl.replace(/\/$/, "");
  const response = await fetcher(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiConfig.apiKey}`
    },
    body: JSON.stringify({
      model: apiConfig.model,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages
    })
  });

  if (!response.ok) {
    throw new Error(`AI 请求失败：HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("AI 返回为空，请重试");
  }

  return extractJsonObject(content);
}
