/* Fompa · Runde 4 (21.10.2026): drei neue Helfer und Feinschliff. Alles nur auf diesem Gerät (IndexedDB).
   1. «Wohin geht dein Geld?» – Ring nach Bereich (Privat, Ferien, Praxis, DR Lab, Unklar) mit Vergleich zum Vormonat
      (Vorbild: Monatsübersicht in Budget-Apps wie Copilot Money).
   2. Abo-Finder – erkennt Zahlungen, die jeden Monat wiederkommen, und rechnet sie aufs Jahr hoch; ein Tipp
      macht daraus Fixkosten (Vorbild: Abo-Erkennung bei Revolut und Copilot Money).
   3. Zettel-Check – was der Steuerberater fragen würde: Betrag fehlt, Bereich unklar, Praxis-/DR-Lab-Zettel ohne Foto
      (Vorbild: offene Belege in Bexio und Expensify). Fompa sagt nie, was abziehbar ist.
   4. Fompa winkt beim Antippen zurück (Haken für Puppe.winkeZurueck aus nova/puppe.js).
   Nutzt die Funktionen aus index.html (zettel, splitKat, isBuch, ZAEHLT, chf, monatName, tx, loadYear, edit). */
(function () {
  'use strict';
  if (typeof zettel === 'undefined' || typeof renderMonat !== 'function') return;
  var ruhigM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FARBE = { Privat: '#f2c14e', Ferien: '#8fb3e8', Praxis: '#86d39a', 'DR Lab': '#c39bff', Unklar: '#ffa36e' };
  var css = document.createElement('style');
  css.textContent = [
    '.r4-ring{display:flex;gap:16px;align-items:center}',
    '.r4-ring svg{flex:none;width:132px;height:132px}',
    '.r4-ring .mitte{font:700 15px var(--serif);fill:var(--ink)}.r4-ring .klein{font:500 10px var(--f);fill:var(--muted)}',
    '.r4-leg{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;font-size:15px}',
    '.r4-leg div{display:flex;align-items:center;gap:8px}.r4-leg i{flex:none;width:10px;height:10px;border-radius:50%}',
    '.r4-leg span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.r4-leg b{font-variant-numeric:tabular-nums;font-weight:600}',
    '.r4-vgl{margin:10px 0 0;font-size:15px;color:var(--muted)}.r4-vgl b.auf{color:var(--warn)}.r4-vgl b.ab{color:var(--ok)}',
    '.r4-zeile{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line)}',
    '.r4-zeile:first-of-type{border-top:0}',
    '.r4-zeile .t{flex:1;min-width:0}.r4-zeile .t b{display:block;font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.r4-zeile .t small{color:var(--muted);font-size:14px}',
    '.r4-zeile .w{font-variant-numeric:tabular-nums;font-weight:700;color:var(--gold);white-space:nowrap}',
    '.r4-mini{min-height:40px;padding:0 12px;border-radius:12px;border:1px solid var(--line);background:var(--goldsoft);color:var(--gold);font:600 14px var(--f);cursor:pointer;white-space:nowrap}',
    '.r4-check{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:4px 0 6px}',
    '.r4-check button{display:flex;flex-direction:column;align-items:center;gap:2px;min-height:76px;padding:8px 4px;border-radius:14px;border:1px solid var(--line);background:var(--card2);color:var(--ink);font:500 13px/1.25 var(--f);cursor:pointer;text-align:center}',
    '.r4-check button b{font:700 24px var(--serif);color:var(--gold)}.r4-check button.ok b{color:var(--ok)}',
    '.r4-check button[aria-pressed=true]{border-color:var(--gold);box-shadow:0 0 0 2px var(--goldsoft)}',
    '.r4-alles{display:flex;align-items:center;gap:10px;color:var(--ok);font-size:15px}',
    '.figur.r4-wink{animation:r4Wink 1s ease-in-out}',
    '@keyframes r4Wink{20%{transform:rotate(-7deg)}45%{transform:rotate(6deg)}70%{transform:rotate(-4deg)}100%{transform:none}}',
    '.r4-hand{position:fixed;z-index:60;font-size:34px;pointer-events:none;transform-origin:70% 90%;animation:r4Hand 1.1s ease-in-out forwards}',
    '@keyframes r4Hand{0%{opacity:0;transform:scale(.6)}15%{opacity:1;transform:scale(1)}35%{transform:rotate(-24deg)}55%{transform:rotate(18deg)}75%{transform:rotate(-12deg);opacity:1}100%{opacity:0;transform:translateY(-14px)}}',
    '@media (prefers-reduced-motion:reduce){.figur.r4-wink,.r4-hand{animation:none!important}.r4-hand{display:none}}'
  ].join('\n');
  document.head.appendChild(css);
  function e(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- Karten in «Monat» einhängen ---------- */
  var monat = document.getElementById('monat'), katKarte = document.getElementById('katSum') && document.getElementById('katSum').closest('.card');
  function karte(id, titel, unter) {
    var k = document.createElement('div'); k.className = 'card'; k.id = id;
    k.innerHTML = '<h2>' + titel + '</h2>' + (unter ? '<p class="hint" style="margin:0 0 10px">' + unter + '</p>' : '') + '<div class="r4-inhalt"></div>';
    return k;
  }
  var ringK = karte('r4Ring', 'Wohin geht dein Geld?', '');
  var checkK = karte('r4Check', 'Zettel-Check', 'Was dein Steuerberater fragen würde. Tipp auf eine Zahl, dann zeige ich dir die Zettel.');
  var aboK = karte('r4Abo', 'Abos und Wiederkehrendes', 'Fompa sucht Zahlungen, die jeden Monat wiederkommen. Kleine Beträge, grosse Jahreszahl.');
  if (monat && katKarte) {
    monat.insertBefore(ringK, katKarte);
    var fixK = document.getElementById('fixSum') && document.getElementById('fixSum').closest('.card');
    monat.insertBefore(aboK, fixK ? fixK.nextSibling : katKarte.nextSibling);
    monat.insertBefore(checkK, ringK);
  }

  /* 1. Ring */
  function vormonat(m) { var y = +m.slice(0, 4), mo = +m.slice(5, 7) - 1; if (mo < 1) { y--; mo = 12; } return y + '-' + String(mo).padStart(2, '0'); }
  function proBereich(m) {
    var o = {}, t = 0;
    zettel.forEach(function (z) { if (!isBuch(z) || !ZAEHLT(z) || !(z.date || '').startsWith(m)) return; var h = splitKat(z.kat).h; o[h] = (o[h] || 0) + (z.amount || 0); t += z.amount || 0; });
    return { o: o, t: t };
  }
  function renderRing() {
    var box = ringK.querySelector('.r4-inhalt'), m = (document.getElementById('monatSel') || {}).value || '';
    if (!m) { box.innerHTML = ''; return; }
    var a = proBereich(m), v = proBereich(vormonat(m));
    if (!a.t) { box.innerHTML = '<p class="hint" style="margin:0">Noch keine Ausgaben in ' + e(monatName(m)) + '. Sobald Zettel im Glas sind, zeige ich dir hier, wohin dein Geld geht.</p>'; return; }
    var R = 52, U = 2 * Math.PI * R, pos = 0, teile = Object.keys(a.o).filter(function (k) { return a.o[k] > 0; }).sort(function (x, y) { return a.o[y] - a.o[x]; });
    var bogen = teile.map(function (k) {
      var l = a.o[k] / a.t * U, s = '<circle cx="66" cy="66" r="' + R + '" fill="none" stroke="' + (FARBE[k] || '#b9c3dc') + '" stroke-width="16" stroke-dasharray="' + Math.max(0, l - 2).toFixed(2) + ' ' + (U - Math.max(0, l - 2)).toFixed(2) + '" stroke-dashoffset="' + (-pos).toFixed(2) + '" transform="rotate(-90 66 66)"/>';
      pos += l; return s;
    }).join('');
    var svg = '<svg viewBox="0 0 132 132" role="img" aria-label="Ausgaben nach Bereich"><circle cx="66" cy="66" r="' + R + '" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="16"/>' + bogen +
      '<text x="66" y="66" text-anchor="middle" class="mitte">' + chf(a.t) + '</text><text x="66" y="82" text-anchor="middle" class="klein">CHF im Monat</text></svg>';
    var leg = teile.map(function (k) { return '<div><i style="background:' + (FARBE[k] || '#b9c3dc') + '"></i><span>' + e(k) + '</span><b>' + Math.round(a.o[k] / a.t * 100) + ' %</b></div>'; }).join('');
    var vgl = '';
    if (v.t > 0) {
      var d = (a.t / v.t - 1) * 100, gr = teile.map(function (k) { return [k, (a.o[k] || 0) - (v.o[k] || 0)]; }).sort(function (x, y) { return Math.abs(y[1]) - Math.abs(x[1]); })[0];
      vgl = '<p class="r4-vgl">Gegenüber ' + e(monatName(vormonat(m)).split(' ')[0]) + ': <b class="' + (d > 0 ? 'auf' : 'ab') + '">' + (d > 0 ? '+' : '−') + Math.abs(d).toFixed(0) + ' %</b>' +
        (gr && Math.abs(gr[1]) >= 1 ? ', am meisten bei <b>' + e(gr[0]) + '</b> (' + (gr[1] > 0 ? '+' : '−') + chf(Math.abs(gr[1])) + ').' : '.') + '</p>';
    } else vgl = '<p class="r4-vgl">Im Vormonat sind keine Zettel. Nächsten Monat vergleiche ich für dich.</p>';
    box.innerHTML = '<div class="r4-ring">' + svg + '<div class="r4-leg">' + leg + '</div></div>' + vgl;
  }

  /* 2. Abo-Finder */
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function renderAbo() {
    var box = aboK.querySelector('.r4-inhalt'), g = {};
    zettel.forEach(function (z) { if (!isBuch(z) || !ZAEHLT(z) || !z.from || !(z.amount > 0) || !z.date) return; var k = norm(z.from); (g[k] = g[k] || []).push(z); });
    var funde = Object.keys(g).map(function (k) {
      var l = g[k], monate = {}; l.forEach(function (z) { monate[z.date.slice(0, 7)] = 1; });
      var n = Object.keys(monate).length; if (n < 2) return null;
      var bet = l.map(function (z) { return z.amount; }).sort(function (a, b) { return a - b; }), med = bet[Math.floor(bet.length / 2)];
      var gleich = l.filter(function (z) { return Math.abs(z.amount - med) <= Math.max(1, med * 0.15); }).length;
      if (gleich < 2) return null;
      var neu = l.slice().sort(function (a, b) { return a.date.localeCompare(b.date); }).pop();
      return { name: neu.from, med: med, n: n, z: neu, fix: !!(neu.fix && /monat|jaehr|jähr|quartal/i.test(neu.fix)) };
    }).filter(Boolean).sort(function (a, b) { return b.med - a.med; });
    if (!funde.length) { box.innerHTML = '<p class="hint" style="margin:0">Noch nichts gefunden. Wenn etwas in zwei Monaten mit ähnlichem Betrag vorkommt, taucht es hier auf.</p>'; return; }
    var tot = funde.reduce(function (s, f) { return s + f.med; }, 0);
    box.innerHTML = funde.slice(0, 8).map(function (f) {
      return '<div class="r4-zeile"><div class="t"><b>' + e(f.name) + '</b><small>in ' + f.n + ' Monaten · etwa ' + chf(f.med * 12) + ' im Jahr</small></div><span class="w">' + chf(f.med) + '</span>' +
        (f.fix ? '<span class="hint" style="font-size:13px">Fixkosten ✓</span>' : '<button class="r4-mini" type="button" data-fix="' + e(f.z.id) + '">Fixkosten</button>') + '</div>';
    }).join('') + '<p class="r4-vgl">Zusammen etwa <b>CHF ' + chf(tot) + '</b> pro Monat, <b>CHF ' + chf(tot * 12) + '</b> im Jahr. Brauchst du noch alles davon?</p>';
  }
  aboK.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-fix]'); if (!b) return;
    var z = zettel.find(function (x) { return x.id === b.dataset.fix; }); if (!z) return;
    z.fix = 'monatlich';
    tx('belege', 'readwrite', function (s) { return s.put(z); }).then(function () { if (typeof toast === 'function') toast('Als Fixkosten «monatlich» gemerkt'); if (typeof pose === 'function') pose('rechnet', '='); return loadYear(); });
  });

  /* 3. Zettel-Check */
  var filter = '';
  var CHECKS = {
    betrag: { t: 'Betrag fehlt', f: function (z) { return z.amount == null; } },
    unklar: { t: 'Bereich unklar', f: function (z) { return isBuch(z) && splitKat(z.kat).h === 'Unklar'; } },
    foto: { t: 'Praxis/DR Lab ohne Foto', f: function (z) { var h = splitKat(z.kat).h; return isBuch(z) && (h === 'Praxis' || h === 'DR Lab') && !z.blob; } }
  };
  function renderCheck() {
    var box = checkK.querySelector('.r4-inhalt');
    var zahlen = {}; Object.keys(CHECKS).forEach(function (k) { zahlen[k] = zettel.filter(CHECKS[k].f); });
    var alle = Object.keys(zahlen).reduce(function (s, k) { return s + zahlen[k].length; }, 0);
    if (!zettel.length) { box.innerHTML = '<p class="hint" style="margin:0">Sobald Zettel im Glas sind, prüfe ich sie hier für dich.</p>'; return; }
    var h = '<div class="r4-check">' + Object.keys(CHECKS).map(function (k) {
      var n = zahlen[k].length; return '<button type="button" data-chk="' + k + '" class="' + (n ? '' : 'ok') + '" aria-pressed="' + (filter === k) + '"><b>' + (n || '✓') + '</b>' + CHECKS[k].t + '</button>';
    }).join('') + '</div>';
    if (!alle) h += '<p class="r4-alles">✨ Alles sauber. Dein Steuerberater wird sich freuen.</p>';
    if (filter && zahlen[filter].length) h += zahlen[filter].slice(-12).reverse().map(function (z) {
      return '<div class="r4-zeile"><div class="t"><b>' + e(z.from || 'ohne «Wofür»') + '</b><small>' + e(z.date ? z.date.split('-').reverse().join('.') : 'ohne Datum') + (z.kat ? ' · ' + e(z.kat) : '') + '</small></div><span class="w">' + (z.amount == null ? '–' : chf(z.amount)) + '</span><button class="r4-mini" type="button" data-edit="' + e(z.id) + '">Ergänzen</button></div>';
    }).join('');
    box.innerHTML = h;
  }
  checkK.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-chk]');
    if (b) { filter = filter === b.dataset.chk ? '' : b.dataset.chk; renderCheck(); return; }
    var ed = ev.target.closest('[data-edit]');
    if (ed && typeof edit === 'function') edit(ed.dataset.edit);
  });

  /* ---------- an renderMonat anhängen ---------- */
  var alt = window.renderMonat;
  window.renderMonat = function () { alt.apply(this, arguments); try { renderRing(); renderAbo(); renderCheck(); } catch (x) {} };
  try { renderRing(); renderAbo(); renderCheck(); } catch (x) {}

  /* ---------- Fompa winkt zurück ---------- */
  var SAETZE = ['Hoi! Schön, dass du da bist.', 'Ich hüte dein Glas. Kein Zettel geht verloren.', 'Ein Zettel am Tag, und das Jahresende wird leicht.', 'Winke, winke! Hast du heute etwas bezahlt?'], si = 0;
  function hand(el) {
    if (ruhigM || !el) return; var r = el.getBoundingClientRect(); var h = document.createElement('span'); h.className = 'r4-hand'; h.textContent = '👋';
    h.style.left = (r.right - 34) + 'px'; h.style.top = (r.top - 6) + 'px'; document.body.appendChild(h); setTimeout(function () { h.remove(); }, 1150);
  }
  // Puppe aus nova/puppe.js (#136): wenn geladen, grüsst Fompa lebendig mit «nicken». Sonst Hand + CSS-Wackeln (Fallback).
  var pp = [];
  function puppeGruss(el) {
    if (!el || !(window.Puppe && typeof window.Puppe.winkeZurueck === 'function')) return false;
    try { var f = pp.filter(function (x) { return x[0] === el; })[0]; if (!f) { f = [el, window.Puppe.winkeZurueck(el, { figur: 'fompa', gruss: 'nicken', antippen: false, blase: false })]; pp.push(f); } if (f[1] && typeof f[1].gruesse === 'function') { f[1].gruesse('nicken'); return true; } } catch (x) {}
    return false;
  }
  function winke(el) {
    try { navigator.vibrate && navigator.vibrate(12); } catch (x) {}
    if (puppeGruss(el)) return true;
    hand(el); return false;
  }
  var fig = document.getElementById('figur');
  if (fig) document.addEventListener('click', function (ev) {
    if (!ev.target.closest || !ev.target.closest('#figur')) return;
    ev.stopPropagation();
    if (typeof pose === 'function') pose('freut', '👋', 1600);
    var img = fig.querySelector('img') || fig;
    if (!winke(img)) { fig.classList.remove('r4-wink'); void fig.offsetWidth; if (!ruhigM) fig.classList.add('r4-wink'); }
    var b = document.getElementById('bubble'); if (b) b.innerHTML = e(SAETZE[si++ % SAETZE.length]);
  }, true);
  document.addEventListener('click', function (ev) {
    var img = ev.target.closest && ev.target.closest('.nb-buehne > img'); if (!img || !ev.isTrusted) return;
    winke(img);
    var s = document.querySelector('.nb-buehne .nb-unten span');
    if (s) { s.textContent = SAETZE[si++ % SAETZE.length]; s.classList.remove('neu-gruss'); void s.offsetWidth; s.classList.add('neu-gruss'); }
  });
})();
