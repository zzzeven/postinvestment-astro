import { f as files, d as db } from '../../chunks/index_B-AYb3H8.mjs';
import { eq, isNull } from 'drizzle-orm';
export { renderers } from '../../renderers.mjs';

async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const folderId = url.searchParams.get("folderId");
    const forEmbedding = url.searchParams.get("forEmbedding") === "true";
    let whereClause;
    if (forEmbedding) {
      whereClause = eq(files.processedForEmbedding, true);
    } else {
      whereClause = folderId === "null" || !folderId ? isNull(files.folderId) : eq(files.folderId, folderId);
    }
    const fileList = await db.query.files.findMany({
      where: whereClause,
      orderBy: (files2, { desc }) => [desc(files2.uploadedAt)]
    });
    return new Response(
      JSON.stringify({ files: fileList }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("获取文件列表错误:", error);
    return new Response(
      JSON.stringify({ error: "获取文件列表失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
