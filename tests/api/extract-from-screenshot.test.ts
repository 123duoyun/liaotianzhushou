import { describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/extract-from-screenshot/route";

vi.mock("../../lib/ai", async () => {
  const actual = await vi.importActual<typeof import("../../lib/ai")>("../../lib/ai");
  return {
    ...actual,
    callOpenAIJson: vi.fn().mockResolvedValue({
      messages: [
        { sender: "other", content: "在干嘛呀", time: "14:30" },
        { sender: "me", content: "刚忙完", time: "14:31" }
      ]
    })
  };
});

describe("POST /api/extract-from-screenshot", () => {
  it("returns extracted messages", async () => {
    const response = await POST(
      new Request("http://localhost/api/extract-from-screenshot", {
        method: "POST",
        body: JSON.stringify({
          images: ["data:image/png;base64,abc"],
          apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "gpt-test" }
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      messages: [
        { sender: "other", content: "在干嘛呀", time: "14:30" },
        { sender: "me", content: "刚忙完", time: "14:31" }
      ]
    });
  });
});
