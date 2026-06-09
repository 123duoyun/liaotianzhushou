"use client";

import { FormEvent, useMemo, useState } from "react";
import { createMessage } from "../lib/storage";
import type { Analysis, ApiConfig, ReplySuggestion, Workspace } from "../lib/types";
import AnalysisCard from "./AnalysisCard";
import MessageBubble from "./MessageBubble";

export default function ChatArea({
  workspace,
  apiConfig,
  onWorkspaceChange,
  analyzeMessage,
  regenerateReplies
}: {
  workspace: Workspace;
  apiConfig: ApiConfig;
  onWorkspaceChange: (workspace: Workspace) => void;
  analyzeMessage: (message: string, history: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }>) => Promise<Analysis>;
  regenerateReplies: (messageId: string) => Promise<ReplySuggestion[]>;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState("");

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) {
      return;
    }
    setLoading(true);
    setError("");

    const pendingMessage = createMessage({ sender: "other", content, source: "manual" });
    try {
      const analysis = await analyzeMessage(content, history);
      onWorkspaceChange({ ...workspace, messages: [...workspace.messages, { ...pendingMessage, analysis }] });
      setInput("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "分析失败，请重试");
    } finally {
      setLoading(false);
    }
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
    <main className="flex min-h-screen flex-1 flex-col bg-paper">
      <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
        {workspace.messages.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center text-center text-sage">
            <p>粘贴对方消息后开始分析</p>
          </div>
        ) : null}
        {workspace.messages.map((message, index) => (
          <div key={message.id} className="space-y-3">
            <MessageBubble message={message} />
            {message.analysis ? (
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

      <form onSubmit={handleSubmit} className="border-t border-mist bg-white p-4">
        {error ? <div role="alert" className="mb-3 rounded bg-coral px-3 py-2 text-sm text-white">{error}</div> : null}
        <div className="flex gap-3">
          <textarea
            aria-label="输入对方消息"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={apiConfig.apiKey ? "粘贴对方新消息" : "先在左侧填写 API Key，再粘贴消息"}
            className="min-h-12 flex-1 resize-none rounded border border-mist px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded bg-coral px-5 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "分析中" : "分析"}
          </button>
        </div>
      </form>
    </main>
  );
}
