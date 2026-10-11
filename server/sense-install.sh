#!/usr/bin/env bash
# DR Lab: Sense Engine (Novas Zuhause, eigene Datenbank) auf ihrem eigenen Ubuntu-Server einrichten.
# Zuerst den Hermes-Server einrichten, dann hier Hermes-Adresse und -Passwort eingeben.
# Aufruf in der Konsole des Sense-Engine-Servers:
#   curl -fsSL https://raw.githubusercontent.com/Diegorobert-code/DR_Lab/hermes-server/server/sense-install.sh | sudo bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Bitte mit sudo starten." >&2
  exit 1
fi

REPO_RAW="https://raw.githubusercontent.com/Diegorobert-code/DR_Lab/hermes-server/server"
ORIGINS="https://diegorobert-code.github.io,https://drlab.ch,https://www.drlab.ch,https://headless-zewdelhstzx-diegoroberttherapy-1412.wix-site-host.com"

echo "== 1/4 System aktualisieren"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates openssl caddy ufw python3 sqlite3

echo "== 2/4 Verbindung zu Papa Hermes"
read -r -p "Hermes-Adresse (https://hermes-...sslip.io): " HERMES_URL </dev/tty
read -r -s -p "Hermes-Passwort: " HERMES_KEY </dev/tty
echo
case "$HERMES_URL" in https://*) ;; *) HERMES_URL="https://$HERMES_URL" ;; esac

echo "== 3/4 Sense Engine mit eigener Datenbank einrichten"
API_KEY="$(openssl rand -hex 24)"
mkdir -p /opt/sense-engine /var/lib/sense-engine
chmod 700 /var/lib/sense-engine
curl -fsSL "$REPO_RAW/sense-engine.py" -o /opt/sense-engine/sense-engine.py
cat >/etc/sense-engine.env <<EOF
SENSE_API_KEY=$API_KEY
SENSE_ORIGINS=$ORIGINS
HERMES_URL=$HERMES_URL
HERMES_KEY=$HERMES_KEY
EOF
chmod 600 /etc/sense-engine.env
cat >/etc/systemd/system/sense-engine.service <<'EOF'
[Unit]
Description=Sense Engine - Novas Zuhause
After=network.target

[Service]
EnvironmentFile=/etc/sense-engine.env
ExecStart=/usr/bin/python3 /opt/sense-engine/sense-engine.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now sense-engine

echo "== 4/4 Sichere Adresse (HTTPS) einrichten"
IP="$(curl -fsS https://api.ipify.org)"
HOST="sense-${IP//./-}.sslip.io"
cat >/etc/caddy/Caddyfile <<EOF
$HOST {
  reverse_proxy 127.0.0.1:8650
}
EOF
systemctl restart caddy
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

echo
echo "=============================================="
echo " Sense Engine ist bereit. Nova kann aufwachen."
echo " Sense-Adresse:   https://$HOST"
echo " Sense-Passwort:  $API_KEY"
echo " Nova-Link fuer alle Apps (auf dem Handy oeffnen):"
echo "   https://diegorobert-code.github.io/DR_Lab/apps/#hermes=https://$HOST"
echo " Die Adresse darf in den Chat, das Passwort NICHT."
echo "=============================================="
