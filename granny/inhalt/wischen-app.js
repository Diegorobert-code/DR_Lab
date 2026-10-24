/* wischen-app.js – Rosa startet mit Wisch-Karten (inhalt/wischen.js), extra gross:
   grosse Schrift und unter jeder Reihe grosse Knöpfe «zurück» und «weiter», denn man muss nicht wischen. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W;
  Wischen.start({
    app: 'granny', name: 'Rosa', unter: 'Tippen oder «weiter»', bild: 'figur.jpg',
    thema: 'farben', gross: true, wort: { mag: 'Mag ich', magE: '💗', reiheHinweis: '← wischen oder «weiter» drücken →', seitenHinweis: 'Drück «weiter» für die nächste Seite' },
    karten: function () {
      var b = W.bibliothek({ max: 170 }) || { bereiche: [] };
      var sprich = W.sprich({ figur: 'Rosa', bild: 'posen/winken.jpg', text: 'Einfach drücken und reden. Rosa hört zu.' });
      var haupt = [
        W.knopf('#reden', { e: '🌹', chip: 'Reden', titel: 'Drück mich und rede', text: 'Ein Knopf. Rosa ist da.', bild: 'posen/lachen.jpg' }),
        W.knopf('.r8-sos-k', { e: '🫧', chip: 'Sofort', titel: '1 Minute ruhig werden', text: 'Mit Rosa atmen.' }),
        W.ziel('#r8r-t', { e: '⭕', chip: 'Mein Tag' }),
        W.knopf('#hilfe', { e: '🆘', chip: 'Hilfe', titel: 'Ich brauche Hilfe', text: 'Rosa zeigt, wen Sie anrufen können.' }),
        W.knopf('#erzaehl', { e: '😄', chip: 'Freude', titel: 'Rosa, erzähl mir was', text: 'Eine kleine Geschichte zum Schmunzeln.' }),
        window.RosaTabletten ? null : W.ziel('#r8m-t', { e: '💊', chip: 'Medikamente' }),
        W.knopf('.r7-dia-los', { art: 'film', e: '📷', chip: 'Bilder', titel: 'Erinnerungen ansehen', text: 'Ihre Bilder als ruhige Diaschau.' }),
        W.knopf('.r7-uhr-los', { e: '🕰', chip: 'Uhr', titel: 'Grosse Uhr', text: 'Tag, Datum und Uhrzeit, ganz gross.' }),
        W.ziel('#r7b-t', { e: '🎂', chip: 'Geburtstage' }),
        W.knopf('.r8-pk-los', { e: '💌', chip: 'Post', titel: 'Postkarte schicken', text: 'Ein Foto, ein Gruss, fertig.' }),
        W.knopf('#klemmt', { e: '📱', chip: 'Hilfe', titel: 'Handy oder Passwort geht nicht', text: 'Schritt für Schritt, in Ruhe.' }),
        W.knopf('[data-r6=oeffnen]', { e: '🎁', chip: 'Heute', titel: 'Überraschung des Tages', text: 'Tippen zum Öffnen.' })
      ];
      /* «Meine Tabletten»: eigene Karte; ist gerade eine Tablette dran, kommt sie gleich nach «Reden». */
      var tabl = window.RosaTabletten ? window.RosaTabletten.karte() : null, tablJetzt = tabl && window.RosaTabletten.dran();
      if (tabl && !tablJetzt) haupt.splice(4, 0, tabl);
      return [haupt[0]].concat(tablJetzt ? [tabl] : [], [b.heute, sprich, haupt[1]]).concat(W.mischen(haupt.slice(2), b.bereiche), [b.quiz, b.sammlung, b.alle, W.alles({ titel: 'Alles von Rosa' })]);
    }
  });
})();
