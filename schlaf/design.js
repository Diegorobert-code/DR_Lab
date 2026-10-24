/* Fias Nest – Design «Wolldecke»: helle Wolle am Tag, dunkle Wolle ab dem Abend (nie grelles Weiss in der Nacht).
   Setzt nur eine Klasse an <html> und die Statusleisten-Farbe. Keine Funktion wird verändert. */
(function () {
  var html = document.documentElement, mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function nacht() {
    if (mq && mq.matches) return true;
    var st = document.body && document.body.dataset.stage;
    if (st === '2' || st === '3' || st === 'glut') return true;
    try { if (typeof window.zeitStage === 'function' && window.zeitStage() >= 1) return true; } catch (e) {}
    return false;
  }
  function setz() {
    var n = nacht();
    html.classList.toggle('dz-nacht', n); html.classList.toggle('dz-tag', !n);
    var mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.setAttribute('content', n ? '#1D1713' : '#EFE7DC');
  }
  setz();
  if (mq) { try { mq.addEventListener('change', setz); } catch (e) { try { mq.addListener(setz); } catch (e2) {} } }
  if (document.body && window.MutationObserver) new MutationObserver(setz).observe(document.body, { attributes: true, attributeFilter: ['data-stage'] });
  setInterval(setz, 60000);
  /* runde8 setzt die Statusleiste nach dem Laden nochmals; danach erneut setzen */
  setTimeout(setz, 400); setTimeout(setz, 1500);
})();
