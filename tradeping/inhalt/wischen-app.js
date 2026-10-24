/* wischen-app.js – TradePing startet mit Wisch-Karten (inhalt/wischen.js).
   Lernstoff und eigene Werkzeuge, keine Anlageberatung: Karten nennen nie Titel zum Kaufen oder Verkaufen. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W;
  var E = { topf: '🪙', mpHeute: '☀️', r4Tresor: '🔐', r4Merk: '📝', mpRechner: '🧮', mpJournal: '📓', r4Kal: '🗓️', mpLexikon: '🎓' };
  Wischen.start({
    app: 'tradeping', name: 'TradePing', unter: 'Ein Ping, nur wenn es zählt', bild: 'figur.jpg',
    thema: 'farben', wort: { mag: 'Merken', magE: '🔖' },
    karten: function () {
      var b = W.bibliothek() || { bereiche: [] };
      var sprich = W.sprich({ figur: 'Mr. Ping', bild: 'posen/winkt.jpg', text: 'Frag Mr. Ping, was ein Begriff heisst. Er erklärt ruhig und gibt keine Kauf- oder Verkaufstipps.' });
      var nav = [].slice.call(document.querySelectorAll('a[data-z]')).map(function (a) { var id = a.getAttribute('data-z'); return W.ziel('#' + id, { e: E[id] || '✨', chip: (a.innerText || '').trim().charAt(0) + (a.innerText || '').trim().slice(1).toLowerCase() }); });
      var mehr = [
        W.knopf('#tpSchule', { e: '🎓', chip: 'Lernen', titel: 'Mr. Pings Schule', text: 'Börse verstehen in 5 Minuten am Tag. Lernen, keine Tipps.' }),
        W.ziel('#hList', { e: '👀', chip: 'Beobachten' }),
        W.ziel('#hRuhe', { e: '🌙', chip: 'Ruhe' }),
        W.knopf('#pingAn', { e: '🔔', chip: 'Ping', titel: 'Ping aufs Handy', text: 'Einschalten, damit Mr. Ping sich nur meldet, wenn deine Marke erreicht ist.' }),
        W.neuheiten({ titel: 'Neu bei Mr. Ping' })
      ];
      return [b.heute, sprich, nav[0], b.fuerDich, nav[1]].concat(W.mischen(b.bereiche, nav.slice(2), mehr), [b.quiz, b.sammlung, b.alle, W.alles({ titel: 'Alles von TradePing' })]);
    }
  });
})();
