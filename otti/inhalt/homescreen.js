/* homescreen.js – Hinweis «Auf den Homescreen» für iPhone und iPad in Safari (dort gibt es keinen Installieren-Knopf).
   Erscheint nur im Browser, nicht in der installierten App, und höchstens alle 14 Tage. Schliessen merkt sich das nur auf diesem Gerät. */
(function () {
  'use strict';
  var d = document, KEY = 'hs_hinweis', ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var safari = ios && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  var installiert = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  function zeigen() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
    var name = (d.querySelector('meta[name="apple-mobile-web-app-title"]') || {}).content || d.title.split(/[–|·-]/)[0].trim();
    var b = d.createElement('div'); b.className = 'hs-hinweis'; b.setAttribute('role', 'status');
    b.innerHTML = '<span class="hs-e" aria-hidden="true">📲</span><span class="hs-tx"><b>' + name.replace(/[<>&]/g, '') + ' auf den Homescreen</b><small>Unten auf Teilen <span aria-label="Teilen-Symbol">⎋</span> tippen, dann «Zum Home-Bildschirm». So startet die App wie eine richtige App und geht auch offline.</small></span><button type="button" aria-label="Hinweis schliessen">✕</button>';
    b.querySelector('button').addEventListener('click', function () { b.remove(); try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} });
    var st = d.createElement('style');
    st.textContent = '.hs-hinweis{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 10px);z-index:2147482000;display:flex;align-items:center;gap:10px;padding:10px 10px 10px 14px;border-radius:18px;background:#16224a;color:#fff6e0;border:1.5px solid #ffd27a;box-shadow:0 10px 30px rgba(0,0,0,.45);font:15px/1.35 ui-rounded,system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto}' +
      '.hs-hinweis .hs-e{font-size:26px;flex:none}.hs-hinweis .hs-tx{flex:1;display:flex;flex-direction:column;min-width:0}.hs-hinweis b{color:#ffe2a0}.hs-hinweis small{font-size:13px;color:#d6cdf2}' +
      '.hs-hinweis button{flex:none;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff6e0;font-size:18px;margin:0;box-shadow:none}' +
      'html.ih-offen .hs-hinweis,html.sp-offen .hs-hinweis,html.wt-offen .hs-hinweis{display:none}';
    d.head.appendChild(st); d.body.appendChild(b);
    setTimeout(function () { if (b.isConnected) b.remove(); }, 20000);
  }
  function los() {
    var zuletzt = 0; try { zuletzt = +localStorage.getItem(KEY) || 0; } catch (e) {}
    if (window.HS_TEST || (safari && !installiert && Date.now() - zuletzt > 14 * 864e5)) setTimeout(zeigen, window.HS_TEST ? 0 : 5000);
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', los); else los();
})();
