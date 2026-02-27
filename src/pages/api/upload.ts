import type { APIContext } from 'astro';

// POST /api/upload - 代理到 Express 上传服务器
export async function POST({ request }: APIContext) {
  const uploadServerUrl = import.meta.env.UPLOAD_SERVER_URL || 'http://localhost:3001';

  try {
    // 直接将 multipart body 流式转发，不读入内存，避免大文件 OOM
    const contentType = request.headers.get('content-type');

    const response = await fetch(`${uploadServerUrl}/upload`, {
      method: 'POST',
      headers: contentType ? { 'content-type': contentType } : {},
      body: request.body,
      // @ts-ignore - Node.js fetch duplex 需要此参数
      duplex: 'half',
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Upload Proxy] 转发失败:', error);
    return new Response(
      JSON.stringify({
        error: '上传失败',
        message: error instanceof Error ? error.message : '未知错误',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
