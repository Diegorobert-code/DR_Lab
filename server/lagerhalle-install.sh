#!/usr/bin/env bash
# DR Lab: Lagerhalle von Brix. Hermes (Brix) und Sense Engine (Novas Zuhause) auf EINEM Server.
# Hermes bleibt nur intern erreichbar; die Apps reden nur mit Sense Engine.
# Aufruf in der Konsole des Hermes-Servers:
#   curl -fsSL https://raw.githubusercontent.com/Diegorobert-code/DR_Lab/hermes-server/server/lagerhalle-install.sh | sudo bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Bitte mit sudo starten." >&2
  exit 1
fi

REPO_RAW="https://raw.githubusercontent.com/Diegorobert-code/DR_Lab/hermes-server/server"
ORIGINS="https://diegorobert-code.github.io,https://drlab.ch,https://www.drlab.ch,https://headless-zewdelhstzx-diegoroberttherapy-1412.wix-site-host.com"

echo "== 1/6 System aktualisieren"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git tar ca-certificates openssl caddy ufw python3 sqlite3

echo "== 2/6 Brix (Hermes) installieren"
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash -s -- --non-interactive --skip-browser --skip-computer-use
export PATH="$HOME/.local/bin:$PATH"
command -v hermes >/dev/null || { echo "Hermes nicht gefunden. Bitte Claude ein Foto schicken." >&2; exit 1; }

echo "== 3/6 KI-Anbieter einrichten (hier deinen KI-Schluessel eingeben)"
hermes model </dev/tty

echo "== 4/6 Brix-Schnittstelle einschalten (nur intern)"
HERMES_KEY="$(openssl rand -hex 24)"
ENV_FILE="$HOME/.hermes/.env"
mkdir -p "$HOME/.hermes"
touch "$ENV_FILE"
sed -i '/^API_SERVER_/d' "$ENV_FILE"
cat >>"$ENV_FILE" <<EOF
API_SERVER_ENABLED=true
API_SERVER_KEY=$HERMES_KEY
API_SERVER_HOST=127.0.0.1
API_SERVER_PORT=8642
EOF
chmod 600 "$ENV_FILE"
hermes gateway install --system
hermes gateway start --system

echo "== 5/6 Sense Engine mit eigener Datenbank einrichten"
SENSE_KEY="$(openssl rand -hex 24)"
mkdir -p /opt/sense-engine /var/lib/sense-engine
chmod 700 /var/lib/sense-engine
curl -fsSL "$REPO_RAW/sense-engine.py" -o /opt/sense-engine/sense-engine.py
cat >/etc/sense-engine.env <<EOF
SENSE_API_KEY=$SENSE_KEY
SENSE_ORIGINS=$ORIGINS
HERMES_URL=http://127.0.0.1:8642
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

echo "== 6/6 Sichere Adresse (HTTPS) einrichten"
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
echo " Lagerhalle von Brix steht. Nova kann aufwachen."
echo " Nova-Adresse:   https://$HOST"
echo " Nova-Passwort:  $SENSE_KEY"
echo " Nova-Link fuer alle Apps (auf dem Handy oeffnen):"
echo "   https://diegorobert-code.github.io/DR_Lab/apps/#hermes=https://$HOST"
echo " Die Adresse darf in den Chat, das Passwort NICHT."
echo "=============================================="
