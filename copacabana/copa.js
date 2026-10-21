/* Copa – die Ladenfigur des Geschenk Lädeli Copacabana (Runde 5, 21.10.2026)
   Ein bunter Ara-Papagei mit Strohhut und Leinenschürze (Bilder von Tinko, KI-Pixel).
   - Begrüsst einmal beim Öffnen mit Winken (Puppe aus nova/puppe.js: genau sein Flügel schwingt)
   - Antippen: Copa winkt zurück
   - Etwas in den Korb gelegt: Copa freut sich kurz (Bild «freut»)
   Ohne puppe.js: sanftes CSS-Winken. Bei «weniger Bewegung» nur ein kurzes Nicken. */
(function () {
  'use strict';
  var img = document.getElementById('copaBild');
  if (!img || window.Copa) return;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WINKT = 'copa/winkt.jpg', FREUT = 'copa/freut.jpg';
  var SAETZE = ['Schön, bist du da.', 'Schau dich ruhig um. Ich halte den Laden warm.', 'Ein kleines Geschenk macht grosse Freude.', 'Brauchst du eine Idee? Der Geschenk-Finder hilft.'], si = 0;
  var satz = document.getElementById('copaSatz');
  new Image().src = FREUT;
  var w = null;
  function winker() {
    if (w || !window.Puppe || typeof Puppe.winkeZurueck !== 'function') return w;
    try {
      w = Puppe.winkeZurueck(img, {
        figur: 'copa', name: 'Copa', gruss: 'winken', antippen: false, ton: false, blase: false, bild: WINKT, arm: false,
        augen: [[9, 9, 0.01, 0.01]], mund: { l: [9, 9], r: [9.1, 9], oben: 0, unten: 0, kinn: 0.01 },
        kopf: [0.6, 0.3, 0.25], gesicht: [0.62, 0.32, 0.17], glow: '#f2b84b',
        winkArm: { x: 0.15, y: 0.55, r: 0.17, dx: 0.35, dy: 0.72, seite: 'links' }
      });
    } catch (e) { w = null; }
    return w;
  }
  var bildT = null;
  function zeige(src, ms) {
    clearTimeout(bildT);
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    if (ms) bildT = setTimeout(function () { img.setAttribute('src', WINKT); }, ms);
  }
  function winke(mitSatz) {
    zeige(WINKT);
    var p = winker();
    if (p && p.winke) p.winke();
    else if (!ruhig) { img.classList.remove('copa-wink'); void img.offsetWidth; img.classList.add('copa-wink'); }
    if (mitSatz && satz) satz.textContent = SAETZE[si++ % SAETZE.length];
  }
  img.addEventListener('click', function () { winke(true); try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} });
  img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); winke(true); } });
  img.addEventListener('animationend', function () { img.classList.remove('copa-wink', 'copa-freu'); });
  // Etwas in den Korb gelegt: Copa freut sich
  document.addEventListener('click', function (e) {
    var k = e.target.closest && e.target.closest('.ware .knopf');
    if (!k) return;
    zeige(FREUT, 2600);
    if (!ruhig) { img.classList.remove('copa-freu'); void img.offsetWidth; img.classList.add('copa-freu'); }
    if (satz) satz.textContent = 'Juhuu, das macht Freude! Im Korb wartet es auf dich.';
  }, true);
  // Einmal grüssen beim Öffnen, wenn Copa zu sehen ist
  setTimeout(function () {
    var r = img.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight && !document.hidden) winke(false);
  }, 1200);
  window.Copa = { winke: winke };
})();
