/* wischen-app.js – Otti startet mit Wisch-Karten (inhalt/wischen.js), im Aura-Look.
   Welten aus den Zauberwald-Toren sind Stapel: nach rechts = «Mag ich» (Lern-Profil welten_otti),
   antippen = Geschichte öffnet sich in den Zauberwald-Toren. Filme, Spiele und Abenteuer sind Karten.
   Der Mondschein-Wald (../mondschein/) wird nur verlinkt, nie verändert. */
(function () {
  'use strict';
  if (!window.Wischen) return;
  var W = Wischen.W, KEY = 'welten_otti';
  function hol() { try { var v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
  function leg(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function istMag(id) { return (hol().mag || []).indexOf(id) >= 0; }
  function magAn(id) { var v = hol(), m = v.mag = v.mag || [], i = m.indexOf(id); if (i >= 0) m.splice(i, 1); m.unshift(id); leg(v); }
  function tx(el, sel) { var x = el && (sel ? el.querySelector(sel) : el); return x ? (x.textContent || '').replace(/\s+/g, ' ').trim() : undefined; }
  function D() { return window.WELTEN || { WELTEN: [], FIGUREN: {} }; }
  function cast(g) { var F = D().FIGUREN || {}; return (g.cast || []).slice(0, 3).map(function (c) { return F[c] ? F[c].n : ''; }).filter(Boolean).join(', '); }
  function geschichte(w, g, chip) {
    return { id: 'g:' + g.id, e: w.e, farbe: w.farbe, chip: chip || w.name, titel: g.titel, text: g.kurz + (cast(g) ? ' Mit ' + cast(g) + '.' : ''), art: 'inhalt',
      mag: function () { magAn(g.id); }, istMag: function () { return istMag(g.id); },
      los: function () { if (window.Welten) window.Welten.oeffnen(w.id, g.id); }, drueber: true };
  }
  function welt(w) {
    return { id: 'w:' + w.id, art: 'bereich', e: w.e, farbe: w.farbe, chip: (w.geschichten || []).length + ' Geschichten', titel: w.name, text: w.kurz, chipInnen: w.tor,
      karten: function () { return w.geschichten.map(function (g) { return geschichte(w, g); }); },
      ende: function () { return { e: '🗝️', titel: 'Alle Geschichten aus «' + w.name + '» gesehen', text: 'Hinter dem ' + w.tor + ' kannst du auch eigene Geschichten erfinden.', knoepfe: [{ t: '🚪 Zum ' + w.tor, primaer: true, fn: function () { if (window.Welten) window.Welten.oeffnen(w.id); } }, { t: '✕ Zurück', fn: Wischen.zurueck }] }; } };
  }
  /* Spiele aus dem Blatt «Was spielen wir?» (das Blatt bleibt zu, das Spiel startet direkt). */
  function spiel(el, chip) {
    var id = el.getAttribute('data-spiel');
    return W.knopf('#spielwahl [data-spiel="' + id + '"]', { art: 'spiel', e: tx(el, '.e') || '🎲', chip: chip, titel: tx(el, 'b'), text: tx(el, 'small') });
  }
  function spielGruppe(titel, e, chip, els) {
    var l = els.map(function (el) { return spiel(el, chip); }).filter(Boolean); if (!l.length) return null;
    return W.gruppe({ id: 'sp:' + chip, e: e, chip: l.length + ' Spiele', titel: titel, text: l.map(function (k) { return k.titel; }).join(', ') + '.', karten: function () { return l; } });
  }
  function film(id, bild) {
    var el = document.querySelector('#spielwahl [data-film="' + id + '"]'); if (!el) return null;
    return W.film({ id: 'film-' + id, bild: bild, chip: tx(el, 'small') || 'Trickfilm', titel: tx(el, 'b'), text: 'Ottis kleiner Trickfilm. Tippen und zuschauen.', los: W.klick('#spielwahl [data-film="' + id + '"]') });
  }
  Wischen.start({
    app: 'otti', name: 'Otti', unter: 'Wischen, tippen, staunen', bild: 'aura/winkt.webp',
    thema: 'aura', akzent: '#f5c542',
    pilleNur: function () { return !document.body.classList.contains('imspiel'); },
    karten: function () {
      var welten = (D().WELTEN || []).filter(function (w) { return w.geschichten && w.geschichten.length; });
      var h = window.Welten && window.Welten.heute && window.Welten.heute(), hk = null;
      if (h && h.geschichten && h.geschichten.length) { hk = welt(h); hk.id = 'heute'; hk.chip = '☀️ Heute offen: ' + h.tor; }
      var fd = null;
      try { var t = window.Welten.empfehlung(); if (t) { fd = geschichte(t.w, t.g, /^Heute offen/.test(t.grund) ? '⭐ Für dich' : t.grund); fd.id = 'fuerdich'; } } catch (e) {}
      var sprich = W.sprich({ figur: 'Otti', bild: 'aura/lacht.webp', text: 'Tippen oder schreiben. Otti hört zu, alles bleibt auf diesem Handy.' });
      var kap = {}; [].slice.call(document.querySelectorAll('#spielwahl .kapitel')).forEach(function (k) { var box = k.nextElementSibling; kap[tx(k)] = box ? [].slice.call(box.querySelectorAll('[data-spiel]')) : []; });
      var gruppen = [], E = { 'Suchen & bewegen': '🙈', 'Ruhig & kreativ': '🌷', 'Zu zweit': '🧒' };
      Object.keys(kap).forEach(function (n) { if (kap[n].length) gruppen.push(spielGruppe(n.replace(/^[^A-Za-zÄÖÜ]+/, ''), E[n.replace(/^[^A-Za-zÄÖÜ]+/, '')] || '🎲', n.replace(/^[^A-Za-zÄÖÜ]+/, ''), kap[n])); });
      var mehr = [
        W.knopf('#spielwahl [data-abenteuer]', { art: 'spiel', e: '🚀', chip: 'Abenteuer', titel: 'Abenteuer', text: '5 Missionen mit Otti und neuen Helden.' }),
        W.knopf('#gefuehlKnopf', { e: '💛', chip: 'Gefühle', titel: 'Wie geht es dir?', text: 'Otti fragt nach deinen Gefühlen.' }),
        W.knopf('#knopf', { e: '💬', chip: 'Reden', titel: 'Mit Otti reden', text: 'Drück und sprich mit Otti im Wald.' }),
        W.knopf('#abendKnopf', { e: '🌙', chip: 'Abend', titel: 'Abend mit Otti', text: 'Ruhig werden vor dem Schlafen.' }),
        W.knopf('#wegGeschichten', { e: '📖', bild: '../mondschein/film/otti-katzen.jpg', chip: 'Mondschein-Wald', titel: 'Gute-Nacht-Geschichten', text: 'Im Mondschein-Wald vorlesen lassen.' }),
        W.knopf('#winkKnopf', { e: '👋', chip: 'Hallo', titel: 'Otti winken', text: 'Otti winkt zurück.' }),
        W.knopf('#wegHoeren', { e: '🎧', chip: 'Mondschein-Wald', titel: 'Nur hören', text: 'Geschichten mit geschlossenen Augen.' })
      ];
      var tore = W.knopf('#spielwahl [data-welten]', { e: '🚪', chip: 'Zauberwald-Tore', titel: 'Alle Tore', text: 'Geschichten hören und eigene erfinden.', los: function () { if (window.Welten) window.Welten.oeffnen(); }, drueber: true });
      return [hk, sprich, film('ny', '../mondschein/film/otti-ny.jpg'), fd, gruppen[0]]
        .concat(W.mischen(welten.filter(function (w) { return !h || w.id !== h.id; }).map(welt), gruppen.slice(1).concat([film('katzen', '../mondschein/film/otti-katzen.jpg')]), mehr), [tore]);
    }
  });
})();
