/* TradePing – Runde 4 (21.10.2026): Premium-Feinschliff und drei neue Helfer.
   - Schnellnavigation oben (wie die Reiter in Banking-Apps): Topf · Heute · Merkzettel · Prüfen · Journal · Lernen.
   - Merkzettel mit Nacht-Bremse (Vorbild: 24-Stunden-Bedenkzeit bei Revolut/UK-Krypto-Regel): Idee notieren,
     erst nach einer Nacht wird «prüfen» frei. Mr. Ping sagt nie «kaufen».
   - Gewinn-Tresor (Vorbild: Revolut Vaults, Yuh Sparziele): abgeschöpfte Gewinne hier festhalten, Ziel-Ring.
     Es wird kein Geld bewegt, nur aufgeschrieben, was Diego bei Yuh selbst getan hat.
   - Monatskalender (Vorbild: Gewinn-/Verlust-Kalender in Trading-Journalen und Copilot Money): geschlossene
     Trades aus dem Journal als grüne/rote Tage.
   - Mr. Ping winkt beim Antippen zurück (Haken für Puppe.winkeZurueck aus nova/puppe.js).
   Alles nur auf diesem Handy (localStorage), keine Anlageberatung, kein Server. */
(function () {
  'use strict';
  var M = window.__mrping; if (!M) return;
  var $ = function (id) { return document.getElementById(id); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function zahl(v) { v = String(v == null ? '' : v).replace(/[’' ]/g, '').replace(',', '.'); var n = parseFloat(v); return isFinite(n) ? n : null; }
  function chf(n) { return 'CHF ' + n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function brr(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
  function tag(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  var css = [
    '.r4-nav{position:sticky;top:0;z-index:30;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 -16px 12px;padding:calc(8px + env(safe-area-inset-top,0px)) 16px 8px;background:rgba(6,13,28,.86);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}',
    '.r4-nav::-webkit-scrollbar{display:none}',
    '.r4-nav a{flex:none;display:flex;align-items:center;min-height:36px;padding:0 14px;border-radius:18px;color:var(--ink2);text-decoration:none;font-size:14px;font-weight:600;border:1px solid var(--line2);transition:background .2s,color .2s}',
    '.r4-nav a.an{background:var(--gold);color:#1a1300;border-color:var(--gold)}',
    '.r4-reihe{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end}',
    '.r4-reihe label{flex:1 1 120px;display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--muted)}',
    '.r4-reihe input{min-height:46px;border-radius:12px;border:1px solid var(--line2);background:rgba(0,0,0,.25);color:var(--ink);font:16px var(--sans);padding:0 12px;width:100%;box-sizing:border-box}',
    '.r4-reihe .btn{flex:1 1 100%;min-height:48px}',
    '.r4-liste{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}',
    '.r4-liste li{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:var(--card2);border:1px solid var(--line)}',
    '.r4-liste li b{font-size:15px}.r4-liste li small{display:block;color:var(--muted);font-size:13px;line-height:1.35}',
    '.r4-liste li .r4-txt{flex:1;min-width:0}',
    '.r4-uhr{flex:none;font-size:13px;font-weight:700;color:var(--gold);background:var(--gold-l);border-radius:10px;padding:6px 8px;text-align:center;min-width:64px}',
    '.r4-uhr.reif{color:#04201d;background:var(--teal);border:0;cursor:pointer;min-height:36px;font:700 13px var(--sans)}',
    '.r4-weg{flex:none;width:36px;height:36px;border-radius:50%;border:1px solid var(--line2);background:transparent;color:var(--muted);font-size:14px;cursor:pointer}',
    '.r4-leer{margin:10px 0 0;color:var(--muted);font-size:14px;text-align:center;padding:12px;border:1px dashed var(--line2);border-radius:14px}',
    '.r4-tresor{display:flex;gap:16px;align-items:center;margin-bottom:12px}',
    '.r4-ring{flex:none;width:96px;height:96px;position:relative}',
    '.r4-ring svg{width:96px;height:96px;transform:rotate(-90deg)}',
    '.r4-ring circle{fill:none;stroke-width:9}',
    '.r4-ring .bg{stroke:rgba(255,255,255,.08)}.r4-ring .fg{stroke:var(--gold);stroke-linecap:round;transition:stroke-dashoffset .8s var(--ease)}',
    '.r4-ring span{position:absolute;inset:0;display:grid;place-items:center;font-size:20px}',
    '.r4-summe b{display:block;font-size:26px;letter-spacing:-.5px;font-variant-numeric:tabular-nums}.r4-summe small{color:var(--muted);font-size:13px}',
    '.r4-ziel{background:none;border:0;color:var(--gold);font:600 13px var(--sans);padding:6px 0;cursor:pointer;min-height:32px}',
    '.r4-kal-kopf{display:flex;align-items:center;justify-content:space-between;margin:2px 0 8px}',
    '.r4-kal-kopf b{font-size:16px}.r4-kal-kopf button{width:44px;height:44px;border-radius:50%;border:1px solid var(--line2);background:transparent;color:var(--ink);font-size:18px;cursor:pointer}',
    '.r4-kal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}',
    '.r4-kal i{font-style:normal;text-align:center;font-size:11px;color:var(--muted);padding:2px 0}',
    '.r4-kal div{aspect-ratio:1/1;border-radius:10px;background:rgba(255,255,255,.03);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px;color:var(--ink2);line-height:1.1;min-width:0;overflow:hidden}',
    '.r4-kal div.heute{outline:1.5px solid var(--gold)}',
    '.r4-kal div.plus{background:rgba(95,220,154,.22);color:#c9f7dd}.r4-kal div.minus{background:rgba(255,123,114,.22);color:#ffd2ce}',
    '.r4-kal div small{font-size:9.5px;font-weight:700;font-variant-numeric:tabular-nums}',
    '.r4-kal-fuss{display:flex;justify-content:space-between;margin-top:10px;font-size:13px;color:var(--muted)}',
    '.mp-ava img.r4-wink{animation:r4Wink 1.1s ease-in-out!important}',
    '.r4-hand{position:absolute;left:-8px;top:-10px;font-size:26px;transform-origin:70% 90%;opacity:0;pointer-events:none}',
    '.r4-hand.an{animation:r4Hand 1.2s ease-in-out}',
    '@keyframes r4Wink{20%{transform:rotate(-6deg) translateY(-3px)}45%{transform:rotate(5deg)}70%{transform:rotate(-3deg)}100%{transform:none}}',
    '@keyframes r4Hand{0%{opacity:0;transform:rotate(0)}15%{opacity:1}30%{transform:rotate(-22deg)}50%{transform:rotate(18deg)}70%{transform:rotate(-14deg)}85%{opacity:1}100%{opacity:0;transform:rotate(0)}}',
    '@media (prefers-reduced-motion:reduce){.r4-nav a,.r4-ring .fg{transition:none}.mp-ava img.r4-wink,.r4-hand.an{animation:none!important}}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- Mr. Ping winkt zurück ---------- */
  var ava = document.querySelector('.mp-ava');
  if (ava) {
    var hand = document.createElement('span'); hand.className = 'r4-hand'; hand.setAttribute('aria-hidden', 'true'); hand.textContent = '👋'; ava.appendChild(hand);
    ava.setAttribute('role', 'button'); ava.setAttribute('tabindex', '0'); ava.setAttribute('aria-label', 'Mr. Ping antippen, er winkt zurück');
    var GRUESSE = ['Guten Tag! Schön, dass du vorbeischaust.', 'Ich halte Wache. Wenn ich still bin, ist alles ruhig.', 'Geduld ist die feinste Strategie.', 'Ein Ping nur, wenn es zählt.'], gi = 0;
    // Puppe aus nova/puppe.js (#136): Mr. Ping grüsst lebendig mit der Glocke. Ohne Puppe: CSS-Winken (Fallback).
    var pp = null;
    var puppeGruss = function (img) {
      if (!(window.Puppe && typeof window.Puppe.winkeZurueck === 'function')) return false;
      try { pp = pp || window.Puppe.winkeZurueck(img, { figur: 'mrping', gruss: 'glocke', antippen: false, blase: false }); if (pp && typeof pp.gruesse === 'function') { pp.gruesse('glocke'); return true; } } catch (e) {}
      return false;
    };
    var winke = function () {
      var img = ava.querySelector('img');
      if (!puppeGruss(img) && !ruhig) { img.classList.remove('r4-wink'); hand.classList.remove('an'); void img.offsetWidth; img.classList.add('r4-wink'); hand.classList.add('an'); }
      brr(12);
      setTimeout(function () { M.pose('ping', GRUESSE[gi++ % GRUESSE.length]); }, 30);
    };
    ava.addEventListener('click', winke);
    ava.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); winke(); } });
    ava.addEventListener('animationend', function (e) { if (e.animationName === 'r4Wink') e.target.classList.remove('r4-wink'); });
  }

  /* ---------- Merkzettel mit Nacht-Bremse ---------- */
  var KM = 'tp.merkzettel', BREMSE = 16 * 3600 * 1000;
  var merk = load(KM, []); if (!Array.isArray(merk)) merk = [];
  var merkK = M.karte('r4Merk', 'Merkzettel · erst schlafen, dann prüfen', 'Eine Idee für einen Titel? Schreib sie auf. Nach einer Nacht wird «Prüfen» frei. Die meisten Spontankäufe sehen am Morgen anders aus.',
    '<div class="r4-reihe"><label>Kürzel<input id="r4MSym" maxlength="15" autocomplete="off" placeholder="z. B. NESN" autocapitalize="characters"></label>' +
    '<label style="flex-basis:100%">Warum? (ein Satz)<input id="r4MGrund" maxlength="100" autocomplete="off" placeholder="z. B. Gute Zahlen erwartet"></label>' +
    '<button class="btn" type="button" id="r4MAdd">Auf den Merkzettel</button></div><ul class="r4-liste" id="r4MListe"></ul>');
  function rest(t) { var r = t + BREMSE - Date.now(); if (r <= 0) return ''; var h = Math.floor(r / 3600000), m = Math.ceil((r % 3600000) / 60000); return h ? h + ' h ' + m + ' min' : m + ' min'; }
  function renderMerk() {
    var ul = $('r4MListe'); if (!ul) return;
    if (!merk.length) { ul.innerHTML = '<li class="r4-leer" style="display:block;background:none">Noch nichts notiert. Ruhige Hände, ruhiger Topf.</li>'; return; }
    ul.innerHTML = merk.map(function (m, i) {
      var r = rest(m.t);
      return '<li><span class="r4-txt"><b>' + esc(m.sym) + '</b><small>' + esc(m.grund || 'ohne Grund notiert') + '</small></span>' +
        (r ? '<span class="r4-uhr" aria-label="Noch ' + r + ' Bedenkzeit">🌙 ' + r + '</span>' : '<button class="r4-uhr reif" type="button" data-r4p="' + i + '">Prüfen</button>') +
        '<button class="r4-weg" type="button" data-r4w="' + i + '" aria-label="' + esc(m.sym) + ' vom Merkzettel löschen">✕</button></li>';
    }).join('');
  }
  merkK.addEventListener('click', function (e) {
    var t = e.target;
    if (t.id === 'r4MAdd') {
      var sym = String($('r4MSym').value || '').toUpperCase().replace(/[^A-Z0-9.:\-]/g, '').slice(0, 15);
      if (!sym) { $('r4MSym').focus(); return; }
      if (window.TP_RUESTUNG && window.TP_RUESTUNG.indexOf(sym) >= 0) { M.pose('warn', sym + ' ist ein Rüstungstitel. Den nehme ich nach deiner Leitlinie nicht auf.'); return; }
      merk.unshift({ sym: sym, grund: String($('r4MGrund').value || '').trim().slice(0, 100), t: Date.now() }); merk = merk.slice(0, 12); save(KM, merk);
      $('r4MSym').value = ''; $('r4MGrund').value = ''; renderMerk(); brr(10);
      M.pose('denk', 'Notiert: ' + sym + '. Schlaf eine Nacht drüber, dann schauen wir gemeinsam die Zahlen an.');
      return;
    }
    var p = t.closest('[data-r4p]');
    if (p) {
      var m = merk[+p.dataset.r4p]; var r = $('mpRechner');
      if (r) { r.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' }); var f = r.querySelector('input'); if (f) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (x) {} }, 500); }
      M.pose('denk', 'Gut geschlafen? Dann prüf ' + (m ? m.sym : 'den Titel') + ' in Ruhe: Gebühren, Grenze, Chance. Du entscheidest.');
      return;
    }
    var w = t.closest('[data-r4w]');
    if (w) { merk.splice(+w.dataset.r4w, 1); save(KM, merk); renderMerk(); }
  });

  /* ---------- Gewinn-Tresor ---------- */
  var KT = 'tp.tresor';
  var tresor = load(KT, { ziel: 50, eintraege: [] }); if (!tresor || !Array.isArray(tresor.eintraege)) tresor = { ziel: 50, eintraege: [] };
  var tresK = M.karte('r4Tresor', 'Gewinn-Tresor', 'Wenn du bei Yuh einen Gewinn abschöpfst, trag ihn hier ein. Was im Tresor liegt, spielt nicht mehr mit. Hier wird kein Geld bewegt.',
    '<div class="r4-tresor"><div class="r4-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="bg" cx="50" cy="50" r="42"/><circle class="fg" id="r4Ring" cx="50" cy="50" r="42" stroke-dasharray="263.9" stroke-dashoffset="263.9"/></svg><span aria-hidden="true">🔒</span></div>' +
    '<div class="r4-summe"><b id="r4TSumme">CHF 0.00</b><small id="r4TZielTxt">Ziel CHF 50</small><br><button class="r4-ziel" type="button" id="r4TZiel">Ziel ändern</button></div></div>' +
    '<div class="r4-reihe"><label>Betrag CHF<input id="r4TBetrag" inputmode="decimal" placeholder="z. B. 12.50"></label><label>Woher? (freiwillig)<input id="r4TNotiz" maxlength="40" placeholder="z. B. Hälfte NESN"></label>' +
    '<button class="btn pri" type="button" id="r4TAdd">In den Tresor legen</button></div><ul class="r4-liste" id="r4TListe"></ul>');
  function renderTresor() {
    var sum = tresor.eintraege.reduce(function (a, x) { return a + (x.chf || 0); }, 0);
    $('r4TSumme').textContent = chf(sum);
    var anteil = Math.max(0, Math.min(1, sum / (tresor.ziel || 50)));
    $('r4Ring').setAttribute('stroke-dashoffset', String(263.9 * (1 - anteil)));
    $('r4TZielTxt').textContent = sum >= tresor.ziel ? 'Ziel CHF ' + tresor.ziel + ' erreicht ✨' : 'Ziel CHF ' + tresor.ziel + ' · noch ' + chf(tresor.ziel - sum);
    var ul = $('r4TListe');
    ul.innerHTML = tresor.eintraege.slice(0, 5).map(function (x, i) {
      return '<li><span class="r4-txt"><b>' + chf(x.chf) + '</b><small>' + esc(x.notiz || 'Gewinn beiseite') + ' · ' + esc(x.datum.split('-').reverse().join('.')) + '</small></span><button class="r4-weg" type="button" data-r4t="' + i + '" aria-label="Eintrag löschen">✕</button></li>';
    }).join('');
  }
  tresK.addEventListener('click', function (e) {
    var t = e.target;
    if (t.id === 'r4TAdd') {
      var b = zahl($('r4TBetrag').value); if (!(b > 0) || b > 100000) { $('r4TBetrag').focus(); return; }
      var vorher = tresor.eintraege.reduce(function (a, x) { return a + x.chf; }, 0);
      tresor.eintraege.unshift({ chf: Math.round(b * 100) / 100, notiz: String($('r4TNotiz').value || '').trim().slice(0, 40), datum: tag() }); save(KT, tresor);
      $('r4TBetrag').value = ''; $('r4TNotiz').value = ''; renderTresor(); brr([10, 60, 10]);
      var jetzt = vorher + b;
      M.pose('jubel', jetzt >= tresor.ziel && vorher < tresor.ziel ? 'Ziel erreicht! ' + chf(jetzt) + ' liegen sicher im Tresor. Das gehört jetzt dir.' : 'Klug. ' + chf(b) + ' sind in Sicherheit. Was im Tresor liegt, kann nicht mehr fallen.');
      return;
    }
    if (t.id === 'r4TZiel') { var z = zahl(prompt('Neues Tresor-Ziel in CHF:', String(tresor.ziel))); if (z > 0 && z < 1000000) { tresor.ziel = Math.round(z); save(KT, tresor); renderTresor(); } return; }
    var w = t.closest('[data-r4t]'); if (w && confirm('Diesen Tresor-Eintrag löschen?')) { tresor.eintraege.splice(+w.dataset.r4t, 1); save(KT, tresor); renderTresor(); }
  });

  /* ---------- Monatskalender aus dem Journal ---------- */
  var mon = new Date(); mon.setDate(1);
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var kalK = M.karte('r4Kal', 'Dein Monat', 'Jeder Tag mit einem abgeschlossenen Trade aus dem Journal: grün im Plus, rot im Minus, nach Gebühren.',
    '<div class="r4-kal-kopf"><button type="button" id="r4KZur" aria-label="Monat zurück">‹</button><b id="r4KTitel"></b><button type="button" id="r4KVor" aria-label="Monat vor">›</button></div><div class="r4-kal" id="r4KalGrid"></div><div class="r4-kal-fuss" id="r4KFuss"></div>');
  function ergebnis(t) {
    if (t.verkauf == null || !t.kauf) return null;
    var brutto = t.einsatz * (t.verkauf / t.kauf) - t.einsatz;
    return brutto - M.gebuehr(t.einsatz, t.wae) - M.gebuehr(t.einsatz * t.verkauf / t.kauf, t.wae);
  }
  function renderKal() {
    var j = (M.journal() || []), proTag = {};
    j.forEach(function (t) { var e = ergebnis(t); if (e == null || !t.zu) return; proTag[t.zu] = (proTag[t.zu] || 0) + e; });
    var y = mon.getFullYear(), m = mon.getMonth(), tage = new Date(y, m + 1, 0).getDate(), start = (new Date(y, m, 1).getDay() + 6) % 7, heute = tag();
    $('r4KTitel').textContent = MONATE[m] + ' ' + y;
    var h = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(function (d) { return '<i>' + d + '</i>'; }).join('');
    for (var i = 0; i < start; i++) h += '<span></span>';
    var sum = 0, n = 0, gut = 0;
    for (var d = 1; d <= tage; d++) {
      var k = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'), v = proTag[k];
      var cls = (v == null ? '' : v >= 0 ? 'plus' : 'minus') + (k === heute ? ' heute' : '');
      if (v != null) { sum += v; n++; if (v >= 0) gut++; }
      h += '<div class="' + cls + '"' + (v != null ? ' aria-label="' + d + '. ' + MONATE[m] + ': ' + chf(v) + '"' : '') + '>' + d + (v != null ? '<small>' + (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(0) + '</small>' : '') + '</div>';
    }
    $('r4KalGrid').innerHTML = h;
    $('r4KFuss').innerHTML = n ? '<span>' + n + ' Handelstag' + (n > 1 ? 'e' : '') + ' · ' + gut + ' im Plus</span><b style="color:' + (sum >= 0 ? 'var(--green)' : 'var(--red)') + '">' + (sum >= 0 ? '+' : '−') + chf(Math.abs(sum)) + '</b>' : '<span>Noch keine abgeschlossenen Trades in diesem Monat.</span>';
  }
  kalK.addEventListener('click', function (e) {
    if (e.target.id === 'r4KZur') { mon.setMonth(mon.getMonth() - 1); renderKal(); }
    if (e.target.id === 'r4KVor') { mon.setMonth(mon.getMonth() + 1); renderKal(); }
  });

  /* ---------- Einhängen ---------- */
  var topf = $('topf'), rechner = $('mpRechner'), journalK = $('mpJournal');
  if (topf) M.nach(topf, tresK); else document.querySelector('.wrap').appendChild(tresK);
  if (rechner) rechner.parentNode.insertBefore(merkK, rechner); else document.querySelector('.wrap').appendChild(merkK);
  if (journalK) M.nach(journalK, kalK); else document.querySelector('.wrap').appendChild(kalK);
  renderMerk(); renderTresor(); renderKal();
  setInterval(renderMerk, 60000);
  // Journal ändert sich: Kalender nachziehen
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#mpJournal')) setTimeout(renderKal, 300); });
  addEventListener('storage', function (e) { if (e.key === 'tp.journal') renderKal(); });

  /* ---------- Schnellnavigation ---------- */
  var ZIELE = [['topf', 'Topf'], ['mpHeute', 'Heute'], ['r4Tresor', 'Tresor'], ['r4Merk', 'Merkzettel'], ['mpRechner', 'Prüfen'], ['mpJournal', 'Journal'], ['r4Kal', 'Monat'], ['mpLexikon', 'Lernen']].filter(function (z) { return $(z[0]); });
  var head = document.querySelector('header.top');
  if (head && ZIELE.length > 2) {
    var nav = document.createElement('nav'); nav.className = 'r4-nav'; nav.setAttribute('aria-label', 'Schnell zu');
    nav.innerHTML = ZIELE.map(function (z) { return '<a href="#' + z[0] + '" data-z="' + z[0] + '">' + z[1] + '</a>'; }).join('');
    head.parentNode.insertBefore(nav, head.nextSibling);
    ZIELE.forEach(function (z) { $(z[0]).style.scrollMarginTop = '64px'; });
    nav.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-z]'); if (!a) return; e.preventDefault();
      $(a.dataset.z).scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    });
    if ('IntersectionObserver' in window) {
      var sichtbar = {};
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { sichtbar[en.target.id] = en.isIntersecting; });
        var erstes = ZIELE.filter(function (z) { return sichtbar[z[0]]; })[0];
        if (!erstes) return;
        nav.querySelectorAll('a').forEach(function (a) {
          var an = a.dataset.z === erstes[0]; a.classList.toggle('an', an);
          if (an) { var l = a.offsetLeft - 16; if (Math.abs(nav.scrollLeft - l) > 40) nav.scrollTo({ left: l, behavior: ruhig ? 'auto' : 'smooth' }); }
        });
      }, { rootMargin: '-70px 0px -55% 0px' });
      ZIELE.forEach(function (z) { io.observe($(z[0])); });
    }
  }
})();
