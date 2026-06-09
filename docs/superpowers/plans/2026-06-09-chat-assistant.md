# Chat Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js web app that analyzes pasted or screenshot-extracted chat messages, tracks each chat object's workspace history, and returns high-EQ intent analysis plus three reply suggestions.

**Architecture:** The app stores all user-facing state in `localStorage` through focused helpers in `lib/storage.ts`, while React components receive explicit props and mutate state from `app/page.tsx`. API routes share OpenAI-compatible client and prompt helpers from `lib/ai.ts` and `lib/prompt.ts`, so analyze, regenerate, and screenshot extraction stay small and testable.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest, Testing Library, OpenAI-compatible Chat Completions API.

---

## Scope

This plan implements the complete product described in `docs/superpowers/specs/2026-06-09-chat-assistant-design.md`: workspace management, per-workspace settings, persistent conversation history, manual message entry, screenshot extraction confirmation, AI analysis, reply regeneration, selected-reply context, and friendly error handling.

The repository currently contains only `README.md`, `.gitignore`, and the spec. The first task creates the project scaffold instead of adapting an existing Next.js app.

## File Structure

- Create `package.json`: scripts and dependencies for Next.js, Tailwind, Vitest, and Testing Library.
- Create `tsconfig.json`, `next-env.d.ts`, `next.config.ts`: TypeScript and Next.js configuration.
- Create `postcss.config.mjs`, `tailwind.config.ts`, `app/globals.css`: Tailwind setup and base visual system.
- Create `vitest.config.ts`, `test/setup.ts`: test runner and DOM matchers.
- Create `app/layout.tsx`: root metadata and shell.
- Create `app/page.tsx`: stateful application container, localStorage hydration, API orchestration.
- Create `lib/types.ts`: shared domain types and API contracts.
- Create `lib/storage.ts`: default app data, normalization, `localStorage` load/save helpers.
- Create `lib/prompt.ts`: chat analysis, reply regeneration, and screenshot extraction prompt builders.
- Create `lib/ai.ts`: OpenAI-compatible request helper, JSON extraction, and API response validation.
- Create `app/api/analyze/route.ts`: analyze a new message.
- Create `app/api/regenerate-replies/route.ts`: regenerate three replies without changing intent analysis.
- Create `app/api/extract-from-screenshot/route.ts`: extract ordered messages from uploaded screenshots.
- Create `components/WorkspacePanel.tsx`: left workspace panel and settings.
- Create `components/WorkspaceSwitcher.tsx`: workspace list, create, rename, delete.
- Create `components/ChatArea.tsx`: conversation timeline and composer orchestration.
- Create `components/MessageBubble.tsx`: stable message bubble rendering.
- Create `components/AnalysisCard.tsx`: collapsible analysis, risk, trend, and advanced advice.
- Create `components/ReplySuggestions.tsx`: selectable reply cards and regenerate button.
- Create `components/ScreenshotUploader.tsx`: file upload and paste-image capture.
- Create `components/ExtractedMessages.tsx`: editable extraction review before saving.
- Create `tests/lib/storage.test.ts`: persistence and normalization tests.
- Create `tests/lib/prompt.test.ts`: prompt content tests.
- Create `tests/lib/ai.test.ts`: JSON parsing and API error tests.
- Create `tests/api/analyze.test.ts`: analyze route contract tests.
- Create `tests/api/regenerate-replies.test.ts`: regenerate route contract tests.
- Create `tests/api/extract-from-screenshot.test.ts`: screenshot route contract tests.
- Create `tests/components/workspace-panel.test.tsx`: workspace UI behavior tests.
- Create `tests/components/chat-flow.test.tsx`: end-to-end component flow tests.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Modify: `.gitignore`

- [ ] **Step 1: Write the failing scaffold smoke test**

Create `tests/scaffold.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import Home from "../app/page";

describe("project scaffold", () => {
  it("exports the home page component", () => {
    expect(typeof Home).toBe("function");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- tests/scaffold.test.ts
```

Expected: command fails because `package.json` and the test runner do not exist yet.

- [ ] **Step 3: Create the minimal Next.js and test scaffold**

Create `package.json`:

```json
{
  "name": "liaotianzhushou",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^16.2.7",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^25.9.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.2",
    "autoprefixer": "^10.5.0",
    "jsdom": "^29.1.1",
    "postcss": "^8.5.15",
    "tailwindcss": "^3.4.19",
    "typescript": "^6.0.3",
    "vitest": "^4.1.8"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `next-env.d.ts`:

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// This file is generated-style project metadata and should remain checked in.
```

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false
};

export default nextConfig;
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        paper: "#f7f5ef",
        mist: "#e8eef2",
        sage: "#8aa39b",
        coral: "#d96c5f",
        amber: "#d6a84f",
        violet: "#7d6b9f"
      }
    }
  },
  plugins: []
};

export default config;
```

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"]
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname
    }
  }
});
```

Create `test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "高情商聊天助手",
  description: "分析聊天意图并生成自然回复建议"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

Create `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <h1 className="sr-only">高情商聊天助手</h1>
    </main>
  );
}
```

Create `app/globals.css`:

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

body {
  margin: 0;
  background: #f7f5ef;
  color: #172026;
}

button,
input,
select,
textarea {
  font: inherit;
}
```

Modify `.gitignore`:

```gitignore
.superpowers/
.next/
node_modules/
.env.local
coverage/
```

- [ ] **Step 4: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and npm exits with code 0.

- [ ] **Step 5: Run the scaffold test**

Run:

```bash
npm test -- tests/scaffold.test.ts
```

Expected: PASS.

- [ ] **Step 6: Build the scaffold**

Run:

```bash
npm run build
```

Expected: Next.js production build completes successfully.

- [ ] **Step 7: Commit**

```bash
git add .gitignore package.json package-lock.json tsconfig.json next-env.d.ts next.config.ts postcss.config.mjs tailwind.config.ts vitest.config.ts test/setup.ts app tests/scaffold.test.ts
git commit -m "chore: scaffold next chat assistant"
```

---

### Task 2: Domain Types and Local Storage

**Files:**
- Create: `lib/types.ts`
- Create: `lib/storage.ts`
- Create: `tests/lib/storage.test.ts`

- [ ] **Step 1: Write failing storage tests**

Create `tests/lib/storage.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CHAT_ASSISTANT_STORAGE_KEY,
  createDefaultAppData,
  createWorkspace,
  loadAppData,
  saveAppData
} from "../../lib/storage";

describe("storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it("creates one default workspace on first load", () => {
    const data = createDefaultAppData();

    expect(data.workspaces).toHaveLength(1);
    expect(data.activeWorkspaceId).toBe(data.workspaces[0].id);
    expect(data.workspaces[0]).toMatchObject({
      name: "新的聊天对象",
      gender: "male",
      relationship: "暧昧",
      goal: "拉近距离",
      messages: []
    });
  });

  it("hydrates API config from public environment defaults", () => {
    vi.stubEnv("NEXT_PUBLIC_OPENAI_BASE_URL", "https://proxy.example.com/v1");
    vi.stubEnv("NEXT_PUBLIC_OPENAI_API_KEY", "sk-local");
    vi.stubEnv("NEXT_PUBLIC_OPENAI_MODEL", "gpt-4o-mini");

    const data = createDefaultAppData();

    expect(data.apiConfig).toEqual({
      baseUrl: "https://proxy.example.com/v1",
      apiKey: "sk-local",
      model: "gpt-4o-mini"
    });
  });

  it("saves and loads app data from localStorage", () => {
    const data = createDefaultAppData();
    const extra = createWorkspace({ name: "小林" });
    data.workspaces.push(extra);
    data.activeWorkspaceId = extra.id;

    saveAppData(data);

    expect(JSON.parse(localStorage.getItem(CHAT_ASSISTANT_STORAGE_KEY) ?? "{}").activeWorkspaceId).toBe(extra.id);
    expect(loadAppData().activeWorkspaceId).toBe(extra.id);
    expect(loadAppData().workspaces[1].name).toBe("小林");
  });

  it("recovers from invalid stored JSON", () => {
    localStorage.setItem(CHAT_ASSISTANT_STORAGE_KEY, "{bad json");

    const data = loadAppData();

    expect(data.workspaces).toHaveLength(1);
    expect(data.activeWorkspaceId).toBe(data.workspaces[0].id);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- tests/lib/storage.test.ts
```

Expected: FAIL with missing `lib/storage` and `lib/types` modules.

- [ ] **Step 3: Create shared domain types**

Create `lib/types.ts`:

