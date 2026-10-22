#!/usr/bin/env bash
# Kopiert die Web-App (../zahnboecklein) nach www/ für den nativen Build.
# sw.js wird nicht mitkopiert: In der App gibt es keinen Service Worker.
set -euo pipefail
HIER="$(cd "$(dirname "$0")/.." && pwd)"
QUELLE="$HIER/../zahnboecklein"
ZIEL="$HIER/www"
[ -f "$QUELLE/index.html" ] || { echo "Web-App nicht gefunden: $QUELLE" >&2; exit 1; }
rm -rf "$ZIEL"
mkdir -p "$ZIEL"
# alles ausser Service Worker und versteckten Dateien
(cd "$QUELLE" && tar --exclude='./sw.js' --exclude='./.*' -cf - .) | (cd "$ZIEL" && tar -xf -)
echo "Web-App kopiert nach $ZIEL ($(du -sh "$ZIEL" | cut -f1))"
