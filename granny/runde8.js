/* Runde 8 (22.10.2026): polieren, interaktiv, Layout- und Technik-Ideen aus Top-Apps. Erzeugt aus kern8 + App-Teil. */
window.R8_CFG = {"k":"granny","offlineText":"Kein Internet. Rosa ist trotzdem da."};
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
      if (W8.stufenBilder && window.R7) R7.blatt(W8.name + ' ist gewachsen', '<div class="r8w-fund"><img src="' + W8.stufenBilder[neu] + '" alt="' + esc(W8.name + ', ' + W8.stufen[neu][1]) + '" width="240" height="240"></div><h3 class="r8w-ft">Stufe ' + (neu + 1) + ': ' + esc(W8.stufen[neu][1]) + '</h3><p class="r8w-fx">Danke für deine kleinen Schritte. ' + esc(W8.name) + ' freut sich mit dir.</p>');
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
    if (W8.stufenBilder && W8.stufenBilder[st]) { var bi = bild.querySelector('img'), soll = W8.stufenBilder[st]; if (bi.getAttribute('src') !== soll) { bi.src = soll; bi.alt = W8.name + ', Stufe ' + (st + 1) + ': ' + W8.stufen[st][1]; } }
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
    var bild = neu && W8.heimkehrBild ? W8.heimkehrBild : W8.ausflugBilder[i % W8.ausflugBilder.length];
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
      window.R7 && R7.blatt('So wächst ' + cfg.name, '<p class="r7-p">' + esc(cfg.wie) + '</p><ol class="r8w-stufen">' + cfg.stufen.map(function (x, i) { return '<li>' + (cfg.stufenBilder ? '<img src="' + cfg.stufenBilder[i] + '" alt="" width="48" height="48" loading="lazy" style="width:48px;height:48px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:10px">' : '') + '<b>' + esc(x[1]) + '</b> ab ' + x[0] + ' ' + esc(cfg.licht) + '</li>'; }).join('') + '</ol><p class="r7-leise">Nichts geht verloren, nichts geht kaputt. Ein Ruhetag pro Woche zählt mit. Alles bleibt nur auf diesem Gerät.</p>');
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

