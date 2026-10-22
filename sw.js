/* D MONSTERS Q STUDIO — service worker (offline app shell) */
const CACHE = 'dmq-studio-v5';
const ASSETS = [
  './',
  './index.html',
  './worklets.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;   // never touch cross-origin

  const isDocument =
    e.request.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('index.html');

  if (isDocument) {
    // NETWORK-FIRST: always try for fresh HTML so updates land immediately;
    // fall back to the cached shell when offline.
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          return resp;
        })
        .catch(() => caches.match(e.request).then(h => h || caches.match('./index.html')))
    );
    return;
  }

  // CACHE-FIRST for static assets (icons, manifest)
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return resp;
      });
    })
  );
});
