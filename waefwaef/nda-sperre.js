/* nda-sperre.js – Geheimhaltung vor dem Start.
   Ein Vollbild-Fenster deckt die App ab, bis die Person mit dem Finger unterschrieben,
   das Kästchen angekreuzt und auf «Fertig» getippt hat. Danach Bestätigungsfeld für einen
   Screenshot an Diego (WhatsApp) und «Weiter zur App».
   Schalter: standardmässig AN (live geschaltete Fassung, GitHub Pages).
   Aus nur mit window.NDA_SPERRE = false (wird in den claude.ai-Artefakt-Fassungen gesetzt,
   dort ist Diego selbst und braucht keine Sperre).
   Einbau: ein script-Element mit src="nda-sperre.js" und data-app="App-Name" (optional data-eltern).
   Freischaltung in localStorage; ist der Speicher gesperrt, gilt die Sperre pro Sitzung. */
(function () {
  "use strict";
  if (window.NDA_SPERRE === false || window.__ndaSperre) return;
  window.__ndaSperre = true;

  var me = document.currentScript, ds = (me && me.dataset) || {};
  var APP = ds.app || "App";
  var ELTERN = ds.eltern != null;
  var FASSUNG = "Fassung vom 22.10.2026";
  var KEY = "nda-sperre:" + APP + ":" + FASSUNG;
  var mem = false;

  function frei() {
    if (mem) return true;
    try { if (localStorage.getItem(KEY)) return true; } catch (e) {}
    try { if (sessionStorage.getItem(KEY)) return true; } catch (e) {}
    return false;
  }
  function merken(v) {
    mem = true;
    try { localStorage.setItem(KEY, v); return; } catch (e) {}
    try { sessionStorage.setItem(KEY, v); } catch (e) {}
  }
  if (frei()) return;

  var html = document.documentElement;
  html.classList.add("nda-zu");
  var vorStil = document.createElement("style");
  vorStil.textContent = "html.nda-zu{overflow:hidden!important}html.nda-zu body>*:not(#nda-sperre){visibility:hidden!important}";
  (document.head || html).appendChild(vorStil);
  try {
    var fl = document.createElement("link"); fl.rel = "stylesheet";
    fl.href = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap";
    (document.head || html).appendChild(fl);
  } catch (e) {}

  /* Vertragstext unverändert aus plaene/nda/nda-sperre-vorlage.html */
  var SECTIONS = [
    { h: "1. Zweck", p: ["Diego Robert stellt der Empfangenden Partei die App «{{APP_NAME}}» vor und gibt sie ihr zum Ansehen und Ausprobieren (der «Zweck»)."] },
    { h: "2. Vertrauliche Informationen",
      p: ["Vertraulich sind alle Informationen, die im Zusammenhang mit dem Zweck mündlich, schriftlich, digital oder durch Vorführung offengelegt werden, insbesondere:"],
      ul: ["die App «{{APP_NAME}}», ihre Funktionen, Inhalte und ihr Aufbau;",
           "Ideen, Konzepte, Namen, Figuren, Geschichten, Designs, Bilder und Filme;",
           "Programme, Quellcode, Server und technische Abläufe;",
           "Pläne, Zahlen, Preise und alle Unterlagen dazu."] },
    { h: "3. Ausnahmen",
      p: ["Nicht vertraulich ist, was nachweislich"],
      ul: ["a) bereits öffentlich bekannt ist oder ohne Verschulden der Empfangenden Partei öffentlich wird;",
           "b) der Empfangenden Partei vorher rechtmässig bekannt war;",
           "c) ihr von Dritten rechtmässig und ohne Geheimhaltungspflicht mitgeteilt wird;",
           "d) aufgrund Gesetz oder behördlicher Anordnung offengelegt werden muss (dann vorher Information an Diego Robert, soweit erlaubt)."] },
    { h: "4. Pflichten",
      p: ["Die Empfangende Partei"],
      ul: ["a) verwendet die vertraulichen Informationen nur für den Zweck;",
           "b) gibt sie nicht an Dritte weiter, auch nicht an ihren Arbeitgeber, ohne vorgängige schriftliche Zustimmung (E-Mail genügt);",
           "c) macht keine Kopien, Fotos, Bildschirmaufnahmen oder Aufnahmen ohne Zustimmung;",
           "d) nutzt die Ideen nicht selbst oder für Dritte und meldet keine Marken, Namen oder Schutzrechte daraus an."] },
    { h: "5. Kein Recht und keine Pflicht", p: ["Diese Vereinbarung überträgt keine Rechte an Ideen, Namen, Figuren oder Programmen. Alle Rechte bleiben bei Diego Robert. Keine Partei ist verpflichtet, eine Zusammenarbeit einzugehen."] },
    { h: "6. Rückgabe", p: ["Auf Verlangen gibt die Empfangende Partei alle Unterlagen zurück oder löscht sie, auch die App, und bestätigt dies."] },
    { h: "7. Dauer", p: ["Die Vereinbarung gilt ab Unterzeichnung. Die Geheimhaltungspflicht gilt 5 Jahre über das Ende der Gespräche oder einer Zusammenarbeit hinaus."] },
    { h: "8. Verletzung", p: ["Bei Verletzung haftet die Empfangende Partei für den nachgewiesenen Schaden."] },
    { h: "9. Recht und Gerichtsstand", p: ["Es gilt Schweizer Recht. Gerichtsstand ist Zürich."] }
  ];
  function ersetze(t) { return t.split("{{APP_NAME}}").join(APP); }

  var CSS = [
    ":host{all:initial;display:block}",
    ":host{--bg:#F3F2EE;--paper:#FCFBF8;--ink:#1B2230;--muted:#5E6573;--line:#D9D6CE;--accent:#7A5C2C;--accent-soft:#EFE6D6;--pad:#FFFFFF;--ok:#2F6B4F;--warn:#9A3B2E;",
    "--font-display:\"Bodoni Moda\",\"Didot\",\"Bodoni 72\",Georgia,serif;--font-body:\"Source Serif 4\",Georgia,\"Times New Roman\",serif;--font-ui:\"IBM Plex Sans\",system-ui,-apple-system,\"Segoe UI\",sans-serif}",
    "@media (prefers-color-scheme:dark){:host(:not([data-theme=light])){--bg:#10141B;--paper:#171C25;--ink:#ECE8DF;--muted:#A2A6AF;--line:#2D3440;--accent:#D2AE6E;--accent-soft:#2A2619;--pad:#F7F5F0;--ok:#7CC4A0;--warn:#E08A7C;color-scheme:dark}}",
    ":host([data-theme=dark]){--bg:#10141B;--paper:#171C25;--ink:#ECE8DF;--muted:#A2A6AF;--line:#2D3440;--accent:#D2AE6E;--accent-soft:#2A2619;--pad:#F7F5F0;--ok:#7CC4A0;--warn:#E08A7C;color-scheme:dark}",
    "*{box-sizing:border-box}",
    "[hidden]{display:none!important}",
    "dialog{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;border:0;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;",
    "background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:17px;line-height:1.6;-webkit-text-size-adjust:100%;text-size-adjust:100%;",
    "padding:calc(28px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) calc(64px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}",
    "dialog:not([open]){display:none}",
    "dialog.fallback{z-index:2147483647}",
    "dialog::backdrop{background:#10141B}",
    ".sheet{max-width:760px;margin:0 auto;background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:clamp(18px,5vw,56px);display:grid;grid-template-columns:minmax(0,1fr);gap:28px;min-width:0}",
    "header.brand{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;justify-items:center;text-align:center;padding-bottom:22px;border-bottom:1px solid var(--line);min-width:0}",
    ".wordmark{font-family:var(--font-display);font-weight:600;font-size:clamp(24px,7vw,40px);letter-spacing:.14em;margin-right:-.14em;line-height:1.1;text-transform:uppercase;overflow-wrap:break-word;max-width:100%;text-wrap:balance}",
    ".wordmark-rule{width:56px;height:1px;background:var(--accent)}",
    ".eyebrow{font-family:var(--font-ui);font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}",
    ".eltern-tag{font:600 12px var(--font-ui);letter-spacing:.14em;text-transform:uppercase;color:var(--paper);background:var(--ink);border-radius:999px;padding:4px 12px}",
    "h1{font-family:var(--font-display);font-weight:400;font-size:clamp(19px,5.8vw,34px);line-height:1.2;margin:0;text-wrap:balance;hyphens:auto;overflow-wrap:break-word;max-width:100%}",
    "h1:focus{outline:none}",
    ".eltern{border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:4px;padding:14px 16px;font:15px/1.5 var(--font-ui);display:grid;gap:4px}",
    ".eltern b{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}",
    ".eltern p{margin:0}",
    ".howto{border:1px solid var(--accent);background:var(--accent-soft);border-radius:4px;padding:18px 20px;display:grid;gap:8px;font-family:var(--font-ui);font-size:15px;line-height:1.5}",
    ".howto b{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}",
    ".howto ol{margin:0;padding-left:1.3em;display:grid;gap:4px}",
    ".parties{display:grid;gap:6px;text-align:center;overflow-wrap:break-word}",
    ".parties .and{font-style:italic;color:var(--muted)}",
    ".parties strong{font-weight:600}",
    ".contract{display:grid;gap:22px}",
    ".contract section{display:grid;gap:8px}",
    ".contract h2{font-family:var(--font-ui);font-weight:600;font-size:14px;letter-spacing:.08em;text-transform:uppercase;margin:0;color:var(--accent)}",
    ".contract p,.contract ul{margin:0;max-width:65ch}",
    ".contract ul{padding-left:1.3em;display:grid;gap:4px}",
    ".form{display:grid;gap:22px;border-top:1px solid var(--line);padding-top:26px;margin:0}",
    ".fields{display:grid;grid-template-columns:1fr 1fr;gap:16px}",
    ".fields .wide{grid-column:1/-1}",
    "@media (max-width:560px){.fields{grid-template-columns:1fr}}",
    "label.field{display:grid;gap:6px;min-width:0}",
    "label.field span{font-family:var(--font-ui);font-size:13px;color:var(--muted);letter-spacing:.02em}",
    "input[type=text]{font:17px var(--font-body);color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:4px;padding:10px 12px;width:100%;min-width:0;margin:0}",
    ".consent{display:flex;gap:12px;align-items:flex-start;font-size:16px}",
    ".consent input{width:22px;height:22px;margin:3px 0 0;accent-color:var(--accent);flex:none}",
    ".sig{display:grid;gap:8px;min-width:0}",
    ".sig-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-family:var(--font-ui);font-size:13px;color:var(--muted)}",
    ".sig-head b{color:var(--ink);font-weight:600;font-size:14px;overflow-wrap:anywhere}",
    ".pad-wrap{position:relative;background:var(--pad);border:1px solid var(--line);border-radius:4px;aspect-ratio:5/2;width:100%;max-width:520px}",
    ".pad-wrap canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair;border-radius:4px}",
    ".pad-wrap .baseline{position:absolute;left:8%;right:8%;bottom:24%;border-bottom:1px solid #C9C4B8;pointer-events:none}",
    ".pad-wrap .hint{position:absolute;left:8%;bottom:6%;font:12px var(--font-ui);color:#5F5B52;pointer-events:none}",
    ".pad-wrap.signed .hint{display:none}",
    ".linkbtn{font:500 14px var(--font-ui);background:none;border:0;color:var(--accent);cursor:pointer;padding:8px 0;min-height:44px}",
    ".actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center}",
    ".btn{font:600 16px var(--font-ui);padding:13px 26px;min-height:48px;border-radius:4px;cursor:pointer;border:1px solid var(--ink);background:var(--ink);color:var(--paper)}",
    ".btn:disabled{opacity:.45;cursor:not-allowed}",
    ".btn:focus-visible,.linkbtn:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}",
    ".status{font:14px var(--font-ui);color:var(--muted)}",
    ".status.err{color:var(--warn)}",
    ".done{display:grid;gap:14px;justify-items:start;border:1px solid var(--accent);background:var(--accent-soft);border-radius:4px;padding:clamp(16px,4vw,22px);min-width:0}",
    ".done h2{font-family:var(--font-display);font-weight:400;font-size:26px;margin:0;line-height:1.2}",
    ".done h2:focus{outline:none}",
    ".done p{margin:0}",
    ".done .check{font:600 13px var(--font-ui);color:var(--ok);letter-spacing:.08em;text-transform:uppercase}",
    ".proof{display:grid;gap:6px;line-height:1.4;background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:18px;width:100%;font-size:15px;min-width:0;overflow-wrap:anywhere}",
    ".proof>div{display:flex;flex-wrap:wrap;gap:2px 8px;align-items:baseline}",
    ".proof>div.sigrow{display:grid;gap:4px}",
    ".proof .k{font:11px var(--font-ui);min-width:92px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}",
    ".proof img{background:#fff;border:1px solid var(--line);border-radius:4px;width:100%;max-width:320px}",
    "@media (prefers-reduced-motion:no-preference){.done{animation:rise .4s ease-out both}@keyframes rise{from{transform:translateY(6px)}to{transform:none}}}"
  ].join("\n");

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function vorlage() {
    var howto = ELTERN
      ? "<li>Den Text unten in Ruhe lesen.</li><li>Ihren Namen, Ihr Geburtsdatum und Ihre Adresse eintragen.</li><li>Das Kästchen ankreuzen.</li><li>Mit dem Finger unterschreiben und auf «Fertig» tippen.</li><li>Vom Bestätigungsfeld einen Screenshot machen und Diego per WhatsApp schicken.</li>"
      : "<li>Den Text unten in Ruhe lesen.</li><li>Nachname, Geburtsdatum und Adresse eintragen.</li><li>Das Kästchen ankreuzen.</li><li>Mit dem Finger unterschreiben und auf «Fertig» tippen.</li><li>Vom Bestätigungsfeld einen Screenshot machen und Diego per WhatsApp schicken.</li>";
    return "<style>" + CSS + "</style>" +
      '<dialog id="dlg" aria-labelledby="titel" lang="de-CH">' +
      '<main class="sheet">' +
      '<header class="brand">' +
      (ELTERN ? '<div class="eltern-tag">Für Eltern</div>' : "") +
      '<div class="wordmark">' + esc(APP) + "</div>" +
      '<div class="wordmark-rule"></div>' +
      '<div class="eyebrow">Vertraulich</div>' +
      '<h1 id="titel" tabindex="-1">Geheimhaltungsvereinbarung</h1>' +
      "</header>" +
      (ELTERN ? '<div class="eltern"><b>Für Eltern</b><p>«' + esc(APP) + "» ist eine App für Kinder. Bitte lesen und unterschreiben Sie als Mutter, Vater oder erziehungsberechtigte Person. Danach ist die App für Ihr Kind offen.</p></div>" : "") +
      '<div class="howto"><b>So geht es</b><ol>' + howto + "</ol></div>" +
      '<div class="parties">' +
      '<div class="eyebrow">zwischen</div>' +
      "<div><strong>Diego Robert</strong>, Einzelfirma Rolfing Kinesiologie, Nordstrasse 56, 8006 Zürich<br><span class=\"and\">(nachfolgend «Offenlegende Partei»)</span></div>" +
      '<div class="eyebrow">und</div>' +
      '<div><strong id="party-name"></strong><span id="party-geb"></span><span id="party-addr"></span><br><span class="and">(nachfolgend «Empfangende Partei»)</span></div>' +
      "</div>" +
      '<div class="contract" id="contract"></div>' +
      '<form class="form" id="form" novalidate>' +
      '<div class="fields">' +
      '<label class="field"><span>' + (ELTERN ? "Ihr Vorname und Nachname" : "Vorname und Nachname") + '</span><input type="text" id="f-name" autocomplete="name"></label>' +
      '<label class="field"><span>Geburtsdatum</span><input type="text" id="f-geb" inputmode="numeric" placeholder="TT.MM.JJJJ"></label>' +
      '<label class="field wide"><span>Adresse</span><input type="text" id="f-addr" autocomplete="street-address" placeholder="Strasse Nr., PLZ Ort"></label>' +
      '<label class="field"><span>Ort</span><input type="text" id="f-ort" value="Zürich"></label>' +
      '<label class="field"><span>Datum</span><input type="text" id="f-date" inputmode="numeric"></label>' +
      "</div>" +
      '<label class="consent"><input type="checkbox" id="f-ok"><span>Ich habe die Vereinbarung gelesen und bin damit einverstanden.</span></label>' +
      '<div class="sig">' +
      '<div class="sig-head"><b id="sig-label">Unterschrift</b><button type="button" class="linkbtn" id="clear">Neu zeichnen</button></div>' +
      '<div class="pad-wrap" id="wrap-p"><canvas id="pad-p" role="img" aria-label="Feld für die Unterschrift mit dem Finger"></canvas><div class="baseline"></div><div class="hint" aria-hidden="true">Hier mit dem Finger unterschreiben</div></div>' +
      "</div>" +
      '<div class="actions"><button type="submit" class="btn" id="submit">Fertig</button><span class="status" id="status" role="status" aria-live="polite"></span></div>' +
      "</form>" +
      '<section class="done" id="done" hidden aria-labelledby="done-title">' +
      '<div class="check">Unterzeichnet</div>' +
      '<h2 id="done-title" tabindex="-1">Vielen Dank</h2>' +
      '<p id="done-text">Jetzt bitte einen Screenshot machen und Diego per WhatsApp schicken.</p>' +
      '<div class="proof">' +
      '<div><div class="k">Vereinbarung</div><div>Geheimhaltung ' + esc(APP) + ", mit Diego Robert (22.10.2026)</div></div>" +
      '<div><div class="k">Name</div><div id="pr-name"></div></div>' +
      '<div><div class="k">Geburtsdatum</div><div id="pr-geb"></div></div>' +
      '<div><div class="k">Adresse</div><div id="pr-addr"></div></div>' +
      '<div><div class="k">Ort, Datum</div><div id="pr-ort"></div></div>' +
      "<div><div>Ich habe die Vereinbarung gelesen und bin damit einverstanden.</div></div>" +
      '<div class="sigrow"><div class="k">Unterschrift</div><img id="pr-sig" alt="Unterschrift"></div>' +
      "</div>" +
      '<div class="actions"><button type="button" class="btn" id="weiter">Weiter zur App</button></div>' +
      "</section>" +
      "</main></dialog>";
  }

  function today() {
    var d = new Date();
    return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear();
  }

  function makePad(canvas, wrap, onChange) {
    var ctx = canvas.getContext("2d"), strokes = [], cur = null;
    function size() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
      redraw();
    }
    function drawStroke(c, s, w, h, lw) {
      if (!s.length) return;
      c.beginPath(); c.moveTo(s[0][0] * w, s[0][1] * h);
      if (s.length === 1) c.lineTo(s[0][0] * w + 0.1, s[0][1] * h);
      for (var i = 1; i < s.length - 1; i++) {
        var mx = (s[i][0] + s[i + 1][0]) / 2, my = (s[i][1] + s[i + 1][1]) / 2;
        c.quadraticCurveTo(s[i][0] * w, s[i][1] * h, mx * w, my * h);
      }
      if (s.length > 1) { var l = s[s.length - 1]; c.lineTo(l[0] * w, l[1] * h); }
      c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = "#1B2230"; c.stroke();
    }
    function redraw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var lw = Math.max(2, canvas.width / 220);
      strokes.forEach(function (s) { drawStroke(ctx, s, canvas.width, canvas.height, lw); });
      wrap.classList.toggle("signed", strokes.length > 0);
    }
    function pt(e) { var r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; }
    canvas.addEventListener("pointerdown", function (e) { e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch (x) {} cur = [pt(e)]; strokes.push(cur); redraw(); onChange(); });
    canvas.addEventListener("pointermove", function (e) { if (!cur) return; var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!evs.length) evs = [e]; evs.forEach(function (ev) { cur.push(pt(ev)); }); redraw(); });
    function end() { cur = null; }
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
    if (window.ResizeObserver) new ResizeObserver(size).observe(canvas); else { window.addEventListener("resize", size); setTimeout(size, 0); }
    return {
      clear: function () { strokes = []; redraw(); onChange(); },
      empty: function () { return strokes.length === 0; },
      png: function () {
        var w = 640, h = 256, c = document.createElement("canvas"); c.width = w; c.height = h;
        var x = c.getContext("2d"); x.fillStyle = "#FFFFFF"; x.fillRect(0, 0, w, h);
        strokes.forEach(function (s) { drawStroke(x, s, w, h, 3.2); });
        return c.toDataURL("image/png");
      }
    };
  }

  function start() {
    var body = document.body;
    var host = document.createElement("div");
    host.id = "nda-sperre";
    var th = html.getAttribute("data-theme"); if (th) host.setAttribute("data-theme", th);
    body.appendChild(host);
    var root = host.attachShadow({ mode: "open" });
    root.innerHTML = vorlage();
    var $ = function (id) { return root.getElementById(id); };
    var dlg = $("dlg"), offen = true;

    /* Vertrag */
    var box = $("contract");
    SECTIONS.forEach(function (s) {
      var sec = document.createElement("section"), h = document.createElement("h2");
      h.textContent = s.h; sec.appendChild(h);
      (s.p || []).forEach(function (t) { var p = document.createElement("p"); p.textContent = ersetze(t); sec.appendChild(p); });
      if (s.ul) { var ul = document.createElement("ul"); s.ul.forEach(function (t) { var li = document.createElement("li"); li.textContent = ersetze(t); ul.appendChild(li); }); sec.appendChild(ul); }
      box.appendChild(sec);
    });

    /* Rest der Seite stilllegen, solange die Sperre gilt */
    var still = [];
    function stilllegen(n) {
      if (n === host || n.nodeType !== 1 || n.hasAttribute("inert")) return;
      n.setAttribute("inert", ""); still.push(n);
    }
    Array.prototype.forEach.call(body.children, stilllegen);
    var mo = new MutationObserver(function (ms) { ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, stilllegen); }); });
    mo.observe(body, { childList: true });

    /* Eingaben im Fenster nicht an die App weiterreichen */
    ["click", "pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend", "keydown", "keyup", "keypress", "input", "change", "focusin", "focusout", "wheel"].forEach(function (t) {
      host.addEventListener(t, function (e) { e.stopPropagation(); });
    });

    /* Fokus bleibt im Fenster */
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); return; }
      if (e.key !== "Tab") return;
      var f = Array.prototype.filter.call(dlg.querySelectorAll("button,input,[tabindex='0']"), function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return;
      var a = root.activeElement, i = f.indexOf(a);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
    });
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); });
    dlg.addEventListener("close", function () { if (offen) zeigen(); });

    function zeigen() {
      if (typeof dlg.showModal === "function") { try { dlg.showModal(); } catch (e) { dlg.setAttribute("open", ""); dlg.classList.add("fallback"); } }
      else { dlg.setAttribute("open", ""); dlg.classList.add("fallback"); }
    }
    zeigen();
    setTimeout(function () { try { $("titel").focus({ preventScroll: true }); } catch (e) {} }, 0);

    /* Formular */
    var pad = makePad($("pad-p"), $("wrap-p"), onChange);
    function onChange() { $("status").textContent = ""; $("status").classList.remove("err"); }
    function sync() {
      var n = $("f-name").value.trim(), a = $("f-addr").value.trim(), g = $("f-geb").value.trim();
      $("party-name").textContent = n;
      $("party-geb").textContent = g ? ", geboren am " + g : "";
      $("party-addr").textContent = a ? ", " + a : "";
      $("sig-label").textContent = n || "Unterschrift";
    }
    $("f-name").addEventListener("input", function () { sync(); onChange(); });
    $("f-addr").addEventListener("input", sync);
    $("f-geb").addEventListener("input", sync);
    $("f-ok").addEventListener("change", onChange);
    $("f-date").value = today();
    $("clear").addEventListener("click", function () { pad.clear(); });

    function problem(d) {
      if (d.name.split(/\s+/).length < 2) return "Bitte Vor- und Nachnamen eintragen.";
      if (!d.geburtsdatum) return "Bitte das Geburtsdatum eintragen.";
      if (!d.adresse) return "Bitte die Adresse eintragen.";
      if (!d.ort || !d.datum) return "Bitte Ort und Datum eintragen.";
      if (!d.einverstanden) return "Bitte das Einverständnis ankreuzen.";
      if (pad.empty()) return "Bitte mit dem Finger unterschreiben.";
      return "";
    }
    $("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var d = {
        name: $("f-name").value.trim(), adresse: $("f-addr").value.trim(), geburtsdatum: $("f-geb").value.trim(),
        ort: $("f-ort").value.trim(), datum: $("f-date").value.trim(), einverstanden: $("f-ok").checked
      };
      var err = problem(d), st = $("status");
      if (err) { st.textContent = err; st.classList.add("err"); return; }
      merken(JSON.stringify({ name: d.name, datum: d.datum, zeit: new Date().toISOString(), fassung: FASSUNG }));
      $("form").hidden = true; $("done").hidden = false;
      $("done-title").textContent = "Danke, " + d.name.split(/\s+/)[0];
      $("pr-name").textContent = d.name;
      $("pr-geb").textContent = d.geburtsdatum;
      $("pr-addr").textContent = d.adresse;
      $("pr-ort").textContent = d.ort + ", " + d.datum;
      $("pr-sig").src = pad.png();
      $("done").scrollIntoView({ block: "start" });
      try { $("done-title").focus({ preventScroll: true }); } catch (x) {}
    });

    $("weiter").addEventListener("click", function () {
      offen = false;
      mo.disconnect();
      still.forEach(function (n) { n.removeAttribute("inert"); });
      try { dlg.close(); } catch (e) {}
      host.remove(); vorStil.remove(); html.classList.remove("nda-zu");
      try { window.dispatchEvent(new CustomEvent("nda-sperre-frei", { detail: { app: APP } })); } catch (e) {}
    });
  }

  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
