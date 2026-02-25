import { d as db, e as folders } from '../../chunks/index_B-AYb3H8.mjs';
export { renderers } from '../../renderers.mjs';

async function GET() {
  try {
    const allFolders = await db.query.folders.findMany({
      orderBy: (folders2, { desc }) => [desc(folders2.createdAt)]
    });
    return new Response(
      JSON.stringify({ folders: allFolders }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("获取文件夹列表错误:", error);
    return new Response(
      JSON.stringify({ error: "获取文件夹列表失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function POST({ request }) {
  try {
    const body = await request.json();
    const { name, parentId } = body;
    if (!name) {
      return new Response(
        JSON.stringify({ error: "文件夹名称不能为空" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await db.insert(folders).values({
      name,
      parentId: parentId || null
    }).returning();
    const newFolder = Array.isArray(result) ? result[0] : null;
    return new Response(
      JSON.stringify({ folder: newFolder }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("创建文件夹错误:", error);
    return new Response(
      JSON.stringify({ error: "创建文件夹失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
