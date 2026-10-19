/* Coin Maker – Glanz (Runde 3, 19.10.2026): erster Eindruck, Münzregen, Tap-Gefühl, grössere Schrift und Knöpfe.
   Nur Optik und Ablauf. Coins bleiben Punkte ohne Geldwert. Nichts wird gesendet. */
(function () {
  'use strict';
  if (window.CMGlanz) return;
  var $ = function (id) { return document.getElementById(id); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent = [
    /* Kopf: Film gross, Nebensachen als kleine Knöpfe darunter */
    '.werk-knoepfe{display:grid!important;grid-template-columns:repeat(3,1fr);gap:8px}',
    '.werk-knoepfe .wk{min-height:48px;font-size:1rem;padding:8px 10px}',
    '#filmBtn{grid-column:1/-1;min-height:56px;font-size:1.06rem}',
    '.werk-knoepfe .wk.hell,#praesBtn{background:rgba(255,255,255,.06);color:var(--gold,#f2c14e);border-color:rgba(242,193,78,.45)}',
    /* Schrift ab 16 px, Daumen-Knöpfe ab 44 px */
    '.tag{font-size:.875rem}',
    '.bubble small{font-size:1rem}',
    '.consent{font-size:1rem}.consent input,.wrap input[type=checkbox]{width:24px!important;height:24px!important}',
    '.err{font-size:1rem}.crit{font-size:1rem}.muted{font-size:1rem}',
    '.sg-zeile span{font-size:1rem!important}',
    '.del{font-size:1rem;min-height:44px;padding:0 14px;border-radius:12px}',
    '.del.mic{display:inline-flex;align-items:center;gap:6px}',
    '.buy{min-height:44px;font-size:1rem}',
    '.segb{min-height:48px;font-size:1rem}',
    '.film-leiste{font-size:1rem!important}',
    '.sub,label,.why,.ledger .t small,.foot,details ul,.item b,.kv,.meinung,.werk-buehne .bubble{font-size:1rem!important}',
    '.chip{font-size:1rem;min-height:48px}',
    '.wk{font-size:1rem;min-height:48px}.pull.klein{font-size:1rem;min-height:48px}',
    '.stat span{font-size:.875rem}',
    'summary{min-height:44px;display:flex;align-items:center;cursor:pointer}',
    '.wrap{padding-bottom:calc(140px + env(safe-area-inset-bottom))!important;padding-left:max(16px,env(safe-area-inset-left))!important;padding-right:max(16px,env(safe-area-inset-right))!important}',
    'button:focus-visible,textarea:focus-visible,input:focus-visible{outline:3px solid #ffe08a;outline-offset:3px}',
    '.sogehts{transition:opacity .3s,transform .3s}.sogehts.weg{opacity:0;transform:scale(.97)}',
    /* Münzregen */
    '.gl-muenze{position:fixed;top:0;left:0;z-index:2147483600;width:28px;height:28px;border-radius:50%;pointer-events:none;background:radial-gradient(circle at 35% 30%,#fff3b0,#f2c14e 45%,#a8701c);border:2px solid #8a5a14;color:#7a4a10;font:700 14px/24px Georgia,serif;text-align:center;will-change:transform,opacity;animation:glFall var(--t,1.6s) cubic-bezier(.3,.1,.7,1) forwards}',
    '@keyframes glFall{0%{opacity:0;transform:translate(var(--x),-40px) rotate(0)}10%{opacity:1}100%{opacity:0;transform:translate(calc(var(--x) + var(--dx)),var(--y)) rotate(var(--r))}}',
    '.gl-plus{position:fixed;z-index:2147483601;left:0;right:0;margin:0 auto;width:max-content;top:38%;font:800 2.6rem Georgia,serif;color:#ffe08a;text-shadow:0 4px 20px rgba(0,0,0,.6);pointer-events:none;animation:glPlus 1.4s cubic-bezier(.2,.8,.2,1) forwards}',
    '@keyframes glPlus{0%{opacity:0;transform:scale(.5)}25%{opacity:1;transform:scale(1.1)}70%{opacity:1;transform:translateY(-10px)}100%{opacity:0;transform:translateY(-40px)}}',
    'body:has(.praes) .nova-btn,body:has(.praes) .nova-pille{opacity:0;pointer-events:none}',
    '@media (prefers-reduced-motion:reduce){.sogehts{transition:none}}'
  ].join('\n');
  document.head.appendChild(css);

  function summ(m) { try { if (navigator.vibrate) navigator.vibrate(m); } catch (e) {} }
  function regen(n) {
    if (ruhig || !n) return;
    n = Math.min(26, 6 + n);
    for (var i = 0; i < n; i++) {
      var c = document.createElement('i'); c.className = 'gl-muenze'; c.textContent = 'D'; c.setAttribute('aria-hidden', 'true');
      c.style.setProperty('--x', (Math.random() * (innerWidth - 28)) + 'px');
      c.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
      c.style.setProperty('--y', (innerHeight * (0.7 + Math.random() * 0.3)) + 'px');
      c.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg');
      c.style.setProperty('--t', (1.2 + Math.random() * 0.8) + 's');
      c.style.animationDelay = (i * 45) + 'ms';
      document.body.appendChild(c); setTimeout(c.remove.bind(c), 2600 + i * 45);
    }
  }
  function plus(n) {
    if (!n) return;
    var p = document.createElement('div'); p.className = 'gl-plus'; p.setAttribute('aria-hidden', 'true'); p.textContent = '+' + n + ' 🪙';
    document.body.appendChild(p); setTimeout(p.remove.bind(p), 1500);
  }

  // Nach dem Hebel: Münzregen, «+N», Vibration (nur für Punkte, kein Geld)
  function verbinden() {
    if (!window.CMPlus || CMPlus._glanz) return;
    var alt = CMPlus.bewertet;
    CMPlus.bewertet = function (r) {
      alt(r);
      if (r && r.coins > 0) { plus(r.coins); regen(r.coins >= 15 ? 18 : 6); summ(r.coins >= 15 ? [15, 60, 15, 60, 30] : [15, 50, 15]); }
      else summ(30);
    };
    var h = CMPlus.hebelStart;
    CMPlus.hebelStart = function () { summ(20); h(); };
    CMPlus._glanz = true;
  }
  verbinden();
  addEventListener('DOMContentLoaded', verbinden);

  // Spürbares Tippen auf die wichtigen Knöpfe
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.wk,.chip,.pull,.buy,.segb');
    if (b && !b.disabled) summ(8);
  }, true);

  window.CMGlanz = { regen: regen, plus: plus };
})();
