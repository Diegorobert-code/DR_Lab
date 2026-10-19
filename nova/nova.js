/* Nova für alle DR-Lab-Apps, mit der eigenen Stimme jeder Figur.
   Einbinden: <script src="../nova/nova.js" data-nova-app="Mondschein" defer></script>
   Optional: data-nova-figur="otti"  (wer spricht; sonst aus FIGUREN nach App),
             data-nova-unten="90"   (Knopf höher, z. B. über einer Leiste),
             data-nova-kind="1"     (Kinder-App: keine Einstellungen, keine Bauwünsche),
             data-nova-knopf="0"    (kein Knopf, nur die Stimme für die App selbst),
             data-nova-bild="figur.jpg" (Bild der Figur auf dem Knopf statt Nova).
   Persönlichkeit je App: nova/seelen.js vor nova.js laden (window.NOVA_SEELEN).
   Nova redet nur mit Sense Engine (eigener Server). Die Stimmen kommen von dort (/v1/stimme,
   ElevenLabs); der Schlüssel liegt nur auf dem Server. Ohne Server oder über dem Deckel
   liest die Gerätestimme vor.
   Für die Apps: window.NovaStimme.sprich(text, {onEnd}) liest mit der Figurenstimme vor.
   Adresse und Passwort teilen sich alle Apps (gleiche Schlüssel wie Transkript). */
