/* TradePing · Runde 7 (21.10.2026): Design, Verifizierung, drei neue Helfer. Keine Anlageberatung: nur Rechnen, Regeln, Ruhe.
   1. «Gefühls-Check vor dem Kauf»: Wie fühlen Sie sich? Mr. Ping nennt die passende Regel (Vorbild: Tilt-Meter in Edgewonk, Check-in in Headspace).
   2. «Was wäre, wenn …?»: Der eigene Topf bei −50 % bis +50 % – Pause-Regel und Verlustgrenzen sichtbar (Vorbild: Stresstest bei Portfolio Visualizer).
   3. «Wochenkarte»: Pings, Trades, Lehren der Woche als Karte zum Teilen (Vorbild: Wochenrückblick in Apple Fitness, Spotify Wrapped).
   Alles nur auf diesem Gerät. */
window.R7 = {
  kuerzel: 'tp', figur: 'Mr. Ping', bild: 'posen/winkt.jpg', bildFroh: 'posen/jubel.jpg',
  ort: '.ping-buehne', wo: 'nach',
  himmel: '.ping-buehne',
  neuTitel: 'Neu bei Mr. Ping', neuText: 'Drei Helfer für ruhige Entscheide. Spielgeld, kein Rat.',
  css: [
    '.r4-nav a{min-height:44px!important}',
    '.radar .rings,.radar .sweep{pointer-events:none}',
    '.tp-sicherung summary,.st-regeln summary{min-height:44px!important}',
    '#r4TZiel,.r4-ziel{min-height:44px!important}',
    '.r7-gefuehle{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin:0 0 16px}',
    '.r7-gefuehle button{display:flex;align-items:center;gap:8px;min-height:52px;padding:0 12px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);color:#f6efe4;font:inherit;font-size:.9375rem;cursor:pointer;text-align:left}',
    '.r7-gefuehle button[aria-pressed=true]{border-color:#f2c14e;background:rgba(242,193,78,.14)}',
    '.r7-gefuehle .e{font-size:22px}',
    '.r7-ant{display:flex;gap:12px;align-items:flex-start}',
    '.r7-ant img{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #f2c14e;flex:none}',
    '.r7-ant p{margin:0!important;color:#f6efe4!important;font-size:1rem!important}',
    '.r7-balken{display:flex;flex-direction:column;gap:6px}',
    '.r7-balken div{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:8px;font-size:.875rem}',
    '.r7-balken i{display:block;height:8px;border-radius:4px;background:#f2c14e}',
    '.r7-ww{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}',
    '.r7-ww .r7-karte{margin:0}',
    '.r7-ww .r7-karte.rot .r7-zahl{color:#ff9d8f}',
    '.r7-ww .r7-karte.gruen .r7-zahl{color:#86d39a}',
    '.r7-tz{display:flex;flex-direction:column;gap:6px;margin:8px 0 0;padding:0;list-style:none}',
    '.r7-tz li{display:flex;justify-content:space-between;gap:8px;font-size:.875rem;padding:8px 0;border-top:1px solid rgba(255,255,255,.08)}',
    '.r7-tz li b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}',
    '.r7-wk{border-radius:24px;padding:20px;background:radial-gradient(120% 90% at 85% 0%,rgba(242,193,78,.28),transparent 60%),linear-gradient(165deg,#22306a,#0e1838);border:1px solid rgba(242,193,78,.45);text-align:center}',
    '.r7-wk img{width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid #f2c14e}',
    '.r7-wk h3{margin:8px 0 4px!important;font-size:1.25rem!important}',
    '.r7-wk .r7-ww{text-align:left}',
    '.r7-wk q{display:block;margin-top:12px;font-style:italic;color:#ffe7a6;font-size:.9375rem}'
  ].join('\n'),
  start: function (R) {
    function hol(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
    function chf(n) { return 'CHF ' + (Math.round(n * 100) / 100).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function pz(n) { return (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n).toLocaleString('de-CH', { maximumFractionDigits: 1 }) + ' %'; }
    function wert(p) { return p.kauf && p.jetzt ? p.einsatz * p.jetzt / p.kauf : (p.einsatz || 0); }
    function geh(id) { R.zu(); var z = document.getElementById(id); if (z) setTimeout(function () { z.scrollIntoView({ behavior: R.ruhig() ? 'auto' : 'smooth', block: 'start' }); }, 340); }
    var G = {
      ruhig: ['😌', 'Ruhig', 'Gute Voraussetzung. Prüfen Sie trotzdem vorher: Verlustgrenze und Ziel festlegen, Gebühren rechnen.', 'mpRechner', 'Zu «Prüfen»'],
      fomo: ['🤩', 'Aufgeregt, alle kaufen', 'Wenn alle kaufen, ist der Zug oft schon abgefahren. Legen Sie die Idee auf den Merkzettel und schlafen Sie eine Nacht darüber.', 'r4Merk', 'Auf den Merkzettel'],
      aerger: ['😠', 'Will Verlust zurück', 'Verluste zurückholen wollen ist der teuerste Gedanke an der Börse. Heute keine neuen Titel. Das ist eine Regel, keine Strafe.', 'mpJournal', 'Ins Journal schreiben'],
      lang: ['🥱', 'Gelangweilt', 'Langeweile ist kein Kaufgrund. Lernen Sie lieber einen neuen Begriff, das bringt sicher etwas.', 'mpLexikon', 'Etwas lernen'],
      angst: ['😟', 'Unsicher, ängstlich', 'Angst ist ein Signal. In den Spieltopf gehört nur, was Sie verlieren dürfen. Heute nichts tun ist auch ein Entscheid.', 'topf', 'Topf anschauen']
    };
    // Zugänglichkeit: Dialog mit Namen, Ping-Tafel per Tastatur scrollbar
    function a11y() {
      [].forEach.call(document.querySelectorAll('.mp2-will'), function (x) { if (!x.getAttribute('aria-label')) { x.setAttribute('role', 'dialog'); x.setAttribute('aria-modal', 'true'); x.setAttribute('aria-label', 'Willkommen bei Mr. Ping'); } });
      var t = document.getElementById('mpTafelText'); if (t && !t.hasAttribute('tabindex')) t.setAttribute('tabindex', '0');
    }
    a11y(); new MutationObserver(a11y).observe(document.body, { childList: true });
    var S = {
      gefuehl: function () {
        var log = R.hol('gefuehle', []);
        var html = '<p>Bevor Sie kaufen: Wie fühlen Sie sich gerade? Ehrlich ist hier ganz privat, nichts verlässt das Handy.</p><div class="r7-gefuehle" role="group" aria-label="Gefühl wählen">' +
          Object.keys(G).map(function (k) { return '<button type="button" data-g="' + k + '" aria-pressed="false"><span class="e" aria-hidden="true">' + G[k][0] + '</span>' + G[k][1] + '</button>'; }).join('') +
          '</div><div id="r7GAnt" aria-live="polite"></div><h3>Ihre letzten 14 Tage</h3><div id="r7GLog"></div>';
        var inh = R.blatt({ titel: 'Gefühls-Check vor dem Kauf', html: html });
        function zeigLog() {
          var grenze = Date.now() - 14 * 864e5, z = {};
          log.filter(function (x) { return x.t > grenze; }).forEach(function (x) { z[x.g] = (z[x.g] || 0) + 1; });
          var max = Math.max.apply(null, Object.keys(z).map(function (k) { return z[k]; }).concat([1]));
          inh.querySelector('#r7GLog').innerHTML = Object.keys(z).length ? '<div class="r7-balken">' + Object.keys(G).filter(function (k) { return z[k]; }).map(function (k) {
            return '<div><span aria-hidden="true">' + G[k][0] + '</span><i style="width:' + Math.round(z[k] / max * 100) + '%" aria-hidden="true"></i><span>' + z[k] + '× ' + G[k][1] + '</span></div>';
          }).join('') + '</div>' : R.leer('Noch kein Check. Der erste zählt schon.');
        }
        zeigLog();
        inh.addEventListener('click', function (e) {
          var b = e.target.closest('[data-g]'), w = e.target.closest('[data-geh]');
          if (w) return geh(w.dataset.geh);
          if (!b) return;
          var g = G[b.dataset.g];
          [].forEach.call(inh.querySelectorAll('[data-g]'), function (x) { x.setAttribute('aria-pressed', x === b); });
          log.push({ t: Date.now(), g: b.dataset.g }); log = log.slice(-60); R.leg('gefuehle', log);
          inh.querySelector('#r7GAnt').innerHTML = '<div class="r7-karte"><div class="r7-ant"><img src="' + (b.dataset.g === 'ruhig' ? 'posen/denk.jpg' : 'posen/warn.jpg') + '" alt="" width="56" height="56"><p>' + R.esc(g[2]) + '</p></div><div class="r7-reihe"><button type="button" class="r7-knopf" data-geh="' + g[3] + '">' + R.esc(g[4]) + '</button></div></div>';
          zeigLog();
        });
      },
      wenn: function () {
        var topf = (hol('tp.topf', []) || []).filter(function (p) { return p && (p.einsatz || 0) > 0; });
        var beispiel = !topf.length;
        if (beispiel) topf = [{ name: 'Beispiel A', einsatz: 100, grenze: 15 }, { name: 'Beispiel B', einsatz: 100, grenze: 15 }];
        var ein = topf.reduce(function (a, p) { return a + (p.einsatz || 0); }, 0);
        var html = (beispiel ? R.leer('Noch kein Titel im Topf. Ich rechne mit einem Beispiel: 2 × CHF 100.', 'posen/denk.jpg') : '') +
          '<p>Schieben Sie den Regler: So sähe Ihr Topf aus, wenn sich alles gleich stark bewegt. Nur Rechnen, keine Vorhersage.</p>' +
          '<label for="r7W">Bewegung aller Titel: <b id="r7WP">0 %</b></label><input type="range" id="r7W" min="-50" max="50" step="5" value="0">' +
          '<div class="r7-ww" aria-live="polite"><div class="r7-karte"><span class="r7-klein">Topf danach</span><div class="r7-zahl" id="r7WT"></div></div><div class="r7-karte" id="r7WDk"><span class="r7-klein">Seit Einsatz</span><div class="r7-zahl" id="r7WD"></div></div></div>' +
          '<div class="r7-karte" id="r7WR"></div><ul class="r7-tz" id="r7WL"></ul>';
        var inh = R.blatt({ titel: 'Was wäre, wenn …?', html: html, bild: 'posen/denk.jpg' });
        var r = inh.querySelector('#r7W');
        function rechne() {
          var x = +r.value / 100, tot = 0, gerissen = 0;
          var zeilen = topf.map(function (p) {
            var v = wert(p) * (1 + x); tot += v;
            var seit = p.einsatz ? (v / p.einsatz - 1) * 100 : 0;
            var riss = seit <= -(p.grenze || 15); if (riss) gerissen++;
            return '<li><b>' + R.esc(p.name || p.symbol || 'Titel') + '</b><span>' + chf(v) + ' · ' + pz(seit) + (riss ? ' · Grenze erreicht' : '') + '</span></li>';
          });
          var d = ein ? (tot / ein - 1) * 100 : 0;
          inh.querySelector('#r7WP').textContent = pz(+r.value);
          inh.querySelector('#r7WT').textContent = chf(tot);
          inh.querySelector('#r7WD').textContent = pz(d);
          inh.querySelector('#r7WDk').className = 'r7-karte ' + (d < 0 ? 'rot' : d > 0 ? 'gruen' : '');
          var regeln = [];
          if (d <= -25) regeln.push('⏸️ Regel 4: Ab −25 % im Topf macht Mr. Ping Pause. Keine neuen Titel, erst durchatmen.');
          if (gerissen) regeln.push('🔔 ' + gerissen + (gerissen === 1 ? ' Titel erreicht' : ' Titel erreichen') + ' die eigene Verlustgrenze. Die Grenze nie nach unten schieben.');
          if (d >= 30) regeln.push('✨ Regel 5: Ab +30 % die Hälfte markieren. Gewinn ist erst Gewinn, wenn er gesichert ist.');
          if (!regeln.length) regeln.push('😌 Keine Regel greift. Ruhig bleiben ist auch eine Strategie.');
          inh.querySelector('#r7WR').innerHTML = regeln.map(function (t) { return '<p style="margin:0 0 6px">' + R.esc(t) + '</p>'; }).join('');
          inh.querySelector('#r7WL').innerHTML = zeilen.join('');
        }
        r.addEventListener('input', rechne); rechne();
      },
      woche: function () {
        var grenze = Date.now() - 7 * 864e5;
        var tag7 = new Date(grenze).toISOString().slice(0, 10);
        var log = (hol('tp.log', []) || []).filter(function (e) { return e && e.t > grenze && !e.demo; });
        var jr = (hol('tp.journal', []) || []).filter(function (t) { return t && (t.datum || '') >= tag7; });
        var zu = jr.filter(function (t) { return t.verkauf != null && t.kauf; });
        var plus = zu.filter(function (t) { return t.verkauf > t.kauf; }).length;
        var merk = (hol('tp.merkzettel', []) || []).length;
        var gef = R.hol('gefuehle', []).filter(function (x) { return x.t > grenze; }).length;
        var lehre = (zu.filter(function (t) { return t.lehre; }).pop() || {}).lehre || 'Erst die Grenze, dann der Kauf.';
        var von = new Date(grenze).toLocaleDateString('de-CH', { day: 'numeric', month: 'short' }), bis = new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'short' });
        var leerWoche = !log.length && !jr.length && !merk && !gef;
        var html = '<div class="r7-wk" id="r7Wk"><img src="posen/jubel.jpg" alt="" width="88" height="88"><h3>Meine Woche mit Mr. Ping</h3><span class="r7-klein">' + von + ' – ' + bis + '</span>' +
          '<div class="r7-ww"><div class="r7-karte"><span class="r7-klein">Pings</span><div class="r7-zahl">' + log.length + '</div></div><div class="r7-karte"><span class="r7-klein">Trades notiert</span><div class="r7-zahl">' + jr.length + '</div></div>' +
          '<div class="r7-karte"><span class="r7-klein">Geschlossen, davon im Plus</span><div class="r7-zahl">' + zu.length + ' / ' + plus + '</div></div><div class="r7-karte"><span class="r7-klein">Gefühls-Checks</span><div class="r7-zahl">' + gef + '</div></div></div>' +
          '<q>' + R.esc(lehre) + '</q></div>' +
          (leerWoche ? R.leer('Eine ruhige Woche. Auch das ist ein gutes Ergebnis.', 'posen/schlaf.jpg') : '') +
          '<div class="r7-reihe"><button type="button" class="r7-knopf leise" data-a="text">📋 Als Text kopieren</button><button type="button" class="r7-knopf" data-a="bild">🖼️ Als Bild</button></div><div id="r7WkBild"></div><p class="r7-klein">Keine Beträge auf der Karte, nur Zahlen der Woche. Spielgeld, kein Rat.</p>';
        var inh = R.blatt({ titel: 'Wochenkarte', html: html, bild: 'posen/jubel.jpg' });
        var text = 'Meine Woche mit Mr. Ping (' + von + ' – ' + bis + ')\nPings: ' + log.length + '\nTrades notiert: ' + jr.length + '\nGeschlossen: ' + zu.length + ', davon im Plus: ' + plus + '\nGefühls-Checks: ' + gef + '\nLehre: ' + lehre;
        inh.addEventListener('click', function (e) {
          var a = e.target.closest('[data-a]'); if (!a) return;
          if (a.dataset.a === 'text') {
            (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { R.feier('Kopiert. Bereit zum Einfügen.'); }, function () { a.textContent = 'Kopieren geht hier nicht'; });
          } else {
            var c = document.createElement('canvas'); c.width = 1080; c.height = 1350; var g = c.getContext('2d');
            var gr = g.createLinearGradient(0, 0, 0, 1350); gr.addColorStop(0, '#22306a'); gr.addColorStop(1, '#0e1838'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1350);
            g.fillStyle = '#f2c14e'; g.textAlign = 'center'; g.font = '800 64px sans-serif'; g.fillText('Meine Woche mit Mr. Ping', 540, 470);
            g.fillStyle = '#cfd6ee'; g.font = '400 40px sans-serif'; g.fillText(von + ' – ' + bis, 540, 530);
            [['Pings', log.length], ['Trades notiert', jr.length], ['Geschlossen / Plus', zu.length + ' / ' + plus], ['Gefühls-Checks', gef]].forEach(function (z, n) {
              var x = n % 2 ? 790 : 290, y = 680 + Math.floor(n / 2) * 220;
              g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x - 220, y - 110, 440, 190);
              g.fillStyle = '#cfd6ee'; g.font = '400 36px sans-serif'; g.fillText(z[0], x, y - 50);
              g.fillStyle = '#f2c14e'; g.font = '800 84px sans-serif'; g.fillText(String(z[1]), x, y + 50);
            });
            g.fillStyle = '#ffe7a6'; g.font = 'italic 40px serif'; g.fillText('«' + lehre.slice(0, 44) + '»', 540, 1190);
            g.fillStyle = '#cfd6ee'; g.font = '400 30px sans-serif'; g.fillText('TradePing · Spielgeld, kein Rat', 540, 1280);
            var im = new Image(); im.onload = function () {
              g.save(); g.beginPath(); g.arc(540, 250, 150, 0, Math.PI * 2); g.clip(); g.drawImage(im, 390, 100, 300, 300); g.restore();
              g.strokeStyle = '#f2c14e'; g.lineWidth = 8; g.beginPath(); g.arc(540, 250, 150, 0, Math.PI * 2); g.stroke();
              zeige();
            };
            im.onerror = zeige; im.src = 'posen/jubel.jpg';
            function zeige() {
              var o = inh.querySelector('#r7WkBild'); var u; try { u = c.toDataURL('image/jpeg', 0.9); } catch (x) { return; }
              o.innerHTML = '<p class="r7-klein">Bild lange drücken, dann sichern oder teilen.</p><img alt="Wochenkarte als Bild" style="width:100%;border-radius:16px" src="' + u + '">';
            }
          }
        });
      }
    };
    window.R7.neu.forEach(function (n) { n.auf = S[n.id]; });
  },
  neu: [
    { id: 'gefuehl', e: '💭', titel: 'Gefühls-Check', text: 'Vor dem Kauf kurz ehrlich sein' },
    { id: 'wenn', e: '🎚️', titel: 'Was wäre, wenn …?', text: 'Topf bei −50 % bis +50 %' },
    { id: 'woche', e: '🗓️', titel: 'Wochenkarte', text: 'Ihre Woche als Karte' }
  ]
};

