import { d as db, e as folders } from '../../../chunks/index_B-AYb3H8.mjs';
import { eq } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

async function PATCH({ request, params }) {
  const id = params.id;
  try {
    const body = await request.json();
    const { name, parentId } = body;
    const result = await db.update(folders).set({
      ...name && { name },
      ...parentId !== void 0 && { parentId: parentId || null },
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(folders.id, id)).returning();
    const updatedFolder = Array.isArray(result) ? result[0] : null;
    return new Response(
      JSON.stringify({ folder: updatedFolder }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("更新文件夹错误:", error);
    return new Response(
      JSON.stringify({ error: "更新文件夹失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function DELETE({ params }) {
  const id = params.id;
  try {
    await db.delete(folders).where(eq(folders.id, id));
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("删除文件夹错误:", error);
    return new Response(
      JSON.stringify({ error: "删除文件夹失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
