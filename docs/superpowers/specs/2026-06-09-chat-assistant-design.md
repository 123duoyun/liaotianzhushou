# 高情商聊天助手 - 设计文档

## 概述

一个基于 AI 的高情商聊天助手 Web 应用。用户粘贴聊天记录，AI 分析对方意图、情绪和潜台词，并给出三种风格的回复建议。支持连续对话，AI 追踪上下文给出更精准的分析。

## 技术栈

- **前端**: React + Next.js (App Router)
- **AI 后端**: OpenAI 兼容 API（可配置 base URL、model、API key）
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **状态管理**: React useState/useContext（轻量，无需额外库）

## 页面布局

左右分栏布局：

- **左侧面板**（固定宽度 ~280px）：Workspace 设置
- **右侧区域**（自适应）：连续对话分析

响应式：移动端左侧面板可折叠。

## 左侧 Workspace 面板

### Workspace 管理

支持多个 Workspace，每个 Workspace 对应一个聊天对象：

- **Workspace 列表**：显示所有已创建的 Workspace（显示对方昵称/备注）
- **切换 Workspace**：点击切换，右侧加载对应的对话历史
- **新建 Workspace**：点击 "+" 创建新的
- **编辑/删除**：长按或右键菜单

首次打开自动创建一个默认 Workspace。

### 用户信息选择（每个 Workspace 独立）

每个 Workspace 有自己的设置：

1. **对方备注名**：方便区分不同聊天对象
2. **我的性别**：男 / 女
3. **与对方关系**：朋友 / 暧昧 / 情侣 / 同事 / 相亲对象 / 其他
4. **期望效果**：拉近距离 / 化解矛盾 / 保持吸引力 / 正常聊天

### API 设置（全局共享）

可折叠区域：

- **API Base URL**：默认读取环境变量 `OPENAI_BASE_URL`，可手动修改
- **API Key**：默认读取环境变量 `OPENAI_API_KEY`，可手动填写覆盖
- **模型名称**：默认读取环境变量 `OPENAI_MODEL`，可手动修改

### 状态持久化

所有数据保存在 localStorage：
- Workspace 列表及各 Workspace 的用户信息设置
- 每个 Workspace 的完整对话历史（消息 + 分析结果 + 回复选择）
- API 设置（全局）

## 右侧对话分析区

### 输入方式

两种方式添加对话记录：

1. **手动输入**：在底部输入框粘贴/输入对方消息
2. **截图识别**：上传或粘贴聊天截图，AI 自动提取对话记录

### 截图识别流程

1. 用户点击"📸 上传截图"按钮，或直接 Ctrl+V 粘贴截图
2. 支持：单张/多张截图、微信/其他聊天软件截图
3. 前端将图片发送到 `/api/extract-from-screenshot`
4. AI 识别截图中的对话，提取出每条消息（区分发送方）
5. 返回提取结果供用户**确认/编辑**：
   - 以列表展示提取的消息（可逐条删除、修改文字）
   - 用户确认后，消息批量保存到 Workspace
6. 提取的消息显示在对话区，用户可选择任意一条进行分析

### 对话流

每轮对话包含：

1. **对方消息气泡**（左侧，灰色）
2. **分析结果卡片**（可折叠，带颜色左边框标识氛围）
3. **回复建议**（三个标签，点击可选）

### 分析结果结构

每条分析包含：

- **意图分析**：表面意思、真实意图/潜台词、情绪状态、话外之音
- **风险提示**：可能误解的地方、雷区、氛围趋势（↑升温 / ↓降温）
- **回复建议**：温暖真诚型 🟢 / 幽默轻松型 🟡 / 高段位型 🔴，每个给可直接发送的文字 + 策略意图
- **进阶建议**：话题引导、破冰建议（可选，AI 自行判断是否需要）

### 回复建议操作

