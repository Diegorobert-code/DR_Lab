/* zyklus.js – «Muster pro Zyklusphase» für Jackie's Advice (22.10.2026)
   - Stimmung, Energie und Beschwerden täglich mit Chips antippen.
   - Zyklusbeginn selbst eintragen; die Phasen (Menstruation, Follikel, Eisprung, Luteal) werden daraus
     grob geschätzt. Ansicht: pro Phase die häufigsten Einträge und ein ruhiger Hinweis
     («In 3 Tagen beginnt deine Lutealphase – letztes Mal: müde, gereizt»).
   - Keine Diagnose, keine Aussage zur Verhütung, ersetzt keine ärztliche Beratung.
   - Alles nur auf diesem Handy (localStorage «ja_zyklus», wird bei «Alles löschen» mitgelöscht), kein Server.
   - Hilfebereich, Notruf-Leiste und Diskreter Modus bleiben unverändert. */
(function () {
  'use strict';
  if (window.__jkZyklus) return; window.__jkZyklus = true;
  var d = document, KEY = 'ja_zyklus';
  var $ = function (id) { return d.getElementById(id); };

  /* ---------- Speicher ---------- */
  function leer() { return { starts: [], len: 28, per: 5, tage: {} }; }
  function lies() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!v || typeof v !== 'object') return leer();
      var b = leer();
      b.starts = Array.isArray(v.starts) ? v.starts.filter(gueltig).sort() : [];
      b.len = zahl(v.len, 21, 40, 28); b.per = zahl(v.per, 2, 8, 5);
      b.tage = v.tage && typeof v.tage === 'object' ? v.tage : {};
      return b;
    } catch (e) { return leer(); }
  }
  function schreib(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function zahl(x, min, max, def) { x = parseInt(x, 10); return isNaN(x) ? def : Math.max(min, Math.min(max, x)); }
  function gueltig(k) { return typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k); }
  var D = lies();

  /* ---------- Datum ---------- */
  function key(dt) { return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); }
  function tagNr(k) { var p = k.split('-'); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); }
  function ausNr(n) { var t = new Date(n * 864e5); return t.getUTCFullYear() + '-' + String(t.getUTCMonth() + 1).padStart(2, '0') + '-' + String(t.getUTCDate()).padStart(2, '0'); }
  function heute() { return key(new Date()); }
  function schoen(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'long' }); }

  /* ---------- Phasen (grob geschätzt) ---------- */
  var PH = {
    mens: { n: 'Menstruation', lang: 'Menstruation', ic: '<path d="M12 3.5l5 6.2a6.3 6.3 0 1 1-10 0z"/>' },
    foll: { n: 'Follikelphase', lang: 'Follikelphase', ic: '<path d="M12 21v-8"/><path d="M12 13c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5z"/><path d="M12 15.5c0-3-2.3-5-5.5-5 0 3 2.3 5 5.5 5z"/>' },
    eis: { n: 'Eisprung', lang: 'Zeit um den Eisprung', ic: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>' },
    lut: { n: 'Lutealphase', lang: 'Lutealphase', ic: '<path d="M20 13.5A8 8 0 1 1 10.5 4a6.2 6.2 0 0 0 9.5 9.5z"/>' }
  };
  var REIHE = ['mens', 'foll', 'eis', 'lut'];
  function phaseAusTag(tag, L, P) { /* tag: 1 = erster Tag der Periode */
    var ov = Math.max(P + 2, L - 14);
    if (tag <= P) return 'mens';
    if (tag < ov - 1) return 'foll';
    if (tag <= ov + 1) return 'eis';
    return 'lut';
  }
  /* Zyklustag und Phase für ein Datum. Vergangene Zyklen nehmen ihre echte Länge (bis zum nächsten Start). */
  function info(k) {
    if (!D.starts.length) return null;
    var n = tagNr(k), S = D.starts.map(tagNr), L = D.len, basis = null, Lc = L;
    for (var i = S.length - 1; i >= 0; i--) if (S[i] <= n) { basis = S[i]; if (i + 1 < S.length) { var e = S[i + 1] - S[i]; if (e >= 15 && e <= 60) Lc = e; } break; }
    var tag;
    if (basis === null) { tag = (((n - S[0]) % L) + L) % L + 1; Lc = L; }
    else { var diff = n - basis; tag = diff < Lc ? diff + 1 : (diff - Lc) % L + 1; if (diff >= Lc) Lc = L; }
    return { tag: tag, L: Lc, ph: phaseAusTag(tag, Lc, D.per) };
  }

  /* ---------- Chips ---------- */
  var GRUPPEN = [
    { id: 's', titel: 'Stimmung', mehr: true, w: ['ruhig', 'fröhlich', 'ausgeglichen', 'empfindlich', 'gereizt', 'traurig', 'ängstlich', 'unruhig'] },
    { id: 'e', titel: 'Energie', mehr: false, w: ['viel Energie', 'mittel', 'müde', 'erschöpft'] },
    { id: 'y', titel: 'Körper', mehr: true, w: ['keine Beschwerden', 'Krämpfe', 'Kopfweh', 'Rückenweh', 'Brustspannen', 'Blähbauch', 'Heisshunger', 'Hautunreinheiten', 'schlecht geschlafen'] }
  ];
  function eintrag(k) { var e = D.tage[k]; return e && typeof e === 'object' ? e : {}; }
  function werte(e) {
    var a = [];
    if (Array.isArray(e.s)) a = a.concat(e.s);
    if (e.e) a.push(e.e);
    if (Array.isArray(e.y)) a = a.concat(e.y.filter(function (x) { return x !== 'keine Beschwerden'; }));
    return a;
  }
  function oben(liste, n) {
    var z = {}; liste.forEach(function (w) { z[w] = (z[w] || 0) + 1; });
    return Object.keys(z).sort(function (a, b) { return z[b] - z[a] || a.localeCompare(b, 'de'); }).slice(0, n).map(function (w) { return { w: w, n: z[w] }; });
  }

  /* ---------- Hinweis: welche Phase beginnt bald, was war letztes Mal? ---------- */
  function vorschau() {
    if (!D.starts.length) return null;
    var h = heute(), hn = tagNr(h), jetzt = info(h);
    if (!jetzt) return null;
    for (var i = 1; i <= 5; i++) {
      var p = info(ausNr(hn + i)).ph;
      if (p !== jetzt.ph) {
        /* letztes Mal: der jüngste vergangene Abschnitt dieser Phase */
        var liste = [], drin = false, tage = 0;
        for (var b = 1; b <= 70; b++) {
          var k = ausNr(hn - b), f = info(k).ph;
          if (f === p) { drin = true; liste = liste.concat(werte(eintrag(k))); tage++; }
          else if (drin) break;
        }
        var top = oben(liste, 3), sonst = false;
        if (!top.length) {
          var alle = [];
          Object.keys(D.tage).forEach(function (k) { if (gueltig(k) && tagNr(k) < hn && info(k).ph === p) alle = alle.concat(werte(eintrag(k))); });
          top = oben(alle, 3); sonst = top.length > 0;
        }
        return { in: i, ph: p, top: top.map(function (x) { return x.w; }), sonst: sonst };
      }
    }
    return { in: 0, ph: jetzt.ph, top: [] };
  }
  function vorschauText(v) {
    if (!v || !v.in) return '';
    var wann = v.in === 1 ? 'Morgen beginnt' : 'In ' + v.in + ' Tagen beginnt';
    var name = v.ph === 'eis' ? 'die Zeit um deinen Eisprung' : 'deine ' + PH[v.ph].n;
    var t = wann + ' ' + name;
    if (v.top.length) t += (v.sonst ? ' – sonst oft: ' : ' – letztes Mal: ') + v.top.join(', ');
    return t + '.';
  }

  /* ---------- Stil ---------- */
  var css = [
    '#vZyklus{--zy-ink:var(--m-ink,#2a1c24);--zy-ink2:var(--m-ink2,#594751);--zy-line:var(--m-line2,#e2d0c7);--zy-surface:var(--m-surface,#fff);--zy-soft:var(--m-soft,#f8e7e2);--zy-acc:var(--m-accent,#7b3f63);--zy-on:var(--m-on-accent,#fff);--zy-acc-ink:var(--m-accent-ink,#7b3f63);--zy-gold:var(--m-gold-ink,#7a5824)}',
    '#vZyklus .zy-karte{margin-top:16px}',
    '#zyTitel:focus{outline:none!important}',
    '#vZyklus .zy-karte h2{font-size:22px;margin:0 0 4px}',
    '#vZyklus .zy-klein{font-size:15px;color:var(--zy-ink2);margin:0 0 12px;line-height:1.45}',
    '#vZyklus .zy-hinweis{display:flex;gap:12px;align-items:flex-start;margin:14px 0 0;padding:14px 16px;border-radius:20px;background:var(--m-surface2,#f8f1ec);color:var(--zy-ink2);font-size:14.5px;line-height:1.45}',
    '#vZyklus .zy-hinweis svg.i{width:20px;height:20px;margin-top:1px;color:var(--zy-gold)}',
    '#vZyklus .zy-jetzt{display:flex;gap:14px;align-items:center;margin-top:16px;padding:16px 18px;border-radius:24px;background:var(--m-hero,var(--zy-soft));border:1px solid color-mix(in srgb,var(--m-gold,#c6a06a) 40%,transparent)}',
    '#vZyklus .zy-jetzt .zy-ic{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:var(--zy-surface);color:var(--zy-acc-ink);box-shadow:0 0 0 1px var(--zy-line)}',
    '#vZyklus .zy-jetzt b{display:block;font-family:var(--m-font-title,Georgia,serif);font-weight:500;font-size:20px;line-height:1.25;color:var(--zy-ink)}',
    '#vZyklus .zy-jetzt small{display:block;font-size:14.5px;color:var(--zy-ink2);line-height:1.4;margin-top:2px}',
    '#vZyklus .zy-bald{display:flex;gap:12px;align-items:flex-start;margin-top:12px;padding:14px 16px;border-radius:20px;background:var(--zy-surface);border:1px solid var(--zy-line);color:var(--zy-ink);font-size:16px;line-height:1.45}',
    '#vZyklus .zy-bald svg.i{color:var(--zy-acc-ink);margin-top:1px}',
    '#vZyklus .zy-felder{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}',
    '#vZyklus .zy-felder .zy-voll{grid-column:1/-1}',
    '#vZyklus label.zy-lab{display:grid;gap:6px;font-size:14.5px;color:var(--zy-ink2);min-width:0}',
    '#vZyklus .zy-feld{width:100%;min-width:0;min-height:52px;border:1px solid var(--zy-line);border-radius:16px;background:var(--zy-surface);color:var(--zy-ink);font:16px var(--m-font-body,inherit);padding:10px 14px;-webkit-appearance:none;appearance:none}',
    '#vZyklus select.zy-feld{background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),linear-gradient(135deg,currentColor 50%,transparent 50%);background-position:calc(100% - 20px) 50%,calc(100% - 15px) 50%;background-size:5px 5px;background-repeat:no-repeat;padding-right:34px}',
    '#vZyklus .zy-reihe{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}',
    '#vZyklus .zy-reihe .btn{flex:1 1 150px;width:auto}',
    '#vZyklus .zy-gruppe{margin-top:14px}',
    '#vZyklus .zy-gruppe h3{font-size:17px;margin:0 0 8px;font-family:var(--m-font-body,inherit);font-weight:600;letter-spacing:0;color:var(--zy-ink)}',
    '#vZyklus .zy-chips{display:flex;flex-wrap:wrap;gap:8px}',
    '#vZyklus .zy-chip{min-height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--zy-line);background:var(--zy-surface);color:var(--zy-ink);font:500 15px var(--m-font-body,inherit);cursor:pointer;display:inline-flex;align-items:center;gap:6px}',
    '#vZyklus .zy-chip[aria-pressed=true]{background:var(--zy-acc);border-color:var(--zy-acc);color:var(--zy-on)}',
    '#vZyklus .zy-chip svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;display:none}',
    '#vZyklus .zy-chip[aria-pressed=true] svg{display:block}',
    '#vZyklus .zy-status{min-height:1.4em;margin:10px 2px 0;font-size:14.5px;color:var(--zy-ink2)}',
    '#vZyklus .zy-phasen{display:grid;gap:12px;margin-top:6px}',
    '#vZyklus .zy-phase{padding:16px 18px;border-radius:22px;border:1px solid var(--zy-line);background:var(--zy-surface)}',
    '#vZyklus .zy-phase.jetzt{border-color:color-mix(in srgb,var(--zy-acc) 55%,var(--zy-line));box-shadow:0 0 0 1px color-mix(in srgb,var(--zy-acc) 30%,transparent)}',
    '#vZyklus .zy-phase-kopf{display:flex;align-items:center;gap:10px;margin-bottom:8px}',
    '#vZyklus .zy-phase-kopf svg.i{color:var(--zy-acc-ink)}',
    '#vZyklus .zy-phase-kopf b{font-family:var(--m-font-title,Georgia,serif);font-weight:500;font-size:19px;color:var(--zy-ink);flex:1;min-width:0}',
    '#vZyklus .zy-phase-kopf small{font-size:13.5px;color:var(--zy-ink2);white-space:nowrap}',
    '#vZyklus .zy-marke{display:inline-block;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--zy-acc-ink);border:1px solid color-mix(in srgb,var(--zy-acc) 45%,transparent);border-radius:999px;padding:1px 8px;margin-left:6px;vertical-align:2px}',
    '#vZyklus .zy-top{display:flex;flex-wrap:wrap;gap:6px}',
    '#vZyklus .zy-top span{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:0 12px;border-radius:999px;background:var(--m-surface2,#f8f1ec);color:var(--zy-ink);font-size:14.5px}',
    '#vZyklus .zy-top span i{font-style:normal;font-size:13px;color:var(--zy-ink2);font-variant-numeric:tabular-nums}',
    '#vZyklus .zy-leer{font-size:14.5px;color:var(--zy-ink2);margin:0}',
    '#vZyklus .zy-starts{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:0}',
    '#vZyklus .zy-starts li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid var(--m-line,#efe3dc);font-size:15.5px;color:var(--zy-ink)}',
    '#vZyklus .zy-x{min-height:44px;padding:0 14px;border-radius:999px;border:1px solid var(--zy-line);background:transparent;color:var(--zy-ink2);font:500 14px var(--m-font-body,inherit);cursor:pointer}',
    '#btnZyklus .ic svg.i{color:var(--m-accent-ink,#7b3f63)}',
    '@media (max-width:360px){#vZyklus .zy-felder{grid-template-columns:minmax(0,1fr)}#vZyklus .zy-phase-kopf{flex-wrap:wrap}}'
  ].join('\n');
  var st = d.createElement('style'); st.id = 'jkZyklusCss'; st.textContent = css; (d.head || d.documentElement).appendChild(st);

  var HAK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
  function svg(inhalt) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + inhalt + '</svg>'; }
  var IC_ZYKLUS = '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17"/><circle cx="12" cy="3.5" r="1.4"/>';
  var IC_INFO = '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5M12 8h.01"/>';
  var IC_UHR = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
  var IC_ZURUECK = '<path d="M15 6l-6 6 6 6"/>';
  var IC_SCHLOSS = '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>';
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- Ansicht ---------- */
  var sek, tagGewaehlt = heute();
  function bauen() {
    /* Die leere Ansicht steht in index.html (und in der Liste VIEWS), damit show() sie kennt. */
    sek = $('vZyklus'); if (!sek || sek.__zy) return false; sek.__zy = 1;
    sek.addEventListener('click', klick);
    sek.addEventListener('change', aenderung);
    return true;
  }

  function bald(v) { var vt = vorschauText(v); return vt ? '<p class="zy-bald">' + svg(IC_UHR) + '<span>' + esc(vt) + '</span></p>' : ''; }
  function muster(jetzt) {
    var html = '';
    if (!D.starts.length) {
      html += '<p class="zy-leer">Trag unten den ersten Tag deiner letzten Periode ein. Dann ordnet Jackie deine Einträge den Phasen zu.</p>';
    } else {
      var proPhase = { mens: [], foll: [], eis: [], lut: [] }, tage = { mens: 0, foll: 0, eis: 0, lut: 0 };
      Object.keys(D.tage).forEach(function (k) {
        if (!gueltig(k)) return; var w = werte(eintrag(k)), i = info(k); if (!i || !w.length && !(eintrag(k).y || []).length) return;
        proPhase[i.ph] = proPhase[i.ph].concat(w); tage[i.ph]++;
      });
      html += '<div class="zy-phasen">';
      REIHE.forEach(function (p) {
        var top = oben(proPhase[p], 5), ist = jetzt && jetzt.ph === p;
        html += '<div class="zy-phase' + (ist ? ' jetzt' : '') + '"><div class="zy-phase-kopf">' + svg(PH[p].ic) + '<b>' + PH[p].n + (ist ? '<span class="zy-marke">jetzt</span>' : '') + '</b><small>' + (tage[p] === 1 ? '1 Tag' : tage[p] + ' Tage') + ' erfasst</small></div>';
        if (top.length) html += '<div class="zy-top">' + top.map(function (x) { return '<span>' + esc(x.w) + ' <i>' + x.n + '×</i></span>'; }).join('') + '</div>';
        else html += '<p class="zy-leer">Noch keine Einträge in dieser Phase.</p>';
        html += '</div>';
      });
      html += '</div>';
    }

    return html;
  }

  function render() {
    if (!sek) return;
    var h = heute(), jetzt = info(h), v = vorschau(), e = eintrag(tagGewaehlt);
    var letzter = D.starts.length ? D.starts[D.starts.length - 1] : '';
    var html = '';
    html += '<div class="backrow"><button class="pill" type="button" data-home>' + svg(IC_ZURUECK) + 'Zurück</button></div>';
    html += '<span class="eyebrow">Muster pro Zyklusphase</span>';
    html += '<h1 id="zyTitel" tabindex="-1">Wie geht es dir <em>heute?</em></h1>';
    html += '<p class="lead">Tipp an, was zu dir passt. Mit der Zeit siehst du, was in welcher Phase wiederkehrt – und kannst dich darauf einstellen.</p>';
    html += '<div class="zy-hinweis" role="note">' + svg(IC_INFO) + '<span>Nur zum Beobachten. Die Phasen sind grob geschätzt aus deinem Zyklusbeginn: keine Diagnose und nicht zur Verhütung geeignet. Ersetzt keine ärztliche Beratung.</span></div>';

    if (jetzt) {
      html += '<div class="zy-jetzt"><span class="zy-ic">' + svg(PH[jetzt.ph].ic) + '</span><span><b>Heute: ' + PH[jetzt.ph].lang + '</b><small>Zyklustag ' + jetzt.tag + ' · geschätzt</small></span></div>';
      html += '<div id="zyBaldBox">' + bald(v) + '</div>';
    }

    /* Eintrag */
    html += '<div class="card zy-karte" id="zyEintrag"><h2>Dein Tag</h2>';
    html += '<label class="zy-lab">Tag<input class="zy-feld" type="date" id="zyTag" value="' + tagGewaehlt + '" max="' + h + '"></label>';
    GRUPPEN.forEach(function (g) {
      var gew = g.mehr ? (Array.isArray(e[g.id]) ? e[g.id] : []) : (e[g.id] ? [e[g.id]] : []);
      html += '<div class="zy-gruppe" role="group" aria-labelledby="zyG' + g.id + '"><h3 id="zyG' + g.id + '">' + g.titel + (g.mehr ? '' : ' <span class="muted" style="font-weight:400;font-size:14px">(eine Wahl)</span>') + '</h3><div class="zy-chips">';
      g.w.forEach(function (w) {
        html += '<button type="button" class="zy-chip" data-g="' + g.id + '" data-w="' + esc(w) + '" aria-pressed="' + (gew.indexOf(w) > -1) + '">' + HAK + esc(w) + '</button>';
      });
      html += '</div></div>';
    });
    html += '<p class="zy-status" id="zyStatus" role="status" aria-live="polite"></p></div>';

    html += '<div class="section-title"><h2>Deine Muster</h2></div><div id="zyMuster">' + muster(jetzt) + '</div>';

    /* Zyklusbeginn */
    html += '<div class="card zy-karte" id="zyStart"><h2>Dein Zyklus</h2><p class="zy-klein">Gib den ersten Tag deiner Periode ein. Je mehr Starts du einträgst, desto besser passt die Schätzung zu dir.</p>';
    html += '<div class="zy-felder"><label class="zy-lab zy-voll">Erster Tag der Periode<input class="zy-feld" type="date" id="zyStartDatum" value="' + (letzter || h) + '" max="' + h + '"></label>';
    html += '<label class="zy-lab">Zykluslänge<select class="zy-feld" id="zyLen">';
    for (var l = 21; l <= 40; l++) html += '<option value="' + l + '"' + (l === D.len ? ' selected' : '') + '>' + l + ' Tage</option>';
    html += '</select></label><label class="zy-lab">Periode dauert<select class="zy-feld" id="zyPer">';
    for (var p2 = 2; p2 <= 8; p2++) html += '<option value="' + p2 + '"' + (p2 === D.per ? ' selected' : '') + '>' + p2 + ' Tage</option>';
    html += '</select></label></div>';
    html += '<div class="zy-reihe"><button class="btn" type="button" data-zy="start">Zyklusstart speichern</button><button class="btn soft" type="button" data-zy="heute">Periode hat heute begonnen</button></div>';
    if (D.starts.length) {
      html += '<ul class="zy-starts" aria-label="Eingetragene Zyklusstarts">';
      D.starts.slice(-6).reverse().forEach(function (s) { html += '<li><span>' + esc(schoen(s)) + '</span><button type="button" class="zy-x" data-zy="weg" data-k="' + s + '" aria-label="Start vom ' + esc(schoen(s)) + ' entfernen">Entfernen</button></li>'; });
      html += '</ul>';
    }
    html += '<p class="zy-status" id="zyStartStatus" role="status" aria-live="polite"></p></div>';

    html += '<div class="card soft zy-karte"><h3>Zyklus-Daten löschen</h3><p class="muted small">Löscht alle Einträge und Zyklusstarts dieser Ansicht auf diesem Handy. Der Rest der App bleibt.</p><button class="btn danger" type="button" data-zy="loeschen">Zyklus-Daten löschen</button></div>';
    html += '<p class="privacy">' + svg(IC_SCHLOSS) + 'Deine Einträge bleiben auf deinem Handy.</p>';
    sek.innerHTML = html;
  }

  function status(id, t) { var s = $(id); if (s) { s.textContent = ''; setTimeout(function () { s.textContent = t; }, 30); } }

  function klick(ev) {
    var c = ev.target.closest('.zy-chip');
    if (c) {
      var g = c.getAttribute('data-g'), w = c.getAttribute('data-w'), grp = GRUPPEN.filter(function (x) { return x.id === g; })[0];
      var e = D.tage[tagGewaehlt] && typeof D.tage[tagGewaehlt] === 'object' ? D.tage[tagGewaehlt] : {};
      var an = c.getAttribute('aria-pressed') !== 'true';
      if (grp.mehr) {
        var a = Array.isArray(e[g]) ? e[g].slice() : [];
        if (an) {
          a.push(w);
          if (g === 'y') a = w === 'keine Beschwerden' ? ['keine Beschwerden'] : a.filter(function (x) { return x !== 'keine Beschwerden'; });
        } else a = a.filter(function (x) { return x !== w; });
        if (a.length) e[g] = a; else delete e[g];
      } else { if (an) e[g] = w; else delete e[g]; }
      if (Object.keys(e).length) D.tage[tagGewaehlt] = e; else delete D.tage[tagGewaehlt];
      var ok = schreib(D);
      /* nur die Chips der Gruppe neu setzen, damit der Fokus bleibt */
      sek.querySelectorAll('.zy-chip[data-g="' + g + '"]').forEach(function (b) {
        var ww = b.getAttribute('data-w');
        b.setAttribute('aria-pressed', String(grp.mehr ? (Array.isArray(e[g]) && e[g].indexOf(ww) > -1) : e[g] === ww));
      });
      status('zyStatus', ok ? 'Gespeichert für ' + schoen(tagGewaehlt) + '.' : 'Speichern ging nicht (Speicher gesperrt).');
      musterNeu();
      return;
    }
    var b = ev.target.closest('[data-zy]'); if (!b) return;
    var was = b.getAttribute('data-zy');
    if (was === 'start' || was === 'heute') {
      var k = was === 'heute' ? heute() : ($('zyStartDatum') || {}).value;
      if (!gueltig(k) || tagNr(k) > tagNr(heute())) { status('zyStartStatus', 'Bitte ein Datum bis heute wählen.'); return; }
      D.len = zahl(($('zyLen') || {}).value, 21, 40, D.len); D.per = zahl(($('zyPer') || {}).value, 2, 8, D.per);
      /* Starts, die weniger als 15 Tage auseinander liegen, ersetzen sich */
      D.starts = D.starts.filter(function (s) { return Math.abs(tagNr(s) - tagNr(k)) >= 15; });
      D.starts.push(k); D.starts.sort(); if (D.starts.length > 24) D.starts = D.starts.slice(-24);
      var ok2 = schreib(D); render(); homeKarte();
      status('zyStartStatus', ok2 ? 'Gespeichert. Die Phasen sind jetzt geschätzt.' : 'Speichern ging nicht (Speicher gesperrt).');
      return;
    }
    if (was === 'weg') {
      var kk = b.getAttribute('data-k');
      D.starts = D.starts.filter(function (s) { return s !== kk; }); schreib(D); render(); homeKarte();
      status('zyStartStatus', 'Start entfernt.');
      return;
    }
    if (was === 'loeschen') {
      if (!confirm('Alle Zyklus-Einträge und Starts auf diesem Handy löschen?')) return;
      D = leer(); try { localStorage.removeItem(KEY); } catch (e2) {}
      tagGewaehlt = heute(); render(); homeKarte();
      status('zyStartStatus', 'Gelöscht.');
    }
  }
  function aenderung(ev) {
    var t = ev.target;
    if (t.id === 'zyTag') {
      if (gueltig(t.value) && tagNr(t.value) <= tagNr(heute())) { tagGewaehlt = t.value; render(); var f = $('zyTag'); if (f) f.focus(); }
    } else if (t.id === 'zyLen' || t.id === 'zyPer') {
      if (!D.starts.length) return;
      D.len = zahl(($('zyLen') || {}).value, 21, 40, D.len); D.per = zahl(($('zyPer') || {}).value, 2, 8, D.per);
      schreib(D); var id = t.id; render(); homeKarte(); var f2 = $(id); if (f2) f2.focus();
      status('zyStartStatus', 'Gespeichert.');
    }
  }
  /* Muster-Karten nach einem Tipp leise auffrischen (ohne den Eintrag neu zu bauen) */
  function musterNeu() {
    var m = $('zyMuster'); if (m) m.innerHTML = muster(info(heute()));
    var bb = $('zyBaldBox'); if (bb) bb.innerHTML = bald(vorschau());
    homeKarte();
  }

  /* ---------- Startseite: Karte unter «Notiz an mich» ---------- */
  function homeKarte() {
    var b = $('btnZyklus');
    if (!b) {
      var notiz = $('btnNotes'); if (!notiz) return;
      b = d.createElement('button'); b.type = 'button'; b.className = 'notecta'; b.id = 'btnZyklus'; b.style.marginTop = '12px';
      b.innerHTML = '<span class="ic">' + svg(IC_ZYKLUS) + '</span><span><b>Muster pro Zyklusphase</b><small id="zyHomeText"></small></span>';
      notiz.parentNode.insertBefore(b, notiz.nextSibling);
      b.addEventListener('click', oeffnen);
    }
    var t = vorschauText(vorschau());
    var sm = $('zyHomeText'); if (sm) sm.textContent = t || 'Stimmung, Energie und Körper antippen – und sehen, was in welcher Phase wiederkehrt.';
  }

  function oeffnen() {
    D = lies(); tagGewaehlt = heute(); render();
    if (window.JackieApp && JackieApp.show) JackieApp.show('vZyklus');
    else { sek.classList.remove('hide'); }
    setTimeout(function () { var h1 = $('zyTitel'); if (h1) try { h1.focus({ preventScroll: true }); } catch (e) {} }, 30);
  }

  function start() { if (bauen()) { render(); homeKarte(); } }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();
  /* Tageswechsel: Hinweis beim Zurückkommen auffrischen */
  d.addEventListener('visibilitychange', function () { if (!d.hidden) { D = lies(); homeKarte(); } });
  window.JackieZyklus = { oeffnen: oeffnen, _info: info, _vorschau: vorschau };
})();
