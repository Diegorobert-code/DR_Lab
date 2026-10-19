/* Granny Trickfilm-Ausbau (19.10.2026)
   Bühne mit Tageszeit-Himmel und Dorf, Granny in Posen, Merkhilfe «Wo liegt was?», Termin-Gong,
   Trink-Erinnerung, Stimme der Familie (Aufnahmen nur auf dem Gerät), Akku-Wächter, Betrugs-Warnung,
   Familienalbum «Wer ist das?», Nachtruhe, Bildschirm wach, grosse Schrift, «Was Granny sich merkt».
   Alles bleibt auf dem Gerät. Lern-Zahlen gehen nur mit Häkchen an den eigenen Server, nie Stimme oder Bild. */
(function () {
  'use strict';
  if (!window.Granny) return;
  var G = window.Granny;
  var $ = function (id) { return document.getElementById(id); };
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function es() { return G.S.sprache === 'es'; }
  function hol(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function heuteKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function gross(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* ---------- Texte ---------- */
  var X = {
    de: {
      merkTitel: 'Granny merkt sich', merkLeer: 'Sag mir zum Beispiel: «Der Schlüssel liegt in der Schublade.» Ich merke es mir für dich.',
      merkKnopf: 'Merk dir etwas', gemerkt: function (d, o) { return 'Gut, ich merke es mir: ' + d + ', ' + o + '. Frag mich einfach später.'; },
      gefunden: function (d, o, w) { return 'Ich weiss es noch! ' + d + ': ' + o + '. Das hast du mir ' + w + ' gesagt.'; },
      nichtGemerkt: function (d) { return 'Das hast du mir noch nicht gesagt. Schau ruhig nach, und dann sag mir, wo ' + d + ' liegt.'; },
      wann: function (t) { var d = new Date(t), h = new Date(); var tag = d.toDateString() === h.toDateString() ? 'heute' : (h - d < 172800000 ? 'gestern' : 'am ' + ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][d.getDay()]); return tag + ' um ' + d.getHours() + ' Uhr'; },
      betrug: function (n) { return 'Vorsicht! Am Telefon gibst du nie Geld, Karten oder Passwörter. Auch nicht der Polizei oder der Bank. Leg einfach auf' + (n ? ' und ruf ' + n + ' an.' : '.'); },
      album: 'Meine Familie', wer: function (n, w) { return 'Das ist ' + n + '.' + (w ? ' ' + gross(w) + '.' : ''); },
      werFehlt: function (n) { return n + ' kenne ich noch nicht so gut. Deine Familie kann es mir erzählen.'; },
      vor: 'Zurück', weiter: 'Weiter', anrufen: function (n) { return n + ' anrufen'; },
      nachricht: function (n) { return '💌 Nachricht von ' + n; }, nachrichtSag: function (n) { return 'Hör mal, ' + n + ' hat dir etwas gesagt.'; },
      trinken: 'Hast du schon etwas getrunken? Ein Glas Wasser tut gut. Ich trinke mit!', getrunken: 'Sehr gut! Wasser ist gut für den Kopf. Prost!',
      nacht: 'Es ist Nacht. Alles ist gut. Du kannst ruhig schlafen. Morgen ist ein neuer Tag.',
      nachtWeiter: function (d) { return 'Es ist mitten in der Nacht. Morgen ist ' + d + '. Leg dich ruhig wieder hin.'; },
      akku: 'Ich werde müde, mein Akku ist fast leer. Bitte steck mich ans Ladekabel.',
      termin: function (t) { return 'Jetzt ist es Zeit: ' + t; },
      gesternRedet: function (n) { return ' Gestern hast du mit ' + n + ' geredet.'; },
      stimmen: [['morgen', 'Guten Morgen (spielt morgens beim ersten Tippen)'], ['liebe', 'Einfach so (Knopf «Nachricht»)'], ['akku', 'Bitte laden (Akku-Wächter)'], ['nacht', 'Gute Nacht (abends beim ersten Tippen)']],
      aufnehmen: '● Aufnehmen', stopp: '■ Stopp', abspielen: '▶', loeschen: '✕', keineAufnahme: 'noch keine Aufnahme', aufnahmeDa: 'Aufnahme da',
      keinMikro: 'Aufnehmen geht hier nicht (Mikrofon nicht erlaubt).',
      lernen: function (m) {
        var z = [];
        z.push('Tage mit Granny: ' + m.tage.length);
        var a = Object.keys(m.anruf); z.push('Anrufe über Granny: ' + (a.length ? a.map(function (k) { return k + ' ' + m.anruf[k] + '×'; }).join(', ') : 'noch keine'));
        z.push('«Ich brauche Hilfe»: ' + m.hilfe + '× · «Passwort geht nicht»: ' + m.klemmt + '×');
        z.push('Mit Granny geredet: ' + m.reden + '×');
        var f = Object.keys(m.fragen).sort(function (x, y) { return m.fragen[y] - m.fragen[x]; });
        z.push('Häufigste Frage: ' + (f.length ? ({ merk: 'wo etwas liegt', datum: 'welcher Tag ist', brille: 'die Brille', betrug: 'Geld/Bank am Telefon', wer: 'wer jemand ist', trinken: 'Trinken', nacht: 'Nacht/Schlafen' }[f[0]] || f[0]) + ' (' + m.fragen[f[0]] + '×)' : '–'));
        var h = m.stunden.indexOf(Math.max.apply(null, m.stunden)); z.push('Meist aktiv: ' + (Math.max.apply(null, m.stunden) ? h + '–' + (h + 1) + ' Uhr' : '–'));
        if (m.fragen.betrug) z.push('⚠ Granny hat ' + m.fragen.betrug + '× vor Telefon-Betrug gewarnt. Bitte nachfragen.');
        if (m.fragen.nacht > 2) z.push('Nachts oft wach (' + m.fragen.nacht + '×). Vielleicht mit dem Hausarzt besprechen.');
        return z;
      }
    },
    es: {
      merkTitel: 'Granny se acuerda', merkLeer: 'Dime por ejemplo: «Las llaves están en el cajón.» Me lo apunto por ti.',
      merkKnopf: 'Acuérdate de algo', gemerkt: function (d, o) { return 'Muy bien, me lo apunto: ' + d + ', ' + o + '. Pregúntame luego.'; },
      gefunden: function (d, o, w) { return '¡Me acuerdo! ' + d + ': ' + o + '. Me lo dijiste ' + w + '.'; },
      nichtGemerkt: function (d) { return 'Eso todavía no me lo has dicho. Busca con calma y luego dime dónde está ' + d + '.'; },
      wann: function (t) { var d = new Date(t), h = new Date(); var tag = d.toDateString() === h.toDateString() ? 'hoy' : (h - d < 172800000 ? 'ayer' : 'el ' + ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][d.getDay()]); return tag + ' a las ' + d.getHours(); },
      betrug: function (n) { return '¡Cuidado! Por teléfono nunca se da dinero, tarjetas ni contraseñas. Tampoco a la policía ni al banco. Cuelga' + (n ? ' y llama a ' + n + '.' : '.'); },
      album: 'Mi familia', wer: function (n, w) { return 'Este es ' + n + '.' + (w ? ' ' + gross(w) + '.' : ''); },
      werFehlt: function (n) { return 'A ' + n + ' todavía no le conozco bien. Tu familia me lo puede contar.'; },
      vor: 'Atrás', weiter: 'Siguiente', anrufen: function (n) { return 'Llamar a ' + n; },
      nachricht: function (n) { return '💌 Mensaje de ' + n; }, nachrichtSag: function (n) { return 'Escucha, ' + n + ' te ha dejado algo.'; },
      trinken: '¿Ya has bebido algo? Un vaso de agua sienta bien. ¡Yo bebo contigo!', getrunken: '¡Muy bien! El agua es buena para la cabeza. ¡Salud!',
      nacht: 'Es de noche. Todo está bien. Puedes dormir tranquila. Mañana es otro día.',
      nachtWeiter: function (d) { return 'Es plena noche. Mañana es ' + d + '. Vuelve a acostarte tranquila.'; },
      akku: 'Estoy cansada, mi batería está casi vacía. Por favor, ponme a cargar.',
      termin: function (t) { return 'Ya es la hora: ' + t; },
      gesternRedet: function (n) { return ' Ayer hablaste con ' + n + '.'; }
    }
  };
  function T() { var t = es() ? X.es : X.de; return new Proxy(t, { get: function (o, k) { return k in o ? o[k] : X.de[k]; } }); }

  /* ---------- CSS ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '[hidden]{display:none!important}',
    '.buehne{position:relative;height:250px;border-radius:30px;overflow:hidden;border:2px solid rgba(242,193,78,.45);box-shadow:0 16px 40px -14px rgba(0,0,0,.6),0 0 30px rgba(229,143,168,.18);isolation:isolate;transition:background 2s}',
    '.buehne[data-zeit=morgen]{background:linear-gradient(180deg,#7fb3e6 0%,#f6c9a8 70%,#ffe3b3 100%)}',
    '.buehne[data-zeit=mittag]{background:linear-gradient(180deg,#4f97e0 0%,#8cc5f2 70%,#d8ecff 100%)}',
    '.buehne[data-zeit=nachmittag]{background:linear-gradient(180deg,#5d8fd6 0%,#a9c8ec 60%,#f3dcae 100%)}',
    '.buehne[data-zeit=abend]{background:linear-gradient(180deg,#2b2f6e 0%,#9a4f86 55%,#f39a5b 100%)}',
    '.buehne[data-zeit=nacht]{background:radial-gradient(120% 90% at 50% 0%,#1B2C6B 0%,#0E1838 60%,#060A1C 100%)}',
    '.himmel{position:absolute;inset:0;z-index:0}',
    '.himmel .sonne{position:absolute;width:64px;height:64px;border-radius:50%;background:radial-gradient(circle,#fff6c9,#ffd45a 55%,#f5a623);box-shadow:0 0 50px 18px rgba(255,214,90,.55);left:12%;top:120px;transition:all 2s}',
    '.buehne[data-zeit=mittag] .sonne{left:16%;top:18px}.buehne[data-zeit=nachmittag] .sonne{left:22%;top:42px}.buehne[data-zeit=abend] .sonne{left:8%;top:150px;background:radial-gradient(circle,#ffe0b0,#ff8a3d 60%,#d9542b);box-shadow:0 0 60px 24px rgba(255,120,60,.5)}.buehne[data-zeit=nacht] .sonne{top:260px;opacity:0}',
    '.himmel .mond{position:absolute;left:12%;top:24px;width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fffbe8,#f2e3a8);box-shadow:0 0 30px 8px rgba(255,240,180,.35);opacity:0;transition:opacity 2s}',
    '.himmel .mond::after{content:"";position:absolute;left:14px;top:-4px;width:46px;height:46px;border-radius:50%;background:#132050}',
    '.buehne[data-zeit=nacht] .mond{opacity:1}',
    '.sternchen{position:absolute;inset:0;opacity:0;transition:opacity 2s;background:radial-gradient(1.6px 1.6px at 30% 20%,#ffe9a8,transparent),radial-gradient(1.4px 1.4px at 48% 12%,#fff,transparent),radial-gradient(1.6px 1.6px at 62% 30%,#ffe9a8,transparent),radial-gradient(1.2px 1.2px at 80% 16%,#fff,transparent),radial-gradient(1.6px 1.6px at 90% 40%,#ffe9a8,transparent),radial-gradient(1.2px 1.2px at 38% 44%,#fff,transparent),radial-gradient(1.2px 1.2px at 22% 50%,#ffe9a8,transparent)}',
    '.buehne[data-zeit=nacht] .sternchen,.buehne[data-zeit=abend] .sternchen{opacity:1}.buehne[data-zeit=abend] .sternchen{opacity:.4}',
    '.sternchen{animation:gpFunkeln 4s ease-in-out infinite}@keyframes gpFunkeln{50%{filter:brightness(1.6)}}',
    '.wolke{position:absolute;height:22px;border-radius:20px;background:rgba(255,255,255,.85);filter:blur(1px);animation:gpWolke 60s linear infinite}',
    '.wolke::before{content:"";position:absolute;left:18%;top:-12px;width:46%;height:26px;border-radius:50%;background:inherit}',
    '.wolke.w1{width:90px;top:36px;left:-100px}.wolke.w2{width:64px;top:70px;left:-100px;animation-duration:85s;animation-delay:-40s;opacity:.8}',
    '.buehne[data-zeit=nacht] .wolke,.buehne[data-zeit=abend] .wolke{background:rgba(160,150,210,.35)}',
    '@keyframes gpWolke{to{transform:translateX(560px)}}',
    '.dorf{position:absolute;left:0;right:0;bottom:0;width:100%;height:96px;z-index:1}',
    '.dorf .huegel{fill:#9cc28a}.dorf .haus rect:first-child,.dorf .kirche rect:first-child{fill:#fffaf0}.dorf .haus path,.dorf .kirche path{fill:#d9744f}.dorf .fenster{fill:#4f6fa8;transition:fill 2s}.dorf .boden{fill:#7aa56e}',
    '.buehne[data-zeit=abend] .huegel{fill:#5b4f7e}.buehne[data-zeit=abend] .boden{fill:#46406a}.buehne[data-zeit=abend] .haus rect:first-child,.buehne[data-zeit=abend] .kirche rect:first-child{fill:#e9d8e6}',
    '.buehne[data-zeit=nacht] .huegel{fill:#1d2a5a}.buehne[data-zeit=nacht] .boden{fill:#16214a}.buehne[data-zeit=nacht] .haus rect:first-child,.buehne[data-zeit=nacht] .kirche rect:first-child{fill:#3a4a86}.buehne[data-zeit=nacht] .haus path,.buehne[data-zeit=nacht] .kirche path{fill:#5a3b5e}',
    '.buehne[data-zeit=abend] .fenster,.buehne[data-zeit=nacht] .fenster{fill:#f2c14e;filter:drop-shadow(0 0 4px #f2c14e)}',
    '.granny-fig{position:absolute;left:50%;bottom:10px;width:176px;height:176px;margin-left:-88px;z-index:2;transform-origin:50% 100%}',
    '.granny-fig img{width:100%;height:100%;border-radius:50%;object-fit:cover;border:4px solid #F2C14E;box-shadow:0 0 0 6px rgba(242,193,78,.15),0 12px 30px rgba(0,0,0,.45),0 0 40px rgba(229,143,168,.5);cursor:pointer;display:block}',
    '.requisit{position:absolute;font-size:46px;line-height:1;pointer-events:none;opacity:0;right:-26px;top:-8px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.35))}',
    '.zzz{position:absolute;left:calc(50% + 70px);top:40px;z-index:3;font:800 26px Georgia,serif;color:#ffe9a8;opacity:0;transition:opacity 1s}',
    '.zzz span{font-size:.8em;margin-left:4px;position:relative;top:-10px}.zzz span+span{top:-22px;font-size:.65em}',
    'body.nacht .zzz{opacity:1;animation:gpZzz 3s ease-in-out infinite}@keyframes gpZzz{50%{transform:translate(6px,-8px)}}',
    'body.nacht .granny-fig img{filter:brightness(.8) saturate(.8)}',
    'body.nacht main>*:not(.buehne):not(.blase):not(.zeit){opacity:.82}',
    /* Posen */
    '.granny-fig.p-sprechen{animation:gpSprechen .5s ease-in-out infinite alternate}@keyframes gpSprechen{to{transform:translateY(-4px) scale(1.02) rotate(.6deg)}}',
    '.granny-fig.p-winken{animation:gpWinken 1.4s ease-in-out}@keyframes gpWinken{15%,45%,75%{transform:rotate(-7deg)}30%,60%,90%{transform:rotate(7deg)}}',
    '.granny-fig.p-suchen{animation:gpSuchen 1.8s ease-in-out}@keyframes gpSuchen{20%{transform:translateX(-14px) rotate(-6deg)}50%{transform:translateX(14px) rotate(6deg)}80%{transform:translateY(-10px) scale(1.06)}}',
    '.granny-fig.p-lachen{animation:gpLachen 1.2s cubic-bezier(.3,1.6,.5,1)}@keyframes gpLachen{20%{transform:translateY(-22px) scale(1.06)}40%{transform:translateY(0) scale(.97,1.03)}60%{transform:translateY(-10px)}80%{transform:none}}',
    '.granny-fig.p-nicken{animation:gpNicken 1s ease-in-out}@keyframes gpNicken{25%,75%{transform:rotate(4deg) translateY(4px)}50%{transform:none}}',
    '.granny-fig.p-warnen{animation:gpWarnen .9s ease-in-out}@keyframes gpWarnen{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}',
    '.granny-fig.p-trinken,.granny-fig.p-gong,.granny-fig.p-merken,.granny-fig.p-herz{animation:gpLachen 1.2s ease-out}',
    '.granny-fig[class*=" p-"] .requisit{animation:gpRequisit 1.8s ease-out}',
    '@keyframes gpRequisit{0%{opacity:0;transform:translateY(20px) scale(.4) rotate(-20deg)}25%{opacity:1;transform:translateY(-6px) scale(1.15) rotate(8deg)}75%{opacity:1;transform:translateY(-14px) scale(1)}100%{opacity:0;transform:translateY(-34px) scale(.8)}}',
    '.blase{position:relative;margin-top:-4px;text-align:center}',
    '.blase::before{content:"";position:absolute;top:-14px;left:50%;margin-left:-14px;border:14px solid transparent;border-top:0;border-bottom-color:#fffaf0}',
    '.nachricht{background:linear-gradient(135deg,#E58FA8,#f2c14e);color:#2a1020;font-size:26px;font-weight:800;border-radius:24px;min-height:84px;box-shadow:0 8px 0 #9c4f66}',
    '.nachricht:active{transform:translateY(4px);box-shadow:0 4px 0 #9c4f66}',
    '.merk,.album{background:var(--card);border-radius:24px;padding:16px 18px;font-size:22px;line-height:1.4}',
    '.merk h3,.album h3{margin:0 0 8px;font-size:22px;color:var(--gold2)}',
    '.merk ul{list-style:none;margin:0 0 12px;padding:0}.merk li{padding:6px 0;border-bottom:1px solid #2c3a72}.merk li b{color:var(--gold2)}',
    '.merk p{margin:0 0 12px;color:var(--soft);font-size:19px}',
    '.merk button,.album .navi button{width:100%;min-height:64px;border-radius:18px;background:#2a3566;font-size:22px;font-weight:700}',
    '.album .bildwer{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;min-height:0;background:none;width:100%}',
    '.album .rund{width:150px;height:150px;border-radius:50%;background:var(--gold);color:#2a1d00;font-size:64px;font-weight:800;display:flex;align-items:center;justify-content:center;overflow:hidden;border:4px solid var(--gold);box-shadow:0 0 30px rgba(242,193,78,.35)}',
    '.album .rund img{width:100%;height:100%;object-fit:cover}',
    '.album .name{font-size:28px;font-weight:800}.album .werzeile{font-size:20px;color:var(--soft)}',
    '.album .anruf{width:100%;min-height:64px;border-radius:18px;background:var(--ok);color:#06210f;font-size:22px;font-weight:800;margin-top:12px}',
    '.album .navi{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}',
    '.heute .jetzt{display:block;margin-top:6px;padding:8px 12px;border-radius:14px;background:rgba(242,193,78,.18);animation:gpGlow 1.5s ease-in-out 4}',
    '@keyframes gpGlow{50%{box-shadow:0 0 0 4px rgba(242,193,78,.5)}}',
    'body.gross .blase{font-size:30px}body.gross .person{font-size:31px}body.gross .heute,body.gross .merk,body.gross .album{font-size:28px}body.gross .zeit .tag{font-size:38px}body.gross .zeit .uhr{font-size:28px}body.gross .hilfe{font-size:32px}body.gross .klemmt{font-size:28px}',
    '.st-zeile{display:grid;grid-template-columns:1fr auto auto auto;gap:6px;align-items:center;margin-top:10px}',
    '.st-zeile button{min-height:48px;min-width:48px;border-radius:12px;background:#2a3566;font-size:16px;font-weight:700;padding:0 10px}',
    '.st-zeile button.rec{background:#d6413b;color:#fff}',
    '.st-zeile small{display:block;color:#8e98c4;font-size:13px}',
    '#e_lernen{font-size:15px;line-height:1.5;color:var(--text)}#e_lernen div{padding:3px 0}',
    '@media (prefers-reduced-motion:reduce){.granny-fig,.wolke,.sternchen,.zzz,.requisit{animation:none!important}}',
    '@media (max-width:360px){.buehne{height:220px}.granny-fig{width:150px;height:150px;margin-left:-75px}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- Bühne: Tageszeit und Nacht ---------- */
  function phase(h) { return h < 6 ? 'nacht' : h < 11 ? 'morgen' : h < 14 ? 'mittag' : h < 18 ? 'nachmittag' : h < 22 ? 'abend' : 'nacht'; }
  function buehneZeit() {
    var h = new Date().getHours(), p = phase(h);
    var b = $('buehne'); if (b) b.dataset.zeit = p;
    document.body.classList.toggle('nacht', p === 'nacht');
  }

  /* ---------- Posen ---------- */
  var REQ = { winken: '👋', suchen: '👓', lachen: '✨', nicken: '💛', warnen: '✋', trinken: '🥛', gong: '🔔', merken: '📝', herz: '💌', sprechen: '' };
  var poseTimer = null;
  function pose(name, dauer) {
    var f = $('gfig'); if (!f || ruhig) return;
    f.className = 'granny-fig'; void f.offsetWidth;
    f.classList.add('p-' + name);
    $('requisit').textContent = REQ[name] || '';
    clearTimeout(poseTimer);
    poseTimer = setTimeout(function () { f.className = 'granny-fig'; }, dauer || (name === 'sprechen' ? 2500 : 1900));
  }

  /* ---------- Lern-Zahlen (nur auf dem Gerät) ---------- */
  var LK = 'granny.lernen';
  function lern() { var m = hol(LK, {}); return Object.assign({ tage: [], anruf: {}, hilfe: 0, klemmt: 0, reden: 0, fragen: {}, stunden: new Array(24).fill(0), letzter: null }, m); }
  function lernSave(m) { leg(LK, m); }
  function zaehl(art, name, p) {
    var m = lern(), d = heuteKey();
    if (m.tage.indexOf(d) < 0) { m.tage.push(d); if (m.tage.length > 120) m.tage.shift(); }
    m.stunden[new Date().getHours()]++;
    if (art === 'anruf') { m.anruf[name] = (m.anruf[name] || 0) + 1; m.letzter = { n: name, t: Date.now() }; }
    else if (art === 'hilfe' || art === 'klemmt' || art === 'reden') m[art]++;
    else m.fragen[art] = (m.fragen[art] || 0) + 1;
    lernSave(m);
    if (p) pose(p);
    teilen();
  }
  function frage(art) { var m = lern(); m.fragen[art] = (m.fragen[art] || 0) + 1; lernSave(m); }

  /* ---------- Server (gemeinsame Verbindung aller DR-Lab-Apps) ---------- */
  function verbindung() {
    var a = String(hol('drlab-hermes-adresse', '') || '').trim().replace(/\/+$/, ''), k = hol('drlab-hermes-passwort', '');
    return /^https:\/\//.test(a) && k ? { a: a, k: k } : null;
  }
  var verlauf = [];
  function server() {
    var v = verbindung(); if (!v) return null;
    return function (text) {
      var S = G.S, seele = (window.NOVA_SEELEN || {})['Granny'] || '';
      var dinge = merkListe().map(function (x) { return x.d + ': ' + x.o; }).join('; ');
      var sys = seele + ' Du sprichst als Granny, die liebe, lustige alte Dame aus dem Dorf, die selbst alles vergisst und darüber lacht. ' +
        'Antworte auf ' + (es() ? 'Spanisch' : 'Deutsch') + ', höchstens zwei kurze, warme Sätze, einfache Wörter. ' +
        (S.name ? 'Die Person heisst ' + S.name + '. ' : '') + 'Heute ist ' + G.datumText() + '. ' +
        (S.heute ? 'Heute geplant: ' + S.heute.replace(/\n/g, '; ') + '. ' : '') +
        (dinge ? 'Sie hat dir gesagt, wo Dinge liegen: ' + dinge + '. ' : '') +
        'Familie: ' + S.leute.filter(function (p) { return p.n; }).map(function (p) { return p.n + (p.wer ? ' (' + p.wer + ')' : ''); }).join(', ') + '.';
      verlauf.push({ role: 'user', content: text }); verlauf = verlauf.slice(-8);
      return fetch(v.a + '/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + v.k, 'X-Nova-App': 'Granny' },
        body: JSON.stringify({ model: 'sense-engine', max_tokens: 160, messages: [{ role: 'system', content: sys }].concat(verlauf) })
      }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        var a = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
        if (a) verlauf.push({ role: 'assistant', content: a });
        return a ? a.trim() : null;
      }).catch(function () { return null; });
    };
  }
  function teilen() {
    if (!hol('granny.teilen', false)) return;
    var v = verbindung(); if (!v) return;
    var d = heuteKey(); if (hol('granny.geteilt', '') === d) return;
    var m = lern(), anrufe = 0; Object.keys(m.anruf).forEach(function (k) { anrufe += m.anruf[k]; });
    var zahlen = { tage: m.tage.length, anrufe: anrufe, hilfe: m.hilfe, klemmt: m.klemmt, reden: m.reden, fragen: m.fragen, stunden: m.stunden, sprache: G.S.sprache };
    fetch(v.a + '/erfahrung', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + v.k },
      body: JSON.stringify({ app: 'Granny', art: 'lernzahlen', frage: JSON.stringify(zahlen), antwort: '' }) })
      .then(function (r) { if (r.ok) leg('granny.geteilt', d); }).catch(function () {});
  }

  /* ---------- Merkhilfe «Wo liegt was?» ---------- */
  var MK = 'granny.merk';
  function merkListe() { return hol(MK, []); }
  function merk(ding, ort) {
    var l = merkListe().filter(function (x) { return x.k !== schl(ding); });
    l.unshift({ k: schl(ding), d: gross(ding), o: ort.replace(/[.!?]+$/, ''), t: Date.now() });
    leg(MK, l.slice(0, 8)); merkZeigen();
  }
  function schl(d) { return String(d).toLowerCase().replace(/(en|n|s|e)$/, '').slice(0, 6); }
  var RX = {
    de: {
      leg1: /(?:merk dir[,:]?\s*)?(?:mein|meine|meinen|der|die|das|den)\s+([a-zäöüß]+)\s+(?:ist|liegt|steht|hängt|sind|liegen|stehen|hängen)\s+((?:in|im|ins|auf|unter|neben|bei|beim|am|an|hinter|vor|zwischen|oben|unten|draussen|im)\b.+)/,
      leg2: /ich\s+(?:lege|leg|tue|tu|stelle|stell|hänge|häng|habe|hab|packe|pack)\s+(?:den|die|das|meinen|meine|mein)\s+([a-zäöüß]+)\s+((?:in|ins|im|auf|aufs|unter|neben|bei|zu|zum|zur|an|hinter|vor)\b.+?)(?:\s+(?:gelegt|getan|gestellt|gehängt|gepackt))?$/,
      wo: /wo\s+(?:ist|sind|liegt|liegen|steht|stehen|hab ich|habe ich)\s+(?:denn\s+)?(?:mein|meine|meinen|der|die|das|den)?\s*([a-zäöüß]+)/,
      betrug: /\b(geld|bank|überweis\w*|kreditkarte|bankkarte|karte|kaution|gewonnen|gewinnspiel|bitcoin|polizei|enkel|notar|erbschaft)\b/,
      wer: /wer ist\s+([a-zäöüß]+)/, nachricht: /(nachricht|stimme von|vermiss)/, trinken: /(getrunken|trinke|trinken|wasser|durst)/, nacht: /(gute nacht|schlafen|müde|nacht)/, album: /(familie|fotos|bilder)/
    },
    es: {
      leg1: /(?:mis?|el|la|los|las)\s+([a-záéíóúñ]+)\s+(?:está|están|esta|estan)\s+((?:en|encima|debajo|al lado|dentro|junto|detrás|delante)\b.+)/,
      leg2: /(?:dejo|he dejado|pongo|he puesto|guardo|he guardado)\s+(?:mis?|el|la|los|las)\s+([a-záéíóúñ]+)\s+((?:en|encima|debajo|al lado|dentro|junto|detrás|delante)\b.+)/,
      wo: /d[oó]nde\s+(?:est[aá]n?|he dejado|he puesto|tengo)\s+(?:mis?|el|la|los|las)?\s*([a-záéíóúñ]+)/,
      betrug: /(dinero|banco|transferencia|tarjeta|polic[ií]a|nieto|premio|herencia|bizum|notario)/,
      wer: /qui[eé]n es\s+([a-záéíóúñ]+)/, nachricht: /(mensaje|echo de menos)/, trinken: /(beb|agua|sed)/, nacht: /(buenas noches|dormir|cansad|noche)/, album: /(familia|fotos)/
    }
  };
  function merkZeigen() {
    var box = $('merk'); if (!box) return;
    var t = T(), l = merkListe();
    box.hidden = false; box.innerHTML = '';
    var h = document.createElement('h3'); h.textContent = '📝 ' + t.merkTitel; box.appendChild(h);
    if (l.length) {
      var ul = document.createElement('ul');
      l.slice(0, 5).forEach(function (x) { var li = document.createElement('li'); var b = document.createElement('b'); b.textContent = x.d + ': '; li.append(b, document.createTextNode(x.o)); ul.appendChild(li); });
      box.appendChild(ul);
    } else { var p = document.createElement('p'); p.textContent = t.merkLeer; box.appendChild(p); }
    var k = document.createElement('button'); k.textContent = '🎙 ' + t.merkKnopf; k.onclick = function () { pose('merken'); $('reden').click(); }; box.appendChild(k);
  }

  /* ---------- Familienalbum ---------- */
  var ai = 0;
  function albumLeute() { return G.S.leute.filter(function (p) { return p.n && (p.wer || p.bild); }); }
  function albumZeigen() {
    var box = $('album'); if (!box) return;
    var l = albumLeute(), t = T();
    if (!l.length) { box.hidden = true; return; }
    box.hidden = false; ai = ai % l.length; var p = l[ai];
    box.innerHTML = '';
    var h = document.createElement('h3'); h.textContent = '💛 ' + t.album; box.appendChild(h);
    var b = document.createElement('button'); b.className = 'bildwer';
    var r = document.createElement('div'); r.className = 'rund';
    if (p.bild) { var im = document.createElement('img'); im.src = p.bild; im.alt = ''; r.appendChild(im); } else r.textContent = p.n.charAt(0).toUpperCase();
    var n = document.createElement('div'); n.className = 'name'; n.textContent = p.n;
    var w = document.createElement('div'); w.className = 'werzeile'; w.textContent = p.wer || '';
    b.append(r, n, w);
    b.onclick = function () { pose('herz'); G.sag(t.wer(p.n, p.wer)); };
    box.appendChild(b);
    if (p.nr) { var ca = document.createElement('button'); ca.className = 'anruf'; ca.textContent = '📞 ' + t.anrufen(p.n); ca.onclick = function () { zaehl('anruf', p.n, 'winken'); G.sag(es() ? 'Llamo a ' + p.n + '.' : 'Ich rufe ' + p.n + ' an.'); setTimeout(function () { G.anrufen(p.nr); }, 1200); }; box.appendChild(ca); }
    if (l.length > 1) {
      var nv = document.createElement('div'); nv.className = 'navi';
      var v1 = document.createElement('button'); v1.textContent = '◀ ' + t.vor; v1.onclick = function () { ai = (ai - 1 + l.length) % l.length; albumZeigen(); };
      var v2 = document.createElement('button'); v2.textContent = t.weiter + ' ▶'; v2.onclick = function () { ai = (ai + 1) % l.length; albumZeigen(); var q = albumLeute()[ai]; if (q) G.sag(t.wer(q.n, q.wer)); };
      nv.append(v1, v2); box.appendChild(nv);
    }
  }

  /* ---------- Stimme der Familie (IndexedDB, nur dieses Gerät) ---------- */
  var DB = null;
  function db() {
    if (DB) return DB;
    DB = new Promise(function (res) {
      try {
        var r = indexedDB.open('granny-stimmen', 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('st'); };
        r.onsuccess = function () { res(r.result); }; r.onerror = function () { res(null); };
      } catch (e) { res(null); }
    });
    return DB;
  }
  function stHol(k) { return db().then(function (d) { if (!d) return null; return new Promise(function (res) { try { var q = d.transaction('st').objectStore('st').get(k); q.onsuccess = function () { res(q.result || null); }; q.onerror = function () { res(null); }; } catch (e) { res(null); } }); }); }
  function stLeg(k, v) { return db().then(function (d) { if (!d) return; return new Promise(function (res) { try { var tx = d.transaction('st', 'readwrite'); if (v) tx.objectStore('st').put(v, k); else tx.objectStore('st').delete(k); tx.oncomplete = res; tx.onerror = res; } catch (e) { res(); } }); }); }
  var spieler = null;
  function abspielen(k, danach) {
    return stHol(k).then(function (blob) {
      if (!blob) return false;
      try { speechSynthesis.cancel(); } catch (e) {}
      if (window.NovaStimme) try { NovaStimme.stopp(); } catch (e) {}
      if (spieler) try { spieler.pause(); } catch (e) {}
      spieler = new Audio(URL.createObjectURL(blob));
      spieler.onended = function () { if (danach) danach(); };
      var p = spieler.play(); if (p && p.catch) p.catch(function () {});
      pose('herz', 2500);
      return true;
    });
  }
  function familienName() { var p = G.S.leute.find(function (x) { return x.n; }); return p ? p.n : (es() ? 'tu familia' : 'deiner Familie'); }
  function nachrichtZeigen() {
    var b = $('nachricht'); if (!b) return;
    stHol('liebe').then(function (x) {
      b.hidden = !x; if (!x) return;
      b.textContent = T().nachricht(familienName());
      b.onclick = function () { zaehl('nachricht'); $('blase').textContent = T().nachricht(familienName()); abspielen('liebe'); };
    });
  }
  function stimmenUI() {
    var box = $('e_stimmen'); if (!box) return;
    box.innerHTML = '';
    X.de.stimmen.forEach(function (s) {
      var z = document.createElement('div'); z.className = 'st-zeile';
      var l = document.createElement('div'); l.textContent = s[1]; var sm = document.createElement('small'); l.appendChild(sm);
      var rec = document.createElement('button'), play = document.createElement('button'), weg = document.createElement('button');
      rec.textContent = X.de.aufnehmen; play.textContent = X.de.abspielen; weg.textContent = X.de.loeschen;
      play.setAttribute('aria-label', 'Abspielen'); weg.setAttribute('aria-label', 'Löschen');
      function stand() { stHol(s[0]).then(function (x) { sm.textContent = x ? X.de.aufnahmeDa : X.de.keineAufnahme; play.disabled = weg.disabled = !x; }); }
      stand();
      var mr = null, teile = [], tmo = null;
      rec.onclick = function () {
        if (mr && mr.state === 'recording') { mr.stop(); return; }
        if (!navigator.mediaDevices || !window.MediaRecorder) { sm.textContent = X.de.keinMikro; return; }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (strom) {
          var typ = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(function (t) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t); });
          mr = typ ? new MediaRecorder(strom, { mimeType: typ }) : new MediaRecorder(strom); teile = [];
          mr.ondataavailable = function (e) { if (e.data && e.data.size) teile.push(e.data); };
          mr.onstop = function () {
            clearTimeout(tmo); strom.getTracks().forEach(function (t) { t.stop(); });
            rec.textContent = X.de.aufnehmen; rec.classList.remove('rec');
            var blob = new Blob(teile, { type: mr.mimeType || 'audio/mp4' });
            if (blob.size > 500) stLeg(s[0], blob).then(function () { stand(); nachrichtZeigen(); });
          };
          mr.start(); rec.textContent = X.de.stopp; rec.classList.add('rec');
          tmo = setTimeout(function () { if (mr.state === 'recording') mr.stop(); }, 30000);
        }, function () { sm.textContent = X.de.keinMikro; });
      };
      play.onclick = function () { abspielen(s[0]); };
      weg.onclick = function () { if (confirm('Diese Aufnahme löschen?')) stLeg(s[0], null).then(function () { stand(); nachrichtZeigen(); }); };
      z.append(l, rec, play, weg); box.appendChild(z);
    });
  }

  /* ---------- Optionen ---------- */
  var OK = 'granny.optionen';
  function opt() { return Object.assign({ trinken: true, wach: false, gross: false, akku: true }, hol(OK, {})); }
  function optSetzen() {
    var o = opt();
    document.body.classList.toggle('gross', !!o.gross);
    wachHalten(o.wach);
  }
  var lock = null;
  function wachHalten(an) {
    if (!('wakeLock' in navigator)) return;
    if (an && !lock && document.visibilityState === 'visible') navigator.wakeLock.request('screen').then(function (l) { lock = l; l.addEventListener('release', function () { lock = null; }); }).catch(function () {});
    if (!an && lock) { lock.release(); lock = null; }
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') wachHalten(opt().wach); });

  function lernenUI() {
    var box = $('e_lernen'); if (!box) return;
    box.innerHTML = '';
    X.de.lernen(lern()).forEach(function (z) { var d = document.createElement('div'); d.textContent = z; box.appendChild(d); });
    var ml = merkListe(); if (ml.length) { var d = document.createElement('div'); d.textContent = 'Merkliste: ' + ml.map(function (x) { return x.d + ' (' + x.o + ')'; }).join(', '); box.appendChild(d); }
    var p = document.createElement('div'); p.style.cssText = 'color:#8e98c4;font-size:13px;margin-top:6px';
    p.textContent = 'Gespeichert werden nur Zahlen und die Merkliste, nur auf diesem Gerät. Keine Stimme, keine Bilder. Granny lernt daraus: Sie erzählt beim Gruss, mit wem gestern geredet wurde, und zeigt Ihnen hier, wo es hakt.';
    box.appendChild(p);
  }
  function einstOffen() {
    var o = opt();
    [['o_trinken', 'trinken'], ['o_wach', 'wach'], ['o_gross', 'gross'], ['o_akku', 'akku']].forEach(function (x) {
      var el = $(x[0]); if (!el) return; el.checked = !!o[x[1]];
      el.onchange = function () { var n = opt(); n[x[1]] = el.checked; leg(OK, n); optSetzen(); };
    });
    var t = $('o_teilen'); if (t) { t.checked = !!hol('granny.teilen', false); t.onchange = function () { leg('granny.teilen', t.checked); if (t.checked) teilen(); }; }
    var w = $('e_lernen_weg'); if (w) w.onclick = function () { if (confirm('Lern-Zahlen und Merkliste löschen?')) { try { localStorage.removeItem(LK); localStorage.removeItem(MK); } catch (e) {} lernenUI(); merkZeigen(); } };
    stimmenUI(); lernenUI();
  }

  /* ---------- Gong + Termine + Trinken + Akku ---------- */
  var AC = null;
  function gong() {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      [523.25, 659.25, 783.99].forEach(function (f, i) {
        var o = AC.createOscillator(), g = AC.createGain(), t0 = AC.currentTime + i * .35;
        o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.25, t0 + .02); g.gain.exponentialRampToValueAtTime(.001, t0 + 1.6);
        o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + 1.7);
      });
    } catch (e) {}
  }
  var beruehrt = false;
  function termine() {
    return (G.S.heute || '').split('\n').map(function (z) {
      var m = z.trim().match(/^(\d{1,2})(?:[:.h](\d{2}))?\s*(?:uhr|h)?\s*[:\-–]?\s*(.+)$/i);
      if (!m || +m[1] > 23) return null;
      return { h: +m[1], m: +(m[2] || 0), text: z.trim() };
    }).filter(Boolean);
  }
  function takt() {
    buehneZeit();
    var d = new Date(), tag = heuteKey(), erledigt = hol('granny.termine', {});
    if (erledigt.tag !== tag) erledigt = { tag: tag, l: [] };
    termine().forEach(function (t) {
      var ab = t.h * 60 + t.m, jetzt = d.getHours() * 60 + d.getMinutes();
      if (jetzt >= ab && jetzt < ab + 15 && erledigt.l.indexOf(t.text) < 0) {
        erledigt.l.push(t.text); leg('granny.termine', erledigt);
        gong(); pose('gong');
        setTimeout(function () { G.sag(T().termin(t.text)); markiere(t.text); }, 1200);
      }
    });
    var o = opt(), h = d.getHours();
    if (o.trinken && beruehrt && h >= 8 && h < 20) {
      var letzt = hol('granny.trinken', 0);
      if (Date.now() - letzt > 2 * 3600 * 1000) {
        if (letzt) { pose('trinken'); G.sag(T().trinken); }
        leg('granny.trinken', Date.now());
      }
    }
  }
  function markiere(text) {
    var h = $('heute'); if (!h) return;
    var s = document.createElement('span'); s.className = 'jetzt'; s.textContent = '🔔 ' + text; h.appendChild(s);
    setTimeout(function () { s.remove(); }, 15 * 60 * 1000);
  }
  var akkuZuletzt = 0;
  function akkuWaechter() {
    if (!navigator.getBattery) return;
    navigator.getBattery().then(function (b) {
      function pruef() {
        if (!opt().akku || b.charging || b.level > .2) return;
        if (Date.now() - akkuZuletzt < 10 * 60 * 1000) return;
        akkuZuletzt = Date.now(); pose('warnen');
        abspielen('akku').then(function (ok) { if (!ok) G.sag(T().akku); });
      }
      b.addEventListener('levelchange', pruef); b.addEventListener('chargingchange', pruef); pruef();
    }).catch(function () {});
  }

  /* ---------- Erstes Tippen am Tag: Morgen- oder Nacht-Nachricht ---------- */
  document.addEventListener('pointerdown', function () {
    if (beruehrt) return; beruehrt = true;
    var h = new Date().getHours(), tag = heuteKey(), k = h >= 5 && h < 12 ? 'morgen' : (h >= 20 || h < 5 ? 'nacht' : '');
    if (!k || hol('granny.gespielt.' + k, '') === tag) return;
    stHol(k).then(function (x) { if (!x) return; leg('granny.gespielt.' + k, tag); setTimeout(function () { abspielen(k); }, 900); });
  }, true);

  /* ---------- Antworten ohne Server ---------- */
  function antwort(x, roh) {
    var t = T(), r = es() ? RX.es : RX.de, S = G.S;
    var erste = S.leute.find(function (p) { return p.nr; });
    if (r.betrug.test(x)) { frage('betrug'); pose('warnen'); G.sag(t.betrug(erste ? erste.n : '')); return true; }
    var ri = function (rx) { return String(roh || '').match(new RegExp(rx.source, 'i')) || x.match(rx); };
    var m = ri(r.leg2) || ri(r.leg1);
    if (m && !/^wo\b|d[oó]nde/.test(x)) { frage('merk'); merk(m[1], m[2]); pose('merken'); G.sag(t.gemerkt(gross(m[1]), m[2].replace(/[.!?]+$/, ''))); return true; }
    var w = x.match(r.wo);
    if (w) {
      var k = schl(w[1]), f = merkListe().find(function (e) { return e.k === k || e.k.indexOf(k) === 0 || k.indexOf(e.k) === 0; });
      frage(/brill|gafa/.test(w[1]) ? 'brille' : 'merk');
      if (f) { pose('nicken'); G.sag(t.gefunden(f.d, f.o, t.wann(f.t))); return true; }
      if (/brill|gafa/.test(w[1])) { pose('suchen'); return false; } // Grannys Brillen-Witz
      pose('suchen'); G.sag(t.nichtGemerkt(w[1])); return true;
    }
    var wer = x.match(r.wer);
    if (wer) {
      var p = S.leute.find(function (q) { return q.n && q.n.toLowerCase() === wer[1]; });
      if (p) { frage('wer'); var l = albumLeute(); var i = l.indexOf(p); if (i >= 0) { ai = i; albumZeigen(); } pose('herz'); G.sag(p.wer ? t.wer(p.n, p.wer) : t.werFehlt(p.n)); return true; }
    }
    if (r.nachricht.test(x)) { frage('nachricht'); abspielen('liebe').then(function (ok) { if (!ok) G.sag(es() ? 'Todavía no hay ningún mensaje. Tu familia puede grabar uno.' : 'Es gibt noch keine Nachricht. Deine Familie kann eine aufnehmen.'); }); return true; }
    if (r.trinken.test(x) && !/\?/.test(roh)) { frage('trinken'); pose('trinken'); leg('granny.trinken', Date.now()); G.sag(t.getrunken); return true; }
    if (r.nacht.test(x)) {
      frage('nacht'); pose('nicken');
      var h = new Date().getHours();
      if (h >= 22 || h < 5) { var mo = new Date(Date.now() + (h >= 22 ? 86400000 : 0)); var tl = (es() ? ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] : ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'])[mo.getDay()]; G.sag(t.nachtWeiter(tl)); }
      else G.sag(t.nacht);
      abspielen('nacht'); return true;
    }
    if (r.album.test(x) && albumLeute().length) { frage('wer'); var q = albumLeute()[ai % albumLeute().length]; pose('herz'); G.sag(t.wer(q.n, q.wer)); var a = $('album'); if (a) a.scrollIntoView({ behavior: 'smooth', block: 'center' }); return true; }
    if (/(welcher tag|datum|wochentag|uhrzeit|wie sp[aä]t|qu[eé] d[ií]a|qu[eé] hora|fecha)/.test(x)) frage('datum');
    return false;
  }

  /* ---------- Sprechen = Pose ---------- */
  function spricht(text) {
    var f = $('gfig'); if (!f) return;
    if (/^…$/.test(text)) return;
    if (f.className === 'granny-fig') pose('sprechen', Math.min(9000, 900 + String(text).length * 55));
  }

  /* ---------- Neu zeichnen ---------- */
  function gezeichnet() {
    buehneZeit(); merkZeigen(); albumZeigen(); nachrichtZeigen(); optSetzen();
    // Granny erinnert sich an gestern (aus den Lern-Zahlen)
    var m = lern(), b = $('blase');
    if (m.letzter && b && Date.now() - m.letzter.t > 6 * 3600 * 1000 && Date.now() - m.letzter.t < 48 * 3600 * 1000) b.textContent += T().gesternRedet(m.letzter.n);
    if (document.body.classList.contains('nacht') && b) b.textContent = T().nacht;
  }

  window.GrannyPlus = { pose: pose, spricht: spricht, zaehl: zaehl, antwort: antwort, server: server, gezeichnet: gezeichnet, einstOffen: einstOffen };
  gezeichnet(); takt(); setInterval(takt, 20000); akkuWaechter(); teilen();
  setTimeout(function () { pose('winken'); }, 600);
})();
