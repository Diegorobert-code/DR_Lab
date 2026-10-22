/* Runde 9 (Feinschliff): Schlaf-Timer mit sanftem Ausblenden von Stimme und Musik (10/20/30 Min.)
   und «Nur hören» mit ganz schwarzem Bildschirm (Tippen zeigt kurz die Steuerung). Alles auf dem Handy, kein Server. */
(function () {
  if (window.MS_R9) return; window.MS_R9 = true;
  var K = 'mondschein.r9.';
  function hol(k, d) { try { var v = localStorage.getItem(K + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  var ruhig = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var TON = window.MS_TON || {};
  var AUSBLENDEN = 90000; // die letzten 90 Sekunden wird alles langsam leiser

  /* ---------- Aussehen ---------- */
  var css = [
    'body:has(.blatt:not([hidden])) .nova-btn,html.hoermodus .nova-btn,body:has(.r9-nacht) .nova-btn,body:has(.r7-voll) .nova-btn{visibility:hidden}',
    '.nova-panel .nova-ton,.nova-panel .mic,.nova-panel .nova-live-knopf,.nova-panel .nova-einsetzen{min-width:48px;min-height:48px}',
    '.r7-chips button{min-height:48px}',
    /* Nur hören: schwarz, Steuerung nur nach Tippen */
    'html.hoermodus .r8-toastwachs{display:none}',
    '#hoeren>*{transition:opacity 1.6s ease}',
    '#hoeren.r9-schwarz{background:#000;cursor:none}',
    '#hoeren.r9-schwarz>*{opacity:0!important;pointer-events:none}',
    '#hoeren .r9-uhr{display:flex;flex-direction:column;align-items:center;gap:8px}',
    '#hoeren .r9-uhr .r9-reihe{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}',
    '#hoeren .r9-uhr button{min-width:64px;min-height:48px;border-radius:999px;border:1px solid #313a63;background:#0a0f22;color:#c3cae3;font:inherit;font-size:16px;font-weight:700;cursor:pointer}',
    '#hoeren .r9-uhr button[aria-pressed=true]{background:#2b2f55;border-color:#8c7d4c;color:#f2e2b0}',
    '#hoeren .r9-uhr small{font-size:14px;opacity:.6;min-height:1.3em}',
    '@media (max-height:560px){#hoeren{gap:10px!important;justify-content:safe center!important;overflow-y:auto}#hoeren .h-knopf{width:96px!important;height:96px!important;font-size:38px!important}#hoeren .h-mond,#hoeren .h-info{display:none}#hoeren>*{flex-shrink:0}#hoeren .h-titel{min-height:0;margin-top:44px}#hoeren .r9-tipp{position:static}}',
    '#hoeren .r9-tipp{position:absolute;bottom:calc(env(safe-area-inset-bottom) + 14px);left:0;right:0;text-align:center;font-size:13px;opacity:.65}',
    /* Nacht nach dem Timer */
    '.r9-nacht{position:fixed;inset:0;z-index:2147483000;background:#000;color:#9aa3c7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;padding:24px}',
    '.r9-nacht .r9-mond{width:56px;height:56px;border-radius:50%;background:radial-gradient(circle at 40% 40%,#8c7d4c,#352f1d);opacity:.35}',
    '.r9-nacht p{margin:0;font-size:18px;opacity:.6;transition:opacity 6s ease}',
    '.r9-nacht button{min-height:48px;padding:8px 20px;border-radius:999px;border:1px solid #262d52;background:transparent;color:#9aa3c7;font:inherit;font-size:15px;opacity:.5;cursor:pointer;transition:opacity 6s ease}',
    '@media (prefers-reduced-motion:no-preference){.r9-nacht{animation:r9-dunkel 2.5s ease-out}@keyframes r9-dunkel{from{opacity:0}to{opacity:1}}}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- Lautstärke sanft ausblenden ---------- */
  var faktor = 1, medien = new Set(), basis = new WeakMap(), vol0 = null;
  var spiel = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    try { medien.add(this); if (!basis.has(this)) basis.set(this, this.volume); if (faktor < 1) this.volume = Math.max(0, basis.get(this) * faktor); } catch (e) {}
    return spiel.apply(this, arguments);
  };
  function setzeFaktor(f) {
    faktor = Math.max(0, Math.min(1, f));
    if (TON.S) { if (vol0 === null) vol0 = TON.S.vol == null ? 1 : +TON.S.vol; TON.S.vol = vol0 * faktor; }
    medien.forEach(function (m) { try { if (!m.isConnected && m.paused) { medien.delete(m); return; } m.volume = Math.max(0, (basis.has(m) ? basis.get(m) : 1) * faktor); } catch (e) {} });
  }
  function lautZurueck() {
    if (TON.S && vol0 !== null) TON.S.vol = vol0;
    medien.forEach(function (m) { try { if (basis.has(m)) m.volume = basis.get(m); } catch (e) {} });
    faktor = 1; vol0 = null;
  }

  /* ---------- Schlaf-Timer ---------- */
  var ende = hol('ende', 0), tickT = 0, nacht = null;
  // Eine noch laufende Einschlaf-Uhr aus Runde 7 übernehmen (ihr eigener Zähler läuft dann ins Leere)
  try {
    var alt = JSON.parse(localStorage.getItem('mondschein.r7.ende') || '0');
    if (alt && alt > Date.now()) { ende = alt; leg('ende', ende); }
    if (alt) localStorage.setItem('mondschein.r7.ende', JSON.stringify(Date.now() + 1e12));
  } catch (e) {}
  function restMs() { return ende ? ende - Date.now() : 0; }
  function text() {
    var r = restMs();
    if (!ende || r <= 0) return 'Der Schlaf-Timer ist aus.';
    return r <= AUSBLENDEN ? 'Alles wird jetzt langsam leiser …' : 'Noch ' + Math.ceil(r / 60000) + ' Min., dann wird es still.';
  }
  function anzeigen() {
    var t = text(), m = ende && restMs() > 0 ? hol('min', 0) : 0;
    document.querySelectorAll('.r9-st').forEach(function (p) { if (p.textContent !== t) p.textContent = t; });
    document.querySelectorAll('[data-r9m]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-r9m') === m)); });
  }
  function setze(min) {
    if (nacht) return;
    ende = min ? Date.now() + min * 60000 : 0; leg('ende', ende); leg('min', min);
    lautZurueck(); anzeigen(); plan();
  }
  function plan() {
    clearInterval(tickT);
    if (!ende) return;
    tickT = setInterval(function () {
      var r = restMs();
      if (r <= 0) { clearInterval(tickT); still(); return; }
      if (r <= AUSBLENDEN) setzeFaktor(r / AUSBLENDEN);
      anzeigen();
    }, 500);
  }
  function still() {
    ende = 0; leg('ende', 0); leg('min', 0);
    try { var h = window.MS_HOEREN; if (h && h.zustand().on && h.pause) h.pause(true); } catch (e) {}
    try { TON.TTS && TON.TTS.stop(); } catch (e) {}
    try { TON.MUSIK && TON.MUSIK.stop(); } catch (e) {}
    try { speechSynthesis.cancel(); } catch (e) {}
    medien.forEach(function (m) { try { m.pause(); } catch (e) {} });
    lautZurueck(); anzeigen();
    nacht = document.createElement('div'); nacht.className = 'r9-nacht'; nacht.setAttribute('role', 'dialog'); nacht.setAttribute('aria-modal', 'true'); nacht.setAttribute('aria-label', 'Gute Nacht');
    nacht.innerHTML = '<div class="r9-mond" aria-hidden="true"></div><p>Gute Nacht. Schlaf gut.</p><button type="button">Wieder hell</button>';
    document.body.appendChild(nacht);
    var b = nacht.querySelector('button');
    b.onclick = function () { nacht.remove(); nacht = null; };
    setTimeout(function () { if (!nacht) return; nacht.querySelector('p').style.opacity = '.18'; b.style.opacity = '.2'; }, ruhig ? 0 : 6000);
    try { b.focus({ preventScroll: true }); } catch (e) {}
  }
  function chips(label) {
    return '<div class="r9-reihe" role="group" aria-label="' + label + '">' +
      [10, 20, 30, 0].map(function (m) { return '<button type="button" data-r9m="' + m + '" aria-pressed="false">' + (m ? m + ' Min.' : 'Aus') + '</button>'; }).join('') + '</div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-r9m]');
    if (b) { setze(+b.getAttribute('data-r9m')); return; }
    // Die Karte «Einschlaf-Uhr» aus Runde 7 nutzt jetzt diesen Timer (mit sanftem Ausblenden)
    var a = e.target.closest && e.target.closest('#r7-schlaf [data-m]');
    if (a) { e.stopPropagation(); e.preventDefault(); var m = +a.getAttribute('data-m'); setze(m); if (window.R7 && m) try { R7.toast('Gut. In ' + m + ' Minuten wird es leise und still.'); } catch (x) {} }
  }, true);
  (function karte(n) {
    var k = $('r7-schlaf');
    if (!k) { if (n < 60) setTimeout(function () { karte(n + 1); }, 150); return; }
    var p = k.querySelector('.r7-st'); if (p) { var q = p.cloneNode(false); q.className = 'r7-leise r9-st'; p.replaceWith(q); }
    k.querySelectorAll('[data-m]').forEach(function (b) { b.setAttribute('data-r9m', b.getAttribute('data-m')); b.removeAttribute('data-m'); });
    var t = k.querySelector('p'); if (t) t.textContent = 'Für Eltern: Hört ruhig eine Geschichte. Die letzten anderthalb Minuten werden Stimme und Musik langsam leiser, dann wird alles still und dunkel.';
    var h = k.querySelector('h2'); if (h && h.firstChild && h.firstChild.nodeType === 3) h.firstChild.textContent = '😴 Schlaf-Timer';
    anzeigen();
  })(0);

  /* ---------- Nur hören: schwarzer Bildschirm ---------- */
  (function hoeren(n) {
    var o = $('hoeren');
    if (!o) { if (n < 60) setTimeout(function () { hoeren(n + 1); }, 150); return; }
    var info = $('hInfo');
    var u = document.createElement('div'); u.className = 'r9-uhr';
    u.innerHTML = '<span style="font-size:15px;opacity:.7">🌙 Schlaf-Timer</span>' + chips('Schlaf-Timer') + '<small class="r9-st" aria-live="polite"></small>';
    if (info) info.after(u); else o.appendChild(u);
    var tp = document.createElement('p'); tp.className = 'r9-tipp'; tp.textContent = 'Der Bildschirm wird gleich schwarz. Tippen zeigt die Knöpfe.'; o.appendChild(tp);
    var t = 0;
    function spielt() { try { var z = window.MS_HOEREN.zustand(); return z.on && !z.pause; } catch (e) { return false; } }
    function zeigen() {
      o.classList.remove('r9-schwarz'); clearTimeout(t);
      t = setTimeout(function () { if (o.hidden) return; if (spielt()) o.classList.add('r9-schwarz'); else zeigen(); }, 6000);
    }
    // Erster Tipp auf den schwarzen Bildschirm zeigt nur die Steuerung, er drückt keinen Knopf.
    o.addEventListener('click', function (e) { if (o.classList.contains('r9-schwarz')) { e.stopPropagation(); e.preventDefault(); } zeigen(); }, true);
    o.addEventListener('pointerdown', function (e) { if (o.classList.contains('r9-schwarz')) e.preventDefault(); }, true);
    o.addEventListener('keydown', zeigen, true);
    new MutationObserver(function () { if (o.hidden) { clearTimeout(t); o.classList.remove('r9-schwarz'); } else { zeigen(); anzeigen(); } }).observe(o, { attributes: true, attributeFilter: ['hidden'] });
    anzeigen();
  })(0);

  anzeigen(); plan();
  window.MS_SCHLAF = { setze: setze, rest: restMs, faktor: function () { return faktor; }, _endeIn: function (ms) { ende = Date.now() + ms; leg('ende', ende); plan(); } };
})();
