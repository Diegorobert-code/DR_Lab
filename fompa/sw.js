// Fompa – Offline-Cache (nur eigene Dateien, keine Belege)
const CACHE = 'fompa-v27';
const FILES = ['./inhalt/daten.js', './inhalt/bibliothek.js', './design.css', './schoen.css', './schoen.js', './ava.webp', './fahrten.js', './feinschliff.css', './feinschliff.js', './ton-ios.js', './nda-sperre.js', './runde8.js', './markt.css', './wm/ausflug.jpg', './wm/maskottchen.jpg', './wm/stufe-1.jpg', './wm/stufe-2.jpg', './wm/stufe-3.jpg', './wm/stufe-4.jpg', './wm/stufe-5.jpg', './runde7.js', './runde6.js', './saison/advent.jpg', './besuch/coinmaker.jpg', './besuch/copa.jpg', './besuch/mrping.jpg', './', './index.html', './lernen.js', './manifest.webmanifest', './icon-180.png', './icon-96.png', './figur.jpg', './held.jpg', './fompa-posen.jpg', './feedback.js', './runde4.js', './posen/posen.json', './posen/freut.jpg', './posen/denkt.jpg', './posen/rechnet.jpg', './posen/staunt.jpg', './posen/schlaeft.jpg', './posen/nickt.jpg', './posen/leer.jpg', '../nova/puppe.js', '../nova/puppe.css', '../apps/sprechen/sprechen.js', '../nova/intro.js', '../nova/buehne.js', '../nova/nova.js', '../nova/seelen.js'];
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
