import type { APIContext } from 'astro';
import { hybridSearchService } from '../../lib/hybrid-search';

interface SearchRequest {
  query: string;
  hybridAlpha?: number;
  limit?: number;
  threshold?: number;
  fileIds?: string[];
}

interface GroupedResult {
  fileId: string;
  fileName: string;
  chunks: Array<{
    chunkId: string;
    content: string;
    chunkIndex: number;
    score: number;
    relevanceType: 'semantic' | 'keyword' | 'hybrid';
  }>;
  avgScore: number;
  chunkCount: number;
}

// POST /api/search - 执行搜索
export async function POST({ request }: APIContext) {
  try {
    const body: SearchRequest = await request.json();
    const { query, hybridAlpha = 0.7, limit = 30, threshold = 0.3, fileIds } = body;

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: '查询内容不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const results = await hybridSearchService.search(query, {
      limit,
      threshold,
      fileIds,
      hybridAlpha,
    });

    return new Response(
      JSON.stringify({ results }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Search API] 搜索失败:', error);
    return new Response(
      JSON.stringify({ error: '搜索失败', message: error instanceof Error ? error.message : '未知错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// GET /api/search?q=xxx&groupBy=file - 获取分组结果
export async function GET({ request }: APIContext) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const hybridAlphaStr = url.searchParams.get('hybridAlpha');
    const limitStr = url.searchParams.get('limit');
    const groupBy = url.searchParams.get('groupBy');

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: '查询内容不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hybridAlpha = hybridAlphaStr ? parseFloat(hybridAlphaStr) : 0.7;
    const limit = limitStr ? parseInt(limitStr) : 30;

    const results = await hybridSearchService.search(query, {
      limit,
      hybridAlpha,
    });

    // 如果需要按文件分组
    if (groupBy === 'file') {
      const fileMap = new Map<string, GroupedResult>();

      for (const result of results) {
        if (!fileMap.has(result.fileId)) {
          fileMap.set(result.fileId, {
            fileId: result.fileId,
            fileName: result.fileName,
            chunks: [],
            avgScore: 0,
            chunkCount: 0,
          });
        }

        const group = fileMap.get(result.fileId)!;
        group.chunks.push({
          chunkId: result.chunkId,
          content: result.content,
          chunkIndex: result.chunkIndex,
          score: result.score,
          relevanceType: result.relevanceType,
        });
      }

      // 计算平均分数
      const groupedResults = Array.from(fileMap.values()).map(group => {
        const totalScore = group.chunks.reduce((sum, chunk) => sum + chunk.score, 0);
        return {
          ...group,
          avgScore: totalScore / group.chunks.length,
          chunkCount: group.chunks.length,
        };
      });

      // 按平均分数排序
      groupedResults.sort((a, b) => b.avgScore - a.avgScore);

      return new Response(
        JSON.stringify({ results: groupedResults }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Search API] 搜索失败:', error);
    return new Response(
      JSON.stringify({ error: '搜索失败', message: error instanceof Error ? error.message : '未知错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
