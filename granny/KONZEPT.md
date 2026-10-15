# Projekt Granny – Konzept v0.1

Stand 15.10.2026 · intern · Thread «Projekt Granny»

## Die Figur
**Granny** ist eine liebe, lustige, etwas kauzige alte Frau aus dem Dorf (KI-Verse-Städtchen). Sie vergisst ständig Dinge und lacht darüber: Ihre Brille sucht sie, während sie auf ihrem Kopf sitzt; an der Strickjacke klebt ein Zettel «Brille?». Weisser Dutt mit zwei goldenen Stricknadeln, runde Goldbrille, nachtblaue Strickjacke, goldene Brosche (= ihr Sprechknopf). Pixar-Stil, Nachtblau + Gold.
- Charakter: warm, geduldig, nie belehrend. Vergessen ist bei ihr nichts Peinliches.
- Lieblingssatz (Vorschlag): «Wo hab ich sie wieder hingetan? Ah, auf dem Kopf!»
- Freunde: Nova hilft ihr im Hintergrund (Granny ist das Gesicht, Nova das Wissen dahinter). Fia achtet auf ihren Schlaf, Letti bringt ihr Briefe der Familie.
- Entwürfe: figuren/granny/granny-entwurf.png (+ .svg), Gerät: figuren/granny/granny-geraet-entwurf.png

## Für wen
1. Ältere Menschen, auch mit beginnender Demenz, die allein wohnen.
2. Ihre Angehörigen (oft weit weg), die begleiten wollen, ohne zu bevormunden.

## Die Probleme (aus Diegos Erfahrung, intern)
- Anrufe werden nicht gehört oder man weiss nicht, wie man abnimmt.
- Handy verbinden, Updates, Meldungen: überfordert.
- Passwörter gehen nicht mehr, werden vergessen, das Konto sperrt.
- Die Person merkt nicht, was sie braucht, und kann es nicht sagen.
- Orientierung: welcher Tag, welche Tageszeit, was steht heute an.

## Grundsätze
- **Ein Knopf.** Drücken und reden. Kein Menü, kein Wischen, kein Text, den man lesen muss.
- **Kein Passwort für Granny-Nutzer.** Alles, was ein Passwort braucht, liegt bei den Angehörigen. Geht etwas nicht, drückt man «Handy oder Passwort geht nicht» und Granny sagt der Familie Bescheid.
- **Die Familie richtet ein, nicht die Person.** Einstellungen versteckt (lange drücken), nur mit Einverständnis.
- **Sehen, nicht nur hören.** Anruf = Licht + Gesicht + laute Stimme.
- **Kein Arzt, keine Diagnose, keine Heilversprechen.** Granny verweist auf Hausarzt und Fachstellen (Alzheimer-Telefon Schweiz 058 058 80 00, Mo–Fr; in Spanien die regionale Alzheimer-Vereinigung, Nummer noch prüfen). Notruf immer 144 (CH) / 112 (EU).

## Bildschirm (Prototyp v0.1, heute gebaut)
Von oben nach unten:
1. Datum + Uhrzeit + Tageszeit gross («Donnerstag, 15. Oktober · Morgen»).
2. Granny mit Sprechblase, sie grüsst mit Namen und liest alles laut vor (langsam, deutlich).
3. Goldener Knopf «Drück mich und rede» (Sprache erkennen im Browser).
4. 4 grosse Bilder-Knöpfe: Familie/Arzt/Nachbarin/Taxi, ein Druck = Anruf.
5. «Ich brauche Hilfe» (ruft eine von der Familie festgelegte Person an).
6. «Handy oder Passwort geht nicht» → Granny beruhigt und schickt der Familie eine SMS.
7. «Heute»: was die Familie eingetragen hat (z. B. «10 Uhr: Diego ruft an»).
8. Klein unten: «Für Angehörige» (1,2 Sek. drücken): Namen, Nummern, Fotos, Sprache DE/ES, Hilfe-Nummer, Passwort-Helfer, Tagesliste, Server-Adresse, Einwilligung, Alles löschen.
- Granny versteht ohne Server schon einfache Sätze: «Ruf Diego an», «Welcher Tag ist heute?», «Wo ist meine Brille?», «Passwort geht nicht», «Hilfe».
- Mit Server (heute Abend): Sense-Engine-Adresse eintragen, dann antwortet Granny frei (2 kurze Sätze, warm, nie nach Passwort oder Geld fragend).
- Daten bleiben nur auf dem Gerät. Ohne Server wird nichts gesendet.
- Grenzen der Web-App (ehrlich): Sie kann eingehende Anrufe nicht abnehmen, nicht lauter klingeln und läuft nur, wenn sie offen ist. Das löst erst das Gerät oder eine echte App.

