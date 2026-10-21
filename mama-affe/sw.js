/* Mama Affe: Offline-Kopie. Netz zuerst (immer die neuste Fassung), die Kopie nur als Ersatz ohne Netz.
   Speichert keine Eingaben, nur die Dateien der App. */
const CACHE = 'mama-affe-v10';
const DATEIEN = ['./runde6.js', './saison/advent.jpg', './besuch/otti.jpg', './besuch/fia.jpg', './besuch/waefwaef.jpg', './besuch/flo.jpg', './', 'index.html', 'bereich.js', 'bereich.css', 'feedback.js', 'figur.jpg', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest', 'posen/posen.json',
  'posen/winkt.jpg', 'posen/denkt.jpg', 'posen/schlaeft.jpg', 'posen/atmet.jpg', 'posen/turnt.jpg', 'posen/wuerfelt.jpg', 'posen/wetter.jpg',
  '../nova/intro.js', '../nova/seelen.js', '../nova/nova.js', '../nova/puppe.js', '../nova/puppe.css', '../nova/nova.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(DATEIEN.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mama-affe-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok && /\/(mama-affe|nova)\//.test(url.pathname)) { const kopie = res.clone(); caches.open(CACHE).then(c => c.put(r, kopie)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : undefined))));
});
