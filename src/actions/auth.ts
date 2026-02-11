'use server';
import { supabase_admin } from '@/lib/supabase_admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { validateEmail, validatePassword, generateVerifyCode, validateRole } from '@/lib/validate';

// ====================== 注册 ======================

export async function checkUsernameUnique(username: string) {
  if (!username) {
    return { isUnique: false, message: '用户名不能为空' };
  }

  try {
    const { data: users, error } = await supabase_admin
      .from('users')
      .select('user_metadata')
      .eq('user_metadata->>username', username); 

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

/** 验证码发送 */
export async function sendRegisterCode(email: string, username: string) {
  if (!validateEmail(email)) {
    return { success: false, message: '邮箱格式错误' };
  }
  if (!username) {
    return { success: false, message: '用户名不能为空' };
  }

  const code = generateVerifyCode();
  const expiresAtLocal = new Date(Date.now() + 5 * 60 * 1000);
  const expiresAt = new Date(expiresAtLocal.getTime() - expiresAtLocal.getTimezoneOffset() * 60 * 1000);

  try {
    await supabase_admin
      .from('verify_codes')
      .update({ used: true })
      .eq('email', email)
      .eq('type', 'register')
      .eq('used', false);

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

    // 打印存储的验证码信息
    console.log(' 验证码存储成功：', {
      email,
      code,
      expiresAt_UTC: expiresAt.toISOString(), // 存储的UTC时间
      expiresAt_Local: expiresAtLocal.toISOString(), // 本地时间
      now_UTC: new Date().toISOString() // 当前UTC时间
    });


    // 管理员专属的inviteUserByEmail 
    const { error: emailError } = await supabase_admin.auth.admin.inviteUserByEmail(email, {
      data: {
        Username: username,
        Code: code,
        Type: '注册',
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/register`,
    });
    // ========== 修改结束 ==========

    if (emailError) {
      console.log('邮件发送失败：', emailError.message);
    }

    return { success: true, message: '验证码已发送至你的邮箱，有效期5分钟' };
  } catch (err) {
    console.error('发送验证码异常：', err);
    return { success: false, message: '发送验证码失败，请重试' };
  }
}

/** 验证码验证 */
export async function verifyRegisterCode(email: string, code: string) {
  if (!code || code.length !== 6) {
    return { success: false, message: '验证码格式错误（需6位数字）' };
  }

  try {
    const nowLocal = new Date();
    const nowUTC = new Date(nowLocal.getTime() - nowLocal.getTimezoneOffset() * 60 * 1000);

    // 打印查询条件（调试用）
    console.log(' 验证码查询条件：', {
      email,
      code,
      type: 'register',
      used: false,
      expires_at_gt: nowUTC.toISOString(), // 查询用的UTC时间
      now_Local: nowLocal.toISOString() // 当前本地时间
    });

    //用toISOString()避免Date对象的时区解析问题 
    const { data, error } = await supabase_admin
      .from('verify_codes')
      .select('*')
      .eq('email', email)
      .eq('type', 'register')
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', nowUTC.toISOString()) // 改用字符串比较
      .single();

    // 打印查询结果（调试用） 
    if (error) {
      console.error('查询验证码失败：', error.message, error.code);
    } else {
      console.log(' 查询到验证码：', {
        id: data.id,
        expires_at: data.expires_at,
        now_UTC: nowUTC.toISOString(),
        isExpired: new Date(data.expires_at) < nowUTC
      });
    }

    if (error || !data) {
      return { success: false, message: '验证码无效或已过期' };
    }

    await supabase_admin
      .from('verify_codes')
      .update({ used: true })
      .eq('id', data.id);

    return { success: true, message: '验证码验证通过' };
  } catch (err) {
    console.error('验证验证码异常：', err);
    return { success: false, message: '验证码验证失败，请重试' };
  }
}

export async function completeRegister(formData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
  role: 'merchant' | 'admin';
}) {
  const { username, email, password, confirmPassword, code, role } = formData;

  try {
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

    const { data, error } = await supabase_admin.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role: role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      },
    });

    if (error) {
      console.error('注册失败：', error);
      return { success: false, message: `注册失败：${error.message}` };
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
      // 校验角色合法性
      const userRole = userData.user_metadata.role as string;
      if (!['merchant', 'admin'].includes(userRole)) {
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

    // 获取用户信息和角色
    const userRole = data.user.user_metadata.role as 'merchant' | 'admin';

    return {
      success: true,
      message: '登录成功',
      token: data.session?.access_token, // Supabase自动生成的JWT Token
      user: {
        id: data.user.id,
        username: data.user.user_metadata.username,
        email: data.user.email,
        role: userRole,
      },
    };
  } catch (err) {
    console.error('登录异常：', err);
    return { success: false, message: '登录失败，请重试' };
  }
}