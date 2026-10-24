/* wischen-app.js – Fompa startet mit Wisch-Karten (inhalt/wischen.js).
   Fompa ordnet Zettel und erklärt allgemein. Keine Steuerberatung: Karten zeigen nur Werkzeuge und Wissen. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W;
  Wischen.start({
    app: 'fompa', name: 'Fompa', unter: 'Zettel rein, Ruhe raus', bild: 'figur.jpg',
    thema: 'farben', wort: { mag: 'Merken', magE: '🔖' },
    karten: function () {
      var b = W.bibliothek() || { bereiche: [] };
      var sprich = W.sprich({ figur: 'Fompa', bild: 'posen/freut.jpg', text: 'Frag Fompa, wo ein Zettel hingehört. Allgemeine Erklärungen, keine Steuerberatung.' });
      var haupt = [
        W.knopf(W.mitText('button.btn.main', 'Zettel ablegen'), { id: 'zettel', e: '📷', chip: 'Ablegen', titel: 'Zettel ablegen', text: 'Quittung fotografieren oder einen Satz schreiben. Fompa legt ihn ins Glas.' }),
        W.knopf('#r8Schnell', { e: '✍️', chip: 'Schnell', titel: 'Schnell-Zettel', text: 'Ein Satz reicht: «Kaffee 4.80 Twint».' }),
        W.knopf('#fahrtenEinstieg', { e: '🚗', chip: 'Unterwegs' }),
        W.knopf('[data-mode="steuer"]', { e: '🧾', chip: 'Ordnen', titel: 'Steuer-Ordner', text: 'Zettel nach Steuer-Gruppen sortiert. Ordnung, keine Beratung.' }),
        W.knopf('[data-mode="plan"]', { e: '🎯', chip: 'Woche', titel: 'Woche und Ziele', text: 'Was diese Woche ansteht und wofür du sparst.' }),
        W.knopf('[data-r8=story]', { e: '🎞️', chip: 'Rückblick', titel: 'Dein Monat', text: 'Dein Monat mit Fompa als kleine Story.' }),
        W.neuheiten({ titel: 'Neu bei Fompa' })
      ];
      return [b.heute, sprich, haupt[0], b.fuerDich, haupt[1]].concat(W.mischen(b.bereiche, haupt.slice(2)), [b.quiz, b.sammlung, b.alle, W.alles({ titel: 'Alles von Fompa' })]);
    }
  });
})();
