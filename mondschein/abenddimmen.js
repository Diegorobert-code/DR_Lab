/* Abenddimmen (Design 23.10.): ab 18:30 Uhr wird Mondschein langsam wärmer und etwas dunkler,
   und je länger der Abend-Besuch dauert, desto ruhiger. Ein warmer Schleier im Multiplizieren-Modus
   liegt über allem (keine Tipper, kein Einfluss auf Knöpfe). Blau wird stärker gedämpft als Rot.
   Höchststärke so gewählt, dass auch die leise Nebenschrift über 4.5:1 Kontrast bleibt
   (z. B. Nacht #8e95b0 auf #18213f: 5.3 → 4.8; Haupttext 11.8 → 10.4).
   Schalter in «Für Eltern» unter dem Nachtmodus; gemerkt auf dem Handy (Standard: an). */
(function () {
  'use strict';
  if (window.__abenddimmen) return; window.__abenddimmen = 1;
  var KEY = 'ms_abenddimmen', t0 = Date.now();
  var ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function an() { try { return localStorage.getItem(KEY) !== '0'; } catch (e) { return true; } }
  function setzen(v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {} }

  var st = document.createElement('style');
  st.textContent =
    '.ad-schleier{position:fixed;inset:0;pointer-events:none;z-index:2147483500;mix-blend-mode:multiply;' +
    'background:#f0c08a;opacity:0;' +
    (ruhig ? '' : 'transition:opacity 20s linear;') + '}' +
    '.ad-schleier[hidden]{display:none!important}';
  document.head.appendChild(st);
  var sch = document.createElement('div');
  sch.className = 'ad-schleier'; sch.setAttribute('aria-hidden', 'true');

  // 0 vor 18:30, steigt bis 20:00, bleibt bis 6:00, sinkt bis 7:00
  function uhr() {
    var d = new Date(), h = d.getHours() + d.getMinutes() / 60;
    if (h >= 20 || h < 6) return 1;
    if (h >= 18.5) return (h - 18.5) / 1.5;
    if (h >= 6 && h < 7) return 7 - h;
    return 0;
  }
  function staerke() {
    var sitzung = Math.min(1, (Date.now() - t0) / 60000 / 20); // über 20 Minuten
    return uhr() * (0.4 + 0.6 * sitzung);
  }
  // Volle Stärke: Deckkraft .32 → Faktoren R .98 · G .92 · B .86 (nie stärker, siehe oben)
  function anwenden() {
    var s = an() ? staerke() : 0;
    sch.hidden = s <= 0;
    sch.style.opacity = (Math.min(1, s) * 0.32).toFixed(3);
    document.documentElement.toggleAttribute('data-abenddimmen', s > 0);
  }
  window.msAbenddimmen = { staerke: staerke, anwenden: anwenden };

  // Schalter im Eltern-Bereich, gleich unter dem Nachtmodus
  function schalter() {
    var seg = document.getElementById('segNight');
    if (!seg || document.getElementById('segDimm')) return;
    var karte = seg.closest('.card'); if (!karte) return;
    var k = document.createElement('div'); k.className = 'card';
    k.innerHTML = '<h3 class="ch">Abenddimmen</h3><div class="seg" id="segDimm" role="group" aria-label="Abenddimmen"></div>' +
      '<p class="small muted" style="margin:10px 0 0">Ab halb sieben am Abend werden die Farben langsam wärmer und ruhiger, je länger ihr lest. Texte bleiben gut lesbar.</p>';
    karte.parentNode.insertBefore(k, karte.nextSibling);
    var g = k.querySelector('#segDimm');
    function zeichnen() {
      var v = an(); g.innerHTML = '';
      [['0', 'Aus'], ['1', 'An']].forEach(function (x) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = x[1];
        var sel = (x[0] === '1') === v; b.className = sel ? 'sel' : ''; b.setAttribute('aria-pressed', sel);
        b.addEventListener('click', function () { setzen(x[0] === '1'); zeichnen(); anwenden(); });
        g.appendChild(b);
      });
    }
    zeichnen();
  }

  function los() {
    document.body.appendChild(sch);
    schalter();
    // erster Wert sofort, ohne lange Überblendung (sonst blendet der Schleier beim Öffnen 20 s lang ein)
    sch.style.transition = 'none'; anwenden(); void sch.offsetWidth; sch.style.transition = '';
    setInterval(anwenden, 30000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) anwenden(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