```ts
export type Gender = "male" | "female";
export type Sender = "other" | "me";
export type MessageSource = "manual" | "screenshot";
export type ReplyStyle = "温暖真诚型" | "幽默轻松型" | "高段位型";

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ReplySuggestion {
  style: ReplyStyle;
  emoji: string;
  text: string;
  strategy: string;
}

export interface Analysis {
  intent: {
    surface: string;
    real: string;
    emotion: string;
    subtext: string;
  };
  risks: {
    misunderstand: string;
    minefield: string;
    atmosphere: string;
  };
  replies: ReplySuggestion[];
  advanced?: string;
}

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  time?: string | null;
  source: MessageSource;
  analysis: Analysis | null;
  selectedReplyIndex: number | null;
}

export interface Workspace {
  id: string;
  name: string;
  gender: Gender;
  relationship: string;
  goal: string;
  messages: Message[];
}

export interface AppData {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  apiConfig: ApiConfig;
}

export interface ExtractedMessage {
  id: string;
  sender: Sender;
  content: string;
  time?: string | null;
}

export interface AnalyzeRequest {
  workspace: Pick<Workspace, "gender" | "relationship" | "goal">;
  history: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }>;
  newMessage: string;
  apiConfig: ApiConfig;
}

export interface AnalyzeResponse {
  analysis: Analysis;
}

export interface RegenerateRepliesRequest {
  workspace: Pick<Workspace, "gender" | "relationship" | "goal">;
  message: string;
  existingAnalysis: Pick<Analysis, "intent" | "risks">;
  previousReplies: string[];
  history: AnalyzeRequest["history"];
  apiConfig: ApiConfig;
}

export interface RegenerateRepliesResponse {
  replies: ReplySuggestion[];
}

export interface ExtractFromScreenshotRequest {
  images: string[];
  apiConfig: ApiConfig;
}

export interface ExtractFromScreenshotResponse {
  messages: Array<Omit<ExtractedMessage, "id">>;
}
```

- [ ] **Step 4: Implement storage helpers**

Create `lib/storage.ts`:

```ts
import type { ApiConfig, AppData, Gender, Message, Workspace } from "./types";

export const CHAT_ASSISTANT_STORAGE_KEY = "chat-assistant-data";

const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o"
};

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getDefaultApiConfig(): ApiConfig {
  return {
    baseUrl: process.env.NEXT_PUBLIC_OPENAI_BASE_URL || DEFAULT_API_CONFIG.baseUrl,
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || DEFAULT_API_CONFIG.apiKey,
    model: process.env.NEXT_PUBLIC_OPENAI_MODEL || DEFAULT_API_CONFIG.model
  };
}

export function createWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  return {
    id: overrides.id ?? createId("workspace"),
    name: overrides.name ?? "新的聊天对象",
    gender: overrides.gender ?? "male",
    relationship: overrides.relationship ?? "暧昧",
    goal: overrides.goal ?? "拉近距离",
    messages: overrides.messages ?? []
  };
}

export function createMessage(input: Pick<Message, "sender" | "content" | "source"> & Partial<Message>): Message {
  return {
    id: input.id ?? createId("message"),
    sender: input.sender,
    content: input.content,
    time: input.time ?? null,
    source: input.source,
    analysis: input.analysis ?? null,
    selectedReplyIndex: input.selectedReplyIndex ?? null
  };
}

export function createDefaultAppData(): AppData {
  const workspace = createWorkspace();
  return {
    workspaces: [workspace],
    activeWorkspaceId: workspace.id,
    apiConfig: getDefaultApiConfig()
  };
}

function isGender(value: unknown): value is Gender {
  return value === "male" || value === "female";
}

function normalizeWorkspace(value: Partial<Workspace> | undefined): Workspace {
  const fallback = createWorkspace();
  return {
    id: typeof value?.id === "string" ? value.id : fallback.id,
    name: typeof value?.name === "string" && value.name.trim() ? value.name : fallback.name,
    gender: isGender(value?.gender) ? value.gender : fallback.gender,
    relationship: typeof value?.relationship === "string" && value.relationship.trim() ? value.relationship : fallback.relationship,
    goal: typeof value?.goal === "string" && value.goal.trim() ? value.goal : fallback.goal,
    messages: Array.isArray(value?.messages) ? value.messages : []
  };
}

export function normalizeAppData(value: Partial<AppData> | null | undefined): AppData {
  const fallback = createDefaultAppData();
  const workspaces = Array.isArray(value?.workspaces) && value.workspaces.length > 0
    ? value.workspaces.map(normalizeWorkspace)
    : fallback.workspaces;
  const activeWorkspaceId = workspaces.some((workspace) => workspace.id === value?.activeWorkspaceId)
    ? String(value?.activeWorkspaceId)
    : workspaces[0].id;

  return {
    workspaces,
    activeWorkspaceId,
    apiConfig: {
      ...fallback.apiConfig,
      ...(value?.apiConfig ?? {})
    }
  };
}

export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return createDefaultAppData();
  }

  const raw = window.localStorage.getItem(CHAT_ASSISTANT_STORAGE_KEY);
  if (!raw) {
    return createDefaultAppData();
  }

  try {
    return normalizeAppData(JSON.parse(raw) as Partial<AppData>);
  } catch {
    return createDefaultAppData();
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CHAT_ASSISTANT_STORAGE_KEY, JSON.stringify(data));
}
```

- [ ] **Step 5: Run storage tests**

Run:

```bash
npm test -- tests/lib/storage.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/types.ts lib/storage.ts tests/lib/storage.test.ts
git commit -m "feat: add chat assistant data model"
```

---

### Task 3: Prompt Builders

**Files:**
- Create: `lib/prompt.ts`
- Create: `tests/lib/prompt.test.ts`

- [ ] **Step 1: Write failing prompt tests**

Create `tests/lib/prompt.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  buildAnalysisPrompt,
  buildRegenerateRepliesPrompt,
  buildScreenshotExtractionPrompt
} from "../../lib/prompt";

describe("prompt builders", () => {
  it("builds the analysis prompt with profile, context, and strict JSON schema", () => {
    const prompt = buildAnalysisPrompt({
      workspace: { gender: "male", relationship: "暧昧", goal: "拉近距离" },
      history: [
        { role: "user", content: "在干嘛呀" },
        { role: "user_selected_reply", content: "刚忙完，正好想到你" }
      ],
      newMessage: "周末有空吗，想去看那个展"
    });

    expect(prompt).toContain("性别：male");
    expect(prompt).toContain("与对方关系：暧昧");
    expect(prompt).toContain("期望效果：拉近距离");
    expect(prompt).toContain("周末有空吗，想去看那个展");
    expect(prompt).toContain('"intent"');
    expect(prompt).toContain('"replies"');
    expect(prompt).toContain("回复必须口语化");
  });

  it("builds regenerate prompt that preserves intent and excludes old reply text", () => {
    const prompt = buildRegenerateRepliesPrompt({
      workspace: { gender: "female", relationship: "朋友", goal: "正常聊天" },
      message: "今天好累",
      existingAnalysis: {
        intent: { surface: "表达疲惫", real: "想被关心", emotion: "低落", subtext: "希望有人接住情绪" },
        risks: { misunderstand: "别说教", minefield: "别比较谁更累", atmosphere: "↓ 需要安抚" }
      },
      previousReplies: ["早点睡", "多喝热水"],
      history: []
    });

    expect(prompt).toContain("保持以下意图分析不变");
    expect(prompt).toContain("今天好累");
    expect(prompt).toContain("早点睡");
    expect(prompt).toContain('"replies"');
  });

  it("builds screenshot extraction prompt with sender rules", () => {
    const prompt = buildScreenshotExtractionPrompt();

    expect(prompt).toContain('右侧气泡为"me"');
    expect(prompt).toContain('左侧气泡为"other"');
    expect(prompt).toContain('"messages"');
    expect(prompt).toContain("按从上到下顺序排列");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- tests/lib/prompt.test.ts
```

Expected: FAIL with missing `lib/prompt` module.

- [ ] **Step 3: Implement prompt builders**

Create `lib/prompt.ts`:

```ts
import type { AnalyzeRequest, RegenerateRepliesRequest } from "./types";

type PromptAnalysisInput = Omit<AnalyzeRequest, "apiConfig">;
type PromptRegenerateInput = Omit<RegenerateRepliesRequest, "apiConfig">;

function formatHistory(history: AnalyzeRequest["history"]): string {
  if (history.length === 0) {
    return "无历史上下文";
  }

  return history
    .map((item, index) => `${index + 1}. ${item.role}: ${item.content}`)
    .join("\n");
}

export function buildAnalysisPrompt(input: PromptAnalysisInput): string {
  return `你是一个高情商聊天助手。根据用户提供的上下文信息分析聊天记录。

用户信息：
- 性别：${input.workspace.gender}
- 与对方关系：${input.workspace.relationship}
- 期望效果：${input.workspace.goal}

历史上下文：
${formatHistory(input.history)}

需要分析的新消息：
${input.newMessage}

