import type { APIContext } from 'astro';
import { db } from '../../../db';
import { tags } from '../../../db/schema';
import { eq } from 'drizzle-orm';

// PATCH /api/tags/[id] - 更新标签
export async function PATCH({ request, params }: APIContext) {
  const id = params.id;
  try {
    const body = await request.json();
    const { name, color } = body;

    const result = await db.update(tags)
      .set({
        name: name || undefined,
        color: color || undefined,
      })
      .where(eq(tags.id, id))
      .returning();

    const updatedTag = Array.isArray(result) ? result[0] : null;

    if (!updatedTag) {
      return new Response(
        JSON.stringify({ error: '标签不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ tag: updatedTag }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Tags] 更新标签失败:', error);
    return new Response(
      JSON.stringify({ error: '更新标签失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE /api/tags/[id] - 删除标签
export async function DELETE({ params }: APIContext) {
  const id = params.id;
  try {
    const result = await db.delete(tags)
      .where(eq(tags.id, id))
      .returning();

    const deletedTag = Array.isArray(result) ? result[0] : null;

    if (!deletedTag) {
      return new Response(
        JSON.stringify({ error: '标签不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Tags] 删除标签失败:', error);
    return new Response(
      JSON.stringify({ error: '删除标签失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
