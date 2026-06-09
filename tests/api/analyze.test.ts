import { describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/analyze/route";

vi.mock("../../lib/ai", async () => {
  const actual = await vi.importActual<typeof import("../../lib/ai")>("../../lib/ai");
  return {
    ...actual,
    callOpenAIJson: vi.fn().mockResolvedValue({
      intent: { surface: "邀请看展", real: "想见面", emotion: "期待", subtext: "推进关系" },
      risks: { misunderstand: "可能不是单独邀约", minefield: "别显得不自信", atmosphere: "↑↑升温" },
      replies: [
        { style: "温暖真诚型", emoji: "🟢", text: "好呀，我也想去那个展", strategy: "表达兴趣" },
        { style: "幽默轻松型", emoji: "🟡", text: "你这是约我还是约展", strategy: "轻松试探" },
        { style: "高段位型", emoji: "🔴", text: "可以，不过你来定时间", strategy: "让对方投入" }
      ],
      advanced: "顺势确认时间"
    })
  };
});

describe("POST /api/analyze", () => {
  it("returns validated analysis JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        body: JSON.stringify({
          workspace: { gender: "male", relationship: "暧昧", goal: "拉近距离" },
          history: [],
          newMessage: "周末有空吗，想去看那个展",
          apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "gpt-test" }
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      analysis: { intent: { real: "想见面" } }
    });
  });
});
