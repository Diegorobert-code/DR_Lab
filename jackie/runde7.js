/* Jacky · Runde 7 (21.10.2026): Design, Verifizierung, vier neue Helfer. Notruf bleibt immer zuoberst.
   1. «Ruhig werden 5-4-3-2-1»: Erdungs-Übung Schritt für Schritt, mit Vorlesen (Vorbild: SOS-Übungen in Calm und Rootd).
   2. «Notfallkarte fürs Portemonnaie»: wichtige Nummern als Karte zum Drucken oder als Bild, neutral ohne App-Namen, speichert nichts
      (Vorbild: Notfallpass / Medical ID im iPhone).
   3. «Frist aus einem Brief»: Letzter Tag ausrechnen, Wochenende/Feiertag → nächster Werktag, Kalender-Erinnerung (Vorbild: Fristenrechner).
   4. «Gesprächskarten»: offene Fragen für Familie und Teenager (Vorbild: Table Topics).
   Nichts davon geht ins Netz. Kein Arzt, keine Diagnose, keine Heilversprechen. */
window.R7 = {
  kuerzel: 'ja', figur: 'Jacky', bild: 'posen/winkt.jpg', bildFroh: 'figur.jpg',
  ort: '#btnIdeas', wo: 'nach',
  himmel: '#jkBuehne',
  ansichten: '#vHome,#vAsk,#vAnswer,#vNotes,#vPause,#vHistory,#vSos,#vStory,#vIdeas',
  keineHaptik: '#vSchutz',
  neuTitel: 'Neu bei Jacky', neuText: 'Vier kleine Helfer. Alles bleibt auf deinem Handy.',
  css: [
    '#btnGo{color:#1a1f3a!important;font-weight:700}',
    '.jk-notruf .nr{min-width:0}',
    '@media (max-width:400px){html.r6-gross .jk-notruf{grid-template-columns:1fr 1fr}html.r6-gross header.top{flex-wrap:wrap}html.r6-gross header.top .pills{flex-wrap:wrap;flex:1 1 auto;min-width:0}html.r6-gross header.top .pill{padding:0 10px}html.r6-gross header.top>*{min-width:0;max-width:100%}html.r6-gross .mic{gap:12px;padding:16px}html.r6-gross .mic .orb{width:56px;height:56px}}',
    '.brand span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.r7-notruf{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 16px;padding:8px 12px;border-radius:14px;background:rgba(255,143,128,.12);border:1px solid rgba(255,143,128,.35);font-size:.875rem;color:#ffd9d2}',
    '.r7-notruf a{display:inline-flex;align-items:center;justify-content:center;min-width:56px;min-height:44px;padding:0 12px;border-radius:999px;background:#a43a30;color:#fff;font-weight:800;text-decoration:none}',
    '.r7-schritt{display:flex;align-items:center;gap:16px;margin:8px 0 16px}',
    '.r7-schritt .n{flex:none;width:72px;height:72px;border-radius:50%;display:grid;place-items:center;font-size:2rem;font-weight:800;color:#1a1f3a;background:radial-gradient(circle at 35% 30%,#ffe7a6,#f2c14e 60%,#c99a3e)}',
    '.r7-schritt b{display:block;font-size:1.125rem;line-height:1.3}',
    '.r7-punkte{display:flex;gap:6px;margin:0 0 16px}.r7-punkte i{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.15)}.r7-punkte i.an{background:#f2c14e}',
    '.r7-nk{position:relative;max-width:340px;margin:0 auto 16px;aspect-ratio:85.6/54;border-radius:14px;padding:14px 16px;box-sizing:border-box;background:linear-gradient(150deg,#fffaf0,#f3e7cf);color:#1d1a16;box-shadow:0 10px 30px -10px rgba(0,0,0,.6);display:flex;flex-direction:column;font-size:12px;line-height:1.25}',
    '.r7-nk h4{margin:0 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#7a4a12}',
    '.r7-nk dl{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;margin:0}.r7-nk dt{font-weight:800;font-variant-numeric:tabular-nums}.r7-nk dd{margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.r7-nk .p{margin-top:auto;padding-top:4px;border-top:1px dashed #b9a27a;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.r7-frist{font-size:1.5rem;font-weight:800;color:#f2c14e;line-height:1.2;margin:4px 0}',
    '.r7-gk{min-height:150px;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;border-radius:20px;background:linear-gradient(160deg,#22306a,#17255a);border:1px solid rgba(242,193,78,.4);font-size:1.25rem;line-height:1.4;font-family:var(--serif,Georgia,serif)}',
    '.r7-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}.r7-chips button{min-height:44px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:transparent;color:#cfd6ee;font:inherit;cursor:pointer}.r7-chips button[aria-pressed=true]{background:#f2c14e;color:#1a1f3a;border-color:#f2c14e;font-weight:700}',
    '@media print{body.r7-druck>*:not(.r7-druckbar){display:none!important}body.r7-druck .r7-druckbar{display:block!important;position:static!important}body.r7-druck .r7-druckbar .r7-nk{box-shadow:none;border:1px solid #999;margin:0}}',
    '.r7-druckbar{display:none}',
    /* Runde 7c: Tinkos neue Jacky-Bilder in den Helfern */
    '.r7c-fig{display:flex;gap:16px;align-items:center;margin:0 0 16px}.r7c-fig img{flex:none;width:80px;height:80px;border-radius:16px;object-fit:cover;border:1px solid rgba(242,193,78,.45);box-shadow:0 6px 18px -8px rgba(0,0,0,.6)}.r7c-fig p{margin:0!important}'
  ].join('\n'),
  start: function (R) {
    var S = { // vier Helfer
      erdung: function () {
        var schritte = [
          ['5', 'Dinge, die du siehst', 'Schau dich um. Nenne leise fünf Dinge: eine Farbe, eine Form, etwas Kleines …'],
          ['4', 'Dinge, die du spürst', 'Deine Füsse auf dem Boden. Der Stoff an deinem Arm. Die Luft an der Haut.'],
          ['3', 'Dinge, die du hörst', 'Ein Auto, ein Kühlschrank, dein eigener Atem. Alles darf da sein.'],
          ['2', 'Dinge, die du riechst', 'Tee, Seife, frische Luft. Wenn nichts da ist: Erinnere dich an einen Lieblingsduft.'],
          ['1', 'Ding, das du schmeckst', 'Ein Schluck Wasser oder einfach dein Mund. Atme danach lang aus.']
        ];
        var i = 0;
        var inh = R.blatt({ titel: 'Ruhig werden: 5-4-3-2-1', bild: 'posen/zuhoeren.jpg', html: notruf() + fig('posen/zuhoeren.jpg', 'Wenn alles zu viel ist, holt dich diese Übung ins Jetzt zurück. Nimm dir Zeit, es gibt kein Falsch. Ich bin da.')+'<div class="r7-punkte" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="r7-schritt" aria-live="polite"><span class="n"></span><span><b></b><small class="r7-klein"></small></span></div><div class="r7-reihe"><button type="button" class="r7-knopf leise" data-a="vor">🔊 Vorlesen</button><button type="button" class="r7-knopf" data-a="weiter">Weiter</button></div>', zu: stumm });
        function zeig() {
          var s = schritte[i];
          inh.querySelector('.n').textContent = s[0]; inh.querySelector('.r7-schritt b').textContent = s[1]; inh.querySelector('.r7-schritt small').textContent = s[2];
          [].forEach.call(inh.querySelectorAll('.r7-punkte i'), function (p, n) { p.classList.toggle('an', n <= i); });
          inh.querySelector('[data-a=weiter]').textContent = i < 4 ? 'Weiter' : 'Fertig';
        }
        zeig();
        inh.addEventListener('click', function (e) {
          var a = e.target.closest('[data-a]'); if (!a) return;
          if (a.dataset.a === 'vor') sprich(schritte[i][0] + ' ' + schritte[i][1] + '. ' + schritte[i][2]);
          else if (i < 4) { i++; zeig(); }
          else { R.zu(); mut('Gut gemacht. Du warst ganz hier.'); }
        });
      },
      karte: function () {
        var html = notruf() + fig('posen/zeigt.jpg', 'Für das Portemonnaie oder den Kühlschrank. Neutral, ohne App-Namen. Nichts wird gespeichert.') +
          '<div class="r7-nk" id="r7Nk"><h4>Wichtige Nummern</h4><dl><dt>117</dt><dd>Polizei</dd><dt>144</dt><dd>Sanität / Rettung</dd><dt>112</dt><dd>Euro-Notruf</dd><dt>142</dt><dd>Opferhilfe</dd><dt>143</dt><dd>Die Dargebotene Hand</dd><dt>147</dt><dd>Pro Juventute (Kinder, Jugend)</dd></dl><div class="p" id="r7NkP"></div></div>' +
          '<label for="r7NkName">Eine Person, die du anrufen kannst (freiwillig)</label><input id="r7NkName" maxlength="40" autocomplete="off" placeholder="z. B. Sara 079 …">' +
          '<div class="r7-reihe"><button type="button" class="r7-knopf leise" data-a="bild">🖼️ Als Bild</button><button type="button" class="r7-knopf" data-a="druck">🖨️ Drucken</button></div><div id="r7NkBild"></div>';
        var inh = R.blatt({ titel: 'Notfallkarte fürs Portemonnaie', bild: 'posen/zeigt.jpg', html: html });
        var f = inh.querySelector('#r7NkName'), p = inh.querySelector('#r7NkP');
        f.addEventListener('input', function () { p.textContent = f.value ? 'Meine Person: ' + f.value : ''; });
        inh.addEventListener('click', function (e) {
          var a = e.target.closest('[data-a]'); if (!a) return;
          if (a.dataset.a === 'druck') {
            var w = document.createElement('div'); w.className = 'r7-druckbar'; w.appendChild(inh.querySelector('#r7Nk').cloneNode(true));
            document.body.appendChild(w); document.body.classList.add('r7-druck');
            setTimeout(function () { try { window.print(); } catch (x) {} document.body.classList.remove('r7-druck'); w.remove(); }, 50);
          } else {
            var c = document.createElement('canvas'), s = 3; c.width = 856 * s / 2; c.height = 540 * s / 2;
            var g = c.getContext('2d'); g.scale(s / 2, s / 2);
            var gr = g.createLinearGradient(0, 0, 856, 540); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(1, '#f3e7cf');
            g.fillStyle = gr; g.fillRect(0, 0, 856, 540);
            g.fillStyle = '#7a4a12'; g.font = '700 34px sans-serif'; g.fillText('WICHTIGE NUMMERN', 44, 74);
            var z = [['117', 'Polizei'], ['144', 'Sanität / Rettung'], ['112', 'Euro-Notruf'], ['142', 'Opferhilfe'], ['143', 'Die Dargebotene Hand'], ['147', 'Pro Juventute (Kinder, Jugend)']];
            z.forEach(function (r, n) { g.fillStyle = '#1d1a16'; g.font = '800 40px sans-serif'; g.fillText(r[0], 44, 140 + n * 56); g.font = '400 34px sans-serif'; g.fillText(r[1], 150, 140 + n * 56); });
            if (f.value) { g.font = '700 32px sans-serif'; g.fillText('Meine Person: ' + f.value.slice(0, 32), 44, 500); }
            var o = inh.querySelector('#r7NkBild');
            o.innerHTML = '<p class="r7-klein">Bild lange drücken, dann «Sichern». Es wird nichts gespeichert, bis du es selbst tust.</p>';
            var im = new Image(); im.alt = 'Notfallkarte als Bild'; im.style.cssText = 'width:100%;border-radius:12px'; im.src = c.toDataURL('image/png'); o.appendChild(im);
          }
        });
      },
      frist: function () {
        var html = notruf() + '<p>Viele Briefe von Ämtern haben eine Frist. Jacky rechnet den letzten Tag aus. Massgebend ist immer, was im Brief steht.</p>' +
          '<label for="r7FDat">Brief erhalten am</label><input type="date" id="r7FDat" value="' + R.heute() + '">' +
          '<label for="r7FArt">Frist laut Brief</label><select id="r7FArt"><option value="t10">10 Tage</option><option value="t20">20 Tage</option><option value="t30" selected>30 Tage</option><option value="m1">1 Monat</option><option value="m2">2 Monate</option><option value="m3">3 Monate</option></select>' +
          '<div class="r7-karte" style="margin-top:16px" aria-live="polite"><span class="r7-klein">Letzter Tag</span><div class="r7-frist" id="r7FErg"></div><span class="r7-klein" id="r7FText"></span></div>' +
          '<div class="r7-reihe"><button type="button" class="r7-knopf" id="r7FIcs">📅 Erinnerung in den Kalender</button></div>' +
          '<p class="r7-klein">Gerechnet ab dem Tag nach dem Erhalt. Fällt der letzte Tag auf einen Samstag, Sonntag oder einen eidgenössischen Feiertag, zählt der nächste Werktag. Kantonale Feiertage und Gerichtsferien bitte selbst prüfen. Unsicher? Lass dich beraten.</p>';
        var inh = R.blatt({ titel: 'Frist aus einem Brief', html: html });
        var ende = null;
        function rechne() {
          var v = inh.querySelector('#r7FDat').value, a = inh.querySelector('#r7FArt').value;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
          var t = new Date(v + 'T12:00'), n = +a.slice(1);
          if (a[0] === 't') t.setDate(t.getDate() + n);
          else { var tag = t.getDate(); t.setDate(1); t.setMonth(t.getMonth() + n); var max = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(); t.setDate(Math.min(tag, max)); }
          var verschoben = '';
          while (t.getDay() === 0 || t.getDay() === 6 || feiertag(t)) { verschoben = feiertag(t) || (t.getDay() === 6 ? 'Samstag' : 'Sonntag'); t.setDate(t.getDate() + 1); }
          ende = t;
          var bis = Math.round((t - new Date(R.heute() + 'T12:00')) / 864e5);
          inh.querySelector('#r7FErg').textContent = t.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          inh.querySelector('#r7FText').textContent = (bis > 1 ? 'Noch ' + bis + ' Tage.' : bis === 1 ? 'Morgen.' : bis === 0 ? 'Heute ist der letzte Tag.' : 'Die Frist ist vorbei. Lass dich beraten, oft gibt es noch einen Weg.') + (verschoben ? ' (Verschoben wegen ' + verschoben + '.)' : '');
        }
        inh.addEventListener('input', rechne); inh.addEventListener('change', rechne); rechne();
        inh.querySelector('#r7FIcs').addEventListener('click', function () {
          if (!ende) return;
          var e = new Date(ende); e.setDate(e.getDate() - 3);
          var f = function (x) { return x.getFullYear() + ('0' + (x.getMonth() + 1)).slice(-2) + ('0' + x.getDate()).slice(-2); };
          var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DR Lab//Jackie//DE', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@jackie', 'DTSTAMP:' + f(new Date()) + 'T080000Z',
            'DTSTART;VALUE=DATE:' + f(e), 'SUMMARY:Frist läuft am ' + ende.toLocaleDateString('de-CH') + ' ab', 'DESCRIPTION:Brief beantworten oder Beratung holen.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
          if (window.R8K) R8K.datei(ics, 'frist.ics', { typ: 'text/calendar', titel: 'Frist-Erinnerung', hinweis: 'Trag dir in deinem Kalender von Hand ein: <b>' + e.toLocaleDateString('de-CH') + '</b> «Frist läuft am ' + ende.toLocaleDateString('de-CH') + ' ab». Oder kopiere den Kalender-Text.' }); // Runde 8: kein toter Download
          else { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'frist.ics';
          document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
          mut('Erinnerung drei Tage vorher. Du hast es im Griff.');
        });
      },
      karten: function () {
        var D = {
          familie: ['Was war heute der schönste Moment, auch ein ganz kleiner?', 'Worüber hast du heute gelacht?', 'Wenn wir einen Tag frei hätten, was würdest du machen?', 'Was kann ich besser machen, damit du dich gehört fühlst?', 'Welches Essen erinnert dich an etwas Schönes?', 'Wer hat dir diese Woche geholfen?', 'Was möchtest du dieses Jahr noch lernen?', 'Welches Lied passt gerade zu dir?'],
          teen: ['Was nervt dich gerade am meisten, und was würde helfen?', 'Welche App oder welcher Kanal gefällt dir gerade, und warum?', 'Was sollten Erwachsene über deine Welt besser verstehen?', 'Wann fühlst du dich richtig wohl?', 'Wenn du eine Regel zuhause ändern dürftest: welche?', 'Wer ist für dich ein Vorbild?', 'Was machst du, wenn es dir nicht gut geht?', 'Worauf freust du dich gerade?'],
          paar: ['Was hat dir diese Woche an uns gefallen?', 'Wobei kann ich dich gerade unterstützen?', 'Was möchtest du mal wieder zusammen machen?', 'Wann hast du dich zuletzt richtig verstanden gefühlt?', 'Was ist dir gerade wichtig?', 'Wofür bist du heute dankbar?', 'Welcher Ort tut uns beiden gut?', 'Was wünschst du dir für den nächsten Monat?']
        };
        var art = 'familie', i = 0, reihe = [];
        function mischen() { reihe = D[art].slice(); for (var k = reihe.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var x = reihe[k]; reihe[k] = reihe[j]; reihe[j] = x; } i = 0; }
        var inh = R.blatt({ titel: 'Gesprächskarten', bild: 'posen/zuhoeren.jpg', html: fig('posen/zuhoeren.jpg', 'Eine Frage auf den Tisch legen und zuhören. Keine richtige oder falsche Antwort.') + '<div class="r7-chips" role="group" aria-label="Für wen"><button type="button" data-k="familie" aria-pressed="true">Familie</button><button type="button" data-k="teen" aria-pressed="false">Teenager</button><button type="button" data-k="paar" aria-pressed="false">Zu zweit</button></div><div class="r7-gk" aria-live="polite" id="r7Gk"></div><div class="r7-reihe"><button type="button" class="r7-knopf leise" data-a="vor">🔊 Vorlesen</button><button type="button" class="r7-knopf" data-a="next">Nächste Karte</button></div>', zu: stumm });
        function zeig() { inh.querySelector('#r7Gk').textContent = reihe[i]; }
        mischen(); zeig();
        inh.addEventListener('click', function (e) {
          var k = e.target.closest('[data-k]'), a = e.target.closest('[data-a]');
          if (k) { art = k.dataset.k; [].forEach.call(inh.querySelectorAll('[data-k]'), function (b) { b.setAttribute('aria-pressed', b === k); }); mischen(); zeig(); }
          else if (a && a.dataset.a === 'vor') sprich(reihe[i]);
          else if (a) { i++; if (i >= reihe.length) { mischen(); mut('Alle Karten gespielt. Schön, dass ihr redet.'); } zeig(); }
        });
      }
    };
    function notruf() { return '<div class="r7-notruf" role="note"><span>Akute Gefahr?</span><a href="tel:117">117</a><a href="tel:144">144</a><a href="tel:142">142</a></div>'; }
    function sprich(t) { try { var u = new SpeechSynthesisUtterance(t); u.lang = 'de-CH'; u.rate = 0.92; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }
    function fig(b, text) { return '<div class="r7c-fig"><img src="' + b + '" alt="" width="80" height="80"><p>' + text + '</p></div>'; }
    // Ermutigung: Jacky «mutig» nur allein in der kleinen Feier-Meldung (grüne Jacke fällt dort nicht auf)
    function mut(text) { var alt = window.R7.bildFroh; window.R7.bildFroh = 'posen/mutig.jpg'; try { R.feier(text); } finally { window.R7.bildFroh = alt; } }
    function stumm() { try { speechSynthesis.cancel(); } catch (e) {} }
    function feiertag(t) {
      var m = t.getMonth() + 1, dd = t.getDate(), y = t.getFullYear();
      if (m === 1 && dd === 1) return 'Neujahr'; if (m === 8 && dd === 1) return 'Nationalfeiertag'; if (m === 12 && (dd === 25 || dd === 26)) return 'Weihnachten';
      // Ostern (Gauss/Meeus)
      var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, mm = Math.floor((a + 11 * h + 22 * l) / 451);
      var om = Math.floor((h + l - 7 * mm + 114) / 31), ot = ((h + l - 7 * mm + 114) % 31) + 1;
      var ostern = new Date(y, om - 1, ot, 12), diff = Math.round((new Date(y, m - 1, dd, 12) - ostern) / 864e5);
      return diff === -2 ? 'Karfreitag' : diff === 1 ? 'Ostermontag' : diff === 39 ? 'Auffahrt' : diff === 50 ? 'Pfingstmontag' : '';
    }
    window.R7.neu.forEach(function (n) { n.auf = S[n.id]; });
  },
  neu: [
    { id: 'erdung', e: '🌿', titel: 'Ruhig werden', text: '5-4-3-2-1, mit Vorlesen' },
    { id: 'karte', e: '💳', titel: 'Notfallkarte', text: 'Fürs Portemonnaie, neutral' },
    { id: 'frist', e: '📅', titel: 'Frist im Brief', text: 'Letzter Tag ausrechnen' },
    { id: 'karten', e: '💬', titel: 'Gesprächskarten', text: 'Fragen für Familie und Teens' }
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
