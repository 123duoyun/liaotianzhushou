import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { Analysis, ApiConfig, AppData, Message, Workspace } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "chat.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  fs.mkdirSync(DATA_DIR, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      gender TEXT NOT NULL DEFAULT 'male',
      relationship TEXT NOT NULL DEFAULT '',
      goal TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      time TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      analysis TEXT,
      selected_reply_index INTEGER
    );

    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  return _db;
}

// ---- Workspaces ----

export function getWorkspaces(): Workspace[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM workspaces").all() as Array<{
    id: string; name: string; gender: string; relationship: string; goal: string;
  }>;
  return rows.map((row) => ({
    ...row,
    gender: row.gender as Workspace["gender"],
    messages: getMessages(row.id),
  }));
}

export function upsertWorkspace(ws: Workspace): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO workspaces (id, name, gender, relationship, goal)
    VALUES (@id, @name, @gender, @relationship, @goal)
    ON CONFLICT(id) DO UPDATE SET
      name=@name, gender=@gender, relationship=@relationship, goal=@goal
  `).run(ws);
}

export function deleteWorkspace(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM workspaces WHERE id = ?").run(id);
}

// ---- Messages ----

export function getMessages(workspaceId: string): Message[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM messages WHERE workspace_id = ? ORDER BY rowid"
  ).all(workspaceId) as Array<{
    id: string; workspace_id: string; sender: string; content: string;
    time: string | null; source: string; analysis: string | null; selected_reply_index: number | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    sender: row.sender as Message["sender"],
    content: row.content,
    time: row.time,
    source: row.source as Message["source"],
    analysis: row.analysis ? (JSON.parse(row.analysis) as Analysis) : null,
    selectedReplyIndex: row.selected_reply_index,
  }));
}

export function upsertMessage(workspaceId: string, msg: Message): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO messages (id, workspace_id, sender, content, time, source, analysis, selected_reply_index)
    VALUES (@id, @workspaceId, @sender, @content, @time, @source, @analysis, @selectedReplyIndex)
    ON CONFLICT(id) DO UPDATE SET
      sender=@sender, content=@content, time=@time, source=@source,
      analysis=@analysis, selected_reply_index=@selectedReplyIndex
  `).run({
    id: msg.id,
    workspaceId,
    sender: msg.sender,
    content: msg.content,
    time: msg.time ?? null,
    source: msg.source,
    analysis: msg.analysis ? JSON.stringify(msg.analysis) : null,
    selectedReplyIndex: msg.selectedReplyIndex ?? null,
  });
}

export function deleteMessage(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM messages WHERE id = ?").run(id);
}

// ---- App Config ----

export function getConfig(): ApiConfig & { activeWorkspaceId: string } {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM app_config").all() as Array<{
    key: string; value: string;
  }>;

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    baseUrl: map.baseUrl || process.env.NEXT_PUBLIC_OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: map.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
    model: map.model || process.env.NEXT_PUBLIC_OPENAI_MODEL || "gpt-4o",
    activeWorkspaceId: map.activeWorkspaceId || "",
  };
}

export function setConfig(key: string, value: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO app_config (key, value) VALUES (@key, @value)
    ON CONFLICT(key) DO UPDATE SET value=@value
  `).run({ key, value });
}

// ---- Full Data (for /api/data) ----

export function loadFullData(): AppData {
  const workspaces = getWorkspaces();
  const config = getConfig();

  const activeWorkspaceId = workspaces.some((w) => w.id === config.activeWorkspaceId)
    ? config.activeWorkspaceId
    : workspaces[0]?.id || "";

  return {
    workspaces: workspaces.length > 0 ? workspaces : [{
      id: "workspace_default",
      name: "新的聊天对象",
      gender: "male" as const,
      relationship: "暧昧",
      goal: "拉近距离",
      messages: [],
    }],
    activeWorkspaceId,
    apiConfig: {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
    },
  };
}

export function saveFullData(data: AppData): void {
  const db = getDb();

  const txn = db.transaction(() => {
    // Clear and re-insert everything (simple, mirrors old localStorage pattern)
    db.exec("DELETE FROM messages");
    db.exec("DELETE FROM workspaces");
    db.exec("DELETE FROM app_config");

    for (const ws of data.workspaces) {
      upsertWorkspace(ws);
      for (const msg of ws.messages) {
        upsertMessage(ws.id, msg);
      }
    }

    setConfig("activeWorkspaceId", data.activeWorkspaceId);
    setConfig("baseUrl", data.apiConfig.baseUrl);
    setConfig("apiKey", data.apiConfig.apiKey);
    setConfig("model", data.apiConfig.model);
  });

  txn();
}
