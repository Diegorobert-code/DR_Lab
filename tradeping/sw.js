// TradePing – Offline-Cache (nur eigene Dateien, keine Kursdaten)
const CACHE = 'tp-v5';
const SERVER = 'https://sense-179-237-127-58.sslip.io/kursping';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './figur.jpg', './ping-3d.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return; // Kurse nie cachen
  e.respondWith(
    fetch(e.request.mode === 'navigate' ? e.request.url : e.request, { cache: 'no-cache' }).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./')));
});
// Kurs-Ping: der Server schickt einen leeren Push, den Text holen wir hier ab.
self.addEventListener('push', e => {
  e.waitUntil(self.registration.pushManager.getSubscription()
    .then(sub => fetch(SERVER + '/meldung?ep=' + encodeURIComponent(sub ? sub.endpoint : ''), { cache: 'no-store' }))
    .then(r => r.json()).catch(() => ({ titel: 'Mr. Ping', text: 'Schau kurz in die App.' }))
    .then(m => self.registration.showNotification(m.titel || 'Mr. Ping', { body: m.text || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: 'kursping-' + Date.now() })));
});
