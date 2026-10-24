/* sperrbildschirm.js – Otti bleibt oben, wenn man die App verlässt (wie Google Maps, Web-Variante).
   Solange eine Geschichte läuft (Vorlesen oder «Nur hören»), zeigt das iPhone auf dem Sperrbildschirm,
   im Kontrollzentrum und oben in der Dynamic Island: Aura-Otti, Titel, «Seite x von n» und die ungefähre Restzeit.
   Antippen führt zurück in die App, Play/Pause/Weiter/Zurück steuern die Geschichte.
   Nur Titel und Seitenzahl, nie Worte oder Name des Kindes. Keine Links nach aussen, keine Daten gehen weg.
   Das iPhone zeigt das nur, solange hörbarer Ton läuft (Ottis Aufnahmen oder Nova-Stimme). */
(function(){
  "use strict";
  if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
  const L = window.MS_LESER, T = window.MS_TON;
  if (!L || !T || !T.TTS) return;
  const R = L.R, TTS = T.TTS, S = T.S || {}, nav = L.nav;
  const ms = navigator.mediaSession;
  const BILD = [{ src: new URL('aura/otti-sperrbildschirm-512.png', location.href).href, sizes: '512x512', type: 'image/png' }];
  let meinMeta = null, letzteSig = '';

  function hoeren(){ try { return window.MS_HOEREN ? MS_HOEREN.zustand() : null; } catch(e){ return null; } }
  function wps(){ const r = +S.rate || 1; return 2.1 * r; } // Wörter pro Sekunde (geschätzt)
  function woerter(p){
    const t = p.q ? p.q + ' ' + p.opts.map(o => o.l).join(' ') : String(p.t || '');
    return t.split(/\s+/).filter(Boolean).length;
  }
  // Ungefähre Dauer jeder Seite in Sekunden (Text + Pause dazwischen)
  function dauern(seq){ return seq.map(p => woerter(p) / wps() + (p.fq ? 7 : 1.8)); }
  const seqCache = new Map();
  function seqFuer(st){
    if (!st) return [];
    if (!seqCache.has(st.id)) { try { seqCache.set(st.id, L.buildSeq(st)); } catch(e){ seqCache.set(st.id, []); } }
    return seqCache.get(st.id);
  }

  // Was läuft gerade? null = nichts.
  function lage(){
    const h = hoeren();
    if (h && h.on){
      const st = (L.stories() || []).find(s => s.title === h.titel) || null;
      const seq = seqFuer(st);
      return { modus: 'hoeren', titel: h.titel || 'Nur hören', seq, idx: Math.max(0, h.pi), anteil: 0, spielt: !h.pause };
    }
    if (L.aktuell() === 'reader' && R.story && (R.reading || R.started)){
      const n = (R.sents && R.sents.length) || 1;
      return { modus: 'lesen', titel: R.story.title, seq: R.seq, idx: R.idx, anteil: Math.min(1, (R.sent || 0) / n), spielt: !!R.reading };
    }
    return null;
  }

  function aktualisieren(){
    const l = lage();
    if (!l){
      if (meinMeta && ms.metadata === meinMeta){ try { ms.metadata = null; ms.playbackState = 'none'; } catch(e){} }
      meinMeta = null; letzteSig = '';
      return;
    }
    const n = l.seq.length || 1, seite = Math.min(n, l.idx + 1);
    const untertitel = 'Otti erzählt · Seite ' + seite + ' von ' + n;
    if (!meinMeta || ms.metadata !== meinMeta || meinMeta.title !== l.titel || meinMeta.artist !== untertitel){
      try { meinMeta = new MediaMetadata({ title: l.titel, artist: untertitel, album: 'Mondschein', artwork: BILD }); ms.metadata = meinMeta; } catch(e){}
    }
    try { ms.playbackState = l.spielt ? 'playing' : 'paused'; } catch(e){}
    // Fortschritt + Restzeit (geschätzt). Das iPhone zählt beim Abspielen selbst weiter.
    const sig = [l.modus, l.titel, l.idx, l.anteil, l.spielt].join('|');
    if (sig !== letzteSig && ms.setPositionState && l.seq.length){
      letzteSig = sig;
      const d = dauern(l.seq), total = d.reduce((a, b) => a + b, 0);
      let pos = 0; for (let i = 0; i < l.idx && i < d.length; i++) pos += d[i];
      pos += (d[l.idx] || 0) * l.anteil;
      try { ms.setPositionState({ duration: Math.max(1, total), position: Math.min(total, pos), playbackRate: l.spielt ? 1 : 0 }); } catch(e){}
    }
  }

  // Knöpfe auf dem Sperrbildschirm: gelten für «Nur hören» und für das Vorlesen.
  function knopf(art){
    const h = hoeren();
    if (h && h.on){
      if (art === 'play') MS_HOEREN.pause(false);
      else if (art === 'pause') MS_HOEREN.pause(true);
      else if (MS_HOEREN.springe) MS_HOEREN.springe(art === 'weiter' ? 1 : -1);
    } else if (R.story){
      const b = document.getElementById('rPlay');
      if (art === 'play' && !R.reading && b) b.click();
      else if (art === 'pause' && R.reading && b) b.click();
      else if (art === 'weiter') nav(1);
      else if (art === 'zurueck') nav(-1);
    }
    setTimeout(aktualisieren, 50);
  }
  [['play','play'], ['pause','pause'], ['stop','pause'], ['nexttrack','weiter'], ['previoustrack','zurueck']].forEach(([a, k]) => {
    try { ms.setActionHandler(a, () => knopf(k)); } catch(e){}
  });
  ['seekforward', 'seekbackward', 'seekto'].forEach(a => { try { ms.setActionHandler(a, null); } catch(e){} });

  // Bei jedem Satz, jedem Halt und regelmässig nachführen.
  const sp = TTS.speak, st = TTS.stop;
  TTS.speak = function(){ const r = sp.apply(this, arguments); setTimeout(aktualisieren, 0); return r; };
  TTS.stop = function(){ const r = st.apply(this, arguments); setTimeout(aktualisieren, 0); return r; };
  setInterval(aktualisieren, 1000);
  document.addEventListener('visibilitychange', aktualisieren);
  window.MS_SPERRBILDSCHIRM = { lage, aktualisieren };
})();
