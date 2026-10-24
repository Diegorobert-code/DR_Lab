/* Jackie's Advice · Runde 4 «Sicher unterwegs» und «Notruf immer sichtbar»
   Vorbilder: bSafe (Scheinanruf), Noonlight / Hollie Guard (Begleit-Timer, Standort für den Notruf).
   Grundsatz wie im Schutzraum: speichert NICHTS (kein localStorage), kein Server, keine Nachricht an Dritte.
   Eine SMS an die Vertrauensperson schreibt die Nutzerin selbst in ihrer Nachrichten-App (sms:-Link).
   Notrufnummern bleiben immer sichtbar: die feste Leiste oben liegt über jedem Blatt dieses Moduls. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var leiste = $('jkStickyNr'), home = document.querySelector('.jk-notruf');
  var blattOffen = false;

  /* ---------- Notruf-Leiste: erscheint, sobald die grossen Nummern nicht mehr sichtbar sind ---------- */
  var homeSichtbar = true;
  function leisteSetzen() {
    if (!leiste) return;
    var schutz = document.body.classList.contains('im-schutz');
    var vHome = $('vHome'), aufHome = vHome && !vHome.classList.contains('hide');
    var an = schutz || blattOffen || !homeSichtbar || !aufHome;
    leiste.classList.toggle('an', an);
    leiste.setAttribute('aria-hidden', an ? 'false' : 'true');
    leiste.querySelectorAll('a').forEach(function (a) { a.tabIndex = an ? 0 : -1; });
    document.body.classList.toggle('nr-fest', an && !aufHome && !schutz);
    document.body.classList.toggle('uw-offen', blattOffen);
  }
  if (home && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { homeSichtbar = es[0].isIntersecting; leisteSetzen(); }, { threshold: 0.6 }).observe(home);
  } else { homeSichtbar = false; }
  var mo = new MutationObserver(leisteSetzen); mo.observe(document.body, { attributes: true, attributeFilter: ['class'] }); if ($('vHome')) mo.observe($('vHome'), { attributes: true, attributeFilter: ['class'] });
  var st = document.createElement('style');
  st.textContent = 'body.nr-fest .wrap{padding-top:calc(66px + var(--sat))}body.uw-offen .nova-pille,body.uw-offen .nova-btn,body.uw-offen #fbBtn{display:none!important}' +
    '.uw-veil{position:fixed;inset:0;z-index:60;background:rgba(5,10,30,.55);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s}' +
    '.uw-veil.an{opacity:1}' +
    '.uw-blatt{width:100%;max-width:560px;max-height:calc(100% - 70px - env(safe-area-inset-top,0px));overflow-y:auto;background:#101a42;color:#f3ece4;border-radius:26px 26px 0 0;border:1px solid rgba(242,193,78,.35);border-bottom:0;padding:10px 18px calc(22px + env(safe-area-inset-bottom,0px));transform:translateY(30px);transition:transform .25s cubic-bezier(.22,.8,.26,1);box-shadow:0 -20px 60px rgba(0,0,0,.45)}' +
    '.uw-veil.an .uw-blatt{transform:none}' +
    '.uw-griff{width:40px;height:5px;border-radius:3px;background:rgba(255,255,255,.3);margin:0 auto 12px}' +
    '.uw-kopf{display:flex;align-items:center;gap:10px;margin-bottom:6px}.uw-kopf h2{flex:1;margin:0;font:600 22px/1.25 var(--serif);color:#f2c14e}' +
    '.uw-zu{width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:transparent;color:#f3ece4;font-size:18px;cursor:pointer}' +
    '.uw-lead{margin:0 0 14px;font-size:15px;line-height:1.45;color:#c9c3d8}' +
    '.uw-karte{display:flex;gap:14px;align-items:center;width:100%;text-align:left;padding:14px;margin:0 0 10px;min-height:64px;border-radius:18px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:inherit;font:inherit;cursor:pointer}' +
    '.uw-karte b{display:block;font-size:17px}.uw-karte small{display:block;font-size:14px;line-height:1.35;color:#b9b3c9}' +
    '.uw-karte .ic{flex:none;width:44px;height:44px;border-radius:14px;display:grid;place-items:center;font-size:22px;background:rgba(242,193,78,.16)}' +
    '.uw-reihe{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 14px}' +
    '.uw-chip{min-height:44px;padding:0 16px;border-radius:22px;border:1px solid rgba(242,193,78,.5);background:transparent;color:#f6d98a;font:600 15px var(--sans);cursor:pointer}' +
    '.uw-chip[aria-pressed=true]{background:#f2c14e;color:#1a1430;border-color:#f2c14e}' +
    '.uw-feld{width:100%;min-height:48px;border-radius:14px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;font:16px var(--sans);padding:0 14px;margin:6px 0 4px}' +
    '.uw-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:52px;border-radius:16px;border:0;background:#f2c14e;color:#1a1430;font:700 17px var(--sans);cursor:pointer;text-decoration:none;margin-top:8px}' +
    '.uw-btn.sanft{background:rgba(255,255,255,.08);color:#f3ece4;border:1px solid rgba(255,255,255,.2)}' +
    '.uw-btn.rot{background:#c8443a;color:#fff}' +
    '.uw-label{font-size:14px;color:#b9b3c9;margin:4px 2px 0}' +
    '.uw-gross{font:600 30px/1.2 var(--sans);letter-spacing:.5px;color:#fff;text-align:center;margin:10px 0 2px;font-variant-numeric:tabular-nums}' +
    '.uw-klein{font-size:14px;color:#b9b3c9;text-align:center;margin:0 0 6px}' +
    '.uw-hinweis{font-size:14px;line-height:1.45;color:#c9c3d8;background:rgba(91,141,239,.14);border-radius:14px;padding:10px 12px;margin:12px 0 0}' +
    '.uw-timer{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:55;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 16px;border-radius:26px;background:#101a42;border:1px solid rgba(242,193,78,.6);color:#f6d98a;font:600 15px var(--sans);box-shadow:0 10px 30px rgba(0,0,0,.4);max-width:calc(100% - 120px);white-space:nowrap}' +
    '.uw-timer button{min-height:36px;padding:0 12px;border-radius:18px;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;font:600 14px var(--sans);cursor:pointer}' +
    /* Scheinanruf: sieht aus wie ein Anruf, unten bleibt ein kleiner Notruf-Knopf */
    '.uw-anruf{position:fixed;inset:0;z-index:2147483600;background:linear-gradient(180deg,#2b3550 0%,#141a2b 100%);color:#fff;display:flex;flex-direction:column;align-items:center;padding:calc(70px + env(safe-area-inset-top,0px)) 24px calc(28px + env(safe-area-inset-bottom,0px));font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif}' +
    '.uw-anruf .wer{font-size:34px;font-weight:400;margin:0}.uw-anruf .was{font-size:17px;opacity:.75;margin:6px 0 0}' +
    '.uw-anruf .knoepfe{margin-top:auto;display:flex;justify-content:space-around;width:100%;max-width:320px}' +
    '.uw-anruf .rk{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:14px;background:none;border:0;color:#fff;cursor:pointer}' +
    '.uw-anruf .rk span{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;font-size:30px}' +
    '.uw-anruf .ab span{background:#eb4d3d}.uw-anruf .an span{background:#34c759}' +
    '.uw-anruf .not{margin-top:22px;color:#ff9f95;font-size:15px;text-decoration:none;border:1px solid rgba(255,159,149,.5);border-radius:20px;padding:10px 18px;min-height:44px}' +
    '@media (prefers-reduced-motion:reduce){.uw-veil,.uw-blatt{transition:none}}';
  document.head.appendChild(st);

  /* ---------- Blatt ---------- */
  var veil = null;
  function zu() {
    if (!veil) return; var v = veil; veil = null; blattOffen = false; leisteSetzen();
    v.classList.remove('an'); setTimeout(function () { v.remove(); }, 220);
    var b = $('btnUnterwegs'); if (b) b.focus();
  }
  function blatt(titel, lead, inhalt) {
    if (veil) { veil.remove(); veil = null; }
    veil = document.createElement('div'); veil.className = 'uw-veil';
    veil.innerHTML = '<div class="uw-blatt" role="dialog" aria-modal="true" aria-label="' + titel + '"><div class="uw-griff"></div>' +
      '<div class="uw-kopf"><h2>' + titel + '</h2><button class="uw-zu" type="button" aria-label="Schliessen">✕</button></div>' +
      (lead ? '<p class="uw-lead">' + lead + '</p>' : '') + '<div class="uw-inhalt"></div></div>';
    veil.querySelector('.uw-inhalt').appendChild(inhalt);
    veil.addEventListener('click', function (e) { if (e.target === veil) zu(); });
    veil.querySelector('.uw-zu').onclick = zu;
    document.body.appendChild(veil); blattOffen = true; leisteSetzen();
    requestAnimationFrame(function () { veil && veil.classList.add('an'); });
    setTimeout(function () { var z = veil && veil.querySelector('.uw-zu'); if (z) z.focus(); }, 60);
  }
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && veil) zu(); });
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d; }

  function uebersicht() {
    var d = el(
      '<button class="uw-karte" type="button" data-w="anruf"><span class="ic">📞</span><span><b>Scheinanruf</b><small>Dein Handy klingelt, als würde dich jemand anrufen. So kommst du aus einer unangenehmen Lage.</small></span></button>' +
      '<button class="uw-karte" type="button" data-w="timer"><span class="ic">⏱️</span><span><b>Begleit-Timer</b><small>Auf dem Heimweg: Jackie fragt nach, ob du gut angekommen bist.</small></span></button>' +
      '<button class="uw-karte" type="button" data-w="ort"><span class="ic">📍</span><span><b>Wo bin ich?</b><small>Dein Standort gross zum Vorlesen am Notruf, oder als SMS an deine Vertrauensperson.</small></span></button>' +
      '<p class="uw-hinweis">Nichts davon wird gespeichert oder verschickt. Jackie ersetzt keinen Notruf: In Gefahr immer <a href="tel:117" style="color:#ffb3aa">117</a>.</p>');
    d.querySelectorAll('[data-w]').forEach(function (b) {
      b.onclick = function () { ({ anruf: anrufBlatt, timer: timerBlatt, ort: ortBlatt })[b.getAttribute('data-w')](); };
    });
    blatt('Sicher unterwegs', 'Drei kleine Helfer für unterwegs. Alles bleibt auf deinem Handy.', d);
  }

  /* ---------- Scheinanruf (Vorbild bSafe «Fake Call») ---------- */
  var anrufName = 'Mama', anrufIn = 0, anrufT = null, ton = null;
  function anrufBlatt() {
    var d = el(
      '<label class="uw-label" for="uwName">Wer ruft an?</label><input class="uw-feld" id="uwName" maxlength="24" autocomplete="off" value="' + anrufName.replace(/"/g, '&quot;') + '">' +
      '<div class="uw-reihe" role="group" aria-label="Wann">' +
      ['Sofort:0', 'In 10 Sekunden:10', 'In 1 Minute:60'].map(function (x) { var p = x.split(':'); return '<button type="button" class="uw-chip" data-s="' + p[1] + '" aria-pressed="' + (+p[1] === anrufIn) + '">' + p[0] + '</button>'; }).join('') +
      '</div><button class="uw-btn" type="button" id="uwAnrufGo">📞 Anruf vorbereiten</button>' +
      '<p class="uw-hinweis">Tipp: Danach den Bildschirm einfach anlassen oder das Handy in die Tasche stecken. Unten auf dem Anruf bleibt immer «Notruf 117».</p>');
    d.querySelectorAll('.uw-chip').forEach(function (c) {
      c.onclick = function () { anrufIn = +c.getAttribute('data-s'); d.querySelectorAll('.uw-chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); }); };
    });
    d.querySelector('#uwAnrufGo').onclick = function () {
      anrufName = (d.querySelector('#uwName').value || 'Mama').trim().slice(0, 24) || 'Mama';
      tonVorbereiten(); zu(); clearTimeout(anrufT);
      if (anrufIn) { timerChip('Anruf in ' + anrufIn + ' s', function () { clearTimeout(anrufT); }); anrufT = setTimeout(function () { chipWeg(); klingeln(); }, anrufIn * 1000); }
      else klingeln();
    };
    blatt('Scheinanruf', 'Wähle, wer anruft und wann. Nichts wird gespeichert.', d);
  }
  function tonVorbereiten() { try { ton = ton || new (window.AudioContext || window.webkitAudioContext)(); if (ton.state === 'suspended') ton.resume(); } catch (e) { ton = null; } }
  var klingelI = null;
  function klingelTon() {
    if (!ton) return;
    var t0 = ton.currentTime;
    [0, 0.45].forEach(function (o) {
      [880, 660].forEach(function (f, i) {
        var osc = ton.createOscillator(), g = ton.createGain(); osc.type = 'sine'; osc.frequency.value = f;
        var s = t0 + o + i * 0.12; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.18, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.3);
        osc.connect(g).connect(ton.destination); osc.start(s); osc.stop(s + 0.32);
      });
    });
  }
  function klingeln() {
    var a = document.createElement('div'); a.className = 'uw-anruf'; a.setAttribute('role', 'dialog'); a.setAttribute('aria-label', 'Eingehender Anruf');
    var name = anrufName.replace(/[&<>"]/g, '');
    a.innerHTML = '<p class="wer">' + name + '</p><p class="was">mobil</p>' +
      '<div class="knoepfe"><button class="rk ab" type="button"><span>✕</span>Ablehnen</button><button class="rk an" type="button"><span>📞</span>Annehmen</button></div>' +
      '<a class="not" href="tel:117">Notruf 117</a>';
    document.body.appendChild(a);
    function stillen() { clearInterval(klingelI); klingelI = null; try { navigator.vibrate && navigator.vibrate(0); } catch (e) {} }
    klingelTon(); klingelI = setInterval(function () { klingelTon(); try { navigator.vibrate && navigator.vibrate([400, 200, 400]); } catch (e) {} }, 2000);
    try { navigator.vibrate && navigator.vibrate([400, 200, 400]); } catch (e) {}
    var lauf = null;
    a.querySelector('.ab').onclick = function () { stillen(); clearInterval(lauf); a.remove(); };
    a.querySelector('.an').onclick = function () {
      stillen(); var s = 0;
      a.querySelector('.was').textContent = '00:00';
      a.querySelector('.knoepfe').innerHTML = '<button class="rk ab" type="button"><span>✕</span>Beenden</button>';
      lauf = setInterval(function () { s++; a.querySelector('.was').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 1000);
      a.querySelector('.ab').onclick = function () { clearInterval(lauf); a.remove(); };
    };
  }

  /* ---------- Begleit-Timer (Vorbild Noonlight / Hollie Guard, ohne Server) ---------- */
  var timerEnde = 0, timerI = null, chip = null;
  function timerChip(text, abbruch) {
    chipWeg();
    chip = document.createElement('div'); chip.className = 'uw-timer'; chip.setAttribute('role', 'status');
    chip.innerHTML = '<span class="t"></span><button type="button">Stopp</button>';
    chip.querySelector('.t').textContent = text;
    chip.querySelector('button').onclick = function () { abbruch && abbruch(); chipWeg(); };
    document.body.appendChild(chip);
  }
  function chipWeg() { if (chip) { chip.remove(); chip = null; } clearInterval(timerI); timerI = null; }
  function timerBlatt() {
    var d = el(
      '<p class="uw-label">Wie lange bist du unterwegs?</p><div class="uw-reihe" role="group" aria-label="Dauer">' +
      [10, 20, 30, 60].map(function (m) { return '<button type="button" class="uw-chip" data-m="' + m + '" aria-pressed="' + (m === 20) + '">' + m + ' Min.</button>'; }).join('') +
      '</div><button class="uw-btn" type="button" id="uwTimerGo">Timer starten</button>' +
      '<p class="uw-hinweis">Lass diese Seite offen. Wenn die Zeit um ist, klingelt es leise und Jackie fragt: «Bist du gut angekommen?» Dann hast du 117 und deine Vertrauensperson mit einem Tipp. Jackie meldet sich bei niemandem von selbst.</p>');
    var min = 20;
    d.querySelectorAll('.uw-chip').forEach(function (c) {
      c.onclick = function () { min = +c.getAttribute('data-m'); d.querySelectorAll('.uw-chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); }); };
    });
    d.querySelector('#uwTimerGo').onclick = function () {
      tonVorbereiten(); zu(); timerEnde = Date.now() + min * 60000;
      timerChip('', function () { timerEnde = 0; });
      var tick = function () {
        if (!chip) return; var r = Math.max(0, timerEnde - Date.now());
        chip.querySelector('.t').textContent = '⏱️ Unterwegs · ' + Math.floor(r / 60000) + ':' + String(Math.floor(r / 1000) % 60).padStart(2, '0');
        if (r <= 0) { chipWeg(); angekommen(); }
      };
      tick(); timerI = setInterval(tick, 1000);
      if (window.JackieWinke) window.JackieWinke(false);
    };
    blatt('Begleit-Timer', 'Jackie begleitet dich in Gedanken nach Hause.', d);
  }
  function angekommen() {
    klingelTon(); try { navigator.vibrate && navigator.vibrate([300, 150, 300]); } catch (e) {}
    var d = el(
      '<button class="uw-btn" type="button" id="uwOk">💛 Ja, ich bin gut angekommen</button>' +
      '<button class="uw-btn sanft" type="button" id="uwMehr">Noch 10 Minuten</button>' +
      '<a class="uw-btn sanft" id="uwSms" href="#">✉️ Vertrauensperson schreiben</a>' +
      '<a class="uw-btn rot" href="tel:117">📞 117 Polizei anrufen</a>');
    d.querySelector('#uwOk').onclick = function () { zu(); if (window.JackieWinke) window.JackieWinke(true); };
    d.querySelector('#uwMehr').onclick = function () {
      zu(); timerEnde = Date.now() + 600000; timerChip('', function () { timerEnde = 0; });
      timerI = setInterval(function () { if (!chip) return; var r = Math.max(0, timerEnde - Date.now()); chip.querySelector('.t').textContent = '⏱️ Unterwegs · ' + Math.floor(r / 60000) + ':' + String(Math.floor(r / 1000) % 60).padStart(2, '0'); if (r <= 0) { chipWeg(); angekommen(); } }, 1000);
    };
    d.querySelector('#uwSms').href = smsLink('Kannst du mich bitte kurz anrufen? Ich bin noch unterwegs.');
    blatt('Bist du gut angekommen?', 'Die Zeit ist um. Alles in Ordnung bei dir?', d);
  }

  /* ---------- Wo bin ich? (Standort nur auf dem Bildschirm) ---------- */
  function smsLink(text) { return 'sms:?&body=' + encodeURIComponent(text); }
  function ortBlatt() {
    var d = el(
      '<button class="uw-btn" type="button" id="uwOrtGo">📍 Standort jetzt anzeigen</button>' +
      '<div id="uwOrt" aria-live="polite"></div>' +
      '<p class="uw-hinweis">Dein Handy fragt einmal um Erlaubnis. Der Standort erscheint nur hier auf dem Bildschirm und wird nirgends gespeichert.</p>');
    var box = d.querySelector('#uwOrt');
    d.querySelector('#uwOrtGo').onclick = function () {
      if (!navigator.geolocation) { box.innerHTML = '<p class="uw-hinweis">Dieses Gerät kann den Standort hier nicht zeigen. Sag am Telefon, was du siehst: Strasse, Laden, Haltestelle.</p>'; return; }
      box.innerHTML = '<p class="uw-klein" style="margin-top:12px">Ich suche dich …</p>';
      navigator.geolocation.getCurrentPosition(function (p) {
        var lat = p.coords.latitude.toFixed(5), lon = p.coords.longitude.toFixed(5), gen = Math.round(p.coords.accuracy || 0);
        var text = 'Ich bin hier: ' + lat + ', ' + lon + ' (auf ca. ' + gen + ' m genau) https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lon + '#map=18/' + lat + '/' + lon;
        box.innerHTML = '<p class="uw-gross">' + lat + '<br>' + lon + '</p><p class="uw-klein">Breite, Länge · auf ca. ' + gen + ' m genau</p>' +
          '<a class="uw-btn rot" href="tel:117">📞 117 anrufen und vorlesen</a>' +
          '<a class="uw-btn sanft" href="tel:144">📞 144 Sanität</a>' +
          '<a class="uw-btn sanft" href="' + smsLink(text) + '">✉️ Als SMS an Vertrauensperson</a>';
      }, function () {
        box.innerHTML = '<p class="uw-hinweis">Ich finde deinen Standort gerade nicht. Das ist ok. Sag am Telefon, was du siehst: Strassenname, Hausnummer, Laden oder Haltestelle.</p><a class="uw-btn rot" href="tel:117">📞 117 anrufen</a>';
      }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
    };
    blatt('Wo bin ich?', 'Am Notruf fragen sie zuerst: «Wo sind Sie?» Hier steht es gross.', d);
  }

  var btn = $('btnUnterwegs'); if (btn) btn.addEventListener('click', uebersicht);
  window.JackieUnterwegs = { oeffnen: uebersicht };
  leisteSetzen();
})();
