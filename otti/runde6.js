/* Runde 6 (21.10.2026): «Noch mehr Eigenschaften».
   1) Gruss nach Tageszeit und Jahreszeit (Herbst, Halloween 31.10., Advent, Winter …), merkt sich deinen Namen
   2) Charakter-Karte: über ein Dutzend Sätze, die zeigen, wie die Figur so ist; sie merkt sich, was du magst
   3) Figuren-Besuch: jeden Tag schaut eine andere DR-Lab-Figur vorbei, Nova zeigt ihr den Weg
   4) Überraschung des Tages mit Sammelleiste (24 Fächer); vom 1. bis 24. Dezember wird daraus der Adventskalender
   5) 🎧 Nur hören (Handystimme) und A+ grosse Schrift; Tippflächen mind. 44 px, ARIA-Beschriftungen
   6) Eigener Adventskalender (24 eigene Türchen, eigene Sammlung) und Saison-Karten der Figur (z. B. Halloween-Laterne)
   Alles bleibt nur auf diesem Gerät. */
(function () {
  'use strict';
  var C = {
    k: 'otti', figur: 'Otti', bild: 'posen/winkt.jpg', kinderBild: 'posen/schlaeft.jpg', zoom: '#r6blatt .blattinnen', ruhig: true,
    saisonBild: { halloweenTag: 'saison/halloween.jpg', advent: 'saison/advent.jpg' }, saisonZiel: '#buehne',
    nameHol: function () { try { return String(localStorage.getItem('otti_name') || '').trim().slice(0, 20); } catch (e) { return ''; } },
    hallo: ['{gruss}! Ich bin Otti.', '{gruss}, {name}! Schön, bist du da.'],
    tageszeit: {
      morgen: 'Otti reibt sich die Augen und bindet sein gelbes Halstuch. Der Wald glitzert vom Tau.',
      mittag: 'Otti macht Picknick unter dem grossen Pilz. Eine Beere für dich, eine für ihn.',
      nachmittag: 'Otti raschelt durchs Laub und sucht schöne Blätter für sein Zimmer.',
      abend: 'Bald ist Abendritual: Halstuch zusammenfalten, Laterne an, eine Geschichte.',
      nacht: 'Otti schläft eingerollt wie eine kleine Kugel. Psst, ganz leise.'
    },
    saison: {
      herbst: 'Herbst im Wald! Otti sammelt rote und gelbe Blätter für sein Bett.',
      halloween: 'Noch {n} Tage bis Halloween. Otti schnitzt eine Laterne mit einem lachenden Gesicht.',
      halloweenTag: 'Heute ist Halloween! Otti trägt sein Halstuch als Umhang. Im Wald leuchten lauter freundliche Laternen.',
      november: 'Nebel im Wald. Otti zündet seine Laterne an und geht ganz langsam nach Hause.',
      advent: 'Advent im Wald! Heute ist Türchen {n} dran. Otti hat eine Kerze ins Fenster gestellt.',
      weihnacht: 'Frohe Weihnachten! Otti hat für alle Freunde einen Tannzapfen bemalt.',
      neujahr: 'Ein neues Jahr! Otti wünscht dir viele schöne Waldtage.',
      winter: 'Winter! Otti kuschelt sich tief ins Laub und träumt vom Frühling.',
      fruehling: 'Frühling! Otti ist aufgewacht und streckt sich. Überall wachsen Blumen.',
      sommer: 'Sommer im Wald. Otti liebt den kühlen Schatten und Walderdbeeren.'
    },
    charTitel: 'So ist Otti', satzKnopf: 'Noch etwas über Otti',
    saetze: [
      ['Lieblingsding', 'Ottis Lieblingsding ist sein gelbes Halstuch. Frau Eule hat es ihm geschenkt, als er noch ganz klein war.'],
      ['Macke', 'Wenn Otti sich freut, rollt er sich kurz zu einer Kugel und wieder auf. Plopp!'],
      ['Ottis Spruch', '«Langsam ist auch schnell genug.»'],
      ['Geheimnis', 'Unter der grossen Wurzel hat Otti ein Versteck. Dort liegen ein glänzender Stein, eine Feder und ein Knopf.'],
      ['Ein bisschen Angst', 'Im Dunkeln ist es Otti manchmal mulmig. Dann summt er leise ein Lied, und schon ist es besser.'],
      ['Freude', 'Otti liebt es, wenn Regentropfen auf die Blätter klopfen. Plip, plip, plop.'],
      ['Lieblingsessen', 'Otti isst gern Beeren und Apfelschnitze. Und manchmal, ganz heimlich, ein Stück Kürbis.'],
      ['Lieblingsplatz', 'Ottis liebster Platz ist der Moosteppich unter der alten Tanne. Dort ist es immer weich.'],
      ['Freunde', 'Ottis beste Freunde sind Hoppel, Schnecki und Frau Eule. Und Nova, die alle kennt.'],
      ['Abendritual', 'Jeden Abend faltet Otti sein Halstuch, sagt dem Mond Gute Nacht und denkt an drei schöne Dinge vom Tag.'],
      ['Stacheln', 'Ottis Stacheln sind ganz weich, wenn er sich wohl fühlt. Nur wenn er erschrickt, stellen sie sich auf.'],
      ['Talent', 'Otti erkennt jeden Vogel im Wald an seinem Lied. Am liebsten hört er das Rotkehlchen.'],
      ['Tipp von Otti', 'Wenn du traurig bist: Hand aufs Herz legen und dreimal langsam atmen. Otti macht mit.'],
      ['Traum', 'Otti träumt davon, einmal mit Fia über den Wald zu fliegen. Nur ganz kurz und ganz tief.'],
      ['Mutmacher', 'Wenn Otti sein Halstuch festbindet, fühlt er sich ganz mutig. Probier es aus: Was ist dein Mutmacher?']
    ],
    vorliebe: {
      frage: 'Was magst du am liebsten im Wald?',
      optionen: [['pilze', '🍄 Pilze anschauen'], ['laub', '🍂 Im Laub rascheln'], ['beeren', '🫐 Beeren'], ['tiere', '🐌 Tiere besuchen'], ['mond', '🌙 Den Mond anschauen']],
      merk: 'Otti merkt es sich: Du magst {x}. Morgen sucht er gleich danach.'
    },
    besuchTitel: 'Besuch im Mondschein-Wald',
    besuch: [
      { name: 'Frau Eule', bild: 'freunde/eule.jpg', satz: 'Frau Eule landet auf dem Ast über Otti. «Huhu», sagt sie leise, «heute leuchtet der Mond besonders schön.»', morgen: 'Frau Eule hat eine neue Geschichte versprochen.', link: '<a class="r6-btn" href="../mondschein/">Zu den Geschichten 📖</a>' },
      { name: 'Fia', bild: 'besuch/fia.jpg', satz: 'Fia flattert auf Ottis Moosteppich und wärmt ihm mit ihrer kleinen Glut die Pfoten.', morgen: 'Fia will Otti die Sterne zeigen.', link: '<a class="r6-btn" href="../schlaf/">Zu Fias Nest 🪶</a>' },
      { name: 'Hoppel', bild: 'freunde/hoppel.jpg', satz: 'Hoppel kommt im Pyjama vorbei. Er will wissen, welche Geschichte heute Abend dran ist.', morgen: 'Hoppel bringt vielleicht sein Kissen mit.', link: '<a class="r6-btn" href="../mondschein/">Zu den Geschichten 📖</a>' },
      { name: 'Wäf Wäf', bild: 'besuch/waefwaef.jpg', satz: 'Wäf Wäf schnüffelt an Ottis Stacheln und niest. Hatschi! Beide müssen lachen.', morgen: 'Wäf Wäf will mit Otti Verstecken spielen.', link: '<a class="r6-btn" href="../waefwaef/">Zu Wäf Wäf 🐾</a>' },
      { name: 'Granny', bild: 'besuch/granny.jpg', satz: 'Granny bringt einen Apfelschnitz und streicht Otti sanft über den Kopf. Ganz vorsichtig, wegen der Stacheln.', morgen: 'Granny strickt Otti vielleicht Handschuhe.', link: '<a class="r6-btn" href="../granny/">Zu Granny 👵</a>' },
      { name: 'Hasi', bild: 'besuch/hasi.jpg', satz: 'Hasi bringt eine kleine Laterne aus seinem Laden. Er sagt nichts, aber er lächelt.', morgen: 'Hasi hat etwas für Ottis Garten.', link: '<a class="r6-btn" href="../hasi/">Zu Hasi 🐰</a>' }
    ],
    uebTitel: 'Ottis Waldfund des Tages',
    alleGesammelt: 'Otti rollt sich vor Freude zur Kugel. Plopp!',
    ueberraschung: [
      ['🍂', 'Ein rotes Ahornblatt. Otti hat es extra für dich aufgehoben.'],
      ['🌰', 'Eine glänzende Kastanie. Fühl mal in Gedanken: ganz glatt und kühl.'],
      ['🍄', 'Ein Pilz mit weissen Punkten. Nur anschauen, nicht essen, sagt Otti.'],
      ['🪶', 'Eine Feder von Frau Eule. Damit kann man ganz sanft die Nase kitzeln.'],
      ['🐌', 'Mini-Aufgabe: Geh so langsam wie Schnecki. Zehn Schnecken-Schritte.'],
      ['🌙', 'Ein Mondstrahl im Glas. Otti stellt ihn neben dein Bett.'],
      ['🍎', 'Ein Apfelschnitz. Otti teilt immer, die Hälfte ist für dich.'],
      ['🪨', 'Ein runder Stein vom Bach. Er ist noch warm von der Sonne.'],
      ['🦔', 'Mini-Aufgabe: Roll dich zusammen wie Otti, eine kleine Kugel. Und wieder auf!'],
      ['🌲', 'Ein Tannzapfen. Wenn es trocken ist, geht er auf. Wenn es regnet, geht er zu.'],
      ['🎶', 'Mini-Aufgabe: Summ ein Lied, ganz leise. Otti summt mit.'],
      ['⭐', 'Ein Sternchen, das vom Himmel gefallen ist. Otti hat es aufgefangen.'],
      ['🐞', 'Ein Marienkäfer auf Ottis Nase. Wie viele Punkte hat er wohl?'],
      ['🍁', 'Mini-Aufgabe: Such heute draussen ein schönes Blatt und zeig es Otti.'],
      ['🫐', 'Eine Handvoll Heidelbeeren. Otti hat jetzt einen ganz blauen Mund.'],
      ['🧣', 'Ottis gelbes Halstuch, frisch gewaschen. Es riecht nach Sonne.'],
      ['🏮', 'Eine kleine Laterne für den Heimweg. Sie leuchtet warm und gelb.'],
      ['🐿️', 'Ein Gruss vom Eichhörnchen. Es hat Otti eine Nuss geschenkt.'],
      ['🤗', 'Mini-Aufgabe: Umarm dich selbst ganz fest. So drückt Otti seine Freunde.'],
      ['💧', 'Ein Tautropfen im Spinnennetz. Er glitzert wie ein Edelstein.'],
      ['🌈', 'Ein Regenbogen über dem Wald. Welche Farbe magst du am liebsten?'],
      ['☁️', 'Ein Stück Kissenwolke. Ganz weich zum Träumen.'],
      ['👂', 'Mini-Aufgabe: Augen zu. Was hörst du gerade? Otti hört eine Eule.'],
      ['💛', 'Ein goldenes Herz aus Laub. Otti sagt: Schön, dass es dich gibt.']
    ],
    advent: [
      ['🕯️', 'Türchen 1: Otti stellt die erste Kerze ins Fenster. Der Wald wird ganz still.'],
      ['🌲', 'Otti schmückt eine kleine Tanne mit Tannzapfen und roten Beeren.'],
      ['🍪', 'Granny backt Guetzli in Igelform. Eines ist für dich.'],
      ['🧦', 'Mini-Aufgabe: Zieh heute deine wärmsten Socken an, wie Otti.'],
      ['⭐', 'Otti bastelt einen Stern aus Stroh und hängt ihn an die Wurzel.'],
      ['🎅', 'Samichlaus-Tag! Otti hat seinen Schuh geputzt. Drin: Nüsse, eine Mandarine und ein Stück Schoggi.'],
      ['❄️', 'Die erste Schneeflocke landet auf Ottis Nase. Sie kitzelt.'],
      ['🎶', 'Mini-Aufgabe: Sing mit Otti ein Winterlied, ganz leise.'],
      ['🍊', 'Eine Mandarine. Otti riecht an der Schale. Mmh, das riecht nach Advent.'],
      ['🦉', 'Frau Eule erzählt eine Geschichte vom Winterwald.'],
      ['🧣', 'Otti strickt mit Granny einen Schal für Hoppel. Er wird ganz schön lang.'],
      ['🌙', 'Der Mond leuchtet über dem verschneiten Wald. Alles glitzert.'],
      ['🕊️', 'Mini-Aufgabe: Sag heute jemandem etwas Liebes.'],
      ['🎁', 'Otti packt ein kleines Geschenk für Schnecki ein. Ganz langsam, damit Schnecki mitkommt.'],
      ['🔔', 'Ein Glöckchen klingelt im Wald. Wer das wohl ist?'],
      ['🍎', 'Ein Bratapfel mit Zimt. Der ganze Wald riecht danach.'],
      ['✨', 'Mini-Aufgabe: Zähl die Lichter, die du heute siehst.'],
      ['🐾', 'Spuren im Schnee. Hoppel war hier, und Wäf Wäf auch.'],
      ['🪵', 'Otti sitzt am warmen Ofen und wärmt sich die Pfoten.'],
      ['💌', 'Otti schreibt einen Brief an den Mond. Was würdest du ihm schreiben?'],
      ['🌟', 'Der kürzeste Tag. Otti zündet extra viele Lichter an.'],
      ['☁️', 'Mini-Aufgabe: Mach es dir heute so gemütlich wie Otti im Laub.'],
      ['🎄', 'Otti und seine Freunde schmücken den grossen Baum mitten im Wald.'],
      ['💛', 'Heiligabend. Otti sagt: Schön, dass du jeden Tag da warst. Frohe Weihnachten!']
    ],
    kinderTitel: 'Ottis Fantasie-Frage',
    kinderSchluss: 'Mach die Augen zu und denk dir etwas aus. Es gibt keine falsche Antwort.',
    fantasie: [
      'Was hat Otti heute in seinem Versteck unter der Wurzel gefunden?',
      'Wenn Ottis Halstuch zaubern könnte: Was würde es machen?',
      'Wie sieht Ottis Zimmer im Baumstamm aus?',
      'Wohin würde Otti reisen, wenn er auf einem Blatt fliegen könnte?',
      'Was erzählt Frau Eule Otti, wenn alle schlafen?',
      'Welche Farbe hat ein Traum von Otti?',
      'Wenn du ein Waldtier wärst: Welches wärst du, und was würdest du mit Otti spielen?',
      'Was flüstert der Mond Otti zu?',
      'Wie klingt der Wald, wenn es leise regnet?',
      'Was packt Otti in seinen Rucksack für ein Abenteuer?',
      'Wer wohnt im kleinsten Haus im Wald?',
      'Was würdest du Otti schenken, damit er sich freut?'
    ],
    einsetzen: function (N, H) {
      var $ = function (id) { return document.getElementById(id); };
      // Kinder-App: Den Namen trägt nur ein Elternteil ein (Für Eltern). Darum kein Namensfeld hier.
      var nb = N.gruss.querySelector('[data-r6=name]'); if (nb) nb.remove();
      var nf = N.gruss.querySelector('.r6-nameform'); if (nf) nf.remove();
      var hall = H.saison.k === 'halloween' || H.saison.k === 'halloweenTag';
      var css = document.createElement('style');
      css.textContent = [
        '.r6-laterne{position:absolute;left:10px;top:10px;z-index:5;width:52px;height:52px;border-radius:50%;border:2px solid #f5c542;background:#0b1a3acc;display:grid;place-items:center;font-size:26px;line-height:1;cursor:pointer;padding:0;box-shadow:0 4px 14px #0007}',
        '.r6-laterne:focus-visible{outline:3px solid #fff;outline-offset:2px}',
        '.r6-laterne i{position:absolute;right:-2px;top:-2px;width:14px;height:14px;border-radius:50%;background:#ff8a3d;border:2px solid #0b1a3a}',
        '.r6-laterne i[hidden]{display:none}',
        'body.imspiel .r6-laterne{display:none}',
        '#r6blatt .blattinnen h2 small{display:block}', '#r6blatt h2:focus{outline:none}',
        '#r6blatt .r6-karte,#r6blatt .r6-gruss{margin:12px 0}',
        '.r6-hw{display:flex;gap:16px;align-items:center}',
        '.r6-kuerbis{flex:none;width:112px;height:104px;border-radius:24px;display:grid;place-items:center;background:radial-gradient(circle at 50% 60%,#2a1d3f,#120c22);transition:box-shadow .6s}',
        '.r6-kuerbis.an{box-shadow:0 0 0 2px #ffcf6b,0 0 34px #ffb34d88}',
        '.r6-kuerbis svg{width:96px;height:88px}',
        '.r6-kuerbis .gesicht{fill:#4a2208;transition:fill .6s}',
        '.r6-kuerbis.an .gesicht{fill:#ffe08a}',
        '.r6-hw p{margin:0}',
        '@media (prefers-reduced-motion:reduce){.r6-kuerbis,.r6-kuerbis .gesicht{transition:none}}'
      ].join('');
      document.head.appendChild(css);

      // Sanfte Halloween-Laterne (17. bis 31. Oktober): Gesicht wählen, anzünden. Nur freundliche Gesichter.
      var hk = null;
      if (hall) {
        var GES = {
          lacht: ['😊 Lachend', '<circle cx="36" cy="40" r="5"/><circle cx="60" cy="40" r="5"/><path d="M33 52 q15 14 30 0 q-15 6 -30 0z"/>', 'Meine Laterne lacht. Dann lacht der ganze Wald mit.'],
          staunt: ['😮 Staunend', '<circle cx="36" cy="40" r="5.5"/><circle cx="60" cy="40" r="5.5"/><ellipse cx="48" cy="57" rx="6" ry="7"/>', 'Oh! Meine Laterne staunt. Sie hat bestimmt ein Glühwürmchen gesehen.'],
          muede: ['😴 Schläfrig', '<path d="M30 41 q6 5 12 0 q-6 2 -12 0z"/><path d="M54 41 q6 5 12 0 q-6 2 -12 0z"/><path d="M40 55 q8 6 16 0 q-8 3 -16 0z"/>', 'Meine Laterne ist schon müde. Sie leuchtet ganz sanft, wie ein Nachtlicht.']
        };
        var wahl = H.hol('laterne', 'lacht'), an = H.hol('laterneAn', '') === H.heute;
        hk = H.el('<section class="r6 r6-karte r6-halloween" aria-labelledby="r6ht"><h2 id="r6ht">🎃 Ottis Kürbislaterne</h2>' +
          '<div class="r6-hw"><div class="r6-kuerbis" aria-hidden="true"><svg viewBox="0 0 96 88"><path d="M46 14 q2 -9 9 -11" stroke="#5b8f3a" stroke-width="5" fill="none" stroke-linecap="round"/>' +
          '<ellipse cx="48" cy="50" rx="44" ry="34" fill="#e8822a"/><ellipse cx="48" cy="50" rx="24" ry="34" fill="#f39a3c"/><ellipse cx="48" cy="50" rx="9" ry="33" fill="#f7a94a"/><g class="gesicht"></g></svg></div>' +
          '<p class="r6-hl"></p></div>' +
          '<div class="r6-chips" role="group" aria-label="Gesicht für die Laterne wählen">' + Object.keys(GES).map(function (k) { return '<button type="button" data-g="' + k + '" aria-pressed="false">' + GES[k][0] + '</button>'; }).join('') + '</div>' +
          '<div class="r6-reihe"><button type="button" class="r6-btn voll" data-l="an"></button></div>' +
          '<p class="r6-klein">Halloween bei Otti ist gemütlich: Laternen, Kürbissuppe und Verkleiden. Nichts Gruseliges, versprochen.</p></section>');
        var zeigL = function (sprich) {
          var g = GES[wahl] || GES.lacht;
          hk.querySelector('.gesicht').innerHTML = g[1];
          hk.querySelector('.r6-kuerbis').classList.toggle('an', an);
          hk.querySelectorAll('[data-g]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-g') === wahl)); });
          hk.querySelector('[data-l=an]').textContent = an ? '🌙 Laterne ausblasen' : '🕯️ Laterne anzünden';
          hk.querySelector('.r6-hl').textContent = an ? g[2] : (H.saison.k === 'halloweenTag' ? 'Heute ist Halloween! Wähl ein Gesicht und zünde Ottis Laterne an.' : 'Otti hat einen Kürbis geschnitzt. Wähl ein freundliches Gesicht und zünde die Laterne an.');
          if (sprich) H.sag(hk.querySelector('.r6-hl').textContent);
        };
        hk.addEventListener('click', function (e) {
          var b = e.target.closest('[data-g],[data-l]'); if (!b) return;
          if (b.hasAttribute('data-g')) { wahl = b.getAttribute('data-g'); H.leg('laterne', wahl); }
          else { an = !an; H.leg('laterneAn', an ? H.heute : ''); if (an) H.feier(hk); }
          zeigL(true);
        });
        zeigL(false);
      }

      // Blatt «Ottis Waldtag»: alles Neue an einem ruhigen Ort, Otti bleibt auf der Bühne im Mittelpunkt.
      var blatt = H.el('<div class="blatt" id="r6blatt" hidden role="dialog" aria-modal="true" aria-labelledby="r6blattT"><div class="blattinnen">' +
        '<div class="griff" aria-hidden="true"></div><h2 id="r6blattT">Ottis Waldtag<small>Jeden Tag etwas Neues im Mondschein-Wald</small></h2>' +
        '<div class="r6-inhalt"></div><button class="nein" type="button" data-zu>Zurück zu Otti</button></div></div>');
      var inh = blatt.querySelector('.r6-inhalt');
      [N.gruss, hk, N.ueberraschung, N.kinder, N.besuch, N.charakter].forEach(function (x) { if (x) inh.appendChild(x); });
      // Am Abend: direkt zum Abendritual
      if (H.tz === 'abend' || H.tz === 'nacht') {
        var r = N.gruss.querySelector('.r6-leiste');
        r.insertAdjacentHTML('afterbegin', '<button type="button" class="r6-k" data-abend>🌙 Abendritual mit Otti</button>');
        r.querySelector('[data-abend]').addEventListener('click', function () { zu(); var a = $('abendKnopf'); if (a) a.click(); });
      }
      document.body.appendChild(blatt);
      function zu() { blatt.hidden = true; H.still(); var l = document.querySelector('.r6-laterne'); if (l) l.focus(); }
      blatt.addEventListener('click', function (e) { if (e.target === blatt || e.target.closest('[data-zu]')) zu(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !blatt.hidden) zu(); });

      // Knopf auf der Bühne: Saison-Zeichen, Punkt solange der Waldfund von heute noch zu ist
      var emo = H.saison.k === 'advent' ? '🕯️' : hall ? '🎃' : H.saison.e;
      var lb = H.el('<button type="button" class="r6-laterne" aria-label="Ottis Waldtag öffnen: Waldfund, Besuch und mehr">' + emo + '<i aria-hidden="true"></i></button>');
      var punkt = function () { lb.querySelector('i').hidden = H.hol('offen', '') === H.heute; };
      punkt();
      N.ueberraschung.addEventListener('click', function () { setTimeout(punkt, 50); });
      lb.addEventListener('click', function (e) {
        e.stopPropagation(); blatt.hidden = false;
        var ib = blatt.querySelector('.blattinnen'); ib.scrollTop = 0;
        var h = blatt.querySelector('h2'); h.tabIndex = -1; h.focus();
      });
      lb.addEventListener('keydown', function (e) { e.stopPropagation(); });
      var bu = $('buehne'); if (bu) bu.appendChild(lb);

      // Auch aus Ottis Zimmer erreichbar
      var zz = $('zimZu');
      if (zz) {
        var zb = H.el('<button class="nein" type="button" style="text-decoration:none;color:#f5c542;font-weight:800">' + emo + ' Ottis Waldtag</button>');
        zb.addEventListener('click', function () { var z = $('zimmer'); if (z) z.hidden = true; lb.click(); });
        zz.before(zb);
      }
    }
};
  if (window['R6_' + C.k]) return;
  var K = C.k + '.r6.';
  function hol(k, d) { try { var v = localStorage.getItem(K + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; }
  function summ(m) { try { if (navigator.vibrate && !ruhig) navigator.vibrate(m); } catch (e) {} }
  var ruhig = !!C.ruhig || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var jetzt = new Date();
  /* Test-Schalter: ?r6tag=2026-10-31&r6zeit=19 zeigt einen anderen Tag */
  try {
    var q = new URLSearchParams(location.search); if (!q.get('r6tag')) try { q = new URL(performance.getEntriesByType('navigation')[0].name).searchParams; } catch (x) {} var qt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(q.get('r6tag') || '');
    if (qt) jetzt = new Date(+qt[1], +qt[2] - 1, +qt[3], jetzt.getHours(), jetzt.getMinutes());
    if (q.get('r6zeit')) jetzt.setHours(+q.get('r6zeit'));
  } catch (e) {}
  var M = jetzt.getMonth() + 1, D = jetzt.getDate(), Std = jetzt.getHours();
  var heute = jetzt.getFullYear() + '-' + M + '-' + D;
  var tagNr = Math.floor((jetzt.getTime() - jetzt.getTimezoneOffset() * 6e4) / 864e5);
  var F = C.figur;

  /* ---------- Stimme (Handystimme, nur wenn vorhanden) ---------- */
  var kannReden = !C.stumm && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
  var redet = null;
  function stimme() {
    try { var v = speechSynthesis.getVoices(); return v.filter(function (x) { return /de-CH/i.test(x.lang); })[0] || v.filter(function (x) { return /^de/i.test(x.lang); })[0] || null; } catch (e) { return null; }
  }
  function sag(t, fertig) {
    if (!kannReden) { if (fertig) fertig(); return; }
    still();
    try {
      var u = new SpeechSynthesisUtterance(String(t).replace(/[«»]/g, '')); u.lang = 'de-CH'; u.rate = 0.92; u.pitch = 1;
      var v = stimme(); if (v) u.voice = v;
      u.onend = u.onerror = function () { if (redet === u) { redet = null; if (fertig) fertig(); } };
      redet = u; speechSynthesis.speak(u);
    } catch (e) { if (fertig) fertig(); }
  }
  function still() { redet = null; try { speechSynthesis.cancel(); } catch (e) {} }

  /* ---------- Tageszeit und Jahreszeit ---------- */
  function tageszeit() { return Std < 5 ? 'nacht' : Std < 11 ? 'morgen' : Std < 14 ? 'mittag' : Std < 18 ? 'nachmittag' : Std < 22 ? 'abend' : 'nacht'; }
  var GRUSS = { morgen: 'Guten Morgen', mittag: 'Hoi', nachmittag: 'Grüezi', abend: 'Guten Abend', nacht: 'Gute Nacht' };
  var TZ_EMO = { morgen: '🌅', mittag: '☀️', nachmittag: '🌤️', abend: '🌙', nacht: '✨' };
  function saison() {
    if (M === 10 && D === 31) return { k: 'halloweenTag', e: '🎃' };
    if (M === 10 && D >= 17) return { k: 'halloween', e: '🎃', n: 31 - D };
    if (M === 12 && D <= 24) return { k: 'advent', e: '🕯️', n: D };
    if (M === 12 && D <= 26) return { k: 'weihnacht', e: '🎄' };
    if (M === 12 || (M === 1 && D <= 6)) return { k: 'neujahr', e: '🎆' };
    if (M <= 2) return { k: 'winter', e: '❄️' };
    if (M <= 5) return { k: 'fruehling', e: '🌷' };
    if (M <= 8) return { k: 'sommer', e: '🌻' };
    if (M === 11) return { k: 'november', e: '🍂' };
    return { k: 'herbst', e: '🍁' };
  }
  var S = saison();
  /* Saison-Bild (Tinko): an Halloween (31.10.) und im Advent zeigt die Figur das passende Bild */
  var SB = C.saisonBild && (C.saisonBild[S.k] || (S.k === 'weihnacht' && C.saisonBild.advent)) || '';
  if (SB) C.bild = SB;
  function meinName() { var n = hol('name', ''); if (!n && C.nameHol) try { n = C.nameHol() || ''; } catch (e) {} return n; }
  function fuell(t) { return String(t || '').replace(/\{n\}/g, S.n).replace(/\{name\}/g, meinName() || C.du || 'du').replace(/\{figur\}/g, F); }
  function saisonSatz() { return fuell(C.saison[S.k] || C.saison[S.k === 'neujahr' ? 'winter' : 'herbst']); }

  /* ---------- Stil ---------- */
  var css = [
    '.r6{--r6g:#f2c14e;--r6g2:#ffe08a;--r6t:#fffaf0;--r6m:#c9d2ee;color:var(--r6t);font-size:16px;line-height:1.45}',
    '.r6-karte{margin:16px 0;padding:16px;border-radius:18px;background:linear-gradient(160deg,rgba(38,58,130,.62),rgba(16,26,62,.9));border:1px solid rgba(242,193,78,.32);box-shadow:0 10px 26px rgba(0,0,0,.22);position:relative;overflow:hidden;text-align:left}',
    '.r6-karte h2{margin:0 0 10px;font-size:19px;line-height:1.25;color:var(--r6g2);font-weight:800}',
    '.r6-gruss{margin:12px 0 16px;padding:14px 16px;border-radius:18px;background:linear-gradient(120deg,rgba(242,193,78,.2),rgba(111,140,255,.12));border:1px solid rgba(242,193,78,.4);text-align:left}',
    '.r6-gz{display:flex;gap:12px;align-items:flex-start}',
    '.r6-emo{font-size:30px;line-height:1;flex:none;width:44px;height:44px;display:grid;place-items:center;border-radius:14px;background:rgba(14,24,56,.55)}',
    '.r6-hallo{display:block;font-size:19px;color:var(--r6g2);font-weight:800}',
    '.r6-saison{display:block;margin-top:2px;color:var(--r6t);opacity:.92}',
    '.r6-leiste,.r6-reihe{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
    '.r6-k,.r6-btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:999px;border:1px solid rgba(242,193,78,.55);background:rgba(14,24,56,.55);color:var(--r6t);font-weight:700;font-size:15px;line-height:1.25;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;transition:transform .15s,background .2s}',
    '.r6-btn.voll{background:var(--r6g);color:#14204a;border-color:var(--r6g)}',
    '.r6-k:active,.r6-btn:active{transform:scale(.97)}',
    '.r6-k[aria-pressed=true]{background:var(--r6g);color:#14204a}',
    '.r6 :focus-visible{outline:3px solid var(--r6g2);outline-offset:2px}',
    '.r6 [hidden]{display:none!important}',
    '.r6-nameform{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:flex-end}',
    '.r6-nameform label{flex:1 1 180px;display:flex;flex-direction:column;gap:4px;font-weight:700;color:var(--r6m);font-size:14px}',
    '.r6-nameform input{min-height:44px;padding:8px 12px;border-radius:12px;border:1px solid rgba(242,193,78,.5);background:rgba(8,14,36,.7);color:var(--r6t);font-size:16px;font-family:inherit}',
    '.r6-char-in{display:flex;gap:14px;align-items:center}',
    '.r6-bild{flex:none;width:96px;height:96px;padding:0;border-radius:50%;overflow:hidden;border:3px solid var(--r6g);background:#0e1838;cursor:pointer}',
    '.r6-bild img{width:100%;height:100%;object-fit:cover;display:block}',
    '.r6-bild.hops{animation:r6Hops .7s cubic-bezier(.3,.7,.3,1)}',
    '@keyframes r6Hops{30%{transform:translateY(-6px) rotate(-3deg)}60%{transform:translateY(-2px) rotate(2deg)}}',
    '.r6-blase{flex:1;margin:0;padding:12px 14px;border-radius:16px 16px 16px 4px;background:rgba(255,250,240,.96);color:#1d2550;font-size:16px;line-height:1.45;min-height:64px;transition:opacity .25s}',
    '.r6-blase small{display:block;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#a1781b;margin-bottom:2px}',
    '.r6-blase.weg{opacity:0}',
    '.r6-klein{margin:10px 0 0;font-size:14px;color:var(--r6m)}',
    '.r6-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}',
    '.r6-chips button{min-height:44px;padding:8px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:var(--r6t);font-weight:600;font-size:15px;line-height:1.25;font-family:inherit;cursor:pointer}',
    '.r6-chips button[aria-pressed=true]{border-color:var(--r6g);background:rgba(242,193,78,.22)}',
    '.r6-vorliebe{margin-top:14px;padding-top:12px;border-top:1px dashed rgba(242,193,78,.3)}',
    '.r6-vorliebe p{margin:0}',
    '.r6-b-in{display:flex;gap:14px;align-items:center}',
    '.r6-b-in img{flex:none;width:96px;height:96px;border-radius:18px;object-fit:cover;border:2px solid rgba(242,193,78,.6);background:#0e1838}',
    '.r6-b-in b{display:block;font-size:17px;color:var(--r6g2)}',
    '.r6-b-in p{margin:4px 0 0}',
    '.r6-geschenk{width:100%;min-height:96px;border-radius:16px;border:2px dashed rgba(242,193,78,.65);background:rgba(242,193,78,.1);color:var(--r6t);font-weight:800;font-size:17px;line-height:1.25;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px}',
    '.r6-geschenk span{font-size:40px}',
    '.r6-fund{display:flex;gap:14px;align-items:center;padding:12px;border-radius:16px;background:rgba(255,250,240,.08);border:1px solid rgba(242,193,78,.45)}',
    '.r6-fund.neu{animation:r6Auf .5s ease-out}',
    '@keyframes r6Auf{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}',
    '.r6-fe{flex:none;font-size:40px;width:64px;height:64px;display:grid;place-items:center;border-radius:16px;background:rgba(14,24,56,.6)}',
    '.r6-fund p{margin:0}',
    '.r6-sammel{display:grid;grid-template-columns:repeat(6,44px);gap:6px;justify-content:start;margin-top:12px}',
    '.r6-sammel button,.r6-sammel i{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-size:20px;font-style:normal}',
    '.r6-sammel i{border:1px dashed rgba(255,255,255,.18);color:rgba(255,255,255,.3);font-size:12px}',
    '.r6-sammel button{border:1px solid rgba(242,193,78,.5);background:rgba(242,193,78,.14);cursor:pointer;padding:0}',
    '.r6-sammel .heute{box-shadow:0 0 0 2px var(--r6g2)}',
    '.r6-funke{position:absolute;pointer-events:none;color:var(--r6g2);font-size:18px;animation:r6Funke 1.3s ease-out forwards}',
    '@keyframes r6Funke{from{opacity:1;transform:translate(0,0) scale(.6)}to{opacity:0;transform:translate(var(--dx),-70px) scale(1.1)}}',
    '.r6-hoer{position:fixed;inset:0;z-index:100001;background:rgba(5,9,24,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px;text-align:center;color:#fffaf0}',
    '.r6-hoer img{width:160px;height:160px;border-radius:50%;object-fit:cover;border:3px solid #f2c14e;opacity:.85}',
    '.r6-hoer p{margin:0;font-size:20px;max-width:340px;line-height:1.45}',
    '.r6-hoer small{color:#c9d2ee;font-size:15px}',
    '.r6-kinder .r6-frage{font-size:20px;line-height:1.45;margin:6px 0 0;color:var(--r6t)}',
    'html.r6-gross ' + (C.zoom || 'main') + '{zoom:1.15}',
    '@media (prefers-reduced-motion:reduce){.r6-bild.hops,.r6-fund.neu,.r6-funke{animation:none}.r6-funke{display:none}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- Feier (sanft) ---------- */
  function feier(karte) {
    summ([10, 40, 10]);
    if (ruhig || !karte) return;
    for (var i = 0; i < 9; i++) {
      var f = document.createElement('span'); f.className = 'r6-funke'; f.textContent = i % 3 ? '✦' : '★';
      f.style.left = (20 + Math.random() * 60) + '%'; f.style.top = (45 + Math.random() * 30) + '%';
      f.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px'); f.style.animationDelay = (i * 60) + 'ms';
      karte.appendChild(f); setTimeout(function (x) { return function () { x.remove(); }; }(f), 1600 + i * 60);
    }
  }

  /* ---------- Nur hören ---------- */
  function nurHoeren(text) {
    var o = el('<div class="r6-hoer" role="dialog" aria-modal="true" aria-label="Nur hören"><img alt="" src="' + esc(C.bild) + '"><p>🎧 Augen zu, Ohren auf.</p><small>' + esc(F) + ' liest dir vor. Tipp irgendwo, dann hört es auf.</small><button type="button" class="r6-btn voll">Fertig</button></div>');
    function zu() { still(); o.remove(); }
    o.onclick = zu; document.body.appendChild(o);
    o.querySelector('button').focus();
    sag(text, function () { setTimeout(zu, 900); });
  }

  /* ---------- 1) Gruss ---------- */
  var tz = tageszeit();
  var g = el('<section class="r6 r6-gruss" aria-label="Begrüssung von ' + esc(F) + '">' +
    '<div class="r6-gz"><span class="r6-emo" aria-hidden="true"></span><div><b class="r6-hallo"></b><span class="r6-saison"></span><span class="r6-saison r6-tz"></span></div></div>' +
    '<div class="r6-leiste"><button type="button" class="r6-k" data-r6="name">✎ Mein Name</button>' +
    '<button type="button" class="r6-k" data-r6="gross" aria-pressed="false" aria-label="Grosse Schrift ein oder aus">A+ Grosse Schrift</button>' +
    (kannReden && C.vorlesen !== false ? '<button type="button" class="r6-k" data-r6="hoeren">🎧 Vorlesen</button>' : '') + '</div>' +
    '<form class="r6-nameform" hidden><label>' + esc(C.nameFrage || 'Wie heisst du?') + '<input name="n" maxlength="24" autocomplete="given-name" enterkeyhint="done"></label><button class="r6-btn voll" type="submit">Merken</button></form></section>');
  function grussZeigen() {
    var n = meinName();
    g.querySelector('.r6-emo').textContent = S.k === 'halloween' || S.k === 'halloweenTag' || S.k === 'advent' || S.k === 'weihnacht' ? S.e : TZ_EMO[tz];
    g.querySelector('.r6-hallo').textContent = fuell(C.hallo ? C.hallo[n ? 1 : 0] : '') || (GRUSS[tz] + (n ? ', ' + n : '') + '!');
    g.querySelector('.r6-hallo').textContent = g.querySelector('.r6-hallo').textContent.replace('{gruss}', GRUSS[tz]);
    g.querySelector('.r6-saison').textContent = saisonSatz();
    g.querySelector('.r6-tz').textContent = fuell(C.tageszeit[tz]);
    g.querySelector('[data-r6=name]').textContent = n ? '✎ ' + n : '✎ Mein Name';
  }
  var gross = hol('gross', false);
  function grossSetzen() { document.documentElement.classList.toggle('r6-gross', !!gross); g.querySelector('[data-r6=gross]').setAttribute('aria-pressed', String(!!gross)); }
  g.addEventListener('click', function (e) {
    var b = e.target.closest('[data-r6]'); if (!b) return;
    var a = b.getAttribute('data-r6');
    if (a === 'name') { var f = g.querySelector('form'); f.hidden = !f.hidden; if (!f.hidden) { f.n.value = meinName(); f.n.focus(); } }
    if (a === 'gross') { gross = !gross; leg('gross', gross); grossSetzen(); summ(8); }
    if (a === 'hoeren') { if (redet) { still(); return; } sag(g.querySelector('.r6-hallo').textContent + ' ' + g.querySelector('.r6-saison').textContent + ' ' + g.querySelector('.r6-tz').textContent); }
  });
  g.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault(); var v = this.n.value.trim().slice(0, 24); leg('name', v); this.hidden = true; grussZeigen(); naechsterSatz(true);
    if (v) { g.querySelector('.r6-tz').textContent = fuell(C.nameDank); summ([10, 30, 10]); }
  });

  /* ---------- 2) Charakter ---------- */
  var gesehen = hol('saetze', []), letzter = -1, aktSatz = '';
  var c = el('<section class="r6 r6-karte r6-char" aria-labelledby="r6ct-' + C.k + '"><h2 id="r6ct-' + C.k + '">💛 ' + esc(C.charTitel || ('So ist ' + F)) + '</h2>' +
    '<div class="r6-char-in"><button type="button" class="r6-bild" aria-label="' + esc(F) + ' antippen: noch etwas über ' + esc(F) + '"><img alt="" loading="lazy" src="' + esc(C.bild) + '"></button>' +
    '<p class="r6-blase" aria-live="polite"></p></div>' +
    '<div class="r6-reihe"><button type="button" class="r6-btn voll" data-r6="satz">' + esc(C.satzKnopf || 'Noch etwas über ' + F) + '</button>' +
    (kannReden && C.vorlesen !== false ? '<button type="button" class="r6-btn" data-r6="lies" aria-label="Satz vorlesen">🎧</button>' : '') + '</div>' +
    '<p class="r6-klein r6-entdeckt"></p>' +
    (C.vorliebe ? '<div class="r6-vorliebe"></div>' : '') + '</section>');
  function naechsterSatz(still) {
    var L = C.saetze, i;
    var neu = L.map(function (_, j) { return j; }).filter(function (j) { return gesehen.indexOf(j) < 0 && j !== letzter; });
    var pool = neu.length ? neu : L.map(function (_, j) { return j; }).filter(function (j) { return j !== letzter; });
    i = pool[Math.floor(Math.random() * pool.length)]; letzter = i;
    if (gesehen.indexOf(i) < 0) { gesehen.push(i); leg('saetze', gesehen); }
    var b = c.querySelector('.r6-blase'), s = L[i];
    aktSatz = fuell(s[1]);
    var zeig = function () { b.innerHTML = '<small>' + esc(s[0]) + '</small>' + esc(fuell(s[1])); b.classList.remove('weg'); };
    if (still || ruhig) zeig(); else { b.classList.add('weg'); setTimeout(zeig, 180); }
    var n = gesehen.length;
    c.querySelector('.r6-entdeckt').textContent = n >= L.length ? '🌟 Du kennst jetzt alle ' + L.length + ' Seiten von ' + F + '. Wer weiss, was noch dazukommt …' : n + ' von ' + L.length + ' Seiten von ' + F + ' entdeckt';
    if (!still && n === L.length && hol('alleFeier', '') !== 'ja') { leg('alleFeier', 'ja'); feier(c); }
  }
  c.addEventListener('click', function (e) {
    var b = e.target.closest('.r6-bild,[data-r6]'); if (!b) return;
    var a = b.getAttribute('data-r6');
    if (a === 'lies') { if (redet) { still(); return; } sag(aktSatz); return; }
    if (a === 'vorliebe') { leg('vorliebe', b.getAttribute('data-v')); vorliebeZeigen(); summ([10, 30, 10]); return; }
    if (a === 'vorliebeNeu') { leg('vorliebe', ''); vorliebeZeigen(); return; }
    if (b.classList.contains('r6-bild') && !ruhig) { b.classList.remove('hops'); void b.offsetWidth; b.classList.add('hops'); }
    naechsterSatz(false); summ(8);
  });
  function vorliebeZeigen() {
    var v = C.vorliebe; if (!v) return; var box = c.querySelector('.r6-vorliebe'), m = hol('vorliebe', '');
    var o = v.optionen.filter(function (x) { return x[0] === m; })[0];
    if (o) box.innerHTML = '<p>' + esc(fuell(v.merk).replace('{x}', o[1])) + '</p><div class="r6-reihe"><button type="button" class="r6-btn" data-r6="vorliebeNeu">Ändern</button></div>';
    else box.innerHTML = '<p><b>' + esc(fuell(v.frage)) + '</b></p><div class="r6-chips" role="group" aria-label="' + esc(v.frage) + '">' +
      v.optionen.map(function (x) { return '<button type="button" data-r6="vorliebe" data-v="' + esc(x[0]) + '" aria-pressed="false">' + esc(x[1]) + '</button>'; }).join('') + '</div>';
  }

  /* ---------- 3) Besuch ---------- */
  var B = C.besuch || [], bi = tagNr % (B.length || 1), bes = B[bi];
  var bk = bes ? el('<section class="r6 r6-karte r6-besuch" aria-labelledby="r6bt-' + C.k + '"><h2 id="r6bt-' + C.k + '">🚪 ' + esc(C.besuchTitel || 'Besuch bei ' + F) + '</h2>' +
    '<div class="r6-b-in"><img alt="' + esc(bes.name) + ' schaut vorbei" loading="lazy" width="96" height="96" src="' + esc(bes.bild) + '"><div><b>Heute schaut ' + esc(bes.name) + ' vorbei</b><p>' + esc(bes.satz) + '</p></div></div>' +
    '<p class="r6-klein">🧭 Nova hat ' + esc(bes.name) + ' den Weg gezeigt. Nova kennt alle Figuren und verbindet sie.</p>' +
    '<div class="r6-reihe">' + (bes.link || '') + '<button type="button" class="r6-btn" data-r6="morgen">Wer kommt morgen?</button></div></section>') : null;
  if (bk) bk.addEventListener('click', function (e) {
    var b = e.target.closest('[data-r6=morgen]'); if (!b) return;
    var m = B[(bi + 1) % B.length]; b.outerHTML = '<p class="r6-klein" style="margin:0;align-self:center">Morgen klopft vielleicht ' + esc(m.name) + ' an. ' + esc(m.morgen || '') + '</p>';
  });

  /* ---------- 4) Überraschung / Adventskalender ---------- */
  var advent = S.k === 'advent', U = advent && C.advent ? C.advent : C.ueberraschung, SK = advent && C.advent ? 'advent' + jetzt.getFullYear() : 'sammel';
  var ui = advent ? D - 1 : tagNr % U.length;
  var u = el('<section class="r6 r6-karte r6-ueb" aria-labelledby="r6ut-' + C.k + '"><h2 id="r6ut-' + C.k + '"></h2><div class="r6-paket"></div>' +
    '<div class="r6-sammel" role="group" aria-label="Sammelleiste"></div><p class="r6-klein r6-zahl" aria-live="polite"></p></section>');
  u.querySelector('h2').textContent = advent ? '🕯️ ' + F + 's Adventskalender · Türchen ' + D : '🎁 ' + (C.uebTitel || F + 's Überraschung des Tages');
  function gesammelt() { return hol(SK, []); }
  function uebZeigen(neu) {
    var p = u.querySelector('.r6-paket'), s = gesammelt(), offen = hol('offen', '') === heute;
    if (!offen) p.innerHTML = '<button type="button" class="r6-geschenk" data-r6="oeffnen" aria-label="' + (advent ? 'Türchen ' + D + ' öffnen' : 'Überraschung öffnen') + '"><span aria-hidden="true">' + (advent ? '🚪' : '🎁') + '</span>' + (advent ? 'Türchen ' + D + ' öffnen' : 'Tipp zum Öffnen') + '</button>';
    else { var x = U[ui]; p.innerHTML = '<div class="r6-fund' + (neu ? ' neu' : '') + '"><span class="r6-fe" aria-hidden="true">' + x[0] + '</span><p>' + esc(fuell(x[1])) + '</p></div>' + (kannReden && C.vorlesen !== false ? '<div class="r6-reihe"><button type="button" class="r6-btn" data-r6="uebHoeren">🎧 Nur hören</button></div>' : ''); }
    var r = u.querySelector('.r6-sammel'); r.innerHTML = '';
    for (var i = 0; i < U.length; i++) {
      if (s.indexOf(i) >= 0) { var b = el('<button type="button" data-r6="fach" data-i="' + i + '" aria-label="Fundstück ' + (i + 1) + ' ansehen">' + U[i][0] + '</button>'); if (i === ui && offen) b.classList.add('heute'); r.appendChild(b); }
      else r.appendChild(el('<i aria-hidden="true">' + (i + 1) + '</i>'));
    }
    r.setAttribute('aria-label', 'Sammelleiste: ' + s.length + ' von ' + U.length + ' gesammelt');
    u.querySelector('.r6-zahl').textContent = s.length >= U.length ? '🌟 Alle ' + U.length + ' gesammelt! ' + fuell(C.alleGesammelt || '') :
      s.length + ' von ' + U.length + ' gesammelt. ' + (advent ? 'Jeden Tag bis Weihnachten ein Türchen.' : (M === 11 || (M === 10 && D > 15) ? 'Ab 1. Dezember wird daraus ' + F + 's Adventskalender: 24 Türchen.' : 'Morgen wartet etwas Neues.'));
  }
  u.addEventListener('click', function (e) {
    var b = e.target.closest('[data-r6]'); if (!b) return; var a = b.getAttribute('data-r6');
    if (a === 'oeffnen') {
      leg('offen', heute); var s = gesammelt(); var neuStueck = s.indexOf(ui) < 0; if (neuStueck) { s.push(ui); leg(SK, s); }
      uebZeigen(true); feier(u); if (C.beimOeffnen) try { C.beimOeffnen(U[ui]); } catch (x) {}
    }
    if (a === 'fach') {
      var x = U[+b.getAttribute('data-i')], f = u.querySelector('.r6-fund');
      if (!f) { u.querySelector('.r6-paket').innerHTML = '<div class="r6-fund"><span class="r6-fe" aria-hidden="true"></span><p></p></div><div class="r6-reihe"><button type="button" class="r6-btn voll" data-r6="zurueck">' + (advent ? 'Zum heutigen Türchen' : 'Zur heutigen Überraschung') + '</button></div>'; f = u.querySelector('.r6-fund'); }
      f.querySelector('.r6-fe').textContent = x[0]; f.querySelector('p').textContent = fuell(x[1]);
    }
    if (a === 'zurueck') uebZeigen(false);
    if (a === 'uebHoeren') { var t = u.querySelector('.r6-fund p'); if (t) nurHoeren(t.textContent); }
  });

  /* ---------- 5) Kinder-Karte (ruhig: Standbild, Fantasie-Frage, Nur hören) ---------- */
  var kk = null;
  if (C.fantasie) {
    var fq = C.fantasie[tagNr % C.fantasie.length];
    kk = el('<section class="r6 r6-karte r6-kinder" aria-labelledby="r6kt-' + C.k + '"><h2 id="r6kt-' + C.k + '">🌙 ' + esc(C.kinderTitel || F + 's Fantasie-Frage') + '</h2>' +
      '<div class="r6-char-in"><img alt="" loading="lazy" src="' + esc(C.kinderBild || C.bild) + '" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid #f2c14e;flex:none">' +
      '<p class="r6-frage">' + esc(fq) + '</p></div>' +
      '<p class="r6-klein">Augen zu und ausdenken. Es gibt keine falsche Antwort.</p>' +
      (kannReden ? '<div class="r6-reihe"><button type="button" class="r6-btn voll" data-r6="kHoeren">🎧 Nur hören</button></div>' : '') + '</section>');
    kk.addEventListener('click', function (e) { if (e.target.closest('[data-r6=kHoeren]')) nurHoeren(fq + ' ' + (C.kinderSchluss || 'Denk dir etwas aus. Es gibt keine falsche Antwort.')); });
  }

  grussZeigen(); grossSetzen(); naechsterSatz(true); vorliebeZeigen(); uebZeigen(false);
  var N = { gruss: g, charakter: c, besuch: bk, ueberraschung: u, kinder: kk };
  window['R6_' + C.k] = { karten: N, sag: sag, still: still };
  var H = { sag: sag, still: still, nurHoeren: nurHoeren, feier: feier, saison: S, el: el, esc: esc, hol: hol, leg: leg, ruhig: ruhig, kannReden: kannReden, fuell: fuell, M: M, D: D, tz: tz, heute: heute, jetzt: jetzt };
  function saisonBildZeigen() {
    if (!SB) return;
    var alt = F + (S.k === 'halloweenTag' ? ' mit einer lachenden Kürbislaterne' : ' bei Kerzenlicht im Advent');
    if (C.saisonImg) { var im = document.querySelector(C.saisonImg); if (im) { im.src = SB; im.alt = alt; } return; }
    var z = C.saisonZiel && document.querySelector(C.saisonZiel); if (!z) return;
    if (getComputedStyle(z).position === 'static') z.style.position = 'relative';
    var o = document.createElement('img'); o.className = 'r6-saisonbild'; o.src = SB; o.alt = alt; o.decoding = 'async';
    o.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:3;pointer-events:none;border-radius:inherit;transition:opacity .5s';
    z.appendChild(o);
    var t = 0;
    // Antippen: die lebendige Figur ist wieder da; nach einer ruhigen Weile kommt das Saison-Bild zurück
    z.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.r6-laterne')) return; o.style.opacity = '0'; clearTimeout(t); t = setTimeout(function () { o.style.opacity = '1'; }, 20000); }, true);
  }
  function los() { try { C.einsetzen(N, H); } catch (e) { if (window.console) console.warn('Runde 6:', e); } try { saisonBildZeigen(); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else setTimeout(los, 0);
  if (kannReden) try { speechSynthesis.getVoices(); } catch (e) {}
})();
