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
