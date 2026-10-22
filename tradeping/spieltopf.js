/* TradePing – Runde 3 (19.10.2026): der Spieltopf als Herzstück.
   CHF 200, vier Titel zu je CHF 50, selbst gekauft bei Yuh. Hier trägt Diego die Titel ein,
   sieht Gewinn und Verlust, seine Verlustgrenze und die Gewinnmarke, und Mr. Ping fiebert mit.
   Daten: localStorage «tp.topf», Liste von Titeln {id, name, symbol, boerse, einsatz, kauf, jetzt,
   datum, stueck, grenze, gepingt}. Die alte Vierer-Liste wird übernommen (ausgefüllte Titel bleiben).
   Übernommen aus «Spieltopf für morgen»: Börse, Datum, Stück, eigene Verlustgrenze mit Ping,
   Kurs von Hand, freundliche Meldung wenn Kursabruf blockiert, Export/Import als Text.
   Spielgeld, kein Rat: Mr. Ping schlägt keine Titel vor und sagt nie «kaufen» oder «verkaufen». */
(function () {
  'use strict';
  var KEY = 'tp.topf', K3 = 'tp.runde3', PLAETZE = 4;
  var $ = function (id) { return document.getElementById(id); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function M() { return window.__mrping || null; }
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function zahl(v) { if (typeof v === 'number') return isFinite(v) ? v : null; v = String(v == null ? '' : v).replace(/[’' ]/g, '').replace(',', '.'); if (!v) return null; var n = parseFloat(v); return isFinite(n) ? n : null; }
  function chf(n) { return 'CHF ' + n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function chfS(n) { return (n > 0.004 ? '+' : n < -0.004 ? '−' : '±') + chf(Math.abs(n)); }
  function zS(n) { return (n > 0.004 ? '+' : n < -0.004 ? '−' : '±') + Math.abs(n).toFixed(2); }
  function proz(v) { if (v == null || !isFinite(v)) return '—'; return (Math.abs(v) < 0.05 ? '±' : v > 0 ? '+' : '−') + Math.abs(v).toFixed(1).replace('.', ',') + ' %'; }
  function p1(v) { return Math.abs(v).toFixed(1).replace('.', ','); }
  function kurs(n) { return n == null ? '—' : n.toLocaleString('de-CH', { maximumFractionDigits: n >= 100 ? 2 : 4 }); }
  function heute() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function brr(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
  function neueId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------- Daten ---------- */
  function aufraeumen(p) {
    if (!p || typeof p !== 'object') return null;
    var n = String(p.name || p.symbol || '').trim().slice(0, 40); if (!n) return null;
    return { id: p.id || neueId(), name: n, symbol: String(p.symbol || '').toUpperCase().replace(/[^A-Z0-9.:\-]/g, '').slice(0, 15), boerse: String(p.boerse || 'Yuh').slice(0, 20),
      einsatz: zahl(p.einsatz) || 0, kauf: zahl(p.kauf), jetzt: zahl(p.jetzt), datum: /^\d{4}-\d{2}-\d{2}$/.test(p.datum || '') ? p.datum : '', stueck: zahl(p.stueck),
      grenze: zahl(p.grenze) > 0 && zahl(p.grenze) < 100 ? zahl(p.grenze) : 15, gepingt: !!p.gepingt, live: false };
  }
  var roh = load(KEY, []);
  var topf = (Array.isArray(roh) ? roh : []).map(aufraeumen).filter(Boolean);
  function speichern() { save(KEY, topf); }
  if (Array.isArray(roh) && roh.length) speichern();
  var R3 = load(K3, { max: null, fuehrer: '', alle: false, letzte: {} });
  if (!R3.letzte) R3.letzte = {};
  function r3Save() { save(K3, R3); }

  function wert(p) { return p.kauf && p.jetzt ? p.einsatz * p.jetzt / p.kauf : (p.einsatz || 0); }
  function pr(p) { return p.kauf && p.jetzt ? (p.jetzt / p.kauf - 1) * 100 : null; }
  function titel(p) { return p.symbol || p.name; }
  function lage(p) {
    var v = pr(p); if (v == null) return 'wartet';
    if (v <= -p.grenze) return 'grenze';
    if (v >= 30) return 'ziel';
    if (v <= -p.grenze * 0.6) return 'nah';
    return v >= 0 ? 'plus' : 'minus';
  }
  function stand() {
    var ein = topf.reduce(function (a, p) { return a + (p.einsatz || 0); }, 0);
    var w = topf.reduce(function (a, p) { return a + wert(p); }, 0);
    return { ein: ein, wert: w, diff: ein ? (w / ein - 1) * 100 : 0, chf: w - ein };
  }

  /* ---------- Zeichnen ---------- */
  var gezeigt = null, zahlT = 0;
  function zahlAnimieren(ziel) {
    var el = $('topfWert'); if (!el) return;
    if (gezeigt == null || ruhig) { gezeigt = ziel; el.textContent = chf(ziel); return; }
    var von = gezeigt, t0 = performance.now(), dauer = 750;
    if (Math.abs(ziel - von) < 0.005) { el.textContent = chf(ziel); return; }
    el.classList.remove('st-flash-up', 'st-flash-dn'); el.classList.add(ziel > von ? 'st-flash-up' : 'st-flash-dn');
    clearTimeout(zahlT); zahlT = setTimeout(function () { el.classList.remove('st-flash-up', 'st-flash-dn'); }, 1400);
    gezeigt = ziel;
    (function schritt(t) {
      var k = Math.min(1, (t - t0) / dauer), e = 1 - Math.pow(1 - k, 3);
      el.textContent = chf(von + (ziel - von) * e);
      if (k < 1) requestAnimationFrame(schritt);
    })(t0);
  }
  function lagePos(v, lo, hi) { return Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100)); }

  function zeichnen(hopsId) {
    var liste = $('topfListe'); if (!liste) return;
    var bahn = Math.max(0, (liste.clientWidth - 8) / 2 - 24);
    var html = topf.map(function (p, i) {
      var l = lage(p), v = pr(p), w = wert(p), g = p.grenze, lo = -(g + 5), hi = 35;
      var flag = l === 'grenze' ? '<span class="st-flag">🔔 Grenze</span>' : l === 'ziel' ? '<span class="st-flag">+30 %</span>' : '';
      var mini = v == null ? '' : '<span class="st-mini" aria-hidden="true"><b class="g" style="left:' + lagePos(-g, lo, hi) + '%"></b><b class="n" style="left:' + lagePos(0, lo, hi) + '%"></b><b class="z" style="left:' + lagePos(30, lo, hi) + '%"></b><i style="transform:translateX(' + (lagePos(v, lo, hi) / 100 * bahn).toFixed(1) + 'px)"></i></span>';
      var unter = p.symbol && p.name && p.name !== p.symbol ? p.name : (p.boerse || 'Yuh') + ' · ' + chf(p.einsatz || 0);
      return '<button type="button" role="listitem" class="st-tile ' + l + '" data-id="' + esc(p.id) + '" style="--n:' + i + '" aria-label="' + esc(titel(p)) + ', ' + (v == null ? (p.kauf ? 'Kurs jetzt fehlt' : 'Kaufkurs fehlt') : proz(v)) + ', ändern">' + flag +
        '<span class="st-top"><b class="st-sym">' + esc(titel(p)) + '</b>' + (p.live ? '<i class="st-live" title="Kurs abgerufen"></i>' : '') + '</span>' +
        '<span class="st-name">' + esc(unter) + '</span>' +
        (v == null ? '<span class="st-pct leise">' + (p.kauf ? 'Kurs jetzt eintragen' : 'Kaufkurs eintragen') + '</span>' : '<span class="st-pct">' + proz(v) + '</span><span class="st-chf">' + chf(w) + ' · ' + zS(w - (p.einsatz || 0)) + '</span>') +
        mini + '</button>';
    });
    for (var k = topf.length; k < PLAETZE; k++) html.push('<button type="button" role="listitem" class="st-tile leer' + (k === topf.length ? ' erstes' : '') + '" data-neu="1" style="--n:' + k + '" aria-label="Titel ' + (k + 1) + ' eintragen"><span class="st-plus" aria-hidden="true">+</span><span class="st-leer">Titel ' + (k + 1) + ' eintragen</span></button>');
    liste.innerHTML = html.join('');
    $('tpNeu').hidden = topf.length < PLAETZE;
    if (hopsId) { var t = liste.querySelector('[data-id="' + hopsId + '"]'); if (t) t.classList.add('hops'); }
    var s = stand(), d = $('topfDiff'), n = topf.length, mitKurs = topf.filter(function (p) { return pr(p) != null; }).length;
    zahlAnimieren(s.wert);
    d.textContent = proz(s.diff); d.className = 'st-diff' + (s.diff > 0.04 ? ' plus' : s.diff < -0.04 ? ' minus' : '');
    var ein = chf(s.ein).replace('.00', '');
    $('topfSub').textContent = n === 0 ? 'Noch kein Titel. Tipp auf das blaue Plus.'
      : mitKurs ? 'Eingesetzt ' + ein + ' · ' + chfS(s.chf) + ' seit dem Kauf'
      : n < PLAETZE ? 'Eingesetzt ' + ein + ' · ' + n + ' von ' + PLAETZE + ' Titeln eingetragen'
      : 'Eingesetzt ' + ein + ' · alle ' + n + ' Titel im Spiel';
    var nadel = $('topfNadel'); if (nadel) nadel.style.transform = 'translateX(' + (lagePos(n ? s.diff : 0, -30, 35) / 100 * nadel.parentNode.clientWidth).toFixed(1) + 'px)';
    $('topfAlarm').innerHTML = s.ein && s.diff <= -25 ? '<p class="topf-alarm">Der Topf ist 25 % im Minus. Deine Regel sagt: Pause machen und mit Mr. Ping in Ruhe besprechen.</p>' : '';
  }

  /* ---------- Verlustgrenze: Ping, wenn erreicht (aus «Spieltopf für morgen») ---------- */
  function glockenTon() { try { var ac = new (window.AudioContext || window.webkitAudioContext)(), t = ac.currentTime; [988, 740].forEach(function (f, i) { var o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0.0001, t + i * .25); g.gain.exponentialRampToValueAtTime(0.2, t + i * .25 + .01); g.gain.exponentialRampToValueAtTime(0.0001, t + i * .25 + .9); o.connect(g).connect(ac.destination); o.start(t + i * .25); o.stop(t + i * .25 + 1); }); } catch (e) {} }
  function grenzenPruefen() {
    var neu = [];
    topf.forEach(function (p) {
      var v = pr(p); if (v == null) return;
      if (v <= -p.grenze) { if (!p.gepingt) { p.gepingt = true; neu.push(p); } }
      else if (p.gepingt) p.gepingt = false;
    });
    speichern();
    if (!neu.length) return;
    var txt = 'PING: ' + neu.map(function (p) { return titel(p) + ' hat deine Verlustgrenze −' + p.grenze + ' % erreicht'; }).join(' · ') + '.';
    glockenTon(); brr([120, 80, 120]);
    try { if (window.Notification && Notification.permission === 'granted') new Notification('TradePing', { body: txt, icon: 'icon-192.png', tag: 'tp-grenze' }); } catch (e) {}
    sag('warn', txt + ' Du hast die Grenze vor dem Kauf gesetzt. Du entscheidest.');
    neu.forEach(function (p) { sterne(kachel(p.id), 8); });
    var gl = $('pingGlocke'); if (gl) { gl.classList.remove('klingelt'); void gl.offsetWidth; gl.classList.add('klingelt'); }
  }

  /* ---------- Mr. Ping fiebert mit (Spannung, kein Rat) ---------- */
  function vorhang() {
    var m = M(); if (!m || !m.boerse) return null;
    var us = m.boerse('America/New_York', 570, 960);
    var h = Math.floor(us.bis / 60), mi = us.bis % 60, dauer = (h ? h + ' h ' : '') + (mi ? mi + ' min' : '');
    return us.offen ? 'Die Börse in New York ist offen, noch ' + dauer + '. Jeder Kurs kann jetzt springen.' : 'Vorhang auf in ' + dauer + ': New York öffnet ' + us.um + '.';
  }
  function spannung() {
    if (!topf.length) return [['ping', 'Morgen geht’s los? Tipp auf das blaue Plus und trag deinen ersten Titel ein. Dann fiebere ich mit.']];
    var mit = topf.map(function (p) { return { p: p, v: pr(p), t: titel(p) }; }).filter(function (x) { return x.v != null; });
    if (!mit.length) return [['denk', 'Fast startklar. Mit Kaufkurs und Kurs jetzt rechne ich Gewinn, Verlust und deine Grenze aus.'], ['', vorhang() || 'Die Bühne ist bereit.']];
    var z = [], sorted = mit.slice().sort(function (x, y) { return y.v - x.v; }), best = sorted[0], worst = sorted[sorted.length - 1], s = stand();
    mit.forEach(function (x) {
      var g = x.p.grenze;
      if (x.v >= 30) z.push(['jubel', x.t + ' hat die Gewinnmarke geknackt: ' + proz(x.v) + '! Deine Regel: die Hälfte als Gewinn markieren. Du entscheidest.']);
      else if (x.v <= -g) z.push(['warn', x.t + ' steht auf deiner Verlustgrenze (' + proz(x.v) + '). Deine Regel gilt, ganz ruhig. Du entscheidest.']);
      else if (x.v <= -g * 0.6) z.push(['warn', 'Spannung bei ' + x.t + ': ' + proz(x.v) + '. Bis zur Grenze bleiben ' + p1(g + x.v) + ' %. Tief durchatmen.']);
      else if (x.v >= 20) z.push(['jubel', x.t + ' ist heiss: ' + proz(x.v) + '. Nur noch ' + p1(30 - x.v) + ' % bis zur Gewinnmarke!']);
    });
    if (mit.length > 1 && best.v > 0) z.push(['', best.t + ' führt im Topf-Rennen mit ' + proz(best.v) + '. Noch ' + p1(30 - best.v) + ' % bis zur Gewinnmarke.']);
    if (mit.length > 1 && worst.v < 0 && worst !== best) z.push(['denk', 'Schlusslicht ist ' + worst.t + ' mit ' + proz(worst.v) + '. Das Rennen ist noch lang.']);
    z.push([s.chf >= 0 ? '' : 'denk', 'Dein Topf: ' + chf(s.wert) + ', ' + chfS(s.chf) + ' seit dem Kauf. Spielgeld, kein Rat.']);
    var vh = vorhang(); if (vh) z.push(['', vh]);
    return z;
  }
  var zi = 0, sagT = 0, letzteEigene = 0;
  function sag(pose, satz) { var m = M(); if (!m) return; letzteEigene = Date.now(); m.pose(pose, satz); }
  function weiter() { var z = spannung(); if (!z.length) return; var x = z[zi++ % z.length]; sag(x[0], x[1]); }
  function takt() { clearInterval(sagT); sagT = setInterval(function () { if (!document.hidden && !$('stSheet').classList.contains('auf') && Date.now() - letzteEigene > 10000) weiter(); }, 14000); }

  /* ---------- Feiern ---------- */
  function kachel(id) { return document.querySelector('.st-tile[data-id="' + id + '"]'); }
  function sterne(el, n) {
    if (ruhig || !el) return;
    var r = el.getBoundingClientRect(), farben = ['#F2C14E', '#3FC1A5', '#ffffff', '#5fdc9a'];
    for (var i = 0; i < n; i++) {
      var st = document.createElement('i'); st.className = 'film-stern';
      var w = Math.random() * Math.PI * 2, d = 30 + Math.random() * 50;
      st.style.left = (r.left + r.width / 2) + 'px'; st.style.top = (r.top + r.height / 2) + 'px';
      st.style.setProperty('--x', Math.cos(w) * d + 'px'); st.style.setProperty('--y', Math.sin(w) * d + 'px'); st.style.setProperty('--c', farben[i % 4]);
      document.body.appendChild(st); setTimeout(st.remove.bind(st), 800);
    }
  }
  function konfetti() {
    if (ruhig) return;
    var farben = ['#F2C14E', '#3FC1A5', '#E5484D', '#ffffff', '#5fdc9a'];
    for (var i = 0; i < 36; i++) {
      var k = document.createElement('i'); k.className = 'st-konfetti';
      k.style.left = Math.random() * 100 + 'vw'; k.style.background = farben[i % 5];
      k.style.setProperty('--x', (Math.random() * 120 - 60) + 'px'); k.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(k); setTimeout(k.remove.bind(k), 2600);
    }
  }

  /* ---------- Live-Ereignisse: Gewinnmarke, Führungswechsel, Rekord ---------- */
  function ereignisse() {
    var mit = topf.map(function (p) { return { p: p, v: pr(p), t: titel(p), l: lage(p) }; }).filter(function (x) { return x.v != null; });
    if (!mit.length) return;
    var s = stand(), neu = false;
    mit.forEach(function (x) {
      if (R3.letzte[x.p.id] !== 'ziel' && x.l === 'ziel') {
        sag('jubel', x.t + ' hat +30 % erreicht! Deine Regel: Hälfte als Gewinn markieren. Du entscheidest.');
        brr([30, 60, 30, 60, 80]); sterne(kachel(x.p.id), 12); konfetti(); neu = true;
      }
      R3.letzte[x.p.id] = x.l;
    });
    if (mit.length > 1) {
      var best = mit.slice().sort(function (a, b) { return b.v - a.v; })[0];
      if (R3.fuehrer && R3.fuehrer !== best.t && !neu) { sag('jubel', 'Führungswechsel! ' + best.t + ' übernimmt mit ' + proz(best.v) + '.'); sterne(kachel(best.p.id), 8); brr(20); neu = true; }
      R3.fuehrer = best.t;
    }
    if (R3.max != null && s.wert > R3.max + 0.01 && s.chf > 0 && !neu) { sag('jubel', 'Neuer Höchststand! Dein Topf steht bei ' + chf(s.wert) + '.'); sterne($('topfWert'), 12); brr([20, 40, 20]); }
    if (R3.max == null || s.wert > R3.max) R3.max = s.wert;
    r3Save();
  }
  function nachAenderung(hopsId) { grenzenPruefen(); zeichnen(hopsId); ereignisse(); var l = $('topfListe'); if (l) l.dispatchEvent(new Event('change', { bubbles: true })); abgleichen(); }

  /* ---------- Eintragen / Ändern: Bottom Sheet ---------- */
  var sheet, scrim, editId = null, loeschBereit = false;
  function sheetBauen() {
    scrim = document.createElement('div'); scrim.className = 'st-scrim'; scrim.hidden = true; scrim.id = 'stScrim';
    sheet = document.createElement('form'); sheet.className = 'st-sheet'; sheet.id = 'stSheet'; sheet.hidden = true; sheet.noValidate = true; sheet.autocomplete = 'off';
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'stTitel');
    sheet.innerHTML = '<div class="st-griff" aria-hidden="true"></div><button type="button" class="st-zu" id="stZu" aria-label="Schliessen">×</button>' +
      '<h3 id="stTitel">Titel</h3><p class="st-hint">Was du bei Yuh gekauft hast. Spielgeld, kein Rat.</p>' +
      '<div class="st-felder">' +
      '<label>Kürzel<input id="stSym" placeholder="z. B. AAPL" autocapitalize="characters" autocomplete="off" spellcheck="false" maxlength="15" enterkeyhint="next"></label>' +
      '<label>Name (freiwillig)<input id="stName" maxlength="40" autocomplete="off" placeholder="z. B. Apple" enterkeyhint="next"></label>' +
      '<label>Betrag CHF<input id="stEin" inputmode="decimal" autocomplete="off" placeholder="50"></label>' +
      '<label>Kaufkurs<input id="stKauf" inputmode="decimal" autocomplete="off" placeholder="steht in Yuh"></label>' +
      '<label>Kurs jetzt<input id="stJetzt" inputmode="decimal" autocomplete="off" placeholder="von Hand"></label>' +
      '<label>Verlustgrenze %<input id="stGrenze" inputmode="decimal" autocomplete="off" placeholder="15"></label>' +
      '<details class="st-mehr-felder"><summary>Mehr: Börse, Datum, Stück</summary><div class="st-felder">' +
      '<label>Börse<select id="stBoerse"><option>Yuh</option><option>Swissquote</option><option>PostFinance</option><option>neon</option><option>Andere</option></select></label>' +
      '<label>Datum<input id="stDatum" type="date"></label>' +
      '<label>Stück (freiwillig)<input id="stStueck" inputmode="decimal" autocomplete="off" placeholder="—"></label>' +
      '</div></details></div>' +
      '<p class="st-fehler" id="stFehler" role="alert"></p><p class="st-vorschau" id="stVorschau" aria-live="polite"></p>' +
      '<div class="st-knoepfe"><button type="button" class="btn ghost" id="stLoeschen">Löschen</button><button type="submit" class="btn pri" id="stOk">Speichern</button></div>';
    document.body.appendChild(scrim); document.body.appendChild(sheet);
    scrim.addEventListener('click', zu); $('stZu').addEventListener('click', zu);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('auf')) zu(); });
    // Nach unten wischen schliesst das Blatt (wie bei iOS)
    var y0 = null;
    sheet.addEventListener('touchstart', function (e) { y0 = sheet.scrollTop <= 0 && !e.target.closest('input,select') ? e.touches[0].clientY : null; }, { passive: true });
    sheet.addEventListener('touchmove', function (e) { if (y0 == null) return; var dy = e.touches[0].clientY - y0; if (dy > 0) { sheet.style.transition = 'none'; sheet.style.transform = 'translateY(' + dy + 'px)'; } }, { passive: true });
    sheet.addEventListener('touchend', function (e) { if (y0 == null) return; var dy = e.changedTouches[0].clientY - y0; y0 = null; sheet.style.transition = ''; sheet.style.transform = ''; if (dy > 90) zu(); });
    ['stSym', 'stEin', 'stKauf', 'stJetzt', 'stGrenze'].forEach(function (id) { $(id).addEventListener('input', vorschau); });
    sheet.addEventListener('submit', function (e) { e.preventDefault(); uebernehmen(); });
    $('stLoeschen').addEventListener('click', function () {
      var p = topf.find(function (x) { return x.id === editId; }); if (!p) return;
      if (!loeschBereit) { loeschBereit = true; $('stLoeschen').textContent = 'Wirklich löschen?'; brr(10); return; }
      topf = topf.filter(function (x) { return x !== p; }); delete R3.letzte[p.id]; r3Save();
      speichern(); zu(); nachAenderung(); sag('denk', titel(p) + ' ist aus dem Topf. Alles gut, du entscheidest.');
    });
  }
  function vorschau() {
    var kauf = zahl($('stKauf').value), jetzt = zahl($('stJetzt').value), g = zahl($('stGrenze').value) || 15, ein = zahl($('stEin').value) || 0;
    var t = [];
    if (kauf) t.push('Verlustgrenze bei <b>' + kurs(kauf * (1 - g / 100)) + '</b> · Gewinnmarke bei <b>' + kurs(kauf * 1.3) + '</b>');
    if (kauf && jetzt && ein) t.push('Jetzt ' + proz((jetzt / kauf - 1) * 100) + ' · ' + chf(ein * jetzt / kauf));
    if (ein && ein < 50) t.push('<span style="color:var(--orange)">Unter CHF 50 frisst die Mindestgebühr viel weg.</span>');
    var alt = topf.find(function (x) { return x.id === editId; });
    if (alt && alt.kauf && g > alt.grenze) t.push('<span style="color:var(--orange)">Deine Regel: die Grenze nie nach unten schieben.</span>');
    $('stVorschau').innerHTML = t.join('<br>');
  }
  function auf(i) {
    var p = i >= 0 ? topf[i] : null; editId = p ? p.id : null; loeschBereit = false;
    $('stTitel').textContent = p ? titel(p) : 'Titel ' + (topf.length + 1) + ' eintragen';
    $('stSym').value = p ? p.symbol : ''; $('stName').value = p && p.name !== p.symbol ? p.name : '';
    $('stEin').value = p ? String(p.einsatz) : '50';
    $('stKauf').value = p && p.kauf != null ? String(p.kauf) : ''; $('stJetzt').value = p && p.jetzt != null ? String(p.jetzt) : '';
    $('stGrenze').value = p ? String(p.grenze) : '15';
    $('stBoerse').value = p ? p.boerse : 'Yuh'; if (!$('stBoerse').value) $('stBoerse').value = 'Andere';
    $('stDatum').value = p ? (p.datum || '') : heute(); $('stStueck').value = p && p.stueck != null ? String(p.stueck) : '';
    $('stLoeschen').hidden = !p; $('stLoeschen').textContent = 'Löschen'; $('stLoeschen').parentNode.style.gridTemplateColumns = p ? '' : '1fr';
    $('stFehler').textContent = '';
    vorschau();
    scrim.hidden = false; sheet.hidden = false; sheet.scrollTop = 0; void sheet.offsetWidth;
    scrim.classList.add('auf'); sheet.classList.add('auf');
    document.documentElement.style.overflow = 'hidden';
    brr(10);
    if (!p) setTimeout(function () { try { $('stSym').focus({ preventScroll: true }); } catch (e) {} }, ruhig ? 0 : 320);
  }
  function zu() {
    if (!sheet.classList.contains('auf')) return;
    sheet.classList.remove('auf'); scrim.classList.remove('auf'); document.documentElement.style.overflow = '';
    if (document.activeElement && sheet.contains(document.activeElement)) document.activeElement.blur();
    setTimeout(function () { if (!sheet.classList.contains('auf')) { sheet.hidden = true; scrim.hidden = true; } }, ruhig ? 0 : 330);
  }
  function uebernehmen() {
    var sym = $('stSym').value.trim().toUpperCase().replace(/[^A-Z0-9.:\-]/g, ''), name = $('stName').value.trim();
    var betrag = zahl($('stEin').value), gr = zahl($('stGrenze').value);
    var err = !sym && !name ? 'Bitte ein Kürzel oder einen Namen eintragen.' : !(betrag > 0) ? 'Bitte den Betrag in CHF eintragen.' : gr != null && !(gr > 0 && gr < 100) ? 'Die Verlustgrenze liegt zwischen 0 und 100 %.' : '';
    if (err) { $('stFehler').textContent = err; brr([40, 40, 40]); return; }
    var alt = topf.find(function (x) { return x.id === editId; });
    var p = aufraeumen({ id: editId || null, name: name || sym, symbol: sym, boerse: $('stBoerse').value, einsatz: betrag, kauf: $('stKauf').value, jetzt: $('stJetzt').value, datum: $('stDatum').value, stueck: $('stStueck').value, grenze: gr || 15 });
    if (alt) { p.gepingt = alt.gepingt && alt.grenze === p.grenze; p.live = alt.live && alt.jetzt === p.jetzt; topf[topf.indexOf(alt)] = p; } else topf.push(p);
    speichern(); zu(); nachAenderung(p.id);
    var t = kachel(p.id);
    if (!alt) {
      sterne(t, 12); brr([15, 40, 15]);
      var n = topf.length;
      if (n === PLAETZE && !R3.alle) { R3.alle = true; r3Save(); konfetti(); sag('jubel', 'Alle vier im Spiel! Vorhang auf, jetzt wird’s spannend.'); }
      else sag('jubel', titel(p) + ' ist im Spiel. ' + (n < PLAETZE ? 'Noch ' + (PLAETZE - n) + ', dann ist der Topf voll.' : 'Jetzt wird’s spannend.'));
      if (p.symbol && kursOk) holen(false);
    } else sag('', titel(p) + ' ist gespeichert.' + (p.kauf ? ' Grenze bei ' + kurs(p.kauf * (1 - p.grenze / 100)) + '.' : ' Mit dem Kaufkurs rechne ich mit.'));
  }

  /* ---------- Sicherung als Text ---------- */
  function sicherung() {
    $('tpExport').addEventListener('click', function () {
      var t = 'TRADEPING-SICHERUNG ' + heute() + '\n' + JSON.stringify(topf.map(function (p) { var c = {}; for (var k in p) if (k !== 'live') c[k] = p[k]; return c; }));
      $('tpText').value = t; $('tpText').select();
      var nein = function () { $('tpSichInfo').textContent = 'Der Text steht oben. Bitte von Hand kopieren und in Notizen sichern.'; };
      try { navigator.clipboard.writeText(t).then(function () { $('tpSichInfo').textContent = 'Kopiert. In Notizen einfügen und aufbewahren.'; }, nein); } catch (e) { nein(); }
    });
    $('tpImport').addEventListener('click', function () {
      var t = $('tpText').value, i = t.indexOf('['), daten = null;
      try { daten = JSON.parse(i >= 0 ? t.slice(i) : t); } catch (e) {}
      if (daten && !Array.isArray(daten) && Array.isArray(daten.titel)) daten = daten.titel;
      var neu = Array.isArray(daten) ? daten.map(aufraeumen).filter(Boolean) : [];
      if (!neu.length) { $('tpSichInfo').textContent = 'Das sieht nicht wie eine TradePing-Sicherung aus. Bitte den ganzen Export-Text einfügen.'; return; }
      topf = neu; speichern(); nachAenderung();
      $('tpSichInfo').textContent = neu.length + ' Titel eingelesen.';
    });
  }

  /* ---------- Kurse vom eigenen Server (Schlüssel bleibt dort). Klappt es nicht: freundlich, Kurs von Hand. ---------- */
  var SERVER = 'https://sense-179-237-127-58.sslip.io/kursping', kursOk = false, kursFehler = 0;
  function holen(vonHand) {
    var s = topf.map(function (p) { return p.symbol; }).filter(Boolean), info = $('tpKursInfo');
    if (!s.length) { if (vonHand) info.textContent = 'Kein Kürzel eingetragen. Kurs jetzt bitte von Hand eintragen.'; return; }
    if (document.hidden) return;
    if (vonHand) info.textContent = 'Kurse werden abgerufen …';
    var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
    fetch(SERVER + '/kurse?s=' + encodeURIComponent(s.join(',')), ctl ? { cache: 'no-store', signal: ctl.signal } : { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('HTTP'); return r.json(); }).then(function (k) {
      clearTimeout(to); var n = 0, neu = false;
      topf.forEach(function (p) { if (p.symbol && k && typeof k[p.symbol] === 'number') { if (p.jetzt !== k[p.symbol]) neu = true; p.jetzt = k[p.symbol]; p.live = true; n++; } });
      kursOk = true; kursFehler = 0;
      info.textContent = n ? n + ' Kurs' + (n === 1 ? '' : 'e') + ' abgerufen, ' + new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }) + '. Von Hand ändern geht immer.' : 'Für deine Kürzel kam kein Kurs. Bitte von Hand eintragen.';
      if (n) { speichern(); if (neu) nachAenderung(); else zeichnen(); }
    }).catch(function () {
      clearTimeout(to); kursFehler++;
      info.textContent = 'Live-Kurse brauchen Verbindung. Tipp auf einen Titel und trag den Kurs von Hand ein, das geht immer.';
    });
  }
  function pingId() { try { return localStorage.getItem('tp.pingId'); } catch (e) { return null; } }
  function titelListe() { return topf.filter(function (p) { return p.symbol; }).map(function (p) { return { symbol: p.symbol, name: p.name, kauf: p.kauf, grenze: p.grenze }; }); }
  function abgleichen() {
    var id = pingId(); if (!id) return;
    fetch(SERVER + '/abo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id, titel: titelListe() }) }).catch(function () {});
  }
  function b64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function pingKnopf() {
    var knopf = $('pingAn'), status = $('pingStatus'); if (!knopf) return;
    function zeigeAn() { if (pingId()) { knopf.textContent = '🔔 Ping ist an · Probe senden'; knopf.classList.add('an'); } }
    zeigeAn();
    knopf.addEventListener('click', function () {
      var id = pingId();
      if (id) {
        status.textContent = 'Probe-Ping ist unterwegs …';
        fetch(SERVER + '/test?id=' + id, { method: 'POST' }).then(function (r) { status.textContent = r.ok ? 'Probe-Ping gesendet.' : 'Der Server kennt dieses Handy nicht mehr. Bitte neu einschalten.'; if (r.status === 404) { try { localStorage.removeItem('tp.pingId'); } catch (e) {} knopf.textContent = '🔔 Ping aufs Handy einschalten'; knopf.classList.remove('an'); } }).catch(function () { status.textContent = 'Mr. Pings Server schläft gerade. Später nochmals tippen.'; });
        return;
      }
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !window.Notification) {
        status.textContent = 'Auf dem iPhone geht der Ping, wenn du TradePing über das Symbol auf dem Home-Bildschirm öffnest.'; return;
      }
      status.textContent = 'Einen Moment …';
      Notification.requestPermission().then(function (erlaubt) {
        if (erlaubt !== 'granted') throw new Error('Mitteilungen sind noch aus. In den iPhone-Einstellungen bei «Mitteilungen» erlauben.');
        return Promise.all([navigator.serviceWorker.register('sw.js').then(function () { return navigator.serviceWorker.ready; }), fetch(SERVER + '/vapid').then(function (r) { return r.json(); })]);
      }).then(function (x) {
        return x[0].pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(x[1].key) });
      }).then(function (sub) {
        return fetch(SERVER + '/abo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sub: sub.toJSON(), titel: titelListe() }) }).then(function (r) { if (!r.ok) throw new Error('Der Server sagt gerade nein (' + r.status + '). Später nochmals.'); return r.json(); });
      }).then(function (a) {
        try { localStorage.setItem('tp.pingId', a.id); } catch (e) {}
        zeigeAn(); status.textContent = 'Eingeschaltet. Ein Probe-Ping kommt gleich.'; brr([15, 40, 15]);
        return fetch(SERVER + '/test?id=' + a.id, { method: 'POST' });
      }).catch(function (e) { status.textContent = (e && e.message && !/fetch|network/i.test(e.message)) ? e.message : 'Mr. Pings Server schläft gerade. Später nochmals tippen.'; });
    });
  }
  function glocke() {
    var gl = $('pingGlocke'); if (!gl) return;
    gl.addEventListener('click', function () {
      gl.classList.remove('klingelt'); void gl.offsetWidth; gl.classList.add('klingelt'); brr(30);
      try {
        var ac = new (window.AudioContext || window.webkitAudioContext)(), t = ac.currentTime;
        [1318, 1975].forEach(function (f, i) {
          var o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; o.type = 'sine';
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25 / (i + 1), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 1.3);
        });
      } catch (e) {}
    });
  }

  /* ---------- Start ---------- */
  function start() {
    sheetBauen();
    grenzenPruefen(); zeichnen();
    setTimeout(function () { $('topfListe').classList.remove('st-erst'); }, 900);
    $('topfListe').addEventListener('click', function (e) {
      var t = e.target.closest('.st-tile'); if (!t) return;
      if (t.dataset.neu) auf(-1); else auf(topf.findIndex(function (p) { return p.id === t.dataset.id; }));
    });
    $('tpNeu').addEventListener('click', function () { auf(-1); });
    $('tpKurseHolen').addEventListener('click', function () { holen(true); });
    sicherung();
    // Mr. Pings Szene sitzt direkt über dem Topf: er spricht, der Topf ist gleich darunter.
    var szene = document.querySelector('.mp-szene'), topfEl = $('topf');
    if (szene && topfEl) topfEl.parentNode.insertBefore(szene, topfEl);
    // Der Topf reist im Link mit zur Bühne (auch über den Nova-Knopf), damit Mr. Ping ihn kennt.
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="reden.html"]'); if (!a) return;
      var basis = a.getAttribute('href').split('#')[0];
      a.setAttribute('href', basis + '#topf=' + encodeURIComponent(JSON.stringify(topf)));
    }, true);
    var rz = 0; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { zeichnen(); }, 150); });
    pingKnopf(); glocke();
    holen(false);
    // Nur weiter automatisch abrufen, wenn die Quelle erreichbar ist (sonst keine wiederholten Fehlversuche).
    setInterval(function () { if (kursOk && kursFehler < 3) holen(false); }, 60000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && kursOk) holen(false); });
    // Erster Satz: spannend, kurz, mit einem klaren nächsten Schritt.
    setTimeout(function () { if (!$('mp2WillOk')) weiter(); }, 900);
    takt();
    window.__spieltopf = { topf: function () { return topf; }, oeffnen: auf, sag: weiter };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
