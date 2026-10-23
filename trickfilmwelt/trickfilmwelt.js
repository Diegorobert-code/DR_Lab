/* trickfilmwelt.js – Kinder-Apps im Look des ersten DR-Lab-Films (DR Lab Markenfilm, 0:08–0:13 Buch und Technik, 0:28–0:33 Glaswand).
   Eingang: die Figur der App läuft zur Glasbaustein-Wand, legt die Hände an, die Steine weichen zurück,
   warmes Licht, dahinter das offene Buch mit der Welt der App; eine Seite blättert um und die App ist da.
   Danach bleibt die App in dieser Welt: Hintergrund aus dem Film, Buchrand, goldene Rahmen, Seiten blättern.

   Einbau (als erstes im <body>, ohne defer, damit nichts von der App aufblitzt):
     <script src="../trickfilmwelt/trickfilmwelt.js" data-app="otti"
       data-buch="trickfilm/buch.webp" data-welt="trickfilm/welt.webp" data-figur="trickfilm/figur.webp"
       data-arme="1"                 (Figur ohne erhobene Hände: Pfoten heben sich als Schattenriss)
       data-haende="0.17,0.39;0.8,0.37" (sonst: Handpunkte im Figurbild, Anteile 0–1)
       data-text="Otti wartet im Mondschein-Wald"
       data-karten=".buehne,.z.otti" (goldener Seitenrand)
       data-blaetter=".blatt>.blattinnen;.eltern" (beim Öffnen wie eine Seite einblättern; links Auslöser, rechts was sich bewegt)
       data-nacht="1"                (Mondlicht statt Abendgold)
       data-knoepfe=".kimu">  (Knöpfe, die ein Tippen während des Eingangs trotzdem erreicht)
   Ganz beim ersten Öffnen am Tag, sonst 1 Sekunde. Tippen überspringt. prefers-reduced-motion: nur ruhiges Ein- und Ausblenden.
   Wartet, solange die NDA-Sperre offen ist. Kein Ton. Kein Blitzen. ?tfw=voll zeigt den ganzen Eingang. */
