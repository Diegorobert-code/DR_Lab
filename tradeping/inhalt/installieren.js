/* «Auf den Homescreen»: kurzer Hinweis für iPhone-Safari, Knopf für Android. Nur Gerät, nichts wird gesendet. */
(function () {
  'use strict';
  var KEY = 'drlab-installieren-' + (location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'app');
  function lies() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function schreib(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (standalone) return;
  var ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var safari = ios && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  var d = lies(); d.besuche = (d.besuche || 0) + 1; schreib(d);
  if (d.zu && Date.now() - d.zu < 1000 * 60 * 60 * 24 * 14) return;
  var name = (document.querySelector('meta[name=apple-mobile-web-app-title]') || {}).content || document.title;
  var css = '.ii-blatt{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:2147483000;background:#fff;color:#2a2420;border-radius:18px;box-shadow:0 10px 40px rgba(0,0,0,.25);padding:16px 16px 14px;font:15px/1.45 system-ui,-apple-system,sans-serif;max-width:440px;margin:0 auto;transform:translateY(140%);transition:transform .3s ease}' +
    '.ii-blatt.ii-auf{transform:none}.ii-blatt b{display:block;font-size:16px;margin:0 32px 4px 0}.ii-blatt p{margin:0}' +
    '.ii-zu{position:absolute;top:8px;right:8px;width:36px;height:36px;border:0;border-radius:50%;background:#f1ece6;color:#2a2420;font-size:16px;cursor:pointer}' +
    '.ii-los{margin-top:10px;min-height:44px;width:100%;border:0;border-radius:12px;background:#2a2420;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer}' +
    '.ii-teilen{display:inline-block;width:18px;height:18px;vertical-align:-3px}' +
    '@media (prefers-color-scheme:dark){.ii-blatt{background:#2a2420;color:#f4ece4}.ii-zu{background:#3a322c;color:#f4ece4}.ii-los{background:#f4ece4;color:#2a2420}}';
  var TEILEN = '<svg class="ii-teilen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  function zeige(html, knopf) {
    if (document.querySelector('.ii-blatt')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var b = document.createElement('div'); b.className = 'ii-blatt'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Auf den Homescreen');
    b.innerHTML = '<button type="button" class="ii-zu" aria-label="Schliessen">✕</button>' + html + (knopf ? '<button type="button" class="ii-los">Installieren</button>' : '');
    document.body.appendChild(b);
    requestAnimationFrame(function () { requestAnimationFrame(function () { b.classList.add('ii-auf'); }); });
    function weg() { b.classList.remove('ii-auf'); var x = lies(); x.zu = Date.now(); schreib(x); setTimeout(function () { b.remove(); }, 320); }
    b.querySelector('.ii-zu').addEventListener('click', weg);
    if (knopf) b.querySelector('.ii-los').addEventListener('click', function () { knopf(); weg(); });
  }
  window.DRLAB_INSTALLIEREN = { zeigeIOS: function () { zeigeIOSHinweis(); } };
  function zeigeIOSHinweis() {
    zeige('<b>' + name + ' auf den Homescreen</b><p>Tippe unten auf Teilen ' + TEILEN + ' und dann auf «Zum Home-Bildschirm». So öffnet sich die App wie jede andere, auch ohne Internet.</p>');
  }
  if (safari && d.besuche >= 2) setTimeout(zeigeIOSHinweis, 9000);
  var aufschub = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); aufschub = e;
    if (d.besuche >= 2) setTimeout(function () {
      zeige('<b>' + name + ' installieren</b><p>Dann ist die App mit einem Tipp da, auch ohne Internet.</p>', function () { aufschub.prompt(); });
    }, 9000);
  });
})();
