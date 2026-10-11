#!/usr/bin/env bash
# DR Lab: Hermes auf einem frischen Ubuntu-Server einrichten.
# Aufruf in der Server-Konsole:
#   curl -fsSL https://raw.githubusercontent.com/Diegorobert-code/DR_Lab/hermes-server/server/hermes-install.sh | sudo bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Bitte mit sudo starten." >&2
  exit 1
fi

echo "== 1/5 System aktualisieren"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git tar ca-certificates openssl caddy ufw

echo "== 2/5 Hermes installieren"
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash -s -- --non-interactive --skip-browser --skip-computer-use
export PATH="$HOME/.local/bin:$PATH"
command -v hermes >/dev/null || { echo "Hermes nicht gefunden. Bitte Claude Bescheid geben." >&2; exit 1; }

echo "== 3/5 KI-Anbieter einrichten (hier deinen KI-Schluessel eingeben)"
hermes model </dev/tty

echo "== 4/5 Schnittstelle einschalten"
API_KEY="$(openssl rand -hex 24)"
ENV_FILE="$HOME/.hermes/.env"
mkdir -p "$HOME/.hermes"
touch "$ENV_FILE"
sed -i '/^API_SERVER_/d' "$ENV_FILE"
cat >>"$ENV_FILE" <<EOF
API_SERVER_ENABLED=true
API_SERVER_KEY=$API_KEY
API_SERVER_HOST=127.0.0.1
API_SERVER_PORT=8642
API_SERVER_CORS_ORIGINS=https://diegorobert-code.github.io,https://drlab.ch
EOF
chmod 600 "$ENV_FILE"
hermes gateway install --system
hermes gateway start --system

echo "== 5/5 Sichere Adresse (HTTPS) einrichten"
IP="$(curl -fsS https://api.ipify.org)"
HOST="hermes-${IP//./-}.sslip.io"
cat >/etc/caddy/Caddyfile <<EOF
$HOST {
  reverse_proxy 127.0.0.1:8642
}
EOF
systemctl restart caddy
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

echo
echo "=============================================="
echo " Fertig."
echo " Adresse:   https://$HOST"
echo " Passwort:  $API_KEY"
echo " Adresse an Claude schicken (darf in den Chat)."
echo " Passwort NICHT in den Chat, nur in Project settings eintragen."
echo "=============================================="
