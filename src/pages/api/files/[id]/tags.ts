import type { APIContext } from 'astro';
import { db } from '../../../../db';
import { fileTags, tags } from '../../../../db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/files/[id]/tags - 获取文件的所有标签
export async function GET({ params }: APIContext) {
  const fileId = params.id;
  try {
    const fileTagsResult = await db
      .select({
        tagId: fileTags.tagId,
        name: tags.name,
        color: tags.color,
        createdAt: fileTags.taggedAt,
      })
      .from(fileTags)
      .innerJoin(tags, eq(fileTags.tagId, tags.id))
      .where(eq(fileTags.fileId, fileId));

    return new Response(
      JSON.stringify({ tags: fileTagsResult }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[FileTags] 获取文件标签失败:', error);
    return new Response(
      JSON.stringify({ error: '获取文件标签失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/files/[id]/tags - 为文件添加标签
export async function POST({ request, params }: APIContext) {
  const fileId = params.id;
  try {
    const body = await request.json();
    const { tagId } = body;

    if (!tagId) {
      return new Response(
        JSON.stringify({ error: '标签ID不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 检查是否已关联
    const existing = await db.select().from(fileTags).where(
      and(
        eq(fileTags.fileId, fileId),
        eq(fileTags.tagId, tagId)
      )
    );

    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: '标签已存在' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await db.insert(fileTags).values({
      fileId,
      tagId,
    }).returning();

    const newFileTag = Array.isArray(result) ? result[0] : null;

    return new Response(
      JSON.stringify({ fileTag: newFileTag }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[FileTags] 添加标签失败:', error);
    return new Response(
      JSON.stringify({ error: '添加标签失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE /api/files/[id]/tags - 删除文件的标签
export async function DELETE({ request, params }: APIContext) {
  const fileId = params.id;
  try {
    const url = new URL(request.url);
    const tagId = url.searchParams.get('tagId');

    if (!tagId) {
      return new Response(
        JSON.stringify({ error: '标签ID不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await db.delete(fileTags).where(
      and(
        eq(fileTags.fileId, fileId),
        eq(fileTags.tagId, tagId)
      )
    );

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[FileTags] 删除标签失败:', error);
    return new Response(
      JSON.stringify({ error: '删除标签失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
