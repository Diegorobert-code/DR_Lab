/* sprich-daten.js – «Sprich mit Hasi». Hasi spricht nie: Er antwortet mit Gesten, Emoji und Holzschildern, die Erzählerin beschreibt.
   Alles bleibt auf dem Gerät (inhalt/sprich.js). */
(function () {
  'use strict';
  function zu(sel) { return function () { if (window.Sprich) Sprich.schliessen(); var el = document.querySelector(sel); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }; }
  function kino(id) { return function () { if (window.Sprich) Sprich.schliessen(); if (window.Inhalt) Inhalt.oeffnen(id || ''); }; }
  window.SPRICH = {
    app: 'hasi', figur: 'Hasi', bild: 'posen/winken.jpg', stumm: true, platzhalter: 'Zeig Hasi dein Problem …',
    hallo: ['🪧 «Willkommen»'], halloGeste: 'verbeugt sich, hebt ein Holzschild und zeigt auf die Knöpfe unten.',
    wieder: ['🪧 «Schön, dass du wieder da bist»'],
    unbekannt: ['🪧 «?» … dann 🪧 «Zeig es mir anders»'], unbekanntGeste: 'kratzt sich hinter dem Schlappohr und legt den Kopf schief.',
    chips: [
      { id: 'termine', l: '🗓 Ich vergesse Termine' },
      { id: 'tippen', l: '💬 Ich tippe nicht gern' },
      { id: 'familie', l: '👪 Etwas für die Familie' },
      { id: 'kino', l: '🎬 Zeig mir eine Geschichte' },
      { id: 'bauen', l: '🔧 Ich will selber bauen' },
      { id: 'tipp', l: '🪧 Gib mir einen Tipp' },
      { id: 'witz', l: '😄 Mach was Lustiges' }
    ],
    regeln: [
      { id: 'witz', w: /(witz|lustig|lach)/, a: ['🥕🥕🥕 Die Erzählerin sagt: Hasi jongliert drei Rüebli. Eines landet auf seinem Kopf. Er tut so, als wäre es Absicht.', '👓 Die Erzählerin sagt: Hasi sucht seine Brille. Sie ist auf seinem Kopf. Er lacht ganz ohne Ton.'], g: 'zwinkert.' },
      { id: 'termine', w: /(termin|vergess|erinner|kalender|kunden)/, a: ['🔔 Die Erzählerin sagt: Hasi meint die Erinnerung. Sie meldet sich am Vorabend, mit deinem Logo und deinen Farben.'], g: 'holt mit dem goldenen Schlüssel einen Würfel mit einer Glocke aus dem Regal.', aktion: { label: '▶ Zu Hasis Regal', tun: zu('#berater') } },
      { id: 'tippen', w: /(nicht gern tipp|tippe nicht|ungern tipp|schreib|diktier|reinreden)/, a: ['🎙️ Die Erzählerin sagt: Reinreden statt tippen. Der Text ist sofort zum Kopieren bereit.'], g: 'tippt sich an den Mund und zeigt auf ein Blatt, das sich von selbst füllt.', aktion: { label: '▶ Zu Hasis Regal', tun: zu('#berater') } },
      { id: 'familie', w: /(famili|kind|oma|opa|hund|schlaf|gutenacht)/, a: ['🌙 🌹 🐶 Die Erzählerin sagt: Gutenachtgeschichten, ein einfacher Bildschirm für Oma, und eine App für den Familienhund. Tippe im Regal auf den Würfel, der passt.'], g: 'hält drei Würfel hoch: einen Mond, eine Rose und eine Pfote.', aktion: { label: '▶ Zu Hasis Regal', tun: zu('#berater') } },
      { id: 'kino', w: /(geschicht|film|kino|erzaehl)/, a: ['🎬 Die Erzählerin sagt: In Hasis Kino warten zehn stille Geschichten.'], g: 'zieht einen kleinen roten Vorhang auf und verbeugt sich.', aktion: { label: '▶ Hasis Kino', tun: kino('kino') } },
      { id: 'bauen', w: /(bau|werkbank|eigene|vorlage|selber)/, a: ['🔧 Die Erzählerin sagt: Auf der Werkbank baust du eine Checkliste, einen Preisrechner, eine Erinnerung oder ein Quiz und nimmst es als Datei mit.'], g: 'krempelt die Ärmel hoch und klopft auf die Werkbank.', aktion: { label: '▶ Werkbank-Ideen', tun: kino('werkbank') } },
      { id: 'tipp', w: /(tipp|rat|hilf mir|was soll)/, a: function () { var I = window.INHALT, r = I && I.regale.filter(function (x) { return x.id === 'tipps'; })[0]; if (!r) return '🪧'; var t = r.items[Math.floor(Math.random() * r.items.length)]; return t.e + ' «' + t.t + '». ' + t.x; }, g: 'dreht ein Holzschild um.' },
      { id: 'reden', w: /(warum sprichst|kannst du reden|sag was|sprich)/, a: ['🤐 Die Erzählerin sagt: Hasi spricht nie. Er hört gut zu und zeigt dir alles mit Gesten und Schildern.'], g: 'legt einen Finger auf den Mund und lächelt.' },
      { id: 'geld', w: /(geld|aktie|trading|reich|anlage)/, a: ['🛎️ Die Erzählerin sagt: Hasi gibt keine Geldtipps. Es gibt ein Radar, das nur einen Ping schickt, wenn etwas zählt. Keine Anlageberatung.'], g: 'schüttelt den Kopf beim Geldsack und zeigt auf eine kleine Glocke.' },
      { id: 'hallo', w: /(hallo|hoi|gruezi|salut|hey)/, a: ['👋'], g: 'winkt mit beiden Pfoten.' }
    ]
  };
})();
