"""Tests für die TradePing-Wache.  Aufruf:  python3 -m unittest server/test_tradeping_wache.py -v

Die Push-Tests (APNs, Web Push) laufen nur, wenn httpx/PyJWT/pywebpush installiert sind;
sie schicken nichts ins Internet (Antworten werden nachgebaut).
"""
import importlib.util
import json
import os
import tempfile
import threading
import unittest
import urllib.error
import urllib.request

HIER = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("wache", os.path.join(HIER, "tradeping-wache.py"))
W = importlib.util.module_from_spec(spec)
spec.loader.exec_module(W)

GID = "a" * 32
GID2 = "b" * 32
MIN = 60 * 1000


def cfg(**kw):
    env = {"WACHE_DB": ":memory:", "WACHE_COOLDOWN": "3600", "WACHE_ORIGINS": "https://diegorobert-code.github.io,capacitor://localhost"}
    env.update(kw)
    return W.Config(env)


class FakeKurse:
    def __init__(self):
        self.p = {}
        self.aufrufe = []

    def __call__(self, ids):
        self.aufrufe.append(sorted(ids))
        return {k: v for k, v in self.p.items() if k in ids}


class FakeSender:
    def __init__(self, ergebnis="ok", umgebung=None):
        self.gesendet = []
        self.ergebnis = ergebnis
        self.umgebung = umgebung
        self.public_key = "PUB"

    def senden(self, geraet, titel, text, tag, daten):
        self.gesendet.append((geraet["id"], titel, text, tag, daten))
        return self.ergebnis, self.umgebung


def marke(**kw):
    m = {"id": "it1", "sym": "BTC", "cg": "bitcoin", "cur": "USD", "ueber": 70000, "unter": None}
    m.update(kw)
    return m


class BewerteTest(unittest.TestCase):
    def test_ueber_einmal_und_wieder_scharf(self):
        self.assertEqual(W.bewerte("ueber", 100, 99, True, 0, 0, 0), (True, False))
        self.assertEqual(W.bewerte("ueber", 100, 100, True, 0, 0, 0), (False, True))
        self.assertEqual(W.bewerte("ueber", 100, 105, False, 0, 0, 0), (False, False))
        self.assertEqual(W.bewerte("ueber", 100, 99.9, False, 0, 0, 0), (True, False))

    def test_unter(self):
        self.assertEqual(W.bewerte("unter", 50, 51, True, 0, 0, 0), (True, False))
        self.assertEqual(W.bewerte("unter", 50, 49, True, 0, 0, 0), (False, True))

    def test_cooldown_haelt_zurueck_und_bleibt_scharf(self):
        t = 10 * MIN
        self.assertEqual(W.bewerte("ueber", 100, 101, True, t - MIN, t, 60 * MIN), (True, False))
        self.assertEqual(W.bewerte("ueber", 100, 101, True, t - 61 * MIN, t, 60 * MIN), (False, True))

    def test_text(self):
        self.assertEqual(W.ping_text("BTC", "ueber", 70000, 70123.4, "USD"), "BTC über 70’000 USD · jetzt 70’123 USD")
        self.assertEqual(W.ping_text("ADA", "unter", 0.5, 0.49876, "CHF"), "ADA unter 0.5000 CHF · jetzt 0.4988 CHF")


