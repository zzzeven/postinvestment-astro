'use client';

import { useEffect, useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface FileTag {
  tagId: string;
  name: string;
  color: string;
}

interface TagSelectorProps {
  fileId: string;
  onTagsChange?: (tags: FileTag[]) => void;
}

export function TagSelector({ fileId, onTagsChange }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [fileTags, setFileTags] = useState<FileTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllTags();
    fetchFileTags();
  }, [fileId]);

  const fetchAllTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setAllTags(data);
      }
    } catch (error) {
      console.error('获取标签失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFileTags = async () => {
    try {
      const response = await fetch(`/api/files/${fileId}/tags`);
      if (response.ok) {
        const data = await response.json();
        setFileTags(data.tags || []);
        onTagsChange?.(data.tags || []);
      }
    } catch (error) {
      console.error('获取文件标签失败:', error);
    }
  };

  const handleAddTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId }),
      });

      if (response.ok) {
        fetchFileTags();
      } else {
        const error = await response.json();
        throw new Error(error.error || '添加失败');
      }
    } catch (error) {
      console.error('添加标签失败:', error);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/tags?tagId=${tagId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFileTags();
      }
    } catch (error) {
      console.error('删除标签失败:', error);
    }
  };

  const availableTags = allTags.filter(
    (tag) => !fileTags.find((ft) => ft.tagId === tag.id)
  );

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {fileTags.map((fileTag) => (
          <div
            key={fileTag.tagId}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: fileTag.color + '20',
              color: fileTag.color,
              border: `1px solid ${fileTag.color}40`,
            }}
          >
            <Tag className="h-3 w-3" />
            <span>{fileTag.name}</span>
            <button
              onClick={() => handleRemoveTag(fileTag.tagId)}
              className="ml-1 hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {availableTags.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                添加标签
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="space-y-1">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-left"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm">{tag.name}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
