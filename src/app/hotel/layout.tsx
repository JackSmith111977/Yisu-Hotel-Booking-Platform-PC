"use client";
import HeaderAvatar from "@/components/admin/HeaderAvatar";
import Nav from "@/components/Nav";
import { Layout } from "@arco-design/web-react";
import React from "react";
import { ThemeScript } from "@/components/global/ThemeScript";
import ThemeInit from "@/components/global/ThemeInit";

// 酒店页面全局布局
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // 显示指定 hasSider：自定义侧边栏，Layout 无法感知
    <Layout
      hasSider
      style={{
        height: "100vh",
      }}
    >
      {/* 阻塞式脚本注入 */}
      <ThemeScript />
      {/* 挂载主题监听器 */}
      <ThemeInit />
      <Nav role="hotel"/>
      <Layout>
        <HeaderAvatar />
        <Layout.Content
          className="bg-gray-100 transition-colors duration-200 dark:bg-gray-900"
        >
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
