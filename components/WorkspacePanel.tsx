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
