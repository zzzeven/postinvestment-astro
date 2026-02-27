'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileText, Sparkles, Loader2, FolderOpen, Send, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '../../hooks/use-toast';

interface Folder {
  id: string;
  name: string;
}

interface FolderFile {
  id: string;
  name: string;
  fileSize: number;
  uploadedAt: Date;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AnalyzePageProps {
  initialFolders: Folder[];
}

export default function AnalyzePage({ initialFolders }: AnalyzePageProps) {
  const baseUrl = import.meta.env.BASE_URL || '';
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [files, setFiles] = useState<FolderFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 从 URL 获取 folderId 和 folderName
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const folderId = urlParams.get('folderId');
    const folderName = urlParams.get('folderName');
    if (folderId) {
      setSelectedFolderId(folderId);
      setSelectedFolderName(folderName);
      loadFiles(folderId);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, summary]);

  const loadFiles = async (folderId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/folders/${folderId}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      } else {
        throw new Error('加载失败');
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: '无法加载文件夹文件',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFolder = (folder: Folder) => {
    setSelectedFolderId(folder.id);
    setSelectedFolderName(folder.name);
    setSummary('');
    setMessages([]);
    loadFiles(folder.id);
    // 更新 URL
    window.history.pushState({}, '', `?folderId=${folder.id}&folderName=${encodeURIComponent(folder.name)}`);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFolderId) {
      toast({
        title: '错误',
        description: '未指定文件夹',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setSummary('');
    setMessages([]);

    try {
      const response = await fetch(`${baseUrl}/api/ai/analyze-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: selectedFolderId }),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullSummary = '';

      while (true) {
        const { done, value } = await reader!.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content') {
                fullSummary += parsed.data.content;
                setSummary(fullSummary);
              } else if (parsed.type === 'complete') {
                if (parsed.data.analysis) {
                  fullSummary = parsed.data.analysis;
                  setSummary(fullSummary);
                }
                toast({
                  title: '分析完成',
                  description: `已分析 ${files.length} 个文档`,
                });
              } else if (parsed.type === 'error') {
                toast({
                  title: '分析失败',
                  description: parsed.data,
                  variant: 'destructive',
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      toast({
        title: '分析失败',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedFolderId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsChatting(true);

    try {
      const response = await fetch(`${baseUrl}/api/ai/folder-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: selectedFolderId,
          message: userMessage.content,
          history: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || '发送失败');
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
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempMessageId
                      ? {
                          ...m,
                          id: assistantMessageId,
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
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      toast({
        title: '发送失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setIsChatting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    setSummary('');
    setMessages([]);
    setInput('');
    setSelectedFolderId(null);
    setSelectedFolderName(null);
    setFiles([]);
    window.history.pushState({}, '', '/analyze');
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">文件夹分析</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedFolderName || '选择文件夹进行AI分析'}
                </p>
              </div>
            </div>
          </div>

          {summary && (
            <Button variant="outline" size="sm" onClick={startNewChat}>
              <Plus className="h-4 w-4 mr-2" />
              新分析
            </Button>
          )}
        </div>

        {/* 文件夹选择界面 */}
        {!selectedFolderId && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">选择要分析的文件夹</h2>
              <p className="text-sm text-muted-foreground mb-4">
                选择一个包含PDF文档的文件夹进行AI分析
              </p>
              {folders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  还没有文件夹，请先创建文件夹并上传PDF文档
                </p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => handleSelectFolder(folder)}
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <FolderOpen className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{folder.name}</p>
                        <p className="text-xs text-muted-foreground">点击分析此文件夹</p>
                      </div>
                      <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 分析和对话界面 */}
        {selectedFolderId && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 左侧：文件列表 */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      文件列表
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFolderId(null);
                        setSelectedFolderName(null);
                        setFiles([]);
                        window.history.pushState({}, '', '/analyze');
                      }}
                    >
                      切换
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isLoading ? '加载中...' : `共 ${files.length} 个文档`}
                  </p>
                  {files.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      该文件夹中没有文件
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={file.id}
                          className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary/10 rounded text-xs font-medium text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.fileSize)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* 分析按钮 */}
              {!summary && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">操作</h2>
                    <Button
                      onClick={handleStartAnalysis}
                      disabled={isAnalyzing || files.length === 0}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          开始分析
                        </>
                      )}
                    </Button>

                    {files.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        请选择包含文件的文件夹
                      </p>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* 右侧：对话区域 */}
            <div className="lg:col-span-2">
              {/* 分析总结卡片 - 始终显示 */}
              {summary && (
                <Card className="mb-6">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5" />
                      分析总结
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI已完成对文件夹中所有文档的综合分析
                    </p>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap">{summary}</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* 对话区域 */}
              {(summary || messages.length > 0) && (
                <Card className="h-[500px] flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
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

                    {isChatting && (
                      <div className="flex justify-start mb-4">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <span className="animate-bounce">●</span>
                            <span className="animate-bounce delay-100">●</span>
                            <span className="animate-bounce delay-200">●</span>
                          </div>
                        </div>
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
                        placeholder="继续提问..."
                        disabled={isChatting || !summary}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={isChatting || !summary || !input.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    {!summary && (
                      <p className="text-xs text-muted-foreground mt-2">
                        请先点击"开始分析"按钮
                      </p>
                    )}
                  </div>
                </Card>
              )}

              {/* 等待分析 */}
              {!summary && !isAnalyzing && (
                <Card>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      还没有分析结果
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      AI将阅读该文件夹中的所有PDF文档，并进行综合分析和总结
                    </p>
                  </div>
                </Card>
              )}

              {/* 分析中 */}
              {isAnalyzing && (
                <Card>
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">
                      正在分析 {files.length} 个文档...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      这可能需要一些时间，请耐心等待
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
