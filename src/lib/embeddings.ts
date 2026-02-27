import OpenAI from 'openai';
import { db } from '@/db';
import { documentChunks, files } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * 向量嵌入结果
 */
export interface EmbeddingResult {
  id: string;
  vector: number[];
  model: string;
  tokensUsed: number;
}

/**
 * 向量嵌入服务
 * 使用 OpenAI Embeddings API
 */
export class EmbeddingService {
  private openai: OpenAI;
  private model = 'text-embedding-3-small';
  private dimensions = 1536;

  constructor() {
    if (!import.meta.env.OPENAI_API_KEY) {
      console.warn('[EmbeddingService] OPENAI_API_KEY not configured');
    }

    this.openai = new OpenAI({
      apiKey: import.meta.env.OPENAI_API_KEY,
    });
  }

  /**
   * 为单个文本生成嵌入
   */
  async embedText(text: string): Promise<EmbeddingResult> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await this.openai.embeddings.create({
      model: this.model,
      input: text.trim(),
      encoding_format: 'float',
    });

    return {
      id: response.data[0].index.toString(),
      vector: response.data[0].embedding,
      model: response.model,
      tokensUsed: response.usage.total_tokens,
    };
  }

  /**
   * 批量生成嵌入（优化 API 调用）
   */
  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const results: EmbeddingResult[] = [];

    // text-embedding-3-small 最大上下文 8192 tokens
    // 保守估计每个 chunk 约 500-1000 tokens，批次大小设为 5 更安全
    const batchSize = 5;

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      console.log(`[EmbeddingService] 处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}, 文本数: ${batch.length}`);

      try {
        const response = await this.openai.embeddings.create({
          model: this.model,
          input: batch,
          encoding_format: 'float',
        });

        results.push(...response.data.map(item => ({
          id: item.index.toString(),
          vector: item.embedding,
          model: response.model,
          tokensUsed: response.usage.total_tokens,
        })));

        console.log(`[EmbeddingService] 批次完成, 使用 tokens: ${response.usage.total_tokens}`);
      } catch (error: any) {
        // 如果是上下文长度错误，逐个处理并截断过长的文本
        if (error.status === 400 && error.error?.message?.includes('maximum context length')) {
          console.log(`[EmbeddingService] 批次过大或单个文本过长，逐个处理`);

          for (const text of batch) {
            try {
              // 尝试直接处理
              const singleResponse = await this.openai.embeddings.create({
                model: this.model,
                input: [text],
                encoding_format: 'float',
              });
              results.push({
                id: singleResponse.data[0].index.toString(),
                vector: singleResponse.data[0].embedding,
                model: singleResponse.model,
                tokensUsed: singleResponse.usage.total_tokens,
              });
            } catch (singleError: any) {
              // 如果单个文本也过长，进行截断处理
              if (singleError.status === 400 && singleError.error?.message?.includes('maximum context length')) {
                console.warn(`[EmbeddingService] 单个文本过长，进行截断处理 (原长度: ${text.length})`);
                // 粗略估计：1 token ≈ 4 字符（中英文混合），安全限制 6000 字符
                const truncatedText = text.slice(0, 6000);
                const truncatedResponse = await this.openai.embeddings.create({
                  model: this.model,
                  input: [truncatedText],
                  encoding_format: 'float',
                });
                results.push({
                  id: truncatedResponse.data[0].index.toString(),
                  vector: truncatedResponse.data[0].embedding,
                  model: truncatedResponse.model,
                  tokensUsed: truncatedResponse.usage.total_tokens,
                });
                console.log(`[EmbeddingService] 截断处理完成 (新长度: ${truncatedText.length})`);
              } else {
                console.error(`[EmbeddingService] 处理单个文本失败:`, singleError.message);
                throw singleError;
              }
            }
          }
        } else {
          console.error(`[EmbeddingService] 批次处理失败:`, error.message);
          throw error;
        }
      }

      // 避免速率限制，批次之间稍等
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return results;
  }

  /**
   * 为文档的所有块生成嵌入并存储
   */
  async processDocumentChunks(fileId: string): Promise<{
    processed: number;
    totalTokens: number;
  }> {
    // 获取文档的所有块
    const chunks = await db
      .select()
      .from(documentChunks)
      .where(eq(documentChunks.fileId, fileId));

    if (chunks.length === 0) {
      throw new Error('No chunks found for document, please run chunking first');
    }

    console.log(`[EmbeddingService] 开始处理 ${chunks.length} 个文档块`);

    // 批量生成嵌入
    const texts = chunks.map(c => c.content);
    const embeddings = await this.embedBatch(texts);

    // 更新数据库
    let totalTokens = 0;
    for (let i = 0; i < chunks.length; i++) {
      // pgvector 需要数组格式
      const vector = embeddings[i].vector;
      const vectorStr = `[${vector.join(',')}]`;

      // 使用原生 SQL 直接执行，避免 Drizzle 的参数化
      // 构建完整的 SQL 语句字符串，确保向量字面量被正确嵌入
      await db.execute(
        sql.raw(`UPDATE document_chunks SET embedding = '${vectorStr}'::vector, updated_at = NOW() WHERE id = '${chunks[i].id}'::uuid`)
      );

      totalTokens += embeddings[i].tokensUsed;
    }

    // 更新文件状态
    await db
      .update(files)
      .set({
        processedForEmbedding: true,
        chunkCount: chunks.length,
        embeddingUpdatedAt: new Date(),
      })
      .where(eq(files.id, fileId));

    console.log(`[EmbeddingService] 文档处理完成: ${chunks.length} 块, ${totalTokens} tokens`);

    return {
      processed: chunks.length,
      totalTokens,
    };
  }

  /**
   * 计算余弦相似度
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// 导出单例
export const embeddingService = new EmbeddingService();
