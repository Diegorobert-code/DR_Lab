/* design.js – Food and Flow im Look «Markthalle» (Design-Umbau 23.10.2026). Nur Optik.
   Die bisher fest eingebauten Farben (Salbei + Tomate) in den Stil-Blöcken und style-Attributen
   der Runden werden auf die Markthalle-Palette umgestellt (Orange, Oliv, Honig auf Creme).
   Keine Funktion, kein Text und kein Speicher wird verändert. */
(function () {
  'use strict';
  if (window.__dzFlo) return; window.__dzFlo = 1;
  var MAP = {
    '#f7f6f1': '#fff7ee', '#f6f4ef': '#fff7ee', '#faf8f3': '#fffaf3', '#f6f3ec': '#fff3e6', '#f1eee8': '#fbefe2', '#efece5': '#f7ecdf',
    '#fffdf9': '#ffffff', '#fffdf8': '#ffffff', '#f1eee6': '#f7ecdf',
    '#1f2a25': '#2e3a12', '#33413a': '#3a4520', '#46524c': '#4f5636', '#4b5852': '#4f5636', '#59645e': '#5f6545', '#5d6a63': '#5f6545', '#6b766f': '#5f6545',
    '#e6e2d9': '#f0e2d0', '#e0dbd0': '#ead8c2', '#c9c3b6': '#d9c3a8', '#e4dccb': '#ecd9c0',
    '#2f6a4f': '#5e6b1f', '#245740': '#4f5a16', '#2f5d50': '#5e6b1f', '#244a3f': '#4f5a16', '#2a7356': '#5e6b1f',
    '#e2ece6': '#f1f3e0', '#eef4f0': '#f7f8ea', '#e9f1e4': '#eef1d9', '#e2efe6': '#eef1d9',
    '#c2461f': '#b4520a', '#b5401c': '#a84b08', '#e5714a': '#f27a12', '#a8391a': '#8f3f06', '#fbe5dc': '#fde9d6',
    '#8a5a00': '#7a5200', '#fcefd2': '#fbebc4', '#8a3f7e': '#a8361c', '#f6e6f2': '#fce3da', '#33528f': '#3b4f86', '#e4eaf7': '#e6eaf5'
  };
  var RGB = { '194,70,31': '180,82,10', '47,93,80': '94,107,31', '30,45,38': '46,58,18', '36,74,63': '79,90,22' };
  var RE = new RegExp(Object.keys(MAP).join('|'), 'gi');
  var RR = new RegExp(Object.keys(RGB).map(function (k) { return k.replace(/,/g, ',\\s*'); }).join('|'), 'g');
  function neu(t) {
    return t.replace(RE, function (m) { return MAP[m.toLowerCase()]; })
            .replace(RR, function (m) { return RGB[m.replace(/\s+/g, '')]; });
  }
  function test(t) { RE.lastIndex = 0; RR.lastIndex = 0; var r = RE.test(t) || RR.test(t); RE.lastIndex = 0; RR.lastIndex = 0; return r; }
  function stil(st) {
    if (!st || st.nodeType !== 1) return;
    if (st.tagName === 'STYLE') { var t = st.textContent; if (test(t)) st.textContent = neu(t); return; }
    var a = st.getAttribute && st.getAttribute('style'); if (a && test(a)) st.setAttribute('style', neu(a));
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
