/* wischen-app.js – The Coin Maker startet mit Wisch-Karten (inhalt/wischen.js). Coins sind Punkte ohne Geldwert. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W;
  Wischen.start({
    app: 'coinmaker', name: 'The Coin Maker', unter: 'Ideen rein, Münzen raus', bild: 'figur.jpg',
    thema: 'farben', wort: { mag: 'Merken', magE: '🔖' },
    menue: function () { return window.CMIrgendwann && CMIrgendwann.rueckblick ? [{ e: '⭐', t: 'Sonntags-Rückblick', drueber: true, fn: function () { CMIrgendwann.rueckblick(); } }] : []; }, /* jederzeit erreichbar */
    karten: function () {
      var b = W.bibliothek() || { bereiche: [] };
      var sprich = W.sprich({ figur: 'Coin Maker', bild: 'posen/winken.jpg', text: 'Erzähl deine Idee. Coin Maker fragt nach und hilft beim nächsten Schritt.' });
      var film = W.knopf('#filmBtn', { art: 'film', chip: 'Film', e: '🎬', bild: 'posen/lupe.jpg', titel: 'Zahlen mit Daten', text: 'Der kleine Trickfilm aus der Werkstatt. Tippen und zuschauen.' });
      var IG = window.CMIrgendwann, igStapel = IG && IG.stapel ? IG.stapel() : null, igRueck = IG && IG.rueckKarte && IG.wochenende() ? IG.rueckKarte() : null; /* Rückblick-Karte nur am Wochenende */
      var haupt = [
        W.ziel('#sogehts', { e: '⚙️', chip: 'Werkstatt' }),
        W.knopf('#tippBtn', { e: '💡', chip: 'Tipp', titel: 'Ein Tipp aus der Werkstatt', text: 'Ein kurzer Tipp für deine nächste Idee.' }),
        W.ziel('#waage', { e: '⚖️', chip: 'Ideen-Waage' }),
        igStapel,
        W.knopf('#praesBtn', { e: '🤝', chip: 'Firmen', titel: 'Für kleine Firmen', text: 'Was der Coin Maker für Kleinunternehmen tun kann.' }),
        W.ziel('#laden', { e: '🪙', chip: 'Münzladen' }),
        W.ziel('#kosten', { e: '🧮', chip: 'Rechnen' }),
        W.neuheiten({ titel: 'Neu in der Werkstatt' })
      ];
      return [b.heute, igRueck, sprich, film, b.fuerDich, haupt[0]].concat(W.mischen(b.bereiche, haupt.slice(1)), [b.quiz, b.sammlung, b.alle, W.alles({ titel: 'Alles von The Coin Maker' })]);
    }
  });
})();
