/* Hasis Programmladen · Ausbau 19.10.2026
   Hasi spricht nie: nur Posen, Holzschilder und Gesten (kursiv). Kein Vorlesen, keine Sprechblasen.
   Alles bleibt im Browser. Server nur optional (Berater-Auswahl, Lernzahlen mit Häkchen). Keine Schlüssel im Code. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BASE = '../';
  function hol(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function heute() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function esc(x) { return String(x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- Hasi: Pose + Schild + Geste ---------- */
  var REQ = { passt: '👍', nein: '🙅', repariere: '🔧', lesen: '👀', waage: '⚖️', gaehnen: '💤', winken: '👋', huepfen: '🥕', verbeugen: '✨', nicken: '💡', daumen: '👍', schild: '🪧' };
  var poseT = null;
  function hasi(pose, schild, geste, ms) {
    var f = $('hasi'); if (!f) return;
    f.setAttribute('data-pose', pose);
    if (schild) { $('hSchildText').textContent = schild.length > 9 ? schild.slice(0, 8) + '…' : schild; $('hSchildGross').textContent = schild; }
    if (geste) $('hGeste').textContent = geste;
    var r = $('requisit');
    if (r && REQ[pose]) { r.textContent = REQ[pose]; r.classList.remove('zeig'); void r.offsetWidth; r.classList.add('zeig'); }
    clearTimeout(poseT);
    if (ms !== 0) poseT = setTimeout(function () { f.setAttribute('data-pose', 'ruhig'); }, ms || 2600);
    // Tinko-Posenbild, falls hasi/posen/<pose>.jpg liegt: Bild statt gezeichnetem Hasi
    var bild = $('hasiBild');
    if (window.FigurPosen && bild && pose !== 'ruhig') FigurPosen.pruef(pose).then(function (src) {
      if (!src) return; bild.src = src; bild.hidden = false; f.classList.add('mit-bild');
      clearTimeout(bild._t); bild._t = setTimeout(function () { bild.hidden = true; f.classList.remove('mit-bild'); }, ms === 0 ? 4000 : (ms || 2600));
    });
  }
  /* Klänge statt Worte (Hasi spricht nie): Türglocke und Kassen-Pling, abschaltbar */
  var AC = null;
  function klang(art) {
    if (!hol('hasi.ton', true)) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state !== 'running') AC.resume();
      var tone = art === 'pling' ? [1318.5, 1760] : [1046.5, 1318.5, 1046.5];
      tone.forEach(function (fq, i) { var o = AC.createOscillator(), g = AC.createGain(), t0 = AC.currentTime + i * .12;
        o.type = 'sine'; o.frequency.value = fq; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.18, t0 + .01); g.gain.exponentialRampToValueAtTime(.001, t0 + .9);
        o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + 1); });
    } catch (e) {}
  }
  var beruehrt = false; document.addEventListener('pointerdown', function () { beruehrt = true; }, { once: true, capture: true });
  function glocke() { var g = $('glocke'); if (!g) return; g.classList.remove('bimm'); void g.offsetWidth; g.classList.add('bimm'); if (beruehrt) klang('glocke'); }

  /* ---------- Lernzahlen ---------- */
  var LK = 'hasi.lernen';
  function leer() { return { tage: [], wuerfel: 0, probleme: 0, suchen: 0, vorlagen: 0, mitgenommen: 0, code: 0, codeOk: 0, waage: 0, briefe: 0, film: 0, rueebli: 0, lieblingsProblem: {} }; }
  var L = hol(LK, null) || leer();
  function zaehl(k) { L[k] = (L[k] || 0) + 1; var t = heute(); if (L.tage.indexOf(t) < 0) { L.tage.push(t); L.tage = L.tage.slice(-60); } leg(LK, L); merk(); }
  function merk() {
    var kv = $('merkKv'); if (!kv) return; kv.innerHTML = '';
    var top = Object.keys(L.lieblingsProblem || {}).sort(function (a, b) { return L.lieblingsProblem[b] - L.lieblingsProblem[a]; })[0];
    [['Tage im Laden', L.tage.length], ['Würfel angeschaut', L.wuerfel], ['Probleme gezeigt', L.probleme + L.suchen], ['Häufigstes Problem', top ? PROB_NAME[top] || '–' : '–'], ['Werkbank: gebaut · mitgenommen', L.vorlagen + ' · ' + L.mitgenommen], ['Code gelesen · lief', L.code + ' · ' + L.codeOk], ['Auf der Waage', L.waage], ['Rüebli für Tinko', L.rueebli]]
      .forEach(function (r) { var a = document.createElement('span'); a.textContent = r[0]; var b = document.createElement('span'); b.textContent = r[1]; kv.appendChild(a); kv.appendChild(b); });
    $('merkSatz').textContent = !L.wuerfel && !L.probleme ? 'Hasi zückt ein leeres Notizbuch und tippt mit der Pfote darauf: Er merkt sich nur Zahlen, nie Texte.'
      : 'Hasi blättert in seinem Notizbuch und legt das passende Werkzeug schon bereit, wenn du wiederkommst.';
    $('merkTeilen').checked = !!hol('hasi.teilen', false);
  }
  function verbindung() {
    var a = '', k = '';
    try { a = String(JSON.parse(localStorage.getItem('drlab-hermes-adresse')) || '').replace(/\/+$/, ''); k = JSON.parse(localStorage.getItem('drlab-hermes-passwort')) || ''; } catch (e) {}
    return a && k ? { a: a, k: k } : null;
  }
  function teilen() {
    if (!hol('hasi.teilen', false) || hol('hasi.geteilt', '') === heute()) return;
    var v = verbindung(); if (!v) return;
    var z = {}; Object.keys(L).forEach(function (k) { z[k] = k === 'tage' ? L.tage.length : L[k]; });
    fetch(v.a + '/erfahrung', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + v.k }, body: JSON.stringify({ app: 'Hasis Laden', art: 'lernzahlen', frage: JSON.stringify(z), antwort: '' }) })
      .then(function (r) { if (r.ok) leg('hasi.geteilt', heute()); }).catch(function () {});
  }

  /* ---------- Werkzeuge ---------- */
  var W = [
    { id: 'erinnerung', r: 'lab', e: '🔔', g: 'Hasi legt die Pfote aufs Herz und nickt zweimal.', s: 'Liebling', n: 'Erinnerung', k: '#e8b94a', t: 'Termin-Erinnerungen mit Kalender und YouTube-Knopf. Wir richten sie mit deinem Logo und deinen Farben ein.', w: 'Therapeutinnen, Praxen, Coaches', p: 'Eingerichtet CHF 190 einmalig + CHF 9 pro Monat', l: BASE + 'reminder/' },
    { id: 'transkript', r: 'lab', e: '🎙️', g: 'Hasi tippt sich an den Mund, dann zeigt er auf ein Blatt, das sich von selbst füllt.', s: 'Reden!', n: 'Transkript', k: '#6fe3ff', t: 'Reinreden statt tippen. Der Text ist sofort zum Kopieren bereit.', w: 'Selbstständige, Vereine, alle mit vollen Köpfen', p: 'Eingerichtet CHF 150 einmalig', l: BASE + 'transkript/' },
    { id: 'jackie', r: 'lab', e: '👣', g: 'Hasi zeigt einen kleinen Schritt mit zwei Fingern.', s: '1 Schritt', n: "Jacky Roberts", k: '#f2b8c0', t: 'Erzähl, was los ist. Jacky zeigt dir einen klaren nächsten Schritt. Ersetzt keine Therapie.', w: 'Alle, die kurz Ordnung im Kopf wollen', p: 'Pro CHF 4 pro Monat', l: BASE + 'jackie/' },
    { id: 'mondschein', r: 'lab', e: '🌙', g: 'Hasi gähnt, legt die Pfoten unter die Wange und lächelt.', s: 'Gute Nacht', n: 'Mondschein', k: '#9fb4ff', t: 'Otti, Kiki und Nova erzählen Gutenachtgeschichten.', w: 'Familien mit Kindern von 3 bis 9', p: 'Familien-Abo CHF 5 pro Monat', l: BASE + 'mondschein/', pose: 'gaehnen' },
    { id: 'tradeping', r: 'lab', e: '🛎️', g: 'Hasi schüttelt den Kopf beim Geldsack, dann zeigt er auf eine kleine Glocke.', s: 'Nur Ping', n: 'TradePing', k: '#8fe3a8', t: 'Ein Ping, nur wenn es zählt. Radar für deine Titel. Keine Anlageberatung.', w: 'Privatleute mit eigenem Depot', p: 'Pro CHF 6 pro Monat', l: BASE + 'tradeping/' },
    { id: 'humanspark', r: 'lab', e: '🤝', g: 'Hasi winkt dich an den Tresen und zeigt auf einen Stuhl.', s: 'Erst reden', n: 'HumanSpark', k: '#ff9f7a', t: 'Finger drauf, messen, reinreden. Für ruhigere Teams.', w: 'Firmen-Teams', p: 'Auf Anfrage', l: BASE + 'humanspark/', pose: 'winken' },
    { id: 'milulu', r: 'lab', e: '💃', g: 'Hasi tanzt drei kleine Schritte und tippt auf die 1.', s: '1-2-3', n: 'Milulu', k: '#ff8a7a', t: 'Salsa, Merengue, Bachata und Cumbia lernen, mit Band im Handy und Tipp-Feedback.', w: 'Alle, die tanzen lernen wollen, auch Kinder', p: 'Gratis ausprobieren', l: BASE + 'carmen/', pose: 'huepfen' },
    { id: 'granny', r: 'lab', e: '🌹', g: 'Hasi sucht seine Brille, findet sie auf dem Kopf und lacht lautlos.', s: 'Für Oma', n: 'Granny', k: '#f2b8c0', t: 'Der einfachste Bildschirm für ältere Menschen: ein Knopf zum Reden, Fotos zum Anrufen, die Familie richtet ein.', w: 'Familien mit älteren Eltern', p: 'Gratis ausprobieren, Einrichten auf Anfrage', l: BASE + 'granny/', pose: 'nicken' },
    { id: 'waefwaef', r: 'lab', e: '🐶', g: 'Hasi macht mit den Pfoten Hundeohren und wedelt mit dem Stummelschwanz.', s: 'Wäf!', n: 'Wäf Wäf', k: '#9fd3f5', t: 'Die Familien-App für einen kleinen Hund: wer geht raus, allein bleiben üben, Hund verstehen.', w: 'Familien mit Hund', p: 'Gratis ausprobieren', l: BASE + 'waefwaef/', pose: 'huepfen' },
    { id: 'builder', r: 'garten', e: '🥕', g: 'Hasi zieht ein goldenes Rüebli aus dem Code-Garten.', s: 'Frisch!', n: 'Lab Builder', k: '#c9a2ff', t: 'Deine eigene kleine App. Du bringst die Idee, wir bauen.', w: 'Kleinunternehmen', p: 'Auf Anfrage, auch mit Ideen statt Geld', l: BASE + 'apps/', pose: 'huepfen' },
    { id: 'wb-liste', r: 'garten', e: '✅', g: 'Hasi hakt mit der Pfote drei Kästchen in der Luft ab.', s: 'Werkbank', n: 'Checkliste (Werkbank)', k: '#e8b94a', t: 'Deine eigene Checkliste mit Name und Farbe. Gleich unten auf der Werkbank bauen und mitnehmen.', w: 'Läden, Praxen, Vereine', p: 'Gratis selbst bauen', vorlage: 'liste' },
    { id: 'wb-rechner', r: 'garten', e: '🧮', g: 'Hasi zählt an den Pfoten und nickt.', s: 'Werkbank', n: 'Preisrechner (Werkbank)', k: '#8fe3a8', t: 'Menge mal Preis, mit deinem Namen und deiner Farbe.', w: 'Kleine Läden, Märkte', p: 'Gratis selbst bauen', vorlage: 'rechner' },
    { id: 'wb-quiz', r: 'garten', e: '❓', g: 'Hasi hält ein Fragezeichen hoch, dann eine Glühbirne.', s: '? → 💡', n: 'Quiz (Werkbank)', k: '#9fb4ff', t: 'Fragen und Antworten für Kurse, Schule oder Team.', w: 'Lehrer, Kurse, Vereine', p: 'Gratis selbst bauen', vorlage: 'quiz' },
    { id: 'zeichentafel', r: 'offen', e: '✏️', g: 'Hasi malt mit der Pfote einen Kreis in die Luft und legt den Würfel auf die goldene Waage.', s: 'Prüfung', n: 'Hasis Zeichentafel', k: '#6fe3ff', t: 'Eine Wandtafel zum Skizzieren: Abläufe, Pläne, Ideen. Die Zeichnungen bleiben im Browser.', w: 'Praxen, Coaches, Handwerker, Schulen', p: 'Noch nicht im Regal · wartet auf Sicherheitsprüfung und Diegos Go', lic: 'Basiert auf dem Open-Source-Programm Excalidraw, Lizenz MIT, Copyright (c) 2020 Excalidraw. Grundprogramm gratis, wir würden nur Einrichten und Hilfe anbieten.', candidate: true }
  ];
  var REGAL_TEXT = {
    lab: 'Unsere eigenen Programme. Alle Rechte bei Hasis Laden.',
    offen: 'Geprüfte Gratis-Programme anderer Erfinder, nur mit freier Lizenz. Hasi verkauft nie den fremden Code, nur Einrichten und Hilfe, und erst nach Go.',
    garten: 'Frisch aus Hasis Code-Garten: Vorlagen für die Werkbank und Bau auf Bestellung.'
  };
  function cube(c) { return '<svg class="icon" viewBox="0 0 44 44" aria-hidden="true"><path d="M22 3 40 13v18L22 41 4 31V13Z" fill="' + c + '" opacity=".25"/><path d="M22 3 40 13 22 23 4 13Z" fill="' + c + '" opacity=".7"/><path d="M22 23v18M4 13l18 10 18-10" stroke="' + c + '" stroke-width="1.5" fill="none"/></svg>'; }
  function wuerfelKnopf(x) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'wuerfel' + (x.r === 'offen' ? ' fremd' : ''); b.setAttribute('data-w', x.id);
    b.innerHTML = cube(x.k) + '<strong>' + esc(x.n) + '</strong><span>' + esc(x.t.split('. ')[0]) + '.</span>' + (x.lic ? '<span class="abz">Lizenz MIT · wird geprüft</span>' : '') + '<span class="preis">' + esc(x.p) + '</span>';
    b.addEventListener('click', function () { zeige(x.id); });
    return b;
  }
  var regalJetzt = 'lab';
  function regal(r) {
    regalJetzt = r;
    document.querySelectorAll('.reiter button').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-r') === r)); });
    $('regalText').textContent = REGAL_TEXT[r];
    var box = $('regal'); box.innerHTML = '';
    W.filter(function (x) { return x.r === r; }).forEach(function (x) { box.appendChild(wuerfelKnopf(x)); });
  }
  function zeige(id) {
    var x = W.filter(function (w) { return w.id === id; })[0]; if (!x) return;
    zaehl('wuerfel'); glocke();
    if (x.vorlage) { $('wb-art').value = x.vorlage; wbStandard(x.vorlage); wb(); hasi('repariere', 'Werkbank', x.g); $('wb-art').scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'center' }); return; }
    var t = $('tresen'); t.hidden = false;
    $('holo').innerHTML = '<div class="strahl"></div><div class="w" style="--c:' + x.k + '"></div><span class="emo">' + x.e + '</span>';
    $('t-name').textContent = x.n; $('t-text').textContent = x.t; $('t-wer').textContent = x.w; $('t-preis').textContent = x.p;
    var a = $('t-link');
    if (x.l) { a.hidden = false; a.href = x.l; } else a.hidden = true;
    $('t-lizenz').textContent = x.lic || (x.r === 'lab' ? 'Eigenes Programm aus Hasis Laden.' : '');
    hasi(x.candidate ? 'waage' : (x.pose || 'schild'), x.s, x.g, 3200);
    t.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'nearest' });
  }

  /* ---------- Berater ---------- */
  var PROB = [
    ['termine', 'Ich vergesse Termine', ['erinnerung'], /termin|vergess|erinner|kalender|abmach/i],
    ['tippen', 'Ich tippe ungern', ['transkript'], /tipp|schreib|diktier|sprech|reden|notiz/i],
    ['kopf', 'Mein Kopf ist voll', ['jackie'], /kopf|ordnung|stress|überforder|ratlos|nächst/i],
    ['nacht', 'Abendritual für Kinder', ['mondschein'], /kind|nacht|schlaf|abend|geschicht/i],
    ['kurse', 'Ich will Kurse im Blick', ['tradeping'], /aktie|kurs|depot|börse|preisalarm/i],
    ['team', 'Mein Team ist gestresst', ['humanspark'], /team|firma|mitarbeit|kolleg/i],
    ['skizze', 'Ich will etwas skizzieren', ['zeichentafel'], /skizz|zeichn|plan|tafel|mal/i],
    ['liste', 'Ich brauche eine Checkliste', ['wb-liste'], /liste|check|abhak|aufgab|kasse|putz|ablauf/i],
    ['preise', 'Ich will Preise rechnen', ['wb-rechner'], /preis|rechn|kost|offert|menge/i],
    ['quiz', 'Ich will etwas abfragen', ['wb-quiz'], /quiz|frage|lern|test|prüf/i],
    ['tanzen', 'Ich will tanzen lernen', ['milulu'], /tanz|salsa|bachata|merengue|cumbia|musik/i],
    ['eltern', 'Meine Eltern werden vergesslich', ['granny', 'erinnerung'], /eltern|mutter|vater|oma|opa|alt|vergesslich|demenz/i],
    ['hund', 'Wir haben einen Hund', ['waefwaef'], /hund|welpe|gassi|spazier/i],
    ['app', 'Ich brauche eine eigene App', ['builder'], /app|eigene|programm|idee/i]
  ];
  var PROB_NAME = {}; PROB.forEach(function (p) { PROB_NAME[p[0]] = p[1]; });
  function treffer(ids, geste) {
    var box = $('treffer'); box.innerHTML = '';
    document.querySelectorAll('.wuerfel').forEach(function (b) { b.classList.remove('leuchtet'); });
    if (!ids.length) { hasi('nein', 'Werkbank?', 'Hasi kratzt sich am Ohr, schüttelt den Kopf und zeigt dann auf die Werkbank: Dort baut er es dir.'); return; }
    ids.slice(0, 3).forEach(function (id) { var x = W.filter(function (w) { return w.id === id; })[0]; if (x) { var b = wuerfelKnopf(x); b.classList.add('leuchtet'); box.appendChild(b); } });
    hasi('passt', 'Passt!', geste || 'Hasi öffnet mit dem goldenen Schlüssel eine Vitrine und legt dir die passenden Würfel hin.');
  }
  function lokalSuchen(text) {
    var ids = [];
    PROB.forEach(function (p) { if (p[3].test(text)) p[2].forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); }); });
    return ids.slice(0, 3);
  }
  function suchen() {
    var text = $('eigenes').value.trim(); if (text.length < 3) { $('eigenes').focus(); return; }
    zaehl('suchen');
    hasi('lesen', '…', 'Hasi spitzt die Ohren und liest deinen Satz Wort für Wort.', 0);
    var lokal = lokalSuchen(text);
    var v = verbindung();
    if (!v) { setTimeout(function () { treffer(lokal); }, ruhig ? 0 : 900); return; }
    var liste = W.map(function (w) { return w.id + ': ' + w.n + ' – ' + w.t; }).join('\n');
    fetch(v.a + '/v1/chat/completions', { signal:(window.AbortSignal&&AbortSignal.timeout)?AbortSignal.timeout(9000):undefined, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + v.k, 'X-Nova-App': 'Hasis Laden' },
      body: JSON.stringify({ model: 'sense-engine', max_tokens: 60, messages: [{ role: 'system', content: 'Du wählst für Hasis Programmladen 0 bis 3 passende Werkzeuge aus dieser Liste. Antworte nur mit den ids, durch Komma getrennt, ohne weiteren Text. Wenn nichts passt, antworte: keine.\n' + liste }, { role: 'user', content: text }] }) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var a = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || '';
        var ids = a.split(/[\s,]+/).map(function (s) { return s.trim(); }).filter(function (s) { return W.some(function (w) { return w.id === s; }); });
        treffer(ids.length ? ids : lokal);
      }).catch(function () { treffer(lokal); if (window.R8) R8.toast('Ohne Verbindung: Hasi sucht im eigenen Regal.'); });
  }

  /* ---------- Werkbank ---------- */
  var STANDARD = {
    liste: ['Einträge (durch Komma getrennt)', 'Ofen an, Teig ruhen lassen, Kasse zählen, Tür abschliessen'],
    rechner: ['Preis pro Stück in CHF', '4.50'],
    erinnerung: ['Termin (z. B. 2026-11-05 10:00) und Titel', '2026-11-05 10:00, Kontrolle beim Zahnarzt'],
    quiz: ['Fragen als Frage = Antwort, durch Komma getrennt', 'Wie viele Beine hat ein Hase? = 4, Welche Farbe hat Hasis Schürze? = Nachtblau'],
    karte: ['Telefon, Mail, Adresse (durch Komma getrennt)', '044 000 00 00, hallo@beispiel.ch, Hauptgasse 1']
  };
  function wbStandard(a) { $('wb-text-l').textContent = STANDARD[a][0]; $('wb-text').value = STANDARD[a][1]; }
  function wbDaten() {
    return { a: $('wb-art').value, n: $('wb-name').value.trim() || 'Mein Programm', f: /^#[0-9a-f]{6}$/i.test($('wb-farbe').value) ? $('wb-farbe').value : '#c2702f', t: $('wb-text').value.split(',').map(function (x) { return x.trim(); }).filter(Boolean) };
  }
  function wbHtml(d, eigen) {
    var h = '<h4 style="color:' + d.f + '">' + esc(d.n) + '</h4>';
    if (d.a === 'liste') h += '<ul style="list-style:none;padding:0">' + d.t.map(function (x, i) { return '<li><label><input type="checkbox" data-i="' + i + '" style="width:auto;accent-color:' + d.f + '"> ' + esc(x) + '</label></li>'; }).join('') + '</ul>';
    if (d.a === 'rechner') { var pr = parseFloat((d.t[0] || '4.50').replace(',', '.')) || 0; h += '<p>Menge</p><input class="wb-m" type="number" value="3" min="0" style="width:100%;padding:8px;border-radius:8px"><p>Preis pro Stück: CHF ' + pr.toFixed(2) + '</p><p style="font-weight:800;color:' + d.f + '" class="wb-r" data-p="' + pr + '">Total CHF ' + (3 * pr).toFixed(2) + '</p>'; }
    if (d.a === 'erinnerung') h += '<p>Nächster Termin: <b>' + esc(d.t[1] || 'Termin') + '</b><br>' + esc(d.t[0] || '') + '</p><button class="wb-ics" style="background:' + d.f + '">In meinen Kalender</button>';
    if (d.a === 'quiz') h += d.t.map(function (q, i) { var p = q.split('='); return '<p><b>' + esc((p[0] || '').trim()) + '</b><br><button class="wb-q" data-i="' + i + '" style="background:' + d.f + '">Antwort zeigen</button> <span class="wb-a" data-i="' + i + '" hidden>' + esc((p[1] || '').trim()) + '</span></p>'; }).join('');
    if (d.a === 'karte') h += '<p style="font-size:15px;line-height:1.7">' + d.t.map(esc).join('<br>') + '</p><div style="height:6px;border-radius:3px;background:' + d.f + '"></div>';
    if (eigen) h += '<p style="font-size:11px;color:#777;margin-top:16px">Gebaut in Hasis Werkbank</p>';
    return h;
  }
  function wbBeleben(root, d) {
    var m = root.querySelector('.wb-m'), r = root.querySelector('.wb-r');
    if (m && r) m.addEventListener('input', function () { r.textContent = 'Total CHF ' + ((+m.value || 0) * (+r.getAttribute('data-p'))).toFixed(2); });
    root.querySelectorAll('.wb-q').forEach(function (b) { b.addEventListener('click', function () { var a = root.querySelector('.wb-a[data-i="' + b.getAttribute('data-i') + '"]'); if (a) a.hidden = false; }); });
    var ics = root.querySelector('.wb-ics');
    if (ics) ics.addEventListener('click', function () { icsLaden(d); });
  }
  function icsZeit(s) { var m = /(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})/.exec(s || ''); return m ? m[1] + m[2] + m[3] + 'T' + ('0' + m[4]).slice(-2) + m[5] + '00' : null; }
  function icsLaden(d) {
    var z = icsZeit(d.t[0]); if (!z) { hasi('nein', 'Datum?', 'Hasi tippt auf das Datum: So schreiben, 2026-11-05 10:00.'); return; }
    var txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hasis Laden//Werkbank//DE', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@hasi', 'DTSTAMP:' + z, 'DTSTART:' + z, 'SUMMARY:' + (d.t[1] || d.n).replace(/[\r\n,;]/g, ' '), 'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:Erinnerung', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    laden(new Blob([txt], { type: 'text/calendar' }), 'termin.ics');
    hasi('daumen', 'Läuft', 'Hasi reicht dir einen kleinen Kalenderzettel.');
  }
  function laden(blob, name) {
    try { var u = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 1500); } catch (e) {}
  }
  var wbT = null;
  function wb() {
    var d = wbDaten(), v = $('wb-vorschau');
    v.innerHTML = wbHtml(d, false); wbBeleben(v, d);
    clearTimeout(wbT); wbT = setTimeout(function () { zaehl('vorlagen'); hasi('repariere', '🔧', 'Hasi hämmert vorsichtig an deinem Programm und poliert es.', 1600); }, 900);
  }
  function mitnehmen() {
    var d = wbDaten();
    var js = 'document.querySelectorAll(".wb-q").forEach(function(b){b.onclick=function(){var a=document.querySelector(".wb-a[data-i=\\""+b.dataset.i+"\\"]");if(a)a.hidden=false}});' +
      'var m=document.querySelector(".wb-m"),r=document.querySelector(".wb-r");if(m&&r)m.oninput=function(){r.textContent="Total CHF "+((+m.value||0)*(+r.dataset.p)).toFixed(2)};' +
      'var K="hasi-liste-"+document.title;document.querySelectorAll("input[type=checkbox]").forEach(function(c){try{c.checked=JSON.parse(localStorage.getItem(K)||"{}")[c.dataset.i]||false}catch(e){}c.onchange=function(){var s={};document.querySelectorAll("input[type=checkbox]").forEach(function(x){s[x.dataset.i]=x.checked});try{localStorage.setItem(K,JSON.stringify(s))}catch(e){}}});';
    var html = '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(d.n) + '</title><style>body{font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:20px 16px;color:#1b1b1b;background:#fff}button{border:0;border-radius:8px;padding:8px 12px;color:#fff;font-weight:800}li{margin:8px 0}input{font-size:16px}</style></head><body>' + wbHtml(d, true) + '<script>' + js + '<\/script></body></html>';
    var name = d.n.toLowerCase().replace(/[^a-z0-9äöü]+/g, '-').replace(/^-|-$/g, '') || 'programm';
    laden(new Blob([html], { type: 'text/html' }), name + '.html');
    zaehl('mitgenommen');
    hasi('daumen', 'Läuft', 'Hasi packt dein Programm in einen leuchtenden Würfel und gibt ihn dir mit.');
  }
  function bestellen() {
    var t = $('bestellung').value.trim(); if (t.length < 8) { $('bestellung').focus(); return; }
    var b = hol('hasi.briefe', []); b.push({ tag: heute(), text: t.slice(0, 500) }); leg('hasi.briefe', b.slice(-20));
    $('bestellung').value = ''; zaehl('briefe');
    var f = document.createElement('span'); f.className = 'brief-flug'; f.textContent = '💌'; $('buehne').appendChild(f); setTimeout(function () { f.remove(); }, 2300);
    setTimeout(function () { glocke(); hasi('nicken', 'Notiert', 'Letti bringt den goldenen Brief. Hasi liest ihn, nickt und steckt ihn in die Schürzentasche.'); }, ruhig ? 0 : 1800);
    briefeZeigen();
  }
  function briefeZeigen() { var b = hol('hasi.briefe', []); $('briefe').textContent = b.length ? b.length + ' Brief' + (b.length > 1 ? 'e' : '') + ' auf diesem Gerät. Mit Server und Go gehen sie später an Hasi.' : ''; }

  /* ---------- Code lesen ---------- */
  var SCHLUESSEL = /(sk-[A-Za-z0-9_-]{12,}|ghp_[A-Za-z0-9]{12,}|AKIA[0-9A-Z]{12,}|api[_-]?key\s*[:=]\s*["'][^"']{6,}|passwor[dt]\s*[:=]\s*["'][^"']{3,}|secret\s*[:=]\s*["'][^"']{6,}|-----BEGIN [A-Z ]*PRIVATE KEY)/i;
  function sprache(c) {
    var s = c.trim();
    if (/^[\[{]/.test(s)) return 'JSON';
    if (/^<(!doctype|html|div|p|span|section|body|head|svg|\w+)/i.test(s)) return 'HTML';
    if (/^\s*(def |import |from \w+ import|print\(|class \w+:|if __name__)/m.test(s)) return 'Python';
    if (/^\s*[.#]?[\w-]+\s*\{[^}]*:[^}]*\}/m.test(s) && !/function|=>|var |let |const /.test(s)) return 'CSS';
    if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE)\b/i.test(s)) return 'SQL';
    return 'JavaScript';
  }
  function klammern(c) {
    var st = [], P = { ')': '(', ']': '[', '}': '{' }, Z = { '(': ')', '[': ']', '{': '}' }, q = null;
    for (var i = 0; i < c.length; i++) {
      var ch = c[i];
      if (q) { if (ch === '\\') { i++; continue; } if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { q = ch; continue; }
      if (Z[ch]) st.push(ch); else if (P[ch]) { if (st.pop() !== P[ch]) return { ok: false, extra: true }; }
    }
    return { ok: !st.length, fehlt: st.reverse().map(function (x) { return Z[x]; }).join('') };
  }
  var reparatur = '';
  function codeLesen() {
    var c = $('code').value; var erg = $('codeErg'); $('reparieren').hidden = true; reparatur = '';
    if (!c.trim()) { $('code').focus(); return; }
    zaehl('code');
    hasi('lesen', '…', 'Hasis Ohren wackeln, seine Pfote fährt über die leuchtenden Codezeilen.', 0);
    setTimeout(function () {
      var sp = sprache(c), ok = true, grund = '';
      if (SCHLUESSEL.test(c)) { erg.innerHTML = '<span class="lampe rot"></span><span>' + sp + ': Da steht ein Schlüssel oder Passwort im Code. Bitte rausnehmen.</span>'; hasi('nein', '🔑 raus!', 'Hasi hält sich die Augen zu und schüttelt den Kopf: Schlüssel gehören nie in den Code.'); return; }
      if (sp === 'JSON') { try { JSON.parse(c); } catch (e) { ok = false; grund = e.message; } }
      else if (sp === 'JavaScript') { try { new Function(c); } catch (e) { ok = false; grund = e.message; } }
      else if (sp === 'HTML') { var auf = (c.match(/<(div|p|span|section|ul|li|button|a|h[1-6]|main|header|footer|body|html|head)\b[^>]*>/gi) || []).length, zu = (c.match(/<\/(div|p|span|section|ul|li|button|a|h[1-6]|main|header|footer|body|html|head)>/gi) || []).length; if (auf !== zu) { ok = false; grund = auf + ' öffnende und ' + zu + ' schliessende Tags'; } }
      var k = klammern(c);
      if (ok && sp !== 'HTML' && !k.ok) { ok = false; grund = k.extra ? 'eine Klammer zu viel' : 'es fehlt ' + k.fehlt; }
      if (!ok && !k.ok && !k.extra && k.fehlt) { reparatur = k.fehlt; grund = 'Am Ende fehlt ' + k.fehlt; }
      if (ok) { zaehl('codeOk'); erg.innerHTML = '<span class="lampe gruen"></span><span>' + sp + ': Daumen hoch, das läuft.</span>'; hasi('daumen', 'Läuft', 'Hasi streckt den Daumen hoch und wackelt zufrieden mit den Ohren.'); }
      else { erg.innerHTML = '<span class="lampe ' + (reparatur ? 'gelb' : 'rot') + '"></span><span>' + sp + ': ' + esc(grund) + '</span>'; hasi(reparatur ? 'repariere' : 'nein', reparatur ? '🔧' : 'Fehler', reparatur ? 'Hasi zieht den Schraubenschlüssel aus der Schürze: Das kann er reparieren.' : 'Hasi schüttelt den Kopf und zeigt auf die Stelle.'); $('reparieren').hidden = !reparatur; }
    }, ruhig ? 0 : 1100);
  }
  function codeReparieren() { if (!reparatur) return; $('code').value = $('code').value.replace(/\s*$/, '') + reparatur; reparatur = ''; $('reparieren').hidden = true; codeLesen(); }

  /* ---------- Goldene Waage (Erfinder) ---------- */
  function wiegen(e) {
    e.preventDefault();
    var o = $('f-ok'), lz = $('f-lizenz').value;
    var haken = ['f-schluessel', 'f-daten', 'f-verspr', 'f-gepflegt', 'f-recht'].filter(function (id) { return $(id).checked; }).length;
    zaehl('waage');
    var farbe, text, pose, schild, geste;
    if (!lz || lz === 'Keine Lizenz') { farbe = 'rot'; text = 'Ohne Lizenz darf Hasi das Programm nicht ins Regal stellen. Alle Rechte liegen dann beim Erfinder.'; pose = 'nein'; schild = 'Tabu'; geste = 'Hasi schüttelt den Kopf und schliesst die Vitrine.'; }
    else if (lz === 'GPL / AGPL' || lz === 'Andere') { farbe = 'gelb'; text = 'Diese Lizenz nimmt Hasi vorerst nicht. Nur MIT, Apache 2.0 oder BSD.'; pose = 'nein'; schild = 'Vorerst nein'; geste = 'Hasi wiegt den Würfel, die Waage schwankt. Er legt ihn freundlich zurück.'; }
    else if (haken < 5) { farbe = 'gelb'; text = 'Lizenz passt. Es fehlen noch ' + (5 - haken) + ' Häkchen, dann kann Hasi prüfen.'; pose = 'schild'; schild = 'Fast!'; geste = 'Hasi zeigt auf die leeren Kästchen.'; }
    else { farbe = 'gruen'; text = 'Die Waage leuchtet grün. Als Nächstes prüft Claude Sicherheit und Lizenz, dann entscheidet Diego. Im Entwurf wurde nichts gesendet.'; pose = 'waage'; schild = 'Wird geprüft'; geste = 'Hasi legt den Würfel auf die goldene Waage. Sie leuchtet grün. Er klebt ein Etikett mit dem Namen der Erfinderin dran.'; }
    o.innerHTML = '<span class="lampe ' + farbe + '"></span><span>' + esc(text) + '</span>';
    hasi(pose, schild, geste, 3200); glocke();
  }

  /* ---------- Rüebli für Tinko ---------- */
  function rueebli() {
    zaehl('rueebli');
    var r = document.createElement('span'); r.className = 'rueebli-flug'; r.textContent = '🥕'; $('buehne').appendChild(r); setTimeout(function () { r.remove(); }, 1700);
    hasi('huepfen', '♥', 'Hasi schiebt Tinko heimlich ein goldenes Rüebli zu. Beide grinsen. Beste Freunde.', 2400);
  }

  /* ---------- Film «Hasis Werkzeugladen» ---------- */
  var SZ = [
    { p: 'verbeugen', s: 'Offen', b: '🌙 🏪 ✨', t: 'Nacht in der Stadt. Das goldene Schild leuchtet: Hasis Programmladen. Gegenüber funkelt Tinkos Werkstatt.' },
    { p: 'ruhig', s: '…', b: '🐙 💨 🔧', t: 'Tinko kommt mit zerzausten Tentakeln aus der Werkstatt. Hinter ihm raucht ein Erfinder-Problem. Er läuft rüber zu Hasi.' },
    { p: 'nicken', s: '? → 💡', b: '❓ 💡', t: 'Hasi hört zu, nickt und hält ein Schild hoch: ein Fragezeichen, dann eine Glühbirne.' },
    { p: 'waage', s: 'Geprüft', b: '🗝️ ⚖️ ✅', t: 'Hasi öffnet mit dem goldenen Schlüssel eine Vitrine. Er legt einen Würfel auf die goldene Waage. Sie leuchtet grün. Am Würfel klebt der Name der Erfinderin.' },
    { p: 'daumen', s: 'Passt!', b: '🧊 ✨ 🛠️', t: 'Der Würfel entfaltet sich als cyan-goldenes Hologramm und wird ein Werkzeug. Tinko strahlt und greift mit vielen Tentakeln zu.' },
    { p: 'winken', s: 'Für dich', b: '🥖 📚 🧒', t: 'Eine Bäckerin, ein Lehrer und ein Kind kommen herein. Jeder zeigt sein Problem. Hasi zeigt jedem einen anderen Würfel.' },
    { p: 'huepfen', s: '♥', b: '🥕 🐙 🐰', t: 'Hasi schiebt Tinko heimlich ein goldenes Rüebli zu. Beide grinsen. Beste Freunde.' },
    { p: 'schild', s: 'Geh zu Hasi', b: '🧰', t: 'Brauchst du ein Werkzeug? Geh zu Hasi.' }
  ];
  var film = { an: false, i: 0, t: null };
  function filmSzene() {
    if (!film.an) return;
    if (film.i >= SZ.length) return filmStopp(true);
    var s = SZ[film.i];
    $('filmNr').textContent = 'Szene ' + (film.i + 1) + ' / ' + SZ.length;
    var pk = $('filmPunkte').children; for (var k = 0; k < pk.length; k++) pk[k].className = k <= film.i ? 'an' : '';
    var fs = $('filmSzene'); fs.hidden = false; fs.innerHTML = s.b.split(' ').map(function (c) { return '<span>' + c + '</span>'; }).join('');
    var u = $('untertitel'); u.hidden = false; u.textContent = s.t;
    if (film.i === 0 || film.i === 5) glocke();
    if (film.i === 6) { var r = document.createElement('span'); r.className = 'rueebli-flug'; r.textContent = '🥕'; $('buehne').appendChild(r); setTimeout(function () { r.remove(); }, 1700); }
    hasi(s.p, s.s, 'Hasi spielt die Szene ohne ein Wort. Der Erzähler steht im Untertitel.', 0);
    clearTimeout(film.t); film.t = setTimeout(function () { film.i++; filmSzene(); }, Math.max(5000, s.t.split(' ').length * 400));
  }
  function filmStart() {
    film.an = true; film.i = 0; zaehl('film');
    $('filmLeiste').hidden = false; $('filmBtn').textContent = '⏸ Film läuft';
    var p = $('filmPunkte'); p.innerHTML = ''; SZ.forEach(function () { p.appendChild(document.createElement('i')); });
    $('buehne').scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    filmSzene();
  }
  function filmStopp(ende) {
    film.an = false; clearTimeout(film.t);
    $('filmLeiste').hidden = true; $('filmSzene').hidden = true; $('untertitel').hidden = true; $('filmBtn').textContent = '▶ Film «Hasis Werkzeugladen»';
    hasi(ende === true ? 'verbeugen' : 'ruhig', ende === true ? 'Ende' : 'Pause', ende === true ? 'Hasi verbeugt sich. Vorhang.' : 'Hasi hält den Finger an die Lippen: Film angehalten.');
  }

  /* ---------- Start ---------- */
  function start() {
    var pc = $('probleme');
    PROB.forEach(function (p, idx) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = p[1]; b.setAttribute('aria-pressed', 'false');
      if (idx >= 6) { b.hidden = true; b.classList.add('chip-mehr'); }
      b.addEventListener('click', function () {
        summ(10);
        pc.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        zaehl('probleme'); L.lieblingsProblem[p[0]] = (L.lieblingsProblem[p[0]] || 0) + 1; leg(LK, L); merk();
        treffer(p[2]);
      });
      pc.appendChild(b);
    });
    // Runde 3: erst sechs Probleme, der Rest hinter «Mehr»
    if (PROB.length > 6) {
      var mb = document.createElement('button'); mb.type = 'button'; mb.className = 'chip chip-toggle'; mb.textContent = '＋ ' + (PROB.length - 6) + ' weitere'; mb.setAttribute('aria-expanded', 'false');
      mb.addEventListener('click', function () { pc.querySelectorAll('.chip-mehr').forEach(function (x) { x.hidden = false; x.classList.add('chip-neu'); }); mb.remove(); });
      pc.appendChild(mb);
    }
    var KUNDEN = [['🥐 Ich bin Bäckerin', ['wb-rechner', 'wb-liste', 'erinnerung'], 'Hasi zeigt auf die Waage für Mehl und dann auf eine Liste.'], ['🍎 Ich bin Lehrer', ['wb-quiz', 'transkript', 'zeichentafel'], 'Hasi hält eine kleine Tafel hoch und malt ein Fragezeichen.'], ['🧸 Ich bin ein Kind', ['mondschein', 'milulu'], 'Hasi hüpft einmal und legt dann die Pfoten unter die Wange.']];
    var kz = document.createElement('div'); kz.className = 'chips kunden'; kz.id = 'kunden';
    var kl = document.createElement('p'); kl.className = 'sub'; kl.textContent = 'Oder sag Hasi, wer du bist:';
    KUNDEN.forEach(function (k) { var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = k[0];
      b.addEventListener('click', function () { zaehl('probleme'); glocke(); hasi('verbeugen', 'Hallo!', k[2], 2200); setTimeout(function () { treffer(k[1]); }, ruhig ? 0 : 700); }); kz.appendChild(b); });
    pc.parentNode.insertBefore(kl, pc.nextSibling); pc.parentNode.insertBefore(kz, kl.nextSibling);
    $('suchen').addEventListener('click', suchen);
    $('eigenes').addEventListener('keydown', function (e) { if (e.key === 'Enter') suchen(); });
    document.querySelectorAll('.reiter button').forEach(function (b) { b.addEventListener('click', function () { regal(b.getAttribute('data-r')); hasi('schild', b.textContent.split('-')[0].split(' ')[0], 'Hasi zeigt mit dem goldenen Schlüssel auf das ' + b.textContent + '.', 1800); }); });
    regal('lab');
    $('wb-art').addEventListener('change', function () { wbStandard($('wb-art').value); wb(); });
    ['wb-name', 'wb-farbe', 'wb-text'].forEach(function (i) { $(i).addEventListener('input', wb); });
    var v = $('wb-vorschau'); v.innerHTML = wbHtml(wbDaten(), false); wbBeleben(v, wbDaten());
    $('wb-mit').addEventListener('click', mitnehmen);
    $('bestellen').addEventListener('click', bestellen); briefeZeigen();
    $('lesen').addEventListener('click', codeLesen);
    $('reparieren').addEventListener('click', codeReparieren);
    $('anmelden').addEventListener('submit', wiegen);
    $('werkstatt').addEventListener('click', rueebli);
    $('tinkoBtn').addEventListener('click', rueebli);
    $('filmBtn').addEventListener('click', function () { film.an ? filmStopp() : filmStart(); });
    $('filmStopp').addEventListener('click', function () { filmStopp(); });
    var gesten = [['winken', 'Hallo', 'Hasi winkt dir mit der Pfote zu.'], ['nicken', '💡', 'Hasi tippt sich an die Stirn: Er hat eine Idee.'], ['verbeugen', 'Willkommen', 'Hasi verbeugt sich höflich.'], ['huepfen', '🥕', 'Hasi hüpft vor Freude einmal hoch.'], ['lesen', 'Ohren', 'Hasi wackelt mit den Ohren. Eins steht, eins ist geknickt.']];
    var gi = 0;
    $('hasi').addEventListener('click', function () { if (film.an) return; var g = gesten[gi++ % gesten.length]; hasi(g[0], g[1], g[2], 2200); });
    $('merkTeilen').addEventListener('change', function () { leg('hasi.teilen', $('merkTeilen').checked); if ($('merkTeilen').checked) teilen(); });
    $('merkWeg').addEventListener('click', function () { try { localStorage.removeItem(LK); } catch (e) {} L = leer(); merk(); hasi('nicken', 'Leer', 'Hasi reisst die Seite aus dem Notizbuch und lächelt.'); });
    var t = heute(); if (L.tage.indexOf(t) < 0) { L.tage.push(t); leg(LK, L); }
    merk(); teilen(); runde2();
    setTimeout(function () { glocke(); hasi('verbeugen', 'Willkommen', 'Die Türglocke bimmelt. Hasi verbeugt sich und zeigt mit der Pfote auf den Laden.', 2400); }, 500);
  }
  /* ---------- Runde 2: erster Besuch als Pantomime, Ton, offline ---------- */
  var SCHILDER = [
    ['🙋', 'Zeig dein Problem', 'Hasi zeigt auf dich, dann auf sein Ohr: Er hört zu, aber er spricht nie.'],
    ['🧊', 'Hasi holt das Werkzeug', 'Er öffnet mit dem goldenen Schlüssel das Regal und legt einen leuchtenden Würfel auf den Tresen.'],
    ['🎁', 'Ausprobieren und mitnehmen', 'Viele Werkzeuge kannst du gratis ausprobieren. Auf der Werkbank baust du dein eigenes und nimmst es als Datei mit.']
  ];
  /* Runde 3: kleine Feier (Rüebli und Sterne fliegen), Vibration. Hasi bleibt stumm. */
  function summ(m) { try { if (navigator.vibrate) navigator.vibrate(m); } catch (e) {} }
  function feier() {
    if (ruhig) return;
    var z = ['🥕', '⭐', '✨', '🥕', '🔑'];
    for (var i = 0; i < 18; i++) {
      var f = document.createElement('i'); f.className = 'gl-flug'; f.setAttribute('aria-hidden', 'true'); f.textContent = z[i % z.length];
      var w = Math.random() * Math.PI * 2, r = 90 + Math.random() * 120;
      f.style.setProperty('--dx', Math.cos(w) * r + 'px'); f.style.setProperty('--dy', (Math.sin(w) * r - 40) + 'px'); f.style.animationDelay = (i * 25) + 'ms';
      document.body.appendChild(f); setTimeout(f.remove.bind(f), 1500);
    }
  }
  function ersterBesuch() {
    if (hol('hasi.besucht', false)) return;
    var o = document.createElement('div'); o.className = 'pant'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'So geht Hasis Laden');
    var i = 0;
    function zeig() { var x = SCHILDER[i];
      o.innerHTML = '<div class="pant-box"><div class="pant-dots" role="img" aria-label="Schild ' + (i + 1) + ' von 3">' + [0, 1, 2].map(function (k) { return '<i' + (k <= i ? ' class="an"' : '') + '></i>'; }).join('') + '</div><div class="pant-em">' + x[0] + '</div><div class="pant-schild">' + esc(x[1]) + '</div><p>' + esc(x[2]) + '</p><button type="button" class="btn an" id="pantWeiter">' + (i < 2 ? 'Weiter' : 'In den Laden') + '</button><button type="button" class="pant-skip" id="pantSkip">Überspringen</button></div>';
      hasi(['winken', 'schild', 'daumen'][i], x[1], x[2], 0);
      o.querySelector('#pantWeiter').addEventListener('click', function () { i++; if (i < SCHILDER.length) zeig(); else fertig(); });
      o.querySelector('#pantSkip').addEventListener('click', fertig); }
    function fertig() { leg('hasi.besucht', true); o.classList.add('zu'); setTimeout(function () { o.remove(); }, 300); glocke(); feier(); summ([12, 60, 12]); hasi('verbeugen', 'Willkommen', 'Hasi verbeugt sich und hält die Ladentür auf.', 2400); }
    zeig(); document.body.appendChild(o);
  }
  function runde2() {
    var k = document.querySelector('.knoepfe');
    if (k) { var tb = document.createElement('button'); tb.type = 'button'; tb.className = 'btn zwei'; tb.id = 'tonBtn';
      var tz = function () { tb.textContent = hol('hasi.ton', true) ? '🔔 Klänge an' : '🔕 Klänge aus'; };
      tb.addEventListener('click', function () { leg('hasi.ton', !hol('hasi.ton', true)); tz(); if (hol('hasi.ton', true)) { beruehrt = true; klang('pling'); } hasi('nicken', hol('hasi.ton', true) ? '🔔' : '🔕', 'Hasi hält sich die Ohren zu, dann lässt er sie wieder los.', 1600); });
      tz(); k.appendChild(tb); }
    ersterBesuch();
    addEventListener('offline', function () { hasi('schild', 'Offline', 'Hasi dreht das Schild an der Tür um: Der Laden bleibt offen, nur der Server schläft.', 3000); });
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(function () {});
  }
  var r2 = document.createElement('style');
  r2.textContent = '.pant{position:fixed;inset:0;z-index:9000;background:rgba(6,8,24,.8);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.pant-box{width:100%;max-width:400px;background:linear-gradient(170deg,#3b2a1c,#1b1530);border:3px solid #e8b94a;border-radius:24px;padding:20px 18px;text-align:center;color:#fff6e4}' +
    '.pant{animation:glDa .3s ease-out both;transition:opacity .3s}.pant.zu{opacity:0}.pant-box{animation:glHoch .4s cubic-bezier(.2,.8,.2,1) both}' +
    '@keyframes glDa{from{opacity:0}}@keyframes glHoch{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}' +
    '.pant-dots{display:flex;gap:8px;justify-content:center}.pant-dots i{width:8px;height:8px;border-radius:4px;background:rgba(255,255,255,.25);transition:width .3s,background .3s}.pant-dots i.an{width:24px;background:#e8b94a}' +
    '.gl-flug{position:fixed;left:50%;top:40%;z-index:2147483600;font-size:26px;font-style:normal;pointer-events:none;will-change:transform,opacity;animation:glFlug 1.2s cubic-bezier(.2,.7,.3,1) forwards}' +
    '@keyframes glFlug{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}15%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.1) rotate(200deg)}}' +
    '.chip-neu{animation:glHoch .35s cubic-bezier(.2,.8,.2,1) both}.chip-toggle{border-style:dashed!important;color:var(--gold2,#f6d98c)!important}' +
    'body:has(.pant) .nova-btn,body:has(.pant) .nova-pille{opacity:0;pointer-events:none}' +
    '@media (prefers-reduced-motion:reduce){.pant,.pant-box,.chip-neu{animation:none}}' +
    '.pant-box small{opacity:.7}.pant-em{font-size:3rem;margin:6px 0}.pant-schild{display:inline-block;background:#7a5232;border:3px solid #e8b94a;border-radius:8px;padding:8px 14px;font:800 1.1rem Fraunces,Georgia,serif;color:#f6d98c;transform:rotate(-2deg)}' +
    '.pant-box p{font-style:italic;line-height:1.5;margin:12px 0 14px}.pant-box .btn{width:100%}.pant-skip{background:none;border:0;color:#d8cbb4;font:inherit;min-height:44px;margin-top:6px;cursor:pointer}' +
    '.hasi-fig.mit-bild svg{opacity:0}#hasiBild{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:22px;box-shadow:0 0 0 2px rgba(242,193,78,.55),0 10px 26px rgba(0,0,0,.45)}.kunden{margin-top:6px}';
  document.head.appendChild(r2);
  window.HasiLaden = { hasi: hasi, zeige: zeige, W: W, PROB: PROB, zaehl: zaehl, klang: klang, glocke: glocke };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
