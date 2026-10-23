/* inhalt.js – Inhalts-Regal für DR-Lab-Apps («Hochglanz»: ein Tipp zum Guten, nichts Kompliziertes).
   Oben «Heute» (wechselt jeden Tag) und «Für dich» (Weil du X mochtest …), darunter grosse Regal-Kacheln.
   Regal-Arten: karten (Wissen, Tipps), quiz (5 Fragen pro Runde), album (Sammelbilder), geschichten (Seiten zum Lesen),
   uebungen (Schritte, «Geschafft»). Abzeichen werden aus dem Fortschritt berechnet.
   Inhalt kommt aus window.INHALT (inhalt/daten.js). Gespeichert wird nur auf diesem Handy: localStorage «inhalt_<app>».
   Öffnen: Elemente mit [data-inhalt] (Wert = Regal-ID oder leer). [data-inhalt-heute] zeigt das Heute-Element. */
(function () {
  'use strict';
  if (window.Inhalt) return;
  var d = document, RUHIG = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function I() { return window.INHALT || { regale: [], abzeichen: [] }; }
  var KEY = function () { return 'inhalt_' + (I().app || 'app'); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hol() { try { var v = JSON.parse(localStorage.getItem(KEY()) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
  function leg(v) { try { localStorage.setItem(KEY(), JSON.stringify(v)); } catch (e) {} }
  function tag() { return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000); }
  function regal(id) { var r = I().regale; for (var i = 0; i < r.length; i++) if (r[i].id === id) return r[i]; return null; }
  function item(r, id) { for (var i = 0; i < r.items.length; i++) if (r.items[i].id === id) return r.items[i]; return null; }
  function titel(it) { return it.t || it.n || it.f || ''; }
  function gesehen(v, r, it) { return !!((v.gesehen || {})[r.id + '/' + it.id]); }
  function anzahlGesehen(v, r) { if (r.typ === 'album') return frei(r); if (r.typ === 'quiz') return Object.keys(v.richtig || {}).filter(function (k) { return k.indexOf(r.id + '/') === 0; }).length; return r.items.filter(function (it) { return gesehen(v, r, it); }).length; }
  function frei(r) { var n = 0; try { n = r.frei ? r.frei() : 0; } catch (e) {} return Math.max(0, Math.min(r.items.length, n | 0)); }
  function besuch() { var v = hol(), t = tag(); if (v.letzter !== t) { v.serie = v.letzter === t - 1 ? (v.serie || 0) + 1 : 1; v.letzter = t; v.tage = (v.tage || 0) + 1; leg(v); } }
  function merkGesehen(r, it) { var v = hol(); v.gesehen = v.gesehen || {}; v.gesehen[r.id + '/' + it.id] = tag(); v.zuletzt = r.id + '/' + it.id; leg(v); }
  function istMag(r, it) { return (hol().mag || []).indexOf(r.id + '/' + it.id) >= 0; }
  function magToggle(r, it) { var v = hol(), m = v.mag = v.mag || [], k = r.id + '/' + it.id, i = m.indexOf(k); if (i >= 0) m.splice(i, 1); else m.unshift(k); leg(v); return i < 0; }

  /* Lern-Profil: nur auf diesem Handy. Punkte aus Gesehenem, Geschafftem und Rätselrunden ergeben die Stufe.
     Die Stufe ändert die Schwierigkeit (Rätsel: Stufe 1 = 3 Fragen mit 2 Antworten, Stufe 2 = 4 Fragen, ab 3 = 5 Fragen)
     und die Vorschläge (Übungen: zuerst die einfachen Gruppen, mit jeder Stufe eine Gruppe mehr). */
  var STUFEN = [[0, 'Neu dabei', '🌱'], [12, 'Entdecker', '🔎'], [35, 'Kenner', '⭐'], [70, 'Profi', '🏅'], [120, 'Meister', '👑']];
  function profil() {
    var v = hol(), D = I(), pk = 0, g = 0, tags = {}, best = null, bestN = -1, st = D.stufen || STUFEN;
    D.regale.forEach(function (r) { var n = anzahlGesehen(v, r); pk += n; if (r.typ !== 'album' && n / Math.max(1, r.items.length) > bestN) { bestN = n / Math.max(1, r.items.length); best = r; } });
    for (var k in (v.geschafft || {})) g += v.geschafft[k];
    pk += 2 * g + 3 * (v.runden || 0) + 5 * (v.perfekt || 0);
    (v.mag || []).forEach(function (key) { var p = key.split('/'), r = regal(p[0]), it = r && item(r, p[1]); if (it && it.tag) tags[it.tag] = (tags[it.tag] || 0) + 1; });
    var lt = null; for (var t in tags) if (!lt || tags[t] > tags[lt]) lt = t;
    var i = 0; while (i < st.length - 1 && pk >= st[i + 1][0]) i++;
    return { punkte: pk, stufe: i + 1, name: st[i][1], e: st[i][2], bis: i < st.length - 1 ? st[i + 1][0] - pk : 0, naechsteName: i < st.length - 1 ? st[i + 1][1] : '',
      lieblingsTag: lt, lieblingsRegal: bestN > 0 ? best : null, mag: (v.mag || []).length, serie: v.serie || 0 };
  }
  function quizZahl() { var s = profil().stufe; return s <= 1 ? 3 : s === 2 ? 4 : 5; }

  /* Heute: jeden Tag ein anderes Element aus den Regalen, die mitmachen (heute !== false) */
  function heute() {
    var rs = I().regale.filter(function (r) { return r.heute !== false && r.typ !== 'album' && r.items.length; });
    if (!rs.length) return null; var t = tag(), r = rs[t % rs.length], it = r.items[Math.floor(t / rs.length) % r.items.length];
    return { r: r, it: it };
  }
  /* Für dich: nach dem Lieblingselement oder dem zuletzt gesehenen das nächste Ungesehene mit gleichem Thema */
  function fuerDich() {
    var v = hol(), basisKey = (v.mag || [])[0] || v.zuletzt, grund = '';
    if (!basisKey) return null;
    var p = basisKey.split('/'), r = regal(p[0]), b = r && item(r, p[1]); if (!b) return null;
    grund = ((v.mag || [])[0] === basisKey ? 'Weil du «' : 'Weil du zuletzt «') + titel(b) + (((v.mag || [])[0] === basisKey) ? '» mochtest' : '» hattest');
    var kand = (r.typ === 'quiz' || r.typ === 'album') ? [] : r.items.filter(function (it) { return it !== b && !gesehen(v, r, it); });
    var lt = b.tag || profil().lieblingsTag, gleich = kand.filter(function (it) { return lt && it.tag === lt; });
    var x = gleich[0] || kand[0];
    if (!x) { var andere = I().regale.filter(function (q) { return q !== r && q.typ !== 'album' && q.typ !== 'quiz'; }); for (var i = 0; i < andere.length && !x; i++) { x = andere[i].items.filter(function (it) { return !gesehen(v, andere[i], it); })[0]; if (x) r = andere[i]; } }
    return x ? { r: r, it: x, grund: grund } : null;
  }

  /* ---------------- Fenster ---------------- */
  var root, box, jetzt = {};
  function bau() {
    if (root) return;
    root = d.createElement('div'); root.className = 'ih'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.innerHTML = '<div class="ih-kopf"><button type="button" class="ih-rund" data-ih="zurueck" aria-label="Zurück">←</button><h2></h2><span class="ih-platz"></span></div><div class="ih-scroll"></div>';
    d.body.appendChild(root); box = root.querySelector('.ih-scroll');
    root.addEventListener('click', klick);
    d.addEventListener('keydown', function (e) { if (!root.hidden && e.key === 'Escape') zurueck(); });
  }
  function kopf(t) { root.querySelector('h2').textContent = t; root.setAttribute('aria-label', t); }
  function oeffnen(rid) {
    bau(); besuch(); var D = I(); root.style.setProperty('--ih', D.farbe || '#ffd27a');
    root.hidden = false; d.documentElement.classList.add('ih-offen');
    jetzt = {}; if (rid && regal(rid)) zeigRegal(regal(rid), true); else start();
  }
  function schliessen() { root.hidden = true; d.documentElement.classList.remove('ih-offen'); markHeute(); if (I().beimSchliessen) try { I().beimSchliessen(); } catch (e) {} }
  function zurueck() { if (jetzt.ansicht === 'item' || jetzt.ansicht === 'quiz') zeigRegal(jetzt.r); else if (jetzt.ansicht === 'regal' && !jetzt.direkt) start(); else schliessen(); }
  function rein() { box.scrollTop = 0; if (!RUHIG) { box.classList.remove('ih-rein'); void box.offsetWidth; box.classList.add('ih-rein'); } }

  function karteHTML(r, it, extra, cls) {
    return '<button type="button" class="ih-hero ' + (cls || '') + '" data-ih-item="' + r.id + '/' + it.id + '"><span class="ih-hero-e" aria-hidden="true">' + (it.e || r.e) + '</span><span class="ih-hero-tx"><small>' + esc(extra) + '</small><b>' + esc(titel(it)) + '</b><small>' + r.e + ' ' + esc(r.titel) + '</small></span><span class="ih-pfeil" aria-hidden="true">▶</span></button>';
  }
  function start() {
    jetzt = { ansicht: 'start' }; var D = I(), v = hol(), h = heute(), f = fuerDich();
    kopf(D.titel || 'Entdecken');
    var html = (D.intro ? '<p class="ih-intro">' + esc(D.intro) + '</p>' : '');
    if (window.Sprich && window.SPRICH) html += '<button type="button" class="ih-sprich" data-ih="sprich"><span aria-hidden="true">💬</span> Sprich mit ' + esc(window.SPRICH.figur) + '</button>';
    var pf = profil();
    html += '<p class="ih-profil"><span aria-hidden="true">' + pf.e + '</span> Stufe ' + pf.stufe + ' · ' + esc(pf.name) + ' · ' + pf.punkte + ' Punkte' + (pf.bis ? '<small>Noch ' + pf.bis + ' bis «' + esc(pf.naechsteName) + '»</small>' : '') + '</p>';
    if (h) html += karteHTML(h.r, h.it, 'Heute', 'heute');
    if (f && !(h && f.it === h.it)) html += karteHTML(f.r, f.it, f.grund, 'fuerdich');
    html += '<div class="ih-regale">' + D.regale.map(function (r) {
      var n = anzahlGesehen(v, r), m = r.items.length;
      return '<button type="button" class="ih-regal" data-ih-regal="' + r.id + '"><span class="ih-regal-e" aria-hidden="true">' + r.e + '</span><b>' + esc(r.titel) + '</b><small>' + esc(r.kurz || '') + '</small>' +
        '<span class="ih-balken" aria-label="' + n + ' von ' + m + '"><i style="width:' + Math.round(n / Math.max(1, m) * 100) + '%"></i></span><small class="ih-zahl">' + n + ' / ' + m + '</small></button>';
    }).join('') + '</div>';
    var ab = abzeichen();
    if (ab.length) html += '<h3 class="ih-h3">Abzeichen · ' + ab.filter(function (a) { return a.da; }).length + ' von ' + ab.length + '</h3><div class="ih-abz">' + ab.map(function (a) {
      return '<span class="ih-ab' + (a.da ? ' da' : '') + '" title="' + esc(a.n + ': ' + a.x) + '"><i aria-hidden="true">' + (a.da ? a.e : '🔒') + '</i><b>' + esc(a.n) + '</b><small>' + esc(a.x) + '</small></span>'; }).join('') + '</div>';
    if ((v.serie || 0) > 1) html += '<p class="ih-serie">🔥 ' + v.serie + ' Tage hintereinander da. Schön!</p>';
    if (D.fuss) html += '<p class="ih-fuss">' + esc(D.fuss) + '</p>';
    box.innerHTML = html; rein();
  }
  function abzeichen() {
    var v = hol(), D = I(); var info = { tage: v.tage || 0, serie: v.serie || 0, mag: (v.mag || []).length, runden: v.runden || 0, perfekt: v.perfekt || 0, regal: {} };
    D.regale.forEach(function (r) { info.regal[r.id] = anzahlGesehen(v, r); });
    var g = 0; for (var k in (v.geschafft || {})) g += v.geschafft[k]; info.geschafft = g;
    return (D.abzeichen || []).map(function (a) { var da = false; try { da = !!a.wann(info); } catch (e) {} return { e: a.e, n: a.n, x: a.x, da: da }; });
  }

  /* ---------------- Regal ---------------- */
  function zeigRegal(r, direkt) {
    var v = hol(); jetzt = { ansicht: 'regal', r: r, direkt: !!direkt || (jetzt.r === r && !!jetzt.direkt) };
    kopf(r.titel); var html = r.intro ? '<p class="ih-intro">' + esc(r.intro) + '</p>' : '';
    if (r.typ === 'quiz') {
      var n = anzahlGesehen(v, r);
      html += '<div class="ih-quizstart"><span aria-hidden="true">' + r.e + '</span><p>' + n + ' von ' + r.items.length + ' Fragen schon richtig.</p><button type="button" class="ih-gross" data-ih="quiz">▶ ' + quizZahl() + ' Fragen spielen</button></div>';
    } else if (r.typ === 'album') {
      var f = frei(r);
      html += '<p class="ih-intro">' + f + ' von ' + r.items.length + ' gesammelt.' + (r.wie ? ' ' + esc(r.wie) : '') + '</p><div class="ih-album">' + r.items.map(function (it, i) {
        return i < f ? '<button type="button" class="ih-sammel" data-ih-item="' + r.id + '/' + it.id + '"><span aria-hidden="true">' + it.e + '</span><b>' + esc(titel(it)) + '</b></button>'
          : '<span class="ih-sammel zu" aria-label="noch nicht gesammelt"><span aria-hidden="true">❔</span><b>Nr. ' + (i + 1) + '</b></span>'; }).join('') + '</div>';
    } else {
      var gr = []; r.items.forEach(function (it) { var g = it.stufe || ''; if (gr.indexOf(g) < 0) gr.push(g); });
      var erlaubt = r.typ === 'uebungen' ? gr.slice(0, profil().stufe + 1) : gr;
      var naechstes = r.items.filter(function (it) { return !gesehen(v, r, it) && erlaubt.indexOf(it.stufe || '') >= 0; })[0] || r.items.filter(function (it) { return !gesehen(v, r, it); })[0];
      if (naechstes) html += karteHTML(r, naechstes, 'Als Nächstes', 'fuerdich');
      var gruppen = {}, reihen = [];
      r.items.forEach(function (it) { var g = it.stufe || it.tag || ''; if (!gruppen[g]) { gruppen[g] = []; reihen.push(g); } gruppen[g].push(it); });
      reihen.forEach(function (g) {
        if (g && reihen.length > 1) html += '<h3 class="ih-h3">' + esc((r.gruppen && r.gruppen[g]) || g) + '</h3>';
        html += '<div class="ih-liste">' + gruppen[g].map(function (it) {
          var s = gesehen(v, r, it), m = istMag(r, it);
          return '<button type="button" class="ih-zeile' + (s ? ' gesehen' : '') + '" data-ih-item="' + r.id + '/' + it.id + '"><span class="ih-zeile-e" aria-hidden="true">' + (it.e || r.e) + '</span><span class="ih-zeile-tx"><b>' + esc(titel(it)) + '</b>' + (it.kurz ? '<small>' + esc(it.kurz) + '</small>' : '') + '</span><span class="ih-mark" aria-hidden="true">' + (m ? '❤️' : s ? '✓' : '') + '</span></button>'; }).join('') + '</div>';
      });
    }
    box.innerHTML = html; rein();
  }

  /* ---------------- Ein Element ---------------- */
  function zeigItem(r, it, seite) {
    jetzt = { ansicht: 'item', r: r, it: it, seite: seite || 0, direkt: jetzt.direkt };
    merkGesehen(r, it); kopf(r.titel);
    var html = '<article class="ih-blatt"><span class="ih-blatt-e" aria-hidden="true">' + (it.e || r.e) + '</span><h3>' + esc(titel(it)) + '</h3>';
    if (r.typ === 'geschichten') {
      var n = it.seiten.length, s = Math.min(jetzt.seite, n - 1);
      html += '<p class="ih-text gross">' + esc(it.seiten[s]) + '</p><div class="ih-nav"><button type="button" class="ih-rund" data-ih="vor" ' + (s === 0 ? 'disabled' : '') + ' aria-label="Vorherige Seite">◀</button><span>' + (s + 1) + ' / ' + n + '</span>' +
        (s < n - 1 ? '<button type="button" class="ih-rund primaer" data-ih="weiter" aria-label="Nächste Seite">▶</button>' : '<span class="ih-platz"></span>') + '</div>';
      if (s === n - 1 && it.lehre) html += '<p class="ih-lehre">' + esc(it.lehre) + '</p>';
      if (s < n - 1) { html += '</article>'; box.innerHTML = html; rein(); return; }
    } else if (r.typ === 'uebungen') {
      html += (it.kurz ? '<p class="ih-text">' + esc(it.kurz) + '</p>' : '') + '<ol class="ih-schritte">' + it.schritte.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
        (it.tipp ? '<p class="ih-tipp">💡 ' + esc(it.tipp) + '</p>' : '');
      var g = (hol().geschafft || {})[r.id + '/' + it.id] || 0;
      html += '<button type="button" class="ih-gross" data-ih="geschafft">✓ Geschafft' + (g ? ' (' + g + '×)' : '') + '</button>';
    } else {
      html += '<p class="ih-text gross">' + esc(it.x) + '</p>' + (it.tipp ? '<p class="ih-tipp">💡 ' + esc(it.tipp) + '</p>' : '');
    }
    var m = istMag(r, it);
    html += '<div class="ih-reihe"><button type="button" class="ih-mag" data-ih="mag" aria-pressed="' + m + '">' + (m ? '❤️ Mag ich' : '🤍 Mag ich') + '</button>' +
      (r.typ === 'album' ? '' : '<button type="button" class="ih-knopf primaer" data-ih="naechstes">Nächstes ▶</button>') + '</div></article>';
    box.innerHTML = html; rein();
  }
  function naechstes(r, it) {
    var v = hol(), i = r.items.indexOf(it), rest = r.items.slice(i + 1).concat(r.items.slice(0, i));
    var x = rest.filter(function (y) { return it.tag && y.tag === it.tag && !gesehen(v, r, y); })[0] || rest.filter(function (y) { return !gesehen(v, r, y); })[0] || rest[0];
    if (x) zeigItem(r, x);
  }

  /* ---------------- Quiz ---------------- */
  function quiz(r) {
    var v = hol(), offen = r.items.filter(function (q) { return !(v.richtig || {})[r.id + '/' + q.id]; }), n = quizZahl(), pool = offen.length >= n ? offen : r.items.slice();
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    jetzt = { ansicht: 'quiz', r: r, fragen: pool.slice(0, n), leicht: n === 3, nr: 0, punkte: 0, direkt: jetzt.direkt }; frage();
  }
  function frage() {
    var q = jetzt.fragen[jetzt.nr], ord = q.a.map(function (_, i) { return i; }); kopf(jetzt.r.titel);
    if (jetzt.leicht && ord.length > 2) { var falsch = ord.filter(function (i) { return i !== q.r; }); ord = [q.r, falsch[Math.floor(Math.random() * falsch.length)]]; }
    for (var i = ord.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = ord[i]; ord[i] = ord[j]; ord[j] = t; }
    box.innerHTML = '<div class="ih-quiz"><div class="ih-punkte">' + jetzt.fragen.map(function (_, i) { return '<i class="' + (i < jetzt.nr ? 'ok' : i === jetzt.nr ? 'jetzt' : '') + '"></i>'; }).join('') + '</div>' +
      '<span class="ih-blatt-e" aria-hidden="true">' + (q.e || jetzt.r.e) + '</span><h3>' + esc(q.f) + '</h3><div class="ih-antworten">' +
      ord.map(function (i) { return '<button type="button" class="ih-antwort" data-ih-antwort="' + i + '">' + esc(q.a[i]) + '</button>'; }).join('') + '</div><div class="ih-info" aria-live="polite"></div></div>';
    rein();
  }
  function antwort(i) {
    var q = jetzt.fragen[jetzt.nr], ok = i === q.r, bs = box.querySelectorAll('.ih-antwort');
    if (box.querySelector('.ih-antwort[disabled]')) return;
    bs.forEach(function (b) { var j = +b.getAttribute('data-ih-antwort'); b.disabled = true; if (j === q.r) b.classList.add('richtig'); else if (j === i) b.classList.add('falsch'); });
    if (ok) { jetzt.punkte++; var v = hol(); v.richtig = v.richtig || {}; v.richtig[jetzt.r.id + '/' + q.id] = 1; leg(v); }
    box.querySelector('.ih-info').innerHTML = '<p><b>' + (ok ? 'Richtig! ⭐' : 'Fast! Die Antwort ist: ' + esc(q.a[q.r])) + '</b>' + (q.info ? ' ' + esc(q.info) : '') + '</p><button type="button" class="ih-gross" data-ih="qweiter">' + (jetzt.nr < jetzt.fragen.length - 1 ? 'Weiter ▶' : 'Fertig ✓') + '</button>';
  }
  function quizEnde() {
    var v = hol(); v.runden = (v.runden || 0) + 1; if (jetzt.punkte === jetzt.fragen.length) v.perfekt = (v.perfekt || 0) + 1; leg(v);
    box.innerHTML = '<div class="ih-quiz ih-ende"><span class="ih-blatt-e" aria-hidden="true">' + (jetzt.punkte >= 4 ? '🏆' : '⭐') + '</span><h3>' + jetzt.punkte + ' von ' + jetzt.fragen.length + ' richtig</h3><p>' +
      (jetzt.punkte === jetzt.fragen.length ? 'Alles richtig. Wow!' : jetzt.punkte >= 3 ? 'Super gemacht!' : 'Gut probiert. Beim nächsten Mal klappt noch mehr.') + '</p>' +
      '<button type="button" class="ih-gross" data-ih="quiz">↺ Noch eine Runde</button><button type="button" class="ih-knopf" data-ih="start">Zur Übersicht</button></div>';
    rein();
  }

  /* ---------------- Klicks ---------------- */
  function klick(e) {
    var t = e.target.closest('button'); if (!t || !root.contains(t)) return;
    var a = t.getAttribute('data-ih');
    if (t.hasAttribute('data-ih-regal')) return zeigRegal(regal(t.getAttribute('data-ih-regal')));
    if (t.hasAttribute('data-ih-item')) { var p = t.getAttribute('data-ih-item').split('/'), r = regal(p[0]), it = r && item(r, p[1]); if (!it) return; if (r.typ === 'quiz') { quiz(r); if (jetzt.fragen.indexOf(it) < 0) { jetzt.fragen[0] = it; frage(); } return; } return zeigItem(r, it); }
    if (t.hasAttribute('data-ih-antwort')) return antwort(+t.getAttribute('data-ih-antwort'));
    if (a === 'zurueck') return zurueck();
    if (a === 'start') return start();
    if (a === 'sprich') { if (window.Sprich) Sprich.oeffnen(); return; }
    if (a === 'quiz') return quiz(jetzt.r);
    if (a === 'qweiter') { if (jetzt.nr < jetzt.fragen.length - 1) { jetzt.nr++; frage(); } else quizEnde(); return; }
    if (a === 'vor') return zeigItem(jetzt.r, jetzt.it, jetzt.seite - 1);
    if (a === 'weiter') return zeigItem(jetzt.r, jetzt.it, jetzt.seite + 1);
    if (a === 'naechstes') return naechstes(jetzt.r, jetzt.it);
    if (a === 'mag') { var m = magToggle(jetzt.r, jetzt.it); t.setAttribute('aria-pressed', String(m)); t.textContent = m ? '❤️ Mag ich' : '🤍 Mag ich'; return; }
    if (a === 'geschafft') { var v = hol(), k = jetzt.r.id + '/' + jetzt.it.id; v.geschafft = v.geschafft || {}; v.geschafft[k] = (v.geschafft[k] || 0) + 1; leg(v); t.textContent = '✓ Super! (' + v.geschafft[k] + '×)'; t.classList.add('ok'); if (I().beiGeschafft) try { I().beiGeschafft(jetzt.it); } catch (x) {} return; }
  }

  function markHeute() {
    var h = heute(), f = fuerDich();
    d.querySelectorAll('[data-inhalt-heute]').forEach(function (el) { el.textContent = f ? '▶ ' + titel(f.it) : h ? 'Heute: ' + titel(h.it) : el.textContent; });
  }
  d.addEventListener('click', function (e) { var b = e.target.closest('[data-inhalt]'); if (!b || (root && root.contains(b))) return; e.preventDefault(); oeffnen(b.getAttribute('data-inhalt') || ''); });
  function los() { markHeute(); if (/^#entdecken\b/.test(location.hash)) oeffnen(location.hash.split('-')[1] || ''); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', los); else los();
  window.Inhalt = { oeffnen: oeffnen, schliessen: schliessen, heute: heute, fuerDich: fuerDich, profil: profil, titel: titel };
})();
