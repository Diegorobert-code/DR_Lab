// Coin Maker – Offline-Cache (nur eigene Dateien, keine Daten, keine Ideen-Texte)
const CACHE = 'coinmaker-v24';
const FILES = ['./inhalt/daten.js', './inhalt/bibliothek.js', './schoen.css', './schoen.js', './design.css', './irgendwann.js', './feinschliff.css', './feinschliff.js', './ton-ios.js', './nda-sperre.js', './runde8.js', './markt.css', './wm/ausflug.jpg', './wm/maskottchen.jpg', './wm/stufe-1.jpg', './wm/stufe-2.jpg', './wm/stufe-3.jpg', './wm/stufe-4.jpg', './wm/stufe-5.jpg', './runde7.js', './runde6.js', './saison/advent.jpg', './besuch/fompa.jpg', './besuch/hasi.jpg', './besuch/mrping.jpg', './', './index.html', './lernen.js', './werkstatt.js', './glanz.js', './trickfilm.js', './ziele.js', './posen.js', './feedback.js', './figur.jpg', './figur-klein.jpg', './posen/lupe.jpg', './posen/hebel.jpg', './posen/freude.jpg', './posen/winken.jpg', './posen/leer.jpg', './icon-180.png', './icon-192.png', './manifest.webmanifest', '../nova/nova.js', '../nova/seelen.js', '../nova/intro.js', '../nova/puppe.js', '../nova/puppe.css'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('coinmaker-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
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
