import type { Analysis, ApiConfig, AppData, Gender, Message, MessageSource, ReplySuggestion, Sender, Workspace } from "./types";

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

function isSender(value: unknown): value is Sender {
  return value === "other" || value === "me";
}

function isMessageSource(value: unknown): value is MessageSource {
  return value === "manual" || value === "screenshot";
}

function hasStringFields<T extends string>(value: unknown, fields: T[]): value is Record<T, string> {
  return typeof value === "object"
    && value !== null
    && fields.every((field) => typeof (value as Record<T, unknown>)[field] === "string");
}

function isReplySuggestion(value: unknown): value is ReplySuggestion {
  return hasStringFields(value, ["style", "emoji", "text", "strategy"]);
}

function normalizeAnalysis(value: unknown): Analysis | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const analysis = value as Partial<Analysis>;
  if (
    !hasStringFields(analysis.intent, ["surface", "real", "emotion", "subtext"])
    || !hasStringFields(analysis.risks, ["misunderstand", "minefield", "atmosphere"])
    || !Array.isArray(analysis.replies)
    || !analysis.replies.every(isReplySuggestion)
  ) {
    return null;
  }

  return {
    intent: analysis.intent,
    risks: analysis.risks,
    replies: analysis.replies,
    advanced: typeof analysis.advanced === "string" ? analysis.advanced : undefined
  };
}

function normalizeMessage(value: Partial<Message> | undefined): Message | null {
  if (!isSender(value?.sender) || typeof value?.content !== "string") {
    return null;
  }

  return createMessage({
    id: typeof value.id === "string" ? value.id : undefined,
    sender: value.sender,
    content: value.content,
    time: typeof value.time === "string" || value.time === null ? value.time : null,
    source: isMessageSource(value.source) ? value.source : "manual",
    analysis: normalizeAnalysis(value.analysis),
    selectedReplyIndex: typeof value.selectedReplyIndex === "number" && Number.isFinite(value.selectedReplyIndex) ? value.selectedReplyIndex : null
  });
}

function normalizeApiConfig(value: Partial<ApiConfig> | null | undefined, fallback: ApiConfig): ApiConfig {
  return {
    baseUrl: typeof value?.baseUrl === "string" && value.baseUrl.trim() ? value.baseUrl : fallback.baseUrl,
    apiKey: typeof value?.apiKey === "string" ? value.apiKey : fallback.apiKey,
    model: typeof value?.model === "string" && value.model.trim() ? value.model : fallback.model
  };
}

function normalizeWorkspace(value: Partial<Workspace> | undefined): Workspace {
  const fallback = createWorkspace();
  return {
    id: typeof value?.id === "string" ? value.id : fallback.id,
    name: typeof value?.name === "string" && value.name.trim() ? value.name : fallback.name,
    gender: isGender(value?.gender) ? value.gender : fallback.gender,
    relationship: typeof value?.relationship === "string" && value.relationship.trim() ? value.relationship : fallback.relationship,
    goal: typeof value?.goal === "string" && value.goal.trim() ? value.goal : fallback.goal,
    messages: Array.isArray(value?.messages)
      ? value.messages.map(normalizeMessage).filter((message): message is Message => message !== null)
      : []
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
    apiConfig: normalizeApiConfig(value?.apiConfig, fallback.apiConfig)
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
