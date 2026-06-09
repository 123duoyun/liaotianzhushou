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
        <h2 className="text-sm font-semibold text-ink">聊天对象</h2>
        <button
          type="button"
          aria-label="新建聊天对象"
          onClick={onCreate}
          className="grid h-8 w-8 place-items-center rounded border border-sage bg-white text-lg font-semibold shadow-sm"
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
              className={`min-h-10 flex-1 rounded border px-3 text-left text-sm ${
                workspace.id === activeWorkspaceId
                  ? "border-coral bg-coral text-white"
                  : "border-mist bg-white text-ink"
              }`}
            >
              {workspace.name}
            </button>
            <button
              type="button"
              aria-label={`删除 ${workspace.name}`}
              onClick={() => onDelete(workspace.id)}
              className="h-10 w-10 rounded border border-mist bg-white text-sm text-coral"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
