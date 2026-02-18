
export async function request(url: string, options: RequestInit = {}) {
  // 从Cookie里拿通行证
  const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1] || '';
  
  // 请求头里带上通行证
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  // 发送请求
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  // 如果通行证过期，自动跳登录页
  if (data.message === '登录过期了，请重新登录') {
    document.cookie = 'auth_token=; path=/; max-age=0'; // 清空Cookie
    window.location.href = '/login';
  }

  return data;
}