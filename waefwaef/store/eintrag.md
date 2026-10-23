# Store-Eintrag (Entwurf, nicht hochgeladen) · Wäf Wäf – unser Hund

**Name:** Wäf Wäf – unser Hund
**Untertitel (max. 30):** Hund grossziehen als Familie
**Kategorie:** Lifestyle (zweite: Bildung)
**Sprache:** Deutsch (Schweiz)

## Beschreibung
Wäf Wäf, der kleine Maltipoo, hilft der ganzen Familie mit einem Hund.
- Mein Tag mit euch: wer geht raus, wer füttert, Pfötchen für jede Runde.
- Hundeschule: 40 kurze Übungen in 5 Stufen, nur mit Lob und Belohnung, 30 Wissenskarten «Hund verstehen», 20 Rätsel und Abzeichen.
- Jeden Tag «Heute» und ein Lern-Profil: Je mehr ihr übt, desto höher die Stufe, und desto mehr Übungen schlägt Wäf Wäf vor.
- «Sprich mit Wäf Wäf»: Tipp-Knöpfe oder schreiben, Wäf Wäf antwortet mit Tipps, Spielen und Witzen.
- Allein bleiben üben, Pflege-Kalender, Fragen für den Tierarzt.
Wäf Wäf ersetzt keine Tierärztin und keine Hundetrainerin. Bei Schmerzen, Angst oder Problemen bitte Fachleute fragen.

## Schlüsselwörter (max. 100 Zeichen)
Hund,Welpe,Hundeschule,Familie,Kinder,Training,Spazieren,Tricks,Hundeerziehung,Maltipoo

## Altersfreigabe
4+ (keine Gewalt, keine Werbung, keine Käufe, kein offener Chat mit Fremden).

## Datenschutz (Text für Store und App)
- **Stimme des Kindes:** Die Stimme verlässt das Gerät nie. Die App benutzt keine Browser-Spracherkennung (SpeechRecognition), und sie schickt nie Audio an den KI-Verse-Server oder eine andere API. Das Mikrofon geht erst nach einer Eltern-Freigabe. Die Spracherkennung (Whisper) läuft im Browser auf dem Gerät, und die Aufnahme wird nach dem Umwandeln sofort verworfen. Aus dem Internet kommen einmalig nur die Bibliothek und das Sprachmodell (ca. 80 MB). Ohne Freigabe gibt es grosse Tipp-Knöpfe und ein Textfeld.
- Nur Text, der auf dem Gerät entstanden ist, dürfte an einen Figuren-Chat gehen, und nur wenn dieser Chat das heute schon mit Einwilligung tut. «Sprich mit …» schickt gar nichts: Es antwortet aus festen Regeln auf dem Gerät. Getippter Text wird weder gespeichert noch gesendet; gezählt werden nur die gewählten Themen.
- Vorlesen nur mit Erwachsenen-Stimmen, die auf dem Gerät laufen. Keine Kinderstimmen.
- Fortschritt, Stufe, Favoriten und Abzeichen bleiben lokal auf dem Gerät (localStorage). Kein Konto, keine Werbung, kein Tracking, keine Käufe.
- **Offen vor dem Einreichen:** «Mit Nova reden» (nova/nova.js) nutzt Browser-Spracherkennung und einen Server; lernen.js schickt Erfahrungen an einen Server (/erfahrung); feedback.js sendet Rückmeldungen. Für die Store-Version ausblenden oder genau beschreiben. Familiennamen bleiben lokal.

## Screenshots (1290 × 2796, iPhone 6,7")
1. `screenshot-1-start.png` – Mein Tag mit euch
2. `screenshot-2-entdecken.png` – Hundeschule mit Heute, Stufe und Regalen
3. `screenshot-3-sprich.png` – «Sprich mit Wäf Wäf»

## Technik
- PWA: manifest.webmanifest (Name, Icons 192/512 und maskable 192/512, Theme-Farbe, standalone, start_url), Service Worker offline (sw.js), iPhone-Hinweis «Auf den Homescreen» (inhalt/homescreen.js).
- Für den App Store braucht es eine Hülle (z. B. Capacitor) und Diegos Entwickler-Konto (USD 99 pro Jahr ≈ CHF 90). Für eine Kinder-App gelten Apples Regeln für die Kategorie «Kinder» (keine Werbung, keine Links nach aussen ohne Eltern-Tor). Nichts hochgeladen.
