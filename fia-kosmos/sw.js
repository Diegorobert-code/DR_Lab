/* Fia Körperkosmos: Offline-Kopie. Netz zuerst (immer die neuste Fassung), die Kopie nur als Ersatz ohne Netz.
   Speichert keine Eingaben, nur die Dateien der App. */
const CACHE = 'fia-kosmos-v3';
const DATEIEN = ['./', 'index.html', 'manifest.webmanifest', 'feedback.js', 'figur.jpg', 'figur-gross.jpg', 'icon-180.png', 'icon-192.png', 'posen/posen.json', 'posen/fliegt.jpg', 'posen/wacht.jpg',
  'posen/atmet.jpg', 'posen/freut.jpg', 'posen/schlaeft.jpg', 'posen/lauscht.jpg', 'posen/ruht.jpg',
  '../nova/intro.js', '../nova/seelen.js', '../nova/nova.js', '../nova/nova.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(DATEIEN.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('fia-kosmos-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok && /\/(fia-kosmos|nova)\//.test(url.pathname)) { const kopie = res.clone(); caches.open(CACHE).then(c => c.put(r, kopie)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : undefined))));
});
