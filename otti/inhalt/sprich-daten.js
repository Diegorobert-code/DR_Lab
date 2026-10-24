/* sprich-daten.js – «Sprich mit Otti» (privat): Antworten aus festen Regeln, alles bleibt auf dem Gerät (inhalt/sprich.js).
   Anders als «Reden» geht hier nie Audio oder Text an einen Server. Vorschläge kommen aus dem Lern-Profil der Zauberwald-Tore. */
(function () {
  'use strict';
  function tore(weltId, storyId) { return function () { if (window.Sprich) Sprich.schliessen(); if (window.Welten) Welten.oeffnen(weltId, storyId); }; }
  function vorschlag() {
    var W = window.Welten; if (!W || !W.empfehlung) return null;
    var t = W.empfehlung(), p = W.profil ? W.profil() : null; if (!t) return null;
    var text = t.grund + '. Meine Idee: «' + t.g.titel + '» ' + (t.w.im || '') + '.';
    if (p && p.stufe > 1) text += ' Du bist schon ' + p.name + '!';
    return { text: text, aktion: { label: '▶ Durchs ' + t.w.tor, tun: tore(t.w.id, t.g.id) } };
  }
  function welt(id) { var D = window.WELTEN; return D && D.WELTEN.filter(function (w) { return w.id === id; })[0]; }
  function weltAntwort(id, satz) { return function () { var w = welt(id); return w ? satz.replace('{tor}', w.tor).replace('{name}', w.name) : satz; }; }
  window.SPRICH = {
    app: 'otti', figur: 'Otti', bild: 'freunde/otti.jpg', platzhalter: 'Schreib Otti etwas …',
    hallo: ['Hallo, ich bin Otti, der kleine Igel mit dem gelben Halstuch. Wollen wir durch ein Zauberwald-Tor gehen?'],
    wieder: ['Da bist du ja wieder! Im Zauberwald ist heute ein Tor offen.'],
    unbekannt: ['Hm, das weiss ich nicht. Aber ich kenne viele Geschichten! Tipp auf einen Knopf.'],
    vorschlag: vorschlag,
    chips: [
      { id: 'weltraum', l: '🚀 Ins Weltall!' },
      { id: 'heldin', l: '🦸‍♀️ Superheldin' },
      { id: 'piraten', l: '🏴‍☠️ Piraten' },
      { id: 'erfinden', l: '✏️ Wir erfinden eine Geschichte' },
      { id: 'dino', l: '🦕 Dinos' },
      { id: 'meer', l: '🐚 Unter dem Meer' },
      { id: 'witz', l: '😄 Ein Witz' }
    ],
    regeln: [
      { id: 'witz', w: /(witz|lustig|lach)/, a: ['Warum hat der Igel keine Angst im Dunkeln? Er hat immer seine Stacheln dabei. Pieks!', 'Was sagt der Mond zum Stern? Du bist heute aber hell!'] },
      { id: 'weltraum', w: /(weltall|weltraum|rakete|stern|planet|kometli)/, a: weltAntwort('weltraum', 'Hinter dem {tor} wartet Kometli, das kleine Raumschiff. Steigst du ein?'), aktion: { label: '▶ Zum Sternentor', tun: tore('weltraum') } },
      { id: 'heldin', w: /(held|flinka|super|kraft)/, a: ['Flinka Funkenherz ist unsere Superheldin. Wenn sie freundlich ist, wird alles federleicht!'], aktion: { label: '▶ Zur Glitzerstadt', tun: tore('superheldin') } },
      { id: 'piraten', w: /(pirat|schatz|schiff|insel)/, a: ['Ahoi! Auf der Pirateninsel suchen wir einen Schatz. Der grösste Schatz sind aber Freunde.'], aktion: { label: '▶ Zum Muscheltor', tun: tore('piraten') } },
      { id: 'dino', w: /(dino|ei|urzeit)/, a: ['Im Dino-Tal wohnen freundliche Dinos. Einer hat ein Ei gefunden!'], aktion: { label: '▶ Zum Farntor', tun: tore('dino') } },
      { id: 'meer', w: /(meer|fisch|wasser|perla|koralle)/, a: ['Im Korallenreich singt Perla mit den Fischen. Blubb!'], aktion: { label: '▶ Zum Perlentor', tun: tore('meer') } },
      { id: 'schloss', w: /(schloss|prinz|wolke|regenbogen)/, a: ['Im Wolkenschloss ist alles weich wie Watte.'], aktion: { label: '▶ Zum Wolkentor', tun: tore('schloss') } },
      { id: 'erfinden', w: /(erfind|eigene|mila|ausdenk)/, a: ['Juhu! Mila stellt dir ein paar Fragen. Du tippst, und schon wird es eure Geschichte.'], aktion: { label: '▶ Erfinden mit Mila', tun: function () { if (window.Sprich) Sprich.schliessen(); if (window.Welten) { Welten.oeffnen(); setTimeout(function () { var b = document.querySelector('[data-wt="erfinden"]'); if (b) b.click(); }, 50); } } } },
      { id: 'geschichte', w: /(geschicht|erzaehl|maerchen|tor)/, a: function () { var v = vorschlag(); return v ? v.text : 'Im Zauberwald warten viele Geschichten.'; }, aktion: { label: '▶ Zauberwald', tun: tore() } },
      { id: 'nacht', w: /(schlaf|muede|nacht|bett)/, a: ['Dann kuscheln wir uns ein. Ich rolle mich zu einer kleinen Kugel. Gute Nacht!'] },
      { id: 'hallo', w: /(hallo|hoi|gruezi|salut|hey)/, a: ['Hallo! Schön, dass du da bist.', 'Hoi! Ich wackle mit der Nase.'] }
    ]
  };
})();
