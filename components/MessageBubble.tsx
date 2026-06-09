"use client";

import type { Message } from "../lib/types";

export default function MessageBubble({ message }: { message: Message }) {
  const isMe = message.sender === "me";
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] px-4 py-3 text-sm shadow-md ${
          isMe
            ? "rounded-2xl rounded-br-md border border-coral-border bg-coral-light text-coral-dark"
            : "rounded-2xl rounded-bl-md bg-white text-ink"
        }`}
      >
        {message.time ? <div className="mb-1 text-xs opacity-70">{message.time}</div> : null}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
