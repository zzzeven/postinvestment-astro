export interface ContextConfig {
  // 上下文长度配置
  maxTokens: number;           // 最大token数
  reservedTokens: number;      // 预留token数（系统指令+用户问题）
  
  // 分块配置
  maxChunkSize: number;        // 最大块大小（字符）
  overlapSize: number;         // 块重叠大小
  minChunkSize: number;        // 最小块大小
  
  // 检索配置
  maxRelevantChunks: number;   // 最大相关块数
}

// GPT-4o-mini 优化配置 (32K-96K tokens)
export const GPT4OMINI_CONFIG: ContextConfig = {
  maxTokens: 96000,           // 96K tokens，留32K给回复
  reservedTokens: 4000,       // 4K tokens预留
  maxChunkSize: 8000,         // 8K字符/块
  overlapSize: 400,           // 400字符重叠
  minChunkSize: 500,          // 500字符最小
  maxRelevantChunks: 12,      // 12个相关块
};

// GPT-4Turbo 配置 (更保守)
export const GPT4TURBO_CONFIG: ContextConfig = {
  maxTokens: 64000,           // 64K tokens
  reservedTokens: 4000,
  maxChunkSize: 6000,
  overlapSize: 300,
  minChunkSize: 400,
  maxRelevantChunks: 10,
};

// Claude-3 配置
export const CLAUDE3_CONFIG: ContextConfig = {
  maxTokens: 80000,           // Claude-3 100K上下文
  reservedTokens: 5000,
  maxChunkSize: 7000,
  overlapSize: 350,
  minChunkSize: 450,
  maxRelevantChunks: 11,
};

// 根据模型获取配置
export function getContextConfig(model: string): ContextConfig {
  if (model.includes('gpt-4o-mini')) {
    return GPT4OMINI_CONFIG;
  } else if (model.includes('gpt-4')) {
    return GPT4TURBO_CONFIG;
  } else if (model.includes('claude-3')) {
    return CLAUDE3_CONFIG;
  }
  
  // 默认配置
  return GPT4OMINI_CONFIG;
}

// 自适应配置：根据文档大小调整
export function getAdaptiveContextConfig(
  model: string, 
  totalTextLength: number
): ContextConfig {
  const baseConfig = getContextConfig(model);
  
  // 对于长文档，可以适当增加块大小
  if (totalTextLength > 100000) { // 10万字符以上
    return {
      ...baseConfig,
      maxChunkSize: Math.min(baseConfig.maxChunkSize * 1.5, 12000),
      overlapSize: Math.min(baseConfig.overlapSize * 1.2, 600),
    };
  }
  
  // 对于短文档，使用较小块以获得更精确匹配
  if (totalTextLength < 10000) { // 1万字符以下
    return {
      ...baseConfig,
      maxChunkSize: Math.max(baseConfig.maxChunkSize * 0.7, 2000),
      overlapSize: Math.max(baseConfig.overlapSize * 0.8, 200),
    };
  }
  
  return baseConfig;
}