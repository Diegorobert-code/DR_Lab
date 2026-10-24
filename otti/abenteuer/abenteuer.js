/* abenteuer.js – «🚀 Abenteuer»: Ottis Missionen als Bildschirm-Geschichten im Aura-Stil.
   Szenen aus CSS/SVG, Ottis Aura-Posen (aura/*.webp), Emoji-Helden und Licht. Pro Bildschirm ein Platz «bild»
   für eine spätere gemalte Illustration (abenteuer/bilder/<datei>). Vorlesen über Ottis Stimme der App
   (OTTI_API.abenteuer.sprechen), Stern und Sticker über das bestehende Belohnungs-System.
   Gespeichert wird nur, welche Missionen geschafft sind (localStorage «otti_abenteuer»), sonst nichts.
   Die Eltern- und Nova-Pillen unten bleiben frei: Text und Knöpfe stehen immer darüber. */
(function () {
  "use strict";
  var d = document, me = d.currentScript;
  var BASIS = me && me.src ? me.src.replace(/[^\/]*([?#].*)?$/, "") : "abenteuer/";
  var AURA = BASIS + "../aura/";
  var RUHIG = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var KEY = "otti_abenteuer";

  function daten() { return window.OTTI_ABENTEUER || { FIGUREN: {}, GESCHICHTEN: [] }; }
  function api() { return (window.OTTI_API && window.OTTI_API.abenteuer) || {}; }
  function sprich(t, fertig) { var a = api(); if (a.sprechen) { try { a.sprechen(t, fertig); return; } catch (e) {} } if (fertig) setTimeout(fertig, 400); }
  function still() { var a = api(); if (a.stimmeStopp) try { a.stimmeStopp(); } catch (e) {} }
  function klang(k, x) { var a = api(); if (a.klang) try { a.klang(k, x); } catch (e) {} }
  function el(tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function knopf(cls, txt, fn) { var b = el("button", cls, txt); b.type = "button"; if (fn) b.addEventListener("click", fn); return b; }

  /* Fortschritt: nur die geschafften Missionen, nur auf diesem Handy */
  function geschafft() { try { var v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function merke(id) { var g = geschafft(); if (g.indexOf(id) < 0) g.push(id); try { localStorage.setItem(KEY, JSON.stringify(g)); } catch (e) {} }

  /* ================= Kulissen (SVG, Aura-Nacht) ================= */
  function zufallsreihe(seed) { var s = seed; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function sterne(n, seed, maxY) {
    var r = zufallsreihe(seed), o = "";
    for (var i = 0; i < n; i++) { var x = Math.round(r() * 390), y = Math.round(r() * maxY), g = (r() * 1.4 + .6).toFixed(1);
      o += '<circle class="ab-st" style="--v:' + (r() * 4).toFixed(1) + 's" cx="' + x + '" cy="' + y + '" r="' + g + '" fill="#fff6dc"/>'; }
    return o;
  }
  function tanne(x, y, h, f) {
    var b = h * .42, s = "";
    for (var i = 0; i < 3; i++) { var t = y - h + i * h * .26, w = b * (.55 + i * .28);
      s += '<path d="M' + x + " " + t + " L" + (x + w) + " " + (t + h * .42) + " L" + (x - w) + " " + (t + h * .42) + 'Z" fill="' + f + '"/>'; }
    return s + '<rect x="' + (x - 4) + '" y="' + (y - h * .1) + '" width="8" height="' + (h * .14) + '" fill="' + f + '"/>';
  }
  function wolke(x, y, s, f, rand) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><path d="M-60 20 C-70 -6 -40 -22 -22 -12 C-14 -36 22 -38 30 -14 C52 -22 72 0 60 20 Z" fill="' + f + '"' +
      (rand ? ' stroke="' + rand + '" stroke-width="2"' : "") + "/></g>";
  }
  function mond(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="62" fill="url(#abMondSchein)"/><circle cx="' + x + '" cy="' + y + '" r="26" fill="#fff1c8"/><circle cx="' + (x + 9) + '" cy="' + (y - 6) + '" r="5" fill="#f3dfa6"/>'; }
  var DEFS = '<defs><radialGradient id="abMondSchein"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".75"/><stop offset=".45" stop-color="#b484ff" stop-opacity=".25"/><stop offset="1" stop-color="#b484ff" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="abBach" x1="0" x2="1"><stop offset="0" stop-color="#7fd4ff" stop-opacity=".2"/><stop offset=".5" stop-color="#e8f6ff" stop-opacity=".75"/><stop offset="1" stop-color="#7fd4ff" stop-opacity=".2"/></linearGradient></defs>';
  function kulisse(bg) {
    var o = DEFS;
    if (bg === "baumhaus") {
      o += '<rect width="390" height="844" fill="#2a1d4a"/>';
      for (var i = 0; i < 8; i++) o += '<rect x="0" y="' + (i * 110) + '" width="390" height="106" fill="' + (i % 2 ? "#33245a" : "#2d2052") + '"/>';
      o += '<circle cx="195" cy="190" r="92" fill="#0b1636" stroke="#ffd27a" stroke-width="6"/>' + sterne(14, 3, 260).replace(/cx="(\d+)"/g, function (m, x) { return 'cx="' + (125 + (x % 140)) + '"'; }) +
        '<circle cx="225" cy="160" r="20" fill="#fff1c8"/><path d="M103 190 H287 M195 98 V282" stroke="#ffd27a" stroke-width="4"/>';
      [70, 320].forEach(function (x) { o += '<path d="M' + x + ' 0 V70" stroke="#ffd27a88" stroke-width="2"/><circle class="ab-lampe" cx="' + x + '" cy="86" r="16" fill="#ffd27a"/><circle cx="' + x + '" cy="86" r="40" fill="#ffd27a" opacity=".18"/>'; });
      o += '<rect x="0" y="690" width="390" height="154" fill="#1c1338"/><path d="M0 690 H390" stroke="#ffd27a55" stroke-width="3"/>';
      return o;
    }
    if (bg === "himmel" || bg === "insel" || bg === "regenbogen") {
      o += sterne(46, 7, 560) + mond(318, 110);
      if (bg === "regenbogen") ["#ff8fb1", "#ffb36b", "#ffe066", "#9be37c", "#7fd4ff", "#b484ff"].forEach(function (c, i) {
        o += '<path d="M-40 ' + (720 + i * 14) + ' Q195 ' + (330 + i * 14) + " 430 " + (720 + i * 14) + '" fill="none" stroke="' + c + '" stroke-width="14" opacity=".75"/>'; });
      o += wolke(70, 300, 1, "#3a3f9a", "#ffd27a33") + wolke(330, 420, .9, "#343a8f") + wolke(120, 560, 1.3, "#2e3484");
      if (bg === "insel") o += '<path d="M10 760 C40 650 120 640 160 670 C190 610 290 610 320 670 C360 650 400 700 380 760 Z" fill="#4a4fb0" stroke="#ffd27a88" stroke-width="3"/><path d="M0 760 H390 V844 H0Z" fill="#3a3f9a"/>';
      else o += '<path d="M0 760 C80 720 140 740 200 730 C270 718 330 740 390 726 V844 H0Z" fill="#2a2f7a"/>';
      return o;
    }
    if (bg === "sturm") {
      o += '<rect width="390" height="844" fill="#1b1850" opacity=".55"/>' + sterne(16, 11, 300);
      o += '<g class="ab-spirale" style="transform-origin:195px 230px"><path d="M195 230 m-8 0 a8 8 0 1 1 16 0 a20 20 0 1 1 -40 0 a34 34 0 1 1 68 0 a50 50 0 1 1 -100 0 a68 68 0 1 1 136 0 a88 88 0 1 1 -176 0" fill="none" stroke="#b484ff" stroke-width="10" stroke-linecap="round" opacity=".55"/></g>';
      o += wolke(80, 120, 1, "#3b3486", "#b484ff55") + wolke(320, 150, 1.1, "#3b3486", "#b484ff55") + wolke(200, 70, .8, "#463e9c");
      o += '<path d="M0 640 C90 600 160 630 230 610 C300 590 350 610 390 600 V844 H0Z" fill="#141a4a"/>';
      o += '<g class="ab-wiegen">' + tanne(40, 700, 190, "#0d1440") + tanne(350, 690, 210, "#0d1440") + "</g>";
      o += '<path d="M0 744 C120 724 260 734 390 720 V844 H0Z" fill="#0a1033"/>';
      return o;
    }
    /* wald und bach: das gemalte Nachtbild (aura/nacht.webp) ist die Kulisse, darüber nur Boden, Bach und Lichtpunkte */
    o += sterne(10, 5, 120);
    if (bg === "bach") o += '<path class="ab-wasser" d="M-20 742 C80 700 160 760 240 720 C300 690 350 720 410 700 L410 760 C340 780 300 750 240 778 C160 812 80 760 -20 800Z" fill="url(#abBach)"/>';
    o += '<path d="M0 770 C90 752 200 764 290 752 C340 746 370 750 390 746 V844 H0Z" fill="#070c26" opacity=".85"/>';
    o += '<g fill="#ffd27a">' + [[60, 790], [150, 806], [250, 784], [330, 800]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.5" opacity=".7"/>'; }).join("") + "</g>";
    return o;
  }

  /* ================= Aufbau des Fensters ================= */
  var ov, szene, svg, bild, buehne, kopfTitel, punkte, panel, textEl, lehreEl, aktion, zurueck, nochmal;
  var G = null, i = 0, gezeigt = 0, gesamt = 0, aktuellerText = "", ab = null, platzT = 0, offenSeit = 0;

  function bauen() {
    if (ov) return;
    ov = el("div", "ab"); ov.id = "abenteuer"; ov.hidden = true;
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Abenteuer");
    szene = el("div", "ab-szene");
    svg = d.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "ab-kulisse");
    svg.setAttribute("viewBox", "0 0 390 844"); svg.setAttribute("preserveAspectRatio", "xMidYMax slice"); svg.setAttribute("aria-hidden", "true");
    bild = el("img", "ab-bild"); bild.alt = ""; bild.hidden = true; bild.decoding = "async";
    bild.addEventListener("load", function () { szene.classList.add("mit-bild"); bild.hidden = false; });
    bild.addEventListener("error", function () { szene.classList.remove("mit-bild"); bild.hidden = true; });
    szene.appendChild(svg); szene.appendChild(bild);
    buehne = el("div", "ab-buehne");
    var kopf = el("div", "ab-kopf");
    zurueck = knopf("ab-rund ab-zurueck", "←", function () { klang("whoosh"); if (G) liste(); else zu(); });
    zurueck.setAttribute("aria-label", "Zurück");
    var mitte = el("div", "ab-kopfmitte"); kopfTitel = el("div", "ab-titel"); punkte = el("div", "ab-punkte"); punkte.setAttribute("aria-hidden", "true");
    mitte.appendChild(kopfTitel); mitte.appendChild(punkte);
    nochmal = knopf("ab-rund ab-hoeren", "🔊", function () { if (aktuellerText) { still(); sprich(aktuellerText); } });
    nochmal.setAttribute("aria-label", "Nochmal vorlesen");
    var schliessen = knopf("ab-rund ab-zu", "✕", function () { zu(); }); schliessen.setAttribute("aria-label", "Abenteuer schliessen");
    kopf.appendChild(zurueck); kopf.appendChild(mitte); kopf.appendChild(nochmal); kopf.appendChild(schliessen);
    panel = el("div", "ab-panel"); textEl = el("p", "ab-text"); textEl.setAttribute("aria-live", "polite"); lehreEl = el("p", "ab-lehre"); lehreEl.hidden = true;
    aktion = el("div", "ab-aktion");
    panel.appendChild(textEl); panel.appendChild(lehreEl); panel.appendChild(aktion);
    ov.appendChild(szene); ov.appendChild(buehne); ov.appendChild(kopf); ov.appendChild(panel);
    d.body.appendChild(ov);
    if (window.ResizeObserver) new ResizeObserver(function () { ov.style.setProperty("--ab-panel", Math.ceil(panel.getBoundingClientRect().height) + "px"); }).observe(panel);
    addEventListener("resize", platz);
    addEventListener("keydown", function (e) { if (e.key === "Escape" && !ov.hidden) { e.stopImmediatePropagation(); if (G) liste(); else zu(); } }, true);
  }

  /* Platz für die Pillen unten (🔒 Eltern, Lernen, Nova): Text und Knöpfe stehen immer darüber */
  function platz() {
    if (!ov || ov.hidden) return;
    var h = innerHeight, oben = h - 16, pillen = [];
    /* Die Eltern-Pille (lernen.js) macht sich bei offenen Fenstern selbst unsichtbar; sie zählt nur, wenn sie danach noch sichtbar ist */
    var host = d.querySelector("[data-drlab-lernen]"), p = host && host.shadowRoot && host.shadowRoot.querySelector(".pill");
    if (p && Date.now() - offenSeit > 1500) pillen.push(p);
    Array.prototype.forEach.call(d.querySelectorAll(".nova-btn,.nova-pille,.lernen-pille,.eltern-pille"), function (x) { pillen.push(x); });
    pillen.forEach(function (x) {
      var r = x.getBoundingClientRect(); if (!r.width || !r.height || r.top < h * .5) return;
      if (getComputedStyle(x).visibility === "hidden" || getComputedStyle(x).display === "none") return;
      oben = Math.min(oben, r.top);
    });
    var unten = Math.max(16, Math.ceil(h - oben + 10));
    ov.style.setProperty("--ab-unten", unten + "px");
    ov.style.setProperty("--ab-panel", Math.ceil(panel.getBoundingClientRect().height) + "px");
  }

  function oeffnen() {
    bauen(); var a = api();
    if (a.spielBeenden) try { a.spielBeenden(); } catch (e) {}
    if (a.tippWeg) try { a.tippWeg(); } catch (e) {}
    still();
    var w = d.getElementById("spielwahl"); if (w) w.hidden = true;
    ov.hidden = false; offenSeit = Date.now(); d.body.classList.add("ab-offen"); platz();
    clearInterval(platzT); platzT = setInterval(platz, 800);
    liste(); klang("whoosh");
  }
  function zu() {
    if (!ov) return;
    still(); G = null; ov.hidden = true; d.body.classList.remove("ab-offen"); clearInterval(platzT);
    var k = d.querySelector("[data-abenteuer]"); if (k) karteZeigen(k);
  }

  /* ================= Missionsliste ================= */
  function liste() {
    still(); G = null; aktuellerText = "";
    var D = daten(), g = geschafft();
    ov.classList.add("ist-liste"); ov.classList.remove("ist-ende");
    szene.className = "ab-szene bg-himmel"; svg.innerHTML = kulisse("himmel"); bild.hidden = true; bild.removeAttribute("src");
    kopfTitel.textContent = "🚀 Abenteuer"; punkte.innerHTML = ""; nochmal.hidden = true; zurueck.hidden = true;
    buehne.innerHTML = ""; buehne.className = "ab-buehne"; aktion.className = "ab-aktion";
    var l = el("div", "ab-liste");
    l.appendChild(el("p", "ab-listekopf", "Wähle eine Mission!"));
    D.GESCHICHTEN.forEach(function (x, n) {
      var b = knopf("ab-mission" + (g.indexOf(x.id) > -1 ? " fertig" : ""), null, function () { klang("tipp"); starten(n); });
      b.style.setProperty("--c", x.farbe);
      b.dataset.mission = x.id;
      var ic = el("span", "ab-mission-ic", x.icon); ic.setAttribute("aria-hidden", "true");
      var tx = el("span", "ab-mission-tx"); tx.appendChild(el("b", "", x.titel)); tx.appendChild(el("small", "", x.kurz));
      var team = el("span", "ab-mission-team"); team.setAttribute("aria-hidden", "true");
      x.team.forEach(function (k) { var f = D.FIGUREN[k]; if (f) { var s = el("i", f.blau ? "blau" : "", f.e); team.appendChild(s); } });
      tx.appendChild(team);
      b.appendChild(ic); b.appendChild(tx);
      if (g.indexOf(x.id) > -1) { var m = el("span", "ab-medaille", "🏅"); m.setAttribute("aria-label", "Mission geschafft"); b.appendChild(m); }
      l.appendChild(b);
    });
    buehne.appendChild(l);
    textEl.textContent = g.length ? "Schon " + g.length + " von " + D.GESCHICHTEN.length + " Missionen geschafft!" : "Otti und seine Freunde brauchen dich. Tipp auf eine Mission.";
    lehreEl.hidden = true; aktion.innerHTML = "";
    platz();
    setTimeout(function () { var f = l.querySelector(".ab-mission"); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }, 60);
  }

  /* ================= Eine Mission ================= */
  function starten(n) {
    G = daten().GESCHICHTEN[n]; G.n = n; i = 0; gezeigt = 0;
    gesamt = G.screens.length + (G.screens.some(function (s) { return s.wahl; }) ? 1 : 0);
    ov.classList.remove("ist-liste"); nochmal.hidden = false; zurueck.hidden = false;
    kopfTitel.textContent = G.icon + " " + G.titel;
    zeige(G.screens[0]);
  }
  function punkteZeigen() {
    punkte.innerHTML = "";
    for (var k = 0; k < gesamt; k++) punkte.appendChild(el("i", k < gezeigt ? "an" : k === gezeigt ? "jetzt" : ""));
  }
  function figur(k, cls) {
    var F = daten().FIGUREN[k]; if (!F) return null;
    var f = el("div", "ab-fig " + (cls || "") + (F.held ? " ist-held" : "") + (F.blau ? " blau" : ""));
    if (F.farbe) f.style.setProperty("--h", F.farbe);
    f.dataset.k = k;
    var e = el("span", "ab-fig-e", F.e); e.setAttribute("aria-hidden", "true");
    f.appendChild(e); f.appendChild(el("b", "", F.n));
    return f;
  }
  function licht(art) {
    var l = el("div", "ab-licht " + art); l.setAttribute("aria-hidden", "true");
    var n = art === "alarm" ? 0 : 14;
    for (var k = 0; k < n; k++) {
      var s = el("i"); s.style.left = (5 + Math.random() * 90) + "%"; s.style.top = (8 + Math.random() * 70) + "%";
      s.style.setProperty("--v", (Math.random() * 3).toFixed(2) + "s"); s.style.setProperty("--t", (2.6 + Math.random() * 2.4).toFixed(2) + "s");
      if (k % 3 === 0) s.className = "v"; l.appendChild(s);
    }
    return l;
  }
  function zeige(s) {
    ab = s; ov.classList.remove("ist-ende");
    punkteZeigen();
    szene.className = "ab-szene bg-" + (s.bg || "wald") + (s.dunkel ? " dunkel" : "");
    svg.innerHTML = kulisse(s.bg || "wald");
    szene.classList.remove("mit-bild"); bild.hidden = true;
    if (s.bild) bild.src = BASIS + "bilder/" + s.bild; else bild.removeAttribute("src");
    buehne.innerHTML = ""; buehne.className = "ab-buehne" + (s.tippen ? " tippen" : ""); aktion.className = "ab-aktion";
    if (s.licht) buehne.appendChild(licht(s.licht));
    var otti = el("img", "ab-otti pose-" + (s.otti || "idle")); otti.alt = "Otti"; otti.src = AURA + (s.otti || "idle") + ".webp"; otti.decoding = "async";
    var ottiBox = el("div", "ab-ottibox"); ottiBox.appendChild(el("i", "ab-schein")); ottiBox.appendChild(otti);
    buehne.appendChild(ottiBox);
    if (s.held) { var h = figur(s.held, "gross" + (s.oben ? " oben" : "") + (s.klein ? " klein" : "")); if (h) { buehne.appendChild(h); if (s.gadget) { var gd = el("span", "ab-gadget", s.gadget); gd.setAttribute("aria-hidden", "true"); h.appendChild(gd); } } }
    else if (s.gadget) { var g2 = el("span", "ab-gadget bei-otti", s.gadget); g2.setAttribute("aria-hidden", "true"); ottiBox.appendChild(g2); }
    if (s.figuren && s.figuren.length) { var r = el("div", "ab-reihe"); s.figuren.forEach(function (k) { var f = figur(k, "klein"); if (f) r.appendChild(f); }); buehne.appendChild(r); }
    textEl.textContent = s.text; aktuellerText = s.text;
    lehreEl.hidden = true; aktion.innerHTML = "";
    if (s.wahl) zeigeWahl(s);
    else if (s.tippen) zeigeTippen(s);
    else if (s.ende) zeigeEnde(s);
    else weiterKnopf();
    if (!s.ende) sprich(s.text);
    platz();
  }
  function weiterKnopf(fn) {
    var b = knopf("ab-weiter", "Weiter ▶", function () { klang("tipp"); still(); (fn || naechste)(); });
    aktion.appendChild(b); fokus(b);
  }
  function fokus(b) { setTimeout(function () { if (b.isConnected) try { b.focus({ preventScroll: true }); } catch (e) {} }, 60); }
  function naechste() { gezeigt++; i++; if (i < G.screens.length) zeige(G.screens[i]); }

  /* Mitmach-Moment 1: zwei Wege. Danach kommt der Weg als eigener Bildschirm, dann geht es gemeinsam weiter. */
  function zeigeWahl(s) {
    var w = el("div", "ab-wahl");
    s.wahl.forEach(function (o, k) {
      var b = knopf("", o.t, function () {
        klang("tipp"); still(); gezeigt++;
        var x = {}; for (var p in o) x[p] = o[p];
        x.weg = true; zeige(x);
        G.weg = k;
      });
      b.dataset.weg = String(k);
      w.appendChild(b);
    });
    aktion.appendChild(w); fokus(w.firstChild);
  }

  /* Mitmach-Moment 2: tippen, um zu helfen (Sterne, Pilze, Glühwürmchen, Spuren, Wirbel) */
  var ORTE = { 4: [[22, 6], [74, 4], [40, 30], [82, 34]], 5: [[16, 6], [50, 2], [84, 8], [34, 30], [76, 32]], 6: [[14, 6], [46, 2], [82, 6], [28, 30], [60, 26], [88, 34]] };
  function zeigeTippen(s) {
    var t = s.tippen, feld = el("div", "ab-tippfeld art-" + t.art), z = 0, orte = ORTE[t.n] || ORTE[5];
    var zaehler = el("div", "ab-zaehler"); zaehler.setAttribute("aria-hidden", "true");
    for (var k = 0; k < t.n; k++) zaehler.appendChild(el("i"));
    var info = el("p", "ab-tipphinweis", "👆 Tipp an! 0 von " + t.n); info.setAttribute("aria-live", "polite");
    orte.slice(0, t.n).forEach(function (p, k) {
      var b = knopf("ab-ding", t.aus); b.style.left = p[0] + "%"; b.style.top = p[1] + "%"; b.style.setProperty("--v", (k * .18).toFixed(2) + "s");
      b.setAttribute("aria-label", ({ pilz: "Leuchtpilz", wurm: "Glühwürmchen", stern: "Stern", spur: "Spur", wirbel: "Kleiner Wirbel" }[t.art] || "Tippen") + " " + (k + 1));
      b.addEventListener("click", function () {
        if (b.classList.contains("an")) return;
        b.classList.add("an"); b.textContent = t.an; b.setAttribute("aria-pressed", "true");
        zaehler.children[z].classList.add("an"); z++;
        klang("pop", z * 2); funken(b);
        info.textContent = z < t.n ? "👆 " + z + " von " + t.n : "✨ Geschafft!";
        if (z >= t.n) fertig();
      });
      feld.appendChild(b);
    });
    buehne.appendChild(feld);
    aktion.appendChild(zaehler); aktion.appendChild(info);
    function fertig() {
      feld.classList.add("alle"); szene.classList.add("hell"); szene.classList.remove("dunkel");
      klang("jubel"); var a = api(); if (a.sternDazu) try { a.sternDazu(zaehler); } catch (e) {}
      textEl.textContent = t.fertig; aktuellerText = t.fertig; still(); sprich(t.fertig);
      info.remove(); weiterKnopf();
    }
    fokus(feld.firstChild);
  }
  function funken(vonEl) {
    if (RUHIG) return;
    var r = vonEl.getBoundingClientRect(), q = buehne.getBoundingClientRect();
    for (var k = 0; k < 8; k++) {
      var f = el("i", "ab-funke" + (k % 3 ? "" : " v")), w = Math.random() * Math.PI * 2, s = 30 + Math.random() * 50;
      f.style.left = (r.left - q.left + r.width / 2) + "px"; f.style.top = (r.top - q.top + r.height / 2) + "px";
      f.style.setProperty("--dx", Math.round(Math.cos(w) * s) + "px"); f.style.setProperty("--dy", Math.round(Math.sin(w) * s - 30) + "px");
      f.addEventListener("animationend", function () { this.remove(); });
      buehne.appendChild(f);
    }
  }

  /* Ende: Mission geschafft! Abzeichen, Stern und Sticker aus dem Belohnungs-System der App */
  function zeigeEnde(s) {
    ov.classList.add("ist-ende");
    lehreEl.textContent = "💛 " + s.lehre; lehreEl.hidden = false;
    var neu = geschafft().indexOf(G.id) < 0; merke(G.id);
    var badge = el("div", "ab-badge"); badge.setAttribute("role", "img"); badge.setAttribute("aria-label", "Abzeichen: Mission geschafft!");
    badge.appendChild(el("span", "ab-badge-e", "🏅")); badge.appendChild(el("b", "", "Mission geschafft!"));
    buehne.appendChild(badge);
    var a = api(), stk = "";
    if (a.sternDazu) try { a.sternDazu(badge); } catch (e) {}
    if (neu && a.stickerDazu) try { stk = a.stickerDazu() || ""; } catch (e) {}
    if (stk) badge.appendChild(el("small", "", "Neuer Sticker: " + stk));
    klang("feier");
    var D = daten(), nx = (G.n + 1) % D.GESCHICHTEN.length, w = el("div", "ab-endwahl");
    var naechsteB = knopf("ab-weiter", "🚀 Nächste Mission", function () { klang("tipp"); still(); starten(nx); });
    w.appendChild(naechsteB);
    var zwei = el("div", "ab-zwei");
    zwei.appendChild(knopf("ab-zweit", "📋 Alle Missionen", function () { klang("tipp"); liste(); }));
    zwei.appendChild(knopf("ab-zweit ab-heim", "🦔 Zu Otti", function () { klang("tipp"); zu(); }));
    w.appendChild(zwei); aktion.appendChild(w); aktion.classList.add("ende");
    gezeigt = gesamt; punkteZeigen();
    sprich(s.text + " Mission geschafft! " + s.lehre);
    aktuellerText = s.text + " " + s.lehre;
    fokus(naechsteB);
  }

  /* ================= Karte in der Spielwahl ================= */
  function karteZeigen(k) {
    var g = geschafft().length, n = daten().GESCHICHTEN.length, sm = k.querySelector("small");
    if (sm) sm.textContent = g ? g + " von " + n + " Missionen geschafft 🏅" : n + " Missionen mit Otti und neuen Helden";
  }
  function start() {
    var k = d.querySelector("[data-abenteuer]"); if (!k) return;
    karteZeigen(k);
    k.addEventListener("click", function (e) { e.stopPropagation(); oeffnen(); });
    /* Sanftes Zeitlimit (runde9.js): auch das Abenteuer wird still */
    var A = window.OTTI_API;
    if (A && A.allesStill && !A.allesStill.__ab) { var alt = A.allesStill; A.allesStill = function () { try { zu(); } catch (e) {} return alt.apply(this, arguments); }; A.allesStill.__ab = true; }
    if (location.hash === "#abenteuer") setTimeout(oeffnen, 1200);
  }
  window.OttiAbenteuer = { oeffnen: function () { oeffnen(); }, schliessen: function () { zu(); } };
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", start); else start();
})();
