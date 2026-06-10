/* Nesto · service worker — network-first (apanha sempre updates online; cache só p/ offline) */
const CACHE = 'nesto-v12';
const ASSETS = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.png'];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // não tocar em chamadas à Dropbox (POST)
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;       // deixar passar pedidos externos (API Dropbox)
  e.respondWith(
    fetch(req).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(req, clone).catch(() => {}));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
