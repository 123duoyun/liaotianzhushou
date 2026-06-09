import { describe, expect, it, vi } from "vitest";
import { callOpenAIJson, callOpenAIStream, extractJsonObject, validateAnalysis, validateReplies } from "../../lib/ai";

describe("AI helpers", () => {
  it("extracts JSON from plain text or fenced output", () => {
    expect(extractJsonObject('{"ok":true}')).toEqual({ ok: true });
    expect(extractJsonObject('```json\n{"ok":true}\n```')).toEqual({ ok: true });
    expect(extractJsonObject('prefix {"ok":true} suffix')).toEqual({ ok: true });
  });

  it("validates analysis shape and reply count", () => {
    const analysis = {
      intent: { surface: "邀请", real: "推进关系", emotion: "期待", subtext: "想见面" },
      risks: { misunderstand: "可能是群体活动", minefield: "别追问太多", atmosphere: "↑升温" },
      replies: [
        { style: "温暖真诚型", emoji: "🟢", text: "好呀，我也想去", strategy: "接住邀约" },
        { style: "幽默轻松型", emoji: "🟡", text: "这是展览邀请还是约会邀请", strategy: "轻松试探" },
        { style: "高段位型", emoji: "🔴", text: "可以，不过你得负责挑时间", strategy: "让对方投入" }
      ],
      advanced: "顺势确认时间"
    };

    expect(validateAnalysis(analysis)).toEqual(analysis);
    expect(validateReplies({ replies: analysis.replies })).toEqual(analysis.replies);
  });

  it("calls an OpenAI-compatible chat completions endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"ok":true}' } }]
      })
    });

    const result = await callOpenAIJson({
      apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "gpt-test" },
      messages: [{ role: "user", content: "hello" }],
      fetcher: fetchMock
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer sk-test" })
      })
    );
  });

  it("throws a friendly error when the API key is missing", async () => {
    await expect(
      callOpenAIJson({
        apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "", model: "gpt-test" },
        messages: [{ role: "user", content: "hello" }]
      })
    ).rejects.toThrow("请先在左侧填写 API Key");
  });

  it("yields reasoning and content tokens from a streaming response", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      'data: {"choices":[{"delta":{"reasoning_content":"让我分析"}}]}\n\n',
      'data: {"choices":[{"delta":{"reasoning_content":"这条消息..."}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"{\\"ok\\":true}"}}]}\n\n',
      "data: [DONE]\n\n"
    ];
    let index = 0;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body: new ReadableStream({
        pull(controller) {
          if (index < chunks.length) {
            controller.enqueue(encoder.encode(chunks[index]));
            index++;
          } else {
            controller.close();
          }
        }
      })
    });

    const results: Array<{ reasoning?: string; content?: string }> = [];
    for await (const chunk of callOpenAIStream({
      apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "deepseek-r1" },
      messages: [{ role: "user", content: "hello" }],
      fetcher: fetchMock
    })) {
      results.push(chunk);
    }

    expect(results).toEqual([
      { reasoning: "让我分析" },
      { reasoning: "这条消息..." },
      { content: '{"ok":true}' }
    ]);
  });
});
