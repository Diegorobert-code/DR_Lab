/* wischen.js – DR Lab · Wisch-Karten (gemeinsam für alle Apps, gleiches Muster wie im KI-Verse).
   Start: eine waagrechte Reihe grosser Karten (Bereiche, Spiele, Geschichten, Tipps, Filme, «Sprich mit …»).
     wischen = nächste Karte (CSS scroll-snap), tippen = hinein, ✕ oben rechts = hinaus.
     Beim ersten Mal steht «← wischen und antippen →» darunter; der Hinweis verblasst nach dem ersten Wischen.
   Drinnen, in Inhalts-Stapeln (Tipps, Übungen, Geschichten, Beiträge):
     nach rechts wischen = «Mag ich» / merken (geht ins Lern-Profil auf diesem Gerät und in «Weil du …»),
     nach links wischen  = weiter, tippen = öffnen. Seiten und Schritte liegen wieder in einer Wisch-Reihe.
   Ersatz für alle, die nicht wischen: Knöpfe, Pfeiltasten, Enter, Escape. «Weniger Bewegung»: nur Ein- und Ausblenden.
   Animiert werden nur transform und opacity. Leichtes Vibrieren auf Geräten, die es können.
   Gespeichert wird nur hier: localStorage «wischen_<app>». Aus: ?wischen=aus in der Adresse.
   Einbinden: <link rel="stylesheet" href="inhalt/wischen.css"><script src="inhalt/wischen.js" defer></script>
              <script src="inhalt/wischen-app.js" defer></script>  (ruft Wischen.start({...}) auf) */
