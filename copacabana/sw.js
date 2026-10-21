/* Geschenk Lädeli Copacabana – Offline-Kopie (nur eigene Dateien, kein Korb, keine Eingaben). Netz zuerst, Kopie als Ersatz. */
const CACHE = 'copacabana-v2';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './runde4.js', './runde6.js', './runde7.js', './copa.js', './copa/winkt.jpg', './copa/freut.jpg', './copa/produkte.jpg', './saison/advent.jpg', './saison/halloween.jpg', './besuch/granny.jpg', './besuch/hasi.jpg', './besuch/waefwaef.jpg', './icon-180.png', './icon-192.png'];
const EXTRA = ['../nova/puppe.js', '../nova/puppe.css', '../nova/nova.js', '../nova/seelen.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(DATEIEN.concat(EXTRA).map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('copacabana-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const k = res.clone(); caches.open(CACHE).then(c => c.put(r, k)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
