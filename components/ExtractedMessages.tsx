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
    <section className="rounded border border-mist bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">确认截图识别结果</h2>
        <button type="button" onClick={onCancel} className="text-sm text-coral">取消</button>
      </div>
      <div className="space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="grid gap-2 md:grid-cols-[120px_1fr_44px]">
            <select
              aria-label={`发送方 ${message.id}`}
              value={message.sender}
              onChange={(event) => updateMessage(message.id, { sender: event.target.value as Sender })}
              className="h-10 rounded border border-mist px-2"
            >
              <option value="other">对方</option>
              <option value="me">我</option>
            </select>
            <input
              aria-label={`编辑消息 ${message.id}`}
              value={message.content}
              onChange={(event) => updateMessage(message.id, { content: event.target.value })}
              className="h-10 rounded border border-mist px-3"
            />
            <button
              type="button"
              aria-label={`删除消息 ${message.id}`}
              onClick={() => onChange(messages.filter((item) => item.id !== message.id))}
              className="h-10 rounded border border-mist text-coral"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className="mt-4 h-10 rounded bg-coral px-4 text-sm font-semibold text-white"
      >
        确认导入
      </button>
    </section>
  );
}
