/* diskret.js – «Diskreter Modus» für Jackie's Advice (22.10.2026)
   - Freiwillig, in «Verlauf» einschaltbar.
   - App-Code mit 4 Ziffern beim Öffnen (und nach mehr als 1 Minute im Hintergrund).
   - Gespeichert wird nur ein Hash (SHA-256 mit Zufalls-Salz), nie der Code selbst. Alles lokal, ohne Server.
   - Neutraler Titel «Notizen» im Browser-Tab und als Name auf dem Startbildschirm-Titel.
   - Notruf 117 / 144 / 142 bleibt auch auf dem Code-Bildschirm antippbar.
   - Code vergessen: App zurücksetzen (wie «Alles löschen»), dann ist der Code weg.
   Einbau: script-Tag mit src="diskret.js" im <head>, früh (vor dem Inhalt). */
(function () {
  'use strict';
  if (window.__jkDiskret) return; window.__jkDiskret = true;
  var KEY = 'ja_diskret', NEUTRAL = 'Notizen', HINTERGRUND_MS = 60000;
  var d = document, root = d.documentElement;

  function lies() { try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && v.an && v.hash ? v : null; } catch (e) { return null; } }
  function schreib(v) { try { if (v) localStorage.setItem(KEY, JSON.stringify(v)); else localStorage.removeItem(KEY); return true; } catch (e) { return false; } }

  /* ---------- Hash ---------- */
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function salz() { var a = new Uint8Array(16); try { crypto.getRandomValues(a); } catch (e) { for (var i = 0; i < 16; i++) a[i] = Math.floor(Math.random() * 256); } return hex(a.buffer); }
  function fnv(s) { var h = 0x811c9dc5; for (var r = 0; r < 2000; r++) for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); }
  function hash(code, s, algo) {
    var txt = s + ':' + code;
    if (algo !== 'fnv' && window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt)).then(function (b) { return { algo: 'sha256', hash: hex(b) }; });
    }
    return Promise.resolve({ algo: 'fnv', hash: fnv(txt) });
  }
  function pruefe(code) { var v = lies(); if (!v) return Promise.resolve(true); return hash(code, v.salt, v.algo).then(function (r) { return r.hash === v.hash; }); }
  function setze(code) { var s = salz(); return hash(code, s).then(function (r) { return schreib({ an: true, salt: s, algo: r.algo, hash: r.hash, seit: Date.now() }); }); }

  /* ---------- Neutraler Titel ---------- */
  var echterTitel = null;
  function titel() {
    var an = !!lies(), m = d.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (an) { if (echterTitel === null && d.title && d.title !== NEUTRAL) echterTitel = d.title; if (d.title !== NEUTRAL) d.title = NEUTRAL; if (m) m.setAttribute('content', NEUTRAL); }
    else if (d.title === NEUTRAL) { d.title = echterTitel || "Jackie's Advice"; echterTitel = null; if (m) m.setAttribute('content', "Jackie's Advice"); }
  }

  /* ---------- Stil (Magazin-Look, hell und dunkel) ---------- */
  var css = [
    'html.jk-zu body>*:not(.jk-schloss){visibility:hidden!important}',
    'html.jk-zu body{overflow:hidden}',
    '.jk-schloss{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:calc(24px + env(safe-area-inset-top,0px)) 20px calc(20px + env(safe-area-inset-bottom,0px));overflow:auto;',
    'background:radial-gradient(120% 70% at 0% 0%,#fde9de,transparent 60%),radial-gradient(90% 70% at 100% 100%,#ecd3e4,transparent 65%),#fbf7f3;color:#2a1c24;font-family:"Jost",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;visibility:visible}',
    '.jk-schloss h1{margin:0;font:500 34px/1.1 "Playfair Display",Georgia,serif;letter-spacing:-.01em;color:#2a1c24}',
    '.jk-schloss p{margin:0;font-size:16px;color:#594751;text-align:center}',
    '.jk-schloss .pkt{display:flex;gap:14px;margin:6px 0 4px}',
    '.jk-schloss .pkt i{width:14px;height:14px;border-radius:50%;border:1.5px solid #7b3f63;display:block}',
    '.jk-schloss .pkt i.an{background:#7b3f63}',
    '.jk-schloss .feld{display:grid;grid-template-columns:repeat(3,72px);gap:14px}',
    '.jk-schloss .feld button{width:72px;height:72px;border-radius:50%;border:1px solid #e2d0c7;background:rgba(255,255,255,.8);color:#2a1c24;font:500 26px/1 "Jost",sans-serif;cursor:pointer;font-variant-numeric:lining-nums}',
    '.jk-schloss .feld button:active{background:#f8e7e2}',
    '.jk-schloss .feld button.leer{visibility:hidden}',
    '.jk-schloss .feld button.weg{font-size:20px}',
    '.jk-schloss .msg{min-height:1.4em;font-size:15px;color:#8a2a22;text-align:center}',
    '.jk-schloss .vergessen{border:0;background:none;color:#7b3f63;font:500 15px "Jost",sans-serif;text-decoration:underline;min-height:44px;padding:0 12px;cursor:pointer}',
    '.jk-schloss .not{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:4px}',
    '.jk-schloss .not a{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 16px;border-radius:999px;background:#fdf1ee;border:1px solid #f1d2cb;color:#8a2a22;text-decoration:none;font-weight:600;font-size:15px}',
    '.jk-schloss .not small{width:100%;text-align:center;font-size:13px;color:#594751}',
    '.jk-schloss.wackel .pkt{animation:jkWackel .4s}',
    '@keyframes jkWackel{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}',
    '@media (prefers-reduced-motion:reduce){.jk-schloss.wackel .pkt{animation:none}}',
    '.jk-schloss :focus-visible{outline:3px solid #7b3f63;outline-offset:2px}',
    '@media (prefers-color-scheme:dark){.jk-schloss{background:radial-gradient(120% 70% at 0% 0%,rgba(214,128,120,.28),transparent 60%),radial-gradient(90% 70% at 100% 100%,rgba(160,96,150,.34),transparent 65%),#17111a;color:#f8eef0}',
    '.jk-schloss h1{color:#f8eef0}.jk-schloss p,.jk-schloss .not small{color:#e2d1d8}.jk-schloss .pkt i{border-color:#efbdd6}.jk-schloss .pkt i.an{background:#efbdd6}',
    '.jk-schloss .feld button{background:rgba(34,26,36,.85);border-color:#4c3a4a;color:#f8eef0}.jk-schloss .feld button:active{background:#3a2836}',
    '.jk-schloss .msg{color:#ffd2cc}.jk-schloss .vergessen{color:#f3c6dc}.jk-schloss .not a{background:#3a1d22;border-color:#6a3236;color:#ffd2cc}.jk-schloss :focus-visible{outline-color:#f3c6dc}}',
    /* Einstellungs-Karte */
    '.jk-dk .dk-reihe{display:flex;align-items:center;justify-content:space-between;gap:12px}',
    '.jk-dk .dk-schalter{position:relative;flex:none;width:56px;height:32px;border-radius:999px;border:0;background:var(--m-line2,#e2d0c7);cursor:pointer;padding:0}',
    '.jk-dk .dk-schalter::after{content:"";position:absolute;top:3px;left:3px;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s}',
    '.jk-dk .dk-schalter[aria-checked=true]{background:var(--m-accent,#7b3f63)}',
    '.jk-dk .dk-schalter[aria-checked=true]::after{transform:translateX(24px)}',
    '.jk-dk .dk-form{display:grid;gap:10px;margin-top:12px}',
    '.jk-dk .dk-form label{display:grid;gap:4px;font-size:14px;color:var(--m-ink2,#594751)}',
    '.jk-dk .dk-form input{min-height:48px;font-size:20px;letter-spacing:.4em;text-align:center}',
    '.jk-dk .dk-msg{min-height:1.2em;font-size:14px;color:var(--m-ink2,#594751);margin:8px 2px 0}',
    '@media (prefers-reduced-motion:reduce){.jk-dk .dk-schalter::after{transition:none}}'
  ].join('\n');
  var st = d.createElement('style'); st.id = 'jkDiskretCss'; st.textContent = css; (d.head || root).appendChild(st);

  /* ---------- Code-Bildschirm ---------- */
  var offen = false, versuche = 0, sperreBis = 0;
  function zeigSchloss() {
    if (!lies() || d.querySelector('.jk-schloss')) return;
    root.classList.add('jk-zu'); offen = false;
    function bau() {
      if (d.querySelector('.jk-schloss') || !d.body) return;
      var el = d.createElement('div'); el.className = 'jk-schloss'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'jkSchlossT');
      var tasten = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
      el.innerHTML = '<h1 id="jkSchlossT">' + NEUTRAL + '</h1><p>Code eingeben</p>' +
        '<div class="pkt" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="msg" aria-live="polite"></div>' +
        '<div class="feld">' + tasten.map(function (t) { return t === '' ? '<button type="button" class="leer" tabindex="-1" aria-hidden="true"></button>' : t === '⌫' ? '<button type="button" class="weg" data-t="weg" aria-label="Löschen">⌫</button>' : '<button type="button" data-t="' + t + '">' + t + '</button>'; }).join('') + '</div>' +
        '<button type="button" class="vergessen">Code vergessen?</button>' +
        '<div class="not"><small>Im Notfall, ohne Code:</small><a href="tel:117">117 Polizei</a><a href="tel:144">144 Sanität</a><a href="tel:142">142 Hilfe</a></div>';
      d.body.appendChild(el);
      var code = '', pkt = el.querySelectorAll('.pkt i'), msg = el.querySelector('.msg');
      function malen() { for (var i = 0; i < 4; i++) pkt[i].classList.toggle('an', i < code.length); }
      function tipp(t) {
        if (Date.now() < sperreBis) { msg.textContent = 'Kurz warten, dann nochmals.'; return; }
        if (t === 'weg') code = code.slice(0, -1); else if (code.length < 4) code += t;
        malen();
        if (code.length === 4) {
          var c = code;
          pruefe(c).then(function (ok) {
            if (ok) { versuche = 0; el.remove(); root.classList.remove('jk-zu'); offen = true; return; }
            versuche++; code = ''; malen(); el.classList.remove('wackel'); void el.offsetWidth; el.classList.add('wackel');
            if (versuche >= 5) { sperreBis = Date.now() + 30000; versuche = 0; msg.textContent = 'Zu oft falsch. Bitte 30 Sekunden warten.'; }
            else msg.textContent = 'Das war nicht der richtige Code.';
          });
        }
      }
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-t]'); if (b) { tipp(b.dataset.t); return; }
        if (e.target.closest('.vergessen')) {
          if (confirm('Ohne Code geht es nur mit Zurücksetzen: Alle Gespräche, Notizen, dein Name und die Einstellungen auf diesem Handy werden gelöscht. Weiter?')) {
            try { var ks = []; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('ja_') === 0) ks.push(k); } ks.forEach(function (k) { localStorage.removeItem(k); }); } catch (x) {}
            location.reload();
          }
        }
      });
      el.addEventListener('keydown', function (e) { if (/^[0-9]$/.test(e.key)) tipp(e.key); else if (e.key === 'Backspace') tipp('weg'); });
      var erster = el.querySelector('[data-t="1"]'); if (erster) try { erster.focus({ preventScroll: true }); } catch (x) {}
    }
    if (d.body) bau(); else d.addEventListener('DOMContentLoaded', bau);
  }

  /* Hintergrund: nach mehr als 1 Minute wieder sperren */
  var wegSeit = 0;
  d.addEventListener('visibilitychange', function () {
    if (d.hidden) { wegSeit = Date.now(); return; }
    if (lies() && wegSeit && Date.now() - wegSeit > HINTERGRUND_MS) zeigSchloss();
  });

  /* ---------- Einstellungen (Karte in «Verlauf») ---------- */
  function karte() {
    var ziel = d.getElementById('vHistory'); if (!ziel || d.getElementById('jkDiskret')) return;
    var vor = d.getElementById('btnDelAll'); vor = vor ? vor.closest('.card') : null;
    var k = d.createElement('div'); k.className = 'card soft jk-dk'; k.id = 'jkDiskret'; k.style.marginTop = '20px';
    ziel.insertBefore(k, vor || null);
    var modus = '';
    function rend() {
      var an = !!lies();
      var form = '';
      if (modus === 'neu') form = '<div class="dk-form"><label>Neuer Code (4 Ziffern)<input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" id="dkA"></label><label>Code nochmals<input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" id="dkB"></label><div class="row"><button class="btn soft" type="button" data-dk="abbrechen">Abbrechen</button><button class="btn" type="button" data-dk="speichern">Einschalten</button></div></div>';
      if (modus === 'aus' || modus === 'aendern') form = '<div class="dk-form"><label>Aktueller Code<input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" id="dkAlt"></label>' +
        (modus === 'aendern' ? '<label>Neuer Code<input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" id="dkA"></label><label>Neuer Code nochmals<input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" id="dkB"></label>' : '') +
        '<div class="row"><button class="btn soft" type="button" data-dk="abbrechen">Abbrechen</button><button class="btn" type="button" data-dk="' + (modus === 'aus' ? 'ausschalten' : 'speichern2') + '">' + (modus === 'aus' ? 'Ausschalten' : 'Code ändern') + '</button></div></div>';
      k.innerHTML = '<div class="dk-reihe"><h3 id="dkT" style="margin:0">Diskreter Modus</h3><button type="button" class="dk-schalter" role="switch" aria-checked="' + an + '" aria-labelledby="dkT" data-dk="schalter"></button></div>' +
        '<p class="muted small" style="margin:8px 0 0">Beim Öffnen fragt die App nach einem Code mit 4 Ziffern. Im Tab und auf dem Startbildschirm steht nur «' + NEUTRAL + '». Der Code bleibt auf diesem Handy, gespeichert wird nur eine verschlüsselte Prüfsumme. Die Notrufnummern bleiben auch ohne Code erreichbar.</p>' +
        (an && !modus ? '<div class="row" style="margin-top:12px"><button class="btn soft" type="button" data-dk="aendern">Code ändern</button></div>' : '') + form +
        '<p class="dk-msg" aria-live="polite"></p>';
      var i1 = k.querySelector('input'); if (i1) i1.focus();
    }
    function msg(t) { var m = k.querySelector('.dk-msg'); if (m) m.textContent = t; }
    function wert(id) { var x = d.getElementById(id); return x ? x.value.trim() : ''; }
    function neuOk() { var a = wert('dkA'), b = wert('dkB'); if (!/^\d{4}$/.test(a)) { msg('Bitte genau 4 Ziffern.'); return null; } if (a !== b) { msg('Die beiden Codes sind nicht gleich.'); return null; } return a; }
    k.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dk]'); if (!b) return; var w = b.dataset.dk;
      if (w === 'schalter') { modus = lies() ? 'aus' : 'neu'; rend(); return; }
      if (w === 'abbrechen') { modus = ''; rend(); return; }
      if (w === 'aendern') { modus = 'aendern'; rend(); return; }
      if (w === 'speichern') { var c = neuOk(); if (!c) return; setze(c).then(function (ok) { modus = ''; rend(); titel(); msg(ok ? 'Diskreter Modus ist an. Merk dir den Code gut.' : 'Speichern ging nicht (Speicher gesperrt).'); }); return; }
      if (w === 'ausschalten' || w === 'speichern2') {
        pruefe(wert('dkAlt')).then(function (ok) {
          if (!ok) { msg('Der aktuelle Code stimmt nicht.'); return; }
          if (w === 'ausschalten') { schreib(null); modus = ''; rend(); titel(); msg('Diskreter Modus ist aus.'); return; }
          var c = neuOk(); if (!c) return; setze(c).then(function () { modus = ''; rend(); msg('Neuer Code gespeichert.'); });
        });
      }
    });
    rend();
  }

  titel();
  zeigSchloss();
  function bereit() { titel(); karte(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', bereit); else bereit();
  window.JackieDiskret = { an: function () { return !!lies(); }, sperren: zeigSchloss };
})();
