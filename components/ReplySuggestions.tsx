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
              className={`min-h-36 rounded border p-4 text-left transition ${
                selected ? "border-coral bg-coral text-white" : "border-mist bg-white text-ink"
              } ${dimmed ? "opacity-45" : "opacity-100"}`}
            >
              <div className="mb-2 text-sm font-semibold">{reply.emoji} {reply.style}</div>
              <p className="mb-3 whitespace-pre-wrap break-words text-sm">{reply.text}</p>
              <p className="text-xs opacity-75">{reply.strategy}</p>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="换一批"
        disabled={regenerating}
        onClick={onRegenerate}
        className="h-10 rounded border border-sage bg-paper px-4 text-sm font-semibold disabled:opacity-50"
      >
        {regenerating ? "生成中" : "换一批"}
      </button>
    </div>
  );
}
