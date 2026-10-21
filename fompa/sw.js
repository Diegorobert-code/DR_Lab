// Fompa – Offline-Cache (nur eigene Dateien, keine Belege)
const CACHE = 'fompa-v10';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-96.png', './figur.jpg', './held.jpg', './fompa-posen.jpg', './feedback.js', './runde4.js', './posen/posen.json', './posen/freut.jpg', './posen/denkt.jpg', './posen/rechnet.jpg', './posen/staunt.jpg', './posen/schlaeft.jpg', './posen/nickt.jpg', '../nova/puppe.js', '../nova/puppe.css', '../apps/sprechen/sprechen.js', '../nova/intro.js', '../nova/buehne.js', '../nova/nova.js', '../nova/seelen.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
