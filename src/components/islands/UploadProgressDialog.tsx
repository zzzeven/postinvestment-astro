'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { CheckCircle2, XCircle, Upload } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

export interface UploadFile {
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface UploadProgressDialogProps {
  open: boolean;
  files: UploadFile[];
  onComplete: () => void;
}

export function UploadProgressDialog({ open, files, onComplete }: UploadProgressDialogProps) {
  const allComplete = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');
  const hasErrors = files.some(f => f.status === 'error');
  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const totalProgress = files.length > 0
    ? files.reduce((sum, f) => sum + f.progress, 0) / files.length
    : 0;

  const isUploading = files.some(f => f.status === 'uploading' || f.status === 'pending');

  return (
    <Dialog open={open} onOpenChange={(open) => {
      // 只允许在完成时关闭弹窗
      if (!open && allComplete) {
        onComplete();
      }
      // 上传中不允许关闭弹窗
      if (!open && !allComplete) {
        return;
      }
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {allComplete ? (
              hasErrors ? (
                <>
                  <XCircle className="h-5 w-5 text-yellow-500" />
                  上传完成（部分失败）
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  上传完成
                </>
              )
            ) : (
              <>
                <Upload className="h-5 w-5" />
                正在上传文件
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {allComplete ? (
              <>
                {successCount > 0 && <span className="text-green-600 font-medium">{successCount} 个文件上传成功</span>}
                {successCount > 0 && errorCount > 0 && <span>，</span>}
                {errorCount > 0 && <span className="text-red-600 font-medium">{errorCount} 个文件上传失败</span>}
              </>
            ) : (
              `正在上传 ${files.length} 个文件...`
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 总体进度 */}
          {!allComplete && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>总进度</span>
                <span>{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>
          )}

          {/* 文件列表 */}
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  {file.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : file.status === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      {file.status === 'uploading' && (
                        <span className="text-xs text-primary font-medium">{file.progress}%</span>
                      )}
                    </div>
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-1.5 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2">
          {allComplete ? (
            <Button
              onClick={onComplete}
              className={!hasErrors ? "bg-green-600 hover:bg-green-700 min-w-[120px]" : "min-w-[120px]"}
              size="lg"
            >
              完成
            </Button>
          ) : (
            <Button
              disabled
              variant="secondary"
              className="min-w-[120px]"
              size="lg"
            >
              上传中...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
