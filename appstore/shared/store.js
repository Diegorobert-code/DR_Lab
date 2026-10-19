/* DR Lab: Anpassungen für die App-Store-Version (läuft nur im iPhone-Build, web-bauen.mjs bindet sie ein).
   Einstellungen kommen aus appstore/apps.json als window.DRLAB_STORE = {ordner, kinder, verstecken}.
   1. Links zu anderen DR-Lab-Apps ausblenden (die sind in dieser App nicht dabei).
   2. Bereiche mit Käufen, Guthaben oder Abo-Hinweisen ausblenden (Apple 3.1.1: nur In-App-Kauf erlaubt).
   3. Kinder-Apps: alles, was die App verlässt (Links, Teilen, Mail, Telefon), erst nach der Elternsperre. */
(function () {
  var C = window.DRLAB_STORE || {};
  var ORDNER = '/' + (C.ordner || '') + '/';
  var pfad = location.pathname, stelle = pfad.lastIndexOf(ORDNER);
  var BASIS = stelle >= 0 ? pfad.slice(0, stelle + ORDNER.length) : ORDNER;
  document.documentElement.classList.add('drlab-store');

  /* ---------- 1. + 2. Ausblenden ---------- */
  function fremd(a) {
    var h = a.getAttribute('href');
    if (!h || h.charAt(0) === '#' || /^(javascript|blob|data):/i.test(h)) return false;
    var u;
    try { u = new URL(h, location.href); } catch (e) { return false; }
    if (u.origin !== location.origin) return false;
    return u.pathname.indexOf(BASIS) !== 0 && !/\.(jpe?g|png|webp|gif|svg|mp3|mp4|json|css|js)$/i.test(u.pathname);
  }
  function weg(el) { if (el && el.style.display !== 'none') { el.style.setProperty('display', 'none', 'important'); el.setAttribute('data-store-aus', ''); } }
  function aufraeumen(wurzel) {
    if (!wurzel || !wurzel.querySelectorAll) return;
    var links = wurzel.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) if (fremd(links[i])) weg(links[i]);
    (C.verstecken || []).forEach(function (v) {
      var els = wurzel.querySelectorAll(v[0]);
      for (var j = 0; j < els.length; j++) if (!v[1] || (els[j].textContent || '').indexOf(v[1]) >= 0) weg(els[j]);
    });
  }
  function los() {
    aufraeumen(document);
    if (window.MutationObserver) {
      var warte = null;
      new MutationObserver(function () {
        if (warte) return;
        warte = setTimeout(function () { warte = null; aufraeumen(document); }, 60);
      }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();

  /* ---------- 3. Elternsperre (Kinder-Apps) ---------- */
  if (!C.kinder) return;
  var ZAHL = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
  var offen = false;
  function sperre(weiter, abbruch) {
    if (offen) { if (abbruch) abbruch(); return; }
    offen = true;
    var a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7);
    var w = document.createElement('div');
    w.setAttribute('role', 'dialog');
    w.setAttribute('aria-modal', 'true');
    w.setAttribute('aria-label', 'Elternsperre');
    w.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(6,10,28,.88);display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,sans-serif';
    w.innerHTML = '<div style="background:#13204a;border:1px solid rgba(242,193,78,.5);border-radius:22px;padding:22px;max-width:340px;width:100%;color:#f3ece4;text-align:center">' +
      '<b style="display:block;font-size:20px;color:#f2c14e;margin-bottom:6px">Für Erwachsene</b>' +
      '<p style="margin:0 0 12px;font-size:16px;line-height:1.4">Das öffnet etwas ausserhalb der App. Bitte rechnen:<br><b></b></p>' +
      '<input inputmode="numeric" pattern="[0-9]*" maxlength="3" aria-label="Ergebnis" style="width:120px;font-size:24px;text-align:center;padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,.3);background:#0b1636;color:#fff">' +
      '<div style="display:flex;gap:10px;margin-top:16px"><button type="button" data-n="0" style="flex:1;padding:14px;border-radius:999px;border:0;background:rgba(255,255,255,.12);color:#fff;font-size:16px">Abbrechen</button>' +
      '<button type="button" data-n="1" style="flex:1;padding:14px;border-radius:999px;border:0;background:#f2c14e;color:#2a1d00;font-weight:700;font-size:16px">Weiter</button></div></div>';
    w.querySelector('p b').textContent = 'Wie viel ist ' + ZAHL[a] + ' mal ' + ZAHL[b] + '?';
    var ein = w.querySelector('input');
    function zu() { offen = false; w.remove(); }
    w.querySelector('[data-n="0"]').onclick = function () { zu(); if (abbruch) abbruch(); };
    w.querySelector('[data-n="1"]').onclick = function () {
      if (parseInt(ein.value, 10) === a * b) { zu(); weiter(); }
      else { ein.value = ''; ein.style.borderColor = '#e66'; ein.focus(); }
    };
    document.body.appendChild(w);
    setTimeout(function () { ein.focus(); }, 50);
  }
  function raus(h) {
    if (!h) return false;
    try { var u = new URL(h, location.href); return u.origin !== location.origin; } catch (e) { return false; }
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || !raus(a.getAttribute('href'))) return;
    e.preventDefault();
    e.stopPropagation();
    var h = a.href;
    sperre(function () { location.href = h; });
  }, true);
  var auf = window.open;
  window.open = function (url) {
    var args = arguments;
    if (!raus(url)) return auf.apply(window, args);
    sperre(function () { auf.apply(window, args); });
    return null;
  };
  if (navigator.share) {
    var teilen = navigator.share.bind(navigator);
    navigator.share = function (daten) {
      return new Promise(function (ok, nein) {
        sperre(function () { teilen(daten).then(ok, nein); }, function () {
          var f = new Error('Abgebrochen'); f.name = 'AbortError'; nein(f);
        });
      });
    };
  }
})();
