/* DR Lab Feedback-Knopf (Vorlage für alle Apps)
   Einbinden: <script src="feedback.js" data-app="Kiki" defer></script>
   Optional: ein Element mit [data-feedback-slot] nimmt den Knopf auf, sonst schwebt er unten rechts.
   Nichts wird automatisch gesendet: Mail-Entwurf oder Kopieren, erst nach Häkchen. Kein Ton, kein Bild. */
(() => {
  'use strict';
  const me = document.currentScript;
  const APP = (me && me.dataset.app) || document.title || 'App';
  const TO = (me && me.dataset.to) || 'diego.robert.zh@gmail.com';
  const KEY = 'drlab_fb_' + APP.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const store = {
    get(k, d){ try{ const v = localStorage.getItem(KEY + k); return v === null ? d : v; }catch(e){ return d; } },
    set(k, v){ try{ localStorage.setItem(KEY + k, v); }catch(e){} }
  };

  const css = `
  .fb-btn{display:inline-flex;align-items:center;justify-content:center;min-width:48px;min-height:48px;border-radius:99px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:inherit;font-size:22px;cursor:pointer;padding:0 12px}
  .fb-btn.float{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:50;background:#f2c14e;color:#2a1f05;box-shadow:0 8px 22px -8px rgba(0,0,0,.6)}
  .fb-veil{position:fixed;inset:0;background:rgba(5,8,25,.6);z-index:60;display:none;align-items:flex-end;justify-content:center}
  .fb-veil.on{display:flex}
  .fb-sheet{width:100%;max-width:560px;max-height:92vh;overflow:auto;background:#141c40;color:#f3efe6;border-radius:24px 24px 0 0;padding:20px 16px calc(20px + env(safe-area-inset-bottom));font:16px/1.45 -apple-system,system-ui,sans-serif;box-shadow:0 -10px 40px rgba(0,0,0,.5)}
  .fb-sheet h3{margin:0 0 4px;font-size:21px;color:#f2c14e}
  .fb-sheet p{margin:4px 0 10px;color:#b9bdd6;font-size:15px}
  .fb-sheet textarea{width:100%;box-sizing:border-box;min-height:140px;border-radius:16px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:inherit;font:inherit;font-size:17px;padding:12px}
  .fb-row{display:flex;gap:10px;margin-top:10px}
  .fb-row button{flex:1;min-height:52px;border-radius:16px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:inherit;font:inherit;font-size:17px;font-weight:600;cursor:pointer}
  .fb-row button.gold{background:#f2c14e;color:#2a1f05;border:0}
  .fb-row button:disabled{opacity:.4}
  .fb-row button.rec{background:#d6413b;color:#fff;border:0}
  .fb-ok{display:flex;gap:10px;align-items:flex-start;margin:12px 0 2px;font-size:15px}
  .fb-ok input{width:22px;height:22px;flex:none;margin-top:2px}
  .fb-msg{min-height:20px;font-size:15px;color:#7fdca4;margin-top:8px}
  .fb-ctx{font-size:13px;color:#8e93b3}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'fb-btn'; btn.id = 'fbBtn';
  btn.setAttribute('aria-label', 'Idee oder Wunsch für ' + APP); btn.textContent = '💬';

  const veil = document.createElement('div');
  veil.className = 'fb-veil';
  veil.innerHTML = `
  <div class="fb-sheet" role="dialog" aria-modal="true" aria-labelledby="fbTitle">
    <h3 id="fbTitle">Idee für ${APP}</h3>
    <p>Schreib oder sprich, was besser werden soll. Claude baut es dann als Entwurf in die App.</p>
    <textarea id="fbText" placeholder="z. B. Kiki soll beim Lied langsamer singen"></textarea>
    <div class="fb-ctx" id="fbCtx"></div>
    <div class="fb-row"><button type="button" id="fbDict">🎤 Sprechen</button><button type="button" id="fbClear">Leeren</button></div>
    <p id="fbDictHint" hidden>Sprechen geht hier über das Mikrofon auf der iPhone-Tastatur (unten rechts).</p>
    <label class="fb-ok"><input type="checkbox" id="fbOk"><span>Ich bin einverstanden, dass dieser Text an DR Lab geht, damit die App besser wird. Es geht nur Text mit, kein Ton und kein Bild.</span></label>
    <div class="fb-row"><button type="button" class="gold" id="fbCopy" disabled>📋 Kopieren für Claude</button></div>
    <div class="fb-row"><button type="button" id="fbMail" disabled>✉️ Per Mail</button></div>
    <div class="fb-msg" id="fbMsg" aria-live="polite"></div>
    <div class="fb-row"><button type="button" id="fbClose">Schliessen</button></div>
  </div>`;

  function mount(){
    const slot = document.querySelector('[data-feedback-slot]');
    if (slot) slot.appendChild(btn); else { btn.classList.add('float'); document.body.appendChild(btn); }
    document.body.appendChild(veil);
    wire();
  }

  const $ = id => veil.querySelector('#' + id);
  function where(){
    const s = document.querySelector('.screen.on');
    const h = s && s.querySelector('h1,h2');
    return (h && h.textContent.trim()) || (s && s.id) || location.pathname;
  }
  function message(){
    const d = new Date();
    const stamp = d.toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' });
    return `${APP}-Idee\nBildschirm: ${ctx}\nDatum: ${stamp}\n\n${$('fbText').value.trim()}\n\n(gesendet aus ${APP}, Feedback-Knopf)`;
  }
  let ctx = '';
  function refresh(){
    const ok = $('fbOk').checked && $('fbText').value.trim().length > 0;
    $('fbMail').disabled = !ok; $('fbCopy').disabled = !ok;
  }

  let rec = null;
  function stopDict(){ if (rec){ try{ rec.stop(); }catch(e){} } }

  function wire(){
    btn.onclick = () => {
      document.dispatchEvent(new CustomEvent('drlab-feedback-open'));
      ctx = where();
      $('fbCtx').textContent = 'Bildschirm: ' + ctx;
      $('fbText').value = store.get('draft', '');
      $('fbMsg').textContent = '';
      refresh();
      veil.classList.add('on');
      setTimeout(() => $('fbText').focus(), 50);
    };
    const close = () => { stopDict(); veil.classList.remove('on'); };
    $('fbClose').onclick = close;
    veil.onclick = e => { if (e.target === veil) close(); };
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && veil.classList.contains('on')) close(); });
    $('fbText').oninput = () => { store.set('draft', $('fbText').value); refresh(); };
    $('fbOk').onchange = refresh;
    $('fbClear').onclick = () => { $('fbText').value = ''; store.set('draft', ''); refresh(); };

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR){ $('fbDict').hidden = true; $('fbDictHint').hidden = false; }
    $('fbDict').onclick = () => {
      if (rec){ stopDict(); return; }
      try{
        rec = new SR(); rec.lang = 'de-CH'; rec.interimResults = true; rec.continuous = true;
        const base = $('fbText').value.trim();
        rec.onresult = e => {
          let t = '';
          for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
          $('fbText').value = (base ? base + ' ' : '') + t.trim();
          store.set('draft', $('fbText').value); refresh();
        };
        rec.onend = rec.onerror = () => { rec = null; $('fbDict').classList.remove('rec'); $('fbDict').textContent = '🎤 Sprechen'; };
        rec.start();
        $('fbDict').classList.add('rec'); $('fbDict').textContent = '⏹ Fertig';
      }catch(e){ rec = null; $('fbDict').hidden = true; $('fbDictHint').hidden = false; }
    };

    const done = txt => { $('fbMsg').textContent = txt; store.set('draft', ''); store.set('sent', String(+store.get('sent', '0') + 1)); };
    $('fbMail').onclick = () => {
      const subj = `[DR Lab Feedback] ${APP}: ${$('fbText').value.trim().slice(0, 50)}`;
      location.href = `mailto:${TO}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(message())}`;
      done('Die Mail-App öffnet sich. Dort auf Senden tippen. Danke!');
    };
    $('fbCopy').onclick = async () => {
      try{ await navigator.clipboard.writeText(message()); done('Kopiert. Jetzt im DR-Lab-Projekt einfügen und senden, Claude baut es ein.'); }
      catch(e){ $('fbText').select(); $('fbMsg').textContent = 'Kopieren ging nicht, bitte Text markieren und kopieren.'; }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
