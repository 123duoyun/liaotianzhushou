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
      <article className="glass-strong rounded-2xl p-5 border-l-3 border-red-500 animate-fade-in">
        <div className="flex items-center gap-2.5 text-sm text-red-400">
          <span className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-xs">⚠</span>
          <span>{error}</span>
        </div>
      </article>
    );
  }

  const hasReasoning = reasoningText.length > 0;
  const hasContent = contentText.length > 0;

  return (
    <article className="glass-strong rounded-2xl p-5 amber-line animate-fade-in">
      {hasReasoning ? (
        <div>
          <div className="flex items-center gap-2.5 text-sm font-semibold text-ink">
            <span className={`w-6 h-6 rounded-lg bg-coral/10 border border-coral/20 flex items-center justify-center text-xs ${phase === "reasoning" ? "animate-pulse" : ""}`}>
              🧠
            </span>
            <span>{phase === "reasoning" ? "思考中..." : "思考完成"}</span>
          </div>
          <p className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-sm text-sage leading-relaxed">
            {reasoningText}
            {phase === "reasoning" && !hasContent ? <span className="text-coral animate-pulse">▌</span> : null}
          </p>
        </div>
      ) : null}

      {hasContent ? (
        <div className={hasReasoning ? "mt-4 border-t border-white/[0.06] pt-4" : ""}>
          <div className="flex items-center gap-2.5 text-sm font-semibold text-ink">
            <span className={`w-6 h-6 rounded-lg bg-coral/10 border border-coral/20 flex items-center justify-center text-xs ${phase === "analyzing" ? "animate-pulse" : ""}`}>
              📝
            </span>
            <span>{phase === "analyzing" ? "生成中..." : "生成完成"}</span>
          </div>
          <p className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs text-sage/70 leading-relaxed">
            {contentText}
            {phase === "analyzing" ? <span className="text-coral animate-pulse">▌</span> : null}
          </p>
        </div>
      ) : !hasReasoning ? (
        <div className="flex items-center gap-2.5 text-sm font-semibold text-ink">
          <span className="w-6 h-6 rounded-lg bg-coral/10 border border-coral/20 flex items-center justify-center text-xs animate-pulse">
            🧠
          </span>
          <span>分析中...</span>
        </div>
      ) : null}
    </article>
  );
}
