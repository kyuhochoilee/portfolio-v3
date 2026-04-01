const CACHE_NAME = "write-offline-v1";

const PRECACHE_URLS = ["/write", "/write/new"];

// Install: precache the /write page shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: route requests by strategy
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle /write routes — let everything else pass through
  const isWriteRoute = url.pathname.startsWith("/write");
  const isWriteAPI = url.pathname.startsWith("/api/write") || url.pathname.startsWith("/api/upload");
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.match(/\.(woff2?|ttf|otf|css|js)$/);

  if (!isWriteRoute && !isWriteAPI && !isStaticAsset) {
    return;
  }

  // Network-first for API calls
  if (isWriteAPI) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Cache-first for static assets (fonts, CSS, JS chunks)
  if (isStaticAsset) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Network-first for /write pages (HTML navigation)
  if (isWriteRoute) {
    event.respondWith(networkFirst(event.request));
    return;
  }
});

// Network-first: try network, fall back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
  }
}

// Cache-first: try cache, fall back to network
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
  }
}
