/* Jackie · Runde 8 (22.10.2026): Polieren und Mitmachen. Notruf 117 · 144 · 142 bleibt überall sichtbar.
   1. «Heute für dich»-Karte im Stil der App-Store-«Heute»-Karten: jeden Tag ein kleiner Gedanke als ruhige Geschichte in drei Blättern,
      weicher Übergang mit der View Transitions API (Vorbild: App Store «Heute», Instagram-Story-Blätter).
   2. «Atem-Knopf»: gedrückt halten = einatmen, loslassen = ausatmen, fünf Atemzüge (Vorbild: Apple Watch «Atmen», Breathwrk).
   3. Jackie lange drücken: Kontextmenü mit Atmen, Mut-Satz, Notruf (Vorbild: iOS-Kontextmenü auf App-Symbolen).
   4. Offline-Hinweis: «Notrufe gehen trotzdem übers Telefon» (Vorbild: Offline-Banner in Google Docs).
   5. Alle Blätter mit Raststufen und Wischen zum Schliessen (Vorbild: iOS-Sheets).
   Kein Arzt, keine Diagnose, keine Heilversprechen. Nichts geht ins Netz. */
window.R8 = {
  bild: 'posen/winkt.jpg',
  offline: 'Offline. Notrufe <a href="tel:117">117</a> · <a href="tel:144">144</a> · <a href="tel:142">142</a> gehen trotzdem übers Telefon.',
  neuText: 'Neu: «Heute für dich» und der Atem-Knopf. Alles bleibt auf deinem Handy.',
  css: [
    '.r8-atem{display:flex;flex-direction:column;align-items:center;gap:16px;margin:8px 0 16px;user-select:none;-webkit-user-select:none}',
    '.r8-atem button.kreis{position:relative;width:184px;height:184px;border-radius:50%;border:0;cursor:pointer;color:#1a1f3a;font:inherit;font-weight:800;font-size:1.0625rem;touch-action:none;-webkit-touch-callout:none;background:radial-gradient(circle at 35% 30%,#fff3cf,#f2c14e 55%,#c99a3e);box-shadow:0 0 0 12px rgba(242,193,78,.12),0 0 0 26px rgba(242,193,78,.06),0 18px 40px -12px rgba(0,0,0,.6);transform:scale(.78);transition:transform 6s cubic-bezier(.3,.1,.3,1),box-shadow 6s}',
    '.r8-atem button.kreis.ein{transform:scale(1.06);transition:transform 4s cubic-bezier(.3,.1,.3,1),box-shadow 4s;box-shadow:0 0 0 18px rgba(242,193,78,.18),0 0 0 40px rgba(242,193,78,.08),0 18px 40px -12px rgba(0,0,0,.6)}',
    'html.r7-ruhig .r8-atem button.kreis,html.r7-ruhig .r8-atem button.kreis.ein{transform:none}',
    '@media (prefers-reduced-motion:reduce){.r8-atem button.kreis,.r8-atem button.kreis.ein{transform:none}}',
    '.r8-atem .r8-zaehler{display:flex;gap:8px}.r8-atem .r8-zaehler i{width:14px;height:14px;border-radius:50%;border:2px solid rgba(242,193,78,.6)}.r8-atem .r8-zaehler i.an{background:#f2c14e}',
    '.r8-atem p{text-align:center;margin:0!important;min-height:3em}',
    '.r8-story .r7-notruf{margin:0 0 4px}',
    '.r8-sos-knopf{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;margin:0 0 16px;padding:8px 16px;border-radius:16px;border:1.5px solid rgba(140,220,230,.55);background:rgba(120,200,220,.12);color:inherit;font:inherit;text-align:left;cursor:pointer}',
    '.r8-sos-knopf span{font-size:24px;flex:none}.r8-sos-knopf b{font-size:1rem}.r8-sos-knopf small{margin-left:auto;font-size:.8125rem;opacity:.8;text-align:right}',
    '.r8-sos-knopf:active{transform:scale(.98)}',
    '.r8-schritt-ok{margin-top:4px}'
  ].join('\n'),
  start: function (E, R) {
    function notruf() { return '<div class="r7-notruf" role="note"><span>Akute Gefahr?</span><a href="tel:117">117</a><a href="tel:144">144</a><a href="tel:142">142</a></div>'; }
    var TAGE = [
      { titel: 'Ein Nein ist ein ganzer Satz', karte: 'Du musst dein Nein nicht erklären.', bild: 'posen/mutig.jpg',
        gedanke: 'Viele Menschen haben gelernt, jedes Nein zu begründen. Dabei reicht ein ruhiges «Nein, danke». Du darfst Grenzen haben, auch bei Menschen, die du gern hast.',
        schritt: 'Probier heute ein kleines Nein, bei etwas Unwichtigem. Dann atme aus und merk dir: Nichts ist passiert. Du bist trotzdem gut.' },
      { titel: 'Hilfe holen ist stark', karte: 'Fragen ist kein Zeichen von Schwäche.', bild: 'posen/zuhoeren.jpg',
        gedanke: 'Wer um Hilfe bittet, kümmert sich um sich selbst. Das ist mutig. Beratungsstellen sind genau dafür da, auch wenn du dir noch nicht sicher bist.',
        schritt: 'Schreib dir heute eine Nummer oder einen Menschen auf, den du anrufen könntest. Nur aufschreiben. Mehr nicht.' },
      { titel: 'Dein Körper sagt es zuerst', karte: 'Ein enger Hals, ein flaues Gefühl: hör hin.', bild: 'posen/zuhoeren.jpg',
        gedanke: 'Oft merkt der Körper früher als der Kopf, dass etwas nicht stimmt. Das ist kein Fehler, das ist ein Hinweis. Du darfst ihn ernst nehmen.',
        schritt: 'Leg heute einmal die Hand auf den Bauch und frag dich: Wie geht es mir gerade wirklich? Ein Wort reicht.' },
      { titel: 'Ein Mensch, dem du vertraust', karte: 'Wer darf es wissen, wenn es schwierig wird?', bild: 'posen/zeigt.jpg',
        gedanke: 'Es hilft, wenn mindestens ein Mensch weiss, wie es dir geht. Eine Freundin, ein Nachbar, jemand aus der Familie. Du entscheidest, wie viel du erzählst.',
        schritt: 'Denk heute an einen Menschen, bei dem du dich sicher fühlst. Vielleicht schickst du ihm einfach ein «Hoi, wie gehts dir?».' },
      { titel: 'Wichtiges an einem Ort', karte: 'Ausweis, Schlüssel, Nummern: griffbereit.', bild: 'posen/zeigt.jpg',
        gedanke: 'Wenn es schnell gehen muss, ist es gut, wenn das Wichtigste beisammen ist. Das gibt Ruhe, auch wenn du es nie brauchst.',
        schritt: 'Leg heute einen Ort fest, wo Ausweis, Ersatzschlüssel und eine Liste mit Nummern liegen. Die Notfallkarte bei «Neu» hilft dabei.' },
      { titel: 'Du darfst langsam sein', karte: 'Nicht alles muss heute gelöst werden.', bild: 'figur.jpg',
        gedanke: 'Manche Tage sind schwer. Dann reicht es, den nächsten kleinen Schritt zu sehen. Nicht den ganzen Weg.',
        schritt: 'Such dir heute eine Sache aus, die du einfach lässt. Ohne schlechtes Gewissen. Das ist auch eine Entscheidung.' },
      { titel: 'Eine kleine Freude', karte: 'Freude ist kein Luxus, sie gibt Kraft.', bild: 'figur.jpg',
        gedanke: 'Ein warmer Tee, ein Lied, frische Luft. Kleine Freuden machen Probleme nicht weg, aber sie geben dir Kraft für den nächsten Schritt.',
        schritt: 'Gönn dir heute fünf Minuten nur für dich. Was wäre schön? Schreib es in die Notiz an dich, wenn du magst.' }
    ];
    var t = new Date(), nr = Math.floor((t - new Date(t.getFullYear(), 0, 0)) / 864e5) % TAGE.length, T = TAGE[nr];
    var erledigt = E.hol('heuteOk', '') === R.heute();
    function heuteStory(held) {
      st = E.story([
        { bild: T.bild, oben: 'Heute für dich', titel: T.titel, text: T.gedanke },
        { bild: 'posen/winkt.jpg', oben: 'Ein kleiner Schritt', titel: 'Magst du es probieren?', text: T.schritt,
          html: '<button type="button" class="r7-knopf r8-schritt-ok" aria-pressed="' + erledigt + '">' + (erledigt ? 'Schon gemacht ✓' : 'Mach ich heute') + '</button>',
          auf: function (s) { var b = s.querySelector('.r8-schritt-ok'); b.addEventListener('click', function () { erledigt = true; E.leg('heuteOk', R.heute()); b.textContent = 'Schön. Ich bin stolz auf dich ✓'; b.setAttribute('aria-pressed', 'true'); E.summ([10, 30, 10]); E.licht('heute'); }); } },
        { bild: 'posen/mutig.jpg', oben: 'Wenn es zu viel wird', titel: 'Du bist nicht allein', text: 'Bei Gefahr ruf sofort an. Die Nummern sind gratis, rund um die Uhr. Opferhilfe 142 berät nach Gewalt, vertraulich.',
          html: '<button type="button" class="r7-knopf leise" data-r8a="atem">Erst einmal atmen</button>',
          auf: function (s) { s.querySelector('[data-r8a=atem]').addEventListener('click', function () { st.zu(); setTimeout(atem, 280); }); } }
      ], { titel: 'Jackie · Heute für dich', bild: 'posen/winkt.jpg', held: held, zusatz: notruf(), ende: 'Fertig' });
    }
    var st = { zu: function () {} };
    function oeffneHeute(img) { E.wechsel(function () { if (img) img.style.viewTransitionName = ''; heuteStory(true); }); }
    E.heute({ ort: '#btnUnterwegs', wo: 'nach', bild: T.bild, oben: 'Heute für dich · ' + ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][t.getDay()], titel: T.titel, text: T.karte, knopf: 'Lesen', auf: oeffneHeute });

    /* Atem-Knopf: halten = einatmen, loslassen = ausatmen */
    function atem() {
      var n = 0, ein = false, t0 = 0;
      var inh = R.blatt({ titel: 'Atem-Knopf', bild: 'posen/zuhoeren.jpg', html: notruf() +
        '<div class="r8-atem"><button type="button" class="kreis" aria-describedby="r8AtemT">Halten</button><div class="r8-zaehler" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><p id="r8AtemT" aria-live="polite">Drück und halte den Kreis, während du langsam einatmest. Lass los zum Ausatmen.</p></div>' +
        '<p class="r7-klein">Mit der Tastatur: Leertaste halten. Kein Muss, kein Falsch. Nur fünf ruhige Atemzüge.</p>' });
      var k = inh.querySelector('.kreis'), txt = inh.querySelector('#r8AtemT'), pk = inh.querySelectorAll('.r8-zaehler i');
      function los() { if (ein) return; ein = true; t0 = Date.now(); k.classList.add('ein'); k.textContent = 'Einatmen …'; txt.textContent = 'Langsam einatmen … durch die Nase.'; }
      function aus() {
        if (!ein) return; ein = false; k.classList.remove('ein');
        if (Date.now() - t0 < 1200) { k.textContent = 'Halten'; txt.textContent = 'Etwas länger halten, ruhig bis vier zählen.'; return; }
        n++; [].forEach.call(pk, function (p, i) { p.classList.toggle('an', i < n); });
        k.textContent = 'Ausatmen …'; txt.textContent = 'Lang ausatmen … wie durch einen Strohhalm.';
        setTimeout(function () { if (!ein) k.textContent = n >= 5 ? 'Gut' : 'Halten'; }, 2500);
        if (n === 5) setTimeout(function () { txt.textContent = 'Fünf Atemzüge. Du bist hier, im Jetzt.'; R.feier('Fünf ruhige Atemzüge. Gut gemacht.'); }, 1200);
      }
      k.addEventListener('pointerdown', function (e) { e.preventDefault(); try { k.setPointerCapture(e.pointerId); } catch (x) {} los(); });
      k.addEventListener('pointerup', aus); k.addEventListener('pointercancel', aus);
      k.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      k.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); los(); } });
      k.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); aus(); } });
      k.addEventListener('click', function (e) { e.preventDefault(); });
    }

    /* Jackie lange drücken → Kontextmenü */
    var SAETZE = ['Du musst nicht stark sein. Du darfst einfach da sein.', 'Ein Schritt nach dem anderen. Das reicht.', 'Du bist wichtig. Auch heute.', 'Es ist nicht deine Schuld, wenn jemand dir weh tut.', 'Ruhe ist auch ein Weg.'];
    function mut() { var s = SAETZE[Math.floor(Math.random() * SAETZE.length)]; var b = document.getElementById('jkBlaseText'); if (b) b.textContent = s; R.feier(s, false); }
    var menue = [
      { e: '🆘', text: 'SOS: 1 Minute ruhig', tu: function () { sosLos(); } },
      { e: '🫧', text: 'Atem-Knopf', tu: atem },
      { e: '💛', text: 'Ein Mut-Satz', tu: mut },
      { e: '☀️', text: 'Heute für dich', tu: function () { heuteStory(false); } },
      '-',
      { e: '📞', text: '117 Polizei', href: 'tel:117' },
      { e: '🚑', text: '144 Sanität', href: 'tel:144' },
      { e: '🤝', text: '142 Opferhilfe', href: 'tel:142' }
    ];
    E.menue(document.getElementById('jkBild'), menue, 'Jackie');


    /* Wächst mit dir (Finch): Mutlichter, 5 Stufen, täglicher Ausflug */
    E.waechst({ ort: '#jkBuehne', wo: 'nach', figur: 'Jackie', bild: 'posen/winkt.jpg', licht: 'Mutlichter', licht1: 'Mutlicht',
      stufen: ['Kerzenlicht', 'Laternenlicht', 'Morgenlicht', 'Sonnenlicht', 'Leuchtturm'],
      wie: 'Ein kleiner Schritt für dich: Atem-Knopf, SOS-Minute, «Heute für dich» ausprobiert, eine Übung bei «Neu».',
      extraHtml: notruf(),
      ausfluege: [
        { f: '🍂', n: 'Ein rotes Herbstblatt', t: 'Ich bin durch den Park gegangen. Ein Blatt ist mir direkt auf den Schuh gefallen, ganz rot. Als wollte es sagen: Auch Loslassen kann schön aussehen.' },
        { f: '☕', n: 'Ein Lächeln vom Kafi', t: 'Die Frau im Kafi hat mir den Tee mit einem Herzli im Schaum gebracht. Kleine Freundlichkeit, grosse Wirkung. Ich habe dir das Lächeln mitgebracht.' },
        { f: '🪨', n: 'Ein glatter Stein vom See', t: 'Am See lag ein Stein, ganz glatt vom Wasser. Er hat Jahre gebraucht, um so weich zu werden. Du darfst dir auch Zeit lassen.' },
        { f: '🔑', n: 'Ein alter Schlüssel', t: 'Beim Schuhmacher hing ein alter Schlüssel. Er sagte: Nicht jede Tür muss man heute öffnen. Aber es ist gut zu wissen, dass man den Schlüssel hat.' },
        { f: '🌼', n: 'Eine Blume im Asphalt', t: 'Zwischen zwei Pflastersteinen wuchs eine kleine Blume. Niemand hat ihr geholfen, sie hat einfach ihren Weg gefunden. Wie du.' },
        { f: '🧣', n: 'Ein warmer Schal', t: 'Auf einer Bank lag ein Schal mit einem Zettel: «Für dich, falls dir kalt ist.» Ich habe ihn liegen lassen, für jemanden, der friert. Aber die Wärme habe ich mitgenommen.' },
        { f: '🕯️', n: 'Ein Licht im Fenster', t: 'Abends sah ich in einem Fenster eine Kerze. Ich dachte: Irgendwo wartet immer jemand, der es gut mit dir meint.' },
        { f: '🧵', n: 'Ein goldener Faden', t: 'Der Schuhmacher hat mir einen goldenen Faden geschenkt. Er sagt, damit flickt man nicht nur Schuhe, sondern auch Mut.' },
        { f: '🐦', n: 'Ein Spatzenlied', t: 'Ein Spatz sass auf meinem Schuh und hat gesungen, als gäbe es keine Sorgen. Für eine Minute gab es auch keine.' },
        { f: '📮', n: 'Eine Postkarte', t: 'Im Briefkasten war eine Postkarte ohne Absender: «Du machst das gut.» Ich glaube, sie war für dich.' },
        { f: '🌙', n: 'Ein Stück Mondlicht', t: 'Auf dem Heimweg schien der Mond auf die Strasse wie ein Teppich. Ich bin ganz langsam gegangen. Langsam ist auch ein Weg.' },
        { f: '🍎', n: 'Ein Apfel vom Markt', t: 'Die Marktfrau gab mir einen Apfel und sagte: Iss zuerst etwas, dann sieht die Welt freundlicher aus. Recht hat sie.' }
      ] });

    /* SOS: ein Knopf, sofort 1 Minute ruhig (Headspace SOS). Notruf bleibt im SOS sichtbar. */
    function sosLos() { E.sos({ figur: 'Jackie', bild: 'posen/zuhoeren.jpg', zusatz: notruf(), ende: 'Gut gemacht. Du bist hier, im Jetzt.' }); }
    var nr = document.querySelector('.jk-notruf');
    if (nr) {
      var sb = document.createElement('button'); sb.type = 'button'; sb.className = 'r8-sos-knopf'; sb.id = 'r8Sos';
      sb.innerHTML = '<span aria-hidden="true">🫧</span><b>SOS: 1 Minute ruhig werden</b><small>Atmen mit Jackie, sofort</small>';
      sb.addEventListener('click', sosLos);
      nr.parentNode.insertBefore(sb, nr.nextSibling);
    }

    window.R8.neu = [
      { id: 'sos', e: '🆘', titel: 'SOS-Minute', text: 'Sofort 1 Minute ruhig', auf: sosLos },
      { id: 'heute', e: '☀️', titel: 'Heute für dich', text: 'Ein Gedanke in drei Blättern', auf: function () { heuteStory(false); } },
      { id: 'atem', e: '🫧', titel: 'Atem-Knopf', text: 'Halten zum Einatmen', auf: atem }
    ];
  }
};

