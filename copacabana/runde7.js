/* Geschenk Lädeli Copacabana · Runde 7 (21.10.2026): Design, Verifizierung, drei neue Helfer. Testladen, nichts wird bestellt.
   1. «Schnellansicht mit ‹Passt dazu›»: Geschenk antippen, gross anschauen, zwei passende Ideen dazu (Vorbild: «Passt dazu» bei Galaxus, Etsy).
      Dazu «Copas Tipp des Tages».
   2. «Zuletzt angesehen»: die letzten vier Geschenke als Reihe über dem Regal (Vorbild: «Zuletzt angesehen» bei Zalando, Galaxus).
   3. «Geschenk-Budget»: Betrag festlegen, der Korb zeigt einen Balken und was noch frei ist (Vorbild: Budget-Balken in Banking-Apps wie Revolut).
   Nutzt aus index.html: WAREN, korb, speichern, korbZeigen (nur über ihre Funktionen). */
window.R7 = {
  kuerzel: 'cc', figur: 'Copa', bild: 'copa/winkt.jpg', bildFroh: 'copa/freut.jpg',
  ort: '.copa-gruss', wo: 'nach',
  himmel: '.szene',
  neuTitel: 'Neu im Lädeli', neuText: 'Copa hat drei Ideen fürs Aussuchen.',
  gold: '#f2b84b',
  css: [
    '.knopf:not(.leise):not(.drin){color:#1b1440!important}',
    '.info h3{overflow-wrap:break-word!important}',
    '.filter button{min-height:44px;display:inline-flex;align-items:center}',
    '.ware .bild{cursor:zoom-in}',
    '.r7-qv-bild{display:grid;place-items:center;height:180px;border-radius:20px;font-size:96px;background:radial-gradient(circle at 50% 40%,rgba(255,217,138,.25),transparent 65%),linear-gradient(160deg,#3b2d78,#2a1f5c);margin-bottom:16px}',
    '.r7-qv-bild img{max-height:100%;max-width:100%;border-radius:16px;object-fit:cover}',
    '.r7-qv-preis{font-size:1.5rem;font-weight:800;color:#ffd98a}',
    '.r7-qv-mark{display:inline-block;font-size:.75rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#1b1440;background:#4fd6c8;border-radius:999px;padding:2px 10px;margin-bottom:8px}',
    '.r7-passt{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.r7-passt button{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-height:96px;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#fdf6ea;font:inherit;text-align:left;cursor:pointer}',
    '.r7-passt .e{font-size:28px}.r7-passt b{font-size:.9375rem;line-height:1.25;overflow-wrap:break-word}.r7-passt small{color:#ffd98a}',
    '.r7-zuletzt{margin:0 0 16px}',
    '.r7-zuletzt h2{font-size:.8125rem;letter-spacing:.06em;text-transform:uppercase;color:#c9bfe6;margin:0 0 8px}',
    '.r7-zuletzt div{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px}',
    '.r7-zuletzt div::-webkit-scrollbar{display:none}',
    '.r7-zuletzt button{flex:none;display:flex;align-items:center;gap:8px;min-height:48px;padding:0 14px 0 8px;border-radius:999px;border:1px solid #3b2d78;background:#2a1f5c;color:#fdf6ea;font:inherit;font-size:.875rem;cursor:pointer;max-width:220px}',
    '.r7-zuletzt button span{font-size:22px}.r7-zuletzt button b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.r7-budget{margin:12px 0;padding:12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid #3b2d78}',
    '.r7-budget .z{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.r7-budget label{font-weight:700;font-size:.875rem;color:#c9bfe6}',
    '.r7-budget input{width:110px;min-height:44px;box-sizing:border-box;border-radius:10px;border:1px solid #3b2d78;background:#1b1440;color:#fdf6ea;font:inherit;padding:0 10px}',
    '.r7-bb{height:10px;border-radius:5px;background:rgba(255,255,255,.1);overflow:hidden;margin:10px 0 6px}',
    '.r7-bb i{display:block;height:100%;width:0;border-radius:5px;background:linear-gradient(90deg,#4fd6c8,#f2b84b);transition:width .4s}',
    '.r7-bb.ueber i{background:#ff7a6b}',
    '.r7-budget small{display:block;color:#c9bfe6;font-size:.8125rem}',
    /* Runde 7c: Copa zeigt die Produkte (Tinko) als «Tipp des Tages» im Startbereich */
    '.r7c-tipp{display:flex;align-items:center;gap:16px;width:100%;box-sizing:border-box;margin:0 0 16px;padding:12px;border-radius:20px;border:1px solid rgba(242,184,75,.45);background:linear-gradient(150deg,#3b2d78,#2a1f5c);color:#fdf6ea;font:inherit;text-align:left;cursor:pointer;box-shadow:0 10px 28px -14px rgba(0,0,0,.7)}',
    '.r7c-tipp img{flex:none;width:96px;height:96px;border-radius:16px;object-fit:cover;object-position:40% 60%}',
    '.r7c-tipp span{min-width:0;display:flex;flex-direction:column;gap:4px}.r7c-tipp small{font-size:.75rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#4fd6c8}.r7c-tipp b{font-size:1.0625rem;line-height:1.3;overflow-wrap:break-word}.r7c-tipp em{font-style:normal;color:#ffd98a;font-size:.875rem}',
    '.r7-qv-tipp{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;object-position:50% 62%;border-radius:20px;margin:0 0 16px}'
  ].join('\n'),
  start: function (R) {
    if (typeof WAREN === 'undefined') return;
    var PASST = { kerze: ['muschel', 'karte'], tuch: ['tasse', 'armband'], tasse: ['schoggi', 'karte'], armband: ['karte', 'box'], schoggi: ['tasse', 'karte'], karte: ['schoggi', 'armband'], muschel: ['kerze', 'armband'], box: ['karte', 'kerze'] };
    function w(id) { return WAREN.filter(function (x) { return x.id === id; })[0]; }
    function preis(n) { return 'CHF ' + Number(n).toFixed(2); }
    function bildHtml(x) { return x.bild ? '<img src="bilder/' + R.esc(x.bild) + '" alt="">' : '<span aria-hidden="true">' + x.em + '</span>'; }
    function passend(id) {
      var l = (PASST[id] || []).map(w).filter(Boolean);
      var x = w(id);
      WAREN.forEach(function (y) { if (l.length < 2 && y.id !== id && y.kat === x.kat && l.indexOf(y) < 0) l.push(y); });
      WAREN.forEach(function (y) { if (l.length < 2 && y.id !== id && l.indexOf(y) < 0) l.push(y); });
      return l.slice(0, 2);
    }
    function inKorb(id) {
      try { korb[id] = (korb[id] || 0) + 1; speichern(); korbZeigen(true); } catch (e) { return; }
      var x = w(id); R.feier((x ? x.name : 'Geschenk') + ' liegt im Korb. Copa freut sich!');
      var b = document.querySelector('#regal .ware[data-r7id="' + id + '"] .knopf'); if (b) b.classList.add('drin');
    }
    function merken(id) { var z = R.hol('zuletzt', []).filter(function (x) { return x !== id; }); z.unshift(id); R.leg('zuletzt', z.slice(0, 4)); zuletzt(); }
    function ansicht(id, titel, tipp) {
      var x = w(id); if (!x) return;
      merken(id);
      var html = (tipp ? '<img class="r7-qv-tipp" src="copa/produkte.jpg" alt="Copa hinter dem Ladentisch mit Kerze, Tuch, Tasse und Armband" width="768" height="432">' : '') + '<div class="r7-qv-bild">' + bildHtml(x) + '</div><span class="r7-qv-mark">' + R.esc(x.kat) + '</span><p style="color:#fdf6ea;font-size:1.0625rem">' + R.esc(x.text) + '</p>' +
        '<div class="r7-reihe" style="align-items:center"><span class="r7-qv-preis" style="flex:0 0 auto">' + preis(x.preis) + '</span><button type="button" class="r7-knopf" data-korb="' + x.id + '">In den Korb</button></div>' +
        '<h3>Passt dazu</h3><div class="r7-passt">' + passend(id).map(function (y) { return '<button type="button" data-qv="' + y.id + '"><span class="e" aria-hidden="true">' + y.em + '</span><b>' + R.esc(y.name) + '</b><small>' + preis(y.preis) + '</small></button>'; }).join('') + '</div>';
      var inh = R.blatt({ titel: titel || x.name, html: html, bild: 'copa/freut.jpg' });
      inh.addEventListener('click', function (e) {
        var k = e.target.closest('[data-korb]'), q = e.target.closest('[data-qv]');
        if (k) { inKorb(k.dataset.korb); k.textContent = 'Im Korb ✓'; }
        if (q) ansicht(q.dataset.qv);
      });
    }
    // Regal: Bild und Name öffnen die Schnellansicht (auch nach jedem Neuzeichnen)
    function regalAuf() {
      var r = document.getElementById('regal'); if (!r) return;
      [].forEach.call(r.querySelectorAll('.ware'), function (el) {
        var h = el.querySelector('h3'), name = h ? h.textContent.trim() : '';
        var x = WAREN.filter(function (y) { return y.name === name; })[0]; if (!x || el.dataset.r7id) return;
        el.dataset.r7id = x.id;
        var b = el.querySelector('.bild');
        if (b) { b.setAttribute('role', 'button'); b.setAttribute('tabindex', '0'); b.setAttribute('aria-label', x.name + ' gross anschauen'); }
      });
    }
    var reg = document.getElementById('regal');
    if (reg) {
      regalAuf(); new MutationObserver(regalAuf).observe(reg, { childList: true });
      reg.addEventListener('click', function (e) { var b = e.target.closest('.bild, h3'); var el = e.target.closest('.ware'); if (b && el && el.dataset.r7id) ansicht(el.dataset.r7id); });
      reg.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('bild')) { e.preventDefault(); var el = e.target.closest('.ware'); if (el && el.dataset.r7id) ansicht(el.dataset.r7id); } });
    }
    // Zuletzt angesehen
    var zl = document.createElement('section'); zl.className = 'r7-zuletzt'; zl.setAttribute('aria-labelledby', 'r7ZlH'); zl.hidden = true;
    if (reg) reg.parentNode.insertBefore(zl, reg);
    function zuletzt() {
      var l = R.hol('zuletzt', []).map(w).filter(Boolean);
      zl.hidden = !l.length;
      zl.innerHTML = '<h2 id="r7ZlH">Zuletzt angesehen</h2><div>' + l.map(function (x) { return '<button type="button" data-qv="' + x.id + '"><span aria-hidden="true">' + x.em + '</span><b>' + R.esc(x.name) + '</b></button>'; }).join('') + '</div>';
    }
    zl.addEventListener('click', function (e) { var q = e.target.closest('[data-qv]'); if (q) ansicht(q.dataset.qv); });
    zuletzt();
    // Budget im Korb
    var blatt = document.getElementById('blatt'), summe = blatt && blatt.querySelector('.summe');
    var bud = document.createElement('div'); bud.className = 'r7-budget';
    bud.innerHTML = '<div class="z"><label for="r7Bud">Mein Budget (CHF)</label><input id="r7Bud" inputmode="decimal" placeholder="z. B. 50" autocomplete="off"></div><div class="r7-bb" aria-hidden="true"><i></i></div><small id="r7BudT" aria-live="polite">Lege ein Budget fest, Copa achtet mit.</small>';
    if (summe) summe.parentNode.insertBefore(bud, summe.nextSibling);
    var bi = bud.querySelector('#r7Bud'); bi.value = R.hol('budget', '') || '';
    function budget() {
      var b = parseFloat(String(bi.value).replace(',', '.')) || 0, t = 0;
      try { Object.keys(korb).forEach(function (id) { var x = w(id); if (x && korb[id] > 0) t += x.preis * korb[id]; }); if (document.getElementById('verpacken').checked && t) t += (typeof VERPACKUNG !== 'undefined' ? VERPACKUNG : 4); } catch (e) {}
      var bar = bud.querySelector('.r7-bb'), txt = bud.querySelector('#r7BudT');
      if (!b) { bar.querySelector('i').style.width = '0'; bar.classList.remove('ueber'); txt.textContent = 'Lege ein Budget fest, Copa achtet mit.'; return; }
      bar.querySelector('i').style.width = Math.min(100, t / b * 100) + '%'; bar.classList.toggle('ueber', t > b);
      txt.textContent = t > b ? preis(t - b) + ' über dem Budget. Vielleicht eine Karte statt der Box?' : t ? 'Noch ' + preis(b - t) + ' frei. Schön ausgesucht!' : 'Budget ' + preis(b) + '. Der Korb ist noch leer.';
    }
    bi.addEventListener('input', function () { R.leg('budget', bi.value); budget(); });
    if (typeof korbZeigen === 'function') { var alt = korbZeigen; window.korbZeigen = function (h) { var r = alt.apply(this, arguments); try { budget(); } catch (e) {} return r; }; }
    var vp = document.getElementById('verpacken'); if (vp) vp.addEventListener('change', budget);
    budget();
    function tagesTipp() { var t = new Date(), n = t.getFullYear() * 400 + t.getMonth() * 31 + t.getDate(); return WAREN[n % WAREN.length]; }
    var S = {
      tipp: function () { var x = tagesTipp(); ansicht(x.id, 'Copas Tipp: ' + x.name, true); },
      zuletzt: function () {
        var l = R.hol('zuletzt', []).map(w).filter(Boolean);
        var inh = R.blatt({ titel: 'Zuletzt angesehen', html: l.length ? '<p>Deine letzten Blicke ins Regal. Antippen und nochmals anschauen.</p><div class="r7-passt">' + l.map(function (y) { return '<button type="button" data-qv="' + y.id + '"><span class="e" aria-hidden="true">' + y.em + '</span><b>' + R.esc(y.name) + '</b><small>' + preis(y.preis) + '</small></button>'; }).join('') + '</div>' : R.leer('Noch nichts angeschaut. Tipp im Regal auf ein Geschenkbild, dann merke ich es mir.', 'copa/winkt.jpg') });
        inh.addEventListener('click', function (e) { var q = e.target.closest('[data-qv]'); if (q) ansicht(q.dataset.qv); });
      },
      budget: function () {
        var inh = R.blatt({ titel: 'Geschenk-Budget', html: '<p>Wie viel möchtest du ausgeben? Copa zeigt im Korb einen Balken und sagt, was noch frei ist.</p><label for="r7Bud2">Budget in CHF</label><input id="r7Bud2" inputmode="decimal" placeholder="z. B. 50" autocomplete="off" value="' + R.esc(bi.value) + '"><div class="r7-reihe"><button type="button" class="r7-knopf voll" data-a="ok">Merken und Korb öffnen</button></div>' });
        inh.querySelector('[data-a=ok]').addEventListener('click', function () {
          bi.value = inh.querySelector('#r7Bud2').value; R.leg('budget', bi.value); budget(); R.zu();
          setTimeout(function () { var k = document.getElementById('korbknopf'); if (k) k.click(); }, 340);
        });
      }
    };
    window.R7.neu.forEach(function (n) { n.auf = S[n.id]; });
    // Startbereich: Tipp des Tages mit Copas Produkte-Bild
    var fi = document.getElementById('filter');
    if (fi) {
      var tt = tagesTipp(), tk = document.createElement('button'); tk.type = 'button'; tk.className = 'r7c-tipp';
      tk.innerHTML = '<img src="copa/produkte.jpg" alt="" width="96" height="96" loading="lazy"><span><small>Copas Tipp des Tages</small><b>' + R.esc(tt.em + ' ' + tt.name) + '</b><em>' + preis(tt.preis) + ' · anschauen</em></span>';
      tk.addEventListener('click', S.tipp);
      fi.parentNode.insertBefore(tk, fi);
    }
  },
  neu: [
    { id: 'tipp', e: '🦜', titel: 'Copas Tipp', text: 'Ein Geschenk des Tages, mit «Passt dazu»' },
    { id: 'zuletzt', e: '👀', titel: 'Zuletzt angesehen', text: 'Die letzten vier Blicke' },
    { id: 'budget', e: '🎯', titel: 'Geschenk-Budget', text: 'Balken im Korb' }
  ]
};

