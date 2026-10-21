/* Runde 7 (21.10.2026): Design, Verifizierung, mehr Funktionen.
   - Einheitlicher Feinschliff: 8er-Raster, Typo-Skala, Karten, Knöpfe, Goldakzente, schöner Tastatur-Fokus
   - Himmel passend zur Tageszeit (Morgenlicht, Tag, Abendrot, Sternennacht), Sterne mit leichtem Parallax beim Scrollen (ruht, wenn nichts passiert)
   - Weiche Übergänge zwischen Ansichten, sanfte Erfolgs-Momente, Leerzustände mit Figur
   - «Neu bei …»-Karte mit den neuen Funktionen dieser Runde
   - Kurzes haptisches Tippen (nicht in Kinder-Apps)
   Alles bleibt nur auf diesem Gerät. */
(function () {
  'use strict';
  var C = {
    k: 'fiasnest', figur: 'Fia', bild: 'posen/liegt.jpg', kind: false, haptik: true,
    deko: '.aurora i,.cloud,.lantern,.scene .sun,.wave',
    ansichten: '.screen,.sheet,[role=dialog]',
    funktionen: [
      {
        id: 'mond', emo: '🌙', titel: 'Der Mond heute Nacht', kurz: 'Mondphase und ein ruhiger Satz von Fia.',
        bau: function (H) {
          var m = H.mondInfo();
          var SATZ = ['Neumond. Die Nacht ist dunkler als sonst, gut für tiefen Schlaf. Fia zieht die Vorhänge trotzdem zu.', 'Eine feine Sichel. Neues darf klein anfangen, auch ein neues Abendritual.', 'Halbmond. Halb Tag, halb Nacht. Ein guter Abend, um etwas abzuschliessen.', 'Der Mond wird voller. Vielleicht ist es draussen heller. Ein dunkles Zimmer hilft.', 'Vollmond. Manche schlafen in diesen Nächten etwas leichter. Das ist normal und geht vorbei. Fia bleibt bei dir.', 'Der Mond nimmt ab. Gute Zeit, um loszulassen, was der Tag gebracht hat.', 'Halbmond. Die Nächte werden wieder dunkler. Dein Nest wird ruhiger.', 'Eine abnehmende Sichel. Fia sammelt die letzten Glutfunken und legt sich hin.'];
          var n = H.karte('mond', '🌙 Der Mond heute Nacht',
            '<div class="r7-kopf"><span aria-hidden="true" style="font-size:64px;line-height:1;flex:none">' + m.e + '</span><div><b style="color:var(--r7-gold2);font-size:18px">' + H.esc(m.name.charAt(0).toUpperCase() + m.name.slice(1)) + '</b><p class="r7-leise" style="margin:0">' + m.hell + ' % beleuchtet' + (m.i !== 4 ? ' · Vollmond in etwa ' + m.tageBisVoll + ' Tagen' : '') + '</p></div></div>' +
            '<p style="margin-top:16px">' + H.esc(SATZ[m.i]) + '</p>');
          return n;
        }
      },
      {
        id: 'parkplatz', emo: '📝', titel: 'Gedanken-Parkplatz', kurz: 'Was morgen ansteht, aufschreiben und abgeben. Am Morgen liegt es hier.',
        bau: function (H) {
          var L = H.hol('park', []);
          var n = H.karte('parkplatz', '📝 Gedanken-Parkplatz',
            '<p>Kreist im Kopf, was morgen zu tun ist? Schreib es hier hin. Fia passt darauf auf, bis du wach bist. Dann darf der Kopf ruhen.</p>' +
            '<form class="r7-pf" style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap"><label class="r7-feld" style="flex:1 1 200px">Für morgen<input name="t" maxlength="80" placeholder="z. B. Zahnarzt anrufen" autocomplete="off" enterkeyhint="done"></label><button type="submit" class="r7-btn voll">Parkieren</button></form>' +
            '<ul class="r7-liste r7-pl"></ul><div class="r7-reihe"><button type="button" class="r7-btn" data-a="leer" hidden>Alles erledigt, leeren</button></div>');
          function zeig() {
            var ul = n.querySelector('.r7-pl');
            ul.innerHTML = L.length ? L.map(function (x, i) { return '<li><span>' + (x.ok ? '✅ <s>' : '🅿️ ') + H.esc(x.t) + (x.ok ? '</s>' : '') + '</span><button type="button" class="r7-btn" data-i="' + i + '" aria-label="' + H.esc(x.t) + (x.ok ? ' wieder offen' : ' erledigt') + '">' + (x.ok ? '↺' : '✓') + '</button></li>'; }).join('') : '';
            if (!L.length) ul.innerHTML = '<li style="background:none;border:0;padding:0">' + H.leer('Der Parkplatz ist leer. Ein freier Kopf schläft leichter.', 'posen/schlaeft.jpg') + '</li>';
            n.querySelector('[data-a=leer]').hidden = !L.length;
          }
          n.querySelector('form').addEventListener('submit', function (e) {
            e.preventDefault(); var t = this.t.value.trim(); if (!t) return;
            if (L.length >= 7) { H.toast('Sieben Gedanken reichen für heute. Der Rest darf bis morgen warten.'); return; }
            L.push({ t: t.slice(0, 80), ok: false }); this.t.value = ''; H.leg('park', L); zeig();
            H.feier(n, H.TZ === 'abend' || H.TZ === 'nacht' ? 'Parkiert. Du darfst es jetzt loslassen.' : 'Parkiert.');
          });
          n.addEventListener('click', function (e) {
            var b = e.target.closest('[data-i],[data-a]'); if (!b) return;
            if (b.hasAttribute('data-i')) { var x = L[+b.getAttribute('data-i')]; x.ok = !x.ok; if (x.ok) H.summ(10); }
            else L = [];
            H.leg('park', L); zeig();
          });
          zeig(); return n;
        }
      },
      {
        id: 'nap', emo: '😴', titel: 'Power-Nap', kurz: '20 Minuten ausruhen, dann weckt dich ein sanfter Sonnenaufgang.',
        bau: function (H) {
          var n = H.karte('nap', '😴 Power-Nap',
            '<p>Ein kurzes Nickerchen am Nachmittag erfrischt, ohne den Nachtschlaf zu stören. Bleib unter 30 Minuten und am besten vor 15 Uhr.</p>' +
            '<div class="r7-chips" role="group" aria-label="Dauer"><button type="button" data-m="10">10 Min.</button><button type="button" data-m="20">20 Min.</button><button type="button" data-m="25">25 Min.</button></div>' +
            '<p class="r7-leise">Die App muss offen bleiben, der Bildschirm darf dunkel werden. Lauter als nötig wird es nicht.</p>');
          n.addEventListener('click', function (e) {
            var b = e.target.closest('[data-m]'); if (!b) return;
            var ges = +b.getAttribute('data-m') * 60, t0 = Date.now(), iv = 0, wl = null, geweckt = false;
            try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (x) { wl = x; }, function () {}); } catch (x) {}
            var v = H.voll('<img alt="" src="posen/schlaeft.jpg" style="opacity:.55;transition:opacity 2s"><p style="opacity:.75">Augen zu. Fia passt auf die Zeit auf.</p><p class="r7-zahl" style="opacity:.5" aria-live="off"></p><button type="button" class="r7-btn" style="opacity:.7">Aufwachen</button>', function () { clearInterval(iv); try { if (wl) wl.release(); } catch (x) {} });
            v.el.style.setProperty('background', '#05060f', 'important'); v.el.style.transition = 'background 60s linear';
            v.el.querySelector('button').onclick = v.zu;
            iv = setInterval(function () {
              var rest = ges - (Date.now() - t0) / 1000; v.el.querySelector('.r7-zahl').textContent = H.zeit(rest);
              if (rest <= 60 && !geweckt) { geweckt = true; v.el.style.setProperty('background', 'radial-gradient(120% 80% at 50% 110%,#ffb36b,#e8735a 35%,#3a2350 75%,#0b0d22)', 'important'); v.el.querySelector('img').src = 'posen/wach.jpg'; v.el.querySelector('img').style.opacity = '1'; }
              if (rest <= 0) {
                clearInterval(iv); [0, 1600, 3200].forEach(function (d, i) { setTimeout(function () { H.ton(396 + i * 132, 1.4, 0.03 + i * 0.02); }, d); });
                v.el.querySelector('p').textContent = 'Guten Morgen, kleines Nickerchen vorbei. Streck dich langsam.'; v.el.querySelector('p').style.opacity = '1';
                v.el.querySelector('.r7-zahl').textContent = ''; v.el.querySelector('button').textContent = 'Ich bin wach'; H.leg('naps', H.hol('naps', 0) + 1);
              }
            }, 1000);
          });
          return n;
        }
      }
    ],
    einsetzen: function (N) {
      var home = document.getElementById('home'); if (!home) return;
      var r6 = home.querySelectorAll('.r6-karte'), nach = r6.length ? r6[r6.length - 1] : null;
      var w = home.querySelector('#weltKarte');
      ['mond', 'parkplatz', 'nap'].forEach(function (k) { if (!N[k]) return; if (nach) { nach.after(N[k]); nach = N[k]; } else if (w) w.before(N[k]); else home.appendChild(N[k]); });
      /* Morgens: Parkplatz nach oben, damit die Gedanken von gestern bereitliegen */
      if (/morgen/.test(window.R7 && window.R7.TZ) && N.parkplatz && (window.R7.hol('park', []) || []).some(function (x) { return !x.ok; })) { var g = home.querySelector('.r6-gruss'); if (g) g.after(N.parkplatz); }
    },
    neuOrt: function (w) {
      var home = document.getElementById('home'); if (!home) return;
      var g = home.querySelector('.r6-gruss'); if (g) g.after(w); else home.insertBefore(w, home.firstChild);
    }
};
  if (window.R7) return;
  var K = C.k + '.r7.';
  function hol(k, d) { try { var v = localStorage.getItem(K + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; }
  var reduziert = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var ruhig = !!C.kind || reduziert;
  function summ(m) { try { if (C.haptik && !C.kind && navigator.vibrate) navigator.vibrate(m); } catch (e) {} }
  var jetzt = new Date();
  try { var q = new URLSearchParams(location.search); if (q.get('r6zeit')) jetzt.setHours(+q.get('r6zeit')); } catch (e) {}
  var Std = jetzt.getHours();
  function tageszeit() { return Std < 5 ? 'nacht' : Std < 10 ? 'morgen' : Std < 17 ? 'tag' : Std < 21 ? 'abend' : 'nacht'; }
  var TZ = tageszeit();
  var heute = jetzt.getFullYear() + '-' + (jetzt.getMonth() + 1) + '-' + jetzt.getDate();
  var tagNr = Math.floor((jetzt.getTime() - jetzt.getTimezoneOffset() * 6e4) / 864e5);
  var F = C.figur;

  /* ---------- Stimme (Handystimme, nur wenn vorhanden) ---------- */
  var kannReden = !C.stumm && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
  var redet = null;
  function sag(t, fertig) {
    if (!kannReden) { if (fertig) fertig(); return; }
    still();
    try {
      var u = new SpeechSynthesisUtterance(String(t).replace(/[«»]/g, '')); u.lang = 'de-CH'; u.rate = C.kind ? 0.88 : 0.94;
      try { var v = speechSynthesis.getVoices(); u.voice = v.filter(function (x) { return /de-CH/i.test(x.lang); })[0] || v.filter(function (x) { return /^de/i.test(x.lang); })[0] || null; } catch (e) {}
      u.onend = u.onerror = function () { if (redet === u) { redet = null; if (fertig) fertig(); } };
      redet = u; speechSynthesis.speak(u);
    } catch (e) { if (fertig) fertig(); }
  }
  function still() { redet = null; try { speechSynthesis.cancel(); } catch (e) {} }

  /* ---------- Design-Schicht ---------- */
  var HIMMEL = {
    morgen: 'radial-gradient(120% 60% at 80% -10%,rgba(255,196,120,.28),transparent 60%)',
    tag: 'radial-gradient(120% 60% at 50% -15%,rgba(150,190,255,.20),transparent 60%)',
    abend: 'radial-gradient(130% 60% at 15% -10%,rgba(255,138,110,.26),transparent 60%)',
    nacht: 'radial-gradient(120% 60% at 50% -20%,rgba(120,110,255,.18),transparent 65%)'
  };
  var css = [
    ':root{--r7-1:8px;--r7-2:16px;--r7-3:24px;--r7-4:32px;--r7-rad:16px;--r7-rad-s:12px;--r7-gold:#f2c14e;--r7-gold2:#ffe08a;--r7-text:#fffaf0;--r7-leise:#c9d2ee;--r7-karte:linear-gradient(160deg,rgba(38,58,130,.62),rgba(16,26,62,.92));--r7-rand:rgba(242,193,78,.32);--r7-schatten:0 1px 2px rgba(0,0,0,.18),0 10px 28px rgba(0,0,0,.22);--r7-weich:cubic-bezier(.2,.8,.2,1)}',
    /* Fokus und Tippen überall gleich */
    'button,a,[role=button],summary,input,select,textarea{-webkit-tap-highlight-color:transparent}',
    'button,[role=button],a{touch-action:manipulation}',
    ':where(button,a,[role=button],[role=tab],summary,input,select,textarea,[tabindex]:not([tabindex="-1"])):focus-visible{outline:3px solid var(--r7-gold2)!important;outline-offset:2px!important;box-shadow:0 0 0 6px rgba(242,193,78,.22)!important}',
    '::selection{background:rgba(242,193,78,.45);color:#fff}',
    /* Tippflächen mind. 44 px auch bei Eingabefeldern, Schiebereglern und aufklappbaren Zeilen */
    ':where(input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=color]),select){min-height:44px}',
    ':where(summary){min-height:44px;box-sizing:border-box}',
    '.r6-nameform label{min-width:0}.r6-nameform input{width:100%;box-sizing:border-box;min-width:0}',
    /* Himmel */
    '.r7-himmel{position:fixed;inset:-10vh 0 0 0;z-index:-1;pointer-events:none;background:' + HIMMEL[TZ] + ';contain:strict}',
    '.r7-sterne{position:absolute;left:0;top:0;width:1px;height:1px;border-radius:50%;background:transparent;will-change:transform}',
    /* Übergang zwischen Ansichten */
    '.r7-ein{animation:r7Ein .32s var(--r7-weich) both}',
    '@keyframes r7Ein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    /* Karten und Knöpfe der Runde 7 */
    '.r7{color:var(--r7-text);font-size:16px;line-height:1.5;text-align:left}',
    '.r7 [hidden],.r7-voll [hidden],.r7-was [hidden]{display:none!important}',
    '.r7-karte h2,.r7-was h2{text-align:left}',
    '.r7-karte{margin:var(--r7-2) 0;padding:var(--r7-2);border-radius:var(--r7-rad);background:var(--r7-karte);border:1px solid var(--r7-rand);box-shadow:var(--r7-schatten);position:relative;overflow:hidden}',
    '.r7-karte h2{margin:0 0 var(--r7-1);font-size:20px;line-height:1.25;color:var(--r7-gold2);font-weight:800;letter-spacing:-.01em}',
    '.r7-karte h3{margin:var(--r7-2) 0 var(--r7-1);font-size:17px;line-height:1.3;color:var(--r7-text)}',
    '.r7-karte p{margin:0 0 var(--r7-1)}',
    '.r7-leise{color:var(--r7-leise);font-size:14px}',
    '.r7-neu{display:inline-block;margin-left:6px;padding:2px 8px;border-radius:999px;background:var(--r7-gold);color:#14204a;font-size:11px;font-weight:800;letter-spacing:.04em;vertical-align:middle;text-transform:uppercase}',
    '.r7-reihe{display:flex;flex-wrap:wrap;gap:var(--r7-1);margin-top:var(--r7-2)}',
    '.r7-btn{min-height:44px;min-width:44px;padding:10px 18px;border-radius:999px;border:1px solid rgba(242,193,78,.55);background:rgba(14,24,56,.55);color:var(--r7-text);font:inherit;font-weight:700;font-size:15px;line-height:1.2;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;transition:transform .15s var(--r7-weich),background .2s}',
    '.r7-btn.voll{background:var(--r7-gold);color:#14204a;border-color:var(--r7-gold)}',
    '.r7-btn:active{transform:scale(.97)}',
    '.r7-btn[aria-pressed=true]{background:var(--r7-gold);color:#14204a}',
    '.r7-btn:disabled{opacity:.5;cursor:default}',
    '.r7-chips{display:flex;flex-wrap:wrap;gap:var(--r7-1);margin-top:var(--r7-1)}',
    '.r7-chips button{min-height:44px;padding:8px 14px;border-radius:var(--r7-rad-s);border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:var(--r7-text);font:inherit;font-weight:600;font-size:15px;cursor:pointer}',
    '.r7-chips button[aria-pressed=true]{border-color:var(--r7-gold);background:rgba(242,193,78,.24)}',
    '.r7-feld{width:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;margin-top:var(--r7-1);font-weight:700;font-size:14px;color:var(--r7-leise)}',
    '.r7-feld input,.r7-feld textarea,.r7-feld select{width:100%;box-sizing:border-box;min-height:44px;padding:10px 12px;border-radius:var(--r7-rad-s);border:1px solid rgba(242,193,78,.5);background:rgba(8,14,36,.7);color:var(--r7-text);font:inherit;font-size:16px;font-weight:400}',
    '.r7-feld textarea{min-height:88px;resize:vertical}',
    '.r7-kopf{display:flex;gap:var(--r7-2);align-items:center}',
    '.r7-kopf img{flex:none;width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid var(--r7-gold);background:#0e1838}',
    '.r7-gross{font-size:22px;line-height:1.4;font-weight:700;color:var(--r7-text);margin:var(--r7-1) 0}',
    '.r7-leer{display:flex;gap:var(--r7-2);align-items:center;padding:var(--r7-2);border-radius:var(--r7-rad);border:1px dashed rgba(242,193,78,.45);background:rgba(242,193,78,.06);color:var(--r7-leise);margin-top:var(--r7-1)}',
    '.r7-leer img{flex:none;width:56px;height:56px;border-radius:50%;object-fit:cover;opacity:.9}',
    '.r7-liste{list-style:none;margin:var(--r7-1) 0 0;padding:0;display:flex;flex-direction:column;gap:var(--r7-1)}',
    '.r7-liste li{display:flex;gap:var(--r7-1);align-items:center;padding:8px 8px 8px 12px;border-radius:var(--r7-rad-s);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}',
    '.r7-liste li span{flex:1;min-width:0;overflow-wrap:anywhere}',
    /* Neu-Karte */
    '.r7-was{margin:var(--r7-2) 0;padding:var(--r7-2);border-radius:var(--r7-rad);background:linear-gradient(120deg,rgba(242,193,78,.22),rgba(111,140,255,.14));border:1px solid rgba(242,193,78,.5);box-shadow:var(--r7-schatten);text-align:left;color:var(--r7-text)}',
    '.r7-was h2{margin:0;font-size:18px;color:var(--r7-gold2);font-weight:800}',
    '.r7-was ul{list-style:none;margin:var(--r7-1) 0 0;padding:0;display:flex;flex-direction:column;gap:var(--r7-1)}',
    '.r7-was li button{width:100%;min-height:48px;text-align:left;padding:10px 14px;border-radius:var(--r7-rad-s);border:1px solid rgba(255,255,255,.16);background:rgba(10,18,44,.5);color:var(--r7-text);font:inherit;font-size:15px;cursor:pointer;display:flex;gap:10px;align-items:center}',
    '.r7-was li b{color:var(--r7-gold2)}',
    '.r7-was .r7-zu{margin-top:var(--r7-1)}',
    '.r7-glanz{animation:r7Glanz 1.4s var(--r7-weich)}',
    '@keyframes r7Glanz{0%{box-shadow:0 0 0 0 rgba(242,193,78,.6)}100%{box-shadow:0 0 0 18px rgba(242,193,78,0)}}',
    /* Erfolg sanft */
    '.r7-toast{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translate(-50%,20px);opacity:0;z-index:2147483601;display:flex;gap:12px;align-items:center;max-width:min(92vw,420px);padding:10px 16px 10px 10px;border-radius:28px;background:rgba(14,22,52,.96);border:1px solid rgba(242,193,78,.6);color:var(--r7-text);box-shadow:0 12px 30px rgba(0,0,0,.35);font-size:15px;font-weight:600;transition:transform .35s var(--r7-weich),opacity .35s;pointer-events:none}',
    '.r7-toast.da{transform:translate(-50%,0);opacity:1}',
    '.r7-toast img{width:40px;height:40px;border-radius:50%;object-fit:cover;flex:none}',
    /* Vollbild-Ruhe (Sanduhr, Pause, Schlaf) */
    '.r7-voll{position:fixed;inset:0;z-index:2147483600;background:rgba(4,7,20,.985)!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--r7-2);padding:var(--r7-3);text-align:center;color:var(--r7-text)}',
    '.r7-voll img{width:min(52vw,220px);height:min(52vw,220px);border-radius:50%;object-fit:cover;border:3px solid var(--r7-gold);opacity:.9}',
    '.r7-voll p{margin:0;font-size:20px;max-width:360px;line-height:1.45}',
    '.r7-voll small{color:var(--r7-leise);font-size:15px;max-width:340px}',
    '.r7-ring{width:180px;height:180px}',
    '.r7-ring circle{fill:none;stroke-width:10}',
    '.r7-zahl{font-size:40px;font-weight:800;color:var(--r7-gold2);font-variant-numeric:tabular-nums}',
    ':root{--r7-fig:url("' + C.bild + '")}',
    '.r7-leerfig{position:relative;padding-left:56px!important;min-height:48px;box-sizing:border-box}',
    '.r7-leerfig::before{content:"";position:absolute;left:4px;top:50%;width:40px;height:40px;margin-top:-20px;border-radius:50%;background:var(--r7-fig) center/cover no-repeat;border:2px solid rgba(242,193,78,.6);opacity:.95}',
    '@media (prefers-reduced-motion:reduce){.r7-ein,.r7-glanz{animation:none}.r7-toast{transition:none}.r7-btn{transition:none}}'
  ].concat(C.css || []).join('');
  /* Dekorative Dauer-Animationen ruhen, wenn niemand tippt (spart Akku, macht ruhiger); jede Berührung weckt sie */
  if (C.deko) { css += 'html.r7-ruht :is(' + C.deko + '),html.r7-ruht :is(' + C.deko + ')::before,html.r7-ruht :is(' + C.deko + ')::after{animation-play-state:paused!important}@media (prefers-reduced-motion:reduce){:is(' + C.deko + '){animation:none!important}}'; }
  var st = document.createElement('style'); st.id = 'r7-stil'; st.textContent = css; document.head.appendChild(st);

  /* Himmel mit Sternen: statisch, nur beim Scrollen leicht verschoben (Parallax) */
  function himmel() {
    if (C.himmel === false) return;
    var h = document.createElement('div'); h.className = 'r7-himmel'; h.setAttribute('aria-hidden', 'true');
    var n = TZ === 'nacht' ? 70 : TZ === 'abend' ? 45 : TZ === 'morgen' ? 18 : 10, sh = [], s2 = [];
    var r = function (a) { var x = Math.sin(a * 9301 + 49297) * 233280; return x - Math.floor(x); };
    var w = Math.max(innerWidth, 400), hh = Math.max(innerHeight, 800) * 1.2;
    for (var i = 0; i < n; i++) {
      var x = Math.round(r(i + 1) * w), y = Math.round(r(i + 77) * hh), a = (0.25 + r(i + 7) * 0.55).toFixed(2), gr = r(i + 3) > 0.85 ? 1 : 0;
      (i % 2 ? sh : s2).push(x + 'px ' + y + 'px 0 ' + gr + 'px rgba(255,246,220,' + a + ')');
    }
    var a1 = document.createElement('i'); a1.className = 'r7-sterne'; a1.style.boxShadow = sh.join(',');
    var a2 = document.createElement('i'); a2.className = 'r7-sterne'; a2.style.boxShadow = s2.join(',');
    h.appendChild(a1); h.appendChild(a2); document.body.appendChild(h);
    if (reduziert) return;
    var lauf = false;
    function scroll() { if (lauf) return; lauf = true; requestAnimationFrame(function () { var y = scrollY || 0; a1.style.transform = 'translate3d(0,' + (-y * 0.04).toFixed(1) + 'px,0)'; a2.style.transform = 'translate3d(0,' + (-y * 0.09).toFixed(1) + 'px,0)'; lauf = false; }); }
    addEventListener('scroll', scroll, { passive: true });
  }

  /* Weiche Übergänge: wenn eine Ansicht sichtbar wird, blendet sie sanft ein */
  function uebergaenge() {
    if (reduziert || !C.ansichten) return;
    /* Nur beim Wechsel von verborgen zu sichtbar animieren; eigene Klassenwechsel (r7-ein) lösen nichts aus */
    var war = new WeakMap();
    document.querySelectorAll(C.ansichten).forEach(function (e) { war.set(e, !e.hidden); });
    var mo = new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        var t = m.target; if (t.nodeType !== 1) return;
        var an = !t.hidden && t.matches(C.ansichten), vorher = war.get(t);
        if (vorher === an) return; war.set(t, an);
        if (!an || vorher === undefined && m.attributeName === 'class' && m.oldValue && /\b(on|an|aktiv|active|show|offen)\b/.test(m.oldValue)) return;
        t.classList.remove('r7-ein'); void t.offsetWidth; t.classList.add('r7-ein');
        setTimeout(function () { t.classList.remove('r7-ein'); }, 400);
      });
    });
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden'].concat(C.ansichtKlasse ? ['class'] : []), attributeOldValue: true });
  }

  /* Leerzustände bekommen die Figur dazu: «Noch nichts …» wirkt so freundlich statt leer */
  function leerFiguren() {
    if (C.leerFigur === false) return;
    var RX = /^(\S{1,3}\s)?Noch (kein|nichts|leer)/, t = 0;
    function scan() {
      t = 0;
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return /Noch (kein|nichts|leer)/.test(n.data) ? 1 : 3; } }), n;
      while ((n = w.nextNode())) {
        var e = n.parentElement; if (!e || /^(B|STRONG|EM|I|SMALL|SPAN)$/.test(e.tagName) && e.parentElement && /^(P|LI|DIV)$/.test(e.parentElement.tagName) && e.parentElement.children.length === 1) e = e.parentElement;
        if (!e || e.classList.contains('r7-leerfig') || e.closest('.r7-leer,.r7-voll,.r7-toast,button,a,script,style,[hidden]')) continue;
        var x = (e.textContent || '').trim(); if (x.length > 160 || !RX.test(x)) continue;
        e.classList.add('r7-leerfig');
      }
    }
    scan();
    new MutationObserver(function () { if (!t) t = setTimeout(scan, 700); }).observe(document.body, { childList: true, subtree: true });
  }

  function ruhen() {
    if (!C.deko) return;
    var t = 0, ms = C.kind ? 6000 : 10000, de = document.documentElement;
    function weck() { if (de.classList.contains('r7-ruht')) de.classList.remove('r7-ruht'); clearTimeout(t); t = setTimeout(function () { de.classList.add('r7-ruht'); }, ms); }
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (n) { addEventListener(n, weck, { passive: true, capture: true }); });
    weck();
  }

  /* Kurzes Tippen spüren (nur Erwachsenen-Apps) */
  if (C.haptik && !C.kind) document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('button,[role=button],a,summary')) summ(6); }, true);

  /* ---------- Bausteine für die Funktionen ---------- */
  var toastEl = null, toastT = 0;
  function toast(text) {
    if (!toastEl) { toastEl = el('<div class="r7-toast" role="status" aria-live="polite"><img alt="" src="' + esc(C.bild) + '"><span></span></div>'); document.body.appendChild(toastEl); }
    toastEl.querySelector('span').textContent = text; toastEl.classList.add('da');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('da'); }, 2600);
  }
  function feier(karte, text) {
    summ([10, 40, 10]);
    if (karte && !reduziert) { karte.classList.remove('r7-glanz'); void karte.offsetWidth; karte.classList.add('r7-glanz'); }
    if (text) toast(text);
  }
  function leer(text, bild) { return '<div class="r7-leer"><img alt="" loading="lazy" src="' + esc(bild || C.bild) + '"><span>' + esc(text) + '</span></div>'; }
  function karte(id, titel, inhalt) {
    return el('<section class="r7 r7-karte" id="r7-' + id + '" aria-labelledby="r7h-' + id + '"><h2 id="r7h-' + id + '">' + titel + (hol('neu-bis', 0) > tagNr || !hol('neu-bis', 0) ? '<span class="r7-neu">neu</span>' : '') + '</h2>' + inhalt + '</section>');
  }
  function voll(html, zu) {
    var o = el('<div class="r7-voll" role="dialog" aria-modal="true">' + html + '</div>');
    var vorher = document.activeElement;
    function weg() { o.remove(); try { if (vorher) vorher.focus(); } catch (e) {} if (zu) zu(); }
    o.addEventListener('keydown', function (e) { if (e.key === 'Escape') weg(); });
    document.body.appendChild(o); var f = o.querySelector('button'); if (f) f.focus();
    return { el: o, zu: weg };
  }
  /* Knopf eine Weile halten (für Eltern) */
  function halten(b, ms, fn) {
    var t = 0, start = 0, raf = 0;
    b.style.backgroundImage = 'linear-gradient(90deg,rgba(242,193,78,.55) var(--h,0%),transparent var(--h,0%))';
    function los(e) { e.preventDefault(); start = Date.now(); clearTimeout(t); t = setTimeout(function () { ab(); fn(); }, ms); (function f() { b.style.setProperty('--h', Math.min(100, (Date.now() - start) / ms * 100) + '%'); if (start) raf = requestAnimationFrame(f); })(); }
    function ab() { start = 0; clearTimeout(t); cancelAnimationFrame(raf); b.style.setProperty('--h', '0%'); }
    b.addEventListener('pointerdown', los); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (x) { b.addEventListener(x, ab); });
    b.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !start) los(e); });
    b.addEventListener('keyup', ab);
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  function zeit(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function ton(f, dauer, laut) {
    try {
      var A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      var ac = ton.ac || (ton.ac = new A()); var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f || 528; g.gain.value = 0;
      g.gain.linearRampToValueAtTime(laut || 0.06, ac.currentTime + 0.05); g.gain.linearRampToValueAtTime(0, ac.currentTime + (dauer || 0.6));
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + (dauer || 0.6) + 0.05);
    } catch (e) {}
  }
  /* Mondphase (0 Neumond … 0.5 Vollmond … 1), rein gerechnet */
  function mondphase(d) {
    var ref = Date.UTC(2000, 0, 6, 18, 14), syn = 29.530588853;
    var t = ((d.getTime() - ref) / 864e5) % syn; if (t < 0) t += syn; return t / syn;
  }
  function mondInfo(d) {
    var p = mondphase(d || jetzt), i = Math.round(p * 8) % 8;
    var N = [['🌑', 'Neumond'], ['🌒', 'zunehmende Sichel'], ['🌓', 'erstes Viertel'], ['🌔', 'zunehmender Mond'], ['🌕', 'Vollmond'], ['🌖', 'abnehmender Mond'], ['🌗', 'letztes Viertel'], ['🌘', 'abnehmende Sichel']];
    return { p: p, i: i, e: N[i][0], name: N[i][1], hell: Math.round((1 - Math.cos(p * 2 * Math.PI)) / 2 * 100), tageBisVoll: Math.round(((0.5 - p + 1) % 1) * 29.53) };
  }

  var H = { halten: halten, C: C, hol: hol, leg: leg, esc: esc, el: el, sag: sag, still: still, kannReden: kannReden, summ: summ, feier: feier, toast: toast, leer: leer, karte: karte, voll: voll, zeit: zeit, ton: ton, mondInfo: mondInfo, TZ: TZ, heute: heute, tagNr: tagNr, jetzt: jetzt, ruhig: ruhig, reduziert: reduziert, F: F };
  window.R7 = H;

  /* ---------- Funktionen einsetzen ---------- */
  function start() {
    himmel(); uebergaenge(); ruhen(); try { leerFiguren(); } catch (e) {}
    if (!hol('neu-bis', 0)) leg('neu-bis', tagNr + 14);
    var N = {}, liste = [];
    (C.funktionen || []).forEach(function (f) {
      try { var n = f.bau(H); if (n) { N[f.id] = n; n.setAttribute('data-r7', f.id); liste.push(f); } } catch (e) { if (window.console) console.warn('Runde 7', f.id, e); }
    });
    try { C.einsetzen(N, H); } catch (e) { if (window.console) console.warn('Runde 7 einsetzen', e); }
    /* «Neu bei …»-Karte (bis weggetippt oder 14 Tage) */
    setTimeout(function () { neuKarte(N, liste); }, 700);
  }
  function neuKarte(N, liste) {
    if (C.neuKarte !== false && !hol('was-zu', false) && tagNr < hol('neu-bis', tagNr + 14) && C.neuOrt) {
      var w = el('<section class="r7-was" aria-labelledby="r7-was-h"><h2 id="r7-was-h">✨ Neu bei ' + esc(F) + '</h2><ul></ul><div class="r7-reihe r7-zu"><button type="button" class="r7-btn" data-r7z>Gesehen, danke</button></div></section>');
      liste.forEach(function (f) {
        if (!N[f.id]) return;
        var li = el('<li><button type="button"><span aria-hidden="true">' + f.emo + '</span><span><b>' + esc(f.titel) + '</b><br><span class="r7-leise">' + esc(f.kurz) + '</span></span></button></li>');
        li.querySelector('button').onclick = function () { try { if (f.oeffnen) f.oeffnen(H); } catch (e) {} setTimeout(function () { var z = N[f.id]; z.scrollIntoView({ behavior: reduziert ? 'auto' : 'smooth', block: 'start' }); feier(z); var h = z.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }, 60); };
        w.querySelector('ul').appendChild(li);
      });
      w.querySelector('[data-r7z]').onclick = function () { leg('was-zu', true); w.remove(); };
      if (w.querySelector('li')) { try { C.neuOrt(w, H); } catch (e) {} }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); });
  else setTimeout(start, 0);
})();
