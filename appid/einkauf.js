/* Food and Flow – Einkaufsliste aus Rezepten (23.10.2026)
   Vorbild: Paprika, Plan to Eat. In jedem Rezept «Auf die Einkaufsliste» (mit der Portionenzahl aus dem Kochmodus),
   gleiche Zutaten werden zusammengezählt (gleiche Einheit), sortiert nach Ladenbereich, abhaken, «Erledigte entfernen»,
   eigene Einträge, als Text teilen oder kopieren. Auch der Wochenplan kann seine Zutaten hierher schicken.
   Alles bleibt auf dem Gerät (localStorage), funktioniert offline. */
(function () {
  'use strict';
  if (window.FFEinkauf) return;
  var KEY = 'foodflow-einkauf-v1';
  var SEK = ['Gemüse & Früchte', 'Milchprodukte', 'Brot', 'Vorrat', 'Gewürze', 'Tiefkühl', 'Sonstiges'];
  var SEK_E = ['🥦', '🧀', '🥖', '🥫', '🧂', '❄️', '🛍️'];
  /* Reihenfolge der Prüfung: spezifisch zuerst (z.B. «Tomatensauce» ist Vorrat, nicht Gemüse) */
  var REGELN = [
    [5, /tiefk|(^|\s)tk[\s-]|glace|gefror/],
    [4, /salz|pfeffer|curry|paprikapulver|zimt|gewürz|muskat|kurkuma|oregano|thymian|rosmarin|chili|kreuzkümmel|vanille/],
    [3, /sauce|suppe|bouillon|pasta|spaghetti|nudel|(^|\s)reis|risotto|linsen|kichererbsen|bohnen|haferflocken|müesli|nüsse|nuss|mandel|honig|(^|\s)öl|olivenöl|essig|mehl|zucker|konserve|couscous|quinoa|polenta|senf|konfi|kakao|kaffee|tee(\s|$)/],
    [2, /brot|zopf|gipfeli|brötchen|toast|knäcke|tortilla|wrap|semmel|weggli/],
    [1, /skyr|milch|käse|joghurt|jogurt|quark|butter|rahm|mozzarella|feta|ricotta|(^|\s)(ei|eier)(\s|$)|mascarpone/],
    [0, /gemüse|frucht|früchte|beeren|apfel|äpfel|birne|banane|tomat|broccoli|brokkoli|spinat|kartoffel|härdöpfel|rüebli|karotte|salat|zwiebel|knoblauch|kürbis|gurke|peperoni|zitrone|orange|lauch|pilz|zucchet|kohl|fenchel|sellerie|randen|avocado|ingwer|kräuter|petersilie|basilikum|schnittlauch|trauben|kiwi|beere|mango/]
  ];
  function sektion(name) {
    var n = ' ' + String(name || '').toLowerCase() + ' ';
    for (var i = 0; i < REGELN.length; i++) if (REGELN[i][1].test(n.trim()) || REGELN[i][1].test(n)) return REGELN[i][0];
    return 6;
  }

  /* ---------- Speicher ---------- */
  function hol() {
    try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && Array.isArray(o.items)) return o; } catch (e) {}
    return { items: [] };
  }
  var D = hol();
  function leg() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} }

  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; }
  function meldung(t, o) {
    try { if (window.R8 && window.R8.toast) return window.R8.toast(t, o); } catch (e) {}
    try { if (typeof toast === 'function') toast(t); } catch (e) {}
  }

  /* ---------- Zutaten lesen: «170 g Skyr», «2 Eier», «1,5 dl Milch», «Salz» ---------- */
  function lies(t) {
    t = String(t || '').trim(); if (!t) return null;
    var m = t.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|dl|cl|l|EL|TL|Stk\.?|Stück|Bund|Pck\.?|Dose|Dosen)?\s+(.+)$/i);
    if (!m) return { n: t, menge: null, u: '' };
    var z = parseFloat(m[1].replace(',', '.')), u = (m[2] || '').replace(/\.$/, '');
    var ul = u.toLowerCase();
    if (ul === 'kg') { z *= 1000; u = 'g'; } else if (ul === 'g') u = 'g';
    else if (ul === 'l') { z *= 1000; u = 'ml'; } else if (ul === 'dl') { z *= 100; u = 'ml'; } else if (ul === 'cl') { z *= 10; u = 'ml'; } else if (ul === 'ml') u = 'ml';
    else if (ul === 'stk' || ul === 'stück') u = '';
    else if (ul === 'el') u = 'EL'; else if (ul === 'tl') u = 'TL';
    return { n: m[3].trim(), menge: z, u: u };
  }
  function schluessel(n, u) { return String(n).toLowerCase().replace(/\s+/g, ' ').trim() + '|' + (u || ''); }
  function zahl(x) { return (Math.round(x * 10) / 10).toLocaleString('de-CH'); }
  function mengeText(it) {
    if (it.menge == null) return '';
    var x = it.menge;
    if (it.u === 'g' || it.u === 'ml') {
      if (x >= 1000) return zahl(Math.round(x / 100) / 10) + (it.u === 'g' ? ' kg' : ' l');
      if (it.u === 'ml' && x >= 100 && x % 100 === 0) return zahl(x / 100) + ' dl';
      return (x >= 50 ? Math.round(x / 5) * 5 : Math.round(x)) + ' ' + it.u;
    }
    if (!it.u) { x = Math.round(x * 2) / 2; return zahl(x); }
    return zahl(x) + ' ' + it.u;
  }

  /* Eine Zutat hinzufügen: gleiche Zutat + gleiche Einheit wird zusammengezählt */
  function dazu(z, von, sek) {
    var k = schluessel(z.n, z.u), alt = null;
    for (var i = 0; i < D.items.length; i++) if (D.items[i].k === k) { alt = D.items[i]; break; }
    if (alt) {
      if (alt.ok) { alt.ok = false; alt.menge = z.menge; alt.von = []; }
      else if (z.menge != null) alt.menge = (alt.menge || 0) + z.menge;
      if (von && alt.von.indexOf(von) < 0) alt.von.push(von);
      return alt;
    }
    var neu = { k: k, n: z.n, menge: z.menge, u: z.u, sek: sek == null ? sektion(z.n) : sek, ok: false, von: von ? [von] : [], t: Date.now() };
    D.items.push(neu); return neu;
  }
  function rezeptDazu(it, port) {
    port = Math.max(1, +port || 1);
    String(it.ing || '').split(',').forEach(function (t) {
      var z = lies(t); if (!z) return;
      if (z.menge != null) z.menge *= port;
      dazu(z, it.t);
    });
    leg();
  }
  function offenZahl() { return D.items.filter(function (x) { return !x.ok; }).length; }

  /* ---------- Aussehen ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '.ek-box{margin-top:14px;padding:12px 14px;border-radius:18px;background:var(--acc-xl,#eef4f0);border:1px solid var(--line,#e6e2d9)}',
    '.ek-port{display:flex;align-items:center;gap:8px;font-size:15px;color:var(--ink2,#33413a)}',
    '.ek-port>span{flex:1;min-width:0}',
    '.ek-port button{min-width:44px;min-height:44px;border-radius:999px;border:1px solid #c9c3b6;background:#fff;color:#1f2a25;font-size:20px;font-weight:700}',
    '.ek-port button:disabled{opacity:.4}',
    '.ek-port output{min-width:86px;text-align:center;font-weight:700;white-space:nowrap}',
    '.ek-box .btn{margin-top:10px}',
    '.ek-kopf{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap}',
    '.ek-sek{margin-top:16px}',
    '.ek-sek h3{font-family:var(--sans,system-ui);font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#b5401c;font-weight:700;margin:0 0 2px}',
    '.ek-li{display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #e6e2d9;font-size:16px;min-height:48px;cursor:pointer}',
    '.ek-li:last-child{border-bottom:0}',
    '.ek-li input{flex:none;width:22px;height:22px;accent-color:#c2461f}',
    '.ek-li .ek-t{flex:1;min-width:0;overflow-wrap:anywhere}',
    '.ek-li .ek-m{font-weight:700;margin-right:4px}',
    '.ek-li small{display:block;font-size:12.5px;color:#6b766f}',
    '.ek-li.ok .ek-t{text-decoration:line-through;opacity:.55}',
    '.ek-neu{display:flex;gap:8px;margin-top:14px}',
    '.ek-neu .inp{flex:1;min-width:0}',
    '.ek-neu button{flex:none;min-width:48px;min-height:48px;border-radius:14px;background:var(--acc,#2f6a4f);color:#fff;font-size:22px;font-weight:700}',
    '.ek-leer{text-align:center;color:var(--muted,#6b766f);padding:18px 4px 6px;font-size:15px}',
    '.ek-reihe{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}',
    '.ek-reihe button{flex:1 1 140px;min-height:48px;border-radius:14px;border:1px solid var(--line,#e6e2d9);background:#faf8f3;font-size:15px;font-weight:600;color:#1f2a25}',
    '.ek-reihe button.haupt{background:var(--acc,#2f6a4f);border-color:transparent;color:#fff}',
    '.ek-reihe button:disabled{opacity:.45}',
    '.tile.ek-tile.breit{grid-column:1/-1}',
    '.tile.ek-tile{min-height:0;background:linear-gradient(140deg,#e9f1e4,#fffdf9)!important}',
    '.ek-zahl{display:inline-block;margin-left:6px;min-width:22px;padding:1px 7px;border-radius:99px;background:#c2461f;color:#fff;font-size:12.5px;font-weight:700;text-align:center;vertical-align:2px}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- Die Liste ---------- */
  function text() {
    var z = ['Einkaufsliste Food and Flow'];
    SEK.forEach(function (s, i) {
      var L = D.items.filter(function (x) { return !x.ok && x.sek === i; });
      if (!L.length) return;
      z.push('', s + ':');
      L.forEach(function (x) { var m = mengeText(x); z.push('– ' + (m ? m + ' ' : '') + x.n); });
    });
    return z.join('\n');
  }
  function teilen() {
    var t = text();
    if (!offenZahl()) { meldung('Die Liste ist leer.'); return; }
    if (navigator.share) { navigator.share({ title: 'Einkaufsliste', text: t }).catch(function () {}); return; }
    kopieren(t);
  }
  function kopieren(t) {
    function alt() {
      try {
        var a = document.createElement('textarea'); a.value = t; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = '0';
        document.body.appendChild(a); a.select(); var ok = document.execCommand('copy'); a.remove();
        meldung(ok ? 'Liste kopiert' : 'Kopieren ging nicht');
      } catch (e) { meldung('Kopieren ging nicht'); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { meldung('Liste kopiert'); }, alt);
    else alt();
  }

  function listeHtml() {
    if (!D.items.length) return '<p class="ek-leer">Noch leer. Öffne ein Rezept und tippe auf «Auf die Einkaufsliste», oder schreib unten etwas dazu.</p>';
    var h = '';
    SEK.forEach(function (s, i) {
      var L = D.items.filter(function (x) { return x.sek === i; });
      if (!L.length) return;
      L.sort(function (a, b) { return (a.ok - b.ok) || a.n.localeCompare(b.n, 'de'); });
      h += '<section class="ek-sek" aria-label="' + esc(s) + '"><h3><span aria-hidden="true">' + SEK_E[i] + '</span> ' + esc(s) + '</h3>' +
        L.map(function (x) {
          var idx = D.items.indexOf(x), m = mengeText(x);
          return '<label class="ek-li' + (x.ok ? ' ok' : '') + '"><input type="checkbox" data-ek-i="' + idx + '"' + (x.ok ? ' checked' : '') + '>' +
            '<span class="ek-t">' + (m ? '<span class="ek-m">' + esc(m) + '</span>' : '') + esc(x.n) +
            (x.von && x.von.length ? '<small>für ' + esc(x.von.join(', ')) + '</small>' : '') + '</span></label>';
        }).join('') + '</section>';
    });
    return h;
  }

  function oeffnen() {
    if (typeof openS2 !== 'function') return;
    openS2('<div class="ek-kopf"><h2 style="font-size:22px">🛒 Einkaufsliste</h2><span class="small" id="ekStand"></span></div>' +
      '<p class="small" style="margin:4px 0 0">Nach Ladenbereich sortiert. Gleiche Zutaten zählt Flo zusammen.</p>' +
      '<div id="ekListe"></div>' +
      '<form class="ek-neu" id="ekForm" autocomplete="off"><label for="ekNeu" class="sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Eigenen Eintrag hinzufügen</label>' +
      '<input class="inp" id="ekNeu" placeholder="Eigenes dazu, z.B. 2 Bananen" enterkeyhint="done"><button type="submit" aria-label="Hinzufügen">+</button></form>' +
      '<div class="ek-reihe"><button type="button" class="haupt" id="ekTeilen">Teilen oder kopieren</button><button type="button" id="ekWeg">Erledigte entfernen</button><button type="button" id="ekLeeren">Alles leeren</button></div>' +
      '<p class="small" style="margin-top:12px">Mengen sind Schätzungen. Die Liste bleibt auf deinem Gerät und funktioniert auch offline.</p>');
    zeichne();
    var s2 = document.getElementById('s2');
    s2.querySelector('#ekListe').addEventListener('change', function (e) {
      var c = e.target; if (!c || c.dataset.ekI == null) return;
      var x = D.items[+c.dataset.ekI]; if (!x) return;
      x.ok = c.checked; leg(); c.parentElement.classList.toggle('ok', c.checked); stand();
    });
    s2.querySelector('#ekForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = document.getElementById('ekNeu'), v = f.value.trim(); if (!v) return;
      v.split(/[,;\n]/).forEach(function (t) { var z = lies(t); if (z) dazu(z, ''); });
      leg(); f.value = ''; zeichne(); f.focus();
    });
    s2.querySelector('#ekTeilen').onclick = teilen;
    s2.querySelector('#ekWeg').onclick = function () {
      var vorher = D.items.slice(), n = D.items.filter(function (x) { return x.ok; }).length;
      if (!n) { meldung('Noch nichts abgehakt.'); return; }
      D.items = D.items.filter(function (x) { return !x.ok; }); leg(); zeichne();
      meldung(n + (n === 1 ? ' Eintrag' : ' Einträge') + ' entfernt', { undo: function () { D.items = vorher; leg(); zeichne(); } });
    };
    s2.querySelector('#ekLeeren').onclick = function () {
      if (!D.items.length) return;
      var vorher = D.items.slice(); D.items = []; leg(); zeichne();
      meldung('Liste geleert', { undo: function () { D.items = vorher; leg(); zeichne(); } });
    };
  }
  function stand() {
    var s = document.getElementById('ekStand'); if (s) { var n = offenZahl(); s.textContent = D.items.length ? (n ? n + ' offen' : 'Alles erledigt ✓') : ''; }
    var w = document.getElementById('ekWeg'); if (w) w.disabled = !D.items.some(function (x) { return x.ok; });
    kachel();
  }
  function zeichne() {
    var b = document.getElementById('ekListe'); if (!b) return;
    b.innerHTML = listeHtml(); stand();
  }

  /* ---------- Knopf im Rezept (mit Portionen aus dem Kochmodus) ---------- */
  function portHol(id) {
    try { var m = window.R7 ? window.R7.hol('kochPort', {}) : {}; return Math.min(8, Math.max(1, +m[id] || 1)); } catch (e) { return 1; }
  }
  function portLeg(id, p) {
    try { if (!window.R7) return; var m = window.R7.hol('kochPort', {}); m[id] = p; window.R7.leg('kochPort', m); } catch (e) {}
  }
  function rezeptKnopf(id) {
    var it = (typeof FEED !== 'undefined' ? FEED : []).filter(function (x) { return x.id === id; })[0];
    var s2 = document.getElementById('s2'); if (!it || !it.ing || !s2 || s2.querySelector('.ek-box')) return;
    var port = portHol(id);
    var box = el('<div class="ek-box"><div class="ek-port"><span>🛒 Einkaufen für</span>' +
      '<button type="button" data-ek="minus" aria-label="Eine Portion weniger">−</button><output aria-live="polite"></output>' +
      '<button type="button" data-ek="plus" aria-label="Eine Portion mehr">+</button></div>' +
      '<button type="button" class="btn" id="ekRezept">Auf die Einkaufsliste</button></div>');
    function zeig() {
      box.querySelector('output').textContent = port + (port === 1 ? ' Portion' : ' Portionen');
      box.querySelector('[data-ek=minus]').disabled = port <= 1; box.querySelector('[data-ek=plus]').disabled = port >= 8;
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.ek) { port = Math.min(8, Math.max(1, port + (b.dataset.ek === 'plus' ? 1 : -1))); portLeg(id, port); zeig(); return; }
      if (b.id === 'ekRezept') {
        rezeptDazu(it, port); kachel();
        b.textContent = '✓ Auf der Liste';
        meldung(it.t + ' ist auf der Einkaufsliste', { knopf: 'Ansehen', undo: oeffnen });
      }
    });
    zeig();
    var nach = s2.querySelector('#eatit');
    if (nach && nach.parentNode) nach.parentNode.insertBefore(box, nach); else s2.appendChild(box);
  }

  /* ---------- Wochenplan: alle Zutaten auf die Liste ---------- */
  function planKnopf() {
    var sh = document.getElementById('plShare'), s2 = document.getElementById('s2');
    if (!sh || !s2 || s2.querySelector('#ekPlan')) return;
    var b = el('<button type="button" class="btn ghost" id="ekPlan">🛒 Alles auf meine Einkaufsliste</button>');
    b.onclick = function () {
      var P = null; try { P = (JSON.parse(localStorage.getItem('foodflow-plus-v1') || '{}') || {}).plan; } catch (e) {}
      if (!P || !P.ids || typeof FEED === 'undefined') return;
      P.ids.forEach(function (id) { var r = FEED.filter(function (x) { return x.id === id; })[0]; if (r) rezeptDazu(r, P.pers || 1); });
      kachel(); b.textContent = '✓ Auf der Einkaufsliste';
      meldung('Wochenplan ist auf der Einkaufsliste', { knopf: 'Ansehen', undo: oeffnen });
    };
    sh.parentNode.insertBefore(b, sh.nextSibling);
  }

  /* ---------- Kachel bei «Für dich» ---------- */
  function kachel() {
    var box = document.getElementById('floEntdecken'); if (!box) return;
    var tiles = box.querySelector('.tiles'); if (!tiles) return;
    var t = tiles.querySelector('.ek-tile');
    if (!t) {
      t = el('<button type="button" class="tile ek-tile"><span class="e" aria-hidden="true">🛒</span><b>Einkaufsliste</b><small></small></button>');
      t.onclick = oeffnen; tiles.appendChild(t);
    }
    t.classList.toggle('breit', tiles.querySelectorAll('.tile:not(.ek-tile)').length % 2 === 0);
    var n = offenZahl();
    t.querySelector('b').innerHTML = 'Einkaufsliste' + (n ? '<span class="ek-zahl">' + n + '</span>' : '');
    t.querySelector('small').textContent = n ? 'Nach Ladenbereich sortiert, zum Abhaken.' : 'Aus Rezepten oder eigenen Einträgen.';
    t.setAttribute('aria-label', 'Einkaufsliste' + (n ? ', ' + n + ' offen' : ''));
  }

  /* ---------- Einhängen ---------- */
  function verbinden() {
    if (typeof window.openPost === 'function' && !window.openPost.ek) {
      var alt = window.openPost;
      var neu = function (id) { var r = alt.apply(this, arguments); try { rezeptKnopf(id); } catch (e) {} return r; };
      neu.ek = true; if (alt.r8k) neu.r8k = true; window.openPost = neu;
    }
    if (typeof window.openS2 === 'function' && !window.openS2.ek) {
      var alt2 = window.openS2;
      var neu2 = function () { var r = alt2.apply(this, arguments); try { planKnopf(); } catch (e) {} return r; };
      neu2.ek = true; window.openS2 = neu2;
    }
    kachel();
    var box = document.getElementById('floEntdecken');
    if (box && window.MutationObserver) new MutationObserver(function () {
      var tl = box.querySelector('.tiles'); if (!tl) return;
      var m = tl.querySelector('.ek-tile'); if (!m) { kachel(); return; }
      if (tl.lastElementChild !== m) tl.appendChild(m);
      m.classList.toggle('breit', tl.querySelectorAll('.tile:not(.ek-tile)').length % 2 === 0);
    }).observe(box, { childList: true, subtree: true });
  }
  window.FFEinkauf = { oeffnen: oeffnen, rezept: rezeptDazu, lies: lies, sektion: sektion, text: text, daten: function () { return D; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', verbinden); else verbinden();
})();
