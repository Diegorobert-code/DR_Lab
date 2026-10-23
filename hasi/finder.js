/* Hasis Laden · Finder-Fragen (23.10.2026)
   Erweitert den bestehenden Werkzeug-Finder aus runde8.js (3 Fragen) statt ihn zu verdoppeln:
   - Einstieg «Was brauche ich?» direkt auf dem Startbildschirm (im Kopf, unter dem Untertitel)
   - 5 Tipp-Fragen statt 3: Was willst du machen? Für wen? Wie oft? Budget? Erfahrung?
   - Ergebnis: 1 bis 3 Werkzeuge aus Hasis bestehendem Regal (window.HasiLaden.W), je mit «Weil du …»
   - Zurück, Neu beginnen, «Ansehen» springt zum Werkzeug im Laden, «Merken» nutzt die bestehende Merkliste
   Der Knopf «Finder starten» der Runde-8-Karte öffnet jetzt diese Fassung im gleichen Blatt.
   Vorbild: Produkt-Finder grosser Shops. Hasi spricht nie: nur Pose, Schild und Geste.
   Alles lokal, kein Server, keine Anfragen nach aussen. */
(function () {
  'use strict';
  if (window.HasiFinder) return;
  var $ = function (id) { return document.getElementById(id); };
  var ruhig = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; }
  function H() { return window.HasiLaden || null; }
  function geste(pose, schild, text, ms) { var h = H(); if (h && h.hasi) try { h.hasi(pose, schild, text, ms || 2600); } catch (e) {} }
  function kasten() { try { return JSON.parse(localStorage.getItem('hasi.kasten')) || []; } catch (e) { return []; } }
  function kastenLeg(l) { try { localStorage.setItem('hasi.kasten', JSON.stringify(l.slice(0, 20))); } catch (e) {} }

  /* Fragen. Jede Antwort: [id, Zeichen, Text, Grund-Satzteil, {werkzeug: punkte}] */
  var FRAGEN = [
    { id: 'was', t: 'Was willst du machen?', a: [
      ['alltag', '🗓', 'Termine und Alltag ordnen', 'deinen Alltag ordnen willst', { erinnerung: 4, 'wb-liste': 2, granny: 1 }],
      ['schreiben', '💬', 'Schreiben, ohne zu tippen', 'lieber redest als tippst', { transkript: 5 }],
      ['kopf', '🧠', 'Den Kopf sortieren', 'Ordnung im Kopf suchst', { jackie: 5 }],
      ['familie', '👪', 'Etwas für die Familie', 'etwas für die Familie suchst', { mondschein: 3, granny: 3, waefwaef: 3 }],
      ['lernen', '📚', 'Lernen und üben', 'etwas lernen oder üben willst', { 'wb-quiz': 4, milulu: 3 }],
      ['rechnen', '🧮', 'Rechnen und planen', 'rechnen und planen willst', { 'wb-rechner': 4, tradeping: 2 }],
      ['team', '🏪', 'Für Laden, Team oder Verein', 'etwas für ein Team suchst', { humanspark: 4, 'wb-liste': 2, 'wb-quiz': 1 }],
      ['bauen', '💡', 'Eine eigene kleine App', 'etwas ganz Eigenes willst', { builder: 5, 'wb-liste': 1 }]
    ] },
    { id: 'wer', t: 'Für wen ist es?', a: [
      ['ich', '🙋', 'Nur für mich', 'es für dich selbst brauchst', { jackie: 1, transkript: 1, tradeping: 1, milulu: 1 }],
      ['familie', '👪', 'Für meine Familie', 'an deine Familie denkst', { granny: 2, waefwaef: 2, mondschein: 1 }],
      ['kinder', '🧒', 'Für Kinder', 'an Kinder denkst', { mondschein: 3, milulu: 1, 'wb-quiz': 1 }],
      ['kunden', '🤝', 'Für Kundschaft oder Klienten', 'es für deine Kundschaft brauchst', { erinnerung: 2, 'wb-rechner': 2, builder: 1 }],
      ['team', '👥', 'Für Team, Kurs oder Verein', 'es für eine Gruppe brauchst', { humanspark: 2, 'wb-liste': 2, 'wb-quiz': 1 }]
    ] },
    { id: 'oft', t: 'Wie oft brauchst du es?', a: [
      ['taeglich', '☀️', 'Jeden Tag', 'es jeden Tag brauchst', { erinnerung: 1, transkript: 1, jackie: 1, mondschein: 1, granny: 1, waefwaef: 1, 'wb-liste': 1, tradeping: 1 }],
      ['manchmal', '🌤', 'Ab und zu', 'es ab und zu brauchst', { 'wb-rechner': 1, 'wb-quiz': 1, milulu: 1, humanspark: 1 }],
      ['einmal', '📌', 'Einmal, für ein Projekt', 'es für ein Projekt brauchst', { builder: 2, 'wb-quiz': 1 }]
    ] },
    { id: 'geld', t: 'Was darf es kosten?', a: [
      ['gratis', '🆓', 'Gratis, bitte', 'es gratis willst', { _gratis: 2, _andere: -2 }],
      ['abo', '🪙', 'Ein kleines Abo ist ok', 'ein kleines Abo ok findest', { _abo: 1, _gratis: 1 }],
      ['einmal', '🧾', 'Lieber einmal zahlen', 'lieber einmal zahlst', { _einmal: 1, _gratis: 1 }],
      ['egal', '🤷', 'Hauptsache, es passt', '', {}]
    ] },
    { id: 'erfahrung', t: 'Wie viel Erfahrung hast du mit Apps?', a: [
      ['wenig', '🌱', 'Wenig, es soll einfach sein', 'es einfach haben willst', { granny: 2, erinnerung: 1, transkript: 1, jackie: 1, builder: 1 }],
      ['etwas', '🙂', 'Etwas', '', {}],
      ['viel', '🔧', 'Viel, ich bastle gern', 'gern selbst bastelst', { 'wb-liste': 2, 'wb-rechner': 2, 'wb-quiz': 2 }]
    ] }
  ];
  var GESTEN = [
    ['lesen', 'Hasi hält die Lupe hoch und schaut dich fragend an.'],
    ['nicken', 'Hasi zeigt auf dich, dann auf die Familie, dann auf den Laden.'],
    ['schild', 'Hasi zeigt auf den Kalender an der Wand.'],
    ['waage', 'Hasi legt eine Münze auf die goldene Waage.'],
    ['repariere', 'Hasi hält einen kleinen und einen grossen Schraubenschlüssel hoch.']
  ];

  function preisArt(p) {
    p = String(p || '').toLowerCase();
    if (/gratis/.test(p)) return 'gratis';
    if (/pro monat|abo/.test(p)) return 'abo';
    if (/einmal|chf/.test(p)) return 'einmal';
    return 'anfrage';
  }
  function antwort(f, a) { return f.a.filter(function (o) { return o[0] === a; })[0]; }

  /* Punkte zählen; nur Werkzeuge, die zur ersten Antwort passen. Rest und Budget ordnen. */
  function auswerten(antworten) {
    var h = H(); if (!h || !h.W) return [];
    var regal = h.W.filter(function (w) { return w.r !== 'offen' || w.lic; });
    var punkte = {}, gruende = {};
    regal.forEach(function (w) { punkte[w.id] = 0; gruende[w.id] = []; });
    FRAGEN.forEach(function (f) {
      var opt = antwort(f, antworten[f.id]); if (!opt) return;
      var m = opt[4];
      regal.forEach(function (w) {
        var p = m[w.id] || 0, art = preisArt(w.p);
        if (m['_' + art]) p += m['_' + art]; else if (m._andere) p += m._andere;
        if (!p) return;
        punkte[w.id] += p;
        if (p > 0 && opt[3]) gruende[w.id].push({ p: p, s: opt[3], f: f.id });
      });
    });
    var haupt = antwort(FRAGEN[0], antworten.was);
    var liste = regal.filter(function (w) { return punkte[w.id] > 0 && (!haupt || (haupt[4][w.id] || 0) > 0); })
      .sort(function (a, b) { return punkte[b.id] - punkte[a.id]; });
    if (!liste.length) return [];
    var top = punkte[liste[0].id];
    liste = liste.filter(function (w, i) { return i === 0 || punkte[w.id] >= Math.max(3, top * 0.5); }).slice(0, 3);
    return liste.map(function (w) {
      var g = gruende[w.id].slice().sort(function (a, b) { return b.p - a.p; });
      var erst = g.filter(function (x) { return x.f === 'was'; })[0] || g[0];
      var dann = g.filter(function (x) { return x !== erst; })[0];
      return { w: w, grund: erst ? 'Weil du ' + erst.s + (dann ? ' und ' + dann.s : '') + '.' : 'Passt gut zu deinen Antworten.' };
    });
  }

  var css = [
    '.fi-start{display:flex;margin:14px 0 0}',
    '.fi-start .btn{font-size:17px;padding:12px 22px;min-height:52px}',
    '@media (max-width:420px){.fi-start .btn{width:100%}.fi-mehr{display:none}}',
    '.fi-weil{margin:10px 0 0;font-size:16px;line-height:1.45}',
    '.fi-unten{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-top:16px}',
    /* Offenes Blatt: auch den Lernen-Knopf (unten links) ausblenden, wie Nova (runde7.js) */
    'body.r7-blatt-offen [data-drlab-lernen]{display:none!important}',
    '.r8-f-k[aria-pressed=true]{border-color:var(--r7-gold,#0c7a67);box-shadow:inset 0 0 0 1px var(--r7-gold,#0c7a67)}'
  ].join('\n');

  function oeffnen() {
    var R = window.R7, Z = window.R8 || {};
    if (!R || !R.blatt) return;
    var a = {}, schritt = 0;
    var B = R.blatt('Was brauche ich?', '<div class="r8-f fi-f"></div>').el, box = B.querySelector('.fi-f');
    B.id = 'finderBlatt';
    function vt(fn) { if (Z.vt) Z.vt(fn); else fn(); }
    function fokus() { var q = box.querySelector('.r8-f-h'); try { q.focus({ preventScroll: true }); } catch (e) {} B.scrollTop = 0; }
    function frage() {
      var f = FRAGEN[schritt], n = FRAGEN.length;
      box.innerHTML = '<p class="r8-f-nr fi-nr" aria-live="polite">Frage ' + (schritt + 1) + ' von ' + n + '</p><div class="r8-f-balken" aria-hidden="true"><i style="width:' + ((schritt + 1) / n * 100) + '%"></i></div>' +
        '<h3 class="r8-f-h" tabindex="-1">' + esc(f.t) + '</h3><div class="r8-f-opt fi-opt" role="group" aria-label="' + esc(f.t) + '"></div>' +
        '<div class="fi-unten">' + (schritt ? '<button type="button" class="r7-btn fi-zurueck">‹ Zurück</button>' : '<span></span>') +
        (schritt ? '<button type="button" class="r7-btn fi-neu">↺ Neu beginnen</button>' : '') + '</div>';
      f.a.forEach(function (o) {
        var b = el('<button type="button" class="r8-f-k" aria-pressed="' + (a[f.id] === o[0]) + '" data-a="' + o[0] + '"><span aria-hidden="true">' + o[1] + '</span>' + esc(o[2]) + '</button>');
        b.onclick = function () { a[f.id] = o[0]; vt(function () { if (schritt < n - 1) { schritt++; frage(); } else ergebnis(); }); };
        box.querySelector('.fi-opt').appendChild(b);
      });
      var z = box.querySelector('.fi-zurueck'); if (z) z.onclick = function () { vt(function () { schritt--; frage(); }); };
      var nb = box.querySelector('.fi-neu'); if (nb) nb.onclick = neu;
      geste(GESTEN[schritt][0], (schritt + 1) + ' / ' + n, GESTEN[schritt][1], 2400);
      fokus();
    }
    function neu() { a = {}; schritt = 0; vt(frage); }
    function ergebnis() {
      var L = auswerten(a);
      box.innerHTML = '<p class="r8-f-nr fi-nr" aria-live="polite">Hasis Wahl für dich</p><div class="r8-f-balken" aria-hidden="true"><i style="width:100%"></i></div>' +
        '<h3 class="r8-f-h" tabindex="-1">' + (L.length === 1 ? 'Das passt zu dir' : L.length ? 'Diese ' + L.length + ' passen zu dir' : 'Im Regal liegt dafür noch nichts') + '</h3>' +
        (L.length ? '<ol class="r8-f-erg fi-erg"></ol>' : '<p class="r7-p">Auf der Werkbank oder per Bestellung baut Hasi es dir.</p>') +
        '<div class="fi-unten"><button type="button" class="r7-btn fi-zurueck">‹ Zurück</button><button type="button" class="r7-btn fi-neu">↺ Neu beginnen</button></div>';
      L.forEach(function (r) {
        var x = r.w, drin = kasten().indexOf(x.id) >= 0;
        var li = el('<li class="r8-f-e fi-tipp" style="--k:' + esc(x.k) + '"><div class="r8-ding-kopf"><span class="r8-ding-e" aria-hidden="true">' + x.e + '</span><span class="r8-ding-tx"><b>' + esc(x.n) + '</b><small>' + esc(x.p) + '</small></span></div>' +
          '<p class="fi-weil">' + esc(r.grund) + '</p>' +
          '<div class="r8-ding-k"><button type="button" class="r7-btn voll" data-a="an">' + (x.vorlage ? 'Selbst bauen' : 'Im Laden ansehen') + '</button><button type="button" class="r7-btn' + (drin ? ' voll' : '') + '" data-a="merk" aria-pressed="' + drin + '">' + (drin ? '♥ Gemerkt' : '♡ Merken') + '</button></div></li>');
        li.querySelector('[data-a=an]').onclick = function () { R.zu(); var h = H(); if (h && h.zeige) h.zeige(x.id); };
        li.querySelector('[data-a=merk]').onclick = function () {
          var k = kasten(), i = k.indexOf(x.id); if (i >= 0) k.splice(i, 1); else k.unshift(x.id); kastenLeg(k); merkZahl();
          var an = i < 0; this.classList.toggle('voll', an); this.setAttribute('aria-pressed', String(an)); this.textContent = an ? '♥ Gemerkt' : '♡ Merken';
          if (an && Z.toast) Z.toast(x.e + ' ' + x.n + ' gemerkt');
        };
        box.querySelector('.fi-erg').appendChild(li);
      });
      box.querySelector('.fi-zurueck').onclick = function () { vt(function () { schritt = FRAGEN.length - 1; frage(); }); };
      box.querySelector('.fi-neu').onclick = neu;
      if (L.length) {
        geste('passt', 'Gefunden!', 'Hasi öffnet mit dem goldenen Schlüssel die Vitrine und legt dir ' + (L.length === 1 ? 'einen Würfel' : L.length + ' Würfel') + ' hin.', 3000);
        var h = H(); if (h && h.klang) try { h.klang('pling'); } catch (e) {}
        try { R.leg('finder', (R.hol('finder', 0) || 0) + 1); if (Z.licht) Z.licht('finder'); } catch (e) {}
      } else geste('nein', 'Werkbank?', 'Hasi kratzt sich am Ohr und zeigt dann auf die Werkbank.', 3000);
      fokus();
    }
    frage();
  }

  function merkZahl() { var s = document.querySelector('.r8-finder-k .r8-merk-n'); if (s) { var n = kasten().length; s.textContent = n ? '(' + n + ')' : ''; } }

  var versuche = 0;
  function start() {
    if ($('fiStart')) return;
    if ((!window.R7 || !document.querySelector('.r8-finder-k')) && versuche++ < 20) { setTimeout(start, 100); return; }
    var st = document.createElement('style'); st.id = 'fi-stil'; st.textContent = css; document.head.appendChild(st);
    /* 1) Einstieg auf dem Startbildschirm */
    var knopf = el('<div class="fi-start"><button class="btn an" id="fiStart" type="button" aria-haspopup="dialog">🧭 Was brauche ich?<span class="fi-mehr">· 5 kurze Fragen</span></button></div>');
    knopf.querySelector('button').addEventListener('click', oeffnen);
    var kopfSub = document.querySelector('.kopf .sub'), zeile = document.querySelector('.wrap > .zeile');
    if (kopfSub) kopfSub.after(knopf); else if (zeile) zeile.after(knopf); else document.body.prepend(knopf);
    /* 2) Bestehende Finder-Karte aus Runde 8 übernimmt die neue Fassung */
    var fk = document.querySelector('.r8-finder-k');
    if (fk) {
      var los = fk.querySelector('.r8-finder-los'); if (los) los.onclick = oeffnen;
      var p = fk.querySelector('.r7-p'); if (p) p.textContent = 'Fünf kurze Tipp-Fragen, dann stellt Hasi dir 1 bis 3 passende Werkzeuge hin, jedes mit einem kurzen Grund.';
    }
  }

  window.HasiFinder = { oeffnen: oeffnen, auswerten: auswerten, FRAGEN: FRAGEN };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 120); }); else setTimeout(start, 120);
})();
