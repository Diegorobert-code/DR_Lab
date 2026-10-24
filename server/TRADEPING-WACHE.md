# TradePing-Wache

Die Wache sorgt dafür, dass TradePing pingt, **auch wenn die App zu ist**.

Heute fragt TradePing CoinGecko nur, solange die App offen ist. Die Wache macht das
Gleiche auf dem Server: jede Minute, Tag und Nacht. Ist eine Marke erreicht, schickt
sie einen Ping aufs iPhone (Apple Push) oder an die Web-App auf dem Home-Bildschirm
(Web Push).

Solange keine Wache-Adresse eingetragen ist, ist alles aus und TradePing verhält
sich genau wie bisher.

## Was die Wache macht

- **Nur Krypto.** Aktien, Indizes und Gold haben in TradePing keinen Live-Kurs (Kurs
  von Hand), darum pingen sie weiterhin nur bei offener App.
- **Ein Aufruf pro Minute** an CoinGecko für alle Münzen zusammen (`simple/price`,
  USD und CHF). Meldet CoinGecko «zu viele Anfragen», macht die Wache von selbst
  eine Pause.
- **Ein Ping pro Durchgang:** Marke erreicht → ein Ping. Der nächste kommt erst,
  wenn der Kurs zurückgeht und die Marke wieder erreicht, und frühestens nach
  einer Stunde (`WACHE_COOLDOWN`), damit es beim Flattern um die Marke nicht
  dauernd pingt.
- **Ruhe-Modus** der App gilt auch hier: der Ping landet still im Verlauf.
- Öffnet man die App, holt sie die Pings der Wache in ihren **Verlauf** (mit dem
  Zeichen «Wache») und pingt dieselbe Marke nicht noch einmal.

## Datenschutz

- Kein Konto, kein Name, keine E-Mail, keine Telefonnummer.
- Die App erzeugt eine **zufällige Geräte-Nummer** (32 Zeichen). Sie ist der
  Schlüssel zu den eigenen Daten.
- Die Wache speichert nur: Geräte-Nummer, Push-Adresse (Apple-Token oder
  Web-Push-Abo), die Krypto-Marken (Kürzel, CoinGecko-ID, Währung, über/unter,
  Preis), die Ruhe-Zeit und die Pings der letzten 14 Tage.
- Daten gehen erst an die Wache, wenn man in TradePing die Mitteilungen erlaubt hat.
- In der App: «Wache aus und Daten dort löschen» löscht alles sofort.
- Geräte, die sich 90 Tage nicht melden, löscht die Wache von selbst.
- Die Wache schreibt keine Geräte-Nummern oder Adressen ins Systemprotokoll.
- Kein Tracking, keine Werbung, keine Weitergabe.
- **Keine Anlageberatung.** TradePing und die Wache handeln nie und sehen kein Konto.

## Die Schnittstelle

| Weg | Zweck |
|---|---|
| `GET /health` | Lebt die Wache? |
| `GET /v1/info` | öffentlicher Web-Push-Schlüssel, ob Apple Push bereit ist |
| `POST /v1/geraet` | Push-Adresse anmelden (`art`: `apns` oder `webpush`) |
| `POST /v1/marken` | alle Krypto-Marken des Geräts ersetzen |
| `GET /v1/pings?geraet=…&seit=…` | Pings seit einem Zeitpunkt (für den Verlauf) |
| `POST /v1/loeschen` | alles zu diesem Gerät löschen |

Schutz: höchstens 50 Marken pro Gerät, 5000 Geräte, 120 Anfragen pro Minute und
Adresse, kleine Anfragen (32 KB). Web-Push-Adressen nur von bekannten
Push-Diensten (Apple, Google, Mozilla, Microsoft).

## Einrichten auf dem Sense-Engine-Server

Die Wache läuft neben der Sense Engine auf demselben Ubuntu-Server, hinter Caddy.
Sie braucht keinen eigenen Server und keine eigene Adresse.

### 1. Programm und Pakete

```bash
sudo apt-get install -y python3-venv
sudo useradd --system --home /var/lib/tradeping-wache --shell /usr/sbin/nologin tradeping-wache
sudo mkdir -p /opt/tradeping-wache /var/lib/tradeping-wache /etc/tradeping-wache
sudo chown tradeping-wache: /var/lib/tradeping-wache && sudo chmod 700 /var/lib/tradeping-wache
REPO_RAW=https://raw.githubusercontent.com/Diegorobert-code/DR_Lab/main/server
sudo curl -fsSL $REPO_RAW/tradeping-wache.py -o /opt/tradeping-wache/tradeping-wache.py
sudo curl -fsSL $REPO_RAW/tradeping-wache-requirements.txt -o /opt/tradeping-wache/requirements.txt
sudo python3 -m venv /opt/tradeping-wache/venv
sudo /opt/tradeping-wache/venv/bin/pip install -r /opt/tradeping-wache/requirements.txt
```

