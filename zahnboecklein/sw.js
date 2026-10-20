/* Zahnböcklein Service Worker: Offline-Cache.
   Beim Erhöhen der App-Version VERSION ändern, dann wird der alte Cache gelöscht.
   Liegt neben index.html (die App-Datei zahnboecklein-app.html beim Veröffentlichen in index.html umbenennen).
   Audiodateien, falls als eigene Dateien ausgeliefert, unten in DATEIEN ergänzen. */
const VERSION = 'zahnboecklein-v4-2';
const DATEIEN = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-48.png',
  './icons/icon-120.png',
  './icons/icon-152.png',
  './icons/icon-167.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-1024.png',
  './icons/icon-maskable-512.png',
  './bilder/tanz01.jpg',
  './bilder/tanz02.jpg',
  './bilder/tanz03.jpg',
  './bilder/tanz04.jpg',
  './bilder/tanz05.jpg',
  './bilder/tanz06.jpg',
  './bilder/tanz07.jpg',
  './bilder/tanz08.jpg',
  './bilder/tanz09.jpg',
  './bilder/tanz10.jpg',
  './bilder/poster-fee.jpg',
  './bilder/poster-tanz.jpg',
  './audio/a_ol.mp3',
  './audio/a_or.mp3',
  './audio/a_ul.mp3',
  './audio/a_ur.mp3',
  './audio/f01.mp3',
  './audio/f02.mp3',
  './audio/f03.mp3',
  './audio/f04.mp3',
  './audio/f05.mp3',
  './audio/f06.mp3',
  './audio/f07.mp3',
  './audio/f08.mp3',
  './audio/f09.mp3',
  './audio/f10.mp3',
  './audio/fertig.mp3',
  './audio/halb.mp3',
  './audio/hallo.mp3',
  './audio/lob1.mp3',
  './audio/lob2.mp3',
  './audio/lob3.mp3',
  './audio/nacht.mp3',
  './audio/party.mp3',
  './audio/party_fertig.mp3',
  './audio/r01.mp3',
  './audio/r02.mp3',
  './audio/r03.mp3',
  './audio/r04.mp3',
  './audio/r05.mp3',
  './audio/r06.mp3',
  './audio/r07.mp3',
  './audio/r08.mp3',
  './audio/r09.mp3',
  './audio/r10.mp3',
  './audio/r11.mp3',
  './audio/r12.mp3',
  './audio/r13.mp3',
  './audio/r14.mp3',
  './audio/r15.mp3',
  './audio/r16.mp3',
  './audio/r17.mp3',
  './audio/r18.mp3',
  './audio/r19.mp3',
  './audio/r20.mp3',
  './audio/r21.mp3',
  './audio/r22.mp3',
  './audio/r23.mp3',
  './audio/r24.mp3',
  './audio/r25.mp3',
  './audio/r26.mp3',
  './audio/r27.mp3',
  './audio/r28.mp3',
  './audio/r29.mp3',
  './audio/r30.mp3',
  './audio/spuck.mp3',
  './audio/t_kau.mp3',
  './audio/t_ol.mp3',
  './audio/t_or.mp3',
  './audio/t_ul.mp3',
  './audio/t_ur.mp3',
  './audio/t_zf.mp3',
  './audio/zunge.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(DATEIEN))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // nur eigene Dateien, nichts von Dritten

  // Seiten: zuerst Netz (für Updates), sonst Cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Bilder, Icons, Audio: zuerst Cache, sonst Netz und merken
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});
