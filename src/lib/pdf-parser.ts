import pdf from 'pdf-parse';
import { logger } from './logger';

export interface PdfParseResult {
  text: string;
  pages: number;
  preview: string;
}

/**
 * 从 PDF Buffer 中提取文本内容
 * @param buffer PDF 文件的 Buffer
 * @returns 解析结果，包含文本、页数和预览
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfParseResult> {
  try {
    const data = await pdf(buffer);

    const text = data.text || '';
    const preview = text.slice(0, 2000);

    logger.info(
      {
        pages: data.numpages,
        textLength: text.length,
        previewLength: preview.length,
      },
      '[PDF-Parser] PDF 解析成功'
    );

    return {
      text,
      pages: data.numpages,
      preview,
    };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      '[PDF-Parser] PDF 解析失败'
    );
    throw error;
  }
}

/**
 * 从 URL 下载 PDF 并解析提取预览文本
 * @param url PDF 文件的 URL
 * @returns 预览文本（前 2000 字符）
 */
export async function extractPdfPreviewFromUrl(url: string): Promise<string> {
  try {
    logger.info({ url }, '[PDF-Parser] 开始下载 PDF');

    const response = await fetch(url, {
      signal: AbortSignal.timeout(120000), // 120 秒超时，支持大文件
    });

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

    // 检查内容长度，避免解析过大的文件
    const contentLength = response.headers.get('content-length');
    const fileSize = contentLength ? parseInt(contentLength, 10) : 0;

    logger.info({ url, fileSize }, '[PDF-Parser] 文件大小');

    // 如果文件超过 50MB，跳过解析（预览不需要解析超大文件）
    if (fileSize > 50 * 1024 * 1024) {
      logger.warn({ url, fileSize }, '[PDF-Parser] 文件过大，跳过预览解析');
      throw new Error(`文件过大 (${(fileSize / 1024 / 1024).toFixed(2)}MB)，跳过预览解析`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const result = await extractPdfText(buffer);

    return result.preview;
  } catch (error) {
    logger.error(
      { url, error: error instanceof Error ? error.message : 'Unknown error' },
      '[PDF-Parser] 从 URL 解析 PDF 失败'
    );
    throw error;
  }
}
