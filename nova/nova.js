/* Nova für alle DR-Lab-Apps.
   Einbinden: <script src="../nova/nova.js" data-nova-app="Mondschein" defer></script>
   Nova redet nur mit Sense Engine (eigener Server, eigene Datenbank). Sense Engine
   fragt Papa Hermes und speichert jede Erfahrung selbst.
   Adresse und Passwort teilen sich alle Apps (gleiche Schlüssel wie Transkript). */
(function () {
  if (window.__nova) return;
  window.__nova = true;

  var me = document.currentScript;
  var APP = (me && me.getAttribute('data-nova-app')) || document.title || 'DR Lab';
  var K = { addr: 'drlab-hermes-adresse', key: 'drlab-hermes-passwort' };

  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var fromLink = (location.hash.match(/hermes=([^&]+)/) || [])[1];
  if (fromLink) {
    put(K.addr, decodeURIComponent(fromLink));
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }
  function addr() { return String(get(K.addr, '') || '').trim().replace(/\/+$/, ''); }
  function ready() { return /^https:\/\//.test(addr()) && !!get(K.key, ''); }

  var css = '' +
    '.nova-btn{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:2147483000;width:60px;height:60px;border-radius:50%;border:0;padding:0;background:#1e5bd8;box-shadow:0 6px 18px rgba(20,40,110,.35);cursor:pointer;display:grid;place-items:center}' +
    '.nova-btn:focus-visible{outline:3px solid #ffd34d;outline-offset:3px}' +
    '.nova-btn svg{width:46px;height:46px}' +
    '.nova-btn[data-wach="0"]{filter:saturate(.45)}' +
    '.nova-panel{position:fixed;right:12px;left:12px;bottom:calc(86px + env(safe-area-inset-bottom,0px));z-index:2147483000;max-width:420px;margin-left:auto;max-height:70vh;display:flex;flex-direction:column;background:#f6f8ff;color:#14213d;border-radius:18px;box-shadow:0 12px 40px rgba(20,40,110,.3);font:15px/1.45 system-ui,-apple-system,sans-serif;overflow:hidden}' +
    '.nova-panel[hidden]{display:none!important}' +
    '.nova-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#1e5bd8;color:#fff}' +
    '.nova-head b{font-size:17px}.nova-head small{opacity:.85;margin-left:auto}' +
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
    '@media (prefers-color-scheme:dark){.nova-panel{background:#101a33;color:#e8edff}.nova-msg.du{background:#24386e}.nova-msg.nova{background:#16244a;border-color:#2b3d70}.nova-row,.nova-opt{background:#16244a;border-color:#2b3d70;color:#aab6da}.nova-row input,.nova-set input{background:#0c1530;color:#e8edff;border-color:#2b3d70}.nova-set{background:#13203f;border-color:#2b3d70}.nova-row button.mic{background:#24386e;color:#cfe0ff}}' +
    '@media (prefers-reduced-motion:no-preference){.nova-btn[data-wach="1"] svg .glow{animation:novaGlow 2.6s ease-in-out infinite}}' +
    '@keyframes novaGlow{50%{opacity:.35}}';

  var face = '<svg viewBox="0 0 48 48" aria-hidden="true">' +
    '<circle class="glow" cx="24" cy="24" r="22" fill="#7fb2ff" opacity=".7"/>' +
    '<path d="M8 25a16 16 0 0 1 32 0z" fill="#3d7cf0"/>' +
    '<circle cx="24" cy="28" r="12" fill="#ffe3cf"/>' +
    '<circle cx="19.5" cy="28" r="2.2" fill="#14213d"/><circle cx="28.5" cy="28" r="2.2" fill="#14213d"/>' +
    '<circle cx="20.2" cy="27.2" r=".7" fill="#fff"/><circle cx="29.2" cy="27.2" r=".7" fill="#fff"/>' +
    '<path d="M21 33q3 2.4 6 0" stroke="#d0606e" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<circle cx="24" cy="10" r="2.4" fill="#ffd34d"/></svg>';

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var a in attrs) e.setAttribute(a, attrs[a]);
    if (html) e.innerHTML = html;
    return e;
  }

  function build() {
    var style = el('style'); style.textContent = css; document.head.appendChild(style);

    var btn = el('button', { 'class': 'nova-btn', type: 'button', 'aria-label': 'Nova öffnen', 'aria-expanded': 'false' }, face);
    var panel = el('div', { 'class': 'nova-panel', role: 'dialog', 'aria-label': 'Nova' });
    panel.hidden = true;
    panel.innerHTML =
      '<div class="nova-head"><b>Nova</b><small class="nova-state"></small></div>' +
      '<div class="nova-log" aria-live="polite"></div>' +
      '<form class="nova-row"><input class="nova-in" type="text" id="nova-in" placeholder="Frag Nova …" autocomplete="off">' +
      '<button type="button" class="mic" aria-label="Sprechen">🎙</button><button type="submit">Senden</button></form>' +
      '<label class="nova-opt"><input type="checkbox" id="nova-wunsch"> Als Bauwunsch an Claude</label>' +
      '<details class="nova-set"><summary>Verbindung zu Sense Engine</summary>' +
      '<input id="nova-addr" type="url" placeholder="https://sense-…sslip.io">' +
      '<input id="nova-key" type="password" placeholder="Passwort" autocomplete="off">' +
      '<button type="button" class="nova-save">Speichern</button></details>';
    document.body.appendChild(btn);
    document.body.appendChild(panel);

    var $ = function (s) { return panel.querySelector(s); };
    var log = $('.nova-log'), input = $('.nova-in');

    function state() {
      var w = ready();
      btn.setAttribute('data-wach', w ? '1' : '0');
      $('.nova-state').textContent = w ? 'wach' : 'schläft noch';
      $('#nova-addr').value = addr();
      $('#nova-key').value = get(K.key, '') ? '••••••••' : '';
      if (!w) $('.nova-set').open = true;
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
        if (!log.children.length) say('nova', ready() ? 'Hallo, ich bin Nova. Wie kann ich helfen?' : 'Ich schlafe noch. Sobald Sense Engine läuft, trag unten die Verbindung ein.');
        input.focus();
      }
    });

    $('.nova-save').addEventListener('click', function () {
      var a = $('#nova-addr').value.trim(), k = $('#nova-key').value.trim();
      if (a && !/^https:\/\//.test(a)) a = 'https://' + a;
      put(K.addr, a);
      if (k && k !== '••••••••') put(K.key, k);
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

    function ask(text) {
      return fetch(addr() + '/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + get(K.key, ''), 'X-Nova-App': APP },
        body: JSON.stringify({ model: 'hermes-agent', messages: [{ role: 'user', content: text }] })
      }).then(function (r) {
        if (r.status === 401 || r.status === 403) throw new Error('Das Passwort stimmt nicht.');
        if (!r.ok) throw new Error('Nova erreicht Papa Hermes gerade nicht (Fehler ' + r.status + ').');
        return r.json();
      }).then(function (j) {
        return (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '…';
      });
    }

    $('.nova-row').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      say('du', text);
      var wunsch = $('#nova-wunsch').checked;
      if (!ready()) { say('nova', 'Ich schlafe noch. Trag unten die Verbindung zu Sense Engine ein.'); return; }
      if (wunsch) {
        wish(text).then(function () { say('nova', 'Dein Bauwunsch liegt in Sense Engine. Mama Claudine holt ihn dort ab.'); },
          function (e) { say('nova', e.message); });
        $('#nova-wunsch').checked = false;
        return;
      }
      var wait = say('nova', '…');
      ask(text).then(function (a) {
        wait.textContent = a;
      }, function (e) { wait.textContent = e.message; });
    });

    var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
    var mic = $('.mic');
    if (!SR) mic.hidden = true;
    mic.addEventListener('click', function () {
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = 'de-CH'; rec.interimResults = true;
      var base = input.value ? input.value + ' ' : '';
      rec.onresult = function (e) {
        var t = ''; for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        input.value = base + t;
      };
      rec.onend = function () { rec = null; mic.classList.remove('an'); };
      mic.classList.add('an'); rec.start();
    });

    state();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
