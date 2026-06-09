import type { AnalyzeRequest, RegenerateRepliesRequest } from "./types";

type PromptAnalysisInput = Omit<AnalyzeRequest, "apiConfig">;
type PromptRegenerateInput = Omit<RegenerateRepliesRequest, "apiConfig">;

function formatHistory(history: AnalyzeRequest["history"]): string {
  if (history.length === 0) {
    return "无历史上下文";
  }

  return history
    .map((item, index) => `${index + 1}. ${item.role}: ${item.content}`)
    .join("\n");
}

export function buildAnalysisPrompt(input: PromptAnalysisInput): string {
  return `你是一个高情商聊天助手。根据用户提供的上下文信息分析聊天记录。

用户信息：
- 性别：${input.workspace.gender}
- 与对方关系：${input.workspace.relationship}
- 期望效果：${input.workspace.goal}

历史上下文：
${formatHistory(input.history)}

需要分析的新消息：
${input.newMessage}

请只输出 JSON 对象，不要输出 Markdown。JSON 格式必须是：
{
  "intent": {
    "surface": "表面意思",
    "real": "真实意图或潜台词",
    "emotion": "情绪状态",
    "subtext": "话外之音"
  },
  "risks": {
    "misunderstand": "可能误解的地方",
    "minefield": "雷区",
    "atmosphere": "氛围趋势，例如 ↑升温 或 ↓降温"
  },
  "replies": [
    { "style": "温暖真诚型", "emoji": "🟢", "text": "可直接发送的口语化回复", "strategy": "策略意图" },
    { "style": "幽默轻松型", "emoji": "🟡", "text": "可直接发送的口语化回复", "strategy": "策略意图" },
    { "style": "高段位型", "emoji": "🔴", "text": "可直接发送的口语化回复", "strategy": "策略意图" }
  ],
  "advanced": "进阶建议，可省略"
}

规则：
- 回复必须口语化，像真人打字。
- 根据用户性别和关系调整建议风格。
- 考虑之前的对话上下文，尤其是用户已经选择过的回复。
- 直接给可用的回复，不要模板化表达。
- 三条回复必须是不同策略。`;
}

export function buildRegenerateRepliesPrompt(input: PromptRegenerateInput): string {
  return `你是一个高情商聊天助手。请基于同一条消息重新生成 3 条回复建议。

用户信息：
- 性别：${input.workspace.gender}
- 与对方关系：${input.workspace.relationship}
- 期望效果：${input.workspace.goal}

消息：
${input.message}

保持以下意图分析不变：
${JSON.stringify(input.existingAnalysis.intent, null, 2)}

保持以下风险判断不变：
${JSON.stringify(input.existingAnalysis.risks, null, 2)}

历史上下文：
${formatHistory(input.history)}

之前已经给过的回复，新的回复不要重复这些文字：
${input.previousReplies.map((reply, index) => `${index + 1}. ${reply}`).join("\n") || "无"}

请只输出 JSON 对象，不要输出 Markdown。JSON 格式必须是：
{
  "replies": [
    { "style": "温暖真诚型", "emoji": "🟢", "text": "新的口语化回复", "strategy": "策略意图" },
    { "style": "幽默轻松型", "emoji": "🟡", "text": "新的口语化回复", "strategy": "策略意图" },
    { "style": "高段位型", "emoji": "🔴", "text": "新的口语化回复", "strategy": "策略意图" }
  ]
}`;
}

export function buildScreenshotExtractionPrompt(): string {
  return `请识别聊天截图中的对话记录。按时间顺序提取每条消息。

识别规则：
- 区分发送方：右侧气泡为"me"（我），左侧气泡为"other"（对方）。
- 提取消息文字内容。
- 如果能看到时间，提取时间；看不到时使用 null。
- 如果有多条消息，按从上到下顺序排列。
- 支持微信、QQ、iMessage 等常见聊天软件的截图格式。
- 多张图片会按上传顺序传入，请保持整体时间顺序并去重。

请只输出 JSON 对象，不要输出 Markdown。JSON 格式必须是：
{
  "messages": [
    { "sender": "other", "content": "消息内容", "time": "14:30" },
    { "sender": "me", "content": "消息内容", "time": null }
  ]
}`;
}
