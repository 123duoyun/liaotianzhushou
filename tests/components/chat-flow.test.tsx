import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ChatArea from "../../components/ChatArea";
import { createMessage, createWorkspace } from "../../lib/storage";
import type { ApiConfig, Workspace } from "../../lib/types";

const apiConfig: ApiConfig = { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "gpt-test" };

describe("ChatArea", () => {
  it("adds a manual message, analyzes it, selects a reply, and regenerates replies", async () => {
    const user = userEvent.setup();
    const workspace = createWorkspace({ id: "w1", name: "小林" });
    const onWorkspaceChange = vi.fn();
    const analyzeMessage = vi.fn().mockResolvedValue({
      intent: { surface: "邀请看展", real: "想见面", emotion: "期待", subtext: "推进关系" },
      risks: { misunderstand: "可能不是单独邀约", minefield: "别问还有谁", atmosphere: "↑升温" },
      replies: [
        { style: "温暖真诚型", emoji: "🟢", text: "好呀，我也想去那个展", strategy: "表达兴趣" },
        { style: "幽默轻松型", emoji: "🟡", text: "你这是约我还是约展", strategy: "轻松试探" },
        { style: "高段位型", emoji: "🔴", text: "可以，不过你来定时间", strategy: "让对方投入" }
      ],
      advanced: "顺势确认时间"
    });
    const regenerateReplies = vi.fn().mockResolvedValue([
      { style: "温暖真诚型", emoji: "🟢", text: "好呀，那周末见", strategy: "明确接受" },
      { style: "幽默轻松型", emoji: "🟡", text: "行，我负责看展，你负责好看", strategy: "暧昧轻推" },
      { style: "高段位型", emoji: "🔴", text: "可以，给你一个表现机会", strategy: "制造互动" }
    ]);

    render(
      <ChatArea
        workspace={workspace}
        apiConfig={apiConfig}
        onWorkspaceChange={onWorkspaceChange}
        analyzeMessage={analyzeMessage}
        regenerateReplies={regenerateReplies}
      />
    );

    await user.type(screen.getByLabelText("输入对方消息"), "周末有空吗，想去看那个展");
    await user.click(screen.getByRole("button", { name: "分析" }));

    await waitFor(() => expect(analyzeMessage).toHaveBeenCalledWith("周末有空吗，想去看那个展", expect.any(Array)));
    expect(onWorkspaceChange).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([expect.objectContaining({ content: "周末有空吗，想去看那个展" })])
    }));

    await user.click(await screen.findByRole("button", { name: "选择回复：好呀，我也想去那个展" }));
    expect(onWorkspaceChange).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([expect.objectContaining({ selectedReplyIndex: 0 })])
    }));

    await user.click(screen.getByRole("button", { name: "换一批" }));
    await waitFor(() => expect(regenerateReplies).toHaveBeenCalled());
    expect(onWorkspaceChange).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([expect.objectContaining({
        analysis: expect.objectContaining({
          replies: expect.arrayContaining([expect.objectContaining({ text: "好呀，那周末见" })])
        })
      })])
    }));
  });

  it("renders existing history collapsed after the newest analysis", () => {
    const older = createMessage({
      id: "m1",
      sender: "other",
      content: "在干嘛呀",
      source: "manual",
      analysis: {
        intent: { surface: "问候", real: "想聊天", emotion: "轻松", subtext: "打开话题" },
        risks: { misunderstand: "别冷场", minefield: "别只回一个字", atmosphere: "↑升温" },
        replies: [
          { style: "温暖真诚型", emoji: "🟢", text: "刚忙完，你呢", strategy: "自然接话" },
          { style: "幽默轻松型", emoji: "🟡", text: "在等你来找我聊天", strategy: "轻松暧昧" },
          { style: "高段位型", emoji: "🔴", text: "你猜对一半", strategy: "制造好奇" }
        ]
      }
    });
    const workspace: Workspace = createWorkspace({ id: "w1", messages: [older] });

    render(
      <ChatArea
        workspace={workspace}
        apiConfig={apiConfig}
        onWorkspaceChange={vi.fn()}
        analyzeMessage={vi.fn()}
        regenerateReplies={vi.fn()}
      />
    );

    expect(screen.getByText("在干嘛呀")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "展开分析" })).toBeInTheDocument();
  });
});
