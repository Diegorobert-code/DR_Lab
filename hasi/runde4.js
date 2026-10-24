/* Hasis Laden – Runde 4 (21.10.2026). Hasi spricht nie: alles mit Schild, Geste und Klang.
   1) Antippen: Hasi winkt zuerst zurück (Puppe.winkeZurueck, sobald es das gibt), weitere Tipps zeigen seine Gesten
   2) «Hasis Fund des Tages»: jeden Tag ein anderes Werkzeug im Schaufenster
   3) «Welches Werkzeug passt?»: Rätsel-Ecke mit Hasis Daumen oder Kopfschütteln, Tagesserie
   4) «Mein Werkzeugkasten»: am Tresen merken (♡), oben als eigene Reihe
   Alles nur auf dem Gerät. */
(function () {
  'use strict';
  function los() {
    var H = window.HasiLaden; if (!H || window.HasiR4) return;
    var $ = function (id) { return document.getElementById(id); };
    var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function hol(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
    function leg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    function heute() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
    function summ(m) { try { if (navigator.vibrate) navigator.vibrate(m); } catch (e) {} }
    var W = H.W, laden = W.filter(function (x) { return x.r === 'lab'; });
    function wId(id) { return W.filter(function (x) { return x.id === id; })[0]; }

    var css = [
      '.r4-karte{margin-top:16px}',
      '.r4-fund{display:flex;gap:14px;align-items:center;padding:14px;border-radius:12px;background:linear-gradient(135deg,rgba(232,185,74,.18),rgba(111,227,255,.08));border:1px solid rgba(232,185,74,.45)}',
      '.r4-fund .r4-emo{font-size:44px;line-height:1;flex:none;width:64px;height:64px;display:grid;place-items:center;border-radius:16px;background:rgba(14,24,56,.6);box-shadow:inset 0 0 0 2px var(--c,#e8b94a)}',
      '.r4-fund b{display:block;font-size:18px;color:var(--gold2)}',
      '.r4-fund i{display:block;font-size:15px;line-height:1.4;opacity:.9;margin-top:2px}',
      '.r4-optionen{display:grid;gap:8px}',
      '.r4-optionen button{display:flex;align-items:center;gap:10px;text-align:left;min-height:52px;padding:10px 14px;border-radius:10px;border:1px solid var(--nacht3);background:rgba(255,255,255,.04);color:inherit;font:600 16px var(--body);cursor:pointer;transition:transform .15s,border-color .2s,background .2s}',
      '.r4-optionen button span{font-size:24px}',
      '.r4-optionen button:active{transform:scale(.98)}',
      '.r4-optionen button.ja{border-color:#8fe3a8;background:rgba(143,227,168,.16)}',
      '.r4-optionen button.nein{border-color:#ff9f7a;background:rgba(255,159,122,.12);opacity:.75}',
      '.r4-frage{font-size:18px;line-height:1.4;margin:0}',
      '.r4-frage em{color:var(--gold2);font-style:normal;font-weight:800}',
      '.r4-serie{font-size:14px;opacity:.85}',
      '.r4-kasten{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}',
      '.r4-kasten::-webkit-scrollbar{display:none}',
      '.r4-kasten button{flex:none;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:84px;min-height:84px;padding:10px 8px;border-radius:12px;border:1px solid var(--nacht3);background:rgba(255,255,255,.05);color:inherit;font:700 13px var(--body);cursor:pointer}',
      '.r4-kasten button span{font-size:28px}',
      '.r4-herz{background:transparent;border:2px solid var(--gold);color:var(--gold2)}',
      '.r4-herz[aria-pressed=true]{background:var(--gold);color:var(--nacht)}',
      '.hasi-fig.r4-hallo{animation:r4Hallo .9s cubic-bezier(.3,.7,.3,1)}',
      '@keyframes r4Hallo{25%{transform:translateY(-8px) rotate(-3deg)}55%{transform:translateY(-4px) rotate(3deg)}}',
      '@media (prefers-reduced-motion:reduce){.hasi-fig.r4-hallo{animation:none}.r4-optionen button{transition:none}}'
    ].join('');
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    /* 1) Zurückwinken */
    var zuletzt = 0;
    function winke() {
      var f = $('hasi');
      // Runde 5: Tinkos Bild «Hasi winkt» (Pfote frei) – die Puppe lässt genau diese Pfote schwingen
      H.hasi('winken', 'Hallo!', 'Hasi winkt dir mit der Pfote zurück.', 3200);
      var bild = $('hasiBild'), n = 0;
      (function warte() {
        if (!bild || !window.Puppe || typeof Puppe.winkeZurueck !== 'function') return;
        if (bild.hidden || !/posen\/winken\.jpg/.test(bild.src) || !bild.complete) { if (n++ < 15) setTimeout(warte, 80); return; }
        try { var w = bild._puppeWinker || Puppe.winkeZurueck(bild, { figur: 'hasi', gruss: 'winken+huepfen', antippen: false, ton: false, blase: false, augen: [[9, 9, 0.01, 0.01]], mund: { l: [9, 9], r: [9.1, 9], oben: 0, unten: 0, kinn: 0.01 }, arm: false, kopf: [0.55, 0.38, 0.2], gesicht: [0.55, 0.4, 0.15], winkArm: { x: 0.27, y: 0.53, r: 0.09, dx: 0.35, dy: 0.63, seite: 'links' } }); if (w && w.winke) w.winke(); } catch (e) {}
      })();
      if (!ruhig && f) { f.classList.remove('r4-hallo'); void f.offsetWidth; f.classList.add('r4-hallo'); }
      summ(10);
    }
    document.addEventListener('click', function (e) {
      var f = e.target.closest && e.target.closest('#hasi'); if (!f) return;
      if (document.querySelector('.film-leiste:not([hidden])')) return;
      var jetzt = Date.now();
      if (jetzt - zuletzt > 5000) { zuletzt = jetzt; e.stopPropagation(); winke(); }
    }, true);
    document.addEventListener('animationend', function (e) { if (e.animationName === 'r4Hallo') e.target.classList.remove('r4-hallo'); });

    /* 2) Fund des Tages */
    var tag = Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
    var fund = laden[tag % laden.length];
    var fk = el('<section class="box r4-karte" id="r4fund" aria-labelledby="r4ft"><h2 id="r4ft">🪧 Hasis Fund des Tages</h2>' +
      '<div class="r4-fund" style="--c:' + fund.k + '"><span class="r4-emo">' + fund.e + '</span><div><b>' + esc(fund.n) + '</b><i>' + esc(fund.g) + '</i></div></div>' +
      '<p class="sub" style="margin:0">' + esc(fund.t.split('. ')[0]) + '.</p><div class="knoepfe"><button class="btn an" type="button" data-r4="ansehen">Ins Schaufenster</button></div></section>');
    fk.querySelector('[data-r4=ansehen]').onclick = function () { H.zeige(fund.id); };

    /* 4) Mein Werkzeugkasten */
    function kasten() { return hol('hasi.kasten', []); }
    var kk = el('<section class="box r4-karte" id="r4kasten" aria-labelledby="r4kt" hidden><h2 id="r4kt">🧰 Mein Werkzeugkasten</h2><div class="r4-kasten"></div></section>');
    function kastenZeigen() {
      var l = kasten().map(wId).filter(Boolean); kk.hidden = !l.length;
      var r = kk.querySelector('.r4-kasten'); r.innerHTML = '';
      l.forEach(function (x) { var b = el('<button type="button"><span>' + x.e + '</span>' + esc(x.n) + '</button>'); b.onclick = function () { H.zeige(x.id); }; r.appendChild(b); });
    }
    var tr = $('tresen'), herz = null, offen = null;
    if (tr) {
      var kn = tr.querySelector('.knoepfe');
      herz = el('<button class="btn r4-herz" type="button" aria-pressed="false">♡ In meinen Kasten</button>');
      if (kn) kn.appendChild(herz);
      herz.onclick = function () {
        if (!offen) return; var l = kasten(), i = l.indexOf(offen);
        if (i >= 0) { l.splice(i, 1); H.hasi('nicken', 'Raus', 'Hasi legt das Werkzeug zurück ins Regal.', 1600); }
        else { l.unshift(offen); H.hasi('daumen', 'Gemerkt', 'Hasi legt den Würfel in deinen Werkzeugkasten und klopft zweimal darauf.', 2000); H.klang('pling'); summ([10, 30, 10]); }
        leg('hasi.kasten', l.slice(0, 20)); herzZeigen(); kastenZeigen();
      };
      new MutationObserver(function () { var n = $('t-name').textContent; var x = W.filter(function (w) { return w.n === n; })[0]; offen = x ? x.id : null; herzZeigen(); }).observe($('t-name'), { childList: true, characterData: true, subtree: true });
    }
    function herzZeigen() { if (!herz) return; var on = offen && kasten().indexOf(offen) >= 0; herz.setAttribute('aria-pressed', String(!!on)); herz.textContent = on ? '♥ In meinem Kasten' : '♡ In meinen Kasten'; }

    /* 3) Rätsel-Ecke */
    var P = H.PROB.filter(function (p) { return wId(p[2][0]); });
    var rk = el('<section class="box holz r4-karte" id="r4raetsel" aria-labelledby="r4rt"><h2 id="r4rt">🧩 Welches Werkzeug passt?</h2><p class="r4-frage"></p><div class="r4-optionen"></div><p class="r4-serie" aria-live="polite"></p></section>');
    var serie = hol('hasi.serie', { t: '', n: 0 }); if (serie.t !== heute()) serie = { t: heute(), n: 0 };
    function neueFrage() {
      var p = P[Math.floor(Math.random() * P.length)], richtig = wId(p[2][0]);
      var andere = W.filter(function (x) { return p[2].indexOf(x.id) < 0 && x.id !== 'zeichentafel'; }).sort(function () { return Math.random() - .5; }).slice(0, 2);
      var opt = andere.concat([richtig]).sort(function () { return Math.random() - .5; });
      rk.querySelector('.r4-frage').innerHTML = 'Jemand kommt in den Laden und zeigt auf ein Schild: <em>«' + esc(p[1]) + '»</em>';
      var o = rk.querySelector('.r4-optionen'); o.innerHTML = ''; var fertig = false;
      opt.forEach(function (x) {
        var b = el('<button type="button"><span>' + x.e + '</span>' + esc(x.n) + '</button>');
        b.onclick = function () {
          if (fertig) return;
          if (x === richtig) {
            fertig = true; b.classList.add('ja'); serie.n++; leg('hasi.serie', serie); H.zaehl('raetsel');
            H.hasi('daumen', 'Passt!', 'Hasi hält beide Daumen hoch und hüpft vor Freude.', 2200); H.klang('pling'); summ([10, 40, 10]);
            setTimeout(neueFrage, 1800);
          } else { b.classList.add('nein'); serie.n = 0; leg('hasi.serie', serie); H.hasi('nein', 'Hm …', 'Hasi schüttelt freundlich den Kopf und zeigt auf die anderen Würfel.', 1800); summ(20); }
          serieZeigen();
        };
        o.appendChild(b);
      });
      serieZeigen();
    }
    function serieZeigen() { rk.querySelector('.r4-serie').textContent = serie.n ? '🥕 ' + serie.n + ' richtig in Folge heute' : 'Tipp auf das Werkzeug, das passt. Hasi zeigt dir, ob es stimmt.'; }

    /* Einfügen */
    var berater = $('berater');
    if (berater) { berater.before(fk); fk.after(kk); }
    var erfinder = $('erfinder'); if (erfinder) erfinder.before(rk); else if (berater) berater.after(rk);
    kastenZeigen(); neueFrage();
    window.HasiR4 = { winke: winke };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else setTimeout(los, 0);
})();
