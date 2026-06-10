"use client";

import { FormEvent, useMemo, useState } from "react";
import { createMessage } from "../lib/storage";
import type { Analysis, ApiConfig, ExtractedMessage, ReplySuggestion, StreamingState, Workspace } from "../lib/types";
import AnalysisCard from "./AnalysisCard";
import ExtractedMessages from "./ExtractedMessages";
import MessageBubble from "./MessageBubble";
import ReasoningDisplay from "./ReasoningDisplay";
import ScreenshotUploader from "./ScreenshotUploader";

export default function ChatArea({
  workspace,
  apiConfig,
  onWorkspaceChange,
  analyzeMessage,
  regenerateReplies,
  extractFromScreenshots = async () => [],
  analyzeMessageStreaming,
  onOpenSettings
}: {
  workspace: Workspace;
  apiConfig: ApiConfig;
  onWorkspaceChange: (workspace: Workspace) => void;
  analyzeMessage: (message: string, history: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }>) => Promise<Analysis>;
  regenerateReplies: (messageId: string) => Promise<ReplySuggestion[]>;
  extractFromScreenshots?: (images: string[]) => Promise<ExtractedMessage[]>;
  analyzeMessageStreaming?: (
    message: string,
    history: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }>,
    callbacks: {
      onReasoningToken: (content: string) => void;
      onContentToken: (content: string) => void;
      onAnalysisComplete: (analysis: Analysis) => void;
      onError: (message: string) => void;
    }
  ) => Promise<void>;
  onOpenSettings?: () => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [draftExtractedMessages, setDraftExtractedMessages] = useState<ExtractedMessage[]>([]);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [streamingStates, setStreamingStates] = useState<Map<string, StreamingState>>(new Map());

  const history = useMemo(
    () => workspace.messages.flatMap((message) => {
      const items: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }> = [
        { role: "user", content: message.content }
      ];
      if (message.analysis) {
        items.push({ role: "assistant", content: JSON.stringify(message.analysis) });
      }
      if (message.analysis && message.selectedReplyIndex !== null) {
        items.push({ role: "user_selected_reply", content: message.analysis.replies[message.selectedReplyIndex].text });
      }
      return items;
    }),
    [workspace.messages]
  );

  async function handleScreenshots(images: string[]) {
    setExtracting(true);
    setError("");
    try {
      setDraftExtractedMessages(await extractFromScreenshots(images));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "截图识别失败，请重试");
    } finally {
      setExtracting(false);
    }
  }

  function confirmExtractedMessages() {
    const imported = draftExtractedMessages
      .filter((message) => message.content.trim())
      .map((message) =>
        createMessage({
          sender: message.sender,
          content: message.content.trim(),
          time: message.time,
          source: "screenshot"
        })
      );
    onWorkspaceChange({ ...workspace, messages: [...workspace.messages, ...imported] });
    setDraftExtractedMessages([]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) {
      return;
    }
    setLoading(true);
    setError("");

    const pendingMessage = createMessage({ sender: "other", content, source: "manual" });

    // Add the message bubble immediately (without analysis)
    const workspaceWithPending = { ...workspace, messages: [...workspace.messages, pendingMessage] };
    onWorkspaceChange(workspaceWithPending);
    setInput("");

    if (analyzeMessageStreaming) {
      // Streaming path
      setStreamingStates(new Map([[pendingMessage.id, { phase: "reasoning", reasoningText: "", contentText: "", error: null }]]));

      await analyzeMessageStreaming(content, history, {
        onReasoningToken(token) {
          setStreamingStates((prev) => {
            const next = new Map(prev);
            const state = next.get(pendingMessage.id);
            if (state) {
              next.set(pendingMessage.id, { ...state, reasoningText: state.reasoningText + token });
            }
            return next;
          });
        },
        onContentToken(token) {
          setStreamingStates((prev) => {
            const next = new Map(prev);
            const state = next.get(pendingMessage.id);
            if (state) {
              next.set(pendingMessage.id, { ...state, contentText: state.contentText + token });
            }
            return next;
          });
        },
        onAnalysisComplete(analysis) {
          setStreamingStates((prev) => {
            const next = new Map(prev);
            next.delete(pendingMessage.id);
            return next;
          });
          // Update the message with the analysis
          onWorkspaceChange({
            ...workspaceWithPending,
            messages: workspaceWithPending.messages.map((m) =>
              m.id === pendingMessage.id ? { ...m, analysis } : m
            )
          });
        },
        onError(message) {
          setStreamingStates((prev) => {
            const next = new Map(prev);
            const state = next.get(pendingMessage.id);
            if (state) {
              next.set(pendingMessage.id, { ...state, phase: "error", error: message });
            }
            return next;
          });
          setError(message);
        }
      });
    } else {
      // Non-streaming fallback (original path)
      try {
        const analysis = await analyzeMessage(content, history);
        onWorkspaceChange({
          ...workspaceWithPending,
          messages: workspaceWithPending.messages.map((m) =>
            m.id === pendingMessage.id ? { ...m, analysis } : m
          )
        });
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "分析失败，请重试");
        // Remove the pending message on error
        onWorkspaceChange({
          ...workspace,
          messages: workspace.messages.filter((m) => m.id !== pendingMessage.id)
        });
      }
    }

    setLoading(false);
  }

  function selectReply(messageId: string, index: number) {
    onWorkspaceChange({
      ...workspace,
      messages: workspace.messages.map((message) =>
        message.id === messageId ? { ...message, selectedReplyIndex: index } : message
      )
    });
  }

  async function handleRegenerate(messageId: string) {
    setRegeneratingId(messageId);
    setError("");
    try {
      const replies = await regenerateReplies(messageId);
      onWorkspaceChange({
        ...workspace,
        messages: workspace.messages.map((message) =>
          message.id === messageId && message.analysis
            ? { ...message, analysis: { ...message.analysis, replies }, selectedReplyIndex: null }
            : message
        )
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "换一批失败，请重试");
    } finally {
      setRegeneratingId(null);
    }
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-night-800/60 backdrop-blur-xl px-5 py-4 md:px-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-coral">聊天工作台</p>
            <h2 className="mt-1.5 truncate font-display text-xl font-bold text-ink md:text-2xl">{workspace.name}</h2>
            <p className="mt-1.5 text-sm text-sage leading-relaxed">
              围绕当前关系与目标分析对话，洞察话外之音
            </p>
          </div>
          {onOpenSettings ? (
            <button
              type="button"
              aria-label="打开设置面板"
              onClick={onOpenSettings}
              className="inline-flex h-10 shrink-0 items-center rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 text-sm font-medium text-ink transition-all duration-200 hover:border-coral-border/40 md:hidden"
            >
              设置
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-2.5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sage">当前关系</p>
            <p className="mt-1 text-sm font-semibold text-ink">{workspace.relationship}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sage">当前目标</p>
            <p className="mt-1 text-sm font-semibold text-ink">{workspace.goal}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sage">API 状态</p>
            <p className="mt-1 text-sm font-semibold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${apiConfig.apiKey ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className="text-ink">{apiConfig.apiKey ? "已连接" : "未配置"}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Message area */}
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
        {draftExtractedMessages.length > 0 ? (
          <ExtractedMessages
            messages={draftExtractedMessages}
            onChange={setDraftExtractedMessages}
            onConfirm={confirmExtractedMessages}
            onCancel={() => setDraftExtractedMessages([])}
          />
        ) : null}
        {workspace.messages.length === 0 ? (
          <div className="grid min-h-[42vh] place-items-center rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 text-center">
            <div className="max-w-md animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-coral/10 to-coral/5 border border-coral-border/20 flex items-center justify-center">
                <span className="text-3xl">🌙</span>
              </div>
              <p className="font-display text-lg font-semibold text-ink">粘贴对方消息后开始分析</p>
              <p className="mt-2 text-sm text-sage leading-relaxed">支持手动输入或截图识别，分析会结合当前关系和目标给出回复建议。</p>
            </div>
          </div>
        ) : null}
        {workspace.messages.map((message, index) => (
          <div key={message.id} className="space-y-3 animate-slide-up" style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}>
            <MessageBubble message={message} />
            {streamingStates.has(message.id) ? (
              <ReasoningDisplay
                reasoningText={streamingStates.get(message.id)!.reasoningText}
                contentText={streamingStates.get(message.id)!.contentText}
                phase={streamingStates.get(message.id)!.phase}
                error={streamingStates.get(message.id)!.error}
              />
            ) : message.analysis ? (
              <AnalysisCard
                analysis={message.analysis}
                selectedReplyIndex={message.selectedReplyIndex}
                defaultOpen={index === workspace.messages.length - 1}
                regenerating={regeneratingId === message.id}
                onSelectReply={(replyIndex) => selectReply(message.id, replyIndex)}
                onRegenerate={() => handleRegenerate(message.id)}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="border-t border-white/[0.06] bg-night-800/80 backdrop-blur-xl p-4 md:p-5">
        {error ? (
          <div role="alert" className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        ) : null}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 md:p-4">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <ScreenshotUploader disabled={extracting} onImages={handleScreenshots} />
            <span className="text-xs text-sage">{extracting ? "识别中..." : "支持直接粘贴截图"}</span>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <textarea
              aria-label="输入对方消息"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={apiConfig.apiKey ? "粘贴对方新消息，或补充一点你想达到的效果..." : "先在设置里填写 API Key，再粘贴消息"}
              className="min-h-[88px] flex-1 resize-none rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-ink transition-all duration-200 focus:border-coral/40 focus:ring-1 focus:ring-coral/15 placeholder:text-sage/40"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-gradient-to-r from-coral to-coral-dark px-6 font-semibold text-night-900 text-sm shadow-amber transition-all duration-200 hover:shadow-amber-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-night-900/30 border-t-night-900 rounded-full animate-spin" />
                  分析中
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  ✦ 分析
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
