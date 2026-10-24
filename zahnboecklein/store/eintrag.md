# Store-Eintrag (Entwurf, nicht hochgeladen) · Zahnböcklein

**Name:** Zahnböcklein
**Untertitel (max. 30):** Zähneputzen mit Glitzer
**Kategorie:** Kinder (5 und jünger) / Gesundheit und Fitness
**Sprache:** Deutsch (Schweiz)

## Beschreibung
Das Zahnböcklein, eine kleine Fee mit Hörnchen, macht das Zähneputzen zum Spiel.
- Zwei Minuten putzen mit Putzlied, Sternen und Feier.
- Putzparty zum Tanzen und ein sanfter Teil für die Kleinsten (0 bis 3 Jahre).
- Zahn-Schule: 40 Staun-Karten, 30 Rätsel, Monster-Album (jedes Putzen bringt ein neues Monster) und 8 Geschichten zum Einschlafen.
- Jeden Tag «Heute» und ein Lern-Profil: Kleine fangen mit leichten Rätseln an (3 Fragen, 2 Antworten), mit jeder Stufe wird es mehr.
- «Sprich mit dem Zahnböcklein»: grosse Tipp-Knöpfe, das Zahnböcklein antwortet freundlich und zeigt das Passende.
Das Zahnböcklein ersetzt keine Zahnärztin. Bei Zahnweh immer eine erwachsene Person und die Zahnärztin fragen.

## Schlüsselwörter (max. 100 Zeichen)
Zähneputzen,Kinder,Putzlied,Zahnfee,Zähne,Timer,Zahnbürste,Gutenacht,Rätsel,Sterne

## Altersfreigabe
4+, Kategorie Kinder (bis 5 Jahre). Keine Werbung, keine Käufe, keine Links nach aussen ohne Eltern-Tor.

## Datenschutz (Text für Store und App)
- **Stimme des Kindes:** Die Stimme verlässt das Gerät nie. Die App benutzt keine Browser-Spracherkennung (SpeechRecognition), und sie schickt nie Audio an den KI-Verse-Server oder eine andere API. Das Mikrofon geht erst nach einer Eltern-Freigabe. Die Spracherkennung (Whisper) läuft im Browser auf dem Gerät, und die Aufnahme wird nach dem Umwandeln sofort verworfen. Aus dem Internet kommen einmalig nur die Bibliothek und das Sprachmodell (ca. 80 MB). Ohne Freigabe gibt es grosse Tipp-Knöpfe und ein Textfeld.
- Nur Text, der auf dem Gerät entstanden ist, dürfte an einen Figuren-Chat gehen, und nur wenn dieser Chat das heute schon mit Einwilligung tut. «Sprich mit …» schickt gar nichts: Es antwortet aus festen Regeln auf dem Gerät. Getippter Text wird weder gespeichert noch gesendet; gezählt werden nur die gewählten Themen.
- Vorlesen nur mit Erwachsenen-Stimmen, die auf dem Gerät laufen. Keine Kinderstimmen.
- Fortschritt, Stufe, Favoriten und Abzeichen bleiben lokal auf dem Gerät (localStorage). Kein Konto, keine Werbung, kein Tracking, keine Käufe.
- **Offen vor dem Einreichen:** «Mit Nova reden» (nova/nova.js) nutzt Browser-Spracherkennung und einen Server; lernen.js und abo.js prüfen. Für die Kinder-Kategorie muss Nova in der Store-Version aus sein oder hinter dem Eltern-Tor liegen.

## Screenshots (1290 × 2796, iPhone 6,7")
1. `screenshot-1-start.png` – Start mit «Los geht's!», Zahn-Schule und «Sprich mit dem Zahnböcklein»
2. `screenshot-2-entdecken.png` – Zahn-Schule mit Heute, Stufe und Regalen
3. `screenshot-3-sprich.png` – «Sprich mit dem Zahnböcklein»

## Technik
- PWA: manifest.webmanifest (Name, Icons 192/512 und maskable 192/512, Theme-Farbe, standalone, start_url), Service Worker offline (sw.js), iPhone-Hinweis «Auf den Homescreen» (inhalt/homescreen.js).
- Für den App Store braucht es eine Hülle (z. B. Capacitor) und Diegos Entwickler-Konto (USD 99 pro Jahr ≈ CHF 90). Für eine Kinder-App gelten Apples Regeln für die Kategorie «Kinder» (keine Werbung, keine Links nach aussen ohne Eltern-Tor). Nichts hochgeladen.
