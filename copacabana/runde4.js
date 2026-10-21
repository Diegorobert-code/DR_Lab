/* Geschenk Lädeli Copacabana – Runde 4 (21.10.2026)
   1) Geschenk-Finder: Für wen? Wozu? Wie viel? Drei Tipps, und das Lädeli zeigt die passenden Geschenke
   2) Wunschzettel: ♡ an jedem Geschenk, als Link teilen (ohne Server, die Liste steckt im Link)
   3) Grusskarte live: die Karte im Korb sieht man so, wie sie beiliegt
   4) Geburtstag merken: Kalender-Erinnerung eine Woche vorher (Datei für den eigenen Kalender)
   5) Feinschliff: grössere Tippflächen, keine zerhackten Wörter, «Im Korb ✓»-Rückmeldung
   Alles nur im Browser, keine Kosten, keine neuen Dienste. */
(function () {
  'use strict';
  if (typeof WAREN === 'undefined' || window.CopaR4) return;
  var $ = function (id) { return document.getElementById(id); };
  function hol(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function summ(m) { try { if (navigator.vibrate) navigator.vibrate(m); } catch (e) {} }
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Wem passt was (Beispiel-Waren; mit echten Produkten hier ergänzen)
  var PASST = {
    kerze: { wer: ['mama', 'freundin', 'kollege'], wozu: ['geburtstag', 'danke', 'einfach'] },
    tuch: { wer: ['freundin', 'mama', 'kind'], wozu: ['geburtstag', 'einfach'] },
    tasse: { wer: ['kollege', 'mama', 'freundin'], wozu: ['danke', 'einfach', 'geburtstag'] },
    armband: { wer: ['kind', 'freundin'], wozu: ['einfach', 'danke', 'geburtstag'] },
    schoggi: { wer: ['kollege', 'kind', 'mama', 'freundin'], wozu: ['danke', 'einfach'] },
    karte: { wer: ['mama', 'freundin', 'kollege', 'kind'], wozu: ['geburtstag', 'danke', 'einfach'] },
    muschel: { wer: ['mama', 'freundin'], wozu: ['danke', 'einfach'] },
    box: { wer: ['mama', 'freundin', 'kind'], wozu: ['geburtstag'] }
  };

  var css = [
    '.filter button{min-height:44px;padding:0 16px;display:inline-flex;align-items:center}',
    '.menge button{width:44px;height:44px;line-height:44px}',
    '.info h3{overflow-wrap:normal;word-break:normal;hyphens:auto;-webkit-hyphens:auto}',
    '.knopf{min-height:44px;display:flex;align-items:center;justify-content:center}',
    '.knopf.drin{background:var(--tuerkis);color:var(--nacht)}',
    '.ware{position:relative}',
    '.herz{all:unset;position:absolute;right:8px;top:8px;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:rgba(27,20,64,.55);cursor:pointer;z-index:2;transition:transform .15s}',
    '.herz:active{transform:scale(.88)}',
    '.herz[aria-pressed=true]{background:rgba(255,122,107,.9)}',
    '.ware.tipp{outline:3px solid var(--gold);outline-offset:2px;box-shadow:0 0 30px rgba(242,184,75,.45)}',
    '.ware.tipp::before{content:"✨ Tipp";position:absolute;left:8px;top:8px;z-index:2;background:var(--gold);color:var(--nacht);font-weight:800;font-size:12px;border-radius:999px;padding:3px 10px}',
    '.r4-karte{background:var(--nacht2);border:1px solid var(--nacht3);border-radius:14px;padding:16px;margin:0 0 16px}',
    '.r4-karte h2{font-family:var(--disp);color:var(--gold2);font-size:20px;margin:0 0 4px}',
    '.r4-karte .hinweis{margin:0 0 8px}',
    '.r4-frage{font-weight:800;margin:12px 0 6px}',
    '.r4-wahl{display:flex;flex-wrap:wrap;gap:8px}',
    '.r4-wahl button{all:unset;cursor:pointer;min-height:44px;padding:0 14px;display:inline-flex;align-items:center;gap:6px;border-radius:999px;background:var(--nacht);border:1px solid var(--nacht3);font-weight:700;font-size:15px}',
    '.r4-wahl button[aria-pressed=true]{background:var(--gold);color:var(--nacht);border-color:var(--gold)}',
    '.r4-reihe{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.r4-reihe .knopf{flex:1;min-width:140px}',
    '.r4-wunsch{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px}',
    '.r4-wunsch span{flex:none;background:var(--nacht);border:1px solid var(--nacht3);border-radius:12px;padding:8px 10px;font-weight:700;font-size:14px}',
    '.postkarte{margin-top:12px;aspect-ratio:3/2;border-radius:10px;padding:14px 16px;color:#3b2d2a;background:linear-gradient(160deg,#fff8ea,#ffe6c4);box-shadow:0 8px 22px rgba(0,0,0,.35);display:flex;flex-direction:column;position:relative;overflow:hidden;transform:rotate(-1deg)}',
    '.postkarte::after{content:"🌴";position:absolute;right:-6px;bottom:-10px;font-size:70px;opacity:.25}',
    '.postkarte .pk-kopf{font-family:var(--disp);font-weight:800;color:#a8547a;font-size:15px}',
    '.postkarte .pk-text{flex:1;font-family:"Segoe Script","Bradley Hand","Snell Roundhand",cursive;font-size:18px;line-height:1.35;white-space:pre-wrap;overflow-wrap:anywhere;margin-top:6px}',
    '.postkarte .pk-text.leer{opacity:.45}',
    '.r4-toast{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translate(-50%,20px);opacity:0;background:var(--text);color:var(--nacht);font-weight:800;border-radius:999px;padding:10px 18px;z-index:40;transition:opacity .2s,transform .2s;pointer-events:none;max-width:calc(100% - 32px);text-align:center}',
    '.r4-toast.on{opacity:1;transform:translate(-50%,0)}',
    'body:has(.blatt.offen) .nova-btn,body:has(.blatt.offen) .nova-pille,body:has(.blatt.offen) .nova-panel{visibility:hidden}',
    '@media (prefers-reduced-motion:reduce){.r4-toast,.herz{transition:none}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var to = document.createElement('div'); to.className = 'r4-toast'; to.setAttribute('role', 'status'); document.body.appendChild(to);
  function toast(t) { to.textContent = t; to.classList.add('on'); clearTimeout(to._t); to._t = setTimeout(function () { to.classList.remove('on'); }, 2200); }

  /* ---------- Wunschzettel (auch aus einem geteilten Link) ---------- */
  function wunsch() { return hol('copa-wunsch', []); }
  var geteilt = null;
  var m = location.hash.match(/^#wunsch=([a-z0-9,]+)$/i);
  if (m) geteilt = m[1].split(',').filter(function (id) { return WAREN.some(function (w) { return w.id === id; }); });
  var tipps = [];

  /* Regal verschönern: Herz, Tipp-Markierung, «Im Korb ✓» */
  var altRegal = regalZeigen;
  regalZeigen = function () {
    altRegal();
    var sicht = WAREN.filter(function (w) { return aktiv === 'Alle' || w.kat === aktiv; });
    document.querySelectorAll('#regal .ware').forEach(function (el, i) {
      var w = sicht[i]; if (!w) return;
      if (tipps.indexOf(w.id) >= 0 || (geteilt && geteilt.indexOf(w.id) >= 0)) el.classList.add('tipp');
      var on = wunsch().indexOf(w.id) >= 0;
      var h = document.createElement('button'); h.className = 'herz'; h.type = 'button'; h.setAttribute('aria-pressed', String(on)); h.setAttribute('aria-label', (on ? 'Vom Wunschzettel nehmen: ' : 'Auf den Wunschzettel: ') + w.name); h.textContent = on ? '♥' : '♡';
      h.onclick = function () { var l = wunsch(), j = l.indexOf(w.id); if (j >= 0) l.splice(j, 1); else { l.push(w.id); summ(10); toast('♥ Auf dem Wunschzettel'); } leg('copa-wunsch', l); regalZeigen(); wunschZeigen(); };
      el.appendChild(h);
      var k = el.querySelector('.knopf'); var alt = k.onclick;
      k.onclick = function () { alt(); summ(12); k.textContent = 'Im Korb ✓'; k.classList.add('drin'); toast(w.em + ' ' + w.name + ' liegt im Korb'); setTimeout(function () { k.textContent = 'In den Korb'; k.classList.remove('drin'); }, 1600); };
    });
  };

  /* ---------- 1) Geschenk-Finder ---------- */
  var F = { wer: null, wozu: null, budget: null };
  var WER = [['mama', '👩', 'Mama'], ['freundin', '💁', 'Freundin'], ['kind', '🧒', 'Kind'], ['kollege', '🧑‍💼', 'Kollegin/Kollege']];
  var WOZU = [['geburtstag', '🎂', 'Geburtstag'], ['danke', '🙏', 'Danke'], ['einfach', '🌞', 'Einfach so']];
  var BUDGET = [[15, 'bis 15'], [30, 'bis 30'], [999, 'egal']];
  var fk = document.createElement('section'); fk.className = 'r4-karte'; fk.id = 'r4finder'; fk.setAttribute('aria-labelledby', 'r4fh');
  function chips(name, liste, wert) {
    return '<div class="r4-wahl" role="group">' + liste.map(function (x) { var v = x[0], l = x.length === 3 ? x[1] + ' ' + x[2] : 'CHF ' + x[1]; return '<button type="button" data-f="' + name + '" data-v="' + v + '" aria-pressed="' + (String(wert) === String(v)) + '">' + esc(l) + '</button>'; }).join('') + '</div>';
  }
  function finderZeigen() {
    fk.innerHTML = '<h2 id="r4fh">🎁 Geschenk-Finder</h2><p class="hinweis">Drei Tipps, und das Lädeli zeigt dir, was passt.</p>' +
      '<p class="r4-frage">Für wen?</p>' + chips('wer', WER, F.wer) + '<p class="r4-frage">Wozu?</p>' + chips('wozu', WOZU, F.wozu) + '<p class="r4-frage">Wie viel?</p>' + chips('budget', BUDGET, F.budget) +
      '<p class="hinweis r4-ergebnis" aria-live="polite" style="margin-top:12px"></p>';
    fk.querySelectorAll('[data-f]').forEach(function (b) {
      b.onclick = function () { var k = b.getAttribute('data-f'), v = b.getAttribute('data-v'); F[k] = k === 'budget' ? +v : v; finderZeigen(); suchen(); summ(8); };
    });
    if (F.wer && F.wozu && F.budget) zeigeErgebnis();
  }
  function suchen() {
    if (!(F.wer && F.wozu && F.budget)) return;
    var l = WAREN.map(function (w) {
      var p = PASST[w.id] || { wer: [], wozu: [] }, s = 0;
      if (p.wer.indexOf(F.wer) >= 0) s += 2; if (p.wozu.indexOf(F.wozu) >= 0) s += 2; if (w.preis <= F.budget) s += 3; else s -= 5;
      return { w: w, s: s };
    }).filter(function (x) { return x.s > 2; }).sort(function (a, b) { return b.s - a.s || a.w.preis - b.w.preis; }).slice(0, 3);
    tipps = l.map(function (x) { return x.w.id; });
    aktiv = 'Alle'; filterZeigen(); regalZeigen(); zeigeErgebnis();
    var erst = document.querySelector('#regal .ware.tipp');
    if (erst) setTimeout(function () { erst.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'center' }); }, 250);
  }
  function zeigeErgebnis() {
    var e = fk.querySelector('.r4-ergebnis'); if (!e) return;
    var n = tipps.map(function (id) { var w = WAREN.filter(function (x) { return x.id === id; })[0]; return w ? w.em + ' ' + w.name : ''; }).filter(Boolean);
    e.textContent = n.length ? 'Passt: ' + n.join(' · ') + ' (golden markiert)' : 'Hm, da finde ich gerade nichts. Probier ein anderes Budget.';
  }

  /* ---------- 2) Wunschzettel-Karte ---------- */
  var wk = document.createElement('section'); wk.className = 'r4-karte'; wk.id = 'r4wunsch'; wk.hidden = true;
  function wunschZeigen() {
    var l = wunsch(), mitLink = geteilt && geteilt.length;
    wk.hidden = !l.length && !mitLink; if (wk.hidden) return;
    var wl = function (ids) { return ids.map(function (id) { var w = WAREN.filter(function (x) { return x.id === id; })[0]; return w ? '<span>' + w.em + ' ' + esc(w.name) + '</span>' : ''; }).join(''); };
    wk.innerHTML = (mitLink ? '<h2>💌 Ein Wunschzettel für dich</h2><p class="hinweis">Jemand hat dir diese Wünsche geschickt. Sie sind im Regal golden markiert.</p><div class="r4-wunsch">' + wl(geteilt) + '</div>' : '') +
      (l.length ? '<h2' + (mitLink ? ' style="margin-top:14px"' : '') + '>♥ Mein Wunschzettel</h2><div class="r4-wunsch">' + wl(l) + '</div><div class="r4-reihe"><button class="knopf" type="button" data-r4="teilen">Wunschzettel teilen</button></div>' : '');
    var t = wk.querySelector('[data-r4=teilen]');
    if (t) t.onclick = function () {
      var url = location.href.split('#')[0] + '#wunsch=' + wunsch().join(',');
      var text = 'Mein Wunschzettel aus dem Geschenk Lädeli Copacabana 🌴';
      if (navigator.share) navigator.share({ title: 'Wunschzettel', text: text, url: url }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + url).then(function () { toast('Link kopiert. Jetzt einfügen und senden.'); }, function () { prompt('Link kopieren:', url); });
      else prompt('Link kopieren:', url);
    };
  }

  /* ---------- 3) Grusskarte live ---------- */
  var g = $('gruss'), pk = document.createElement('div'); pk.className = 'postkarte'; pk.setAttribute('aria-label', 'Vorschau der Grusskarte');
  pk.innerHTML = '<div class="pk-kopf">Geschenk Lädeli Copacabana</div><div class="pk-text"></div>';
  if (g) {
    g.after(pk);
    var pt = pk.querySelector('.pk-text');
    var z = function () { var v = g.value.trim(); pt.textContent = v || 'Hier steht dein Gruss …'; pt.classList.toggle('leer', !v); leg('copa-gruss', g.value); };
    g.value = hol('copa-gruss', '') || ''; g.addEventListener('input', z); z();
  }

  /* ---------- 4) Geburtstag merken ---------- */
  var gb = document.createElement('section'); gb.className = 'r4-karte'; gb.id = 'r4geburi';
  gb.innerHTML = '<h2>🎂 Nie mehr einen Geburtstag vergessen</h2><p class="hinweis">Name und Datum eingeben. Du bekommst eine Kalender-Erinnerung eine Woche vorher, jedes Jahr. Bleibt in deinem Kalender, nicht bei uns.</p>' +
    '<div class="r4-reihe" style="margin-top:4px"><input id="r4gname" placeholder="z. B. Lea" aria-label="Name" style="flex:1;min-width:120px;min-height:44px"><input id="r4gdatum" type="date" aria-label="Geburtstag" style="flex:1;min-width:140px;min-height:44px"></div>' +
    '<div class="r4-reihe"><button class="knopf" type="button" id="r4gknopf">📅 In meinen Kalender</button></div>';
  function ics() {
    var n = ($('r4gname').value || '').trim().slice(0, 40) || 'Jemand Liebes', d = $('r4gdatum').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { toast('Bitte ein Datum wählen'); return; }
    var j = new Date().getFullYear(), t = d.slice(5).replace('-', ''), heute = new Date(), dat = new Date(j + '-' + d.slice(5) + 'T09:00:00');
    if (dat < heute) j++;
    var start = j + t, uid = 'copa-' + Date.now() + '@dr-lab';
    var txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DR Lab//Copacabana//DE', 'BEGIN:VEVENT', 'UID:' + uid, 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
      'DTSTART;VALUE=DATE:' + start, 'RRULE:FREQ=YEARLY', 'SUMMARY:🎂 Geburtstag ' + n.replace(/[,;\\]/g, ' '), 'DESCRIPTION:Ein kleines Geschenk aus dem Lädeli Copacabana?',
      'BEGIN:VALARM', 'TRIGGER:-P7D', 'ACTION:DISPLAY', 'DESCRIPTION:In einer Woche hat ' + n.replace(/[,;\\]/g, ' ') + ' Geburtstag', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var b = new Blob([txt], { type: 'text/calendar' }), u = URL.createObjectURL(b), a = document.createElement('a');
    a.href = u; a.download = 'geburtstag-' + n.toLowerCase().replace(/[^a-z0-9äöü]+/g, '-') + '.ics'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 1000);
    summ([10, 30, 10]); toast('🎂 Erinnerung für ' + n + ' erstellt');
  }

  /* ---------- Einfügen ---------- */
  var filter = $('filter');
  if (filter) { filter.before(fk); fk.after(wk); }
  var foot = document.querySelector('.wrap footer'); if (foot) foot.before(gb);
  $('r4gknopf').onclick = ics;
  finderZeigen(); regalZeigen(); wunschZeigen();
  if (geteilt && geteilt.length) setTimeout(function () { wk.scrollIntoView({ behavior: 'auto', block: 'start' }); }, 300);

  window.CopaR4 = { toast: toast };
})();
