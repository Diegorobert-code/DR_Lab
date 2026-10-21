/* Food and Flow – Runde 4 (21.10.2026)
   1) Flo winkt zurück, wenn man ihn antippt (Puppe.winkeZurueck, sobald es das gibt; sonst Posenbild «winkt»)
   2) «Eine Minute achtsam essen» – geführt von Flo, mit Atemkreis und «🎧 Nur hören»
   3) «Iss den Regenbogen» – fünf Farben pro Tag antippen, Wochenbild füllt sich (ohne Kalorien, ohne Druck)
   4) «Was koche ich heute?» – Flos Kochrad mit Schweizer Herbst-Ideen
   5) Ordnung: die zweite «Mit Flo reden»-Pille verschwindet, solange der grosse Knopf auf der Bühne zu sehen ist
   Alles nur auf dem Gerät, keine Kosten, keine neuen Dienste, keine Gesundheitsversprechen. */
(function () {
  'use strict';
  if (window.FloR4) return;
  var F = window.FLO || {};
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function hol(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function tag(d) { d = d || new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function sag(t) { if (F.sag) F.sag(t); }
  function satz(t) { if (F.floSatz) F.floSatz(t); }
  function pose(n, ms, p) { if (F.pose) F.pose(n, ms, p); }
  function zaehl(k) { if (F.zaehl) try { F.zaehl(k); } catch (e) {} }
  function summ(m) { try { if (navigator.vibrate) navigator.vibrate(m); } catch (e) {} }
  function toast(m) { var t = document.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(t._r4); t._r4 = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  function h(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  var css = [
    '.r4-wink{animation:r4Wink 1.1s cubic-bezier(.3,.7,.3,1)}',
    '@keyframes r4Wink{15%{transform:rotate(-6deg) translateY(-6px)}35%{transform:rotate(5deg) translateY(-6px)}55%{transform:rotate(-4deg)}75%{transform:rotate(2deg)}}',
    '.r4-hand{position:absolute;z-index:5;font-size:46px;pointer-events:none;right:18%;top:22%;transform-origin:70% 90%;animation:r4Hand 1.2s ease-out forwards}',
    '@keyframes r4Hand{0%{opacity:0;transform:scale(.4)}20%{opacity:1;transform:scale(1) rotate(-20deg)}40%{transform:rotate(18deg)}60%{transform:rotate(-14deg)}80%{opacity:1;transform:rotate(10deg)}100%{opacity:0;transform:translateY(-10px)}}',
    'body.r4-heroSicht .nova-pille{opacity:0!important;pointer-events:none!important;transition:opacity .3s}',
    '.r4-kopf{display:flex;align-items:center;justify-content:space-between;gap:10px}',
    '.r4-kopf h3{margin:0}',
    '.r4-lbl{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--warm);font-weight:700;margin-bottom:6px}',
    '.r4-txt{font-size:16px;line-height:1.45;margin:6px 0 0}',
    '.r4-row{display:flex;gap:10px;margin-top:14px}.r4-row>button{flex:1;margin:0}',
    '.r4-btn2{display:block;width:100%;padding:14px;border-radius:16px;background:transparent;border:1px solid var(--line);color:inherit;font:inherit;font-weight:600;font-size:16px;min-height:48px}',
    '.r4-btn2:active,.r4-farbe:active,.r4-rad-btn:active{transform:scale(.97)}',
    /* achtsam */
    '.r4-atem{position:relative;width:180px;height:180px;margin:18px auto 6px;display:grid;place-items:center}',
    '.r4-atem i{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(232,190,92,.55),rgba(232,190,92,.08) 70%);transform:scale(.55);transition:transform 4s ease-in-out}',
    '.r4-atem.ein i{transform:scale(1)}',
    '.r4-atem b{position:relative;font-size:15px;font-weight:600;text-align:center;max-width:140px;line-height:1.35}',
    '.r4-zeit{height:4px;border-radius:4px;background:var(--line);overflow:hidden;margin-top:10px}.r4-zeit>span{display:block;height:100%;width:0;background:var(--warm);transition:width 1s linear}',
    /* regenbogen */
    '.r4-farben{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:14px}',
    '.r4-farbe{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 2px;border-radius:16px;border:2px solid var(--line);background:transparent;color:inherit;font:inherit;font-size:12px;min-height:72px;transition:transform .2s,border-color .2s,background .2s}',
    '.r4-farbe span{font-size:26px;line-height:1}',
    '.r4-farbe.an{border-color:var(--c2);background:color-mix(in srgb,var(--c2) 22%,transparent)}',
    '.r4-woche{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:14px}',
    '.r4-woche div{display:flex;flex-direction:column;gap:3px;align-items:center;font-size:11px;color:var(--muted)}',
    '.r4-woche em{display:block;width:100%;height:6px;border-radius:3px;background:var(--line)}',
    /* kochrad */
    '.r4-rad{position:relative;width:220px;height:220px;margin:16px auto 4px}',
    '.r4-scheibe{width:100%;height:100%;border-radius:50%;border:4px solid #e8be5c;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:transform 3.2s cubic-bezier(.17,.84,.2,1);position:relative;overflow:hidden}',
    '.r4-scheibe span{position:absolute;left:50%;top:50%;font-size:26px;width:30px;height:30px;margin:-15px;display:grid;place-items:center}',
    '.r4-zeiger{position:absolute;left:50%;top:-12px;margin-left:-12px;width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:22px solid #e8be5c;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4));z-index:2}',
    '.r4-rad-btn{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px;border-radius:50%;border:3px solid #e8be5c;background:#0f1b3d;color:#ffe9a8;font:700 15px var(--sans);z-index:3;box-shadow:0 4px 14px rgba(0,0,0,.4)}',
    '.r4-rezept{margin-top:12px;padding:14px;border-radius:16px;border:1px solid var(--line);display:none}',
    '.r4-rezept.on{display:block;animation:r4Auf .5s var(--ease) both}',
    '.r4-rezept b{font-size:18px;display:block;margin-bottom:4px}',
    '@keyframes r4Auf{from{opacity:0;transform:translateY(8px)}}',
    '@media (prefers-reduced-motion:reduce){.r4-wink,.r4-hand,.r4-rezept.on{animation:none}.r4-scheibe,.r4-atem i{transition:none}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- 1) Zurückwinken ---------- */
  function winke(img) {
    if (window.Puppe && typeof Puppe.winkeZurueck === 'function') { try { Puppe.winkeZurueck(img); return; } catch (e) {} }
    pose('winkt', 1800, '👋');
    if (ruhig || !img) return;
    img.classList.remove('r4-wink'); void img.offsetWidth; img.classList.add('r4-wink');
    var b = img.closest('.nb-buehne, .figur-hero') || img.parentElement;
    if (b) { if (getComputedStyle(b).position === 'static') b.style.position = 'relative'; var hd = h('<span class="r4-hand" aria-hidden="true">👋</span>'); b.appendChild(hd); setTimeout(function () { hd.remove(); }, 1300); }
  }
  document.addEventListener('click', function (e) {
    var img = e.target.closest && e.target.closest('.nb-buehne img, .figur-hero img');
    if (img) winke(img);
  });
  document.addEventListener('animationend', function (e) { if (e.animationName === 'r4Wink') e.target.classList.remove('r4-wink'); });

  /* ---------- 5) Doppelte Pille ausblenden, solange die Bühne sichtbar ist ---------- */
  function heroWache() {
    var hero = document.querySelector('.nb-buehne') || document.querySelector('.figur-hero');
    if (!hero || !('IntersectionObserver' in window)) return false;
    new IntersectionObserver(function (es) { document.body.classList.toggle('r4-heroSicht', es[0].isIntersecting); }, { threshold: .25 }).observe(hero);
    return true;
  }
  if (!heroWache()) setTimeout(heroWache, 1500);

  /* ---------- Karten ---------- */
  var box = document.createElement('div'); box.id = 'floR4';
  var ziel = document.getElementById('floHeute');
  if (!ziel) return;
  ziel.after(box);

  /* 2) Achtsam essen */
  var SCHRITTE = [
    [0, 'Leg alles andere kurz weg. Schau dein Essen an. Welche Farben siehst du?'],
    [12, 'Atme einmal tief ein … und langsam aus.'],
    [20, 'Riech daran. Was fällt dir auf?'],
    [30, 'Nimm einen kleinen Bissen. Leg die Gabel hin. Kau langsam.'],
    [45, 'Wie schmeckt es? Süss, salzig, frisch, warm?'],
    [55, 'Schön. Iss in deinem Tempo weiter. En Guete!']
  ];
  var ach = h('<div class="card" id="r4achtsam"><div class="r4-lbl">✨ Neu bei Flo</div><div class="r4-kopf"><h3>Eine Minute achtsam essen</h3></div>' +
    '<p class="r4-txt">Flo begleitet dich durch den ersten Bissen. Einfach zuhören.</p>' +
    '<div class="r4-atem" hidden><i></i><b>Bereit?</b></div><div class="r4-zeit" hidden><span></span></div>' +
    '<div class="r4-row"><button class="btn" type="button" data-a="start">Los, mit Flo</button><button class="r4-btn2" type="button" data-a="hoer">🎧 Nur hören</button></div></div>');
  box.appendChild(ach);
  var achLauf = null;
  function achStop(text) {
    clearInterval(achLauf); achLauf = null;
    ach.querySelector('.r4-atem').hidden = true; ach.querySelector('.r4-zeit').hidden = true;
    ach.querySelector('[data-a=start]').textContent = 'Nochmal';
    if (text) { satz(text); toast(text); }
  }
  function achStart(nurHoeren) {
    if (achLauf) { achStop(); try { speechSynthesis.cancel(); } catch (e) {} return; }
    zaehl('achtsam'); pose('ruhig', 0, '🍃');
    var atem = ach.querySelector('.r4-atem'), b = atem.querySelector('b'), bar = ach.querySelector('.r4-zeit span');
    atem.hidden = !!nurHoeren; ach.querySelector('.r4-zeit').hidden = false; bar.style.width = '0';
    ach.querySelector('[data-a=start]').textContent = 'Stopp';
    var s = 0, i = 0;
    function schritt() {
      while (i < SCHRITTE.length && SCHRITTE[i][0] <= s) { b.textContent = SCHRITTE[i][1]; sag(SCHRITTE[i][1]); satz(SCHRITTE[i][1]); i++; }
      atem.classList.toggle('ein', Math.floor(s / 4) % 2 === 0);
      bar.style.width = Math.min(100, s / 60 * 100) + '%';
      if (s >= 60) { achStop('Eine achtsame Minute. Schön, dass du dir Zeit genommen hast.'); pose('jubel', 2000, '🌿'); summ([10, 40, 10]); var n = hol('flo.achtsam', 0) + 1; leg('flo.achtsam', n); }
      s++;
    }
    schritt(); achLauf = setInterval(schritt, 1000);
  }
  ach.querySelector('[data-a=start]').onclick = function () { achStart(false); };
  ach.querySelector('[data-a=hoer]').onclick = function () { achStart(true); };

  /* 3) Regenbogen */
  var FARBEN = [
    { k: 'rot', e: '🍅', n: 'Rot', c: '#e2584d', bsp: 'Tomate, Peperoni, Beeren' },
    { k: 'orange', e: '🥕', n: 'Orange', c: '#ef9a3c', bsp: 'Rüebli, Kürbis, Aprikose' },
    { k: 'gelb', e: '🍋', n: 'Gelb', c: '#f2c94c', bsp: 'Mais, Banane, Zitrone' },
    { k: 'gruen', e: '🥦', n: 'Grün', c: '#5fb36b', bsp: 'Broccoli, Salat, Spinat' },
    { k: 'violett', e: '🍇', n: 'Violett', c: '#8f6cc4', bsp: 'Trauben, Randen, Rotkohl' }
  ];
  var rb = h('<div class="card" id="r4regen"><div class="r4-kopf"><h3>🌈 Iss den Regenbogen</h3></div>' +
    '<p class="r4-txt">Welche Farben waren heute auf deinem Teller? Einfach antippen.</p><div class="r4-farben"></div><div class="r4-woche" aria-label="Deine Woche"></div><p class="small r4-rbtxt" style="margin:10px 0 0"></p></div>');
  box.appendChild(rb);
  function rbDaten() { return hol('flo.regen', {}); }
  function rbZeigen() {
    var d = rbDaten(), heute = d[tag()] || [];
    var f = rb.querySelector('.r4-farben'); f.innerHTML = '';
    FARBEN.forEach(function (x) {
      var b = h('<button type="button" class="r4-farbe' + (heute.indexOf(x.k) >= 0 ? ' an' : '') + '" style="--c2:' + x.c + '" aria-pressed="' + (heute.indexOf(x.k) >= 0) + '" title="' + x.bsp + '"><span>' + x.e + '</span>' + x.n + '</button>');
      b.onclick = function () {
        var dd = rbDaten(), l = dd[tag()] || [], i = l.indexOf(x.k);
        if (i >= 0) l.splice(i, 1); else { l.push(x.k); summ(8); }
        dd[tag()] = l; var keys = Object.keys(dd).sort(); while (keys.length > 60) delete dd[keys.shift()];
        leg('flo.regen', dd); zaehl('regenbogen');
        if (i < 0) {
          if (l.length === 5) { pose('jubel', 2200, '🌈'); var s1 = 'Alle fünf Farben! Ein ganzer Regenbogen auf deinem Teller.'; satz(s1); sag(s1); summ([10, 40, 10, 40, 10]); }
          else { pose('jubel', 1200, x.e); satz(x.n + ' ist dabei. ' + (5 - l.length) + ' Farbe' + (5 - l.length === 1 ? '' : 'n') + ' fehlen noch, z. B. ' + FARBEN.filter(function (y) { return l.indexOf(y.k) < 0; })[0].bsp + '.'); }
        }
        rbZeigen();
      };
      f.appendChild(b);
    });
    var w = rb.querySelector('.r4-woche'); w.innerHTML = ''; var total = 0;
    for (var i = 6; i >= 0; i--) {
      var dt = new Date(); dt.setDate(dt.getDate() - i); var l = d[tag(dt)] || []; total += l.length;
      var col = h('<div><b style="font-weight:600">' + ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][dt.getDay()] + '</b></div>');
      FARBEN.forEach(function (x) { var e = document.createElement('em'); if (l.indexOf(x.k) >= 0) e.style.background = x.c; col.appendChild(e); });
      w.appendChild(col);
    }
    rb.querySelector('.r4-rbtxt').textContent = total ? 'Diese Woche: ' + total + ' Farbtupfer. Jede Farbe bringt andere Pflanzenstoffe.' : 'Kein Zählen, kein Muss. Nur Farbe.';
  }
  rbZeigen();

  /* 4) Kochrad */
  var IDEEN = [
    { e: '🎃', n: 'Kürbissuppe mit Ingwer', z: 'Kürbis, Zwiebel, Ingwer, Bouillon, etwas Rahm', t: '30 Min.' },
    { e: '🧀', n: 'Älplermagronen mit Apfelmus', z: 'Hörnli, Kartoffeln, Bergkäse, Zwiebeln, Apfelmus', t: '35 Min.' },
    { e: '🌰', n: 'Marroni-Pilz-Pfanne', z: 'Marroni, Champignons, Rosenkohl, Thymian', t: '25 Min.' },
    { e: '🥕', n: 'Rüebli-Linsen-Dal', z: 'Rote Linsen, Rüebli, Kokosmilch, Curry', t: '25 Min.' },
    { e: '🥔', n: 'Ofengemüse mit Quarkdip', z: 'Kartoffeln, Randen, Rüebli, Quark, Kräuter', t: '40 Min.' },
    { e: '🍎', n: 'Apfel-Birchermüesli', z: 'Haferflocken, Joghurt, Apfel, Nüsse', t: '10 Min.' },
    { e: '🥬', n: 'Capuns light im Glas', z: 'Mangold, Spätzliteig, Kräuter, etwas Bündnerfleisch oder Pilze', t: '35 Min.' },
    { e: '🍲', n: 'Gerstensuppe', z: 'Rollgerste, Lauch, Rüebli, Sellerie', t: '45 Min.' }
  ];
  var FARB = ['#2b3c78', '#3a4a86', '#25356e', '#33447f'];
  var rad = h('<div class="card" id="r4rad"><div class="r4-kopf"><h3>🎡 Was koche ich heute?</h3></div><p class="r4-txt">Dreh Flos Kochrad. Herbst-Ideen aus der Schweiz.</p>' +
    '<div class="r4-rad"><div class="r4-zeiger"></div><div class="r4-scheibe"></div><button class="r4-rad-btn" type="button">Drehen</button></div><div class="r4-rezept" aria-live="polite"></div></div>');
  box.appendChild(rad);
  var sch = rad.querySelector('.r4-scheibe'), n = IDEEN.length, seg = 360 / n, winkel = 0;
  sch.style.background = 'conic-gradient(' + IDEEN.map(function (x, i) { return FARB[i % 4] + ' ' + (i * seg) + 'deg ' + ((i + 1) * seg) + 'deg'; }).join(',') + ')';
  IDEEN.forEach(function (x, i) {
    var a = (i + .5) * seg, s = document.createElement('span'); s.textContent = x.e;
    s.style.transform = 'rotate(' + a + 'deg) translateY(-78px) rotate(' + (-a) + 'deg)'; sch.appendChild(s);
  });
  rad.querySelector('.r4-rad-btn').onclick = function () {
    var ziel = Math.floor(Math.random() * n);
    var rest = ((360 - (ziel + .5) * seg) - (winkel % 360) + 360) % 360;
    winkel += (ruhig ? 0 : 1080) + rest; sch.style.transform = 'rotate(' + winkel + 'deg)';
    var r = rad.querySelector('.r4-rezept'); r.classList.remove('on'); pose('jog', 1500, '🎡'); summ(6); zaehl('kochrad');
    setTimeout(function () {
      var x = IDEEN[ziel];
      r.innerHTML = '<b>' + x.e + ' ' + x.n + '</b><div class="small">⏱ ' + x.t + '</div><p class="r4-txt">' + x.z + '</p>';
      r.classList.add('on'); pose('jubel', 1800, x.e); var s2 = 'Wie wäre es heute mit ' + x.n + '?'; satz(s2); sag(s2); summ([10, 30, 10]);
    }, ruhig ? 50 : 3250);
  };

  window.FloR4 = { winke: winke };
})();