class RundeTest(unittest.TestCase):
    def setUp(self):
        self.kurse = FakeKurse()
        self.apns = FakeSender()
        self.web = FakeSender()
        self.w = W.Wache(cfg(), kurse=self.kurse, apns=self.apns, webpush=self.web)
        self.w.registrieren({"geraet": GID, "art": "apns", "token": "ab" * 32})
        self.w.marken({"geraet": GID, "marken": [marke(unter=60000)]})

    def test_ein_aufruf_fuer_alle_muenzen(self):
        self.w.marken({"geraet": GID2, "marken": [marke(id="x", cg="ethereum", sym="ETH", ueber=5000), marke(id="y")]})
        self.w.runde(1)
        self.assertEqual(self.kurse.aufrufe, [["bitcoin", "ethereum"]])

    def test_kreuzung_genau_ein_ping(self):
        t = 1_000_000
        self.kurse.p = {"bitcoin": {"usd": 65000, "chf": 52000}}
        self.assertEqual(self.w.runde(t), 0)
        self.kurse.p = {"bitcoin": {"usd": 70500}}
        self.assertEqual(self.w.runde(t + MIN), 1)
        self.assertEqual(self.w.runde(t + 2 * MIN), 0)
        self.assertEqual(self.w.runde(t + 3 * MIN), 0)
        gid, titel, text, tag, daten = self.apns.gesendet[0]
        self.assertEqual((gid, titel), (GID, "Deine Marke ist erreicht."))
        self.assertEqual(text, "BTC über 70’000 USD · jetzt 70’500 USD")
        self.assertEqual(tag, "tp-it1über")
        self.assertEqual(daten["dir"], "ueber")
        pings = self.w.pings(GID, 0)["pings"]
        self.assertEqual(len(pings), 1)
        self.assertEqual(pings[0]["kurs"], 70500)

    def test_zurueck_und_wieder_mit_cooldown(self):
        t = 1_000_000
        self.kurse.p = {"bitcoin": {"usd": 71000}}
        self.assertEqual(self.w.runde(t), 1)
        self.kurse.p = {"bitcoin": {"usd": 69000}}
        self.w.runde(t + MIN)
        self.kurse.p = {"bitcoin": {"usd": 71000}}
        self.assertEqual(self.w.runde(t + 2 * MIN), 0, "innerhalb der Ruhezeit kein zweiter Ping")
        self.assertEqual(self.w.runde(t + 61 * MIN), 1, "nach der Ruhezeit, Marke noch erreicht")
        self.assertEqual(self.w.runde(t + 62 * MIN), 0)

    def test_unter_marke_und_waehrung(self):
        self.w.marken({"geraet": GID, "marken": [marke(cur="CHF", ueber=None, unter=50000)]})
        self.kurse.p = {"bitcoin": {"usd": 60000, "chf": 49000}}
        self.assertEqual(self.w.runde(5), 1)
        self.assertIn("unter 50’000 CHF", self.apns.gesendet[0][2])

    def test_ruhe_still_im_verlauf(self):
        self.w.marken({"geraet": GID, "ruhe_bis": 10 ** 13, "marken": [marke()]})
        self.kurse.p = {"bitcoin": {"usd": 71000}}
        self.assertEqual(self.w.runde(1000), 0)
        self.assertEqual(self.apns.gesendet, [])
        self.assertEqual(self.w.pings(GID, 0)["pings"][0]["still"], 1)

    def test_app_hat_schon_gepingt(self):
        self.w.marken({"geraet": GID, "marken": [marke(ueber=1000, scharf_ueber=False)]})
        self.kurse.p = {"bitcoin": {"usd": 71000}}
        self.assertEqual(self.w.runde(1000), 0)

    def test_gleiche_marke_behaelt_zustand(self):
        self.kurse.p = {"bitcoin": {"usd": 71000}}
        self.assertEqual(self.w.runde(1000), 1)
        # App schickt wieder dieselbe Marke (mit ihrem eigenen, alten scharf-Wert) → kein zweiter Ping
        self.w.marken({"geraet": GID, "marken": [marke(unter=60000, scharf_ueber=True)]})
        self.assertEqual(self.w.runde(1000 + 2 * 3600 * 1000), 0)
        # geänderte Marke ist neu scharf
        self.w.marken({"geraet": GID, "marken": [marke(ueber=70500)]})
        self.assertEqual(self.w.runde(1000 + 3 * 3600 * 1000), 1)

    def test_ohne_kurs_nichts(self):
        self.kurse.p = {}
        self.assertEqual(self.w.runde(1), 0)

    def test_abgelaufene_adresse_wird_entfernt(self):
        self.apns.ergebnis = "weg"
        self.kurse.p = {"bitcoin": {"usd": 71000}}
        self.w.runde(1)
        g = self.w.store.q("SELECT art, ziel FROM geraet WHERE id = ?", (GID,))[0]
        self.assertEqual((g["art"], g["ziel"]), ("", ""))

    def test_umgebung_wird_gemerkt(self):
        self.apns.umgebung = "sandbox"
        self.kurse.p = {"bitcoin": {"usd": 71000}}
        self.w.runde(1)
        self.assertEqual(self.w.store.q("SELECT umgebung FROM geraet")[0][0], "sandbox")

    def test_webpush_geraet(self):
        self.w.registrieren({"geraet": GID2, "art": "webpush",
                             "abo": {"endpoint": "https://web.push.apple.com/abc", "keys": {"p256dh": "x", "auth": "y"}}})
        self.w.marken({"geraet": GID2, "marken": [marke(id="z", cg="ethereum", sym="ETH", ueber=5000)]})
        self.kurse.p = {"ethereum": {"usd": 5100}}
        self.assertEqual(self.w.runde(1), 1)
        self.assertEqual(self.web.gesendet[0][0], GID2)
        self.assertEqual(self.apns.gesendet, [])

    def test_sender_fehler_haelt_nicht_an(self):
        class Kaputt:
            def senden(self, *a):
                raise RuntimeError("x")
        self.w.apns = Kaputt()
        self.kurse.p = {"bitcoin": {"usd": 71000}}
        self.assertEqual(self.w.runde(1), 1)

    def test_pflege_entfernt_alte_geraete(self):
        self.w.store.tx(lambda con: con.execute("UPDATE geraet SET gesehen = 0"))
        self.w._pflege(W.GERAET_MAX_ALTER + 10)
        self.assertEqual(self.w.store.q("SELECT COUNT(*) FROM marke")[0][0], 0)


