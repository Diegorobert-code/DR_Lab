# Mondschein mit Otti – Play Console «App-Inhalte» (alle Antworten)

Unter «Richtlinien → App-Inhalte» der Reihe nach ausfüllen. Gilt für den Store-Bau Version 1.0 (`appstore/mondschein`).

## Datenschutzerklärung
URL: https://diegorobert-code.github.io/DR_Lab/datenschutz/ (nach «Datenschutz Go»)

## Anzeigen
Enthält die App Werbung? → **Nein**

## App-Zugriff
→ **Alle Funktionen sind ohne besondere Zugriffsrechte verfügbar** (kein Login, kein Konto)

## Einstufung (Fragebogen IARC)
- E-Mail: Diegos Mail
- Kategorie: **Alle anderen App-Typen** (Bildung)
- Gewalt, Sexualität, Sprache, Drogen, Glücksspiel: alles **Nein**
- Interagieren Nutzer miteinander / teilen Inhalte? → **Nein**
- Teilt die App den Standort? → **Nein**
- Digitale Käufe? → **Nein**
- Erwartet: **PEGI 3 / USK 0 / Alle Altersgruppen**

## Zielgruppe und Inhalte
- Altersgruppe: **5 und jünger, 6–8**
- Spricht die App Kinder an? → **Ja** (Kinder-App, Familien-Richtlinien gelten)
- Am Programm «Von Lehrkräften empfohlen» teilnehmen: freiwillig, später
- Bedingungen dafür (alle erfüllt im Store-Bau): keine Werbung, keine Daten, keine Käufe, Links und Teilen nur hinter der Elternsperre

## Nachrichten-App? → **Nein**
## Gesundheits-App / Gesundheitsfunktionen? → **Nein**
## Finanzfunktionen? → **Keine**
## Behörden-App? → **Nein**
## COVID-19? → **Nein**

## Datensicherheit
- Erhebt oder teilt die App erforderliche Nutzerdatentypen? → **Nein**
- (Damit erscheint im Store: «Keine Daten werden mit Dritten geteilt · Keine Daten werden erhoben»)

## Konto löschen → entfällt (es gibt kein Konto)

## Berechtigungen der App (Stand 1.0)
- Internet (Standard bei Capacitor)
- Mikrofon (nur beim Reden mit Otti, freiwillig), Kamera (im Store-Bau aus)
- Sicherung in die Google-Cloud ausgeschaltet: Daten bleiben nur auf diesem Handy

## Vor dem Upload testen
- Spracheingabe im Android-Bau prüfen: Die Spracherkennung des Browsers (Web Speech) fehlt im Android-WebView oft. Geht sie nicht, Sätze über Sprechen/Diktieren in den Texten streichen oder ein Sprach-Plugin einbauen.
