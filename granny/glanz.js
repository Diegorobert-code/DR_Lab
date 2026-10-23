/* Rosa – Glanz (Runde 3, 19.10.2026): erster Eindruck, kleine Feiern, Tap-Gefühl, schöne Hinweise.
   Nur Ablauf und Optik. Keine Daten, nichts wird gesendet. */
(function () {
  'use strict';
  var G = window.Granny; if (!G || window.GrannyGlanz) return;
  var $ = function (id) { return document.getElementById(id); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var es = function () { return G.S.sprache === 'es'; };

  var css = document.createElement('style');
  css.textContent = [
    '.gl-konf{position:fixed;z-index:2147483600;pointer-events:none;width:10px;height:14px;border-radius:3px;left:0;top:0;will-change:transform,opacity;animation:glKonf var(--t,1.1s) cubic-bezier(.2,.7,.3,1) forwards}',
    '@keyframes glKonf{0%{opacity:1;transform:translate(var(--x0),var(--y0)) rotate(0) scale(.6)}100%{opacity:0;transform:translate(var(--x1),var(--y1)) rotate(var(--r)) scale(1)}}',
    '.gl-toast{position:fixed;left:16px;right:16px;margin:0 auto;width:fit-content;bottom:calc(104px + env(safe-area-inset-bottom));z-index:2147483500;max-width:480px;transform:translateY(24px);opacity:0;background:#fffaf0;color:#1b1f33;border-radius:20px;padding:16px 20px;font:600 18px/1.35 -apple-system,system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.4);transition:transform .3s cubic-bezier(.2,.8,.2,1),opacity .3s;display:flex;gap:12px;align-items:center}',
    '.gl-toast.da{transform:none;opacity:1}',
    '.gl-toast img{width:40px;height:40px;border-radius:50%;object-fit:cover;flex:none;border:2px solid #F2C14E}',
    '@media (prefers-reduced-motion:reduce){.gl-toast{transition:opacity .2s}}'
  ].join('\n');
  document.head.appendChild(css);

  function summ(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 10); } catch (e) {} }

  // Konfetti in Rosas Farben (nur transform/opacity, 60 fps)
  function feier(x, y, n) {
    if (ruhig) return;
    var farben = ['#F2C14E', '#E58FA8', '#8FD3A8', '#ffe08a', '#ffffff'];
    if (x == null) { x = innerWidth / 2; y = innerHeight * .35; }
    for (var i = 0; i < (n || 26); i++) {
      var k = document.createElement('i'); k.className = 'gl-konf';
      var w = Math.random() * Math.PI * 2, r = 70 + Math.random() * 130;
      k.style.background = farben[i % farben.length];
      k.style.setProperty('--x0', x + 'px'); k.style.setProperty('--y0', y + 'px');
      k.style.setProperty('--x1', (x + Math.cos(w) * r) + 'px'); k.style.setProperty('--y1', (y + Math.sin(w) * r + 90) + 'px');
      k.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg'); k.style.setProperty('--t', (0.9 + Math.random() * .6) + 's');
      document.body.appendChild(k); setTimeout(k.remove.bind(k), 1600);
    }
  }
  function mitte(el) { if (!el) return [null, null]; var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }

  // Freundlicher Hinweis statt Systemfenster
  var tt = null;
  function hinweis(text) {
    var alt = document.querySelector('.gl-toast'); if (alt) alt.remove();
    var d = document.createElement('div'); d.className = 'gl-toast'; d.setAttribute('role', 'status');
    var im = document.createElement('img'); im.src = 'figur.jpg'; im.alt = '';
    var s = document.createElement('span'); s.textContent = text;
    d.append(im, s); document.body.appendChild(d);
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('da'); }); });
    clearTimeout(tt); tt = setTimeout(function () { d.classList.remove('da'); setTimeout(function () { d.remove(); }, 350); }, 3800);
    summ(20);
  }
  window.alert = function (m) { hinweis(String(m)); };

  // 1) Begrüssung nach Tageszeit, Rosa winkt
  var h = new Date().getHours();
  var gt = $('glHalloText');
  if (gt) gt.textContent = es() ? (h < 12 ? '¡Buenos días!' : h < 20 ? '¡Buenas tardes!' : '¡Buenas noches!') : (h < 5 ? 'Guten Abend!' : h < 11 ? 'Guten Morgen!' : h < 18 ? 'Grüezi!' : 'Guten Abend!');
  var go = $('figurStartGo');
  if (go) go.addEventListener('click', function () {
    summ(12);
    // Rosa redet sofort (im Tipp, damit das iPhone den Ton erlaubt)
    var b = $('blase'); if (b && b.textContent) G.sag(b.textContent);
    setTimeout(function () { if (window.GrannyPlus) GrannyPlus.pose('winken'); }, 650);
  });

  // 2) Kleine Feiern bei Momenten, die zählen
  if (window.GrannyPlus) {
    var alt = GrannyPlus.pose;
    GrannyPlus.pose = function (name, dauer) {
      alt(name, dauer);
      if (name === 'merken' || name === 'herz' || name === 'nicken') { var m = mitte($('gfig')); feier(m[0], m[1], 18); summ([10, 40, 10]); }
    };
  }
  var sp = $('e_speichern');
  if (sp) sp.addEventListener('click', function () {
    var ok = $('e_ok'); if (ok && !ok.checked) { ok.closest('.kasten').scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'center' }); return; }
    setTimeout(function () {
      if ($('einst').classList.contains('offen') || !G.S.ok) return;
      var tw = document.querySelector('.gl-toast'); if (tw) tw.remove();
      scrollTo({ top: 0, behavior: ruhig ? 'auto' : 'smooth' });
      setTimeout(function () {
        var m = mitte($('gfig')); feier(m[0], m[1], 36); summ([12, 50, 12]);
        if (window.GrannyPlus) GrannyPlus.pose('lachen');
        G.sag(es() ? '¡Gracias! Ahora conozco a tu familia.' : 'Danke! Jetzt kenne ich deine Familie. Ich bin bereit.');
      }, 350);
    }, 450);
  });

  // 3) Spürbares Tippen
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.reden,.person,.hilfe,.klemmt,.erzaehl,.nachricht,.start button,.merk button,.album button');
    if (b) summ(8);
  }, true);

  // 4) «Für Angehörige»: lange drücken zeigt einen Fortschrittsstrich
  var a = $('angeh');
  if (a) {
    ['touchstart', 'mousedown'].forEach(function (ev) { a.addEventListener(ev, function () { a.classList.add('drueckt'); }, { passive: true }); });
    ['touchend', 'touchcancel', 'mouseup', 'mouseleave'].forEach(function (ev) { a.addEventListener(ev, function () { a.classList.remove('drueckt'); }); });
    a.addEventListener('click', function () { if (!$('einst').classList.contains('offen')) hinweis(es() ? 'Mantén pulsado un momento.' : 'Finger kurz draufhalten, dann geht es auf.'); });
  }

  window.GrannyGlanz = { feier: feier, hinweis: hinweis, summ: summ };
})();
