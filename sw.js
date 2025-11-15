const CACHE_NAME = 'campus-hub-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/menu.css',
  '/css/intro.css',
  '/css/responsive.css',
  '/js/intro.js',
  '/js/loader.js',
  '/js/menu.js',
  '/js/responsive.js',
  '/js/env.js',
  '/js/supabase-config.js',
  '/js/app-integration.js',
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

  // Stale-while-revalidate for static assets (css/js/images)
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req)
        .then(response => {
          if (response && response.status === 200 && req.url.startsWith(self.location.origin)) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, cloned));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
