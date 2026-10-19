# DR Lab Apps in den App Store – Anleitung

Stand 19.10.2026. Neun Apps sind vorbereitet. Eingereicht wird erst, wenn du selbst auf «Zur Prüfung einreichen» tippst. Hochladen machst du selbst, nach deinem Go.

| App | Ordner im Paket | Bundle-ID | Web-Ordner im Repo |
|---|---|---|---|
| Mondschein mit Otti | `appstore/mondschein/` | `ch.drlab.mondschein` | `mondschein/` |
| HumanSpark | `appstore/humanspark/` | `ch.drlab.humanspark` | `humanspark/` |
| TradePing | `appstore/tradeping/` | `ch.drlab.tradeping` | `tradeping/` |
| Jackie's Advice | `appstore/jackie/` | `ch.drlab.jackie` | `jackie/` |
| Fias Nest | `appstore/fiasnest/` | `ch.drlab.fiasnest` | `schlaf/` |
| Kiki | `appstore/kiki/` | `ch.drlab.kiki` | `kiki/` |
| Mama Affe | `appstore/mamaaffe/` | `ch.drlab.mamaaffe` | `mama-affe/` |
| Fompa | `appstore/fompa/` | `ch.drlab.fompa` | `fompa/` |
| Food and Flow | `appstore/foodandflow/` | `ch.drlab.foodandflow` | `appid/` |

Pro App liegt alles in `appstore/<app>/`: die iPhone-App (`ios/`), die Texte (`store/texte.md`), das Icon (`store/icon-1024.png`) und die Bilder (`store/screenshots-6.9/`).
Was Apple prüft und was noch fehlt: `appstore/PRUEFUNG-2026-10-19.md`.

## Deine Schritte (ein Schritt pro Zeile)

### A. Zuerst die Apps zusammenführen (GitHub, Reihenfolge wichtig)
1. Feature-PRs zuerst mergen (jede App-Version): #128 HumanSpark, #119 TradePing, #125 Jackie, #129 Fias Nest, #122 Otti/Mondschein, #121 Kiki, #124 Mama Affe, #123 Fompa, #126 Food and Flow.
2. Dann PR #115 (Fias Nest App-Store-Paket) mergen.
3. Dann diesen PR («App Store: alle neun Apps») mergen.
4. Bei einem Konflikt nicht selber lösen, Claude fragen.

### B. Einmalig vorbereiten
5. Kontakt-Mail für die Datenschutz-Seite festlegen und «Datenschutz Go» sagen (Apple verlangt eine Datenschutz-URL).
6. Mama Affe: das fertige Icon von Tinko holen (jetzt ist ein vergrössertes 512er-Bild drin).
7. Für TradePing bestätigen, dass der Kurs-Server keine Abrufe speichert (sonst Datenschutz-Angabe anpassen, siehe texte.md).
8. Xcode aus dem Mac App Store laden und einmal öffnen.
9. Node.js (LTS) von https://nodejs.org installieren.
10. Xcode → Einstellungen → Accounts → «+» → Apple-ID mit dem Developer Program.

### C. Bauen (auf dem MacBook)
11. Terminal öffnen.
12. `git clone https://github.com/Diegorobert-code/DR_Lab.git ~/DR_Lab` (falls schon da: `cd ~/DR_Lab && git pull`).
13. `cd ~/DR_Lab/appstore && ./alle-vorbereiten.sh` (baut alle neun Apps, zeigt pro App eine kurze «Prüfung»).
14. `open ~/DR_Lab/appstore/kiki/ios/App/App.xcodeproj` (oder eine andere App).
15. Links «App» → «Signing & Capabilities» → Team «Diego Robert».
16. iPhone per Kabel anschliessen, oben das iPhone wählen, ▶ drücken, App ausprobieren.

