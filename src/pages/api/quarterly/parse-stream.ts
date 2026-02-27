import type { APIContext } from 'astro';
import { db } from '../../../db';
import { files, parseTasks } from '../../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST - 创建异步PDF解析任务
 */
export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: '缺少 fileId 参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 生成任务ID
    const taskId = `parse-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 3600000); // 1小时后过期

    // 创建任务记录到数据库
    await db.insert(parseTasks).values({
      id: taskId,
      fileId: fileId,
      status: 'pending',
      expiresAt: expiresAt,
    });

    console.log('[PDF解析任务] 创建任务:', taskId, 'fileId:', fileId);

    // 异步执行解析任务（不等待完成）
    executeTask(taskId, fileId).catch((error) => {
      console.error('[PDF解析任务] 任务执行失败:', taskId, error);
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
    console.error('[PDF解析任务] 创建任务失败:', error);
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
 * GET - 查询任务状态
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

    // 从数据库查询任务
    const tasks = await db
      .select()
      .from(parseTasks)
      .where(eq(parseTasks.id, taskId))
      .limit(1);

    if (tasks.length === 0) {
      return new Response(
        JSON.stringify({ error: '任务不存在或已过期' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const task = tasks[0];

    // 检查是否过期
    if (new Date() > task.expiresAt) {
      // 删除过期任务
      await db.delete(parseTasks).where(eq(parseTasks.id, taskId));
      return new Response(
        JSON.stringify({ error: '任务不存在或已过期' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        taskId: task.id,
        status: task.status,
        message: task.message,
        markdownLength: task.markdownLength,
        parseResult: task.parseResult,
        error: task.error,
        createdAt: task.createdAt,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PDF解析任务] 查询任务失败:', error);
    return new Response(
      JSON.stringify({
        error: '查询任务失败',
        message: error instanceof Error ? error.message : '未知错误',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 更新任务状态到数据库
 */
async function updateTaskStatus(
  taskId: string,
  updates: Partial<{
    status: 'pending' | 'downloading' | 'parsing' | 'saving' | 'completed' | 'failed';
    message: string;
    markdownLength: number;
    parseResult: string;
    error: string;
  }>
) {
  try {
    await db
      .update(parseTasks)
      .set(updates)
      .where(eq(parseTasks.id, taskId));
  } catch (error) {
    console.error('[PDF解析任务] 更新任务状态失败:', taskId, error);
  }
}

/**
 * 异步执行PDF解析任务
 */
async function executeTask(taskId: string, fileId: string) {
  try {
    // 更新状态为下载中
    await updateTaskStatus(taskId, {
      status: 'downloading',
      message: '下载文件...',
    });
    console.log('[PDF解析任务]', taskId, '开始下载文件');

    // 获取文件信息
    const fileRecords = await db
      .select({
        id: files.id,
        name: files.name,
        blobUrl: files.blobUrl,
      })
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (fileRecords.length === 0) {
      throw new Error('文件不存在');
    }

    const fileRecord = fileRecords[0];
    console.log('[PDF解析任务]', taskId, '文件:', fileRecord.name);

    // 构建完整的下载URL
    let downloadUrl = fileRecord.blobUrl;
    const uploadServerUrl = import.meta.env.UPLOAD_SERVER_URL;
    if (downloadUrl.startsWith('/uploads/') && uploadServerUrl) {
      const baseUrl = uploadServerUrl.replace(/\/$/, '');
      downloadUrl = `${baseUrl}${downloadUrl}`;
    }
    console.log('[PDF解析任务]', taskId, '下载URL:', downloadUrl);

    // 下载文件
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`下载文件失败: ${response.status}`);
    }

    const blob = await response.blob();
    const file = new File([blob], fileRecord.name, { type: 'application/pdf' });

    // 更新状态为解析中
    await updateTaskStatus(taskId, {
      status: 'parsing',
      message: `开始解析 ${(blob.size / 1024 / 1024).toFixed(2)} MB...`,
    });
    console.log('[PDF解析任务]', taskId, '开始解析PDF');

    // 调用PDF解析API
    const formData = new FormData();
    formData.append('files', file);
    formData.append('return_middle_json', 'false');
    formData.append('return_model_output', 'false');
    formData.append('return_md', 'true');
    formData.append('return_images', 'false');
    formData.append('end_page_id', '99999');
    formData.append('parse_method', 'auto');
    formData.append('start_page_id', '0');
    formData.append('lang_list', 'ch');
    formData.append('output_dir', './output');
    formData.append('server_url', 'string');
    formData.append('return_content_list', 'false');
    formData.append('backend', 'pipeline');
    formData.append('table_enable', 'true');
    formData.append('response_format_zip', 'false');
    formData.append('formula_enable', 'true');

    const parseUrl = 'http://43.130.10.163:8000/file_parse';
    console.log('[PDF解析任务]', taskId, '请求URL:', parseUrl);

    const parseResponse = await fetch(parseUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body: formData,
      // @ts-ignore
      signal: AbortSignal.timeout(1800000), // 30分钟超时
    });

    console.log('[PDF解析任务]', taskId, '响应状态:', parseResponse.status);

    if (!parseResponse.ok) {
      const errorText = await parseResponse.text();
      await updateTaskStatus(taskId, {
        message: `解析失败: ${errorText.substring(0, 100)}`,
      });
      throw new Error(`PDF解析失败[${parseResponse.status}]: ${errorText.substring(0, 200)}`);
    }

    const data = await parseResponse.json();

    // 提取markdown
    let markdown = '';
    if (data.results) {
      const fileResults = Object.values(data.results) as any[];
      if (fileResults.length > 0 && fileResults[0].md_content) {
        markdown = fileResults[0].md_content;
      }
    }
    if (!markdown && data.markdown) {
      markdown = data.markdown;
    }

    if (!markdown) {
      throw new Error('未能提取markdown内容');
    }

    // 保存解析结果预览（前500字符）
    const parseResult = markdown.substring(0, 500);

    // 更新状态为保存中
    await updateTaskStatus(taskId, {
      status: 'saving',
      message: `解析成功，保存到数据库 (${markdown.length} 字符)...`,
      markdownLength: markdown.length,
      parseResult: parseResult,
    });
    console.log('[PDF解析任务]', taskId, '保存到数据库');

    // 保存到数据库
    await db
      .update(files)
      .set({
        fullContent: markdown,
        parsedAt: new Date(),
        parseStatus: 'completed',
        parseError: null,
      })
      .where(eq(files.id, fileId));

    // 更新状态为完成
    await updateTaskStatus(taskId, {
      status: 'completed',
      message: '解析完成',
    });
    console.log('[PDF解析任务]', taskId, '任务完成');

  } catch (error) {
    console.error('[PDF解析任务]', taskId, '任务执行失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    await updateTaskStatus(taskId, {
      status: 'failed',
      error: errorMessage,
    });
  }
}
