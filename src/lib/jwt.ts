import { supabase_admin } from '@/lib/supabase_admin';


export async function verifyJWT(token: string, requiredRole?: 'merchant' | 'admin') {
  try {

    const { data: { user }, error } = await supabase_admin.auth.getUser(token);
    
    // 通行证是假的/过期了
    if (error || !user) {
      return { valid: false, message: '登录过期了，请重新登录', user: null };
    }

    // 拿到用户角色（管理员/商家）
    const userRole = (user.user_metadata as { role?: 'merchant' | 'admin' })?.role;
    
    // 需要指定角色，就检查角色
    if (requiredRole && userRole !== requiredRole) {
      return { 
        valid: false, 
        message: `你不是${requiredRole}，没权限访问`, 
        user: null 
      };
    }

    // 通行证是真的，返回用户信息
    return {
      valid: true,
      message: '通行证有效',
      user: {
        id: user.id,
        username: user.user_metadata.username,
        role: userRole,
      },
    };
  } catch (err) {
    console.error('验证通行证失败：', err);
    return { valid: false, message: '验证失败', user: null };
  }
}