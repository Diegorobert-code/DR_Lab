/* tagebuch.js – Wäf Wäf «Hunde-Tagebuch»: ein Tipp pro Ereignis (Füttern, Gassi, Pipi, Gagi, Schlafen).
   Zeitleiste von heute, «seit …» für Gassi und Pipi, Wochen-Muster, Lern-Hinweis («Meist Pipi ca. 20 Min nach dem Fressen»).
   Wäf Wäf (Aura-Figur) freut sich bei jedem Tipp. Ersetzt das frühere «Mein Logbuch heute» und liest dessen Einträge weiter.
   Alles bleibt auf diesem Gerät (localStorage über R8.hol/leg, Schlüssel …r8.logbuch). Nur Lob, keine Tierarzt-Aussagen. */
(function () {
  'use strict';
  var ARTEN = [['futter', '🍖', 'Füttern'], ['gassi', '🦮', 'Gassi'], ['pipi', '💧', 'Pipi'], ['gagi', '💩', 'Gagi'], ['schlaf', '😴', 'Schlafen']];
  var NAME = { wasser: ['wasser', '🚰', 'Wasser'] }; ARTEN.forEach(function (a) { NAME[a[0]] = a; });
  var LOB = {
    futter: ['Mmh, danke! Napf leer, Bauch voll.', 'Wäf! Futterzeit ist die beste Zeit.', 'Fein gemacht. Das merke ich mir.'],
    gassi: ['Juhu, raus! Schnüffeln ist mein Lieblingshobby.', 'Wäf! Frische Luft, frohe Pfoten.', 'Danke für die Runde!'],
    pipi: ['Super, gut gemacht! Gleich loben, gern mit Leckerli.', 'Bravo! Draussen ist genau richtig.', 'Toll! Du merkst schon, wann es Zeit ist.'],
    gagi: ['Bravo! Ein grosses Lob für mich.', 'Erledigt! Das hast du gut abgepasst.', 'Wäf! Ich bin ein Profi.'],
    schlaf: ['Psst … ich träume von Tennisbällen.', 'Gute Nacht, Pfote drauf.', 'Kurz Augen zu, dann wieder volle Energie.']
  };
  var WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  function zwei(n) { return (n < 10 ? '0' : '') + n; }
  function uhr(ts) { var d = new Date(ts); return zwei(d.getHours()) + ':' + zwei(d.getMinutes()); }
  function tagK(ts) { var d = new Date(ts); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function dauer(ms) {
    var m = Math.floor(ms / 60000);
    if (m < 1) return 'gerade eben';
    if (m < 60) return 'seit ' + m + ' min';
    var h = Math.floor(m / 60); m = m % 60;
    return 'seit ' + h + ' h' + (m ? ' ' + m + ' min' : '');
  }
  function median(a) { a = a.slice().sort(function (p, q) { return p - q; }); var i = Math.floor(a.length / 2); return a.length % 2 ? a[i] : (a[i - 1] + a[i]) / 2; }

  /* Lern-Hinweise: wie lange nach X kommt meistens Y? (mind. 3 Mal in 14 Tagen, innerhalb 2 Std.) */
  var PAARE = [['futter', 'pipi', 'nach dem Fressen'], ['futter', 'gagi', 'nach dem Fressen'], ['schlaf', 'pipi', 'nach dem Schlafen'], ['gassi', 'gagi', 'nach Gassi-Beginn']];
  function lernen(l) {
    var seit = Date.now() - 14 * 864e5, w = l.filter(function (x) { return x.ts > seit; }).sort(function (p, q) { return p.ts - q.ts; }), aus = [];
    PAARE.forEach(function (p) {
      var lags = [];
      w.forEach(function (x, i) {
        if (x.a !== p[0]) return;
        for (var j = i + 1; j < w.length; j++) {
          var y = w[j], d = y.ts - x.ts; if (d > 120 * 60000) break;
          if (y.a === p[0]) break;
          if (y.a === p[1]) { if (d >= 2 * 60000) lags.push(d / 60000); break; }
        }
      });
      if (lags.length >= 3) { var m = Math.max(5, Math.round(median(lags) / 5) * 5); aus.push({ von: p[0], zu: p[1], min: m, n: lags.length, text: 'Meist ' + NAME[p[1]][2] + ' ca. ' + m + ' Min ' + p[2] + '.' }); }
    });
    return aus;
  }
  /* Typische Uhrzeiten einer Art (Gruppen innerhalb 75 Min, an mind. 3 Tagen) */
  function typisch(l, art) {
    var seit = Date.now() - 14 * 864e5;
    var m = l.filter(function (x) { return x.a === art && x.ts > seit; }).map(function (x) { var d = new Date(x.ts); return { m: d.getHours() * 60 + d.getMinutes(), t: tagK(x.ts) }; }).sort(function (p, q) { return p.m - q.m; });
    var gr = [], g = null;
    m.forEach(function (x) { if (g && x.m - g.start <= 75) g.e.push(x); else { g = { start: x.m, e: [x] }; gr.push(g); } });
    return gr.filter(function (g) { var t = {}; g.e.forEach(function (x) { t[x.t] = 1; }); return Object.keys(t).length >= 3; })
      .map(function (g) { var s = Math.round(g.e.reduce(function (z, x) { return z + x.m; }, 0) / g.e.length / 15) * 15; return zwei(Math.floor(s / 60) % 24) + ':' + zwei(s % 60); });
  }

  var CSS = '' +
    '.tb{position:relative}' +
    '.tb-kopf{display:flex;align-items:center;gap:12px;margin:6px 0 10px}' +
    '.tb-figur{position:relative;flex:0 0 96px;width:96px;height:96px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 60%,#FFF4D6,#FFE2A8 60%,#F9CF7E);box-shadow:inset 0 -6px 14px rgba(160,100,20,.15)}' +
    '.tb-figur .aura-figur{inset:8% 4% 0 4%}' +
    '.tb-figur.tb-hopp{animation:tbHopp .5s ease}' +
    '.tb-blase{position:relative;flex:1;background:#FFF8E8;color:#4A3511;border:1px solid #F5DFAE;border-radius:18px;padding:10px 12px;font-size:.98rem;line-height:1.35;min-height:44px}' +
    '.tb-blase::before{content:"";position:absolute;left:-8px;top:50%;margin-top:-8px;border:8px solid transparent;border-left:0;border-right-color:#F5DFAE}' +
    '.tb-seit{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 12px}' +
    '.tb-seit div{background:#EAF1FF;border-radius:16px;padding:10px 12px;display:flex;flex-direction:column;gap:2px}' +
    '.tb-seit span{font-size:.85rem;color:#56607A}.tb-seit b{font-size:1.02rem;white-space:nowrap;color:#18233D;font-variant-numeric:tabular-nums}' +
    '.tb-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin:0 0 6px}' +
    '.tb-grid .tb-t{grid-column:span 2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:104px;padding:10px 4px;border-radius:22px;background:#F1F5FC!important;color:#18233D!important;border:1px solid #E3E9F4!important;box-shadow:none!important;font:inherit;cursor:pointer;transition:transform .15s,background .2s;-webkit-tap-highlight-color:transparent;touch-action:manipulation}' +
    '.tb-grid .tb-t:nth-child(4){grid-column:2/span 2}' +
    '.tb-grid .tb-t:active{transform:scale(.94)}' +
    '.tb-grid .tb-t.neu{background:#FFF1CC!important;border-color:#F2B84B!important;animation:tbHopp .5s ease}' +
    '@keyframes tbHopp{30%{transform:scale(1.08)}60%{transform:scale(.97)}}' +
    '.tb-t .tb-e{font-size:2.4rem;line-height:1}.tb-t b{font-size:1rem}.tb-t small{font-size:.78rem;color:#56607A!important}' +
    '.tb-h3{font-size:1.05rem;margin:18px 0 8px}' +
    '.tb-zeit{list-style:none;margin:0;padding:0 0 0 14px;border-left:3px solid #E3E9F4;display:grid;gap:2px}' +
    '.tb-zeit li{display:flex;align-items:center;gap:10px;min-height:44px}' +
    '.tb-zeit time{font-variant-numeric:tabular-nums;font-weight:700;min-width:3.2rem;color:#1D4FD1}' +
    '.tb-zeit .tb-weg{margin-left:auto;min-width:44px;min-height:44px;border-radius:12px;background:#FFFFFF!important;color:#56607A!important;border:1px solid #E3E9F4!important;box-shadow:none!important;font:inherit;cursor:pointer}' +
    '.tb-leer{color:#56607A;padding:6px 0}' +
    '.tb-lern{background:linear-gradient(135deg,#FFF6DD,#FFEFC7);border-radius:16px;padding:10px 12px;margin:12px 0 0;color:#4A3511;display:flex;gap:10px;align-items:flex-start}' +
    '.tb-lern[hidden]{display:none}.tb-lern>span{font-size:1.4rem;line-height:1.2}' +
    '.tb-lern ul{margin:0;padding:0;list-style:none;display:grid;gap:4px}' +
    '.tb-chips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:none}' +
    '.tb-chips button{flex:0 0 auto;min-height:40px;padding:0 12px;border-radius:999px;background:#FFFFFF!important;color:#18233D!important;border:1px solid #C6D3EA!important;box-shadow:none!important;font:inherit;font-size:.92rem;cursor:pointer}' +
    '.tb-chips button[aria-pressed=true]{background:#2563EB!important;color:#FFFFFF!important;border-color:#2563EB!important}' +
    '.tb-woche{display:grid;gap:6px}' +
    '.tb-wz{display:grid;grid-template-columns:2.6rem 1fr;align-items:center;gap:8px;font-size:.85rem;color:#56607A}' +
    '.tb-wz.heute{color:#1D4FD1;font-weight:700}' +
    '.tb-spur{position:relative;height:24px;border-radius:12px;background:#F1F5FC;overflow:hidden}' +
    '.tb-spur i{position:absolute;top:4px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:#2563EB;box-shadow:0 0 0 2px #fff}' +
    '.tb-spur i.pipi{background:#38A3F1}.tb-spur i.gagi{background:#9A6B3F}.tb-spur i.futter{background:#F28C38}.tb-spur i.gassi{background:#2FA36B}.tb-spur i.schlaf{background:#8B7CF6}' +
    '.tb-achse{display:grid;grid-template-columns:2.6rem 1fr;gap:8px;font-size:.75rem;color:#56607A}' +
    '.tb-achse div{position:relative;height:1em}.tb-achse span{position:absolute;transform:translateX(-50%)}' +
    '.tb-typ{margin:10px 0 0;font-size:.95rem}' +
    '.tb-klein{font-size:.88rem;color:#56607A;margin-top:14px}';

  function bau(H) {
    function liste() { var l = H.hol('logbuch', []); return Array.isArray(l) ? l.filter(function (x) { return x && x.a && x.ts; }) : []; }
    function speichere(l) { var grenze = Date.now() - 45 * 864e5; H.leg('logbuch', l.filter(function (x) { return x && x.ts > grenze; }).slice(-2000)); }
    function heuteL() { var k = tagK(Date.now()); return liste().filter(function (x) { return tagK(x.ts) === k; }); }
    var wahl = H.hol('tb.wahl', 'pipi'); if (!NAME[wahl] || wahl === 'wasser') wahl = 'pipi';

    var knoepfe = ARTEN.map(function (a) {
      return '<button type="button" class="tb-t" data-art="' + a[0] + '" aria-label="' + a[2] + ' jetzt eintragen"><span class="tb-e" aria-hidden="true">' + a[1] + '</span><b>' + a[2] + '</b><small data-zuletzt="' + a[0] + '">noch nicht</small></button>';
    }).join('');
    var chips = ARTEN.map(function (a) { return '<button type="button" data-w="' + a[0] + '" aria-pressed="false">' + a[1] + ' ' + a[2] + '</button>'; }).join('');
    var n = H.karte('logbuch', '🐾 Hunde-Tagebuch',
      '<div class="tb" id="tagebuch">' +
      '<div class="tb-kopf"><div class="tb-figur" aria-hidden="true"></div><p class="tb-blase" aria-live="polite">Ein Tipp genügt, und ich merke mir den Tag. Wäf!</p></div>' +
      '<div class="tb-seit"><div><span>🦮 Gassi</span><b data-seit="gassi">noch nicht</b></div><div><span>💧 Pipi</span><b data-seit="pipi">noch nicht</b></div></div>' +
      '<div class="tb-grid" role="group" aria-label="Eintragen">' + knoepfe + '</div>' +
      '<div class="tb-lern" hidden><span aria-hidden="true">💡</span><div><b>Wäf Wäf hat gelernt</b><ul></ul></div></div>' +
      '<h3 class="tb-h3">Heute</h3><ol class="tb-zeit"></ol>' +
      '<h3 class="tb-h3">Meine Woche</h3><div class="tb-chips" role="group" aria-label="Was zeigen?">' + chips + '</div>' +
      '<div class="tb-woche" aria-live="polite"></div>' +
      '<div class="tb-achse" aria-hidden="true"><span></span><div><span style="left:0;transform:none">0</span><span style="left:25%">6</span><span style="left:50%">12</span><span style="left:75%">18</span><span style="left:100%;transform:translateX(-100%)">24</span></div></div>' +
      '<p class="tb-typ"></p>' +
      '<p class="tb-klein">Bleibt nur auf diesem Gerät. Je öfter ihr tippt, desto besser kennt Wäf Wäf euren Rhythmus.</p>' +
      '</div>');
    var st = document.createElement('style'); st.textContent = CSS; n.appendChild(st);
    var zeitEl = n.querySelector('.tb-zeit'), wocheEl = n.querySelector('.tb-woche'), typEl = n.querySelector('.tb-typ'), lernEl = n.querySelector('.tb-lern'), blase = n.querySelector('.tb-blase');

    var fig = null, platz = n.querySelector('.tb-figur');
    try { if (window.Aura) fig = Aura.baue(platz, { ersatz: 'figur-klein.jpg' }); } catch (e) {}
    if (!fig) platz.innerHTML = '<img src="figur-klein.jpg" alt="" style="width:100%;height:100%;object-fit:cover">';
    function freuen(art, ev) {
      if (!fig) return;
      try { fig.blitz(); fig.pose(art === 'schlaf' ? 'schlaeft' : 'freut', art === 'schlaf' ? 2400 : 1800); } catch (e) {}
      platz.classList.remove('tb-hopp'); void platz.offsetWidth; platz.classList.add('tb-hopp');
    }

    function seit() {
      var l = liste();
      ['gassi', 'pipi'].forEach(function (a) {
        var z = l.filter(function (x) { return x.a === a; }).sort(function (p, q) { return q.ts - p.ts; })[0], b = n.querySelector('[data-seit=' + a + ']');
        b.textContent = z && Date.now() - z.ts < 36 * 3600000 ? dauer(Date.now() - z.ts) : 'noch nicht';
      });
    }
    function woche() {
      var l = liste(), a = NAME[wahl], heute0 = new Date(); heute0.setHours(0, 0, 0, 0);
      n.querySelectorAll('.tb-chips button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-w') === wahl ? 'true' : 'false'); });
      var html = '';
      for (var i = 6; i >= 0; i--) {
        var t0 = heute0.getTime() - i * 864e5, t1 = t0 + 864e5, d = new Date(t0);
        var e = l.filter(function (x) { return x.a === wahl && x.ts >= t0 && x.ts < t1; });
        var punkte = e.map(function (x) { var dd = new Date(x.ts), p = (dd.getHours() * 60 + dd.getMinutes()) / 1440 * 100; return '<i class="' + wahl + '" style="left:' + Math.min(97, Math.max(3, p)).toFixed(1) + '%"></i>'; }).join('');
        var name = i === 0 ? 'Heute' : WT[d.getDay()];
        html += '<div class="tb-wz' + (i === 0 ? ' heute' : '') + '"><span>' + name + '</span><div class="tb-spur" role="img" aria-label="' + name + ': ' + (e.length ? e.map(function (x) { return uhr(x.ts); }).join(', ') : 'nichts') + '">' + punkte + '</div></div>';
      }
      wocheEl.innerHTML = html;
      var z = typisch(l, wahl);
      typEl.innerHTML = z.length ? a[1] + ' <b>' + a[2] + '</b> meist um ' + (z.length > 1 ? z.slice(0, -1).join(', ') + ' und ' + z[z.length - 1] : z[0]) + '.'
        : 'Nach ein paar Tagen zeige ich hier, wann ' + a[2] + ' meistens dran ist.';
    }
    function lern() {
      var h = lernen(liste()), ul = lernEl.querySelector('ul');
      lernEl.hidden = !h.length;
      ul.innerHTML = h.map(function (x) { return '<li>' + NAME[x.zu][1] + ' ' + x.text + '</li>'; }).join('');
      return h;
    }
    function zeichne() {
      var h = heuteL().sort(function (p, q) { return q.ts - p.ts; });
      zeitEl.innerHTML = h.length ? '' : '<li class="tb-leer">Heute noch nichts eingetragen. Tipp oben auf ein Bild.</li>';
      h.forEach(function (x) {
        var a = NAME[x.a]; if (!a) return;
        var li = H.el('<li><time>' + uhr(x.ts) + '</time><span aria-hidden="true">' + a[1] + '</span><span>' + a[2] + '</span><button type="button" class="tb-weg" aria-label="' + a[2] + ' um ' + uhr(x.ts) + ' entfernen">✕</button></li>');
        li.querySelector('button').onclick = function () { entferne(x); };
        zeitEl.appendChild(li);
      });
      ARTEN.forEach(function (a) {
        var z = h.filter(function (x) { return x.a === a[0]; }), s = n.querySelector('[data-zuletzt=' + a[0] + ']');
        s.textContent = z.length ? 'zuletzt ' + uhr(z[0].ts) + (z.length > 1 ? ' · ' + z.length + '×' : '') : 'noch nicht';
      });
      seit(); woche(); lern();
    }
    function entferne(x) {
      speichere(liste().filter(function (y) { return y.id !== x.id; })); zeichne();
      H.rueck(NAME[x.a][2] + ' um ' + uhr(x.ts) + ' entfernt.', function () { var l = liste(); l.push(x); l.sort(function (p, q) { return p.ts - q.ts; }); speichere(l); zeichne(); });
    }
    function lobFuer(art) {
      var L = LOB[art], t = L[Math.floor(Math.random() * L.length)];
      /* Lern-Hinweis direkt anwenden: nach dem Fressen kommt bald Pipi? */
      var h = lernen(liste()).filter(function (x) { return x.von === art; })[0];
      if (h) t += ' Ich denke, in ca. ' + h.min + ' Min ist ' + NAME[h.zu][2] + ' dran.';
      return t;
    }
    n.querySelectorAll('.tb-t').forEach(function (b) {
      b.onclick = function (ev) {
        var a = NAME[b.getAttribute('data-art')], x = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), a: a[0], ts: Date.now() };
        var l = liste(); l.push(x); speichere(l);
        try { H.summ(8); } catch (e) {}
        zeichne(); freuen(a[0], ev); blase.textContent = lobFuer(a[0]);
        b.classList.remove('neu'); void b.offsetWidth; b.classList.add('neu'); setTimeout(function () { b.classList.remove('neu'); }, 700);
        H.rueck(a[1] + ' ' + a[2] + ' um ' + uhr(x.ts) + ' eingetragen.', function () { speichere(liste().filter(function (y) { return y.id !== x.id; })); zeichne(); blase.textContent = 'Kein Problem, ist wieder weg. Wäf!'; });
      };
    });
    n.querySelectorAll('.tb-chips button').forEach(function (b) {
      b.onclick = function () { wahl = b.getAttribute('data-w'); H.leg('tb.wahl', wahl); woche(); };
    });
    platz.addEventListener('pointerdown', function () { if (fig) { try { fig.pose('winkt', 1600); } catch (e) {} } }, { passive: true });
    zeichne();
    setInterval(function () { if (!document.hidden && n.isConnected) seit(); }, 30000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) zeichne(); });
    return n;
  }
  window.WaefTagebuch = bau;
  window.WaefTagebuch.lernen = lernen;
})();
