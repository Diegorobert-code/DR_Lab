/* sprich-daten.js – «Sprich mit Wäf Wäf». Antworten aus festen Regeln, alles bleibt auf dem Gerät (inhalt/sprich.js).
   Nur Belohnung, nie Strafe. Bei Schmerzen, Angst oder Problemen: Tierarzt oder Fachperson. */
(function () {
  'use strict';
  function schule(id) { return function () { if (window.Sprich) Sprich.schliessen(); if (window.Inhalt) Inhalt.oeffnen(id || ''); }; }
  function ausRegal(rid, feld) { return function () { var I = window.INHALT, r = I && I.regale.filter(function (x) { return x.id === rid; })[0]; if (!r) return 'Wuff!'; var t = r.items[Math.floor(Math.random() * r.items.length)]; return t.e + ' ' + (t.t || t.f) + ': ' + (feld === 'schritte' ? t.schritte.join(' ') : t.x); }; }
  window.SPRICH = {
    app: 'waefwaef', figur: 'Wäf Wäf', bild: 'figur-klein.jpg', platzhalter: 'Schreib Wäf Wäf etwas …',
    hallo: ['Wuff! Hallo, ich bin Wäf Wäf. Willst du mit mir üben, etwas über Hunde wissen oder ein Rätsel?'],
    wieder: ['Wuff wuff! Da bist du ja wieder. Ich habe dich vermisst.'],
    unbekannt: ['Wuff? Das verstehe ich nicht ganz. Ich bin ja ein Hund. Tipp auf einen Knopf!'],
    chips: [
      { id: 'ueben', l: '🎓 Was üben wir heute?' },
      { id: 'wissen', l: '💛 Erzähl mir was über Hunde' },
      { id: 'gefuehl', l: '🐶 Wie geht es dir?' },
      { id: 'spiel', l: '🎾 Spielen!' },
      { id: 'raetsel', l: '❓ Ein Rätsel' },
      { id: 'witz', l: '😄 Ein Hundewitz' }
    ],
    regeln: [
      { id: 'witz', w: /(witz|lustig|lach)/, a: ['Warum bellen Hunde den Mond an? Weil er nicht zurückbellt! Wuff, hihi.', 'Was macht ein Hund im Kino? Er schaut sich einen Wuff-Film an!', 'Ich habe meinen Schwanz gejagt. Ich habe gewonnen. Glaube ich.'] },
      { id: 'ueben', w: /(ueb|train|lern|heute|trick|sitz|platz)/, a: ausRegal('uebungen', 'schritte'), aktion: { label: '▶ Zur Hundeschule', tun: schule('uebungen') } },
      { id: 'wissen', w: /(wissen|erzaehl|warum|wieso|hund)/, a: ausRegal('wissen'), aktion: { label: '▶ Hund verstehen', tun: schule('wissen') } },
      { id: 'raetsel', w: /(raetsel|quiz|frage)/, a: ['Ich habe 20 Rätsel für dich. Wie viele schaffst du?'], aktion: { label: '▶ Rätsel spielen', tun: schule('raetsel') } },
      { id: 'gefuehl', w: /(wie geht|gehts|muede|hunger|gluecklich)/, a: ['Mir geht es gut, ich wedle! Ein Spaziergang und ein Nickerchen, mehr brauche ich nicht.', 'Ich bin ein bisschen müde. Hunde schlafen viel, das ist ganz normal.', 'Ich bin glücklich, wenn wir zusammen etwas machen.'] },
      { id: 'spiel', w: /(spiel|ball|such|rennen)/, a: ['Juhu! Versteck ein Leckerli im Gras und sag «Such!». Ich finde es mit der Nase.', 'Roll ein Leckerli in ein Handtuch. Ich wickle es aus!', 'Drei Becher, unter einem ein Leckerli. Meine Nase entscheidet!'] },
      { id: 'streicheln', w: /(streichel|kuschel|lieb|knuddel)/, a: ['Ich mag es, wenn du mich an der Brust kraulst. Und wenn ich weggehe, heisst das: genug für jetzt.'] },
      { id: 'strafe', w: /(strafe|schimpf|hauen|boese)/, a: ['Ich lerne am besten mit Lob und Leckerli. Schimpfen macht mir Angst. Zeig mir lieber, was ich tun soll.'] },
      { id: 'tierarzt', w: /(tierarzt|krank|kotz|durchfall|humpel)/, a: ['Wenn es mir nicht gut geht, frag bitte eine erwachsene Person. Die ruft die Tierärztin an.'] },
      { id: 'hallo', w: /(hallo|hoi|gruezi|salut|hey)/, a: ['Wuff! Hallo!', 'Hoi! Ich wedle schon.'] }
    ]
  };
})();
