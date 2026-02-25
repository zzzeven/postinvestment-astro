import { db } from '../db';
import { files, documentChunks } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from './logger';

/**
 * 获取文件的完整内容和分块
 */
export async function getFileParsedContent(fileId: string): Promise<{
  fullContent: string | null;
  chunks: any[];
}> {
  logger.info({ fileId }, '[Parse Service] 获取文件解析内容');

  try {
    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId),
      columns: {
        fullContent: true,
        parseStatus: true,
        name: true,
      },
    });

    if (!file) {
      logger.error({ fileId }, '[Parse Service] 文件不存在');
      throw new Error('文件不存在');
    }

    logger.info({ fileId, name: file.name, parseStatus: file.parseStatus, fullContentLength: file.fullContent?.length || 0 }, '[Parse Service] 数据库查询结果');

    if (file.parseStatus !== 'completed') {
      logger.warn({ fileId, parseStatus: file.parseStatus }, '[Parse Service] 文件解析状态不是 completed');

      if (file.fullContent && file.fullContent.length > 0) {
        const chunks = await db.query.documentChunks.findMany({
          where: eq(documentChunks.fileId, fileId),
          orderBy: (chunks, { asc }) => [asc(chunks.chunkIndex)],
        });
        logger.info({ fileId, chunksCount: chunks.length, fullContentLength: file.fullContent.length }, '[Parse Service] 状态非 completed 但存在 fullContent');
        return {
          fullContent: file.fullContent,
          chunks,
        };
      }

      logger.warn({ fileId }, '[Parse Service] 没有可用的内容，返回空结果');
      return {
        fullContent: null,
        chunks: [],
      };
    }

    const chunks = await db.query.documentChunks.findMany({
      where: eq(documentChunks.fileId, fileId),
      orderBy: (chunks, { asc }) => [asc(chunks.chunkIndex)],
    });

    logger.info({ fileId, fullContentLength: file.fullContent?.length || 0, chunksCount: chunks.length }, '[Parse Service] 成功获取数据');

    return {
      fullContent: file.fullContent,
      chunks,
    };

  } catch (error) {
    logger.error({ fileId, error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined }, '[Parse Service] 获取解析内容失败');
    return {
      fullContent: null,
      chunks: [],
    };
  }
}

/**
 * 获取解析状态统计
 */
export async function getParseStatistics(): Promise<{
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}> {
  try {
    const allFiles = await db.query.files.findMany({
      columns: {
        parseStatus: true,
      },
    });

    const stats = {
      total: allFiles.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    allFiles.forEach(file => {
      switch (file.parseStatus) {
        case 'pending':
          stats.pending++;
          break;
        case 'processing':
          stats.processing++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'failed':
          stats.failed++;
          break;
      }
    });

    return stats;
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, '[Parse Service] 获取统计失败');
    return {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };
  }
}
