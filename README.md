# 高情商聊天助手

一个 Next.js Web 应用，用来分析聊天对象的意图、情绪和潜台词，并生成三种风格的可直接发送回复建议。支持多个聊天对象 Workspace、连续上下文、截图识别确认和本地持久化。

## 开发

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 配置

可在左侧 API 设置里填写：

- API Base URL
- API Key
- 模型名称

也可以通过 `.env.local` 提供默认值：

```env
NEXT_PUBLIC_OPENAI_BASE_URL=https://api.openai.com/v1
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-key
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o
```

用户在页面里填写的配置会保存到 `localStorage`。

## 验证

```bash
npm test
npm run build
```
