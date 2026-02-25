import type { APIContext } from 'astro';
import { db } from '../../../db';
import { files } from '../../../db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

export async function GET({ request }: APIContext) {
  try {
    const url = new URL(request.url);
    const folderId = url.searchParams.get('folderId');
    const forEmbedding = url.searchParams.get('forEmbedding') === 'true';

    let whereClause;
    if (forEmbedding) {
      whereClause = eq(files.processedForEmbedding, true);
    } else {
      whereClause = folderId === 'null' || !folderId
        ? isNull(files.folderId)
        : eq(files.folderId, folderId);
    }

    const fileList = await db.query.files.findMany({
      where: whereClause,
      orderBy: (files, { desc }) => [desc(files.uploadedAt)],
    });

    return new Response(
      JSON.stringify({ files: fileList }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('获取文件列表错误:', error);
    return new Response(
      JSON.stringify({ error: '获取文件列表失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
