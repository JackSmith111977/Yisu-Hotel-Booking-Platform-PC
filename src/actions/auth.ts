'use server';
import { supabase_admin } from '@/lib/supabase_admin';
import { revalidatePath } from 'next/cache';
import { validateEmail, validatePassword, generateVerifyCode, validateRole } from '@/lib/validate';

import { sendRegisterVerifyEmail } from '@/lib/email';

// 通用返回类型
type BaseResponse = {
  success: boolean;
  message: string;
};

// ====================== 注册 ======================
export async function checkUsernameUnique(username: string): Promise<{ isUnique: boolean; message: string }> {
  if (!username) {
    return { isUnique: false, message: '用户名不能为空' };
  }

  try {
    const { data: users, error } = await supabase_admin
      .from('users')
      .select('username') // 查询username列
      .eq('username', username);

    if (error) {
      console.error('用户名校验失败：', error);
      return { isUnique: false, message: '验证失败，请重试' };
    }

    if (users.length > 0) {
      return { isUnique: false, message: '用户名已被占用' };
    }
    return { isUnique: true, message: '用户名可用' };
  } catch (err) {
    console.error('用户名校验异常：', err);
    return { isUnique: false, message: '验证失败，请重试' };
  }
}

/** 注册验证码发送 */
export async function sendRegisterCode(email: string, username: string): Promise<BaseResponse> {
  if (!validateEmail(email)) {
    return { success: false, message: '邮箱格式错误' };
  }
  if (!username) {
    return { success: false, message: '用户名不能为空' };
  }

  // 生成最新验证码
  const code = generateVerifyCode();
  const expiresAtLocal = new Date(Date.now() + 5 * 60 * 1000);
  const expiresAt = new Date(expiresAtLocal.getTime() - expiresAtLocal.getTimezoneOffset() * 60 * 1000);

  try {
    //删除该邮箱所有未使用的注册验证码
    const { error: deleteError } = await supabase_admin
      .from('verify_codes')
      .delete()
      .eq('email', email)
      .eq('type', 'register')
      .eq('used', false);

    if (deleteError) {
      console.error('删除旧验证码失败：', deleteError);
    }

    // 2. 存储最新验证码
    const { error: saveError } = await supabase_admin
      .from('verify_codes')
      .insert([
        {
          email,
          code,
          type: 'register',
          expires_at: expiresAt,
          used: false,
        },
      ]);

    if (saveError) {
      console.error('验证码存储失败：', saveError);
      return { success: false, message: '验证码存储失败，请重试' };
    }

    console.log(' 最新验证码存储成功：', { email, code });

    // QQ邮箱发送最新验证码
    const emailResult = await sendRegisterVerifyEmail(email, username, code);
    if (!emailResult.success) {
      return { success: false, message: `验证码发送失败：${emailResult.error}` };
    }

    return { success: true, message: '验证码已发送至你的邮箱，有效期5分钟' };
  } catch (err) {
    console.error('发送验证码异常：', err);
    return { success: false, message: '发送验证码失败，请重试' };
  }
}

/** 注册验证码验证 */
export async function verifyRegisterCode(email: string, code: string): Promise<BaseResponse> {
  if (!code || code.length !== 6) {
    return { success: false, message: '验证码格式错误（需6位数字）' };
  }

  try {
    const nowLocal = new Date();
    const nowUTC = new Date(nowLocal.getTime() - nowLocal.getTimezoneOffset() * 60 * 1000);

    const { data, error } = await supabase_admin
      .from('verify_codes')
      .select('*')
      .eq('email', email)
      .eq('type', 'register')
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', nowUTC.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('查询验证码失败：', error);
      return { success: false, message: '验证码验证失败，请重试' };
    }

    if (!data || data.length === 0) {
      return { success: false, message: '验证码无效或已过期' };
    }

    // 标记验证码为已使用
    await supabase_admin
      .from('verify_codes')
      .update({ used: true })
      .eq('id', data[0].id);

    return { success: true, message: '验证码验证通过' };
  } catch (err) {
    console.error('验证验证码异常：', err);
    return { success: false, message: '验证码验证失败，请重试' };
  }
}

