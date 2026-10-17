// Replaced by the Vite build. URLs stay relative to this worker's scope, so the
// custom domain and GitHub Pages repository subpath have separate caches.
const FILES = __PRECACHE__;
const PREFIX = `fairy-unicorn-chase:${self.registration.scope}:`;
const CACHE = `${PREFIX}__VERSION__`;
const shell = new URL("index.html", self.registration.scope).href;
const urls = new Set(FILES.map((file) => new URL(file, self.registration.scope).href));

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      await cache.addAll([...urls].map((url) => new Request(url, { cache: "reload" })));
    } catch (error) {
      await caches.delete(CACHE);
      throw error;
    }
    // Let an update wait until the old game is closed. Never reload a chase.
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(PREFIX) && name !== CACHE)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

// Only the menu's explicit Update game action activates an update early.
self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE") event.waitUntil(self.skipWaiting());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.headers.has("range")) return;
  const url = new URL(event.request.url);
  url.search = "";
  url.hash = "";
  const home = url.href === self.registration.scope || url.href === shell;
  const key = event.request.mode === "navigate" && home ? shell : url.href;
  if (!urls.has(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key);
    return cached || fetch(event.request);
  })());
});
