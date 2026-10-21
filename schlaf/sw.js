/* Fias Nest offline: zuerst Netz, sonst Kopie aus dem Cache. Nur eigene Dateien, nie Server-Anfragen. */
const CACHE = 'fiasnest-v10';
const KERN = ['runde6.js', 'besuch/otti.jpg', 'besuch/granny.jpg', 'besuch/waefwaef.jpg', 'besuch/hasi.jpg', 'besuch/mama-affe.jpg', 'saison/advent.jpg', './', 'index.html', 'manifest.webmanifest', 'cover.jpg', 'icon-192.png', 'icon-180.png',
  'posen/wach.jpg', 'posen/schlaeft.jpg', 'posen/atmet.jpg', 'posen/muede.jpg', 'posen/fliegt.jpg',
  'posen/freut.jpg', 'posen/hoert.jpg', 'posen/staedtchen-nacht.jpg', 'posen/winkt.jpg', 'posen/zeigt.jpg', 'posen/liegt.jpg', 'posen/geschichte.jpg',
  'figuren/fia.jpg', 'figuren/otti.jpg', 'figuren/sunny.jpg', 'figuren/waef.jpg', 'feedback.js',
  '../nova/nova.js', '../nova/seelen.js', '../nova/puppe.js', '../nova/puppe.css'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(KERN.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith('fiasnest-') && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const k = res.clone(); caches.open(CACHE).then(c => c.put(r, k)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
