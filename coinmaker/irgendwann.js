/* irgendwann.js – «Irgendwann»-Liste und geführter Wochen-Rückblick für den Coin Maker (22.10.2026)
   - Karte «Deine Ideen» unter dem Wochenplan: jede Idee aus dem Kassenbuch lässt sich auf «Irgendwann»
     schieben (Knopf oder nach links wischen), mit Rückgängig. Von dort jederzeit zurückholen.
   - Einmal pro Woche erscheint die Karte «Wochen-Rückblick» mit drei Schritten:
     1. Erledigtes feiern (erledigte Schritte aus dem Wochenplan, neue Ideen der Woche)
     2. Irgendwann durchsehen und eine Idee zurückholen (freiwillig)
     3. Den nächsten Schritt für die Woche wählen: landet direkt im bestehenden Wochenplan.
   - Liest «coinmaker.v1» (Kassenbuch) nur. Schreibt «coinmaker.irgendwann» und den Wochenplan
     («r7_cm_r8plan», gleiches Format wie runde8.js). Alles in try/catch, nur auf diesem Gerät. */
(function () {
  'use strict';
  if (window.__cmIrgendwann) return; window.__cmIrgendwann = true;
  var d = document, KEY = 'coinmaker.irgendwann', PLAN = 'r7_cm_r8plan';
  var KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], LANG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  /* ---------- Speicher ---------- */
  function hol(k, def) { try { var v = localStorage.getItem(k); if (v === null) return def; var x = JSON.parse(v); return x && typeof x === 'object' ? x : def; } catch (e) { return def; } }
  function leg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function daten() { var v = hol(KEY, {}); if (!v.ids || typeof v.ids !== 'object') v.ids = {}; if (!v.wochen || typeof v.wochen !== 'object') v.wochen = {}; return v; }
  function ideen() { var s = hol('coinmaker.v1', { items: [] }); return (Array.isArray(s.items) ? s.items : []).filter(function (i) { return i && !i.ex && i.type === 'idee' && i.text; }); }
  function plan() { return hol(PLAN, {}); }

  /* ---------- Hilfen ---------- */
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function kurz(t, n) { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; }
  function ymd(t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }
  function heute() { return ymd(new Date()); }
  function tage() { var m = new Date(); m.setHours(12, 0, 0, 0); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); var l = []; for (var i = 0; i < 7; i++) { var x = new Date(m); x.setDate(m.getDate() + i); l.push(ymd(x)); } return l; }
  function woche() { return tage()[0]; }
  function R() { return window.R7K || null; }
  function feier(t) { try { if (R()) R().feier(t); } catch (e) {} }
  function summ(n) { try { if (window.R8K && R8K.summ) R8K.summ(n); } catch (e) {} }
  function planNeu() { try { if (window.CMPlan && CMPlan.zeig) CMPlan.zeig(); } catch (e) {} }
  function ist(id) { return !!daten().ids[id]; }

  /* Für runde8.js: Ideen auf «Irgendwann» erscheinen nicht in «Vom Einfall zum Plan» */
  window.CMIrgendwann = { ist: ist };

  function ic(p) { return '<svg class="ig-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + '</svg>'; }
  var I = {
    spaeter: '<path d="M4 7.5h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M3 4h18v3.5H3zM10 12h4"/>',
    holen: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    stern: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    haken: '<path d="M20 6L9 17l-5-5"/>',
    bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    kal: '<rect x="3" y="4" width="18" height="18" rx="2.5"/><path d="M16 2v4M8 2v4M3 10h18"/>'
  };

  /* ---------- Stil (Notizbuch-Look aus markt.css) ---------- */
  var css = [
    '.ig-ic{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
    '#cmIdeen h2,#cmRueck h2{display:flex;align-items:center;gap:8px}',
    '#cmIdeen h2 .ig-ic,#cmRueck h2 .ig-ic{width:20px;height:20px;color:var(--m-accent-ink,#3f4ac0)}',
    '.ig-liste{list-style:none;margin:0 0 8px;padding:0;display:grid;gap:6px}',
    '.ig-zeile{position:relative;overflow:hidden;border-radius:10px;background:var(--m-surface2,#f6f6f4)}',
    '.ig-zeile .ig-hinter{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-end;gap:6px;padding:0 14px;background:var(--m-soft,#eef0fc);color:var(--m-accent-ink,#3f4ac0);font-size:.875rem;font-weight:600}',
    '.ig-zeile .ig-vorne{position:relative;display:flex;align-items:center;gap:10px;min-height:52px;padding:6px 6px 6px 12px;background:var(--m-surface2,#f6f6f4);touch-action:pan-y;transition:transform .2s cubic-bezier(.2,.7,.2,1)}',
    '.ig-zeile.zieht .ig-vorne{transition:none}',
    '.ig-zeile p{flex:1;min-width:0;margin:0;font-size:.9375rem;line-height:1.35;color:var(--m-ink,#1f1f1e);overflow-wrap:anywhere}',
    '.ig-zeile p small{display:block;font-size:.75rem;color:var(--m-ink2,#55534e)}',
    '.ig-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:none;min-height:44px;min-width:44px;padding:0 12px;border-radius:999px;border:1px solid var(--m-line2,#d7d5cf);background:var(--m-surface,#fff);color:var(--m-ink,#1f1f1e);font:600 .875rem var(--m-font-body,inherit);cursor:pointer}',
    '.ig-btn.an{background:var(--m-accent,#4c58d0);border-color:var(--m-accent,#4c58d0);color:var(--m-on-accent,#fff)}',
    '.ig-rueck{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px;padding:8px 8px 8px 12px;border-radius:10px;background:var(--m-soft,#eef0fc);color:var(--m-ink,#1f1f1e);font-size:.875rem}',
    '.ig-rueck span{min-width:0;overflow-wrap:anywhere}',
    '#cmIdeen details{margin-top:6px;border-top:1px solid var(--m-line,#e9e8e4);padding-top:6px}',
    '#cmIdeen summary{min-height:44px;display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600;color:var(--m-ink,#1f1f1e)}',
    '#cmIdeen .ig-mehr{font-size:.8125rem;color:var(--m-ink2,#55534e);margin:4px 0 8px}',
    '#cmRueck{border-left:3px solid var(--m-accent,#4c58d0)}',
    '#cmRueck .r7-reihe{display:flex;flex-wrap:wrap;gap:8px}',
    '.ig-schritte{display:flex;gap:6px;margin:0 0 12px}',
    '.ig-schritte i{flex:1;height:4px;border-radius:2px;background:var(--m-line,#e9e8e4)}',
    '.ig-schritte i.an{background:var(--m-accent,#4c58d0)}',
    '.ig-blatt h3{margin:4px 0 6px;font-size:1.0625rem}',
    '.ig-blatt .ig-erledigt{list-style:none;margin:0 0 12px;padding:0;display:grid;gap:6px}',
    '.ig-blatt .ig-erledigt li{display:flex;gap:8px;align-items:flex-start;padding:8px 10px;border-radius:10px;background:var(--m-surface2,#f6f6f4);font-size:.9375rem;line-height:1.35}',
    '.ig-blatt .ig-erledigt li .ig-ic{color:#1f7a4a;margin-top:1px}',
    '.ig-blatt .ig-wahl{display:grid;gap:6px;margin:0 0 12px}',
    '.ig-blatt .ig-wahl button{display:flex;align-items:center;gap:10px;width:100%;min-height:48px;padding:8px 12px;border-radius:10px;border:1px solid var(--m-line,#e9e8e4);background:var(--m-surface,#fff);color:var(--m-ink,#1f1f1e);font:500 .9375rem var(--m-font-body,inherit);text-align:left;cursor:pointer}',
    '.ig-blatt .ig-wahl button[aria-checked=true]{border-color:var(--m-accent,#4c58d0);background:var(--m-soft,#eef0fc);box-shadow:0 0 0 1px var(--m-accent,#4c58d0)}',
    '.ig-blatt .ig-wahl button .ig-ic{color:var(--m-accent-ink,#3f4ac0)}',
    '.ig-blatt .ig-wahl button span{flex:1;min-width:0;overflow-wrap:anywhere}',
    '.ig-blatt label{display:block;font-weight:600;font-size:.875rem;margin:4px 0}',
    '.ig-blatt input[type=text]{width:100%;min-height:48px;border-radius:10px;border:1px solid var(--m-line2,#d7d5cf);background:var(--m-surface,#fff);color:var(--m-ink,#1f1f1e);font:16px var(--m-font-body,inherit);padding:0 12px}',
    '.ig-blatt .ig-tage{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 12px}',
    '.ig-blatt .ig-tage button{min-width:44px;min-height:44px;border-radius:10px;border:1px solid var(--m-line,#e9e8e4);background:var(--m-surface,#fff);color:var(--m-ink,#1f1f1e);font:700 .875rem var(--m-font-body,inherit);cursor:pointer}',
    '.ig-blatt .ig-tage button[aria-pressed=true]{background:var(--m-accent,#4c58d0);color:var(--m-on-accent,#fff);border-color:var(--m-accent,#4c58d0)}',
    '.ig-blatt .ig-tage button:disabled{opacity:.4;cursor:not-allowed}',
    '.ig-blatt .ig-fehler{color:#9a3b00;font-size:.875rem;min-height:1.2em;margin:0 0 8px}',
    '.ig-blatt .r7-reihe{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}',
    '@media (prefers-reduced-motion:reduce){.ig-zeile .ig-vorne{transition:none}}'
  ].join('\n');
  var st = d.createElement('style'); st.id = 'cmIrgendwannCss'; st.textContent = css; (d.head || d.documentElement).appendChild(st);

  /* ---------- Karte «Deine Ideen» ---------- */
  var karte, rueckKarte, letzte = null;
  function verschieben(id, aufIrgendwann) {
    var v = daten();
    if (aufIrgendwann) {
      v.ids[id] = heute();
      /* geplanten Schritt dieser Idee aus dem Wochenplan nehmen, aber merken (für Rückgängig) */
      var p = plan(), alt = p[id] ? JSON.parse(JSON.stringify(p[id])) : null;
      if (p[id] && p[id].tag && !p[id].fertig) { p[id].tag = null; leg(PLAN, p); }
      letzte = { id: id, plan: alt };
    } else { delete v.ids[id]; if (letzte && letzte.id === id) letzte = null; }
    leg(KEY, v); planNeu();
  }
  function zeig(fokus) {
    if (!karte) return;
    var alle = ideen().slice().reverse(), v = daten(), aktiv = alle.filter(function (i) { return !v.ids[i.id]; }), spaeter = alle.filter(function (i) { return v.ids[i.id]; });
    var brett = hol('r7_cm_brett', {});
    aktiv = aktiv.filter(function (i) { return brett[i.id] !== 2; });
    var h = '<h2 id="cmIdeenH">' + ic(I.bulb) + 'Deine Ideen</h2>';
    h += '<p>Nicht alles muss jetzt sein. Schieb eine Idee auf «Irgendwann» (Knopf oder nach links wischen). Sie bleibt sicher liegen.</p>';
    if (letzte) {
      var li = alle.filter(function (i) { return i.id === letzte.id; })[0];
      h += '<div class="ig-rueck" role="status"><span>«' + esc(kurz(li ? li.text : '', 50)) + '» liegt jetzt bei Irgendwann.</span><button type="button" class="ig-btn" data-ig="undo">' + ic(I.holen) + 'Rückgängig</button></div>';
    }
    if (!alle.length) h += '<p class="leer">Noch keine eigene Idee. Leg eine Idee in den Automaten und zieh am Hebel.</p>';
    else if (!aktiv.length) h += '<p class="leer">Gerade keine offene Idee. Alles ist umgesetzt oder wartet bei Irgendwann.</p>';
    else h += '<ul class="ig-liste" aria-label="Offene Ideen">' + aktiv.slice(0, 8).map(function (i) {
      return '<li class="ig-zeile" data-id="' + esc(i.id) + '"><div class="ig-hinter" aria-hidden="true">' + ic(I.spaeter) + 'Irgendwann</div><div class="ig-vorne"><p>' + esc(kurz(i.text, 110)) + '<small>' + esc(i.day || '') + ' · ' + (i.coins || 0) + ' Coins</small></p>' +
        '<button type="button" class="ig-btn" data-ig="weg" data-id="' + esc(i.id) + '" aria-label="Auf Irgendwann schieben: ' + esc(kurz(i.text, 60)) + '">' + ic(I.spaeter) + '<span>Irgendwann</span></button></div></li>';
    }).join('') + '</ul>' + (aktiv.length > 8 ? '<p class="ig-mehr">… und ' + (aktiv.length - 8) + ' weitere im Ideen-Brett.</p>' : '');
    h += '<details' + (fokus === 'liste' ? ' open' : '') + '><summary>' + ic(I.spaeter) + 'Irgendwann (' + spaeter.length + ')</summary>' +
      (spaeter.length ? '<ul class="ig-liste">' + spaeter.map(function (i) {
        return '<li class="ig-zeile"><div class="ig-vorne"><p>' + esc(kurz(i.text, 110)) + '<small>seit ' + esc(v.ids[i.id]) + '</small></p><button type="button" class="ig-btn" data-ig="holen" data-id="' + esc(i.id) + '" aria-label="Zurückholen: ' + esc(kurz(i.text, 60)) + '">' + ic(I.holen) + '<span>Zurückholen</span></button></div></li>';
      }).join('') + '</ul>' : '<p class="ig-mehr">Noch leer. Hier wartet, was gerade nicht dran ist.</p>') + '</details>';
    karte.innerHTML = h;
    if (fokus && fokus !== 'liste') { var f = karte.querySelector(fokus); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }
    zeigRueckKarte();
  }

  /* Wischen nach links */
  function wischen(e) {
    var z = e.target.closest('.ig-zeile[data-id]'); if (!z || e.target.closest('button') || e.pointerType === 'mouse' && e.button !== 0) return;
    var v = z.querySelector('.ig-vorne'), x0 = e.clientX, y0 = e.clientY, dx = 0, los = false;
    function mv(ev) {
      var mx = ev.clientX - x0, my = ev.clientY - y0;
      if (!los) { if (Math.abs(my) > 10 && Math.abs(my) > Math.abs(mx)) return ende(true); if (mx < -8) { los = true; z.classList.add('zieht'); } else return; }
      dx = Math.min(0, mx); v.style.transform = 'translateX(' + dx + 'px)';
    }
    function hoch() {
      if (los && dx < -Math.min(110, z.offsetWidth * 0.35)) { v.style.transform = 'translateX(-100%)'; summ(8); setTimeout(function () { verschieben(z.dataset.id, true); zeig('[data-ig=undo]'); }, 160); }
      else v.style.transform = '';
      ende();
    }
    function ende(abbruch) { z.classList.remove('zieht'); if (abbruch) v.style.transform = ''; d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', hoch); d.removeEventListener('pointercancel', hoch); }
    d.addEventListener('pointermove', mv); d.addEventListener('pointerup', hoch); d.addEventListener('pointercancel', hoch);
  }

  function klick(e) {
    var b = e.target.closest('[data-ig]'); if (!b) return;
    var w = b.getAttribute('data-ig'), id = b.getAttribute('data-id');
    if (w === 'weg') { verschieben(id, true); summ(8); zeig('[data-ig=undo]'); }
    else if (w === 'holen') { verschieben(id, false); letzte = null; summ(8); zeig('#cmIdeenH'); feier('Zurückgeholt. Diese Idee ist wieder dran.'); }
    else if (w === 'undo' && letzte) {
      var v = daten(); delete v.ids[letzte.id]; leg(KEY, v);
      if (letzte.plan) { var p = plan(); p[letzte.id] = letzte.plan; leg(PLAN, p); }
      letzte = null; planNeu(); zeig('#cmIdeenH');
    }
    else if (w === 'rueckblick') rueckblick();
    else if (w === 'spaeter') { var v2 = daten(); v2.wochen[woche()] = 'uebersprungen'; leg(KEY, v2); zeigRueckKarte(); }
  }

  /* ---------- Wochen-Rückblick ---------- */
  function zeigRueckKarte() {
    if (!rueckKarte) return;
    var v = daten(), w = woche(), status = v.wochen[w];
    var hatWas = ideen().length > 0;
    if (status || !hatWas) { rueckKarte.hidden = true; return; }
    rueckKarte.hidden = false;
    var p = plan(), t = tage(), erledigt = Object.keys(p).filter(function (k) { return p[k] && p[k].fertig && t.indexOf(p[k].tag) >= 0; }).length;
    rueckKarte.innerHTML = '<h2 id="cmRueckH">' + ic(I.stern) + 'Wochen-Rückblick</h2>' +
      '<p>Drei kurze Schritte, etwa fünf Minuten: feiern, was geklappt hat' + (erledigt ? ' (' + erledigt + (erledigt === 1 ? ' Schritt' : ' Schritte') + ' erledigt)' : '') + ', bei «Irgendwann» eine Idee zurückholen und den nächsten Schritt für die Woche wählen.</p>' +
      '<div class="r7-reihe"><button type="button" class="r7-knopf" data-ig="rueckblick">Rückblick starten</button><button type="button" class="r7-knopf leise" data-ig="spaeter">Diese Woche nicht</button></div>';
  }

  function rueckblick() {
    var K = R(); if (!K || !K.blatt) return;
    var t = tage(), h = heute(), p = plan(), alle = ideen(), byId = {}; alle.forEach(function (i) { byId[i.id] = i; });
    var zustand = { schritt: 1, geholt: null, idee: null, tag: null, text: '' };
    var inh = K.blatt({ titel: 'Wochen-Rückblick', bild: 'wm/maskottchen.jpg', html: '<div class="ig-blatt"></div>' });
    var box = inh.querySelector('.ig-blatt');
    function balken(n) { return '<div class="ig-schritte" aria-hidden="true"><i class="an"></i><i' + (n > 1 ? ' class="an"' : '') + '></i><i' + (n > 2 ? ' class="an"' : '') + '></i></div><p class="r7-klein" style="margin:0 0 4px">Schritt ' + n + ' von 3</p>'; }
    function malen() {
      var v = daten(), s = zustand.schritt, x = '';
      if (s === 1) {
        var fertig = Object.keys(p).filter(function (k) { return p[k] && p[k].fertig && t.indexOf(p[k].tag) >= 0; });
        var neu = alle.filter(function (i) { return t.indexOf(i.day) >= 0; });
        x = balken(1) + '<h3 id="igS" tabindex="-1">Das hast du geschafft</h3>';
        if (fertig.length) x += '<ul class="ig-erledigt">' + fertig.map(function (k) { return '<li>' + ic(I.haken) + '<span>' + esc(p[k].schritt) + '</span></li>'; }).join('') + '</ul>';
        x += '<p>' + (fertig.length ? (fertig.length === 1 ? 'Ein Schritt' : fertig.length + ' Schritte') + ' erledigt' : 'Diese Woche war ruhig im Wochenplan. Auch das zählt: Pausen gehören zur Werkstatt.') +
          (neu.length ? ' · ' + (neu.length === 1 ? 'eine neue Idee' : neu.length + ' neue Ideen') + ' im Automaten.' : '.') + '</p>' +
          '<div class="r7-reihe"><button type="button" class="r7-knopf" data-rb="weiter">Weiter</button></div>';
      } else if (s === 2) {
        var sp = alle.filter(function (i) { return v.ids[i.id]; });
        x = balken(2) + '<h3 id="igS" tabindex="-1">Irgendwann durchsehen</h3>';
        if (sp.length) {
          x += '<p>Ist eine dieser Ideen jetzt dran? Hol höchstens eine zurück. Der Rest darf warten.</p><div class="ig-wahl" role="radiogroup" aria-labelledby="igS">' + sp.map(function (i) {
            return '<button type="button" role="radio" data-holen="' + esc(i.id) + '" aria-checked="' + (zustand.geholt === i.id) + '">' + ic(I.holen) + '<span>' + esc(kurz(i.text, 90)) + '</span></button>';
          }).join('') + '</div>';
        } else x += '<p>Bei «Irgendwann» liegt gerade nichts. Gut so.</p>';
        x += '<div class="r7-reihe"><button type="button" class="r7-knopf" data-rb="weiter">' + (zustand.geholt ? 'Zurückholen und weiter' : sp.length ? 'Keine zurückholen, weiter' : 'Weiter') + '</button><button type="button" class="r7-knopf leise" data-rb="zurueck">Zurück</button></div>';
      } else if (s === 3) {
        var aktiv = alle.filter(function (i) { return !daten().ids[i.id]; }).reverse();
        if (!zustand.idee) zustand.idee = zustand.geholt || (aktiv[0] && aktiv[0].id) || null;
        var e = zustand.idee && p[zustand.idee] || {};
        if (!zustand.text && e.schritt && !e.fertig) zustand.text = e.schritt;
        x = balken(3) + '<h3 id="igS" tabindex="-1">Dein nächster Schritt</h3>';
        if (!aktiv.length) x += '<p>Gerade gibt es keine offene Idee. Leg eine neue in den Automaten, dann planen wir den ersten Schritt.</p><div class="r7-reihe"><button type="button" class="r7-knopf" data-rb="fertig">Rückblick abschliessen</button></div>';
        else {
          x += '<p>Welche Idee bekommt diese Woche einen kleinen Schritt (etwa 15 Minuten)?</p><div class="ig-wahl" role="radiogroup" aria-label="Idee wählen">' + aktiv.slice(0, 6).map(function (i) {
            return '<button type="button" role="radio" data-idee="' + esc(i.id) + '" aria-checked="' + (zustand.idee === i.id) + '">' + ic(I.bulb) + '<span>' + esc(kurz(i.text, 90)) + '</span></button>';
          }).join('') + '</div>' +
            '<label for="igText">Nächster Schritt</label><input type="text" id="igText" maxlength="140" autocomplete="off" placeholder="z. B. 3 Familien fragen, ob sie das nutzen würden" value="' + esc(zustand.text) + '">' +
            '<div class="ig-tage" role="group" aria-label="Tag in dieser Woche">' + t.map(function (x2, k) { return '<button type="button" data-tag="' + x2 + '" aria-pressed="' + (zustand.tag === x2) + '"' + (x2 < h ? ' disabled' : '') + ' aria-label="' + LANG[k] + (x2 === h ? ', heute' : '') + '">' + KURZ[k] + '</button>'; }).join('') + '</div>' +
            '<p class="ig-fehler" role="alert"></p>' +
            '<div class="r7-reihe"><button type="button" class="r7-knopf" data-rb="fertig">' + ic(I.kal) + 'In den Wochenplan</button><button type="button" class="r7-knopf leise" data-rb="zurueck">Zurück</button></div>';
        }
      }
      box.innerHTML = x;
      var hh = box.querySelector('#igS'); if (hh) try { hh.focus({ preventScroll: true }); } catch (er) {}
    }
    box.addEventListener('input', function (e) { if (e.target.id === 'igText') zustand.text = e.target.value; });
    box.addEventListener('click', function (e) {
      var hb = e.target.closest('[data-holen]'); if (hb) { zustand.geholt = zustand.geholt === hb.dataset.holen ? null : hb.dataset.holen; box.querySelectorAll('[data-holen]').forEach(function (x) { x.setAttribute('aria-checked', String(x.dataset.holen === zustand.geholt)); }); var wb = box.querySelector('[data-rb=weiter]'); if (wb) wb.textContent = zustand.geholt ? 'Zurückholen und weiter' : 'Keine zurückholen, weiter'; return; }
      var ib = e.target.closest('[data-idee]'); if (ib) { zustand.idee = ib.dataset.idee; var pe = p[zustand.idee] || {}; zustand.text = pe.schritt && !pe.fertig ? pe.schritt : ''; var inp = box.querySelector('#igText'); if (inp) inp.value = zustand.text; box.querySelectorAll('[data-idee]').forEach(function (x) { x.setAttribute('aria-checked', String(x.dataset.idee === zustand.idee)); }); return; }
      var tb = e.target.closest('[data-tag]'); if (tb && !tb.disabled) { zustand.tag = zustand.tag === tb.dataset.tag ? null : tb.dataset.tag; box.querySelectorAll('[data-tag]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.tag === zustand.tag)); }); return; }
      var b = e.target.closest('[data-rb]'); if (!b) return;
      var w = b.dataset.rb;
      if (w === 'zurueck') { zustand.schritt = Math.max(1, zustand.schritt - 1); malen(); return; }
      if (w === 'weiter') {
        if (zustand.schritt === 1) { var anz = Object.keys(p).filter(function (k) { return p[k] && p[k].fertig && t.indexOf(p[k].tag) >= 0; }).length; if (anz) feier('Gefeiert! ' + (anz === 1 ? 'Ein Schritt' : anz + ' Schritte') + ' aus Ideen gemacht.'); }
        if (zustand.schritt === 2 && zustand.geholt) { verschieben(zustand.geholt, false); zustand.idee = zustand.geholt; zustand.text = ''; summ(8); }
        zustand.schritt++; malen(); return;
      }
      if (w === 'fertig') {
        var fe = box.querySelector('.ig-fehler'), inp2 = box.querySelector('#igText');
        if (inp2) {
          var txt = (inp2.value || '').trim();
          if (!txt) { fe.textContent = 'Schreib den nächsten Schritt kurz auf.'; inp2.setAttribute('aria-invalid', 'true'); inp2.focus(); return; }
          if (!zustand.tag) { fe.textContent = 'Wähle einen Tag in dieser Woche.'; var erst = box.querySelector('[data-tag]:not(:disabled)'); if (erst) erst.focus(); return; }
          var pl = plan(); pl[zustand.idee] = { schritt: txt.slice(0, 140), tag: zustand.tag, fertig: false }; leg(PLAN, pl);
          var br = hol('r7_cm_brett', {}); if (!br[zustand.idee]) { br[zustand.idee] = 1; leg('r7_cm_brett', br); }
        }
        var v = daten(); v.wochen[woche()] = 'fertig'; leg(KEY, v);
        try { K.zu(); } catch (er) {}
        planNeu(); zeig(); summ([10, 40, 10]);
        feier(inp2 ? 'Rückblick fertig. Dein Schritt steht im Wochenplan.' : 'Rückblick fertig. Schön, dass du hingeschaut hast.');
        var pk = d.getElementById('r8Plan'); if (pk) try { pk.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (er) {}
      }
    });
    malen();
  }

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
  window.CMIrgendwann.rueckblick = function () { rueckblick(); };
})();
