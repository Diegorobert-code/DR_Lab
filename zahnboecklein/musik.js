/* musik.js – leise Kinder-Musik zum Einschalten (eigener Beat «Ava & Carmen», 96 BPM, nahtlose Schleife).
   Ein runder 🎵-Knopf. Aus, bis ein Kind ihn antippt; nie Autoplay ohne Geste (iOS).
   Gemerkt in localStorage: war sie «an», startet sie erst bei der nächsten Berührung der Seite.
   Pausiert, wenn die Seite verborgen ist oder ein Mikrofon (Nova, Lernen, Singen) läuft.
   Wird leiser, wenn die App selbst spricht; pausiert, wenn ein Film oder ein eigenes Lied der App läuft.
   <audio playsinline loop>, damit sie mit ton-ios.js (audioSession 'playback') auch bei Stumm-Schalter klingt.

   Einstellungen am <script>-Tag (alle freiwillig):
     data-app="otti"          Schlüssel fürs Merken (kinder-musik:<app>)
     data-laut="0.25"         Lautstärke (0–1), für Kinder leise
     data-ort=".kopfrechts"   Knopf in diesen Behälter (vorne) statt schwebend oben rechts
     data-wie="tonknopf"      Klasse der App, damit der Knopf wie ihre eigenen Knöpfe aussieht
     data-andere="pause"      andere <audio> der App: «leiser» (Stimme, Standard) oder «pause» (Lieder)
     data-stumm="#tonKnopf"   App-eigener Ton-Knopf: steht er auf aus (aria-pressed=false), ist auch die Musik still
     data-aus-wenn="#nachtlicht:not([hidden])"  dann Musik ganz aus (Schlafmodus mit eigenem Wiegenlied)
     data-schlaf="20"         spätestens nach so vielen Minuten Spielzeit schaltet sie sich selbst aus
   Mondschein «Nur hören»: Musik spielt leise unter der Geschichte, hält bei Pause an und ist still,
   wenn alle Geschichten fertig sind. */
