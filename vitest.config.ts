import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Vitest 配置文件
 * 用于配置 Next.js 项目的单元测试环境
 */
export default defineConfig({
  // 集成 React 插件，支持 JSX/TSX 转换
  plugins: [react()],
  test: {
    // 启用全局变量（如 describe, it, expect），无需在每个文件中手动导入
    globals: true,
    // 使用 jsdom 模拟浏览器环境，用于测试 React 组件
    environment: "jsdom",
    // 路径别名配置，与 tsconfig.json 保持一致
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // 指定测试文件所在目录，避免扫描不必要的文件，确保不影响现有业务逻辑
    include: ["src/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
