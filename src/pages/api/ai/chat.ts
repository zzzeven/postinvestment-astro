import type { APIContext } from 'astro';
import { db } from '../../../db';
import { files, chatSessions, chatMessages } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { chatWithDocument } from '../../../lib/ai';
import { getContextConfig, getAdaptiveContextConfig } from '../../../lib/context-config';
import { getFileParsedContent } from '../../../lib/parse-service';
import { logger } from '../../../lib/logger';

export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const { fileId, message } = body;

    logger.info({ fileId, messagePreview: message.substring(0, 100) + (message.length > 100 ? '...' : '') }, '[AI Chat] 开始AI聊天交互');

    if (!fileId || !message) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 从环境变量获取API key
    const apiKey = import.meta.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: '未配置OPENAI_API_KEY环境变量' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取文件信息
    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId),
    });

    if (!file) {
      return new Response(
        JSON.stringify({ error: '文件不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取模型配置（使用gpt-4o-mini的优化配置）
    const model = 'gpt-4o-mini';
    const contextConfig = getAdaptiveContextConfig(model, file.fullContent?.length || 0);

    logger.info({ model, maxTokens: contextConfig.maxTokens, maxChunkSize: contextConfig.maxChunkSize, documentLength: file.fullContent?.length || 0 }, '[AI Chat] 模型配置');

    // 获取解析后的文档内容
    let contextContent = '';
    try {
      const parsedContent = await getFileParsedContent(fileId);

      // 新策略：直接使用完整内容，让 AI 自己分析和理解
      if (parsedContent.fullContent && parsedContent.fullContent.length > 0) {
        contextContent = parsedContent.fullContent;
        logger.info({ contextContentLength: contextContent.length }, '[AI Chat] 直接使用完整内容（跳过 RAG）');
      }
      // 回退策略：如果完整内容为空，使用预览
      else {
        contextContent = file.contentPreview || '';
        logger.warn({ contextContentLength: contextContent.length }, '[AI Chat] 使用回退策略：预览内容');

        if (contextContent.length === 0) {
          logger.warn('[AI Chat] 文档内容为空，AI可能无法有效回答问题');
        }
      }

      logger.info({ contextContentLength: contextContent.length }, '[AI Chat] 内容获取完成');

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined }, '[AI Chat] 获取解析内容失败');

      // 多层回退机制
      if (file.fullContent && file.fullContent.length > 0) {
        contextContent = file.fullContent;
        logger.info({ contextContentLength: contextContent.length }, '[AI Chat] 错误回退1: 使用文件的 fullContent');
      } else {
        contextContent = file.contentPreview || '';
        logger.info({ contextContentLength: contextContent.length }, '[AI Chat] 错误回退2: 使用 contentPreview');
      }

      if (contextContent.length === 0) {
        logger.error('[AI Chat] 严重错误：所有内容源都为空，AI无法回答问题');
      }
    }

    // 调用AI
    logger.info({ contextContentLength: contextContent.length, message, fileId }, '[AI Chat] 准备调用 AI 模型');

    if (contextContent.length === 0) {
      logger.error('[AI Chat] 严重错误：contextContent 为空');
    }
    const result = await chatWithDocument(
      contextContent,
      message,
      {
        provider: 'openai',
        apiKey,
        model,
      }
    );

    logger.info('[AI Chat] chatWithDocument 调用成功，返回流式响应');

    // 创建聊天会话
    const sessionResult = await db.insert(chatSessions).values({
      fileId,
      title: message.substring(0, 50),
    }).returning();

    const session = Array.isArray(sessionResult) ? sessionResult[0] : null;

    if (!session) {
      throw new Error('无法创建聊天会话');
    }

    logger.info({ sessionId: session.id }, '[AI Chat] 聊天会话创建成功');

    // 保存用户消息
    await db.insert(chatMessages).values({
      sessionId: session.id,
      role: 'user',
      content: message,
    });
    logger.info('[AI Chat] 用户消息已保存到数据库');

    // 返回流式响应
    const encoder = new TextEncoder();
    const streamStartTime = Date.now();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';
          let chunkCount = 0;
          const streamStartTime = Date.now();

          for await (const chunk of result.textStream) {
            fullResponse += chunk;
            chunkCount++;

            if (chunkCount === 1) {
              const firstChunkTime = Date.now();
              logger.info({ firstChunkTime: firstChunkTime - streamStartTime }, '[AI Chat] 收到第一个响应块');
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
          }

          const streamEndTime = Date.now();
          logger.info({
            chunkCount,
            responseLength: fullResponse.length,
            duration: streamEndTime - streamStartTime,
            speed: Math.round(fullResponse.length / ((streamEndTime - streamStartTime) / 1000))
          }, '[AI Chat] 流式接收完成');

          // 保存AI响应
          const saveStartTime = Date.now();
          await db.insert(chatMessages).values({
            sessionId: session.id,
            role: 'assistant',
            content: fullResponse,
          });
          const saveEndTime = Date.now();
          logger.info({ duration: saveEndTime - saveStartTime }, '[AI Chat] AI响应已保存');

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          logger.error({ error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined }, '[AI Chat] 流式响应错误');
          controller.error(error);
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
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined }, 'AI聊天错误');
    return new Response(
      JSON.stringify({ error: 'AI聊天失败', message: error instanceof Error ? error.message : '未知错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
