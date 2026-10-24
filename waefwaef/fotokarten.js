/* Fotokarten (Design 23.10.): Wäf Wäf und eure eigenen Hundefotos als kleine Polaroid-Karten.
   Abgerundet, weicher Schatten, Bildunterschrift wie von Hand. Fotos vom Handy kommen verkleinert
   (längste Seite 640 px, JPEG) als dataURL in den Speicher dieses Geräts (localStorage, Schlüssel
   waef_fotokarten), höchstens 12 Karten und ca. 2.4 MB. Nichts geht ins Internet. */
(function () {
  'use strict';
  if (window.__fotokarten) return; window.__fotokarten = 1;
  var KEY = 'waef_fotokarten', MAX = 12, MAX_BYTES = 2400000, SEITE = 640;

  function hol() { try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function leg(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); return true; } catch (e) { return false; } }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function datum(ts) { var d = new Date(ts); return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear(); }
  function toast(t) { try { if (window.R8 && R8.toast) { R8.toast(t); return; } } catch (e) {} var m = document.getElementById('fkMeldung'); if (m) m.textContent = t; }

  var st = document.createElement('style');
  st.textContent =
    '.fk-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 12px;margin:14px 2px 6px;padding:4px 2px}' +
    '.fk-karte{position:relative;margin:0;padding:8px 8px 10px;background:#FFFDF8;border-radius:10px;' +
    'box-shadow:0 1px 2px rgba(20,40,80,.08),0 8px 22px rgba(20,40,80,.14);transform:rotate(var(--fk-dreh,0deg));color:#18233D}' +
    '.fk-karte:nth-child(3n+1){--fk-dreh:-1.6deg}.fk-karte:nth-child(3n+2){--fk-dreh:1.2deg}.fk-karte:nth-child(3n){--fk-dreh:-.6deg}' +
    '.fk-karte img{display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px;background:#EEF2F8}' +
    '.fk-karte figcaption{padding:8px 2px 0;text-align:center}' +
    '.fk-karte input{width:100%;box-sizing:border-box;border:0!important;background:transparent!important;color:#18233D!important;' +
    'font:500 17px/1.25 "Fredoka","Figtree",system-ui,sans-serif;text-align:center;padding:4px 2px;min-height:36px;border-radius:6px;box-shadow:none!important}' +
    '.fk-karte input:focus{outline:2px solid #2563EB;outline-offset:1px}' +
    '.fk-karte .fk-name{display:block;font:500 17px/1.25 "Fredoka","Figtree",system-ui,sans-serif;padding:4px 2px;min-height:36px;box-sizing:border-box}' +
    '.fk-karte small{display:block;font-size:12px;color:#56607A;margin-top:1px}' +
    '.fk-karte .fk-weg{position:absolute;top:-10px;right:-10px;width:44px;height:44px;min-width:44px;min-height:44px;padding:0;border-radius:50%;' +
    'display:grid;place-items:center;font-size:16px;line-height:1;background:#FFFFFF!important;color:#56607A!important;border:1px solid #E3E9F4!important;box-shadow:0 2px 8px rgba(20,40,80,.15)!important}' +
    '.fk-karte .fk-tape{position:absolute;top:-8px;left:50%;width:56px;height:18px;margin-left:-28px;background:rgba(242,193,78,.55);border-radius:3px;transform:rotate(-3deg);pointer-events:none}' +
    '.fk-reihe{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}' +
    '.fk-klein{font-size:.9rem;color:var(--t-leise,#56607A);margin:10px 0 0}' +
    '.fk-meldung{font-size:.92rem;color:var(--t-primaer-text-auf-hell,#1D4FD1);min-height:1.2em;margin:6px 0 0}' +
    '.fk-datei{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}' +
    '@media (prefers-reduced-motion:no-preference){.fk-karte.neu{animation:fkEin .5s cubic-bezier(.2,.8,.2,1) both}' +
    '@keyframes fkEin{from{opacity:0;transform:translateY(10px) rotate(0deg) scale(.96)}}}';
  document.head.appendChild(st);

  var karte, grid;
  function bauen() {
    if (document.getElementById('fotokarten')) return true;
    var tag = document.getElementById('v-tag'); if (!tag) return false;
    var inhalt =
      '<p>Wäf Wäf und eure schönsten Momente als kleine Fotokarten. Die Fotos bleiben nur auf diesem Handy.</p>' +
      '<div class="fk-grid" id="fkGrid"></div>' +
      '<div class="fk-reihe"><label class="r8-btn voll" for="fkDatei" role="button" tabindex="0" id="fkPlus">📷 Foto hinzufügen</label>' +
      '<input class="fk-datei" id="fkDatei" type="file" accept="image/*" aria-label="Foto vom Handy wählen"></div>' +
      '<p class="fk-meldung" id="fkMeldung" aria-live="polite"></p>' +
      '<p class="fk-klein">Höchstens ' + MAX + ' Fotos. Tipp auf den Text unter dem Bild, um ihn zu ändern.</p>';
    if (window.R8 && R8.karte) { karte = R8.karte('fotokarten', '📷 Fotokarten', inhalt); karte.id = 'fotokarten'; }
    else {
      karte = document.createElement('section'); karte.className = 'r8 r8-karte'; karte.id = 'fotokarten';
      karte.innerHTML = '<h2>📷 Fotokarten</h2>' + inhalt;
    }
    var nach = tag.querySelector('.r6-char') || document.getElementById('logbuch');
    if (nach && nach.parentNode) nach.parentNode.insertBefore(karte, nach.nextSibling); else tag.appendChild(karte);
    grid = karte.querySelector('#fkGrid');
    var datei = karte.querySelector('#fkDatei');
    karte.querySelector('#fkPlus').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); datei.click(); } });
    datei.addEventListener('change', function () { var f = datei.files && datei.files[0]; datei.value = ''; if (f) neu(f); });
    zeichnen();
    return true;
  }

  function zeichnen(neuId) {
    if (!grid) return;
    var l = hol();
    var html = '<figure class="fk-karte"><span class="fk-tape" aria-hidden="true"></span><img src="figur.jpg" alt="Wäf Wäf" loading="lazy">' +
      '<figcaption><span class="fk-name">Wäf Wäf</span><small>unser Hund</small></figcaption></figure>';
    l.slice().reverse().forEach(function (x) {
      html += '<figure class="fk-karte' + (x.id === neuId ? ' neu' : '') + '" data-id="' + esc(x.id) + '">' +
        '<img src="' + esc(x.src) + '" alt="' + esc(x.t || 'Foto') + '">' +
        '<figcaption><input type="text" maxlength="40" value="' + esc(x.t) + '" aria-label="Bildunterschrift" enterkeyhint="done"><small>' + esc(datum(x.ts)) + '</small></figcaption>' +
        '<button type="button" class="fk-weg" aria-label="Foto entfernen">✕</button></figure>';
    });
    grid.innerHTML = html;
    [].forEach.call(grid.querySelectorAll('.fk-karte[data-id]'), function (k) {
      var id = k.getAttribute('data-id');
      var inp = k.querySelector('input');
      inp.addEventListener('change', function () { var l2 = hol(); l2.forEach(function (x) { if (x.id === id) x.t = inp.value.trim().slice(0, 40); }); leg(l2); k.querySelector('img').alt = inp.value || 'Foto'; });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') inp.blur(); });
      k.querySelector('.fk-weg').addEventListener('click', function () {
        if (!window.confirm('Dieses Foto entfernen?')) return;
        leg(hol().filter(function (x) { return x.id !== id; })); zeichnen(); toast('Foto entfernt.');
      });
    });
  }

  function verkleinern(src, seite, q, fertig, fehler) {
    var im = new Image();
    im.onload = function () {
      try {
        var w = im.naturalWidth, h = im.naturalHeight, f = Math.min(1, seite / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * f)); c.height = Math.max(1, Math.round(h * f));
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
        fertig(c.toDataURL('image/jpeg', q));
      } catch (e) { fehler(); }
    };
    im.onerror = fehler;
    im.src = src;
  }

  function neu(f) {
    var l = hol();
    if (l.length >= MAX) { toast('Schon ' + MAX + ' Fotos. Entferne zuerst eines.'); return; }
    if (!/^image\//.test(f.type || 'image/')) { toast('Das ist kein Bild.'); return; }
    if (f.size > 25e6) { toast('Das Bild ist zu gross.'); return; }
    toast('Foto wird kleiner gemacht …');
    var url = (window.URL && URL.createObjectURL) ? URL.createObjectURL(f) : null;
    function los(src) {
      verkleinern(src, SEITE, 0.72, function (d) {
        if (d.length > 260000) { verkleinern(src, 480, 0.6, speichern, kaputt); return; }
        speichern(d);
      }, kaputt);
    }
    function aufraeumen() { if (url) try { URL.revokeObjectURL(url); } catch (e) {} }
    function kaputt() { aufraeumen(); toast('Dieses Bild kann ich leider nicht öffnen.'); }
    function speichern(d) {
      aufraeumen();
      var l2 = hol(), summe = d.length;
      l2.forEach(function (x) { summe += (x.src || '').length; });
      if (summe > MAX_BYTES) { toast('Der Foto-Speicher ist voll. Entferne zuerst ein altes Foto.'); return; }
      var x = { id: 'f' + Date.now().toString(36), src: d, t: '', ts: Date.now() };
      l2.push(x);
      if (!leg(l2)) { toast('Kein Platz mehr auf dem Handy für dieses Foto.'); return; }
      zeichnen(x.id); toast('Neue Fotokarte. Wäf!');
      var inp = grid.querySelector('[data-id="' + x.id + '"] input'); if (inp) { inp.placeholder = 'Was war da?'; }
    }
    if (url) los(url);
    else { var r = new FileReader(); r.onload = function () { los(r.result); }; r.onerror = kaputt; r.readAsDataURL(f); }
  }

  window.WaefFotokarten = { zeichnen: zeichnen, neu: neu };
  var n = 0;
  function versuch() { if (bauen() || ++n > 20) return; setTimeout(versuch, 300); }
  if (document.readyState === 'complete') setTimeout(versuch, 400);
  else window.addEventListener('load', function () { setTimeout(versuch, 400); });
})();
