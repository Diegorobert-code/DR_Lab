# Figuren-Icons

Jede App zeigt ihre Figur als Home-Bildschirm-Icon (`icon-180/192/512.png`) und als Link-Vorschau (`og.png`, 1200×630).

1. Bild der Figur als `quellen/<app>.png` ablegen (quadratisch, am besten 1024×1024 von Tinko).
2. App in `apps.json` eintragen (Ordner, Name, Zeile).
3. `python3 tools/figur-icons/bau.py`
4. Im `<head>` der App die `og:`-Zeilen ergänzen (Vorlage: `mondschein/index.html`).

Zwischen-Icons stammen aus dem Gesamtbild v3. Das App-Store-Icon (`appstore/<app>/icon-1024.png`) wird separat ersetzt, sobald Tinkos 1024er-Bild da ist.
