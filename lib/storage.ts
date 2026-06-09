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
