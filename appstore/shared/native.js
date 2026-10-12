/* DR Lab: kleine Brücke für die iPhone-App (Capacitor).
   Läuft nur in der App, im Browser macht sie nichts.
   Ersetzt die Web-Mitteilungen (gibt es in iOS-Apps nicht) durch echte iPhone-Mitteilungen. */
(function () {
  var C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  document.documentElement.classList.add('native-app');
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
