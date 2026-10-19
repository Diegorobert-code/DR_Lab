/* Coin Maker · Werkstatt-Ausbau 19.10.2026
   Trickfilm-Bühne mit Posen, Film «Zahlen mit Daten», Ideen-Waage 5·2·0, Teilung 80·20,
   Kostenrechner, Wechselkurs-Woche, Diktat, Einspruch, zweite Meinung vom Server, Lernzahlen.
   Coins und Ideenwert sind Punkte ohne Geldwert. Keine Auszahlung. Keine Schlüssel im Code. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function hol(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function heute() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function chf(n) { return 'CHF ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"); }

  /* ---------- Aussehen ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '.werk{display:flex;flex-direction:column;gap:10px}',
    '.werk-kopf{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}',
    '.werk-kopf .fb-btn{min-width:42px;min-height:42px}',
    '.werk-buehne{position:relative;height:330px;border-radius:26px;overflow:hidden;border:2px solid var(--brass-dk);background:linear-gradient(180deg,#0d1640 0%,#1a2458 55%,#3a2614 56%,#2a1a0c 100%);box-shadow:0 18px 40px #0008}',
    '.werk-himmel{position:absolute;inset:0 0 44% 0;background:radial-gradient(80% 90% at 70% 10%,#24348a 0%,transparent 70%)}',
    '.werk-himmel .mond{position:absolute;right:26px;top:18px;width:38px;height:38px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff7cf,#f2c14e);box-shadow:0 0 30px #f2c14e88}',
    '.werk-himmel b{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff3c4;animation:cmFunkeln 3s ease-in-out infinite}',
    '.werk-himmel b:nth-of-type(1){left:12%;top:16%}.werk-himmel b:nth-of-type(2){left:30%;top:8%;animation-delay:.6s}.werk-himmel b:nth-of-type(3){left:48%;top:22%;animation-delay:1.2s}.werk-himmel b:nth-of-type(4){left:62%;top:12%;animation-delay:.3s}.werk-himmel b:nth-of-type(5){left:20%;top:34%;animation-delay:1.8s}.werk-himmel b:nth-of-type(6){left:84%;top:40%;animation-delay:.9s}.werk-himmel b:nth-of-type(7){left:6%;top:44%;animation-delay:2.2s}',
    '@keyframes cmFunkeln{50%{opacity:.25;transform:scale(.6)}}',
    '.werk-daecher{position:absolute;left:0;right:0;bottom:0;width:100%;height:70px}',
    '.werk-fenster{position:absolute;inset:0 0 44% 0;border-bottom:10px solid #5a3a16;box-shadow:inset 0 0 0 10px #5a3a16;background:linear-gradient(90deg,transparent 49.3%,#5a3a16 49.3%,#5a3a16 50.7%,transparent 50.7%)}',
    '.werk-tisch{position:absolute;left:0;right:0;bottom:0;height:44%;background:repeating-linear-gradient(90deg,#4a2e12 0 38px,#553516 38px 76px);box-shadow:inset 0 10px 18px #0007}',
    '.cm-fig{position:absolute;left:14px;bottom:14px;width:46%;max-width:210px;aspect-ratio:1;transition:transform .5s cubic-bezier(.3,1.4,.5,1)}',
    '.cm-fig img{width:100%;height:100%;object-fit:cover;border-radius:50% 50% 22px 22px;border:3px solid var(--gold);box-shadow:0 10px 26px #000a,0 0 30px #f2c14e44;cursor:pointer}',
    '.figur-logo{animation:cmSchweben 5s ease-in-out infinite}',
    '@keyframes cmSchweben{50%{transform:translateY(-6px)}}',
    '.cm-lupe{position:absolute;right:-16px;top:16%;font-size:44px;opacity:0;pointer-events:none;filter:drop-shadow(0 4px 6px #000a)}',
    '.cm-req{position:absolute;left:-6px;top:-8px;font-size:38px;opacity:0;pointer-events:none;filter:drop-shadow(0 4px 6px #000a)}',
    '.cm-req.zeig{animation:cmReq 1.8s ease-out}',
    '@keyframes cmReq{0%{opacity:0;transform:translateY(16px) scale(.4)}25%{opacity:1;transform:translateY(-6px) scale(1.15) rotate(-8deg)}75%{opacity:1}100%{opacity:0;transform:translateY(-30px)}}',
    '.cm-funken{position:absolute;inset:0;pointer-events:none}',
    '.cm-funken i{position:absolute;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff0a8,#f2c14e 45%,#a8701c);opacity:0}',
    '.cm-fig[data-pose=freude] .cm-funken i{animation:cmMuenzFlug 1.4s ease-out}',
    '.cm-funken i:nth-child(1){left:20%;top:30%}.cm-funken i:nth-child(2){left:70%;top:20%;animation-delay:.1s!important}.cm-funken i:nth-child(3){left:45%;top:10%;animation-delay:.2s!important}.cm-funken i:nth-child(4){left:85%;top:50%;animation-delay:.15s!important}.cm-funken i:nth-child(5){left:5%;top:55%;animation-delay:.25s!important}',
    '@keyframes cmMuenzFlug{0%{opacity:0;transform:translateY(20px) scale(.4)}30%{opacity:1}100%{opacity:0;transform:translateY(-70px) rotate(300deg)}}',
    '.cm-fig[data-pose=lupe] .cm-lupe{animation:cmLupe 1.6s ease-in-out infinite;opacity:1}',
    '@keyframes cmLupe{0%,100%{transform:translate(0,0) rotate(-10deg)}50%{transform:translate(-60px,24px) rotate(12deg) scale(1.15)}}',
    '.cm-fig[data-pose=lupe] img{animation:cmNeigen 1.6s ease-in-out infinite}',
    '@keyframes cmNeigen{50%{transform:rotate(-4deg) scale(1.03)}}',
    '.cm-fig[data-pose=nicken] img{animation:cmNicken .5s ease-in-out 3}',
    '@keyframes cmNicken{50%{transform:translateY(8px) rotate(2deg)}}',
    '.cm-fig[data-pose=hebel]{transform:translateX(18px) rotate(6deg)}',
    '.cm-fig[data-pose=freude] img{animation:cmHuepf .45s ease-out 3}',
    '@keyframes cmHuepf{50%{transform:translateY(-18px) scale(1.05)}}',
    '.cm-fig[data-pose=ernst] img{filter:saturate(.6) brightness(.85);transform:rotate(-3deg)}',
    '.cm-fig[data-pose=erzaehlen] img{animation:cmErzaehl 1.2s ease-in-out infinite}',
    '@keyframes cmErzaehl{25%{transform:rotate(-2deg)}75%{transform:rotate(2deg) translateY(-3px)}}',
    '.cm-fig[data-pose=winken] img{animation:cmWinken .6s ease-in-out 3}',
    '@keyframes cmWinken{25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}',
    '.werk-buehne .bubble{position:absolute;right:12px;top:14px;width:calc(54% - 18px);font-size:.92rem;line-height:1.35;max-height:62%;overflow:auto;box-shadow:0 8px 20px #0007}',
    '.werk-buehne .bubble::after{content:"";position:absolute;left:-8px;bottom:14px;border:8px solid transparent;border-right-color:var(--ink);border-left:0}',
    '.cm-film{position:absolute;right:12px;bottom:14px;width:calc(54% - 18px);height:30%;display:flex;align-items:center;justify-content:center;gap:6px;font-size:30px;border-radius:16px;background:#0b1330;border:1px solid #f2c14e66;overflow:hidden}',
    '.cm-film .fx{display:inline-block;animation:cmFx 1.6s ease-in-out infinite}',
    '.cm-film .fx:nth-child(2){animation-delay:.25s}.cm-film .fx:nth-child(3){animation-delay:.5s}',
    '@keyframes cmFx{50%{transform:translateY(-8px) scale(1.1)}}',
    '.cm-film .m5,.cm-film .m2,.cm-film .m0{width:42px;height:42px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font:400 20px var(--f-display)}',
    '.m5{background:radial-gradient(circle at 35% 30%,#fff0a8,#f2c14e 45%,#a8701c);color:#6b4312}.m2{background:radial-gradient(circle at 35% 30%,#c9fff2,#3ff0c8 45%,#1d7c6b);color:#0b4a42;transform:scale(.85)}.m0{background:#8d88a3;color:#3b3160;transform:scale(.7)}',
    '.cm-film .fb{width:80%;height:12px;border-radius:6px;background:#3b3160;overflow:hidden}.cm-film .fb i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--brass),var(--gold));animation:cmFill 4s ease-out forwards}',
    '@keyframes cmFill{to{width:100%}}',
    '.werk-knoepfe{display:flex;gap:8px;flex-wrap:wrap}.werk-knoepfe .wk{flex:1 1 40%}',
    '.werk-muenzen{position:absolute;right:22px;bottom:18px;width:120px;height:80px}',
    '.werk-muenzen i{position:absolute;bottom:0;width:34px;height:12px;border-radius:50%;background:linear-gradient(180deg,#fff0a8,#d9a441 60%,#8a5a14);box-shadow:0 2px 0 #6b4312}',
    '.werk-muenzen i:nth-child(1){left:0}.werk-muenzen i:nth-child(2){left:0;bottom:9px}.werk-muenzen i:nth-child(3){left:0;bottom:18px}.werk-muenzen i:nth-child(4){left:38px}.werk-muenzen i:nth-child(5){left:38px;bottom:9px}.werk-muenzen i:nth-child(6){left:18px;bottom:27px;animation:cmGlanz 2.4s ease-in-out infinite}',
    '@keyframes cmGlanz{50%{filter:brightness(1.5);transform:translateY(-3px)}}',
    '.werk-muenzen span{position:absolute;right:0;bottom:0;font-size:40px;filter:drop-shadow(0 4px 6px #000a)}',
    '.wk{flex:1 1 auto;border:2px solid var(--brass-dk);background:linear-gradient(180deg,#fff0a8,var(--gold));color:#2a1a08;border-radius:999px;padding:10px 14px;font:800 .92rem var(--f-body);cursor:pointer}',
    '.wk.hell{background:var(--panel);color:var(--gold);border-color:var(--line)}',
    '.film-leiste{display:flex;align-items:center;gap:10px;font-size:.85rem;color:var(--ink-2)}',
    '.film-punkte{flex:1;display:flex;gap:4px}.film-punkte i{flex:1;height:6px;border-radius:3px;background:var(--line)}.film-punkte i.an{background:var(--gold)}',
    '.mic{margin-left:8px;vertical-align:middle;align-self:flex-start}',
    '.feld{width:100%;border-radius:12px;border:2px solid var(--brass-dk);background:#fff8e4;color:#2a1a08;padding:10px;font:16px/1.4 var(--f-body)}',
    'textarea.feld{min-height:80px;resize:vertical}',
    '.fragen{display:flex;flex-direction:column;gap:8px}',
    '.waage-reihe{display:flex;align-items:center;justify-content:space-between;gap:10px}',
    '.pull.klein{font-size:.95rem;padding:10px 16px}',
    '.waage{display:flex;gap:8px;align-items:flex-end}',
    '.wm{width:40px;height:40px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font:400 18px var(--f-display);opacity:.35;transition:transform .4s,opacity .4s}',
    '.wm.g{background:radial-gradient(circle at 35% 30%,#fff0a8,#f2c14e 45%,#a8701c);color:#6b4312}.wm.t{background:radial-gradient(circle at 35% 30%,#c9fff2,#3ff0c8 45%,#1d7c6b);color:#0b4a42}.wm.x{background:#8d88a3;color:#3b3160}',
    '.wm.an{opacity:1;transform:translateY(-8px) scale(1.2)}',
    '.werg{margin:0;font-weight:700;min-height:1.4em}',
    '.big.sm{font-size:1.4rem}',
    '.regler{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}.regler input{width:100%;min-width:0}.regler output{font-weight:800;font-variant-numeric:tabular-nums;min-width:6.5ch;text-align:right}',
    '.seg{display:flex;gap:8px}.segb{flex:1;border:2px solid var(--line);background:var(--night-2);color:var(--ink);border-radius:12px;padding:8px;font:800 .9rem var(--f-body);cursor:pointer}.segb[aria-pressed=true]{background:var(--petrol);border-color:#173c3a;color:#fff}',
    '.teil-reihe{display:grid;grid-template-columns:110px 1fr;gap:14px;align-items:center}',
    '.kuchen{width:110px;height:110px;border-radius:50%;background:conic-gradient(var(--gold) 0 20%,var(--petrol) 20% 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px #0006}',
    '.kuchen span{background:var(--night);border-radius:999px;padding:2px 8px;font:400 .85rem var(--f-display);color:var(--gold)}',
    '.kurs-bars{display:flex;gap:6px;align-items:flex-end;height:110px}',
    '.kurs-bars div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:3px;min-width:0}',
    '.kurs-bars i{display:block;width:100%;border-radius:8px 8px 3px 3px;background:linear-gradient(180deg,var(--screen),var(--screen-dk))}',
    '.kurs-bars div.heute i{background:linear-gradient(180deg,var(--gold-hi),var(--brass))}',
    '.kurs-bars span{font-size:.7rem;color:var(--ink-2)}.kurs-bars b{font-size:.72rem;font-weight:800;font-variant-numeric:tabular-nums}',
    '.zeile2{display:flex;gap:8px;flex-wrap:wrap}',
    '.meinung{background:#120e22;border-radius:12px;padding:10px 12px;color:var(--ink);font-size:.9rem;margin:0}',
    '@media (max-width:380px){.werk-buehne{height:300px}.werk-buehne .bubble{font-size:.85rem}}',
    '@media (prefers-reduced-motion:reduce){.cm-fig,.cm-fig *{animation:none!important;transition:none!important}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- Figur: Posen und Sprechen ---------- */
  var REQ = { lupe: '🔍', nicken: '👍', hebel: '🕹️', freude: '🪙', ernst: '🤔', erzaehlen: '✨', tresor: '🔒', winken: '👋', waage: '⚖️', kuchen: '🥧' };
  var poseTimer = null;
  function pose(p, ms) {
    var f = $('cmfig'); if (!f) return;
    f.setAttribute('data-pose', p);
    var r = $('cmreq');
    if (r && REQ[p]) { r.textContent = REQ[p]; r.classList.remove('zeig'); void r.offsetWidth; r.classList.add('zeig'); }
    clearTimeout(poseTimer);
    if (ms !== 0) poseTimer = setTimeout(function () { f.setAttribute('data-pose', 'ruhig'); }, ms || 2200);
    // Tinko-Posenbild, falls coinmaker/posen/<pose>.jpg liegt (sonst CSS-Pose)
    if (window.FigurPosen && p !== 'ruhig') FigurPosen.zeige(f.querySelector('img'), p, ms === 0 ? 2600 : (ms || 2200), PERSATZ[p]);
  }
  var PERSATZ = { winken: ['freude'], nicken: ['freude'], hebel: ['lupe'], erzaehlen: ['winken'], kuchen: ['freude'], waage: ['lupe'], tresor: ['ernst'] };
  function sag(text, klein, vorlesen) {
    var b = $('say'); if (!b) return;
    b.firstChild.textContent = text;
    var s = b.querySelector('small'); if (s) s.textContent = klein || '';
    if (!vorlesen || !hol('coinmaker.ton', true)) return;
    if (window.NovaStimme && NovaStimme.aktiv && NovaStimme.aktiv()) { try { NovaStimme.sprich(text); } catch (e) {} return; }
    try { // ohne Server: Gerätestimme, ruhig und tief
      if (!('speechSynthesis' in window)) return; speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = 'de-CH'; u.rate = .95; u.pitch = .8;
      var v = speechSynthesis.getVoices().filter(function (x) { return /^de/i.test(x.lang); })[0]; if (v) u.voice = v; speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ---------- Lernzahlen (nur Gerät) ---------- */
  var LK = 'coinmaker.lernen';
  var L = hol(LK, null) || { tage: [], hebel: 0, ideen: 0, daten: 0, rueck: 0, qSumme: 0, qAnzahl: 0, besteQ: 0, waage: { 5: 0, 2: 0, 0: 0 }, film: 0, einspruch: 0, eingeloest: 0, meinung: 0, diktat: 0 };
  function zaehl(k, n) { L[k] = (L[k] || 0) + (n || 1); var t = heute(); if (L.tage.indexOf(t) < 0) { L.tage.push(t); L.tage = L.tage.slice(-60); } leg(LK, L); merkZeigen(); }
  function merkZeigen() {
    var kv = $('merkKv'); if (!kv) return;
    var avg = L.qAnzahl ? (L.qSumme / L.qAnzahl) : 0;
    var rows = [
      ['Tage in der Werkstatt', L.tage.length], ['Hebel gezogen', L.hebel],
      ['Ideen · Daten · Rückmeldungen', L.ideen + ' · ' + L.daten + ' · ' + L.rueck],
      ['Mittlere Qualität', avg ? avg.toFixed(2) : '–'], ['Beste Qualität', L.besteQ ? L.besteQ.toFixed(2) : '–'],
      ['Waage 5 · 2 · 0', L.waage[5] + ' · ' + L.waage[2] + ' · ' + L.waage[0]],
      ['Film geschaut', L.film], ['Einsprüche', L.einspruch]
    ];
    kv.innerHTML = '';
    rows.forEach(function (r) { var a = document.createElement('span'); a.textContent = r[0]; var b = document.createElement('span'); b.textContent = r[1]; kv.appendChild(a); kv.appendChild(b); });
    var s = $('merkSatz');
    if (s) s.textContent = !L.hebel ? 'Ich merke mir nur Zahlen, nie deine Texte. Zieh einmal am Hebel, dann lerne ich dich kennen.'
      : avg >= 1.5 ? 'Deine Ideen sind meistens klar und konkret. Weiter so, Münze für Münze.'
      : 'Tipp aus meinen Zahlen: Schreib Problem, Lösung und Nutzen in je einem Satz, dann wird die Münze schwerer.';
    var c = $('merkTeilen'); if (c) c.checked = !!hol('coinmaker.teilen', false);
  }
  function verbindung() {
    var a = '', k = '';
    try { a = String(JSON.parse(localStorage.getItem('drlab-hermes-adresse')) || '').replace(/\/+$/, ''); k = JSON.parse(localStorage.getItem('drlab-hermes-passwort')) || ''; } catch (e) {}
    return a && k ? { a: a, k: k } : null;
  }
  function teilen() {
    if (!hol('coinmaker.teilen', false) || hol('coinmaker.geteilt', '') === heute()) return;
    var v = verbindung(); if (!v) return;
    var z = { tage: L.tage.length, hebel: L.hebel, ideen: L.ideen, daten: L.daten, rueck: L.rueck, qMittel: L.qAnzahl ? +(L.qSumme / L.qAnzahl).toFixed(2) : 0, waage: L.waage, film: L.film, einspruch: L.einspruch, eingeloest: L.eingeloest };
    fetch(v.a + '/erfahrung', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + v.k }, body: JSON.stringify({ app: 'Coin Maker', art: 'lernzahlen', frage: JSON.stringify(z), antwort: '' }) })
      .then(function (r) { if (r.ok) leg('coinmaker.geteilt', heute()); }).catch(function () {});
  }

  /* ---------- Hooks vom Automaten ---------- */
  var letzte = null;
  function bewertet(r) {
    letzte = r;
    zaehl('hebel'); zaehl(r.type === 'idee' ? 'ideen' : r.type === 'daten' ? 'daten' : 'rueck');
    L.qSumme += r.q; L.qAnzahl++; if (r.q > L.besteQ) L.besteQ = r.q; leg(LK, L); merkZeigen();
    pose(r.dup ? 'ernst' : r.coins >= 15 ? 'freude' : 'nicken', 2600);
    var e = $('einspruchBox'); if (e) e.hidden = true;
    var m = $('meinungText'); if (m) { m.hidden = true; m.textContent = ''; }
    var z = $('resExtra'); if (z) z.hidden = false;
    teilen();
  }
  function hebelStart() { pose('hebel', 600); setTimeout(function () { pose('lupe', 0); }, 600); }
  function eingeloest() { zaehl('eingeloest'); pose('freude'); }

  /* ---------- Diktat (Sprache statt tippen) ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  function diktat(knopf, feld) {
    if (!SR || !knopf || !feld) return;
    knopf.hidden = false;
    var rec = null;
    knopf.addEventListener('click', function () {
      if (rec) { try { rec.stop(); } catch (e) {} return; }
      try { rec = new SR(); } catch (e) { return; }
      rec.lang = 'de-CH'; rec.interimResults = false; rec.continuous = false;
      knopf.textContent = '⏹ Fertig';
      rec.onresult = function (ev) { var t = ''; for (var i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript; feld.value = (feld.value && feld.value.indexOf('Zähneputzen') < 0 ? feld.value + ' ' : '') + t; zaehl('diktat'); };
      rec.onend = function () { rec = null; knopf.textContent = '🎙 Sprechen'; };
      rec.onerror = function () { rec = null; knopf.textContent = '🎙 Sprechen'; };
      try { rec.start(); pose('lupe', 4000); } catch (e) { rec = null; knopf.textContent = '🎙 Sprechen'; }
    });
  }

  /* ---------- Einspruch + zweite Meinung ---------- */
  function extrasBauen() {
    var res = $('result'); if (!res) return;
    var box = document.createElement('div'); box.id = 'resExtra'; box.className = 'zeile2'; box.hidden = true;
    box.innerHTML = '<button class="del" id="einspruchBtn" type="button">Einspruch</button><button class="del" id="meinungBtn" type="button">Zweite Meinung vom Server</button>';
    var eb = document.createElement('div'); eb.id = 'einspruchBox'; eb.hidden = true; eb.className = 'fragen';
    eb.innerHTML = '<label for="einspruchTxt">Was sieht der Coin Maker falsch?</label><textarea id="einspruchTxt" class="feld" placeholder="z. B. Die Idee ist neu, weil …"></textarea><button class="del" id="einspruchOk" type="button">Einspruch merken</button>';
    var mt = document.createElement('p'); mt.id = 'meinungText'; mt.className = 'meinung'; mt.hidden = true; mt.setAttribute('aria-live', 'polite');
    var f = $('formula'); res.insertBefore(box, f.nextSibling); res.insertBefore(eb, box.nextSibling); res.insertBefore(mt, eb.nextSibling);
    $('einspruchBtn').addEventListener('click', function () { eb.hidden = !eb.hidden; pose('ernst'); sag('Gut, dass du es sagst. Ich schaue gern noch einmal hin.', 'Dein Einspruch bleibt auf diesem Gerät. Diego entscheidet am Schluss.'); });
    $('einspruchOk').addEventListener('click', function () {
      var t = $('einspruchTxt').value.trim(); if (t.length < 5) { $('einspruchTxt').focus(); return; }
      var liste = hol('coinmaker.einsprueche', []); liste.push({ tag: heute(), q: letzte ? letzte.q : 0, coins: letzte ? letzte.coins : 0, grund: t }); leg('coinmaker.einsprueche', liste.slice(-30));
      zaehl('einspruch'); eb.hidden = true; $('einspruchTxt').value = '';
      pose('nicken'); sag('Danke. Ich habe deinen Einspruch notiert.', 'Mit Konto und Server geht er später an Diego. Bis dahin bleibt er hier.');
    });
    $('meinungBtn').addEventListener('click', function () {
      if (!letzte) return;
      var v = verbindung();
      mt.hidden = false;
      if (!v) { mt.textContent = 'Kein DR-Lab-Server eingerichtet. Die Bewertung oben kommt von festen, sichtbaren Regeln.'; return; }
      if (letzte.type === 'daten') { mt.textContent = 'Daten-Beiträge schicke ich nie an den Server. Die Bewertung bleibt hier.'; return; }
      mt.textContent = 'Der Coin Maker fragt den Server …'; pose('lupe', 0); zaehl('meinung');
      var sys = 'Du bist The Coin Maker, ein gütiger alter Münzmacher in der DR-Lab-Werkstatt. Du sagst ehrlich und ruhig, was eine Idee wert ist, nie mehr. Antworte auf Deutsch (Schweiz, kein ß), höchstens 4 kurze Sätze: je ein Satz zu Klarheit, Neuheit, Umsetzbarkeit, Vollständigkeit, dann ein konkreter Tipp. Keine Geldversprechen. Coins sind Punkte ohne Geldwert.';
      fetch(v.a + '/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + v.k, 'X-Nova-App': 'Coin Maker' },
        body: JSON.stringify({ model: 'sense-engine', max_tokens: 220, messages: [{ role: 'system', content: sys }, { role: 'user', content: 'Bewerte diese ' + (letzte.type === 'idee' ? 'Idee' : 'Rückmeldung') + ': ' + letzte.text }] }) })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { var a = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; mt.textContent = a ? a.trim() : 'Der Server antwortet gerade nicht. Die Regeln oben gelten.'; pose(a ? 'nicken' : 'ernst'); })
        .catch(function () { mt.textContent = 'Der Server antwortet gerade nicht. Die Regeln oben gelten.'; pose('ernst'); });
    });
  }

  /* ---------- Ideen-Waage 5 · 2 · 0 ---------- */
  var KU = 'coinmaker.unternehmen';
  var ku = hol(KU, null) || { name: '', ideen: [] };
  function kuZeigen() {
    var sum = 0; ku.ideen.forEach(function (i) { sum += i.w; });
    var p = Math.min(100, Math.round(sum / 2));
    $('kuTitel').textContent = ku.name || 'Mein Unternehmen';
    $('kuStand').textContent = 'CHF ' + sum + ' / 200';
    $('kuBar').style.width = p + '%';
    var g = ku.ideen.filter(function (i) { return i.w > 0; }).length;
    $('kuHinweis').textContent = sum >= 200 ? 'Geschafft: CHF 200 Ideenwert. Die Kreation ist mit Ideen bezahlt.'
      : 'Es fehlen CHF ' + (200 - sum) + '. Ziel: etwa 6 Gespräche, keine Garantie. ' + (ku.ideen.length ? g + ' von ' + ku.ideen.length + ' Ideen zählen.' : '');
    var ul = $('kuListe'); ul.innerHTML = '';
    ku.ideen.slice().reverse().forEach(function (i) {
      var li = document.createElement('li');
      var t = document.createElement('div'); t.className = 't';
      var p1 = document.createElement('p'); p1.textContent = i.text;
      var s = document.createElement('small'); s.textContent = i.tag.split('-').reverse().join('.') + ' · ' + i.grund;
      t.appendChild(p1); t.appendChild(s);
      var c = document.createElement('span'); c.className = 'c'; c.textContent = 'CHF ' + i.w;
      var d = document.createElement('button'); d.className = 'del'; d.type = 'button'; d.textContent = 'Löschen';
      d.addEventListener('click', function () { ku.ideen = ku.ideen.filter(function (x) { return x.id !== i.id; }); leg(KU, ku); kuZeigen(); });
      li.appendChild(t); li.appendChild(c); li.appendChild(d); ul.appendChild(li);
    });
  }
  function wiegen() {
    var text = $('wIdee').value.trim();
    if (text.length < 8) { $('wErg').textContent = 'Schreib die Idee in einem Satz auf.'; $('wIdee').focus(); return; }
    var dr = $('wDr').checked, app = $('wApp').checked, std = $('wStd').checked;
    var doppelt = ku.ideen.some(function (i) { return i.text.toLowerCase() === text.toLowerCase(); });
    var w, grund;
    if (std || doppelt) { w = 0; grund = doppelt ? 'Schon auf der Liste' : 'Standard, hat fast jede App'; }
    else if (dr) { w = 5; grund = 'Bringt DR Lab weiter'; }
    else if (app) { w = 2; grund = 'Macht die App besser'; }
    else { w = 0; grund = 'Noch zu allgemein'; }
    pose('waage', 1200);
    document.querySelectorAll('.wm').forEach(function (m) { m.classList.remove('an'); });
    setTimeout(function () {
      var m = document.querySelector('.wm[data-w="' + w + '"]'); if (m) m.classList.add('an');
      $('wErg').textContent = 'CHF ' + w + ' · ' + grund + '.';
      ku.name = $('kuName').value.trim().slice(0, 40);
      ku.ideen.push({ id: String(Date.now()), tag: heute(), text: text.slice(0, 300), w: w, grund: grund });
      leg(KU, ku); kuZeigen();
      L.waage[w] = (L.waage[w] || 0) + 1; zaehl('tageX', 0);
      pose(w === 5 ? 'freude' : w === 2 ? 'nicken' : 'ernst', 2400);
      sag(w === 5 ? 'Fünf. Diese Idee hilft uns allen weiter.' : w === 2 ? 'Zwei. Sie macht deine App besser. Ehrlicher Wert.' : 'Null. Das kennt man schon. Bring mir etwas Eigenes.', 'Vorschlag des Coin Maker. Diego kann umstufen.', true);
      $('wIdee').value = ''; ['wDr', 'wApp', 'wStd'].forEach(function (id) { $(id).checked = false; });
    }, ruhig ? 0 : 900);
  }

  /* ---------- 80 · 20 ---------- */
  var fee = 15;
  function teilung() {
    var u = +$('umsatz').value;
    $('oUmsatz').textContent = chf(u);
    var nachStore = u * (1 - fee / 100);
    var mwst = nachStore * 8.1 / 108.1;
    var netto = nachStore - mwst;
    var rows = [['Einnahmen', chf(u)], ['minus Store ' + fee + '\u00a0%', chf(u - nachStore)], ['minus MWST', chf(mwst)], ['Netto', chf(netto)], ['Unternehmen 80\u00a0%', chf(netto * 0.8)], ['DR Lab 20\u00a0%', chf(netto * 0.2)]];
    var kv = $('teilKv'); kv.innerHTML = '';
    rows.forEach(function (r) { var a = document.createElement('span'); a.textContent = r[0]; var b = document.createElement('span'); b.textContent = r[1]; kv.appendChild(a); kv.appendChild(b); });
  }

  /* ---------- Kosten Jahr 1 ---------- */
  function kosten() {
    var w = +$('werbung').value; $('oWerbung').textContent = chf(w);
    var werb = w * 12;
    var rows = [['Kreation (Konzept + Auftritt)', 'mit Ideen'], ['Werbung ' + chf(w) + ' × 12', chf(werb)], ['Anwalt, Konten, Betrieb, Ideen', 'CHF 662–1\'354'], ['Total Jahr 1 (Schätzung)', chf(662 + werb) + '–' + chf(1354 + werb).replace('CHF ', '')]];
    var kv = $('kostenKv'); kv.innerHTML = '';
    rows.forEach(function (r) { var a = document.createElement('span'); a.textContent = r[0]; var b = document.createElement('span'); b.textContent = r[1]; kv.appendChild(a); kv.appendChild(b); });
  }

  /* ---------- Wechselkurs der Woche ---------- */
  var THEMES = [['Ideen für Kinder und Familien', +0.18], ['Ideen für Gesundheit im Alltag', +0.12], ['Ideen für Praxis und Therapie', +0.08], ['Viele Ideen zu Trading eingegangen', -0.15], ['Ruhiger Tag in der Werkstatt', 0], ['Ideen für Nova gesucht', +0.25], ['Viele App-Ideen diese Woche', -0.08]];
  function rateFor(day) { var h = 0; for (var i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) >>> 0; var t = THEMES[h % THEMES.length]; var r = Math.min(1.5, Math.max(0.8, 1.2 + t[1])); return { rate: Math.round(r * 100) / 100, why: t[0] }; }
  function kursWoche() {
    var box = $('kursBars'); if (!box) return; box.innerHTML = '';
    var TG = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    for (var k = 6; k >= 0; k--) {
      var d = new Date(); d.setDate(d.getDate() - k);
      var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      var r = rateFor(key);
      var c = document.createElement('div'); if (!k) c.className = 'heute'; c.title = r.why;
      var b = document.createElement('b'); b.textContent = r.rate.toFixed(2);
      var i = document.createElement('i'); i.style.height = Math.round((r.rate - 0.6) / 0.9 * 80) + 'px';
      var s = document.createElement('span'); s.textContent = k ? TG[d.getDay()] : 'Heute';
      c.appendChild(b); c.appendChild(i); c.appendChild(s); box.appendChild(c);
    }
    var h = rateFor(heute()); $('kursHeute').textContent = h.why;
  }

  /* ---------- Film «Zahlen mit Daten» ---------- */
  var SZENEN = [
    { p: 'winken', b: '<span class="fx">🏠</span><span class="fx">🌙</span><span class="fx">🪙</span>', t: 'Grüezi. Ich bin der Coin Maker. Ich sage dir, was etwas wert ist. Und heute geht es um etwas, das du jeden Tag hergibst: deine Daten.' },
    { p: 'erzaehlen', b: '<span class="fx">✨</span><span class="fx">➜</span><span class="fx">🪙</span>', t: 'Daten werden immer wichtiger auf der Welt. Mit ihnen lernen Firmen, bauen Apps und verdienen Geld. Daten sind das neue Gold.' },
    { p: 'ernst', b: '<span class="fx">📱</span><span class="fx">💨</span><span class="fx">🏭</span>', t: 'Viele Apps sammeln deine Daten im Hintergrund. Oft merkst du es nicht, und du bekommst nichts dafür. Das finde ich nicht fair.' },
    { p: 'nicken', b: '<span class="fx">🤲</span><span class="fx">💡</span><span class="fx">🎰</span>', t: 'Bei mir entscheidest du. Du gibst nur, was du geben möchtest. Deine Ideen sind auch Daten. Und sie haben einen Wert.' },
    { p: 'lupe', b: '<span class="m5">5</span><span class="m2">2</span><span class="m0">0</span>', t: 'Ich prüfe jede Idee mit der Lupe. Bringt sie uns alle weiter, ist sie fünf Franken Ideenwert. Macht sie deine App besser, zwei. Kennt man sie schon überall, null. Ehrlich, Münze für Münze.' },
    { p: 'freude', b: '<span class="fx">📱</span><div class="fb"><i></i></div><span class="fx">200</span>', t: 'Mit deinen Ideen bezahlst du dein Konzept und deinen Auftritt. Zweihundert Franken Ideenwert, das sind etwa sechs Gespräche. Versprechen kann ich es nicht, aber oft reicht es.' },
    { p: 'kuchen', b: '<span class="kuchen" style="width:60px;height:60px"><span>80·20</span></span>', t: 'Wir bauen, betreiben und machen Werbung. Darum gehen später zwanzig Prozent vom Netto-Umsatz an DR Lab. Der Rest gehört dir.' },
    { p: 'tresor', b: '<span class="fx">🔒</span><span class="fx">🇨🇭</span><span class="fx">🗑️</span>', t: 'Deine Daten sollen sicher in der Schweiz liegen, verschlüsselt. Du gibst nur mit deinem Ja, und du kannst alles wieder löschen.' },
    { p: 'freude', b: '<span class="fx">📈</span><span class="fx">🕹️</span><span class="fx">🪙</span>', t: 'Die Welt verändert sich, und mit ihr der Wert von Ideen. Darum hat mein Automat einen Wechselkurs. Also: Bring mir deine erste Idee. Jede Idee hat ihren Wert. Ich sage dir, welchen.' }
  ];
  var film = { an: false, i: 0, t: null };
  function filmSzene() {
    if (!film.an) return;
    if (film.i >= SZENEN.length) return filmStopp(true);
    var s = SZENEN[film.i];
    $('filmNr').textContent = 'Szene ' + (film.i + 1) + ' / ' + SZENEN.length;
    var pk = $('filmPunkte').children; for (var k = 0; k < pk.length; k++) pk[k].className = k <= film.i ? 'an' : '';
    var fb = $('filmBild'); fb.hidden = false; fb.innerHTML = s.b;
    pose(s.p, 0);
    sag(s.t, 'Zahlen mit Daten · Szene ' + (film.i + 1));
    var weiter = function () { if (!film.an) return; film.i++; filmSzene(); };
    clearTimeout(film.t);
    var dauer = Math.max(5200, s.t.split(' ').length * 420);
    if (window.NovaStimme && NovaStimme.aktiv && NovaStimme.aktiv()) {
      var fertig = false;
      try { NovaStimme.sprich(s.t, { onEnd: function () { if (fertig) return; fertig = true; clearTimeout(film.t); film.t = setTimeout(weiter, 700); } }); } catch (e) {}
      film.t = setTimeout(function () { fertig = true; weiter(); }, dauer + 9000);
    } else film.t = setTimeout(weiter, dauer);
  }
  function filmStart() {
    film.an = true; film.i = 0; zaehl('film');
    $('filmLeiste').hidden = false; $('filmBtn').textContent = '⏸ Film läuft';
    var p = $('filmPunkte'); p.innerHTML = ''; SZENEN.forEach(function () { p.appendChild(document.createElement('i')); });
    $('buehne').scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'center' });
    filmSzene();
  }
  function filmStopp(ende) {
    film.an = false; clearTimeout(film.t);
    try { if (window.NovaStimme) NovaStimme.stopp(); } catch (e) {}
    $('filmLeiste').hidden = true; $('filmBild').hidden = true; $('filmBtn').textContent = '▶ Film «Zahlen mit Daten»';
    pose(ende === true ? 'winken' : 'ruhig', 2000);
    sag(ende === true ? 'Ende. The Coin Maker · DR Lab · Zahlen mit Daten.' : 'Film angehalten. Du kannst ihn jederzeit neu starten.', 'Leg etwas in den Automaten und zieh am Hebel.');
  }

  /* ---------- Tipps ---------- */
  var TIPPS = [
    ['Schreib Problem, Lösung und Nutzen in je einem Satz. Dann wird die Münze schwerer.', 'Vollständigkeit zählt.'],
    ['Sag, für wen die Idee ist. Für Kinder? Für Eltern? Für Klienten?', 'Umsetzbarkeit zählt.'],
    ['Eine Idee, die schon im Kassenbuch steht, gibt null. Bring mir etwas Neues.', 'Neuheit zählt.'],
    ['Der Kurs ändert sich jeden Tag. Gesuchte Themen bringen mehr.', 'Schau unten beim Wechselkurs.'],
    ['Coins sind Punkte. Man kann sie nicht kaufen und nicht in Franken wechseln.', 'Einlösen nur im Münzladen.'],
    ['Du kannst jede Buchung wieder löschen. Deine Idee bleibt deine Idee.', 'Datenschutz zuerst.']
  ];
  var tippI = Math.floor(Math.random() * TIPPS.length);
  function tipp() { var t = TIPPS[tippI++ % TIPPS.length]; pose('erzaehlen', 2600); sag(t[0], t[1], true); }

  /* ---------- Start ---------- */
  function start() {
    extrasBauen();
    diktat($('mic'), $('txt'));
    diktat($('micW'), $('wIdee'));
    $('kuName').value = ku.name || '';
    $('kuName').addEventListener('change', function () { ku.name = $('kuName').value.trim().slice(0, 40); leg(KU, ku); kuZeigen(); });
    $('wiegen').addEventListener('click', wiegen);
    kuZeigen();
    $('umsatz').addEventListener('input', teilung);
    document.querySelectorAll('.segb').forEach(function (b) { b.addEventListener('click', function () { fee = +b.getAttribute('data-fee'); document.querySelectorAll('.segb').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); pose('kuchen'); teilung(); }); });
    teilung();
    $('werbung').addEventListener('input', kosten); kosten();
    kursWoche();
    $('filmBtn').addEventListener('click', function () { film.an ? filmStopp() : filmStart(); });
    $('filmStopp').addEventListener('click', function () { filmStopp(); });
    $('tippBtn').addEventListener('click', tipp);
    var img = document.querySelector('#cmfig img');
    var klick = ['Hm? Ich poliere gerade eine Münze.', 'Jede Idee hat ihren Wert. Ich sage dir, welchen.', 'Zieh am roten Hebel, dann prüfe ich mit der Lupe.', 'Daten sind das neue Gold. Aber nur, wenn du sie geben willst.'];
    var ki = 0;
    if (img) img.addEventListener('click', function () { if (film.an) return; var p = ['winken', 'lupe', 'nicken', 'freude'][ki % 4]; pose(p); sag(klick[ki++ % klick.length], 'Tipp mich an, ich habe noch mehr zu sagen.', true); });
    $('merkTeilen').addEventListener('change', function () { leg('coinmaker.teilen', $('merkTeilen').checked); if ($('merkTeilen').checked) teilen(); });
    $('merkWeg').addEventListener('click', function () { try { localStorage.removeItem(LK); localStorage.removeItem('coinmaker.einsprueche'); } catch (e) {} L = { tage: [], hebel: 0, ideen: 0, daten: 0, rueck: 0, qSumme: 0, qAnzahl: 0, besteQ: 0, waage: { 5: 0, 2: 0, 0: 0 }, film: 0, einspruch: 0, eingeloest: 0, meinung: 0, diktat: 0 }; merkZeigen(); sag('Vergessen. Ich fange neu an.', ''); });
    zaehl('tageX', 0);
    merkZeigen();
    setTimeout(function () { pose('winken', 1800); }, 600);
  }

  /* ---------- Runde 2: So geht's, Präsentation, Ton ---------- */
  var SCHRITTE = [
    ['💡', 'Idee rein', 'Leg eine Idee, Daten oder eine Rückmeldung in den Automaten.'],
    ['🔍', 'Ich prüfe', 'Ich zieh den Hebel und schau mit der Lupe: neu, klar, brauchbar?'],
    ['🪙', 'Coins raus', 'Coins sind Punkte ohne Geldwert: nie in Franken, nicht kaufbar.']
  ];
  function soGehts() {
    if (hol('coinmaker.sogehts', false)) return;
    var w = document.querySelector('.werk-knoepfe'); if (!w) return;
    var k = document.createElement('section'); k.className = 'card sogehts'; k.id = 'sogehts';
    var h = document.createElement('div'); h.className = 'result-head'; h.innerHTML = '<h2>So geht die Werkstatt</h2><span class="tag">1 · 2 · 3</span>'; k.appendChild(h);
    SCHRITTE.forEach(function (x) { var d = document.createElement('div'); d.className = 'sg-zeile'; var e = document.createElement('span'); e.className = 'sg-em'; e.textContent = x[0]; var t = document.createElement('div'); var b = document.createElement('b'); b.textContent = x[1]; var sp = document.createElement('span'); sp.textContent = x[2]; t.appendChild(b); t.appendChild(sp); d.appendChild(e); d.appendChild(t); k.appendChild(d); });
    var ok = document.createElement('button'); ok.className = 'wk'; ok.type = 'button'; ok.textContent = 'Los geht\u2019s: zum Automaten';
    ok.addEventListener('click', function () { leg('coinmaker.sogehts', true); k.classList.add('weg'); setTimeout(function () { k.remove(); }, 320); var m = document.querySelector('.machine'); if (m) setTimeout(function () { m.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }, 200); pose('nicken'); sag('Gut. Dann leg deine erste Idee in den Automaten.', 'Unten bei «Idee rein».', true); });
    k.appendChild(ok);
    w.parentNode.insertBefore(k, w.nextSibling.nextSibling || null);
  }
  var FOLIEN = [
    ['🤝', 'Zahlen mit Ideen', 'Kleinunternehmen bekommen von DR Lab ihr Konzept und den Aufbau für Social Media. Statt mit Geld zahlen sie mit Ideen, die sie im Gespräch einbringen.'],
    ['⚖️', 'Die Ideen-Waage 5 · 2 · 0', '5 = die Idee bringt DR Lab weiter. 2 = sie macht die App besser und ist gut. 0 = Standard oder doppelt. Strenger wird es mit der Zeit, je mehr Ideen es gibt.'],
    ['🎯', 'Ziel: Ideenwert 200', 'Etwa 6 gute Gespräche, dann ist der Ideenwert erreicht. Das ist eine Schätzung, keine Garantie. Es wird nichts ausbezahlt.'],
    ['🥧', 'Wenn die App läuft', 'Entwurf: 80 % vom Netto-Umsatz bleiben beim Kleinunternehmen, 20 % gehen an DR Lab, weil DR Lab auch Werbung und Pflege macht. Gilt erst mit Vertrag.'],
    ['🔒', 'Deine Daten', 'Du gibst nur, was du geben willst, mit Einwilligung. Ideen bleiben bei DR Lab und werden nicht verkauft. Die Daten sollen verschlüsselt gespeichert werden.'],
    ['🪙', 'Coins', 'Coins sind Punkte ohne Geldwert. Sie zeigen, wie viel deine Ideen bewegt haben. Man kann sie nicht kaufen und nicht in Franken wechseln.']
  ];
  var fi = 0;
  function praesentation() {
    var o = document.createElement('div'); o.className = 'praes'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Präsentation Zahlen mit Ideen');
    o.innerHTML = '<div class="praes-box"><img src="figur-klein.jpg" alt="" width="84" height="84"><small></small><div class="praes-em"></div><h3></h3><p></p><div class="praes-nav"><button type="button" class="wk hell" data-p="-1">‹</button><button type="button" class="wk" data-p="1">Weiter ›</button></div><div class="praes-nav"><button type="button" class="wk hell" data-p="teilen">Teilen</button><button type="button" class="wk hell" data-p="zu">Schliessen</button></div></div>';
    function zeig() { var f = FOLIEN[fi]; o.querySelector('small').textContent = (fi + 1) + ' / ' + FOLIEN.length; o.querySelector('.praes-em').textContent = f[0]; o.querySelector('h3').textContent = f[1]; o.querySelector('p').textContent = f[2];
      o.querySelector('[data-p="-1"]').disabled = fi === 0; o.querySelector('[data-p="1"]').textContent = fi === FOLIEN.length - 1 ? 'Fertig ✓' : 'Weiter ›';
      pose(['winken', 'waage', 'lupe', 'kuchen', 'tresor', 'freude'][fi]); sag(f[1] + '. ' + f[2], '', true); }
    o.addEventListener('click', function (e) {
      var b = e.target.closest('[data-p]'); if (!b) { if (e.target === o) zu(); return; }
      var a = b.getAttribute('data-p');
      if (a === 'zu') return zu();
      if (a === 'teilen') { var url = location.href.split('#')[0] + '#praesentation'; var txt = 'Zahlen mit Ideen – der Coin Maker erklärt es: ' + url;
        if (navigator.share) navigator.share({ title: 'The Coin Maker', text: txt }).catch(function () {}); else location.href = 'https://wa.me/?text=' + encodeURIComponent(txt); return; }
      if (a === '1' && fi === FOLIEN.length - 1) { zaehl('praesentation'); return zu(); }
      fi = Math.max(0, Math.min(FOLIEN.length - 1, fi + (+a))); zeig();
    });
    function zu() { o.remove(); try { speechSynthesis.cancel(); } catch (e) {} if (window.NovaStimme) try { NovaStimme.stopp(); } catch (e) {} }
    fi = 0; document.body.appendChild(o); zeig();
  }
  function runde2() {
    var w = document.querySelector('.werk-knoepfe');
    if (w) {
      var pb = document.createElement('button'); pb.className = 'wk'; pb.id = 'praesBtn'; pb.type = 'button'; pb.textContent = '🤝 Firmen'; pb.setAttribute('aria-label', 'Präsentation für Kleinunternehmen'); pb.addEventListener('click', praesentation); w.appendChild(pb);
      var tb = document.createElement('button'); tb.className = 'wk hell'; tb.id = 'tonBtn'; tb.type = 'button';
      var tz = function () { tb.textContent = hol('coinmaker.ton', true) ? '🔊 Ton an' : '🔈 Ton aus'; };
      tb.addEventListener('click', function () { leg('coinmaker.ton', !hol('coinmaker.ton', true)); tz(); if (!hol('coinmaker.ton', true)) { try { speechSynthesis.cancel(); } catch (e) {} if (window.NovaStimme) try { NovaStimme.stopp(); } catch (e) {} } });
      tz(); w.appendChild(tb);
    }
    soGehts();
    if (location.hash === '#praesentation') setTimeout(praesentation, 400);
    addEventListener('offline', function () { pose('ernst'); sag('Kein Internet. Meine Werkstatt läuft trotzdem.', 'Die zweite Meinung vom Server geht erst wieder mit Internet.'); });
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(function () {});
  }
  var r2css = document.createElement('style');
  r2css.textContent = [
    '.sogehts{border:2px dashed var(--gold,#f2c14e)}.sg-zeile{display:flex;gap:12px;align-items:flex-start;margin:10px 0}.sg-em{font-size:1.8rem;line-height:1}.sg-zeile b{display:block}.sg-zeile span{font-size:.92rem;opacity:.9}',
    '.praes{position:fixed;inset:0;z-index:9000;background:rgba(8,6,22,.82);display:flex;align-items:center;justify-content:center;padding:16px}',
    '.praes-box{width:100%;max-width:420px;background:linear-gradient(170deg,#2a1f4e,#16112a);border:2px solid #c9973a;border-radius:24px;padding:20px 18px;text-align:center;color:#fff4dc;box-shadow:0 20px 60px rgba(0,0,0,.6)}',
    '.praes-box img{width:84px;height:84px;border-radius:50%;border:3px solid #f2c14e;object-fit:cover}.praes-box small{display:block;opacity:.7;margin:4px 0}',
    '.praes-em{font-size:3rem;animation:praesAuf .5s ease-out}.praes-box h3{margin:4px 0 8px;color:#f2c14e}.praes-box p{line-height:1.5;margin:0 0 14px;min-height:6em}',
    '.praes-nav{display:flex;gap:8px;margin-top:8px}.praes-nav .wk{flex:1}.praes-nav .wk:disabled{opacity:.4}',
    '@keyframes praesAuf{from{transform:scale(.5) rotate(-20deg);opacity:0}to{transform:none;opacity:1}}'
  ].join('\n');
  document.head.appendChild(r2css);

  window.CMPlus = { pose: pose, sag: sag, bewertet: bewertet, hebelStart: hebelStart, eingeloest: eingeloest };
  function los() { start(); runde2(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
