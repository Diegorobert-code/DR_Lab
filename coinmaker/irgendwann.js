/* irgendwann.js – «Irgendwann»-Liste und geführter Sonntags-Rückblick für den Coin Maker (22.10.2026, 24.10.2026)
   - Karte «Deine Ideen» unter dem Wochenplan: jede Idee lässt sich auf «Irgendwann» schieben
     (Knopf oder nach links wischen), mit Rückgängig. So bleibt die aktive Liste klein.
   - Geparkte Ideen wie bei Tinder: nach rechts wischen = zurückholen, nach links = liegen lassen.
     Das geht auf der Seite und als eigener Kartenstapel «Irgendwann» in den Wisch-Karten.
   - Die App lernt: Sie schlägt die Idee vor, die am längsten wartet oder dir am besten gefällt
     (❤️ «Mag ich», früher zurückgeholt). Liegen lassen senkt den Vorschlag leicht.
   - Sonntags-Rückblick: 5 Fragen, eine Karte pro Frage (Was lief gut? Was bleibt hängen? Welche Idee
     holst du zurück? Der eine nächste kleine Schritt? Worauf freust du dich?). Am Ende eine kleine
     Zusammenfassung und einmal pro Woche +15 Coins. Der nächste Schritt landet im Wochenplan (morgen).
   - Die Rückblick-Karte erscheint nur am Wochenende, erreichbar ist der Rückblick immer
     (Knopf bei «Deine Ideen», Menü und Ende des Irgendwann-Stapels).
   - Liest «coinmaker.v1» (Kassenbuch) nur; Coins gibt es über window.CMKasse (index.html).
     Schreibt «coinmaker.irgendwann» und den Wochenplan («r7_cm_r8plan»). Alles in try/catch, nur auf diesem Gerät. */
