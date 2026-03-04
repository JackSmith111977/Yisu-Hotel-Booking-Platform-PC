import { Metadata } from "next";
import SettingsView from "./settings-view";

/**
 * 系统设置页面元数据
 */
export const metadata: Metadata = {
  title: "系统设置 - 管理后台",
  description: "管理个人资料、系统外观和其他系统偏好设置",
};

/**
 * SettingsPage (Server Component)
 * 作为系统设置页面的入口，渲染 SettingsView 客户端视图
 */
export default function SettingsPage() {
  return <SettingsView />;
}
