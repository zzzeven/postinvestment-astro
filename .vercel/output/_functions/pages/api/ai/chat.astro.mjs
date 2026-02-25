import { d as db, f as files, a as documentChunks, c as chatSessions, b as chatMessages } from '../../../chunks/index_B-AYb3H8.mjs';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { l as logger } from '../../../chunks/logger_bR4G-6LJ.mjs';
export { renderers } from '../../../renderers.mjs';

async function chatWithDocument(context, message, config) {
  logger.info(
    { provider: config.provider, model: config.model, contextLength: context.length, messageLength: message.length },
    "[AI Library] 开始调用 AI 模型"
  );
  const sessionId = crypto.randomUUID();
  const startTime = Date.now();
  let textStream;
  if (config.provider === "openai") {
    textStream = streamOpenAI(context, message, config);
  } else if (config.provider === "anthropic") {
    textStream = streamAnthropic(context, message, config);
  } else {
    throw new Error(`不支持的AI提供商: ${config.provider}`);
  }
  const endTime = Date.now();
  logger.info({ duration: endTime - startTime }, "[AI Library] AI API 调用成功");
  return {
    textStream,
    sessionId
  };
}
async function* streamOpenAI(context, message, config) {
  const openai = new OpenAI({ apiKey: config.apiKey });
  try {
    const stream = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: "system",
          content: `你是一个文档分析助手。基于以下文档内容回答问题：

${context}`
        },
        {
          role: "user",
          content: message
        }
      ],
      stream: true
    });
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    logger.error({ error }, "[AI Library] OpenAI API 调用失败");
    throw error;
  }
}
async function* streamAnthropic(context, message, config) {
  const anthropic = new Anthropic({ apiKey: config.apiKey });
  try {
    const stream = await anthropic.messages.create({
      model: config.model,
      max_tokens: 4096,
      system: `你是一个文档分析助手。基于以下文档内容回答问题：

${context}`,
      messages: [
        {
          role: "user",
          content: message
        }
      ],
      stream: true
    });
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta") {
        if (chunk.delta.type === "text_delta") {
          yield chunk.delta.text;
        }
      }
    }
  } catch (error) {
    logger.error({ error }, "[AI Library] Anthropic API 调用失败");
    throw error;
  }
}

const GPT4OMINI_CONFIG = {
  maxTokens: 96e3,
  // 96K tokens，留32K给回复
  reservedTokens: 4e3,
  // 4K tokens预留
  maxChunkSize: 8e3,
  // 8K字符/块
  overlapSize: 400,
  // 400字符重叠
  minChunkSize: 500,
  // 500字符最小
  maxRelevantChunks: 12
  // 12个相关块
};
const GPT4TURBO_CONFIG = {
  maxTokens: 64e3,
  // 64K tokens
  reservedTokens: 4e3,
  maxChunkSize: 6e3,
  overlapSize: 300,
  minChunkSize: 400,
  maxRelevantChunks: 10
};
const CLAUDE3_CONFIG = {
  maxTokens: 8e4,
  // Claude-3 100K上下文
  reservedTokens: 5e3,
  maxChunkSize: 7e3,
  overlapSize: 350,
  minChunkSize: 450,
  maxRelevantChunks: 11
};
function getContextConfig(model) {
  if (model.includes("gpt-4o-mini")) {
    return GPT4OMINI_CONFIG;
  } else if (model.includes("gpt-4")) {
    return GPT4TURBO_CONFIG;
  } else if (model.includes("claude-3")) {
    return CLAUDE3_CONFIG;
  }
  return GPT4OMINI_CONFIG;
}
function getAdaptiveContextConfig(model, totalTextLength) {
  const baseConfig = getContextConfig(model);
  if (totalTextLength > 1e5) {
    return {
      ...baseConfig,
      maxChunkSize: Math.min(baseConfig.maxChunkSize * 1.5, 12e3),
      overlapSize: Math.min(baseConfig.overlapSize * 1.2, 600)
    };
  }
  if (totalTextLength < 1e4) {
    return {
      ...baseConfig,
      maxChunkSize: Math.max(baseConfig.maxChunkSize * 0.7, 2e3),
      overlapSize: Math.max(baseConfig.overlapSize * 0.8, 200)
    };
  }
  return baseConfig;
}

async function getFileParsedContent(fileId) {
  logger.info({ fileId }, "[Parse Service] 获取文件解析内容");
  try {
    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId),
      columns: {
        fullContent: true,
        parseStatus: true,
        name: true
      }
    });
    if (!file) {
      logger.error({ fileId }, "[Parse Service] 文件不存在");
      throw new Error("文件不存在");
    }
    logger.info({ fileId, name: file.name, parseStatus: file.parseStatus, fullContentLength: file.fullContent?.length || 0 }, "[Parse Service] 数据库查询结果");
    if (file.parseStatus !== "completed") {
      logger.warn({ fileId, parseStatus: file.parseStatus }, "[Parse Service] 文件解析状态不是 completed");
      if (file.fullContent && file.fullContent.length > 0) {
        const chunks2 = await db.query.documentChunks.findMany({
          where: eq(documentChunks.fileId, fileId),
          orderBy: (chunks3, { asc }) => [asc(chunks3.chunkIndex)]
        });
        logger.info({ fileId, chunksCount: chunks2.length, fullContentLength: file.fullContent.length }, "[Parse Service] 状态非 completed 但存在 fullContent");
        return {
          fullContent: file.fullContent,
          chunks: chunks2
        };
      }
      logger.warn({ fileId }, "[Parse Service] 没有可用的内容，返回空结果");
      return {
        fullContent: null,
        chunks: []
      };
    }
    const chunks = await db.query.documentChunks.findMany({
      where: eq(documentChunks.fileId, fileId),
      orderBy: (chunks2, { asc }) => [asc(chunks2.chunkIndex)]
    });
    logger.info({ fileId, fullContentLength: file.fullContent?.length || 0, chunksCount: chunks.length }, "[Parse Service] 成功获取数据");
    return {
      fullContent: file.fullContent,
      chunks
    };
  } catch (error) {
    logger.error({ fileId, error: error instanceof Error ? error.message : "Unknown error", stack: error instanceof Error ? error.stack : void 0 }, "[Parse Service] 获取解析内容失败");
    return {
      fullContent: null,
      chunks: []
    };
  }
}

