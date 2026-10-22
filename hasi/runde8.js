/* Runde 8 (22.10.2026): polieren, interaktiv, Layout- und Technik-Ideen aus Top-Apps. Erzeugt aus kern8 + App-Teil. */
window.R8_CFG = {"k":"hasi","offlineText":"Offline. Hasis Laden bleibt offen."};
/* Runde 8 – gemeinsamer Kern: Rückgängig-Toast, weiche Wechsel (View Transitions), Kategorienleiste, Wischen, Offline-Hinweis.
   Baut auf window.R7 auf (runde7.js). Nur lokal, keine Daten verlassen das Gerät. */
(function () {
  'use strict';
  if (window.R8) return;
  var C = window.R8_CFG || {};
  var ruhig = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; }

  var css = [
    '.r8-toast{position:fixed;left:50%;bottom:calc(104px + env(safe-area-inset-bottom));z-index:2147483300;display:flex;align-items:center;gap:12px;width:max-content;max-width:min(520px,calc(100vw - 32px));box-sizing:border-box;padding:8px 8px 8px 16px;border-radius:999px;background:#13224f;border:1px solid rgba(242,193,78,.55);color:#fffaf0;font:600 16px/1.3 system-ui,-apple-system,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45);transform:translate(-50%,24px);opacity:0;transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .2s;pointer-events:none}',
    '.r8-toast.an{transform:translate(-50%,0);opacity:1;pointer-events:auto}',
    '.r8-toast span{flex:1;min-width:0}',
    '.r8-toast button{flex:none;min-height:44px;min-width:44px;padding:0 16px;border-radius:999px;border:0;background:#f2c14e;color:#14204a;font:800 15px/1 system-ui,-apple-system,sans-serif;cursor:pointer}',
    '.r8-toast button[hidden]{display:none}',
    /* Kategorienleiste (wie Airbnb) */
    '.r8-leiste{position:sticky;top:0;z-index:50;margin:0 0 8px;padding:8px 16px calc(8px);display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;background:rgba(7,13,36,.82);-webkit-backdrop-filter:blur(14px) saturate(1.3);backdrop-filter:blur(14px) saturate(1.3);border-bottom:1px solid rgba(242,193,78,.18);scroll-snap-type:x proximity}',
    '.r8-leiste::-webkit-scrollbar{display:none}',
    '.r8-leiste a{flex:none;scroll-snap-align:start;display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border-radius:999px;color:#dfe5fb;text-decoration:none;font:700 15px/1 system-ui,-apple-system,sans-serif;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);transition:background .2s,color .2s,border-color .2s}',
    '.r8-leiste a[aria-current="true"]{background:linear-gradient(180deg,#ffd977,#f2c14e);color:#14204a;border-color:transparent}',
    '.r8-leiste a span{font-size:18px}',
    /* Offline */
    '.r8-offline{position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top));transform:translate(-50%,-140%);z-index:2147483300;padding:8px 16px;border-radius:999px;background:#2b2a1a;border:1px solid #f2c14e;color:#ffe08a;font:700 14px/1.3 system-ui,-apple-system,sans-serif;transition:transform .3s;max-width:calc(100vw - 32px);text-align:center}',
    '.r8-offline.an{transform:translate(-50%,0)}',
    /* Wischen */
    '.r8-wisch{touch-action:pan-y;transition:transform .25s cubic-bezier(.2,.8,.2,1),opacity .25s;will-change:transform}',
    '.r8-wisch.zieht{transition:none}',
    '::view-transition-old(root),::view-transition-new(root){animation-duration:.28s}',
    '@media (prefers-reduced-motion:reduce){.r8-toast,.r8-offline,.r8-wisch,.r8-leiste a{transition:none!important}}'
  ].join('\n');
  var st = document.createElement('style'); st.id = 'r8-stil'; st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ---------- Weicher Wechsel (View Transitions API, sonst sofort) ---------- */
  function vt(fn) {
    if (!ruhig && document.startViewTransition) { try { document.startViewTransition(fn); return; } catch (e) {} }
    fn();
  }

  /* ---------- Rückgängig-Toast (wie Gmail «Rückgängig») ---------- */
  var toastEl = null, toastT = null;
  function toast(text, o) {
    o = o || {};
    if (!toastEl) {
      toastEl = el('<div class="r8-toast" role="status" aria-live="polite"><span></span><button type="button">Rückgängig</button></div>');
      document.body.appendChild(toastEl);
    }
    var b = toastEl.querySelector('button');
    toastEl.querySelector('span').textContent = text;
    b.hidden = !o.undo; b.textContent = o.knopf || 'Rückgängig';
    b.onclick = function () { weg(); if (o.undo) o.undo(); };
    clearTimeout(toastT);
    requestAnimationFrame(function () { toastEl.classList.add('an'); });
    toastT = setTimeout(weg, o.ms || (o.undo ? 5000 : 2400));
    function weg() { clearTimeout(toastT); toastEl.classList.remove('an'); }
  }

  /* ---------- Kategorienleiste mit Mitlaufen (wie Airbnb) ---------- */
  function leiste(defs, vor) {
    var ziele = defs.map(function (d) { return { d: d, el: typeof d.ziel === 'string' ? document.querySelector(d.ziel) : d.ziel }; }).filter(function (x) { return x.el; });
    if (ziele.length < 3) return null;
    var nav = el('<nav class="r8-leiste" aria-label="Schnell springen"></nav>');
    ziele.forEach(function (z, i) {
      if (!z.el.id) z.el.id = 'r8z-' + i;
      z.el.style.scrollMarginTop = '72px';
      var a = el('<a href="#' + esc(z.el.id) + '"><span aria-hidden="true">' + z.d.e + '</span>' + esc(z.d.n) + '</a>');
      a.addEventListener('click', function (e) {
        e.preventDefault();
        z.el.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
        markiere(a);
        try { history.replaceState(null, '', '#' + z.el.id); } catch (x) {}
      });
      z.a = a; nav.appendChild(a);
    });
    function markiere(a) {
      ziele.forEach(function (z) { if (z.a === a) z.a.setAttribute('aria-current', 'true'); else z.a.removeAttribute('aria-current'); });
      var r = a.getBoundingClientRect(), n = nav.getBoundingClientRect();
      if (r.left < n.left || r.right > n.right) nav.scrollTo({ left: nav.scrollLeft + r.left - n.left - 16, behavior: ruhig ? 'auto' : 'smooth' });
    }
    if (vor && vor.parentNode) vor.parentNode.insertBefore(nav, vor);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var z = ziele.filter(function (x) { return x.el === e.target; })[0]; if (z) markiere(z.a); } });
      }, { rootMargin: '-20% 0px -70% 0px' });
      ziele.forEach(function (z) { io.observe(z.el); });
    }
    return nav;
  }

  /* ---------- Wischen nach links/rechts (wie Mail «Wischen zum Erledigen») ---------- */
  function wisch(k, o) {
    k.classList.add('r8-wisch');
    var x0 = null, y0 = null, dx = 0, aktiv = false;
    k.addEventListener('pointerdown', function (e) { if (e.button) return; x0 = e.clientX; y0 = e.clientY; dx = 0; aktiv = false; }, { passive: true });
    k.addEventListener('pointermove', function (e) {
      if (x0 == null) return;
      var nx = e.clientX - x0, ny = e.clientY - y0;
      if (!aktiv) { if (Math.abs(nx) > 12 && Math.abs(nx) > Math.abs(ny) * 1.3) { aktiv = true; k.classList.add('zieht'); try { k.setPointerCapture(e.pointerId); } catch (x) {} } else if (Math.abs(ny) > 12) { x0 = null; return; } else return; }
      dx = nx; k.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 30).toFixed(1) + 'deg)';
      if (o.zeig) o.zeig(dx);
    }, { passive: true });
    function ende() {
      if (x0 == null) return; x0 = null; k.classList.remove('zieht');
      if (!aktiv) return;
      var w = k.offsetWidth * 0.33;
      if (dx > w && o.rechts) { k.style.transform = 'translateX(120%) rotate(8deg)'; k.style.opacity = '0'; setTimeout(function () { o.rechts(); }, ruhig ? 0 : 220); }
      else if (dx < -w && o.links) { k.style.transform = 'translateX(-120%) rotate(-8deg)'; k.style.opacity = '0'; setTimeout(function () { o.links(); }, ruhig ? 0 : 220); }
      else { k.style.transform = ''; if (o.zeig) o.zeig(0); }
      k._gewischt = true; setTimeout(function () { k._gewischt = false; }, 50);
    }
    k.addEventListener('pointerup', ende); k.addEventListener('pointercancel', ende);
  }

  /* ---------- Offline-Hinweis ---------- */
  var offEl = null;
  function offline() {
    if (!offEl) { offEl = el('<div class="r8-offline" role="status" aria-live="polite"></div>'); document.body.appendChild(offEl); }
    if (navigator.onLine === false) { offEl.textContent = C.offlineText || 'Offline. Alles Wichtige geht trotzdem.'; offEl.classList.add('an'); }
    else if (offEl.classList.contains('an')) { offEl.textContent = 'Wieder online ✓'; setTimeout(function () { offEl.classList.remove('an'); }, 1800); }
  }
  addEventListener('online', offline); addEventListener('offline', offline);


  /* ---------- «Wächst mit dir» (Vorbild: Finch) – Lichter, 5 Stufen, Ausflug mit Fundstück, Album, Ruhetag ---------- */
  var W8 = null;
  function wk(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function whol() { try { return JSON.parse(localStorage.getItem('r8.waechst.' + W8.k)) || {}; } catch (e) { return {}; } }
  function wleg(s) { try { localStorage.setItem('r8.waechst.' + W8.k, JSON.stringify(s)); } catch (e) {} }
  function stufe(n) { var s = 0; W8.stufen.forEach(function (x, i) { if (n >= x[0]) s = i; }); return s; }
  function serie(s) {
    var tage = s.tage || {}, n = 0, ruhe = {}, d = new Date();
    if (!tage[wk(d)]) d.setDate(d.getDate() - 1);
    for (var i = 0; i < 120; i++) {
      var k = wk(d);
      if (tage[k]) n++;
      else { var m = new Date(d); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); var w = wk(m); if (n > 0 && !ruhe[w]) ruhe[w] = 1; else break; }
      d.setDate(d.getDate() - 1);
    }
    return n;
  }
  function sprich(t) {
    if (W8.stumm) return;
    try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'de-CH'; u.rate = .92; var v = speechSynthesis.getVoices().filter(function (x) { return /^de/.test(x.lang); }); if (v.length) u.voice = v.filter(function (x) { return x.lang === 'de-CH'; })[0] || v[0]; speechSynthesis.speak(u); } catch (e) {}
  }
  function licht(grund) {
    if (!W8) return;
    var s = whol(), h = wk();
    s.heute = s.heute && s.heute.d === h ? s.heute : { d: h, n: 0, g: {} };
    var g = String(grund || 'x');
    if ((s.heute.g[g] || 0) >= (W8.proGrund || 3) || s.heute.n >= (W8.proTag || 15)) return;
    s.heute.g[g] = (s.heute.g[g] || 0) + 1; s.heute.n++;
    var vor = stufe(s.n || 0);
    s.n = (s.n || 0) + 1; s.tage = s.tage || {}; s.tage[h] = 1;
    var ks = Object.keys(s.tage).sort(); while (ks.length > 120) delete s.tage[ks.shift()];
    if (!s.reise && s.ausflugTag !== h) s.reise = { ab: Date.now() };
    wleg(s);
    var neu = stufe(s.n);
    wZeigen(true);
    if (neu > vor) {
      toast(W8.lichtE + ' ' + W8.name + ' ist jetzt: ' + W8.stufen[neu][1] + '!');
      if (window.R7) R7.feier(W8.karte.querySelector('.r8w-bild'), 14);
    } else toast(W8.lichtE + ' +1 ' + W8.licht);
  }
  function wZeigen(pulsen) {
    var s = whol(), n = s.n || 0, st = stufe(n), c = W8.karte, h = wk();
    var naechste = W8.stufen[st + 1];
    var von = W8.stufen[st][0], bis = naechste ? naechste[0] : von;
    var anteil = naechste ? (n - von) / (bis - von) : 1;
    c.querySelector('.r8w-stufe').textContent = 'Stufe ' + (st + 1) + ' von ' + W8.stufen.length + ': ' + W8.stufen[st][1];
    c.querySelector('.r8w-balken i').style.width = Math.round(anteil * 100) + '%';
    c.querySelector('.r8w-balken').setAttribute('aria-valuenow', Math.round(anteil * 100));
    c.querySelector('.r8w-zahl').textContent = n + ' ' + W8.licht + (naechste ? ' · noch ' + (bis - n) + ' bis «' + naechste[1] + '»' : ' · höchste Stufe erreicht');
    var se = serie(s);
    c.querySelector('.r8w-serie').textContent = se ? '🔥 ' + se + (se === 1 ? ' Tag' : ' Tage') + ' dabei · 🌙 ein Ruhetag pro Woche zählt mit' : '🌙 Kein Druck: ein Ruhetag pro Woche zählt mit.';
    var a = c.querySelector('.r8w-ausflug'), bild = c.querySelector('.r8w-bild');
    bild.classList.toggle('weg', false);
    if (s.reise && s.ausflugTag !== h) {
      var zurueck = Date.now() - s.reise.ab > (W8.reiseMs || 45000);
      if (zurueck) { a.innerHTML = '<button type="button" class="r8w-k voll">🎒 ' + esc(W8.name) + ' ist zurück! Was gibt es zu erzählen?</button>'; a.querySelector('button').onclick = heimkehr; }
      else { bild.classList.add('weg'); a.innerHTML = '<p class="r8w-unterwegs">🎒 ' + esc(W8.name) + ' ist auf einem kleinen Ausflug und kommt gleich zurück.</p>'; clearTimeout(W8.t); W8.t = setTimeout(function () { wZeigen(false); }, (W8.reiseMs || 45000) - (Date.now() - s.reise.ab) + 200); }
    } else if (s.ausflugTag === h) a.innerHTML = '<p class="r8w-unterwegs">✓ Heute war ' + esc(W8.name) + ' schon unterwegs. Morgen geht es wieder los.</p>';
    else a.innerHTML = '<p class="r8w-unterwegs">Ein kleiner Schritt in der App, und ' + esc(W8.name) + ' geht heute auf einen Ausflug.</p>';
    var alb = (s.album || []).length;
    c.querySelector('.r8w-alb').textContent = '📒 Album ' + alb + '/' + W8.ausflug.length;
    if (pulsen && !ruhig) { var z = c.querySelector('.r8w-zahl'); z.classList.remove('r8w-puls'); void z.offsetWidth; z.classList.add('r8w-puls'); }
  }
  function heimkehr() {
    var s = whol(), h = wk(), alb = s.album || [];
    var offen = W8.ausflug.map(function (_, i) { return i; }).filter(function (i) { return !alb.some(function (x) { return x.i === i; }); });
    var i = offen.length ? offen[Math.floor(Math.random() * offen.length)] : Math.floor(Math.random() * W8.ausflug.length);
    var f = W8.ausflug[i];
    alb.push({ i: i, d: h }); s.album = alb.slice(-60); s.ausflugTag = h; delete s.reise; wleg(s);
    zeigeFund(f, i, true);
    wZeigen(false);
  }
  function zeigeFund(f, i, neu) {
    var bild = W8.ausflugBilder[i % W8.ausflugBilder.length];
    var html = '<div class="r8w-fund"><img src="' + bild[0] + '" alt="' + esc(bild[1]) + '" width="240" height="240"><span class="r8w-fe" aria-hidden="true">' + f[1] + '</span></div>' +
      '<h3 class="r8w-ft">' + esc(f[0]) + '</h3><p class="r8w-fx">' + esc(f[2]) + '</p>' +
      (W8.stumm ? '' : '<div class="r7-reihe"><button type="button" class="r7-btn voll r8w-hoer">🔊 Vorlesen</button></div>');
    var b = window.R7 && R7.blatt((neu ? W8.name + ' ist zurück' : 'Aus dem Album'), html);
    if (!b) return;
    var hb = b.el.querySelector('.r8w-hoer'); if (hb) hb.onclick = function () { sprich(f[0] + '. ' + f[2]); };
    if (neu && window.R7) setTimeout(function () { R7.feier(b.el.querySelector('.r8w-fund'), 8); }, 300);
    if (neu && !W8.stumm && W8.vorlesenAuto) sprich(f[2]);
    if (W8.beiFund) try { W8.beiFund(f); } catch (e) {}
  }
  function album() {
    var s = whol(), alb = s.album || [];
    var seen = {}; alb.forEach(function (x) { seen[x.i] = x.d; });
    var html = '<p class="r7-p">' + Object.keys(seen).length + ' von ' + W8.ausflug.length + ' Fundstücken. Tipp auf eines, um die Geschichte nochmals zu sehen.</p><div class="r8w-album">' +
      W8.ausflug.map(function (f, i) { return seen[i] ? '<button type="button" data-i="' + i + '"><span aria-hidden="true">' + f[1] + '</span>' + esc(f[0]) + '</button>' : '<span class="leer" aria-label="noch nicht gefunden">?</span>'; }).join('') + '</div>';
    var b = window.R7 && R7.blatt('Sammelalbum', html);
    if (!b) return;
    b.el.querySelectorAll('[data-i]').forEach(function (k) { k.onclick = function () { var i = +k.getAttribute('data-i'); zeigeFund(W8.ausflug[i], i, false); }; });
  }
  function waechst(cfg) {
    W8 = cfg;
    var c = el('<section class="r7 r7-karte r8w" aria-labelledby="r8w-t"><p class="r7-eb">Wächst mit dir</p>' +
      '<div class="r8w-kopf"><div class="r8w-bild"><img src="' + cfg.bild + '" alt="' + esc(cfg.name) + '" width="72" height="72"></div><div class="r8w-tx"><h2 id="r8w-t">' + cfg.lichtE + ' ' + esc(cfg.name) + 's ' + esc(cfg.licht) + '</h2><p class="r8w-stufe"></p></div></div>' +
      '<div class="r8w-balken" role="progressbar" aria-label="Fortschritt bis zur nächsten Stufe" aria-valuemin="0" aria-valuemax="100"><i></i></div>' +
      '<p class="r8w-zahl" aria-live="polite"></p><p class="r8w-serie"></p><div class="r8w-ausflug" aria-live="polite"></div>' +
      '<div class="r7-reihe"><button type="button" class="r7-btn r8w-alb"></button><button type="button" class="r7-btn r8w-wie">Wie geht das?</button></div></section>');
    cfg.karte = c;
    c.querySelector('.r8w-alb').onclick = album;
    c.querySelector('.r8w-wie').onclick = function () {
      window.R7 && R7.blatt('So wächst ' + cfg.name, '<p class="r7-p">' + esc(cfg.wie) + '</p><ol class="r8w-stufen">' + cfg.stufen.map(function (x) { return '<li><b>' + esc(x[1]) + '</b> ab ' + x[0] + ' ' + esc(cfg.licht) + '</li>'; }).join('') + '</ol><p class="r7-leise">Nichts geht verloren, nichts geht kaputt. Ein Ruhetag pro Woche zählt mit. Alles bleibt nur auf diesem Gerät.</p>');
    };
    var st = document.createElement('style');
    st.textContent = [
      '.r8w-kopf{display:flex;gap:16px;align-items:center}',
      '.r8w-bild{flex:none;position:relative;width:72px;height:72px}',
      '.r8w-bild img{width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid var(--r8w-akzent,#f2c14e);transition:filter .6s,opacity .6s}',
      '.r8w-bild.weg img{filter:grayscale(.8);opacity:.45}',
      '.r8w-bild.weg::after{content:"🎒";position:absolute;right:-6px;bottom:-4px;font-size:26px}',
      '.r8w-tx h2{margin:0}.r8w-stufe{margin:4px 0 0;font-weight:700}',
      '.r8w-balken{height:12px;border-radius:6px;background:rgba(127,127,127,.25);overflow:hidden;margin:16px 0 8px}',
      '.r8w-balken i{display:block;height:100%;width:0;border-radius:6px;background:var(--r8w-akzent,#f2c14e);transition:width .8s cubic-bezier(.2,.8,.2,1)}',
      '.r8w-zahl,.r8w-serie{margin:4px 0 0;font-size:15px}',
      '.r8w-puls{animation:r8wPuls .6s}',
      '@keyframes r8wPuls{40%{transform:scale(1.06)}}',
      '.r8w-ausflug{margin-top:12px}',
      '.r8w-unterwegs{margin:0;padding:10px 14px;border-radius:14px;background:rgba(127,127,127,.14);font-size:15px}',
      '.r8w-k{width:100%;min-height:52px;padding:10px 16px;border-radius:16px;border:0;background:var(--r8w-akzent,#f2c14e);color:var(--r8w-auf,#14204a);font:inherit;font-weight:800;font-size:16px;cursor:pointer;animation:r8wPuls 1.2s 2}',
      '.r8w-fund{position:relative;display:flex;justify-content:center;margin:8px 0 12px}',
      '.r8w-fund img{width:min(60vw,240px);height:min(60vw,240px);border-radius:24px;object-fit:cover;box-shadow:0 10px 30px rgba(0,0,0,.35)}',
      '.r8w-fe{position:absolute;right:calc(50% - min(30vw,120px) - 8px);bottom:-10px;width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:34px;background:#fffaf0;box-shadow:0 6px 16px rgba(0,0,0,.3)}',
      '.r8w-ft{margin:8px 0 4px;font-size:22px}.r8w-fx{margin:0;font-size:18px;line-height:1.5}',
      '.r8w-album{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}',
      '.r8w-album button,.r8w-album .leer{min-height:88px;display:grid;justify-items:center;align-content:center;gap:4px;padding:8px;border-radius:16px;border:1px solid rgba(127,127,127,.35);background:rgba(127,127,127,.1);color:inherit;font:inherit;font-size:13px;font-weight:700;cursor:pointer;text-align:center}',
      '.r8w-album button span{font-size:30px}.r8w-album .leer{font-size:28px;opacity:.5;cursor:default}',
      '.r8w-stufen{padding-left:20px}.r8w-stufen li{margin:4px 0}',
      '@media (prefers-reduced-motion:reduce){.r8w-balken i,.r8w-bild img{transition:none}.r8w-puls,.r8w-k{animation:none}}'
    ].join('\n');
    document.head.appendChild(st);
    if (cfg.schritte) document.addEventListener('click', function (e) {
      for (var i = 0; i < cfg.schritte.length; i++) { if (e.target.closest && e.target.closest(cfg.schritte[i][0])) { licht(cfg.schritte[i][1]); break; } }
    }, true);
    wZeigen(false);
    return c;
  }

  /* ---------- SOS: eine Minute ruhig werden (Vorbild: Headspace «SOS») ---------- */
  function sos(cfg) {
    var b = el('<button type="button" class="r8-sos-k"><span aria-hidden="true">🫧</span><span><b>1 Minute ruhig werden</b><small>' + esc(cfg.unter || 'Atmen mit ' + cfg.name + ', sofort, ohne Menü') + '</small></span></button>');
    b.onclick = function () {
      var o = el('<div class="r8-sos" role="dialog" aria-modal="true" aria-label="Eine Minute ruhig werden"><button type="button" class="r8-sos-zu" aria-label="Beenden">×</button>' +
        '<div class="r8-sos-kreis"><i></i><img src="' + cfg.bild + '" alt="' + esc(cfg.name) + '" width="160" height="160"></div>' +
        '<p class="r8-sos-wort" aria-live="polite">Wir atmen zusammen.</p><p class="r8-sos-zeit">60</p>' +
        '<button type="button" class="r8-sos-ton" aria-pressed="false">' + (cfg.stumm ? '' : '🔊 Mit Stimme') + '</button></div>');
      if (cfg.stumm) o.querySelector('.r8-sos-ton').remove();
      var vorher = document.activeElement;
      document.body.appendChild(o); document.body.classList.add('r7-blatt-offen');
      var t0 = Date.now(), ton = false, letzte = '', timer = null, wl = null;
      try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { wl = w; }).catch(function () {}); } catch (e) {}
      function sag(x) { if (ton && !cfg.stumm) { try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(x); u.lang = 'de-CH'; u.rate = .85; speechSynthesis.speak(u); } catch (e) {} } }
      function tick() {
        var s = (Date.now() - t0) / 1000;
        if (s >= 60) { fertig(); return; }
        var p = s % 10, w = p < 4 ? 'Einatmen …' : p < 5 ? 'Halten …' : 'Ausatmen …';
        o.classList.toggle('ein', p < 5);
        if (w !== letzte) { letzte = w; o.querySelector('.r8-sos-wort').textContent = w; sag(w.replace(' …', '')); }
        o.querySelector('.r8-sos-zeit').textContent = Math.ceil(60 - s);
      }
      function fertig() {
        clearInterval(timer); o.classList.remove('ein');
        o.querySelector('.r8-sos-wort').textContent = cfg.ende || 'Gut gemacht. Schön ruhig.';
        o.querySelector('.r8-sos-zeit').textContent = '✓';
        sag(cfg.ende || 'Gut gemacht.');
        if (window.R8 && R8.licht) R8.licht('sos');
      }
      function zu() { clearInterval(timer); try { speechSynthesis.cancel(); } catch (e) {} try { if (wl) wl.release(); } catch (e) {} o.remove(); document.body.classList.remove('r7-blatt-offen'); document.removeEventListener('keydown', k); try { vorher.focus({ preventScroll: true }); } catch (e) {} }
      function k(e) { if (e.key === 'Escape') zu(); }
      document.addEventListener('keydown', k);
      o.querySelector('.r8-sos-zu').onclick = zu;
      var tb = o.querySelector('.r8-sos-ton'); if (tb) tb.onclick = function () { ton = !ton; tb.setAttribute('aria-pressed', String(ton)); tb.textContent = ton ? '🔇 Ohne Stimme' : '🔊 Mit Stimme'; letzte = ''; };
      timer = setInterval(tick, 250); tick();
      o.querySelector('.r8-sos-zu').focus();
    };
    if (!document.getElementById('r8-sos-stil')) {
      var st = document.createElement('style'); st.id = 'r8-sos-stil';
      st.textContent = [
        '.r8-sos-k{display:flex;align-items:center;gap:14px;width:100%;min-height:64px;margin:12px 0;padding:10px 16px;border-radius:20px;border:2px solid var(--r8-sos,#8fd3c8);background:color-mix(in srgb,var(--r8-sos,#8fd3c8) 18%,transparent);color:inherit;font:inherit;text-align:left;cursor:pointer}',
        '.r8-sos-k>span:first-child{font-size:30px}.r8-sos-k b{display:block;font-size:18px}.r8-sos-k small{display:block;font-size:14px;opacity:.85}',
        '.r8-sos{position:fixed;inset:0;z-index:2147483100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;background:var(--r8-sos-bg,#0d1f2a);color:#f4fbf9;text-align:center}',
        '.r8-sos-zu{position:absolute;top:calc(12px + env(safe-area-inset-top));right:12px;width:52px;height:52px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:30px;cursor:pointer}',
        '.r8-sos-kreis{position:relative;width:min(70vw,280px);height:min(70vw,280px);display:grid;place-items:center}',
        '.r8-sos-kreis i{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--r8-sos,#8fd3c8) 70%,transparent),transparent 70%);transform:scale(.6);transition:transform 4s ease-in-out}',
        '.r8-sos.ein .r8-sos-kreis i{transform:scale(1.05)}',
        '.r8-sos-kreis img{position:relative;width:52%;height:52%;border-radius:50%;object-fit:cover;border:4px solid #fff;transition:transform 4s ease-in-out}',
        '.r8-sos.ein .r8-sos-kreis img{transform:scale(1.08)}',
        '.r8-sos-wort{margin:0;font-size:28px;font-weight:700}.r8-sos-zeit{margin:0;font-size:20px;opacity:.8;font-variant-numeric:tabular-nums}',
        '.r8-sos-ton{min-height:48px;padding:0 20px;border-radius:999px;border:1px solid rgba(255,255,255,.4);background:none;color:#fff;font:inherit;cursor:pointer}',
        '@media (prefers-reduced-motion:reduce){.r8-sos-kreis i,.r8-sos-kreis img{transition-duration:1.5s}}'
      ].join('\n');
      document.head.appendChild(st);
    }
    return b;
  }

  /* ---------- Markt-Look: eigenes, helles App-Design über die gemeinsamen Bausteine (r4/r6/r7/r8) ---------- */
  function thema(T, extra) {
    var c = [
      ':root{color-scheme:light;--r7-gold:' + T.akzT + ';--r7-gold2:' + T.akzT + ';--r7-tinte:' + T.text + ';--r7-leise:' + T.leise + ';--r7-schatten:0 1px 2px rgba(0,0,0,.05),0 8px 24px rgba(0,0,0,.06);--r8w-akzent:' + T.akz + ';--r8w-auf:' + T.auf + ';--r8-sos:' + T.akz + '}',
      'html,body{background:' + T.bg + '!important;color:' + T.text + '}',
      '.r7-himmel,.film-aurora,#filmFunken,.film-stern,.film-funke{display:none!important}',
      '.r6{--r6g:' + T.akz + ';--r6g2:' + T.akzT + ';--r6t:' + T.text + ';--r6m:' + T.leise + '}',
      '.r6-karte,.r7-karte{background:' + T.karte + '!important;border:1px solid ' + T.rand + '!important;box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.05)!important;color:' + T.text + '}',
      '.r7-karte h2,.r6-karte h2{color:' + T.text + '!important}',
      '.r7-eb{color:' + T.akzT + '!important}',
      '.r6-gruss{background:' + T.karte + '!important;border:1px solid ' + T.rand + '!important;color:' + T.text + '}',
      '.r6-hallo{color:' + T.text + '!important}',
      '.r6-emo,.r6-fe{background:' + T.weich + '!important}',
      '.r6-btn,.r6-k,.r7-btn{background:' + T.karte + '!important;border:1px solid ' + T.randS + '!important;color:' + T.text + '!important;box-shadow:none!important}',
      '.r6-btn.voll,.r6-k[aria-pressed=true],.r7-btn.voll{background:' + T.akz + '!important;border-color:' + T.akz + '!important;color:' + T.auf + '!important}',
      '.r6-chips button{background:' + T.karte + '!important;border:1px solid ' + T.randS + '!important;color:' + T.text + '!important}',
      '.r6-chips button[aria-pressed=true]{background:' + T.weich + '!important;border-color:' + T.akz + '!important}',
      '.r6-blase,.r7-blase{background:' + T.weich + '!important;color:' + T.text + '!important}',
      '.r6-blase small{color:' + T.akzT + '!important}',
      '.r6-fund{background:' + T.weich + '!important;border-color:' + T.rand + '!important}',
      '.r6-sammel i{border-color:' + T.randS + '!important;color:' + T.leise + '!important}',
      '.r6-sammel button{border-color:' + T.akz + '!important;background:' + T.weich + '!important}',
      '.r6-hoer small,.r6-klein{color:' + T.leise + '!important}',
      '.r6-bild,.r6-b-in img,.r7-figur{border-color:' + T.rand + '!important;background:' + T.weich + '!important}',
      '.r6-b-in b{color:' + T.text + '!important}',
      '.r7 input,.r7 select,.r7 textarea,.r6 input,.r6 select,.r6 textarea{background:#fff!important;color:' + T.text + '!important;border:1px solid ' + T.randS + '!important}',
      '.r7 label{color:' + T.leise + '!important}',
      '.r7-leer{background:' + T.bg + '!important;border-color:' + T.randS + '!important}',
      '.r7-leer p{color:' + T.leise + '!important}',
      '.r7-blatt{background:' + T.karte + '!important;color:' + T.text + '!important;border-color:' + T.rand + '!important}',
      '.r7-blatt h2{color:' + T.text + '!important}',
      '.r7-zu{background:rgba(0,0,0,.06)!important;color:' + T.text + '!important}',
      '.r7-griff{background:rgba(0,0,0,.2)!important}',
      '.r7-funke,.r6-funke{color:' + T.akz + '!important}',
      ':focus-visible{outline-color:' + T.akzT + '!important}',
      '.r8-leiste{background:rgba(255,255,255,.88)!important;border-bottom-color:' + T.rand + '!important}',
      '.r8-leiste a{color:' + T.text + '!important;background:' + T.karte + '!important;border-color:' + T.randS + '!important}',
      '.r8-leiste a[aria-current="true"]{background:' + T.akz + '!important;color:' + T.auf + '!important;border-color:' + T.akz + '!important}',
      '.r8w-unterwegs{background:' + T.weich + '!important}',
      '.r8w-album button,.r8w-album .leer{background:' + T.weich + '!important;border-color:' + T.rand + '!important}',
      '.r8-sos-k{background:' + T.weich + '!important;border-color:' + T.akz + '!important;color:' + T.text + '}'
    ].join('\n') + '\n' + (extra || '');
    var st = document.createElement('style'); st.id = 'r8-thema'; st.textContent = c;
    document.head.appendChild(st);
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', T.bg);
    var later = function () { var s = document.getElementById('r8-thema'); if (s) document.head.appendChild(s); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(later, 120); }); else setTimeout(later, 120);
    addEventListener('load', function () { setTimeout(later, 50); });
  }

  window.R8 = { vt: vt, toast: toast, leiste: leiste, wisch: wisch, esc: esc, el: el, ruhig: ruhig, waechst: waechst, licht: licht, sos: sos, thema: thema };
  function start() { if (navigator.onLine === false) offline(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* Hasis Laden Runde 8: Finder in 3 Fragen mit Merkliste und Vergleich, Werkzeug-Wundertüte (Budget wählen, Hasi packt), Wischen in den Kasten, Kategorienleiste. Hasi spricht nie. */
(function () {
  'use strict';
  var R = window.R7, Z = window.R8; if (!R || !Z) return;
  var esc = R.esc, el = R.el;
  var H = function () { return window.HasiLaden || null; };
  function W() { var h = H(); return h && h.W ? h.W : []; }
  function geste(pose, schild, text, ms) { var h = H(); if (h && h.hasi) try { h.hasi(pose, schild, text, ms || 2600); } catch (e) {} }
  function pling() { var h = H(); if (h && h.klang) try { h.klang('pling'); } catch (e) {} }
  function kasten() { try { return JSON.parse(localStorage.getItem('hasi.kasten')) || []; } catch (e) { return []; } }
  function kastenLeg(l) { try { localStorage.setItem('hasi.kasten', JSON.stringify(l.slice(0, 20))); } catch (e) {} }


  /* ---------- 5) Markt-Look (Vorbild: App Store / Product Hunt): hell, Kacheln, Holzbraun + Mint; Hasi nur als kleines Maskottchen ---------- */
  Z.thema({ bg: '#f4f3f0', karte: '#ffffff', rand: '#e4e1da', randS: '#a39b8e', text: '#1d1c1a', leise: '#55524c', akz: '#0c7a67', akzT: '#0a6253', auf: '#ffffff', weich: '#e7f5f1' }, [
    ':root{--nacht:#ffffff;--nacht2:#ffffff;--nacht3:#dedad2;--gold:#0c7a67;--gold2:#0a6253;--cyan:#0c7a67;--text:#1d1c1a;--mute:#55524c;--holz:#8a5a33;--holz2:#a8713f;--gruen:#0c7a67;--rot:#b3261e;color-scheme:light}',
    'body{background:#f4f3f0!important}',
    'h1{color:#1d1c1a!important;text-shadow:none!important;font-family:var(--body)!important;letter-spacing:-.02em}',
    'h2{color:#1d1c1a!important;font-family:var(--body)!important;font-weight:800}',
    '.box{border:1px solid #e4e1da!important;border-radius:20px!important;box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.05)}',
    '.box.holz{border:1px solid #e4e1da!important;border-top:4px solid #8a5a33!important}',
    '.btn.an{background:#0c7a67!important;color:#fff!important}',
    '.btn.zwei{color:#0a6253!important;border-color:#0c7a67!important;background:#fff!important}',
    '.chip{background:#fff!important;border-color:#cfcac0!important;color:#1d1c1a!important}',
    '.schild{background:#8a5a33!important;color:#fff!important;border-color:#8a5a33!important;font-family:var(--body)!important}',
    '.buehne{height:150px!important;background:linear-gradient(180deg,#e7f5f1,#f4f3f0)!important;border:0!important;box-shadow:none!important}',
    '.buehne .stern,.buehne .mond,.werkstatt,.laden,.garten,.film-szene{display:none!important}',
    '.hasi-fig{right:auto!important;left:50%!important;margin-left:-55px;width:110px!important;height:132px!important;bottom:4px!important}',
    '.hasi-fig svg{filter:drop-shadow(0 4px 8px rgba(0,0,0,.18))!important}',
    '.requisit{right:22%!important;bottom:100px!important}',
    '.zeile .schild{color:#fff!important}',
    '.reiter button[aria-selected=true]{background:#0c7a67!important;color:#fff!important;border-color:#0c7a67!important}',
    '.geste,.hinweis,.sub,label{color:#55524c!important}',
    '.entwurf{background:#1d1c1a!important;color:#fff!important}',
    '.r8-tuete-tx{color:#3b2410}',
    '.r7-abz-m{opacity:1!important;border-color:#cfcac0!important}.r7-abz-m span{opacity:.55}.r7-abz-m b{color:#1d1c1a!important}.r7-abz-m small{color:#55524c!important}.r7-abz-m.hat{border-color:#0c7a67!important;background:#e7f5f1!important}.r7-abz-m.hat span{opacity:1}',
    '.r8-ding{background:#fff!important}.r8-ding-tx b{color:#1d1c1a!important}',
    '.r8-f-k{background:#fff!important;border-color:#cfcac0!important;color:#1d1c1a!important}.r8-f-k.an{background:#e7f5f1!important;border-color:#0c7a67!important}',
    '.r8-f-e{background:#fff!important}.r8-f-pz{background:#e7f5f1!important;color:#0a6253!important}',
    '.r8-f-balken{background:#e4e1da!important}.r8-f-balken i{background:#0c7a67!important}',
    '.r8-vt th,.r8-vt td{color:#1d1c1a!important;border-color:#e4e1da!important}.r8-vt th[scope=row]{color:#0a6253!important}',
    '.r8-ml-w{background:#f4f3f0!important}.r8-ml-w b{color:#1d1c1a!important}'
  ].join('\n'));

  /* ---------- 1) Werkzeug-Wundertüte (Vorbild: Too Good To Go «Überraschungstüte») ---------- */
  var BUDGET = [['gratis', 'Gratis'], ['klein', 'Kleines Abo'], ['einmal', 'Einmal einrichten'], ['egal', 'Egal']];
  var WER = [['mich', '🙋 Für mich'], ['familie', '👪 Familie'], ['firma', '🏪 Firma'], ['kinder', '🧒 Kinder']];
  function monat(p) { var m = String(p).match(/CHF\s*(\d+)\s*pro Monat/i); return m ? +m[1] : null; }
  function passtBudget(x, b) {
    var p = String(x.p || '');
    if (b === 'egal') return true;
    if (b === 'gratis') return /gratis/i.test(p);
    if (b === 'klein') { var m = monat(p); return m != null && m <= 6; }
    if (b === 'einmal') return /einmalig|anfrage|einrichten/i.test(p);
    return true;
  }
  var WER_RE = { mich: /alle|privat|selbst|kopf|tanz/i, familie: /famil|eltern|kind|hund/i, firma: /firm|team|praxen|läden|laden|verein|klein|selbstständ|lehrer|kurse|märkt/i, kinder: /kind|schul/i };
  var wahl = { b: R.hol('tueteB', 'gratis'), w: R.hol('tueteW', 'mich') };
  var tk = el('<section class="r7 r7-karte r8-tuete-k" aria-labelledby="r8t-t"><p class="r7-eb">Wie eine Überraschungstüte</p><h2 id="r8t-t">🛍 Werkzeug-Wundertüte</h2>' +
    '<p class="r7-p">Sag Hasi dein Budget. Er packt dir drei Werkzeuge in eine Papiertüte. Was drin ist, siehst du erst beim Öffnen.</p>' +
    '<p class="r8-frage" id="r8t-b">Budget</p><div class="r7-reihe r8-tb" role="radiogroup" aria-labelledby="r8t-b" style="margin-top:0"></div>' +
    '<p class="r8-frage" id="r8t-w">Für wen</p><div class="r7-reihe r8-tw" role="radiogroup" aria-labelledby="r8t-w" style="margin-top:0"></div>' +
    '<div class="r8-tuete-buehne"><button type="button" class="r8-tuete"><span class="r8-tuete-falz" aria-hidden="true"></span><span class="r8-tuete-stempel" aria-hidden="true">🐰</span><span class="r8-tuete-tx">Tippen: Hasi packt</span></button></div>' +
    '<ul class="r8-inhalt" aria-live="polite"></ul>' +
    '<p class="r7-leise r8-tuete-hilfe" hidden>Wisch nach rechts: in deinen Kasten. Nach links: passt nicht, Hasi legt etwas anderes hinein.</p></section>');
  function chips(box, liste, key, store) {
    box.innerHTML = '';
    liste.forEach(function (x) {
      var b = el('<button type="button" class="r7-btn' + (wahl[key] === x[0] ? ' voll' : '') + '" role="radio" aria-checked="' + (wahl[key] === x[0]) + '">' + esc(x[1]) + '</button>');
      b.onclick = function () { wahl[key] = x[0]; R.leg(store, x[0]); chips(box, liste, key, store); };
      box.appendChild(b);
    });
  }
  var rest = [], drin = [], zustand = 'zu';
  function packen() {
    var pool = W().filter(function (x) { return (x.r !== 'offen' || x.lic) && kasten().indexOf(x.id) < 0; });
    var ok = pool.filter(function (x) { return passtBudget(x, wahl.b); });
    function punkte(x) { return (WER_RE[wahl.w].test(x.w + ' ' + x.t) ? 2 : 0) + Math.random() * 1.5; }
    ok.sort(function (a, b) { return punkte(b) - punkte(a); });
    var extra = pool.filter(function (x) { return ok.indexOf(x) < 0; }).sort(function () { return Math.random() - .5; });
    rest = ok.concat(extra);
    drin = rest.splice(0, 3);
    return ok.length;
  }
  var bag = tk.querySelector('.r8-tuete'), ul = tk.querySelector('.r8-inhalt');
  bag.addEventListener('click', function () {
    if (zustand === 'zu') {
      var n = packen(); zustand = 'gepackt';
      bag.classList.remove('wackel'); void bag.offsetWidth; bag.classList.add('wackel', 'voll');
      bag.querySelector('.r8-tuete-tx').textContent = 'Tippen zum Öffnen';
      
      ul.innerHTML = '';
      geste('huepfen', 'Gepackt!', n >= 3 ? 'Hasi wirft drei Würfel in die Tüte, faltet sie zu und drückt seinen Stempel drauf.' : 'Hasi findet nicht genug im Budget. Er legt noch etwas Passendes dazu und zwinkert.', 3000);
      pling();
    } else if (zustand === 'gepackt') {
      zustand = 'offen'; bag.classList.add('offen'); bag.querySelector('.r8-tuete-tx').textContent = 'Neu packen';
      
      tk.querySelector('.r8-tuete-hilfe').hidden = false;
      zeigeInhalt(true);
      geste('passt', 'Voilà!', 'Hasi öffnet die Tüte und legt die Würfel einen nach dem anderen auf den Tresen.', 3000);
      R.feier(bag, 10); Z.licht('tuete');
    } else {
      zustand = 'zu'; bag.classList.remove('offen', 'voll'); ul.innerHTML = ''; tk.querySelector('.r8-tuete-hilfe').hidden = true;
      bag.querySelector('.r8-tuete-tx').textContent = 'Tippen: Hasi packt';
      bag.click();
    }
  });
  function karte(x, i, neu) {
    var li = el('<li class="r8-ding' + (neu ? ' r8-raus' : '') + '" style="--k:' + esc(x.k) + ';animation-delay:' + (i * 140) + 'ms">' +
      '<div class="r8-ding-kopf"><span class="r8-ding-e" aria-hidden="true">' + x.e + '</span><span class="r8-ding-tx"><b>' + esc(x.n) + '</b><small>' + esc(x.p) + '</small></span></div>' +
      '<p>' + esc(x.t.split('. ')[0].replace(/\.+$/, '')) + '.</p>' +
      '<div class="r8-ding-k"><button type="button" class="r7-btn" data-a="nein" aria-label="' + esc(x.n) + ' passt nicht">✕</button><button type="button" class="r7-btn" data-a="tresen">Ansehen</button><button type="button" class="r7-btn voll" data-a="ja">✓ In den Kasten</button></div>' +
      '<span class="r8-stempel ja" aria-hidden="true">KASTEN</span><span class="r8-stempel nein" aria-hidden="true">NEIN</span></li>');
    li.querySelector('[data-a=ja]').onclick = function () { ja(x, li); };
    li.querySelector('[data-a=nein]').onclick = function () { nein(x, li); };
    li.querySelector('[data-a=tresen]').onclick = function () { var h = H(); if (h) h.zeige(x.id); };
    Z.wisch(li, { rechts: function () { ja(x, li); }, links: function () { nein(x, li); }, zeig: function (dx) { li.style.setProperty('--ja', Math.max(0, Math.min(1, dx / 90)).toFixed(2)); li.style.setProperty('--nein', Math.max(0, Math.min(1, -dx / 90)).toFixed(2)); } });
    return li;
  }
  function zeigeInhalt(neu) {
    ul.innerHTML = '';
    drin.forEach(function (x, i) { ul.appendChild(karte(x, i, neu)); });
    if (!drin.length) ul.appendChild(el('<li class="r7-leer"><img class="r7-figur" src="posen/daumen.jpg" alt="Hasi zeigt den Daumen" loading="lazy" width="72" height="72"><p>Die Tüte ist leer. Hasi verbeugt sich und faltet sie für das nächste Mal.</p></li>'));
  }
  function ja(x, li) {
    var vor = kasten().slice(), vorDrin = drin.slice();
    var k = kasten(); if (k.indexOf(x.id) < 0) k.unshift(x.id); kastenLeg(k);
    drin = drin.filter(function (y) { return y !== x; });
    Z.vt(function () { zeigeInhalt(false); });
    Z.licht('kasten');
    geste('daumen', 'Im Kasten', 'Hasi legt «' + x.n + '» behutsam in deinen Werkzeugkasten.', 2400); pling();
    Z.toast(x.e + ' ' + x.n + ' ist im Kasten', { undo: function () { kastenLeg(vor); drin = vorDrin; zeigeInhalt(false); } });
  }
  function nein(x, li) {
    var vorDrin = drin.slice(), vorRest = rest.slice();
    var i = drin.indexOf(x), ersatz = rest.shift();
    if (ersatz) drin.splice(i, 1, ersatz); else drin.splice(i, 1);
    Z.vt(function () { zeigeInhalt(false); var neu = ersatz && ul.children[i]; if (neu) neu.classList.add('r8-raus'); });
    geste(ersatz ? 'huepfen' : 'schild', ersatz ? 'Tausch!' : 'Leer', ersatz ? 'Hasi nimmt «' + x.n + '» zurück und zieht «' + ersatz.n + '» aus der Tüte.' : 'Hasi zuckt mit den Schultern: mehr hat er gerade nicht.', 2600);
    Z.toast(x.n + ' zurückgelegt', { undo: function () { drin = vorDrin; rest = vorRest; zeigeInhalt(false); } });
  }

  var css = document.createElement('style');
  css.textContent = [
    '.r8-frage{margin:16px 0 8px;font-weight:800;color:var(--r7-gold2);font-size:15px}',
    'html,body{overflow-x:clip!important}',
    '.r8-tuete-buehne{display:flex;justify-content:center;margin:48px 0 8px}',
    '.r8-tuete{position:relative;width:180px;height:200px;border:0;padding:0;cursor:pointer;border-radius:6px 6px 14px 14px;background:linear-gradient(180deg,#d9b07a,#b88a55);box-shadow:inset 0 -14px 0 rgba(0,0,0,.08),0 14px 28px rgba(0,0,0,.4);color:#3b2410;font:800 15px/1.2 inherit;display:flex;align-items:flex-end;justify-content:center;padding-bottom:18px;transform-origin:50% 100%}',
    '.r8-tuete::before{content:"";position:absolute;left:10px;right:10px;top:0;height:26px;background:repeating-linear-gradient(90deg,#c99a63 0 12px,#d9b07a 12px 24px);clip-path:polygon(0 0,100% 0,100% 100%,0 100%);opacity:.6}',
    '.r8-tuete-falz{position:absolute;left:0;right:0;top:0;height:34px;background:#a77945;border-radius:6px 6px 0 0;transform-origin:50% 0;transition:transform .5s cubic-bezier(.3,.7,.3,1)}',
    '.r8-tuete.voll .r8-tuete-falz{transform:none}',
    '.r8-tuete:not(.voll) .r8-tuete-falz{transform:scaleY(.25)}',
    '.r8-tuete.offen .r8-tuete-falz{transform:rotateX(180deg) translateY(10px)}',
    '.r8-tuete-stempel{position:absolute;top:62px;left:50%;transform:translateX(-50%) rotate(-8deg);width:64px;height:64px;border-radius:50%;border:3px dashed #7a3b1e;display:grid;place-items:center;font-size:30px;opacity:0;transition:opacity .3s .2s}',
    '.r8-tuete.voll .r8-tuete-stempel{opacity:.85}',
    '.r8-tuete-tx{position:relative;background:rgba(255,250,240,.85);padding:6px 12px;border-radius:999px}',
    '.r8-tuete.wackel{animation:r8Wackel .7s cubic-bezier(.3,.7,.3,1)}',
    '@keyframes r8Wackel{20%{transform:rotate(-6deg)}40%{transform:rotate(5deg) translateY(-6px)}60%{transform:rotate(-3deg)}80%{transform:rotate(2deg)}}',
    '.r8-inhalt{list-style:none;margin:16px 0 0;padding:0;display:grid;gap:12px}',
    '.r8-ding{position:relative;padding:16px;border-radius:20px;background:linear-gradient(160deg,rgba(255,250,240,.1),rgba(255,250,240,.04));border:2px solid var(--k);overflow:hidden;user-select:none;-webkit-user-select:none}',
    '.r8-ding.r8-raus{animation:r8Raus .55s cubic-bezier(.2,.8,.2,1) both}',
    '@keyframes r8Raus{from{opacity:0;transform:translateY(-40px) scale(.7) rotate(-4deg)}to{opacity:1;transform:none}}',
    '.r8-ding-kopf{display:flex;gap:12px;align-items:center}',
    '.r8-ding-e{flex:none;width:52px;height:52px;border-radius:16px;display:grid;place-items:center;font-size:28px;background:color-mix(in srgb,var(--k) 28%,transparent)}',
    '.r8-ding-tx b{display:block;font-size:18px;color:var(--r7-tinte)}.r8-ding-tx small{color:var(--r7-leise);font-size:14px}',
    '.r8-ding p{margin:8px 0 0;color:var(--r7-leise);font-size:15px}',
    '.r8-ding-k{display:flex;gap:8px;margin-top:12px}.r8-ding-k .voll{flex:1}',
    '.r8-stempel{position:absolute;top:14px;padding:4px 10px;border:3px solid;border-radius:8px;font:900 18px/1 system-ui,sans-serif;letter-spacing:.08em;pointer-events:none}',
    '.r8-stempel.ja{left:14px;color:#7fe0a6;transform:rotate(-12deg);opacity:var(--ja,0)}',
    '.r8-stempel.nein{right:14px;color:#ff8a7a;transform:rotate(12deg);opacity:var(--nein,0)}',
    '@media (prefers-reduced-motion:reduce){.r8-tuete.wackel,.r8-ding.r8-raus{animation:none}.r8-tuete-falz{transition:none}}'
  ].join('\n');
  document.head.appendChild(css);


  /* ---------- 3) Finder in 3 Fragen + Merkliste + Vergleich (Vorbild: Apple «Welches iPhone passt zu dir?») ---------- */
  var THEMEN = [
    ['termine', '🗓', 'Termine und Ordnung', /termin|erinner|kalender|checkliste|liste|ablauf|kasse/i],
    ['reden', '💬', 'Reden statt tippen', /reinreden|transkript|text ist|diktier|reden/i],
    ['kopf', '🧠', 'Kopf und Ruhe', /schritt|kopf|ruhig|nacht|ordnung im kopf|gestresst/i],
    ['familie', '👪', 'Familie und Kinder', /famil|kinder|eltern|älter|gutenacht/i],
    ['hund', '🐶', 'Hund', /hund/i],
    ['tanz', '💃', 'Bewegung und Tanz', /tanz|salsa|beweg/i],
    ['firma', '🏪', 'Laden, Praxis, Team', /firm|team|praxen|läden|kasse|preis|verein|kleinunternehm|kurse|märkt/i],
    ['idee', '💡', 'Eigene Idee bauen', /eigene|idee|bau|skizz|zeichn|quiz/i]
  ];
  var FWER = [['mich', '🙋', 'Für mich'], ['familie', '👪', 'Familie'], ['firma', '🏪', 'Firma'], ['kinder', '🧒', 'Kinder']];
  var FBUD = [['gratis', '🆓', 'Gratis'], ['klein', '🪙', 'Kleines Abo'], ['einmal', '🧾', 'Einmal einrichten'], ['egal', '🤷', 'Egal']];
  var BUD_TEXT = { gratis: 'gratis', klein: 'kleines Abo', einmal: 'einmal einrichten' };
  function bewerte(a) {
    var thema = THEMEN.filter(function (x) { return x[0] === a.thema; })[0];
    return W().filter(function (x) { return x.r !== 'offen' || x.lic; }).map(function (x) {
      var txt = x.n + ' ' + x.t + ' ' + x.w, g = [], s = 0;
      if (thema && thema[3].test(txt)) { s += 5; g.push('hilft bei «' + thema[2] + '»'); }
      if (WER_RE[a.wer].test(txt)) { s += 2; g.push({ mich: 'gut für dich allein', familie: 'gut für Familien', firma: 'gut für Firmen und Läden', kinder: 'gut mit Kindern' }[a.wer]); }
      if (a.bud === 'egal') s += 1; else if (passtBudget(x, a.bud)) { s += 2; g.push(BUD_TEXT[a.bud]); } else s -= 3;
      return { x: x, s: s, g: g, pz: Math.max(0, Math.min(99, Math.round(s / 9 * 100))) };
    }).sort(function (a, b) { return b.s - a.s; });
  }
  function merk(id) { var k = kasten(), i = k.indexOf(id); if (i >= 0) k.splice(i, 1); else k.unshift(id); kastenLeg(k); merkZahl(); return i < 0; }
  function vergleich(a, b) {
    function lz(x) { return x.lic || (x.r === 'lab' ? 'Eigenes Programm aus Hasis Laden' : '–'); }
    function zeile(t, fa, fb) { return '<tr><th scope="row">' + t + '</th><td>' + esc(fa) + '</td><td>' + esc(fb) + '</td></tr>'; }
    return '<div class="r8-vt-w"><table class="r8-vt"><thead><tr><td></td><th scope="col">' + a.e + ' ' + esc(a.n) + '</th><th scope="col">' + b.e + ' ' + esc(b.n) + '</th></tr></thead><tbody>' +
      zeile('Was es kann', a.t, b.t) + zeile('Für wen', a.w, b.w) + zeile('Preis', a.p, b.p) + zeile('Lizenz', lz(a), lz(b)) + '</tbody></table></div>';
  }
  function finder() {
    var a = {}, schritt = 0;
    var B = R.blatt('Werkzeug-Finder', '<div class="r8-f"></div>').el, box = B.querySelector('.r8-f');
    var FR = [['thema', 'Wobei soll es helfen?', THEMEN.map(function (x) { return [x[0], x[1], x[2]]; })], ['wer', 'Für wen ist es?', FWER], ['bud', 'Wie viel darf es kosten?', FBUD]];
    function frage() {
      var f = FR[schritt];
      box.innerHTML = '<p class="r8-f-nr">Frage ' + (schritt + 1) + ' von 3</p><div class="r8-f-balken" aria-hidden="true"><i style="width:' + ((schritt + 1) / 3 * 100) + '%"></i></div>' +
        '<h3 class="r8-f-h" tabindex="-1">' + f[1] + '</h3><div class="r8-f-opt" role="group" aria-label="' + esc(f[1]) + '"></div>' +
        (schritt ? '<button type="button" class="r7-btn r8-f-zurueck" style="margin-top:16px">‹ Zurück</button>' : '');
      f[2].forEach(function (o) {
        var b = el('<button type="button" class="r8-f-k' + (a[f[0]] === o[0] ? ' an' : '') + '"><span aria-hidden="true">' + o[1] + '</span>' + esc(o[2]) + '</button>');
        b.onclick = function () { a[f[0]] = o[0]; Z.vt(function () { if (schritt < 2) { schritt++; frage(); } else ergebnis(); }); };
        box.querySelector('.r8-f-opt').appendChild(b);
      });
      var z = box.querySelector('.r8-f-zurueck'); if (z) z.onclick = function () { Z.vt(function () { schritt--; frage(); }); };
      geste(['lesen', 'nicken', 'waage'][schritt], (schritt + 1) + ' / 3', ['Hasi hält die Lupe hoch und schaut dich fragend an.', 'Hasi zeigt auf dich, dann auf die Familie, dann auf den Laden.', 'Hasi legt eine Münze auf die goldene Waage.'][schritt], 2400);
      var h = box.querySelector('.r8-f-h'); try { h.focus({ preventScroll: true }); } catch (e) {}
    }
    function ergebnis() {
      var L = bewerte(a).slice(0, 3);
      box.innerHTML = '<p class="r8-f-nr">Hasis Wahl für dich</p><h3 class="r8-f-h" tabindex="-1">Diese drei passen am besten</h3><ol class="r8-f-erg"></ol>' +
        '<div class="r7-reihe"><button type="button" class="r7-btn voll r8-f-vgl">⚖️ Die zwei Besten vergleichen</button><button type="button" class="r7-btn r8-f-neu">↺ Nochmal</button></div><div class="r8-f-tab"></div>';
      L.forEach(function (r, i) {
        var drin = kasten().indexOf(r.x.id) >= 0;
        var li = el('<li class="r8-f-e" style="--k:' + esc(r.x.k) + '"><div class="r8-ding-kopf"><span class="r8-ding-e" aria-hidden="true">' + r.x.e + '</span><span class="r8-ding-tx"><b>' + (i + 1) + '. ' + esc(r.x.n) + '</b><small>' + esc(r.x.p) + '</small></span><span class="r8-f-pz" aria-label="passt zu ' + r.pz + ' Prozent">' + r.pz + ' %</span></div>' +
          '<ul class="r8-f-g">' + (r.g.length ? r.g : ['Hasi legt es trotzdem dazu']).map(function (g) { return '<li>✓ ' + esc(g) + '</li>'; }).join('') + '</ul>' +
          '<div class="r8-ding-k"><button type="button" class="r7-btn" data-a="an">Ansehen</button><button type="button" class="r7-btn' + (drin ? ' voll' : '') + '" data-a="merk" aria-pressed="' + drin + '">' + (drin ? '♥ Gemerkt' : '♡ Merken') + '</button></div></li>');
        li.querySelector('[data-a=an]').onclick = function () { R.zu(); var h = H(); if (h) h.zeige(r.x.id); };
        li.querySelector('[data-a=merk]').onclick = function () { var an = merk(r.x.id); this.classList.toggle('voll', an); this.setAttribute('aria-pressed', an); this.textContent = an ? '♥ Gemerkt' : '♡ Merken'; if (an) { pling(); Z.toast(r.x.e + ' ' + r.x.n + ' gemerkt', { undo: function () { merk(r.x.id); ergebnis(); } }); } };
        box.querySelector('.r8-f-erg').appendChild(li);
      });
      box.querySelector('.r8-f-vgl').onclick = function () { var t = box.querySelector('.r8-f-tab'); t.innerHTML = vergleich(L[0].x, L[1].x); t.scrollIntoView({ behavior: Z.ruhig ? 'auto' : 'smooth', block: 'nearest' }); };
      box.querySelector('.r8-f-neu').onclick = function () { a = {}; schritt = 0; Z.vt(frage); };
      geste('passt', 'Gefunden!', 'Hasi stellt drei Würfel nebeneinander und tippt auf den ersten.', 3000); pling();
      R.feier(box.querySelector('.r8-f-erg'), 8);
      try { box.querySelector('.r8-f-h').focus({ preventScroll: true }); } catch (e) {}
      R.leg('finder', (R.hol('finder', 0) || 0) + 1); Z.licht('finder');
    }
    frage();
  }
  function merkliste() {
    var B = R.blatt('Deine Merkliste', '<div class="r8-ml"></div>').el, box = B.querySelector('.r8-ml'), wahl2 = [];
    function zeigen() {
      var L = kasten().map(function (id) { return W().filter(function (x) { return x.id === id; })[0]; }).filter(Boolean);
      if (!L.length) { box.innerHTML = '<div class="r7-leer"><img class="r7-figur" src="posen/passt.jpg" alt="" width="72" height="72"><p>Noch nichts gemerkt. Im Finder oder in der Wundertüte auf «♡ Merken» tippen.</p></div>'; return; }
      box.innerHTML = '<p class="r7-p">Wähle zwei zum Vergleichen.</p><ul class="r8-ml-l"></ul><div class="r7-reihe"><button type="button" class="r7-btn voll r8-ml-v"' + (wahl2.length === 2 ? '' : ' disabled') + '>⚖️ Vergleichen</button></div><div class="r8-ml-t"></div>';
      L.forEach(function (x) {
        var li = el('<li><label class="r8-ml-w"><input type="checkbox"' + (wahl2.indexOf(x.id) >= 0 ? ' checked' : '') + '><span aria-hidden="true" style="font-size:24px">' + x.e + '</span><span style="flex:1;min-width:0"><b>' + esc(x.n) + '</b><small>' + esc(x.p) + '</small></span></label><button type="button" class="r7-btn" aria-label="' + esc(x.n) + ' entfernen">✕</button></li>');
        li.querySelector('input').onchange = function () { if (this.checked) { wahl2.push(x.id); if (wahl2.length > 2) wahl2.shift(); } else wahl2 = wahl2.filter(function (y) { return y !== x.id; }); zeigen(); };
        li.querySelector('button').onclick = function () { var vor = kasten().slice(); merk(x.id); zeigen(); Z.toast(x.n + ' entfernt', { undo: function () { kastenLeg(vor); merkZahl(); zeigen(); } }); };
        box.querySelector('.r8-ml-l').appendChild(li);
      });
      box.querySelector('.r8-ml-v').onclick = function () { var a = W().filter(function (x) { return x.id === wahl2[0]; })[0], b = W().filter(function (x) { return x.id === wahl2[1]; })[0]; if (a && b) box.querySelector('.r8-ml-t').innerHTML = vergleich(a, b); };
    }
    zeigen();
  }
  var fk = el('<section class="r7 r7-karte r8-finder-k" aria-labelledby="r8f-t"><p class="r7-eb">In einer Minute</p><h2 id="r8f-t">🧭 Was brauchst du wirklich?</h2>' +
    '<div style="display:flex;gap:16px;align-items:center"><img class="r7-figur" src="posen/lupe.jpg" alt="Hasi mit Lupe" loading="lazy" width="72" height="72"><p class="r7-p" style="margin:0">Drei kurze Fragen, dann stellt Hasi dir die drei passendsten Werkzeuge hin, mit Grund, Preis und Vergleich.</p></div>' +
    '<button type="button" class="r7-btn voll gross r8-finder-los" style="margin-top:16px">🧭 Finder starten</button>' +
    '<button type="button" class="r7-btn gross r8-merk-los" style="margin-top:8px">♡ Merkliste <span class="r8-merk-n"></span></button></section>');
  function merkZahl() { var n = kasten().length; fk.querySelector('.r8-merk-n').textContent = n ? '(' + n + ')' : ''; }
  fk.querySelector('.r8-finder-los').onclick = finder;
  fk.querySelector('.r8-merk-los').onclick = merkliste;
  var fcss = document.createElement('style');
  fcss.textContent = [
    '.r8-f-nr{margin:0;color:var(--r7-gold);font-weight:800;font-size:13px;letter-spacing:.06em;text-transform:uppercase}',
    '.r8-f-balken{height:6px;border-radius:3px;background:rgba(255,255,255,.12);margin:8px 0 16px;overflow:hidden}.r8-f-balken i{display:block;height:100%;background:var(--r7-gold);border-radius:3px;transition:width .3s}',
    '.r8-f-h{margin:0 0 16px;font-size:22px;color:var(--r7-tinte);outline:none}',
    '.r8-f-opt{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}',
    '.r8-f-k{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-height:84px;padding:12px 14px;border-radius:18px;border:1px solid rgba(242,193,78,.4);background:rgba(255,250,240,.06);color:var(--r7-tinte);font:700 16px/1.25 inherit;text-align:left;cursor:pointer;transition:transform .12s,background .2s}',
    '.r8-f-k span{font-size:26px}.r8-f-k:active{transform:scale(.97)}.r8-f-k.an{background:rgba(242,193,78,.2);border-color:var(--r7-gold)}',
    '.r8-f-erg{list-style:none;margin:0;padding:0;display:grid;gap:12px}',
    '.r8-f-e{padding:14px;border-radius:18px;border:2px solid var(--k);background:rgba(255,250,240,.05)}',
    '.r8-f-pz{flex:none;margin-left:auto;padding:6px 10px;border-radius:999px;background:rgba(127,224,166,.18);color:#9ff0bf;font-weight:800;font-size:15px}',
    '.r8-f-g{list-style:none;margin:10px 0 0;padding:0;color:var(--r7-leise);font-size:15px;display:grid;gap:2px}',
    '.r8-vt-w{overflow-x:auto;margin-top:16px}.r8-vt{width:100%;border-collapse:collapse;font-size:15px;min-width:420px}.r8-vt th,.r8-vt td{padding:8px;border-bottom:1px solid rgba(255,255,255,.12);text-align:left;vertical-align:top;color:var(--r7-tinte)}.r8-vt th[scope=row]{color:var(--r7-gold2);width:24%}',
    '.r8-ml-l{list-style:none;margin:0;padding:0;display:grid;gap:8px}.r8-ml-l li{display:flex;gap:8px;align-items:center}',
    '.r8-ml-w{flex:1;min-width:0;display:flex!important;flex-direction:row!important;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border-radius:14px;background:rgba(255,250,240,.07);cursor:pointer}',
    '.r8-ml-w b{display:block;color:var(--r7-tinte)}.r8-ml-w small{color:var(--r7-leise);font-weight:400}',
    '.r8-ml-w input{width:22px;height:22px;min-height:0!important;accent-color:#f2c14e}'
  ].join('\n');
  document.head.appendChild(fcss);


  /* ---------- 4) Wächst mit dir (Vorbild: Finch). Hasi spricht nie: Ausflug nur als Bild mit kurzer Bildunterschrift ---------- */
  var WCFG = {
    k: 'hasi', name: 'Hasi', licht: 'Rüebli', lichtE: '🥕', bild: 'posen/winken.jpg', stumm: true,
    stufen: [[0, 'Lehrling'], [5, 'Werkbank-Hase'], [15, 'Ladenhüter'], [35, 'Meister-Hasi'], [70, 'Goldene Pfote']],
    wie: 'Jeder kleine Schritt im Laden (Finder fertig, Wundertüte geöffnet, Würfel angeschaut, Code lesen lassen, auf der Werkbank etwas gebaut) gibt Hasi ein Rüebli. Mit genug Rüebli wird er Meister. Einmal am Tag geht er los und bringt ein Fundstück mit. Er erzählt nichts, er zeigt es dir.',
    schritte: [['#lesen', 'code'], ['#wb-mit', 'werkbank'], ['.r7-s-e', 'suchen'], ['.wuerfel', 'wuerfel'], ['#bestellen', 'brief']],
    ausflugBilder: [['posen/daumen.jpg', 'Hasi hält den Daumen hoch'], ['posen/huepfen.jpg', 'Hasi hüpft vor Freude'], ['posen/lupe.jpg', 'Hasi schaut durch die Lupe'], ['posen/passt.jpg', 'Hasi zeigt: passt'], ['posen/winken.jpg', 'Hasi winkt']],
    ausflug: [
      ['Flohmarkt', '🔩', 'Hasi hält eine goldene Schraube hoch und strahlt.'],
      ['Tinkos Werkstatt', '🥕', 'Hasi zeigt ein Rüebli, das Tinko für ihn geschnitzt hat.'],
      ['Holzlager', '🪵', 'Hasi trägt ein duftendes Stück Arvenholz unter dem Arm.'],
      ['Beim Uhrmacher', '⚙️', 'Hasi dreht ein winziges Zahnrad mit der Pfote.'],
      ['Papeterie', '📏', 'Hasi hat ein neues Lineal und misst sofort seine Ohren.'],
      ['Bibliothek', '📘', 'Hasi blättert in einem Buch über Erfinder und nickt begeistert.'],
      ['Im Wald', '🌰', 'Hasi legt eine Eichel ins Schaufenster und zwinkert.'],
      ['Am Bahnhof', '🚂', 'Hasi hält ein altes Billett hoch und tippt auf den Zielort.'],
      ['Gärtnerei', '🌱', 'Hasi pflanzt einen Setzling in eine Kaffeetasse.'],
      ['Velowerkstatt', '🔧', 'Hasi poliert einen kleinen Schlüssel, ein Geschenk.'],
      ['Glockengiesser', '🔔', 'Hasi hängt ein Glöckchen an die Ladentür und lauscht.'],
      ['Sternwarte', '🔭', 'Hasi zeigt in den Himmel und malt einen Stern auf ein Schild.']
    ],
    beiFund: function (f) { geste('huepfen', 'Zurück!', f[2], 3000); }
  };

  /* ---------- 2) Kategorienleiste (Vorbild: Airbnb) ---------- */
  function sek(text) { var hs = document.querySelectorAll('main h2'); for (var i = 0; i < hs.length; i++) if (hs[i].textContent.indexOf(text) >= 0) return hs[i].closest('section,.box,.r6-karte') || hs[i]; return null; }

  function los() {
    var b = document.getElementById('berater');
    if (b && b.parentNode) { b.parentNode.insertBefore(fk, b); b.parentNode.insertBefore(tk, b.nextSibling); } else { R.einsetzen(fk); R.einsetzen(tk); }
    merkZahl(); R.namen(fk);
    chips(tk.querySelector('.r8-tb'), BUDGET, 'b', 'tueteB'); chips(tk.querySelector('.r8-tw'), WER, 'w', 'tueteW');
    R.namen(tk);
    var wc = Z.waechst(WCFG), f0 = document.getElementById('r4fund') || fk;
    f0.parentNode.insertBefore(wc, f0); R.namen(wc);
    var vor = wc;
    Z.leiste([
      { e: '🥕', n: 'Wächst', ziel: wc },
      { e: '🪧', n: 'Fund', ziel: document.getElementById('r4fund') },
      { e: '🧭', n: 'Finder', ziel: fk },
      { e: '💬', n: 'Problem', ziel: b },
      { e: '🛍', n: 'Wundertüte', ziel: tk },
      { e: '🧺', n: 'Regale', ziel: sek('Hasis Regale') },
      { e: '🔎', n: 'Suchen', ziel: sek('Hasi sucht mit') },
      { e: '⚖️', n: 'Vergleich', ziel: sek('Nebeneinander legen') },
      { e: '🔨', n: 'Werkbank', ziel: sek('Hasis Werkbank') },
      { e: '👀', n: 'Code', ziel: sek('Hasi liest Code') },
      { e: '🏅', n: 'Abzeichen', ziel: sek('Erfinder-Abzeichen') },
      { e: '💡', n: 'Erfinder', ziel: document.getElementById('erfinder') },
      { e: '📓', n: 'Merkt', ziel: document.getElementById('merkt') }
    ], vor);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(los, 60); }); else setTimeout(los, 60);
})();
