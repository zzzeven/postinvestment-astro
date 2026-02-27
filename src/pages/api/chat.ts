import type { APIContext } from 'astro';
import { db } from '../../db';
import { files, conversations, conversationMessages } from '../../db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import OpenAI from 'openai';
import { logger } from '../../lib/logger';

/**
 * 聊天请求体
 */
interface ChatRequest {
  message: string;
  conversationId?: string;
  fileIds?: string[];
  model?: string;
}

/**
 * 聊天响应格式
 */
interface ChatResponse {
  conversationId: string;
  messageId: string;
}

// POST /api/chat - 智能多文档对话
export async function POST({ request }: APIContext) {
  try {
    const body: ChatRequest = await request.json();
    const {
      message,
      conversationId,
      fileIds = [],
      model = 'gpt-4o-mini',
    } = body;

    logger.info(
      { messagePreview: message.substring(0, 50), conversationId, fileIdsCount: fileIds.length },
      '[Chat API] 开始智能对话'
    );

    // 验证参数
    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: '消息内容不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 检查 API key
    const apiKey = import.meta.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: '未配置 OPENAI_API_KEY 环境变量' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取或创建会话
    let currentConversationId = conversationId;
    let currentFileIds = fileIds;

    if (conversationId) {
      // 获取现有会话
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
      });

      if (!conversation) {
        return new Response(
          JSON.stringify({ error: '对话不存在' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // fileIds 存储为 JSON 字符串，需要解析
      currentFileIds = conversation.fileIds
        ? (typeof conversation.fileIds === 'string'
            ? JSON.parse(conversation.fileIds)
            : conversation.fileIds)
        : [];
      logger.info({ conversationId, fileIds: currentFileIds }, '[Chat API] 使用现有会话');
    } else {
      // 创建新会话
      if (currentFileIds.length === 0) {
        return new Response(
          JSON.stringify({ error: '请至少选择一个文档进行对话' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 验证文件存在
      const fileRecords = await db
        .select({ id: files.id, name: files.name })
        .from(files)
        .where(inArray(files.id, currentFileIds));

      if (fileRecords.length === 0) {
        return new Response(
          JSON.stringify({ error: '指定的文档不存在' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const newConversation = await db
        .insert(conversations)
        .values({
          title: message.substring(0, 100),
          fileIds: JSON.stringify(currentFileIds),
          config: JSON.stringify({ model }),
          messageCount: 0,
        })
        .returning();

      if (!newConversation[0]?.id) {
        throw new Error('无法创建会话');
      }
      currentConversationId = newConversation[0].id;
      logger.info({ conversationId: currentConversationId, title: message.substring(0, 50) }, '[Chat API] 创建新会话');
    }

    // 检查文档是否存在并获取内容
    const fileRecords = await db
      .select({
        id: files.id,
        name: files.name,
        fullContent: files.fullContent,
        contentPreview: files.contentPreview,
      })
      .from(files)
      .where(inArray(files.id, currentFileIds));

    if (fileRecords.length === 0) {
      return new Response(
        JSON.stringify({ error: '指定的文档不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 检查文档是否有内容（fullContent 或 contentPreview）
    const filesWithoutContent = fileRecords.filter(f => !f.fullContent && !f.contentPreview);
    if (filesWithoutContent.length > 0) {
      logger.warn({ filesWithoutContent: filesWithoutContent.map(f => f.name) }, '[Chat API] 部分文档无内容');
      return new Response(
        JSON.stringify({
          error: '文档无可用内容',
          details: '请先上传文件以获取内容',
          filesWithoutContent: filesWithoutContent.map(f => f.name),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 检查是否有文档使用预览内容
    const filesUsingPreview = fileRecords.filter(f => !f.fullContent && !!f.contentPreview);
    if (filesUsingPreview.length > 0) {
      logger.info({ filesUsingPreview: filesUsingPreview.map(f => f.name) }, '[Chat API] 部分文档使用预览内容');
    }

    // 确保 currentConversationId 已定义
    if (!currentConversationId) {
      return new Response(
        JSON.stringify({ error: '会话ID未定义' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 保存用户消息
    const userMessageResult = await db
      .insert(conversationMessages)
      .values({
        conversationId: currentConversationId,
        role: 'user',
        content: message,
      })
      .returning();

    const userId = userMessageResult[0].id;
    logger.info({ messageId: userId }, '[Chat API] 用户消息已保存');

    // 构建文档上下文（优先使用 fullContent，否则使用 contentPreview）
    let documentContext = '';
    for (const file of fileRecords) {
      const content = file.fullContent || file.contentPreview || '';
      const contentLabel = file.fullContent ? '' : ' [预览内容]';
      documentContext += `\n\n## ${file.name}${contentLabel}\n\n${content}\n`;
    }

    logger.info(
      {
        contextLength: documentContext.length,
        fileCount: fileRecords.length,
      },
      '[Chat API] 文档上下文构建完成'
    );

    // 获取历史消息（用于上下文）
    const historyMessages = await db
      .select({
        role: conversationMessages.role,
        content: conversationMessages.content,
      })
      .from(conversationMessages)
      .where(eq(conversationMessages.conversationId, currentConversationId))
      .orderBy(desc(conversationMessages.createdAt))
      .limit(10); // 最近10条消息

    // 反转顺序（从旧到新）
    historyMessages.reverse();

    // 构建系统提示
    const systemPrompt = buildSystemPrompt(fileRecords.map(f => ({ fileName: f.name })));

    // 构建消息历史
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...historyMessages.map(m => ({
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
      model,
      messages,
      stream: true,
    });

    const aiInitTime = Date.now() - startTime;
    logger.info({ duration: aiInitTime }, '[Chat API] AI 初始化完成');

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
                logger.info({ firstChunkTime }, '[Chat API] 首字节响应时间');
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
            '[Chat API] AI 响应完成'
          );

          // 保存 AI 响应
          const assistantMessageResult = await db
            .insert(conversationMessages)
            .values({
              conversationId: currentConversationId!,
              role: 'assistant',
              content: fullResponse,
              contextFiles: JSON.stringify(currentFileIds),
            })
            .returning();

          const assistantMessageId = assistantMessageResult[0].id;
          logger.info({ messageId: assistantMessageId }, '[Chat API] AI 响应已保存');

          // 更新会话统计
          await db
            .update(conversations)
            .set({
              messageCount: (historyMessages.length + 2) / 2, // user + assistant pairs
              updatedAt: new Date(),
            })
            .where(eq(conversations.id, currentConversationId!));

          // 发送完成信号
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                conversationId: currentConversationId,
                messageId: assistantMessageId,
              } as ChatResponse & { done: boolean })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          logger.error(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            '[Chat API] 流式响应错误'
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
      { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined },
      '[Chat API] 对话失败'
    );
    return new Response(
      JSON.stringify(
        { error: '对话失败', message: error instanceof Error ? error.message : '未知错误' }
      ),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 构建系统提示
 */
function buildSystemPrompt(files: Array<{ fileName: string }>): string {
  const fileList = files.map(f => f.fileName).join(', ');

  return `你是一个专业的文档分析助手，精通中文和英文。

【任务】
基于提供的文档内容回答用户问题。文档可能包含财务数据、法律条款、技术规范等专业内容。

【文档来源】
${fileList}

【内容说明】
- 标记为"[预览内容]"的文档仅包含前2000字，内容有限
- 对于预览内容文档，回答时要说明信息可能不完整
- 完整文档可以提供更全面的信息

【回答要求】
1. 准确基于文档内容回答，不要编造信息
2. 如果文档中没有相关信息，明确说明"文档中没有提及"
3. 引用具体数据和条款时，注明来源文档
4. 对于预览内容文档，提醒用户"基于预览内容，可能不完整"
5. 使用清晰的结构，适当使用列表和分段
6. 对于数据类问题，提供准确的数字和单位
7. 对于专业术语，给出简要解释
8. 使用中文回答

【注意事项】
- 用户可能询问多个文档的对比分析，请注意区分不同文档的信息
- 回答要客观、准确，避免主观臆断
- 如果信息冲突，指出各文档的不同说法`;
}

// GET /api/chat?conversationId=xxx - 获取会话历史
export async function GET({ request }: APIContext) {
  try {
    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId');

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: '缺少 conversationId 参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const messages = await db.query.conversationMessages.findMany({
      where: eq(conversationMessages.conversationId, conversationId),
      orderBy: [desc(conversationMessages.createdAt)],
    });

    return new Response(
      JSON.stringify({
        conversationId,
        messages: messages.reverse(),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      '[Chat API] 获取会话历史失败'
    );
    return new Response(
      JSON.stringify({ error: '获取会话历史失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
