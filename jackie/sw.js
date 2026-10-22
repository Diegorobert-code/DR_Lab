/* Jackie's Advice: offline-Kopie, damit Hilfebereich, Notrufe und Rezeptseite auch ohne Netz gehen.
   Netz zuerst (immer die neuste Fassung), die Kopie nur als Ersatz. Speichert keine Eingaben. */
const CACHE = 'jackie-v11';
const DATEIEN = ['./runde8.js', './markt.css', './wm/atem.jpg', './wm/ausflug.jpg', './wm/maskottchen.jpg', './wm/stufe-1.jpg', './wm/stufe-2.jpg', './wm/stufe-3.jpg', './wm/stufe-4.jpg', './wm/stufe-5.jpg', './runde7.js', './runde6.js', './saison/advent.jpg', './besuch/fia.jpg', './besuch/granny.jpg', './besuch/otti.jpg', './', 'index.html', 'schutz.js', 'unterwegs.js', 'rezept.html', 'feedback.js', 'figur.jpg', 'jackie-3d.jpg', 'schuhmacher.jpg', 'icon.svg', 'icon-180.png', 'icon-192.png', 'manifest.webmanifest', 'posen/posen.json', 'posen/winkt.jpg', 'posen/zuhoeren.jpg', 'posen/zeigt.jpg', 'posen/mutig.jpg', '../nova/puppe.js', '../nova/puppe.css', '../nova/nova.js', '../nova/seelen.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(DATEIEN.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('jackie-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok && url.pathname.indexOf('/jackie/') > -1) { const kopie = res.clone(); caches.open(CACHE).then(c => c.put(r, kopie)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : undefined))));
});
