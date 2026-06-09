"use client";

import { useMemo, useState } from "react";
import { createWorkspace } from "../lib/storage";
import type { ApiConfig, AppData, Gender, Workspace } from "../lib/types";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const relationships = ["朋友", "暧昧", "情侣", "同事", "相亲对象", "其他"];
const goals = ["拉近距离", "化解矛盾", "保持吸引力", "正常聊天"];

export default function WorkspacePanel({
  data,
  onChange,
  mobileOpen = false,
  onClose
}: {
  data: AppData;
  onChange: (data: AppData) => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
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
    <>
      <div
        className={`fixed inset-0 z-30 bg-ink/20 backdrop-blur-sm transition-opacity md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[88vw] max-w-[360px] flex-col gap-5 overflow-y-auto border-r border-mist bg-white p-4 shadow-2xl transition-transform md:static md:z-auto md:w-[320px] md:max-w-none md:translate-x-0 md:rounded-none md:border-r md:shadow-lg ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sage">当前聊天对象</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">{activeWorkspace.name}</h2>
            <p className="mt-2 text-sm text-sage">
              {activeWorkspace.relationship} · {activeWorkspace.goal}
            </p>
          </div>
          {onClose ? (
            <button
              type="button"
              aria-label="关闭设置面板"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-xl border border-mist text-lg text-sage transition-all duration-200 hover:border-coral-border hover:bg-coral-light md:hidden"
            >
              ×
            </button>
          ) : null}
        </div>

        <div className="rounded-2xl border border-coral-border bg-coral-light/60 p-3">
          <div className="grid grid-cols-3 gap-2 text-xs text-sage">
            <div className="rounded-xl bg-white/80 px-3 py-2">
              <div className="font-semibold text-ink">{activeWorkspace.gender === "male" ? "男" : "女"}</div>
              <div className="mt-1">我的性别</div>
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2">
              <div className="font-semibold text-ink">{activeWorkspace.relationship}</div>
              <div className="mt-1">关系</div>
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2">
              <div className="font-semibold text-ink">{activeWorkspace.goal}</div>
              <div className="mt-1">目标</div>
            </div>
          </div>
        </div>

        <WorkspaceSwitcher
          workspaces={data.workspaces}
          activeWorkspaceId={data.activeWorkspaceId}
          onSwitch={(id) => onChange({ ...data, activeWorkspaceId: id })}
          onCreate={createNewWorkspace}
          onDelete={deleteWorkspace}
        />

        <section aria-label="Workspace 设置" className="space-y-4 rounded-2xl border border-mist bg-paper/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">上下文设置</h3>
            <span className="text-xs text-sage">桌面端常驻，手机端可折叠</span>
          </div>

          <label className="block text-sm font-medium text-ink">
            对方备注名
            <input
              aria-label="对方备注名"
              value={activeWorkspace.name}
              onChange={(event) => updateWorkspace(activeWorkspace.id, { name: event.target.value })}
              className="mt-1.5 h-11 w-full rounded-xl border border-mist bg-white px-3 text-ink transition-all duration-200 focus:border-coral focus:ring-2 focus:ring-coral/20"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-1">
            <label className="block text-sm font-medium text-ink">
              我的性别
              <select
                aria-label="我的性别"
                value={activeWorkspace.gender}
                onChange={(event) => updateWorkspace(activeWorkspace.id, { gender: event.target.value as Gender })}
                className="mt-1.5 h-11 w-full rounded-xl border border-mist bg-white px-3 text-ink"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-ink">
              与对方关系
              <select
                aria-label="与对方关系"
                value={activeWorkspace.relationship}
                onChange={(event) => updateWorkspace(activeWorkspace.id, { relationship: event.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border border-mist bg-white px-3 text-ink"
              >
                {relationships.map((relationship) => (
                  <option key={relationship} value={relationship}>{relationship}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-ink">
              期望效果
              <select
                aria-label="期望效果"
                value={activeWorkspace.goal}
                onChange={(event) => updateWorkspace(activeWorkspace.id, { goal: event.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border border-mist bg-white px-3 text-ink"
              >
                {goals.map((goal) => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="mt-auto rounded-2xl border border-mist bg-white p-4 shadow-sm">
          <button
            type="button"
            aria-label="⚙️ API 设置"
            aria-expanded={apiOpen}
            onClick={() => setApiOpen((open) => !open)}
            className="flex h-11 w-full items-center justify-between rounded-xl border border-sage bg-paper px-3 text-sm font-semibold text-ink transition-all duration-200 hover:bg-coral-light"
          >
            <span>⚙️ API 设置</span>
            <span className="text-xs text-sage">{apiOpen ? "收起" : data.apiConfig.apiKey ? "已配置" : "未配置"}</span>
          </button>
          {apiOpen ? (
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-ink">
                API Base URL
                <input
                  aria-label="API Base URL"
                  value={data.apiConfig.baseUrl}
                  onChange={(event) => updateApiConfig({ baseUrl: event.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-mist px-3 text-ink transition-all duration-200 focus:border-coral focus:ring-2 focus:ring-coral/20"
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                API Key
                <input
                  aria-label="API Key"
                  type="password"
                  value={data.apiConfig.apiKey}
                  onChange={(event) => updateApiConfig({ apiKey: event.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-mist px-3 text-ink transition-all duration-200 focus:border-coral focus:ring-2 focus:ring-coral/20"
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                模型名称
                <input
                  aria-label="模型名称"
                  value={data.apiConfig.model}
                  onChange={(event) => updateApiConfig({ model: event.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-mist px-3 text-ink transition-all duration-200 focus:border-coral focus:ring-2 focus:ring-coral/20"
                />
              </label>
            </div>
          ) : null}
        </section>
      </aside>
    </>
  );
}
