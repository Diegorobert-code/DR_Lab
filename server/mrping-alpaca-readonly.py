#!/usr/bin/env python3
"""DR Lab / Mr. Ping: read-only Alpaca market-data bridge (paper credentials).

No trading endpoints or order submission. Never put Alpaca credentials into GitHub
Pages or browser JavaScript. Deploy behind HTTPS and configure via environment.
"""
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

KEY = os.getenv("ALPACA_PAPER_KEY_ID", "")
SECRET = os.getenv("ALPACA_PAPER_SECRET_KEY", "")
ACCESS = os.getenv("MRPING_BRIDGE_TOKEN", "")
ORIGIN = os.getenv("MRPING_ALLOWED_ORIGIN", "https://diegorobert-code.github.io")
HOST = os.getenv("MRPING_HOST", "0.0.0.0" if os.getenv("RENDER") else "127.0.0.1")
PORT = int(os.getenv("PORT", os.getenv("MRPING_PORT", "8672")))
SYMBOL_RE = re.compile(r"^[A-Z][A-Z0-9.]{0,9}$")
UPSTREAM = "https://data.alpaca.markets/v2/stocks"

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # Never log authentication headers or tokens.

    def reply(self, status, body, origin=None):
        raw = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        if origin == ORIGIN:
            self.send_header("Access-Control-Allow-Origin", ORIGIN)
            self.send_header("Vary", "Origin")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        origin = self.headers.get("Origin", "")
        if origin != ORIGIN:
            self.send_response(403)
            self.end_headers()
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", ORIGIN)
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Max-Age", "600")
        self.end_headers()

    def do_GET(self):
        origin = self.headers.get("Origin", "")
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/health":
            return self.reply(200, {"service": "mrping-alpaca-readonly", "configured": bool(KEY and SECRET and ACCESS)})
        if parsed.path != "/v1/stock":
            return self.reply(404, {"error": "not_found"}, origin)
        # This personal endpoint must additionally be protected by HTTPS,
        # reverse proxy access controls and rate limiting before public deployment.
        if not ACCESS or self.headers.get("Authorization", "") != "Bearer " + ACCESS:
            return self.reply(401, {"error": "unauthorized"}, origin)
        if not KEY or not SECRET:
            return self.reply(503, {"error": "alpaca_not_configured"}, origin)
        q = urllib.parse.parse_qs(parsed.query)
        symbol = q.get("symbol", [""])[0].upper()
        if not SYMBOL_RE.fullmatch(symbol):
            return self.reply(400, {"error": "invalid_symbol"}, origin)
        url = UPSTREAM + "/" + urllib.parse.quote(symbol, safe="") + "/snapshot?feed=iex"
        req = urllib.request.Request(url, headers={
            "APCA-API-KEY-ID": KEY,
            "APCA-API-SECRET-KEY": SECRET,
            "Accept": "application/json",
            "User-Agent": "DRLab-MrPing/0.1",
        })
        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.load(resp)
            trade = data.get("latestTrade") or {}
            quote = data.get("latestQuote") or {}
            self.reply(200, {
                "symbol": symbol, "feed": "iex", "source": "Alpaca",
                "last_price": trade.get("p"), "last_trade_time": trade.get("t"),
                "bid": quote.get("bp"), "ask": quote.get("ap"),
                "quote_time": quote.get("t"),
                "as_of": int(time.time()), "market_coverage": "IEX only; not consolidated US market"
            }, origin)
        except urllib.error.HTTPError as exc:
            # Never return provider tokens, raw errors or HTTP bodies.
            self.reply(502, {"error": "provider_error", "provider_status": exc.code}, origin)
        except (TimeoutError, urllib.error.URLError, ValueError):
            self.reply(502, {"error": "provider_unavailable"}, origin)

if __name__ == "__main__":
    if HOST not in ("127.0.0.1", "::1") and not (os.getenv("RENDER") and HOST == "0.0.0.0"):
        raise SystemExit("Public binding is permitted only behind Render HTTPS; keep MRPING_BRIDGE_TOKEN secret.")
    print("Mr. Ping Alpaca read-only bridge listening on %s:%s" % (HOST, PORT))
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