请只输出 JSON 对象，不要输出 Markdown。JSON 格式必须是：
{
  "intent": {
    "surface": "表面意思",
    "real": "真实意图或潜台词",
    "emotion": "情绪状态",
    "subtext": "话外之音"
  },
  "risks": {
    "misunderstand": "可能误解的地方",
    "minefield": "雷区",
    "atmosphere": "氛围趋势，例如 ↑升温 或 ↓降温"
  },
  "replies": [
    { "style": "温暖真诚型", "emoji": "🟢", "text": "可直接发送的口语化回复", "strategy": "策略意图" },
    { "style": "幽默轻松型", "emoji": "🟡", "text": "可直接发送的口语化回复", "strategy": "策略意图" },
    { "style": "高段位型", "emoji": "🔴", "text": "可直接发送的口语化回复", "strategy": "策略意图" }
  ],
  "advanced": "进阶建议，可省略"
}

规则：
- 回复必须口语化，像真人打字。
- 根据用户性别和关系调整建议风格。
- 考虑之前的对话上下文，尤其是用户已经选择过的回复。
- 直接给可用的回复，不要模板化表达。
- 三条回复必须是不同策略。`;
}

export function buildRegenerateRepliesPrompt(input: PromptRegenerateInput): string {
  return `你是一个高情商聊天助手。请基于同一条消息重新生成 3 条回复建议。

用户信息：
- 性别：${input.workspace.gender}
- 与对方关系：${input.workspace.relationship}
- 期望效果：${input.workspace.goal}

消息：
${input.message}

保持以下意图分析不变：
${JSON.stringify(input.existingAnalysis.intent, null, 2)}

保持以下风险判断不变：
${JSON.stringify(input.existingAnalysis.risks, null, 2)}

历史上下文：
${formatHistory(input.history)}

之前已经给过的回复，新的回复不要重复这些文字：
${input.previousReplies.map((reply, index) => `${index + 1}. ${reply}`).join("\n") || "无"}

请只输出 JSON 对象，不要输出 Markdown。JSON 格式必须是：
{
  "replies": [
    { "style": "温暖真诚型", "emoji": "🟢", "text": "新的口语化回复", "strategy": "策略意图" },
    { "style": "幽默轻松型", "emoji": "🟡", "text": "新的口语化回复", "strategy": "策略意图" },
    { "style": "高段位型", "emoji": "🔴", "text": "新的口语化回复", "strategy": "策略意图" }
  ]
}`;
}

export function buildScreenshotExtractionPrompt(): string {
  return `请识别聊天截图中的对话记录。按时间顺序提取每条消息。

识别规则：
- 区分发送方：右侧气泡为"me"（我），左侧气泡为"other"（对方）。
- 提取消息文字内容。
- 如果能看到时间，提取时间；看不到时使用 null。
- 如果有多条消息，按从上到下顺序排列。
- 支持微信、QQ、iMessage 等常见聊天软件的截图格式。
- 多张图片会按上传顺序传入，请保持整体时间顺序并去重。

请只输出 JSON 对象，不要输出 Markdown。JSON 格式必须是：
{
  "messages": [
    { "sender": "other", "content": "消息内容", "time": "14:30" },
    { "sender": "me", "content": "消息内容", "time": null }
  ]
}`;
}
```

- [ ] **Step 4: Run prompt tests**

Run:

```bash
npm test -- tests/lib/prompt.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/prompt.ts tests/lib/prompt.test.ts
git commit -m "feat: add ai prompt builders"
```

---

### Task 4: OpenAI-Compatible API Utilities

**Files:**
- Create: `lib/ai.ts`
- Create: `tests/lib/ai.test.ts`

- [ ] **Step 1: Write failing AI utility tests**

Create `tests/lib/ai.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { callOpenAIJson, extractJsonObject, validateAnalysis, validateReplies } from "../../lib/ai";

describe("AI helpers", () => {
  it("extracts JSON from plain text or fenced output", () => {
    expect(extractJsonObject('{"ok":true}')).toEqual({ ok: true });
    expect(extractJsonObject('```json\n{"ok":true}\n```')).toEqual({ ok: true });
    expect(extractJsonObject('prefix {"ok":true} suffix')).toEqual({ ok: true });
  });

  it("validates analysis shape and reply count", () => {
    const analysis = {
      intent: { surface: "邀请", real: "推进关系", emotion: "期待", subtext: "想见面" },
      risks: { misunderstand: "可能是群体活动", minefield: "别追问太多", atmosphere: "↑升温" },
      replies: [
        { style: "温暖真诚型", emoji: "🟢", text: "好呀，我也想去", strategy: "接住邀约" },
        { style: "幽默轻松型", emoji: "🟡", text: "这是展览邀请还是约会邀请", strategy: "轻松试探" },
        { style: "高段位型", emoji: "🔴", text: "可以，不过你得负责挑时间", strategy: "让对方投入" }
      ],
      advanced: "顺势确认时间"
    };

    expect(validateAnalysis(analysis)).toEqual(analysis);
    expect(validateReplies({ replies: analysis.replies })).toEqual(analysis.replies);
  });

  it("calls an OpenAI-compatible chat completions endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"ok":true}' } }]
      })
    });

    const result = await callOpenAIJson({
      apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "gpt-test" },
      messages: [{ role: "user", content: "hello" }],
      fetcher: fetchMock
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer sk-test" })
      })
    );
  });

  it("throws a friendly error when the API key is missing", async () => {
    await expect(
      callOpenAIJson({
        apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "", model: "gpt-test" },
        messages: [{ role: "user", content: "hello" }]
      })
    ).rejects.toThrow("请先在左侧填写 API Key");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- tests/lib/ai.test.ts
```

Expected: FAIL with missing `lib/ai` module.

- [ ] **Step 3: Implement AI helpers**

Create `lib/ai.ts`:

