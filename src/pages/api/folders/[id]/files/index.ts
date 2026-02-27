import type { APIContext } from 'astro';
import { db } from '../../../../../../db';
import { files } from '../../../../../../db/schema';
import { eq } from 'drizzle-orm';

// GET /api/folders/[id]/files - 获取文件夹中的文件
export async function GET({ params }: APIContext) {
  try {
    const folderId = params.id;

    const folderFiles = await db
      .select({
        id: files.id,
        name: files.name,
        fileSize: files.fileSize,
        uploadedAt: files.uploadedAt,
        mimeType: files.mimeType,
        parseStatus: files.parseStatus,
      })
      .from(files)
      .where(eq(files.folderId, folderId))
      .orderBy(files.uploadedAt);

    return new Response(
      JSON.stringify({ files: folderFiles }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Folder Files] 获取文件列表失败:', error);
    return new Response(
      JSON.stringify({ error: '获取文件列表失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
