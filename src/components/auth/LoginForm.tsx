// src/components/auth/LoginForm.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Button, Input, Space } from "@arco-design/web-react";
import { IconUser, IconLock } from "@arco-design/web-react/icon";

// 显式声明表单数据类型
interface FormData {
  account: string; // 账号/邮箱
  password: string; // 密码
}

export default function LoginForm() {
  // 登录表单状态
  const [formData, setFormData] = useState<FormData>({
    account: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleInputChange = (value: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg(""); // 输入时清空错误
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 基础验证
    if (!formData.account || !formData.password) {
      setErrorMsg("账号/邮箱和密码不能为空");
      return;
    }

    // 模拟登录请求
    setSubmitting(true);
    setTimeout(() => {
      alert(`登录成功！账号：${formData.account}`);
      setSubmitting(false);
      // 重置表单
      setFormData({ account: "", password: "" });
      setErrorMsg(""); // 登录成功后清空错误提示
    }, 1000);
  };

  return (
    <div
      style={{
        width: 420,
        margin: "50px auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>用户登录</h2>

      {/* 错误提示 */}
      {errorMsg && (
        <div style={{ color: "red", marginBottom: 16, textAlign: "center" }}>{errorMsg}</div>
      )}

      {/* 登录表单 */}
      <form onSubmit={handleSubmit}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* 账号/邮箱 */}
          <Input
            name="account"
            value={formData.account}
            onChange={handleInputChange}
            placeholder="请输入账号/邮箱"
            prefix={<IconUser />}
          />

          {/* 密码 */}
          <Input.Password
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="请输入密码"
            prefix={<IconLock />}
            style={{ width: "100%" }}
          />

          {/* 登录按钮 */}
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            style={{ width: "100%", height: 40 }}
          >
            登录
          </Button>

          {/* 注册超链接 */}
          <div style={{ textAlign: "center", fontSize: 14 }}>
            还没有账号？
            <Link href="/register" style={{ color: "#165DFF", marginLeft: 4 }}>
              立即注册
            </Link>
          </div>
        </Space>
      </form>
    </div>
  );
}
