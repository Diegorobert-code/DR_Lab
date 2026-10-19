/* Jackie's Advice · Schutzraum «Wenn es zuhause nicht sicher ist»
   Grundsatz: Die gefährlichste Person sieht vielleicht das Handy.
   - Ohne Konto, ohne Anmeldung, ohne Netz (feste Texte, keine KI, keine Server-Anfrage).
   - Speichert NICHTS: kein localStorage, kein Verlauf, keine Lern-Zahlen. Eingaben leben nur im Arbeitsspeicher.
   - Schnellausstieg: ein Knopf oben rechts (kein Schütteln, Entscheid Diego 14.10.), Escape am Computer.
     Ersetzt die Seite sofort durch ein Rezept (location.replace), «Zurück» führt nicht in den Hilfebereich.
   - Notrufe 117/144/112 ein Tipp, kein Zwischenschritt.
   Nummern Stand Oktober 2026 (Konzept apps/jackie/konzept-frauenhilfe-2026-10-14.md), vor Release neu prüfen. */
(function () {
  'use strict';
  var GEPRUEFT = 'Oktober 2026';
  var app = function () { return window.JackieApp || null; };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- Schnellausstieg ---------- */
  function verlassen() {
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
    try { if (window.NovaStimme) NovaStimme.stopp(); } catch (e) {}
    // Inhalt sofort weg (nicht nur verstecken), dann harmlose Seite ohne neuen Verlaufseintrag.
    var s = $('vSchutz'); if (s) s.innerHTML = '';
    document.title = "Jackie's Advice – Rezepte";
    document.body.className = 'jk-weg';
    document.body.innerHTML = '<div style="min-height:100vh;background:#fffaf2"></div>';
    try { location.replace('rezept.html'); } catch (e) { location.href = 'rezept.html'; }
  }
  window.jackieVerlassen = verlassen;
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('im-schutz')) verlassen();
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#jkExit')) { e.preventDefault(); verlassen(); }
  }, true);

  /* App-Umschalter: Hilfe-Inhalt verdecken, sobald die App in den Hintergrund geht. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && document.body.classList.contains('im-schutz')) {
      var c = $('jkCover'); if (c) c.classList.add('on');
    }
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#jkCoverGo')) { var c = $('jkCover'); if (c) c.classList.remove('on'); }
  });

  /* ---------- Bausteine ---------- */
  var ANRUFLISTE = '<p class="sz-hint">Der Anruf steht danach in deiner Anrufliste. Lösche ihn, wenn das für dich sicherer ist.</p>';
  function ruf(nr, tel, name, sub, notruf) {
    return '<a class="sz-call' + (notruf ? ' notruf' : '') + '" href="tel:' + tel + '"><span><b>' + esc(name) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span><strong>' + esc(nr) + '</strong></a>';
  }
  function karte(titel, inner, cls) { return '<div class="sz-card' + (cls ? ' ' + cls : '') + '">' + (titel ? '<h3>' + esc(titel) + '</h3>' : '') + inner + '</div>'; }
  function weiter(text) { return '<p class="sz-weiter">' + text + '</p>'; }
  var BERATUNG = weiter('Lass dich beraten: <a href="tel:142">142 Opferhilfe</a>, rund um die Uhr, gratis und vertraulich.');
  var TUER = '<svg class="sz-tuer" viewBox="0 0 120 150" aria-hidden="true"><defs><radialGradient id="szGlow" cx="50%" cy="55%" r="60%"><stop offset="0" stop-color="#ffe7a3" stop-opacity=".95"/><stop offset="1" stop-color="#f2c14e" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="80" rx="58" ry="70" fill="url(#szGlow)"/><path d="M30 140V48a30 30 0 0 1 60 0v92z" fill="#1b2a63" stroke="#f2c14e" stroke-width="3"/><path d="M38 140V52a22 22 0 0 1 44 0v88z" fill="#f6d98a"/><circle cx="74" cy="98" r="3.5" fill="#a8792a"/><path d="M18 140h84" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/></svg>';

  /* ---------- Seiten ---------- */
  var SEITEN = [
    { id: 'sofort', name: 'Sofort' },
    { id: 'check', name: 'Bin ich betroffen?' },
    { id: 'hilfe', name: 'Hilfe finden' },
    { id: 'plan', name: 'Sicherheitsplan' },
    { id: 'tasche', name: 'Notfalltasche' },
    { id: 'rechte', name: 'Deine Rechte' },
    { id: 'kinder', name: 'Kinder' },
    { id: 'angehoerige', name: 'Für Angehörige' }
  ];

  function seiteSofort() {
    return '<div class="sz-intro">' + TUER + '<div><h2>Du bist nicht allein.</h2><p>Du entscheidest, was du tust. Hier sind Menschen, die dir zuhören und helfen, gratis und vertraulich.</p></div></div>' +
      '<h3 class="sz-h">Jetzt in Gefahr</h3>' +
      ruf('117', '117', 'Polizei', 'Gewalt, Drohung, jemand ist in Gefahr', true) +
      ruf('144', '144', 'Sanität', 'Verletzung, Atemnot, Bewusstlosigkeit', true) +
      ruf('112', '112', 'Euronotruf', 'Europaweit', true) +
      '<h3 class="sz-h">Reden, rund um die Uhr</h3>' +
      ruf('142', '142', 'Opferhilfe Schweiz', 'Gratis, vertraulich, auch für Angehörige. Kein Notruf.') +
      ruf('143', '143', 'Die Dargebotene Hand', 'Anonym, wenn alles zu viel ist') +
      ANRUFLISTE +
      karte('Wenn du nicht sprechen kannst',
        '<ul class="sz-list"><li>Ruf 117 trotzdem an. Wenn es geht, sag leise nur deine Adresse.</li>' +
        '<li>Bitte eine Nachbarin, eine Freundin oder jemanden in der Nähe, für dich anzurufen.</li>' +
        '<li>Zeig das stille Handzeichen (unten). Viele Menschen kennen es.</li>' +
        '<li>Mach ein Codewort mit einer Vertrauensperson ab. Wenn du es schickst, ruft sie die Polizei.</li></ul>') +
      karte('Das stille Handzeichen «Signal for Help»', handzeichen() + '<p class="sz-klein">Hand zeigen, Daumen in die Handfläche legen, Finger darüber schliessen. Wer es sieht, kann für dich Hilfe holen.</p>') +
      karte('Frauenhaus', '<p>Frauenhäuser nehmen dich und deine Kinder auf, auch mitten in der Nacht. Die Adressen sind geheim, damit du dort sicher bist. Die Opferhilfe (<a href="tel:142">142</a>) vermittelt dir einen Platz.</p>');
  }

  function handzeichen() {
    var hand = function (stufe) {
      var finger = stufe === 3
        ? '<rect x="22" y="40" width="56" height="24" rx="12" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/>'
        : '<rect x="24" y="10" width="11" height="40" rx="5.5" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/><rect x="37" y="4" width="11" height="46" rx="5.5" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/><rect x="50" y="6" width="11" height="44" rx="5.5" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/><rect x="63" y="14" width="11" height="36" rx="5.5" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/>';
      var daumen = stufe === 1
        ? '<rect x="4" y="48" width="26" height="12" rx="6" transform="rotate(-35 17 54)" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/>'
        : '<rect x="30" y="56" width="30" height="11" rx="5.5" fill="#e9bf98" stroke="#7a4b2a" stroke-width="2.5"/>';
      return '<svg viewBox="0 0 100 110" aria-hidden="true"><rect x="22" y="44" width="56" height="58" rx="18" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/>' + (stufe === 3 ? '' : daumen) + finger + (stufe === 3 ? daumen : '') + '</svg>';
    };
    return '<div class="sz-hand"><figure>' + hand(1) + '<figcaption>1 · Hand zeigen</figcaption></figure><figure>' + hand(2) + '<figcaption>2 · Daumen einklappen</figcaption></figure><figure>' + hand(3) + '<figcaption>3 · Finger schliessen</figcaption></figure></div>';
  }

  /* Bin ich betroffen? – nichts wird gespeichert, Ergebnis nur auf dem Bildschirm */
  var FRAGEN = [
    { q: 'Hast du manchmal Angst vor deinem Partner, deiner Partnerin, deinem Ex oder jemandem zuhause?', art: 'angst' },
    { q: 'Wirst du beschimpft, kleingemacht oder vor anderen lächerlich gemacht?', art: 'psychisch' },
    { q: 'Kontrolliert jemand dein Handy, dein Geld oder mit wem du dich triffst?', art: 'kontrolle' },
    { q: 'Wurdest du gestossen, geschlagen, gewürgt oder festgehalten?', art: 'koerper', ernst: true },
    { q: 'Wirst du zu Sex oder sexuellen Handlungen gedrängt oder gezwungen?', art: 'sexuell' },
    { q: 'Droht dir jemand, deinen Kindern, deinen Tieren, oder damit, sich selbst etwas anzutun?', art: 'drohung', ernst: true }
  ];
  var antworten = [];
  function seiteCheck() {
    var i = antworten.length;
    if (i >= FRAGEN.length) return checkErgebnis();
    var f = FRAGEN[i];
    return '<p class="sz-klein">Sechs kurze Fragen. Es gibt kein richtig oder falsch. Nichts wird gespeichert.</p>' +
      '<div class="sz-prog"><i style="width:' + Math.round(i / FRAGEN.length * 100) + '%"></i></div>' +
      karte('Frage ' + (i + 1) + ' von ' + FRAGEN.length, '<p class="sz-frage">' + esc(f.q) + '</p>' +
        '<div class="sz-opts"><button type="button" data-ant="ja">Ja</button><button type="button" data-ant="manchmal">Manchmal</button><button type="button" data-ant="nein">Nein</button><button type="button" data-ant="weiss">Ich weiss nicht</button></div>') +
      (i > 0 ? '<button type="button" class="sz-link" data-ant="zurueck">Eine Frage zurück</button>' : '');
  }
  function checkErgebnis() {
    var ja = [], ernst = false;
    antworten.forEach(function (a, k) { if (a === 'ja' || a === 'manchmal') { ja.push(FRAGEN[k].art); if (FRAGEN[k].ernst) ernst = true; } });
    var html = '';
    if (!ja.length) {
      html += karte('Danke, dass du hingeschaut hast.', '<p>Aus deinen Antworten lese ich keine Gewalt heraus. Wenn du dir trotzdem Sorgen machst, ist das Grund genug, mit jemandem zu reden. Dein Gefühl zählt.</p>');
    } else {
      html += karte('Was du beschreibst, kann Gewalt sein.', '<p>Gewalt hat viele Formen: Worte, Kontrolle, Geld, Drohungen, Schläge, Sex gegen deinen Willen. <b>Du bist nicht schuld.</b> Niemand hat das Recht, dir Angst zu machen.</p><p>Du musst heute nichts entscheiden. Reden hilft, und es kostet nichts.</p>', 'gold');
      if (ernst) html += karte('Das ist ernst.', '<p>Schläge, Würgen und Drohungen sind gefährlich, auch wenn man danach nichts sieht. Nach einem Würgen bitte ärztlich anschauen lassen. Wenn du jetzt in Gefahr bist: <a href="tel:117">117</a>.</p>', 'rot');
    }
    html += ruf('142', '142', 'Opferhilfe Schweiz', 'Rund um die Uhr, gratis, vertraulich') + ANRUFLISTE;
    html += '<div class="sz-row"><button type="button" class="sz-btn" data-geh="plan">Sicherheitsplan ansehen</button><button type="button" class="sz-btn soft" data-ant="neu">Nochmals</button></div>';
    html += '<p class="sz-klein">Dieses Ergebnis ist keine Diagnose und wird nicht gespeichert.</p>';
    return html;
  }

  function seiteHilfe() {
    return karte('Opferhilfe – der erste Anruf', '<p>Die Opferhilfe berät dich gratis und vertraulich, auch ohne Anzeige bei der Polizei. Sie hilft dir weiter: Frauenhaus, Ärztin, Anwältin, Geld für das Nötigste.</p>' + ruf('142', '142', 'Opferhilfe Schweiz', '24 Stunden, ganze Schweiz')) +
      karte('Frauenhaus', '<p>Ein sicherer Ort für dich und deine Kinder. Die Adressen sind geheim. Den Platz vermittelt dir die Opferhilfe (142) oder die Polizei (117).</p>') +
      karte('Beratung in deinem Kanton', '<p>Jeder Kanton hat Opferberatungsstellen. Das offizielle Verzeichnis:</p><a class="sz-web" href="https://www.opferhilfe-schweiz.ch" target="_blank" rel="noopener noreferrer">opferhilfe-schweiz.ch · Beratungsstellen nach Kanton</a><p class="sz-klein">Eine Website bleibt im Browser-Verlauf. Lösche ihn danach, wenn nötig.</p>') +
      karte('Sexuelle Gewalt (Zürich)', ruf('044 291 46 46', '0442914646', 'Frauenberatung sexuelle Gewalt', 'Kantonal anerkannte Beratung, Bürozeiten')) +
      karte('Wenn alles zu viel ist', ruf('143', '143', 'Die Dargebotene Hand', 'Anonym, Tag und Nacht') + ruf('0848 35 45 55', '0848354555', 'Elternnotruf', '24 Stunden, für Eltern in Krisen')) +
      ANRUFLISTE + '<p class="sz-klein">Nummern geprüft: ' + GEPRUEFT + '.</p>';
  }

  /* Sicherheitsplan: Felder nur im Arbeitsspeicher, Ausdrucken möglich */
  var PLAN = [
    { t: 'Wer hilft mir?', x: 'Eine Person, der du vertraust: Freundin, Nachbarin, Schwester, Kollegin.', f: 'Name und Nummer (auswendig oder auf Papier)' },
    { t: 'Unser Codewort', x: 'Ein harmloses Wort. Wenn du es schickst oder sagst, ruft sie die Polizei.', f: 'z. B. «Hast du noch Mehl?»' },
    { t: 'Wohin kann ich gehen?', x: 'Zu einer Vertrauensperson, ins Frauenhaus (über 142) oder an einen belebten Ort.', f: 'Ort' },
    { t: 'Mein Weg nach draussen', x: 'Welche Tür, welcher Ausgang? Bei Streit eher weg von Küche und Bad, dort gibt es harte Kanten und Messer.', f: 'Weg' },
    { t: 'Was ich mitnehme', x: 'Ausweise, Geld, Medikamente, Handy und Ladekabel. Siehe Notfalltasche.' },
    { t: 'Meine Kinder', x: 'Ein sicherer Raum, ein Satz für den Notfall: «Lauf zu Frau …» oder «Ruf 117». Kinder nie zwischen euch stellen.' },
    { t: 'Meine Tiere', x: 'Wer könnte sie aufnehmen? Manche Frauenhäuser helfen auch dabei, frag bei 142.' },
    { t: 'Mein Handy', x: 'Standort-Freigaben und geteilte Konten prüfen, Code ändern, Anrufliste und Verlauf löschen, wenn nötig.' }
  ];
  var planWerte = {};
  function seitePlan() {
    var html = '<p class="sz-klein">Schritt für Schritt, in deinem Tempo. <b>Nichts davon wird gespeichert.</b> Wenn du die Seite schliesst, ist alles weg. Du kannst ihn ausdrucken und sicher aufbewahren.</p>';
    PLAN.forEach(function (p, k) {
      html += '<div class="sz-card sz-step"><span class="sz-nr">' + (k + 1) + '</span><div><h3>' + esc(p.t) + '</h3><p>' + esc(p.x) + '</p>' +
        (p.f ? '<input type="text" class="sz-in" data-plan="' + k + '" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(p.f) + '" value="' + esc(planWerte[k] || '') + '">' : '') + '</div></div>';
    });
    html += '<div class="sz-row"><button type="button" class="sz-btn" data-druck="1">Ausdrucken</button><button type="button" class="sz-btn soft" data-planleer="1">Alles leeren</button></div>' + BERATUNG;
    return html;
  }

  var TASCHE = ['Ausweis, Pass, Aufenthaltsbewilligung', 'Krankenkassenkarte', 'Medikamente und Rezepte', 'Bargeld, Bankkarte', 'Handy und Ladekabel', 'Haus- und Autoschlüssel', 'Wichtige Nummern auf Papier', 'Kopien: Mietvertrag, Geburtsurkunden, Familienbüchlein', 'Arztberichte, Fotos, Nachrichten als Beweis', 'Kleider für zwei Tage', 'Für die Kinder: Lieblingskuscheltier, Schulsachen'];
  var taschePack = {};
  function seiteTasche() {
    var html = '<p class="sz-klein">Eine kleine Tasche, die bereit ist. Am sichersten bei einer Vertrauensperson. Die Häkchen werden nicht gespeichert.</p><div class="sz-card">';
    TASCHE.forEach(function (t, k) {
      html += '<label class="sz-check"><input type="checkbox" data-tasche="' + k + '"' + (taschePack[k] ? ' checked' : '') + '><span>' + esc(t) + '</span></label>';
    });
    var n = Object.keys(taschePack).filter(function (k) { return taschePack[k]; }).length;
    html += '</div><p class="sz-klein" id="szTascheZahl">' + n + ' von ' + TASCHE.length + ' bereit.</p>' + BERATUNG;
    return html;
  }

  function seiteRechte() {
    return '<p class="sz-klein">Kurz und allgemein für die Schweiz. Das ist keine Rechtsberatung. Was in deinem Fall gilt, sagt dir eine Beratungsstelle.</p>' +
      karte('Beratung ohne Anzeige', '<p>Die Opferhilfe berät dich gratis und vertraulich. Du musst dafür keine Anzeige machen.</p>') +
      karte('Hilfe bei Kosten', '<p>Die Opferhilfe kann helfen, wenn Kosten anfallen: Unterkunft, Ärztin, Therapie, Anwältin. Frag nach, was in deinem Fall möglich ist.</p>') +
      karte('Wegweisung und Kontaktverbot', '<p>Die Polizei kann eine gewalttätige Person für einige Tage aus der Wohnung weisen. Ein Gericht kann Kontakt- und Annäherungsverbote anordnen. Die Regeln sind je nach Kanton verschieden.</p>') +
      karte('Die Polizei ermittelt oft von sich aus', '<p>Viele Formen von Gewalt in der Partnerschaft verfolgt die Polizei auch ohne deine Anzeige. Lass dich vorher beraten, wenn du unsicher bist.</p>') +
      karte('Spuren sichern', '<p>Lass Verletzungen ärztlich festhalten, auch wenn du (noch) keine Anzeige willst. Bewahre Nachrichten und Fotos an einem sicheren Ort auf.</p>') +
      karte('Aufenthalt', '<p>Ist deine Aufenthaltsbewilligung an die Ehe gebunden? Für Betroffene von häuslicher Gewalt gibt es besondere Regeln. Bitte lass dich beraten, bevor du etwas entscheidest.</p>') +
      BERATUNG;
  }

  function seiteKinder() {
    return karte('Kinder erleben Gewalt mit', '<p>Auch wenn sie nicht selbst geschlagen werden, spüren Kinder Angst und Streit. Das ist nicht deine Schuld. Hilfe für dich ist auch Hilfe für sie.</p>') +
      karte('Was Kindern hilft', '<ul class="sz-list"><li>Ein sicherer Raum und ein Satz für den Notfall.</li><li>Ihnen sagen: «Es ist nicht deine Schuld.»</li><li>Sie nie als Botin oder Bote zwischen euch schicken.</li></ul>') +
      ruf('147', '147', 'Pro Juventute', 'Für Kinder und Jugendliche, Tag und Nacht') +
      ruf('142', '142', 'Opferhilfe Schweiz', 'Berät auch Kinder und Eltern') +
      ruf('117', '117', 'Polizei', 'Wenn ein Kind in Gefahr ist', true) + ANRUFLISTE;
  }

  function seiteAngehoerige() {
    return '<p class="sz-klein">Du machst dir Sorgen um eine Freundin, Schwester, Tochter oder Nachbarin?</p>' +
      karte('So hilfst du, ohne sie zu gefährden', '<ul class="sz-list"><li>Zuhören und glauben. Sag: «Ich bin da. Du bist nicht schuld.»</li><li>Nicht drängen. Sie entscheidet, wann und wie.</li><li>Die Person, die Gewalt ausübt, nicht selbst zur Rede stellen. Das kann es gefährlicher machen.</li><li>Ein Codewort anbieten und erreichbar bleiben.</li><li>Keine Nachrichten über Gewalt auf ihr Handy schicken. Lieber persönlich reden.</li></ul>') +
      karte('Auch du darfst Hilfe holen', '<p>Die Opferhilfe berät auch Angehörige.</p>' + ruf('142', '142', 'Opferhilfe Schweiz', 'Gratis, vertraulich')) +
      karte('Bei akuter Gefahr', ruf('117', '117', 'Polizei', 'Ruf an, wenn du Schreie oder Schläge hörst', true)) + ANRUFLISTE;
  }

  var RENDER = { sofort: seiteSofort, check: seiteCheck, hilfe: seiteHilfe, plan: seitePlan, tasche: seiteTasche, rechte: seiteRechte, kinder: seiteKinder, angehoerige: seiteAngehoerige };
  var aktuell = 'sofort';

  function gerueste() {
    var box = $('vSchutz'); if (!box) return null;
    if (!box.dataset.bereit) {
      box.innerHTML =
        '<div class="sz-akut"><b>Akute Gefahr?</b> <a href="tel:117">117 anrufen</a></div>' +
        '<div class="sz-kopf"><img src="figur.jpg" alt="" class="sz-jackie"><div><span class="sz-eyebrow">Wenn es zuhause nicht sicher ist</span><p class="sz-satz">Ich bin da. Du entscheidest, was du tust. Meine Schuhe bringen dich nicht weg von allem, sondern zur nächsten sicheren Tür.</p></div></div>' +
        '<nav class="sz-tabs" aria-label="Bereiche">' + SEITEN.map(function (s) { return '<button type="button" data-sz="' + s.id + '">' + esc(s.name) + '</button>'; }).join('') + '</nav>' +
        '<div id="szInhalt" class="sz-inhalt" aria-live="polite"></div>' +
        '<p class="sz-fuss">Ohne Konto. Ohne Anmeldung. Diese Seiten speichern nichts und funktionieren auch ohne Internet.<br>Jackie ersetzt keine Beratung. Die Fachstellen gehen den Weg mit dir.</p>' +
        '<button type="button" class="sz-zurueck" data-home>Zurück zum Familienalltag</button>';
      box.dataset.bereit = '1';
      box.addEventListener('click', klick);
      box.addEventListener('input', eingabe);
      box.addEventListener('change', eingabe);
    }
    return box;
  }
  function zeige(id) {
    aktuell = RENDER[id] ? id : 'sofort';
    var box = gerueste(); if (!box) return;
    $('szInhalt').innerHTML = RENDER[aktuell]();
    box.querySelectorAll('.sz-tabs button').forEach(function (b) {
      var an = b.dataset.sz === aktuell; b.classList.toggle('an', an); b.setAttribute('aria-current', an ? 'page' : 'false');
      if (an && b.scrollIntoView) try { b.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {}
    });
  }
  function klick(e) {
    var t = e.target.closest('button,a'); if (!t) return;
    if (t.dataset.sz) { zeige(t.dataset.sz); window.scrollTo(0, 0); return; }
    if (t.dataset.geh) { zeige(t.dataset.geh); window.scrollTo(0, 0); return; }
    if (t.dataset.ant) {
      if (t.dataset.ant === 'zurueck') antworten.pop();
      else if (t.dataset.ant === 'neu') antworten = [];
      else antworten.push(t.dataset.ant);
      zeige('check'); return;
    }
    if (t.dataset.druck) { try { window.print(); } catch (x) {} return; }
    if (t.dataset.planleer) { planWerte = {}; zeige('plan'); return; }
  }
  function eingabe(e) {
    var t = e.target;
    if (t.dataset.plan !== undefined) planWerte[t.dataset.plan] = t.value;
    if (t.dataset.tasche !== undefined) {
      taschePack[t.dataset.tasche] = t.checked;
      var n = Object.keys(taschePack).filter(function (k) { return taschePack[k]; }).length;
      var z = $('szTascheZahl'); if (z) z.textContent = n + ' von ' + TASCHE.length + ' bereit.';
    }
  }

  window.JackieSchutz = {
    open: function (id) {
      var a = app();
      zeige(id || 'sofort');
      if (a) a.show('vSchutz'); else { var b = $('vSchutz'); if (b) b.classList.remove('hide'); }
    },
    // Gefahrenwörter, die direkt in den Schutzraum führen (Gewalt zuhause, Drohung, Waffen)
    gefahr: function (text) {
      var t = ' ' + String(text || '').toLowerCase().replace(/[.,!?;:«»"()]/g, ' ').replace(/\s+/g, ' ') + ' ';
      var W = ['schlägt mich', 'schlug mich', 'hat mich geschlagen', 'mich geschlagen', 'schlägt uns', 'tritt mich', 'würgt', 'gewürgt', 'würgen',
        'droht mir', 'bedroht mich', 'droht uns', 'bedroht uns', 'mit dem messer', 'mit einem messer', 'pistole', 'umbringen', 'bringt mich um', 'mich töten',
        'vergewaltig', 'zum sex gezwungen', 'zwingt mich', 'sperrt mich ein', 'eingesperrt', 'häusliche gewalt', 'gewalt zuhause',
        'gewalt zu hause', 'angst vor meinem mann', 'angst vor meinem partner', 'angst vor meinem freund', 'angst vor ihm', 'angst vor meinem ex',
        'stalkt', 'stalking', 'verfolgt mich', 'frauenhaus', 'opferhilfe'];
      return W.some(function (w) { return t.indexOf(w) > -1; });
    },
    vergessen: function () { antworten = []; planWerte = {}; taschePack = {}; var s = $('szInhalt'); if (s) s.innerHTML = ''; }
  };
})();
