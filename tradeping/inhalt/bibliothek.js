/* DR Lab · Inhalt-Bibliothek
   Zeigt auf der Startseite eine «Heute»-Karte (wechselt jeden Tag) und öffnet eine Bibliothek
   mit Beiträgen, Quiz und Sammlung (Abzeichen). Die Inhalte stehen in inhalt/*.js als Daten:
     window.INHALT = { app, titel, bereiche:[{id,name,emoji}], artikel:[{id,b,t,k,x:[...],s:[...]}], quiz:[{f,a:[],r,e}], ... }
   Fortschritt bleibt nur auf diesem Gerät (localStorage). Kein Netz, keine Konten. */
(function () {
  'use strict';
  var C = window.INHALT;
  if (!C || !C.artikel || !C.artikel.length || window.__ibGeladen) return;
  window.__ibGeladen = true;

  var KEY = 'drlab-inhalt-' + (C.app || 'app');
  var F = C.farben || {};
  var BEREICH = {};
  (C.bereiche || []).forEach(function (b) { BEREICH[b.id] = b; });
  var QUIZ = C.quiz || [];
  var WORT = {
    heute: C.wortHeute || 'Heute',
    bibliothek: C.wortBibliothek || 'Bibliothek',
    quiz: C.wortQuiz || 'Quiz',
    sammlung: C.wortSammlung || 'Sammlung',
    beitrag: C.wortBeitrag || 'Beitrag',
    beitraege: C.wortBeitraege || 'Beiträge',
    gelesen: C.wortGelesen || 'Gelesen'
  };

  /* ---------- Speicher ---------- */
  function lade() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    d = d && typeof d === 'object' ? d : {};
    d.gelesen = d.gelesen || {}; d.gemerkt = d.gemerkt || {}; d.tage = d.tage || {}; d.offen = d.offen || {};
    d.quiz = d.quiz || { runden: 0, richtig: 0, beste: 0, tag: {} };
    d.quiz.tag = d.quiz.tag || {};
    return d;
  }
  var D = lade();
  function sichern() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} }

  /* ---------- Hilfen ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function tagNr(d) { d = d || new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  var WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var MO = ['Jan.', 'Feb.', 'März', 'April', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
  function datumText(d) { d = d || new Date(); return WT[d.getDay()] + ', ' + d.getDate() + '. ' + MO[d.getMonth()]; }

  /* Reihenfolge für «Heute»: abwechselnd aus den Bereichen, damit es jeden Tag anders wirkt. */
  var REIHE = (function () {
    var nach = {}, ord = [];
    C.artikel.forEach(function (a) { if (!nach[a.b]) { nach[a.b] = []; ord.push(a.b); } nach[a.b].push(a); });
    var r = [], i = 0, mehr = true;
    while (mehr) { mehr = false; ord.forEach(function (b) { if (nach[b][i]) { r.push(nach[b][i]); mehr = true; } }); i++; }
    return r;
  })();
  var ART = {}; C.artikel.forEach(function (a) { ART[a.id] = a; });
  function heuteArtikel() { return REIHE[tagNr() % REIHE.length]; }
  function heuteFrage() { return QUIZ.length ? QUIZ[(tagNr() * 7 + 3) % QUIZ.length] : null; }
  function anzahlGelesen() { var n = 0; for (var k in D.gelesen) if (ART[k]) n++; return n; }
  /* Lernt mit: Welche Bereiche öffnest, liest und merkst du am liebsten? Daraus kommt der nächste Vorschlag. */
  function vorlieben() {
    var p = {};
    C.artikel.forEach(function (a) {
      var w = (D.offen[a.id] ? 1 : 0) + (D.gelesen[a.id] ? 2 : 0) + (D.gemerkt[a.id] ? 3 : 0);
      if (w) p[a.b] = (p[a.b] || 0) + w;
    });
    if (D.zuletzt && ART[D.zuletzt]) p[ART[D.zuletzt].b] = (p[ART[D.zuletzt].b] || 0) + 2;
    return p;
  }
  function vorschlag(ohne) {
    var p = vorlieben(), offen = REIHE.filter(function (a) { return !D.gelesen[a.id] && a.id !== ohne; });
    if (!offen.length) return null;
    var best = null, bw = -1;
    offen.forEach(function (a) { var w = p[a.b] || 0; if (w > bw) { bw = w; best = a; } });
    if (bw <= 0) { var start = tagNr() % REIHE.length; for (var i = 1; i <= REIHE.length; i++) { var c = REIHE[(start + i) % REIHE.length]; if (!D.gelesen[c.id] && c.id !== ohne) return { a: c, warum: C.wortTipp || 'Tipp für dich' }; } return { a: offen[0], warum: C.wortTipp || 'Tipp für dich' }; }
    var grund = null;
    Object.keys(D.gemerkt).forEach(function (id) { if (ART[id] && ART[id].b === best.b) grund = grund || ('Weil du «' + ART[id].t + '» gemerkt hast'); });
    if (!grund && D.zuletzt && ART[D.zuletzt] && ART[D.zuletzt].b === best.b) grund = D.zuletzt === ohne ? 'Passt zu dem, was du gerade liest' : 'Weil du «' + ART[D.zuletzt].t + '» ' + (D.gelesen[D.zuletzt] ? 'gelesen' : 'angeschaut') + ' hast';
    if (!grund) grund = 'Weil dich «' + bereichName(best) + '» interessiert';
    return { a: best, warum: grund };
  }
  function anzahlTage() { return Object.keys(D.tage).length; }
  function serie() {
    var n = 0, d = new Date();
    if (!D.tage[iso(d)]) d.setDate(d.getDate() - 1);
    while (D.tage[iso(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function markiereTag() { D.tage[iso()] = 1; }

  /* ---------- Abzeichen ---------- */
  var AB = (C.abzeichen || [
    { id: 'start', emoji: '🌱', name: 'Erster Schritt', text: 'Den ersten ' + WORT.beitrag + ' gelesen.', art: 'gelesen', n: 1 },
    { id: 'fuenf', emoji: '📖', name: 'Neugierig', text: 'Fünf ' + WORT.beitraege + ' gelesen.', art: 'gelesen', n: 5 },
    { id: 'fuenfzehn', emoji: '📚', name: 'Dranbleiberin', text: 'Fünfzehn ' + WORT.beitraege + ' gelesen.', art: 'gelesen', n: 15 },
    { id: 'alle', emoji: '🏆', name: 'Ganze ' + WORT.bibliothek, text: 'Alles gelesen.', art: 'gelesen', n: 'alle' },
    { id: 'tage3', emoji: '🔥', name: 'Drei Tage', text: 'An drei Tagen vorbeigeschaut.', art: 'tage', n: 3 },
    { id: 'tage7', emoji: '✨', name: 'Eine Woche', text: 'An sieben Tagen vorbeigeschaut.', art: 'tage', n: 7 },
    { id: 'quiz1', emoji: '🎯', name: 'Quiz gewagt', text: 'Eine Quizrunde gespielt.', art: 'runden', n: 1 },
    { id: 'quiz25', emoji: '🧠', name: 'Wissensschatz', text: '25 Quizfragen richtig.', art: 'richtig', n: 25 },
    { id: 'merk', emoji: '🔖', name: 'Sammlerin', text: 'Drei ' + WORT.beitraege + ' gemerkt.', art: 'gemerkt', n: 3 }
  ]).slice();
  (C.bereiche || []).forEach(function (b) {
    if (C.artikel.some(function (a) { return a.b === b.id; }))
      AB.push({ id: 'b-' + b.id, emoji: b.emoji || '⭐', name: b.name, text: 'Alles aus «' + b.name + '» gelesen.', art: 'bereich', b: b.id });
  });
  function hat(a) {
    if (a.art === 'gelesen') return anzahlGelesen() >= (a.n === 'alle' ? C.artikel.length : a.n);
    if (a.art === 'tage') return anzahlTage() >= a.n;
    if (a.art === 'runden') return D.quiz.runden >= a.n;
    if (a.art === 'richtig') return D.quiz.richtig >= a.n;
    if (a.art === 'gemerkt') return Object.keys(D.gemerkt).length >= a.n;
    if (a.art === 'bereich') return C.artikel.every(function (x) { return x.b !== a.b || D.gelesen[x.id]; });
    return false;
  }
  function anzahlAbzeichen() { return AB.filter(hat).length; }
  var vorher = {}; AB.forEach(function (a) { vorher[a.id] = hat(a); });
  function neueAbzeichen() {
    var neu = [];
    AB.forEach(function (a) { var h = hat(a); if (h && !vorher[a.id]) neu.push(a); vorher[a.id] = h; });
    if (neu.length) toast(neu[0].emoji + ' Neu in deiner ' + WORT.sammlung + ': ' + neu[0].name);
  }

  /* ---------- Stil (Farben kommen aus dem Design der App) ---------- */
  function v(n, d) { return F[n] || d; }
  var css = [
    '.ib-root,.ib-heute,.ib-toast{--ib-bg:' + v('bg', '#fff') + ';--ib-s:' + v('surface', '#fff') + ';--ib-s2:' + v('surface2', '#f4f4f4') + ';--ib-soft:' + v('soft', '#eee') + ';--ib-i:' + v('ink', '#222') + ';--ib-i2:' + v('ink2', '#555') + ';--ib-l:' + v('line', '#ddd') + ';--ib-a:' + v('accent', '#335') + ';--ib-on:' + v('onAccent', '#fff') + ';--ib-ai:' + v('accentInk', v('accent', '#335')) + ';--ib-ft:' + v('fontTitle', 'Georgia,serif') + ';--ib-fb:' + v('fontBody', 'system-ui,sans-serif') + ';--ib-r:' + v('radius', '16px') + ';--ib-sh:' + v('shadow', '0 1px 2px rgba(0,0,0,.05),0 8px 22px rgba(0,0,0,.06)') + '}',
    '.ib-heute{display:block;box-sizing:border-box;width:100%;margin:' + v('cardMargin', '18px 0') + ';padding:18px;border-radius:var(--ib-r);background:var(--ib-s);color:var(--ib-i);border:1px solid var(--ib-l);box-shadow:var(--ib-sh);font-family:var(--ib-fb);text-align:left}',
    '.ib-heute *{box-sizing:border-box}',
    '.ib-oben{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;font-size:13px;color:var(--ib-i2);font-weight:600;letter-spacing:.02em}',
    '.ib-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:var(--ib-soft);color:var(--ib-i);font-size:12.5px;font-weight:600;white-space:nowrap}',
    '.ib-heute h3{margin:0 0 6px;font:600 21px/1.25 var(--ib-ft);color:var(--ib-i)}',
    '.ib-heute p{margin:0 0 14px;font-size:15.5px;line-height:1.5;color:var(--ib-i2)}',
    '.ib-zeile{display:flex;gap:10px;flex-wrap:wrap}',
    '.ib-k{appearance:none;-webkit-appearance:none;border:1px solid var(--ib-l);background:var(--ib-s2);color:var(--ib-i);min-height:46px;padding:0 16px;border-radius:999px;font:600 15px var(--ib-fb);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;touch-action:manipulation}',
    '.ib-k.voll{background:var(--ib-a);color:var(--ib-on);border-color:transparent}',
    '.ib-k:focus-visible,.ib-root button:focus-visible,.ib-root input:focus-visible{outline:3px solid var(--ib-ai);outline-offset:2px}',
    '.ib-balken{height:6px;border-radius:99px;background:var(--ib-s2);overflow:hidden;margin-top:14px}',
    '.ib-balken i{display:block;height:100%;background:var(--ib-a);border-radius:99px}',
    '.ib-fuer{display:block;width:100%;text-align:left;margin-top:14px;padding:12px 14px;border-radius:12px;border:1px dashed var(--ib-l);background:var(--ib-s2);color:var(--ib-i);font-family:var(--ib-fb);cursor:pointer}',
    '.ib-fuer small{display:block;font-size:12.5px;color:var(--ib-i2);margin-bottom:3px}',
    '.ib-fuer b{display:block;font-size:15px;line-height:1.35}',
    '.ib-mini{font-size:12.5px;color:var(--ib-i2);margin-top:6px}',
    /* Vollbild */
    '.ib-root{position:fixed;inset:0;z-index:2147483200;background:var(--ib-bg);color:var(--ib-i);font-family:var(--ib-fb);display:flex;flex-direction:column;opacity:0;transform:translateY(12px);transition:opacity .22s ease,transform .22s ease}',
    '.ib-root.auf{opacity:1;transform:none}',
    '.ib-root *{box-sizing:border-box}',
    '.ib-kopf{flex:0 0 auto;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 0;background:var(--ib-bg);border-bottom:1px solid var(--ib-l)}',
    '.ib-kz{display:flex;align-items:center;gap:10px}',
    '.ib-kz h2{flex:1;margin:0;font:600 20px/1.2 var(--ib-ft);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ib-zu{flex:0 0 auto;width:44px;height:44px;border-radius:50%;border:1px solid var(--ib-l);background:var(--ib-s);color:var(--ib-i);font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center}',
    '.ib-tabs{display:flex;gap:4px;margin:10px -4px 0;overflow-x:auto;scrollbar-width:none}',
    '.ib-tabs::-webkit-scrollbar{display:none}',
    '.ib-tab{flex:1 0 auto;appearance:none;border:0;background:none;color:var(--ib-i2);font:600 14.5px var(--ib-fb);padding:10px 10px 12px;border-bottom:3px solid transparent;cursor:pointer;min-height:44px}',
    '.ib-tab[aria-selected=true]{color:var(--ib-i);border-bottom-color:var(--ib-a)}',
    '.ib-notruf{display:flex;gap:6px;margin-top:10px}',
    '.ib-notruf a{flex:1;min-height:40px;display:flex;align-items:center;justify-content:center;gap:5px;border-radius:12px;background:#3a2236;color:#ffe3de;text-decoration:none;font:500 13.5px var(--ib-fb);white-space:nowrap}',
    '.ib-notruf a b{color:#fff;font-size:16px}',
    '.ib-inhalt{flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:18px 16px calc(40px + env(safe-area-inset-bottom,0px))}',
    '.ib-wrap{max-width:640px;margin:0 auto}',
    '.ib-karte{background:var(--ib-s);border:1px solid var(--ib-l);border-radius:var(--ib-r);padding:18px;margin-bottom:14px;box-shadow:var(--ib-sh)}',
    '.ib-karte h3{margin:0 0 8px;font:600 22px/1.25 var(--ib-ft)}',
    '.ib-karte h4{margin:0 0 8px;font:600 17px/1.3 var(--ib-fb)}',
    '.ib-karte p{margin:0 0 12px;font-size:16px;line-height:1.6;color:var(--ib-i)}',
    '.ib-lead{color:var(--ib-i2)!important}',
    '.ib-schritte{margin:4px 0 12px;padding:14px 16px;border-radius:12px;background:var(--ib-soft);list-style:none;counter-reset:s}',
    '.ib-schritte li{position:relative;padding-left:30px;margin:0 0 8px;font-size:15.5px;line-height:1.5;counter-increment:s}',
    '.ib-schritte li:last-child{margin-bottom:0}',
    '.ib-schritte li::before{content:counter(s);position:absolute;left:0;top:1px;width:21px;height:21px;border-radius:50%;background:var(--ib-a);color:var(--ib-on);font:700 12px/21px var(--ib-fb);text-align:center}',
    '.ib-hinweis{font-size:13.5px!important;color:var(--ib-i2)!important;line-height:1.5!important;border-top:1px solid var(--ib-l);padding-top:12px;margin-top:6px!important}',
    '.ib-chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;margin-bottom:10px;scrollbar-width:none}',
    '.ib-chips::-webkit-scrollbar{display:none}',
    '.ib-chips button{flex:0 0 auto;min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--ib-l);background:var(--ib-s);color:var(--ib-i);font:600 14px var(--ib-fb);cursor:pointer;white-space:nowrap}',
    '.ib-chips button[aria-pressed=true]{background:var(--ib-a);color:var(--ib-on);border-color:transparent}',
    '.ib-suche{width:100%;min-height:46px;border-radius:12px;border:1px solid var(--ib-l2,var(--ib-l));background:var(--ib-s);color:var(--ib-i);padding:0 14px;font:16px var(--ib-fb);margin-bottom:12px}',
    '.ib-liste{list-style:none;margin:0;padding:0}',
    '.ib-liste li{margin:0 0 8px}',
    '.ib-eintrag{width:100%;display:flex;align-items:center;gap:12px;text-align:left;padding:12px 14px;border-radius:14px;border:1px solid var(--ib-l);background:var(--ib-s);color:var(--ib-i);cursor:pointer;font-family:var(--ib-fb)}',
    '.ib-em{flex:0 0 40px;width:40px;height:40px;border-radius:12px;background:var(--ib-soft);display:flex;align-items:center;justify-content:center;font-size:20px}',
    '.ib-et{flex:1;min-width:0}',
    '.ib-et b{display:block;font-size:15.5px;line-height:1.3}',
    '.ib-et small{display:block;font-size:13.5px;color:var(--ib-i2);line-height:1.35;margin-top:2px}',
    '.ib-ok{flex:0 0 auto;font-size:13px;font-weight:700;color:var(--ib-ai)}',
    '.ib-leer{text-align:center;color:var(--ib-i2);padding:24px 0}',
    '.ib-opt{display:block;width:100%;text-align:left;margin:0 0 8px;padding:13px 14px;min-height:48px;border-radius:12px;border:1px solid var(--ib-l);background:var(--ib-s2);color:var(--ib-i);font:500 15.5px/1.4 var(--ib-fb);cursor:pointer}',
    '.ib-opt.richtig{border-color:#2e7d4f;background:#e3f4ea;color:#14532d}',
    '.ib-opt.falsch{border-color:#b3412f;background:#fbe7e3;color:#6b1d12}',
    '.ib-erkl{margin:6px 0 0;padding:12px 14px;border-radius:12px;background:var(--ib-soft);font-size:15px;line-height:1.5}',
    '.ib-stand{display:flex;justify-content:space-between;font-size:13.5px;color:var(--ib-i2);margin-bottom:10px}',
    '.ib-gitter{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}',
    '.ib-ab{border:1px solid var(--ib-l);border-radius:14px;padding:14px 12px;background:var(--ib-s);text-align:center}',
    '.ib-ab .e{font-size:30px;line-height:1;display:block;margin-bottom:6px}',
    '.ib-ab b{display:block;font-size:14.5px;line-height:1.3}',
    '.ib-ab small{display:block;font-size:12.5px;color:var(--ib-i2);margin-top:4px;line-height:1.35}',
    '.ib-ab.zu{opacity:.5}',
    '.ib-ab.zu .e{filter:grayscale(1)}',
    '.ib-zahlen{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}',
    '.ib-zahlen div{background:var(--ib-s);border:1px solid var(--ib-l);border-radius:14px;padding:12px 6px;text-align:center}',
    '.ib-zahlen b{display:block;font:600 24px var(--ib-ft)}',
    '.ib-zahlen small{font-size:12px;color:var(--ib-i2)}',
    '.ib-toast{position:fixed;left:50%;bottom:calc(90px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483300;background:var(--ib-i);color:var(--ib-bg);padding:12px 18px;border-radius:14px;font:600 14.5px var(--ib-fb);box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:calc(100% - 32px);text-align:center;pointer-events:none;opacity:0;transition:opacity .2s}',
    '.ib-toast.an{opacity:1}',
    '@media (prefers-reduced-motion:reduce){.ib-root{transition:none;transform:none}}',
    C.css || ''
  ].join('\n');
  var st = document.createElement('style'); st.id = 'ib-stil'; st.textContent = css; document.head.appendChild(st);

  /* ---------- Kleinteile ---------- */
  var toastEl = null, toastT = 0;
  function toast(t) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'ib-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = t; toastEl.classList.add('an');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('an'); }, 2600);
  }
  function emoji(a) { return a.e || (BEREICH[a.b] && BEREICH[a.b].emoji) || '•'; }
  function bereichName(a) { return (BEREICH[a.b] && BEREICH[a.b].name) || ''; }

  /* ---------- Heute-Karte auf der Startseite ---------- */
  var karte = null;
  function karteBauen() {
    var anker = C.anker ? document.querySelector(C.anker) : null;
    if (!anker) return;
    karte = document.createElement('section');
    karte.className = 'ib-heute';
    karte.setAttribute('aria-label', (C.heuteLabel || WORT.heute) + ': ' + (C.titel || WORT.bibliothek));
    var lage = C.lage || 'after';
    if (lage === 'before') anker.parentNode.insertBefore(karte, anker);
    else if (lage === 'prepend') anker.insertBefore(karte, anker.firstChild);
    else if (lage === 'append') anker.appendChild(karte);
    else anker.parentNode.insertBefore(karte, anker.nextSibling);
    karteFuellen();
  }
  function karteFuellen() {
    if (!karte) return;
    var a = heuteArtikel(), n = anzahlGelesen(), tot = C.artikel.length;
    karte.innerHTML =
      '<div class="ib-oben"><span>' + esc((C.heuteLabel || WORT.heute) + ' · ' + datumText()) + '</span><span class="ib-chip">' + esc(emoji(a) + ' ' + bereichName(a)) + '</span></div>' +
      '<h3>' + esc(a.t) + '</h3><p>' + esc(a.k) + '</p>' +
      '<div class="ib-zeile"><button type="button" class="ib-k voll" data-ib="heute">' + esc(D.gelesen[a.id] ? (C.wortNochmal || 'Nochmals lesen') : (C.wortLesen || 'Jetzt lesen')) + (D.gelesen[a.id] ? ' ✓' : '') + '</button>' +
      '<button type="button" class="ib-k" data-ib="bib">' + esc(C.titelKurz || WORT.bibliothek) + ' · ' + tot + '</button></div>' +
      (function () { var v = vorschlag(a.id); return v && (D.zuletzt || Object.keys(D.gemerkt).length) ? '<button type="button" class="ib-fuer" data-ib="fuer" data-id="' + esc(v.a.id) + '"><small>' + esc(v.warum) + ':</small><b>' + esc(emoji(v.a) + ' ' + v.a.t) + ' →</b></button>' : ''; })() +
      '<div class="ib-balken" aria-hidden="true"><i style="width:' + Math.round(n / tot * 100) + '%"></i></div>' +
      '<div class="ib-mini">' + n + ' von ' + tot + ' ' + esc(WORT.gelesen.toLowerCase()) + ' · ' + anzahlAbzeichen() + ' von ' + AB.length + ' Abzeichen' + (serie() > 1 ? ' · ' + serie() + ' Tage am Stück' : '') + '</div>';
    karte.querySelector('[data-ib=heute]').addEventListener('click', function () { oeffne('artikel', a.id); });
    karte.querySelector('[data-ib=bib]').addEventListener('click', function () { oeffne('bibliothek'); });
    var fu = karte.querySelector('[data-ib=fuer]'); if (fu) fu.addEventListener('click', function () { oeffne('artikel', fu.getAttribute('data-id')); });
  }

  /* ---------- Vollbild ---------- */
  var root = null, inhaltEl = null, tab = 'heute', filter = 'alle', suche = '', zuletzt = null, quizRunde = null;
  function oeffne(was, id) {
    zuletzt = document.activeElement;
    if (!root) {
      root = document.createElement('div');
      root.className = 'ib-root';
      root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-label', C.titel || WORT.bibliothek);
      root.innerHTML = '<div class="ib-kopf"><div class="ib-kz"><h2></h2><button type="button" class="ib-zu" aria-label="Schliessen">✕</button></div>' +
        (C.notruf ? '<div class="ib-notruf" role="region" aria-label="Notruf">' + C.notruf + '</div>' : '') +
        '<div class="ib-tabs" role="tablist"></div></div><div class="ib-inhalt"><div class="ib-wrap"></div></div>';
      document.body.appendChild(root);
      root.querySelector('h2').textContent = C.titel || WORT.bibliothek;
      inhaltEl = root.querySelector('.ib-wrap');
      root.querySelector('.ib-zu').addEventListener('click', schliesse);
      root.addEventListener('keydown', function (e) { if (e.key === 'Escape') schliesse(); });
      var tabs = [['heute', WORT.heute], ['bibliothek', WORT.bibliothek]];
      if (QUIZ.length) tabs.push(['quiz', WORT.quiz]);
      tabs.push(['sammlung', WORT.sammlung]);
      root.querySelector('.ib-tabs').innerHTML = tabs.map(function (t) { return '<button type="button" class="ib-tab" role="tab" data-tab="' + t[0] + '">' + esc(t[1]) + '</button>'; }).join('');
      root.querySelector('.ib-tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) zeige(b.getAttribute('data-tab')); });
    }
    root.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { root.classList.add('auf'); });
    if (was === 'artikel') zeigeArtikel(id); else zeige(was || 'heute');
    setTimeout(function () { var z = root.querySelector('.ib-zu'); if (z) z.focus({ preventScroll: true }); }, 30);
  }
  function schliesse() {
    if (!root) return;
    stumm();
    root.classList.remove('auf');
    document.documentElement.style.overflow = '';
    setTimeout(function () { if (root && !root.classList.contains('auf')) root.style.display = 'none'; }, 230);
    karteFuellen();
    if (zuletzt && zuletzt.focus) try { zuletzt.focus({ preventScroll: true }); } catch (e) {}
  }
  function tabsMarkieren(t) {
    [].forEach.call(root.querySelectorAll('.ib-tab'), function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === t ? 'true' : 'false'); });
  }
  function nachOben() { var s = root.querySelector('.ib-inhalt'); if (s) s.scrollTop = 0; }
  function zeige(t) {
    stumm();
    tab = t; tabsMarkieren(t); nachOben();
    if (t === 'heute') return zeigeHeute();
    if (t === 'bibliothek') return zeigeBibliothek();
    if (t === 'quiz') return zeigeQuiz();
    return zeigeSammlung();
  }

  function zeigeHeute() {
    var a = heuteArtikel(), q = heuteFrage();
    var h = '<div class="ib-karte"><div class="ib-oben"><span>' + esc(datumText()) + '</span><span class="ib-chip">' + esc(emoji(a) + ' ' + bereichName(a)) + '</span></div>' +
      '<h3>' + esc(a.t) + '</h3><p class="ib-lead">' + esc(a.k) + '</p>' +
      '<button type="button" class="ib-k voll" data-auf="' + esc(a.id) + '">' + (D.gelesen[a.id] ? 'Nochmals lesen ✓' : 'Lesen') + '</button></div>';
    if (q) {
      var tq = D.quiz.tag[iso()];
      h += '<div class="ib-karte" id="ibTagesfrage"><h4>' + esc(C.wortTagesfrage || 'Frage des Tages') + '</h4><p>' + esc(q.f) + '</p>' +
        q.a.map(function (o, i) {
          var kl = tq != null ? (i === q.r ? ' richtig' : (i === tq ? ' falsch' : '')) : '';
          return '<button type="button" class="ib-opt' + kl + '" data-tf="' + i + '"' + (tq != null ? ' disabled' : '') + '>' + esc(o) + '</button>';
        }).join('') + (tq != null && q.e ? '<p class="ib-erkl">' + esc(q.e) + '</p>' : '') + '</div>';
    }
    var vh = vorschlag(a.id);
    if (vh) h += '<div class="ib-karte"><h4>Für dich</h4><button type="button" class="ib-fuer" style="margin-top:0" data-auf="' + esc(vh.a.id) + '"><small>' + esc(vh.warum) + ':</small><b>' + esc(emoji(vh.a) + ' ' + vh.a.t) + ' →</b></button></div>';
    if (C.heuteExtra) h += C.heuteExtra;
    h += '<div class="ib-karte"><h4>Dein Stand</h4>' + zahlen() + '<div class="ib-zeile"><button type="button" class="ib-k" data-gehe="bibliothek">Alle ' + esc(WORT.beitraege) + '</button>' + (QUIZ.length ? '<button type="button" class="ib-k" data-gehe="quiz">' + esc(WORT.quiz) + ' starten</button>' : '') + '</div></div>';
    inhaltEl.innerHTML = h;
    binde();
    [].forEach.call(inhaltEl.querySelectorAll('[data-tf]'), function (b) {
      b.addEventListener('click', function () {
        if (D.quiz.tag[iso()] != null) return;
        var i = +b.getAttribute('data-tf');
        D.quiz.tag[iso()] = i; if (i === q.r) D.quiz.richtig++;
        markiereTag(); sichern(); neueAbzeichen(); zeigeHeute();
        var f = document.getElementById('ibTagesfrage'); if (f && f.scrollIntoView) f.scrollIntoView({ block: 'nearest' });
      });
    });
  }
  function zahlen() {
    return '<div class="ib-zahlen"><div><b>' + anzahlGelesen() + '</b><small>' + esc(WORT.gelesen) + '</small></div><div><b>' + anzahlAbzeichen() + '</b><small>Abzeichen</small></div><div><b>' + serie() + '</b><small>Tage am Stück</small></div></div>';
  }
  function binde() {
    [].forEach.call(inhaltEl.querySelectorAll('[data-auf]'), function (b) { b.addEventListener('click', function () { zeigeArtikel(b.getAttribute('data-auf')); }); });
    [].forEach.call(inhaltEl.querySelectorAll('[data-gehe]'), function (b) { b.addEventListener('click', function () { zeige(b.getAttribute('data-gehe')); }); });
  }

  function zeigeBibliothek() {
    var bs = (C.bereiche || []).filter(function (b) { return C.artikel.some(function (a) { return a.b === b.id; }); });
    var h = '<input class="ib-suche" type="search" placeholder="' + esc(C.wortSuche || 'Suchen …') + '" aria-label="Suchen" value="' + esc(suche) + '">' +
      '<div class="ib-chips" role="group" aria-label="Bereiche"><button type="button" data-f="alle" aria-pressed="' + (filter === 'alle') + '">Alle · ' + C.artikel.length + '</button>' +
      (Object.keys(D.gemerkt).length ? '<button type="button" data-f="gemerkt" aria-pressed="' + (filter === 'gemerkt') + '">🔖 Gemerkt</button>' : '') +
      bs.map(function (b) { return '<button type="button" data-f="' + esc(b.id) + '" aria-pressed="' + (filter === b.id) + '">' + esc((b.emoji ? b.emoji + ' ' : '') + b.name) + '</button>'; }).join('') + '</div>' +
      '<ul class="ib-liste"></ul>';
    inhaltEl.innerHTML = h;
    var ein = inhaltEl.querySelector('.ib-suche');
    ein.addEventListener('input', function () { suche = ein.value; liste(); });
    [].forEach.call(inhaltEl.querySelectorAll('[data-f]'), function (b) {
      b.addEventListener('click', function () { filter = b.getAttribute('data-f'); zeigeBibliothek(); });
    });
    liste();
  }
  function liste() {
    var q = suche.trim().toLowerCase();
    var l = C.artikel.filter(function (a) {
      if (filter === 'gemerkt' && !D.gemerkt[a.id]) return false;
      if (filter !== 'alle' && filter !== 'gemerkt' && a.b !== filter) return false;
      if (q && (a.t + ' ' + a.k + ' ' + (a.x || []).join(' ')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var ul = inhaltEl.querySelector('.ib-liste');
    ul.innerHTML = l.length ? l.map(function (a) {
      return '<li><button type="button" class="ib-eintrag" data-auf="' + esc(a.id) + '"><span class="ib-em" aria-hidden="true">' + esc(emoji(a)) + '</span><span class="ib-et"><b>' + esc(a.t) + '</b><small>' + esc(a.k) + '</small></span>' + (D.gelesen[a.id] ? '<span class="ib-ok" aria-label="' + esc(WORT.gelesen) + '">✓</span>' : '') + '</button></li>';
    }).join('') : '<li class="ib-leer">Nichts gefunden. Probier ein anderes Wort.</li>';
    [].forEach.call(ul.querySelectorAll('[data-auf]'), function (b) { b.addEventListener('click', function () { zeigeArtikel(b.getAttribute('data-auf')); }); });
  }

  function zeigeArtikel(id) {
    stumm();
    var a = ART[id]; if (!a) return zeige('bibliothek');
    tabsMarkieren(tab === 'heute' ? 'heute' : 'bibliothek'); nachOben();
    D.offen[a.id] = (D.offen[a.id] || 0) + 1; D.zuletzt = a.id; sichern();
    var i = C.artikel.indexOf(a), vs = vorschlag(a.id), next = vs ? vs.a : C.artikel[(i + 1) % C.artikel.length];
    var h = '<div class="ib-karte"><div class="ib-oben"><span>' + esc(bereichName(a)) + '</span><span class="ib-chip" aria-hidden="true">' + esc(emoji(a)) + '</span></div>' +
      '<h3>' + esc(a.t) + '</h3><p class="ib-lead">' + esc(a.k) + '</p>' +
      (a.x || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      (a.s && a.s.length ? '<h4>' + esc(a.sTitel || C.wortSchritte || 'So gehst du vor') + '</h4><ol class="ib-schritte">' + a.s.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' : '') +
      (a.h || C.hinweis ? '<p class="ib-hinweis">' + esc(a.h || C.hinweis) + '</p>' : '') +
      '<div class="ib-zeile">' +
      '<button type="button" class="ib-k voll" data-ok>' + (D.gelesen[a.id] ? esc(WORT.gelesen) + ' ✓' : 'Als ' + esc(WORT.gelesen.toLowerCase()) + ' markieren') + '</button>' +
      '<button type="button" class="ib-k" data-merk aria-pressed="' + !!D.gemerkt[a.id] + '">' + (D.gemerkt[a.id] ? '🔖 Gemerkt' : '🔖 Merken') + '</button>' +
      (('speechSynthesis' in window) && C.vorlesen !== false ? '<button type="button" class="ib-k" data-vor>🔊 Vorlesen</button>' : '') +
      '</div></div>' +
      '<button type="button" class="ib-fuer" style="margin:0 0 12px" data-auf="' + esc(next.id) + '"><small>' + esc(vs ? vs.warum : 'Als Nächstes') + ':</small><b>' + esc(emoji(next) + ' ' + next.t) + ' →</b></button>' +
      '<div class="ib-zeile"><button type="button" class="ib-k" data-gehe="bibliothek">← Alle ' + esc(WORT.beitraege) + '</button></div>';
    inhaltEl.innerHTML = h;
    binde();
    inhaltEl.querySelector('[data-ok]').addEventListener('click', function () {
      if (!D.gelesen[a.id]) { D.gelesen[a.id] = iso(); markiereTag(); sichern(); toast(C.wortDanke || 'Schön, gelesen ✓'); neueAbzeichen(); }
      this.textContent = WORT.gelesen + ' ✓';
    });
    inhaltEl.querySelector('[data-merk]').addEventListener('click', function () {
      if (D.gemerkt[a.id]) delete D.gemerkt[a.id]; else D.gemerkt[a.id] = 1;
      sichern(); neueAbzeichen();
      this.setAttribute('aria-pressed', !!D.gemerkt[a.id]); this.textContent = D.gemerkt[a.id] ? '🔖 Gemerkt' : '🔖 Merken';
    });
    var vb = inhaltEl.querySelector('[data-vor]');
    if (vb) vb.addEventListener('click', function () {
      try {
        if (speechSynthesis.speaking) { stumm(); vb.textContent = '🔊 Vorlesen'; return; }
        var u = new SpeechSynthesisUtterance([a.t, a.k].concat(a.x || [], a.s || []).join('. '));
        u.lang = 'de-CH'; u.rate = 0.95;
        u.onend = function () { vb.textContent = '🔊 Vorlesen'; };
        speechSynthesis.speak(u); vb.textContent = '⏹ Stopp';
      } catch (e) {}
    });
  }
  function stumm() { try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} }

  /* ---------- Quiz: Runden zu 5 Fragen ---------- */
  function mischen(l) { l = l.slice(); for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = l[i]; l[i] = l[j]; l[j] = t; } return l; }
  function zeigeQuiz() {
    quizRunde = null;
    inhaltEl.innerHTML = '<div class="ib-karte"><h3>' + esc(C.quizTitel || WORT.quiz) + '</h3><p class="ib-lead">' + esc(C.quizText || ('Fünf Fragen pro Runde, aus ' + QUIZ.length + ' im Topf. Kein Druck: Bei jeder Antwort gibt es eine kurze Erklärung.')) + '</p>' +
      '<div class="ib-zahlen"><div><b>' + D.quiz.runden + '</b><small>Runden</small></div><div><b>' + D.quiz.richtig + '</b><small>richtig</small></div><div><b>' + D.quiz.beste + '/5</b><small>beste Runde</small></div></div>' +
      '<button type="button" class="ib-k voll" data-los>Runde starten</button></div>';
    inhaltEl.querySelector('[data-los]').addEventListener('click', function () { quizRunde = { fragen: mischen(QUIZ).slice(0, 5), i: 0, punkte: 0 }; frage(); });
  }
  function frage() {
    var R = quizRunde, q = R.fragen[R.i]; nachOben();
    inhaltEl.innerHTML = '<div class="ib-karte"><div class="ib-stand"><span>Frage ' + (R.i + 1) + ' von ' + R.fragen.length + '</span><span>' + R.punkte + ' richtig</span></div>' +
      '<h4>' + esc(q.f) + '</h4>' + q.a.map(function (o, i) { return '<button type="button" class="ib-opt" data-o="' + i + '">' + esc(o) + '</button>'; }).join('') + '<div data-nach></div></div>';
    [].forEach.call(inhaltEl.querySelectorAll('[data-o]'), function (b) {
      b.addEventListener('click', function () {
        var i = +b.getAttribute('data-o'), ok = i === q.r;
        if (ok) { R.punkte++; D.quiz.richtig++; }
        var sp = inhaltEl.querySelector('.ib-stand span:last-child'); if (sp) sp.textContent = R.punkte + ' richtig';
        [].forEach.call(inhaltEl.querySelectorAll('[data-o]'), function (x) { x.disabled = true; var j = +x.getAttribute('data-o'); if (j === q.r) x.classList.add('richtig'); else if (j === i) x.classList.add('falsch'); });
        var nach = inhaltEl.querySelector('[data-nach]');
        nach.innerHTML = '<p class="ib-erkl"><b>' + (ok ? 'Richtig. ' : 'Nicht ganz. ') + '</b>' + esc(q.e || '') + '</p><div class="ib-zeile" style="margin-top:12px"><button type="button" class="ib-k voll" data-weiter>' + (R.i + 1 < R.fragen.length ? 'Weiter' : 'Auswertung') + '</button></div>';
        sichern();
        nach.querySelector('[data-weiter]').addEventListener('click', function () { R.i++; if (R.i < R.fragen.length) frage(); else ende(); });
        nach.querySelector('[data-weiter]').focus({ preventScroll: false });
      });
    });
  }
  function ende() {
    var R = quizRunde; D.quiz.runden++; if (R.punkte > D.quiz.beste) D.quiz.beste = R.punkte;
    markiereTag(); sichern(); neueAbzeichen(); nachOben();
    var satz = R.punkte === 5 ? 'Alles richtig. Stark!' : R.punkte >= 3 ? 'Schön gemacht. Du weisst schon viel.' : 'Jede Runde bringt etwas Neues. Gut, dass du dranbleibst.';
    inhaltEl.innerHTML = '<div class="ib-karte"><h3>' + R.punkte + ' von ' + R.fragen.length + '</h3><p class="ib-lead">' + esc(satz) + '</p><div class="ib-zeile"><button type="button" class="ib-k voll" data-nochmal>Neue Runde</button><button type="button" class="ib-k" data-gehe="sammlung">Zur ' + esc(WORT.sammlung) + '</button></div></div>';
    binde();
    inhaltEl.querySelector('[data-nochmal]').addEventListener('click', function () { quizRunde = { fragen: mischen(QUIZ).slice(0, 5), i: 0, punkte: 0 }; frage(); });
  }

  function zeigeSammlung() {
    var bs = (C.bereiche || []).filter(function (b) { return C.artikel.some(function (a) { return a.b === b.id; }); });
    var h = '<div class="ib-karte"><h3>' + esc(C.sammlungTitel || ('Deine ' + WORT.sammlung)) + '</h3><p class="ib-lead">' + esc(C.sammlungText || 'Alles bleibt nur auf diesem Handy. Nichts wird gesendet.') + '</p>' + zahlen() + '</div>' +
      '<div class="ib-karte"><h4>Fortschritt nach Bereich</h4>' + bs.map(function (b) {
        var alle = C.artikel.filter(function (a) { return a.b === b.id; }), g = alle.filter(function (a) { return D.gelesen[a.id]; }).length;
        return '<div style="margin:0 0 12px"><div class="ib-stand" style="margin:0 0 4px;color:var(--ib-i)"><span>' + esc((b.emoji || '') + ' ' + b.name) + '</span><span>' + g + '/' + alle.length + '</span></div><div class="ib-balken" style="margin:0"><i style="width:' + Math.round(g / alle.length * 100) + '%"></i></div></div>';
      }).join('') + '</div>' +
      '<h4 style="margin:18px 0 10px;font:600 17px var(--ib-fb)">Abzeichen · ' + anzahlAbzeichen() + ' von ' + AB.length + '</h4><div class="ib-gitter">' +
      AB.map(function (a) { var ok = hat(a); return '<div class="ib-ab' + (ok ? '' : ' zu') + '"><span class="e" aria-hidden="true">' + esc(a.emoji) + '</span><b>' + esc(a.name) + '</b><small>' + esc(a.text) + (ok ? '' : ' (noch offen)') + '</small></div>'; }).join('') + '</div>';
    inhaltEl.innerHTML = h;
  }

  /* Öffentlich, damit andere Teile der App die Bibliothek öffnen können. */
  window.DRLAB_INHALT = { oeffne: oeffne, schliesse: schliesse, heute: heuteArtikel };

  function los() { karteBauen(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
