'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '../../hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  fileId: string;
  fileName: string;
}

export function ChatInterface({ fileId, fileName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    console.log('[Chat Frontend] ========== 发送消息 ==========');
    console.log('[Chat Frontend] 文件ID:', fileId);
    console.log('[Chat Frontend] 用户消息:', userMessage);
    console.log('[Chat Frontend] 消息长度:', userMessage.length, '字符');

    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      console.log('[Chat Frontend] 🔄 发送请求到 /api/ai/chat');
      const fetchStartTime = Date.now();

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          message: userMessage,
        }),
      });

      const fetchEndTime = Date.now();
      console.log('[Chat Frontend] ✅ 收到响应，耗时:', (fetchEndTime - fetchStartTime), 'ms');
      console.log('[Chat Frontend] 响应状态:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('[Chat Frontend] ❌ 请求失败:', error);
        throw new Error(error.error || '发送失败');
      }

      // 处理流式响应
      console.log('[Chat Frontend] ========== 开始接收流式响应 ==========');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let chunkCount = 0;
      const streamStartTime = Date.now();

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            const streamEndTime = Date.now();
            console.log('[Chat Frontend] ========== 流式接收完成 ==========');
            console.log('[Chat Frontend] 📊 统计:');
            console.log('[Chat Frontend] - 总块数:', chunkCount);
            console.log('[Chat Frontend] - 总字符数:', assistantMessage.length);
            console.log('[Chat Frontend] - 总耗时:', (streamEndTime - streamStartTime), 'ms');
            console.log('[Chat Frontend] - 平均速度:', Math.round(assistantMessage.length / ((streamEndTime - streamStartTime) / 1000)), '字符/秒');
            console.log('[Chat Frontend] 📝 AI 完整回复:');
            console.log('--- START AI RESPONSE ---');
            console.log(assistantMessage);
            console.log('--- END AI RESPONSE ---');
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                console.log('[Chat Frontend] ✅ 收到 [DONE] 信号');
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.chunk) {
                  chunkCount++;
                  assistantMessage += parsed.chunk;

                  if (chunkCount === 1) {
                    const firstChunkTime = Date.now();
                    console.log('[Chat Frontend] ✅ 收到首个响应块，耗时:', (firstChunkTime - streamStartTime), 'ms');
                    console.log('[Chat Frontend] 首个块内容:', parsed.chunk);
                  }

                  // 每10个块打印一次进度
                  if (chunkCount % 10 === 0) {
                    console.log('[Chat Frontend] 📊 进度: 已接收', chunkCount, '个块，当前长度:', assistantMessage.length, '字符');
                  }

                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: 'assistant',
                      content: assistantMessage,
                    };
                    return newMessages;
                  });
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }

      console.log('[Chat Frontend] ========== 消息处理完成 ==========');
    } catch (error) {
      console.error('[Chat Frontend] ❌ 发送消息错误:', error);
      toast({
        title: '发送失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
      // 移除用户消息
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="border-b p-4">
        <h2 className="font-semibold">AI 分析 - {fileName}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          基于文档内容进行智能问答
        </p>
      </div>

      {/* 消息列表 */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                开始向AI提问关于这个文档的问题
              </p>
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p>例如：</p>
                <p className="text-xs">• 这份文档的主要结论是什么？</p>
                <p className="text-xs">• 文档中提到的关键风险有哪些？</p>
                <p className="text-xs">• 总结一下文档的核心内容</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
                <Card
                  className={`max-w-[80%] p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              </div>
              <Card className="bg-muted p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-200" />
                </div>
              </Card>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="border-b p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入问题..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
