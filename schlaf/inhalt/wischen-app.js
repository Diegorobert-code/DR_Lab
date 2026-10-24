/* wischen-app.js – Fias Nest startet mit Wisch-Karten (inhalt/wischen.js). Ruhig und dunkel, keine Diagnose. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W;
  var E = { morgen: '🌅', tag: '☕', sorgen: '🪺', ausgluehen: '🕯️', bett: '🌙', glut: '🔥', zuhoeren: '👂' };
  Wischen.start({
    app: 'fiasnest', name: 'Fias Nest', unter: 'Wischen, tippen, ruhig werden', bild: 'maskottchen.jpg',
    thema: 'farben', wort: { mag: 'Merken', magE: '🪶' },
    karten: function () {
      var b = W.bibliothek() || { bereiche: [] };
      var sprich = W.sprich({ figur: 'Fia', bild: 'posen/hoert.jpg', text: 'Erzähl Fia, was dich wach hält. Nichts geht ins Internet.' });
      function txt(sel, wo) { var el = (wo || document).querySelector(sel); return el ? (el.textContent || '').trim() : ''; }
      var jetzt = W.knopf('#jetzt', { e: txt('#jetztIc') || '✨', chip: 'Jetzt dran', titel: txt('#jetztT') || 'Jetzt dran', text: txt('#jetztS') || 'Passend zur Uhrzeit, ein Tipp.' });
      var zeiten = [].slice.call(document.querySelectorAll('button.tile[data-go]')).map(function (el) {
        var g = el.getAttribute('data-go'); return W.knopf('button.tile[data-go="' + g + '"]', { e: E[g] || '🌙', chip: el.hasAttribute('data-from') ? el.getAttribute('data-from') + '–' + el.getAttribute('data-to') + ' Uhr' : 'Fia', titel: txt('b', el) || undefined, text: txt('small', el) || undefined });
      });
      var haupt = [
        W.knopf('.r8-sosb', { e: '🫧', chip: 'Sofort', titel: 'SOS · 1 Minute', text: 'Sofort ruhig atmen mit Fia.' }),
        W.ziel('#r7h-mond', { e: '🌖', chip: 'Heute Nacht' }),
        W.ziel('#r7h-parkplatz', { e: '🅿️', chip: 'Gedanken' }),
        W.ziel('#r7h-nap', { e: '😴', chip: 'Ausruhen' }),
        W.ziel('#r7h-r8schlafzeit', { e: '⏰', chip: 'Schlafzeit' }),
        W.ziel('#r7h-r8rueckblick', { e: '📈', chip: 'Woche' })
      ];
      return [jetzt, b.heute, sprich, haupt[0], b.fuerDich].concat(W.mischen(zeiten, b.bereiche, haupt.slice(1)), [b.quiz, b.sammlung, b.alle, W.alles({ titel: 'Alles von Fias Nest' })]);
    }
  });
})();
