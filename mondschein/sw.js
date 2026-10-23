// Mondschein – Offline-Cache (nur eigene Dateien, keine Daten)
const CACHE = 'ms-v67';
const FILES = ['../trickfilmwelt/trickfilmwelt.js', '../trickfilmwelt/aura.css', './aura/aura.css', './aura/nacht.webp', './aura/welt.webp', './aura/figur-idle.webp', './aura/figur-winkt.webp', './grafik.css', './grafik.js', './abenddimmen.js', './ton-ios.js', './nda-sperre.js', './runde6.js', './runde7.js', './runde8.js', './runde9.js', './stimme/index.json', './besuch/fia.jpg', './besuch/waefwaef.jpg', './besuch/otti.jpg', './saison/halloween.jpg', './saison/advent.jpg', './', './index.html', './musik.js', './musik/ava-carmen.m4a', './lernen.js', './manifest.webmanifest', './icon.svg', './nova.jpg', './hase.jpg', './fuchs.jpg', './figur.jpg', './figur-gross.jpg', './otti-figur.png', './zahnboecklein.jpg', './fompa-affe.jpg', './kiki-koala.jpg', './eule.jpg', './kissenwolke.jpg', './posen/hallo.jpg', './posen/winkt.jpg', './posen/lacht.jpg', './posen/schlaeft.jpg', './icon-192.png', './kino/index.json', './film/otti-ny.jpg', './film/otti-katzen.jpg', './posen/index.json', './feedback.js', './inhalt/welten.css', './inhalt/welten-daten.js', './inhalt/welten.js', '../nova/nova.js', '../nova/seelen.js', '../nova/puppe.js', '../nova/puppe.css'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    // Immer beim Server nachfragen (kein 10-Minuten-Zwischenspeicher), damit Neues sofort da ist.
    fetch(e.request.mode === 'navigate' ? e.request.url : e.request, { cache: 'no-cache' }).then(r => {
      // Nur vollständige, gute Antworten merken (kein 404, kein Teilstück einer Tondatei)
      if (r.ok && r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
