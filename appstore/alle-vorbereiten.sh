#!/bin/sh
# Baut alle iPhone- und Android-Apps aus der aktuellen Web-Version. Auf dem Mac ausführen: ./alle-vorbereiten.sh
set -e
cd "$(dirname "$0")"
for app in mondschein humanspark tradeping jackie fiasnest kiki mamaaffe fompa foodandflow otti transkript granny carmen waefwaef coinmaker hasi fiakosmos; do
  echo "== $app"
  (cd "$app" && npm install --no-fund --no-audit && node ../web-bauen.mjs "$app" && npx cap sync ios && npx cap sync android)
done
echo "Fertig. Xcode öffnen: open $app/ios/App/App.xcodeproj · Android Studio: npx cap open android (im App-Ordner)"
