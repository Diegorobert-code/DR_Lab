// Hasis Laden – Offline-Cache (nur eigene Dateien, keine Daten, kein Code der Kunden)
const CACHE = 'hasi-v25';
const FILES = ['./inhalt/sprich.js', './inhalt/sprich-daten.js', './inhalt/sprich.css', './inhalt/homescreen.js', './icon-maskable-192.png', './icon-maskable-512.png', './inhalt/daten.js', './inhalt/inhalt.js', './inhalt/inhalt.css', './aura/hasi-aura.js', './aura/hasi-aura.css', './aura/idle.webp', './aura/winkt.webp', './aura/freut.webp', './aura/schlaeft.webp', './aura/lider.webp', './aura/laden.webp', './design.css', './design.js', './feinschliff.css', './feinschliff.js', 'ton-ios.js', 'nda-sperre.js', '../nova/nova.jpg', './runde8.js', './finder.js', './runde7.js', './runde6.js', './saison/halloween.jpg', './saison/advent.jpg', './besuch/otti.jpg', './besuch/mrping.jpg', './besuch/waefwaef.jpg', './besuch/granny.jpg', './', './index.html', './lernen.js', './hasi.js', './runde4.js', './posen.js', './posen/daumen.jpg', './posen/passt.jpg', './posen/huepfen.jpg', './posen/winken.jpg', './posen/lupe.jpg', './medaillen/gluehbirne.jpg', './medaillen/stern.jpg', './medaillen/zahnrad.jpg', './medaillen/schluessel-werkzeug.jpg', './medaillen/rakete.jpg', './medaillen/buch.jpg', './medaillen/pinsel.jpg', './medaillen/krone.jpg', './medaillen/blatt.jpg', './medaillen/note.jpg', './medaillen/herz.jpg', './medaillen/schluessel.jpg', './medaillen/kompass.jpg', './feedback.js', './icon-180.png', './icon-192.png', './manifest.webmanifest', '../nova/nova.js', '../nova/puppe.js', '../nova/puppe.css', '../nova/seelen.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('hasi-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
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
