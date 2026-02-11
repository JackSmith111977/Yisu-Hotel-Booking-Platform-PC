'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Space, Message } from '@arco-design/web-react';
import { IconUser, IconLock, IconEmail, IconCode, IconUserGroup } from '@arco-design/web-react/icon';
import { checkUsernameUnique, sendRegisterCode, completeRegister } from '@/actions/auth';

// 表单类型（角色仅允许merchant/admin）
interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  code: string;
  role: 'merchant' | 'admin'; 
}

export default function RegisterForm() {
  // 角色默认选中商户
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    code: '',
    role: 'merchant',
  });
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sendingCode, setSendingCode] = useState<boolean>(false);
  const [usernameChecking, setUsernameChecking] = useState<boolean>(false);

  // 简易工具函数
  const isValidEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const isValidPassword = (pwd: string) => pwd.length >= 8;

  // 用户名失焦校验
  const handleUsernameBlur = async () => {
    if (!formData.username) return;
    setUsernameChecking(true);
    const res = await checkUsernameUnique(formData.username);
    setUsernameChecking(false);
    if (!res.isUnique) {
      setErrorMsg(res.message);
    } else {
      setErrorMsg('');
      Message.success('用户名可用');
    }
  };

  // 输入框变更
  const handleInputChange = (value: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  // 角色选择变更（仅商户/管理员）
  const handleRoleChange = (value: string | number) => {
    setFormData(prev => ({ ...prev, role: value as 'merchant' | 'admin' }));
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (sendingCode || !formData.email || !formData.username) {
      setErrorMsg('请先填写用户名和邮箱');
      return;
    }
    // 发送验证码前校验邮箱格式
    if (!isValidEmail(formData.email)) {
      setErrorMsg('请输入有效的邮箱地址');
      return;
    }
    setSendingCode(true);
    const res = await sendRegisterCode(formData.email, formData.username);
    setSendingCode(false);
    if (res.success) {
      Message.success(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  // 提交注册
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 提交前校验（仅这部分，无其他改动）
    if (!formData.password || !isValidPassword(formData.password)) {
      setErrorMsg('密码长度不能少于8位');
      return;
    }
    if (formData.confirmPassword !== formData.password) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }
    if (!isValidEmail(formData.email)) {
      setErrorMsg('请输入有效的邮箱地址');
      return;
    }
    if (!formData.code) {
      setErrorMsg('请输入验证码');
      return;
    }

    setSubmitting(true);
    const res = await completeRegister(formData);
    setSubmitting(false);
    if (res.success) {
      Message.success(res.message);
      // 重置表单
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        code: '',
        role: 'merchant',
      });
      // 1.5秒后跳转到登录页
      setTimeout(() => window.location.href = '/register', 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div style={{ width: 420, margin: '50px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>用户注册</h2>
      {errorMsg && <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 用户名 */}
          <Input
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            onBlur={handleUsernameBlur}
            placeholder="请输入用户名"
            prefix={<IconUser />}
          />

          {/* 密码（仅改占位符文案，无其他改动） */}
          <Input.Password
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="请输入密码（至少8位）"
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
            placeholder="请输入邮箱（用于接收验证码）"
            prefix={<IconEmail />}
          />

          {/* 验证码 */}
          <Space>
            <Input
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="请输入6位验证码"
              prefix={<IconCode />}
              style={{ flex: 1 }}
            />
            <Button
              onClick={handleSendCode}
              disabled={!formData.email || !formData.username || sendingCode}
              loading={sendingCode}
            >
              {sendingCode ? '发送中...' : '发送验证码'}
            </Button>
          </Space>

          {/* 角色选择（仅商户/管理员，默认商户） */}
          <Select
            value={formData.role}
            onChange={handleRoleChange}
            placeholder="请选择角色"
            prefix={<IconUserGroup />}
            style={{ width: '100%' }}
            options={[
              { label: '酒店商家', value: 'merchant' }, // 商户
              { label: '管理员', value: 'admin' },       // 管理员
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
            已有账号？
            <Link href="/register" style={{ color: '#165DFF', marginLeft: 4 }}>
              立即登录
            </Link>
          </div>
        </Space>
      </form>
    </div>
  );
}