### 2. Web-Push-Schlüssel (einmalig, gratis)

```bash
sudo /opt/tradeping-wache/venv/bin/python /opt/tradeping-wache/tradeping-wache.py vapid /etc/tradeping-wache/vapid.pem
sudo chown root:tradeping-wache /etc/tradeping-wache/vapid.pem && sudo chmod 640 /etc/tradeping-wache/vapid.pem
```

Den öffentlichen Schlüssel muss man nirgends eintragen, die App holt ihn über `/v1/info`.
Den privaten Schlüssel nie weitergeben und nie ins Repo legen.

### 3. Apple-Push-Schlüssel (sobald das Apple-Developer-Konto aktiv ist)

Siehe unten «Welcher Apple-Schlüssel?». Die Datei `AuthKey_<APNS_KEY_ID>.p8` auf den
Server kopieren (z. B. mit `scp`), dann:

```bash
sudo mv AuthKey_<APNS_KEY_ID>.p8 /etc/tradeping-wache/
sudo chown root:tradeping-wache /etc/tradeping-wache/AuthKey_<APNS_KEY_ID>.p8
sudo chmod 640 /etc/tradeping-wache/AuthKey_<APNS_KEY_ID>.p8
```

Ohne diesen Schlüssel läuft die Wache trotzdem (Web Push geht), Apple Push bleibt aus.

### 4. Einstellungen `/etc/tradeping-wache.env`

```bash
sudo tee /etc/tradeping-wache.env >/dev/null <<'EOF'
WACHE_DB=/var/lib/tradeping-wache/wache.db
WACHE_HOST=127.0.0.1
WACHE_PORT=8660
WACHE_ORIGINS=https://diegorobert-code.github.io,capacitor://localhost
WACHE_INTERVALL=60
WACHE_COOLDOWN=3600
APNS_KEY_FILE=/etc/tradeping-wache/AuthKey_<APNS_KEY_ID>.p8
APNS_KEY_ID=<APNS_KEY_ID>
APNS_TEAM_ID=<APPLE_TEAM_ID>
APNS_BUNDLE_ID=ch.drlab.tradeping
VAPID_PRIVATE_KEY_FILE=/etc/tradeping-wache/vapid.pem
VAPID_SUB=mailto:<KONTAKT_EMAIL>
# COINGECKO_API_KEY=<COINGECKO_DEMO_KEY>   (nur falls nötig, siehe Kosten)
EOF
sudo chmod 600 /etc/tradeping-wache.env
```

- `WACHE_ORIGINS`: Adressen, von denen die App die Wache rufen darf.
  `capacitor://localhost` ist die iPhone-App. Läuft TradePing auch unter
  `https://drlab.ch`, diese Adresse dazuschreiben.
- `VAPID_SUB`: eine Kontakt-Adresse für die Push-Dienste (Apple verlangt
  `mailto:` oder `https:`).

### 5. Dienst (systemd)

```bash
sudo tee /etc/systemd/system/tradeping-wache.service >/dev/null <<'EOF'
[Unit]
Description=TradePing-Wache - Pings bei geschlossener App
After=network-online.target
Wants=network-online.target

[Service]
User=tradeping-wache
EnvironmentFile=/etc/tradeping-wache.env
ExecStart=/opt/tradeping-wache/venv/bin/python /opt/tradeping-wache/tradeping-wache.py
Restart=always
RestartSec=5
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
ReadWritePaths=/var/lib/tradeping-wache

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now tradeping-wache
journalctl -u tradeping-wache -n 20 --no-pager
```

Im Protokoll steht, ob «APNs bereit» und «Web Push bereit» sind.

### 6. Caddy: Weg `/tradeping/` zur Wache

Im bestehenden Block der Sense Engine in `/etc/caddy/Caddyfile` (die Zeile mit
`sense-….sslip.io {`) den Weg für die Wache **vor** die Sense Engine setzen:

```
sense-<IP-MIT-STRICHEN>.sslip.io {
  handle_path /tradeping/* {
    reverse_proxy 127.0.0.1:8660
  }
  handle {
    reverse_proxy 127.0.0.1:8650
  }
}
```

```bash
sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy
curl -s https://sense-<IP-MIT-STRICHEN>.sslip.io/tradeping/health     # {"ok": true}
```

Die Sense Engine bleibt dabei unverändert erreichbar. Kein neuer Port in der Firewall nötig.

### 7. Wache in TradePing einschalten

Die Wache-Adresse ist dann `https://sense-<IP-MIT-STRICHEN>.sslip.io/tradeping`.

- **Web-Version:** in `tradeping/index.html` die Zeile `var WACHE_ADRESSE = '';`
  ausfüllen.
