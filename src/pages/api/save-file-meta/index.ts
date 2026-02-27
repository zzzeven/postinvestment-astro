import type { APIContext } from 'astro';
import { db } from '../../../db';
import { files, parseQueue } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';
import { logger } from '../../../lib/logger';

export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const {
      name,
      folderId,
      serverFilename,
      serverUrl,
      size,
      mimeType,
      hash,
      fullContent,
    } = body;

    logger.info({ name, size, mimeType, serverFilename }, '[Save-Meta] 开始保存文件元数据');

    if (!name || !serverFilename || !serverUrl) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 使用传入的哈希或计算 content 哈希
    let contentHash = hash;
    if (!contentHash && fullContent) {
      contentHash = createHash('sha256').update(fullContent).digest('hex');
    }

    // 检查文件是否已存在（基于哈希）
    if (contentHash) {
      const existingFile = await db.query.files.findFirst({
        where: (files, { eq }) => eq(files.contentHash, contentHash),
      });

      if (existingFile) {
        logger.info({ fileId: existingFile.id }, '[Save-Meta] 文件已存在');
        return new Response(
          JSON.stringify({ error: '文件已存在', file: existingFile }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const result = await db.insert(files).values({
      name,
      folderId: folderId || null,
      blobUrl: serverUrl,
      blobPath: serverFilename,
      fileSize: size,
      mimeType,
      contentPreview: name, // 以文件名作为初始占位，使按钮可点击
      contentHash,
      fullContent: fullContent || null,
      parseStatus: 'pending',
    }).returning();

    const newFile = Array.isArray(result) ? result[0] : null;

    if (!newFile) {
      throw new Error('数据库保存失败');
    }

    logger.info({ fileId: newFile.id }, '[Save-Meta] 元数据保存成功');

    // PDF 文件自动创建解析队列任务
    const isPdf = mimeType?.includes('pdf') || name.toLowerCase().endsWith('.pdf');
    if (isPdf && !fullContent) {
      (async () => {
        try {
          await db.insert(parseQueue).values({
            fileId: newFile.id,
            status: 'pending',
          });
          logger.info({ fileId: newFile.id }, '[Save-Meta] 已自动创建完整解析任务');
        } catch (error) {
          logger.warn({ fileId: newFile.id, error }, '[Save-Meta] 创建解析任务失败（可能已存在）');
        }
      })();
    }

    return new Response(
      JSON.stringify({ success: true, file: newFile }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, '[Save-Meta] 保存失败');
    return new Response(
      JSON.stringify({
        error: '保存元数据失败',
        message: error instanceof Error ? error.message : '未知错误',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