async function POST({ request }) {
  try {
    const body = await request.json();
    const { fileId, message } = body;
    logger.info({ fileId, messagePreview: message.substring(0, 100) + (message.length > 100 ? "..." : "") }, "[AI Chat] 开始AI聊天交互");
    if (!fileId || !message) {
      return new Response(
        JSON.stringify({ error: "缺少必要参数" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const apiKey = undefined                              ;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "未配置OPENAI_API_KEY环境变量" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId)
    });
    if (!file) {
      return new Response(
        JSON.stringify({ error: "文件不存在" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const model = "gpt-4o-mini";
    const contextConfig = getAdaptiveContextConfig(model, file.fullContent?.length || 0);
    logger.info({ model, maxTokens: contextConfig.maxTokens, maxChunkSize: contextConfig.maxChunkSize, documentLength: file.fullContent?.length || 0 }, "[AI Chat] 模型配置");
    let contextContent = "";
    try {
      const parsedContent = await getFileParsedContent(fileId);
      if (parsedContent.fullContent && parsedContent.fullContent.length > 0) {
        contextContent = parsedContent.fullContent;
        logger.info({ contextContentLength: contextContent.length }, "[AI Chat] 直接使用完整内容（跳过 RAG）");
      } else {
        contextContent = file.contentPreview || "";
        logger.warn({ contextContentLength: contextContent.length }, "[AI Chat] 使用回退策略：预览内容");
        if (contextContent.length === 0) {
          logger.warn("[AI Chat] 文档内容为空，AI可能无法有效回答问题");
        }
      }
      logger.info({ contextContentLength: contextContent.length }, "[AI Chat] 内容获取完成");
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : "Unknown error", stack: error instanceof Error ? error.stack : void 0 }, "[AI Chat] 获取解析内容失败");
      if (file.fullContent && file.fullContent.length > 0) {
        contextContent = file.fullContent;
        logger.info({ contextContentLength: contextContent.length }, "[AI Chat] 错误回退1: 使用文件的 fullContent");
      } else {
        contextContent = file.contentPreview || "";
        logger.info({ contextContentLength: contextContent.length }, "[AI Chat] 错误回退2: 使用 contentPreview");
      }
      if (contextContent.length === 0) {
        logger.error("[AI Chat] 严重错误：所有内容源都为空，AI无法回答问题");
      }
    }
    logger.info({ contextContentLength: contextContent.length, message, fileId }, "[AI Chat] 准备调用 AI 模型");
    if (contextContent.length === 0) {
      logger.error("[AI Chat] 严重错误：contextContent 为空");
    }
    const result = await chatWithDocument(
      contextContent,
      message,
      {
        provider: "openai",
        apiKey,
        model
      }
    );
    logger.info("[AI Chat] chatWithDocument 调用成功，返回流式响应");
    const sessionResult = await db.insert(chatSessions).values({
      fileId,
      title: message.substring(0, 50)
    }).returning();
    const session = Array.isArray(sessionResult) ? sessionResult[0] : null;
    if (!session) {
      throw new Error("无法创建聊天会话");
    }
    logger.info({ sessionId: session.id }, "[AI Chat] 聊天会话创建成功");
    await db.insert(chatMessages).values({
      sessionId: session.id,
      role: "user",
      content: message
    });
    logger.info("[AI Chat] 用户消息已保存到数据库");
    const encoder = new TextEncoder();
    const streamStartTime = Date.now();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";
          let chunkCount = 0;
          const streamStartTime2 = Date.now();
          for await (const chunk of result.textStream) {
            fullResponse += chunk;
            chunkCount++;
            if (chunkCount === 1) {
              const firstChunkTime = Date.now();
              logger.info({ firstChunkTime: firstChunkTime - streamStartTime2 }, "[AI Chat] 收到第一个响应块");
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}

`));
          }
          const streamEndTime = Date.now();
          logger.info({
            chunkCount,
            responseLength: fullResponse.length,
            duration: streamEndTime - streamStartTime2,
            speed: Math.round(fullResponse.length / ((streamEndTime - streamStartTime2) / 1e3))
          }, "[AI Chat] 流式接收完成");
          const saveStartTime = Date.now();
          await db.insert(chatMessages).values({
            sessionId: session.id,
            role: "assistant",
            content: fullResponse
          });
          const saveEndTime = Date.now();
          logger.info({ duration: saveEndTime - saveStartTime }, "[AI Chat] AI响应已保存");
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          logger.error({ error: error instanceof Error ? error.message : "Unknown error", stack: error instanceof Error ? error.stack : void 0 }, "[AI Chat] 流式响应错误");
          controller.error(error);
        }
      }
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : "Unknown error", stack: error instanceof Error ? error.stack : void 0 }, "AI聊天错误");
    return new Response(
      JSON.stringify({ error: "AI聊天失败", message: error instanceof Error ? error.message : "未知错误" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
