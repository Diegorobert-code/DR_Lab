#!/usr/bin/env python3
"""Kurs-Ping fuer Mr. Ping: echte Kurse holen und aufs Handy pingen, wenn ein Kurs faellt.

Laeuft auf dem Sense-Engine-Server, nur auf 127.0.0.1; Caddy leitet /kursping/* hierher.
Nur Python-Standardbibliothek plus das Programm openssl (fuer die Push-Unterschrift).

Kurse kommen von Twelve Data (Schluessel nur in /etc/kursping.env, nie in der App).
Die Benachrichtigung ist ein leerer Web-Push; der Service Worker der App holt sich
den Text danach bei /meldung ab. So braucht es keine Verschluesselung der Nachricht.

Umgebung (/etc/kursping.env):
  TWELVE_KEY    Schluessel von twelvedata.com
  PORT          8653
  DATEN         /var/lib/kursping/daten.json
  VAPID_PEM     /var/lib/kursping/vapid.pem
  TAKT          180   (Sekunden zwischen zwei Pruefungen, nur waehrend die US-Boerse offen ist)

  GET  /health            -> {"ok": true}
  GET  /vapid             -> {"key": "<oeffentlicher Push-Schluessel>"}
  GET  /kurse?s=AAPL,MSFT -> {"AAPL": 231.5, ...}   (Zwischenspeicher 60 s)
  POST /abo               {id?, sub, titel:[{symbol,name,kauf}]} -> {"id": "..."}
  GET  /meldung?ep=...    -> {"titel": "...", "text": "..."}  (ep = Push-Adresse des Handys)
  POST /test?id=...       -> schickt einen Probe-Ping
"""
import base64, datetime, json, os, re, secrets, subprocess, threading, time, urllib.error, urllib.parse, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from zoneinfo import ZoneInfo

KEY = os.environ.get('TWELVE_KEY', '')
PORT = int(os.environ.get('PORT', '8653'))
DATEN = os.environ.get('DATEN', '/var/lib/kursping/daten.json')
PEM = os.environ.get('VAPID_PEM', '/var/lib/kursping/vapid.pem')
TAKT = int(os.environ.get('TAKT', '180'))
HERKUNFT = ('https://diegorobert-code.github.io', 'http://localhost:8799')
MAX_GERAETE = 10
# Stufen gegenueber dem Kaufkurs: jede pingt einmal, bis der Kurs wieder darueber liegt.
STUFEN = [(-5, 'ist 5 % unter deinem Kaufkurs'), (-10, 'ist 10 % unter deinem Kaufkurs'),
          (-15, 'hat deine Verlustgrenze (−15 %) erreicht'), (30, 'ist 30 % im Plus: Zeit, die Hälfte als Gewinn zu markieren')]
SYMBOL = re.compile(r'^[A-Z0-9.:\-]{1,15}$')

sperre = threading.Lock()
cache = {}  # symbol -> (zeit, preis)


def b64(b):
    return base64.urlsafe_b64encode(b).rstrip(b'=').decode()


def laden():
    try:
        with open(DATEN) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {'geraete': {}}


def speichern(d):
    tmp = DATEN + '.neu'
    with open(tmp, 'w') as f:
        json.dump(d, f)
    os.replace(tmp, DATEN)


# --- Web-Push (VAPID, ES256 mit openssl) ---
def oeffentlich():
    der = subprocess.run(['openssl', 'ec', '-in', PEM, '-pubout', '-outform', 'DER'], capture_output=True, check=True).stdout
    return b64(der[-65:])


def unterschrift(daten):
    der = subprocess.run(['openssl', 'dgst', '-sha256', '-sign', PEM], input=daten, capture_output=True, check=True).stdout
    # DER-Folge aus zwei Ganzzahlen r und s -> je 32 Byte
    i = 2 + (1 if der[1] & 0x80 else 0)
    teile = []
    for _ in range(2):
        n = der[i + 1]
        teile.append(der[i + 2:i + 2 + n].lstrip(b'\0').rjust(32, b'\0'))
        i += 2 + n
    return teile[0] + teile[1]


