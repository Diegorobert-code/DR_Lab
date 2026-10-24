/* design.js – Rosa im Look «Bilderrahmen» (Design-Umbau 23.10.2026). Nur Optik.
   1) Bilderrahmen unter dem Datum: zeigt das erste Familienfoto, das Angehörige unter «Für Angehörige»
      schon eingetragen haben (liegt nur auf diesem Handy, wird nur gelesen, nichts wird hochgeladen).
      Ohne Foto: warmer Platzhalter.
   2) Die alten fest eingebauten Farben (Markt-Look) werden auf die Rosé-Palette umgestellt. */
(function () {
  'use strict';
  if (window.__dzRosa) return; window.__dzRosa = 1;

  /* ---------- Farben ---------- */
  var MAP = {
    '#f6f1ea': '#f7efe9', '#e6dccd': '#ecdcd2', '#a8957c': '#b8978a', '#161412': '#3d2b22', '#4a443d': '#6b5247',
    '#a8480f': '#9a5440', '#8a3a0b': '#8a4632', '#fdeee0': '#f6e3da', '#fbf8f3': '#fbf5f1', '#f8f3ec': '#fbf4f0', '#ece4d8': '#efe2d9'
  };
  var RE = new RegExp(Object.keys(MAP).join('|'), 'gi');
  function umfaerben(st) {
    if (!st || st.tagName !== 'STYLE' || st.id === 'dz-x') return;
    var t = st.textContent; if (!RE.test(t)) return; RE.lastIndex = 0;
    st.textContent = t.replace(RE, function (m) { return MAP[m.toLowerCase()]; });
  }
  function alle() { [].forEach.call(document.querySelectorAll('style'), umfaerben); }
  alle();
  try {
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { [].forEach.call(m.addedNodes, umfaerben); });
    }).observe(document.head, { childList: true });
  } catch (e) {}
  window.addEventListener('load', alle);

  /* ---------- Bilderrahmen ---------- */
  var SVG = '<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M10 74 L42 40 L62 58 L80 44 L110 74Z" fill="#B9705A" opacity=".55"/>' +
    '<circle cx="88" cy="22" r="10" fill="#FFF4E8"/><path d="M58 20c-4-6-14-4-14 4 0 7 14 14 14 14s14-7 14-14c0-8-10-10-14-4z" fill="#9A5440"/></svg>';
  function foto() {
    try {
      var S = JSON.parse(localStorage.getItem('granny.v1')) || {};
      var l = (S.leute || []).filter(function (p) { return p && p.bild && /^data:image\//.test(p.bild); });
      return l[0] || null;
    } catch (e) { return null; }
  }
  var fig;
  function zeichnen() {
    if (!fig) return;
    var p = foto();
    fig.textContent = '';
    if (p) {
      var im = document.createElement('img'); im.src = p.bild; im.alt = p.n ? 'Foto von ' + p.n : 'Familienfoto';
      var cap = document.createElement('figcaption'); cap.textContent = p.n || '';
      fig.appendChild(im); if (p.n) fig.appendChild(cap);
    } else {
      var d = document.createElement('div'); d.className = 'dz-leer';
      d.innerHTML = SVG + '<span>Platz für ein Familienfoto</span>';
      fig.appendChild(d);
    }
  }
  function bauen() {
    var z = document.querySelector('main .zeit');
    if (!z || document.querySelector('.dz-hero')) return;
    var w = document.createElement('div'); w.className = 'dz-hero';
    fig = document.createElement('figure'); fig.className = 'dz-rahmen';
    w.appendChild(fig);
    /* Rahmen bleibt direkt unter dem Datum, auch wenn später Karten nach dem Datum eingefügt werden */
    function ordnen() { if (z.nextElementSibling !== w && z.parentNode) z.parentNode.insertBefore(w, z.nextSibling); }
    ordnen();
    try { new MutationObserver(ordnen).observe(z.parentNode, { childList: true }); } catch (e) {}
    window.addEventListener('load', ordnen);
    zeichnen();
    var sp = document.getElementById('e_speichern');
    if (sp) sp.addEventListener('click', function () { setTimeout(zeichnen, 800); setTimeout(zeichnen, 2500); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) zeichnen(); });
    window.addEventListener('storage', function (e) { if (e.key === 'granny.v1') zeichnen(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bauen); else bauen();
})();
