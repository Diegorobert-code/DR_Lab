/* daten.js – «Hasis Kino und Tipps» (inhalt/inhalt.js): 10 stille Geschichten, 30 Schilder-Tipps, 20 Rätsel, 12 Werkbank-Ideen.
   Hasi spricht nie: Nur die Erzählerin erzählt, Hasi zeigt mit Gesten und Holzschildern.
   Eigene Figuren, keine Marken. Keine Heil-, Gesundheits- oder Geldversprechen. */
(function () {
  'use strict';
  function s(id, tag, e, t, kurz, seiten, lehre) { return { id: id, tag: tag, e: e, t: t, kurz: kurz, seiten: seiten, lehre: lehre }; }
  var GESCHICHTEN = [
    s('g1', 'termine', '🔔', 'Lina und der vergessene Kuchen', 'Eine Bäckerin, zu viele Zettel.', [
      'Lina hat eine kleine Bäckerei an der Ecke. Am Montag klebt sie fünf gelbe Zettel an die Kasse. Am Dienstag sind es neun.',
      'Am Mittwoch kommt Herr Brunner und fragt nach seinem Geburtstagskuchen. Lina wird rot. Der Zettel liegt unter dem Mehlsack.',
      'Am Abend geht Lina über die Nachtstrasse. In Hasis Laden brennt Licht. Hasi verbeugt sich und hebt ein Holzschild: «Zeig dein Problem.»',
      'Lina zeigt den Stapel Zettel. Hasi nickt, öffnet das Regal mit dem goldenen Schlüssel und legt einen Würfel mit einer Glocke auf den Tresen.',
      'Jetzt meldet sich am Vorabend eine kleine Erinnerung: «Morgen: Kuchen für Herrn Brunner.» Die Zettel an der Kasse sind weg. Hasi hebt den Daumen.'
    ], 'Ein Ort für Termine ist besser als neun Zettel.'),
    s('g2', 'reden', '🎙️', 'Remo redet lieber', 'Ein Velomechaniker mit öligen Händen.', [
      'Remo flickt Velos. Seine Hände sind immer schwarz vom Öl. Tippen auf dem Handy? Unmöglich.',
      'Trotzdem will er jeden Abend aufschreiben, was er repariert hat. Meistens vergisst er es.',
      'Hasi tippt sich an den Mund und zeigt dann auf ein Blatt, das sich von selbst füllt.',
      'Remo probiert es: Er redet einfach, und der Text erscheint. «Velo von Frau Keller: neue Kette, Bremse eingestellt.»',
      'Am Abend kopiert Remo die Liste und schickt sie an seine Kundinnen. Hasi wischt sich lautlos eine Freudenträne weg.'
    ], 'Wer nicht tippen kann, darf reden.'),
    s('g3', 'familie', '🌙', 'Ein Abend ohne Streit', 'Zwei Kinder, ein Bett, eine Geschichte.', [
      'Bei Familie Sommer ist das Zubettgehen jeden Abend ein kleines Theater. Noch ein Glas Wasser, noch ein Spiel, noch ein Lied.',
      'Papa Leo ist müde. Er geht noch kurz in Hasis Laden, nur zum Schauen.',
      'Hasi gähnt, legt die Pfoten unter die Wange und lächelt. Dann zeigt er auf einen Würfel mit einem Mond.',
      'Am Abend erzählen Otti und Kiki eine Geschichte vom Zauberwald. Die Kinder hören zu, das Licht wird langsam dunkler.',
      'Nach der dritten Seite ist es still im Kinderzimmer. Leo flüstert: «Danke, Hasi.» Irgendwo auf der Nachtstrasse verbeugt sich ein Hase.'
    ], 'Ein ruhiges Ritual hilft der ganzen Familie.'),
    s('g4', 'familie', '🌹', 'Oma Tilda ruft an', 'Ein Knopf statt zwanzig.', [
      'Oma Tilda hat ein neues Handy. Es hat sehr viele Knöpfe. Sie findet nie den richtigen, um ihre Enkelin anzurufen.',
      'Ihre Enkelin Nora geht mit ihr zu Hasi. Hasi sucht seine Brille, findet sie auf dem Kopf und lacht lautlos. Oma Tilda lacht mit.',
      'Dann legt Hasi einen Würfel mit einer Rose auf den Tresen: ein Bildschirm mit grossen Fotos. Ein Foto antippen heisst anrufen.',
      'Am Sonntag tippt Oma Tilda auf Noras Foto. Es klingelt. «Hallo Oma!»',
      'Seitdem ruft Oma Tilda jeden Sonntag an. Hasi hat dafür ein neues Holzschild gemalt: «Ein Knopf genügt.»'
    ], 'Einfach ist nicht wenig. Einfach ist freundlich.'),
    s('g5', 'hund', '🐶', 'Wer geht mit Flocke raus?', 'Ein Hund, vier Familienmitglieder.', [
      'Familie Huber hat einen kleinen Hund namens Flocke. Jeden Morgen dieselbe Frage: Wer geht raus?',
      'Manchmal gehen zwei. Manchmal keiner. Flocke schaut dann traurig zur Tür.',
      'Hasi macht mit den Pfoten Hundeohren und wedelt mit seinem Stummelschwanz. Dann zeigt er auf einen Würfel mit einer Pfote.',
      'Jetzt sieht die ganze Familie auf einem Blick, wer heute dran ist. Die Kinder bekommen für jeden Spaziergang einen Stern.',
      'Flocke ist zufrieden. Und Hasi bekommt einen Stups mit der Hundenase, ganz ohne Worte.'
    ], 'Wenn alle sehen, wer dran ist, gibt es weniger Streit.'),
    s('g6', 'laden', '🧮', 'Der Markttag von Mara', 'Gemüse, Preise und ein Rechner.', [
      'Mara verkauft am Samstag Gemüse auf dem Markt. Drei Rüebli, zwei Salate, ein Kürbis: Sie rechnet im Kopf und verrechnet sich oft.',
      'An einem Abend kommt sie zu Hasi. Hasi zählt an den Pfoten und nickt.',
      'Er zeigt ihr die Werkbank. Dort baut Mara mit wenigen Tipps einen eigenen Preisrechner, mit ihrem Namen und ihrer Lieblingsfarbe Grün.',
      'Am Samstag tippt sie Menge und Preis, und die Summe steht da. Die Schlange vor dem Stand wird kürzer.',
      'Am Abend legt Mara ein Rüebli auf Hasis Tresen. Hasi verbeugt sich so tief, dass seine Ohren den Boden berühren.'
    ], 'Kleine Werkzeuge können einen grossen Tag leichter machen.'),
    s('g7', 'idee', '💡', 'Finns Quiz für den Turnverein', 'Ein Trainer, zwanzig Kinder.', [
      'Finn trainiert im Turnverein. Er will den Kindern die Regeln für das Völkerballspiel erklären, aber niemand hört lange zu.',
      'Hasi hält ein Fragezeichen hoch, dann eine Glühbirne.',
      'Auf der Werkbank baut Finn ein kleines Quiz: fünf Fragen, drei Antworten, ein Stern für jede richtige.',
      'Im nächsten Training spielen die Kinder das Quiz auf dem Tablet. Alle wollen die meisten Sterne.',
      'Und die Regeln? Die kennt jetzt jedes Kind. Hasi klatscht lautlos in die Pfoten.'
    ], 'Lernen geht leichter, wenn es ein Spiel ist.'),
    s('g8', 'kopf', '👣', 'Ein Schritt für Jonas', 'Wenn alles zu viel ist.', [
      'Jonas sitzt am Abend auf einer Bank auf der Nachtstrasse. In seinem Kopf drehen sich hundert Gedanken.',
      'Hasi kommt aus dem Laden, setzt sich neben ihn und wartet. Er sagt nichts. Er spricht ja nie.',
      'Dann zeigt Hasi mit zwei Fingern einen kleinen Schritt. Und hebt ein Schild: «Nur einer.»',
      'Jonas überlegt. Ein Schritt. Morgen zuerst die eine Mail schreiben. Nur die eine.',
      'Hasi nickt. Wenn es schwer bleibt, zeigt er auf ein zweites Schild: «Rede mit einem Menschen, dem du vertraust.» Dann gehen beide nach Hause.'
    ], 'Ein kleiner Schritt ist auch ein Schritt. Und Hilfe holen ist mutig.'),
    s('g9', 'tanz', '💃', 'Die Tanzschuhe von Frau Keller', '1, 2, 3 in der Küche.', [
      'Frau Keller hat rote Tanzschuhe im Schrank. Sie hat sie nie getragen. «Ich kann ja nicht tanzen», sagt sie.',
      'Hasi tanzt drei kleine Schritte auf dem Ladenboden und tippt dann auf die Eins.',
      'Er zeigt ihr einen Würfel mit Musik. In der Küche zählt eine freundliche Band mit: 1, 2, 3. Pause. 5, 6, 7.',
      'Zuerst wackelt Frau Keller. Nach einer Woche dreht sie sich schon. Nach einem Monat trägt sie die roten Schuhe.',
      'Am Strassenfest tanzt sie mit ihrem Nachbarn. Hasi schaut aus dem Ladenfenster und wippt lautlos mit.'
    ], 'Es ist nie zu spät für den ersten Schritt.'),
    s('g10', 'idee', '🥕', 'Tinkos goldenes Rüebli', 'Wie eine Idee zum Werkzeug wird.', [
      'Gegenüber von Hasis Laden ist Tinkos Werkstatt. Dort hämmert, summt und leuchtet es die ganze Nacht.',
      'Eines Abends bringt die Coiffeuse Fina einen Brief in Hasis Laden. Darauf steht: «Ich brauche etwas, damit meine Kundinnen ihre Termine nie verpassen.»',
      'Hasi liest den Brief, nickt und trägt ihn über die Strasse. Er legt ein goldenes Rüebli dazu. Das heisst bei Tinko: Bitte, es ist wichtig.',
      'Tinko baut die ganze Nacht. Am Morgen steht ein neuer Würfel in Hasis Regal, in Finas Farben.',
      'Fina kommt herein und strahlt. Hasi hält ein frisch gemaltes Schild hoch: «Deine Idee. Unser Werkzeug.»'
    ], 'Jede gute Idee beginnt mit einem Brief.')
  ];

  function k(id, tag, e, t, x, tipp) { return { id: id, tag: tag, e: e, t: t, x: x, tipp: tipp }; }
  var TIPPS = [
    k('t1', 'ordnung', '📌', 'Ein Ort für alles', 'Termine an einem Ort, Notizen an einem Ort. Wer an drei Orten sucht, findet nie.', 'Heute: alle Zettel an einen Ort legen.'),
    k('t2', 'ordnung', '⏰', 'Erinnerung am Vorabend', 'Eine Erinnerung am Vorabend hilft mehr als eine fünf Minuten vorher. Dann bleibt Zeit zum Vorbereiten.', 'Probiere bei deinem nächsten Termin eine Erinnerung am Vorabend.'),
    k('t3', 'ordnung', '✅', 'Drei Punkte genügen', 'Eine Liste mit drei Punkten wird fertig. Eine Liste mit zwanzig macht müde.', 'Schreib für morgen nur drei Dinge auf.'),
    k('t4', 'ordnung', '🧹', 'Freitag ist Aufräumtag', 'Einmal pro Woche fünf Minuten: alte Listen löschen, Erledigtes abhaken.', 'Stell dir eine Erinnerung für Freitag, 16 Uhr.'),
    k('t5', 'ordnung', '🗂️', 'Gute Namen', 'Eine Datei heisst besser «2026-10 Rechnung Mehl» als «Scan 47». So findest du sie in einem Jahr.', 'Benenne heute drei Dateien neu.'),
    k('t6', 'ordnung', '🔕', 'Weniger Pings', 'Nicht jede App muss klingeln. Lass nur das klingeln, was wirklich zählt.', 'Schalte heute bei zwei Apps die Mitteilungen aus.'),
    k('t7', 'sicher', '🔑', 'Ein Passwort pro Ort', 'Wenn ein Passwort überall gleich ist, öffnet ein Schlüssel alle Türen. Besser: jedes Schloss hat seinen eigenen.', 'Ein Passwort-Tresor auf dem Gerät hilft beim Merken.'),
    k('t8', 'sicher', '📨', 'Zuerst schauen, dann tippen', 'Eine Nachricht will Geld oder ein Passwort und macht Druck? Das ist fast immer ein Trick.', 'Im Zweifel die Person auf dem bekannten Weg anrufen.'),
    k('t9', 'sicher', '🔄', 'Updates sind Pflege', 'Updates schliessen Löcher im Zaun. Lieber heute als nächsten Monat.', 'Schau heute nach, ob dein Handy ein Update hat.'),
    k('t10', 'sicher', '💾', 'Zwei Kopien', 'Wichtige Fotos und Dateien gehören an zwei Orte. Ein Gerät kann immer einmal kaputtgehen.', 'Mach heute eine Kopie deiner wichtigsten Fotos.'),
    k('t11', 'sicher', '🙈', 'Weniger teilen', 'Ein Werkzeug soll nur so viele Daten sehen, wie es wirklich braucht. Hasi fragt immer zuerst.', 'Schau bei einer App nach, was sie sehen darf.'),
    k('t12', 'sicher', '👶', 'Kinderdaten bleiben daheim', 'Bei Apps für Kinder gilt: Was das Kind tut, bleibt auf dem Gerät. Keine Werbung, keine fremden Server.', 'Achte beim nächsten Kinderspiel auf den Datenschutz-Hinweis.'),
    k('t13', 'sicher', '⚖️', 'Lizenz lesen', 'Ein fremdes Programm ohne Lizenz darf man nicht weitergeben. Hasi nimmt nur MIT, Apache 2.0 oder BSD.', 'Die Lizenz steht meist in einer Datei namens LICENSE.'),
    k('t14', 'laden', '🏪', 'Öffnungszeiten überall gleich', 'Stehen auf der Tür andere Zeiten als im Netz, kommen Kundinnen umsonst.', 'Vergleiche heute deine Zeiten an allen Orten.'),
    k('t15', 'laden', '💬', 'Antwort in einem Tag', 'Wer innert eines Tages antwortet, wirkt zuverlässig. Eine kurze Antwort genügt: «Danke, ich melde mich morgen.»', 'Leg dir drei Antwort-Vorlagen an.'),
    k('t16', 'laden', '📸', 'Echte Fotos', 'Ein echtes Foto vom Laden oder vom Team wirkt freundlicher als ein Bild aus dem Katalog.', 'Mach heute ein Foto bei gutem Tageslicht.'),
    k('t17', 'laden', '🧾', 'Preise klar zeigen', 'Wer den Preis nicht findet, fragt nicht, sondern geht. Klare Preise sind freundlich.', 'Bau auf der Werkbank einen kleinen Preisrechner.'),
    k('t18', 'laden', '📅', 'Termine bestätigen', 'Eine Bestätigung nach der Buchung und eine Erinnerung am Vorabend: So kommen fast alle.', 'Hasis Erinnerung macht beides.'),
    k('t19', 'laden', '⭐', 'Danke sagen', 'Ein kurzes Danke nach dem Besuch bleibt im Kopf. Ohne Werbung, ohne Gutschein-Druck.', 'Schreib heute einer Stammkundin ein Danke.'),
    k('t20', 'laden', '🗺️', 'Der Weg zu dir', 'Ein Satz wie «Eingang neben der Apotheke» hilft mehr als eine Karte.', 'Ergänze deinen Weg-Satz auf der Webseite.'),
    k('t21', 'familie', '👵', 'Gross und einfach', 'Für ältere Menschen: grosse Schrift, wenige Knöpfe, Fotos statt Namen.', 'Richte für Oma oder Opa einen einfachen Startbildschirm ein.'),
    k('t22', 'familie', '🌙', 'Bildschirm-Abendruhe', 'Eine Stunde vor dem Schlafen lieber Geschichten hören als Videos schauen.', 'Probiere heute eine Hörgeschichte zum Einschlafen.'),
    k('t23', 'familie', '🐾', 'Ämtli sichtbar machen', 'Wer was macht, steht an einem Ort, den alle sehen. Das spart Diskussionen.', 'Mach eine Ämtliliste für diese Woche.'),
    k('t24', 'familie', '🎉', 'Feiern, was klappt', 'Ein Stern für jedes erledigte Ämtli motiviert mehr als jede Mahnung.', 'Vergib heute drei Sterne.'),
    k('t25', 'kopf', '👣', 'Nur der nächste Schritt', 'Ein grosses Ziel wird leichter, wenn man nur den nächsten Schritt plant.', 'Schreib zu deinem Ziel nur den nächsten Schritt auf.'),
    k('t26', 'kopf', '🍵', 'Pausen planen', 'Eine Pause im Kalender ist ein Termin mit dir selbst.', 'Trag dir heute eine Pause von 15 Minuten ein.'),
    k('t27', 'kopf', '🤝', 'Reden hilft', 'Ein Werkzeug kann ordnen, aber keinen Menschen ersetzen. Bei Sorgen: mit jemandem reden, dem du vertraust, oder Fachleute fragen.', 'Die Dargebotene Hand erreichst du in der Schweiz unter 143.'),
    k('t28', 'idee', '🥕', 'Eine Idee, ein Satz', 'Eine gute Werkzeug-Idee passt in einen Satz: «Für wen? Was soll besser werden?»', 'Schreib deine Idee in einen Brief an Hasi.'),
    k('t29', 'idee', '🧪', 'Erst ausprobieren', 'Zuerst mit einer Gratis-Version testen. Erst bezahlen, wenn es wirklich hilft.', 'Probiere ein Werkzeug aus dem Grossen Regal.'),
    k('t30', 'idee', '🧱', 'Klein anfangen', 'Die beste App macht am Anfang nur eine Sache, die aber gut.', 'Streich bei deiner Idee alles bis auf das Wichtigste.')
  ];

  function q(id, e, f, a, info) { return { id: id, e: e, f: f, a: a, r: 0, info: info }; }
  var RAETSEL = [
    q('q1', '🗓', 'Lina vergisst Termine. Welcher Würfel hilft?', ['Erinnerung', 'Preisrechner', 'Zeichentafel'], 'Die Erinnerung meldet sich zur richtigen Zeit.'),
    q('q2', '🎙️', 'Remo hat ölige Hände und will Notizen machen. Was passt?', ['Reinreden statt tippen', 'Ein Quiz', 'Ein Tanzkurs'], 'Das Transkript macht aus Reden Text.'),
    q('q3', '🌙', 'Eine Familie sucht etwas Ruhiges für den Abend. Was zeigt Hasi?', ['Gutenachtgeschichten', 'Einen Preisrechner', 'Ein Radar für Titel'], 'Mondschein erzählt Geschichten zum Einschlafen.'),
    q('q4', '🌹', 'Oma findet den Anruf-Knopf nicht. Was hilft?', ['Ein Bildschirm mit grossen Fotos', 'Mehr Apps', 'Kleinere Schrift'], 'Fotos antippen heisst anrufen.'),
    q('q5', '🐶', 'Wer geht heute mit dem Hund raus? Welcher Würfel?', ['Die Hunde-Familien-App', 'Das Quiz', 'Die Zeichentafel'], 'Dort sieht die ganze Familie, wer dran ist.'),
    q('q6', '🧮', 'Mara rechnet auf dem Markt. Was baut sie auf der Werkbank?', ['Einen Preisrechner', 'Eine Gutenachtgeschichte', 'Ein Passwort'], 'Menge mal Preis, mit ihrem Namen und ihrer Farbe.'),
    q('q7', '❓', 'Finn will Regeln spielerisch erklären. Was baut er?', ['Ein Quiz', 'Eine Erinnerung', 'Einen Tresen'], 'Lernen geht leichter, wenn es ein Spiel ist.'),
    q('q8', '💃', 'Frau Keller will tanzen lernen. Welcher Würfel?', ['Tanzen mit Band im Handy', 'Preisrechner', 'Code-Leser'], 'Mit Zählen und Tipp-Feedback.'),
    q('q9', '🤐', 'Wie zeigt Hasi, was er meint?', ['Mit Gesten und Holzschildern', 'Er redet laut', 'Er schreibt Mails'], 'Hasi spricht nie.'),
    q('q10', '🥕', 'Was bringt Hasi Tinko, wenn es wichtig ist?', ['Ein goldenes Rüebli', 'Einen Regenschirm', 'Eine Trompete'], 'Ein goldenes Rüebli heisst: Bitte, es ist wichtig.'),
    q('q11', '⚖️', 'Welche Lizenz nimmt Hasi für fremde Programme?', ['MIT, Apache 2.0 oder BSD', 'Gar keine', 'Irgendeine'], 'Ohne Lizenz nie.'),
    q('q12', '🔑', 'Wie viele Passwörter sind gut?', ['Ein eigenes pro Ort', 'Eines für alles', 'Gar keines'], 'Jedes Schloss hat seinen eigenen Schlüssel.'),
    q('q13', '📨', 'Eine Nachricht will sofort dein Passwort. Was tust du?', ['Nicht antworten und nachfragen', 'Schnell schicken', 'Weiterleiten an alle'], 'Druck ist fast immer ein Trick.'),
    q('q14', '💾', 'Wo sollen wichtige Fotos liegen?', ['An zwei Orten', 'Nur auf dem Handy', 'Nirgends'], 'Ein Gerät kann kaputtgehen.'),
    q('q15', '✅', 'Welche Liste wird am ehesten fertig?', ['Drei Punkte', 'Zwanzig Punkte', 'Hundert Punkte'], 'Kurz ist stark.'),
    q('q16', '👶', 'Was gilt bei Kinder-Apps?', ['Daten bleiben auf dem Gerät', 'Viel Werbung', 'Alles an fremde Server'], 'Keine Werbung, keine fremden Server.'),
    q('q17', '🧪', 'Wann bezahlst du für ein Werkzeug?', ['Wenn es nach dem Ausprobieren hilft', 'Sofort, ohne Test', 'Nie anschauen'], 'Zuerst gratis ausprobieren.'),
    q('q18', '✉', 'Wie bestellst du ein neues Werkzeug bei Hasi?', ['Mit einem Brief an Hasi', 'Mit einem Anruf bei Hasi', 'Gar nicht'], 'Hasi liest jeden Brief.'),
    q('q19', '👀', 'Was macht «Hasi liest Code»?', ['Hasi prüft deinen Code und zeigt Daumen', 'Hasi löscht alles', 'Hasi singt'], 'Daumen hoch heisst: sauber.'),
    q('q20', '🤝', 'Ein Werkzeug hilft beim Ordnen der Gedanken. Ersetzt es eine Fachperson?', ['Nein, bei Sorgen mit Menschen reden', 'Ja, immer', 'Nur am Sonntag'], 'Werkzeuge helfen, Menschen begleiten.')
  ];

  function u(id, stufe, e, t, kurz, schritte, tipp) { return { id: id, stufe: stufe, tag: stufe, e: e, t: t, kurz: kurz, schritte: schritte, tipp: tipp }; }
  var IDEEN = [
    u('w1', 'liste', '🥖', 'Morgenliste für die Bäckerei', 'Ofen, Teig, Kasse, Tür', ['Auf der Werkbank «Checkliste» wählen.', 'Name: deine Bäckerei.', 'Einträge: Ofen an, Teig ruhen lassen, Kasse zählen, Tür abschliessen.', '«Mitnehmen» tippen und aufs Handy legen.'], 'Jeden Morgen dieselbe Liste spart Kopf.'),
    u('w2', 'liste', '🎒', 'Schultasche-Liste', 'Nie mehr das Turnzeug vergessen', ['Checkliste wählen.', 'Name: «Schultasche».', 'Einträge: Etui, Hefte, Znüni, Turnzeug, Trinkflasche.', 'Mit dem Kind zusammen die Farbe wählen.'], 'Das Kind darf selber abhaken.'),
    u('w3', 'liste', '🧳', 'Ferien-Packliste', 'Einmal bauen, jedes Jahr brauchen', ['Checkliste wählen.', 'Einträge: Pass, Ladegerät, Sonnencreme, Pflaster, Lieblingsbuch.', 'Mitnehmen und vor jeder Reise öffnen.'], 'Nach den Ferien ergänzen, was gefehlt hat.'),
    u('w4', 'liste', '🐶', 'Hunde-Ämtli', 'Wer füttert, wer geht raus?', ['Checkliste wählen.', 'Einträge: Morgenrunde, Futter, Abendrunde, Wasser frisch.', 'Jedem Familienmitglied eine Farbe geben.'], 'Passt gut zu Wäf Wäf.'),
    u('w5', 'rechner', '🥕', 'Marktstand-Rechner', 'Menge mal Preis', ['Preisrechner wählen.', 'Name: dein Stand.', 'Einträge: Rüebli 0.50, Salat 2.00, Kürbis 4.00.', 'Mitnehmen und am Samstag testen.'], 'Runde Preise sind schneller gerechnet.'),
    u('w6', 'rechner', '✂️', 'Coiffeur-Preise', 'Schnitt, Farbe, Föhnen', ['Preisrechner wählen.', 'Einträge: Schnitt 45, Farbe 60, Föhnen 20.', 'Farbe des Salons wählen.'], 'Klare Preise schaffen Vertrauen.'),
    u('w7', 'rechner', '🍰', 'Kuchen-Bestellung', 'Stück, halber, ganzer Kuchen', ['Preisrechner wählen.', 'Einträge: Stück 4.50, halber Kuchen 18, ganzer Kuchen 32.', 'Mitnehmen und an der Kasse brauchen.'], 'Die Kundin sieht die Summe sofort.'),
    u('w8', 'erinnerung', '🔔', 'Erinnerung für Kundinnen', 'Am Vorabend an den Termin denken', ['Erinnerung wählen.', 'Name: dein Geschäft.', 'Text: «Morgen um 10 Uhr: Ihr Termin bei uns.»', 'Mitnehmen und an Kundinnen schicken.'], 'Freundlich, kurz, mit Uhrzeit.'),
    u('w9', 'erinnerung', '💧', 'Pflanzen giessen', 'Jeden Mittwoch', ['Erinnerung wählen.', 'Text: «Mittwoch: Pflanzen giessen.»', 'Mitnehmen.'], 'Kleine Erinnerungen, grosse Wirkung.'),
    u('w10', 'quiz', '⚽', 'Vereins-Quiz', 'Regeln spielerisch lernen', ['Quiz wählen.', 'Fünf Fragen zu den Spielregeln schreiben.', 'Pro Frage drei Antworten, die erste ist richtig.', 'Im Training zeigen.'], 'Kurze Fragen, klare Antworten.'),
    u('w11', 'quiz', '🌍', 'Kurs-Quiz', 'Am Ende einer Lektion', ['Quiz wählen.', 'Drei Fragen zur heutigen Lektion.', 'Mitnehmen und am Schluss spielen.'], 'Wer am Ende spielt, merkt sich mehr.'),
    u('w12', 'quiz', '🎂', 'Geburtstags-Quiz', 'Wie gut kennst du das Geburtstagskind?', ['Quiz wählen.', 'Fünf lustige Fragen zum Geburtstagskind.', 'Am Fest gemeinsam spielen.'], 'Nur liebe Fragen, keine peinlichen.')
  ];

  window.INHALT = {
    app: 'hasi', titel: 'Hasis Kino und Tipps', farbe: '#e8b94a',
    intro: 'Hasi spricht nie. Er zeigt dir stille Geschichten, Tipps auf Holzschildern und Ideen für die Werkbank.',
    fuss: 'Alles bleibt in deinem Browser. Werkzeuge ersetzen keine Fachperson.',
    regale: [
      { id: 'kino', typ: 'geschichten', e: '🎬', titel: 'Stille Geschichten', kurz: '10 Geschichten ohne ein Wort von Hasi', items: GESCHICHTEN },
      { id: 'tipps', typ: 'karten', e: '🪧', titel: 'Hasis Schilder', kurz: '30 Tipps für Alltag und Laden', items: TIPPS,
        gruppen: { ordnung: 'Ordnung', sicher: 'Sicher im Netz', laden: 'Laden und Praxis', familie: 'Familie', kopf: 'Kopf und Ruhe', idee: 'Eigene Idee' } },
      { id: 'raetsel', typ: 'quiz', e: '🧊', titel: 'Welcher Würfel passt?', kurz: '5 Fragen pro Runde', items: RAETSEL },
      { id: 'werkbank', typ: 'uebungen', e: '🔧', titel: 'Werkbank-Ideen', kurz: '12 Bauideen zum Mitnehmen', items: IDEEN,
        gruppen: { liste: 'Checklisten', rechner: 'Preisrechner', erinnerung: 'Erinnerungen', quiz: 'Quiz' } }
    ],
    abzeichen: [
      { e: '🏪', n: 'Hereinspaziert', x: 'Hasis Kino geöffnet', wann: function (s) { return s.tage >= 1; } },
      { e: '🎬', n: 'Kinogast', x: '3 stille Geschichten', wann: function (s) { return s.regal.kino >= 3; } },
      { e: '🍿', n: 'Stammgast', x: 'Alle 10 Geschichten', wann: function (s) { return s.regal.kino >= 10; } },
      { e: '🪧', n: 'Schilderleser', x: '10 Tipps gelesen', wann: function (s) { return s.regal.tipps >= 10; } },
      { e: '🔧', n: 'Werkbank-Profi', x: '3 Ideen gebaut', wann: function (s) { return s.geschafft >= 3; } },
      { e: '🧊', n: 'Würfel-Kenner', x: '3 Rätselrunden', wann: function (s) { return s.runden >= 3; } },
      { e: '🏆', n: 'Alles richtig', x: 'Eine Runde ohne Fehler', wann: function (s) { return s.perfekt >= 1; } },
      { e: '🔥', n: '3 Abende', x: '3 Tage hintereinander', wann: function (s) { return s.serie >= 3; } },
      { e: '❤️', n: 'Lieblinge', x: '5 Mal «Mag ich»', wann: function (s) { return s.mag >= 5; } }
    ]
  };
})();
