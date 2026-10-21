/* Runde 7 (21.10.2026): Verifizierung, Design und neue Funktionen. Erzeugt aus kern7 + App-Teil. */
window.R7_CFG = {
  k: 'hasi', keineStimme: true,
  css: [
    'label.check{min-height:44px;display:flex;gap:12px;align-items:flex-start}',
    'label.check input{flex:none}',
    '#fbBtn{min-height:48px!important}',
    '#wb-vorschau label,#wb-vorschau li{color:#3b4366!important}',
    '#wb-vorschau h4{color:#1d2550!important}',
    '#wb-vorschau label{min-height:44px;display:flex;align-items:center;gap:10px}'
  ]
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

/* Hasis Laden Runde 7: Suchen mit Filtern, Werkzeuge vergleichen, Erfinder-Abzeichen. Hasi spricht nie: nur Schilder und Gesten. */
(function () {
  'use strict';
  var R = window.R7; if (!R) return;
  var esc = R.esc, el = R.el, $ = function (id) { return document.getElementById(id); };
  var H = function () { return window.HasiLaden || null; };
  function W() { var h = H(); return h && h.W ? h.W : []; }
  function wz(id) { return W().filter(function (x) { return x.id === id; })[0]; }
  function kasten() { try { return JSON.parse(localStorage.getItem('hasi.kasten')) || []; } catch (e) { return []; } }
  function geste(pose, schild, text) { var h = H(); if (h && h.hasi) try { h.hasi(pose, schild, text, 2200); } catch (e) {} }

  /* ---------- 1) Suchen mit Filtern über alle Regale (Vorbild: App-Store-Suche mit Filtern) ---------- */
  var FILTER = [['alle', 'Alle'], ['gratis', 'Gratis'], ['einmal', 'Einmalig'], ['abo', 'Im Abo'], ['anfrage', 'Auf Anfrage']];
  function art(p) { p = String(p || '').toLowerCase(); if (/^gratis/.test(p)) return 'gratis'; if (/anfrage/.test(p)) return 'anfrage'; if (/pro monat|abo|monat/.test(p)) return 'abo'; if (/einmal|chf/.test(p)) return 'einmal'; if (/gratis/.test(p)) return 'gratis'; return 'anfrage'; }
  var sk = el('<section class="r7 r7-karte" aria-labelledby="r7s-t"><p class="r7-eb">Alle Regale auf einmal</p><h2 id="r7s-t">🔎 Hasi sucht mit</h2>' +
    '<div style="display:flex;gap:16px;align-items:center;margin-bottom:16px"><img class="r7-figur" src="posen/lupe.jpg" alt="Hasi schaut mit einer grossen Lupe" loading="lazy" width="72" height="72"><p class="r7-p" style="margin:0">Hasi nimmt die Lupe und schaut alle Regale für dich durch.</p></div>' +
    '<label class="r7-vh" for="r7s-q">Wonach suchst du?</label><input id="r7s-q" type="search" placeholder="z. B. Termine, Hund, Kinder" autocomplete="off" style="width:100%">' +
    '<div class="r7-reihe r7-s-f" role="radiogroup" aria-label="Preis"></div><ul class="r7-s-l" style="list-style:none;margin:16px 0 0;padding:0;display:grid;gap:8px"></ul>' +
    '<p class="r7-leise r7-s-n" aria-live="polite"></p></section>');
  var filt = 'alle';
  FILTER.forEach(function (f) {
    var b = el('<button type="button" class="r7-btn" role="radio" aria-checked="' + (f[0] === filt) + '">' + f[1] + '</button>');
    if (f[0] === filt) b.classList.add('voll');
    b.onclick = function () { filt = f[0]; sk.querySelectorAll('.r7-s-f button').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); x.classList.toggle('voll', x === b); }); suche(); };
    sk.querySelector('.r7-s-f').appendChild(b);
  });
  function suche() {
    var q = sk.querySelector('input').value.trim().toLowerCase();
    var L = W().filter(function (x) { return x.r !== 'offen' || x.lic; }).filter(function (x) { return (filt === 'alle' || art(x.p) === filt) && (!q || (x.n + ' ' + x.t + ' ' + x.w).toLowerCase().indexOf(q) >= 0); });
    var ul = sk.querySelector('.r7-s-l'); ul.innerHTML = '';
    L.slice(0, 8).forEach(function (x) {
      var li = el('<li><button type="button" class="r7-s-e"><span class="r7-s-i" aria-hidden="true" style="background:' + esc(x.k) + '33;border-color:' + esc(x.k) + '">' + x.e + '</span><span style="flex:1;min-width:0"><b>' + esc(x.n) + '</b><small>' + esc(x.p) + '</small></span><i aria-hidden="true">›</i></button></li>');
      li.querySelector('button').onclick = function () { var h = H(); if (h) h.zeige(x.id); };
      ul.appendChild(li);
    });
    sk.querySelector('.r7-s-n').textContent = L.length ? (L.length > 8 ? 'Die ersten 8 von ' + L.length + ' Werkzeugen.' : L.length + (L.length === 1 ? ' Werkzeug' : ' Werkzeuge') + '.') : '';
    if (!L.length) ul.innerHTML = '<li class="r7-leer"><img class="r7-figur" src="posen/passt.jpg" alt="" loading="lazy" width="72" height="72"><p>Hasi kratzt sich am Ohr und hält ein leeres Schild hoch. Versuch ein anderes Wort.</p></li>';
  }
  var st = null; sk.querySelector('input').addEventListener('input', function () { clearTimeout(st); st = setTimeout(suche, 150); });

  /* ---------- 2) Zwei Werkzeuge vergleichen (Vorbild: «Modelle vergleichen» bei Apple) ---------- */
  var mk = el('<section class="r7 r7-karte" aria-labelledby="r7m-t"><p class="r7-eb">Aus deinem Werkzeugkasten</p><h2 id="r7m-t">⚖️ Nebeneinander legen</h2><div class="r7-mk-in"></div>' +
    '<div class="r7-reihe"><button type="button" class="r7-btn voll r7-vgl" disabled>⚖️ Zwei vergleichen</button></div>' +
    '<p class="r7-leise">Wähle zwei Werkzeuge, dann legt Hasi sie nebeneinander auf den Tresen.</p></section>');
  var wahl = [];
  function mkZeigen() {
    var L = kasten().map(wz).filter(Boolean), z = mk.querySelector('.r7-mk-in');
    wahl = wahl.filter(function (id) { return L.some(function (m) { return m.id === id; }); });
    if (L.length < 2) { z.innerHTML = '<div class="r7-leer"><img class="r7-figur" src="posen/passt.jpg" alt="" loading="lazy" width="72" height="72"><p>' + (L.length ? 'Noch ein Würfel fehlt.' : 'Dein Werkzeugkasten ist noch leer.') + ' Tipp im Regal auf einen Würfel und dann auf «♡ In meinen Kasten».</p></div>'; }
    else {
      z.innerHTML = '<ul style="list-style:none;margin:0;padding:0;display:grid;gap:8px"></ul>';
      L.forEach(function (m) {
        var an = wahl.indexOf(m.id) >= 0;
        var li = el('<li><label class="r7-wahl"><input type="checkbox"' + (an ? ' checked' : '') + '><span aria-hidden="true" style="font-size:24px">' + m.e + '</span><span><b style="display:block;color:var(--r7-tinte)">' + esc(m.n) + '</b><small style="color:var(--r7-leise);font-weight:400">' + esc(m.p) + '</small></span></label></li>');
        li.querySelector('input').onchange = function () { if (this.checked) { wahl.push(m.id); if (wahl.length > 2) wahl.shift(); } else wahl = wahl.filter(function (x) { return x !== m.id; }); mkZeigen(); };
        z.firstChild.appendChild(li);
      });
    }
    mk.querySelector('.r7-vgl').disabled = wahl.length !== 2;
  }
  mk.querySelector('.r7-vgl').addEventListener('click', function () {
    var a = wz(wahl[0]), b = wz(wahl[1]); if (!a || !b) return;
    function lz(x) { return x.lic || (x.r === 'lab' ? 'Eigenes Programm von DR Lab' : '–'); }
    function zeile(titel, fa, fb) { return '<tr><th scope="row">' + titel + '</th><td>' + esc(fa) + '</td><td>' + esc(fb) + '</td></tr>'; }
    function link(m) { return m.l ? '<a class="r7-btn" href="' + esc(m.l) + '" target="_blank" rel="noopener">Ansehen</a>' : ''; }
    R.blatt('Nebeneinander auf dem Tresen', '<p class="r7-p" style="font-style:italic;color:var(--r7-leise)">Hasi legt beide Würfel auf die goldene Waage und zeigt abwechselnd mit der Pfote darauf.</p>' +
      '<div style="overflow-x:auto"><table class="r7-vt"><thead><tr><td></td><th scope="col">' + a.e + ' ' + esc(a.n) + '</th><th scope="col">' + b.e + ' ' + esc(b.n) + '</th></tr></thead><tbody>' +
      zeile('Was es kann', a.t, b.t) + zeile('Für wen', a.w, b.w) + zeile('Preis', a.p, b.p) + zeile('Lizenz', lz(a), lz(b)) +
      '<tr><th scope="row"></th><td>' + link(a) + '</td><td>' + link(b) + '</td></tr></tbody></table></div>');
    R.leg('abzVgl', R.hol('abzVgl', 0) + 1); abzZeigen(true);
  });
  function schild(text, g) { geste('daumen', text, g); }

  /* ---------- 3) Erfinder-Abzeichen (Vorbild: Auszeichnungen in Apple Fitness, Duolingo) ---------- */
  function zahlen() { try { return JSON.parse(localStorage.getItem('hasi.lernen')) || {}; } catch (e) { return {}; } }
  var ABZ = [
    ['🧊', 'Neugierig', 'Ersten Würfel angeschaut', function (z) { return z.wuerfel >= 1; }],
    ['🏪', 'Stammgast', '10 Würfel angeschaut', function (z) { return z.wuerfel >= 10; }],
    ['🧩', 'Problemlöser', '3 Probleme gezeigt', function (z) { return (z.probleme || 0) + (z.suchen || 0) >= 3; }],
    ['🔧', 'Werkbank-Lehrling', 'Erste Vorlage gebaut', function (z) { return z.vorlagen >= 1; }],
    ['📦', 'Erster Bau', 'Ein Programm mitgenommen', function (z) { return z.mitgenommen >= 1; }],
    ['👀', 'Code-Leser', 'Hasi Code lesen lassen', function (z) { return z.code >= 1; }],
    ['👍', 'Sauberer Code', '3× Daumen hoch', function (z) { return z.codeOk >= 3; }],
    ['⚖️', 'Erfinder', 'Auf die goldene Waage', function (z) { return z.waage >= 1; }],
    ['🥕', 'Tinkos Freund', '3 Rüebli für Tinko', function (z) { return z.rueebli >= 3; }],
    ['🎬', 'Kinogast', 'Hasis Film geschaut', function (z) { return z.film >= 1; }],
    ['🐾', 'Treue Pfote', 'An 3 Tagen im Laden', function (z) { return (z.tage || []).length >= 3; }],
    ['🧰', 'Sammler', '3 Würfel im Kasten', function () { return kasten().length >= 3; }],
    ['🔍', 'Genau hingeschaut', 'Zwei Werkzeuge verglichen', function () { return R.hol('abzVgl', 0) >= 1; }]
  ];
  /* Runde 7b: Tinkos geschnitzte Holzmedaillen statt Emoji */
  var MED = {"Neugierig": "gluehbirne", "Stammgast": "stern", "Problemlöser": "zahnrad", "Werkbank-Lehrling": "schluessel-werkzeug", "Erster Bau": "rakete", "Code-Leser": "buch", "Sauberer Code": "pinsel", "Erfinder": "krone", "Tinkos Freund": "blatt", "Kinogast": "note", "Treue Pfote": "herz", "Sammler": "schluessel", "Genau hingeschaut": "kompass"};
  var ak = el('<section class="r7 r7-karte" aria-labelledby="r7a-t"><p class="r7-eb">Hasis Holzmedaillen</p><h2 id="r7a-t">🏅 Erfinder-Abzeichen</h2><p class="r7-p r7-abz-stand"></p><div class="r7-abz" role="list"></div></section>');
  function abzZeigen(neuPruefen) {
    var z = zahlen(), alt = R.hol('abz', []), neu = [];
    var g = ak.querySelector('.r7-abz'); g.innerHTML = '';
    ABZ.forEach(function (a) {
      var hat = false; try { hat = !!a[3](z); } catch (e) {}
      if (hat && alt.indexOf(a[1]) < 0) neu.push(a[1]);
      g.appendChild(el('<div role="listitem" class="r7-abz-m' + (hat ? ' hat' : '') + '" aria-label="' + esc(a[1] + ': ' + a[2] + (hat ? ', erreicht' : ', noch offen')) + '"><span aria-hidden="true">' + (MED[a[1]] ? '<img src="medaillen/' + MED[a[1]] + '.jpg" alt="" width="64" height="64" loading="lazy" decoding="async">' : a[0]) + '</span><b>' + esc(a[1]) + '</b><small>' + esc(a[2]) + '</small></div>'));
    });
    var n = ABZ.filter(function (a) { try { return a[3](z); } catch (e) { return false; } }).length;
    ak.querySelector('.r7-abz-stand').textContent = n + ' von ' + ABZ.length + ' Medaillen. Hasi schnitzt jede selbst.';
    if (neu.length) {
      R.leg('abz', alt.concat(neu));
      if (neuPruefen && alt.length) { schild('Neue Medaille: ' + neu[0], 'Hasi hängt dir eine kleine Holzmedaille um und verbeugt sich.'); R.feier(ak.querySelector('.r7-abz'), 10); }
    }
  }

  var css = document.createElement('style');
  css.textContent = [
    '.r7-s-e{width:100%;display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,250,240,.06);color:var(--r7-tinte);font:inherit;text-align:left;cursor:pointer}',
    '.r7-s-e b{display:block}.r7-s-e small{color:var(--r7-leise);font-size:14px}.r7-s-e i{font-style:normal;color:var(--r7-gold);font-size:22px}',
    '.r7-s-i{flex:none;width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-size:22px;border:1px solid}',
    '.r7-wahl{flex-direction:row!important;align-items:center!important;gap:12px!important;min-height:56px;padding:8px 12px;border-radius:16px;background:rgba(255,250,240,.07);cursor:pointer}',
    '.r7-wahl input{width:24px;height:24px;min-height:0!important;padding:0!important;accent-color:#f2c14e;flex:none}',
    '.r7-abz{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin-top:8px}',
    '.r7-abz-m{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;padding:12px 6px;border-radius:16px;border:1px dashed rgba(255,255,255,.2);opacity:.6}',
    '.r7-abz-m span{font-size:28px;width:64px;height:64px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.08);filter:grayscale(1) brightness(.7);overflow:hidden}',
    '.r7-abz-m span img{width:100%;height:100%;object-fit:cover;transform:scale(1.32);display:block}',
    '.r7-abz-m b{font-size:14px;line-height:1.2}.r7-abz-m small{font-size:12px;line-height:1.25;color:var(--r7-leise)}',
    '.r7-abz-m.hat{opacity:1;border:1px solid rgba(242,193,78,.6);background:rgba(242,193,78,.1)}',
    '.r7-abz-m.hat span{filter:none;background:radial-gradient(circle at 35% 30%,#ffe9a8,#c99a3e);box-shadow:0 0 14px rgba(242,193,78,.4)}',
    '.r7-abz-m.hat span img{animation:r7Med .6s ease-out}',
    '@keyframes r7Med{from{transform:scale(1.1) rotate(-8deg)}to{transform:scale(1.32) rotate(0)}}',
    '@media (prefers-reduced-motion:reduce){.r7-abz-m.hat span img{animation:none}}',
    '.r7-vt{width:100%;border-collapse:collapse;font-size:15px}.r7-vt th,.r7-vt td{padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.1);vertical-align:top;text-align:left}',
    '.r7-vt thead th{color:var(--r7-gold2);font-size:16px}.r7-vt tbody th{color:var(--r7-leise);font-weight:700;width:28%}',
    '.r7-schild{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483000;max-width:min(360px,calc(100vw - 32px));padding:12px 20px;border-radius:10px;background:linear-gradient(180deg,#b7793e,#8a5528);border:3px solid #5c3417;color:#fff6e2;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,.45);animation:r7Rein .3s ease-out;transition:opacity .4s}',
    '.r7-schild b{display:block;font-family:Georgia,serif;font-size:20px}.r7-schild i{display:block;font-size:14px;margin-top:4px;opacity:.95}',
    '.r7-schild.weg{opacity:0}'
  ].join('\n');
  document.head.appendChild(css);

  function los() {
    R.einsetzen(sk, '#tresen'); R.einsetzen(mk); R.einsetzen(ak);
    suche(); mkZeigen(); abzZeigen(false);
    document.addEventListener('click', function () { setTimeout(function () { mkZeigen(); abzZeigen(true); }, 400); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(los, 0); }); else setTimeout(los, 0);
})();
