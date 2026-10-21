# Otti – Play Console «App-Inhalte» (alle Antworten)

Unter «Richtlinien → App-Inhalte» der Reihe nach ausfüllen. Gilt für den Store-Bau Version 1.0 (`appstore/otti`).

## Datenschutzerklärung
URL: https://diegorobert-code.github.io/DR_Lab/datenschutz/ (nach «Datenschutz Go»)

## Anzeigen
Enthält die App Werbung? → **Nein**

## App-Zugriff
→ **Alle Funktionen sind ohne besondere Zugriffsrechte verfügbar** (kein Login, kein Konto)

## Einstufung (Fragebogen IARC)
- E-Mail: Diegos Mail
- Kategorie: **Alle anderen App-Typen** (Unterhaltung)
- Gewalt, Sexualität, Sprache, Drogen, Glücksspiel: alles **Nein**
- Interagieren Nutzer miteinander / teilen Inhalte? → **Nein**
- Interagieren Nutzer mit KI-generierten Inhalten? → **Ja** (Otti antwortet frei per KI). Nutzer untereinander: **Nein**
- Teilt die App den Standort? → **Nein**
- Digitale Käufe? → **Nein**
- Erwartet: **PEGI 3 / USK 0 / Alle Altersgruppen**

## Zielgruppe und Inhalte
- Altersgruppe: **13–15, 16–17, 18 und älter (Kinder nur mit Eltern)**
- Spricht die App Kinder an? → **Nein**
- Achtung: Otti ist eine Kinderfigur. Google kann die App trotzdem als «spricht Kinder an» einstufen. Dann gelten die Familien-Richtlinien, und das Gespräch über ElevenLabs ist so nicht zulässig (nur zertifizierte Dienste). Vor dem Einreichen klären, siehe «offen».

## Nachrichten-App? → **Nein**
## Gesundheits-App / Gesundheitsfunktionen? → **Nein**
## Finanzfunktionen? → **Keine**
## Behörden-App? → **Nein**
## COVID-19? → **Nein**

## Datensicherheit
- Erhebt oder teilt die App erforderliche Nutzerdatentypen? → **Ja**
- erhoben: «Audio → Sprach- oder Tonaufnahmen» und «Nachrichten → Andere In-App-Nachrichten» (gesprochener Text). Grund: Das Gespräch läuft live über den Sprachdienst ElevenLabs (mit KI-Antwort). Erforderlich (sonst kein Gespräch), Zweck: App-Funktionen. Verschlüsselt übertragen: Ja. Geteilt: Nein (ElevenLabs ist Dienstleister im Auftrag). Löschung auf Wunsch: Ja (per Mail an DR Lab, Löschung beim Dienst anstossen). Ottis Gedächtnis (kurze Zusammenfassung) liegt nur auf dem Handy und lässt sich in der App löschen.

## Konto löschen → entfällt (es gibt kein Konto)

## Berechtigungen der App (Stand 1.0)
- Internet (Standard bei Capacitor)
- Mikrofon (nur während des Gesprächs)
- Sicherung in die Google-Cloud ausgeschaltet: Daten bleiben nur auf diesem Handy

## Vor dem Upload testen
- Spracheingabe im Android-Bau prüfen: Die Spracherkennung des Browsers (Web Speech) fehlt im Android-WebView oft. Geht sie nicht, Sätze über Sprechen/Diktieren in den Texten streichen oder ein Sprach-Plugin einbauen.
