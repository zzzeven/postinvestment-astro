import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_D8f4RaZb.mjs';
import { manifest } from './manifest_BdfjaA-J.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/ai/chat.astro.mjs');
const _page2 = () => import('./pages/api/auth/login.astro.mjs');
const _page3 = () => import('./pages/api/auth/logout.astro.mjs');
const _page4 = () => import('./pages/api/auth/me.astro.mjs');
const _page5 = () => import('./pages/api/files/search.astro.mjs');
const _page6 = () => import('./pages/api/files/_id_/tags.astro.mjs');
const _page7 = () => import('./pages/api/files/_id_.astro.mjs');
const _page8 = () => import('./pages/api/files.astro.mjs');
const _page9 = () => import('./pages/api/folders/_id_.astro.mjs');
const _page10 = () => import('./pages/api/folders.astro.mjs');
const _page11 = () => import('./pages/api/tags/_id_.astro.mjs');
const _page12 = () => import('./pages/api/tags.astro.mjs');
const _page13 = () => import('./pages/login.astro.mjs');
const _page14 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/ai/chat.ts", _page1],
    ["src/pages/api/auth/login.ts", _page2],
    ["src/pages/api/auth/logout.ts", _page3],
    ["src/pages/api/auth/me.ts", _page4],
    ["src/pages/api/files/search.ts", _page5],
    ["src/pages/api/files/[id]/tags.ts", _page6],
    ["src/pages/api/files/[id].ts", _page7],
    ["src/pages/api/files/index.ts", _page8],
    ["src/pages/api/folders/[id].ts", _page9],
    ["src/pages/api/folders/index.ts", _page10],
    ["src/pages/api/tags/[id].ts", _page11],
    ["src/pages/api/tags/index.ts", _page12],
    ["src/pages/login.astro", _page13],
    ["src/pages/index.astro", _page14]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "b89a8b23-2f35-47bb-a581-b2ec2c837299",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
