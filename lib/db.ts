import initSqlJs, { type Database } from "sql.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { Analysis, ApiConfig, AppData, Message, Workspace } from "./types";

// 获取当前模块目录（兼容 ESM）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "chat.db");

let _db: Database | null = null;
let _initPromise: Promise<Database> | null = null;

function saveToDisk() {
  if (!_db) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function getDb(): Promise<Database> {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const SQL = await initSqlJs({
      locateFile: (file) => {
        // 在 Node.js 环境中，直接指向 sql.js 的 dist 目录
        const sqlJsPath = path.resolve(process.cwd(), "node_modules", "sql.js", "dist", file);
        if (fs.existsSync(sqlJsPath)) {
          return sqlJsPath;
        }
        // 备用方案：使用 URL 方式加载
        return `https://sql.js.org/dist/${file}`;
      },
    });
    fs.mkdirSync(DATA_DIR, { recursive: true });

    if (fs.existsSync(DB_PATH)) {
      const buf = fs.readFileSync(DB_PATH);
      _db = new SQL.Database(buf);
    } else {
      _db = new SQL.Database();
    }

    _db.run("PRAGMA foreign_keys = ON");
    _db.run(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gender TEXT NOT NULL DEFAULT 'male',
        relationship TEXT NOT NULL DEFAULT '',
        goal TEXT NOT NULL DEFAULT ''
      )
    `);
    _db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        time TEXT,
        source TEXT NOT NULL DEFAULT 'manual',
        analysis TEXT,
        selected_reply_index INTEGER
      )
    `);
    _db.run(`
      CREATE TABLE IF NOT EXISTS app_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    saveToDisk();
    return _db;
  })();

  return _initPromise;
}

// ---- Helpers ----

// ---- Workspaces ----

export async function getWorkspaces(): Promise<Workspace[]> {
  const db = await getDb();
  const stmt = db.prepare("SELECT * FROM workspaces");
  const workspaces: Workspace[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as { id: string; name: string; gender: string; relationship: string; goal: string };
    workspaces.push({
      id: row.id,
      name: row.name,
      gender: row.gender as Workspace["gender"],
      relationship: row.relationship,
      goal: row.goal,
      messages: await getMessages(row.id),
    });
  }
  stmt.free();
  return workspaces;
}

export async function upsertWorkspace(ws: Workspace): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT INTO workspaces (id, name, gender, relationship, goal)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, gender=excluded.gender, relationship=excluded.relationship, goal=excluded.goal`,
    [ws.id, ws.name, ws.gender, ws.relationship, ws.goal]
  );
  saveToDisk();
}

export async function deleteWorkspace(id: string): Promise<void> {
  const db = await getDb();
  db.run("DELETE FROM workspaces WHERE id = ?", [id]);
  saveToDisk();
}

// ---- Messages ----

export async function getMessages(workspaceId: string): Promise<Message[]> {
  const db = await getDb();
  const stmt = db.prepare("SELECT * FROM messages WHERE workspace_id = ? ORDER BY rowid");
  stmt.bind([workspaceId]);

  const messages: Message[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as {
      id: string; workspace_id: string; sender: string; content: string;
      time: string | null; source: string; analysis: string | null; selected_reply_index: number | null;
    };
    messages.push({
      id: row.id,
      sender: row.sender as Message["sender"],
      content: row.content,
      time: row.time,
      source: row.source as Message["source"],
      analysis: row.analysis ? (JSON.parse(row.analysis) as Analysis) : null,
      selectedReplyIndex: row.selected_reply_index,
    });
  }
  stmt.free();
  return messages;
}

export async function upsertMessage(workspaceId: string, msg: Message): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT INTO messages (id, workspace_id, sender, content, time, source, analysis, selected_reply_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       sender=excluded.sender, content=excluded.content, time=excluded.time, source=excluded.source,
       analysis=excluded.analysis, selected_reply_index=excluded.selected_reply_index`,
    [
      msg.id, workspaceId, msg.sender, msg.content, msg.time ?? null, msg.source,
      msg.analysis ? JSON.stringify(msg.analysis) : null, msg.selectedReplyIndex ?? null,
    ]
  );
  saveToDisk();
}

export async function deleteMessage(id: string): Promise<void> {
  const db = await getDb();
  db.run("DELETE FROM messages WHERE id = ?", [id]);
  saveToDisk();
}

// ---- App Config ----

export async function getConfig(): Promise<ApiConfig & { activeWorkspaceId: string }> {
  const db = await getDb();
  const stmt = db.prepare("SELECT key, value FROM app_config");
  const map: Record<string, string> = {};
  while (stmt.step()) {
    const row = stmt.getAsObject() as { key: string; value: string };
    map[row.key] = row.value;
  }
  stmt.free();

  return {
    baseUrl: map.baseUrl || process.env.NEXT_PUBLIC_OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: map.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
    model: map.model || process.env.NEXT_PUBLIC_OPENAI_MODEL || "gpt-4o",
    activeWorkspaceId: map.activeWorkspaceId || "",
  };
}

export async function setConfig(key: string, value: string): Promise<void> {
  const db = await getDb();
  db.run(
    "INSERT INTO app_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    [key, value]
  );
  saveToDisk();
}

// ---- Full Data (for /api/data) ----

export async function loadFullData(): Promise<AppData> {
  const workspaces = await getWorkspaces();
  const config = await getConfig();

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

export async function saveFullData(data: AppData): Promise<void> {
  const db = await getDb();

  db.run("DELETE FROM messages");
  db.run("DELETE FROM workspaces");
  db.run("DELETE FROM app_config");

  for (const ws of data.workspaces) {
    await upsertWorkspace(ws);
    for (const msg of ws.messages) {
      await upsertMessage(ws.id, msg);
    }
  }

  await setConfig("activeWorkspaceId", data.activeWorkspaceId);
  await setConfig("baseUrl", data.apiConfig.baseUrl);
  await setConfig("apiKey", data.apiConfig.apiKey);
  await setConfig("model", data.apiConfig.model);
  saveToDisk();
}
