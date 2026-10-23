/* DR Lab · Lernen-Knopf
   Jede App kann lernen: Rueckmeldungen gehen an unseren eigenen Server (Sense Engine, /erfahrung).
   Ohne Server wird gemerkt (Warteschlange im Geraet) und spaeter still nachgeliefert.
   Einbinden: script src="lernen.js" data-app="Fompa" data-figur="fompa" data-name="Fompa" data-kind="0" data-unten="16" defer
   Ausschalten: window.DRLAB_LERNEN = false */
(function () {
  'use strict';
  try {
    if (window.DRLAB_LERNEN === false || window.__drlabLernen) return;
    window.__drlabLernen = true;

    var me = document.currentScript || document.querySelector('script[src*="lernen.js"]') || { dataset: {} };
    var ds = me.dataset || {};
    var APP = ds.app || document.title || 'App';
    // Figur als Schluessel wie im KI-Verse: klein, ohne Leerzeichen, Umlaute oder Punkte (z. B. mrping, zahnboecklein).
    var FIGUR = String(ds.figur || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/[^a-z0-9]/g, '');
    var NAME = ds.name || APP;
    var KIND = ds.kind === '1';
    var UNTEN = parseInt(ds.unten, 10); if (isNaN(UNTEN)) UNTEN = 16;
    var K = { addr: 'drlab-hermes-adresse', key: 'drlab-hermes-passwort', q: 'drlab-lernen-warteschlange' };

    // Gleiche Leselogik wie nova/nova.js: Werte sind JSON-kodiert.
    function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
    function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    function addr() { return String(get(K.addr, '') || '').trim().replace(/\/+$/, ''); }
    function ready() { return /^https?:\/\//.test(addr()) && !!get(K.key, ''); }

    function queue() { var q = get(K.q, []); return Array.isArray(q) ? q : []; }
    function merken(e) { var q = queue(); q.push(e); while (q.length > 50) q.shift(); put(K.q, q); }

    function senden(e) {
      if (!ready() || !window.fetch) return Promise.reject(new Error('kein Server'));
      var ctl = window.AbortController ? new AbortController() : null;
      var t = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
      return fetch(addr() + '/erfahrung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + get(K.key, '') },
        body: JSON.stringify(e),
        signal: ctl ? ctl.signal : undefined
      }).then(function (r) { clearTimeout(t); if (!r.ok) throw new Error('Fehler ' + r.status); },
              function (err) { clearTimeout(t); throw err; });
    }

    var leert = false;
    function nachliefern() {
      if (leert || !ready()) return;
      var q = queue(); if (!q.length) return;
      leert = true;
      (function weiter() {
        var q2 = queue();
        if (!q2.length) { leert = false; return; }
        senden(q2[0]).then(function () {
          var q3 = queue(); q3.shift(); put(K.q, q3); weiter();
        }, function () { leert = false; });
      })();
    }

    function bauen() {
      var host = document.createElement('div');
      host.setAttribute('data-drlab-lernen', '');
      host.style.pointerEvents = 'none'; // nur Pille und offenes Fenster nehmen Tipper an, nie der Rahmen
      var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
      var u = 'calc(' + UNTEN + 'px + env(safe-area-inset-bottom,0px))';
      root.innerHTML =
        '<style>' +
        ':host{all:initial;pointer-events:none}' +
        '.pill,.bg,.sheet{pointer-events:auto}' +
        '.pill.weg{visibility:hidden;pointer-events:none}' +
        '*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}' +
        '.pill{position:fixed;left:16px;bottom:' + u + ';z-index:2147482990;border:0;border-radius:999px;padding:10px 16px;font-size:15px;font-weight:600;background:#fff8ec;color:#4a3410;box-shadow:0 4px 14px rgba(60,40,10,.25);cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:manipulation}' +
        '.pill.kind{opacity:.6;font-size:13px;padding:8px 12px}' +
        '.pill.halten{background:#f3e2c0}' +
        '.bg{position:fixed;inset:0;z-index:2147482995;background:rgba(30,20,10,.35);display:none}' +
        '.sheet{position:fixed;left:0;right:0;bottom:0;margin:0 auto;max-width:480px;z-index:2147482996;background:#fffdf8;color:#2b2113;border-radius:20px 20px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -8px 30px rgba(0,0,0,.25);display:none;max-height:85vh;overflow:auto}' +
        'h2{margin:0 0 10px;font-size:18px}' +
        'textarea{width:100%;min-height:96px;border:1px solid #e3d6bd;border-radius:12px;padding:10px;font-size:16px;background:#fff;color:#2b2113;resize:vertical}' +
        '.reihe{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}' +
        '.chip{border:1px solid #e3d6bd;background:#fff;border-radius:999px;padding:7px 12px;font-size:14px;cursor:pointer;color:#2b2113}' +
        '.los{border:0;border-radius:12px;padding:12px 18px;font-size:16px;font-weight:600;background:#c9822b;color:#fff;cursor:pointer;flex:1}' +
        '.mic{border:1px solid #e3d6bd;background:#fff;border-radius:12px;padding:10px 14px;font-size:18px;cursor:pointer}' +
        '.mic.an{background:#ffe2d6}' +
        '.zu{float:right;border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:#6b5a3e}' +
        '.klein{font-size:12.5px;color:#6b5a3e;margin:10px 0 0}' +
        '.punkt{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:#c7b9a0}' +
        '.punkt.ok{background:#3aa55d}' +
        '.msg{min-height:20px;font-size:14px;margin-top:8px;color:#3d6b2e}' +
        '</style>' +
        '<button class="pill" type="button" aria-label="Lernen"></button>' +
        '<div class="bg"></div>' +
        '<div class="sheet" role="dialog" aria-modal="true">' +
        '<button class="zu" type="button" aria-label="Schliessen">×</button>' +
        '<h2></h2>' +
        '<textarea maxlength="2000" placeholder="Schreib oder sprich, was besser werden soll …"></textarea>' +
        '<div class="reihe chips"></div>' +
        '<div class="reihe"><button class="mic" type="button" aria-label="Sprechen">🎤</button><button class="los" type="button">Senden</button></div>' +
        '<div class="msg" aria-live="polite"></div>' +
        '<p class="klein">Geht an unseren eigenen Server in der Schweiz. Bitte keine Namen oder Gesundheitsdaten von anderen.</p>' +
        '<p class="klein"><span class="punkt"></span><span class="stat"></span></p>' +
        '</div>';
      document.body.appendChild(host);

      function $(s) { return root.querySelector(s); }
      var pill = $('.pill'), ta = $('textarea'), msg = $('.msg'), mic = $('.mic');
      $('h2').textContent = 'Was soll ' + NAME + ' lernen?';
      pill.textContent = KIND ? '🔒 Eltern' : '📚 Lernen';
      if (KIND) { pill.classList.add('kind'); pill.title = '2 Sekunden gedrueckt halten'; }

      ['Das war gut 👍', 'Das fehlt mir', 'Das war unklar'].forEach(function (c) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = c;
        b.onclick = function () { ta.value = ta.value ? c + ': ' + ta.value : c + ': '; ta.focus(); };
        $('.chips').appendChild(b);
      });

      function status() {
        var ok = ready();
        $('.punkt').className = 'punkt' + (ok ? ' ok' : '');
        $('.stat').textContent = ok ? 'verbunden' : 'noch nicht verbunden';
      }
      function oeffnen() { status(); msg.textContent = ''; setOffen(true); setTimeout(function () { try { ta.focus(); } catch (e) {} }, 50); }
      var offen = false;
      function setOffen(o) { offen = o; if (o) pill.classList.remove('weg'); [$('.bg'), $('.sheet')].forEach(function (el) { el.style.display = o ? 'block' : 'none'; }); if (!o) pruefen(); }
      function schliessen() { setOffen(false); stopMic(); }
      $('.zu').onclick = schliessen; $('.bg').onclick = schliessen;

      // Nicht unter Novas Knopf oder der Pille «Mit … reden» liegen: bei Ueberschneidung nach oben ausweichen.
      function ausweichen() {
        try {
          pill.style.bottom = '';
          var r = pill.getBoundingClientRect(), hoch = 0;
          document.querySelectorAll('.nova-pille,.nova-btn').forEach(function (o) {
            var q = o.getBoundingClientRect();
            if (!q.width || q.left > r.right + 6 || q.right < r.left - 6 || q.top > r.bottom || q.bottom < r.top) return;
            hoch = Math.max(hoch, window.innerHeight - q.top + 8);
          });
          if (hoch) pill.style.bottom = hoch + 'px';
        } catch (e) {}
      }
      [0, 1500, 4000].forEach(function (ms) { setTimeout(ausweichen, ms); });
      window.addEventListener('resize', ausweichen);

      // Fenster der App (Dialog, Blatt, Erststart) haben Vorrang: solange eines offen ist oder die Pille
      // verdeckt, wird sie unsichtbar und nimmt keine Tipper an. Danach kommt sie zurueck.
      function sichtbar(el) {
        try {
          if (!el.getClientRects().length) return false;
          var cs = getComputedStyle(el);
          return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.05;
        } catch (e) { return false; }
      }
      function fremd(el) { return el && el !== host && !(el.closest && el.closest('.nova-pille,.nova-btn,[class*="musik"],[id*="musik"]')); }
      var MODAL = 'dialog[open],[aria-modal="true"]';
      // Erstes Element an einem Punkt, das nicht unseres ist.
      function oben(x, y) {
        var l = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
        for (var i = 0; i < l.length; i++) if (l[i] !== host) return l[i];
        return null;
      }
      // Ein Fenster gilt als offen, wenn es sichtbar im Bild liegt und in seiner Mitte wirklich oben liegt
      // (geschlossene Blaetter haengen oft unsichtbar oder ausserhalb des Bildes im Dokument).
      function offenesFenster(el, wirt) {
        if (!fremd(wirt || el) || !sichtbar(el)) return false;
        var r = el.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
        var l = Math.max(0, r.left), t = Math.max(0, r.top), rr = Math.min(vw, r.right), b = Math.min(vh, r.bottom);
        if (rr - l < 4 || b - t < 4) return false;
        var o = oben((l + rr) / 2, (t + b) / 2);
        return !!o && (o === (wirt || el) || el.contains(o));
      }
      function modalIn(r, wirt) {
        var l = r.querySelectorAll(MODAL);
        for (var i = 0; i < l.length; i++) if (offenesFenster(l[i], wirt)) return true;
        return false;
      }
      // Liegt an diesem Punkt eine grosse feste Ebene (Hintergrund eines Fensters, Vollbild-Blatt)?
      function ebene(el) {
        var vw = window.innerWidth || 1, vh = window.innerHeight || 1;
        for (var n = el, i = 0; n && n.nodeType === 1 && n !== document.body && n !== document.documentElement && i < 25; n = n.parentElement, i++) {
          if (!fremd(n)) return false;
          if (n.shadowRoot && modalIn(n.shadowRoot, n)) return true;
          var cs = getComputedStyle(n);
          if (n.tagName === 'DIALOG' || n.getAttribute('role') === 'dialog' || n.getAttribute('role') === 'alertdialog') return sichtbar(n);
          if (cs.position !== 'fixed') continue;
          if (parseFloat(cs.opacity) <= 0.05 || cs.visibility === 'hidden') return false;
          var z = parseInt(cs.zIndex, 10), r = n.getBoundingClientRect();
          var gross = (r.width * r.height) / (vw * vh) >= 0.3 || (r.height >= vh * 0.3 && r.width >= vw * 0.6);
          return gross && z > 0;
        }
        return false;
      }
      function verdeckt() {
        if (modalIn(document)) return true;
        var r = pill.getBoundingClientRect();
        if (!r.width) return false;
        var el = oben(r.left + r.width / 2, r.top + r.height / 2); // nur das oberste fremde Element zaehlt
        if (!el || el === document.body || el === document.documentElement) return false;
        return ebene(el);
      }
      var zuletzt = 0, geplant = null;
      function pruefen() {
        try {
          if (offen) { pill.classList.remove('weg'); return; }
          pill.classList.toggle('weg', verdeckt());
        } catch (e) {}
      }
      function bald() {
        if (geplant || document.hidden) return;
        var warte = Math.max(0, 500 - (Date.now() - zuletzt));
        geplant = setTimeout(function () { geplant = null; zuletzt = Date.now(); pruefen(); }, warte);
      }
      try {
        if (window.MutationObserver) new MutationObserver(function (ms) {
          for (var i = 0; i < ms.length; i++) if (!host.contains(ms[i].target)) { bald(); return; }
        }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'hidden', 'class', 'style', 'aria-modal', 'aria-hidden'] });
      } catch (e) {}
      var takt = null;
      function takten() {
        if (takt) { clearInterval(takt); takt = null; }
        if (!document.hidden) { takt = setInterval(pruefen, 700); pruefen(); }
      }
      document.addEventListener('visibilitychange', takten);
      window.addEventListener('resize', bald);
      ['animationend', 'transitionend'].forEach(function (n) { document.addEventListener(n, bald, true); });
      takten();
      // Falls die Pille trotzdem einen Tipper abbekommt, der einem Fenster gilt: weiterreichen.
      function durchreichen(e) {
        if (offen || !verdeckt()) return false;
        pill.classList.add('weg');
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        try {
          var r = pill.getBoundingClientRect();
          var x = e && e.clientX != null ? e.clientX : r.left + r.width / 2, y = e && e.clientY != null ? e.clientY : r.top + r.height / 2;
          var ziel = document.elementFromPoint(x, y);
          if (ziel && ziel !== host && e.type === 'click' && ziel.click) ziel.click();
        } catch (x2) {}
        return true;
      }

      if (KIND) {
        var tm = null;
        var start = function (e) { if (durchreichen(e)) return; if (e && e.preventDefault) e.preventDefault(); pill.classList.add('halten'); tm = setTimeout(function () { tm = null; pill.classList.remove('halten'); oeffnen(); }, 2000); };
        var stop = function () { pill.classList.remove('halten'); if (tm) { clearTimeout(tm); tm = null; } };
        pill.addEventListener('pointerdown', start);
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { pill.addEventListener(n, stop); });
        pill.addEventListener('contextmenu', function (e) { e.preventDefault(); });
        pill.addEventListener('click', durchreichen);
      } else {
        pill.onclick = function (e) { if (!durchreichen(e)) oeffnen(); };
      }

      var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
      function stopMic() { if (rec) { try { rec.stop(); } catch (e) {} rec = null; mic.classList.remove('an'); } }
      if (!SR) { mic.style.display = 'none'; } else {
        mic.onclick = function () {
          if (rec) { stopMic(); return; }
          try {
            rec = new SR(); rec.lang = 'de-CH'; rec.interimResults = false;
            var vorher = ta.value;
            rec.onresult = function (ev) { var t = ''; for (var i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript; ta.value = (vorher ? vorher + ' ' : '') + t; };
            rec.onend = function () { rec = null; mic.classList.remove('an'); };
            rec.onerror = rec.onend;
            rec.start(); mic.classList.add('an');
          } catch (e) { rec = null; mic.classList.remove('an'); }
        };
      }

      $('.los').onclick = function () {
        var text = ta.value.trim();
        if (!text) { msg.textContent = 'Schreib zuerst ein paar Worte.'; return; }
        stopMic();
        var e = { app: APP, figur: FIGUR, art: 'lernen', frage: text, antwort: '', zeit: new Date().toISOString() };
        var gemerkt = function () { merken(e); ta.value = ''; msg.textContent = 'Gemerkt. ' + NAME + ' lernt es, sobald der Server verbunden ist.'; };
        if (!ready()) { gemerkt(); return; }
        msg.textContent = 'Wird gesendet …';
        senden(e).then(function () { ta.value = ''; msg.textContent = 'Danke, ' + NAME + ' lernt das.'; nachliefern(); }, gemerkt);
      };
    }

    function los() { try { bauen(); } catch (e) {} try { nachliefern(); } catch (e) {} }
    if (document.body) los(); else document.addEventListener('DOMContentLoaded', los);
    window.addEventListener('online', function () { try { nachliefern(); } catch (e) {} });
  } catch (e) { /* nie die App stoeren */ }
})();
