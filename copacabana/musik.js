/* musik.js – leise Hintergrundmusik fürs Lädeli (eigene Musik «Karibik», Carmencitas Groove).
   Kleiner Notenknopf oben rechts. Aus bis zum ersten Antippen; nie Autoplay ohne Geste (iOS).
   Gemerkt in localStorage: war sie «an», startet sie bei der ersten Berührung der Seite.
   Pausiert, wenn die Seite verborgen ist oder ein Mikrofon (Nova, Lernen) läuft.
   <audio playsinline loop>, damit sie mit ton-ios.js (audioSession 'playback') auch bei Stumm-Schalter klingt. */
(function () {
  "use strict";
  if (window.__copaMusik) return; window.__copaMusik = true;
  var d = document, KEY = "copa-musik", ZIEL = 0.35, EIN = 1500, AUS = 900;

  function merk(v) { try { localStorage.setItem(KEY, v ? "an" : "aus"); } catch (e) {} }
  function gemerkt() { try { return localStorage.getItem(KEY) === "an"; } catch (e) { return false; } }

  var a = d.createElement("audio");
  a.setAttribute("playsinline", ""); a.setAttribute("webkit-playsinline", "");
  a.loop = true; a.preload = "none"; a.src = "musik/karibik.m4a";
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
    } catch (e) { gain = null; }
  }
  var pegel = 0;
  function setze(v) {
    pegel = v;
    if (gain) { try { gain.gain.value = v; } catch (e) {} } else { try { a.volume = v; } catch (e) {} }
  }

  var an = false, grund = {}, timer = 0;
  function blockiert() { for (var k in grund) if (grund[k]) return true; return false; }
  function rampe(ziel, dauer, fertig) {
    clearInterval(timer);
    var start = pegel, t0 = Date.now();
    timer = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / dauer);
      setze(start + (ziel - start) * p);
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
    rampe(ZIEL, EIN);
  }
  function halt(sofort) {
    if (sofort) { clearInterval(timer); setze(0); a.pause(); return; }
    rampe(0, AUS, function () { if (!an || blockiert()) a.pause(); });
  }

  /* Knopf */
  var NOTE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>';
  var knopf = d.createElement("button");
  knopf.type = "button"; knopf.className = "copa-musik"; knopf.innerHTML = NOTE + '<span class="copa-musik-wellen" aria-hidden="true"><i></i><i></i><i></i></span>';
  function zeige() {
    knopf.setAttribute("aria-pressed", an ? "true" : "false");
    knopf.setAttribute("aria-label", an ? "Musik ausschalten" : "Musik einschalten");
    knopf.title = an ? "Musik aus" : "Musik an";
  }
  knopf.addEventListener("click", function () {
    an = !an; merk(an); zeige(); wegGeste();
    if (an) spiel(); else halt(false);
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
  d.addEventListener("visibilitychange", function () {
    grund.versteckt = d.hidden;
    if (d.hidden) halt(true); else spiel();
  });

  /* Mikrofon: während Aufnahme still (Hooks wie ton-ios.js, nur zusätzlich) */
  var mic = 0;
  function micAn() { mic++; grund.mic = true; halt(true); }
  function micAus() { mic = Math.max(0, mic - 1); if (!mic) { grund.mic = false; setTimeout(spiel, 300); } }
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
      var K = window[n]; if (!K || !K.prototype || K.prototype.__copaMusik) return;
      var st = K.prototype.start; K.prototype.__copaMusik = true;
      K.prototype.start = function () {
        var self = this, aus = false;
        function ende() { if (aus) return; aus = true; self.removeEventListener("end", ende); micAus(); }
        micAn(); self.addEventListener("end", ende);
        try { return st.apply(this, arguments); } catch (e) { ende(); throw e; }
      };
    });
  } catch (e) {}

  /* Aussehen: rund, dezent, oben rechts (unten sind Korb, Nova und Lernen) */
  var css = d.createElement("style");
  css.textContent =
    ".copa-musik{position:fixed;top:calc(12px + env(safe-area-inset-top,0px));right:max(16px,env(safe-area-inset-right,0px));z-index:19;" +
    "width:44px;height:44px;border-radius:50%;display:grid;place-items:center;padding:0;cursor:pointer;" +
    "background:color-mix(in srgb,var(--nacht2,#2a1f5c) 78%,transparent);color:var(--text,#fdf6ea);" +
    "border:1px solid color-mix(in srgb,var(--gold,#f2b84b) 55%,transparent);box-shadow:0 4px 14px rgba(40,28,36,.16);" +
    "-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:.82}" +
    ".copa-musik:hover{opacity:1}" +
    ".copa-musik[aria-pressed=true]{background:var(--gold,#f2b84b);color:#2a1d00;border-color:var(--gold,#f2b84b);opacity:1}" +
    ".copa-musik svg{grid-area:1/1}" +
    ".copa-musik-wellen{grid-area:1/1;align-self:end;margin-bottom:5px;display:none;gap:2px;height:6px;align-items:end}" +
    ".copa-musik[aria-pressed=true] .copa-musik-wellen{display:flex}" +
    ".copa-musik-wellen i{display:block;width:2px;height:3px;border-radius:1px;background:currentColor;opacity:.7}" +
    "@media (prefers-reduced-motion:no-preference){" +
    ".copa-musik[aria-pressed=true] .copa-musik-wellen i{animation:copaWelle .9s ease-in-out infinite alternate}" +
    ".copa-musik-wellen i:nth-child(2){animation-delay:.3s!important}.copa-musik-wellen i:nth-child(3){animation-delay:.6s!important}}" +
    "@keyframes copaWelle{to{height:6px}}" +
    ".copa-musik[aria-pressed=true] svg{transform:translateY(-3px) scale(.86)}";

  function los() {
    d.head.appendChild(css); d.body.appendChild(a); d.body.appendChild(knopf);
    an = gemerkt(); zeige();
    if (an) warteAufGeste();
  }
  if (d.body) los(); else d.addEventListener("DOMContentLoaded", los);
})();
