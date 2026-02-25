import type { APIContext } from 'astro';
import { db } from '../../../db';
import { folders } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH({ request, params }: APIContext) {
  const id = params.id;
  try {
    const body = await request.json();
    const { name, parentId } = body;

    const result = await db.update(folders)
      .set({
        ...(name && { name }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        updatedAt: new Date(),
      })
      .where(eq(folders.id, id))
      .returning();

    const updatedFolder = Array.isArray(result) ? result[0] : null;

    return new Response(
      JSON.stringify({ folder: updatedFolder }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('更新文件夹错误:', error);
    return new Response(
      JSON.stringify({ error: '更新文件夹失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE({ params }: APIContext) {
  const id = params.id;
  try {
    await db.delete(folders).where(eq(folders.id, id));

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('删除文件夹错误:', error);
    return new Response(
      JSON.stringify({ error: '删除文件夹失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
