/* wischen-app.js – Jacky Roberts startet mit Wisch-Karten (inhalt/wischen.js).
   Notruf 117 · 144 · 142 steht auf jeder Ebene oben (Leiste), nie verdeckt. Keine Diagnose, keine Rechtsberatung. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W, C = window.INHALT || {};
  Wischen.start({
    app: 'jackie', name: "Jacky Roberts", unter: 'Wischen, antippen, durchatmen', bild: 'figur.jpg',
    thema: 'farben', wort: { mag: 'Merken', magE: '🔖' },
    leiste: C.notruf || '<a href="tel:117"><b>117</b> Polizei</a><a href="tel:144"><b>144</b> Sanität</a><a href="tel:142"><b>142</b> Opferhilfe</a>',
    menue: function () {
      return [W.knopf('#btnSos', { e: '🆘', t: 'Alle Notfallnummern' }), W.knopf('#btnGuide', { e: '📖', t: 'Anleitung' }), W.knopf('#btnHistory', { e: '🕘', t: 'Verlauf und diskreter Modus' })]
        .filter(Boolean).map(function (k) { return { e: k.e, t: k.t, fn: k.los }; });
    },
    karten: function () {
      var b = W.bibliothek() || { bereiche: [] };
      var themen = [].slice.call(document.querySelectorAll('[data-topic]')).map(function (el) { return W.knopf('[data-topic="' + el.getAttribute('data-topic') + '"]', { e: { streit: '🏠', schule: '📚', behoerden: '📄', teen: '🎧', gesundheit: '🩺', pause: '🫧' }[el.getAttribute('data-topic')] || '💬', chip: 'Thema' }); });
      var neu = [].slice.call(document.querySelectorAll('[data-r8f],[data-r7f]')).map(function (el) { var a = el.hasAttribute('data-r8f') ? 'data-r8f' : 'data-r7f'; return W.knopf('[' + a + '="' + el.getAttribute(a) + '"]', { chip: 'Neu bei Jacky' }); });
      var sprich = W.sprich({ figur: 'Jacky', bild: 'figur.jpg', text: 'Erzähl, was los ist. Jacky antwortet aus ihrem Wissen. Alles bleibt auf deinem Handy.' });
      var film = W.knopf('#btnStory', { art: 'film', chip: 'Kleiner Trickfilm', e: '🧵', bild: 'schuhmacher.jpg', titel: 'Die Geschichte vom Schuhmacher', text: 'Wie Jacky zu ihren Zauberschuhen kam. Tippen und zuschauen.' });
      var feat = [
        W.knopf('#r8Sos', { e: '🫧', chip: 'Sofort', titel: 'SOS: 1 Minute ruhig werden', text: 'Atmen mit Jacky, sofort.' }),
        W.knopf('#btnSchutz', { e: '🛡️', chip: 'Gratis, ohne Konto', titel: 'Zuhause nicht sicher?', text: 'Hilfe ohne Konto, vertraulich. Auch auf Französisch, Italienisch und Englisch.' }),
        W.knopf('#btnUnterwegs', { e: '🚶‍♀️', chip: 'Sicher unterwegs' }),
        themen.length ? W.gruppe({ id: 'themen', e: '💬', chip: themen.length + ' Themen', titel: 'Wähl ein Thema', text: 'Streit, Schule, Ämter, Teenager, Gesundheit oder einfach eine Pause.', karten: function () { return themen.filter(Boolean); } }) : null,
        W.knopf('#r8Heute', { e: '☀️', chip: 'Heute für dich', titel: 'Ein Gedanke in drei Blättern' }),
        W.knopf('#btnNotes', { e: '📝', chip: 'Für dich' }),
        W.knopf('#btnZyklus', { e: '🌸', chip: 'Für dich' }),
        W.knopf('#jkSchuhe', { e: '👠', chip: 'Wächst mit dir' }),
        W.knopf('#btnIdeas', { e: '💡', chip: 'Mitmachen' }),
        neu.length ? W.gruppe({ id: 'neu', e: '✨', chip: neu.length + ' Neuheiten', titel: 'Neu bei Jacky', text: 'SOS-Minute, Atem-Knopf, Notfallkarte, Frist im Brief und mehr.', karten: function () { return neu.filter(Boolean); } }) : null
      ];
      return [b.heute, sprich, feat[0], film, b.fuerDich, feat[1]].concat(W.mischen(b.bereiche, feat.slice(2)), [b.quiz, b.sammlung, b.alle]);
    }
  });
})();
