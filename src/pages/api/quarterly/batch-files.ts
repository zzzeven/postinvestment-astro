import type { APIContext } from 'astro';
import { db } from '../../../db';
import { files, parseTasks } from '../../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET - 获取所有PDF文件列表
 */
export async function GET() {
  try {
    const allFiles = await db
      .select({
        id: files.id,
        name: files.name,
        blobUrl: files.blobUrl,
        fullContent: files.fullContent,
        parseStatus: files.parseStatus,
      })
      .from(files)
      .where(eq(files.mimeType, 'application/pdf'));

    return new Response(
      JSON.stringify({
        files: allFiles,
        total: allFiles.length,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[批量文件列表] 查询失败:', error);
    return new Response(
      JSON.stringify({
        error: '查询文件列表失败',
        message: error instanceof Error ? error.message : '未知错误',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
