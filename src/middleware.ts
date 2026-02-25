import { defineMiddleware } from 'astro:middleware';
import { getUserBySession } from './lib/auth';

// 不需要登录验证的路径
const publicPaths = [
  '/login',
  '/api/auth/login',
  '/api/files/search',
  '/api/parse/status',
];

export const onRequest = defineMiddleware(async ({ url, cookies, locals, redirect }, next) => {
  const pathname = url.pathname;

  // 公开路径，不需要验证
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return next();
  }

  // 检查是否有session token
  const sessionToken = cookies.get('session_token')?.value;

  if (!sessionToken) {
    // 未登录，重定向到登录页
    return redirect('/login');
  }

  // 验证会话并获取用户信息
  const user = await getUserBySession(sessionToken);

  if (!user) {
    // 会话无效或已过期，重定向到登录页
    return redirect('/login');
  }

  // 将用户信息存储到 locals
  locals.user = {
    id: user.id,
    username: user.username,
  };

  return next();
});
