"use client";

import type { ReplySuggestion } from "../lib/types";

export default function ReplySuggestions({
  replies,
  selectedReplyIndex,
  regenerating,
  onSelect,
  onRegenerate
}: {
  replies: ReplySuggestion[];
  selectedReplyIndex: number | null;
  regenerating: boolean;
  onSelect: (index: number) => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-3">
        {replies.map((reply, index) => {
          const selected = selectedReplyIndex === index;
          const dimmed = selectedReplyIndex !== null && !selected;
          return (
            <button
              key={`${reply.style}-${reply.text}`}
              type="button"
              aria-label={`选择回复：${reply.text}`}
              onClick={() => onSelect(index)}
              className={`min-h-36 rounded-2xl border p-4 text-left transition-all duration-300 ${
                selected
                  ? "border-coral/50 bg-coral/[0.08] text-ink shadow-amber"
                  : "border-white/[0.06] bg-white/[0.03] text-ink hover:border-white/[0.1] hover:bg-white/[0.05]"
              } ${dimmed ? "opacity-35" : "opacity-100"}`}
            >
              <div className="mb-2.5 text-xs font-semibold flex items-center gap-2">
                <span className="text-base">{reply.emoji}</span>
                <span className={selected ? "text-coral" : "text-sage"}>{reply.style}</span>
              </div>
              <p className="mb-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{reply.text}</p>
              <p className="text-[10px] text-sage/70 leading-relaxed">{reply.strategy}</p>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="🔄 换一批"
        disabled={regenerating}
        onClick={onRegenerate}
        className="h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 text-xs font-semibold text-sage transition-all duration-200 hover:border-coral/30 hover:text-coral disabled:opacity-40"
      >
        {regenerating ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
            生成中
          </span>
        ) : (
          <span className="flex items-center gap-2">↻ 换一批</span>
        )}
      </button>
    </div>
  );
}
