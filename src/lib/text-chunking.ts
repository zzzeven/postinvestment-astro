import { NewDocumentChunk } from '@/db/schema';
import { logger } from './logger';

export interface ChunkOptions {
  maxChunkSize: number;
  overlapSize: number;
  minChunkSize: number;
}

const DEFAULT_OPTIONS: ChunkOptions = {
  maxChunkSize: 8000, // 每个块最大8000字符，增加上下文完整性
  overlapSize: 400,    // 块之间重叠400字符，保持语义连贯
  minChunkSize: 500,   // 最小块大小500字符
};

/**
 * 智能分块 - 按段落分块，保持语义完整性
 */
export function splitTextIntoChunks(
  text: string, 
  options: Partial<ChunkOptions> = {}
): NewDocumentChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks: NewDocumentChunk[] = [];
  
  if (!text || text.trim().length === 0) {
    return chunks;
  }

  // 按段落分割
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  let currentPosition = 0;
  let chunkIndex = 0;
  let chunkStartPosition = 0;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    
    // 如果当前块为空，直接开始新块
    if (!currentChunk) {
      currentChunk = trimmedParagraph;
      chunkStartPosition = currentPosition;
    } 
    // 如果添加这个段落后不超过最大大小，添加到当前块
    else if (currentChunk.length + trimmedParagraph.length + 2 <= opts.maxChunkSize) {
      currentChunk += '\n\n' + trimmedParagraph;
    }
    // 如果超过最大大小，保存当前块并开始新块
    else {
      // 保存当前块
      chunks.push({
        fileId: '', // 将在上传时填入
        chunkIndex,
        content: currentChunk.trim(),
        startPosition: chunkStartPosition,
        endPosition: currentPosition,
      });
      
      chunkIndex++;
      
      // 开始新块，考虑重叠
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(opts.overlapSize / 5)); // 假设平均词长5
      const overlapText = overlapWords.join(' ');
      
      currentChunk = overlapText + '\n\n' + trimmedParagraph;
      chunkStartPosition = currentPosition - overlapText.length;
    }
    
    currentPosition += paragraph.length + 2; // +2 for \n\n
  }

  // 保存最后一个块
  if (currentChunk.trim().length >= opts.minChunkSize) {
    chunks.push({
      fileId: '', // 将在上传时填入
      chunkIndex,
      content: currentChunk.trim(),
      startPosition: chunkStartPosition,
      endPosition: text.length,
    });
  }

  return chunks;
}

/**
 * 简单的关键词匹配检索（后续可升级为向量检索）
 */
export function searchRelevantChunks(
  chunks: NewDocumentChunk[], 
  query: string, 
  maxResults: number = 10
): NewDocumentChunk[] {
  logger.info({ query, maxResults, totalChunks: chunks.length }, '[Text Chunking] RAG检索开始');
  
  if (!query || query.trim().length === 0) {
    logger.info({ maxResults }, '[Text Chunking] 查询为空，返回前N个分块');
    return chunks.slice(0, maxResults);
  }

  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  
  const scoredChunks = chunks.map(chunk => {
    const content = chunk.content.toLowerCase();
    let score = 0;
    let wordMatches = 0;
    
    // 计算关键词匹配分数
    for (const word of queryWords) {
      const occurrences = (content.match(new RegExp(word, 'g')) || []).length;
      score += occurrences * 10;
      wordMatches += occurrences;
    }
    
    // 完整短语匹配加分
    if (content.includes(query.toLowerCase())) {
      score += 50;
    }
    
    return { 
      chunk, 
      score,
      wordMatches,
      hasPhraseMatch: content.includes(query.toLowerCase())
    };
  });

  // 按分数排序并返回前N个
  const filteredChunks = scoredChunks
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > 0)
    .slice(0, maxResults);
    
  const result = filteredChunks.map(item => item.chunk);
  logger.info({ resultCount: result.length }, '[Text Chunking] RAG检索完成');
  
  return result;
}

/**
 * 计算token数量（粗略估算：中文字符*1.5，英文单词*1.3）
 */
export function estimateTokenCount(text: string): number {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const otherChars = text.length - chineseChars - englishWords * 5; // 假设平均英文单词5个字符
  
  return Math.ceil(chineseChars * 1.5 + englishWords * 1.3 + otherChars * 0.5);
}

/**
 * 合并检索到的内容作为AI上下文
 * 优化利用GPT-4o-mini的128K上下文能力
 */
export function buildRAGContext(chunks: NewDocumentChunk[], maxTokens: number = 96000): string {
  if (chunks.length === 0) {
    return '没有找到相关的文档内容。';
  }

  let context = '你是一个专业的投资分析助手，请基于以下文档内容回答用户问题。\n\n';
  let currentTokens = estimateTokenCount(context);

  // 估算系统指令和用户问题的token数（预留空间）
  const reservedTokens = 4000; // 系统指令 + 用户问题 + 回复
  const availableTokens = maxTokens - reservedTokens;

  for (const chunk of chunks) {
    const chunkText = `文档片段 ${chunk.chunkIndex + 1}:\n${chunk.content}\n\n`;
    const chunkTokens = estimateTokenCount(chunkText);
    
    if (currentTokens + chunkTokens > availableTokens) {
      break;
    }
    
    context += chunkText;
    currentTokens += chunkTokens;
  }

  context += `请基于以上文档内容准确回答用户问题。如果文档中没有相关信息，请明确说明。\n\n当前上下文使用了约 ${Math.round(currentTokens/1000)}K tokens。`;
  
  return context;
}