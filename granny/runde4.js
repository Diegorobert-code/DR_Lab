/* Granny – Runde 4 (21.10.2026)
   1) Granny winkt zurück, wenn man sie antippt (nutzt Puppe.winkeZurueck, sobald es das gibt)
   2) «Weisst du noch?» – eine Erinnerungsfrage pro Tag, Antworten kommen in die Familien-Schatzkiste (nur auf dem Gerät)
   3) «Mir geht es gut» – ein Tipp, und die Familie bekommt ein Lebenszeichen (Mama schickt es selbst über WhatsApp/SMS)
   4) Familien-Memory – drei Paare, grosse Karten, ganz ohne Zeitdruck
   Alles nur auf dem Gerät, keine Kosten, keine neuen Dienste. */
(function () {
  'use strict';
  var G = window.Granny; if (!G || window.GrannyR4) return;
  var $ = function (id) { return document.getElementById(id); };
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function es() { return G.S.sprache === 'es'; }
  function hol(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function tagNr() { var d = new Date(); return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); }
  function heute() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function pose(p) { if (window.GrannyPlus) GrannyPlus.pose(p); }
  function feier(el, n) { if (!window.GrannyGlanz || !el) return; var r = el.getBoundingClientRect(); GrannyGlanz.feier(r.left + r.width / 2, r.top + r.height / 2, n || 18); GrannyGlanz.summ([10, 40, 10]); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  var css = [
    '.r4-wink{animation:r4Wink 1.1s cubic-bezier(.3,.7,.3,1)}',
    '@keyframes r4Wink{0%{transform:rotate(0)}15%{transform:rotate(-8deg) translateY(-6px)}35%{transform:rotate(7deg) translateY(-6px)}55%{transform:rotate(-5deg) translateY(-3px)}75%{transform:rotate(3deg)}100%{transform:rotate(0)}}',
    '.r4-hand{position:absolute;z-index:4;font-size:44px;pointer-events:none;left:calc(50% + 62px);bottom:120px;transform-origin:70% 90%;animation:r4Hand 1.2s ease-out forwards}',
    '@keyframes r4Hand{0%{opacity:0;transform:scale(.4) rotate(0)}20%{opacity:1;transform:scale(1) rotate(-20deg)}40%{transform:rotate(18deg)}60%{transform:rotate(-14deg)}80%{opacity:1;transform:rotate(10deg)}100%{opacity:0;transform:translateY(-10px) rotate(0)}}',
    '.r4-karte{background:var(--card);border-radius:24px;padding:20px;display:flex;flex-direction:column;gap:14px}',
    '.r4-karte h3{margin:0;font-size:22px;color:var(--gold2);display:flex;gap:10px;align-items:center}',
    '.r4-karte p{margin:0;font-size:22px;line-height:1.35}',
    '.r4-karte .r4-klein{font-size:18px;color:var(--soft)}',
    '.r4-knopf{min-height:64px;border-radius:20px;background:#2b3c78;font-size:22px;font-weight:700;padding:10px 16px;gap:10px}',
    '.r4-knopf.gold{background:var(--gold);color:#2a1d00}',
    '.r4-knopf:active{transform:scale(.97)}',
    '.r4-gut{background:linear-gradient(135deg,#5cc58a,#3f9f6c);color:#06210f;font-size:26px;font-weight:800;border-radius:26px;min-height:96px;gap:12px;box-shadow:0 6px 0 #2f7a50}',
    '.r4-gut small{display:block;font-size:17px;font-weight:600;opacity:.85}',
    '.r4-gut.fertig{background:#24345f;color:var(--text);box-shadow:none}',
    '.r4-feld{width:100%;box-sizing:border-box;min-height:96px;border-radius:16px;border:2px solid #3a4a86;background:#101a3d;color:var(--text);font:inherit;font-size:21px;padding:12px}',
    '.r4-reihe{display:flex;gap:10px}.r4-reihe>*{flex:1}',
    '.r4-memo{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}',
    '.r4-memo button{aspect-ratio:1;border-radius:20px;font-size:46px;background:linear-gradient(145deg,#2b3c78,#1c2a5c);border:3px solid #3a4a86;transition:transform .35s,background .35s;overflow:hidden;padding:0}',
    '.r4-memo button img{width:100%;height:100%;object-fit:cover;display:block}',
    '.r4-memo button.zu::after{content:"🌹";font-size:34px;opacity:.5}',
    '.r4-memo button.zu>*{display:none}',
    '.r4-memo button.offen{background:#fffaf0;border-color:var(--gold);transform:rotateY(0)}',
    '.r4-memo button.paar{border-color:var(--ok);box-shadow:0 0 0 3px rgba(92,197,138,.35)}',
    '.r4-schatz{margin:0;padding:0 0 0 20px;font-size:19px;line-height:1.4;color:var(--soft)}',
    '.r4-schatz b{color:var(--text)}',
    '@media (prefers-reduced-motion:reduce){.r4-wink,.r4-hand{animation:none}.r4-memo button{transition:none}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* Puppe (nova/puppe.js aus #136): flüssiger Gruss über dem Bild. Fehlt sie, greift die eigene Animation. */
  function puppeGruss(img, o) {
    if (!img || !window.Puppe || typeof Puppe.winkeZurueck !== 'function') return false;
    try { var w = img._puppeWinker || Puppe.winkeZurueck(img, Object.assign({ antippen: false, ton: false, blase: false }, o)); if (!w || !w.winke) return false; w.winke(); return true; } catch (e) { return false; }
  }
  /* ---------- 1) Zurückwinken beim Antippen ---------- */
  function winke() {
    var f = $('gfig'); if (!f) return;
    var img = f.querySelector('img');
    // Runde 5: Tinkos «Granny winkt» (Hand frei) – erst das Bild zeigen, dann schwingt genau diese Hand
    if (img && window.Puppe && window.FigurPosen) {
      FigurPosen.zeige(img, 'winken', 3600, ['lachen']).then(function (da) {
        if (!da || !puppeGruss(img, { figur: 'granny', gruss: 'lachen+winken', bild: 'posen/winken.jpg', augen: [[9, 9, 0.01, 0.01]], mund: { l: [9, 9], r: [9.1, 9], oben: 0, unten: 0, kinn: 0.01 }, arm: false, kopf: [0.52, 0.4, 0.3], gesicht: [0.52, 0.44, 0.2], winkArm: { x: 0.14, y: 0.64, r: 0.11, dx: 0.15, dy: 0.92, seite: 'links' } })) puppeGruss(img, { figur: 'granny', gruss: 'lachen+winken' });
      });
      return;
    }
    if (puppeGruss(img, { figur: 'granny', gruss: 'lachen+winken' })) return;
    if (ruhig) return;
    f.classList.remove('r4-wink'); void f.offsetWidth; f.classList.add('r4-wink');
    var b = $('buehne'); if (b) { var h = el('span', 'r4-hand', '👋'); h.setAttribute('aria-hidden', 'true'); b.appendChild(h); setTimeout(function () { h.remove(); }, 1300); }
    if (window.FigurPosen && img) FigurPosen.zeige(img, 'winken', 1800, ['lachen']);
  }
  document.addEventListener('animationend', function (e) { if (e.animationName === 'r4Wink') e.target.classList.remove('r4-wink'); });
  var gf = $('gfig'); if (gf) gf.addEventListener('click', winke);

  /* ---------- Texte ---------- */
  var FR = {
    de: ['Wie hiess deine beste Freundin in der Schule?', 'Was hast du als Kind am liebsten gegessen?', 'Welches Lied hast du früher gerne gesungen?', 'Wo warst du in deinen schönsten Ferien?', 'Wie war dein erstes Zuhause?', 'Was hat deine Mutter immer gesagt?', 'Welches Spiel hast du als Kind geliebt?', 'Wie hast du deinen Liebsten kennengelernt?', 'Welche Blume magst du am meisten, ausser der Rose?', 'Was war dein erster Beruf oder deine erste Arbeit?', 'Welches Fest war früher das schönste?', 'Hattest du ein Haustier? Wie hiess es?', 'Was hast du am Sonntag immer gemacht?', 'Welches Buch oder welche Geschichte magst du?'],
    es: ['¿Cómo se llamaba tu mejor amiga del colegio?', '¿Qué comida te gustaba más de niña?', '¿Qué canción cantabas antes?', '¿Dónde pasaste tus vacaciones más bonitas?', '¿Cómo era tu primera casa?', '¿Qué decía siempre tu madre?', '¿A qué jugabas de niña?', '¿Cómo conociste a tu amor?', '¿Qué flor te gusta, aparte de la rosa?', '¿Cuál fue tu primer trabajo?', '¿Qué fiesta era la más bonita?', '¿Tenías un animal? ¿Cómo se llamaba?', '¿Qué hacías siempre los domingos?', '¿Qué libro o cuento te gusta?']
  };
  var X = {
    de: { weisst: 'Weisst du noch?', erzaehl: '🎙 Erzähl es mir', schreib: '✏️ Schreiben', merk: 'In die Schatzkiste', danke: 'Wie schön! Das kommt in die Familien-Schatzkiste.', schon: 'Danke! Morgen frage ich dich etwas Neues.', schatz: function (n) { return n === 1 ? '1 Erinnerung in der Schatzkiste' : n + ' Erinnerungen in der Schatzkiste'; }, hoer: 'Ich höre dir zu …', feld: 'Hier hineinschreiben …',
      gut: '☀️ Mir geht es gut', gutKlein: function (n) { return 'Ein Tipp, und ' + n + ' weiss Bescheid'; }, gutFertig: '💛 Heute schon gesagt. Danke!', gutText: function (n) { return 'Hallo ' + n + ', mir geht es gut. Liebe Grüsse von Granny 🌹'; }, gutSag: function (n) { return 'Schön! Ich sage ' + n + ', dass es dir gut geht.'; }, gutFehlt: 'Dafür braucht es noch eine Nummer. Deine Familie trägt sie ein.',
      spiel: 'Familien-Memory', spielInfo: 'Finde die Paare. Ganz in Ruhe.', paar: 'Ein Paar! Gut gemacht.', fertig: 'Alle gefunden! Du bist schneller als ich mit meiner Brille.', nochmal: 'Nochmal spielen' },
    es: { weisst: '¿Te acuerdas?', erzaehl: '🎙 Cuéntamelo', schreib: '✏️ Escribir', merk: 'Al cofre', danke: '¡Qué bonito! Lo guardo en el cofre de la familia.', schon: '¡Gracias! Mañana te pregunto otra cosa.', schatz: function (n) { return n === 1 ? '1 recuerdo en el cofre' : n + ' recuerdos en el cofre'; }, hoer: 'Te escucho …', feld: 'Escribe aquí …',
      gut: '☀️ Estoy bien', gutKlein: function (n) { return 'Un toque y ' + n + ' lo sabe'; }, gutFertig: '💛 Hoy ya lo has dicho. ¡Gracias!', gutText: function (n) { return 'Hola ' + n + ', estoy bien. Un abrazo de Granny 🌹'; }, gutSag: function (n) { return '¡Qué bien! Le digo a ' + n + ' que estás bien.'; }, gutFehlt: 'Falta un número. Tu familia lo apunta.',
      spiel: 'Memoria de la familia', spielInfo: 'Encuentra las parejas. Con calma.', paar: '¡Una pareja! Muy bien.', fertig: '¡Todas encontradas! Eres más rápida que yo con mis gafas.', nochmal: 'Jugar otra vez' }
  };
  function t() { return es() ? X.es : X.de; }

  var main = document.querySelector('main');
  var nachHeute = $('heute');

  /* ---------- 2) Mir geht es gut ---------- */
  var gut = el('button', 'r4-gut'); gut.id = 'r4gut'; gut.type = 'button';
  function erster() { return G.S.leute.filter(function (p) { return p.n && p.nr; })[0]; }
  function gutZeigen() {
    var p = erster(), schon = hol('granny.gut', '') === heute();
    gut.classList.toggle('fertig', schon);
    gut.innerHTML = '';
    var a = el('span', null, schon ? t().gutFertig : t().gut); gut.appendChild(a);
    gut.hidden = !p && !schon;
    if (p && !schon) { var s = el('small', null, t().gutKlein(p.n)); a.appendChild(s); }
  }
  gut.addEventListener('click', function () {
    var p = erster(); if (!p) { G.sag(t().gutFehlt); return; }
    leg('granny.gut', heute()); pose('nicken'); feier(gut, 24); G.sag(t().gutSag(p.n));
    var nr = p.nr.replace(/[^\d+]/g, ''), wa = nr.replace(/^\+/, '').replace(/^00/, '');
    var text = encodeURIComponent(t().gutText(p.n));
    setTimeout(function () { location.href = /android|iphone|ipad/i.test(navigator.userAgent) ? 'https://wa.me/' + wa + '?text=' + text : 'sms:' + nr + '?&body=' + text; }, 1600);
    gutZeigen();
  });

  /* ---------- 3) Weisst du noch? ---------- */
  var wk = el('section', 'r4-karte'); wk.id = 'r4weisst'; wk.setAttribute('aria-label', 'Weisst du noch?');
  function schatz() { return hol('granny.schatz', []); }
  function frageHeute() { var l = FR[es() ? 'es' : 'de']; return l[tagNr() % l.length]; }
  function weisstZeigen() {
    wk.innerHTML = '';
    var h = el('h3'); h.append(el('span', null, '💭'), el('span', null, t().weisst)); wk.appendChild(h);
    var schon = hol('granny.weisstTag', '') === heute();
    var q = el('p', null, schon ? t().schon : frageHeute()); wk.appendChild(q);
    if (!schon) {
      var r = el('div', 'r4-reihe');
      var bs = el('button', 'r4-knopf gold', t().erzaehl); bs.type = 'button';
      var bw = el('button', 'r4-knopf', t().schreib); bw.type = 'button';
      r.append(bs, bw); wk.appendChild(r);
      bs.onclick = function () { pose('nicken'); G.sag(frageHeute()); hoeren(bs); };
      bw.onclick = function () { schreiben(); };
    }
    var l = schatz();
    if (l.length) {
      wk.appendChild(el('p', 'r4-klein', '🧺 ' + t().schatz(l.length)));
      var ul = el('ul', 'r4-schatz');
      l.slice(-3).reverse().forEach(function (x) { var li = el('li'); li.append(el('b', null, x.f + ' '), document.createTextNode(x.a)); ul.appendChild(li); });
      wk.appendChild(ul);
    }
  }
  function speichern(a) {
    a = String(a || '').trim(); if (!a) return;
    var l = schatz(); l.push({ f: frageHeute(), a: a.slice(0, 400), t: Date.now() }); leg('granny.schatz', l.slice(-120));
    leg('granny.weisstTag', heute()); pose('herz'); G.sag(t().danke); weisstZeigen(); feier(wk, 30);
  }
  function schreiben() {
    if (wk.querySelector('textarea')) return;
    var ta = el('textarea', 'r4-feld'); ta.placeholder = t().feld; ta.setAttribute('aria-label', frageHeute());
    var ok = el('button', 'r4-knopf gold', t().merk); ok.type = 'button'; ok.onclick = function () { speichern(ta.value); };
    wk.append(ta, ok); ta.focus();
  }
  function hoeren(knopf) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { schreiben(); return; }
    var r; try { r = new SR(); } catch (e) { schreiben(); return; }
    r.lang = es() ? 'es-ES' : 'de-CH'; r.interimResults = false; r.maxAlternatives = 1;
    var alt = knopf.textContent; knopf.textContent = t().hoer;
    r.onresult = function (e) { speichern(e.results[0][0].transcript); };
    r.onerror = function () { knopf.textContent = alt; schreiben(); };
    r.onend = function () { knopf.textContent = alt; };
    setTimeout(function () { try { r.start(); } catch (e) { schreiben(); } }, 1800);
  }

  /* ---------- 4) Familien-Memory ---------- */
  var mk = el('section', 'r4-karte'); mk.id = 'r4memo'; mk.setAttribute('aria-label', 'Familien-Memory');
  var MOTIVE = ['🌹', '☕', '🐦', '🍰', '🌻', '🐈'];
  function memoStart() {
    mk.innerHTML = '';
    var h = el('h3'); h.append(el('span', null, '🃏'), el('span', null, t().spiel)); mk.appendChild(h);
    mk.appendChild(el('p', 'r4-klein', t().spielInfo));
    var fotos = G.S.leute.filter(function (p) { return p.bild; }).map(function (p) { return { b: p.bild, n: p.n }; });
    var motive = MOTIVE.slice().sort(function () { return Math.random() - .5; }).slice(0, 3).map(function (m) { return { e: m }; });
    for (var i = 0; i < fotos.length && i < 3; i++) motive[i] = fotos[i];
    var karten = motive.concat(motive).map(function (m, i) { return { m: m, k: motive.indexOf(m), i: i }; }).sort(function () { return Math.random() - .5; });
    var g = el('div', 'r4-memo'); mk.appendChild(g);
    var offen = [], paare = 0, sperre = false;
    karten.forEach(function (k) {
      var b = el('button', 'zu'); b.type = 'button'; b.setAttribute('aria-label', 'Karte');
      if (k.m.b) { var im = el('img'); im.src = k.m.b; im.alt = k.m.n; b.appendChild(im); } else b.appendChild(el('span', null, k.m.e));
      b.onclick = function () {
        if (sperre || !b.classList.contains('zu')) return;
        b.classList.remove('zu'); b.classList.add('offen'); offen.push({ b: b, k: k.k });
        if (offen.length < 2) return;
        if (offen[0].k === offen[1].k) {
          offen.forEach(function (o) { o.b.classList.add('paar'); }); offen = []; paare++;
          if (paare === 3) { pose('lachen'); G.sag(t().fertig); feier(mk, 40); var n = el('button', 'r4-knopf gold', t().nochmal); n.type = 'button'; n.onclick = memoStart; mk.appendChild(n); }
          else { pose('nicken'); G.sag(t().paar); }
        } else {
          sperre = true;
          setTimeout(function () { offen.forEach(function (o) { o.b.classList.remove('offen'); o.b.classList.add('zu'); }); offen = []; sperre = false; }, 1300);
        }
      };
      g.appendChild(b);
    });
  }

  if (main && nachHeute) {
    nachHeute.after(gut);
    var erz = $('erzaehl') || nachHeute;
    erz.after(wk); wk.after(mk);
  }
  function alles() { gutZeigen(); weisstZeigen(); memoStart(); }
  alles();
  var altZ = window.GrannyPlus && GrannyPlus.gezeichnet;
  if (altZ) GrannyPlus.gezeichnet = function () { altZ(); gutZeigen(); weisstZeigen(); };

  window.GrannyR4 = { winke: winke, schatz: schatz };
})();
