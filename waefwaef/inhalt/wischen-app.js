/* wischen-app.js – Wäf Wäf startet mit Wisch-Karten (inhalt/wischen.js), im Aura-Look.
   Nach «Komm, schauen wir den Tag an» und der Familien-Frage kommen die Karten.
   Jeder Bereich unten (Tag, Raus, Allein, Verstehen, Kinder, Pflege) ist eine Karte; drinnen wischt man durch seine Teile. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W;
  var BILD = { tag: 'posen/freut.jpg', spazieren: 'posen/rennt.jpg', allein: 'posen/schlaeft.jpg', verstehen: 'posen/schnueffelt.jpg', kinder: 'posen/sitzt.jpg', pflege: 'posen/hundemarke.jpg' };
  function startOffen() { var s = document.getElementById('start'); return !!(s && !s.hidden); }
  /* Wäf Wäfs eigenes Fenster (#dialog, z. B. «Wer gehört zu meiner Familie?») hat keine Dialog-Rolle: darauf warten. */
  function fensterOffen() { var x = document.getElementById('dialog'); return !!(x && !x.hidden); }
  function tx(el) { return (el && el.textContent || '').replace(/\s+/g, ' ').trim(); }
  function zeigeBereich(v) { var a = document.querySelector('nav a[data-v="' + v + '"]'); if (a) a.click(); }
  /* Ein Teil eines Bereichs: Tipp zeigt den Bereich und scrollt genau dorthin. */
  function teilKarte(v, h, chip) {
    var t = tx(h), m = t.match(/^((?:[←-⯿☀-➿️‍]|[\uD83C-\uDBFF][\uDC00-\uDFFF])+)\s*/);
    var box = h.closest('.box') || h, p = box.querySelector('p.mini,p'), text = p && !p.contains(h) ? tx(p) : '';
    if (text.length > 140) text = text.slice(0, 137) + '…';
    return { id: 'wv:' + v + ':' + t.slice(0, 30), e: m ? m[1] : '🐾', chip: chip, titel: m ? t.slice(m[0].length) : t, text: text || 'Tippen und dort weitermachen.', art: 'bereich',
      los: function () { zeigeBereich(v); setTimeout(function () { var y = h.getBoundingClientRect().top + scrollY - 70; try { scrollTo({ top: Math.max(0, y), behavior: 'smooth' }); } catch (e) { scrollTo(0, y); } }, 80); } };
  }
  function bereichKarte(a) {
    var v = a.getAttribute('data-v'), sec = document.getElementById('v-' + v); if (!sec) return null;
    var e = tx(a.querySelector('span')) || '🐾', name = tx(a).replace(e, '').trim();
    var hs = [].slice.call(sec.querySelectorAll('h2,h3')).filter(function (h) { return tx(h); });
    var titel = hs.length ? tx(hs[0]) : name;
    var regal = (window.INHALT && window.INHALT.regale || []).some(function (r) { return r.titel === titel; });
    if (regal && hs[1]) titel = titel + ' & ' + tx(hs[1]);
    var teile = hs.map(function (h) { return teilKarte(v, h, name); });
    return W.gruppe({ id: 'wv:' + v, e: e, bild: BILD[v], chip: name, titel: titel, text: hs.slice(1, 4).map(tx).join(' · ') || 'Tippen und hineinschauen.',
      karten: function () { return [{ id: 'wv:' + v + ':ganz', e: e, bild: BILD[v], chip: name, titel: 'Ganzer Bereich «' + name + '»', text: 'Alles von «' + name + '» auf einer Seite.', art: 'bereich', los: function () { zeigeBereich(v); scrollTo(0, 0); } }].concat(teile); } });
  }
  Wischen.start({
    app: 'waefwaef', name: 'Wäf Wäf', unter: 'Wischen, tippen, Pfote für Pfote', bild: 'figur-klein.jpg',
    thema: 'aura', akzent: '#f2b84b',
    warten: function () { return startOffen() || fensterOffen(); },
    pilleNur: function () { return !startOffen() && !fensterOffen(); },
    karten: function () {
      var k = W.kinder() || { regale: [] };
      var bereiche = [].slice.call(document.querySelectorAll('nav a[data-v]')).map(bereichKarte).filter(Boolean);
      var sprich = W.sprich({ figur: 'Wäf Wäf', bild: 'posen/freut.jpg', text: 'Frag Wäf Wäf, was ein Hund braucht. Alles bleibt auf diesem Handy.' });
      var tagebuch = { id: 'tagebuch', e: '🐾', bild: 'posen/freut.jpg', chip: 'Tagebuch', titel: 'Hunde-Tagebuch', text: 'Füttern, Gassi, Pipi, Gagi, Schlafen: ein Tipp, und Wäf Wäf lernt euren Rhythmus.', art: 'bereich',
        los: function () { zeigeBereich('tag'); setTimeout(function () { var t = document.getElementById('tagebuch'); if (!t) return; var y = t.getBoundingClientRect().top + scrollY - 110; try { scrollTo({ top: Math.max(0, y), behavior: 'smooth' }); } catch (e) { scrollTo(0, y); } }, 80); } };
      var geschichte = W.film({ id: 'film-allein', art: 'film', chip: 'Bildergeschichte', bild: 'posen/pssst.jpg', titel: 'Das erste Mal allein', text: 'Wäf Wäf erzählt, wie er zum ersten Mal allein zu Hause bleibt.', los: W.klick('#gStart') });
      return [k.heute, tagebuch, bereiche[0], sprich, geschichte, k.fuerDich].concat(W.mischen(bereiche.slice(1), k.regale), [k.alle]);
    }
  });
})();
