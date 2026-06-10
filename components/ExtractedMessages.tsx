"use client";

import type { ExtractedMessage, Sender } from "../lib/types";

export default function ExtractedMessages({
  messages,
  onChange,
  onConfirm,
  onCancel
}: {
  messages: ExtractedMessage[];
  onChange: (messages: ExtractedMessage[]) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  function updateMessage(id: string, patch: Partial<ExtractedMessage>) {
    onChange(messages.map((message) => (message.id === id ? { ...message, ...patch } : message)));
  }

  return (
    <section className="glass-strong rounded-2xl p-5 animate-slide-up">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-display font-semibold text-ink flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-coral/10 border border-coral/20 flex items-center justify-center text-xs">
            📸
          </span>
          确认截图识别结果
        </h2>
        <button type="button" onClick={onCancel} className="text-xs text-sage transition-all duration-200 hover:text-red-400">
          取消
        </button>
      </div>
      <div className="space-y-2.5">
        {messages.map((message) => (
          <div key={message.id} className="grid gap-2 md:grid-cols-[120px_1fr_40px]">
            <select
              aria-label={`发送方 ${message.id}`}
              value={message.sender}
              onChange={(event) => updateMessage(message.id, { sender: event.target.value as Sender })}
              className="h-10 rounded-xl border border-white/[0.06] bg-white/[0.04] px-2 text-sm text-ink appearance-none"
            >
              <option value="other">对方</option>
              <option value="me">我</option>
            </select>
            <input
              aria-label={`编辑消息 ${message.id}`}
              value={message.content}
              onChange={(event) => updateMessage(message.id, { content: event.target.value })}
              className="h-10 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 text-sm text-ink transition-all duration-200 focus:border-coral/40 focus:ring-1 focus:ring-coral/15"
            />
            <button
              type="button"
              aria-label={`删除消息 ${message.id}`}
              onClick={() => onChange(messages.filter((item) => item.id !== message.id))}
              className="h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm text-sage/50 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className="mt-4 h-10 rounded-xl bg-gradient-to-r from-coral to-coral-dark px-5 text-sm font-semibold text-night-900 shadow-amber transition-all duration-200 hover:shadow-amber-lg hover:scale-[1.02] active:scale-[0.98]"
      >
        ✓ 确认导入
      </button>
    </section>
  );
}
