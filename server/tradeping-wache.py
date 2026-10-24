#!/usr/bin/env python3
"""TradePing-Wache: pingt, auch wenn die TradePing-App zu ist.

Läuft auf dem Sense-Engine-Server (hinter Caddy, HTTPS). Die App meldet eine
zufällige Geräte-Nummer, ihre Push-Adresse und ihre Krypto-Marken. Die Wache
fragt jede Minute CoinGecko (ein einziger Aufruf für alle Münzen) und schickt
einen Ping, sobald eine Marke erreicht ist: einmal pro Durchgang, danach erst
wieder, wenn der Kurs zurückkommt und die Marke neu erreicht (und frühestens
nach der Ruhezeit WACHE_COOLDOWN).

Kein Konto, kein Name, keine E-Mail. Die Geräte-Nummer ist der Schlüssel zu den
eigenen Daten; wer sie nicht kennt, kommt nicht an sie heran.

  GET  /health
  GET  /v1/info                    {"vapid": "<öffentlicher Web-Push-Schlüssel>", "apns": true}
  POST /v1/geraet                  {"geraet": "<32 hex>", "art": "apns", "token": "<hex>"}
                                   {"geraet": "...", "art": "webpush", "abo": {endpoint, keys}}
  POST /v1/marken                  {"geraet": "...", "ruhe_bis": 0, "marken": [{id, sym, cg, cur, ueber, unter,
                                     scharf_ueber, scharf_unter}]}   (ersetzt alle Marken des Geräts)
  GET  /v1/pings?geraet=...&seit=  Pings der Wache seit <ms>, damit die App ihren Verlauf ergänzt
  POST /v1/loeschen                {"geraet": "..."}  löscht alles zu diesem Gerät

Einstellungen nur über Umgebungsvariablen (siehe server/TRADEPING-WACHE.md).
Ohne APNs- oder VAPID-Schlüssel läuft die Wache trotzdem, schickt dann aber
auf diesem Weg nichts.

Befehle:
  python3 tradeping-wache.py                 Dienst starten
  python3 tradeping-wache.py vapid DATEI     Web-Push-Schlüssel erzeugen (einmalig)
  python3 tradeping-wache.py testping GERAET Test-Ping an ein Gerät schicken
"""
import base64
import json
import logging
import os
import re
import sqlite3
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

log = logging.getLogger("wache")

# ---------------------------------------------------------------- Einstellungen


def _env_int(name, default):
    try:
        return int(os.environ.get(name, default))
    except ValueError:
        return default


class Config:
    def __init__(self, env=None):
        e = os.environ if env is None else env
        self.db = e.get("WACHE_DB", "/var/lib/tradeping-wache/wache.db")
        self.host = e.get("WACHE_HOST", "127.0.0.1")
        self.port = int(e.get("WACHE_PORT", "8660"))
        self.origins = {
            o.strip()
            for o in e.get("WACHE_ORIGINS", "https://diegorobert-code.github.io,capacitor://localhost").split(",")
            if o.strip()
        }
        self.intervall = max(30, int(e.get("WACHE_INTERVALL", "60")))
        self.cooldown = max(0, int(e.get("WACHE_COOLDOWN", "3600")))
        self.max_marken = int(e.get("WACHE_MAX_MARKEN", "50"))
        self.max_geraete = int(e.get("WACHE_MAX_GERAETE", "5000"))
        self.rate = int(e.get("WACHE_RATE", "120"))  # Anfragen pro Minute und Adresse
        self.coingecko_key = e.get("COINGECKO_API_KEY", "")
        self.apns_key_file = e.get("APNS_KEY_FILE", "")
        self.apns_key_id = e.get("APNS_KEY_ID", "")
        self.apns_team_id = e.get("APNS_TEAM_ID", "")
        self.apns_topic = e.get("APNS_BUNDLE_ID", "ch.drlab.tradeping")
        self.vapid_key_file = e.get("VAPID_PRIVATE_KEY_FILE", "")
        self.vapid_sub = e.get("VAPID_SUB", "")


