/* Coin Maker · Runde 4: drei neue Helfer (alles nur auf diesem Gerät, Coins ohne Geldwert)
   1. Ideen-Vorlage «Problem · Lösung · Nutzen» (Vorbild: Ideen-Vorlagen in Produkt-Tools): ein Tipp füllt das Gerüst ein,
      genau die drei Punkte, die der Coin Maker bewertet.
   2. Werkstatt-Serie (Vorbild: Lern-Serien in Sprach-Apps): wie viele Tage in Folge du in der Werkstatt warst.
   3. Sparziel im Münzladen (Vorbild: Sparziele/Tresore in Banking-Apps): ein Ding als Ziel markieren, Fortschrittsbalken. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  function hol(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function leg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var css = document.createElement('style');
  css.textContent = [
    '.zv-reihe{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
    '.zv-knopf{min-height:44px;padding:0 14px;border-radius:12px;border:2px dashed var(--brass-dk);background:#fff3cf;color:#2a1a08;font:800 .95rem var(--f-body);cursor:pointer}',
    '.zv-serie{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 12px;border-radius:999px;background:rgba(242,193,78,.14);border:1px solid rgba(242,193,78,.5);color:#ffe08a;font:800 .9rem var(--f-body);margin-left:6px;vertical-align:middle}',
    '.zv-ziel{background:linear-gradient(135deg,#2c2160,#1a1440);border:1px solid #f2c14e88;border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:8px}',
    '.zv-ziel b{color:var(--gold)}.zv-ziel small{color:var(--ink-2);font-size:.95rem}',
    '.zv-balken{height:12px;border-radius:6px;background:#3b3160;overflow:hidden}.zv-balken i{display:block;height:100%;width:0;border-radius:6px;background:linear-gradient(90deg,#f2c14e,#ffe08a);transition:width .8s cubic-bezier(.22,.8,.26,1)}',
    '.zv-stern{min-height:40px;border:1px solid var(--line);background:transparent;color:var(--ink-2);border-radius:10px;font:700 .9rem var(--f-body);cursor:pointer;margin-top:6px}',
    '.zv-stern[aria-pressed=true]{background:#f2c14e;color:#2a1a08;border-color:#f2c14e}',
    '@media (prefers-reduced-motion:reduce){.zv-balken i{transition:none}}'
  ].join('\n');
  document.head.appendChild(css);

  /* 1. Ideen-Vorlage */
  var txt = $('txt'), box = $('textBox');
  if (txt && box) {
    var r = document.createElement('div'); r.className = 'zv-reihe';
    var k = document.createElement('button'); k.type = 'button'; k.className = 'zv-knopf'; k.textContent = '✍️ Vorlage: Problem · Lösung · Nutzen';
    r.appendChild(k);
    var mic = $('mic'); if (mic) r.appendChild(mic);
    box.insertBefore(r, txt);
    k.addEventListener('click', function () {
      var alt = txt.value.trim();
      var beispiel = alt.indexOf('Zähneputzen') >= 0;
      txt.value = 'Problem: ' + (beispiel || !alt ? '' : alt) + '\nLösung: \nNutzen (wem hilft es?): ';
      txt.focus(); var p = txt.value.indexOf('\n'); try { txt.setSelectionRange(p, p); } catch (e) {}
      txt.dispatchEvent(new Event('input'));
      if (window.CMPlus) CMPlus.sag('Drei kurze Sätze reichen. Genau das prüfe ich mit der Lupe.', 'Problem, Lösung, Nutzen.');
    });
    new MutationObserver(function () { r.hidden = !!(box.hidden); }).observe(box, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* 2. Werkstatt-Serie */
  function serie() {
    var tage = (hol('coinmaker.lernen', {}) || {}).tage || [];
    var set = {}; tage.forEach(function (t) { set[t] = 1; });
    var d = new Date(), n = 0;
    function key(x) { return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); }
    if (!set[key(d)]) d.setDate(d.getDate() - 1);
    // Runde 8: Serien-Schutz wie Duolingo – ein verpasster Tag pro Kalenderwoche bricht die Serie nicht («Ruhetag»).
    var benutzt = {};
    function woche(x) { var m = new Date(x); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return key(m); }
    for (var g = 0; g < 400; g++) {
      if (set[key(d)]) { n++; d.setDate(d.getDate() - 1); continue; }
      var vor = new Date(d); vor.setDate(vor.getDate() - 1);
      if (n > 0 && !benutzt[woche(d)] && set[key(vor)]) { benutzt[woche(d)] = 1; d = vor; continue; }
      break;
    }
    return n;
  }
  var tag = document.querySelector('.werk-kopf .tag'), chip = null;
  function zeigeSerie() {
    var n = serie(); if (!tag) return;
    if (n < 1) { if (chip) chip.hidden = true; return; }
    if (!chip) { chip = document.createElement('span'); chip.className = 'zv-serie'; tag.parentNode.insertBefore(chip, tag.nextSibling); }
    chip.hidden = false; chip.textContent = '🔥 ' + n + (n === 1 ? ' Tag' : ' Tage in Folge');
    chip.title = 'Werkstatt-Serie: so viele Tage in Folge warst du hier. Ein Ruhetag pro Woche zählt mit.';
  }

  /* 3. Sparziel im Münzladen */
  function saldo() { var t = $('sTotal'); if (t && /^-?\d+$/.test(t.textContent.trim())) return parseInt(t.textContent, 10); var s = hol('coinmaker.v1', null); return s && Array.isArray(s.items) ? s.items.reduce(function (a, i) { return a + (i.coins || 0); }, 0) : 0; }
  var shop = $('shop'), zielBox = null;
  function zeigeZiel() {
    if (!shop) return;
    var ziel = hol('coinmaker.ziel', '');
    shop.querySelectorAll('.item').forEach(function (it) {
      var btn = it.querySelector('.buy'); if (!btn) return; var id = btn.id.replace('buy-', '');
      var s = it.querySelector('.zv-stern');
      if (!s) { s = document.createElement('button'); s.type = 'button'; s.className = 'zv-stern'; it.appendChild(s); s.addEventListener('click', function () { leg('coinmaker.ziel', hol('coinmaker.ziel', '') === id ? '' : id); zeigeZiel(); }); }
      var an = ziel === id; s.setAttribute('aria-pressed', String(an)); s.textContent = an ? '★ Mein Ziel' : '☆ Als Ziel';
    });
    var item = ziel && $('buy-' + ziel) && $('buy-' + ziel).closest('.item');
    if (!item) { if (zielBox) zielBox.hidden = true; return; }
    var name = item.querySelector('b').textContent, preis = parseInt(item.querySelector('.price').textContent, 10) || 1, s = Math.max(0, saldo());
    if (!zielBox) { zielBox = document.createElement('div'); zielBox.className = 'zv-ziel'; shop.parentNode.insertBefore(zielBox, shop); }
    zielBox.hidden = false;
    var fertig = s >= preis;
    zielBox.innerHTML = '<span><b>Dein Ziel:</b> ' + name.replace(/[<>&]/g, '') + '</span><div class="zv-balken" role="progressbar" aria-valuemin="0" aria-valuemax="' + preis + '" aria-valuenow="' + Math.min(s, preis) + '"><i></i></div><small>' + (fertig ? 'Geschafft! Du kannst es einlösen. ✨' : Math.min(s, preis) + ' von ' + preis + ' Coins · noch ' + (preis - s) + ', etwa ' + Math.ceil((preis - s) / 15) + ' gute Ideen') + '</small>';
    requestAnimationFrame(function () { var i = zielBox.querySelector('.zv-balken i'); if (i) i.style.width = Math.min(100, s / preis * 100) + '%'; });
  }
  if (shop) new MutationObserver(function () { setTimeout(zeigeZiel, 0); }).observe(shop, { childList: true });
  zeigeSerie(); zeigeZiel();
  var tot = $('sTotal'); if (tot) new MutationObserver(function () { zeigeSerie(); zeigeZiel(); }).observe(tot, { childList: true, characterData: true, subtree: true });
})();
