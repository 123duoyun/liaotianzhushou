import { NextResponse } from "next/server";
import { callOpenAIJson } from "../../../lib/ai";
import { buildScreenshotExtractionPrompt } from "../../../lib/prompt";
import type { ExtractFromScreenshotRequest, ExtractFromScreenshotResponse, Sender } from "../../../lib/types";

function validateExtractedMessages(value: unknown): ExtractFromScreenshotResponse["messages"] {
  const messages = (value as ExtractFromScreenshotResponse).messages;
  if (!Array.isArray(messages)) {
    throw new Error("截图识别结果缺少 messages");
  }

  return messages.map((message) => {
    const sender = message.sender as Sender;
    if (sender !== "other" && sender !== "me") {
      throw new Error("截图识别结果包含未知发送方");
    }
    if (typeof message.content !== "string" || message.content.trim() === "") {
      throw new Error("截图识别结果包含空消息");
    }
    return {
      sender,
      content: message.content.trim(),
      time: typeof message.time === "string" ? message.time : null
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExtractFromScreenshotRequest;
    if (!Array.isArray(body.images) || body.images.length === 0) {
      throw new Error("请先上传或粘贴截图");
    }

    const raw = await callOpenAIJson({
      apiConfig: body.apiConfig,
      messages: [
        { role: "system", content: "你只输出可解析的 JSON。" },
        {
          role: "user",
          content: [
            { type: "text", text: buildScreenshotExtractionPrompt() },
            ...body.images.map((image) => ({ type: "image_url" as const, image_url: { url: image } }))
          ]
        }
      ]
    });

    return NextResponse.json({ messages: validateExtractedMessages(raw) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "截图识别失败，请重试" },
      { status: 400 }
    );
  }
}
