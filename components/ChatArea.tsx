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
  analyzeMessageStreaming
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
      onAnalysisComplete: (analysis: Analysis) => void;
      onError: (message: string) => void;
    }
  ) => Promise<void>;
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
      setStreamingStates(new Map([[pendingMessage.id, { phase: "reasoning", reasoningText: "", error: null }]]));

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
    <main className="flex min-h-[52vh] flex-1 flex-col bg-paper md:min-h-screen">
      <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
        {draftExtractedMessages.length > 0 ? (
          <ExtractedMessages
            messages={draftExtractedMessages}
            onChange={setDraftExtractedMessages}
            onConfirm={confirmExtractedMessages}
            onCancel={() => setDraftExtractedMessages([])}
          />
        ) : null}
        {workspace.messages.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center text-center text-sage">
            <p>粘贴对方消息后开始分析</p>
          </div>
        ) : null}
        {workspace.messages.map((message, index) => (
          <div key={message.id} className="space-y-3">
            <MessageBubble message={message} />
            {streamingStates.has(message.id) ? (
              <ReasoningDisplay
                text={streamingStates.get(message.id)!.reasoningText}
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

      <form onSubmit={handleSubmit} className="border-t border-mist bg-white p-4">
        {error ? <div role="alert" className="mb-3 rounded bg-coral px-3 py-2 text-sm text-white">{error}</div> : null}
        <div className="mb-3 flex items-center gap-3">
          <ScreenshotUploader disabled={extracting} onImages={handleScreenshots} />
          {extracting ? <span className="text-sm text-sage">识别中</span> : null}
        </div>
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
