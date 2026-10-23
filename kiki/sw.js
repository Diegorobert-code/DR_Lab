// Kiki singt – Offline-Cache (nur eigene Dateien, keine Daten)
const CACHE = 'kiki-v21';
const FILES = ['./', './index.html', './musik.js', './musik/ava-carmen.m4a', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './feedback.js', './figur.jpg', './figur-gross.jpg', './kiki-3d.jpg', './posen/index.json', './posen/hallo.jpg', './posen/singt.jpg', './posen/hoert.jpg', './posen/freut.jpg', './posen/verbeugt.jpg', './posen/tanzt.jpg', './posen/zusammen.jpg', './posen/schlaflied.jpg', './stimme/index.json', './stimme/saetze.json', '../trickfilmwelt/trickfilmwelt.js', '../trickfilmwelt/aura.css', './aura/aura.css', './aura/nacht.webp', './aura/welt.webp', './aura/figur-idle.webp', './aura/figur-winkt.webp', './aura/figur-lacht.webp'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request.mode === 'navigate' ? e.request.url : e.request, { cache: 'no-cache' }).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
