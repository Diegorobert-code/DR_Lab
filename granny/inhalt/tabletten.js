/* tabletten.js – Rosa «Meine Tabletten» (24.10.2026).
   Eigene Wisch-Karte, die ein grosses Fenster öffnet: heutige Liste mit riesigem «✓ Genommen»,
   eintragen (Name, Uhrzeit, Notiz), 7-Tage-Übersicht, sanfte Erinnerung solange Rosa offen ist
   und auf Wunsch eine Mitteilung (Notification API).
   Teilt die Daten mit der Medikamenten-Karte aus runde8.js (r7.granny.medi / mediTag). Alles bleibt auf dem Gerät.
   Gesundheit: kein Rat zu Mengen, keine Wechselwirkungen, keine Empfehlungen. */
(function () {
  'use strict';
  if (window.RosaTabletten) return;
  var d = document, R = window.R7;
  var P = 'r7.granny.';
  function hol(k, v) { if (R) return R.hol(k, v); try { var x = localStorage.getItem(P + k); return x === null ? v : JSON.parse(x); } catch (e) { return v; } }
  function leg(k, v) { if (R) return R.leg(k, v); try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function zwei(n) { return ('0' + n).slice(-2); }
  function tagK(dt) { dt = dt || new Date(); return dt.getFullYear() + '-' + zwei(dt.getMonth() + 1) + '-' + zwei(dt.getDate()); }
  function jetztHM() { var x = new Date(); return zwei(x.getHours()) + ':' + zwei(x.getMinutes()); }
  function uhr(z) { var p = String(z || '').split(':'); return (+p[0]) + (p[1] && p[1] !== '00' ? '.' + p[1] : '') + ' Uhr'; }
  function minSeit(z) { var p = String(z).split(':'), x = new Date(); return (x.getHours() * 60 + x.getMinutes()) - (+p[0] * 60 + +p[1]); }

  /* ---------- Daten (gemeinsam mit runde8.js) ---------- */
  function liste() { var l = hol('medi', []); l = Array.isArray(l) ? l.filter(function (m) { return m && m.id && m.name && /^\d{2}:\d{2}$/.test(m.zeit); }) : []; return l.sort(function (a, b) { return a.zeit < b.zeit ? -1 : a.zeit > b.zeit ? 1 : 0; }); }
  function alleTage() { var A = hol('mediTag', {}); return A && typeof A === 'object' && !Array.isArray(A) ? A : {}; }
  function tag(k) { return alleTage()[k || tagK()] || {}; }
  function legTag(t) {
    var A = alleTage(); A[tagK()] = t;
    var ks = Object.keys(A).sort(); while (ks.length > 14) delete A[ks.shift()];
    leg('mediTag', A);
  }
  function setze(id, an) { var t = tag(); if (an) t[id] = jetztHM(); else delete t[id]; legTag(t); sync(); }
  function sync() { try { if (window.R8M && window.R8M.neu) window.R8M.neu(); } catch (e) {} }
  function offeneJetzt() { var t = tag(); return liste().filter(function (m) { var s = minSeit(m.zeit); return !t[m.id] && s >= 0 && s <= 180; }); }

  /* ---------- Vorlesen und Ton (leise, freundlich) ---------- */
  function sag(text) {
    try {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = 'de-CH'; u.rate = 0.9;
      var v = speechSynthesis.getVoices().filter(function (x) { return /^de/.test(x.lang); });
      if (v.length) u.voice = v.filter(function (x) { return x.lang === 'de-CH'; })[0] || v[0];
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function summ() { try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {} }

  /* ---------- Stil ---------- */
  var css = d.createElement('style');
  css.textContent = [
    '.tb-fe{position:fixed;inset:0;z-index:2147483100;display:flex;flex-direction:column;background:#f7f1e8;color:#1d1915;font:400 20px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-tap-highlight-color:transparent;overscroll-behavior:contain}',
    '.tb-fe[hidden],.tb-ban[hidden],.tb-fe [hidden]{display:none!important}',
    '.tb-fe *,.tb-ban *{box-sizing:border-box}',
    '.tb-kopf{flex:none;display:flex;align-items:center;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 12px) 16px 10px;background:#fbf8f3;border-bottom:1px solid #e6dccd}',
    '.tb-kopf h2{flex:1;min-width:0;margin:0;font:700 28px/1.15 Georgia,"Times New Roman",serif;color:#5a2a0b}',
    '.tb-zu{flex:none;min-height:60px;min-width:60px;padding:0 18px;border-radius:999px;border:2px solid #a8957c;background:#fff;color:#1d1915;font:inherit;font-size:20px;font-weight:700;cursor:pointer}',
    '.tb-in{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 32px)}',
    '.tb-wrap{max-width:560px;margin:0 auto;display:grid;gap:18px}',
    '.tb-stand{margin:0;font-size:22px;font-weight:700;color:#3d2b22}',
    '.tb-balken{height:14px;border-radius:999px;background:#e6dccd;overflow:hidden;margin-top:8px}',
    '.tb-balken i{display:block;height:100%;background:#1f6f4a;border-radius:999px;transition:width .5s ease}',
    '.tb-liste{list-style:none;margin:0;padding:0;display:grid;gap:14px}',
    '.tb-z{display:grid;gap:12px;padding:16px;border-radius:22px;background:#fff;border:2px solid #e6dccd}',
    '.tb-z.dran{border-color:#a8480f;background:#fdeee0;box-shadow:0 0 0 4px rgba(168,72,15,.14)}',
    '.tb-z.ok{background:#eef7f1;border-color:#9cc9ad}',
    '.tb-k{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}',
    '.tb-zeit{font-size:28px;font-weight:800;color:#8a3a0b;font-variant-numeric:tabular-nums}',
    '.tb-name{font-size:26px;font-weight:800;line-height:1.2;min-width:0;overflow-wrap:anywhere}',
    '.tb-dran{display:inline-block;padding:4px 12px;border-radius:999px;background:#a8480f;color:#fff;font-size:17px;font-weight:700}',
    '.tb-notiz{margin:0;font-size:20px;color:#4a443d;overflow-wrap:anywhere}',
    '.tb-gen{white-space:nowrap;display:flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:88px;padding:12px 20px;border:0;border-radius:24px;background:#1f6f4a;color:#fff;font:inherit;font-size:30px;font-weight:800;cursor:pointer;box-shadow:0 7px 0 #134a31;touch-action:manipulation}',
    '.tb-gen:active{transform:translateY(4px);box-shadow:0 3px 0 #134a31}',
    '.tb-fertig{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:22px;font-weight:700;color:#1b5e3b}',
    '.tb-klein-k{min-height:56px;padding:8px 18px;border-radius:999px;border:2px solid #a8957c;background:#fff;color:#1d1915;font:inherit;font-size:18px;font-weight:700;cursor:pointer}',
    '.tb-leer{margin:0;padding:18px;border-radius:18px;border:2px dashed #a8957c;background:#fbf8f3;font-size:21px;color:#4a443d}',
    '.tb-box{padding:16px;border-radius:22px;background:#fbf8f3;border:1px solid #e6dccd}',
    '.tb-form h3{margin:8px 0 0!important}',
    '.tb-box h3{margin:0 0 10px;font:700 22px/1.2 Georgia,"Times New Roman",serif;color:#5a2a0b}',
    '.tb-neu-k{width:100%;min-height:72px;border-radius:22px;border:2px solid #a8480f;background:#fff;color:#8a3a0b;font:inherit;font-size:24px;font-weight:800;cursor:pointer}',
    '.tb-form{display:grid;gap:14px}',
    '.tb-form label{display:grid;gap:6px;font-size:20px;font-weight:700;color:#3d2b22}',
    '.tb-form label small{font-weight:400;color:#5d554c;font-size:17px}',
    '.tb-form input{width:100%;min-height:60px;padding:10px 14px;border-radius:14px;border:2px solid #a8957c;background:#fff;color:#1d1915;font:inherit;font-size:22px!important}',
    '.tb-form input:focus-visible,.tb-fe button:focus-visible,.tb-ban button:focus-visible{outline:3px solid #a8480f;outline-offset:3px}',
    '.tb-speichern{min-height:72px;border:0;border-radius:22px;background:#a8480f;color:#fff;font:inherit;font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 6px 0 #6e2e09}',
    '.tb-plan{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px}',
    '.tb-plan li{display:flex;align-items:center;gap:12px;padding:8px 8px 8px 14px;border-radius:16px;background:#fff;border:1px solid #e6dccd;font-size:19px}',
    '.tb-plan li span{flex:1;min-width:0;overflow-wrap:anywhere}',
    '.tb-woche{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;text-align:center}',
    '.tb-wt{display:grid;justify-items:center;gap:4px;font-size:17px;color:#5d554c;min-width:0}',
    '.tb-wt b{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;font-size:21px;font-weight:800;border:2px solid #d5c8b5;background:#fff;color:#8a7f72!important}',
    '.tb-wt.voll b{background:#1f6f4a;border-color:#1f6f4a;color:#fff!important}',
    '.tb-wt.halb b{background:linear-gradient(90deg,#1f6f4a 50%,#fff 50%);border-color:#1f6f4a;color:transparent!important}',
    '.tb-wt.tb-heu{color:#8a3a0b;font-weight:800}',
    '.tb-wt.tb-heu b{box-shadow:0 0 0 3px rgba(168,72,15,.45)}',
    '.tb-legende{margin:10px 0 0;font-size:17px;color:#5d554c}',
    '.tb-meld{width:100%;min-height:64px;border-radius:20px;border:2px solid #3d5a80;background:#fff;color:#243a5a;font:inherit;font-size:21px;font-weight:700;cursor:pointer}',
    '.tb-meld.an{background:#e8eef7}',
    '.tb-hinweis{margin:8px 0 0;font-size:17px;color:#4a443d}',
    '.tb-gesund{margin:0;padding:14px 16px;border-radius:18px;background:#fff4e0;border:2px solid #e0b878;color:#4a3410;font-size:20px;font-weight:700;line-height:1.4}',
    '.tb-gesund small{display:block;font-weight:400;font-size:17px;margin-top:4px}',
    '.tb-ban{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:2147483050;max-width:560px;margin:0 auto;padding:14px;border-radius:22px;background:#fffaf2;border:3px solid #a8480f;color:#1d1915;box-shadow:0 14px 40px rgba(0,0,0,.28);font:400 20px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;display:grid;gap:10px;animation:tbRein .35s cubic-bezier(.2,.8,.2,1)}',
    '.tb-ban-t{margin:0;font-size:21px;font-weight:800;color:#8a3a0b}',
    '.tb-ban-m{margin:0;font-size:24px;font-weight:800;overflow-wrap:anywhere}',
    '.tb-ban-k{display:flex;gap:10px}',
    '.tb-ban-k .tb-gen{min-height:68px;font-size:23px;flex:1.6;white-space:nowrap;padding:8px 12px}',
    '.tb-ban-k .tb-klein-k{flex:1;min-height:68px;font-size:20px}',
    '@keyframes tbRein{from{transform:translateY(-24px);opacity:0}}',
    '@media (prefers-reduced-motion:reduce){.tb-ban{animation:none}.tb-gen:active{transform:none}.tb-balken i{transition:none}}'
  ].join('\n');
  d.head.appendChild(css);

  /* ---------- Fenster ---------- */
  var fe = null, vorFokus = null, formOffen = false;
  function bau() {
    if (fe) return fe;
    fe = d.createElement('div');
    fe.className = 'tb-fe'; fe.hidden = true;
    fe.setAttribute('role', 'dialog'); fe.setAttribute('aria-modal', 'true'); fe.setAttribute('aria-labelledby', 'tb-titel');
    fe.innerHTML = '<div class="tb-kopf"><h2 id="tb-titel" tabindex="-1">💊 Meine Tabletten</h2><button type="button" class="tb-zu" data-t="zu" aria-label="Schliessen">✕</button></div>' +
      '<div class="tb-in"><div class="tb-wrap">' +
      '<div><p class="tb-stand" aria-live="polite"></p><div class="tb-balken" aria-hidden="true"><i style="width:0"></i></div></div>' +
      '<ul class="tb-liste" aria-label="Tabletten heute"></ul>' +
      '<div class="tb-box tb-eintragen"><button type="button" class="tb-neu-k" data-t="neu" aria-expanded="false">➕ Tablette eintragen</button>' +
      '<form class="tb-form" novalidate hidden><h3>Neue Tablette</h3>' +
      '<label>Name<input name="tname" maxlength="60" autocomplete="off" placeholder="z. B. Blutdruck-Tablette"></label>' +
      '<label>Uhrzeit<input name="tzeit" type="time" value="08:00" required></label>' +
      '<label>Notiz <small>(freiwillig, z. B. «zum Frühstück»)</small><input name="tnotiz" maxlength="60" autocomplete="off"></label>' +
      '<button type="submit" class="tb-speichern">Speichern</button>' +
      '<p class="tb-hinweis">Bitte so eintragen, wie es auf Ihrem Plan steht. Für zwei Zeiten am Tag einfach zweimal eintragen.</p></form>' +
      '<ul class="tb-plan" aria-label="Meine eingetragenen Tabletten"></ul></div>' +
      '<div class="tb-box tb-wo"><h3>Die letzten 7 Tage</h3><div class="tb-woche"></div><p class="tb-legende"></p></div>' +
      '<div class="tb-box tb-mbox"><h3>Erinnerung</h3><p class="tb-hinweis tb-m-txt"></p><button type="button" class="tb-meld" data-t="meld"></button></div>' +
      '<p class="tb-gesund">Fragen zu Medikamenten: Ärztin oder Apotheke.<small>Rosa gibt keinen Rat zu Mengen oder Wechselwirkungen. Sie erinnert nur an das, was Sie selbst eingetragen haben.</small></p>' +
      '</div></div>';
    d.body.appendChild(fe);
    fe.addEventListener('click', klick);
    fe.querySelector('form').addEventListener('submit', speichern);
    fe.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); zu(); return; }
      if (e.key !== 'Tab') return;
      var f = [].slice.call(fe.querySelectorAll('button,input,[tabindex="0"]')).filter(function (x) { return !x.disabled && x.getClientRects().length; });
      if (!f.length) return;
      if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    return fe;
  }

  function zeichne() {
    if (!fe || fe.hidden) return;
    var l = liste(), t = tag(), jetzt = jetztHM(), n = 0;
    var ul = fe.querySelector('.tb-liste');
    if (!l.length) {
      ul.innerHTML = '<li><p class="tb-leer">Noch keine Tabletten eingetragen. Unten Name und Uhrzeit eintragen, dann «Speichern».</p></li>';
    } else {
      ul.innerHTML = l.map(function (m) {
        var gen = t[m.id], dran = !gen && m.zeit <= jetzt; if (gen) n++;
        return '<li class="tb-z' + (gen ? ' ok' : dran ? ' dran' : '') + '" data-id="' + esc(m.id) + '">' +
          '<div class="tb-k"><span class="tb-zeit">' + esc(uhr(m.zeit)) + '</span><span class="tb-name">' + esc(m.name) + '</span>' + (dran ? '<span class="tb-dran">Jetzt dran</span>' : '') + '</div>' +
          (m.notiz || m.hinweis ? '<p class="tb-notiz">' + esc(m.notiz || m.hinweis) + '</p>' : '') +
          (gen ? '<div class="tb-fertig"><span>✓ Genommen um ' + esc(uhr(gen)) + '</span><button type="button" class="tb-klein-k" data-t="zurueck" aria-label="' + esc(m.name) + ': doch noch nicht genommen">Rückgängig</button></div>'
            : '<button type="button" class="tb-gen" data-t="gen" aria-label="' + esc(m.name) + ' um ' + esc(uhr(m.zeit)) + ': genommen">✓ Genommen</button>') +
          '</li>';
      }).join('');
    }
    var st = fe.querySelector('.tb-stand');
    st.textContent = !l.length ? 'Heute ist noch nichts geplant.' : n === l.length ? 'Heute alles genommen. Schön! 🌹' : 'Heute: ' + n + ' von ' + l.length + ' genommen';
    fe.querySelector('.tb-balken i').style.width = (l.length ? Math.round(n / l.length * 100) : 0) + '%';
    fe.querySelector('.tb-plan').innerHTML = l.map(function (m) {
      var no = m.notiz || m.hinweis;
      return '<li><span><b>' + esc(uhr(m.zeit)) + '</b> · ' + esc(m.name) + (no ? ' · ' + esc(no) : '') + '</span><button type="button" class="tb-klein-k" data-t="weg" data-id="' + esc(m.id) + '" aria-label="' + esc(m.name) + ' um ' + esc(uhr(m.zeit)) + ' löschen">Löschen</button></li>';
    }).join('');
    woche(l);
    meldText();
    var neuK = fe.querySelector('[data-t=neu]'), form = fe.querySelector('form');
    form.hidden = !formOffen; neuK.setAttribute('aria-expanded', formOffen ? 'true' : 'false');
    neuK.textContent = formOffen ? 'Abbrechen' : '➕ Tablette eintragen';
  }

  function woche(l) {
    var box = fe.querySelector('.tb-wo'), w = box.querySelector('.tb-woche');
    box.hidden = !l.length;
    if (!l.length) return;
    var A = alleTage(), tg = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], html = '', voll = 0;
    for (var i = 6; i >= 0; i--) {
      var dt = new Date(); dt.setDate(dt.getDate() - i);
      var t = A[tagK(dt)] || {}, n = l.filter(function (m) { return t[m.id]; }).length;
      var art = n >= l.length ? 'voll' : n > 0 ? 'halb' : 'leer';
      if (art === 'voll') voll++;
      var wort = tg[dt.getDay()];
      html += '<div class="tb-wt ' + art + (i === 0 ? ' tb-heu' : '') + '" role="img" aria-label="' + (i === 0 ? 'Heute' : tg[dt.getDay()] + ' ' + dt.getDate() + '.') + ': ' + n + ' von ' + l.length + ' genommen"><b aria-hidden="true">' + (art === 'voll' ? '✓' : art === 'halb' ? '½' : '') + '</b><span aria-hidden="true">' + wort + '</span></div>';
    }
    w.innerHTML = html;
    box.querySelector('.tb-legende').textContent = 'An ' + voll + ' von 7 Tagen alles genommen. Grün = alles, halb grün = teilweise, leer = nichts abgehakt. Heute ist umrandet.';
  }

  /* ---------- Mitteilungen ---------- */
  var KANN = 'Notification' in window;
  function meldAn() { return KANN && Notification.permission === 'granted' && hol('tablMeld', false) === true; }
  function meldText() {
    var b = fe.querySelector('[data-t=meld]'), p = fe.querySelector('.tb-m-txt');
    var basis = 'Solange Rosa offen ist, erscheint zur Uhrzeit oben ein Hinweis mit grossem «✓ Genommen». ';
    if (!KANN) { b.hidden = true; p.textContent = basis + 'Was sicher klingeln muss, bitte zusätzlich im Wecker des Handys eintragen.'; return; }
    b.hidden = false;
    if (Notification.permission === 'denied') { b.hidden = true; p.textContent = basis + 'Mitteilungen sind in den Einstellungen des Browsers ausgeschaltet. Was sicher klingeln muss, bitte im Wecker des Handys eintragen.'; return; }
    var an = meldAn();
    b.classList.toggle('an', an); b.setAttribute('aria-pressed', an ? 'true' : 'false');
    b.textContent = an ? '🔔 Mitteilung ist an · ausschalten' : '🔔 Auch als Mitteilung erinnern';
    p.textContent = basis + (an ? 'Zusätzlich kommt eine Mitteilung, auch wenn Rosa im Hintergrund offen ist. Ist Rosa ganz zu, kommt nichts: bitte Wichtiges auch im Wecker eintragen.' : 'Auf Wunsch kommt zusätzlich eine Mitteilung des Handys.');
  }
  function meldUmschalten() {
    if (!KANN) return;
    if (meldAn()) { leg('tablMeld', false); zeichne(); return; }
    var fertig = function (p) {
      if (p === 'granted') { leg('tablMeld', true); hinweis('🔔 Mitteilungen sind an.'); }
      else hinweis('Ohne Erlaubnis kommt keine Mitteilung. Rosa erinnert trotzdem, solange sie offen ist.');
      zeichne();
    };
    try {
      var r = Notification.requestPermission(fertig);
      if (r && r.then) r.then(fertig, function () { fertig('default'); });
    } catch (e) { fertig('default'); }
  }
  function melde(m) {
    if (!meldAn()) return;
    var titel = '💊 ' + uhr(m.zeit) + ': ' + m.name, o = { body: 'Rosa erinnert an Ihre Tablette. Tippen und «✓ Genommen» drücken.', tag: 'rosa-tabl-' + m.id, icon: 'icon-192.png', badge: 'icon-192.png', renotify: false, requireInteraction: false, data: { tabl: m.id } };
    var direkt = function () { try { var n = new Notification(titel, o); n.onclick = function () { try { window.focus(); } catch (e) {} oeffnen(); n.close(); }; } catch (e) {} };
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
        navigator.serviceWorker.getRegistration().then(function (reg) { if (reg && reg.showNotification) reg.showNotification(titel, o).catch(direkt); else direkt(); }, direkt);
      } else direkt();
    } catch (e) { direkt(); }
  }

  /* ---------- Kleiner Hinweis (nutzt Rosas Toast, falls da) ---------- */
  function hinweis(text, o) { try { if (window.R8 && window.R8.toast) return window.R8.toast(text, o); } catch (e) {} }

  /* ---------- Aktionen ---------- */
  function genommen(id) {
    var vor = tag()[id], m = liste().filter(function (x) { return x.id === id; })[0];
    setze(id, true); summ(); zeichne(); pruefen();
    if (m) sag('Gut gemacht. ' + m.name + ' ist abgehakt.');
    hinweis('✓ ' + (m ? m.name : 'Tablette') + ' genommen', { undo: function () { var t = tag(); if (vor) t[id] = vor; else delete t[id]; legTag(t); sync(); zeichne(); pruefen(); } });
    if (fe && !fe.hidden) { var b = fe.querySelector('[data-id="' + id + '"] .tb-klein-k'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} }
  }
  function klick(e) {
    var b = e.target.closest('[data-t]'); if (!b) return;
    var li = b.closest('[data-id]'), id = b.getAttribute('data-id') || (li && li.getAttribute('data-id')), a = b.getAttribute('data-t');
    if (a === 'zu') zu();
    else if (a === 'gen') genommen(id);
    else if (a === 'zurueck') { var vor = tag()[id]; setze(id, false); zeichne(); pruefen(); hinweis('Zurückgenommen. Kein Problem.', { undo: function () { var t = tag(); t[id] = vor; legTag(t); sync(); zeichne(); pruefen(); } }); var g = fe.querySelector('[data-id="' + id + '"] .tb-gen'); if (g) g.focus({ preventScroll: true }); }
    else if (a === 'neu') { formOffen = !formOffen; zeichne(); if (formOffen) fe.querySelector('[name=tname]').focus(); }
    else if (a === 'weg') {
      var alt = hol('medi', []), m = liste().filter(function (x) { return x.id === id; })[0];
      leg('medi', (Array.isArray(alt) ? alt : []).filter(function (x) { return x && x.id !== id; })); sync(); zeichne(); pruefen();
      hinweis((m ? m.name : 'Tablette') + ' gelöscht', { undo: function () { leg('medi', alt); sync(); zeichne(); pruefen(); } });
    }
    else if (a === 'meld') meldUmschalten();
  }
  function speichern(e) {
    e.preventDefault();
    var f = e.target, fN = f.elements.tname, fZ = f.elements.tzeit, fH = f.elements.tnotiz;
    var n = fN.value.trim(), z = fZ.value, h = fH.value.trim();
    if (!n) { fN.focus(); hinweis('Bitte den Namen eintragen.'); return; }
    if (!/^\d{2}:\d{2}$/.test(z)) { fZ.focus(); hinweis('Bitte eine Uhrzeit wählen.'); return; }
    var l = hol('medi', []); l = Array.isArray(l) ? l : [];
    l.push({ id: 'm' + Date.now().toString(36), name: n, zeit: z, hinweis: h }); leg('medi', l); sync();
    fN.value = ''; fH.value = ''; formOffen = false;
    zeichne(); pruefen();
    hinweis('💊 ' + n + ' um ' + uhr(z) + ' gespeichert');
    try { fe.querySelector('.tb-stand').scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (x) {}
  }

  function oeffnen() {
    bau(); vorFokus = d.activeElement;
    fe.hidden = false; d.documentElement.classList.add('tb-offen');
    formOffen = !liste().length;
    zeichne(); pruefen();
    setTimeout(function () { try { fe.querySelector('#tb-titel').focus({ preventScroll: true }); } catch (e) {} }, 30);
  }
  function zu() {
    if (!fe || fe.hidden) return;
    fe.hidden = true; d.documentElement.classList.remove('tb-offen');
    pruefen();
    try { if (vorFokus && vorFokus.isConnected) vorFokus.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---------- Sanfte Erinnerung, solange Rosa offen ist ---------- */
  var ban = null, spaeter = 0;
  function pruefen() {
    var offen = offeneJetzt();
    /* Mitteilung: einmal pro Tablette und Tag, nur in den ersten 90 Minuten */
    var G = hol('tablGemeldet', {}), k = tagK(), g = (G && G[k]) || {}, neu = false;
    if (meldAn()) offen.forEach(function (m) { if (!g[m.id] && minSeit(m.zeit) <= 90) { g[m.id] = 1; neu = true; melde(m); } });
    if (neu) { var NG = {}; NG[k] = g; leg('tablGemeldet', NG); }
    /* Hinweis oben */
    var zeig = offen.length && (!fe || fe.hidden) && Date.now() > spaeter;
    if (!zeig) { if (ban) ban.hidden = true; return; }
    if (!ban) {
      ban = d.createElement('div'); ban.className = 'tb-ban'; ban.setAttribute('role', 'status'); ban.setAttribute('aria-live', 'polite');
      d.body.appendChild(ban);
      ban.addEventListener('click', function (e) {
        var b = e.target.closest('[data-b]'); if (!b) return;
        var a = b.getAttribute('data-b');
        if (a === 'gen') genommen(b.getAttribute('data-id'));
        else if (a === 'spaeter') { spaeter = Date.now() + 10 * 60000; ban.hidden = true; hinweis('Gut, Rosa erinnert in 10 Minuten nochmals.'); }
        else if (a === 'alle') oeffnen();
      });
    }
    var m = offen[0], mehr = offen.length - 1, war = ban.hidden === false && ban.getAttribute('data-id') === m.id;
    ban.setAttribute('data-id', m.id);
    if (!war) {
      ban.innerHTML = '<p class="tb-ban-t">🔔 Zeit für Ihre Tablette</p>' +
        '<p class="tb-ban-m">' + esc(uhr(m.zeit)) + ' · ' + esc(m.name) + '</p>' +
        (mehr > 0 ? '<button type="button" class="tb-klein-k" data-b="alle">+ ' + mehr + ' weitere ansehen</button>' : '') +
        '<div class="tb-ban-k"><button type="button" class="tb-gen" data-b="gen" data-id="' + esc(m.id) + '">✓ Genommen</button><button type="button" class="tb-klein-k" data-b="spaeter">Später</button></div>';
    }
    ban.hidden = false;
  }

  /* ---------- Karte für die Wisch-Karten ---------- */
  function karte() {
    var l = liste(), t = tag(), offen = l.filter(function (m) { return !t[m.id]; }), dran = offeneJetzt().length;
    var text = !l.length ? 'Tabletten selbst eintragen. Rosa erinnert und Sie drücken «✓ Genommen».'
      : !offen.length ? 'Heute alles genommen. Schön! ✓'
      : dran ? 'Jetzt dran: ' + offeneJetzt()[0].name + '. Tippen und «✓ Genommen» drücken.'
      : 'Heute noch ' + offen.length + ' offen · nächste um ' + uhr(offen[0].zeit) + '.';
    return { id: 'tabletten', e: '💊', chip: dran ? 'Jetzt dran' : 'Tabletten', titel: 'Meine Tabletten', text: text, los: oeffnen, drueber: true, art: 'bereich', farbe: '#1f6f4a' };
  }

  window.RosaTabletten = { karte: karte, oeffnen: oeffnen, zu: zu, dran: function () { return offeneJetzt().length > 0; } };

  function los() {
    pruefen();
    setInterval(pruefen, 20000);
    d.addEventListener('visibilitychange', function () { if (!d.hidden) pruefen(); });
    window.addEventListener('storage', function () { zeichne(); pruefen(); });
    try { if (/[?&#]tabletten\b/.test(location.search + location.hash)) oeffnen(); } catch (e) {}
    try {
      if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', function (e) { if (e.data && e.data.tabl) oeffnen(); });
    } catch (e) {}
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { setTimeout(los, 60); }); else setTimeout(los, 60);
})();