# ---------------------------------------------------------------- Datenbank

SCHEMA = """
CREATE TABLE IF NOT EXISTS geraet (
  id TEXT PRIMARY KEY,
  art TEXT NOT NULL DEFAULT '',
  ziel TEXT NOT NULL DEFAULT '',
  umgebung TEXT NOT NULL DEFAULT '',
  ruhe_bis INTEGER NOT NULL DEFAULT 0,
  erstellt INTEGER NOT NULL,
  gesehen INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS marke (
  geraet TEXT NOT NULL,
  item TEXT NOT NULL,
  richtung TEXT NOT NULL,
  sym TEXT NOT NULL,
  cg TEXT NOT NULL,
  cur TEXT NOT NULL,
  preis REAL NOT NULL,
  scharf INTEGER NOT NULL DEFAULT 1,
  letzter_ping INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (geraet, item, richtung)
);
CREATE INDEX IF NOT EXISTS marke_cg ON marke (cg);
CREATE TABLE IF NOT EXISTS ping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  geraet TEXT NOT NULL,
  item TEXT NOT NULL,
  richtung TEXT NOT NULL,
  sym TEXT NOT NULL,
  cur TEXT NOT NULL,
  marke REAL NOT NULL,
  kurs REAL NOT NULL,
  still INTEGER NOT NULL DEFAULT 0,
  zeit INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ping_geraet ON ping (geraet, zeit);
"""


class Store:
    def __init__(self, path):
        self.path = path
        self.lock = threading.Lock()
        if path != ":memory:":
            d = os.path.dirname(path)
            if d:
                os.makedirs(d, exist_ok=True)
        self.con = sqlite3.connect(path, check_same_thread=False)
        self.con.row_factory = sqlite3.Row
        if path != ":memory:":
            self.con.execute("PRAGMA journal_mode=WAL")
        self.con.executescript(SCHEMA)
        self.con.commit()

    def q(self, sql, args=()):
        with self.lock:
            return self.con.execute(sql, args).fetchall()

    def tx(self, fn):
        with self.lock:
            try:
                r = fn(self.con)
                self.con.commit()
                return r
            except Exception:
                self.con.rollback()
                raise


def jetzt_ms():
    return int(time.time() * 1000)


# ---------------------------------------------------------------- Ping-Logik


def bewerte(richtung, preis, kurs, scharf, letzter_ping, jetzt, cooldown_ms):
    """Entscheidet für eine Marke. Gibt (neu_scharf, ping) zurück.

    Wie in der App: eine Marke ist «scharf», bis sie erreicht wird. Dann gibt es
    genau einen Ping, und sie bleibt stumm, bis der Kurs zurückkommt.
    Zusätzlich: nach einem Ping frühestens nach cooldown_ms wieder (gegen Flattern
    um die Marke). In der Ruhezeit bleibt die Marke scharf, der Ping kommt danach,
    falls die Marke dann noch erreicht ist.
    """
    erreicht = kurs >= preis if richtung == "ueber" else kurs <= preis
    if not erreicht:
        return True, False
    if not scharf:
        return False, False
    if letzter_ping and jetzt - letzter_ping < cooldown_ms:
        return True, False
    return False, True


def zahl(v):
    """Wie die App (de-CH): 70’123 · 1.25 · 0.1234"""
    a = abs(v)
    d = 0 if a >= 1000 else 2 if a >= 1 else 4
    return format(v, ",.%df" % d).replace(",", "’")


def ping_text(sym, richtung, marke, kurs, cur):
    wort = "über" if richtung == "ueber" else "unter"
    return "%s %s %s %s · jetzt %s %s" % (sym, wort, zahl(marke), cur, zahl(kurs), cur)


# ---------------------------------------------------------------- Kurse


