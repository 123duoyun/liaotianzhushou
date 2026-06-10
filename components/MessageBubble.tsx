"use client";

import type { Message } from "../lib/types";

export default function MessageBubble({ message }: { message: Message }) {
  const isMe = message.sender === "me";
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] px-4 py-3 text-sm ${
          isMe
            ? "rounded-2xl rounded-br-md bg-gradient-to-br from-coral/20 to-coral/10 border border-coral/20 text-ink"
            : "rounded-2xl rounded-bl-md glass border border-white/[0.06] text-ink"
        }`}
      >
        {message.time ? <div className="mb-1.5 text-[10px] text-sage tracking-wide">{message.time}</div> : null}
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
