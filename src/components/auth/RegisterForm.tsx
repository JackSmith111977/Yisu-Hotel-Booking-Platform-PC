// src/components/auth/RegisterForm.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Space } from '@arco-design/web-react';
import { IconUser, IconLock, IconEmail, IconCode, IconUserGroup } from '@arco-design/web-react/icon';

// 表单数据类型声明
interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  verifyCode: string;
  role: string;
}

// 组件Props类型
interface RegisterFormProps {}

export default function RegisterForm({}: RegisterFormProps) {
  // 状态定义
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    verifyCode: '',
    role: 'user',
  });
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sendingCode, setSendingCode] = useState<boolean>(false);

  
  const handleInputChange = (value: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

 
  const handleRoleChange = (value: string | number) => {
    setFormData(prev => ({ ...prev, role: value as string }));
  };

  // 发送验证码逻辑
  const handleSendCode = () => {
    if (sendingCode) return;
    if (!formData.email) {
      setErrorMsg('请先输入邮箱');
      return;
    }
    const emailReg = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailReg.test(formData.email)) {
      setErrorMsg('邮箱格式错误');
      return;
    }
    setSendingCode(true);
    alert(`验证码已发送至 ${formData.email}，验证码：654321`);
    setTimeout(() => setSendingCode(false), 60000);
  };

  // 表单提交逻辑不变
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { username, password, confirmPassword, email, verifyCode, role } = formData;

    if (!username || !password || !confirmPassword || !email || !verifyCode || !role) {
      setErrorMsg('所有字段不能为空');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('密码至少6位');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('两次密码不一致');
      return;
    }
    const emailReg = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailReg.test(email)) {
      setErrorMsg('邮箱格式错误');
      return;
    }
    if (verifyCode !== '654321') {
      setErrorMsg('验证码错误（正确：654321）');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      alert(`注册成功！用户名：${username}，角色：${role}`);
      setSubmitting(false);
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        verifyCode: '',
        role: 'user',
      });
      setErrorMsg('');
    }, 1000);
  };

  return (
    <div style={{ width: 420, margin: '50px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>用户注册</h2>
      {errorMsg && <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 用户名 Input */}
          <Input
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="请输入用户名"
            prefix={<IconUser />}
          />

          {/* 密码 Input.Password */}
          <Input.Password
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="请输入密码（至少6位）"
            prefix={<IconLock />}
          />

          {/* 确认密码 */}
          <Input.Password
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="请确认密码"
            prefix={<IconLock />}
          />

          {/* 邮箱 */}
          <Input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="请输入邮箱"
            prefix={<IconEmail />}
          />

          {/* 验证码 */}
          <Space>
            <Input
              name="verifyCode"
              value={formData.verifyCode}
              onChange={handleInputChange}
              placeholder="请输入验证码"
              prefix={<IconCode />}
              style={{ flex: 1 }}
            />
            <Button
              onClick={handleSendCode}
              disabled={!formData.email || sendingCode}
              loading={sendingCode}
            >
              {sendingCode ? '发送中...' : '发送验证码'}
            </Button>
          </Space>

          {/* 角色选择 */}
          <Select
            value={formData.role}
            onChange={handleRoleChange}
            placeholder="请选择角色"
            prefix={<IconUserGroup />}
            style={{ width: '100%' }}
            options={[
              { label: '普通用户', value: 'user' },
              { label: '酒店商家', value: 'merchant' },
              { label: '管理员', value: 'admin' },
            ]}
          />

          {/* 注册按钮 */}
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            style={{ width: '100%', height: 40 }}
          >
            注册
          </Button>

          {/* 登录链接 */}
          <div style={{ textAlign: 'center', fontSize: 14 }}>
            <Link href="/login" style={{ color: '#165DFF', marginRight: 4 }}>
              登录
            </Link>
            <span>|</span>
            <span style={{ marginLeft: 4 }}>
              已有账号？
              <Link href="/login" style={{ color: '#165DFF', marginLeft: 4 }}>
                立即登录
              </Link>
            </span>
          </div>
        </Space>
      </form>
    </div>
  );
}