class CoinGecko:
    URL = "https://api.coingecko.com/api/v3/simple/price"
    PAKET = 100  # IDs pro Aufruf (hält die Adresse kurz)

    def __init__(self, api_key=""):
        self.api_key = api_key
        self.pause_bis = 0.0

    def __call__(self, ids):
        if time.time() < self.pause_bis:
            return {}
        out = {}
        ids = sorted(set(ids))
        for i in range(0, len(ids), self.PAKET):
            teil = ids[i:i + self.PAKET]
            url = self.URL + "?" + urllib.parse.urlencode({"ids": ",".join(teil), "vs_currencies": "usd,chf"})
            headers = {"Accept": "application/json", "User-Agent": "TradePing-Wache/1"}
            if self.api_key:
                headers["x-cg-demo-api-key"] = self.api_key
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=20) as r:
                    data = json.loads(r.read())
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    warte = int(e.headers.get("Retry-After") or 120)
                    self.pause_bis = time.time() + min(max(warte, 60), 600)
                    log.warning("CoinGecko: zu viele Anfragen, Pause %s s", warte)
                else:
                    log.warning("CoinGecko: HTTP %s", e.code)
                return out
            except (urllib.error.URLError, OSError, ValueError) as e:
                log.warning("CoinGecko nicht erreichbar: %s", e)
                return out
            if isinstance(data, dict):
                out.update(data)
            if i + self.PAKET < len(ids):
                time.sleep(2)
        return out


# ---------------------------------------------------------------- Push


class ApnsSender:
    """Apple Push (HTTP/2, Token-Anmeldung mit .p8-Schlüssel)."""

    HOSTS = {"production": "https://api.push.apple.com", "sandbox": "https://api.sandbox.push.apple.com"}

    def __init__(self, key_pem, key_id, team_id, topic, client=None):
        import jwt  # PyJWT[crypto]

        self._jwt = jwt
        self.key = key_pem
        self.key_id = key_id
        self.team_id = team_id
        self.topic = topic
        self._token = None
        self._token_zeit = 0
        if client is None:
            import httpx

            client = httpx.Client(http2=True, timeout=15)
        self.client = client

    def anmelde_token(self, neu=False):
        # Apple: höchstens alle 20 min neu, spätestens nach 60 min.
        if neu or not self._token or time.time() - self._token_zeit > 40 * 60:
            self._token_zeit = int(time.time())
            self._token = self._jwt.encode(
                {"iss": self.team_id, "iat": self._token_zeit}, self.key, algorithm="ES256", headers={"kid": self.key_id}
            )
        return self._token

    def _post(self, umgebung, token, body, tag):
        headers = {
            "authorization": "bearer " + self.anmelde_token(),
            "apns-topic": self.topic,
            "apns-push-type": "alert",
            "apns-priority": "10",
            "apns-expiration": str(int(time.time()) + 3600),
            "apns-collapse-id": tag.replace("ü", "ue").encode("ascii", "ignore").decode()[:64],
        }
        r = self.client.post(self.HOSTS[umgebung] + "/3/device/" + token, content=body, headers=headers)
        grund = ""
        if r.status_code != 200:
            try:
                grund = r.json().get("reason", "")
            except ValueError:
                grund = ""
        return r.status_code, grund

    def senden(self, geraet, titel, text, tag, daten):
        """Gibt (ergebnis, neue_umgebung) zurück; ergebnis: ok | weg | fehler."""
        token = geraet["ziel"]
        body = json.dumps(
            {"aps": {"alert": {"title": titel, "body": text}, "sound": "default", "thread-id": "tradeping"}, "tp": daten},
            ensure_ascii=False,
        ).encode()
        erste = geraet["umgebung"] if geraet["umgebung"] in self.HOSTS else "production"
        reihenfolge = [erste, "sandbox" if erste == "production" else "production"]
        for umgebung in reihenfolge:
            status, grund = self._post(umgebung, token, body, tag)
            if status == 403 and grund == "ExpiredProviderToken":
                self.anmelde_token(neu=True)
                status, grund = self._post(umgebung, token, body, tag)
            if status == 200:
                return "ok", umgebung
            if status == 410 or grund == "Unregistered":
                return "weg", None
            if grund in ("BadDeviceToken", "BadEnvironmentKeyInToken"):
                continue  # Xcode-Testgerät (sandbox) oder umgekehrt: andere Umgebung probieren
            log.warning("APNs: %s %s", status, grund)
            return "fehler", None
        return "weg", None


