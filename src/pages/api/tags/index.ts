import type { APIContext } from 'astro';
import { db } from '../../../db';
import { tags } from '../../../db/schema';
import { eq } from 'drizzle-orm';

// GET /api/tags - 获取所有标签
export async function GET() {
  try {
    const allTags = await db.select().from(tags).orderBy(tags.name);
    return new Response(
      JSON.stringify(allTags),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Tags] 获取标签失败:', error);
    return new Response(
      JSON.stringify({ error: '获取标签失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/tags - 创建标签
export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return new Response(
        JSON.stringify({ error: '标签名称不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 检查是否已存在
    const existing = await db.select().from(tags).where(eq(tags.name, name));

    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: '标签已存在' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await db.insert(tags).values({
      name,
      color: color || '#3B82F6',
    }).returning();

    const newTag = Array.isArray(result) ? result[0] : null;

    return new Response(
      JSON.stringify({ tag: newTag }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Tags] 创建标签失败:', error);
    return new Response(
      JSON.stringify({ error: '创建标签失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
