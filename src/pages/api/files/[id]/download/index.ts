import type { APIContext } from 'astro';
import { db } from '../../../../../../db';
import { files } from '../../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../../../../../../lib/logger';

// GET /api/files/[id]/download - 下载文件
export async function GET({ params, request }: APIContext) {
  try {
    const id = params.id;

    if (!id) {
      return new Response(
        JSON.stringify({ error: '文件ID不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.info({ fileId: id }, '[Download] 开始下载文件');

    // 获取文件信息
    const file = await db.query.files.findFirst({
      where: eq(files.id, id),
    });

    if (!file) {
      logger.error({ fileId: id }, '[Download] 文件不存在');
      return new Response(
        JSON.stringify({ error: '文件不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.info({ fileId: id, fileName: file.name, blobUrl: file.blobUrl }, '[Download] 找到文件');

    // 构建完整的下载URL
    let downloadUrl = file.blobUrl;

    if (!downloadUrl) {
      logger.error({ fileId: id }, '[Download] blobUrl 为空');
      return new Response(
        JSON.stringify({ error: '文件下载地址不存在' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 如果 blobUrl 是相对路径（以 /uploads/ 开头），则拼接上传服务器地址
    if (downloadUrl.startsWith('/uploads/')) {
      const uploadServerUrl = import.meta.env.UPLOAD_SERVER_URL;
      if (!uploadServerUrl) {
        logger.error('[Download] 未配置上传服务器URL，无法构建下载地址');
        return new Response(
          JSON.stringify({ error: '下载配置错误，请联系管理员' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // 移除尾部的斜杠并拼接
      const baseUrl = uploadServerUrl.replace(/\/$/, '');
      downloadUrl = `${baseUrl}${downloadUrl}`;
      logger.info({ originalUrl: file.blobUrl, finalUrl: downloadUrl }, '[Download] 拼接完整URL');
    }

    logger.info({ downloadUrl }, '[Download] 重定向到');

    // 使用 307 临时重定向，让浏览器直接从上传服务器下载
    return Response.redirect(downloadUrl, 307);
  } catch (error) {
    logger.error('[Download] 下载错误:', error);
    return new Response(
      JSON.stringify({ error: '下载失败', message: error instanceof Error ? error.message : '未知错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
