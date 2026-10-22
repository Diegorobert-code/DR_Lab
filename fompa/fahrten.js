/* fahrten.js – «Kilometer-Fahrtenbuch» für Fompa (22.10.2026)
   - Fahrt erfassen: Datum, von, nach, km, Zweck geschäftlich oder privat (optional hin und zurück).
   - Favoriten-Strecken: ein Tipp trägt die Fahrt für heute ein (mit Rückgängig).
   - Summen: Monat (geschäftlich und privat) und Jahr geschäftlich.
   - «Ansatz pro km» ist freiwillig und leer: Fompa setzt keinen Betrag und gibt keinen Steuerrat.
   - Export als CSV: im Browser/der App echter Download, im Artefakt Hinweis und Text zum Kopieren
     (über R8K.datei wie die anderen Exporte). Die Fahrten kommen auch ins «Paket für die Treuhand»
     (02_Fahrten.csv, siehe runde8.js).
   - Speicher nur auf dem Gerät: localStorage «fompa-fahrten» (alles in try/catch), kein Server. */
(function () {
  'use strict';
  if (window.__fompaFahrten) return; window.__fompaFahrten = true;
  var d = document, KEY = 'fompa-fahrten';
  var MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  /* ---------- Speicher ---------- */
  function leer() { return { fahrten: [], fav: [], ansatz: '' }; }
  function lies() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!v || typeof v !== 'object') return leer();
      return {
        fahrten: Array.isArray(v.fahrten) ? v.fahrten.filter(function (f) { return f && /^\d{4}-\d{2}-\d{2}$/.test(f.datum) && isFinite(f.km); }) : [],
        fav: Array.isArray(v.fav) ? v.fav.filter(function (f) { return f && isFinite(f.km); }) : [],
        ansatz: typeof v.ansatz === 'string' ? v.ansatz : ''
      };
    } catch (e) { return leer(); }
  }
  function schreib() {
    var ok = false; try { localStorage.setItem(KEY, JSON.stringify(D)); ok = true; } catch (e) {}
    try { var z = d.getElementById('r8ThZeit'); if (z) z.dispatchEvent(new Event('change')); } catch (e) {} /* Treuhand-Stand auffrischen */
    return ok;
  }
  var D = lies();

  /* ---------- Hilfen ---------- */
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ymd(dt) { return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); }
  function heute() { return ymd(new Date()); }
  function dCH(s) { return s ? s.slice(8, 10) + '.' + s.slice(5, 7) + '.' + s.slice(0, 4) : ''; }
  function km(n) { n = Math.round(n * 10) / 10; return n.toLocaleString('de-CH', { minimumFractionDigits: n % 1 ? 1 : 0, maximumFractionDigits: 1 }); }
  function zahl(t) { var n = parseFloat(String(t || '').replace(/[’'\s]/g, '').replace(',', '.')); return isFinite(n) ? n : NaN; }
  function ansatz() { var a = zahl(D.ansatz); return isFinite(a) && a > 0 ? a : null; }
  function chf2(n) { return (Math.round(n * 100) / 100).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function jahr() { try { if (typeof year !== 'undefined' && year) return +year; } catch (e) {} return new Date().getFullYear(); }
  function toastT(t) { try { if (typeof toast === 'function') return toast(t); } catch (e) {} }
  function poseT(p, z) { try { if (typeof pose === 'function') pose(p, z); } catch (e) {} }
  function id() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function summe(l, z) { return l.reduce(function (s, f) { return s + (!z || f.zweck === z ? +f.km : 0); }, 0); }
  function sortiert(l) { return l.slice().sort(function (a, b) { return a.datum.localeCompare(b.datum) || String(a.id).localeCompare(String(b.id)); }); }

  /* Zeitraum wie beim Treuhand-Paket: 'j' (Jahr), 'q1'–'q4', 'mJJJJ-MM' */
  function imZeitraum(j, w) {
    j = String(j);
    return sortiert(D.fahrten.filter(function (f) {
      if (f.datum.slice(0, 4) !== j) return false;
      if (w === 'j') return true;
      if (w.charAt(0) === 'q') return Math.ceil(+f.datum.slice(5, 7) / 3) === +w.charAt(1);
      return f.datum.slice(0, 7) === w.slice(1);
    }));
  }
  function csv(l) {
    var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
    var a = ansatz();
    var kopf = ['Nr', 'Datum', 'Von', 'Nach', 'km', 'Zweck', 'Bemerkung'];
    if (a) kopf.push('Betrag CHF (eigener Ansatz)');
    var rows = [kopf];
    l.forEach(function (f, i) {
      var r = [('00' + (i + 1)).slice(-3), dCH(f.datum), f.von, f.nach, (+f.km).toFixed(1), f.zweck === 'g' ? 'geschaeftlich' : 'privat', f.notiz || ''];
      if (a) r.push(f.zweck === 'g' ? (f.km * a).toFixed(2) : '');
      rows.push(r);
    });
    var g = summe(l, 'g'), p = summe(l, 'p');
    var t1 = ['', '', 'Total geschaeftlich', '', g.toFixed(1), '', '']; if (a) t1.push((g * a).toFixed(2)); rows.push(t1);
    var t2 = ['', '', 'Total privat', '', p.toFixed(1), '', '']; if (a) t2.push(''); rows.push(t2);
    if (a) rows.push(['', '', 'Ansatz pro km (selbst eingetragen)', '', '', '', '', a.toFixed(2)]);
    return rows.map(function (r) { return r.map(q).join(';'); }).join('\r\n');
  }

  /* Für runde8.js (Paket für die Treuhand) */
  window.FompaFahrten = {
    liste: function (j, w) { return imZeitraum(j, w); },
    csv: function (l) { return csv(l); },
    text: function (l) {
      var g = summe(l, 'g'), p = summe(l, 'p'), a = ansatz();
      return '- 02_Fahrten.csv: Kilometer-Fahrtenbuch, ' + l.length + (l.length === 1 ? ' Fahrt' : ' Fahrten') + ', geschaeftlich ' + km(g) + ' km, privat ' + km(p) + ' km.' +
        (a ? ' Betrag mit selbst eingetragenem Ansatz CHF ' + chf2(a) + '/km: CHF ' + chf2(g * a) + '.' : ' Ohne Ansatz pro km.');
    }
  };

  /* ---------- Icons (feine Linien) ---------- */
  function ic(p, k) { return '<svg class="ff-ic' + (k ? ' ' + k : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + '</svg>'; }
  var I = {
    auto: '<path d="M5 16.5h14M3.5 16.5v-3.2l2-5A2 2 0 0 1 7.4 7h9.2a2 2 0 0 1 1.9 1.3l2 5v3.2"/><path d="M3.5 13.3h17"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
    stern: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    pfeil: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    weg: '<path d="M4 7h16M9 7V4.5h6V7M18 7l-1 13H7L6 7"/>',
    laden: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"/>',
    zurueck: '<path d="M15 6l-6 6 6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5M12 8h.01"/>'
  };

  /* ---------- Stil (nimmt die Farben aus markt.css) ---------- */
  var css = [
    '.ff-ic{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;vertical-align:-4px}',
    '#fahrtenEinstieg{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:10px 14px;border-radius:16px;border:1px solid var(--m-line2,var(--line));background:var(--m-surface,var(--card));color:var(--m-ink,var(--ink));font:600 16px var(--m-font-body,inherit);text-align:left;cursor:pointer;box-shadow:var(--m-shadow,none)}',
    '#fahrtenEinstieg .ff-rund{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--m-soft,var(--goldsoft));color:var(--m-accent-ink,var(--gold));flex:none}',
    '#fahrtenEinstieg span.t{flex:1;min-width:0}#fahrtenEinstieg small{display:block;font-weight:400;font-size:14px;color:var(--m-ink2,var(--muted))}',
    '#fahrtenEinstieg .ff-ic.p{color:var(--m-ink3,var(--muted))}',
    '#fahrten{display:grid;gap:12px;scroll-margin-top:12px}',
    '#ffTitel:focus{outline:none!important}',
    '#fahrten .ff-kopf{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
    '#fahrten .ff-kopf h2{margin:0;flex:1;min-width:0;display:flex;align-items:center;gap:8px}',
    '#fahrten .ff-kopf h2 .ff-ic{width:22px;height:22px;color:var(--m-accent-ink,var(--gold))}',
    '#fahrten .ff-zurueck{display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 14px 0 8px;border-radius:999px;border:1px solid var(--m-line2,var(--line));background:var(--m-surface,var(--card));color:var(--m-ink,var(--ink));font:600 15px var(--m-font-body,inherit);cursor:pointer}',
    '#fahrten .ff-fav{display:flex;flex-wrap:wrap;gap:8px}',
    '#fahrten .ff-fav button.chip{display:inline-flex;align-items:center;gap:6px;text-align:left;max-width:100%;min-height:44px;line-height:1.25}',
    '#fahrten .ff-fav button.chip span{overflow-wrap:anywhere}',
    '#fahrten .ff-fav .ff-ic{width:16px;height:16px;color:var(--m-accent-ink,var(--gold))}',
    '#fahrten .ff-zweck{display:grid;grid-template-columns:1fr 1fr;gap:4px;background:var(--m-surface2,var(--card2));border-radius:14px;padding:4px}',
    '#fahrten .ff-zweck button{min-height:44px;border:0;border-radius:11px;background:transparent;color:var(--m-ink2,var(--muted));font:600 15px var(--m-font-body,inherit);cursor:pointer}',
    '#fahrten .ff-zweck button[aria-checked=true]{background:var(--m-surface,var(--card));color:var(--m-ink,var(--ink));box-shadow:0 1px 3px rgba(20,33,61,.14)}',
    '#fahrten .ff-2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}',
    '#fahrten .ff-sum{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}',
    '#fahrten .ff-sum div{background:var(--m-surface2,var(--card2));border-radius:14px;padding:10px 12px;min-width:0}',
    '#fahrten .ff-sum small{display:block;font-size:13px;color:var(--m-ink2,var(--muted));line-height:1.3}',
    '#fahrten .ff-sum strong{display:block;font-size:20px;font-variant-numeric:tabular-nums;color:var(--m-ink,var(--ink));white-space:nowrap}',
    '#fahrten .ff-sum em{display:block;font-style:normal;font-size:13px;color:var(--m-ink2,var(--muted));font-variant-numeric:tabular-nums}',
    '#fahrten .ff-liste .eintrag{grid-template-columns:1fr auto}',
    '#fahrten .ff-liste .eintrag b{font-variant-numeric:tabular-nums}',
    '#fahrten .ff-x{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;border:1px solid var(--m-line2,var(--line));background:transparent;color:var(--m-ink2,var(--muted));cursor:pointer}',
    '#fahrten .ff-reihe{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}',
    '#fahrten .ff-reihe .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:0;padding:0 10px}',
    '#fahrten .ff-marke{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.04em;padding:1px 7px;border-radius:999px;margin-left:6px;vertical-align:1px;background:var(--m-soft,var(--goldsoft));color:var(--m-accent-ink,var(--gold))}',
    '#fahrten .ff-marke.p{background:var(--m-surface2,var(--card2));color:var(--m-ink2,var(--muted))}',
    '#fahrten .ff-rueck{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:14px;background:var(--m-soft,var(--goldsoft));color:var(--m-ink,var(--ink));font-size:15px}',
    '#fahrten .ff-rueck button{min-height:44px;padding:0 14px;border-radius:999px;border:1px solid var(--m-accent,var(--gold));background:var(--m-surface,var(--card));color:var(--m-accent-ink,var(--gold));font:600 15px var(--m-font-body,inherit);cursor:pointer;flex:none}',
    '#fahrten details summary{min-height:44px;display:flex;align-items:center}',
    '@media (max-width:359px){#fahrten .ff-sum{grid-template-columns:1fr 1fr}#fahrten .ff-reihe,#fahrten .ff-2{grid-template-columns:1fr}}'
  ].join('\n');
  var st = d.createElement('style'); st.id = 'fompaFahrtenCss'; st.textContent = css; (d.head || d.documentElement).appendChild(st);

  /* ---------- Aufbau ---------- */
  var sek, einstieg, zweck = 'g', monat = heute().slice(0, 7), rueckgaengig = null;

  function bauen() {
    var tabs = d.querySelector('nav.tabs'); if (!tabs || d.getElementById('fahrten')) return false;
    einstieg = d.createElement('button'); einstieg.type = 'button'; einstieg.id = 'fahrtenEinstieg';
    einstieg.innerHTML = '<span class="ff-rund">' + ic(I.auto) + '</span><span class="t">Kilometer-Fahrtenbuch<small id="ffEinText">Fahrten erfassen, Favoriten mit einem Tipp</small></span>' + ic('<path d="M9 6l6 6-6 6"/>', 'p');
    tabs.parentNode.insertBefore(einstieg, tabs.nextSibling);
    einstieg.addEventListener('click', oeffnen);

    sek = d.createElement('section'); sek.id = 'fahrten'; sek.className = 'hidden'; sek.setAttribute('aria-labelledby', 'ffTitel');
    var exp = d.getElementById('export');
    (exp && exp.parentNode ? exp.parentNode : tabs.parentNode).insertBefore(sek, exp ? exp.nextSibling : einstieg.nextSibling);
    try { if (typeof SECTIONS !== 'undefined' && SECTIONS.indexOf('fahrten') < 0) SECTIONS.push('fahrten'); } catch (e) {}
    sek.addEventListener('click', klick);
    sek.addEventListener('change', aenderung);
    sek.addEventListener('input', function (e) { if (e.target.id === 'ffAnsatz') { D.ansatz = e.target.value.trim(); schreib(); summen(); } });

    /* Einstieg nur in «Buchhaltung»; beim Wechsel des Bereichs das Fahrtenbuch schliessen */
    try {
      if (typeof setMode === 'function') {
        var alt = setMode;
        setMode = function (m) { var r = alt.apply(this, arguments); sichtbar(); return r; };
      }
      if (typeof tab === 'function') {
        var altTab = tab;
        tab = function (n) { var r = altTab.apply(this, arguments); einstieg.setAttribute('aria-expanded', String(n === 'fahrten')); return r; };
      }
    } catch (e) {}
    sichtbar();
    return true;
  }
  function sichtbar() {
    var m = 'buch'; try { if (typeof mode !== 'undefined') m = mode; } catch (e) {}
    einstieg.classList.toggle('hidden', m !== 'buch');
    if (m !== 'buch' && !sek.classList.contains('hidden')) sek.classList.add('hidden');
    einText();
  }
  function einText() {
    var t = d.getElementById('ffEinText'); if (!t) return;
    var l = imZeitraum(heute().slice(0, 4), 'm' + heute().slice(0, 7)), g = summe(l, 'g');
    t.textContent = l.length ? MON[+heute().slice(5, 7) - 1] + ': ' + km(g) + ' km geschäftlich' : 'Fahrten erfassen, Favoriten mit einem Tipp';
  }

  function monate() {
    var m = {}; m[heute().slice(0, 7)] = 1; m[monat] = 1;
    D.fahrten.forEach(function (f) { m[f.datum.slice(0, 7)] = 1; });
    return Object.keys(m).sort().reverse();
  }

  function render() {
    var favs = D.fav.map(function (f, i) {
      return '<button type="button" class="chip" data-ff="fav" data-i="' + i + '" aria-label="Fahrt heute eintragen: ' + esc(f.von) + ' nach ' + esc(f.nach) + ', ' + km(f.km) + ' km, ' + (f.zweck === 'g' ? 'geschäftlich' : 'privat') + '">' + ic(I.stern) + '<span>' + esc(f.von) + ' → ' + esc(f.nach) + ' · ' + km(f.km) + ' km</span></button>';
    }).join('');
    var h = '';
    h += '<div class="ff-kopf"><button type="button" class="ff-zurueck" data-ff="zu">' + ic(I.zurueck) + 'Zurück</button><h2 id="ffTitel" tabindex="-1">' + ic(I.auto) + 'Kilometer-Fahrtenbuch</h2></div>';
    h += '<div class="card"><h2>Favoriten</h2>' + (favs ? '<p class="hint">Ein Tipp trägt die Strecke für heute ein.</p><div class="ff-fav">' + favs + '</div>' : '<p class="hint">Noch keine Favoriten. Beim Speichern einer Fahrt «Als Favorit merken» ankreuzen, dann reicht künftig ein Tipp.</p>') + '<div id="ffRueck" aria-live="polite"></div></div>';

    h += '<form class="card form" id="ffForm" novalidate><h2>Fahrt erfassen</h2>' +
      '<div class="ff-2"><label>Datum<input type="date" id="ffDatum" value="' + heute() + '" required></label>' +
      '<label>Kilometer<input type="text" id="ffKm" inputmode="decimal" autocomplete="off" placeholder="z. B. 12.5" required></label></div>' +
      '<label>Von<input type="text" id="ffVon" autocomplete="off" maxlength="60" placeholder="z. B. Praxis Zürich" required></label>' +
      '<label>Nach<input type="text" id="ffNach" autocomplete="off" maxlength="60" placeholder="z. B. Kundin Winterthur" required></label>' +
      '<div><span class="hint" id="ffZweckL" style="display:block;margin-bottom:6px">Zweck</span><div class="ff-zweck" role="radiogroup" aria-labelledby="ffZweckL">' +
      '<button type="button" role="radio" data-ff="zweck" data-z="g" aria-checked="' + (zweck === 'g') + '">Geschäftlich</button>' +
      '<button type="button" role="radio" data-ff="zweck" data-z="p" aria-checked="' + (zweck === 'p') + '">Privat</button></div></div>' +
      '<label>Bemerkung (freiwillig)<input type="text" id="ffNotiz" autocomplete="off" maxlength="80" placeholder="z. B. Hausbesuch"></label>' +
      '<label class="check"><input type="checkbox" id="ffHinZurueck"><span>Hin und zurück (km × 2)</span></label>' +
      '<label class="check"><input type="checkbox" id="ffFav"><span>Als Favorit merken</span></label>' +
      '<p class="hint" id="ffFehler" role="alert" style="color:var(--warn);min-height:0"></p>' +
      '<button type="submit" class="btn main">Fahrt speichern</button></form>';

    h += '<div class="card"><h2>Summen</h2><label>Monat<select id="ffMonat">' + monate().map(function (m) { return '<option value="' + m + '"' + (m === monat ? ' selected' : '') + '>' + MON[+m.slice(5, 7) - 1] + ' ' + m.slice(0, 4) + '</option>'; }).join('') + '</select></label>' +
      '<div class="ff-sum" id="ffSum" style="margin-top:10px"></div>' +
      '<label style="margin-top:12px">Ansatz pro km in CHF (freiwillig)<input type="text" id="ffAnsatz" inputmode="decimal" autocomplete="off" placeholder="leer lassen" value="' + esc(D.ansatz) + '"></label>' +
      '<p class="hint">Fompa setzt keinen Ansatz und gibt keinen Steuerrat. Welcher Ansatz für dich gilt, klärst du mit deiner Treuhand.</p></div>';

    h += '<div class="card"><h2 id="ffListeT">Fahrten</h2><div class="liste ff-liste" id="ffListe"></div></div>';

    h += '<div class="card"><h2>Export</h2><p class="hint">Als Tabelle (CSV, Semikolon) für Excel, Numbers oder die Treuhand. Im «Paket für die Treuhand» unter Export sind die Fahrten automatisch dabei.</p>' +
      '<div class="ff-reihe"><button type="button" class="btn" data-ff="csv" data-w="m">' + ic(I.laden) + 'Monat als CSV</button><button type="button" class="btn" data-ff="csv" data-w="j">' + ic(I.laden) + 'Jahr als CSV</button></div></div>';
    h += '<p class="hint" style="text-align:center">Deine Fahrten bleiben auf diesem Gerät.</p>';
    sek.innerHTML = h;
    summen(); liste();
  }

  function summen() {
    var box = d.getElementById('ffSum'); if (!box) return;
    var j = monat.slice(0, 4), lm = imZeitraum(j, 'm' + monat), lj = imZeitraum(j, 'j'), a = ansatz();
    var gm = summe(lm, 'g'), pm = summe(lm, 'p'), gj = summe(lj, 'g');
    function feld(t, n, mitA) { return '<div><small>' + t + '</small><strong>' + km(n) + ' km</strong>' + (mitA && a ? '<em>CHF ' + chf2(n * a) + '</em>' : '') + '</div>'; }
    box.innerHTML = feld('Monat geschäftlich', gm, true) + feld('Monat privat', pm, false) + feld('Jahr ' + j + ' geschäftlich', gj, true);
    einText();
  }
  function liste() {
    var box = d.getElementById('ffListe'); if (!box) return;
    var l = imZeitraum(monat.slice(0, 4), 'm' + monat).reverse();
    var t = d.getElementById('ffListeT'); if (t) t.textContent = 'Fahrten im ' + MON[+monat.slice(5, 7) - 1];
    box.innerHTML = l.length ? l.map(function (f) {
      return '<div class="eintrag"><div><b>' + esc(f.von) + ' → ' + esc(f.nach) + '</b><span class="ff-marke' + (f.zweck === 'g' ? '' : ' p') + '">' + (f.zweck === 'g' ? 'geschäftlich' : 'privat') + '</span>' +
        '<small>' + dCH(f.datum) + ' · ' + km(f.km) + ' km' + (f.notiz ? ' · ' + esc(f.notiz) : '') + '</small></div>' +
        '<button type="button" class="ff-x" data-ff="weg" data-id="' + esc(f.id) + '" aria-label="Fahrt vom ' + dCH(f.datum) + ' löschen">' + ic(I.weg) + '</button></div>';
    }).join('') : '<p class="hint">Noch keine Fahrten in diesem Monat.</p>';
  }

  function rueckZeigen(text, f) {
    var box = d.getElementById('ffRueck'); if (!box) return;
    clearTimeout(rueckgaengig && rueckgaengig.t);
    rueckgaengig = { id: f.id, t: setTimeout(function () { box.innerHTML = ''; rueckgaengig = null; }, 8000) };
    box.innerHTML = '<div class="ff-rueck" style="margin-top:10px"><span>' + esc(text) + '</span><button type="button" data-ff="undo">Rückgängig</button></div>';
  }
  function neu(f) {
    f.id = id(); D.fahrten.push(f);
    if (!schreib()) toastT('Speichern ging nicht (Speicher gesperrt)');
    monat = f.datum.slice(0, 7);
    return f;
  }

  function klick(e) {
    var b = e.target.closest('[data-ff]'); if (!b) return;
    var w = b.getAttribute('data-ff');
    if (w === 'zu') { schliessen(); return; }
    if (w === 'zweck') { zweck = b.getAttribute('data-z'); sek.querySelectorAll('[data-ff=zweck]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); }); return; }
    if (w === 'fav') {
      var fv = D.fav[+b.getAttribute('data-i')]; if (!fv) return;
      var f = neu({ datum: heute(), von: fv.von, nach: fv.nach, km: +fv.km, zweck: fv.zweck === 'p' ? 'p' : 'g', notiz: fv.notiz || '' });
      render(); rueckZeigen('Eingetragen: ' + f.von + ' → ' + f.nach + ', ' + km(f.km) + ' km', f);
      var rb = sek.querySelector('[data-ff=undo]'); if (rb) rb.focus();
      poseT('freut', '✓'); return;
    }
    if (w === 'undo') {
      if (!rueckgaengig) return;
      var rid = rueckgaengig.id; D.fahrten = D.fahrten.filter(function (x) { return x.id !== rid; }); schreib();
      clearTimeout(rueckgaengig.t); rueckgaengig = null; render(); toastT('Fahrt zurückgenommen');
      var h2 = d.getElementById('ffTitel'); if (h2) h2.focus(); return;
    }
    if (w === 'weg') {
      var wid = b.getAttribute('data-id'), alt = D.fahrten.filter(function (x) { return x.id === wid; })[0]; if (!alt) return;
      D.fahrten = D.fahrten.filter(function (x) { return x.id !== wid; }); schreib(); render();
      rueckZeigen('Fahrt gelöscht', alt); rueckgaengig.wieder = alt;
      var rb2 = sek.querySelector('[data-ff=undo]'); if (rb2) { rb2.setAttribute('data-ff', 'wieder'); rb2.focus(); }
      return;
    }
    if (w === 'wieder') {
      if (rueckgaengig && rueckgaengig.wieder) { D.fahrten.push(rueckgaengig.wieder); schreib(); clearTimeout(rueckgaengig.t); rueckgaengig = null; render(); toastT('Fahrt wieder da'); }
      return;
    }
    if (w === 'csv') {
      var j = b.getAttribute('data-w') === 'j' ? 'j' : 'm' + monat, jahrX = monat.slice(0, 4), l = imZeitraum(jahrX, j);
      if (!l.length) { toastT(j === 'j' ? 'Im Jahr ' + jahrX + ' gibt es noch keine Fahrten' : 'In diesem Monat gibt es noch keine Fahrten'); return; }
      var name = 'Fahrtenbuch-' + (j === 'j' ? jahrX : monat) + '.csv', text = csv(l), blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
      if (window.R8K && R8K.datei) {
        if (R8K.imRahmen()) R8K.datei(blob, name, { nurText: true, titel: 'Fahrtenbuch sichern', text: text, hinweis: 'Hier in der Vorschau kann Fompa keine Datei speichern. In der installierten App oder im Browser-Tab entsteht eine echte CSV-Datei. Bis dahin: Tabelle kopieren und in Excel, Numbers oder eine Mail einfügen.' });
        else R8K.datei(blob, name, { text: text });
      } else {
        try { var a = d.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; d.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000); } catch (x) {}
      }
      poseT('rechnet');
    }
  }
  function aenderung(e) {
    if (e.target.id === 'ffMonat') { monat = e.target.value; summen(); liste(); }
  }
  function speichern(e) {
    e.preventDefault();
    var v = function (i) { var x = d.getElementById(i); return x ? x.value.trim() : ''; };
    var datum = v('ffDatum'), von = v('ffVon'), nach = v('ffNach'), k = zahl(v('ffKm')), fe = d.getElementById('ffFehler');
    var fehler = !/^\d{4}-\d{2}-\d{2}$/.test(datum) ? 'Bitte ein Datum wählen.' : !von || !nach ? 'Bitte «Von» und «Nach» eintragen.' : !(k > 0 && k < 5000) ? 'Bitte die Kilometer als Zahl eintragen, zum Beispiel 12.5.' : '';
    if (fehler) { fe.textContent = fehler; var erst = !datum ? 'ffDatum' : !(k > 0 && k < 5000) ? 'ffKm' : !von ? 'ffVon' : 'ffNach'; var x = d.getElementById(erst); if (x) x.focus(); return; }
    if (d.getElementById('ffHinZurueck').checked) k = k * 2;
    k = Math.round(k * 10) / 10;
    var notiz = v('ffNotiz');
    if (d.getElementById('ffFav').checked && !D.fav.some(function (f) { return f.von === von && f.nach === nach && +f.km === k && f.zweck === zweck; })) {
      D.fav.push({ von: von, nach: nach, km: k, zweck: zweck, notiz: notiz }); if (D.fav.length > 8) D.fav.shift();
    }
    var f = neu({ datum: datum, von: von, nach: nach, km: k, zweck: zweck, notiz: notiz });
    render(); rueckZeigen('Gespeichert: ' + km(f.km) + ' km, ' + (f.zweck === 'g' ? 'geschäftlich' : 'privat'), f);
    var rb = sek.querySelector('[data-ff=undo]'); if (rb) rb.focus();
    poseT('freut', '✓');
  }

  function oeffnen() {
    D = lies();
    try { if (typeof mode !== 'undefined' && mode !== 'buch' && typeof setMode === 'function') setMode('buch', true); } catch (e) {}
    render();
    try { tab('fahrten'); } catch (e) { sek.classList.remove('hidden'); }
    einstieg.classList.add('hidden');
    try { sek.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
    setTimeout(function () { var h = d.getElementById('ffTitel'); if (h) try { h.focus({ preventScroll: true }); } catch (x) {} }, 60);
  }
  function schliessen() {
    try { tab('monat'); } catch (e) { sek.classList.add('hidden'); }
    einstieg.classList.remove('hidden'); einText();
    try { einstieg.focus({ preventScroll: true }); } catch (e) {}
  }
  /* Nach jedem Neuaufbau das Formular wieder anhängen */
  var altRender = render;
  render = function () { altRender(); var fo = sek.querySelector('#ffForm'); if (fo && !fo.__ff) { fo.__ff = 1; fo.addEventListener('submit', speichern); } };
  /* Ein Tab-Wechsel (Zettel/Monat/Export) zeigt den Einstieg wieder */
  d.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('nav.tabs .tab') && einstieg) { einstieg.classList.toggle('hidden', (typeof mode !== 'undefined' && mode !== 'buch')); } }, true);

  function start() { if (bauen()) { render(); } }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();
  window.FompaFahrten.oeffnen = function () { if (sek) oeffnen(); };
})();