(function () {
  if (window.__nova) return;
  window.__nova = true;

  var me = document.currentScript;
  function attr(n, d) { var v = me && me.getAttribute(n); return v === null || v === undefined || v === '' ? d : v; }
  var APP = attr('data-nova-app', document.title || 'DR Lab');
  // Wer in welcher App spricht. Die Namen sind die Figuren auf dem Server (sense-klein.py, STIMMEN).
  var FIGUREN = {
    'Mondschein': 'otti', 'HumanSpark': 'sparky', 'Jackie': 'jackie', 'TradePing': 'mr. ping',
    'Erinnerung': 'nova', 'Fotowissen': 'nova', 'Sense Engine': 'nova', 'Transkript': 'fompa',
    'Fompa': 'fompa', 'Food and Flow': 'flo', 'Kiki': 'kiki', 'Fias Nest': 'fia', 'Mama Affe': 'mama affe',
    'Wäf Wäf': 'wäf wäf', 'KI-Verse': 'sunny', 'Sunny': 'sunny', 'Coin Maker': 'coin maker',
    'Granny': 'granny', 'Carmencita': 'carmencita'
  };
  var FIGUR = String(attr('data-nova-figur', FIGUREN[APP] || 'nova')).toLowerCase();
  var NAME = FIGUR.replace(/(^|[\s.])([a-zäöü])/g, function (m, a, b) { return a + b.toUpperCase(); });
  // Kinder-Apps: keine Verbindungs-Einstellungen und keine Bauwünsche sichtbar.
  var KIND = attr('data-nova-kind', '') === '1';
  var KNOPF = attr('data-nova-knopf', '1') !== '0';
  // Abstand des Knopfs vom unteren Rand in px, z. B. über einer Leiste.
  var UNTEN = parseInt(attr('data-nova-unten', '16'), 10) || 16;
  // Novas Gesicht kommt immer aus dem Film (nova.jpg neben diesem Skript), nie gezeichnet.
  // Andere Figur: data-nova-bild="figur.jpg" (relativ zur App-Seite).
  var BILD = attr('data-nova-bild', '') ? new URL(attr('data-nova-bild', ''), location.href).href
    : (me && me.src ? new URL('nova.jpg', me.src).href : '../nova/nova.jpg');
  var K = { addr: 'drlab-hermes-adresse', key: 'drlab-hermes-passwort', ton: 'drlab-stimme-an' };
  // Live-Gespräch (hören, denken, sprechen gleichzeitig, unterbrechbar) über einen ElevenLabs Agent je Figur.
  // Die Agents sind nur von diegorobert-code.github.io aus erreichbar und haben ein Tageslimit.
  var AGENTEN = {
    'otti': 'agent_4801m55hqwdpeq0ry4awvx45rz5t',
    'jackie': 'agent_7501m55rzxb0fdv9j4n97jtnbk08',
    'kiki': 'agent_0401m55r02rvf96a1xrxv1njqbh3',
    'mr. ping': 'agent_5601m55s9kdcebzrh23262ytezm2',
    'nova': 'agent_4201m55seyhdexd96tkaxt72hmaq',
    'sparky': 'agent_7401m55j20jwek69gsh3gkfhaa77',
    'coin maker': 'agent_2001m55ss61fe5wb1qct4b8bqkz3',
    'flo': 'agent_0001m55ss8s7eb0vnzr6f1vz1tf0',
    'fompa': 'agent_5401m55ssbdheqwtyw4131dqya8w',
    'sunny': 'agent_4201m55ssdr3fksaey0x2yh1vpmh'
  };
  // data-nova-live="0": Live-Telefon für diese App aus (z. B. Sparky bis «Sparky live Go»); Text und Stimme bleiben.
  var AGENT = attr('data-nova-live', '1') === '0' ? '' : (AGENTEN[FIGUR] || '');
  // Figuren mit Gesicht, das mitspricht: Live-Gespräch auf der grossen Bühne (nova/reden.html).
  var BUEHNE = AGENT && me && me.src ? new URL('reden.html?f=' + encodeURIComponent(FIGUR), me.src).href : '';
  var LIVE_LIB = me && me.src ? new URL('elevenlabs-client-1.26.0.js', me.src).href : '../nova/elevenlabs-client-1.26.0.js';

  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var fromLink = (location.hash.match(/hermes=([^&]+)/) || [])[1];
  if (fromLink) {
    put(K.addr, decodeURIComponent(fromLink));
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }
  // Verbindungscode von der Seite «Handy verbinden» (verbinden/): «NOVA:» + base64(Adresse \n Passwort).
  // Apps auf dem iPhone-Home-Bildschirm haben einen eigenen Speicher, darum dieser Weg ohne Tippen.
  function codeNehmen(t) {
    var m = String(t || '').match(/NOVA:([A-Za-z0-9+\/=_-]+)/);
    if (!m) return false;
    try {
      var teile = decodeURIComponent(escape(atob(m[1].replace(/-/g, '+').replace(/_/g, '/')))).split('\n');
      if (!/^https:\/\//.test(teile[0]) || !teile[1]) return false;
      put(K.addr, teile[0].replace(/\/+$/, '')); put(K.key, teile[1].trim());
      return true;
    } catch (e) { return false; }
  }
  var fromCode = (location.hash.match(/nova=([^&]+)/) || [])[1];
  if (fromCode && codeNehmen('NOVA:' + decodeURIComponent(fromCode))) {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }
  function addr() { return String(get(K.addr, '') || '').trim().replace(/\/+$/, ''); }
  function ready() { return /^https:\/\//.test(addr()) && !!get(K.key, ''); }

  /* ---------- Stimme ----------
     Flüssig: die Antwort wird in Satzstücke geteilt. Das erste Stück ist kurz und spielt, sobald
     es da ist; die nächsten laden schon, während das erste läuft. Einmal gesprochene Sätze bleiben
     im Gerät (Cache): Wiederholungen kosten nichts und kommen sofort. */
  var stimme = { token: 0, audio: null, url: null, laeuft: false, pauseBis: 0, lade: {} };
  var CACHE = 'drlab-stimmen-1';

  // iPhone spielt Ton nur nach einer Berührung: beim ersten Tippen einmal stumm abspielen,
  // danach darf dasselbe Audio-Element auch nach dem Laden der Stimme spielen.
  function audioEl() {
    if (!stimme.audio) { stimme.audio = new Audio(); stimme.audio.preload = 'auto'; }
    return stimme.audio;
  }
  function entsperren() {
    document.removeEventListener('pointerdown', entsperren, true);
    document.removeEventListener('keydown', entsperren, true);
    var a = audioEl();
    if (a.src) return;
    a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    var p = a.play(); if (p && p.catch) p.catch(function () {});
  }
  document.addEventListener('pointerdown', entsperren, true);
  document.addEventListener('keydown', entsperren, true);

  function tonAn() { return get(K.ton, true) !== false; }
  // Nach «keine Stimme» (204: kein Schlüssel oder Deckel erreicht) zehn Minuten nicht mehr fragen.
  function aktiv() { return ready() && tonAn() && Date.now() > stimme.pauseBis; }

  function sauber(t) {
    return String(t || '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/^\s*[-•]\s+/gm, '')
      .replace(/[*_#`>|~]+/g, '')
      .replace(/[«»„“"‹›]/g, '')
      .replace(/\s*\n+\s*/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
  // Ganze Sätze; kurze werden zusammengefasst (bis ca. 220 Zeichen), damit es natürlich klingt.
  function stuecke(t) {
    var s = sauber(t).match(/[^.!?…]+[.!?…]+["»”]?\s*|[^.!?…]+$/g) || [];
    var out = [], cur = '';
    s.forEach(function (x) {
      x = x.trim(); if (!x) return;
      while (x.length > 500) { out.push(x.slice(0, 500)); x = x.slice(500); }
      if (cur && (cur + ' ' + x).length > 220) { out.push(cur); cur = x; }
      else cur = cur ? cur + ' ' + x : x;
      // Das erste Stück kurz halten, damit der Ton schnell kommt.
      if (!out.length && cur.length >= 12) { out.push(cur); cur = ''; }
    });
    if (cur) out.push(cur);
    return out;
  }
  function schluessel(figur, text) {
    var h = 0x811c9dc5;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return 'https://stimme.drlab/' + encodeURIComponent(figur) + '/' + h.toString(16) + '-' + text.length;
  }
  function ausCache(k) {
    if (!window.caches) return Promise.resolve(null);
    return caches.open(CACHE).then(function (c) { return c.match(k); })
      .then(function (r) { return r ? r.blob() : null; }, function () { return null; });
  }
  function inCache(k, blob) {
    if (!window.caches) return;
    caches.open(CACHE).then(function (c) { return c.put(k, new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } })); }).catch(function () {});
  }
  // Liefert ein MP3 (Blob) oder null, wenn es keine Server-Stimme gibt.
  function holen(figur, text) {
    var k = schluessel(figur, text);
    if (stimme.lade[k]) return stimme.lade[k];
    var p = ausCache(k).then(function (b) {
      if (b) return b;
      if (!aktiv()) return null;
      return fetch(addr() + '/v1/stimme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + get(K.key, ''), 'X-Nova-App': APP },
        body: JSON.stringify({ figur: figur, text: text })
      }).then(function (r) {
        if (r.status === 204) { stimme.pauseBis = Date.now() + 10 * 60 * 1000; return null; }
        if (!r.ok) return null;
        return r.blob().then(function (b) { if (b && b.size > 200) { inCache(k, b); return b; } return null; });
      }).catch(function () { return null; });
    });
    stimme.lade[k] = p;
    p.then(function () { delete stimme.lade[k]; });
    return p;
  }

  function geraet(text, done) {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') { done(); return; }
    var u = new SpeechSynthesisUtterance(text); u.lang = 'de-CH'; u.rate = 0.95;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^de/i.test(v.lang); });
    var v = vs.filter(function (x) { return /CH/i.test(x.lang); })[0] || vs[0];
    if (v) { u.voice = v; u.lang = v.lang; }
    var fertig = false, fin = function () { if (!fertig) { fertig = true; done(); } };
    u.onend = fin; u.onerror = fin;
    speechSynthesis.speak(u);
  }

  function stopp() {
    stimme.token++;
    stimme.laeuft = false;
    var a = stimme.audio;
    if (a) { try { a.onended = a.onerror = null; a.pause(); } catch (e) {} }
    if (stimme.url) { URL.revokeObjectURL(stimme.url); stimme.url = null; }
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
  }

  /* Liest text mit der Figurenstimme vor.
     o.figur: andere Figur; o.onEnd: danach.
     o.geraet === false: ohne Server-Stimme nichts sagen; das Promise liefert dann false,
     damit die App selbst vorlesen kann. */
  function sprich(text, o) {
    o = o || {};
    stopp();
    var tok = stimme.token, figur = String(o.figur || FIGUR).toLowerCase();
    var teile = stuecke(text), i = 0, ok = true;
    stimme.laeuft = true;
    var vorab = teile.map(function (t, n) { return n < 2 ? holen(figur, t) : null; });
    return new Promise(function (resolve) {
      function weiter() {
        if (tok !== stimme.token) { resolve(ok); return; }
        if (i >= teile.length) { stimme.laeuft = false; if (o.onEnd) o.onEnd(ok); resolve(ok); return; }
        var n = i++, t = teile[n];
        if (n + 2 < teile.length && !vorab[n + 2]) vorab[n + 2] = holen(figur, teile[n + 2]);
        (vorab[n] || holen(figur, t)).then(function (blob) {
          if (tok !== stimme.token) { resolve(ok); return; }
          if (!blob) {
            ok = false;
            if (o.geraet === false) { stimme.laeuft = false; resolve(false); return; }
            geraet(t, weiter);
            return;
          }
          var a = audioEl();
          if (stimme.url) URL.revokeObjectURL(stimme.url);
          stimme.url = URL.createObjectURL(blob);
          var fertig = false;
          a.onended = function () { if (!fertig) { fertig = true; weiter(); } };
          a.onerror = function () { if (!fertig) { fertig = true; ok = false; geraet(t, weiter); } };
          a.src = stimme.url;
          var p = a.play();
          if (p && p.catch) p.catch(function () { if (a.onerror) a.onerror(); });
        });
      }
      weiter();
    });
  }
  // Sätze schon laden, bevor sie gebraucht werden (z. B. die nächsten Sätze einer Geschichte).
  function vorladen(texte, figur) {
    if (!aktiv()) return;
    var f = String(figur || FIGUR).toLowerCase();
    (texte || []).slice(0, 4).forEach(function (t) { stuecke(t).forEach(function (s) { holen(f, s); }); });
  }

  window.NovaStimme = {
    figur: FIGUR, name: NAME,
    aktiv: aktiv, sprich: sprich, stopp: stopp, vorladen: vorladen,
    spricht: function () { return stimme.laeuft; },
    tonAn: tonAn,
    setzeTon: function (an) { put(K.ton, !!an); if (!an) stopp(); }
  };

  if (!KNOPF) return;

  var css = '' +
    '.nova-btn{position:fixed;right:16px;bottom:calc(' + UNTEN + 'px + env(safe-area-inset-bottom,0px));z-index:2147483000;width:60px;height:60px;border-radius:50%;border:0;padding:0;background:#1e5bd8;box-shadow:0 6px 18px rgba(20,40,110,.35);cursor:pointer;display:grid;place-items:center;overflow:hidden}' +
    '.nova-btn:focus-visible{outline:3px solid #ffd34d;outline-offset:3px}' +
    '.nova-btn img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}' +
    '.nova-btn[data-wach="0"]{filter:saturate(.45)}' +
    '.nova-panel{position:fixed;right:12px;left:12px;bottom:calc(' + (UNTEN + 70) + 'px + env(safe-area-inset-bottom,0px));z-index:2147483000;max-width:420px;margin-left:auto;max-height:70vh;display:flex;flex-direction:column;background:#f6f8ff;color:#14213d;border-radius:18px;box-shadow:0 12px 40px rgba(20,40,110,.3);font:15px/1.45 system-ui,-apple-system,sans-serif;overflow:hidden}' +
    '.nova-panel[hidden],.nova-panel [hidden]{display:none!important}' +
    '.nova-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#1e5bd8;color:#fff}' +
    '.nova-head b{font-size:17px}.nova-head small{opacity:.85;margin-left:auto}' +
    '.nova-head button{border:0;background:rgba(255,255,255,.18);color:#fff;border-radius:9px;padding:4px 8px;font:inherit;cursor:pointer}' +
    '.nova-log{flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:8px}' +
    '.nova-msg{padding:8px 11px;border-radius:12px;max-width:88%;white-space:pre-wrap;word-wrap:break-word}' +
    '.nova-msg.du{align-self:flex-end;background:#dfe7ff}.nova-msg.nova{align-self:flex-start;background:#fff;border:1px solid #d6def5}' +
    '.nova-row{display:flex;gap:6px;padding:10px;border-top:1px solid #d6def5;background:#fff}' +
    '.nova-row input{flex:1;min-width:0;font:inherit;padding:9px 11px;border:1px solid #c5d0ee;border-radius:10px;background:#fff;color:#14213d}' +
    '.nova-row button,.nova-set button{font:inherit;border:0;border-radius:10px;padding:9px 12px;background:#1e5bd8;color:#fff;cursor:pointer}' +
    '.nova-row button.mic{background:#e8edff;color:#1e5bd8}.nova-row button.mic.an{background:#d6304a;color:#fff}' +
    '.nova-opt{display:flex;align-items:center;gap:6px;padding:0 12px 10px;background:#fff;font-size:13px;color:#4a5679}' +
    '.nova-set{padding:10px 14px;border-top:1px solid #d6def5;background:#eef2ff;display:grid;gap:6px;font-size:13px}' +
    '.nova-set input{font:inherit;padding:8px 10px;border:1px solid #c5d0ee;border-radius:9px;background:#fff;color:#14213d}' +
    '.nova-set summary{cursor:pointer;color:#4a5679}' +
    '.nova-code button{font:inherit;font-size:13px;border:1px solid #c5d0ee;border-radius:9px;padding:6px 10px;background:transparent;color:inherit;cursor:pointer}' +
    '@media (prefers-color-scheme:dark){.nova-panel{background:#101a33;color:#e8edff}.nova-msg.du{background:#24386e}.nova-msg.nova{background:#16244a;border-color:#2b3d70}.nova-row,.nova-opt{background:#16244a;border-color:#2b3d70;color:#aab6da}.nova-row input,.nova-set input{background:#0c1530;color:#e8edff;border-color:#2b3d70}.nova-set{background:#13203f;border-color:#2b3d70}.nova-row button.mic{background:#24386e;color:#cfe0ff}}' +
    '@media (prefers-reduced-motion:no-preference){.nova-btn[data-wach="1"]{animation:novaGlow 2.6s ease-in-out infinite}}' +
    '.nova-live{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#fff7d6;border-bottom:1px solid #f0d77a;color:#3a2c00}' +
    '.nova-live button{font:inherit;font-weight:600;border:0;border-radius:999px;padding:10px 16px;background:#f5c542;color:#2a1d00;cursor:pointer;white-space:nowrap}' +
    '.nova-live button.an{background:#d6304a;color:#fff}.nova-live span{font-size:13px}' +
    '.nova-btn.live-hoert{box-shadow:0 0 0 4px #7fd4ff,0 6px 18px rgba(20,40,110,.35)}.nova-btn.live-spricht{box-shadow:0 0 0 4px #f5c542,0 6px 18px rgba(20,40,110,.35)}' +
    '.nova-pille{position:fixed;right:84px;bottom:calc(' + (UNTEN + 10) + 'px + env(safe-area-inset-bottom,0px));z-index:2147483000;border:0;border-radius:999px;padding:12px 18px;font:600 16px system-ui,-apple-system,sans-serif;background:#f5c542;color:#2a1d00;box-shadow:0 6px 18px rgba(0,0,0,.35);cursor:pointer;white-space:nowrap}' +
    '.nova-pille.an{background:#d6304a;color:#fff}' +
    '@media (prefers-color-scheme:dark){.nova-live{background:#2b2410;border-color:#5a4a14;color:#f4e6b0}}' +
    '@keyframes novaGlow{50%{box-shadow:0 0 0 6px rgba(127,178,255,.45),0 6px 18px rgba(20,40,110,.35)}}';

  var face = '<img src="' + BILD + '" alt="">';

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var a in attrs) e.setAttribute(a, attrs[a]);
    if (html) e.innerHTML = html;
    return e;
  }

  function build() {
    var style = el('style'); style.textContent = css; document.head.appendChild(style);

    var btn = el('button', { 'class': 'nova-btn', type: 'button', 'aria-label': NAME + ' öffnen', 'aria-expanded': 'false' }, face);
    var panel = el('div', { 'class': 'nova-panel', role: 'dialog', 'aria-label': NAME });
    panel.hidden = true;
    panel.innerHTML =
      '<div class="nova-head"><b></b><small class="nova-state"></small><button type="button" class="nova-ton"></button></div>' +
      '<div class="nova-live" hidden><button type="button" class="nova-live-knopf">📞 Live reden</button><span class="nova-live-text">Reden wie am Telefon</span></div>' +
      '<div class="nova-log" aria-live="polite"></div>' +
      '<form class="nova-row"><input class="nova-in" type="text" id="nova-in" autocomplete="off">' +
      '<button type="button" class="mic" aria-label="Sprechen">🎙</button><button type="submit">Senden</button></form>' +
      '<label class="nova-opt"><input type="checkbox" id="nova-wunsch"> Als Bauwunsch an Claude</label>' +
      '<div class="nova-opt nova-code"><button type="button" class="nova-einsetzen">Verbindung einsetzen</button></div>' +
      '<details class="nova-set"><summary>Verbindung zu Sense Engine</summary>' +
      '<input id="nova-addr" type="url" placeholder="https://sense-…sslip.io">' +
      '<input id="nova-key" type="password" placeholder="Passwort" autocomplete="off">' +
      '<button type="button" class="nova-save">Speichern</button></details>';
    document.body.appendChild(btn);
    document.body.appendChild(panel);

    var $ = function (s) { return panel.querySelector(s); };
    var log = $('.nova-log'), input = $('.nova-in'), ton = $('.nova-ton'), mic = $('.mic');
    $('.nova-head b').textContent = NAME;
    input.placeholder = 'Frag ' + NAME + ' …';
    if (KIND) { $('.nova-opt').hidden = true; $('.nova-set').hidden = true; }
    var SCHLAF = KIND ? 'Ich schlafe noch. Bald bin ich wach.' : 'Ich schlafe noch. Trag unten die Verbindung zu Sense Engine ein.';
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null, gespraech = false;
    if (!SR) mic.hidden = true;

    function tonZeigen() {
      var an = tonAn();
      ton.textContent = an ? '🔊' : '🔇';
      ton.setAttribute('aria-label', an ? 'Stimme aus' : 'Stimme an');
    }
    ton.addEventListener('click', function () { window.NovaStimme.setzeTon(!tonAn()); tonZeigen(); });

    function state() {
      var w = ready();
      btn.setAttribute('data-wach', w ? '1' : '0');
      $('.nova-state').textContent = w ? 'wach' : 'schläft noch';
      $('#nova-addr').value = addr();
      $('#nova-key').value = get(K.key, '') ? '••••••••' : '';
      if (!w) $('.nova-set').open = true;
      $('.nova-code').hidden = w;
      tonZeigen();
    }
    function say(who, text) {
      var m = el('div', { 'class': 'nova-msg ' + who }); m.textContent = text;
      log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
    }

    btn.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      btn.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) {
        state();
        if (!log.children.length) say('nova', ready() ? 'Hallo, ich bin ' + NAME + '. Wie kann ich helfen?' : SCHLAF);
        input.focus();
      } else {
        aufhoeren();
        if (typeof liveEnde === 'function' && (live || liveStartet)) liveEnde();
      }
    });

    // Code von «Handy verbinden» einsetzen (Zwischenablage, sonst Eingabefeld).
    $('.nova-einsetzen').addEventListener('click', function () {
      function fertig(t) {
        if (codeNehmen(t)) { stimme.pauseBis = 0; state(); say('nova', 'Danke, jetzt bin ich wach.'); }
        else if (t !== null) say('nova', 'Das war kein Verbindungscode. Auf der Seite «Handy verbinden» den Code kopieren.');
      }
      var cb = navigator.clipboard && navigator.clipboard.readText;
      if (cb) navigator.clipboard.readText().then(fertig, function () { fertig(window.prompt('Verbindungscode einsetzen:')); });
      else fertig(window.prompt('Verbindungscode einsetzen:'));
    });

    $('#nova-key').addEventListener('focus', function () { if (/^•+$/.test(this.value)) this.value = ''; });
    $('.nova-save').addEventListener('click', function () {
      // Platzhalter-Punkte entfernen: wer ins gefüllte Feld einfügt, hängt sonst den Code an «••••••••» an.
      var a = $('#nova-addr').value.trim(), k = $('#nova-key').value.replace(/•/g, '').replace(/\s+/g, '');
      if (a && !/^https:\/\//.test(a)) a = 'https://' + a;
      put(K.addr, a);
      if (k) put(K.key, k);
      stimme.pauseBis = 0;
      state();
      say('nova', ready() ? 'Danke, jetzt bin ich wach.' : 'Es fehlt noch Adresse oder Passwort.');
    });

    function wish(text) {
      return fetch(addr() + '/erfahrung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + get(K.key, '') },
        body: JSON.stringify({ app: APP, art: 'wunsch', frage: text, antwort: '' })
      }).then(function (r) { if (!r.ok) throw new Error('Sense Engine meldet Fehler ' + r.status + '.'); });
    }

    // Gesprächsverlauf dieser Sitzung; die Persönlichkeit je App kommt aus nova/seelen.js.
    var verlauf = [];
    function seele() {
      var s = (window.NOVA_SEELEN || {})[APP] || '';
      if (FIGUR !== 'nova') s += ' In dieser App sprichst du als ' + NAME + ' und stellst dich so vor.';
      if (tonAn()) s += ' Deine Antwort wird laut vorgelesen: kurze, gesprochene Sätze, höchstens etwa vier, ohne Aufzählungen, Sternchen oder Links.';
      return s.trim();
    }
    function ask(text) {
      verlauf.push({ role: 'user', content: text });
      var s = seele();
      var messages = (s ? [{ role: 'system', content: s }] : []).concat(verlauf.slice(-12));
      return fetch(addr() + '/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + get(K.key, ''), 'X-Nova-App': APP },
        body: JSON.stringify({ model: 'sense-engine', messages: messages })
      }).then(function (r) {
        if (r.status === 401) throw new Error('Das Passwort stimmt nicht.');
        if (r.status === 403) throw new Error('Sense Engine lässt diese Seite nicht zu (Fehler 403).');
        if (!r.ok) throw new Error(NAME + ' erreicht Sense Engine gerade nicht (Fehler ' + r.status + ').');
        return r.json();
      }).then(function (j) {
        var a = (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '…';
        verlauf.push({ role: 'assistant', content: a });
        return a;
      }, function (e) {
        verlauf.pop();
        if (e instanceof TypeError) throw new Error('Sense Engine ist gerade nicht erreichbar.');
        throw e;
      });
    }

    function senden(text) {
      text = String(text || '').trim();
      if (!text) return;
      input.value = '';
      say('du', text);
      if (!ready()) { say('nova', SCHLAF); aufhoeren(); return; }
      if (!KIND && $('#nova-wunsch').checked) {
        $('#nova-wunsch').checked = false;
        wish(text).then(function () { say('nova', 'Dein Bauwunsch liegt in Sense Engine. Claude holt ihn dort ab.'); },
          function (e) { say('nova', e.message); });
        return;
      }
      var wait = say('nova', '…');
      ask(text).then(function (a) {
        wait.textContent = a;
        log.scrollTop = log.scrollHeight;
        var danach = function () { if (gespraech && !panel.hidden) hoeren(); };
        if (tonAn()) sprich(a, { onEnd: danach }); else danach();
      }, function (e) { wait.textContent = e.message; aufhoeren(); });
    }

    $('.nova-row').addEventListener('submit', function (ev) { ev.preventDefault(); gespraech = false; senden(input.value); });

    // Reden wie im Gespräch: zuhören, nach einer kurzen Pause selbst senden, Antwort anhören,
    // dann wieder zuhören. Nochmal auf 🎙 tippen (oder Fenster zu) beendet das Gespräch.
    function aufhoeren() {
      gespraech = false;
      mic.classList.remove('an');
      if (rec) { var r = rec; r.weg = true; rec = null; try { r.abort ? r.abort() : r.stop(); } catch (e) {} }
      stopp();
    }
    function hoeren() {
      if (rec || !SR) return;
      stopp();
      var r = new SR(); rec = r;
      r.lang = 'de-CH'; r.interimResults = true; r.continuous = true;
      var text = '', still = null;
      function fertig() { try { r.stop(); } catch (e) {} }
      r.onresult = function (e) {
        var t = ''; for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        text = t; input.value = t;
        clearTimeout(still); still = setTimeout(fertig, 1200);
      };
      r.onerror = function (e) { if (e && /not-allowed/.test(e.error || '')) gespraech = false; };
      r.onend = function () {
        clearTimeout(still);
        if (r.weg) return;
        rec = null;
        if (text.trim()) senden(text);
        else gespraech = false;
        if (!gespraech) mic.classList.remove('an');
      };
      mic.classList.add('an');
      try { r.start(); } catch (e) { rec = null; gespraech = false; mic.classList.remove('an'); return; }
      setTimeout(function () { if (rec === r && !text) fertig(); }, 9000);
    }
    mic.addEventListener('click', function () {
      if (gespraech || rec) { aufhoeren(); return; }
      gespraech = true;
      hoeren();
    });


    // ---------- Live-Gespräch ----------
    var live = null, liveStartet = false, livePuls = 0;
    var liveBar = $('.nova-live'), liveKnopf = $('.nova-live-knopf'), liveText = $('.nova-live-text');
    if (AGENT) liveBar.hidden = false;
    // Gut sichtbar neben dem Figuren-Knopf: ein Tipp startet das Live-Gespräch direkt.
    var pille = null;
    if (AGENT) {
      pille = el('button', { 'class': 'nova-pille', type: 'button' }, '');
      pille.textContent = '📞 Mit ' + NAME + ' reden';
      document.body.appendChild(pille);
      pille.addEventListener('click', function () {
        if (BUEHNE) { location.href = BUEHNE; return; }
        if (panel.hidden) btn.click();
        liveKnopf.click();
      });
    }
    function libLaden() {
      if (window.ElevenLabsClient) return Promise.resolve();
      return new Promise(function (ok, nein) {
        var sc = document.createElement('script'); sc.src = LIVE_LIB; sc.onload = ok; sc.onerror = nein;
        document.head.appendChild(sc);
      });
    }
    function liveZeigen() {
      var an = !!live || liveStartet;
      liveKnopf.classList.toggle('an', an);
      liveKnopf.textContent = an ? '■ Auflegen' : '📞 Live reden';
      if (pille) { pille.classList.toggle('an', an); pille.textContent = an ? '■ Auflegen' : '📞 Mit ' + NAME + ' reden'; }
    }
    function liveTakt() {
      if (!live) { btn.style.transform = ''; return; }
      var v = 0; try { v = live.getOutputVolume() || 0; } catch (e) {}
      livePuls = livePuls * 0.6 + v * 0.4;
      btn.style.transform = 'scale(' + (1 + Math.min(livePuls, 1) * 0.18).toFixed(3) + ')';
      requestAnimationFrame(liveTakt);
    }
    function liveEnde(t) {
      var l = live; live = null; liveStartet = false;
      btn.classList.remove('live-hoert', 'live-spricht'); btn.style.transform = '';
      liveZeigen(); if (t) liveText.textContent = t;
      if (l) l.endSession().catch(function () {});
    }
    liveKnopf.addEventListener('click', function () {
      if (BUEHNE && !live && !liveStartet) { location.href = BUEHNE; return; }
      if (live || liveStartet) { liveEnde('Aufgelegt.'); return; }
      aufhoeren();
      liveStartet = true; liveZeigen(); liveText.textContent = NAME + ' wacht auf …';
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function () {
        return libLaden();
      }, function () { throw new Error('mic'); }).then(function () {
        return window.ElevenLabsClient.Conversation.startSession({
          agentId: AGENT, connectionType: 'websocket',
          onConnect: function () { liveText.textContent = NAME + ' hört zu.'; },
          onDisconnect: function () { if (live || liveStartet) liveEnde('Bis bald!'); },
          onError: function (m) { liveText.textContent = 'Fehler: ' + (m || 'unbekannt'); },
          onMessage: function (m) { if (m && m.message) say(m.source === 'user' ? 'du' : 'nova', m.message); },
          onModeChange: function (m) {
            var sp = m && m.mode === 'speaking';
            btn.classList.toggle('live-spricht', sp); btn.classList.toggle('live-hoert', !sp);
            liveText.textContent = sp ? NAME + ' spricht …' : NAME + ' hört zu.';
          }
        });
      }).then(function (c) {
        if (!liveStartet) { c.endSession().catch(function () {}); return; }
        live = c; liveStartet = false; liveZeigen(); requestAnimationFrame(liveTakt);
      }).catch(function (e) {
        liveStartet = false; liveZeigen();
        liveText.textContent = e && e.message === 'mic' ? 'Bitte das Mikrofon erlauben.' : 'Keine Verbindung. Nochmal tippen.';
      });
    });

    state();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
