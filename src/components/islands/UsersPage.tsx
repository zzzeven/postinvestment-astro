'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Trash2, LogOut, Users } from 'lucide-react';
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

interface User {
  id: string;
  username: string;
  createdAt: Date;
}

export default function UsersPage() {
  const baseUrl = import.meta.env.BASE_URL || '';
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else if (response.status === 401) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!username.trim() || !password.trim()) {
      toast({
        title: '错误',
        description: '用户名和密码不能为空',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: '错误',
        description: '密码长度至少6位',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (response.ok) {
        toast({
          title: '创建成功',
          description: `用户 ${username} 已创建`,
        });
        setIsDialogOpen(false);
        setUsername('');
        setPassword('');
        fetchUsers();
      } else {
        const error = await response.json();
        throw new Error(error.error || '创建失败');
      }
    } catch (error) {
      toast({
        title: '创建失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`确定要删除用户 ${username} 吗？`)) return;

    try {
      const response = await fetch(`${baseUrl}/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: '删除成功',
          description: `用户 ${username} 已删除`,
        });
        fetchUsers();
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '无法删除用户',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
      });

      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">用户管理</h1>
              <p className="text-sm text-muted-foreground">
                管理系统用户和权限
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  新建用户
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新用户</DialogTitle>
                  <DialogDescription>
                    创建一个新用户账号来访问系统
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-username">用户名</Label>
                    <Input
                      id="new-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="输入用户名"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">密码</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="输入密码（至少6位）"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleCreateUser} disabled={isCreating}>
                    {isCreating ? '创建中...' : '创建'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              登出
            </Button>
          </div>
        </div>

        {/* 用户列表 */}
        {isLoading ? (
          <Card>
            <div className="py-8 text-center text-muted-foreground">
              加载中...
            </div>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">还没有用户</p>
              <Button onClick={() => setIsDialogOpen(true)}>创建第一个用户</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {users.map((user) => (
              <Card key={user.id}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <UserPlus className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        创建于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id, user.username)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
