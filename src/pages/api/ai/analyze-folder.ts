import type { APIContext } from 'astro';
import { db } from '../../../db';
import { files, folders } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { chatWithDocument } from '../../../lib/ai';
import { logger } from '../../../lib/logger';

export async function POST({ request }: APIContext) {
  logger.info('[Analyze Folder] ========== 开始分析文件夹 ==========');

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const { folderId, question } = body;

        logger.info('[Analyze Folder]', { folderId, question: question?.substring(0, 100) });

        if (!folderId) {
          logger.error('[Analyze Folder] 文件夹ID不能为空');
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', data: '文件夹ID不能为空' })}\n\n`));
          controller.close();
          return;
        }

        // 发送开始消息
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', data: { folderId } })}\n\n`));

        // 获取文件夹信息
        logger.info('[Analyze Folder] 获取文件夹信息...');
        const folderResult = await db.select().from(folders).where(eq(folders.id, folderId));

        if (folderResult.length === 0) {
          logger.error('[Analyze Folder] 文件夹不存在');
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', data: '文件夹不存在' })}\n\n`));
          controller.close();
          return;
        }

        const folder = folderResult[0];
        logger.info('[Analyze Folder]', { folderName: folder.name });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'folder', data: { name: folder.name } })}\n\n`));

        // 获取文件夹中的所有PDF文件
        logger.info('[Analyze Folder] 获取文件夹中的文件...');
        const filesResult = await db.select().from(files).where(eq(files.folderId, folderId));

        if (filesResult.length === 0) {
          logger.error('[Analyze Folder] 该文件夹中没有文件');
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', data: '该文件夹中没有文件' })}\n\n`));
          controller.close();
          return;
        }

        logger.info('[Analyze Folder]', { fileCount: filesResult.length });

        // 发送文件列表
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'files', data: { count: filesResult.length, files: filesResult.map(f => ({ name: f.name, size: f.fileSize })) } })}\n\n`));

        // 构建文件内容
        logger.info('[Analyze Folder] ========== 收集文件内容 ==========');

        const MAX_SYSTEM_PROMPT_LENGTH = 100000;

        const headerInfo = `你是一个专业的投后文档分析助手。现在需要你对一个文件夹中的所有PDF文档进行综合分析。

文件夹名称: ${folder.name}
文件夹中包含 ${filesResult.length} 个文档

`;
        const headerLength = headerInfo.length;
        const availableForContent = MAX_SYSTEM_PROMPT_LENGTH - headerLength - 500;

        logger.info('[Analyze Folder]', { availableSpace: availableForContent });

        let fileContents = '';
        let usedLength = 0;
        let truncatedFiles: { name: string; originalLength: number }[] = [];
        let includedCount = 0;

        for (let i = 0; i < filesResult.length; i++) {
          const file = filesResult[i];
          const content = file.fullContent || file.contentPreview || '(无内容)';
          const contentLength = content.length;

          const fileEntry = `【文件 ${i + 1}】
文件名: ${file.name}
上传时间: ${file.uploadedAt ? new Date(file.uploadedAt).toLocaleString('zh-CN') : '未知'}
解析状态: ${file.parseStatus || '未解析'}
${file.fullContent ? `内容长度: ${file.fullContent.length} 字符` : `内容摘要: ${file.contentPreview || '(无内容摘要)'}`}

${content}
---
`;

          const entryLength = fileEntry.length;

          if (usedLength + entryLength <= availableForContent) {
            fileContents += fileEntry;
            usedLength += entryLength;
            includedCount++;
          } else {
            truncatedFiles.push({ name: file.name, originalLength: contentLength });
          }
        }

        const totalContentLength = filesResult.reduce((sum, file) => sum + (file.fullContent?.length || 0), 0);
        logger.info('[Analyze Folder] ========== 文件内容收集完成 ==========');
        logger.info('[Analyze Folder]', {
          totalFiles: filesResult.length,
          includedCount,
          skippedCount: truncatedFiles.length,
          totalContentLength,
          usedLength: usedLength + headerLength
        });

        let systemPrompt = headerInfo + fileContents;

        if (truncatedFiles.length > 0) {
          systemPrompt += `\n【注意：由于内容量较大，以下 ${truncatedFiles.length} 个文件的内容未包含在上下文中，但文件元数据已记录】\n`;
          truncatedFiles.forEach((f) => {
            systemPrompt += `  - ${f.name} (${f.originalLength} 字符)\n`;
          });
          systemPrompt += '\n';
        }

        systemPrompt += `【任务】
