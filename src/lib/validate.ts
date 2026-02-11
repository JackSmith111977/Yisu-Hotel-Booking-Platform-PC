/** 密码复杂度验证（不变） */
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

/** 邮箱格式验证 */
export const validateEmail = (email: string) => {
  const reg = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return reg.test(email);
};

/** 生成6位数字验证码 */
export const generateVerifyCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/** 角色合法性验证） */
export const validateRole = (role: string) => {
  const validRoles = ['merchant', 'admin'];
  if (!validRoles.includes(role)) {
    return { isValid: false, message: '请选择合法角色（商户/管理员）' };
  }
  return { isValid: true, message: '角色验证通过' };
};