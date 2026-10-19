#!/usr/bin/env bash
# Alles in einem: Kurs-Ping (Mr. Ping) und KI-Verse auf den Sense-Engine-Server.
# Aufruf auf dem Server:
#   curl -fsSL https://raw.githubusercontent.com/Diegorobert-code/DR_Lab/main/tools/server/alles-install.sh | sudo bash
# Darf mehrmals laufen; gespeicherte Schluessel bleiben.
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "Bitte mit sudo starten." >&2; exit 1; }

echo "=== Teil 1 von 2: Kurs-Ping fuer Mr. Ping"
curl -fsSL "https://raw.githubusercontent.com/Diegorobert-code/DR_Lab/main/tools/server/kursping-install.sh?v=$(date +%s)" | bash \
  || echo "Kurs-Ping hat nicht geklappt. Bitte die letzte Zeile oben an Claude schicken (ohne Schluessel)."

echo
echo "=== Teil 2 von 2: KI-Verse"
curl -fsSL "https://raw.githubusercontent.com/diegorobert-code/stimmraum/kiverse-server/kiverse/install.sh?v=$(date +%s)" | bash

echo
echo "Fertig. Schreib Claude nur «fertig». Die Links oben NICHT abschreiben oder fotografieren:"
echo "deinen KI-Verse-Link einfach markieren, kopieren und am Mac in Safari oeffnen."
