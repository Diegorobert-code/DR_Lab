/* Runde 7 (21.10.2026): Verifizierung, Design und neue Funktionen. Erzeugt aus kern7 + App-Teil. */
window.R7_CFG = {
  k: 'granny',
  css: [
    '#figurStart{overflow-y:auto!important;overflow-x:hidden!important;justify-content:safe center!important}',
    '@media (orientation:landscape) and (max-height:500px){#figurStart{gap:8px!important;padding-top:12px!important;padding-bottom:12px!important}#figurStart img{width:min(36vh,150px)!important;height:min(36vh,150px)!important;border-radius:24px!important}#figurStart h1{font-size:2rem!important}}',
    '.hilfe{background:#c0432c!important}',
    'label.check{min-height:44px}',
    '.r6-karte h2,.r7-karte h2{font-family:inherit}'
  ],
  feldNamen: function (f) { if (f.type === 'file') return 'Foto für Person ' + ((+f.getAttribute('data-i') || 0) + 1); if (f.id === 'e_sprache') return 'Sprache'; return ''; }
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

/* Granny Runde 7: Zeichen für die Familie, Erinnerungs-Diashow, Geburtstage. Alles bleibt auf dem Gerät. */
(function () {
  'use strict';
  var R = window.R7; if (!R) return;
  var esc = R.esc, el = R.el;
  function daten() { try { return JSON.parse(localStorage.getItem('granny.v1')) || {}; } catch (e) { return {}; } }
  function leute() { return (daten().leute || []).filter(function (p) { return p && p.n; }); }
  function meinName() { return daten().name || ''; }
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
  function nummer(p) { return String(p && p.nr || '').replace(/[^\d+]/g, ''); }
  var istIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  function zeit(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

  /* ---------- 1) «Mir geht es gut» – ein Zeichen für die Familie (Vorbild: Apple «Check-in») ---------- */
  var ck = el('<section class="r7 r7-karte r7-gut" aria-labelledby="r7g-t">' +
    '<p class="r7-eb">Jeden Tag</p><h2 id="r7g-t">💛 Ein Zeichen für die Familie</h2>' +
    '<div class="r7-gut-in" style="display:flex;gap:16px;align-items:center"><img class="r7-figur" src="posen/herz.jpg" alt="Granny formt ein Herz mit den Händen" loading="lazy" width="72" height="72">' +
    '<p class="r7-p r7-gut-tx" style="margin:0">Ein Tipp, und deine Familie weiss: Dir geht es gut.</p></div>' +
    '<button type="button" class="r7-btn voll gross r7-gut-knopf" style="margin-top:16px;font-size:22px;min-height:72px">👍 Mir geht es gut</button>' +
    '<p class="r7-leise r7-gut-stand" aria-live="polite"></p></section>');
  function gutStand() {
    var g = R.hol('gut', null), heute = R.heuteK();
    var stand = ck.querySelector('.r7-gut-stand'), k = ck.querySelector('.r7-gut-knopf');
    if (g && g.tag === heute) { stand.textContent = '✓ Heute schon gesendet um ' + g.zeit + '. Granny freut sich mit dir.'; k.textContent = '👍 Nochmals senden'; k.classList.remove('voll'); k.style.fontSize = '18px'; k.style.minHeight = '56px'; }
    else { var p = leute().filter(nummer)[0]; stand.textContent = p ? 'Geht als Nachricht an ' + p.n + '.' : 'Du wählst selbst, wem du es schickst.'; }
  }
  ck.querySelector('.r7-gut-knopf').addEventListener('click', function () {
    var jetzt = new Date(), n = meinName();
    var p = leute().filter(nummer)[0];
    var text = (p ? 'Hoi ' + p.n + ', ' : 'Hoi, ') + 'mir geht es gut 💛' + (n ? ' Liebe Grüsse, ' + n : '') + ' (' + zeit(jetzt) + ')';
    R.leg('gut', { tag: R.heuteK(), zeit: zeit(jetzt) });
    R.feier(ck.querySelector('.r7-gut-knopf'), 10);
    sag('Wie schön. Ich sage es deiner Familie.');
    gutStand();
    setTimeout(function () {
      if (p) location.href = 'sms:' + nummer(p) + (istIOS ? '&' : '?') + 'body=' + encodeURIComponent(text);
      else if (navigator.share) navigator.share({ text: text }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { ck.querySelector('.r7-gut-stand').textContent = 'Text kopiert. Du kannst ihn jetzt einfügen und senden.'; }).catch(function () {});
    }, 700);
  });

  /* ---------- 2) Erinnerungen – Diashow mit der Familie (Vorbild: Apple Fotos «Rückblicke», digitaler Bilderrahmen) ---------- */
  var dk = el('<section class="r7 r7-karte" aria-labelledby="r7d-t"><p class="r7-eb">Schauen und lächeln</p><h2 id="r7d-t">📷 Erinnerungen</h2>' +
    '<p class="r7-p">Granny zeigt dir ganz langsam die Bilder deiner Liebsten. Einfach zuschauen.</p>' +
    '<button type="button" class="r7-btn voll gross r7-dia-los">▶ Erinnerungen ansehen</button></section>');
  var EIGENE = [['posen/winken.jpg', 'Granny winkt dir zu', 'Schön, dass du da bist.'], ['posen/lachen.jpg', 'Granny lacht', 'Wer lacht, hat mehr vom Tag.'], ['posen/herz.jpg', 'Von Herzen', 'Granny denkt an dich.'], ['posen/trinken.jpg', 'Ein Glas Wasser', 'Granny trinkt mit dir.'], ['posen/suchen.jpg', 'Wo ist die Brille?', 'Auf dem Kopf, wie immer.']];
  function dias() {
    var l = leute().filter(function (p) { return p.bild; }).map(function (p) { return { bild: p.bild, titel: p.n, satz: p.wer || 'Ein lieber Mensch.', p: p }; });
    return l.length ? l.concat(EIGENE.slice(0, 2).map(function (e) { return { bild: e[0], titel: e[1], satz: e[2] }; })) : EIGENE.map(function (e) { return { bild: e[0], titel: e[1], satz: e[2] }; });
  }
  dk.querySelector('.r7-dia-los').addEventListener('click', function () {
    var L = dias(), i = 0, pause = false, timer = null;
    var o = el('<div class="r7 r7-dia" role="dialog" aria-modal="true" aria-label="Erinnerungen">' +
      '<div class="r7-dia-bild"><img alt=""></div><div class="r7-dia-text"><h2></h2><p></p><div class="r7-dia-knoepfe"></div></div>' +
      '<button type="button" class="r7-dia-zu" aria-label="Erinnerungen schliessen">×</button>' +
      '<div class="r7-dia-punkte" aria-hidden="true"></div></div>');
    document.body.appendChild(o);
    var img = o.querySelector('img');
    function zeige() {
      var d = L[i];
      img.classList.remove('kb'); void img.offsetWidth; img.src = d.bild; img.alt = d.titel; img.classList.add('kb');
      o.querySelector('h2').textContent = d.titel; o.querySelector('p').textContent = d.satz;
      var kn = o.querySelector('.r7-dia-knoepfe'); kn.innerHTML = '';
      if (d.p && nummer(d.p)) { var a = el('<a class="r7-btn voll" href="tel:' + esc(nummer(d.p)) + '">📞 ' + esc(d.p.n) + ' anrufen</a>'); kn.appendChild(a); }
      o.querySelector('.r7-dia-punkte').innerHTML = L.map(function (_, j) { return '<i' + (j === i ? ' class="an"' : '') + '></i>'; }).join('');
      if (i === 0) sag(d.titel + '. ' + d.satz);
    }
    function weiter() { i = (i + 1) % L.length; zeige(); plan(); }
    function plan() { clearTimeout(timer); if (!pause) timer = setTimeout(weiter, 6500); }
    function schliessen() { clearTimeout(timer); o.remove(); document.removeEventListener('keydown', taste); try { speechSynthesis.cancel(); } catch (e) {} dk.querySelector('.r7-dia-los').focus(); }
    function taste(e) { if (e.key === 'Escape') schliessen(); if (e.key === 'ArrowRight') weiter(); }
    document.addEventListener('keydown', taste);
    o.querySelector('.r7-dia-zu').onclick = schliessen;
    o.querySelector('.r7-dia-bild').onclick = function () { weiter(); };
    zeige(); plan(); o.querySelector('.r7-dia-zu').focus();
  });

  /* ---------- 3) Geburtstage (Vorbild: Geburtstags-Erinnerung in Google Kontakte) ---------- */
  var MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var bk = el('<section class="r7 r7-karte" aria-labelledby="r7b-t"><p class="r7-eb">Nie mehr vergessen</p><h2 id="r7b-t">🎂 Geburtstage</h2>' +
    '<div class="r7-geb-heute" aria-live="polite"></div><ul class="r7-geb-liste" style="list-style:none;margin:0;padding:0;display:grid;gap:8px"></ul>' +
    '<details class="r7-geb-neu" style="margin-top:16px"><summary class="r7-btn" style="list-style:none">＋ Geburtstag eintragen</summary>' +
    '<form style="display:grid;gap:12px;margin-top:12px"><label>Name<input name="n" required autocomplete="off" placeholder="z. B. Diego"></label>' +
    '<label>Geburtstag<input name="d" type="date" required></label><button class="r7-btn voll" type="submit">Merken</button></form></details>' +
    '<p class="r7-leise">Granny erinnert dich drei Tage vorher und am Tag selbst. Bleibt nur auf diesem Gerät.</p></section>');
  function tageBis(md) {
    var h = new Date(); h.setHours(0, 0, 0, 0);
    var t = new Date(h.getFullYear(), +md.slice(0, 2) - 1, +md.slice(3, 5));
    if (t < h) t.setFullYear(h.getFullYear() + 1);
    return Math.round((t - h) / 864e5);
  }
  function gebZeigen() {
    var L = R.hol('geb', []).map(function (g) { return { n: g.n, d: g.d, bis: tageBis(g.d) }; }).sort(function (a, b) { return a.bis - b.bis; });
    var ul = bk.querySelector('.r7-geb-liste'), hz = bk.querySelector('.r7-geb-heute');
    ul.innerHTML = ''; hz.innerHTML = '';
    if (!L.length) { ul.appendChild(el('<li class="r7-leer"><img class="r7-figur" src="posen/suchen.jpg" alt="" loading="lazy" width="72" height="72"><p>Noch keine Geburtstage. Granny hält schon das Büchlein bereit.</p></li>')); return; }
    L.forEach(function (g, j) {
      var wann = g.bis === 0 ? 'Heute! 🎉' : g.bis === 1 ? 'Morgen' : 'in ' + g.bis + ' Tagen';
      var li = el('<li style="display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border-radius:16px;background:rgba(255,250,240,.07)"><span style="font-size:28px" aria-hidden="true">🎂</span><span style="flex:1"><b style="display:block;font-size:18px">' + esc(g.n) + '</b><small style="color:var(--r7-leise);font-size:15px">' + (+g.d.slice(3, 5)) + '. ' + MON[+g.d.slice(0, 2) - 1] + ' · ' + wann + '</small></span><button type="button" class="r7-btn" data-weg="' + j + '" aria-label="' + esc(g.n) + ' entfernen">✕</button></li>');
      li.querySelector('[data-weg]').onclick = function () { var A = R.hol('geb', []).filter(function (x) { return !(x.n === g.n && x.d === g.d); }); R.leg('geb', A); gebZeigen(); };
      ul.appendChild(li);
    });
    var h = L.filter(function (g) { return g.bis <= 3; });
    h.forEach(function (g) {
      var p = leute().filter(function (x) { return x.n && x.n.toLowerCase() === g.n.toLowerCase() && nummer(x); })[0];
      var b = el('<div class="r7-leer" style="border-style:solid;background:rgba(242,193,78,.14);margin-bottom:12px"><img class="r7-figur" src="posen/herz.jpg" alt="" width="72" height="72"><div style="flex:1"><p style="color:var(--r7-tinte);font-size:18px;margin:0 0 8px"><b>' + (g.bis === 0 ? 'Heute hat ' + esc(g.n) + ' Geburtstag!' : esc(g.n) + ' hat ' + (g.bis === 1 ? 'morgen' : 'in ' + g.bis + ' Tagen') + ' Geburtstag.') + '</b></p>' + (p ? '<a class="r7-btn voll" href="tel:' + esc(nummer(p)) + '">📞 Gratulieren</a>' : '') + '</div></div>');
      hz.appendChild(b);
      if (g.bis === 0 && R.hol('gebGesagt', '') !== R.heuteK() + g.n) { R.leg('gebGesagt', R.heuteK() + g.n); setTimeout(function () { R.feier(b, 12); }, 600); }
    });
  }
  bk.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var n = this.n.value.trim(), d = this.d.value;
    if (!n || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
    var A = R.hol('geb', []); A.push({ n: n.slice(0, 40), d: d.slice(5) }); R.leg('geb', A);
    this.reset(); bk.querySelector('details').open = false; gebZeigen(); R.feier(bk.querySelector('.r7-geb-liste'), 6);
    sag('Gemerkt. ' + n + '.');
  });

  var css = document.createElement('style');
  css.textContent = [
    '.r7-dia{position:fixed;inset:0;z-index:2147483000;background:#050916;display:flex;flex-direction:column;color:#fffaf0;animation:r7Rein .4s ease-out}',
    '.r7-dia-bild{flex:1;min-height:0;overflow:hidden;cursor:pointer;position:relative}',
    '.r7-dia-bild img{width:100%;height:100%;object-fit:cover}',
    '.r7-dia-bild img.kb{animation:r7KB 7s ease-out both}',
    '@keyframes r7KB{from{transform:scale(1);opacity:.2}12%{opacity:1}to{transform:scale(1.08) translateY(-1.5%)}}',
    '.r7-dia-text{padding:16px 24px calc(24px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(5,9,22,.4),#050916)}',
    '.r7-dia-text h2{margin:0 0 4px;font-size:30px;color:#ffe08a}',
    '.r7-dia-text p{margin:0 0 12px;font-size:20px}',
    '.r7-dia-zu{position:absolute;top:calc(12px + env(safe-area-inset-top));right:12px;width:56px;height:56px;border-radius:50%;border:0;background:rgba(5,9,22,.65);color:#fff;font-size:30px;cursor:pointer}',
    '.r7-dia-punkte{position:absolute;top:calc(28px + env(safe-area-inset-top));left:16px;display:flex;gap:6px}',
    '.r7-dia-punkte i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.35)}.r7-dia-punkte i.an{background:#ffe08a}',
    '@media (prefers-reduced-motion:reduce){.r7-dia-bild img.kb,.r7-dia{animation:none}}',
    '.r7-geb-neu summary::-webkit-details-marker{display:none}',
    '@media (orientation:landscape) and (max-height:500px){.r7-dia{flex-direction:row}.r7-dia-text{width:40%;display:flex;flex-direction:column;justify-content:center}}'
  ].join('\n');
  document.head.appendChild(css);

  function los() {
    R.einsetzen(ck, '#hilfe'); R.einsetzen(dk); R.einsetzen(bk);
    gutStand(); gebZeigen();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(los, 0); }); else setTimeout(los, 0);
})();
