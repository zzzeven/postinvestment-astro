import type { APIContext } from 'astro';
import { db } from '../../../db';
import { sessions } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ cookies }: APIContext) {
  try {
    const token = cookies.get('session_token')?.value;

    if (token) {
      // 删除数据库中的会话
      await db.delete(sessions).where(eq(sessions.token, token));
    }

    // 删除cookie
    cookies.delete('session_token', { path: '/' });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Logout] 登出失败:', error);
    return new Response(
      JSON.stringify({ error: '登出失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
