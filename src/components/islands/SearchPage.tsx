'use client';

import { useState } from 'react';
import { Search, FileText, Sparkles } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface SearchResult {
  chunkId: string;
  fileId: string;
  fileName: string;
  chunkIndex: number;
  content: string;
  score: number;
  relevanceType: 'semantic' | 'keyword' | 'hybrid';
}

interface GroupedResult {
  fileId: string;
  fileName: string;
  chunks: SearchResult[];
  avgScore: number;
  chunkCount: number;
}

export default function SearchPage() {
  const baseUrl = import.meta.env.BASE_URL || '';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupedResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [semanticWeight, setSemanticWeight] = useState(70);
  const [groupByFile, setGroupByFile] = useState(true);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const alpha = semanticWeight / 100;

      if (groupByFile) {
        // 调用 GET 接口获取分组结果
        const response = await fetch(
          `${baseUrl}/api/search?q=${encodeURIComponent(query)}&hybridAlpha=${alpha}&groupBy=file&limit=30`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } else {
        // POST 接口获取原始结果
        const response = await fetch(`${baseUrl}/api/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            hybridAlpha: alpha,
            limit: 30,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const fileMap = new Map<string, GroupedResult>();
          data.results.forEach((r: SearchResult) => {
            if (!fileMap.has(r.fileId)) {
              fileMap.set(r.fileId, {
                fileId: r.fileId,
                fileName: r.fileName,
                chunks: [],
                avgScore: 0,
                chunkCount: 0,
              });
            }
            fileMap.get(r.fileId)!.chunks.push(r);
          });
          setResults(Array.from(fileMap.values()));
        }
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getRelevanceColor = (type: string) => {
    switch (type) {
      case 'semantic':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'keyword':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'hybrid':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRelevanceLabel = (type: string) => {
    switch (type) {
      case 'semantic':
        return '语义';
      case 'keyword':
        return '关键词';
      case 'hybrid':
        return '混合';
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 页面头部 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">智能搜索</h1>
              <p className="text-sm text-muted-foreground">
                语义 + 关键词混合搜索，更智能地找到相关内容
              </p>
            </div>
          </div>

          {/* 搜索框和设置 */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入问题或关键词..."
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? '搜索中...' : '搜索'}
              </Button>
            </div>

            {/* 搜索设置 */}
            <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>语义搜索权重</span>
                  <span className="font-medium">{semanticWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={semanticWeight}
                  onChange={(e) => setSemanticWeight(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>关键词优先</span>
                  <span>语义优先</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="groupByFile"
                  checked={groupByFile}
                  onChange={(e) => setGroupByFile(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="groupByFile" className="text-sm cursor-pointer">
                  按文件分组
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索结果 */}
        {!hasSearched ? (
          <Card>
            <div className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                输入问题或关键词开始智能搜索
              </p>
            </div>
          </Card>
        ) : results.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">未找到匹配的内容</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              找到 <strong>{results.length}</strong> 个相关文档
            </div>

            {results.map((file) => (
              <Card key={file.fileId} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold">{file.fileName}</h3>
                        <Badge variant="outline" className="text-xs">
                          相关度: {(file.avgScore * 100).toFixed(0)}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {file.chunkCount} 个片段
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 ml-11">
                    {file.chunks.slice(0, 3).map((chunk) => (
                      <div
                        key={chunk.chunkId}
                        className="p-3 bg-muted/50 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${getRelevanceColor(chunk.relevanceType)}`}>
                            {getRelevanceLabel(chunk.relevanceType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            相关度: {(chunk.score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-muted-foreground line-clamp-3">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                    {file.chunks.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        还有 {file.chunks.length - 3} 个相关片段...
                      </div>
                    )}
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
