import { useState, useEffect } from 'react';
import { Home, Search, Tag, LogOut, Settings, MessageCircle, Sparkles, FileEdit, Users, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function MobileBottomNav() {
  const baseUrl = import.meta.env.BASE_URL || '';
  const [pathname, setPathname] = useState('/');

  const navItems = [
    { href: `${baseUrl}/`, icon: Home, label: '文件' },
    { href: `${baseUrl}/chat`, icon: MessageCircle, label: '对话' },
    { href: `${baseUrl}/search`, icon: Search, label: '搜索' },
    { href: `${baseUrl}/tags`, icon: Tag, label: '标签' },
  ];

  const moreMenuItems = [
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
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors relative no-tap-highlight',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-b-full" />
              )}
              <Icon className="h-5 w-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          );
        })}

        {/* 更多菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center w-full h-full min-h-[44px] text-muted-foreground transition-colors">
              <Menu className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">更多</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[150px]">
            {moreMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <a href={item.href} className="cursor-pointer">
                    <Icon className="h-4 w-4 mr-2" />
                    <span>{item.label}</span>
                  </a>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuItem asChild>
              <a href={`${baseUrl}/ai/config`} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                <span>AI 配置</span>
              </a>
            </DropdownMenuItem>
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
    </nav>
  );
}
