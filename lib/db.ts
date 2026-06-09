import fs from "fs";
import path from "path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import type { ApiConfig, AppData, Message, Workspace } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "chat.json");

let _db: Low<AppData> | null = null;
let _initPromise: Promise<Low<AppData>> | null = null;

function createDefaultData(): AppData {
  return {
    workspaces: [{
      id: "workspace_default",
      name: "新的聊天对象",
      gender: "male",
      relationship: "暧昧",
      goal: "拉近距离",
      messages: [],
    }],
    activeWorkspaceId: "workspace_default",
    apiConfig: createDefaultApiConfig(),
  };
}

function createDefaultApiConfig(): ApiConfig {
  return {
    baseUrl: process.env.NEXT_PUBLIC_OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
    model: process.env.NEXT_PUBLIC_OPENAI_MODEL || "gpt-4o",
  };
}

function normalizeData(data: AppData): AppData {
  const defaultData = createDefaultData();
  const workspaces = Array.isArray(data.workspaces) ? data.workspaces : defaultData.workspaces;
  const activeWorkspaceId = workspaces.some((workspace) => workspace.id === data.activeWorkspaceId)
    ? data.activeWorkspaceId
    : workspaces[0]?.id || "";

  return {
    workspaces: workspaces.length > 0 ? workspaces : defaultData.workspaces,
    activeWorkspaceId: activeWorkspaceId || defaultData.activeWorkspaceId,
    apiConfig: {
      ...defaultData.apiConfig,
      ...(data.apiConfig || {}),
    },
  };
}

async function getDb(): Promise<Low<AppData>> {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const db = new Low<AppData>(new JSONFile<AppData>(DB_PATH), createDefaultData());
    await db.read();
    db.data = normalizeData(db.data);
    await db.write();
    _db = db;
    return db;
  })();

  return _initPromise;
}

async function writeData(data: AppData): Promise<void> {
  const db = await getDb();
  db.data = normalizeData(data);
  await db.write();
}

// ---- Workspaces ----

export async function getWorkspaces(): Promise<Workspace[]> {
  const db = await getDb();
  return db.data.workspaces;
}

export async function upsertWorkspace(ws: Workspace): Promise<void> {
  const db = await getDb();
  const index = db.data.workspaces.findIndex((workspace) => workspace.id === ws.id);

  if (index >= 0) {
    db.data.workspaces[index] = {
      ...ws,
      messages: ws.messages ?? db.data.workspaces[index].messages,
    };
  } else {
    db.data.workspaces.push({
      ...ws,
      messages: ws.messages ?? [],
    });
  }

  if (!db.data.activeWorkspaceId) {
    db.data.activeWorkspaceId = ws.id;
  }

  await db.write();
}

export async function deleteWorkspace(id: string): Promise<void> {
  const db = await getDb();
  db.data.workspaces = db.data.workspaces.filter((workspace) => workspace.id !== id);

  if (db.data.activeWorkspaceId === id) {
    db.data.activeWorkspaceId = db.data.workspaces[0]?.id || "";
  }

  await db.write();
}

// ---- Messages ----

export async function getMessages(workspaceId: string): Promise<Message[]> {
  const db = await getDb();
  return db.data.workspaces.find((workspace) => workspace.id === workspaceId)?.messages ?? [];
}

export async function upsertMessage(workspaceId: string, msg: Message): Promise<void> {
  const db = await getDb();
  const workspace = db.data.workspaces.find((item) => item.id === workspaceId);
  if (!workspace) return;

  const index = workspace.messages.findIndex((message) => message.id === msg.id);
  if (index >= 0) {
    workspace.messages[index] = msg;
  } else {
    workspace.messages.push(msg);
  }

  await db.write();
}

export async function deleteMessage(id: string): Promise<void> {
  const db = await getDb();

  for (const workspace of db.data.workspaces) {
    workspace.messages = workspace.messages.filter((message) => message.id !== id);
  }

  await db.write();
}

// ---- App Config ----

export async function getConfig(): Promise<ApiConfig & { activeWorkspaceId: string }> {
  const db = await getDb();
  const defaults = createDefaultApiConfig();

  return {
    baseUrl: db.data.apiConfig.baseUrl || defaults.baseUrl,
    apiKey: db.data.apiConfig.apiKey || defaults.apiKey,
    model: db.data.apiConfig.model || defaults.model,
    activeWorkspaceId: db.data.activeWorkspaceId || "",
  };
}

export async function setConfig(key: string, value: string): Promise<void> {
  const db = await getDb();

  if (key === "activeWorkspaceId") {
    db.data.activeWorkspaceId = value;
  } else if (key === "baseUrl" || key === "apiKey" || key === "model") {
    db.data.apiConfig[key] = value;
  }

  await db.write();
}

// ---- Full Data (for /api/data) ----

export async function loadFullData(): Promise<AppData> {
  const db = await getDb();
  return normalizeData(db.data);
}

export async function saveFullData(data: AppData): Promise<void> {
  await writeData(data);
}
