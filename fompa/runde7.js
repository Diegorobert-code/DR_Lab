/* Fompa · Runde 7 (21.10.2026): Design, Verifizierung, vier neue Helfer. Alles nur auf diesem Gerät.
   1. «Ausgaben-Kalender»: der Monat als Kalender, je dunkler das Gold, desto mehr ausgegeben; Tag antippen zeigt die Zettel
      (Vorbild: Ausgaben-Kalender in Monzo und Copilot Money).
   2. «Kaufpause-Tage»: Tage ohne private Ausgabe, aktuelle und längste Serie (Vorbild: No-Spend-Challenge bei YNAB/Monzo).
   3. «Wunsch-Glas»: Sparwunsch mit Ziel, Beträge reinlegen, Glas füllt sich, in Sitzungen gerechnet (Vorbild: Revolut Pockets, Yuh-Projekte).
   4. «Kleinbetrag-Rechner»: Was kostet der Kaffee pro Jahr – und in Sitzungen? (Vorbild: Latte-Faktor-Rechner).
   Nutzt aus index.html: zettel, isBuch, ZAEHLT, splitKat, chf, sitzText (nur lesen). */
window.R7 = {
  kuerzel: 'fo', figur: 'Fompa', bild: 'posen/nickt.jpg', bildFroh: 'posen/freut.jpg',
  ort: '#jahrRow', wo: 'vor',
  himmel: '#szene',
  ansichten: '#neu,#monat,#export,#liste,#paket,#woche,#kapital,#offen',
  neuTitel: 'Neu bei Fompa', neuText: 'Vier Helfer für deine Zettel und Wünsche.',
  css: [
    '@media (max-width:359px){.w .row{grid-template-columns:1fr!important}}',
    '@media (max-width:400px){html.r6-gross header{flex-wrap:wrap}html.r6-gross header > div{flex:1 1 180px}html.r6-gross .mode{grid-template-columns:1fr}html.r6-gross .mode button{white-space:normal}}',
    '.r7-kal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin:8px 0 12px}',
    '.r7-kal span{font-size:.75rem;text-align:center;color:#cfd6ee;padding-bottom:2px}',
    '.r7-kal button{aspect-ratio:auto;min-height:44px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#f6efe4;font:inherit;font-size:.8125rem;font-weight:700;cursor:pointer;padding:0}',
    '.r7-kal button.heute{outline:2px solid #8fb3e8;outline-offset:1px}',
    '.r7-kal button[aria-pressed=true]{border-color:#f2c14e;box-shadow:0 0 0 2px rgba(242,193,78,.4)}',
    '.r7-kal button.zukunft{opacity:.35}',
    '.r7-tagliste{list-style:none;margin:0;padding:0}.r7-tagliste li{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-top:1px solid rgba(255,255,255,.08);font-size:.9375rem}.r7-tagliste li b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}',
    '.r7-serie{display:flex;flex-wrap:wrap;gap:4px;margin:12px 0}',
    '.r7-serie i{width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.08);display:block}',
    '.r7-serie i.frei{background:#86d39a}.r7-serie i.kauf{background:rgba(242,193,78,.55)}.r7-serie i.weg{opacity:.25}',
    '.r7-zwei{display:grid;grid-template-columns:1fr 1fr;gap:8px}.r7-zwei .r7-karte{margin:0}',
    '.r7-glaeser{display:flex;flex-direction:column;gap:8px}',
    '.r7-glas{display:flex;gap:12px;align-items:center}',
    '.r7-glas svg{flex:none;width:56px;height:68px}',
    '.r7-glas .t{flex:1;min-width:0}.r7-glas .t b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.r7-glas .rein{display:flex;gap:8px;margin-top:8px}.r7-glas .rein input{min-height:44px!important}',
    '.r7-mini{min-height:44px;min-width:44px;padding:0 12px;border-radius:12px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#f6efe4;font:inherit;cursor:pointer;white-space:nowrap}'
  ].join('\n'),
  start: function (R) {
    var ok = typeof zettel !== 'undefined';
    function liste() { try { return ok ? zettel : []; } catch (e) { return []; } }
    function geld(n) { return typeof chf === 'function' ? chf(n) : (Math.round(n * 100) / 100).toFixed(2); }
    function sitz(n) { try { return typeof sitzText === 'function' ? sitzText(n) : ''; } catch (e) { return ''; } }
    function ausgaben() {
      return liste().filter(function (z) { try { return (typeof isBuch !== 'function' || isBuch(z)) && (typeof ZAEHLT !== 'function' || ZAEHLT(z)) && z.date && z.amount; } catch (e) { return false; } });
    }
    function privat(z) { try { var h = typeof splitKat === 'function' ? splitKat(z.kat).h : (z.kat || 'Privat'); return h === 'Privat' || h === 'Ferien' || h === 'Unklar'; } catch (e) { return true; } }
    function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
    var MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    // Bereich-Knöpfe zugänglich: Gruppe mit gedrückt/nicht gedrückt (statt unvollständiger Tab-Liste)
    var mode = document.querySelector('.mode');
    if (mode) {
      mode.setAttribute('role', 'group'); mode.setAttribute('aria-label', 'Bereich wählen');
      var syncM = function () { [].forEach.call(mode.querySelectorAll('button'), function (b) { b.removeAttribute('tabindex'); b.setAttribute('aria-pressed', b.classList.contains('on')); }); };
      syncM(); new MutationObserver(syncM).observe(mode, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    var tabs = document.querySelector('nav.tabs');
    if (tabs) {
      tabs.setAttribute('aria-label', 'Ansicht');
      var syncT = function () { [].forEach.call(tabs.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.classList.contains('on')); }); };
      syncT(); new MutationObserver(syncT).observe(tabs, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    var S = {
      kalender: function () {
        var jetzt = new Date(), y = jetzt.getFullYear(), m = jetzt.getMonth();
        var inh = R.blatt({ titel: 'Ausgaben-Kalender', bild: 'posen/rechnet.jpg', html: '<div class="r7-reihe" style="margin-top:0;align-items:center"><button type="button" class="r7-mini" data-a="zur" aria-label="Monat zurück" style="flex:0 0 auto">‹</button><b id="r7KM" style="flex:1;text-align:center;font-size:1.0625rem" aria-live="polite"></b><button type="button" class="r7-mini" data-a="vor" aria-label="Monat vor" style="flex:0 0 auto">›</button></div><div class="r7-kal" id="r7Kal"></div><div class="r7-zwei"><div class="r7-karte"><span class="r7-klein">Im Monat</span><div class="r7-zahl" id="r7KS"></div></div><div class="r7-karte"><span class="r7-klein">Teuerster Tag</span><div class="r7-zahl" id="r7KT" style="font-size:1.25rem"></div></div></div><div id="r7KTag" aria-live="polite"></div>' });
        function zeig(tagWahl) {
          var erster = new Date(y, m, 1), tage = new Date(y, m + 1, 0).getDate(), pro = {}, roh = {};
          var pre = y + '-' + ('0' + (m + 1)).slice(-2);
          ausgaben().forEach(function (z) { if (z.date.slice(0, 7) === pre) { pro[z.date] = (pro[z.date] || 0) + z.amount; (roh[z.date] = roh[z.date] || []).push(z); } });
          var max = Math.max.apply(null, Object.keys(pro).map(function (k) { return pro[k]; }).concat([1]));
          var html = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(function (w) { return '<span aria-hidden="true">' + w + '</span>'; }).join('');
          for (var i = 0; i < (erster.getDay() + 6) % 7; i++) html += '<span></span>';
          var heute = ymd(new Date()), summe = 0, teuer = null;
          for (var t = 1; t <= tage; t++) {
            var k = pre + '-' + ('0' + t).slice(-2), v = pro[k] || 0; summe += v;
            if (v && (!teuer || v > pro[teuer])) teuer = k;
            var a = v ? 0.15 + 0.75 * v / max : 0;
            html += '<button type="button" data-tag="' + k + '" aria-pressed="' + (k === tagWahl) + '" class="' + (k === heute ? 'heute' : '') + (k > heute ? ' zukunft' : '') + '" style="' + (v ? 'background:rgba(242,193,78,' + a.toFixed(2) + ');color:' + (a > 0.55 ? '#2a1d00' : '#f6efe4') : '') + '" aria-label="' + t + '. ' + MON[m] + (v ? ', ' + geld(v) : ', nichts') + '">' + t + '</button>';
          }
          inh.querySelector('#r7Kal').innerHTML = html;
          inh.querySelector('#r7KM').textContent = MON[m] + ' ' + y;
          inh.querySelector('#r7KS').textContent = geld(summe);
          inh.querySelector('#r7KT').textContent = teuer ? +teuer.slice(8) + '. · ' + geld(pro[teuer]) : '–';
          var box = inh.querySelector('#r7KTag');
          if (!Object.keys(pro).length) box.innerHTML = R.leer(y === jetzt.getFullYear() ? 'Noch keine Zettel in diesem Monat. Leg einen ab, dann leuchtet der Tag.' : 'Fompa zeigt das geladene Jahr. Wähle oben das Jahr, wenn du ältere Monate sehen willst.', 'posen/denkt.jpg');
          else if (tagWahl) {
            var l = roh[tagWahl] || [];
            box.innerHTML = '<h3>' + +tagWahl.slice(8) + '. ' + MON[m] + '</h3>' + (l.length ? '<ul class="r7-tagliste">' + l.map(function (z) { return '<li><b>' + R.esc(z.from || z.kat || 'Zettel') + '</b><span>' + geld(z.amount) + '</span></li>'; }).join('') + '</ul>' : '<p>An diesem Tag nichts ausgegeben. 🌿</p>');
          } else box.innerHTML = '<p class="r7-klein" style="margin-top:12px">Tag antippen, dann siehst du die Zettel.</p>';
        }
        zeig();
        inh.addEventListener('click', function (e) {
          var b = e.target.closest('[data-tag]'), a = e.target.closest('[data-a]');
          if (b) zeig(b.dataset.tag);
          else if (a) { m += a.dataset.a === 'vor' ? 1 : -1; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } zeig(); }
        });
      },
      pause: function () {
        var j = new Date(), heute = ymd(j), anfang = new Date(j.getFullYear(), j.getMonth(), 1), tage = new Date(j.getFullYear(), j.getMonth() + 1, 0).getDate();
        var kauf = {};
        ausgaben().forEach(function (z) { if (privat(z)) kauf[z.date] = 1; });
        var html = '', frei = 0, serie = 0, laengste = 0, lauf = 0;
        for (var t = 1; t <= tage; t++) {
          var k = ymd(new Date(j.getFullYear(), j.getMonth(), t));
          if (k > heute) { html += '<i class="weg" aria-hidden="true"></i>'; continue; }
          if (kauf[k]) { html += '<i class="kauf" aria-hidden="true"></i>'; lauf = 0; }
          else { html += '<i class="frei" aria-hidden="true"></i>'; frei++; lauf++; laengste = Math.max(laengste, lauf); }
        }
        // aktuelle Serie: rückwärts ab heute (auch über den Monatsanfang hinaus)
        var d = new Date(j); while (!kauf[ymd(d)] && serie < 400) { serie++; d.setDate(d.getDate() - 1); if (d.getFullYear() < j.getFullYear() - 1) break; }
        var leer = !ausgaben().length;
        var inh = R.blatt({ titel: 'Kaufpause-Tage', bild: 'posen/freut.jpg', html: '<p>Ein Tag ohne private Ausgabe ist ein grüner Punkt. Kein Zwang, nur ein kleines Spiel mit dir selbst. Praxis- und DR-Lab-Ausgaben zählen nicht.</p>' +
          (leer ? R.leer('Noch keine Zettel. Sobald du welche ablegst, zählt Fompa mit.', 'posen/denkt.jpg') : '') +
          '<div class="r7-zwei"><div class="r7-karte"><span class="r7-klein">Serie jetzt</span><div class="r7-zahl">' + (leer ? '–' : serie + ' ' + (serie === 1 ? 'Tag' : 'Tage')) + '</div></div><div class="r7-karte"><span class="r7-klein">Diesen Monat frei</span><div class="r7-zahl">' + frei + ' / ' + j.getDate() + '</div></div></div>' +
          '<div class="r7-serie" role="img" aria-label="' + frei + ' freie Tage in diesem Monat, längste Serie ' + laengste + ' Tage">' + html + '</div>' +
          '<p class="r7-klein">🟢 ohne private Ausgabe · 🟡 mit Ausgabe · Längste Serie im Monat: ' + laengste + ' Tage</p>' });
        if (!leer && serie >= 3) setTimeout(function () { R.feier(serie + ' Tage Kaufpause. Fompa staunt.'); }, 500);
      },
      glas: function () {
        var w = R.hol('wuensche', []);
        var inh = R.blatt({ titel: 'Wunsch-Glas', bild: 'posen/staunt.jpg', html: '<p>Ein Wunsch, ein Glas. Leg hinein, was du zur Seite legst. Fompa rechnet mit, auch in Sitzungen.</p><div class="r7-glaeser" id="r7Gl"></div><h3>Neuer Wunsch</h3><label for="r7GN">Was wünschst du dir?</label><input id="r7GN" maxlength="40" placeholder="z. B. Neues Velo" autocomplete="off"><label for="r7GZ">Ziel in CHF</label><input id="r7GZ" inputmode="decimal" placeholder="600" autocomplete="off"><p class="r7-klein" id="r7GH" aria-live="polite"></p><div class="r7-reihe"><button type="button" class="r7-knopf voll" data-a="neu">+ Glas aufstellen</button></div>' });
        function svg(p) {
          var h = Math.round(Math.min(1, p) * 46);
          return '<svg viewBox="0 0 56 68" aria-hidden="true"><rect x="16" y="2" width="24" height="7" rx="2" fill="#f2c14e"/><path d="M10 12h36v46a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z" fill="rgba(143,179,232,.12)" stroke="#dfe7ff" stroke-opacity=".6" stroke-width="2"/><rect x="12" y="' + (62 - h) + '" width="32" height="' + h + '" rx="4" fill="#f2c14e" opacity=".85"/></svg>';
        }
        function zeig() {
          var box = inh.querySelector('#r7Gl');
          if (!w.length) { box.innerHTML = R.leer('Noch kein Glas. Was wäre schön?', 'posen/denkt.jpg'); return; }
          box.innerHTML = w.map(function (x, i) {
            var p = x.ziel ? x.drin / x.ziel : 0;
            return '<div class="r7-karte r7-glas">' + svg(p) + '<div class="t"><b>' + R.esc(x.name) + '</b><span class="r7-klein">' + geld(x.drin) + ' von ' + geld(x.ziel) + ' · ' + Math.round(p * 100) + ' %' + (x.ziel > x.drin && sitz(x.ziel - x.drin) ? ' · noch ' + sitz(x.ziel - x.drin) : '') + '</span>' +
              '<div class="rein"><label class="r7-nur-sr" for="r7R' + i + '">Betrag für ' + R.esc(x.name) + '</label><input id="r7R' + i + '" inputmode="decimal" placeholder="CHF" autocomplete="off"><button type="button" class="r7-mini" data-rein="' + i + '">Rein</button><button type="button" class="r7-mini" data-weg="' + i + '" aria-label="Glas ' + R.esc(x.name) + ' entfernen">✕</button></div></div></div>';
          }).join('');
        }
        function zahl(s) { var n = parseFloat(String(s || '').replace(/['’\s]/g, '').replace(',', '.')); return isFinite(n) ? n : 0; }
        zeig();
        inh.addEventListener('click', function (e) {
          var a = e.target.closest('[data-a]'), r = e.target.closest('[data-rein]'), x = e.target.closest('[data-weg]');
          if (a) {
            var n = inh.querySelector('#r7GN').value.trim(), z = zahl(inh.querySelector('#r7GZ').value);
            if (!n || z <= 0) { inh.querySelector('#r7GH').textContent = !n ? 'Wie heisst dein Wunsch? Ein Wort reicht.' : 'Welches Ziel in Franken? Zum Beispiel 600.'; inh.querySelector(!n ? '#r7GN' : '#r7GZ').focus(); return; }
            inh.querySelector('#r7GH').textContent = '';
            w.push({ name: n.slice(0, 40), ziel: z, drin: 0 }); R.leg('wuensche', w); inh.querySelector('#r7GN').value = ''; inh.querySelector('#r7GZ').value = ''; zeig();
          } else if (r) {
            var i = +r.dataset.rein, b = zahl(inh.querySelector('#r7R' + i).value); if (b <= 0) return;
            var vor = w[i].drin; w[i].drin = Math.round((w[i].drin + b) * 100) / 100; R.leg('wuensche', w); zeig();
            if (vor < w[i].ziel && w[i].drin >= w[i].ziel) R.feier('Glas voll: ' + w[i].name + '! Fompa freut sich mit.');
            else R.feier('Rein damit. ' + Math.round(w[i].drin / w[i].ziel * 100) + ' % geschafft.', false);
          } else if (x) { w.splice(+x.dataset.weg, 1); R.leg('wuensche', w); zeig(); }
        });
      },
      klein: function () {
        var inh = R.blatt({ titel: 'Kleinbetrag-Rechner', bild: 'posen/rechnet.jpg', html: '<p>Kleine Beträge, die oft vorkommen, werden über das Jahr gross. Nur zum Staunen, nicht zum Verbieten.</p><label for="r7KB">Betrag</label><input id="r7KB" inputmode="decimal" value="4.80" autocomplete="off"><label for="r7KH">Wie oft? <b id="r7KHW"></b></label><input type="range" id="r7KH" min="1" max="7" value="5"><div class="r7-zwei" aria-live="polite"><div class="r7-karte"><span class="r7-klein">Pro Jahr</span><div class="r7-zahl" id="r7KJ"></div><span class="r7-klein" id="r7KJS"></span></div><div class="r7-karte"><span class="r7-klein">In 5 Jahren</span><div class="r7-zahl" id="r7K5"></div></div></div><p class="r7-klein" style="margin-top:12px">Gerechnet mit 48 Wochen. «≈ Sitzungen» erscheint, wenn dein Preis pro Sitzung eingetragen ist.</p>' });
        function rechne() {
          var b = parseFloat(String(inh.querySelector('#r7KB').value).replace(',', '.')) || 0, h = +inh.querySelector('#r7KH').value;
          inh.querySelector('#r7KHW').textContent = h + '× pro Woche';
          var j = b * h * 48;
          inh.querySelector('#r7KJ').textContent = geld(j); inh.querySelector('#r7KJS').textContent = sitz(j);
          inh.querySelector('#r7K5').textContent = geld(j * 5);
        }
        inh.addEventListener('input', rechne); rechne();
      }
    };
    window.R7.neu.forEach(function (n) { n.auf = S[n.id]; });
  },
  neu: [
    { id: 'kalender', e: '🗓️', titel: 'Ausgaben-Kalender', text: 'Der Monat in Gold' },
    { id: 'pause', e: '🌿', titel: 'Kaufpause-Tage', text: 'Serie ohne Privat-Ausgabe' },
    { id: 'glas', e: '🫙', titel: 'Wunsch-Glas', text: 'Sparen für etwas Schönes' },
    { id: 'klein', e: '☕', titel: 'Kleinbetrag-Rechner', text: 'Was der Kaffee im Jahr kostet' }
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