### D. App Store Connect (https://appstoreconnect.apple.com)
17. «Apps» → «+» → «Neue App»: iOS, Name aus `store/texte.md`, Sprache Deutsch, Bundle-ID aus der Tabelle oben, SKU `drlab-<app>`.
18. Xcode: Product → Archive → Distribute App → App Store Connect → Upload (das ist dein Upload, erst nach deinem Go).
19. Texte aus `store/texte.md` einfügen.
20. Bilder aus `store/screenshots-6.9/` ins Feld «iPhone 6,9 Zoll» ziehen.
21. Altersfreigabe und «App-Datenschutz» genau wie in `texte.md` beantworten.
22. Kinder-Apps (Mondschein, Kiki): Kategorie «Kinder» und Altersgruppe wählen.
23. Preis «Gratis», Verfügbarkeit zuerst nur **Schweiz**.
24. Datenschutz-URL eintragen (geht erst nach Schritt 5).
25. «Notizen für die Prüfung» aus `texte.md` einfügen.
26. Erst wenn alles stimmt: «Zur Prüfung einreichen». Das machst du selbst.

### E. Ohne eigenen Mac (GitHub baut für dich)
27. App Store Connect → Benutzer und Zugriff → Integrationen → App Store Connect API → Schlüssel (Rolle Admin) erzeugen, .p8 laden.
28. GitHub → DR_Lab → Settings → Secrets and variables → Actions → `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`, `APPLE_TEAM_ID` eintragen.
29. Schritt 17 (App-Eintrag) muss gemacht sein.
30. Actions → «iPhone-Apps bauen» → «Run workflow» → App wählen → «Hochladen» anhaken. Nach ca. 20 Min. liegt der Build in TestFlight.
31. Weiter bei Schritt 19.

Jeder Push und jeder PR mit Änderungen an den Apps baut alle neun Apps automatisch als Test (Simulator, ohne Signatur, lädt nichts hoch).

## Was in der App-Store-Version anders ist als im Web
- Schriften sind eingebaut, keine Anfragen an Google.
- Keine «Testphase»- oder «Prototyp»-Hinweise (Apple lehnt Test- und Beta-Hinweise ab).
- Kein Gesprächsfenster «Mit Claude reden» (feedback.js gehört zur Testphase).
- Nova aus der Cloud ist nicht drin (nova.js, Live-Gespräch). So gilt «keine Daten erhoben». Die Lern-Karten «Was … sich merkt» bleiben und lernen auf dem iPhone; «Erfahrung teilen» geht nur über das Teilen-Menü, mit Häkchen.
- Trickfilm-Bühne, Intro-Film und Figurenbilder (`nova/buehne.js`, `nova/intro.js`, `nova/figuren/`) und der Sprech-Baustein (`apps/sprechen/`) werden automatisch mitgenommen.
- Links zu anderen DR-Lab-Apps sind ausgeblendet (die anderen Apps sind nicht in der App).
- Käufe, Guthaben und Abo-Hinweise sind ausgeblendet (Mondschein «Abo-Info», «Kauf mit deinen Ideen» in Mondschein, HumanSpark und Jackie).
- Kinder-Apps (Mondschein, Kiki): Teilen, Mail, Telefon und Links nach aussen erst nach der Elternsperre (Mal-Rechnung in Worten).
- Mondschein: «Whisper» (lädt 80 MB aus dem Internet) ist aus, Otti hört mit der iPhone-Spracherkennung.
- TradePing: echte iPhone-Mitteilungen (solange die App offen ist).
- HumanSpark: Reiter «Ideen» ausgeblendet. Polar H10 geht auf dem iPhone nicht (kein Web-Bluetooth).
- Fias Nest: ohne Funkenmarkt. Ton läuft auch bei Lautlos-Schalter.

## Neu bauen nach Änderungen
`cd ~/DR_Lab && git pull && cd appstore && ./alle-vorbereiten.sh`, dann in Xcode Archive → Upload mit höherer Build-Nummer (App → General → Build).
Nur eine App: `cd appstore/<app> && npm install && node ../web-bauen.mjs <app> && npx cap sync ios`.
