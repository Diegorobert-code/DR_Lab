/* daten.js – Inhalt für das Zahnböcklein-Regal «Zahn-Schule» (inhalt/inhalt.js).
   Für Kinder von 3 bis 8. Kurze Sätze, nichts Gruseliges, keine Heilversprechen. Gesundheitssätze prüft Diego (siehe Plan).
   Neues einfach in die Listen anhängen. tag = Thema (für «Weil du … mochtest»). */
(function () {
  'use strict';
  function sterne() { try { return parseInt(localStorage.getItem('zb-sterne') || '0', 10) || 0; } catch (e) { return 0; } }

  var WISSEN = [
    { id: 'w1', tag: 'koerper', e: '🦷', t: '20 kleine Zähne', x: 'Kinder haben 20 Milchzähne. Später kommen grössere Zähne. Erwachsene haben bis zu 32.' },
    { id: 'w2', tag: 'koerper', e: '💎', t: 'Härter als Knochen', x: 'Ganz aussen auf dem Zahn liegt der Zahnschmelz. Er ist das Härteste in deinem ganzen Körper.' },
    { id: 'w3', tag: 'koerper', e: '🌱', t: 'Zähne haben Wurzeln', x: 'Wie ein Baum hat jeder Zahn Wurzeln. Sie halten ihn fest im Kiefer, gut versteckt im Zahnfleisch.' },
    { id: 'w4', tag: 'koerper', e: '👅', t: 'Die Zunge hilft mit', x: 'Deine Zunge schiebt das Essen hin und her, damit die Zähne gut kauen können. Sie mag es auch, sanft geputzt zu werden.' },
    { id: 'w5', tag: 'koerper', e: '💧', t: 'Spucke ist super', x: 'Spucke spült kleine Essensreste weg. Darum ist Wasser trinken gut: Es hilft der Spucke.' },
    { id: 'w6', tag: 'koerper', e: '🐣', t: 'Der erste Zahn', x: 'Die meisten Babys bekommen ihren ersten Zahn mit etwa sechs Monaten. Oft ist es ein Zahn unten in der Mitte.' },
    { id: 'w7', tag: 'koerper', e: '🎁', t: 'Wackelzahn!', x: 'Mit etwa sechs Jahren beginnt das Wackeln. Unter jedem Milchzahn wartet schon ein neuer, grosser Zahn.' },
    { id: 'w8', tag: 'koerper', e: '🍽️', t: 'Schneiden und mahlen', x: 'Vorne sind Schneidezähne, die beissen ab. Hinten sind Backenzähne, die mahlen alles klein, wie eine Mühle.' },
    { id: 'w9', tag: 'koerper', e: '😁', t: 'Jedes Lächeln ist anders', x: 'Kein Mensch hat genau die gleichen Zähne wie du. Dein Lächeln gibt es nur einmal.' },
    { id: 'w10', tag: 'putzen', e: '⏱️', t: 'Zwei Minuten', x: 'Zwei Minuten putzen ist ungefähr so lang wie ein ganzes Lied. Mit dem Zahnböcklein vergeht die Zeit wie im Flug.' },
    { id: 'w11', tag: 'putzen', e: '🌙', t: 'Abends am wichtigsten', x: 'Nachts macht die Spucke Pause. Darum putzen wir abends besonders gründlich, bevor wir schlafen.' },
    { id: 'w12', tag: 'putzen', e: '🫛', t: 'Wie eine Erbse', x: 'Für kleine Kinder reicht ein Klecks Zahnpasta, so gross wie eine Erbse. Mehr braucht es nicht.' },
    { id: 'w13', tag: 'putzen', e: '🔄', t: 'Kleine Kreise', x: 'Mit kleinen Kreisen putzt du sanft und gründlich. Nicht schrubben, nicht drücken: Die Zähne mögen es weich.' },
    { id: 'w14', tag: 'putzen', e: '🧭', t: 'Immer gleiche Reihenfolge', x: 'Wer immer gleich anfängt, vergisst keinen Zahn. Das Zahnböcklein macht es so: oben rechts, oben links, unten links, unten rechts.' },
    { id: 'w15', tag: 'putzen', e: '🙌', t: 'Mama oder Papa putzen nach', x: 'Bis etwa acht Jahre putzen Erwachsene nach. Das ist kein Schummeln, sondern Teamwork.' },
    { id: 'w16', tag: 'putzen', e: '💦', t: 'Ausspucken reicht', x: 'Nach dem Putzen einfach ausspucken. So bleibt ein bisschen Zahnpasta auf den Zähnen und schützt sie in der Nacht.' },
    { id: 'w17', tag: 'putzen', e: '🪥', t: 'Neue Bürste', x: 'Wenn die Borsten zerzaust aussehen wie eine Frisur nach dem Aufstehen, ist Zeit für eine neue Zahnbürste. Oft nach etwa drei Monaten.' },
    { id: 'w18', tag: 'putzen', e: '🦷', t: 'Hinten nicht vergessen', x: 'Die hintersten Zähne verstecken sich gern. Mach den Mund weit auf und besuche sie extra.' },
    { id: 'w19', tag: 'putzen', e: '🪞', t: 'Spiegel-Trick', x: 'Vor dem Spiegel siehst du, wo die Bürste gerade ist. Zeig dem Spiegel ein grosses Monster-Lächeln!' },
    { id: 'w20', tag: 'essen', e: '🍎', t: 'Knackig ist gut', x: 'Äpfel, Rüebli und Gurken muss man richtig kauen. Das macht den Zähnen Spass und die Spucke fliesst.' },
    { id: 'w21', tag: 'essen', e: '🧀', t: 'Käse-Freund', x: 'Ein Stück Käse ist ein guter Zahn-Freund. Er hat wenig Zucker und viel Kalzium.' },
    { id: 'w22', tag: 'essen', e: '🚰', t: 'Wasser ist der Durstlöscher', x: 'Wasser hat keinen Zucker. Darum ist es das beste Getränk für die Zähne, den ganzen Tag.' },
    { id: 'w23', tag: 'essen', e: '🍬', t: 'Süsses mit Pause', x: 'Süsses ist manchmal fein. Am besten nach dem Essen und nicht den ganzen Tag lang immer wieder ein bisschen.' },
    { id: 'w24', tag: 'essen', e: '🧃', t: 'Saft ist süss', x: 'Auch Saft hat viel Zucker, sogar wenn er aus Früchten ist. Ein Glas Wasser dazu ist eine gute Idee.' },
    { id: 'w25', tag: 'essen', e: '🥛', t: 'Milch für starke Zähne', x: 'Milch hat Kalzium. Das brauchen Zähne und Knochen zum Wachsen.' },
    { id: 'w26', tag: 'essen', e: '🍪', t: 'Klebrig bleibt kleben', x: 'Klebrige Sachen wie Gummibärchen bleiben lange auf den Zähnen hängen. Danach Wasser trinken hilft.' },
    { id: 'w27', tag: 'tiere', e: '🦈', t: 'Haie wechseln dauernd', x: 'Ein Hai bekommt immer wieder neue Zähne, ein ganzes Leben lang. Hunderte!' },
    { id: 'w28', tag: 'tiere', e: '🐘', t: 'Elefanten-Zähne', x: 'Die langen Stosszähne der Elefanten sind eigentlich Zähne. Zum Kauen haben sie hinten riesige Backenzähne.' },
    { id: 'w29', tag: 'tiere', e: '🐿️', t: 'Nagezähne wachsen immer', x: 'Bei Eichhörnchen und Hasen wachsen die Vorderzähne immer weiter. Beim Knabbern werden sie wieder kürzer.' },
    { id: 'w30', tag: 'tiere', e: '🐊', t: 'Krokodil mit Helfer', x: 'Es gibt kleine Vögel, die Krokodilen Essensreste aus dem Maul picken. Eine Zahnbürste mit Flügeln!' },
    { id: 'w31', tag: 'tiere', e: '🐌', t: 'Schnecken-Zähnchen', x: 'Schnecken haben tausende winzige Zähnchen auf einer Raspel-Zunge. Damit raspeln sie Blätter.' },
    { id: 'w32', tag: 'tiere', e: '🐐', t: 'Geissen kauen lange', x: 'Geissen wie das Zahnböcklein kauen ihr Futter sehr gründlich, manchmal sogar zweimal. Gut kauen ist gut.' },
    { id: 'w33', tag: 'tiere', e: '🐶', t: 'Hunde haben 42', x: 'Ein grosser Hund hat 42 Zähne. Viel mehr als du!' },
    { id: 'w34', tag: 'zahnfee', e: '🧚', t: 'Die Zahnfee', x: 'In vielen Familien holt die Zahnfee den Milchzahn unter dem Kissen. Manchmal lässt sie eine kleine Überraschung da.' },
    { id: 'w35', tag: 'zahnfee', e: '🐭', t: 'Die Zahnmaus', x: 'In manchen Ländern kommt keine Fee, sondern eine kleine Maus und holt den Zahn. Jedes Land hat seine Geschichte.' },
    { id: 'w36', tag: 'zahnfee', e: '🏠', t: 'Zahn aufs Dach', x: 'In einigen Ländern werfen Kinder den Milchzahn aufs Dach und wünschen sich einen starken neuen.' },
    { id: 'w37', tag: 'zahnfee', e: '📦', t: 'Zahn-Döschen', x: 'Viele Kinder bewahren ihren ersten Wackelzahn in einem kleinen Döschen auf. Eine schöne Erinnerung.' },
    { id: 'w38', tag: 'koerper', e: '🩺', t: 'Besuch bei der Zahnärztin', x: 'Bei der Zahnärztin schaut man nur nach, ob alles gut ist. Du darfst den Mund weit aufmachen wie ein Nilpferd.' },
    { id: 'w39', tag: 'koerper', e: '🦛', t: 'Weit auf!', x: 'Mach den Mund so weit auf, wie du kannst. Jetzt siehst du im Spiegel alle deine Zähne. Zählst du sie?' },
    { id: 'w40', tag: 'putzen', e: '⭐', t: 'Jeden Tag ein Stern', x: 'Zweimal am Tag putzen ist wie zwei kleine Geschenke für deine Zähne. Das Zahnböcklein freut sich jedes Mal.' }
  ];

  var RAETSEL = [
    { id: 'q1', e: '🦷', f: 'Wie viele Milchzähne haben Kinder?', a: ['10', '20', '50'], r: 1, info: 'Es sind 20 kleine Milchzähne.' },
    { id: 'q2', e: '⏱️', f: 'Wie lange putzen wir?', a: ['10 Sekunden', '2 Minuten', '1 Stunde'], r: 1, info: 'Zwei Minuten, so lang wie ein Lied.' },
    { id: 'q3', e: '🫛', f: 'Wie viel Zahnpasta braucht ein kleines Kind?', a: ['So viel wie eine Erbse', 'Die ganze Tube', 'Gar keine'], r: 0 },
    { id: 'q4', e: '🚰', f: 'Welches Getränk ist am besten für die Zähne?', a: ['Limonade', 'Wasser', 'Sirup'], r: 1, info: 'Wasser hat keinen Zucker.' },
    { id: 'q5', e: '🔄', f: 'Wie putzt das Zahnböcklein?', a: ['Ganz fest schrubben', 'Kleine sanfte Kreise', 'Gar nicht'], r: 1 },
    { id: 'q6', e: '🌙', f: 'Wann putzen wir besonders gründlich?', a: ['Am Abend', 'Beim Mittagessen', 'Nie'], r: 0, info: 'Nachts macht die Spucke Pause.' },
    { id: 'q7', e: '🍎', f: 'Welcher Snack ist ein Zahn-Freund?', a: ['Gummibärchen', 'Apfelschnitze', 'Lutscher'], r: 1 },
    { id: 'q8', e: '💎', f: 'Was ist das Härteste in deinem Körper?', a: ['Der Zahnschmelz', 'Die Haare', 'Die Ohren'], r: 0 },
    { id: 'q9', e: '🦈', f: 'Welches Tier bekommt immer wieder neue Zähne?', a: ['Der Hai', 'Die Katze', 'Der Mensch'], r: 0 },
    { id: 'q10', e: '💦', f: 'Was machen wir nach dem Putzen?', a: ['Ausspucken', 'Zahnpasta essen', 'Bürste wegwerfen'], r: 0 },
    { id: 'q11', e: '🪥', f: 'Wann braucht es eine neue Zahnbürste?', a: ['Wenn die Borsten zerzaust sind', 'Jeden Tag', 'Nie'], r: 0 },
    { id: 'q12', e: '🦛', f: 'Was machst du bei der Zahnärztin?', a: ['Mund weit auf', 'Mund zu', 'Wegrennen'], r: 0, info: 'Wie ein Nilpferd. Dann kann sie gut schauen.' },
    { id: 'q13', e: '🐿️', f: 'Bei wem wachsen die Vorderzähne immer weiter?', a: ['Beim Eichhörnchen', 'Beim Fisch', 'Beim Vogel'], r: 0 },
    { id: 'q14', e: '🧀', f: 'Was ist gut für die Zähne?', a: ['Käse', 'Bonbons', 'Zuckerwatte'], r: 0 },
    { id: 'q15', e: '👅', f: 'Was darfst du auch sanft putzen?', a: ['Die Zunge', 'Die Nase', 'Die Füsse'], r: 0 },
    { id: 'q16', e: '🐣', f: 'Wann kommt oft der erste Zahn?', a: ['Mit etwa 6 Monaten', 'Mit 10 Jahren', 'Bei der Geburt'], r: 0 },
    { id: 'q17', e: '🎁', f: 'Was wartet unter einem Wackelzahn?', a: ['Ein neuer, grosser Zahn', 'Ein Bonbon', 'Nichts'], r: 0 },
    { id: 'q18', e: '🍽️', f: 'Welche Zähne mahlen das Essen klein?', a: ['Die Backenzähne hinten', 'Die Ohren', 'Die Lippen'], r: 0 },
    { id: 'q19', e: '🧃', f: 'Hat Saft viel Zucker?', a: ['Ja, ziemlich viel', 'Nein, gar keinen', 'Nur am Montag'], r: 0 },
    { id: 'q20', e: '🙌', f: 'Wer putzt bei kleinen Kindern nach?', a: ['Mama oder Papa', 'Der Hund', 'Niemand'], r: 0 },
    { id: 'q21', e: '🐶', f: 'Wie viele Zähne hat ein grosser Hund?', a: ['42', '4', '400'], r: 0 },
    { id: 'q22', e: '🧚', f: 'Wer holt in vielen Familien den Milchzahn?', a: ['Die Zahnfee', 'Der Briefträger', 'Das Krokodil'], r: 0 },
    { id: 'q23', e: '🧭', f: 'Wo fängt das Zahnböcklein an?', a: ['Oben rechts', 'In der Nase', 'Beim Bauch'], r: 0 },
    { id: 'q24', e: '🍬', f: 'Wann ist Süsses am besten für die Zähne?', a: ['Nach dem Essen', 'Den ganzen Tag immer wieder', 'Mitten in der Nacht'], r: 0 },
    { id: 'q25', e: '🌱', f: 'Was hält den Zahn fest?', a: ['Die Wurzeln', 'Leim', 'Ein Pflaster'], r: 0 },
    { id: 'q26', e: '😁', f: 'Hat jemand genau die gleichen Zähne wie du?', a: ['Nein, dein Lächeln gibt es nur einmal', 'Ja, alle', 'Nur Zwillinge im Zoo'], r: 0 },
    { id: 'q27', e: '🐊', f: 'Wer putzt manchmal einem Krokodil die Zähne?', a: ['Ein kleiner Vogel', 'Ein Elefant', 'Eine Schnecke'], r: 0 },
    { id: 'q28', e: '💧', f: 'Was spült Essensreste weg?', a: ['Die Spucke', 'Die Tränen', 'Der Wind'], r: 0 },
    { id: 'q29', e: '🍪', f: 'Was bleibt lange an den Zähnen kleben?', a: ['Gummibärchen', 'Wasser', 'Gurke'], r: 0 },
    { id: 'q30', e: '⭐', f: 'Wie oft am Tag putzen wir?', a: ['Zweimal', 'Einmal im Monat', 'Zehnmal'], r: 0 }
  ];

  var MONSTER = [
    ['m1', '🍭', 'Lolli-Lulu', 'Kichert immer, wenn jemand Lutscher sagt. Wurde beim ersten Putzen weggeschubst.'],
    ['m2', '🍬', 'Bonbon-Bruno', 'Rollt gern hin und her. Mag kleine Kreise gar nicht.'],
    ['m3', '🧁', 'Krümel-Kiki', 'Wohnt am liebsten hinten links. Jetzt wohnt sie im Album.'],
    ['m4', '🍫', 'Schoko-Schorsch', 'Hat einen braunen Schnauz. Plumpst beim Putzen immer um.'],
    ['m5', '🍩', 'Donut-Dora', 'Dreht sich im Kreis, bis ihr schwindlig wird.'],
    ['m6', '🍯', 'Klebe-Klaus', 'Klebt überall fest. Aber Wasser mag er gar nicht.'],
    ['m7', '🧃', 'Saft-Susi', 'Schlürft gern. Hat sich vor dem Wasserglas versteckt.'],
    ['m8', '🍰', 'Torten-Toni', 'Trägt eine Sahnehaube. Hat beim Putzparty-Tanz mitgemacht.'],
    ['m9', '🍪', 'Keks-Konrad', 'Sammelt Krümel. Jetzt sammelt er Sterne für dich.'],
    ['m10', '🍦', 'Glace-Gina', 'Ist immer ein bisschen kalt. Lieblingsfarbe: Rosa.'],
    ['m11', '🍮', 'Pudding-Paul', 'Wackelt wie ein Wackelzahn.'],
    ['m12', '🥤', 'Sirup-Sämi', 'Blubbert. Wurde von der Zahnbürste ganz sanft weggekitzelt.'],
    ['m13', '🍡', 'Mochi-Mia', 'Rund und weich. Hüpft lieber auf dem Bett als auf Zähnen.'],
    ['m14', '🧇', 'Waffel-Willi', 'Hat überall kleine Quadrate. Spielt gern Schach.'],
    ['m15', '🍓', 'Erdbeer-Ella', 'Eigentlich ganz lieb. Wohnt jetzt im Garten.'],
    ['m16', '🥨', 'Brezel-Benno', 'Kann sich verknoten. Und wieder entknoten.'],
    ['m17', '🍿', 'Popcorn-Pia', 'Macht «plopp», wenn sie sich freut.'],
    ['m18', '🍒', 'Kirsch-Karl', 'Kommt immer zu zweit.'],
    ['m19', '🥞', 'Pfannkuchen-Peppi', 'Flach wie ein Teppich. Lässt sich gern einrollen.'],
    ['m20', '🎂', 'Geburtstags-Greta', 'Hat Kerzen auf dem Kopf. Feiert jeden Putz-Stern.'],
    ['m21', '🍧', 'Schnee-Schorschi', 'Schmilzt vor Lachen.'],
    ['m22', '🧋', 'Kugel-Kuno', 'Hat Kugeln im Bauch und rollt davon.'],
    ['m23', '🍥', 'Spiral-Sina', 'Dreht sich wie eine Schnecke.'],
    ['m24', '👑', 'König Zuckerzahn', 'Der Chef der Zuckermonster. Hat aufgegeben und putzt jetzt selbst. Du hast alle gesammelt!']
  ].map(function (m) { return { id: m[0], e: m[1], n: m[2], x: m[3] }; });

  var GESCHICHTEN = [
    { id: 'g1', e: '🌙', t: 'Das Zahnböcklein kann nicht einschlafen', kurz: 'Ein kleiner Zahn kitzelt.', seiten: [
      'Es ist spät. Der Mond scheint ins Zimmer. Aber das Zahnböcklein liegt wach und wackelt mit den Feenflügeln.',
      '«Was ist los?», fragt der Mond. «Mein Zahn kitzelt», sagt das Zahnböcklein. «Ich glaube, da wohnt noch ein Krümel.»',
      'Also steht es auf, nimmt seine blaue Zahnbürste und putzt. Kleine Kreise, oben, unten, ganz hinten.',
      'Der Krümel kullert weg. Das Kitzeln ist weg. Das Zahnböcklein gähnt ein riesiges Geissen-Gähnen.',
      'Es kuschelt sich ins Bett. «Gute Nacht, Mond.» Und der Mond lächelt mit seinen weissen Zähnen.'
    ], lehre: 'Saubere Zähne schlafen besser.' },
    { id: 'g2', e: '🍎', t: 'Der Apfel-Ausflug', kurz: 'Mit Otti im Obstgarten.', seiten: [
      'Heute gehen das Zahnböcklein und Otti, der kleine Igel, in den Obstgarten. Die Bäume hängen voller roter Äpfel.',
      'Otti beisst in einen Apfel. Knack! «Hörst du das?», lacht er. «Meine Zähne machen Musik.»',
      'Das Zahnböcklein beisst auch. Knack, knack! Der Apfel ist süss und saftig, und die Zähne fühlen sich ganz frisch an.',
      'Auf dem Heimweg trinken sie Wasser aus der Flasche. «Wasser und Äpfel», sagt Otti, «das mögen Zähne.»',
      'Zu Hause putzen sie trotzdem. Zwei Minuten, mit dem Glitzer-Pop. Otti tanzt dazu.'
    ], lehre: 'Knackiges Essen und Wasser sind Zahn-Freunde.' },
    { id: 'g3', e: '🦷', t: 'Der erste Wackelzahn', kurz: 'Der erste Wackelzahn ist da.', seiten: [
      'Ein kleines Mädchen ruft: «Mein Zahn wackelt!» Sie stupst ihn mit der Zunge an. Hin und her.',
      'Das Zahnböcklein fliegt herbei. «Ein Wackelzahn ist etwas Schönes», sagt es. «Darunter wartet ein neuer, grosser Zahn.»',
      '«Tut das weh?», fragt das Mädchen. «Meistens nicht», sagt das Zahnböcklein. «Er kommt, wenn er bereit ist. Ganz von allein.»',
      'Ein paar Tage später liegt der kleine Zahn in der Hand. Er ist winzig und weiss wie eine Perle.',
      'Das Mädchen legt ihn in ein Döschen. «Für meine Erinnerung», sagt sie. Und das Zahnböcklein klatscht mit den Hufen.'
    ], lehre: 'Wackelzähne machen Platz für grosse Zähne.' },
    { id: 'g4', e: '🎶', t: 'Die Putzparty im Zoo', kurz: 'Alle Tiere putzen mit.', seiten: [
      'Im Zoo ist heute Putzparty. Das Zahnböcklein stellt die Musik an: Disco-Drache!',
      'Das Nilpferd macht den Mund ganz weit auf. Das Krokodil zeigt seine vielen Zähne. Der Elefant putzt mit dem Rüssel.',
      'Alle putzen im Takt. Kleine Kreise, oben, unten. Die Affen lachen und machen Schaum-Bärte.',
      'Nach zwei Minuten ruft das Zahnböcklein: «Blitzeblank!» Alle Tiere zeigen ihr schönstes Lächeln.',
      'Und die Giraffe? Sie hat so einen langen Hals, dass sie noch ein bisschen weiterputzt. Hihi.'
    ], lehre: 'Zusammen putzen macht mehr Spass.' },
    { id: 'g5', e: '👾', t: 'Das kleinste Zuckermonster', kurz: 'Ein Monster, das lieber Freund sein will.', seiten: [
      'Ganz hinten auf einem Backenzahn sitzt ein winziges Zuckermonster. Es heisst Krümel-Kiki.',
      'Als die Zahnbürste kommt, ruft Kiki: «Halt! Ich will gar nicht stören. Ich bin nur so allein.»',
      'Das Zahnböcklein überlegt. «Auf den Zähnen darfst du nicht wohnen. Aber in meinem Album ist Platz für dich.»',
      'Kiki strahlt. Hops, springt es ins Sammelalbum. Dort wohnen schon viele andere Zuckermonster. Sie winken.',
      'Seitdem schaut Kiki jeden Abend aus dem Album zu, wie du putzt. Und klatscht.'
    ], lehre: 'Jedes Putzen bringt ein Monster ins Album.' },
    { id: 'g6', e: '🧚', t: 'Ein Brief von der Zahnfee', kurz: 'Unter dem Kissen liegt Post.', seiten: [
      'Am Morgen liegt unter dem Kissen ein kleiner Brief. Er glitzert. Das Zahnböcklein liest ihn vor.',
      '«Liebes Kind, danke für deinen Milchzahn. Er war so sauber, dass er geleuchtet hat wie ein Stern.»',
      '«Ich baue aus allen Milchzähnen eine Brücke zum Mond. Dein Zahn ist jetzt ein Stein in dieser Brücke.»',
      '«Putz weiter so schön. Dann wird dein neuer Zahn stark und gross. Deine Zahnfee.»',
      'Das Kind schaut aus dem Fenster zum Mond. Und ganz kurz glaubt es, dort eine kleine Brücke blitzen zu sehen.'
    ], lehre: 'Saubere Zähne leuchten wie Sterne.' },
    { id: 'g7', e: '🏔️', t: 'Das Murmeltier und die Bürste', kurz: 'Ein Besuch in den Bergen.', seiten: [
      'Auf seiner Reise landet das Zahnböcklein auf einer Bergwiese. Ein Murmeltier pfeift: «Wer bist du denn?»',
      '«Ich bin das Zahnböcklein. Ich helfe Kindern beim Putzen.» Das Murmeltier zeigt seine grossen Vorderzähne. «Und ich?»',
      '«Deine Zähne wachsen immer weiter», sagt das Zahnböcklein. «Darum knabberst du an Gräsern und Wurzeln. Das ist dein Putzen.»',
      'Das Murmeltier knabbert stolz an einer Wurzel. Knabber, knabber. «Wie sehe ich aus?» – «Blitzeblank!»',
      'Zum Abschied pfeifen beide das Putzlied. Es hallt über alle Berge.'
    ], lehre: 'Jedes Tier pflegt seine Zähne auf seine Art.' },
    { id: 'g8', e: '🪞', t: 'Der Zauberspiegel', kurz: 'Wer lächelt da zurück?', seiten: [
      'Im Badezimmer hängt ein Spiegel. Heute ist er ein Zauberspiegel. Wer hineinschaut, sieht sein Lächeln funkeln.',
      'Das Kind schaut hinein und zeigt die Zähne. Oben, unten, vorne, hinten. «Wo putze ich zuerst?»',
      '«Oben rechts», flüstert der Spiegel. Und dann oben links, unten links, unten rechts. Immer im Kreis.',
      'Als alle Zähne sauber sind, glitzert der Spiegel wie ein Sternenhimmel.',
      '«Danke, Spiegel», sagt das Kind. Und der Spiegel lächelt zurück. Mit genau dem gleichen Lächeln.'
    ], lehre: 'Immer gleich anfangen, dann vergisst man keinen Zahn.' }
  ];

  window.INHALT = {
    app: 'zahnboecklein', titel: 'Zahn-Schule', farbe: '#ff8fb1',
    intro: 'Entdecken, raten, sammeln. Jeden Tag gibt es etwas Neues.',
    fuss: 'Alles bleibt auf diesem Handy.',
    regale: [
      { id: 'wissen', typ: 'karten', e: '💡', titel: 'Zahn-Wissen', kurz: 'Kleine Staun-Karten', items: WISSEN,
        gruppen: { koerper: 'Dein Mund', putzen: 'Richtig putzen', essen: 'Essen und Trinken', tiere: 'Tier-Zähne', zahnfee: 'Zahnfee und Wackelzahn' } },
      { id: 'raetsel', typ: 'quiz', e: '❓', titel: 'Zahn-Rätsel', kurz: '5 Fragen pro Runde', items: RAETSEL },
      { id: 'album', typ: 'album', e: '👾', titel: 'Monster-Album', kurz: 'Jedes Putzen: ein Monster', items: MONSTER, frei: sterne, heute: false,
        wie: 'Jedes Mal Zähneputzen bringt ein neues Zuckermonster ins Album.' },
      { id: 'geschichten', typ: 'geschichten', e: '📖', titel: 'Geschichten', kurz: 'Kurz vor dem Schlafen', items: GESCHICHTEN }
    ],
    abzeichen: [
      { e: '🌟', n: 'Erster Tag', x: 'Die Zahn-Schule geöffnet', wann: function (s) { return s.tage >= 1; } },
      { e: '🔥', n: '3 Tage', x: '3 Tage hintereinander da', wann: function (s) { return s.serie >= 3; } },
      { e: '🏅', n: 'Woche', x: '7 Tage hintereinander da', wann: function (s) { return s.serie >= 7; } },
      { e: '💡', n: 'Entdecker', x: '10 Wissenskarten gelesen', wann: function (s) { return s.regal.wissen >= 10; } },
      { e: '🎓', n: 'Zahn-Profi', x: 'Alle 40 Wissenskarten', wann: function (s) { return s.regal.wissen >= 40; } },
      { e: '❓', n: 'Rätsel-Fan', x: '3 Rätselrunden gespielt', wann: function (s) { return s.runden >= 3; } },
      { e: '🏆', n: 'Alles richtig', x: 'Eine Runde ohne Fehler', wann: function (s) { return s.perfekt >= 1; } },
      { e: '👾', n: 'Sammler', x: '12 Monster im Album', wann: function (s) { return s.regal.album >= 12; } },
      { e: '👑', n: 'Monster-König', x: 'Alle 24 Monster', wann: function (s) { return s.regal.album >= 24; } }
    ]
  };
})();
