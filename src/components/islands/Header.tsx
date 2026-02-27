import { useState, useEffect } from 'react';
import { Home, Search, Tag, Settings, Users, LogOut, Sparkles, FileEdit, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function Header() {
  const baseUrl = import.meta.env.BASE_URL || '';
  const [pathname, setPathname] = useState('/');

  const navItems = [
    { href: `${baseUrl}/`, icon: Home, label: '文件' },
    { href: `${baseUrl}/chat`, icon: MessageCircle, label: '对话' },
    { href: `${baseUrl}/search`, icon: Search, label: '搜索' },
    { href: `${baseUrl}/tags`, icon: Tag, label: '标签' },
    { href: `${baseUrl}/analyze`, icon: Sparkles, label: '分析' },
    { href: `${baseUrl}/quarterly`, icon: FileEdit, label: '解析' },
    { href: `${baseUrl}/users`, icon: Users, label: '用户' },
  ];

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });
      window.location.href = `${baseUrl}/login`;
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 safe-area-pt">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
              <FileTextIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <h1 className="font-bold text-base md:text-lg">投后文档管理</h1>
          </div>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <a key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-2',
                      isActive && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </a>
              );
            })}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>登出</span>
            </Button>
          </nav>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <a
                        href={item.href}
                        className={cn(
                          'cursor-pointer',
                          isActive && 'bg-accent'
                        )}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{item.label}</span>
                      </a>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>登出</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