## Das Gerät «Granny-Figur» (Entwurf, nichts bestellt)
Kleine Figur, ca. 14 cm hoch, steht auf dem Tisch:
1. Rundes Display als Gesicht (lächelt, zeigt «Diego ruft an»).
2. Goldene Brosche = einziger Knopf: drücken und reden, bei Anruf drücken = abnehmen.
3. Lauter Lautsprecher im Rock, tiefe klare Stimme.
4. Lichtring im Sockel: leuchtet und blinkt bei Anruf.
5. Innen dieselbe Technik wie Nova (ESP32-S3 mit Mikrofon, WLAN). Nova-Teile von Diego (Waveshare) eignen sich für einen ersten Granny-Prototyp, nur anderes 3D-Gehäuse.
6. Ladeschale statt Kabel. Kein Passwort, kein Menü. Familie richtet über die Angehörigen-App ein.

**Wichtiger Entscheid (Vorschlag):** Nicht über Bluetooth mit dem Handy koppeln. Koppeln geht bei älteren Menschen oft kaputt (genau Diegos Problem). Besser: Granny hat eigenes WLAN, später eigene SIM (eSIM), und die Familie ruft Granny direkt an (Familien-App oder Telefonnummer mit automatischem Abnehmen nur für bekannte Nummern). Das Handy der Person braucht es dann gar nicht.

Wege:
- **Prototyp:** Nova-Technik + gedrucktes Granny-Gehäuse, Kosten ca. CHF 60–120 einmalig (nur nach Go).
- **Serie China (später):** fertiges Sprach-Board mit Display + eigenes Gehäuse aus Spritzguss, Werkzeug ca. CHF 10–25k einmalig, Stück ca. CHF 25–45 bei 1000 Stück, plus CE/Funk-Prüfung. Grobe Schätzung, nicht angefragt.

## Was es schon gibt (Recherche 15.10.2026)
| Lösung | Was sie kann | Was fehlt |
|---|---|---|
| Bilder-Telefone (Seniorentelefon mit Foto-Tasten, z. B. Doro/Amplicomms) | Anruf per Foto, laut, SOS-Taste | kein Gespräch, keine Hilfe bei Passwort, keine Familien-Fernpflege |
| RAZ Memory Phone | 6 grosse Fotos, Notfallknopf, Lautsprecher | nur USA, kein Begleiter, keine Erinnerung an den Tag |
| GrandPad | Tablet, Familie verwaltet, Videoanruf mit Auto-Annahme | teuer (USD 199 + 40–89/Mt), USA, Tablet bleibt kompliziert |
| ElliQ | Tisch-Roboter, spricht von sich aus, Erinnerungen | USA, ca. USD 250 + 30–60/Mt, kein Deutsch/Spanisch |
| RecallCue / Demenz-Uhren | Tag, Uhrzeit, Erinnerungen von der Familie | nur Anzeige, kein Sprechen, kein Anruf |
| Alexa/Siri | Sprache, Anrufe | Weckwort, Konten, Passwörter, Datenschutz, für Demenz schwierig |

**Was ehrlich fehlt:** eine liebevolle Figur (nicht ein Gerät), die auf Deutsch und Spanisch spricht, Tag + Familie + Anrufe in EINEM Knopf zusammenbringt, das Passwort-Problem zu den Angehörigen verschiebt und in Europa mit strengem Datenschutz läuft.

Quellen: https://csr.hdsupply.com/best-cell-phone-for-seniors-with-dementia/ · https://www.businesswire.com/news/home/20220316005139/en/ · https://getjubileetv.com/blogs/jubileetv/grandpad-alternatives · https://www.recallcue.com/post/navigating-senior-technology-grandpad-vs-recallcue-reviewed · https://aiinsightsnews.net/ai-companion-for-seniors/ · https://alzheimer-schweiz.ch/fileadmin/dam/Alzheimer_Schweiz/Dokumente/Medien/2024_11_05_MM_AlzheimerTelefon_D.pdf

## Datenschutz
- Gesundheits- und Gedächtnisangaben sind besonders schützenswert (DSG CH / DSGVO EU).
- Einwilligung der Person (oder ihrer bevollmächtigten Vertretung) + Angehörige. Ohne Häkchen kein Speichern.
- Keine Aufnahmen speichern. Mit Server: verschlüsselt, Server in der Schweiz (Sense Engine), nur Kürzel.
- Diegos Erfahrungen mit seiner Mutter fliessen ins Design ein, werden aber nie nach aussen genannt.

## Nächste Schritte
1. Heute Abend: Server steht → Sense-Engine-Adresse im Granny-Bildschirm eintragen, Granny-Persönlichkeit als eigenes Profil.
2. Diego testet Bildschirm auf dem iPhone (Spanisch für die Mutter).
3. Tinko macht das Pixar-Bild (Auftrag: tinko-auftrag-granny-2026-10-15.md).
4. Danach: echte App mit Familien-Seite (Fernpflege der Kontakte, Tagesliste), dann Granny-Gerät-Prototyp nach Go.