class WebPushSender:
    """Web Push (VAPID) für die Web-App auf dem Home-Bildschirm."""

    def __init__(self, key_file, sub, session=None):
        from py_vapid import Vapid
        import pywebpush

        self._webpush = pywebpush
        self.vapid = Vapid.from_file(key_file)
        self.sub = sub
        self.session = session

    @staticmethod
    def oeffentlich(vapid):
        from cryptography.hazmat.primitives import serialization

        raw = vapid.public_key.public_bytes(
            serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint
        )
        return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

    @property
    def public_key(self):
        return self.oeffentlich(self.vapid)

    def senden(self, geraet, titel, text, tag, daten):
        try:
            abo = json.loads(geraet["ziel"])
        except ValueError:
            return "weg", None
        try:
            self._webpush.webpush(
                subscription_info=abo,
                data=json.dumps({"title": titel, "body": text, "tag": tag, "tp": daten}, ensure_ascii=False),
                vapid_private_key=self.vapid,
                vapid_claims={"sub": self.sub},
                ttl=3600,
                headers={"Urgency": "high"},
                requests_session=self.session,
            )
            return "ok", None
        except self._webpush.WebPushException as e:
            status = getattr(e.response, "status_code", None)
            if status in (404, 410):
                return "weg", None
            log.warning("Web Push: %s", status or e)
            return "fehler", None


# ---------------------------------------------------------------- Wache


ID_RE = re.compile(r"^[a-f0-9]{32}$")
ITEM_RE = re.compile(r"^[A-Za-z0-9_-]{1,40}$")
CG_RE = re.compile(r"^[a-z0-9-]{1,80}$")
SYM_RE = re.compile(r"^[A-Z0-9.\-]{1,10}$")
APNS_RE = re.compile(r"^[A-Fa-f0-9]{32,200}$")
PUSH_HOSTS = (
    "web.push.apple.com",
    "fcm.googleapis.com",
    "updates.push.services.mozilla.com",
    ".push.apple.com",
    ".push.services.mozilla.com",
    ".notify.windows.com",
)
TAG_MAX = 14 * 24 * 3600 * 1000
GERAET_MAX_ALTER = 90 * 24 * 3600 * 1000


class Fehler(Exception):
    def __init__(self, status, text):
        super().__init__(text)
        self.status = status
        self.text = text


def push_host_ok(endpoint):
    try:
        u = urllib.parse.urlparse(endpoint)
    except ValueError:
        return False
    if u.scheme != "https" or not u.hostname or u.port not in (None, 443):
        return False
    h = u.hostname.lower()
    return any(h == p or (p.startswith(".") and h.endswith(p)) for p in PUSH_HOSTS)


