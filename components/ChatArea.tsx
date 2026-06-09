"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createMessage } from "../lib/storage";
import type { Analysis, ApiConfig, Message, ReplySuggestion, Workspace } from "../lib/types";
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
  const [localMessages, setLocalMessages] = useState<Message[]>(workspace.messages);
  const [freshlyAnalyzedIds, setFreshlyAnalyzedIds] = useState<Set<string>>(new Set());

  // Sync local messages when workspace.messages changes from parent
  const prevWorkspaceMessagesRef = useRef(workspace.messages);
  useEffect(() => {
    if (workspace.messages !== prevWorkspaceMessagesRef.current) {
      prevWorkspaceMessagesRef.current = workspace.messages;
      setLocalMessages(workspace.messages);
    }
  }, [workspace.messages]);

  const messages = localMessages;

  const history = useMemo(
    () => messages.flatMap((message) => {
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
    [messages]
  );

  function updateWorkspace(newMessages: Message[]) {
    setLocalMessages(newMessages);
    onWorkspaceChange({ ...workspace, messages: newMessages });
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
    try {
      const analysis = await analyzeMessage(content, history);
      const newMessage = { ...pendingMessage, analysis };
      setFreshlyAnalyzedIds((prev) => new Set(prev).add(newMessage.id));
      const newMessages = [...messages, newMessage];
      updateWorkspace(newMessages);
      setInput("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "分析失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function selectReply(messageId: string, index: number) {
    const newMessages = messages.map((message) =>
      message.id === messageId ? { ...message, selectedReplyIndex: index } : message
    );
    updateWorkspace(newMessages);
  }

  async function handleRegenerate(messageId: string) {
    setRegeneratingId(messageId);
    setError("");
    try {
      const replies = await regenerateReplies(messageId);
      const newMessages = messages.map((message) =>
        message.id === messageId && message.analysis
          ? { ...message, analysis: { ...message.analysis, replies }, selectedReplyIndex: null }
          : message
      );
      updateWorkspace(newMessages);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "换一批失败，请重试");
    } finally {
      setRegeneratingId(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-paper">
      <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
        {messages.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center text-center text-sage">
            <p>粘贴对方消息后开始分析</p>
          </div>
        ) : null}
        {messages.map((message) => (
          <div key={message.id} className="space-y-3">
            <MessageBubble message={message} />
            {message.analysis ? (
              <AnalysisCard
                analysis={message.analysis}
                selectedReplyIndex={message.selectedReplyIndex}
                defaultOpen={freshlyAnalyzedIds.has(message.id)}
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