```ts
import type { Analysis, ApiConfig, ReplySuggestion } from "./types";

type ChatMessage = {
  role: "system" | "user";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
};

type Fetcher = typeof fetch;

export function extractJsonObject(content: string): unknown {
  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("AI 返回格式异常，请重试");
  }
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`AI 返回缺少字段：${label}`);
  }
  return value;
}

function validateReply(value: unknown): ReplySuggestion {
  const reply = value as Partial<ReplySuggestion>;
  return {
    style: requireString(reply.style, "reply.style") as ReplySuggestion["style"],
    emoji: requireString(reply.emoji, "reply.emoji"),
    text: requireString(reply.text, "reply.text"),
    strategy: requireString(reply.strategy, "reply.strategy")
  };
}

export function validateReplies(value: unknown): ReplySuggestion[] {
  const replies = (value as { replies?: unknown }).replies;
  if (!Array.isArray(replies) || replies.length !== 3) {
    throw new Error("AI 必须返回 3 条回复建议");
  }
  return replies.map(validateReply);
}

export function validateAnalysis(value: unknown): Analysis {
  const candidate = value as Partial<Analysis>;
  return {
    intent: {
      surface: requireString(candidate.intent?.surface, "intent.surface"),
      real: requireString(candidate.intent?.real, "intent.real"),
      emotion: requireString(candidate.intent?.emotion, "intent.emotion"),
      subtext: requireString(candidate.intent?.subtext, "intent.subtext")
    },
    risks: {
      misunderstand: requireString(candidate.risks?.misunderstand, "risks.misunderstand"),
      minefield: requireString(candidate.risks?.minefield, "risks.minefield"),
      atmosphere: requireString(candidate.risks?.atmosphere, "risks.atmosphere")
    },
    replies: validateReplies({ replies: candidate.replies }),
    advanced: typeof candidate.advanced === "string" ? candidate.advanced : undefined
  };
}

export async function callOpenAIJson({
  apiConfig,
  messages,
  fetcher = fetch
}: {
  apiConfig: ApiConfig;
  messages: ChatMessage[];
  fetcher?: Fetcher;
}): Promise<unknown> {
  if (!apiConfig.apiKey.trim()) {
    throw new Error("请先在左侧填写 API Key");
  }
  if (!apiConfig.baseUrl.trim()) {
    throw new Error("请先填写 API Base URL");
  }
  if (!apiConfig.model.trim()) {
    throw new Error("请先填写模型名称");
  }

  const baseUrl = apiConfig.baseUrl.replace(/\/$/, "");
  const response = await fetcher(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiConfig.apiKey}`
    },
    body: JSON.stringify({
      model: apiConfig.model,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages
    })
  });

  if (!response.ok) {
    throw new Error(`AI 请求失败：HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("AI 返回为空，请重试");
  }

  return extractJsonObject(content);
}
```

- [ ] **Step 4: Run AI utility tests**

Run:

```bash
npm test -- tests/lib/ai.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/ai.ts tests/lib/ai.test.ts
git commit -m "feat: add openai api utilities"
```

---

### Task 5: API Routes

**Files:**
- Create: `app/api/analyze/route.ts`
- Create: `app/api/regenerate-replies/route.ts`
- Create: `app/api/extract-from-screenshot/route.ts`
- Create: `tests/api/analyze.test.ts`
- Create: `tests/api/regenerate-replies.test.ts`
- Create: `tests/api/extract-from-screenshot.test.ts`

- [ ] **Step 1: Write failing API route tests**

Create `tests/api/analyze.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/analyze/route";

vi.mock("../../lib/ai", async () => {
  const actual = await vi.importActual<typeof import("../../lib/ai")>("../../lib/ai");
  return {
    ...actual,
    callOpenAIJson: vi.fn().mockResolvedValue({
      intent: { surface: "邀请看展", real: "想见面", emotion: "期待", subtext: "推进关系" },
      risks: { misunderstand: "可能不是单独邀约", minefield: "别显得不自信", atmosphere: "↑↑升温" },
      replies: [
        { style: "温暖真诚型", emoji: "🟢", text: "好呀，我也想去那个展", strategy: "表达兴趣" },
        { style: "幽默轻松型", emoji: "🟡", text: "你这是约我还是约展", strategy: "轻松试探" },
        { style: "高段位型", emoji: "🔴", text: "可以，不过时间你来定", strategy: "让对方投入" }
      ],
      advanced: "顺势确认时间"
    })
  };
});

describe("POST /api/analyze", () => {
  it("returns validated analysis JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        body: JSON.stringify({
          workspace: { gender: "male", relationship: "暧昧", goal: "拉近距离" },
          history: [],
          newMessage: "周末有空吗，想去看那个展",
          apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "gpt-test" }
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      analysis: { intent: { real: "想见面" } }
    });
  });
});
```

Create `tests/api/regenerate-replies.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/regenerate-replies/route";

vi.mock("../../lib/ai", async () => {
  const actual = await vi.importActual<typeof import("../../lib/ai")>("../../lib/ai");
  return {
    ...actual,
    callOpenAIJson: vi.fn().mockResolvedValue({
      replies: [
        { style: "温暖真诚型", emoji: "🟢", text: "好呀，那我们周末见", strategy: "明确接受" },
        { style: "幽默轻松型", emoji: "🟡", text: "可以，我负责看展，你负责好看", strategy: "暧昧轻推" },
        { style: "高段位型", emoji: "🔴", text: "行，给你一个表现机会", strategy: "制造互动" }
      ]
    })
  };
});

describe("POST /api/regenerate-replies", () => {
  it("returns three regenerated replies", async () => {
    const response = await POST(
      new Request("http://localhost/api/regenerate-replies", {
        method: "POST",
        body: JSON.stringify({
          workspace: { gender: "male", relationship: "暧昧", goal: "拉近距离" },
          message: "周末有空吗，想去看那个展",
          existingAnalysis: {
            intent: { surface: "邀请", real: "想见面", emotion: "期待", subtext: "推进关系" },
            risks: { misunderstand: "可能不是单独邀约", minefield: "别显得不自信", atmosphere: "↑升温" }
          },
          previousReplies: ["好呀，我也想去那个展"],
          history: [],
          apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "gpt-test" }
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      replies: [{ text: "好呀，那我们周末见" }]
    });
  });
});
```

Create `tests/api/extract-from-screenshot.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/extract-from-screenshot/route";

vi.mock("../../lib/ai", async () => {
  const actual = await vi.importActual<typeof import("../../lib/ai")>("../../lib/ai");
  return {
    ...actual,
    callOpenAIJson: vi.fn().mockResolvedValue({
      messages: [
        { sender: "other", content: "在干嘛呀", time: "14:30" },
        { sender: "me", content: "刚忙完", time: "14:31" }
      ]
    })
  };
});

describe("POST /api/extract-from-screenshot", () => {
  it("returns extracted messages", async () => {
    const response = await POST(
      new Request("http://localhost/api/extract-from-screenshot", {
        method: "POST",
        body: JSON.stringify({
          images: ["data:image/png;base64,abc"],
          apiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "gpt-test" }
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      messages: [
        { sender: "other", content: "在干嘛呀", time: "14:30" },
        { sender: "me", content: "刚忙完", time: "14:31" }
      ]
    });
  });
});
```

- [ ] **Step 2: Run route tests to verify they fail**

Run:

```bash
npm test -- tests/api/analyze.test.ts tests/api/regenerate-replies.test.ts tests/api/extract-from-screenshot.test.ts
```

Expected: FAIL with missing route modules.

- [ ] **Step 3: Implement analyze route**

Create `app/api/analyze/route.ts`:

```ts
import { NextResponse } from "next/server";
import { callOpenAIJson, validateAnalysis } from "../../../lib/ai";
import { buildAnalysisPrompt } from "../../../lib/prompt";
import type { AnalyzeRequest } from "../../../lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const prompt = buildAnalysisPrompt({
      workspace: body.workspace,
      history: body.history ?? [],
      newMessage: body.newMessage
    });
    const raw = await callOpenAIJson({
      apiConfig: body.apiConfig,
      messages: [
        { role: "system", content: "你只输出可解析的 JSON。" },
        { role: "user", content: prompt }
      ]
    });

    return NextResponse.json({ analysis: validateAnalysis(raw) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "分析失败，请重试" },
      { status: 400 }
    );
  }
}
```

- [ ] **Step 4: Implement regenerate route**

Create `app/api/regenerate-replies/route.ts`:

```ts
import { NextResponse } from "next/server";
import { callOpenAIJson, validateReplies } from "../../../lib/ai";
import { buildRegenerateRepliesPrompt } from "../../../lib/prompt";
import type { RegenerateRepliesRequest } from "../../../lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegenerateRepliesRequest;
    const prompt = buildRegenerateRepliesPrompt({
      workspace: body.workspace,
      message: body.message,
      existingAnalysis: body.existingAnalysis,
      previousReplies: body.previousReplies ?? [],
      history: body.history ?? []
    });
    const raw = await callOpenAIJson({
      apiConfig: body.apiConfig,
      messages: [
        { role: "system", content: "你只输出可解析的 JSON。" },
        { role: "user", content: prompt }
      ]
    });

    return NextResponse.json({ replies: validateReplies(raw) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "换一批失败，请重试" },
      { status: 400 }
    );
  }
}
```

- [ ] **Step 5: Implement screenshot extraction route**

Create `app/api/extract-from-screenshot/route.ts`:

```ts
import { NextResponse } from "next/server";
import { callOpenAIJson } from "../../../lib/ai";
import { buildScreenshotExtractionPrompt } from "../../../lib/prompt";
import type { ExtractFromScreenshotRequest, ExtractFromScreenshotResponse, Sender } from "../../../lib/types";

function validateExtractedMessages(value: unknown): ExtractFromScreenshotResponse["messages"] {
  const messages = (value as ExtractFromScreenshotResponse).messages;
  if (!Array.isArray(messages)) {
    throw new Error("截图识别结果缺少 messages");
  }

  return messages.map((message) => {
    const sender = message.sender as Sender;
    if (sender !== "other" && sender !== "me") {
      throw new Error("截图识别结果包含未知发送方");
    }
    if (typeof message.content !== "string" || message.content.trim() === "") {
      throw new Error("截图识别结果包含空消息");
    }
    return {
      sender,
      content: message.content.trim(),
      time: typeof message.time === "string" ? message.time : null
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExtractFromScreenshotRequest;
    if (!Array.isArray(body.images) || body.images.length === 0) {
      throw new Error("请先上传或粘贴截图");
    }

    const raw = await callOpenAIJson({
      apiConfig: body.apiConfig,
      messages: [
        { role: "system", content: "你只输出可解析的 JSON。" },
        {
          role: "user",
          content: [
            { type: "text", text: buildScreenshotExtractionPrompt() },
            ...body.images.map((image) => ({ type: "image_url" as const, image_url: { url: image } }))
          ]
        }
      ]
    });

    return NextResponse.json({ messages: validateExtractedMessages(raw) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "截图识别失败，请重试" },
      { status: 400 }
    );
  }
}
```

- [ ] **Step 6: Run route tests**

Run:

```bash
npm test -- tests/api/analyze.test.ts tests/api/regenerate-replies.test.ts tests/api/extract-from-screenshot.test.ts
```

Expected: PASS.

- [ ] **Step 7: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/api tests/api
git commit -m "feat: add ai api routes"
```

---

### Task 6: Workspace Panel UI

**Files:**
- Create: `components/WorkspaceSwitcher.tsx`
- Create: `components/WorkspacePanel.tsx`
- Create: `tests/components/workspace-panel.test.tsx`

- [ ] **Step 1: Write failing workspace panel tests**

Create `tests/components/workspace-panel.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import WorkspacePanel from "../../components/WorkspacePanel";
import { createDefaultAppData, createWorkspace } from "../../lib/storage";

describe("WorkspacePanel", () => {
  it("switches, creates, updates, and deletes workspaces", async () => {
    const user = userEvent.setup();
    const data = createDefaultAppData();
    data.workspaces = [
      { ...data.workspaces[0], id: "w1", name: "小林" },
      createWorkspace({ id: "w2", name: "阿宁" })
    ];
    data.activeWorkspaceId = "w1";
    const onChange = vi.fn();

    render(<WorkspacePanel data={data} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "切换到 阿宁" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ activeWorkspaceId: "w2" }));

    await user.click(screen.getByRole("button", { name: "新建聊天对象" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ workspaces: expect.any(Array) }));

    await user.clear(screen.getByLabelText("对方备注名"));
    await user.type(screen.getByLabelText("对方备注名"), "新的备注");
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      workspaces: expect.arrayContaining([expect.objectContaining({ id: "w1", name: "新的备注" })])
    }));

    await user.click(screen.getByRole("button", { name: "删除 小林" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ activeWorkspaceId: "w2" }));
  });

  it("updates API config", async () => {
    const user = userEvent.setup();
    const data = createDefaultAppData();
    const onChange = vi.fn();

    render(<WorkspacePanel data={data} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "API 设置" }));
    await user.clear(screen.getByLabelText("模型名称"));
    await user.type(screen.getByLabelText("模型名称"), "gpt-4o-mini");

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      apiConfig: expect.objectContaining({ model: "gpt-4o-mini" })
    }));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- tests/components/workspace-panel.test.tsx
