/* DR Lab: kleine Brücke für die iPhone-App (Capacitor).
   Läuft nur in der App, im Browser macht sie nichts.
   Ersetzt die Web-Mitteilungen (gibt es in iOS-Apps nicht) durch echte iPhone-Mitteilungen. */
(function () {
  var C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  document.documentElement.classList.add('native-app');
  // Push vom Server (nur Apps mit dem Push-Baustein, z. B. TradePing mit Wache).
  // Fragt nie selbst nach Erlaubnis: meldet sich nur an, wenn Mitteilungen schon erlaubt sind.
  if (C.isPluginAvailable && C.isPluginAvailable('PushNotifications')) {
    var PN = (C.Plugins && C.Plugins.PushNotifications) || C.registerPlugin('PushNotifications');
    var aufToken = null, hoert = false;
    window.DRPush = function (cb) {
      aufToken = cb;
      PN.checkPermissions().then(function (r) {
        if (!r || r.receive !== 'granted') return;
        if (!hoert) {
          hoert = true;
          PN.addListener('registration', function (t) { if (aufToken && t && t.value) aufToken(t.value); });
          PN.addListener('registrationError', function () {});
        }
        return PN.register();
      }).catch(function () {});
    };
  }
  var LN = (C.Plugins && C.Plugins.LocalNotifications) || (C.registerPlugin && C.registerPlugin('LocalNotifications'));
  if (!LN) return;
  function stand(r) { return r && r.display === 'granted' ? 'granted' : (r && r.display === 'denied' ? 'denied' : 'default'); }
  var zaehler = 1;
  function Mitteilung(titel, opts) {
    opts = opts || {};
    LN.schedule({ notifications: [{ id: (Date.now() % 100000000) + (zaehler++), title: String(titel || ''), body: String(opts.body || ''), schedule: { at: new Date(Date.now() + 500), allowWhileIdle: true } }] }).catch(function () {});
  }
  Mitteilung.permission = 'default';
  Mitteilung.requestPermission = function (cb) {
    return LN.requestPermissions().then(function (r) {
      Mitteilung.permission = stand(r);
      if (typeof cb === 'function') cb(Mitteilung.permission);
      return Mitteilung.permission;
    });
  };
  LN.checkPermissions().then(function (r) { Mitteilung.permission = stand(r); }).catch(function () {});
  window.Notification = Mitteilung;
})();
