/* sprich-daten.js – «Sprich mit Kiki». Antworten aus festen Regeln, alles bleibt auf dem Gerät (inhalt/sprich.js).
   Zum Singen braucht Kiki das Mikrofon nur für die Tonhöhe (wie bisher); hier im Gespräch wird nichts gesendet. */
(function () {
  'use strict';
  function kiste(id) { return function () { if (window.Sprich) Sprich.schliessen(); if (window.Inhalt) Inhalt.oeffnen(id || ''); }; }
  function geh(ziel) { return function () { if (window.Sprich) Sprich.schliessen(); var b = document.querySelector('[data-go="' + ziel + '"]'); if (b) b.click(); }; }
  function lied() { var L = window.KikiLieder, s = L && L.songs; if (!s || !s.length) return 'Lass uns ein Lied singen! Bei «Lieder» findest du viele.'; var x = s[Math.floor(Math.random() * s.length)]; return 'Wie wäre es mit «' + (x.t || x.title || x.name || 'einem Lied') + '»? Ich singe vor, du singst nach!'; }
  function spiel() { var I = window.INHALT, r = I && I.regale.filter(function (x) { return x.id === 'spiele'; })[0]; if (!r) return 'Summ mit mir!'; var t = r.items[Math.floor(Math.random() * r.items.length)]; return t.e + ' ' + t.t + ': ' + t.x; }
  window.SPRICH = {
    app: 'kiki', figur: 'Kiki', bild: 'figur.jpg', platzhalter: 'Schreib Kiki etwas …',
    hallo: ['Hallo, ich bin Kiki! La-la-la! Wollen wir singen, ein Musik-Spiel machen oder ein Rätsel lösen?'],
    wieder: ['Juhu, du bist wieder da! Meine Stimme ist schon aufgewärmt.'],
    unbekannt: ['La-la-hm? Das habe ich nicht verstanden. Tipp auf einen Knopf, dann singen wir!'],
    chips: [
      { id: 'singen', l: '🎤 Wir singen ein Lied!' },
      { id: 'spiel', l: '🎲 Ein Sing-Spiel' },
      { id: 'aufwaermen', l: '🎈 Stimme aufwärmen' },
      { id: 'raetsel', l: '❓ Ein Musik-Rätsel' },
      { id: 'instrument', l: '🎺 Welche Instrumente gibt es?' },
      { id: 'witz', l: '😄 Ein Witz' }
    ],
    regeln: [
      { id: 'witz', w: /(witz|lustig|lach)/, a: ['Warum singt der Koala so gut? Weil er immer den Ast-Ton trifft!', 'Was macht eine Trommel am liebsten? Bumm-Bumm-Ferien!'] },
      { id: 'aufwaermen', w: /(aufwaerm|atmen|summ|sirene)/, a: ['Tief einatmen wie an einer Blume, und langsam aus wie bei einer Kerze. Dann summen wir: mmmh!'], aktion: { label: '▶ Aufwärmen', tun: geh('warm') } },
      { id: 'singen', w: /(sing|lied|song|musik)/, a: lied, aktion: { label: '▶ Zu den Liedern', tun: geh('songs') } },
      { id: 'spiel', w: /(spiel|zusammen|mama|papa)/, a: spiel, aktion: { label: '▶ Musik-Kiste', tun: kiste('spiele') } },
      { id: 'raetsel', w: /(raetsel|quiz|frage)/, a: ['Ich habe 30 Musik-Rätsel. Los gehts!'], aktion: { label: '▶ Rätsel spielen', tun: kiste('raetsel') } },
      { id: 'instrument', w: /(instrument|trommel|gitarre|klavier|floete|geige)/, a: ['Trommel, Rassel, Klavier, Flöte und viele mehr! Jedes Lied, das du singst, bringt ein neues Instrument in deine Musik-Kiste.'], aktion: { label: '▶ Instrumente-Album', tun: kiste('instrumente') } },
      { id: 'leise', w: /(leise|schlaf|muede|nacht)/, a: ['Dann singen wir ganz leise, wie ein Schlaflied. Psst, la-le-lu.'] },
      { id: 'schief', w: /(schief|kann nicht singen|falsch)/, a: ['Jede Stimme ist schön! Singen lernt man wie Velofahren: mit Üben und mit Spass. Ich helfe dir bei jedem Ton.'] },
      { id: 'hallo', w: /(hallo|hoi|gruezi|salut|hey)/, a: ['Hallo! La-la-la!', 'Hoi! Schön, dass du da bist.'] }
    ]
  };
})();
