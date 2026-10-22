// Wäf Wäf – Offline-Cache (nur eigene Dateien, keine Daten)
const CACHE = 'waefwaef-v17';
const FILES = ['./ton-ios.js', './nda-sperre.js', './posen/hundemarke.jpg', './posen/pssst.jpg', './posen/regenmantel.jpg', './runde6.js', './runde7.js', './runde8.js', './saison/halloween.jpg', './saison/advent.jpg', './besuch/granny.jpg', './besuch/hasi.jpg', './besuch/otti.jpg', './besuch/fia.jpg', './', './index.html', './posen.js', './runde4.js', './seele.js', './feedback.js', './figur.jpg', './figur-klein.jpg', './posen/sitzt.jpg', './posen/rennt.jpg', './posen/schlaeft.jpg', './posen/freut.jpg', './posen/trick.jpg', './posen/schnueffelt.jpg', './icon-180.png', './icon-192.png', './manifest.webmanifest', '../nova/nova.js', '../nova/puppe.js', '../nova/puppe.css', '../nova/seelen.js'];
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