(function () {
  'use strict';
  if (window.Wischen) return;
  var d = document;
  var RUHIG = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------------- Kleinzeug ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mk(tag, cls, html) { var e = d.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function vib(ms) { try { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(ms || 8); } catch (e) {} }
  function tag() { return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000); }
  function jsonHol(k, def) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v && typeof v === 'object' ? v : def; } catch (e) { return def; } }
  function jsonLeg(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function fn(x) { return typeof x === 'function' ? x() : x; }
  /* Langen Text in Seiten teilen (an Satzenden), damit jede Karte ohne Scrollen passt. */
  function teile(text, max) {
    text = String(text || '').trim(); if (!text) return [];
    if (text.length <= max) return [text];
    var saetze = text.match(/[^.!?…]+[.!?…»"]*\s*/g) || [text], out = [], cur = '';
    saetze.forEach(function (s) { if (cur && (cur + s).length > max) { out.push(cur.trim()); cur = ''; } cur += s; });
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function sichtbar(el) {
    try {
      if (!el || !el.getClientRects().length) return false;
      var cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.05) return false;
      var r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
      var l = Math.max(0, r.left), t = Math.max(0, r.top), rr = Math.min(vw, r.right), b = Math.min(vh, r.bottom);
      if (rr - l < 4 || b - t < 4) return false;
      var o = d.elementFromPoint((l + rr) / 2, (t + b) / 2);
      return !!o && (o === el || el.contains(o));
    } catch (e) { return false; }
  }

  /* ---------------- Karten-HTML (für Stapel und Reihe) ---------------- */
  function bildHTML(k) { return k.bild ? '<img src="' + esc(k.bild) + '" alt="" loading="lazy" draggable="false">' : '<span class="ws-k-e" aria-hidden="true">' + esc(k.e || '✨') + '</span>'; }
  function karteHTML(k, W, gemocht) {
    return '<span class="ws-k-bild' + (k.bild ? ' ws-mit-bild' : '') + '"' + (k.farbe ? ' style="--c:' + esc(k.farbe) + '"' : '') + '>' + bildHTML(k) + (k.art === 'film' ? '<span class="ws-play" aria-hidden="true">▶</span>' : '') + '</span>' +
      '<span class="ws-k-tx">' + (k.chip ? '<span class="ws-chip">' + esc(k.chip) + '</span>' : '') +
      '<b class="ws-k-t">' + esc(k.titel) + '</b>' + (k.text ? '<span class="ws-k-p">' + esc(k.text) + '</span>' : '') + '</span>' +
      (gemocht ? '<span class="ws-gemocht" aria-label="gemocht">' + esc(W.magE || '❤️') + '</span>' : '');
  }
  function seiteHTML(k, nr, n) {
    var liste = k.liste ? '<ol class="ws-liste"' + (k.start ? ' start="' + (k.start + 1) + '"' : '') + '>' + k.liste.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' : '';
    return (k.e || k.bild ? '<span class="ws-s-kopf' + (k.bild ? ' ws-mit-bild' : '') + '">' + bildHTML(k) + '</span>' : '') +
      (k.chip ? '<span class="ws-chip">' + esc(k.chip) + '</span>' : '') +
      (k.titel ? '<h3>' + esc(k.titel) + '</h3>' : '') + (k.text ? '<p class="ws-seitentext">' + esc(k.text) + '</p>' : '') + liste +
      (k.klein ? '<p class="ws-klein">' + esc(k.klein) + '</p>' : '') +
      (n > 1 ? '<span class="ws-seitenzahl" aria-hidden="true">' + (nr + 1) + ' / ' + n + '</span>' : '');
  }
  function endeHTML(k) {
    return '<span class="ws-ende-e" aria-hidden="true">' + esc(k.e || '🌙') + '</span>' + (k.titel ? '<h3>' + esc(k.titel) + '</h3>' : '') +
      (k.text ? '<p>' + esc(k.text) + '</p>' : '') + (k.klein ? '<p class="ws-klein">' + esc(k.klein) + '</p>' : '') +
      '<div class="ws-ende-k">' + (k.knoepfe || []).map(function (b, j) {
        var an = b.an ? !!fn(b.an) : null;
        return '<button type="button" class="ws-btn' + (b.primaer ? ' ws-voll' : '') + '" data-ws-k="' + j + '"' + (an !== null ? ' aria-pressed="' + an + '"' : '') + '>' + esc(an && b.tAn ? b.tAn : b.t) + '</button>';
      }).join('') + '</div>';
  }
  function endeKlick(el, k, feiern) {
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ws-k]'); if (!b) return;
      var def = (k.knoepfe || [])[+b.getAttribute('data-ws-k')]; if (!def) return;
      var r = def.fn && def.fn(b);
      if (def.an) { var an = !!fn(def.an); b.setAttribute('aria-pressed', an); b.textContent = an && def.tAn ? def.tAn : def.t; if (an) { vib(); if (feiern) feiern(); } }
      else if (r === true) vib();
    });
  }

  /* ================= Reihe (scroll-snap): App-Navigation und Seiten ================= */
  /* o: { karten, seiten:bool, titel, wort, hinweis:bool, beimWischen(), beimIndex(k,i), oeffnen(k) } */
  function Reihe(o) {
    var karten = o.karten || [], W = o.wort || {}, i = 0, n = karten.length;
    var wrap = mk('div', 'ws-reihe-wrap' + (o.seiten ? ' ws-seiten' : ''));
    var reihe = mk('div', 'ws-reihe'); reihe.setAttribute('role', 'list'); reihe.setAttribute('aria-label', o.titel || 'Karten'); reihe.tabIndex = -1;
    wrap.appendChild(reihe);
    var hinweis = null;
    if (o.hinweis) { hinweis = mk('p', 'ws-r-hinweis', esc(o.seiten ? (W.seitenHinweis || '← wischen: nächste Seite') : (W.reiheHinweis || '← wischen und antippen →'))); wrap.appendChild(hinweis); }
    var nav = mk('div', 'ws-r-nav', '<button type="button" class="ws-kn ws-r-vor" aria-label="Vorherige Karte"><span class="ws-kn-i" aria-hidden="true">◀</span>' + (o.gross ? '<small>zurück</small>' : '') + '</button>' +
      '<span class="ws-zahl" aria-live="polite"></span>' +
      '<button type="button" class="ws-kn ws-r-nach" aria-label="Nächste Karte"><span class="ws-kn-i" aria-hidden="true">▶</span>' + (o.gross ? '<small>weiter</small>' : '') + '</button>');
    wrap.appendChild(nav);
    karten.forEach(function (k, j) {
      var li = mk('div', 'ws-r-k'); li.setAttribute('role', 'listitem');
      var el;
      if (k.ende === true) { el = mk('div', 'ws-k ws-k-ende', endeHTML(k)); endeKlick(el, k, o.feiern); }
      else if (o.seiten) { el = mk('div', 'ws-k ws-k-seite', seiteHTML(k, j, n)); }
      else {
        el = mk('button', 'ws-k ws-k-tap' + (k.art ? ' ws-art-' + k.art : ''), karteHTML(k, W, k.istMag && k.istMag()));
        el.type = 'button'; el.setAttribute('aria-label', (k.chip ? k.chip + ': ' : '') + k.titel + (k.text ? '. ' + k.text : ''));
        el.addEventListener('click', function (e) { if (gezogen) { e.preventDefault(); return; } vib(); if (o.oeffnen) o.oeffnen(k); });
      }
      li.appendChild(el); reihe.appendChild(li);
    });
    function links(j) { var li = reihe.children[j]; return li ? li.offsetLeft - (reihe.clientWidth - li.clientWidth) / 2 : 0; }
    var ziel = null;
    function basis() { return ziel !== null ? ziel : i; }
    function geh(j, sanft) {
      j = Math.max(0, Math.min(n - 1, j)); ziel = j;
      try { reihe.scrollTo({ left: links(j), behavior: RUHIG || sanft === false ? 'auto' : 'smooth' }); } catch (e) { reihe.scrollLeft = links(j); }
    }
    function jetzt() {
      var best = 0, bd = 1e9, mitte = reihe.scrollLeft + reihe.clientWidth / 2;
      for (var j = 0; j < n; j++) { var li = reihe.children[j], m = li.offsetLeft + li.clientWidth / 2, dd = Math.abs(m - mitte); if (dd < bd) { bd = dd; best = j; } }
      return best;
    }
    var start = null, t = 0;
    function zeig() {
      nav.querySelector('.ws-zahl').textContent = (i + 1) + ' / ' + n;
      nav.querySelector('.ws-r-vor').disabled = i === 0;
      nav.querySelector('.ws-r-nach').disabled = i >= n - 1;
      [].forEach.call(reihe.children, function (li, j) { li.classList.toggle('ws-jetzt', j === i); var el = li.firstChild; if (j === i) el.removeAttribute('tabindex'); else el.setAttribute('tabindex', '-1'); });
    }
    reihe.addEventListener('scroll', function () {
      if (start === null) start = reihe.scrollLeft;
      if (hinweis && !hinweis.classList.contains('ws-weg') && Math.abs(reihe.scrollLeft - start) > 30) { hinweis.classList.add('ws-weg'); if (o.beimWischen) o.beimWischen(); }
      clearTimeout(t);
      t = setTimeout(function () { var j = jetzt(); if (ziel === j) ziel = null; if (j !== i) { var hatte = reihe.contains(d.activeElement); i = j; zeig(); vib(5); if (hatte) { var fe = reihe.children[i] && reihe.children[i].firstChild; try { (fe && fe.tagName === 'BUTTON' ? fe : reihe).focus({ preventScroll: true }); } catch (x) {} } if (o.beimIndex) o.beimIndex(karten[i], i); } }, 70);
    }, { passive: true });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('.ws-r-vor')) geh(basis() - 1); else if (e.target.closest('.ws-r-nach')) geh(basis() + 1);
    });
    /* Maus: mit gedrückter Taste ziehen wie mit dem Finger. */
    var md = null, gezogen = false;
    reihe.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button) return;
      md = { x: e.clientX, l: reihe.scrollLeft, t: Date.now() }; gezogen = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (!md) return; var dx = e.clientX - md.x;
      if (!gezogen && Math.abs(dx) > 6) { gezogen = true; reihe.classList.add('ws-zieht'); }
      if (gezogen) reihe.scrollLeft = md.l - dx;
    });
    window.addEventListener('pointerup', function (e) {
      if (!md) return; var dx = e.clientX - md.x, v = dx / Math.max(1, Date.now() - md.t); md = null;
      if (!gezogen) return;
      reihe.classList.remove('ws-zieht');
      var j = jetzt(); if (Math.abs(v) > 0.3 && j === i) j = i + (dx < 0 ? 1 : -1);
      geh(j); setTimeout(function () { gezogen = false; }, 30);
    });
    function taste(e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); geh(basis() + 1); return true; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); geh(basis() - 1); return true; }
      if ((e.key === 'Enter' || e.key === ' ') && !(e.target.closest && e.target.closest('button'))) { var el = reihe.children[i] && reihe.children[i].firstChild; if (el && el.click && el.tagName === 'BUTTON') { e.preventDefault(); el.click(); return true; } }
      return false;
    }
    zeig();
    return { el: wrap, taste: taste, geh: geh, index: function () { return i; }, fokus: function () { var el = reihe.children[i] && reihe.children[i].firstChild; try { (el && el.tagName === 'BUTTON' ? el : reihe).focus({ preventScroll: true }); } catch (e) {} }, karten: function () { return karten; } };
  }

  /* ================= Stapel (wie Tinder/Hinge): Inhalts-Stapel ================= */
  /* o: { karten, titel, wort:{mag,weiter,oeffnen}, mag(k), weiter(k), oeffnen(k), ende(), istMag(k), belohnung() } */
  function Stapel(o) {
    var karten = o.karten || [], i = 0, els = {}, busy = false, drag = null, W = o.wort || {};
    var wrap = mk('div', 'ws-stapel');
    wrap.tabIndex = -1;
    wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-roledescription', 'Kartenstapel'); wrap.setAttribute('aria-label', o.titel || 'Karten');
    var deck = mk('div', 'ws-deck'); wrap.appendChild(deck);
    var herz = mk('div', 'ws-herz', '<span>' + esc(W.magE || '❤️') + '</span>'); herz.setAttribute('aria-hidden', 'true'); deck.appendChild(herz);
    var hinweis = mk('p', 'ws-hinweis', '<span aria-hidden="true">←</span> ' + esc(W.weiter || 'weiter') + ' · ' + esc(W.tippen || 'tippen: öffnen') + ' · ' + esc(W.mag || 'Mag ich') + ' <span aria-hidden="true">→</span>');
    wrap.appendChild(hinweis);
    var kn = mk('div', 'ws-knoepfe',
      '<button type="button" class="ws-kn ws-kn-weiter" data-ws="links"><span class="ws-kn-i" aria-hidden="true">✕</span><small>' + esc(W.weiter || 'weiter') + '</small></button>' +
      '<button type="button" class="ws-kn ws-kn-auf" data-ws="auf"><span class="ws-kn-i" aria-hidden="true">' + esc(W.oeffnenE || '👆') + '</span><small>' + esc(W.oeffnen || 'Öffnen') + '</small></button>' +
      '<button type="button" class="ws-kn ws-kn-mag" data-ws="rechts"><span class="ws-kn-i" aria-hidden="true">' + esc(W.magE || '❤️') + '</span><small>' + esc(W.mag || 'Mag ich') + '</small></button>');
    wrap.appendChild(kn);
    var live = mk('p', 'ws-sr'); live.setAttribute('aria-live', 'polite'); wrap.appendChild(live);
    kn.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ws]'); if (!b) return;
      var a = b.getAttribute('data-ws'); if (a === 'auf') return oeffnen(); entscheide(a);
    });

    function bauKarte(nr, k) {
      k = k || karten[nr];
      var el = mk('article', 'ws-k ws-p3' + (k.ende === true ? ' ws-k-ende' : ' ws-k-zieh') + (k.art ? ' ws-art-' + k.art : ''));
      el.innerHTML = k.ende === true ? endeHTML(k) : karteHTML(k, W, o.istMag && o.istMag(k)) +
        '<span class="ws-st ws-st-mag" aria-hidden="true">' + esc(W.magE || '❤️') + ' ' + esc(W.mag || 'Mag ich') + '</span>' +
        '<span class="ws-st ws-st-weiter" aria-hidden="true">' + esc(W.weiter || 'weiter') + '</span>';
      if (k.ende === true) endeKlick(el, k, feiern);
      else {
        el.setAttribute('aria-label', (k.chip ? k.chip + ': ' : '') + (k.titel || ''));
        el.addEventListener('pointerdown', runter); el.addEventListener('pointermove', zieh);
        el.addEventListener('pointerup', hoch); el.addEventListener('pointercancel', abbruch);
      }
      deck.appendChild(el); void el.offsetWidth;
      return el;
    }
    function endeKarte() {
      var e = (o.ende && o.ende()) || {};
      e.ende = true; e.e = e.e || '🌙'; e.titel = e.titel || 'Alles angeschaut';
      e.text = e.text == null ? 'Schön war’s. Morgen liegen neue Karten bereit.' : e.text;
      e.knoepfe = e.knoepfe || [{ t: '↺ Nochmals von vorn', fn: function () { neu(0); }, primaer: true }];
      return e;
    }
    function lage() {
      var n = karten.length;
      if (i >= n) {
        for (var j in els) if (j !== 'ende') { els[j].remove(); delete els[j]; }
        if (!els.ende) els.ende = bauKarte(n, endeKarte());
        setze(els.ende, 0); kn.classList.add('ws-weg'); hinweis.classList.add('ws-weg');
        return;
      }
      if (els.ende) { els.ende.remove(); delete els.ende; }
      kn.classList.remove('ws-weg'); hinweis.classList.remove('ws-weg');
      for (var a in els) { var nr = +a; if (nr < i || nr > i + 2) { els[a].remove(); delete els[a]; } }
      for (var p = 0; p < 3 && i + p < n; p++) { if (!els[i + p]) els[i + p] = bauKarte(i + p); setze(els[i + p], p); }
    }
    function setze(el, p) {
      el.style.transition = ''; el.style.transform = ''; el.style.opacity = '';
      el.classList.remove('ws-p0', 'ws-p1', 'ws-p2', 'ws-p3'); el.classList.add('ws-p' + p);
      if (p === 0) { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); } else { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
      stempel(el, 0);
    }
    function oben() { return i >= karten.length ? null : els[i]; }
    function stempel(el, dx) {
      var m = el.querySelector('.ws-st-mag'), w = el.querySelector('.ws-st-weiter');
      if (m) m.style.opacity = dx > 0 ? Math.min(1, dx / 90) : 0;
      if (w) w.style.opacity = dx < 0 ? Math.min(1, -dx / 90) : 0;
    }
    function runter(e) {
      var el = e.currentTarget;
      if (busy || el !== oben() || (e.button && e.button > 0)) return;
      drag = { el: el, x: e.clientX, y: e.clientY, t: Date.now(), dx: 0, dy: 0, zug: false, id: e.pointerId };
      try { el.setPointerCapture(e.pointerId); } catch (x) {}
      el.style.transition = 'none';
    }
    function zieh(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.zug && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 0.8) { drag.zug = true; wrap.classList.add('ws-zieht'); hinweis.classList.add('ws-blass'); }
      drag.dy = dy;
      if (!drag.zug) return;
      drag.dx = dx;
      drag.el.style.transform = 'translate(' + dx + 'px,' + (dy * 0.15) + 'px) rotate(' + (RUHIG ? 0 : dx * 0.05) + 'deg)';
      stempel(drag.el, dx);
      e.preventDefault();
    }
    function hoch(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var g = drag; drag = null; wrap.classList.remove('ws-zieht');
      var dt = Math.max(1, Date.now() - g.t), w = deck.clientWidth || 360;
      if (!g.zug) { g.el.style.transition = ''; g.el.style.transform = ''; if (Math.abs(g.dy) < 12 && dt < 600) oeffnen(); return; }
      var v = g.dx / dt;
      if (Math.abs(g.dx) > w * 0.28 || (Math.abs(v) > 0.5 && Math.abs(g.dx) > 40)) entscheide(g.dx > 0 ? 'rechts' : 'links', g);
      else zurueckfedern(g.el);
    }
    function abbruch() { if (!drag) return; var el = drag.el; drag = null; wrap.classList.remove('ws-zieht'); zurueckfedern(el); }
    function zurueckfedern(el) { el.style.transition = ''; el.style.transform = ''; stempel(el, 0); }
    /* links = weiter, rechts = Mag ich */
    function entscheide(r, g) {
      if (busy) return;
      var el = oben(); if (!el) return;
      var k = karten[i];
      if (r === 'rechts') { try { o.mag && o.mag(k); } catch (x) {} feiern(); ansagen((W.mag || 'Mag ich') + ': ' + (k.titel || '')); }
      else { try { o.weiter && o.weiter(k); } catch (x) {} ansagen(W.weiter || 'weiter'); }
      vib();
      wegfliegen(el, r === 'rechts' ? 1 : -1, g, function () { i++; lage(); fokus(); });
    }
    function wegfliegen(el, s, g, dann) {
      busy = true; delete els[i]; el.setAttribute('inert', '');
      var w = (deck.clientWidth || 360) * 1.35, dy = g ? g.dy * 0.3 : 0;
      el.style.transition = RUHIG ? 'opacity .18s ease' : 'transform .3s cubic-bezier(.4,0,.9,.6), opacity .3s ease';
      if (!RUHIG) el.style.transform = 'translate(' + (s * w) + 'px,' + dy + 'px) rotate(' + (s * 20) + 'deg)';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); busy = false; dann(); }, RUHIG ? 190 : 300);
    }
    function feiern() { herz.classList.remove('ws-an'); void herz.offsetWidth; herz.classList.add('ws-an'); if (o.belohnung) try { o.belohnung(); } catch (x) {} }
    function ansagen(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }
    function oeffnen() { if (busy) return; var k = karten[i]; if (!k) return; vib(); if (o.oeffnen) o.oeffnen(k); }
    function fokus() { try { if (!wrap.contains(d.activeElement) || d.activeElement === d.body) wrap.focus({ preventScroll: true }); } catch (x) {} }
    function neu(nr, liste) { if (liste) karten = liste; for (var a in els) els[a].remove(); els = {}; i = nr || 0; lage(); }
    function taste(e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); entscheide('links'); return true; }
      if (e.key === 'ArrowRight') { e.preventDefault(); entscheide('rechts'); return true; }
      if ((e.key === 'Enter' || e.key === ' ') && !(e.target.closest && e.target.closest('button'))) { e.preventDefault(); oeffnen(); return true; }
      return false;
    }
    lage();
    return { el: wrap, taste: taste, neu: neu, entscheide: entscheide, index: function () { return i; }, fokus: function () { try { wrap.focus({ preventScroll: true }); } catch (e) {} }, karten: function () { return karten; } };
  }

  /* ================= Oberfläche mit Ebenen ================= */
  var CFG = null, root = null, ebenen = [], pille = null, SKEY = '', S = {};
  function speicher() { S = jsonHol(SKEY, {}) || {}; S.lieb = S.lieb || {}; return S; }
  function sichern() { jsonLeg(SKEY, S); }
  function wort() { return CFG.wort || {}; }

  function start(cfg) {
    if (CFG) return; CFG = cfg || {};
    if (/[?&]wischen=aus\b/.test(location.search)) return;
    SKEY = 'wischen_' + (CFG.app || 'app'); speicher();
    var los = function () {
      bauRoot();
      var klassisch = false; try { klassisch = sessionStorage.getItem(SKEY + ':klassisch') === '1'; } catch (e) {}
      if (klassisch || CFG.klassischStart) { zeigPille(); return; }
      warten(function () { zeigen(); });
    };
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { setTimeout(los, 0); }); else setTimeout(los, 0);
    /* Öffnet die App später selbst ein Fenster (z. B. Willkommens-Frage), treten die Karten zur Seite und kommen danach wieder. */
    setInterval(function () {
      if (!root || root.hidden || pausiert) return;
      var w = false; try { w = modalOffen() || (CFG.warten && CFG.warten()); } catch (e) {}
      if (!w) return;
      pausiert = true; root.hidden = true; d.documentElement.classList.remove('ws-offen');
      warten(function () { pausiert = false; zeigen(); });
    }, 700);
  }
  var pausiert = false;
  /* Erst zeigen, wenn kein Fenster der App mehr offen ist (Einführung, Eltern-Hinweis, Startfilm). */
  function warten(dann) {
    var n = 0;
    (function pruef() {
      var offen = false;
      try {
        if (CFG.warten && CFG.warten()) offen = true;
        if (!offen) d.querySelectorAll('dialog[open],[aria-modal="true"],[role="dialog"]').forEach(function (el) { if (!offen && !root.contains(el) && sichtbar(el)) offen = true; });
      } catch (e) {}
      if (!offen) dann(); else { n++; setTimeout(pruef, 500); }
    })();
  }
  function setzeThema(el) {
    var F = window.INHALT && window.INHALT.farben;
    if (CFG.thema === 'farben' && F) {
      var map = { bg: 'bg', surface: 'k', soft: 'k2', ink: 'i', ink2: 'i2', line: 'l', accent: 'a', onAccent: 'on', fontTitle: 'ft', fontBody: 'fb', radius: 'r' };
      for (var f in map) if (F[f]) el.style.setProperty('--ws-' + map[f], F[f]);
      if (F.ink) el.style.setProperty('--ws-t', F.ink);
      el.style.setProperty('--ws-kbg', F.surface || '#fff');
    }
    if (CFG.thema && typeof CFG.thema === 'object') for (var k in CFG.thema) el.style.setProperty('--ws-' + k, CFG.thema[k]);
    if (CFG.akzent) el.style.setProperty('--ws-a', CFG.akzent);
  }
  function bauRoot() {
    root = mk('div', 'ws' + (CFG.gross ? ' ws-gross' : '') + (CFG.thema === 'aura' ? ' ws-aura' : '') + (CFG.klasse ? ' ' + CFG.klasse : ''));
    root.hidden = true; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', (CFG.name || 'App') + ': Karten');
    setzeThema(root);
    d.body.appendChild(root);
    d.addEventListener('keydown', taste, true);
    window.addEventListener('popstate', function () {
      if (!root || root.hidden) return;
      var tief = (history.state && history.state.ws) || 0;
      while (ebenen.length - 1 > tief) zu();
    });
  }
  function taste(e) {
    if (!root || root.hidden || e.defaultPrevented) return;
    if (e.target && e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    if (e.target && e.target.closest && !root.contains(e.target) && e.target !== d.body && e.target !== d.documentElement) return; /* ein anderes Fenster liegt darüber */
    var m = root.querySelector('.ws-menue:not([hidden])');
    if (e.key === 'Escape') { e.preventDefault(); if (m) return menue(false); if (ebenen.length > 1) return zurueck(); return; }
    if (m) return;
    var ob = ebenen[ebenen.length - 1]; if (ob && ob.teil && ob.teil.taste(e)) e.stopPropagation();
  }
  function zeigen() {
    if (!root) return;
    root.hidden = false; d.documentElement.classList.add('ws-offen');
    if (pille) pille.hidden = true;
    try { sessionStorage.removeItem(SKEY + ':klassisch'); } catch (e) {}
    if (!ebenen.length) {
      ebene({ wurzel: true, titel: CFG.name, karten: (fn(CFG.karten) || []).filter(Boolean) });
      try { history.replaceState(Object.assign({}, history.state || {}, { ws: 0 }), ''); } catch (e) {}
    }
    var ob = ebenen[ebenen.length - 1]; if (ob && ob.teil) setTimeout(function () { ob.teil.fokus(); }, 60);
  }
  /* Zur ganzen Seite der App: Karten weg, kleine Pille «Karten» bringt zurück. */
  function verlassen(dann, merken) {
    if (!root) { if (dann) dann(); return; }
    menue(false);
    root.hidden = true; d.documentElement.classList.remove('ws-offen');
    if (merken) try { sessionStorage.setItem(SKEY + ':klassisch', '1'); } catch (e) {}
    zeigPille();
    if (dann) setTimeout(function () { try { dann(); } catch (e) {} }, 40);
  }
  function zeigPille() {
    if (CFG.ohnePille) return;
    if (!pille) {
      pille = mk('button', 'ws-pille' + (CFG.thema === 'aura' ? ' ws-aura' : '') + (CFG.gross ? ' ws-gross' : ''), '<span aria-hidden="true">🃏</span> ' + esc(wort().karten || 'Karten'));
      pille.type = 'button'; pille.setAttribute('aria-label', 'Zurück zu den Karten');
      setzeThema(pille);
      pille.addEventListener('click', function () { zeigen(); });
      d.body.appendChild(pille);
      window.addEventListener('resize', ausweichen);
      setInterval(function () { if (!pille.hidden) { pilleWo(); ausweichen(); } }, 1200);
    }
    pille.hidden = false; pilleWo(); ausweichen(); setTimeout(pilleWo, 150); setTimeout(ausweichen, 350); setTimeout(pilleWo, 500); setTimeout(ausweichen, 800);
  }
  /* Während einer Übung, eines Spiels oder Films (cfg.pilleNur() = false) bleibt die Pille weg. */
  function pilleWo() { var ok = true; try { if (CFG.pilleNur) ok = !!CFG.pilleNur(); if (ok && modalOffen()) ok = false; } catch (e) {} pille.style.display = ok ? '' : 'none'; }
  /* Nie über anderen schwebenden Knöpfen liegen (Nova, Lernen, Rückmeldung, Musik): nach oben ausweichen. */
  function ausweichen() {
    try {
      pille.style.bottom = '';
      var r = pille.getBoundingClientRect(), hoch = 0, l = [];
      d.querySelectorAll(CFG.schwebend || '.nova-btn,.nova-pille,.fb-btn,.fb-knopf,.kimu,.sprich-pille,nav,button,a').forEach(function (x) {
        if (x === pille || x.closest('.ws')) return; for (var y = x, n = 0; y && y !== d.body && n < 5; y = y.parentElement, n++) { var ps = getComputedStyle(y).position; if (ps === 'fixed' || ps === 'sticky') { l.push(x); return; } }
      });
      d.querySelectorAll('[data-drlab-lernen]').forEach(function (h) { if (h.shadowRoot) h.shadowRoot.querySelectorAll('.pill').forEach(function (x) { l.push(x); }); });
      var qs = [];
      l.forEach(function (o) {
        var cs = getComputedStyle(o); if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.05) return;
        var q = o.getBoundingClientRect(); if (q.width && q.top >= innerHeight * 0.4) qs.push(q);
      });
      /* Mehrmals prüfen: nach dem Ausweichen kann die Pille an den nächsten Knopf stossen. */
      var top = r.top, h = r.height;
      for (var runde = 0; runde < 6; runde++) {
        var neu = top;
        qs.forEach(function (q) { if (q.left > r.right + 6 || q.right < r.left - 6 || q.top > top + h + 6 || q.bottom < top - 6) return; neu = Math.min(neu, q.top - 8 - h); });
        if (neu === top) break; top = neu;
      }
      if (top !== r.top) hoch = innerHeight - top - h;
      if (hoch) pille.style.bottom = hoch + 'px';
    } catch (e) {}
  }

  /* Eine Ebene: Kopf (Name, Menü, ✕), optionale Leiste (z. B. Notruf), Bühne mit Reihe, Stapel, Film oder Inhalt. */
  function ebene(def) {
    var tiefe = ebenen.length, sec = mk('section', 'ws-ebene' + (def.wurzel ? ' ws-wurzel' : ''));
    var zuText = CFG.gross ? '<span aria-hidden="true">✕</span> <b>' + (def.wurzel ? 'Seite' : 'Zurück') + '</b>' : '<span aria-hidden="true">✕</span>';
    sec.innerHTML = '<div class="ws-kopf">' +
      (def.wurzel ? (CFG.bild ? '<img class="ws-ava" src="' + esc(CFG.bild) + '" alt="">' : '<span class="ws-ava ws-ava-e" aria-hidden="true">' + esc(CFG.e || '✨') + '</span>') : '') +
      '<h2>' + (def.chip ? '<small>' + esc(def.chip) + '</small>' : '') + esc(def.titel || '') + (def.wurzel && CFG.unter ? '<small>' + esc(CFG.unter) + '</small>' : '') + '</h2>' +
      (def.wurzel ? '<span class="ws-zaehler" hidden></span><button type="button" class="ws-rund ws-menue-k" aria-label="Menü: alles von ' + esc(CFG.name || 'der App') + '" aria-haspopup="dialog"><span aria-hidden="true">☰</span></button>' : '') +
      '<button type="button" class="ws-rund ws-zu" aria-label="' + (def.wurzel ? 'Karten schliessen, ganze Seite zeigen' : 'Schliessen, zurück') + '">' + zuText + '</button></div>' +
      (CFG.leiste ? '<div class="ws-leiste">' + CFG.leiste + '</div>' : '') + '<div class="ws-buehne"></div>';
    var buehne = sec.querySelector('.ws-buehne'), e = { el: sec, def: def };
    if (def.video) {
      buehne.innerHTML = '<div class="ws-film"><video src="' + esc(def.video) + '" ' + (def.poster ? 'poster="' + esc(def.poster) + '" ' : '') + 'controls playsinline preload="metadata"></video>' + (def.text ? '<p>' + esc(def.text) + '</p>' : '') + '</div>';
      e.video = buehne.querySelector('video'); try { var pr = e.video.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (x) {}
    } else if (def.modus === 'stapel') {
      e.teil = Stapel({
        karten: def.karten, titel: def.titel, wort: Object.assign({}, wort(), def.wort || {}), ende: def.ende,
        istMag: function (k) { return k.istMag ? !!k.istMag() : !!S.lieb[k.id]; },
        mag: function (k) { if (k.mag) k.mag(k); S.lieb[k.id] = 1; sichern(); zaehlen(true); },
        weiter: function (k) { if (k.weiter) k.weiter(k); },
        oeffnen: function (k) { aktion(k); }
      });
      buehne.appendChild(e.teil.el);
    } else {
      var hinweisZeigen = def.wurzel && !S.reihe, liste = def.karten;
      if (def.modus !== 'seiten') liste = liste.concat([def.wurzel ? {
        ende: true, e: CFG.endeE || '🌙', titel: wort().endeTitel || 'Das war alles', text: wort().endeText || 'Schön, dass du da bist. Mit ✕ oben siehst du alles auf einer Seite.',
        knoepfe: [{ t: '↺ Zum Anfang', primaer: true, fn: function () { e.teil.geh(0); } }, { t: '📄 Alles auf einer Seite', fn: function () { verlassen(function () { try { scrollTo(0, 0); } catch (x) {} }, true); } }]
      } : { ende: true, e: '🌿', titel: 'Das war alles', text: '', knoepfe: [{ t: '↺ Zum Anfang', fn: function () { e.teil.geh(0); } }, { t: '✕ Zurück', primaer: true, fn: zurueck }] }]);
      e.teil = Reihe({
        karten: liste, seiten: def.modus === 'seiten', titel: def.titel, gross: CFG.gross, wort: wort(), hinweis: hinweisZeigen || (def.modus === 'seiten' && !S.seiten),
        beimWischen: function () { if (def.wurzel) S.reihe = 1; else S.seiten = 1; sichern(); },
        beimIndex: function (k) { if (k && k.beimSehen) try { k.beimSehen(); } catch (x) {} },
        oeffnen: function (k) { aktion(k); }
      });
      buehne.appendChild(e.teil.el);
      if (def.karten[0] && def.karten[0].beimSehen) try { def.karten[0].beimSehen(); } catch (x) {}
    }
    sec.querySelector('.ws-zu').addEventListener('click', function () { if (def.wurzel) verlassen(null, true); else zurueck(); });
    if (!def.wurzel) {
      sec.classList.add('ws-rein'); root.appendChild(sec); void sec.offsetWidth; sec.classList.remove('ws-rein');
      try { history.pushState(Object.assign({}, history.state || {}, { ws: tiefe }), ''); } catch (x) {}
    } else {
      sec.querySelector('.ws-menue-k').addEventListener('click', function () { menue(true); });
      root.appendChild(sec);
    }
    ebenen.forEach(function (x) { x.el.setAttribute('inert', ''); });
    ebenen.push(e);
    zaehlen();
    if (e.teil) setTimeout(function () { e.teil.fokus(); }, 80);
    else setTimeout(function () { try { sec.querySelector('.ws-zu').focus({ preventScroll: true }); } catch (x) {} }, 80);
    return e;
  }
  function zaehlen(puls) {
    var z = ebenen[0] && ebenen[0].el.querySelector('.ws-zaehler'); if (!z) return;
    var n = CFG.zaehlen ? (+fn(CFG.zaehlen) || 0) : Object.keys(S.lieb).length;
    z.hidden = !n; z.textContent = (wort().magE || '❤️') + ' ' + n; z.setAttribute('aria-label', n + ' gemocht');
    if (puls) { z.classList.remove('ws-puls'); void z.offsetWidth; z.classList.add('ws-puls'); }
  }
  function zurueck() {
    if (ebenen.length < 2) return;
    try { if (history.state && history.state.ws === ebenen.length - 1) { history.back(); return; } } catch (e) {}
    zu();
  }
  function zu() {
    if (ebenen.length < 2) return;
    var e = ebenen.pop();
    if (e.video) try { e.video.pause(); } catch (x) {}
    if (e.def.beimZu) try { e.def.beimZu(); } catch (x) {}
    e.el.classList.add('ws-rein'); e.el.setAttribute('inert', '');
    setTimeout(function () { e.el.remove(); }, RUHIG ? 0 : 260);
    var ob = ebenen[ebenen.length - 1]; ob.el.removeAttribute('inert');
    if (ob.def.auffrischen && ob.teil && ob.teil.neu) { try { ob.teil.neu(ob.teil.index(), fn(ob.def.auffrischen)); } catch (x) {} }
    if (ob.teil) setTimeout(function () { ob.teil.fokus(); }, 40);
  }
  /* Was ein Tipp auf eine Karte tut. */
  function aktion(k) {
    if (k.karten) return ebene({ titel: k.titel, chip: k.chipInnen, karten: fn(k.karten), modus: k.reihe ? 'reihe' : 'stapel', ende: k.ende, wort: k.wort, auffrischen: k.auffrischen });
    if (k.seiten) return ebene({ titel: k.titelInnen || k.titel, chip: k.chipInnen, karten: fn(k.seiten), modus: 'seiten', beimZu: k.beimZu });
    if (k.video) return ebene({ titel: k.titel, video: fn(k.video), poster: k.bild, text: k.text });
    if (k.html) return ebene({ titel: k.titel, html: fn(k.html) });
    if (k.ziel) return verlassen(function () { zumZiel(k.ziel); });
    if (k.los) { if (k.drueber) { try { k.los(); } catch (e) {} return; } return verlassen(function () { k.los(); if (k.zurueck !== false) beobachten(); }); }
  }
  /* Öffnet die App nach einem Tipp ein eigenes Fenster (Dialog, Blatt), kommen beim Schliessen die Karten zurück. */
  var beob = 0;
  function modalOffen() {
    var offen = false;
    d.querySelectorAll('dialog[open],[aria-modal="true"],[role="dialog"]').forEach(function (el) { if (!offen && !root.contains(el) && sichtbar(el)) offen = true; });
    return offen;
  }
  function beobachten() {
    var id = ++beob, t0 = Date.now(), gesehen = false, leer = 0;
    (function pruef() {
      if (id !== beob || !root.hidden) return;
      var o = modalOffen();
      if (o) { gesehen = true; leer = 0; }
      else if (gesehen) { leer++; if (leer >= 2) { zeigen(); return; } }
      else if (Date.now() - t0 > 2500) return;
      setTimeout(pruef, 400);
    })();
  }
  function zumZiel(sel) {
    var el = typeof sel === 'string' ? d.querySelector(sel) : sel; if (!el) return;
    var y = el.getBoundingClientRect().top + scrollY - (CFG.oben || 70);
    try { scrollTo({ top: Math.max(0, y), behavior: 'auto' }); } catch (e) { scrollTo(0, y); }
  }
  /* Kleines Menü: damit nichts verloren geht. */
  function menue(auf) {
    var m = root && root.querySelector('.ws-menue');
    if (!auf) { if (m && !m.hidden) { m.hidden = true; var mk2 = root.querySelector('.ws-menue-k'); if (mk2) try { mk2.focus({ preventScroll: true }); } catch (e) {} } return; }
    if (!m) {
      m = mk('div', 'ws-menue'); m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Menü');
      root.appendChild(m);
      m.addEventListener('click', function (e) {
        if (e.target === m) return menue(false);
        var b = e.target.closest('[data-m]'); if (!b) return;
        if (b.getAttribute('data-m') === 'zu') return menue(false);
        var it = m._liste[+b.getAttribute('data-m')]; if (!it) return;
        menue(false);
        if (it.drueber) it.fn(); else verlassen(it.fn, it.merken);
      });
    }
    var l = [];
    (fn(CFG.menue) || []).forEach(function (x) { if (x) l.push(x); });
    l.push({ e: '📄', t: wort().klassisch || 'Alles auf einer Seite', fn: function () { try { scrollTo(0, 0); } catch (e) {} }, merken: true });
    if (d.querySelector('.nova-btn') && !CFG.ohneNova) l.push({ e: '🌟', t: 'Nova', fn: function () { var b = d.querySelector('.nova-btn'); if (b) b.click(); } });
    m._liste = l;
    m.innerHTML = '<div class="ws-menue-in"><h3>' + esc(CFG.name || '') + '</h3>' + l.map(function (x, j) { return '<button type="button" class="ws-btn ws-m" data-m="' + j + '"><span aria-hidden="true">' + esc(x.e || '•') + '</span> ' + esc(x.t) + '</button>'; }).join('') +
      '<button type="button" class="ws-btn ws-m-zu" data-m="zu">Schliessen</button></div>';
    m.hidden = false;
    setTimeout(function () { var b = m.querySelector('.ws-m'); if (b) b.focus({ preventScroll: true }); }, 30);
  }

  /* ================= Bausteine für die Apps ================= */
  var W = {};
  W.esc = esc; W.teile = teile; W.fn = fn;
  /* Klickt nacheinander auf Elemente der App (nach dem Verlassen), z. B. W.klick('#spielKnopf', '[data-spiel=memory]'). */
  W.klick = function () {
    var sel = [].slice.call(arguments);
    return function () {
      var j = 0;
      (function weiter() {
        if (j >= sel.length) return;
        var s = sel[j++], el = typeof s === 'function' ? s() : d.querySelector(s);
        if (el) { try { el.scrollIntoView({ block: 'center' }); } catch (e) {} el.click(); }
        setTimeout(weiter, 260);
      })();
    };
  };
  W.da = function (sel) { return !!d.querySelector(sel); };
  /* Findet einen Knopf über seinen Text (für Knöpfe ohne id): W.mitText('button', 'Zettel ablegen') */
  W.mitText = function (sel, text) { return function () { return [].slice.call(d.querySelectorAll(sel)).filter(function (el) { return !el.closest('.ws') && (el.innerText || '').indexOf(text) >= 0; })[0] || null; }; };
  /* Karte aus einem bestehenden Knopf der App: Tipp auf die Karte = Tipp auf den Knopf. Fehlt der Knopf, gibt es keine Karte. */
  W.knopf = function (sel, o) {
    o = o || {}; Object.keys(o).forEach(function (k) { if (o[k] === undefined) delete o[k]; });
    var el = typeof sel === 'function' ? sel() : d.querySelector(sel); if (!el) return null;
    var zeilen = (el.innerText || el.getAttribute('aria-label') || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    var t = zeilen[0] || '', m = t.match(/^((?:[\u2190-\u2BFF\u2600-\u27BF\uFE0F\u200D]|[\uD83C-\uDBFF][\uDC00-\uDFFF])+)\s*/);
    var titel = m ? t.slice(m[0].length) : t; if (titel === titel.toUpperCase()) titel = titel.charAt(0) + titel.slice(1).toLowerCase();
    return Object.assign({ id: 'k:' + (typeof sel === 'string' ? sel : (o.id || titel)), e: m ? m[1] : '✨', titel: titel, text: zeilen.slice(1).join(' ').replace(/,\s*neu$/i, ''), los: W.klick(sel), art: 'bereich' }, o);
  };
  /* Abwechselnd mischen: W.mischen([a,b],[c,d]) → a,c,b,d */
  W.mischen = function () {
    var ls = [].slice.call(arguments).map(function (l) { return (l || []).filter(Boolean).slice(); }), out = [], mehr = true;
    while (mehr) { mehr = false; ls.forEach(function (l) { if (l.length) { out.push(l.shift()); mehr = true; } }); }
    return out;
  };
  /* Gruppe: eine Karte, hinter der wieder eine Reihe liegt (z. B. «Spiele»). */
  W.gruppe = function (o) { return Object.assign({ art: 'bereich', reihe: true }, o); };
  /* «Sprich mit …» als Karte. */
  W.sprich = function (o) {
    o = o || {};
    var figur = o.figur || (window.SPRICH && window.SPRICH.figur) || (window.INHALT && window.INHALT.figur) || CFG.name;
    var auf = o.los || (window.Sprich ? function () { window.Sprich.oeffnen(); } : (window.DRLAB_INHALT && window.DRLAB_INHALT.sprich && window.INHALT && window.INHALT.figur) ? function () { window.DRLAB_INHALT.sprich(); } : null);
    if (!auf) return null;
    return { id: 'sprich', art: 'sprich', e: o.e || '💬', bild: o.bild, chip: o.chip || 'Quatschen', titel: 'Sprich mit ' + figur, text: o.text || 'Tippen, fragen, erzählen. Alles bleibt auf diesem Handy.', los: auf, drueber: o.drueber !== false, farbe: o.farbe };
  };
  /* Film-Karte: video (Datei) oder los (bestehender Film-Knopf der App). */
  W.film = function (o) { return Object.assign({ art: 'film', chip: 'Film', e: '🎬' }, o); };
  /* Abschnitte einer langen Seite als Karten (Tipp: Seite öffnet sich genau dort). */
  W.abschnitte = function (o) {
    o = o || {}; var out = [], seen = {};
    [].slice.call(d.querySelectorAll(o.sel || 'h2')).forEach(function (h) {
      if (h.closest('.ws,[role=dialog],dialog,[hidden],[aria-hidden="true"]') || !h.getClientRects().length) return;
      var t = (h.innerText || h.textContent || '').replace(/\s+/g, ' ').trim(); if (!t || seen[t]) return;
      var box = h.closest(o.box || 'section,article,.card,.mp-karte,.r4-karte') || h.parentElement;
      if (o.ausser && o.ausser.some(function (x) { return t.indexOf(x) >= 0 || box.id === x || h.id === x; })) return;
      seen[t] = 1;
      var m = t.match(/^((?:[←-⯿☀-➿️‍]|[\uD83C-\uDBFF][\uDC00-\uDFFF])+)\s*/);
      var e = (o.emoji && (o.emoji[box.id] || o.emoji[h.id] || o.emoji[t])) || (m ? m[1] : (o.e || '✨'));
      var titel = (m ? t.slice(m[0].length) : t).replace(/\s*NEU$/, '').trim();
      if (titel === titel.toUpperCase()) titel = titel.charAt(0) + titel.slice(1).toLowerCase();
      var p = null;
      [].slice.call(box.querySelectorAll('p,small,.leise,.sub')).some(function (x) { var tx = (x.innerText || '').replace(/\s+/g, ' ').trim(); if (tx.length > 25 && !x.closest('button')) { p = tx; return true; } return false; });
      out.push({ id: 'ab:' + (box.id || h.id || t).slice(0, 40), e: e, chip: o.chip || 'Bereich', titel: titel, text: p ? (p.length > 140 ? p.slice(0, 137) + '…' : p) : (o.text || 'Tippen und dort weitermachen.'), ziel: box, art: 'bereich' });
    });
    return out;
  };

  /* Karte zu einem Bereich der Seite: Tipp öffnet die ganze Seite genau dort. */
  W.ziel = function (sel, o) {
    o = o || {}; var el = typeof sel === 'string' ? d.querySelector(sel) : sel; if (!el) return null;
    var h = el.matches('h1,h2,h3') ? el : el.querySelector('h2,h3'), t = h ? (h.innerText || h.textContent || '').replace(/\s+/g, ' ').trim() : '';
    var m = t.match(/^((?:[\u2190-\u2BFF\u2600-\u27BF\uFE0F\u200D]|[\uD83C-\uDBFF][\uDC00-\uDFFF])+)\s*/); if (m) t = t.slice(m[0].length);
    t = t.replace(/\s*NEU$/, ''); if (t && t === t.toUpperCase()) t = t.charAt(0) + t.slice(1).toLowerCase();
    var p = ''; [].slice.call(el.querySelectorAll('p,small,.leise,.sub')).some(function (x) { var tx = (x.innerText || '').replace(/\s+/g, ' ').trim(); if (tx.length > 25 && !x.closest('button')) { p = tx; return true; } return false; });
    if (p.length > 140) p = p.slice(0, 137) + '…';
    return Object.assign({ id: 'z:' + (typeof sel === 'string' ? sel : el.id), e: m ? m[1] : '✨', chip: 'Bereich', titel: t || o.titel || '', text: p, ziel: el, art: 'bereich' }, o);
  };
  /* Neuheiten der letzten Runden (Knöpfe mit data-r8f / data-r7f) als eine Gruppe. */
  W.neuheiten = function (o) {
    o = o || {};
    var l = [].slice.call(d.querySelectorAll('[data-r8f],[data-r7f]')).filter(function (el) { return !el.closest('.ws,[hidden]'); }).map(function (el) {
      var a = el.hasAttribute('data-r8f') ? 'data-r8f' : 'data-r7f'; return W.knopf('[' + a + '="' + el.getAttribute(a) + '"]', { chip: o.chip || 'Neu' });
    }).filter(Boolean);
    if (!l.length) return null;
    return W.gruppe({ id: 'neuheiten', e: o.e || '✨', chip: l.length + ' Neuheiten', titel: o.titel || 'Neu hier', text: o.text || l.slice(0, 4).map(function (k) { return k.titel; }).join(', ') + '.', karten: function () { return l; } });
  };
  /* Alle Bereiche der langen Seite als eine Gruppe («Alles von …»). */
  W.alles = function (o) {
    o = o || {}; var l = W.abschnitte(o);
    if (!l.length) return null;
    return W.gruppe({ id: 'alles', e: o.e || '🗂️', chip: l.length + ' Bereiche', titel: o.titel || 'Alles auf einen Blick', text: o.text || l.slice(0, 5).map(function (k) { return k.titel; }).join(', ') + ' …', karten: function () { return l; } });
  };

  /* ---- Kinder-Inhalte (inhalt/inhalt.js, window.INHALT.regale) ---- */
  W.kinder = function (o) {
    o = o || {};
    var I = window.INHALT; if (!I || !I.regale) return null;
    var KEY = 'inhalt_' + (I.app || 'app'), MAX = o.max || (CFG.gross ? 170 : 260);
    function hol() { return jsonHol(KEY, {}) || {}; }
    function leg(v) { jsonLeg(KEY, v); }
    function titel(it) { return it.t || it.n || it.f || ''; }
    function k(r, it) { return r.id + '/' + it.id; }
    function istMag(r, it) { return (hol().mag || []).indexOf(k(r, it)) >= 0; }
    function magSetzen(r, it, an) { var v = hol(), m = v.mag = v.mag || [], x = m.indexOf(k(r, it)); if (x >= 0) m.splice(x, 1); if (an) m.unshift(k(r, it)); leg(v); }
    function gesehen(r, it) { return !!((hol().gesehen || {})[k(r, it)]); }
    function merkGesehen(r, it) { var v = hol(); v.gesehen = v.gesehen || {}; v.gesehen[k(r, it)] = tag(); v.zuletzt = k(r, it); leg(v); }
    function regal(id) { for (var j = 0; j < I.regale.length; j++) if (I.regale[j].id === id) return I.regale[j]; return null; }
    function oeffneInhalt(rid) { return function () { if (window.Inhalt) window.Inhalt.oeffnen(rid || ''); }; }
    function itemKarte(r, it, chip) {
      if (r.typ === 'quiz' || r.typ === 'album') return { id: 'r:' + r.id, e: r.e, chip: chip || r.titel, titel: r.titel, text: r.kurz || r.intro, los: oeffneInhalt(r.id), drueber: true, farbe: I.farbe };
      return { id: 'i:' + k(r, it), e: it.e || r.e, chip: chip || r.titel, titel: titel(it), text: it.kurz || it.x || (it.seiten && it.seiten[0]) || '', farbe: I.farbe, art: 'inhalt', lieb: false,
        seiten: function () { return seiten(r, it); }, mag: function () { magSetzen(r, it, true); }, istMag: function () { return istMag(r, it); } };
    }
    function seiten(r, it) {
      merkGesehen(r, it);
      var ps = [], t = titel(it), e = it.e || r.e;
      if (r.typ === 'geschichten') {
        it.seiten.forEach(function (s, j) { teile(s, MAX).forEach(function (x, m) { ps.push({ e: j === 0 && m === 0 ? e : null, titel: j === 0 && m === 0 ? t : null, text: x }); }); });
        if (it.lehre) ps.push({ e: '💡', text: it.lehre });
      } else if (r.typ === 'uebungen') {
        ps.push({ e: e, titel: t, text: it.kurz || '' });
        it.schritte.forEach(function (s, j) { ps.push({ chip: 'Schritt ' + (j + 1) + ' von ' + it.schritte.length, text: s }); });
        if (it.tipp) ps.push({ e: '💡', chip: 'Tipp', text: it.tipp });
      } else {
        teile(it.x, MAX).forEach(function (x, m) { ps.push({ e: m === 0 ? e : null, titel: m === 0 ? t : null, text: x }); });
        if (it.tipp) ps.push({ e: '💡', chip: 'Tipp', text: it.tipp });
      }
      var kn = [{ t: '🤍 ' + (wort().mag || 'Mag ich'), tAn: '❤️ ' + (wort().mag || 'Mag ich'), an: function () { return istMag(r, it); }, fn: function () { magSetzen(r, it, !istMag(r, it)); } }];
      if (r.typ === 'uebungen') kn.unshift({ t: '✓ Geschafft', primaer: true, fn: function (b) {
        var v = hol(); v.geschafft = v.geschafft || {}; v.geschafft[k(r, it)] = (v.geschafft[k(r, it)] || 0) + 1; leg(v);
        b.textContent = '✓ Super! (' + v.geschafft[k(r, it)] + '×)'; if (I.beiGeschafft) try { I.beiGeschafft(it); } catch (x) {} return true; } });
      var nx = naechstes(r, it);
      if (nx) kn.push({ t: 'Nächstes ▶', primaer: r.typ !== 'uebungen', fn: function () { zu(); aktion(itemKarte(r, nx)); } });
      ps.push({ ende: true, e: r.typ === 'uebungen' ? '🏅' : '⭐', titel: r.typ === 'geschichten' ? 'Ende' : 'Fertig!', text: r.typ === 'uebungen' ? 'Hat es geklappt?' : 'Hat es dir gefallen?', knoepfe: kn });
      return ps;
    }
    function naechstes(r, it) {
      var i = r.items.indexOf(it), rest = r.items.slice(i + 1).concat(r.items.slice(0, i));
      return rest.filter(function (y) { return it.tag && y.tag === it.tag && !gesehen(r, y); })[0] || rest.filter(function (y) { return !gesehen(r, y); })[0] || rest[0];
    }
    function regalKarten(r) {
      var neu = r.items.filter(function (it) { return !gesehen(r, it); }), alt = r.items.filter(function (it) { return gesehen(r, it); });
      if (r.typ === 'uebungen') { var st = (window.Inhalt && window.Inhalt.profil) ? window.Inhalt.profil().stufe : 1, gr = []; r.items.forEach(function (it) { if (gr.indexOf(it.stufe || '') < 0) gr.push(it.stufe || ''); });
        var ok = gr.slice(0, st + 1); neu = neu.filter(function (it) { return ok.indexOf(it.stufe || '') >= 0; }).concat(neu.filter(function (it) { return ok.indexOf(it.stufe || '') < 0; })); }
      return neu.concat(alt).map(function (it) { return itemKarte(r, it, (r.gruppen && r.gruppen[it.stufe]) || (gesehen(r, it) ? '✓ schon gesehen' : null)); });
    }
    function regalKarte(r) {
      if (r.typ === 'quiz' || r.typ === 'album') return { id: 'r:' + r.id, art: r.typ === 'quiz' ? 'spiel' : 'bereich', e: r.e, chip: r.typ === 'quiz' ? 'Spiel' : 'Sammeln', titel: r.titel, text: r.intro || r.kurz, los: oeffneInhalt(r.id), drueber: true, farbe: I.farbe };
      return { id: 'r:' + r.id, art: 'bereich', e: r.e, chip: r.kurz || 'Entdecken', titel: r.titel, text: r.intro || r.kurz, farbe: I.farbe,
        karten: function () { return regalKarten(r); }, auffrischen: function () { return regalKarten(r); },
        ende: function () { return { e: '🌙', titel: 'Alle Karten gesehen', text: 'Schön! Wisch dich später wieder durch. Was dir gefällt, merkt sich die App.', knoepfe: [{ t: '↺ Nochmals', primaer: true, fn: function () { var o = ebenen[ebenen.length - 1]; o.teil.neu(0, regalKarten(r)); } }, { t: '✕ Zurück', fn: zurueck }] }; } };
    }
    var out = { regale: I.regale.filter(function (r) { return r.items && r.items.length; }).map(regalKarte), heute: null, fuerDich: null,
      alle: { id: 'alle-inhalt', e: '🗂️', chip: 'Alles', titel: I.titel || 'Entdecken', text: 'Alle Regale, Abzeichen und deine Stufe.', los: oeffneInhalt(''), drueber: true, farbe: I.farbe } };
    try { var h = window.Inhalt && window.Inhalt.heute(); if (h) { out.heute = itemKarte(h.r, h.it, '☀️ Heute'); out.heute.id = 'heute'; out.heute.fest = true; } } catch (e) {}
    try { var f = window.Inhalt && window.Inhalt.fuerDich(); if (f && (!out.heute || f.it !== (window.Inhalt.heute() || {}).it)) { out.fuerDich = itemKarte(f.r, f.it, f.grund); out.fuerDich.id = 'fuerdich'; out.fuerDich.fest = true; } } catch (e) {}
    return out;
  };

  /* ---- Bibliothek der Erwachsenen-Apps (inhalt/bibliothek.js, window.INHALT.artikel) ---- */
  W.bibliothek = function (o) {
    o = o || {};
    var C = window.INHALT, B = window.DRLAB_INHALT; if (!C || !C.artikel || !B || !B.daten) return null;
    var MAX = o.max || (CFG.gross ? 170 : 300), BER = {}; (C.bereiche || []).forEach(function (b) { BER[b.id] = b; });
    function D() { return B.daten(); }
    function em(a) { return a.e || (BER[a.b] && BER[a.b].emoji) || '•'; }
    function istMerk(a) { return !!D().gemerkt[a.id]; }
    function karte(a, chip) {
      return { id: 'a:' + a.id, e: em(a), chip: chip || (BER[a.b] && BER[a.b].name) || '', titel: a.t, text: a.k, art: 'inhalt', lieb: false,
        seiten: function () { return seiten(a); }, mag: function () { B.merken(a.id, true); }, istMag: function () { return istMerk(a); } };
    }
    function seiten(a) {
      B.geoeffnet(a.id);
      var ps = [{ e: em(a), chip: (BER[a.b] && BER[a.b].name) || '', titel: a.t, text: a.k }];
      (a.x || []).forEach(function (p) { teile(p, MAX).forEach(function (x) { ps.push({ text: x }); }); });
      if (a.s && a.s.length) {
        var gr = CFG.gross ? 3 : 6, tt = a.sTitel || C.wortSchritte || 'So gehst du vor';
        for (var j = 0; j < a.s.length; j += gr) ps.push({ chip: tt + (a.s.length > gr ? ' · ' + (j / gr + 1) : ''), liste: a.s.slice(j, j + gr), start: j });
      }
      var hw = (a.h || C.hinweis) && (C.ohneHinweis || []).indexOf(a.b) < 0 ? (a.h || C.hinweis) : '';
      var vs = B.vorschlag ? B.vorschlag(a.id) : null;
      var kn = [{ t: '🔖 Merken', tAn: '🔖 Gemerkt', an: function () { return istMerk(a); }, fn: function () { B.merken(a.id, !istMerk(a)); } }];
      if (vs) kn.push({ t: 'Nächster ▶', primaer: true, fn: function () { zu(); aktion(karte(vs.a, vs.warum)); } });
      ps.push({ ende: true, e: '✓', titel: C.wortDanke || 'Schön, gelesen', text: vs ? (vs.warum.indexOf(vs.a.t) >= 0 ? 'Als Nächstes: «' + vs.a.t + '»' : vs.warum + ': «' + vs.a.t + '»') : '', klein: hw, knoepfe: kn, beimSehen: function () { B.gelesen(a.id); } });
      return ps;
    }
    function bereichKarten(b) {
      var l = C.artikel.filter(function (a) { return a.b === b.id; });
      var neu = l.filter(function (a) { return !D().gelesen[a.id]; }), alt = l.filter(function (a) { return D().gelesen[a.id]; });
      return neu.concat(alt).map(function (a) { return karte(a, D().gelesen[a.id] ? '✓ ' + (C.wortGelesen || 'Gelesen') : null); });
    }
    var bereiche = (C.bereiche || []).filter(function (b) { return C.artikel.some(function (a) { return a.b === b.id; }); }).map(function (b) {
      var n = C.artikel.filter(function (a) { return a.b === b.id; }).length;
      return { id: 'b:' + b.id, art: 'bereich', e: b.emoji || '📚', chip: n + ' ' + (C.wortBeitraege || 'Beiträge'), titel: b.name, text: b.kurz || C.artikel.filter(function (a) { return a.b === b.id; }).slice(0, 3).map(function (a) { return a.t; }).join(' · ') + ' …',
        karten: function () { return bereichKarten(b); }, auffrischen: function () { return bereichKarten(b); },
        ende: function () { return { e: '🌿', titel: 'Alles aus «' + b.name + '» gesehen', text: 'Was du gemerkt hast, findest du in der Bibliothek.', knoepfe: [{ t: '↺ Nochmals', primaer: true, fn: function () { ebenen[ebenen.length - 1].teil.neu(0, bereichKarten(b)); } }, { t: '✕ Zurück', fn: zurueck }] }; } };
    });
    var h = B.heute ? B.heute() : null, vs = B.vorschlag ? B.vorschlag(h && h.id) : null, D0 = D();
    var out = { bereiche: bereiche, heute: null, fuerDich: null,
      quiz: (C.quiz || []).length ? { id: 'quiz', art: 'spiel', e: '🎯', chip: 'Spiel', titel: C.wortQuiz || 'Quiz', text: (C.wortTagesfrage || 'Frage des Tages') + ' und Runden mit 5 Fragen.', los: function () { B.oeffne('quiz'); }, drueber: true } : null,
      sammlung: { id: 'sammlung', art: 'bereich', e: '🏅', chip: 'Dein Stand', titel: C.wortSammlung || 'Sammlung', text: 'Abzeichen, Stufe und was du schon gelesen hast.', los: function () { B.oeffne('sammlung'); }, drueber: true },
      alle: { id: 'bibliothek', art: 'bereich', e: '📚', chip: C.artikel.length + ' ' + (C.wortBeitraege || 'Beiträge'), titel: C.titel || 'Bibliothek', text: 'Alles auf einen Blick, mit Suche und Gemerktem.', los: function () { B.oeffne('bibliothek'); }, drueber: true } };
    if (h) { out.heute = karte(h, '☀️ ' + (C.heuteLabel || 'Heute')); out.heute.id = 'heute'; out.heute.fest = true; }
    if (vs && (D0.zuletzt || Object.keys(D0.gemerkt).length)) { out.fuerDich = karte(vs.a, vs.warum); out.fuerDich.id = 'fuerdich'; out.fuerDich.fest = true; }
    return out;
  };

  window.Wischen = { start: start, W: W, zeigen: zeigen, verlassen: verlassen, Stapel: Stapel, Reihe: Reihe, aktion: function (k) { aktion(k); }, zurueck: zurueck, offen: function () { return !!root && !root.hidden; } };
})();
