import type { APIContext } from 'astro';

// 任务存储（生产环境应使用 Redis 或数据库）
const taskStore = new Map<string, {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: number;
  expiresAt: number;
}>();

/**
 * Markdown 转段落
 */
function markdownToParagraphs(markdown: string): string[] {
  const lines = markdown.split('\n');
  const paragraphs: string[] = [];
  let currentParagraph = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === '') {
      if (currentParagraph.trim()) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = '';
      }
      continue;
    }

    if (trimmedLine.startsWith('#')) {
      if (currentParagraph.trim()) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = '';
      }
      paragraphs.push('=== ' + trimmedLine + ' ===');
      continue;
    }

    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
      if (currentParagraph.trim()) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = '';
      }
      paragraphs.push(trimmedLine);
      continue;
    }

    if (/^\d+\./.test(trimmedLine)) {
      if (currentParagraph.trim()) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = '';
      }
      paragraphs.push(trimmedLine);
      continue;
    }

    currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
  }

  if (currentParagraph.trim()) {
    paragraphs.push(currentParagraph.trim());
  }

  return paragraphs.length > 0 ? paragraphs : ['无内容'];
}

/**
 * 创建异步解析任务
 */
export async function POST({ request }: APIContext) {
  try {
    console.log('[PDF Parse Task] ========== 创建异步任务 ==========');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: '未提供文件' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 生成任务ID
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = Date.now() + 3600000; // 1小时后过期

    // 创建任务记录
    taskStore.set(taskId, {
      status: 'pending',
      createdAt: Date.now(),
      expiresAt,
    });

    console.log('[PDF Parse Task] 任务创建成功:', taskId);

    // 异步执行解析任务
    executeTask(taskId, file).catch((error) => {
      console.error('[PDF Parse Task] 任务执行失败:', taskId, error);
      const task = taskStore.get(taskId);
      if (task) {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : '未知错误';
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        taskId: taskId,
        message: '任务已创建，请使用taskId查询结果',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PDF Parse Task] 创建任务失败:', error);
    return new Response(
      JSON.stringify({
        error: '创建任务失败',
        message: error instanceof Error ? error.message : '未知错误',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 异步执行PDF解析任务
 */
async function executeTask(taskId: string, file: File) {
  const task = taskStore.get(taskId);
  if (!task) return;

  task.status = 'processing';
  console.log('[PDF Parse Task]', taskId, '开始处理...');

  try {
    const apiFormData = new FormData();
    const uint8Array = new Uint8Array(await file.arrayBuffer());
    const blob = new Blob([uint8Array]);
    apiFormData.append('files', blob, file.name);
    apiFormData.append('return_middle_json', 'false');
    apiFormData.append('return_model_output', 'false');
    apiFormData.append('return_md', 'true');
    apiFormData.append('return_images', 'false');
    apiFormData.append('end_page_id', '99999');
    apiFormData.append('parse_method', 'auto');
    apiFormData.append('start_page_id', '0');
    apiFormData.append('lang_list', 'ch');
    apiFormData.append('output_dir', './output');
    apiFormData.append('server_url', 'string');
    apiFormData.append('return_content_list', 'false');
    apiFormData.append('backend', 'pipeline');
    apiFormData.append('table_enable', 'true');
    apiFormData.append('response_format_zip', 'false');
    apiFormData.append('formula_enable', 'true');

    console.log('[PDF Parse Task]', taskId, '发送请求到PDF解析服务...');
    const startTime = Date.now();

    const response = await fetch('http://43.130.10.163:8000/file_parse', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
      body: apiFormData,
      // @ts-ignore - AbortSignal.timeout exists in modern browsers
      signal: AbortSignal.timeout(600000),
    });

    const duration = Date.now() - startTime;
    console.log('[PDF Parse Task]', taskId, `响应状态: ${response.status}, 耗时: ${duration}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`解析失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[PDF Parse Task]', taskId, '解析成功');

    // 提取 markdown 内容
    let markdown = '';
    let paragraphs: string[] = [];

    if (data.results) {
      const fileResults = Object.values(data.results) as any[];
      if (fileResults.length > 0 && fileResults[0].md_content) {
        markdown = fileResults[0].md_content;
        console.log('[PDF Parse Task]', taskId, '从 results 中提取 md_content，长度:', markdown.length);
      }
    }

    if (markdown) {
      paragraphs = markdownToParagraphs(markdown);
    } else {
      if (data.markdown) {
        markdown = data.markdown;
        paragraphs = markdownToParagraphs(markdown);
      } else if (data.content_list && Array.isArray(data.content_list)) {
        paragraphs = data.content_list;
        markdown = paragraphs.join('\n\n');
      } else {
        const allText = JSON.stringify(data);
        paragraphs = [`解析结果:\n${allText}`];
        markdown = paragraphs.join('\n\n');
      }
    }

    // 更新任务状态为完成
    task.status = 'completed';
    task.result = {
      paragraphs,
      markdown,
      message: `PDF解析成功，共 ${paragraphs.length} 个段落`,
    };

    console.log('[PDF Parse Task]', taskId, '任务完成');

  } catch (error) {
    console.error('[PDF Parse Task]', taskId, '任务执行失败:', error);
    task.status = 'failed';
    task.error = error instanceof Error ? error.message : '未知错误';
  }
}

/**
 * 查询任务状态
 */
export async function GET({ request }: APIContext) {
  try {
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return new Response(
        JSON.stringify({ error: '缺少 taskId 参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const task = taskStore.get(taskId);

    if (!task) {
      return new Response(
        JSON.stringify({ error: '任务不存在或已过期' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        taskId,
        status: task.status,
        result: task.result,
        error: task.error,
        createdAt: task.createdAt,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PDF Parse Task] 查询任务失败:', error);
    return new Response(
      JSON.stringify({
        error: '查询任务失败',
        message: error instanceof Error ? error.message : '未知错误',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
