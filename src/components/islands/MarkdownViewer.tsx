'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  return (
    <div className={`markdown-body ${className} prose prose-slate max-w-none`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // 标题
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mt-5 mb-3 pb-2 border-b">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold mt-3 mb-2">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-bold mt-2 mb-2">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-bold mt-2 mb-2">{children}</h6>
          ),
          // 段落
          p: ({ children }) => (
            <p className="my-3 leading-7">{children}</p>
          ),
          // 列表
          ul: ({ children }) => (
            <ul className="my-3 ml-6 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 ml-6 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="my-1">{children}</li>
          ),
          // 代码块
          code: (props: any) => {
            const { inline, className, children } = props;
            if (inline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto my-4">
              {children}
            </pre>
          ),
          // 表格
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4 border rounded-lg">
              <table className="min-w-full divide-y divide-border" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-muted/50" {...props}>{children}</thead>
          ),
          th: ({ children, ...props }) => (
            <th className="px-3 py-2 text-left text-sm font-medium whitespace-nowrap border-b border-border" {...props}>
              {children}
            </th>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-border" {...props}>{children}</tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-muted/30" {...props}>{children}</tr>
          ),
          td: ({ children, ...props }) => (
            <td className="px-3 py-2 text-sm border-b border-border" {...props}>
              {children}
            </td>
          ),
          // 引用
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          // 分隔线
          hr: () => (
            <hr className="my-6 border-border" />
          ),
          // 链接
          a: ({ href, children }) => (
            <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          // 图片
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="rounded-lg my-4 max-w-full h-auto" />
          ),
          // 强调
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          // 删除线
          del: ({ children }) => (
            <del className="line-through text-muted-foreground">{children}</del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