class Wache:
    def __init__(self, cfg, store=None, kurse=None, apns=None, webpush=None):
        self.cfg = cfg
        self.store = store or Store(cfg.db)
        self.kurse = kurse or CoinGecko(cfg.coingecko_key)
        self.apns = apns
        self.webpush = webpush
        self.letzte_pflege = 0

    # ---- Anfragen der App

    def _geraet(self, gid, anlegen):
        if not isinstance(gid, str) or not ID_RE.match(gid):
            raise Fehler(400, "geraet fehlt oder ungültig")
        jetzt = jetzt_ms()

        def fn(con):
            row = con.execute("SELECT id FROM geraet WHERE id = ?", (gid,)).fetchone()
            if row:
                con.execute("UPDATE geraet SET gesehen = ? WHERE id = ?", (jetzt, gid))
                return True
            if not anlegen:
                return False
            n = con.execute("SELECT COUNT(*) FROM geraet").fetchone()[0]
            if n >= self.cfg.max_geraete:
                raise Fehler(503, "Wache ist voll")
            con.execute("INSERT INTO geraet (id, erstellt, gesehen) VALUES (?, ?, ?)", (gid, jetzt, jetzt))
            return True

        return self.store.tx(fn)

    def info(self):
        return {
            "ok": True,
            "vapid": self.webpush.public_key if self.webpush else "",
            "apns": bool(self.apns),
            "intervall": self.cfg.intervall,
        }

    def registrieren(self, d):
        gid = d.get("geraet")
        art = d.get("art")
        if art == "apns":
            token = d.get("token")
            if not isinstance(token, str) or not APNS_RE.match(token):
                raise Fehler(400, "token ungültig")
            ziel = token.lower()
            umgebung = d.get("umgebung") if d.get("umgebung") in ("production", "sandbox") else ""
        elif art == "webpush":
            abo = d.get("abo")
            if not isinstance(abo, dict):
                raise Fehler(400, "abo fehlt")
            ep = abo.get("endpoint")
            keys = abo.get("keys") or {}
            if not isinstance(ep, str) or len(ep) > 1000 or not push_host_ok(ep):
                raise Fehler(400, "endpoint nicht erlaubt")
            p256, auth = keys.get("p256dh"), keys.get("auth")
            if not (isinstance(p256, str) and isinstance(auth, str) and 0 < len(p256) <= 200 and 0 < len(auth) <= 100):
                raise Fehler(400, "keys ungültig")
            ziel = json.dumps({"endpoint": ep, "keys": {"p256dh": p256, "auth": auth}})
            umgebung = ""
        else:
            raise Fehler(400, "art muss apns oder webpush sein")
        self._geraet(gid, True)
        self.store.tx(
            lambda con: con.execute(
                "UPDATE geraet SET art = ?, ziel = ?, umgebung = ? WHERE id = ?", (art, ziel, umgebung, gid)
            )
        )
        return {"ok": True}

    def marken(self, d):
        gid = d.get("geraet")
        liste = d.get("marken")
        if not isinstance(liste, list) or len(liste) > self.cfg.max_marken:
            raise Fehler(400, "marken fehlt oder zu viele")
        ruhe = d.get("ruhe_bis") or 0
        if not isinstance(ruhe, (int, float)) or ruhe < 0:
            raise Fehler(400, "ruhe_bis ungültig")
        neu = []
        for m in liste:
            if not isinstance(m, dict):
                raise Fehler(400, "marke ungültig")
            item, sym, cg, cur = m.get("id"), m.get("sym"), m.get("cg"), m.get("cur")
            if not (isinstance(item, str) and ITEM_RE.match(item)):
                raise Fehler(400, "id ungültig")
            if not (isinstance(sym, str) and SYM_RE.match(sym)):
                raise Fehler(400, "sym ungültig")
            if not (isinstance(cg, str) and CG_RE.match(cg)):
                raise Fehler(400, "cg ungültig")
            if cur not in ("USD", "CHF"):
                raise Fehler(400, "cur muss USD oder CHF sein")
            for richtung, feld, scharf in (("ueber", "ueber", "scharf_ueber"), ("unter", "unter", "scharf_unter")):
                preis = m.get(feld)
                if preis is None:
                    continue
                if isinstance(preis, bool) or not isinstance(preis, (int, float)) or not (0 < preis < 1e12):
                    raise Fehler(400, feld + " ungültig")
                neu.append((item, richtung, sym, cg, cur, float(preis), m.get(scharf) is not False))
        self._geraet(gid, True)

        def fn(con):
            alt = {
                (r["item"], r["richtung"]): r
                for r in con.execute("SELECT * FROM marke WHERE geraet = ?", (gid,)).fetchall()
            }
            con.execute("DELETE FROM marke WHERE geraet = ?", (gid,))
            for item, richtung, sym, cg, cur, preis, scharf_app in neu:
                a = alt.get((item, richtung))
                if a and a["preis"] == preis and a["cg"] == cg and a["cur"] == cur:
                    scharf, letzter = a["scharf"], a["letzter_ping"]  # gleiche Marke: Zustand der Wache behalten
                else:
                    scharf, letzter = (1 if scharf_app else 0), 0  # neue Marke: Zustand der App übernehmen
                con.execute(
                    "INSERT INTO marke (geraet, item, richtung, sym, cg, cur, preis, scharf, letzter_ping)"
                    " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (gid, item, richtung, sym, cg, cur, preis, scharf, letzter),
                )
            con.execute("UPDATE geraet SET ruhe_bis = ? WHERE id = ?", (int(ruhe), gid))
            return len(neu)

        return {"ok": True, "marken": self.store.tx(fn)}

    def pings(self, gid, seit):
        if not self._geraet(gid, False):
            return {"ok": True, "pings": []}
        rows = self.store.q(
            "SELECT item, richtung, sym, cur, marke, kurs, still, zeit FROM ping WHERE geraet = ? AND zeit > ?"
            " ORDER BY zeit LIMIT 200",
            (gid, int(seit)),
        )
        return {"ok": True, "pings": [dict(r) for r in rows]}

    def loeschen(self, d):
        gid = d.get("geraet")
        if not isinstance(gid, str) or not ID_RE.match(gid):
            raise Fehler(400, "geraet fehlt oder ungültig")

        def fn(con):
            for t in ("ping", "marke"):
                con.execute("DELETE FROM %s WHERE geraet = ?" % t, (gid,))
            con.execute("DELETE FROM geraet WHERE id = ?", (gid,))

        self.store.tx(fn)
        return {"ok": True}

    # ---- Wach-Runde

    def runde(self, jetzt=None):
        """Eine Runde: Kurse holen, Marken prüfen, Pings schicken. Gibt Anzahl Pings zurück."""
        jetzt = jetzt or jetzt_ms()
        ids = [r[0] for r in self.store.q("SELECT DISTINCT cg FROM marke")]
        if not ids:
            self._pflege(jetzt)
            return 0
        kurse = self.kurse(ids) or {}
        cooldown = self.cfg.cooldown * 1000

        def fn(con):
            raus = []
            geraete = {r["id"]: r for r in con.execute("SELECT * FROM geraet").fetchall()}
            for m in con.execute("SELECT * FROM marke").fetchall():
                k = kurse.get(m["cg"]) or {}
                kurs = k.get(m["cur"].lower())
                if isinstance(kurs, bool) or not isinstance(kurs, (int, float)) or kurs <= 0:
                    continue
                scharf, ping = bewerte(m["richtung"], m["preis"], kurs, bool(m["scharf"]), m["letzter_ping"], jetzt, cooldown)
                g = geraete.get(m["geraet"])
                still = bool(g and g["ruhe_bis"] > jetzt)
                letzter = jetzt if ping else m["letzter_ping"]
                con.execute(
                    "UPDATE marke SET scharf = ?, letzter_ping = ? WHERE geraet = ? AND item = ? AND richtung = ?",
                    (1 if scharf else 0, letzter, m["geraet"], m["item"], m["richtung"]),
                )
                if not ping:
                    continue
                con.execute(
                    "INSERT INTO ping (geraet, item, richtung, sym, cur, marke, kurs, still, zeit)"
                    " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (m["geraet"], m["item"], m["richtung"], m["sym"], m["cur"], m["preis"], kurs, int(still), jetzt),
                )
                if g and not still and g["ziel"]:
                    raus.append((dict(g), dict(m), kurs))
            return raus

        raus = self.store.tx(fn)
        for g, m, kurs in raus:
            self._schicken(g, m, kurs)
        log.info("Runde: %d Münzen, %d Kurse, %d Pings", len(ids), len(kurse), len(raus))
        self._pflege(jetzt)
        return len(raus)

    def _schicken(self, g, m, kurs):
        sender = self.apns if g["art"] == "apns" else self.webpush if g["art"] == "webpush" else None
        if not sender:
            return
        tag = "tp-" + m["item"] + ("über" if m["richtung"] == "ueber" else "unter")
        daten = {"id": m["item"], "dir": m["richtung"], "mark": m["preis"], "p": kurs, "cur": m["cur"], "sym": m["sym"]}
        try:
            ergebnis, umgebung = sender.senden(
                g, "Deine Marke ist erreicht.", ping_text(m["sym"], m["richtung"], m["preis"], kurs, m["cur"]), tag, daten
            )
        except Exception as e:  # ein Fehler darf die Wache nie anhalten
            log.warning("Push fehlgeschlagen: %s", type(e).__name__)
            return
        if ergebnis == "weg":
            log.info("Push-Adresse von %s… ist abgelaufen, entfernt", g["id"][:6])
            self.store.tx(lambda con: con.execute("UPDATE geraet SET art = '', ziel = '' WHERE id = ?", (g["id"],)))
        elif umgebung and umgebung != g["umgebung"]:
            self.store.tx(lambda con: con.execute("UPDATE geraet SET umgebung = ? WHERE id = ?", (umgebung, g["id"])))

    def _pflege(self, jetzt):
        if jetzt - self.letzte_pflege < 3600 * 1000:
            return
        self.letzte_pflege = jetzt

        def fn(con):
            alt = [r[0] for r in con.execute("SELECT id FROM geraet WHERE gesehen < ?", (jetzt - GERAET_MAX_ALTER,))]
            for gid in alt:
                for t in ("ping", "marke"):
                    con.execute("DELETE FROM %s WHERE geraet = ?" % t, (gid,))
                con.execute("DELETE FROM geraet WHERE id = ?", (gid,))
            con.execute("DELETE FROM ping WHERE zeit < ?", (jetzt - TAG_MAX,))
            return len(alt)

        n = self.store.tx(fn)
        if n:
            log.info("Pflege: %d alte Geräte entfernt", n)

    def schleife(self, stop):
        while not stop.is_set():
            t0 = time.time()
            try:
                self.runde()
            except Exception:
                log.exception("Runde fehlgeschlagen")
            stop.wait(max(5, self.cfg.intervall - (time.time() - t0)))


