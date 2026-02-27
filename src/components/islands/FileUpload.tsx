
import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { Progress } from '../ui/progress';
import { UploadProgressDialog, UploadFile } from './UploadProgressDialog';

// 验证文件类型是否支持（PDF或Excel）
function isSupportedFile(file: File): boolean {
  const pdfTypes = ['application/pdf'];
  const excelTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
  ];
  const pdfExtensions = ['.pdf'];
  const excelExtensions = ['.xls', '.xlsx', '.xlsm', '.xlsb'];

  const fileName = file.name.toLowerCase();

  const isPDF = pdfTypes.includes(file.type) || pdfExtensions.some(ext => fileName.endsWith(ext));
  const isExcel = excelTypes.includes(file.type) || excelExtensions.some(ext => fileName.endsWith(ext));

  return isPDF || isExcel;
}

// 获取文件类型图标颜色
function getFileColor(file: File): string {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
    return 'text-red-500';
  }
  if (['.xls', '.xlsx', '.xlsm', '.xlsb'].some(ext => fileName.endsWith(ext))) {
    return 'text-green-500';
  }
  return 'text-gray-500';
}

interface FileUploadProps {
  onUploadComplete?: () => void;
  folderId?: string | null;
  compact?: boolean; // 紧凑模式，用于侧边栏
}

interface LocalUploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function FileUpload({ onUploadComplete, folderId, compact = false }: FileUploadProps) {
  const baseUrl = import.meta.env.BASE_URL || '';
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<LocalUploadFile[]>([]);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    console.log('[Upload] 拖拽的文件:', files.map(f => ({ name: f.name, type: f.type })));

    const supportedFiles = files.filter(f => {
      const supported = isSupportedFile(f);
      console.log(`[Upload] 文件 ${f.name} 是否支持:`, supported);
      return supported;
    });

    if (supportedFiles.length === 0) {
      toast({
        title: '文件类型错误',
        description: '只支持PDF和Excel文件（.xls, .xlsx, .xlsm）',
        variant: 'destructive',
      });
      return;
    }

    console.log('[Upload] 支持的文件数量:', supportedFiles.length);

    const newUploadFiles: LocalUploadFile[] = supportedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    console.log('[Upload] 添加文件到上传列表:', newUploadFiles.map(f => f.file.name));
    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log('[Upload] 选择的文件:', Array.from(files).map(f => ({ name: f.name, type: f.type })));

    const newUploadFiles: LocalUploadFile[] = Array.from(files)
      .filter(f => {
        const supported = isSupportedFile(f);
        console.log(`[Upload] 文件 ${f.name} 是否支持:`, supported);
        return supported;
      })
      .map(file => ({
        file,
        progress: 0,
        status: 'pending' as const
      }));

    if (newUploadFiles.length === 0) {
      toast({
        title: '文件类型错误',
        description: '只支持PDF和Excel文件（.xls, .xlsx, .xlsm）',
        variant: 'destructive',
      });
      return;
    }

