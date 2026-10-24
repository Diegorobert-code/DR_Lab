/* Runde 9 (Feinschliff): Sanftes Zeitlimit, Eltern-Sachen nur im Elternbereich, grössere Tippflächen,
   sanfte Übergänge (ausser bei «Bewegung reduzieren»). Alles bleibt auf dem Handy, kein Server. */
(function () {
  if (window.OTTI_R9) return; window.OTTI_R9 = true;
  var K = 'otti.r9.';
  function hol(k, d) { try { var v = localStorage.getItem(K + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  var ruhig = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var API = window.OTTI_API || {};

  /* ---------- Aussehen ---------- */
  var css = [
    /* Nova-Knopf schwebt nicht über offenen Blättern und Elternseiten */
    'body:has(.blatt:not([hidden])) .nova-btn,body:has(.eltern:not([hidden])) .nova-btn,body:has(.r9-muede) .nova-btn,body:has(.r7-voll) .nova-btn{visibility:hidden}',
    /* Tippflächen mindestens 48 px */
    '.nova-panel .nova-ton,.nova-panel .mic,.nova-panel .nova-live-knopf,.nova-panel .nova-einsetzen{min-width:48px;min-height:48px}',
    '.ebereich .zeile button{min-height:48px}', '.nein{min-height:48px}',
    '.haken{min-height:48px;align-items:center}',
    /* Sanfte Übergänge */
    '@media (prefers-reduced-motion:no-preference){',
    ' .blatt:not([hidden]) .blattinnen{animation:r9-hoch .32s cubic-bezier(.2,.8,.2,1)}',
    ' .eltern:not([hidden]) .karte{animation:r9-auf .28s ease-out}',
    ' @keyframes r9-hoch{from{transform:translateY(24px);opacity:.4}to{transform:none;opacity:1}}',
    ' @keyframes r9-auf{from{transform:scale(.98);opacity:0}to{transform:none;opacity:1}}',
    '}',
    /* Sanftes Zeitlimit: Otti wird müde */
    '.r9-muede{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:safe center;gap:16px;padding:24px 16px calc(24px + env(safe-area-inset-bottom));box-sizing:border-box;text-align:center;color:#f3ecd8;background:radial-gradient(120% 80% at 50% 30%,#1a2550,#070b1d 70%);overflow-y:auto}',
    '.r9-muede img{width:min(62vw,260px,38vh);aspect-ratio:1;object-fit:cover;border-radius:50%;box-shadow:0 0 0 5px #f2c14e55,0 0 60px #f2c14e33;transition:opacity 1.2s ease}',
    '.r9-muede h2{margin:0;font-size:clamp(22px,6vw,28px);line-height:1.2;color:#f2c14e}',
    '.r9-muede p{margin:0;max-width:30ch;font-size:18px;line-height:1.45;opacity:.9}',
    '.r9-muede .r9-zzz{font-size:28px;letter-spacing:6px;opacity:.75}',
    '.r9-muede .r9-eltern{margin-top:10px;min-height:52px;min-width:min(86vw,320px);border:1px solid #f2c14e66;border-radius:16px;background:#ffffff10;color:#f3ecd8;font:inherit;font-weight:700;font-size:16px;cursor:pointer}',
    '.r9-muede .r9-mehr{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}',
    '.r9-muede .r9-mehr button{min-height:52px;min-width:96px;border:0;border-radius:14px;background:#f2c14e;color:#2a1d00;font:inherit;font-weight:800;font-size:16px;cursor:pointer}',
    '.r9-muede .r9-mehr button.r9-fertig{background:#ffffff18;color:#f3ecd8}',
    '@media (prefers-reduced-motion:no-preference){.r9-muede{animation:r9-nacht 1.6s ease-out}.r9-muede .r9-zzz{animation:r9-zzz 3s ease-in-out infinite}',
    ' @keyframes r9-nacht{from{opacity:0}to{opacity:1}}@keyframes r9-zzz{50%{opacity:.35;transform:translateY(-6px)}}}',
    '.r9-wach{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 64px);transform:translateX(-50%);z-index:60;background:#13265aee;color:#f3ecd8;border:1px solid #f2c14e66;border-radius:999px;padding:8px 16px;font-weight:700;font-size:15px;box-shadow:0 6px 18px #0006;max-width:calc(100vw - 32px);text-align:center}',
    '.r9-wach[hidden]{display:none}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- Eltern-Sachen nur im Elternbereich ---------- */
  // Die alte Sanduhr (Runde 7) stand im Kinder-Blatt. Sie wird durch das Sanfte Zeitlimit im Elternbereich ersetzt.
  (function alteSanduhrWeg(n) {
    var alt = $('r7-sanduhr'), li = null;
    if (alt) { alt.remove(); try { localStorage.setItem('otti.r7.sandEnde', '0'); } catch (e) {} }
    document.querySelectorAll('.r7-was li').forEach(function (x) { if (/Sanduhr/.test(x.textContent)) li = x; });
    if (li) { var ul = li.parentNode; li.remove(); if (ul && !ul.children.length) { var w = ul.closest('.r7-was'); if (w) w.remove(); } }
    if (n < 80) setTimeout(function () { alteSanduhrWeg(n + 1); }, 150);
  })(0);

  /* ---------- Sanftes Zeitlimit ---------- */
  // Zählt nur die Zeit, in der die App offen und sichtbar ist. Gilt pro Tag. Eltern wählen 10, 15, 20 oder 30 Minuten.
  function heute() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function stand() {
    var s = hol('limit', null) || { min: 0, tag: heute(), ms: 0, plus: 0, aus: false };
    if (s.tag !== heute()) { s.tag = heute(); s.ms = 0; s.plus = 0; s.aus = false; }
    return s;
  }
  var S = stand(); leg('limit', S);
  function grenze() { return S.min ? (S.min + S.plus) * 60000 : 0; }
  function rest() { var g = grenze(); return g ? g - S.ms : Infinity; }
  var letzt = Date.now(), gewarnt = false, offen = null;

  function ton(art) { // leise Spieluhr-Töne, nur wenn der Ton an ist
    try {
      var A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      var ac = ton.ac || (ton.ac = new A()); if (ac.state !== 'running') ac.resume();
      var noten = art === 'tschuess' ? [784, 659, 587, 523, 392] : [659, 523];
      noten.forEach(function (f, i) {
        var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.42;
        o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.045, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 1.2);
      });
    } catch (e) {}
  }
  function hinweis(t) {
    var h = $('r9-wach'); if (!h) { h = document.createElement('div'); h.id = 'r9-wach'; h.className = 'r9-wach'; h.setAttribute('role', 'status'); document.body.appendChild(h); }
    h.textContent = t; h.hidden = false; clearTimeout(hinweis.t); hinweis.t = setTimeout(function () { h.hidden = true; }, 6000);
  }
  function halten(b, ms, fn) {
    var t = 0, s = 0, raf = 0;
    b.style.backgroundImage = 'linear-gradient(90deg,#f2c14e66 var(--h,0%),transparent var(--h,0%))';
    function los(e) { e.preventDefault(); s = Date.now(); clearTimeout(t); t = setTimeout(function () { ab(); fn(); }, ms); (function f() { b.style.setProperty('--h', Math.min(100, (Date.now() - s) / ms * 100) + '%'); if (s) raf = requestAnimationFrame(f); })(); }
    function ab() { s = 0; clearTimeout(t); cancelAnimationFrame(raf); b.style.setProperty('--h', '0%'); }
    b.addEventListener('pointerdown', los); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (x) { b.addEventListener(x, ab); });
    b.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !s) los(e); });
    b.addEventListener('keyup', ab); b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  function muede() {
    if (offen) return;
    try { API.allesStill && API.allesStill(); } catch (e) {}
    try { API.gaehnen && API.gaehnen(); } catch (e) {}
    var o = document.createElement('div'); o.className = 'r9-muede'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'r9-muedeT');
    o.innerHTML = '<img alt="Otti gähnt" src="posen/gaehnt.jpg"><h2 id="r9-muedeT">Uaaah … Otti ist müde.</h2>' +
      '<p>Danke fürs Spielen! Ich kuschle mich jetzt in mein Blätterbett. Tschüss, bis morgen!</p><div class="r9-zzz" aria-hidden="true">z z z</div>' +
      '<button type="button" class="r9-eltern">Für Eltern: 3 Sekunden halten</button><div class="r9-mehr" hidden role="group" aria-label="Mehr Zeit">' +
      '<button type="button" data-plus="5">+5 Min.</button><button type="button" data-plus="10">+10 Min.</button><button type="button" class="r9-fertig" data-plus="0">Für heute fertig</button></div>';
    document.body.appendChild(o); offen = o; ton('tschuess');
    var img = o.querySelector('img');
    setTimeout(function () { if (!o.isConnected) return; img.style.opacity = '0'; setTimeout(function () { img.src = 'posen/schlaeft.jpg'; img.alt = 'Otti schläft'; img.style.opacity = '1'; }, ruhig ? 0 : 1200); }, ruhig ? 1500 : 3500);
    var eb = o.querySelector('.r9-eltern'), mehr = o.querySelector('.r9-mehr');
    halten(eb, 3000, function () { eb.hidden = true; mehr.hidden = false; mehr.querySelector('button').focus(); });
    mehr.addEventListener('click', function (e) {
      var b = e.target.closest('[data-plus]'); if (!b) return; var p = +b.getAttribute('data-plus');
      if (p) { S.plus += p; gewarnt = false; leg('limit', S); o.remove(); offen = null; try { API.schlafen && API.schlafen(false); } catch (x) {} hinweis('Otti ist wieder wach. Noch ' + p + ' Minuten.'); }
      else { S.aus = true; leg('limit', S); eb.hidden = true; mehr.hidden = true; o.querySelector('p').textContent = 'Gute Nacht. Morgen spielt Otti wieder mit dir.'; }
    });
    setTimeout(function () { try { eb.focus(); } catch (e) {} }, 60);
  }
  function tick() {
    var jetzt = Date.now(), d = Math.min(5000, Math.max(0, jetzt - letzt)); letzt = jetzt;
    if (S.tag !== heute()) { S = stand(); leg('limit', S); }
    if (!S.min) return;
    if (!offen && document.visibilityState === 'visible') { S.ms += d; if (S.ms % 10000 < d) leg('limit', S); }
    var r = rest();
    if (r <= 120000 && r > 0 && !gewarnt && !offen) { gewarnt = true; try { API.gaehnen && API.gaehnen(); } catch (e) {} ton('warn'); hinweis('Otti wird langsam müde. Noch zwei Minuten.'); }
    if (r <= 0 && !offen) { leg('limit', S); muede(); }
  }
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', function () { letzt = Date.now(); leg('limit', S); });
  window.addEventListener('pagehide', function () { leg('limit', S); });
  setTimeout(tick, 400);

  /* Einstellung im Elternbereich */
  function zeitInfo() {
    var i = $('r9-limitInfo'); if (!i) return;
    if (!S.min) { i.textContent = 'Kein Zeitlimit. Otti spielt, solange ihr wollt.'; return; }
    var r = rest(), m = Math.max(0, Math.ceil(r / 60000));
    i.textContent = S.aus || r <= 0 ? 'Für heute ist die Zeit um. Otti schläft.' : 'Heute noch etwa ' + m + ' Min. Danach gähnt Otti, sagt Tschüss und das Spiel endet.';
  }
  function wahlBauen() {
    var z = $('r9-limitWahl'); if (!z) return; z.innerHTML = '';
    [[0, 'Aus'], [10, '10 Min.'], [15, '15 Min.'], [20, '20 Min.'], [30, '30 Min.']].forEach(function (w) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = w[1];
      b.className = S.min === w[0] ? 'sel' : ''; b.setAttribute('aria-pressed', String(S.min === w[0]));
      b.addEventListener('click', function () { S.min = w[0]; S.plus = 0; S.aus = false; gewarnt = false; leg('limit', S); wahlBauen(); zeitInfo(); });
      z.appendChild(b);
    });
    zeitInfo();
  }
  (function rein(n) {
    var eb = $('ebereich'); if (!eb) { if (n < 40) setTimeout(function () { rein(n + 1); }, 100); return; }
    var karte = eb.querySelector('.karte'), live = eb.querySelector('#okInfo'), vor = live ? live.closest('.gruppe') : null;
    var g = document.createElement('section'); g.className = 'gruppe'; g.id = 'r9-limit';
    g.innerHTML = '<h3><span aria-hidden="true">⏳</span> Sanftes Zeitlimit</h3><p class="leise" style="margin:0 0 8px">Wie lange darf Otti heute spielen? Am Ende gähnt Otti, sagt freundlich Tschüss und das Spiel hört auf. Verlängern geht nur mit 3 Sekunden Halten.</p>' +
      '<div class="zeile" id="r9-limitWahl" role="group" aria-label="Spielzeit pro Tag"></div><p class="leise" id="r9-limitInfo" style="margin-top:8px" aria-live="polite"></p>';
    if (vor) vor.before(g); else if (karte) karte.appendChild(g);
    wahlBauen();
    new MutationObserver(function () { if (!eb.hidden) { wahlBauen(); } }).observe(eb, { attributes: true, attributeFilter: ['hidden'] });
  })(0);

  window.OTTI_LIMIT = { stand: function () { return { min: S.min, ms: S.ms, plus: S.plus, rest: rest() }; }, setze: function (min, msSchon) { S.min = min; S.ms = msSchon || 0; S.plus = 0; S.aus = false; gewarnt = false; leg('limit', S); wahlBauen(); }, muede: muede };
})();
