import type { APIContext } from 'astro';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, getUserBySession } from '../../../lib/auth';

// GET /api/users - 获取所有用户
export async function GET({ request }: APIContext) {
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

    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      createdAt: users.createdAt,
    }).from(users).orderBy(users.createdAt);

    return new Response(
      JSON.stringify({ users: allUsers }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Users] 获取用户列表失败:', error);
    return new Response(
      JSON.stringify({ error: '获取用户列表失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/users - 创建用户
export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: '用户名和密码不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: '密码长度至少6位' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 检查用户是否已存在
    const existing = await db.select().from(users).where(eq(users.username, username));

    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: '用户名已存在' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const passwordHash = hashPassword(password);

    const result = await db.insert(users).values({
      username,
      passwordHash,
    }).returning();

    const newUser = Array.isArray(result) ? result[0] : null;

    return new Response(
      JSON.stringify({
        user: {
          id: newUser?.id,
          username: newUser?.username,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Users] 创建用户失败:', error);
    return new Response(
      JSON.stringify({ error: '创建用户失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