/* ---- Runde 7: gemeinsamer Kern (Design, Tageszeit-Himmel, Haptik, Blatt, Feier, Neu-Leiste) ----
   Einheitlich über alle DR-Lab-Apps: 8er-Raster, Typo-Skala, Karten, Knöpfe, Gold-Fokus.
   Alles nur auf diesem Gerät, keine Dienste, keine Kosten. Testen: ?r7zeit=22 (Stunde). */
(function () {
  'use strict';
  var K = window.R7;
  if (!K || window.R7K) return;
  var d = document, H = d.documentElement;
  var LS = 'r7_' + K.kuerzel + '_';
  function hol(k, def) { try { var v = localStorage.getItem(LS + k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } }
  function leg(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) {} }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function param(n) { var m = location.search.match(new RegExp('[?&]' + n + '=([^&]+)')); return m ? decodeURIComponent(m[1]) : null; }
  var mm = window.matchMedia ? function (q) { return matchMedia(q).matches; } : function () { return false; };
  function ruhig() { return mm('(prefers-reduced-motion: reduce)') || H.classList.contains('r7-ruhig'); }
  function stunde() { var p = param('r7zeit'); return p != null ? +p : new Date().getHours(); }
  function phase() { var h = stunde(); return h < 6 || h >= 21 ? 'nacht' : h < 10 ? 'morgen' : h < 17 ? 'tag' : 'abend'; }
  function heute() { var t = new Date(); return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }

  /* ---------- 1. Design-Grundlage ---------- */
  var gold = K.gold || '#f2c14e';
  var css = [
    ':root{--r7-1:8px;--r7-2:16px;--r7-3:24px;--r7-4:32px;--r7-6:48px;--r7-gold:' + gold + ';--r7-gold-d:#c99a3e;--r7-nacht:#0e1838;--r7-nacht2:#17255a;--r7-nacht3:#22306a;--r7-ink:#f6efe4;--r7-ink2:#cfd6ee;--r7-rund:20px;--r7-rund-s:12px;',
    '--r7-schatten:0 1px 2px rgba(0,0,0,.18),0 12px 32px -12px rgba(0,0,0,.5);--r7-t1:1.75rem;--r7-t2:1.25rem;--r7-t3:1.0625rem;--r7-t4:.9375rem;--r7-t5:.8125rem;--r7-ease:cubic-bezier(.22,.8,.26,1)}',
    // Fokus: goldener Ring, nur bei Tastatur
    ':focus{outline:none}:focus-visible{outline:3px solid var(--r7-gold)!important;outline-offset:3px!important}',
    'a,button,[role=button],summary,label{-webkit-tap-highlight-color:rgba(242,193,78,.18)}',
    'button,[role=button]{touch-action:manipulation}',
    // Weicher Ansichtswechsel
    '.r7-ein{animation:r7Ein .38s var(--r7-ease) both}',
    '@keyframes r7Ein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    // Tageszeit-Himmel
    '.r7-himmel-wirt{position:relative;isolation:isolate}',
    '.r7-himmel{position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden;border-radius:inherit}',
    '.r7-himmel i{position:absolute;display:block;border-radius:50%;background:#fff}',
    '.r7-himmel .r7-licht{position:absolute;width:70%;aspect-ratio:1;border-radius:50%;filter:blur(8px)}',
    '.r7-himmel .r7-schnuppe{position:absolute;top:14%;left:-20%;width:90px;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,#fff);opacity:0;transform:rotate(-18deg)}',
    '.r7-himmel .r7-schnuppe.los{animation:r7Schnuppe 1.6s ease-out 1.2s 1 both}',
    '@keyframes r7Schnuppe{0%{opacity:0;transform:translate(0,0) rotate(-18deg)}15%{opacity:.9}100%{opacity:0;transform:translate(420px,-130px) rotate(-18deg)}}',
    // Blatt (Dialog)
    '.r7-schleier{position:fixed;inset:0;z-index:100050;background:rgba(5,9,26,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;transition:opacity .25s}',
    '.r7-schleier.auf{opacity:1}',
    '.r7-blatt{position:fixed;left:0;right:0;bottom:0;z-index:100051;max-height:88vh;max-height:88dvh;overflow:auto;overscroll-behavior:contain;background:linear-gradient(180deg,var(--r7-nacht2),var(--r7-nacht));color:var(--r7-ink);',
    'border-radius:24px 24px 0 0;box-shadow:0 -12px 40px rgba(0,0,0,.45);border-top:1px solid rgba(242,193,78,.35);padding:var(--r7-2) var(--r7-2) calc(var(--r7-3) + env(safe-area-inset-bottom,0px));transform:translateY(102%);transition:transform .32s var(--r7-ease);font-family:inherit;line-height:1.5;text-align:left}',
    '.r7-blatt.auf{transform:none}',
    '@media (min-width:640px){.r7-blatt{left:50%;right:auto;width:560px;margin-left:-280px;bottom:var(--r7-3);border-radius:24px;border:1px solid rgba(242,193,78,.35)}}',
    '.r7-griff{display:block;width:40px;height:5px;border-radius:3px;background:rgba(255,255,255,.25);margin:0 auto var(--r7-2)}',
    '.r7-kopf{display:flex;align-items:center;gap:12px;margin-bottom:var(--r7-2)}',
    '.r7-kopf img{width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--r7-gold);flex:none}',
    '.r7-kopf h2{flex:1;min-width:0;margin:0;font-size:var(--r7-t2);line-height:1.25;color:var(--r7-ink);font-weight:700}',
    '.r7-zu{flex:none;min-width:44px;min-height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:var(--r7-ink);font-size:20px;line-height:1;cursor:pointer}',
    '.r7-blatt p{margin:0 0 var(--r7-2);color:var(--r7-ink2);font-size:var(--r7-t4)}',
    '.r7-blatt h3{margin:var(--r7-3) 0 var(--r7-1);font-size:var(--r7-t3);color:var(--r7-ink)}',
    '.r7-blatt label{display:block;margin:var(--r7-2) 0 var(--r7-1);font-size:var(--r7-t5);font-weight:700;color:var(--r7-ink2);letter-spacing:.02em}',
    '.r7-blatt input:not([type=checkbox]):not([type=radio]):not([type=range]),.r7-blatt select,.r7-blatt textarea{box-sizing:border-box;width:100%;min-height:48px;padding:10px 14px;border-radius:var(--r7-rund-s);border:1px solid rgba(255,255,255,.22);background:rgba(4,8,24,.55);color:var(--r7-ink);font:inherit;font-size:16px}',
    '.r7-blatt input[type=range]{width:100%;min-height:44px;accent-color:var(--r7-gold)}',
    '.r7-knopf{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 var(--r7-3);border-radius:999px;border:0;background:var(--r7-gold);color:#1a1f3a;font:inherit;font-weight:800;font-size:var(--r7-t4);cursor:pointer;text-decoration:none;box-shadow:0 6px 18px -8px rgba(242,193,78,.8);transition:transform .12s var(--r7-ease),filter .12s}',
    '.r7-knopf:active{transform:scale(.97);filter:brightness(.95)}',
    '.r7-knopf.leise{background:rgba(255,255,255,.08);color:var(--r7-ink);border:1px solid rgba(255,255,255,.22);box-shadow:none}',
    '.r7-knopf.voll{display:flex;width:100%}',
    '.r7-reihe{display:flex;flex-wrap:wrap;gap:var(--r7-1);margin:var(--r7-2) 0}',
    '.r7-reihe>*{flex:1 1 140px}',
    '.r7-karte{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:var(--r7-2);margin:0 0 var(--r7-1)}',
    '.r7-zahl{font-size:var(--r7-t1);font-weight:800;color:var(--r7-gold);font-variant-numeric:tabular-nums;line-height:1.1}',
    '.r7-klein{font-size:var(--r7-t5);color:var(--r7-ink2)}',
    '.r7-leer{display:flex;flex-direction:column;align-items:center;text-align:center;gap:var(--r7-1);padding:var(--r7-3) var(--r7-2);color:var(--r7-ink2)}',
    '.r7-leer img{width:88px;height:88px;border-radius:50%;object-fit:cover;border:2px solid rgba(242,193,78,.6);box-shadow:0 0 0 6px rgba(242,193,78,.08)}',
    // Neu-Leiste
    '.r7-neu{margin:var(--r7-3) 0;padding:var(--r7-2);border-radius:var(--r7-rund);background:linear-gradient(160deg,#17255a,#0e1838);border:1px solid rgba(242,193,78,.35);box-shadow:var(--r7-schatten);color:var(--r7-ink);text-align:left}',
    '.r7-neu-kopf{display:flex;align-items:center;gap:12px;margin-bottom:var(--r7-2)}',
    '.r7-neu-kopf img{width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--r7-gold);flex:none}',
    '.r7-neu-kopf h2{margin:0;font-size:var(--r7-t3);line-height:1.3;color:var(--r7-ink);font-weight:800}',
    '.r7-neu-kopf small{display:block;color:var(--r7-ink2);font-size:var(--r7-t5);font-weight:500}',
    '.r7-neu-gitter{display:grid;grid-template-columns:1fr 1fr;gap:var(--r7-1)}',
    '.r7-neu-k{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-height:96px;padding:12px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:var(--r7-ink);font:inherit;text-align:left;cursor:pointer;transition:transform .14s var(--r7-ease),border-color .2s,background .2s}',
    '.r7-neu-k:hover{border-color:rgba(242,193,78,.6);background:rgba(242,193,78,.08)}',
    '.r7-neu-k:active{transform:scale(.97)}',
    '.r7-neu-k .e{font-size:24px;line-height:1}',
    '.r7-neu-k b{font-size:var(--r7-t4);line-height:1.25;overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto}',
    '.r7-neu-k small{font-size:var(--r7-t5);color:var(--r7-ink2);line-height:1.35;overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto}',
    '@media (max-width:359px){.r7-neu-gitter{grid-template-columns:1fr}.r7-neu-k{min-height:72px}}',
    '.r7-neu-k .r7-punkt{position:absolute;top:10px;right:10px;width:9px;height:9px;border-radius:50%;background:var(--r7-gold);box-shadow:0 0 0 3px rgba(242,193,78,.25)}',
    '.r7-neu-fuss{display:flex;flex-wrap:wrap;gap:var(--r7-1);margin-top:var(--r7-2)}',
    '.r7-schalter{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:transparent;color:var(--r7-ink2);font:inherit;font-size:var(--r7-t5);cursor:pointer}',
    '.r7-schalter[aria-pressed=true]{border-color:var(--r7-gold);color:var(--r7-gold)}',
    // Feier
    '.r7-feier{position:fixed;left:0;right:0;margin:0 auto;width:max-content;bottom:calc(96px + env(safe-area-inset-bottom,0px));z-index:100060;display:flex;align-items:center;gap:12px;max-width:min(92vw,420px);padding:10px 18px 10px 10px;border-radius:999px;background:#17255a;color:var(--r7-ink);border:1px solid rgba(242,193,78,.55);box-shadow:var(--r7-schatten);transform:translateY(20px);opacity:0;transition:transform .3s var(--r7-ease),opacity .3s;pointer-events:none;font-size:var(--r7-t4);line-height:1.35}',
    '.r7-feier.auf{transform:none;opacity:1}',
    '.r7-feier img{width:40px;height:40px;border-radius:50%;object-fit:cover;flex:none;border:2px solid var(--r7-gold)}',
    '.r7-funke{position:fixed;z-index:100061;width:8px;height:8px;border-radius:50%;background:var(--r7-gold);pointer-events:none;animation:r7Funke .9s ease-out forwards}',
    '@keyframes r7Funke{from{opacity:1;transform:translate(0,0) scale(1)}to{opacity:0;transform:translate(var(--x),var(--y)) scale(.3)}}',
    'html.r7-ruhig *,html.r7-ruhig *::before,html.r7-ruhig *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}',
    '@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}',
    'html.r7-blatt-offen .nova-btn,html.r7-blatt-offen .nova-pille,html.r7-blatt-offen .nova-panel,html.r7-blatt-offen #fbBtn,html.r7-blatt-offen .fb-btn,html.r7-blatt-offen .puppe-fest{visibility:hidden!important}',
    '.r7-nur-sr{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important}',
    '.r6-ein:not([disabled]){color:#1a1f3a!important;opacity:1!important}',
    '.r6-ein[disabled]{background:transparent!important;border:1px solid rgba(242,193,78,.6)!important;color:#f6efe4!important}',
    '.r6-nf input{flex:1 1 140px!important;min-width:120px!important}',
    '.sp-kopf button{min-width:44px!important;min-height:44px!important}',
    '.r7-blatt input[type=range]{margin:0}',
    K.css || ''
  ].join('\n');
  var st = d.createElement('style'); st.id = 'r7-stil'; st.textContent = css; d.head.appendChild(st);
  if (hol('ruhig', false)) H.classList.add('r7-ruhig');

  /* ---------- 2. Haptik (kurz, abschaltbar) ---------- */
  function summ(ms) {
    if (K.haptik === false || hol('haptik', true) === false || ruhig()) return;
    try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {}
  }
  d.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('button, [role=button], a[href], summary');
    if (!t || (K.keineHaptik && t.closest(K.keineHaptik))) return;
    summ(t.classList.contains('r7-knopf') ? 12 : 6);
  }, true);

  /* ---------- 3. Tageszeit-Himmel mit leichtem Parallax ---------- */
  function himmel() {
    var ziele = K.himmel ? d.querySelectorAll(K.himmel) : [];
    var ph = phase();
    [].forEach.call(ziele, function (w, n) {
      if (w.querySelector(':scope > .r7-himmel')) return;
      var h = d.createElement('div'); h.className = 'r7-himmel'; h.setAttribute('aria-hidden', 'true'); h.dataset.phase = ph;
      var html = '';
      if (ph === 'nacht') {
        // ruhige Sterne (fest, kein Dauerflackern), einmal pro Besuch eine Sternschnuppe
        var s = 7 + n * 13;
        for (var i = 0; i < 26; i++) {
          s = (s * 9301 + 49297) % 233280; var x = s / 233280 * 100;
          s = (s * 9301 + 49297) % 233280; var y = s / 233280 * 70;
          s = (s * 9301 + 49297) % 233280; var g = 1 + Math.round(s / 233280 * 2);
          html += '<i style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%;width:' + g + 'px;height:' + g + 'px;opacity:' + (0.35 + (i % 5) / 10).toFixed(2) + '"></i>';
        }
        html += '<span class="r7-schnuppe"></span>';
      } else if (ph === 'morgen') {
        html = '<span class="r7-licht" style="left:-25%;top:-35%;background:radial-gradient(circle,rgba(255,196,140,.32),transparent 65%)"></span>';
      } else if (ph === 'tag') {
        html = '<span class="r7-licht" style="right:-30%;top:-40%;background:radial-gradient(circle,rgba(255,236,170,.26),transparent 65%)"></span>';
      } else {
        html = '<span class="r7-licht" style="left:15%;top:-45%;background:radial-gradient(circle,rgba(255,140,120,.26),rgba(160,110,220,.12) 45%,transparent 70%)"></span>';
      }
      h.innerHTML = html;
      w.classList.add('r7-himmel-wirt'); w.insertBefore(h, w.firstChild);
      if (ph === 'nacht' && !ruhig() && !sessionStorage.getItem(LS + 'schnuppe')) {
        try { sessionStorage.setItem(LS + 'schnuppe', '1'); } catch (e) {}
        var sp = h.querySelector('.r7-schnuppe'); if (sp) sp.classList.add('los');
      }
    });
    if (!ruhig() && ziele.length) {
      var laeuft = false;
      addEventListener('scroll', function () {
        if (laeuft) return; laeuft = true;
        requestAnimationFrame(function () {
          laeuft = false;
          var y = Math.min(scrollY, 900) * 0.12;
          [].forEach.call(d.querySelectorAll('.r7-himmel'), function (h) { h.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)'; });
        });
      }, { passive: true });
    }
  }

  /* ---------- 4. Weiche Ansichtswechsel ---------- */
  function uebergaenge() {
    if (!K.ansichten || !window.MutationObserver) return;
    var mo = new MutationObserver(function (l) {
      l.forEach(function (m) {
        var el = m.target;
        var sichtbarJetzt = !el.hidden && !el.classList.contains('hide') && !el.classList.contains('hidden');
        var warVersteckt = m.attributeName === 'hidden' ? m.oldValue !== null : /\b(hide|hidden)\b/.test(m.oldValue || '');
        if (sichtbarJetzt && warVersteckt && !ruhig()) {
          el.classList.remove('r7-ein'); void el.offsetWidth; el.classList.add('r7-ein');
          setTimeout(function () { el.classList.remove('r7-ein'); }, 450);
        }
      });
    });
    [].forEach.call(d.querySelectorAll(K.ansichten), function (el) { mo.observe(el, { attributes: true, attributeFilter: ['class', 'hidden'], attributeOldValue: true }); });
  }

  /* ---------- 5. Blatt (zugänglicher Dialog) ---------- */
  var offen = null;
  function blatt(o) {
    zu(true);
    var vorher = d.activeElement;
    var sch = d.createElement('div'); sch.className = 'r7-schleier';
    var b = d.createElement('div'); b.className = 'r7-blatt'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-modal', 'true');
    var id = 'r7t' + Date.now(); b.setAttribute('aria-labelledby', id);
    b.innerHTML = '<span class="r7-griff" aria-hidden="true"></span><div class="r7-kopf">' + (o.bild === false ? '' : '<img src="' + esc(o.bild || K.bild) + '" alt="" width="48" height="48">') +
      '<h2 id="' + id + '">' + esc(o.titel) + '</h2><button type="button" class="r7-zu" aria-label="Schliessen">✕</button></div><div class="r7-inhalt"></div>';
    var inh = b.querySelector('.r7-inhalt');
    if (typeof o.html === 'string') inh.innerHTML = o.html; else if (o.html) inh.appendChild(o.html);
    d.body.appendChild(sch); d.body.appendChild(b);
    var altOverflow = d.body.style.overflow; d.body.style.overflow = 'hidden'; H.classList.add('r7-blatt-offen');
    requestAnimationFrame(function () { sch.classList.add('auf'); b.classList.add('auf'); });
    function fokusierbar() { return [].filter.call(b.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'), function (x) { return !x.disabled && x.offsetParent !== null; }); }
    function taste(e) {
      if (e.key === 'Escape') { e.preventDefault(); zu(); }
      else if (e.key === 'Tab') {
        var f = fokusierbar(); if (!f.length) return;
        if (!b.contains(d.activeElement)) { e.preventDefault(); f[0].focus(); return; }
        if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    d.addEventListener('keydown', taste, true);
    sch.addEventListener('click', function () { zu(); });
    b.querySelector('.r7-zu').addEventListener('click', function () { zu(); });
    offen = { b: b, sch: sch, vorher: vorher, ov: altOverflow, nachher: o.zu, taste: taste };
    setTimeout(function () { var z = b.querySelector('.r7-zu'); try { z.focus({ preventScroll: true }); } catch (e) { z.focus(); } }, 60);
    if (o.auf) try { o.auf(inh, b); } catch (e) { console.warn(e); }
    return inh;
  }
  function zu(sofort) {
    if (!offen) return;
    var o = offen; offen = null; d.removeEventListener('keydown', o.taste, true);
    d.body.style.overflow = o.ov || ''; H.classList.remove('r7-blatt-offen');
    o.b.classList.remove('auf'); o.sch.classList.remove('auf');
    var weg = function () { o.b.remove(); o.sch.remove(); };
    if (sofort || ruhig()) weg(); else setTimeout(weg, 320);
    if (o.vorher && o.vorher.focus) try { o.vorher.focus({ preventScroll: true }); } catch (e) {}
    if (o.nachher) try { o.nachher(); } catch (e) {}
  }

  /* ---------- 6. Sanfte Feier ---------- */
  var feierT;
  function feier(text, funken) {
    var f = d.querySelector('.r7-feier');
    if (!f) { f = d.createElement('div'); f.className = 'r7-feier'; f.setAttribute('role', 'status'); f.setAttribute('aria-live', 'polite'); d.body.appendChild(f); }
    f.innerHTML = '<img src="' + esc(K.bildFroh || K.bild) + '" alt=""><span>' + esc(text) + '</span>';
    requestAnimationFrame(function () { f.classList.add('auf'); });
    clearTimeout(feierT); feierT = setTimeout(function () { f.classList.remove('auf'); }, 2800);
    summ([10, 40, 10]);
    if (funken !== false && !ruhig()) {
      var r = f.getBoundingClientRect(), cx = r.left + 30, cy = r.top + 20;
      for (var i = 0; i < 8; i++) {
        var p = d.createElement('i'); p.className = 'r7-funke';
        var w = Math.PI * 2 * i / 8;
        p.style.left = cx + 'px'; p.style.top = cy + 'px';
        p.style.setProperty('--x', Math.round(Math.cos(w) * 46) + 'px'); p.style.setProperty('--y', Math.round(Math.sin(w) * 46 - 20) + 'px');
        d.body.appendChild(p); setTimeout(function (x) { return function () { x.remove(); }; }(p), 950);
      }
    }
  }
  function leer(text, bild) { return '<div class="r7-leer"><img src="' + esc(bild || K.bild) + '" alt="" width="88" height="88" loading="lazy"><span>' + esc(text) + '</span></div>'; }

  /* ---------- 7. Neu-Leiste ---------- */
  function neuLeiste() {
    if (!K.neu || !K.neu.length || !K.ort) return;
    var ort = d.querySelector(K.ort); if (!ort) return;
    var gesehen = hol('gesehen', {});
    var s = d.createElement('section'); s.className = 'r7-neu'; s.id = 'r7Neu'; s.setAttribute('aria-labelledby', 'r7NeuH');
    s.innerHTML = '<div class="r7-neu-kopf"><img src="' + esc(K.bild) + '" alt="" width="44" height="44" loading="lazy"><div><h2 id="r7NeuH">' + esc(K.neuTitel || 'Neu für dich') + '</h2><small>' + esc(K.neuText || 'Antippen und ausprobieren.') + '</small></div></div>' +
      '<div class="r7-neu-gitter">' + K.neu.map(function (f) {
        return '<button type="button" class="r7-neu-k" data-r7f="' + esc(f.id) + '">' + (gesehen[f.id] ? '' : '<span class="r7-punkt" aria-hidden="true"></span>') +
          '<span class="e" aria-hidden="true">' + f.e + '</span><b>' + esc(f.titel) + '</b><small>' + esc(f.text) + '</small>' + (gesehen[f.id] ? '' : '<span class="r7-nur-sr">, neu</span>') + '</button>';
      }).join('') + '</div>' +
      '<div class="r7-neu-fuss">' + (K.haptik === false ? '' : '<button type="button" class="r7-schalter" id="r7Haptik" aria-pressed="' + (hol('haptik', true) !== false) + '">📳 Sanftes Vibrieren</button>') +
      '<button type="button" class="r7-schalter" id="r7Ruhig" aria-pressed="' + !!hol('ruhig', false) + '">🌙 Weniger Bewegung</button></div>';
    if (K.wo === 'vor') ort.parentNode.insertBefore(s, ort); else if (K.wo === 'in') ort.appendChild(s); else ort.parentNode.insertBefore(s, ort.nextSibling);
    s.addEventListener('click', function (e) {
      var k = e.target.closest('[data-r7f]'); if (!k) return;
      var f = K.neu.filter(function (x) { return x.id === k.dataset.r7f; })[0]; if (!f) return;
      gesehen[f.id] = 1; leg('gesehen', gesehen);
      var p = k.querySelector('.r7-punkt'); if (p) p.remove(); var sr = k.querySelector('.r7-nur-sr'); if (sr) sr.remove();
      f.auf();
    });
    var hb = s.querySelector('#r7Haptik');
    if (hb) hb.addEventListener('click', function () { var an = hol('haptik', true) === false; leg('haptik', an); hb.setAttribute('aria-pressed', an); if (an) summ(14); });
    var rb = s.querySelector('#r7Ruhig');
    rb.addEventListener('click', function () { var an = !hol('ruhig', false); leg('ruhig', an); rb.setAttribute('aria-pressed', an); H.classList.toggle('r7-ruhig', an); });
  }

  d.addEventListener('submit', function (e) {
    var f = e.target; if (!f || f.id !== 'r6Name') return;
    var i = f.querySelector('input'); if (!i || i.value.trim()) return;
    i.setAttribute('aria-invalid', 'true'); i.placeholder = 'Bitte einen Vornamen eintragen'; try { i.focus(); } catch (x) {}
  }, true);
  window.R7K = { hol: hol, leg: leg, esc: esc, blatt: blatt, zu: zu, feier: feier, leer: leer, summ: summ, phase: phase, stunde: stunde, heute: heute, param: param, ruhig: ruhig };
  function start() {
    try { himmel(); } catch (e) { console.warn('r7 himmel', e); }
    try { uebergaenge(); } catch (e) { console.warn('r7 uebergang', e); }
    try { neuLeiste(); } catch (e) { console.warn('r7 neu', e); }
    if (K.start) try { K.start(window.R7K); } catch (e) { console.warn('r7 start', e); }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();
})();
