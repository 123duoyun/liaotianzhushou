"use client";

import { useState } from "react";
import type { Analysis } from "../lib/types";
import ReplySuggestions from "./ReplySuggestions";

export default function AnalysisCard({
  analysis,
  selectedReplyIndex,
  defaultOpen,
  regenerating,
  onSelectReply,
  onRegenerate
}: {
  analysis: Analysis;
  selectedReplyIndex: number | null;
  defaultOpen: boolean;
  regenerating: boolean;
  onSelectReply: (index: number) => void;
  onRegenerate: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className="rounded border-l-4 border-coral bg-white p-4 shadow-sm">
      <button
        type="button"
        aria-label={open ? "折叠分析" : "展开分析"}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-semibold">意图分析</span>
        <span className="text-sm text-coral">{analysis.risks.atmosphere}</span>
      </button>
      {open ? (
        <div className="mt-4 space-y-4">
          <dl className="grid gap-3 md:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-sage">表面意思</dt>
              <dd className="mt-1 text-sm">{analysis.intent.surface}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-sage">真实意图</dt>
              <dd className="mt-1 text-sm">{analysis.intent.real}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-sage">情绪状态</dt>
              <dd className="mt-1 text-sm">{analysis.intent.emotion}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-sage">话外之音</dt>
              <dd className="mt-1 text-sm">{analysis.intent.subtext}</dd>
            </div>
          </dl>
          <div className="rounded bg-paper p-3 text-sm">
            <p><strong>可能误解：</strong>{analysis.risks.misunderstand}</p>
            <p className="mt-2"><strong>雷区：</strong>{analysis.risks.minefield}</p>
          </div>
          {analysis.advanced ? <p className="text-sm text-ink">{analysis.advanced}</p> : null}
          <ReplySuggestions
            replies={analysis.replies}
            selectedReplyIndex={selectedReplyIndex}
            regenerating={regenerating}
            onSelect={onSelectReply}
            onRegenerate={onRegenerate}
          />
        </div>
      ) : null}
    </article>
  );
}
