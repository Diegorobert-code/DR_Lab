/* daten.js – Wäf Wäfs «Hundeschule» (inhalt/inhalt.js): 40 Übungen in Stufen, 30 Wissenskarten, 20 Rätsel.
   Für Familien mit einem kleinen Hund. Nur Belohnung, nie Strafe. Kurze Einheiten (2 bis 5 Minuten), aufhören, solange es Spass macht.
   Keine tierärztlichen Aussagen: bei Schmerzen, Angst oder Verhaltensproblemen immer Tierarzt oder Fachperson fragen. */
(function () {
  'use strict';
  function u(id, stufe, e, t, kurz, schritte, tipp) { return { id: id, stufe: stufe, tag: stufe, e: e, t: t, kurz: kurz, schritte: schritte, tipp: tipp }; }
  var UEBUNGEN = [
    /* Welpe & Start */
    u('u1', 'start', '📛', 'Auf den Namen hören', 'Name heisst: Schau mich an, es lohnt sich', ['Name einmal fröhlich sagen.', 'Schaut der Hund zu dir: sofort loben und belohnen.', '10 Mal am Tag in ruhigen Momenten.', 'Den Namen nie für Schimpfen brauchen.'], 'Ein Name soll immer etwas Schönes bedeuten.'),
    u('u2', 'start', '✋', 'Hand berühren', 'Nase an die Handfläche', ['Flache Hand nah vor die Nase halten.', 'Stupst die Nase die Hand: klicken oder «Ja!» und belohnen.', 'Hand etwas weiter weg, mal links, mal rechts.', 'Wort dazu: «Touch».'], 'Damit könnt ihr den Hund später überall hinführen, ohne zu ziehen.'),
    u('u3', 'start', '🧘', 'Ruhe auf der Decke', 'Die Decke ist ein schöner Ort', ['Decke auf den Boden legen.', 'Jeder Schritt auf die Decke: belohnen.', 'Legt er sich hin: ruhig mehrere Leckerli nacheinander.', 'Langsam länger warten, bevor die Belohnung kommt.'], 'Ruhig belohnen, nicht aufregen. Ruhe ist das Ziel.'),
    u('u4', 'start', '🎯', 'Klicker kennenlernen', 'Klick heisst: Gleich gibt es etwas', ['Klicken, sofort ein Leckerli geben.', '10 Mal wiederholen, ohne etwas zu verlangen.', 'Schaut der Hund beim Klick auf, hat er es verstanden.'], 'Der Klick ist ein Versprechen. Nach jedem Klick kommt eine Belohnung.'),
    u('u5', 'start', '🎾', 'Spielen mit Regeln', 'Spielzeug kommt und geht', ['Mit einem Spielzeug kurz spielen.', 'Ein Leckerli an die Nase: lässt er los, «Danke» sagen und belohnen.', 'Sofort wieder spielen. So lohnt sich Loslassen.'], 'Kurz spielen, oft aufhören. Dann bleibt es spannend.'),
    u('u6', 'start', '🛁', 'Anfassen ist schön', 'Ohren, Pfoten, Rute', ['Kurz ein Ohr berühren, belohnen.', 'Dann eine Pfote, belohnen.', 'Jeden Tag ein bisschen länger.', 'Zieht der Hund weg: einen Schritt zurück, kürzer machen.'], 'So werden Bürsten und Tierarzt später einfacher.'),
    u('u7', 'start', '🏠', 'Box als Höhle', 'Ein sicherer Rückzugsort', ['Box offen lassen, eine weiche Decke hinein.', 'Leckerli hineinlegen, Hund selbst gehen lassen.', 'Kauknochen in der Box geben.', 'Tür erst kurz schliessen, wenn er entspannt liegt.'], 'Die Box ist nie eine Strafe.'),
    u('u8', 'start', '👀', 'Blickkontakt', 'Schau mich an', ['Leckerli in der Hand zur Faust schliessen.', 'Wartet, bis der Hund von der Hand in dein Gesicht schaut.', 'Sofort klicken und belohnen.', 'Wort dazu: «Schau».'], ''),
    /* Alltag */
    u('u9', 'alltag', '🚪', 'Warten an der Tür', 'Nicht hinausstürmen', ['Hand an die Türfalle legen. Bleibt er stehen: belohnen.', 'Tür einen Spalt öffnen. Wartet er: belohnen, Tür zu.', 'Langsam weiter öffnen.', 'Mit «Los» freigeben und zusammen hinausgehen.'], 'Übt zuerst an der Wohnungstür ohne Ablenkung.'),
    u('u10', 'alltag', '🦴', 'Aus und Tausch', 'Etwas hergeben lohnt sich', ['Hund hat ein Spielzeug. Etwas Besseres an die Nase halten.', 'Lässt er los: «Aus», belohnen, Spielzeug zurückgeben.', 'Oft üben, damit Hergeben nichts Schlimmes ist.'], 'Nie wegreissen. Tauschen statt nehmen.'),
    u('u11', 'alltag', '🍽️', 'Ruhig beim Futter', 'Warten, bis der Napf steht', ['Napf in der Hand, langsam nach unten.', 'Springt er: Napf wieder hoch.', 'Bleibt er ruhig: Napf hinstellen, «Los».'], 'Beim Fressen lassen alle den Hund in Ruhe, auch die Kinder.'),
    u('u12', 'alltag', '👋', 'Besuch begrüssen', 'Vier Pfoten am Boden', ['Vor dem Klingeln: Leckerli bereit.', 'Besuch kommt: Hund auf die Decke schicken oder an die Leine.', 'Alle vier Pfoten am Boden: Besuch darf ihn begrüssen.', 'Springt er: Besuch dreht sich ruhig weg.'], ''),
    u('u13', 'alltag', '🚗', 'Ruhig im Auto', 'Kleine Fahrten zuerst', ['Ins stehende Auto setzen, belohnen, wieder raus.', 'Motor an, belohnen, aus.', 'Kurze Fahrt um den Block.', 'Ziel ist etwas Schönes: Wiese, Park.'], 'Kleine Hunde fahren gesichert in einer Box oder mit Hundegurt.'),
    u('u14', 'alltag', '🪥', 'Bürsten', 'Pflege als Wellness', ['Bürste zeigen, schnuppern lassen, belohnen.', 'Ein Bürstenstrich, belohnen.', 'Jeden Tag ein paar Striche mehr.', 'Aufhören, bevor er unruhig wird.'], 'Ein Maltipoo braucht oft tägliches Bürsten, damit nichts verfilzt.'),
    u('u15', 'alltag', '🔔', 'Ruhig bei der Klingel', 'Klingeln heisst: Decke', ['Klingelton leise abspielen, Leckerli auf die Decke werfen.', 'Viele Male, ohne dass jemand kommt.', 'Lauter werden. Dann echte Klingel.'], 'Das gibt es auch als Geräusch-Training in der Trickschule.'),
    u('u16', 'alltag', '🌳', 'Begegnungen auf dem Weg', 'Andere Hunde in Ruhe passieren', ['Grossen Abstand halten, ruhig vorbeigehen.', 'Schaut er den anderen Hund ruhig an: belohnen.', 'Schaut er zu dir zurück: doppelt belohnen.', 'Abstand langsam kleiner machen.'], 'Nicht jeder Hund will Kontakt. Vorher fragen.'),
    u('u17', 'alltag', '🛗', 'Lift und Treppe', 'Neue Orte in Ruhe', ['Vor dem Lift warten lassen, belohnen.', 'Zusammen hinein, Leckerli in der Kabine.', 'Treppen langsam, kleine Hunde anfangs tragen.'], ''),
    u('u18', 'alltag', '🧸', 'Nein zu Schuhen', 'Eigenes Spielzeug statt Hausschuh', ['Schuhe wegräumen, eigenes Kauspielzeug anbieten.', 'Nimmt er sein Spielzeug: loben.', 'Erwischt er einen Schuh: tauschen gegen sein Spielzeug.'], 'Junge Hunde kauen, weil Kauen beruhigt. Gebt ihnen Erlaubtes.'),
    u('u19', 'alltag', '🩺', 'Tierarzt spielen', 'Zu Hause üben, was dort passiert', ['Kurz ins Ohr schauen, belohnen.', 'Lefze anheben, Zähne anschauen, belohnen.', 'Kurz auf einen Tisch mit rutschfester Matte, belohnen.'], 'So ist der echte Besuch weniger fremd.'),
    u('u20', 'alltag', '🧺', 'Allein im Zimmer', 'Kurz ohne dich', ['Kauknochen geben, kurz aus dem Zimmer gehen.', 'Sofort zurück, bevor er unruhig wird.', 'Langsam länger.'], 'Mehr dazu im Bereich «Allein».'),
    /* Weiter */
    u('u21', 'weiter', '📏', 'Bleib mit Abstand', 'Ein Schritt mehr', ['Sitz, «Bleib», einen Schritt zurück, wieder hin, belohnen.', 'Zwei Schritte. Drei Schritte.', 'Immer zurück zum Hund gehen zum Belohnen.'], 'Lieber kurz und erfolgreich als lang und mit Fehlern.'),
    u('u22', 'weiter', '🏃', 'Rückruf mit Ablenkung', 'Komm, auch wenn es spannend ist', ['Zuerst im Garten mit Schleppleine.', 'Rufen, wenn er nur leicht abgelenkt ist.', 'Kommt er: Party! Das beste Leckerli.', 'Ablenkung langsam steigern.'], 'Nie rufen, um dann etwas Unangenehmes zu machen.'),
    u('u23', 'weiter', '🦶', 'Fuss gehen', 'Nah an deinem Bein', ['Leckerli an deinem Bein halten, ein Schritt, belohnen.', 'Zwei Schritte, drei Schritte.', 'Wort dazu: «Fuss».', 'Kurz üben, dann wieder frei schnuppern lassen.'], ''),
    u('u24', 'weiter', '✋', 'Stopp unterwegs', 'Mitten im Laufen stehen bleiben', ['Hund läuft neben dir, du bleibst stehen.', 'Bleibt er auch stehen: belohnen.', 'Wort dazu: «Stopp».', 'Später aus etwas mehr Abstand.'], 'Ein gutes Notfall-Signal, zum Beispiel vor der Strasse.'),
    u('u25', 'weiter', '🔍', 'Nasenarbeit', 'Leckerli suchen', ['Hund wartet, du legst ein Leckerli sichtbar hin.', '«Such!» Er darf holen.', 'Leckerli unter einem Becher verstecken.', 'Dann im ganzen Zimmer.'], 'Suchen macht Hunde müde und zufrieden. Ideal bei Regen.'),
    u('u26', 'weiter', '🧩', 'Futter-Spiel', 'Futter erarbeiten', ['Futter in ein gefaltetes Tuch wickeln.', 'Oder in eine Kartonrolle mit gefalteten Enden.', 'Hund darf auspacken.'], 'Nur unter Aufsicht, damit er keinen Karton frisst.'),
    u('u27', 'weiter', '🧱', 'Auf etwas steigen', 'Pfoten auf ein Kissen', ['Ein festes Kissen hinlegen.', 'Jede Pfote darauf: belohnen.', 'Alle vier Pfoten: Jackpot!'], 'Das macht Hunde selbstsicher.'),
    u('u28', 'weiter', '⏸️', 'Abbruch-Signal', 'Lass es, komm zu mir', ['Leckerli in der Faust, Hund schnüffelt.', 'Hört er auf zu schnüffeln: «Lass» und aus der anderen Hand belohnen.', 'Später mit einem Leckerli am Boden, Fuss davor.'], 'Hilft, wenn etwas auf dem Weg liegt.'),
    /* Tricks */
    u('u29', 'tricks', '🌀', 'Rolle', 'Einmal ganz herum', ['Hund liegt. Leckerli an der Nase seitlich zur Schulter führen.', 'Folgt er und legt sich auf die Seite: belohnen.', 'Weiter führen über den Rücken.', 'Wort dazu: «Rolle».'], 'Auf weichem Boden üben.'),
    u('u30', 'tricks', '🙇', 'Verbeugen', 'Vorne runter, Po oben', ['Hund steht. Leckerli langsam zwischen die Vorderpfoten führen.', 'Geht die Brust runter und der Po bleibt oben: sofort belohnen.', 'Wort dazu: «Verbeugen».'], 'Ein schöner Abschluss für jede Vorführung.'),
    u('u31', 'tricks', '✋', 'High Five', 'Pfote an die Hand', ['Pfote geben kann er schon.', 'Hand etwas höher halten, Handfläche nach vorn.', 'Berührt die Pfote die Hand: belohnen.'], ''),
    u('u32', 'tricks', '👋', 'Winken', 'Pfote in die Luft', ['Hand für High Five hinhalten, im letzten Moment wegziehen.', 'Pfote in der Luft: belohnen.', 'Wort dazu: «Winken».'], 'Wäf Wäf kann das schon. Fast.'),
    u('u33', 'tricks', '🐾', 'Durch die Beine', 'Slalom durch deine Beine', ['Breitbeinig stehen, Leckerli durch die Beine führen.', 'Kommt er durch: belohnen.', 'Dann ein Schritt, nächste Seite.'], ''),
    u('u34', 'tricks', '🧹', 'Aufräumen', 'Spielzeug in die Kiste', ['Spielzeug bringen lassen, über der Kiste «Aus».', 'Fällt es hinein: Jackpot.', 'Langsam weiter weg von der Kiste.'], 'Der Trick, den alle Eltern lieben.'),
    u('u35', 'tricks', '🐶', 'Männchen', 'Kurz auf den Hinterbeinen sitzen', ['Hund sitzt. Leckerli langsam über die Nase nach oben.', 'Heben sich die Vorderpfoten kurz: belohnen.', 'Nur ganz kurz, nicht zu oft.'], 'Für junge Hunde und Hunde mit Rückenproblemen nicht geeignet. Im Zweifel Tierarzt fragen.'),
    u('u36', 'tricks', '🥱', 'Gähnen auf Wunsch', 'Fängt er an, belohnst du', ['Gähnt der Hund von selbst: «Müde?» sagen und belohnen.', 'Mit der Zeit gähnt er manchmal auf das Wort.'], 'Ein lustiger Trick für Geduldige.'),
    /* Kinder & Hund */
    u('u37', 'kinder', '🧒', 'Leckerli richtig geben', 'Flache Hand, ruhig', ['Leckerli auf die flache Hand legen.', 'Hand ruhig nach unten halten.', 'Hund nimmt es, Kind sagt «Brav».'], 'Kleine Kinder immer mit Erwachsenen zusammen.'),
    u('u38', 'kinder', '🎾', 'Ball rollen', 'Rollen statt werfen', ['Kind rollt den Ball langsam weg.', 'Hund bringt ihn zurück, Erwachsener hilft beim Tausch.', 'Nach fünf Mal Pause.'], 'Nicht hinter dem Hund herrennen. Lieber rollen und warten.'),
    u('u39', 'kinder', '🙈', 'Verstecken', 'Wäf Wäf sucht das Kind', ['Ein Erwachsener hält den Hund.', 'Kind versteckt sich ganz leicht, zum Beispiel hinter dem Sofa.', 'Kind ruft den Namen, Hund findet es, Kind gibt ein Leckerli.'], 'Leichte Verstecke. Der Hund soll Erfolg haben.'),
    u('u40', 'kinder', '🌳', 'Wie ein Baum stehen', 'Wenn der Hund zu wild wird', ['Kind steht ruhig, Arme verschränkt, schaut auf die eigenen Füsse.', 'Hund beruhigt sich, weil nichts passiert.', 'Erwachsener ruft den Hund zu sich.'], 'Das gilt für alle Hunde, auch für fremde.')
  ];

  function w(id, tag, e, t, x, tipp) { return { id: id, tag: tag, e: e, t: t, x: x, tipp: tipp }; }
  var WISSEN = [
    w('w1', 'sprache', '🐕', 'Wedeln heisst nicht immer Freude', 'Eine Rute kann aus Freude wedeln, aber auch aus Aufregung. Schaut den ganzen Hund an: lockerer Körper und weicher Blick heissen meist Freude.'),
    w('w2', 'sprache', '🥱', 'Gähnen kann Stress zeigen', 'Gähnt ein Hund in einer neuen Situation, braucht er vielleicht eine Pause. Gebt ihm Ruhe und etwas Abstand.'),
    w('w3', 'sprache', '👅', 'Nase lecken', 'Schnelles Lecken über die Nase heisst oft: Mir ist das gerade ein bisschen zu viel.'),
    w('w4', 'sprache', '🙃', 'Bauch zeigen', 'Manchmal heisst Bauch zeigen «Kraulen, bitte». Manchmal heisst es «Ich will keinen Streit». Ist der Körper steif, lieber nicht kraulen.'),
    w('w5', 'sprache', '🧊', 'Erstarren', 'Wird ein Hund plötzlich ganz still und steif, will er Abstand. Dann langsam weggehen und ihn in Ruhe lassen.'),
    w('w6', 'sprache', '🙇', 'Spielaufforderung', 'Vorne runter, Po hoch: Das ist die Einladung zum Spielen.'),
    w('w7', 'sprache', '👀', 'Halbmond-Augen', 'Sieht man viel Weiss in den Augen, fühlt sich der Hund unwohl. Abstand geben hilft.'),
    w('w8', 'sprache', '🐾', 'Pfote heben', 'Eine angehobene Pfote kann Unsicherheit zeigen, manchmal auch Spannung beim Schnüffeln.'),
    w('w9', 'sprache', '💤', 'Schlafen ist wichtig', 'Erwachsene Hunde schlafen und dösen oft 12 bis 16 Stunden am Tag, junge Hunde noch mehr. Lasst schlafende Hunde schlafen.'),
    w('w10', 'beduerfnis', '👃', 'Die Nase sieht', 'Hunde riechen viel besser als wir. Schnüffeln auf dem Spaziergang ist für sie wie Zeitung lesen.'),
    w('w11', 'beduerfnis', '🚶', 'Langsame Spaziergänge', 'Ein ruhiger Schnüffel-Spaziergang macht oft zufriedener als schnelles Rennen.'),
    w('w12', 'beduerfnis', '🧠', 'Kopf-Arbeit macht müde', 'Fünf Minuten Suchspiel können so müde machen wie ein langer Spaziergang.'),
    w('w13', 'beduerfnis', '🦴', 'Kauen beruhigt', 'Kauen hilft Hunden, ruhig zu werden. Gebt ihm sichere Kau-Sachen.'),
    w('w14', 'beduerfnis', '🏠', 'Ein eigener Platz', 'Jeder Hund braucht einen ruhigen Ort, an dem ihn niemand stört. Auch nicht die Kinder.'),
    w('w15', 'beduerfnis', '⏰', 'Gleiche Zeiten helfen', 'Feste Zeiten für Futter, Spaziergang und Ruhe geben Sicherheit.'),
    w('w16', 'beduerfnis', '🌡️', 'Hitze im Sommer', 'Im Sommer früh am Morgen und spät am Abend spazieren. Asphalt kann für Pfoten zu heiss sein. Nie im Auto warten lassen.'),
    w('w17', 'beduerfnis', '❄️', 'Winter und Salz', 'Nach dem Spaziergang die Pfoten mit lauwarmem Wasser abspülen, wenn Salz auf den Wegen liegt.'),
    w('w18', 'lernen', '🍬', 'Belohnung im richtigen Moment', 'Hunde verbinden die Belohnung mit dem, was sie gerade tun. Darum hilft der Klicker: Er sagt genau «Das war es».'),
    w('w19', 'lernen', '⏱️', 'Kurz üben', 'Zwei bis fünf Minuten am Stück reichen. Lieber mehrmals am Tag kurz als einmal lang.'),
    w('w20', 'lernen', '🏆', 'Mit Erfolg aufhören', 'Hört auf, wenn es gerade gut geklappt hat. Dann freut sich der Hund aufs nächste Mal.'),
    w('w21', 'lernen', '🙅', 'Warum keine Strafe', 'Strafe macht Angst und zerstört Vertrauen. Belohnen zeigt dem Hund, was er tun soll.'),
    w('w22', 'lernen', '🔁', 'Überall neu', 'Was in der Küche klappt, ist auf der Wiese neu. Jeder Ort muss neu geübt werden.'),
    w('w23', 'familie', '👨‍👩‍👧', 'Alle gleiche Wörter', 'Wenn alle in der Familie die gleichen Wörter brauchen, lernt der Hund schneller. Schreibt sie auf.'),
    w('w24', 'familie', '🧒', 'Kinder und Hund', 'Kleine Kinder und Hunde nie allein lassen, auch nicht den liebsten Hund. Das schützt beide.'),
    w('w25', 'familie', '🤗', 'Lieber kraulen als umarmen', 'Viele Hunde mögen keine Umarmungen. Lieber seitlich an der Brust kraulen.'),
    w('w26', 'familie', '🍫', 'Nicht für Hunde', 'Schokolade, Trauben, Rosinen, Zwiebeln und Xylit-Kaugummi sind für Hunde gefährlich. Gut wegräumen. Im Notfall sofort Tierarzt anrufen.'),
    w('w27', 'familie', '🧳', 'Ferien planen', 'Früh klären: Kommt der Hund mit, oder wer schaut zu ihm? Plätze in Hundepensionen sind in den Ferien schnell voll.'),
    w('w28', 'schweiz', '🏷️', 'Chip und Anmeldung', 'In der Schweiz tragen Hunde einen Mikrochip und sind in einer Datenbank angemeldet. Bei einem Umzug die Adresse anpassen.'),
    w('w29', 'schweiz', '🧾', 'Hundesteuer', 'Die Gemeinde verlangt meist eine Hundesteuer. Die Höhe ist je nach Gemeinde verschieden.'),
    w('w30', 'schweiz', '🌲', 'Leinenpflicht im Wald', 'Viele Kantone haben im Frühling eine Leinenpflicht im Wald, wenn Wildtiere Junge haben. Die Regeln sind je nach Kanton verschieden.')
  ];

  var RAETSEL = [
    { id: 'q1', e: '🙇', f: 'Vorne runter, Po hoch. Was will der Hund?', a: ['Spielen', 'Schlafen', 'Fressen'], r: 0 },
    { id: 'q2', e: '🥱', f: 'Ein Hund gähnt in einer neuen Situation. Was kann das heissen?', a: ['Es ist ihm zu viel', 'Er ist immer müde', 'Er hat Hunger'], r: 0 },
    { id: 'q3', e: '⏱️', f: 'Wie lange übt man am besten am Stück?', a: ['2 bis 5 Minuten', '1 Stunde', 'Den ganzen Tag'], r: 0 },
    { id: 'q4', e: '🎯', f: 'Was kommt nach jedem Klick?', a: ['Eine Belohnung', 'Nichts', 'Ein Nein'], r: 0 },
    { id: 'q5', e: '🍫', f: 'Was ist für Hunde gefährlich?', a: ['Schokolade', 'Rüebli', 'Wasser'], r: 0 },
    { id: 'q6', e: '🤗', f: 'Was mögen viele Hunde lieber als Umarmungen?', a: ['Seitlich an der Brust kraulen', 'Am Schwanz ziehen', 'Hochheben'], r: 0 },
    { id: 'q7', e: '💤', f: 'Wie viel schlafen erwachsene Hunde ungefähr?', a: ['12 bis 16 Stunden', '2 Stunden', 'Gar nicht'], r: 0 },
    { id: 'q8', e: '🏃', f: 'Der Hund kommt auf Rufen. Was tust du?', a: ['Mich riesig freuen und belohnen', 'Schimpfen, weil es lange ging', 'Nichts'], r: 0 },
    { id: 'q9', e: '🌡️', f: 'Wann spaziert man im Sommer am besten?', a: ['Früh und spät am Tag', 'Am Mittag', 'Auf heissem Asphalt'], r: 0 },
    { id: 'q10', e: '🧒', f: 'Dürfen kleine Kinder allein mit dem Hund sein?', a: ['Nein, immer mit Erwachsenen', 'Ja, immer', 'Nur nachts'], r: 0 },
    { id: 'q11', e: '🦴', f: 'Der Hund hat einen Schuh. Was tust du?', a: ['Gegen sein Spielzeug tauschen', 'Wegreissen', 'Hinterherrennen'], r: 0 },
    { id: 'q12', e: '👃', f: 'Was ist Schnüffeln für einen Hund?', a: ['Wie Zeitung lesen', 'Langweilig', 'Verboten'], r: 0 },
    { id: 'q13', e: '🌳', f: 'Ein Hund wird zu wild. Was macht das Kind?', a: ['Ruhig stehen wie ein Baum', 'Schreien und rennen', 'Am Hund ziehen'], r: 0 },
    { id: 'q14', e: '🏠', f: 'Was braucht jeder Hund?', a: ['Einen ruhigen eigenen Platz', 'Immer Besuch', 'Laute Musik'], r: 0 },
    { id: 'q15', e: '🙅', f: 'Warum lernt man ohne Strafe?', a: ['Strafe macht Angst', 'Strafe ist schneller', 'Hunde mögen Strafe'], r: 0 },
    { id: 'q16', e: '🔁', f: 'Sitz klappt in der Küche. Klappt es auch im Park?', a: ['Muss neu geübt werden', 'Ja, sofort', 'Nie'], r: 0 },
    { id: 'q17', e: '🍽️', f: 'Was tun alle, wenn der Hund frisst?', a: ['Ihn in Ruhe lassen', 'Den Napf wegnehmen', 'Mitessen'], r: 0 },
    { id: 'q18', e: '🧊', f: 'Ein Hund wird ganz steif und still. Was tun?', a: ['Ruhig Abstand nehmen', 'Ihn umarmen', 'Ihn necken'], r: 0 },
    { id: 'q19', e: '🏆', f: 'Wann hört man mit Üben auf?', a: ['Wenn es gerade gut geklappt hat', 'Wenn der Hund müde ist und alles falsch macht', 'Nie'], r: 0 },
    { id: 'q20', e: '🏷️', f: 'Was tragen Hunde in der Schweiz?', a: ['Einen Mikrochip', 'Einen Hut', 'Eine Krone'], r: 0 }
  ];

  window.INHALT = {
    app: 'waefwaef', titel: 'Hundeschule', farbe: '#9be37c',
    intro: 'Kleine Übungen, viel Lob. Jeden Tag eine neue Idee.',
    fuss: 'Nur Belohnung, nie Strafe. Bei Schmerzen, Angst oder Problemen: Tierarzt oder Fachperson fragen.',
    regale: [
      { id: 'uebungen', typ: 'uebungen', e: '🎓', titel: 'Übungen', kurz: '40 Übungen in 5 Stufen', items: UEBUNGEN,
        gruppen: { start: 'Start (auch für Welpen)', alltag: 'Alltag', weiter: 'Für Fortgeschrittene', tricks: 'Tricks', kinder: 'Kinder und Hund' } },
      { id: 'wissen', typ: 'karten', e: '💛', titel: 'Hund verstehen', kurz: '30 Wissenskarten', items: WISSEN,
        gruppen: { sprache: 'Körpersprache', beduerfnis: 'Was Hunde brauchen', lernen: 'Wie Hunde lernen', familie: 'Familie', schweiz: 'Schweiz' } },
      { id: 'raetsel', typ: 'quiz', e: '❓', titel: 'Hunde-Rätsel', kurz: '5 Fragen pro Runde', items: RAETSEL }
    ],
    abzeichen: [
      { e: '🐾', n: 'Erste Pfote', x: 'Hundeschule geöffnet', wann: function (s) { return s.tage >= 1; } },
      { e: '✅', n: 'Geschafft', x: 'Erste Übung geschafft', wann: function (s) { return s.geschafft >= 1; } },
      { e: '🔟', n: 'Fleissig', x: '10 Mal geübt', wann: function (s) { return s.geschafft >= 10; } },
      { e: '🏅', n: 'Musterschüler', x: '50 Mal geübt', wann: function (s) { return s.geschafft >= 50; } },
      { e: '🔥', n: '3 Tage', x: '3 Tage hintereinander', wann: function (s) { return s.serie >= 3; } },
      { e: '📅', n: 'Woche', x: '7 Tage hintereinander', wann: function (s) { return s.serie >= 7; } },
      { e: '💛', n: 'Hundeversteher', x: '15 Wissenskarten', wann: function (s) { return s.regal.wissen >= 15; } },
      { e: '❓', n: 'Rätsel-Fan', x: '3 Rätselrunden', wann: function (s) { return s.runden >= 3; } },
      { e: '🏆', n: 'Alles richtig', x: 'Eine Runde ohne Fehler', wann: function (s) { return s.perfekt >= 1; } }
    ]
  };
})();
