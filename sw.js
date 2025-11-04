const CACHE_NAME = 'campus-hub-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/menu.css',
  '/css/intro.css',
  '/js/intro.js',
  '/js/loader.js',
  '/css/\0',
  '/assets/logo.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // We intentionally avoid caching the full intro video by default
      return cache.addAll(ASSETS_TO_CACHE.filter(Boolean));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Simple network-first for HTML, cache-first for other assets
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(fetch(req).catch(() => caches.match('/index.html')));
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
