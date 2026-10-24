# Store-Eintrag (Entwurf, nicht hochgeladen) · Otti – Nacht im Wald

**Name:** Otti – Nacht im Wald
**Untertitel (max. 30):** Geschichten aus dem Zauberwald
**Kategorie:** Kinder (6 bis 8) / Bildung
**Sprache:** Deutsch (Schweiz)

## Beschreibung
Otti, der kleine Igel mit dem gelben Halstuch, nimmt Kinder mit in den Zauberwald.
- Zauberwald-Tore: 6 Welten (Weltraum mit dem Raumschiff Kometli, Glitzerstadt mit der Superheldin Flinka Funkenherz, Pirateninsel, Korallenreich, Dino-Tal, Wolkenschloss) mit 14 Geschichten zum Vorlesen und Mitentscheiden.
- Erfinden mit Mila: ein paar Tipp-Fragen, und schon wird es eure eigene Geschichte. Für die Kleinsten mit weniger Fragen.
- Lern-Profil mit Stufen, Weltenpass-Stempel, «Mag ich» und Vorschläge: «Weil du … mochtest».
- Mitmach-Spiele, Winken, Gefühle und ein ruhiger Abend-Teil.
- «Sprich mit Otti»: grosse Tipp-Knöpfe oder schreiben, Otti antwortet und öffnet die passende Welt. Alles bleibt auf dem Gerät.

## Schlüsselwörter (max. 100 Zeichen)
Geschichten,Kinder,Gutenacht,Igel,Zauberwald,Vorlesen,Weltraum,Piraten,Superheldin,Dinos,Erfinden

## Altersfreigabe
4+, Kategorie Kinder (6 bis 8). Keine Gewalt, nichts Gruseliges, keine Werbung, keine Käufe.

## Datenschutz (Text für Store und App)
- **Stimme des Kindes:** Die Stimme verlässt das Gerät nie. Die App benutzt keine Browser-Spracherkennung (SpeechRecognition), und sie schickt nie Audio an den KI-Verse-Server oder eine andere API. Das Mikrofon geht erst nach einer Eltern-Freigabe. Die Spracherkennung (Whisper) läuft im Browser auf dem Gerät, und die Aufnahme wird nach dem Umwandeln sofort verworfen. Aus dem Internet kommen einmalig nur die Bibliothek und das Sprachmodell (ca. 80 MB). Ohne Freigabe gibt es grosse Tipp-Knöpfe und ein Textfeld.
- Nur Text, der auf dem Gerät entstanden ist, dürfte an einen Figuren-Chat gehen, und nur wenn dieser Chat das heute schon mit Einwilligung tut. «Sprich mit …» schickt gar nichts: Es antwortet aus festen Regeln auf dem Gerät. Getippter Text wird weder gespeichert noch gesendet; gezählt werden nur die gewählten Themen.
- Vorlesen nur mit Erwachsenen-Stimmen, die auf dem Gerät laufen. Keine Kinderstimmen.
- Fortschritt, Stufe, Favoriten und Abzeichen bleiben lokal auf dem Gerät (localStorage). Kein Konto, keine Werbung, kein Tracking, keine Käufe.
- **Offen vor dem Einreichen:** **Blocker für die Kinder-Kategorie:** Der goldene Knopf «Reden» schickt die Stimme des Kindes live an ElevenLabs (elevenlabs-client), und «Ottis Stimme» lädt Text über den Nova-Server (/v1/stimme); nova/nova.js nutzt Browser-Spracherkennung. Das widerspricht der Regel «Die Stimme verlässt das Handy nie». Für die Store-Version «Reden» entfernen oder durch «Sprich mit Otti» ersetzen (Entscheid Diego). feedback.js diktiert jetzt ohne Browser-Spracherkennung.

## Screenshots (1290 × 2796, iPhone 6,7")
1. `screenshot-1-start.png` – Otti mit Spielen, Reden, Winken und «Sprich mit Otti»
2. `screenshot-2-entdecken.png` – Zauberwald mit Vorschlag, Stufe und Toren
3. `screenshot-3-sprich.png` – «Sprich mit Otti» mit Vorschlag aus dem Lern-Profil

## Technik
- PWA: manifest.webmanifest (Name, Icons 192/512 und maskable 192/512, Theme-Farbe, standalone, start_url), Service Worker offline (sw.js), iPhone-Hinweis «Auf den Homescreen» (inhalt/homescreen.js).
- Für den App Store braucht es eine Hülle (z. B. Capacitor) und Diegos Entwickler-Konto (USD 99 pro Jahr ≈ CHF 90). Für eine Kinder-App gelten Apples Regeln für die Kategorie «Kinder» (keine Werbung, keine Links nach aussen ohne Eltern-Tor). Nichts hochgeladen.
