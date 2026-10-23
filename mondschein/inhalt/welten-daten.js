/* welten-daten.js – «Zauberwald-Tore»: Welten, Starter-Geschichten und Vorschläge fürs Erfinden.
   Start ist der Zauberwald (Mondschein-Wald). Hinter jedem Tor wartet eine Welt.
   Nur eigene Figuren und Namen. Nichts Gruseliges, keine Gewalt: gelöst wird mit Mut, Köpfchen, Freundlichkeit und Teamwork.
   Neue Geschichte: in «geschichten» der passenden Welt anhängen. Seiten sind Texte; eine Seite darf eine Wahl sein:
   { frage: '…', wahl: [ { e: '🌙', l: 'Kurzwort', t: 'Text nach der Wahl' }, … ] }.
   bild: '' = gemaltes Hintergrundbild (inhalt/bilder/welt-<id>.webp) eintragen, sobald Tinko es geliefert hat.
   Bildaufträge für Tinko: inhalt/bildauftraege.md (gleiche Reihenfolge). Hasi spricht nie. */
(function () {
  'use strict';

  var FIGUREN = {
    otti:    { e: '🦔', n: 'Otti', was: 'der kleine Igel mit dem gelben Halstuch' },
    nova:    { e: '🤖', n: 'Nova', was: 'der kleine blaue Roboter' },
    fompa:   { e: '☁️', n: 'Traumli', was: 'das flauschige Traumwesen, das verlorene Träume sammelt' },
    kiki:    { e: '🐨', n: 'Kiki', was: 'der Koala mit dem goldenen Mikrofon' },
    zahn:    { e: '🐐', n: 'Zahnböcklein', was: 'die kleine Geiss mit den Feenflügeln' },
    hasi:    { e: '🐰', n: 'Hasi', was: 'der stille Hase' },
    eule:    { e: '🦉', n: 'Frau Eule', was: 'die weise Eule mit dem Schal' },
    flori:   { e: '🦊', n: 'Flori', was: 'der kleine Fuchs' },
    lunara:  { e: '👸', n: 'Prinzessin Lunara', was: 'die Erfinderin mit dem Werkzeug-Gürtel' },
    glimmbot:{ e: '💡', n: 'Glimmbot', was: 'das runde Roboter-Glühwürmchen' },
    mimi:    { e: '🐱', n: 'Mimi', was: 'die Kätzchen-Kommissarin mit der Leucht-Lupe' },
    flocke:  { e: '🐈', n: 'Flocke', was: 'das weisse Kätzchen' },
    knopf:   { e: '🐈‍⬛', n: 'Knopf', was: 'das schwarze Kätzchen' },
    /* neu */
    zippi:   { e: '🐿️', n: 'Zippi', was: 'das Streifenhörnchen-Mädchen mit dem Raketen-Rucksack', neu: true },
    bolt:    { e: '🤖', n: 'Bolt', was: 'der kleine Roboter-Junge mit den Magnet-Händen', neu: true },
    luma:    { e: '✨', n: 'Luma', was: 'das Glühwürmchen-Mädchen, das leuchtet und Schutzblasen macht', neu: true },
    tiko:    { e: '🐨', n: 'Tiko', was: 'der Koala-Junge mit dem Weltraumhelm, der schweben kann', neu: true },
    pip:     { e: '🐭', n: 'Pip', was: 'das Mäuschen, das winzig klein wird und mit allen Tieren spricht', neu: true },
    flinka:  { e: '🦸‍♀️', n: 'Flinka Funkenherz', kurz: 'Flinka', was: 'die Superheldin mit dem Umhang aus Morgenlicht', neu: true },
    kometli: { e: '🚀', n: 'Kometli', was: 'das kleine runde Raumschiff mit dem Glöckchen', neu: true },
    perla:   { e: '🐠', n: 'Perla', was: 'das Glitzerfischchen aus dem Korallenreich', neu: true },
    tilda:   { e: '🐢', n: 'Oma Tilda', was: 'die alte, gemütliche Meeresschildkröte', neu: true },
    brummi:  { e: '🦕', n: 'Brummi', was: 'der kleine Langhals-Dino', neu: true }
  };

  var WELTEN = [
    {
      id: 'weltraum', bild: '', der: 'der Weltraum', im: 'im Weltraum', name: 'Weltraum', tor: 'Sternentor', e: '🚀', bg: 'weltraum', farbe: '#7fd4ff',
      kurz: 'Mit Kometli, dem kleinen Raumschiff, zu Mond und Sternen.',
      probleme: ['ein kleiner Stern hat sich verirrt', 'Kometlis Glöckchen ist verstummt', 'der Mond hat seinen Glanz verloren'],
      geschichten: [
        {
          id: 'ww-stern', titel: 'Kometli und der verirrte Stern', kurz: 'Ein Sternchen findet nicht mehr nach Hause.',
          cast: ['otti', 'kometli', 'nova'],
          seiten: [
            'Hinter dem Sternentor ist es dunkelblau und still. Da steht Kometli, das kleine runde Raumschiff. Es hat ein Bullauge, zwei Flossen und ein Glöckchen auf dem Dach. Pling!',
            '«Einsteigen, bitte!», piepst Nova. Otti klettert hinein und schnallt sich an. Kometli summt, wackelt ein bisschen und hebt ab. Höher und höher, bis der Zauberwald ganz klein ist.',
            'Draussen schwebt etwas Helles. Es ist ein Sternchen, so klein wie eine Erbse. Es blinkt traurig. «Ich habe meinen Platz im Himmel verloren», flüstert es.',
            { frage: 'Wie finden sie den richtigen Platz?', wahl: [
              { e: '🗺️', l: 'Sternkarte', t: 'Nova zeigt eine leuchtende Sternkarte. «Da!», ruft Otti. «Bei den sieben Sternen fehlt einer.» Genau dort ist eine kleine Lücke.' },
              { e: '🔔', l: 'Glöckchen', t: 'Kometli läutet sein Glöckchen. Pling, pling! Ganz weit weg antworten viele Sterne: Pling! Sie rufen ihr Sternchen nach Hause.' }
            ] },
            'Kometli fliegt ganz vorsichtig. Otti hält das Sternchen in beiden Pfoten. Es ist warm wie eine Tasse Tee.',
            'Dann setzt Otti es sanft an seinen Platz. Das Sternchen blinkt einmal, zweimal, und dann strahlt es so hell wie nie. Alle anderen Sterne funkeln mit.',
            'Auf dem Heimweg ist es ganz ruhig im Raumschiff. Nova summt ein Lied. Und unten wartet schon der Zauberwald mit seinem weichen Moos.'
          ],
          lehre: 'Wer sich verirrt, findet mit Freunden wieder nach Hause.'
        },
        {
          id: 'ww-mond', titel: 'Picknick auf dem Mond', kurz: 'Hüpfen, kichern, teilen: ein Ausflug mit den Kätzchen.',
          cast: ['otti', 'kometli', 'flocke', 'knopf'],
          seiten: [
            'Heute hat Otti einen Korb dabei. Darin sind Walderdbeeren, Nusskekse und eine Flasche Apfelsaft. «Wohin geht das Picknick?», fragt Kometli. «Auf den Mond!», ruft Otti.',
            'Hinten im Raumschiff kichert es. Flocke, das weisse Kätzchen, und Knopf, das schwarze Kätzchen, haben sich versteckt. «Dürfen wir mit?» Otti lacht. «Natürlich!»',
            'Kometli landet weich im Mondstaub. Puff! Die Kätzchen springen hinaus und … schweben! Auf dem Mond ist alles ganz leicht. Ein kleiner Hüpfer, und schon fliegt man.',
            { frage: 'Was spielen sie zuerst?', wahl: [
              { e: '🦘', l: 'Hüpfen', t: 'Sie hüpfen um die Wette, ganz langsam, wie in Zeitlupe. Knopf macht einen Purzelbaum in der Luft und landet auf Ottis Rücken. Alle kichern.' },
              { e: '👣', l: 'Spuren', t: 'Sie stapfen Bilder in den Mondstaub: eine Katze, einen Igel und ein grosses Herz. Von oben sieht es aus wie ein Gruss an die Erde.' }
            ] },
            'Dann breitet Otti die Decke aus. Aber oh, ein Nusskeks schwebt davon! Flocke streckt die Pfote aus und fängt ihn wieder ein. «Gerettet!»',
            'Sie teilen alles: jeder bekommt Erdbeeren, jeder bekommt einen Keks. Von hier oben sieht die Erde aus wie eine blaue Murmel.',
            'Auf dem Rückflug schlafen die Kätzchen ein, eng aneinander gekuschelt. Otti deckt sie zu. Kometli summt ganz leise, damit niemand aufwacht.'
          ],
          lehre: 'Geteilte Kekse schmecken doppelt gut.'
        },
        {
          id: 'ww-ring', titel: 'Der Ringplanet hat Schluckauf', kurz: 'Ein Planet hickst, und seine Ringe purzeln.',
          cast: ['nova', 'kometli', 'fompa'],
          seiten: [
            '«Hicks!» Was war das? Traumli drückt die flauschige Nase ans Bullauge. Dort draussen dreht sich ein grosser Planet mit bunten Ringen. «Hicks!», macht er wieder.',
            'Bei jedem Hicks hüpfen die Ringe. Rot, gelb und violett wackeln sie hin und her. «Der Ringplanet hat Schluckauf», sagt Nova. «Das kenne ich. Ich habe manchmal Piep-Schluckauf.»',
            '«Was hilft gegen Schluckauf?», fragt Kometli. Traumli überlegt. «Langsam atmen, etwas Lustiges oder einen Schreck. Aber einen Schreck wollen wir ihm nicht machen.»',
            { frage: 'Was probieren sie?', wahl: [
              { e: '🌬️', l: 'Atmen', t: '«Atme mit uns», ruft Nova. «Ein … und aus.» Der Planet atmet ganz langsam. Seine Wolken ziehen sich zusammen und dehnen sich wieder aus. Ein … und aus.' },
              { e: '🤡', l: 'Witz', t: 'Traumli erzählt seinen besten Witz: «Warum sind Sterne nie müde? Weil sie die ganze Nacht schlafen könnten, aber lieber funkeln!» Der Planet kichert so sehr, dass er das Hicksen vergisst.' }
            ] },
            'Sie warten. Und warten. Kometli zählt leise bis zehn. Kein Hicks mehr!',
            'Die Ringe drehen sich wieder schön rund und ruhig. Zum Dank lässt der Planet einen kleinen Regenbogen aus Sternenstaub regnen. Er glitzert auf Kometlis Dach.',
            '«Danke, kleine Freunde», brummt der Ringplanet freundlich. Und Nova piepst ganz leise: «Gern geschehen. Hicks!» Alle lachen.'
          ],
          lehre: 'Ruhig atmen hilft, wenn etwas zappelt.'
        }
      ]
    },
    {
      id: 'superheldin', bild: '', der: 'die Glitzerstadt', im: 'in der Glitzerstadt', name: 'Glitzerstadt', tor: 'Funkentor', e: '🦸‍♀️', bg: 'stadt', farbe: '#ff8fb1',
      kurz: 'Flinka Funkenherz, die Superheldin, hilft allen in der Glitzerstadt.',
      probleme: ['ein Kätzchen sitzt hoch oben fest', 'die Regenbogenbrücke klemmt', 'alle Strassenlaternen sind ausgegangen'],
      geschichten: [
        {
          id: 'sh-turm', titel: 'Flinka und das Kätzchen auf dem Turm', kurz: 'Knopf ist auf die Turmuhr geklettert.',
          cast: ['flinka', 'knopf', 'otti'],
          seiten: [
            'Hinter dem Funkentor liegt die Glitzerstadt. Die Häuser sind bunt, die Fenster leuchten. Und auf dem höchsten Dach steht Flinka Funkenherz. Ihr Umhang ist aus Morgenlicht.',
            'Flinka hat eine besondere Kraft. Wenn sie freundlich ist, leuchtet ihr Herz. Und dann kann sie Dinge ganz leicht machen, leicht wie eine Feder.',
            '«Miau!» Ganz oben auf der grossen Turmuhr sitzt Knopf, das schwarze Kätzchen. Knopf wollte einen Schmetterling fangen. Jetzt ist es zu hoch zum Hinunterspringen.',
            { frage: 'Wie hilft Flinka?', wahl: [
              { e: '💗', l: 'Funkenherz', t: 'Flinka legt die Hand aufs Herz. Es leuchtet warm. Sie fliegt hinauf und flüstert: «Ich bin da.» Knopf wird so leicht wie eine Feder und schwebt in ihre Arme.' },
              { e: '🦔', l: 'Mit Otti', t: 'Flinka hebt Otti auf ihre Schultern. Otti ruft ganz ruhig: «Knopf, schau mich an. Ein Pfötchen nach dem anderen.» Knopf klettert langsam zu ihnen.' }
            ] },
            'Unten auf dem Platz klatschen alle. Knopf schnurrt und reibt sein Köpfchen an Flinkas Umhang.',
            '«Bist du nicht müde vom Retten?», fragt Otti. Flinka lacht. «Doch, manchmal. Aber ein Schnurren macht mich wieder munter.»',
            'Die Turmuhr schlägt: Bimm, bamm. Zeit für den Abend. Flinka winkt, und ihr Umhang leuchtet wie ein Sonnenaufgang.'
          ],
          lehre: 'Ruhig bleiben und gut zureden hilft beim Retten.'
        },
        {
          id: 'sh-muede', titel: 'Der Tag, an dem Flinka müde war', kurz: 'Auch Superheldinnen brauchen eine Pause.',
          cast: ['flinka', 'hasi', 'kiki', 'glimmbot'],
          seiten: [
            'Heute leuchtet Flinkas Herz nur ganz schwach. Sie gähnt. Sie hat die ganze Woche geholfen: Bälle aus Bäumen geholt, Brücken repariert, Kätzchen gerettet.',
            '«Ich bin eine Superheldin», sagt Flinka. «Ich darf doch nicht müde sein.» Glimmbot blinkt besorgt. «Doch. Jedes Licht braucht Pausen. Sogar ich.»',
            'Hasi sagt nichts. Hasi holt eine weiche Decke und legt sie Flinka um die Schultern. Dann zeigt Hasi auf die Hängematte zwischen zwei Laternen.',
            { frage: 'Was tut Flinka gut?', wahl: [
              { e: '🎵', l: 'Ein Lied', t: 'Kiki nimmt das goldene Mikrofon und singt ganz leise: «Ruh dich aus, du Heldin klein, heut darfst du einfach du sein.» Flinka summt mit.' },
              { e: '🍵', l: 'Ein Tee', t: 'Glimmbot bringt einen warmen Kamillentee. Flinka trinkt ganz langsam. Mit jedem Schluck wird ihr Bauch warm und ihr Kopf ruhig.' }
            ] },
            'Flinka schläft ein bisschen. Und während sie schläft, passen ihre Freunde auf die Glitzerstadt auf: Glimmbot leuchtet, Kiki singt, Hasi winkt allen freundlich zu.',
            'Als Flinka aufwacht, strahlt ihr Herz wieder hell. «Ihr seid auch Helden», sagt sie. Hasi wird ein bisschen rot an den Ohren.',
            'Am Abend sitzen alle zusammen auf dem Dach. Niemand muss heute etwas retten. Sie schauen einfach in die Sterne.'
          ],
          lehre: 'Ausruhen ist auch stark.'
        },
        {
          id: 'sh-team', titel: 'Das Rettungsteam von Glitzerstadt', kurz: 'Die Regenbogenbrücke klemmt. Alle helfen mit.',
          cast: ['flinka', 'zahn', 'nova', 'hasi'],
          seiten: [
            'Piep, piep! Der Rettungsruf blinkt. Die Regenbogenbrücke klemmt. Auf der anderen Seite wartet ein Bus voller Kinder, die nach Hause wollen.',
            'Flinka ruft ihr Team: das Zahnböcklein mit den Feenflügeln, Nova mit dem Werkzeugkoffer und Hasi mit dem grossen Rucksack. «Rettungsteam, los geht\'s!»',
            'An der Brücke sehen sie es: Eine Farbe ist herausgerutscht. Zwischen Gelb und Blau fehlt das Grün. Darum kann sich die Brücke nicht mehr ausrollen.',
            { frage: 'Wo finden sie Grün?', wahl: [
              { e: '🌿', l: 'Im Park', t: 'Das Zahnböcklein fliegt in den Park. Dort sammelt es Tautropfen von grünen Blättern. Jeder Tropfen glitzert grün wie ein kleiner Smaragd.' },
              { e: '🧰', l: 'Im Koffer', t: 'Nova öffnet den Werkzeugkoffer. Ganz unten liegt ein grüner Leuchtstift. «Für Notfälle», piepst Nova stolz.' }
            ] },
            'Hasi sagt nichts. Hasi zeigt auf die Lücke und hält die Brücke mit beiden Pfoten fest, damit sie nicht wackelt. Flinka lässt ihr Herz leuchten und macht alles ganz leicht.',
            'Dann passt das Grün genau in die Lücke. Klick! Die Regenbogenbrücke rollt sich aus, bunt und weich wie ein Teppich.',
            'Der Bus fährt langsam hinüber. Die Kinder winken aus allen Fenstern. «Danke, Rettungsteam!» Und das Team winkt zurück, bis der Bus ganz klein ist.'
          ],
          lehre: 'Jeder kann etwas anderes gut. Zusammen sind wir ein Team.'
        },
        {
          id: 'sh-bande', titel: 'Die Bande und der müde Mond', kurz: 'Fünf Kinder mit Superkräften helfen zusammen.',
          cast: ['luma', 'zippi', 'bolt', 'tiko', 'pip'],
          seiten: [
            'In der Glitzerstadt gehen fünf Kinder zusammen zur Schule: Zippi, Bolt, Luma, Tiko und Pip. Ganz normale Kinder. Nur hat jedes eine kleine Superkraft. Darum nennen alle sie: die Bande.',
            'Heute Abend ist etwas komisch. Der Mond über der Glitzerstadt leuchtet nur noch ganz schwach. «Er sieht so müde aus», sagt Luma leise.',
            'Tiko setzt seinen Weltraumhelm auf und schwebt hinauf. Dann ruft er: «Der Mond hat ein Stück Licht verloren! Es ist in den Stadtpark gefallen.»',
            { frage: 'Wer findet das Mondlicht im Park?', wahl: [
              { e: '🐿️', l: 'Zippi', t: 'Zippi saust mit dem Raketen-Rucksack einmal um den ganzen Park, wusch, und entdeckt etwas Glitzerndes unter einer Bank.' },
              { e: '🐭', l: 'Pip', t: 'Pip wird winzig klein und fragt die Käfer im Gras. Ein kleiner Käfer zeigt mit dem Fühler: «Dort, unter dem Blatt!»' },
              { e: '🤖', l: 'Bolt', t: 'Bolt hebt mit seinen Magnet-Händen einen grossen Stein hoch. Darunter liegt etwas, das ganz zart leuchtet.' }
            ] },
            'Es ist das verlorene Mondlicht, so klein wie eine Murmel. Luma macht eine Schutzblase darum, damit es nicht zerbricht.',
            'Tiko trägt die Blase ganz langsam hinauf bis zum Mond. Und plopp: Der Mond leuchtet wieder hell und rund.',
            'Die Bande sitzt auf der Parkbank und schaut nach oben. «Allein hätte es keiner geschafft», sagt Zippi. «Aber zusammen schon.» Der Mond zwinkert ihnen zu. Gute Nacht, Bande.'
          ],
          lehre: 'Zusammen schaffen wir, was allein zu schwer ist.'
        }
      ]
    },
    {
      id: 'piraten', bild: '', der: 'die Pirateninsel', im: 'auf der Pirateninsel', name: 'Pirateninsel', tor: 'Muscheltor', e: '🏴‍☠️', bg: 'piraten', farbe: '#ffd27a',
      kurz: 'Mit Käpt\'n Traumli und dem Schiff «Muschelmöwe» über das glitzernde Meer.',
      probleme: ['die Schatzkarte ist ins Wasser gefallen', 'der Wind ist eingeschlafen', 'eine Möwe hat ihr Nest verloren'],
      geschichten: [
        {
          id: 'pi-schatz', titel: 'Der Schatz der Glitzerbucht', kurz: 'Eine alte Karte, ein X und eine Überraschung.',
          cast: ['fompa', 'otti', 'kiki'],
          seiten: [
            'Hinter dem Muscheltor rauscht das Meer. Am Steg schaukelt die «Muschelmöwe», ein kleines Piratenschiff mit gestreiften Segeln. Am Steuer steht Käpt\'n Traumli mit einem viel zu grossen Hut.',
            '«Ahoi, Matrosen!», ruft Traumli. «Ich habe eine Schatzkarte gefunden.» Auf der Karte ist eine Bucht gemalt und ein grosses rotes X.',
            'Otti zieht das Segel hoch. Kiki singt ein Seemannslied ins goldene Mikrofon: «Hoch die Segel, ho-ho-ho!» Der Wind bläst, und die Muschelmöwe saust los.',
            { frage: 'Welchen Weg nehmen sie?', wahl: [
              { e: '🐬', l: 'Mit Delfinen', t: 'Drei Delfine springen neben dem Schiff. «Folgt uns!», schnattern sie und zeigen den schnellsten Weg durch die Wellen.' },
              { e: '🏝️', l: 'Um die Insel', t: 'Sie segeln um eine kleine Palmeninsel. Dort winkt ein Krebs mit beiden Scheren: «Immer der Sonne nach!»' }
            ] },
            'In der Glitzerbucht ist der Sand ganz weiss. Beim roten X graben sie mit kleinen Schaufeln. Tock! Da ist eine Kiste.',
            'In der Kiste liegen keine Goldmünzen. Darin liegen Samen, viele bunte Samen, und ein Zettel: «Pflanzt mich, dann wächst ein Garten für alle.»',
            'Sie pflanzen die Samen am Strand. Und als sie im nächsten Sommer wiederkommen, blüht dort der schönste Garten der Insel. Das ist der beste Schatz.'
          ],
          lehre: 'Ein Schatz, den man teilt, wird immer grösser.'
        },
        {
          id: 'pi-flasche', titel: 'Die Flaschenpost vom Leuchtturm', kurz: 'Jemand auf einer Insel fühlt sich allein.',
          cast: ['fompa', 'eule', 'hasi'],
          seiten: [
            'Eine Flasche schaukelt auf den Wellen. Käpt\'n Traumli fischt sie mit dem Netz heraus. Darin steckt ein Brief, sauber gerollt.',
            'Traumli liest vor: «Ich wohne im Leuchtturm auf der kleinen Felseninsel. Mein Licht hilft allen Schiffen. Aber niemand kommt mich besuchen. Liebe Grüsse, Frau Eule.»',
            'Hasi sagt nichts. Aber Hasi zeigt sofort zum Horizont. Dort blinkt ein Licht: an, aus, an, aus. Der Leuchtturm!',
            { frage: 'Was bringen sie Frau Eule mit?', wahl: [
              { e: '🧁', l: 'Kuchen', t: 'Traumli backt im Schiffsofen einen Muschelkuchen mit Zuckerguss. Das ganze Schiff duftet nach Vanille.' },
              { e: '🐚', l: 'Muscheln', t: 'Hasi sammelt die schönsten Muscheln und fädelt sie zu einer Kette auf. Jede Muschel schimmert anders.' }
            ] },
            'Frau Eule steht schon an der Tür. Sie hat die Muschelmöwe kommen sehen. «Besuch!», ruft sie und plustert sich vor Freude ganz rund auf.',
            'Sie trinken Tee hoch oben im Leuchtturm. Von dort sieht man das ganze Meer. Frau Eule erzählt Geschichten von Schiffen, die sie sicher nach Hause geleitet hat.',
            'Beim Abschied verspricht Traumli: «Wir kommen jeden Sonntag.» Und seitdem blinkt der Leuchtturm sonntags ein bisschen fröhlicher.'
          ],
          lehre: 'Ein Besuch kann ein ganzes Herz hell machen.'
        }
      ]
    },
    {
      id: 'meer', bild: '', der: 'das Korallenreich', im: 'im Korallenreich', name: 'Korallenreich', tor: 'Perlentor', e: '🐠', bg: 'meer', farbe: '#6fe0d0',
      kurz: 'Unter Wasser mit Perla, dem Glitzerfischchen.',
      probleme: ['die Korallen haben ihre Farben verloren', 'eine Perle ist davongerollt', 'die kleine Krabbe findet den Weg nicht'],
      geschichten: [
        {
          id: 'me-konzert', titel: 'Perla und das Korallen-Konzert', kurz: 'Kiki singt unter Wasser, mit einem Blubber-Mikrofon.',
          cast: ['perla', 'kiki', 'otti'],
          seiten: [
            'Hinter dem Perlentor ist alles blau und grün. Lichtstrahlen tanzen durchs Wasser. Otti und Kiki tragen Blubberhelme, damit sie unter Wasser atmen können.',
            'Ein kleines Fischchen schwimmt heran. Seine Schuppen glitzern in allen Farben. «Ich bin Perla. Heute Abend ist das grosse Korallen-Konzert. Aber unsere Sängerin ist heiser.»',
            'Kiki schaut auf das goldene Mikrofon. «Ich könnte singen», sagt Kiki leise. «Aber unter Wasser blubbert alles.»',
            { frage: 'Wie klappt das Singen?', wahl: [
              { e: '🫧', l: 'Blubber-Lied', t: 'Kiki singt einfach los. Jeder Ton wird zu einer schimmernden Blase. Die Blasen steigen hoch und machen oben «plopp», wie kleine Glöckchen.' },
              { e: '🐚', l: 'Muschelhorn', t: 'Perla bringt eine grosse Muschel. Kiki singt hinein, und die Muschel macht die Stimme warm und weit, bis ins ganze Korallenreich.' }
            ] },
            'Alle kommen zum Konzert: Seesterne, Krabben, ein Tintenfisch mit Fliege. Die Korallen leuchten bei jedem Ton in einer anderen Farbe.',
            'Otti trommelt mit zwei Muscheln den Takt. Perla tanzt Kreise. Und ganz am Schluss singen alle zusammen, sogar die heisere Sängerin, ganz leise.',
            'Auf dem Heimweg summt Kiki noch lange. Und im Wasser hinter ihnen glitzern die letzten kleinen Blasen wie Sterne.'
          ],
          lehre: 'Mut ist, wenn man es trotzdem probiert.'
        },
        {
          id: 'me-tilda', titel: 'Oma Tilda findet den Weg', kurz: 'Eine alte Schildkröte hat vergessen, wo sie wohnt.',
          cast: ['tilda', 'perla', 'nova'],
          seiten: [
            'Auf einem Felsen sitzt Oma Tilda, die alte Meeresschildkröte. Sie ist schon hundert Jahre alt. Heute schaut sie ein bisschen verwirrt. «Wo wohne ich bloss?», murmelt sie.',
            'Perla schwimmt zu ihr. «Keine Sorge, Oma Tilda. Wir helfen dir.» Nova kommt mit einem Blubberhelm angeschwommen. Seine Lichter blinken freundlich.',
            '«Ich weiss nur noch», sagt Oma Tilda, «vor meinem Haus wächst eine rosa Koralle. Und es riecht nach Seegras.»',
            { frage: 'Wie suchen sie?', wahl: [
              { e: '🔦', l: 'Mit Licht', t: 'Nova leuchtet mit seinen Augen in jede Höhle. Da ist eine blaue Koralle, da eine gelbe … und dort hinten schimmert etwas Rosa!' },
              { e: '👃', l: 'Nach Seegras', t: 'Perla schnuppert im Wasser. «Hier riecht es nach Seegras!» Sie folgen dem Duft, bis sie eine rosa Koralle sehen.' }
            ] },
            'Oma Tilda lächelt so breit, dass sich alle ihre Falten freuen. «Da ist mein Haus! Mein Lieblingsstein, mein Seegrasbett.»',
            'Zum Dank erzählt sie eine Geschichte von früher, als sie selbst noch klein war und mit den Delfinen um die Wette schwamm.',
            'Perla verspricht: «Ich besuche dich jeden Tag und zeige dir den Weg.» Und Oma Tilda kuschelt sich zufrieden ins Seegras.'
          ],
          lehre: 'Geduld und Freundlichkeit helfen den Älteren.'
        }
      ]
    },
    {
      id: 'dino', bild: '', der: 'das Dino-Tal', im: 'im Dino-Tal', name: 'Dino-Tal', tor: 'Farntor', e: '🦕', bg: 'dino', farbe: '#9be37c',
      kurz: 'Grosse Farne, sanfte Dinos und Brummi, der kleine Langhals.',
      probleme: ['ein Dino-Ei ist davongerollt', 'der Bach ist ausgetrocknet', 'Brummi hat sich im Farn verlaufen'],
      geschichten: [
        {
          id: 'di-ei', titel: 'Brummi und das Riesen-Ei', kurz: 'Ein Ei rollt davon, und alle laufen hinterher.',
          cast: ['brummi', 'otti', 'flori'],
          seiten: [
            'Hinter dem Farntor wachsen Farne, so gross wie Bäume. Und dort wohnt Brummi, der kleine Langhals-Dino. Sein Hals ist lang, seine Stimme tief: «Brummm!»',
            '«Otti, Flori, schnell!», ruft Brummi. «Mamas Ei ist den Hügel hinuntergerollt!» Das Ei ist gross und gesprenkelt, wie ein Fussball mit Punkten.',
            'Das Ei rollt und rollt, über Moos und Steine, bis es in einem weichen Farnbett liegen bleibt. Puh. Es ist ganz geblieben.',
            { frage: 'Wie bringen sie das Ei zurück?', wahl: [
              { e: '🛷', l: 'Blätterschlitten', t: 'Flori baut aus einem grossen Blatt einen Schlitten. Ganz langsam ziehen sie das Ei den Hügel hinauf. Otti schiebt von hinten.' },
              { e: '🧺', l: 'Im Korb', t: 'Brummi trägt einen Korb mit seinem langen Hals. Otti und Flori legen Moos hinein und das Ei obendrauf. Ganz sanft schaukelt es nach Hause.' }
            ] },
            'Mama Langhals wartet schon. Sie legt das Ei in das warme Nest. Und dann: Knack! Ein kleiner Riss. Noch ein Riss.',
            'Heraus schaut ein winziger Dino mit grossen Augen. «Piep!», macht er. Brummi staunt. «Ich bin jetzt grosser Bruder!»',
            'Brummi singt dem kleinen Dino sein erstes Schlaflied: «Brummm, brummm, schlaf schön.» Und der Kleine schläft sofort ein.'
          ],
          lehre: 'Behutsam sein ist eine Superkraft.'
        },
        {
          id: 'di-rennen', titel: 'Das grosse Dino-Wettrennen', kurz: 'Wer gewinnt, wenn alle einander helfen?',
          cast: ['brummi', 'zahn', 'hasi'],
          seiten: [
            'Im Dino-Tal ist heute Festtag. Alle machen beim grossen Wettrennen mit: Brummi, das Zahnböcklein, Hasi und viele kleine Dinos. Am Ziel hängt eine Girlande aus Blumen.',
            '«Auf die Plätze, fertig, los!» Alle rennen. Hasi hoppelt schnell, das Zahnböcklein flattert, Brummi stapft mit grossen Schritten.',
            'Da stolpert ein kleiner Dino über eine Wurzel. Er sitzt im Gras und schaut traurig auf sein Knie.',
            { frage: 'Was macht das Team?', wahl: [
              { e: '🤝', l: 'Anhalten', t: 'Brummi bleibt stehen. Hasi auch. Hasi sagt nichts, aber Hasi streicht dem Kleinen sanft übers Knie und zeigt einen Daumen nach oben.' },
              { e: '🎒', l: 'Pflaster', t: 'Das Zahnböcklein hat immer ein Pflaster dabei, mit kleinen Sternen drauf. Es klebt es dem Kleinen aufs Knie. «Schon besser?»' }
            ] },
            'Der kleine Dino lacht wieder. Brummi beugt seinen langen Hals hinunter. «Steig auf!» Und so laufen alle zusammen weiter, ganz gemütlich.',
            'Sie kommen als Letzte ins Ziel. Aber alle anderen klatschen am lautesten für sie.',
            'Die Blumengirlande bekommen sie zu viert. «Das war das schönste Rennen», sagt der kleine Dino. Und alle finden: Er hat recht.'
          ],
          lehre: 'Helfen ist wichtiger als Gewinnen.'
        }
      ]
    },
    {
      id: 'schloss', bild: '', der: 'das Wolkenschloss', im: 'im Wolkenschloss', name: 'Wolkenschloss', tor: 'Wolkentor', e: '🏰', bg: 'schloss', farbe: '#c9a8ff',
      kurz: 'Prinzessin Lunara, ihre Erfindungen und drei Kätzchen.',
      probleme: ['der Regenbogen hat ein Loch', 'die Kätzchen sind verschwunden', 'das Schloss ist von Wolken zugedeckt'],
      geschichten: [
        {
          id: 'sc-kaetzchen', titel: 'Die Kätzchen im Wolkenschloss', kurz: 'Mimi sucht Flocke und Knopf. Wo sind sie bloss?',
          cast: ['lunara', 'mimi', 'flocke', 'knopf'],
          seiten: [
            'Hinter dem Wolkentor schwebt ein Schloss auf weichen Wolken. Die Türme sind rosa und weiss, und überall hängen kleine Laternen. Hier wohnt Prinzessin Lunara.',
            '«Mimi!», ruft Lunara. «Flocke und Knopf sind weg. Sie waren gerade noch beim Frühstück.» Mimi, die Kätzchen-Kommissarin, holt ihre Leucht-Lupe heraus. «Ein Fall für mich!»',
            'Mimi findet Spuren: kleine Pfotenabdrücke aus Mehl. Sie führen die Treppe hinauf. Und dann, ganz leise, hört sie ein Kichern.',
            { frage: 'Wo schaut Mimi nach?', wahl: [
              { e: '🍳', l: 'In der Küche', t: 'In der Küche duftet es nach Zimt. Auf dem Tisch steht eine Schüssel mit Teig. Aber Flocke und Knopf sind nicht da, nur noch mehr Mehlspuren.' },
              { e: '🗼', l: 'Im Turm', t: 'Im Turm steht eine Truhe. Darin raschelt es. Aber nein, da ist nur ein Wollknäuel. Und eine neue Spur, die wieder hinunter führt.' }
            ] },
            'Die Spuren führen in den Saal. Dort steht ein grosser Kuchen mit schiefem Zuckerguss. Daneben sitzen Flocke und Knopf, voller Mehl, mit grossen Augen.',
            '«Überraschung!», rufen sie. «Heute ist doch dein Prinzessinnen-Tag, Lunara!» Lunara hat es ganz vergessen. Sie lacht und drückt beide fest an sich.',
            'Dann feiern alle zusammen. Mimi steckt ihre Lupe weg. «Fall gelöst», schnurrt sie. «Und er schmeckt nach Zimt.»'
          ],
          lehre: 'Überraschungen für andere machen am meisten Freude.'
        },
        {
          id: 'sc-regenbogen', titel: 'Lunara flickt den Regenbogen', kurz: 'Eine Erfinderin, ein Loch und viele Farben.',
          cast: ['lunara', 'glimmbot', 'otti'],
          seiten: [
            'Vom Wolkenschloss führt ein Regenbogen hinunter in den Zauberwald. Aber heute hat er ein Loch, genau in der Mitte. Niemand kann hinüber.',
            'Prinzessin Lunara krempelt die Ärmel hoch und öffnet ihren Werkzeug-Gürtel. Darin sind ein Stern-Magnet, ein Lichtfaden und eine winzige Wolkenschere.',
            'Glimmbot summt heran und leuchtet auf die Lücke. Otti winkt von unten aus dem Wald. «Ich komme rauf und helfe!»',
            { frage: 'Womit flicken sie das Loch?', wahl: [
              { e: '🧵', l: 'Lichtfaden', t: 'Lunara näht mit dem Lichtfaden, Stich für Stich. Glimmbot hält die Lampe. Jeder Stich leuchtet in einer neuen Farbe.' },
              { e: '☁️', l: 'Wolkenflicken', t: 'Lunara schneidet mit der Wolkenschere ein weiches Stück Wolke ab. Glimmbot färbt es bunt mit seinem Licht. Es passt genau ins Loch.' }
            ] },
            'Otti klettert vorsichtig hinauf und hilft beim Festdrücken. Fest, fester, geschafft! Der Regenbogen leuchtet wieder ganz.',
            '«Ist das eine Erfindung?», fragt Otti. Lunara nickt. «Eine Erfindung ist einfach eine gute Idee, die man ausprobiert.»',
            'Dann rutschen alle drei den Regenbogen hinunter, in den Zauberwald. Juhuu! Unten landen sie weich im Moos und lachen.'
          ],
          lehre: 'Probieren ist der Anfang jeder Erfindung.'
        }
      ]
    }
  ];

  /* Vorschläge fürs «Erfinden mit Mila» */
  var ERFINDEN = {
    helden: ['otti', 'flinka', 'zippi', 'bolt', 'luma', 'tiko', 'pip', 'nova', 'kiki', 'zahn', 'hasi', 'lunara', 'mimi', 'brummi', 'fompa'],
    freunde: ['otti', 'kometli', 'zippi', 'bolt', 'luma', 'tiko', 'pip', 'flocke', 'knopf', 'glimmbot', 'perla', 'eule', 'flori', 'tilda', 'hasi'],
    loesungen: [
      'sie fragen freundlich um Hilfe',
      'sie halten zusammen und probieren es gemeinsam',
      'sie atmen ruhig und denken nach',
      'sie singen ein mutiges Lied',
      'sie teilen, was sie haben',
      'sie bauen eine kleine Erfindung'
    ]
  };

  window.WELTEN = { FIGUREN: FIGUREN, WELTEN: WELTEN, ERFINDEN: ERFINDEN };
})();
