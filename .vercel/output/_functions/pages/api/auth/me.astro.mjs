import { d as db, u as users, s as sessions } from '../../../chunks/index_B-AYb3H8.mjs';
import { eq, and, gt } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

async function GET({ request, cookies }) {
  try {
    const token = cookies.get("session_token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "未登录" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const sessionResult = await db.select({
      session: sessions,
      user: {
        id: users.id,
        username: users.username
      }
    }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, /* @__PURE__ */ new Date())
      )
    );
    if (sessionResult.length === 0) {
      return new Response(
        JSON.stringify({ error: "会话已过期，请重新登录" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        user: sessionResult[0].user
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Auth] 验证失败:", error);
    return new Response(
      JSON.stringify({ error: "验证失败" }),
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
