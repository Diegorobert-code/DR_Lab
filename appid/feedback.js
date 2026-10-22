/* DR Lab Gesprächsfenster (Vorlage für alle Apps)
   Einbinden: <script src="feedback.js" data-app="Kiki" defer></script>
   Optional: data-endpoint="https://…/v1/gespraech" (DR-Lab-Server). Ohne Endpunkt: Weitergabe als Text oder Mail.
   Optional: ein Element mit [data-feedback-slot] nimmt den Knopf auf, sonst schwebt er unten rechts.
   Verlauf nur auf dem Gerät. Nichts geht ohne Häkchen raus. Kein Ton, kein Bild. */
(() => {
  'use strict';
  const me = document.currentScript;
  const APP = (me && me.dataset.app) || document.title || 'App';
  const TO = (me && me.dataset.to) || 'diego.robert.zh@gmail.com';
  const ENDPOINT = (me && me.dataset.endpoint) || '';
  const KEY = 'drlab_chat_' + APP.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const store = {
    get(k, d){ try{ const v = localStorage.getItem(KEY + k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } },
    set(k, v){ try{ localStorage.setItem(KEY + k, JSON.stringify(v)); }catch(e){} }
  };
  let log = store.get('log', []);          // [{who:'du'|'claude', t, at, out}]
  const save = () => store.set('log', log.slice(-200));

  const css = `
  .fb-btn{display:inline-flex;align-items:center;justify-content:center;min-width:48px;min-height:48px;border-radius:99px;border:1px solid rgba(31,42,37,.18);background:rgba(31,42,37,.08);color:inherit;font-size:22px;cursor:pointer;padding:0 12px;position:relative}
  .fb-btn.float{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:50;background:#c2461f;color:#ffffff;box-shadow:0 8px 22px -8px rgba(0,0,0,.6)}
  .fb-dot{position:absolute;top:4px;right:4px;width:10px;height:10px;border-radius:50%;background:#c2461f;display:none}
  .fb-veil{position:fixed;inset:0;background:rgba(31,42,37,.6);z-index:60;display:none;align-items:flex-end;justify-content:center}
  .fb-veil.on{display:flex}
  .fb-sheet{width:100%;max-width:560px;height:92vh;display:flex;flex-direction:column;background:#fffdf9;color:#1f2a25;border-radius:24px 24px 0 0;padding:16px 16px calc(14px + env(safe-area-inset-bottom));font:16px/1.45 -apple-system,system-ui,sans-serif;box-shadow:0 -10px 40px rgba(0,0,0,.5);box-sizing:border-box}
  .fb-head{display:flex;align-items:center;gap:10px}
  .fb-head h3{flex:1;margin:0;font-size:20px;color:#b5401c}
  .fb-x{min-width:44px;min-height:44px;border-radius:99px;border:1px solid rgba(31,42,37,.18);background:transparent;color:inherit;font-size:20px;cursor:pointer}
  .fb-log{flex:1;overflow:auto;padding:10px 2px;display:flex;flex-direction:column;gap:8px}
  .fb-b{max-width:85%;padding:10px 13px;border-radius:18px;white-space:pre-wrap;word-wrap:break-word;font-size:16px}
  .fb-b.du{align-self:flex-end;background:#c2461f;color:#ffffff;border-bottom-right-radius:6px}
  .fb-b.claude{align-self:flex-start;background:rgba(31,42,37,.09);border-bottom-left-radius:6px}
  .fb-b.info{align-self:center;background:transparent;color:#5d6a63;font-size:14px;text-align:center;max-width:95%}
  .fb-b small{display:block;font-size:12px;opacity:.7;margin-top:3px}
  .fb-in{display:flex;gap:8px;align-items:flex-end}
  .fb-in textarea{flex:1;box-sizing:border-box;min-height:52px;max-height:140px;border-radius:18px;border:1px solid rgba(31,42,37,.18);background:rgba(31,42,37,.06);color:inherit;font:inherit;font-size:17px;padding:13px 14px;resize:none}
  .fb-round{min-width:52px;min-height:52px;border-radius:50%;border:0;font-size:22px;cursor:pointer;background:rgba(31,42,37,.1);color:inherit}
  .fb-round.send{background:#c2461f;color:#ffffff}
  .fb-round.rec{background:#d6413b;color:#fff}
  .fb-out{border-top:1px solid rgba(31,42,37,.12);margin-top:10px;padding-top:8px}
  .fb-ok{display:flex;gap:10px;align-items:flex-start;font-size:14px;color:#5d6a63}
  .fb-ok input{width:22px;height:22px;flex:none;margin-top:1px}
  .fb-row{display:flex;gap:8px;margin-top:8px}
  .fb-row button{flex:1;min-height:48px;border-radius:14px;border:1px solid rgba(31,42,37,.18);background:rgba(31,42,37,.08);color:inherit;font:inherit;font-size:15px;font-weight:600;cursor:pointer}
  .fb-row button.gold{background:#c2461f;color:#ffffff;border:0}
  .fb-row button:disabled{opacity:.4}
  .fb-msg{min-height:18px;font-size:14px;color:#2f6a4f;margin-top:6px}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'fb-btn'; btn.id = 'fbBtn';
  btn.setAttribute('aria-label', 'Mit Claude über ' + APP + ' reden');
  btn.innerHTML = '💬<span class="fb-dot" id="fbDot"></span>';

  const veil = document.createElement('div');
  veil.className = 'fb-veil';
  veil.innerHTML = `
  <div class="fb-sheet" role="dialog" aria-modal="true" aria-labelledby="fbTitle">
    <div class="fb-head"><h3 id="fbTitle">Mit Claude über ${APP} reden</h3><button type="button" class="fb-x" id="fbClose" aria-label="Schliessen">✕</button></div>
    <div class="fb-log" id="fbLog" aria-live="polite"></div>
    <div class="fb-in">
      <button type="button" class="fb-round" id="fbDict" aria-label="Sprechen">🎤</button>
      <textarea id="fbText" rows="1" placeholder="Schreib oder sprich …"></textarea>
      <button type="button" class="fb-round send" id="fbSend" aria-label="Senden">➤</button>
    </div>
    <div class="fb-out" id="fbOut">
      <label class="fb-ok"><input type="checkbox" id="fbOk"><span>Einverstanden: Meine Nachrichten (nur Text, kein Ton, kein Bild) gehen an das Team, damit Claude die App verbessert.</span></label>
      <div class="fb-row"><button type="button" class="gold" id="fbCopy">📋 An Claude weitergeben</button><button type="button" id="fbMail">✉️ Mail</button></div>
      <div class="fb-row"><button type="button" id="fbPaste">↩︎ Claudes Antwort einfügen</button></div>
      <div class="fb-msg" id="fbMsg"></div>
    </div>
  </div>`;

  const $ = id => veil.querySelector('#' + id);
  function where(){
    const s = document.querySelector('.screen.on');
    const h = s && s.querySelector('h1,h2');
    return (h && h.textContent.trim()) || (s && s.id) || location.pathname;
  }
  const fmt = ts => new Date(ts).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' });
  const pending = () => log.filter(m => m.who === 'du' && !m.out);

  function render(){
    const L = $('fbLog'); L.innerHTML = '';
    const info = document.createElement('div'); info.className = 'fb-b info';
    info.textContent = ENDPOINT
      ? 'Claude antwortet hier direkt.'
      : 'Rede einfach rein. Solange der Server fehlt, gibst du die Nachrichten mit einem Tipp an Claude weiter. Die Antwort kommt im Projekt, du kannst sie hier einfügen.';
    L.appendChild(info);
    for (const m of log){
      const b = document.createElement('div'); b.className = 'fb-b ' + m.who;
      b.textContent = m.t;
      const s = document.createElement('small');
      s.textContent = (m.who === 'claude' ? 'Claude · ' : '') + fmt(m.at) + (m.who === 'du' ? (m.out ? ' · weitergegeben' : ' · noch nicht weitergegeben') : '');
      b.appendChild(s); L.appendChild(b);
    }
    L.scrollTop = L.scrollHeight;
    const n = pending().length;
    $('fbOut').hidden = !!ENDPOINT && n === 0;
    $('fbCopy').textContent = n ? `📋 An Claude weitergeben (${n})` : '📋 An Claude weitergeben';
    const ok = $('fbOk').checked && n > 0;
    $('fbCopy').disabled = !ok; $('fbMail').disabled = !ok;
    btn.querySelector('#fbDot').style.display = n ? 'block' : 'none';
  }

  function packet(){
    const ms = pending();
    const lines = ms.map(m => `[${fmt(m.at)} · ${m.ctx || ''}]\n${m.t}`).join('\n\n');
    return `${APP}: Nachricht von Diego aus der App\n\n${lines}\n\n(aus dem Gesprächsfenster in ${APP}; bitte als Entwurf einbauen und hier antworten)`;
  }
  function markOut(){ for (const m of pending()) m.out = true; save(); render(); }

  async function send(){
    const t = $('fbText').value.trim(); if (!t) return;
    stopDict();
    const m = { who: 'du', t, at: Date.now(), ctx: where(), out: false };
    log.push(m); save();
    $('fbText').value = ''; store.set('draft', '');
    render();
    if (!ENDPOINT || !$('fbOk').checked) return;
    try{   // Server-Weg: Antwort erscheint direkt
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: APP, text: t, bildschirm: m.ctx, einwilligung: true }) });
      const j = await r.json();
      m.out = true;
      if (j && j.antwort) log.push({ who: 'claude', t: j.antwort, at: Date.now() });
      save(); render();
    }catch(e){ $('fbMsg').textContent = 'Server nicht erreichbar, du kannst die Nachricht weitergeben.'; }
  }

  let rec = null;
  function stopDict(){ if (rec){ try{ rec.stop(); }catch(e){} } }

  function wire(){
    btn.onclick = () => {
      document.dispatchEvent(new CustomEvent('drlab-feedback-open'));
      $('fbText').value = store.get('draft', '');
      $('fbMsg').textContent = '';
      $('fbOk').checked = store.get('ok', false);
      render();
      veil.classList.add('on');
    };
    const close = () => { stopDict(); veil.classList.remove('on'); };
    $('fbClose').onclick = close;
    veil.onclick = e => { if (e.target === veil) close(); };
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && veil.classList.contains('on')) close(); });
    $('fbText').oninput = () => store.set('draft', $('fbText').value);
    $('fbText').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send(); } };
    $('fbSend').onclick = send;
    $('fbOk').onchange = () => { store.set('ok', $('fbOk').checked); render(); };

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    $('fbDict').onclick = () => {
      if (!SR){ $('fbMsg').textContent = 'Sprechen: im Textfeld das Mikrofon auf der iPhone-Tastatur antippen.'; $('fbText').focus(); return; }
      if (rec){ stopDict(); return; }
      try{
        rec = new SR(); rec.lang = 'de-CH'; rec.interimResults = true; rec.continuous = true;
        const base = $('fbText').value.trim();
        rec.onresult = e => {
          let t = '';
          for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
          $('fbText').value = (base ? base + ' ' : '') + t.trim();
          store.set('draft', $('fbText').value);
        };
        rec.onend = rec.onerror = () => { rec = null; $('fbDict').classList.remove('rec'); $('fbDict').textContent = '🎤'; };
        rec.start(); $('fbDict').classList.add('rec'); $('fbDict').textContent = '⏹';
      }catch(e){ rec = null; $('fbMsg').textContent = 'Sprechen: im Textfeld das Mikrofon auf der iPhone-Tastatur antippen.'; }
    };

    $('fbCopy').onclick = async () => {
      try{ await navigator.clipboard.writeText(packet()); markOut(); $('fbMsg').textContent = 'Kopiert. Jetzt im Projekt einfügen und senden.'; }
      catch(e){ $('fbMsg').textContent = 'Kopieren ging nicht. Bitte «Mail» nehmen.'; }
    };
    $('fbMail').onclick = () => {
      const first = pending()[0];
      const subj = `[Feedback] ${APP}: ${(first ? first.t : '').slice(0, 50)}`;
      location.href = `mailto:${TO}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(packet())}`;
      markOut(); $('fbMsg').textContent = 'Die Mail-App öffnet sich. Dort auf Senden tippen.';
    };
    $('fbPaste').onclick = async () => {
      let t = '';
      try{ t = (await navigator.clipboard.readText()).trim(); }catch(e){}
      if (!t) t = (prompt('Claudes Antwort hier einfügen:') || '').trim();
      if (!t) return;
      log.push({ who: 'claude', t, at: Date.now() }); save(); render();
    };
  }

  function mount(){
    const slot = document.querySelector('[data-feedback-slot]');
    if (slot) slot.appendChild(btn); else { btn.classList.add('float'); document.body.appendChild(btn); }
    document.body.appendChild(veil);
    wire(); render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
