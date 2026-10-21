/* Posen-Bilder (DR Lab, 19.10.2026)
   Liegt im App-Ordner ein Bild posen/<pose>.jpg (z. B. von Tinko), zeigt die Figur bei dieser Pose
   genau dieses Bild. Fehlt es, bleibt das eine Figurenbild mit seiner CSS-Animation.
   Es wird erst nachgeschaut, wenn eine Pose zum ersten Mal vorkommt, und pro Seitenaufruf nur einmal.
   Nur Posen aus POSEN_DA (unten) werden angefragt.
   Nutzung: FigurPosen.zeige(imgElement, 'lachen', 2500, ['freut'])  (letztes = Ersatz-Posen) */
(function () {
  'use strict';
  if (window.FigurPosen) return;
  // Nur Posen aus dieser Liste werden angefragt (so gibt es keine 404 für fehlende Bilder).
  // Liegt ein Bild posen/<pose>.jpg im Ordner, hier den Namen eintragen, z. B. ['lachen', 'winken'].
  // Eine App kann die Liste auch vorher mit window.POSEN_DA setzen. Leer = gar nichts wird angefragt.
  var POSEN_DA = Array.isArray(window.POSEN_DA) ? window.POSEN_DA : ['sitzt', 'rennt', 'schlaeft']; // Tinko 21.10.
  var stand = {};
  function pruef(p) {
    if (!p || POSEN_DA.indexOf(p) < 0) return Promise.resolve(null);
    if (stand[p]) return stand[p];
    stand[p] = new Promise(function (res) {
      var im = new Image();
      im.onload = function () { res(im.naturalWidth ? im.src : null); };
      im.onerror = function () { res(null); };
      im.src = 'posen/' + encodeURIComponent(p) + '.jpg';
    });
    return stand[p];
  }
  function erstes(liste) {
    var i = 0;
    return new Promise(function (res) {
      (function weiter() {
        if (i >= liste.length) { res(null); return; }
        pruef(liste[i++]).then(function (s) { if (s) res(s); else weiter(); });
      })();
    });
  }
  function zeige(img, pose, dauer, ersatz) {
    if (!img || !pose) return Promise.resolve(false);
    if (!img.dataset.grundbild) img.dataset.grundbild = img.getAttribute('src');
    return erstes([pose].concat(ersatz || [])).then(function (src) {
      if (!src) return false;
      img.src = src; img.classList.add('pose-bild');
      clearTimeout(img._poseZeit);
      if (dauer !== 0) img._poseZeit = setTimeout(function () { img.src = img.dataset.grundbild; img.classList.remove('pose-bild'); }, dauer || 2600);
      return true;
    });
  }
  function zurueck(img) { if (img && img.dataset.grundbild) { clearTimeout(img._poseZeit); img.src = img.dataset.grundbild; img.classList.remove('pose-bild'); } }
  window.FigurPosen = { zeige: zeige, pruef: pruef, zurueck: zurueck };
})();
