/* wischen-app.js – Hasis Laden startet mit Wisch-Karten (inhalt/wischen.js). Hasi spricht nie: er zeigt mit Gesten. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W;
  Wischen.start({
    app: 'hasi', name: 'Hasis Laden', unter: 'Wischen, tippen, staunen', bild: 'aura/winkt.webp',
    thema: 'aura', akzent: '#e8b94a',
    warten: function () { var p = document.getElementById('pantWeiter'); return !!(p && p.offsetParent); },
    karten: function () {
      var k = W.kinder() || { regale: [] };
      var sprich = W.sprich({ figur: 'Hasi', bild: 'aura/freut.webp', text: 'Schreib oder sprich. Hasi antwortet mit Gesten, ganz ohne Worte.' });
      var film = W.film({ id: 'film-laden', bild: 'aura/laden.webp', titel: 'Hasis Werkzeugladen', text: 'Der kleine Film aus Hasis Laden. Tippen und zuschauen.', los: W.klick('#filmBtn') });
      var teile = W.abschnitte({ ausser: ['Hasis Regale'], chip: 'Hasis Laden' });
      return [k.heute, sprich, film, k.fuerDich].concat(W.mischen(k.regale, teile.slice(0, 6)), teile.slice(6), [k.alle]);
    }
  });
})();
