// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

// 定义哪些页面需要保安检查
export async function middleware(request: NextRequest) {
  // 不需要检查的页面（登录、注册、首页）
  const publicPages = ['/', '/login', '/register'];
  const currentPath = request.nextUrl.pathname;
  
  // 如果是公开页面，直接放行
  if (publicPages.includes(currentPath)) {
    return NextResponse.next();
  }

  // 从Cookie里拿用户的通行证
  const token = request.cookies.get('auth_token')?.value || '';
  
  // 没通行证 → 赶去登录页
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 检查通行证是不是真的
  const checkResult = await verifyJWT(token);
  if (!checkResult.valid) {
    // 通行证是假的/过期了，清空Cookie，去登录
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  //检查角色权限（比如/admin只能管理员进，/merchant只能商家进）
  if (currentPath.startsWith('/admin') && checkResult.user?.role !== 'admin') {
    return NextResponse.json({ success: false, message: '你不是管理员，没权限' }, { status: 403 });
  }
  if (currentPath.startsWith('/merchant') && checkResult.user?.role !== 'merchant') {
    return NextResponse.json({ success: false, message: '你不是商家，没权限' }, { status: 403 });
  }

  //所有检查通过 → 放行
  return NextResponse.next();
}


export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};