(function () {
  "use strict";
  if (window.Trickfilmwelt) return;
  var d = document, html = d.documentElement;
  var me = d.currentScript || d.querySelector('script[src*="trickfilmwelt.js"]');
  var ds = (me && me.dataset) || {};
  var BASIS = (me && me.src ? me.src : location.href).replace(/[^\/]*([?#].*)?$/, "");
  var APP = ds.app || location.pathname;
  var NACHT = ds.nacht === "1";
  var RUHIG = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  function q(s) { return (s || "").split(";").map(function (x) { return x.trim(); }).filter(Boolean); }
  function zahlen(s) { return q(s).map(function (p) { return p.split(",").map(Number); }); }

  /* ── Bleibende Welt (gilt sofort, auch hinter dem Eingang) ─────────────────── */
  html.classList.add("tfw");
  if (NACHT) html.classList.add("tfw-nacht");
  var css = d.createElement("link"); css.rel = "stylesheet"; css.href = BASIS + "trickfilmwelt.css";
  (d.head || html).appendChild(css);

  function welt() {
    if (d.getElementById("tfw-welt")) return;
    var w = d.createElement("div"); w.id = "tfw-welt"; w.setAttribute("aria-hidden", "true");
    if (ds.welt) w.style.setProperty("--tfw-welt-bild", 'url("' + new URL(ds.welt, location.href).href + '")');
    w.innerHTML = '<i class="tfw-netz"></i><svg class="tfw-band" viewBox="0 0 400 800" preserveAspectRatio="none"><defs><linearGradient id="tfwG" x1="0" x2="1">' +
      '<stop offset="0" stop-color="#ffd27a" stop-opacity="0"/><stop offset=".5" stop-color="#ffe2a8"/><stop offset="1" stop-color="#ffb84d" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="M-20 690 C 90 610, 140 720, 230 600 S 360 470, 430 520" fill="none" stroke="url(#tfwG)" stroke-width="9" stroke-linecap="round" opacity=".28"/>' +
      '<path d="M-20 690 C 90 610, 140 720, 230 600 S 360 470, 430 520" fill="none" stroke="url(#tfwG)" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>';
    d.body.insertBefore(w, d.body.firstChild);
    var r = d.createElement("div"); r.id = "tfw-rand"; r.setAttribute("aria-hidden", "true");
    d.body.appendChild(r);
    w.querySelector(".tfw-netz").style.backgroundImage = 'url("' + BASIS + 'netz.webp")';
  }

  function karten() {
    q(ds.karten).forEach(function (s) { try { d.querySelectorAll(s).forEach(function (e) { e.classList.add("tfw-karte"); }); } catch (e) {} });
  }

  /* Seiten blättern: wird ein Fenster sichtbar, blättert sein Inhalt wie eine Buchseite ein */
  var blaetter = q(ds.blaetter).map(function (p) { var t = p.split(">"); return { an: t[0].trim(), innen: (t[1] || "").trim() }; });
  var sichtbar = new WeakMap();
  function istSichtbar(e) { return !e.hidden && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden"; }
  function blaettern(el) {
    el.classList.remove("tfw-blaettern"); void el.offsetWidth; el.classList.add("tfw-blaettern");
    el.addEventListener("animationend", function f(ev) { if (ev.target !== el) return; el.classList.remove("tfw-blaettern"); el.removeEventListener("animationend", f); });
  }
  function pruefen(e) {
    blaetter.forEach(function (b) {
      var treffer; try { treffer = e.matches(b.an); } catch (x) { return; }
      if (!treffer) return;
      var jetzt = istSichtbar(e), vorher = sichtbar.get(e) || false;
      sichtbar.set(e, jetzt);
      if (jetzt && !vorher) { var ziel = b.innen ? e.querySelector(b.innen) : e; if (ziel) blaettern(ziel); }
    });
  }
  function beobachten() {
    if (!blaetter.length || !window.MutationObserver) return;
    blaetter.forEach(function (b) { try { d.querySelectorAll(b.an).forEach(function (e) { sichtbar.set(e, istSichtbar(e)); }); } catch (x) {} });
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) { var t = ms[i].target; if (t.nodeType === 1) pruefen(t); }
    }).observe(d.body, { subtree: true, attributes: true, attributeFilter: ["hidden", "open", "class"] });
  }

  /* ── Eingang ──────────────────────────────────────────────────────────────── */
  function heute() { var t = new Date(); return t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate(); }
  var KEY = "trickfilmwelt:" + APP;
  function lade(src) { return new Promise(function (ok) { if (!src) return ok(null); var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src; }); }

  var ov = null, laeuft = false;
  function eingang(modus) {
    if (laeuft) return; laeuft = true;
    ov = d.createElement("div"); ov.id = "tfw-eingang"; ov.setAttribute("aria-hidden", "true");
    ov.style.cssText = "position:fixed;inset:0;z-index:2147482900;background:" + (NACHT ? "#070b1c" : "#0b0d18") + ";cursor:pointer;touch-action:none";
    var cv = d.createElement("canvas"); ov.appendChild(cv);
    var schatten = d.createElement("i"); schatten.className = "tfw-seitenschatten"; ov.appendChild(schatten);
    var tx = null;
    if (ds.text) { tx = d.createElement("div"); tx.className = "tfw-text"; tx.textContent = ds.text; ov.appendChild(tx); }
    d.body.appendChild(ov);
    var ctx = cv.getContext("2d"), W, H, dpr = Math.min(2, window.devicePixelRatio || 1);
    function groesse() { W = innerWidth; H = innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; cv.style.height = H + "px"; }
    groesse(); addEventListener("resize", groesse);

    var fertig = false, t0 = 0, raf = 0;
    function ende(schnell) {
      if (fertig) return; fertig = true;
      ov.classList.add(schnell || RUHIG ? "tfw-weg-sanft" : "tfw-umblaettern");
      setTimeout(function () { cancelAnimationFrame(raf); removeEventListener("resize", groesse); ov.remove(); ov = null; laeuft = false;
        try { window.dispatchEvent(new CustomEvent("trickfilmwelt-fertig", { detail: { app: APP } })); } catch (e) {} }, schnell || RUHIG ? 420 : modus === "kurz" ? 620 : 900);
    }
    /* Tippen überspringt; trifft es einen App-Knopf (z.B. Musik), wird der danach auch ausgelöst */
    ov.addEventListener("pointerdown", function (e) {
      var x = e.clientX, y = e.clientY;
      ov.style.pointerEvents = "none";
      var k = null;
      q(ds.knoepfe || ".kimu").forEach(function (s) {
        if (k) return;
        try { d.querySelectorAll(s).forEach(function (b) { var r = b.getBoundingClientRect(); if (!k && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) k = b; }); } catch (x2) {}
      });
      ende(true);
      if (k) setTimeout(function () { k.click(); }, 0);
    });
    addEventListener("keydown", function f(e) { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { removeEventListener("keydown", f); ende(true); } });

    Promise.all([lade(BASIS + "wand.webp"), lade(ds.buch), lade(ds.figur), lade(BASIS + "netz.webp")]).then(function (b) {
      var wand = b[0], buch = b[1], fig = b[2], netz = b[3];
      if (!buch) { ende(true); return; }
      if (modus === "voll" && (!wand || !fig)) modus = "kurz";
      if (tx) setTimeout(function () { if (tx) tx.classList.add("an"); }, modus === "voll" ? 7300 : 60);
      var DAUER = modus === "voll" ? 10200 : modus === "ruhig" ? 1300 : 380;
      if (modus === "kurz") ov.classList.add("tfw-kurz");
      var silh = fig ? schattenriss(fig) : null;
      var staub = []; for (var i = 0; i < 46; i++) staub.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.8, v: .004 + Math.random() * .01, p: Math.random() * 6.3 });
      t0 = performance.now();
      function bild(now) {
        if (fertig) return;
        var t = (now - t0) / 1000;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = NACHT ? "#070b1c" : "#0b0d18"; ctx.fillRect(0, 0, W, H);
        if (modus === "voll") voll(t); else buchSzene(t + 2, 1, modus === "ruhig" ? 1 : Math.min(1, t / .25));
        if (t * 1000 >= DAUER) { ende(false); return; }
        raf = requestAnimationFrame(bild);
      }
      raf = requestAnimationFrame(bild);

      /* Figur als Schattenriss mit Gegenlicht (von hinten gesehen, wie die Frau vor der Wand im Film) */
      function schattenriss(img) {
        var c = d.createElement("canvas"), g = d.createElement("canvas");
        c.width = g.width = img.naturalWidth; c.height = g.height = img.naturalHeight;
        var x = c.getContext("2d"); x.drawImage(img, 0, 0); x.globalCompositeOperation = "source-atop"; x.fillStyle = NACHT ? "rgba(20,26,58,.74)" : "rgba(40,26,40,.72)"; x.fillRect(0, 0, c.width, c.height);
        var y = g.getContext("2d"); y.drawImage(img, 0, 0); y.globalCompositeOperation = "source-in"; y.fillStyle = NACHT ? "#dfe8ff" : "#ffd98a"; y.fillRect(0, 0, g.width, g.height);
        return { dunkel: c, licht: g, w: c.width, h: c.height };
      }
      function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
      function seg(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); }

      /* Wand-Koordinaten (Filmbild 1280×720, Tür = 3×8 Glassteine um x 646) */
      var PX = 65, PY = 54, TX0 = 549, TY0 = 160, SP = 3, ZE = 8;
      function voll(t) {
        var s = Math.max(W / 1280, H / 720), ox = W / 2 - 646 * s, oy = (H - 720 * s) / 2;
        var tuerX = ox + (TX0 + PX * SP / 2) * s, tuerY = oy + (TY0 + PY * ZE / 2) * s;
        var zoom = 1 + Math.pow(ease(seg(t, 5.6, 7.1)), 2) * 3.4;
        ctx.save();
        ctx.translate(tuerX, tuerY); ctx.scale(zoom, zoom); ctx.translate(-tuerX, -tuerY);
        ctx.globalAlpha = ease(seg(t, 0, .6));
        /* Licht hinter der Tür */
        var auf = seg(t, 4.1, 6.0), glut = ease(seg(t, 3.5, 4.6));
        var lx = ox + TX0 * s, ly = oy + TY0 * s, lw = PX * SP * s, lh = PY * ZE * s;
        var gr = ctx.createRadialGradient(tuerX, tuerY - lh * .1, 4, tuerX, tuerY, lh * .75);
        if (NACHT) { gr.addColorStop(0, "#fffbe8"); gr.addColorStop(.35, "#f3e2a6"); gr.addColorStop(1, "#5a6aa8"); }
        else { gr.addColorStop(0, "#fffaf0"); gr.addColorStop(.35, "#ffdf9a"); gr.addColorStop(1, "#d88c3a"); }
        ctx.fillStyle = gr; ctx.fillRect(lx, ly, lw, lh);
        if (buch && auf > .3) { ctx.save(); ctx.globalAlpha *= ease(seg(t, 5.2, 6.4)) * .9; ctx.beginPath(); ctx.rect(lx, ly, lw, lh); ctx.clip();
          var bs = lh * 1.1 / 720; ctx.drawImage(buch, tuerX - 640 * bs, tuerY - 380 * bs, 1280 * bs, 720 * bs); ctx.restore(); }
        /* Wand: zuerst ganz, dann die Türsteine einzeln */
        ctx.save(); ctx.beginPath(); ctx.rect(-1e4, -1e4, 3e4, 3e4); ctx.rect(lx + lw, ly, -lw, lh); ctx.clip("evenodd");
        ctx.drawImage(wand, ox, oy, 1280 * s, 720 * s); ctx.restore();
        if (NACHT) { ctx.save(); ctx.globalAlpha *= .38; ctx.fillStyle = "#101a4a"; ctx.fillRect(ox, oy, 1280 * s, 720 * s); ctx.restore(); }
        var hand = handPunkte(t, s, ox, oy);
        var mx = (hand[0][0] + hand[1][0]) / 2, my = (hand[0][1] + hand[1][1]) / 2, maxD = Math.hypot(lw, lh);
        for (var cx = 0; cx < SP; cx++) for (var cy = 0; cy < ZE; cy++) {
          var sx = TX0 + cx * PX, sy = TY0 + cy * PY, dx = ox + sx * s, dy = oy + sy * s, w = PX * s, h = PY * s;
          var dist = Math.hypot(dx + w / 2 - mx, dy + h / 2 - my) / maxD;
          var p = ease(seg(t, 4.1 + dist * 1.3, 4.1 + dist * 1.3 + .75));
          if (p >= 1) continue;
          ctx.save(); ctx.globalAlpha *= 1 - p;
          var k = 1 - .22 * p; ctx.translate(dx + w / 2, dy + h / 2 - p * h * .3); ctx.scale(k, k);
          ctx.drawImage(wand, sx, sy, PX, PY, -w / 2, -h / 2, w, h);
          if (NACHT) { ctx.globalAlpha *= .38; ctx.fillStyle = "#101a4a"; ctx.fillRect(-w / 2, -h / 2, w, h); }
          ctx.restore();
        }
        /* Glut an den Händen und in den Fugen */
        if (glut > 0) {
          ctx.save(); ctx.globalCompositeOperation = "lighter";
          hand.forEach(function (hp) { var g = ctx.createRadialGradient(hp[0], hp[1], 1, hp[0], hp[1], 70 * s * (1 + auf));
            g.addColorStop(0, NACHT ? "rgba(235,240,255,.85)" : "rgba(255,226,150,.85)"); g.addColorStop(1, "rgba(255,190,90,0)");
            ctx.globalAlpha = glut * (1 - auf * .6); ctx.fillStyle = g; ctx.fillRect(hp[0] - 200 * s, hp[1] - 200 * s, 400 * s, 400 * s); });
          var g2 = ctx.createRadialGradient(tuerX, tuerY, 10, tuerX, tuerY, lh * (.6 + auf * .8));
          g2.addColorStop(0, NACHT ? "rgba(220,230,255,.5)" : "rgba(255,210,130,.55)"); g2.addColorStop(1, "rgba(255,170,60,0)");
          ctx.globalAlpha = glut * (.5 + auf * .5); ctx.fillStyle = g2; ctx.fillRect(0, 0, W * 2, H * 2); ctx.restore();
        }
        /* Lichtband (wie im Film: goldene Spur, die durch die Öffnung zieht) */
        band(t, hand, tuerX, tuerY, lh, s);
        /* Figur */
        figur(t, s, ox, oy, auf);
        ctx.restore();
        /* Technik: das Netz aus dem Film leuchtet beim Durchgehen kurz auf */
        var nz = seg(t, 5.9, 6.6) * (1 - seg(t, 6.9, 7.4));
        if (netz && nz > 0) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = nz * .55; deckend(netz); ctx.restore(); }
        /* Übergang ins Buch durch warmes Licht */
        var weiss = ease(seg(t, 6.3, 7.1)) * (1 - ease(seg(t, 7.1, 7.9)));
        if (t > 7.0) buchSzene(t, ease(seg(t, 7.0, 7.6)), 1);
        if (weiss > 0) { ctx.globalAlpha = weiss; ctx.fillStyle = NACHT ? "#eef2ff" : "#fff3dc"; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
        staubZeichnen(t, ease(seg(t, 3.8, 5)) * (1 - seg(t, 6.2, 6.8)));
      }
      function deckend(img) { var k = Math.max(W / img.naturalWidth, H / img.naturalHeight); ctx.drawImage(img, (W - img.naturalWidth * k) / 2, (H - img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k); }

      /* Laufweg: von vorne unten bis an die Tür; Hände heben sich bei 3.2 s */
      var ARME = ds.arme === "1", HAENDE = zahlen(ds.haende || "0.15,0.42;0.85,0.42");
      function figurLage(t, s, ox, oy) {
        var g = ease(seg(t, .3, 3.2));
        var hEnde = 214 * s, hStart = Math.min(H * .36, hEnde * 1.55);
        var h = hStart + (hEnde - hStart) * g;
        var fussY0 = H + hStart * .18, fussY1 = oy + 592 * s;
        var fuss = fussY0 + (fussY1 - fussY0) * g;
        var x = W / 2 + (1 - g) * W * .1 + Math.sin(g * Math.PI) * -W * .08;
        var laufen = g > 0 && g < 1 ? 1 : 0;
        var hub = laufen * Math.abs(Math.sin(t * Math.PI * 2.6)) * h * .035;
        var kipp = laufen * Math.sin(t * Math.PI * 2.6) * .05;
        var lehnen = ease(seg(t, 3.2, 3.7)) * .03, hinein = ease(seg(t, 4.9, 5.9));
        h *= 1 - .22 * hinein;
        return { h: h, w: h * silh.w / silh.h, x: x, y: fuss - hub - lehnen * h - hinein * h * .1, kipp: kipp, sicht: 1 - hinein };
      }
      function armWinkel(t) { return ease(seg(t, 3.1, 3.7)); }
      function handPunkte(t, s, ox, oy) {
        if (!silh) return [[W / 2 - 30, H / 2], [W / 2 + 30, H / 2]];
        var L = figurLage(t, s, ox, oy), top = L.y - L.h, left = L.x - L.w / 2;
        if (ARME) { var a = armWinkel(t), r = L.h * .26;
          return [-1, 1].map(function (sg) { var th = -sg * a * 2.0;
            return [L.x + sg * L.w * .28 - Math.sin(th) * r, L.y - L.h * .42 + Math.cos(th) * r]; }); }
        return HAENDE.map(function (p) { return [left + p[0] * L.w, top + p[1] * L.h]; });
      }
      function figur(t, s, ox, oy, auf) {
        if (!silh) return;
        var L = figurLage(t, s, ox, oy);
        if (L.sicht <= 0) return;
        ctx.save(); ctx.globalAlpha *= L.sicht; ctx.translate(L.x, L.y); ctx.rotate(L.kipp);
        var rim = .25 + ease(seg(t, 3.4, 5.2)) * .75;
        /* Gegenlicht-Saum: das helle Bild etwas grösser, mehrfach weich dahinter */
        ctx.globalAlpha = .22 * rim;
        for (var i = 0; i < 6; i++) { var k = 1.02 + i * .012, a = i * 1.05;
          ctx.drawImage(silh.licht, -L.w * k / 2 + Math.cos(a) * 2, -L.h * k + Math.sin(a) * 2, L.w * k, L.h * k); }
        ctx.globalAlpha = 1;
        if (ARME) arme(L, armWinkel(t));
        ctx.drawImage(silh.dunkel, -L.w / 2, -L.h, L.w, L.h);
        ctx.restore();
        /* weicher Schatten am Boden, zur Kamera hin (Licht kommt von der Tür) */
        ctx.save(); ctx.globalAlpha = .35 * rim * L.sicht; ctx.fillStyle = "#000";
        ctx.beginPath(); ctx.ellipse(L.x, L.y + L.h * .02, L.w * .42, L.h * .05, 0, 0, 7); ctx.fill(); ctx.restore();
      }
      function arme(L, a) {
        ctx.fillStyle = NACHT ? "#252c4e" : "#3a2a34";
        [-1, 1].forEach(function (sg) {
          ctx.save(); ctx.translate(sg * L.w * .28, -L.h * .42); ctx.rotate(-sg * a * 2.0);
          ctx.beginPath(); ctx.ellipse(0, L.h * .12, L.h * .065, L.h * .14, 0, 0, 7); ctx.fill(); ctx.restore();
        });
      }
      function band(t, hand, tx, ty, lh, s) {
        var p = seg(t, 3.9, 6.4); if (p <= 0) return;
        var a = hand[0], pts = [];
        for (var i = 0; i <= 40; i++) { var u = i / 40;
          var x = a[0] + (tx - a[0]) * u + Math.sin(u * 6.3 + t * 1.5) * 40 * s * (1 - u) + Math.sin(u * 3) * 60 * s;
          var y = a[1] + (ty - lh * .2 - a[1]) * u - Math.sin(u * Math.PI) * 80 * s; pts.push([x, y]); }
        var kopf = Math.floor(ease(p) * 40), schwanz = Math.max(0, kopf - 22);
        if (kopf - schwanz < 2) return;
        ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"; ctx.lineJoin = "round";
        [[10, .12], [4, .35], [1.6, .9]].forEach(function (st) {
          ctx.beginPath(); ctx.moveTo(pts[schwanz][0], pts[schwanz][1]);
          for (var j = schwanz + 1; j <= kopf; j++) ctx.lineTo(pts[j][0], pts[j][1]);
          ctx.lineWidth = st[0] * Math.max(1, s); ctx.strokeStyle = NACHT ? "rgba(225,235,255," + st[1] + ")" : "rgba(255,214,140," + st[1] + ")"; ctx.stroke();
        });
        ctx.restore();
      }
      function staubZeichnen(t, a) {
        if (a <= 0) return;
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        staub.forEach(function (p) {
          var y = ((p.y - t * p.v * 6) % 1 + 1) % 1, x = p.x + Math.sin(t * .6 + p.p) * .01;
          ctx.globalAlpha = a * (.35 + .25 * Math.sin(t * 1.2 + p.p));
          ctx.fillStyle = NACHT ? "#e8eeff" : "#ffe6b0"; ctx.beginPath(); ctx.arc(x * W, y * H, p.r, 0, 7); ctx.fill();
        });
        ctx.restore();
      }
      /* Buch-Szene: das offene Buch in der dunklen Halle (Film 0:10), die Seiten zeigen die Welt der App */
      function buchSzene(t, alpha, licht) {
        var bw = 760, bx = 260;
        var k = Math.min(W * 1.22 / bw, H * .62 / 520);
        var dauer = Math.max(0, t - 7);
        k *= 1 + Math.min(1, dauer / 2.6) * .07;
        var iw = 1280 * k, ih = 720 * k, x = W / 2 - (bx + bw / 2) * k, y = H * .46 - 380 * k;
        ctx.save(); ctx.globalAlpha = alpha;
        ctx.fillStyle = NACHT ? "#070b1c" : "#0b0d18"; ctx.fillRect(0, 0, W, H);
        var hg = ctx.createRadialGradient(W / 2, y + 380 * k, 10, W / 2, y + 380 * k, H * .55);
        hg.addColorStop(0, NACHT ? "rgba(120,140,220,.35)" : "rgba(200,140,70,.35)"); hg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
        if (netz) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = alpha * .22; deckend(netz); ctx.restore(); }
        /* Buch aus dem Film, oben und unten weich in die Halle auslaufend */
        var by0 = y + 60 * k, by1 = y + 700 * k;
        ctx.save(); ctx.beginPath(); ctx.rect(0, by0, W, by1 - by0); ctx.clip();
        ctx.drawImage(buch, x, y, iw, ih); ctx.restore();
        var fe = 70 * k;
        [[by0, by0 + fe, 1, 0], [by1 - fe, by1, 0, 1]].forEach(function (f) {
          var g = ctx.createLinearGradient(0, f[0], 0, f[1]);
          var c = NACHT ? "7,11,28" : "11,13,24";
          g.addColorStop(0, "rgba(" + c + "," + f[2] + ")"); g.addColorStop(1, "rgba(" + c + "," + f[3] + ")");
          ctx.fillStyle = g; ctx.fillRect(0, f[0], W, f[1] - f[0]);
        });
        var gl = ctx.createRadialGradient(W / 2, y + 380 * k, 10, W / 2, y + 380 * k, 520 * k);
        gl.addColorStop(0, NACHT ? "rgba(225,232,255,.16)" : "rgba(255,214,140,.18)"); gl.addColorStop(1, "rgba(255,200,120,0)");
        ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = alpha * licht; ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
        ctx.restore();
        if (modus === "voll") {
          /* goldenes Band kreist ums Buch */
          var u0 = (t - 7) * .5; if (u0 > 0) {
            ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
            [[8, .12], [3, .35], [1.4, .9]].forEach(function (st) { ctx.beginPath();
              for (var i = 0; i <= 30; i++) { var u = u0 + i / 30 * .9, wx = W / 2 + Math.cos(u * 4) * W * .46, wy = y + 380 * k + Math.sin(u * 4) * 210 * k + Math.sin(u * 9) * 8;
                if (i) ctx.lineTo(wx, wy); else ctx.moveTo(wx, wy); }
              ctx.lineWidth = st[0]; ctx.strokeStyle = NACHT ? "rgba(225,235,255," + st[1] * alpha + ")" : "rgba(255,214,140," + st[1] * alpha + ")"; ctx.stroke(); });
            ctx.restore(); }
          staubZeichnen(t, alpha * .8);
        }
      }
    });
  }

  function start() {
    welt();
    if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", function () { karten(); beobachten(); }); else { karten(); beobachten(); }
    var modus;
    if (RUHIG) modus = "ruhig";
    else {
      var gestern = null; try { gestern = localStorage.getItem(KEY); } catch (e) {}
      modus = gestern === heute() ? "kurz" : "voll";
      if (/[?&]tfw=voll/.test(location.search)) modus = "voll";
      try { localStorage.setItem(KEY, heute()); } catch (e) {}
    }
    if (/[?&]tfw=aus/.test(location.search)) return;
    eingang(modus);
  }
  window.Trickfilmwelt = { abspielen: function (m) { if (d.body) eingang(m || "voll"); }, ueberspringen: function () { if (ov) ov.dispatchEvent(new PointerEvent("pointerdown", { clientX: -1, clientY: -1 })); } };

  /* Vor dem Eingang: App sofort verdecken (kein Aufblitzen), ausser die NDA-Sperre ist offen */
  function bereit() {
    if (html.classList.contains("nda-zu")) {
      var mo = new MutationObserver(function () { if (!html.classList.contains("nda-zu")) { mo.disconnect(); start(); } });
      mo.observe(html, { attributes: true, attributeFilter: ["class"] });
      return;
    }
    start();
  }
  if (d.body) bereit(); else d.addEventListener("DOMContentLoaded", bereit);
})();
