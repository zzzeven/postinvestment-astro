import { put, del } from '@vercel/blob';
import { logger } from './logger';

export async function uploadToBlob(
  buffer: Buffer,
  filename: string,
  contentType: string,
  options?: { temporary?: boolean }
): Promise<{
  url: string;
  pathname: string;
}> {
  try {
    logger.info({ filename, bufferSize: buffer.length, contentType }, '[Blob] 开始上传文件');

    // 检查环境变量
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      logger.error('[Blob] BLOB_READ_WRITE_TOKEN 未设置');
      throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set');
    }

    // 临时文件添加前缀和过期时间
    const blobFilename = options?.temporary
      ? `temp/${Date.now()}-${filename}`
      : filename;

    const blob = await put(blobFilename, buffer, {
      access: 'public',
      contentType: contentType,
      // 临时文件 1 小时后自动删除
      addRandomSuffix: !options?.temporary,
    });

    logger.info({ url: blob.url, temporary: options?.temporary }, '[Blob] 上传成功');

    return {
      url: blob.url,
      pathname: blob.url,
    };
  } catch (error) {
    logger.error({
      filename,
      bufferSize: buffer.length,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    }, '[Blob] 上传失败');
    throw error;
  }
}

/**
 * 从 URL 中提取 blob 的 pathname 并删除
 */
export async function deleteFromBlob(url: string): Promise<boolean> {
  try {
    // Vercel Blob URL 格式: https://blob.vercel-storage.com/path/to/file
    // 需要提取 pathname 部分
    const blobUrl = new URL(url);
    const pathname = blobUrl.pathname.slice(1); // 去掉开头的 /

    logger.info({ url, pathname }, '[Blob] 开始删除文件');

    await del(pathname);

    logger.info({ url, pathname }, '[Blob] 删除成功');
    return true;
  } catch (error) {
    logger.error({
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, '[Blob] 删除失败');
    return false;
  }
}
