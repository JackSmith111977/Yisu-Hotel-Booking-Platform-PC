"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { Divider, Switch, Typography } from "@arco-design/web-react";
import { IconMoon, IconSun } from "@arco-design/web-react/icon";
import { useState } from "react";

export default function AppearanceSettings() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <div className="max-w-3xl">
      <Typography.Title heading={6}>外观设置</Typography.Title>

      {/* 示例：主题切换 */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div>
          <div className="font-bold text-gray-900 dark:text-gray-100">深色模式</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            切换系统为深色外观，保护视力
          </div>
        </div>
        <Switch
          checkedIcon={<IconMoon />}
          uncheckedIcon={<IconSun />}
          checked={theme === "dark"}
          onChange={toggleTheme}
        />
      </div>

      <Divider />

      <div>更多配置...</div>

      {/* 你可以在这里添加更多设置，比如“紧凑模式”、“主题色”等 */}
    </div>
  );
}