def pushen(sub):
    ziel = sub['endpoint']
    u = urllib.parse.urlparse(ziel)
    kopf = b64(json.dumps({'typ': 'JWT', 'alg': 'ES256'}).encode())
    inhalt = b64(json.dumps({'aud': f'{u.scheme}://{u.netloc}', 'exp': int(time.time()) + 12 * 3600,
                             'sub': 'https://diegorobert-code.github.io/DR_Lab/'}).encode())
    jwt = f'{kopf}.{inhalt}.' + b64(unterschrift(f'{kopf}.{inhalt}'.encode()))
    req = urllib.request.Request(ziel, data=b'', method='POST', headers={
        'TTL': '86400', 'Urgency': 'high', 'Content-Length': '0',
        'Authorization': f'vapid t={jwt}, k={oeffentlich()}'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code


def melden(gid, titel, text):
    with sperre:
        d = laden()
        g = d['geraete'].get(gid)
        if not g:
            return
        g['meldung'] = {'titel': titel, 'text': text, 'zeit': int(time.time())}
        speichern(d)
        sub = g.get('sub')
    status = pushen(sub) if sub else 0
    if status in (404, 410):  # Abo auf dem Handy erloschen
        with sperre:
            d = laden()
            d['geraete'].pop(gid, None)
            speichern(d)
    print('ping', gid[:6], status, text, flush=True)


# --- Kurse ---
def kurse(symbole):
    jetzt = time.time()
    frisch = {s: cache[s][1] for s in symbole if s in cache and jetzt - cache[s][0] < 60}
    fehlen = [s for s in symbole if s not in frisch]
    if fehlen and KEY:
        url = 'https://api.twelvedata.com/price?' + urllib.parse.urlencode({'symbol': ','.join(fehlen), 'apikey': KEY})
        try:
            with urllib.request.urlopen(url, timeout=15) as r:
                antwort = json.load(r)
        except (OSError, ValueError) as e:
            print('kurse fehler', e, flush=True)
            antwort = {}
        if len(fehlen) == 1:
            antwort = {fehlen[0]: antwort}
        for s in fehlen:
            try:
                p = float(antwort[s]['price'])
            except (KeyError, TypeError, ValueError):
                continue
            cache[s] = (jetzt, p)
            frisch[s] = p
    return frisch


def boerse_offen():
    ny = datetime.datetime.now(ZoneInfo('America/New_York'))
    return ny.weekday() < 5 and datetime.time(9, 30) <= ny.time() <= datetime.time(16, 0)


def pruefen():
    with sperre:
        d = laden()
    symbole = sorted({t['symbol'] for g in d['geraete'].values() for t in g.get('titel', []) if t.get('symbol')})
    if not symbole:
        return
    preise = kurse(symbole)
    for gid, g in d['geraete'].items():
        for t in g.get('titel', []):
            p, kauf = preise.get(t.get('symbol')), t.get('kauf')
            if not p or not kauf:
                continue
            pr = (p / kauf - 1) * 100
            schon = set(g.setdefault('gemeldet', {}).get(t['symbol'], []))
            neu = None  # bei einem grossen Sprung nur die staerkste neue Stufe melden
            for stufe, satz in STUFEN:
                erreicht = pr <= stufe if stufe < 0 else pr >= stufe
                if erreicht and stufe not in schon:
                    schon.add(stufe)
                    if neu is None or abs(stufe) > abs(neu[0]):
                        neu = (stufe, satz)
                elif not erreicht and stufe in schon and abs(pr - stufe) > 2:
                    schon.discard(stufe)  # wieder scharf, wenn der Kurs deutlich zurueck ist
            if neu:
                name = t.get('name') or t['symbol']
                melden(gid, f'🔔 Mr. Ping: {name}', f'{name} {neu[1]}. Kurs jetzt {p:.2f} ({pr:+.1f} %).')
            with sperre:
                d2 = laden()
                if gid in d2['geraete']:
                    d2['geraete'][gid].setdefault('gemeldet', {})[t['symbol']] = sorted(schon)
                    speichern(d2)


def waechter():
    while True:
        try:
            if boerse_offen():
                pruefen()
        except Exception as e:  # der Waechter soll nie stehen bleiben
            print('waechter fehler', e, flush=True)
        time.sleep(TAKT)


# --- HTTP ---
class H(BaseHTTPRequestHandler):
    def antwort(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code)
        o = self.headers.get('Origin', '')
        if o in HERKUNFT:
            self.send_header('Access-Control-Allow-Origin', o)
            self.send_header('Vary', 'Origin')
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_OPTIONS(self):
        self.send_response(204)
        o = self.headers.get('Origin', '')
        if o in HERKUNFT:
            self.send_header('Access-Control-Allow-Origin', o)
            self.send_header('Access-Control-Allow-Methods', 'GET, POST')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        if u.path == '/health':
            return self.antwort(200, {'ok': True, 'kurse': bool(KEY), 'boerse_offen': boerse_offen()})
        if u.path == '/vapid':
            return self.antwort(200, {'key': oeffentlich()})
        if u.path == '/kurse':
            s = [x for x in (q.get('s', [''])[0].upper().split(',')) if SYMBOL.match(x)][:8]
            return self.antwort(200, kurse(s))
        if u.path == '/meldung':
            alle = laden()['geraete']
            g = alle.get(q.get('id', [''])[0])
            ep = q.get('ep', [''])[0]
            if not g and ep:  # der Service Worker kennt nur die Push-Adresse
                g = next((x for x in alle.values() if (x.get('sub') or {}).get('endpoint') == ep), None)
            return self.antwort(200, (g or {}).get('meldung') or {'titel': 'Mr. Ping', 'text': 'Schau kurz in die App.'})
        self.antwort(404, {'fehler': 'unbekannt'})

    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        try:
            n = min(int(self.headers.get('Content-Length', 0)), 20000)
            body = json.loads(self.rfile.read(n) or b'{}')
        except ValueError:
            return self.antwort(400, {'fehler': 'json'})
        if u.path == '/abo':
            titel = []
            for t in (body.get('titel') or [])[:8]:
                s = str(t.get('symbol', '')).upper().strip()
                if not SYMBOL.match(s):
                    continue
                try:
                    kauf = float(t.get('kauf')) if t.get('kauf') else None
                except (TypeError, ValueError):
                    kauf = None
                titel.append({'symbol': s, 'name': str(t.get('name', ''))[:40], 'kauf': kauf})
            sub = body.get('sub')
            if sub is not None and not (isinstance(sub, dict) and str(sub.get('endpoint', '')).startswith('https://')):
                return self.antwort(400, {'fehler': 'abo'})
            with sperre:
                d = laden()
                gid = body.get('id') if body.get('id') in d['geraete'] else None
                if not gid:
                    if len(d['geraete']) >= MAX_GERAETE:
                        return self.antwort(429, {'fehler': 'voll'})
                    gid = secrets.token_hex(12)
                    d['geraete'][gid] = {}
                g = d['geraete'][gid]
                g['titel'] = titel
                if sub:
                    g['sub'] = sub
                speichern(d)
            return self.antwort(200, {'id': gid})
        if u.path == '/test':
            gid = q.get('id', [''])[0]
            if gid not in laden()['geraete']:
                return self.antwort(404, {'fehler': 'unbekannt'})
            melden(gid, '🔔 Mr. Ping', 'Probe-Ping: So melde ich mich, wenn ein Kurs fällt.')
            return self.antwort(200, {'ok': True})
        self.antwort(404, {'fehler': 'unbekannt'})

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    os.makedirs(os.path.dirname(DATEN), exist_ok=True)
    threading.Thread(target=waechter, daemon=True).start()
    ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
