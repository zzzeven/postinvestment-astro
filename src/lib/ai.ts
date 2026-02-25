import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger';

export interface AIProvider {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
}

export interface ChatStreamResult {
  textStream: AsyncGenerator<string, void, unknown>;
  sessionId: string;
}

export async function chatWithDocument(
  context: string,
  message: string,
  config: AIProvider
): Promise<ChatStreamResult> {
  logger.info(
    { provider: config.provider, model: config.model, contextLength: context.length, messageLength: message.length },
    '[AI Library] 开始调用 AI 模型'
  );

  const sessionId = crypto.randomUUID();
  const startTime = Date.now();

  let textStream: AsyncGenerator<string, void, unknown>;

  if (config.provider === 'openai') {
    textStream = streamOpenAI(context, message, config);
  } else if (config.provider === 'anthropic') {
    textStream = streamAnthropic(context, message, config);
  } else {
    throw new Error(`不支持的AI提供商: ${config.provider}`);
  }

  const endTime = Date.now();
  logger.info({ duration: endTime - startTime }, '[AI Library] AI API 调用成功');

  return {
    textStream,
    sessionId,
  };
}

async function* streamOpenAI(
  context: string,
  message: string,
  config: AIProvider
): AsyncGenerator<string, void, unknown> {
  const openai = new OpenAI({ apiKey: config.apiKey });

  try {
    const stream = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: `你是一个文档分析助手。基于以下文档内容回答问题：\n\n${context}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    logger.error({ error }, '[AI Library] OpenAI API 调用失败');
    throw error;
  }
}

async function* streamAnthropic(
  context: string,
  message: string,
  config: AIProvider
): AsyncGenerator<string, void, unknown> {
  const anthropic = new Anthropic({ apiKey: config.apiKey });

  try {
    const stream = await anthropic.messages.create({
      model: config.model,
      max_tokens: 4096,
      system: `你是一个文档分析助手。基于以下文档内容回答问题：\n\n${context}`,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        if (chunk.delta.type === 'text_delta') {
          yield chunk.delta.text;
        }
      }
    }
  } catch (error) {
    logger.error({ error }, '[AI Library] Anthropic API 调用失败');
    throw error;
  }
}

export function getModelName(provider: string, model: string): string {
  const modelNames: Record<string, Record<string, string>> = {
    openai: {
      'gpt-4': 'GPT-4',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
    },
    anthropic: {
      'claude-3-opus-20240229': 'Claude 3 Opus',
      'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
      'claude-3-haiku-20240307': 'Claude 3 Haiku',
      'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
      'claude-3-5-sonnet-20240620': 'Claude 3.5 Sonnet',
    },
  };

  return modelNames[provider]?.[model] || model;
}