# ---------------------------------------------------------------- HTTP

MAX_BODY = 32_000


class Handler(BaseHTTPRequestHandler):
    server_version = "TradePingWache/1"
    wache = None  # wird gesetzt
    _zaehler = {}
    _zlock = threading.Lock()

    def log_message(self, fmt, *args):
        pass  # keine Adressen und Geräte-Nummern ins Systemprotokoll

    def _ip(self):
        ip = self.client_address[0]
        if ip in ("127.0.0.1", "::1"):  # hinter Caddy
            ip = (self.headers.get("X-Forwarded-For") or ip).split(",")[0].strip()
        return ip

    def _zu_viel(self):
        minute = int(time.time() // 60)
        with self._zlock:
            if len(self._zaehler) > 10000:
                self._zaehler.clear()
            k = (self._ip(), minute)
            self._zaehler[k] = self._zaehler.get(k, 0) + 1
            for alt in [x for x in self._zaehler if x[1] < minute]:
                del self._zaehler[alt]
            return self._zaehler[k] > self.wache.cfg.rate

    def _cors(self):
        origin = self.headers.get("Origin", "")
        if origin in self.wache.cfg.origins:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Max-Age", "86400")

    def _send(self, status, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return None
        if length <= 0 or length > MAX_BODY:
            return None
        try:
            d = json.loads(self.rfile.read(length))
        except ValueError:
            return None
        return d if isinstance(d, dict) else None

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == "/health":
            return self._send(200, {"ok": True})
        if self._zu_viel():
            return self._send(429, {"error": "zu viele Anfragen"})
        try:
            if url.path == "/v1/info":
                return self._send(200, self.wache.info())
            if url.path == "/v1/pings":
                q = urllib.parse.parse_qs(url.query)
                seit = (q.get("seit") or ["0"])[0]
                try:
                    seit = int(seit)
                except ValueError:
                    seit = 0
                return self._send(200, self.wache.pings((q.get("geraet") or [""])[0], seit))
        except Fehler as e:
            return self._send(e.status, {"error": e.text})
        return self._send(404, {"error": "unbekannt"})

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        wege = {"/v1/geraet": "registrieren", "/v1/marken": "marken", "/v1/loeschen": "loeschen"}
        if path not in wege:
            return self._send(404, {"error": "unbekannt"})
        if self._zu_viel():
            return self._send(429, {"error": "zu viele Anfragen"})
        d = self._body()
        if d is None:
            return self._send(400, {"error": "kein gültiges JSON"})
        try:
            return self._send(200, getattr(self.wache, wege[path])(d))
        except Fehler as e:
            return self._send(e.status, {"error": e.text})


def baue_sender(cfg):
    apns = webpush = None
    if cfg.apns_key_file and cfg.apns_key_id and cfg.apns_team_id:
        with open(cfg.apns_key_file) as f:
            apns = ApnsSender(f.read(), cfg.apns_key_id, cfg.apns_team_id, cfg.apns_topic)
        log.info("APNs bereit (%s)", cfg.apns_topic)
    else:
        log.info("APNs aus: APNS_KEY_FILE, APNS_KEY_ID oder APNS_TEAM_ID fehlt")
    if cfg.vapid_key_file and cfg.vapid_sub:
        webpush = WebPushSender(cfg.vapid_key_file, cfg.vapid_sub)
        log.info("Web Push bereit")
    else:
        log.info("Web Push aus: VAPID_PRIVATE_KEY_FILE oder VAPID_SUB fehlt")
    return apns, webpush


def starte_server(wache, host, port):
    handler = type("WacheHandler", (Handler,), {"wache": wache, "_zaehler": {}})
    srv = ThreadingHTTPServer((host, port), handler)
    srv.daemon_threads = True
    return srv


def main(argv):
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    if len(argv) >= 3 and argv[1] == "vapid":
        from py_vapid import Vapid

        v = Vapid()
        v.generate_keys()
        v.save_key(argv[2])
        os.chmod(argv[2], 0o600)
        print("Privater Schlüssel gespeichert:", argv[2])
        print("Öffentlicher Schlüssel (für die App, kommt automatisch über /v1/info):")
        print(WebPushSender.oeffentlich(v))
        return 0
    cfg = Config()
    apns, webpush = baue_sender(cfg)
    wache = Wache(cfg, apns=apns, webpush=webpush)
    if len(argv) >= 3 and argv[1] == "testping":
        rows = wache.store.q("SELECT * FROM geraet WHERE id = ?", (argv[2],))
        if not rows or not rows[0]["ziel"]:
            print("Gerät unbekannt oder ohne Push-Adresse.")
            return 1
        m = {"item": "test", "richtung": "ueber", "preis": 1.0, "cur": "USD", "sym": "TEST"}
        wache._schicken(dict(rows[0]), m, 1.0)
        print("Test-Ping geschickt (siehe Meldungen oben).")
        return 0
    srv = starte_server(wache, cfg.host, cfg.port)
    stop = threading.Event()
    threading.Thread(target=wache.schleife, args=(stop,), daemon=True).start()
    log.info("TradePing-Wache hört auf %s:%s, Runde alle %s s", cfg.host, cfg.port, cfg.intervall)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        stop.set()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
