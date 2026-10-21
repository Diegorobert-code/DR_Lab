/* Jackie: Sicherheit zuerst. Die Karte liegt unter «Für dich», die Notrufnummern bleiben oben. */
window.R6 = {
  kuerzel: 'ja', figur: 'Jackie', bild: 'posen/winkt.jpg',
  ort: '#jkSchuhe', wo: 'vor',
  css: 'html.r6-gross .jk-notruf .nr{min-width:0}html.r6-gross .jk-notruf .nr small{font-size:12px}',
  nameFragen: false, // Jackie fragt schon selbst nach dem Namen
  nameLesen: function () { try { return JSON.parse(localStorage.getItem('ja_name') || '""'); } catch (e) { return ''; } },
  grussText: function (n, tz) { return tz + (n ? ', ' + n : '') + '. Schön, bist du da.'; },
  saetze: [
    'Mein Lieblingsding? Meine goldenen Schuhe. Sie klacken, wenn jemand Mut hat.',
    'Kleine Macke von mir: Ich lache, bevor ich weine. Beides ist erlaubt.',
    'Schritt für Schritt. Niemand muss heute alles lösen.',
    'Der alte Schuhmacher sagt: Ein guter Schuh drückt nicht. Ein guter Mensch auch nicht.',
    'Ich trinke meinen Tee viel zu süss. Granny schimpft jedes Mal.',
    'Wenn du nicht weisst, wo anfangen: Atme aus. Dann erzähl mir den ersten Satz.',
    'Hilfe holen ist kein Versagen. Es ist das Mutigste, was ich kenne.',
    'Ich sammle schöne Wörter. Heute: «geborgen».',
    'Die Notrufnummern stehen oben, immer. Damit du nie suchen musst.',
    'Mein Spruch: Du bist nicht zu viel. Du bist genau richtig.',
    'Nachts schreibe ich manchmal Briefe, die ich nie abschicke. Das hilft.',
    'Du darfst Nein sagen. Ganz ohne Begründung.'
  ],
  vorliebe: {
    frage: 'Was tut dir gut, wenn es schwer wird?',
    wahl: { tee: '🍵 Ein warmer Tee', luft: '🚶‍♀️ Frische Luft', reden: '💬 Mit jemandem reden' },
    antwort: { tee: 'Tee, ja! In Gedanken stelle ich schon das Wasser auf.', luft: 'Frische Luft. Ich komme mit, mit klackenden Schuhen.', reden: 'Reden hilft. Ich höre dir zu, so lange du willst.' },
    merk: { tee: 'Ich weiss noch: Ein warmer Tee tut dir gut.', luft: 'Ich weiss noch: Frische Luft tut dir gut.', reden: 'Ich weiss noch: Reden tut dir gut.' }
  },
  saison: {
    halloween: 'Halloween-Nacht: unterwegs lieber zu zweit, Treffpunkt abmachen, Handy geladen.',
    herbst: 'Die Abende werden früher dunkel. «Sicher unterwegs» begleitet dich heim.',
    winter: 'Kalt draussen. Warm ums Herz bleibt erlaubt.'
  },
  ueTitel: 'Jackies Tagesstich', einsammeln: 'Ins Schuhregal',
  ueberraschungen: [
    { e: '💛', art: 'Spruch', t: 'Du musst nicht stark sein. Du darfst einfach da sein.' },
    { e: '🫖', art: 'Mini-Aufgabe', t: 'Trink heute ein Glas Wasser ganz langsam. Nur für dich.' },
    { e: '📝', art: 'Mini-Aufgabe', t: 'Schreib drei Namen auf von Menschen, die du anrufen könntest. Für den Fall.' },
    { e: '🌿', art: 'Fundstück', t: 'Ein Blatt, ein Stein, ein Knopf: Such dir heute einen kleinen Glücksbringer.' },
    { e: '👟', art: 'Spruch', t: 'Jeder Schritt zählt, auch der kleine.' },
    { e: '🌬️', art: 'Mini-Aufgabe', t: 'Viermal einatmen, sechsmal ausatmen. Dreimal. Spürst du den Boden?' },
    { e: '📞', art: 'Fundstück', t: 'Gut zu wissen: Unter 142 gibt es Hilfe nach Gewalt, gratis und vertraulich.' },
    { e: '🌙', art: 'Spruch', t: 'Morgen ist ein neuer Tag. Heute reicht, was du geschafft hast.' },
    { e: '🤝', art: 'Mini-Aufgabe', t: 'Mach mit einer Freundin ein Codewort ab. Wenn du es schreibst, ruft sie dich an.' },
    { e: '🔑', art: 'Fundstück', t: 'Ein Ersatzschlüssel bei einer Vertrauensperson kann viel Ruhe geben.' },
    { e: '✨', art: 'Spruch', t: 'Was du fühlst, ist echt. Und es darf sich ändern.' },
    { e: '🎶', art: 'Mini-Aufgabe', t: 'Such dir ein Lied, das dich stark macht. Merk es dir für schwere Tage.' },
    { e: '☕', art: 'Fundstück', t: 'Ein Lächeln beim Bäcker zählt auch als Verbindung.' },
    { e: '🪞', art: 'Mini-Aufgabe', t: 'Sag dir heute einmal: Ich mache das gut genug.' }
  ],
  besuch: [
    { name: 'Granny', art: 'sie', bild: 'besuch/granny.jpg', satz: 'Kind, ich habe Tee mitgebracht. Und ich bleibe, bis du lachst.', pfad: '../granny/', url: 'https://claude.ai/artifact/QQaX3suADctBhojdzgS9j6' },
    { name: 'Otti', art: 'ihn', bild: 'besuch/otti.jpg', satz: 'Ich bin ganz leise da. Wenn du magst, atmen wir zusammen.', pfad: '../otti/', url: 'https://claude.ai/artifact/KUJmcyzcQZENmeVCrz8Ymc' },
    { name: 'Fia', art: 'sie', bild: 'besuch/fia.jpg', satz: 'Ich bringe dir eine Feder aus meinem Nest. Für weiche Gedanken.', pfad: '../schlaf/', url: 'https://claude.ai/artifact/PGGcJoXof3mvSyvPJX3mfq' }
  ],
  feierEmoji: ['✨', '👟', '💛'],
  danke: 'Danke. Das lege ich in dein Schuhregal.',
  wocheVoll: 'Eine ganze Woche! Meine Schuhe klacken für dich.',
  advent24: 'Jackie wünscht dir frohe Weihnachten. Du bist nicht allein. Die Nummern oben gelten auch an Festtagen.',
  fein: 'Alles bleibt auf deinem Handy. Die Notrufnummern stehen immer oben.'
};

