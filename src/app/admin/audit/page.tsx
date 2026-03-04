import { Metadata } from "next";
import { Suspense } from "react";
import AuditView from "./audit-view";

/**
 * 页面元数据：SEO 和浏览器标签标题
 * 由于这是一个 Server Component，可以直接导出元数据，解决 Metadata 冲突问题
 */
export const metadata: Metadata = {
  title: "酒店审核 - 管理后台",
  description: "酒店入驻审核管理页面",
};

/**
 * AuditPage (Server Component)
 * 1. 它是服务端组件，作为整个页面的入口
 * 2. 导出 Metadata 提升 SEO 和页面标识
 * 3. 渲染 AuditView 客户端组件处理交互逻辑
 */
export default function AuditPage() {
  return (
    /**
     * 使用 Suspense 包裹 AuditView：
     * 由于 AuditView 中使用了 useSearchParams()，在 Next.js 的静态渲染中，
     * 需要用 Suspense 包裹，以确保客户端水合（Hydration）时的正确性。
     */
    <Suspense fallback={<div className="p-6">加载中...</div>}>
      <AuditView />
    </Suspense>
  );
}
