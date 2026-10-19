# Polvia auf Google Play – was nur Diego tun kann

Stand 19.10.2026. Claude hat alles vorbereitet (App-Projekt, Bau auf GitHub, Texte, Grafiken, Formulare, Datenschutz).
Hochgeladen wird nichts automatisch. Öffentlich geht die App erst mit GmbH und gesicherten Marken.

## Kosten
- Google Play Entwicklerkonto: USD 25 einmalig ≈ **CHF 20** (einmal, gilt für alle Apps)
- Android-Handy für die Konto-Bestätigung: **CHF 0** geliehen, oder Occasion ca. CHF 100 (einmal)
- Pro Monat: **CHF 0** · Pro Jahr: **CHF 0** (Apple-Konto läuft separat, schon bezahlt)

## Tag 1
1. Play Console Konto abschliessen: https://play.google.com/console/signup → «Für mich selbst» (persönlich) → USD 25 zahlen → Ausweis hochladen.
2. Kontakt-Mail für den Store nennen (wird öffentlich angezeigt) und «Datenschutz Go» geben, dann stellt Claude die Datenschutzseite online.

## Tag 2
3. Android-Handy bestätigen: Google verlangt bei neuen persönlichen Konten, dass du dich einmal in der App «Google Play Console» auf einem echten Android-Handy anmeldest. Geliehenes Handy reicht.
4. «Schlüssel Go» geben: Claude erstellt den Upload-Schlüssel und legt ihn geschützt bei GitHub ab (nie im Chat).

## Tag 3
5. In der Play Console: «App erstellen» → Name `Polvia` (Arbeitsname), Sprache Deutsch (Schweiz), App, Kostenlos.
6. Datei `.aab` von GitHub (Claude schickt den Link) unter «Testen → Interner Test» hochladen, dich selbst als Tester eintragen. Interner Test = nicht öffentlich, nur eingeladene Personen.

## Danach (erst mit Go)
- Google verlangt bei persönlichen Konten vor der Veröffentlichung einen geschlossenen Test: **12 Tester, 14 Tage am Stück**. Frühestens danach «Produktion».
- Produktion (öffentlich) erst mit GmbH und Marken. Mit einem GmbH-Konto (D-U-N-S-Nummer) entfällt die Testpflicht.

## Was Claude schon erledigt hat
- Android-Projekt `appstore/polvia/android` (Paket `ch.drlab.manager`, Ziel-Android 16, keine Cloud-Sicherung)
- Automatischer Bau auf GitHub: `.github/workflows/android-build.yml` (Test-APK + Play-Bundle)
- Texte: `store/texte-play.md` · Formulare: `store/app-inhalte-play.md` · Datenschutz: `store/datenschutz-polvia.html`
- Grafiken: `store/play-icon-512.png`, `store/play-feature-1024x500.png`, `store/icon-1024.png`
- Screenshots: `store/screenshots-play/play-1…5` (1080 × 1920, mit Titel) · Rohbilder hell/dunkel in `roh/`
- Im Store-Bau ausgeblendet: «Nova mit eigenem Server verbinden» (Version 1.0 = keine Daten erhoben)
