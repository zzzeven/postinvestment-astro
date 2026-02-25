import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Sparkles, Trash2 } from 'lucide-react';
import { FolderNode } from '../../lib/folder-tree';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface FileTreeProps {
  folders: FolderNode[];
  selectedFolderId?: string | null;
  onFolderSelect?: (folderId: string | null) => void;
  onFolderDelete?: (folderId: string) => void;
}

interface TreeNodeProps {
  node: FolderNode;
  level: number;
  selectedFolderId?: string | null;
  onFolderSelect?: (folderId: string | null) => void;
  onFolderDelete?: (folderId: string) => void;
}

function TreeNode({ node, level, selectedFolderId, onFolderSelect, onFolderDelete }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedFolderId === node.id;
  const canDelete = level >= 1; // 只有第二层级及以后才能删除

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // 如果点击的是按钮，不触发展开/选择

    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
    onFolderSelect?.(String(node.id));
  };

  const handleAnalyze = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/analyze?folderId=${String(node.id)}&folderName=${encodeURIComponent(String(node.name))}`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除文件夹"${String(node.name)}"吗？`)) {
      onFolderDelete?.(String(node.id));
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors group',
          isSelected && 'bg-accent'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )
        ) : (
          <div className="w-4 h-4" />
        )}
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 text-blue-500" />
        )}
        <span className="text-sm flex-1 truncate">{String(node.name)}</span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleAnalyze}
            title="AI分析文件夹"
          >
            <Sparkles className="h-3 w-3" />
          </Button>

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleDelete}
              title="删除文件夹"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={String(child.id)}
              node={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onFolderSelect={onFolderSelect}
              onFolderDelete={onFolderDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ folders, selectedFolderId, onFolderSelect, onFolderDelete }: FileTreeProps) {
  return (
    <div className="space-y-1">
      {/* 根目录选项 */}
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-accent transition-colors',
          selectedFolderId === null && 'bg-accent'
        )}
        onClick={() => onFolderSelect?.(null)}
      >
        <Folder className="h-4 w-4 text-blue-500" />
        <span className="text-sm">星界母基金</span>
      </div>

      {folders.map((folder) => (
        <TreeNode
          key={String(folder.id)}
          node={folder}
          level={0}
          selectedFolderId={selectedFolderId}
          onFolderSelect={onFolderSelect}
          onFolderDelete={onFolderDelete}
        />
      ))}
    </div>
  );
}