/* Runde 6 (21.10.2026): «Noch mehr Eigenschaften»
   Eine Karte, in der die Figur lebt:
   - Charakter: eigene Sätze (Lieblingsding, Macke, Spruch), zufällig beim Öffnen und Antippen
   - merkt sich (nur auf diesem Handy): Name, eine Vorliebe, wie oft du schon da warst
   - Tageszeit-Gruss und Jahreszeit (Herbst, Halloween 31.10., Adventskalender ab 1.12., Winter …)
   - Besuch: eine andere DR-Lab-Figur schaut vorbei (Nova vermittelt), mit Link zu ihrer App
   - Überraschung des Tages mit Sammelleiste; eine volle Woche wird sanft gefeiert
   - 🔊 Vorlesen (Handystimme), A+ grosse Schrift, Tippflächen ab 44 px, ARIA
   Test: ?r6tag=2026-12-05&r6zeit=8 zeigt einen anderen Tag. Keine Kosten, keine Dienste, nichts verlässt das Handy. */
(function () {
  'use strict';
  var K = window.R6;
  if (!K || window.R6Laeuft) return;
  window.R6Laeuft = true;
  var LS = K.kuerzel + '-r6-';
  function hol(k, d) { try { var v = localStorage.getItem(LS + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) {} }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function summ(m) { try { if (navigator.vibrate) navigator.vibrate(m); } catch (e) {} }
  var ruhig = false;
  try { ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var F = K.figur;

  /* ---------- Datum (mit Test-Schalter) ---------- */
  var jetzt = new Date();
  try {
    var q = new URLSearchParams(location.search);
    var qt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(q.get('r6tag') || '');
    if (qt) jetzt = new Date(+qt[1], +qt[2] - 1, +qt[3], jetzt.getHours(), jetzt.getMinutes());
    if (q.get('r6zeit')) jetzt.setHours(+q.get('r6zeit'));
  } catch (e) {}
  function isoVon(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  var ISO = isoVon(jetzt);
  var TAGNR = Math.floor(Date.UTC(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate()) / 864e5);
  var M = jetzt.getMonth() + 1, T = jetzt.getDate(), H = jetzt.getHours();

  /* ---------- Name, Vorliebe, Besuchstage ---------- */
  function name() {
    try { if (K.nameLesen) return String(K.nameLesen() || '').trim(); } catch (e) {}
    return String(hol('name', '') || '').trim();
  }
  var tage = hol('tage', []);
  if (tage.indexOf(ISO) < 0) { tage.push(ISO); if (tage.length > 400) tage = tage.slice(-400); leg('tage', tage); }

  function tageszeit() {
    if (H < 5) return K.nacht || 'Gute Nacht';
    if (H < 11) return K.morgen || 'Guten Morgen';
    if (H < 14) return K.mittag || 'Grüezi';
    if (H < 18) return K.nachmittag || 'Hoi';
    if (H < 22) return K.abend || 'Guten Abend';
    return K.nacht || 'Gute Nacht';
  }

  /* ---------- Jahreszeit ---------- */
  function saison() {
    var S = K.saison || {}, art, e, titel;
    if (M === 10 && T >= 24 && T < 31) { art = 'halloween'; e = '🎃'; titel = 'Noch ' + (31 - T) + (31 - T === 1 ? ' Tag' : ' Tage') + ' bis Halloween'; }
    else if (M === 10 && T === 31) { art = 'halloween'; e = '🎃'; titel = 'Heute ist Halloween'; }
    else if (M === 11 && T >= 20) { art = 'vorAdvent'; e = '🕯️'; titel = 'Bald ist Advent'; }
    else if (M === 12 && T <= 24) { art = 'advent'; e = '🎄'; titel = 'Advent · Türchen ' + T; }
    else if (M === 12 && T <= 26) { art = 'weihnachten'; e = '⭐'; titel = 'Frohe Weihnachten'; }
    else if (M === 12 || (M === 1 && T === 1)) { art = 'neujahr'; e = '🎆'; titel = M === 1 ? 'Es guets Neus!' : 'Zwischen den Jahren'; }
    else if (M <= 2) { art = 'winter'; e = '❄️'; titel = 'Winter'; }
    else if (M <= 5) { art = 'fruehling'; e = '🌱'; titel = 'Frühling'; }
    else if (M <= 8) { art = 'sommer'; e = '☀️'; titel = 'Sommer'; }
    else { art = 'herbst'; e = '🍂'; titel = 'Herbst'; }
    var AL = {
      halloween: 'Kürbisse leuchten, Nebel zieht. Hier drin bleibt es warm.',
      vorAdvent: 'Ab 1. Dezember öffnet sich hier jeden Tag ein Türchen.',
      advent: 'Heute ist Türchen ' + T + ' offen. Schau unten bei der Überraschung.',
      weihnachten: 'Ruhige Tage, warmes Licht. Schön, dass du da bist.',
      neujahr: 'Ein neues Jahr klopft an. Ganz leise.',
      winter: 'Draussen kalt, drinnen warm.',
      fruehling: 'Alles wacht auf.',
      sommer: 'Lange, helle Abende.',
      herbst: 'Die Blätter werden golden, die Abende früher dunkel.'
    };
    return { art: art, e: e, titel: titel, text: S[art] || AL[art] };
  }

  /* ---------- Adventskalender (ab 1.12., vorbereitet) ---------- */
  var ADVENT = [
    'Zünde heute eine Kerze an und schau eine Minute nur ins Licht.',
    'Schreib jemandem drei liebe Worte. Einfach so.',
    'Ein warmer Tee, beide Hände um die Tasse. Mehr braucht es heute nicht.',
    'Such draussen etwas Glitzerndes: Frost, ein Licht, ein Fenster.',
    'Heute ist Chlausabend: Nüssli, Mandarinli und ein Sprüchli.',
    'Samichlaus-Tag. Was hast du dieses Jahr gut gemacht? Sag es dir laut.',
    'Räum eine kleine Schublade auf. Das fühlt sich an wie Schnee: frisch.',
    'Hör ein Lied, das dich an früher erinnert.',
    'Lach heute einmal über dich selbst. ' + F + ' macht mit.',
    'Back etwas, oder riech an Zimt. Die Nase feiert mit.',
    'Leg das Handy zehn Minuten weg und schau aus dem Fenster.',
    'Danke sagen: Wem willst du heute danken?',
    'Santa Lucia: ein Lichtlein für die dunkelste Zeit.',
    'Mach einen Spaziergang im Dunkeln und zähl Lichterketten.',
    'Schenk heute jemandem deine ganze Aufmerksamkeit.',
    'Eine Sache darf heute einfach liegen bleiben.',
    'Wünsch dir etwas Kleines und sag es ' + F + '.',
    'Schreib eine Karte von Hand. Sie wird lange aufbewahrt.',
    'Mach es dir gemütlich: Decke, Socken, Licht.',
    'Erinnere dich an einen schönen Moment aus diesem Jahr.',
    'Wintersonnenwende: ab morgen werden die Tage wieder länger.',
    'Ruf jemanden an, der sich freut, deine Stimme zu hören.',
    'Noch einmal schlafen. Atme tief, alles ist bereit genug.',
    (K.advent24 || F + ' wünscht dir frohe Weihnachten. Danke, dass du dieses Jahr da warst.')
  ];

  /* ---------- Überraschung des Tages ---------- */
  var U = K.ueberraschungen;
  var heuteU = (M === 12 && T <= 24) ? { e: '🎁', art: 'Adventstürchen ' + T, t: ADVENT[T - 1] } : U[(TAGNR + (K.versatz || 0)) % U.length];
  var gesammelt = hol('gesammelt', {});

  /* ---------- Besuch (Nova vermittelt) ---------- */
  var B = K.besuch[TAGNR % K.besuch.length];
  function besuchLink(b) {
    var h = location.hostname;
    if (/github\.io$/.test(h) || h === 'localhost' || h === '127.0.0.1') return { href: b.pfad, neu: false };
    return b.url ? { href: b.url, neu: true } : null;
  }

  /* ---------- Stil ---------- */
  var css = [
    '.r6{margin:14px 0 18px;padding:16px;border-radius:24px;background:linear-gradient(160deg,rgba(34,52,112,.82),rgba(14,24,56,.92));border:1px solid rgba(242,193,78,.35);color:#f6efe4;box-shadow:0 14px 40px -18px rgba(0,0,0,.6),0 0 30px rgba(242,193,78,.08);font-size:15px;line-height:1.45;text-align:left;position:relative;overflow:hidden}',
    '.r6 *{box-sizing:border-box}',
    '.r6.r6-rein{opacity:0;transform:translateY(12px)}.r6.r6-da{opacity:1;transform:none;transition:opacity .6s ease,transform .6s cubic-bezier(.22,.8,.26,1)}',
    '.r6 button,.r6 a{font:inherit;color:inherit;-webkit-tap-highlight-color:transparent}',
    '.r6 :focus-visible{outline:3px solid #f2c14e;outline-offset:2px;border-radius:12px}',
    '.r6-kopf{display:flex;align-items:center;gap:10px}',
    '.r6-sais-e{flex:none;width:44px;height:44px;border-radius:14px;display:grid;place-items:center;font-size:24px;background:rgba(242,193,78,.12);border:1px solid rgba(242,193,78,.3)}',
    '.r6-kopf-t{flex:1;min-width:0}',
    '.r6-gruss{margin:0;font:700 18px/1.25 Georgia,"Fraunces",serif;color:#f2c14e;overflow-wrap:anywhere}',
    '.r6-sais{margin:2px 0 0;font-size:13px;color:#f6d98a}',
    '.r6-sais-t{margin:10px 0 0;font-size:14px;color:#ddd4c8}',
    '.r6-kn{flex:none;min-width:44px;height:44px;border-radius:14px;border:1px solid rgba(255,255,255,.22);background:rgba(10,18,48,.55);cursor:pointer;font-weight:700;font-size:15px;display:grid;place-items:center;padding:0 8px}',
    '.r6-kn[aria-pressed=true]{background:#f2c14e;color:#1a1f3a;border-color:#f2c14e}',
    '.r6-satz{all:unset;box-sizing:border-box;display:flex;gap:12px;align-items:center;width:100%;margin-top:14px;padding:10px;border-radius:18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);cursor:pointer;min-height:84px}',
    '.r6-satz:active{transform:scale(.99)}',
    '.r6-satz img{flex:none;width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid #f2c14e;background:#1b2a63}',
    '.r6-satz.r6-hops img{animation:r6hops .5s ease}',
    '@keyframes r6hops{40%{transform:translateY(-6px) rotate(-4deg)}}',
    '.r6-satz small,.r6-ue small,.r6-bs small{display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#f2c14e;font-weight:700}',
    '.r6-satz q{display:block;font-size:16px;quotes:"«" "»"}',
    '.r6-satz em{display:block;font-style:normal;font-size:12px;color:#a9b1cc;margin-top:2px}',
    '.r6-merk{margin:10px 0 0;font-size:14px;color:#ddd4c8}',
    '.r6-merk button,.r6-wahl button,.r6-nf button{min-height:44px;padding:0 14px;border-radius:999px;border:1px solid rgba(242,193,78,.55);background:rgba(242,193,78,.1);cursor:pointer;font-weight:700}',
    '.r6-merk button{min-height:44px;border:0;background:none;text-decoration:underline;padding:0 6px;font-weight:600;color:#c8cde6}',
    '.r6-wahl{margin-top:12px;padding:12px;border-radius:16px;background:rgba(255,255,255,.05)}',
    '.r6-wahl p{margin:0 0 8px}.r6-wahl div{display:flex;gap:8px;flex-wrap:wrap}',
    '.r6-nf{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center}',
    '.r6-nf label{width:100%;font-size:14px;color:#ddd4c8}',
    '.r6-nf input{flex:1;min-width:0;min-height:44px;border-radius:14px;border:1px solid rgba(255,255,255,.25);background:rgba(10,18,48,.6);color:#fff;padding:0 12px;font:inherit;font-size:16px}',
    '.r6-ue{margin-top:12px;padding:12px;border-radius:18px;background:linear-gradient(135deg,rgba(242,193,78,.16),rgba(242,193,78,.04));border:1px dashed rgba(242,193,78,.5)}',
    '.r6-ue-z{display:flex;gap:10px;align-items:flex-start}',
    '.r6-ue-e{flex:none;font-size:30px;line-height:1}',
    '.r6-ue p{margin:2px 0 0}',
    '.r6-ue-fuss{display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap}',
    '.r6-ein{min-height:44px;padding:0 16px;border-radius:999px;border:0;background:#f2c14e;color:#1a1f3a;font-weight:800;cursor:pointer}',
    '.r6-ein[disabled]{background:rgba(242,193,78,.25);color:#f6efe4;cursor:default}',
    '.r6-leiste{display:flex;gap:4px;align-items:center}',
    '.r6-leiste span{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:15px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14)}',
    '.r6-leiste span.voll{background:rgba(242,193,78,.2);border-color:#f2c14e}',
    '.r6-leiste span.heute{box-shadow:0 0 0 2px rgba(242,193,78,.6)}',
    '.r6-zahl{font-size:12px;color:#a9b1cc;width:100%}',
    '.r6-bs{display:flex;gap:12px;align-items:center;margin-top:12px;padding:10px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);text-decoration:none;min-height:72px}',
    'a.r6-bs:active{transform:scale(.99)}',
    '.r6-bs img{flex:none;width:56px;height:56px;border-radius:16px;object-fit:cover;border:1px solid rgba(242,193,78,.5)}',
    '.r6-bs b{display:block;font-size:15px}.r6-bs span span{display:block;font-size:14px;color:#ddd4c8}',
    '.r6-bs i{margin-left:auto;font-style:normal;font-size:22px;color:#f2c14e}',
    '.r6-feier{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
    '.r6-feier span{position:absolute;top:-20px;font-size:20px;animation:r6fall 1.8s ease-in forwards}',
    '@keyframes r6fall{to{transform:translateY(420px) rotate(220deg);opacity:0}}',
    '.r6-fein{font-size:12px;color:#a9b1cc;margin:10px 0 0}',
    'html.r6-gross ' + (K.grossZiel || 'body > .wrap') + '{zoom:1.14}',
    '@supports not (zoom:1){html.r6-gross{font-size:114%}}',
    '@media (prefers-reduced-motion:reduce){.r6.r6-rein{opacity:1;transform:none}.r6-satz.r6-hops img{animation:none}}'
  ].join('\n') + (K.css || '');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- Grosse Schrift (vor dem Zeichnen, damit nichts springt) ---------- */
  var gross = !!hol('gross', false);
  document.documentElement.classList.toggle('r6-gross', gross);

  /* ---------- Karte bauen ---------- */
  var ziel = document.querySelector(K.ort);
  if (!ziel) return;
  var el = document.createElement('section');
  el.className = 'r6' + (ruhig ? '' : ' r6-rein');
  el.id = 'r6Karte';
  el.setAttribute('aria-labelledby', 'r6Gruss');
  if (K.wo === 'vor') ziel.parentNode.insertBefore(el, ziel);
  else if (K.wo === 'in') ziel.appendChild(el);
  else ziel.parentNode.insertBefore(el, ziel.nextSibling);

  var S = saison();
  var saetze = K.saetze.slice();
  var letzter = -1;
  function neuerSatz() {
    var i; do { i = Math.floor(Math.random() * saetze.length); } while (saetze.length > 1 && i === letzter);
    letzter = i; return saetze[i];
  }
  function grussText() {
    var n = name();
    if (K.grussText) return K.grussText(n, tageszeit());
    return tageszeit() + (n ? ', ' + n : '') + (K.grussZusatz ? K.grussZusatz : '');
  }
  function merkText() {
    var v = hol('vorliebe', null), teile = [];
    if (tage.length > 1) teile.push('Das ist dein ' + tage.length + '. Tag hier. ' + (K.wiederDa || 'Schön, bist du wieder da.'));
    if (v && K.vorliebe && K.vorliebe.merk[v]) teile.push(K.vorliebe.merk[v]);
    return teile.join(' ');
  }

  function zeichne() {
    var n = name();
    var lk = besuchLink(B);
    var h = '';
    h += '<div class="r6-kopf"><span class="r6-sais-e" aria-hidden="true">' + S.e + '</span>';
    h += '<div class="r6-kopf-t"><p class="r6-gruss" id="r6Gruss">' + esc(grussText()) + '</p><p class="r6-sais"><b>' + esc(S.titel) + '</b></p></div>';
    if ('speechSynthesis' in window) h += '<button type="button" class="r6-kn" id="r6Vor" aria-label="' + esc(F) + ' liest vor" title="Vorlesen">🔊</button>';
    h += '<button type="button" class="r6-kn" id="r6Gross" aria-pressed="' + gross + '" aria-label="Grosse Schrift" title="Grosse Schrift">A+</button></div>';
    h += '<p class="r6-sais-t">' + esc(S.text) + '</p>';
    h += '<button type="button" class="r6-satz" id="r6Satz" aria-label="' + esc(F) + ' antippen, ein neuer Satz"><img src="' + esc(K.bild) + '" alt="" width="64" height="64" loading="lazy">';
    h += '<span><small>' + esc(F) + ' sagt</small><q id="r6SatzT" aria-live="polite">' + esc(neuerSatz()) + '</q><em>Antippen für mehr</em></span></button>';
    var mt = merkText();
    if (mt) h += '<p class="r6-merk" id="r6Merk">' + esc(mt) + (hol('vorliebe', null) ? ' <button type="button" id="r6VorlAendern">ändern</button>' : '') + '</p>';
    if (K.vorliebe && !hol('vorliebe', null)) {
      h += '<div class="r6-wahl" role="group" aria-label="' + esc(K.vorliebe.frage) + '"><p>' + esc(K.vorliebe.frage) + '</p><div>';
      Object.keys(K.vorliebe.wahl).forEach(function (k) { h += '<button type="button" data-r6v="' + esc(k) + '">' + esc(K.vorliebe.wahl[k]) + '</button>'; });
      h += '</div></div>';
    }
    if (K.nameFragen !== false && !n && !hol('nameNein', false)) {
      h += '<form class="r6-nf" id="r6Name"><label for="r6NameIn">' + esc(K.nameFrage || 'Wie darf ich dich nennen? Ich merke es mir nur auf diesem Handy.') + '</label>';
      h += '<input id="r6NameIn" autocomplete="given-name" maxlength="30" placeholder="Vorname"><button type="submit">Merken</button><button type="button" id="r6NameNein" aria-label="Lieber nicht">Lieber nicht</button></form>';
    }
    // Überraschung
    var schon = !!gesammelt[ISO];
    h += '<div class="r6-ue"><div class="r6-ue-z"><span class="r6-ue-e" aria-hidden="true">' + heuteU.e + '</span><div><small>' + esc(K.ueTitel || 'Überraschung des Tages') + ' · ' + esc(heuteU.art) + '</small><p>' + esc(heuteU.t) + '</p></div></div>';
    h += '<div class="r6-ue-fuss"><button type="button" class="r6-ein" id="r6Ein"' + (schon ? ' disabled' : '') + '>' + (schon ? 'Gesammelt ✓' : esc(K.einsammeln || 'Einsammeln')) + '</button>';
    h += '<div class="r6-leiste" id="r6Leiste" role="img"></div><span class="r6-zahl" id="r6Zahl"></span></div></div>';
    // Besuch
    var bInhalt = '<img src="' + esc(B.bild) + '" alt="' + esc(B.name) + '" width="56" height="56" loading="lazy"><span><small>Besuch · vermittelt von Nova</small><b>' + esc(B.name) + ' schaut vorbei</b><span>' + (B.still ? esc(B.satz) : '«' + esc(B.satz) + '»') + '</span></span>';
    if (lk) h += '<a class="r6-bs" href="' + esc(lk.href) + '"' + (lk.neu ? ' target="_blank" rel="noopener"' : '') + ' aria-label="' + esc(B.name) + ' besuchen">' + bInhalt + '<i aria-hidden="true">›</i></a>';
    else h += '<div class="r6-bs">' + bInhalt + '</div>';
    if (K.fein) h += '<p class="r6-fein">' + esc(K.fein) + '</p>';
    el.innerHTML = h;
    leiste();
    binde();
  }

  function leiste() {
    var l = document.getElementById('r6Leiste'); if (!l) return;
    var h = '', voll = 0, wochentag = (jetzt.getDay() + 6) % 7; // Mo = 0
    var WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    for (var i = 0; i < 7; i++) {
      var d = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() - wochentag + i);
      var g = gesammelt[isoVon(d)];
      if (g) voll++;
      h += '<span class="' + (g ? 'voll' : '') + (i === wochentag ? ' heute' : '') + '" title="' + WT[i] + '">' + (g ? g : '') + '</span>';
    }
    l.innerHTML = h;
    l.setAttribute('aria-label', 'Diese Woche gesammelt: ' + voll + ' von 7');
    var z = document.getElementById('r6Zahl');
    var tot = Object.keys(gesammelt).length;
    if (z) z.textContent = tot ? 'Diese Woche ' + voll + ' von 7 · insgesamt ' + tot + (tot === 1 ? ' Fundstück' : ' Fundstücke') : 'Jeden Tag wartet etwas Neues. Sammle eine Woche voll.';
    return voll;
  }

  function feier(text) {
    summ([12, 60, 12]);
    var t = document.getElementById('r6SatzT'); if (t && text) t.textContent = text;
    if (ruhig) return;
    var f = document.createElement('div'); f.className = 'r6-feier'; f.setAttribute('aria-hidden', 'true');
    var E = K.feierEmoji || ['✨', '⭐', '💛'];
    for (var i = 0; i < 14; i++) {
      var s = document.createElement('span'); s.textContent = E[i % E.length];
      s.style.left = (4 + Math.random() * 90) + '%'; s.style.animationDelay = (Math.random() * .5) + 's';
      f.appendChild(s);
    }
    el.appendChild(f); setTimeout(function () { f.remove(); }, 2600);
  }

  function binde() {
    var sb = document.getElementById('r6Satz');
    sb.addEventListener('click', function () {
      document.getElementById('r6SatzT').textContent = neuerSatz();
      if (!ruhig) { sb.classList.remove('r6-hops'); void sb.offsetWidth; sb.classList.add('r6-hops'); }
      summ(8);
      try { if (K.beimAntippen) K.beimAntippen(); } catch (e) {}
    });
    var gb = document.getElementById('r6Gross');
    gb.addEventListener('click', function () {
      gross = !gross; leg('gross', gross);
      document.documentElement.classList.toggle('r6-gross', gross);
      gb.setAttribute('aria-pressed', String(gross));
    });
    var vb = document.getElementById('r6Vor');
    if (vb) vb.addEventListener('click', function () {
      var ss = window.speechSynthesis;
      if (ss.speaking) { ss.cancel(); vb.textContent = '🔊'; return; }
      var text = [grussText() + '.', S.titel + '.', S.text, F + ' sagt: ' + document.getElementById('r6SatzT').textContent, heuteU.art + ': ' + heuteU.t, (B.still ? B.satz : B.name + ' schaut vorbei und sagt: ' + B.satz)].join(' ');
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-CH'; u.rate = K.tempo || 0.95;
      try { var vs = ss.getVoices().filter(function (v) { return /^de/i.test(v.lang); }); var ch = vs.filter(function (v) { return /CH/i.test(v.lang); }); if (ch[0] || vs[0]) u.voice = ch[0] || vs[0]; } catch (e) {}
      u.onend = u.onerror = function () { vb.textContent = '🔊'; };
      vb.textContent = '⏸'; ss.speak(u);
    });
    var eb = document.getElementById('r6Ein');
    eb.addEventListener('click', function () {
      if (gesammelt[ISO]) return;
      gesammelt[ISO] = heuteU.e; leg('gesammelt', gesammelt);
      eb.disabled = true; eb.textContent = 'Gesammelt ✓';
      var voll = leiste();
      feier(voll >= 7 ? (K.wocheVoll || 'Eine ganze Woche voll! Ich bin stolz auf dich.') : (K.danke || 'Danke! Das lege ich gut weg.'));
    });
    el.querySelectorAll('[data-r6v]').forEach(function (b) {
      b.addEventListener('click', function () { leg('vorliebe', b.getAttribute('data-r6v')); summ(8); zeichne(); var t = document.getElementById('r6SatzT'); if (t) t.textContent = K.vorliebe.antwort[b.getAttribute('data-r6v')]; });
    });
    var va = document.getElementById('r6VorlAendern');
    if (va) va.addEventListener('click', function () { leg('vorliebe', null); zeichne(); });
    var nf = document.getElementById('r6Name');
    if (nf) {
      nf.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = document.getElementById('r6NameIn').value.trim().replace(/\s+/g, ' ').slice(0, 30);
        if (!v) return;
        if (K.nameSchreiben) K.nameSchreiben(v); else leg('name', v);
        zeichne(); feier((K.nameDanke || 'Schön, dich kennenzulernen, {n}.').replace('{n}', v));
      });
      document.getElementById('r6NameNein').addEventListener('click', function () { leg('nameNein', true); zeichne(); });
    }
  }

  zeichne();
  if (!ruhig && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { el.classList.add('r6-da'); el.classList.remove('r6-rein'); io.disconnect(); } }); }, { threshold: 0.1 });
    io.observe(el);
    setTimeout(function () { el.classList.add('r6-da'); el.classList.remove('r6-rein'); }, 2500);
  }
  window.R6Karte = { neu: zeichne, saison: S, besuch: B };
})();