- **iPhone-App:** in `appstore/apps.json` bei `tradeping` den Wert `"wache": ""`
  ausfüllen, dann `node appstore/web-bauen.mjs tradeping && npx cap sync ios`
  (im Ordner `appstore/tradeping`). Die iPhone-App nimmt **nur** diesen Wert, nie
  den der Web-Version. So kann man Web und iPhone getrennt einschalten.
- Vorher für die iPhone-App **Datenschutz anpassen** (siehe unten), sonst stimmt
  die Datenschutz-Angabe im App Store nicht mehr.

### Testen

```bash
# Test-Ping an ein Gerät (Geräte-Nummer: in der App, Safari-Entwicklertools: localStorage tp.settings → geraet)
sudo -u tradeping-wache env $(sudo cat /etc/tradeping-wache.env | xargs) \
  /opt/tradeping-wache/venv/bin/python /opt/tradeping-wache/tradeping-wache.py testping <GERAETE_NUMMER>
```

Ein iPhone, auf das die App direkt aus Xcode kommt, nutzt Apples Test-Umgebung
(«sandbox»), TestFlight und App Store die echte. Die Wache merkt das von selbst.

Tests auf dem eigenen Rechner (ohne Internet, ohne Schlüssel):

```bash
python3 -m unittest server/test_tradeping_wache.py -v
```

## Welcher Apple-Schlüssel?

Es braucht **einen APNs-Schlüssel** (Apple Push Notification service). Das ist
**nicht** derselbe Schlüssel wie der App-Store-Connect-API-Schlüssel:

| | APNs-Schlüssel | App-Store-Connect-API-Schlüssel |
|---|---|---|
| Wofür | Pings (Push) aufs iPhone schicken | Apps hochladen, TestFlight, Automatisieren |
| Wo erstellen | developer.apple.com → Certificates, Identifiers & Profiles → **Keys** | App Store Connect → Users and Access → **Integrations** → App Store Connect API |
| Kann Push schicken | ja | **nein** |

Einen App-Store-Connect-Schlüssel kann man also nicht für die Wache brauchen (und
umgekehrt).

So erstellt Diego den APNs-Schlüssel, sobald das Developer-Konto aktiv ist:

1. developer.apple.com → Account → Certificates, Identifiers & Profiles → **Keys** → «+».
2. Name: z. B. «DR Lab Push». Häkchen bei **Apple Push Notifications service (APNs)**,
   «Configure»: Umgebung **Sandbox & Production**, Bereich «Team Scoped (All Topics)»
   (dann gilt er auch für spätere DR-Lab-Apps).
3. «Continue» → «Register» → **Download**. Die `.p8`-Datei gibt es **nur einmal**, gut
   aufbewahren (Passwort-Manager), nie ins Repo, nie in den Chat.
4. Notieren: **Key ID** (10 Zeichen, auf der Schlüssel-Seite) und **Team ID**
   (Membership details, 10 Zeichen). Beides kommt in `/etc/tradeping-wache.env`.
5. Bei der App-ID `ch.drlab.tradeping` (Identifiers) muss «Push Notifications» an
   sein. Mit «Automatically manage signing» macht Xcode das selbst, sobald die App
   mit der Push-Berechtigung signiert wird.

Der Schlüssel läuft nicht ab. Man kann ihn jederzeit dort widerrufen.

## iPhone-App: was eingebaut ist

- Baustein `@capacitor/push-notifications` (Swift Package, wie die übrigen Bausteine).
- `AppDelegate.swift` gibt das Apple-Token an Capacitor weiter.
- `App/App.entitlements` mit `aps-environment` (Xcode stellt beim Archivieren für
  den App Store selbst auf «production» um), in beiden Build-Einstellungen über
  `CODE_SIGN_ENTITLEMENTS` eingetragen.
- `appstore/shared/native.js` meldet das Gerät nur an, wenn die Mitteilungen schon
  erlaubt sind; die App fragt nie zusätzlich.
- Ohne Wache-Adresse wird Push nie angemeldet. Die lokalen Mitteilungen bei
  offener App funktionieren wie bisher.
- Ist die App offen, zeigt iOS den Push nicht zusätzlich an (die App pingt dann
  selbst), damit es nicht doppelt klingelt.

### App Store Version 1.0

- Die Push-Berechtigung braucht **keinen** APNs-Schlüssel zum Signieren. Sie braucht
  nur ein **bezahltes** Developer-Konto (mit einem kostenlosen «Personal Team» lässt
  sich Push nicht signieren). Für den App Store braucht es das bezahlte Konto
  sowieso.
