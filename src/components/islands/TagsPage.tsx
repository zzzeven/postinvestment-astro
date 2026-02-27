'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useToast } from '../../hooks/use-toast';

interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export default function TagsPage() {
  const baseUrl = import.meta.env.BASE_URL || '';
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3B82F6');
  const { toast } = useToast();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('获取标签失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tagName.trim()) {
      toast({
        title: '错误',
        description: '标签名称不能为空',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = editingTag ? `${baseUrl}/api/tags/${editingTag.id}` : `${baseUrl}/api/tags`;
      const method = editingTag ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tagName.trim(),
          color: tagColor,
        }),
      });

      if (response.ok) {
        toast({
          title: '保存成功',
          description: editingTag ? '标签已更新' : '标签已创建',
        });
        setIsDialogOpen(false);
        resetForm();
        fetchTags();
      } else {
        const error = await response.json();
        throw new Error(error.error || '保存失败');
      }
    } catch (error) {
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setIsDialogOpen(true);
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;

    try {
      const response = await fetch(`${baseUrl}/api/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: '删除成功',
          description: '标签已删除',
        });
        fetchTags();
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '无法删除标签',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingTag(null);
    setTagName('');
    setTagColor('#3B82F6');
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6', // teal
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">标签管理</h1>
              <p className="text-sm text-muted-foreground">
                管理文档标签，用于分类和筛选
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="h-4 w-4 mr-2" />
                新建标签
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTag ? '编辑标签' : '新建标签'}</DialogTitle>
                <DialogDescription>
                  创建或编辑标签，用于组织文档
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">标签名称</Label>
                  <Input
                    id="name"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="输入标签名称"
                  />
                </div>

                <div className="space-y-2">
                  <Label>颜色</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setTagColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          tagColor === color
                            ? 'border-primary scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: tagColor }}
                  />
                  <span className="text-sm font-medium">{tagName || '预览'}</span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={handleSave}>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 标签列表 */}
        {isLoading ? (
          <Card>
            <div className="py-8 text-center text-muted-foreground">
              加载中...
            </div>
          </Card>
        ) : tags.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">还没有标签</p>
              <Button onClick={handleOpenDialog}>创建第一个标签</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {tags.map((tag) => (
              <Card key={tag.id}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tag)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
