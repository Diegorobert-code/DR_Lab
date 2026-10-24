/* design.js – Hasis Laden im Look «Werkzeugkasten» (Design-Umbau 23.10.2026). Nur Optik.
   Die fest eingebauten Farben des bisherigen Markt-Looks (Petrol auf Hellgrau) in den Stil-Blöcken
   und style-Attributen werden auf die Werkzeugkasten-Palette umgestellt (Orange auf Grau).
   Keine Funktion, kein Text und kein Speicher wird verändert. Hasi spricht weiterhin nie. */
(function () {
  'use strict';
  if (window.__dzHasi) return; window.__dzHasi = 1;
  var MAP = {
    '#0c7a67': '#b84a00', '#0a6253': '#9a3f00', '#e7f5f1': '#fdebdd', '#8fd3c8': '#ffc49a',
    '#f4f3f0': '#f5f5f2', '#1d1c1a': '#1e1e1e', '#e4e1da': '#e3e3dd', '#55524c': '#55554f', '#a39b8e': '#9a9a92',
    '#cfcac0': '#cfcfc7', '#dedad2': '#e3e3dd', '#e7e3dc': '#e3e3dd', '#f6f4ef': '#f7f7f4'
  };
  var RGB = { '12,122,103': '184,74,0', '10,98,83': '154,63,0' };
  var RE = new RegExp(Object.keys(MAP).join('|'), 'gi');
  var RR = new RegExp(Object.keys(RGB).map(function (k) { return k.replace(/,/g, ',\\s*'); }).join('|'), 'g');
  function test(t) { RE.lastIndex = 0; RR.lastIndex = 0; var r = RE.test(t) || RR.test(t); RE.lastIndex = 0; RR.lastIndex = 0; return r; }
  function neu(t) {
    return t.replace(RE, function (m) { return MAP[m.toLowerCase()]; })
            .replace(RR, function (m) { return RGB[m.replace(/\s+/g, '')]; });
  }
  function stil(n) {
    if (!n || n.nodeType !== 1) return;
    if (n.tagName === 'STYLE') { var t = n.textContent; if (test(t)) n.textContent = neu(t); return; }
    var a = n.getAttribute && n.getAttribute('style'); if (a && test(a)) n.setAttribute('style', neu(a));
  }
  function baum(n) {
    if (!n || n.nodeType !== 1) return;
    stil(n);
    if (n.querySelectorAll) [].forEach.call(n.querySelectorAll('style,[style]'), stil);
  }
  function alle() { baum(document.documentElement); }
  alle();
  try {
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'attributes') stil(m.target);
        else [].forEach.call(m.addedNodes, baum);
      });
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
  } catch (e) {}
  window.addEventListener('load', alle);
})();