- Falls die Signatur trotzdem hakt (z. B. Konto noch nicht aktiv, Test mit Personal
  Team): in Xcode → Target «App» → Signing & Capabilities → «Push Notifications»
  mit dem Papierkorb entfernen (oder in `project.pbxproj` die beiden Zeilen
  `CODE_SIGN_ENTITLEMENTS = App/App.entitlements;` löschen). Die App läuft dann wie
  bisher, nur ohne Wache. Später wieder hinzufügen.
- Version 1.0 kann mit `"wache": ""` hinaus. Dann sammelt die App keine Daten und
  die Datenschutz-Angabe «Keine Daten erfasst» bleibt richtig.

## Datenschutz-Angaben, wenn die Wache in der iPhone-App an ist

Solange `"wache": ""` ist, verlässt nichts das iPhone ausser den Kursabfragen bei
CoinGecko; `PrivacyInfo.xcprivacy` bleibt darum unverändert («nichts erfasst»).

Sobald die Wache an ist, speichert der eigene Server dauerhaft eine Geräte-Nummer
mit Push-Token und die Marken. Das ist für Apple «erfasst» (nicht «Tracking»: es
wird nichts mit Daten anderer Firmen verknüpft und nichts für Werbung genutzt). Es
ist nicht mit der Identität verknüpft (kein Konto, kein Name). Dann:

1. In `appstore/tradeping/ios/App/App/PrivacyInfo.xcprivacy` bei
   `NSPrivacyCollectedDataTypes` eintragen:

```xml
<key>NSPrivacyCollectedDataTypes</key>
<array>
	<dict>
		<key>NSPrivacyCollectedDataType</key>
		<string>NSPrivacyCollectedDataTypeDeviceID</string>
		<key>NSPrivacyCollectedDataTypeLinked</key>
		<false/>
		<key>NSPrivacyCollectedDataTypeTracking</key>
		<false/>
		<key>NSPrivacyCollectedDataTypePurposes</key>
		<array>
			<string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
		</array>
	</dict>
	<dict>
		<key>NSPrivacyCollectedDataType</key>
		<string>NSPrivacyCollectedDataTypeOtherUserContent</string>
		<key>NSPrivacyCollectedDataTypeLinked</key>
		<false/>
		<key>NSPrivacyCollectedDataTypeTracking</key>
		<false/>
		<key>NSPrivacyCollectedDataTypePurposes</key>
		<array>
			<string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
		</array>
	</dict>
</array>
```

2. In App Store Connect → App-Datenschutz dasselbe angeben: «Kennungen → Geräte-ID»
   und «Benutzerinhalte → Andere Benutzerinhalte», je «nicht mit der Identität
   verknüpft», «kein Tracking», Zweck «App-Funktionalität».
3. In der Datenschutzerklärung von TradePing einen Satz zur Wache ergänzen (was
   gespeichert wird, wie lange, Löschen in der App).

`NSPrivacyTracking` bleibt `false`, es gibt keine Tracking-Domains.

## Kosten

| | pro Monat | pro Jahr |
|---|---|---|
| Server (läuft auf dem bestehenden Sense-Engine-Server) | CHF 0 | CHF 0 |
| Apple Push (APNs) | CHF 0 | CHF 0 |
| Web Push (Apple, Google, Mozilla) | CHF 0 | CHF 0 |
| CoinGecko (öffentliche Schnittstelle, 1 Aufruf pro Minute) | CHF 0 | CHF 0 |
| **Zusätzlich total** | **CHF 0** | **CHF 0** |

Das Apple-Developer-Programm (99 USD pro Jahr) braucht es ohnehin für den App
Store; die Wache kostet nichts dazu. Die Wache braucht rund 30–50 MB Arbeitsspeicher
und kaum Rechenzeit.

CoinGecko ohne Schlüssel erlaubt ein paar Aufrufe pro Minute; die Wache macht einen.
Falls CoinGecko den Server trotzdem bremst: gratis «Demo»-Schlüssel holen
(coingecko.com → Developer Dashboard) und in `COINGECKO_API_KEY` eintragen. Der
Demo-Schlüssel hat ein Monatslimit (rund 10'000 Aufrufe), dann
`WACHE_INTERVALL=300` setzen (alle 5 Minuten, rund 8'600 Aufrufe im Monat).

## Wenn etwas nicht geht

- `journalctl -u tradeping-wache -f` zeigt jede Runde («Runde: … Münzen, … Pings»).
- «APNs: 403 InvalidProviderToken»: Key ID, Team ID oder `.p8`-Datei stimmen nicht.
- «APNs: 400 DeviceTokenNotForTopic»: `APNS_BUNDLE_ID` muss `ch.drlab.tradeping` sein.
- Web Push auf dem iPhone geht nur ab iOS 16.4, nur wenn TradePing auf dem
  Home-Bildschirm liegt und von dort geöffnet wurde.
- Abgelaufene Push-Adressen entfernt die Wache selbst; die App meldet sich beim
  nächsten Öffnen neu an.
