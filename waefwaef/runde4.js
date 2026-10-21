/* Wäf Wäf – Runde 4 (21.10.2026)
   1) Wäf Wäf winkt mit der Pfote zurück, wenn man ihn antippt (Puppe.winkeZurueck, sobald es das gibt)
   2) Klicker-Trickschule (Raus): 6 Tricks, nur mit Belohnung, Klick-Ton direkt im Handy, Sterne pro Trick
   3) Spaziergang-Bingo (Raus): 9 Dinge unterwegs entdecken, ein Bingo pro Runde
   4) Geräusche-Gewöhnung (Verstehen): Türklingel, Gewitter, Staubsauger, Feuerwerk ganz leise starten, Schritt für Schritt
   5) Kinder: «Wovon träumt Wäf Wäf?» – ruhige Gute-Nacht-Geschichte als Standbild, Fantasie-Frage, «🎧 Nur hören»
   Alles nur auf dem Gerät, keine Kosten, keine neuen Dienste. */
(function () {
  'use strict';
  if (window.WaefR4 || typeof store === 'undefined') return;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var g = function (id) { return document.getElementById(id); };
  function h(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function bell(m) { try { if (navigator.vibrate) navigator.vibrate(m); } catch (e) {} }
  function sagW(t, mood, req) { try { say(t, mood, req); } catch (e) {} }

  var css = [
    '.r4-pfote{position:absolute;z-index:4;font-size:42px;pointer-events:none;right:-6px;bottom:24px;transform-origin:50% 100%;animation:r4Pfote 1.2s ease-out forwards}',
    '@keyframes r4Pfote{0%{opacity:0;transform:scale(.4) rotate(0)}20%{opacity:1;transform:scale(1) rotate(-22deg)}40%{transform:rotate(18deg)}60%{transform:rotate(-14deg)}80%{opacity:1;transform:rotate(8deg)}100%{opacity:0;transform:translateY(-12px)}}',
    '#pup.r4-wink{animation:r4Wink 1s cubic-bezier(.3,.7,.3,1)}',
    '@keyframes r4Wink{20%{transform:rotate(-6deg) translateY(-6px)}45%{transform:rotate(5deg) translateY(-6px)}70%{transform:rotate(-3deg)}}',
    '.r4-box{margin-top:14px}',
    '.r4-neu{display:inline-block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--night);background:var(--gold);border-radius:99px;padding:2px 8px;margin-left:6px;vertical-align:middle}',
    '.r4-tricks{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}',
    '.r4-tricks button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 4px;border-radius:18px;background:rgba(255,255,255,.08);color:var(--cream);box-shadow:none;border:1px solid var(--line);font-size:.85rem;min-height:72px}',
    '.r4-tricks button.on{border-color:var(--gold);background:rgba(242,193,78,.16)}',
    '.r4-tricks button span{font-size:24px}',
    '.r4-tricks small{color:var(--gold);letter-spacing:1px}',
    '.r4-schritte{margin:8px 0 0;padding-left:20px;line-height:1.5}',
    '.r4-klick{width:100%;min-height:72px;font-size:1.2rem;margin-top:12px;border-radius:24px}',
    '.r4-klick:active{transform:scale(.96)}',
    '.r4-bingo{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}',
    '.r4-bingo button{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border-radius:18px;background:rgba(255,255,255,.08);color:var(--cream);box-shadow:none;border:1px solid var(--line);padding:4px;font-size:.8rem;line-height:1.2}',
    '.r4-bingo button span{font-size:28px}',
    '.r4-bingo button.on{background:linear-gradient(180deg,#F8D886,var(--gold));color:var(--night)}',
    '.r4-ger{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}',
    '.r4-ger button{background:rgba(255,255,255,.08);color:var(--cream);box-shadow:none;border:1px solid var(--line);border-radius:18px;padding:12px 6px;min-height:56px}',
    '.r4-ger button.on{border-color:var(--gold);background:rgba(242,193,78,.16)}',
    '.r4-stufen{display:flex;gap:6px;margin:12px 0 4px}.r4-stufen i{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,.12)}.r4-stufen i.on{background:var(--gold)}',
    '.r4-traum img{display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:20px;border:2px solid var(--line);margin:10px 0}',
    '.r4-traum p.r4-tt{font-size:1.05rem;line-height:1.55;min-height:5.5em}',
    '.r4-frage{border-left:3px solid var(--gold);padding:8px 12px;margin:8px 0;color:var(--cream);font-style:italic}',
    '@media (prefers-reduced-motion:reduce){.r4-pfote,#pup.r4-wink{animation:none}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- 1) Zurückwinken ---------- */
  function winke() {
    var p = g('pup'); if (!p) return;
    if (window.Puppe && typeof Puppe.winkeZurueck === 'function') { try { Puppe.winkeZurueck(p); return; } catch (e) {} }
    if (ruhig) return;
    var w = p.parentElement; var pf = h('<span class="r4-pfote" aria-hidden="true">🐾</span>'); w.appendChild(pf); setTimeout(function () { pf.remove(); }, 1300);
    if (g('v-kinder') && !g('v-kinder').hidden) return; // Kinderteil: Bild bleibt still, nur die Pfote winkt
    setTimeout(function () { p.classList.remove('r4-wink'); void p.offsetWidth; p.classList.add('r4-wink'); }, 30);
  }
  var pp = g('pup'); if (pp) pp.addEventListener('click', winke);
  document.addEventListener('animationend', function (e) { if (e.animationName === 'r4Wink') e.target.classList.remove('r4-wink'); });

  /* ---------- Ton (WebAudio, im Handy erzeugt) ---------- */
  var AC = null;
  function ac() { if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); } if (AC.state === 'suspended') AC.resume(); return AC; }
  function klickTon() {
    var a = ac(); if (!a) return; var t = a.currentTime;
    [0, 0.06].forEach(function (d, i) {
      var o = a.createOscillator(), v = a.createGain(); o.type = 'square'; o.frequency.value = i ? 2600 : 3400;
      v.gain.setValueAtTime(0.0001, t + d); v.gain.exponentialRampToValueAtTime(0.35, t + d + 0.003); v.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.03);
      o.connect(v).connect(a.destination); o.start(t + d); o.stop(t + d + 0.04);
    });
  }
  function rauschen(a, dauer) { var b = a.createBuffer(1, a.sampleRate * dauer, a.sampleRate), d = b.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; var s = a.createBufferSource(); s.buffer = b; return s; }
  var GER = {
    klingel: { n: '🔔 Türklingel', spiel: function (a, vol) { var t = a.currentTime; [[880, 0], [698, .45]].forEach(function (x) { var o = a.createOscillator(), v = a.createGain(); o.type = 'sine'; o.frequency.value = x[0]; v.gain.setValueAtTime(0.0001, t + x[1]); v.gain.exponentialRampToValueAtTime(vol, t + x[1] + .01); v.gain.exponentialRampToValueAtTime(0.0001, t + x[1] + 1.2); o.connect(v).connect(a.destination); o.start(t + x[1]); o.stop(t + x[1] + 1.3); }); return 1.8; } },
    gewitter: { n: '⛈ Gewitter', spiel: function (a, vol) { var t = a.currentTime, s = rauschen(a, 4), f = a.createBiquadFilter(), v = a.createGain(); f.type = 'lowpass'; f.frequency.value = 160; v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(vol * 2.5, t + .3); v.gain.exponentialRampToValueAtTime(vol, t + 1.5); v.gain.exponentialRampToValueAtTime(0.0001, t + 4); s.connect(f).connect(v).connect(a.destination); s.start(t); return 4; } },
    sauger: { n: '🧹 Staubsauger', spiel: function (a, vol) { var t = a.currentTime, s = rauschen(a, 4), f = a.createBiquadFilter(), v = a.createGain(), o = a.createOscillator(), ov = a.createGain(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = .7; o.type = 'sawtooth'; o.frequency.value = 120; ov.gain.value = vol * .15; v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(vol, t + .5); v.gain.setValueAtTime(vol, t + 3.4); v.gain.exponentialRampToValueAtTime(0.0001, t + 4); s.connect(f).connect(v).connect(a.destination); o.connect(ov).connect(v); o.start(t); o.stop(t + 4); s.start(t); return 4; } },
    feuerwerk: { n: '🎆 Feuerwerk', spiel: function (a, vol) { var t = a.currentTime; for (var i = 0; i < 4; i++) { var d = i * .8 + Math.random() * .3, s = rauschen(a, .6), f = a.createBiquadFilter(), v = a.createGain(); f.type = 'lowpass'; f.frequency.value = 1200; v.gain.setValueAtTime(0.0001, t + d); v.gain.exponentialRampToValueAtTime(vol * 2, t + d + .01); v.gain.exponentialRampToValueAtTime(0.0001, t + d + .5); s.connect(f).connect(v).connect(a.destination); s.start(t + d); } return 3.6; } }
  };

  /* ---------- 2) Klicker-Trickschule ---------- */
  var TRICKS = [
    { k: 'sitz', e: '🪑', n: 'Sitz', s: ['Leckerli vor die Nase halten.', 'Langsam über den Kopf nach hinten führen, bis der Po den Boden berührt.', 'Genau dann klicken und belohnen.', 'Erst wenn es klappt, das Wort «Sitz» dazu sagen.'] },
    { k: 'pfote', e: '🐾', n: 'Pfote', s: ['Leckerli in die geschlossene Hand nehmen.', 'Hand tief vor mich halten und warten.', 'Sobald ich mit der Pfote an die Hand tippe: klicken und Hand öffnen.', 'Später «Gib Pfote» sagen.'] },
    { k: 'dreh', e: '🌀', n: 'Dreh dich', s: ['Mit Leckerli an der Nase einen grossen Kreis führen.', 'Wenn ich ganz herum bin: klicken.', 'Nach ein paar Mal den Kreis mit der Hand kleiner machen.'] },
    { k: 'platz', e: '🛏', n: 'Platz', s: ['Aus dem Sitz das Leckerli langsam zum Boden führen.', 'Wenn der Bauch unten ist: klicken.', 'Nicht drücken, nur warten. Ich finde es selbst heraus.'] },
    { k: 'schau', e: '👀', n: 'Schau mich an', s: ['Leckerli neben dein Auge halten.', 'Sobald ich dir in die Augen schaue: klicken.', 'Hilft draussen, wenn es spannend wird.'] },
    { k: 'decke', e: '🧺', n: 'Auf die Decke', s: ['Decke hinlegen, warten.', 'Jede Pfote auf der Decke: klicken.', 'Später nur noch, wenn ich mich hinlege. Gut fürs Ruhigwerden.'] }
  ];
  var trickI = 0;
  var tb = h('<div class="box r4-box" id="r4tricks"><h3>🎓 Klicker-Trickschule <span class="r4-neu">neu</span></h3><p class="mini">Klick heisst: «Genau das war super!» Danach immer ein Leckerli. Kurz üben, 3–5 Minuten, aufhören, wenn es Spass macht.</p><div class="r4-tricks"></div><div class="r4-tinfo"></div><button class="r4-klick" type="button">Klick! 🦴</button><p class="mini r4-tz" style="text-align:center;margin:8px 0 0"></p></div>');
  function sterne(k) { var t = store.get('r4tricks', {}); return t[k] || 0; }
  function trickZeigen() {
    var l = tb.querySelector('.r4-tricks'); l.innerHTML = '';
    TRICKS.forEach(function (x, i) {
      var s = Math.min(3, Math.floor(sterne(x.k) / 10));
      var b = h('<button type="button" class="' + (i === trickI ? 'on' : '') + '"><span>' + x.e + '</span>' + x.n + '<small>' + '★★★'.slice(0, s) + '☆☆☆'.slice(0, 3 - s) + '</small></button>');
      b.onclick = function () { trickI = i; trickZeigen(); sagW('Üben wir «' + x.n + '»? Ich bin bereit!', 'hop', x.e); };
      l.appendChild(b);
    });
    var x = TRICKS[trickI];
    tb.querySelector('.r4-tinfo').innerHTML = '<ol class="r4-schritte mini">' + x.s.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>';
    var n = sterne(x.k);
    tb.querySelector('.r4-tz').textContent = n ? n + ' Klicks für «' + x.n + '». Alle 10 Klicks gibt es einen Stern.' : 'Tippe beim richtigen Moment auf «Klick!».';
  }
  tb.querySelector('.r4-klick').onclick = function () {
    klickTon(); bell(12);
    var t = store.get('r4tricks', {}), x = TRICKS[trickI]; t[x.k] = (t[x.k] || 0) + 1; store.set('r4tricks', t);
    if (t[x.k] % 10 === 0) { sagW('Ein neuer Stern für «' + x.n + '»! Jetzt Pause und kuscheln.', 'hop', '⭐'); try { heart(g('pup'), 12); } catch (e) {} bell([10, 40, 10]); }
    trickZeigen();
  };

  /* ---------- 3) Spaziergang-Bingo ---------- */
  var BINGO = [['🐈', 'Katze'], ['⛲', 'Brunnen'], ['🍂', 'Laubhaufen'], ['🚲', 'Velo'], ['🐕', 'anderer Hund'], ['🌳', 'dicker Baum'], ['🪨', 'Stein zum Schnuppern'], ['🐦', 'Vogel'], ['🪵', 'Bank']];
  var bb = h('<div class="box r4-box" id="r4bingo"><h3>🔍 Spaziergang-Bingo <span class="r4-neu">neu</span></h3><p class="mini">Was entdeckt ihr heute unterwegs? Antippen, wenn ihr es seht. Ich schnuppere mit!</p><div class="r4-bingo"></div><div class="reihe" style="margin-top:10px"><button class="ghost" type="button" data-r4="neu">Neue Runde</button></div></div>');
  function bingoZeigen() {
    var d = store.get('r4bingo', { t: heute(), on: [] }); if (d.t !== heute()) d = { t: heute(), on: [] };
    var l = bb.querySelector('.r4-bingo'); l.innerHTML = '';
    BINGO.forEach(function (x, i) {
      var on = d.on.indexOf(i) >= 0;
      var b = h('<button type="button" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '"><span>' + x[0] + '</span>' + x[1] + '</button>');
      b.onclick = function () {
        var dd = store.get('r4bingo', { t: heute(), on: [] }); if (dd.t !== heute()) dd = { t: heute(), on: [] };
        var j = dd.on.indexOf(i); if (j >= 0) dd.on.splice(j, 1); else dd.on.push(i);
        store.set('r4bingo', dd); bingoZeigen();
        if (j < 0) { bell(8); if (bingo(dd.on)) { sagW('Bingo! Was für eine Entdecker-Runde!', 'hop', '🏆'); try { heart(g('pup'), 16); } catch (e) {} bell([10, 40, 10, 40, 20]); } else sagW(x[1] + '! Gut gesehen.', 'schnupper'); }
      };
      l.appendChild(b);
    });
  }
  function bingo(on) { var L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]; return L.some(function (r) { return r.every(function (i) { return on.indexOf(i) >= 0; }); }); }
  bb.querySelector('[data-r4=neu]').onclick = function () { BINGO.sort(function () { return Math.random() - .5; }); store.set('r4bingo', { t: heute(), on: [] }); bingoZeigen(); };

  /* ---------- 4) Geräusche-Gewöhnung ---------- */
  var gerK = 'klingel';
  var gb = h('<div class="box r4-box" id="r4geraeusche"><h3>🔊 Geräusche kennenlernen <span class="r4-neu">neu</span></h3><p class="mini">Ganz leise anfangen. Während das Geräusch läuft, gibt es Leckerli. Bleibe ich entspannt, nächstes Mal eine Stufe lauter. Werde ich unruhig: eine Stufe zurück.</p><div class="r4-ger"></div><div class="r4-stufen" aria-hidden="true"></div><p class="mini r4-gst"></p><div class="reihe"><button type="button" data-r4="spiel">▶ Abspielen</button><button class="ghost" type="button" data-r4="gut">😌 War ruhig</button><button class="ghost" type="button" data-r4="unruhig">😟 Unruhig</button></div></div>');
  function stufe(k) { var s = store.get('r4ger', {}); return s[k] || 1; }
  function gerZeigen() {
    var l = gb.querySelector('.r4-ger'); l.innerHTML = '';
    Object.keys(GER).forEach(function (k) { var b = h('<button type="button" class="' + (k === gerK ? 'on' : '') + '">' + GER[k].n + '</button>'); b.onclick = function () { gerK = k; gerZeigen(); }; l.appendChild(b); });
    var s = stufe(gerK); gb.querySelector('.r4-stufen').innerHTML = [1, 2, 3, 4, 5].map(function (i) { return '<i class="' + (i <= s ? 'on' : '') + '"></i>'; }).join('');
    gb.querySelector('.r4-gst').textContent = 'Stufe ' + s + ' von 5 (' + ['', 'flüsterleise', 'leise', 'mittel', 'deutlich', 'fast echt'][s] + ')';
  }
  function setze(d) { var s = store.get('r4ger', {}); s[gerK] = Math.max(1, Math.min(5, stufe(gerK) + d)); store.set('r4ger', s); gerZeigen(); }
  gb.querySelector('[data-r4=spiel]').onclick = function () { var a = ac(); if (!a) return; var vol = [0, .01, .03, .07, .14, .25][stufe(gerK)]; GER[gerK].spiel(a, vol); sagW('Ich höre es … Leckerli? Dann ist es gar nicht so schlimm.', 'schnupper', '👂'); };
  gb.querySelector('[data-r4=gut]').onclick = function () { setze(1); sagW('Ich war ganz ruhig! Nächstes Mal etwas lauter.', 'hop', '🦴'); bell(10); };
  gb.querySelector('[data-r4=unruhig]').onclick = function () { setze(-1); sagW('Danke, dass du es merkst. Wir machen wieder leiser.', 'sad'); };

  /* ---------- 5) Kinder: Wovon träumt Wäf Wäf? ---------- */
  var TRAUM = [
    'Es ist Abend. Wäf Wäf liegt in seinem Körbchen. Die Pfoten sind müde vom Spazieren.',
    'Er macht die Augen zu. Und plötzlich ist da eine Wiese aus Wolken, weich wie Watte.',
    'Auf der Wiese liegt ein goldener Ball. Er leuchtet wie der Mond.',
    'Wäf Wäf schnuppert daran. Der Ball riecht nach Zuhause, nach seiner Familie.',
    'Er trägt den Ball ganz vorsichtig zurück in sein Körbchen. Und schläft tief und ruhig weiter.'
  ];
  var FRAGEN = ['Was glaubst du: Wohin rollt der goldene Ball als Nächstes?', 'Wenn du auf der Wolkenwiese wärst, was würdest du dort tun?', 'Wonach riecht es bei dir zu Hause?', 'Was träumst du heute Nacht?'];
  var ti = 0;
  var kb = h('<div class="box geschichte r4-traum" id="r4traum"><h3>🌙 Wovon träumt Wäf Wäf? <span class="r4-neu">neu</span></h3><img src="posen/schlaeft.jpg" alt="Wäf Wäf schläft ruhig in seinem Körbchen" loading="lazy" width="512" height="512"><p class="r4-tt" aria-live="polite"></p><div class="reihe"><button class="ghost" type="button" data-r4="zur">‹</button><button type="button" data-r4="vor">Weiter ›</button></div><button class="gross-hoeren" type="button" data-r4="hoer">🎧 Nur hören</button></div>');
  function traumZeigen() {
    var p = kb.querySelector('.r4-tt');
    if (ti >= TRAUM.length) { p.innerHTML = 'Gute Nacht, Wäf Wäf. 💛<span class="r4-frage" style="display:block;margin-top:8px">' + esc(FRAGEN[Math.floor(Date.now() / 864e5) % FRAGEN.length]) + '</span>'; kb.querySelector('[data-r4=vor]').textContent = 'Nochmal'; }
    else { p.textContent = TRAUM[ti]; kb.querySelector('[data-r4=vor]').textContent = 'Weiter ›'; }
  }
  kb.querySelector('[data-r4=vor]').onclick = function () { ti = ti >= TRAUM.length ? 0 : ti + 1; traumZeigen(); };
  kb.querySelector('[data-r4=zur]').onclick = function () { ti = Math.max(0, ti - 1); traumZeigen(); };
  var hoert = false;
  kb.querySelector('[data-r4=hoer]').onclick = function () {
    var b = this;
    if (hoert) { hoert = false; try { speechSynthesis.cancel(); } catch (e) {} b.textContent = '🎧 Nur hören'; return; }
    hoert = true; b.textContent = '⏸ Anhalten'; ti = 0; traumZeigen();
    var teile = TRAUM.concat(['Gute Nacht, Wäf Wäf.', FRAGEN[Math.floor(Date.now() / 864e5) % FRAGEN.length]]), i = 0;
    (function weiter() {
      if (!hoert) return;
      if (i >= teile.length) { hoert = false; b.textContent = '🎧 Nur hören'; ti = TRAUM.length; traumZeigen(); return; }
      if (i < TRAUM.length) { ti = i; traumZeigen(); }
      var t = teile[i++];
      try {
        if (!('speechSynthesis' in window)) { setTimeout(weiter, 4000); return; }
        speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'de-CH'; u.rate = .9;
        var v = speechSynthesis.getVoices().find(function (v) { return /^de/i.test(v.lang); }); if (v) u.voice = v;
        var fertig = false, f = function () { if (fertig) return; fertig = true; setTimeout(weiter, 900); };
        u.onend = f; u.onerror = f; setTimeout(f, 3000 + t.length * 90); speechSynthesis.speak(u);
      } catch (e) { setTimeout(weiter, 4000); }
    })();
  };

  /* ---------- Einfügen ---------- */
  var walkBox = document.querySelector('#v-spazieren .walk');
  if (walkBox) { var wo = g('woche'); (wo || walkBox).after(bb); bb.after(tb); }
  var welt = g('welt'); if (welt) welt.after(gb);
  var kg = document.querySelector('#v-kinder .geschichte'); if (kg) kg.after(kb); else { var vk = g('v-kinder'); if (vk) vk.appendChild(kb); }
  trickZeigen(); bingoZeigen(); gerZeigen(); traumZeigen();

  window.WaefR4 = { winke: winke };
})();
