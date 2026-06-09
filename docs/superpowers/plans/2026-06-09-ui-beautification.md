# UI 美化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将聊天助手 UI 从平面风格升级为现代森林绿配色，增加圆角、阴影、hover 状态和图标。

**Architecture:** 更新 Tailwind 颜色 token，逐个组件修改样式类。所有文字保持高对比度（浅绿背景+深绿文字，深绿背景+白色文字）。

**Tech Stack:** Next.js, React, Tailwind CSS, Vitest

---

### Task 1: 更新 Tailwind 配色

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: 更新颜色 token**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a3a1a",
        paper: "#f0f7f0",
        mist: "#d4e4d4",
        sage: "#4a7c59",
        coral: "#22c55e",
        "coral-dark": "#166534",
        "coral-light": "#dcfce7",
        "coral-border": "#86efac",
        amber: "#d6a84f",
        violet: "#7d6b9f"
      }
    }
  },
  plugins: []
};

export default config;
```

- [ ] **Step 2: 运行测试确认无回归**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add tailwind.config.ts
git commit -m "feat: update color tokens to forest green scheme"
```

---

### Task 2: 更新全局样式

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: 更新 CSS**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
}

body {
  margin: 0;
  background: #f0f7f0;
  color: #1a3a1a;
}

button,
input,
select,
textarea {
  font: inherit;
  color: #1a3a1a;
}

button {
  touch-action: manipulation;
}

@layer utilities {
  .shadow-green {
    box-shadow: 0 4px 14px rgba(34, 197, 94, 0.25);
  }
}
```

- [ ] **Step 2: 运行测试**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add app/globals.css
git commit -m "feat: update global styles for forest green theme"
```

---

### Task 3: 更新消息气泡

**Files:**
- Modify: `components/MessageBubble.tsx`

- [ ] **Step 1: 更新组件样式**

```tsx
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
```

