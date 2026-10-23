// TradePing – Offline-Cache (nur eigene Dateien, keine Kursdaten)
const CACHE = 'tp-v31';
const SERVER = 'https://sense-179-237-127-58.sslip.io/kursping';
const FILES = ['./schoen.css', './schoen.js', './ava.webp', './design.css', './feinschliff.css', './feinschliff.js', './ton-ios.js', './nda-sperre.js', './runde8.js', './markt.css', './wm/ausflug.jpg', './wm/avatar-dunkel.jpg', './wm/avatar-hell.jpg', './wm/maskottchen.jpg', './wm/stufe-1.jpg', './wm/stufe-2.jpg', './wm/stufe-3.jpg', './wm/stufe-4.jpg', './wm/stufe-5.jpg', './schule.html', './runde7.js', './runde6.js', './saison/advent.jpg', './besuch/coinmaker.jpg', './besuch/fompa.jpg', './besuch/granny.jpg', './', './index.html', './lernen.js', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './figur.jpg', './figur-gross.jpg', './ping-3d.jpg', './mrping.js', './mrping2.js', './spieltopf.js', './runde4.js', './posen/posen.json', './posen/ping.jpg', './posen/jubel.jpg', './posen/warn.jpg', './posen/schlaf.jpg', './posen/denk.jpg', './posen/denkt.jpg', './posen/winkt.jpg', './feedback.js'];
self.addEventListener('install', e => {
  // Gemeinsame Bausteine (Nova, Intro, Sprechen) tolerant dazu: fehlt einer, startet die App trotzdem offline.
  const EXTRA = ['../nova/puppe.js', '../nova/puppe.css', '../nova/intro.js', '../nova/nova.js', '../nova/seelen.js', '../apps/sprechen/sprechen.js'];
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).then(() => Promise.all(EXTRA.map(u => c.add(u).catch(() => {})))) ).then(() => self.skipWaiting()));
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
// Ein Push-Empfang für beide Wege:
// - TradePing-Wache (server/tradeping-wache.py) schickt den Text gleich mit (JSON mit title).
// - Kurs-Ping (tools/server/kursping.py) schickt einen leeren Push, den Text holen wir bei /meldung ab.
self.addEventListener('push', e => {
  let d = null;
  try { d = e.data ? e.data.json() : null; } catch (x) { d = e.data && e.data.text() ? { body: e.data.text() } : null; }
  if (d && (d.title || d.body)) {
    e.waitUntil(self.registration.showNotification(d.title || 'Deine Marke ist erreicht.', {
      body: d.body || '', tag: d.tag || 'tp-wache', icon: 'icon-192.png', badge: 'icon-192.png', data: d.tp || null
    }));
    return;
  }
  e.waitUntil(self.registration.pushManager.getSubscription()
    .then(sub => fetch(SERVER + '/meldung?ep=' + encodeURIComponent(sub ? sub.endpoint : ''), { cache: 'no-store' }))
    .then(r => r.json()).catch(() => ({ titel: 'Mr. Ping', text: 'Schau kurz in die App.' }))
    .then(m => self.registration.showNotification(m.titel || 'Mr. Ping', { body: m.text || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: 'kursping-' + Date.now() })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./')));
});
