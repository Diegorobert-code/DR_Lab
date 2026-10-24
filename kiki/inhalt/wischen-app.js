/* wischen-app.js – Kiki startet mit Wisch-Karten (inhalt/wischen.js), im Aura-Look.
   Jedes Sing-Spiel ist eine Karte. Nach «‹ Zurück» aus einem Spiel kommen die Karten wieder. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W;
  /* Das Menü ist versteckt, darum Titel und Text aus <b> und <small> lesen. */
  function teil(el, sel) { var x = el && el.querySelector(sel); return x ? (x.textContent || '').trim() : undefined; }
  function spiel(go, o) {
    var el = document.querySelector('[data-go="' + go + '"]'), ic = teil(el, '.ic');
    return W.knopf('[data-go="' + go + '"]', Object.assign({ art: 'spiel', chip: 'Spielen', e: ic, titel: teil(el, 'b'), text: teil(el, 'small') }, o));
  }
  /* Zurück aus einem Spiel ins Menü: dann wieder die Karten (ausser jemand wollte die ganze Seite). */
  function zurueckZuKarten() {
    var b = document.getElementById('back'); if (!b) return;
    b.addEventListener('click', function () {
      setTimeout(function () {
        var m = document.getElementById('s-menu'), h = document.getElementById('s-home');
        var klassisch = false; try { klassisch = sessionStorage.getItem('wischen_kiki:klassisch') === '1'; } catch (e) {}
        if (!klassisch && ((m && m.classList.contains('on')) || (h && h.classList.contains('on')))) Wischen.zeigen();
      }, 60);
    });
  }
  Wischen.start({
    app: 'kiki', name: 'Kiki', unter: 'Wischen, tippen, singen', bild: 'aura/figur-winkt.webp',
    thema: 'aura', akzent: '#f5c542',
    pilleNur: function () { var m = document.getElementById('s-menu'), h = document.getElementById('s-home'); return !!((m && m.classList.contains('on')) || (h && h.classList.contains('on'))); },
    karten: function () {
      var k = W.kinder() || { regale: [] };
      var heute = W.knopf('[data-go="heute"]', { art: 'spiel', bild: 'posen/singt.jpg', chip: 'Heute mit Kiki', titel: 'Los, wir singen!', text: 'Aufwärmen, drei Töne und das Lied des Tages.' });
      var sprich = W.sprich({ figur: 'Kiki', bild: 'posen/hoert.jpg', text: 'Tippen oder schreiben. Kiki hört zu, alles bleibt auf diesem Handy.' });
      var duo = spiel('duo', { bild: 'posen/zusammen.jpg', chip: 'Zu zweit' });
      var spiele = [
        spiel('songs', { bild: 'posen/tanzt.jpg' }), spiel('tone'), spiel('echo'), spiel('rhythm'), spiel('mirror'), spiel('make', { bild: 'posen/freut.jpg' })
      ];
      var weg = spiel('path', { art: 'bereich', chip: 'Abzeichen', bild: 'posen/verbeugt.jpg' });
      var ueben = [spiel('warm', { chip: 'Üben' }), spiel('room', { chip: 'Üben' }), spiel('scale', { chip: 'Üben' }), spiel('pitch', { chip: 'Üben' }),
        W.knopf('#s-menu a[href*="mondschein"]', { e: '🌙', bild: 'posen/schlaflied.jpg', chip: 'Gute Nacht', titel: 'Kiki besucht Otti', text: 'Gutenacht-Geschichten im Mondschein.' })].filter(Boolean);
      var mehr = ueben.length ? W.gruppe({ id: 'ueben', e: '🎼', chip: ueben.length + ' Karten', titel: 'Mehr zum Üben', text: 'Aufwärmen, Stimmraum, Tonleitern, Ton vorgeben.', karten: function () { return ueben; } }) : null;
      return [heute, k.heute, sprich, duo, k.fuerDich].concat(W.mischen(spiele, k.regale), [weg, mehr, k.alle]);
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', zurueckZuKarten); else zurueckZuKarten();
})();
