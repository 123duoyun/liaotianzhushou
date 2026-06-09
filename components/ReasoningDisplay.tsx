"use client";

import type { AnalysisStreamPhase } from "../lib/types";

export default function ReasoningDisplay({
  text,
  phase,
  error
}: {
  text: string;
  phase: AnalysisStreamPhase;
  error: string | null;
}) {
  if (phase === "error" && error) {
    return (
      <article className="rounded border-l-4 border-coral bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-coral">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded border-l-4 border-coral bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="animate-pulse">🧠</span>
        <span>{phase === "analyzing" ? "生成分析中..." : "思考中..."}</span>
      </div>
      {text ? (
        <p className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap break-words text-sm text-ink/70">
          {text}
          {phase === "reasoning" ? <span className="animate-pulse">▌</span> : null}
        </p>
      ) : null}
    </article>
  );
}
