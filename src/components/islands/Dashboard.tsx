import { useEffect, useState, useRef, useCallback } from 'react';
import { Folder, FileText, Menu, X, Upload } from 'lucide-react';
import { FileTree } from './FileTree';
import { FileCard } from './FileCard';
import { FileUpload } from './FileUpload';
import { MobileBottomNav } from './MobileBottomNav';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { File as FileType, Folder as FolderType } from '../../db/schema';
import { buildTree } from '../../lib/folder-tree';
import { useToast } from '../../hooks/use-toast';

interface DashboardProps {
  initialFolders?: FolderType[];
  initialFiles?: FileType[];
}

export default function Dashboard({ initialFolders = [], initialFiles = [] }: DashboardProps) {
  const [folders, setFolders] = useState<FolderType[]>(initialFolders);
  const [files, setFiles] = useState<FileType[]>(initialFiles);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/folders');
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('加载文件夹失败:', error);
    }
  };

  const loadFiles = async (folderId: string | null = null) => {
    try {
      setIsLoading(true);
      const url = folderId
        ? `/api/files?folderId=${folderId}`
        : '/api/files?folderId=null';
      const response = await fetch(url);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('加载文件失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载文件列表',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();

    // 从 sessionStorage 恢复上次选择的文件夹ID
    const lastSelectedFolderId = sessionStorage.getItem('lastSelectedFolderId');
    if (lastSelectedFolderId) {
      setSelectedFolderId(lastSelectedFolderId);
      // 清除保存的状态，避免影响下次
      sessionStorage.removeItem('lastSelectedFolderId');
    }

    loadFiles(lastSelectedFolderId);
  }, []);

  useEffect(() => {
    loadFiles(selectedFolderId);
  }, [selectedFolderId]);

  const handleCreateFolder = async () => {
    const name = prompt('请输入文件夹名称:');
    if (!name) return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId: selectedFolderId }),
      });

      if (response.ok) {
        toast({
          title: '创建成功',
          description: `文件夹 "${name}" 已创建`,
        });
        loadFolders();
      } else {
        throw new Error('创建失败');
      }
    } catch (error) {
      toast({
        title: '创建失败',
        description: '无法创建文件夹',
        variant: 'destructive',
      });
    }
  };

  const handleFolderDelete = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: '删除成功',
          description: '文件夹已删除',
        });
        // 如果删除的是当前选中的文件夹，清除选中状态
        if (selectedFolderId === folderId) {
          setSelectedFolderId(null);
        }
        loadFolders();
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '无法删除文件夹',
        variant: 'destructive',
      });
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('确定要删除这个文件吗？')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: '删除成功',
          description: '文件已删除',
        });
        loadFiles(selectedFolderId);
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '无法删除文件',
        variant: 'destructive',
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    console.log('[Upload] 开始上传文件', { name: file.name, size: file.size, type: file.type });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadServerUrl = import.meta.env.UPLOAD_SERVER_URL || 'http://localhost:3001';
      console.log('[Upload] 步骤1: 上传到服务器', { url: uploadServerUrl });

      const uploadResponse = await fetch(`${uploadServerUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(`服务器上传失败: ${uploadError.error || uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('[Upload] 服务器上传成功', { uploadResult });

      console.log('[Upload] 步骤2: 保存元数据');
      const metaResponse = await fetch('/api/save-file-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          folderId: selectedFolderId,
          serverFilename: uploadResult.data.filename,
          serverUrl: uploadResult.data.url,
          size: uploadResult.data.size,
          mimeType: uploadResult.data.mimetype,
        }),
      });

      if (!metaResponse.ok) {
        const metaError = await metaResponse.json();
        throw new Error(`元数据保存失败: ${metaError.error || metaResponse.statusText}`);
      }

      const metaResult = await metaResponse.json();
      console.log('[Upload] 元数据保存成功', { metaResult });

      toast({
        title: '上传成功',
        description: `${file.name} 已上传`,
      });
    } catch (error) {
      console.error('[Upload] 上传异常', { error, fileName: file.name });
      toast({
        title: '上传失败',
        description: `${file.name} 上传失败: ${error instanceof Error ? error.message : '未知错误'}`,
        variant: 'destructive',
      });
    }
  }, [selectedFolderId, toast]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    console.log('[Upload] handleDrop 开始', { filesCount: files.length, selectedFolderId });
    const supportedFiles = files.filter(f =>
      f.type === 'application/pdf' ||
      f.type.includes('excel') ||
      f.type.includes('spreadsheet')
    );
    console.log('[Upload] 过滤后的文件', { total: files.length, supportedFiles: supportedFiles.length });

    if (supportedFiles.length === 0) {
      console.warn('[Upload] 没有支持的文件');
      toast({
        title: '文件类型错误',
        description: '只支持PDF和Excel文件',
        variant: 'destructive',
      });
      return;
    }

    for (const file of supportedFiles) {
      await handleFileUpload(file);
    }

    loadFiles(selectedFolderId);
  }, [selectedFolderId, toast, handleFileUpload, loadFiles]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('[Upload] handleFileSelect 开始', { filesCount: files?.length, selectedFolderId });
    if (!files || files.length === 0) return;

    const supportedFiles = Array.from(files).filter(f =>
      f.type === 'application/pdf' ||
      f.type.includes('excel') ||
      f.type.includes('spreadsheet')
    );
    console.log('[Upload] 过滤后的文件', { total: files.length, supportedFiles: supportedFiles.length });

    if (supportedFiles.length === 0) {
      console.warn('[Upload] 没有支持的文件');
      toast({
        title: '文件类型错误',
        description: '只支持PDF和Excel文件',
        variant: 'destructive',
      });
      return;
    }

    for (const file of supportedFiles) {
      await handleFileUpload(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    loadFiles(selectedFolderId);
  }, [selectedFolderId, toast, handleFileUpload, loadFiles]);

  const folderTree = buildTree(folders);

  return (
    <div className="flex min-h-screen bg-background">
      {/* 侧边栏 */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64
          bg-card border-r transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex-shrink-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* 侧边栏头部 */}
          <div className="flex items-center justify-between p-3 md:p-4 border-b">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-base md:text-lg">投后文档</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 文件夹树 */}
          <div className="flex-1 overflow-y-auto p-2">
            <FileTree
              folders={folderTree}
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
              onFolderDelete={handleFolderDelete}
            />
          </div>

          {/* 底部操作区 - 新建文件夹和上传文件 */}
          <div className="border-t p-3 space-y-2 bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start min-h-[44px]"
              onClick={handleCreateFolder}
            >
              <Folder className="h-4 w-4 mr-2" />
              新建文件夹
            </Button>
            <FileUpload
              folderId={selectedFolderId}
              onUploadComplete={() => loadFiles(selectedFolderId)}
              compact
            />
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 w-full min-w-0 pb-16 md:pb-0">
        {/* 顶部栏 */}
        <header className="bg-card border-b px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden min-h-[44px] min-w-[44px]"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-baseline gap-2">
                <h1 className="text-lg md:text-xl font-semibold">
                  {selectedFolderId
                    ? String(folders.find(f => f.id === selectedFolderId)?.name ?? '未知文件夹')
                    : '星界母基金'}
                </h1>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {files.length} 个文件
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 文件内容区 */}
        <div
          className="p-4 md:p-6 flex-1"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground mb-2">暂无文件</p>
              <p className="text-sm text-muted-foreground mb-6">
                点击左侧「上传文件」按钮开始使用
              </p>
              {/* 移动端显示的上传按钮 */}
              <FileUpload
                folderId={selectedFolderId}
                onUploadComplete={() => loadFiles(selectedFolderId)}
              />
            </div>
          ) : (
            <>
              {isDragging && (
                <div className="fixed inset-0 bg-primary/10 z-50 flex items-center justify-center pointer-events-none">
                  <div className="bg-background border-2 border-primary border-dashed rounded-lg p-8 md:p-12 mx-4">
                    <Upload className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-primary" />
                    <p className="text-base md:text-lg font-medium text-center">松手以上传文件</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onDelete={handleFileDelete}
                    onProcessed={() => loadFiles(selectedFolderId)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* 移动端底部导航 */}
      <MobileBottomNav />

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
