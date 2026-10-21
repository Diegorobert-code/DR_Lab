// Puppe: lässt eine Figur (Otti, Nova, Fia …) leben – atmen, blinzeln, winken, reden, reagieren.
// Läuft komplett im Gerät, ohne CDN und ohne Pakete (DOM, WebGL/Canvas, Web Audio). Funktioniert offline.
//
// Einbau (3 Zeilen):
//   <link rel="stylesheet" href="../nova/puppe.css">
//   <div id="otti" class="puppe-buehne"></div>
//   <script src="../nova/puppe.js"></script><script>var otti = Puppe.erstelle('#otti', { figur: 'otti', bild: 'otti-3d.jpg' });</script>
//
// Zwei Modi:
//  (a) Ebenen-Modus: mit { ordner: 'puppe/otti/' } lädt die Puppe puppe.json mit Tinkos Teil-Bildern (PNG mit Transparenz,
//      fertig: nova/puppe/otti|nova|fia/) und baut die Figur aus Teilen (Körper, Kopf, Arme/Flügel, Lider, Ausdrücke, 9 Mundformen). Ohne «ordner» wird nichts nachgeladen (kein 404). Oder direkt: { teile: { koerper, kopf, armL, armR, augenHalb, augenZu, muender: {X,A,E,O,U,M,F,L} } }.
//  (b) Ein-Bild-Modus (Ersatz): das vorhandene Figurenbild wird per WebGL organisch verformt (Atmen, Kopf neigen, Blick,
//      Lider, Kiefer/Mundform) und bekommt einen winkenden Arm im Figurenstil.
//
// Zustände: ruhig, hoert, redet, freut, winkt, denkt, schlaeft  →  otti.zustand('winkt')
// Ereignisse: otti.reagiere('richtig' | 'falsch' | 'pause' | 'tipp')
// Reden: jedes abgespielte <audio> bewegt automatisch den Mund (Web Audio Analyse);
//        mit ElevenLabs-Zeitstempeln: otti.sage(audioElement, alignment)   (alignment = { characters, character_start_times_seconds, character_end_times_seconds })
//        nur Text (ohne Ton): otti.sprich('Hoi zäme!')
//
// Grüssen (jede Figur auf ihre Art): otti.winke()  ·  otti.gruesse()  ·  otti.gruesse('winken+reden', { satz: 'Hoi!' })
//   Arten: winken, reden, flattern, nicken, huepfen, glocke, wedeln, lachen, joggen (mit «+» kombinierbar).
//   Ohne Art: Vorlage der Figur (Puppe.figuren[name].gruss). System «weniger Bewegung»: sanftes Nicken statt Winken.
//   Winken im Ein-Bild-Modus: mit winkArm { x, y, r, dx, dy, seite, winkel, heben } (Anteile 0..1 am Bild) schwingt dieser
//   Bildbereich um den Drehpunkt (dx, dy); das Gesicht bleibt fest. Ohne winkArm erscheint ein gemalter Arm neben dem Gesicht.
//   Option antippen: 'gruss' → Antippen der Figur grüsst (statt kitzeln).
//
// Zurückwinken in jeder App (vorhandenes <img> bleibt, nur beim Gruss lebt es):
//   <link rel="stylesheet" href="../nova/puppe.css"><script src="../nova/puppe.js"></script>
//   var w = Puppe.winkeZurueck('img.figur');           // Figur wird am Bildpfad erkannt, sonst { figur: 'otti' }
//   w.winke();  w.gruesse('reden', { satz: 'Hallo!', audio: 'hallo.mp3' });
//   Kamera (nur wo die App sie schon nutzt): var stopp = Puppe.kameraWinken(videoEl, function () { w.winke(); });
(function () {
  'use strict';
  if (window.Puppe) return;

  var SKRIPT = document.currentScript;
  var BASIS = SKRIPT ? SKRIPT.src.replace(/[^\/]*$/, '') : '';
  var RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var ZUSTAENDE = ['ruhig', 'hoert', 'redet', 'freut', 'winkt', 'denkt', 'schlaeft'];

  // ---------- Figuren-Vorlagen (Positionen in Bild-Anteilen 0..1, gemessen am quadratischen Figurenbild) ----------
  var FIGUREN = {
    otti: {
      name: 'Otti',
      // Augen: Mitte x, y und Radius x, y (etwas grösser als das Auge, damit das Lid alles deckt)
      augen: [[0.388, 0.656, 0.080, 0.070], [0.667, 0.602, 0.058, 0.066]],
      // Mund: linker Winkel, rechter Winkel, Bogen der Oberlippe, Bogen der Unterkante (Mundinneres), Kinn-Abstand
      mund: { l: [0.436, 0.768], r: [0.666, 0.744], oben: 0.022, unten: 0.080, kinn: 0.075, offen: true },
      kopf: [0.53, 0.56, 0.47], // Mitte x, y, Radius
      hals: [0.53, 0.98],
      innen: [0.30, 0.07, 0.07],
      arm: { seite: 'rechts', fell: '#9a6230', fellHell: '#d29a58', haut: '#f0c39a', x: 0.78, y: 0.99, groesse: 0.40 },
      glow: '#f2c14e'
    },
    // Nova: nova/nova-3d.jpg (1024 x 1024)
    nova: {
      name: 'Nova',
      augen: [[0.399, 0.556, 0.116, 0.097], [0.699, 0.463, 0.080, 0.091]],
      mund: { l: [0.512, 0.671], r: [0.693, 0.615], oben: 0.010, unten: 0.084, kinn: 0.07, offen: true },
      kopf: [0.52, 0.48, 0.46],
      hals: [0.55, 0.86],
      innen: [0.22, 0.03, 0.07],
      arm: { seite: 'links', glatt: true, ballen: false, fell: '#c3cce0', fellHell: '#f7f4ee', haut: '#eef1f8', dunkel: '#4f6188', linie: '#4f6188', x: 0.24, y: 1.0, groesse: 0.38 },
      glow: '#8fb8ff'
    },
    // Fia (Phönix-Küken): fia-kosmos/posen/wacht.jpg (512 x 512) – Augen im Bild geschlossen, Schnabel als Mund
    fia: {
      name: 'Fia',
      aus: [0.56, 0.60, 1.5], // Ausschnitt: Mitte x, y, Zoom (Fia ist im Bild klein)
      augenZu: true,
      augen: [[0.600, 0.562, 0.050, 0.052]],
      mund: { l: [0.455, 0.650], r: [0.528, 0.656], oben: 0, unten: 0, kinn: 0.04, max: 0.04 },
      kopf: [0.57, 0.57, 0.2],
      hals: [0.56, 0.74],
      innen: [0.2, 0.03, 0.02],
      arm: { typ: 'fluegel', seite: 'rechts', fell: '#d9481f', fellHell: '#ff9d4d', haut: '#ffc173', dunkel: '#8a2410', x: 0.82, y: 0.80, groesse: 0.44 },
      glow: '#ff9a4a',
      gruss: 'flattern'
    },
    // ---- weitere Figuren (Ein-Bild-Modus). Gemessen an den Bildern im Repo, Anteile 0..1.
    // winkArm: Bereich im Bild, der beim Winken mitschwingt (Mitte x, y, Radius r, Drehpunkt dx/dy = Ellbogen/Schulter).
    // Ohne winkArm bekommt die Figur einen gemalten Arm (arm) neben dem Gesicht.
    flo: {
      name: 'Flo', bild: 'nova/figuren/flo.jpg',
      augen: [[0.42, 0.41, 0.068, 0.062], [0.632, 0.435, 0.063, 0.06]],
      mund: { l: [0.40, 0.555], r: [0.60, 0.575], oben: 0.012, unten: 0.05, kinn: 0.06, offen: true },
      kopf: [0.51, 0.42, 0.36], hals: [0.52, 0.74], innen: [0.42, 0.10, 0.12],
      arm: { seite: 'rechts', glatt: true, ballen: false, fell: '#d8d2c6', fellHell: '#fffaf0', haut: '#f4dcc8', dunkel: '#8a7a5a', linie: '#a08a50', x: 0.80, y: 1.0, groesse: 0.36 },
      glow: '#f6d98a', gruss: 'joggen+winken'
    },
    fompa: {
      name: 'Fompa', bild: 'nova/figuren/fompa.jpg',
      augen: [[0.462, 0.315, 0.07, 0.07], [0.632, 0.35, 0.065, 0.07]],
      mund: { l: [0.44, 0.435], r: [0.585, 0.465], oben: 0.012, unten: 0.035, kinn: 0.05, offen: true },
      kopf: [0.53, 0.36, 0.3], hals: [0.55, 0.62], innen: [0.35, 0.08, 0.08],
      winkArm: { x: 0.82, y: 0.64, r: 0.15, dx: 0.70, dy: 0.80, seite: 'rechts' },
      glow: '#f2c14e', gruss: 'nicken'
    },
    granny: {
      name: 'Granny', bild: 'granny/figur-gross.jpg',
      augen: [[0.41, 0.425, 0.06, 0.045], [0.652, 0.485, 0.06, 0.045]],
      mund: { l: [0.37, 0.60], r: [0.57, 0.645], oben: 0.006, unten: 0.014, kinn: 0.06 },
      kopf: [0.5, 0.48, 0.42], hals: [0.5, 0.96], innen: [0.4, 0.1, 0.1],
      arm: { seite: 'links', glatt: true, ballen: false, fell: '#e98f8c', fellHell: '#f8c4bb', haut: '#f3c9a6', dunkel: '#a85a5a', linie: '#b07a5a', x: 0.17, y: 1.0, groesse: 0.34 },
      glow: '#f2c14e', gruss: 'lachen+winken', satz: 'Ach, wie schön, dass du da bist!'
    },
    hasi: {
      name: 'Hasi', bild: 'hasi/icon-512.png',
      augen: [[0.44, 0.42, 0.05, 0.06], [0.592, 0.378, 0.04, 0.05]],
      mund: { l: [0.49, 0.52], r: [0.585, 0.508], oben: 0.004, unten: 0.01, kinn: 0.04 },
      kopf: [0.52, 0.40, 0.22], hals: [0.55, 0.62], innen: [0.35, 0.08, 0.08],
      winkArm: { x: 0.64, y: 0.60, r: 0.11, dx: 0.70, dy: 0.80, seite: 'rechts' },
      glow: '#f2c14e', gruss: 'huepfen'
    },
    ping: {
      name: 'Mr. Ping', bild: 'tradeping/ping-3d.jpg',
      augen: [[0.62, 0.265, 0.045, 0.05], [0.755, 0.28, 0.04, 0.045]],
      mund: { l: [0.63, 0.365], r: [0.795, 0.37], oben: 0.008, unten: 0.03, kinn: 0.05, offen: true },
      kopf: [0.69, 0.3, 0.24], hals: [0.66, 0.56], innen: [0.3, 0.06, 0.06],
      winkArm: { x: 0.91, y: 0.52, r: 0.14, dx: 0.95, dy: 0.80, seite: 'rechts', winkel: 16 }, gesicht: [0.72, 0.33, 0.2],
      glow: '#f2c14e', gruss: 'glocke', satz: 'Ping! Hallo!'
    },
    waefwaef: {
      name: 'Wäf Wäf', bild: 'waefwaef/icon-512.png',
      augen: [[0.36, 0.475, 0.045, 0.05], [0.605, 0.38, 0.045, 0.05]],
      mund: { l: [0.51, 0.62], r: [0.70, 0.575], oben: 0.01, unten: 0.06, kinn: 0.06, offen: true },
      kopf: [0.55, 0.48, 0.42], hals: [0.55, 0.92], innen: [0.45, 0.1, 0.12],
      arm: { seite: 'rechts', fell: '#efe2cc', fellHell: '#fffaf0', haut: '#f3d9c3', dunkel: '#b9a27e', linie: '#a08a6a', x: 0.86, y: 1.0, groesse: 0.34 },
      glow: '#f6d98a', gruss: 'wedeln', satz: 'Wuff!'
    },
    sunny: {
      name: 'Sunny', bild: 'nova/figuren/sunny.jpg',
      augen: [[0.42, 0.355, 0.065, 0.07], [0.655, 0.42, 0.06, 0.07]],
      mund: { l: [0.40, 0.50], r: [0.58, 0.525], oben: 0.012, unten: 0.05, kinn: 0.05, offen: true },
      kopf: [0.52, 0.38, 0.32], hals: [0.5, 0.64], innen: [0.4, 0.08, 0.1],
      winkArm: { x: 0.90, y: 0.62, r: 0.16, dx: 0.76, dy: 0.62, seite: 'rechts' },
      glow: '#f2c14e', gruss: 'flattern'
    },
    sparky: {
      name: 'Sparky', bild: 'nova/figuren/sparky.jpg',
      augen: [[0.42, 0.64, 0.06, 0.06], [0.695, 0.525, 0.065, 0.07]],
      mund: { l: [0.53, 0.80], r: [0.78, 0.745], oben: 0.006, unten: 0.016, kinn: 0.05 },
      kopf: [0.6, 0.56, 0.44], hals: [0.6, 0.98], innen: [0.35, 0.08, 0.08],
      arm: { seite: 'links', fell: '#d9561f', fellHell: '#ff9a52', haut: '#3a2418', dunkel: '#7a2a10', linie: '#2a160c', x: 0.16, y: 1.0, groesse: 0.36, ballen: false },
      glow: '#ff9a4a', gruss: 'winken+reden', satz: 'Hey, schön dich zu sehen!'
    },
    coinmaker: {
      name: 'Coinmaker', bild: 'nova/figuren/coinmaker.jpg',
      augen: [[0.53, 0.30, 0.05, 0.055], [0.66, 0.37, 0.045, 0.05]],
      mund: { l: [0.515, 0.47], r: [0.64, 0.475], oben: 0.01, unten: 0.035, kinn: 0.05, offen: true },
      kopf: [0.58, 0.36, 0.25], hals: [0.55, 0.66], innen: [0.3, 0.06, 0.06],
      winkArm: { x: 0.15, y: 0.31, r: 0.25, dx: 0.06, dy: 0.70, seite: 'links', winkel: 10 },
      glow: '#f2c14e', gruss: 'winken'
    },
    kiki: {
      name: 'Kiki', bild: 'kiki/figur-gross.jpg',
      augen: [[0.40, 0.43, 0.065, 0.065], [0.69, 0.62, 0.065, 0.07]],
      mund: { l: [0.36, 0.64], r: [0.52, 0.72], oben: 0.01, unten: 0.06, kinn: 0.05, offen: true },
      kopf: [0.55, 0.55, 0.45], hals: [0.55, 0.98], innen: [0.45, 0.1, 0.12],
      glow: '#f2c14e', gruss: 'reden', satz: 'La-la-la – hallo!'
    },
    carmen: {
      name: 'Carmen', bild: 'carmen/figur-gross.jpg',
      augen: [[0.575, 0.35, 0.05, 0.05], [0.742, 0.47, 0.045, 0.05]],
      mund: { l: [0.555, 0.51], r: [0.665, 0.55], oben: 0.01, unten: 0.035, kinn: 0.05, offen: true },
      kopf: [0.65, 0.42, 0.28], hals: [0.62, 0.76], innen: [0.4, 0.08, 0.1],
      winkArm: { x: 0.10, y: 0.24, r: 0.16, dx: 0.20, dy: 0.56, seite: 'links' },
      glow: '#f2c14e', gruss: 'winken+reden', satz: '¡Hola!'
    },
    jackie: {
      name: 'Jackie', bild: 'jackie/figur-gross.jpg',
      augen: [[0.47, 0.47, 0.05, 0.05], [0.665, 0.57, 0.05, 0.055]],
      mund: { l: [0.43, 0.635], r: [0.565, 0.71], oben: 0.01, unten: 0.035, kinn: 0.05, offen: true },
      kopf: [0.55, 0.5, 0.35], hals: [0.55, 0.92], innen: [0.4, 0.08, 0.1],
      winkArm: { x: 0.27, y: 0.63, r: 0.13, dx: 0.22, dy: 0.92, seite: 'links' },
      glow: '#f2c14e', gruss: 'lachen+winken', satz: 'Hey du!'
    },
    'otti-winkt': {
      name: 'Otti', bild: 'mondschein/otti-winkt-fig.jpg',
      augen: [[0.465, 0.27, 0.03, 0.03], [0.555, 0.27, 0.03, 0.03]],
      mund: { l: [0.48, 0.355], r: [0.54, 0.355], oben: 0.003, unten: 0.008, kinn: 0.03 },
      kopf: [0.51, 0.3, 0.16], hals: [0.51, 0.45], innen: [0.25, 0.08, 0.06],
      winkArm: { x: 0.79, y: 0.24, r: 0.11, dx: 0.73, dy: 0.42, seite: 'rechts' },
      glow: '#f2c14e', gruss: 'winken'
    }
  };
  FIGUREN.otti.gruss = 'winken+reden'; FIGUREN.otti.satz = 'Hoi! Schön, bisch da.'; FIGUREN.otti.bild = 'otti/otti-3d.jpg';
  FIGUREN.nova.gruss = 'winken+reden'; FIGUREN.nova.satz = 'Hallo, ich bin da!'; FIGUREN.nova.bild = 'nova/nova-3d.jpg';
  FIGUREN.fia.bild = 'nova/figuren/fia-wacht.jpg';
  // Figur aus dem Bildpfad erraten (für Puppe.winkeZurueck ohne «figur»)
  var ERKENNE = [
    [/otti-winkt-fig/, 'otti-winkt'], [/otti[-\/](3d|icon)|\/otti\//, 'otti'], [/nova(-3d)?\.jpg|nova\/icon/, 'nova'], [/fia/, 'fia'],
    [/flo\b|flo(-klein)?\.jpg|food-?flow/, 'flo'], [/fompa/, 'fompa'], [/granny/, 'granny'], [/hasi/, 'hasi'],
    [/ping-3d|tradeping\/(figur|icon)/, 'ping'], [/waefwaef|waef/, 'waefwaef'], [/sunny/, 'sunny'], [/sparky|humanspark/, 'sparky'],
    [/coinmaker/, 'coinmaker'], [/kiki/, 'kiki'], [/carmen/, 'carmen'], [/jackie/, 'jackie']
  ];
  function erkenneFigur(src) {
    src = String(src || '').toLowerCase();
    for (var i = 0; i < ERKENNE.length; i++) if (ERKENNE[i][0].test(src)) return ERKENNE[i][1];
    return null;
  }

  // ---------- kleine Helfer ----------
  function klemme(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function glatt(a, b, x) { var t = klemme((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function zufall(a, b) { return a + Math.random() * (b - a); }
  // weiches «Rauschen» aus Sinus-Wellen mit krummen Frequenzen: wirkt organisch, nie mechanisch
  function rausch(t, s) { return (Math.sin(t * 0.61 + s) * 0.5 + Math.sin(t * 1.37 + s * 2.1) * 0.3 + Math.sin(t * 2.71 + s * 3.7) * 0.2); }
  function el(tag, cls, eltern) { var e = document.createElement(tag); if (cls) e.className = cls; if (eltern) eltern.appendChild(e); return e; }

  // Winkkurve (u in Sekunden ab dem ersten Schwung, f = Schwünge pro Sekunde): kurzes Ausholen in die Gegenrichtung,
  // dann 2–3 weiche Schwünge, die am Ende ausklingen. Insgesamt ca. 1,6 s. Stetig und ohne Knick → wirkt nie mechanisch.
  function winkKurve(u, f) {
    if (u < 0) return -0.35 * Math.sin(Math.PI * klemme(1 + u / 0.22, 0, 1));
    var env = glatt(0, 0.16, u) * (1 - glatt(0.95, 1.36, u));
    return env * Math.sin(u * Math.PI * 2 * f);
  }

  // Feder (gedämpfter Oszillator): weiche Übergänge mit natürlichem Nachschwingen statt CSS-Keyframes
  function Feder(wert, k, d) { this.x = wert; this.v = 0; this.z = wert; this.k = k || 120; this.d = d || 16; }
  Feder.prototype.schritt = function (dt) {
    var a = this.k * (this.z - this.x) - this.d * this.v;
    this.v += a * dt; this.x += this.v * dt;
  };

  // ---------- Web Audio: Lautstärke/Frequenz → Mundform ----------
  var AC = null, quellen = typeof WeakMap !== 'undefined' ? new WeakMap() : null, alle = [];
  function audioKontext() {
    if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { AC = new C(); } catch (e) { return null; } }
    return AC;
  }
  function entsperren() { var c = audioKontext(); if (c && c.state !== 'running' && c.resume) c.resume().catch(function () {}); }
  ['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (n) { document.addEventListener(n, entsperren, { capture: true, passive: true }); });

  function gleicherUrsprung(a) {
    if (a.crossOrigin) return true;
    var s = a.currentSrc || a.src || '';
    if (!s || /^(blob|data):/.test(s)) return true;
    try { return new URL(s, location.href).origin === location.origin; } catch (e) { return false; }
  }
  // Hängt einen Analyser an ein Audio-Element. Nur wenn der Kontext läuft und die Quelle gleichen Ursprungs ist –
  // sonst würde der Ton stumm (Browser-Regel). In dem Fall bewegt sich der Mund im Sprechrhythmus ohne Analyse.
  function analyser(a) {
    if (!quellen) return null;
    if (quellen.has(a)) return quellen.get(a);
    var c = audioKontext();
    if (!c || c.state !== 'running' || !gleicherUrsprung(a)) return null;
    try {
      var src = c.createMediaElementSource(a), an = c.createAnalyser();
      an.fftSize = 1024; an.smoothingTimeConstant = 0.35;
      src.connect(an); an.connect(c.destination);
      var q = { an: an, zeit: new Float32Array(an.fftSize), freq: new Uint8Array(an.frequencyBinCount) };
      quellen.set(a, q); return q;
    } catch (e) { return null; }
  }
  function knotenAnalyser(knoten) {
    var c = knoten.context, an = c.createAnalyser();
    an.fftSize = 1024; an.smoothingTimeConstant = 0.35; knoten.connect(an);
    return { an: an, zeit: new Float32Array(an.fftSize), freq: new Uint8Array(an.frequencyBinCount), rate: c.sampleRate };
  }
  // misst Lautheit (RMS) und Klangfarbe (tief/mittel/hoch) eines Analysers
  function messe(q) {
    var an = q.an, z = q.zeit, f = q.freq;
    if (an.getFloatTimeDomainData) an.getFloatTimeDomainData(z);
    else { var b = new Uint8Array(z.length); an.getByteTimeDomainData(b); for (var j = 0; j < b.length; j++) z[j] = (b[j] - 128) / 128; }
    var s = 0; for (var i = 0; i < z.length; i++) s += z[i] * z[i];
    an.getByteFrequencyData(f);
    var hz = (q.rate || (AC ? AC.sampleRate : 44100)) / an.fftSize, tief = 0, mitte = 0, hoch = 0;
    for (var k = 1; k < f.length; k++) {
      var h = k * hz, v = f[k] / 255;
      if (h < 200) continue; if (h < 900) tief += v; else if (h < 2500) mitte += v; else if (h < 6000) hoch += v; else break;
    }
    var n = tief + mitte + hoch + 1e-4;
    return { rms: Math.sqrt(s / z.length), tief: tief / n, mitte: mitte / n, hoch: hoch / n };
  }

  // jedes abgespielte Audio-Element bewegt den Mund der aktiven Puppe(n)
  document.addEventListener('play', function (e) {
    var a = e.target;
    if (!a || a.tagName !== 'AUDIO') return;
    for (var i = 0; i < alle.length; i++) if (alle[i].opt.autoLippen !== false) alle[i]._audioStart(a);
  }, true);

  // ---------- Buchstaben → Mundform (Viseme) ----------
  // X = zu/Ruhe, A = weit offen, E = breit (e/i), O = rund, U = klein rund, M = Lippen gepresst (m/b/p), F = Zähne auf Lippe (f/v/w), L = leicht offen (l/t/d/n/s …)
  var VISEME = { X: [-1, 0, 0, 0], A: [0.85, 0.15, 0, 0], E: [0.05, 1, 0, 0], O: [0.45, 0, 1, 0], U: [-0.2, 0, 1.25, 0], M: [-1, 0, 0, 1], F: [-0.55, 0.5, 0, 0.3], L: [-0.15, 0.3, 0, 0] };
  function viseme(ch) {
    ch = (ch || '').toLowerCase();
    if (/[aàáâ]/.test(ch)) return 'A';
    if (/[eéèêiïîyä]/.test(ch)) return 'E';
    if (/[oòóôö]/.test(ch)) return 'O';
    if (/[uùúûü]/.test(ch)) return 'U';
    if (/[mbp]/.test(ch)) return 'M';
    if (/[fvw]/.test(ch)) return 'F';
    if (/[a-zç]/.test(ch)) return 'L';
    return 'X';
  }
  // Zeitstempel für Text ohne Ton (ca. 13 Zeichen pro Sekunde, Pausen an Satzzeichen)
  function textZeiten(text) {
    var c = [], s = [], e = [], t = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i], d = /[.!?]/.test(ch) ? 0.32 : /[,;:]/.test(ch) ? 0.18 : ch === ' ' ? 0.06 : /[aeiouäöü]/i.test(ch) ? 0.095 : 0.065;
      c.push(ch); s.push(t); t += d; e.push(t);
    }
    return { characters: c, character_start_times_seconds: s, character_end_times_seconds: e, dauer: t };
  }

  // ---------- WebGL: Ein-Bild-Verformung ----------
  var VS = 'attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*0.5+0.5,0.5-a.y*0.5);gl_Position=vec4(a,0.0,1.0);}';
  var FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
    'varying vec2 v;uniform sampler2D B;uniform float px;',
    'uniform vec3 uKopf;uniform vec2 uHals;uniform float uNeig;uniform vec2 uKopfV;uniform float uAtem;',
    'uniform vec4 uAL;uniform vec4 uAR;uniform vec2 uLid;uniform vec2 uBlick;uniform float uFroh;',
    'uniform vec3 uAus;uniform float uMax;uniform vec4 uME;uniform vec3 uMF;uniform vec4 uMund;uniform float uPresse;uniform vec3 uInnen;',
    'uniform float uZeit;uniform float uWelle;uniform float uGlanz;uniform vec3 uGlow;',
    'uniform vec4 uWA;uniform vec2 uWP;uniform vec3 uGes;uniform float uRand;',
    'vec2 rot(vec2 p,float a){float c=cos(a),s=sin(a);return vec2(c*p.x-s*p.y,s*p.x+c*p.y);}',
    // Auge: Blick verschiebt die Iris, Lid gleitet von oben (Haut von oberhalb des Auges), Wimpernlinie an der Lidkante
    'void auge(vec4 A,float lid,inout vec2 p,inout float dk,inout vec2 lq,inout float wim){',
    ' vec2 e=(p-A.xy)/A.zw;float rr=dot(e,e);',
    ' p-=uBlick*A.zw*0.20*(1.0-smoothstep(0.15,0.95,rr));',
    ' float kante=-1.12+1.5*lid+0.32*lid*(1.0-e.x*e.x);',
    ' float aa=px/A.w*1.5;',
    ' float drin=1.0-smoothstep(0.86,1.0,rr);',
    ' float c=drin*(1.0-smoothstep(kante-aa,kante+aa,e.y))*step(0.01,lid);',
    ' if(c>dk){dk=c;lq=vec2(p.x,A.y-A.w*1.08-(kante-e.y)*A.w*0.42);}',
    ' float w=drin*step(0.02,lid)*(1.0-smoothstep(0.0,0.20,abs(e.y-kante)));',
    // unten das frohe Lid (Lachfalte): hebt sich bei Freude von unten
    // Lachaugen: nur die Wange schiebt das untere Lid leicht im Bogen hoch (kein müdes Halb-Lid); beim Schlafen schliesst es ganz
    ' float fr=uFroh*(1.0-lid);float fu=max(fr*0.3,lid*0.95);float u=1.08-0.6*fu-(0.15*lid+0.35*fr)*(1.0-e.x*e.x);',
    ' float cu=drin*smoothstep(u-aa,u+aa,e.y)*step(0.01,fu);',
    ' if(cu>dk){dk=cu;lq=vec2(p.x,A.y+A.w*1.1+(e.y-u)*A.w*0.4);}',
    ' wim=max(wim,w);',
    '}',
    'void main(){',
    ' vec2 p=uAus.xy+(v-0.5)/uAus.z;',
    // Winken: der Armbereich dreht sich um Ellbogen/Schulter; weicher Rand (keine Risse), das Gesicht bleibt fest
    ' if(uWA.z>0.0){float wa=1.0-smoothstep(uWA.z*0.45,uWA.z,distance(p,uWA.xy));',
    '  wa*=smoothstep(uGes.z*0.82,uGes.z*1.18,distance(p,uGes.xy));',
    '  p=uWP+rot(p-uWP,-uWA.w*wa);}',
    // Atem: Brust weitet sich unten, Kopf fährt mit
    ' float wb=smoothstep(0.58,1.0,p.y);p.x=0.5+(p.x-0.5)/(1.0+uAtem*0.022*wb);',
    // Kopf: dreht um den Hals, weicher Übergang zum Rest
    ' float wk=1.0-smoothstep(uKopf.z*0.55,uKopf.z*1.12,distance(p,uKopf.xy));',
    ' p-=uKopfV*wk;p=uHals+rot(p-uHals,-uNeig*wk);',
    // Mund
    ' vec2 L=uME.xy,R=uME.zw;float mw=R.x-L.x;',
    ' vec2 mc=vec2((L.x+R.x)*0.5,(L.y+R.y)*0.5+uMF.y*0.4);',
    ' vec2 md=(p-mc)/vec2(mw*0.85,uMF.y+uMF.z*0.8);float wm=1.0-smoothstep(0.55,1.0,length(md));',
    ' float sx=uMund.y*0.13-uMund.z*0.24;p.x=mc.x+(p.x-mc.x)/(1.0+sx*wm);',
    ' float t=(p.x-L.x)/mw;float tc=clamp(t,0.0,1.0);',
    ' p.y+=uMund.w*0.016*pow(abs(tc-0.5)*2.0,1.6)*wm;',
    ' float s=sin(3.14159*tc);float yo=mix(L.y,R.y,tc)+uMF.x*s;',
    ' float H=max(uMF.y-uMF.x,0.0)*pow(s,0.75);',
    ' float auf=uMund.x;float Hn=auf<0.0?H*(1.0+auf):H+auf*uMax*pow(s,0.85);',
    ' float D=Hn-H;float y=p.y-yo;float tief=0.0;',
    ' if(y>0.0&&s>0.0){',
    '  if(y<Hn){float o=H*0.28;',
    '   if(H<0.0005){p.y=yo;tief=1.0-0.5*smoothstep(Hn*0.5,Hn,y);}',
    '   else if(Hn<=o){p.y=yo+y*(H/max(Hn,1e-4));}',
    '   else if(y<o){p.y=yo+y;}',
    '   else{p.y=yo+o+(y-o)*(H-o)/(Hn-o);tief=clamp((Hn-H)/Hn,0.0,1.0)*smoothstep(o,Hn,y)*(1.0-smoothstep(Hn*0.7,Hn,y));}',
    '  }else{float f=1.0-smoothstep(0.0,uMF.z,y-Hn);p.y-=D*f;}',
    ' }',
    // gepresste Lippen (M/B/P): Mitte der Mundlinie leicht dunkel, Lippen wölben sich
    ' float lip=uPresse*s*(1.0-smoothstep(0.0,0.012,abs(v.y-(yo+Hn))))*step(0.0,-auf-0.6);',
    // Augen
    ' float dk=0.0,wim=0.0;vec2 lq=p;',
    ' auge(uAL,uLid.x,p,dk,lq,wim);auge(uAR,uLid.y,p,dk,lq,wim);',
    ' vec4 tx=texture2D(B,p);vec3 c=tx.rgb;',
    ' if(dk>0.0){vec3 h=texture2D(B,lq).rgb*0.93;c=mix(c,h,dk);}',
    ' c=mix(c,vec3(0.13,0.07,0.04),wim*0.85);',
    ' c=mix(c,uInnen,tief*0.75);',
    ' c=mix(c,c*0.6,lip);',
    // Licht: leichter Glow und eine weiche Lichtwelle (Hologramm)
    ' float band=fract(uZeit*0.09)*1.8-0.4;',
    ' c+=uGlow*uWelle*0.10*exp(-pow((v.y-band)*9.0,2.0));',
    ' c*=1.0+0.05*(uGlanz-uRand);',
    ' float r=distance(v,vec2(0.5,0.5));',
    ' float m=1.0-smoothstep(0.36,0.5,r);m*=1.0-smoothstep(0.84,1.0,v.y);',
    ' c+=uGlow*0.22*uGlanz*smoothstep(0.30,0.44,r)*m*(1.0-uRand);m=mix(m,1.0,uRand);',
    ' m*=tx.a;gl_FragColor=vec4(c*m,m);',
    '}'
  ].join('\n');

  function GLBild(canvas, bild) {
    var gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false }) || canvas.getContext('experimental-webgl');
    if (!gl) throw new Error('kein WebGL');
    function sh(typ, q) { var s = gl.createShader(typ); gl.shaderSource(s, q); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var la = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bild);
    var pot = (bild.naturalWidth & (bild.naturalWidth - 1)) === 0 && (bild.naturalHeight & (bild.naturalHeight - 1)) === 0;
    if (pot) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var u = {};
    ['px', 'uKopf', 'uHals', 'uNeig', 'uKopfV', 'uAtem', 'uAL', 'uAR', 'uLid', 'uBlick', 'uFroh', 'uME', 'uMF', 'uAus', 'uMax', 'uMund', 'uPresse', 'uInnen', 'uZeit', 'uWelle', 'uGlanz', 'uGlow', 'uWA', 'uWP', 'uGes', 'uRand']
      .forEach(function (n) { u[n] = gl.getUniformLocation(pr, n); });
    this.gl = gl; this.u = u; this.canvas = canvas;
  }
  GLBild.prototype.zeichne = function (w) {
    var gl = this.gl, u = this.u, c = this.canvas;
    gl.viewport(0, 0, c.width, c.height);
    gl.uniform1f(u.px, 1 / (c.width * w.aus[2]));
    gl.uniform3fv(u.uAus, w.aus); gl.uniform1f(u.uMax, w.mund.max || 0.075);
    gl.uniform3fv(u.uKopf, w.kopf); gl.uniform2fv(u.uHals, w.hals); gl.uniform1f(u.uNeig, w.neig); gl.uniform2f(u.uKopfV, w.kx, w.ky);
    gl.uniform1f(u.uAtem, w.atem);
    gl.uniform4fv(u.uAL, w.augen[0]); gl.uniform4fv(u.uAR, w.augen[1] || [9, 9, 0.01, 0.01]);
    gl.uniform2f(u.uLid, w.lidL, w.lidR); gl.uniform2f(u.uBlick, w.bx, w.by); gl.uniform1f(u.uFroh, w.froh);
    gl.uniform4f(u.uME, w.mund.l[0], w.mund.l[1], w.mund.r[0], w.mund.r[1]);
    gl.uniform3f(u.uMF, w.mund.oben, w.mund.unten, w.mund.kinn);
    gl.uniform4f(u.uMund, w.auf, w.breit, w.rund, w.laecheln); gl.uniform1f(u.uPresse, w.presse);
    gl.uniform3fv(u.uInnen, w.innen); gl.uniform1f(u.uZeit, w.zeit); gl.uniform1f(u.uWelle, w.welle); gl.uniform1f(u.uGlanz, w.glanz); gl.uniform3fv(u.uGlow, w.glow);
    gl.uniform4fv(u.uWA, w.wa || [0, 0, 0, 0]); gl.uniform2fv(u.uWP, w.wp || [0, 0]); gl.uniform3fv(u.uGes, w.ges || [9, 9, 0.01]); gl.uniform1f(u.uRand, w.rand || 0);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  function hexRGB(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

  // ---------- winkender Arm im Figurenstil (SVG, einmal gerastert, danach nur transform → 60 fps) ----------
  function armBilder(a) {
    var id = 'p' + Math.random().toString(36).slice(2, 7);
    if (a.typ === 'fluegel') return fluegelBilder(a, id);
    var dunkel = a.dunkel || '#4a2a12', linie = a.linie || '#8a5434';
    // Fell: Kanten werden mit Rauschen zu Büscheln verschoben
    var fell = '<filter id="' + id + 'f" x="-25%" y="-15%" width="150%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.06 0.5" numOctaves="2" seed="7"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '<filter id="' + id + 'w" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2"/></filter>';
    // Licht von links oben, goldenes Mondlicht als Randlicht rechts
    var verlauf = '<linearGradient id="' + id + 'g" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="' + dunkel + '"/><stop offset=".22" stop-color="' + a.fell + '"/>' +
      '<stop offset=".48" stop-color="' + a.fellHell + '"/><stop offset=".78" stop-color="' + a.fell + '"/><stop offset=".93" stop-color="' + dunkel + '"/><stop offset="1" stop-color="#ffd27a"/></linearGradient>' +
      '<radialGradient id="' + id + 'h" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#ffe9d2"/><stop offset=".5" stop-color="' + a.haut + '"/><stop offset="1" stop-color="#b47650"/></radialGradient>' +
      '<radialGradient id="' + id + 'b" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#f3a8a0"/><stop offset="1" stop-color="#cf7f78"/></radialGradient>';
    function haare(x0, x1, y0, y1, n, seed) {
      var s = '', r = seed;
      if (a.glatt) return '';
      function z() { r = (r * 9301 + 49297) % 233280; return r / 233280; }
      for (var i = 0; i < n; i++) {
        var x = x0 + z() * (x1 - x0), y = y0 + z() * (y1 - y0), l = 12 + z() * 16, k = (z() - 0.5) * 10;
        var f = z() < 0.45 ? '#3e220e' : z() < 0.7 ? a.fellHell : '#e9b877';
        s += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'q' + k.toFixed(1) + ' ' + (-l / 2).toFixed(1) + ' ' + (k * 0.4).toFixed(1) + ' ' + (-l).toFixed(1) + '" stroke="' + f + '" stroke-opacity=".5" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      }
      return s;
    }
    // Oberarm 160 x 260: Schulter unten, Ellbogen oben bei (80, 60)
    var ober = '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="260" viewBox="0 0 160 260"><defs>' + fell + verlauf + '</defs>' +
      '<g' + (a.glatt ? '' : ' filter="url(#' + id + 'f)"') + '><path d="M8 262 C2 190 14 110 26 66 C36 18 124 18 134 66 C146 110 158 190 152 262 Z" fill="url(#' + id + 'g)"/>' + haare(24, 136, 50, 250, 40, 11) + '</g>' +
      '<ellipse cx="62" cy="120" rx="26" ry="70" fill="#fff" opacity=".12" filter="url(#' + id + 'w)"/></svg>';
    // Unterarm mit Pfote 200 x 340: Ellbogen unten bei (100, 290)
    var pfote = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="340" viewBox="0 0 200 340"><defs>' + fell + verlauf + '</defs>' +
      '<g' + (a.glatt ? '' : ' filter="url(#' + id + 'f)"') + '><path d="M46 292 C40 240 44 190 52 150 C60 120 140 120 148 150 C156 190 160 240 154 292 A54 50 0 0 1 46 292 Z" fill="url(#' + id + 'g)"/>' + haare(56, 146, 150, 320, 34, 5) + '</g>' +
      '<g fill="url(#' + id + 'h)" stroke="' + linie + '" stroke-opacity=".3" stroke-width="2">' +
      '<ellipse cx="42" cy="70" rx="20" ry="31" transform="rotate(-30 42 70)"/><ellipse cx="76" cy="40" rx="20" ry="33" transform="rotate(-10 76 40)"/>' +
      '<ellipse cx="115" cy="38" rx="20" ry="33" transform="rotate(9 115 38)"/><ellipse cx="150" cy="62" rx="19" ry="30" transform="rotate(30 150 62)"/>' +
      '<ellipse cx="166" cy="122" rx="18" ry="26" transform="rotate(60 166 122)"/>' +
      '<ellipse cx="100" cy="112" rx="70" ry="64"/></g>' +
      (a.ballen === false ? '' : '<g fill="url(#' + id + 'b)" opacity=".85"><ellipse cx="100" cy="122" rx="30" ry="23"/><ellipse cx="45" cy="62" rx="8" ry="10" transform="rotate(-30 45 62)"/><ellipse cx="77" cy="31" rx="8" ry="10"/>' +
      '<ellipse cx="114" cy="29" rx="8" ry="10"/><ellipse cx="148" cy="54" rx="8" ry="10" transform="rotate(30 148 54)"/></g>') +
      '<ellipse cx="78" cy="88" rx="30" ry="20" fill="#fff" opacity=".28" filter="url(#' + id + 'w)"/>' +
      '<path d="M160 86 C176 110 176 150 152 170" stroke="#ffd27a" stroke-width="6" stroke-linecap="round" fill="none" opacity=".6" filter="url(#' + id + 'w)"/></svg>';
    function url(s) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); }
    return { ober: url(ober), unter: url(pfote) };
  }

  // Flügel (z.B. Fia): Federfächer, Drehpunkt am Ansatz unten (100, 290) – «winken» = flattern
  function fluegelBilder(a, id) {
    var f = '<defs><linearGradient id="' + id + 'q" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="' + (a.dunkel || '#8a2410') + '"/><stop offset=".45" stop-color="' + a.fell + '"/>' +
      '<stop offset=".85" stop-color="' + a.fellHell + '"/><stop offset="1" stop-color="' + a.haut + '"/></linearGradient>' +
      '<filter id="' + id + 'w"><feGaussianBlur stdDeviation="3"/></filter></defs>';
    var federn = '';
    for (var i = 0; i < 7; i++) {
      var w = -48 + i * 15, l = 150 + (i < 4 ? i * 18 : (6 - i) * 14 + 40);
      federn += '<ellipse cx="100" cy="' + (290 - l / 2) + '" rx="' + (17 - Math.abs(i - 3)) + '" ry="' + (l / 2) + '" transform="rotate(' + w + ' 100 290)" fill="url(#' + id + 'q)" stroke="' + (a.dunkel || '#8a2410') + '" stroke-opacity=".35" stroke-width="2"/>';
    }
    var deck = '';
    for (i = 0; i < 5; i++) deck += '<ellipse cx="100" cy="230" rx="20" ry="58" transform="rotate(' + (-34 + i * 17) + ' 100 290)" fill="' + a.fell + '" stroke="' + (a.dunkel || '#8a2410') + '" stroke-opacity=".3" stroke-width="2"/>';
    var fl = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="340" viewBox="0 0 200 340">' + f + '<ellipse cx="100" cy="150" rx="80" ry="120" fill="' + a.fellHell + '" opacity=".35" filter="url(#' + id + 'w)"/>' + federn + deck +
      '<ellipse cx="100" cy="285" rx="34" ry="30" fill="' + a.fell + '"/><ellipse cx="88" cy="270" rx="14" ry="10" fill="#fff" opacity=".25" filter="url(#' + id + 'w)"/></svg>';
    var leer = '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="260" viewBox="0 0 160 260"></svg>';
    function url(s) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); }
    return { ober: url(leer), unter: url(fl) };
  }

  // ---------- Puppe ----------
  function Puppe(wurzel, opt) {
    this.el = wurzel; this.opt = opt;
    var vorlage = FIGUREN[opt.figur] || {};
    this.f = {};
    for (var k in vorlage) this.f[k] = vorlage[k];
    ['augen', 'mund', 'kopf', 'hals', 'innen', 'arm', 'glow', 'name', 'aus', 'augenZu', 'winkArm', 'gesicht', 'gruss', 'satz'].forEach(function (n) { if (opt[n] != null) this.f[n] = opt[n]; }, this);
    if (opt.arm && vorlage.arm) { var a = {}; for (k in vorlage.arm) a[k] = vorlage.arm[k]; for (k in opt.arm) a[k] = opt.arm[k]; this.f.arm = a; }
    // unbekannte Figur ohne Angaben: Augen/Mund nicht verformen (sonst verzieht sich das Bild an falscher Stelle)
    this.f.augen = this.f.augen || [[9, 9, 0.01, 0.01]];
    this.f.mund = this.f.mund || { l: [9, 9], r: [9.1, 9], oben: 0, unten: 0, kinn: 0.01 };
    this.f.kopf = this.f.kopf || [0.5, 0.45, 0.4]; this.f.hals = this.f.hals || [0.5, 0.92];
    this.f.innen = this.f.innen || [0.28, 0.06, 0.07]; this.f.glow = this.f.glow || '#f2c14e';
    // Arm: entweder ein Bereich im Bild schwingt (winkArm) oder ein gemalter Arm erscheint neben dem Gesicht (automatisch)
    if (opt.arm === false) this.f.arm = null;
    else if (!this.f.winkArm && !this.f.arm) {
      var kx = this.f.kopf[0], links = kx > 0.55;
      this.f.arm = { seite: links ? 'links' : 'rechts', fell: '#7a4a24', fellHell: '#b07a42', haut: '#e3ad84', x: links ? klemme(kx - this.f.kopf[2] * 0.9, 0.12, 0.4) : klemme(kx + this.f.kopf[2] * 0.9, 0.6, 0.88), y: 1.02, groesse: 0.34 };
    }
    // Schutzkreis ums Gesicht: Augen + Mund (+ Rand), dort verformt das Winken nichts
    if (!this.f.gesicht) {
      var pkte = this.f.augen.filter(function (q) { return q[0] < 2; }).map(function (q) { return [q[0], q[1], Math.max(q[2], q[3])]; });
      if (this.f.mund.l[0] < 2) pkte.push([(this.f.mund.l[0] + this.f.mund.r[0]) / 2, (this.f.mund.l[1] + this.f.mund.r[1]) / 2 + this.f.mund.unten * 0.5, (this.f.mund.r[0] - this.f.mund.l[0]) / 2]);
      if (pkte.length) {
        var gx = 0, gy = 0; pkte.forEach(function (q) { gx += q[0]; gy += q[1]; }); gx /= pkte.length; gy /= pkte.length;
        var gr = 0; pkte.forEach(function (q) { gr = Math.max(gr, Math.sqrt((q[0] - gx) * (q[0] - gx) + (q[1] - gy) * (q[1] - gy)) + q[2]); });
        this.f.gesicht = [gx, gy, gr * 1.05];
      } else this.f.gesicht = [9, 9, 0.01];
    }
    this.inline = opt.buehne === false;
    this.ruhe = RM.matches || opt.ruhig === true;
    // «weniger Bewegung» im System: Grüsse werden zu einem sanften Nicken. (ruhig:true = ruhige App, Winken als Reaktion bleibt)
    this.wenig = RM.matches || opt.wenigBewegung === true;
    this.modus = 'laden';
    this._zustand = 'ruhig'; this._vorher = 'ruhig'; this.zustandSeit = 0;
    this.t = 0; this.effekte = []; this.partikel = [];
    var F = function (w, k, d) { return new Feder(w, k, d); };
    this.p = {
      neig: F(0, 70, 11), kx: F(0, 90, 14), ky: F(0, 90, 14), lean: F(0, 18, 7), leanR: F(0, 22, 8),
      sq: F(0, 260, 11), laecheln: F(0, 60, 12), lid: F(0, 120, 18), froh: F(0, 70, 14),
      bx: F(0, 420, 34), by: F(0, 420, 34), glanz: F(1, 30, 10), arm: F(0, 70, 13), ellb: F(0, 320, 18), hand: F(0, 150, 9),
      auf: F(-0.5, 900, 48), breit: F(0, 700, 44), rund: F(0, 700, 44), presse: F(0, 600, 40),
      parX: F(0, 40, 12), parY: F(0, 40, 12), atemAmp: F(1, 20, 9), naeher: F(0, 30, 10)
    };
    this.hop = { y: 0, v: 0 };
    this.blinzel = { naechst: zufall(1.2, 3), start: -1, doppelt: false };
    this.blick = { naechst: 1, x: 0, y: 0 };
    this.zeiger = { x: 0, y: 0, aktiv: 0 };
    this.neigung = null;
    this.audio = null; this.lautPeak = 0.05; this.lautGlatt = 0;
    this.timeline = null; this.letzteAktivitaet = performance.now();
    this._baue();
    alle.push(this);
  }

  Puppe.prototype._baue = function () {
    var w = this.el, self = this;
    w.classList.add('puppe-buehne');
    if (this.ruhe) w.classList.add('pp-ruhe');
    if (this.inline) w.classList.add('pp-inline');
    w.innerHTML = '';
    this.staub = el('canvas', 'pp-staub', w);
    this.boden = el('div', 'pp-boden', w);
    el('div', 'pp-strahl', w);
    this.tiefe = el('div', 'pp-tiefe', w);
    this.figur = el('div', 'pp-figur', this.tiefe);
    this.glow = el('div', 'pp-glow', this.figur);
    this.glow.style.background = 'radial-gradient(closest-side, ' + this.f.glow + '66, ' + this.f.glow + '22 55%, transparent)';
    this.koerper = el('div', 'pp-koerper', this.figur);
    this.deko = el('div', 'pp-deko', this.figur);
    this.deko.innerHTML = '<i class="pp-gedanke"><b></b><b></b><b></b></i><i class="pp-zzz"><b>z</b><b>z</b><b>Z</b></i>';
    this.funken = el('canvas', 'pp-funken', w);
    this.knopf = el('button', 'pp-neigen', w);
    this.knopf.type = 'button'; this.knopf.textContent = 'Bewegung'; this.knopf.hidden = true;
    this.knopf.addEventListener('click', function (e) { e.stopPropagation(); self.erlaubeNeigung(); });

    // Antippen: kitzeln, hüpfen, lächeln (und auf dem iPhone beim ersten Tipp Neigung erlauben)
    this.figur.addEventListener('pointerdown', function (e) {
      var r = w.getBoundingClientRect();
      if (self.opt.antippen === 'gruss') self.gruesse();
      else if (self.opt.antippen !== false) self.reagiere('tipp', { x: e.clientX - r.left, y: e.clientY - r.top });
      if (!self.neigung && window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') self.erlaubeNeigung();
    });
    w.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' && self.neigung) return;
      var r = w.getBoundingClientRect();
      self.zeiger.x = klemme(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      self.zeiger.y = klemme(((e.clientY - r.top) / r.height - 0.45) * 2, -1, 1);
      self.zeiger.aktiv = 2.5;
    });
    w.addEventListener('pointerleave', function () { self.zeiger.aktiv = Math.min(self.zeiger.aktiv, 0.3); });
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (n) { document.addEventListener(n, function () { self.letzteAktivitaet = performance.now(); }, { passive: true }); });

    if (window.DeviceOrientationEvent && !this.inline) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') this.knopf.hidden = this.opt.neigenKnopf === false;
      else this._neigungStarten();
    }

    this.groesse();
    if (window.ResizeObserver) new ResizeObserver(function () { self.groesse(); }).observe(w);
    else window.addEventListener('resize', function () { self.groesse(); });
    this.sichtbar = true;
    if (window.IntersectionObserver) new IntersectionObserver(function (e) { self.sichtbar = e[0].isIntersecting; }).observe(w);

    this._ladeModus().then(function () {
      w.classList.add('pp-bereit');
      w.setAttribute('data-modus', self.modus);
      self._event('puppe-bereit', { modus: self.modus });
    });
    var letzte = performance.now();
    function schleife(jetzt) {
      var dt = Math.min(0.05, (jetzt - letzte) / 1000); letzte = jetzt;
      if (self.sichtbar && !self.weg && !self.pausiert) self._tick(dt);
      if (!self.weg) self.raf = requestAnimationFrame(schleife);
    }
    this.raf = requestAnimationFrame(schleife);
  };

  Puppe.prototype._event = function (n, d) { try { this.el.dispatchEvent(new CustomEvent(n, { detail: d })); } catch (e) {} };

  // Ebenen-Modus versuchen, sonst Ein-Bild-Modus
  Puppe.prototype._ladeModus = function () {
    var self = this, o = this.opt;
    function ebenen(cfg, basis) { return self._baueEbenen(cfg, basis).then(function () { self.modus = 'ebenen'; }); }
    function einBild() { return self._baueEinBild().then(function () { self.modus = self.gl ? 'ein-bild' : 'ein-bild-einfach'; }); }
    if (o.teile) return ebenen({ teile: o.teile, gelenke: o.gelenke, groesse: o.groesse }, o.ordner || '').catch(einBild);
    if (!o.ordner || !window.fetch) return einBild();
    var ordner = String(o.ordner).replace(/\/?$/, '/');
    return fetch(ordner + 'puppe.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('keine puppe.json');
      return r.json();
    }).then(function (cfg) { return ebenen(cfg, ordner); }).catch(einBild);
  };

  function ladeBild(src) {
    return new Promise(function (ok, nein) {
      var i = new Image(); i.decoding = 'async';
      i.onload = function () { ok(i); }; i.onerror = function () { nein(new Error('Bild fehlt: ' + src)); };
      i.src = src;
    });
  }

  Puppe.prototype._baueEinBild = function () {
    var self = this, k = this.koerper;
    return ladeBild(this.opt.bild).then(function (bild) {
      self.bild = bild; self.bildAR = bild.naturalWidth / bild.naturalHeight || 1;
      var cv = el('canvas', 'pp-bild', k);
      try { self.gl = new GLBild(cv, bild); self.cv = cv; }
      catch (e) {
        cv.remove(); self.gl = null;
        var img = el('img', 'pp-bild pp-einfach', k); img.src = bild.src; img.alt = self.f.name || '';
      }
      if (self.f.arm) self._baueArm();
      self.groesse();
    });
  };

  Puppe.prototype._baueArm = function () {
    var a = this.f.arm, b = armBilder(a);
    // ohne Bühne (kleines, oft rundes Bild): Arm etwas grösser und weiter innen, damit die Hand sichtbar bleibt
    if (this.inline) { var ai = {}; for (var k in a) ai[k] = a[k]; ai.x = 0.5 + (a.x - 0.5) * 0.78; ai.groesse = a.groesse * 1.25; a = this.f.arm = ai; }
    var arm = el('div', 'pp-arm', this.koerper);
    arm.style.left = (a.x * 100) + '%'; arm.style.top = (a.y * 100) + '%';
    if (a.seite === 'links') arm.classList.add('pp-links');
    var ober = el('div', 'pp-ober', arm), oi = el('img', '', ober); oi.src = b.ober; oi.alt = '';
    var unter = el('div', 'pp-unter', ober), ui = el('img', '', unter); ui.src = b.unter; ui.alt = '';
    this.arm = { el: arm, ober: ober, unter: unter, spiegel: a.seite === 'links' ? -1 : 1 };
  };

  // Ebenen: alle Teile auf gleich grosser, transparenter Leinwand (Tinkos Format: 1024 x 1024, Teile an Originalposition).
  // Gelenke (hals, schulterR, schulterL, optional ellbogenR) in Pixeln dieser Leinwand. Ein Teil darf kleiner gerechnet sein
  // (z.B. 704 statt 768 px) – jedes Teil wird auf die ganze Figur gestreckt, die Lage bleibt gleich.
  // Flügel (Fia): teile.fluegelR/fluegelL → beide Flügel vorne, «winken» = flattern. Fehlende Teile (z.B. Schwanz) sind ok.
  // Optional cfg.winken = { heben: Grad, schwung: Grad, tempo: Hz } überschreibt die Winkbewegung.
  // Richtung (Grad, 0 = rechts, 90 = unten) von der Schulter zum Schwerpunkt eines Arm-Bilds; null, wenn nicht lesbar
  var armBilderCache = {};
  function armRichtung(src, gelenk, gr) {
    if (!src) return null;
    if (src in armBilderCache) return armBilderCache[src];
    var r = null;
    try {
      var i = new Image(); i.src = src; // ist schon geladen (vorgeladen) → sofort im Cache
      var n = 96, c = document.createElement('canvas'); c.width = c.height = n;
      var g = c.getContext('2d'); g.drawImage(i, 0, 0, n, n);
      var d = g.getImageData(0, 0, n, n).data, sx = 0, sy = 0, s = 0;
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var a = d[(y * n + x) * 4 + 3]; if (a > 128) { sx += x; sy += y; s++; } }
      if (s > 10) { var f = gr / n; r = Math.atan2(sy / s * f - gelenk[1], sx / s * f - gelenk[0]) * 57.2958; }
    } catch (e) { r = null; }
    return (armBilderCache[src] = r);
  }

  // Hand eines Arm-Bilds finden: Schwerpunkt der Pixel, die am weitesten von der Schulter weg sind; Handgelenk 62 % dazwischen
  function armHand(src, schulter, gr) {
    try {
      var i = new Image(); i.src = src;
      var n = 128, c = document.createElement('canvas'); c.width = c.height = n;
      var g = c.getContext('2d'); g.drawImage(i, 0, 0, n, n);
      var d = g.getImageData(0, 0, n, n).data, f = gr / n, pk = [], max = 0;
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
        if (d[(y * n + x) * 4 + 3] < 128) continue;
        var px = x * f, py = y * f, dd = Math.sqrt((px - schulter[0]) * (px - schulter[0]) + (py - schulter[1]) * (py - schulter[1]));
        pk.push([px, py, dd]); if (dd > max) max = dd;
      }
      if (pk.length < 20 || max < gr * 0.08) return null;
      var sx = 0, sy = 0, s = 0;
      pk.forEach(function (q) { if (q[2] > max * 0.78) { sx += q[0]; sy += q[1]; s++; } });
      var hand = [sx / s, sy / s], len = Math.sqrt(Math.pow(hand[0] - schulter[0], 2) + Math.pow(hand[1] - schulter[1], 2));
      return { hand: hand, gelenk: [mix(schulter[0], hand[0], 0.62), mix(schulter[1], hand[1], 0.62)], r: len * 0.42 };
    } catch (e) { return null; }
  }

  Puppe.prototype._baueEbenen = function (cfg, basis) {
    var self = this, T = cfg.teile || {}, G = cfg.gelenke || {}, gr = cfg.groesse || 1024;
    function pfad(n) { return /^(https?:|data:|blob:|\/)/.test(n) ? n : basis + n; }
    if (!T.koerper || !T.kopf) return Promise.reject(new Error('koerper/kopf fehlt'));
    var fluegel = !!(T.fluegelR || T.fluegelL);
    var armR = T.fluegelR || T.armR, armL = T.fluegelL || T.armL;
    // alle Teile vorladen und dekodieren, damit beim ersten Mundwechsel nichts aufblitzt
    var liste = [T.koerper, T.kopf, armR, armL, T.unterarmR, T.augenHalb, T.augenZu, T.schwanz];
    var M = T.muender || {}, A = T.ausdruck || {}, v;
    for (v in M) liste.push(M[v]);
    for (v in A) liste.push(A[v]);
    var geladen = {};
    return Promise.all(liste.filter(Boolean).map(function (n) {
      return ladeBild(pfad(n)).then(function (i) {
        geladen[n] = true;
        return i.decode ? i.decode().catch(function () {}) : null;
      }, function (e) { if (n === T.koerper || n === T.kopf) throw e; });
    })).then(function () {
      var k = self.koerper; k.classList.add('pp-ebenen');
      function ursprung(d, g, def) { var p = g || def; d.style.transformOrigin = (p[0] / gr * 100) + '% ' + (p[1] / gr * 100) + '%'; }
      function bild(n, eltern, cls) {
        if (!n || !geladen[n]) return null;
        var i = el('img', 'pp-teil ' + (cls || ''), eltern); i.src = pfad(n); i.alt = ''; i.draggable = false;
        return i;
      }
      function gelenk(eltern, g, def) { var d = el('div', 'pp-gelenk', eltern); ursprung(d, g, def); return d; }
      var E = self.ebenen = { gr: gr, fluegel: fluegel };
      // Winken: Arm hebt sich an der Schulter seitlich hoch (neben den Kopf, nie davor), schwingt hin und her und schwingt nach (Feder).
      // Wie weit, rechnet die Puppe aus der Lage des Arms im Bild: Richtung Schulter → Schwerpunkt des Arms → Ziel «schräg oben aussen».
      // Flügel flattern kürzer und schneller. cfg.winken = { heben, schwung, tempo, ziel } überschreibt.
      var wk = cfg.winken || {};
      var ziel = wk.ziel != null ? wk.ziel : fluegel ? -12 : -22;
      var d0 = armRichtung(armR && pfad(armR), G.schulterR || [gr * 0.7, gr * 0.62], gr);
      E.heben = wk.heben != null ? wk.heben : d0 == null ? (fluegel ? -40 : -100) : klemme(ziel - d0, -150, -20);
      E.schwung = wk.schwung != null ? wk.schwung : fluegel ? 24 : 18;
      E.tempo = wk.tempo || (fluegel ? 2.8 : 1.9);
      // Reihenfolge: Schwanz, hinterer Arm, Körper, Kopf (mit Ausdruck, Lidern, Mund), vorderer Arm
      if (T.schwanz) { E.schwanz = gelenk(k, G.schwanz, [gr * 0.5, gr * 0.8]); bild(T.schwanz, E.schwanz); }
      E.armL = gelenk(k, G.schulterL, [gr * 0.3, gr * 0.62]);
      bild(armL, E.armL);
      bild(T.koerper, k);
      E.kopf = gelenk(k, G.hals, [gr * 0.5, gr * 0.6]);
      bild(T.kopf, E.kopf);
      E.ausdruck = {};
      for (var a in A) E.ausdruck[a] = bild(A[a], E.kopf, 'pp-ausdruck pp-aus');
      E.augenHalb = bild(T.augenHalb, E.kopf, 'pp-lid');
      E.augenZu = bild(T.augenZu, E.kopf, 'pp-lid');
      if (E.augenHalb) E.augenHalb.style.opacity = 0;
      if (E.augenZu) E.augenZu.style.opacity = 0;
      E.muender = {};
      for (v in M) E.muender[v] = bild(M[v], E.kopf, 'pp-mund pp-aus');
      // Flügel liegen beide vorne (beim Vogel sitzen sie seitlich auf dem Körper)
      if (fluegel) k.appendChild(E.armL);
      E.arm = gelenk(k, G.schulterR, [gr * 0.7, gr * 0.62]);
      if (T.unterarmR) { bild(armR, E.arm); E.unter = gelenk(E.arm, G.ellbogenR, [gr * 0.8, gr * 0.45]); bild(T.unterarmR, E.unter); }
      else {
        var basisArm = bild(armR, E.arm);
        // Handgelenk: dasselbe Arm-Bild noch einmal, nur die Hand (weiche Maske), dreht um das Handgelenk und schwingt nach.
        // Der Grund-Arm blendet die Hand dort aus, wo die Hand-Ebene voll deckt → nie doppelt, nie durchsichtig.
        var hd = !fluegel && basisArm && wk.hand !== false ? armHand(pfad(armR), G.schulterR || [gr * 0.7, gr * 0.62], gr) : null;
        if (hd) {
          E.handEbene = gelenk(E.arm, hd.gelenk, hd.gelenk);
          E.handBild = bild(armR, E.handEbene);
          E.basisArm = basisArm; E.hd = hd;
        }
      }
      self.mundJetzt = null; self.mundSeit = 0;
      self.p.schwing = new Feder(0, 260, 17);
      self.groesse();
    });
  };

  Puppe.prototype.groesse = function () {
    var r = this.el.getBoundingClientRect(), W = r.width || 300, H = r.height || 400;
    var s = Math.min(W * 0.92, H * 0.78), fw = s, fh = s;
    if (this.inline) {
      // wie das Original-<img>: object-fit cover (Standard), contain oder fill
      var ar = this.bildAR || 1, fit = this.opt.einpassen || 'cover';
      if (fit === 'fill') { fw = W; fh = H; } else { fw = fit === 'contain' ? Math.min(W, H * ar) : Math.max(W, H * ar); fh = fw / ar; }
      s = fh;
    }
    this.box = s; this.W = W; this.H = H;
    this.figur.style.width = fw + 'px'; this.figur.style.height = fh + 'px';
    this.figur.style.left = ((W - fw) / 2) + 'px';
    this.figur.style.top = (this.inline ? (H - fh) / 2 : H * 0.84 - s) + 'px';
    if (this.arm) {
      var g = this.f.arm.groesse * s, ho = g * 0.62, wo = ho * 160 / 260, hu = g * 0.95, wu = hu * 200 / 340, A = this.arm;
      A.ober.style.cssText += ';width:' + wo + 'px;height:' + ho + 'px;left:' + (-wo / 2) + 'px;top:' + (-ho) + 'px';
      A.unter.style.cssText += ';width:' + wu + 'px;height:' + hu + 'px;left:' + (wo / 2 - wu / 2) + 'px;top:' + (ho * 60 / 260 - hu * 290 / 340) + 'px';
    }
    if (this.ebenen && this.ebenen.hd) {
      var E = this.ebenen, hd = E.hd, f = s / E.gr, mx = (hd.hand[0] * f).toFixed(1) + 'px ' + (hd.hand[1] * f).toFixed(1) + 'px', hr = hd.r * f;
      var mh = 'radial-gradient(circle at ' + mx + ', #000 ' + hr.toFixed(1) + 'px, transparent ' + (hr * 1.2).toFixed(1) + 'px)';
      var mb = 'radial-gradient(circle at ' + mx + ', transparent ' + (hr * 0.86).toFixed(1) + 'px, #000 ' + hr.toFixed(1) + 'px)';
      E.handBild.style.webkitMaskImage = E.handBild.style.maskImage = mh;
      E.basisArm.style.webkitMaskImage = E.basisArm.style.maskImage = mb;
    }
    this.boden.style.top = (H * 0.84) + 'px';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (this.cv) { var pw = Math.round(fw * dpr), ph = Math.round(fh * dpr); if (this.cv.width !== pw || this.cv.height !== ph) { this.cv.width = pw; this.cv.height = ph; } }
    [this.staub, this.funken].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    this.dpr = dpr;
  };

  // ---------- Neigung (Hologramm-Parallax) ----------
  Puppe.prototype.erlaubeNeigung = function () {
    var self = this;
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(function (r) { if (r === 'granted') self._neigungStarten(); }).catch(function () {});
    } else this._neigungStarten();
  };
  Puppe.prototype._neigungStarten = function () {
    if (this._neigungAn) return; this._neigungAn = true;
    var self = this; this.knopf.hidden = true;
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null) return;
      var n = self.neigung || (self.neigung = { g0: e.gamma, b0: e.beta, x: 0, y: 0 });
      // Nullpunkt wandert langsam mit, damit die Figur nach dem Hinlegen wieder gerade steht
      n.g0 += (e.gamma - n.g0) * 0.01; n.b0 += (e.beta - n.b0) * 0.01;
      n.x = klemme((e.gamma - n.g0) / 25, -1, 1); n.y = klemme((e.beta - n.b0) / 25, -1, 1);
    });
  };

  // ---------- Zustände ----------
  Puppe.prototype.zustand = function (z) {
    if (!arguments.length) return this._zustand;
    if (ZUSTAENDE.indexOf(z) < 0) return this;
    if (z !== this._zustand) {
      if (z === 'redet' || z === 'winkt') this._vorher = this._zustand === 'redet' ? this._vorher : this._zustand;
      this.el.classList.remove('pp-z-' + this._zustand);
      this._zustand = z; this.zustandSeit = this.t;
      this.el.classList.add('pp-z-' + z);
      if (z === 'freut') { this._springe(0.06); this._funkenRegen(30); }
      if (z === 'winkt') this.winkStart = this.t;
      this._event('puppe-zustand', { zustand: z });
    }
    this.letzteAktivitaet = performance.now();
    return this;
  };

  Puppe.prototype._springe = function (h) {
    if (this.ruhe) { this.p.sq.v -= 1.2; return; }
    var self = this;
    // Ausholen (kurz in die Knie), dann Sprung mit Strecken
    this.p.sq.v -= 2.5;
    setTimeout(function () { self.hop.v = -Math.sqrt(2 * 9.8 * h * 1.0) * 1.0; }, 90);
  };

  Puppe.prototype._effekt = function (dauer, fn) { this.effekte.push({ start: this.t, dauer: dauer, fn: fn }); };

  Puppe.prototype.reagiere = function (was, wo) {
    var self = this;
    this.letzteAktivitaet = performance.now();
    if (was === 'tipp' || was === 'kitzeln') {
      this._springe(0.03);
      this._effekt(1.1, function (p, k) { p.neig += Math.sin(k * 30) * 0.07 * (1 - k) * (1 - k); p.laecheln += 0.9 * Math.sin(Math.PI * Math.min(1, k * 1.4)); p.froh += 0.8 * Math.sin(Math.PI * k); p.auf += 0.5 * Math.sin(Math.PI * k); });
      this._funken(wo ? wo.x : this.W / 2, wo ? wo.y : this.H * 0.5, 14);
    } else if (was === 'richtig') {
      this._springe(0.07);
      setTimeout(function () { self._springe(0.05); }, 650);
      this._effekt(2.2, function (p, k) { var e = Math.sin(Math.PI * Math.min(1, k * 1.2)); p.laecheln += e; p.froh += 0.9 * e; p.glanz += 1.2 * e; p.auf += 0.6 * e; p.breit += 0.4 * e; });
      this._funkenRegen(50);
    } else if (was === 'falsch') {
      // staunen, sanft den Kopf wiegen, dann aufmunternd nicken
      this._effekt(2.4, function (p, k) {
        var a = 1 - glatt(0.25, 0.45, k);
        p.ky += -0.012 * a; p.auf += 0.55 * a; p.rund += 0.9 * a; p.by += -0.5 * a;
        if (k > 0.2 && k < 0.6) p.kx += Math.sin((k - 0.2) * 40) * 0.008 * (0.6 - k) * 2.5;
        if (k > 0.6) { var n = (k - 0.6) / 0.4; p.ky += Math.sin(n * Math.PI * 3) * 0.008 * (1 - n); p.laecheln += 0.6 * Math.sin(Math.PI * n); }
      });
    } else if (was === 'pause') {
      var vorher = this._zustand === 'winkt' ? 'hoert' : this._zustand;
      this.zustand('winkt');
      clearTimeout(this._pauseZeit);
      this._pauseZeit = setTimeout(function () { if (self._zustand === 'winkt') self.zustand(vorher === 'schlaeft' ? 'hoert' : vorher); }, 3200);
    }
    this._event('puppe-reaktion', { was: was });
    return this;
  };

  // ---------- Grüssen: jede Figur auf ihre Art ----------
  // art: 'winken' | 'reden' | 'flattern' | 'nicken' | 'huepfen' | 'glocke' | 'wedeln' | 'lachen' | 'joggen', kombinierbar mit «+» ('winken+reden').
  // Ohne art: opt.gruss → Vorlage der Figur → 'winken'. Bei «weniger Bewegung» (prefers-reduced-motion): kurzes, sanftes Nicken.
  // o: { satz, audio (URL oder <audio>), alignment (ElevenLabs), ton: false (keine Glocke), blase: false (keine Sprechblase) }
  Puppe.prototype.winke = function (o) { return this.gruesse('winken', o); };
  Puppe.prototype.gruesse = function (art, o) {
    if (this.weg) return this;
    if (art && typeof art === 'object') { o = art; art = null; }
    o = o || {};
    var self = this, P = this.p;
    art = art || o.gruss || this.opt.gruss || this.f.gruss || 'winken';
    var teile = String(art).split('+'), dauer = 1.6, gesehen = {};
    if (this.wenig) teile = teile.map(function (x) { return x === 'reden' ? x : 'nicken'; });
    teile = teile.filter(function (x) { if (gesehen[x]) return false; gesehen[x] = 1; return true; });
    this.letzteAktivitaet = performance.now();
    var bew = this.wenig ? 0.5 : 1;
    teile.forEach(function (x) {
      if (x === 'winken' || x === 'flattern' || x === 'glocke') {
        // Flattern und Glocke: schneller und kürzer als Winken
        self._winkTempo = x === 'flattern' ? 3.1 : x === 'glocke' ? 2.9 : null;
        self._winkAmp = x === 'winken' ? 1 : 0.75;
        var vor = self._zustand === 'winkt' ? self._vorher : self._zustand;
        self.zustand('winkt'); self._winkEinmal = true; self.winkStart = self.t;
        clearTimeout(self._winkZeit);
        self._winkZeit = setTimeout(function () {
          self._winkEinmal = false; self._winkTempo = null; self._winkAmp = null;
          if (self._zustand === 'winkt') self.zustand(vor === 'winkt' || vor === 'schlaeft' || vor === 'redet' ? 'ruhig' : vor);
        }, 1600);
        if (x === 'glocke' && o.ton !== false) glockenTon([0.3, 0.66, 1.0]);
      } else if (x === 'nicken') {
        // ein- bis zweimal weise nicken, Augen werden dabei etwas kleiner (zufrieden)
        var n = self.wenig ? 1 : 2;
        self._effekt(1.3, function (p, k) {
          var e = Math.sin(Math.PI * k);
          p.ky += Math.pow(Math.sin(Math.PI * n * k), 2) * 0.016 * bew; p.neig += Math.sin(Math.PI * k) * 0.03 * bew;
          p.laecheln += 0.7 * e; p.lid += 0.2 * e * (self.f.augenZu ? 0 : 1); p.glanz += 0.4 * e;
        });
        dauer = Math.max(dauer, 1.3);
      } else if (x === 'huepfen') {
        self._springe(0.05);
        setTimeout(function () { self._springe(0.035); }, 480);
        self._effekt(1.4, function (p, k) { var e = Math.sin(Math.PI * k); p.laecheln += e; p.froh += 0.7 * e; p.glanz += 0.8 * e; });
      } else if (x === 'wedeln') {
        // Hund: ganzer Körper wackelt fröhlich hin und her, Kopf schräg, Mund offen
        self._effekt(1.6, function (p, k) {
          var env = glatt(0, 0.12, k) * (1 - glatt(0.75, 1, k)), w = Math.sin(k * 1.6 * Math.PI * 2 * 3.2);
          p.leanR += w * 0.035 * env; p.lean += w * 0.008 * env; p.neig -= w * 0.05 * env;
          p.laecheln += env; p.froh += 0.6 * env; p.auf += 0.5 * env; p.glanz += 0.8 * env;
        });
      } else if (x === 'lachen') {
        self._effekt(1.6, function (p, k) {
          var env = glatt(0, 0.1, k) * (1 - glatt(0.7, 1, k)), hh = Math.abs(Math.sin(k * 1.6 * Math.PI * 4.2));
          p.laecheln += 1.1 * env; p.froh += 0.85 * env; p.auf += (0.15 + 0.45 * hh) * env; p.breit += 0.4 * env;
          p.ky -= hh * 0.004 * env * bew; p.glanz += env;
        });
      } else if (x === 'joggen') {
        // locker auf der Stelle joggen (Flo): federnde Schritte, leichtes Schaukeln
        self._effekt(1.9, function (p, k) {
          var env = glatt(0, 0.1, k) * (1 - glatt(0.8, 1, k)), ph = k * 1.9 * Math.PI * 2 * 2.6;
          p.bob -= Math.abs(Math.sin(ph / 2)) * 0.022 * env; p.leanR += Math.sin(ph / 2) * 0.012 * env; p.laecheln += 0.8 * env;
        });
        dauer = Math.max(dauer, 1.9);
      } else if (x === 'reden') {
        var satz = o.satz || self.opt.satz || self.f.satz || 'Hallo!';
        var winkt = teile.indexOf('winken') >= 0 || teile.indexOf('flattern') >= 0 || teile.indexOf('glocke') >= 0;
        if (o.audio) {
          var au = typeof o.audio === 'string' ? new Audio(o.audio) : o.audio;
          self.sage(au, o.alignment);
        } else if (winkt) {
          // Mund bewegt sich zum Satz, ohne das Winken zu unterbrechen
          var al = textZeiten(satz), st = self.t;
          self.timeline = { uhr: function () { return self.t - st; }, al: al };
          clearTimeout(self._sprichZeit);
          self._sprichZeit = setTimeout(function () { if (self.timeline && self.timeline.al === al) self.timeline = null; }, al.dauer * 1000 + 200);
        } else self.sprich(satz);
        if (o.blase !== false) self.blase(satz, textZeiten(satz).dauer + 1.4);
        dauer = Math.max(dauer, textZeiten(satz).dauer + 0.4);
      }
    });
    this._event('puppe-gruss', { art: teile.join('+'), dauer: dauer });
    this._grussBis = this.t + dauer;
    return this;
  };

  // Sprechblase über der Figur (Text, Dauer in Sekunden)
  Puppe.prototype.blase = function (text, sek) {
    var host = this.opt.blaseIn || this.el, b = host.querySelector(':scope > .pp-blase');
    if (!b) { b = el('div', 'pp-blase', host); b.setAttribute('role', 'status'); b.setAttribute('aria-live', 'polite'); }
    b.textContent = text;
    b.classList.remove('pp-blase-an', 'pp-blase-unten'); b.style.setProperty('--dx', '0px'); void b.offsetWidth;
    // im sichtbaren Bereich halten (Figur am Rand), Spitze zeigt weiter auf die Figur
    var r = b.getBoundingClientRect(), vw = document.documentElement.clientWidth || window.innerWidth, dx = 0;
    if (r.left < 8) dx = 8 - r.left; else if (r.right > vw - 8) dx = vw - 8 - r.right;
    b.style.setProperty('--dx', dx.toFixed(1) + 'px');
    if (r.top < 4 && host !== this.el) b.classList.add('pp-blase-unten');
    b.classList.add('pp-blase-an');
    clearTimeout(this._blaseZeit);
    this._blaseZeit = setTimeout(function () { b.classList.remove('pp-blase-an'); }, (sek || 2.5) * 1000);
    return this;
  };

  // kleine Tischglocke (Mr. Ping): Web Audio, ohne Datei
  function glockenTon(zeiten) {
    var c = audioKontext(); if (!c) return;
    entsperren();
    var t0 = c.currentTime + 0.02;
    zeiten.forEach(function (z, i) {
      [[1, 0.11, 1.3], [2.0, 0.045, 0.7], [2.76, 0.03, 0.4], [5.4, 0.012, 0.18]].forEach(function (q) {
        var os = c.createOscillator(), g = c.createGain(), t = t0 + z;
        os.type = 'sine'; os.frequency.value = 1240 * q[0] * (i === 1 ? 0.995 : 1);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(q[1] * (i ? 0.8 : 1), t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + q[2]);
        os.connect(g); g.connect(c.destination); os.start(t); os.stop(t + q[2] + 0.05);
      });
    });
  }

  // ---------- Reden ----------
  Puppe.prototype._audioStart = function (a) {
    if (this.weg) return;
    var self = this;
    var lassWinken = this._zustand === 'winkt' && this._winkEinmal;
    if (this.audio && this.audio.el === a) { if (!lassWinken) this.zustand('redet'); return; }
    var q = analyser(a);
    this.audio = { el: a, q: q };
    function ende() {
      a.removeEventListener('pause', ende); a.removeEventListener('ended', ende);
      if (self.audio && self.audio.el === a) {
        self.audio = null; if (self.timeline && self.timeline.audio === a) self.timeline = null;
        if (self._zustand === 'redet') self.zustand(self._vorher === 'redet' ? 'ruhig' : self._vorher);
      }
    }
    a.addEventListener('pause', ende); a.addEventListener('ended', ende);
    if (!lassWinken) this.zustand('redet');
  };
  // Audio mit optionalen ElevenLabs-Zeitstempeln abspielen (alignment oder normalized_alignment)
  Puppe.prototype.sage = function (a, alignment) {
    if (typeof a === 'string') { var u = new Audio(a); a = u; }
    if (alignment) { var al = alignment.normalized_alignment || alignment.alignment || alignment; this.timeline = { audio: a, al: al }; }
    else if (this.timeline && (this.timeline.audio === a || this.timeline.uhr)) this.timeline = null;
    entsperren();
    var self = this;
    // auch wenn autoLippen aus ist (z.B. Puppe.winkeZurueck): dieses Audio bewegt den Mund
    if (a.paused && this.opt.autoLippen === false) a.addEventListener('play', function () { self._audioStart(a); }, { once: true });
    var p = a.paused ? a.play() : null;
    if (!a.paused) this._audioStart(a);
    if (p && p.catch) p.catch(function () {});
    return a;
  };
  // Mund bewegt sich zu einem Text, ohne Ton (z.B. Sprechblase, wenn kein Server erreichbar)
  Puppe.prototype.sprich = function (text) {
    var al = textZeiten(text || ''), self = this, start = this.t;
    this.timeline = { uhr: function () { return self.t - start; }, al: al };
    this.zustand('redet');
    clearTimeout(this._sprichZeit);
    this._sprichZeit = setTimeout(function () {
      if (self.timeline && self.timeline.al === al) { self.timeline = null; if (self._zustand === 'redet' && !self.audio) self.zustand(self._vorher === 'redet' ? 'ruhig' : self._vorher); }
    }, al.dauer * 1000 + 200);
    return this;
  };
  // beliebiger Web-Audio-Knoten (z.B. Mikrofon oder Oszillator) bewegt den Mund
  Puppe.prototype.hoereKnoten = function (knoten) { this.knoten = knoten ? knotenAnalyser(knoten) : null; return this; };
  Puppe.prototype.verbinde = function (a) { if (a && !a.paused) this._audioStart(a); else if (a) a.addEventListener('play', this._audioStart.bind(this, a), { once: true }); return this; };

  // aktuelle Mundform: [auf, breit, rund, presse] oder null
  Puppe.prototype._mundZiel = function () {
    var tl = this.timeline;
    if (tl) {
      var t = tl.uhr ? tl.uhr() : (tl.audio ? tl.audio.currentTime : 0);
      var c = tl.al.characters || [], s = tl.al.character_start_times_seconds || [], e = tl.al.character_end_times_seconds || [];
      var lo = 0, hi = c.length - 1, i = -1;
      while (lo <= hi) { var m = (lo + hi) >> 1; if (s[m] <= t) { i = m; lo = m + 1; } else hi = m - 1; }
      if (i < 0 || t > (e[c.length - 1] || 0) + 0.05) return VISEME.X;
      var v1 = VISEME[viseme(c[i])], v2 = VISEME[viseme(c[i + 1])] || VISEME.X;
      var dur = Math.max(0.02, (e[i] || s[i] + 0.08) - s[i]), k = glatt(0.55, 1, (t - s[i]) / dur);
      // Koartikulation: gegen Ende eines Lauts schon zur nächsten Form gleiten
      return [mix(v1[0], v2[0], k), mix(v1[1], v2[1], k), mix(v1[2], v2[2], k), mix(v1[3], v2[3], k)];
    }
    var q = (this.audio && this.audio.q) || this.knoten;
    if (q) {
      var r = messe(q);
      this.lautPeak = Math.max(r.rms, this.lautPeak * 0.995, 0.02);
      var lv = klemme((r.rms / this.lautPeak - 0.12) * 1.35, 0, 1);
      if (lv < 0.05) return VISEME.X;
      var breit = klemme((r.hoch - 0.22) * 3.2, 0, 1), rund = klemme((r.tief - 0.55) * 3.5, 0, 1) * (1 - breit);
      return [-1 + 1.9 * Math.pow(lv, 0.75) - rund * 0.3, breit, rund * 1.1, 0];
    }
    if (this.audio) {
      // Quelle nicht analysierbar (fremder Server): Silbenrhythmus aus weichem Rauschen
      var x = rausch(this.t * 9, 1.3) + 0.5 * Math.sin(this.t * 23);
      return x < -0.2 ? VISEME.M : [klemme(x, -0.6, 0.9), klemme(Math.sin(this.t * 5.3), 0, 1) * 0.6, klemme(-Math.sin(this.t * 3.1), 0, 1) * 0.7, 0];
    }
    return null;
  };

  // ---------- Partikel (Sternstaub, Funken) ----------
  Puppe.prototype._funken = function (x, y, n) {
    if (this.ruhe) n = Math.min(n, 4);
    for (var i = 0; i < n; i++) {
      var w = zufall(0, Math.PI * 2), v = zufall(40, 170);
      this.partikel.push({ x: x, y: y, vx: Math.cos(w) * v, vy: Math.sin(w) * v - 60, l: 0, d: zufall(0.6, 1.1), r: zufall(1.5, 3.5), funke: true });
    }
  };
  Puppe.prototype._funkenRegen = function (n) {
    for (var i = 0; i < n; i++) {
      var x = this.W / 2 + zufall(-0.4, 0.4) * this.box, y = this.H * 0.84 - this.box * zufall(0.3, 1.0);
      this.partikel.push({ x: x, y: y, vx: zufall(-30, 30), vy: zufall(-90, -20), l: -zufall(0, 0.5), d: zufall(0.9, 1.6), r: zufall(1.5, 3.5), funke: true });
    }
  };

  Puppe.prototype._zeichneStaub = function (dt, parX, parY) {
    var c = this.staub, g = c.getContext('2d'), d = this.dpr, W = this.W, H = this.H;
    g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, W, H);
    if (!this.sterne) {
      this.sterne = [];
      for (var i = 0; i < 46; i++) this.sterne.push({ x: Math.random(), y: Math.random() * 0.8, r: zufall(0.4, 1.4), p: zufall(0, 6), t: zufall(0.2, 1), z: zufall(0.3, 1) });
      this.staubT = [];
      for (i = 0; i < 26; i++) this.staubT.push({ a: Math.random(), x: zufall(-1, 1), r: zufall(0.6, 1.8), s: zufall(0.04, 0.09), p: zufall(0, 6) });
    }
    var t = this.t;
    g.globalCompositeOperation = 'lighter';
    for (i = 0; i < this.sterne.length; i++) {
      var s = this.sterne[i], tw = 0.45 + 0.55 * Math.sin(t * (0.6 + s.t) + s.p);
      g.fillStyle = 'rgba(255,236,190,' + (0.18 + 0.5 * tw * s.t).toFixed(3) + ')';
      g.beginPath(); g.arc(s.x * W - parX * 10 * s.z, s.y * H - parY * 6 * s.z, s.r, 0, 6.283); g.fill();
    }
    // Sternstaub steigt aus dem Lichtkreis auf
    var bx = W / 2, by = H * 0.84, br = this.box * 0.42;
    for (i = 0; i < this.staubT.length; i++) {
      var q = this.staubT[i];
      if (!this.ruhe) q.a += dt * q.s; if (q.a > 1) { q.a -= 1; q.x = zufall(-1, 1); }
      var y = by - q.a * this.box * 1.05, x = bx + q.x * br * (1 - q.a * 0.4) + Math.sin(t * 0.8 + q.p) * 8 - parX * 16;
      var al = Math.sin(Math.PI * q.a) * (0.5 + 0.5 * Math.sin(t * 3 + q.p));
      var grd = g.createRadialGradient(x, y, 0, x, y, q.r * 4);
      grd.addColorStop(0, 'rgba(255,225,150,' + (0.75 * al).toFixed(3) + ')'); grd.addColorStop(1, 'rgba(242,193,78,0)');
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, q.r * 4, 0, 6.283); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  };

  Puppe.prototype._zeichneFunken = function (dt, parX) {
    var c = this.funken, g = c.getContext('2d'), d = this.dpr;
    if (!this.partikel.length && !this._funkenDa) return;
    g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, this.W, this.H);
    this._funkenDa = this.partikel.length > 0;
    g.globalCompositeOperation = 'lighter';
    for (var i = this.partikel.length - 1; i >= 0; i--) {
      var q = this.partikel[i]; q.l += dt;
      if (q.l < 0) continue;
      if (q.l > q.d) { this.partikel.splice(i, 1); continue; }
      q.vy += 120 * dt; q.vx *= 0.985; q.x += q.vx * dt; q.y += q.vy * dt;
      var k = q.l / q.d, a = (1 - k) * (0.6 + 0.4 * Math.sin(q.l * 30)), r = q.r * (1 - k * 0.5), x = q.x + parX * 14;
      g.fillStyle = 'rgba(255,214,120,' + (a * 0.35).toFixed(3) + ')'; g.beginPath(); g.arc(x, q.y, r * 3.2, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(255,248,225,' + a.toFixed(3) + ')';
      g.beginPath(); g.moveTo(x, q.y - r * 2.2); g.lineTo(x + r * 0.6, q.y); g.lineTo(x, q.y + r * 2.2); g.lineTo(x - r * 0.6, q.y); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(x - r * 2.2, q.y); g.lineTo(x, q.y + r * 0.6); g.lineTo(x + r * 2.2, q.y); g.lineTo(x, q.y - r * 0.6); g.closePath(); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  };

  // ---------- Takt: alles pro Bild berechnen ----------
  Puppe.prototype._tick = function (dt) {
    this.t += dt;
    var t = this.t, P = this.p, z = this._zustand, ruhe = this.ruhe, seit = t - this.zustandSeit;
    var ziel = { neig: 0, kx: 0, ky: 0, lean: 0, leanR: 0, laecheln: 0.15, lid: 0, froh: 0, bx: 0, by: 0, glanz: 1, arm: 0, auf: -0.45, breit: 0, rund: 0, presse: 0, atemAmp: 1, naeher: 0 };
    var atemHz = 0.24, bew = ruhe ? 0.25 : 1;

    // Grundbewegung: Gewicht verlagern, Kopf wiegt leicht nach (Folgebewegung)
    ziel.lean = rausch(t * 0.35, 0.7) * 0.012 * bew;
    ziel.leanR = rausch(t * 0.35, 0.7) * 0.016 * bew;
    ziel.neig = rausch(t * 0.45, 2.2) * 0.035 * bew - ziel.leanR * 0.8;
    ziel.ky = rausch(t * 0.5, 5.1) * 0.003 * bew;

    // Blick: kleine Sakkaden wie bei echten Augen
    if (t > this.blick.naechst) { this.blick.naechst = t + zufall(1.2, 3.6); this.blick.x = zufall(-0.45, 0.45); this.blick.y = zufall(-0.3, 0.25); if (Math.random() < 0.35) { this.blick.x = 0; this.blick.y = 0; } }
    ziel.bx = this.blick.x; ziel.by = this.blick.y;

    if (z === 'hoert') {
      ziel.neig = 0.11 + rausch(t * 0.6, 1) * 0.02; ziel.naeher = 1; ziel.bx = 0; ziel.by = -0.05; ziel.laecheln = 0.35; ziel.glanz = 1.25; atemHz = 0.2; ziel.auf = -0.65;
      var nick = (seit % 2.6) / 2.6; if (nick < 0.25) ziel.ky += Math.sin(nick / 0.25 * Math.PI * 2) * 0.007 * bew;
    } else if (z === 'redet') {
      ziel.bx *= 0.3; ziel.by *= 0.3; ziel.laecheln = 0.3; ziel.glanz = 1.2;
    } else if (z === 'freut') {
      ziel.laecheln = 1; ziel.froh = 0.75; ziel.glanz = 1.7; ziel.auf = 0.25; ziel.breit = 0.3; ziel.bx = 0; ziel.by = 0;
      ziel.neig = Math.sin(t * 4.2) * 0.07 * bew; ziel.lean = Math.sin(t * 4.2) * 0.012 * bew;
      if (!ruhe && this.hop.y === 0 && this.hop.v === 0 && seit % 1.4 < dt * 1.5) this._springe(0.045);
      if (!ruhe && Math.random() < dt * 3) this._funkenRegen(1);
    } else if (z === 'winkt') {
      // Kopf neigt sich leicht zur winkenden Seite, Blick nach vorn, Lächeln; der Rest bleibt ruhig
      ziel.arm = 1; ziel.laecheln = 0.85; ziel.froh = 0.3; ziel.neig = 0.05 * this.arm_spiegel(); ziel.glanz = 1.35; ziel.auf = -0.1; ziel.bx = 0; ziel.by = 0;
    } else if (z === 'denkt') {
      ziel.neig = -0.1 + rausch(t * 0.3, 3) * 0.02; ziel.kx = -0.004; ziel.ky = -0.008; ziel.bx = -0.55; ziel.by = -0.7; ziel.laecheln = 0.0;
      ziel.auf = -0.7; ziel.rund = 0.2; ziel.presse = 0.3; atemHz = 0.18; ziel.lid = 0.15;
    } else if (z === 'schlaeft') {
      ziel.lid = 1; ziel.neig = 0.16 + Math.sin(t * 0.8) * 0.01; ziel.ky = 0.014; ziel.glanz = 0.55; atemHz = 0.13; ziel.atemAmp = 2.2;
      ziel.auf = -0.85 + 0.25 * Math.max(0, Math.sin(t * 2 * Math.PI * 0.13)); ziel.laecheln = 0.25; ziel.bx = 0; ziel.by = 0.3;
    }

    // Finger/Neigung: Kopf und Augen folgen
    var n = this.neigung, zx = 0, zy = 0;
    this.zeiger.aktiv = Math.max(0, this.zeiger.aktiv - dt);
    if (n) { zx = n.x; zy = n.y; }
    else if (this.zeiger.aktiv > 0) { zx = this.zeiger.x; zy = this.zeiger.y; }
    if (ruhe) { zx *= 0.2; zy *= 0.2; }
    P.parX.z = zx; P.parY.z = zy;
    if ((this.zeiger.aktiv > 0 || n) && z !== 'schlaeft' && z !== 'denkt') { ziel.bx = mix(ziel.bx, zx * 0.8, 0.8); ziel.by = mix(ziel.by, zy * 0.6, 0.8); ziel.kx += zx * 0.008; ziel.ky += zy * 0.005; }

    // Mund aus Ton / Zeitstempel
    var mz = this._mundZiel();
    if (mz) { ziel.auf = mz[0]; ziel.breit = mz[1]; ziel.rund = mz[2]; ziel.presse = mz[3]; if (z === 'redet') { ziel.ky += Math.max(0, mz[0]) * 0.004 * bew; ziel.neig += Math.max(0, mz[0]) * rausch(t * 0.9, 4) * 0.02 * bew; } }

    for (var k in ziel) if (P[k]) P[k].z = ziel[k];

    // Effekte (Tippen, richtig, falsch …) addieren sich obendrauf
    var add = { neig: 0, kx: 0, ky: 0, laecheln: 0, froh: 0, auf: 0, breit: 0, rund: 0, by: 0, glanz: 0, lid: 0, lean: 0, leanR: 0, bob: 0 };
    for (var i = this.effekte.length - 1; i >= 0; i--) {
      var e = this.effekte[i], kk = (t - e.start) / e.dauer;
      if (kk >= 1) { this.effekte.splice(i, 1); continue; }
      e.fn(add, kk);
    }
    for (k in add) if (P[k]) P[k].z += add[k];
    this._bob = add.bob;

    // Winken: Ausholen, 2–3 weiche Schwünge, dann klingt es aus (winkKurve). Federn sorgen für Verzögerung und Nachschwingen:
    // ellb/schwing = Unterarm bzw. Schulter, hand = Handgelenk (hängt etwas hinterher und schwingt nach).
    var sw = 0, wt = this._winkTempo || (this.ebenen && this.ebenen.tempo) || 2.1;
    if (z === 'winkt' && !this.wenig) {
      var u0 = t - (this.winkStart || 0);
      sw = winkKurve((this._winkEinmal ? u0 : u0 % 2.4) - 0.22, wt) * (this._winkAmp || 1);
    }
    var hebt = klemme(P.arm.x, 0, 1);
    P.ellb.z = sw * hebt;
    P.hand.z = P.ellb.x;
    if (P.schwing) P.schwing.z = sw * hebt;
    // Körper wippt leicht mit (Gegenbewegung), Kopf bleibt ruhig
    if (z === 'winkt' && !this.wenig) { P.lean.z -= P.ellb.x * 0.003 * this.arm_spiegel(); P.leanR.z -= P.ellb.x * 0.004 * this.arm_spiegel(); P.ky.z += Math.abs(P.ellb.x) * 0.0015; }

    for (k in P) P[k].schritt(dt);

    // Sprung-Physik mit Strecken in der Luft und Stauchen bei der Landung
    var h = this.hop;
    if (h.v !== 0 || h.y < 0) {
      h.v += 9.8 * dt; h.y += h.v * dt;
      P.sq.z = klemme(-h.v * 0.06, -0.08, 0.08) * -1;
      if (h.y >= 0) { h.y = 0; P.sq.v -= Math.min(3.5, Math.abs(h.v) * 2.6); h.v = 0; P.sq.z = 0; }
    } else P.sq.z = 0;

    // Blinzeln: schnell zu, etwas langsamer auf, manchmal doppelt; das zweite Auge eine Spur später
    var b = this.blinzel, lidB = 0;
    if (t > b.naechst && b.start < 0) { b.start = t; b.doppelt = Math.random() < 0.18; }
    if (b.start >= 0) {
      var bt = t - b.start, ein = 0.075, aus = 0.13, ges = ein + aus;
      lidB = bt < ein ? bt / ein : bt < ges ? 1 - (bt - ein) / aus : 0;
      if (bt > ges) { if (b.doppelt) { b.doppelt = false; b.start = t + 0.09; } else { b.start = -1; b.naechst = t + zufall(1.8, 5.5); } }
      lidB = lidB * lidB * (3 - 2 * lidB);
    }
    var lid = Math.max(P.lid.x, lidB);

    // Atem (Squash & Stretch): Einatmen etwas kürzer als Ausatmen
    var ph = (t * atemHz) % 1, atem = ph < 0.42 ? Math.sin(ph / 0.42 * Math.PI / 2) : Math.cos((ph - 0.42) / 0.58 * Math.PI / 2);
    atem = (atem * 2 - 1) * P.atemAmp.x * (ruhe ? 0.5 : 1);

    // Körper: schweben, verlagern, atmen, springen, Parallax
    var S = this.box, sq = P.sq.x, schweb = ruhe || this.inline ? 0 : Math.sin(t * 1.1) * S * 0.008;
    var px = P.parX.x, py = P.parY.x, nah = P.naeher.x, hopF = this.inline ? 0.45 : 1.6;
    var tf = 'translate3d(' + (P.lean.x * S + px * S * 0.02).toFixed(2) + 'px,' + (h.y * S * hopF + schweb + py * S * 0.012 + (this._bob || 0) * S).toFixed(2) + 'px,0) ' +
      'rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotate(' + (P.leanR.x * 57.3).toFixed(2) + 'deg) ' +
      'scale(' + (1 + nah * 0.035 - sq * 0.55 + atem * 0.004).toFixed(4) + ',' + (1 + nah * 0.035 + sq + atem * 0.008).toFixed(4) + ')';
    this.figur.style.transform = tf;
    var hoehe = -h.y * 1.6 - schweb / S;
    this.boden.style.transform = 'translateX(-50%) scale(' + (1 - hoehe * 1.6 - px * 0.03).toFixed(3) + ',' + (1 - hoehe * 1.6).toFixed(3) + ')';
    this.boden.style.opacity = (0.95 - hoehe * 2.4).toFixed(3);
    this.glow.style.opacity = klemme(0.35 + 0.35 * P.glanz.x + 0.05 * Math.sin(t * 1.7), 0, 1).toFixed(3);
    this.tiefe.style.transform = 'translate3d(' + (px * 6).toFixed(2) + 'px,' + (py * 4).toFixed(2) + 'px,0)';

    // Arm
    if (this.arm) {
      var ar = P.arm.x, sp = this.arm.spiegel;
      this.arm.el.style.opacity = klemme(ar * 2.2, 0, 1).toFixed(3);
      this.arm.ober.style.transform = 'translateY(' + ((1 - ar) * 70).toFixed(1) + '%) rotate(' + (sp * mix(50, 8, ar)).toFixed(2) + 'deg)';
      // nach aussen weiter als nach innen: die Pfote deckt nie das Gesicht; das Handgelenk (hand) schwingt nach
      var el2 = P.ellb.x, hw = P.hand.x - P.ellb.x;
      this.arm.unter.style.transform = 'rotate(' + (sp * (mix(45, -6, ar) + el2 * (el2 > 0 ? 24 : 13) + hw * 10)).toFixed(2) + 'deg)';
    }

    // Winke-Hand neben dem Bild (Puppe.winkeZurueck bei Figuren ohne Arm im Bild)
    if (this.opt.winkHand) {
      var wh = this.opt.winkHand, hb = klemme(P.arm.x, 0, 1.15);
      wh.style.opacity = klemme(P.arm.x * 2.5, 0, 1).toFixed(3);
      wh.style.transform = 'scale(' + (0.35 + 0.65 * hb).toFixed(3) + ') rotate(' + (-10 + P.ellb.x * 26 + (P.hand.x - P.ellb.x) * 12).toFixed(2) + 'deg)';
    }

    var w = {
      kopf: this.f.kopf, hals: this.f.hals, neig: P.neig.x, kx: P.kx.x, ky: P.ky.x - atem * 0.0025,
      atem: atem, augen: this.f.augen, lidL: lid, lidR: Math.max(P.lid.x, b.start >= 0 ? klemme(lidB * 1.1 - 0.05, 0, 1) : 0),
      bx: P.bx.x, by: P.by.x, froh: klemme(P.froh.x, 0, 1), mund: this.f.mund, aus: this.f.aus || [0.5, 0.5, 1],
      auf: klemme(P.auf.x, -1, 1.2), breit: klemme(P.breit.x, 0, 1.2), rund: klemme(P.rund.x, 0, 1.3), laecheln: klemme(P.laecheln.x, -0.5, 1.3), presse: klemme(P.presse.x, 0, 1),
      innen: this.f.innen, zeit: t, welle: ruhe || this.inline ? 0 : 1, glanz: P.glanz.x, glow: this._glowRGB || (this._glowRGB = hexRGB(this.f.glow)),
      ges: this.f.gesicht, rand: this.inline ? 1 : 0
    };
    if (this.inline) w.aus = [0.5, 0.5, 1];
    // Armbereich im Bild: hebt sich leicht (heben, Grad) und schwingt (winkel, Grad) um den Drehpunkt; Handgelenk schwingt nach
    var WA = this.f.winkArm;
    if (WA) {
      var spw = WA.seite === 'links' ? -1 : 1, rad = Math.PI / 180;
      var winkel = (WA.heben != null ? WA.heben : 4) * hebt + (WA.winkel || 12) * (P.ellb.x + (P.hand.x - P.ellb.x) * 0.35);
      w.wa = [WA.x, WA.y, WA.r || 0.14, spw * winkel * rad];
      w.wp = [WA.dx != null ? WA.dx : WA.x, WA.dy != null ? WA.dy : WA.y + (WA.r || 0.14) * 1.6];
    }
    // Bild mit geschlossenen Augen (z.B. Fia): keine Lider, kein Blick
    if (this.f.augenZu && !this.ebenen) { w.lidL = w.lidR = 0; w.froh = 0; w.bx = w.by = 0; }
    if (this.gl) this.gl.zeichne(w);
    else if (this.ebenen) this._zeichneEbenen(w, P);
    else if (this.koerper.firstChild) this.koerper.firstChild.style.transform = 'rotate(' + (w.neig * 20).toFixed(2) + 'deg)';

    if (!this.inline) { this._zeichneStaub(dt, px, py); this._zeichneFunken(dt, px); }

    // lange keine Berührung → Figur winkt freundlich (nur wenn gewünscht)
    if (this.opt.pauseNach && performance.now() - this.letzteAktivitaet > this.opt.pauseNach * 1000 && z !== 'schlaeft' && z !== 'redet') this.reagiere('pause');
  };
  Puppe.prototype.arm_spiegel = function () { return this.arm ? this.arm.spiegel : this.f.winkArm && this.f.winkArm.seite === 'links' ? -1 : 1; };

  // Ebenen-Modus: dieselben Werte als transform/opacity auf die Teil-Bilder
  Puppe.prototype._zeichneEbenen = function (w, P) {
    var E = this.ebenen, t = this.t, z = this._zustand, ruhe = this.ruhe;
    E.kopf.style.transform = 'translate(' + (w.kx * 100).toFixed(2) + '%,' + (w.ky * 100).toFixed(2) + '%) rotate(' + (w.neig * 57.3).toFixed(2) + 'deg)';
    // Arme: im Stand pendeln sie leicht mit dem Atem; beim Winken hebt die Schulter den Arm (Feder mit Überschwingen),
    // die Welle läuft als Feder hinterher und schwingt nach dem Winken aus
    var ar = P.arm.x, sw = klemme(P.schwing.x, -1.3, 1.3), pendel = ruhe ? 0 : rausch(t * 0.5, 9), atem = w.atem;
    var ruheR = (E.fluegel ? -2 : 2) * atem + pendel * 2, ruheL = (E.fluegel ? 2 : -2) * atem - rausch(t * 0.5, 4) * 2;
    if (E.fluegel) {
      // Flügel: rechter Flügel flattert, linker flattert kleiner mit (gespiegelt)
      E.arm.style.transform = 'rotate(' + (ruheR + E.heben * ar + sw * E.schwung).toFixed(2) + 'deg)';
      E.armL.style.transform = 'rotate(' + (ruheL - (E.heben * ar + sw * E.schwung) * 0.45).toFixed(2) + 'deg)';
    } else {
      E.arm.style.transform = 'rotate(' + (ruheR + E.heben * ar + (E.unter ? 0 : sw * E.schwung)).toFixed(2) + 'deg)';
      if (E.unter) E.unter.style.transform = 'rotate(' + (sw * 30).toFixed(2) + 'deg)';
      // Handgelenk: hängt dem Schwung hinterher und schwingt nach (Feder hand folgt ellb)
      if (E.handEbene) E.handEbene.style.transform = 'rotate(' + klemme((P.hand.x - P.ellb.x) * 15 + sw * 4, -11, 11).toFixed(2) + 'deg)';
      // der andere Arm gleicht beim Winken etwas aus
      E.armL.style.transform = 'rotate(' + (ruheL + ar * 4 - sw * 1.5).toFixed(2) + 'deg)';
    }
    if (E.schwanz) E.schwanz.style.transform = 'rotate(' + (rausch(t * 0.8, 6) * 4 + Math.sin(t * 7) * P.glanz.x * (z === 'freut' ? 6 : 0)).toFixed(2) + 'deg)';

    // Ausdruck (ganze Augenpartie): freut (Lachaugen), staunt (grosse Augen), denkt (Blick nach oben)
    var A = E.ausdruck, ziel = null;
    if (A.freut && (z === 'freut' || w.laecheln > 0.8 || w.froh > 0.55)) ziel = 'freut';
    else if (A.denkt && z === 'denkt') ziel = 'denkt';
    else if (A.staunt && w.rund > 0.6 && w.auf > 0.15) ziel = 'staunt';
    if (ziel !== E.ausdruckJetzt) {
      for (var a in A) if (A[a]) A[a].classList.toggle('pp-aus', a !== ziel);
      E.ausdruckJetzt = ziel;
    }
    // Lider liegen über dem Ausdruck: Blinzeln funktioniert in jeder Stimmung
    var lid = w.lidL;
    if (E.augenZu) E.augenZu.style.opacity = klemme((lid - 0.55) * 3.4, 0, 1).toFixed(2);
    if (E.augenHalb) E.augenHalb.style.opacity = (E.augenZu ? klemme(1 - Math.abs(lid - 0.5) * 3, 0, 1) : klemme(lid * 2, 0, 1)).toFixed(2);

    // Mundbild: nächstgelegene Form wählen und sofort wechseln (kein Überblenden, sonst scheint der gemalte Mund durch);
    // jede Form bleibt mind. 60 ms stehen, damit nichts flackert
    var best = 'X', bd = 1e9, M = E.muender;
    for (var v in VISEME) {
      if (!M[v]) continue; var q = VISEME[v];
      var d = Math.pow(q[0] - w.auf, 2) + Math.pow(q[1] - w.breit, 2) * 0.6 + Math.pow(q[2] - w.rund, 2) * 0.6 + Math.pow(q[3] - w.presse, 2) * 0.4;
      if (d < bd) { bd = d; best = v; }
    }
    if (w.laecheln > 0.6 && w.auf < 0.1 && M.laecheln) best = 'laecheln';
    if (best !== this.mundJetzt && (t - this.mundSeit > 0.06 || !this.mundJetzt)) {
      if (M[best]) M[best].classList.remove('pp-aus');
      if (this.mundJetzt && M[this.mundJetzt]) M[this.mundJetzt].classList.add('pp-aus');
      this.mundJetzt = best; this.mundSeit = t;
    }
  };

  Puppe.prototype.zerstoere = function () {
    this.weg = true; cancelAnimationFrame(this.raf);
    var i = alle.indexOf(this); if (i >= 0) alle.splice(i, 1);
    this.el.innerHTML = ''; this.el.classList.remove('pp-bereit');
  };

  // ---------- Puppe.winkeZurueck: aus jedem vorhandenen Figurenbild eine Puppe, die beim Antippen zurückgrüsst ----------
  // Das <img> bleibt, wo es ist (Layout, Klicks und Links bleiben gleich). Nur während des Grusses liegt die lebendige
  // Figur deckungsgleich darüber; danach ist wieder das ruhige Standbild zu sehen (keine Dauerbewegung, spart Akku).
  function einWinker(e, o) {
    var img = e && e.tagName === 'IMG' ? e : e && e.querySelector ? e.querySelector('img') : null;
    if (!img) return null;
    if (img._puppeWinker) return img._puppeWinker;
    var src = img.currentSrc || img.src, figur = o.figur || erkenneFigur(src) || '';
    var host = document.createElement('div');
    host.className = 'pp-winker'; host.setAttribute('aria-hidden', 'true');
    img.insertAdjacentElement('afterend', host);
    var buehne = el('div', 'pp-winker-buehne', host);
    var cs = getComputedStyle(img);
    buehne.style.borderRadius = cs.borderRadius;
    var opt = { figur: figur, bild: src, buehne: false, antippen: false, autoLippen: false, neigenKnopf: false, blaseIn: host, einpassen: cs.objectFit === 'fill' && img.naturalWidth && Math.abs(img.naturalWidth / img.naturalHeight - img.offsetWidth / Math.max(1, img.offsetHeight)) < 0.02 ? 'cover' : cs.objectFit };
    for (var k in o) if (k !== 'figur' && k !== 'antippen') opt[k] = o[k];
    // Figur ohne Arm im Bild: im kleinen Bild würde ein gemalter Arm das Gesicht verdecken. Stattdessen winkt eine
    // Hand 👋 an der Ecke ausserhalb des Bilds (gleiche Winkkurve). Mit { hand: 'gemalt' } kommt der gemalte Arm.
    var vorl = FIGUREN[figur] || {};
    if (!(o.winkArm || vorl.winkArm) && o.hand !== 'gemalt') {
      opt.arm = false;
      var seiteL = (o.arm && o.arm.seite || vorl.arm && vorl.arm.seite) === 'links';
      var hz = el('div', 'pp-winkhand' + (seiteL ? ' pp-links' : ''), host);
      el('span', '', hz).textContent = o.hand && o.hand !== 'emoji' ? o.hand : '👋';
      opt.winkHand = hz;
    }
    function lage() {
      host.style.left = img.offsetLeft + 'px'; host.style.top = img.offsetTop + 'px';
      host.style.width = img.offsetWidth + 'px'; host.style.height = img.offsetHeight + 'px';
      host.style.transform = cs.transform === 'none' ? '' : cs.transform; host.style.transformOrigin = cs.transformOrigin;
    }
    lage();
    var puppe = new Puppe(buehne, opt);
    puppe.pausiert = true;
    var bisZeit = null, an = false, alteOpazitaet = img.style.opacity, durchsichtig = null;
    // Hat das Bild durchsichtige Stellen (PNG)? Dann wird das Original während des Grusses ausgeblendet,
    // sonst bleibt es sichtbar (Rahmen und Schatten des Bilds bleiben so erhalten) und die Figur deckt es genau ab.
    function pruefeAlpha() {
      if (durchsichtig !== null) return durchsichtig;
      try {
        var c = document.createElement('canvas'); c.width = c.height = 24;
        var g = c.getContext('2d'); g.drawImage(img, 0, 0, 24, 24);
        var d = g.getImageData(0, 0, 24, 24).data; durchsichtig = false;
        for (var i = 3; i < d.length; i += 4) if (d[i] < 250) { durchsichtig = true; break; }
      } catch (e) { durchsichtig = true; }
      return durchsichtig;
    }
    function zeigen() {
      lage(); if (puppe.groesse) puppe.groesse();
      puppe.pausiert = false; puppe._aktiv = true;
      if (!an) {
        an = true; host.classList.add('pp-winker-an');
        // erst wenn die Figur deckend darüber liegt, das Standbild ausblenden
        if (pruefeAlpha()) setTimeout(function () { if (an) img.style.opacity = '0'; }, 140);
      }
    }
    function verstecken() {
      an = false; puppe._aktiv = false;
      img.style.opacity = alteOpazitaet;
      host.classList.remove('pp-winker-an');
      setTimeout(function () { if (!an) puppe.pausiert = true; }, 400);
    }
    var w = {
      puppe: puppe, bild: img, figur: figur,
      gruesse: function (art, oo) {
        var los = function () {
          zeigen(); puppe.gruesse(art, oo);
          clearTimeout(bisZeit);
          // Nachschwingen abwarten, dann zurück zum Standbild
          bisZeit = setTimeout(function warte() {
            if (puppe.t < (puppe._grussBis || 0) + 0.55 || puppe._zustand === 'redet') bisZeit = setTimeout(warte, 150);
            else verstecken();
          }, 400);
        };
        if (puppe.modus === 'laden') puppe.el.addEventListener('puppe-bereit', los, { once: true }); else los();
        return w;
      },
      winke: function (oo) { return w.gruesse(oo && oo.gruss ? oo.gruss : null, oo); },
      loese: function () { clearTimeout(bisZeit); img.removeEventListener('click', tipp); puppe.zerstoere(); host.remove(); img.style.opacity = alteOpazitaet; delete img._puppeWinker; }
    };
    function tipp() { w.gruesse(); }
    if (o.antippen !== false) img.addEventListener('click', tipp);
    if (window.ResizeObserver) new ResizeObserver(function () { if (an) lage(); }).observe(img);
    img._puppeWinker = w;
    return w;
  }
  function winkeZurueck(ziel, o) {
    o = o || {};
    var liste = typeof ziel === 'string' ? document.querySelectorAll(ziel) : ziel && ziel.length != null && !ziel.tagName ? ziel : [ziel];
    var r = [];
    for (var i = 0; i < liste.length; i++) { var w = einWinker(liste[i], o); if (w) r.push(w); }
    if (r.length === 1) return r[0];
    return {
      alle: r,
      winke: function (oo) { r.forEach(function (w) { w.winke(oo); }); return this; },
      gruesse: function (a, oo) { r.forEach(function (w) { w.gruesse(a, oo); }); return this; },
      loese: function () { r.forEach(function (w) { w.loese(); }); }
    };
  }

  // ---------- Kamera-Winken (nur wo die App die Kamera schon nutzt): erkennt Hin-und-her-Bewegung im Bild ----------
  // video: das <video> der App mit laufendem Kamerabild. Gibt eine Stopp-Funktion zurück. Kein Bild verlässt das Gerät.
  function kameraWinken(video, cb, o) {
    o = o || {};
    var w = 32, h = 24, c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d', { willReadFrequently: true }), alt = null, verlauf = [], aus = false, letzt = 0, timer;
    function schritt() {
      if (aus) return;
      timer = setTimeout(schritt, 90);
      if (!video.videoWidth || video.paused || document.hidden) return;
      try { g.drawImage(video, 0, 0, w, h); } catch (e) { return; }
      var d = g.getImageData(0, 0, w, h).data, l = new Float32Array(w * h), jetzt = performance.now();
      for (var i = 0; i < w * h; i++) l[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11;
      if (alt) {
        var sx = 0, n = 0;
        for (var y = 0; y < h * 0.75; y++) for (var x = 0; x < w; x++) { var j = y * w + x; if (Math.abs(l[j] - alt[j]) > (o.schwelle || 26)) { sx += x; n++; } }
        if (n > w * h * 0.025 && n < w * h * 0.5) verlauf.push([jetzt, sx / n / w]);
      }
      alt = l;
      while (verlauf.length && jetzt - verlauf[0][0] > 1600) verlauf.shift();
      var wechsel = 0, rich = 0;
      for (i = 1; i < verlauf.length; i++) {
        var dx = verlauf[i][1] - verlauf[i - 1][1];
        if (Math.abs(dx) > 0.03) { var nr = dx > 0 ? 1 : -1; if (rich && nr !== rich) wechsel++; rich = nr; }
      }
      if (wechsel >= 3 && jetzt - letzt > (o.pause || 4000)) { letzt = jetzt; verlauf = []; try { cb(); } catch (e) {} }
    }
    schritt();
    return function () { aus = true; clearTimeout(timer); };
  }

  window.Puppe = {
    winkeZurueck: winkeZurueck,
    kameraWinken: kameraWinken,
    erkenneFigur: erkenneFigur,
    winkKurve: winkKurve,
    erstelle: function (ziel, opt) {
      var e = typeof ziel === 'string' ? document.querySelector(ziel) : ziel;
      if (!e) throw new Error('Puppe: Element fehlt');
      return new Puppe(e, opt || {});
    },
    figuren: FIGUREN,
    zustaende: ZUSTAENDE.slice(),
    viseme: viseme,
    textZeiten: textZeiten,
    basis: BASIS
  };
})();
