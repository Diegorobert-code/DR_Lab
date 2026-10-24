// Musik-Spiegel: Beats aus dem Browser, ganz ohne Dateien. Jeder Aufruf mischt Stil, Tonart und Tempo neu,
// so gibt es endlos verschiedene Musik. Genauigkeit ist egal, Hauptsache vielfältig (Diego, 23.10.).
(function () {
  var ctx = null, haupt = null, laeuft = null, uhr = 0;
  var NOTEN = ['C', 'Cis', 'D', 'Es', 'E', 'F', 'Fis', 'G', 'As', 'A', 'B', 'H'];
  var SKALA = { moll: [0, 2, 3, 5, 7, 8, 10], dur: [0, 2, 4, 5, 7, 9, 11], dorisch: [0, 2, 3, 5, 7, 9, 10], phrygisch: [0, 1, 4, 5, 7, 8, 10], penta: [0, 3, 5, 7, 10, 12, 15] };
  function m(s) { return s.split('').map(function (c) { return c === 'x' ? 1 : c === 'o' ? 0.55 : 0; }); }
  // Muster: 16 Schritte (bei 3/4: 12). k = Kick, s = Snare/Clap, h = Hi-Hat, b = Bass-Stufen (Zahl = Skalenstufe, . = Pause).
  var STILE = [
    { name: 'Boom Bap', bpm: 90, swing: 0.22, skala: 'moll', k: 'x.....x...x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', b: '0.....0...3.....', akk: [0, 5, 3, 4], klang: 'piano', stimmung: 'rau, nickend, alte Schule' },
    { name: 'Trap', bpm: 142, halb: true, skala: 'moll', k: 'x......x..x.....', s: '........x.......', h: 'xxxxxxxxxxxxxxxx', roll: true, b: '0......0..0.....', bass808: true, akk: [0, 5, 6, 4], klang: 'glocke', stimmung: 'dunkel, schwer, modern' },
    { name: 'Lo-Fi', bpm: 76, swing: 0.28, skala: 'dorisch', k: 'x......xx.......', s: '....x.......x...', h: 'x.o.x.o.x.o.x.o.', b: '0.......4.......', akk: [0, 3, 1, 4], sieben: true, klang: 'rhodes', knistern: true, stimmung: 'warm, verträumt, Regen am Fenster' },
    { name: 'House', bpm: 124, skala: 'moll', k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x...x.', b: '..0...0...0..0..', akk: [0, 5, 3, 6], klang: 'piano', stimmung: 'tanzend, hell, Freitagnacht' },
    { name: 'Techno', bpm: 132, skala: 'phrygisch', k: 'x...x...x...x...', s: '................', h: '..x...x...x...xx', b: '0.00.00.0.00.00.', akk: [0], klang: 'saege', stimmung: 'hypnotisch, kühl, treibend' },
    { name: 'Drum & Bass', bpm: 172, skala: 'moll', k: 'x.........x.....', s: '....x.......x...', h: 'x.xxx.xxx.xxx.xx', b: '0.......0..3....', akk: [0, 5, 3, 4], klang: 'flaeche', stimmung: 'schnell, rollend, Adrenalin' },
    { name: 'Reggae', bpm: 74, skala: 'dur', k: '........x.......', s: '........x.......', h: 'x.x.x.x.x.x.x.x.', b: '0..0..4.....3...', skank: true, akk: [0, 3, 4, 3], klang: 'orgel', stimmung: 'entspannt, sonnig, schaukelnd' },
    { name: 'Afrobeat', bpm: 104, skala: 'dorisch', k: 'x.....x...x.....', s: '....x.......x.x.', h: 'xxoxxxoxxxoxxxox', b: '0..0.3..4..3.0..', akk: [0, 3], klang: 'zupf', schuettel: true, stimmung: 'warm, verspielt, Körper in Bewegung' },
    { name: 'Bossa Nova', bpm: 132, skala: 'dur', k: 'x..x x..x..x x..', s: 'x..x..x...x..x..', rim: true, h: 'xxxxxxxxxxxxxxxx', leise: true, b: '0...4...0...4...', akk: [1, 4, 0, 5], sieben: true, klang: 'zupf', stimmung: 'sanft, Strand, Abendlicht' },
    { name: 'Ambient', bpm: 60, skala: 'dur', k: '', s: '', h: '', b: '0...............', akk: [0, 5, 3, 4], sieben: true, klang: 'flaeche', lang: true, stimmung: 'weit, schwebend, still' },
    { name: 'Rock', bpm: 122, skala: 'moll', k: 'x.....x.x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', b: '0.0.0.0.5.5.3.3.', akk: [0, 5, 3, 4], klang: 'verzerrt', stimmung: 'kraftvoll, laut, Faust in der Luft' },
    { name: 'Walzer', bpm: 156, takt: 12, skala: 'dur', k: 'x...........', s: '....x...x...', h: '', b: '0...........', akk: [0, 3, 4, 0], klang: 'piano', stimmung: 'drehend, festlich, alt-elegant' },
    { name: 'Reggaeton', bpm: 94, skala: 'moll', k: 'x...x...x...x...', s: '...x..x....x..x.', h: 'x.x.x.x.x.x.x.x.', b: '0...0...5...5...', akk: [0, 5, 2, 6], klang: 'glocke', stimmung: 'heiss, sommerlich, Hüfte' },
    { name: 'Funk', bpm: 108, skala: 'dorisch', k: 'x..x..x...x.....', s: '....x..o....x..o', h: 'xxxxxxxxxxxxxxxx', b: '0..0.07.0..3.45.', akk: [0, 3], klang: 'orgel', stimmung: 'groovig, frech, Schultern wippen' },
    { name: 'Synthwave', bpm: 100, skala: 'moll', k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', b: '0000000055553333', arp: true, akk: [0, 5, 3, 4], klang: 'saege', stimmung: 'nostalgisch, Neon, Nachtfahrt' },
    { name: 'Dubstep', bpm: 140, halb: true, skala: 'phrygisch', k: 'x.........x.....', s: '........x.......', h: 'x...x...x...x...', b: '0.......0.......', wobble: true, akk: [0], klang: 'saege', stimmung: 'wuchtig, wild, bebend' },
    { name: 'Flamenco', bpm: 112, takt: 12, skala: 'phrygisch', k: 'x.....x.....', s: '..x..x...x.x', h: 'xxxxxxxxxxxx', b: '0.....4.....', akk: [0, 6, 5, 4], klang: 'zupf', stimmung: 'leidenschaftlich, stolz, feurig' },
    { name: 'Soul', bpm: 70, swing: 0.3, skala: 'dur', k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', b: '0...3...4...4...', akk: [0, 5, 3, 4], sieben: true, klang: 'orgel', stimmung: 'tief, gefühlvoll, Gänsehaut' },
    { name: 'Marsch', bpm: 112, skala: 'dur', k: 'x...x...x...x...', s: '..x...x.xxx...x.', h: '', b: '0...4...0...4...', akk: [0, 4, 0, 4], klang: 'blech', stimmung: 'aufrecht, stolz, vorwärts' },
    { name: 'Klavier allein', bpm: 66, skala: 'moll', k: '', s: '', h: '', b: '0.......5.......', akk: [0, 5, 3, 4], sieben: true, arp: true, klang: 'piano', lang: true, stimmung: 'nachdenklich, nah, verletzlich' },
    { name: 'Jersey Club', bpm: 140, skala: 'moll', k: 'x..x..x.x.x..x..', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', b: '0.....0...0.....', akk: [0, 6, 5, 4], klang: 'glocke', stimmung: 'hüpfend, verrückt, Energie' },
    { name: 'Kinderlied', bpm: 104, skala: 'dur', k: 'x.......x.......', s: '....x.......x...', h: '', b: '0...4...0...4...', melodie: true, akk: [0, 3, 4, 0], klang: 'glocke', stimmung: 'unschuldig, leicht, Spielplatz' }
  ];

  function start() {
    if (!ctx) { var A = window.AudioContext || window.webkitAudioContext; ctx = new A(); haupt = ctx.createGain(); haupt.gain.value = 0.5; haupt.connect(ctx.destination); }
    if (ctx.state === 'suspended') ctx.resume();
  }
  var rauschen = null;
  function rauschPuffer() {
    if (rauschen) return rauschen;
    rauschen = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = rauschen.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return rauschen;
  }
  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
  function huelle(g, t, a, lautst, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(lautst, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }

  function kick(t, z, tief) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(tief ? 120 : 150, t); o.frequency.exponentialRampToValueAtTime(tief ? 38 : 45, t + 0.12);
    huelle(g, t, 0.003, 0.9, tief ? 0.9 : 0.3); o.connect(g); g.connect(z); o.start(t); o.stop(t + 1);
  }
  function rausch(t, z, typ, f, lautst, d) {
    var q = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    q.buffer = rauschPuffer(); fl.type = typ; fl.frequency.value = f; huelle(g, t, 0.002, lautst, d);
    q.connect(fl); fl.connect(g); g.connect(z); q.start(t, Math.random() * 0.5); q.stop(t + d + 0.05);
  }
  function snare(t, z, rim) {
    if (rim) { ton(t, z, 1700, 'square', 0.08, 0.03); return; }
    rausch(t, z, 'bandpass', 1800, 0.45, 0.16); ton(t, z, 190, 'triangle', 0.25, 0.08);
  }
  function ton(t, z, f, welle, lautst, d, filter) {
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = welle; o.frequency.setValueAtTime(f, t);
    huelle(g, t, 0.005, lautst, d);
    if (filter) { var fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filter; o.connect(fl); fl.connect(g); } else o.connect(g);
    g.connect(z); o.start(t); o.stop(t + d + 0.1); return o;
  }
  // Instrument-Klänge für Akkorde und Melodie.
  function spiel(klang, t, f, d, z, lautst) {
    lautst = lautst || 0.12;
    if (klang === 'piano') { ton(t, z, f, 'triangle', lautst, d * 0.9); ton(t, z, f * 2, 'sine', lautst * 0.3, d * 0.5); }
    else if (klang === 'rhodes') { ton(t, z, f, 'sine', lautst * 1.2, d); ton(t, z, f * 3, 'sine', lautst * 0.15, d * 0.4); }
    else if (klang === 'glocke') { ton(t, z, f * 2, 'sine', lautst, d * 0.8); ton(t, z, f * 5.4, 'sine', lautst * 0.2, d * 0.3); }
    else if (klang === 'orgel') { ton(t, z, f, 'square', lautst * 0.4, d, 1800); ton(t, z, f * 2, 'sine', lautst * 0.5, d); }
    else if (klang === 'zupf') ton(t, z, f, 'sawtooth', lautst * 0.7, Math.min(d, 0.35), 2200);
    else if (klang === 'saege') ton(t, z, f, 'sawtooth', lautst * 0.6, d, 1400);
    else if (klang === 'verzerrt') { ton(t, z, f, 'square', lautst * 0.6, d, 2600); ton(t, z, f * 1.5, 'square', lautst * 0.4, d, 2600); }
    else if (klang === 'blech') ton(t, z, f, 'sawtooth', lautst * 0.7, d, 1100);
    else { var o = ton(t, z, f, 'sawtooth', lautst * 0.35, d, 900); o.detune.value = 8; ton(t, z, f, 'triangle', lautst * 0.5, d); }
  }

  function zufall(l) { return l[Math.floor(Math.random() * l.length)]; }
  // Ohne Wunsch: alle Stile gemischt der Reihe nach, erst danach wiederholt sich einer.
  var stapel = [];
  function naechsterStil() {
    if (!stapel.length) { stapel = STILE.slice(); for (var i = stapel.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = stapel[i]; stapel[i] = stapel[j]; stapel[j] = x; } }
    return stapel.pop();
  }

  function spielen(wahl) {
    start(); stopp();
    var st = typeof wahl === 'number' ? STILE[wahl % STILE.length] : wahl ? STILE.filter(function (s) { return s.name.toLowerCase().indexOf(String(wahl).toLowerCase()) >= 0; })[0] || naechsterStil() : naechsterStil();
    var grund = 45 + Math.floor(Math.random() * 12), skala = SKALA[st.skala] || SKALA.moll;
    var bpm = Math.round(st.bpm * (0.94 + Math.random() * 0.12)), schritte = st.takt || 16;
    var schritt = 60 / bpm / (st.takt ? 3 : 4) * (st.halb ? 1 : 1);
    var z = ctx.createGain(); z.gain.value = st.leise ? 0.7 : 1; z.connect(haupt);
    var muster = { k: m((st.k || '').replace(/ /g, '.')), s: m(st.s || ''), h: m(st.h || '') };
    // Kleine Zufallsänderungen, damit derselbe Stil nie genau gleich klingt.
    if (muster.h.length && Math.random() < 0.5) muster.h[Math.floor(Math.random() * schritte)] = 0.55;
    if (muster.k.length && Math.random() < 0.4) muster.k[2 + 4 * Math.floor(Math.random() * (schritte / 4))] = 0.7;
    var stufe = function (n, okt) { return grund + 12 * (okt || 0) + skala[((n % 7) + 7) % 7] + 12 * Math.floor(n / 7); };
    var takt = 0, nr = 0, naechste = ctx.currentTime + 0.1, wobbel = null;
    if (st.knistern) { var kn = ctx.createBufferSource(), kf = ctx.createBiquadFilter(), kg = ctx.createGain(); kn.buffer = rauschPuffer(); kn.loop = true; kf.type = 'highpass'; kf.frequency.value = 3000; kg.gain.value = 0.025; kn.connect(kf); kf.connect(kg); kg.connect(z); kn.start(); }
    laeuft = { z: z, stil: st };
    function planen() {
      while (naechste < ctx.currentTime + 0.2) {
        var i = nr % schritte, t = naechste + (i % 2 ? (st.swing || 0) * schritt : 0);
        var akk = st.akk[takt % st.akk.length];
        if (muster.k[i]) kick(t, z, st.bass808);
        if (muster.s[i]) snare(t, z, st.rim);
        if (muster.h[i]) { rausch(t, z, 'highpass', 8000, 0.12 * muster.h[i], 0.04); if (st.roll && i % 8 === 7 && Math.random() < 0.5) { rausch(t + schritt / 2, z, 'highpass', 8000, 0.08, 0.03); } }
        if (st.schuettel) rausch(t, z, 'highpass', 6000, 0.04, 0.03);
        var b = (st.b || '')[i];
        if (b && b !== '.' && b !== ' ') {
          var bf = hz(stufe(akk + Number(b), -1));
          if (st.bass808) ton(t, z, bf / 2, 'sine', 0.6, schritt * 6);
          else if (st.wobble) { var wo = ton(t, z, bf / 2, 'sawtooth', 0.35, schritt * 8, 400); wobbel = wo; }
          else ton(t, z, bf, st.klang === 'verzerrt' ? 'square' : 'triangle', 0.35, schritt * 1.8, 600);
        }
        if (i === 0) {
          var dauer = schritt * schritte * (st.lang ? 1 : 0.9), toene = [0, 2, 4].concat(st.sieben ? [6] : []);
          if (!st.skank && !st.arp && !st.melodie) toene.forEach(function (n) { spiel(st.klang, t, hz(stufe(akk + n)), dauer, z, 0.08); });
          if (st.lang) toene.forEach(function (n) { spiel('flaeche', t, hz(stufe(akk + n, 1)), dauer, z, 0.05); });
        }
        if (st.skank && i % 4 === 2) [0, 2, 4].forEach(function (n) { spiel(st.klang, t, hz(stufe(akk + n, 1)), schritt * 0.8, z, 0.07); });
        if (st.arp && i % 2 === 0) spiel(st.klang, t, hz(stufe(akk + [0, 2, 4, 7, 4, 2][(i / 2) % 6], 1)), schritt * 2, z, 0.06);
        if (st.melodie && i % 4 === 0) spiel(st.klang, t, hz(stufe(akk + zufall([0, 2, 4, 5]), 1)), schritt * 3, z, 0.09);
        if (wobbel && i % 2 === 0) try { wobbel.frequency.setValueAtTime(hz(stufe(akk, -2)) * (i % 4 ? 1 : 1.01), t); } catch (e) {}
        nr++; if (i === schritte - 1) takt++;
        naechste += schritt;
      }
    }
    planen(); uhr = setInterval(planen, 50);
    return { stil: st.name, bpm: bpm, tonart: NOTEN[grund % 12] + (st.skala === 'dur' ? '-Dur' : '-' + st.skala), stimmung: st.stimmung };
  }
  function stopp() {
    clearInterval(uhr); uhr = 0;
    if (laeuft) { var z = laeuft.z; try { z.gain.setTargetAtTime(0, ctx.currentTime, 0.15); setTimeout(function () { z.disconnect(); }, 800); } catch (e) {} laeuft = null; }
  }
  // Leiser, solange Nova spricht.
  function leise(ja) { if (haupt) haupt.gain.setTargetAtTime(ja ? 0.12 : 0.5, ctx.currentTime, 0.2); }
  window.NovaBeats = { spielen: spielen, stopp: stopp, leise: leise, stile: STILE.map(function (s) { return s.name; }), start: start };
})();
