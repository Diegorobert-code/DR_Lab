/* Coin Maker · Runde 7 (21.10.2026): Design, Verifizierung, vier neue Helfer. Coins bleiben Punkte ohne Geldwert.
   1. «Abzeichen-Album»: zwölf Messing-Abzeichen für Meilensteine (Vorbild: Abzeichen in Duolingo, Auszeichnungen in Apple Fitness).
   2. «Ideen-Brett»: jede Idee wandert von «Idee» über «In Arbeit» zu «Umgesetzt» (Vorbild: Trello-Brett).
   3. «Ideen-Aufgabe der Woche»: ein Thema pro Woche, Fortschritt 0/3, Thema mit einem Tipp in den Automaten (Vorbild: Wochen-Quests in Duolingo, Strava-Challenges).
   4. «Ideen-Karte als Bild»: eine Idee mit Coins als Karte zum Teilen (Vorbild: Story-Karten in Instagram).
   Liest nur «coinmaker.v1» (Kassenbuch), schreibt eigene Daten unter r7_cm_. */
window.R7 = {
  kuerzel: 'cm', figur: 'Coin Maker', bild: 'posen/winken.jpg', bildFroh: 'posen/freude.jpg',
  ort: '#result', wo: 'nach',
  himmel: '#buehne',
  neuTitel: 'Neu in der Werkstatt', neuText: 'Drei Werkzeuge für deine Ideen. Punkte, kein Geld.',
  css: [
    '#pull,#wiegen{background:#c4362f!important}',
    '.kv span:nth-child(even){white-space:nowrap}',
    'html.r6-gross .teil-reihe{grid-template-columns:1fr!important;justify-items:center}html.r6-gross .teil-reihe .kv{width:100%}',
    '@media (max-width:360px){.teil-reihe{grid-template-columns:1fr!important;justify-items:center}.teil-reihe .kv{width:100%}}',
    '.del{min-height:44px;padding:0 12px!important}',
    '.zv-stern,.buy{min-height:44px!important}',
    '#fbBtn,.fb-btn{min-height:44px!important;min-width:44px!important}',
    '.regler input[type=range],input#umsatz,input#werbung{min-height:44px}',
    '.ledger .t p{white-space:normal!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '.r7-abz{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}',
    '.r7-abz div{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;padding:12px 6px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);font-size:.75rem;line-height:1.3;color:#cfd6ee}',
    '.r7-abz .m{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font-size:26px;background:radial-gradient(circle at 35% 30%,#4a4060,#2a2440);filter:grayscale(1);opacity:.45}',
    '.r7-abz .an .m{filter:none;opacity:1;background:radial-gradient(circle at 35% 30%,#ffe7a6,#f2c14e 55%,#a8792a);box-shadow:0 0 0 3px rgba(242,193,78,.25),0 8px 18px -8px rgba(242,193,78,.8)}',
    '.r7-abz .an b{color:#f6efe4}',
    '.r7-spalten{display:flex;flex-direction:column;gap:16px}',
    '.r7-spalte h3{display:flex;justify-content:space-between;margin:0 0 8px!important}',
    '.r7-idee{padding:12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);margin-bottom:8px}',
    '.r7-idee p{margin:0 0 8px!important;color:#f6efe4!important;font-size:.9375rem!important;overflow-wrap:anywhere}',
    '.r7-idee .k{display:flex;flex-wrap:wrap;gap:6px;align-items:center}',
    '.r7-idee .c{margin-right:auto;color:#f2c14e;font-weight:800;font-size:.875rem}',
    '.r7-mini{min-height:44px;min-width:44px;padding:0 12px;border-radius:12px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#f6efe4;font:inherit;font-size:.875rem;cursor:pointer}',
    '.r7-thema{padding:20px;border-radius:20px;background:radial-gradient(100% 80% at 80% 0%,rgba(242,193,78,.25),transparent 60%),linear-gradient(160deg,#2a2a5e,#17255a);border:1px solid rgba(242,193,78,.4)}',
    '.r7-thema b{display:block;font-size:1.25rem;line-height:1.3;color:#f6efe4;margin:4px 0 8px}',
    '.r7-fort{display:flex;gap:8px;margin:12px 0}.r7-fort i{flex:1;height:10px;border-radius:5px;background:rgba(255,255,255,.12)}.r7-fort i.an{background:#f2c14e}'
  ].join('\n'),
  start: function (R) {
    function st() { try { var s = JSON.parse(localStorage.getItem('coinmaker.v1') || 'null'); return s && Array.isArray(s.items) ? s : { items: [] }; } catch (e) { return { items: [] }; } }
    function echte() { return st().items.filter(function (i) { return !i.ex; }); }
    function woche(day) { var t = new Date((day || R.heute()) + 'T12:00'); t.setDate(t.getDate() - ((t.getDay() + 6) % 7)); return t.toISOString().slice(0, 10); }
    ['say', 'formula'].forEach(function (id) { var e = document.getElementById(id); if (e && !e.hasAttribute('tabindex')) e.setAttribute('tabindex', '0'); });
    var THEMEN = [
      ['Weniger Papier', 'Wie könnte eine App helfen, dass weniger Zettel herumliegen?'],
      ['Gute Nacht', 'Was hilft Kindern oder Eltern abends beim Runterfahren?'],
      ['Kundschaft zurück', 'Wie kommt jemand, der lange nicht da war, wieder vorbei?'],
      ['Warten macht Spass', 'Was könnte man im Wartezimmer oder in der Schlange Schönes tun?'],
      ['Ältere Menschen', 'Was wäre für Granny am Handy einfacher?'],
      ['Bewegung im Alltag', 'Wie bewegt man sich mehr, ohne es zu merken?'],
      ['Danke sagen', 'Wie könnte ein Geschäft schöner Danke sagen?'],
      ['Ideen aus Fehlern', 'Was ist dir diese Woche schiefgegangen, und was hätte geholfen?']
    ];
    function thema() { var w = woche(), n = Math.floor(new Date(w + 'T12:00').getTime() / (7 * 864e5)); return THEMEN[((n % THEMEN.length) + THEMEN.length) % THEMEN.length]; }
    function karteBild(it, fertig) {
      var c = document.createElement('canvas'); c.width = 1080; c.height = 1350; var g = c.getContext('2d');
      var gr = g.createLinearGradient(0, 0, 0, 1350); gr.addColorStop(0, '#2a2a5e'); gr.addColorStop(1, '#0e1838'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1350);
      g.strokeStyle = '#f2c14e'; g.lineWidth = 6; g.strokeRect(40, 40, 1000, 1270);
      g.textAlign = 'center'; g.fillStyle = '#f2c14e'; g.font = '800 54px sans-serif'; g.fillText('Meine Idee', 540, 470);
      g.fillStyle = '#f6efe4'; g.font = '400 44px sans-serif';
      var w = String(it.text || '').split(/\s+/), z = '', y = 560, n = 0;
      w.forEach(function (x) { var t = z ? z + ' ' + x : x; if (g.measureText(t).width > 880 && z) { if (n < 9) g.fillText(z, 540, y); y += 62; n++; z = x; } else z = t; });
      if (n < 9) g.fillText(z, 540, y);
      g.fillStyle = '#f2c14e'; g.font = '800 96px sans-serif'; g.fillText((it.coins || 0) + ' 🪙', 540, 1190);
      g.fillStyle = '#cfd6ee'; g.font = '400 30px sans-serif'; g.fillText('The Coin Maker · Punkte ohne Geldwert', 540, 1260);
      var im = new Image(); im.onload = function () { g.save(); g.beginPath(); g.arc(540, 250, 150, 0, Math.PI * 2); g.clip(); g.drawImage(im, 390, 100, 300, 300); g.restore(); g.lineWidth = 8; g.beginPath(); g.arc(540, 250, 150, 0, Math.PI * 2); g.stroke(); fertig(c); };
      im.onerror = function () { fertig(c); }; im.src = 'posen/freude.jpg';
    }
    var S = {
      abzeichen: function () {
        var it = echte(), ideen = it.filter(function (i) { return i.type === 'idee'; }), tage = {};
        it.forEach(function (i) { if (i.day) tage[i.day] = 1; });
        var serie = 0, t = new Date(); while (tage[t.toISOString().slice(0, 10)] && serie < 400) { serie++; t.setDate(t.getDate() - 1); }
        var lang = 0, lauf = 0; Object.keys(tage).sort().forEach(function (k, n, a) { var v = n && (new Date(k) - new Date(a[n - 1])) / 864e5 === 1; lauf = v ? lauf + 1 : 1; lang = Math.max(lang, lauf); });
        var coins = it.reduce(function (a, i) { return a + (i.coins > 0 ? i.coins : 0); }, 0);
        var arten = {}; it.forEach(function (i) { arten[i.type] = 1; });
        var brett = R.hol('brett', {}), fertig = Object.keys(brett).filter(function (k) { return brett[k] === 2; }).length;
        var A = [
          ['💡', 'Erste Idee', ideen.length >= 1], ['🔟', '10 Ideen', ideen.length >= 10], ['🪙', '100 Coins', coins >= 100], ['💰', '500 Coins', coins >= 500],
          ['🔥', '3 Tage am Stück', lang >= 3], ['📅', '7 Tage am Stück', lang >= 7], ['🎨', 'Alle drei Arten', arten.idee && arten.daten && arten.rueck],
          ['🔍', 'Feine Idee (Qualität hoch)', it.some(function (i) { return i.q >= 1.4; })], ['🛠️', 'Erste umgesetzt', fertig >= 1],
          ['🏆', 'Wochen-Aufgabe geschafft', !!R.hol('aufgabeGeschafft', '')], ['🛍️', 'Im Münzladen gewesen', it.some(function (i) { return i.type === 'laden'; })], ['🎬', 'Film geschaut', (function () { try { return (JSON.parse(localStorage.getItem('coinmaker.lernen') || '{}').film || 0) > 0; } catch (e) { return false; } })()]
        ];
        var an = A.filter(function (a) { return a[2]; }).length;
        var alt = R.hol('abzZahl', 0); R.leg('abzZahl', an);
        R.blatt({ titel: 'Abzeichen-Album', bild: 'posen/lupe.jpg', html: '<p>' + an + ' von ' + A.length + ' Abzeichen poliert. Jedes zeigt einen Schritt, kein Wettrennen.' + (serie ? ' Aktuelle Serie: ' + serie + ' ' + (serie === 1 ? 'Tag' : 'Tage') + '.' : '') + '</p><div class="r7-abz">' + A.map(function (a) { return '<div class="' + (a[2] ? 'an' : '') + '"><span class="m" aria-hidden="true">' + a[0] + '</span><b>' + R.esc(a[1]) + '</b><span class="r7-nur-sr">' + (a[2] ? 'erreicht' : 'noch nicht') + '</span></div>'; }).join('') + '</div>' + (it.length ? '' : R.leer('Noch leer. Leg eine Idee in den Automaten, dann glänzt das erste Abzeichen.', 'posen/lupe.jpg')) });
        if (an > alt) setTimeout(function () { R.feier('Neues Abzeichen poliert! ' + an + ' von ' + A.length + '.'); }, 450);
      },
      brett: function () {
        var brett = R.hol('brett', {});
        var SP = ['💡 Idee', '🛠️ In Arbeit', '✅ Umgesetzt'];
        var inh = R.blatt({ titel: 'Ideen-Brett', bild: 'posen/hebel.jpg', html: '<p>Jede Idee aus dem Automaten liegt hier. Schieb sie weiter, wenn etwas passiert. Nur auf diesem Gerät.</p><div class="r7-spalten" id="r7Sp"></div><div id="r7KBild"></div>' });
        function zeig() {
          var ideen = echte().filter(function (i) { return i.type === 'idee' && i.text; });
          var box = inh.querySelector('#r7Sp');
          if (!ideen.length) { box.innerHTML = R.leer('Noch keine eigene Idee. Das Brett ist leer und wartet: Idee in den Automaten, Hebel ziehen.', 'posen/leer.jpg') /* Runde 7c: Tinkos «leer» */; return; }
          box.innerHTML = SP.map(function (titel, s) {
            var l = ideen.filter(function (i) { return (brett[i.id] || 0) === s; });
            return '<section class="r7-spalte" aria-label="' + titel + '"><h3><span>' + titel + '</span><span class="r7-klein">' + l.length + '</span></h3>' + (l.length ? l.map(function (i) {
              return '<div class="r7-idee"><p>' + R.esc(i.text) + '</p><div class="k"><span class="c">' + i.coins + ' Coins</span>' +
                (s > 0 ? '<button type="button" class="r7-mini" data-z="' + i.id + '" data-s="' + (s - 1) + '" aria-label="Zurück nach ' + SP[s - 1] + '">←</button>' : '') +
                (s < 2 ? '<button type="button" class="r7-mini" data-z="' + i.id + '" data-s="' + (s + 1) + '">' + (s === 0 ? 'Anfangen →' : 'Fertig ✓') + '</button>' : '') +
                '<button type="button" class="r7-mini" data-bild="' + i.id + '" aria-label="Als Bild teilen">🖼️</button></div></div>';
            }).join('') : '<p class="r7-klein">Noch leer.</p>') + '</section>';
          }).join('');
        }
        zeig();
        inh.addEventListener('click', function (e) {
          var z = e.target.closest('[data-z]'), b = e.target.closest('[data-bild]');
          if (z) { var v = brett[z.dataset.z] || 0; brett[z.dataset.z] = +z.dataset.s; R.leg('brett', brett); zeig(); if (+z.dataset.s === 2 && v !== 2) R.feier('Umgesetzt! So wird aus einer Idee etwas Echtes.'); }
          if (b) {
            var it = echte().filter(function (i) { return i.id === b.dataset.bild; })[0]; if (!it) return;
            karteBild(it, function (c) {
              var o = inh.querySelector('#r7KBild'); var u = c.toDataURL('image/jpeg', 0.9);
              o.innerHTML = '<h3>Deine Ideen-Karte</h3><p class="r7-klein">Bild lange drücken, dann sichern oder teilen.</p><img alt="Ideen-Karte" style="width:100%;border-radius:16px" src="' + u + '">';
              o.scrollIntoView({ behavior: R.ruhig() ? 'auto' : 'smooth', block: 'start' });
            });
          }
        });
      },
      aufgabe: function () {
        var th = thema(), w = woche();
        var n = echte().filter(function (i) { return i.type === 'idee' && i.day && woche(i.day) === w; }).length;
        var ziel = 3, fertig = n >= ziel;
        if (fertig && R.hol('aufgabeGeschafft', '') !== w) { R.leg('aufgabeGeschafft', w); setTimeout(function () { R.feier('Wochen-Aufgabe geschafft! Abzeichen glänzt.'); }, 450); }
        var inh = R.blatt({ titel: 'Ideen-Aufgabe der Woche', bild: 'posen/lupe.jpg', html: '<div class="r7-thema"><span class="r7-klein">Thema dieser Woche</span><b>' + R.esc(th[0]) + '</b><span>' + R.esc(th[1]) + '</span><div class="r7-fort" role="img" aria-label="' + Math.min(n, ziel) + ' von ' + ziel + ' Ideen">' + [0, 1, 2].map(function (k) { return '<i class="' + (k < n ? 'an' : '') + '"></i>'; }).join('') + '</div><span class="r7-klein">' + Math.min(n, ziel) + ' von ' + ziel + ' Ideen diese Woche' + (fertig ? ' · geschafft ✓' : '') + '</span></div>' +
          '<div class="r7-reihe"><button type="button" class="r7-knopf voll" data-a="los">Thema in den Automaten</button></div><p class="r7-klein">Jeden Montag ein neues Thema. Jede Idee zählt, auch zu einem anderen Thema.</p>' });
        inh.querySelector('[data-a=los]').addEventListener('click', function () {
          R.zu();
          var t = document.getElementById('t-idee'); if (t) t.click();
          var x = document.getElementById('txt');
          if (x) { x.value = th[0] + ': '; x.dispatchEvent(new Event('input', { bubbles: true })); setTimeout(function () { x.scrollIntoView({ behavior: R.ruhig() ? 'auto' : 'smooth', block: 'center' }); try { x.focus({ preventScroll: true }); x.setSelectionRange(x.value.length, x.value.length); } catch (e) {} }, 340); }
        });
      }
    };
    window.R7.neu.forEach(function (n) { n.auf = S[n.id]; });
  },
  neu: [
    { id: 'abzeichen', e: '🏅', titel: 'Abzeichen-Album', text: '12 Messing-Abzeichen' },
    { id: 'brett', e: '🗂️', titel: 'Ideen-Brett', text: 'Idee → In Arbeit → Umgesetzt, als Bild teilen' },
    { id: 'aufgabe', e: '🎯', titel: 'Aufgabe der Woche', text: 'Ein Thema, drei Ideen' }
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