/* ---- Runde 8: gemeinsamer Kern «Polieren und Mitmachen» (22.10.2026) ----
   Layout- und Technik-Ideen aus Top-Apps, für alle DR-Lab-Apps gleich gebaut:
   · Blätter mit Raststufen und Wischen zum Schliessen (iOS-Sheets)       · Rückgängig-Toast statt Nachfragen (Gmail)
   · Offline-Hinweis (Google Docs)                                          · Teilen als Bild mit Canvas (Instagram, Strava)
   · Langes Drücken öffnet ein Kontextmenü (iOS)                            · Tastaturkürzel mit «?» (Gmail, Things 3)
   · Weiche Wechsel mit der View Transitions API (Chrome, Safari 18)        · Ringe wie Apple Fitness
   · Wochen-Serie mit Schutztag (Duolingo)                                  · «Heute»-Karte wie im App Store
   · Nach unten ziehen für Neues (Pull-to-refresh)                          · Story-Blätter (Instagram, Spotify Wrapped)
   Alles bleibt auf dem Gerät. «Weniger Bewegung» und prefers-reduced-motion werden respektiert.
   Testen: ?r8offline=1 zeigt den Offline-Hinweis. */
(function () {
  'use strict';
  var K = window.R8, R = window.R7K;
  if (!K || !R || window.R8K) return;
  var d = document, H = d.documentElement;
  var esc = R.esc, ruhig = R.ruhig;
  function hol(k, def) { return R.hol('r8' + k, def); }
  function leg(k, v) { R.leg('r8' + k, v); }
  function summ(ms) { if (K.haptik === false) return; R.summ(ms); }
  function ymd(t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }

  var css = [
    /* Blatt: Raststufen und Wischen */
    '.r7-blatt.r8-halb{max-height:62vh;max-height:62dvh}',
    '.r7-blatt.r8-voll{max-height:94vh;max-height:94dvh}',
    '.r7-blatt.r8-zieht{transition:none!important}',
    '.r7-blatt .r7-griff{position:relative;cursor:grab;touch-action:none}',
    '.r7-blatt .r7-griff::after{content:"";position:absolute;left:-40px;right:-40px;top:-14px;bottom:-14px}',
    '.r7-blatt .r7-kopf{touch-action:pan-x}',
    '.r8-mehr-hinweis{display:block;text-align:center;font-size:var(--r7-t5);color:var(--r7-ink2);margin:-8px 0 8px}',
    /* Rückgängig */
    '.r8-rueck{position:fixed;left:0;right:0;margin:0 auto;width:max-content;max-width:min(92vw,440px);bottom:calc(24px + env(safe-area-inset-bottom,0px));z-index:100070;display:flex;align-items:center;gap:12px;padding:6px 6px 6px 18px;border-radius:999px;background:#0b1330;color:#f6efe4;border:1px solid rgba(242,193,78,.5);box-shadow:var(--r7-schatten);font-size:var(--r7-t4);transform:translateY(24px);opacity:0;transition:transform .28s var(--r7-ease),opacity .28s}',
    '.r8-rueck.auf{transform:none;opacity:1}',
    '.r8-rueck span{flex:1;min-width:0}',
    '.r8-rueck button{flex:none;min-height:44px;padding:0 16px;border-radius:999px;border:0;background:var(--r7-gold);color:#1a1f3a;font:inherit;font-weight:800;cursor:pointer}',
    /* Offline */
    '.r8-offline{position:fixed;top:calc(8px + env(safe-area-inset-top,0px));left:0;right:0;margin:0 auto;width:max-content;max-width:min(94vw,460px);z-index:100080;padding:8px 16px;border-radius:999px;background:#2a1d0c;color:#ffe7b0;border:1px solid rgba(242,193,78,.6);box-shadow:var(--r7-schatten);font-size:var(--r7-t5);line-height:1.35;text-align:center}',
    '.r8-offline[hidden]{display:none}',
    '.r8-offline a{color:#fff;font-weight:800}',
    /* Kontextmenü */
    '.r8-menue{position:fixed;z-index:100090;min-width:220px;max-width:min(86vw,300px);padding:6px;border-radius:16px;background:rgba(18,28,66,.97);border:1px solid rgba(242,193,78,.45);box-shadow:0 18px 48px rgba(0,0,0,.55);color:#f6efe4;transform-origin:top left;animation:r8Pop .18s var(--r7-ease) both;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}',
    '@keyframes r8Pop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}',
    '.r8-menue button,.r8-menue a{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:10px;background:transparent;color:inherit;font:inherit;font-size:var(--r7-t4);text-align:left;text-decoration:none;cursor:pointer}',
    '.r8-menue button:hover,.r8-menue button:focus-visible,.r8-menue a:hover,.r8-menue a:focus-visible{background:rgba(242,193,78,.14)}',
    '.r8-menue .e{width:24px;text-align:center;flex:none}',
    '.r8-menue hr{border:0;border-top:1px solid rgba(255,255,255,.12);margin:4px 8px}',
    '.r8-menue small{display:block;padding:6px 12px 4px;color:#cfd6ee;font-size:var(--r7-t5)}',
    '.r8-lang{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}',
    '.r8-gedrueckt{transform:scale(.97);transition:transform .3s var(--r7-ease)}',
    /* Tastaturkürzel */
    '.r8-tasten{display:grid;grid-template-columns:auto 1fr;gap:8px 16px;align-items:center;margin:0 0 16px}',
    '.r8-tasten kbd{display:inline-grid;place-items:center;min-width:32px;height:32px;padding:0 8px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.25);border-bottom-width:3px;font:700 .875rem/1 ui-monospace,Menlo,monospace;color:#f6efe4}',
    '.r8-pc{display:none;margin:8px 0 0;font-size:var(--r7-t5);color:var(--r7-ink2)}@media (hover:hover) and (pointer:fine){.r8-pc{display:block}}',
    /* Heute-Karte */
    '.r8-heute{position:relative;display:block;width:100%;min-height:300px;margin:16px 0 24px;padding:0;border:0;border-radius:24px;overflow:hidden;background:#0e1838;color:#fff;text-align:left;font:inherit;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,.2),0 20px 40px -16px rgba(0,0,0,.65);transition:transform .25s var(--r7-ease)}',
    '.r8-heute:active{transform:scale(.98)}',
    '.r8-heute img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 25%}',
    '.r8-heute::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,12,32,.55) 0%,rgba(8,12,32,0) 32%,rgba(8,12,32,.1) 48%,rgba(8,12,32,.94) 100%)}',
    '.r8-heute .o{position:absolute;left:20px;right:20px;top:18px;z-index:1}',
    '.r8-heute .o small{display:block;font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85)}',
    '.r8-heute .o b{display:block;margin-top:4px;font-size:1.625rem;line-height:1.15;font-weight:800;text-shadow:0 2px 12px rgba(0,0,0,.5);overflow-wrap:break-word}',
    '.r8-heute .u{position:absolute;left:20px;right:20px;bottom:18px;z-index:1;display:flex;align-items:flex-end;gap:12px}',
    '.r8-heute .u span{flex:1;min-width:0;font-size:.9375rem;line-height:1.4;color:rgba(255,255,255,.92)}',
    '.r8-heute .u i{flex:none;font-style:normal;display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border-radius:999px;background:rgba(255,255,255,.22);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-weight:800;font-size:.875rem}',
    /* Ringe */
    '.r8-ringe{display:flex;align-items:center;gap:16px;flex-wrap:wrap}',
    '.r8-ringe svg{flex:none;width:132px;height:132px}',
    '.r8-ringe svg .b{transition:stroke-dashoffset 1.1s var(--r7-ease)}',
    '.r8-ringe ul{list-style:none;margin:0;padding:0;flex:1 1 140px;min-width:0;display:grid;gap:8px}',
    '.r8-ringe li{display:flex;align-items:center;gap:8px;font-size:var(--r7-t4);line-height:1.3}',
    '.r8-ringe li i{flex:none;width:12px;height:12px;border-radius:50%}',
    '.r8-ringe li b{margin-left:auto;font-variant-numeric:tabular-nums}',
    /* Woche */
    '.r8-woche{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin:8px 0 12px}',
    '.r8-tag{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:.75rem;color:var(--r7-ink2)}',
    '.r8-tag span{display:grid;place-items:center;width:100%;max-width:40px;aspect-ratio:1;border-radius:50%;border:2px solid rgba(255,255,255,.18);font-size:1rem;color:#1a1f3a;font-weight:800}',
    '.r8-tag.da span{background:radial-gradient(circle at 35% 30%,#ffe7a6,var(--r7-gold) 60%,var(--r7-gold-d));border-color:transparent}',
    '.r8-tag.schutz span{background:rgba(160,200,255,.18);border-color:rgba(160,200,255,.6);color:#dce8ff}',
    '.r8-tag.heute span{box-shadow:0 0 0 3px rgba(242,193,78,.35)}',
    '.r8-tag.zukunft span{border-style:dashed;opacity:.5}',
    /* Ziehen */
    '.r8-ziehen{position:fixed;top:0;left:50%;z-index:100040;width:48px;height:48px;margin-left:-24px;border-radius:50%;background:#17255a;border:2px solid var(--r7-gold);box-shadow:var(--r7-schatten);overflow:hidden;transform:translateY(-60px);opacity:0;pointer-events:none}',
    '.r8-ziehen img{width:100%;height:100%;object-fit:cover}',
    '.r8-ziehen.bereit{box-shadow:0 0 0 6px rgba(242,193,78,.25),var(--r7-schatten)}',
    '.r8-ziehen.zurueck{transition:transform .3s var(--r7-ease),opacity .3s}',
    /* Story */
    '.r8-story{position:fixed;inset:0;z-index:100100;display:flex;flex-direction:column;background:#070b1d;color:#fff;font-family:inherit;opacity:0;transition:opacity .25s}',
    '.r8-story.auf{opacity:1}',
    '.r8-story .balken{display:flex;gap:4px;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 0}',
    '.r8-story .balken i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.28);overflow:hidden}',
    '.r8-story .balken i b{display:block;height:100%;width:0;background:#fff}',
    '.r8-story .balken i.ganz b{width:100%}',
    '.r8-story .kopf{display:flex;align-items:center;gap:10px;padding:10px 12px}',
    '.r8-story .kopf img{width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--r7-gold)}',
    '.r8-story .kopf b{flex:1;min-width:0;font-size:.9375rem}',
    '.r8-story .kopf button{min-width:44px;min-height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.12);color:#fff;font-size:20px;cursor:pointer}',
    '.r8-story .flaeche{position:relative;flex:1;min-height:0;margin:0 8px;border-radius:20px;overflow:hidden;background:#17255a}',
    '.r8-story .seite{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:24px 20px 20px;overflow:auto}',
    '.r8-story .seite > img.hg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 20%;z-index:0}',
    '.r8-story .seite::before{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(180deg,rgba(7,11,29,0) 25%,rgba(7,11,29,.75) 60%,rgba(7,11,29,.96))}',
    '.r8-story .seite > *:not(img.hg){position:relative;z-index:1}',
    '.r8-story .seite small{font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--r7-gold)}',
    '.r8-story .seite h2{margin:6px 0 10px;font-size:1.75rem;line-height:1.15}',
    '.r8-story .seite p{margin:0 0 12px;font-size:1.0625rem;line-height:1.5;color:rgba(255,255,255,.92)}',
    '.r8-story .seite .gross{font-size:3.5rem;font-weight:800;line-height:1;color:var(--r7-gold);font-variant-numeric:tabular-nums}',
    '.r8-story .tipp{position:absolute;top:0;bottom:0;width:30%;z-index:2;border:0;background:transparent;cursor:pointer;padding:0}',
    '.r8-story .tipp.l{left:0}.r8-story .tipp.r{right:0}',
    '.r8-story .fuss{display:flex;gap:8px;padding:10px 12px calc(12px + env(safe-area-inset-bottom,0px));flex-wrap:wrap}',
    '.r8-story .fuss .r7-knopf{flex:1 1 120px}',
    '.r8-story .zusatz{padding:0 12px}',
    '@media (min-width:640px){.r8-story .flaeche{width:420px;margin:0 auto;flex:1}.r8-story .fuss,.r8-story .zusatz{width:420px;margin-left:auto;margin-right:auto;box-sizing:border-box}}',
    /* Teilen-Bild */
    '.r8-bild{display:block;width:100%;max-width:360px;margin:0 auto 16px;border-radius:16px;box-shadow:0 12px 32px -12px rgba(0,0,0,.7)}',
    /* Wächst mit dir */
    '.r8-wm{position:relative;display:grid;grid-template-columns:auto 1fr;gap:12px 14px;align-items:center;margin:16px 0;padding:16px;border-radius:20px;background:linear-gradient(160deg,#1b2a63,#0e1838);border:1px solid rgba(242,193,78,.4);box-shadow:var(--r7-schatten);color:#f6efe4;text-align:left}',
    '.r8-wm .fig{position:relative;width:72px;height:72px}',
    '.r8-wm .fig img{width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid var(--r7-gold);background:#17255a}',
    '.r8-wm .fig .st{position:absolute;right:-6px;bottom:-4px;min-width:26px;height:26px;padding:0 6px;border-radius:13px;display:grid;place-items:center;background:var(--r7-gold);color:#1a1f3a;font-weight:800;font-size:.8125rem;box-shadow:0 2px 6px rgba(0,0,0,.4)}',
    '.r8-wm.weg .fig img{filter:grayscale(.6) brightness(.7)}',
    '.r8-wm h2{margin:0;font-size:.75rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--r7-gold)}',
    '.r8-wm .name{display:block;font-size:1.125rem;font-weight:800;line-height:1.25;margin-top:2px}',
    '.r8-wm .bar{height:10px;border-radius:5px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:8px}',
    '.r8-wm .bar i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#c99a3e,#ffe7a6);transition:width .8s var(--r7-ease)}',
    '.r8-wm .zahl{display:block;margin-top:4px;font-size:.8125rem;color:var(--r7-ink2)}',
    '.r8-wm .unten{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
    '.r8-wm .unten .r7-knopf{flex:1 1 auto;min-height:44px;font-size:.875rem;padding:0 16px}',
    '.r8-wm .info{grid-column:1/-1;margin:0;font-size:.875rem;line-height:1.45;color:var(--r7-ink2)}',
    '.r8-album{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px;margin:0 0 16px}',
    '.r8-album button,.r8-album span{display:flex;flex-direction:column;align-items:center;gap:4px;min-height:96px;padding:10px 6px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:var(--r7-ink);font:inherit;font-size:.75rem;line-height:1.25;text-align:center;cursor:pointer}',
    '.r8-album span{opacity:.45;cursor:default}',
    '.r8-album b{font-size:28px;line-height:1.1}',
    '.r8-fund{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;margin:0 0 16px}',
    '.r8-fund .e{font-size:56px;line-height:1}',
    '.r8-fund h3{margin:0!important}',
    /* SOS: 1 Minute ruhig */
    '.r8-sos{position:fixed;inset:0;z-index:100110;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:24px 16px calc(24px + env(safe-area-inset-bottom,0px));background:radial-gradient(circle at 50% 40%,var(--r8-sos1,#1d3b5c),var(--r8-sos2,#081322) 70%);color:#fff;text-align:center;opacity:0;transition:opacity .3s}',
    '.r8-sos.auf{opacity:1}',
    '.r8-sos .zu{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:12px;min-width:48px;min-height:48px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:22px;cursor:pointer}',
    '.r8-sos .kreis{position:relative;width:min(62vw,260px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center}',
    '.r8-sos .kreis img{width:62%;height:62%;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,.85);transform:scale(.82);transition:transform 4s cubic-bezier(.3,.1,.3,1)}',
    '.r8-sos.ein .kreis img{transform:scale(1.08)}',
    '.r8-sos.aus .kreis img{transition-duration:6s}',
    '.r8-sos .kreis svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}',
    '.r8-sos .kreis circle.b{transition:stroke-dashoffset 1s linear}',
    '.r8-sos .wort{font-size:2rem;font-weight:800;line-height:1.2;min-height:2.4em}',
    '.r8-sos .rest{font-size:.9375rem;opacity:.85}',
    '.r8-sos .zusatz{width:100%;max-width:420px}',
    'html.r7-ruhig .r8-sos .kreis img{transform:none!important}',
    '@media (prefers-reduced-motion:reduce){.r8-sos .kreis img{transform:none!important}}',
    /* View Transitions */
    '::view-transition-old(root),::view-transition-new(root){animation-duration:.28s}',
    '::view-transition-group(r8held){animation-duration:.42s;animation-timing-function:cubic-bezier(.22,.8,.26,1)}',
    'html.r7-ruhig::view-transition-group(*),html.r7-ruhig::view-transition-old(*),html.r7-ruhig::view-transition-new(*){animation:none!important}',
    '@media (prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}',
    K.css || ''
  ].join('\n');
  var st = d.createElement('style'); st.id = 'r8-stil'; st.textContent = css; d.head.appendChild(st);

  /* ---------- 1. Blätter mit Raststufen (halb / voll) und Wischen zum Schliessen ---------- */
  function blattZiehen(b) {
    if (b.dataset.r8) return; b.dataset.r8 = '1';
    var griff = b.querySelector('.r7-griff'), kopf = b.querySelector('.r7-kopf');
    var vh = innerHeight;
    // Raststufe «halb», wenn der Inhalt lang ist und das Fenster hoch genug (wie iOS medium detent)
    requestAnimationFrame(function () {
      if (b.scrollHeight > vh * 0.66 && vh > 560 && !b.querySelector('input:not([type=range]):not([type=checkbox]):not([type=radio]),textarea,select')) {
        b.classList.add('r8-halb');
        var h = d.createElement('span'); h.className = 'r8-mehr-hinweis'; h.textContent = 'Nach oben ziehen für mehr'; h.setAttribute('aria-hidden', 'true');
        if (griff) griff.after(h);
      }
    });
    function voll() { if (!b.classList.contains('r8-halb')) return; b.classList.remove('r8-halb'); b.classList.add('r8-voll'); var h = b.querySelector('.r8-mehr-hinweis'); if (h) h.remove(); }
    b.addEventListener('scroll', function () { if (b.scrollTop > 24) voll(); }, { passive: true });
    b.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('input,textarea,select')) voll(); });
    if (griff) griff.addEventListener('click', function () { if (b.classList.contains('r8-halb')) voll(); else { b.classList.remove('r8-voll'); } });
    var y0 = null, t0 = 0, dy = 0, id = null;
    function runter(e) {
      if (e.button > 0) return;
      if (e.target.closest('button,a,input,select,textarea')) return;
      if (!(griff && griff.contains(e.target)) && !(kopf && kopf.contains(e.target))) return;
      y0 = e.clientY; t0 = Date.now(); dy = 0; id = e.pointerId;
      b.classList.add('r8-zieht');
      try { b.setPointerCapture(id); } catch (x) {}
    }
    function zieh(e) {
      if (y0 == null || e.pointerId !== id) return;
      dy = e.clientY - y0;
      b.style.transform = 'translateY(' + Math.max(dy, -40) * (dy < 0 ? 0.4 : 1) + 'px)';
    }
    function los(e) {
      if (y0 == null || (e && e.pointerId !== id)) return;
      var v = dy / Math.max(1, Date.now() - t0);
      y0 = null; b.classList.remove('r8-zieht'); b.style.transform = '';
      if (dy < -30) voll();
      else if (dy > 110 || (dy > 40 && v > 0.6)) { summ(8); R.zu(); }
    }
    b.addEventListener('pointerdown', runter);
    b.addEventListener('pointermove', zieh);
    b.addEventListener('pointerup', los);
    b.addEventListener('pointercancel', los);
  }
  if (window.MutationObserver) new MutationObserver(function (l) {
    l.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1 && n.classList.contains('r7-blatt')) blattZiehen(n); }); });
  }).observe(d.body, { childList: true });

  /* ---------- 2. Rückgängig-Toast ---------- */
  var rueckT, rueckEl;
  function rueck(text, fn, ms) {
    if (!rueckEl) { rueckEl = d.createElement('div'); rueckEl.className = 'r8-rueck'; rueckEl.setAttribute('role', 'status'); rueckEl.setAttribute('aria-live', 'polite'); d.body.appendChild(rueckEl); }
    rueckEl.innerHTML = '<span>' + esc(text) + '</span>' + (fn ? '<button type="button">Rückgängig</button>' : '');
    var b = rueckEl.querySelector('button');
    if (b) b.addEventListener('click', function () { clearTimeout(rueckT); rueckEl.classList.remove('auf'); summ(10); try { fn(); } catch (e) { console.warn(e); } });
    requestAnimationFrame(function () { rueckEl.classList.add('auf'); });
    clearTimeout(rueckT); rueckT = setTimeout(function () { rueckEl.classList.remove('auf'); }, ms || 6000);
  }

  /* ---------- 3. Offline-Hinweis ---------- */
  function offline() {
    var el = d.createElement('div'); el.className = 'r8-offline'; el.setAttribute('role', 'status'); el.hidden = true; d.body.appendChild(el);
    var test = R.param('r8offline') === '1';
    function zeig(an, kurz) {
      if (an) { el.innerHTML = K.offline || 'Offline. Alles auf deinem Handy funktioniert weiter.'; el.hidden = false; }
      else if (kurz) { el.textContent = 'Wieder online ✓'; el.hidden = false; setTimeout(function () { el.hidden = true; }, 2200); }
      else el.hidden = true;
    }
    addEventListener('offline', function () { zeig(true); });
    addEventListener('online', function () { zeig(false, true); });
    if (test || navigator.onLine === false) zeig(true);
  }

  /* ---------- 4. Teilen als Bild (Canvas) ---------- */
  function ladeBild(src) { return new Promise(function (ok) { if (!src) return ok(null); var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src; }); }
  function umbruch(c, text, x, y, breite, zeile, max) {
    var w = String(text).split(/\s+/), z = '', n = 0;
    for (var i = 0; i < w.length; i++) {
      var t = z ? z + ' ' + w[i] : w[i];
      if (c.measureText(t).width > breite && z) { c.fillText(z, x, y); y += zeile; z = w[i]; if (++n >= (max || 99) - 1) { while (i + 1 < w.length && c.measureText(z + ' ' + w[i + 1] + ' …').width < breite) z += ' ' + w[++i]; if (i + 1 < w.length) z += ' …'; break; } }
      else z = t;
    }
    if (z) { c.fillText(z, x, y); y += zeile; }
    return y;
  }
  function bildKarte(o) {
    return ladeBild(o.bild).then(function (img) {
      var W = 1080, Hh = 1350, cv = d.createElement('canvas'); cv.width = W; cv.height = Hh;
      var c = cv.getContext('2d');
      var g = c.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, o.farbe1 || '#22306a'); g.addColorStop(1, o.farbe2 || '#0b1330'); c.fillStyle = g; c.fillRect(0, 0, W, Hh);
      // Sterne
      var s = 11; c.fillStyle = 'rgba(255,255,255,.55)';
      for (var i = 0; i < 46; i++) { s = (s * 9301 + 49297) % 233280; var x = s / 233280 * W; s = (s * 9301 + 49297) % 233280; var y = s / 233280 * 520; c.beginPath(); c.arc(x, y, 1.5 + (i % 3), 0, 7); c.fill(); }
      c.strokeStyle = 'rgba(242,193,78,.75)'; c.lineWidth = 6; c.strokeRect(36, 36, W - 72, Hh - 72);
      var gold = o.gold || '#f2c14e', y0 = 120;
      if (img) {
        c.save(); c.beginPath(); c.arc(W / 2, 290, 170, 0, 7); c.closePath(); c.clip();
        var k = Math.max(340 / img.width, 340 / img.height); c.drawImage(img, W / 2 - img.width * k / 2, 290 - img.height * k / 2 - (o.bildHoch || 0), img.width * k, img.height * k); c.restore();
        c.beginPath(); c.arc(W / 2, 290, 172, 0, 7); c.lineWidth = 8; c.strokeStyle = gold; c.stroke(); y0 = 520;
      }
      c.textAlign = 'center'; c.fillStyle = gold; c.font = '800 34px system-ui,-apple-system,sans-serif';
      if (o.oben) { c.fillText(String(o.oben).toUpperCase(), W / 2, y0); y0 += 70; }
      c.fillStyle = '#fff'; c.font = '800 66px Georgia,serif';
      y0 = umbruch(c, o.titel || '', W / 2, y0 + 10, W - 200, 76, 3) + 10;
      if (o.malen) { y0 = o.malen(c, W, y0) || y0; }
      c.font = '400 40px system-ui,-apple-system,sans-serif'; c.fillStyle = 'rgba(255,255,255,.9)';
      (o.zeilen || []).forEach(function (z) {
        if (Array.isArray(z)) { c.textAlign = 'left'; c.fillStyle = 'rgba(255,255,255,.85)'; c.fillText(z[0], 150, y0 + 40); c.textAlign = 'right'; c.fillStyle = gold; c.font = '800 44px system-ui,sans-serif'; c.fillText(z[1], W - 150, y0 + 40); c.font = '400 40px system-ui,-apple-system,sans-serif'; y0 += 70; }
        else { c.textAlign = 'center'; c.fillStyle = 'rgba(255,255,255,.9)'; y0 = umbruch(c, z, W / 2, y0 + 40, W - 220, 54, 3) + 6; }
      });
      c.textAlign = 'center'; c.fillStyle = 'rgba(255,255,255,.6)'; c.font = '500 30px system-ui,sans-serif';
      c.fillText(o.fuss || 'gemacht auf meinem Handy', W / 2, Hh - 80);
      return cv;
    });
  }
  function teileBild(cv, name, text, titel) {
    var url = cv.toDataURL('image/png');
    var inh = R.blatt({ titel: titel || 'Als Bild teilen', html: '<img class="r8-bild" alt="' + esc(text || 'Bild zum Teilen') + '" src="' + url + '"><p class="r7-klein">Auf dem Handy: Bild lange drücken, dann sichern oder teilen.</p><div class="r7-reihe"><button type="button" class="r7-knopf" data-r8="teilen">Teilen …</button>' + (imRahmen() ? '' : '<a class="r7-knopf leise" data-r8="laden" download="' + esc(name) + '.png" href="' + url + '">Bild sichern</a>') + '</div>' });
    var tb = inh.querySelector('[data-r8=teilen]');
    tb.addEventListener('click', function () {
      if (!cv.toBlob) return;
      cv.toBlob(function (bl) {
        try {
          var f = new File([bl], name + '.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: titel || name, text: text || '' }).catch(function () {}); return; }
        } catch (e) {}
        tb.textContent = 'Teilen geht hier nicht: Bild lange drücken'; tb.disabled = true;
      }, 'image/png');
    });
    return inh;
  }


  /* ---------- 4b. Dateien sicher ausgeben: Download versuchen, im Artefakt/Vorschau immer mit Kopier-Ersatz ---------- */
  function imRahmen() { try { return window.self !== window.top; } catch (e) { return true; } }
  function kopiere(text, knopf) {
    function ok() { if (knopf) { knopf.textContent = 'Kopiert ✓'; setTimeout(function () { knopf.textContent = 'Text kopieren'; }, 2000); } summ(10); }
    function alt() { var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; d.body.appendChild(ta); ta.select(); var g = false; try { g = d.execCommand('copy'); } catch (e) {} ta.remove(); if (g) ok(); else if (knopf) knopf.textContent = 'Bitte Text markieren und kopieren'; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, alt); else alt();
  }
  function datei(inhalt, name, o) {
    o = o || {};
    var blob = inhalt instanceof Blob ? inhalt : new Blob([inhalt], { type: o.typ || 'text/plain;charset=utf-8' });
    var text = o.text != null ? o.text : (typeof inhalt === 'string' ? inhalt : null);
    if (!o.nurText) try { var a = d.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; d.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000); } catch (e) {}
    if (!imRahmen() && !o.immer && !o.nurText) { rueck('«' + name + '» wird gesichert. Schau in deinen Downloads.'); return; }
    var inh = R.blatt({ titel: o.titel || 'Datei sichern', html: '<p>' + (o.nurText ? '' : 'Startet kein Download (zum Beispiel hier in der Vorschau)? Kein Problem: ') + (o.hinweis || 'Kopiere den Inhalt und füge ihn in Notizen, Mail oder Kalender ein.') + '</p>' +
      (text != null ? '<label for="r8DateiT">Inhalt von «' + esc(name) + '»</label><textarea id="r8DateiT" readonly rows="8" style="font:13px/1.4 ui-monospace,Menlo,monospace">' + esc(text) + '</textarea><div class="r7-reihe"><button type="button" class="r7-knopf" data-r8="kopie">Text kopieren</button></div>' : '') +
      (o.mehr || '') });
    var kb = inh.querySelector('[data-r8=kopie]'); if (kb) kb.addEventListener('click', function () { kopiere(text, kb); });
    return inh;
  }

  /* ---------- 5. Langes Drücken → Kontextmenü (auch Rechtsklick, Kontextmenü-Taste) ---------- */
  var menueEl = null;
  function menueZu(zurueck) { if (!menueEl) return; var m = menueEl; menueEl = null; d.removeEventListener('keydown', m._taste, true); d.removeEventListener('pointerdown', m._aussen, true); m.remove(); if (zurueck && m._von) try { m._von.focus({ preventScroll: true }); } catch (e) {} }
  function menueAuf(von, x, y, eintraege, titel) {
    menueZu();
    var m = d.createElement('div'); m.className = 'r8-menue'; m.setAttribute('role', 'menu'); m.setAttribute('aria-label', titel || 'Menü');
    m.innerHTML = (titel ? '<small>' + esc(titel) + '</small>' : '') + eintraege.map(function (e, i) {
      if (e === '-') return '<hr>';
      if (e.href) return '<a role="menuitem" href="' + esc(e.href) + '" data-i="' + i + '"><span class="e" aria-hidden="true">' + e.e + '</span>' + esc(e.text) + '</a>';
      return '<button type="button" role="menuitem" data-i="' + i + '"><span class="e" aria-hidden="true">' + e.e + '</span>' + esc(e.text) + '</button>';
    }).join('');
    d.body.appendChild(m); menueEl = m; m._von = von;
    var r = m.getBoundingClientRect();
    var l = Math.min(Math.max(8, x), innerWidth - r.width - 8), t = Math.min(Math.max(8, y), innerHeight - r.height - 8);
    m.style.left = l + 'px'; m.style.top = t + 'px';
    var punkte = [].slice.call(m.querySelectorAll('[role=menuitem]'));
    m.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-i]'); if (!b) return;
      var e = eintraege[+b.dataset.i];
      if (!e.href) ev.preventDefault();
      menueZu(); if (e.tu) try { e.tu(); } catch (x) { console.warn(x); }
    });
    m._taste = function (ev) {
      var i = punkte.indexOf(d.activeElement);
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); menueZu(true); }
      else if (ev.key === 'ArrowDown') { ev.preventDefault(); punkte[(i + 1) % punkte.length].focus(); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); punkte[(i - 1 + punkte.length) % punkte.length].focus(); }
      else if (ev.key === 'Tab') { menueZu(); }
    };
    m._aussen = function (ev) { if (!m.contains(ev.target)) menueZu(); };
    d.addEventListener('keydown', m._taste, true);
    setTimeout(function () { d.addEventListener('pointerdown', m._aussen, true); }, 0);
    if (punkte[0]) try { punkte[0].focus({ preventScroll: true }); } catch (e) { punkte[0].focus(); }
    summ(14);
  }
  function menue(el, eintraege, titel) {
    if (!el) return;
    el.classList.add('r8-lang');
    var t = null, x0 = 0, y0 = 0, lang = false;
    var liste = typeof eintraege === 'function' ? eintraege : function () { return eintraege; };
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      lang = false; x0 = e.clientX; y0 = e.clientY;
      el.classList.add('r8-gedrueckt');
      t = setTimeout(function () { t = null; lang = true; el.classList.remove('r8-gedrueckt'); menueAuf(el, x0 - 20, y0 + 12, liste(), titel); }, 480);
    });
    function ab() { if (t) { clearTimeout(t); t = null; } el.classList.remove('r8-gedrueckt'); }
    el.addEventListener('pointermove', function (e) { if (t && (Math.abs(e.clientX - x0) > 10 || Math.abs(e.clientY - y0) > 10)) ab(); });
    el.addEventListener('pointerup', ab); el.addEventListener('pointercancel', ab); el.addEventListener('pointerleave', ab);
    el.addEventListener('click', function (e) { if (lang) { e.preventDefault(); e.stopImmediatePropagation(); lang = false; } }, true);
    el.addEventListener('contextmenu', function (e) {
      e.preventDefault(); ab();
      if (menueEl) return;
      var r = el.getBoundingClientRect();
      var x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
      menueAuf(el, x, y, liste(), titel);
    });
    if (!el.getAttribute('aria-haspopup')) el.setAttribute('aria-haspopup', 'menu');
    var tit = el.getAttribute('title'); if (!tit) el.setAttribute('title', 'Lange drücken für mehr');
  }

  /* ---------- 6. Tastaturkürzel ---------- */
  var tastenListe = [];
  function tasten(liste) {
    tastenListe = tastenListe.concat(liste);
  }
  function tastenHilfe() {
    R.blatt({ titel: 'Tastaturkürzel', html: '<p>Für die Arbeit am Computer. In Eingabefeldern sind die Kürzel aus.</p><div class="r8-tasten">' +
      tastenListe.map(function (t) { return '<kbd>' + esc(t[0]) + '</kbd><span>' + esc(t[1]) + '</span>'; }).join('') + '<kbd>?</kbd><span>Diese Hilfe</span><kbd>Esc</kbd><span>Blatt schliessen</span></div>' });
  }
  d.addEventListener('keydown', function (e) {
    if (!tastenListe.length || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    if (H.classList.contains('r7-blatt-offen') || d.querySelector('.r8-story') || menueEl) return;
    if (e.key === '?') { e.preventDefault(); tastenHilfe(); return; }
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    var f = tastenListe.filter(function (x) { return x[0].toLowerCase() === k; })[0];
    if (f) { e.preventDefault(); f[2](); }
  });

  /* ---------- 7. Weicher Wechsel (View Transitions API) ---------- */
  function wechsel(fn) {
    if (d.startViewTransition && !ruhig()) { try { return d.startViewTransition(fn); } catch (e) {} }
    fn(); return null;
  }

  /* ---------- 8. Ringe wie Apple Fitness ---------- */
  function ringe(werte, o) {
    o = o || {};
    var r0 = 56, breit = 13, html = '<svg viewBox="0 0 132 132" role="img" aria-label="' + esc(werte.map(function (w) { return w.name + ' ' + Math.round(Math.min(1, w.wert) * 100) + ' %'; }).join(', ')) + '">';
    werte.forEach(function (w, i) {
      var r = r0 - i * (breit + 3), u = 2 * Math.PI * r, v = Math.max(0, Math.min(1, w.wert));
      html += '<circle cx="66" cy="66" r="' + r + '" fill="none" stroke="' + w.farbe + '" stroke-opacity=".2" stroke-width="' + breit + '"/>' +
        '<circle class="b" cx="66" cy="66" r="' + r + '" fill="none" stroke="' + w.farbe + '" stroke-width="' + breit + '" stroke-linecap="round" transform="rotate(-90 66 66)" stroke-dasharray="' + u.toFixed(1) + '" stroke-dashoffset="' + (o.sofort ? (u * (1 - v)).toFixed(1) : u.toFixed(1)) + '" data-ziel="' + (u * (1 - v)).toFixed(1) + '"/>';
    });
    html += '</svg>';
    return html;
  }
  function ringeLos(wurzel) {
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      [].forEach.call(wurzel.querySelectorAll('svg .b[data-ziel]'), function (c) { c.setAttribute('stroke-dashoffset', c.getAttribute('data-ziel')); });
    }); });
  }
  function ringeMalen(c, mx, my, werte, gross) {
    var r0 = gross || 150, breit = Math.round(r0 * 0.22);
    werte.forEach(function (w, i) {
      var r = r0 - i * (breit + 8), v = Math.max(0, Math.min(1, w.wert));
      c.lineCap = 'round'; c.lineWidth = breit;
      c.strokeStyle = w.farbe; c.globalAlpha = .22; c.beginPath(); c.arc(mx, my, r, 0, Math.PI * 2); c.stroke();
      c.globalAlpha = 1; if (v > 0) { c.beginPath(); c.arc(mx, my, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(v, 0.01)); c.stroke(); }
    });
    c.globalAlpha = 1;
  }

  /* ---------- 9. Wochen-Serie mit Schutztag (ein verpasster Tag pro Woche bricht nichts) ---------- */
  function woche(schluessel) {
    var key = 'serie_' + (schluessel || 'tage');
    function tage() { return hol(key, []); }
    function markiere(tag) { var l = tage(); tag = tag || R.heute(); if (l.indexOf(tag) < 0) { l.push(tag); l = l.slice(-120); leg(key, l); } return l; }
    function montag(t) { var m = new Date(t); m.setHours(12, 0, 0, 0); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m; }
    function stand() {
      var set = {}; tage().forEach(function (t) { set[t] = 1; });
      var schutz = {}, benutzt = {};
      var t = new Date(); t.setHours(12, 0, 0, 0);
      if (!set[ymd(t)]) t.setDate(t.getDate() - 1);
      var serie = 0;
      for (var n = 0; n < 400; n++) {
        var k = ymd(t);
        if (set[k]) serie++;
        else {
          var wk = ymd(montag(t)), vor = new Date(t); vor.setDate(vor.getDate() - 1);
          if (!benutzt[wk] && set[ymd(vor)] && serie > 0) { benutzt[wk] = 1; schutz[k] = 1; }
          else break;
        }
        t.setDate(t.getDate() - 1);
      }
      var mo = montag(new Date()), heute = R.heute(), liste = [];
      for (var i = 0; i < 7; i++) {
        var x = new Date(mo); x.setDate(mo.getDate() + i); var kk = ymd(x);
        liste.push({ tag: kk, name: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][i], da: !!set[kk], schutz: !!schutz[kk], heute: kk === heute, zukunft: kk > heute });
      }
      var frei = !benutzt[ymd(mo)];
      return { serie: serie, tage: liste, schutzFrei: frei, heuteDa: !!set[heute] };
    }
    function html(o) {
      o = o || {}; var s = stand();
      return '<div class="r8-woche" role="list" aria-label="Diese Woche">' + s.tage.map(function (t) {
        var cls = t.da ? 'da' : t.schutz ? 'schutz' : t.zukunft ? 'zukunft' : '';
        var z = t.da ? '✓' : t.schutz ? (o.schutzZeichen || '🪶') : '';
        var lab = t.name + ': ' + (t.da ? (o.da || 'erledigt') : t.schutz ? (o.schutzName || 'Schutztag') : t.zukunft ? 'kommt noch' : 'frei');
        return '<div role="listitem" class="r8-tag ' + cls + (t.heute ? ' heute' : '') + '" aria-label="' + esc(lab) + '"><span aria-hidden="true">' + z + '</span>' + t.name + '</div>';
      }).join('') + '</div>';
    }
    return { markiere: markiere, stand: stand, html: html, tage: tage };
  }

  /* ---------- 10. «Heute»-Karte wie im App Store ---------- */
  function heute(o) {
    var ort = typeof o.ort === 'string' ? d.querySelector(o.ort) : o.ort; if (!ort) return null;
    var b = d.createElement('button'); b.type = 'button'; b.className = 'r8-heute'; b.id = o.id || 'r8Heute';
    b.innerHTML = '<img src="' + esc(o.bild) + '" alt="" loading="lazy" decoding="async"><span class="o"><small>' + esc(o.oben || 'Heute') + '</small><b>' + esc(o.titel) + '</b></span><span class="u"><span>' + esc(o.text) + '</span><i aria-hidden="true">' + esc(o.knopf || 'Öffnen') + '</i></span>';
    b.setAttribute('aria-label', (o.oben || 'Heute') + ': ' + o.titel + '. ' + o.text);
    if (o.wo === 'vor') ort.parentNode.insertBefore(b, ort); else if (o.wo === 'in') ort.insertBefore(b, ort.firstChild); else if (o.wo === 'ende') ort.appendChild(b); else ort.parentNode.insertBefore(b, ort.nextSibling);
    b.addEventListener('click', function () {
      var img = b.querySelector('img');
      img.style.viewTransitionName = 'r8held';
      o.auf(img);
    });
    return b;
  }

  /* ---------- 11. Nach unten ziehen für Neues ---------- */
  function ziehen(fn, bild) {
    if (!('ontouchstart' in window)) return;
    var el = d.createElement('div'); el.className = 'r8-ziehen'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = '<img src="' + esc(bild || K.bild || '') + '" alt="">';
    d.body.appendChild(el);
    H.style.overscrollBehaviorY = 'contain';
    var y0 = null, dy = 0;
    d.addEventListener('touchstart', function (e) {
      if (scrollY > 2 || e.touches.length !== 1 || H.classList.contains('r7-blatt-offen') || d.querySelector('.r8-story')) { y0 = null; return; }
      if (e.target.closest('input,textarea,select,[class*=scroll],.r7-blatt,.r8-menue')) { y0 = null; return; }
      y0 = e.touches[0].clientY; dy = 0; el.classList.remove('zurueck');
    }, { passive: true });
    d.addEventListener('touchmove', function (e) {
      if (y0 == null) return;
      dy = (e.touches[0].clientY - y0) * 0.5;
      if (dy <= 0) { el.style.opacity = 0; return; }
      var w = Math.min(dy, 96);
      el.style.opacity = Math.min(1, w / 50); el.style.transform = 'translateY(' + (w - 50) + 'px) rotate(' + (w * 3) + 'deg)';
      el.classList.toggle('bereit', w > 70);
    }, { passive: true });
    d.addEventListener('touchend', function () {
      if (y0 == null) return; y0 = null;
      var los = dy > 70; dy = 0;
      el.classList.add('zurueck'); el.style.transform = 'translateY(-60px)'; el.style.opacity = 0; el.classList.remove('bereit');
      if (los) { summ(12); try { fn(); } catch (x) { console.warn(x); } }
    }, { passive: true });
  }

  /* ---------- 12. Story-Blätter (antippen rechts = weiter, links = zurück, halten = Pause, nach unten wischen = zu) ---------- */
  var storyAuf = null;
  function story(seiten, o) {
    o = o || {};
    if (storyAuf) storyAuf.zu();
    var vorher = d.activeElement, i = 0, timer = null, start = 0, rest = 0, pause = false;
    var s = d.createElement('div'); s.className = 'r8-story'; s.setAttribute('role', 'dialog'); s.setAttribute('aria-modal', 'true'); s.setAttribute('aria-label', o.titel || 'Geschichte');
    s.innerHTML = '<div class="balken" aria-hidden="true">' + seiten.map(function () { return '<i><b></b></i>'; }).join('') + '</div>' +
      '<div class="kopf"><img src="' + esc(o.bild || K.bild) + '" alt="" width="36" height="36"><b>' + esc(o.titel || '') + '</b><button type="button" class="zu" aria-label="Schliessen">✕</button></div>' +
      '<div class="flaeche"><div class="seite" aria-live="polite"></div><button type="button" class="tipp l" aria-label="Zurück" tabindex="-1"></button><button type="button" class="tipp r" aria-label="Weiter" tabindex="-1"></button></div>' +
      (o.zusatz ? '<div class="zusatz">' + o.zusatz + '</div>' : '') +
      '<div class="fuss"><button type="button" class="r7-knopf leise" data-r8s="zurueck">‹ Zurück</button><button type="button" class="r7-knopf" data-r8s="weiter">Weiter ›</button></div>';
    d.body.appendChild(s); H.classList.add('r7-blatt-offen');
    var altOv = d.body.style.overflow; d.body.style.overflow = 'hidden';
    var seite = s.querySelector('.seite'), balken = s.querySelectorAll('.balken i');
    var dauer = o.auto && !ruhig() ? o.auto : 0;
    function zeig(n, mitWechsel) {
      i = Math.max(0, Math.min(seiten.length - 1, n));
      var f = function () {
        var p = seiten[i];
        seite.innerHTML = (p.bild ? '<img class="hg" src="' + esc(p.bild) + '" alt=""' + (i === 0 && o.held ? ' style="view-transition-name:r8held"' : '') + '>' : '') +
          (p.oben ? '<small>' + esc(p.oben) + '</small>' : '') + (p.gross != null ? '<div class="gross">' + esc(p.gross) + '</div>' : '') +
          (p.titel ? '<h2>' + esc(p.titel) + '</h2>' : '') + (p.text ? '<p>' + esc(p.text) + '</p>' : '') + (p.html || '');
        seite.style.background = p.farbe || '';
        [].forEach.call(balken, function (b, k) { b.classList.toggle('ganz', k < i); var bb = b.querySelector('b'); bb.style.transition = 'none'; bb.style.width = k < i ? '100%' : '0'; });
        var w = s.querySelector('[data-r8s=weiter]'); w.textContent = i === seiten.length - 1 ? (o.ende || 'Fertig') : 'Weiter ›';
        s.querySelector('[data-r8s=zurueck]').disabled = i === 0;
        if (p.auf) try { p.auf(seite); } catch (e) { console.warn(e); }
        lauf(dauer);
      };
      if (mitWechsel) wechsel(f); else f();
    }
    function lauf(ms) {
      clearTimeout(timer); if (!dauer) return;
      rest = ms; start = Date.now();
      var bb = balken[i].querySelector('b');
      bb.style.transition = 'none'; bb.style.width = (100 * (1 - rest / dauer)) + '%';
      requestAnimationFrame(function () { requestAnimationFrame(function () { bb.style.transition = 'width ' + rest + 'ms linear'; bb.style.width = '100%'; }); });
      timer = setTimeout(function () { if (i < seiten.length - 1) zeig(i + 1); }, rest);
    }
    function halt() { if (!dauer || pause) return; pause = true; clearTimeout(timer); rest = Math.max(0, rest - (Date.now() - start)); var bb = balken[i].querySelector('b'); var w = getComputedStyle(bb).width; bb.style.transition = 'none'; bb.style.width = w; }
    function weiter() { if (pause) { pause = false; lauf(rest); } }
    function zu() {
      clearTimeout(timer); d.removeEventListener('keydown', taste, true);
      H.classList.remove('r7-blatt-offen'); d.body.style.overflow = altOv || '';
      s.classList.remove('auf'); setTimeout(function () { s.remove(); }, ruhig() ? 0 : 250); storyAuf = null;
      if (vorher && vorher.focus) try { vorher.focus({ preventScroll: true }); } catch (e) {}
      if (o.zu) try { o.zu(); } catch (e) {}
    }
    function taste(e) {
      if (e.key === 'Escape') { e.preventDefault(); zu(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); if (i < seiten.length - 1) zeig(i + 1, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); zeig(i - 1, true); }
      else if (e.key === 'Tab') {
        var f = [].filter.call(s.querySelectorAll('button:not([tabindex="-1"]),a[href],input,select,textarea'), function (x) { return !x.disabled && x.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    d.addEventListener('keydown', taste, true);
    s.querySelector('.zu').addEventListener('click', zu);
    s.querySelector('.tipp.l').addEventListener('click', function () { zeig(i - 1, true); });
    s.querySelector('.tipp.r').addEventListener('click', function () { if (i < seiten.length - 1) zeig(i + 1, true); });
    s.querySelector('[data-r8s=zurueck]').addEventListener('click', function () { zeig(i - 1, true); });
    s.querySelector('[data-r8s=weiter]').addEventListener('click', function () { if (i < seiten.length - 1) zeig(i + 1, true); else zu(); });
    // halten = Pause, nach unten wischen = schliessen
    var fl = s.querySelector('.flaeche'), y0 = null, x0 = 0;
    fl.addEventListener('pointerdown', function (e) { y0 = e.clientY; x0 = e.clientX; halt(); });
    fl.addEventListener('pointerup', function (e) { var dy = y0 == null ? 0 : e.clientY - y0, dx = e.clientX - x0; y0 = null; weiter(); if (dy > 90 && Math.abs(dx) < 60) zu(); });
    fl.addEventListener('pointercancel', function () { y0 = null; weiter(); });
    zeig(o.start || 0);
    requestAnimationFrame(function () { s.classList.add('auf'); });
    setTimeout(function () { try { s.querySelector('[data-r8s=weiter]').focus({ preventScroll: true }); } catch (e) {} }, 60);
    storyAuf = { zu: zu, zeig: zeig, el: s };
    return storyAuf;
  }


  /* ---------- 14. «Wächst mit dir» (Finch): Lichter sammeln, 5 Stufen, täglicher Ausflug mit Fundstück ---------- */
  var WM = null;
  function waechst(o) {
    var ort = typeof o.ort === 'string' ? d.querySelector(o.ort) : o.ort; if (!ort) return null;
    var SCHW = o.schwellen || [0, 5, 15, 35, 70], ST = o.stufen, W = woche('waechst'), MAX_TAG = o.maxTag || 12;
    var AUS_MS = o.ausflugMs != null ? o.ausflugMs : (R.param('r8schnell') === '1' ? 3000 : 120000);
    function z() { var x = hol('wm', null) || {}; x.n = x.n || 0; x.tag = x.tag || {}; x.album = x.album || []; return x; }
    function stufe(n) { var s = 0; for (var i = 0; i < SCHW.length; i++) if (n >= SCHW[i]) s = i; return s; }
    var box = d.createElement('section'); box.className = 'r8-wm'; box.id = 'r8Waechst'; box.setAttribute('aria-labelledby', 'r8WmH');
    if (o.wo === 'vor') ort.parentNode.insertBefore(box, ort); else if (o.wo === 'in') ort.insertBefore(box, ort.firstChild); else ort.parentNode.insertBefore(box, ort.nextSibling);
    function heuteN(x) { return x.tag[R.heute()] || 0; }
    function zeig() {
      var x = z(), s = stufe(x.n), naechste = SCHW[s + 1], vor = SCHW[s];
      var proz = naechste == null ? 100 : Math.round((x.n - vor) / (naechste - vor) * 100);
      var heute = R.heute(), weg = x.aus && x.aus.tag === heute && !x.aus.zurueck, bereit = weg && Date.now() >= x.aus.bis;
      var schonHeute = x.aus && x.aus.tag === heute;
      var ws = W.stand();
      box.classList.toggle('weg', weg && !bereit);
      var knopf, info;
      if (bereit) { knopf = '<button type="button" class="r7-knopf" data-wm="zurueck">' + esc(o.figur) + ' ist zurück: Fundstück ansehen</button>'; info = esc(o.figur) + ' ist zurück und hat etwas mitgebracht.'; }
      else if (weg) { var min = Math.max(1, Math.ceil((x.aus.bis - Date.now()) / 60000)); knopf = ''; info = '🎒 ' + esc(o.figur) + ' ist auf einem kleinen Ausflug und kommt in etwa ' + min + ' Minute' + (min === 1 ? '' : 'n') + ' zurück.'; }
      else if (schonHeute) { knopf = ''; info = 'Heute war ' + esc(o.figur) + ' schon unterwegs. Morgen geht es wieder los.'; }
      else if (heuteN(x) > 0) { knopf = '<button type="button" class="r7-knopf" data-wm="los">🎒 Auf Ausflug schicken</button>'; info = 'Du hast heute schon ' + heuteN(x) + ' ' + esc(heuteN(x) === 1 ? o.licht1 : o.licht) + ' gesammelt. ' + esc(o.figur) + ' möchte etwas entdecken.'; }
      else { knopf = ''; info = esc(o.wie) + ' Dann geht ' + esc(o.figur) + ' auf einen kleinen Ausflug.'; }
      box.innerHTML = '<div class="fig"><img src="' + esc(o.bild) + '" alt="" width="72" height="72"><span class="st" aria-hidden="true">' + (s + 1) + '</span></div>' +
        '<div><h2 id="r8WmH">Wächst mit dir</h2><span class="name">' + esc(o.figur) + ' · ' + esc(ST[s]) + '</span>' +
        '<div class="bar" role="progressbar" aria-label="Fortschritt zur nächsten Stufe" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + proz + '"><i style="width:' + proz + '%"></i></div>' +
        '<span class="zahl">' + x.n + ' ' + esc(x.n === 1 ? o.licht1 : o.licht) + (naechste == null ? ' · höchste Stufe erreicht' : ' · noch ' + (naechste - x.n) + ' bis «' + esc(ST[s + 1]) + '»') + ' · 🔥 ' + ws.serie + ' Tag' + (ws.serie === 1 ? '' : 'e') + '</span></div>' +
        '<p class="info" aria-live="polite">' + info + '</p>' +
        '<div class="unten">' + knopf + '<button type="button" class="r7-knopf leise" data-wm="album">📔 Album ' + x.album.length + '/' + o.ausfluege.length + '</button><button type="button" class="r7-knopf leise" data-wm="wie">So wächst ' + esc(o.figur) + '</button></div>';
    }
    function licht(grund) {
      var x = z(), h = R.heute();
      if (heuteN(x) >= MAX_TAG) return false;
      var vorS = stufe(x.n);
      x.n++; x.tag[h] = heuteN(x) + 1;
      var k = Object.keys(x.tag).sort(); while (k.length > 30) delete x.tag[k.shift()];
      leg('wm', x); W.markiere(h);
      var s = stufe(x.n);
      zeig();
      if (s > vorS) setTimeout(function () { feierOrig(esc(o.figur) + ' wächst: jetzt «' + ST[s] + '»! Danke, dass du dir Zeit nimmst.'); }, 700);
      return true;
    }
    function los() {
      var x = z(), h = R.heute();
      var frei = o.ausfluege.map(function (a, i) { return i; }).filter(function (i) { return x.album.indexOf(i) < 0; });
      if (!frei.length) frei = o.ausfluege.map(function (a, i) { return i; });
      var w = frei[Math.floor(Math.random() * frei.length)];
      x.aus = { tag: h, bis: Date.now() + AUS_MS, w: w, zurueck: false }; leg('wm', x); summ(10); zeig();
      setTimeout(zeig, AUS_MS + 200);
    }
    function vorlesen(t) { try { if (!window.speechSynthesis) return false; speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'de-CH'; u.rate = .95; speechSynthesis.speak(u); return true; } catch (e) { return false; } }
    function fund(i, neu) {
      var a = o.ausfluege[i]; if (!a) return;
      var inh = R.blatt({ titel: neu ? esc(o.figur) + ' war unterwegs' : a.n, bild: o.bild, html: (o.extraHtml || '') + '<div class="r8-fund"><span class="e" aria-hidden="true">' + a.f + '</span><h3>' + esc(a.n) + '</h3></div><p>' + esc(a.t) + '</p>' +
        '<div class="r7-reihe"><button type="button" class="r7-knopf leise" data-wm="hoer">🔊 Vorlesen</button>' + (neu ? '<button type="button" class="r7-knopf" data-wm="ok">Ins Album legen</button>' : '') + '</div>' });
      inh.querySelector('[data-wm=hoer]').addEventListener('click', function () { if (!vorlesen(a.n + '. ' + a.t)) this.textContent = 'Vorlesen geht hier nicht'; });
      var ok = inh.querySelector('[data-wm=ok]'); if (ok) ok.addEventListener('click', function () { R.zu(); });
    }
    function album() {
      var x = z();
      var inh = R.blatt({ titel: 'Album: ' + o.figur + 's Fundstücke', bild: o.bild, html: (o.extraHtml || '') + '<p>' + x.album.length + ' von ' + o.ausfluege.length + ' Fundstücken. Jeden Tag ein Ausflug, nach dem ersten kleinen Schritt.</p><div class="r8-album">' +
        o.ausfluege.map(function (a, i) { return x.album.indexOf(i) >= 0 ? '<button type="button" data-i="' + i + '"><b aria-hidden="true">' + a.f + '</b>' + esc(a.n) + '</button>' : '<span aria-label="Noch nicht gefunden"><b aria-hidden="true">?</b>noch offen</span>'; }).join('') + '</div>' });
      inh.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) { R.zu(true); fund(+b.dataset.i, false); } });
    }
    function wie() {
      R.blatt({ titel: 'So wächst ' + o.figur, bild: o.bild, html: (o.extraHtml || '') + '<p>' + esc(o.wie) + ' Jeder kleine Schritt gibt 1 ' + esc(o.licht1) + ' (höchstens ' + MAX_TAG + ' pro Tag).</p><div class="r8-tasten">' +
        ST.map(function (n, i) { return '<kbd>' + SCHW[i] + '</kbd><span>Stufe ' + (i + 1) + ': ' + esc(n) + '</span>'; }).join('') + '</div>' +
        '<p>Nichts geht verloren, nichts geht kaputt. Ein Ruhetag pro Woche zählt bei der Serie mit (🌙).</p>' + W.html({ schutzName: 'Ruhetag', schutzZeichen: '🌙', da: 'mindestens ein ' + o.licht1 }) +
        '<p class="r7-klein">Alles bleibt auf diesem Gerät.</p>' });
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-wm]'); if (!b) return;
      var a = b.dataset.wm;
      if (a === 'los') los();
      else if (a === 'zurueck') { var x = z(); if (!x.aus) return; x.aus.zurueck = true; if (x.album.indexOf(x.aus.w) < 0) x.album.push(x.aus.w); leg('wm', x); zeig(); fund(x.aus.w, true); }
      else if (a === 'album') album();
      else if (a === 'wie') wie();
    });
    // Jeder sanfte Erfolg (R7-Feier) zählt als kleiner Schritt
    var feierOrig = R.feier;
    R.feier = function (t, f) { var r = feierOrig.apply(this, arguments); licht('feier'); return r; };
    zeig();
    setInterval(function () { var x = z(); if (x.aus && !x.aus.zurueck) zeig(); }, 30000);
    WM = { licht: licht, zeig: zeig, album: album, el: box };
    return WM;
  }


  /* ---------- 15. SOS: sofort 1 Minute ruhig werden, ohne Menü (Headspace SOS) ---------- */
  function sos(o) {
    o = o || {};
    if (d.querySelector('.r8-sos')) return;
    var vorher = d.activeElement, dauer = 60, t = 0, timer = null, ein = true;
    var s = d.createElement('div'); s.className = 'r8-sos'; s.setAttribute('role', 'dialog'); s.setAttribute('aria-modal', 'true'); s.setAttribute('aria-label', '1 Minute ruhig werden');
    var u = 2 * Math.PI * 48;
    s.innerHTML = '<button type="button" class="zu" aria-label="Beenden">✕</button>' +
      '<div class="kreis"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2.5"/><circle class="b" cx="50" cy="50" r="48" fill="none" stroke="' + esc(o.farbe || '#ffffff') + '" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="' + u.toFixed(1) + '" stroke-dashoffset="' + u.toFixed(1) + '"/></svg><img src="' + esc(o.bild || K.bild) + '" alt=""></div>' +
      '<div class="wort" aria-live="assertive">Einatmen …</div><div class="rest">Noch 60 Sekunden. Atme mit ' + esc(o.figur || '') + '.</div>' + (o.zusatz ? '<div class="zusatz">' + o.zusatz + '</div>' : '');
    d.body.appendChild(s); H.classList.add('r7-blatt-offen'); var ov = d.body.style.overflow; d.body.style.overflow = 'hidden';
    var wort = s.querySelector('.wort'), rest = s.querySelector('.rest'), b = s.querySelector('circle.b');
    function zu() { clearInterval(timer); d.removeEventListener('keydown', taste, true); H.classList.remove('r7-blatt-offen'); d.body.style.overflow = ov || ''; s.remove(); if (vorher && vorher.focus) try { vorher.focus({ preventScroll: true }); } catch (e) {} }
    function taste(e) { if (e.key === 'Escape') { e.preventDefault(); zu(); } else if (e.key === 'Tab') { var f = [].slice.call(s.querySelectorAll('button,a[href]')); if (!f.length) return; if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } } }
    d.addEventListener('keydown', taste, true);
    s.querySelector('.zu').addEventListener('click', zu);
    function phase() { var p = t % 10; if (p === 0) { ein = true; s.classList.add('ein'); s.classList.remove('aus'); wort.textContent = 'Einatmen …'; } else if (p === 4) { ein = false; s.classList.remove('ein'); s.classList.add('aus'); wort.textContent = 'Ausatmen …'; } }
    requestAnimationFrame(function () { s.classList.add('auf'); phase(); });
    timer = setInterval(function () {
      t++; b.setAttribute('stroke-dashoffset', (u * (1 - t / dauer)).toFixed(1));
      if (t >= dauer) { clearInterval(timer); s.classList.remove('ein', 'aus'); wort.textContent = o.ende || 'Gut gemacht. Du bist hier.'; rest.textContent = 'Eine Minute nur für dich.'; summ([10, 40, 10]); if (window.R8K && R8K.licht) R8K.licht('sos'); return; }
      phase(); rest.textContent = 'Noch ' + (dauer - t) + ' Sekunden.';
    }, 1000);
    setTimeout(function () { try { s.querySelector('.zu').focus({ preventScroll: true }); } catch (e) {} }, 60);
  }


  /* ---------- 16. «Dein Monat mit …» als wischbare Story-Karten, am Schluss als Bild teilen (Spotify Wrapped) ---------- */
  function monatsName() { return new Date().toLocaleDateString('de-CH', { month: 'long' }); }
  function wmStand() { var x = hol('wm', null) || {}; return { n: x.n || 0, album: (x.album || []).length }; }
  function monat(o) {
    var m = monatsName(), M = m.charAt(0).toUpperCase() + m.slice(1);
    var seiten = [{ bild: o.bild, oben: 'Dein ' + M, titel: 'Dein ' + M + ' mit ' + o.figur, text: o.intro || 'Wisch dich durch. Alle Zahlen bleiben auf deinem Gerät.' }].concat(o.seiten);
    var wm = wmStand();
    if (o.licht) seiten.push({ bild: o.bildFroh || o.bild, oben: 'Wächst mit dir', gross: wm.n, titel: o.licht + ' gesammelt', text: wm.album ? wm.album + ' Fundstücke liegen im Album.' : 'Das erste Fundstück wartet auf den ersten Ausflug.' });
    seiten.push({ bild: o.bildFroh || o.bild, oben: 'Zum Schluss', titel: o.schluss || 'Schön, dass du dran bleibst.', text: o.hinweis || 'Teil den Monat als Bild, wenn du magst.',
      html: '<button type="button" class="r7-knopf" data-r8m="bild">🖼️ Als Bild teilen</button>',
      auf: function (el) { el.querySelector('[data-r8m=bild]').addEventListener('click', function () {
        var z = (o.zeilen || []).concat(o.licht ? [[o.licht, String(wm.n)]] : []);
        bildKarte({ bild: o.bild, oben: 'Mein ' + M, titel: 'Mein ' + M + ' mit ' + o.figur, zeilen: z, fuss: o.fuss }).then(function (cv) { if (storyAuf) storyAuf.zu(); setTimeout(function () { teileBild(cv, 'monat-' + m, 'Mein ' + M + ' mit ' + o.figur, 'Dein Monat als Bild'); }, 280); });
      }); } });
    return story(seiten, { titel: 'Dein ' + M + ' mit ' + o.figur, bild: o.bild, auto: o.auto || 0, zusatz: o.zusatz, ende: 'Fertig' });
  }

  /* ---------- 13. Neu-Leiste ergänzen ---------- */
  function neuDazu() {
    if (!K.neu || !K.neu.length) return;
    var g = d.querySelector('#r7Neu .r7-neu-gitter'); if (!g) return;
    var gesehen = hol('gesehen', {});
    K.neu.slice().reverse().forEach(function (f) {
      var b = d.createElement('button'); b.type = 'button'; b.className = 'r7-neu-k r8-neu-k'; b.dataset.r8f = f.id;
      b.innerHTML = (gesehen[f.id] ? '' : '<span class="r7-punkt" aria-hidden="true"></span>') + '<span class="e" aria-hidden="true">' + f.e + '</span><b>' + esc(f.titel) + '</b><small>' + esc(f.text) + '</small>' + (gesehen[f.id] ? '' : '<span class="r7-nur-sr">, neu</span>');
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        gesehen[f.id] = 1; leg('gesehen', gesehen);
        var p = b.querySelector('.r7-punkt'); if (p) p.remove(); var sr = b.querySelector('.r7-nur-sr'); if (sr) sr.remove();
        f.auf();
      });
      g.insertBefore(b, g.firstChild);
    });
    var k = d.querySelector('#r7Neu .r7-neu-kopf small'); if (k && K.neuText) k.textContent = K.neuText;
  }

  window.R8K = { monat: monat, monatsName: monatsName, sos: sos, waechst: waechst, licht: function (g) { return WM ? WM.licht(g) : false; }, datei: datei, kopiere: kopiere, imRahmen: imRahmen, hol: hol, leg: leg, summ: summ, rueck: rueck, bildKarte: bildKarte, teileBild: teileBild, menue: menue, menueAuf: menueAuf, tasten: tasten, tastenHilfe: tastenHilfe,
    wechsel: wechsel, ringe: ringe, ringeLos: ringeLos, ringeMalen: ringeMalen, woche: woche, heute: heute, ziehen: ziehen, story: story, ymd: ymd, umbruch: umbruch };
  function start() {
    try { offline(); } catch (e) { console.warn('r8 offline', e); }
    if (K.start) try { K.start(window.R8K, R); } catch (e) { console.warn('r8 start', e); }
    try { neuDazu(); } catch (e) { console.warn('r8 neu', e); }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();
})();
