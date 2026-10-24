/* Mr. Ping – der Trickfilm in TradePing.
   Szene mit Posen, Börsenuhr, Ping-Tafel (Diegos Grafik), Gebühren- und Chance-Rechner (Yuh),
   Journal mit Papier-Handel nach Regeln, Verlauf, Wochenbilanz, «Börse ruhig erklärt»
   und «Was Mr. Ping sich merkt». Alles bleibt auf diesem Handy (localStorage).
   Keine Anlageberatung: Mr. Ping zeigt nur Diegos eigene Regeln und Zahlen. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function zahl(v) { if (v == null) return null; v = String(v).replace(/['’\s]/g, '').replace(',', '.'); if (!v) return null; var n = parseFloat(v); return isFinite(n) ? n : null; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function tag(t) { var d = t ? new Date(t) : new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function datumCH(s) { if (!s) return ''; var d = new Date(s); return isNaN(d) ? String(s) : d.toLocaleDateString('de-CH', { day: 'numeric', month: 'numeric', year: '2-digit' }); }
  function hhmm(t) { var d = new Date(t); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  // Zahlen wie in Diegos Ping-Grafik: 83'610 · 356.0 · +1,9 %
  function kurs(v) { if (v == null || !isFinite(v)) return '—'; var a = Math.abs(v); if (a >= 1000) return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"); return a >= 10 ? v.toFixed(2).replace(/0$/, '') : v.toFixed(a >= 1 ? 2 : 4); }
  function proz(v, d) { if (v == null || !isFinite(v)) return '—'; var s = Math.abs(v) < 0.05 ? '±' : v > 0 ? '+' : '−'; return s + Math.abs(v).toFixed(d == null ? 1 : d).replace('.', ',') + ' %'; }
  function chf(v) { return (v < 0 ? '−' : '') + 'CHF ' + Math.abs(v).toFixed(2); }

  var K = { lern: 'tp.lernen', journal: 'tp.journal', tafel: 'tp.tafel', verlauf: 'tp.verlauf', mp: 'tp.mrping' };
  var KRYPTO = /^(BTC|ETH|SOL|ZEC|XRP|ADA|DOGE|DOT|LINK|AVAX|LTC|XMR|BNB|TRX)$/;
  var SERVER = 'https://sense-179-237-127-58.sslip.io/kursping';
  var opt = Object.assign({ spricht: false, schwelle: 0.5 }, load(K.mp, {}));

  /* ---------- Was Mr. Ping sich merkt (Lern-Zahlen, nur auf dem Gerät) ---------- */
  var lern = Object.assign({ tage: [], pings: 0, ruhe: 0, regeln: {}, titel: {}, tafeln: 0, rechner: 0, lexikon: {} }, load(K.lern, {}));
  function lernSave() { save(K.lern, lern); }
  (function () { var d = tag(); if (lern.tage.indexOf(d) < 0) { lern.tage.push(d); if (lern.tage.length > 120) lern.tage.shift(); lernSave(); } })();

  /* ---------- Daten aus TradePing lesen ---------- */
  function topf() { var t = load('tp.topf', []); return Array.isArray(t) ? t : []; }
  function items() { var i = load('tp.items', []); return Array.isArray(i) ? i : []; }
  function settings() { return load('tp.settings', {}) || {}; }
  function istKrypto(sym) { return KRYPTO.test(String(sym || '').toUpperCase()); }
  function wert(p) { return p.kauf && p.jetzt ? p.einsatz * p.jetzt / p.kauf : (p.einsatz || 0); }
  function topfStand() {
    var t = topf().filter(function (p) { return p.einsatz > 0; });
    var ein = t.reduce(function (a, p) { return a + p.einsatz; }, 0);
    var w = t.reduce(function (a, p) { return a + wert(p); }, 0);
    var geb = t.reduce(function (a, p) { return a + (p.kauf ? gebuehr(p.einsatz, istKrypto(p.symbol) ? 'krypto' : 'usd') : 0); }, 0);
    return { ein: ein, wert: w, diff: ein ? (w / ein - 1) * 100 : 0, gebuehr: geb, seitStart: w - ein - geb };
  }
  function preisVon(sym) {
    sym = String(sym || '').toUpperCase(); if (!sym) return null;
    var it = items().find(function (i) { return i.sym === sym && i.kind === 'crypto' && i.last; });
    if (it) return it.last.usd;
    var p = topf().find(function (x) { return String(x.symbol || '').toUpperCase() === sym && x.jetzt; });
    return p ? p.jetzt : null;
  }

  /* ---------- Yuh-Gebühren (Stand 17.10.2026, vor dem Kauf in der App prüfen) ---------- */
  // Aktie in USD: 0,5 % pro Order, mind. CHF 1, plus 0,95 % Wechsel. Aktie in CHF: ohne Wechsel. Krypto: ca. 1 %.
  function gebuehr(betrag, art) {
    if (!(betrag > 0)) return 0;
    if (art === 'krypto') return betrag * 0.01;
    var g = Math.max(1, betrag * 0.005);
    if (art === 'usd') g += betrag * 0.0095;
    return g;
  }

  /* ---------- Rüstung: Diegos Leitlinie ---------- */
  window.TP_RUESTUNG = window.TP_RUESTUNG || ['LMT', 'RTX', 'NOC', 'GD', 'LHX', 'HII', 'KTOS', 'AVAV', 'RHM', 'R3NK', 'HAG', 'SAAB', 'SAAB-B', 'BA.', 'LDO', 'HO', 'AM', 'CSG'];
  function ruestung(sym) { return window.TP_RUESTUNG.indexOf(String(sym || '').toUpperCase()) >= 0; }

  /* ---------- CSS ---------- */
  var css = [
    '.mp-szene{position:relative;display:flex;gap:12px;align-items:center;margin:-4px 0 16px;padding:12px 14px;border-radius:22px;background:linear-gradient(150deg,rgba(38,56,122,.75),rgba(10,22,48,.85));border:1px solid rgba(245,196,81,.35);overflow:hidden}',
    '.mp-ava{position:relative;flex:none;width:76px;height:76px}',
    '.mp-ava img{width:76px;height:76px;border-radius:50%;object-fit:cover;object-position:38% 26%;border:3px solid var(--gold);box-shadow:0 0 18px rgba(245,196,81,.45);transform-origin:50% 90%;animation:mpAtmen 4.6s ease-in-out infinite}',
    '.mp-ava .mp-glocke{position:absolute;right:-6px;bottom:-4px;font-size:22px;transform-origin:50% 10%}',
    '.mp-ava .mp-zz{position:absolute;right:-4px;top:-8px;font-size:16px;font-weight:800;color:#bfe3ff;opacity:0}',
    '.mp-blase{flex:1;min-width:0;font-size:15px;line-height:1.4;color:#f6efe0}',
    '.mp-blase b{display:block;color:var(--gold);font-size:13px;letter-spacing:.02em;margin-bottom:2px}',
    '.mp-blase span{display:block}',
    '.mp-gast{position:absolute;right:10px;top:10px;width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);opacity:0;transform:scale(.4);transition:.4s var(--ease)}',
    '.mp-gast.da{opacity:1;transform:none}',
    '.mp-szene.pose-ping .mp-ava img{animation:mpNick .9s ease-in-out 2}',
    '.mp-szene.pose-ping .mp-glocke{animation:mpGlocke .7s ease 3}',
    '.mp-szene.pose-jubel .mp-ava img{animation:mpHops .7s cubic-bezier(.3,1.6,.5,1) 3}',
    '.mp-szene.pose-warn{border-color:rgba(255,123,114,.6)}',
    '.mp-szene.pose-warn .mp-ava img{animation:mpWackel .5s ease 3;border-color:#ff7b72}',
    '.mp-szene.pose-schlaf .mp-ava img{transform:rotate(-8deg);animation:none;filter:saturate(.7) brightness(.85)}',
    '.mp-szene.pose-schlaf .mp-zz{animation:mpZz 2.4s ease-in-out infinite}',
    '.mp-szene.pose-denk .mp-ava img{animation:mpDenk 2.2s ease-in-out 2}',
    '.mp-muenze{position:absolute;top:-16px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff6c8,#f2c14e 55%,#b8902f);box-shadow:0 0 8px rgba(245,196,81,.8);animation:mpFall 1.6s ease-in forwards;pointer-events:none}',
    '@keyframes mpAtmen{50%{transform:scale(1.03) translateY(-2px)}}',
    '@keyframes mpNick{30%{transform:rotate(-7deg) translateY(-3px)}60%{transform:rotate(5deg)}}',
    '@keyframes mpGlocke{20%{transform:rotate(-24deg)}45%{transform:rotate(20deg)}70%{transform:rotate(-12deg)}90%{transform:rotate(6deg)}}',
    '@keyframes mpHops{30%{transform:translateY(-14px) scale(1.08) rotate(-4deg)}60%{transform:translateY(0) scale(.97) rotate(3deg)}}',
    '@keyframes mpWackel{25%{transform:translateX(-5px) rotate(-3deg)}75%{transform:translateX(5px) rotate(3deg)}}',
    '@keyframes mpZz{0%{opacity:0;transform:translate(0,4px)}40%{opacity:1}100%{opacity:0;transform:translate(8px,-14px)}}',
    '@keyframes mpDenk{50%{transform:rotate(6deg) translateX(2px)}}',
    '@keyframes mpFall{to{transform:translateY(130px) rotate(260deg);opacity:0}}',
    '.mp-karte{margin-top:26px;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:14px 16px}',
    '.mp-karte h2{margin:0 0 2px;font-size:17px;font-weight:700}',
    '.mp-karte .unter{margin:0 0 10px;color:var(--muted);font-size:13px}',
    '.mp-uhr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}',
    '.mp-uhr div{padding:10px 8px;border-radius:14px;border:1px solid var(--line);background:rgba(10,22,48,.6);text-align:center;min-width:0}',
    '.mp-uhr b{display:block;font-size:13px;color:var(--ink2)}',
    '.mp-uhr i{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--muted);margin-right:5px;vertical-align:1px}',
    '.mp-uhr .offen i{background:var(--green);box-shadow:0 0 8px var(--green)}',
    '.mp-uhr span{display:block;font-size:12px;color:var(--muted);margin-top:3px}',
    '.mp-tafel{margin:0;padding:12px;border-radius:14px;background:#050b1a;border:1px solid var(--line2);font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#dfe8fb;white-space:pre;overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}',
    '.mp-tafel .up{color:var(--green)}.mp-tafel .dn{color:var(--red)}.mp-tafel .pg{color:var(--gold);font-weight:700}',
    '.mp-reihe{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}',
    '.mp-reihe .btn{flex:1 1 140px;min-height:44px;font-size:14px}',
    '.mp-felder{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
    '.mp-felder label{display:block;font-size:12.5px;color:var(--ink2);font-weight:600;min-width:0}',
    '.mp-felder input,.mp-felder select,.mp-felder textarea{display:block;width:100%;margin-top:3px;min-height:44px;border-radius:11px;border:1px solid var(--line2);background:#081329;color:var(--ink);padding:8px 10px;font-size:16px;box-sizing:border-box}',
    '.mp-felder .ganz{grid-column:1/-1}',
    '.mp-ergebnis{margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(10,22,48,.7);border:1px solid var(--line);font-size:14px;color:var(--ink2)}',
    '.mp-ergebnis p{margin:0 0 4px}.mp-ergebnis p:last-child{margin:0}',
    '.mp-ok{color:var(--green);font-weight:700}.mp-no{color:var(--red);font-weight:700}',
    '.mp-trade{padding:10px 12px;border-radius:14px;border:1px solid var(--line);background:rgba(10,22,48,.6);margin-top:8px;font-size:14px;color:var(--ink2)}',
    '.mp-trade .k{display:flex;justify-content:space-between;gap:8px;align-items:center}',
    '.mp-trade .k b{color:var(--ink);font-size:15px}',
    '.mp-trade small{display:block;color:var(--muted);font-size:12px;margin-top:2px}',
    '.mp-trade .mp-reihe .btn{flex:1 1 100px}',
    '.mp-tag{font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 6px;border-radius:6px;background:rgba(127,146,182,.16);color:var(--ink2);margin-left:4px}',
    '.mp-tag.papier{background:var(--teal-l);color:#bff6ef}',
    '.mp-spark{display:block;width:100%;height:90px;margin-top:6px}',
    '.mp-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}',
    '.mp-seg button{min-height:44px;border-radius:11px;border:1px solid var(--line);background:none;font-size:14px;font-weight:600;color:var(--ink2)}',
    '.mp-seg button[aria-pressed="true"]{background:var(--gold-l);border-color:rgba(245,196,81,.5);color:#ffe3a1}',
    '.mp-lex details{border-top:1px solid var(--line);padding:4px 0}.mp-lex details:first-of-type{border-top:0}',
    '.mp-lex summary{min-height:44px;display:flex;align-items:center;font-weight:600;color:var(--ink);cursor:pointer;list-style:none}',
    '.mp-lex summary::-webkit-details-marker{display:none}',
    '.mp-lex summary::before{content:"🔔";margin-right:8px;font-size:14px}',
    '.mp-lex p{margin:0 0 10px;font-size:14px;color:var(--ink2)}',
    '.mp-check{display:flex;gap:10px;align-items:flex-start;margin:10px 0 4px;font-size:14px;color:var(--ink2)}',
    '.mp-check input{width:22px;height:22px;flex:none;margin-top:1px}',
    '.mp-pause{display:flex;gap:10px;align-items:center;margin:10px 0 0;padding:10px 12px;border-radius:14px;background:rgba(255,123,114,.12);border:1px solid rgba(255,123,114,.35);color:#ffd2cd;font-size:14px}',
    '.mp-pause img{width:44px;height:44px;border-radius:50%;object-fit:cover;flex:none;border:2px solid var(--gold)}',
    '.trade{min-height:44px!important}',
    '.wrap{padding-bottom:calc(var(--sab) + 120px)!important}',
    '@media (prefers-reduced-motion:reduce){.mp-ava img,.mp-szene[class*=pose-] .mp-ava img,.mp-glocke,.mp-zz{animation:none!important}.mp-muenze{display:none}}'
  ].join('\n');
  var st = document.createElement('style'); st.id = 'mrpingCss'; st.textContent = css; document.head.appendChild(st);

  function karte(id, titel, unter, inhalt) {
    var s = document.createElement('section'); s.className = 'mp-karte'; s.id = id; s.setAttribute('aria-label', titel);
    s.innerHTML = '<h2>' + titel + '</h2>' + (unter ? '<p class="unter">' + unter + '</p>' : '') + inhalt;
    return s;
  }
  function nach(ref, el) { if (ref && ref.parentNode) ref.parentNode.insertBefore(el, ref.nextSibling); }

  /* ---------- 1. Szene: Mr. Ping in Posen ---------- */
  var buehne = document.querySelector('.ping-buehne');
  var szene = document.createElement('section');
  szene.className = 'mp-szene'; szene.setAttribute('aria-live', 'polite'); szene.setAttribute('aria-label', 'Mr. Ping sagt');
  szene.innerHTML = '<div class="mp-ava"><img src="figur-gross.jpg" alt="Mr. Ping"><span class="mp-glocke" aria-hidden="true">🔔</span><span class="mp-zz" aria-hidden="true">Zz</span></div>' +
    '<div class="mp-blase"><b>Mr. Ping</b><span id="mpSatz">Guten Tag. Ich halte Wache.</span></div><img class="mp-gast" id="mpGast" alt="">';
  nach(buehne, szene);
  var poseT;
  function pose(name, satz, gast) {
    if (satz) $('mpSatz').textContent = satz;
    szene.className = 'mp-szene' + (name ? ' pose-' + name : '');
    if (window.MP_POSEBILD) window.MP_POSEBILD(name);
    var g = $('mpGast');
    if (gast) { g.src = gast.bild; g.alt = gast.name; g.classList.add('da'); } else g.classList.remove('da');
    clearTimeout(poseT);
    if (name && name !== 'schlaf' && name !== 'warn') poseT = setTimeout(function () { szene.className = 'mp-szene'; g.classList.remove('da'); if (window.MP_POSEBILD) window.MP_POSEBILD(''); }, 4200);
    if (name === 'jubel' && !ruhig) muenzen();
  }
  function muenzen() {
    for (var i = 0; i < 12; i++) {
      var m = document.createElement('i'); m.className = 'mp-muenze';
      m.style.left = (8 + Math.random() * 84) + '%'; m.style.animationDelay = (Math.random() * 0.6) + 's';
      szene.appendChild(m); setTimeout(m.remove.bind(m), 2400);
    }
  }
  function sprich(text) {
    if (!opt.spricht || !text) return;
    try { if (window.NovaStimme && window.NovaStimme.sprich) { window.NovaStimme.sprich(text); return; } } catch (e) {}
    if (!window.speechSynthesis) return;
    try {
      var u = new SpeechSynthesisUtterance(text);
      var v = speechSynthesis.getVoices().filter(function (x) { return /^de/i.test(x.lang); });
      var ch = v.find(function (x) { return /CH/i.test(x.lang); }) || v.find(function (x) { return /male|mann|yannick|markus|daniel/i.test(x.name); }) || v[0];
      if (ch) u.voice = ch; u.lang = ch ? ch.lang : 'de-CH'; u.rate = 0.95;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) {}
  }
  function grundSatz() {
    var s = settings(), t = topfStand(), now = Date.now();
    if (s.snooze && s.snooze > now) return ['schlaf', 'Ruhe-Modus. Pings landen still im Verlauf. Ich döse ein bisschen, die Marken behalte ich trotzdem im Auge.'];
    if (t.ein && t.diff <= -25) return ['warn', 'Der Topf ist 25 % im Minus. Deine Regel sagt: Pause bis nächsten Monat. Keine neuen Käufe, erst in Ruhe hinschauen.'];
    var us = boerse('America/New_York', 570, 960), ch = boerse('Europe/Zurich', 540, 1050);
    if (us.offen) return ['', 'Die US-Börse ist offen. Ich schaue für dich hin. Kein Ping heisst: alles ruhig.'];
    if (ch.offen) return ['', 'Die Schweizer Börse ist offen, New York öffnet um ' + us.um + '. Geduld ist die feinste Strategie.'];
    var h = new Date().getHours();
    if (h >= 22 || h < 6) return ['schlaf', 'Späte Stunde. Nachts kaufen wir nicht. Die Börse schläft, und du darfst es auch.'];
    return ['denk', 'Die Börsen sind zu. Gute Zeit, um Regeln zu prüfen und das Journal nachzutragen.'];
  }
  function grundPose() { var g = grundSatz(); pose(g[0], g[1]); }

  /* ---------- 2. Börsenuhr ---------- */
  function uhrIn(zone, d) {
    var p = {}; new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
    return { wd: wd, min: (parseInt(p.hour, 10) % 24) * 60 + parseInt(p.minute, 10) };
  }
  // offen = Mo–Fr zwischen auf und zu (Minuten Ortszeit). Feiertage kennt die Uhr nicht.
  function boerse(zone, auf, zu) {
    var now = new Date(), u = uhrIn(zone, now);
    var wk = u.wd >= 1 && u.wd <= 5, offen = wk && u.min >= auf && u.min < zu;
    var bis = 0, wd = u.wd, m = u.min;
    if (offen) bis = zu - m;
    else { for (var i = 0; i < 8 * 1440; i++) { m++; if (m >= 1440) { m = 0; wd = (wd + 1) % 7; } bis++; if (wd >= 1 && wd <= 5 && m === auf) break; } }
    var ziel = new Date(now.getTime() + bis * 60000);
    var um = ziel.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' });
    var tagAnders = tag(ziel) !== tag(now);
    if (tagAnders) um = ziel.toLocaleDateString('de-CH', { weekday: 'short', timeZone: 'Europe/Zurich' }) + ' ' + um;
    return { offen: offen, bis: bis, um: um };
  }
  function dauer(min) { var h = Math.floor(min / 60), m = min % 60; return h ? h + ' h ' + (m ? m + ' min' : '') : m + ' min'; }
  var uhr = karte('mpUhr', 'Börsenuhr', 'Schweizer Zeit. Feiertage kennt die Uhr nicht.',
    '<div class="mp-uhr" id="mpUhrBox"></div><p class="note" id="mpUhrTipp" style="margin:10px 0 0"></p>');
  function renderUhr() {
    var us = boerse('America/New_York', 570, 960), ch = boerse('Europe/Zurich', 540, 1050);
    function zelle(n, b) { return '<div class="' + (b.offen ? 'offen' : '') + '"><b><i></i>' + n + '</b><span>' + (b.offen ? 'offen, noch ' + dauer(b.bis) : 'öffnet ' + b.um) + '</span></div>'; }
    $('mpUhrBox').innerHTML = zelle('New York', us) + zelle('Zürich SIX', ch) + '<div class="offen"><b><i></i>Krypto</b><span>rund um die Uhr</span></div>';
    var h = new Date().getHours();
    $('mpUhrTipp').textContent = (h >= 22 || h < 6) ? 'Mr. Ping: Nachts kaufen wir nicht. Morgen mit klarem Kopf.' :
      us.offen ? 'Mr. Ping: Wenn du kaufst, dann mit Limit-Order statt Markt-Order. Und nur nach deinen Regeln.' :
      'Mr. Ping: Aktien-Orders laufen erst, wenn die Börse offen ist (New York ab ' + us.um + '). Krypto läuft sofort.';
  }

  /* ---------- 3. Ping-Tafel (Diegos Grafik) ---------- */
  var tafelK = karte('mpTafel', 'Ping-Tafel', 'Deine Grafik: eine Zeile pro Titel, ▲/▼, Veränderung, «PING» zuoberst, unten der Topf. Zum Kopieren für den Chat.',
    '<pre class="mp-tafel" id="mpTafelText" aria-label="Ping-Tafel"></pre>' +
    '<div class="mp-reihe"><button class="btn pri" type="button" id="mpTafelKopie">📋 Kopieren und merken</button><button class="btn ghost" type="button" id="mpTafelSprich">🔔 Mr. Ping liest vor</button></div>' +
    '<p class="note" id="mpTafelInfo" style="margin:8px 0 0"></p>');
  function tafelDaten() {
    var alt = load(K.tafel, null), zeilen = [], basis = alt ? 'seit ' + (tag(alt.t) === tag() ? hhmm(alt.t) : new Date(alt.t).toLocaleDateString('de-CH', { day: 'numeric', month: 'numeric' }) + ' ' + hhmm(alt.t)) : 'seit Kauf';
    var schon = {};
    topf().forEach(function (p) {
      var sym = String(p.symbol || p.name || '').toUpperCase().slice(0, 6); if (!sym || !p.jetzt) return;
      schon[sym] = 1;
      var ref = alt && alt.preise[sym] ? alt.preise[sym] : p.kauf, d = ref ? (p.jetzt / ref - 1) * 100 : null;
      var pr = p.kauf ? (p.jetzt / p.kauf - 1) * 100 : null;
      var regel = pr == null ? '' : pr <= -15 ? 'Grenze' : pr >= 30 ? 'Ziel' : '';
      zeilen.push({ sym: sym, p: p.jetzt, d: d, ping: (d != null && Math.abs(d) >= opt.schwelle) || !!regel, regel: regel });
    });
    items().forEach(function (it) {
      if (schon[it.sym] || it.kind !== 'crypto' || !it.last) return;
      var p = it.cur === 'CHF' ? it.last.chf : it.last.usd; if (p == null) return;
      var ref = alt && alt.preise[it.sym], d = ref ? (p / ref - 1) * 100 : it.last.chg;
      var hit = (it.over != null && p >= it.over) || (it.under != null && p <= it.under);
      zeilen.push({ sym: it.sym, p: p, d: d, ping: (d != null && Math.abs(d) >= opt.schwelle) || hit, regel: hit ? 'Marke' : '', h24: !ref });
    });
    zeilen.sort(function (a, b) { return (b.ping - a.ping) || (Math.abs(b.d || 0) - Math.abs(a.d || 0)); });
    return { zeilen: zeilen, basis: basis, t: topfStand() };
  }
  function tafelText(html) {
    var x = tafelDaten(), out = [];
    function e(s) { return html ? esc(s) : s; }
    out.push(e('Ping ' + hhmm(Date.now()) + ' (' + x.basis + ')'));
    if (!x.zeilen.length) out.push(e('Noch keine Kurse. Trag im Spieltopf Kürzel und'), e('Kaufkurs ein oder füge Krypto zur Watchlist hinzu.'));
    x.zeilen.forEach(function (z) {
      var pf = z.d == null ? ' ' : z.d >= 0.05 ? '▲' : z.d <= -0.05 ? '▼' : '=';
      var links = (z.ping ? 'PING ' : '     ') + pf + ' ' + (z.sym + '     ').slice(0, 5) + ' ' + (kurs(z.p) + '         ').slice(0, 8) + ' ' + proz(z.d) + (z.h24 ? ' 24h' : '') + (z.regel ? '  ' + z.regel : '');
      if (!html) { out.push(links); return; }
      var cls = z.ping ? 'pg' : z.d > 0 ? 'up' : z.d < 0 ? 'dn' : '';
      out.push('<span class="' + cls + '">' + esc(links) + '</span>');
    });
    if (x.t.ein) out.push(e('Topf seit Start: ' + chf(x.t.seitStart)));
    return out.join('\n');
  }
  function renderTafel() {
    $('mpTafelText').innerHTML = tafelText(true);
    var alt = load(K.tafel, null);
    $('mpTafelInfo').textContent = 'PING ab ' + String(opt.schwelle).replace('.', ',') + ' % Bewegung oder bei einer Regel. ' + (alt ? 'Verglichen mit deiner letzten gemerkten Tafel.' : 'Verglichen mit dem Kaufkurs (Krypto: 24 Stunden).') + ' «Topf seit Start» ist nach Kaufgebühren gerechnet. Keine Anlageberatung.';
  }
  function tafelMerken() {
    var preise = {}; tafelDaten().zeilen.forEach(function (z) { preise[z.sym] = z.p; });
    save(K.tafel, { t: Date.now(), preise: preise }); lern.tafeln++; lernSave();
  }

  /* ---------- 4. Vor dem Kauf: Gebühren und Chance ---------- */
  var rechner = karte('mpRechner', 'Vor dem Kauf prüfen', 'Rechnet mit den Yuh-Gebühren (0,5 %, mind. CHF 1, plus 0,95 % Wechsel bei USD, Krypto ca. 1 %). Bitte in der Yuh-App nachprüfen. Mr. Ping rechnet nur, du entscheidest.',
    '<div class="mp-felder">' +
    '<label>Einsatz CHF<input id="mpEin" inputmode="decimal" value="100"></label>' +
    '<label>Art<select id="mpArt"><option value="usd">Aktie in USD</option><option value="chf">Aktie in CHF</option><option value="krypto">Krypto</option></select></label>' +
    '<label>Verlustgrenze %<input id="mpStop" inputmode="decimal" value="15"></label>' +
    '<label>Ziel %<input id="mpZiel" inputmode="decimal" value="30"></label>' +
    '<label class="ganz">Kürzel (freiwillig)<input id="mpSym" autocapitalize="characters" autocomplete="off" maxlength="12" placeholder="Kürzel"></label>' +
    '</div><div class="mp-ergebnis" id="mpRechnung" aria-live="polite"></div>' +
    '<div class="mp-reihe"><button class="btn ghost" type="button" id="mpInsJournal">📒 Als Trade ins Journal</button></div>');
  function rechne() {
    var ein = zahl($('mpEin').value) || 0, art = $('mpArt').value, stop = Math.abs(zahl($('mpStop').value) || 0), ziel = Math.abs(zahl($('mpZiel').value) || 0);
    var sym = String($('mpSym').value || '').toUpperCase().trim();
    if (sym && istKrypto(sym) && art !== 'krypto') { $('mpArt').value = art = 'krypto'; }
    var hin = gebuehr(ein, art), zur = gebuehr(ein * (1 + 0), art), g = hin + zur;
    var be = ein ? g / ein * 100 : 0;
    var verlust = ein * stop / 100 + g, gewinn = ein * ziel / 100 - g, cr = verlust > 0 ? gewinn / verlust : 0;
    var s = settings(), topfCHF = s.topf > 0 ? s.topf : 200, maxP = art === 'krypto' ? 10 : (s.topfMax > 0 ? s.topfMax : 5);
    var regeln = [];
    if (ein && ein < 50) regeln.push('<span class="mp-no">Unter CHF 50:</span> Die Mindestgebühr frisst viel weg. Spieltopf-Regel: mindestens CHF 50 pro Titel' + (topfCHF >= 50 ? ', bei deinem Topf also höchstens ' + Math.max(1, Math.floor(topfCHF / 50)) + ' Titel' : '') + '.');
    if (topfCHF > 2000 && ein > topfCHF * maxP / 100) regeln.push('<span class="mp-no">Mehr als ' + maxP + ' % vom Topf</span> (CHF ' + topfCHF + '). Deine Leitlinie: ' + (art === 'krypto' ? 'Krypto höchstens 10 %.' : 'höchstens ' + maxP + ' % pro Titel.') + ' Nur ein Hinweis, keine Sperre.');
    if (art === 'krypto' && stop && stop < 20) regeln.push('Krypto schwankt stark. Deine Leitlinie schlägt −20 % als Grenze vor.');
    if (sym && ruestung(sym)) regeln.push('<span class="mp-no">' + esc(sym) + ' ist ein Rüstungstitel.</span> Deine Leitlinie: keine Rüstung. Mr. Ping begleitet das nicht.');
    var pause = topfStand(); if (pause.ein && pause.diff <= -25) regeln.push('<span class="mp-no">Pause-Regel aktiv:</span> Der Topf ist mehr als 25 % im Minus. Keine neuen Käufe bis nächsten Monat.');
    $('mpRechnung').innerHTML = ein ? (
      '<p>Gebühren hin und zurück: <b>' + chf(g) + '</b> · Break-even ab <b>' + proz(be) + '</b></p>' +
      '<p>Bei der Grenze −' + stop + ' %: Verlust ca. <b>' + chf(verlust) + '</b></p>' +
      '<p>Beim Ziel +' + ziel + ' %: Gewinn ca. <b>' + chf(gewinn) + '</b></p>' +
      '<p>Chance zu Risiko: <b class="' + (cr >= 1.5 ? 'mp-ok' : 'mp-no') + '">' + cr.toFixed(1).replace('.', ',') + '</b> (deine Regel: mindestens 1,5)</p>' +
      (regeln.length ? '<p>' + regeln.join('<br>') + '</p>' : '<p class="mp-ok">Passt zu deinen Regeln. Kaufen tust du selbst, mit Limit-Order.</p>')) : '<p>Trag einen Einsatz ein.</p>';
  }

  /* ---------- 5. Journal mit Papier-Handel ---------- */
  var journal = load(K.journal, []); if (!Array.isArray(journal)) journal = [];
  function jSave() { save(K.journal, journal); }
  var jk = karte('mpJournal', 'Trading-Journal', 'Pro Trade eine Zeile: Grund vorher, Lehre nachher. Bei «Papier» handelt Mr. Ping selbst nach deinen Regeln (Verlustgrenze und Ziel) und schreibt es auf. Echtes Geld bewegt nur du.',
    '<div class="mp-felder">' +
    '<label>Titel / Kürzel<input id="jSym" autocapitalize="characters" autocomplete="off" maxlength="12" placeholder="Kürzel"></label>' +
    '<label>Art<select id="jArt"><option value="papier">Papier (Mr. Ping handelt)</option><option value="echt">Echt (Yuh, du handelst)</option></select></label>' +
    '<label>Einsatz CHF<input id="jEin" inputmode="decimal" placeholder="100"></label>' +
    '<label>Kaufkurs<input id="jKauf" inputmode="decimal" placeholder="Kurs beim Kauf"></label>' +
    '<label>Verlustgrenze %<input id="jStop" inputmode="decimal" placeholder="15"></label>' +
    '<label>Ziel %<input id="jZiel" inputmode="decimal" placeholder="30"></label>' +
    '<label>Nächste Zahlen (Datum)<input id="jZahlen" type="date"></label>' +
    '<label>Währung<select id="jWae"><option value="usd">USD-Aktie</option><option value="chf">CHF-Aktie</option><option value="krypto">Krypto</option></select></label>' +
    '<label class="ganz">Begründung (vor dem Kauf)<input id="jGrund" maxlength="140" placeholder="Warum dieser Titel, warum jetzt?"></label>' +
    '</div><p class="err-msg" id="jErr"></p><div class="mp-reihe"><button class="btn pri" type="button" id="jNeu">+ Trade eintragen</button></div>' +
    '<div id="jListe"></div><div class="mp-ergebnis" id="jAuswertung"></div>' +
    '<div class="mp-reihe"><button class="btn ghost" type="button" id="jKopie">📋 Journal als Text</button></div>');
  function tradeErgebnis(t) {
    if (t.verkauf == null || !t.kauf) return null;
    var brutto = t.einsatz * (t.verkauf / t.kauf) - t.einsatz;
    var g = gebuehr(t.einsatz, t.wae) + gebuehr(t.einsatz * t.verkauf / t.kauf, t.wae);
    return { chf: brutto - g, geb: g, proz: (t.verkauf / t.kauf - 1) * 100 };
  }
  function renderJournal() {
    var offen = journal.filter(function (t) { return t.verkauf == null; }), zu = journal.filter(function (t) { return t.verkauf != null; });
    var h = '';
    journal.slice().reverse().forEach(function (t) {
      var e = tradeErgebnis(t), jetzt = t.verkauf == null ? preisVon(t.sym) : null;
      var lauf = jetzt && t.kauf ? (jetzt / t.kauf - 1) * 100 : null;
      h += '<div class="mp-trade" data-id="' + t.id + '"><div class="k"><b>' + esc(t.sym) + '<span class="mp-tag ' + t.art + '">' + (t.art === 'papier' ? 'Papier' : 'Echt') + '</span></b>' +
        '<span class="' + (e ? (e.chf >= 0 ? 'up' : 'dn') : lauf != null ? (lauf >= 0 ? 'up' : 'dn') : 'mu') + '">' + (e ? chf(e.chf) : lauf != null ? proz(lauf) + ' offen' : 'offen') + '</span></div>' +
        '<small>' + esc(datumCH(t.datum)) + ' · CHF ' + t.einsatz + ' zu ' + kurs(t.kauf) + ' · Grenze ' + kurs(t.kauf * (1 - t.stop / 100)) + ' · Ziel ' + kurs(t.kauf * (1 + t.ziel / 100)) + (t.zahlen ? ' · Zahlen ' + esc(datumCH(t.zahlen)) : '') + '</small>' +
        (t.grund ? '<small>Grund: ' + esc(t.grund) + '</small>' : '') +
        (t.verkauf != null ? '<small>Verkauft ' + esc(datumCH(t.zu)) + ' zu ' + kurs(t.verkauf) + (t.lehre ? ' · Lehre: ' + esc(t.lehre) : '') + '</small>' : '<div class="mp-reihe"><button class="btn ghost" type="button" data-j="zu">Verkauft eintragen</button><button class="btn ghost" type="button" data-j="weg">Löschen</button></div>') +
        '</div>';
    });
    $('jListe').innerHTML = h || '<p class="note">Noch kein Trade. Ein Papier-Trade kostet nichts und zeigt, ob deine Regeln taugen.</p>';
    var treffer = zu.filter(function (t) { var e = tradeErgebnis(t); return e && e.chf > 0; }).length;
    var summe = zu.reduce(function (a, t) { var e = tradeErgebnis(t); return a + (e ? e.chf : 0); }, 0);
    var geb = zu.reduce(function (a, t) { var e = tradeErgebnis(t); return a + (e ? e.geb : 0); }, 0);
    $('jAuswertung').innerHTML = '<p><b>Auswertung</b> · ' + zu.length + ' abgeschlossen, ' + offen.length + ' offen</p>' +
      (zu.length ? '<p>Trefferquote ' + Math.round(treffer / zu.length * 100) + ' % · Gebühren ' + chf(geb) + ' · Ergebnis <b class="' + (summe >= 0 ? 'mp-ok' : 'mp-no') + '">' + chf(summe) + '</b></p>' : '') +
      (zu.length >= 10 && zu.length % 10 < 3 ? '<p>10 Trades sind voll: Zeit für einen Rückblick. Was wiederholt sich?</p>' : '');
  }
  function journalText() {
    var z = ['TRADING-JOURNAL ' + tag(), 'Datum | Titel | Art | Einsatz | Kaufkurs | Grenze | Ziel | Grund | Verkauf | Ergebnis CHF | Lehre'];
    journal.forEach(function (t) { var e = tradeErgebnis(t); z.push([t.datum, t.sym, t.art, t.einsatz, kurs(t.kauf), '−' + t.stop + ' %', '+' + t.ziel + ' %', t.grund || '', t.verkauf != null ? kurs(t.verkauf) : 'offen', e ? e.chf.toFixed(2) : '', t.lehre || ''].join(' | ')); });
    z.push('Keine Anlageberatung.'); return z.join('\n');
  }
  // Stufe 3: Mr. Ping handelt im Papier-Topf selbst nach deinen Regeln.
  function papierPruefen() {
    var neu = [];
    journal.forEach(function (t) {
      if (t.art !== 'papier' || t.verkauf != null || !t.kauf) return;
      var p = preisVon(t.sym); if (p == null) return;
      var pr = (p / t.kauf - 1) * 100;
      if (pr <= -t.stop) { t.verkauf = p; t.zu = tag(); t.lehre = 'Mr. Ping hat nach Regel 3 (Verlustgrenze −' + t.stop + ' %) geschlossen.'; neu.push([t, 'warn']); }
      else if (pr >= t.ziel) { t.verkauf = p; t.zu = tag(); t.lehre = 'Mr. Ping hat beim Ziel +' + t.ziel + ' % geschlossen (Regel 5: Gewinn sichern).'; neu.push([t, 'jubel']); }
    });
    if (neu.length) {
      jSave(); renderJournal();
      var t = neu[0][0], s = 'Papier-Topf: ' + t.sym + ' ' + (neu[0][1] === 'warn' ? 'hat die Grenze erreicht. Ich habe nach deiner Regel verkauft und es aufgeschrieben.' : 'hat das Ziel erreicht. Gewinn gesichert, steht im Journal.');
      pose(neu[0][1], s, neu[0][1] === 'jubel' ? { bild: '../nova/figuren/coinmaker-klein.jpg', name: 'Coin Maker' } : null); sprich(s);
    }
  }
  function kurseHolen() {
    var syms = journal.filter(function (t) { return t.art === 'papier' && t.verkauf == null && !istKrypto(t.sym) && preisVon(t.sym) == null; }).map(function (t) { return t.sym; });
    if (!syms.length || document.hidden) { papierPruefen(); return; }
    fetch(SERVER + '/kurse?s=' + encodeURIComponent(syms.join(',')), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (k) {
      papierKurse = k || {}; papierPruefen(); renderJournal();
    }).catch(function () { papierPruefen(); });
  }
  var papierKurse = {};
  var _preisVon = preisVon;
  preisVon = function (sym) { var p = _preisVon(sym); if (p != null) return p; var k = papierKurse[String(sym || '').toUpperCase()]; return typeof k === 'number' ? k : null; };

  /* ---------- 6. Verlauf und Wochenbilanz (Stufe 4: Selbstprüfung) ---------- */
  var verlauf = load(K.verlauf, []); if (!Array.isArray(verlauf)) verlauf = [];
  function verlaufMerken() {
    var t = topfStand(); if (!t.ein) return;
    var letzt = verlauf[verlauf.length - 1], now = Date.now();
    if (letzt && Math.abs(letzt.w - t.wert) < 0.005 && now - letzt.t < 3600e3) return;
    if (letzt && now - letzt.t < 5 * 60e3) { letzt.w = t.wert; letzt.t = now; } else verlauf.push({ t: now, w: Math.round(t.wert * 100) / 100, e: t.ein });
    if (verlauf.length > 600) verlauf = verlauf.slice(-600);
    save(K.verlauf, verlauf);
  }
  var bereich = 'woche';
  var wk = karte('mpWoche', 'Verlauf und Wochenbilanz', 'Wie sich dein Spieltopf bewegt hat, und was Mr. Ping daraus lernt. Er schlägt höchstens vor, du entscheidest.',
    '<div class="mp-seg" role="group" aria-label="Zeitraum"><button type="button" data-b="heute">Heute</button><button type="button" data-b="woche">Woche</button><button type="button" data-b="alles">Alles</button></div>' +
    '<svg class="mp-spark" id="mpSpark" viewBox="0 0 300 90" preserveAspectRatio="none" role="img" aria-label="Verlauf des Spieltopfs"></svg>' +
    '<div class="mp-ergebnis" id="mpBilanz"></div>');
  function renderVerlauf() {
    document.querySelectorAll('#mpWoche [data-b]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.b === bereich)); });
    var von = bereich === 'heute' ? new Date().setHours(0, 0, 0, 0) : bereich === 'woche' ? Date.now() - 7 * 864e5 : 0;
    var pts = verlauf.filter(function (p) { return p.t >= von; });
    var svg = $('mpSpark');
    if (pts.length < 2) { svg.innerHTML = '<text x="150" y="50" text-anchor="middle" fill="#7f92b6" font-size="11">Der Verlauf wächst, sobald Kurse kommen.</text>'; }
    else {
      var ws = pts.map(function (p) { return p.w; }), ein = pts[pts.length - 1].e, mn = Math.min.apply(null, ws.concat([ein])), mx = Math.max.apply(null, ws.concat([ein])), sp = (mx - mn) || 1;
      var t0 = pts[0].t, t1 = pts[pts.length - 1].t, dt = (t1 - t0) || 1;
      var xy = pts.map(function (p) { return ((p.t - t0) / dt * 296 + 2).toFixed(1) + ',' + (86 - (p.w - mn) / sp * 80).toFixed(1); }).join(' ');
      var y0 = (86 - (ein - mn) / sp * 80).toFixed(1), farbe = pts[pts.length - 1].w >= ein ? '#5fdc9a' : '#ff7b72';
      svg.innerHTML = '<line x1="0" x2="300" y1="' + y0 + '" y2="' + y0 + '" stroke="#7f92b6" stroke-opacity=".5" stroke-dasharray="3 3" stroke-width="1" vector-effect="non-scaling-stroke"/>' +
        '<polyline points="' + xy + '" fill="none" stroke="' + farbe + '" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>';
    }
    // Wochenbilanz
    var woche = Date.now() - 7 * 864e5, log = load('tp.log', []) || [];
    var pings = log.filter(function (e) { return e.t >= woche && !e.demo; });
    var proTitel = {}; pings.forEach(function (e) { if (e.dir === 'unter') proTitel[e.sym] = (proTitel[e.sym] || 0) + 1; });
    var oft = Object.keys(proTitel).filter(function (s) { return proTitel[s] >= 3; });
    var wp = verlauf.filter(function (p) { return p.t >= woche; });
    var bew = wp.length >= 2 ? wp[wp.length - 1].w - wp[0].w : null;
    var zuW = journal.filter(function (t) { return t.verkauf != null && t.zu && new Date(t.zu).getTime() >= woche - 864e5; });
    var lehre = oft.length ? 'Die untere Marke bei ' + oft.join(', ') + ' wurde diese Woche mehrmals berührt. Ist sie zu eng gesetzt? Verschieben nur nach oben, nie nach unten. Du entscheidest.' :
      pings.length ? 'Die Pings kamen, die Regeln haben gehalten. Weiter so, in Ruhe.' : 'Ruhige Woche. Kein Ping heisst: alles ruhig.';
    $('mpBilanz').innerHTML = '<p><b>Letzte 7 Tage</b></p><p>Pings: ' + pings.length + (pings.length ? ' (' + pings.slice(0, 40).map(function (e) { return e.sym; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ') + ')' : '') + '</p>' +
      (bew != null ? '<p>Spieltopf: <b class="' + (bew >= 0 ? 'mp-ok' : 'mp-no') + '">' + chf(bew) + '</b></p>' : '') +
      (zuW.length ? '<p>Journal: ' + zuW.length + ' Trade(s) abgeschlossen</p>' : '') +
      '<p>Mr. Ping prüft sich: ' + lehre + '</p>';
  }

  /* ---------- 7. Börse ruhig erklärt ---------- */
  var LEX = [
    ['Aktie', 'Ein kleines Stück einer Firma. Läuft die Firma gut, steigt der Preis oft, aber nicht immer. Der Preis entsteht aus Angebot und Nachfrage.'],
    ['Index (z. B. SMI)', 'Ein Korb aus vielen Aktien als eine Zahl, in Punkten statt Franken. Der SMI sind die grössten Schweizer Firmen.'],
    ['Limit-Order', 'Du sagst: «Ich kaufe höchstens zu diesem Preis.» So zahlst du nie mehr als geplant. Mr. Ping mag Limit-Orders.'],
    ['Markt-Order', 'Kaufen sofort, zum Preis, der gerade gilt. Bei wilden Kursen kann das teurer werden als gedacht.'],
    ['Verlustgrenze (Stop)', 'Die Marke, bei der du aussteigst, wenn es schlecht läuft. Sie steht vor dem Kauf fest und wird nie nach unten geschoben.'],
    ['Break-even', 'Ab diesem Plus hast du die Gebühren wieder drin. Bei kleinen Beträgen liegt er höher, weil die Mindestgebühr zählt.'],
    ['Chance zu Risiko', 'Möglicher Gewinn geteilt durch möglichen Verlust. Deine Regel: mindestens 1,5. Darunter lohnt sich der Einsatz selten.'],
    ['Schwankung (Volatilität)', 'Wie stark ein Kurs hin und her geht. Krypto und Chips schwanken stark, darum braucht Krypto eine weitere Grenze (−20 %).'],
    ['Wechselkurs-Gebühr', 'Kaufst du eine US-Aktie mit Franken, wechselt Yuh in Dollar und verlangt dafür etwa 0,95 %, beim Verkauf nochmals.'],
    ['Quartalszahlen', 'Vier Mal im Jahr zeigt eine Firma ihre Zahlen. Davor und danach springt der Kurs oft. Trag das Datum im Journal ein.'],
    ['Spieltopf', 'Nur Geld, dessen Verlust du verkraften kannst. Echt CHF 200, Papier CHF 1000. Im Minus 25 %: Pause bis nächsten Monat.'],
    ['Gewinn markieren', 'Ab +30 % die Hälfte als Gewinn sichern. So bleibt der Einsatz klein, auch wenn es gut läuft.']
  ];
  var lex = karte('mpLexikon', 'Börse ruhig erklärt', 'Mr. Ping erklärt in einfachen Worten. Tippen zum Aufklappen.',
    '<div class="mp-lex">' + LEX.map(function (l, i) { return '<details data-l="' + i + '"><summary>' + esc(l[0]) + '</summary><p>' + esc(l[1]) + '</p></details>'; }).join('') + '</div>');

  /* ---------- 8. Was Mr. Ping sich merkt ---------- */
  var merkt = karte('mpMerkt', 'Was Mr. Ping sich merkt', 'Nur Zahlen, nur auf diesem Handy: keine Namen, keine Beträge vom Konto, keine Stimme.',
    '<div class="mp-ergebnis" id="mpMerktListe"></div>' +
    '<label class="mp-check"><input type="checkbox" id="mpSpricht"> <span>Mr. Ping spricht Pings laut aus (Handystimme).</span></label>' +
    '<label class="mp-check"><input type="checkbox" id="mpTeilenOk"> <span>Ich bin einverstanden, dass das App-Team diese Lern-Zahlen (ohne Namen, ohne Beträge, ohne Stimme) lesen und für die Weiterentwicklung von Mr. Ping nutzen darf.</span></label>' +
    '<div class="mp-reihe"><button class="btn ghost" type="button" id="mpTeilen">📤 Erfahrung teilen</button><button class="btn ghost" type="button" id="mpVergessen">🧽 Alles vergessen</button></div><p class="note" id="mpTeilenMsg"></p>');
  function merktZusammen() {
    var titel = Object.keys(lern.titel).sort(function (a, b) { return lern.titel[b] - lern.titel[a]; }).slice(0, 3);
    var regeln = Object.keys(lern.regeln).map(function (r) { return r + ' ' + lern.regeln[r] + '×'; });
    var plat = (settings().plat || [])[0];
    var lexMeist = Object.keys(lern.lexikon).sort(function (a, b) { return lern.lexikon[b] - lern.lexikon[a]; })[0];
    return { tage: lern.tage.length, pings: lern.pings, ruhe: lern.ruhe, titel: titel, regeln: regeln, plat: plat, tafeln: lern.tafeln, rechner: lern.rechner, lex: lexMeist != null ? LEX[lexMeist][0] : '' };
  }
  function renderMerkt() {
    var x = merktZusammen();
    $('mpMerktListe').innerHTML = [
      '<p><b>Tage mit TradePing:</b> ' + x.tage + '</p>',
      '<p><b>Pings gesehen:</b> ' + x.pings + (x.ruhe ? ' · Ruhe-Modus ' + x.ruhe + '× gewählt' : '') + '</p>',
      x.titel.length ? '<p><b>Am meisten gepingt:</b> ' + esc(x.titel.join(', ')) + '</p>' : '',
      x.regeln.length ? '<p><b>Regeln, die gegriffen haben:</b> ' + esc(x.regeln.join(' · ')) + '</p>' : '',
      x.plat ? '<p><b>Erste Plattform:</b> ' + esc(x.plat) + '</p>' : '',
      x.tafeln || x.rechner ? '<p><b>Ping-Tafeln:</b> ' + x.tafeln + ' · <b>Vor dem Kauf geprüft:</b> ' + x.rechner + '×</p>' : '',
      x.lex ? '<p><b>Am liebsten nachgeschlagen:</b> ' + esc(x.lex) + '</p>' : ''
    ].join('');
    $('mpSpricht').checked = !!opt.spricht;
  }

  /* ---------- Einbauen ---------- */
  var topfSek = $('topf');
  nach(topfSek, uhr); nach(uhr, tafelK);
  var spielSek = $('hTopf') && $('hTopf').closest('section');
  nach(spielSek, rechner); nach(rechner, jk); nach(jk, wk);
  var footer = document.querySelector('.wrap footer');
  if (footer) { footer.parentNode.insertBefore(lex, footer); footer.parentNode.insertBefore(merkt, footer); }
  // Pause-Hinweis mit Jackie im Spieltopf
  var pauseBox = document.createElement('div'); pauseBox.id = 'mpPause';
  var alarm = $('topfAlarm'); if (alarm) nach(alarm, pauseBox);
  function renderPause() {
    var t = topfStand();
    pauseBox.innerHTML = t.ein && t.diff <= -25 ? '<div class="mp-pause"><img src="../jackie/figur.jpg" alt="Jackie"><span><b>Jackie:</b> Zeit für eine Pause. Keine neuen Käufe bis nächsten Monat. Atme durch, die Regeln halten dich.</span></div>' : '';
  }

  /* ---------- Ereignisse ---------- */
  document.addEventListener('tp-ping', function (ev) {
    var e = ev.detail || {};
    if (!e.demo) { lern.pings++; lern.titel[e.sym] = (lern.titel[e.sym] || 0) + 1; if (e.regel) lern.regeln[e.regel] = (lern.regeln[e.regel] || 0) + 1; lernSave(); }
    if (e.quiet) return;
    var satz = 'Ping! ' + e.sym + ' ist ' + e.dir + ' deiner Marke ' + kurs(e.mark) + '. Jetzt ' + kurs(e.p) + '.' + (e.regel ? ' ' + e.regel + '.' : '') + ' Du entscheidest.';
    pose(e.dir === 'über' && !e.demo ? 'jubel' : e.regel ? 'warn' : 'ping', satz); sprich(satz.replace(/·/g, ''));
    setTimeout(grundPose, 9000);
  });
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (t.closest('[data-ruhe]') && t.closest('[data-ruhe]').dataset.ruhe !== 'off') { lern.ruhe++; lernSave(); setTimeout(grundPose, 50); }
    if (t.closest('[data-ruhe="off"]')) setTimeout(grundPose, 50);
    // .mp-ava: Antippen übernimmt runde4.js (Mr. Ping winkt zurück)
    var b = t.closest('#mpWoche [data-b]'); if (b) { bereich = b.dataset.b; renderVerlauf(); }
    var jb = t.closest('[data-j]');
    if (jb) {
      var id = jb.closest('.mp-trade').dataset.id, tr = journal.find(function (x) { return x.id === id; }); if (!tr) return;
      if (jb.dataset.j === 'weg') { if (confirm(tr.sym + ' aus dem Journal löschen?')) { journal = journal.filter(function (x) { return x !== tr; }); jSave(); renderJournal(); } return; }
      var vk = zahl(prompt('Verkaufskurs für ' + tr.sym + ':', preisVon(tr.sym) || ''));
      if (!(vk > 0)) return;
      var lehre = prompt('Was lernst du daraus? (freiwillig)', '') || '';
      tr.verkauf = vk; tr.zu = tag(); tr.lehre = lehre.slice(0, 140); jSave(); renderJournal(); renderVerlauf();
      var e = tradeErgebnis(tr); pose(e && e.chf >= 0 ? 'jubel' : 'denk', e && e.chf >= 0 ? 'Gut gemacht. ' + chf(e.chf) + ' nach Gebühren. Geduld ist die feinste Strategie.' : 'Auch das gehört dazu. ' + (e ? chf(e.chf) : '') + '. Wichtig ist, dass du deine Regel eingehalten hast.');
    }
  }, true);
  // Pause-Regel: vor neuen Titeln kurz erinnern (Hinweis, keine Sperre)
  var bAdd = $('bAdd');
  if (bAdd) bAdd.addEventListener('click', function (ev) {
    var t = topfStand(); if (!(t.ein && t.diff <= -25)) return;
    if (!confirm('Deine Pause-Regel ist aktiv: der Topf ist mehr als 25 % im Minus. Trotzdem einen Titel auf das Radar setzen?')) { ev.stopImmediatePropagation(); ev.preventDefault(); }
  }, true);

  ['mpEin', 'mpArt', 'mpStop', 'mpZiel', 'mpSym'].forEach(function (id) { $(id).addEventListener('input', rechne); $(id).addEventListener('change', function () { lern.rechner++; lernSave(); }); });
  $('mpInsJournal').addEventListener('click', function () {
    $('jSym').value = $('mpSym').value; $('jEin').value = $('mpEin').value; $('jStop').value = $('mpStop').value; $('jZiel').value = $('mpZiel').value; $('jWae').value = $('mpArt').value;
    var p = preisVon($('mpSym').value); if (p) $('jKauf').value = p;
    $('mpJournal').scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
  });
  $('jSym').addEventListener('input', function () { var s = this.value.toUpperCase().trim(); if (istKrypto(s)) { $('jWae').value = 'krypto'; if (!$('jStop').value) $('jStop').placeholder = '20'; } var p = preisVon(s); if (p && !$('jKauf').value) $('jKauf').placeholder = 'jetzt ' + kurs(p); });
  $('jNeu').addEventListener('click', function () {
    var sym = String($('jSym').value || '').toUpperCase().replace(/[^A-Z0-9.:\-]/g, ''), wae = $('jWae').value;
    var ein = zahl($('jEin').value), kauf = zahl($('jKauf').value) || preisVon(sym);
    var stop = Math.abs(zahl($('jStop').value) || (wae === 'krypto' ? 20 : 15)), ziel = Math.abs(zahl($('jZiel').value) || 30);
    var err = !sym ? 'Bitte ein Kürzel eingeben.' : !(ein > 0) ? 'Bitte den Einsatz in CHF eingeben.' : !(kauf > 0) ? 'Bitte den Kaufkurs eingeben (kein Live-Kurs bekannt).' : stop >= 100 ? 'Die Verlustgrenze muss unter 100 % liegen.' : ruestung(sym) ? 'Deine Leitlinie: keine Rüstungstitel. Mr. Ping trägt das nicht ein.' : '';
    $('jErr').textContent = err; if (err) return;
    journal.push({ id: uid(), datum: tag(), sym: sym, art: $('jArt').value, wae: wae, einsatz: ein, kauf: kauf, stop: stop, ziel: ziel, grund: $('jGrund').value.trim().slice(0, 140), zahlen: $('jZahlen').value || '' });
    jSave(); ['jSym', 'jEin', 'jKauf', 'jStop', 'jZiel', 'jGrund', 'jZahlen'].forEach(function (i) { $(i).value = ''; });
    renderJournal(); renderUhrTermine();
    var s = $('jArt').value === 'papier' ? 'Eingetragen. Im Papier-Topf passe ich selbst auf: bei −' + stop + ' % oder +' + ziel + ' % schliesse ich nach deiner Regel.' : 'Eingetragen. Echtes Geld bewegst nur du. Ich erinnere dich an deine Grenzen.';
    pose('ping', s); sprich(s);
  });
  $('jKopie').addEventListener('click', function () { kopieren(journalText(), 'Journal kopiert. Du kannst es im Chat einfügen.'); });
  $('mpTafelKopie').addEventListener('click', function () { kopieren(tafelText(false), 'Tafel kopiert und gemerkt. Die nächste vergleicht mit jetzt.'); tafelMerken(); setTimeout(renderTafel, 50); renderMerkt(); });
  $('mpTafelSprich').addEventListener('click', function () {
    var x = tafelDaten(), was = x.zeilen.filter(function (z) { return z.ping; });
    var s = !x.zeilen.length ? 'Noch keine Kurse auf der Tafel.' : was.length ? was.map(function (z) { return z.sym + ' ' + (z.d >= 0 ? 'plus ' : 'minus ') + Math.abs(z.d || 0).toFixed(1).replace('.', ',') + ' Prozent'; }).join(', ') + '.' : 'Alles ruhig, keine grosse Bewegung.';
    if (x.t.ein) s += ' Topf seit Start ' + (x.t.seitStart < 0 ? 'minus ' : '') + Math.abs(x.t.seitStart).toFixed(2) + ' Franken.';
    var war = opt.spricht; opt.spricht = true; sprich(s); opt.spricht = war; pose(was.length ? 'ping' : 'denk', s);
  });
  document.querySelectorAll('#mpLexikon details').forEach(function (d) { d.addEventListener('toggle', function () { if (!d.open) return; var i = d.dataset.l; lern.lexikon[i] = (lern.lexikon[i] || 0) + 1; lernSave(); }); });
  $('mpSpricht').addEventListener('change', function () { opt.spricht = this.checked; save(K.mp, opt); if (opt.spricht) sprich('Gerne. Ich sage dir jeden Ping, ganz ruhig.'); });
  $('mpVergessen').addEventListener('click', function () { if (!confirm('Soll Mr. Ping alles vergessen, was er sich gemerkt hat? Journal und Topf bleiben.')) return; lern = { tage: [tag()], pings: 0, ruhe: 0, regeln: {}, titel: {}, tafeln: 0, rechner: 0, lexikon: {} }; lernSave(); renderMerkt(); });
  $('mpTeilen').addEventListener('click', function () {
    if (!$('mpTeilenOk').checked) { $('mpTeilenMsg').textContent = 'Bitte zuerst das Häkchen setzen.'; return; }
    var x = merktZusammen();
    var text = ['MR. PING (TradePing) – Lern-Erfahrung für Sense Engine', 'Datum: ' + tag(), 'Tage: ' + x.tage, 'Pings gesehen: ' + x.pings, 'Ruhe-Modus: ' + x.ruhe + '×', x.titel.length ? 'Häufigste Titel: ' + x.titel.join(', ') : '', x.regeln.length ? 'Regeln gegriffen: ' + x.regeln.join(', ') : '', 'Ping-Tafeln: ' + x.tafeln + ' · Rechner: ' + x.rechner + '×', x.lex ? 'Lexikon: ' + x.lex : '', 'Einwilligung: ja · ohne Namen · ohne Beträge · ohne Stimme', '', 'Sense Engine (JSON):', JSON.stringify({ app: 'TradePing', art: 'lernen', zeit: new Date().toISOString().slice(0, 16), daten: { tage: x.tage, pings: x.pings, ruhe: x.ruhe, regeln: lern.regeln, tafeln: x.tafeln, rechner: x.rechner }, einwilligung: true })].filter(Boolean).join('\n');
    kopieren(text, 'Kopiert. Du kannst es jetzt ans App-Team schicken.', 'Mr. Ping – Lern-Erfahrung');
  });
  function kopieren(text, msg, titel) {
    function fallback() { try { navigator.clipboard.writeText(text).then(function () { toastMp(msg); }, function () { prompt('Zum Kopieren:', text); }); } catch (e) { prompt('Zum Kopieren:', text); } }
    if (titel && navigator.share) { navigator.share({ title: titel, text: text }).then(function () { toastMp('Geteilt. Danke!'); }, function (e) { if (!e || e.name !== 'AbortError') fallback(); }); return; }
    fallback();
  }
  function toastMp(m) { var t = $('toast'); if (!t) return; t.textContent = m; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 3200); }
  function renderUhrTermine() {
    var bald = journal.filter(function (t) { if (!t.zahlen || t.verkauf != null) return false; var d = (new Date(t.zahlen) - new Date(tag())) / 864e5; return d >= 0 && d <= 14; });
    var el = $('mpTermine'); if (!el) { el = document.createElement('p'); el.id = 'mpTermine'; el.className = 'note'; el.style.margin = '6px 0 0'; $('mpUhr').appendChild(el); }
    el.textContent = bald.length ? 'Zahlen bald: ' + bald.map(function (t) { return t.sym + ' am ' + new Date(t.zahlen).toLocaleDateString('de-CH', { day: 'numeric', month: 'numeric' }); }).join(', ') + '. Davor und danach springen Kurse oft.' : '';
  }

  function alles() { verlaufMerken(); renderUhr(); renderUhrTermine(); renderTafel(); renderVerlauf(); renderPause(); renderMerkt(); }
  rechne(); renderJournal(); alles(); grundPose(); kurseHolen();
  // Topf und Kurse ändern sich im Hintergrund: alle 30 s nachzeichnen, Papier-Handel alle 2 min
  setInterval(function () { if (!document.hidden) { alles(); papierPruefen(); } }, 30000);
  setInterval(function () { if (!document.hidden) kurseHolen(); }, 120000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { alles(); grundPose(); kurseHolen(); } });
  document.addEventListener('change', function (e) { if (e.target.closest && e.target.closest('#topfListe')) setTimeout(alles, 100); });
  window.__mrping = { tafel: function () { return tafelText(false); }, gebuehr: gebuehr, boerse: boerse, journal: function () { return journal; }, pose: pose, sprich: sprich, kopieren: kopieren, toast: toastMp, topfStand: topfStand, topf: topf, tafelDaten: tafelDaten, karte: karte, nach: nach, settings: settings, lern: function () { return lern; }, lernSave: lernSave };
})();
