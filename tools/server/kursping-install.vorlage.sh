#!/usr/bin/env bash
# Kurs-Ping fuer Mr. Ping auf dem Sense-Engine-Server einrichten.
# (Erzeugt von baue_kursping.py aus kursping.py – nicht von Hand aendern.)
# Aufruf auf dem Server:
#   curl -fsSL https://raw.githubusercontent.com/Diegorobert-code/DR_Lab/main/tools/server/kursping-install.sh | sudo bash
# Darf mehrmals laufen: Kurs-Schluessel und Push-Schluessel bleiben erhalten.
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "Bitte mit sudo starten." >&2; exit 1; }

echo "== 1/5 Programm"
apt-get install -y python3 openssl tzdata >/dev/null 2>&1 || true
id kursping >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin kursping
mkdir -p /opt/kursping /var/lib/kursping
cat >/opt/kursping/kursping.py <<'KURSPING_PROGRAMM_ENDE'
@@PROGRAMM@@
KURSPING_PROGRAMM_ENDE

echo "== 2/5 Push-Schluessel"
[ -f /var/lib/kursping/vapid.pem ] || openssl ecparam -name prime256v1 -genkey -noout -out /var/lib/kursping/vapid.pem
chown -R kursping:kursping /var/lib/kursping
chmod 600 /var/lib/kursping/vapid.pem

echo "== 3/5 Kurs-Schluessel (Twelve Data)"
ALT=""
[ -f /etc/kursping.env ] && ALT="$(grep '^TWELVE_KEY=' /etc/kursping.env | cut -d= -f2- || true)"
if [ -n "$ALT" ]; then
  echo "Schluessel ist schon gespeichert, bleibt."
  TK="$ALT"
else
  printf "Twelve-Data-Schluessel einfuegen (wird nicht angezeigt), dann Enter: "
  read -rs TK </dev/tty; echo
  TK="$(printf '%s' "$TK" | tr -cd 'A-Za-z0-9')"
  [ -n "$TK" ] || { echo "Kein Schluessel eingegeben." >&2; exit 1; }
fi
umask 077
printf 'TWELVE_KEY=%s\nPORT=8653\nDATEN=/var/lib/kursping/daten.json\nVAPID_PEM=/var/lib/kursping/vapid.pem\nTAKT=180\n' "$TK" >/etc/kursping.env
umask 022

cat >/etc/systemd/system/kursping.service <<'KURSPING_DIENST_ENDE'
[Unit]
Description=Kurs-Ping fuer Mr. Ping
After=network-online.target
Wants=network-online.target

[Service]
User=kursping
EnvironmentFile=/etc/kursping.env
ExecStart=/usr/bin/python3 /opt/kursping/kursping.py
Restart=always
RestartSec=5
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/var/lib/kursping
ProtectHome=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
KURSPING_DIENST_ENDE
systemctl daemon-reload
systemctl enable kursping >/dev/null 2>&1
systemctl restart kursping

echo "== 4/5 Adresse /kursping (Caddy)"
CF=/etc/caddy/Caddyfile
if grep -q 'handle_path /kursping/\*' "$CF"; then
  echo "Caddy kennt /kursping schon."
else
  cp "$CF" "$CF.vor-kursping"
  python3 - "$CF" <<'KURSPING_CADDY_ENDE'
import re, sys
p = sys.argv[1]; s = open(p).read()
m = re.search(r'^[^\s#][^\n]*\{[ \t]*$', s, re.M)
if not m:
    sys.exit('Kein Block in der Caddyfile gefunden')
block = "\n  handle_path /kursping/* {\n    reverse_proxy 127.0.0.1:8653\n  }"
open(p + '.neu', 'w').write(s[:m.end()] + block + s[m.end():])
KURSPING_CADDY_ENDE
  if caddy validate --config "$CF.neu" --adapter caddyfile >/dev/null 2>&1; then
    mv "$CF.neu" "$CF"; systemctl reload caddy
  else
    rm -f "$CF.neu"; echo "Caddy-Einstellung ungueltig, alte bleibt aktiv." >&2; exit 1
  fi
fi

echo "== 5/5 Probe"
sleep 2
HOST="$(awk 'NF && $1 !~ /^#/ {print $1; exit}' "$CF")"
curl -fsS http://127.0.0.1:8653/health && echo " lokal ok"
curl -fsS "https://$HOST/kursping/health" && echo " von aussen ok"
echo "Fertig. Kurs-Ping laeuft."
