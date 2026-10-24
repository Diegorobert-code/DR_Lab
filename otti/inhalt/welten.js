/* welten.js – «Zauberwald-Tore»: Im Zauberwald stehen Tore. Ein Tor geht auf, die Kamera fliegt hinein,
   und in der Welt dahinter spielt die Geschichte. Pro Welt Starter-Geschichten, Plätze «Bald: eure Geschichte»
   und «Erfinden mit Mila» (Held, Welt, Problem, Freund, Lösung → lesbare Geschichtenkarte).
   Gespeichert wird nur auf diesem Handy (localStorage «welten_<app>»): eigene Geschichten und Weltenpass-Stempel.
   Einbinden: <script src="inhalt/welten-daten.js" defer></script><script src="inhalt/welten.js" data-app="mondschein" defer></script>
   Öffnen: jedes Element mit [data-welten] (Wert = Welt-ID, leer = Zauberwald). [data-welten-heute] zeigt das Tor des Tages.
   Vorlesen und Bilder kommen von der App: window.WELTEN_CFG = { bilder: {otti:'…jpg'}, sprechen(t, fertig), stopp(), stern() }. */
(function () {
  'use strict';
  if (window.Welten) return;
  var d = document, me = d.currentScript;
  var APP = (me && me.getAttribute('data-app')) || 'app';
  var KEY = 'welten_' + APP;
  var BASIS = me && me.src ? me.src.replace(/[^\/]*([?#].*)?$/, '') : 'inhalt/';
  var RUHIG = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function D() { return window.WELTEN || { FIGUREN: {}, WELTEN: [], ERFINDEN: { helden: [], freunde: [], loesungen: [] } }; }
  function CFG() { return window.WELTEN_CFG || {}; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hol() { try { var v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
  function leg(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function welt(id) { var w = D().WELTEN; for (var i = 0; i < w.length; i++) if (w[i].id === id) return w[i]; return null; }
  function fig(k) { return D().FIGUREN[k] || null; }
  function figName(k) { var f = fig(k); return f ? (f.kurz || f.n) : String(k || ''); }
  function heuteIndex() { var n = D().WELTEN.length || 1, t = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000); return ((t % n) + n) % n; }
  function heute() { return D().WELTEN[heuteIndex()]; }

  /* ---------------- Sprechen (von der App) ---------------- */
  function api() {
    var c = CFG(); if (c.sprechen) return c;
    var o = window.OTTI_API && window.OTTI_API.abenteuer;
    if (o && o.sprechen) return { sprechen: o.sprechen, stopp: o.stimmeStopp, stern: o.sternDazu };
    return {};
  }
  function sprich(t, fertig) { var a = api(); if (a.sprechen) { try { a.sprechen(t, fertig); return true; } catch (e) {} } return false; }
  function still() { var a = api(); if (a.stopp) try { a.stopp(); } catch (e) {} }

  /* ---------------- Kulissen (SVG) ---------------- */
  function reihe(seed) { var s = seed; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function sterne(n, seed, maxY) { var r = reihe(seed), o = ''; for (var i = 0; i < n; i++) o += '<circle class="wt-st" style="--v:' + (r() * 4).toFixed(1) + 's" cx="' + Math.round(r() * 400) + '" cy="' + Math.round(r() * maxY) + '" r="' + (r() * 1.4 + .5).toFixed(1) + '" fill="#fff6dc"/>'; return o; }
  function tanne(x, y, h, f) { var s = ''; for (var i = 0; i < 3; i++) { var t = y - h + i * h * .26, w = h * .42 * (.55 + i * .28); s += '<path d="M' + x + ' ' + t + 'L' + (x + w) + ' ' + (t + h * .42) + 'L' + (x - w) + ' ' + (t + h * .42) + 'Z" fill="' + f + '"/>'; } return s; }
  function kometli(x, y, s) {
    return '<g class="wt-schweb" transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-30 14 L-44 30 L-20 22Z M30 14 L44 30 L20 22Z" fill="#ff8fb1"/>' +
      '<ellipse cx="0" cy="6" rx="34" ry="28" fill="#e9eeff"/><ellipse cx="0" cy="12" rx="34" ry="14" fill="#c7d2f5"/><circle cx="0" cy="0" r="13" fill="#7fd4ff" stroke="#ffd27a" stroke-width="4"/>' +
      '<circle cx="-4" cy="-4" r="4" fill="#fff" opacity=".8"/><path d="M0 -22 v-8" stroke="#ffd27a" stroke-width="3"/><circle cx="0" cy="-33" r="5" fill="#ffd27a"/>' +
      '<path d="M-12 34 q12 18 24 0" fill="#ffd27a" opacity=".85" class="wt-flamme"/></g>';
  }
  var KUL = {
    wald: function () {
      return '<defs><linearGradient id="wtW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1f5e"/><stop offset=".6" stop-color="#241a55"/><stop offset="1" stop-color="#0d1a2e"/></linearGradient><radialGradient id="wtM"><stop offset="0" stop-color="#fff3c2"/><stop offset="1" stop-color="#fff3c2" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="400" height="700" fill="url(#wtW)"/>' + sterne(46, 7, 300) + '<circle cx="310" cy="96" r="70" fill="url(#wtM)"/><circle cx="310" cy="96" r="30" fill="#fff0b8"/>' +
        '<g opacity=".55">' + tanne(30, 470, 230, '#1d3a4a') + tanne(120, 440, 200, '#1a3343') + tanne(290, 450, 220, '#1d3a4a') + tanne(380, 470, 240, '#1a3343') + '</g>' +
        '<path d="M0 520 Q200 470 400 520 V700 H0Z" fill="#14324a"/><path d="M0 600 Q200 560 400 600 V700 H0Z" fill="#102838"/>' +
        [[60, 560], [150, 520], [250, 545], [340, 580], [90, 640], [300, 650], [200, 610]].map(function (p, i) { return '<circle class="wt-glueh" style="--v:' + (i * .6) + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="3.4" fill="#fff27a"/>'; }).join('');
    },
    weltraum: function () {
      return '<defs><radialGradient id="wtA" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#1c2a7a"/><stop offset="1" stop-color="#04061e"/></radialGradient></defs><rect width="400" height="700" fill="url(#wtA)"/>' + sterne(90, 3, 700) +
        '<g class="wt-dreh-langsam"><circle cx="300" cy="200" r="64" fill="#ff9a5c"/><circle cx="300" cy="200" r="64" fill="#9a5cff" opacity=".4"/><ellipse cx="300" cy="200" rx="104" ry="18" fill="none" stroke="#ffd27a" stroke-width="5" opacity=".7"/></g>' +
        '<circle cx="70" cy="560" r="120" fill="#e8e6f5"/><circle cx="40" cy="520" r="16" fill="#cfcbe6"/><circle cx="110" cy="600" r="22" fill="#cfcbe6"/><circle cx="150" cy="530" r="9" fill="#cfcbe6"/>' + kometli(170, 330, 1.25);
    },
    stadt: function () {
      var h = '', r = reihe(11);
      for (var i = 0; i < 9; i++) { var x = i * 46 - 6, hh = 140 + Math.round(r() * 170), c = ['#3a2f78', '#4a2f6e', '#2f3a7a'][i % 3]; h += '<rect x="' + x + '" y="' + (560 - hh) + '" width="42" height="' + (hh + 140) + '" rx="6" fill="' + c + '"/>';
        for (var j = 0; j < 6; j++) if (r() > .35) h += '<rect class="wt-fenster" style="--v:' + (r() * 5).toFixed(1) + 's" x="' + (x + 8 + (j % 2) * 16) + '" y="' + (560 - hh + 16 + Math.floor(j / 2) * 34) + '" width="10" height="14" rx="2" fill="#ffe27a"/>'; }
      return '<defs><linearGradient id="wtS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9fc4"/><stop offset=".45" stop-color="#8a6be0"/><stop offset="1" stop-color="#2a2160"/></linearGradient></defs><rect width="400" height="700" fill="url(#wtS)"/>' + sterne(20, 5, 200) +
        '<g opacity=".8" fill="none" stroke-width="10"><path d="M-20 420 Q200 120 420 420" stroke="#ff8fb1"/><path d="M-20 432 Q200 136 420 432" stroke="#ffd27a"/><path d="M-20 444 Q200 152 420 444" stroke="#9be37c"/><path d="M-20 456 Q200 168 420 456" stroke="#7fd4ff"/></g>' + h +
        '<g class="wt-schweb"><path d="M200 120 l10 22 24 3 -18 16 5 24 -21 -12 -21 12 5 -24 -18 -16 24 -3Z" fill="#fff3c2" opacity=".9"/></g>';
    },
    piraten: function () {
      return '<defs><linearGradient id="wtP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf8a"/><stop offset=".45" stop-color="#ff9f7a"/><stop offset=".46" stop-color="#2b7fb8"/><stop offset="1" stop-color="#123e6e"/></linearGradient></defs><rect width="400" height="700" fill="url(#wtP)"/>' +
        '<circle cx="90" cy="230" r="48" fill="#fff0b8" opacity=".9"/><path d="M250 330 Q300 280 360 330Z" fill="#e8c27a"/><path d="M305 320 q-6 -60 -20 -90 M305 320 q10 -50 30 -80" stroke="#6b4a2c" stroke-width="6" fill="none"/>' +
        '<g fill="#3fae6b"><ellipse cx="282" cy="232" rx="28" ry="10" transform="rotate(-25 282 232)"/><ellipse cx="338" cy="242" rx="28" ry="10" transform="rotate(25 338 242)"/></g>' +
        '<g class="wt-schaukel"><path d="M110 430 h150 l-22 36 h-106Z" fill="#8a5a32"/><rect x="180" y="300" width="6" height="130" fill="#6b4a2c"/><path d="M186 306 q60 40 0 110Z" fill="#fff6e0"/><path d="M186 306 q60 40 0 110" fill="none" stroke="#ff8fb1" stroke-width="4" stroke-dasharray="10 10"/><path d="M180 300 l-30 12 30 10Z" fill="#ffd27a"/></g>' +
        [0, 1, 2, 3].map(function (i) { return '<path class="wt-welle" style="--v:' + (i * .7) + 's" d="M-40 ' + (480 + i * 55) + ' q25 -14 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#bfeaff" stroke-width="3" opacity=".5"/>'; }).join('');
    },
    meer: function () {
      return '<defs><linearGradient id="wtU" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fc1d9"/><stop offset=".5" stop-color="#1a6fa3"/><stop offset="1" stop-color="#0b2f5e"/></linearGradient></defs><rect width="400" height="700" fill="url(#wtU)"/>' +
        '<g opacity=".18" fill="#fff"><path d="M60 0 L110 0 L60 500 L20 500Z"/><path d="M220 0 L260 0 L240 520 L200 520Z"/><path d="M330 0 L370 0 L380 460 L345 460Z"/></g>' +
        '<path d="M0 600 Q200 560 400 600 V700 H0Z" fill="#e8c88f"/>' +
        '<g fill="#ff8fb1"><path d="M60 600 q-10 -60 0 -90 q10 30 0 90 M60 560 q20 -30 30 -20 M60 545 q-25 -20 -30 -10" stroke="#ff8fb1" stroke-width="8" fill="none" stroke-linecap="round"/></g>' +
        '<g stroke="#ffd27a" stroke-width="9" fill="none" stroke-linecap="round"><path d="M320 600 q0 -70 -10 -100 M320 560 q20 -20 26 -40"/></g><g stroke="#9be37c" stroke-width="6" fill="none" stroke-linecap="round" class="wt-seegras"><path d="M170 600 q-14 -40 0 -80 q14 -40 0 -80"/><path d="M200 600 q14 -40 0 -70 q-14 -30 0 -60"/></g>' +
        [[80, 400], [130, 300], [290, 350], [340, 220], [240, 470]].map(function (p, i) { return '<circle class="wt-blase" style="--v:' + (i * .9) + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (5 + i % 3 * 3) + '" fill="none" stroke="#e8fbff" stroke-width="2"/>'; }).join('');
    },
    dino: function () {
      return '<defs><linearGradient id="wtD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a0"/><stop offset=".5" stop-color="#b8e3a0"/><stop offset="1" stop-color="#3c7a4a"/></linearGradient></defs><rect width="400" height="700" fill="url(#wtD)"/>' +
        '<circle cx="300" cy="150" r="50" fill="#fff3c2" opacity=".85"/><path d="M0 420 Q100 330 200 400 T400 380 V700 H0Z" fill="#7cc576"/><path d="M0 520 Q120 470 240 520 T400 500 V700 H0Z" fill="#5aa860"/>' +
        '<g class="wt-wiegen" fill="#2f7a45">' + [40, 360].map(function (x) { return '<path d="M' + x + ' 700 q-10 -160 0 -300 q-40 40 -70 30 q40 -20 70 -60 q-50 0 -80 -20 q50 -10 80 10 q-30 -40 -30 -80 q30 30 30 60"/>'; }).join('') + '</g>' +
        '<g class="wt-schweb"><ellipse cx="210" cy="470" rx="54" ry="34" fill="#8fd4a8"/><path d="M240 455 q30 -70 40 -120" stroke="#8fd4a8" stroke-width="22" stroke-linecap="round" fill="none"/><ellipse cx="288" cy="330" rx="20" ry="14" fill="#8fd4a8"/><circle cx="294" cy="326" r="3.5" fill="#1d2a4f"/><path d="M286 338 q6 4 12 0" stroke="#1d2a4f" stroke-width="2" fill="none"/>' +
        '<rect x="176" y="490" width="14" height="30" rx="7" fill="#7cc496"/><rect x="226" y="490" width="14" height="30" rx="7" fill="#7cc496"/><path d="M156 470 q-30 10 -40 -10" stroke="#8fd4a8" stroke-width="14" stroke-linecap="round" fill="none"/>' +
        '<circle cx="200" cy="455" r="5" fill="#ffd27a"/><circle cx="222" cy="448" r="4" fill="#ffd27a"/></g>';
    },
    schloss: function () {
      function wolke(x, y, s, o) { return '<g opacity="' + o + '" transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse cx="0" cy="0" rx="70" ry="26" fill="#fff"/><circle cx="-24" cy="-14" r="24" fill="#fff"/><circle cx="16" cy="-22" r="30" fill="#fff"/></g>'; }
      return '<defs><linearGradient id="wtK" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a6be0"/><stop offset=".55" stop-color="#d9a8f0"/><stop offset="1" stop-color="#ffe0ef"/></linearGradient></defs><rect width="400" height="700" fill="url(#wtK)"/>' + sterne(24, 9, 240) +
        '<g class="wt-schweb"><rect x="140" y="230" width="120" height="150" rx="8" fill="#fff0f6"/><rect x="110" y="200" width="44" height="180" rx="6" fill="#ffd1e6"/><rect x="246" y="200" width="44" height="180" rx="6" fill="#ffd1e6"/>' +
        '<path d="M106 204 L132 150 L158 204Z M242 204 L268 150 L294 204Z M150 234 L200 160 L250 234Z" fill="#b484ff"/><path d="M182 380 v-46 a18 18 0 0 1 36 0 v46Z" fill="#8a6be0"/>' +
        '<circle class="wt-fenster" cx="132" cy="250" r="8" fill="#ffe27a"/><circle class="wt-fenster" style="--v:1.5s" cx="268" cy="250" r="8" fill="#ffe27a"/><circle class="wt-fenster" style="--v:2.5s" cx="200" cy="280" r="10" fill="#ffe27a"/>' +
        '<path d="M132 150 v-24 l18 7 -18 7" fill="#ff8fb1" stroke="#fff" stroke-width="2"/></g>' +
        wolke(200, 400, 2.2, .95) + wolke(60, 470, 1.4, .85) + wolke(340, 480, 1.5, .85) + wolke(200, 560, 2.6, .9) + wolke(80, 640, 1.6, .8);
    }
  };
  /* Gemaltes Bild (inhalt/bilder/<w.bild>) liegt über der gebauten Szene, sobald es eingetragen ist. */
  function hinten(w) { return kulisse(w.bg) + (w.bild ? '<img class="wt-bgbild" src="' + esc(BASIS + 'bilder/' + w.bild) + '" alt="">' : ''); }
  function kulisse(bg) { return '<svg class="wt-kulisse" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + (KUL[bg] || KUL.wald)() + '</svg>'; }

  /* ---------------- Figuren ---------------- */
  function figur(k, gross) {
    var f = fig(k), bild = (CFG().bilder || {})[k];
    var name = f ? f.n : k;
    var innen = bild ? '<img src="' + esc(bild) + '" alt="" loading="lazy">' : '<span aria-hidden="true">' + (f ? f.e : '⭐') + '</span>';
    return '<span class="wt-fig' + (gross ? ' gross' : '') + '" role="img" aria-label="' + esc(name) + '">' + innen + '</span>';
  }

  /* ---------------- Fenster ---------------- */
  var root, ansicht, zustand = { welt: null, story: null, seite: 0, seq: [], vorlesen: false, wahl: {} };
  function bauRoot() {
    if (root) return root;
    root = d.createElement('div'); root.className = 'wt'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Zauberwald-Tore');
    root.innerHTML = '<div class="wt-ansicht"></div>';
    d.body.appendChild(root); ansicht = root.firstChild;
    root.addEventListener('click', klick);
    d.addEventListener('keydown', function (e) { if (root.hidden) return; if (e.key === 'Escape') zurueck(); if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-wt-in]')) waehle(e.target.getAttribute('data-wt-in'), e.target.value); });
    return root;
  }
  function oeffnen(weltId, storyId) {
    bauRoot(); root.hidden = false; d.documentElement.classList.add('wt-offen');
    if (weltId && welt(weltId)) { zeigWald(); setTimeout(function () { reinfliegen(weltId, storyId); }, RUHIG ? 0 : 260); }
    else zeigWald();
  }
  function schliessen() { still(); zustand.vorlesen = false; if (root) root.hidden = true; d.documentElement.classList.remove('wt-offen'); markHeute(); }
  function zurueck() {
    still(); zustand.vorlesen = false;
    var a = root && root.getAttribute('data-ansicht');
    if (a === 'erfinden' && entwurf.schritt > 0) { entwurf.schritt--; formular(); }
    else if (a === 'erfinden' && entwurf.von === 'wald') zeigWald();
    else if (a === 'lesen' || a === 'erfinden') zeigWelt(zustand.welt.id);
    else if (a === 'welt') rausfliegen();
    else schliessen();
  }
  function kopf(titel, rechts) {
    return '<div class="wt-kopf"><button type="button" class="wt-rund" data-wt="zurueck" aria-label="Zurück">←</button><h2>' + esc(titel) + '</h2>' + (rechts || '<span class="wt-platz"></span>') + '</div>';
  }

  /* ---- Zauberwald mit Tor-Menü ---- */
  function torHTML(w, i) {
    var h = heute(), pass = (hol().pass || {})[w.id] || [];
    return '<button type="button" class="wt-tor' + (h && h.id === w.id ? ' heute' : '') + '" data-wt-tor="' + w.id + '" style="--c:' + w.farbe + ';--i:' + i + '">' +
      '<span class="wt-bogen"><span class="wt-blick">' + kulisse(w.bg) + '</span><span class="wt-tor-e" aria-hidden="true">' + w.e + '</span>' + (pass.length ? '<span class="wt-stempel" aria-hidden="true">✓</span>' : '') + '</span>' +
      '<b>' + esc(w.tor) + '</b><small>' + esc(w.name) + '</small>' + (h && h.id === w.id ? '<em>Heute offen</em>' : '') + '</button>';
  }
  function zeigWald() {
    still(); root.setAttribute('data-ansicht', 'wald'); zustand.welt = null;
    var ws = D().WELTEN, pass = hol().pass || {}, n = 0; ws.forEach(function (w) { if ((pass[w.id] || []).length) n++; });
    ansicht.className = 'wt-ansicht wt-wald';
    ansicht.innerHTML = '<div class="wt-bg">' + kulisse('wald') + '</div>' +
      kopf('Zauberwald') +
      '<div class="wt-scroll">' + tippHTML() + profilHTML() + '<p class="wt-intro">Im Zauberwald stehen Tore. Tipp ein Tor an, und es geht auf.</p>' +
      '<div class="wt-tore">' + ws.map(torHTML).join('') + '</div>' +
      '<div class="wt-pass" aria-label="Weltenpass: ' + n + ' von ' + ws.length + ' Welten besucht"><b>Weltenpass</b><span>' +
      ws.map(function (w) { return '<i class="' + ((pass[w.id] || []).length ? 'an' : '') + '" title="' + esc(w.name) + '">' + w.e + '</i>'; }).join('') + '</span><small>' + n + ' von ' + ws.length + ' Welten</small></div>' +
      '<button type="button" class="wt-gross-knopf" data-wt="erfinden">✏️ Erfinden mit Mila<small>Eure eigene Geschichte für eine Welt</small></button></div>';
    var b = ansicht.querySelector('[data-wt="zurueck"]'); if (b) b.focus({ preventScroll: true });
  }

  /* ---- Lernt mit: Lieblinge und Vorschlag «Weil du … mochtest» ---- */
  function alle() { var o = []; D().WELTEN.forEach(function (w) { w.geschichten.forEach(function (g) { o.push({ w: w, g: g }); }); }); return o; }
  function finde(id) { var a = alle(); for (var i = 0; i < a.length; i++) if (a[i].g.id === id) return a[i]; return null; }
  function gehoert(id) { var p = hol().pass || {}; for (var k in p) if (p[k].indexOf(id) >= 0) return true; return false; }
  function magToggle(id) { var v = hol(), m = v.mag = v.mag || [], i = m.indexOf(id); if (i >= 0) m.splice(i, 1); else m.unshift(id); leg(v); return i < 0; }
  function empfehlung() {
    var v = hol(), basis = null, grund = '';
    if ((v.mag || []).length && finde(v.mag[0])) { basis = finde(v.mag[0]); grund = 'Weil du «' + basis.g.titel + '» mochtest'; }
    else if (v.zuletzt && finde(v.zuletzt)) { basis = finde(v.zuletzt); grund = 'Weil du «' + basis.g.titel + '» gehört hast'; }
    var neu = alle().filter(function (x) { return !gehoert(x.g.id); });
    var tipp = (basis && neu.filter(function (x) { return x.w.id === basis.w.id; })[0]) || null;
    if (!tipp && basis) tipp = neu.filter(function (x) { return x.g.cast.some(function (c) { return basis.g.cast.indexOf(c) >= 0; }); })[0] || null;
    var lw = profil().lieblingsWelt; if (!tipp && lw) { tipp = neu.filter(function (x) { return x.w.id === lw.id; })[0] || null; if (tipp && !basis) grund = 'Deine Lieblingswelt: ' + lw.name; }
    if (!tipp) { var h = heute(); tipp = neu.filter(function (x) { return x.w.id === h.id; })[0] || neu[0] || null; if (!basis) grund = 'Heute offen: ' + h.tor; else if (tipp) grund = grund + ': etwas Neues'; }
    if (!tipp && basis) { tipp = basis; grund = 'Deine Lieblingsgeschichte'; }
    return tipp ? { w: tipp.w, g: tipp.g, grund: grund } : null;
  }
  /* Lern-Profil (nur auf diesem Handy): Stempel, eigene Geschichten und «Mag ich» ergeben die Stufe.
     Stufe 1: Mila fragt weniger (ohne «Wer hilft?», Otti hilft). Vorschläge kommen zuerst aus der Lieblingswelt. */
  var STUFEN = [[0, 'Neu im Wald', '🌱'], [2, 'Torfinderin', '🗝️'], [5, 'Weltenreisende', '🧭'], [9, 'Geschichtenheldin', '⭐'], [14, 'Zauberwald-Meisterin', '👑']];
  function profil() {
    var v = hol(), p = v.pass || {}, n = 0, best = null, bestN = 0;
    for (var k in p) { n += p[k].length; if (p[k].length > bestN) { bestN = p[k].length; best = k; } }
    var m = (v.mag || []).map(finde).filter(Boolean); if (m.length) best = m[0].w.id;
    var pk = n + 2 * (v.eigene || []).length + (v.mag || []).length, i = 0;
    while (i < STUFEN.length - 1 && pk >= STUFEN[i + 1][0]) i++;
    return { punkte: pk, stufe: i + 1, name: STUFEN[i][1], e: STUFEN[i][2], bis: i < STUFEN.length - 1 ? STUFEN[i + 1][0] - pk : 0, naechsteName: i < STUFEN.length - 1 ? STUFEN[i + 1][1] : '', lieblingsWelt: best ? welt(best) : null, geschichten: n };
  }
  function profilHTML() {
    var pf = profil();
    return '<p class="wt-profil"><span aria-hidden="true">' + pf.e + '</span> Stufe ' + pf.stufe + ' · ' + esc(pf.name) + (pf.bis ? '<small>Noch ' + pf.bis + ' bis «' + esc(pf.naechsteName) + '»</small>' : '') + '</p>';
  }
  function tippHTML() {
    var t = empfehlung(); if (!t) return '';
    return '<button type="button" class="wt-fuerdich" data-wt-tipp="' + t.w.id + '/' + t.g.id + '" style="--c:' + t.w.farbe + '"><span class="wt-cast">' + t.g.cast.slice(0, 2).map(function (k) { return figur(k); }).join('') + '</span>' +
      '<span class="wt-karte-tx"><small>' + esc(t.grund) + '</small><b>▶ ' + esc(t.g.titel) + '</b><small>' + t.w.e + ' ' + esc(t.w.name) + '</small></span></button>';
  }

  /* ---- Flug durchs Tor ---- */
  function reinfliegen(id, storyId) {
    var w = welt(id); if (!w) return;
    var nachher = function () { if (!storyId) return; w.geschichten.forEach(function (g) { if (g.id === storyId) lies(g); }); };
    var tor = ansicht.querySelector('[data-wt-tor="' + id + '"] .wt-blick');
    if (RUHIG || !tor || !tor.animate) { zeigWelt(id, true); nachher(); return; }
    var r = tor.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    var flug = d.createElement('div'); flug.className = 'wt-flug'; flug.innerHTML = kulisse(w.bg); root.appendChild(flug);
    var sx = r.width / vw, sy = r.height / vh, tx = r.left + r.width / 2 - vw / 2, ty = r.top + r.height / 2 - vh / 2;
    tor.parentNode.classList.add('auf');
    var wald = ansicht;
    wald.style.transformOrigin = (r.left + r.width / 2) + 'px ' + (r.top + r.height / 2) + 'px';
    wald.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.6)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
    var a = flug.animate([
      { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(' + sx + ',' + sy + ')', borderRadius: '45% 45% 12px 12px' },
      { transform: 'translate(0,0) scale(1)', borderRadius: '0' }
    ], { duration: 900, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
    a.onfinish = function () { wald.getAnimations().forEach(function (x) { x.cancel(); }); wald.style.transformOrigin = ''; zeigWelt(id, true); nachher(); flug.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = function () { flug.remove(); }; };
  }
  function rausfliegen() {
    if (RUHIG || !ansicht.animate) { zeigWald(); return; }
    ansicht.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.6)', opacity: 0 }], { duration: 380, easing: 'ease-in' }).onfinish = function () {
      zeigWald(); ansicht.animate([{ transform: 'scale(1.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 420, easing: 'ease-out' });
    };
  }

  /* ---- Eine Welt ---- */
  function eigene(weltId) { return (hol().eigene || []).filter(function (g) { return !weltId || g.welt === weltId; }); }
  function zeigWelt(id, frisch) {
    var w = welt(id); if (!w) return zeigWald();
    still(); zustand.welt = w; root.setAttribute('data-ansicht', 'welt');
    var pass = (hol().pass || {})[w.id] || [], mine = eigene(w.id), frei = Math.max(1, 3 - mine.length);
    ansicht.className = 'wt-ansicht wt-welt' + (frisch ? ' frisch' : '');
    ansicht.style.setProperty('--c', w.farbe);
    var karten = w.geschichten.map(function (g) {
      return '<button type="button" class="wt-karte" data-wt-story="' + g.id + '"><span class="wt-cast">' + g.cast.slice(0, 3).map(function (k) { return figur(k); }).join('') + '</span>' +
        '<span class="wt-karte-tx"><b>' + esc(g.titel) + (pass.indexOf(g.id) >= 0 ? ' <i class="wt-gehoert" title="schon gehört">★</i>' : '') + '</b><small>' + esc(g.kurz) + '</small></span></button>';
    }).join('') + mine.map(function (g) {
      return '<button type="button" class="wt-karte eigen" data-wt-eigen="' + esc(g.id) + '"><span class="wt-cast">' + figur(g.held) + figur(g.freund) + '</span>' +
        '<span class="wt-karte-tx"><b>' + esc(g.titel) + '</b><small>✏️ Erfunden von euch · ' + esc(g.datum || '') + '</small></span></button>';
    }).join('');
    var slots = ''; for (var i = 0; i < frei; i++) slots += '<button type="button" class="wt-slot" data-wt="erfinden"><span aria-hidden="true">✨</span><b>Bald: eure Geschichte</b><small>Dieser Platz wartet auf eure Idee. Tippt hier und erfindet sie mit Mila.</small></button>';
    ansicht.innerHTML = '<div class="wt-bg">' + hinten(w) + '</div>' + kopf(w.name) +
      '<div class="wt-scroll"><div class="wt-weltkopf"><span class="wt-welt-e" aria-hidden="true">' + w.e + '</span><p>' + esc(w.kurz) + '</p></div>' +
      '<div class="wt-liste">' + karten + slots + '</div></div>';
  }

  /* ---- Lesen ---- */
  function seq(g) {
    var s = []; g.seiten.forEach(function (p, i) { if (typeof p === 'string') s.push({ t: p }); else { s.push({ frage: p.frage, wahl: p.wahl, nr: i }); s.push({ nach: i }); } });
    s.push({ ende: true }); return s;
  }
  function lies(g, eigen) {
    zustand.story = g; zustand.eigen = !!eigen; zustand.seq = seq(g); zustand.seite = 0; zustand.wahl = {};
    root.setAttribute('data-ansicht', 'lesen');
    ansicht.className = 'wt-ansicht wt-lesen';
    var w = zustand.welt;
    ansicht.innerHTML = '<div class="wt-bg">' + hinten(w) + '</div>' +
      kopf(g.titel, api().sprechen ? '<button type="button" class="wt-rund" data-wt="vorlesen" aria-label="Vorlesen" aria-pressed="false">🔊</button>' : '') +
      '<div class="wt-buehne">' + g.cast.map(function (k, i) { return '<span style="--i:' + i + '">' + figur(k, true) + '</span>'; }).join('') + '</div>' +
      '<div class="wt-text"><div class="wt-seite" aria-live="polite"></div><div class="wt-nav"><button type="button" class="wt-rund" data-wt="vor" aria-label="Vorherige Seite">◀</button><span class="wt-punkte"></span><button type="button" class="wt-rund primaer" data-wt="weiter" aria-label="Nächste Seite">▶</button></div></div>';
    seite();
  }
  function seitenText(p) {
    if (p.t) return p.t;
    if (p.nach != null) { var c = zustand.wahl[p.nach]; return c ? c.t : ''; }
    return '';
  }
  function seite() {
    var s = zustand.seq, i = zustand.seite, p = s[i], box = ansicht.querySelector('.wt-seite'), g = zustand.story;
    if (!box) return;
    box.classList.remove('neu'); void box.offsetWidth; box.classList.add('neu');
    if (p.ende) {
      var w = zustand.welt, neuStempel = merkGehoert(w.id, g.id);
      box.innerHTML = '<div class="wt-ende"><span class="wt-stempel-gross' + (neuStempel ? ' neu' : '') + '" aria-hidden="true">' + w.e + '</span><h3>Ende</h3>' +
        (g.lehre ? '<p>' + esc(g.lehre) + '</p>' : '') + '<p class="wt-klein">' + (neuStempel ? 'Neuer Stempel im Weltenpass: ' + esc(w.name) + '!' : 'Stempel für ' + esc(w.name) + ' ist schon im Weltenpass.') + '</p>' +
        '<div class="wt-reihe"><button type="button" class="wt-knopf" data-wt="nochmal">↺ Nochmal</button><button type="button" class="wt-knopf primaer" data-wt="welt">' + w.e + ' Mehr aus ' + esc(w.name) + '</button></div>' +
        (zustand.eigen ? '' : (function () { var m = (hol().mag || []).indexOf(g.id) >= 0; return '<button type="button" class="wt-mag" data-wt="mag" aria-pressed="' + m + '">' + (m ? '❤️ Lieblingsgeschichte' : '🤍 Mag ich') + '</button>'; })()) +
        (zustand.eigen ? '<button type="button" class="wt-link" data-wt="loeschen">Diese Geschichte löschen</button>' : '') + '</div>';
      if (neuStempel) { var a = api(); if (a.stern) try { a.stern(); } catch (e) {} }
    } else if (p.frage) {
      var c = zustand.wahl[p.nr];
      box.innerHTML = '<p class="wt-frage">' + esc(p.frage) + '</p><div class="wt-wahl">' + p.wahl.map(function (o, j) {
        return '<button type="button" class="wt-opt' + (c === o ? ' sel' : '') + '" data-wt-wahl="' + j + '"><span aria-hidden="true">' + o.e + '</span>' + esc(o.l) + '</button>'; }).join('') + '</div>';
    } else box.innerHTML = '<p>' + esc(seitenText(p)) + '</p>';
    var gesamt = s.length - 1;
    ansicht.querySelector('.wt-punkte').innerHTML = p.ende ? '' : '<span>' + (i + 1) + ' / ' + gesamt + '</span><i style="width:' + Math.round((i + 1) / gesamt * 100) + '%"></i>';
    ansicht.querySelector('[data-wt="vor"]').disabled = i === 0;
    var wb = ansicht.querySelector('[data-wt="weiter"]'); wb.hidden = !!p.ende; wb.disabled = !!(p.frage && !zustand.wahl[p.nr]);
    if (zustand.vorlesen) vorlesenSeite();
  }
  function vorlesenSeite() {
    var p = zustand.seq[zustand.seite], t = p.ende ? 'Ende. ' + (zustand.story.lehre || '') : p.frage ? p.frage + ' ' + p.wahl.map(function (o) { return o.l; }).join(', oder ') + '?' : seitenText(p);
    var nr = zustand.seite;
    sprich(t, function () {
      if (!zustand.vorlesen || zustand.seite !== nr || root.getAttribute('data-ansicht') !== 'lesen') return;
      if (p.frage || p.ende) return;
      setTimeout(function () { if (zustand.vorlesen && zustand.seite === nr) blaettern(1); }, 1200);
    });
  }
  function blaettern(r) {
    var n = zustand.seite + r; if (n < 0 || n >= zustand.seq.length) return;
    var p = zustand.seq[zustand.seite]; if (r > 0 && p.frage && !zustand.wahl[p.nr]) return;
    still(); zustand.seite = n; seite();
  }
  function merkGehoert(wid, sid) {
    var v = hol(); v.zuletzt = sid; v.pass = v.pass || {}; var l = v.pass[wid] = v.pass[wid] || [];
    var neuWelt = l.length === 0; if (l.indexOf(sid) < 0) l.push(sid); leg(v); return neuWelt;
  }

  /* ---- Erfinden mit Mila: eine Frage pro Bildschirm, ein Tipp und weiter ---- */
  var entwurf = {}, SCHRITTE = [];
  var FRAGEN = { held: 'Wer ist der Held?', welt: 'Wohin geht die Reise?', problem: 'Was ist passiert?', freund: 'Wer hilft?', loesung: 'Wie klappt es?' };
  function optionen(k) {
    var E = D().ERFINDEN, w = welt(entwurf.welt);
    if (k === 'welt') return D().WELTEN.map(function (x) { return { w: x.id, t: x.e + ' ' + x.name }; });
    var l = k === 'held' ? E.helden : k === 'freund' ? E.freunde : k === 'problem' ? w.probleme : E.loesungen;
    return l.map(function (x) { var f = fig(x); return { w: x, t: f ? f.e + ' ' + (f.kurz || f.n) : gross(x) }; });
  }
  function zeigErfinden(von) {
    still(); root.setAttribute('data-ansicht', 'erfinden');
    var ausWelt = von === 'welt' && zustand.welt;
    if (!zustand.welt) zustand.welt = heute();
    entwurf = { welt: zustand.welt.id, von: ausWelt ? 'welt' : 'wald', schritt: 0 };
    SCHRITTE = ausWelt ? ['held', 'problem', 'freund', 'loesung'] : ['held', 'welt', 'problem', 'freund', 'loesung'];
    if (profil().stufe <= 1) { SCHRITTE = SCHRITTE.filter(function (k) { return k !== 'freund'; }); entwurf.freund = 'otti'; }
    ansicht.className = 'wt-ansicht wt-erfinden';
    ansicht.innerHTML = '<div class="wt-bg">' + kulisse(zustand.welt.bg) + '</div>' + kopf('Erfinden mit Mila') + '<div class="wt-scroll"><div class="wt-form"></div></div>';
    formular();
  }
  function formular() {
    var box = ansicht.querySelector('.wt-form'), i = entwurf.schritt, k = SCHRITTE[i];
    box.innerHTML = '<div class="wt-schritte" aria-label="Frage ' + (i + 1) + ' von ' + SCHRITTE.length + '">' + SCHRITTE.map(function (_, j) { return '<i class="' + (j < i ? 'ok' : j === i ? 'jetzt' : '') + '"></i>'; }).join('') + '</div>' +
      '<h3 class="wt-frage-gross">' + esc(FRAGEN[k]) + '</h3>' +
      '<div class="wt-gross-chips">' + optionen(k).map(function (o) { return '<button type="button" class="wt-chip gross" data-wt-chip="' + k + '" data-wert="' + esc(o.w) + '">' + esc(o.t) + '</button>'; }).join('') + '</div>' +
      (k === 'welt' ? '' : '<div class="wt-eigen"><input class="wt-in" data-wt-in="' + k + '" maxlength="' + (k === 'held' || k === 'freund' ? 30 : 80) + '" placeholder="' + (k === 'held' ? 'Eigener Name, z. B. Mila' : 'Eigene Idee …') + '"><button type="button" class="wt-knopf primaer" data-wt="eigen-ok">OK</button></div>');
    var sc = ansicht.querySelector('.wt-scroll'); if (sc) sc.scrollTop = 0;
  }
  function waehle(k, v) {
    v = String(v || '').trim(); if (!v) return;
    entwurf[k] = v;
    if (k === 'welt') { zustand.welt = welt(v); ansicht.querySelector('.wt-bg').innerHTML = kulisse(zustand.welt.bg); }
    entwurf.schritt++;
    if (entwurf.schritt >= SCHRITTE.length) return speichern();
    formular();
  }
  function nameVon(k) { return fig(k) ? figName(k) : String(k || '').trim(); }
  function titelVorschlag() { return nameVon(entwurf.held) + ' und ' + nameVon(entwurf.freund) + ' ' + ((welt(entwurf.welt) || {}).im || ''); }
  function gross(s) { s = String(s || '').trim(); return s.charAt(0).toUpperCase() + s.slice(1); }
  function satz(s) { s = gross(s); return /[.!?»]$/.test(s) ? s : s + '.'; }
  function machGeschichte(e) {
    if (e.freund === e.held) e.freund = e.held === 'otti' ? 'kometli' : 'otti';
    var w = welt(e.welt), H = nameVon(e.held), F = nameVon(e.freund), hasiF = e.freund === 'hasi', hasiH = e.held === 'hasi';
    var hf = fig(e.held), ff = fig(e.freund);
    var s = [
      'Im Zauberwald geht das ' + w.tor + ' auf. Dahinter wartet ' + (w.der || w.name) + '. Und mittendrin steht ' + H + (hf && hf.was ? ', ' + hf.was : '') + '.',
      satz('Doch heute ist etwas los: ' + e.problem) + ' ' + (hasiH ? 'Hasi sagt nichts. Aber Hasi macht ganz grosse Augen.' : '«Oh nein», sagt ' + H + '. «Was machen wir jetzt?»'),
      'Da kommt ' + F + (ff && ff.was ? ', ' + ff.was : '') + '. ' + (hasiF ? 'Hasi sagt nichts. Hasi nimmt ' + H + ' an der Pfote und nickt: Wir schaffen das.' : '«Keine Sorge», sagt ' + F + '. «Zusammen schaffen wir das.»'),
      'Und so machen sie es: ' + satz(e.loesung) + ' Schritt für Schritt, ganz ohne Eile.',
      'Es klappt! ' + H + ' und ' + F + ' lachen. ' + gross(w.im || ('in ' + w.name)) + ' ist alles wieder gut.',
      'Dann winken sie dem ' + w.tor + ' zu und gehen zurück in den Zauberwald. Diese Geschichte habt ihr selbst erfunden.'
    ];
    return { id: e.id, titel: e.titel || titelVorschlag(), kurz: 'Erfunden von euch', cast: [fig(e.held) ? e.held : 'otti', fig(e.freund) ? e.freund : 'kometli'], seiten: s, lehre: 'Eure Ideen machen die Welten grösser.' };
  }
  function speichern() {
    var v = hol(); v.eigene = v.eigene || [];
    if ((entwurf.held || 'otti') === entwurf.freund) entwurf.freund = entwurf.freund === 'otti' ? 'kometli' : 'otti';
    var heute_ = new Date(), e = { id: 'e' + Date.now().toString(36), welt: entwurf.welt, held: entwurf.held || 'otti', freund: entwurf.freund || 'kometli', problem: entwurf.problem, loesung: entwurf.loesung || D().ERFINDEN.loesungen[0], titel: titelVorschlag(), datum: heute_.getDate() + '.' + (heute_.getMonth() + 1) + '.' };
    v.eigene.push(e); if (v.eigene.length > 60) v.eigene.shift(); leg(v);
    zustand.welt = welt(e.welt); zeigWelt(e.welt);
    var k = ansicht.querySelector('[data-wt-eigen="' + e.id + '"]'); if (k) { k.classList.add('neu'); k.scrollIntoView({ block: 'center', behavior: RUHIG ? 'auto' : 'smooth' }); }
  }

  /* ---------------- Klicks ---------------- */
  function klick(e) {
    var t = e.target.closest('button'); if (!t || !root.contains(t)) return;
    var a = t.getAttribute('data-wt');
    if (t.hasAttribute('data-wt-tor')) return reinfliegen(t.getAttribute('data-wt-tor'));
    if (t.hasAttribute('data-wt-story')) { var id = t.getAttribute('data-wt-story'); zustand.welt.geschichten.forEach(function (g) { if (g.id === id) lies(g); }); return; }
    if (t.hasAttribute('data-wt-eigen')) { var eid = t.getAttribute('data-wt-eigen'); eigene().forEach(function (g) { if (g.id === eid) lies(machGeschichte(g), true); }); return; }
    if (t.hasAttribute('data-wt-wahl')) { var p = zustand.seq[zustand.seite]; zustand.wahl[p.nr] = p.wahl[+t.getAttribute('data-wt-wahl')]; still(); zustand.seite++; seite(); return; }
    if (t.hasAttribute('data-wt-chip')) return waehle(t.getAttribute('data-wt-chip'), t.getAttribute('data-wert'));
    if (a === 'eigen-ok') { var inp = ansicht.querySelector('[data-wt-in]'); if (inp) waehle(inp.getAttribute('data-wt-in'), inp.value); return; }
    if (t.hasAttribute('data-wt-tipp')) { var tp = t.getAttribute('data-wt-tipp').split('/'); return reinfliegen(tp[0], tp[1]); }
    if (a === 'mag') { var m = magToggle(zustand.story.id); t.setAttribute('aria-pressed', String(m)); t.textContent = m ? '❤️ Lieblingsgeschichte' : '🤍 Mag ich'; return; }
    if (a === 'zurueck') return zurueck();
    if (a === 'erfinden') return zeigErfinden(root.getAttribute('data-ansicht'));
    if (a === 'speichern') return speichern();
    if (a === 'vor') return blaettern(-1);
    if (a === 'weiter') return blaettern(1);
    if (a === 'nochmal') return lies(zustand.story, zustand.eigen);
    if (a === 'welt') return zeigWelt(zustand.welt.id);
    if (a === 'loeschen') {
      if (!confirm('Diese eigene Geschichte löschen?')) return;
      var v = hol(); v.eigene = (v.eigene || []).filter(function (g) { return g.id !== zustand.story.id; }); leg(v); return zeigWelt(zustand.welt.id);
    }
    if (a === 'vorlesen') { zustand.vorlesen = !zustand.vorlesen; t.setAttribute('aria-pressed', String(zustand.vorlesen)); t.textContent = zustand.vorlesen ? '⏸' : '🔊'; if (zustand.vorlesen) vorlesenSeite(); else still(); }
  }

  /* ---------------- Einstiege in der App ---------------- */
  function markHeute() {
    var h = heute(); if (!h) return;
    d.querySelectorAll('[data-welten-heute]').forEach(function (el) { el.textContent = 'Heute offen: ' + h.tor + ' · ' + h.name; });
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-welten]'); if (!b) return;
    e.preventDefault(); oeffnen(b.getAttribute('data-welten') || '');
  });
  function start() { markHeute(); if (/^#tore\b/.test(location.hash)) oeffnen(location.hash.split('-')[1] || ''); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();

  window.Welten = { oeffnen: oeffnen, schliessen: schliessen, heute: heute, profil: profil, empfehlung: empfehlung, _geschichte: machGeschichte };
})();
