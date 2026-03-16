import { Metadata } from "next";
import LogsView from "./logs-view";

/**
 * 操作日志页面元数据
 */
export const metadata: Metadata = {
  title: "操作日志 - 管理后台",
  description: "查看系统管理人员的操作日志和变更记录",
};

/**
 * LogsPage (Server Component)
 * 作为操作日志页面的入口，渲染 LogsView 客户端视图
 */
export default function LogsPage() {
  // todo: 添加 suspend + 骨架屏优化
  return <LogsView />;
}
