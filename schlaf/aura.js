/* Fias Nest – Fia im «Aura»-Look (23.10.): Diego will alle Figuren «völlig interaktiv beweglich wie in einem Trickfilm».
   Bühne: Nest im Mondbaum bei Nacht, ein weicher Schein hinter Fia, der mit dem Atem pulsiert, langsam treibende Lichtpunkte.
   Fia: atmet, gähnt ab und zu, reagiert auf Antippen (Flügel, Funken am Finger), zweimal tippen = kleiner Flug-Hüpfer.
   Nachts oder nach einer Minute Ruhe schläft sie; Antippen weckt sie mit einem Gähnen.
   Das bestehende #cover bleibt die Tippfläche (Streicheln, langes Drücken, Fias Satz und Stimme laufen wie bisher).
   Bei «weniger Bewegung» nur weiche Überblendungen, keine Hüpfer, keine Funken. Nichts verlässt das Gerät. */
(function () {
  'use strict';
  var cover = document.getElementById('cover'), home = document.getElementById('home');
  if (!cover || !home) return;
  var buehne = cover.closest('.buehne'); if (!buehne) return;
  var mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  function ruhig() { return !!(mq && mq.matches); }
  document.documentElement.classList.add('aura');

  /* Bühnenmass: Seitenverhältnis 358:300, Hintergrund «cover» bei 62 % senkrecht. Sitzplatz = vorderer Nestrand. */
  var AR = 300 / 358, CROP = (1 - AR) * 0.62;
  var SITZ = { x: 0.53, y: (0.636 - CROP) / AR };
  var POSEN = {
    sitzt:    { src: 'aura/fia-sitzt.webp',    w: 0.47, ax: 0.42, ay: 0.95 },
    fluegel:  { src: 'aura/fia-fluegel.webp',  w: 0.62, ax: 0.50, ay: 0.91 },
    gaehnt:   { src: 'aura/fia-gaehnt.webp',   w: 0.41, ax: 0.60, ay: 0.95 },
    schlaeft: { src: 'aura/fia-schlaeft.webp', w: 0.46, ax: 0.44, ay: 0.92 }
  };

  /* Ebenen bauen */
  function mk(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; e.setAttribute('aria-hidden', 'true'); return e; }
  buehne.style.setProperty('--ax', (SITZ.x * 100).toFixed(2) + '%');
  buehne.style.setProperty('--ay', (SITZ.y * 100).toFixed(2) + '%');
  var glow = mk('div', 'aura-glow'), figur = mk('div', 'aura-figur'), akt = mk('div', 'aura-akt'), vorne = mk('div', 'aura-vorne'), cv = mk('canvas', 'aura-funken');
  var IMG = {};
  Object.keys(POSEN).forEach(function (k) {
    var p = POSEN[k], im = mk('img', 'aura-pose'); im.alt = ''; im.decoding = 'async'; im.draggable = false; im.src = p.src; im.dataset.ersatz = '1';
    im.style.left = (SITZ.x * 100) + '%'; im.style.top = (SITZ.y * 100) + '%'; im.style.width = (p.w * 100) + '%';
    im.style.transform = 'translate(' + (-p.ax * 100) + '%,' + (-p.ay * 100) + '%)';
    akt.appendChild(im); IMG[k] = im;
  });
  figur.appendChild(akt);
  [glow, figur, vorne, cv].forEach(function (e) { buehne.insertBefore(e, cover); });

  /* Zustand */
  var pose = null, schlaf = false, belegt = 0, letzte = Date.now(), letzterTipp = 0, blitz = 0, wackel = 0, flug = null;
  function zeige(k, hops) {
    if (k === pose) return;
    Object.keys(IMG).forEach(function (n) { IMG[n].classList.toggle('an', n === k); });
    pose = k;
    if (hops !== false && !ruhig() && akt.animate) {
      akt.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-5px)', offset: .45 }, { transform: 'translateY(0)' }], { duration: 300, easing: 'ease-out' });
    }
  }
  function kurz(k, ms, danach) {
    var id = ++belegt; zeige(k);
    setTimeout(function () { if (id === belegt) { belegt = 0; zeige(danach || grund()); } }, ms);
  }
  function grund() { return schlaf ? 'schlaeft' : 'sitzt'; }
  function nacht() {
    try { if (typeof zeitStage === 'function' && zeitStage() === 3) return true; } catch (e) {}
    var st = document.body.dataset.stage; return st === '3' || st === 'glut';
  }
  function abend() { try { return typeof zeitStage === 'function' && zeitStage() >= 1; } catch (e) { return false; } }
  function einschlafen() { if (schlaf) return; schlaf = true; buehne.classList.add('aura-schlaf'); if (!belegt) kurz('gaehnt', 1200, 'schlaeft'); }
  function aufwachen() { schlaf = false; buehne.classList.remove('aura-schlaf'); kurz('gaehnt', 1200, 'sitzt'); }

  /* Funken und Lichtpunkte auf einer Leinwand */
  var ctx = cv.getContext && cv.getContext('2d'), W = 0, H = 0, DPR = 1, punkte = [], funken = [];
  function mass() {
    var r = buehne.getBoundingClientRect(); DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  }
  function neuerPunkt(start) {
    return { x: Math.random(), y: start ? Math.random() : 1.05, r: .8 + Math.random() * 1.6, v: .006 + Math.random() * .012,
      d: (Math.random() - .5) * .006, ph: Math.random() * 6.28, f: .4 + Math.random() * .8 };
  }
  for (var i = 0; i < 18; i++) punkte.push(neuerPunkt(true));
  function funkenBei(x, y, n, stark) {
    if (ruhig() || !ctx) return;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, s = (stark ? 60 : 35) + Math.random() * (stark ? 120 : 70);
      funken.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, t: 0, l: .55 + Math.random() * .45, r: 1.2 + Math.random() * 2.2,
        c: Math.random() < .5 ? '255,214,140' : (Math.random() < .5 ? '255,160,80' : '255,240,200') });
    }
  }

  /* Haupt-Takt: Atmen, Schein, Lichtpunkte, Funken */
  var laeuft = false, tAlt = 0, phase = 0;
  function sichtbar() { return !document.hidden && !home.hidden && home.offsetParent !== null; }
  function takt(t) {
    if (!sichtbar()) { laeuft = false; return; }
    var dt = Math.min(.05, tAlt ? (t - tAlt) / 1000 : .016); tAlt = t;
    var periode = schlaf ? 7 : 4.2; phase += dt / periode;
    var s = Math.sin(phase * Math.PI * 2);
    blitz = Math.max(0, blitz - dt * 1.6); wackel = Math.max(0, wackel - dt);
    if (!ruhig()) {
      var amp = schlaf ? .024 : .016, rot = wackel > 0 ? Math.sin(wackel * 22) * 4 * wackel : 0;
      figur.style.transform = 'rotate(' + rot.toFixed(2) + 'deg) scale(' + (1 - amp * .35 * s).toFixed(4) + ',' + (1 + amp * s).toFixed(4) + ')';
      glow.style.setProperty('--gs', (1 + .06 * s + blitz * .25).toFixed(3));
      glow.style.setProperty('--go', ((schlaf ? .3 : .68) + .12 * s + blitz * .6).toFixed(3));
    } else {
      figur.style.transform = ''; glow.style.setProperty('--gs', '1'); glow.style.setProperty('--go', schlaf ? '.3' : '.7');
    }
    if (ctx) {
      if (cv.width !== Math.round(W * DPR) || !W) mass();
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
      if (!ruhig()) {
        ctx.globalCompositeOperation = 'lighter';
        punkte.forEach(function (p, i) {
          p.y -= p.v * dt * (schlaf ? .6 : 1); p.x += p.d * dt + Math.sin(t / 2400 + p.ph) * .00025; p.ph += dt * p.f;
          if (p.y < -.05) punkte[i] = neuerPunkt(false);
          var a = (.25 + .35 * (.5 + .5 * Math.sin(p.ph * 2))) * (schlaf ? .6 : 1);
          var g = ctx.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, p.r * 4);
          g.addColorStop(0, 'rgba(255,226,160,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,200,120,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r * 4, 0, 6.283); ctx.fill();
        });
        funken = funken.filter(function (f) {
          f.t += dt; if (f.t > f.l) return false;
          f.vy += 140 * dt; f.vx *= .985; f.x += f.vx * dt; f.y += f.vy * dt;
          var a = 1 - f.t / f.l; ctx.fillStyle = 'rgba(' + f.c + ',' + a.toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (.6 + a * .6), 0, 6.283); ctx.fill(); return true;
        });
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    requestAnimationFrame(takt);
  }
  function starte() { if (laeuft || !sichtbar()) return; laeuft = true; tAlt = 0; mass(); requestAnimationFrame(takt); }

  /* Kleine Trickfilm-Bewegungen (Web Animations), nie bei «weniger Bewegung» */
  function spiel(frames, ms, ease) { if (ruhig() || !akt.animate) return null; return akt.animate(frames, { duration: ms, easing: ease || 'cubic-bezier(.3,.7,.4,1)' }); }
  function quetschen() {
    spiel([{ transform: 'scale(1,1)' }, { transform: 'scale(1.12,.86)', offset: .22 }, { transform: 'scale(.93,1.1) translateY(-10px)', offset: .5 },
      { transform: 'scale(1.03,.97)', offset: .78 }, { transform: 'scale(1,1)' }], 560);
  }
  function flugHuepfer() {
    if (flug) try { flug.cancel(); } catch (e) {}
    var id = ++belegt; zeige('fluegel', false);
    flug = spiel([{ transform: 'translate(0,0) rotate(0)' }, { transform: 'translate(0,4px) scale(1.06,.92)', offset: .1 },
      { transform: 'translate(-6px,-44px) rotate(-5deg)', offset: .38 }, { transform: 'translate(6px,-54px) rotate(4deg)', offset: .58 },
      { transform: 'translate(0,-30px) rotate(-2deg)', offset: .8 }, { transform: 'translate(0,2px) scale(1.06,.94)', offset: .92 }, { transform: 'translate(0,0)' }], 1300, 'ease-in-out');
    var r = buehne.getBoundingClientRect();
    funkenBei(SITZ.x * r.width, SITZ.y * r.height - 10, 16, true);
    setTimeout(function () { if (id === belegt) { belegt = 0; zeige(grund()); } }, 1350);
  }

  /* Fias Satz und Stimme wie bisher (fiaHallo), aber ohne die alten Funken in der Bildmitte und ohne das alte Winken */
  function sagen() {
    try {
      if (typeof fiaHallo !== 'function') return;
      var f = window.feiern; window.feiern = function () {};
      try { fiaHallo(); } finally { window.feiern = f; }
    } catch (e) {}
  }

  function tippen(x, y) {
    var jetzt = Date.now(); letzte = jetzt;
    if (schlaf) { aufwachen(); blitz = .5; funkenBei(x, y, 6, false); sagen(); return; }
    if (jetzt - letzterTipp < 650) { letzterTipp = 0; flugHuepfer(); blitz = 1; try { if (navigator.vibrate) navigator.vibrate([8, 30, 8]); } catch (e) {} return; }
    letzterTipp = jetzt;
    blitz = 1; quetschen(); funkenBei(x, y, 14, false); kurz('fluegel', 950);
    sagen();
  }

  /* Eingaben: Antippen der Figur (#cover) fangen wir ab, bevor die alten Winke-Handler laufen. Streicheln/Menü bleiben. */
  var down = null;
  buehne.addEventListener('pointerdown', function (e) { var r = buehne.getBoundingClientRect(); down = { x: e.clientX, y: e.clientY, rx: e.clientX - r.left, ry: e.clientY - r.top }; }, true);
  buehne.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.r6-laterne,.tipp')) return;
    var r = buehne.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    var bewegt = down && (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 12);
    if (e.target === cover) {
      e.stopPropagation();
      if (bewegt || cover.r8menue) { cover.r8menue = false; down = null; return; }
      if (!e.clientX && !e.clientY) { x = SITZ.x * r.width; y = SITZ.y * r.height - r.height * .2; }
      tippen(x, y);
    } else if (!bewegt) { letzte = Date.now(); funkenBei(x, y, 5, false); }
    down = null;
  }, true);
  buehne.addEventListener('keydown', function (e) {
    if (e.target !== cover || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault(); e.stopPropagation();
    var r = buehne.getBoundingClientRect(); tippen(SITZ.x * r.width, SITZ.y * r.height - r.height * .2);
  }, true);

  /* Streicheln (Runde 8 setzt kurz .r8-wohl auf #cover): Fia wiegt sich und glüht, schlafend bleibt sie schlafen */
  try {
    new MutationObserver(function () {
      if (cover.classList.contains('r8-wohl')) { letzte = Date.now(); wackel = schlaf ? .4 : .9; blitz = Math.max(blitz, schlaf ? .3 : .7); }
    }).observe(cover, { attributes: true, attributeFilter: ['class'] });
  } catch (e) {}

  /* Uhr: gähnen ab und zu, einschlafen nach einer Minute Ruhe (nachts schon nach 20 s), Schlafmodus nachts */
  var naechstesGaehnen = Date.now() + 8000;
  setInterval(function () {
    if (!sichtbar()) return;
    var jetzt = Date.now(), ruhe = jetzt - letzte;
    if (!schlaf && !belegt && ruhe > (nacht() ? 20000 : 60000)) { einschlafen(); return; }
    if (!schlaf && !belegt && jetzt > naechstesGaehnen) {
      kurz('gaehnt', 1200);
      naechstesGaehnen = jetzt + (abend() ? 9000 + Math.random() * 7000 : 14000 + Math.random() * 10000);
    }
  }, 1000);

  /* Auftritt, wenn die Startseite sichtbar wird */
  var aufgetreten = false;
  function aufStart() {
    if (!sichtbar()) return;
    letzte = Date.now();
    if (nacht()) { schlaf = true; buehne.classList.add('aura-schlaf'); if (!belegt && aufgetreten) zeige('schlaeft', false); } else if (schlaf && !aufgetreten) { schlaf = false; buehne.classList.remove('aura-schlaf'); }
    if (!aufgetreten) {
      aufgetreten = true; zeige(grund(), false);
      if (!ruhig()) {
        buehne.classList.add('auftritt'); setTimeout(function () { buehne.classList.remove('auftritt'); }, 1000);
        spiel([{ transform: 'translateY(26px) scale(.86)', opacity: 0 }, { transform: 'translateY(-8px) scale(1.04,.97)', opacity: 1, offset: .6 },
          { transform: 'translateY(2px) scale(.99,1.02)', offset: .82 }, { transform: 'none', opacity: 1 }], 900, 'cubic-bezier(.2,.8,.3,1)');
        blitz = .8;
      }
    } else if (!pose) zeige(grund(), false);
    starte();
  }
  try { new MutationObserver(aufStart).observe(home, { attributes: true, attributeFilter: ['hidden'] }); } catch (e) {}
  document.addEventListener('visibilitychange', function () { if (!document.hidden) aufStart(); });
  window.addEventListener('resize', function () { if (laeuft) mass(); });
  if (mq) { try { mq.addEventListener('change', function () { funken = []; }); } catch (e) {} }
  zeige(nacht() ? 'schlaeft' : 'sitzt', false);
  aufStart();

  /* Einführung: Fia im Aura-Look statt der alten Pose-Bilder */
  var onb = document.getElementById('onbFia');
  function onbAura(p) {
    if (!onb) return;
    var src = p === 'winkt' ? 'aura/fia-fluegel.webp' : 'aura/fia-nest.webp';
    onb.classList.add('aura-onb'); onb.removeAttribute('data-pose'); onb.dataset.ersatz = '1';
    if (onb.getAttribute('src') !== src) onb.src = src;
    if (!ruhig() && onb.animate) onb.animate([{ transform: 'scale(.94)', opacity: .6 }, { transform: 'scale(1.03)', opacity: 1, offset: .6 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'ease-out' });
  }
  if (typeof window.setPose === 'function') {
    var altPose = window.setPose;
    window.setPose = function (el, p) { if (el && el === onb) { onbAura(p); return; } return altPose.apply(this, arguments); };
  }
  if (onb) onbAura(onb.dataset.pose || 'winkt');

  window.FiaAura = { zeige: zeige, einschlafen: einschlafen, aufwachen: aufwachen, tippen: tippen, zustand: function () { return { pose: pose, schlaf: schlaf }; } };
})();
