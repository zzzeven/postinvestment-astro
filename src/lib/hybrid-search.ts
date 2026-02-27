import { createHash } from 'crypto';
import { db } from '@/db';
import { documentChunks, files } from '@/db/schema';
import { eq, sql, inArray, or, ilike, and } from 'drizzle-orm';
import { embeddingService } from './embeddings';

/**
 * 搜索结果
 */
export interface SearchResult {
  chunkId: string;
  fileId: string;
  fileName: string;
  content: string;
  chunkIndex: number;
  score: number;
  relevanceType: 'semantic' | 'keyword' | 'hybrid';
  metadata?: any;
}

/**
 * 搜索选项
 */
export interface SearchOptions {
  limit?: number;
  threshold?: number;
  fileIds?: string[];
  hybridAlpha?: number; // 语义权重 [0-1], 默认 0.7
}

/**
 * 混合搜索服务
 * 结合语义搜索（向量）和关键词搜索（全文）
 */
export class HybridSearchService {
  /**
   * 混合搜索：语义 + 全文
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      limit = 10,
      threshold = 0.3,
      fileIds,
      hybridAlpha = 0.7, // 70% 语义，30% 关键词
    } = options;

    console.log(`[HybridSearch] 搜索查询: "${query}", 文档: ${fileIds?.length || '全部'}`);

    // 1. 生成查询向量
    const { vector } = await embeddingService.embedText(query);

    // 2. 并行执行两种搜索
    const [semanticResults, keywordResults] = await Promise.all([
      this.semanticSearch(vector, { limit: limit * 2, threshold: 1 - threshold, fileIds }),
      this.keywordSearch(query, { limit: limit * 2, fileIds }),
    ]);

    console.log(`[HybridSearch] 语义结果: ${semanticResults.length}, 关键词结果: ${keywordResults.length}`);

    // 3. 合并结果
    const combined = this.combineResults(
      semanticResults,
      keywordResults,
      hybridAlpha
    );

    // 4. 去重并排序
    const unique = this.deduplicateResults(combined);

    console.log(`[HybridSearch] 合并后唯一结果: ${unique.length}`);

    return unique.slice(0, limit);
  }

  /**
   * 语义搜索（向量相似度）
   */
  private async semanticSearch(
    queryVector: number[],
    options: { limit: number; threshold: number; fileIds?: string[] }
  ): Promise<SearchResult[]> {
    const vectorStr = JSON.stringify(queryVector);

    // 构建 PostgreSQL 数组字面量
    const fileIdsArrayLiteral = options.fileIds && options.fileIds.length > 0
      ? `{${options.fileIds.map(id => `"${id}"`).join(',')}}`
      : null;

    // 使用原始 SQL 执行向量搜索
    const results = await db.execute(sql`
      SELECT
        dc.id as chunk_id,
        dc.file_id as fileId,
        f.name as file_name,
        dc.content,
        dc.chunk_index as chunkIndex,
        dc.metadata,
        1 - (dc.embedding <=> ${vectorStr}::vector) as score
      FROM document_chunks dc
      JOIN files f ON f.id = dc.file_id
      WHERE dc.embedding IS NOT NULL
        AND (dc.embedding <=> ${vectorStr}::vector) < ${1 - options.threshold}
        ${fileIdsArrayLiteral ? sql`AND dc.file_id = ANY(${fileIdsArrayLiteral}::uuid[])` : sql``}
      ORDER BY dc.embedding <=> ${vectorStr}::vector
      LIMIT ${options.limit}
    `);

    return results.rows.map((r: any) => ({
      chunkId: r.chunk_id,
      fileId: r.fileId,
      fileName: r.file_name,
      content: r.content,
      chunkIndex: r.chunkIndex,
      score: r.score,
      relevanceType: 'semantic' as const,
      metadata: r.metadata,
    }));
  }

  /**
   * 关键词搜索（全文搜索 + ILIKE）
   */
  private async keywordSearch(
    query: string,
    options: { limit: number; fileIds?: string[] }
  ): Promise<SearchResult[]> {
    // 提取关键词
    const keywords = this.extractKeywords(query);
    console.log(`[HybridSearch] 关键词:`, keywords);

    if (keywords.length === 0) {
      return [];
    }

    // 构建搜索条件
    const conditions = keywords.map(kw =>
      ilike(documentChunks.content, `%${kw}%`)
    );

    const whereClause = conditions.length > 1
      ? or(...conditions)
      : conditions[0];

    // 构建基础查询 - 组合所有条件
    const finalWhereClause = options.fileIds && options.fileIds.length > 0
      ? and(whereClause, inArray(documentChunks.fileId, options.fileIds))
      : whereClause;

    const results = await db
      .select({
        chunkId: documentChunks.id,
        fileId: documentChunks.fileId,
        fileName: files.name,
        content: documentChunks.content,
        chunkIndex: documentChunks.chunkIndex,
        metadata: documentChunks.metadata,
      })
      .from(documentChunks)
      .innerJoin(files, eq(documentChunks.fileId, files.id))
      .where(finalWhereClause)
      .limit(options.limit);

    // 计算关键词匹配分数
    return results.map((r: any) => {
      let score = 0;
      const contentLower = r.content.toLowerCase();

      for (const keyword of keywords) {
        const keywordLower = keyword.toLowerCase();
        // 完全匹配加分
        if (contentLower.includes(keywordLower)) {
          score += 1;
        }
      }

      return {
        ...r,
        score: Math.min(score / keywords.length, 1),
        relevanceType: 'keyword' as const,
      };
    });
  }

  /**
   * 合并语义和关键词结果
   */
  private combineResults(
    semantic: SearchResult[],
    keyword: SearchResult[],
    alpha: number
  ): SearchResult[] {
    const map = new Map<string, SearchResult>();

    // 添加语义结果
    for (const result of semantic) {
      map.set(result.chunkId, { ...result, score: result.score * alpha });
    }

    // 混合关键词结果
    for (const result of keyword) {
      const existing = map.get(result.chunkId);
      if (existing) {
        // 加权平均
        existing.score = existing.score + result.score * (1 - alpha);
        existing.relevanceType = 'hybrid';
      } else {
        map.set(result.chunkId, { ...result, score: result.score * (1 - alpha) });
      }
    }

    return Array.from(map.values());
  }

  /**
   * 去重结果
   */
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    const unique: SearchResult[] = [];

    for (const result of results) {
      // 使用内容的前 100 字符作为 hash
      const hash = createHash('md5')
        .update(result.content.substring(0, 100))
        .digest('hex');

      if (!seen.has(hash)) {
        seen.add(hash);
        unique.push(result);
      }
    }

    return unique.sort((a, b) => b.score - a.score);
  }

  /**
   * 提取关键词
   */
  private extractKeywords(query: string): string[] {
    // 移除特殊字符，保留中文、英文、数字
    const cleaned = query.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ');

    // 分词
    const words = cleaned.split(/\s+/)
      .filter(w => w.length > 1) // 过滤单字符
      .filter(w => !['的', '了', '是', '在', '有', '和', '与'].includes(w)); // 过滤停用词

    return Array.from(new Set(words)); // 去重
  }
}

// 导出单例
export const hybridSearchService = new HybridSearchService();
