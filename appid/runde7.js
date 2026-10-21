/* Runde 7 (21.10.2026): Verifizierung, Design und neue Funktionen. Erzeugt aus kern7 + App-Teil. */
window.R7_CFG = {
  k: 'flo',
  css: [
    ':root{--acc:#2a7356}',
    '.tag{color:#a8e6c4!important}',
    '.flo-say{width:44px!important;height:44px!important;margin:-8px -8px 0 8px!important}',
    '.x,.qty button{width:44px!important;height:44px!important}',
    '.mealsel{min-height:44px;padding:8px 10px!important;font-size:15px!important}',
    '.pill,.sizeq button,#cancel{min-height:44px}',
    '.pill{min-width:44px}',
    '.r4-farben{grid-template-columns:repeat(auto-fit,minmax(48px,1fr))!important}',
    '#fbBtn{min-height:48px!important}',
    '.kenn-pills button{min-width:48px;min-height:44px}'
  ],
  feldNamen: function (f) { if (f.classList.contains('mealsel')) return 'Mahlzeit'; return ''; }
};
/* Runde 7 – gemeinsamer Kern (Design, Zugänglichkeit, kleine Wow-Details). Nur lokal, keine Daten verlassen das Gerät. */
(function () {
  'use strict';
  if (window.R7) return;
  var C = window.R7_CFG || {};
  var ruhig = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var K = 'r7.' + (C.k || 'app') + '.';
  function hol(k, d) { try { var v = localStorage.getItem(K + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; }
  function summ(ms) { if (C.keineHaptik || ruhig) return; try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {} }
  function heuteK(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  var std = new Date().getHours();
  var teil = std < 6 ? 'nacht' : std < 11 ? 'morgen' : std < 17 ? 'tag' : std < 21 ? 'abend' : 'nacht';

  /* ---------- Gestaltung: 8er-Raster, Typo-Skala, Karten, Knöpfe, Gold ---------- */
  var css = [
    ':root{--r7-s1:8px;--r7-s2:16px;--r7-s3:24px;--r7-s4:32px;--r7-r1:12px;--r7-r2:16px;--r7-r3:24px;--r7-gold:#f2c14e;--r7-gold2:#ffe08a;--r7-tinte:#fffaf0;--r7-leise:#c9d2ee;--r7-schatten:0 10px 28px rgba(0,0,0,.28),0 2px 6px rgba(0,0,0,.18)}',
    'html{scroll-behavior:smooth}',
    '@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}',
    ':focus-visible{outline:3px solid var(--r7-gold2)!important;outline-offset:2px!important}',
    '.r6-karte,.r7-karte{border-radius:var(--r7-r3)!important;box-shadow:var(--r7-schatten)}',
    '.r6-sammel{grid-template-columns:repeat(auto-fill,44px)!important}',
    '.r7{--r7t:var(--r7-tinte);color:var(--r7t);font-size:16px;line-height:1.5}',
    '.r7-karte{margin:var(--r7-s2) 0;padding:var(--r7-s2);background:linear-gradient(160deg,rgba(38,58,130,.62),rgba(16,26,62,.92));border:1px solid rgba(242,193,78,.32);position:relative;overflow:hidden;text-align:left}',
    '.r7-karte h2{margin:0 0 var(--r7-s1);font-size:20px;line-height:1.25;color:var(--r7-gold2);font-weight:800;letter-spacing:-.005em}',
    '.r7-eb{margin:0 0 4px;font-size:12px;line-height:1.3;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--r7-gold)}',
    '.r7-leise{color:var(--r7-leise);font-size:15px;margin:var(--r7-s1) 0 0}',
    '.r7-p{margin:0 0 var(--r7-s1)}',
    '.r7-reihe{display:flex;flex-wrap:wrap;gap:var(--r7-s1);margin-top:var(--r7-s2)}',
    '.r7-btn{min-height:48px;min-width:48px;padding:10px 18px;border-radius:999px;border:1px solid rgba(242,193,78,.55);background:rgba(14,24,56,.55);color:var(--r7-tinte);font-weight:700;font-size:16px;line-height:1.25;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;transition:transform .12s,background .2s}',
    '.r7-btn.voll{background:linear-gradient(180deg,#ffd977,#f2c14e);color:#14204a;border:0;box-shadow:0 4px 14px rgba(242,193,78,.28)}',
    '.r7-btn.gross{width:100%;min-height:56px;font-size:18px;border-radius:var(--r7-r2)}',
    '.r7-btn:active{transform:scale(.96)}',
    '.r7-btn[disabled]{opacity:.5;cursor:default}',
    '.r7 input,.r7 select,.r7 textarea{min-height:48px;padding:10px 12px;border-radius:var(--r7-r1);border:1px solid rgba(242,193,78,.5);background:rgba(8,14,36,.72);color:var(--r7-tinte);font-size:16px;line-height:1.3;font-family:inherit;max-width:100%}',
    '.r7 label{display:flex;flex-direction:column;gap:4px;font-weight:700;color:var(--r7-leise);font-size:15px}',
    '.r7-figur{flex:none;width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid var(--r7-gold);background:#0e1838}',
    '.r7-leer{display:flex;gap:var(--r7-s2);align-items:center;padding:var(--r7-s2);border-radius:var(--r7-r2);background:rgba(255,250,240,.06);border:1px dashed rgba(242,193,78,.4)}',
    '.r7-leer p{margin:0;color:var(--r7-leise)}',
    '.r7-blase{flex:1;margin:0;padding:12px 16px;border-radius:16px 16px 16px 4px;background:rgba(255,250,240,.96);color:#1d2550;font-size:16px;line-height:1.45}',
    '.r7 [hidden]{display:none!important}',
    /* sanfte Übergänge */
    '.r7-rein{animation:r7Rein .32s cubic-bezier(.2,.8,.2,1) both}',
    '@keyframes r7Rein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '.r7-funke{position:fixed;z-index:2147483000;pointer-events:none;color:var(--r7-gold2);font-size:18px;animation:r7Funke 1.2s ease-out forwards}',
    '@keyframes r7Funke{from{opacity:1;transform:translate(0,0) scale(.6)}to{opacity:0;transform:translate(var(--dx),-80px) scale(1.15)}}',
    '.r7-glanz{animation:r7Glanz 1.1s ease-out}',
    '@keyframes r7Glanz{0%{box-shadow:0 0 0 0 rgba(242,193,78,.6)}100%{box-shadow:0 0 0 18px rgba(242,193,78,0)}}',
    /* Blatt (Bottom Sheet) */
    '.r7-dunkel{position:fixed;inset:0;z-index:2147482000;background:rgba(3,6,18,.6);opacity:0;transition:opacity .25s}',
    '.r7-dunkel.an{opacity:1}',
    '.r7-blatt{position:fixed;left:0;right:0;bottom:0;z-index:2147482001;max-width:560px;margin:0 auto;max-height:90vh;overflow:auto;overscroll-behavior:contain;padding:var(--r7-s1) var(--r7-s3) calc(var(--r7-s3) + env(safe-area-inset-bottom));border-radius:28px 28px 0 0;background:linear-gradient(180deg,#1a2a62,#0e1838);border:1px solid rgba(242,193,78,.3);border-bottom:0;color:var(--r7-tinte);transform:translateY(105%);transition:transform .32s cubic-bezier(.2,.8,.2,1);text-align:left;font-family:inherit}',
    '.r7-blatt.an{transform:none}',
    'body.r7-blatt-offen .nova-btn,body.r7-blatt-offen .nova-pille,body.r7-blatt-offen #fbBtn{opacity:0!important;pointer-events:none!important}',
    '.r7-griff{width:40px;height:5px;border-radius:3px;background:rgba(255,255,255,.35);margin:4px auto var(--r7-s2)}',
    '.r7-zu{position:absolute;right:12px;top:12px;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;font-size:22px;cursor:pointer}',
    '.r7-blatt h2{margin:0 48px var(--r7-s1) 0;font-size:22px;color:var(--r7-gold2)}',
    /* Himmel passend zur Tageszeit, leichtes Parallax */
    '.r7-himmel{position:fixed;inset:-10vh 0 auto 0;height:70vh;z-index:-1;pointer-events:none;opacity:.9;will-change:transform}',
    '.r7-himmel.morgen{background:radial-gradient(70% 45% at 80% 0%,rgba(255,190,120,.22),transparent 70%)}',
    '.r7-himmel.tag{background:radial-gradient(70% 45% at 80% 0%,rgba(242,193,78,.16),transparent 70%)}',
    '.r7-himmel.abend{background:radial-gradient(70% 45% at 80% 0%,rgba(255,140,90,.2),transparent 70%)}',
    '.r7-himmel.nacht{background:radial-gradient(1.5px 1.5px at 12% 18%,#ffe9a8,transparent),radial-gradient(1px 1px at 82% 12%,#ffe9a8,transparent),radial-gradient(1px 1px at 64% 34%,#ffe9a8aa,transparent),radial-gradient(1.5px 1.5px at 30% 48%,#ffe9a8aa,transparent),radial-gradient(1px 1px at 90% 58%,#ffe9a8aa,transparent),radial-gradient(70% 45% at 80% 0%,rgba(143,163,232,.18),transparent 70%)}',
    '@media (prefers-reduced-motion:reduce){.r7-rein,.r7-funke,.r7-glanz{animation:none!important}.r7-blatt,.r7-dunkel{transition:none}}',
    '.r7-vh{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
  ].concat(C.css || []).join('\n');
  var st = document.createElement('style'); st.id = 'r7-stil'; st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ---------- Feier, Funken ---------- */
  function feier(ziel, n) {
    summ([10, 40, 10]);
    if (!ziel || ruhig) { if (ziel) { ziel.classList.remove('r7-glanz'); void ziel.offsetWidth; ziel.classList.add('r7-glanz'); } return; }
    var r = ziel.getBoundingClientRect();
    ziel.classList.remove('r7-glanz'); void ziel.offsetWidth; ziel.classList.add('r7-glanz');
    for (var i = 0; i < (n || 8); i++) {
      var f = document.createElement('span'); f.className = 'r7-funke'; f.textContent = i % 3 ? '✦' : '★'; f.setAttribute('aria-hidden', 'true');
      f.style.left = (r.left + r.width * (0.2 + Math.random() * 0.6)) + 'px'; f.style.top = (r.top + r.height * 0.4) + 'px';
      f.style.setProperty('--dx', (Math.random() * 80 - 40).toFixed(0) + 'px'); f.style.animationDelay = (i * 45) + 'ms';
      document.body.appendChild(f); setTimeout(function (x) { x.remove(); }.bind(null, f), 1500);
    }
  }

  /* ---------- Blatt (Bottom Sheet) ---------- */
  var blattOffen = null;
  function blatt(titel, html, beiAuf) {
    zu();
    var vorher = document.activeElement;
    var d = el('<div class="r7-dunkel"></div>');
    var b = el('<div class="r7 r7-blatt" role="dialog" aria-modal="true" aria-labelledby="r7-bt"><div class="r7-griff" aria-hidden="true"></div><button type="button" class="r7-zu" aria-label="Schliessen">×</button><h2 id="r7-bt">' + esc(titel) + '</h2><div class="r7-binnen">' + html + '</div></div>');
    document.body.appendChild(d); document.body.appendChild(b);
    requestAnimationFrame(function () { d.classList.add('an'); b.classList.add('an'); });
    document.body.classList.add('r7-blatt-offen');
    function weg() {
      if (blattOffen !== obj) return; blattOffen = null;
      d.classList.remove('an'); b.classList.remove('an'); document.body.classList.remove('r7-blatt-offen');
      setTimeout(function () { d.remove(); b.remove(); }, ruhig ? 0 : 340);
      if (vorher && vorher.focus) try { vorher.focus({ preventScroll: true }); } catch (e) {}
    }
    var obj = { el: b, zu: weg };
    blattOffen = obj;
    d.onclick = weg; b.querySelector('.r7-zu').onclick = weg;
    var y0 = null;
    b.addEventListener('touchstart', function (e) { y0 = b.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
    b.addEventListener('touchend', function (e) { if (y0 != null && e.changedTouches[0].clientY - y0 > 90) weg(); y0 = null; }, { passive: true });
    setTimeout(function () { var f = b.querySelector('.r7-binnen button, .r7-binnen input, .r7-binnen a') || b.querySelector('.r7-zu'); try { f.focus({ preventScroll: true }); } catch (e) {} }, 60);
    if (beiAuf) beiAuf(b);
    return obj;
  }
  function zu() { if (blattOffen) blattOffen.zu(); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && blattOffen) zu(); });

  /* ---------- Zugänglichkeit: Namen für Felder ohne Beschriftung ---------- */
  function namen(wurzel) {
    var liste = (wurzel || document).querySelectorAll('select, input:not([type=hidden]), textarea');
    for (var i = 0; i < liste.length; i++) {
      var f = liste[i];
      if (f.getAttribute('aria-label') || f.getAttribute('aria-labelledby') || f.closest('label') || (f.id && document.querySelector('label[for="' + CSS.escape(f.id) + '"]'))) continue;
      var n = f.getAttribute('placeholder') || f.getAttribute('title') || (C.feldNamen && C.feldNamen(f)) || '';
      if (!n && f.type === 'file') n = 'Foto wählen';
      if (!n && f.tagName === 'SELECT') n = 'Auswahl';
      if (n) f.setAttribute('aria-label', n);
    }
  }
  var nt = null;
  function namenBald() { clearTimeout(nt); nt = setTimeout(function () { namen(); }, 120); }

  /* ---------- sanfte Übergänge: was sichtbar wird, gleitet herein ---------- */
  function beobachte() {
    if (ruhig || !window.MutationObserver) return;
    new MutationObserver(function (m) {
      var neu = false;
      m.forEach(function (x) {
        if (x.type === 'attributes' && x.attributeName === 'hidden' && !x.target.hidden && x.target.nodeType === 1 && /^(SECTION|DIV|ARTICLE|ASIDE|FORM|MAIN)$/.test(x.target.tagName) && !x.target.closest('.pp-winker')) {
          var t = x.target; t.classList.remove('r7-rein'); void t.offsetWidth; t.classList.add('r7-rein');
        }
        if (x.type === 'childList' && x.addedNodes.length) neu = true;
      });
      if (neu) namenBald();
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'] });
  }

  /* ---------- Haptik: kurzes Tippen bei Knöpfen (nicht in Kinder-Apps) ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button, [role=button], a.r7-btn');
    if (b && !b.disabled) summ(6);
  }, true);

  /* ---------- Himmel ---------- */
  function himmel() {
    if (C.keinHimmel) return;
    var h = el('<div class="r7-himmel ' + teil + '" aria-hidden="true"></div>');
    document.body.insertBefore(h, document.body.firstChild);
    if (ruhig) return;
    var lauf = false;
    addEventListener('scroll', function () { if (lauf) return; lauf = true; requestAnimationFrame(function () { lauf = false; h.style.transform = 'translate3d(0,' + (-(scrollY || 0) * 0.12).toFixed(1) + 'px,0)'; }); }, { passive: true });
  }

  /* ---------- Einfügen ---------- */
  function anker() {
    var a = C.anker && document.querySelector(C.anker);
    return a || document.querySelector('.r6-ueb') || document.querySelector('main') || document.body;
  }
  function einsetzen(knoten, vor) {
    var a = (typeof vor === 'string' && document.querySelector(vor)) || anker();
    if (a === document.body || a.tagName === 'MAIN') a.appendChild(knoten);
    else a.parentNode.insertBefore(knoten, a);
    namen(knoten);
    return knoten;
  }

  window.R7 = { hol: hol, leg: leg, esc: esc, el: el, summ: summ, feier: feier, blatt: blatt, zu: zu, einsetzen: einsetzen, heuteK: heuteK, ruhig: ruhig, teil: teil, namen: namen };
  function start() { himmel(); namen(); beobachte(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* Food and Flow Runde 7: Kochtimer mit Flo, Hunger-Kompass, Teller-Fototagebuch. Alles bleibt auf dem Gerät. */
(function () {
  'use strict';
  var R = window.R7; if (!R) return;
  var esc = R.esc, el = R.el;
  function sag(t) { try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'de-CH'; u.rate = 1; speechSynthesis.speak(u); } catch (e) {} }
  var AC = null;
  function gong() {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state !== 'running' && AC.resume) AC.resume();
      [0, 0.9].forEach(function (z) {
        [[660, 0.16], [990, 0.06], [1320, 0.03]].forEach(function (q) {
          var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + z;
          o.frequency.value = q[0]; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(q[1], t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
          o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + 2.3);
        });
      });
    } catch (e) {}
  }

  /* ---------- 1) Kochtimer mit Flo (Vorbild: Timer der Apple-Uhr-App, Kitchen Stories) ---------- */
  var VOR = [['🥚', 'Ei weich', 6], ['🥚', 'Ei hart', 9], ['🍝', 'Pasta', 10], ['🍚', 'Reis', 18], ['🍵', 'Tee', 4], ['🥔', 'Kartoffeln', 20]];
  var tk = el('<section class="r7 r7-karte" aria-labelledby="r7k-t"><p class="r7-eb">Flo kocht mit</p><h2 id="r7k-t">⏲️ Kochtimer</h2>' +
    '<div style="display:flex;gap:16px;align-items:center;margin-bottom:16px"><img class="r7-figur r7-tm-flo" src="posen/wecker.jpg" alt="Flo hält eine Küchenuhr" loading="lazy" width="72" height="72"><p class="r7-p" style="margin:0">Flo hält die Küchenuhr bereit und sagt dir, wenn es so weit ist.</p></div>' +
    '<div class="r7-tm" style="display:flex;gap:16px;align-items:center"><svg class="r7-ring" viewBox="0 0 120 120" width="120" height="120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="10"/><circle class="r7-ring-v" cx="60" cy="60" r="52" fill="none" stroke="#f2c14e" stroke-width="10" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="0" transform="rotate(-90 60 60)"/></svg>' +
    '<div style="flex:1"><p class="r7-tm-zeit" style="margin:0;font-size:40px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1" role="timer" aria-live="off">10:00</p><p class="r7-tm-was r7-leise" style="margin-top:4px">Wähle, was du kochst.</p></div></div>' +
    '<div class="r7-reihe r7-tm-vor"></div>' +
    '<div class="r7-reihe"><button type="button" class="r7-btn" data-t="-1">− 1 Min.</button><button type="button" class="r7-btn" data-t="1">+ 1 Min.</button><button type="button" class="r7-btn voll r7-tm-los" style="flex:1">▶ Start</button></div>' +
    '<p class="r7-leise">Flo läutet sanft, wenn es fertig ist. Die App muss dafür offen bleiben.</p></section>');
  var dauer = 600, ende = R.hol('timerEnde', 0), was = R.hol('timerWas', ''), tick = null;
  VOR.forEach(function (v) {
    var b = el('<button type="button" class="r7-btn">' + v[0] + ' ' + esc(v[1]) + ' <small style="opacity:.75">' + v[2] + '′</small></button>');
    b.onclick = function () { if (ende) return; dauer = v[2] * 60; was = v[1]; zeig(); };
    tk.querySelector('.r7-tm-vor').appendChild(b);
  });
  tk.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { if (ende) { ende += +b.dataset.t * 60000; R.leg('timerEnde', ende); } else dauer = Math.max(60, Math.min(180 * 60, dauer + +b.dataset.t * 60)); zeig(); }; });
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function zeig() {
    var rest = ende ? (ende - Date.now()) / 1000 : dauer, voll = ende ? R.hol('timerDauer', dauer) : dauer;
    tk.querySelector('.r7-tm-zeit').textContent = mmss(rest);
    tk.querySelector('.r7-ring-v').setAttribute('stroke-dashoffset', (326.7 * (1 - Math.max(0, rest) / voll)).toFixed(1));
    tk.querySelector('.r7-tm-was').textContent = ende ? (was ? was + ' läuft …' : 'Läuft …') : (was ? was + ': bereit' : 'Wähle, was du kochst.');
    tk.querySelector('.r7-tm-los').textContent = ende ? '■ Stopp' : '▶ Start';
    if (ende && rest <= 0) fertig();
  }
  function fertig() {
    ende = 0; R.leg('timerEnde', 0); clearInterval(tick);
    gong(); R.summ([200, 100, 200]); R.feier(tk.querySelector('.r7-ring'), 12);
    tk.querySelector('.r7-tm-zeit').textContent = 'Fertig!';
    tk.querySelector('.r7-tm-was').textContent = (was || 'Es') + ' ist bereit. En Guete!';
    tk.querySelector('.r7-tm-los').textContent = '▶ Start';
    sag((was || 'Dein Essen') + ' ist fertig. En Guete!');
  }
  tk.querySelector('.r7-tm-los').onclick = function () {
    if (ende) { ende = 0; R.leg('timerEnde', 0); clearInterval(tick); zeig(); return; }
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume && AC.resume(); } catch (e) {}
    ende = Date.now() + dauer * 1000; R.leg('timerEnde', ende); R.leg('timerDauer', dauer); R.leg('timerWas', was);
    clearInterval(tick); tick = setInterval(zeig, 500); zeig();
  };
  if (ende) { dauer = R.hol('timerDauer', 600); if (ende > Date.now()) tick = setInterval(zeig, 500); }

  /* ---------- 2) Hunger-Kompass (Vorbild: Achtsamkeits-Apps wie «Am I Hungry?») ---------- */
  var STUFEN = [['😩', 'Sehr hungrig'], ['🙂', 'Hungrig'], ['😌', 'Angenehm'], ['😊', 'Satt'], ['😮‍💨', 'Sehr satt']];
  var hk = el('<section class="r7 r7-karte" aria-labelledby="r7h-t"><p class="r7-eb">Kurz hineinspüren</p><h2 id="r7h-t">🧭 Hunger-Kompass</h2>' +
    '<div style="display:flex;gap:16px;align-items:center;margin-bottom:16px"><img class="r7-figur" src="posen/horcht.jpg" alt="Flo horcht mit geschlossenen Augen in den Bauch" loading="lazy" width="72" height="72"><p class="r7-p" style="margin:0">Wie fühlt sich dein Bauch gerade an? Vor oder nach dem Essen, ganz ohne richtig oder falsch.</p></div>' +
    '<div class="r7-reihe r7-hk-wann" role="radiogroup" aria-label="Wann"><button type="button" class="r7-btn" role="radio" aria-checked="true" data-w="vor">Vor dem Essen</button><button type="button" class="r7-btn" role="radio" aria-checked="false" data-w="nach">Nach dem Essen</button></div>' +
    '<div class="r7-hk-skala" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(56px,1fr));gap:8px;margin-top:16px"></div>' +
    '<div class="r7-hk-heute" style="margin-top:16px"></div>' +
    '<p class="r7-leise">Nur zum Spüren, keine Empfehlung. Bleibt auf deinem Handy.</p></section>');
  var wann = 'vor';
  hk.querySelectorAll('[data-w]').forEach(function (b) { b.onclick = function () { wann = b.dataset.w; hk.querySelectorAll('[data-w]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); x.classList.toggle('voll', x === b); }); }; });
  hk.querySelector('[data-w="vor"]').classList.add('voll');
  STUFEN.forEach(function (s, i) {
    var b = el('<button type="button" class="r7-hk-st" aria-label="' + esc(s[1]) + '"><span aria-hidden="true">' + s[0] + '</span><small>' + esc(s[1]) + '</small></button>');
    b.onclick = function () {
      var L = R.hol('hunger', []).filter(function (x) { return x.t > Date.now() - 14 * 864e5; });
      var d = new Date(); L.push({ t: d.getTime(), w: wann, s: i });
      R.leg('hunger', L); R.feier(b, 5); hkZeigen();
      if (wann === 'vor') { wann = 'nach'; hk.querySelector('[data-w="nach"]').click(); }
    };
    hk.querySelector('.r7-hk-skala').appendChild(b);
  });
  function hkZeigen() {
    var heute = R.heuteK(), L = R.hol('hunger', []).filter(function (x) { return R.heuteK(new Date(x.t)) === heute; });
    var z = hk.querySelector('.r7-hk-heute');
    if (!L.length) { z.innerHTML = '<div class="r7-leer"><img class="r7-figur" src="posen/hoert.jpg" alt="" loading="lazy" width="72" height="72"><p>Heute noch nichts gespürt. Flo hört zu, wann immer du magst.</p></div>'; return; }
    z.innerHTML = '<p class="r7-eb" style="margin-top:0">Heute</p><ul style="list-style:none;margin:0;padding:0;display:grid;gap:8px">' + L.map(function (x) {
      var d = new Date(x.t); return '<li style="display:flex;gap:12px;align-items:center;min-height:44px;padding:4px 12px;border-radius:12px;background:rgba(255,250,240,.07)"><span style="font-size:24px" aria-hidden="true">' + STUFEN[x.s][0] + '</span><span style="flex:1">' + (x.w === 'vor' ? 'Vor dem Essen' : 'Nach dem Essen') + ': <b>' + STUFEN[x.s][1] + '</b></span><small style="color:var(--r7-leise)">' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + '</small></li>';
    }).join('') + '</ul>';
    var n = L.filter(function (x) { return x.w === 'nach' && x.s === 2; }).length;
    if (n) z.insertAdjacentHTML('beforeend', '<p class="r7-leise">Flo bemerkt: ' + n + '× «angenehm» nach dem Essen. Schön, wie du in dich hineinhörst.</p>');
  }

  /* ---------- 3) Teller-Fototagebuch (Vorbild: «Ate» Food Journal) – ohne Zahlen, nur Bilder ---------- */
  var DB = null;
  function db() {
    return new Promise(function (ok, nein) {
      if (DB) return ok(DB);
      if (!window.indexedDB) return nein(new Error('kein IndexedDB'));
      var r = indexedDB.open('flo-teller', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('bilder', { keyPath: 't' }); };
      r.onsuccess = function () { DB = r.result; ok(DB); }; r.onerror = function () { nein(r.error); };
    });
  }
  function alle() { return db().then(function (d) { return new Promise(function (ok) { var q = d.transaction('bilder').objectStore('bilder').getAll(); q.onsuccess = function () { ok(q.result || []); }; q.onerror = function () { ok([]); }; }); }).catch(function () { return []; }); }
  function speichere(o) { return db().then(function (d) { return new Promise(function (ok, nein) { var tx = d.transaction('bilder', 'readwrite'); tx.objectStore('bilder').put(o); tx.oncomplete = ok; tx.onerror = function () { nein(tx.error); }; }); }); }
  function loesche(t) { return db().then(function (d) { return new Promise(function (ok) { var tx = d.transaction('bilder', 'readwrite'); tx.objectStore('bilder').delete(t); tx.oncomplete = ok; }); }); }
  var fk = el('<section class="r7 r7-karte" aria-labelledby="r7f-t"><p class="r7-eb">Ohne Zahlen</p><h2 id="r7f-t">📸 Teller-Tagebuch</h2>' +
    '<p class="r7-p">Ein Foto pro Mahlzeit. Am Abend siehst du deinen Tag als Bilderstreifen.</p>' +
    '<label class="r7-btn voll gross" style="flex-direction:row;color:#14204a;cursor:pointer">📷 Teller fotografieren<input type="file" accept="image/*" capture="environment" class="r7-vh"></label>' +
    '<div class="r7-ft-heute" style="margin-top:16px"></div><p class="r7-leise r7-ft-woche"></p>' +
    '<p class="r7-leise">Die Fotos bleiben nur auf diesem Handy.</p></section>');
  function verkleinere(datei) {
    return new Promise(function (ok, nein) {
      var u = URL.createObjectURL(datei), i = new Image();
      i.onload = function () { var m = 640, s = Math.min(1, m / Math.max(i.width, i.height)), c = document.createElement('canvas'); c.width = Math.round(i.width * s); c.height = Math.round(i.height * s); c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(function (b) { b ? ok(b) : nein(new Error('Bild')); }, 'image/jpeg', 0.78); };
      i.onerror = function () { URL.revokeObjectURL(u); nein(new Error('Bild')); }; i.src = u;
    });
  }
  var urls = [];
  function ftZeigen() {
    alle().then(function (L) {
      urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = [];
      var heute = R.heuteK(), H = L.filter(function (x) { return R.heuteK(new Date(x.t)) === heute; });
      var z = fk.querySelector('.r7-ft-heute');
      if (!H.length) z.innerHTML = '<div class="r7-leer"><img class="r7-figur" src="posen/teller.jpg" alt="Flo hält einen leeren Teller" loading="lazy" width="96" height="96" style="width:96px;height:96px"><p>Dein Teller-Streifen ist heute noch leer. Flo freut sich auf das erste Bild.</p></div>';
      else {
        z.innerHTML = '<div class="r7-ft-streifen" style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scroll-snap-type:x mandatory"></div>';
        H.sort(function (a, b) { return a.t - b.t; }).forEach(function (x) {
          var u = URL.createObjectURL(x.b); urls.push(u); var d = new Date(x.t);
          var f = el('<figure style="flex:none;margin:0;width:132px;scroll-snap-align:start;position:relative"><img src="' + u + '" alt="Teller um ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + '" style="width:132px;height:132px;object-fit:cover;border-radius:16px;border:2px solid rgba(242,193,78,.5)"><figcaption style="font-size:14px;color:var(--r7-leise);margin-top:4px">' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + '</figcaption><button type="button" class="r7-btn" aria-label="Foto löschen" style="position:absolute;top:4px;right:4px;min-height:44px;min-width:44px;padding:0;background:rgba(5,9,22,.7)">✕</button></figure>');
          f.querySelector('button').onclick = function () { loesche(x.t).then(ftZeigen); };
          z.firstChild.appendChild(f);
        });
      }
      var w = L.filter(function (x) { return x.t > Date.now() - 7 * 864e5; }).length;
      fk.querySelector('.r7-ft-woche').textContent = w ? w + ' Teller in den letzten 7 Tagen.' : '';
      // alte Bilder (älter als 30 Tage) aufräumen
      L.filter(function (x) { return x.t < Date.now() - 30 * 864e5; }).forEach(function (x) { loesche(x.t); });
    });
  }
  fk.querySelector('input[type=file]').addEventListener('change', function () {
    var f = this.files && this.files[0]; this.value = '';
    if (!f) return;
    verkleinere(f).then(function (b) { return speichere({ t: Date.now(), b: b }); }).then(function () { ftZeigen(); R.feier(fk.querySelector('.r7-ft-heute'), 8); }).catch(function () { fk.querySelector('.r7-ft-woche').textContent = 'Das Foto konnte nicht gespeichert werden. Versuch es nochmals.'; });
  });

  var css = document.createElement('style');
  css.textContent = [
    '.r7-hk-st{min-height:72px;padding:8px 2px;border-radius:16px;border:2px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:inherit;font:inherit;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer}',
    '.r7-hk-st span{font-size:28px;line-height:1}.r7-hk-st small{font-size:12px;line-height:1.2;text-align:center}',
    '.r7-hk-st:active{transform:scale(.95)}',
    '.r7-ring-v{transition:stroke-dashoffset .5s linear}'
  ].join('\n');
  document.head.appendChild(css);

  function los() { R.einsetzen(tk); R.einsetzen(hk); R.einsetzen(fk); zeig(); hkZeigen(); ftZeigen(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(los, 0); }); else setTimeout(los, 0);
})();
