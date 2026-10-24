/* sprich-daten.js – «Sprich mit dem Zahnböcklein». Antworten aus festen Regeln, alles bleibt auf dem Gerät (inhalt/sprich.js).
   Keine Diagnosen, keine Heilversprechen: Bei Zahnweh immer eine erwachsene Person und die Zahnärztin. */
(function () {
  'use strict';
  function schule(id) { return function () { if (window.Sprich) Sprich.schliessen(); if (window.Inhalt) Inhalt.oeffnen(id || ''); }; }
  function putzen() { if (window.Sprich) Sprich.schliessen(); var b = document.getElementById('go') || document.querySelector('.go, button.big'); if (b) b.click(); }
  function ausRegal(rid) { return function () { var I = window.INHALT, r = I && I.regale.filter(function (x) { return x.id === rid; })[0]; if (!r) return 'Glitzer!'; var t = r.items[Math.floor(Math.random() * r.items.length)]; return t.e + ' ' + (t.t || t.f) + ': ' + t.x; }; }
  window.SPRICH = {
    app: 'zahnboecklein', figur: 'Zahnböcklein', bild: 'aura/figur-idle.webp', platzhalter: 'Schreib dem Zahnböcklein …',
    hallo: ['Hallo! Ich bin das Zahnböcklein. Ich passe auf eure Zähne auf. Willst du etwas wissen, ein Rätsel oder gleich putzen?'],
    wieder: ['Da bist du ja wieder! Deine Zähne glitzern schon ein bisschen.'],
    unbekannt: ['Hm, das weiss ich nicht. Tipp auf einen Knopf, dann zeige ich dir etwas Glitzriges.'],
    chips: [
      { id: 'putzen', l: '🪥 Wir putzen jetzt!' },
      { id: 'wissen', l: '🦷 Erzähl mir was über Zähne' },
      { id: 'monster', l: '👾 Was sind Zahnmonster?' },
      { id: 'raetsel', l: '❓ Ein Rätsel' },
      { id: 'wackel', l: '😬 Mein Zahn wackelt' },
      { id: 'witz', l: '😄 Ein Witz' }
    ],
    regeln: [
      { id: 'witz', w: /(witz|lustig|lach)/, a: ['Was sagt ein Zahn zum anderen? Komm, wir machen einen Ausflug, die Zahnbürste fährt!', 'Warum ist die Zahnbürste so fröhlich? Weil sie jeden Tag zweimal tanzen darf!'] },
      { id: 'wackel', w: /(wackel|faellt|ausgefallen|luecke)/, a: ['Ein Wackelzahn ist ganz normal. Darunter wächst ein neuer, grosser Zahn. Wenn er weh tut oder blutet, sag es bitte Mama oder Papa.'] },
      { id: 'putzen', w: /(putz|buerst|zahnpasta)/, a: ['Juhu! Zwei Minuten, oben und unten, aussen, innen und auf den Kauflächen. Ich zähle mit!'], aktion: { label: '▶ Los, putzen', tun: putzen } },
      { id: 'monster', w: /(monster|karies|bakterie|kaefer)/, a: ['Zahnmonster sind winzige Krümel-Fresser. Sie mögen Zucker. Mit der Bürste schubsen wir sie weg. In der Zahn-Schule kannst du sie sammeln!'], aktion: { label: '▶ Monster-Album', tun: schule('album') } },
      { id: 'raetsel', w: /(raetsel|quiz|frage)/, a: ['Ich habe 30 Rätsel. Fangen wir an?'], aktion: { label: '▶ Rätsel spielen', tun: schule('raetsel') } },
      { id: 'wissen', w: /(wissen|erzaehl|warum|wieso|zahn|zaehne)/, a: ausRegal('wissen'), aktion: { label: '▶ Zahn-Schule', tun: schule('') } },
      { id: 'suess', w: /(suess|zucker|schoggi|bonbon|gummi)/, a: ['Süsses ist manchmal fein. Danach Wasser trinken und am Abend gut putzen, dann haben die Zahnmonster keine Chance.'] },
      { id: 'zahnarzt', w: /(zahnarzt|zahnaerztin|weh|schmerz)/, a: ['Wenn ein Zahn weh tut, sag es bitte einer erwachsenen Person. Die Zahnärztin schaut ganz sanft nach.'] },
      { id: 'schlafen', w: /(schlaf|nacht|muede|bett)/, a: ['Zuerst putzen, dann ins Bett. Gute Nacht, ich flattere leise durchs Zimmer.'] },
      { id: 'hallo', w: /(hallo|hoi|gruezi|salut|hey)/, a: ['Hallo! *flatter flatter*', 'Hoi! Zeig mal dein schönstes Lächeln.'] }
    ]
  };
})();
