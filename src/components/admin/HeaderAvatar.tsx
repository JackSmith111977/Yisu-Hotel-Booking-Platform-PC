import {
  Avatar,
  Layout,
  Space,
  Typography,
  Dropdown,
  Menu,
  Message,
  Skeleton,
} from "@arco-design/web-react";
import { IconSettings, IconPoweroff } from "@arco-design/web-react/icon";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { logout } from "@/actions/auth";

export default function HeaderAvatar() {
  const { user, fetchUser, isLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  console.log("HeaderAvatar user:", user);

  // 1. 角色文案逻辑
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin":
        return "管理员";
      case "merchant":
        return "商家";
      default:
        return "用户";
    }
  };

  // 2. 昵称显示逻辑
  const displayName = user?.nickname || user?.username || "";
  const roleLabel = getRoleLabel(user?.role);

  // 获取首字母作为 Fallback
  const getAvatarFallback = () => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    return "U";
  };

  // 3. 退出登录逻辑
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      Message.success(result.message || "退出成功");
      router.replace("/login");
    } else {
      Message.error(result.message || "退出失败");
    }
  };

  // 4. 跳转设置逻辑
  const handleSettings = () => {
    if (user?.role === "admin") {
      router.push("/admin/setting");
    } else if (user?.role === "merchant") {
      router.push("/hotel/management");
    }
  };

  const dropList = (
    <Menu>
      <Menu.Item key="setting" onClick={handleSettings}>
        <IconSettings style={{ marginRight: 8 }} />
        个人设置
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        <IconPoweroff style={{ marginRight: 8 }} />
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout.Header
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "10px 20px",
        background: "#202020",
      }}
    >
      <Typography.Title
        heading={5}
        style={{
          fontFamily: "'Segoe UI', Roboto",
          margin: 0,
          color: "#6863ff",
          fontSize: 24,
          fontWeight: 500,
          letterSpacing: 1, // 增加字间距
        }}
      >
        易宿
      </Typography.Title>
      <Typography.Title
        heading={5}
        style={{
          margin: 0,
          color: "#cacaca",
          fontSize: 18,
          fontWeight: 200,
          letterSpacing: 1, // 增加字间距
        }}
      >
        酒店管理平台
      </Typography.Title>
      <Space
        size="medium"
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        {isLoading || !user ? (
          <Skeleton text={{ rows: 1, width: 150 }} animation />
        ) : (
          <Dropdown droplist={dropList} position="br">
            <Space style={{ cursor: "pointer", alignItems: "center" }}>
              <Typography.Text
                style={{
                  color: "#cacaca",
                  fontSize: 12,
                  fontWeight: 200,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#888", marginRight: 8 }}>{roleLabel} |</span>
                <span style={{ color: "#fff", fontWeight: 400 }}>{displayName}</span>
              </Typography.Text>

              <Avatar size={32} style={{ backgroundColor: "#6863ff" }}>
                {user?.avatar ? <img src={user.avatar} alt="avatar" /> : getAvatarFallback()}
              </Avatar>
            </Space>
          </Dropdown>
        )}
      </Space>
    </Layout.Header>
  );
}
