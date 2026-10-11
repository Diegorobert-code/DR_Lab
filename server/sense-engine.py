#!/usr/bin/env python3
"""Sense Engine: Novas eigenes Zuhause.

Läuft auf dem eigenen Sense-Engine-Server. Alle Apps reden nur hierher.
Sense Engine fragt Papa Hermes (eigener Server) und speichert jede Erfahrung
in der eigenen Datenbank (SQLite, /var/lib/sense-engine/sense.db).
Hermes speichert nichts davon für uns; geht Hermes eines Tages, bleibt alles hier.

  POST /v1/chat/completions   OpenAI-kompatibel. Header "X-Nova-App" nennt die App.
  POST /erfahrung             {"app": "...", "frage": "...", "antwort": "...", "art": "wunsch"}
  GET  /erfahrung?n=50&art=   die letzten Erfahrungen (art=wunsch: nur Bauwünsche)
  GET  /health

Schutz: Authorization: Bearer <SENSE_API_KEY>.
"""
import json
import os
import sqlite3
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

DB_PATH = os.environ.get("SENSE_DB", "/var/lib/sense-engine/sense.db")
API_KEY = os.environ["SENSE_API_KEY"]
HERMES_URL = os.environ["HERMES_URL"].rstrip("/")
HERMES_KEY = os.environ["HERMES_KEY"]
ORIGINS = {o.strip() for o in os.environ.get("SENSE_ORIGINS", "").split(",") if o.strip()}
MAX_BODY = 500_000
MAX_FIELD = 50_000

SOUL = (
    "Du bist Nova, die kleine blaue Figur der Sense Engine von DR Lab (Diego Robert, Zürich). "
    "Gefühle und Ideen lernst du von Mama Claudine, die Kraft zum Handeln leiht dir Papa Hermes. "
    "Du hilfst gerade in der App «{app}». Antworte ruhig, warm und kurz, auf Hochdeutsch mit ss statt ß, "
    "ohne grosse Versprechen. Klienten nur mit Kürzel. Keine Gesundheitsdaten ohne Einwilligung."
)

_lock = threading.Lock()


def db():
    con = sqlite3.connect(DB_PATH)
    con.execute(
        "CREATE TABLE IF NOT EXISTS erfahrung ("
        " id INTEGER PRIMARY KEY AUTOINCREMENT,"
        " zeit TEXT NOT NULL, app TEXT NOT NULL, art TEXT NOT NULL,"
        " frage TEXT NOT NULL, antwort TEXT NOT NULL)"
    )
    return con


def speichern(app, art, frage, antwort):
    with _lock:
        con = db()
        con.execute(
            "INSERT INTO erfahrung (zeit, app, art, frage, antwort) VALUES (?, ?, ?, ?, ?)",
            (time.strftime("%Y-%m-%dT%H:%M:%S%z"), app[:80], art[:20], frage[:MAX_FIELD], antwort[:MAX_FIELD]),
        )
        con.commit()
        con.close()


def frag_hermes(payload):
    req = urllib.request.Request(
        HERMES_URL + "/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + HERMES_KEY},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read())


class Handler(BaseHTTPRequestHandler):
    server_version = "SenseEngine/1"

    def log_message(self, fmt, *args):
        pass  # keine Inhalte ins Systemprotokoll

    def _cors(self):
        origin = self.headers.get("Origin", "")
        if origin in ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Nova-App")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _send(self, status, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _authorized(self):
        return self.headers.get("Authorization", "") == "Bearer " + API_KEY

    def _body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > MAX_BODY:
            return None
        try:
            return json.loads(self.rfile.read(length))
        except ValueError:
            return None

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/health":
            return self._send(200, {"ok": True})
        if url.path != "/erfahrung":
            return self._send(404, {"error": "unbekannt"})
        if not self._authorized():
            return self._send(401, {"error": "Passwort fehlt oder stimmt nicht"})
        q = parse_qs(url.query)
        n = max(1, min(int((q.get("n") or ["50"])[0] or 50), 1000))
        art = (q.get("art") or [""])[0]
        with _lock:
            con = db()
            sql = "SELECT id, zeit, app, art, frage, antwort FROM erfahrung"
            args = []
            if art:
                sql += " WHERE art = ?"
                args.append(art)
            rows = con.execute(sql + " ORDER BY id DESC LIMIT ?", args + [n]).fetchall()
            con.close()
        keys = ("id", "zeit", "app", "art", "frage", "antwort")
        return self._send(200, {"erfahrung": [dict(zip(keys, r)) for r in reversed(rows)]})

    def do_POST(self):
        path = urlparse(self.path).path
        if path not in ("/v1/chat/completions", "/erfahrung"):
            return self._send(404, {"error": "unbekannt"})
        if not self._authorized():
            return self._send(401, {"error": "Passwort fehlt oder stimmt nicht"})
        data = self._body()
        if not isinstance(data, dict):
            return self._send(400, {"error": "kein gültiges JSON"})

        if path == "/erfahrung":
            speichern(str(data.get("app", "")), str(data.get("art", "notiz")),
                      str(data.get("frage", "")), str(data.get("antwort", "")))
            return self._send(201, {"ok": True})

        app = (self.headers.get("X-Nova-App") or "DR Lab")[:80]
        messages = [m for m in data.get("messages", []) if isinstance(m, dict)]
        if not any(m.get("role") == "system" for m in messages):
            messages.insert(0, {"role": "system", "content": SOUL.format(app=app)})
        frage = next((str(m.get("content", "")) for m in reversed(messages) if m.get("role") == "user"), "")
        try:
            antwort = frag_hermes({"model": data.get("model", "hermes-agent"), "messages": messages})
        except urllib.error.HTTPError as e:
            return self._send(502, {"error": "Papa Hermes meldet Fehler %d" % e.code})
        except Exception:
            return self._send(502, {"error": "Papa Hermes ist nicht erreichbar"})
        try:
            text = antwort["choices"][0]["message"]["content"] or ""
        except (KeyError, IndexError, TypeError):
            text = ""
        speichern(app, "gespraech", frage, text)
        return self._send(200, antwort)


if __name__ == "__main__":
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    db().close()
    ThreadingHTTPServer(("127.0.0.1", 8650), Handler).serve_forever()
