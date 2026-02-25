import { d as db, u as users, s as sessions } from '../../../chunks/index_B-AYb3H8.mjs';
import { eq } from 'drizzle-orm';
import { h as hashPassword, a as generateToken, b as generateSessionExpiry } from '../../../chunks/auth_nxfG94tv.mjs';
export { renderers } from '../../../renderers.mjs';

async function POST({ request, cookies }) {
  try {
    const body = await request.json();
    const { username, password } = body;
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "用户名和密码不能为空" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const userResult = await db.select().from(users).where(eq(users.username, username));
    if (userResult.length === 0) {
      return new Response(
        JSON.stringify({ error: "用户名或密码错误" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const user = userResult[0];
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return new Response(
        JSON.stringify({ error: "用户名或密码错误" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const token = generateToken();
    const expiresAt = generateSessionExpiry();
    const sessionResult = await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt
    }).returning();
    const session = Array.isArray(sessionResult) ? sessionResult[0] : null;
    if (!session) {
      throw new Error("创建会话失败");
    }
    cookies.set("session_token", token, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: "lax",
      path: "/"
    });
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Login] 登录失败:", error);
    return new Response(
      JSON.stringify({ error: "登录失败" }),
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
