# Store-Eintrag (Entwurf, nicht hochgeladen) · Hasis Laden

**Name:** Hasis Laden
**Untertitel (30):** Kleine Werkzeuge, still erklärt
**Kategorie:** Produktivität (zweite: Wirtschaft)
**Sprache:** Deutsch (Schweiz)

## Beschreibung
Hasi führt einen kleinen Laden an der Nachtstrasse. Er spricht nie, er zeigt dir alles mit Gesten und Holzschildern.
- Zeig dein Problem: Hasi holt in fünf kurzen Fragen das passende Werkzeug aus dem Regal.
- Hasis Kino: 10 stille Geschichten, wie kleine Werkzeuge Menschen im Alltag helfen.
- Hasis Schilder: 30 kurze Tipps für Ordnung, Sicherheit im Netz, Laden und Familie.
- Werkbank: Checkliste, Preisrechner, Erinnerung oder Quiz selber bauen und als Datei mitnehmen.
- «Sprich mit Hasi»: Tippe oder schreib dein Problem. Hasi antwortet mit Gesten, die Erzählerin erklärt.
- Jeden Tag «Heute», Abzeichen und ein Lern-Profil, das sich merkt, was dir gefällt. Alles nur auf deinem Gerät.

## Schlüsselwörter (100)
Werkzeuge,Checkliste,Erinnerung,Preisrechner,Quiz,Laden,Praxis,Alltag,Ordnung,Tipps,Hase,Geschichten

## Altersfreigabe
4+ (keine Gewalt, keine Werbung, keine Käufe in der App, keine offenen Chats mit anderen Menschen).

## Datenschutz (Text für Store und App)
- Fortschritt, Abzeichen, Favoriten und gewählte Gesprächsthemen werden nur lokal auf dem Gerät gespeichert (localStorage). Kein Konto, keine Werbung, kein Tracking.
- «Sprich mit Hasi» antwortet aus festen Regeln auf dem Gerät. Getippter Text wird nicht gespeichert und nicht gesendet.
- **Stimme:** Die Stimme verlässt das Gerät nie. Es wird keine Browser-Spracherkennung (SpeechRecognition) benutzt, und es wird nie Audio an den KI-Verse-Server oder eine andere API geschickt. Das Mikrofon geht erst nach einer Eltern-Freigabe; die Spracherkennung (Whisper) läuft im Browser auf dem Gerät, die Aufnahme wird nach dem Umwandeln sofort verworfen. Aus dem Internet kommt einmalig nur das Sprachmodell (ca. 80 MB).
- Nur Text, der auf dem Gerät entstanden ist, dürfte an einen Figuren-Chat gehen, und nur wenn dieser Chat das schon heute mit Einwilligung tut. «Sprich mit Hasi» schickt nichts.
- **Offen vor dem Einreichen:** Der Knopf «Mit Nova reden» (nova/nova.js) nutzt Browser-Spracherkennung und einen Server; «Was Hasi sich merkt» sendet mit Einwilligung Zahlen an Hasis Server. Für die Store-Version ausblenden oder im Datenschutz genau beschreiben.

## Screenshots (1290 × 2796, iPhone 6,7")
1. `screenshot-1-start.png` – Startseite «Was brauchst du?»
2. `screenshot-2-entdecken.png` – Hasis Kino und Tipps mit Heute, Profil und Regalen
3. `screenshot-3-sprich.png` – «Sprich mit Hasi»: Gesten und Erzählerin

## Technik
- PWA: manifest.webmanifest (Name, Icons 192/512 und maskable 192/512, Theme-Farbe, standalone, start_url), Service Worker offline (sw.js), iPhone-Hinweis «Auf den Homescreen» (inhalt/homescreen.js).
- Für den App Store braucht es eine Hülle (z. B. Capacitor) und Diegos Entwickler-Konto (USD 99 pro Jahr ≈ CHF 90). Nichts hochgeladen.
