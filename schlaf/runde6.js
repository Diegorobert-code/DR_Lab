/* Runde 6 (21.10.2026): «Noch mehr Eigenschaften».
   1) Gruss nach Tageszeit und Jahreszeit (Herbst, Halloween 31.10., Advent, Winter …), merkt sich deinen Namen
   2) Charakter-Karte: über ein Dutzend Sätze, die zeigen, wie die Figur so ist; sie merkt sich, was du magst
   3) Figuren-Besuch: jeden Tag schaut eine andere DR-Lab-Figur vorbei, Nova zeigt ihr den Weg
   4) Überraschung des Tages mit Sammelleiste (24 Fächer); vom 1. bis 24. Dezember wird daraus der Adventskalender
   5) 🎧 Nur hören (Handystimme) und A+ grosse Schrift; Tippflächen mind. 44 px, ARIA-Beschriftungen
   6) Eigener Adventskalender (24 eigene Türchen, eigene Sammlung) und Saison-Karten der Figur (z. B. Halloween-Laterne)
   Alles bleibt nur auf diesem Gerät. */
(function () {
  'use strict';
  var C = {
    k: 'fiasnest', figur: 'Fia', bild: 'posen/liegt.jpg', zoom: '.screen',
    saisonBild: { halloween: 'saison/halloween.jpg', halloweenTag: 'saison/halloween.jpg', advent: 'saison/advent.jpg' } /* Runde 6b: Fias Halloween-Bild */, saisonZiel: '#home .buehne',
    hallo: ['{gruss}! Fia wartet im Nest.', '{gruss}, {name}! Fia wartet im Nest.'],
    nameFrage: 'Wie heisst du? Fia merkt sich deinen Namen, nur auf diesem Handy.',
    nameDank: 'Fia kuschelt sich ins Nest: {name}. Schön, dass du da bist.',
    tageszeit: {
      morgen: 'Guten Morgen. Fia fliegt zuerst ins Licht. Sie sagt: Morgenlicht stellt die innere Uhr.',
      mittag: 'Mittag. Fia macht ein kurzes Nickerchen im Nest, höchstens zwanzig Minuten.',
      nachmittag: 'Nachmittag. Fias Koffein-Uhr sagt: Ab jetzt lieber Kräutertee.',
      abend: 'Abend. Fia legt ihre Sorgen ins Nest und lässt die Glut langsam kleiner werden.',
      nacht: 'Nacht. Fia schläft. Wenn du wach liegst: Glutmodus, ganz dunkel, ganz ruhig.'
    },
    saison: {
      herbst: 'Herbst. Die Abende werden früher dunkel. Fia nutzt das: Licht dimmen, ruhiger werden.',
      halloween: 'Noch {n} Tage bis Halloween. In Fias Nest steht eine kleine Kürbislaterne. Sie leuchtet warm, nicht gruselig.',
      halloweenTag: 'Halloween! Die Kinder im Städtchen sind unterwegs. Fia bleibt im Nest und hört von weitem ihr Lachen.',
      november: 'November. Früh dunkel, spät hell. Fia geht jetzt etwas früher ins Nest.',
      advent: 'Advent. Heute leuchtet Kerze {n} im Nest. Fia mag das ruhige Licht vor dem Schlafen.',
      weihnacht: 'Frohe Weihnachten. Fia wünscht dir eine ruhige, warme Nacht.',
      neujahr: 'Ein neues Jahr. Nach einer langen Nacht darf der Schlaf ein bisschen länger sein.',
      winter: 'Winter. Kühles Schlafzimmer, warme Decke. So mag Fia es.',
      fruehling: 'Frühling. Die Vögel singen früher. Vorhänge zu, wenn du länger schlafen willst.',
      sommer: 'Sommer. Helle Abende. Fia dunkelt ihr Nest ab, damit die Nacht kommen kann.'
    },
    charTitel: 'So ist Fia am Abend', satzKnopf: 'Noch etwas über Fia',
    saetze: [
      ['Nest', 'Fias Nest ist aus Zweigen, Moos und einer einzigen goldenen Feder gebaut. Die Feder ist von ihrer Mama.'],
      ['Macke', 'Bevor Fia schläft, dreht sie sich dreimal im Nest. Dann seufzt sie einmal. Erst dann ist es gemütlich.'],
      ['Fias Spruch', '«Sorgen dürfen ins Feuer. Morgen sind sie kleiner.»'],
      ['Glut', 'Nachts wird Fias Glut ganz klein. Sie geht nie aus, sie ruht nur.'],
      ['Lieblingsklang', 'Fias liebster Klang zum Einschlafen: Regen auf dem Dach. Gleich danach: Grillen.'],
      ['Geheimnis', 'Fia hat manchmal auch unruhige Nächte. Dann sagt sie: Eine Nacht ist nur eine Nacht.'],
      ['Freunde', 'Otti kommt manchmal und erzählt Fia eine Gute-Nacht-Geschichte. Meistens schläft sie vor dem Ende ein.'],
      ['Lieblingsplatz', 'Fias liebster Platz ist der Nestrand. Von dort sieht sie die Lichter im Städtchen ausgehen, eins nach dem anderen.'],
      ['Tipp von Fia', 'Bildschirm weg, eine halbe Stunde vor dem Schlafen. Fia steckt dann den Kopf unter den Flügel.'],
      ['Macke', 'Fia zählt keine Schafe. Sie zählt Sterne. Meistens kommt sie bis sieben.'],
      ['Morgen', 'Am Morgen fliegt Fia zuerst ins Licht. Erst dann frühstückt sie.'],
      ['Fias Spruch', '«Ruhe ist kein Nichtstun. Ruhe ist Auftanken.»'],
      ['Herz', 'Fia freut sich über jeden Abend, an dem du vorbeischaust. Auch wenn es spät ist.'],
      ['Traum', 'Fia träumt oft vom Fliegen über ein Meer aus Wolken. Ganz leise, ganz langsam.']
    ],
    vorliebe: {
      frage: 'Was hilft dir am Abend am meisten?',
      optionen: [['tee', '🍵 Ein Tee'], ['lesen', '📖 Lesen'], ['atmen', '🌬️ Atmen'], ['klang', '🎧 Ruhige Klänge'], ['dunkel', '🌑 Dunkelheit']],
      merk: 'Fia hat es sich gemerkt: Am Abend hilft dir {x}. Sie legt es dir heute in Gedanken ans Nest.'
    },
    besuchTitel: 'Besuch am Nest',
    besuch: [
      { name: 'Otti', bild: 'besuch/otti.jpg', satz: 'Otti klettert den Berg hoch und erzählt Fia eine Gute-Nacht-Geschichte. Nach drei Sätzen schläft sie.', morgen: 'Otti hat eine neue Geschichte vom Mond.', link: '<a class="r6-btn" href="../otti/">Zu Otti 🦔</a>' },
      { name: 'Rosa', bild: 'besuch/granny.jpg', satz: 'Rosa bringt Lindenblütentee und eine warme Decke. «Für die kühlen Nächte, Fia.»', morgen: 'Rosa strickt Fia vielleicht ein Nestkissen.', link: '<a class="r6-btn" href="../granny/">Zu Rosa 👵</a>' },
      { name: 'Wäf Wäf', bild: 'besuch/waefwaef.jpg', satz: 'Wäf Wäf rollt sich unter dem Nest ein. Er dreht sich dreimal, genau wie Fia.', morgen: 'Wäf Wäf schläft morgen vielleicht wieder hier.', link: '<a class="r6-btn" href="../waefwaef/">Zu Wäf Wäf 🐾</a>' },
      { name: 'Hasi', bild: 'besuch/hasi.jpg', satz: 'Hasi hat seinen Kiosk geschlossen und schaut auf dem Heimweg vorbei. Er nickt Fia leise zu.', morgen: 'Hasi bringt Fia ein Säckchen Lavendel.', link: '<a class="r6-btn" href="../hasi/">Zu Hasi 🐰</a>' },
      { name: 'Mama Affe', bild: 'besuch/mama-affe.jpg', satz: 'Mama Affe gähnt so herzhaft, dass Fia mitgähnen muss. Gähnen ist ansteckend.', morgen: 'Mama Affe erzählt von ihrem Abendritual.', link: '<a class="r6-btn" href="../mama-affe/">Zu Mama Affe 🐒</a>' }
    ],
    uebTitel: 'Fias Nestfund des Tages',
    alleGesammelt: 'Fia hat aus allen Fundstücken ein weiches Nest gebaut. Es gehört dir.',
    ueberraschung: [
      ['🪶', 'Eine weiche Feder für dein Kissen. Sie riecht nach Sommerwind.'],
      ['🍵', 'Ein Abend-Tee ohne Koffein: Melisse, Lindenblüte oder Kamille.'],
      ['🌙', 'Ein Mondstrahl. Fia sagt: Heute Abend das grosse Licht früher ausmachen.'],
      ['🕯️', 'Mini-Ritual: Eine Kerze, fünf Minuten nur schauen. Dann ausblasen.'],
      ['📖', 'Ein Buch auf Papier statt Bildschirm. Zehn Seiten reichen.'],
      ['🌬️', 'Mini-Übung: Vier Sekunden ein, sechs aus. Fünfmal. Fia atmet mit.'],
      ['🧦', 'Warme Füsse helfen vielen beim Einschlafen. Heute Bettsocken?'],
      ['🪵', 'Ein Holzscheit für Fias Glut. Es knistert leise.'],
      ['🌌', 'Ein Blick in den Nachthimmel, eine Minute lang. Fia sucht mit.'],
      ['✍️', 'Mini-Ritual: Schreib drei Dinge auf, die heute gut waren.'],
      ['🛁', 'Eine warme Dusche am Abend. Danach kühlt der Körper ab und wird müde.'],
      ['🌿', 'Ein Lavendelzweig vom Berg. Fia legt ihn neben dein Kissen.'],
      ['📵', 'Fia legt das Handy heute früher ins Körbchen. Machst du mit?'],
      ['🌡️', 'Fias Tipp: Lieber ein kühles Zimmer und eine warme Decke.'],
      ['🎧', 'Ein leiser Klang: Regen auf dem Dach. Im Nest unter «Im Bett» zu finden.'],
      ['☀️', 'Ein Morgenfunke: Morgen früh zuerst ans Licht, dann kommt der Schlaf am Abend leichter.'],
      ['🧺', 'Ein Körbchen für Sorgen. Was hineinkommt, darf bis morgen warten.'],
      ['🌘', 'Die Nacht hat Zeit. Du musst nichts erzwingen. Fia sagt: Ruhen zählt auch.'],
      ['🫖', 'Mini-Ritual: Die Teetasse mit beiden Händen halten und die Wärme spüren.'],
      ['⭐', 'Fia zählt heute Sterne mit dir. Eins, zwei, drei …'],
      ['🧘', 'Mini-Übung: Von den Zehen bis zur Stirn, jeden Teil einmal schwer werden lassen.'],
      ['🔥', 'Ein kleiner Funke Glut. Er hält dich warm, bis du schläfst.'],
      ['🌧️', 'Ein Regentropfen am Fenster. Hör zu, wie er hinunterrinnt.'],
      ['💛', 'Ein goldenes Nest. Fia sagt: Schön, dass du gut zu dir schaust.']
    ],
    advent: [
      ['🕯️', 'Kerze 1: Fia zündet die erste Adventskerze im Nest an. Fünf Minuten nur schauen.'],
      ['🍵', 'Ein Wintertee mit Zimt und Apfel, ganz ohne Koffein.'],
      ['🧦', 'Kuschelsocken für die langen Nächte.'],
      ['⭐', 'Ein Strohstern über dem Nest. Er leuchtet im Kerzenlicht.'],
      ['📖', 'Heute eine Wintergeschichte vor dem Schlafen, auf Papier.'],
      ['🎅', 'Samichlaus-Tag. Fia hat eine Mandarine und drei Nüsse ins Nest gelegt.'],
      ['❄️', 'Erster Schnee auf dem Berg. Draussen ist es ganz still.'],
      ['🌬️', 'Mini-Übung: Atme so langsam aus, dass die Kerze nur leicht flackert.'],
      ['🌲', 'Ein Tannenzweig im Zimmer. Der Duft beruhigt.'],
      ['🧣', 'Ein warmer Schal von Rosa für Fias Nest.'],
      ['🌙', 'Die Nächte sind am längsten. Fia geniesst das viele Dunkel.'],
      ['🫖', 'Mini-Ritual: Wärmflasche ins Bett, zehn Minuten vor dem Schlafen.'],
      ['🔔', 'Ein Glöckchen. Hör zu, bis der Ton ganz verklungen ist.'],
      ['✍️', 'Schreib einen Satz: Was hat dir dieses Jahr gut getan?'],
      ['🍎', 'Ein Bratapfel-Duft zieht durchs Städtchen.'],
      ['🪵', 'Fias Glut und ein warmer Ofen. Knister, knister.'],
      ['✨', 'Lichterkette statt Deckenlampe: Heute Abend nur sanftes Licht.'],
      ['🎶', 'Ein leises Adventslied zum Einschlafen.'],
      ['🌌', 'Sterne über dem Schnee. Fia zählt bis sieben und schläft ein.'],
      ['💌', 'Ein Gute-Nacht-Gruss an jemanden, den du gern hast.'],
      ['🌟', 'Längste Nacht des Jahres. Ab morgen kommt das Licht zurück.'],
      ['🛌', 'Frisch bezogenes Bett. Fia findet: Das ist das schönste Geschenk.'],
      ['🎄', 'Fia legt eine goldene Feder unter den Baum.'],
      ['💛', 'Heiligabend. Fia wünscht dir eine stille, warme Nacht. Frohe Weihnachten!']
    ],
    einsetzen: function (N, H) {
      var home = document.getElementById('home'); if (!home) return;
      var st = document.createElement('style');
      st.textContent = '#home .r6-karte,#home .r6-gruss{margin:16px 0}#home .buehne .r6-saisonbild{border-radius:28px}';
      document.head.appendChild(st);
      var j = home.querySelector('#jetzt'); if (j) j.after(N.gruss);
      var w = home.querySelector('#weltKarte');
      if (w) { w.before(N.ueberraschung); N.ueberraschung.after(N.charakter); N.charakter.after(N.besuch); }
      // Kalender-Überraschung: Zeitumstellung (letzter Sonntag im März und Oktober), sechs Tage vorher bis zum Tag selbst
      function letzterSonntag(j, m) { var d = new Date(j, m + 1, 0); d.setDate(d.getDate() - d.getDay()); return d; }
      var heute = new Date(H.jetzt.getFullYear(), H.jetzt.getMonth(), H.jetzt.getDate());
      [[9, 'zurückgestellt: eine Stunde mehr Nacht. Fia rät: Am Morgen danach zur gewohnten Zeit aufstehen und ins Licht.'],
       [2, 'vorgestellt: eine Stunde weniger Nacht. Fia rät: Ein paar Abende vorher etwas früher ins Nest.']].forEach(function (x) {
        var so = letzterSonntag(heute.getFullYear(), x[0]), tage = Math.round((so - heute) / 864e5);
        if (tage < 0 || tage > 6) return;
        var p = document.createElement('p'); p.className = 'r6-klein';
        p.textContent = '🕰️ ' + (tage === 0 ? 'Letzte Nacht wurde' : tage === 1 ? 'Heute Nacht wird' : 'In der Nacht auf Sonntag, ' + so.getDate() + '.' + (so.getMonth() + 1) + '., wird') + ' die Uhr eine Stunde ' + x[1];
        N.gruss.querySelector('.r6-gz div').appendChild(p);
      });
    }
};
  if (window['R6_' + C.k]) return;
  var K = C.k + '.r6.';
  function hol(k, d) { try { var v = localStorage.getItem(K + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; }
  function summ(m) { try { if (navigator.vibrate && !ruhig) navigator.vibrate(m); } catch (e) {} }
  var ruhig = !!C.ruhig || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var jetzt = new Date();
  /* Test-Schalter: ?r6tag=2026-10-31&r6zeit=19 zeigt einen anderen Tag */
  try {
    var q = new URLSearchParams(location.search); if (!q.get('r6tag')) try { q = new URL(performance.getEntriesByType('navigation')[0].name).searchParams; } catch (x) {} var qt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(q.get('r6tag') || '');
    if (qt) jetzt = new Date(+qt[1], +qt[2] - 1, +qt[3], jetzt.getHours(), jetzt.getMinutes());
    if (q.get('r6zeit')) jetzt.setHours(+q.get('r6zeit'));
  } catch (e) {}
  var M = jetzt.getMonth() + 1, D = jetzt.getDate(), Std = jetzt.getHours();
  var heute = jetzt.getFullYear() + '-' + M + '-' + D;
  var tagNr = Math.floor((jetzt.getTime() - jetzt.getTimezoneOffset() * 6e4) / 864e5);
  var F = C.figur;

  /* ---------- Stimme (Handystimme, nur wenn vorhanden) ---------- */
  var kannReden = !C.stumm && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
  var redet = null;
  function stimme() {
    try { var v = speechSynthesis.getVoices(); return v.filter(function (x) { return /de-CH/i.test(x.lang); })[0] || v.filter(function (x) { return /^de/i.test(x.lang); })[0] || null; } catch (e) { return null; }
  }
  function sag(t, fertig) {
    if (!kannReden) { if (fertig) fertig(); return; }
    still();
    try {
      var u = new SpeechSynthesisUtterance(String(t).replace(/[«»]/g, '')); u.lang = 'de-CH'; u.rate = 0.92; u.pitch = 1;
      var v = stimme(); if (v) u.voice = v;
      u.onend = u.onerror = function () { if (redet === u) { redet = null; if (fertig) fertig(); } };
      redet = u; speechSynthesis.speak(u);
    } catch (e) { if (fertig) fertig(); }
  }
  function still() { redet = null; try { speechSynthesis.cancel(); } catch (e) {} }

  /* ---------- Tageszeit und Jahreszeit ---------- */
  function tageszeit() { return Std < 5 ? 'nacht' : Std < 11 ? 'morgen' : Std < 14 ? 'mittag' : Std < 18 ? 'nachmittag' : Std < 22 ? 'abend' : 'nacht'; }
  var GRUSS = { morgen: 'Guten Morgen', mittag: 'Hoi', nachmittag: 'Grüezi', abend: 'Guten Abend', nacht: 'Gute Nacht' };
  var TZ_EMO = { morgen: '🌅', mittag: '☀️', nachmittag: '🌤️', abend: '🌙', nacht: '✨' };
  function saison() {
    if (M === 10 && D === 31) return { k: 'halloweenTag', e: '🎃' };
    if (M === 10 && D >= 17) return { k: 'halloween', e: '🎃', n: 31 - D };
    if (M === 12 && D <= 24) return { k: 'advent', e: '🕯️', n: D };
    if (M === 12 && D <= 26) return { k: 'weihnacht', e: '🎄' };
    if (M === 12 || (M === 1 && D <= 6)) return { k: 'neujahr', e: '🎆' };
    if (M <= 2) return { k: 'winter', e: '❄️' };
    if (M <= 5) return { k: 'fruehling', e: '🌷' };
    if (M <= 8) return { k: 'sommer', e: '🌻' };
    if (M === 11) return { k: 'november', e: '🍂' };
    return { k: 'herbst', e: '🍁' };
  }
  var S = saison();
  /* Saison-Bild (Tinko): an Halloween (31.10.) und im Advent zeigt die Figur das passende Bild */
  var SB = C.saisonBild && (C.saisonBild[S.k] || (S.k === 'weihnacht' && C.saisonBild.advent)) || '';
  if (SB) C.bild = SB;
  function meinName() { var n = hol('name', ''); if (!n && C.nameHol) try { n = C.nameHol() || ''; } catch (e) {} return n; }
  function fuell(t) { return String(t || '').replace(/\{n\}/g, S.n).replace(/\{name\}/g, meinName() || C.du || 'du').replace(/\{figur\}/g, F); }
  function saisonSatz() { return fuell(C.saison[S.k] || C.saison[S.k === 'neujahr' ? 'winter' : 'herbst']); }

  /* ---------- Stil ---------- */
  var css = [
    '.r6{--r6g:#f2c14e;--r6g2:#ffe08a;--r6t:#fffaf0;--r6m:#c9d2ee;color:var(--r6t);font-size:16px;line-height:1.45}',
    '.r6-karte{margin:16px 0;padding:16px;border-radius:18px;background:linear-gradient(160deg,rgba(38,58,130,.62),rgba(16,26,62,.9));border:1px solid rgba(242,193,78,.32);box-shadow:0 10px 26px rgba(0,0,0,.22);position:relative;overflow:hidden;text-align:left}',
    '.r6-karte h2{margin:0 0 10px;font-size:19px;line-height:1.25;color:var(--r6g2);font-weight:800}',
    '.r6-gruss{margin:12px 0 16px;padding:14px 16px;border-radius:18px;background:linear-gradient(120deg,rgba(242,193,78,.2),rgba(111,140,255,.12));border:1px solid rgba(242,193,78,.4);text-align:left}',
    '.r6-gz{display:flex;gap:12px;align-items:flex-start}',
    '.r6-emo{font-size:30px;line-height:1;flex:none;width:44px;height:44px;display:grid;place-items:center;border-radius:14px;background:rgba(14,24,56,.55)}',
    '.r6-hallo{display:block;font-size:19px;color:var(--r6g2);font-weight:800}',
    '.r6-saison{display:block;margin-top:2px;color:var(--r6t);opacity:.92}',
    '.r6-leiste,.r6-reihe{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
    '.r6-k,.r6-btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:999px;border:1px solid rgba(242,193,78,.55);background:rgba(14,24,56,.55);color:var(--r6t);font-weight:700;font-size:15px;line-height:1.25;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;transition:transform .15s,background .2s}',
    '.r6-btn.voll{background:var(--r6g);color:#14204a;border-color:var(--r6g)}',
    '.r6-k:active,.r6-btn:active{transform:scale(.97)}',
    '.r6-k[aria-pressed=true]{background:var(--r6g);color:#14204a}',
    '.r6 :focus-visible{outline:3px solid var(--r6g2);outline-offset:2px}',
    '.r6 [hidden]{display:none!important}',
    '.r6-nameform{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:flex-end}',
    '.r6-nameform label{flex:1 1 180px;display:flex;flex-direction:column;gap:4px;font-weight:700;color:var(--r6m);font-size:14px}',
    '.r6-nameform input{min-height:44px;padding:8px 12px;border-radius:12px;border:1px solid rgba(242,193,78,.5);background:rgba(8,14,36,.7);color:var(--r6t);font-size:16px;font-family:inherit}',
    '.r6-char-in{display:flex;gap:14px;align-items:center}',
    '.r6-bild{flex:none;width:96px;height:96px;padding:0;border-radius:50%;overflow:hidden;border:3px solid var(--r6g);background:#0e1838;cursor:pointer}',
    '.r6-bild img{width:100%;height:100%;object-fit:cover;display:block}',
    '.r6-bild.hops{animation:r6Hops .7s cubic-bezier(.3,.7,.3,1)}',
    '@keyframes r6Hops{30%{transform:translateY(-6px) rotate(-3deg)}60%{transform:translateY(-2px) rotate(2deg)}}',
    '.r6-blase{flex:1;margin:0;padding:12px 14px;border-radius:16px 16px 16px 4px;background:rgba(255,250,240,.96);color:#1d2550;font-size:16px;line-height:1.45;min-height:64px;transition:opacity .25s}',
    '.r6-blase small{display:block;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#a1781b;margin-bottom:2px}',
    '.r6-blase.weg{opacity:0}',
    '.r6-klein{margin:10px 0 0;font-size:14px;color:var(--r6m)}',
    '.r6-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}',
    '.r6-chips button{min-height:44px;padding:8px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:var(--r6t);font-weight:600;font-size:15px;line-height:1.25;font-family:inherit;cursor:pointer}',
    '.r6-chips button[aria-pressed=true]{border-color:var(--r6g);background:rgba(242,193,78,.22)}',
    '.r6-vorliebe{margin-top:14px;padding-top:12px;border-top:1px dashed rgba(242,193,78,.3)}',
    '.r6-vorliebe p{margin:0}',
    '.r6-b-in{display:flex;gap:14px;align-items:center}',
    '.r6-b-in img{flex:none;width:96px;height:96px;border-radius:18px;object-fit:cover;border:2px solid rgba(242,193,78,.6);background:#0e1838}',
    '.r6-b-in b{display:block;font-size:17px;color:var(--r6g2)}',
    '.r6-b-in p{margin:4px 0 0}',
    '.r6-geschenk{width:100%;min-height:96px;border-radius:16px;border:2px dashed rgba(242,193,78,.65);background:rgba(242,193,78,.1);color:var(--r6t);font-weight:800;font-size:17px;line-height:1.25;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px}',
    '.r6-geschenk span{font-size:40px}',
    '.r6-fund{display:flex;gap:14px;align-items:center;padding:12px;border-radius:16px;background:rgba(255,250,240,.08);border:1px solid rgba(242,193,78,.45)}',
    '.r6-fund.neu{animation:r6Auf .5s ease-out}',
    '@keyframes r6Auf{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}',
    '.r6-fe{flex:none;font-size:40px;width:64px;height:64px;display:grid;place-items:center;border-radius:16px;background:rgba(14,24,56,.6)}',
    '.r6-fund p{margin:0}',
    '.r6-sammel{display:grid;grid-template-columns:repeat(6,44px);gap:6px;justify-content:start;margin-top:12px}',
    '.r6-sammel button,.r6-sammel i{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-size:20px;font-style:normal}',
    '.r6-sammel i{border:1px dashed rgba(255,255,255,.18);color:rgba(255,255,255,.3);font-size:12px}',
    '.r6-sammel button{border:1px solid rgba(242,193,78,.5);background:rgba(242,193,78,.14);cursor:pointer;padding:0}',
    '.r6-sammel .heute{box-shadow:0 0 0 2px var(--r6g2)}',
    '.r6-funke{position:absolute;pointer-events:none;color:var(--r6g2);font-size:18px;animation:r6Funke 1.3s ease-out forwards}',
    '@keyframes r6Funke{from{opacity:1;transform:translate(0,0) scale(.6)}to{opacity:0;transform:translate(var(--dx),-70px) scale(1.1)}}',
    '.r6-hoer{position:fixed;inset:0;z-index:100001;background:rgba(5,9,24,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px;text-align:center;color:#fffaf0}',
    '.r6-hoer img{width:160px;height:160px;border-radius:50%;object-fit:cover;border:3px solid #f2c14e;opacity:.85}',
    '.r6-hoer p{margin:0;font-size:20px;max-width:340px;line-height:1.45}',
    '.r6-hoer small{color:#c9d2ee;font-size:15px}',
    '.r6-kinder .r6-frage{font-size:20px;line-height:1.45;margin:6px 0 0;color:var(--r6t)}',
    'html.r6-gross ' + (C.zoom || 'main') + '{zoom:1.15}',
    '@media (prefers-reduced-motion:reduce){.r6-bild.hops,.r6-fund.neu,.r6-funke{animation:none}.r6-funke{display:none}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- Feier (sanft) ---------- */
  function feier(karte) {
    summ([10, 40, 10]);
    if (ruhig || !karte) return;
    for (var i = 0; i < 9; i++) {
      var f = document.createElement('span'); f.className = 'r6-funke'; f.textContent = i % 3 ? '✦' : '★';
      f.style.left = (20 + Math.random() * 60) + '%'; f.style.top = (45 + Math.random() * 30) + '%';
      f.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px'); f.style.animationDelay = (i * 60) + 'ms';
      karte.appendChild(f); setTimeout(function (x) { return function () { x.remove(); }; }(f), 1600 + i * 60);
    }
  }

  /* ---------- Nur hören ---------- */
  function nurHoeren(text) {
    var o = el('<div class="r6-hoer" role="dialog" aria-modal="true" aria-label="Nur hören"><img alt="" src="' + esc(C.bild) + '"><p>🎧 Augen zu, Ohren auf.</p><small>' + esc(F) + ' liest dir vor. Tipp irgendwo, dann hört es auf.</small><button type="button" class="r6-btn voll">Fertig</button></div>');
    function zu() { still(); o.remove(); }
    o.onclick = zu; document.body.appendChild(o);
    o.querySelector('button').focus();
    sag(text, function () { setTimeout(zu, 900); });
  }

  /* ---------- 1) Gruss ---------- */
  var tz = tageszeit();
  var g = el('<section class="r6 r6-gruss" aria-label="Begrüssung von ' + esc(F) + '">' +
    '<div class="r6-gz"><span class="r6-emo" aria-hidden="true"></span><div><b class="r6-hallo"></b><span class="r6-saison"></span><span class="r6-saison r6-tz"></span></div></div>' +
    '<div class="r6-leiste"><button type="button" class="r6-k" data-r6="name">✎ Mein Name</button>' +
    '<button type="button" class="r6-k" data-r6="gross" aria-pressed="false" aria-label="Grosse Schrift ein oder aus">A+ Grosse Schrift</button>' +
    (kannReden && C.vorlesen !== false ? '<button type="button" class="r6-k" data-r6="hoeren">🎧 Vorlesen</button>' : '') + '</div>' +
    '<form class="r6-nameform" hidden><label>' + esc(C.nameFrage || 'Wie heisst du?') + '<input name="n" maxlength="24" autocomplete="given-name" enterkeyhint="done"></label><button class="r6-btn voll" type="submit">Merken</button></form></section>');
  function grussZeigen() {
    var n = meinName();
    g.querySelector('.r6-emo').textContent = S.k === 'halloween' || S.k === 'halloweenTag' || S.k === 'advent' || S.k === 'weihnacht' ? S.e : TZ_EMO[tz];
    g.querySelector('.r6-hallo').textContent = fuell(C.hallo ? C.hallo[n ? 1 : 0] : '') || (GRUSS[tz] + (n ? ', ' + n : '') + '!');
    g.querySelector('.r6-hallo').textContent = g.querySelector('.r6-hallo').textContent.replace('{gruss}', GRUSS[tz]);
    g.querySelector('.r6-saison').textContent = saisonSatz();
    g.querySelector('.r6-tz').textContent = fuell(C.tageszeit[tz]);
    g.querySelector('[data-r6=name]').textContent = n ? '✎ ' + n : '✎ Mein Name';
  }
  var gross = hol('gross', false);
  function grossSetzen() { document.documentElement.classList.toggle('r6-gross', !!gross); g.querySelector('[data-r6=gross]').setAttribute('aria-pressed', String(!!gross)); }
  g.addEventListener('click', function (e) {
    var b = e.target.closest('[data-r6]'); if (!b) return;
    var a = b.getAttribute('data-r6');
    if (a === 'name') { var f = g.querySelector('form'); f.hidden = !f.hidden; if (!f.hidden) { f.n.value = meinName(); f.n.focus(); } }
    if (a === 'gross') { gross = !gross; leg('gross', gross); grossSetzen(); summ(8); }
    if (a === 'hoeren') { if (redet) { still(); return; } sag(g.querySelector('.r6-hallo').textContent + ' ' + g.querySelector('.r6-saison').textContent + ' ' + g.querySelector('.r6-tz').textContent); }
  });
  g.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault(); var v = this.n.value.trim().slice(0, 24); leg('name', v); this.hidden = true; grussZeigen(); naechsterSatz(true);
    if (v) { g.querySelector('.r6-tz').textContent = fuell(C.nameDank); summ([10, 30, 10]); }
  });

  /* ---------- 2) Charakter ---------- */
  var gesehen = hol('saetze', []), letzter = -1, aktSatz = '';
  var c = el('<section class="r6 r6-karte r6-char" aria-labelledby="r6ct-' + C.k + '"><h2 id="r6ct-' + C.k + '">💛 ' + esc(C.charTitel || ('So ist ' + F)) + '</h2>' +
    '<div class="r6-char-in"><button type="button" class="r6-bild" aria-label="' + esc(F) + ' antippen: noch etwas über ' + esc(F) + '"><img alt="" loading="lazy" src="' + esc(C.bild) + '"></button>' +
    '<p class="r6-blase" aria-live="polite"></p></div>' +
    '<div class="r6-reihe"><button type="button" class="r6-btn voll" data-r6="satz">' + esc(C.satzKnopf || 'Noch etwas über ' + F) + '</button>' +
    (kannReden && C.vorlesen !== false ? '<button type="button" class="r6-btn" data-r6="lies" aria-label="Satz vorlesen">🎧</button>' : '') + '</div>' +
    '<p class="r6-klein r6-entdeckt"></p>' +
    (C.vorliebe ? '<div class="r6-vorliebe"></div>' : '') + '</section>');
  function naechsterSatz(still) {
    var L = C.saetze, i;
    var neu = L.map(function (_, j) { return j; }).filter(function (j) { return gesehen.indexOf(j) < 0 && j !== letzter; });
    var pool = neu.length ? neu : L.map(function (_, j) { return j; }).filter(function (j) { return j !== letzter; });
    i = pool[Math.floor(Math.random() * pool.length)]; letzter = i;
    if (gesehen.indexOf(i) < 0) { gesehen.push(i); leg('saetze', gesehen); }
    var b = c.querySelector('.r6-blase'), s = L[i];
    aktSatz = fuell(s[1]);
    var zeig = function () { b.innerHTML = '<small>' + esc(s[0]) + '</small>' + esc(fuell(s[1])); b.classList.remove('weg'); };
    if (still || ruhig) zeig(); else { b.classList.add('weg'); setTimeout(zeig, 180); }
    var n = gesehen.length;
    c.querySelector('.r6-entdeckt').textContent = n >= L.length ? '🌟 Du kennst jetzt alle ' + L.length + ' Seiten von ' + F + '. Wer weiss, was noch dazukommt …' : n + ' von ' + L.length + ' Seiten von ' + F + ' entdeckt';
    if (!still && n === L.length && hol('alleFeier', '') !== 'ja') { leg('alleFeier', 'ja'); feier(c); }
  }
  c.addEventListener('click', function (e) {
    var b = e.target.closest('.r6-bild,[data-r6]'); if (!b) return;
    var a = b.getAttribute('data-r6');
    if (a === 'lies') { if (redet) { still(); return; } sag(aktSatz); return; }
    if (a === 'vorliebe') { leg('vorliebe', b.getAttribute('data-v')); vorliebeZeigen(); summ([10, 30, 10]); return; }
    if (a === 'vorliebeNeu') { leg('vorliebe', ''); vorliebeZeigen(); return; }
    if (b.classList.contains('r6-bild') && !ruhig) { b.classList.remove('hops'); void b.offsetWidth; b.classList.add('hops'); }
    naechsterSatz(false); summ(8);
  });
  function vorliebeZeigen() {
    var v = C.vorliebe; if (!v) return; var box = c.querySelector('.r6-vorliebe'), m = hol('vorliebe', '');
    var o = v.optionen.filter(function (x) { return x[0] === m; })[0];
    if (o) box.innerHTML = '<p>' + esc(fuell(v.merk).replace('{x}', o[1])) + '</p><div class="r6-reihe"><button type="button" class="r6-btn" data-r6="vorliebeNeu">Ändern</button></div>';
    else box.innerHTML = '<p><b>' + esc(fuell(v.frage)) + '</b></p><div class="r6-chips" role="group" aria-label="' + esc(v.frage) + '">' +
      v.optionen.map(function (x) { return '<button type="button" data-r6="vorliebe" data-v="' + esc(x[0]) + '" aria-pressed="false">' + esc(x[1]) + '</button>'; }).join('') + '</div>';
  }

  /* ---------- 3) Besuch ---------- */
  var B = C.besuch || [], bi = tagNr % (B.length || 1), bes = B[bi];
  var bk = bes ? el('<section class="r6 r6-karte r6-besuch" aria-labelledby="r6bt-' + C.k + '"><h2 id="r6bt-' + C.k + '">🚪 ' + esc(C.besuchTitel || 'Besuch bei ' + F) + '</h2>' +
    '<div class="r6-b-in"><img alt="' + esc(bes.name) + ' schaut vorbei" loading="lazy" width="96" height="96" src="' + esc(bes.bild) + '"><div><b>Heute schaut ' + esc(bes.name) + ' vorbei</b><p>' + esc(bes.satz) + '</p></div></div>' +
    '<p class="r6-klein">🧭 Nova hat ' + esc(bes.name) + ' den Weg gezeigt. Nova kennt alle Figuren und verbindet sie.</p>' +
    '<div class="r6-reihe">' + (bes.link || '') + '<button type="button" class="r6-btn" data-r6="morgen">Wer kommt morgen?</button></div></section>') : null;
  if (bk) bk.addEventListener('click', function (e) {
    var b = e.target.closest('[data-r6=morgen]'); if (!b) return;
    var m = B[(bi + 1) % B.length]; b.outerHTML = '<p class="r6-klein" style="margin:0;align-self:center">Morgen klopft vielleicht ' + esc(m.name) + ' an. ' + esc(m.morgen || '') + '</p>';
  });

  /* ---------- 4) Überraschung / Adventskalender ---------- */
  var advent = S.k === 'advent', U = advent && C.advent ? C.advent : C.ueberraschung, SK = advent && C.advent ? 'advent' + jetzt.getFullYear() : 'sammel';
  var ui = advent ? D - 1 : tagNr % U.length;
  var u = el('<section class="r6 r6-karte r6-ueb" aria-labelledby="r6ut-' + C.k + '"><h2 id="r6ut-' + C.k + '"></h2><div class="r6-paket"></div>' +
    '<div class="r6-sammel" role="group" aria-label="Sammelleiste"></div><p class="r6-klein r6-zahl" aria-live="polite"></p></section>');
  u.querySelector('h2').textContent = advent ? '🕯️ ' + F + 's Adventskalender · Türchen ' + D : '🎁 ' + (C.uebTitel || F + 's Überraschung des Tages');
  function gesammelt() { return hol(SK, []); }
  function uebZeigen(neu) {
    var p = u.querySelector('.r6-paket'), s = gesammelt(), offen = hol('offen', '') === heute;
    if (!offen) p.innerHTML = '<button type="button" class="r6-geschenk" data-r6="oeffnen" aria-label="' + (advent ? 'Türchen ' + D + ' öffnen' : 'Überraschung öffnen') + '"><span aria-hidden="true">' + (advent ? '🚪' : '🎁') + '</span>' + (advent ? 'Türchen ' + D + ' öffnen' : 'Tipp zum Öffnen') + '</button>';
    else { var x = U[ui]; p.innerHTML = '<div class="r6-fund' + (neu ? ' neu' : '') + '"><span class="r6-fe" aria-hidden="true">' + x[0] + '</span><p>' + esc(fuell(x[1])) + '</p></div>' + (kannReden && C.vorlesen !== false ? '<div class="r6-reihe"><button type="button" class="r6-btn" data-r6="uebHoeren">🎧 Nur hören</button></div>' : ''); }
    var r = u.querySelector('.r6-sammel'); r.innerHTML = '';
    for (var i = 0; i < U.length; i++) {
      if (s.indexOf(i) >= 0) { var b = el('<button type="button" data-r6="fach" data-i="' + i + '" aria-label="Fundstück ' + (i + 1) + ' ansehen">' + U[i][0] + '</button>'); if (i === ui && offen) b.classList.add('heute'); r.appendChild(b); }
      else r.appendChild(el('<i aria-hidden="true">' + (i + 1) + '</i>'));
    }
    r.setAttribute('aria-label', 'Sammelleiste: ' + s.length + ' von ' + U.length + ' gesammelt');
    u.querySelector('.r6-zahl').textContent = s.length >= U.length ? '🌟 Alle ' + U.length + ' gesammelt! ' + fuell(C.alleGesammelt || '') :
      s.length + ' von ' + U.length + ' gesammelt. ' + (advent ? 'Jeden Tag bis Weihnachten ein Türchen.' : (M === 11 || (M === 10 && D > 15) ? 'Ab 1. Dezember wird daraus ' + F + 's Adventskalender: 24 Türchen.' : 'Morgen wartet etwas Neues.'));
  }
  u.addEventListener('click', function (e) {
    var b = e.target.closest('[data-r6]'); if (!b) return; var a = b.getAttribute('data-r6');
    if (a === 'oeffnen') {
      leg('offen', heute); var s = gesammelt(); var neuStueck = s.indexOf(ui) < 0; if (neuStueck) { s.push(ui); leg(SK, s); }
      uebZeigen(true); feier(u); if (C.beimOeffnen) try { C.beimOeffnen(U[ui]); } catch (x) {}
    }
    if (a === 'fach') {
      var x = U[+b.getAttribute('data-i')], f = u.querySelector('.r6-fund');
      if (!f) { u.querySelector('.r6-paket').innerHTML = '<div class="r6-fund"><span class="r6-fe" aria-hidden="true"></span><p></p></div><div class="r6-reihe"><button type="button" class="r6-btn voll" data-r6="zurueck">' + (advent ? 'Zum heutigen Türchen' : 'Zur heutigen Überraschung') + '</button></div>'; f = u.querySelector('.r6-fund'); }
      f.querySelector('.r6-fe').textContent = x[0]; f.querySelector('p').textContent = fuell(x[1]);
    }
    if (a === 'zurueck') uebZeigen(false);
    if (a === 'uebHoeren') { var t = u.querySelector('.r6-fund p'); if (t) nurHoeren(t.textContent); }
  });

  /* ---------- 5) Kinder-Karte (ruhig: Standbild, Fantasie-Frage, Nur hören) ---------- */
  var kk = null;
  if (C.fantasie) {
    var fq = C.fantasie[tagNr % C.fantasie.length];
    kk = el('<section class="r6 r6-karte r6-kinder" aria-labelledby="r6kt-' + C.k + '"><h2 id="r6kt-' + C.k + '">🌙 ' + esc(C.kinderTitel || F + 's Fantasie-Frage') + '</h2>' +
      '<div class="r6-char-in"><img alt="" loading="lazy" src="' + esc(C.kinderBild || C.bild) + '" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid #f2c14e;flex:none">' +
      '<p class="r6-frage">' + esc(fq) + '</p></div>' +
      '<p class="r6-klein">Augen zu und ausdenken. Es gibt keine falsche Antwort.</p>' +
      (kannReden ? '<div class="r6-reihe"><button type="button" class="r6-btn voll" data-r6="kHoeren">🎧 Nur hören</button></div>' : '') + '</section>');
    kk.addEventListener('click', function (e) { if (e.target.closest('[data-r6=kHoeren]')) nurHoeren(fq + ' ' + (C.kinderSchluss || 'Denk dir etwas aus. Es gibt keine falsche Antwort.')); });
  }

  grussZeigen(); grossSetzen(); naechsterSatz(true); vorliebeZeigen(); uebZeigen(false);
  var N = { gruss: g, charakter: c, besuch: bk, ueberraschung: u, kinder: kk };
  window['R6_' + C.k] = { karten: N, sag: sag, still: still };
  var H = { sag: sag, still: still, nurHoeren: nurHoeren, feier: feier, saison: S, el: el, esc: esc, hol: hol, leg: leg, ruhig: ruhig, kannReden: kannReden, fuell: fuell, M: M, D: D, tz: tz, heute: heute, jetzt: jetzt };
  function saisonBildZeigen() {
    if (!SB || S.k === 'halloween') return; /* Runde 6b: auf der Bühne nur am 31.10., in der Karte schon in den Halloween-Tagen */
    var alt = F + (S.k === 'halloweenTag' ? ' mit einer lachenden Kürbislaterne' : ' bei Kerzenlicht im Advent');
    if (C.saisonImg) { var im = document.querySelector(C.saisonImg); if (im) { im.src = SB; im.alt = alt; } return; }
    var z = C.saisonZiel && document.querySelector(C.saisonZiel); if (!z) return;
    if (getComputedStyle(z).position === 'static') z.style.position = 'relative';
    var o = document.createElement('img'); o.className = 'r6-saisonbild'; o.src = SB; o.alt = alt; o.decoding = 'async';
    o.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:3;pointer-events:none;border-radius:inherit;transition:opacity .5s';
    z.appendChild(o);
    var t = 0;
    // Antippen: die lebendige Figur ist wieder da; nach einer ruhigen Weile kommt das Saison-Bild zurück
    z.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.r6-laterne')) return; o.style.opacity = '0'; clearTimeout(t); t = setTimeout(function () { o.style.opacity = '1'; }, 20000); }, true);
  }
  function los() { try { C.einsetzen(N, H); } catch (e) { if (window.console) console.warn('Runde 6:', e); } try { saisonBildZeigen(); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else setTimeout(los, 0);
  if (kannReden) try { speechSynthesis.getVoices(); } catch (e) {}
})();
