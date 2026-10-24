/* wischen-app.js – Geschenk-Lädeli Copacabana startet mit Wisch-Karten (inhalt/wischen.js).
   Im Waren-Stapel: rechts = auf den Wunschzettel (♥), links = weiter, tippen = anschauen und in den Korb. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W;
  function waren() { try { return WAREN; } catch (e) { return []; } } /* eslint-disable-line no-undef */
  function hol(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function wunsch() { var l = hol('copa-wunsch', []); return Array.isArray(l) ? l : []; }
  function wunschSetzen(id, an) {
    var l = wunsch(), j = l.indexOf(id); if (j >= 0) l.splice(j, 1); if (an) l.push(id);
    try { localStorage.setItem('copa-wunsch', JSON.stringify(l)); } catch (e) {}
    try { regalZeigen(); } catch (e) {} /* eslint-disable-line no-undef */
  }
  function inKorb(w) { try { korb[w.id] = (korb[w.id] || 0) + 1; speichern(); korbZeigen(true); return true; } catch (e) { return false; } } /* eslint-disable-line no-undef */
  function chf(n) { return 'CHF ' + Number(n).toFixed(2); }
  function warenKarten() {
    return waren().map(function (w) {
      return { id: 'w:' + w.id, e: w.em, bild: w.bild ? 'bilder/' + w.bild : null, chip: w.kat + ' · ' + chf(w.preis), titel: w.name, text: w.text, lieb: false,
        mag: function () { wunschSetzen(w.id, true); }, istMag: function () { return wunsch().indexOf(w.id) >= 0; },
        seiten: function () { return [
          { e: w.em, bild: w.bild ? 'bilder/' + w.bild : null, chip: w.kat, titel: w.name, text: w.text },
          { ende: true, e: '🎁', titel: chf(w.preis), text: 'Testladen: es wird nichts bezahlt und nichts verschickt.', knoepfe: [
            { t: '🧺 In den Korb', primaer: true, fn: function (b) { if (inKorb(w)) { b.textContent = 'Im Korb ✓'; return true; } } },
            { t: '♡ Wunschzettel', tAn: '♥ Auf dem Wunschzettel', an: function () { return wunsch().indexOf(w.id) >= 0; }, fn: function () { wunschSetzen(w.id, wunsch().indexOf(w.id) < 0); } }
          ] }
        ]; } };
    });
  }
  Wischen.start({
    app: 'copacabana', name: 'Copacabana', unter: 'Geschenk-Lädeli', bild: 'copa/winkt.jpg',
    thema: 'farben', wort: { mag: 'Wunschzettel', magE: '♥' },
    karten: function () {
      var b = W.bibliothek() || { bereiche: [] };
      var n = waren().length;
      var regal = n ? { id: 'waren', art: 'bereich', e: '🛍️', bild: 'laden/laden-1.jpg', chip: n + ' Geschenke', titel: 'Durchs Regal wischen', text: '♥ nach rechts auf den Wunschzettel, nach links weiter, tippen zum Anschauen.',
        karten: warenKarten, wort: { mag: 'Wunschzettel', magE: '♥' },
        ende: function () { return { e: '🌴', titel: 'Ganzes Regal gesehen', text: 'Dein Wunschzettel wartet im Lädeli.', knoepfe: [{ t: '🧺 Zum Korb', primaer: true, fn: function () { Wischen.verlassen(W.klick('#korbknopf')); } }, { t: '✕ Zurück', fn: function () { Wischen.zurueck(); } }] }; } } : null;
      var film = W.film({ id: 'rundgang', bild: 'laden/poster.jpg', titel: 'Rundgang durchs Lädeli', text: 'Ein kurzer Film durch den Laden. Tippen und zuschauen.', video: 'laden/rundgang.mp4' });
      var sprich = W.sprich({ figur: 'Copa', bild: 'copa/freut.jpg', text: 'Sag Copa, für wen du etwas suchst. Copa schlägt Geschenke vor.' });
      var haupt = [
        W.knopf('[data-k=finder]', { e: '🎁', chip: 'In 4 Fragen', titel: 'Geschenk-Finder', text: 'Für wen, wozu, wie viel. Copa stellt ein fertiges Set zusammen.' }),
        W.knopf('[data-k=saeckli]', { e: '🛍️', chip: 'Überraschung', titel: 'Überraschungs-Säckli', text: 'Budget wählen, Copa packt.' }),
        W.knopf('#korbknopf', { e: '🧺', chip: 'Korb', titel: 'Dein Korb', text: 'Was drin liegt, Geschenkverpackung und Gruss auf der Karte.' }),
        W.ziel('#r4geburi', { e: '🎂', chip: 'Erinnern' }),
        W.neuheiten({ titel: 'Neu im Lädeli' })
      ];
      return [regal, film, sprich, b.heute, haupt[0], b.fuerDich].concat(W.mischen(haupt.slice(1), b.bereiche), [b.quiz, b.sammlung, b.alle, W.alles({ titel: 'Alles im Lädeli' })]);
    }
  });
})();
