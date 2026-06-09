import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "高情商聊天助手",
  description: "分析聊天意图并生成自然回复建议"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
