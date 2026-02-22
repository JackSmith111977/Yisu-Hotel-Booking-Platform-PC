"use client";

import AppearanceSettings from "@/components/admin/AppearanceSettings";
import ProfileSettings from "@/components/admin/ProfileSettings";
import { Card, Tabs } from "@arco-design/web-react";
import { IconSkin, IconUser } from "@arco-design/web-react/icon";

const { TabPane } = Tabs;

export default function SettingsPage() {
  return (
    <Card title="系统设置" bordered={false} style={{ height: "100vh" }}>
      <Tabs defaultActiveTab="profile" direction="vertical" className="h-full">
        {/* 个人资料 */}
        <TabPane
          key="profile"
          title={
            <span>
              <IconUser className="mr-2" />
              个人资料
            </span>
          }
        >
          <div className="pl-8">
            <ProfileSettings />
          </div>
        </TabPane>
        {/* 外观设置 */}
        <TabPane
          key="appearance"
          title={
            <span>
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
