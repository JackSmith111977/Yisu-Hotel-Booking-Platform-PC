"use client";
import HeaderAvatar from "@/components/admin/HeaderAvatar";
import Nav from "@/components/admin/Nav";
import GlobalMessage from "@/components/global/GlobalMessage";
import { Layout } from "@arco-design/web-react";
import React from "react";

// 管理员页面全局布局
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // 显示指定 hasSider：自定义侧边栏，Layout 无法感知
    <Layout
      hasSider
      style={{
        height: "100vh",
      }}
    >
      {/* 2. 挂载全局消息组件 (不受 CSS 布局影响，因为是 fixed 定位) */}
      <GlobalMessage />
      <Nav />
      <Layout style={{ overflow: "hidden" }}>
        <HeaderAvatar />
        <Layout.Content
          style={{
            background: "#252525",
            overflow: "hidden",
          }}
        >
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
