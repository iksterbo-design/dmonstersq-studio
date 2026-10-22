/* D MONSTERS Q STUDIO — AIM LAB : service worker
   Network-first for the HTML shell, cache-first for icons.
   Bump CACHE when you ship changes. */
const CACHE = 'dmq-aim-v2';
const ASSETS = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
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
  if (url.origin !== location.origin) return;

  const isDoc = e.request.mode === 'navigate' ||
                url.pathname.endsWith('/') || url.pathname.endsWith('index.html');

  if (isDoc) {
    e.respondWith(
      fetch(e.request)
        .then(resp => { const c = resp.clone();
          caches.open(CACHE).then(x => x.put(e.request, c)).catch(()=>{}); return resp; })
        .catch(() => caches.match(e.request).then(h => h || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      const c = resp.clone();
      caches.open(CACHE).then(x => x.put(e.request, c)).catch(()=>{});
      return resp;
    }))
  );
});
