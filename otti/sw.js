// Otti – Offline-Cache (nur eigene Dateien, keine Gespräche)
const CACHE = 'otti-v16';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './otti-3d.jpg', './freunde/otti.jpg', './freunde/hoppel.jpg', './freunde/flori.jpg', './freunde/fompa.jpg', './freunde/kiki.jpg', './freunde/nova.jpg', './freunde/zahnboecklein.jpg', './freunde/eule.jpg', './freunde/schnecki.jpg', './freunde/kissenwolke.jpg', './posen/winkt.jpg', './posen/lacht.jpg', './posen/schlaeft.jpg', './posen/staunt.jpg', './posen/versteckt.jpg', './posen/anruf.jpg', '../nova/puppe.js', '../nova/puppe.css', '../nova/puppe/otti/arm-links.png', '../nova/puppe/otti/arm-rechts.png', '../nova/puppe/otti/augen-halb.png', '../nova/puppe/otti/augen-zu.png', '../nova/puppe/otti/ausdruck-denkt.png', '../nova/puppe/otti/ausdruck-freut.png', '../nova/puppe/otti/ausdruck-staunt.png', '../nova/puppe/otti/koerper.png', '../nova/puppe/otti/kopf.png', '../nova/puppe/otti/mund-a.png', '../nova/puppe/otti/mund-e.png', '../nova/puppe/otti/mund-f.png', '../nova/puppe/otti/mund-l.png', '../nova/puppe/otti/mund-laecheln.png', '../nova/puppe/otti/mund-m.png', '../nova/puppe/otti/mund-o.png', '../nova/puppe/otti/mund-u.png', '../nova/puppe/otti/mund-x.png', '../nova/puppe/otti/puppe.json', './elevenlabs-client-1.26.0.js', './feedback.js', './posen/index.json', '../nova/nova.js', '../nova/intro.js', '../nova/seelen.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request.mode === 'navigate' ? e.request.url : e.request, { cache: 'no-cache' }).then(r => {
      if (r.ok && r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
