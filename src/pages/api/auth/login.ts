import type { APIContext } from 'astro';
import { db } from '../../../db';
import { users, sessions } from '../../../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { hashPassword, generateToken, generateSessionExpiry } from '../../../lib/auth';

export async function POST({ request, cookies }: APIContext) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: '用户名和密码不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 查找用户
    const userResult = await db.select().from(users).where(eq(users.username, username));

    if (userResult.length === 0) {
      return new Response(
        JSON.stringify({ error: '用户名或密码错误' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = userResult[0];

    // 验证密码
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return new Response(
        JSON.stringify({ error: '用户名或密码错误' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 创建会话
    const token = generateToken();
    const expiresAt = generateSessionExpiry();

    const sessionResult = await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
    }).returning();

    const session = Array.isArray(sessionResult) ? sessionResult[0] : null;

    if (!session) {
      throw new Error('创建会话失败');
    }

    // 设置cookie
    cookies.set('session_token', token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Login] 登录失败:', error);
    return new Response(
      JSON.stringify({ error: '登录失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
