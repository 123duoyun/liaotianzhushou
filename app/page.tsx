"use client";

import { useEffect, useMemo, useState } from "react";
import ChatArea from "../components/ChatArea";
import WorkspacePanel from "../components/WorkspacePanel";
import { createId } from "../lib/storage";
import type {
  Analysis,
  AppData,
  ExtractedMessage,
  ReplySuggestion,
  Workspace
} from "../lib/types";

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "请求失败，请重试");
  }
  return data as TResponse;
}

function buildHistory(workspace: Workspace) {
  return workspace.messages.flatMap((message) => {
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
  });
}

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setLoadingError(null);

        const res = await fetch("/api/data");

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${res.status}: 请求失败`);
        }

        const json = await res.json();

        if (json.error) {
          throw new Error(json.error);
        }

        setData(json as AppData);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLoadingError(error instanceof Error ? error.message : "加载数据失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debounced save to server-side storage
  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => {
      fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).catch(console.error);
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  const activeWorkspace = useMemo(
    () => data?.workspaces.find((workspace) => workspace.id === data.activeWorkspaceId) ?? data?.workspaces[0],
    [data]
  );

  function updateWorkspace(nextWorkspace: Workspace) {
    if (!data) {
      return;
    }
    setData({
      ...data,
      workspaces: data.workspaces.map((workspace) => (workspace.id === nextWorkspace.id ? nextWorkspace : workspace))
    });
  }

  async function analyzeMessage(message: string): Promise<Analysis> {
    if (!data || !activeWorkspace) {
      throw new Error("Workspace 未加载");
    }
    const result = await postJson<{ analysis: Analysis }>("/api/analyze", {
      workspace: {
        gender: activeWorkspace.gender,
        relationship: activeWorkspace.relationship,
        goal: activeWorkspace.goal
      },
      history: buildHistory(activeWorkspace),
      newMessage: message,
      apiConfig: data.apiConfig
    });
    return result.analysis;
  }

  async function analyzeMessageStreaming(
    message: string,
    history: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }>,
    callbacks: {
      onReasoningToken: (content: string) => void;
      onContentToken: (content: string) => void;
      onAnalysisComplete: (analysis: Analysis) => void;
      onError: (message: string) => void;
    }
  ): Promise<void> {
    if (!data || !activeWorkspace) {
      callbacks.onError("Workspace 未加载");
      return;
    }

    const abortController = new AbortController();

    try {
      const response = await fetch("/api/analyze-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace: {
            gender: activeWorkspace.gender,
            relationship: activeWorkspace.relationship,
            goal: activeWorkspace.goal
          },
          history,
          newMessage: message,
          apiConfig: data.apiConfig
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errData = await response.json();
        callbacks.onError(errData.error ?? "请求失败");
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          try {
            const event = JSON.parse(trimmed.slice(6));
            if (event.type === "reasoning") {
              callbacks.onReasoningToken(event.content);
            } else if (event.type === "content") {
              callbacks.onContentToken(event.content);
            } else if (event.type === "analysis") {
              callbacks.onAnalysisComplete(event.analysis);
            } else if (event.type === "error") {
              callbacks.onError(event.message);
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        callbacks.onError(error instanceof Error ? error.message : "分析失败");
      }
    }
  }

  async function regenerateReplies(messageId: string): Promise<ReplySuggestion[]> {
    if (!data || !activeWorkspace) {
      throw new Error("Workspace 未加载");
    }
    const message = activeWorkspace.messages.find((item) => item.id === messageId);
    if (!message?.analysis) {
      throw new Error("这条消息还没有分析结果");
    }
    const result = await postJson<{ replies: ReplySuggestion[] }>("/api/regenerate-replies", {
      workspace: {
        gender: activeWorkspace.gender,
        relationship: activeWorkspace.relationship,
        goal: activeWorkspace.goal
      },
      message: message.content,
      existingAnalysis: {
        intent: message.analysis.intent,
        risks: message.analysis.risks
      },
      previousReplies: message.analysis.replies.map((reply) => reply.text),
      history: buildHistory(activeWorkspace),
      apiConfig: data.apiConfig
    });
    return result.replies;
  }

  async function extractFromScreenshots(images: string[]): Promise<ExtractedMessage[]> {
    if (!data) {
      throw new Error("配置未加载");
    }
    const result = await postJson<{ messages: Array<Omit<ExtractedMessage, "id">> }>("/api/extract-from-screenshot", {
      images,
      apiConfig: data.apiConfig
    });
    return result.messages.map((message) => ({ ...message, id: createId("extracted") }));
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="text-center animate-fade-in">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-coral/20 to-coral/5 border border-coral-border flex items-center justify-center animate-glow">
              <span className="text-3xl">🌙</span>
            </div>
          </div>
          <p className="font-display text-lg text-ink tracking-wide">正在唤醒密语...</p>
          <p className="mt-2 text-sm text-sage">初始化数据中</p>
          <div className="mt-6 flex justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-coral/40 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-coral/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-coral/40 animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </main>
    );
  }

  if (loadingError) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="text-center max-w-md p-8 glass rounded-3xl animate-fade-in">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="font-display text-lg text-ink">连接失败</p>
          <p className="mt-2 text-sm text-sage leading-relaxed">{loadingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2.5 rounded-xl bg-coral text-night-900 font-semibold text-sm transition-all duration-200 hover:bg-coral-light hover:scale-[1.02] active:scale-[0.98]"
          >
            重新连接
          </button>
        </div>
      </main>
    );
  }

  if (!data || !activeWorkspace) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="text-center animate-fade-in">
          <p className="text-sage">数据为空</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2.5 rounded-xl bg-coral text-night-900 font-semibold text-sm transition-all duration-200 hover:bg-coral-light hover:scale-[1.02] active:scale-[0.98]"
          >
            重新加载
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen text-ink md:flex md:h-screen md:overflow-hidden">
      <h1 className="sr-only">午夜密语 · 高情商聊天助手</h1>
      <WorkspacePanel
        data={data}
        onChange={setData}
        mobileOpen={mobileSettingsOpen}
        onClose={() => setMobileSettingsOpen(false)}
      />
      <ChatArea
        workspace={activeWorkspace}
        apiConfig={data.apiConfig}
        onWorkspaceChange={updateWorkspace}
        analyzeMessage={analyzeMessage}
        regenerateReplies={regenerateReplies}
        extractFromScreenshots={extractFromScreenshots}
        analyzeMessageStreaming={analyzeMessageStreaming}
        onOpenSettings={() => setMobileSettingsOpen(true)}
      />
    </div>
  );
}
