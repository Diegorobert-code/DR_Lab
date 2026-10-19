// Otti – Offline-Cache (nur eigene Dateien, keine Gespräche)
const CACHE = 'otti-v9';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './otti-3d.jpg', '../nova/puppe.js', '../nova/puppe.css', './elevenlabs-client-1.26.0.js', './feedback.js', './posen/index.json', '../nova/nova.js', '../nova/intro.js', '../nova/seelen.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request.mode === 'navigate' ? e.request.url : e.request, { cache: 'no-cache' }).then(r => {
      if (r.ok && r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
