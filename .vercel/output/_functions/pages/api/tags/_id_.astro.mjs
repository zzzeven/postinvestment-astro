import { d as db, t as tags } from '../../../chunks/index_B-AYb3H8.mjs';
import { eq } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

async function PATCH({ request, params }) {
  const id = params.id;
  try {
    const body = await request.json();
    const { name, color } = body;
    const result = await db.update(tags).set({
      name: name || void 0,
      color: color || void 0
    }).where(eq(tags.id, id)).returning();
    const updatedTag = Array.isArray(result) ? result[0] : null;
    if (!updatedTag) {
      return new Response(
        JSON.stringify({ error: "标签不存在" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ tag: updatedTag }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Tags] 更新标签失败:", error);
    return new Response(
      JSON.stringify({ error: "更新标签失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function DELETE({ params }) {
  const id = params.id;
  try {
    const result = await db.delete(tags).where(eq(tags.id, id)).returning();
    const deletedTag = Array.isArray(result) ? result[0] : null;
    if (!deletedTag) {
      return new Response(
        JSON.stringify({ error: "标签不存在" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Tags] 删除标签失败:", error);
    return new Response(
      JSON.stringify({ error: "删除标签失败" }),
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
