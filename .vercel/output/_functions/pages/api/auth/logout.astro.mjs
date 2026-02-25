import { d as db, s as sessions } from '../../../chunks/index_B-AYb3H8.mjs';
import { eq } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

async function POST({ cookies }) {
  try {
    const token = cookies.get("session_token")?.value;
    if (token) {
      await db.delete(sessions).where(eq(sessions.token, token));
    }
    cookies.delete("session_token", { path: "/" });
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Logout] 登出失败:", error);
    return new Response(
      JSON.stringify({ error: "登出失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
