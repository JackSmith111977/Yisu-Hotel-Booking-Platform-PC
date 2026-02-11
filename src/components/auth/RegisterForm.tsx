'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Space, Message } from '@arco-design/web-react';
import { IconUser, IconLock } from '@arco-design/web-react/icon';
import { loginWithJWT } from '@/actions/auth';
import { useRouter } from 'next/navigation';

interface FormData {
  account: string; // 邮箱/用户名
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    account: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 邮箱格式校验函数
  const isValidEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleInputChange = (value: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.account || !formData.password) {
      setErrorMsg('账号和密码不能为空');
      return;
    }

    // 提交前校验账号（如果是邮箱则校验格式）
    if (formData.account.includes('@') && !isValidEmail(formData.account)) {
      setErrorMsg('请输入有效的邮箱地址');
      return;
    }

    setSubmitting(true);
    const res = await loginWithJWT(formData);
    setSubmitting(false);

    if (res.success) {
      Message.success(res.message);
      // 存储JWT Token和用户信息
      if (res.token && res.user) {
        localStorage.setItem('access_token', res.token);
        localStorage.setItem('user_info', JSON.stringify(res.user));
      }
      // 按角色跳转
      if (res.user?.role === 'admin') {
        router.push('/admin'); // 管理员跳后台
      } else if (res.user?.role === 'merchant') {
        router.push('/hotel'); // 商户跳商家页面
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div
      style={{
        width: 420,
        margin: '50px auto',
        padding: 24,
        border: '1px solid #eee',
        borderRadius: 8,
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>用户登录</h2>
      {errorMsg && (
        <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{errorMsg}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 账号/邮箱 */}
          <Input
            name="account"
            value={formData.account}
            onChange={handleInputChange}
            placeholder="请输入用户名/邮箱"
            prefix={<IconUser />}
          />

          {/* 密码 */}
          <Input.Password
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="请输入密码"
            prefix={<IconLock />}
            style={{ width: '100%' }}
          />

          {/* 登录按钮 */}
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            style={{ width: '100%', height: 40 }}
          >
            登录
          </Button>

          {/* 注册超链接 */}
          <div style={{ textAlign: 'center', fontSize: 14 }}>
            还没有账号？
            <Link href="/login" style={{ color: '#165DFF', marginLeft: 4 }}>
              立即注册
            </Link>
          </div>
        </Space>
      </form>
    </div>
  );
}