(function () {
  'use strict';
  if (window.__cmIrgendwann) return; window.__cmIrgendwann = true;
  var d = document, KEY = 'coinmaker.irgendwann', PLAN = 'r7_cm_r8plan', BONUS = 15;
  var RUHIG = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- Speicher ---------- */
  function hol(k, def) { try { var v = localStorage.getItem(k); if (v === null) return def; var x = JSON.parse(v); return x && typeof x === 'object' ? x : def; } catch (e) { return def; } }
  function leg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function obj(x) { return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; }
  function daten() {
    var v = obj(hol(KEY, {}));
    ['ids', 'wochen', 'herz', 'mag', 'liegen', 'rueck'].forEach(function (k) { v[k] = obj(v[k]); });
    return v;
  }
  function ideen() { var s = hol('coinmaker.v1', { items: [] }); return (Array.isArray(s.items) ? s.items : []).filter(function (i) { return i && !i.ex && i.type === 'idee' && i.text; }); }
  function plan() { return obj(hol(PLAN, {})); }

  /* ---------- Hilfen ---------- */
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function kurz(t, n) { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; }
  function ymd(t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }
  function heute() { return ymd(new Date()); }
  function morgen() { var m = new Date(); m.setHours(12, 0, 0, 0); m.setDate(m.getDate() + 1); return ymd(m); }
  function tage() { var m = new Date(); m.setHours(12, 0, 0, 0); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); var l = []; for (var i = 0; i < 7; i++) { var x = new Date(m); x.setDate(m.getDate() + i); l.push(ymd(x)); } return l; }
  function woche() { return tage()[0]; }
  function wochenende() { var t = new Date().getDay(); return t === 0 || t === 6; }
  function tageSeit(s) { var p = String(s || '').split('-'); if (p.length !== 3) return 0; var a = new Date(+p[0], +p[1] - 1, +p[2], 12), b = new Date(); b.setHours(12, 0, 0, 0); return Math.max(0, Math.round((b - a) / 864e5)); }
  function seitText(n) { return n === 0 ? 'seit heute' : n === 1 ? 'seit gestern' : 'seit ' + n + ' Tagen'; }
  function R() { return window.R7K || null; }
  function feier(t) { try { if (R()) R().feier(t); } catch (e) {} }
  function summ(n) { try { if (window.R8K && R8K.summ) R8K.summ(n); else if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(n); } catch (e) {} }
  function planNeu() { try { if (window.CMPlan && CMPlan.zeig) CMPlan.zeig(); } catch (e) {} }
  function ist(id) { return !!daten().ids[id]; }

  /* Für runde8.js: Ideen auf «Irgendwann» erscheinen nicht in «Vom Einfall zum Plan» */
  window.CMIrgendwann = { ist: ist };

  /* ---------- Lernen: welche geparkte Idee ist dran? ---------- */
  function geparkt() { var v = daten(); return ideen().filter(function (i) { return v.ids[i.id]; }); }
  function wertung(i, v) {
    var t = tageSeit(v.ids[i.id]), h = (+v.herz[i.id] || 0) * 10 + (v.mag[i.id] ? 15 : 0), l = Math.min(4, +v.liegen[i.id] || 0) * 2;
    return { i: i, tage: t, herz: h, punkte: t + h - l + Math.min(5, (i.coins || 0) / 5) };
  }
  function grund(w) {
    if (w.herz > 0 && w.herz >= w.tage) return { e: '❤️', t: 'Gefällt dir am meisten' };
    return { e: '⏳', t: 'Wartet am längsten · ' + seitText(w.tage) };
  }
  /* Geparkte Ideen, die beste zuerst. */
  function sortiert() {
    var v = daten();
    return geparkt().map(function (i) { return wertung(i, v); }).sort(function (a, b) { return b.punkte - a.punkte || b.tage - a.tage; });
  }
  function vorschlag() { var l = sortiert(); return l.length ? { i: l[0].i, grund: grund(l[0]) } : null; }

  /* ---------- Aktionen ---------- */
  var letzte = null;
  function parken(id) {
    var v = daten(); v.ids[id] = heute();
    /* geplanten Schritt dieser Idee aus dem Wochenplan nehmen, aber merken (für Rückgängig) */
    var p = plan(), alt = p[id] ? JSON.parse(JSON.stringify(p[id])) : null;
    if (p[id] && p[id].tag && !p[id].fertig) { p[id].tag = null; leg(PLAN, p); }
    letzte = { id: id, plan: alt };
    leg(KEY, v); planNeu();
  }
  function holen(id) {
    var v = daten(); if (!v.ids[id]) return false;
    delete v.ids[id]; v.herz[id] = (+v.herz[id] || 0) + 1; delete v.liegen[id];
    if (letzte && letzte.id === id) letzte = null;
    leg(KEY, v); planNeu(); return true;
  }
  function lassen(id) { var v = daten(); if (!v.ids[id]) return; v.liegen[id] = (+v.liegen[id] || 0) + 1; leg(KEY, v); }
  function magUm(id) { var v = daten(); if (v.mag[id]) delete v.mag[id]; else v.mag[id] = 1; leg(KEY, v); return !!v.mag[id]; }
  function istMag(id) { return !!daten().mag[id]; }

  function ic(p) { return '<svg class="ig-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + '</svg>'; }
  var I = {
    spaeter: '<path d="M4 7.5h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M3 4h18v3.5H3zM10 12h4"/>',
    holen: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    stern: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    haken: '<path d="M20 6L9 17l-5-5"/>',
    bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    herz: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'
  };

  /* ---------- Stil (Notizbuch-Look aus markt.css) ---------- */
  var css = [
    '.ig-ic{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
    '#cmIdeen h2,#cmRueck h2{display:flex;align-items:center;gap:8px}',
    '#cmIdeen h2 .ig-ic,#cmRueck h2 .ig-ic{width:20px;height:20px;color:var(--m-accent-ink,#3f4ac0)}',
    '.ig-liste{list-style:none;margin:0 0 8px;padding:0;display:grid;gap:6px}',
    '.ig-zeile{position:relative;overflow:hidden;border-radius:10px;background:var(--m-surface2,#f6f6f4)}',
    '.ig-zeile .ig-hinter{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-end;gap:6px;padding:0 14px;background:var(--m-soft,#eef0fc);color:var(--m-accent-ink,#3f4ac0);font-size:.875rem;font-weight:600}',
    '.ig-zeile .ig-hinter .ig-r{display:none}',
    '.ig-zeile.nach-rechts .ig-hinter{justify-content:flex-start;background:#e3f4ea;color:#1f6b43}',
    '.ig-zeile.nach-rechts .ig-hinter .ig-r{display:inline-flex;align-items:center;gap:6px}',
    '.ig-zeile.nach-rechts .ig-hinter .ig-l{display:none}',
    '.ig-zeile .ig-hinter .ig-l{display:inline-flex;align-items:center;gap:6px}',
    '.ig-zeile .ig-vorne{position:relative;display:flex;align-items:center;gap:8px;min-height:52px;padding:6px 6px 6px 12px;background:var(--m-surface2,#f6f6f4);touch-action:pan-y;transition:transform .2s cubic-bezier(.2,.7,.2,1)}',
    '.ig-zeile.zieht .ig-vorne{transition:none}',
    '.ig-zeile p{flex:1;min-width:0;margin:0;font-size:.9375rem;line-height:1.35;color:var(--m-ink,#1f1f1e);overflow-wrap:anywhere}',
    '.ig-zeile p small{display:block;font-size:.75rem;color:var(--m-ink2,#55534e)}',
    '.ig-zeile.ig-tipp{box-shadow:inset 0 0 0 2px var(--m-accent,#4c58d0)}',
    '.ig-zeile .ig-marke{display:inline-block;margin:0 0 2px;padding:1px 8px;border-radius:999px;background:var(--m-accent,#4c58d0);color:var(--m-on-accent,#fff);font-size:.6875rem;font-weight:700}',
    '.ig-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:none;min-height:44px;min-width:44px;padding:0 12px;border-radius:999px;border:1px solid var(--m-line2,#d7d5cf);background:var(--m-surface,#fff);color:var(--m-ink,#1f1f1e);font:600 .875rem var(--m-font-body,inherit);cursor:pointer}',
    '.ig-btn.rund{padding:0}',
    '.ig-btn[aria-pressed=true]{color:#c0304a;border-color:#f0c4cd;background:#fdf0f2}',
    '.ig-btn[aria-pressed=true] .ig-ic{fill:currentColor}',
    '.ig-btn.an{background:var(--m-accent,#4c58d0);border-color:var(--m-accent,#4c58d0);color:var(--m-on-accent,#fff)}',
    '.ig-rueck{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px;padding:8px 8px 8px 12px;border-radius:10px;background:var(--m-soft,#eef0fc);color:var(--m-ink,#1f1f1e);font-size:.875rem}',
    '.ig-rueck span{min-width:0;overflow-wrap:anywhere}',
    '#cmIdeen details{margin-top:6px;border-top:1px solid var(--m-line,#e9e8e4);padding-top:6px}',
    '#cmIdeen summary{min-height:44px;display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600;color:var(--m-ink,#1f1f1e)}',
    '#cmIdeen .ig-mehr{font-size:.8125rem;color:var(--m-ink2,#55534e);margin:4px 0 8px}',
    '#cmIdeen .ig-sonntag{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid var(--m-line,#e9e8e4);font-size:.875rem;color:var(--m-ink2,#55534e)}',
    '#cmRueck{border-left:3px solid var(--m-accent,#4c58d0)}',
    '#cmRueck .r7-reihe{display:flex;flex-wrap:wrap;gap:8px}',
    /* Sonntags-Rückblick: eine Karte pro Frage */
    '.igs{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;background:var(--m-bg,#f7f5ef);color:var(--m-ink,#1f1f1e);font-family:var(--m-font-body,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif);padding:env(safe-area-inset-top,0) 0 env(safe-area-inset-bottom,0)}',
    '.igs-kopf{display:flex;align-items:center;gap:10px;padding:12px 16px 4px}',
    '.igs-kopf b{flex:1;min-width:0;font-size:1rem}',
    '.igs-punkte{display:flex;gap:5px}',
    '.igs-punkte i{width:8px;height:8px;border-radius:50%;background:#d7d5cf;transition:background .2s,transform .2s}',
    '.igs-punkte i.an{background:var(--m-accent,#4c58d0)}',
    '.igs-punkte i.jetzt{transform:scale(1.35)}',
    '.igs-zu{width:44px;height:44px;border-radius:50%;border:0;background:var(--m-surface,#fff);color:var(--m-ink,#1f1f1e);font-size:1.125rem;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.08)}',
    '.igs-buehne{flex:1;min-height:0;display:flex;align-items:stretch;justify-content:center;padding:8px 16px;overflow:hidden}',
    '.igs-karte{position:relative;width:100%;max-width:460px;display:flex;flex-direction:column;gap:10px;padding:20px 18px 18px;border-radius:24px;background:var(--m-surface,#fff);box-shadow:0 10px 30px rgba(31,31,30,.12),0 1px 2px rgba(31,31,30,.06);overflow-y:auto;touch-action:pan-y;transition:transform .28s cubic-bezier(.2,.7,.2,1),opacity .28s ease}',
    '.igs-karte.rein-r{transform:translateX(60px) rotate(2deg);opacity:0}',
    '.igs-karte.rein-l{transform:translateX(-60px) rotate(-2deg);opacity:0}',
    '.igs-karte.zieht{transition:none}',
    '.igs-chip{align-self:flex-start;padding:3px 10px;border-radius:999px;background:var(--m-soft,#eef0fc);color:var(--m-accent-ink,#3f4ac0);font-size:.75rem;font-weight:700}',
    '.igs-e{font-size:2.75rem;line-height:1}',
    '.igs-karte h3{margin:0;font-family:var(--m-font-title,inherit);font-size:1.5rem;line-height:1.2;color:var(--m-ink,#1f1f1e)}',
    '.igs-karte h3:focus{outline:none}',
    '.igs-karte .igs-hilfe{margin:0;font-size:.9375rem;line-height:1.4;color:var(--m-ink2,#55534e)}',
    '.igs-karte textarea,.igs-karte input[type=text]{width:100%;box-sizing:border-box;border-radius:14px;border:1px solid var(--m-line2,#d7d5cf);background:var(--m-surface2,#f6f6f4);color:var(--m-ink,#1f1f1e);font:16px/1.4 var(--m-font-body,inherit);padding:12px}',
    '.igs-karte textarea{min-height:110px;resize:vertical}',
    '.igs-karte input[type=text]{min-height:52px}',
    '.igs-karte textarea:focus,.igs-karte input:focus{outline:2px solid var(--m-accent,#4c58d0);outline-offset:1px;background:var(--m-surface,#fff)}',
    '.igs-chips{display:flex;flex-wrap:wrap;gap:6px}',
    '.igs-chips button{min-height:44px;padding:0 12px;border-radius:999px;border:1px solid var(--m-line2,#d7d5cf);background:var(--m-surface2,#f6f6f4);color:var(--m-ink,#1f1f1e);font:500 .875rem var(--m-font-body,inherit);cursor:pointer;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.igs-wahl{display:grid;gap:8px}',
    '.igs-wahl button{display:flex;align-items:center;gap:10px;width:100%;min-height:56px;padding:10px 12px;border-radius:14px;border:1px solid var(--m-line2,#d7d5cf);background:var(--m-surface2,#f6f6f4);color:var(--m-ink,#1f1f1e);font:500 .9375rem/1.35 var(--m-font-body,inherit);text-align:left;cursor:pointer}',
    '.igs-wahl button span{flex:1;min-width:0;overflow-wrap:anywhere}',
    '.igs-wahl button small{display:block;font-size:.75rem;color:var(--m-ink2,#55534e);margin-top:2px}',
    '.igs-wahl button[aria-checked=true]{border-color:var(--m-accent,#4c58d0);background:var(--m-soft,#eef0fc);box-shadow:0 0 0 1px var(--m-accent,#4c58d0)}',
    '.igs-wahl .igs-vor{border-color:#f2c14e;background:#fffaf0}',
    '.igs-wahl .igs-vor b{display:block;font-size:.75rem;color:#8a5a00}',
    '.igs-fuss{display:flex;gap:10px;padding:10px 16px 16px;justify-content:center}',
    '.igs-fuss button{flex:1;max-width:220px;min-height:52px;border-radius:999px;font:700 1rem var(--m-font-body,inherit);cursor:pointer;border:1px solid var(--m-line2,#d7d5cf);background:var(--m-surface,#fff);color:var(--m-ink,#1f1f1e)}',
    '.igs-fuss .igs-los{background:var(--m-accent,#4c58d0);border-color:var(--m-accent,#4c58d0);color:var(--m-on-accent,#fff)}',
    '.igs-fuss button[hidden]{display:none}',
    '.igs-tipp{margin:0;text-align:center;font-size:.8125rem;color:var(--m-ink3,#6b6963)}',
    '.igs-ende{align-items:center;text-align:center}',
    '.igs-ende img{width:84px;height:84px;border-radius:50%;object-fit:cover;border:3px solid #f2c14e}',
    '.igs-muenze{display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:999px;background:#fff4d6;color:#7a4b00;font-weight:800;font-size:1.25rem;animation:igsPop .6s cubic-bezier(.2,1.4,.4,1)}',
    '.igs-muenze span{display:inline-block;animation:igsDreh 1.2s ease-in-out}',
    '@keyframes igsPop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}',
    '@keyframes igsDreh{0%{transform:rotateY(0)}100%{transform:rotateY(720deg)}}',
    '.igs-sum{list-style:none;margin:0;padding:0;display:grid;gap:6px;width:100%;text-align:left}',
    '.igs-sum li{padding:8px 12px;border-radius:12px;background:var(--m-surface2,#f6f6f4);font-size:.875rem;line-height:1.35;overflow-wrap:anywhere}',
    '.igs-sum li b{display:block;font-size:.75rem;color:var(--m-ink2,#55534e)}',
    '.igs-nur-sr{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important}',
    'html.igs-offen,html.igs-offen body{overflow:hidden!important}',
    '@media (prefers-reduced-motion:reduce){.ig-zeile .ig-vorne,.igs-karte{transition:none}.igs-muenze,.igs-muenze span{animation:none}}'
  ].join('\n');
  var st = d.createElement('style'); st.id = 'cmIrgendwannCss'; st.textContent = css; (d.head || d.documentElement).appendChild(st);

  /* ---------- Karte «Deine Ideen» ---------- */
  var karte, rueckKarte;
  function zeig(fokus) {
    if (!karte) return;
    var alle = ideen().slice().reverse(), v = daten(), aktiv = alle.filter(function (i) { return !v.ids[i.id]; });
    var brett = hol('r7_cm_brett', {}) || {};
    aktiv = aktiv.filter(function (i) { return brett[i.id] !== 2; });
    var spaeter = sortiert(), w = woche(), fertig = v.rueck[w];
    var h = '<h2 id="cmIdeenH">' + ic(I.bulb) + 'Deine Ideen</h2>';
    h += '<p>Nicht alles muss jetzt sein. Schieb eine Idee auf «Irgendwann» (Knopf oder nach links wischen). Sie bleibt sicher liegen.</p>';
    if (letzte) {
      var li = alle.filter(function (i) { return i.id === letzte.id; })[0];
      h += '<div class="ig-rueck" role="status"><span>«' + esc(kurz(li ? li.text : '', 50)) + '» liegt jetzt bei Irgendwann.</span><button type="button" class="ig-btn" data-ig="undo">' + ic(I.holen) + 'Rückgängig</button></div>';
    }
    if (!alle.length) h += '<p class="leer">Noch keine eigene Idee. Leg eine Idee in den Automaten und zieh am Hebel.</p>';
    else if (!aktiv.length) h += '<p class="leer">Gerade keine offene Idee. Alles ist umgesetzt oder wartet bei Irgendwann.</p>';
    else h += '<ul class="ig-liste" aria-label="Offene Ideen">' + aktiv.slice(0, 8).map(function (i) {
      return '<li class="ig-zeile" data-id="' + esc(i.id) + '" data-wisch="parken"><div class="ig-hinter" aria-hidden="true"><span class="ig-l">' + ic(I.spaeter) + 'Irgendwann</span></div><div class="ig-vorne"><p>' + esc(kurz(i.text, 110)) + '<small>' + esc(i.day || '') + ' · ' + (i.coins || 0) + ' Coins</small></p>' +
        '<button type="button" class="ig-btn" data-ig="weg" data-id="' + esc(i.id) + '" aria-label="Auf Irgendwann schieben: ' + esc(kurz(i.text, 60)) + '">' + ic(I.spaeter) + '<span>Irgendwann</span></button></div></li>';
    }).join('') + '</ul>' + (aktiv.length > 8 ? '<p class="ig-mehr">… und ' + (aktiv.length - 8) + ' weitere im Ideen-Brett.</p>' : '');
    h += '<details' + (fokus === 'liste' || (karte.querySelector('details[open]')) ? ' open' : '') + '><summary>' + ic(I.spaeter) + 'Irgendwann (' + spaeter.length + ')</summary>' +
      (spaeter.length ? '<p class="ig-mehr">Nach rechts wischen holt zurück, nach links bleibt sie liegen. Was du magst, schlägt die App zuerst vor.</p><ul class="ig-liste" aria-label="Irgendwann">' + spaeter.map(function (x, k) {
        var i = x.i, g = k === 0 ? grund(x) : null, m = !!v.mag[i.id];
        return '<li class="ig-zeile' + (g ? ' ig-tipp' : '') + '" data-id="' + esc(i.id) + '" data-wisch="beide"><div class="ig-hinter" aria-hidden="true"><span class="ig-r">' + ic(I.holen) + 'Zurückholen</span><span class="ig-l">Liegen lassen</span></div><div class="ig-vorne"><p>' +
          (g ? '<span class="ig-marke">' + g.e + ' Vorschlag</span><br>' : '') + esc(kurz(i.text, 110)) + '<small>' + (g ? esc(g.t) : esc(seitText(x.tage))) + '</small></p>' +
          '<button type="button" class="ig-btn rund" data-ig="mag" data-id="' + esc(i.id) + '" aria-pressed="' + m + '" aria-label="Mag ich: ' + esc(kurz(i.text, 60)) + '">' + ic(I.herz) + '</button>' +
          '<button type="button" class="ig-btn" data-ig="holen" data-id="' + esc(i.id) + '" aria-label="Zurückholen: ' + esc(kurz(i.text, 60)) + '">' + ic(I.holen) + '<span>Zurück</span></button></div></li>';
      }).join('') + '</ul>' : '<p class="ig-mehr">Noch leer. Hier wartet, was gerade nicht dran ist.</p>') + '</details>';
    h += '<div class="ig-sonntag"><span>' + (fertig ? '✓ Rückblick dieser Woche gemacht.' : 'Sonntags-Rückblick: 5 Fragen, +' + BONUS + ' Coins.') + '</span><button type="button" class="ig-btn" data-ig="' + (fertig ? 'ansehen' : 'rueckblick') + '">' + ic(I.stern) + '<span>' + (fertig ? 'Ansehen' : 'Jetzt machen') + '</span></button></div>';
    karte.innerHTML = h;
    if (fokus && fokus !== 'liste') { var f = karte.querySelector(fokus); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }
    zeigRueckKarte();
  }

  /* Wischen auf der Seite: offene Ideen nach links = parken; geparkte nach rechts = zurückholen, nach links = liegen lassen */
  function wischen(e) {
    var z = e.target.closest('.ig-zeile[data-id]'); if (!z || e.target.closest('button') || e.pointerType === 'mouse' && e.button !== 0) return;
    var beide = z.getAttribute('data-wisch') === 'beide';
    var v = z.querySelector('.ig-vorne'), x0 = e.clientX, y0 = e.clientY, dx = 0, los = false;
    function mv(ev) {
      var mx = ev.clientX - x0, my = ev.clientY - y0;
      if (!los) { if (Math.abs(my) > 10 && Math.abs(my) > Math.abs(mx)) return ende(true); if (mx < -8 || (beide && mx > 8)) { los = true; z.classList.add('zieht'); } else return; }
      dx = beide ? mx : Math.min(0, mx); z.classList.toggle('nach-rechts', dx > 0); v.style.transform = 'translateX(' + dx + 'px)';
    }
    function hoch() {
      var grenze = Math.min(110, z.offsetWidth * 0.35), id = z.dataset.id;
      if (los && dx < -grenze) {
        v.style.transform = 'translateX(-100%)'; summ(8);
        if (beide) setTimeout(function () { lassen(id); zeig(); ansage('Bleibt bei Irgendwann liegen.'); }, 160);
        else setTimeout(function () { parken(id); zeig('[data-ig=undo]'); }, 160);
      } else if (los && beide && dx > grenze) {
        v.style.transform = 'translateX(100%)'; summ([10, 30, 10]);
        setTimeout(function () { holen(id); zeig('#cmIdeenH'); feier('Zurückgeholt. Diese Idee ist wieder dran.'); }, 160);
      } else v.style.transform = '';
      ende();
    }
    function ende(abbruch) { z.classList.remove('zieht'); if (abbruch) v.style.transform = ''; d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', hoch); d.removeEventListener('pointercancel', hoch); }
    d.addEventListener('pointermove', mv); d.addEventListener('pointerup', hoch); d.addEventListener('pointercancel', hoch);
  }
  var live;
  function ansage(t) { if (!live) { live = d.createElement('p'); live.className = 'igs-nur-sr'; live.setAttribute('aria-live', 'polite'); d.body.appendChild(live); } live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }

  function klick(e) {
    var b = e.target.closest('[data-ig]'); if (!b) return;
    var w = b.getAttribute('data-ig'), id = b.getAttribute('data-id');
    if (w === 'weg') { parken(id); summ(8); zeig('[data-ig=undo]'); }
    else if (w === 'holen') { holen(id); summ(8); zeig('#cmIdeenH'); feier('Zurückgeholt. Diese Idee ist wieder dran.'); }
    else if (w === 'mag') { var an = magUm(id); summ(8); zeig(); var nb = karte.querySelector('[data-ig=mag][data-id="' + id + '"]'); if (nb) try { nb.focus({ preventScroll: true }); } catch (x) {} ansage(an ? 'Gemerkt: gefällt dir. Die App schlägt sie eher vor.' : 'Nicht mehr markiert.'); }
    else if (w === 'undo' && letzte) {
      var v = daten(); delete v.ids[letzte.id]; leg(KEY, v);
      if (letzte.plan) { var p = plan(); p[letzte.id] = letzte.plan; leg(PLAN, p); }
      letzte = null; planNeu(); zeig('#cmIdeenH');
    }
    else if (w === 'rueckblick') rueckblick();
    else if (w === 'ansehen') rueckblick(true);
    else if (w === 'spaeter') { var v2 = daten(); v2.wochen[woche()] = 'uebersprungen'; leg(KEY, v2); zeigRueckKarte(); }
  }

  /* ---------- Rückblick-Karte auf der Seite (nur am Wochenende) ---------- */
  function zeigRueckKarte() {
    if (!rueckKarte) return;
    var v = daten(), status = v.wochen[woche()];
    if (status || !wochenende()) { rueckKarte.hidden = true; return; }
    rueckKarte.hidden = false;
    var vs = vorschlag();
    rueckKarte.innerHTML = '<h2 id="cmRueckH">' + ic(I.stern) + 'Sonntags-Rückblick</h2>' +
      '<p>Fünf kurze Fragen, eine Karte pro Frage. Dauert etwa drei Minuten. Am Ende gibt es eine kleine Zusammenfassung und +' + BONUS + ' Coins.' +
      (vs ? ' Coin Maker hat schon eine Idee, die du zurückholen könntest.' : '') + '</p>' +
      '<div class="r7-reihe"><button type="button" class="r7-knopf" data-ig="rueckblick">Rückblick starten</button><button type="button" class="r7-knopf leise" data-ig="spaeter">Diese Woche nicht</button></div>';
  }

  /* ---------- Sonntags-Rückblick: 5 Fragen, eine Karte pro Frage ---------- */
  var FRAGEN = [
    { e: '🌞', t: 'Was lief gut?', h: 'Klein zählt auch. Ein Satz reicht.', ph: 'z. B. Zwei Ideen aufgeschrieben, eine mit Anna besprochen' },
    { e: '🪨', t: 'Was bleibt hängen?', h: 'Was hat gebremst oder geht dir noch nach? Aufschreiben macht den Kopf frei.', ph: 'z. B. Für die Preis-Idee fehlt mir noch eine Zahl' },
    { e: '↩️', t: 'Welche Idee holst du zurück?', h: 'Eine aus «Irgendwann», höchstens. Der Rest darf warten.' },
    { e: '👣', t: 'Der eine nächste kleine Schritt?', h: 'So klein, dass er in 15 Minuten geht. Er kommt für morgen in den Wochenplan.', ph: 'z. B. Drei Familien fragen, ob sie das nutzen würden' },
    { e: '🎈', t: 'Worauf freust du dich?', h: 'In der neuen Woche, gross oder klein.', ph: 'z. B. Auf den Ausflug am Mittwoch' }
  ];
  var VORLAGEN = [
    null,
    ['Zu wenig Zeit', 'Eine Idee kam nicht vom Fleck', 'Nichts, alles gut'],
    null,
    ['15 Minuten daran arbeiten', 'Einer Person davon erzählen', 'Eine kleine Skizze machen'],
    ['Auf eine neue Idee', 'Auf Zeit mit der Familie', 'Aufs Wochenende']
  ];
  var offen = null;
  function rueckblick(nurAnsehen) {
    if (offen) return;
    var w = woche(), v = daten(), fertig = v.rueck[w];
    var z = { s: 0, a: ['', '', '', '', ''], idee: null, ziel: null, coins: 0 };
    if (nurAnsehen && fertig) { z.a = (fertig.a || z.a).slice(0, 5); z.idee = fertig.idee || null; z.ziel = fertig.ziel || null; z.coins = fertig.coins || 0; z.s = 5; z.alt = true; }
    else if (v.entwurf && v.entwurf.w === w && Array.isArray(v.entwurf.a)) { z.a = v.entwurf.a.slice(0, 5); while (z.a.length < 5) z.a.push(''); z.idee = v.entwurf.idee || null; z.s = Math.min(4, Math.max(0, +v.entwurf.s || 0)); }
    var vorher = d.activeElement;
    var o = d.createElement('div'); o.className = 'igs'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'igsT');
    o.innerHTML = '<div class="igs-kopf"><b id="igsT">Sonntags-Rückblick</b><span class="igs-punkte" aria-hidden="true">' + '<i></i><i></i><i></i><i></i><i></i>' + '</span><button type="button" class="igs-zu" aria-label="Schliessen, der Entwurf bleibt">✕</button></div>' +
      '<div class="igs-buehne"></div><p class="igs-tipp" aria-hidden="true">← wischen: weiter · zurück: wischen →</p><div class="igs-fuss"><button type="button" class="igs-zur">Zurück</button><button type="button" class="igs-los">Weiter</button></div><p class="igs-nur-sr" aria-live="polite"></p>';
    d.body.appendChild(o); d.documentElement.classList.add('igs-offen'); offen = o;
    var buehne = o.querySelector('.igs-buehne'), zur = o.querySelector('.igs-zur'), los = o.querySelector('.igs-los'), tipp = o.querySelector('.igs-tipp'), sr = o.querySelector('.igs-nur-sr');
    var karteEl = null;

    function entwurf() { if (z.alt) return; var v2 = daten(); v2.entwurf = { w: w, s: z.s, a: z.a, idee: z.idee }; leg(KEY, v2); }
    function zielIdee() {
      if (z.idee) return z.idee;
      var v2 = daten(), akt = ideen().filter(function (i) { return !v2.ids[i.id]; });
      return akt.length ? akt[akt.length - 1].id : null;
    }
    function textVon(id) { var i = ideen().filter(function (x) { return x.id === id; })[0]; return i ? i.text : ''; }

    function inhalt(s) {
      if (s === 5) return zusammenfassung();
      var f = FRAGEN[s], x = '<span class="igs-chip">Frage ' + (s + 1) + ' von 5</span><span class="igs-e" aria-hidden="true">' + f.e + '</span><h3 id="igsF" tabindex="-1">' + esc(f.t) + '</h3><p class="igs-hilfe" id="igsH">' + esc(f.h) + '</p>';
      if (s === 2) {
        var l = sortiert();
        if (!l.length) x += '<p class="igs-hilfe">Bei «Irgendwann» liegt gerade nichts. Gut so, dann ist deine Liste schon klein.</p>';
        else {
          x += '<div class="igs-wahl" role="radiogroup" aria-labelledby="igsF">' + l.slice(0, 6).map(function (y, k) {
            var g = k === 0 ? grund(y) : null;
            return '<button type="button" role="radio" data-idee="' + esc(y.i.id) + '" aria-checked="' + (z.idee === y.i.id) + '"' + (g ? ' class="igs-vor"' : '') + '><span>' + (g ? '<b>' + g.e + ' Vorschlag: ' + esc(g.t) + '</b>' : '') + esc(kurz(y.i.text, 100)) + (g ? '' : '<small>' + esc(seitText(y.tage)) + '</small>') + '</span></button>';
          }).join('') + '<button type="button" role="radio" data-idee="" aria-checked="' + (z.idee === '') + '"><span>Keine, alles darf warten</span></button></div>';
        }
        return x;
      }
      var ziel = s === 3 ? zielIdee() : null;
      if (s === 3 && ziel) x += '<p class="igs-hilfe">Für: <b>«' + esc(kurz(textVon(ziel), 70)) + '»</b></p>';
      if (s === 0) {
        var p = plan(), t = tage(), erledigt = Object.keys(p).filter(function (k) { return p[k] && p[k].fertig && p[k].schritt && t.indexOf(p[k].tag) >= 0; }).map(function (k) { return p[k].schritt; });
        var neu = ideen().filter(function (i) { return t.indexOf(i.day) >= 0; }).length;
        var vor = erledigt.slice(0, 3).map(function (s2) { return 'Erledigt: ' + kurz(s2, 40); });
        if (neu) vor.push(neu === 1 ? 'Eine neue Idee im Automaten' : neu + ' neue Ideen im Automaten');
        VORLAGEN[0] = vor.length ? vor : ['Eine Idee aufgeschrieben', 'Eine Pause gemacht', 'Jemandem geholfen'];
      }
      var eins = s === 3;
      x += '<label class="igs-nur-sr" for="igsA">' + esc(f.t) + '</label>' + (eins ? '<input type="text" id="igsA" maxlength="140" autocomplete="off" aria-describedby="igsH" placeholder="' + esc(f.ph) + '" value="' + esc(z.a[s]) + '">' : '<textarea id="igsA" maxlength="400" aria-describedby="igsH" placeholder="' + esc(f.ph) + '">' + esc(z.a[s]) + '</textarea>');
      var vl = VORLAGEN[s] || [];
      if (vl.length) x += '<div class="igs-chips" role="group" aria-label="Vorschläge zum Antippen">' + vl.map(function (c) { return '<button type="button" data-chip="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
      return x;
    }
    function zusammenfassung() {
      var ideeText = z.idee ? textVon(z.idee) : '', zt = z.ziel ? textVon(z.ziel) : '';
      var zeilen = [['🌞 Lief gut', z.a[0]], ['🪨 Bleibt hängen', z.a[1]], ['↩️ Zurückgeholt', ideeText ? kurz(ideeText, 90) : ''], ['👣 Nächster Schritt', z.a[3] ? z.a[3] + (zt ? ' (für «' + kurz(zt, 40) + '»)' : '') : ''], ['🎈 Vorfreude', z.a[4]]].filter(function (r) { return r[1]; });
      return '<span class="igs-chip">' + (z.alt ? 'Deine Woche' : 'Geschafft') + '</span><img src="wm/maskottchen.jpg" alt="" width="84" height="84"><h3 id="igsF" tabindex="-1">' + (z.alt ? 'Dein Rückblick' : 'Schöne Woche!') + '</h3>' +
        (z.coins ? '<span class="igs-muenze"><span aria-hidden="true">🪙</span>+' + z.coins + ' Coins</span>' : '<p class="igs-hilfe">' + (z.alt ? 'Die Coins für diese Woche hast du schon bekommen.' : 'Die Coins für diese Woche gab es schon. Danke fürs Hinschauen!') + '</p>') +
        (zeilen.length ? '<ul class="igs-sum">' + zeilen.map(function (r) { return '<li><b>' + esc(r[0]) + '</b>' + esc(kurz(r[1], 160)) + '</li>'; }).join('') + '</ul>' : '<p class="igs-hilfe">Diesmal ohne Notizen. Auch Hinschauen zählt.</p>') +
        (z.a[3] && !z.alt ? '<p class="igs-hilfe">Dein Schritt steht ' + (morgen() <= tage()[6] ? 'für morgen' : 'für Montag') + ' im Wochenplan.</p>' : '');
    }
    function malen(richtung) {
      var s = z.s;
      o.querySelectorAll('.igs-punkte i').forEach(function (p, k) { p.className = (k < s || s === 5 ? 'an' : '') + (k === s ? ' an jetzt' : ''); });
      var neu = d.createElement('article'); neu.className = 'igs-karte' + (s === 5 ? ' igs-ende' : '') + (richtung && !RUHIG ? (richtung > 0 ? ' rein-r' : ' rein-l') : '');
      neu.innerHTML = inhalt(s);
      if (karteEl) karteEl.remove();
      buehne.appendChild(neu); karteEl = neu;
      if (richtung && !RUHIG) { void neu.offsetWidth; neu.classList.remove('rein-r', 'rein-l'); }
      neu.addEventListener('pointerdown', ziehen);
      zur.hidden = s === 0 || s === 5;
      tipp.hidden = s === 5;
      knopfText();
      sr.textContent = s === 5 ? 'Zusammenfassung' : 'Frage ' + (s + 1) + ' von 5';
      var hh = neu.querySelector('#igsF'); if (hh) try { hh.focus({ preventScroll: true }); } catch (e) {}
    }
    function knopfText() {
      var s = z.s;
      if (s === 5) { los.textContent = 'Fertig'; return; }
      if (s === 2) { los.textContent = z.idee ? 'Zurückholen und weiter' : z.idee === '' || !geparkt().length ? 'Weiter' : 'Überspringen'; return; }
      var leer = !String(z.a[s] || '').trim();
      los.textContent = s === 4 ? (leer ? 'Überspringen und abschliessen' : 'Abschliessen') : leer ? 'Überspringen' : 'Weiter';
    }
    function weiter() {
      if (z.s === 5) return schliessen();
      if (z.s === 4) { abschliessen(); return; }
      z.s++; entwurf(); summ(6); malen(1);
    }
    function zurueck() { if (z.s <= 0 || z.s === 5) return; z.s--; entwurf(); malen(-1); }
    function abschliessen() {
      var v2 = daten(), pl;
      if (z.idee && v2.ids[z.idee]) { holen(z.idee); v2 = daten(); }
      var schritt = String(z.a[3] || '').trim();
      z.ziel = schritt ? zielIdee() : null;
      if (schritt && z.ziel) {
        pl = plan(); pl[z.ziel] = { schritt: schritt.slice(0, 140), tag: morgen(), fertig: false }; leg(PLAN, pl);
        var br = hol('r7_cm_brett', {}) || {}; if (!br[z.ziel]) { br[z.ziel] = 1; leg('r7_cm_brett', br); }
      }
      var schon = v2.rueck[w] && v2.rueck[w].coins;
      z.coins = 0;
      if (!schon) { try { if (window.CMKasse && CMKasse.bonus('Sonntags-Rückblick: Woche angeschaut', BONUS)) z.coins = BONUS; } catch (e) {} }
      v2.wochen[w] = 'fertig';
      v2.rueck[w] = { datum: heute(), a: z.a.map(function (t) { return String(t || '').slice(0, 400); }), idee: z.idee || null, ziel: z.ziel || null, coins: schon || z.coins };
      delete v2.entwurf; leg(KEY, v2);
      z.s = 5; malen(1); summ([10, 40, 10]);
      planNeu(); zeig();
    }
    function schliessen() {
      if (z.s < 5) entwurf();
      d.removeEventListener('keydown', taste, true);
      o.remove(); offen = null; d.documentElement.classList.remove('igs-offen');
      if (z.s === 5 && !z.alt) feier(z.coins ? 'Rückblick fertig: +' + z.coins + ' Coins. Schöne Woche!' : 'Rückblick fertig. Schöne Woche!');
      try { if (vorher && vorher.focus && d.contains(vorher)) vorher.focus({ preventScroll: true }); } catch (e) {}
      try { if (window.CMIrgendwann.beimZu) window.CMIrgendwann.beimZu(); } catch (e) {}
    }
    function ziehen(e) {
      if (z.s === 5 || e.target.closest('textarea,input,button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      var k = e.currentTarget, x0 = e.clientX, y0 = e.clientY, dx = 0, an = false;
      function mv(ev) {
        var mx = ev.clientX - x0, my = ev.clientY - y0;
        if (!an) { if (Math.abs(my) > 12 && Math.abs(my) > Math.abs(mx)) return ende(); if (Math.abs(mx) > 10) { an = true; k.classList.add('zieht'); } else return; }
        dx = mx; if (dx > 0 && z.s === 0) dx = dx * 0.25;
        k.style.transform = 'translateX(' + dx + 'px) rotate(' + (RUHIG ? 0 : dx * 0.03) + 'deg)';
      }
      function hoch() {
        ende(); k.classList.remove('zieht'); k.style.transform = '';
        if (!an) return;
        var g = Math.min(110, buehne.clientWidth * 0.28);
        if (dx < -g) weiter(); else if (dx > g) zurueck();
      }
      function ende() { d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', hoch); d.removeEventListener('pointercancel', hoch); }
      d.addEventListener('pointermove', mv); d.addEventListener('pointerup', hoch); d.addEventListener('pointercancel', hoch);
    }
    function taste(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); schliessen(); return; }
      if (e.key === 'Tab') {
        var f = [].slice.call(o.querySelectorAll('button:not([hidden]),textarea,input')).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        var a = f[0], b = f[f.length - 1];
        if (e.shiftKey && d.activeElement === a) { e.preventDefault(); b.focus(); } else if (!e.shiftKey && d.activeElement === b) { e.preventDefault(); a.focus(); }
      }
    }
    d.addEventListener('keydown', taste, true);
    o.addEventListener('input', function (e) { if (e.target.id === 'igsA') { z.a[z.s] = e.target.value; knopfText(); entwurf(); } });
    o.addEventListener('click', function (e) {
      if (e.target.closest('.igs-zu')) return schliessen();
      if (e.target.closest('.igs-los')) return weiter();
      if (e.target.closest('.igs-zur')) return zurueck();
      var c = e.target.closest('[data-chip]');
      if (c) {
        var a = o.querySelector('#igsA'); if (!a) return;
        var t = c.getAttribute('data-chip'), alt = a.value.trim();
        a.value = z.s === 3 ? t : (alt ? alt + (/[.!?]$/.test(alt) ? ' ' : '. ') + t : t);
        z.a[z.s] = a.value; knopfText(); entwurf(); summ(6);
        try { a.focus({ preventScroll: true }); } catch (x) {}
        return;
      }
      var ib = e.target.closest('[data-idee]');
      if (ib) {
        var id = ib.getAttribute('data-idee');
        z.idee = z.idee === id ? null : id;
        if (z.idee) z.a[2] = z.idee ? kurz(textVon(z.idee), 140) : ''; else z.a[2] = '';
        o.querySelectorAll('[data-idee]').forEach(function (x) { x.setAttribute('aria-checked', String(x.getAttribute('data-idee') === z.idee)); });
        knopfText(); entwurf(); summ(6);
      }
    });
    malen(0);
  }

  /* ---------- Wisch-Karten (inhalt/wischen-app.js) ---------- */
  var sitzung = { geholt: 0, gelassen: 0 };
  function stapelKarten() {
    return sortiert().map(function (x, k) {
      var i = x.i, g = k === 0 ? grund(x) : null;
      return { id: 'ig:' + i.id, e: g ? g.e : '💡', chip: g ? 'Vorschlag · ' + g.t : 'Irgendwann · ' + seitText(x.tage), titel: kurz(i.text, 120), text: (i.coins || 0) + ' Coins · ' + (istMag(i.id) ? '❤️ magst du' : 'tippen: ganz lesen'), art: 'inhalt',
        mag: function () { if (holen(i.id)) { sitzung.geholt++; zeig(); } },
        weiter: function () { lassen(i.id); sitzung.gelassen++; },
        istMag: function () { return false; },
        seiten: function () {
          return [{ e: '💡', chip: 'Irgendwann · ' + seitText(x.tage), titel: 'Deine Idee', text: i.text },
            { ende: true, e: '↩️', titel: 'Ist sie jetzt dran?', text: 'Zurückholen bringt sie auf die aktive Liste. Mit ❤️ merkt sich die App, dass sie dir gefällt.',
              knoepfe: [{ t: '↩️ Zurückholen', primaer: true, fn: function () { if (holen(i.id)) { sitzung.geholt++; zeig(); feier('Zurückgeholt. Diese Idee ist wieder dran.'); } try { Wischen.zurueck(); } catch (e) {} } },
                { t: '🤍 Mag ich', tAn: '❤️ Mag ich', an: function () { return istMag(i.id); }, fn: function () { magUm(i.id); zeig(); } }] }];
        } };
    });
  }
  window.CMIrgendwann.wochenende = wochenende;
  window.CMIrgendwann.stapel = function () {
    var n = geparkt().length, vs = vorschlag();
    return { id: 'irgendwann', art: 'bereich', e: '📦', bild: 'wm/maskottchen.jpg', chip: n ? n + ' warten' : 'Irgendwann', titel: 'Irgendwann',
      text: n ? 'Rechts wischen: zurückholen. Links: liegen lassen.' + (vs ? ' Vorschlag: «' + kurz(vs.i.text, 40) + '»' : '') : 'Hier parkst du Ideen, die gerade nicht dran sind. Die aktive Liste bleibt klein.',
      wort: { mag: 'Zurückholen', magE: '↩️', weiter: 'Liegen lassen', tippen: 'tippen: ganz lesen', oeffnen: 'Lesen', oeffnenE: '👀' },
      karten: function () { sitzung = { geholt: 0, gelassen: 0 }; return stapelKarten(); },
      auffrischen: function () { return stapelKarten(); },
      ende: function () {
        var leer = !sitzung.geholt && !sitzung.gelassen;
        return { e: '📦', titel: leer ? 'Bei Irgendwann liegt nichts' : 'Alles durchgesehen',
          text: leer ? 'Schieb auf der Seite eine Idee nach links, dann wartet sie hier.' : (sitzung.geholt === 1 ? 'Eine Idee' : sitzung.geholt + ' Ideen') + ' zurückgeholt, ' + sitzung.gelassen + ' liegen weiter.',
          knoepfe: [{ t: '⭐ Sonntags-Rückblick', primaer: true, fn: function () { rueckblick(); } }, { t: '✕ Zurück', fn: function () { try { Wischen.zurueck(); } catch (e) {} } }] };
      } };
  };
  window.CMIrgendwann.rueckKarte = function () {
    var fertig = !!daten().rueck[woche()];
    return { id: 'rueckblick', art: 'bereich', e: '⭐', chip: fertig ? '✓ diese Woche gemacht' : 'Wochenende', titel: 'Sonntags-Rückblick',
      text: fertig ? 'Deine Woche in fünf Antworten. Tippen und ansehen.' : '5 kurze Fragen, eine pro Karte. Am Ende +' + BONUS + ' Coins.',
      los: function () { rueckblick(fertig); }, drueber: true };
  };

  /* ---------- Start ---------- */
  function bauen() {
    if (d.getElementById('cmIdeen')) return true;
    var anker = d.getElementById('r8Plan'); if (!anker) return false;
    rueckKarte = d.createElement('section'); rueckKarte.className = 'r8-plan'; rueckKarte.id = 'cmRueck'; rueckKarte.setAttribute('aria-labelledby', 'cmRueckH'); rueckKarte.hidden = true;
    karte = d.createElement('section'); karte.className = 'r8-plan'; karte.id = 'cmIdeen'; karte.setAttribute('aria-labelledby', 'cmIdeenH');
    anker.parentNode.insertBefore(rueckKarte, anker);
    anker.parentNode.insertBefore(karte, anker.nextSibling);
    karte.addEventListener('click', klick); rueckKarte.addEventListener('click', klick);
    karte.addEventListener('pointerdown', wischen);
    zeig();
    /* neue Idee aus dem Automaten oder Änderungen in anderen Tabs */
    window.addEventListener('storage', function (e) { if (!e.key || e.key === 'coinmaker.v1' || e.key === KEY) zeig(); });
    var pull = d.getElementById('pull'); if (pull) pull.addEventListener('click', function () { setTimeout(zeig, 2600); });
    return true;
  }
  var versuche = 0;
  (function warte() { if (bauen() || ++versuche > 40) return; setTimeout(warte, 150); })();
  window.CMIrgendwann.rueckblick = function (ansehen) { rueckblick(!!ansehen); };
  window.CMIrgendwann.vorschlag = vorschlag;
})();
