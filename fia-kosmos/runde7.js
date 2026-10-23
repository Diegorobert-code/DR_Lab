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
    k: 'fiakosmos', figur: 'Fia', bild: 'posen/winkt.jpg', kind: false, haptik: true,
    deko: '.himmel i,.himmel b,.actor .glow,.rad .fluss',
    ansichten: '.panel.an', ansichtKlasse: true,
    funktionen: [
      {
        id: 'organuhr', emo: '🕐', titel: 'Organuhr', kurz: 'Welcher Kreis ist gerade dran? Mit einer Spür-Frage für jetzt.',
        bau: function (H) {
          var O = [
            [23, 'Gallenblase', 'Holz', '🌳', 'Was darf heute zu Ende gehen?', 'Lege eine Hand an die rechte Seite unter die Rippen. Drei Atemzüge, die Seite wird weit.'],
            [1, 'Leber', 'Holz', '🌳', 'Was möchte wachsen, wenn du loslässt?', 'Im Liegen: Knie nach rechts und links sinken lassen, ganz langsam.'],
            [3, 'Lunge', 'Metall', '🌬️', 'Wie weit darf dein Atem heute werden?', 'Hände auf den oberen Brustkorb. Einatmen, die Hände heben sich ein wenig.'],
            [5, 'Dickdarm', 'Metall', '🌬️', 'Was darfst du heute weitergeben?', 'Mit der flachen Hand im Uhrzeigersinn sanft um den Bauchnabel kreisen.'],
            [7, 'Magen', 'Erde', '🌾', 'Was nährt dich heute wirklich?', 'Kiefer locker, Zunge liegt weich. Einmal gähnen, wenn es kommt.'],
            [9, 'Milz', 'Erde', '🌾', 'Wo findest du heute Boden?', 'Füsse fest auf den Boden. Gewicht von der Ferse zum Ballen wandern lassen.'],
            [11, 'Herz', 'Feuer', '🔥', 'Was freut dich gerade, auch wenn es klein ist?', 'Eine Hand aufs Brustbein. Spüre die Wärme deiner Hand.'],
            [13, 'Dünndarm', 'Feuer', '🔥', 'Was ist wichtig, was darf weg?', 'Schultern hoch zu den Ohren, halten, und mit einem Seufzer fallen lassen.'],
            [15, 'Blase', 'Wasser', '💧', 'Wo darfst du heute weich werden?', 'Im Stehen langsam nach vorn rollen, Kopf hängt, wieder hochrollen.'],
            [17, 'Niere', 'Wasser', '💧', 'Wo ist deine Kraftreserve?', 'Hände reiben, bis sie warm sind, und auf den unteren Rücken legen.'],
            [19, 'Perikard', 'Feuer', '🔥', 'Wen lässt du heute nah an dich heran?', 'Arme weit öffnen wie zum Umarmen, dann die Hände sanft vor dem Herz zusammen.'],
            [21, 'Dreifacher Erwärmer', 'Feuer', '🔥', 'Was braucht es, damit du warm in die Nacht gehst?', 'Mit den Händen von oben nach unten über Brust, Bauch und Becken streichen.']
          ];
          var h = H.jetzt.getHours(), idx = 0;
          O.forEach(function (o, i) { var a = o[0], b = (a + 2) % 24; if (a === 23 ? (h >= 23 || h < 1) : (h >= a && h < b)) idx = i; });
          var seg = O.map(function (o, i) {
            var a0 = (i * 30 - 90 - 15) * Math.PI / 180, a1 = (i * 30 - 90 + 15) * Math.PI / 180, R = 80, r = 48;
            var p = function (rr, a) { return (90 + rr * Math.cos(a)).toFixed(1) + ' ' + (90 + rr * Math.sin(a)).toFixed(1); };
            var farbe = { Holz: '#5fae6e', Feuer: '#e8735a', Erde: '#d9a441', Metall: '#c9d2ee', Wasser: '#5b8de0' }[o[2]];
            return '<path d="M' + p(r, a0) + ' L' + p(R, a0) + ' A' + R + ' ' + R + ' 0 0 1 ' + p(R, a1) + ' L' + p(r, a1) + ' A' + r + ' ' + r + ' 0 0 0 ' + p(r, a0) + 'Z" fill="' + farbe + '" opacity="' + (i === idx ? 1 : 0.28) + '" stroke="#0b1430" stroke-width="2"/>';
          }).join('');
          var o = O[idx], von = o[0], bis = (o[0] + 2) % 24;
          /* Tinkos Rad ohne Beschriftung: Stunden im Code drüberlegen (Mitte ca. 53.6 % / 43.6 %, Rand 36.7 %) */
          var marken = O.map(function (x, i) { var w = (i * 30 - 90) * Math.PI / 180; return '<span class="r7-h' + (i === idx ? ' an' : '') + '" style="left:' + (53.6 + 36.7 * Math.cos(w)).toFixed(1) + '%;top:' + (43.6 + 36.7 * Math.sin(w)).toFixed(1) + '%">' + x[0] + '</span>'; }).join('');
          var uhrbild = '<figure class="r7-uhrbild"><img alt="Fia steht vor einem grossen goldenen Rad, der Organuhr" loading="lazy" decoding="async" width="768" height="768" src="posen/organuhr.jpg"><span aria-hidden="true">' + marken + '</span><figcaption>Jetzt ' + ('0' + von).slice(-2) + '–' + ('0' + bis).slice(-2) + ' Uhr · ' + o[3] + ' ' + H.esc(o[1]) + '</figcaption></figure>';
          var n = H.karte('organuhr', '🕐 Organuhr',
            uhrbild + '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><svg viewBox="0 0 180 180" width="96" height="96" aria-hidden="true" style="flex:none">' + seg + '<text x="90" y="86" text-anchor="middle" fill="#ffe08a" font-size="22" font-weight="800">' + ('0' + von).slice(-2) + '–' + ('0' + bis).slice(-2) + '</text><text x="90" y="106" text-anchor="middle" fill="#c9d2ee" font-size="12">Uhr</text></svg>' +
            '<div style="flex:1;min-width:160px"><p class="r7-leise" style="margin:0">Gerade ist dran:</p><p class="r7-gross" style="margin:0">' + o[3] + ' ' + H.esc(o[1]) + '</p><p class="r7-leise" style="margin:0">Element ' + H.esc(o[2]) + '</p></div></div>' +
            '<p style="margin-top:16px"><b>Spür-Frage:</b> ' + H.esc(o[4]) + '</p><p><b>Für eine Minute:</b> ' + H.esc(o[5]) + '</p>' +
            '<p class="r7-leise">Die Organuhr stammt aus der chinesischen Tradition. Hier ist sie eine Einladung zum Spüren, keine Medizin und keine Diagnose.</p>' +
            (H.kannReden ? '<div class="r7-reihe"><button type="button" class="r7-btn" data-a="hoer">🎧 Vorlesen</button></div>' : ''));
          var hb = n.querySelector('[data-a=hoer]'); if (hb) hb.onclick = function () { H.sag('Gerade ist ' + o[1] + ' dran, Element ' + o[2] + '. ' + o[4] + ' ' + o[5]); };
          return n;
        }
      },
      {
        id: 'bluete', emo: '🌸', titel: 'Element-Blüte der Woche', kurz: 'Welche Elemente hast du diese Woche gespürt? Die Blüte füllt sich.',
        bau: function (H) {
          var E = [['Holz', '🌳', '#5fae6e'], ['Feuer', '🔥', '#e8735a'], ['Erde', '🌾', '#d9a441'], ['Metall', '🌬️', '#c9d2ee'], ['Wasser', '💧', '#5b8de0']];
          var mo = new Date(H.jetzt); mo.setHours(0, 0, 0, 0); mo.setDate(mo.getDate() - ((mo.getDay() + 6) % 7));
          var wk = mo.getFullYear() + '-' + (mo.getMonth() + 1) + '-' + mo.getDate();
          var d = H.hol('bluete', {}); if (d.w !== wk) d = { w: wk, e: {} };
          var n = H.karte('bluete', '🌸 Element-Blüte der Woche',
            '<p>Tipp auf ein Element, wenn du es heute gespürt oder geübt hast. Jedes Blatt leuchtet heller, je öfter. Am Montag beginnt eine neue Blüte. Ohne Druck, nur zum Hinschauen.</p>' +
            '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><svg viewBox="0 0 160 160" width="140" height="140" aria-hidden="true" style="flex:none" class="r7-bl"></svg>' +
            '<div class="r7-chips" role="group" aria-label="Element heute gespürt" style="flex:1;min-width:160px">' + E.map(function (e, i) { return '<button type="button" data-e="' + i + '">' + e[1] + ' ' + e[0] + '</button>'; }).join('') + '</div></div><p class="r7-leise r7-bst" aria-live="polite"></p>');
          function zeig() {
            var svg = '';
            E.forEach(function (e, i) {
              var c = d.e[i] || 0, op = c ? Math.min(1, 0.45 + c * 0.15) : 0.12;
              svg += '<ellipse cx="80" cy="44" rx="22" ry="38" fill="' + e[2] + '" opacity="' + op + '" transform="rotate(' + (i * 72) + ' 80 80)" stroke="rgba(255,255,255,.35)" stroke-width="' + (c ? 2 : 1) + '"/>';
            });
            svg += '<circle cx="80" cy="80" r="14" fill="#f2c14e"/>';
            n.querySelector('.r7-bl').innerHTML = svg;
            var anz = E.filter(function (_, i) { return d.e[i]; }).length;
            n.querySelector('.r7-bst').textContent = anz === 5 ? 'Alle fünf Elemente diese Woche. Deine Blüte ist ganz offen.' : anz ? anz + ' von 5 Elementen diese Woche gespürt.' : 'Die Blüte ist noch zu. Sie öffnet sich mit dir.';
            n.querySelectorAll('[data-e]').forEach(function (b) { var c = d.e[b.getAttribute('data-e')] || 0; b.setAttribute('aria-label', E[+b.getAttribute('data-e')][0] + ', diese Woche ' + c + ' Mal'); });
          }
          n.addEventListener('click', function (e) {
            var b = e.target.closest('[data-e]'); if (!b) return; var i = b.getAttribute('data-e');
            var vor = E.filter(function (_, j) { return d.e[j]; }).length;
            d.e[i] = (d.e[i] || 0) + 1; H.leg('bluete', d); zeig();
            var nach = E.filter(function (_, j) { return d.e[j]; }).length;
            H.feier(n, nach === 5 && vor < 5 ? 'Alle fünf Elemente! Deine Blüte ist offen.' : E[+i][1] + ' ' + E[+i][0] + ' gespürt.');
          });
          zeig(); return n;
        }
      },
      {
        id: 'pause', emo: '🪑', titel: 'Bewegte Pause', kurz: 'Zwei Minuten im Sitzen, und auf Wunsch eine sanfte Erinnerung.',
        bau: function (H) {
          var S = [['Ankommen', 'Füsse auf den Boden, Hände auf die Oberschenkel. Spüre, wo du den Stuhl berührst.'], ['Nacken', 'Kopf langsam nach rechts neigen, dann nach links. Die Schulter bleibt schwer.'], ['Schultern', 'Schultern dreimal nach hinten kreisen. Gross und langsam.'], ['Wirbelsäule', 'Hände auf die Knie. Einatmen: Brust nach vorn. Ausatmen: Rücken rund.'], ['Nachspüren', 'Augen zu oder Blick weich. Was ist jetzt anders als vor zwei Minuten?']];
          var n = H.karte('pause', '🪑 Bewegte Pause',
            '<img class="r7-bild" alt="Fia steht auf einem Stuhl und streckt die Flügel weit aus" loading="lazy" decoding="async" width="768" height="480" src="posen/streckt.jpg" style="object-position:50% 35%"><p>Langes Sitzen macht steif. Fia führt dich durch fünf kleine Schritte, zusammen etwa zwei Minuten.</p>' +
            '<div class="r7-reihe"><button type="button" class="r7-btn voll" data-a="los">▶︎ Pause starten</button></div>' +
            '<h3>Sanft erinnern</h3><p class="r7-leise">Solange Körperkosmos offen ist, tippt Fia dich an. Es wird nichts gesendet.</p>' +
            '<div class="r7-chips" role="group" aria-label="Erinnerung"><button type="button" data-m="0">Aus</button><button type="button" data-m="45">alle 45 Min.</button><button type="button" data-m="60">jede Stunde</button></div>');
          function lauf() {
            var i = -1, t = 0, aus = false;
            var v = H.voll('<img alt="" src="posen/streckt.jpg"><p class="r7-ti" style="color:var(--r7-gold2);font-weight:800"></p><p class="r7-tx" aria-live="polite"></p><small class="r7-sx"></small><button type="button" class="r7-btn">Beenden</button>', function () { aus = true; clearTimeout(t); H.still(); });
            v.el.querySelector('button').onclick = v.zu;
            (function weiter() {
              if (aus) return; i++;
              if (i >= S.length) { v.el.querySelector('.r7-ti').textContent = 'Schön.'; v.el.querySelector('.r7-tx').textContent = 'Du hast dir zwei Minuten geschenkt.'; v.el.querySelector('.r7-sx').textContent = ''; v.el.querySelector('button').textContent = 'Fertig'; H.ton(528, 1, 0.05); H.leg('pausen', H.hol('pausen', 0) + 1); return; }
              v.el.querySelector('.r7-ti').textContent = S[i][0]; v.el.querySelector('.r7-tx').textContent = S[i][1]; v.el.querySelector('.r7-sx').textContent = 'Schritt ' + (i + 1) + ' von ' + S.length;
              H.sag(S[i][1]); if (i) H.ton(440, 0.4, 0.04);
              t = setTimeout(weiter, 24000);
            })();
          }
          var iv = 0;
          function plan() {
            var m = H.hol('erinnern', 0); clearInterval(iv);
            n.querySelectorAll('[data-m]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-m') === m)); });
            if (m) iv = setInterval(function () { H.toast('Zeit für eine bewegte Pause? Fia wartet in «Heute».'); H.summ([10, 60, 10]); }, m * 60000);
          }
          n.addEventListener('click', function (e) {
            var b = e.target.closest('[data-a],[data-m]'); if (!b) return;
            if (b.hasAttribute('data-m')) { H.leg('erinnern', +b.getAttribute('data-m')); plan(); if (+b.getAttribute('data-m')) H.toast('Gut, Fia erinnert dich sanft.'); } else lauf();
          });
          plan(); return n;
        }
      }
    ],
    einsetzen: function (N) {
      var p = document.getElementById('p-heute'); if (!p) return;
      var nach = p.querySelector('.r6-char') || p.querySelector('.r6-besuch') || p.querySelector('#kTag');
      ['organuhr', 'bluete', 'pause'].forEach(function (k) { if (!N[k]) return; if (nach) { nach.after(N[k]); nach = N[k]; } else p.appendChild(N[k]); });
    },
    neuOrt: function (w) {
      var p = document.getElementById('p-heute'); if (!p) return;
      var g = p.querySelector('.r6-gruss') || p.querySelector('#jetzt'); if (g) g.after(w); else p.insertBefore(w, p.firstChild);
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
    /* Runde 7d: Tinko-Bilder in den Karten */
    '.r7-bild{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;object-position:50% 40%;border-radius:var(--r7-rad-s);margin:var(--r7-1) 0 var(--r7-2);border:1px solid rgba(242,193,78,.35);background:#0e1838}',
    '.r7-uhrbild{position:relative;width:min(100%,320px);margin:var(--r7-1) auto var(--r7-2);border-radius:var(--r7-rad);overflow:hidden;border:1px solid rgba(242,193,78,.4)}',
    '.r7-uhrbild img{display:block;width:100%;height:auto;aspect-ratio:1}',
    '.r7-uhrbild .r7-h{position:absolute;transform:translate(-50%,-50%);min-width:24px;padding:1px 5px;border-radius:999px;background:rgba(11,20,48,.72);color:#ffe9b0;font-size:11px;font-weight:800;line-height:16px;text-align:center;font-variant-numeric:tabular-nums}',
    '.r7-uhrbild .r7-h.an{background:var(--r7-gold);color:#14204a;font-size:13px;line-height:20px;padding:1px 8px;box-shadow:0 0 0 3px rgba(242,193,78,.35)}',
    '.r7-uhrbild figcaption{position:absolute;left:8px;right:8px;bottom:8px;padding:6px 10px;border-radius:12px;background:rgba(6,10,28,.78);color:#fff;font-weight:700;font-size:14px;text-align:center}',
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
