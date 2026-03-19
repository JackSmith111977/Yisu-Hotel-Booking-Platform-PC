"use client";

import AppearanceSettings from "@/components/admin/AppearanceSettings";
import ProfileSettings from "@/components/admin/ProfileSettings";
import { Card, Tabs } from "@arco-design/web-react";
import { IconSkin, IconUser } from "@arco-design/web-react/icon";

const { TabPane } = Tabs;

/**
 * SettingsView (Client Component)
 * 负责系统设置页面的布局和标签页切换逻辑
 */
export default function SettingsView() {
  return (
    <Card
      title="系统设置"
      bordered={false}
      style={{ height: "100%", minHeight: "calc(100vh - 120px)" }}
    >
      <Tabs defaultActiveTab="profile" direction="vertical" className="h-full">
        {/* 个人资料设置面板 */}
        <TabPane
          key="profile"
          title={
            <span className="flex items-center">
              <IconUser className="mr-2" />
              个人资料
            </span>
          }
        >
          <div className="pl-8">
            <ProfileSettings />
          </div>
        </TabPane>

        {/* 系统外观设置面板 (暗黑模式等) */}
        <TabPane
          key="appearance"
          title={
            <span className="flex items-center">
              <IconSkin className="mr-2" />
              外观设置
            </span>
          }
        >
          <div className="pt-2 pl-8">
            <AppearanceSettings />
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
}