- [ ] **Step 2: 运行测试**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add components/MessageBubble.tsx
git commit -m "feat: update message bubble with forest green style"
```

---

### Task 4: 更新分析卡片

**Files:**
- Modify: `components/AnalysisCard.tsx`

- [ ] **Step 1: 更新组件**

```tsx
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
    <article className="rounded-xl border-l-4 border-coral bg-white p-4 shadow-md">
      <button
        type="button"
        aria-label={open ? "折叠分析" : "展开分析"}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-semibold text-ink">📋 意图分析</span>
        <span className="rounded-lg border border-coral-border bg-coral-light px-2 py-0.5 text-xs text-coral-dark">
          {analysis.risks.atmosphere}
        </span>
      </button>
      {open ? (
        <div className="mt-4 space-y-4">
          <dl className="grid gap-3 md:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-sage">表面意思</dt>
              <dd className="mt-1 text-sm text-ink">{analysis.intent.surface}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-sage">真实意图</dt>
              <dd className="mt-1 text-sm text-ink">{analysis.intent.real}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-sage">情绪状态</dt>
              <dd className="mt-1 text-sm text-ink">{analysis.intent.emotion}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-sage">话外之音</dt>
              <dd className="mt-1 text-sm text-ink">{analysis.intent.subtext}</dd>
            </div>
          </dl>
          <div className="rounded-xl bg-paper p-3 text-sm text-ink">
            <p><strong>⚠️ 可能误解：</strong>{analysis.risks.misunderstand}</p>
            <p className="mt-2"><strong>🚫 雷区：</strong>{analysis.risks.minefield}</p>
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
```

- [ ] **Step 2: 运行测试**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add components/AnalysisCard.tsx
git commit -m "feat: update analysis card with forest green style"
```

---

### Task 5: 更新回复建议

**Files:**
- Modify: `components/ReplySuggestions.tsx`

- [ ] **Step 1: 更新组件**

```tsx
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
              className={`min-h-36 rounded-xl border p-4 text-left transition-all duration-200 ${
                selected
                  ? "border-coral bg-coral-light text-coral-dark shadow-lg"
                  : "border-mist bg-white text-ink hover:border-coral-border hover:shadow-md"
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
        className="h-10 rounded-xl border border-sage bg-paper px-4 text-sm font-semibold text-ink transition-all duration-200 hover:bg-coral-light disabled:opacity-50"
      >
        🔄 {regenerating ? "生成中" : "换一批"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 运行测试**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add components/ReplySuggestions.tsx
git commit -m "feat: update reply suggestions with forest green style"
```

---

### Task 6: 更新推理显示

**Files:**
- Modify: `components/ReasoningDisplay.tsx`

- [ ] **Step 1: 更新组件**

```tsx
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
      <article className="rounded-xl border-l-4 border-red-500 bg-white p-4 shadow-md">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      </article>
    );
  }

  const hasReasoning = reasoningText.length > 0;
  const hasContent = contentText.length > 0;

  return (
    <article className="rounded-xl border-l-4 border-coral bg-white p-4 shadow-md">
      {hasReasoning ? (
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className={phase === "reasoning" ? "animate-pulse" : ""}>🧠</span>
            <span>{phase === "reasoning" ? "思考中..." : "思考完成"}</span>
          </div>
          <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-sm text-ink/70">
            {reasoningText}
            {phase === "reasoning" && !hasContent ? <span className="animate-pulse">▌</span> : null}
          </p>
        </div>
      ) : null}

      {hasContent ? (
        <div className={hasReasoning ? "mt-3 border-t border-mist pt-3" : ""}>
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className={phase === "analyzing" ? "animate-pulse" : ""}>📝</span>
            <span>{phase === "analyzing" ? "生成中..." : "生成完成"}</span>
          </div>
          <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs text-ink/60">
            {contentText}
            {phase === "analyzing" ? <span className="animate-pulse">▌</span> : null}
          </p>
        </div>
      ) : !hasReasoning ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="animate-pulse">🧠</span>
          <span>分析中...</span>
        </div>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 2: 运行测试**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add components/ReasoningDisplay.tsx
git commit -m "feat: update reasoning display with forest green style"
```

---

### Task 7: 更新工作区面板

**Files:**
- Modify: `components/WorkspacePanel.tsx`
- Modify: `components/WorkspaceSwitcher.tsx`

- [ ] **Step 1: 更新 WorkspaceSwitcher**

```tsx
"use client";

import type { Workspace } from "../lib/types";

export default function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
  onSwitch,
  onCreate,
  onDelete
}: {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSwitch: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section aria-label="Workspace 列表" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">💬 聊天对象</h2>
        <button
          type="button"
          aria-label="新建聊天对象"
          onClick={onCreate}
          className="grid h-8 w-8 place-items-center rounded-xl border-2 border-coral text-lg font-semibold text-coral transition-all duration-200 hover:bg-coral-light"
        >
          +
        </button>
      </div>
      <div className="space-y-2">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="flex gap-2">
            <button
              type="button"
              aria-label={`切换到 ${workspace.name}`}
              onClick={() => onSwitch(workspace.id)}
              className={`min-h-10 flex-1 rounded-xl border px-3 text-left text-sm transition-all duration-200 ${
                workspace.id === activeWorkspaceId
                  ? "border-coral bg-coral-light font-semibold text-coral-dark"
                  : "border-mist bg-white text-ink hover:border-coral-border hover:bg-green-50"
              }`}
            >
              {workspace.name}
            </button>
            <button
              type="button"
              aria-label={`删除 ${workspace.name}`}
              onClick={() => onDelete(workspace.id)}
              className="h-10 w-10 rounded-xl border border-mist bg-white text-sm text-red-500 transition-all duration-200 hover:border-red-300 hover:bg-red-50"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 更新 WorkspacePanel**

Read the current `WorkspacePanel.tsx`, then update:
- `<aside>` class: add `shadow-lg`
- All inputs: change `rounded` to `rounded-xl`, add `text-ink`
- Labels: change `text-sage` color to `text-sage` (already correct)
- API toggle button: add icon `⚙️`, change to `rounded-xl`
- All `<select>` options: ensure `text-ink`

- [ ] **Step 3: 运行测试**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: 提交**

```bash
git add components/WorkspacePanel.tsx components/WorkspaceSwitcher.tsx
git commit -m "feat: update workspace panel with forest green style"
```

---

### Task 8: 更新聊天区域

**Files:**
- Modify: `components/ChatArea.tsx`

- [ ] **Step 1: 更新组件**

Key changes:
- Empty state: add icon `🌿` and subtitle
- Textarea: `rounded-xl`, add `text-ink`, focus ring `focus:border-coral focus:ring-2 focus:ring-coral/20`
- Submit button: `rounded-xl`, dark green bg `bg-coral-dark text-white`, add icon `✨`, shadow `shadow-green`
- ScreenshotUploader button: add icon `📷`
- Error alert: `rounded-xl`
- Form footer: add `shadow-lg`

- [ ] **Step 2: 更新 ScreenshotUploader**

```tsx
"use client";

import { useEffect, useRef } from "react";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

export default function ScreenshotUploader({
  disabled,
  onImages
}: {
  disabled: boolean;
  onImages: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    const imageFiles = Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      return;
    }
    onImages(await Promise.all(imageFiles.map(readFileAsDataUrl)));
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  useEffect(() => {
    async function handlePaste(event: ClipboardEvent) {
      const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith("image/"));
      if (files.length > 0 && !disabled) {
        onImages(await Promise.all(files.map(readFileAsDataUrl)));
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled, onImages]);

  return (
    <label className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-sage bg-paper px-4 text-sm font-semibold text-ink transition-all duration-200 hover:bg-coral-light">
      📷 上传截图
      <input
        ref={inputRef}
        aria-label="上传截图"
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        onChange={(event) => handleFiles(event.target.files)}
        className="sr-only"
      />
    </label>
  );
}
```

- [ ] **Step 3: 运行测试**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: 提交**

```bash
git add components/ChatArea.tsx components/ScreenshotUploader.tsx
git commit -m "feat: update chat area with forest green style"
```

---

### Task 9: 更新提取消息

**Files:**
- Modify: `components/ExtractedMessages.tsx`

- [ ] **Step 1: 更新组件**

Key changes:
- Outer section: `rounded-xl shadow-md`
- Inputs/selects: `rounded-xl text-ink`
- Delete button: `rounded-xl hover:bg-red-50 hover:border-red-300`
- Confirm button: `rounded-xl bg-coral-dark text-white shadow-green`, add icon `✅`
- Cancel button: add hover state

- [ ] **Step 2: 运行测试**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add components/ExtractedMessages.tsx
git commit -m "feat: update extracted messages with forest green style"
```

---

### Task 10: 最终验证

- [ ] **Step 1: 运行完整测试**

Run: `npm test`
Expected: PASS

- [ ] **Step 2: 运行构建**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: 启动开发服务器验证**

Run: `npm run dev`
Expected: 服务器启动，浏览器打开 http://localhost:3000 查看效果

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "feat: complete UI beautification with forest green theme"
```
