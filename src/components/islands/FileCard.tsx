
import { useState, useEffect } from 'react';
import { File as FileIcon, Calendar, FileText, Sparkles, Loader2, CheckCircle2, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { File } from '../../db/schema';
import { formatFileSize, formatDate } from '../../lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useToast } from '../../hooks/use-toast';

interface FileCardProps {
  file: File;
  onDelete?: (fileId: string) => void;
  onProcessed?: (fileId: string) => void;
}

type ParseStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

interface ParseTaskStatus {
  status: ParseStatus;
  queuePosition?: number;
  currentProcessing?: {
    fileName: string;
  };
  error?: string;
}

export function FileCard({ file, onDelete, onProcessed }: FileCardProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<'idle' | 'chunking' | 'embedding' | 'done'>('idle');
  const [parseStatus, setParseStatus] = useState<ParseTaskStatus>({ status: 'idle' });

  // 判断是否有内容可以处理
  const hasProcessableContent = !!(file.fullContent || file.contentPreview);
  // 使用预览内容
  const isUsingPreview = !file.fullContent && !!file.contentPreview;
  // 是否需要完整解析
  const needsFullParsing = !file.fullContent && file.mimeType?.includes('pdf');

  // 轮询解析状态（仅当没有 fullContent 时）
  useEffect(() => {
    if (!needsFullParsing) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/parse/status?fileId=${file.id}`);
        if (response.ok) {
          const data = await response.json();
          setParseStatus({
            status: data.status,
            queuePosition: data.queuePosition,
            currentProcessing: data.currentProcessing,
            error: data.error,
          });

          // 如果完成，刷新文件列表
          if (data.status === 'completed' && !file.fullContent) {
            onProcessed?.(file.id);
          }
        }
      } catch (error) {
        console.error('[FileCard] 查询解析状态失败:', error);
      }
    };

    // 立即检查一次
    checkStatus();

    // 每 5 秒检查一次
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, [file.id, file.fullContent, needsFullParsing, onProcessed]);

  const handleProcessEmbedding = async () => {
    if (!hasProcessableContent) {
      toast({
        title: '无法处理',
        description: '文件内容为空，请先上传文件',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep('chunking');

    try {
      const response = await fetch('/api/embeddings/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: file.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '处理失败');
      }

      setProcessingStep('embedding');

      // 模拟延迟显示进度
      await new Promise(resolve => setTimeout(resolve, 500));

      const result = await response.json();

      setProcessingStep('done');

      toast({
        title: '处理成功',
        description: isUsingPreview
          ? `使用预览内容创建 ${result.chunksCreated} 个文档块，使用 ${result.totalTokensUsed} tokens`
          : `已创建 ${result.chunksCreated} 个文档块，使用 ${result.totalTokensUsed} tokens`,
      });

      onProcessed?.(file.id);

      // 延迟重置状态，让用户看到完成状态
      setTimeout(() => {
        setProcessingStep('idle');
      }, 2000);
    } catch (error) {
      setProcessingStep('idle');
      toast({
        title: '处理失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryParse = async () => {
    try {
      const response = await fetch('/api/parse/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: file.id }),
      });

      if (!response.ok) {
        throw new Error('重试失败');
      }

      toast({
        title: '已重新加入队列',
        description: '解析任务将在后台处理',
      });

      // 刷新状态
      setParseStatus({ status: 'pending' });
    } catch (error) {
      toast({
        title: '重试失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  const handleChat = () => {
    window.location.href = `/chat?fileId=${file.id}`;
  };

  // 渲染解析状态显示
  const renderParseStatus = () => {
    if (parseStatus.status === 'idle' || parseStatus.status === 'completed' || file.fullContent) {
      return null;
    }

    if (parseStatus.status === 'pending') {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {parseStatus.queuePosition && parseStatus.queuePosition > 0
                ? `排队中，前方还有 ${parseStatus.queuePosition} 个文件`
                : '排队中，即将开始解析'}
            </span>
          </div>
          {parseStatus.currentProcessing && (
            <div className="text-xs text-muted-foreground">
              正在处理: {parseStatus.currentProcessing.fileName}
            </div>
          )}
          <Progress value={10} className="h-1" />
        </div>
      );
    }

    if (parseStatus.status === 'processing') {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>正在解析 PDF 文件...</span>
          </div>
          <Progress value={50} className="h-1" />
        </div>
      );
    }

    if (parseStatus.status === 'failed') {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>解析失败</span>
          </div>
          <div className="text-xs text-muted-foreground">{parseStatus.error?.substring(0, 50)}</div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={handleRetryParse}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            重试
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader className="pb-2 md:pb-3 px-3 md:px-6">
        <div className="flex items-start gap-2 md:gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" />
            <CardTitle
              className="text-xs md:text-sm truncate hover:text-primary cursor-pointer transition-colors"
              onClick={() => {
                const previewUrl = `/api/files/${file.id}/download`;
                window.open(previewUrl, '_blank', 'noopener,noreferrer');
              }}
              title="点击预览文档"
            >
              {file.name}
            </CardTitle>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {file.processedForEmbedding && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                <span className="hidden sm:inline">已处理</span>
                <span className="sm:hidden">OK</span>
              </Badge>
            )}
            {isUsingPreview && !file.processedForEmbedding && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                <AlertCircle className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                <span className="hidden sm:inline">预览模式</span>
                <span className="sm:hidden">预览</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1.5 md:space-y-2 pb-2 md:pb-3 px-3 md:px-6 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileIcon className="h-3 w-3" />
          <span>{formatFileSize(Number(file.fileSize))}</span>
        </div>

        {file.chunkCount && file.chunkCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>{file.chunkCount} 个文档块</span>
          </div>
        )}

        {file.contentPreview && (
          <p className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-3 bg-muted/50 p-2 rounded-md">
            {file.contentPreview}
          </p>
        )}

        {/* 解析状态显示 */}
        {renderParseStatus()}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{file.uploadedAt ? formatDate(new Date(file.uploadedAt)) : '未知日期'}</span>
        </div>
      </CardContent>

      <CardFooter className="gap-2 flex-wrap pt-2 px-3 md:px-6 mt-auto">
        {!file.processedForEmbedding ? (
          <Button
            size="sm"
            className="flex-1 min-w-[100px] md:min-w-[120px] min-h-[44px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm"
            onClick={handleProcessEmbedding}
            disabled={isProcessing || !hasProcessableContent || parseStatus.status === 'processing' || parseStatus.status === 'pending'}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 md:mr-2 animate-spin" />
                {processingStep === 'chunking' && '分块中...'}
                {processingStep === 'embedding' && '生成向量...'}
                {processingStep === 'done' && '完成!'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5 md:mr-2" />
                {parseStatus.status === 'pending' || parseStatus.status === 'processing' ? '解析中...' : '处理文档'}
              </>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            className="flex-1 min-w-[100px] md:min-w-[120px] min-h-[44px] bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm"
            onClick={handleChat}
          >
            <Sparkles className="h-4 w-4 mr-1.5 md:mr-2" />
            智能对话
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="min-h-[44px] min-w-[44px] px-3 md:px-4"
          onClick={() => {
            const previewUrl = `/api/files/${file.id}/download`;
            window.open(previewUrl, '_blank', 'noopener,noreferrer');
          }}
        >
          <span className="hidden sm:inline">预览</span>
          <FileIcon className="h-4 w-4 sm:hidden" />
        </Button>
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[44px] min-w-[44px] px-3 md:px-4"
            onClick={() => onDelete(file.id)}
          >
            <span className="hidden sm:inline">删除</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:hidden"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
