import type { APIContext } from 'astro';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { getUserBySession } from '../../../lib/auth';

// DELETE /api/users/[id] - 删除用户
export async function DELETE({ request, params }: APIContext) {
  try {
    // 检查认证
    const token = request.headers.get('Cookie')?.match(/session_token=([^;]+)/)?.[1];

    if (!token) {
      return new Response(
        JSON.stringify({ error: '未登录' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await getUserBySession(token);
    if (!user) {
      return new Response(
        JSON.stringify({ error: '未登录' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const id = params.id;
    const result = await db.delete(users).where(eq(users.id, id)).returning();

    const deletedUser = Array.isArray(result) ? result[0] : null;

    if (!deletedUser) {
      return new Response(
        JSON.stringify({ error: '用户不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Users] 删除用户失败:', error);
    return new Response(
      JSON.stringify({ error: '删除用户失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
