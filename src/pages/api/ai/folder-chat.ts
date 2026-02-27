import type { APIContext } from 'astro';
import { db } from '../../../db';
import { files, folders } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../../../lib/logger';
import OpenAI from 'openai';

interface ChatRequest {
  folderId: string;
  message: string;
  history?: Array<{ role: string; content: string }>;
}

export async function POST({ request }: APIContext) {
  try {
    const body: ChatRequest = await request.json();
    const { folderId, message, history = [] } = body;

    logger.info(
      { messagePreview: message.substring(0, 50), folderId },
      '[Folder Chat] 开始文件夹对话'
    );

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: '消息内容不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = import.meta.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: '未配置 OPENAI_API_KEY 环境变量' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取文件夹中的所有文件
    const fileRecords = await db
      .select({
        id: files.id,
        name: files.name,
        fullContent: files.fullContent,
        contentPreview: files.contentPreview,
      })
      .from(files)
      .where(eq(files.folderId, folderId));

    if (fileRecords.length === 0) {
      return new Response(
        JSON.stringify({ error: '指定的文件夹中没有文件' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 记录文件内容状态
    const filesWithFullContent = fileRecords.filter(f => f.fullContent);
    const filesWithPreview = fileRecords.filter(f => !f.fullContent && f.contentPreview);
    const filesWithoutAnyContent = fileRecords.filter(f => !f.fullContent && !f.contentPreview);

    if (filesWithoutAnyContent.length > 0) {
      logger.warn({ filesWithoutAnyContent: filesWithoutAnyContent.map(f => f.name) }, '[Folder Chat] 部分文档无任何内容');
      return new Response(
        JSON.stringify({
          error: '文档无内容',
          details: '以下文档没有内容：' + filesWithoutAnyContent.map(f => f.name).join(', '),
          filesWithoutContent: filesWithoutAnyContent.map(f => f.name),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (filesWithPreview.length > 0) {
      logger.warn({ filesWithPreview: filesWithPreview.map(f => f.name) }, '[Folder Chat] 部分文档只有预览内容');
    }

    // 构建文档上下文（优先使用fullContent，没有则使用contentPreview）
    let documentContext = '';
    for (const file of fileRecords) {
      const content = file.fullContent || file.contentPreview || '';
      if (!content) continue;

      documentContext += `\n\n## ${file.name}\n\n${content}\n`;
    }

    logger.info(
      {
        contextLength: documentContext.length,
        fileCount: fileRecords.length,
      },
      '[Folder Chat] 文档上下文构建完成'
    );

    // 检查上下文长度是否过大
    const estimatedTokens = documentContext.length / 4;
    const maxTokens = 100000;
    if (estimatedTokens > maxTokens) {
      logger.warn(
        { estimatedTokens, maxTokens },
        '[Folder Chat] 文档内容过长，将截断'
      );
      documentContext = documentContext.substring(0, maxTokens * 4);
      documentContext += '\n\n[注：由于内容过长，部分内容已被截断]';
    }

    // 构建系统提示
    const systemPrompt = buildSystemPrompt(fileRecords.map(f => ({ fileName: f.name })));

    // 构建消息历史
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      {
        role: 'user' as const,
        content: `基于以下文档内容回答问题：\n\n${documentContext}\n\n问题：${message}`,
      },
    ];

    // 调用 OpenAI
    const openai = new OpenAI({ apiKey });
    const startTime = Date.now();

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
    });

    const aiInitTime = Date.now() - startTime;
    logger.info({ duration: aiInitTime }, '[Folder Chat] AI 初始化完成');

    // 返回流式响应
    const encoder = new TextEncoder();
    let fullResponse = '';
    let chunkCount = 0;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              chunkCount++;

              if (chunkCount === 1) {
                const firstChunkTime = Date.now() - startTime;
                logger.info({ firstChunkTime }, '[Folder Chat] 首字节响应时间');
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: content })}\n\n`));
            }
          }

          const totalTime = Date.now() - startTime;
          logger.info(
            {
              responseLength: fullResponse.length,
              chunkCount,
              duration: totalTime,
              speed: Math.round(fullResponse.length / (totalTime / 1000)),
            },
            '[Folder Chat] AI 响应完成'
          );

          // 发送完成信号
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                messageId: Date.now().toString(),
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          logger.error(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            '[Folder Chat] 流式响应错误'
          );
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      '[Folder Chat] 对话失败'
    );
    return new Response(
      JSON.stringify({ error: '对话失败', message: error instanceof Error ? error.message : '未知错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function buildSystemPrompt(files: Array<{ fileName: string }>): string {
  const fileList = files.map(f => f.fileName).join(', ');

  return `你是一个专业的文档分析助手，精通中文和英文。

【任务】
基于提供的文件夹中所有文档内容回答用户问题。文档可能包含财务数据、法律条款、技术规范等专业内容。

【文档来源】
${fileList}

【回答要求】
1. 准确基于文档内容回答，不要编造信息
2. 如果文档中没有相关信息，明确说明"文档中没有提及"
3. 引用具体数据和条款时，注明来源文档
4. 使用清晰的结构，适当使用列表和分段
5. 对于数据类问题，提供准确的数字和单位
6. 对于专业术语，给出简要解释
7. 使用中文回答

【注意事项】
- 用户可能询问多个文档的对比分析，请注意区分不同文档的信息
- 回答要客观、准确，避免主观臆断
- 如果信息冲突，指出各文档的不同说法`;
}