请根据以上文档内容，提供专业的分析。仔细阅读每个文档的完整内容，理解其中的关键信息，然后进行综合分析。

【回答要求】
1. 提供文档的全面概述
2. 提取关键信息和数据
3. 分析投资建议或风险提示
4. 比较文档之间的关联和差异
5. 使用清晰的条理结构
6. 基于实际文档内容回答，不要编造
`;

        let analysisQuestion = question || '请对这些文档进行全面的分析和总结，包括：1. 主要内容概述；2. 关键信息提取；3. 投资建议或风险提示；4. 文档之间的关联和差异。';

        logger.info('[Analyze Folder] ========== 准备调用 AI ==========');
        logger.info('[Analyze Folder]', {
          systemPromptLength: systemPrompt.length,
          questionLength: analysisQuestion.length,
          totalLength: systemPrompt.length + analysisQuestion.length
        });

        const estimatedInputTokens = (systemPrompt.length + analysisQuestion.length) / 4;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token_estimate', data: { inputTokens: Math.round(estimatedInputTokens) } })}\n\n`));

        const apiKey = import.meta.env.OPENAI_API_KEY;

        if (!apiKey) {
          logger.error('[Analyze Folder] 未配置OPENAI_API_KEY环境变量');
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', data: '未配置OPENAI_API_KEY环境变量' })}\n\n`));
          controller.close();
          return;
        }

        let result;
        try {
          result = await chatWithDocument(
            systemPrompt,
            analysisQuestion,
            {
              provider: 'openai',
              apiKey,
              model: 'gpt-4o-mini',
            }
          );
        } catch (aiError) {
          logger.error('[Analyze Folder]', { error: aiError instanceof Error ? aiError.message : 'Unknown error' });
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', data: `AI调用失败: ${aiError instanceof Error ? aiError.message : '未知错误'}` })}\n\n`));
          controller.close();
          return;
        }

        logger.info('[Analyze Folder] 开始流式响应...');

        let fullResponse = '';
        let chunkCount = 0;

        for await (const chunk of result.textStream) {
          fullResponse += chunk;
          chunkCount++;
          const totalTokens = Math.round(fullResponse.length / 4);

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', data: { content: chunk, tokens: totalTokens } })}\n\n`));
        }

        logger.info('[Analyze Folder] ========== 分析完成 ==========');
        logger.info('[Analyze Folder]', {
          chunkCount,
          responseLength: fullResponse.length,
          outputTokens: Math.round(fullResponse.length / 4)
        });

        const inputPrice = (estimatedInputTokens / 1000000) * 0.15;
        const outputPrice = ((fullResponse.length / 4) / 1000000) * 0.60;
        const totalPrice = inputPrice + outputPrice;

        const completeData = {
          type: 'complete',
          data: {
            analysis: fullResponse,
            tokens: {
              input: Math.round(estimatedInputTokens),
              output: Math.round(fullResponse.length / 4),
              total: Math.round(estimatedInputTokens) + Math.round(fullResponse.length / 4)
            },
            price: {
              input: inputPrice.toFixed(4),
              output: outputPrice.toFixed(4),
              total: totalPrice.toFixed(4)
            }
          }
        };

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeData)}\n\n`));
        controller.close();

      } catch (error) {
        logger.error('[Analyze Folder]', { error: error instanceof Error ? error.message : 'Unknown error' });
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', data: errorMessage })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
