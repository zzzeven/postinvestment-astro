import type { APIContext } from 'astro';
import { db } from '../../../db';
import { files, folders, documentChunks } from '../../../db/schema';
import { eq, inArray, ilike } from 'drizzle-orm';
import { logger } from '../../../lib/logger';

interface SearchResult {
  id: string;
  name: string;
  folderId: string | null;
  fileSize: number | null;
  mimeType: string | null;
  uploadedAt: Date | null;
  contentPreview: string | null;
  folderName: string | null;
  rank: number;
  highlights?: string;
}

// GET /api/files/search?q=keyword&limit=20 - 搜索文件
export async function GET({ request }: APIContext) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: '搜索关键词不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const searchQuery = query.trim();
    logger.info({ query: searchQuery }, '[Search API] 搜索查询');

    // 使用 LIKE 搜索文件表（暂时移除全文搜索，修复中文问题）
    const keyword = '%' + searchQuery + '%';

    const fileResults = await db
      .select({
        id: files.id,
        name: files.name,
        folderId: files.folderId,
        fileSize: files.fileSize,
        mimeType: files.mimeType,
        uploadedAt: files.uploadedAt,
        contentPreview: files.contentPreview,
        folderName: folders.name,
      })
      .from(files)
      .leftJoin(folders, eq(files.folderId, folders.id))
      .where(ilike(files.name, keyword))
      .orderBy(files.uploadedAt)
      .limit(Math.min(limit, 50));

    logger.info({ fileResultsCount: fileResults.length }, '[Search API] 文件搜索结果数量');

    const chunkMatches = await db
      .select({
        fileId: documentChunks.fileId,
        content: documentChunks.content,
        chunkIndex: documentChunks.chunkIndex,
      })
      .from(documentChunks)
      .where(ilike(documentChunks.content, keyword))
      .limit(Math.min(limit * 2, 100));

    logger.info({ chunkMatchesCount: chunkMatches.length }, '[Search API] 分块搜索结果数量');

    // 根据分块匹配获取文件信息
    const fileIdsFromChunks = [...new Set(chunkMatches.map((c: any) => c.fileId))];
    let chunkResults: SearchResult[] = [];

    if (fileIdsFromChunks.length > 0) {
      const filesFromChunks = await db
        .select({
          id: files.id,
          name: files.name,
          folderId: files.folderId,
          fileSize: files.fileSize,
          mimeType: files.mimeType,
          uploadedAt: files.uploadedAt,
          contentPreview: files.contentPreview,
          folderName: folders.name,
        })
        .from(files)
        .leftJoin(folders, eq(files.folderId, folders.id))
        .where(inArray(files.id, fileIdsFromChunks));

      const chunkMap = new Map(chunkMatches.map((c: any) => [c.fileId, c]));
      chunkResults = filesFromChunks.map((file: any) => {
        const chunk = chunkMap.get(file.id);
        return {
          id: file.id,
          name: file.name,
          folderId: file.folderId,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          uploadedAt: file.uploadedAt,
          contentPreview: file.contentPreview,
          folderName: file.folderName,
          rank: 0.5,
        };
      });
    }

    logger.info({ chunkResultsCount: chunkResults.length }, '[Search API] 分块匹配的文件数量');

    // 合并结果并去重
    const allResultsMap = new Map<string, SearchResult>();

    (fileResults as any[]).forEach((result: any) => {
      allResultsMap.set(result.id, result);
    });

    chunkResults.forEach(result => {
      const existing = allResultsMap.get(result.id);
      if (existing) {
        allResultsMap.set(result.id, result);
      } else {
        allResultsMap.set(result.id, result);
      }
    });

    const uniqueResults = Array.from(allResultsMap.values());

    logger.info({ uniqueResultsCount: uniqueResults.length }, '[Search API] 合并后的唯一结果数量');

    // 按上传时间排序
    uniqueResults.sort((a, b) => {
      return new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime();
    });

    // 限制结果数量
    const finalResults = uniqueResults.slice(0, limit);

    return new Response(
      JSON.stringify({
        query: searchQuery,
        count: finalResults.length,
        totalFound: uniqueResults.length,
        files: finalResults,
        fileMatches: fileResults.length,
        chunkMatches: chunkMatches.length,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined }, '[Search] 搜索失败');
    return new Response(
      JSON.stringify({ error: '搜索失败', message: error instanceof Error ? error.message : '未知错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
