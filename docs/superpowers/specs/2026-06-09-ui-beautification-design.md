# UI 美化设计文档

## 目标

将高情商聊天助手的 UI 从当前的平面风格升级为现代、自然、舒适的视觉风格，采用森林绿配色方案。所有文字必须清晰可读（浅绿背景 + 深绿文字，避免白色文字在浅色背景上看不清）。

## 配色方案

| Token | 旧值 | 新值 | 用途 |
|-------|------|------|------|
| `primary` | `#d96c5f` (coral) | `#22c55e` (green-500) | 边框高亮、选中边框、左边框 |
| `primary-dark` | 无 | `#166534` (green-800) | 按钮背景（深绿+白字）、深色强调 |
| `primary-light` | 无 | `#dcfce7` (green-100) | 选中背景、我的消息气泡背景 |
| `primary-border` | 无 | `#86efac` (green-300) | 选中元素的边框 |
| `paper` | `#f7f5ef` | `#f0f7f0` | 页面背景（偏绿暖白） |
| `mist` | `#e8eef2` | `#d4e4d4` | 未选中边框、分割线 |
| `ink` | `#172026` | `#1a3a1a` | 主文字颜色（深绿黑） |
| `sage` | `#8aa39b` | `#4a7c59` | 次要文字、标签 |

## 文字对比度规则

- **深色背景（如按钮 `#166534`）** → 白色文字 `#ffffff`
- **浅色背景（如选中 `#dcfce7`）** → 深绿文字 `#166534`
- **白色背景** → 深色文字 `#1a3a1a`
- **所有输入框** → 文字颜色 `#1a3a1a`

## 圆角

| 元素 | 旧值 | 新值 |
|------|------|------|
| 消息气泡 | `rounded` (4px) | `rounded-2xl` (16px) |
| 卡片 | `rounded` (4px) | `rounded-xl` (12px) |
| 回复卡片 | `rounded` (4px) | `rounded-xl` (12px) |
| 按钮 | `rounded` (4px) | `rounded-xl` (12px) |
| 输入框 | `rounded` (4px) | `rounded-xl` (12px) |
| 工作区按钮 | `rounded` (4px) | `rounded-xl` (12px) |

## 阴影

| 元素 | 旧值 | 新值 |
|------|------|------|
| 消息气泡 | `shadow-sm` | `shadow-md` |
| 分析卡片 | `shadow-sm` | `shadow-md` |
| 侧边栏 | 无 | `shadow-lg` |
| 底部输入栏 | 无 | `shadow-lg` (top) |
| 选中回复卡片 | 无 | `shadow-lg` + green tint |

## 交互状态

- 按钮：`hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`
- 输入框：`focus:border-green-500 focus:ring-2 focus:ring-green-500/20`
- 工作区按钮：`hover:bg-green-50`
- 回复卡片：`hover:shadow-md hover:border-green-300`

## 图标

| 元素 | 图标 |
|------|------|
| 聊天对象标题 | 💬 |
| API 设置 | ⚙️ |
| 上传截图 | 📷 |
| 分析按钮 | ✨ |
| 换一批 | 🔄 |
| 确认导入 | ✅ |
| 意图分析 | 📋 |
| 思考中 | 🧠 |

## 消息气泡样式

**对方消息（other）：**
- 背景：`bg-white`
- 圆角：`rounded-2xl rounded-bl-md`
- 阴影：`shadow-md`
- 文字：`text-[#1a3a1a]`

**我的消息（me）：**
- 背景：`bg-[#dcfce7]`
- 边框：`border border-[#86efac]`
- 圆角：`rounded-2xl rounded-br-md`
- 阴影：`shadow-md`
- 文字：`text-[#166534]`

## 修改文件清单

| 文件 | 改动 |
|------|------|
| `tailwind.config.ts` | 更新颜色 token |
| `app/globals.css` | 更新背景色 |
| `components/MessageBubble.tsx` | 圆角、阴影、气泡样式 |
| `components/AnalysisCard.tsx` | 圆角、阴影、图标 |
| `components/ReplySuggestions.tsx` | 圆角、阴影、选中样式 |
| `components/ReasoningDisplay.tsx` | 圆角、阴影、图标 |
| `components/ChatArea.tsx` | 空状态、输入栏、阴影 |
| `components/WorkspacePanel.tsx` | 阴影、输入框 focus |
| `components/WorkspaceSwitcher.tsx` | 圆角、hover、图标 |
| `components/ScreenshotUploader.tsx` | 圆角、图标 |
| `components/ExtractedMessages.tsx` | 圆角、阴影 |
