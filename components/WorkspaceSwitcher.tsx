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
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <span className="text-coral">◈</span>
            聊天对象
          </h2>
          <p className="mt-0.5 text-[10px] text-sage tracking-wide">快速切换不同聊天上下文</p>
        </div>
        <button
          type="button"
          aria-label="新建聊天对象"
          onClick={onCreate}
          className="grid h-9 w-9 place-items-center rounded-xl border border-coral/30 bg-coral/[0.08] text-sm font-semibold text-coral transition-all duration-200 hover:bg-coral/20 hover:border-coral/50"
        >
          +
        </button>
      </div>
      <div className="space-y-1.5">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="flex gap-2">
            <button
              type="button"
              aria-label={`切换到 ${workspace.name}`}
              onClick={() => onSwitch(workspace.id)}
              className={`min-h-11 flex-1 rounded-xl border px-3.5 text-left text-sm transition-all duration-200 ${
                workspace.id === activeWorkspaceId
                  ? "border-coral/40 bg-coral/[0.1] font-semibold text-coral shadow-sm"
                  : "border-white/[0.04] bg-white/[0.02] text-sage hover:border-white/[0.08] hover:text-ink"
              }`}
            >
              <div className="truncate">{workspace.name}</div>
            </button>
            <button
              type="button"
              aria-label={`删除 ${workspace.name}`}
              onClick={() => onDelete(workspace.id)}
              className="h-11 w-11 rounded-xl border border-white/[0.04] bg-white/[0.02] text-sm text-sage/50 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
