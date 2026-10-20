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
      arm: { seite: 'rechts', fell: '#9a6230', fellHell: '#d29a58', haut: '#f0c39a', x: 0.81, y: 0.99, groesse: 0.40 },
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
      glow: '#ff9a4a'
    }
  };

  // ---------- kleine Helfer ----------
  function klemme(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function glatt(a, b, x) { var t = klemme((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function zufall(a, b) { return a + Math.random() * (b - a); }
  // weiches «Rauschen» aus Sinus-Wellen mit krummen Frequenzen: wirkt organisch, nie mechanisch
  function rausch(t, s) { return (Math.sin(t * 0.61 + s) * 0.5 + Math.sin(t * 1.37 + s * 2.1) * 0.3 + Math.sin(t * 2.71 + s * 3.7) * 0.2); }
  function el(tag, cls, eltern) { var e = document.createElement(tag); if (cls) e.className = cls; if (eltern) eltern.appendChild(e); return e; }

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
    ' vec3 c=texture2D(B,p).rgb;',
    ' if(dk>0.0){vec3 h=texture2D(B,lq).rgb*0.93;c=mix(c,h,dk);}',
    ' c=mix(c,vec3(0.13,0.07,0.04),wim*0.85);',
    ' c=mix(c,uInnen,tief*0.75);',
    ' c=mix(c,c*0.6,lip);',
    // Licht: leichter Glow und eine weiche Lichtwelle (Hologramm)
    ' float band=fract(uZeit*0.09)*1.8-0.4;',
    ' c+=uGlow*uWelle*0.10*exp(-pow((v.y-band)*9.0,2.0));',
    ' c*=1.0+0.05*uGlanz;',
    ' float r=distance(v,vec2(0.5,0.5));',
    ' float m=1.0-smoothstep(0.36,0.5,r);m*=1.0-smoothstep(0.84,1.0,v.y);',
    ' c+=uGlow*0.22*uGlanz*smoothstep(0.30,0.44,r)*m;',
    ' gl_FragColor=vec4(c*m,m);',
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
    ['px', 'uKopf', 'uHals', 'uNeig', 'uKopfV', 'uAtem', 'uAL', 'uAR', 'uLid', 'uBlick', 'uFroh', 'uME', 'uMF', 'uAus', 'uMax', 'uMund', 'uPresse', 'uInnen', 'uZeit', 'uWelle', 'uGlanz', 'uGlow']
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
    ['augen', 'mund', 'kopf', 'hals', 'innen', 'arm', 'glow', 'name', 'aus', 'augenZu'].forEach(function (n) { if (opt[n]) this.f[n] = opt[n]; }, this);
    if (opt.arm && vorlage.arm) { var a = {}; for (k in vorlage.arm) a[k] = vorlage.arm[k]; for (k in opt.arm) a[k] = opt.arm[k]; this.f.arm = a; }
    this.f.augen = this.f.augen || [[0.38, 0.45, 0.07, 0.07], [0.62, 0.45, 0.07, 0.07]];
    this.f.mund = this.f.mund || { l: [0.42, 0.68], r: [0.58, 0.68], oben: 0.006, unten: 0.012, kinn: 0.07 };
    this.f.kopf = this.f.kopf || [0.5, 0.45, 0.4]; this.f.hals = this.f.hals || [0.5, 0.92];
    this.f.innen = this.f.innen || [0.28, 0.06, 0.07]; this.f.glow = this.f.glow || '#f2c14e';
    this.f.arm = this.f.arm || { seite: 'rechts', fell: '#7a4a24', fellHell: '#b07a42', haut: '#e3ad84', x: 0.84, y: 1.05, groesse: 0.36 };
    this.ruhe = RM.matches || opt.ruhig === true;
    this.modus = 'laden';
    this._zustand = 'ruhig'; this._vorher = 'ruhig'; this.zustandSeit = 0;
    this.t = 0; this.effekte = []; this.partikel = [];
    var F = function (w, k, d) { return new Feder(w, k, d); };
    this.p = {
      neig: F(0, 70, 11), kx: F(0, 90, 14), ky: F(0, 90, 14), lean: F(0, 18, 7), leanR: F(0, 22, 8),
      sq: F(0, 260, 11), laecheln: F(0, 60, 12), lid: F(0, 120, 18), froh: F(0, 70, 14),
      bx: F(0, 420, 34), by: F(0, 420, 34), glanz: F(1, 30, 10), arm: F(0, 55, 11), ellb: F(0, 190, 7),
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
      self.reagiere('tipp', { x: e.clientX - r.left, y: e.clientY - r.top });
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

    if (window.DeviceOrientationEvent) {
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
      if (self.sichtbar && !self.weg) self._tick(dt);
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
      self.bild = bild;
      var cv = el('canvas', 'pp-bild', k);
      try { self.gl = new GLBild(cv, bild); self.cv = cv; }
      catch (e) {
        cv.remove(); self.gl = null;
        var img = el('img', 'pp-bild pp-einfach', k); img.src = bild.src; img.alt = self.f.name || '';
      }
      self._baueArm();
      self.groesse();
    });
  };

  Puppe.prototype._baueArm = function () {
    var a = this.f.arm, b = armBilder(a);
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
      E.tempo = wk.tempo || (fluegel ? 2.4 : 1.6);
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
      else bild(armR, E.arm);
      self.mundJetzt = null; self.mundSeit = 0;
      self.p.schwing = new Feder(0, 260, 17);
    });
  };

  Puppe.prototype.groesse = function () {
    var r = this.el.getBoundingClientRect(), W = r.width || 300, H = r.height || 400;
    var s = Math.min(W * 0.92, H * 0.78);
    this.box = s; this.W = W; this.H = H;
    this.figur.style.width = this.figur.style.height = s + 'px';
    this.figur.style.left = ((W - s) / 2) + 'px';
    this.figur.style.top = (H * 0.84 - s) + 'px';
    if (this.arm) {
      var g = this.f.arm.groesse * s, ho = g * 0.62, wo = ho * 160 / 260, hu = g * 0.95, wu = hu * 200 / 340, A = this.arm;
      A.ober.style.cssText += ';width:' + wo + 'px;height:' + ho + 'px;left:' + (-wo / 2) + 'px;top:' + (-ho) + 'px';
      A.unter.style.cssText += ';width:' + wu + 'px;height:' + hu + 'px;left:' + (wo / 2 - wu / 2) + 'px;top:' + (ho * 60 / 260 - hu * 290 / 340) + 'px';
    }
    this.boden.style.top = (H * 0.84) + 'px';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (this.cv) { var px = Math.round(s * dpr); if (this.cv.width !== px) { this.cv.width = this.cv.height = px; } }
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

  // ---------- Reden ----------
  Puppe.prototype._audioStart = function (a) {
    if (this.weg) return;
    var self = this;
    if (this.audio && this.audio.el === a) { this.zustand('redet'); return; }
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
    this.zustand('redet');
  };
  // Audio mit optionalen ElevenLabs-Zeitstempeln abspielen (alignment oder normalized_alignment)
  Puppe.prototype.sage = function (a, alignment) {
    if (typeof a === 'string') { var u = new Audio(a); a = u; }
    if (alignment) { var al = alignment.normalized_alignment || alignment.alignment || alignment; this.timeline = { audio: a, al: al }; }
    else if (this.timeline && (this.timeline.audio === a || this.timeline.uhr)) this.timeline = null;
    entsperren();
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
      ziel.arm = 1; ziel.laecheln = 0.85; ziel.froh = 0.3; ziel.neig = 0.07 * this.arm_spiegel() + Math.sin(t * 6.2) * 0.012 * bew; ziel.glanz = 1.35; ziel.auf = -0.1; ziel.bx = 0; ziel.by = 0;
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
    var add = { neig: 0, kx: 0, ky: 0, laecheln: 0, froh: 0, auf: 0, breit: 0, rund: 0, by: 0, glanz: 0 };
    for (var i = this.effekte.length - 1; i >= 0; i--) {
      var e = this.effekte[i], kk = (t - e.start) / e.dauer;
      if (kk >= 1) { this.effekte.splice(i, 1); continue; }
      e.fn(add, kk);
    }
    for (k in add) if (P[k]) P[k].z += add[k];

    // Winken: Unterarm schwingt, Feder lässt ihn nachschwingen
    var welle = 0, ws = t - (this.winkStart || 0), zyk = ws % 3.6;
    if (z === 'winkt') welle = zyk < 2.4 ? Math.sin(zyk * Math.PI * 2 * 1.55) * glatt(0, 0.35, zyk) : 0;
    P.ellb.z = welle * P.arm.x;
    // Ebenen: Schulter-Schwung als eigene, ruhigere Feder (kein Aufschaukeln), Tempo je Figur (Flügel schneller)
    if (P.schwing) P.schwing.z = z === 'winkt' && zyk < 2.4 ? Math.sin(zyk * Math.PI * 2 * this.ebenen.tempo) * glatt(0, 0.35, zyk) * P.arm.x : 0;

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
    var S = this.box, sq = P.sq.x, schweb = ruhe ? 0 : Math.sin(t * 1.1) * S * 0.008;
    var px = P.parX.x, py = P.parY.x, nah = P.naeher.x;
    var tf = 'translate3d(' + (P.lean.x * S + px * S * 0.02).toFixed(2) + 'px,' + (h.y * S * 1.6 + schweb + py * S * 0.012).toFixed(2) + 'px,0) ' +
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
      this.arm.ober.style.transform = 'translateY(' + ((1 - ar) * 70).toFixed(1) + '%) rotate(' + (sp * mix(50, 13, ar)).toFixed(2) + 'deg)';
      this.arm.unter.style.transform = 'rotate(' + (sp * (mix(45, -6, ar) + P.ellb.x * 26)).toFixed(2) + 'deg)';
    }

    var w = {
      kopf: this.f.kopf, hals: this.f.hals, neig: P.neig.x, kx: P.kx.x, ky: P.ky.x - atem * 0.0025,
      atem: atem, augen: this.f.augen, lidL: lid, lidR: Math.max(P.lid.x, b.start >= 0 ? klemme(lidB * 1.1 - 0.05, 0, 1) : 0),
      bx: P.bx.x, by: P.by.x, froh: klemme(P.froh.x, 0, 1), mund: this.f.mund, aus: this.f.aus || [0.5, 0.5, 1],
      auf: klemme(P.auf.x, -1, 1.2), breit: klemme(P.breit.x, 0, 1.2), rund: klemme(P.rund.x, 0, 1.3), laecheln: klemme(P.laecheln.x, -0.5, 1.3), presse: klemme(P.presse.x, 0, 1),
      innen: this.f.innen, zeit: t, welle: ruhe ? 0 : 1, glanz: P.glanz.x, glow: this._glowRGB || (this._glowRGB = hexRGB(this.f.glow))
    };
    // Bild mit geschlossenen Augen (z.B. Fia): keine Lider, kein Blick
    if (this.f.augenZu && !this.ebenen) { w.lidL = w.lidR = 0; w.froh = 0; w.bx = w.by = 0; }
    if (this.gl) this.gl.zeichne(w);
    else if (this.ebenen) this._zeichneEbenen(w, P);
    else if (this.koerper.firstChild) this.koerper.firstChild.style.transform = 'rotate(' + (w.neig * 20).toFixed(2) + 'deg)';

    this._zeichneStaub(dt, px, py);
    this._zeichneFunken(dt, px);

    // lange keine Berührung → Figur winkt freundlich (nur wenn gewünscht)
    if (this.opt.pauseNach && performance.now() - this.letzteAktivitaet > this.opt.pauseNach * 1000 && z !== 'schlaeft' && z !== 'redet') this.reagiere('pause');
  };
  Puppe.prototype.arm_spiegel = function () { return this.arm ? this.arm.spiegel : 1; };

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

  window.Puppe = {
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
