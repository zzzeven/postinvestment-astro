import type { APIContext } from 'astro';
import { db } from '../../../db';
import { sessions, users } from '../../../db/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function GET({ request, cookies }: APIContext) {
  try {
    const token = cookies.get('session_token')?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ error: '未登录' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 验证session
    const sessionResult = await db
      .select({
        session: sessions,
        user: {
          id: users.id,
          username: users.username,
        },
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.token, token),
          gt(sessions.expiresAt, new Date())
        )
      );

    if (sessionResult.length === 0) {
      return new Response(
        JSON.stringify({ error: '会话已过期，请重新登录' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        user: sessionResult[0].user,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Auth] 验证失败:', error);
    return new Response(
      JSON.stringify({ error: '验证失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
