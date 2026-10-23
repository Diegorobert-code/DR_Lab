/* trickfilmwelt.js – Kinder-Apps als Bilderbuch aus dem ersten DR-Lab-Film (Markenfilm 11.10.2026).
   Stil (Diego 23.10. 09:50): die Welt sieht aus wie das Bilderbuch im Film (0:09–0:11): weiche Wasserfarbe,
   Pastell, Bleistiftlinien, cremefarbenes Papier, feines Gold als Licht. Kein 3D-Look.
   Eingang (Geschichte aus dem Film 0:28–0:33, als Bilderbuch gemalt): die Figur läuft zur gemalten Wand,
   legt die Hände an, die Steine lösen sich wie nasse Farbe, warmes Licht, dahinter das offene Bilderbuch
   mit der Welt der App; eine Seite blättert um und die App ist da.

   Einbau (als erstes im <body>, ohne defer, damit nichts von der App aufblitzt):
     <script src="../trickfilmwelt/trickfilmwelt.js" data-app="otti"
       data-buch="trickfilm/buch.webp"   (Doppelseite 1200×780 mit Aquarell-Bildern, Alpha = Buchform)
       data-welt="trickfilm/welt.webp"   (Aquarell-Hintergrund, hoch)
       data-figur="trickfilm/figur.webp" (Figur freigestellt, Bilderbuch-Look)
       data-text="Otti wartet im Mondschein-Wald"
       data-karten=".buehne;.feld"       (Bilderbuch-Rahmen)
       data-blaetter=".blatt>.blattinnen;.eltern" (Fenster blättern wie eine Seite ein: Auslöser>was sich bewegt)
       data-css="trickfilm/buchwelt.css" (Farben der App für Papier)
       data-nacht="1"                    (Abendfarben: Lavendel und Mondlicht)
       data-knoepfe=".kimu">             (Knöpfe, die ein Tippen während des Eingangs trotzdem erreicht)
   Ganz beim ersten Öffnen am Tag, sonst 1 Sekunde. Tippen überspringt. prefers-reduced-motion: nur Ein- und Ausblenden.
   Wartet, solange die NDA-Sperre offen ist. Kein Ton. Kein Blitzen. ?tfw=voll zeigt den ganzen Eingang, ?tfw=aus keinen. */
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
  var FARBE = NACHT
    ? { papier: "#f3eee6", stein: ["#c9bfe2", "#b9cbe8", "#d9cfe9"], licht: "255,240,205", gold: "214,178,106", tinte: "#4a4060" }
    : { papier: "#f7f0de", stein: ["#bcd6ee", "#cbbfe3", "#d6e6f3"], licht: "255,232,170", gold: "216,170,90", tinte: "#5e4a36" };
  function q(s) { return (s || "").split(";").map(function (x) { return x.trim(); }).filter(Boolean); }
  function abs(u) { return new URL(u, location.href).href; }

  /* ── Bleibende Bilderbuch-Welt ───────────────────────────────────────────── */
  html.classList.add("tfw");
  if (NACHT) html.classList.add("tfw-nacht");
  [BASIS + "trickfilmwelt.css", ds.css && abs(ds.css)].forEach(function (h) {
    if (!h) return; var l = d.createElement("link"); l.rel = "stylesheet"; l.href = h; (d.head || html).appendChild(l);
  });
  html.style.setProperty("--tfw-papier", 'url("' + BASIS + 'papier.webp")');
  if (ds.welt) html.style.setProperty("--tfw-welt-bild", 'url("' + abs(ds.welt) + '")');

  function welt() {
    if (d.getElementById("tfw-welt")) return;
    var w = d.createElement("div"); w.id = "tfw-welt"; w.setAttribute("aria-hidden", "true");
    /* feine goldene Lichtlinie wie im Film, ganz leise */
    w.innerHTML = '<svg class="tfw-band" viewBox="0 0 400 800" preserveAspectRatio="none"><path d="M-20 700 C 90 620, 150 730, 240 610 S 360 490, 430 530" fill="none" stroke="rgb(' + FARBE.gold + ')" stroke-width="1.6" stroke-linecap="round" opacity=".45"/></svg>';
    d.body.insertBefore(w, d.body.firstChild);
    var r = d.createElement("div"); r.id = "tfw-rand"; r.setAttribute("aria-hidden", "true");
    d.body.appendChild(r);
  }
  function karten() {
    q(ds.karten).forEach(function (s) { try { d.querySelectorAll(s).forEach(function (e) { e.classList.add("tfw-karte"); }); } catch (e) {} });
  }
  /* Fenster blättern wie eine Buchseite ein */
  var blaetter = q(ds.blaetter).map(function (p) { var t = p.split(">"); return { an: t[0].trim(), innen: t.slice(1).join(">").trim() }; });
  var sichtbar = new WeakMap();
  function istSichtbar(e) { return !e.hidden && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden"; }
  function blaettern(el) {
    el.classList.remove("tfw-blaettern"); void el.offsetWidth; el.classList.add("tfw-blaettern");
    el.addEventListener("animationend", function f(ev) { if (ev.target !== el) return; el.classList.remove("tfw-blaettern"); el.removeEventListener("animationend", f); });
  }
  function pruefen(e) {
    blaetter.forEach(function (b) {
      var t; try { t = e.matches(b.an); } catch (x) { return; }
      if (!t) return;
      var jetzt = istSichtbar(e), vorher = sichtbar.get(e) || false;
      sichtbar.set(e, jetzt);
      if (jetzt && !vorher) { var z = b.innen ? e.querySelector(b.innen) : e; if (z) blaettern(z); }
    });
  }
  function beobachten() {
    if (!blaetter.length || !window.MutationObserver) return;
    blaetter.forEach(function (b) { try { d.querySelectorAll(b.an).forEach(function (e) { sichtbar.set(e, istSichtbar(e)); }); } catch (x) {} });
    new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) { var t = ms[i].target; if (t.nodeType === 1) pruefen(t); } })
      .observe(d.body, { subtree: true, attributes: true, attributeFilter: ["hidden", "open", "class"] });
  }

  /* ── Eingang ──────────────────────────────────────────────────────────────── */
  function heute() { var t = new Date(); return t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate(); }
  var KEY = "trickfilmwelt:" + APP;
  function lade(src) { return new Promise(function (ok) { if (!src) return ok(null); var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src; }); }
  function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function seg(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); }
  function zufall(n) { var s = n * 9301 + 49297; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

  /* ein gemalter Stein: Wasserfarbe mit dunklerem Rand und Bleistiftlinie */
  function stein(w, h, farbe, nr) {
    var c = d.createElement("canvas"); c.width = w; c.height = h;
    var x = c.getContext("2d"), r = zufall(nr + 3), i;
    x.globalAlpha = .55; x.fillStyle = farbe; rund(x, 3, 3, w - 6, h - 6, 7); x.fill();
    for (i = 0; i < 7; i++) { var g = x.createRadialGradient(r() * w, r() * h, 1, r() * w, r() * h, w * (.25 + r() * .35));
      g.addColorStop(0, farbe); g.addColorStop(1, "rgba(255,255,255,0)"); x.globalAlpha = .18 + r() * .2; x.fillStyle = g; x.fillRect(0, 0, w, h); }
    x.globalAlpha = .35; x.strokeStyle = farbe; x.lineWidth = 3; rund(x, 4, 4, w - 8, h - 8, 7); x.stroke();
    x.globalAlpha = .45; x.strokeStyle = FARBE.tinte; x.lineWidth = 1;
    x.beginPath(); x.moveTo(5 + r() * 2, 4 + r() * 2); x.lineTo(w - 5 - r() * 2, 5 + r() * 2); x.lineTo(w - 4 - r() * 2, h - 5 - r() * 2); x.lineTo(4 + r() * 2, h - 4 - r() * 2); x.closePath(); x.stroke();
    return c;
  }
  function rund(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }

  var ov = null, laeuft = false;
  function eingang(modus) {
    if (laeuft) return; laeuft = true;
    ov = d.createElement("div"); ov.id = "tfw-eingang"; ov.setAttribute("aria-hidden", "true");
    ov.style.cssText = "position:fixed;inset:0;z-index:2147482900;background:" + FARBE.papier + ";cursor:pointer;touch-action:none";
    var cv = d.createElement("canvas"); ov.appendChild(cv);
    var schatten = d.createElement("i"); schatten.className = "tfw-seitenschatten"; ov.appendChild(schatten);
    var tx = null;
    if (ds.text) { tx = d.createElement("div"); tx.className = "tfw-text"; tx.textContent = ds.text; ov.appendChild(tx); }
    d.body.appendChild(ov);
    var ctx = cv.getContext("2d"), W, H, dpr = Math.min(2, window.devicePixelRatio || 1);
    function groesse() { W = innerWidth; H = innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; cv.style.height = H + "px"; }
    groesse(); addEventListener("resize", groesse);

    var fertig = false, raf = 0;
    function ende(schnell) {
      if (fertig) return; fertig = true;
      ov.classList.add(schnell || RUHIG ? "tfw-weg-sanft" : "tfw-umblaettern");
      setTimeout(function () { cancelAnimationFrame(raf); removeEventListener("resize", groesse); if (ov) ov.remove(); ov = null; laeuft = false;
        try { window.dispatchEvent(new CustomEvent("trickfilmwelt-fertig", { detail: { app: APP } })); } catch (e) {} },
        schnell || RUHIG ? 420 : modus === "kurz" ? 620 : 900);
    }
    ov.addEventListener("pointerdown", function (e) {
      var x = e.clientX, y = e.clientY, k = null;
      ov.style.pointerEvents = "none";
      q(ds.knoepfe || ".kimu").forEach(function (s) {
        if (k) return;
        try { d.querySelectorAll(s).forEach(function (b) { var r = b.getBoundingClientRect(); if (!k && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) k = b; }); } catch (x2) {}
      });
      ende(true);
      if (k) setTimeout(function () { k.click(); }, 0);
    });
    addEventListener("keydown", function f(e) { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { removeEventListener("keydown", f); ende(true); } });

    Promise.all([lade(ds.buch), lade(ds.welt), lade(ds.figur)]).then(function (b) {
      var buch = b[0], hg = b[1], fig = b[2];
      if (!buch) { ende(true); return; }
      if (modus === "voll" && !fig) modus = "kurz";
      if (modus === "kurz") ov.classList.add("tfw-kurz");
      if (tx) setTimeout(function () { if (tx) tx.classList.add("an"); }, modus === "voll" ? 6400 : 60);
      var DAUER = modus === "voll" ? 9000 : modus === "ruhig" ? 1300 : 380;
      var steine = FARBE.stein.map(function (f, i) { return [0, 1, 2].map(function (j) { return stein(120, 96, f, i * 3 + j); }); });
      var funken = []; var rz = zufall(11);
      for (var i = 0; i < 26; i++) funken.push({ x: rz(), y: rz(), r: 1 + rz() * 2.2, v: .01 + rz() * .02, p: rz() * 6.3, f: ["246,201,211", "249,227,154", "188,214,238"][i % 3] });
      var t0 = performance.now();
      function bild(now) {
        if (fertig) return;
        var t = (now - t0) / 1000;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = FARBE.papier; ctx.fillRect(0, 0, W, H);
        if (modus === "voll") voll(t); else buchSzene(9, modus === "ruhig" ? 1 : Math.min(1, t / .25));
        if (t * 1000 >= DAUER) { ende(false); return; }
        raf = requestAnimationFrame(bild);
      }
      raf = requestAnimationFrame(bild);

      function papierGrund(a) {
        if (!hg) return;
        var k = Math.max(W / hg.naturalWidth, H / hg.naturalHeight);
        ctx.globalAlpha = a; ctx.drawImage(hg, (W - hg.naturalWidth * k) / 2, (H - hg.naturalHeight * k) / 2, hg.naturalWidth * k, hg.naturalHeight * k); ctx.globalAlpha = 1;
      }
      /* Wand: 5 Spalten über die Breite, 7 Reihen; Tür = mittlere 3×4 unten */
      function wandMasse() {
        var sw = Math.min(W / 4.6, 110), sh = sw * .8, sp = Math.ceil(W / sw) + 2, ze = 7;
        var boden = H * .7, oben = boden - ze * sh, x0 = W / 2 - sp * sw / 2;
        return { sw: sw, sh: sh, sp: sp, ze: ze, boden: boden, oben: oben, x0: x0, tuer: { c0: Math.floor(sp / 2) - 1, c1: Math.floor(sp / 2) + 1, r0: ze - 5, r1: ze - 1 } };
      }
      function voll(t) {
        var M = wandMasse(), T = M.tuer;
        var tl = M.x0 + T.c0 * M.sw, tt = M.oben + T.r0 * M.sh, tw = (T.c1 - T.c0 + 1) * M.sw, th = (T.r1 - T.r0 + 1) * M.sh;
        var tcx = tl + tw / 2, tcy = tt + th / 2;
        var zoom = 1 + Math.pow(ease(seg(t, 5.3, 6.7)), 2) * 3.2;
        ctx.save(); ctx.globalAlpha = ease(seg(t, 0, .5));
        ctx.translate(tcx, tcy); ctx.scale(zoom, zoom); ctx.translate(-tcx, -tcy);
        papierGrund(1);
        /* warmes Licht und das Buch hinter der Tür */
        var auf = seg(t, 3.7, 5.4), glut = ease(seg(t, 3.0, 4.0));
        ctx.save(); ctx.beginPath(); ctx.rect(tl, tt, tw, th); ctx.clip();
        var g = ctx.createRadialGradient(tcx, tcy, 2, tcx, tcy, th);
        g.addColorStop(0, "rgba(" + FARBE.licht + ",1)"); g.addColorStop(1, "rgba(" + FARBE.licht + ",.55)");
        ctx.fillStyle = g; ctx.fillRect(tl, tt, tw, th);
        if (auf > .2) { var bk = tw * 1.15 / 1200; ctx.globalAlpha = ease(seg(t, 4.4, 5.6)); ctx.drawImage(buch, tcx - 600 * bk, tcy - 390 * bk, 1200 * bk, 780 * bk); }
        ctx.restore();
        /* Boden-Wasserfarbe unter der Wand */
        ctx.save(); ctx.globalAlpha = .5; ctx.fillStyle = NACHT ? "#c9bfe2" : "#b9d99a";
        ctx.beginPath(); ctx.ellipse(W / 2, M.boden + 10, W * .7, 26, 0, 0, 7); ctx.fill(); ctx.restore();
        /* Steine */
        var hand = handPunkte(t, M);
        var mx = (hand[0][0] + hand[1][0]) / 2, my = (hand[0][1] + hand[1][1]) / 2, maxD = Math.hypot(tw, th);
        for (var c = 0; c < M.sp; c++) for (var r = 0; r < M.ze; r++) {
          var x = M.x0 + c * M.sw + (r % 2 ? M.sw * .5 : 0) * 0, y = M.oben + r * M.sh;
          var s = steine[(c + r) % 3][(c * 7 + r) % 3];
          var inTuer = c >= T.c0 && c <= T.c1 && r >= T.r0 && r <= T.r1, p = 0;
          if (inTuer) { var dist = Math.hypot(x + M.sw / 2 - mx, y + M.sh / 2 - my) / maxD; p = ease(seg(t, 3.7 + dist * 1.2, 3.7 + dist * 1.2 + .8)); }
          if (p >= 1) continue;
          ctx.save(); ctx.globalAlpha *= 1 - p;
          /* löst sich wie nasse Farbe: wird weich, grösser, rinnt ein wenig nach unten */
          var k = 1 + .12 * p; ctx.translate(x + M.sw / 2, y + M.sh / 2 + p * M.sh * .35); ctx.scale(k, k);
          ctx.drawImage(s, -M.sw / 2, -M.sh / 2, M.sw, M.sh);
          if (p > 0) { ctx.globalAlpha *= .4; ctx.drawImage(s, -M.sw / 2 + 2, -M.sh / 2 + 3, M.sw, M.sh); }
          ctx.restore();
        }
        /* Licht an den Händen */
        if (glut > 0) {
          ctx.save(); ctx.globalCompositeOperation = "lighter";
          hand.forEach(function (hp) { var gg = ctx.createRadialGradient(hp[0], hp[1], 1, hp[0], hp[1], 46 + auf * 60);
            gg.addColorStop(0, "rgba(" + FARBE.licht + ",.7)"); gg.addColorStop(1, "rgba(" + FARBE.licht + ",0)");
            ctx.globalAlpha = glut * (1 - auf * .5); ctx.fillStyle = gg; ctx.fillRect(hp[0] - 120, hp[1] - 120, 240, 240); });
          ctx.restore();
        }
        goldlinie(t, hand[1], tcx, tt);
        figur(t, M);
        ctx.restore();
        /* durch das Licht ins Buch */
        var hell = ease(seg(t, 5.9, 6.6)) * (1 - ease(seg(t, 6.6, 7.3)));
        if (t > 6.5) buchSzene(t, ease(seg(t, 6.5, 7.1)));
        if (hell > 0) { ctx.globalAlpha = hell; ctx.fillStyle = "rgb(" + FARBE.licht + ")"; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
        funkeln(t, ease(seg(t, 3.4, 4.4)) * (1 - seg(t, 5.8, 6.4)));
      }
      function lage(t, M) {
        var g = ease(seg(t, .3, 3.0));
        var hEnde = M.sh * 3.1, hStart = hEnde * 1.45, h = hStart + (hEnde - hStart) * g;
        var fuss = (H + hStart * .1) + (M.boden - (H + hStart * .1)) * g;
        var x = W / 2 + (1 - g) * W * .14 - Math.sin(g * Math.PI) * W * .06;
        var laufen = g > 0 && g < 1 ? 1 : 0;
        var hub = laufen * Math.abs(Math.sin(t * Math.PI * 2.6)) * h * .04, kipp = laufen * Math.sin(t * Math.PI * 2.6) * .05;
        var hinein = ease(seg(t, 4.6, 5.6)); h *= 1 - .25 * hinein;
        return { h: h, w: h * fig.naturalWidth / fig.naturalHeight, x: x, y: fuss - hub - hinein * h * .12, kipp: kipp, sicht: 1 - hinein };
      }
      function handPunkte(t, M) { var L = lage(t, M); return [[L.x - L.w * .42, L.y - L.h * .55], [L.x + L.w * .42, L.y - L.h * .55]]; }
      function figur(t, M) {
        var L = lage(t, M); if (L.sicht <= 0) return;
        ctx.save(); ctx.globalAlpha *= .3 * L.sicht; ctx.fillStyle = FARBE.tinte;
        ctx.beginPath(); ctx.ellipse(L.x, L.y, L.w * .38, L.h * .045, 0, 0, 7); ctx.fill(); ctx.restore();
        ctx.save(); ctx.globalAlpha *= L.sicht; ctx.translate(L.x, L.y); ctx.rotate(L.kipp);
        ctx.drawImage(fig, -L.w / 2, -L.h, L.w, L.h); ctx.restore();
      }
      function goldlinie(t, a, tx2, ty) {
        var p = seg(t, 3.6, 5.8); if (p <= 0) return;
        var pts = [], i;
        for (i = 0; i <= 40; i++) { var u = i / 40;
          pts.push([a[0] + (tx2 - a[0]) * u + Math.sin(u * 6.3 + t) * 22 * (1 - u), a[1] + (ty - a[1]) * u - Math.sin(u * Math.PI) * 60]); }
        var kopf = Math.floor(ease(p) * 40), schwanz = Math.max(0, kopf - 24); if (kopf - schwanz < 2) return;
        ctx.save(); ctx.lineCap = "round"; ctx.strokeStyle = "rgba(" + FARBE.gold + ",.85)"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(pts[schwanz][0], pts[schwanz][1]); for (i = schwanz + 1; i <= kopf; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); ctx.restore();
      }
      function funkeln(t, a) {
        if (a <= 0) return;
        ctx.save();
        funken.forEach(function (p) {
          var y = ((p.y - t * p.v) % 1 + 1) % 1, x = p.x + Math.sin(t * .7 + p.p) * .012;
          ctx.globalAlpha = a * (.45 + .2 * Math.sin(t * 1.1 + p.p)); ctx.fillStyle = "rgb(" + p.f + ")";
          ctx.beginPath(); ctx.arc(x * W, y * H, p.r, 0, 7); ctx.fill();
        });
        ctx.restore();
      }
      /* das offene Bilderbuch füllt das Bild */
      function buchSzene(t, alpha) {
        ctx.save(); ctx.globalAlpha = alpha;
        ctx.fillStyle = FARBE.papier; ctx.fillRect(0, 0, W, H);
        papierGrund(alpha * .9);
        var dauer = Math.max(0, t - 6.5), k = Math.min(W * 1.04 / 1200, H * .62 / 780) * (1 + Math.min(1, dauer / 2.5) * .05);
        var bw = 1200 * k, bh = 780 * k, bx = W / 2 - bw / 2, by = H * .44 - bh / 2;
        /* weicher Schatten unter dem Buch, wie auf einem Tisch */
        ctx.save(); ctx.globalAlpha = alpha * .22; ctx.fillStyle = FARBE.tinte;
        ctx.beginPath(); ctx.ellipse(W / 2, by + bh + 6, bw * .48, 12, 0, 0, 7); ctx.fill(); ctx.restore();
        ctx.drawImage(buch, bx, by, bw, bh);
        /* feines Gold am Bundsteg */
        var gl = ctx.createRadialGradient(W / 2, by + bh / 2, 2, W / 2, by + bh / 2, bh * .7);
        gl.addColorStop(0, "rgba(" + FARBE.licht + ",.28)"); gl.addColorStop(1, "rgba(" + FARBE.licht + ",0)");
        ctx.fillStyle = gl; ctx.fillRect(bx, by, bw, bh);
        ctx.restore();
        if (modus === "voll") funkeln(t, alpha * .8);
      }
    });
  }

  function start() {
    welt();
    if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", function () { karten(); beobachten(); }); else { karten(); beobachten(); }
    if (/[?&]tfw=aus/.test(location.search)) return;
    var modus;
    if (RUHIG) modus = "ruhig";
    else {
      var vorher = null; try { vorher = localStorage.getItem(KEY); } catch (e) {}
      modus = vorher === heute() ? "kurz" : "voll";
      if (/[?&]tfw=voll/.test(location.search)) modus = "voll";
      try { localStorage.setItem(KEY, heute()); } catch (e) {}
    }
    eingang(modus);
  }
  window.Trickfilmwelt = { abspielen: function (m) { if (d.body) eingang(m || "voll"); } };
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
