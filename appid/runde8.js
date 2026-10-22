/* Runde 8 (22.10.2026): polieren, interaktiv, Layout- und Technik-Ideen aus Top-Apps. Erzeugt aus kern8 + App-Teil. */
window.R8_CFG = {"k":"flo","offlineText":"Offline. Flo notiert trotzdem alles."};
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

/* Food and Flow Runde 8: Wochen-Story, Flo-Kette mit Ruhetag, Teller-Baukasten zum Ziehen. Ohne Kalorien, ohne Druck, alles auf dem Gerät. */
(function () {
  'use strict';
  var R = window.R7, Z = window.R8; if (!R || !Z) return;
  var esc = R.esc, el = R.el;
  var F = function () { return window.FLO || {}; };
  function pose(n, ms, p) { try { if (F().pose) F().pose(n, ms, p); } catch (e) {} }
  function satz(t) { try { if (F().floSatz) F().floSatz(t); } catch (e) {} }
  function hol(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function dk(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function rk(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function tag(i) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - i); return d; }
  function eintraege(d) { var s = hol('appid-v1', {}); return ((s && s.days) || {})[dk(d)] || []; }
  function farben(d) { return (hol('flo.regen', {}) || {})[rk(d)] || []; }
  function aktiv(d) { return eintraege(d).length > 0 || farben(d).length > 0; }
  function wochenK(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dk(x); }

  /* ---------- 1) Flo-Kette mit Ruhetag (Vorbild: Duolingo «Serien-Schutz») ---------- */
  function kette() {
    var n = 0, tage = [], ruhe = {}, i = 0, aus = false;
    if (!aktiv(tag(0))) { tage.push({ d: tag(0), z: 'heute' }); i = 1; }
    for (; i < 60; i++) {
      var d = tag(i);
      if (aktiv(d)) { n++; tage.push({ d: d, z: 'ja' }); continue; }
      var w = wochenK(d);
      if (n > 0 && !ruhe[w]) { ruhe[w] = 1; tage.push({ d: d, z: 'ruhe' }); continue; }
      aus = true; tage.push({ d: d, z: 'nein' }); break;
    }
    while (tage.length < 14) tage.push({ d: tag(tage.length), z: 'nein' });
    var dieseWoche = wochenK(tag(0));
    return { n: n, tage: tage.slice(0, 14).reverse(), ruheFrei: !ruhe[dieseWoche] };
  }
  var kk = el('<section class="r7 r7-karte" aria-labelledby="r8k-t"><p class="r7-eb">Ruhetage zählen mit</p><h2 id="r8k-t">🌿 Deine Flo-Kette</h2>' +
    '<p class="r7-p r8-k-n" aria-live="polite"></p><div class="r8-k-tage" role="img"></div>' +
    '<p class="r7-leise">Jeder Tag mit einem Eintrag oder einer Farbe hängt ein Blatt an. Verpasst du einen Tag, legt Flo eine 🌙 Ruhetag-Feder hin: einmal pro Woche reisst die Kette nicht.</p></section>');
  function ketteZeigen() {
    var k = kette(), box = kk.querySelector('.r8-k-tage');
    kk.querySelector('.r8-k-n').innerHTML = k.n ? '<b class="r8-k-zahl">' + k.n + '</b> ' + (k.n === 1 ? 'Tag' : 'Tage') + ' in Folge. ' + (k.ruheFrei ? 'Diese Woche hast du noch eine Ruhetag-Feder.' : 'Die Ruhetag-Feder dieser Woche ist schon gebraucht. Auch gut.') : 'Noch keine Kette. Ein Eintrag oder eine Farbe heute, und das erste Blatt hängt.';
    box.innerHTML = '';
    var TG = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    k.tage.forEach(function (t) {
      var sym = t.z === 'ja' ? '🌿' : t.z === 'ruhe' ? '🌙' : t.z === 'heute' ? '◌' : '·';
      box.appendChild(el('<span class="r8-k-t ' + t.z + '"><i aria-hidden="true">' + sym + '</i><small>' + TG[t.d.getDay()] + '</small></span>'));
    });
    box.setAttribute('aria-label', 'Die letzten 14 Tage: ' + k.tage.filter(function (t) { return t.z === 'ja'; }).length + ' mit Eintrag, ' + k.tage.filter(function (t) { return t.z === 'ruhe'; }).length + ' Ruhetag');
    return k;
  }

  /* ---------- 2) Wochen-Story (Vorbild: Instagram-Storys, Spotify Wrapped) ---------- */
  var FARB = [['rot', '🍅', 'Rot', '#e2584d'], ['orange', '🥕', 'Orange', '#ef9a3c'], ['gelb', '🍋', 'Gelb', '#f2c94c'], ['gruen', '🥦', 'Grün', '#5fb36b'], ['violett', '🍇', 'Violett', '#8f6cc4']];
  var TAGE_N = 30;
  function woche() {
    var m = 0, tg = 0, bew = 0, f = {};
    for (var i = 0; i < TAGE_N; i++) {
      var d = tag(i), L = eintraege(d);
      var essen = L.filter(function (x) { return x.meal !== 'act' && !x.act; });
      if (L.length) tg++;
      var mahl = {}; essen.forEach(function (x) { mahl[x.meal || 'x'] = 1; }); m += Object.keys(mahl).length;
      bew += L.filter(function (x) { return x.act || x.meal === 'act'; }).length;
      farben(d).forEach(function (k) { f[k] = (f[k] || 0) + 1; });
    }
    return { m: m, tg: tg, bew: bew, f: f };
  }
  function folien() {
    var w = woche(), k = kette();
    var vom = tag(TAGE_N - 1), MON = ['Jan.', 'Feb.', 'März', 'April', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
    var bunt = FARB.filter(function (x) { return w.f[x[0]]; }).length;
    var fehlt = FARB.slice().sort(function (a, b) { return (w.f[a[0]] || 0) - (w.f[b[0]] || 0); })[0];
    return [
      { bg: '#1b2b66', bild: 'r8bilder/rueckblick.jpg', alt: 'Flo blättert im Monats-Rückblick', eb: vom.getDate() + '. ' + MON[vom.getMonth()] + ' bis heute', h: 'Dein Monat mit Flo', p: 'Ein kleiner Rückblick auf 30 Tage. Kein Zählen, kein Muss. Die Zahlen bleiben auf deinem Handy.' },
      { bg: '#2a4f3f', bild: 'posen/teller.jpg', alt: 'Flo mit leerem Teller', eb: 'Mahlzeiten', h: w.m ? w.m + ' Mahlzeiten an ' + w.tg + (w.tg === 1 ? ' Tag' : ' Tagen') : 'Eine ruhige Woche', p: w.m ? 'Du hast dir Zeit genommen hinzuschauen. Das ist schon viel.' : 'Flo freut sich auf deinen ersten Teller. Einfach reinreden genügt.' },
      { bg: '#4a2f5e', bild: 'posen/jubel.jpg', alt: 'Flo jubelt', eb: 'Regenbogen', h: bunt ? bunt + ' von 5 Farben' : 'Noch farblos', p: bunt ? 'So bunt war dein Teller:' : 'Tipp eine Farbe im Regenbogen an, sobald du sie isst.', farben: w.f },
      { bg: '#5a3b1f', bild: 'posen/joggt.jpg', alt: 'Flo joggt', eb: 'Bewegung', h: w.bew ? w.bew + '× bewegt' : 'Bewegung darf leicht sein', p: w.bew ? 'Jede Treppe zählt. Flo joggt dir zu.' : 'Eine Treppe statt Lift reicht für den Anfang.' },
      { bg: '#1f3e5a', bild: 'posen/ruhig.jpg', alt: 'Flo ruht', eb: 'Flo-Kette', h: k.n ? k.n + (k.n === 1 ? ' Tag' : ' Tage') + ' in Folge' : 'Die Kette wartet', p: 'Ruhetage gehören dazu. Einmal pro Woche hält die 🌙 Feder deine Kette zusammen.' },
      { bg: '#2b2a5e', bild: 'posen/winkt.jpg', alt: 'Flo winkt', eb: 'Nächster Monat', h: 'Lust auf ' + fehlt[2] + '? ' + fehlt[1], p: 'Nur eine Idee: eine Farbe, die diesen Monat selten war. Bis bald!', ende: 1 }
    ];
  }
  function story() {
    var L = folien(), i = 0, t0 = 0, pausiert = false, raf = null, rest = 0, DAUER = 5200;
    var o = el('<div class="r8-story" role="dialog" aria-modal="true" aria-label="Dein Monat mit Flo"><div class="r8-st-balken" aria-hidden="true"></div>' +
      '<button type="button" class="r8-st-zu" aria-label="Schliessen">×</button><div class="r8-st-inhalt" aria-live="polite"></div>' +
      '<button type="button" class="r8-st-l" aria-label="Zurück"></button><button type="button" class="r8-st-r" aria-label="Weiter"></button></div>');
    var vorher = document.activeElement;
    document.body.appendChild(o); document.body.classList.add('r7-blatt-offen');
    o.querySelector('.r8-st-balken').innerHTML = L.map(function () { return '<i><b></b></i>'; }).join('');
    function zeige() {
      var f = L[i]; o.style.background = 'radial-gradient(120% 80% at 50% 0%,' + f.bg + ',#14231d 75%)';
      var html = '<p class="r8-st-eb">' + esc(f.eb) + '</p><img src="' + f.bild + '" alt="' + esc(f.alt) + '" width="220" height="220"><h2>' + esc(f.h) + '</h2><p class="r8-st-p">' + esc(f.p) + '</p>';
      if (f.farben) html += '<div class="r8-st-f">' + FARB.map(function (x) { var n = f.farben[x[0]] || 0; return '<span style="--c:' + x[3] + ';--s:' + (1 + Math.min(n, 7) * .12) + '" class="' + (n ? 'an' : '') + '"><i aria-hidden="true">' + x[1] + '</i><small>' + x[2] + (n ? ' ' + n + '×' : '') + '</small></span>'; }).join('') + '</div>';
      if (i === L.length - 1) html += '<div class="r8-st-kn"><button type="button" class="r7-btn voll r8-st-teilen">📤 Als Bild teilen</button><button type="button" class="r7-btn r8-st-fertig">Danke, Flo</button></div><p class="r8-st-tipp" aria-live="polite"></p>';
      var c = o.querySelector('.r8-st-inhalt'); c.innerHTML = html; c.classList.remove('r8-st-rein'); void c.offsetWidth; c.classList.add('r8-st-rein');
      var fb = c.querySelector('.r8-st-fertig'); if (fb) fb.onclick = zu;
      var tb = c.querySelector('.r8-st-teilen'); if (tb) tb.onclick = function () { teilenBild(c); };
      [].forEach.call(o.querySelectorAll('.r8-st-balken b'), function (b, j) { b.style.width = j < i ? '100%' : '0%'; });
      t0 = performance.now(); rest = DAUER;
    }
    function lauf(t) {
      if (!pausiert) {
        var p = Math.min(1, (t - t0) / rest);
        var b = o.querySelectorAll('.r8-st-balken b')[i]; if (b) b.style.width = (p * 100) + '%';
        if (p >= 1) { if (i < L.length - 1) { i++; zeige(); } else { pausiert = true; } }
      }
      raf = requestAnimationFrame(lauf);
    }
    function weiter() { if (i < L.length - 1) { i++; zeige(); pausiert = false; } else zu(); }
    function zurueck() { if (i > 0) i--; zeige(); pausiert = false; }
    function zu() { cancelAnimationFrame(raf); o.remove(); document.body.classList.remove('r7-blatt-offen'); document.removeEventListener('keydown', taste); try { vorher.focus({ preventScroll: true }); } catch (e) {} }
    function taste(e) { if (e.key === 'Escape') zu(); if (e.key === 'ArrowRight') weiter(); if (e.key === 'ArrowLeft') zurueck(); if (e.key === ' ') { e.preventDefault(); pausiert = !pausiert; } }
    document.addEventListener('keydown', taste);
    o.querySelector('.r8-st-zu').onclick = zu;
    o.querySelector('.r8-st-r').onclick = weiter; o.querySelector('.r8-st-l').onclick = zurueck;
    var halt = null, pauseVon = 0;
    o.addEventListener('pointerdown', function (e) { if (e.target.closest('.r8-st-zu,.r8-st-kn')) return; halt = setTimeout(function () { pausiert = true; pauseVon = performance.now(); o.classList.add('pause'); }, 220); });
    o.addEventListener('pointerup', function () { clearTimeout(halt); if (o.classList.contains('pause')) { o.classList.remove('pause'); t0 += performance.now() - pauseVon; pausiert = false; } });
    if (Z.ruhig) DAUER = 9000;
    zeige(); raf = requestAnimationFrame(lauf);
    o.querySelector('.r8-st-r').focus();
    pose('winkt', 2000, '📖');
  }

  /* Monats-Story als Bild teilen (Canvas) */
  function teilenBild(c) {
    var w = woche(), k = kette(), cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920;
    var x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#2f5d4a'); g.addColorStop(1, '#14261f');
    x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
    var im = new Image();
    im.onload = im.onerror = function () {
      if (im.naturalWidth) { x.save(); x.beginPath(); x.arc(540, 420, 230, 0, 7); x.clip(); x.drawImage(im, 310, 190, 460, 460); x.restore(); x.lineWidth = 12; x.strokeStyle = '#e8634f'; x.beginPath(); x.arc(540, 420, 236, 0, 7); x.stroke(); }
      x.textAlign = 'center'; x.fillStyle = '#fff6ea'; x.font = '800 84px system-ui,-apple-system,sans-serif'; x.fillText('Mein Monat mit Flo', 540, 790);
      var Z2 = [[w.m, 'Mahlzeiten notiert'], [FARB.filter(function (f) { return w.f[f[0]]; }).length + ' / 5', 'Regenbogen-Farben'], [w.bew, 'mal bewegt'], [k.n, 'Tage Flo-Kette']];
      Z2.forEach(function (z, i) { var y = 960 + i * 200; x.fillStyle = 'rgba(255,255,255,.1)'; x.fillRect(140, y - 110, 800, 170); x.fillStyle = '#ffd2b8'; x.font = '800 96px system-ui,sans-serif'; x.fillText(String(z[0]), 540, y); x.fillStyle = '#e7f1ea'; x.font = '500 40px system-ui,sans-serif'; x.fillText(z[1], 540, y + 46); });
      x.fillStyle = '#cfe3d6'; x.font = '500 36px system-ui,sans-serif'; x.fillText('Food and Flow · ohne Kalorien, ohne Druck', 540, 1840);
      cv.toBlob(function (bl) {
        var tipp = c.querySelector('.r8-st-tipp'); if (!bl) return;
        var f = null; try { f = new File([bl], 'mein-monat-mit-flo.png', { type: 'image/png' }); } catch (e) {}
        function zeigen() { var u = URL.createObjectURL(bl); tipp.innerHTML = '<img src="' + u + '" alt="Dein Monat mit Flo als Bild" style="width:160px;border-radius:12px;margin-top:8px;pointer-events:auto;-webkit-touch-callout:default"><br>Bild lange drücken und «Sichern» oder «Teilen» wählen.'; }
        if (f && navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], text: 'Mein Monat mit Flo' }).then(function () { Z.toast('Geteilt 📤'); }).catch(function (e) { if (!e || e.name !== 'AbortError') zeigen(); });
        else zeigen();
      }, 'image/png');
    };
    im.src = 'posen/jubel.jpg';
    Z.licht('story');
  }
  var sk = el('<section class="r7 r7-karte r8-story-k" aria-labelledby="r8s-t"><p class="r7-eb">Wie ein Jahresrückblick, nur kleiner</p><h2 id="r8s-t">📖 Dein Monat mit Flo</h2>' +
    '<div class="r8-story-vor"><img src="r8bilder/rueckblick.jpg" alt="" width="64" height="64" loading="lazy"><img src="posen/teller.jpg" alt="" width="64" height="64" loading="lazy"><img src="posen/jubel.jpg" alt="" width="64" height="64" loading="lazy"><img src="posen/joggt.jpg" alt="" width="64" height="64" loading="lazy"></div>' +
    '<p class="r7-p">Sechs Story-Karten über deine letzten 30 Tage: Mahlzeiten, Farben, Bewegung. Antippen für weiter, gedrückt halten für Pause. Am Schluss als Bild teilen.</p>' +
    '<button type="button" class="r7-btn voll gross r8-story-los">▶ Monat ansehen</button></section>');
  sk.querySelector('.r8-story-los').onclick = story;

  /* ---------- 3) Teller-Baukasten zum Ziehen (Vorbild: Tellermodell + iOS Ziehen-und-Ablegen) ---------- */
  var ZUT = [['g', '🥦', 'Broccoli'], ['g', '🥕', 'Rüebli'], ['g', '🍅', 'Tomate'], ['g', '🍎', 'Apfel'], ['g', '🥗', 'Salat'],
    ['e', '🥚', 'Ei'], ['e', '🐟', 'Fisch'], ['e', '🫘', 'Bohnen'], ['e', '🧀', 'Käse'],
    ['k', '🍞', 'Brot'], ['k', '🍚', 'Reis'], ['k', '🥔', 'Kartoffel'], ['k', '🍝', 'Pasta']];
  var ZONE = { g: 'Gemüse und Früchte', e: 'Eiweiss', k: 'Getreide und Kartoffeln' };
  var teller = [];
  var tk = el('<section class="r7 r7-karte" aria-labelledby="r8b-t"><p class="r7-eb">Spielen statt zählen</p><h2 id="r8b-t">🍽 Teller-Baukasten</h2>' +
    '<p class="r7-p">Zieh Essen auf den Teller oder tipp es an. Flo schaut, ob er schön ausgewogen ist: halb Gemüse, ein Viertel Eiweiss, ein Viertel Getreide.</p>' +
    '<div class="r8-b-wrap"><svg class="r8-b-teller" viewBox="0 0 240 240" role="img" aria-label="Teller"><circle cx="120" cy="120" r="116" fill="#f3efe6"/><circle cx="120" cy="120" r="100" fill="#fffaf0" stroke="#e4dccb" stroke-width="2"/>' +
    '<path d="M120 20V220M120 120H220" stroke="#e4dccb" stroke-width="2" stroke-dasharray="5 6"/>' +
    '<text x="70" y="128" text-anchor="middle" font-size="11" fill="#9a8f78">Gemüse</text><text x="170" y="72" text-anchor="middle" font-size="11" fill="#9a8f78">Eiweiss</text><text x="170" y="178" text-anchor="middle" font-size="11" fill="#9a8f78">Getreide</text><g class="r8-b-drauf"></g></svg></div>' +
    '<div class="r8-b-balken" aria-hidden="true"><i class="g"></i><i class="e"></i><i class="k"></i></div>' +
    '<p class="r8-b-satz" aria-live="polite">Der Teller ist noch leer.</p>' +
    '<div class="r8-b-zut" role="group" aria-label="Zutaten"></div>' +
    '<div class="r7-reihe"><button type="button" class="r7-btn r8-b-leer">🧽 Teller leeren</button></div></section>');
  function platz(z, i) {
    var B = { g: [40, 52, 3, 4, 26, 34], e: [140, 52, 3, 2, 26, 30], k: [140, 150, 3, 2, 26, 30] }[z];
    var j = i % (B[2] * B[3]), c = j % B[2], r = Math.floor(j / B[2]), wackel = (i * 7) % 5 - 2;
    return [B[0] + c * B[4] + wackel, B[1] + r * B[5] + (c % 2) * 6];
  }
  function tellerZeigen(neu) {
    var g = tk.querySelector('.r8-b-drauf'); g.innerHTML = '';
    var n = { g: 0, e: 0, k: 0 };
    teller.forEach(function (x, j) {
      var p = platz(x[0], n[x[0]]++);
      var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', p[0].toFixed(0)); t.setAttribute('y', (p[1] + 9).toFixed(0)); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', '26');
      t.textContent = x[1]; if (neu && j === teller.length - 1) t.setAttribute('class', 'r8-b-neu');
      g.appendChild(t);
    });
    var tot = teller.length || 1;
    ['g', 'e', 'k'].forEach(function (z) { tk.querySelector('.r8-b-balken .' + z).style.flexGrow = teller.length ? n[z] / tot : 1; });
    var s;
    if (!teller.length) s = 'Der Teller ist noch leer.';
    else if (n.g * 2 >= tot && n.e && n.k && Math.abs(n.e - n.k) <= 1) s = 'Wunderschön ausgewogen! Halb bunt, dazu Eiweiss und Getreide.';
    else if (n.g * 2 < tot) s = 'Noch etwas Grünes? Flo mag den Teller halb voll Gemüse.';
    else if (!n.e) s = 'Ein bisschen Eiweiss fehlt noch, z. B. Ei, Bohnen oder Fisch.';
    else if (!n.k) s = 'Etwas Sättigendes dazu? Brot, Reis oder Kartoffeln.';
    else s = 'Schön bunt. Spiel ruhig weiter.';
    tk.querySelector('.r8-b-satz').textContent = s;
    tk.querySelector('.r8-b-wrap').setAttribute('aria-label', teller.length + ' Dinge auf dem Teller');
    return { n: n, s: s, gut: /ausgewogen/.test(s) };
  }
  function drauf(x) {
    if (teller.length >= 14) { Z.toast('Der Teller ist voll. Guten Appetit!'); return; }
    var vorher = tellerZeigen(false).gut;
    teller.push(x); var r = tellerZeigen(true);
    if (r.gut && !vorher) { pose('jubel', 2200, '🍽'); satz(r.s); R.feier(tk.querySelector('.r8-b-wrap'), 10); Z.licht('teller'); }
    else pose('jubel', 900, x[1]);
  }
  ZUT.forEach(function (x) {
    var b = el('<button type="button" class="r8-b-z" data-z="' + x[0] + '" aria-label="' + esc(x[2]) + ' auf den Teller (' + ZONE[x[0]] + ')"><span aria-hidden="true">' + x[1] + '</span></button>');
    var start = null, geist = null, gezogen = false;
    b.addEventListener('pointerdown', function (e) { start = [e.clientX, e.clientY]; gezogen = false; });
    b.addEventListener('pointermove', function (e) {
      if (!start) return;
      if (!gezogen && Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 8) {
        gezogen = true; try { b.setPointerCapture(e.pointerId); } catch (x) {}
        geist = el('<span class="r8-b-geist" aria-hidden="true">' + x[1] + '</span>'); document.body.appendChild(geist);
      }
      if (geist) { geist.style.transform = 'translate(' + (e.clientX - 24) + 'px,' + (e.clientY - 24) + 'px)'; var tr = tk.querySelector('.r8-b-teller').getBoundingClientRect(); tk.querySelector('.r8-b-wrap').classList.toggle('ziel', e.clientX > tr.left && e.clientX < tr.right && e.clientY > tr.top && e.clientY < tr.bottom); }
    });
    function los(e) {
      if (!start) return; start = null;
      if (geist) {
        var tr = tk.querySelector('.r8-b-teller').getBoundingClientRect();
        if (e.clientX > tr.left && e.clientX < tr.right && e.clientY > tr.top && e.clientY < tr.bottom) drauf(x);
        geist.remove(); geist = null; tk.querySelector('.r8-b-wrap').classList.remove('ziel');
      }
    }
    b.addEventListener('pointerup', los); b.addEventListener('pointercancel', function () { start = null; if (geist) { geist.remove(); geist = null; } });
    b.addEventListener('click', function () { if (gezogen) { gezogen = false; return; } drauf(x); });
    tk.querySelector('.r8-b-zut').appendChild(b);
  });
  tk.querySelector('.r8-b-leer').onclick = function () {
    if (!teller.length) return;
    var vor = teller.slice(); teller = []; tellerZeigen(false);
    Z.toast('Teller geleert', { undo: function () { teller = vor; tellerZeigen(false); } });
  };


  /* ---------- 4) Wächst mit dir (Vorbild: Finch) ---------- */
  var WCFG = {
    k: 'flo', name: 'Flo', licht: 'Körnli', lichtE: '🌾', bild: 'r8bilder/stufe-1.jpg',
    stufenBilder: ['r8bilder/stufe-1.jpg', 'r8bilder/stufe-2.jpg', 'r8bilder/stufe-3.jpg', 'r8bilder/stufe-4.jpg', 'r8bilder/stufe-5.jpg'],
    heimkehrBild: ['r8bilder/ausflug.jpg', 'Flo ist zurück vom Ausflug'],
    stufen: [[0, 'Keimling'], [5, 'Gartenkoch'], [15, 'Marktgänger'], [35, 'Regenbogen-Koch'], [70, 'Goldener Flo']],
    wie: 'Jeder kleine Schritt gibt Flo ein Körnli: eine Mahlzeit speichern, eine Farbe im Regenbogen antippen, Bewegung eintragen, den Kochtimer starten, achtsam essen, einen ausgewogenen Teller bauen. Mit genug Körnli wächst Flo. Einmal am Tag zieht er los und bringt eine kleine Geschichte mit.',
    schritte: [['#save', 'mahlzeit'], ['.r4-farbe', 'farbe'], ['#actok', 'bewegung'], ['#stepok', 'schritte'], ['.r7-tm-los', 'timer'], ['#r4achtsam button', 'achtsam']],
    ausflugBilder: [['posen/joggt.jpg', 'Flo joggt zurück'], ['posen/jubel.jpg', 'Flo jubelt'], ['posen/teller.jpg', 'Flo mit Teller'], ['posen/winkt.jpg', 'Flo winkt'], ['posen/hoert.jpg', 'Flo hört zu']],
    ausflug: [
      ['Gemüsemarkt', '🥕', 'Flo war am Gemüsemarkt und hat Rüebli in fünf Farben entdeckt. Sogar violette!'],
      ['Apfelbaum', '🍎', 'Flo hat beim Bauern Äpfel gepflückt. Der feinste war ganz schief.'],
      ['Kräutergarten', '🌿', 'Flo hat Basilikum, Minze und Schnittlauch gerochen. Die Minze hat gewonnen.'],
      ['Um den See', '🏃', 'Flo ist um den See gejoggt und hat einem Schwan zugewinkt.'],
      ['Käserei', '🧀', 'In der Käserei durfte Flo ein Stück Bergkäse probieren. Salzig und nussig.'],
      ['Im Wald', '🍄', 'Flo hat mit einer Försterin Pilze angeschaut. Gesammelt hat er keine, nur gestaunt.'],
      ['Bäckerei', '🍞', 'Flo hat gesehen, wie Brot aufgeht. Ganz langsam, wie ein ruhiger Atemzug.'],
      ['Bienenhaus', '🍯', 'Flo hat den Bienen zugeschaut und einen Löffel Honig ganz langsam gegessen.'],
      ['Kürbisfeld', '🎃', 'Flo hat den grössten Kürbis des Feldes gefunden. Er passte nicht in den Rucksack.'],
      ['Dorfbrunnen', '💧', 'Flo hat am Dorfbrunnen getrunken. Frisches Wasser schmeckt nach Bergen.'],
      ['Marroni-Stand', '🌰', 'Flo hat heisse Marroni geholt und die Hände daran gewärmt.'],
      ['Beerenhecke', '🫐', 'Flo hat Brombeeren gefunden. Die Hälfte landete im Mund, die andere auf dem T-Shirt.']
    ],
    beiFund: function () { pose('jubel', 2000, '🎒'); }
  };
  Z.thema({ bg: '#f7f6f1', karte: '#ffffff', rand: '#e6e2d9', randS: '#c9c3b6', text: '#1f2a25', leise: '#4b5852', akz: '#2f6a4f', akzT: '#245740', auf: '#ffffff', weich: '#eef4f0' }, [
    '.figur-hero{background:linear-gradient(135deg,#eef4f0,#fbe5dc)!important;color:#1f2a25!important;border:1px solid #e6e2d9!important;box-shadow:0 1px 2px rgba(30,45,38,.05),0 10px 28px -14px rgba(30,45,38,.2)!important;padding:12px 14px!important}',
    '.figur-hero::before{display:none!important}',
    '.figur-hero img{width:64px!important;height:64px!important;border:3px solid #fff!important;box-shadow:0 4px 12px rgba(30,45,38,.18)!important;animation:none!important}',
    '.figur-hero b{background:none!important;-webkit-background-clip:border-box!important;background-clip:border-box!important;color:#1f2a25!important;font-family:var(--serif)}',
    '.figur-hero span{color:#46524c!important}',
    '.film-funke,.film-stern{display:none!important}',
    '.figur-logo{border:2px solid #fff!important;box-shadow:0 0 0 1px #e6e2d9;animation:none!important}',
    '.brand span{color:#b5401c!important}.est{color:#b5401c!important}',
    ':root{--muted:#59645e!important}#michint{color:#59645e!important}.r4-lbl{color:#b5401c!important}',
    '.mic{background:linear-gradient(150deg,#3f8a66,#2f6a4f 55%,#245740)!important;box-shadow:0 0 0 8px rgba(47,106,79,.08),0 18px 44px -12px rgba(47,106,79,.5)!important}',
    '.mic svg{stroke:#fff!important}.mic::before,.mic::after{border-color:rgba(47,106,79,.3)!important}',
    '.miclabel{color:#245740!important}',
    '.tip{background:#fff!important;border-color:#e6e2d9!important}',
    '.nav .in{background:rgba(255,255,255,.94)!important;border:1px solid #e6e2d9}',
    '.toast{background:#1f2a25!important;color:#fff!important}',
    '.nb-buehne{display:flex!important;align-items:center;gap:14px;padding:14px!important;background:#fff!important;border:1px solid #e6e2d9!important;box-shadow:0 1px 2px rgba(30,45,38,.05),0 10px 28px -14px rgba(30,45,38,.22)!important;border-radius:22px!important;margin:6px 0 14px!important}',
    '.nb-buehne img{width:76px!important;height:76px!important;flex:none;border-radius:50%;border:3px solid #eef4f0;animation:none!important}',
    '.nb-unten{position:static!important;padding:0!important;background:none!important;align-items:flex-start!important;text-align:left!important;gap:4px!important}',
    '.nb-unten b{font:700 20px/1.2 var(--serif)!important;color:#1f2a25!important}',
    '.nb-unten span{color:#46524c!important;font-size:14px}',
    '.nb-reden{background:#2f6a4f!important;color:#fff!important;box-shadow:none!important;padding:10px 16px!important;font-size:15px!important;min-height:44px}'
  ].join('\n'));
  var css = document.createElement('style');
  css.textContent = [
    '.r8-k-zahl{font-size:32px;color:var(--r7-gold2);vertical-align:-3px}',
    '.r8-k-tage{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin:12px 0 4px}',
    '.r8-k-t{display:grid;justify-items:center;gap:2px;padding:6px 0;border-radius:12px;background:#f1eee6;font-size:12px;color:var(--r7-leise)}',
    '.r8-k-t i{font-style:normal;font-size:20px;line-height:1.2}',
    '.r8-k-t.ja{background:rgba(95,179,107,.22)}.r8-k-t.ruhe{background:rgba(143,163,232,.22)}.r8-k-t.heute{outline:2px dashed #c2461f}',
    '.r8-story-vor{display:flex;margin:8px 0 12px}.r8-story-vor img{width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #fff;margin-right:-14px;box-shadow:0 0 0 2px var(--r7-gold)}',
    '.r8-story{position:fixed;inset:0;z-index:2147483000;color:#fffaf0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(56px + env(safe-area-inset-top)) 24px calc(32px + env(safe-area-inset-bottom));text-align:center;overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:manipulation}',
    '.r8-st-balken{position:absolute;top:calc(12px + env(safe-area-inset-top));left:12px;right:12px;display:flex;gap:4px}',
    '.r8-st-balken i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.3);overflow:hidden}.r8-st-balken b{display:block;height:100%;width:0;background:#fff}',
    '.r8-st-zu{position:absolute;z-index:3;top:calc(24px + env(safe-area-inset-top));right:8px;width:48px;height:48px;border:0;border-radius:50%;background:rgba(0,0,0,.25);color:#fff;font-size:28px;cursor:pointer}',
    '.r8-st-l,.r8-st-r{position:absolute;top:80px;bottom:0;z-index:1;border:0;background:none;cursor:pointer}.r8-st-l{left:0;width:30%}.r8-st-r{right:0;width:70%}',
    '.r8-st-inhalt{position:relative;z-index:2;pointer-events:none;max-width:420px;display:grid;justify-items:center;gap:8px}',
    '.r8-st-inhalt button{pointer-events:auto;margin-top:16px}',
    '.r8-st-rein{animation:r8StRein .45s cubic-bezier(.2,.8,.2,1)}',
    '@keyframes r8StRein{from{opacity:0;transform:translateY(16px) scale(.98)}}',
    '.r8-st-eb{margin:0;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:13px;color:#ffe08a}',
    '.r8-st-inhalt img{width:min(52vw,220px);height:min(52vw,220px);border-radius:50%;object-fit:cover;border:4px solid #f2c14e;box-shadow:0 0 40px rgba(242,193,78,.3)}',
    '.r8-st-inhalt h2{margin:8px 0 0;font-size:clamp(28px,8vw,40px);line-height:1.1;color:#fffaf0}',
    '.r8-st-p{margin:0;font-size:18px;line-height:1.45;color:#dfe5fb}',
    '.r8-st-f{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px}',
    '.r8-st-f span{display:grid;justify-items:center;gap:4px;font-size:12px;opacity:.45}.r8-st-f span.an{opacity:1}',
    '.r8-st-f{align-items:flex-end}','.r8-st-f i{font-style:normal;display:grid;place-items:center;width:calc(44px * var(--s));height:calc(44px * var(--s));border-radius:50%;background:var(--c);font-size:22px}',
    '.r8-story.pause .r8-st-inhalt{opacity:.85}',
    '.r8-st-kn{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;pointer-events:auto}.r8-st-tipp{margin:8px 0 0;font-size:15px;pointer-events:auto}',
    '.r8-b-wrap{display:flex;justify-content:center;margin:12px 0 8px;border-radius:50%;transition:transform .2s}',
    '.r8-b-wrap.ziel{transform:scale(1.04)}',
    '.r8-b-teller{width:min(64vw,240px);height:auto;filter:drop-shadow(0 8px 18px rgba(30,45,38,.18))}',
    '.r8-b-neu{animation:r8Plopp .4s cubic-bezier(.3,1.6,.5,1);transform-box:fill-box;transform-origin:center}',
    '@keyframes r8Plopp{from{transform:scale(.2);opacity:0}}',
    '.r8-b-balken{display:flex;height:10px;border-radius:5px;overflow:hidden;gap:2px;margin:4px 0 8px}.r8-b-balken i{flex:1;transition:flex-grow .4s}.r8-b-balken .g{background:#5fb36b}.r8-b-balken .e{background:#e2584d}.r8-b-balken .k{background:#f2c94c}',
    '.r8-b-satz{margin:0 0 12px;min-height:3em;font-size:16px;color:var(--r7-tinte)}',
    '.r8-b-zut{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:8px}',
    '.r8-b-z{min-height:52px;border-radius:16px;border:1px solid #e0dbd0;background:#fff;font-size:28px;cursor:grab;touch-action:none}',
    '.r8-b-z[data-z=g]{border-color:rgba(95,179,107,.6)}.r8-b-z[data-z=e]{border-color:rgba(226,88,77,.6)}.r8-b-z[data-z=k]{border-color:rgba(242,201,76,.6)}',
    '.r8-b-z:active{transform:scale(.94)}',
    '.r8-b-geist{position:fixed;left:0;top:0;z-index:2147483200;font-size:44px;pointer-events:none;filter:drop-shadow(0 6px 10px rgba(0,0,0,.4))}',
    '@media (prefers-reduced-motion:reduce){.r8-st-rein,.r8-b-neu{animation:none}.r8-b-balken i,.r8-b-wrap{transition:none}}'
  ].join('\n');
  document.head.appendChild(css);

  function los() {
    var wc = Z.waechst(WCFG);
    function setzen() {
      if (!(sk.isConnected && kk.isConnected && tk.isConnected)) {
        var hs = document.querySelectorAll('.card h3'), teller = null;
        for (var i = 0; i < hs.length; i++) if (/Dein Teller/.test(hs[i].textContent)) { teller = hs[i].closest('.card'); break; }
        if (teller && teller.parentNode) { teller.parentNode.insertBefore(sk, teller.nextSibling); sk.parentNode.insertBefore(kk, sk.nextSibling); kk.parentNode.insertBefore(tk, kk.nextSibling); }
        else if (!sk.isConnected) { R.einsetzen(sk); R.einsetzen(kk); R.einsetzen(tk); }
      }
      if (!wc.isConnected) { var tc = document.getElementById('tipcard'); if (tc && tc.parentNode) tc.parentNode.insertBefore(wc, tc); else R.einsetzen(wc); }
    }
    setzen();
    /* Flo baut die Heute-Ansicht nach dem Speichern neu: dann die Karten wieder einsetzen */
    var wartet = 0;
    try { new MutationObserver(function () { if (wartet) return; wartet = setTimeout(function () { wartet = 0; if (!(sk.isConnected && kk.isConnected && tk.isConnected && wc.isConnected)) { setzen(); ketteZeigen(); } }, 80); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    R.namen(wc);
    ketteZeigen(); tellerZeigen(false);
    R.namen(sk); R.namen(kk); R.namen(tk);
    document.addEventListener('click', function (e) { if (e.target.closest('.r4-farbe, #meals, .sheet, #sheet')) setTimeout(ketteZeigen, 300); }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(los, 60); }); else setTimeout(los, 60);
})();
