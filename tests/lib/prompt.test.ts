import { describe, expect, it } from "vitest";
import {
  buildAnalysisPrompt,
  buildRegenerateRepliesPrompt,
  buildScreenshotExtractionPrompt
} from "../../lib/prompt";

describe("prompt builders", () => {
  it("builds the analysis prompt with profile, context, and strict JSON schema", () => {
    const prompt = buildAnalysisPrompt({
      workspace: { gender: "male", relationship: "暧昧", goal: "拉近距离" },
      history: [
        { role: "user", content: "在干嘛呀" },
        { role: "user_selected_reply", content: "刚忙完，正好想到你" }
      ],
      newMessage: "周末有空吗，想去看那个展"
    });

    expect(prompt).toContain("性别：male");
    expect(prompt).toContain("与对方关系：暧昧");
    expect(prompt).toContain("期望效果：拉近距离");
    expect(prompt).toContain("周末有空吗，想去看那个展");
    expect(prompt).toContain('"intent"');
    expect(prompt).toContain('"replies"');
    expect(prompt).toContain("回复必须口语化");
  });

  it("builds regenerate prompt that preserves intent and excludes old reply text", () => {
    const prompt = buildRegenerateRepliesPrompt({
      workspace: { gender: "female", relationship: "朋友", goal: "正常聊天" },
      message: "今天好累",
      existingAnalysis: {
        intent: { surface: "表达疲惫", real: "想被关心", emotion: "低落", subtext: "希望有人接住情绪" },
        risks: { misunderstand: "别说教", minefield: "别比较谁更累", atmosphere: "↓ 需要安抚" }
      },
      previousReplies: ["早点睡", "多喝热水"],
      history: []
    });

    expect(prompt).toContain("保持以下意图分析不变");
    expect(prompt).toContain("今天好累");
    expect(prompt).toContain("早点睡");
    expect(prompt).toContain('"replies"');
  });

  it("builds screenshot extraction prompt with sender rules", () => {
    const prompt = buildScreenshotExtractionPrompt();

    expect(prompt).toContain('右侧气泡为"me"');
    expect(prompt).toContain('左侧气泡为"other"');
    expect(prompt).toContain('"messages"');
    expect(prompt).toContain("按从上到下顺序排列");
  });
});