/** 完成注册 */
export async function completeRegister(formData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
  role: 'merchant' | 'admin';
}): Promise<BaseResponse> {
  const { username, email, password, confirmPassword, code, role } = formData;

  try {
    // 基础校验
    const usernameCheck = await checkUsernameUnique(username);
    if (!usernameCheck.isUnique) {
      return { success: false, message: usernameCheck.message };
    }

    if (password !== confirmPassword) {
      return { success: false, message: '两次密码不一致' };
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return { success: false, message: passwordCheck.message };
    }

    if (!validateEmail(email)) {
      return { success: false, message: '邮箱格式错误' };
    }

    const codeCheck = await verifyRegisterCode(email, code);
    if (!codeCheck.success) {
      return { success: false, message: codeCheck.message };
    }

    const roleCheck = validateRole(role);
    if (!roleCheck.isValid) {
      return { success: false, message: roleCheck.message };
    }

    // 创建Supabase用户
    const { data, error } = await supabase_admin.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      },
    });

    if (error) {
      console.error('注册失败：', error);
      return { success: false, message: `注册失败：${error.message}` };
    }

    if (!data?.user) {
      return { success: false, message: '注册异常，未获取到用户信息' };
    }

    // 写入public.users表（字段完全匹配表结构）
    const { error: insertError } = await supabase_admin
      .from('users')
      .insert([
        {
          id: data.user.id,        // 匹配表id列
          username: username,      // 匹配表username列
          email: email,            // 匹配表email列
          role: role,              // 匹配表role列
          created_at: new Date(),  // 匹配表created_at列
        },
      ]);

    if (insertError) {
      console.error('写入public.users失败：', insertError);
      // 回滚用户创建
      await supabase_admin.auth.admin.deleteUser(data.user.id);
      return { success: false, message: `用户信息存储失败：${insertError.message}` };
    }

    revalidatePath('/register');
    return { success: true, message: '注册成功！请前往邮箱验证后登录' };
  } catch (err) {
    console.error('注册异常：', err);
    return { success: false, message: '注册失败，请重试' };
  }
}

// ====================== 登录 ======================
/** 登录验证 + JWT Token签发*/
export async function loginWithJWT(formData: {
  account: string; // 邮箱/用户名
  password: string;
}) {
  const { account, password } = formData;

  try {
    // 区分账户类型（邮箱/用户名）
    let email = '';
    if (validateEmail(account)) {
      email = account;
    } else {
      const { data: users, error: userError } = await supabase_admin
        .from('users')
        .select('email, user_metadata')
        .eq('user_metadata->>username', account);

      if (userError || !users || users.length === 0) {
        return { success: false, message: '账户不存在' };
      }

      const userData = users[0];
      // TS类型安全：明确user_metadata的类型
      const userRole = (userData.user_metadata as { role?: string })?.role;
      if (!userRole || !['merchant', 'admin'].includes(userRole)) {
        return { success: false, message: '账户角色非法，无法登录' };
      }
      email = userData.email;
    }

    // 密码验证 ,获取JWT Token
    const { data, error } = await supabase_admin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('登录失败：', error);
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, message: '密码错误' };
      }
      return { success: false, message: `登录失败：${error.message}` };
    }

    // TS类型安全：非空校验 + 类型断言
    if (!data.user || !data.session) {
      return { success: false, message: '登录异常，未获取到用户信息' };
    }

    // 获取用户信息和角色
    const userRole = (data.user.user_metadata as { role?: 'merchant' | 'admin' })?.role;
    if (!userRole) {
      return { success: false, message: '用户角色未配置，无法登录' };
    }

    return {
      success: true,
      message: '登录成功',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        username: (data.user.user_metadata as { username?: string })?.username || '',
        email: data.user.email || '',
        role: userRole,
      },
    };
  } catch (err) {
    console.error('登录异常：', err);
    return { success: false, message: '登录失败，请重试' };
  }
}