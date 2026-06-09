import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  devIndicators: false,
  // sql.js 使用 WASM，需要标记为外部包以避免 Turbopack 打包问题
  serverExternalPackages: ["sql.js"]
};

export default nextConfig;
