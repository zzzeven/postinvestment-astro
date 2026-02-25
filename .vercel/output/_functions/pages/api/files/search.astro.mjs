import { d as db, e as folders, f as files, a as documentChunks } from '../../../chunks/index_B-AYb3H8.mjs';
import { eq, ilike, inArray } from 'drizzle-orm';
import { l as logger } from '../../../chunks/logger_bR4G-6LJ.mjs';
export { renderers } from '../../../renderers.mjs';

async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "搜索关键词不能为空" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const searchQuery = query.trim();
    logger.info({ query: searchQuery }, "[Search API] 搜索查询");
    const keyword = "%" + searchQuery + "%";
    const fileResults = await db.select({
      id: files.id,
      name: files.name,
      folderId: files.folderId,
      fileSize: files.fileSize,
      mimeType: files.mimeType,
      uploadedAt: files.uploadedAt,
      contentPreview: files.contentPreview,
      folderName: folders.name
    }).from(files).leftJoin(folders, eq(files.folderId, folders.id)).where(ilike(files.name, keyword)).orderBy(files.uploadedAt).limit(Math.min(limit, 50));
    logger.info({ fileResultsCount: fileResults.length }, "[Search API] 文件搜索结果数量");
    const chunkMatches = await db.select({
      fileId: documentChunks.fileId,
      content: documentChunks.content,
      chunkIndex: documentChunks.chunkIndex
    }).from(documentChunks).where(ilike(documentChunks.content, keyword)).limit(Math.min(limit * 2, 100));
    logger.info({ chunkMatchesCount: chunkMatches.length }, "[Search API] 分块搜索结果数量");
    const fileIdsFromChunks = [...new Set(chunkMatches.map((c) => c.fileId))];
    let chunkResults = [];
    if (fileIdsFromChunks.length > 0) {
      const filesFromChunks = await db.select({
        id: files.id,
        name: files.name,
        folderId: files.folderId,
        fileSize: files.fileSize,
        mimeType: files.mimeType,
        uploadedAt: files.uploadedAt,
        contentPreview: files.contentPreview,
        folderName: folders.name
      }).from(files).leftJoin(folders, eq(files.folderId, folders.id)).where(inArray(files.id, fileIdsFromChunks));
      const chunkMap = new Map(chunkMatches.map((c) => [c.fileId, c]));
      chunkResults = filesFromChunks.map((file) => {
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
          rank: 0.5
        };
      });
    }
    logger.info({ chunkResultsCount: chunkResults.length }, "[Search API] 分块匹配的文件数量");
    const allResultsMap = /* @__PURE__ */ new Map();
    fileResults.forEach((result) => {
      allResultsMap.set(result.id, result);
    });
    chunkResults.forEach((result) => {
      const existing = allResultsMap.get(result.id);
      if (existing) {
        allResultsMap.set(result.id, result);
      } else {
        allResultsMap.set(result.id, result);
      }
    });
    const uniqueResults = Array.from(allResultsMap.values());
    logger.info({ uniqueResultsCount: uniqueResults.length }, "[Search API] 合并后的唯一结果数量");
    uniqueResults.sort((a, b) => {
      return new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime();
    });
    const finalResults = uniqueResults.slice(0, limit);
    return new Response(
      JSON.stringify({
        query: searchQuery,
        count: finalResults.length,
        totalFound: uniqueResults.length,
        files: finalResults,
        fileMatches: fileResults.length,
        chunkMatches: chunkMatches.length
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : "Unknown error", stack: error instanceof Error ? error.stack : void 0 }, "[Search] 搜索失败");
    return new Response(
      JSON.stringify({ error: "搜索失败", message: error instanceof Error ? error.message : "未知错误" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