```

Expected: FAIL with missing component modules.

- [ ] **Step 3: Implement workspace switcher**

Create `components/WorkspaceSwitcher.tsx`:

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
        <h2 className="text-sm font-semibold text-ink">聊天对象</h2>
        <button
          type="button"
          aria-label="新建聊天对象"
          onClick={onCreate}
          className="grid h-8 w-8 place-items-center rounded border border-sage bg-white text-lg font-semibold shadow-sm"
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
              className={`min-h-10 flex-1 rounded border px-3 text-left text-sm ${
                workspace.id === activeWorkspaceId
                  ? "border-coral bg-coral text-white"
                  : "border-mist bg-white text-ink"
              }`}
            >
              {workspace.name}
            </button>
            <button
              type="button"
              aria-label={`删除 ${workspace.name}`}
              onClick={() => onDelete(workspace.id)}
              className="h-10 w-10 rounded border border-mist bg-white text-sm text-coral"
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

- [ ] **Step 4: Implement workspace panel**

Create `components/WorkspacePanel.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { createWorkspace } from "../lib/storage";
import type { ApiConfig, AppData, Gender, Workspace } from "../lib/types";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const relationships = ["朋友", "暧昧", "情侣", "同事", "相亲对象", "其他"];
const goals = ["拉近距离", "化解矛盾", "保持吸引力", "正常聊天"];

