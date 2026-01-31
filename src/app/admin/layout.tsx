"use client";
import HeaderAvatar from "@/components/admin/HeaderAvatar";
import Nav from "@/components/admin/Nav";
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
      <Nav />
      <Layout>
        <HeaderAvatar />
        <Layout.Content
          style={{
            background: "#252525",
          }}
        >
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
