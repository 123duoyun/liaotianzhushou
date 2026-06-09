import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../app/page";
import { createDefaultAppData } from "../lib/storage";

const defaultData = createDefaultAppData();
let savedData: unknown = null;

function mockFetch() {
  savedData = null;
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) => {
      if (url === "/api/data" && (!init || init.method === "GET")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(structuredClone(defaultData)) });
      }
      if (url === "/api/data" && init?.method === "PUT") {
        savedData = JSON.parse(init.body as string);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    })
  );
}

describe("Home app integration", () => {
  beforeEach(() => {
    mockFetch();
  });

  it("hydrates default workspace and persists setting edits", async () => {
    const user = userEvent.setup();

    render(<Home />);

    expect(await screen.findByDisplayValue("新的聊天对象")).toBeInTheDocument();
    await user.clear(screen.getByLabelText("对方备注名"));
    await user.type(screen.getByLabelText("对方备注名"), "小林");

    await waitFor(() => {
      expect(savedData).not.toBeNull();
      expect((savedData as { workspaces: Array<{ name: string }> }).workspaces[0].name).toBe("小林");
    });
  });

  it("posts analyze requests through the streaming API route", async () => {
    const user = userEvent.setup();
    const analysisPayload = {
      intent: { surface: "邀请", real: "想见面", emotion: "期待", subtext: "推进关系" },
      risks: { misunderstand: "可能不是单独邀约", minefield: "别问还有谁", atmosphere: "↑升温" },
      replies: [
        { style: "温暖真诚型", emoji: "🟢", text: "好呀，我也想去", strategy: "表达兴趣" },
        { style: "幽默轻松型", emoji: "🟡", text: "这是约我还是约展", strategy: "轻松试探" },
        { style: "高段位型", emoji: "🔴", text: "可以，你定时间", strategy: "让对方投入" }
      ]
    };
    const sseBody = `data: ${JSON.stringify({ type: "reasoning", content: "思考中..." })}\n\ndata: ${JSON.stringify({ type: "analysis", analysis: analysisPayload })}\n\n`;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseBody));
        controller.close();
      }
    });
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init?: RequestInit) => {
        if (url === "/api/data" && (!init || init.method === "GET")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(structuredClone(defaultData)) });
        }
        if (url === "/api/data" && init?.method === "PUT") {
          savedData = JSON.parse(init.body as string);
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
        }
        if (url === "/api/analyze-stream") {
          return Promise.resolve({ ok: true, body: stream });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      })
    );

    render(<Home />);

    await user.click(await screen.findByRole("button", { name: "⚙️ API 设置" }));
    await user.type(screen.getByLabelText("API Key"), "sk-test");
    await user.type(screen.getByLabelText("输入对方消息"), "周末有空吗");
    await user.click(screen.getByRole("button", { name: "✨ 分析" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/analyze-stream", expect.objectContaining({ method: "POST" })));
    expect(await screen.findByText("想见面")).toBeInTheDocument();
  });

  it("keeps the workspace panel and chat composer visible in the app shell", async () => {
    render(<Home />);

    expect(await screen.findByLabelText("Workspace 列表")).toBeInTheDocument();
    expect(screen.getByLabelText("输入对方消息")).toBeInTheDocument();
    expect(screen.getByLabelText("上传截图")).toBeInTheDocument();
  });

  it("shows the refreshed workspace header and mobile settings toggle", async () => {
    const { container } = render(<Home />);

    expect(await screen.findByText("当前聊天对象")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "打开设置面板" })).toBeInTheDocument();
    expect(screen.getByText("聊天工作台")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("min-h-screen");
    expect(container.firstElementChild).toHaveClass("md:h-screen");
  });
});
