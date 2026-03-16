import { Metadata } from "next";
import DashboardView from "./dashboard-view";

/**
 * 仪表盘页面元数据
 * Server Component 模式下直接导出元数据，提升 SEO 和性能
 */
export const metadata: Metadata = {
  title: "仪表盘 - 管理后台",
  description: "酒店预订平台管理后台仪表盘",
};

/**
 * DashboardPage (Server Component)
 * 作为仪表盘页面的入口，渲染 DashboardView 客户端视图
 */
export default function DashboardPage() {
  // todo: 添加 suspend + 骨架屏优化
  return <DashboardView />;
}
