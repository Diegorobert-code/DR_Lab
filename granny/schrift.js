/* Grosse Schrift / Kontrast (Design 23.10.): oben immer sichtbar «A · A+ · A++» und «Kontrast».
   A+ und A++ vergrössern Schrift UND Tippflächen der ganzen App gleichmässig (CSS zoom auf main
   und das Angehörigen-Blatt; der Inhalt bricht neu um, darum kein seitliches Scrollen bei 390 px).
   Kontrast: reines Weiss, schwarze Schrift, kräftige Ränder, dicker Fokusrahmen.
   Beides wird auf dem Handy gemerkt (localStorage, mit try/catch). Der bisherige Knopf
   «A+ Grosse Schrift» im Gruss schaltet jetzt die Stufen weiter und bleibt im Gleichklang. */
(function () {
  'use strict';
  if (window.__grannySchrift) return; window.__grannySchrift = 1;
  var KEY = 'granny_schrift', KK = 'granny_kontrast';
  var STUFEN = [['A', 'Normale Schrift', 1], ['A+', 'Grosse Schrift', 1.15], ['A++', 'Sehr grosse Schrift', 1.3]];
  var root = document.documentElement;
  function hol(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var stufe = hol(KEY, null), kontrast = !!hol(KK, false);
  if (stufe === null) stufe = root.classList.contains('r6-gross') ? 1 : 0; // alte Einstellung übernehmen
  stufe = Math.max(0, Math.min(2, +stufe || 0));

  var Z = 'main,#einst .innen';
  var st = document.createElement('style');
  st.textContent =
    /* Stufen (überschreiben den alten 1.15-Zoom, statt ihn zu verdoppeln) */
    'html.gs-0 :is(' + Z + '){zoom:1!important}html.gs-1 :is(' + Z + '){zoom:1.15!important}html.gs-2 :is(' + Z + '){zoom:1.3!important}' +
    /* Damit bei 390 px nichts seitlich herausragt: Raster mit minmax(0,1fr), vw-Breiten relativ zur Karte */
    'html:is(.gs-1,.gs-2) .leute{grid-template-columns:repeat(2,minmax(0,1fr))}html:is(.gs-1,.gs-2) .person{min-width:0;overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto;padding-left:6px;padding-right:6px}html.gs-1 .person{font-size:24px}' +
    'html.gs-2 .leute{gap:10px}html.gs-2 .person{min-height:132px;font-size:22px}' +
    'html:is(.gs-1,.gs-2) .r8-ringe-bild{width:min(40%,190px)!important}' +
    'html:is(.gs-1,.gs-2) main [style*="display:grid"]:not([style*="grid-template"]){grid-template-columns:minmax(0,1fr)}' +
    'html:is(.gs-1,.gs-2) main :is(input,select,textarea){max-width:100%;min-width:0;box-sizing:border-box}' +
    'html:is(.gs-1,.gs-2) main :is(label,p,li,h2,h3){min-width:0;overflow-wrap:break-word}' +
    /* Leiste */
    /* die Leiste selbst bleibt gleich gross und am selben Ort (Gegen-Zoom) */
    'html.gs-1 .gs-leiste{zoom:.8696}html.gs-2 .gs-leiste{zoom:.7693}' +
    '.gs-leiste{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin:-4px 0 -6px;flex-wrap:wrap}' +
    '.gs-seg{display:inline-flex;border:2px solid var(--gs-rand,#a8957c);border-radius:999px;overflow:hidden;background:var(--card,#fff)}' +
    '.gs-leiste button{min-width:48px;min-height:48px;padding:0 12px;font-weight:800;color:var(--text,#161412);background:transparent;border-radius:0;line-height:1}' +
    '.gs-seg button+button{border-left:2px solid var(--gs-rand,#a8957c)}' +
    '.gs-seg button[data-s="0"]{font-size:17px}.gs-seg button[data-s="1"]{font-size:20px}.gs-seg button[data-s="2"]{font-size:23px}' +
    '.gs-seg button[aria-pressed="true"]{background:var(--text,#161412);color:var(--card,#fff)}' +
    '.gs-kontrast{border:2px solid var(--gs-rand,#a8957c)!important;border-radius:999px!important;background:var(--card,#fff)!important;gap:6px;font-size:17px}' +
    '.gs-kontrast[aria-pressed="true"]{background:#000!important;color:#fff!important;border-color:#000!important}' +
    '.gs-kontrast i{font-style:normal;font-size:20px}' +
    '.gs-leiste button:focus-visible{outline:3px solid #1d4ed8;outline-offset:2px}' +
    /* Kontrast */
    'html.gk,html.gk body{background:#fff!important;--bg:#fff;--card:#fff;--text:#000;--soft:#000;--gs-rand:#000}' +
    'html.gk main,html.gk #einst{color:#000!important}' +
    'html.gk :is(main,#einst) :is(.zeit .tag,.zeit .uhr,.angeh,.person small,.heute,.merk,.album,.erzaehl,.nachricht,.start,.blase,.klemmt,small,.small,.mini,.leise,[class*="leise"],[class*="klein"],p){color:#000!important}' +
    'html.gk :is(main,#einst) :is(.blase,.person,.heute,.merk,.album,.erzaehl,.nachricht,.start,.klemmt,.r6-gruss,.r6-karte,.r7-karte,.r8-karte){background:#fff!important;border:3px solid #000!important;box-shadow:none!important}' +
    'html.gk :is(main,#einst) :is(.r6-k,.r7-btn,.r8-btn,.r6-btn):not(.voll){background:#fff!important;color:#000!important;border:2px solid #000!important}' +
    'html.gk .reden{background:#0b4a2e!important;color:#fff!important;box-shadow:0 6px 0 #000!important;outline:3px solid #000;outline-offset:2px}' +
    'html.gk .hilfe{background:#8f1d17!important;color:#fff!important;outline:3px solid #000;outline-offset:2px}' +
    'html.gk :is(main,#einst) .heute b{color:#000!important}' +
    'html.gk :focus-visible{outline:4px solid #000!important;outline-offset:3px!important}' +
    'html.gk img{filter:none!important}';
  document.head.appendChild(st);

  var leiste, altKnopf;
  function anwenden() {
    root.classList.remove('gs-0', 'gs-1', 'gs-2'); root.classList.add('gs-' + stufe);
    root.classList.toggle('r6-gross', stufe > 0); // alter Schalter im Gleichklang
    root.classList.toggle('gk', kontrast);
    if (leiste) {
      [].forEach.call(leiste.querySelectorAll('[data-s]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-s') === stufe)); });
      leiste.querySelector('.gs-kontrast').setAttribute('aria-pressed', String(kontrast));
    }
    altKnopf = altKnopf || document.querySelector('[data-r6=gross]');
    if (altKnopf) { altKnopf.setAttribute('aria-pressed', String(stufe > 0)); altKnopf.textContent = stufe < 2 ? STUFEN[stufe + 1][0] + ' Grössere Schrift' : 'A Normale Schrift'; }
  }
  function setzeStufe(s) { stufe = s; leg(KEY, s); anwenden(); }

  function bauen() {
    var main = document.querySelector('main'); if (!main || document.querySelector('.gs-leiste')) return;
    leiste = document.createElement('div'); leiste.className = 'gs-leiste';
    leiste.innerHTML = '<div class="gs-seg" role="group" aria-label="Schriftgrösse">' +
      STUFEN.map(function (x, i) { return '<button type="button" data-s="' + i + '" aria-label="' + x[1] + '" aria-pressed="false">' + x[0] + '</button>'; }).join('') +
      '</div><button type="button" class="gs-kontrast" aria-pressed="false"><i aria-hidden="true">◐</i>Kontrast</button>';
    main.insertBefore(leiste, main.firstChild);
    leiste.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-s')) setzeStufe(+b.getAttribute('data-s'));
      else { kontrast = !kontrast; leg(KK, kontrast); anwenden(); }
    });
    // Alter Knopf «A+ Grosse Schrift» (runde6): schaltet jetzt A → A+ → A++ → A
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-r6=gross]'); if (!b) return;
      e.stopImmediatePropagation(); e.preventDefault(); altKnopf = b; setzeStufe((stufe + 1) % 3);
    }, true);
    anwenden();
  }
  anwenden();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bauen); else bauen();
  window.addEventListener('load', function () { setTimeout(anwenden, 300); });
  window.grannySchrift = { stufe: function () { return stufe; }, setze: setzeStufe };
})();
