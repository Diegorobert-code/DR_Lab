/* Coin Maker · Runde 4 (21.10.2026): «animiert wie ein Trickfilm», Stil KI-Pixel.
   - Figur aus den KI-Pixel-Bildern (posen/freude = Münze, hebel = Automat, lupe = prüft): atmet sanft, weiches Kinolicht,
     Posen werden weich überblendet. Zug am Hebel → Automat, Bewertung → prüft, Ergebnis → Münze.
   - Antippen: winkt zurück (👋, Haken für Puppe.winkeZurueck aus nova/puppe.js, sobald dieser Baustein auf main liegt).
   - Automat: Hebel schwingt mit Gewicht zurück, Münzen fallen in einer Bogenbahn, klimpern und stapeln sich,
     Zahlen zählen hoch mit weichem Glühen.
   - Feinschliff für kleine iPhones (320–375 px): Reiter passen, Ideenfeld wächst mit, goldene Checkboxen,
     Einwilligung gut lesbar, saubere Abstände im Kopf.
   Nur CSS/JS, keine Dienste. Respektiert prefers-reduced-motion. Coins bleiben Punkte ohne Geldwert. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BILD = { ruhig: 'posen/freude.jpg', freude: 'posen/freude.jpg', nicken: 'posen/freude.jpg', winken: 'posen/freude.jpg', erzaehlen: 'posen/freude.jpg', kuchen: 'posen/freude.jpg',
    hebel: 'posen/hebel.jpg', tresor: 'posen/hebel.jpg', lupe: 'posen/lupe.jpg', ernst: 'posen/lupe.jpg', waage: 'posen/lupe.jpg' };
  var HAKEN = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#3a2406" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>');

  var css = document.createElement('style');
  css.textContent = [
    /* ---- Kopf: ruhiger, saubere Abstände ---- */
    '.werk-buehne{height:340px}',
    '.cm-fig{left:14px!important;bottom:14px!important;width:calc(50% - 21px)!important;max-width:230px!important;animation:cmAtmen 4.8s ease-in-out infinite;transform-origin:50% 100%}',
    '.cm-fig[data-pose=hebel]{transform:none!important}',
    '.cm-fig-in{position:absolute;inset:0;border-radius:22px;overflow:hidden;border:3px solid var(--gold);box-shadow:0 12px 30px #000b,0 0 34px #f2c14e40;background:#1a1230}',
    '.cm-fig-in img{position:absolute;inset:0;width:100%!important;height:100%!important;object-fit:cover;object-position:50% 30%;border:0!important;border-radius:0!important;box-shadow:none!important;transition:opacity .45s ease;cursor:pointer}',
    '.cm-fig-in img.cm-b{opacity:0;pointer-events:none}',
    '.cm-fig-in img.cm-b.an{opacity:1}',
    '.cm-fig .figur-logo{animation:none}',
    '.cm-fig .cm-fig-in img{animation:none!important;filter:none!important;transform:none!important}',
    '.cm-fig[data-pose=freude] .cm-fig-in{animation:cmHuepf .5s ease-out 2}',
    '.cm-fig[data-pose=nicken] .cm-fig-in{animation:cmNicken .5s ease-in-out 2}',
    '.cm-fig[data-pose=lupe] .cm-fig-in{animation:cmNeigen 2.4s ease-in-out infinite}',
    '.cm-fig[data-pose=winken] .cm-fig-in{animation:cmWinken .7s ease-in-out 2}',
    '.cm-fig[data-pose=erzaehlen] .cm-fig-in{animation:cmErzaehl 1.4s ease-in-out infinite}',
    '.cm-fig[data-pose=hebel] .cm-fig-in{animation:cmZug .6s cubic-bezier(.3,1.4,.5,1)}',
    '@keyframes cmZug{40%{transform:translateX(8px) rotate(2deg) scale(1.02)}}',
    '.cm-fig[data-pose=ernst] .cm-fig-in{filter:saturate(.75) brightness(.9)}',
    '.cm-licht{position:absolute;inset:0;pointer-events:none;background:radial-gradient(70% 60% at 30% 20%,rgba(255,226,150,.28),transparent 60%),linear-gradient(180deg,transparent 60%,rgba(10,6,30,.35));mix-blend-mode:screen;animation:cmLicht 6s ease-in-out infinite}',
    '.cm-fig.glueht .cm-fig-in{box-shadow:0 12px 30px #000b,0 0 0 3px #ffe08a,0 0 46px 10px #f2c14eaa;transition:box-shadow .3s}',
    '.cm-hand{position:absolute;right:-6px;top:-14px;font-size:38px;opacity:0;pointer-events:none;transform-origin:70% 90%;filter:drop-shadow(0 4px 6px #000a);z-index:2}',
    '.cm-hand.an{animation:cmHand 1.3s ease-in-out}',
    '.cm-lupe,.cm-req{z-index:2}',
    '.werk-buehne .bubble{right:14px!important;top:14px!important;width:calc(50% - 21px)!important;max-height:calc(100% - 92px)!important}',
    '.werk-buehne .bubble::after{bottom:auto!important;top:22px}',
    '.werk-muenzen{right:14px!important}',
    '@keyframes cmAtmen{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3px) scale(1.012)}}',
    '@keyframes cmLicht{0%,100%{opacity:.85}50%{opacity:1}}',
    '@keyframes cmHand{0%{opacity:0;transform:rotate(0) scale(.6)}15%{opacity:1;transform:scale(1)}30%{transform:rotate(-24deg)}48%{transform:rotate(18deg)}66%{transform:rotate(-16deg)}82%{opacity:1;transform:rotate(8deg)}100%{opacity:0;transform:rotate(0)}}',
    '@media (max-width:380px){.werk-buehne{height:320px}}',
    '@media (max-width:340px){.werk-buehne{height:300px}.werk-buehne .bubble{font-size:.9rem!important;padding:10px 12px}}',
    /* Automaten-Bogen bekommt Luft nach oben */
    '.machine{margin-top:48px!important}',
    /* ---- Reiter: passen auch bei 320 px ---- */
    '.types{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}',
    '.types .chip{min-width:0!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:8px 4px;line-height:1.15;white-space:normal;overflow-wrap:anywhere;font-size:.95rem}',
    '.types .chip .ce{font-size:1.25rem;line-height:1}',
    /* ---- Ideenfeld: grösser und wächst mit ---- */
    '#txt{min-height:160px;max-height:60vh;field-sizing:content;resize:none;line-height:1.5;padding:12px 14px}',
    '#textBox{display:flex;flex-direction:column;gap:8px}#textBox .mic{align-self:flex-start}',
    /* ---- Goldene Checkboxen, Einwilligung gut lesbar ---- */
    '.wrap input[type=checkbox]{-webkit-appearance:none;appearance:none;width:28px!important;height:28px!important;flex:none;margin:0;border-radius:8px;border:2px solid #b8862a;background:#fff8e4;box-shadow:inset 0 1px 2px #0002;cursor:pointer;transition:background-color .15s,transform .15s;background-position:center;background-repeat:no-repeat;background-size:20px}',
    '.wrap input[type=checkbox]:checked{background-color:#f2c14e;border-color:#8a5a14;background-image:url("' + HAKEN + '");box-shadow:0 0 0 3px #f2c14e44}',
    '.wrap input[type=checkbox]:active{transform:scale(.92)}',
    '.machine .consent{background:#fff8e4;color:#2a1a08;border:2px solid var(--brass-dk);border-radius:14px;padding:12px 14px;gap:12px;align-items:flex-start;line-height:1.45;font-size:1rem!important;font-weight:600}',
    '.machine .consent label{font-size:1rem!important;color:#2a1a08;overflow-wrap:anywhere;min-width:0}',
    '.consent{gap:12px!important;align-items:flex-start;line-height:1.45}',
    /* ---- Hebel mit Gewicht ---- */
    '.lever .stick{transition:none!important}',
    '.lever.down .stick{animation:cmHebel 2.4s linear both}',
    '@keyframes cmHebel{0%{transform:rotate(18deg);animation-timing-function:cubic-bezier(.5,0,.9,.6)}12%{transform:rotate(152deg);animation-timing-function:ease-out}18%{transform:rotate(146deg)}40%{transform:rotate(150deg);animation-timing-function:cubic-bezier(.4,0,.6,1)}56%{transform:rotate(4deg);animation-timing-function:ease-out}66%{transform:rotate(30deg)}76%{transform:rotate(11deg)}86%{transform:rotate(22deg)}94%{transform:rotate(16deg)}100%{transform:rotate(18deg)}}',
    /* ---- Münzen: Bogenbahn, klimpern, stapeln ---- */
    '.chute-hole{height:86px!important;overflow:hidden}',
    '.chute-hole .coin{top:0!important;left:50%!important;margin-left:-13px;transform:translate(var(--sx),-40px);animation:cmBogen .95s linear forwards!important;will-change:transform}',
    '@keyframes cmBogen{0%{transform:translate(var(--sx),-40px) rotate(0);animation-timing-function:cubic-bezier(.2,.5,.5,1)}35%{transform:translate(calc(var(--sx) * .35 + var(--fx) * .65),-14px) rotate(160deg);animation-timing-function:cubic-bezier(.5,0,1,.7)}72%{transform:translate(var(--fx),var(--fy)) rotate(330deg);animation-timing-function:ease-out}82%{transform:translate(var(--fx),calc(var(--fy) - 7px)) rotate(345deg);animation-timing-function:ease-in}92%{transform:translate(var(--fx),var(--fy)) rotate(358deg)}96%{transform:translate(var(--fx),calc(var(--fy) - 2px)) rotate(360deg)}100%{transform:translate(var(--fx),var(--fy)) rotate(360deg)}}',
    '.cm-klimper{position:absolute;top:0;left:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#fff;box-shadow:0 0 10px 4px #ffe08a;pointer-events:none;opacity:0;animation:cmKlimper .45s ease-out forwards}',
    '@keyframes cmKlimper{0%{opacity:0;transform:translate(var(--fx),var(--fy)) scale(.3)}40%{opacity:1;transform:translate(var(--fx),var(--fy)) scale(1.5)}100%{opacity:0;transform:translate(var(--fx),calc(var(--fy) - 10px)) scale(.4)}}',
    /* ---- Zahlen glühen ---- */
    '#resCoins.zaehlt,#rateBig.zaehlt{text-shadow:0 0 18px #ffe08a,0 0 4px #fff3c4;transition:text-shadow .4s}',
    '@media (prefers-reduced-motion:reduce){.cm-fig,.cm-licht,.cm-hand.an,.lever.down .stick,.chute-hole .coin,.cm-klimper{animation:none!important}.chute-hole .coin{transform:translate(var(--fx),var(--fy))}.cm-fig-in img{transition:none}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- Texte: DR Lab bleibt intern ---------- */
  var tag = document.querySelector('.werk-kopf .tag'); if (tag) tag.textContent = 'Ideen werden Münzen';
  var fuss = document.querySelector('.foot'); if (fuss) fuss.textContent = 'The Coin Maker · Werkstatt bei Nacht · Coins sind Punkte ohne Geldwert';
  var tr = $('t-rueck'); if (tr) { tr.innerHTML = '<span class="ce" aria-hidden="true">💬</span>Echo'; tr.setAttribute('aria-label', 'Rückmeldung (Echo)'); }
  var ti = $('t-idee'); if (ti) ti.innerHTML = '<span class="ce" aria-hidden="true">💡</span>Idee';
  var td = $('t-daten'); if (td) td.innerHTML = '<span class="ce" aria-hidden="true">📊</span>Daten';

  /* ---------- Ideenfeld wächst mit (Ersatz, wo field-sizing fehlt) ---------- */
  var txt = $('txt');
  function wachse() { if (!txt || (window.CSS && CSS.supports && CSS.supports('field-sizing', 'content'))) return; txt.style.height = 'auto'; txt.style.height = Math.min(txt.scrollHeight + 4, innerHeight * 0.6) + 'px'; }
  if (txt) { txt.addEventListener('input', wachse); setTimeout(wachse, 50); }

  /* ---------- Figur: KI-Pixel-Bilder, Überblendung, Kinolicht ---------- */
  var fig = $('cmfig'), a = fig && fig.querySelector('img');
  if (!fig || !a) return;
  var innen = document.createElement('div'); innen.className = 'cm-fig-in';
  fig.insertBefore(innen, a); innen.appendChild(a);
  var b = document.createElement('img'); b.className = 'cm-b'; b.alt = ''; b.setAttribute('aria-hidden', 'true'); innen.appendChild(b);
  var licht = document.createElement('span'); licht.className = 'cm-licht'; licht.setAttribute('aria-hidden', 'true'); innen.appendChild(licht);
  var hand = document.createElement('span'); hand.className = 'cm-hand'; hand.setAttribute('aria-hidden', 'true'); hand.textContent = '👋'; fig.appendChild(hand);
  a.classList.remove('figur-logo');
  a.alt = 'The Coin Maker, ein gütiger alter Münzmacher mit Brille und Uhrmacher-Lupe';
  a.src = BILD.ruhig; a.dataset.grundbild = BILD.ruhig;
  fig.setAttribute('role', 'button'); fig.setAttribute('tabindex', '0'); fig.setAttribute('aria-label', 'Coin Maker antippen, er winkt zurück');
  var aktuell = BILD.ruhig, wechselT = null;
  function zeigeBild(src) {
    if (!src || src === aktuell) return;
    aktuell = src; clearTimeout(wechselT);
    if (ruhig) { a.src = src; return; }
    b.onload = function () { b.classList.add('an'); wechselT = setTimeout(function () { a.src = src; setTimeout(function () { b.classList.remove('an'); }, 60); }, 470); };
    b.src = src;
  }
  // Posen-Bilder kommen jetzt von hier (weich überblendet), nicht mehr hart aus posen.js
  if (window.FigurPosen) { window.FigurPosen.zeige = function () { return Promise.resolve(false); }; }
  new MutationObserver(function () { zeigeBild(BILD[fig.getAttribute('data-pose')] || BILD.ruhig); }).observe(fig, { attributes: true, attributeFilter: ['data-pose'] });
  [BILD.hebel, BILD.lupe].forEach(function (s) { var im = new Image(); im.src = s; });

  /* ---------- Antippen: winkt zurück ---------- */
  var GRUSS = ['Grüss dich! Schön, dass du da bist.', 'Hallo! Hast du eine Idee für meinen Automaten?', 'Jede Idee hat ihren Wert. Zeig mir deine.', 'Ich poliere gerade eine Münze. Für dich.'], gi = 0;
  function winke(ev) {
    if (ev) { ev.stopPropagation(); ev.preventDefault(); }
    if (window.Puppe && typeof window.Puppe.winkeZurueck === 'function') { try { window.Puppe.winkeZurueck(a, { figur: 'coinmaker' }); } catch (e) {} }
    if (window.CMPlus) { CMPlus.pose('winken', 1800); CMPlus.sag(GRUSS[gi++ % GRUSS.length], 'Leg etwas in den Automaten und zieh am Hebel.'); }
    if (!ruhig) { hand.classList.remove('an'); void hand.offsetWidth; hand.classList.add('an'); }
    try { navigator.vibrate && navigator.vibrate(12); } catch (e) {}
  }
  fig.addEventListener('click', winke, true);
  fig.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') winke(e); });
  hand.addEventListener('animationend', function () { hand.classList.remove('an'); });

  /* ---------- Hebel → Automat, dann prüft ---------- */
  if (window.CMPlus) {
    CMPlus.hebelStart = function () { CMPlus.pose('hebel', 0); setTimeout(function () { CMPlus.pose('lupe', 0); }, 900); };
    var altBewertet = CMPlus.bewertet;
    CMPlus.bewertet = function (r) {
      altBewertet(r);
      if (!r.dup) CMPlus.pose('freude', 3200);
      zaehle($('resCoins'), r.coins, ' Coins');
      fig.classList.add('glueht'); setTimeout(function () { fig.classList.remove('glueht'); }, 1400);
    };
  }

  /* ---------- Zahlen zählen hoch ---------- */
  function zaehle(el, ziel, nach) {
    if (!el) return;
    if (ruhig || !(ziel > 0)) { el.textContent = ziel + nach; return; }
    var t0 = performance.now(), dauer = Math.min(1400, 500 + ziel * 25);
    el.classList.add('zaehlt');
    (function schritt(t) {
      var p = Math.min(1, (t - t0) / dauer), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ziel * e) + nach;
      if (p < 1) requestAnimationFrame(schritt); else setTimeout(function () { el.classList.remove('zaehlt'); }, 500);
    })(t0);
  }

  /* ---------- Münzen: Bogenbahn und Stapel ---------- */
  var chute = $('chute'), n = 0;
  if (chute) new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      if (m.removedNodes.length && !chute.querySelector('.coin')) n = 0;
      m.addedNodes.forEach(function (c) {
        if (!c.classList || !c.classList.contains('coin')) return;
        var i = n++, spalte = i % 5, lage = Math.floor(i / 5);
        var fx = (spalte - 2) * 22 + (lage % 2 ? 11 : 0), fy = 86 - 30 - lage * 9;
        var sx = (i % 2 ? 1 : -1) * (70 + Math.random() * 30);
        c.style.setProperty('--fx', fx + 'px'); c.style.setProperty('--fy', fy + 'px'); c.style.setProperty('--sx', sx + 'px');
        c.style.zIndex = String(10 + lage);
        if (!ruhig) setTimeout(function () {
          var k = document.createElement('i'); k.className = 'cm-klimper'; k.style.setProperty('--fx', fx + 'px'); k.style.setProperty('--fy', (fy + 4) + 'px');
          chute.appendChild(k); setTimeout(function () { k.remove(); }, 500);
        }, 680);
      });
    });
  }).observe(chute, { childList: true });
})();
