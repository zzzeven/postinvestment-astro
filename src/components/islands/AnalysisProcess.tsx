'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Loader2, Bot, User, CheckCircle2, XCircle, Coins, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  type: 'start' | 'folder' | 'files' | 'message' | 'status' | 'content' | 'token_estimate' | 'file_progress' | 'complete' | 'error';
  data: any;
  timestamp: Date;
}

interface AnalysisProcessProps {
  messages: Message[];
  isLoading: boolean;
}

export function AnalysisProcess({ messages, isLoading }: AnalysisProcessProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 聚合AI响应内容
  const { aggregatedContent, currentStatus, fileProgress, tokenCount, isStreaming } = useMemo(() => {
    let content = '';
    let status = '';
    let files: Array<{ name: string; current: number; total: number }> = [];
    let tokens = 0;
    let streaming = false;

    messages.forEach((msg) => {
      if (msg.type === 'content') {
        content += msg.data.content;
        tokens = msg.data.tokens;
        streaming = true;
      } else if (msg.type === 'status' && !status) {
        status = msg.data;
      } else if (msg.type === 'file_progress') {
        const existingIndex = files.findIndex(f => f.name === msg.data.fileName);
        if (existingIndex >= 0) {
          files[existingIndex] = msg.data;
        } else {
          files.push(msg.data);
        }
      }
    });

    return { aggregatedContent: content, currentStatus: status, fileProgress: files, tokenCount: tokens, isStreaming: streaming };
  }, [messages]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 计算整体进度
  const overallProgress = useMemo(() => {
    if (fileProgress.length === 0) return 0;
    const totalProgress = fileProgress.reduce((sum, f) => sum + (f.current / f.total), 0);
    return Math.round((totalProgress / fileProgress.length) * 100);
  }, [fileProgress]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI 交互过程
          </div>
          {(isLoading || isStreaming) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>处理中</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-4">
          <div className="space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">点击&ldquo;开始分析&rdquo;后，这里将显示与AI的交互过程</p>
              </div>
            ) : (
              <>
                {/* 初始化信息 - 紧凑展示 */}
                {messages.some(m => m.type === 'start' || m.type === 'folder' || m.type === 'files') && (
                  <CollapsibleSection
                    id="init"
                    title="初始化"
                    expandedSections={expandedSections}
                    onToggle={toggleSection}
                  >
                    <div className="space-y-1 text-xs">
                      {messages.filter(m => ['start', 'folder', 'files'].includes(m.type)).map((msg) => {
                        if (msg.type === 'folder') {
                          return (
                            <div key={msg.id} className="flex items-center gap-2">
                              <span className="text-muted-foreground">文件夹:</span>
                              <span className="font-medium">{msg.data.name}</span>
                            </div>
                          );
                        } else if (msg.type === 'files') {
                          return (
                            <div key={msg.id} className="flex items-center gap-2">
                              <FileText className="h-3 w-3 text-blue-500" />
                              <span className="text-muted-foreground">找到 {msg.data.count} 个文件</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </CollapsibleSection>
                )}

                {/* Token估算 */}
                {messages.some(m => m.type === 'token_estimate') && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-xs">
                    <Coins className="h-3 w-3 text-yellow-500" />
                    <span className="text-muted-foreground">估算输入:</span>
                    <Badge variant="outline" className="text-xs">
                      {messages.find(m => m.type === 'token_estimate')?.data.inputTokens.toLocaleString()} tokens
                    </Badge>
                  </div>
                )}

                {/* 文件分析进度 */}
                {fileProgress.length > 0 && (
                  <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400">
                        <FileText className="h-3 w-3" />
                        分析文件进度
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {overallProgress}%
                      </Badge>
                    </div>
                    <Progress value={overallProgress} className="h-2 mb-2" />
                    <div className="space-y-1">
                      {fileProgress.slice(-3).map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                          <span className="text-muted-foreground truncate">{file.name}</span>
                          <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">
                            {file.current}/{file.total} 页
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 当前状态（仅在非streaming时显示） */}
                {currentStatus && !isStreaming && (
                  <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    <span>{currentStatus}</span>
                  </div>
                )}

                {/* AI响应内容 */}
                {aggregatedContent && (
                  <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-400">
                        <Bot className="h-3 w-3" />
                        AI 分析结果
                      </div>
                      <div className="flex items-center gap-2">
                        {isStreaming && (
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-pulse" />
                            <div className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-pulse delay-75" />
                            <div className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-pulse delay-150" />
                          </div>
                        )}
                        <Badge variant="secondary" className="text-xs h-5">
                          {tokenCount.toLocaleString()} tokens
                        </Badge>
                      </div>
                    </div>
                    <div className={cn(
                      "text-xs whitespace-pre-wrap break-words transition-all duration-200",
                      isStreaming ? "max-h-40 overflow-y-auto" : "max-h-60 overflow-y-auto"
                    )}>
                      {aggregatedContent}
                    </div>
                  </div>
                )}

                {/* 完成信息 */}
                {messages.some(m => m.type === 'complete') && (
                  <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      分析完成
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(() => {
                        const completeMsg = messages.find(m => m.type === 'complete');
                        if (!completeMsg) return null;
                        const { tokens, price } = completeMsg.data;
                        return (
                          <>
                            <div>
                              <span className="text-muted-foreground">输入:</span>{' '}
                              <span className="font-medium">{tokens.input.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">输出:</span>{' '}
                              <span className="font-medium">{tokens.output.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">总计:</span>{' '}
                              <span className="font-medium">{tokens.total.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">费用:</span>{' '}
                              <span className="font-medium text-green-600 dark:text-green-400">
                                ${price.total}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 错误信息 */}
                {messages.some(m => m.type === 'error') && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                        发生错误
                      </div>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {messages.find(m => m.type === 'error')?.data}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// 可折叠的区块组件
function CollapsibleSection({
  id,
  title,
  expandedSections,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  expandedSections: Set<string>;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  const isExpanded = expandedSections.has(id);

  return (
    <div className="px-3 py-2 bg-muted/50 rounded-lg">
      <button
        onClick={() => onToggle(id)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-xs font-medium">{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  );
}
