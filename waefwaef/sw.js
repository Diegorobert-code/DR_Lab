// Wäf Wäf – Offline-Cache (nur eigene Dateien, keine Daten)
const CACHE = 'waefwaef-v2';
const FILES = ['./', './index.html', './posen.js', './seele.js', './feedback.js', './figur.jpg', './figur-klein.jpg', './icon-180.png', './icon-192.png', './manifest.webmanifest', '../nova/nova.js', '../nova/seelen.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('waefwaef-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r.mode === 'navigate' ? r.url : r, { cache: 'no-cache' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(r).then(x => x || (r.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
