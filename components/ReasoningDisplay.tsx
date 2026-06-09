"use client";

import type { AnalysisStreamPhase } from "../lib/types";

export default function ReasoningDisplay({
  reasoningText,
  contentText,
  phase,
  error
}: {
  reasoningText: string;
  contentText: string;
  phase: AnalysisStreamPhase;
  error: string | null;
}) {
  if (phase === "error" && error) {
    return (
      <article className="rounded-xl border-l-4 border-red-500 bg-white p-4 shadow-md">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      </article>
    );
  }

  const hasReasoning = reasoningText.length > 0;
  const hasContent = contentText.length > 0;

  return (
    <article className="rounded-xl border-l-4 border-coral bg-white p-4 shadow-md">
      {hasReasoning ? (
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className={phase === "reasoning" ? "animate-pulse" : ""}>🧠</span>
            <span>{phase === "reasoning" ? "思考中..." : "思考完成"}</span>
          </div>
          <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-sm text-ink/70">
            {reasoningText}
            {phase === "reasoning" && !hasContent ? <span className="animate-pulse">▌</span> : null}
          </p>
        </div>
      ) : null}

      {hasContent ? (
        <div className={hasReasoning ? "mt-3 border-t border-mist pt-3" : ""}>
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className={phase === "analyzing" ? "animate-pulse" : ""}>📝</span>
            <span>{phase === "analyzing" ? "生成中..." : "生成完成"}</span>
          </div>
          <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs text-ink/60">
            {contentText}
            {phase === "analyzing" ? <span className="animate-pulse">▌</span> : null}
          </p>
        </div>
      ) : !hasReasoning ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="animate-pulse">🧠</span>
          <span>分析中...</span>
        </div>
      ) : null}
    </article>
  );
}
