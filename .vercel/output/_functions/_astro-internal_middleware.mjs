import { d as defineMiddleware, s as sequence } from './chunks/index_jnnxOV3g.mjs';
import { g as getUserBySession } from './chunks/auth_nxfG94tv.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_CUpsHt8J.mjs';
import 'piccolore';
import './chunks/astro/server_BuDLk9JT.mjs';
import 'clsx';

const publicPaths = [
  "/login",
  "/api/auth/login",
  "/api/files/search",
  "/api/parse/status"
];
const onRequest$1 = defineMiddleware(async ({ url, cookies, locals, redirect }, next) => {
  const pathname = url.pathname;
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return next();
  }
  const sessionToken = cookies.get("session_token")?.value;
  if (!sessionToken) {
    return redirect("/login");
  }
  const user = await getUserBySession(sessionToken);
  if (!user) {
    return redirect("/login");
  }
  locals.user = {
    id: user.id,
    username: user.username
  };
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
