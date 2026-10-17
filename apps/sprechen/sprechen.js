/* DR Lab Sprech-Baustein: mit der Figur reden (Vorlage für alle Apps)
   Einbinden (eine Zeile vor </body>):
   <script src="../apps/sprechen/sprechen.js" data-figur="flo" data-name="Flo" data-bild="figur.jpg" defer></script>
   Optional:
     data-audio="audio/flo/"   Ordner mit manifest.json + MP3 (Figurenstimme, Kategorien wie im Stimmenplan)
     data-endpoint="https://…" DR-Lab-Server für freie Antworten (erst nach «Server Go»). Leer = nur feste Sätze.
     data-unten="96"           Abstand des Knopfs vom unteren Rand in px (bei Tab-Leisten)
     data-handystimme="nein"   ohne Audio-Datei nicht mit der Handystimme vorlesen
     data-saetze='{"gruss":["…"]}' eigene feste Sätze pro Kategorie (Fallback, solange keine Audios da sind)
   Verlauf bleibt auf dem Gerät. Ohne Endpunkt geht nichts weg. Keine Schlüssel in der App. */
(() => {
  'use strict';
  const me = document.currentScript;
  const d = (me && me.dataset) || {};
  const FIG = (d.figur || 'figur').toLowerCase();
  const NAME = d.name || 'Ich';
  const BILD = d.bild || 'figur.jpg';
  const AUDIO = d.audio || '';
  const ENDPOINT = d.endpoint || '';
  const UNTEN = parseInt(d.unten || '18', 10);
  const HANDY = d.handystimme !== 'nein';
  const KEY = 'drlab_sprechen_' + FIG;
  const ruhig = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, v){ try{ const x = localStorage.getItem(KEY + k); return x === null ? v : JSON.parse(x); }catch(e){ return v; } },
    set(k, v){ try{ localStorage.setItem(KEY + k, JSON.stringify(v)); }catch(e){} }
  };
  let stumm = store.get('stumm', false);

  const STANDARD = {
    gruss: ['Hallo! Schön, dass du da bist. Erzähl mir, was dich beschäftigt.', 'Hoi! Ich höre dir zu, ganz in Ruhe.'],
    abschied: ['Bis bald! Ich bin da, wenn du mich brauchst.', 'Tschüss, und pass gut auf dich auf.'],
    lob: ['Das hast du richtig gut gemacht!', 'Danke dir, das freut mich sehr.'],
    mut: ['Das klingt anstrengend. Wir machen einfach einen kleinen Schritt nach dem anderen.', 'Du musst das nicht allein schaffen. Atme einmal tief, ich bin da.'],
    frage: ['Gute Frage! Schau mal hier in der App, da zeige ich es dir Schritt für Schritt.', 'Das möchte ich dir gern genau erklären. Bald kann ich frei antworten, bis dahin helfen dir die Knöpfe hier.'],
    hilfe: ['Ich bin da. Wenn es dringend ist, ruf bitte sofort jemanden an, der dir direkt helfen kann.'],
    spass: ['Haha, du bringst mich zum Lachen!', 'Weisst du was? Mit dir macht das richtig Spass.'],
    uebergang: ['Mmh, verstehe. Erzähl mir ruhig noch ein bisschen mehr.', 'Ich habe dir zugehört. Magst du es noch anders sagen?']
  };
  let eigene = {};
  try{ eigene = d.saetze ? JSON.parse(d.saetze) : (window.SPRECHEN_SAETZE || {}); }catch(e){}

  // Erkennen, worum es geht (einfach, auf dem Gerät)
  const MUSTER = [
    ['notfall', /(umbringen|nicht mehr leben|suizid|selbstmord|schlägt mich|gewalt|bedroht)/i],
    ['hilfe', /(hilfe|notfall|angst|panik|weiss nicht weiter|weiß nicht weiter)/i],
    ['abschied', /(tschüss|tschau|ciao|adieu|bis bald|bis morgen|gute nacht|uf widerluege)/i],
    ['gruss', /^(hallo|hoi|hey|hi|grüezi|grüss|salü|guten (morgen|tag|abend))/i],
    ['lob', /(danke|merci|super|toll|geschafft|fertig|lieb)/i],
    ['mut', /(traurig|müde|schlecht|schaff|stress|allein|weh|schmerz|kann nicht)/i],
    ['spass', /(witz|lustig|lach|spass|spiel)/i],
    ['frage', /(\?|^wie |^was |^warum |^wo |^wann |^kannst|^hilfst)/i]
  ];
  const art = t => { for (const [k, r] of MUSTER) if (r.test(t)) return k; return 'uebergang'; };

  let manifest = null;
  async function ladeManifest(){
    if (manifest || !AUDIO) return manifest || [];
    try{ const r = await fetch(AUDIO + 'manifest.json', {cache:'force-cache'}); manifest = r.ok ? await r.json() : []; }
    catch(e){ manifest = []; }
    return manifest;
  }
  const zuletzt = {};
  function waehle(liste, k){
    if (!liste.length) return null;
    let i = Math.floor(Math.random() * liste.length);
    if (liste.length > 1 && i === zuletzt[k]) i = (i + 1) % liste.length;
    zuletzt[k] = i; return liste[i];
  }

  async function antwort(text){
    const k = art(text);
    if (k === 'notfall') return {text:'Das klingt sehr ernst, und du bist nicht allein. Bitte ruf jetzt an: Die Dargebotene Hand 143, für Jugendliche 147, Polizei 117, Sanität 144.', notfall:true};
    if (ENDPOINT){
      try{
        const c = new AbortController(); const to = setTimeout(() => c.abort(), 9000);
        const r = await fetch(ENDPOINT, {method:'POST', headers:{'Content-Type':'application/json'}, signal:c.signal,
          body: JSON.stringify({app: document.title, figur: FIG, text})});
        clearTimeout(to);
        if (r.ok){ const j = await r.json(); if (j && j.text) return {text:j.text, audio:j.audio || ''}; }
      }catch(e){}
    }
    const alle = await ladeManifest(), hat = c => alle.filter(x => (x.id || '').indexOf('_' + c + '_') > 0);
    let m = hat(k); if (!m.length && k === 'hilfe') m = hat('mut');
    const a = waehle(m, 'a' + k);
    if (a) return {text:a.text, audio: AUDIO + a.datei};
    const s = (eigene[k] && eigene[k].length ? eigene[k] : STANDARD[k] || STANDARD.uebergang);
    return {text: waehle(s, 's' + k)};
  }

  // Aussehen
  const css = `
  .sp-knopf{position:fixed;right:16px;bottom:calc(${UNTEN}px + env(safe-area-inset-bottom));z-index:9000;width:66px;height:66px;border-radius:50%;border:3px solid #F2C14E;padding:0;background:#0E1838 center/cover;box-shadow:0 10px 26px -8px rgba(0,0,0,.6),0 0 0 6px rgba(242,193,78,.15);cursor:pointer;animation:spSchweben 4.6s ease-in-out infinite}
  .sp-knopf::after{content:"🎙";position:absolute;right:-4px;bottom:-4px;width:26px;height:26px;border-radius:50%;background:#F2C14E;color:#0E1838;font-size:14px;line-height:26px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.35)}
  .sp-knopf.hoert{animation:spPuls 1.1s ease-in-out infinite}
  .sp-knopf.spricht{animation:spReden .5s ease-in-out infinite alternate}
  .sp-blase{box-sizing:border-box;position:fixed;right:16px;left:16px;max-width:440px;margin-left:auto;bottom:calc(${UNTEN + 80}px + env(safe-area-inset-bottom));z-index:9001;background:linear-gradient(160deg,#1d2c66,#0f1b3d);color:#f6efe0;border:1px solid rgba(242,193,78,.55);border-radius:22px 22px 6px 22px;padding:14px 16px 12px;font:16px/1.45 -apple-system,system-ui,sans-serif;box-shadow:0 18px 40px -12px rgba(0,0,0,.6);display:none}
  .sp-blase.on{display:block;animation:spAuf .35s ease-out both}
  .sp-kopf{display:flex;align-items:center;gap:8px;margin-bottom:6px}
  .sp-kopf b{flex:1;color:#F2C14E;font-size:15px}
  .sp-kopf button{min-width:40px;min-height:40px;border-radius:99px;border:1px solid rgba(255,255,255,.18);background:transparent;color:inherit;font-size:16px;cursor:pointer}
  .sp-du{color:#c9d2ee;font-size:14px;font-style:italic;min-height:1em}
  .sp-sie{margin-top:6px;font-size:17px}
  .sp-sie.notfall{color:#ffd0c4;font-weight:600}
  .sp-ein{display:flex;gap:8px;margin-top:10px}
  .sp-ein input{flex:1;min-width:0;box-sizing:border-box;min-height:46px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:inherit;font:inherit;padding:0 12px}
  .sp-ein button{min-width:46px;min-height:46px;border-radius:14px;border:0;background:#F2C14E;color:#0E1838;font-size:18px;font-weight:700;cursor:pointer}
  .sp-ein .sp-mic{background:rgba(255,255,255,.1);color:inherit}
  .sp-ein .sp-mic.rec{background:#d6413b;color:#fff}
  .sp-klein{margin-top:8px;font-size:12px;color:#9aa6c8}
  @keyframes spSchweben{50%{transform:translateY(-5px)}}
  @keyframes spPuls{50%{box-shadow:0 0 0 12px rgba(214,65,59,.25),0 0 30px rgba(214,65,59,.5)}}
  @keyframes spReden{to{transform:scale(1.07) rotate(-3deg)}}
  @keyframes spAuf{from{opacity:0;transform:translateY(10px)}}
  @media (prefers-reduced-motion:reduce){.sp-knopf,.sp-knopf.hoert,.sp-knopf.spricht,.sp-blase.on{animation:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const knopf = document.createElement('button');
  knopf.type = 'button'; knopf.className = 'sp-knopf';
  knopf.style.backgroundImage = 'url("' + BILD + '")';
  knopf.setAttribute('aria-label', 'Mit ' + NAME + ' reden');
  const blase = document.createElement('div');
  blase.className = 'sp-blase'; blase.setAttribute('role', 'dialog'); blase.setAttribute('aria-label', 'Mit ' + NAME + ' reden');
  blase.innerHTML = `<div class="sp-kopf"><b>${NAME}</b><button type="button" class="sp-ton" aria-label="Ton"></button><button type="button" class="sp-zu" aria-label="Schliessen">✕</button></div>
    <div class="sp-du"></div><div class="sp-sie" aria-live="polite"></div>
    <div class="sp-ein"><button type="button" class="sp-mic" aria-label="Sprechen">🎙</button><input type="text" enterkeyhint="send" placeholder="Oder schreib es hier"><button type="button" class="sp-los" aria-label="Senden">→</button></div>
    <div class="sp-klein">${ENDPOINT ? 'Antworten kommen vom DR-Lab-Server.' : 'Bleibt auf deinem Handy. ' + NAME + ' antwortet mit festen Sätzen, freie Antworten folgen.'}</div>`;
  const $ = s => blase.querySelector(s);
  const du = $('.sp-du'), sie = $('.sp-sie'), feld = $('input'), mic = $('.sp-mic'), ton = $('.sp-ton');
  const zeigeTon = () => { ton.textContent = stumm ? '🔇' : '🔊'; };
  zeigeTon();

  function start(){
    document.body.appendChild(knopf); document.body.appendChild(blase);
    knopf.onclick = () => { if (blase.classList.contains('on')) { hoeren(); return; } oeffnen(); hoeren(); };
    $('.sp-zu').onclick = () => { blase.classList.remove('on'); stopp(); };
    ton.onclick = () => { stumm = !stumm; store.set('stumm', stumm); zeigeTon(); if (stumm) stopp(); };
    mic.onclick = hoeren;
    $('.sp-los').onclick = () => senden(feld.value);
    feld.addEventListener('keydown', e => { if (e.key === 'Enter') senden(feld.value); });
  }
  function oeffnen(){
    blase.classList.add('on');
    if (!sie.textContent) sie.textContent = 'Hallo, ich bin ' + NAME + '. Sag mir einfach, was du brauchst.';
  }

  // Zuhören (Spracherkennung im Browser)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  if (!SR) mic.style.display = 'none';
  function hoeren(){
    if (!SR){ feld.focus(); return; }
    if (rec){ try{ rec.stop(); }catch(e){} return; }
    stopp();
    rec = new SR(); rec.lang = d.sprache || 'de-CH'; rec.interimResults = true; rec.maxAlternatives = 1;
    let fertig = '';
    rec.onresult = e => { let t = ''; for (const r of e.results){ t += r[0].transcript; if (r.isFinal) fertig = t; } du.textContent = '«' + t + '»'; };
    rec.onerror = e => { if (e.error === 'not-allowed') sie.textContent = 'Ich darf das Mikrofon noch nicht benutzen. Erlaube es in den Einstellungen oder schreib mir.'; };
    rec.onend = () => { knopf.classList.remove('hoert'); mic.classList.remove('rec'); const t = fertig || (du.textContent || '').replace(/[«»]/g, ''); rec = null; if (t.trim()) senden(t); };
    try{ rec.start(); knopf.classList.add('hoert'); mic.classList.add('rec'); du.textContent = 'Ich höre zu …'; }catch(e){ rec = null; feld.focus(); }
  }

  // Antworten (Figurenstimme, sonst Text)
  let spieler = null;
  function stopp(){ if (spieler){ spieler.pause(); spieler = null; } try{ speechSynthesis.cancel(); }catch(e){} knopf.classList.remove('spricht'); }
  async function senden(t){
    t = (t || '').trim(); if (!t) return;
    feld.value = ''; du.textContent = '«' + t + '»'; sie.textContent = '…'; sie.classList.remove('notfall');
    const a = await antwort(t);
    sie.textContent = a.text; if (a.notfall) sie.classList.add('notfall');
    sprechen(a);
  }
  function sprechen(a){
    stopp(); if (stumm) return;
    const an = () => { if (!ruhig) knopf.classList.add('spricht'); }, aus = () => knopf.classList.remove('spricht');
    if (a.audio){
      spieler = new Audio(a.audio); spieler.preload = 'auto';
      spieler.onplay = an; spieler.onended = aus;
      spieler.onerror = () => { aus(); handy(a.text, an, aus); };
      spieler.play().catch(() => { aus(); handy(a.text, an, aus); });
      return;
    }
    handy(a.text, an, aus);
  }
  function handy(text, an, aus){
    if (!HANDY || !window.speechSynthesis) return;
    try{
      const u = new SpeechSynthesisUtterance(text); u.lang = 'de-DE'; u.rate = 1; u.pitch = 1.05;
      const v = speechSynthesis.getVoices().filter(x => /^de/i.test(x.lang));
      if (v.length) u.voice = v.find(x => /premium|enhanced|natural/i.test(x.name)) || v[0];
      u.onstart = an; u.onend = aus; speechSynthesis.speak(u);
    }catch(e){}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
