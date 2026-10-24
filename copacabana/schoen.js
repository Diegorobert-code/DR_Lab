/* Design-Runde «schön»: die Figur als kleines lebendiges Icon.
   Kleine Figurenbilder (bis 120 px) zeigen ava.webp (ein sauber zugeschnittenes Porträt),
   atmen sanft und freuen sich kurz beim Antippen. Grosse Bühnenbilder bleiben unberührt.
   Später ersetzt nur ava.webp das Bild (Aura-Icon), der Code bleibt gleich. */
(function () {
  'use strict';
  var FIG = /(^(\.\/)?|\/copacabana\/)(figur(-gross)?\.jpg|wm\/(maskottchen|stufe-\d)\.jpg|copa\/(winkt|freut)\.jpg)$/;
  var AVA = new URL('ava.webp', document.currentScript ? document.currentScript.src : location.href).href;
  var MAX = 120;
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function istFigur(img) {
    var s = img.getAttribute('src') || '';
    return FIG.test(s);
  }
  function geschuetzt(img) {
    return !!img.closest('[data-puppe],.puppe,.pp-buehne,.r8-story,.r8-album,.r8-wm-album,.mp2-will,dialog[open] .gross,[data-sch-frei]');
  }
  function pruefe(img) {
    if (img.dataset.schAva === '1') {
      var jetzt = img.getAttribute('src') || '';
      if (jetzt === img.dataset.schSrc || img.dataset.schFest === '1') return;
      /* Die App setzt ihr Bild an dieser Stelle selbst zurück: Bild lassen, nur die Form behalten (kein Hin und Her). */
      if (jetzt === img.dataset.schOrig) { img.dataset.schFest = '1'; return; }
      if (istFigur(img)) tausche(img);
      return;
    }
    if (!istFigur(img) || geschuetzt(img)) return;
    var r = img.getBoundingClientRect();
    var w = r.width || +img.getAttribute('width') || 0;
    if (!w || w > MAX) return;
    tausche(img);
  }
  function tausche(img) {
    img.dataset.schAva = '1';
    img.dataset.schOrig = img.getAttribute('src') || '';
    img.removeAttribute('srcset');
    img.setAttribute('src', AVA);
    img.dataset.schSrc = img.getAttribute('src');
    img.classList.add('sch-ava');
    img.classList.remove('fs-lade');
  }
  var lauf = 0;
  function alle() {
    lauf = 0;
    var l = document.images;
    for (var i = 0; i < l.length; i++) { try { pruefe(l[i]); } catch (e) {} }
  }
  function bald() { if (!lauf) lauf = setTimeout(alle, 120); }

  document.addEventListener('pointerdown', function (ev) {
    var el = ev.target && ev.target.closest ? ev.target : null;
    if (!el) return;
    var img = el.closest('.sch-ava');
    if (!img) { var k = el.closest('button,a,[role=button]'); img = k && k.querySelector('.sch-ava'); }
    if (!img || reduce) return;
    img.classList.remove('sch-freut'); void img.offsetWidth; img.classList.add('sch-freut');
    setTimeout(function () { img.classList.remove('sch-freut'); }, 760);
  }, { passive: true });

  function start() {
    alle();
    try { new MutationObserver(bald).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'hidden'] }); } catch (e) {}
    addEventListener('resize', bald);
    document.addEventListener('click', function () { setTimeout(alle, 350); }, true);
    setInterval(alle, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