export default function WorkspacePanel({ data, onChange }: { data: AppData; onChange: (data: AppData) => void }) {
  const [apiOpen, setApiOpen] = useState(false);
  const activeWorkspace = useMemo(
    () => data.workspaces.find((workspace) => workspace.id === data.activeWorkspaceId) ?? data.workspaces[0],
    [data.activeWorkspaceId, data.workspaces]
  );

  function updateWorkspace(id: string, patch: Partial<Workspace>) {
    onChange({
      ...data,
      workspaces: data.workspaces.map((workspace) => (workspace.id === id ? { ...workspace, ...patch } : workspace))
    });
  }

  function updateApiConfig(patch: Partial<ApiConfig>) {
    onChange({ ...data, apiConfig: { ...data.apiConfig, ...patch } });
  }

  function createNewWorkspace() {
    const workspace = createWorkspace();
    onChange({
      ...data,
      workspaces: [...data.workspaces, workspace],
      activeWorkspaceId: workspace.id
    });
  }

  function deleteWorkspace(id: string) {
    if (data.workspaces.length === 1) {
      return;
    }
    const nextWorkspaces = data.workspaces.filter((workspace) => workspace.id !== id);
    onChange({
      ...data,
      workspaces: nextWorkspaces,
      activeWorkspaceId: data.activeWorkspaceId === id ? nextWorkspaces[0].id : data.activeWorkspaceId
    });
  }

  return (
    <aside className="flex h-full w-full flex-col gap-6 border-r border-mist bg-white p-4 md:w-[280px]">
      <WorkspaceSwitcher
        workspaces={data.workspaces}
        activeWorkspaceId={data.activeWorkspaceId}
        onSwitch={(id) => onChange({ ...data, activeWorkspaceId: id })}
        onCreate={createNewWorkspace}
        onDelete={deleteWorkspace}
      />

      <section aria-label="Workspace 设置" className="space-y-4">
        <label className="block text-sm font-medium">
          对方备注名
          <input
            aria-label="对方备注名"
            value={activeWorkspace.name}
            onChange={(event) => updateWorkspace(activeWorkspace.id, { name: event.target.value })}
            className="mt-1 h-10 w-full rounded border border-mist px-3"
          />
        </label>

        <label className="block text-sm font-medium">
          我的性别
          <select
            aria-label="我的性别"
            value={activeWorkspace.gender}
            onChange={(event) => updateWorkspace(activeWorkspace.id, { gender: event.target.value as Gender })}
            className="mt-1 h-10 w-full rounded border border-mist px-3"
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </label>

        <label className="block text-sm font-medium">
          与对方关系
          <select
            aria-label="与对方关系"
            value={activeWorkspace.relationship}
            onChange={(event) => updateWorkspace(activeWorkspace.id, { relationship: event.target.value })}
            className="mt-1 h-10 w-full rounded border border-mist px-3"
          >
            {relationships.map((relationship) => (
              <option key={relationship} value={relationship}>{relationship}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          期望效果
          <select
            aria-label="期望效果"
            value={activeWorkspace.goal}
            onChange={(event) => updateWorkspace(activeWorkspace.id, { goal: event.target.value })}
            className="mt-1 h-10 w-full rounded border border-mist px-3"
          >
            {goals.map((goal) => (
              <option key={goal} value={goal}>{goal}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="mt-auto space-y-3">
        <button
          type="button"
          aria-expanded={apiOpen}
          onClick={() => setApiOpen((open) => !open)}
          className="h-10 w-full rounded border border-sage bg-paper text-sm font-semibold"
        >
          API 设置
        </button>
        {apiOpen ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              API Base URL
              <input
                aria-label="API Base URL"
                value={data.apiConfig.baseUrl}
                onChange={(event) => updateApiConfig({ baseUrl: event.target.value })}
                className="mt-1 h-10 w-full rounded border border-mist px-3"
              />
            </label>
            <label className="block text-sm font-medium">
              API Key
              <input
                aria-label="API Key"
                type="password"
                value={data.apiConfig.apiKey}
                onChange={(event) => updateApiConfig({ apiKey: event.target.value })}
                className="mt-1 h-10 w-full rounded border border-mist px-3"
              />
            </label>
            <label className="block text-sm font-medium">
              模型名称
              <input
                aria-label="模型名称"
                value={data.apiConfig.model}
                onChange={(event) => updateApiConfig({ model: event.target.value })}
                className="mt-1 h-10 w-full rounded border border-mist px-3"
              />
            </label>
          </div>
        ) : null}
      </section>
    </aside>
  );
}
```

- [ ] **Step 5: Run workspace panel tests**

Run:

```bash
npm test -- tests/components/workspace-panel.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/WorkspacePanel.tsx components/WorkspaceSwitcher.tsx tests/components/workspace-panel.test.tsx
git commit -m "feat: add workspace settings panel"
```

---

### Task 7: Conversation Components

**Files:**
- Create: `components/MessageBubble.tsx`
- Create: `components/AnalysisCard.tsx`
- Create: `components/ReplySuggestions.tsx`
- Create: `components/ChatArea.tsx`
- Create: `tests/components/chat-flow.test.tsx`

- [ ] **Step 1: Write failing chat flow tests**

Create `tests/components/chat-flow.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ChatArea from "../../components/ChatArea";
import { createMessage, createWorkspace } from "../../lib/storage";
import type { ApiConfig, Workspace } from "../../lib/types";

const apiConfig: ApiConfig = { baseUrl: "https://api.example.com/v1", apiKey: "sk-test", model: "gpt-test" };

describe("ChatArea", () => {
  it("adds a manual message, analyzes it, selects a reply, and regenerates replies", async () => {
    const user = userEvent.setup();
    const workspace = createWorkspace({ id: "w1", name: "小林" });
    const onWorkspaceChange = vi.fn();
    const analyzeMessage = vi.fn().mockResolvedValue({
      intent: { surface: "邀请看展", real: "想见面", emotion: "期待", subtext: "推进关系" },
      risks: { misunderstand: "可能不是单独邀约", minefield: "别问还有谁", atmosphere: "↑升温" },
      replies: [
        { style: "温暖真诚型", emoji: "🟢", text: "好呀，我也想去那个展", strategy: "表达兴趣" },
        { style: "幽默轻松型", emoji: "🟡", text: "你这是约我还是约展", strategy: "轻松试探" },
        { style: "高段位型", emoji: "🔴", text: "可以，不过你来定时间", strategy: "让对方投入" }
      ],
      advanced: "顺势确认时间"
    });
    const regenerateReplies = vi.fn().mockResolvedValue([
      { style: "温暖真诚型", emoji: "🟢", text: "好呀，那周末见", strategy: "明确接受" },
      { style: "幽默轻松型", emoji: "🟡", text: "行，我负责看展，你负责好看", strategy: "暧昧轻推" },
      { style: "高段位型", emoji: "🔴", text: "可以，给你一个表现机会", strategy: "制造互动" }
    ]);

    render(
      <ChatArea
        workspace={workspace}
        apiConfig={apiConfig}
        onWorkspaceChange={onWorkspaceChange}
        analyzeMessage={analyzeMessage}
        regenerateReplies={regenerateReplies}
      />
    );

    await user.type(screen.getByLabelText("输入对方消息"), "周末有空吗，想去看那个展");
    await user.click(screen.getByRole("button", { name: "分析" }));

    await waitFor(() => expect(analyzeMessage).toHaveBeenCalledWith("周末有空吗，想去看那个展", expect.any(Array)));
    expect(onWorkspaceChange).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([expect.objectContaining({ content: "周末有空吗，想去看那个展" })])
    }));

    await user.click(await screen.findByRole("button", { name: "选择回复：好呀，我也想去那个展" }));
    expect(onWorkspaceChange).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([expect.objectContaining({ selectedReplyIndex: 0 })])
    }));

    await user.click(screen.getByRole("button", { name: "换一批" }));
    await waitFor(() => expect(regenerateReplies).toHaveBeenCalled());
    expect(onWorkspaceChange).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([expect.objectContaining({
        analysis: expect.objectContaining({
          replies: expect.arrayContaining([expect.objectContaining({ text: "好呀，那周末见" })])
        })
      })])
    }));
  });

  it("renders existing history collapsed after the newest analysis", () => {
    const older = createMessage({
      id: "m1",
      sender: "other",
      content: "在干嘛呀",
      source: "manual",
      analysis: {
        intent: { surface: "问候", real: "想聊天", emotion: "轻松", subtext: "打开话题" },
        risks: { misunderstand: "别冷场", minefield: "别只回一个字", atmosphere: "↑升温" },
        replies: [
          { style: "温暖真诚型", emoji: "🟢", text: "刚忙完，你呢", strategy: "自然接话" },
          { style: "幽默轻松型", emoji: "🟡", text: "在等你来找我聊天", strategy: "轻松暧昧" },
          { style: "高段位型", emoji: "🔴", text: "你猜对一半", strategy: "制造好奇" }
        ]
      }
    });
    const workspace: Workspace = createWorkspace({ id: "w1", messages: [older] });

    render(
      <ChatArea
        workspace={workspace}
        apiConfig={apiConfig}
        onWorkspaceChange={vi.fn()}
        analyzeMessage={vi.fn()}
        regenerateReplies={vi.fn()}
      />
    );

    expect(screen.getByText("在干嘛呀")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "展开分析" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- tests/components/chat-flow.test.tsx
```

Expected: FAIL with missing component modules.

- [ ] **Step 3: Implement message bubble**

Create `components/MessageBubble.tsx`:

```tsx
"use client";

import type { Message } from "../lib/types";

export default function MessageBubble({ message }: { message: Message }) {
  const isMe = message.sender === "me";
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] rounded px-4 py-3 text-sm shadow-sm ${isMe ? "bg-sage text-white" : "bg-white text-ink"}`}>
        {message.time ? <div className="mb-1 text-xs opacity-70">{message.time}</div> : null}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement reply suggestions**

Create `components/ReplySuggestions.tsx`:

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
```

- [ ] **Step 5: Implement analysis card**

Create `components/AnalysisCard.tsx`:

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
```

- [ ] **Step 6: Implement chat area**

Create `components/ChatArea.tsx`:

```tsx
"use client";

import { FormEvent, useMemo, useState } from "react";
import { createMessage } from "../lib/storage";
import type { Analysis, ApiConfig, ReplySuggestion, Workspace } from "../lib/types";
import AnalysisCard from "./AnalysisCard";
import MessageBubble from "./MessageBubble";

export default function ChatArea({
  workspace,
  apiConfig,
  onWorkspaceChange,
  analyzeMessage,
  regenerateReplies
}: {
  workspace: Workspace;
  apiConfig: ApiConfig;
  onWorkspaceChange: (workspace: Workspace) => void;
  analyzeMessage: (message: string, history: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }>) => Promise<Analysis>;
  regenerateReplies: (messageId: string) => Promise<ReplySuggestion[]>;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const history = useMemo(
    () => workspace.messages.flatMap((message) => {
      const items: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }> = [
        { role: "user", content: message.content }
      ];
      if (message.analysis) {
        items.push({ role: "assistant", content: JSON.stringify(message.analysis) });
      }
      if (message.analysis && message.selectedReplyIndex !== null) {
        items.push({ role: "user_selected_reply", content: message.analysis.replies[message.selectedReplyIndex].text });
      }
      return items;
    }),
    [workspace.messages]
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) {
      return;
    }
    setLoading(true);
    setError("");

    const pendingMessage = createMessage({ sender: "other", content, source: "manual" });
    try {
      const analysis = await analyzeMessage(content, history);
      onWorkspaceChange({ ...workspace, messages: [...workspace.messages, { ...pendingMessage, analysis }] });
      setInput("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "分析失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function selectReply(messageId: string, index: number) {
    onWorkspaceChange({
      ...workspace,
      messages: workspace.messages.map((message) =>
        message.id === messageId ? { ...message, selectedReplyIndex: index } : message
      )
    });
  }

  async function handleRegenerate(messageId: string) {
    setRegeneratingId(messageId);
    setError("");
    try {
      const replies = await regenerateReplies(messageId);
      onWorkspaceChange({
        ...workspace,
        messages: workspace.messages.map((message) =>
          message.id === messageId && message.analysis
            ? { ...message, analysis: { ...message.analysis, replies }, selectedReplyIndex: null }
            : message
        )
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "换一批失败，请重试");
    } finally {
      setRegeneratingId(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-paper">
      <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
        {workspace.messages.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center text-center text-sage">
            <p>粘贴对方消息后开始分析</p>
          </div>
        ) : null}
        {workspace.messages.map((message, index) => (
          <div key={message.id} className="space-y-3">
            <MessageBubble message={message} />
            {message.analysis ? (
              <AnalysisCard
                analysis={message.analysis}
                selectedReplyIndex={message.selectedReplyIndex}
                defaultOpen={index === workspace.messages.length - 1}
                regenerating={regeneratingId === message.id}
                onSelectReply={(replyIndex) => selectReply(message.id, replyIndex)}
                onRegenerate={() => handleRegenerate(message.id)}
              />
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-mist bg-white p-4">
        {error ? <div role="alert" className="mb-3 rounded bg-coral px-3 py-2 text-sm text-white">{error}</div> : null}
        <div className="flex gap-3">
          <textarea
            aria-label="输入对方消息"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={apiConfig.apiKey ? "粘贴对方新消息" : "先在左侧填写 API Key，再粘贴消息"}
            className="min-h-12 flex-1 resize-none rounded border border-mist px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded bg-coral px-5 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "分析中" : "分析"}
          </button>
        </div>
      </form>
    </main>
  );
}
```

- [ ] **Step 7: Run chat flow tests**

Run:

```bash
npm test -- tests/components/chat-flow.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add components/MessageBubble.tsx components/AnalysisCard.tsx components/ReplySuggestions.tsx components/ChatArea.tsx tests/components/chat-flow.test.tsx
git commit -m "feat: add conversation analysis UI"
```

---

### Task 8: Screenshot Extraction UI

**Files:**
- Create: `components/ScreenshotUploader.tsx`
- Create: `components/ExtractedMessages.tsx`
- Modify: `components/ChatArea.tsx`
- Modify: `tests/components/chat-flow.test.tsx`

- [ ] **Step 1: Extend chat flow tests for screenshot extraction**

Append this test to `tests/components/chat-flow.test.tsx`:

```tsx
it("extracts screenshot messages, lets the user edit them, and saves confirmed messages", async () => {
  const user = userEvent.setup();
  const workspace = createWorkspace({ id: "w1", name: "小林" });
  const onWorkspaceChange = vi.fn();
  const extractFromScreenshots = vi.fn().mockResolvedValue([
    { id: "e1", sender: "other", content: "在干嘛呀", time: "14:30" },
    { id: "e2", sender: "me", content: "刚忙完", time: "14:31" }
  ]);

  render(
    <ChatArea
      workspace={workspace}
      apiConfig={apiConfig}
      onWorkspaceChange={onWorkspaceChange}
      analyzeMessage={vi.fn()}
      regenerateReplies={vi.fn()}
      extractFromScreenshots={extractFromScreenshots}
    />
  );

  const file = new File(["fake"], "chat.png", { type: "image/png" });
  await user.upload(screen.getByLabelText("上传截图"), file);

  await waitFor(() => expect(extractFromScreenshots).toHaveBeenCalled());
  await user.clear(await screen.findByDisplayValue("在干嘛呀"));
  await user.type(screen.getByLabelText("编辑消息 e1"), "周末有空吗");
  await user.click(screen.getByRole("button", { name: "确认导入" }));

  expect(onWorkspaceChange).toHaveBeenCalledWith(expect.objectContaining({
    messages: [
      expect.objectContaining({ sender: "other", content: "周末有空吗", source: "screenshot" }),
      expect.objectContaining({ sender: "me", content: "刚忙完", source: "screenshot" })
    ]
  }));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- tests/components/chat-flow.test.tsx
```

Expected: FAIL because `ChatArea` does not accept `extractFromScreenshots` and screenshot components do not exist.

- [ ] **Step 3: Implement screenshot uploader**

Create `components/ScreenshotUploader.tsx`:

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
    <label className="inline-flex h-10 cursor-pointer items-center rounded border border-sage bg-paper px-4 text-sm font-semibold">
      上传截图
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

- [ ] **Step 4: Implement editable extracted messages**

Create `components/ExtractedMessages.tsx`:

```tsx
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
```

- [ ] **Step 5: Integrate screenshot extraction into chat area**

Modify `components/ChatArea.tsx`:

```tsx
"use client";

import { FormEvent, useMemo, useState } from "react";
import { createMessage } from "../lib/storage";
import type { Analysis, ApiConfig, ExtractedMessage, ReplySuggestion, Workspace } from "../lib/types";
import AnalysisCard from "./AnalysisCard";
import ExtractedMessages from "./ExtractedMessages";
import MessageBubble from "./MessageBubble";
import ScreenshotUploader from "./ScreenshotUploader";

export default function ChatArea({
  workspace,
  apiConfig,
  onWorkspaceChange,
  analyzeMessage,
  regenerateReplies,
  extractFromScreenshots = async () => []
}: {
  workspace: Workspace;
  apiConfig: ApiConfig;
  onWorkspaceChange: (workspace: Workspace) => void;
  analyzeMessage: (message: string, history: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }>) => Promise<Analysis>;
  regenerateReplies: (messageId: string) => Promise<ReplySuggestion[]>;
  extractFromScreenshots?: (images: string[]) => Promise<ExtractedMessage[]>;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [draftExtractedMessages, setDraftExtractedMessages] = useState<ExtractedMessage[]>([]);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const history = useMemo(
    () => workspace.messages.flatMap((message) => {
      const items: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }> = [
        { role: "user", content: message.content }
      ];
      if (message.analysis) {
        items.push({ role: "assistant", content: JSON.stringify(message.analysis) });
      }
      if (message.analysis && message.selectedReplyIndex !== null) {
        items.push({ role: "user_selected_reply", content: message.analysis.replies[message.selectedReplyIndex].text });
      }
      return items;
    }),
    [workspace.messages]
  );

  async function handleScreenshots(images: string[]) {
    setExtracting(true);
    setError("");
    try {
      setDraftExtractedMessages(await extractFromScreenshots(images));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "截图识别失败，请重试");
    } finally {
      setExtracting(false);
    }
  }

  function confirmExtractedMessages() {
    const imported = draftExtractedMessages
      .filter((message) => message.content.trim())
      .map((message) =>
        createMessage({
          sender: message.sender,
          content: message.content.trim(),
          time: message.time,
          source: "screenshot"
        })
      );
    onWorkspaceChange({ ...workspace, messages: [...workspace.messages, ...imported] });
    setDraftExtractedMessages([]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) {
      return;
    }
    setLoading(true);
    setError("");

    const pendingMessage = createMessage({ sender: "other", content, source: "manual" });
    try {
      const analysis = await analyzeMessage(content, history);
      onWorkspaceChange({ ...workspace, messages: [...workspace.messages, { ...pendingMessage, analysis }] });
      setInput("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "分析失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function selectReply(messageId: string, index: number) {
    onWorkspaceChange({
      ...workspace,
      messages: workspace.messages.map((message) =>
        message.id === messageId ? { ...message, selectedReplyIndex: index } : message
      )
    });
  }

  async function handleRegenerate(messageId: string) {
    setRegeneratingId(messageId);
    setError("");
    try {
      const replies = await regenerateReplies(messageId);
      onWorkspaceChange({
        ...workspace,
        messages: workspace.messages.map((message) =>
          message.id === messageId && message.analysis
            ? { ...message, analysis: { ...message.analysis, replies }, selectedReplyIndex: null }
            : message
        )
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "换一批失败，请重试");
    } finally {
      setRegeneratingId(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-paper">
      <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
        {draftExtractedMessages.length > 0 ? (
          <ExtractedMessages
            messages={draftExtractedMessages}
            onChange={setDraftExtractedMessages}
            onConfirm={confirmExtractedMessages}
            onCancel={() => setDraftExtractedMessages([])}
          />
        ) : null}
        {workspace.messages.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center text-center text-sage">
            <p>粘贴对方消息后开始分析</p>
          </div>
        ) : null}
        {workspace.messages.map((message, index) => (
          <div key={message.id} className="space-y-3">
            <MessageBubble message={message} />
            {message.analysis ? (
              <AnalysisCard
                analysis={message.analysis}
                selectedReplyIndex={message.selectedReplyIndex}
                defaultOpen={index === workspace.messages.length - 1}
                regenerating={regeneratingId === message.id}
                onSelectReply={(replyIndex) => selectReply(message.id, replyIndex)}
                onRegenerate={() => handleRegenerate(message.id)}
              />
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-mist bg-white p-4">
        {error ? <div role="alert" className="mb-3 rounded bg-coral px-3 py-2 text-sm text-white">{error}</div> : null}
        <div className="mb-3 flex items-center gap-3">
          <ScreenshotUploader disabled={extracting} onImages={handleScreenshots} />
          {extracting ? <span className="text-sm text-sage">识别中</span> : null}
        </div>
        <div className="flex gap-3">
          <textarea
            aria-label="输入对方消息"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={apiConfig.apiKey ? "粘贴对方新消息" : "先在左侧填写 API Key，再粘贴消息"}
            className="min-h-12 flex-1 resize-none rounded border border-mist px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded bg-coral px-5 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "分析中" : "分析"}
          </button>
        </div>
      </form>
    </main>
  );
}
```

- [ ] **Step 6: Run screenshot UI tests**

Run:

```bash
npm test -- tests/components/chat-flow.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add components/ScreenshotUploader.tsx components/ExtractedMessages.tsx components/ChatArea.tsx tests/components/chat-flow.test.tsx
git commit -m "feat: add screenshot extraction review"
```

---

### Task 9: Stateful App Integration

**Files:**
- Modify: `app/page.tsx`
- Modify: `tests/scaffold.test.ts`
- Create: `tests/app-page.test.tsx`

- [ ] **Step 1: Replace scaffold test with app integration tests**

Modify `tests/scaffold.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import Home from "../app/page";

describe("project scaffold", () => {
  it("exports the home page component", () => {
    expect(typeof Home).toBe("function");
  });
});
```

Create `tests/app-page.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../app/page";
import { CHAT_ASSISTANT_STORAGE_KEY } from "../lib/storage";

describe("Home app integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hydrates default workspace and persists setting edits", async () => {
    const user = userEvent.setup();

    render(<Home />);

    expect(await screen.findByDisplayValue("新的聊天对象")).toBeInTheDocument();
    await user.clear(screen.getByLabelText("对方备注名"));
    await user.type(screen.getByLabelText("对方备注名"), "小林");

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(CHAT_ASSISTANT_STORAGE_KEY) ?? "{}");
      expect(stored.workspaces[0].name).toBe("小林");
    });
  });

  it("posts analyze requests through the API route client", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        analysis: {
          intent: { surface: "邀请", real: "想见面", emotion: "期待", subtext: "推进关系" },
          risks: { misunderstand: "可能不是单独邀约", minefield: "别问还有谁", atmosphere: "↑升温" },
          replies: [
            { style: "温暖真诚型", emoji: "🟢", text: "好呀，我也想去", strategy: "表达兴趣" },
            { style: "幽默轻松型", emoji: "🟡", text: "这是约我还是约展", strategy: "轻松试探" },
            { style: "高段位型", emoji: "🔴", text: "可以，你定时间", strategy: "让对方投入" }
          ]
        }
      })
    }));

    render(<Home />);

    await user.click(screen.getByRole("button", { name: "API 设置" }));
    await user.type(screen.getByLabelText("API Key"), "sk-test");
    await user.type(screen.getByLabelText("输入对方消息"), "周末有空吗");
    await user.click(screen.getByRole("button", { name: "分析" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/analyze", expect.objectContaining({ method: "POST" })));
    expect(await screen.findByText("想见面")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- tests/app-page.test.tsx
```

Expected: FAIL because `app/page.tsx` does not hydrate app data or call API endpoints.

- [ ] **Step 3: Implement stateful page integration**

Modify `app/page.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ChatArea from "../components/ChatArea";
import WorkspacePanel from "../components/WorkspacePanel";
import { createId, loadAppData, saveAppData } from "../lib/storage";
import type {
  Analysis,
  ApiConfig,
  AppData,
  ExtractedMessage,
  ReplySuggestion,
  Workspace
} from "../lib/types";

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "请求失败，请重试");
  }
  return data as TResponse;
}

function buildHistory(workspace: Workspace) {
  return workspace.messages.flatMap((message) => {
    const items: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }> = [
      { role: "user", content: message.content }
    ];
    if (message.analysis) {
      items.push({ role: "assistant", content: JSON.stringify(message.analysis) });
    }
    if (message.analysis && message.selectedReplyIndex !== null) {
      items.push({ role: "user_selected_reply", content: message.analysis.replies[message.selectedReplyIndex].text });
    }
    return items;
  });
}

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(loadAppData());
  }, []);

  useEffect(() => {
    if (data) {
      saveAppData(data);
    }
  }, [data]);

  const activeWorkspace = useMemo(
    () => data?.workspaces.find((workspace) => workspace.id === data.activeWorkspaceId) ?? data?.workspaces[0],
    [data]
  );

  function updateWorkspace(nextWorkspace: Workspace) {
    if (!data) {
      return;
    }
    setData({
      ...data,
      workspaces: data.workspaces.map((workspace) => (workspace.id === nextWorkspace.id ? nextWorkspace : workspace))
    });
  }

  async function analyzeMessage(message: string): Promise<Analysis> {
    if (!data || !activeWorkspace) {
      throw new Error("Workspace 未加载");
    }
    const result = await postJson<{ analysis: Analysis }>("/api/analyze", {
      workspace: {
        gender: activeWorkspace.gender,
        relationship: activeWorkspace.relationship,
        goal: activeWorkspace.goal
      },
      history: buildHistory(activeWorkspace),
      newMessage: message,
      apiConfig: data.apiConfig
    });
    return result.analysis;
  }

  async function regenerateReplies(messageId: string): Promise<ReplySuggestion[]> {
    if (!data || !activeWorkspace) {
      throw new Error("Workspace 未加载");
    }
    const message = activeWorkspace.messages.find((item) => item.id === messageId);
    if (!message?.analysis) {
      throw new Error("这条消息还没有分析结果");
    }
    const result = await postJson<{ replies: ReplySuggestion[] }>("/api/regenerate-replies", {
      workspace: {
        gender: activeWorkspace.gender,
        relationship: activeWorkspace.relationship,
        goal: activeWorkspace.goal
      },
      message: message.content,
      existingAnalysis: {
        intent: message.analysis.intent,
        risks: message.analysis.risks
      },
      previousReplies: message.analysis.replies.map((reply) => reply.text),
      history: buildHistory(activeWorkspace),
      apiConfig: data.apiConfig
    });
    return result.replies;
  }

  async function extractFromScreenshots(images: string[]): Promise<ExtractedMessage[]> {
    if (!data) {
      throw new Error("配置未加载");
    }
    const result = await postJson<{ messages: Array<Omit<ExtractedMessage, "id">> }>("/api/extract-from-screenshot", {
      images,
      apiConfig: data.apiConfig
    });
    return result.messages.map((message) => ({ ...message, id: createId("extracted") }));
  }

  if (!data || !activeWorkspace) {
    return <main className="grid min-h-screen place-items-center bg-paper text-sage">加载中</main>;
  }

  return (
    <div className="min-h-screen bg-paper text-ink md:flex">
      <h1 className="sr-only">高情商聊天助手</h1>
      <WorkspacePanel data={data} onChange={setData} />
      <ChatArea
        workspace={activeWorkspace}
        apiConfig={data.apiConfig}
        onWorkspaceChange={updateWorkspace}
        analyzeMessage={analyzeMessage}
        regenerateReplies={regenerateReplies}
        extractFromScreenshots={extractFromScreenshots}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run app page tests**

Run:

```bash
npm test -- tests/app-page.test.tsx tests/scaffold.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Build the app**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx tests/app-page.test.tsx tests/scaffold.test.ts
git commit -m "feat: wire persistent chat assistant app"
```

---

### Task 10: Responsive Polish and Manual Verification

**Files:**
- Modify: `app/globals.css`
- Modify: `components/WorkspacePanel.tsx`
- Modify: `components/ChatArea.tsx`
- Modify: `README.md`

- [ ] **Step 1: Add a responsive behavior test**

Append this test to `tests/app-page.test.tsx`:

```tsx
it("keeps the workspace panel and chat composer visible in the app shell", async () => {
  render(<Home />);

  expect(await screen.findByLabelText("Workspace 列表")).toBeInTheDocument();
  expect(screen.getByLabelText("输入对方消息")).toBeInTheDocument();
  expect(screen.getByLabelText("上传截图")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the responsive shell test**

Run:

```bash
npm test -- tests/app-page.test.tsx
```

Expected: PASS after Task 9; if it fails, inspect the missing accessible label and correct the component label.

- [ ] **Step 3: Improve mobile panel behavior and stable layout**

Modify `components/WorkspacePanel.tsx` outer `<aside>` class to:

```tsx
<aside className="flex max-h-[48vh] w-full flex-col gap-6 overflow-y-auto border-b border-mist bg-white p-4 md:h-screen md:max-h-none md:w-[280px] md:border-b-0 md:border-r">
```

Modify `components/ChatArea.tsx` root `<main>` class to:

```tsx
<main className="flex min-h-[52vh] flex-1 flex-col bg-paper md:min-h-screen">
```

Modify `app/globals.css`:

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
  background: #f7f5ef;
  color: #172026;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  touch-action: manipulation;
}
```

- [ ] **Step 4: Add concise README usage notes**

Modify `README.md`:

```md
# 高情商聊天助手

一个 Next.js Web 应用，用来分析聊天对象的意图、情绪和潜台词，并生成三种风格的可直接发送回复建议。支持多个聊天对象 Workspace、连续上下文、截图识别确认和本地持久化。

## 开发

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 配置

可在左侧 API 设置里填写：

- API Base URL
- API Key
- 模型名称

也可以通过 `.env.local` 提供默认值：

```env
NEXT_PUBLIC_OPENAI_BASE_URL=https://api.openai.com/v1
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-key
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o
```

用户在页面里填写的配置会保存到 `localStorage`。

## 验证

```bash
npm test
npm run build
```
```

- [ ] **Step 5: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: both commands pass.

- [ ] **Step 6: Start the dev server**

Run:

```bash
npm run dev
```

Expected: server starts at `http://localhost:3000`. Keep this terminal running for browser verification.

- [ ] **Step 7: Verify in browser**

Open `http://localhost:3000` and check:

- Desktop width: left panel is fixed around 280px, right chat area fills the rest.
- Mobile width: workspace panel appears above chat area, both remain usable without text overlap.
- Default workspace appears on first load.
- API settings section expands and accepts Base URL, API Key, and model.
- Manual message entry shows a loading state, then either an analysis card or a friendly error.
- Screenshot upload opens editable extracted-message confirmation when the API returns messages.
- Selecting a reply highlights it and dims the others.
- "换一批" replaces only replies and preserves intent/risk analysis.

- [ ] **Step 8: Commit**

```bash
git add app/globals.css components/WorkspacePanel.tsx components/ChatArea.tsx README.md tests/app-page.test.tsx
git commit -m "docs: add usage notes and responsive polish"
```

---

## Final Verification

Run:

```bash
npm test
npm run build
git status --short
```

Expected:

- `npm test` passes.
- `npm run build` passes.
- `git status --short` shows no uncommitted implementation changes after the final commit.

Manual verification should confirm the workspace flow, API settings flow, manual analysis flow, reply selection, reply regeneration, screenshot extraction review, and responsive layout.
