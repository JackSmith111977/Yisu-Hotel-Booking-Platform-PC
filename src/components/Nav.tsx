"use client";
// 通用侧边栏组件
import { Layout, Menu } from "@arco-design/web-react";
import {
  IconBranch,
  IconCheckCircle,
  IconDashboard,
  IconSettings,
  IconMenu,
  IconEdit
} from "@arco-design/web-react/icon";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/user";

const menuConfig = {
    admin: [
      { key: "1", label: "仪表盘", path: "/admin/dashboard", icon: <IconDashboard /> },
      { key: "2", label: "信息审核", path: "/admin/audit", icon: <IconCheckCircle /> },
      { key: "3", label: "上线管理", path: "/admin/online", icon: <IconBranch /> },
      { key: "4", label: "设置选项", path: "/admin/setting", icon: <IconSettings /> },
    ],
    hotel: [
      { key: "1", label: "仪表盘", path: "/hotel/dashboard", icon: <IconDashboard /> },
      { key: "2", label: "我的酒店", path: "/hotel/management", icon: <IconMenu />},
      { key: "4", label: "待办事项", path: "/hotel/todo", icon: <IconSettings /> },
    ],
  };

// 菜单配置
interface NavProps {
    role: UserRole;
}

export default function Nav ({ role }: NavProps) {
  const router = useRouter();
  const items = menuConfig[role];

  function handleClickMenuItem(key: string) {
    const item = items.find((i) => i.key === key);
    if (item) {
      router.push(item.path);
    }
  }

  return (
    <Layout.Sider
      theme="dark"
      collapsible
      style={{ height: "100%" }}
    >
      <Menu
        theme="dark"
        mode="vertical"
        defaultOpenKeys={["1"]}
        onClickMenuItem={handleClickMenuItem}
        style={{ height: "100%" }}
      >
        <Menu.Item key="0" style={{ height: 50 }} disabled />
        {items.map((item) => (
          <Menu.Item key={item.key}>
            {item.icon}
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    </Layout.Sider>
  );
  }