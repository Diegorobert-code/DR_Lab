/* daten.js – Kikis Regal «Musik-Kiste» (inhalt/inhalt.js): Sing-Spiele für Kind und Eltern, Musik-Rätsel, Instrumente-Album.
   Für Kinder von 3 bis 8 mit Mama oder Papa. Keine Kinderstimmen, keine Aufnahmen, alles lokal. */
(function () {
  'use strict';
  /* Instrumente sammeln: jedes zu Ende gesungene Lied (Kikis Gedächtnis) und jede Rätselrunde bringt ein Instrument */
  function gesammelt() {
    var n = 0;
    try { var m = JSON.parse(localStorage.getItem('kiki_mem') || '{}'); var s = m.songs || {}; for (var k in s) n += (s[k] && s[k].d) || 0; } catch (e) {}
    try { var v = JSON.parse(localStorage.getItem('inhalt_kiki') || '{}'); n += v.runden || 0; } catch (e) {}
    return n;
  }

  var SPIELE = [
    { id: 's1', tag: 'stimme', e: '🦁', t: 'Tierstimmen-Konzert', kurz: 'Brüllen, piepsen, muhen', x: 'Einer nennt ein Tier, alle singen «Alle meine Entchen» mit dieser Stimme: als Löwe tief, als Maus ganz hoch, als Kuh lang gezogen.', tipp: 'Wer lacht, darf das nächste Tier wählen.' },
    { id: 's2', tag: 'stimme', e: '🎈', t: 'Ballon-Atmen', kurz: 'Langsam ein, langsam aus', x: 'Stellt euch vor, im Bauch ist ein Ballon. Einatmen: Der Ballon wird gross. Ausatmen auf «sss»: Er wird ganz langsam klein. Wer schafft es am längsten?', tipp: 'Hände auf den Bauch legen, dann spürt man den Ballon.' },
    { id: 's3', tag: 'stimme', e: '🚒', t: 'Sirene', kurz: 'Von tief nach hoch', x: 'Macht zusammen eine Sirene: auf «uuu» von ganz tief nach ganz hoch und wieder hinunter. Das weckt die Stimme sanft auf.' },
    { id: 's4', tag: 'stimme', e: '🐝', t: 'Bienen-Summen', kurz: 'Mit geschlossenem Mund', x: 'Mund zu und summen wie eine Biene. Wo kitzelt es? An den Lippen, in der Nase? Dann sitzt der Ton genau richtig.' },
    { id: 's5', tag: 'stimme', e: '🤫', t: 'Flüster-Lied', kurz: 'Ganz leise singen', x: 'Singt ein bekanntes Lied nur geflüstert. Dann normal. Dann wieder geflüstert. Leise singen ist schwerer als laut!' },
    { id: 's6', tag: 'stimme', e: '🦒', t: 'Gross und klein', kurz: 'Hoch und tief mit dem Körper', x: 'Bei hohen Tönen strecken sich alle ganz gross wie eine Giraffe. Bei tiefen Tönen gehen alle in die Hocke wie eine Schildkröte.' },
    { id: 's7', tag: 'rhythmus', e: '👏', t: 'Klatsch-Echo', kurz: 'Nachklatschen', x: 'Mama oder Papa klatscht einen kurzen Rhythmus, das Kind klatscht ihn nach. Dann wird getauscht. Fangt mit drei Klatschern an.' },
    { id: 's8', tag: 'rhythmus', e: '🥄', t: 'Küchen-Trommel', kurz: 'Musik mit Topf und Löffel', x: 'Ein Topf, ein Holzlöffel, eine Dose mit Reis: Fertig ist das Orchester. Spielt zu Kikis Liedern mit.', tipp: 'Nach dem Spiel räumen alle Musiker zusammen auf.' },
    { id: 's9', tag: 'rhythmus', e: '🦶', t: 'Stampf-Takt', kurz: 'Füsse sind Trommeln', x: 'Stampft im Takt: links, rechts, links, rechts. Dann doppelt so schnell. Dann ganz langsam wie ein Elefant.' },
    { id: 's10', tag: 'rhythmus', e: '🍎', t: 'Wörter-Rhythmus', kurz: 'Ap-fel, Ba-na-ne', x: 'Klatscht Wörter in Silben: Ap-fel (2), Ba-na-ne (3), Scho-ko-la-de (4). Wer findet ein Wort mit fünf Klatschern?' },
    { id: 's11', tag: 'rhythmus', e: '🛑', t: 'Stopp-Tanz', kurz: 'Musik aus, alle erstarren', x: 'Kiki singt, alle tanzen. Sobald es still ist, erstarren alle wie Statuen. Wer wackelt, macht eine lustige Grimasse.' },
    { id: 's12', tag: 'rhythmus', e: '🐎', t: 'Pferde-Galopp', kurz: 'Schnell und langsam', x: 'Klopft auf die Knie wie ein Pferd: im Schritt, im Trab, im Galopp. Dann bleibt das Pferd stehen und schnaubt.' },
    { id: 's13', tag: 'zuhoeren', e: '👂', t: 'Geräusche-Detektiv', kurz: 'Augen zu, Ohren auf', x: 'Augen zu. Was hört ihr? Ein Auto, ein Vogel, der Kühlschrank? Jeder zählt drei Geräusche.' },
    { id: 's14', tag: 'zuhoeren', e: '🔔', t: 'Wo klingt es?', kurz: 'Richtung hören', x: 'Einer schliesst die Augen. Der andere klingelt leise irgendwo im Zimmer. Wo ist der Ton? Mit dem Finger zeigen!' },
    { id: 's15', tag: 'zuhoeren', e: '🎧', t: 'Lied erraten', kurz: 'Nur summen', x: 'Mama oder Papa summt ein Lied ohne Worte. Erkennt das Kind, welches es ist? Dann wird getauscht.' },
    { id: 's16', tag: 'zuhoeren', e: '🐢', t: 'Schnell oder langsam?', kurz: 'Tempo hören', x: 'Singt «Bruder Jakob» einmal langsam wie eine Schildkröte und einmal schnell wie ein Hase. Wie war es lustiger?' },
    { id: 's17', tag: 'zuhoeren', e: '🌊', t: 'Laut und leise', kurz: 'Wie die Wellen', x: 'Singt einen Ton, der wie eine Welle lauter und wieder leiser wird. Die Hände zeigen dazu die Welle.' },
    { id: 's18', tag: 'erfinden', e: '✏️', t: 'Neue Strophe', kurz: 'Eigene Worte, alte Melodie', x: 'Nehmt «Alle meine Entchen» und tauscht das Tier: «Alle meine Kätzchen schlafen auf dem Sofa.» Was passt noch?' },
    { id: 's19', tag: 'erfinden', e: '🍝', t: 'Lied fürs Essen', kurz: 'Ein Lied über das Abendessen', x: 'Erfindet ein kurzes Lied über das, was heute auf dem Teller liegt. Es darf ganz schön verrückt sein.' },
    { id: 's20', tag: 'erfinden', e: '🧸', t: 'Name-Lied', kurz: 'Jeder hat ein Lied', x: 'Singt die Namen aller in der Familie auf eine Melodie, zum Beispiel: «Ma-ma, Pa-pa, Mi-la, Oma». Und das Kuscheltier!' },
    { id: 's21', tag: 'erfinden', e: '🌦️', t: 'Wetter-Lied', kurz: 'Wie ist das Wetter?', x: 'Schaut aus dem Fenster und singt, was ihr seht: «Draussen regnet es, plitsch platsch.»' },
    { id: 's22', tag: 'erfinden', e: '🎭', t: 'Gefühls-Singen', kurz: 'Fröhlich, müde, mutig', x: 'Singt das gleiche Lied fröhlich, dann müde, dann ganz mutig. Wie verändert sich die Stimme?' },
    { id: 's23', tag: 'zusammen', e: '🔁', t: 'Abwechseln', kurz: 'Eine Zeile du, eine ich', x: 'Kind und Erwachsener singen ein Lied abwechselnd: eine Zeile das Kind, eine Zeile Mama oder Papa.' },
    { id: 's24', tag: 'zusammen', e: '🪞', t: 'Spiegel-Singen', kurz: 'Gesichter nachmachen', x: 'Einer singt mit grossen Grimassen, der andere macht Mund und Gesicht genau nach, wie ein Spiegel.' },
    { id: 's25', tag: 'zusammen', e: '🛁', t: 'Badewannen-Konzert', kurz: 'Im Bad klingt es schön', x: 'Im Badezimmer klingt jede Stimme voller. Singt beim Händewaschen oder in der Badewanne ein Lied.' },
    { id: 's26', tag: 'zusammen', e: '🚗', t: 'Auto-Lied', kurz: 'Singen unterwegs', x: 'Unterwegs: Jeder darf ein Lied wünschen. Kiki-Lieder kennt ihr schon auswendig?' },
    { id: 's27', tag: 'zusammen', e: '🌙', t: 'Leise zum Schluss', kurz: 'Abend-Ritual', x: 'Am Abend wird jedes Lied ein bisschen leiser gesungen, bis zum Schluss nur noch gesummt wird. Dann ist Schlafenszeit.' },
    { id: 's28', tag: 'zusammen', e: '📣', t: 'Ruf-Antwort', kurz: 'Einer ruft, alle antworten', x: 'Einer singt «Wer hat Lust?», alle antworten «Wir, wir, wir!». Erfindet neue Rufe.' },
    { id: 's29', tag: 'stimme', e: '😮', t: 'Vokal-Zauber', kurz: 'A, E, I, O, U', x: 'Singt einen Ton und wechselt die Vokale: aaa, eee, iii, ooo, uuu. Der Mund macht dabei lustige Formen.' },
    { id: 's30', tag: 'rhythmus', e: '🌧️', t: 'Regen machen', kurz: 'Mit den Händen', x: 'Erst reiben die Hände, dann schnippen die Finger, dann klatschen alle, dann stampfen sie: ein Gewitter! Und wieder zurück bis zur Stille.' }
  ];

  var RAETSEL = [
    { id: 'q1', e: '🥁', f: 'Auf welchem Instrument trommelt man?', a: ['Trommel', 'Flöte', 'Geige'], r: 0 },
    { id: 'q2', e: '🎻', f: 'Welches Instrument spielt man mit einem Bogen?', a: ['Geige', 'Trompete', 'Rassel'], r: 0 },
    { id: 'q3', e: '🎺', f: 'In welches Instrument bläst man?', a: ['Trompete', 'Klavier', 'Trommel'], r: 0 },
    { id: 'q4', e: '🎹', f: 'Wie viele Tasten hat ein grosses Klavier ungefähr?', a: ['88', '8', '800'], r: 0 },
    { id: 'q5', e: '🎵', f: 'Was ist ein Rhythmus?', a: ['Der Takt, zu dem man klatscht', 'Eine Farbe', 'Ein Tier'], r: 0 },
    { id: 'q6', e: '🐘', f: 'Welcher Ton passt zu einem Elefanten?', a: ['Ein tiefer Ton', 'Ein hoher Ton', 'Gar kein Ton'], r: 0 },
    { id: 'q7', e: '🐭', f: 'Welcher Ton passt zu einer Maus?', a: ['Ein hoher Ton', 'Ein tiefer Ton', 'Ein Donner'], r: 0 },
    { id: 'q8', e: '🎼', f: 'Wie heissen die sieben Töne der Tonleiter?', a: ['Do, Re, Mi, Fa, Sol, La, Ti', 'A, B, C, D, E, F, G, H', 'Eins bis sieben'], r: 0 },
    { id: 'q9', e: '🎸', f: 'Wie viele Saiten hat eine Gitarre meistens?', a: ['6', '2', '20'], r: 0 },
    { id: 'q10', e: '🤫', f: 'Was bedeutet «piano» in der Musik?', a: ['Leise', 'Laut', 'Schnell'], r: 0, info: 'Das Klavier heisst so, weil es leise und laut kann.' },
    { id: 'q11', e: '📣', f: 'Was bedeutet «forte»?', a: ['Laut', 'Leise', 'Langsam'], r: 0 },
    { id: 'q12', e: '🐢', f: 'Wie heisst langsam in der Musik?', a: ['Adagio', 'Presto', 'Forte'], r: 0 },
    { id: 'q13', e: '🐇', f: 'Und schnell?', a: ['Presto', 'Adagio', 'Piano'], r: 0 },
    { id: 'q14', e: '👥', f: 'Wie heisst es, wenn viele zusammen singen?', a: ['Chor', 'Solo', 'Pause'], r: 0 },
    { id: 'q15', e: '🧍', f: 'Wie heisst es, wenn einer allein singt?', a: ['Solo', 'Chor', 'Orchester'], r: 0 },
    { id: 'q16', e: '🎶', f: 'Wo entsteht deine Stimme?', a: ['Im Hals, bei den Stimmbändern', 'In den Füssen', 'In den Haaren'], r: 0 },
    { id: 'q17', e: '🌬️', f: 'Was braucht man zum Singen?', a: ['Luft zum Atmen', 'Einen Hut', 'Schuhe'], r: 0 },
    { id: 'q18', e: '🦆', f: 'Wo schwimmen «Alle meine Entchen»?', a: ['Auf dem See', 'Im Wald', 'Auf dem Dach'], r: 0 },
    { id: 'q19', e: '🔔', f: 'Was hört Bruder Jakob nicht?', a: ['Die Glocken', 'Den Hund', 'Den Regen'], r: 0 },
    { id: 'q20', e: '🎤', f: 'Was hält Kiki beim Singen?', a: ['Ein goldenes Mikrofon', 'Eine Banane', 'Einen Schirm'], r: 0 },
    { id: 'q21', e: '⏸️', f: 'Wie heisst es, wenn in der Musik kurz nichts klingt?', a: ['Pause', 'Lärm', 'Ende'], r: 0 },
    { id: 'q22', e: '🎷', f: 'Ist ein Saxophon aus Holz oder aus Metall?', a: ['Aus Metall', 'Aus Holz', 'Aus Papier'], r: 0, info: 'Es gehört trotzdem zu den Holzblasinstrumenten, wegen des Holzblättchens im Mundstück.' },
    { id: 'q23', e: '🪘', f: 'Welches Instrument schüttelt man?', a: ['Rassel', 'Klavier', 'Harfe'], r: 0 },
    { id: 'q24', e: '🐦', f: 'Wer singt am Morgen vor dem Fenster?', a: ['Die Vögel', 'Die Fische', 'Die Steine'], r: 0 },
    { id: 'q25', e: '🎻', f: 'Welches Instrument ist grösser?', a: ['Kontrabass', 'Geige', 'Flöte'], r: 0 },
    { id: 'q26', e: '🎼', f: 'Wie schreibt man Musik auf?', a: ['Mit Noten', 'Mit Zahlen auf dem Bauch', 'Gar nicht'], r: 0 },
    { id: 'q27', e: '🪕', f: 'Wie bringt man eine Gitarre zum Klingen?', a: ['Saiten zupfen', 'Hineinbeissen', 'Schütteln'], r: 0 },
    { id: 'q28', e: '😊', f: 'Wie fühlt sich ein schnelles, lautes Lied oft an?', a: ['Fröhlich', 'Müde', 'Langweilig'], r: 0 },
    { id: 'q29', e: '🌙', f: 'Welches Lied singt man vor dem Schlafen?', a: ['Ein Schlaflied', 'Ein Marschlied', 'Ein Sirenenlied'], r: 0 },
    { id: 'q30', e: '🐨', f: 'Was für ein Tier ist Kiki?', a: ['Ein Koala', 'Ein Pinguin', 'Ein Krokodil'], r: 0 }
  ];

  var INSTRUMENTE = [
    ['i1', '🥁', 'Trommel', 'Bumm, bumm! Die Trommel gibt den Takt an.'], ['i2', '🪇', 'Rassel', 'Schütteln, und es raschelt wie Regen.'],
    ['i3', '🎹', 'Klavier', 'Schwarze und weisse Tasten. Kann leise und laut.'], ['i4', '🎸', 'Gitarre', 'Sechs Saiten zum Zupfen am Lagerfeuer.'],
    ['i5', '🎻', 'Geige', 'Singt mit einem Bogen, fast wie eine Stimme.'], ['i6', '🎺', 'Trompete', 'Glänzt golden und ruft: Tatüü!'],
    ['i7', '🎷', 'Saxophon', 'Klingt weich und ein bisschen frech.'], ['i8', '🪈', 'Flöte', 'Ein Pfeifen wie ein kleiner Vogel.'],
    ['i9', '🪗', 'Handorgel', 'Zieht sich auseinander und atmet Musik.'], ['i10', '🔔', 'Glocke', 'Ding, dang, dong, wie bei Bruder Jakob.'],
    ['i11', '🪘', 'Bongo', 'Zwei kleine Trommeln für schnelle Hände.'], ['i12', '🎤', 'Mikrofon', 'Kikis Liebling: macht die Stimme gross.'],
    ['i13', '🪕', 'Banjo', 'Klingt hell und hüpfend.'], ['i14', '🎼', 'Notenblatt', 'Hier wohnt die Musik, bevor sie klingt.'],
    ['i15', '🥄', 'Löffel-Klapper', 'Zwei Löffel, und schon klappert es im Takt.'], ['i16', '🫙', 'Reis-Dose', 'Selbst gebaut: eine Dose voller Reis.'],
    ['i17', '🐚', 'Muschelhorn', 'Klingt weit über das Meer.'], ['i18', '🎵', 'Xylophon', 'Holzplättchen, die von tief nach hoch singen.'],
    ['i19', '🎐', 'Harfe', 'Viele Saiten, und es klingt wie ein Traum.'], ['i20', '🌟', 'Kikis Sternentrommel', 'Die seltenste von allen. Du hast die ganze Musik-Kiste gefüllt!']
  ].map(function (m) { return { id: m[0], e: m[1], n: m[2], x: m[3] }; });

  window.INHALT = {
    app: 'kiki', titel: 'Musik-Kiste', farbe: '#7fd4ff',
    intro: 'Spielen, raten, sammeln. Für Kind und Mama oder Papa zusammen.',
    fuss: 'Keine Aufnahmen, alles bleibt auf diesem Handy.',
    regale: [
      { id: 'spiele', typ: 'karten', e: '🎲', titel: 'Sing-Spiele', kurz: '30 Spiele zu zweit', items: SPIELE,
        gruppen: { stimme: 'Stimme wecken', rhythmus: 'Rhythmus', zuhoeren: 'Gut zuhören', erfinden: 'Selbst erfinden', zusammen: 'Zusammen singen' } },
      { id: 'raetsel', typ: 'quiz', e: '❓', titel: 'Musik-Rätsel', kurz: '5 Fragen pro Runde', items: RAETSEL },
      { id: 'instrumente', typ: 'album', e: '🎺', titel: 'Instrumente', kurz: 'Jedes Lied: ein Instrument', items: INSTRUMENTE, frei: gesammelt, heute: false,
        wie: 'Jedes zu Ende gesungene Lied und jede Rätselrunde bringt ein neues Instrument.' }
    ],
    abzeichen: [
      { e: '🌟', n: 'Hallo Kiki', x: 'Die Musik-Kiste geöffnet', wann: function (s) { return s.tage >= 1; } },
      { e: '🔥', n: '3 Tage', x: '3 Tage hintereinander', wann: function (s) { return s.serie >= 3; } },
      { e: '🏅', n: 'Woche', x: '7 Tage hintereinander', wann: function (s) { return s.serie >= 7; } },
      { e: '🎲', n: 'Spielkind', x: '10 Sing-Spiele entdeckt', wann: function (s) { return s.regal.spiele >= 10; } },
      { e: '🎓', n: 'Musik-Profi', x: 'Alle 30 Sing-Spiele', wann: function (s) { return s.regal.spiele >= 30; } },
      { e: '❓', n: 'Rätsel-Fan', x: '3 Rätselrunden', wann: function (s) { return s.runden >= 3; } },
      { e: '🏆', n: 'Alles richtig', x: 'Eine Runde ohne Fehler', wann: function (s) { return s.perfekt >= 1; } },
      { e: '🎺', n: 'Orchester', x: '10 Instrumente', wann: function (s) { return s.regal.instrumente >= 10; } },
      { e: '❤️', n: 'Lieblinge', x: '3 Spiele mit «Mag ich»', wann: function (s) { return s.mag >= 3; } }
    ]
  };
})();
