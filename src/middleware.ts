import { defineMiddleware } from 'astro:middleware';
import { getUserBySession } from './lib/auth';

export const onRequest = defineMiddleware(async ({ url, cookies, locals, redirect, request }, next) => {
  const pathname = url.pathname;

  // API 路径 - 禁用 CSRF 检查，直接通过（兼容 base: '/postinvest' 前缀）
  if (pathname.startsWith('/api') || pathname.startsWith('/postinvest/api')) {
    const response = await next();

    // 添加头部来禁用 Astro 的 CSRF 检查
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    });
  }

  // 登录页面 - 不需要验证
  if (pathname.startsWith('/login')) {
    return next();
  }

  // 检查是否有session token
  const sessionToken = cookies.get('session_token')?.value;

  if (!sessionToken) {
    // 未登录，重定向到登录页
    // 检查是否有 X-Forwarded-Path 头来确定基础路径
    const basePath = request.headers.get('X-Forwarded-Path') || '';
    return redirect(`${basePath}/login`);
  }

  // 验证会话并获取用户信息
  const user = await getUserBySession(sessionToken);

  if (!user) {
    // 会话无效或已过期，重定向到登录页
    const basePath = request.headers.get('X-Forwarded-Path') || '';
    return redirect(`${basePath}/login`);
  }

  // 将用户信息存储到 locals
  locals.user = {
    id: user.id,
    username: user.username,
  };

  return next();
});
