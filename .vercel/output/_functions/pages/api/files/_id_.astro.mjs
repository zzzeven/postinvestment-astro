import { d as db, f as files } from '../../../chunks/index_B-AYb3H8.mjs';
import { eq } from 'drizzle-orm';
import { l as logger } from '../../../chunks/logger_bR4G-6LJ.mjs';
export { renderers } from '../../../renderers.mjs';

async function GET({ params }) {
  const id = params.id;
  try {
    const file = await db.query.files.findFirst({
      where: eq(files.id, id)
    });
    if (!file) {
      return new Response(
        JSON.stringify({ error: "文件不存在" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ file }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("获取文件详情错误:", error);
    return new Response(
      JSON.stringify({ error: "获取文件详情失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function PATCH({ request, params }) {
  const id = params.id;
  try {
    const body = await request.json();
    const { name, folderId } = body;
    const result = await db.update(files).set({
      ...name && { name },
      ...folderId !== void 0 && { folderId: folderId || null },
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(files.id, id)).returning();
    const updatedFile = Array.isArray(result) ? result[0] : null;
    return new Response(
      JSON.stringify({ file: updatedFile }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("更新文件错误:", error);
    return new Response(
      JSON.stringify({ error: "更新文件失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function DELETE({ params }) {
  const id = params.id;
  try {
    const file = await db.query.files.findFirst({
      where: eq(files.id, id)
    });
    if (file?.blobPath) {
      const filename = file.blobPath.split("/").pop();
      if (filename) {
        const uploadServerUrl = undefined                                  || "http://localhost:3001";
        logger.info({ filename, url: uploadServerUrl }, "[Delete] 删除服务器文件");
        try {
          await fetch(`${uploadServerUrl}/files/${filename}`, {
            method: "DELETE"
          });
          logger.info({ filename }, "[Delete] 服务器文件删除成功");
        } catch (error) {
          logger.error({ error: error instanceof Error ? error.message : "Unknown error" }, "[Delete] 服务器文件删除失败，继续删除数据库记录");
        }
      }
    }
    await db.delete(files).where(eq(files.id, id));
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("删除文件错误:", error);
    return new Response(
      JSON.stringify({ error: "删除文件失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
