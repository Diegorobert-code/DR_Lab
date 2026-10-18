# Fias Nest in den App Store – deine Schritte

Stand 18.10.2026. Alles ist vorbereitet. Kosten: **CHF 0** (Apple Developer Program ist schon bezahlt). Eingereicht wird erst, wenn du selbst auf «Zur Prüfung einreichen» tippst.

**Vorher (einmal):** Die Datenschutz-Seite muss online sein, Apple verlangt den Link. Dafür brauche ich von dir «Datenschutz Go» und die Kontakt-Mail, die darauf stehen soll.

## Weg A: mit deinem MacBook
1. Xcode aus dem Mac App Store laden, einmal öffnen. Node.js (LTS) von https://nodejs.org installieren. In Xcode: Einstellungen → Accounts → «+» → deine Apple-ID.
2. Terminal öffnen und einfügen:
   ```
   git clone https://github.com/Diegorobert-code/DR_Lab.git ~/DR_Lab
   cd ~/DR_Lab/appstore/fiasnest && npm install && node ../web-bauen.mjs fiasnest && npx cap sync ios
   ```
   (Falls DR_Lab schon da ist: `cd ~/DR_Lab && git pull` und dann die zweite Zeile.)
3. Xcode öffnen:
   ```
   open ~/DR_Lab/appstore/fiasnest/ios/App/App.xcodeproj
   ```
4. Links «App» → «Signing & Capabilities» → Team «Diego Robert».
5. Ausprobieren: iPhone per Kabel, oben dein iPhone wählen, ▶ drücken.
6. App Store Connect (https://appstoreconnect.apple.com) → Apps → «+» → Neue App: iOS, Name `Fias Nest`, Sprache Deutsch, Bundle-ID `ch.drlab.fiasnest`, SKU `drlab-fiasnest`.
7. Xcode: Product → Archive → Distribute App → App Store Connect → Upload.
8. In App Store Connect: Texte aus `texte.md` einfügen, die 5 Bilder aus `screenshots-6.9/` ins Feld «iPhone 6,9 Zoll», Altersfreigabe und Datenschutz wie in `texte.md`, Preis Gratis, Verfügbarkeit nur **Schweiz**.
9. Wenn alles stimmt: «Zur Prüfung einreichen». Das machst du selbst.

## Weg B: ohne Mac (GitHub baut für dich)
Geht, sobald die vier Apple-Schlüssel in GitHub eingetragen sind (siehe appstore/ANLEITUNG.md, Abschnitt «Ohne eigenen Mac»). Dann: Schritt 6 oben, danach GitHub → Actions → «iPhone-Apps bauen» → Run workflow → App `fiasnest`, «Hochladen» anhaken. Danach weiter bei Schritt 8.

## Was in Version 1.0 drin ist
Phönix-Morgen, Am Tag (Koffein-Uhr, Mittagsnest), Sorgen-Nest mit Feuer, Ausglühen, Im Bett (Atmen, Herzschlag-Trommel, Körperreise, Traumreise), Glutmodus, Wegweiser 143/147/144. Alles bleibt auf dem iPhone. Funkenmarkt und Nova kommen später mit einem Update.
