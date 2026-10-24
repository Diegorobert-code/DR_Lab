/* Hüpf (Design 23.10.): Otti und seine Freunde hüpfen sanft wie in einem Bilderbuch,
   wenn man sie antippt oder wenn eine Geschichte / ein Spiel ein Bild zeigt.
   Ruhig: ein einziger weicher Hüpfer, kein Blinken. Nutzt die eigenen CSS-Eigenschaften
   «translate» und «scale» über die Web-Animations-Schnittstelle, darum stören die Hüpfer
   keine bestehenden transform-Animationen. Bei «weniger Bewegung» passiert nichts. */
(function () {
  'use strict';
  if (window.__huepf) return; window.__huepf = 1;
  var mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var probe = document.createElement('div');
  if (!probe.animate || !('translate' in probe.style) || !('scale' in probe.style)) return;

  // Was hüpft, wenn man darauf tippt (Ziel = das Bild oder der runde Rahmen darin)
  var TIPP = [
    ['.freund', 'img'],
    ['.wuerfelwahl button', 'img, .e'],
    ['.aktion', '.rund'],
    ['.wege a, .wege button', '.rund'],
    ['.gefuehl', '.e'],
    ['.standbild', null],
    ['.album span', null]
  ];

  function huepf(el, staerke) {
    if (!el || mq.matches || !el.isConnected) return;
    var h = el.getBoundingClientRect().height || 40;
    var hoch = Math.max(5, Math.min(14, h * (staerke || 0.14)));
    if (el.__hpf) { try { el.__hpf.cancel(); } catch (e) {} }
    try {
      el.__hpf = el.animate([
        { translate: '0 0', scale: '1 1' },
        { translate: '0 0', scale: '1.05 .95', offset: 0.16 },
        { translate: '0 ' + (-hoch) + 'px', scale: '.97 1.04', offset: 0.46 },
        { translate: '0 0', scale: '1.04 .96', offset: 0.78 },
        { translate: '0 0', scale: '1 1' }
      ], { duration: 640, easing: 'cubic-bezier(.33,.7,.4,1)' });
      el.__hpf.onfinish = function () { el.__hpf = null; };
    } catch (e) {}
  }
  window.ottiHuepf = huepf;

  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    for (var i = 0; i < TIPP.length; i++) {
      var k = t.closest(TIPP[i][0]);
      if (!k) continue;
      huepf(TIPP[i][1] ? (k.querySelector(TIPP[i][1]) || k) : k);
      return;
    }
  }, true);

  // Wenn eine Geschichte oder ein Spiel Bilder zeigt: die Freunde hüpfen einmal leise herein (nacheinander)
  function neueBilder(knoten) {
    var liste = [];
    knoten.forEach(function (n) {
      if (n.nodeType !== 1) return;
      if (n.matches('.standbild, .wuerfelwahl img, .freund img')) liste.push(n);
      if (n.querySelectorAll) [].forEach.call(n.querySelectorAll('.standbild, .wuerfelwahl img, .freund img'), function (x) { liste.push(x); });
    });
    liste.slice(0, 6).forEach(function (x, i) { setTimeout(function () { huepf(x, 0.1); }, 260 + i * 110); });
  }
  function beobachte(id) {
    var z = document.getElementById(id); if (!z || !window.MutationObserver) return;
    new MutationObserver(function (ms) {
      var add = []; ms.forEach(function (m) { [].push.apply(add, m.addedNodes); });
      if (add.length) neueBilder(add);
    }).observe(z, { childList: true, subtree: true });
  }
  function los() { beobachte('feldinhalt'); beobachte('zimFreunde'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
