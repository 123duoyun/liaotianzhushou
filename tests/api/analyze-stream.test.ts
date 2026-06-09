import { describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/analyze-stream/route";

vi.mock("../../lib/ai", async () => {
  const actual = await vi.importActual<typeof import("../../lib/ai")>("../../lib/ai");
  return {
    ...actual,
    callOpenAIStream: vi.fn().mockImplementation(async function* () {
      yield { reasoning: "让我分析这条消息" };
      yield { reasoning: "对方想见面" };
      yield { content: JSON.stringify({
        intent: { surface: "邀请看展", real: "想见面", emotion: "期待", subtext: "推进关系" },
        risks: { misunderstand: "可能不是单独邀约", minefield: "别显得不自信", atmosphere: "↑↑升温" },
        replies: [
          { style: "温暖真诚型", emoji: "🟢", text: "好呀，我也想去那个展", strategy: "表达兴趣" },
          { style: "幽默轻松型", emoji: "🟡", text: "你这是约我还是约展", strategy: "轻松试探" },
          { style: "高段位型", emoji: "🔴", text: "可以，不过你来定时间", strategy: "让对方投入" }
        ],
        advanced: "顺势确认时间"
      }) };
    })
  };
});

describe("POST /api/analyze-stream", () => {
  it("streams reasoning events then analysis event", async () => {
    const response = await POST(
      new Request("http://localhost/api/analyze-stream", {
        method: "POST",
        body: JSON.stringify({
          workspace: { gender: "male", relationship: "暧昧", goal: "拉近距离" },
          history: [],
          newMessage: "周末有空吗，想去看那个展",
          apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "deepseek-r1" }
        })
      })
    );

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += typeof value === "string" ? value : decoder.decode(value, { stream: true });
    }
    const events = text.split("\n\n").filter(Boolean).map((line) => {
      const dataLine = line.trim().split("\n").find((l) => l.startsWith("data: "));
      return JSON.parse(dataLine!.slice(6));
    });

    expect(events[0]).toEqual({ type: "reasoning", content: "让我分析这条消息" });
    expect(events[1]).toEqual({ type: "reasoning", content: "对方想见面" });
    expect(events[2]).toMatchObject({ type: "content" });
    expect(events[3]).toMatchObject({ type: "analysis", analysis: { intent: { real: "想见面" } } });
    expect(events[4]).toEqual({ type: "done" });
  });
});