class Http(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.c = cfg(WACHE_DB=os.path.join(self.tmp.name, "w.db"), WACHE_MAX_MARKEN="3", WACHE_RATE="1000")
        self.w = W.Wache(self.c, kurse=FakeKurse(), apns=FakeSender(), webpush=FakeSender())
        self.srv = W.starte_server(self.w, "127.0.0.1", 0)
        self.base = "http://127.0.0.1:%d" % self.srv.server_address[1]
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()

    def tearDown(self):
        self.srv.shutdown()
        self.srv.server_close()
        self.tmp.cleanup()

    def req(self, path, body=None, method=None, origin=None):
        data = json.dumps(body).encode() if body is not None else None
        r = urllib.request.Request(self.base + path, data=data, method=method or ("POST" if data else "GET"))
        if data:
            r.add_header("Content-Type", "application/json")
        if origin:
            r.add_header("Origin", origin)
        try:
            with urllib.request.urlopen(r, timeout=5) as resp:
                raw = resp.read()
                return resp.status, (json.loads(raw) if raw else None), resp.headers
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read() or b"null"), e.headers

    def test_health_info(self):
        self.assertEqual(self.req("/health")[0], 200)
        s, j, _ = self.req("/v1/info")
        self.assertEqual((s, j["vapid"], j["apns"]), (200, "PUB", True))

    def test_ablauf(self):
        s, j, h = self.req("/v1/geraet", {"geraet": GID, "art": "apns", "token": "AB" * 32}, origin="capacitor://localhost")
        self.assertEqual(s, 200)
        self.assertEqual(h["Access-Control-Allow-Origin"], "capacitor://localhost")
        s, j, _ = self.req("/v1/marken", {"geraet": GID, "marken": [marke(unter=1)]})
        self.assertEqual((s, j["marken"]), (200, 2))
        self.w.kurse.p = {"bitcoin": {"usd": 80000}}
        self.w.runde(5000)
        s, j, _ = self.req("/v1/pings?geraet=%s&seit=0" % GID)
        self.assertEqual(len(j["pings"]), 1)
        s, j, _ = self.req("/v1/pings?geraet=%s&seit=5000" % GID)
        self.assertEqual(j["pings"], [])
        s, j, _ = self.req("/v1/loeschen", {"geraet": GID})
        self.assertEqual(s, 200)
        for t in ("geraet", "marke", "ping"):
            self.assertEqual(self.w.store.q("SELECT COUNT(*) FROM %s" % t)[0][0], 0, t)

    def test_cors_fremd_und_preflight(self):
        _, _, h = self.req("/v1/info", origin="https://boese.example")
        self.assertIsNone(h.get("Access-Control-Allow-Origin"))
        s, _, h = self.req("/v1/marken", method="OPTIONS", origin="https://diegorobert-code.github.io")
        self.assertEqual(s, 204)
        self.assertEqual(h["Access-Control-Allow-Origin"], "https://diegorobert-code.github.io")

    def test_pruefungen(self):
        cases = [
            ("/v1/geraet", {"geraet": "kurz", "art": "apns", "token": "ab" * 32}),
            ("/v1/geraet", {"geraet": GID, "art": "sms", "token": "ab" * 32}),
            ("/v1/geraet", {"geraet": GID, "art": "apns", "token": "nicht-hex"}),
            ("/v1/geraet", {"geraet": GID, "art": "webpush", "abo": {"endpoint": "https://intern.example/x", "keys": {"p256dh": "a", "auth": "b"}}}),
            ("/v1/geraet", {"geraet": GID, "art": "webpush", "abo": {"endpoint": "http://web.push.apple.com/x", "keys": {"p256dh": "a", "auth": "b"}}}),
            ("/v1/marken", {"geraet": GID, "marken": [marke(cur="EUR")]}),
            ("/v1/marken", {"geraet": GID, "marken": [marke(ueber=-5)]}),
            ("/v1/marken", {"geraet": GID, "marken": [marke(ueber="viel")]}),
            ("/v1/marken", {"geraet": GID, "marken": [marke(cg="Bit Coin")]}),
            ("/v1/marken", {"geraet": GID, "marken": [marke(id=str(i)) for i in range(4)]}),
            ("/v1/loeschen", {"geraet": "x"}),
        ]
        for path, body in cases:
            self.assertEqual(self.req(path, body)[0], 400, (path, body))
        self.assertEqual(self.req("/v1/marken", {"geraet": GID})[0], 400)
        self.assertEqual(self.req("/v1/nichts", {"a": 1})[0], 404)
        r = urllib.request.Request(self.base + "/v1/marken", data=b"{kaputt", method="POST")
        with self.assertRaises(urllib.error.HTTPError) as e:
            urllib.request.urlopen(r, timeout=5)
        self.assertEqual(e.exception.code, 400)

    def test_web_push_hosts(self):
        for ep in ("https://web.push.apple.com/QW", "https://fcm.googleapis.com/fcm/send/x",
                   "https://updates.push.services.mozilla.com/wpush/v2/x", "https://wns2-db5p.notify.windows.com/w/?token=x"):
            self.assertTrue(W.push_host_ok(ep), ep)
        for ep in ("https://evilpush.apple.com.example/", "https://127.0.0.1/", "https://web.push.apple.com:8443/x"):
            self.assertFalse(W.push_host_ok(ep), ep)

    def test_volle_wache(self):
        self.w.cfg.max_geraete = 1
        self.assertEqual(self.req("/v1/marken", {"geraet": GID, "marken": []})[0], 200)
        self.assertEqual(self.req("/v1/marken", {"geraet": GID2, "marken": []})[0], 503)

    def test_zu_viele_anfragen(self):
        self.w.cfg.rate = 3
        codes = [self.req("/v1/info")[0] for _ in range(5)]
        self.assertEqual(codes[-1], 429)
        self.assertEqual(self.req("/health")[0], 200)


