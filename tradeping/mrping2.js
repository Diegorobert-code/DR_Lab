/* TradePing – Runde 2 (19.10.2026)
   Aus den Threads «Börse während der Ferien» und «Börse heute»:
   «Wie sieht die Börse heute aus?» (Mr. Ping fasst zusammen, mit Server freier),
   Aufteilungs-Rechner (1, 2 oder 4 Titel: Gebühren, Break-even, Regel mind. CHF 50),
   Ping-Plan 15:35 / 18:35 / 21:35 (Mr. Ping zeigt die Tafel, solange die App offen ist),
   Termine der Woche (Zahlen, Teuerung …) mit Erinnerung am Vortag,
   Kaufdaten zum Weitergeben (Titel, Einsatz, Kaufkurs), Willkommen beim ersten Start,
   Tinko-Posen als Bilder (posen/<pose>.jpg + posen/posen.json).
   Keine Anlageberatung: Mr. Ping rechnet und erinnert, kaufen tut nur Diego. */
(function () {
  'use strict';
  var M = window.__mrping; if (!M) return;
  var $ = function (id) { return document.getElementById(id); };
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function zahl(v) { if (v == null) return null; v = String(v).replace(/['’\s]/g, '').replace(',', '.'); var n = parseFloat(v); return isFinite(n) ? n : null; }
  function proz(v) { if (v == null || !isFinite(v)) return '—'; return (Math.abs(v) < 0.05 ? '±' : v > 0 ? '+' : '−') + Math.abs(v).toFixed(1).replace('.', ',') + ' %'; }
  function chf(v) { return (v < 0 ? '−' : '') + 'CHF ' + Math.abs(v).toFixed(2); }
  function heute() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function datumCH(s) { return s ? s.slice(8, 10) + '.' + s.slice(5, 7) + '.' : ''; }
  function tageBis(s) { return Math.round((new Date(s + 'T12:00') - new Date(heute() + 'T12:00')) / 864e5); }
  var K2 = 'tp.runde2';
  var R = load(K2, { willkommen: false, plan: true, planGezeigt: {}, termine: [], erinnert: {} });
  function r2Save() { save(K2, R); }
  function zaehl(k) { var l = M.lern(); if (!l) return; l[k] = (l[k] || 0) + 1; M.lernSave(); }

  var css = document.createElement('style');
  css.textContent = [
    '.mp2-tabelle{width:100%;border-collapse:collapse;font-size:14px;margin-top:8px}',
    '.mp2-tabelle th,.mp2-tabelle td{text-align:right;padding:6px 4px;border-top:1px solid var(--line)}',
    '.mp2-tabelle th:first-child,.mp2-tabelle td:first-child{text-align:left}',
    '.mp2-tabelle .ok{color:#86d39a}.mp2-tabelle .no{color:#ffa36e}',
    '.mp2-termin{display:flex;justify-content:space-between;gap:8px;align-items:center;border-top:1px solid var(--line);padding:8px 0;font-size:14px}',
    '.mp2-termin span{min-width:0;overflow-wrap:anywhere}',
    '.mp2-termin button{min-height:44px;min-width:44px}',
    '.mp2-heute{white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.45;overflow-x:auto}',
    '.mp2-will{position:fixed;inset:0;z-index:2147483000;background:rgba(5,10,30,.84);display:grid;place-items:center;padding:16px}',
    '.mp2-will>div{max-width:420px;width:100%;background:var(--card);border:1px solid var(--line);border-radius:22px;padding:20px 18px;text-align:center}',
    '.mp2-will img{width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid #F2C14E}',
    '.mp2-will h2{margin:10px 0 6px;font-size:22px}',
    '.mp2-will ul{text-align:left;padding-left:18px;margin:10px 0;font-size:15px}',
    '.mp2-will{opacity:0;transition:opacity .26s ease}.mp2-will.da{opacity:1}',
    '.mp2-will>div{transform:translateY(16px) scale(.97);transition:transform .4s cubic-bezier(.22,.8,.26,1);background:linear-gradient(160deg,rgba(28,46,96,.95),rgba(10,22,48,.97));border-color:rgba(245,196,81,.35);padding:24px 16px 16px}',
    '.mp2-will.da>div{transform:none}',
    '.mp2-will img{animation:mpHops .8s cubic-bezier(.3,1.6,.5,1) .25s both}',
    '.mp2-will p{margin:0 0 8px;font-size:17px;color:var(--ink)}.mp2-will .mp2-klein{font-size:14px;color:var(--muted);margin-bottom:16px}',
    '.mp2-will .btn{min-height:52px;font-size:17px}',
    '@media (prefers-reduced-motion:reduce){.mp2-will,.mp2-will>div{transition:none}.mp2-will img{animation:none}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- Tinko-Posen ---------- */
  var POSEN = [];
  fetch('posen/posen.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && Array.isArray(j.posen)) POSEN = j.posen.map(String); }).catch(function () {});
  window.MP_POSEBILD = function (name) {
    var img = document.querySelector('.mp-ava img'); if (!img) return;
    var n = name || 'ruhe', src = POSEN.indexOf(n) >= 0 ? 'posen/' + n + '.jpg' : 'figur-gross.jpg';
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
  };

  /* ---------- Börse heute: Mr. Ping fasst zusammen ---------- */
  var heuteK = M.karte('mpHeute', 'Wie sieht die Börse heute aus?', 'Mr. Ping fasst deine Titel und den Topf zusammen. Mit Server-Verbindung formuliert er frei. Keine Anlageberatung.',
    '<div class="mp-reihe"><button class="btn pri" type="button" id="mp2Heute">🔔 Mr. Ping, was läuft?</button><button class="btn ghost" type="button" id="mp2HeuteKopie">📋 Kopieren</button></div>' +
    '<div class="mp-ergebnis mp2-heute" id="mp2HeuteText" aria-live="polite">Tipp auf «Mr. Ping, was läuft?».</div>');
  function lokalUeberblick() {
    var d = M.tafelDaten(), t = d.t, z = d.zeilen.filter(function (x) { return x.d != null; });
    var us = M.boerse('America/New_York', 570, 960), ch = M.boerse('Europe/Zurich', 540, 1050);
    var teile = [];
    teile.push(us.offen ? 'Die US-Börse ist offen.' : ch.offen ? 'Die Schweizer Börse ist offen, New York öffnet um ' + us.um + '.' : 'Die Börsen sind gerade zu' + (us.um ? ', New York öffnet um ' + us.um : '') + '.');
    if (!z.length) teile.push('Noch keine Titel mit Kurs. Trag Titel im Spieltopf oder in der Watchlist ein, dann sage ich dir, was läuft.');
    else {
      var auf = z.slice().sort(function (a, b) { return b.d - a.d; })[0], ab = z.slice().sort(function (a, b) { return a.d - b.d; })[0];
      var ruhig = z.every(function (x) { return Math.abs(x.d) < 2; });
      teile.push(ruhig ? 'Alles ruhig, kein Titel bewegt sich um 2 % oder mehr.' : 'Auffällig: ' + z.filter(function (x) { return Math.abs(x.d) >= 2; }).map(function (x) { return x.sym + ' ' + proz(x.d); }).join(', ') + '.');
      if (auf && auf.d > 0) teile.push('Am stärksten: ' + auf.sym + ' ' + proz(auf.d) + '.');
      if (ab && ab.d < 0 && ab !== auf) teile.push('Am schwächsten: ' + ab.sym + ' ' + proz(ab.d) + '.');
      var regel = z.filter(function (x) { return x.regel; }); if (regel.length) teile.push('Regel erreicht bei ' + regel.map(function (x) { return x.sym + ' (' + x.regel + ')'; }).join(', ') + '. Ob du handelst, entscheidest du.');
    }
    if (t.ein) teile.push('Topf seit Start: ' + chf(t.seitStart) + (t.diff <= -25 ? '. Die Pause-Regel gilt.' : '.'));
    var bald = R.termine.filter(function (x) { var n = tageBis(x.datum); return n >= 0 && n <= 7; });
    if (bald.length) teile.push('Diese Woche: ' + bald.map(function (x) { return datumCH(x.datum) + ' ' + x.was; }).join(', ') + '.');
    teile.push('Keine Anlageberatung, du entscheidest selbst.');
    return teile.join('\n');
  }
  function server() {
    try { var a = JSON.parse(localStorage.getItem('drlab-hermes-adresse') || '""'), k = JSON.parse(localStorage.getItem('drlab-hermes-passwort') || '""'); return /^https:\/\//.test(a || '') && k ? { a: String(a).replace(/\/+$/, ''), k: k } : null; } catch (e) { return null; }
  }
  function boerseHeute() {
    var box = $('mp2HeuteText'), lokal = lokalUeberblick();
    box.textContent = lokal; zaehl('ueberblick');
    M.pose('ping', 'Ich habe für dich hingeschaut.'); M.sprich(lokal.split('\n').slice(0, 3).join(' '));
    var s = server(); if (!s) return;
    var d = M.tafelDaten();
    var daten = { titel: d.zeilen.map(function (x) { return { sym: x.sym, veraenderung: x.d == null ? null : Math.round(x.d * 10) / 10, regel: x.regel || null }; }), topfProzent: d.t.ein ? Math.round(d.t.diff * 10) / 10 : null, termine: R.termine.slice(0, 5) };
    box.textContent = lokal + '\n\nMr. Ping denkt noch etwas nach …';
    var seele = (window.NOVA_SEELEN || {})['TradePing'] || '';
    fetch(s.a + '/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.k, 'X-Nova-App': 'TradePing' },
      body: JSON.stringify({ model: 'sense-engine', messages: [{ role: 'system', content: seele + ' Fasse den Börsentag für Diego ruhig in höchstens fünf kurzen Sätzen zusammen: zuerst Auffälliges, dann Ruhiges. Schweizer Schreibweise ohne ß. Keine Kauf- oder Verkaufsempfehlung, keine Anlageberatung. Ende mit «Du entscheidest selbst.»' }, { role: 'user', content: JSON.stringify(daten) }] }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { var t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; box.textContent = t || lokal; })
      .catch(function () { box.textContent = lokal + '\n\n(Server gerade nicht erreichbar, das war Mr. Pings eigener Überblick.)'; });
  }

  /* ---------- Aufteilungs-Rechner ---------- */
  var aufK = M.karte('mpAufteilung', 'Wie aufteilen?', 'Gleicher Topf, verschieden viele Titel: Was kosten die Gebühren hin und zurück, ab wann bist du im Plus? Regel: mindestens CHF 50 pro Titel.',
    '<div class="mp-felder"><label>Topf CHF<input id="mp2Topf" inputmode="decimal" placeholder="200"></label><label>Art<select id="mp2Art"><option value="usd">Aktien in USD</option><option value="chf">Aktien in CHF</option><option value="krypto">Krypto</option></select></label></div>' +
    '<div id="mp2Auf"></div>');
  function aufteilung() {
    var topfCHF = zahl($('mp2Topf').value) || (M.settings().topf > 0 ? M.settings().topf : 200), art = $('mp2Art').value;
    var zeilen = [1, 2, 4, 5].map(function (n) {
      var je = topfCHF / n, g = (M.gebuehr(je, art) * 2) * n, be = topfCHF ? g / topfCHF * 100 : 0, ok = je >= 50;
      return '<tr><td>' + n + ' × ' + Math.round(je) + '</td><td>' + chf(g) + '</td><td>' + proz(be) + '</td><td class="' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓' : 'unter 50') + '</td></tr>';
    });
    $('mp2Auf').innerHTML = '<table class="mp2-tabelle"><tr><th>Titel</th><th>Gebühren</th><th>Break-even</th><th>Regel</th></tr>' + zeilen.join('') + '</table>' +
      '<p class="note" style="margin:8px 0 0">Gerechnet mit den Yuh-Sätzen, bitte in der App nachprüfen.' + (topfCHF > 2000 ? ' Ab diesem Topf gilt zusätzlich: höchstens 5 % pro Titel.' : '') + ' Keine Anlageberatung.</p>';
  }

  /* ---------- Ping-Plan ---------- */
  var PLAN = [[15, 35], [18, 35], [21, 35]];
  var planK = M.karte('mpPlan', 'Ping-Plan', 'Wie in der Börsenwoche: um 15:35, 18:35 und 21:35 zeigt Mr. Ping die Tafel, solange TradePing offen ist. Bei geschlossener App übernimmt die Wache, sobald der Server läuft.',
    '<label class="mp-check"><input type="checkbox" id="mp2PlanOk"> <span>Ping-Plan einschalten</span></label><p class="note" id="mp2PlanNaechst" style="margin:6px 0 0"></p>');
  function naechsterPlan() {
    var d = new Date(), min = d.getHours() * 60 + d.getMinutes(), wt = d.getDay();
    if (wt >= 1 && wt <= 5) for (var i = 0; i < PLAN.length; i++) { var m = PLAN[i][0] * 60 + PLAN[i][1]; if (m > min) return 'heute ' + PLAN[i][0] + ':' + PLAN[i][1]; }
    return wt === 5 || wt === 6 ? 'Montag 15:35' : 'morgen 15:35';
  }
  function planPruefen() {
    $('mp2PlanOk').checked = !!R.plan;
    $('mp2PlanNaechst').textContent = R.plan ? 'Nächster Plan-Ping: ' + naechsterPlan() + '.' : 'Ausgeschaltet.';
    if (!R.plan) return;
    var d = new Date(), wt = d.getDay(); if (wt < 1 || wt > 5) return;
    var min = d.getHours() * 60 + d.getMinutes(), tag = heute();
    PLAN.forEach(function (p) {
      var m = p[0] * 60 + p[1], key = tag + ' ' + p[0];
      if (min >= m && min < m + 20 && !R.planGezeigt[key]) {
        R.planGezeigt = {}; R.planGezeigt[key] = 1; r2Save(); zaehl('planPing');
        var t = M.tafel();
        M.pose('ping', 'Plan-Ping ' + p[0] + ':' + p[1] + '. Die Tafel liegt bereit.');
        M.toast('Ping ' + p[0] + ':' + p[1] + ': Tafel ist bereit');
        var el = $('mpTafel'); if (el && t) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  /* ---------- Termine der Woche ---------- */
  var terminK = M.karte('mpTermineWoche', 'Termine der Woche', 'Zum Beispiel Quartalszahlen, US-Teuerung oder Zinsentscheid. Mr. Ping erinnert dich am Tag davor.',
    '<div id="mp2Termine"></div><div class="mp-felder"><label>Datum<input id="mp2TDatum" type="date"></label><label>Was<input id="mp2TWas" placeholder="z. B. Quartalszahlen" maxlength="60"></label></div>' +
    '<div class="mp-reihe"><button class="btn ghost" type="button" id="mp2TAdd">+ Termin</button></div>');
  function renderTermine() {
    R.termine = R.termine.filter(function (x) { return tageBis(x.datum) >= -1; }).sort(function (a, b) { return a.datum.localeCompare(b.datum); });
    $('mp2Termine').innerHTML = R.termine.map(function (x, i) { var n = tageBis(x.datum);
      return '<div class="mp2-termin"><span><b>' + datumCH(x.datum) + '</b> ' + esc(x.was) + ' · ' + (n === 0 ? 'heute' : n === 1 ? 'morgen' : n < 0 ? 'vorbei' : 'in ' + n + ' Tagen') + '</span><button class="btn ghost" type="button" data-tweg="' + i + '" aria-label="Termin entfernen">✕</button></div>'; }).join('') || '<p class="note" style="margin:0 0 8px">Noch keine Termine. Trag ein, was diese Woche zählt.</p>';
    var morgen = R.termine.filter(function (x) { return tageBis(x.datum) === 1 && !R.erinnert[x.datum + x.was]; });
    if (morgen.length) { morgen.forEach(function (x) { R.erinnert[x.datum + x.was] = 1; }); r2Save(); M.pose('denk', 'Morgen: ' + morgen.map(function (x) { return x.was; }).join(', ') + '. Gut, das im Kopf zu haben.'); }
  }

  /* ---------- Kaufdaten weitergeben ---------- */
  var kaufK = M.karte('mpKaufdaten', 'Kaufdaten weitergeben', 'Nach deinem Kauf bei Yuh: Titel, Einsatz und Kaufkurs als Text, z. B. für Claude im Thread. Mr. Ping richtet dann Grenzen und Pings ein.',
    '<div class="mp-reihe"><button class="btn ghost" type="button" id="mp2Kauf">📤 Kaufdaten teilen</button></div><p class="note" id="mp2KaufInfo" style="margin:6px 0 0"></p>');
  function kaufdaten() {
    var p = M.topf().filter(function (x) { return x.einsatz > 0; });
    if (!p.length) { $('mp2KaufInfo').textContent = 'Im Spieltopf steht noch kein Titel mit Einsatz.'; return; }
    var t = ['KAUFDATEN TradePing · ' + datumCH(heute()) + new Date().getFullYear()].concat(p.map(function (x) {
      return String(x.symbol || x.name || '?').toUpperCase() + ' · Einsatz CHF ' + x.einsatz + (x.kauf ? ' · Kaufkurs ' + x.kauf : ' · Kaufkurs fehlt') + (x.stueck ? ' · Stück ' + x.stueck : '');
    })).concat(['Bitte Grenzen (−15 %) und Ziel (+30 %) im Ping-Plan einrichten. Keine Anlageberatung.']).join('\n');
    M.kopieren(t, 'Kaufdaten kopiert', 'TradePing · Kaufdaten'); zaehl('kaufdaten');
  }

  /* ---------- Willkommen ---------- */
  function willkommen() {
    if (R.willkommen) return;
    var w = document.createElement('div'); w.className = 'mp2-will'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
    w.innerHTML = '<div><img src="figur-gross.jpg" alt="Mr. Ping"><h2>Guten Tag, ich bin Mr. Ping</h2><p>Dein Spieltopf: CHF 200, vier Titel. Trag sie ein, und ich fiebere mit dir mit.</p><p class="mp2-klein">Spielgeld, kein Rat. Kaufen tust nur du.</p><div class="mp-reihe"><button class="btn pri" type="button" id="mp2WillOk">Topf einrichten</button></div></div>';
    document.body.appendChild(w);
    requestAnimationFrame(function () { w.classList.add('da'); });
    $('mp2WillOk').onclick = function () {
      R.willkommen = true; r2Save(); w.classList.remove('da'); setTimeout(function () { w.remove(); }, 260);
      try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) {}
      var S = window.__spieltopf;
      if (S && S.topf().length < 4) { M.pose('jubel', 'Los geht’s! Erst das Kürzel, dann Betrag und Kaufkurs.'); setTimeout(function () { S.oeffnen(-1); }, 300); }
      else M.pose('jubel', 'Schön, dass du da bist. Ich halte Wache.');
    };
  }

  /* ---------- Offline ---------- */
  addEventListener('offline', function () { M.toast('Offline. Deine Marken bleiben gespeichert, Kurse kommen wieder, sobald du online bist.'); M.pose('schlaf', 'Keine Verbindung. Ich warte geduldig.'); });
  addEventListener('online', function () { M.toast('Wieder online'); });

  /* ---------- Einbauen ---------- */
  var tafel = $('mpTafel'), rech = $('mpRechner'), uhr = $('mpUhr');
  M.nach(tafel || uhr, heuteK); M.nach(uhr, planK); M.nach(planK, terminK);
  M.nach(rech, aufK); M.nach($('mpJournal') || aufK, kaufK);
  $('mp2Heute').onclick = boerseHeute;
  $('mp2HeuteKopie').onclick = function () { M.kopieren($('mp2HeuteText').textContent, 'Kopiert'); };
  $('mp2Topf').addEventListener('input', aufteilung); $('mp2Art').addEventListener('change', aufteilung);
  $('mp2PlanOk').addEventListener('change', function (e) { R.plan = e.target.checked; r2Save(); planPruefen(); });
  $('mp2TDatum').value = heute();
  $('mp2TAdd').onclick = function () { var d = $('mp2TDatum').value, w = $('mp2TWas').value.trim(); if (!d || !w) { M.toast('Datum und Was eintragen'); return; } R.termine.push({ datum: d, was: w }); r2Save(); $('mp2TWas').value = ''; renderTermine(); M.toast('Termin notiert'); };
  $('mp2Termine').addEventListener('click', function (e) { var b = e.target.closest('[data-tweg]'); if (!b) return; R.termine.splice(+b.dataset.tweg, 1); r2Save(); renderTermine(); });
  $('mp2Kauf').onclick = kaufdaten;
  aufteilung(); planPruefen(); renderTermine();
  setInterval(function () { if (!document.hidden) planPruefen(); }, 30000);
  setTimeout(willkommen, 2800);
})();
