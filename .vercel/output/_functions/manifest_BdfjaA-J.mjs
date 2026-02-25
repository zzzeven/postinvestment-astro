import 'piccolore';
import { o as decodeKey } from './chunks/astro/server_BuDLk9JT.mjs';
import 'clsx';
import './chunks/astro-designed-error-pages_CUpsHt8J.mjs';
import 'es-module-lexer';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_Pwupwi23.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/hu/dropbox/claudeworking/postinvestment-astro/","cacheDir":"file:///Users/hu/dropbox/claudeworking/postinvestment-astro/node_modules/.astro/","outDir":"file:///Users/hu/dropbox/claudeworking/postinvestment-astro/dist/","srcDir":"file:///Users/hu/dropbox/claudeworking/postinvestment-astro/src/","publicDir":"file:///Users/hu/dropbox/claudeworking/postinvestment-astro/public/","buildClientDir":"file:///Users/hu/dropbox/claudeworking/postinvestment-astro/dist/client/","buildServerDir":"file:///Users/hu/dropbox/claudeworking/postinvestment-astro/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/ai/chat","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/ai\\/chat\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"ai","dynamic":false,"spread":false}],[{"content":"chat","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/ai/chat.ts","pathname":"/api/ai/chat","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/auth/login","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/login\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/login.ts","pathname":"/api/auth/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/auth/logout","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/logout\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"logout","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/logout.ts","pathname":"/api/auth/logout","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/auth/me","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/me\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"me","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/me.ts","pathname":"/api/auth/me","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/files/search","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/files\\/search\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"files","dynamic":false,"spread":false}],[{"content":"search","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/files/search.ts","pathname":"/api/files/search","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/files/[id]/tags","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/files\\/([^/]+?)\\/tags\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"files","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}],[{"content":"tags","dynamic":false,"spread":false}]],"params":["id"],"component":"src/pages/api/files/[id]/tags.ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/files/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/files\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"files","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/files/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/files","isIndex":true,"type":"endpoint","pattern":"^\\/api\\/files\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"files","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/files/index.ts","pathname":"/api/files","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/folders/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/folders\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"folders","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/folders/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/folders","isIndex":true,"type":"endpoint","pattern":"^\\/api\\/folders\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"folders","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/folders/index.ts","pathname":"/api/folders","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/tags/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/tags\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"tags","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/tags/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/tags","isIndex":true,"type":"endpoint","pattern":"^\\/api\\/tags\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"tags","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/tags/index.ts","pathname":"/api/tags","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.TYAzml2y.css"}],"routeData":{"route":"/login","isIndex":false,"type":"page","pattern":"^\\/login\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login.astro","pathname":"/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.TYAzml2y.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/hu/dropbox/claudeworking/postinvestment-astro/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/hu/dropbox/claudeworking/postinvestment-astro/src/pages/login.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/ai/chat@_@ts":"pages/api/ai/chat.astro.mjs","\u0000@astro-page:src/pages/api/auth/login@_@ts":"pages/api/auth/login.astro.mjs","\u0000@astro-page:src/pages/api/auth/logout@_@ts":"pages/api/auth/logout.astro.mjs","\u0000@astro-page:src/pages/api/auth/me@_@ts":"pages/api/auth/me.astro.mjs","\u0000@astro-page:src/pages/api/files/search@_@ts":"pages/api/files/search.astro.mjs","\u0000@astro-page:src/pages/api/files/[id]/tags@_@ts":"pages/api/files/_id_/tags.astro.mjs","\u0000@astro-page:src/pages/api/files/[id]@_@ts":"pages/api/files/_id_.astro.mjs","\u0000@astro-page:src/pages/api/files/index@_@ts":"pages/api/files.astro.mjs","\u0000@astro-page:src/pages/api/folders/[id]@_@ts":"pages/api/folders/_id_.astro.mjs","\u0000@astro-page:src/pages/api/folders/index@_@ts":"pages/api/folders.astro.mjs","\u0000@astro-page:src/pages/api/tags/[id]@_@ts":"pages/api/tags/_id_.astro.mjs","\u0000@astro-page:src/pages/api/tags/index@_@ts":"pages/api/tags.astro.mjs","\u0000@astro-page:src/pages/login@_@astro":"pages/login.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BdfjaA-J.mjs","/Users/hu/dropbox/claudeworking/postinvestment-astro/node_modules/@astrojs/react/dist/vnode-children.js":"chunks/vnode-children_Gljd-95D.mjs","/Users/hu/dropbox/claudeworking/postinvestment-astro/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_BUjs5lIx.mjs","/Users/hu/dropbox/claudeworking/postinvestment-astro/src/components/islands/LoginForm":"_astro/LoginForm.BNGnj4ib.js","/Users/hu/dropbox/claudeworking/postinvestment-astro/src/components/islands/Dashboard":"_astro/Dashboard.DXLycEuz.js","@astrojs/react/client.js":"_astro/client.DwJe1B-7.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/index.TYAzml2y.css","/favicon.ico","/favicon.svg","/_astro/Dashboard.DXLycEuz.js","/_astro/LoginForm.BNGnj4ib.js","/_astro/client.DwJe1B-7.js","/_astro/index.Cq7c7tEH.js","/_astro/use-toast.DWCV5Vtc.js"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"w0+kPB5dUqJ96F4dQ1rGX7ICRRygvbYlf3RG/rgRR5Q="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
