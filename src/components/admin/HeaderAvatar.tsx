import { Avatar, Layout, Space, Typography } from "@arco-design/web-react";

export default function HeaderAvatar() {
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
        <Typography.Text
          style={{
            color: "#cacaca",
            fontSize: 12,
            fontWeight: 200,
          }}
        >
          欢迎您，管理员 |
        </Typography.Text>

        <Avatar size={32}>😘</Avatar>
      </Space>
    </Layout.Header>
  );
}
