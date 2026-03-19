"use client";
// 管理员页面
// 侧边栏

import { Layout, Menu } from "@arco-design/web-react";
import {
  IconBranch,
  IconCheckCircle,
  IconDashboard,
  IconFile,
  IconSettings,
} from "@arco-design/web-react/icon";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();

  const selectedKeys = useMemo(() => {
    if (pathname.includes("/admin/dashboard")) return ["1"];
    if (pathname.includes("/admin/audit")) return ["2"];
    if (pathname.includes("/admin/online")) return ["3"];
    if (pathname.includes("/admin/logs")) return ["4"];
    if (pathname.includes("/admin/settings")) return ["5"];
    return ["1"];
  }, [pathname]);

  function handleClickMenuItem(key: string) {
    if (key === "1") {
      router.push("/admin/dashboard");
    }
    if (key === "2") {
      router.push("/admin/audit");
    }
    if (key === "3") {
      router.push("/admin/online");
    }
    if (key === "4") {
      router.push("/admin/logs");
    }
    if (key === "5") {
      router.push("/admin/settings");
    }
  }

  return (
    <Layout.Sider
      theme="dark"
      collapsible
      style={{
        height: "100%",
      }}
    >
      <Menu
        theme="dark"
        mode="vertical"
        defaultOpenKeys={["1"]}
        selectedKeys={selectedKeys}
        onClickMenuItem={handleClickMenuItem}
        style={{
          height: "100%",
        }}
      >
        <Menu.Item
          key="0"
          style={{
            height: 50,
          }}
          disabled
        ></Menu.Item>
        <Menu.Item key="1">
          <IconDashboard />
          仪表盘
        </Menu.Item>
        <Menu.Item key="2">
          <IconCheckCircle />
          信息审核
        </Menu.Item>
        <Menu.Item key="3">
          <IconBranch />
          上线管理
        </Menu.Item>
        <Menu.Item key="4">
          <IconFile />
          操作日志
        </Menu.Item>
        <Menu.Item key="5">
          <IconSettings />
          设置选项
        </Menu.Item>
      </Menu>
    </Layout.Sider>
  );
}