- **选择回复**：点击一条建议，记录为你的选择，作为上下文传给下一轮
- **换一批**：点击"换一批"按钮，AI 基于同样的分析生成 3 条新的回复建议（保持原有意图分析不变）
- 选择回复后，已选回复高亮显示，其他建议淡化

### 连续对话机制

- 用户点选一条回复建议 → 记录选择，作为上下文传给下一轮分析
- 历史分析默认折叠，点击展开
- 底部输入框持续粘贴新消息
- 每轮分析带氛围趋势标识
- 切换 Workspace 时自动加载对应对话历史

## API 设计

### POST /api/analyze

分析新消息，返回意图分析 + 回复建议。

**请求体**：

```json
{
  "workspace": {
    "gender": "male",
    "relationship": "暧昧",
    "goal": "拉近距离"
  },
  "history": [
    {
      "role": "user",
      "content": "在干嘛呀"
    },
    {
      "role": "assistant",
      "content": "分析结果 JSON..."
    },
    {
      "role": "user_selected_reply": "刚忙完，在想你呢"
    },
    {
      "role": "user",
      "content": "哼，油嘴滑舌的"
    }
  ],
  "newMessage": "周末有空吗，想去看那个展",
  "apiConfig": {
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "sk-...",
    "model": "gpt-4o"
  }
}
```

**响应体**：

```json
{
  "analysis": {
    "intent": {
      "surface": "邀请周末一起看展",
      "real": "想制造约会机会，推进关系",
      "emotion": "期待 + 试探",
      "subtext": "已经从聊天升级到想见面了"
    },
    "risks": {
      "misunderstand": "可能是群发邀请，不一定是单独约你",
      "minefield": "别问'还有谁去'，会显得不自信",
      "atmosphere": "↑↑ 大幅升温，从线上到线下的关键节点"
    },
    "replies": [
      {
        "style": "温暖真诚型",
        "emoji": "🟢",
        "text": "好呀，我一直想去看那个展来着",
        "strategy": "表达兴趣+制造共同体验"
      },
      {
        "style": "幽默轻松型",
        "emoji": "🟡",
        "text": "你是想看展还是想看我",
        "strategy": "暧昧升级，试探对方底线"
      },
      {
        "style": "高段位型",
        "emoji": "🔴",
        "text": "可以啊，不过我有个条件",
        "strategy": "制造悬念，掌握主动权"
      }
    ],
    "advanced": "对方主动邀约说明兴趣很高，建议顺势确认具体时间，表现出期待但不要太急切"
  }
}
```

### POST /api/regenerate-replies

对同一条消息重新生成回复建议（意图分析不变）。

**请求体**：

```json
{
  "workspace": { "gender": "male", "relationship": "暧昧", "goal": "拉近距离" },
  "message": "周末有空吗，想去看那个展",
  "existingAnalysis": { "intent": {...}, "risks": {...} },
  "previousReplies": ["好呀...", "你是想看展...", "可以啊..."],
  "history": [...],
  "apiConfig": { "baseUrl": "...", "apiKey": "...", "model": "..." }
}
```

**响应体**：同 `/api/analyze` 的 `replies` 数组（3 条新建议，与之前不同）。

### POST /api/extract-from-screenshot

从聊天截图中提取对话记录。

**请求体**：

```json
{
  "images": ["base64_encoded_image_1", "base64_encoded_image_2"],
  "apiConfig": { "baseUrl": "...", "apiKey": "...", "model": "..." }
}
```

**响应体**：

```json
{
  "messages": [
    { "sender": "other", "content": "在干嘛呀", "time": "14:30" },
    { "sender": "me", "content": "刚忙完", "time": "14:31" },
    { "sender": "other", "content": "周末有空吗", "time": "14:32" }
  ]
}
```

- `sender`：`"other"` 对方 / `"me"` 我
- `time`：截图中可见的时间（可选，可能为 null）
- 多张截图按顺序合并，自动去重

## Prompt 设计

### 聊天分析 Prompt

