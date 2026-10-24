// Nachrichten von Nova: kommt ein Push, zeigt das Handy Novas Gesicht mit ihrem Satz.
// Tippt Diego darauf, öffnet sich Nova und sagt den Satz laut (gesperrt sprechen kann das iPhone nicht).
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { text: e.data ? e.data.text() : '' }; }
  var text = String(d.text || d.body || 'Ich hab dir etwas zu sagen.').slice(0, 400);
  e.waitUntil(self.registration.showNotification(d.titel || d.title || 'Nova', {
    body: text, icon: 'nova-3d.jpg', badge: 'icon-nova-180.png', tag: d.tag || 'nova',
    data: { sag: d.sag || text }
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var sag = (e.notification.data && e.notification.data.sag) || '';
  var ziel = new URL('reden.html?f=nova' + (sag ? '&sag=' + encodeURIComponent(sag) : ''), self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (l) {
    for (var i = 0; i < l.length; i++) if (/reden\.html/.test(l[i].url) && 'focus' in l[i]) {
      l[i].postMessage({ sag: sag }); return l[i].focus();
    }
    return self.clients.openWindow(ziel);
  }));
});