/* Rosa Runde 8: «Mein Tag» als drei Ringe, Postkarte als Bild schicken, Rückgängig. Alles bleibt auf dem Gerät. */
(function () {
  'use strict';
  var R = window.R7, Z = window.R8; if (!R || !Z) return;
  var esc = R.esc, el = R.el;
  function daten() { try { return JSON.parse(localStorage.getItem('granny.v1')) || {}; } catch (e) { return {}; } }
  function sag(t) {
    try {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t); u.lang = 'de-CH'; u.rate = 0.9;
      var v = speechSynthesis.getVoices().filter(function (x) { return /^de/.test(x.lang); });
      if (v.length) u.voice = v.filter(function (x) { return x.lang === 'de-CH'; })[0] || v[0];
      speechSynthesis.speak(u);
    } catch (e) {}
  }


  /* ---------- 4) Markt-Look (Vorbild: Apple «Assistive Access», Seniorenhandys): hell, grosse Kacheln, hoher Kontrast; Rosa nur als kleines Maskottchen ---------- */
  Z.thema({ bg: '#f6f1ea', karte: '#ffffff', rand: '#e6dccd', randS: '#a8957c', text: '#161412', leise: '#4a443d', akz: '#a8480f', akzT: '#8a3a0b', auf: '#ffffff', weich: '#fdeee0' }, [
    ':root{--bg:#f6f1ea;--card:#ffffff;--gold:#a8480f;--gold2:#8a3a0b;--text:#161412;--soft:#4a443d;--help:#b3261e;--ok:#1f7a4d}',
    'body{font-size:18px}',
    '.zeit .tag{color:#161412!important;font-size:32px}.zeit .uhr{color:#4a443d!important;font-size:22px}',
    '.buehne{height:auto!important;min-height:0!important;background:none!important;border:0!important;box-shadow:none!important;display:flex!important;justify-content:center;padding:4px 0;overflow:visible!important}',
    '.buehne .himmel,.buehne .dorf,.buehne .zzz{display:none!important}',
    '.granny-fig{position:relative!important;inset:auto!important;transform:none!important;width:112px!important;height:112px!important;margin:0 auto!important;animation:none!important}',
    '.granny-fig img{width:112px!important;height:112px!important;border-radius:50%!important;border:4px solid #fff!important;box-shadow:0 4px 16px rgba(0,0,0,.15)!important}',
    '.blase{background:#fff!important;color:#161412!important;border:2px solid #e6dccd!important;font-size:24px!important}',
    '.blase::before,.blase::after{border-color:transparent!important}',
    '.reden{background:#1f6f4a!important;color:#fff!important;box-shadow:0 6px 0 #134a31!important}',
    '.reden.hoert{background:#0f5132!important}',
    '.person{background:#fff!important;color:#161412!important;border:3px solid #e6dccd!important}',
    '.person small{color:#4a443d!important}',
    '.person .bild{background:#fdeee0!important;color:#8a3a0b!important}',
    '.person.leer{background:#fbf8f3!important;border:3px dashed #a8957c!important}',
    '.hilfe{background:#b3261e!important;color:#fff!important}',
    '.klemmt{background:#fff!important;color:#161412!important;border:3px solid #a8957c!important}',
    '.heute,.merk,.album,.erzaehl,.nachricht,.start{background:#fff!important;color:#161412!important;border:2px solid #e6dccd!important}',
    '.heute b{color:#8a3a0b!important}',
    '.angeh{color:#4a443d!important}',
    '.r8-ringe-satz{background:#fdeee0!important}',
    '.r8-ehrlich{background:#fff4e0!important;border-color:#e0b878!important;color:#4a3410!important}',
    '#figurStart{background:#f6f1ea!important;color:#161412!important}',
    '#figurStart::before{display:none!important}',
    '#figurStart img{width:min(44vw,180px)!important;height:min(44vw,180px)!important;border-radius:50%!important;border:6px solid #fff!important;box-shadow:0 8px 30px rgba(0,0,0,.15)!important;animation:none!important}',
    '#figurStart h1{background:none!important;-webkit-text-fill-color:#161412;color:#161412!important;animation:none!important;font-family:-apple-system,system-ui,sans-serif!important;font-weight:800!important}',
    '#figurStart p{color:#4a443d!important}#figurStart .gl-hallo{color:#8a3a0b!important}',
    '#figurStart button{background:#1f6f4a!important;color:#fff!important;box-shadow:none!important;animation:none!important;min-height:60px!important;font-size:1.25rem!important}',
    '#einst{background:#f6f1ea!important;color:#161412!important}',
    '#einst h2{color:#8a3a0b!important}#einst p,#einst label{color:#4a443d!important}',
    '#einst input,#einst select,#einst textarea{background:#fff!important;color:#161412!important;border:1px solid #a8957c!important}',
    '.kasten{background:#fff!important;border:1px solid #e6dccd}',
    '.check{color:#161412!important}',
    '.r4-knopf{background:#fff!important;color:#161412!important;border:3px solid #a8957c!important}',
    '.r4-knopf.gold{background:#a8480f!important;color:#fff!important;border-color:#a8480f!important}',
    '.r4-gut{background:#1f7a4d!important;color:#fff!important;box-shadow:0 6px 0 #134a31!important}.r4-gut.fertig{background:#e6dccd!important;color:#161412!important;box-shadow:none!important}',
    '.r4-feld{background:#fff!important;color:#161412!important;border:2px solid #a8957c!important}',
    '.r4-memo button{background:#fdeee0!important;border:3px solid #e6dccd!important}.r4-memo button.offen{background:#fff!important;border-color:#a8480f!important}',
    '.gold{background:#a8480f!important;color:#fff!important}.grau{background:#e6dccd!important;color:#161412!important}',
    '.merk button,.album .navi button,.st-zeile button{background:#fff!important;color:#161412!important;border:2px solid #a8957c!important}.st-zeile button.rec{background:#b3261e!important;color:#fff!important}',
    '.start button{background:#a8480f!important;color:#fff!important}.start{border:2px dashed #a8957c!important}.start h3,.merk h3,.album h3,.merk li b{color:#8a3a0b!important}',
    '.album .rund{color:#fff!important;box-shadow:none!important}.album .anruf{background:#1f7a4d!important;color:#fff!important}',
    '.merk li{border-bottom-color:#e6dccd!important}.merk p,.album .werzeile,.st-zeile small{color:#4a443d!important}',
    '.offline{background:#fff4e0!important;color:#4a3410!important}',
    '.person.leer .bild{background:#e6dccd!important;color:#8a3a0b!important}'
  ].join('\n'));

  /* ---------- 1) Mein Tag: drei Ringe (Vorbild: Apple Fitness-Ringe) ---------- */
  var RINGE = [
    { k: 't', n: 'Trinken', e: '💧', ziel: 6, c: '#5ec8ff', knopf: 'Ein Glas getrunken', bild: 'posen/trinken.jpg', alt: 'Rosa trinkt ein Glas Wasser', satz: ['Prost! Ein Glas Wasser.', 'Gut so. Wasser tut gut.', 'Noch ein Glas. Rosa trinkt mit.'], fertig: 'Sechs Gläser! Der blaue Ring ist zu.' },
    { k: 'b', n: 'Bewegen', e: '🚶', ziel: 3, c: '#8be08b', knopf: 'Eine kleine Runde', bild: 'posen/nicken.jpg', alt: 'Rosa nickt zufrieden', satz: ['Schön, ein paar Schritte.', 'Eine Runde durch die Wohnung zählt auch.', 'Rosa nickt: gut gemacht.'], fertig: 'Drei Runden! Der grüne Ring ist zu.' },
    { k: 'r', n: 'Reden', e: '📞', ziel: 1, c: '#ff8fae', knopf: 'Mit jemandem geredet', bild: 'posen/lachen.jpg', alt: 'Rosa lacht', satz: ['Wie schön, du hast mit jemandem geredet.'], fertig: 'Geredet! Der rosa Ring ist zu.' }
  ];
  var RAD = [86, 64, 42], UMF = RAD.map(function (r) { return 2 * Math.PI * r; });
  function tagDaten(k) { var A = R.hol('ringe', {}); return A[k || R.heuteK()] || { t: 0, b: 0, r: 0 }; }
  function setze(d) {
    var A = R.hol('ringe', {}); A[R.heuteK()] = d;
    var ks = Object.keys(A).sort(); while (ks.length > 30) delete A[ks.shift()];
    R.leg('ringe', A);
  }
  function svg(d, gross) {
    var s = '<svg viewBox="0 0 200 200" aria-hidden="true"' + (gross ? ' class="r8-ringe-svg"' : ' width="34" height="34"') + '><g transform="rotate(-90 100 100)">';
    RINGE.forEach(function (x, i) {
      var anteil = Math.min(1, (d[x.k] || 0) / x.ziel);
      s += '<circle cx="100" cy="100" r="' + RAD[i] + '" fill="none" stroke="' + x.c + '" stroke-opacity=".18" stroke-width="18"/>' +
        '<circle class="r8-ring r8-ring-' + x.k + '" cx="100" cy="100" r="' + RAD[i] + '" fill="none" stroke="' + x.c + '" stroke-width="18" stroke-linecap="round" stroke-dasharray="' + UMF[i].toFixed(1) + '" stroke-dashoffset="' + (UMF[i] * (1 - anteil)).toFixed(1) + '"' + (anteil === 0 ? ' stroke-opacity="0"' : '') + '/>';
    });
    return s + '</g></svg>';
  }
  var rk = el('<section class="r7 r7-karte r8-tag" aria-labelledby="r8r-t">' +
    '<p class="r7-eb">Ganz ohne Druck</p><h2 id="r8r-t">⭕ Mein Tag</h2>' +
    '<div class="r8-ringe-oben"><div class="r8-ringe-bild" aria-hidden="true"></div><div class="r8-ringe-fig"><img src="figur.jpg" alt="Rosa" width="96" height="96" loading="lazy"><p class="r8-ringe-satz" aria-live="polite">Tipp unten, was du heute gemacht hast. Rosa füllt die Ringe.</p></div></div>' +
    '<div class="r8-ringe-knoepfe"></div>' +
    '<div class="r8-woche" aria-label="Die letzten sieben Tage"></div>' +
    '<p class="r7-leise">Ein Tag mit leeren Ringen ist auch gut. Ruhetage gehören dazu.</p></section>');
  var fig = rk.querySelector('.r8-ringe-fig img'), figT = null;
  function zeigeRinge(neu) {
    var d = tagDaten();
    var alt = rk.querySelector('.r8-ringe-bild');
    if (!neu) alt.innerHTML = svg(d, true);
    else RINGE.forEach(function (x, i) {
      var c = alt.querySelector('.r8-ring-' + x.k); if (!c) return;
      var anteil = Math.min(1, (d[x.k] || 0) / x.ziel);
      c.setAttribute('stroke-opacity', anteil ? '1' : '0');
      c.setAttribute('stroke-dashoffset', (UMF[i] * (1 - anteil)).toFixed(1));
    });
    var kn = rk.querySelector('.r8-ringe-knoepfe'); kn.innerHTML = '';
    RINGE.forEach(function (x) {
      var n = d[x.k] || 0, voll = n >= x.ziel;
      var b = el('<button type="button" class="r8-ring-knopf' + (voll ? ' voll' : '') + '" style="--rc:' + x.c + '"><span class="r8-rk-e" aria-hidden="true">' + (voll ? '✓' : x.e) + '</span><span class="r8-rk-t"><b>' + esc(x.knopf) + '</b><small>' + esc(x.n) + ': ' + n + ' von ' + x.ziel + '</small></span></button>');
      b.onclick = function () { tippe(x, b); };
      kn.appendChild(b);
    });
    var w = rk.querySelector('.r8-woche'); w.innerHTML = '';
    var TG = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    for (var i = 6; i >= 0; i--) {
      var dt = new Date(); dt.setDate(dt.getDate() - i);
      var dd = tagDaten(R.heuteK(dt));
      w.appendChild(el('<div class="r8-wt' + (i === 0 ? ' r8-wt-heute' : '') + '">' + svg(dd, false) + '<span>' + (i === 0 ? 'Heute' : TG[dt.getDay()]) + '</span></div>'));
    }
  }
  function tippe(x, b) {
    var d = tagDaten(), vor = JSON.parse(JSON.stringify(d));
    d[x.k] = (d[x.k] || 0) + 1; setze(d);
    var satz = d[x.k] === x.ziel ? x.fertig : x.satz[(d[x.k] - 1) % x.satz.length];
    var alleZu = RINGE.every(function (y) { return (d[y.k] || 0) >= y.ziel; });
    var warZu = RINGE.every(function (y) { return (vor[y.k] || 0) >= y.ziel; });
    if (alleZu && !warZu) satz = 'Alle drei Ringe sind zu. Was für ein schöner Tag!';
    rk.querySelector('.r8-ringe-satz').textContent = satz;
    fig.src = alleZu && !warZu ? 'posen/herz.jpg' : x.bild; fig.alt = x.alt;
    fig.classList.remove('r8-hops'); void fig.offsetWidth; fig.classList.add('r8-hops');
    clearTimeout(figT); figT = setTimeout(function () { fig.src = 'figur.jpg'; fig.alt = 'Rosa'; }, 4000);
    zeigeRinge(true);
    sag(satz);
    Z.licht('ring-' + x.k);
    if (d[x.k] === x.ziel || (alleZu && !warZu)) R.feier(rk.querySelector('.r8-ringe-bild'), alleZu && !warZu ? 16 : 8);
    Z.toast(x.e + ' ' + x.n + ': ' + Math.min(d[x.k], 99) + ' von ' + x.ziel, { undo: function () { setze(vor); zeigeRinge(true); rk.querySelector('.r8-ringe-satz').textContent = 'Zurückgenommen. Kein Problem.'; } });
  }

  /* ---------- 2) Postkarte als Bild (Vorbild: Instagram «Teilen als Bild») ---------- */
  var MOTIVE = [['r8bilder/postkarte.jpg', 'Rosa mit Postkarte'], ['posen/winken.jpg', 'Rosa winkt'], ['posen/herz.jpg', 'Rosa mit Herz'], ['posen/lachen.jpg', 'Rosa lacht'], ['posen/kerze.jpg', 'Rosa mit Kerze']];
  var SAETZE = ['Mir geht es gut.', 'Ich denke an dich.', 'Danke für deinen Besuch.', 'Ruf mich an, wenn du magst.', 'Gute Nacht, schlaf gut.'];
  var pk = el('<section class="r7 r7-karte" aria-labelledby="r8p-t"><p class="r7-eb">Ein Gruss für die Familie</p><h2 id="r8p-t">💌 Postkarte schicken</h2>' +
    '<div style="display:flex;gap:16px;align-items:center"><img class="r7-figur" src="posen/herz.jpg" alt="Rosa hält ein Herz" loading="lazy" width="72" height="72"><p class="r7-p" style="margin:0">Rosa malt dir eine Karte mit einem lieben Satz. Dann schickst du sie mit einem Tipp.</p></div>' +
    '<button type="button" class="r7-btn voll gross r8-pk-los" style="margin-top:16px">💌 Karte machen</button></section>');
  var wahl = { m: 0, s: 0 };
  function laden(src) { return new Promise(function (ok) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src; }); }
  function rund(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function umbrechen(c, t, maxB) { var w = t.split(' '), z = [], l = ''; w.forEach(function (x) { var p = l ? l + ' ' + x : x; if (c.measureText(p).width > maxB && l) { z.push(l); l = x; } else l = p; }); if (l) z.push(l); return z; }
  function malen() {
    var cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350;
    var c = cv.getContext('2d');
    var g = c.createLinearGradient(0, 0, 0, 1350); g.addColorStop(0, '#1d2f72'); g.addColorStop(1, '#0a1230');
    c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
    c.fillStyle = '#ffe9a8';
    [[120, 110, 3], [940, 160, 2], [760, 70, 2.5], [300, 230, 1.8], [980, 420, 2], [80, 520, 2.2]].forEach(function (s) { c.globalAlpha = .7; c.beginPath(); c.arc(s[0], s[1], s[2] * 2, 0, 7); c.fill(); });
    c.globalAlpha = 1;
    c.strokeStyle = '#f2c14e'; c.lineWidth = 6; rund(c, 36, 36, 1008, 1278, 48); c.stroke();
    return laden(MOTIVE[wahl.m][0]).then(function (im) {
      if (im) { c.save(); rund(c, 190, 150, 700, 700, 60); c.clip(); c.drawImage(im, 190, 150, 700, 700); c.restore(); c.strokeStyle = '#f2c14e'; c.lineWidth = 8; rund(c, 190, 150, 700, 700, 60); c.stroke(); }
      c.fillStyle = '#ffe08a'; c.textAlign = 'center';
      c.font = '700 76px Georgia, "Times New Roman", serif';
      var z = umbrechen(c, SAETZE[wahl.s], 900);
      z.forEach(function (l, i) { c.fillText(l, 540, 990 + i * 92); });
      var n = daten().name, d = new Date();
      c.fillStyle = '#dfe5fb'; c.font = '400 44px system-ui, -apple-system, sans-serif';
      c.fillText((n ? 'Von ' + n + ' · ' : '') + d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear(), 540, 990 + z.length * 92 + 40);
      c.fillStyle = '#f2c14e'; c.font = '700 34px system-ui, -apple-system, sans-serif'; c.fillText('🌹 Rosa', 540, 1270);
      return cv;
    });
  }
  pk.querySelector('.r8-pk-los').addEventListener('click', function () {
    var b = R.blatt('Postkarte machen',
      '<p class="r7-p">1. Bild wählen</p><div class="r8-pk-m" role="radiogroup" aria-label="Bild"></div>' +
      '<p class="r7-p" style="margin-top:16px">2. Satz wählen</p><div class="r8-pk-s" role="radiogroup" aria-label="Satz"></div>' +
      '<div class="r8-pk-vor"><img alt="Vorschau der Postkarte"></div>' +
      '<div class="r7-reihe"><button type="button" class="r7-btn voll gross r8-pk-teilen">📤 Karte schicken</button></div>' +
      '<p class="r7-leise r8-pk-tipp"></p>');
    var B = b.el;
    function wahlen() {
      var m = B.querySelector('.r8-pk-m'); m.innerHTML = '';
      MOTIVE.forEach(function (x, i) {
        var k = el('<button type="button" role="radio" aria-checked="' + (i === wahl.m) + '" aria-label="' + esc(x[1]) + '"><img src="' + x[0] + '" alt="" width="64" height="64"></button>');
        k.onclick = function () { wahl.m = i; Z.vt(wahlen); vorschau(); };
        m.appendChild(k);
      });
      var s = B.querySelector('.r8-pk-s'); s.innerHTML = '';
      SAETZE.forEach(function (x, i) {
        var k = el('<button type="button" class="r7-btn' + (i === wahl.s ? ' voll' : '') + '" role="radio" aria-checked="' + (i === wahl.s) + '">' + esc(x) + '</button>');
        k.onclick = function () { wahl.s = i; wahlen(); vorschau(); };
        s.appendChild(k);
      });
    }
    var url = null;
    function vorschau() {
      malen().then(function (cv) {
        try { cv.toBlob(function (bl) { if (!bl) return; if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(bl); B.querySelector('.r8-pk-vor img').src = url; B._blob = bl; }, 'image/jpeg', .9); }
        catch (e) { B.querySelector('.r8-pk-tipp').textContent = 'Die Vorschau geht hier leider nicht.'; }
      });
    }
    B.querySelector('.r8-pk-teilen').onclick = function () {
      var bl = B._blob, tipp = B.querySelector('.r8-pk-tipp');
      if (!bl) return;
      var f = null; try { f = new File([bl], 'granny-postkarte.jpg', { type: 'image/jpeg' }); } catch (e) {}
      if (f && navigator.canShare && navigator.canShare({ files: [f] })) {
        navigator.share({ files: [f], text: SAETZE[wahl.s] }).then(function () { Z.toast('Karte unterwegs 💌'); R.feier(B.querySelector('.r8-pk-vor'), 10); }).catch(function (e) { if (!e || e.name !== 'AbortError') tipp.textContent = 'Teilen geht hier nicht. Halte den Finger lange auf die Karte und wähle «Bild sichern».'; });
      } else { tipp.textContent = 'Halte den Finger lange auf die Karte und wähle «Bild sichern» oder «Teilen».'; R.feier(B.querySelector('.r8-pk-vor'), 6); }
      sag(SAETZE[wahl.s]); Z.licht('karte');
    };
    wahlen(); vorschau();
  });


  /* ---------- 3) Wächst mit dir (Vorbild: Finch) + SOS (Vorbild: Headspace) ---------- */
  var WCFG = {
    k: 'granny', name: 'Rosa', licht: 'Herzli', lichtE: '💗', bild: 'r8bilder/stufe-1.jpg', vorlesenAuto: true,
    stufenBilder: ['r8bilder/stufe-1.jpg', 'r8bilder/stufe-2.jpg', 'r8bilder/stufe-3.jpg', 'r8bilder/stufe-4.jpg', 'r8bilder/stufe-5.jpg'],
    heimkehrBild: ['r8bilder/ausflug.jpg', 'Rosa ist zurück vom Ausflug'],
    stufen: [[0, 'Rosenknospe'], [5, 'Gartenfreundin'], [15, 'Dorf-Rosa'], [35, 'Herzens-Rosa'], [70, 'Goldene Rosa']],
    wie: 'Jedes Mal, wenn du etwas Kleines machst (einen Ring füllen, Rosa etwas erzählen, Bilder anschauen, eine Karte schicken, einmal ruhig atmen), bekommt Rosa ein Herzli. Mit genug Herzli wächst sie eine Stufe. Und einmal am Tag geht sie auf einen kleinen Ausflug und bringt dir eine Geschichte mit.',
    schritte: [['#erzaehl', 'erzaehl'], ['#reden', 'reden'], ['.r7-dia-los', 'dia'], ['.r4-memo button', 'memo'], ['.r7-geb-neu button[type=submit]', 'geb']],
    ausflugBilder: [['posen/winken.jpg', 'Rosa winkt, zurück vom Ausflug'], ['posen/lachen.jpg', 'Rosa lacht'], ['posen/herz.jpg', 'Rosa mit Herz'], ['posen/trinken.jpg', 'Rosa mit einem Glas'], ['posen/suchen.jpg', 'Rosa sucht ihre Brille'], ['posen/nicken.jpg', 'Rosa nickt']],
    ausflug: [
      ['Auf dem Markt', '🍎', 'Rosa war auf dem Markt. Die Marktfrau hat ihr den schönsten Apfel geschenkt, weil Rosa so herzlich gelacht hat.'],
      ['Im Park', '🦆', 'Rosa hat die Enten gefüttert. Eine kleine Ente ist ihr bis zum Bänkli nachgewatschelt.'],
      ['Beim Coiffeur', '💇', 'Rosa war beim Coiffeur und hat dort ihre Brille gesucht. Sie war auf dem Kopf, wie immer.'],
      ['Im Garten', '🌹', 'Die letzte Rose im Garten ist aufgegangen. Rosa hat ihr leise «Grüezi» gesagt.'],
      ['Beim Bäcker', '🥐', 'Rosa hat ein Gipfeli geholt und dem Bäcker ein Rätsel erzählt. Er rätselt immer noch.'],
      ['Am See', '🛶', 'Rosa sass am See und hat den Schiffen zugewinkt. Eines hat zurückgehupt.'],
      ['Auf dem Estrich', '📦', 'Rosa hat eine alte Schachtel gefunden. Darin: Fotos vom Tanzabend von früher.'],
      ['Im Café', '☕', 'Rosa hat mit einer Freundin Kaffee getrunken. Sie haben so gelacht, dass der Kellner mitgelacht hat.'],
      ['Beim Spazieren', '🍂', 'Rosa hat das schönste Herbstblatt gesucht und für dich mitgebracht.'],
      ['In der Bibliothek', '📚', 'Rosa hat ein Buch mit grosser Schrift ausgeliehen. Spannend bis zur letzten Seite.'],
      ['Auf dem Bänkli', '🐦', 'Ein Spatz hat sich neben Rosa gesetzt. Zusammen haben sie die Sonne genossen.'],
      ['Bei der Nachbarin', '🍰', 'Die Nachbarin hat Zwetschgenkuchen gebacken. Rosa hat das Rezept für dich gemerkt.']
    ]
  };

  var css = document.createElement('style');
  css.textContent = [
    '.r8-ringe-oben{display:flex;align-items:center;gap:16px;margin:8px 0 16px}',
    '.r8-ringe-bild{flex:none;width:min(46vw,190px);aspect-ratio:1}',
    '.r8-ringe-svg{width:100%;height:100%;display:block}',
    '.r8-ring{transition:stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)}',
    '.r8-ringe-fig{flex:1;min-width:0;display:grid;justify-items:start;gap:8px}',
    '.r8-ringe-fig img{width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid var(--r7-gold)}',
    '.r8-ringe-satz{margin:0;padding:10px 14px;border-radius:16px 16px 16px 4px;background:#fffaf0;color:#1d2550;font-size:17px;line-height:1.4}',
    '.r8-hops{animation:r8Hops .6s cubic-bezier(.3,.7,.3,1)}',
    '@keyframes r8Hops{30%{transform:translateY(-8px) scale(1.06)}60%{transform:translateY(0) scale(.98)}}',
    '.r8-ringe-knoepfe{display:grid;gap:8px}',
    '.r8-ring-knopf{display:flex;align-items:center;gap:14px;width:100%;min-height:64px;padding:8px 16px 8px 8px;border-radius:20px;border:2px solid var(--rc);background:rgba(255,255,255,.05);color:var(--r7-tinte);font:inherit;text-align:left;cursor:pointer;transition:transform .12s,background .2s}',
    '.r8-ring-knopf:active{transform:scale(.97)}',
    '.r8-ring-knopf.voll{background:color-mix(in srgb,var(--rc) 22%,transparent)}',
    '.r8-rk-e{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font-size:26px;background:color-mix(in srgb,var(--rc) 30%,transparent)}',
    '.r8-rk-t b{display:block;font-size:19px;line-height:1.25}',
    '.r8-rk-t small{color:var(--r7-leise);font-size:15px}',
    '.r8-woche{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:16px;text-align:center}',
    '.r8-wt{display:grid;justify-items:center;gap:2px;font-size:13px;color:var(--r7-leise)}',
    '.r8-wt.r8-wt-heute{color:var(--r7-gold2);font-weight:800}',
    '.r8-pk-m{display:flex;gap:8px;flex-wrap:wrap}',
    '.r8-pk-m button{padding:0;border:3px solid transparent;border-radius:18px;background:none;cursor:pointer;min-width:44px;min-height:44px}',
    '.r8-pk-m button[aria-checked="true"]{border-color:var(--r7-gold)}',
    '.r8-pk-m img{display:block;width:64px;height:64px;border-radius:14px;object-fit:cover}',
    '.r8-pk-s{display:flex;gap:8px;flex-wrap:wrap}',
    '.r8-pk-vor{margin-top:16px;display:flex;justify-content:center}',
    '.r8-pk-vor img{width:min(100%,300px);aspect-ratio:1080/1350;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.4);background:#0a1230;-webkit-touch-callout:default}',
    '.r8-ehrlich{margin:8px 0 0;padding:10px 14px;border-radius:14px;background:rgba(242,193,78,.12);border:1px solid rgba(242,193,78,.4);color:#ffe9a8;font-size:16px;line-height:1.4}',
    '@media (prefers-reduced-motion:reduce){.r8-ring{transition:none}.r8-hops{animation:none}}'
  ].join('\n');
  document.head.appendChild(css);

  function los() {
    var h = document.getElementById('heute');
    if (h && h.parentNode) h.parentNode.insertBefore(rk, h.nextSibling); else R.einsetzen(rk);
    R.einsetzen(pk);
    var wc = Z.waechst(WCFG), sb = Z.sos({ name: 'Rosa', bild: 'r8bilder/atem.jpg', unter: 'Mit Rosa atmen. Ein Tipp, sofort.', ende: 'Gut gemacht. Schön ruhig. Rosa ist stolz auf dich.' });
    var rd = document.getElementById('reden');
    if (rd && rd.parentNode) { rd.parentNode.insertBefore(wc, rd.nextSibling); rd.parentNode.insertBefore(sb, rd.nextSibling); } else { R.einsetzen(sb); R.einsetzen(wc); }
    R.namen(wc);
    zeigeRinge(false);
    /* Ehrlich: Erinnerungen mit Uhrzeit kommen nur, solange Rosa offen ist */
    var hz = String(daten().heute || '');
    if (h && /\b\d{1,2}([:.]\d{2}| ?Uhr)/.test(hz)) {
      var ehrlich = el('<p class="r8-ehrlich">⏰ Rosa gongt zur Uhrzeit, solange sie offen ist. Am besten am Ladekabel stehen lassen.</p>');
      h.parentNode.insertBefore(ehrlich, h.nextSibling);
    }
    R.namen(rk); R.namen(pk);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(los, 0); }); else setTimeout(los, 0);
})();
/* Rosa Runde 8b (22.10.2026): Medikamenten-Erinnerung.
   Angehörige tragen Medikamente mit Uhrzeit ein, Rosa zeigt die Tagesliste mit grossem «Genommen»-Knopf und Rückgängig.
   Ehrlich: Erinnerung nur, solange Rosa offen ist. Kein Rat zu Medikamenten oder Dosierung. Alles bleibt auf dem Gerät. */
