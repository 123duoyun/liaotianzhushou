import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import WorkspacePanel from "../../components/WorkspacePanel";
import type { AppData } from "../../lib/types";
import { createDefaultAppData, createWorkspace } from "../../lib/storage";

function ControlledWorkspacePanel({ initialData, onChange }: { initialData: AppData; onChange: (data: AppData) => void }) {
  const [data, setData] = useState(initialData);
  function handleChange(next: AppData) {
    setData(next);
    onChange(next);
  }
  return <WorkspacePanel data={data} onChange={handleChange} />;
}

describe("WorkspacePanel", () => {
  it("switches, creates, updates, and deletes workspaces", async () => {
    const user = userEvent.setup();
    const data = createDefaultAppData();
    data.workspaces = [
      { ...data.workspaces[0], id: "w1", name: "小林" },
      createWorkspace({ id: "w2", name: "阿宁" })
    ];
    data.activeWorkspaceId = "w1";
    const onChange = vi.fn();

    render(<ControlledWorkspacePanel initialData={data} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "切换到 阿宁" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ activeWorkspaceId: "w2" }));

    await user.click(screen.getByRole("button", { name: "新建聊天对象" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ workspaces: expect.any(Array) }));

    await user.click(screen.getByRole("button", { name: "切换到 小林" }));
    await user.clear(screen.getByLabelText("对方备注名"));
    await user.type(screen.getByLabelText("对方备注名"), "新的备注");
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      workspaces: expect.arrayContaining([expect.objectContaining({ id: "w1", name: "新的备注" })])
    }));

    await user.click(screen.getByRole("button", { name: "删除 新的备注" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ activeWorkspaceId: "w2" }));
  });

  it("updates API config", async () => {
    const user = userEvent.setup();
    const data = createDefaultAppData();
    const onChange = vi.fn();

    render(<ControlledWorkspacePanel initialData={data} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "⚙️ API 设置" }));
    await user.clear(screen.getByLabelText("模型名称"));
    await user.type(screen.getByLabelText("模型名称"), "gpt-4o-mini");

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      apiConfig: expect.objectContaining({ model: "gpt-4o-mini" })
    }));
  });
});
