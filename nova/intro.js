// Intro: kurzer Kino-Start (max. ~1,2 s) nur beim allerersten Öffnen einer App.
// Danach nie mehr (Merker im localStorage, pro App-Ordner). Tippen überspringt sofort.
// Bei «Bewegung reduzieren» (prefers-reduced-motion) gibt es kein Intro.
// <script src="../nova/intro.js" data-art="portal|funken" data-bild="bild.jpg" data-text="…" data-fokus="0.5,0.5" defer></script>
// portal: ein goldenes Loch öffnet sich und zieht dich in das Bild hinein.
// funken: Funkenregen, die Figur schwebt leuchtend herein.
(function () {
  var me = document.currentScript;
  var ART = (me && me.getAttribute('data-art')) || 'funken';
  var BILD = me && me.getAttribute('data-bild');
  var TEXT = (me && me.getAttribute('data-text')) || '';
  var FOKUS = ((me && me.getAttribute('data-fokus')) || '0.5,0.5').split(',').map(Number); // Punkt im Bild, der in die Mitte kommt
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Ein Merker pro App (Ordner), egal ob …/app/ oder …/app/index.html geöffnet wird.
  var KEY = 'nova_intro_gesehen:' + location.pathname.replace(/[^\/]*$/, '');
  try { if (localStorage.getItem(KEY)) return; localStorage.setItem(KEY, '1'); } catch (e) {}

  var DAUER = ART === 'portal' ? 950 : 850; // Animation in ms, danach 0,25 s Ausblenden
  var AUS = 250;
  var ov = document.createElement('div');
  ov.setAttribute('aria-hidden', 'true');
  ov.style.cssText = 'position:fixed;inset:0;z-index:2147483646;background:#050b1f;transition:opacity ' + AUS + 'ms ease;cursor:pointer;touch-action:none';
  var cv = document.createElement('canvas');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  ov.appendChild(cv);
  if (TEXT) {
    var tx = document.createElement('div');
    tx.textContent = TEXT;
    tx.style.cssText = 'position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom) + 12%);text-align:center;color:#f5c542;' +
      'font:600 22px/1.3 system-ui,-apple-system,sans-serif;letter-spacing:.5px;text-shadow:0 0 18px #f5c54299;opacity:0;' +
      'transform:translateY(8px);transition:opacity .35s ease .15s,transform .45s ease .15s;padding:0 24px';
    ov.appendChild(tx);
    requestAnimationFrame(function () { tx.style.opacity = '1'; tx.style.transform = 'none'; });
  }
  (document.body || document.documentElement).appendChild(ov);

  var ctx = cv.getContext('2d'), W, H, R, dpr = Math.min(2, window.devicePixelRatio || 1);
  function groesse() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); R = Math.hypot(W, H) / 2; }
  groesse(); addEventListener('resize', groesse);

  var img = null;
  if (BILD) { img = new Image(); img.decoding = 'async'; img.src = BILD; }
  var sterne = [], funken = [];
  for (var i = 0; i < 90; i++) sterne.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + .3, p: Math.random() * 6 });
  function funke(x, y, v, w) {
    if (funken.length > 260) return;
    funken.push({ x: x, y: y, vx: Math.cos(w) * v, vy: Math.sin(w) * v, l: 1, r: Math.random() * 2.5 + 1 });
  }

  var t0 = performance.now(), tl = t0, fertig = false;
  function weg(sofort) {
    if (fertig) return; fertig = true;
    removeEventListener('resize', groesse);
    if (sofort) {
      // sofort unsichtbar; die Fläche fängt den Rest dieses Tipps noch ab, damit kein Knopf darunter ausgelöst wird
      ov.style.transition = 'none'; ov.style.opacity = '0';
      setTimeout(function () { ov.remove(); }, 350);
      return;
    }
    ov.style.pointerEvents = 'none';
    ov.style.opacity = '0';
    setTimeout(function () { ov.remove(); }, AUS + 30);
  }
  // Tippen (oder eine Taste) überspringt sofort.
  function skip(e) { if (e && e.cancelable) e.preventDefault(); weg(true); }
  ov.addEventListener('pointerdown', skip);
  ov.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); weg(true); });
  addEventListener('keydown', function k() { removeEventListener('keydown', k); weg(true); });

  function bildIn(cx, cy, rad, zoom, alpha) {
    if (!img || !img.complete || !img.naturalWidth) return;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.clip();
    var s = Math.max(W / img.naturalWidth, H / img.naturalHeight) * zoom;
    ctx.drawImage(img, cx - img.naturalWidth * s * FOKUS[0], cy - img.naturalHeight * s * FOKUS[1], img.naturalWidth * s, img.naturalHeight * s);
    ctx.restore();
  }

  function bild(now) {
    if (fertig) return;
    var t = (now - t0) / DAUER; if (t > 1) t = 1; if (t < 0) t = 0;
    var dt = Math.min(3, Math.max(0, (now - tl) / 16.67)); tl = now; // Bewegung unabhängig von der Bildrate
    var cx = W / 2, cy = H * 0.45;
    ctx.fillStyle = '#050b1f'; ctx.fillRect(0, 0, W, H);
    // Sterne (beim Portal ziehen sie zur Mitte)
    ctx.fillStyle = '#fff';
    sterne.forEach(function (s) {
      var x = s.x * W, y = s.y * H;
      if (ART === 'portal' && t > .25) { var k = Math.min(1, (t - .25) * 1.6); x += (cx - x) * k * .5; y += (cy - y) * k * .5; }
      ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(now / 250 + s.p));
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (ART === 'portal') {
      // Loch wächst: erst klein und wirbelnd, dann saugt es alles ein
      var e = t < .3 ? (t / .3) * .18 : .18 + Math.pow((t - .3) / .7, 2.2) * 1.05;
      var rad = Math.max(2, e * R);
      for (var j = 0; j < 7; j++) {
        var w = now / 90 + j * 0.9 + Math.random();
        var raus = t > .3;
        funke(cx + Math.cos(w) * rad * 1.15, cy + Math.sin(w) * rad * 1.15, raus ? 3 + Math.random() * 5 : 2 + Math.random() * 2, raus ? w : w + Math.PI / 2);
      }
      var g = ctx.createRadialGradient(cx, cy, rad * .7, cx, cy, rad * 1.45);
      g.addColorStop(0, 'rgba(255,214,102,0)'); g.addColorStop(.45, 'rgba(255,214,102,.95)'); g.addColorStop(.6, 'rgba(255,170,40,.6)'); g.addColorStop(1, 'rgba(255,140,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rad * 1.45, 0, 7); ctx.fill();
      // Wirbel im Ring
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(now / 200);
      ctx.strokeStyle = 'rgba(255,240,190,.8)'; ctx.lineWidth = 2;
      for (var a = 0; a < 6; a++) { ctx.beginPath(); ctx.arc(0, 0, rad * 1.08, a, a + .6); ctx.stroke(); }
      ctx.restore();
      bildIn(cx, cy, rad, 1.25 - t * .25, Math.min(1, t * 3));
      if (t > .8) { ctx.fillStyle = 'rgba(255,240,200,' + ((t - .8) / .2 * .8) + ')'; ctx.fillRect(0, 0, W, H); }
    } else {
      // Funkenregen und die Figur schwebt herein
      if (t < .7) for (var k2 = 0; k2 < 6; k2++) funke(cx + (Math.random() - .5) * 40, cy + (Math.random() - .5) * 40, 3 + Math.random() * 7, Math.random() * 7);
      var e2 = 1 - Math.pow(1 - Math.min(1, t / .6), 3);
      var rr = Math.min(W, H) * .32 * e2;
      var g2 = ctx.createRadialGradient(cx, cy, rr * .8, cx, cy, Math.max(1, rr * 1.6));
      g2.addColorStop(0, 'rgba(245,197,66,.6)'); g2.addColorStop(1, 'rgba(245,197,66,0)');
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(cx, cy, rr * 1.6, 0, 7); ctx.fill();
      bildIn(cx, cy, rr, .55, e2);
      ctx.strokeStyle = 'rgba(245,197,66,' + e2 + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.stroke();
    }

    // Funken bewegen
    for (var n = funken.length - 1; n >= 0; n--) {
      var f = funken[n]; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += .06 * dt; f.l -= .03 * dt;
      if (f.l <= 0) { funken.splice(n, 1); continue; }
      ctx.globalAlpha = f.l; ctx.fillStyle = f.l > .6 ? '#fff6d0' : '#f5c542';
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * f.l, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (t >= 1) { weg(false); return; }
    requestAnimationFrame(bild);
  }
  requestAnimationFrame(bild);
})();
