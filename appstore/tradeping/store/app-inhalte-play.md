# TradePing – Play Console «App-Inhalte» (alle Antworten)

Unter «Richtlinien → App-Inhalte» der Reihe nach ausfüllen. Gilt für den Store-Bau Version 1.0 (`appstore/tradeping`).

## Datenschutzerklärung
URL: https://diegorobert-code.github.io/DR_Lab/datenschutz/ (nach «Datenschutz Go»)

## Anzeigen
Enthält die App Werbung? → **Nein**

## App-Zugriff
→ **Alle Funktionen sind ohne besondere Zugriffsrechte verfügbar** (kein Login, kein Konto)

## Einstufung (Fragebogen IARC)
- E-Mail: Diegos Mail
- Kategorie: **Alle anderen App-Typen** (Finanzen)
- Gewalt, Sexualität, Sprache, Drogen, Glücksspiel: alles **Nein**
- Interagieren Nutzer miteinander / teilen Inhalte? → **Nein**
- Teilt die App den Standort? → **Nein**
- Digitale Käufe? → **Nein**
- Erwartet: **PEGI 3 / USK 0 / Alle Altersgruppen**

## Zielgruppe und Inhalte
- Altersgruppe: **18 und älter**
- Spricht die App Kinder an? → **Nein**

## Nachrichten-App? → **Nein**
## Gesundheits-App / Gesundheitsfunktionen? → **Nein**
## Finanzfunktionen? → **Keine (keine Anlageberatung, kein Handel, kein Geld in der App)**
## Behörden-App? → **Nein**
## COVID-19? → **Nein**

## Datensicherheit
- Erhebt oder teilt die App erforderliche Nutzerdatentypen? → **Nein**
- (Damit erscheint im Store: «Keine Daten werden mit Dritten geteilt · Keine Daten werden erhoben»)
- Kurse kommen von CoinGecko (nur öffentliche Preise, ohne Kennung). Wenn die Version mit Mr. Ping den eigenen DR-Lab-Server nach Aktienkursen fragt (nur Kürzel), gilt «Keine Daten erhoben» nur, solange der Server diese Abrufe nicht speichert. Sonst: «App-Aktivität → Andere Aktionen», nicht geteilt, Zweck App-Funktionen.

## Konto löschen → entfällt (es gibt kein Konto)

## Berechtigungen der App (Stand 1.0)
- Internet (Standard bei Capacitor)
- Mitteilungen (Ping bei erreichter Marke), Mikrofon (freiwillig, Sprechen mit Mr. Ping)
- Sicherung in die Google-Cloud ausgeschaltet: Daten bleiben nur auf diesem Handy

## Vor dem Upload testen
- Spracheingabe im Android-Bau prüfen: Die Spracherkennung des Browsers (Web Speech) fehlt im Android-WebView oft. Geht sie nicht, Sätze über Sprechen/Diktieren in den Texten streichen oder ein Sprach-Plugin einbauen.
