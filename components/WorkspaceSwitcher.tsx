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
        <div>
          <h2 className="text-sm font-semibold text-ink">💬 聊天对象</h2>
          <p className="mt-1 text-xs text-sage">快速切换不同聊天上下文</p>
        </div>
        <button
          type="button"
          aria-label="新建聊天对象"
          onClick={onCreate}
          className="grid h-10 w-10 place-items-center rounded-xl border-2 border-coral text-lg font-semibold text-coral transition-all duration-200 hover:bg-coral-light"
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
              className={`min-h-12 flex-1 rounded-xl border px-3 text-left text-sm transition-all duration-200 ${
                workspace.id === activeWorkspaceId
                  ? "border-coral bg-coral-light font-semibold text-coral-dark shadow-sm"
                  : "border-mist bg-white text-ink hover:border-coral-border hover:bg-green-50"
              }`}
            >
              <div className="truncate">{workspace.name}</div>
            </button>
            <button
              type="button"
              aria-label={`删除 ${workspace.name}`}
              onClick={() => onDelete(workspace.id)}
              className="h-12 w-12 rounded-xl border border-mist bg-white text-sm text-red-500 transition-all duration-200 hover:border-red-300 hover:bg-red-50"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
