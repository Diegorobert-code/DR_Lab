// Mondschein – Offline-Cache (nur eigene Dateien, keine Daten)
const CACHE = 'ms-v63';
const FILES = ['./grafik.css', './grafik.js', './abenddimmen.js', './ton-ios.js', './nda-sperre.js', './runde6.js', './runde7.js', './runde8.js', './runde9.js', './stimme/index.json', './besuch/fia.jpg', './besuch/waefwaef.jpg', './besuch/otti.jpg', './saison/halloween.jpg', './saison/advent.jpg', './', './index.html', './musik.js', './musik/ava-carmen.m4a', './lernen.js', './manifest.webmanifest', './icon.svg', './nova.jpg', './hase.jpg', './fuchs.jpg', './figur.jpg', './figur-gross.jpg', './otti-figur.png', './zahnboecklein.jpg', './fompa-affe.jpg', './kiki-koala.jpg', './eule.jpg', './kissenwolke.jpg', './posen/hallo.jpg', './posen/winkt.jpg', './posen/lacht.jpg', './posen/schlaeft.jpg', './icon-192.png', './kino/index.json', './posen/index.json', './feedback.js', '../nova/nova.js', '../nova/seelen.js', '../nova/intro.js', '../nova/puppe.js', '../nova/puppe.css'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    // Immer beim Server nachfragen (kein 10-Minuten-Zwischenspeicher), damit Neues sofort da ist.
    fetch(e.request.mode === 'navigate' ? e.request.url : e.request, { cache: 'no-cache' }).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
