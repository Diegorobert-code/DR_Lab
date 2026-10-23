/* sprich.js – «Sprich mit <Figur>»: ein kleines Gespräch, das ganz auf diesem Gerät bleibt.
   - Kinder tippen grosse Antwort-Knöpfe oder schreiben. Antworten kommen aus festen Regeln (window.SPRICH), nie aus dem Internet.
   - Mikrofon nur nach Eltern-Freigabe: Whisper läuft im Browser (transformers.js, wie in Mondschein). Die Stimme verlässt das Gerät nie,
     die Aufnahme wird nach dem Umwandeln sofort verworfen. Keine Browser-Spracherkennung (SpeechRecognition), kein Server, keine API.
     Aus dem Netz kommt nur einmal das Sprachmodell (ca. 80 MB) und die Bibliothek.
   - Vorlesen nur mit Erwachsenen-Stimmen des Geräts (localService). Bei stummen Figuren (Hasi) liest nur die Erzählerin.
   - Gespeichert wird nur, welche Themen gewählt wurden (Zahlen, nie Text): localStorage «sprich_<app>».
   Öffnen: [data-sprich] oder Sprich.oeffnen(). */
(function () {
  'use strict';
  if (window.Sprich) return;
  var d = document, RUHIG = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function C() { return window.SPRICH || { figur: 'Freund', regeln: [], chips: [] }; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function KEY() { return 'sprich_' + (C().app || 'app'); }
  function hol() { try { var v = JSON.parse(localStorage.getItem(KEY()) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
  function leg(v) { try { localStorage.setItem(KEY(), JSON.stringify(v)); } catch (e) {} }
  function zufall(a) { return Array.isArray(a) ? a[Math.floor(Math.random() * a.length)] : a; }
  function norm(s) { return String(s || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue'); }

  /* Gemeinsame Regeln für alle Kinder-Apps: Trost und Sicherheit zuerst, nie Diagnosen. */
  var BASIS = [
    { id: 'hilfe', w: /(angst|traurig|weh|schmerz|blut|hilfe|haut mich|schlaegt|allein|wein|krank|boese zu mir)/,
      a: ['Das klingt wichtig. Bitte sag es einer erwachsenen Person, der du vertraust, zum Beispiel Mama, Papa oder deiner Lehrerin. Die können dir helfen. Ich bin bei dir.'],
      g: 'legt ganz sanft die Pfote auf sein Herz und zeigt dann auf die Tür, wo die Grossen sind.' },
    { id: 'danke', w: /(danke|merci)/, a: ['Gern geschehen!', 'Sehr gern. Das hat Spass gemacht.'], g: 'verbeugt sich und lächelt.' },
    { id: 'tschuess', w: /(tschuess|ciao|adieu|bye|gute nacht|uf wiederluege)/, a: ['Tschüss! Bis bald.', 'Bis zum nächsten Mal!'], g: 'winkt mit beiden Pfoten.' }
  ];

  var root, liste, eingabe, micBtn, chipsBox, tonBtn, an = false;
  function bau() {
    if (root) return;
    var c = C();
    root = d.createElement('div'); root.className = 'sprich-ov'; root.hidden = true; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Sprich mit ' + c.figur);
    root.innerHTML = '<div class="sp-kopf"><button type="button" class="sp-rund" data-sp="zu" aria-label="Schliessen">✕</button>' +
      '<span class="sp-wer">' + (c.bild ? '<img src="' + esc(c.bild) + '" alt="">' : '<span class="sp-e">' + esc(c.e || '💬') + '</span>') + '<b>' + esc(c.figur) + '</b></span>' +
      '<button type="button" class="sp-rund" data-sp="ton" aria-pressed="false" aria-label="Vorlesen">🔈</button></div>' +
      '<div class="sp-liste" aria-live="polite"></div>' +
      '<div class="sp-chips"></div>' +
      '<form class="sp-zeile"><button type="button" class="sp-mic" data-sp="mic" aria-label="Mit der Stimme sprechen (bleibt auf dem Gerät)">🎤</button>' +
      '<input class="sp-in" type="text" maxlength="160" autocomplete="off" enterkeyhint="send" placeholder="' + esc(c.platzhalter || 'Schreib etwas …') + '" aria-label="Deine Nachricht">' +
      '<button type="submit" class="sp-senden" aria-label="Senden">➤</button></form>' +
      '<p class="sp-klein">🔒 Alles bleibt auf diesem Gerät.' + (c.stumm ? ' ' + esc(c.figur) + ' spricht nie, er zeigt es dir.' : '') + '</p>' +
      '<div class="sp-eltern" hidden></div>';
    d.body.appendChild(root);
    liste = root.querySelector('.sp-liste'); eingabe = root.querySelector('.sp-in'); micBtn = root.querySelector('.sp-mic'); chipsBox = root.querySelector('.sp-chips'); tonBtn = root.querySelector('[data-sp="ton"]');
    if (!WH.ok || c.ohneMikrofon) micBtn.hidden = true;
    root.addEventListener('click', klick);
    root.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); var t = eingabe.value.trim(); if (!t) return; eingabe.value = ''; frage(t); });
    d.addEventListener('keydown', function (e) { if (!root.hidden && e.key === 'Escape') schliessen(); });
    var v = hol(); an = !!v.ton && !!window.speechSynthesis; ton();
  }
  function ton() { if (!tonBtn) return; tonBtn.setAttribute('aria-pressed', String(an)); tonBtn.textContent = an ? '🔊' : '🔈'; tonBtn.hidden = !window.speechSynthesis; }

  function oeffnen() {
    bau(); root.hidden = false; d.documentElement.classList.add('sp-offen');
    if (!liste.children.length) {
      var c = C(), v = hol(), p = profilText();
      sag(zufall(v.gespraeche ? (c.wieder || c.hallo) : c.hallo), c.halloGeste || 'winkt dir fröhlich zu.');
      if (p) sag(p.text, p.geste, p.aktion);
      v.gespraeche = (v.gespraeche || 0) + 1; leg(v);
    }
    chips();
    setTimeout(function () { var b = chipsBox.querySelector('button'); if (b) b.focus(); }, 60);
  }
  function schliessen() { if (!root) return; stillen(); WHstop(); root.hidden = true; d.documentElement.classList.remove('sp-offen'); }

  /* Vorschlag aus dem Lern-Profil (Inhalt.profil / Welten.profil), ohne Daten zu teilen */
  function profilText() {
    var c = C(); if (c.vorschlag) { try { var x = c.vorschlag(); if (x) return x; } catch (e) {} }
    try {
      if (window.Inhalt && Inhalt.fuerDich) {
        var f = Inhalt.fuerDich(), h = Inhalt.heute(), pf = Inhalt.profil ? Inhalt.profil() : null, z = f || h;
        if (!z) return null;
        var t = (f ? f.grund + ', hab ich etwas für dich: «' : 'Heute habe ich etwas Neues für dich: «') + Inhalt.titel(z.it) + '».';
        if (pf && pf.stufe > 1) t += ' Du bist schon ' + pf.name + ', Stufe ' + pf.stufe + '!';
        return { text: t, geste: 'hält ein Schild mit einem Pfeil hoch.', aktion: { label: '▶ Zeig mir', tun: function () { schliessen(); Inhalt.oeffnen(''); } } };
      }
    } catch (e) {}
    return null;
  }

  function chips() {
    var c = C(), v = hol(), th = v.themen || {}, alle = (c.chips || []).slice();
    alle.sort(function (a, b) { return (th[b.id] || 0) - (th[a.id] || 0); }); // Lieblingsthemen nach vorne
    chipsBox.innerHTML = alle.slice(0, c.chipZahl || 4).map(function (x) { return '<button type="button" class="sp-chip" data-sp-chip="' + esc(x.id) + '">' + esc(x.l) + '</button>'; }).join('');
  }
  function zeit() { return RUHIG ? 0 : 450; }
  function sag(text, geste, aktion) {
    var c = C(), b = d.createElement('div'); b.className = 'sp-bubble figur' + (c.stumm ? ' stumm' : '');
    var html = '';
    if (c.stumm) html += (geste ? '<p class="sp-geste">' + esc(c.figur) + ' ' + esc(geste) + '</p>' : '') + (text ? '<p class="sp-erz">' + esc(text) + '</p>' : '');
    else html += '<p>' + esc(text) + '</p>';
    if (aktion) html += '<button type="button" class="sp-aktion">' + esc(aktion.label) + '</button>';
    b.innerHTML = html; liste.appendChild(b);
    if (aktion) b.querySelector('.sp-aktion').addEventListener('click', function () { try { aktion.tun(); } catch (e) {} });
    liste.scrollTop = liste.scrollHeight;
    vorlesen(c.stumm ? (geste ? c.figur + ' ' + geste + ' ' : '') + (text || '') : text);
  }
  function du(text) { var b = d.createElement('div'); b.className = 'sp-bubble du'; b.textContent = text; liste.appendChild(b); liste.scrollTop = liste.scrollHeight; }

  function antwortFuer(t) {
    var c = C(), n = norm(t), regeln = BASIS.slice(0, 1).concat(c.regeln || [], BASIS.slice(1));
    for (var i = 0; i < regeln.length; i++) if (regeln[i].w.test(n)) return regeln[i];
    return null;
  }
  function merkThema(id) { var v = hol(); v.themen = v.themen || {}; v.themen[id] = (v.themen[id] || 0) + 1; leg(v); }
  function antworte(r) {
    var c = C();
    if (!r) { var p = profilText(); sag(zufall(c.unbekannt || ['Hm, das weiss ich nicht. Tipp auf einen Knopf, dann zeig ich dir etwas.']), c.unbekanntGeste || 'legt den Kopf schief und überlegt.', p && p.aktion); return; }
    merkThema(r.id);
    var text = typeof r.a === 'function' ? r.a() : zufall(r.a);
    sag(text, typeof r.g === 'function' ? r.g() : zufall(r.g), r.aktion);
  }
  function frage(t) { du(t); var r = antwortFuer(t); setTimeout(function () { antworte(r); chips(); }, zeit()); }

  function klick(e) {
    var t = e.target.closest('button'); if (!t) return;
    var a = t.getAttribute('data-sp');
    if (a === 'zu') return schliessen();
    if (a === 'ton') { an = !an; var v = hol(); v.ton = an; leg(v); ton(); if (!an) stillen(); return; }
    if (a === 'mic') return mikrofon();
    if (t.hasAttribute('data-sp-chip')) {
      var id = t.getAttribute('data-sp-chip'), ch = (C().chips || []).filter(function (x) { return x.id === id; })[0]; if (!ch) return;
      du(ch.l); var r = (C().regeln || []).filter(function (x) { return x.id === (ch.regel || ch.id); })[0] || antwortFuer(ch.l);
      setTimeout(function () { antworte(r); chips(); }, zeit());
    }
  }

  /* ---------- Vorlesen: nur Erwachsenen-Stimmen, die auf dem Gerät laufen ---------- */
  function stimme() {
    var vs = []; try { vs = speechSynthesis.getVoices() || []; } catch (e) {}
    var de = vs.filter(function (v) { return /^de/i.test(v.lang) && v.localService !== false && !/kind|child|kid|junior/i.test(v.name); });
    return de.filter(function (v) { return /CH/i.test(v.lang); })[0] || de[0] || null;
  }
  function vorlesen(t) {
    if (!an || !t || !window.speechSynthesis) return;
    var v = stimme(); if (!v) return; // keine lokale Stimme: lieber still als ins Netz
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '')); u.voice = v; u.lang = v.lang; u.rate = 0.95; u.pitch = 1; speechSynthesis.speak(u); } catch (e) {}
  }
  function stillen() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} }

  /* ---------- Mikrofon: Whisper im Browser, nur nach Eltern-Freigabe ---------- */
  var WH = {
    ok: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.WebAssembly && (window.AudioContext || window.webkitAudioContext)),
    lib: 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1',
    model: 'onnx-community/whisper-base',
    asr: null, laden: null, jetzt: null,
    load: function () {
      var self = this; if (self.asr) return Promise.resolve(self.asr);
      if (!self.laden) self.laden = import(self.lib).then(function (T) {
        T.env.allowLocalModels = false;
        return T.pipeline('automatic-speech-recognition', self.model, { dtype: { encoder_model: 'q8', decoder_model_merged: 'q8' }, device: 'wasm' });
      }).then(function (a) { return (self.asr = a); }).catch(function (e) { self.laden = null; throw e; });
      return self.laden;
    },
    text: function (pcm) {
      return this.load().then(function (asr) { return asr(pcm, { language: 'german', task: 'transcribe', chunk_length_s: 30 }); }).then(function (r) {
        var t = String((r && r.text) || '').replace(/\[.*?\]|\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
        return /^(untertitel|vielen dank|danke fürs zuschauen|copyright)/i.test(t) || t.length < 2 ? '' : t;
      });
    }
  };
  function WHstop() { if (WH.jetzt) WH.jetzt.abbruch(); }
  function hinweis(t) { var p = root.querySelector('.sp-klein'); p.textContent = t; }
  function mikrofon() {
    if (WH.jetzt) { WH.jetzt.fertig(); return; }
    if (!hol().mikrofon) return elternTor();
    aufnehmen();
  }
  function elternTor() {
    var box = root.querySelector('.sp-eltern'), a = 3 + Math.floor(Math.random() * 5), b = 4 + Math.floor(Math.random() * 5), s = a + b;
    var opts = [s, s + 1, s - 2].sort(function () { return Math.random() - 0.5; });
    box.innerHTML = '<div class="sp-tor"><h3>Für Eltern</h3><p>Das Mikrofon nutzt eine Spracherkennung, die <b>nur auf diesem Gerät</b> läuft. Die Stimme Ihres Kindes wird nie gesendet, nicht gespeichert und nach dem Umwandeln sofort gelöscht. Einmalig lädt das Gerät ein Sprachmodell (ca. 80 MB, am besten im WLAN).</p>' +
      '<p class="sp-rechnen">Zum Freischalten: Wie viel ist ' + a + ' + ' + b + '?</p><div class="sp-tor-k">' + opts.map(function (o) { return '<button type="button" data-sp-tor="' + o + '">' + o + '</button>'; }).join('') + '</div>' +
      '<button type="button" class="sp-tor-nein" data-sp-tor="nein">Lieber ohne Mikrofon</button></div>';
    box.hidden = false;
    box.onclick = function (e) {
      var t = e.target.closest('[data-sp-tor]'); if (!t) return; var w = t.getAttribute('data-sp-tor');
      if (w === 'nein') { box.hidden = true; return; }
      if (+w === s) { var v = hol(); v.mikrofon = 1; leg(v); box.hidden = true; WH.load().catch(function () {}); hinweis('🔒 Sprachmodell lädt auf dieses Gerät … Danach: 🎤 antippen und sprechen.'); }
      else { t.disabled = true; }
    };
  }
  function aufnehmen() {
    stillen();
    var J = { fertig: null, abbruch: null, aus: false }, ctx, src, node, stream, stuecke = [], gehoert = false, laut = 0, t0 = Date.now(), uhr;
    WH.jetzt = J; micBtn.classList.add('hoert');
    if (!WH.asr) hinweis('🔒 ' + C().figur + ' lernt noch zuhören … (nur auf diesem Gerät)'); else hinweis('🎤 Ich höre zu … Nochmal tippen = fertig.');
    function aus() { clearInterval(uhr); micBtn.classList.remove('hoert'); try { node && node.disconnect(); src && src.disconnect(); } catch (e) {} if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); try { ctx && ctx.close(); } catch (e) {} if (WH.jetzt === J) WH.jetzt = null; }
    J.abbruch = function () { if (J.aus) return; J.aus = true; stuecke = null; aus(); };
    J.fertig = function () {
      if (J.aus) return; J.aus = true; var rate = ctx ? ctx.sampleRate : 16000; aus();
      if (!gehoert) { hinweis('Ich habe nichts gehört. Tipp lieber auf einen Knopf.'); return; }
      var n = stuecke.reduce(function (s, c) { return s + c.length; }, 0), alle = new Float32Array(n), o = 0;
      stuecke.forEach(function (c) { alle.set(c, o); o += c.length; }); stuecke = null;
      var k = rate / 16000, pcm = new Float32Array(Math.floor(n / k)); for (var i = 0; i < pcm.length; i++) pcm[i] = alle[Math.floor(i * k)];
      alle = null; hinweis('🔒 ' + C().figur + ' denkt kurz nach …');
      WH.text(pcm).then(function (t) { pcm = null; hinweis('🔒 Alles bleibt auf diesem Gerät.'); if (t) frage(t); else hinweis('Ich habe nichts verstanden. Tipp lieber auf einen Knopf.'); })
        .catch(function () { hinweis('Zuhören klappt gerade nicht. Tipp lieber auf einen Knopf.'); });
    };
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } }).then(function (st) {
      if (J.aus) { st.getTracks().forEach(function (t) { t.stop(); }); return; }
      stream = st; var AC = window.AudioContext || window.webkitAudioContext;
      try { ctx = new AC({ sampleRate: 16000 }); } catch (e) { ctx = new AC(); }
      src = ctx.createMediaStreamSource(st); node = ctx.createScriptProcessor(4096, 1, 1);
      node.onaudioprocess = function (e) {
        if (J.aus) return; var dd = e.inputBuffer.getChannelData(0); stuecke.push(new Float32Array(dd));
        var sum = 0; for (var i = 0; i < dd.length; i++) sum += dd[i] * dd[i];
        if (Math.sqrt(sum / dd.length) > 0.02) { gehoert = true; laut = Date.now(); }
      };
      src.connect(node); node.connect(ctx.destination);
      uhr = setInterval(function () { var t = Date.now(); if ((gehoert && t - laut > 1400) || (!gehoert && t - t0 > 7000) || t - t0 > 9000) J.fertig(); }, 150);
    }).catch(function () { J.aus = true; aus(); hinweis('Mikrofon ist nicht erlaubt. Tipp lieber auf einen Knopf.'); });
  }

  d.addEventListener('click', function (e) { var b = e.target.closest('[data-sprich]'); if (!b || (root && root.contains(b))) return; e.preventDefault(); oeffnen(); });
  if (/^#sprich\b/.test(location.hash)) { if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', oeffnen); else oeffnen(); }
  window.Sprich = { oeffnen: oeffnen, schliessen: schliessen, _antwort: antwortFuer, _wh: WH };
})();