/* ---- Runde 7: gemeinsamer Kern (Design, Tageszeit-Himmel, Haptik, Blatt, Feier, Neu-Leiste) ----
   Einheitlich über alle DR-Lab-Apps: 8er-Raster, Typo-Skala, Karten, Knöpfe, Gold-Fokus.
   Alles nur auf diesem Gerät, keine Dienste, keine Kosten. Testen: ?r7zeit=22 (Stunde). */
(function () {
  'use strict';
  var K = window.R7;
  if (!K || window.R7K) return;
  var d = document, H = d.documentElement;
  var LS = 'r7_' + K.kuerzel + '_';
  function hol(k, def) { try { var v = localStorage.getItem(LS + k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } }
  function leg(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) {} }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function param(n) { var m = location.search.match(new RegExp('[?&]' + n + '=([^&]+)')); return m ? decodeURIComponent(m[1]) : null; }
  var mm = window.matchMedia ? function (q) { return matchMedia(q).matches; } : function () { return false; };
  function ruhig() { return mm('(prefers-reduced-motion: reduce)') || H.classList.contains('r7-ruhig'); }
  function stunde() { var p = param('r7zeit'); return p != null ? +p : new Date().getHours(); }
  function phase() { var h = stunde(); return h < 6 || h >= 21 ? 'nacht' : h < 10 ? 'morgen' : h < 17 ? 'tag' : 'abend'; }
  function heute() { var t = new Date(); return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }

  /* ---------- 1. Design-Grundlage ---------- */
  var gold = K.gold || '#f2c14e';
  var css = [
    ':root{--r7-1:8px;--r7-2:16px;--r7-3:24px;--r7-4:32px;--r7-6:48px;--r7-gold:' + gold + ';--r7-gold-d:#c99a3e;--r7-nacht:#0e1838;--r7-nacht2:#17255a;--r7-nacht3:#22306a;--r7-ink:#f6efe4;--r7-ink2:#cfd6ee;--r7-rund:20px;--r7-rund-s:12px;',
    '--r7-schatten:0 1px 2px rgba(0,0,0,.18),0 12px 32px -12px rgba(0,0,0,.5);--r7-t1:1.75rem;--r7-t2:1.25rem;--r7-t3:1.0625rem;--r7-t4:.9375rem;--r7-t5:.8125rem;--r7-ease:cubic-bezier(.22,.8,.26,1)}',
    // Fokus: goldener Ring, nur bei Tastatur
    ':focus{outline:none}:focus-visible{outline:3px solid var(--r7-gold)!important;outline-offset:3px!important}',
    'a,button,[role=button],summary,label{-webkit-tap-highlight-color:rgba(242,193,78,.18)}',
    'button,[role=button]{touch-action:manipulation}',
    // Weicher Ansichtswechsel
    '.r7-ein{animation:r7Ein .38s var(--r7-ease) both}',
    '@keyframes r7Ein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    // Tageszeit-Himmel
    '.r7-himmel-wirt{position:relative;isolation:isolate}',
    '.r7-himmel{position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden;border-radius:inherit}',
    '.r7-himmel i{position:absolute;display:block;border-radius:50%;background:#fff}',
    '.r7-himmel .r7-licht{position:absolute;width:70%;aspect-ratio:1;border-radius:50%;filter:blur(8px)}',
    '.r7-himmel .r7-schnuppe{position:absolute;top:14%;left:-20%;width:90px;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,#fff);opacity:0;transform:rotate(-18deg)}',
    '.r7-himmel .r7-schnuppe.los{animation:r7Schnuppe 1.6s ease-out 1.2s 1 both}',
    '@keyframes r7Schnuppe{0%{opacity:0;transform:translate(0,0) rotate(-18deg)}15%{opacity:.9}100%{opacity:0;transform:translate(420px,-130px) rotate(-18deg)}}',
    // Blatt (Dialog)
    '.r7-schleier{position:fixed;inset:0;z-index:100050;background:rgba(5,9,26,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;transition:opacity .25s}',
    '.r7-schleier.auf{opacity:1}',
    '.r7-blatt{position:fixed;left:0;right:0;bottom:0;z-index:100051;max-height:88vh;max-height:88dvh;overflow:auto;overscroll-behavior:contain;background:linear-gradient(180deg,var(--r7-nacht2),var(--r7-nacht));color:var(--r7-ink);',
    'border-radius:24px 24px 0 0;box-shadow:0 -12px 40px rgba(0,0,0,.45);border-top:1px solid rgba(242,193,78,.35);padding:var(--r7-2) var(--r7-2) calc(var(--r7-3) + env(safe-area-inset-bottom,0px));transform:translateY(102%);transition:transform .32s var(--r7-ease);font-family:inherit;line-height:1.5;text-align:left}',
    '.r7-blatt.auf{transform:none}',
    '@media (min-width:640px){.r7-blatt{left:50%;right:auto;width:560px;margin-left:-280px;bottom:var(--r7-3);border-radius:24px;border:1px solid rgba(242,193,78,.35)}}',
    '.r7-griff{display:block;width:40px;height:5px;border-radius:3px;background:rgba(255,255,255,.25);margin:0 auto var(--r7-2)}',
    '.r7-kopf{display:flex;align-items:center;gap:12px;margin-bottom:var(--r7-2)}',
    '.r7-kopf img{width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--r7-gold);flex:none}',
    '.r7-kopf h2{flex:1;min-width:0;margin:0;font-size:var(--r7-t2);line-height:1.25;color:var(--r7-ink);font-weight:700}',
    '.r7-zu{flex:none;min-width:44px;min-height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:var(--r7-ink);font-size:20px;line-height:1;cursor:pointer}',
    '.r7-blatt p{margin:0 0 var(--r7-2);color:var(--r7-ink2);font-size:var(--r7-t4)}',
    '.r7-blatt h3{margin:var(--r7-3) 0 var(--r7-1);font-size:var(--r7-t3);color:var(--r7-ink)}',
    '.r7-blatt label{display:block;margin:var(--r7-2) 0 var(--r7-1);font-size:var(--r7-t5);font-weight:700;color:var(--r7-ink2);letter-spacing:.02em}',
    '.r7-blatt input:not([type=checkbox]):not([type=radio]):not([type=range]),.r7-blatt select,.r7-blatt textarea{box-sizing:border-box;width:100%;min-height:48px;padding:10px 14px;border-radius:var(--r7-rund-s);border:1px solid rgba(255,255,255,.22);background:rgba(4,8,24,.55);color:var(--r7-ink);font:inherit;font-size:16px}',
    '.r7-blatt input[type=range]{width:100%;min-height:44px;accent-color:var(--r7-gold)}',
    '.r7-knopf{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 var(--r7-3);border-radius:999px;border:0;background:var(--r7-gold);color:#1a1f3a;font:inherit;font-weight:800;font-size:var(--r7-t4);cursor:pointer;text-decoration:none;box-shadow:0 6px 18px -8px rgba(242,193,78,.8);transition:transform .12s var(--r7-ease),filter .12s}',
    '.r7-knopf:active{transform:scale(.97);filter:brightness(.95)}',
    '.r7-knopf.leise{background:rgba(255,255,255,.08);color:var(--r7-ink);border:1px solid rgba(255,255,255,.22);box-shadow:none}',
    '.r7-knopf.voll{display:flex;width:100%}',
    '.r7-reihe{display:flex;flex-wrap:wrap;gap:var(--r7-1);margin:var(--r7-2) 0}',
    '.r7-reihe>*{flex:1 1 140px}',
    '.r7-karte{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:var(--r7-2);margin:0 0 var(--r7-1)}',
    '.r7-zahl{font-size:var(--r7-t1);font-weight:800;color:var(--r7-gold);font-variant-numeric:tabular-nums;line-height:1.1}',
    '.r7-klein{font-size:var(--r7-t5);color:var(--r7-ink2)}',
    '.r7-leer{display:flex;flex-direction:column;align-items:center;text-align:center;gap:var(--r7-1);padding:var(--r7-3) var(--r7-2);color:var(--r7-ink2)}',
    '.r7-leer img{width:88px;height:88px;border-radius:50%;object-fit:cover;border:2px solid rgba(242,193,78,.6);box-shadow:0 0 0 6px rgba(242,193,78,.08)}',
    // Neu-Leiste
    '.r7-neu{margin:var(--r7-3) 0;padding:var(--r7-2);border-radius:var(--r7-rund);background:linear-gradient(160deg,#17255a,#0e1838);border:1px solid rgba(242,193,78,.35);box-shadow:var(--r7-schatten);color:var(--r7-ink);text-align:left}',
    '.r7-neu-kopf{display:flex;align-items:center;gap:12px;margin-bottom:var(--r7-2)}',
    '.r7-neu-kopf img{width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--r7-gold);flex:none}',
    '.r7-neu-kopf h2{margin:0;font-size:var(--r7-t3);line-height:1.3;color:var(--r7-ink);font-weight:800}',
    '.r7-neu-kopf small{display:block;color:var(--r7-ink2);font-size:var(--r7-t5);font-weight:500}',
    '.r7-neu-gitter{display:grid;grid-template-columns:1fr 1fr;gap:var(--r7-1)}',
    '.r7-neu-k{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-height:96px;padding:12px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:var(--r7-ink);font:inherit;text-align:left;cursor:pointer;transition:transform .14s var(--r7-ease),border-color .2s,background .2s}',
    '.r7-neu-k:hover{border-color:rgba(242,193,78,.6);background:rgba(242,193,78,.08)}',
    '.r7-neu-k:active{transform:scale(.97)}',
    '.r7-neu-k .e{font-size:24px;line-height:1}',
    '.r7-neu-k b{font-size:var(--r7-t4);line-height:1.25;overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto}',
    '.r7-neu-k small{font-size:var(--r7-t5);color:var(--r7-ink2);line-height:1.35;overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto}',
    '@media (max-width:359px){.r7-neu-gitter{grid-template-columns:1fr}.r7-neu-k{min-height:72px}}',
    '.r7-neu-k .r7-punkt{position:absolute;top:10px;right:10px;width:9px;height:9px;border-radius:50%;background:var(--r7-gold);box-shadow:0 0 0 3px rgba(242,193,78,.25)}',
    '.r7-neu-fuss{display:flex;flex-wrap:wrap;gap:var(--r7-1);margin-top:var(--r7-2)}',
    '.r7-schalter{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:transparent;color:var(--r7-ink2);font:inherit;font-size:var(--r7-t5);cursor:pointer}',
    '.r7-schalter[aria-pressed=true]{border-color:var(--r7-gold);color:var(--r7-gold)}',
    // Feier
    '.r7-feier{position:fixed;left:0;right:0;margin:0 auto;width:max-content;bottom:calc(96px + env(safe-area-inset-bottom,0px));z-index:100060;display:flex;align-items:center;gap:12px;max-width:min(92vw,420px);padding:10px 18px 10px 10px;border-radius:999px;background:#17255a;color:var(--r7-ink);border:1px solid rgba(242,193,78,.55);box-shadow:var(--r7-schatten);transform:translateY(20px);opacity:0;transition:transform .3s var(--r7-ease),opacity .3s;pointer-events:none;font-size:var(--r7-t4);line-height:1.35}',
    '.r7-feier.auf{transform:none;opacity:1}',
    '.r7-feier img{width:40px;height:40px;border-radius:50%;object-fit:cover;flex:none;border:2px solid var(--r7-gold)}',
    '.r7-funke{position:fixed;z-index:100061;width:8px;height:8px;border-radius:50%;background:var(--r7-gold);pointer-events:none;animation:r7Funke .9s ease-out forwards}',
    '@keyframes r7Funke{from{opacity:1;transform:translate(0,0) scale(1)}to{opacity:0;transform:translate(var(--x),var(--y)) scale(.3)}}',
    'html.r7-ruhig *,html.r7-ruhig *::before,html.r7-ruhig *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}',
    '@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}',
    'html.r7-blatt-offen .nova-btn,html.r7-blatt-offen .nova-pille,html.r7-blatt-offen .nova-panel,html.r7-blatt-offen #fbBtn,html.r7-blatt-offen .fb-btn,html.r7-blatt-offen .puppe-fest{visibility:hidden!important}',
    '.r7-nur-sr{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important}',
    '.r6-ein:not([disabled]){color:#1a1f3a!important;opacity:1!important}',
    '.r6-ein[disabled]{background:transparent!important;border:1px solid rgba(242,193,78,.6)!important;color:#f6efe4!important}',
    '.r6-nf input{flex:1 1 140px!important;min-width:120px!important}',
    '.sp-kopf button{min-width:44px!important;min-height:44px!important}',
    '.r7-blatt input[type=range]{margin:0}',
    K.css || ''
  ].join('\n');
  var st = d.createElement('style'); st.id = 'r7-stil'; st.textContent = css; d.head.appendChild(st);
  if (hol('ruhig', false)) H.classList.add('r7-ruhig');

  /* ---------- 2. Haptik (kurz, abschaltbar) ---------- */
  function summ(ms) {
    if (K.haptik === false || hol('haptik', true) === false || ruhig()) return;
    try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {}
  }
  d.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('button, [role=button], a[href], summary');
    if (!t || (K.keineHaptik && t.closest(K.keineHaptik))) return;
    summ(t.classList.contains('r7-knopf') ? 12 : 6);
  }, true);

  /* ---------- 3. Tageszeit-Himmel mit leichtem Parallax ---------- */
  function himmel() {
    var ziele = K.himmel ? d.querySelectorAll(K.himmel) : [];
    var ph = phase();
    [].forEach.call(ziele, function (w, n) {
      if (w.querySelector(':scope > .r7-himmel')) return;
      var h = d.createElement('div'); h.className = 'r7-himmel'; h.setAttribute('aria-hidden', 'true'); h.dataset.phase = ph;
      var html = '';
      if (ph === 'nacht') {
        // ruhige Sterne (fest, kein Dauerflackern), einmal pro Besuch eine Sternschnuppe
        var s = 7 + n * 13;
        for (var i = 0; i < 26; i++) {
          s = (s * 9301 + 49297) % 233280; var x = s / 233280 * 100;
          s = (s * 9301 + 49297) % 233280; var y = s / 233280 * 70;
          s = (s * 9301 + 49297) % 233280; var g = 1 + Math.round(s / 233280 * 2);
          html += '<i style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%;width:' + g + 'px;height:' + g + 'px;opacity:' + (0.35 + (i % 5) / 10).toFixed(2) + '"></i>';
        }
        html += '<span class="r7-schnuppe"></span>';
      } else if (ph === 'morgen') {
        html = '<span class="r7-licht" style="left:-25%;top:-35%;background:radial-gradient(circle,rgba(255,196,140,.32),transparent 65%)"></span>';
      } else if (ph === 'tag') {
        html = '<span class="r7-licht" style="right:-30%;top:-40%;background:radial-gradient(circle,rgba(255,236,170,.26),transparent 65%)"></span>';
      } else {
        html = '<span class="r7-licht" style="left:15%;top:-45%;background:radial-gradient(circle,rgba(255,140,120,.26),rgba(160,110,220,.12) 45%,transparent 70%)"></span>';
      }
      h.innerHTML = html;
      w.classList.add('r7-himmel-wirt'); w.insertBefore(h, w.firstChild);
      if (ph === 'nacht' && !ruhig() && !sessionStorage.getItem(LS + 'schnuppe')) {
        try { sessionStorage.setItem(LS + 'schnuppe', '1'); } catch (e) {}
        var sp = h.querySelector('.r7-schnuppe'); if (sp) sp.classList.add('los');
      }
    });
    if (!ruhig() && ziele.length) {
      var laeuft = false;
      addEventListener('scroll', function () {
        if (laeuft) return; laeuft = true;
        requestAnimationFrame(function () {
          laeuft = false;
          var y = Math.min(scrollY, 900) * 0.12;
          [].forEach.call(d.querySelectorAll('.r7-himmel'), function (h) { h.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)'; });
        });
      }, { passive: true });
    }
  }

  /* ---------- 4. Weiche Ansichtswechsel ---------- */
  function uebergaenge() {
    if (!K.ansichten || !window.MutationObserver) return;
    var mo = new MutationObserver(function (l) {
      l.forEach(function (m) {
        var el = m.target;
        var sichtbarJetzt = !el.hidden && !el.classList.contains('hide') && !el.classList.contains('hidden');
        var warVersteckt = m.attributeName === 'hidden' ? m.oldValue !== null : /\b(hide|hidden)\b/.test(m.oldValue || '');
        if (sichtbarJetzt && warVersteckt && !ruhig()) {
          el.classList.remove('r7-ein'); void el.offsetWidth; el.classList.add('r7-ein');
          setTimeout(function () { el.classList.remove('r7-ein'); }, 450);
        }
      });
    });
    [].forEach.call(d.querySelectorAll(K.ansichten), function (el) { mo.observe(el, { attributes: true, attributeFilter: ['class', 'hidden'], attributeOldValue: true }); });
  }

  /* ---------- 5. Blatt (zugänglicher Dialog) ---------- */
  var offen = null;
  function blatt(o) {
    zu(true);
    var vorher = d.activeElement;
    var sch = d.createElement('div'); sch.className = 'r7-schleier';
    var b = d.createElement('div'); b.className = 'r7-blatt'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-modal', 'true');
    var id = 'r7t' + Date.now(); b.setAttribute('aria-labelledby', id);
    b.innerHTML = '<span class="r7-griff" aria-hidden="true"></span><div class="r7-kopf">' + (o.bild === false ? '' : '<img src="' + esc(o.bild || K.bild) + '" alt="" width="48" height="48">') +
      '<h2 id="' + id + '">' + esc(o.titel) + '</h2><button type="button" class="r7-zu" aria-label="Schliessen">✕</button></div><div class="r7-inhalt"></div>';
    var inh = b.querySelector('.r7-inhalt');
    if (typeof o.html === 'string') inh.innerHTML = o.html; else if (o.html) inh.appendChild(o.html);
    d.body.appendChild(sch); d.body.appendChild(b);
    var altOverflow = d.body.style.overflow; d.body.style.overflow = 'hidden'; H.classList.add('r7-blatt-offen');
    requestAnimationFrame(function () { sch.classList.add('auf'); b.classList.add('auf'); });
    function fokusierbar() { return [].filter.call(b.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'), function (x) { return !x.disabled && x.offsetParent !== null; }); }
    function taste(e) {
      if (e.key === 'Escape') { e.preventDefault(); zu(); }
      else if (e.key === 'Tab') {
        var f = fokusierbar(); if (!f.length) return;
        if (!b.contains(d.activeElement)) { e.preventDefault(); f[0].focus(); return; }
        if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    d.addEventListener('keydown', taste, true);
    sch.addEventListener('click', function () { zu(); });
    b.querySelector('.r7-zu').addEventListener('click', function () { zu(); });
    offen = { b: b, sch: sch, vorher: vorher, ov: altOverflow, nachher: o.zu, taste: taste };
    setTimeout(function () { var z = b.querySelector('.r7-zu'); try { z.focus({ preventScroll: true }); } catch (e) { z.focus(); } }, 60);
    if (o.auf) try { o.auf(inh, b); } catch (e) { console.warn(e); }
    return inh;
  }
  function zu(sofort) {
    if (!offen) return;
    var o = offen; offen = null; d.removeEventListener('keydown', o.taste, true);
    d.body.style.overflow = o.ov || ''; H.classList.remove('r7-blatt-offen');
    o.b.classList.remove('auf'); o.sch.classList.remove('auf');
    var weg = function () { o.b.remove(); o.sch.remove(); };
    if (sofort || ruhig()) weg(); else setTimeout(weg, 320);
    if (o.vorher && o.vorher.focus) try { o.vorher.focus({ preventScroll: true }); } catch (e) {}
    if (o.nachher) try { o.nachher(); } catch (e) {}
  }

  /* ---------- 6. Sanfte Feier ---------- */
  var feierT;
  function feier(text, funken) {
    var f = d.querySelector('.r7-feier');
    if (!f) { f = d.createElement('div'); f.className = 'r7-feier'; f.setAttribute('role', 'status'); f.setAttribute('aria-live', 'polite'); d.body.appendChild(f); }
    f.innerHTML = '<img src="' + esc(K.bildFroh || K.bild) + '" alt=""><span>' + esc(text) + '</span>';
    requestAnimationFrame(function () { f.classList.add('auf'); });
    clearTimeout(feierT); feierT = setTimeout(function () { f.classList.remove('auf'); }, 2800);
    summ([10, 40, 10]);
    if (funken !== false && !ruhig()) {
      var r = f.getBoundingClientRect(), cx = r.left + 30, cy = r.top + 20;
      for (var i = 0; i < 8; i++) {
        var p = d.createElement('i'); p.className = 'r7-funke';
        var w = Math.PI * 2 * i / 8;
        p.style.left = cx + 'px'; p.style.top = cy + 'px';
        p.style.setProperty('--x', Math.round(Math.cos(w) * 46) + 'px'); p.style.setProperty('--y', Math.round(Math.sin(w) * 46 - 20) + 'px');
        d.body.appendChild(p); setTimeout(function (x) { return function () { x.remove(); }; }(p), 950);
      }
    }
  }
  function leer(text, bild) { return '<div class="r7-leer"><img src="' + esc(bild || K.bild) + '" alt="" width="88" height="88" loading="lazy"><span>' + esc(text) + '</span></div>'; }

  /* ---------- 7. Neu-Leiste ---------- */
  function neuLeiste() {
    if (!K.neu || !K.neu.length || !K.ort) return;
    var ort = d.querySelector(K.ort); if (!ort) return;
    var gesehen = hol('gesehen', {});
    var s = d.createElement('section'); s.className = 'r7-neu'; s.id = 'r7Neu'; s.setAttribute('aria-labelledby', 'r7NeuH');
    s.innerHTML = '<div class="r7-neu-kopf"><img src="' + esc(K.bild) + '" alt="" width="44" height="44" loading="lazy"><div><h2 id="r7NeuH">' + esc(K.neuTitel || 'Neu für dich') + '</h2><small>' + esc(K.neuText || 'Antippen und ausprobieren.') + '</small></div></div>' +
      '<div class="r7-neu-gitter">' + K.neu.map(function (f) {
        return '<button type="button" class="r7-neu-k" data-r7f="' + esc(f.id) + '">' + (gesehen[f.id] ? '' : '<span class="r7-punkt" aria-hidden="true"></span>') +
          '<span class="e" aria-hidden="true">' + f.e + '</span><b>' + esc(f.titel) + '</b><small>' + esc(f.text) + '</small>' + (gesehen[f.id] ? '' : '<span class="r7-nur-sr">, neu</span>') + '</button>';
      }).join('') + '</div>' +
      '<div class="r7-neu-fuss">' + (K.haptik === false ? '' : '<button type="button" class="r7-schalter" id="r7Haptik" aria-pressed="' + (hol('haptik', true) !== false) + '">📳 Sanftes Vibrieren</button>') +
      '<button type="button" class="r7-schalter" id="r7Ruhig" aria-pressed="' + !!hol('ruhig', false) + '">🌙 Weniger Bewegung</button></div>';
    if (K.wo === 'vor') ort.parentNode.insertBefore(s, ort); else if (K.wo === 'in') ort.appendChild(s); else ort.parentNode.insertBefore(s, ort.nextSibling);
    s.addEventListener('click', function (e) {
      var k = e.target.closest('[data-r7f]'); if (!k) return;
      var f = K.neu.filter(function (x) { return x.id === k.dataset.r7f; })[0]; if (!f) return;
      gesehen[f.id] = 1; leg('gesehen', gesehen);
      var p = k.querySelector('.r7-punkt'); if (p) p.remove(); var sr = k.querySelector('.r7-nur-sr'); if (sr) sr.remove();
      f.auf();
    });
    var hb = s.querySelector('#r7Haptik');
    if (hb) hb.addEventListener('click', function () { var an = hol('haptik', true) === false; leg('haptik', an); hb.setAttribute('aria-pressed', an); if (an) summ(14); });
    var rb = s.querySelector('#r7Ruhig');
    rb.addEventListener('click', function () { var an = !hol('ruhig', false); leg('ruhig', an); rb.setAttribute('aria-pressed', an); H.classList.toggle('r7-ruhig', an); });
  }

  d.addEventListener('submit', function (e) {
    var f = e.target; if (!f || f.id !== 'r6Name') return;
    var i = f.querySelector('input'); if (!i || i.value.trim()) return;
    i.setAttribute('aria-invalid', 'true'); i.placeholder = 'Bitte einen Vornamen eintragen'; try { i.focus(); } catch (x) {}
  }, true);
  window.R7K = { hol: hol, leg: leg, esc: esc, blatt: blatt, zu: zu, feier: feier, leer: leer, summ: summ, phase: phase, stunde: stunde, heute: heute, param: param, ruhig: ruhig };
  function start() {
    try { himmel(); } catch (e) { console.warn('r7 himmel', e); }
    try { uebergaenge(); } catch (e) { console.warn('r7 uebergang', e); }
    try { neuLeiste(); } catch (e) { console.warn('r7 neu', e); }
    if (K.start) try { K.start(window.R7K); } catch (e) { console.warn('r7 start', e); }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();
})();
