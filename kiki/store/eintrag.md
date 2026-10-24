# Store-Eintrag (Entwurf, nicht hochgeladen) · Kiki singt

**Name:** Kiki singt
**Untertitel (max. 30):** Kinder und Eltern singen
**Kategorie:** Kinder (6 bis 8) / Musik
**Sprache:** Deutsch (Schweiz)

## Beschreibung
Kiki, das singende Koala-Mädchen, singt mit Kindern und Eltern.
- 18 Lieder zum Mitsingen, Kiki hilft bei jedem Ton.
- Ton treffen, Echo-Spiel, Rhythmus, Stimm-Spiegel und Aufwärmen.
- Musik-Kiste: 30 Sing-Spiele zu zweit, 30 Musik-Rätsel und ein Instrumente-Album zum Sammeln.
- Jeden Tag «Heute mit Kiki» und ein Lern-Profil: Die Rätsel werden mit jeder Stufe etwas schwieriger.
- «Sprich mit Kiki»: grosse Tipp-Knöpfe, Kiki schlägt Lieder und Spiele vor.
Kiki hört beim Singen nur die Tonhöhe. Nichts wird aufgenommen.

## Schlüsselwörter (max. 100 Zeichen)
Singen,Kinderlieder,Kinder,Musik,Eltern,Karaoke,Töne,Rhythmus,Koala,Gesang,Lieder

## Altersfreigabe
4+, Kategorie Kinder (6 bis 8). Keine Werbung, keine Käufe, keine Links nach aussen ohne Eltern-Tor.

## Datenschutz (Text für Store und App)
- **Stimme des Kindes:** Die Stimme verlässt das Gerät nie. Die App benutzt keine Browser-Spracherkennung (SpeechRecognition), und sie schickt nie Audio an den KI-Verse-Server oder eine andere API. Das Mikrofon geht erst nach einer Eltern-Freigabe. Die Spracherkennung (Whisper) läuft im Browser auf dem Gerät, und die Aufnahme wird nach dem Umwandeln sofort verworfen. Aus dem Internet kommen einmalig nur die Bibliothek und das Sprachmodell (ca. 80 MB). Ohne Freigabe gibt es grosse Tipp-Knöpfe und ein Textfeld.
- Nur Text, der auf dem Gerät entstanden ist, dürfte an einen Figuren-Chat gehen, und nur wenn dieser Chat das heute schon mit Einwilligung tut. «Sprich mit …» schickt gar nichts: Es antwortet aus festen Regeln auf dem Gerät. Getippter Text wird weder gespeichert noch gesendet; gezählt werden nur die gewählten Themen.
- Vorlesen nur mit Erwachsenen-Stimmen, die auf dem Gerät laufen. Keine Kinderstimmen.
- Fortschritt, Stufe, Favoriten und Abzeichen bleiben lokal auf dem Gerät (localStorage). Kein Konto, keine Werbung, kein Tracking, keine Käufe.
- **Offen vor dem Einreichen:** «Mit Kiki reden · mit Eltern» spricht mit dem Server (Sense Engine) und nova/nova.js nutzt Browser-Spracherkennung; feedback.js sendet Rückmeldungen (das Diktieren über Browser-Spracherkennung ist jetzt aus). Für die Kinder-Kategorie: Server-Chat nur hinter dem Eltern-Tor oder in der Store-Version aus.

## Screenshots (1290 × 2796, iPhone 6,7")
1. `screenshot-1-start.png` – Start mit Heute, Zusammen singen, Musik-Kiste und «Sprich mit Kiki»
2. `screenshot-2-entdecken.png` – Musik-Kiste mit Heute, Stufe und Regalen
3. `screenshot-3-sprich.png` – «Sprich mit Kiki»

## Technik
- PWA: manifest.webmanifest (Name, Icons 192/512 und maskable 192/512, Theme-Farbe, standalone, start_url), Service Worker offline (sw.js), iPhone-Hinweis «Auf den Homescreen» (inhalt/homescreen.js).
- Für den App Store braucht es eine Hülle (z. B. Capacitor) und Diegos Entwickler-Konto (USD 99 pro Jahr ≈ CHF 90). Für eine Kinder-App gelten Apples Regeln für die Kategorie «Kinder» (keine Werbung, keine Links nach aussen ohne Eltern-Tor). Nichts hochgeladen.
