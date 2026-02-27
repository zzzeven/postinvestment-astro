import type { APIContext } from 'astro';
import { db } from '../../../db';
import { files, documentChunks } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { splitTextIntoChunks } from '../../../lib/text-chunking';
import { embeddingService } from '../../../lib/embeddings';

// POST /api/embeddings/process - 处理文档（分块 + 向量化）
export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const { fileId, skipChunking = false } = body;

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: '缺少 fileId 参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!import.meta.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: '未配置 OPENAI_API_KEY 环境变量' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取文件信息
    const fileRecords = await db
      .select({
        id: files.id,
        name: files.name,
        fullContent: files.fullContent,
        contentPreview: files.contentPreview,
        processedForEmbedding: files.processedForEmbedding,
        chunkCount: files.chunkCount,
      })
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (fileRecords.length === 0) {
      return new Response(
        JSON.stringify({ error: '文件不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const file = fileRecords[0];
    const contentToProcess = file.fullContent || file.contentPreview;

    if (!contentToProcess) {
      return new Response(
        JSON.stringify({ error: '文件内容为空，请先上传文件' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isPreviewContent = !file.fullContent && !!file.contentPreview;
    const steps: Array<{ step: string; status: 'success' | 'skipped' | 'error'; message?: string; data?: any }> = [];
    let chunksCreated = 0;
    let chunksDeleted = 0;

    // 步骤 1: 分块
    if (skipChunking && file.processedForEmbedding) {
      steps.push({
        step: '文档分块',
        status: 'skipped',
        message: '文档已分块，跳过此步骤',
        data: { chunkCount: file.chunkCount },
      });
      chunksCreated = file.chunkCount || 0;
    } else {
      // 删除旧的 chunks
      const deleted = await db
        .delete(documentChunks)
        .where(eq(documentChunks.fileId, fileId));
      chunksDeleted = (deleted as any).rowCount ?? 0;

      // 生成分块
      const chunks = splitTextIntoChunks(contentToProcess);

      // 保存到数据库
      for (const chunk of chunks) {
        await db.insert(documentChunks).values({
          fileId,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          startPosition: chunk.startPosition,
          endPosition: chunk.endPosition,
        });
      }

      // 更新文件 chunkCount
      await db
        .update(files)
        .set({ chunkCount: chunks.length })
        .where(eq(files.id, fileId));

      chunksCreated = chunks.length;

      steps.push({
        step: '文档分块',
        status: 'success',
        message: isPreviewContent
          ? `使用预览内容创建 ${chunksCreated} 个文档块`
          : `成功创建 ${chunksCreated} 个文档块`,
        data: { chunksCreated, chunksDeleted, isPreviewContent },
      });
    }

    // 步骤 2: 生成向量嵌入
    const embeddingResult = await embeddingService.processDocumentChunks(fileId);

    steps.push({
      step: '生成向量嵌入',
      status: 'success',
      message: `成功处理 ${embeddingResult.processed} 个文档块`,
      data: {
        processed: embeddingResult.processed,
        totalTokens: embeddingResult.totalTokens,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        fileId,
        fileName: file.name,
        chunksCreated,
        chunksDeleted,
        embeddingsProcessed: embeddingResult.processed,
        totalTokensUsed: embeddingResult.totalTokens,
        steps,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Embeddings Process] 处理失败:', error);
    return new Response(
      JSON.stringify({
        error: '处理文档失败',
        message: error instanceof Error ? error.message : '未知错误',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
