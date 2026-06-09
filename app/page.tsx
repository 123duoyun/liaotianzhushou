"use client";

import { useEffect, useMemo, useState } from "react";
import ChatArea from "../components/ChatArea";
import WorkspacePanel from "../components/WorkspacePanel";
import { createId, loadAppData, saveAppData } from "../lib/storage";
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

  useEffect(() => {
    setData(loadAppData());
  }, []);

  useEffect(() => {
    if (data) {
      saveAppData(data);
    }
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

  if (!data || !activeWorkspace) {
    return <main className="grid min-h-screen place-items-center bg-paper text-sage">加载中</main>;
  }

  return (
    <div className="min-h-screen bg-paper text-ink md:flex">
      <h1 className="sr-only">高情商聊天助手</h1>
      <WorkspacePanel data={data} onChange={setData} />
      <ChatArea
        workspace={activeWorkspace}
        apiConfig={data.apiConfig}
        onWorkspaceChange={updateWorkspace}
        analyzeMessage={analyzeMessage}
        regenerateReplies={regenerateReplies}
        extractFromScreenshots={extractFromScreenshots}
        analyzeMessageStreaming={analyzeMessageStreaming}
      />
    </div>
  );
}
