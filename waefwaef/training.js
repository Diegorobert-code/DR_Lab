/* Wäf Wäf – Trainingsplan mit Klicker (23.10.2026)
   Erweitert die Klicker-Trickschule (runde4.js) um einen Plan: 6 Grundübungen in kleinen Schritten,
   grosser Klicker-Knopf mit kurzem Klick-Ton (WebAudio, ton-ios.js sorgt für Ton trotz Stumm-Schalter),
   Wiederholungen pro Runde, Schritt abhaken, Fortschritt pro Übung. Nur Belohnung, nie Strafe.
   Alles bleibt auf dem Gerät (localStorage über store, Schlüssel waef_training). */
(function () {
  'use strict';
  if (window.WaefTraining || typeof store === 'undefined') return;
  var g = function (id) { return document.getElementById(id); };
  function h(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function e_(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function bell(m) { try { if (navigator.vibrate) navigator.vibrate(m); } catch (e) {} }
  function sagW(t, mood, req) { try { say(t, mood, req); } catch (e) {} }
  var RUNDE_PAUSE = 20 * 60 * 1000; // nach 20 Minuten ohne Klick beginnt eine neue Runde

  var UEB = [
    { k: 'sitz', e: '🪑', n: 'Sitz', s: [
      'Leckerli an die Nase, langsam über den Kopf nach hinten führen. Po am Boden: klicken, belohnen.',
      'Gleiche Handbewegung, aber ohne Leckerli in der Hand. Belohnung kommt aus der anderen Hand.',
      'Kurz vor der Handbewegung «Sitz» sagen.',
      'Nur noch das Wort. An neuen Orten üben: Küche, Garten, vor der Haustür.'] },
    { k: 'platz', e: '⬇️', n: 'Platz', s: [
      'Aus dem Sitz das Leckerli langsam zwischen den Pfoten zum Boden führen. Bauch unten: klicken.',
      'Gleiche Bewegung ohne Leckerli in der Hand, Belohnung aus der anderen Hand.',
      'Kurz vor der Bewegung «Platz» sagen.',
      'Auf verschiedenen Unterlagen üben: Teppich, Decke, Wiese.'] },
    { k: 'bleib', e: '⏳', n: 'Bleib', s: [
      'Ich sitze. Eine Sekunde warten, klicken, belohnen. Danach mit «Frei» auflösen.',
      'Langsam länger warten: 3, 5, dann 10 Sekunden.',
      'Einen Schritt zurück, gleich wieder zu mir, klicken, belohnen.',
      'Abstand langsam grösser machen. Zum Belohnen immer zu mir zurückkommen.',
      'Kleine Ablenkung dazu, z. B. ein Ball am Boden. Klappt es nicht: wieder einfacher machen.'] },
    { k: 'komm', e: '🏃', n: 'Komm', s: [
      'Drinnen, 2 Meter: Name und «Komm», fröhlich, in die Hocke gehen. Ich komme: klicken, Jackpot!',
      'Aus einem anderen Zimmer rufen.',
      'Draussen an einem ruhigen Ort mit langer Leine.',
      'Mit kleiner Ablenkung. Jetzt gibt es das Allerbeste: Käse oder Wurst.',
      'Unterwegs oft rufen, belohnen und wieder laufen lassen. So heisst «Komm» nie «Spass vorbei».'] },
    { k: 'leine', e: '🦮', n: 'Lockere Leine', s: [
      'Drinnen ohne Leine: Bin ich an deiner Seite, klicken. Leckerli direkt an deinem Bein geben.',
      'Drinnen mit Leine: ein paar Schritte mit lockerer Leine, klicken, belohnen.',
      'Wird die Leine straff: ruhig stehen bleiben und warten. Wird sie locker: klicken und weitergehen.',
      'Draussen an einem ruhigen Ort, kurze Strecken.',
      'Mit Ablenkung. Ab und zu «Geh schnüffeln» als Belohnung.'] },
    { k: 'pfote', e: '🐾', n: 'Pfote', s: [
      'Leckerli in die geschlossene Hand, tief halten, warten. Pfote an der Hand: klicken, Hand öffnen.',
      'Offene Hand ohne Leckerli hinhalten. Pfote drauf: klicken, Belohnung aus der anderen Hand.',
      'Hand etwas höher halten und «Pfote» dazu sagen.',
      'Die andere Pfote genauso aufbauen, mit dem Wort «Andere».'] }
  ];

  var css = [
    '.tr-box{margin-top:14px}',
    '.tr-neu{display:inline-block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--night);background:var(--gold);border-radius:99px;padding:2px 8px;margin-left:6px;vertical-align:middle}',
    '.tr-ges{display:flex;align-items:center;gap:10px;margin:8px 0 2px;font-size:.85rem;color:var(--muted)}',
    '.tr-bar{flex:1;height:8px;border-radius:4px;background:rgba(127,140,170,.22);overflow:hidden}',
    '.tr-bar b{display:block;height:100%;width:0;background:var(--gold);border-radius:4px;transition:width .4s ease}',
    '.tr-uebs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}',
    '.tr-uebs button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px 9px;border-radius:18px;background:rgba(127,140,170,.1);color:var(--cream);box-shadow:none;border:1px solid var(--line);font-size:.85rem;line-height:1.2;min-height:84px;min-width:0}',
    '.tr-uebs button.on{border-color:var(--gold);background:rgba(242,193,78,.16);box-shadow:inset 0 0 0 1px var(--gold)}',
    '.tr-uebs button>span{font-size:24px;line-height:1}',
    '.tr-uebs button.on{outline:3px solid var(--gold);outline-offset:2px}',
    '.tr-uebs .tr-bar{flex:none;width:80%;height:5px;background:rgba(127,140,170,.35)}',
    '.tr-uebs .tr-bar b{background:currentColor}',
    '.tr-uebs small{font-size:.72rem;color:inherit;opacity:.85;font-weight:500}',
    '.tr-schritte{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:6px;counter-reset:tr}',
    '.tr-schritte li{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:14px;border:1px solid transparent}',
    '.tr-schritte li.jetzt{border-color:var(--gold);background:rgba(242,193,78,.1)}',
    '.tr-schritte li.ok .tr-txt{opacity:.7}',
    '#trplan .tr-haken{flex:none;width:32px;height:32px;min-height:32px;padding:0;border-radius:50%;background:transparent!important;border:2px solid var(--gold)!important;color:var(--gold)!important;box-shadow:none!important;font-size:15px;line-height:1;display:grid;place-items:center}',
    '#trplan .tr-schritte li.ok .tr-haken{background:var(--gold)!important;color:var(--night)!important}',
    '#trplan .tr-txt{flex:1;min-width:0;text-align:left;background:transparent!important;border:0!important;box-shadow:none!important;padding:4px 0;color:var(--cream)!important;font-weight:500;font-size:.92rem;line-height:1.4;border-radius:8px}',
    '.tr-txt b{display:block;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700}',
    '.tr-klickzone{display:flex;flex-direction:column;align-items:center;gap:6px;margin:16px 0 4px}',
    '.tr-klick{width:min(56vw,210px);height:min(56vw,210px);border-radius:50%;padding:0;font-size:1.5rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;touch-action:manipulation;-webkit-user-select:none;user-select:none;transition:transform .08s ease}',
    '.tr-klick span{font-size:2.4rem;line-height:1}',
    '.tr-klick small{font-size:.8rem;font-weight:600;opacity:.8}',
    '.tr-klick.zu{transform:scale(.94)}',
    '.tr-zahl{font-size:2rem;font-weight:700;color:var(--gold);line-height:1.1;font-variant-numeric:tabular-nums}',
    '.tr-zinfo{font-size:.85rem;color:var(--muted);text-align:center;margin:0}',
    '.tr-reihe{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:12px}',
    '.tr-reihe button{min-height:44px}',
    '.tr-regeln{margin:10px 0 0;padding-left:18px;line-height:1.5}',
    '.tr-hin{display:block;margin-top:10px;width:100%}',
    '@media (prefers-reduced-motion:reduce){.tr-klick,.tr-bar b{transition:none}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- Daten ---------- */
  function lade() {
    var d = store.get('training', null);
    if (!d || typeof d !== 'object') d = {};
    if (!d.u || typeof d.u !== 'object') d.u = {};
    if (!d.r || typeof d.r !== 'object') d.r = { k: '', n: 0, t: 0 };
    if (!d.wahl) d.wahl = 'sitz';
    UEB.forEach(function (x) { var u = d.u[x.k]; if (!u || typeof u !== 'object') u = d.u[x.k] = {}; if (!Array.isArray(u.ok)) u.ok = []; if (typeof u.n !== 'number') u.n = 0; if (typeof u.j !== 'number') u.j = 0; });
    return d;
  }
  function speichere(d) { store.set('training', d); }
  function ueb(k) { for (var i = 0; i < UEB.length; i++) if (UEB[i].k === k) return UEB[i]; return UEB[0]; }
  function rundeN(d, k) { var r = d.r; return (r.k === k && Date.now() - r.t < RUNDE_PAUSE) ? r.n : 0; }

  /* ---------- Klick-Ton: kurz und knackig wie ein Box-Klicker ---------- */
  var AC = null;
  function ac() { if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { AC = new C(); } catch (e) { return null; } } if (AC.state === 'suspended') { try { AC.resume(); } catch (e) {} } return AC; }
  var KN = null;
  function knack(a) { if (KN) return KN; var len = Math.floor(a.sampleRate * 0.012), b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); KN = b; return b; }
  function klickTon() {
    var a = ac(); if (!a) return;
    try {
      var t = a.currentTime + 0.005;
      [[0, 1, 3800], [0.045, 0.55, 3000]].forEach(function (x) {
        var s = a.createBufferSource(), f = a.createBiquadFilter(), v = a.createGain();
        s.buffer = knack(a); f.type = 'bandpass'; f.frequency.value = x[2]; f.Q.value = 1.4; v.gain.value = 0.9 * x[1];
        s.connect(f).connect(v).connect(a.destination); s.start(t + x[0]);
        var o = a.createOscillator(), ov = a.createGain(); o.type = 'square'; o.frequency.value = x[2] * 0.75;
        ov.gain.setValueAtTime(0.0001, t + x[0]); ov.gain.exponentialRampToValueAtTime(0.18 * x[1], t + x[0] + 0.002); ov.gain.exponentialRampToValueAtTime(0.0001, t + x[0] + 0.018);
        o.connect(ov).connect(a.destination); o.start(t + x[0]); o.stop(t + x[0] + 0.03);
      });
    } catch (e) {}
  }

  /* ---------- Oberfläche ---------- */
  var box = h('<div class="box tr-box" id="trplan">' +
    '<h3>📋 Trainingsplan mit Klicker <span class="tr-neu">neu</span></h3>' +
    '<p class="mini">Sechs Grundübungen in kleinen Schritten. Klick heisst: «Genau das war super!» Nach jedem Klick gibt es ein Leckerli.</p>' +
    '<div class="tr-ges"><span class="tr-gtxt"></span><span class="tr-bar" aria-hidden="true"><b></b></span></div>' +
    '<div class="tr-uebs" role="group" aria-label="Übung wählen"></div>' +
    '<h4 class="tr-titel" style="margin:4px 0 0"></h4>' +
    '<ol class="tr-schritte"></ol>' +
    '<div class="tr-klickzone">' +
      '<button class="tr-klick" type="button" aria-describedby="trZinfo"><span>🦴</span>Klick!<small>tippen im richtigen Moment</small></button>' +
      '<div class="tr-zahl" aria-hidden="true">0</div>' +
      '<p class="tr-zinfo" id="trZinfo" aria-live="polite"></p>' +
    '</div>' +
    '<div class="tr-reihe"><button type="button" class="tr-ok">✓ Schritt geschafft</button><button type="button" class="ghost tr-neurunde">Neue Runde</button></div>' +
    '<details style="margin-top:12px"><summary class="mini" style="cursor:pointer">So üben wir zusammen</summary><ul class="mini tr-regeln">' +
      '<li>Zuerst den Klicker «aufladen»: 5 Mal klicken und sofort ein Leckerli geben.</li>' +
      '<li>Kurz üben, 3–5 Minuten. Aufhören, solange es noch Spass macht.</li>' +
      '<li>Klappt es etwa 8 von 10 Mal, Schritt abhaken und den nächsten probieren.</li>' +
      '<li>Klappt es nicht, einen Schritt zurück. Nie schimpfen, nie drücken oder ziehen. Ich lerne am besten, wenn ich mich freue.</li>' +
    '</ul></details>' +
    '</div>');

  var D = lade();

  function zeigen() {
    var x = ueb(D.wahl), u = D.u[x.k];
    // Gesamtfortschritt
    var alle = 0, ok = 0; UEB.forEach(function (y) { alle += y.s.length; ok += D.u[y.k].ok.length; });
    box.querySelector('.tr-gtxt').textContent = ok + ' von ' + alle + ' Schritten';
    box.querySelector('.tr-ges .tr-bar b').style.width = Math.round(ok / alle * 100) + '%';
    // Übungen
    var l = box.querySelector('.tr-uebs'); l.innerHTML = '';
    UEB.forEach(function (y) {
      var uy = D.u[y.k], n = uy.ok.length, p = Math.round(n / y.s.length * 100);
      var b = h('<button type="button" data-k="' + y.k + '" class="' + (y.k === x.k ? 'on' : '') + '" aria-pressed="' + (y.k === x.k) + '"><span aria-hidden="true">' + y.e + '</span>' + e_(y.n) +
        '<i class="tr-bar" aria-hidden="true"><b style="width:' + p + '%"></b></i><small>' + (n === y.s.length ? 'geschafft ⭐' : n + '/' + y.s.length + ' Schritte') + '</small></button>');
      l.appendChild(b);
    });
    // Schritte
    var akt = aktuell(x, u);
    box.querySelector('.tr-titel').textContent = x.e + ' ' + x.n;
    var ol = box.querySelector('.tr-schritte'); ol.innerHTML = '';
    x.s.forEach(function (s, i) {
      var fertig = u.ok.indexOf(i) >= 0;
      var li = h('<li class="' + (fertig ? 'ok ' : '') + (i === akt ? 'jetzt' : '') + '">' +
        '<button type="button" class="tr-haken" data-i="' + i + '" aria-pressed="' + fertig + '" aria-label="Schritt ' + (i + 1) + (fertig ? ' geschafft, antippen zum Zurücksetzen' : ' als geschafft markieren') + '">' + (fertig ? '✓' : (i + 1)) + '</button>' +
        '<button type="button" class="tr-txt" data-w="' + i + '"><b>Schritt ' + (i + 1) + (i === akt ? ' · jetzt' : '') + '</b>' + e_(s) + '</button></li>');
      ol.appendChild(li);
    });
    var okB = box.querySelector('.tr-ok');
    okB.hidden = u.ok.length === x.s.length;
    okB.textContent = '✓ Schritt ' + (akt + 1) + ' geschafft';
    zahl();
  }
  function aktuell(x, u) {
    if (typeof u.j === 'number' && u.j >= 0 && u.j < x.s.length && u.ok.indexOf(u.j) < 0) return u.j;
    for (var i = 0; i < x.s.length; i++) if (u.ok.indexOf(i) < 0) return i;
    return x.s.length - 1;
  }
  function zahl() {
    var x = ueb(D.wahl), u = D.u[x.k], n = rundeN(D, x.k);
    box.querySelector('.tr-zahl').textContent = n;
    box.querySelector('.tr-zinfo').textContent = n
      ? (n === 1 ? '1 Wiederholung' : n + ' Wiederholungen') + ' in dieser Runde · ' + u.n + ' insgesamt bei «' + x.n + '»'
      : (u.n ? 'Neue Runde. Bisher ' + u.n + ' Klicks bei «' + x.n + '».' : 'Tippe genau im richtigen Moment, dann gleich belohnen.');
  }

  box.addEventListener('click', function (ev) {
    var t = ev.target.closest('button'); if (!t || !box.contains(t)) return;
    var x = ueb(D.wahl), u = D.u[x.k];
    if (t.dataset.k) {
      if (t.dataset.k === D.wahl) return;
      D.wahl = t.dataset.k; speichere(D); zeigen();
      var y = ueb(D.wahl);
      sagW('Üben wir «' + y.n + '»? Ich bin bereit!', 'hop', y.e);
      try { if (window.FigurPosen) FigurPosen.zeige(g('pup'), 'trick', 2600, ['freut']); } catch (e) {}
      return;
    }
    if (t.classList.contains('tr-haken')) {
      var i = +t.dataset.i, j = u.ok.indexOf(i);
      if (j >= 0) { u.ok.splice(j, 1); u.j = i; } else abhaken(x, u, i);
      speichere(D); zeigen(); return;
    }
    if (t.dataset.w != null) { u.j = +t.dataset.w; speichere(D); zeigen(); return; }
    if (t.classList.contains('tr-ok')) { abhaken(x, u, aktuell(x, u)); speichere(D); zeigen(); return; }
    if (t.classList.contains('tr-neurunde')) { D.r = { k: x.k, n: 0, t: Date.now() }; speichere(D); zahl(); sagW('Neue Runde! Kurz und lustig.', 'wiggle'); return; }
  });

  function abhaken(x, u, i) {
    if (u.ok.indexOf(i) < 0) u.ok.push(i);
    u.ok.sort(function (a, b) { return a - b; });
    var n = -1; for (var k = 0; k < x.s.length; k++) if (u.ok.indexOf(k) < 0) { n = k; break; }
    u.j = n < 0 ? x.s.length - 1 : n;
    bell([10, 40, 10]);
    if (n < 0) { sagW('«' + x.n + '» kann ich jetzt! Danke, dass du so geduldig mit mir bist.', 'hop', '⭐'); try { heart(g('pup'), 16); } catch (e) {} }
    else sagW('Schritt geschafft! Weiter mit Schritt ' + (n + 1) + ', aber erst eine kleine Pause.', 'hop', '🎉');
  }

  var kb = box.querySelector('.tr-klick');
  function druck() { klickTon(); bell(10); kb.classList.add('zu'); setTimeout(function () { kb.classList.remove('zu'); }, 90); }
  kb.addEventListener('click', function () {
    druck();
    var x = ueb(D.wahl), u = D.u[x.k], n = rundeN(D, x.k) + 1;
    D.r = { k: x.k, n: n, t: Date.now() }; u.n += 1; speichere(D); zahl();
    if (n === 5) sagW('Fünf Mal richtig! Du machst das super.', 'hop');
    else if (n % 15 === 0) sagW('Schon ' + n + ' Wiederholungen. Zeit für eine Pause: Wasser, kuscheln, schnüffeln.', 'wiggle', '💧');
  });

  /* ---------- Einfügen: direkt nach der Klicker-Trickschule im Bereich «Raus» ---------- */
  var tricks = g('r4tricks');
  if (tricks) {
    tricks.after(box);
    var hin = h('<button type="button" class="ghost tr-hin">📋 Schritt für Schritt: zum Trainingsplan</button>');
    hin.onclick = function () { box.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); };
    tricks.appendChild(hin);
  } else {
    var v = g('v-spazieren'); if (!v) return;
    var tip = v.querySelector('.tip'); if (tip) v.insertBefore(box, tip); else v.appendChild(box);
  }
  zeigen();
  // Nach langer Pause beim Zurückkommen die Rundenzahl auffrischen
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { D = lade(); zeigen(); } });

  window.WaefTraining = { uebungen: UEB, klick: function () { kb.click(); }, zeigen: zeigen };
})();
