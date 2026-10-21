// Food and Flow – Offline-Cache (nur eigene Dateien, keine Essensdaten)
const CACHE = 'flo-v10';
const FILES = ['../nova/intro.js', '../nova/buehne.js', '../nova/figuren/flo.jpg', './icon-192.png', './posen/ruhig.jpg', './posen/hoert.jpg', './posen/winkt.jpg', './posen/jubel.jpg', './posen/teller.jpg', './posen/horcht.jpg', './posen/wecker.jpg', './runde7.js', './runde6.js', './saison/advent.jpg', './besuch/fompa.jpg', './besuch/granny.jpg', './besuch/mama-affe.jpg', './besuch/waefwaef.jpg', './', './index.html', './flo.js', './flo2.js', './runde4.js', './sprechen.js', './feedback.js', './figur.jpg', './figur-gross.jpg', './icon-180.png', './manifest.webmanifest', './posen/posen.json', '../nova/nova.js', '../nova/puppe.js', '../nova/puppe.css', '../nova/seelen.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('flo-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      if (r.ok) caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
