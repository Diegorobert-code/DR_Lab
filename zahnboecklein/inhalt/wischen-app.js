/* wischen-app.js – Zahnböcklein startet mit Wisch-Karten (inhalt/wischen.js), im Aura-Look.
   Der Tagesfilm (Kino) kommt zuerst; die Karten erscheinen danach. Putzen, Filme und Zahn-Schule sind Karten. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W;
  function kinoOffen() { var k = document.getElementById('kino'); return !!(k && !k.hidden); }
  /* Film im Kino der App zeigen; nach «Zurück» kommen die Karten wieder. */
  function imKino(id) {
    return function () {
      var b = document.getElementById(id); if (!b) return;
      b.click();
      var t0 = Date.now();
      (function pruef() { if (kinoOffen()) { t0 = 0; setTimeout(pruef, 500); return; } if (t0 === 0) { Wischen.zeigen(); return; } if (Date.now() - t0 < 3000) setTimeout(pruef, 400); })();
    };
  }
  Wischen.start({
    app: 'zahnboecklein', name: 'Zahnböcklein', unter: 'Wischen, tippen, putzen', bild: 'aura/figur-winkt.webp',
    thema: 'aura', akzent: '#f4a6c8',
    warten: kinoOffen,
    pilleNur: function () { var s = document.getElementById('start'); return !!(s && !s.hidden); },
    karten: function () {
      var k = W.kinder() || { regale: [] };
      var putzen = W.knopf('#go', { art: 'spiel', bild: 'aura/szene.webp', chip: '2 Minuten', titel: 'Los, wir putzen!', text: 'Zwölf Zuckermonster warten. Das Zahnböcklein putzt mit dir.' });
      var party = W.knopf('#go2', { art: 'spiel', e: '✨', chip: '5 Minuten · tanzen', titel: 'Putzparty', text: 'Putzen und tanzen mit dem Zahnböcklein.' });
      var baby = W.knopf('#babyGo', { e: '🍼', chip: '0 bis 3 Jahre', titel: 'Für die Kleinsten', text: 'Ganz sanft, mit Mama oder Papa.' });
      var sprich = W.sprich({ figur: 'dem Zahnböcklein', bild: 'aura/figur-lacht.webp', text: 'Frag das Zahnböcklein, was du wissen willst. Alles bleibt auf diesem Handy.' });
      var fee = W.film({ id: 'film-fee', bild: 'bilder/poster-zahn.jpg', titel: 'Das Zahnböcklein und die Zahnfee', text: 'Der kleine Film. Tippen und zuschauen.', los: imKino('film1'), zurueck: false });
      var tanz = W.film({ id: 'film-tanz', bild: 'bilder/poster-tanz.jpg', titel: 'Putz-Tanz', text: 'Tanzen mit dem Zahnböcklein.', los: imKino('film2'), zurueck: false });
      var lied = W.ziel('#songs', { e: '🎵', chip: 'Musik', titel: 'Welches Lied?', text: 'Glitzer-Pop, Disco-Drache, Monster-Funk und mehr zum Putzen.' });
      return [putzen, k.heute, sprich, fee, party, k.fuerDich, tanz, baby].concat(W.mischen(k.regale), [lied, k.alle]);
    }
  });
})();