```
你是一个高情商聊天助手。根据用户提供的上下文信息分析聊天记录。

用户信息：
- 性别：{gender}
- 与对方关系：{relationship}
- 期望效果：{goal}

请对每条消息进行分析，输出 JSON 格式：
1. intent（意图分析）：surface（表面意思）、real（真实意图）、emotion（情绪状态）、subtext（话外之音）
2. risks（风险提示）：misunderstand（可能误解）、minefield（雷区）、atmosphere（氛围趋势）
3. replies（回复建议）：3 个对象，包含 style、emoji、text（口语化可直接发送）、strategy
4. advanced（进阶建议）：话题引导或破冰建议，可选

规则：
- 回复必须口语化，像真人打字
- 根据用户性别和关系调整建议风格
- 考虑之前的对话上下文
- 直接给可用的回复，不要模板
```

### 截图提取 Prompt

```
请识别这张聊天截图中的对话记录。按时间顺序提取每条消息。

识别规则：
- 区分发送方：右侧气泡为"me"（我），左侧气泡为"other"（对方）
- 提取消息文字内容
- 如果能看到时间，提取时间
- 如果有多条消息，按从上到下顺序排列
- 支持微信、QQ、iMessage 等常见聊天软件的截图格式

输出 JSON 格式：
{
  "messages": [
    { "sender": "other"|"me", "content": "消息内容", "time": "HH:MM" }
  ]
}
```

## 文件结构

```
liaotianzhushou/
├── app/
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 主页面
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts          # 分析 API
│   │   ├── regenerate-replies/
│   │   │   └── route.ts          # 换一批回复 API
│   │   └── extract-from-screenshot/
│   │       └── route.ts          # 截图提取 API
│   └── globals.css
├── components/
│   ├── WorkspacePanel.tsx        # 左侧面板（Workspace 列表 + 设置）
│   ├── WorkspaceSwitcher.tsx     # Workspace 切换/新建
│   ├── ChatArea.tsx              # 右侧对话区域
│   ├── MessageBubble.tsx         # 消息气泡
│   ├── AnalysisCard.tsx          # 分析结果卡片
│   ├── ReplySuggestions.tsx      # 回复建议（含换一批按钮）
│   ├── ScreenshotUploader.tsx    # 截图上传/粘贴组件
│   └── ExtractedMessages.tsx     # 截图提取结果确认/编辑
├── lib/
│   ├── prompt.ts                 # Prompt 模板
│   ├── types.ts                  # TypeScript 类型
│   └── storage.ts                # localStorage 读写工具
├── .env.local                    # 环境变量（不提交）
└── docs/
```

## 数据存储

所有数据持久化到 localStorage，刷新不丢失：

```typescript
// localStorage key: "chat-assistant-data"
interface AppData {
  workspaces: Workspace[];        // 所有 Workspace
  activeWorkspaceId: string;      // 当前选中的 Workspace
  apiConfig: ApiConfig;           // 全局 API 设置
}

interface Workspace {
  id: string;
  name: string;                   // 对方备注名
  gender: "male" | "female";
  relationship: string;
  goal: string;
  messages: Message[];            // 完整对话历史
}

interface Message {
  id: string;
  sender: "other" | "me";        // 消息发送方
  content: string;
  time?: string;                  // 截图中提取的时间（可选）
  source: "manual" | "screenshot"; // 来源：手动输入 / 截图提取
  analysis: Analysis | null;      // AI 分析结果（仅 other 消息有）
  selectedReplyIndex: number | null; // 用户选择的回复索引
}
```

- **Workspace 列表及设置**：localStorage
- **对话历史（含分析结果和回复选择）**：localStorage，每个 Workspace 独立存储
- **API Key**：优先环境变量，可被用户输入覆盖，也存入 localStorage

## 错误处理

- API 调用失败：显示友好错误提示，保留输入内容
- API Key 未配置：引导用户在左侧面板填写
- 网络超时：显示重试按钮
- AI 返回格式异常：降级为纯文本展示
