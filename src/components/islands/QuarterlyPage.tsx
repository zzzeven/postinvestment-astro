'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Clock,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Loader2,
  Terminal,
  X,
  Check,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { useToast } from '../../hooks/use-toast';

interface PdfFile {
  id: string;
  name: string;
  blobUrl: string;
  fullContent: string | null;
  parseStatus: string | null;
}

type BatchStatus = 'idle' | 'running' | 'paused' | 'completed' | 'stopped';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export default function QuarterlyPage() {
  const baseUrl = import.meta.env.BASE_URL || '';
  // 单文件解析状态
  const [file, setFile] = useState<File | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskId, setTaskId] = useState<string>('');
  const [polling, setPolling] = useState(false);

  // 批量解析状态
  const [batchStatus, setBatchStatus] = useState<BatchStatus>('idle');
  const [showBatchPanel, setShowBatchPanel] = useState(true);
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [dbFiles, setDbFiles] = useState<PdfFile[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const shouldStopRef = useRef(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  // 自动滚动日志到底部
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // 添加日志
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // 单文件解析
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const supportedExts = ['.docx', '.pdf', '.pptx', '.xlsx', '.txt', '.md'];
    const fileExt = '.' + selectedFile.name.split('.').pop()?.toLowerCase();

    if (!supportedExts.includes(fileExt)) {
      toast({
        title: '文件格式错误',
        description: `支持格式：${supportedExts.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    await createParseTask(selectedFile);
  };

  const createParseTask = async (docFile: File) => {
    setIsProcessing(true);
    setMarkdownContent('');
    setTaskId('');

    try {
      const formData = new FormData();
      formData.append('file', docFile);

      const response = await fetch(`${baseUrl}/api/quarterly/pdf-task`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`任务创建失败: ${errorText}`);
      }

      const data = await response.json();
      setTaskId(data.taskId);
      toast({
        title: '任务已创建',
        description: '正在后台处理文档，请稍候...',
      });

      startPolling(data.taskId);

    } catch (error) {
      console.error('[前端] 创建任务失败:', error);
      toast({
        title: '创建任务失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const startPolling = async (currentTaskId: string) => {
    setPolling(true);
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${baseUrl}/api/quarterly/pdf-task?taskId=${currentTaskId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          clearInterval(pollInterval);
          setPolling(false);
          setIsProcessing(false);

          if (data.result?.markdown) {
            setMarkdownContent(data.result.markdown);
          }

          toast({
            title: '文档解析成功',
            description: data.result?.message || '解析完成',
          });
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          setPolling(false);
          setIsProcessing(false);

          toast({
            title: '文档解析失败',
            description: data.error || '未知错误',
            variant: 'destructive',
          });
        }

      } catch (error) {
        console.error('[前端] 查询任务状态失败:', error);
      }
    }, 2000);
  };

  // 获取PDF文件列表
  const fetchPdfFiles = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/quarterly/batch-files`);
      const data = await response.json();
      setPdfFiles(data.files || []);
      return data.files || [];
    } catch (error) {
      console.error('[前端] 获取文件列表失败:', error);
      return [];
    }
  };

  // 处理单个文件
  const processFile = async (file: PdfFile, index: number, totalFiles: number): Promise<boolean> => {
    if (shouldStopRef.current) return false;

    setCurrentFileIndex(index);
    setCurrentFileName(file.name);
    addLog(`[${index + 1}/${totalFiles}] 开始处理: ${file.name}`, 'info');

    try {
      addLog(`[${index + 1}/${totalFiles}] 创建解析任务: ${file.name}`, 'info');

      // 创建解析任务
      const createResponse = await fetch(`${baseUrl}/api/quarterly/parse-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: file.id }),
      });

      if (!createResponse.ok) {
        throw new Error(`创建任务失败: ${createResponse.status}`);
      }

      const createData = await createResponse.json();
      const newTaskId = createData.taskId;
      addLog(`[${index + 1}/${totalFiles}] 任务ID: ${newTaskId}`, 'info');

      // 轮询任务状态
      let success = false;
      let lastMessage = '';

      while (true) {
        if (shouldStopRef.current) {
          throw new Error('任务已停止');
        }

        // 检查是否暂停
        while (batchStatus === 'paused') {
          if (shouldStopRef.current) {
            throw new Error('任务已停止');
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        const pollResponse = await fetch(`${baseUrl}/api/quarterly/parse-stream?taskId=${newTaskId}`);
        if (!pollResponse.ok) {
          throw new Error(`查询任务状态失败: ${pollResponse.status}`);
        }

        const pollData = await pollResponse.json();

        // 更新日志
        if (pollData.message && pollData.message !== lastMessage) {
          lastMessage = pollData.message;
          addLog(`[${index + 1}/${totalFiles}] ${lastMessage}`, 'info');
        }

        // 显示解析结果的前几行
        if (pollData.parseResult) {
          addLog(`[${index + 1}/${totalFiles}] 解析结果预览:`, 'info');
          const previewLines = pollData.parseResult.split('\n').slice(0, 3);
          previewLines.forEach((line: string) => {
            addLog(`  ${line}`, 'info');
          });
          if (pollData.parseResult.split('\n').length > 3) {
            addLog(`  ... (共 ${pollData.parseResult.split('\n').length} 行)`, 'info');
          }
        }

        if (pollData.status === 'completed') {
          success = true;
          setCompletedCount(prev => prev + 1);
          addLog(`[${index + 1}/${totalFiles}] ✓ ${file.name} - 成功 (${pollData.markdownLength} 字符)`, 'success');
          break;
        } else if (pollData.status === 'failed') {
          throw new Error(pollData.error || '解析失败');
        }

        // 等待2秒再查询
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return success;
    } catch (error) {
      setFailedCount(prev => prev + 1);
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      addLog(`[${index + 1}/${totalFiles}] ✗ ${file.name} - 异常: ${errorMsg}`, 'error');
      return false;
    }
  };

  // 批量处理所有文件
  const processAllFiles = async (files: PdfFile[], startIndex = 0) => {
    for (let i = startIndex; i < files.length; i++) {
      if (shouldStopRef.current) {
        addLog('任务已停止', 'warning');
        setBatchStatus('stopped');
        return;
      }

      // 等待一小段时间检查是否暂停
      while (batchStatus === 'paused') {
        if (shouldStopRef.current) {
          addLog('任务已停止', 'warning');
          setBatchStatus('stopped');
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await processFile(files[i], i, files.length);
    }

    setBatchStatus('completed');
    addLog('=== 所有文件处理完成 ===', 'success');
    setCurrentFileName('');
  };

  // 启动批量解析
  const handleStartBatch = async () => {
    const files = await fetchPdfFiles();
    if (files.length === 0) {
      toast({
        title: '没有PDF文件',
        description: '数据库中没有找到PDF文件',
        variant: 'destructive',
      });
      return;
    }

    setLogs([]);
    setCompletedCount(0);
    setFailedCount(0);
    setCurrentFileIndex(0);
    shouldStopRef.current = false;
    setBatchStatus('running');
    addLog(`=== 开始批量解析，共 ${files.length} 个PDF文件 ===`, 'info');

    processAllFiles(files);
  };

  // 暂停批量解析
  const handlePauseBatch = () => {
    setBatchStatus('paused');
    addLog('任务已暂停', 'warning');
  };

  // 继续批量解析
  const handleResumeBatch = () => {
    shouldStopRef.current = false;
    setBatchStatus('running');
    addLog('任务已继续', 'info');
  };

  // 停止批量解析
  const handleStopBatch = () => {
    shouldStopRef.current = true;
    addLog('正在停止任务...', 'warning');
  };

  // 清空日志
  const handleClearLogs = () => {
    setLogs([]);
  };

  // 打开文件选择对话框
  const handleOpenFileDialog = async () => {
    const files = await fetchPdfFiles();
    setDbFiles(files);
    setSelectedFileIds([]);
    setShowFileDialog(true);
  };

  // 处理文件选择
  const handleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // 全选/取消全选
  const handleToggleAll = () => {
    if (selectedFileIds.length === dbFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(dbFiles.map(f => f.id));
    }
  };

  // 关闭文件选择对话框
  const handleCloseFileDialog = () => {
    setShowFileDialog(false);
  };

  // 确认选择文件并启动解析
  const handleConfirmFileSelection = async () => {
    if (selectedFileIds.length === 0) {
      toast({
        title: '未选择文件',
        description: '请至少选择一个PDF文件',
        variant: 'destructive',
      });
      return;
    }

    const selectedFiles = dbFiles.filter(f => selectedFileIds.includes(f.id));

    setShowFileDialog(false);
    setPdfFiles(selectedFiles);
    setLogs([]);
    setCompletedCount(0);
    setFailedCount(0);
    setCurrentFileIndex(0);
    shouldStopRef.current = false;
    setBatchStatus('running');
    addLog(`=== 开始批量解析，共 ${selectedFiles.length} 个PDF文件 ===`, 'info');

    for (let i = 0; i < selectedFiles.length; i++) {
      if (shouldStopRef.current) {
        addLog('任务已停止', 'warning');
        setBatchStatus('stopped');
        return;
      }

      while (batchStatus === 'paused') {
        if (shouldStopRef.current) {
          addLog('任务已停止', 'warning');
          setBatchStatus('stopped');
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await processFile(selectedFiles[i], i, selectedFiles.length);
    }

    setBatchStatus('completed');
    addLog('=== 所有文件处理完成 ===', 'success');
    setCurrentFileName('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">文档解析</h1>
        <p className="text-muted-foreground">
          上传文档（支持 PDF/DOCX/PPTX/XLSX/TXT/MD），自动解析为 Markdown 格式
        </p>
      </div>

      {/* 批量解析面板 */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h2 className="text-xl font-semibold">批量解析数据库PDF</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBatchPanel(!showBatchPanel)}
            >
              {showBatchPanel ? '收起' : '展开'}
            </Button>
          </div>
          {showBatchPanel && (
            <div className="space-y-4">
              {/* 状态显示 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {batchStatus === 'running' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                    {batchStatus === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {batchStatus === 'stopped' && <Square className="h-5 w-5 text-gray-600" />}
                    {batchStatus === 'paused' && <Pause className="h-5 w-5 text-yellow-600" />}
                    {batchStatus === 'idle' && <Clock className="h-5 w-5 text-gray-400" />}
                    <span className="font-medium">
                      状态: {batchStatus === 'idle' ? '空闲' : batchStatus === 'running' ? '运行中' : batchStatus === 'paused' ? '已暂停' : batchStatus === 'completed' ? '已完成' : '已停止'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    进度: {completedCount + failedCount} / {pdfFiles.length > 0 ? pdfFiles.length : '-'}
                    {failedCount > 0 && ` (${failedCount} 失败)`}
                  </div>
                </div>

                {/* 进度条 */}
                {pdfFiles.length > 0 && (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${((completedCount + failedCount) / pdfFiles.length) * 100}%` }}
                    />
                  </div>
                )}

                {/* 当前处理文件 */}
                {currentFileName && (
                  <div className="text-sm text-muted-foreground mb-4">
                    正在处理: {currentFileName}
                  </div>
                )}

                {/* 控制按钮 */}
                <div className="flex gap-2 mb-4">
                  {batchStatus === 'idle' || batchStatus === 'completed' || batchStatus === 'stopped' ? (
                    <Button onClick={handleOpenFileDialog} size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      选择PDF文件
                    </Button>
                  ) : (
                    <>
                      {batchStatus === 'running' && (
                        <Button onClick={handlePauseBatch} variant="secondary" size="sm">
                          <Pause className="h-4 w-4 mr-1" />
                          暂停
                        </Button>
                      )}
                      {batchStatus === 'paused' && (
                        <Button onClick={handleResumeBatch} variant="secondary" size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          继续
                        </Button>
                      )}
                      <Button onClick={handleStopBatch} variant="destructive" size="sm">
                        <Square className="h-4 w-4 mr-1" />
                        停止
                      </Button>
                    </>
                  )}
                </div>

                {/* 日志窗口 */}
                <div className="border rounded-lg bg-slate-950 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Terminal className="h-4 w-4" />
                      <span>实时日志</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleClearLogs} className="h-6 text-xs">
                      清空
                    </Button>
                  </div>
                  <div className="h-48 overflow-y-auto text-xs font-mono space-y-1">
                    {logs.length === 0 ? (
                      <div className="text-slate-500">等待启动...</div>
                    ) : (
                      logs.map((log, idx) => (
                        <div key={idx} className={
                          log.type === 'success' ? 'text-green-400' :
                          log.type === 'error' ? 'text-red-400' :
                          log.type === 'warning' ? 'text-yellow-400' :
                          'text-slate-300'
                        }>
                          <span className="text-slate-500">[{log.timestamp}]</span> {log.message}
                        </div>
                      ))
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              </div>

              {/* 说明文字 */}
              <div className="text-sm text-muted-foreground">
                <p>批量解析会处理您选择的数据库中的PDF文件。</p>
                <p className="mt-1">前端驱动模式，避免Vercel超时，支持暂停/继续/停止。</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 文件选择对话框 */}
      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              选择PDF文件
            </DialogTitle>
            <DialogDescription>
              选择要批量解析的PDF文件（支持多选）
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {dbFiles.length === 0 ? (
              <div className="text-center text-sm text-slate-500 py-8">
                数据库中没有PDF文件
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <Button variant="outline" size="sm" onClick={handleToggleAll}>
                    {selectedFileIds.length === dbFiles.length ? '取消全选' : '全选'}
                  </Button>
                  <div className="text-sm text-slate-600">
                    已选择 {selectedFileIds.length} / {dbFiles.length} 个文件
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto border rounded-lg">
                  {dbFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleFileSelection(file.id)}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        selectedFileIds.includes(file.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-300'
                      }`}>
                        {selectedFileIds.includes(file.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <span className="flex-1 text-sm truncate">{file.name}</span>
                      {file.parseStatus === 'completed' && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">已解析</span>
                      )}
                      {file.parseStatus === 'failed' && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">失败</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseFileDialog}>
              <X className="h-4 w-4 mr-1" />
              取消
            </Button>
            <Button onClick={handleConfirmFileSelection} disabled={selectedFileIds.length === 0}>
              <Play className="h-4 w-4 mr-1" />
              开始解析
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 单文件上传区域 */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5" />
            单文件解析
          </h2>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".docx,.pdf,.pptx,.xlsx,.txt,.md"
              onChange={handleFileSelect}
              className="hidden"
              id="docx-upload"
              disabled={isProcessing}
            />
            <label htmlFor="docx-upload">
              <Button variant="default" size="lg" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    上传文档
                  </>
                )}
              </Button>
            </label>
            {file && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          {/* 任务状态提示 */}
          {taskId && (isProcessing || polling) && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-900 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  任务ID: {taskId}
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                文档正在后台处理中，这可能需要几分钟时间，请耐心等待...
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Markdown 内容展示 */}
      {markdownContent && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              Markdown 内容
            </h2>
            <div className="prose prose-slate max-w-none whitespace-pre-wrap">
              {markdownContent}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
