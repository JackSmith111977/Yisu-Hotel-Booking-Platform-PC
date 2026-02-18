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

// ========== 完全复用你提供的密码复杂度验证函数 ==========
export const validatePassword = (password: string) => {
  if (password.length < 8) {
    return { isValid: false, message: '密码长度至少8位' };
  }
  //只校验大小写、数字、特殊字符
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
  
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return { 
      isValid: false, 
      message: '密码需包含大小写字母、数字和特殊字符（!@#$%^&*等）' 
    };
  }
  return { isValid: true, message: '密码验证通过' };
};

export default function RegisterForm() {
  // 角色默认选中商户（原有代码完全不变）
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

  // ========== 各字段独立提示文本（无属性错误） ==========
  const [passwordTip, setPasswordTip] = useState<string>('');       // 密码复杂度提示
  const [confirmPasswordTip, setConfirmPasswordTip] = useState<string>(''); // 两次密码一致提示
  const [emailTip, setEmailTip] = useState<string>('');             // 邮箱提示
  const [usernameTip, setUsernameTip] = useState<string>('');       // 用户名提示

  // ========== 用户名失焦校验（原有强化，无改动） ==========
  const handleUsernameBlur = async () => {
    if (!formData.username) {
      setUsernameTip('请输入用户名');
      return;
    }
    setUsernameChecking(true);
    setUsernameTip('正在校验用户名...');
    const res = await checkUsernameUnique(formData.username);
    setUsernameChecking(false);
    if (!res.isUnique) {
      setErrorMsg(res.message);
      setUsernameTip(res.message);
      Message.error(res.message);
    } else {
      setErrorMsg('');
      setUsernameTip('✅ 用户名可用');
      Message.success('用户名可用');
    }
  };

  // ========== 核心修改：密码校验完全对齐你的validatePassword函数 ==========
  const handleInputChange = (value: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');

    // 1. 密码字段：实时校验（完全复用你的validatePassword函数）
    if (name === 'password') {
      if (!value) {
        setPasswordTip('');
      } else {
        // 调用你提供的校验函数
        const pwdRes = validatePassword(value);
        // 拼接提示标识（❌/✅），保持文案和你的函数一致
        setPasswordTip(`${pwdRes.isValid ? '✅' : '❌'} ${pwdRes.message}`);
      }
      
      // 同步校验两次密码是否一致（如果确认密码已输入）
      if (formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          setConfirmPasswordTip('❌ 两次输入的密码不一致');
        } else {
          // 先校验密码复杂度，再提示一致
          const pwdRes = validatePassword(value);
          if (pwdRes.isValid) {
            setConfirmPasswordTip('✅ 两次输入的密码一致');
          } else {
            setConfirmPasswordTip(`❌ ${pwdRes.message}`);
          }
        }
      }
    }
    // 2. 确认密码字段：实时校验和密码是否一致
    else if (name === 'confirmPassword') {
      if (!value) {
        setConfirmPasswordTip('');
      } else if (value !== formData.password) {
        setConfirmPasswordTip('❌ 两次输入的密码不一致');
      } else {
        // 调用你的校验函数，确保密码本身合法
        const pwdRes = validatePassword(formData.password);
        if (pwdRes.isValid) {
          setConfirmPasswordTip('✅ 两次输入的密码一致');
        } else {
          setConfirmPasswordTip(`❌ ${pwdRes.message}`);
        }
      }
    }
    // 3. 邮箱字段：实时合法性校验（原有不变）
    else if (name === 'email') {
      if (!value) {
        setEmailTip('');
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        setEmailTip('❌ 请输入有效的邮箱地址');
      } else {
        setEmailTip('✅ 邮箱格式正确');
      }
    }
    // 4. 用户名：输入时重置提示（原有不变）
    else if (name === 'username') {
      setUsernameTip('');
    }
  };

  // 角色选择变更（原有代码不变）
  const handleRoleChange = (value: string | number) => {
    setFormData(prev => ({ ...prev, role: value as 'merchant' | 'admin' }));
  };

  // 发送验证码（原有代码不变）
  const handleSendCode = async () => {
    if (sendingCode || !formData.email || !formData.username) {
      setErrorMsg('请先填写用户名和邮箱');
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
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

  // 提交注册（复用你的validatePassword函数，确保校验规则一致）
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. 密码复杂度校验（完全复用你的函数）
    const pwdRes = validatePassword(formData.password);
    if (!pwdRes.isValid) {
      setErrorMsg(pwdRes.message);
      return;
    }
    // 2. 两次密码一致校验
    if (formData.confirmPassword !== formData.password) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }
    // 3. 邮箱校验
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      setErrorMsg('请输入有效的邮箱地址');
      return;
    }
    // 4. 验证码校验
    if (!formData.code) {
      setErrorMsg('请输入验证码');
      return;
    }

    setSubmitting(true);
    const res = await completeRegister(formData);
    setSubmitting(false);
    if (res.success) {
      Message.success(res.message);
      // 重置表单和所有提示
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        code: '',
        role: 'merchant',
      });
      setPasswordTip('');
      setConfirmPasswordTip('');
      setEmailTip('');
      setUsernameTip('');
      // 跳转登录页
      setTimeout(() => window.location.href = '/login', 1500);
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
          {/* 用户名：失焦查重 + 纯文本提示 */}
          <div style={{ width: '100%' }}>
            <Input
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleUsernameBlur}
              placeholder="请输入用户名"
              prefix={<IconUser />}
              disabled={usernameChecking}
            />
            {usernameTip && (
              <div style={{ fontSize: 12, marginTop: 4, color: usernameTip.includes('❌') ? 'red' : 'green' }}>
                {usernameTip}
              </div>
            )}
          </div>

          {/* 密码：实时复杂度校验（对齐你的函数） + 纯文本提示 */}
          <div style={{ width: '100%' }}>
            <Input.Password
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="请输入密码（至少8位，含大小写字母、数字、特殊字符）"
              prefix={<IconLock />}
            />
            {passwordTip && (
              <div style={{ fontSize: 12, marginTop: 4, color: passwordTip.includes('❌') ? 'red' : 'green' }}>
                {passwordTip}
              </div>
            )}
          </div>

          {/* 确认密码：实时一致性校验 + 纯文本提示 */}
          <div style={{ width: '100%' }}>
            <Input.Password
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="请确认密码"
              prefix={<IconLock />}
            />
            {confirmPasswordTip && (
              <div style={{ fontSize: 12, marginTop: 4, color: confirmPasswordTip.includes('❌') ? 'red' : 'green' }}>
                {confirmPasswordTip}
              </div>
            )}
          </div>

          {/* 邮箱：实时合法性校验 + 纯文本提示 */}
          <div style={{ width: '100%' }}>
            <Input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="请输入邮箱（用于接收验证码）"
              prefix={<IconEmail />}
            />
            {emailTip && (
              <div style={{ fontSize: 12, marginTop: 4, color: emailTip.includes('❌') ? 'red' : 'green' }}>
                {emailTip}
              </div>
            )}
          </div>

          {/* 验证码（原有不变） */}
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

          {/* 角色选择（原有不变） */}
          <Select
            value={formData.role}
            onChange={handleRoleChange}
            placeholder="请选择角色"
            prefix={<IconUserGroup />}
            style={{ width: '100%' }}
            options={[
              { label: '酒店商家', value: 'merchant' },
              { label: '管理员', value: 'admin' },
            ]}
          />

          {/* 注册按钮（原有不变） */}
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            style={{ width: '100%', height: 40 }}
          >
            注册
          </Button>

          {/* 登录链接（修正跳转） */}
          <div style={{ textAlign: 'center', fontSize: 14 }}>
            已有账号？
            <Link href="/login" style={{ color: '#165DFF', marginLeft: 4 }}>
              立即登录
            </Link>
          </div>
        </Space>
      </form>
    </div>
  );
}
