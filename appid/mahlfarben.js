/* Farbe pro Mahlzeit (Design 23.10.): jede Mahlzeit hat überall dieselbe Akzentfarbe.
   Zmorge = Honig, Zmittag = Salbei, Zvieri (Snack) = Beere, Znacht = Abendblau, Bewegung = Petrol.
   Gilt für die Tagesliste (Überschrift als Farb-Chip, feine Linie links), die Auswahl im
   Bestätigen-Blatt und den Chip «… wie gestern». Nur Darstellung, keine Funktion geändert.
   Kontrast (Text auf Chip-Grund): hell 5.1–6.3 : 1, dunkel 7.6–8.5 : 1. Die Linien nutzen die Textfarbe
   (über 5.5 : 1 auf Weiss). Dunkel-Werte gelten, sobald die App ein dunkles Schema setzt
   (:root[data-theme="dark"] oder html.dunkel); heute ist Food and Flow immer hell. */
(function () {
  'use strict';
  if (window.__mahlfarben) return; window.__mahlfarben = 1;
  var NAMEN = { fr: ['Zmorge', 'Frühstück'], mi: ['Zmittag', 'Mittag', 'Mittagessen'], zw: ['Zvieri', 'Snack', 'Znüni'], ab: ['Znacht', 'Abend', 'Abendessen'], act: ['Bewegung'] };
  try { if (window.MEALS) Object.keys(window.MEALS).forEach(function (k) { if (NAMEN[k] && NAMEN[k].indexOf(window.MEALS[k]) < 0) NAMEN[k].unshift(window.MEALS[k]); }); } catch (e) {}
  var NACH = {}; Object.keys(NAMEN).forEach(function (k) { NAMEN[k].forEach(function (n) { NACH[n.toLowerCase()] = k; }); });

  var st = document.createElement('style');
  st.textContent =
    ':root{--mf-fr:#8A5A00;--mf-fr-l:#FCEFD2;--mf-mi:#2F6A4F;--mf-mi-l:#E2EFE6;--mf-zw:#8A3F7E;--mf-zw-l:#F6E6F2;' +
    '--mf-ab:#33528F;--mf-ab-l:#E4EAF7;--mf-act:#1E6E6A;--mf-act-l:#DDF1EE}' +
    ':root[data-theme="dark"],html.dunkel{--mf-fr:#F6C870;--mf-fr-l:#3A2E14;--mf-mi:#8FD3AE;--mf-mi-l:#1D3329;--mf-zw:#EBA8DE;--mf-zw-l:#3A2236;' +
    '--mf-ab:#A9C1F2;--mf-ab-l:#1F2A44;--mf-act:#86D9D1;--mf-act-l:#16332F}' +
    '[data-mahl="fr"]{--mf:var(--mf-fr);--mf-l:var(--mf-fr-l)}[data-mahl="mi"]{--mf:var(--mf-mi);--mf-l:var(--mf-mi-l)}' +
    '[data-mahl="zw"]{--mf:var(--mf-zw);--mf-l:var(--mf-zw-l)}[data-mahl="ab"]{--mf:var(--mf-ab);--mf-l:var(--mf-ab-l)}' +
    '[data-mahl="act"]{--mf:var(--mf-act);--mf-l:var(--mf-act-l)}' +
    /* Tagesliste: Überschrift wird ein Chip mit Punkt, die Einträge bekommen eine feine Linie links */
    '.meal[data-mahl]{position:relative;padding-left:12px}' +
    '.meal[data-mahl]::before{content:"";position:absolute;left:0;top:30px;bottom:6px;width:3px;border-radius:3px;background:var(--mf);opacity:.85}' +
    '.meal[data-mahl] h4{display:inline-flex;align-items:center;gap:7px;margin:0 0 4px -12px;padding:4px 11px 4px 9px;border-radius:999px;background:var(--mf-l);color:var(--mf)!important;font-weight:700;letter-spacing:.06em}' +
    '.meal[data-mahl] h4::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--mf);flex:none}' +
    '.meal[data-mahl] .item .kc{color:var(--mf)}' +
    /* Bestätigen-Blatt: die Auswahl trägt die Farbe der gewählten Mahlzeit */
    '.mealsel[data-mahl]{background:var(--mf-l)!important;color:var(--mf)!important;border-color:var(--mf)!important;font-weight:700;padding:5px 10px;min-height:32px}' +
    /* Schnell-Chip «Zmittag wie gestern» */
    '.flo-chip[data-mahl]{background:var(--mf-l)!important;color:var(--mf)!important;border-color:var(--mf)!important;box-shadow:inset 3px 0 0 var(--mf)}';
  document.head.appendChild(st);

  function wer(text) { text = String(text || '').trim().toLowerCase(); if (NACH[text]) return NACH[text]; var n = Object.keys(NACH); for (var i = 0; i < n.length; i++) if (text.indexOf(n[i]) >= 0) return NACH[n[i]]; return null; }
  function setze(el, k) { if (!k) { el.removeAttribute('data-mahl'); return; } if (el.getAttribute('data-mahl') !== k) el.setAttribute('data-mahl', k); }

  function faerben(root) {
    root = root || document;
    [].forEach.call(root.querySelectorAll('.meal'), function (m) { var h = m.querySelector('h4'); if (h) setze(m, wer(h.textContent)); });
    [].forEach.call(root.querySelectorAll('select.mealsel'), function (s) {
      if (s.hasAttribute('data-like')) return; // «Ähnlich wie …» ist keine Mahlzeit
      if (/^(fr|mi|zw|ab)$/.test(s.value)) setze(s, s.value);
      if (!s.__mf) { s.__mf = 1; s.addEventListener('change', function () { setze(s, /^(fr|mi|zw|ab)$/.test(s.value) ? s.value : null); }); }
    });
    [].forEach.call(root.querySelectorAll('.flo-chip'), function (c) { if (/wie gestern/i.test(c.textContent)) setze(c, wer(c.textContent.replace(/wie gestern/i, ''))); });
  }
  window.mahlFarben = faerben;

  var plan = 0;
  function bald() { if (plan) return; plan = requestAnimationFrame(function () { plan = 0; faerben(); }); }
  function los() {
    faerben();
    if (window.MutationObserver) new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) if (ms[i].type === 'childList' && ms[i].addedNodes.length) { bald(); return; }
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
