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

### 用户信息选择

三个选择器，首次打开时必选：

1. **我的性别**：男 / 女
2. **与对方关系**：朋友 / 暧昧 / 情侣 / 同事 / 相亲对象 / 其他
3. **期望效果**：拉近距离 / 化解矛盾 / 保持吸引力 / 正常聊天

### API 设置

可折叠区域：

- **API Base URL**：默认读取环境变量 `OPENAI_BASE_URL`，可手动修改
- **API Key**：默认读取环境变量 `OPENAI_API_KEY`，可手动填写覆盖
- **模型名称**：默认读取环境变量 `OPENAI_MODEL`，可手动修改

状态持久化：用户信息和 API 设置保存在 localStorage，下次打开自动恢复。

## 右侧对话分析区

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

### 连续对话机制

- 用户点选一条回复建议 → 记录选择，作为上下文传给下一轮分析
- 历史分析默认折叠，点击展开
- 底部输入框持续粘贴新消息
- 每轮分析带氛围趋势标识

## API 设计

### POST /api/analyze

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

## Prompt 设计

System prompt 核心内容（中文）：

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

## 文件结构

```
liaotianzhushou/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts    # 分析 API
│   └── globals.css
├── components/
│   ├── WorkspacePanel.tsx  # 左侧设置面板
│   ├── ChatArea.tsx        # 右侧对话区域
│   ├── MessageBubble.tsx   # 消息气泡
│   ├── AnalysisCard.tsx    # 分析结果卡片
│   └── ReplySuggestions.tsx # 回复建议
├── lib/
│   ├── prompt.ts           # Prompt 模板
│   └── types.ts            # TypeScript 类型
├── .env.local              # 环境变量（不提交）
└── docs/
```

## 数据存储

- **Workspace 设置**：localStorage
- **对话历史**：当前页面 state（不持久化，刷新清空）
- **API Key**：优先环境变量，可被用户输入覆盖

## 错误处理

- API 调用失败：显示友好错误提示，保留输入内容
- API Key 未配置：引导用户在左侧面板填写
- 网络超时：显示重试按钮
- AI 返回格式异常：降级为纯文本展示
