import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "午夜密语 · 高情商聊天助手",
  description: "AI 驱动的聊天意图分析与回复建议，洞察话外之音"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="mesh-bg">{children}</body>
    </html>
  );
}
