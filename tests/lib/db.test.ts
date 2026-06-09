import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppData, Message, Workspace } from "../../lib/types";

const projectRoot = path.resolve(__dirname, "../..");

let previousCwd: string;
let tempDir: string;

async function importDb() {
  vi.resetModules();
  const modulePath = path.join(projectRoot, "lib/db.ts");
  return import(modulePath) as Promise<typeof import("../../lib/db")>;
}

function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: "message_1",
    sender: "other",
    content: "今天有点累",
    time: "20:30",
    source: "manual",
    analysis: null,
    selectedReplyIndex: null,
    ...overrides,
  };
}

function createWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  return {
    id: "workspace_1",
    name: "小林",
    gender: "female",
    relationship: "朋友",
    goal: "自然聊天",
    messages: [createMessage()],
    ...overrides,
  };
}

function createAppData(overrides: Partial<AppData> = {}): AppData {
  return {
    workspaces: [createWorkspace()],
    activeWorkspaceId: "workspace_1",
    apiConfig: {
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test",
      model: "gpt-test",
    },
    ...overrides,
  };
}

describe("lowdb data layer", () => {
  beforeEach(() => {
    previousCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "chat-assistant-db-"));
    process.chdir(tempDir);
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    process.chdir(previousCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.resetModules();
  });

  it("persists full app data to data/chat.json", async () => {
    const { loadFullData, saveFullData } = await importDb();
    const data = createAppData();

    await saveFullData(data);

    const dbPath = path.join(tempDir, "data/chat.json");
    expect(fs.existsSync(dbPath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(dbPath, "utf8"))).toEqual(data);
    await expect(loadFullData()).resolves.toEqual(data);
  });

  it("persists message deletion inside the workspace", async () => {
    const { deleteMessage, loadFullData, saveFullData } = await importDb();
    const data = createAppData({
      workspaces: [
        createWorkspace({
          messages: [
            createMessage({ id: "message_keep", content: "留下" }),
            createMessage({ id: "message_delete", content: "删除" }),
          ],
        }),
      ],
    });
    await saveFullData(data);

    await deleteMessage("message_delete");

    const loaded = await loadFullData();
    expect(loaded.workspaces[0].messages).toEqual([
      createMessage({ id: "message_keep", content: "留下" }),
    ]);
  });

  it("loads default app data when no database file exists", async () => {
    const { loadFullData } = await importDb();

    const data = await loadFullData();

    expect(data.workspaces).toHaveLength(1);
    expect(data.workspaces[0]).toMatchObject({
      id: "workspace_default",
      name: "新的聊天对象",
      gender: "male",
      relationship: "暧昧",
      goal: "拉近距离",
      messages: [],
    });
    expect(data.activeWorkspaceId).toBe("workspace_default");
    expect(data.apiConfig).toEqual({
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
      model: "gpt-4o",
    });
  });
});
