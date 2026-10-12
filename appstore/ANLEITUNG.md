# DR Lab Apps in den App Store – Anleitung

Stand 12.10.2026. Alles ist vorbereitet. Du brauchst nur noch deinen MacBook mit Xcode. Eingereicht wird erst, wenn du selbst auf «Zur Prüfung einreichen» tippst.

Vier Apps sind bereit: **Mondschein**, **HumanSpark**, **TradePing**, **Jackie's Advice**.
Pro App liegt alles in `appstore/<app>/`: die iPhone-App (`ios/`), die Texte (`store/texte.md`), das Icon (`store/icon-1024.png`) und die Screenshots (`store/screenshots-6.9/`).

## Einmalig auf dem MacBook (gratis)
1. **Xcode** aus dem Mac App Store laden und einmal öffnen (Zusatzteile installieren lassen).
2. **Node.js** (LTS) laden: https://nodejs.org → installieren.
3. In Xcode: Einstellungen → Accounts → «+» → mit deiner Apple-ID anmelden (die mit dem Developer Program).

## Pro App (Beispiel Mondschein)
4. Programm **Terminal** öffnen und einfügen:
   ```
   git clone https://github.com/Diegorobert-code/DR_Lab.git ~/DR_Lab
   cd ~/DR_Lab/appstore && ./alle-vorbereiten.sh
   ```
   Später für Updates nur: `cd ~/DR_Lab && git pull && cd appstore && ./alle-vorbereiten.sh`
5. Xcode öffnen mit:
   ```
   open ~/DR_Lab/appstore/mondschein/ios/App/App.xcodeproj
   ```
6. Links «App» anklicken → «Signing & Capabilities» → bei **Team** «Diego Robert» wählen. Der Bundle Identifier steht schon drin (`ch.drlab.mondschein`).
7. Testen: iPhone per Kabel anschliessen, oben das iPhone wählen, ▶ drücken. (Auf dem iPhone einmal Einstellungen → Datenschutz → Entwicklermodus einschalten.)

## In App Store Connect (https://appstoreconnect.apple.com)
8. «Apps» → «+» → «Neue App»: Plattform iOS, Name aus `store/texte.md`, Sprache Deutsch, Bundle-ID wählen, SKU z. B. `drlab-mondschein`.
9. Zurück in Xcode: Menü **Product → Archive**, dann **Distribute App → App Store Connect → Upload**.
10. In App Store Connect die Texte aus `store/texte.md` einfügen, die Screenshots aus `store/screenshots-6.9/` hochladen (Feld «iPhone 6,9 Zoll»), Altersfreigabe und App-Datenschutz wie in der Datei beantworten, Preis «Gratis».
11. **Verfügbarkeit:** zuerst nur **Schweiz**. (Für EU-Länder verlangt Apple die Händler-Angabe nach dem EU-Gesetz über digitale Dienste, dann werden Adresse, Telefon und Mail öffentlich angezeigt. Das entscheiden wir später.)
12. Datenschutz-URL: die Seite `datenschutz/` geht online, sobald du Go sagst (Entwurf liegt als Seite `datenschutz/index.html` im Pull Request «Datenschutz-Seite», es fehlt nur deine Kontakt-Mail).
13. Erst wenn alles stimmt: **«Zur Prüfung einreichen»**. Das machst du selbst.

## Was in der App-Store-Version anders ist als im Web
- Schriften sind in der App eingebaut, es gibt keine Anfragen an Google.
- Die Hinweise «Testphase» sind weg, weil Apple Test- und Beta-Hinweise ablehnt.
- Nova aus der Cloud ist noch nicht drin, die Apps laufen ganz auf dem iPhone. So gilt überall «keine Daten erhoben». Nova kommt mit einem Update, wenn der Server läuft (dann passen wir die Datenschutz-Angaben an).
- TradePing: echte iPhone-Mitteilungen statt Web-Mitteilungen (solange die App offen ist).
- HumanSpark: Reiter «Ideen» ausgeblendet (Guthaben wären bei Apple nur als In-App-Kauf erlaubt). Polar H10 geht auf dem iPhone nicht (Apple erlaubt kein Web-Bluetooth).
- Mondschein: nur Hochformat, Elternsperre jetzt mit Mal-Rechnung in Worten (Apple verlangt für Kinder-Apps eine Sperre, die Kinder nicht lösen).

## Neu bauen (nur falls nötig)
`./alle-vorbereiten.sh` kopiert die aktuelle Web-Version jeder App in die iPhone-App. Danach in Xcode wieder Archive → Upload, mit höherer Build-Nummer (Xcode: App → General → Build).
