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
    <article className="glass-strong rounded-2xl p-5 amber-line animate-fade-in">
      <button
        type="button"
        aria-label={open ? "折叠分析" : "展开分析"}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left group"
      >
        <span className="font-display font-semibold text-ink flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-coral/10 border border-coral/20 flex items-center justify-center text-xs">
            ◈
          </span>
          意图分析
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-coral/[0.08] border border-coral/20 px-2.5 py-1 text-[10px] font-semibold text-coral tracking-wide">
            {analysis.risks.atmosphere}
          </span>
          <span className="text-sage text-xs transition-transform duration-200 group-hover:text-ink">
            {open ? "▾" : "▸"}
          </span>
        </div>
      </button>
      {open ? (
        <div className="mt-5 space-y-5 animate-slide-up">
          <dl className="grid gap-3 md:grid-cols-2">
            {[
              { label: "表面意思", value: analysis.intent.surface },
              { label: "真实意图", value: analysis.intent.real },
              { label: "情绪状态", value: analysis.intent.emotion },
              { label: "话外之音", value: analysis.intent.subtext }
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3.5">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-coral">{item.label}</dt>
                <dd className="mt-1.5 text-sm text-ink leading-relaxed">{item.value}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4 text-sm space-y-2.5">
            <p className="text-ink leading-relaxed">
              <span className="text-amber font-semibold">⚠ 可能误解：</span>
              <span className="text-sage ml-1">{analysis.risks.misunderstand}</span>
            </p>
            <p className="text-ink leading-relaxed">
              <span className="text-red-400 font-semibold">✕ 雷区：</span>
              <span className="text-sage ml-1">{analysis.risks.minefield}</span>
            </p>
          </div>
          {analysis.advanced ? (
            <p className="text-sm text-sage leading-relaxed pl-4 border-l-2 border-coral/20">{analysis.advanced}</p>
          ) : null}
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
