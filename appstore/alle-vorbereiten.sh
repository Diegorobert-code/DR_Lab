#!/bin/sh
# Baut alle vier iPhone-Apps aus der aktuellen Web-Version. Auf dem Mac ausführen: ./alle-vorbereiten.sh
set -e
cd "$(dirname "$0")"
for app in mondschein humanspark tradeping jackie; do
  echo "== $app"
  (cd "$app" && npm install --no-fund --no-audit && node ../web-bauen.mjs "$app" && npx cap sync ios)
done
echo "Fertig. Xcode öffnen: open $app/ios/App/App.xcodeproj (oder eine andere App)"
