// Bühne: zeigt die Figur gross im 3D-Look oben in der App, mit «Mit … reden» (Live-Gespräch mit Lippen).
// <script src="../nova/buehne.js" data-figur="kiki" data-name="Kiki" data-bild="kiki-3d.jpg" data-satz="…" defer></script>
// data-vor: CSS-Selektor, vor dem die Bühne eingefügt wird (sonst nach dem ersten <header> bzw. am Anfang von main/.wrap/body).
(function () {
  var me = document.currentScript;
  if (!me) return;
  var FIGUR = me.getAttribute('data-figur') || 'nova';
  var NAME = me.getAttribute('data-name') || 'Nova';
  var BILD = me.getAttribute('data-bild');
  var SATZ = me.getAttribute('data-satz') || '';
  var VOR = me.getAttribute('data-vor');
  var REDEN = new URL('reden.html?f=' + encodeURIComponent(FIGUR), me.src).href;

  var css = document.createElement('style');
  css.textContent =
    '.nb-buehne{position:relative;margin:6px 0 18px;border-radius:26px;overflow:hidden;border:1px solid rgba(242,193,78,.45);box-shadow:0 18px 50px -12px rgba(0,0,0,.5),0 0 40px rgba(242,193,78,.16);background:#0b1636;max-width:640px;margin-left:auto;margin-right:auto}' +
    '.nb-buehne img{display:block;width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;animation:nbAtmen 5s ease-in-out infinite;transform-origin:50% 90%;cursor:pointer}' +
    '.nb-buehne img.hops{animation:nbHops .6s ease}' +
    '@keyframes nbAtmen{50%{transform:scale(1.015) translateY(-3px)}}' +
    '@keyframes nbHops{30%{transform:translateY(-14px) scale(1.03)}60%{transform:translateY(0) scale(.99)}}' +
    '.nb-unten{position:absolute;left:0;right:0;bottom:0;padding:70px 16px 16px;background:linear-gradient(transparent,rgba(6,10,28,.9) 62%);display:flex;flex-direction:column;gap:8px;align-items:center;text-align:center;font-family:system-ui,-apple-system,sans-serif}' +
    '.nb-unten b{font:700 24px/1.15 Georgia,serif;color:#f2c14e}' +
    '.nb-unten span{font-size:14px;line-height:1.4;color:#f3ece4;max-width:300px}' +
    '.nb-reden{display:inline-flex;align-items:center;gap:8px;margin-top:4px;border-radius:999px;padding:14px 24px;font:700 17px system-ui,-apple-system,sans-serif;background:#f2c14e;color:#2a1d00;box-shadow:0 8px 24px rgba(242,193,78,.35);text-decoration:none}' +
    '.nb-reden:active{transform:scale(.96)}' +
    '@media (prefers-reduced-motion:reduce){.nb-buehne img{animation:none}}';
  document.head.appendChild(css);

  function bauen() {
    var s = document.createElement('section');
    s.className = 'nb-buehne';
    s.setAttribute('aria-label', NAME);
    s.innerHTML = '<img alt="" width="1024" height="1024"><div class="nb-unten"><b></b><span></span><a class="nb-reden"></a></div>';
    var img = s.querySelector('img'); img.src = BILD; img.alt = NAME;
    s.querySelector('b').textContent = 'Ich bin ' + NAME + '.';
    var sp = s.querySelector('span'); if (SATZ) sp.textContent = SATZ; else sp.remove();
    var a = s.querySelector('a'); a.href = REDEN; a.textContent = '📞 Mit ' + NAME + ' reden';
    img.addEventListener('click', function () { img.classList.remove('hops'); void img.offsetWidth; img.classList.add('hops'); });
    img.addEventListener('animationend', function (e) { if (e.animationName === 'nbHops') img.classList.remove('hops'); });

    var ziel = VOR && document.querySelector(VOR);
    if (ziel) return ziel.parentNode.insertBefore(s, ziel);
    var kopf = document.querySelector('header');
    if (kopf && kopf.parentNode) return kopf.parentNode.insertBefore(s, kopf.nextSibling);
    var box = document.querySelector('main, .wrap, .w') || document.body;
    box.insertBefore(s, box.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bauen); else bauen();
})();
