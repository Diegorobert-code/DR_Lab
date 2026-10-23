/* Runde 8 (22.10.2026): Polieren, interaktiv, Ideen aus Top-Apps.
   - «Heute»-Karte wie im App Store: grosses Bild, Datum, Titel; öffnet sich weich (View Transitions API) zur ganzen Geschichte
   - Die Figur war unterwegs und bringt eine Geschichte mit (Vorbild Finch), mit «🎧 Nur hören» und Fantasie-Frage
   - Serien-Schutz wie bei Duolingo: ein verpasster Tag bricht nichts (Schutzfeder), Ruhetag planbar, ohne Druck
   - Wochen-Rückblick als Story (Vorbild Spotify Wrapped / Instagram Stories): Tippen, Halten, nach unten Wischen
   - Teilen als Bild (Canvas), Rückgängig-Toast, Offline-Hinweis, Tastaturkürzel, «prefers-reduced-motion»
   - Figur reagiert auf Streicheln (Wischen über die Figur) und lange Drücken (Kontextmenü wie iOS)
   Alles bleibt nur auf diesem Gerät. */
(function () {
  'use strict';
  var C = {
    k: 'fiasnest', figur: 'Fia', app: 'Fias Nest', bild: 'maskottchen.jpg', maskottchen: { bild: 'maskottchen.jpg', ziele: '#cover' }, kind: false, haptik: true,
    heute: {
      titel: 'Fia war unterwegs und erzählt',
      geschichten: [
        { titel: 'Morgenlicht am Meer', bild: 'heute/heute-1.jpg', pos: '50% 50%', alt: 'Fia im Nest, über dem Meer geht die Sonne auf', kurz: 'Fia hat dem Morgen beim Aufwachen zugeschaut.',
          text: ['Ganz früh habe ich vom Nest aus aufs Meer geschaut. Der Himmel war erst grau, dann rosa, dann golden.', 'Das Licht hat mich geweckt, besser als jeder Wecker. Am Morgen ins Licht schauen hilft dem Körper, wach zu werden, und am Abend leichter müde.', 'Morgen früh schau ich wieder. Kommst du mit, wenigstens bis zum Fenster?'],
          frage: 'Wo bekommst du morgen früh ein paar Minuten Tageslicht?' },
        { titel: 'Die warme Tasse', bild: 'heute/heute-2.jpg', pos: '50% 50%', alt: 'Fia hält eine warm leuchtende Tasse', kurz: 'Fia hat einer Tasse beim Abkühlen zugeschaut.',
          text: ['Heute Abend habe ich eine Tasse warmen Kräutertee in meinen Flügeln gehalten. Sie hat geleuchtet wie eine kleine Glut.', 'Ich habe nichts gemacht, nur gehalten und gespürt, wie sie langsam weniger heiss wird. Ganz ohne Eile.', 'So möchte ich auch in die Nacht gehen. Nicht ausgehen, sondern ausglühen.'],
          frage: 'Was hilft dir, am Abend langsam leiser zu werden?' },
        { titel: 'Am Fenster', bild: 'heute/heute-3.jpg', pos: '50% 50%', alt: 'Fia sitzt am Fenster und schaut auf das Städtchen', kurz: 'Fia hat einfach hinausgeschaut.',
          text: ['Heute habe ich mich ans Fenster gesetzt. Unten im Städtchen gingen die Lichter an, eines nach dem anderen.', 'Ich habe nichts getan, nur geschaut. Ein Licht ging aus, ein anderes an.', 'Das habe ich mir gemerkt. Manchmal ist das der schönste Teil des Abends.'],
          frage: 'Wo könntest du heute fünf Minuten einfach hinausschauen?' },
        { titel: 'Sterne über den Dächern', bild: 'heute/heute-4.jpg', pos: '50% 50%', alt: 'Fia steht auf einem Dach unter Sternen', kurz: 'Fia hat auf dem Dach den Sternen zugeschaut.',
          text: ['Heute war ich auf dem Dach über dem Platz. Über mir kamen die Sterne, einer nach dem anderen.', 'Gedanken sind manchmal wie Wolken vor den Sternen. Sie kommen, bleiben eine Weile und ziehen weiter.', 'Man muss sie nicht festhalten. Die Sterne bleiben trotzdem da.'],
          frage: 'Welcher Gedanke darf heute weiterziehen?' },
        { titel: 'Grannys Decke', bild: 'heute/heute-5.jpg', pos: '50% 50%', alt: 'Fia im Nest unter einer blauen Decke', kurz: 'Granny hat Fia eine Decke gestrickt.',
          text: ['Granny strickt jeden Abend genau zwei Reihen, nicht mehr. «Damit ich mich morgen wieder darauf freue», sagt sie.', 'Heute war die Decke fertig, und sie hat sie mir geschenkt. Jetzt liegt sie in meinem Nest.', 'Ein gutes Bett braucht Zeit. Und ein bisschen Liebe.'],
          frage: 'Was macht dein Bett heute Abend ein bisschen gemütlicher?' },
        { titel: 'Das Lied der Nacht', bild: 'heute/heute-6.jpg', pos: '50% 50%', alt: 'Fia hat die Augen zu und hört', kurz: 'Fia hat der Nacht zugehört.',
          text: ['Heute habe ich die Augen zugemacht und nur zugehört. Ein Brunnen hat geplätschert. Weit weg hat ein Hund gebellt, dann war es still.', 'Wenn man genau hinhört, hat die Nacht viele leise Töne.', 'Ich habe gezählt: sieben verschiedene Geräusche. Beim achten bin ich eingenickt.'],
          frage: 'Welche leisen Töne hörst du gerade, wenn du kurz die Augen schliesst?' },
        { titel: 'Der Mond hält Wache', bild: 'heute/heute-7.jpg', pos: '50% 50%', alt: 'Fia schläft, über dem Städtchen steht der Vollmond', kurz: 'Fia ist unter dem Vollmond eingeschlafen.',
          text: ['Heute stand der Vollmond ganz rund über dem Städtchen. Er sah aus, als würde er lächeln.', 'Ich habe mir gedacht: Der Mond hält jetzt Wache. Ich muss heute nichts mehr tun.', 'Dann habe ich die Augen zugemacht. Gute Nacht, Mond. Gute Nacht, du.'],
          frage: 'Was darfst du heute Abend dem Mond überlassen?' }
      ]
    },
    woche: {
      kette: '#chain', wort: 'Tage', wort1: 'Tag', leer: 'Jeder Tag mit Fia wird ein Glutpunkt. Ein verpasster Tag bricht nichts: die Schutzfeder hält.',
      zeileOrt: function (ch, z) { var s = document.getElementById('chainSay'); (s || ch).after(z); }
    },
    streicheln: {
      ziel: '#cover', wackel: '#cover', emo: '🔥',
      blase: function (t) { var h = document.getElementById('hello'); if (h) h.textContent = t; },
      saetze: ['Oh, meine Federn werden ganz warm.', 'Mmh. So ruhig ist es gerade.', 'Danke. Ich glühe ein bisschen heller.', 'Das tut gut. Atmest du mit mir aus?', 'Hihi, das kitzelt an den Flügeln.']
    },
    menue: {
      ziel: '#cover',
      punkte: function (H) {
        return [
          ['📮', 'Was Fia erlebt hat', function () { H.lesenHeute(); }],
          ['📊', 'Meine Woche mit Fia', function () { H.wocheStory(); }],
          ['🌙', 'Morgen Ruhetag', function () { var b = document.querySelector('.r8-kettezeile .r8-btn'); if (b) b.click(); }]
        ];
      }
    },
    kuerzel: {
      h: ['Heute-Geschichte lesen', function () { window.R8.lesenHeute(); }],
      w: ['Meine Woche mit Fia', function () { window.R8.wocheStory(); }]
    },
    funktionen: [
      {
        id: 'rueckblick', emo: '📊', titel: 'Meine Woche mit Fia',
        bau: function (H) {
          H.wocheStory = function () {
            var T = {}; try { T = (typeof S === 'object' && S && S.tage) || {}; } catch (e) {}
            var z = { ritual: 0, morgen: 0, bett: 0, sorgen: 0 }, tage = 0;
            for (var i = 0; i < 7; i++) {
              var d = H.tagVor(i), k1 = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), k2 = H.datum(d);
              var t = T[k1] || T[k2] || null; if (!t) continue;
              var an = false; Object.keys(z).forEach(function (k) { if (t[k]) { z[k]++; an = true; } }); if (an) tage++;
            }
            var r = H.reihe();
            H.story([
              { bild: 'posen/winkt.jpg', titel: 'Deine Woche mit Fia', text: 'Ein ruhiger Blick zurück. Kein Zeugnis, nur ein Erinnern.' },
              { bild: 'posen/fliegt.jpg', zahl: tage, titel: tage === 1 ? 'Tag mit Fia' : 'Tage mit Fia', text: 'Jeder Tag hat einen Glutpunkt bekommen.' },
              { bild: 'posen/wach.jpg', zahl: z.morgen, titel: 'Phönix-Morgen', text: 'Morgens ins Licht: Das stellt die innere Uhr.' },
              { bild: 'posen/notiz.jpg', zahl: z.sorgen, titel: 'Mal Sorgen ins Nest gelegt', text: 'Was aufgeschrieben ist, muss nicht mehr im Kopf kreisen.' },
              { bild: 'posen/schlaeft.jpg', zahl: z.ritual + z.bett, titel: 'Abende mit Ritual', text: r.serie ? r.serie + (r.serie === 1 ? ' Tag' : ' Tage') + ' in Folge. Die Schutzfeder hält, wenn einmal einer fehlt.' : 'Ein kleines Ritual reicht. Drei Atemzüge zählen schon.' },
              { bild: 'posen/liegt.jpg', titel: 'Gute Nacht.', text: 'Du musst heute nichts mehr lösen. Fia ist da.' }
            ], 'Deine Woche mit Fia');
          };
          var n = H.karte('rueckblick', '📊 Deine Woche mit Fia',
            '<p>Ein ruhiger Rückblick als Geschichte: Morgen, Sorgen-Nest, Abende. Tippen zum Weiterblättern, halten zum Anhalten.</p>' +
            '<div class="r8-reihe"><button type="button" class="r8-btn voll" data-a="los">▶ Rückblick ansehen</button></div>');
          n.querySelector('[data-a=los]').onclick = H.wocheStory;
          return n;
        }
      }
      ,{
        id: 'schlafzeit', emo: '🌙', titel: 'Wann ins Bett?',
        bau: function (H) {
          /* Schlafenszeit-Rechner (90-Minuten-Wellen) und sanfte «Routine starten»-Erinnerung. Nur solange die App offen ist. */
          function mm(t) { var p = String(t || '').split(':'); return (+p[0] || 0) * 60 + (+p[1] || 0); }
          function hm(m) { m = ((m % 1440) + 1440) % 1440; var h = Math.floor(m / 60), n = m % 60; return (h < 10 ? '0' : '') + h + ':' + (n < 10 ? '0' : '') + n; }
          function nest() { try { return (typeof S === 'object' && S && S.zeiten) ? S.zeiten : null; } catch (e) { return null; } }
          function dauer(n) { var m = n * 90, h = Math.floor(m / 60), r = m % 60; return h + (r ? '½' : '') + ' Std.'; }
          var EINSCHLAFEN = 15;
          var z0 = nest();
          var auf = H.hol('auf', (z0 && z0.auf) || '06:30');
          var er = H.hol('erinnerung', { an: false, vor: 45 });
          if (!er || typeof er !== 'object') er = { an: false, vor: 45 };
          if ([30, 45, 60].indexOf(+er.vor) < 0) er.vor = 45;
          var n = H.karte('schlafzeit', '🌙 Wann ins Bett?',
            '<p>Schlaf läuft in Wellen von etwa 90 Minuten. Wer am Ende einer Welle aufwacht, fühlt sich oft frischer. Dazu rechnet Fia rund ' + EINSCHLAFEN + ' Minuten zum Einschlafen. Ein Richtwert, kein Muss.</p>' +
            '<label class="r8z-feld"><span>Ich stehe auf um</span><input type="time" data-a="auf" step="300"></label>' +
            '<p class="r8-leise r8z-klein" id="r8z-hilfe">Tippe eine Zeit an, um sie als deine Schlafenszeit im Nest zu übernehmen.</p>' +
            '<ul class="r8z-liste" aria-describedby="r8z-hilfe"></ul>' +
            '<div class="r8z-erin"><h3 class="r8z-h3">Erinnerung: Routine starten</h3>' +
            '<p class="r8z-klein">Fia sagt dir Bescheid, wenn es Zeit für dein Abendritual ist.</p>' +
            '<label class="r8z-feld"><span>Wie lange vor dem Zubettgehen?</span><select data-a="vor"><option value="30">30 Minuten vorher</option><option value="45">45 Minuten vorher</option><option value="60">1 Stunde vorher</option></select></label>' +
            '<div class="r8-reihe"><button type="button" class="r8-btn voll" data-a="an" aria-pressed="false"></button></div>' +
            '<p class="r8z-ehrlich" role="note">Ehrlich gesagt: Die Erinnerung klappt nur, solange Fias Nest offen ist. Ist die App zu oder das Telefon gesperrt, kommt nichts. Für einen sicheren Hinweis stell zusätzlich den Wecker deines Telefons.</p></div>');
          var st = document.createElement('style');
          st.textContent = 'label.r8z-feld{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:12px 0;color:var(--t-text,#EEF0F6);font-size:1rem}.r8z-feld span{flex:1 1 9em}' +
            '.r8z-feld input,.r8z-feld select{min-height:48px;font:inherit;font-size:1.1rem;padding:6px 12px;border-radius:14px;border:1px solid var(--t-rand2,rgba(255,255,255,.24));background:var(--t-feld,rgba(255,255,255,.06));color:var(--t-text,#EEF0F6);color-scheme:dark;max-width:100%}' +
            '.r8z-liste{list-style:none;margin:8px 0 4px;padding:0;display:grid;gap:8px}' +
            '.r8z-wahl{display:flex;align-items:center;gap:12px;width:100%;min-height:60px;padding:10px 14px;border-radius:16px;border:1px solid var(--t-rand,rgba(255,255,255,.10));background:var(--t-flaeche,rgba(255,255,255,.06));color:var(--t-text,#EEF0F6);font:inherit;text-align:left;cursor:pointer}' +
            '.r8z-wahl b{font-size:1.45rem;font-variant-numeric:tabular-nums;min-width:4.2ch}.r8z-wahl small{color:var(--t-leise,#AEB4C8);line-height:1.3}' +
            '.r8z-wahl[aria-pressed=true]{border-color:var(--t-akzent,#F2B866);box-shadow:0 0 0 1px var(--t-akzent,#F2B866)}' +
            '.r8z-tipp{font-weight:700;color:var(--t-akzent,#F2B866)}' +
            '.r8z-klein{font-size:.95rem}.r8z-h3{font-size:1.05rem;margin:18px 0 4px}.r8z-erin{border-top:1px solid var(--t-rand,rgba(255,255,255,.10));margin-top:14px}' +
            '.r8z-ehrlich{font-size:.92rem;color:var(--t-leise,#AEB4C8);margin-top:10px}';
          n.appendChild(st);
          var inAuf = n.querySelector('[data-a=auf]'), liste = n.querySelector('.r8z-liste'), sel = n.querySelector('[data-a=vor]'), knopf = n.querySelector('[data-a=an]');
          inAuf.value = auf; sel.value = String(er.vor);
          function bettJetzt() { var z = nest(); return H.hol('bett', (z && z.bett) || ''); }
          function zeichne() {
            var b = bettJetzt(); liste.innerHTML = '';
            [6, 5, 4].forEach(function (w) {
              var t = hm(mm(auf) - w * 90 - EINSCHLAFEN);
              var li = document.createElement('li');
              li.innerHTML = '<button type="button" class="r8z-wahl" aria-pressed="' + (t === b) + '"><b>' + t + '</b><small>' + w + ' Schlafwellen · ' + dauer(w) + ' Schlaf' + (w === 5 ? '<br>für viele ein guter Mittelweg' : w === 4 ? '<br>für kurze Nächte' : '') + (t === b ? '<br><span class="r8z-tipp">✓ deine Schlafenszeit</span>' : '') + '</small></button>';
              li.firstChild.onclick = function () { waehle(t); };
              liste.appendChild(li);
            });
            knopf.textContent = er.an ? '🔔 Erinnerung ist an, ausschalten' : '🔕 Erinnerung einschalten';
            knopf.setAttribute('aria-pressed', er.an ? 'true' : 'false');
          }
          function waehle(t) {
            var z = nest(), vorher = z ? { auf: z.auf, bett: z.bett } : null, vorherB = H.hol('bett', '');
            H.leg('bett', t);
            if (z) { try { S.zeiten = { auf: auf, bett: t }; if (typeof save === 'function') save(); if (typeof renderTag === 'function') renderTag(); } catch (e) {} }
            H.summ(8); zeichne();
            H.rueck('Schlafenszeit ' + t + ', Aufstehen ' + auf + '.', function () {
              H.leg('bett', vorherB);
              if (vorher) { try { S.zeiten = vorher; if (typeof save === 'function') save(); if (typeof renderTag === 'function') renderTag(); } catch (e) {} }
              zeichne();
            });
          }
          inAuf.onchange = function () { if (!inAuf.value) return; auf = inAuf.value; H.leg('auf', auf); zeichne(); };
          sel.onchange = function () { er.vor = +sel.value; H.leg('erinnerung', er); };
          knopf.onclick = function () {
            er.an = !er.an; H.leg('erinnerung', er); zeichne();
            if (er.an) {
              var b = bettJetzt();
              H.toast(b ? 'Fia erinnert dich um ' + hm(mm(b) - er.vor) + ', solange das Nest offen ist.' : 'Wähl zuerst eine Schlafenszeit, dann weiss Fia, wann.');
            } else H.toast('Erinnerung ist aus.');
          };
          /* Erinnerung prüfen: alle 30 Sekunden und beim Zurückkehren in die App */
          function tagKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
          function pruefen() {
            if (!er.an) return; var b = bettJetzt(); if (!b) return;
            var jetzt = new Date(), ziel = mm(b) - er.vor, nun = jetzt.getHours() * 60 + jetzt.getMinutes();
            var diff = ((nun - ziel) % 1440 + 1440) % 1440; /* Minuten seit Erinnerungszeit */
            if (diff > 30) return;
            var k = tagKey(jetzt); if (H.hol('erinnertAm', '') === k) return;
            H.leg('erinnertAm', k); melde(b);
          }
          function melde(b) {
            var inh = H.el('<div class="r8z-melde"><p>Es ist Zeit, langsam leiser zu werden. In ' + er.vor + ' Minuten ist deine Schlafenszeit (' + H.esc(b) + ').</p><div class="r8-reihe"><button type="button" class="r8-btn voll" data-a="los">🕯️ Routine starten</button><button type="button" class="r8-btn" data-a="spaeter">Später</button></div></div>');
            var bl = H.blatt('🌙 Zeit für dein Ritual', inh);
            function zu() { if (bl && bl.zu) bl.zu(); else { var x = document.querySelector('.r8-blatt [data-zu]'); if (x) x.click(); } }
            inh.querySelector('[data-a=los]').onclick = function () { zu(); try { if (typeof go === 'function') go('ausgluehen'); } catch (e) {} };
            inh.querySelector('[data-a=spaeter]').onclick = zu;
            try { H.sag('Zeit für dein Abendritual. Ganz ohne Eile.'); } catch (e) {}
          }
          H.schlafErinnerung = melde;
          setInterval(pruefen, 30000);
          document.addEventListener('visibilitychange', function () { if (!document.hidden) pruefen(); });
          setTimeout(pruefen, 1500);
          zeichne();
          return n;
        }
      }
    ],
    wachsen: {
      licht: 'Glutfunken', licht1: 'Glutfunke', emo: '🔥', dauer: 20000,
      schritte: '[data-next],#gutSave,#traumSave,#frageSave,#rueckGut,.r7-karte .r7-btn.voll',
      ausflugBild: 'wachsen/ausflug.jpg', albumTitel: 'Fias Fundstücke aus der Nacht',
      los: 'fliegt über das Städtchen. Bis gleich!',
      wartenText: 'Ein Schritt am Abend oder Morgen gibt einen Glutfunken. Danach fliegt Fia auf Ausflug.',
      stufen: [[0, 'Glimmen', 'wachsen/stufe-1.jpg', 'Ein leises Glimmen. So fängt Ruhe an.'], [5, 'Glutnest', 'wachsen/stufe-2.jpg', 'Dein Nest wird warm.'], [15, 'Abendglut', 'wachsen/stufe-3.jpg', 'Die Abende werden leiser.'], [35, 'Ruhefeuer', 'wachsen/stufe-4.jpg', 'Fia schläft ruhig. Du auch?'], [70, 'Phönix der Nacht', 'wachsen/stufe-5.jpg', 'Fia fliegt durch ruhige Nächte. Danke, dass du gut zu dir bist.']],
      fundBilder: true, funde: [['🕯️', 'Ein Laternenlicht', 'Vom Brunnen am Platz. Es flackert ganz ruhig.'], ['🌙', 'Eine Mondsichel', 'Sie hängt tief über dem Berg. Wie eine Hängematte.'], ['🫖', 'Ein Duft von Lindenblütentee', 'Aus Grannys Küchenfenster.'], ['🪶', 'Eine Nestfeder', 'Weich wie ein Kissen.'], ['⭐', 'Ein Abendstern', 'Der erste am Himmel. Fia wünscht dir eine ruhige Nacht.'], ['🌫️', 'Ein Stück Nebel', 'Er deckt das Städtchen zu wie eine Decke.'], ['🔔', 'Der letzte Glockenschlag', 'Danach ist es ganz still.'], ['🌊', 'Ein Meeresrauschen', 'Fia hat es mitgebracht. Hörst du es?'], ['🍂', 'Ein Herbstblatt', 'Es ist ganz langsam gefallen. Ohne Eile.'], ['🔥', 'Ein Glutstück', 'Es wird langsam dunkler und bleibt warm.'], ['🌅', 'Ein Morgenversprechen', 'Morgen geht die Sonne wieder auf. Sicher.']]
    },
    sos: { bild: 'posen/atmet.jpg', ende: 'Gut gemacht. Eine Minute nur für dich. Du musst jetzt nichts mehr lösen.' },
    thema: {
      farbe: '#0B1020',
      t: { bg: '#0B1020', text: '#EEF0F6', leise: '#AEB4C8', karte: 'rgba(255,255,255,.05)', flaeche: 'rgba(255,255,255,.06)', rand: 'rgba(255,255,255,.10)', rand2: 'rgba(255,255,255,.24)', primaer: '#F1ECE2', 'primaer-text-auf-hell': '#F1ECE2', 'auf-primaer': '#12162A', kopf: '#FFFFFF', akzent: '#F2B866', 'auf-akzent': '#1A1206', 'primaer-zart': 'rgba(241,236,226,.12)', schatten: 'none', radius: '22px', kopffont: 'var(--display)', toast: 'rgba(24,28,46,.97)', ruhe: 'rgba(6,8,16,.985)', sos: 'rgba(255,255,255,.06)', feld: 'rgba(255,255,255,.06)', knopf2: 'transparent', fokus: '#F2B866' },
      css: [
        ':root{--gold:#F2B866;--line:rgba(255,255,255,.10);--cream:#EEF0F6;--muted:#AEB4C8;--night:#0B1020}',
        'body{background:linear-gradient(180deg,#1A2240 0%,#0B1020 38%,#070A14 100%) fixed!important}',
        'body[data-stage="glut"]{background:#120404!important}',
        'body::before{opacity:.35!important}',
        '.tag[data-web-only]{display:none!important}',
        'h1{background:none!important;-webkit-background-clip:initial!important;background-clip:initial!important;color:#FFFFFF!important;font-weight:400!important;letter-spacing:-.02em}',
        '#home h1{font-size:3.2rem!important}',
        'h2{font-size:1.25rem!important;font-weight:600!important;letter-spacing:-.01em;color:#FFFFFF}',
        '.cover{width:min(44vw,168px)!important;border:0!important;border-radius:50%!important;box-shadow:0 0 0 1px rgba(255,255,255,.14),0 20px 60px rgba(242,184,102,.18)!important}',
        '.say{font-size:1.4rem!important;color:#E6E8F0!important}',
        '.card,.tile,li.step{background:rgba(255,255,255,.05)!important;border:1px solid rgba(255,255,255,.10)!important;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}',
        '.tile.now,li.step.active{border-color:rgba(242,184,102,.7)!important;box-shadow:0 0 0 1px rgba(242,184,102,.25)!important}',
        '.tile b{font-size:1.05rem}',
        '.screen button:not(.r8-btn):not(.r7-btn):not(.tile):not(.jetzt):not(.r8-sosb):not(.iconbtn):not(.r8-heute):not([class*=nova]):not(:is(.r6,.r7,.r8,.r7-was,.links) *):not(.r6-k){background:#F1ECE2!important;color:#12162A!important;box-shadow:none!important}', '.screen button:not(.r8-btn):not(.r7-btn):not(.tile):not(.jetzt):not(.r8-sosb):not(.iconbtn):not(.r8-heute):not([class*=nova]):not(:is(.r6,.r7,.r8,.r7-was,.links) *):not(.r6-k) :is(small,span,em){color:#3A3F55!important}',
        '.links button{background:none!important;color:#AEB4C8!important}',
        '.iconbtn{background:rgba(255,255,255,.06)!important;color:#EEF0F6!important;border:1px solid rgba(255,255,255,.12)!important;box-shadow:none!important}',
        '.jetzt{background:linear-gradient(135deg,rgba(242,184,102,.22),rgba(255,255,255,.06))!important;border:1px solid rgba(242,184,102,.45)!important;color:#EEF0F6!important}',
        '.jetzt *{color:#EEF0F6!important}', '.r8-wst{flex-direction:row!important}', 'li.step.done{opacity:1!important}', 'li.step.done .text{opacity:.8}', 'li.step.done button{background:transparent!important;color:#C9CEDC!important;border:1px solid rgba(255,255,255,.22)!important}', 'ol.r8-tage,ol.r8-mini{display:grid!important;flex-direction:initial!important}'
      ]
    },
    einsetzen: function (N) {
      var home = document.getElementById('home'); if (!home) return;
      var hero = home.querySelector('.hero'); if (hero && N.wachsen) hero.after(N.wachsen);
      var jz = document.getElementById('jetzt'); if (jz && N.sos) jz.after(N.sos);
      var g = home.querySelector('.r7-was') || home.querySelector('.r6-gruss') || document.getElementById('jetzt');
      if (N.heute) { if (g) g.after(N.heute); else home.appendChild(N.heute); }
      var gc = home.querySelector('.glutcard');
      if (N.rueckblick) { if (gc) gc.after(N.rueckblick); else home.appendChild(N.rueckblick); }
      if (N.schlafzeit) { var vor = N.rueckblick || gc; if (vor) vor.after(N.schlafzeit); else home.appendChild(N.schlafzeit); }
    }
};
  if (window.R8) return;
  var K = C.k + '.r8.';
  function hol(k, d) { try { var v = localStorage.getItem(K + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; }
  var reduziert = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var F = C.figur, KIND = !!C.kind;
  var jetzt = new Date();
  function zwei(n) { return ('0' + n).slice(-2); }
  function datum(d) { return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()); }
  function tagVor(i) { var d = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() - i, 12); return d; }
  var HEUTE = datum(jetzt);
  var tagNr = Math.floor((jetzt.getTime() - jetzt.getTimezoneOffset() * 6e4) / 864e5);
  var WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var WTL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  function R7() { return window.R7 || null; }
  function summ(m) { try { if (C.haptik && !KIND && navigator.vibrate) navigator.vibrate(m); } catch (e) {} }
  function sag(t, f) { var r = R7(); if (r && r.sag) r.sag(t, f); else if (f) f(); }
  function still() { var r = R7(); if (r && r.still) r.still(); }
  function kannReden() { var r = R7(); return !!(r && r.kannReden); }
  function toast(t) { var r = R7(); if (r && r.toast) r.toast(t); }
  function feier(k, t) { var r = R7(); if (r && r.feier) r.feier(k, t); else if (t) toast(t); }

  /* ---------- Stil ---------- */
  var css = [
    '.r8{color:var(--r7-text,#fffaf0);font-size:16px;line-height:1.5;text-align:left;box-sizing:border-box}',
    '.r8 *,.r8-ebene *{box-sizing:border-box}',
    '.r8-ebene,.r8-rueck,.r8-offline,.r8-toastwachs{font-family:' + (C.font || 'ui-rounded,"SF Pro Rounded",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif') + '}',
    '.r8 [hidden],.r8-ebene [hidden]{display:none!important}',
    /* App-Store-«Heute»-Karte */
    '.r8-heute{display:block;width:100%;margin:16px 0;padding:0;border:0;border-radius:24px;overflow:hidden;position:relative;background:#0e1838;color:#fff;cursor:pointer;text-align:left;font:inherit;box-shadow:0 2px 4px rgba(0,0,0,.2),0 16px 36px rgba(0,0,0,.32);transition:transform .25s cubic-bezier(.2,.8,.2,1);aspect-ratio:4/4.4;max-height:520px}',
    '.r8-heute:active{transform:scale(.97)}',
    '.r8-heute img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
    '.r8-heute::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,10,30,.55) 0%,rgba(6,10,30,0) 30%,rgba(6,10,30,0) 45%,rgba(6,10,30,.92) 100%)}',
    '.r8-heute .r8-o{position:absolute;left:20px;right:20px;top:18px;z-index:1;font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,246,220,.92)}',
    '.r8-heute .r8-u{position:absolute;left:20px;right:20px;bottom:18px;z-index:1;display:flex;flex-direction:column;gap:4px}',
    '.r8-heute b{font-size:28px;line-height:1.1;font-weight:900;letter-spacing:-.02em;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.4)}',
    '.r8-heute small{font-size:15px;line-height:1.35;color:#e9ecff}',
    '.r8-heute .r8-punkt{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--r7-gold,#f2c14e);margin-right:8px;box-shadow:0 0 0 4px rgba(242,193,78,.25)}',
    /* Lesen (ganze Geschichte) */
    '.r8-lesen{position:fixed;inset:0;z-index:2147483602;background:#0a1230;color:#fffaf0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}',
    '.r8-lesen .r8-bild{display:block;width:100%;height:min(52vh,460px);object-fit:cover}',
    '.r8-lesen .r8-zu{position:fixed;top:calc(12px + env(safe-area-inset-top,0px));right:12px;width:44px;height:44px;border-radius:50%;border:0;background:rgba(6,10,30,.7);color:#fff;font-size:22px;line-height:1;cursor:pointer;z-index:2;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}',
    '.r8-lesen .r8-in{max-width:640px;margin:0 auto;padding:20px 20px calc(32px + env(safe-area-inset-bottom,0px))}',
    '.r8-lesen .r8-o{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--r7-gold2,#ffe08a)}',
    '.r8-lesen h2{margin:4px 0 12px;font-size:28px;line-height:1.15;font-weight:900;letter-spacing:-.02em;color:#fff}',
    '.r8-lesen p{margin:0 0 14px;font-size:18px;line-height:1.6;color:#eef0ff}',
    '.r8-frage{margin:16px 0;padding:16px;border-radius:16px;background:rgba(242,193,78,.12);border:1px solid rgba(242,193,78,.45);font-size:18px;line-height:1.5}',
    '.r8-frage b{display:block;color:var(--r7-gold2,#ffe08a);font-size:14px;letter-spacing:.04em;text-transform:uppercase;margin-bottom:4px}',
    '.r8-reihe{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}',
    '.r8-btn{min-height:44px;min-width:44px;padding:10px 18px;border-radius:999px;border:1px solid rgba(242,193,78,.55);background:rgba(14,24,56,.55);color:#fffaf0;font:inherit;font-weight:700;font-size:15px;line-height:1.2;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}',
    '.r8-btn.voll{background:var(--r7-gold,#f2c14e);color:#14204a;border-color:var(--r7-gold,#f2c14e)}',
    '.r8-btn:active{transform:scale(.97)}',
    /* Post-Knopf auf der Bühne (Kinder-App) */
    '.r8-post{position:absolute;top:12px;right:12px;z-index:6;width:48px;height:48px;border-radius:50%;border:2px solid var(--r7-gold,#f2c14e);background:rgba(10,18,48,.85);font-size:24px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}',
    '.r8-post i{position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:#ff7a59;border:2px solid #0e1838}',
    /* Woche mit Schutzfeder */
    '.r8-karte{margin:16px 0;padding:16px;border-radius:16px;background:var(--r7-karte,linear-gradient(160deg,rgba(38,58,130,.62),rgba(16,26,62,.92)));border:1px solid var(--r7-rand,rgba(242,193,78,.32));box-shadow:var(--r7-schatten,0 10px 28px rgba(0,0,0,.22))}',
    '.r8-karte h2{margin:0 0 8px;font-size:20px;line-height:1.25;color:var(--r7-gold2,#ffe08a);font-weight:800}',
    '.r8-karte p{margin:0 0 8px}',
    '.r8-leise{color:var(--r7-leise,#c9d2ee);font-size:14px}',
    '.r8-tage{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin:8px 0;list-style:none;padding:0}',
    '.r8-tage li{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:12px;color:var(--r7-leise,#c9d2ee)}',
    '.r8-tage li span{width:36px;height:36px;max-width:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14)}',
    '.r8-tage li.da span{background:radial-gradient(circle,#fff3c8,var(--r7-gold,#f2c14e) 60%);border-color:var(--r7-gold,#f2c14e);box-shadow:0 0 12px rgba(242,193,78,.5)}',
    '.r8-tage li.feder span,.r8-tage li.ruhe span{background:rgba(160,180,255,.16);border-color:rgba(160,180,255,.55)}',
    '.r8-tage li.heute{color:#fff;font-weight:800}',
    '.r8-kettezeile{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin:4px 0 8px;font-size:14px;color:var(--r7-leise,#c9d2ee)}',
    '.r8-kettezeile span{flex:1 1 180px;min-width:0}',
    '.chain span.r8-feder,.chain span.r8-ruhe{position:relative;background:rgba(160,180,255,.22)!important;box-shadow:0 0 8px rgba(160,180,255,.6)!important}',
    '.chain span.r8-feder::after,.chain span.r8-ruhe::after{content:"🪶";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:11px;line-height:1}',
    '.chain span.r8-ruhe::after{content:"🌙"}',
    /* Streicheln */
    '.r8-streichel{touch-action:pan-y;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}','.r8-streichel img,img.r8-streichel{-webkit-user-drag:none}',
    '.r8-wohl{animation:r8Wohl .8s cubic-bezier(.2,.8,.2,1)}',
    '@keyframes r8Wohl{0%{transform:none}30%{transform:scale(1.04) rotate(-2deg)}60%{transform:scale(1.03) rotate(2deg)}100%{transform:none}}',
    '.r8-herz{position:fixed;z-index:2147483603;pointer-events:none;font-size:22px;animation:r8Herz 1.3s ease-out forwards}',
    '@keyframes r8Herz{from{opacity:0;transform:translate(0,0) scale(.6)}20%{opacity:1}to{opacity:0;transform:translate(var(--dx),-90px) scale(1.1)}}',
    /* Kontextmenü (lange drücken) */
    '.r8-menue{position:fixed;inset:0;z-index:2147483602;display:flex;flex-direction:column;align-items:center;justify-content:safe center;overflow-y:auto;overscroll-behavior:contain;gap:16px;padding:24px;background:rgba(4,8,24,.55);-webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2)}',
    '.r8-menue img{width:min(46vw,190px);height:min(46vw,190px);border-radius:28px;object-fit:cover;border:3px solid var(--r7-gold,#f2c14e);box-shadow:0 20px 50px rgba(0,0,0,.45)}',
    '.r8-menue ul{list-style:none;margin:0;padding:6px;width:min(100%,300px);border-radius:16px;background:rgba(24,34,72,.94);border:1px solid rgba(255,255,255,.14);box-shadow:0 20px 50px rgba(0,0,0,.45)}',
    '.r8-menue li+li{border-top:1px solid rgba(255,255,255,.1)}',
    '.r8-menue li button{width:100%;min-height:48px;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 14px;border:0;background:none;color:#fff;font:inherit;font-size:16px;cursor:pointer;border-radius:10px;text-align:left}',
    '.r8-menue li button:active{background:rgba(255,255,255,.1)}',
    '.r8-ein-menue{animation:r8Pop .28s cubic-bezier(.2,.9,.3,1.2) both}',
    '@keyframes r8Pop{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:none}}',
    /* Story (Wochen-Rückblick) */
    '.r8-story{position:fixed;inset:0;z-index:2147483602;background:#0a1230;color:#fff;display:flex;flex-direction:column;user-select:none;-webkit-user-select:none;touch-action:none}',
    '.r8-balken{display:flex;gap:4px;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 0}',
    '.r8-balken i{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.28);overflow:hidden}',
    '.r8-balken i b{display:block;height:100%;width:0;background:#fff}',
    '.r8-story .r8-kopf{display:flex;align-items:center;gap:8px;padding:8px 8px 0 12px}',
    '.r8-story .r8-kopf img{width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,.5)}',
    '.r8-story .r8-kopf span{flex:1;font-weight:700;font-size:14px}',
    '.r8-story .r8-kopf button{width:44px;height:44px;border:0;background:none;color:#fff;font-size:24px;cursor:pointer}',
    '.r8-folie{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:16px 24px calc(24px + env(safe-area-inset-bottom,0px));text-align:center;position:relative}',
    '.r8-folie img.r8-fb{width:min(56vw,240px);height:min(56vw,240px);border-radius:50%;object-fit:cover;border:3px solid var(--r7-gold,#f2c14e);box-shadow:0 0 0 10px rgba(242,193,78,.12)}',
    '.r8-folie .r8-gz{font-size:64px;line-height:1;font-weight:900;color:var(--r7-gold2,#ffe08a);font-variant-numeric:tabular-nums}',
    '.r8-folie h3{margin:0;font-size:26px;line-height:1.2;font-weight:900;max-width:22ch}',
    '.r8-folie p{margin:0;font-size:18px;line-height:1.5;max-width:30ch;color:#e6e9ff}',
    '.r8-folie .r8-reihe{justify-content:center;position:relative;z-index:3}',
    '.r8-story .r8-zone{all:unset;position:absolute;top:0;bottom:0;z-index:2;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.r8-story .r8-zone:focus-visible{outline:3px solid rgba(255,224,138,.6)!important;outline-offset:-6px!important;box-shadow:none!important}',
    '.r8-story .r8-zone.l{left:0;width:33%}.r8-story .r8-zone.r{right:0;width:67%}',
    '.r8-ein-folie{animation:r8Folie .35s cubic-bezier(.2,.8,.2,1) both}',
    '@keyframes r8Folie{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}',
    /* Rückgängig-Toast und Offline */
    '.r8-rueck{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom,0px));transform:translate(-50%,24px);opacity:0;z-index:2147483604;display:flex;gap:12px;align-items:center;max-width:calc(100vw - 32px);width:max-content;padding:8px 8px 8px 18px;border-radius:28px;background:rgba(14,22,52,.97);border:1px solid rgba(242,193,78,.6);color:#fffaf0;box-shadow:0 12px 30px rgba(0,0,0,.35);font-size:15px;font-weight:600;transition:transform .3s,opacity .3s;pointer-events:none}',
    '.r8-rueck.da{transform:translate(-50%,0);opacity:1;pointer-events:auto}',
    '.r8-rueck span{min-width:0;color:#fffaf0!important}',
    '.r8-rueck button{flex:none;min-height:44px;padding:8px 16px;border-radius:999px;border:0;background:var(--r7-gold,#f2c14e);color:#14204a;font:inherit;font-weight:800;cursor:pointer}',
    '.r8-offline{position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top,0px));transform:translate(-50%,-80px);z-index:2147483604;max-width:calc(100vw - 32px);padding:8px 16px;border-radius:999px;background:rgba(14,22,52,.97);border:1px solid rgba(160,180,255,.6);color:#fffaf0;font-size:14px;font-weight:600;transition:transform .3s;box-shadow:0 8px 20px rgba(0,0,0,.3)}',
    '.r8-offline.da{transform:translate(-50%,0)}',
    /* iOS-Blatt mit Raststufen */
    '.r8-hinter{position:fixed;inset:0;z-index:2147483600;background:rgba(4,8,24,.5);opacity:0;transition:opacity .3s}',
    '.r8-hinter.da{opacity:1}',
    '.r8-blatt{position:fixed;left:0;right:0;bottom:0;z-index:2147483601;height:92vh;height:92dvh;max-width:640px;margin:0 auto;display:flex;flex-direction:column;border-radius:20px 20px 0 0;background:#13204d;border:1px solid rgba(242,193,78,.35);border-bottom:0;box-shadow:0 -10px 40px rgba(0,0,0,.4);transform:translateY(100%);transition:transform .35s cubic-bezier(.2,.8,.2,1)}',
    '.r8-blatt.zieht{transition:none}',
    '.r8-griff{flex:none;display:flex;flex-direction:column;align-items:center;padding:8px 16px 4px;cursor:grab;touch-action:none}',
    '.r8-griff::before{content:"";width:40px;height:5px;border-radius:3px;background:rgba(255,255,255,.4);margin-bottom:8px}',
    '.r8-griff h2{margin:0;width:100%;display:flex;justify-content:space-between;align-items:center;font-size:20px;color:var(--r7-gold2,#ffe08a)}',
    '.r8-blatt .r8-bi{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:8px 16px calc(24px + env(safe-area-inset-bottom,0px))}',
    /* Tastaturkürzel */
    '.r8-kz{display:grid;grid-template-columns:auto 1fr;gap:8px 16px;align-items:center;text-align:left;max-width:360px}',
    '.r8-kz kbd{display:inline-block;min-width:32px;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.08);font:700 15px ui-monospace,monospace;text-align:center;color:#fff}',
    '.r8-wachs .r8-wk{display:flex;gap:12px;align-items:center}',
    '.r8-wachs .r8-wk img{flex:none;width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--r7-gold,#f2c14e)}',
    '.r8-wachs .r8-wk small{display:block;font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--r7-leise,#c9d2ee)}',
    '.r8-wachs h2{margin:2px 0;font-size:19px}',
    '.r8-wbar{height:10px;border-radius:5px;background:rgba(255,255,255,.1);overflow:hidden;margin:12px 0 6px}',
    '.r8-wbar i{display:block;height:100%;width:0;border-radius:5px;background:linear-gradient(90deg,#f2c14e,#ffe08a);transition:width .8s cubic-bezier(.2,.8,.2,1)}',
    '.r8-wst{display:flex;justify-content:space-between;list-style:none;margin:0;padding:0 2px}',
    '.r8-wst li{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.14)}.r8-wst li.an{background:var(--r7-gold,#f2c14e);box-shadow:0 0 8px rgba(242,193,78,.6)}',
    '.r8-album{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px;margin-top:8px}',
    '.r8-album button,.r8-album .r8-zu-finden{min-height:84px;border-radius:14px;border:1px solid rgba(242,193,78,.4);background:rgba(255,255,255,.06);color:#fffaf0;font:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px;cursor:pointer}',
    '.r8-album button span{font-size:30px}.r8-album button small{font-size:12px;line-height:1.2;text-align:center}',
    '.r8-album .r8-zu-finden{border-style:dashed;color:rgba(255,255,255,.35);font-size:24px;cursor:default}',
    '.r8-sosb{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;margin:12px 0;padding:10px 16px;border-radius:16px;border:1px solid rgba(140,200,255,.55);background:linear-gradient(120deg,rgba(80,140,255,.22),rgba(140,220,255,.12));color:#fffaf0;font:inherit;text-align:left;cursor:pointer}',
    '.r8-sosb>span:first-child{font-size:28px}.r8-sosb b{display:block;font-size:17px}.r8-sosb small{display:block;font-size:14px;color:var(--r7-leise,#c9d2ee)}',
    '.r8-sosk{position:relative;width:min(70vw,260px);height:min(70vw,260px)}',
    '.r8-sosk svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}.r8-sosk circle{fill:none;stroke-width:6;stroke-linecap:round}',
    '.r8-sosk img{position:absolute;inset:14%;width:72%;height:72%;border-radius:50%;object-fit:cover;transition:transform .2s linear}',
    '.r8-wachspill{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:6px 14px;border-radius:999px;border:1px solid rgba(242,193,78,.55);background:rgba(10,18,48,.7);color:#fffaf0;font:inherit;font-weight:700;font-size:14px;cursor:pointer}',
    '.r8-wachspill i{display:inline-block;width:48px;height:6px;border-radius:3px;background:rgba(255,255,255,.15);overflow:hidden}.r8-wachspill i b{display:block;height:100%;background:#f2c14e}',
    '.r8-ebene [tabindex="-1"]:focus,.r8 [tabindex="-1"]:focus,.r7-karte h2:focus{outline:none!important;box-shadow:none!important}',
    /* Weicher Wechsel */
    '::view-transition-old(root),::view-transition-new(root){animation-duration:.28s}',
    '::view-transition-group(r8-bild){animation-duration:.42s;animation-timing-function:cubic-bezier(.2,.8,.2,1)}',
    '@media (prefers-reduced-motion:reduce){.r8-heute,.r8-blatt,.r8-rueck,.r8-offline,.r8-hinter{transition:none}.r8-wohl,.r8-ein-menue,.r8-ein-folie,.r8-herz{animation:none}::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}'
  ].concat(C.css || []).join('');
  var stil = document.createElement('style'); stil.id = 'r8-stil'; stil.textContent = css; document.head.appendChild(stil);
  /* ---------- Eigenes App-Design (Runde 8, Markt-Look): Tokens + Anpassung aller Runden-Bausteine ---------- */
  if (C.thema) {
    var TT = C.thema, tk = TT.t;
    var tv = ':root{' + Object.keys(tk).map(function (k) { return '--t-' + k + ':' + tk[k]; }).join(';') + ';' +
      '--r7-text:var(--t-text);--r7-leise:var(--t-leise);--r7-karte:var(--t-karte);--r7-rand:var(--t-rand);--r7-gold:var(--t-primaer);--r7-gold2:var(--t-kopf);--r7-schatten:var(--t-schatten)}';
    var KS = ':is(.r6-karte,.r7-karte,.r8-karte,.r7-was,.r6-gruss,.r8-wachs,.r6-besuch,.r6-char)';
    var hell = !!TT.hell;
    var tcss = [tv,
      '.r7-himmel{display:none!important}',
      ':root,.r6,.r6-karte{--r6t:var(--t-text);--r6g:var(--t-primaer);--r6g2:var(--t-kopf);--r6m:var(--t-leise)}',
      ':is(.r6-k,.r6-btn):not(.voll):not([aria-pressed=true]){background:var(--t-knopf2,transparent)!important;color:var(--t-primaer-text-auf-hell,var(--t-primaer))!important;border-color:var(--t-rand2,var(--t-rand))!important;box-shadow:none!important}',
      ':is(.r6-k,.r6-btn).voll,:is(.r6-k,.r6-btn)[aria-pressed=true]{background:var(--t-primaer)!important;color:var(--t-auf-primaer)!important;border-color:var(--t-primaer)!important}',
      '.r6-chips button{background:var(--t-flaeche)!important;color:var(--t-text)!important;border-color:var(--t-rand)!important}.r6-chips button[aria-pressed=true]{background:var(--t-primaer-zart)!important;border-color:var(--t-primaer)!important}',
      '.r6-sammel button{background:var(--t-primaer-zart)!important;border-color:var(--t-rand2,var(--t-rand))!important}',
      KS + ' button:not(.r7-btn):not(.r8-btn):not(.r6-k):not(.r6-btn):not(.voll):not([aria-pressed=true]):not([class*=nova]):not(.r8-heute){color:var(--t-text)}',
      KS + '{background:var(--t-karte)!important;border:1px solid var(--t-rand)!important;color:var(--t-text)!important;box-shadow:var(--t-schatten)!important;border-radius:var(--t-radius,20px)!important}',
      KS + ' :is(p,li,span,small,em,strong,b,label,div,dd,dt,figcaption){color:inherit}',
      KS + ' :is(h2,h3){color:var(--t-kopf)!important;font-family:var(--t-kopffont,inherit)!important}',
      KS + ' :is(.r7-leise,.r8-leise,.r6-klein,.r6-leise,small),.r8-leise,.r7-leise{color:var(--t-leise)!important}',
      ':is(.r6-karte,.r7-karte,.r8-karte,.r7-was,.r8-wachs,.r8-kettezeile) :is(.r7-btn,.r8-btn,.r6-k,.r6-btn):not(.voll):not([aria-pressed=true]),.r8-kettezeile .r8-btn{background:var(--t-knopf2,transparent)!important;color:var(--t-primaer-text-auf-hell,var(--t-primaer))!important;border:1px solid var(--t-rand2,var(--t-rand))!important;box-shadow:none!important}',
      ':is(.r7-btn,.r8-btn,.r6-btn).voll,:is(.r7-btn,.r8-btn)[aria-pressed=true],.r7-was li button b{}',
      ':is(.r6-karte,.r7-karte,.r8-karte,.r7-was,.r8-wachs,.r8-lesen,.r8-blatt) :is(.r7-btn,.r8-btn,.r6-btn).voll,:is(.r6-karte,.r7-karte,.r8-karte) :is(.r7-btn,.r8-btn)[aria-pressed=true]{background:var(--t-primaer)!important;color:var(--t-auf-primaer)!important;border-color:var(--t-primaer)!important}',
      KS + ' :is(.r7-chips button,.r8-kf-chips button){background:var(--t-flaeche)!important;color:var(--t-text)!important;border-color:var(--t-rand)!important}',
      KS + ' :is(.r7-chips button,.r8-kf-chips button)[aria-pressed=true]{background:var(--t-primaer-zart)!important;border-color:var(--t-primaer)!important}',
      KS + ' :is(input,textarea,select),.r8-blatt :is(input,textarea){background:var(--t-feld,#fff)!important;color:var(--t-text)!important;border-color:var(--t-rand2,var(--t-rand))!important}',
      KS + ' :is(.r7-liste li,.r7-leer,.r6-feld,.r8-tage li span,.r8-kf-vor li){background:var(--t-flaeche)!important;border-color:var(--t-rand)!important;color:var(--t-text)!important}',
      '.r7-was li button{background:var(--t-flaeche)!important;color:var(--t-text)!important;border-color:var(--t-rand)!important}.r7-was li button b{color:var(--t-kopf)!important}',
      '.r7-neu{background:var(--t-akzent)!important;color:var(--t-auf-akzent)!important}',
      '.r8-tage li.da span{background:var(--t-primaer)!important;border-color:var(--t-primaer)!important;box-shadow:none!important}',
      '.r8-wbar{background:var(--t-flaeche)!important}.r8-wbar i{background:var(--t-primaer)!important}.r8-wst li{background:var(--t-rand)!important}.r8-wst li.an{background:var(--t-primaer)!important;box-shadow:none!important}',
      '.r8-wachs .r8-wk img{border-color:var(--t-primaer)!important}',
      '.r8-sosb{background:var(--t-sos,var(--t-karte))!important;border-color:var(--t-rand2,var(--t-rand))!important;color:var(--t-text)!important;box-shadow:var(--t-schatten)!important}.r8-sosb small{color:var(--t-leise)!important}',
      '.r8-lesen{background:var(--t-bg)!important;color:var(--t-text)!important}.r8-lesen p{color:var(--t-text)!important}.r8-lesen h2{color:var(--t-kopf)!important;font-family:var(--t-kopffont,inherit)}.r8-lesen .r8-o{color:var(--t-primaer-text-auf-hell,var(--t-primaer))!important}',
      '.r8-frage{background:var(--t-primaer-zart)!important;border-color:var(--t-rand2,var(--t-rand))!important}.r8-frage b{color:var(--t-kopf)!important}',
      '.r8-lesen .r8-btn:not(.voll),.r8-blatt .r8-btn:not(.voll){background:transparent!important;color:var(--t-primaer-text-auf-hell,var(--t-primaer))!important;border-color:var(--t-rand2,var(--t-rand))!important}',
      '.r8-blatt{background:var(--t-karte)!important;color:var(--t-text)!important;border-color:var(--t-rand)!important}.r8-griff h2{color:var(--t-kopf)!important}.r8-griff::before{background:var(--t-rand2,var(--t-rand))!important}',
      '.r8-kf-z{background:var(--t-flaeche)!important;border-color:var(--t-rand)!important;color:var(--t-text)!important}.r8-kf-z button{color:var(--t-primaer-text-auf-hell,var(--t-primaer))!important;border-color:var(--t-primaer)!important}',
      ':is(.r7-toast,.r8-rueck,.r8-offline){background:var(--t-toast,#1f2430)!important;color:#fff!important;border-color:transparent!important}',
      '.r8-rueck button{background:var(--t-akzent)!important;color:var(--t-auf-akzent)!important}',
      '.r8-menue .r8-karte{background:var(--t-karte)!important;color:var(--t-text)!important}.r8-menue .r8-karte h2{color:var(--t-kopf)!important}',
      '.r8-menue ul{background:var(--t-karte)!important;border-color:var(--t-rand)!important}.r8-menue li button{color:var(--t-text)!important}.r8-menue li+li{border-color:var(--t-rand)!important}',
      '.r8-menue img{border-color:var(--t-karte)!important}',
      '.r8-album button,.r8-album .r8-zu-finden{background:var(--t-flaeche)!important;color:var(--t-text)!important;border-color:var(--t-rand)!important}',
      '.r8-heute{box-shadow:var(--t-schatten)!important;border-radius:var(--t-radius,20px)!important}',
      '.r8-kettezeile{color:var(--t-leise)!important}','.r8-rk button{color:var(--t-text)!important;background:var(--t-flaeche)!important;border-color:var(--t-rand)!important}','.r8-mini li{color:var(--t-leise)!important}',
      '.r7-voll{background:var(--t-ruhe,rgba(4,7,20,.985))!important;--r7-text:#fffaf0;--r7-leise:#c9d2ee;--r7-gold2:#ffe08a;--r7-gold:#f2c14e;color:#fffaf0!important}','.r7-voll :is(p,small,.r7-zahl,.r7-ansage,.r7-runde){color:inherit!important}.r7-voll small{color:#c9d2ee!important}.r7-voll .r7-zahl{color:#ffe08a!important}',
      ':where(button,a,[role=button],[role=tab],summary,input,select,textarea,[tabindex]:not([tabindex="-1"])):focus-visible{outline-color:var(--t-fokus,var(--t-primaer))!important;box-shadow:0 0 0 6px var(--t-primaer-zart)!important}'
    ].concat(TT.css || []).join('');
    var ts = document.createElement('style'); ts.id = 'r8-thema'; ts.textContent = tcss;
    /* Ganz am Ende des Kopfes, damit das Design über allen früheren Runden liegt */
    var setz = function () { document.head.appendChild(ts); };
    setz(); document.addEventListener('DOMContentLoaded', function () { setTimeout(setz, 60); });
    if (TT.farbe) { var mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.setAttribute('content', TT.farbe); }
  }

  /* ---------- Weicher Wechsel (View Transitions API, sonst sofort) ---------- */
  function wechsel(fn) {
    if (!reduziert && document.startViewTransition) { try { return document.startViewTransition(fn); } catch (e) {} }
    fn(); return null;
  }
  /* Ansichtswechsel der App weich überblenden (nur reine Ansichtswechsel, kein Ton) */
  if (C.vtKlick && document.startViewTransition && !reduziert) {
    document.addEventListener('click', function (e) {
      if (e.r8vt || !e.isTrusted) return;
      var t = e.target.closest && e.target.closest(C.vtKlick); if (!t) return;
      e.stopImmediatePropagation(); e.preventDefault();
      try {
        document.startViewTransition(function () { var ev = new MouseEvent('click', { bubbles: true, cancelable: true, view: window }); ev.r8vt = true; t.dispatchEvent(ev); });
      } catch (x) { var ev2 = new MouseEvent('click', { bubbles: true, cancelable: true }); ev2.r8vt = true; t.dispatchEvent(ev2); }
    }, true);
  }

  /* ---------- Ebenen (Dialoge) ---------- */
  var offen = [];
  function ebene(node, zu) {
    var vorher = document.activeElement;
    node.classList.add('r8-ebene'); node.setAttribute('role', node.getAttribute('role') || 'dialog'); node.setAttribute('aria-modal', 'true');
    var e = { el: node, zu: function () {
      var i = offen.indexOf(e); if (i < 0) return; offen.splice(i, 1);
      if (zu) zu();
      node.remove(); document.documentElement.classList.toggle('r8-offen', offen.length > 0);
      try { if (vorher && vorher.focus) vorher.focus({ preventScroll: true }); } catch (x) {}
    } };
    offen.push(e); document.body.appendChild(node); document.documentElement.classList.add('r8-offen');
    node.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); e.zu(); }
      if (ev.key === 'Tab') { /* Fokus bleibt im Dialog */
        var f = [].filter.call(node.querySelectorAll('button,a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])'), function (x) { return x.offsetParent !== null && !x.disabled; });
        if (!f.length) return; var a = f[0], z = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === a) { ev.preventDefault(); z.focus(); } else if (!ev.shiftKey && document.activeElement === z) { ev.preventDefault(); a.focus(); }
      }
    });
    return e;
  }

  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && offen.length && !offen[offen.length - 1].el.contains(document.activeElement)) { ev.preventDefault(); offen[offen.length - 1].zu(); } });
  /* ---------- Rückgängig-Toast ---------- */
  var rEl = null, rT = 0, rFn = null;
  function rueck(text, fn) {
    if (!rEl) {
      rEl = el('<div class="r8-rueck" role="status" aria-live="polite"><span></span><button type="button">Rückgängig</button></div>');
      document.body.appendChild(rEl);
      rEl.querySelector('button').onclick = function () { var f = rFn; rFn = null; rEl.classList.remove('da'); if (f) { f(); toast('Rückgängig gemacht.'); } };
    }
    rEl.querySelector('span').textContent = text; rFn = fn; rEl.classList.add('da');
    clearTimeout(rT); rT = setTimeout(function () { rEl.classList.remove('da'); rFn = null; }, 6000);
  }

  /* ---------- Offline-Hinweis ---------- */
  function offline() {
    var o = el('<div class="r8-offline" role="status" aria-live="polite"></div>'); document.body.appendChild(o); var t = 0;
    function zeig(text, ms) { o.textContent = text; o.classList.add('da'); clearTimeout(t); if (ms) t = setTimeout(function () { o.classList.remove('da'); }, ms); }
    addEventListener('offline', function () { zeig('📴 Offline. ' + F + ' ist trotzdem da, alles auf diesem Gerät geht weiter.', 5000); });
    addEventListener('online', function () { zeig('✓ Wieder verbunden.', 2000); });
    if (navigator.onLine === false) zeig('📴 Offline. ' + F + ' ist trotzdem da.', 4000);
  }

  /* ---------- Teilen als Bild (Canvas) ---------- */
  function umbruch(ctx, text, max) {
    var w = String(text).split(/\s+/), z = [], a = '';
    w.forEach(function (x) { var t = a ? a + ' ' + x : x; if (ctx.measureText(t).width > max && a) { z.push(a); a = x; } else a = t; });
    if (a) z.push(a); return z;
  }
  function zeichne(o, mitBild, fertig) {
    var c = document.createElement('canvas'); c.width = 1080; c.height = 1350; var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, 1350); g.addColorStop(0, '#1c2b66'); g.addColorStop(1, '#070c22'); x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
    for (var i = 0; i < 90; i++) { var r = Math.sin(i * 9301 + 49297) * 233280; r -= Math.floor(r); var r2 = Math.sin(i * 7919 + 1237) * 233280; r2 -= Math.floor(r2); x.fillStyle = 'rgba(255,246,220,' + (0.2 + r * 0.6).toFixed(2) + ')'; x.beginPath(); x.arc(r * 1080, r2 * 1350, 1 + (r > .85 ? 2 : 0.8), 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(242,193,78,.6)'; x.lineWidth = 4; x.strokeRect(40, 40, 1000, 1270);
    function rest(img) {
      var y = 140;
      if (img) {
        x.save(); x.beginPath(); x.arc(540, 380, 230, 0, 7); x.closePath(); x.clip();
        var s = Math.max(460 / img.naturalWidth, 460 / img.naturalHeight); var w = img.naturalWidth * s, h = img.naturalHeight * s;
        x.drawImage(img, 540 - w / 2, 380 - h / 2, w, h); x.restore();
        x.strokeStyle = '#f2c14e'; x.lineWidth = 10; x.beginPath(); x.arc(540, 380, 232, 0, 7); x.stroke(); y = 690;
      }
      x.textAlign = 'center'; x.fillStyle = '#ffe08a'; x.font = '900 64px system-ui,-apple-system,sans-serif';
      umbruch(x, o.titel || '', 900).slice(0, 2).forEach(function (z) { x.fillText(z, 540, y); y += 76; });
      y += 16; x.fillStyle = '#eef0ff'; x.font = '500 40px system-ui,-apple-system,sans-serif';
      umbruch(x, o.text || '', 900).slice(0, img ? 7 : 14).forEach(function (z) { x.fillText(z, 540, y); y += 56; });
      x.fillStyle = 'rgba(255,246,220,.75)'; x.font = '700 30px system-ui,-apple-system,sans-serif'; x.fillText(C.app || F, 540, 1270);
      try { c.toBlob(function (b) { fertig(b, c); }, 'image/png'); } catch (e) { if (img) zeichne(o, false, fertig); else fertig(null, c); }
    }
    if (mitBild && o.bild) { var im = new Image(); im.onload = function () { rest(im); }; im.onerror = function () { rest(null); }; im.src = o.bild; }
    else rest(null);
  }
  function teilen(o) {
    zeichne(o, true, function (blob) {
      if (!blob) { toast('Das Bild klappt hier leider nicht.'); return; }
      var name = (C.k || 'drlab') + '-' + HEUTE + '.png', file = null;
      try { file = new File([blob], name, { type: 'image/png' }); } catch (e) {}
      if (file && navigator.canShare && navigator.share) {
        try { if (navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: o.titel || F }).catch(function () {}); return; } } catch (e) {}
      }
      var u = URL.createObjectURL(blob);
      var e = ebene(el('<div class="r8-menue" aria-label="Bild zum Sichern"><img alt="" style="width:min(80vw,360px);height:auto;border-radius:16px"><p style="margin:0;text-align:center;max-width:30ch">Bild lange drücken, dann «Sichern» oder «Teilen».</p><button type="button" class="r8-btn voll">Schliessen</button></div>'), function () { URL.revokeObjectURL(u); });
      var im = e.el.querySelector('img'); im.src = u; im.alt = o.titel || 'Bild';
      e.el.querySelector('button').onclick = e.zu; e.el.addEventListener('click', function (v) { if (v.target === e.el) e.zu(); });
      e.el.querySelector('button').focus();
    });
  }

  /* ---------- Woche mit Schutzfeder (Serien-Schutz) ---------- */
  var W = C.woche || null;
  function tage() { return hol('tage', {}); }
  function markiere() { var t = tage(); if (t[HEUTE] === 'da') return false; t[HEUTE] = 'da'; var ks = Object.keys(t).sort(); while (ks.length > 120) delete t[ks.shift()]; leg('tage', t); wocheAlle(); return true; }
  function zustand(i, extern) { /* i Tage zurück */
    var d = tagVor(i), k = datum(d), t = tage()[k];
    if (t === 'ruhe') return 'ruhe';
    if (t === 'da' || (extern && extern(d, i))) return 'da';
    return '';
  }
  function reihe(extern) {
    var s = []; for (var i = 6; i >= 0; i--) s.push(zustand(i, extern));
    /* Schutzfeder: ein einzelner verpasster Tag zwischen zwei aktiven Tagen, höchstens einmal in sieben Tagen */
    for (var j = 5; j >= 1; j--) if (!s[j] && s[j - 1] && (s[j + 1] || j === 5)) { s[j] = 'feder'; break; }
    var morgen = tage()[datum(tagVor(-1))] === 'ruhe';
    var n = 0, k = s[6] ? 6 : 5; while (k >= 0 && s[k]) { n++; k--; }
    return { s: s, serie: n, morgenRuhe: morgen };
  }
  function ruheMorgen(an) {
    var t = tage(), k = datum(tagVor(-1));
    if (an) t[k] = 'ruhe'; else delete t[k];
    leg('tage', t); wocheAlle();
  }
  var wochenTeile = [];
  function wocheAlle() { wochenTeile.forEach(function (f) { try { f(); } catch (e) {} }); }
  function ruheKnopf() {
    var b = el('<button type="button" class="r8-btn"></button>');
    function z() { var m = reihe(W && W.extern).morgenRuhe; b.textContent = m ? '🌙 Morgen ist Ruhetag ✓' : '🌙 Morgen Ruhetag'; b.setAttribute('aria-pressed', String(m)); }
    b.onclick = function () {
      var m = reihe(W && W.extern).morgenRuhe; ruheMorgen(!m); z(); summ(8);
      if (!m && WX && hol('ruheLicht', 0) < tagNr - 6) { leg('ruheLicht', tagNr); licht(1, 'ruhe'); }
      if (!m) rueck('Morgen ist Ruhetag. Deine Kette bleibt.', function () { ruheMorgen(false); z(); });
    };
    wochenTeile.push(z); z(); return b;
  }
  function serieText(r) {
    var w = W.wort || 'Tage';
    if (!r.serie) return W.leer || ('Jeder Tag mit ' + F + ' wird ein Punkt. Kein Druck.');
    return r.serie + ' ' + (r.serie === 1 ? (W.wort1 || 'Tag') : w) + ' in Folge.' + (r.s.indexOf('feder') >= 0 ? ' 🪶 Die Schutzfeder hat einen verpassten Tag aufgefangen.' : ' Ein verpasster Tag bricht nichts: die Schutzfeder hält.');
  }
  function wocheKarte(H) {
    var n = el('<section class="r8 r8-karte" aria-labelledby="r8-wo-h"><h2 id="r8-wo-h">' + esc(W.titel) + '</h2><ol class="r8-tage" aria-label="Die letzten sieben Tage"></ol><p class="r8-leise r8-st" aria-live="polite"></p><div class="r8-reihe"></div></section>');
    var ol = n.querySelector('ol'), st = n.querySelector('.r8-st');
    function z() {
      var r = reihe(W.extern); ol.innerHTML = '';
      r.s.forEach(function (s, idx) {
        var d = tagVor(6 - idx), emo = s === 'da' ? (W.emo || '⭐') : s === 'feder' ? '🪶' : s === 'ruhe' ? '🌙' : '';
        var lab = WTL[d.getDay()] + ': ' + (s === 'da' ? 'da' : s === 'feder' ? 'Schutzfeder' : s === 'ruhe' ? 'Ruhetag' : idx === 6 ? 'heute noch offen' : 'frei');
        ol.insertAdjacentHTML('beforeend', '<li class="' + s + (idx === 6 ? ' heute' : '') + '" aria-label="' + esc(lab) + '"><span aria-hidden="true">' + emo + '</span>' + WT[d.getDay()] + '</li>');
      });
      st.textContent = serieText(r);
    }
    n.querySelector('.r8-reihe').appendChild(ruheKnopf());
    wochenTeile.push(z); z(); return n;
  }
  /* Bestehende Kette der App (z. B. Glut-Kette) bekommt Schutzfeder und Ruhetag dazu */
  function ketteVerbinden() {
    var ch = document.querySelector(W.kette); if (!ch) return;
    var zeile = el('<div class="r8 r8-kettezeile"><span class="r8-st" aria-live="polite"></span></div>');
    zeile.appendChild(ruheKnopf());
    (W.zeileOrt ? W.zeileOrt(ch, zeile) : ch.after(zeile));
    var busy = false;
    function z() {
      if (busy) return; busy = true;
      try {
        var sp = [].slice.call(ch.children); if (sp.length < 7) return;
        sp = sp.slice(-7);
        var ext = function (d, i) { var x = sp[6 - i]; return !!(x && /\b(on|pearl)\b/.test(x.className)); };
        var r = reihe(ext);
        sp.forEach(function (x, i) {
          x.classList.toggle('r8-feder', r.s[i] === 'feder'); x.classList.toggle('r8-ruhe', r.s[i] === 'ruhe');
          var t = x.getAttribute('title') || ''; t = t.replace(/ · .*$/, '');
          if (r.s[i] === 'feder') x.setAttribute('title', t + ' · Schutzfeder'); else if (r.s[i] === 'ruhe') x.setAttribute('title', t + ' · Ruhetag'); else x.setAttribute('title', t);
        });
        zeile.querySelector('.r8-st').textContent = serieText(r);
      } finally { setTimeout(function () { busy = false; }, 0); }
    }
    new MutationObserver(function () { if (!busy) setTimeout(z, 0); }).observe(ch, { childList: true });
    wochenTeile.push(z); z();
  }

  /* ---------- Heute-Karte und Geschichte ---------- */
  var HG = C.heute || null;
  function heuteGeschichte() { var g = HG.geschichten; return g[(tagNr % g.length + g.length) % g.length]; }
  function ueberzeile() { return 'Heute · ' + WTL[jetzt.getDay()] + ', ' + jetzt.getDate() + '. ' + MON[jetzt.getMonth()]; }
  function lesen(g, quelleBild) {
    still();
    var html = '<div class="r8-lesen" aria-labelledby="r8-lh"><button type="button" class="r8-zu" aria-label="Schliessen">✕</button>' +
      '<img class="r8-bild" alt="' + esc(g.alt || '') + '" src="' + esc(g.bild) + '" style="object-position:' + esc(g.pos || '50% 40%') + '">' +
      '<div class="r8-in"><div class="r8-o">' + esc(HG.ueber || ueberzeile()) + '</div><h2 id="r8-lh" tabindex="-1">' + esc(g.titel) + '</h2>' +
      g.text.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      (g.frage ? '<div class="r8-frage"><b>' + (KIND ? '💭 Fantasie-Frage' : '💭 Für dich') + '</b>' + esc(g.frage) + '</div>' : '') +
      '<div class="r8-reihe">' + (kannReden() ? '<button type="button" class="r8-btn voll" data-a="hoer">🎧 Nur hören</button>' : '') +
      (!KIND ? '<button type="button" class="r8-btn" data-a="bild">🖼️ Als Bild teilen</button>' : '') +
      '<button type="button" class="r8-btn" data-a="zu">Schliessen</button></div></div></div>';
    var node = el(html), e;
    var bild = node.querySelector('.r8-bild');
    function auf() {
      if (quelleBild) quelleBild.style.viewTransitionName = '';
      bild.style.viewTransitionName = 'r8-bild';
      e = ebene(node, function () { still(); });
      setTimeout(function () { bild.style.viewTransitionName = ''; }, 600);
      node.querySelector('h2').focus({ preventScroll: true });
    }
    if (quelleBild && !reduziert && document.startViewTransition) { quelleBild.style.viewTransitionName = 'r8-bild'; wechsel(auf); } else auf();
    function zu() {
      if (quelleBild && !reduziert && document.startViewTransition) {
        bild.style.viewTransitionName = 'r8-bild';
        wechsel(function () { bild.style.viewTransitionName = ''; e.zu(); quelleBild.style.viewTransitionName = 'r8-bild'; });
        setTimeout(function () { quelleBild.style.viewTransitionName = ''; }, 600);
      } else e.zu();
    }
    node.addEventListener('click', function (v) {
      var b = v.target.closest('button'); if (!b) return;
      if (b.classList.contains('r8-zu') || b.getAttribute('data-a') === 'zu') zu();
      else if (b.getAttribute('data-a') === 'hoer') nurHoeren(g);
      else if (b.getAttribute('data-a') === 'bild') teilen({ titel: g.titel, text: g.text.join(' '), bild: g.bild });
    });
    var gel = hol('gelesen', []); if (gel.indexOf(g.titel) < 0) { gel.push(g.titel); leg('gelesen', gel.slice(-60)); }
    if (hol('heuteOffen', '') !== HEUTE) licht(1, 'heute'); leg('heuteOffen', HEUTE); markiere();
    if (HG.gelesen) try { HG.gelesen(g); } catch (x) {}
  }
  /* «🎧 Nur hören»: Bildschirm wird dunkel, die Handystimme liest */
  function nurHoeren(g) {
    var t = g.titel + '. ' + g.text.join(' ') + (g.frage ? ' ' + g.frage : '');
    var e = ebene(el('<div class="r8-menue" style="background:#02040a;-webkit-backdrop-filter:none;backdrop-filter:none" aria-label="Nur hören"><p style="margin:0;font-size:18px;color:#c3cae3;text-align:center;max-width:28ch">Augen zu, Ohren auf. ' + esc(F) + ' liest vor.</p><button type="button" class="r8-btn" style="width:120px;height:120px;border-radius:50%;font-size:44px" aria-label="Anhalten">⏸</button></div>'), function () { still(); });
    var b = e.el.querySelector('button'); b.onclick = e.zu; b.focus();
    sag(t, function () { setTimeout(function () { if (e.el.isConnected) e.zu(); }, 1500); });
  }
  function heuteKarte() {
    var g = heuteGeschichte();
    var b = el('<button type="button" class="r8 r8-heute" aria-haspopup="dialog"><img alt="" loading="lazy" decoding="async" src="' + esc(g.bild) + '" style="object-position:' + esc(g.pos || '50% 40%') + '"><span class="r8-o">' + esc(HG.ueber || ueberzeile()) + '</span><span class="r8-u"><small>' + (hol('heuteOffen', '') !== HEUTE ? '<span class="r8-punkt" aria-hidden="true"></span>' : '') + esc(HG.titel) + '</small><b>' + esc(g.titel) + '</b><small>' + esc(g.kurz || g.text[0].slice(0, 80) + ' …') + '</small></span></button>');
    b.setAttribute('aria-label', HG.titel + ': ' + g.titel + '. Antippen zum Lesen.');
    b.addEventListener('click', function () { var p = b.querySelector('.r8-punkt'); if (p) p.remove(); summ(6); lesen(g, b.querySelector('img')); });
    return b;
  }
  function postKnopf() {
    var g = heuteGeschichte();
    var b = el('<button type="button" class="r8-post" aria-haspopup="dialog" aria-label="' + esc(HG.titel + ': ' + g.titel) + '">' + (HG.emo || '📮') + '<i aria-hidden="true"></i></button>');
    var punkt = function () { b.querySelector('i').hidden = hol('heuteOffen', '') === HEUTE; }; punkt();
    b.addEventListener('click', function (e) { e.stopPropagation(); lesen(g, null); punkt(); });
    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    b.addEventListener('keydown', function (e) { e.stopPropagation(); });
    return b;
  }

  /* ---------- Story (Wochen-Rückblick) ---------- */
  function story(folien, titel, o) {
    o = o || {};
    if (!folien || !folien.length) return;
    still();
    var node = el('<div class="r8-story" aria-label="' + esc(titel || 'Rückblick') + '" aria-roledescription="Geschichte"><div class="r8-balken" aria-hidden="true">' + folien.map(function () { return '<i><b></b></i>'; }).join('') + '</div><div class="r8-kopf"><img alt="" src="' + esc(C.bild) + '"><span>' + esc(titel || F) + '</span><button type="button" aria-label="Schliessen" data-zu>✕</button></div><div class="r8-folie" aria-live="polite"></div></div>');
    var e = ebene(node, function () { cancelAnimationFrame(raf); }), fo = node.querySelector('.r8-folie'), bars = node.querySelectorAll('.r8-balken b');
    var i = 0, t0 = 0, pause = false, pz = 0, raf = 0, DAUER = KIND && !o.teilen ? 0 : 6500, gespielt = 0;
    function zeig(n) {
      i = Math.max(0, Math.min(folien.length - 1, n)); var f = folien[i];
      [].forEach.call(bars, function (b, j) { b.style.width = j < i ? '100%' : '0'; });
      fo.innerHTML = (f.bild ? '<img class="r8-fb" alt="" src="' + esc(f.bild) + '">' : '') + (f.zahl != null ? '<div class="r8-gz">' + esc(f.zahl) + '</div>' : '') + '<h3>' + esc(f.titel) + '</h3>' + (f.text ? '<p>' + esc(f.text) + '</p>' : '') +
        '<button type="button" class="r8-zone l" aria-label="Zurück"></button><button type="button" class="r8-zone r" aria-label="Weiter"></button>' +
        (i === folien.length - 1 ? '<div class="r8-reihe">' + (!KIND || o.teilen ? '<button type="button" class="r8-btn voll" data-a="bild">🖼️ Als Bild teilen</button>' : '') + '<button type="button" class="r8-btn" data-a="nochmal">↺ Nochmal</button><button type="button" class="r8-btn" data-zu>Fertig</button></div>' : '');
      if (!reduziert) { fo.classList.remove('r8-ein-folie'); void fo.offsetWidth; fo.classList.add('r8-ein-folie'); }
      t0 = performance.now(); gespielt = 0;
    }
    function lauf(ts) {
      if (!node.isConnected) return;
      if (DAUER && !pause) {
        var p = Math.min(1, (gespielt + ts - t0) / DAUER); if (bars[i]) bars[i].style.width = (p * 100) + '%';
        if (p >= 1 && i < folien.length - 1) zeig(i + 1);
      }
      raf = requestAnimationFrame(lauf);
    }
    node.addEventListener('click', function (v) {
      var b = v.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-zu')) e.zu();
      else if (b.classList.contains('l')) zeig(i - 1);
      else if (b.classList.contains('r')) { if (i < folien.length - 1) zeig(i + 1); }
      else if (b.getAttribute('data-a') === 'nochmal') zeig(0);
      else if (b.getAttribute('data-a') === 'bild') { var f0 = folien[0], fl = folien.map(function (f) { return (f.zahl != null ? f.zahl + ' ' : '') + f.titel; }).slice(1).join(' · '); teilen({ titel: titel || f0.titel, text: fl, bild: C.bild }); }
    });
    /* Halten = Pause, nach unten wischen = schliessen */
    var y0 = null, hold = 0;
    node.addEventListener('pointerdown', function (v) { y0 = v.clientY; hold = setTimeout(function () { pause = true; pz = performance.now(); }, 220); });
    node.addEventListener('pointerup', function (v) {
      clearTimeout(hold);
      if (pause) { pause = false; gespielt += pz - t0; t0 = performance.now(); v.preventDefault(); node.r8ignor = true; setTimeout(function () { node.r8ignor = false; }, 50); }
      if (y0 !== null && v.clientY - y0 > 90) e.zu(); y0 = null;
    });
    node.addEventListener('click', function (v) { if (node.r8ignor && v.target.closest('.r8-zone')) { v.stopImmediatePropagation(); } }, true);
    node.addEventListener('pointercancel', function () { clearTimeout(hold); pause = false; });
    node.addEventListener('keydown', function (v) { if (v.key === 'ArrowRight') { if (i < folien.length - 1) zeig(i + 1); } else if (v.key === 'ArrowLeft') zeig(i - 1); else if (v.key === ' ') { v.preventDefault(); pause = !pause; if (!pause) t0 = performance.now(); } });
    zeig(0); raf = requestAnimationFrame(lauf);
    node.querySelector('[data-zu]').focus();
  }

  /* ---------- iOS-Blatt mit Raststufen (halb / fast ganz) ---------- */
  function blatt(titel, inhalt, o) {
    o = o || {};
    var hin = el('<div class="r8-hinter" aria-hidden="true"></div>');
    var b = el('<div class="r8 r8-blatt" aria-labelledby="r8-bh"><div class="r8-griff"><h2 id="r8-bh" tabindex="-1"><span>' + titel + '</span><button type="button" class="r8-btn" data-zu>Fertig</button></h2></div><div class="r8-bi"></div></div>');
    b.querySelector('.r8-bi').appendChild(inhalt);
    var H0 = function () { return b.getBoundingClientRect().height || innerHeight * 0.92; };
    var stufen = [0.42, 0]; /* Anteil der Höhe, der nach unten verschoben ist */
    var s = o.oben ? 1 : 0, e;
    function setz(y, weich) { b.classList.toggle('zieht', !weich); b.style.transform = 'translateY(' + y + 'px)'; }
    function stufe(n) { s = n; setz(H0() * stufen[n], true); b.setAttribute('data-stufe', n ? 'oben' : 'mitte'); }
    document.body.appendChild(hin);
    e = ebene(b, function () { hin.remove(); if (o.zu) o.zu(); });
    requestAnimationFrame(function () { hin.classList.add('da'); stufe(s); });
    function weg() { hin.classList.remove('da'); setz(H0(), true); setTimeout(e.zu, reduziert ? 0 : 300); }
    hin.addEventListener('click', weg);
    b.querySelector('[data-zu]').onclick = weg;
    b.addEventListener('keydown', function (v) { if (v.key === 'Escape') { v.stopPropagation(); weg(); } }, true);
    var g = b.querySelector('.r8-griff'), y0 = null, basis = 0;
    g.addEventListener('pointerdown', function (v) { if (v.target.closest('button')) return; y0 = v.clientY; basis = H0() * stufen[s]; g.setPointerCapture(v.pointerId); });
    g.addEventListener('pointermove', function (v) { if (y0 === null) return; setz(Math.max(0, basis + v.clientY - y0), false); });
    function los(v) {
      if (y0 === null) return; var y = Math.max(0, basis + v.clientY - y0), h = H0(); y0 = null;
      if (y > h * 0.7) weg(); else stufe(y > h * 0.21 ? 0 : 1);
    }
    g.addEventListener('pointerup', los); g.addEventListener('pointercancel', los);
    setTimeout(function () { var f = inhalt.querySelector('input,textarea'); if (f && o.fokus) f.focus(); else b.querySelector('h2').focus({ preventScroll: true }); }, 60);
    return { el: b, zu: weg, stufe: stufe };
  }

  /* ---------- Figur: Streicheln (Wischen) und lange Drücken (Kontextmenü) ---------- */
  function herzen(x, y, n, emo) {
    if (reduziert) return;
    for (var i = 0; i < n; i++) {
      var h = el('<span class="r8-herz" aria-hidden="true">' + (emo || '💛') + '</span>');
      h.style.left = (x - 11 + (i - (n - 1) / 2) * 18) + 'px'; h.style.top = (y - 10) + 'px'; h.style.setProperty('--dx', ((i - (n - 1) / 2) * 24) + 'px'); h.style.animationDelay = (i * 120) + 'ms';
      document.body.appendChild(h); setTimeout(function (hh) { return function () { hh.remove(); }; }(h), 1600);
    }
  }
  function figurVerbinden() {
    var S = C.streicheln, M = KIND ? null : C.menue;
    if (!S && !M) return;
    var gebunden = new WeakSet();
    function binde(z) {
      if (!z || gebunden.has(z)) return; gebunden.add(z);
      z.classList.add('r8-streichel');
      z.addEventListener('dragstart', function (v) { v.preventDefault(); });
      var x0 = 0, y0 = 0, weg = 0, lx = 0, ly = 0, t0 = 0, aktiv = false, bewegt = false, lp = 0, zuletzt = 0;
      z.addEventListener('pointerdown', function (v) {
        if (v.button > 0) return;
        aktiv = true; bewegt = false; x0 = lx = v.clientX; y0 = ly = v.clientY; weg = 0; t0 = Date.now();
        clearTimeout(lp);
        if (M) lp = setTimeout(function () { if (aktiv && !bewegt) { aktiv = false; menue(z, v.clientX, v.clientY); } }, 520);
      });
      z.addEventListener('pointermove', function (v) {
        if (!aktiv) return;
        var dx = v.clientX - lx, dy = v.clientY - ly; lx = v.clientX; ly = v.clientY;
        weg += Math.abs(dx) + Math.abs(dy) * 0.5;
        if (Math.abs(v.clientX - x0) + Math.abs(v.clientY - y0) > 12) { bewegt = true; clearTimeout(lp); }
        if (S && weg > 150 && Date.now() - t0 < 2500 && Date.now() - zuletzt > 2200) { zuletzt = Date.now(); weg = 0; t0 = Date.now(); streichle(z, v.clientX, v.clientY); }
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { z.addEventListener(n, function () { aktiv = false; clearTimeout(lp); }); });
      /* Nach dem Streicheln oder Menü kein zusätzliches Antippen auslösen */
      z.addEventListener('click', function (v) { if (bewegt || z.r8menue) { v.stopImmediatePropagation(); v.preventDefault(); bewegt = false; z.r8menue = false; } }, true);
      z.addEventListener('contextmenu', function (v) { v.preventDefault(); if (M && !document.querySelector('.r8-menue')) { var r = z.getBoundingClientRect(); menue(z, r.left + r.width / 2, r.top + r.height / 2); } });
      if (M) z.addEventListener('keydown', function (v) { if (v.key === 'ContextMenu' || (v.shiftKey && v.key === 'F10')) { v.preventDefault(); menue(z); } });
    }
    function streichle(z, x, y) {
      var n = hol('streichel', 0) + 1; leg('streichel', n);
      var satz = S.saetze[n % S.saetze.length];
      try { S.blase(satz); } catch (e) {}
      var a = S.wackel ? document.querySelector(S.wackel) || z : z;
      if (!reduziert) { a.classList.remove('r8-wohl'); void a.offsetWidth; a.classList.add('r8-wohl'); setTimeout(function () { a.classList.remove('r8-wohl'); }, 900); }
      herzen(x, y, 3, S.emo);
      summ([8, 30, 8]);
      if (n === 10) feier(null, F + ' wurde schon zehn Mal gestreichelt. Danke!');
    }
    function menue(z, x, y) {
      z.r8menue = true; setTimeout(function () { z.r8menue = false; }, 900);
      summ(14);
      var pk = M.punkte(H8);
      var node = el('<div class="r8-menue" aria-label="' + esc(F) + ': Möglichkeiten"><img alt="" src="' + esc(M.bild || C.bild) + '" class="r8-ein-menue"><ul class="r8-ein-menue">' + pk.map(function (p, i) { return '<li><button type="button" data-i="' + i + '"><span>' + esc(p[1]) + '</span><span aria-hidden="true">' + p[0] + '</span></button></li>'; }).join('') + '</ul></div>');
      var e = ebene(node);
      node.addEventListener('click', function (v) {
        var b = v.target.closest('[data-i]'); if (!b) { if (v.target === node || v.target.tagName === 'IMG') e.zu(); return; }
        e.zu(); try { pk[+b.getAttribute('data-i')][2](); } catch (x) {}
      });
      var f = node.querySelector('button'); if (f) f.focus();
    }
    function suche() { var z = document.querySelector((S || M).ziel); if (z) binde(z); }
    suche();
    if ((S || M).neu) new MutationObserver(function () { suche(); }).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- Tastaturkürzel (nur Erwachsenen-Apps) ---------- */
  function kuerzel() {
    if (KIND || !C.kuerzel) return;
    var L = C.kuerzel;
    document.addEventListener('keydown', function (v) {
      if (v.metaKey || v.ctrlKey || v.altKey || v.defaultPrevented) return;
      var t = v.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (offen.length) return;
      if (v.key === '?') { v.preventDefault(); hilfe(); return; }
      var k = L[v.key.toLowerCase()]; if (k) { v.preventDefault(); k[1](); }
    });
    function hilfe() {
      var node = el('<div class="r8-menue" aria-label="Tastaturkürzel"><div class="r8-karte" style="max-width:420px;width:100%"><h2>⌨️ Tastaturkürzel</h2><div class="r8-kz">' + Object.keys(L).map(function (k) { return '<kbd>' + esc(k.toUpperCase()) + '</kbd><span>' + esc(L[k][0]) + '</span>'; }).join('') + '<kbd>?</kbd><span>Diese Hilfe</span><kbd>Esc</kbd><span>Schliessen</span></div><div class="r8-reihe"><button type="button" class="r8-btn voll">Alles klar</button></div></div></div>');
      var e = ebene(node); node.querySelector('button').onclick = e.zu; node.addEventListener('click', function (v) { if (v.target === node) e.zu(); }); node.querySelector('button').focus();
    }
  }

  /* ---------- «Wächst mit dir» (Vorbild Finch): Lichter, Stufen, Ausflug, Album ---------- */
  var WX = C.wachsen || null;
  var wachsKarten = [];
  function lichter() { return hol('licht', 0); }
  /* Fundstück-Bild (wachsen/fund-NN.jpg), Emoji als Ersatz, wenn das Bild fehlt oder nicht lädt */
  function fundIcon(i, f, px) {
    if (!WX.fundBilder) return f[0];
    var n = i + 1; return '<img class="r8-fundbild" data-e="' + esc(f[0]) + '" alt="" width="' + px + '" height="' + px + '" src="wachsen/fund-' + (n < 10 ? '0' : '') + n + '.jpg" style="width:min(' + px + 'px,26vh);height:min(' + px + 'px,26vh);border-radius:22%;object-fit:cover;display:block;margin:0 auto">';
  }
  document.addEventListener('error', function (v) { var t = v.target; if (t && t.classList && t.classList.contains('r8-fundbild')) { var sp = document.createElement('span'); sp.textContent = t.dataset.e || ''; t.replaceWith(sp); } }, true);
  function stufeVon(n) { var s = 0; WX.stufen.forEach(function (x, i) { if (n >= x[0]) s = i; }); return s; }
  function licht(n, grund) {
    if (!WX) return;
    var heuteZ = hol('lichtTag', {}); if (heuteZ.d !== HEUTE) heuteZ = { d: HEUTE, n: 0 };
    if (heuteZ.n >= (WX.max || 12)) return;
    n = Math.min(n || 1, (WX.max || 12) - heuteZ.n); heuteZ.n += n; leg('lichtTag', heuteZ);
    var vor = lichter(), nach = vor + n; leg('licht', nach); leg('schrittTag', HEUTE);
    markiere();
    var sv = stufeVon(vor), sn = stufeVon(nach);
    wachsAlle();
    if (sn > sv) setTimeout(function () { aufstieg(sn); }, 500);
    else lichtToast(n);
  }
  var ltEl = null, ltT = 0;
  function lichtToast(n) {
    if (!ltEl) { ltEl = el('<div class="r8-rueck r8-toastwachs" role="status" aria-live="polite" style="padding:10px 18px;pointer-events:none"><span></span></div>'); document.body.appendChild(ltEl); }
    ltEl.querySelector('span').textContent = '+' + n + ' ' + WX.emo + ' ' + (n === 1 ? WX.licht1 : WX.licht) + ' für ' + F + ' (' + lichter() + ')';
    ltEl.classList.add('da'); clearTimeout(ltT); ltT = setTimeout(function () { ltEl.classList.remove('da'); }, 1800);
  }
  function aufstieg(s) {
    var st = WX.stufen[s];
    var e = ebene(el('<div class="r8-menue" aria-label="' + esc(F) + ' ist gewachsen"><img alt="" src="' + esc(st[2] || C.bild) + '" class="r8-ein-menue"><div class="r8-karte r8-ein-menue" style="max-width:360px;text-align:center"><h2>' + esc(F) + ' ist gewachsen</h2><p style="font-size:20px;font-weight:800;margin:0 0 8px">Stufe ' + (s + 1) + ': ' + esc(st[1]) + '</p><p>' + esc(st[3] || 'Danke, dass du dabei bist.') + '</p><div class="r8-reihe" style="justify-content:center"><button type="button" class="r8-btn voll">Schön!</button></div></div></div>'));
    e.el.querySelector('button').onclick = e.zu; e.el.querySelector('button').focus(); summ([10, 40, 10, 40, 20]);
  }
  function fundIndex() { var a = hol('album', []), alle = WX.funde.map(function (_, i) { return i; }).filter(function (i) { return !a.some(function (x) { return x.i === i; }); }); return alle.length ? alle[(tagNr % alle.length)] : tagNr % WX.funde.length; }
  function ausflugStatus() {
    var a = hol('ausflug', null);
    if (a && a.d === HEUTE) { if (a.zurueck) return 'fertig'; return Date.now() - a.t >= (WX.dauer || 20000) ? 'zurueck' : 'unterwegs'; }
    return hol('schrittTag', '') === HEUTE ? 'bereit' : 'warten';
  }
  function fundZeigen(i, neu) {
    var f = WX.funde[i];
    var e = ebene(el('<div class="r8-menue" aria-label="Fundstück"><div class="r8-karte r8-ein-menue" style="max-width:400px;width:100%;text-align:center"><img alt="" src="' + esc(WX.ausflugBild || C.bild) + '" style="width:min(120px,20vh);height:min(120px,20vh);border-radius:50%;object-fit:cover;border:3px solid var(--r7-gold,#f2c14e)"><div style="font-size:56px;line-height:1.2;margin:8px 0" aria-hidden="true">' + fundIcon(i, f, 168) + '</div><h2 style="text-align:center">' + (neu ? esc(F) + ' bringt mit: ' : '') + esc(f[1]) + '</h2><p style="font-size:17px;line-height:1.55">' + esc(f[2]) + '</p><div class="r8-reihe" style="justify-content:center">' + (kannReden() ? '<button type="button" class="r8-btn" data-a="hoer">🔊 Vorlesen</button>' : '') + '<button type="button" class="r8-btn voll" data-a="zu">' + (neu ? 'Ins Album legen' : 'Schliessen') + '</button></div></div></div>'), function () { still(); });
    e.el.addEventListener('click', function (v) { var b = v.target.closest('[data-a]'); if (!b) { if (v.target === e.el) e.zu(); return; } if (b.getAttribute('data-a') === 'hoer') sag(f[1] + '. ' + f[2]); else e.zu(); });
    e.el.querySelector('[data-a=zu]').focus();
  }
  function ausflugKlick() {
    var s = ausflugStatus();
    if (s === 'warten') { toast(WX.wartenText || ('Mach heute einen kleinen Schritt, dann geht ' + F + ' auf Ausflug.')); return; }
    if (s === 'bereit') { leg('ausflug', { d: HEUTE, t: Date.now(), i: fundIndex() }); toast(F + ' ' + (WX.los || 'ist unterwegs. Bis gleich!')); wachsAlle(); return; }
    if (s === 'unterwegs') { toast(F + ' ist noch unterwegs. Gleich zurück.'); return; }
    var a = hol('ausflug', {});
    if (s === 'zurueck') { a.zurueck = true; leg('ausflug', a); var al = hol('album', []); if (!al.some(function (x) { return x.i === a.i; })) { al.push({ i: a.i, d: HEUTE }); leg('album', al); } wachsAlle(); fundZeigen(a.i, true); return; }
    fundZeigen(a.i, false);
  }
  function album() {
    var al = hol('album', []);
    var node = el('<div class="r8-menue" aria-label="Sammelalbum"><div class="r8-karte" style="max-width:440px;width:100%;max-height:86vh;overflow:auto"><h2>📒 ' + esc(WX.albumTitel || ('Fundstücke von ' + F)) + '</h2><p class="r8-leise">' + al.length + ' von ' + WX.funde.length + ' gesammelt. Jeden Tag kann ein neues dazukommen.</p><div class="r8-album">' +
      WX.funde.map(function (f, i) { var h = al.filter(function (x) { return x.i === i; })[0]; return h ? '<button type="button" data-i="' + i + '" aria-label="' + esc(f[1]) + '"><span aria-hidden="true">' + fundIcon(i, f, 56) + '</span><small>' + esc(f[1]) + '</small></button>' : '<span class="r8-zu-finden" aria-hidden="true">?</span>'; }).join('') +
      '</div><div class="r8-reihe"><button type="button" class="r8-btn voll" data-z>Schliessen</button></div></div></div>');
    var e = ebene(node);
    node.addEventListener('click', function (v) { var b = v.target.closest('[data-i]'); if (b) { fundZeigen(+b.getAttribute('data-i'), false); return; } if (v.target.closest('[data-z]') || v.target === node) e.zu(); });
    node.querySelector('[data-z]').focus();
  }
  function wachsKarte() {
    var n = el('<section class="r8 r8-karte r8-wachs" aria-labelledby="r8-wx-h"><div class="r8-wk"><img alt="" src="' + esc(C.bild) + '"><div><small>🌱 Wächst mit dir</small><h2 id="r8-wx-h"></h2><span class="r8-leise r8-wx-z"></span></div></div>' +
      '<div class="r8-wbar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i></i></div><ol class="r8-wst" aria-hidden="true"></ol>' +
      '<div class="r8-reihe"><button type="button" class="r8-btn voll" data-a="aus"></button><button type="button" class="r8-btn" data-a="album"></button></div><p class="r8-leise r8-wx-t" style="margin-top:8px"></p></section>');
    var tick = 0;
    function z() {
      var L = lichter(), s = stufeVon(L), st = WX.stufen[s], nx = WX.stufen[s + 1];
      n.querySelector('img').src = st[2] || C.bild;
      n.querySelector('h2').textContent = 'Stufe ' + (s + 1) + ': ' + st[1];
      n.querySelector('.r8-wx-z').textContent = WX.emo + ' ' + L + ' ' + (L === 1 ? WX.licht1 : WX.licht) + (nx ? ' · noch ' + (nx[0] - L) + ' bis «' + nx[1] + '»' : ' · höchste Stufe erreicht');
      var p = nx ? Math.round((L - st[0]) / (nx[0] - st[0]) * 100) : 100;
      n.querySelector('.r8-wbar i').style.width = p + '%'; n.querySelector('.r8-wbar').setAttribute('aria-valuenow', p); n.querySelector('.r8-wbar').setAttribute('aria-label', 'Fortschritt bis zur nächsten Stufe: ' + p + ' Prozent');
      n.querySelector('.r8-wst').innerHTML = WX.stufen.map(function (x, i) { return '<li class="' + (i <= s ? 'an' : '') + '"></li>'; }).join('');
      var as = ausflugStatus(), b = n.querySelector('[data-a=aus]'), a = hol('ausflug', {});
      var rest = Math.max(0, Math.ceil(((WX.dauer || 20000) - (Date.now() - (a.t || 0))) / 1000));
      b.textContent = as === 'bereit' ? '🎒 Ausflug starten' : as === 'unterwegs' ? '🎒 Unterwegs … ' + rest + ' s' : as === 'zurueck' ? '🎁 ' + F + ' ist zurück!' : as === 'fertig' ? '🎁 Heutiges Fundstück' : '🎒 Ausflug (nach einem Schritt)';
      b.classList.toggle('voll', as === 'bereit' || as === 'zurueck');
      n.querySelector('[data-a=album]').textContent = '📒 Album (' + hol('album', []).length + ')';
      n.querySelector('.r8-wx-t').textContent = as === 'warten' ? (WX.wartenText || 'Jeder kleine Schritt gibt ein Licht. Nichts geht verloren, kein Druck.') : as === 'fertig' ? 'Morgen geht ' + F + ' wieder auf Ausflug.' : (WX.satz || 'Jeder kleine Schritt gibt ein Licht. Nichts geht verloren.');
      clearTimeout(tick); if (as === 'unterwegs') tick = setTimeout(z, 1000);
    }
    n.addEventListener('click', function (v) { var b = v.target.closest('[data-a]'); if (!b) return; if (b.getAttribute('data-a') === 'aus') ausflugKlick(); else album(); });
    wachsKarten.push(z); z(); return n;
  }
  function wachsPill() {
    var b = el('<button type="button" class="r8 r8-wachspill"></button>');
    function z() { var L = lichter(), s = stufeVon(L), st = WX.stufen[s], nx = WX.stufen[s + 1], p = nx ? Math.round((L - st[0]) / (nx[0] - st[0]) * 100) : 100, as = ausflugStatus();
      b.innerHTML = '<span aria-hidden="true">' + WX.emo + '</span>' + L + ' · ' + esc(st[1]) + ' <i aria-hidden="true"><b style="width:' + p + '%"></b></i>' + (as === 'bereit' || as === 'zurueck' ? ' <span aria-hidden="true">' + (as === 'zurueck' ? '🎁' : '🎒') + '</span>' : '');
      b.setAttribute('aria-label', 'Wächst mit dir: ' + L + ' ' + WX.licht + ', Stufe ' + (s + 1) + ' ' + st[1] + '. Öffnen.'); }
    b.onclick = function () { if (WX.pillKlick) WX.pillKlick(H8); };
    wachsKarten.push(z); z(); return b;
  }
  function wachsAlle() { wachsKarten.forEach(function (f) { try { f(); } catch (e) {} }); }
  function schritteVerbinden() {
    if (!WX) return;
    var RX = /(fertig|erledigt|geschafft|speichern|sichern|eintragen|gemacht|abhaken|✓)/i;
    document.addEventListener('click', function (v) {
      var b = v.target.closest && v.target.closest('button,a,[role=button]'); if (!b || b.closest('.r8-ebene,.r8-wachs,.r8-blatt')) return;
      if ((WX.schritte && b.matches(WX.schritte)) || (!WX.ohneText && RX.test((b.textContent || '').trim().slice(0, 40)))) {
        var k = 'w' + (b.id || (b.textContent || '').trim().slice(0, 20)), g = hol('gezaehlt', {}); if (g.d !== HEUTE) g = { d: HEUTE };
        g[k] = (g[k] || 0) + 1; leg('gezaehlt', g); if (g[k] <= 3) licht(1, k);
      }
    }, true);
    var r = R7(); if (r && r.feier) { var alt = r.feier; r.feier = function (k, t) { alt(k, t); licht(1, 'feier'); }; }
  }

  /* ---------- SOS: sofort eine Minute ruhig werden (Vorbild Headspace) ---------- */
  function sos() {
    still(); summ(10);
    var X = C.sos || {};
    var node = el('<div class="r8-menue r8-sos" style="background:#060b1f;color:#F1ECE2;-webkit-backdrop-filter:none;backdrop-filter:none" aria-label="Eine Minute ruhig werden"><div class="r8-sosk"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92" stroke="rgba(255,255,255,.12)"></circle><circle class="r8-sosr" cx="100" cy="100" r="92" stroke="#f2c14e" stroke-dasharray="578" stroke-dashoffset="0"></circle></svg><img alt="" src="' + esc(X.bild || C.bild) + '"></div><p class="r8-sosa" aria-live="polite" style="font-size:24px;font-weight:800;margin:0">Einatmen …</p><p class="r8-leise r8-sosz" style="margin:0;color:rgba(241,236,226,.72)">60 Sekunden</p>' + (X.notruf ? '<p style="margin:0;font-size:15px;color:#ffd0d0">' + X.notruf + '</p>' : '') + '<button type="button" class="r8-btn">Fertig</button></div>');
    var t0 = Date.now(), raf = 0, aus = false, img = node.querySelector('img'), an = node.querySelector('.r8-sosa'), zz = node.querySelector('.r8-sosz'), ring = node.querySelector('.r8-sosr');
    var e = ebene(node, function () { aus = true; cancelAnimationFrame(raf); });
    node.querySelector('button').onclick = function () { e.zu(); };
    function f() {
      if (aus) return; var s = (Date.now() - t0) / 1000;
      if (s >= 60) { an.textContent = X.ende || 'Gut gemacht. Eine Minute nur für dich.'; zz.textContent = ''; img.style.transform = 'scale(1)'; ring.setAttribute('stroke-dashoffset', '578'); licht(1, 'sos'); return; }
      var z = s % 10, ein = z < 4, q = ein ? z / 4 : 1 - (z - 4) / 6;
      an.textContent = ein ? 'Einatmen …' : 'Langsam ausatmen …';
      if (!reduziert) img.style.transform = 'scale(' + (0.85 + 0.2 * q).toFixed(3) + ')';
      ring.setAttribute('stroke-dashoffset', (578 * s / 60).toFixed(1)); zz.textContent = Math.ceil(60 - s) + ' Sekunden';
      raf = requestAnimationFrame(f);
    }
    raf = requestAnimationFrame(f); node.querySelector('button').focus();
  }
  function sosKnopf() {
    var b = el('<button type="button" class="r8 r8-sosb" aria-label="SOS: sofort eine Minute ruhig werden"><span aria-hidden="true">🫧</span><span><b>SOS · 1 Minute</b><small>Sofort ruhig atmen mit ' + esc(F) + '</small></span></button>');
    b.onclick = sos; return b;
  }

  function karte(id, titel, inhalt) {
    var r = R7(); if (r && r.karte) { var k = r.karte('r8' + id, titel, inhalt); k.classList.add('r8'); return k; }
    return el('<section class="r8 r8-karte" aria-labelledby="r8h-' + id + '"><h2 id="r8h-' + id + '">' + titel + '</h2>' + inhalt + '</section>');
  }

  var H8 = { C: C, hol: hol, leg: leg, esc: esc, el: el, sag: sag, still: still, kannReden: kannReden, toast: toast, feier: feier, summ: summ, rueck: rueck, teilen: teilen, story: story, blatt: blatt, wechsel: wechsel, ebene: ebene, karte: karte, markiere: markiere, reihe: function () { return reihe(W && W.extern); }, tage: tage, datum: datum, tagVor: tagVor, HEUTE: HEUTE, tagNr: tagNr, reduziert: reduziert, KIND: KIND, F: F, herzen: herzen,
    lesenHeute: function () { if (HG) lesen(heuteGeschichte(), null); }, heuteGeschichte: function () { return HG && heuteGeschichte(); }, WT: WT, WTL: WTL };
  H8.licht = licht; H8.sos = sos; H8.album = function () { if (WX) album(); }; H8.lichter = lichter; H8.stufe = function () { return WX ? WX.stufen[stufeVon(lichter())] : null; };
  window.R8 = H8;


  /* Maskottchen: kleines rundes Icon statt dunkler Pose im Kopf und in der Begrüssung (nur Erwachsenen-Apps) */
  function maskottchen() {
    var M = C.maskottchen; if (!M) return;
    var wenn = M.wenn ? new RegExp(M.wenn) : null, plan = 0;
    function setz() {
      plan = 0;
      document.querySelectorAll(M.ziele).forEach(function (im) {
        var s = im.getAttribute('src') || '';
        if (s === M.bild || (wenn && !wenn.test(s))) return;
        im.setAttribute('src', M.bild); im.classList.add('r8-maskottchen'); im.classList.remove('echt');
        if (im.dataset.pose) im.removeAttribute('data-pose');
        if (im.dataset.basis) im.dataset.basis = M.bild;
        if (im.dataset.grundbild) im.dataset.grundbild = M.bild;
      });
    }
    setz();
    try { new MutationObserver(function () { if (!plan) plan = requestAnimationFrame(setz); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] }); } catch (e) {}
  }
  function start() {
    var N = {};
    try { var r7 = R7(); if (r7 && r7.voll && !r7.voll.r8) { var alt = r7.voll; r7.voll = function (h, z) { var v = alt(h, z); try { if (!v.el.getAttribute('aria-label')) v.el.setAttribute('aria-label', F); } catch (e) {} return v; }; r7.voll.r8 = true; } } catch (e) {}
    try { offline(); } catch (e) {}
    if (WX) { try { N.wachsen = wachsKarte(); if (WX.pill) N.wachspill = wachsPill(); } catch (e) { if (window.console) console.warn('Runde 8 wachsen', e); } }
    if (C.sos) { try { N.sos = sosKnopf(); } catch (e) {} }
    if (HG) { try { if (HG.post) N.post = postKnopf(); else N.heute = heuteKarte(); } catch (e) { if (window.console) console.warn('Runde 8 heute', e); } }
    if (W && !W.kette) { try { N.woche = wocheKarte(H8); } catch (e) { if (window.console) console.warn('Runde 8 woche', e); } }
    (C.funktionen || []).forEach(function (f) { try { var n = f.bau(H8); if (n) { N[f.id] = n; n.setAttribute('data-r8', f.id); } } catch (e) { if (window.console) console.warn('Runde 8', f.id, e); } });
    try { C.einsetzen(N, H8); } catch (e) { if (window.console) console.warn('Runde 8 einsetzen', e); }
    if (W && W.kette) { var v = 0; (function warte() { if (document.querySelector(W.kette) && document.querySelector(W.kette).children.length) ketteVerbinden(); else if (v++ < 50) setTimeout(warte, 200); })(); }
    try { maskottchen(); } catch (e) { if (window.console) console.warn('Runde 8 Maskottchen', e); }
    try { figurVerbinden(); } catch (e) { if (window.console) console.warn('Runde 8 Figur', e); }
    try { kuerzel(); } catch (e) {}
    try { schritteVerbinden(); } catch (e) {}
    if (C.markiereBeiKlick) {
      var einmal = function (v) { if (v.target.closest && v.target.closest('button,a,[role=button]') && !v.target.closest('.r8-ebene')) { if (markiere()) document.removeEventListener('click', einmal, true); } };
      if (tage()[HEUTE] !== 'da') document.addEventListener('click', einmal, true);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 30); });
  else setTimeout(start, 30);
})();
