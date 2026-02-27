'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, FileText, Sparkles, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface File {
  id: string;
  name: string;
  processedForEmbedding: boolean;
}

export default function ChatPage() {
  const baseUrl = import.meta.env.BASE_URL || '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [availableFiles, setAvailableFiles] = useState<File[]>([]);
  const [showSourceList, setShowSourceList] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchFiles();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('fileId');
    if (fileId) {
      setSelectedFiles([fileId]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/files?forEmbedding=true`);
      if (response.ok) {
        const data = await response.json();
        setAvailableFiles(data.files || []);
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || selectedFiles.length === 0) {
      if (selectedFiles.length === 0) {
        alert('请先选择要对话的文档');
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationId,
          fileIds: selectedFiles,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '发送失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const tempMessageId = `assistant-temp-${Date.now()}`;
      let assistantContent = '';
      let assistantMessageId = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempMessageId
                    ? { ...m, id: assistantMessageId }
                    : m
                )
              );
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.done) {
                assistantMessageId = parsed.messageId;
                setConversationId(parsed.conversationId);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempMessageId
                      ? {
                          ...m,
                          id: assistantMessageId,
                          sources: parsed.sources,
                        }
                      : m
                  )
                );
                break;
              }

              if (parsed.chunk) {
                assistantContent += parsed.chunk;
                setMessages((prev) => {
                  const exists = prev.some((m) => m.id === tempMessageId);
                  if (exists) {
                    return prev.map((m) =>
                      m.id === tempMessageId
                        ? { ...m, content: assistantContent }
                        : m
                    );
                  }
                  return [
                    ...prev,
                    {
                      id: tempMessageId,
                      role: 'assistant',
                      content: assistantContent,
                    },
                  ];
                });
              }
            } catch (e) {
              // Ignore JSON parse errors for partial chunks
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('发送消息失败:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: '抱歉，发生了错误。请稍后再试。',
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setSelectedFiles([]);
    setInput('');
  };

  const toggleFile = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">智能对话</h1>
              <p className="text-sm text-muted-foreground">
                基于文档内容的 AI 对话
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={startNewChat}>
            <Plus className="h-4 w-4 mr-2" />
            新对话
          </Button>
        </div>

        {/* 文件选择 */}
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">选择文档</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSourceList(!showSourceList)}
              >
                {showSourceList ? '收起' : '展开'}
              </Button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedFiles.map((fileId) => {
                  const file = availableFiles.find((f) => f.id === fileId);
                  return file ? (
                    <Badge key={fileId} variant="secondary" className="cursor-pointer">
                      {file.name}
                      <button
                        onClick={() => toggleFile(fileId)}
                        className="ml-2 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            {showSourceList && (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {availableFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无可用文档</p>
                ) : (
                  availableFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        selectedFiles.includes(file.id)
                          ? 'bg-primary/10'
                          : 'hover:bg-muted'
                      } ${!file.processedForEmbedding ? 'opacity-50' : ''}`}
                      onClick={() =>
                        file.processedForEmbedding && toggleFile(file.id)
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => toggleFile(file.id)}
                        disabled={!file.processedForEmbedding}
                        className="h-4 w-4"
                      />
                      <FileText className="h-4 w-4" />
                      <span className="flex-1 text-sm truncate">{file.name}</span>
                      {!file.processedForEmbedding && (
                        <Badge variant="outline" className="text-xs">
                          未处理
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Card>

        {/* 对话区域 */}
        <Card className="h-[500px] flex flex-col">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  选择文档后开始对话
                </p>
              </div>
            ) : (
              <div className="space-y-4" ref={scrollRef}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce delay-100">●</span>
                        <span className="animate-bounce delay-200">●</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* 输入区域 */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入你的问题..."
                disabled={isLoading || selectedFiles.length === 0}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || selectedFiles.length === 0 || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {selectedFiles.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                请先选择要对话的文档
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