(function () {
  "use strict";
  if (window.__kinderMusik) return; window.__kinderMusik = true;
  var d = document, me = d.currentScript || d.querySelector('script[src*="musik.js"]') || { dataset: {} };
  /* Je App ein passender Platz und Look (Bilderbuch-Stil der jeweiligen App); data-* am Tag geht vor */
  var VOR = {
    otti: { laut: "0.25", andere: "leiser", stumm: "#tonKnopf", ort: ".kopf", wie: "kimu-app",
      css: ".kopf{position:relative}.kopf>.kimu{position:absolute;left:54px;top:50%;margin-top:-22px;width:44px;height:44px;" +
        "border:1px solid var(--rand,#f5c54266);background:var(--flaeche,#ffffff14);color:#ffe7a6;font-size:20px}" +
        ".kopf>.kimu[aria-pressed=true]{background:rgba(245,197,66,.28);border-color:#f5c542}" },
    kiki: { laut: "0.25", andere: "pause", ort: "[data-feedback-slot]", wie: "kimu-app",
      css: "[data-feedback-slot]>.kimu{background:var(--gold-l,rgba(242,193,78,.16));color:var(--gold,#f2c14e);border:1px solid rgba(242,193,78,.35)}" +
        "[data-feedback-slot]>.kimu[aria-pressed=true]{background:var(--gold,#f2c14e);color:#2a1f05;border-color:var(--gold,#f2c14e)}" },
    zahnboecklein: { laut: "0.25", andere: "leiser", wie: "kimu-app",
      css: ".kimu.kimu-fest{top:calc(10px + env(safe-area-inset-top,0px));right:calc(10px + env(safe-area-inset-right,0px));width:56px;height:56px;font-size:26px;" +
        "background:rgba(255,255,255,.16);color:#fff;border:0;box-shadow:0 4px 14px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}" +
        ".kimu.kimu-fest[aria-pressed=true]{background:rgba(246,196,83,.9);color:#2a1d05;box-shadow:0 0 0 3px rgba(246,196,83,.35),0 4px 16px rgba(246,196,83,.5)}" },
    mondschein: { laut: "0.2", andere: "leiser", ausWenn: "#nachtlicht:not([hidden])", schlaf: "20" }
  };
  var C = {}, D = me.dataset || {}, V = VOR[(D.app || "").toLowerCase()] || {}, k0;
  for (k0 in V) C[k0] = V[k0];
  for (k0 in D) C[k0] = D[k0];
  var KEY = "kinder-musik:" + (C.app || location.pathname.split("/").slice(-2, -1)[0] || "app");
  var ZIEL = Math.min(1, Math.max(0.05, parseFloat(C.laut) || 0.25)), LEISE = 0.35, EIN = 1500, AUS = 900;
  var SCHLAF = (parseFloat(C.schlaf) || 0) * 60000;

  function merk(v) { try { localStorage.setItem(KEY, v ? "an" : "aus"); } catch (e) {} }
  function gemerkt() { try { return localStorage.getItem(KEY) === "an"; } catch (e) { return false; } }

  var a = d.createElement("audio");
  a.setAttribute("playsinline", ""); a.setAttribute("webkit-playsinline", "");
  a.loop = true; a.preload = "none"; a.src = "musik/ava-carmen.m4a";
  a.setAttribute("aria-hidden", "true");

  /* iOS ignoriert audio.volume: dann sanft über WebAudio-Gain, sonst direkt über volume */
  var gain = null, ctx = null, volOk = true;
  try { a.volume = 0.5; volOk = Math.abs(a.volume - 0.5) < 0.01; a.volume = 0; } catch (e) { volOk = false; }
  function graph() {
    if (volOk || gain) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC(); var src = ctx.createMediaElementSource(a);
      gain = ctx.createGain(); gain.gain.value = 0; src.connect(gain); gain.connect(ctx.destination);
      ctx.__kinderMusik = true;
    } catch (e) { gain = null; }
  }
  var pegel = 0;
  function setze(v) {
    pegel = v;
    if (gain) { try { gain.gain.value = v; } catch (e) {} } else { try { a.volume = v; } catch (e) {} }
  }

  var an = false, grund = {}, timer = 0, leise = 0, spielzeit = 0, seit = 0;
  function blockiert() { for (var k in grund) if (grund[k]) return true; return false; }
  function ziel() { return leise > 0 ? ZIEL * LEISE : ZIEL; }
  function rampe(z, dauer, fertig) {
    clearInterval(timer);
    var start = pegel, t0 = Date.now();
    timer = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / dauer);
      setze(start + (z - start) * p);
      if (p >= 1) { clearInterval(timer); if (fertig) fertig(); }
    }, 40);
  }
  function spiel() {
    if (!an || blockiert()) return;
    graph();
    if (ctx && ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    if (a.paused) setze(0);
    var p; try { p = a.play(); } catch (e) { p = null; }
    if (p && p.catch) p.catch(function () { if (an) warteAufGeste(); });  /* ohne Geste abgelehnt: bei der nächsten Berührung nochmals */
    if (!seit) seit = Date.now();
    rampe(ziel(), EIN);
  }
  function halt(sofort) {
    if (seit) { spielzeit += Date.now() - seit; seit = 0; }
    if (sofort) { clearInterval(timer); setze(0); a.pause(); return; }
    rampe(0, AUS, function () { if (!an || blockiert()) a.pause(); });
  }
  function still(k, v) {           /* Grund an/aus: pausieren oder weiterspielen */
    v = !!v; if (!!grund[k] === v) return;
    grund[k] = v;
    if (v) halt(k === "versteckt" || k === "mic"); else spiel();
  }
  function leiser(dx) {            /* App spricht: Musik leiser, danach wieder normal */
    leise = Math.max(0, leise + dx);
    if (an && !blockiert() && !a.paused) rampe(ziel(), 500);
  }
  function aus(merken) {           /* ganz aus (Knopf zeigt «aus») */
    if (!an) return;
    an = false; if (merken) merk(false); zeige(); wegGeste(); halt(false);
  }

  /* Knopf */
  var knopf = d.createElement("button");
  knopf.type = "button"; knopf.className = "kimu" + (C.wie ? " " + C.wie : "");
  knopf.innerHTML = '<span class="kimu-n" aria-hidden="true">🎵</span><span class="kimu-w" aria-hidden="true"><i></i><i></i><i></i></span>';
  knopf.setAttribute("aria-label", "Musik an/aus");
  function zeige() {
    knopf.setAttribute("aria-pressed", an ? "true" : "false");
    knopf.title = an ? "Musik aus" : "Musik an";
  }
  knopf.addEventListener("click", function () {
    an = !an; merk(an); zeige(); wegGeste();
    if (an) { spielzeit = 0; delete grund.schlaf; delete grund.ausWenn; spiel(); } else halt(false);
  });

  /* Gemerkt «an»: bei der ersten Geste starten (nicht wenn die Geste der Knopf selbst ist) */
  var EV = ["pointerdown", "touchend", "keydown"], wartet = false;
  function geste(e) {
    if (e && e.target && knopf.contains(e.target)) return;
    wegGeste(); if (an) spiel();
  }
  function warteAufGeste() { if (wartet) return; wartet = true; EV.forEach(function (t) { window.addEventListener(t, geste, { capture: true, passive: true }); }); }
  function wegGeste() { if (!wartet) return; wartet = false; EV.forEach(function (t) { window.removeEventListener(t, geste, true); }); }

  /* Seite verborgen */
  d.addEventListener("visibilitychange", function () { still("versteckt", d.hidden); });

  /* Mikrofon: während Aufnahme still (Hooks wie ton-ios.js, nur zusätzlich) */
  var mic = 0;
  function micAn() { mic++; still("mic", true); }
  function micAus() { mic = Math.max(0, mic - 1); if (!mic) setTimeout(function () { if (!mic) still("mic", false); }, 300); }
  try {
    var md = navigator.mediaDevices;
    if (md && md.getUserMedia) {
      var gum = md.getUserMedia.bind(md);
      md.getUserMedia = function (c) {
        if (!(c && c.audio)) return gum(c);
        micAn();
        return gum(c).then(function (s) {
          var tr = s.getAudioTracks(), offen = tr.length;
          if (!offen) { micAus(); return s; }
          tr.forEach(function (t) {
            var fertig = false, stop = t.stop;
            function ende() { if (fertig) return; fertig = true; if (--offen === 0) micAus(); }
            t.stop = function () { var r = stop.apply(t, arguments); ende(); return r; };
            t.addEventListener("ended", ende);
          });
          return s;
        }, function (e) { micAus(); throw e; });
      };
    }
  } catch (e) {}
  try {
    ["SpeechRecognition", "webkitSpeechRecognition"].forEach(function (n) {
      var K = window[n]; if (!K || !K.prototype || K.prototype.__kmStart) return;
      var st = K.prototype.start; K.prototype.__kmStart = true;
      K.prototype.start = function () {
        var self = this, fertig = false;
        function ende() { if (fertig) return; fertig = true; self.removeEventListener("end", ende); micAus(); }
        micAn(); self.addEventListener("end", ende);
        try { return st.apply(this, arguments); } catch (e) { ende(); throw e; }
      };
    });
  } catch (e) {}

  /* Andere Töne der App: Filme und Lieder pausieren die Musik, Stimmen machen sie leiser */
  var PAUSE_AUDIO = C.andere === "pause", laeuft = [];
  function zaehlt(el) {
    if (!el || el === a) return false;
    if (el.muted || el.volume < 0.05) return false;                  /* stille Wecker-Töne (iOS) */
    var s = el.currentSrc || el.src || ""; if (/^data:/.test(s)) return false;
    return true;
  }
  function art(el) { return (el.tagName === "VIDEO" || PAUSE_AUDIO) ? "pause" : "leiser"; }
  function neu() {
    var p = 0, l = 0;
    laeuft = laeuft.filter(function (x) { return !x.el.paused && !x.el.ended; });
    laeuft.forEach(function (x) { if (x.art === "pause") p++; else l++; });
    still("medien", p > 0);
    var war = leise > 0 ? 1 : 0, jetzt = (l > 0 || sprichtTTS) ? 1 : 0;
    if (war !== jetzt) leiser(jetzt - war);
  }
  try {
    var HM = window.HTMLMediaElement && HTMLMediaElement.prototype;
    if (HM && !HM.__kmPlay) {
      HM.__kmPlay = true;
      var play0 = HM.play;
      HM.play = function () {
        var el = this, r = play0.apply(el, arguments);
        if (zaehlt(el)) {
          var fertig = function () { setTimeout(neu, 60); };
          if (!el.__kmHoer) { el.__kmHoer = true; ["pause", "ended", "emptied", "volumechange"].forEach(function (t) { el.addEventListener(t, fertig); }); }
          var dabei = laeuft.some(function (x) { return x.el === el; });
          if (!dabei) laeuft.push({ el: el, art: art(el) });
          neu();
          if (r && r.catch) r.catch(fertig);
        }
        return r;
      };
    }
  } catch (e) {}
  /* Lieder der App über WebAudio (lange Schleifen, z. B. Zahnputz-Lieder) pausieren die Musik */
  var lieder = 0;
  try {
    var BS = window.AudioBufferSourceNode && AudioBufferSourceNode.prototype;
    if (BS && !BS.__kmStart) {
      BS.__kmStart = true;
      var start0 = BS.start, stop0 = BS.stop;
      BS.start = function () {
        var n = this;
        if (n.loop && n.buffer && n.buffer.duration > 8 && !n.__kmLied) {
          n.__kmLied = true; lieder++; still("lied", true);
          n.addEventListener("ended", function () { if (!n.__kmLied) return; n.__kmLied = false; lieder = Math.max(0, lieder - 1); if (!lieder) still("lied", false); });
        }
        return start0.apply(n, arguments);
      };
      BS.stop = function () {
        var n = this, r = stop0.apply(n, arguments);
        if (n.__kmLied) { n.__kmLied = false; lieder = Math.max(0, lieder - 1); if (!lieder) setTimeout(function () { if (!lieder) still("lied", false); }, 200); }
        return r;
      };
    }
  } catch (e) {}
  /* Vorlesen mit der Handy-Stimme: leiser */
  var sprichtTTS = false, ttsT = 0;
  try {
    var ss = window.speechSynthesis;
    if (ss && ss.speak && !ss.__kmSpeak) {
      ss.__kmSpeak = true;
      var speak0 = ss.speak.bind(ss);
      ss.speak = function (u) {
        var r = speak0(u);
        if (!sprichtTTS) { sprichtTTS = true; neu(); }
        clearInterval(ttsT);
        ttsT = setInterval(function () { if (!ss.speaking && !ss.pending) { clearInterval(ttsT); sprichtTTS = false; neu(); } }, 400);
        return r;
      };
    }
  } catch (e) {}

  /* Ton-Knopf der App, Schlafmodus, Schlaf-Zeit */
  function wache() {
    if (C.stumm) { var t = d.querySelector(C.stumm); still("stumm", !!(t && t.getAttribute("aria-pressed") === "false")); }
    if (C.ausWenn) { var w = false; try { w = !!d.querySelector(C.ausWenn); } catch (e) {} if (w && an) aus(false); }
    if (window.MS_HOEREN && MS_HOEREN.zustand) { try { var z = MS_HOEREN.zustand(); still("hoeren", !!(z.on && z.pause)); } catch (e) {} }
    if (SCHLAF && an && (spielzeit + (seit ? Date.now() - seit : 0)) >= SCHLAF) { spielzeit = 0; aus(false); }
  }

  /* Aussehen: rund, gross genug für Kinderfinger, Notenbild 🎵; an = leuchtet und wippt */
  var css = d.createElement("style");
  css.textContent =
    ".kimu{position:relative;flex:none;width:48px;height:48px;border-radius:50%;padding:0;margin:0;display:grid;place-items:center;cursor:pointer;" +
    "font-size:22px;line-height:1;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:transform .15s,box-shadow .3s,background .3s}" +
    ".kimu:active{transform:scale(.9)}" +
    ".kimu .kimu-n{grid-area:1/1;display:block;filter:grayscale(.7);opacity:.7;transition:filter .3s,opacity .3s,transform .3s}" +
    ".kimu[aria-pressed=true] .kimu-n{filter:none;opacity:1;transform:translateY(-3px)}" +
    ".kimu .kimu-w{grid-area:1/1;align-self:end;margin-bottom:6px;display:none;gap:2px;height:6px;align-items:end}" +
    ".kimu[aria-pressed=true] .kimu-w{display:flex}" +
    ".kimu .kimu-w i{display:block;width:3px;height:3px;border-radius:2px;background:currentColor;opacity:.8}" +
    "@media (prefers-reduced-motion:no-preference){" +
    ".kimu[aria-pressed=true] .kimu-w i{animation:kimuW .9s ease-in-out infinite alternate}" +
    ".kimu .kimu-w i:nth-child(2){animation-delay:.3s}.kimu .kimu-w i:nth-child(3){animation-delay:.6s}" +
    ".kimu[aria-pressed=true] .kimu-n{animation:kimuN 1.25s ease-in-out infinite alternate}}" +
    "@keyframes kimuW{to{height:6px}}@keyframes kimuN{from{transform:translateY(-3px) rotate(-6deg)}to{transform:translateY(-4px) rotate(6deg)}}" +
    ".kimu[aria-pressed=true]{box-shadow:0 0 0 3px rgba(242,193,78,.55),0 0 18px rgba(242,193,78,.45)}" +
    ".kimu:focus-visible{outline:3px solid #f2c14e;outline-offset:2px}" +
    /* schwebend oben rechts, falls kein Platz in der Kopfzeile angegeben ist */
    ".kimu.kimu-fest{position:fixed;top:calc(12px + env(safe-area-inset-top,0px));right:calc(12px + env(safe-area-inset-right,0px));z-index:39}" +
    ".kimu.kimu-eigen{background:rgba(20,26,64,.62);color:#ffe7a6;border:1.5px solid rgba(242,193,78,.6);box-shadow:0 4px 14px rgba(0,0,0,.28);" +
    "-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}" +
    ".kimu.kimu-eigen[aria-pressed=true]{background:rgba(242,193,78,.92);color:#3a2a05;border-color:#f2c14e;box-shadow:0 0 0 3px rgba(242,193,78,.35),0 4px 16px rgba(242,193,78,.45)}" +
    (C.css || "");

  function los() {
    d.head.appendChild(css); d.body.appendChild(a);
    var ort = null; try { ort = C.ort ? d.querySelector(C.ort) : null; } catch (e) {}
    if (ort) ort.insertBefore(knopf, ort.firstChild);
    else { knopf.className += " kimu-fest"; d.body.appendChild(knopf); }
    if (!C.wie) knopf.className += " kimu-eigen";
    an = gemerkt(); zeige();
    if (an) warteAufGeste();
    if (C.stumm || C.ausWenn || SCHLAF || window.MS_HOEREN) { wache(); setInterval(wache, 1000); }
  }
  window.KinderMusik = { an: function () { return an; }, aus: function () { aus(true); }, still: still, laeuft: function () { return !a.paused; } };
  if (d.body) los(); else d.addEventListener("DOMContentLoaded", los);
})();
