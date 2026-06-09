import { callOpenAIStream, extractJsonObject, validateAnalysis } from "../../../lib/ai";
import { buildAnalysisPrompt } from "../../../lib/prompt";
import type { AnalyzeRequest } from "../../../lib/types";

function sendSSE(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(request: Request) {
  const body = (await request.json()) as AnalyzeRequest;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const prompt = buildAnalysisPrompt({
          workspace: body.workspace,
          history: body.history ?? [],
          newMessage: body.newMessage
        });

        // Phase 1: Stream reasoning tokens
        let contentBuffer = "";
        const reasoningStream = callOpenAIStream({
          apiConfig: body.apiConfig,
          messages: [
            { role: "system", content: "你是一个高情商聊天助手。请分析消息并输出 JSON。" },
            { role: "user", content: prompt }
          ]
        });

        for await (const chunk of reasoningStream) {
          if (chunk.reasoning) {
            sendSSE(controller, { type: "reasoning", content: chunk.reasoning });
          }
          if (chunk.content) {
            contentBuffer += chunk.content;
          }
        }

        // Phase 2: Parse the collected content as analysis JSON
        try {
          const raw = extractJsonObject(contentBuffer);
          const analysis = validateAnalysis(raw);
          sendSSE(controller, { type: "analysis", analysis });
        } catch (parseError) {
          sendSSE(controller, {
            type: "error",
            message: parseError instanceof Error ? parseError.message : "分析结果解析失败"
          });
        }

        sendSSE(controller, { type: "done" });
        controller.close();
      } catch (error) {
        sendSSE(controller, {
          type: "error",
          message: error instanceof Error ? error.message : "分析失败，请重试"
        });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
