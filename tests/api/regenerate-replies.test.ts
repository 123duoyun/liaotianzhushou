import { describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/regenerate-replies/route";

vi.mock("../../lib/ai", async () => {
  const actual = await vi.importActual<typeof import("../../lib/ai")>("../../lib/ai");
  return {
    ...actual,
    callOpenAIJson: vi.fn().mockResolvedValue({
      replies: [
        { style: "温暖真诚型", emoji: "🟢", text: "好呀，那我们周末见", strategy: "明确接受" },
        { style: "幽默轻松型", emoji: "🟡", text: "可以，我负责看展，你负责好看", strategy: "暧昧轻推" },
        { style: "高段位型", emoji: "🔴", text: "行，给你一个表现机会", strategy: "制造互动" }
      ]
    })
  };
});

describe("POST /api/regenerate-replies", () => {
  it("returns three regenerated replies", async () => {
    const response = await POST(
      new Request("http://localhost/api/regenerate-replies", {
        method: "POST",
        body: JSON.stringify({
          workspace: { gender: "male", relationship: "暧昧", goal: "拉近距离" },
          message: "周末有空吗，想去看那个展",
          existingAnalysis: {
            intent: { surface: "邀请", real: "想见面", emotion: "期待", subtext: "推进关系" },
            risks: { misunderstand: "可能不是单独邀约", minefield: "别显得不自信", atmosphere: "↑升温" }
          },
          previousReplies: ["好呀，我也想去那个展"],
          history: [],
          apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "gpt-test" }
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      replies: expect.arrayContaining([
        expect.objectContaining({ text: "好呀，那我们周末见" })
      ])
    });
  });
});