(function () {
  'use strict';
  var R = window.R7, Z = window.R8; if (!R || !Z) return;
  var esc = R.esc, el = R.el;
  function zwei(n) { return ('0' + n).slice(-2); }
  function jetztHM() { var d = new Date(); return zwei(d.getHours()) + ':' + zwei(d.getMinutes()); }
  function liste() { var l = R.hol('medi', []); return Array.isArray(l) ? l : []; }
  function legListe(l) { R.leg('medi', l); }
  function tag(k) { var A = R.hol('mediTag', {}); return A[k || R.heuteK()] || {}; }
  function legTag(t) {
    var A = R.hol('mediTag', {}); A[R.heuteK()] = t;
    var ks = Object.keys(A).sort(); while (ks.length > 14) delete A[ks.shift()];
    R.leg('mediTag', A);
  }
  function uhr(z) { var p = String(z || '').split(':'); return (+p[0]) + (p[1] && p[1] !== '00' ? '.' + p[1] : '') + ' Uhr'; }
  function sag(t) {
    try {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t); u.lang = 'de-CH'; u.rate = 0.9;
      var v = speechSynthesis.getVoices().filter(function (x) { return /^de/.test(x.lang); });
      if (v.length) u.voice = v.filter(function (x) { return x.lang === 'de-CH'; })[0] || v[0];
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  var AC = null;
  function gong() {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      [523.25, 659.25].forEach(function (f, i) {
        var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * 0.45;
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
        o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + 1.7);
      });
    } catch (e) {}
  }

  var css = document.createElement('style');
  css.textContent = [
    '.r8m-ehrlich{margin:4px 0 16px;padding:12px 14px;border-radius:14px;background:#fff4e0;border:1px solid #e0b878;color:#4a3410;font-size:16px;line-height:1.45}',
    '.r8m-liste{list-style:none;margin:0;padding:0;display:grid;gap:12px}',
    '.r8m-z{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;padding:14px;border-radius:20px;background:#fbf8f3;border:2px solid #e6dccd;color:#161412}',
    '.r8m-z.dran{border-color:#a8480f;background:#fdeee0;box-shadow:0 0 0 4px rgba(168,72,15,.12)}',
    '.r8m-z.ok{background:#eef7f1;border-color:#9cc9ad}',
    '.r8m-kopf{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}',
    '.r8m-zeit{font-size:26px;font-weight:800;color:#8a3a0b;font-variant-numeric:tabular-nums}',
    '.r8m-name{font-size:24px;font-weight:800;line-height:1.2;min-width:0;overflow-wrap:anywhere}',
    '.r8m-hinweis{margin:0;font-size:18px;color:#4a443d;overflow-wrap:anywhere}',
    '.r8m-gen{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:72px;padding:12px 20px;border:0;border-radius:20px;background:#1f6f4a;color:#fff;font:inherit;font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 6px 0 #134a31}',
    '.r8m-gen:active{transform:translateY(3px);box-shadow:0 3px 0 #134a31}',
    '.r8m-fertig{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:20px;font-weight:700;color:#1b5e3b}',
    '.r8m-zurueck{min-height:48px;padding:8px 18px;border-radius:999px;border:2px solid #a8957c;background:#fff;color:#161412;font:inherit;font-size:17px;font-weight:700;cursor:pointer}',
    '.r8m-leer{margin:0;padding:16px;border-radius:16px;border:2px dashed #a8957c;background:#fbf8f3;font-size:19px;color:#4a443d}',
    '.r8m-einr{margin-top:16px;border-top:1px solid #e6dccd;padding-top:12px}',
    '.r8m-einr summary{min-height:48px;display:flex;align-items:center;font-size:18px;font-weight:700;color:#8a3a0b;cursor:pointer}',
    '.r8m-form{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin-top:8px}',
    '.r8m-form .r8m-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}',
    '.r8m-form input{width:100%;box-sizing:border-box;font-size:18px!important}',
    '.r8m-plan{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px}',
    '.r8m-plan li{display:flex;align-items:center;gap:12px;padding:8px 8px 8px 14px;border-radius:14px;background:#fff;border:1px solid #e6dccd;font-size:17px}',
    '.r8m-plan li span{flex:1;min-width:0;overflow-wrap:anywhere}',
    '.r8m-plan li button{flex:none;min-height:44px;min-width:44px;padding:0 14px;border-radius:999px;border:1px solid #a8957c;background:#fff;color:#161412;font:inherit;font-size:15px;font-weight:700;cursor:pointer}',
    '.r8m-klein{margin:8px 0 0;font-size:16px;color:#4a443d}',
    '.r8m-ruf{animation:r8mRuf 1s ease-in-out 3}',
    '@keyframes r8mRuf{50%{box-shadow:0 0 0 10px rgba(168,72,15,.25)}}',
    '@media (prefers-reduced-motion:reduce){.r8m-ruf{animation:none}.r8m-gen:active{transform:none}}'
  ].join('\n');
  document.head.appendChild(css);

  var karte = el('<section class="r7 r7-karte r8m" id="r8Medi" aria-labelledby="r8m-t">' +
    '<p class="r7-eb">Jeden Tag</p><h2 id="r8m-t">💊 Meine Medikamente</h2>' +
    '<p class="r8m-ehrlich">⏰ <b>Ehrlich gesagt:</b> Rosa erinnert nur, solange sie offen ist. Was sicher klingeln muss, bitte zusätzlich im Wecker des Handys eintragen. Rosa gibt keinen Rat zu Medikamenten oder Mengen. Das entscheiden Ärztin, Arzt oder Apotheke.</p>' +
    '<ul class="r8m-liste" aria-live="polite"></ul>' +
    '<details class="r8m-einr"><summary>Für Angehörige: Medikamente eintragen</summary>' +
    '<form class="r8m-form" novalidate><label>Name des Medikaments<input name="mname" maxlength="60" autocomplete="off" placeholder="z. B. Blutdruck-Tablette"></label>' +
    '<div class="r8m-2"><label>Uhrzeit<input name="mzeit" type="time" value="08:00" required></label><label>Hinweis (wie auf dem Plan)<input name="mhinweis" maxlength="60" autocomplete="off" placeholder="z. B. zum Essen"></label></div>' +
    '<button type="submit" class="r7-btn voll gross">Eintragen</button></form>' +
    '<p class="r8m-klein">Bitte genau so eintragen, wie es auf dem Medikamentenplan steht. Für mehrere Zeiten am Tag das Medikament mehrmals eintragen.</p>' +
    '<ul class="r8m-plan" aria-label="Eingetragene Medikamente"></ul></details></section>');
  var ul = karte.querySelector('.r8m-liste'), plan = karte.querySelector('.r8m-plan'), form = karte.querySelector('form');

  function zeigen() {
    var l = liste().slice().sort(function (a, b) { return a.zeit < b.zeit ? -1 : a.zeit > b.zeit ? 1 : 0; });
    var t = tag(), jetzt = jetztHM();
    if (!l.length) {
      ul.innerHTML = '<li><p class="r8m-leer">Noch keine Medikamente eingetragen. Angehörige können sie unten eintragen.</p></li>';
    } else {
      ul.innerHTML = l.map(function (m) {
        var gen = t[m.id], dran = !gen && m.zeit <= jetzt;
        return '<li class="r8m-z' + (gen ? ' ok' : dran ? ' dran' : '') + '" data-id="' + esc(m.id) + '">' +
          '<div class="r8m-kopf"><span class="r8m-zeit">' + esc(uhr(m.zeit)) + '</span><span class="r8m-name">' + esc(m.name) + '</span></div>' +
          (m.hinweis ? '<p class="r8m-hinweis">' + esc(m.hinweis) + '</p>' : '') +
          (gen ? '<div class="r8m-fertig"><span>✓ Genommen um ' + esc(uhr(gen)) + '</span><button type="button" class="r8m-zurueck" data-a="zurueck" aria-label="' + esc(m.name) + ': doch noch nicht genommen">Rückgängig</button></div>'
            : '<button type="button" class="r8m-gen" data-a="gen"><span aria-hidden="true">' + (dran ? '🔔' : '💊') + '</span>' + esc(m.name) + ' genommen</button>') +
          '</li>';
      }).join('');
    }
    plan.innerHTML = liste().map(function (m) {
      return '<li><span><b>' + esc(uhr(m.zeit)) + '</b> · ' + esc(m.name) + (m.hinweis ? ' · ' + esc(m.hinweis) : '') + '</span><button type="button" data-a="weg" data-id="' + esc(m.id) + '" aria-label="' + esc(m.name) + ' um ' + esc(uhr(m.zeit)) + ' entfernen">Entfernen</button></li>';
    }).join('');
  }

  function genommen(id, an) {
    var t = tag(), vor = t[id];
    if (an) t[id] = jetztHM(); else delete t[id];
    legTag(t); zeigen();
    var m = liste().filter(function (x) { return x.id === id; })[0] || { name: 'Medikament' };
    if (an) {
      sag('Gut. ' + m.name + ' ist eingetragen.');
      try { Z.licht('medi'); } catch (e) {}
      Z.toast('✓ ' + m.name + ' genommen', { undo: function () { var u = tag(); if (vor) u[id] = vor; else delete u[id]; legTag(u); zeigen(); } });
      var b = ul.querySelector('[data-id="' + id + '"] .r8m-zurueck'); if (b) b.focus({ preventScroll: true });
    } else {
      Z.toast('Zurückgenommen. Kein Problem.', { undo: function () { var u = tag(); u[id] = vor; legTag(u); zeigen(); } });
      var g = ul.querySelector('[data-id="' + id + '"] .r8m-gen'); if (g) g.focus({ preventScroll: true });
    }
  }

  karte.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'); if (!b) return;
    var li = b.closest('[data-id]'), id = b.getAttribute('data-id') || (li && li.getAttribute('data-id'));
    if (b.dataset.a === 'gen') genommen(id, true);
    else if (b.dataset.a === 'zurueck') genommen(id, false);
    else if (b.dataset.a === 'weg') {
      var alt = liste(), m = alt.filter(function (x) { return x.id === id; })[0];
      legListe(alt.filter(function (x) { return x.id !== id; })); zeigen();
      Z.toast((m ? m.name : 'Medikament') + ' entfernt', { undo: function () { legListe(alt); zeigen(); } });
    }
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fN = form.elements.mname, fZ = form.elements.mzeit, fH = form.elements.mhinweis;
    var n = fN.value.trim(), z = fZ.value, h = fH.value.trim();
    if (!n) { fN.focus(); Z.toast('Bitte den Namen eintragen.'); return; }
    if (!/^\d{2}:\d{2}$/.test(z)) { fZ.focus(); Z.toast('Bitte eine Uhrzeit wählen.'); return; }
    var l = liste(); l.push({ id: 'm' + Date.now().toString(36), name: n, zeit: z, hinweis: h }); legListe(l);
    fN.value = ''; fH.value = '';
    zeigen(); Z.toast('💊 ' + n + ' um ' + uhr(z) + ' eingetragen');
    fN.focus();
  });

  /* Erinnerung, solange Rosa offen ist: Gong, Vorlesen, Karte leuchtet */
  var gerufen = {};
  function pruefen() {
    var k = R.heuteK(), t = tag(), jetzt = jetztHM(), neu = false;
    liste().forEach(function (m) {
      var key = k + m.id;
      if (t[m.id] || gerufen[key] || m.zeit > jetzt) return;
      var d = new Date(), p = m.zeit.split(':'), ziel = new Date(d.getFullYear(), d.getMonth(), d.getDate(), +p[0], +p[1]);
      gerufen[key] = 1;
      if (d - ziel > 90 * 60000) return; /* länger her: still als «dran» zeigen, nicht laut */
      neu = true;
      gong();
      setTimeout(function () { sag('Es ist ' + uhr(m.zeit) + '. Zeit für ' + m.name + '.'); }, 900);
      Z.toast('🔔 ' + uhr(m.zeit) + ': ' + m.name, { ms: 8000 });
    });
    zeigen();
    if (neu) { karte.classList.remove('r8m-ruf'); void karte.offsetWidth; karte.classList.add('r8m-ruf'); }
  }

  function los() {
    var ring = document.querySelector('.r8-tag'), h = document.getElementById('heute');
    var vor = ring || h;
    if (vor && vor.parentNode) vor.parentNode.insertBefore(karte, vor.nextSibling); else R.einsetzen(karte);
    R.namen(karte);
    /* beim Start nicht für alles Vergangene gongen: nur, was in den letzten 90 Minuten fällig wurde */
    pruefen();
    setInterval(pruefen, 30000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) pruefen(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(los, 20); }); else setTimeout(los, 20);
})();