    console.log('[Upload] 添加文件到上传列表:', newUploadFiles.map(f => f.file.name));
    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  }, [toast]);

  // 当有新文件添加时，自动开始上传
  useEffect(() => {
    const hasPendingFiles = uploadFiles.some(f => f.status === 'pending');
    console.log('[Upload] 自动上传检查:', {
      uploadFilesCount: uploadFiles.length,
      hasPendingFiles,
      isUploading,
      uploadFiles: uploadFiles.map(f => ({ name: f.file.name, status: f.status }))
    });

    if (hasPendingFiles && !isUploading) {
      console.log('[Upload] 触发自动上传');
      handleUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadFiles, isUploading]);

  // 监听上传完成状态，自动关闭弹窗并刷新页面
  useEffect(() => {
    const allComplete = uploadFiles.length > 0 &&
      uploadFiles.every(f => f.status === 'success' || f.status === 'error');

    const hasUploading = uploadFiles.some(f => f.status === 'uploading' || f.status === 'pending');

    console.log('[Upload Debug] allComplete:', allComplete, 'showProgressDialog:', showProgressDialog, 'hasUploading:', hasUploading, 'isUploading:', isUploading);

    // 所有文件都完成了（成功或失败），并且没有正在上传的文件
    if (allComplete && showProgressDialog && !hasUploading) {
      console.log('[Upload Debug] Setting auto-close timer');
      // 延迟5秒后自动关闭弹窗（不刷新页面，方便查看日志）
      const timer = setTimeout(() => {
        console.log('[Upload Debug] Auto-closing dialog');
        setShowProgressDialog(false);
        setUploadFiles([]);

        // 保存当前文件夹ID，刷新后恢复
        if (folderId) {
          sessionStorage.setItem('lastSelectedFolderId', folderId);
        }
        // 注释掉自动刷新，方便查看日志
        // window.location.reload();
      }, 5000);

      return () => {
        console.log('[Upload Debug] Clearing timer');
        clearTimeout(timer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadFiles, showProgressDialog, isUploading, folderId]);

  const removeFile = useCallback((index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    // 显示进度弹窗
    setShowProgressDialog(true);

    // 标记所有待上传文件为上传中
    setUploadFiles(prev =>
      prev.map(f =>
        f.status === 'pending'
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      )
    );

    // 并发上传所有文件
    await Promise.all(
      pendingFiles.map(async (uploadFile, index) => {
        const fileIndex = uploadFiles.findIndex(f => f.file === uploadFile.file);

        try {
          console.log('[Upload Client] 开始上传文件:', uploadFile.file.name);

          const formData = new FormData();
          formData.append('file', uploadFile.file);
          if (folderId) {
            formData.append('folderId', folderId);
          }

          // 使用 XMLHttpRequest 来获取上传进度
          let uploadResponseData: any;
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                setUploadFiles(prev =>
                  prev.map((f, i) =>
                    i === fileIndex ? { ...f, progress: percentComplete } : f
                  )
                );
              }
            });

            xhr.addEventListener('load', () => {
              console.log('[Upload Client] XHR load 事件触发', {
                status: xhr.status,
                statusText: xhr.statusText,
                responseType: xhr.responseType,
                responseText: xhr.responseText
              });

              if (xhr.status === 200) {
                try {
                  uploadResponseData = JSON.parse(xhr.responseText);
                  console.log('[Upload Client] 解析后的响应', uploadResponseData);
                } catch (e) {
                  console.error('[Upload Client] 解析响应失败', e);
                }

                setUploadFiles(prev =>
                  prev.map((f, i) =>
                    i === fileIndex ? { ...f, status: 'success', progress: 100 } : f
                  )
                );

                // 如果解析失败，在响应中记录但不算上传失败
                if (uploadResponseData?.parseError) {
                  console.warn('[Upload Client] 文件上传成功但解析失败', uploadResponseData.parseError);
                }

                resolve();
              } else {
                console.error('[Upload Client] 上传失败响应', {
                  status: xhr.status,
                  statusText: xhr.statusText,
                  responseText: xhr.responseText
                });

                // 处理所有非 200 的状态码，包括 409
                let errorMessage = '上传失败';
                try {
                  const response = JSON.parse(xhr.responseText);
                  console.log('[Upload Client] 解析后的错误响应', response);
                  if (response.error === '文件已存在') {
                    errorMessage = '文件已存在';
                  } else if (response.error) {
                    errorMessage = response.error;
                  }
                } catch (e) {
                  console.error('[Upload Client] 解析响应失败', e);
                  if (xhr.status === 409) {
                    errorMessage = '文件已存在';
                  }
                }
                reject(new Error(errorMessage));
              }
            });

            xhr.addEventListener('error', () => {
              console.error('[Upload Client] XHR error 事件触发', {
                readyState: xhr.readyState,
                status: xhr.status,
                statusText: xhr.statusText
              });
              reject(new Error('网络错误'));
            });

            xhr.addEventListener('abort', () => {
              console.error('[Upload Client] XHR abort 事件触发');
              reject(new Error('上传被取消'));
            });

            xhr.open('POST', `${process.env.NEXT_PUBLIC_UPLOAD_SERVER_URL || 'http://localhost:3001'}/upload`);
            xhr.send(formData);
          });

          // 保存元数据到数据库
          if (uploadResponseData?.data?.filename) {
            // 先上传临时 Blob 用于解析（仅 PDF 文件）
            let tempBlobUrl: string | undefined;
            const isPdf = uploadFile.file.type === 'application/pdf' ||
                         uploadFile.file.name.toLowerCase().endsWith('.pdf');

            if (isPdf) {
              try {
                console.log('[Upload Client] 开始上传临时 Blob');
                const tempFormData = new FormData();
                tempFormData.append('file', uploadFile.file);

                const tempBlobResponse = await fetch(`${baseUrl}/api/upload-temp-blob`, {
                  method: 'POST',
                  body: tempFormData,
                });

                if (tempBlobResponse.ok) {
                  const tempBlobData = await tempBlobResponse.json();
                  tempBlobUrl = tempBlobData.data?.url;
                  console.log('[Upload Client] 临时 Blob 上传成功:', tempBlobUrl);
                } else {
                  console.warn('[Upload Client] 临时 Blob 上传失败，将跳过预览解析');
                }
              } catch (error) {
                console.warn('[Upload Client] 临时 Blob 上传异常，将跳过预览解析:', error);
              }
            }

            try {
              const metaResponse = await fetch(`${baseUrl}/api/save-file-meta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: uploadFile.file.name,
                  folderId: folderId,
                  serverFilename: uploadResponseData.data.filename,
                  serverUrl: uploadResponseData.data.url,
                  size: uploadResponseData.data.size,
                  mimeType: uploadResponseData.data.mimetype,
                  hash: uploadResponseData.data.hash, // 传递文件哈希用于重复检测
                  tempBlobUrl, // 传递临时 Blob URL 用于解析
                }),
              });

              if (!metaResponse.ok) {
                const metaError = await metaResponse.json();
                console.warn('[Upload Client] 元数据保存失败', metaError);
                uploadResponseData = {
                  ...uploadResponseData,
                  parseError: `元数据保存失败: ${metaError.error || metaResponse.statusText}`
                };
              } else {
                console.log('[Upload Client] 元数据保存成功');
              }
            } catch (error) {
              console.warn('[Upload Client] 元数据保存异常', error);
              uploadResponseData = {
                ...uploadResponseData,
                parseError: `元数据保存失败: ${error instanceof Error ? error.message : '未知错误'}`
              };
            }
          }

          // 显示上传结果
          const toastMessage = uploadResponseData?.parseError
            ? `${uploadFile.file.name} 已上传，但解析失败`
            : `${uploadFile.file.name} 已上传`;

          const toastTitle = uploadResponseData?.parseError ? '上传成功（解析失败）' : '上传成功';

          toast({
            title: toastTitle,
            description: toastMessage,
            ...(uploadResponseData?.parseError && { variant: 'default' }),
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '上传失败';
          console.error('[Upload Client] ❌ 上传失败:', { fileName: uploadFile.file.name, error, errorMessage });
          setUploadFiles(prev =>
            prev.map((f, i) =>
              i === fileIndex
                ? { ...f, status: 'error', error: errorMessage }
                : f
            )
          );
          toast({
            title: '上传失败',
            description: `${uploadFile.file.name}: ${errorMessage}`,
            variant: 'destructive',
          });
        }
      })
    );

    // 上传完成后调用回调
    onUploadComplete?.();
    setIsUploading(false);
  };

  const handleDialogComplete = () => {
    setShowProgressDialog(false);
    // 清空上传文件列表
    setUploadFiles([]);
    // 保存当前文件夹ID，刷新后恢复
    if (folderId) {
      sessionStorage.setItem('lastSelectedFolderId', folderId);
    }
    // 注释掉自动刷新，方便查看日志
    // window.location.reload();
    // 手动触发刷新文件列表的回调
    onUploadComplete?.();
  };

  const totalProgress = uploadFiles.length > 0
    ? uploadFiles.reduce((sum, f) => sum + f.progress, 0) / uploadFiles.length
    : 0;

  const hasPendingFiles = uploadFiles.some(f => f.status === 'pending');

  // 紧凑模式用于侧边栏底部
  if (compact) {
    return (
      <>
        <div className="space-y-2">
          <input
            type="file"
            accept=".pdf,.xls,.xlsx,.xlsm,.xlsb,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload-compact"
            disabled={isUploading}
          />
          <label htmlFor="file-upload-compact">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              asChild
              disabled={isUploading}
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? '上传中...' : '上传文件'}
              </span>
            </Button>
          </label>

          {uploadFiles.length > 0 && (
            <div className="space-y-2">
              {uploadFiles.map((uploadFile, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <FileText className={`h-3 w-3 ${getFileColor(uploadFile.file)} flex-shrink-0`} />
                  <span className="flex-1 truncate">{uploadFile.file.name}</span>
                  {uploadFile.status === 'success' && (
                    <span className="text-green-500">✓</span>
                  )}
                  {uploadFile.status === 'error' && (
                    <span className="text-red-500">✗</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <UploadProgressDialog
          open={showProgressDialog}
          files={uploadFiles.map(f => ({
            name: f.file.name,
            size: f.file.size,
            status: f.status,
            progress: f.progress,
            error: f.error,
          }))}
          onComplete={handleDialogComplete}
        />
      </>
    );
  }

  // 完整模式用于主内容区
  return (
    <>
      <Card className="w-full">
        <CardContent className="pt-6">
          {uploadFiles.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                拖拽PDF或Excel文件到此处，或点击选择文件（支持多选）
              </p>
              <input
                type="file"
                accept=".pdf,.xls,.xlsx,.xlsm,.xlsb,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" asChild disabled={isUploading}>
                  <span>选择文件</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {uploadFiles.map((uploadFile, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className={`h-8 w-8 ${getFileColor(uploadFile.file)} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="h-1 mt-1" />
                      )}
                      {uploadFile.status === 'success' && (
                        <p className="text-xs text-green-500 mt-1">上传成功</p>
                      )}
                      {uploadFile.status === 'error' && (
                        <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      disabled={uploadFile.status === 'uploading' || uploadFile.status === 'success'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <UploadProgressDialog
        open={showProgressDialog}
        files={uploadFiles.map(f => ({
          name: f.file.name,
          size: f.file.size,
          status: f.status,
          progress: f.progress,
          error: f.error,
        }))}
        onComplete={handleDialogComplete}
      />
    </>
  );
}