try:
    import httpx  # noqa: F401
    import jwt  # noqa: F401
    import pywebpush  # noqa: F401
    PUSH_LIBS = True
except ImportError:
    PUSH_LIBS = False


@unittest.skipUnless(PUSH_LIBS, "httpx/PyJWT/pywebpush nicht installiert")
class PushTest(unittest.TestCase):
    def test_apns_kopf_und_umgebung(self):
        import httpx
        import jwt
        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.primitives.asymmetric import ec

        key = ec.generate_private_key(ec.SECP256R1())
        pem = key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()).decode()
        gesehen = []

        def antwort(request):
            gesehen.append(request)
            if request.url.host == "api.push.apple.com":
                return httpx.Response(400, json={"reason": "BadDeviceToken"})
            return httpx.Response(200)

        client = httpx.Client(transport=httpx.MockTransport(antwort))
        s = W.ApnsSender(pem, "KEYID12345", "TEAMID1234", "ch.drlab.tradeping", client=client)
        erg = s.senden({"ziel": "ab" * 32, "umgebung": ""}, "T", "Text", "tp-1über", {"id": "1"})
        self.assertEqual(erg, ("ok", "sandbox"))
        r = gesehen[-1]
        self.assertEqual(r.url.path, "/3/device/" + "ab" * 32)
        self.assertEqual(r.headers["apns-topic"], "ch.drlab.tradeping")
        self.assertEqual(r.headers["apns-push-type"], "alert")
        self.assertEqual(r.headers["apns-collapse-id"], "tp-1ueber")
        tok = r.headers["authorization"].split(" ", 1)[1]
        self.assertEqual(jwt.get_unverified_header(tok)["kid"], "KEYID12345")
        claims = jwt.decode(tok, key.public_key(), algorithms=["ES256"])
        self.assertEqual(claims["iss"], "TEAMID1234")
        body = json.loads(r.content)
        self.assertEqual(body["aps"]["alert"], {"title": "T", "body": "Text"})

        client2 = httpx.Client(transport=httpx.MockTransport(lambda req: httpx.Response(410, json={"reason": "Unregistered"})))
        s2 = W.ApnsSender(pem, "K", "T", "ch.drlab.tradeping", client=client2)
        self.assertEqual(s2.senden({"ziel": "ab" * 32, "umgebung": "production"}, "T", "x", "t", {})[0], "weg")

    def test_webpush(self):
        import requests

        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "vapid.pem")
            self.assertEqual(W.main(["x", "vapid", p]), 0)

            class Sess:
                def __init__(self, status):
                    self.status = status
                    self.calls = []

                def post(self, url, data=None, headers=None, timeout=None, **kw):
                    self.calls.append((url, headers))
                    r = requests.Response()
                    r.status_code = self.status
                    r._content = b""
                    return r

            # echter Empfänger-Schlüssel, damit die Verschlüsselung durchläuft
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.primitives.asymmetric import ec
            import base64
            rk = ec.generate_private_key(ec.SECP256R1()).public_key().public_bytes(
                serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)
            b64 = lambda b: base64.urlsafe_b64encode(b).rstrip(b"=").decode()
            abo = json.dumps({"endpoint": "https://web.push.apple.com/xyz", "keys": {"p256dh": b64(rk), "auth": b64(os.urandom(16))}})
            ok = Sess(201)
            s = W.WebPushSender(p, "mailto:test@example.com", session=ok)
            self.assertEqual(len(base64.urlsafe_b64decode(s.public_key + "==")), 65)
            self.assertEqual(s.senden({"ziel": abo}, "T", "x", "t", {})[0], "ok")
            url, headers = ok.calls[0]
            self.assertEqual(url, "https://web.push.apple.com/xyz")
            self.assertIn("vapid", headers["Authorization"].lower())
            s.session = Sess(410)
            self.assertEqual(s.senden({"ziel": abo}, "T", "x", "t", {})[0], "weg")


if __name__ == "__main__":
    unittest.main()
