/* ═══════════════════════════════════════════════════════════════════
   SERVICE WORKER — Mannrang Tea
   Strategy: cache-first for assets, stale-while-revalidate for HTML.
   Only registered on www.mannrang.com (not localhost or file://).
   ═══════════════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'mannrang-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './blend-01.html',
  './blend-02.html',
  './compare.html',
  './brewing.html',
  './about.html',
  './order.html',
  './faq.html',
  './contact.html',
  './manifest.webmanifest',
  './assets/Mnrg_Logo_TM_Black.png',
  './assets/250_g_pack.png',
  './assets/Blend_No_02_pack.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(k => !k.startsWith(CACHE_VERSION))
          .map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Skip cross-origin (Google Fonts, Cloudinary, etc.)
  if (url.origin !== location.origin) return;

  // HTML — stale-while-revalidate
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request, PAGE_CACHE));
    return;
  }

  // Images — cache-first
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // CSS/JS/fonts — cache-first
  if (['style', 'script', 'font'].includes(request.destination)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (e) {
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || networkPromise;
}
