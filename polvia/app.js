/* Polvia – persönliche Assistenz für viele Firmen, Projekte und ein Privatleben.
   Alles bleibt im Gerät (localStorage). Nova antwortet ohne Verbindung mit eigenen Vorlagen;
   mit Verbindung zum eigenen Server (Sense Engine) schreibt sie frei. Keine Schlüssel im Code.
   Die Verbindung teilt sich die Schlüssel mit den anderen DR-Lab-Apps (drlab-hermes-*). */
(function () {
  'use strict';

  /* ---------- Werkzeuge ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function vonIso(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function plus(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function heute() { return iso(new Date()); }
  function minuten(hhmm) { var p = String(hhmm || '0:0').split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  function hhmm(m) { m = Math.max(0, Math.min(24 * 60 - 1, m)); return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  var TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var TAGE_K = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  function tagLang(s) { var d = vonIso(s); return TAGE[d.getDay()] + ', ' + d.getDate() + '. ' + MONATE[d.getMonth()]; }
  function tagRel(s) {
    if (!s) return '';
    var diff = Math.round((vonIso(s) - vonIso(heute())) / 864e5);
    if (diff === 0) return 'Heute';
    if (diff === 1) return 'Morgen';
    if (diff === -1) return 'Gestern';
    if (diff > 1 && diff < 7) return TAGE[vonIso(s).getDay()];
    var d = vonIso(s); return d.getDate() + '. ' + MONATE[d.getMonth()].slice(0, 3) + '.';
  }

  /* ---------- Speicher ---------- */
  var KEY = 'polvia-v1';
  var S = null;
  function laden() { try { var t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
  function speichern() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function g(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function p(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var FARBEN = ['#3d5a8f', '#7a8b6f', '#a8823a', '#b56a74', '#4f7c8a', '#7b5ea7', '#c0703d', '#5b6170'];

  function leer(name) {
    return {
      version: 1, name: name || '', modus: 'alle',
      bereiche: [
        { id: 'b-firma', name: 'Firma', art: 'geschaeft', farbe: FARBEN[0] },
        { id: 'b-privat', name: 'Privat', art: 'privat', farbe: FARBEN[3] }
      ],
      projekte: [], aufgaben: [], termine: [], notizen: [], chat: []
    };
  }

  function beispiel(name) {
    var t = new Date(), d = function (n) { return iso(plus(t, n)); };
    var s = leer(name);
    s.bereiche = [
      { id: 'b-konzern', name: 'Konzern', art: 'geschaeft', farbe: '#3d5a8f' },
      { id: 'b-yoga', name: 'Yoga & Coaching', art: 'geschaeft', farbe: '#7a8b6f' },
      { id: 'b-drlab', name: 'DR Lab', art: 'geschaeft', farbe: '#a8823a' },
      { id: 'b-familie', name: 'Familie & Zuhause', art: 'privat', farbe: '#b56a74' },
      { id: 'b-ich', name: 'Gesundheit & Ich', art: 'privat', farbe: '#4f7c8a' }
    ];
    s.projekte = [
      { id: 'p1', bereich: 'b-konzern', name: 'Quartalsabschluss Q4', status: 'laeuft', fortschritt: 65, naechster: 'Zahlen mit Finanzen abstimmen' },
      { id: 'p2', bereich: 'b-konzern', name: 'Neue Kollektion Frühling', status: 'kritisch', fortschritt: 40, naechster: 'Freigabe Lieferanten bis Freitag' },
      { id: 'p3', bereich: 'b-konzern', name: 'Team-Offsite', status: 'wartet', fortschritt: 20, naechster: 'Angebot Hotel abwarten' },
      { id: 'p4', bereich: 'b-yoga', name: 'Seminar Körper & Kopf', status: 'laeuft', fortschritt: 50, naechster: 'Programm für Tag 2 schreiben' },
      { id: 'p5', bereich: 'b-yoga', name: 'Wochenkurse Winter', status: 'laeuft', fortschritt: 80, naechster: 'Anmeldeliste schliessen' },
      { id: 'p6', bereich: 'b-drlab', name: 'Polvia', status: 'laeuft', fortschritt: 70, naechster: 'Rückmeldungen an Diego' },
      { id: 'p7', bereich: 'b-drlab', name: 'Körperkosmos', status: 'laeuft', fortschritt: 35, naechster: 'Übungen für Seminar auswählen' },
      { id: 'p8', bereich: 'b-familie', name: 'Ferien Februar', status: 'wartet', fortschritt: 30, naechster: 'Unterkunft vergleichen' },
      { id: 'p9', bereich: 'b-ich', name: 'Rücken stärken', status: 'laeuft', fortschritt: 55, naechster: 'Rolfing-Termin buchen' }
    ];
    s.aufgaben = [
      { id: uid(), text: 'Freigabe Lieferanten unterschreiben', bereich: 'b-konzern', projekt: 'p2', faellig: d(0), prio: 1, erledigt: false },
      { id: uid(), text: 'Board-Präsentation durchsehen', bereich: 'b-konzern', projekt: 'p1', faellig: d(0), prio: 1, erledigt: false },
      { id: uid(), text: 'Budget Offsite bestätigen', bereich: 'b-konzern', projekt: 'p3', faellig: d(-1), prio: 2, erledigt: false },
      { id: uid(), text: 'Programm Seminar Tag 2 entwerfen', bereich: 'b-yoga', projekt: 'p4', faellig: d(1), prio: 2, erledigt: false, delegiert: 'Nova' },
      { id: uid(), text: 'Anmeldungen Winterkurs beantworten', bereich: 'b-yoga', projekt: 'p5', faellig: d(0), prio: 2, erledigt: false },
      { id: uid(), text: 'Rückmeldung zur App an Diego', bereich: 'b-drlab', projekt: 'p6', faellig: d(2), prio: 3, erledigt: false },
      { id: uid(), text: 'Geschenk Geburtstag Mama', bereich: 'b-familie', faellig: d(3), prio: 2, erledigt: false },
      { id: uid(), text: 'Ferienunterkünfte vergleichen', bereich: 'b-familie', projekt: 'p8', faellig: d(5), prio: 3, erledigt: false, delegiert: 'Nova' },
      { id: uid(), text: 'Rolfing-Termin buchen', bereich: 'b-ich', projekt: 'p9', faellig: d(1), prio: 3, erledigt: false },
      { id: uid(), text: 'Offerte Hotel nachfragen', bereich: 'b-konzern', projekt: 'p3', faellig: d(2), prio: 3, erledigt: false, delegiert: 'Assistenz' },
      { id: uid(), text: 'Steuerunterlagen sammeln', bereich: 'b-familie', faellig: null, prio: 3, erledigt: false },
      { id: uid(), text: 'Quartalszahlen an Finanzen', bereich: 'b-konzern', projekt: 'p1', faellig: d(-2), prio: 2, erledigt: true }
    ];
    s.termine = [
      { id: uid(), titel: 'Yoga am Morgen', bereich: 'b-ich', datum: d(0), von: '06:45', bis: '07:30', ort: 'Zuhause' },
      { id: uid(), titel: 'Board-Call Quartal', bereich: 'b-konzern', datum: d(0), von: '08:30', bis: '09:30', ort: 'Video' },
      { id: uid(), titel: 'Lieferanten-Meeting', bereich: 'b-konzern', datum: d(0), von: '11:00', bis: '12:00', ort: 'Sitzungszimmer 4' },
      { id: uid(), titel: 'Lunch mit Diego', bereich: 'b-drlab', datum: d(0), von: '12:15', bis: '13:15', ort: 'Zürich' },
      { id: uid(), titel: 'Team Weekly', bereich: 'b-konzern', datum: d(0), von: '15:00', bis: '16:00', ort: 'Büro' },
      { id: uid(), titel: 'Abendkurs Yoga', bereich: 'b-yoga', datum: d(0), von: '18:30', bis: '20:00', ort: 'Studio' },
      { id: uid(), titel: 'Strategie-Workshop', bereich: 'b-konzern', datum: d(1), von: '09:00', bis: '12:00', ort: 'Büro' },
      { id: uid(), titel: 'Rolfing', bereich: 'b-ich', datum: d(1), von: '17:00', bis: '18:00', ort: 'Nordstrasse 56' },
      { id: uid(), titel: 'Elternabend', bereich: 'b-familie', datum: d(2), von: '19:00', bis: '20:30', ort: 'Schule' },
      { id: uid(), titel: 'Flug Mailand', bereich: 'b-konzern', datum: d(3), von: '07:10', bis: '08:05', ort: 'ZRH' },
      { id: uid(), titel: 'Seminar-Planung', bereich: 'b-yoga', datum: d(4), von: '10:00', bis: '11:30', ort: 'Studio' },
      { id: uid(), titel: 'Familienessen', bereich: 'b-familie', datum: d(5), von: '18:00', bis: '21:00', ort: 'Zuhause' }
    ];
    s.notizen = [
      { id: uid(), bereich: 'b-konzern', text: 'Board will im Q4 mehr Klarheit zu Margen pro Linie.', datum: d(-1) },
      { id: uid(), bereich: 'b-yoga', text: 'Seminar-Idee: Atem vor jeder Entscheidung, 3 Minuten.', datum: d(-2) },
      { id: uid(), bereich: 'b-drlab', text: 'Polvia: Morgenbriefing gefällt, Kalender noch schneller machen.', datum: d(0) }
    ];
    return s;
  }

  /* ---------- Zustand der Oberfläche ---------- */
  var UI = { view: 'heute', bereich: null, filter: 'alle', kalTag: heute(), wochenStart: null };

  function bereich(id) { return S.bereiche.filter(function (b) { return b.id === id; })[0] || { id: id, name: '–', farbe: '#999', art: 'geschaeft' }; }
  function projekt(id) { return S.projekte.filter(function (x) { return x.id === id; })[0]; }
  function sichtbar(bid) { if (S.modus === 'alle') return true; return bereich(bid).art === S.modus; }
  function bereicheSichtbar() { return S.bereiche.filter(function (b) { return sichtbar(b.id); }); }
  function offeneAufgaben() { return S.aufgaben.filter(function (a) { return !a.erledigt && sichtbar(a.bereich); }); }
  function termineAm(tag) {
    return S.termine.filter(function (t) { return t.datum === tag && sichtbar(t.bereich); })
      .sort(function (a, b) { return minuten(a.von) - minuten(b.von); });
  }
  function konflikte(liste) {
    var k = {};
    for (var i = 0; i < liste.length; i++) for (var j = i + 1; j < liste.length; j++) {
      if (minuten(liste[j].von) < minuten(liste[i].bis)) { k[liste[i].id] = 1; k[liste[j].id] = 1; }
    }
    return k;
  }
  function freieFenster(liste, abMin) {
    var frei = [], start = Math.max(8 * 60, abMin || 0), ende = 18 * 60;
    liste.forEach(function (t) {
      var v = minuten(t.von), b = minuten(t.bis);
      if (v - start >= 45 && v <= ende) frei.push([start, Math.min(v, ende)]);
      start = Math.max(start, b);
    });
    if (ende - start >= 45) frei.push([start, ende]);
    return frei;
  }
  function gruss() {
    var h = new Date().getHours();
    var w = h < 5 ? 'Gute Nacht' : h < 11 ? 'Guten Morgen' : h < 17 ? 'Guten Tag' : 'Guten Abend';
    return S.name ? w + ', ' + S.name : w;
  }

  /* ---------- Rendering ---------- */
  var ICON_CHECK = '<svg viewBox="0 0 24 24"><path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.1 8.4 18.7 7z"/></svg>';

  function aufgabeZeile(a, ohneBereich) {
    var b = bereich(a.bereich), pr = a.projekt ? projekt(a.projekt) : null;
    var ueber = a.faellig && a.faellig < heute() && !a.erledigt;
    var meta = [];
    if (!ohneBereich) meta.push('<span class="bereich-tag"><i class="punkt" style="background:' + b.farbe + '"></i>' + esc(b.name) + '</span>');
    if (pr) meta.push('<span>' + esc(pr.name) + '</span>');
    if (a.faellig) meta.push('<span class="faellig' + (ueber ? ' ueber' : '') + '">' + (ueber ? 'Überfällig · ' : '') + tagRel(a.faellig) + '</span>');
    if (a.delegiert) meta.push('<span>→ ' + esc(a.delegiert) + '</span>');
    return '<li class="zeile' + (a.erledigt ? ' erledigt' : '') + '" data-a="' + a.id + '">' +
      '<button class="check' + (a.erledigt ? ' an' : '') + '" data-check="' + a.id + '" aria-label="Erledigt">' + ICON_CHECK + '</button>' +
      '<div class="haupt tap" data-edit-a="' + a.id + '"><div class="titel">' + (a.prio === 1 && !a.erledigt ? '<span class="prio">! </span>' : '') + esc(a.text) + '</div>' +
      (meta.length ? '<div class="meta">' + meta.join('') + '</div>' : '') + '</div></li>';
  }

  function terminZeilen(liste, mitFrei, tag) {
    if (!liste.length) return '<p class="leer">Keine Termine. Ein freier Tag für das Wesentliche.</p>';
    var jetzt = new Date(), jm = jetzt.getHours() * 60 + jetzt.getMinutes(), istHeute = tag === heute();
    var k = konflikte(liste), html = '', frei = mitFrei ? freieFenster(liste) : [];
    var fi = 0;
    liste.forEach(function (t) {
      while (fi < frei.length && frei[fi][1] <= minuten(t.von)) {
        if (!istHeute || frei[fi][1] > jm) html += '<div class="frei"><div>' + hhmm(frei[fi][0]) + '</div><div class="inhalt">Frei bis ' + hhmm(frei[fi][1]) + ' · Fokuszeit</div></div>';
        fi++;
      }
      var b = bereich(t.bereich), vorbei = istHeute && minuten(t.bis) <= jm, jetztDa = istHeute && minuten(t.von) <= jm && minuten(t.bis) > jm;
      html += '<div class="termin' + (vorbei ? ' vorbei' : '') + (jetztDa ? ' jetzt' : '') + '" data-t="' + t.id + '" style="--c:' + b.farbe + '">' +
        '<div class="zeit">' + esc(t.von) + '<small>' + esc(t.bis) + '</small></div>' +
        '<div class="inhalt"><div class="titel">' + esc(t.titel) + '</div><div class="meta" style="font-size:13px;color:var(--ink3)">' +
        esc(b.name) + (t.ort ? ' · ' + esc(t.ort) : '') + (jetztDa ? ' · <b style="color:var(--gold)">läuft</b>' : '') +
        (k[t.id] ? ' · <span class="konflikt">Überschneidung</span>' : '') + '</div></div></div>';
    });
    while (fi < frei.length) {
      if (!istHeute || frei[fi][1] > jm) html += '<div class="frei"><div>' + hhmm(frei[fi][0]) + '</div><div class="inhalt">Frei bis ' + hhmm(frei[fi][1]) + ' · Fokuszeit</div></div>';
      fi++;
    }
    return '<div class="zeitleiste">' + html + '</div>';
  }

  function briefingText() {
    var t = heute(), termine = termineAm(t), offen = offeneAufgaben();
    var faellig = offen.filter(function (a) { return a.faellig && a.faellig <= t; });
    var ueber = offen.filter(function (a) { return a.faellig && a.faellig < t; });
    var jm = new Date().getHours() * 60 + new Date().getMinutes();
    var naechster = termine.filter(function (x) { return minuten(x.von) > jm; })[0];
    var k = Object.keys(konflikte(termine)).length;
    var frei = freieFenster(termine, jm)[0];
    var s = [];
    if (!termine.length && !faellig.length) return 'Heute ist nichts Festes geplant. Ein guter Tag, um vorauszudenken.';
    s.push(termine.length ? 'Heute ' + (termine.length === 1 ? 'ein Termin' : termine.length + ' Termine') + (naechster ? ', als Nächstes ' + naechster.titel + ' um ' + naechster.von + '.' : ', alle schon vorbei.') : 'Heute keine Termine.');
    if (faellig.length) s.push(faellig.length + (faellig.length === 1 ? ' Aufgabe ist' : ' Aufgaben sind') + ' fällig' + (ueber.length ? ', davon ' + ueber.length + ' überfällig.' : '.'));
    var wichtig = faellig.filter(function (a) { return a.prio === 1; })[0];
    if (wichtig) s.push('Zuerst: ' + wichtig.text + '.');
    if (k) s.push('Achtung, zwei Termine überschneiden sich.');
    if (frei) s.push('Freies Fenster ' + hhmm(frei[0]) + ' bis ' + hhmm(frei[1]) + '.');
    return s.join(' ');
  }

  function renderHeute() {
    var t = heute(), offen = offeneAufgaben(), termine = termineAm(t);
    var fokus = offen.filter(function (a) { return a.faellig && a.faellig <= t; })
      .sort(function (a, b) { return (a.prio - b.prio) || String(a.faellig).localeCompare(String(b.faellig)); }).slice(0, 5);
    var wartet = offen.filter(function (a) { return a.delegiert; });
    var ueber = offen.filter(function (a) { return a.faellig && a.faellig < t; }).length;
    var html =
      '<div class="briefing"><div class="wer"><span class="orb"></span>Nova · Briefing</div>' +
      '<p class="text" id="briefingText">' + esc(briefingText()) + '</p>' +
      '<div class="kennzahlen"><div class="kennzahl"><b>' + termine.length + '</b><span>Termine</span></div>' +
      '<div class="kennzahl"><b>' + fokus.length + '</b><span>Fällig</span></div>' +
      '<div class="kennzahl' + (ueber ? ' warn' : '') + '"><b>' + ueber + '</b><span>Überfällig</span></div>' +
      '<div class="kennzahl"><b>' + wartet.length + '</b><span>Delegiert</span></div></div>' +
      '<div class="knopfzeile"><button class="pille dunkel" data-act="vorlesen">▶ Vorlesen</button>' +
      '<button class="pille" data-act="woche">Woche planen</button></div></div>' +
      '<div class="abschnitt"><div class="abschnitt-kopf"><h2>Fokus heute</h2><button class="link" data-act="neueAufgabe">+ Aufgabe</button></div>' +
      (fokus.length ? '<ul class="liste">' + fokus.map(function (a) { return aufgabeZeile(a); }).join('') + '</ul>' : '<p class="leer">Alles Fällige ist erledigt.</p>') + '</div>' +
      '<div class="abschnitt"><div class="abschnitt-kopf"><h2>Tagesablauf</h2><button class="link" data-act="neuerTermin">+ Termin</button></div>' + terminZeilen(termine, true, t) + '</div>';
    if (wartet.length) html += '<div class="abschnitt"><div class="abschnitt-kopf"><h2>Wartet auf andere</h2></div><ul class="liste">' + wartet.map(function (a) { return aufgabeZeile(a); }).join('') + '</ul></div>';
    $('#v-heute').innerHTML = html;
  }

  function fortschrittBereich(bid) {
    var ps = S.projekte.filter(function (x) { return x.bereich === bid; });
    if (!ps.length) return 0;
    return Math.round(ps.reduce(function (s, x) { return s + (+x.fortschritt || 0); }, 0) / ps.length);
  }
  var STATUS = { laeuft: 'Läuft', wartet: 'Wartet', kritisch: 'Kritisch', erledigt: 'Erledigt' };

  function renderBereiche() {
    var v = $('#v-bereiche');
    if (UI.bereich) {
      var b = bereich(UI.bereich);
      var ps = S.projekte.filter(function (x) { return x.bereich === b.id; });
      var as = S.aufgaben.filter(function (a) { return a.bereich === b.id && !a.erledigt; });
      var ns = S.notizen.filter(function (n) { return n.bereich === b.id; }).sort(function (x, y) { return String(y.datum).localeCompare(String(x.datum)); });
      var ts = S.termine.filter(function (t) { return t.bereich === b.id && t.datum >= heute(); }).sort(function (x, y) { return (x.datum + x.von).localeCompare(y.datum + y.von); }).slice(0, 4);
      v.innerHTML = '<button class="zurueck" data-act="bereicheZurueck">‹ Alle Bereiche</button>' +
        '<div class="bereich-kopf"><span class="punkt" style="width:14px;height:14px;background:' + b.farbe + '"></span><h3>' + esc(b.name) + '</h3></div>' +
        '<div class="knopfzeile"><button class="pille" data-act="bereichBearbeiten">Bearbeiten</button><button class="pille" data-act="bereichNova">Nova: Lage zusammenfassen</button></div>' +
        '<div class="abschnitt"><div class="abschnitt-kopf"><h2>Projekte</h2><button class="link" data-act="neuesProjekt">+ Projekt</button></div>' +
        (ps.length ? ps.map(function (x) {
          return '<div class="projekt" data-p="' + x.id + '" style="--c:' + b.farbe + '"><div class="oben"><span class="name">' + esc(x.name) + '</span><span class="status ' + x.status + '">' + STATUS[x.status] + ' · ' + (x.fortschritt || 0) + '%</span></div>' +
            '<div class="balken"><i style="width:' + (x.fortschritt || 0) + '%"></i></div>' + (x.naechster ? '<div class="naechst">Nächster Schritt: ' + esc(x.naechster) + '</div>' : '') + '</div>';
        }).join('') : '<p class="leer">Noch keine Projekte.</p>') + '</div>' +
        '<div class="abschnitt"><div class="abschnitt-kopf"><h2>Offene Aufgaben</h2><button class="link" data-act="neueAufgabe">+ Aufgabe</button></div>' +
        (as.length ? '<ul class="liste">' + as.map(function (a) { return aufgabeZeile(a, true); }).join('') + '</ul>' : '<p class="leer">Nichts offen.</p>') + '</div>' +
        '<div class="abschnitt"><div class="abschnitt-kopf"><h2>Nächste Termine</h2></div>' +
        (ts.length ? ts.map(function (t) {
          return '<div class="termin" data-t="' + t.id + '" style="--c:' + b.farbe + '"><div class="zeit">' + tagRel(t.datum) + '<small>' + t.von + '</small></div><div class="inhalt"><div class="titel">' + esc(t.titel) + '</div></div></div>';
        }).join('') : '<p class="leer">Keine geplant.</p>') + '</div>' +
        '<div class="abschnitt"><div class="abschnitt-kopf"><h2>Notizen</h2><button class="link" data-act="neueNotiz">+ Notiz</button></div>' +
        (ns.length ? '<ul class="liste">' + ns.map(function (n) {
          return '<li class="zeile tap" data-n="' + n.id + '"><div class="haupt"><div class="titel">' + esc(n.text) + '</div><div class="meta">' + tagRel(n.datum) + '</div></div></li>';
        }).join('') + '</ul>' : '<p class="leer">Noch keine Notizen.</p>') + '</div>';
      return;
    }
    var bs = bereicheSichtbar();
    var html = '';
    ['geschaeft', 'privat'].forEach(function (art) {
      var liste = bs.filter(function (b) { return b.art === art; });
      if (!liste.length) return;
      html += '<div class="abschnitt"><div class="abschnitt-kopf"><h2>' + (art === 'geschaeft' ? 'Geschäft' : 'Privat') + '</h2></div>' +
        liste.map(function (b) {
          var ps = S.projekte.filter(function (x) { return x.bereich === b.id && x.status !== 'erledigt'; });
          var offen = S.aufgaben.filter(function (a) { return a.bereich === b.id && !a.erledigt; }).length;
          var krit = ps.filter(function (x) { return x.status === 'kritisch'; }).length;
          return '<div class="bereich-zeile" data-b="' + b.id + '"><div class="ring" style="--c:' + b.farbe + ';--p:' + fortschrittBereich(b.id) + '"></div>' +
            '<div class="haupt"><div class="name">' + esc(b.name) + '</div><div class="unter">' + ps.length + (ps.length === 1 ? ' Projekt · ' : ' Projekte · ') + offen + ' offen' +
            (krit ? ' · <span style="color:var(--rot)">' + krit + ' kritisch</span>' : '') + '</div></div><span class="pfeil">›</span></div>';
        }).join('') + '</div>';
    });
    html += '<div class="abschnitt"><button class="btn" data-act="neuerBereich">+ Firma oder Bereich hinzufügen</button></div>';
    v.innerHTML = '<h3 style="margin-top:8px">Firmen & Bereiche</h3><p class="leer" style="padding:4px 0 0">Alles, was du führst, auf einen Blick.</p>' + html;
  }

  function renderAufgaben() {
    var t = heute(), wEnde = iso(plus(new Date(), 7));
    var alle = S.aufgaben.filter(function (a) { return sichtbar(a.bereich) && (UI.filter === 'alle' || (UI.filter === 'delegiert' ? !!a.delegiert : a.bereich === UI.filter)); });
    var offen = alle.filter(function (a) { return !a.erledigt; }).sort(function (a, b) { return (a.prio - b.prio); });
    var gruppen = [
      ['Überfällig', offen.filter(function (a) { return a.faellig && a.faellig < t; })],
      ['Heute', offen.filter(function (a) { return a.faellig === t; })],
      ['Nächste 7 Tage', offen.filter(function (a) { return a.faellig > t && a.faellig <= wEnde; }).sort(function (a, b) { return a.faellig.localeCompare(b.faellig); })],
      ['Später', offen.filter(function (a) { return a.faellig > wEnde; })],
      ['Irgendwann', offen.filter(function (a) { return !a.faellig; })]
    ];
    var erledigt = alle.filter(function (a) { return a.erledigt; });
    var chips = '<div class="chips"><button class="chip' + (UI.filter === 'alle' ? ' an' : '') + '" data-filter="alle">Alle</button>' +
      '<button class="chip' + (UI.filter === 'delegiert' ? ' an' : '') + '" data-filter="delegiert">Delegiert</button>' +
      bereicheSichtbar().map(function (b) { return '<button class="chip' + (UI.filter === b.id ? ' an' : '') + '" data-filter="' + b.id + '"><i class="punkt" style="background:' + b.farbe + '"></i>' + esc(b.name) + '</button>'; }).join('') + '</div>';
    var html = '<div class="abschnitt-kopf" style="margin-top:8px"><h3>Aufgaben</h3><button class="link" data-act="neueAufgabe">+ Neu</button></div>' + chips;
    var irgendwas = false;
    gruppen.forEach(function (gr) {
      if (!gr[1].length) return; irgendwas = true;
      html += '<div class="abschnitt"><h2>' + gr[0] + ' · ' + gr[1].length + '</h2><ul class="liste">' + gr[1].map(function (a) { return aufgabeZeile(a); }).join('') + '</ul></div>';
    });
    if (!irgendwas) html += '<p class="leer" style="margin-top:20px">Keine offenen Aufgaben. Schreib unten einfach, was zu tun ist.</p>';
    if (erledigt.length) html += '<div class="abschnitt"><details><summary style="cursor:pointer"><h2 style="display:inline">Erledigt · ' + erledigt.length + '</h2></summary><ul class="liste">' +
      erledigt.slice(-20).reverse().map(function (a) { return aufgabeZeile(a); }).join('') + '</ul><button class="link" data-act="aufraeumen">Erledigte löschen</button></details></div>';
    $('#v-aufgaben').innerHTML = html;
  }

  function wochenStart(tag) { var d = vonIso(tag); var w = (d.getDay() + 6) % 7; return iso(plus(d, -w)); }
  function renderKalender() {
    if (!UI.wochenStart) UI.wochenStart = wochenStart(UI.kalTag);
    var start = vonIso(UI.wochenStart), tage = [];
    for (var i = 0; i < 7; i++) tage.push(iso(plus(start, i)));
    var ende = vonIso(tage[6]);
    var titel = start.getDate() + '. ' + (start.getMonth() !== ende.getMonth() ? MONATE[start.getMonth()].slice(0, 3) + '. ' : '') + '– ' + ende.getDate() + '. ' + MONATE[ende.getMonth()];
    var html = '<div class="abschnitt-kopf" style="margin-top:8px"><h3>Kalender</h3><button class="link" data-act="neuerTermin">+ Termin</button></div>' +
      '<div class="wochennav"><button data-act="wocheZurueck" aria-label="Woche zurück">‹</button><span>' + titel + '</span><button data-act="wocheVor" aria-label="Woche vor">›</button></div>' +
      '<div class="woche">' + tage.map(function (tg) {
        var d = vonIso(tg), ts = termineAm(tg);
        return '<button class="tag' + (tg === heute() ? ' heute' : '') + (tg === UI.kalTag ? ' an' : '') + '" data-tag="' + tg + '"><small>' + TAGE_K[d.getDay()] + '</small><b>' + d.getDate() + '</b><span class="dots">' +
          ts.slice(0, 4).map(function (t) { return '<i style="--c:' + bereich(t.bereich).farbe + '"></i>'; }).join('') + '</span></button>';
      }).join('') + '</div>' +
      '<div class="abschnitt"><div class="abschnitt-kopf"><h2>' + tagLang(UI.kalTag) + '</h2>' + (UI.kalTag !== heute() ? '<button class="link" data-act="kalHeute">Heute</button>' : '') + '</div>' +
      terminZeilen(termineAm(UI.kalTag), true, UI.kalTag) + '</div>';
    var faellig = offeneAufgaben().filter(function (a) { return a.faellig === UI.kalTag; });
    if (faellig.length) html += '<div class="abschnitt"><h2>Fällig an diesem Tag</h2><ul class="liste">' + faellig.map(function (a) { return aufgabeZeile(a); }).join('') + '</ul></div>';
    $('#v-kalender').innerHTML = html;
  }

  /* ---------- Nova ---------- */
  var VK = { addr: 'drlab-hermes-adresse', key: 'drlab-hermes-passwort' };
  function addr() { return String(g(VK.addr, '') || '').trim().replace(/\/+$/, ''); }
  function verbunden() { return /^https:\/\//.test(addr()) && !!g(VK.key, ''); }
  function codeNehmen(t) {
    var m = String(t || '').match(/NOVA:([A-Za-z0-9+\/=_-]+)/);
    if (!m) return false;
    try {
      var teile = decodeURIComponent(escape(atob(m[1].replace(/-/g, '+').replace(/_/g, '/')))).split('\n');
      if (!/^https:\/\//.test(teile[0]) || !teile[1]) return false;
      p(VK.addr, teile[0].replace(/\/+$/, '')); p(VK.key, teile[1].trim());
      return true;
    } catch (e) { return false; }
  }
  (function () {
    var c = (location.hash.match(/nova=([^&]+)/) || [])[1];
    if (c && codeNehmen('NOVA:' + decodeURIComponent(c))) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  })();

  var AKTIONEN = [
    ['tag', 'Tag zusammenfassen'], ['woche', 'Woche planen'], ['meeting', 'Meeting vorbereiten'],
    ['mail', 'Mail entwerfen'], ['reise', 'Reise planen'], ['entscheid', 'Entscheid abwägen'], ['delegieren', 'Was kann ich abgeben?']
  ];

  function renderNova() {
    var v = $('#v-nova');
    var w = verbunden();
    v.innerHTML = '<div class="nova-kopf"><span class="orb gross"></span><div><h3>Nova</h3><div class="s' + (w ? ' wach' : '') + '"><i></i>' +
      (w ? 'Verbunden mit deinem Server' : 'Im Gerät · Vorlagen ohne Internet') + '</div></div></div>' +
      '<div class="aktionen">' + AKTIONEN.map(function (a) { return '<button class="pille" data-nova="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</div>' +
      '<div class="verlauf" id="verlauf"></div>' +
      '<div class="einst"><h2>Einstellungen</h2><ul class="liste">' +
      '<li class="zeile tap" data-act="nameAendern"><div class="haupt"><div class="titel">Name</div></div><span class="wert">' + esc(S.name || '–') + '</span></li>' +
      '<li class="zeile tap" data-act="verbinden"><div class="haupt"><div class="titel">Nova mit eigenem Server verbinden</div><div class="meta">Schweizer Server, verschlüsselt. Ohne Verbindung bleibt alles im Gerät.</div></div><span class="wert">' + (w ? 'An' : 'Aus') + '</span></li>' +
      '<li class="zeile tap" data-act="export"><div class="haupt"><div class="titel">Sicherung herunterladen</div><div class="meta">Alle Daten als Datei, zum Aufbewahren oder Umziehen.</div></div></li>' +
      '<li class="zeile tap" data-act="import"><div class="haupt"><div class="titel">Sicherung einlesen</div></div></li>' +
      '<li class="zeile tap" data-act="beispiel"><div class="haupt"><div class="titel">Beispieldaten laden</div></div></li>' +
      '<li class="zeile tap" data-act="loeschen"><div class="haupt"><div class="titel" style="color:var(--rot)">Alle Daten löschen</div></div></li>' +
      '<li class="zeile tap" data-act="datenschutz"><div class="haupt"><div class="titel">Datenschutz</div></div><span class="pfeil">›</span></li>' +
      '</ul><p class="leer" style="font-size:12px">Polvia · DR Lab · Version 1.0</p></div>';
    zeigeVerlauf();
  }

  function zeigeVerlauf() {
    var box = $('#verlauf'); if (!box) return;
    if (!S.chat.length) {
      box.innerHTML = '<div class="msg nova">Ich bin Nova, deine Assistentin. Sag mir, was ansteht, oder tipp oben auf einen Knopf. Ich ordne, bereite vor und erinnere. Entscheiden und senden tust du.</div>';
      return;
    }
    box.innerHTML = S.chat.slice(-30).map(function (m, i, arr) {
      var knopf = m.rolle === 'nova' && m.kopierbar ? '<div class="msg-knopf"><button data-kopie="' + (S.chat.length - arr.length + i) + '">Kopieren</button><button data-vorlesen="' + (S.chat.length - arr.length + i) + '">Vorlesen</button></div>' : '';
      return '<div class="msg ' + (m.rolle === 'ich' ? 'ich' : 'nova') + '">' + esc(m.text) + knopf + '</div>';
    }).join('');
  }

  function sag(rolle, text, kopierbar) {
    S.chat.push({ rolle: rolle, text: text, kopierbar: !!kopierbar, zeit: Date.now() });
    if (S.chat.length > 120) S.chat = S.chat.slice(-120);
    speichern();
    if (UI.view === 'nova') { zeigeVerlauf(); setTimeout(function () { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 30); }
  }

  // Lokale Vorlagen: funktionieren ohne Internet und ohne Server.
  var LOKAL = {
    tag: function () {
      var t = heute(), ts = termineAm(t), offen = offeneAufgaben();
      var f = offen.filter(function (a) { return a.faellig && a.faellig <= t; });
      var out = 'Dein Tag, ' + tagLang(t) + '\n\n' + briefingText() + '\n';
      if (ts.length) out += '\nTermine\n' + ts.map(function (x) { return '• ' + x.von + ' ' + x.titel + ' (' + bereich(x.bereich).name + ')'; }).join('\n') + '\n';
      if (f.length) out += '\nZu erledigen\n' + f.map(function (a) { return '• ' + (a.prio === 1 ? '! ' : '') + a.text; }).join('\n') + '\n';
      var fr = freieFenster(ts, new Date().getHours() * 60 + new Date().getMinutes());
      if (fr.length) out += '\nVorschlag: Leg die wichtigste Aufgabe ins Fenster ' + hhmm(fr[0][0]) + '–' + hhmm(fr[0][1]) + '.';
      return out;
    },
    woche: function () {
      var out = 'Deine Woche\n', last = { tag: '', n: -1 }, d0 = new Date();
      for (var i = 0; i < 7; i++) {
        var tg = iso(plus(d0, i)), ts = termineAm(tg);
        var f = offeneAufgaben().filter(function (a) { return a.faellig === tg; });
        var stunden = ts.reduce(function (s, x) { return s + (minuten(x.bis) - minuten(x.von)); }, 0) / 60;
        if (stunden > last.n) last = { tag: tg, n: stunden };
        out += '\n' + tagRel(tg) + ': ' + ts.length + ' Termine (' + stunden.toFixed(1).replace('.0', '') + ' h), ' + f.length + ' fällig';
      }
      var ohne = offeneAufgaben().filter(function (a) { return !a.faellig; });
      out += '\n\nDichtester Tag: ' + tagRel(last.tag) + '. Dort nichts Neues annehmen.';
      if (ohne.length) out += '\nOhne Datum: ' + ohne.length + ' Aufgaben. Ich schlage vor, sie auf ruhigere Tage zu legen.';
      var krit = S.projekte.filter(function (x) { return x.status === 'kritisch' && sichtbar(x.bereich); });
      if (krit.length) out += '\nKritisch: ' + krit.map(function (x) { return x.name; }).join(', ') + '.';
      return out;
    },
    meeting: function (arg) {
      var t = arg && S.termine.filter(function (x) { return x.id === arg; })[0];
      if (!t) {
        var jm = new Date().getHours() * 60 + new Date().getMinutes();
        t = termineAm(heute()).filter(function (x) { return minuten(x.von) > jm; })[0] || S.termine.filter(function (x) { return x.datum > heute(); }).sort(function (a, b) { return (a.datum + a.von).localeCompare(b.datum + b.von); })[0];
      }
      if (!t) return 'Kein kommendes Meeting gefunden.';
      var b = bereich(t.bereich);
      var offen = S.aufgaben.filter(function (a) { return a.bereich === t.bereich && !a.erledigt; }).slice(0, 4);
      var ps = S.projekte.filter(function (x) { return x.bereich === t.bereich && x.status !== 'erledigt'; }).slice(0, 3);
      return 'Vorbereitung: ' + t.titel + '\n' + tagRel(t.datum) + ', ' + t.von + '–' + t.bis + (t.ort ? ', ' + t.ort : '') + ' · ' + b.name +
        '\n\nZiel des Termins\n• Was soll am Ende entschieden oder geklärt sein?\n\nStand der Projekte\n' +
        (ps.length ? ps.map(function (x) { return '• ' + x.name + ': ' + STATUS[x.status] + ', ' + x.fortschritt + '%' + (x.naechster ? '. Nächster Schritt: ' + x.naechster : ''); }).join('\n') : '• Keine Projekte erfasst') +
        '\n\nOffene Punkte aus diesem Bereich\n' + (offen.length ? offen.map(function (a) { return '• ' + a.text; }).join('\n') : '• Keine') +
        '\n\nDrei Fragen, die du stellen kannst\n• Was hindert uns gerade am meisten?\n• Was brauchst du von mir?\n• Woran merken wir in zwei Wochen, dass es klappt?' +
        (t.notiz ? '\n\nNotiz\n' + t.notiz : '');
    },
    mail: function (arg) {
      var thema = (arg || '').trim() || '[Thema]';
      return 'Betreff: ' + thema.charAt(0).toUpperCase() + thema.slice(1) + '\n\nGuten Tag\n\nDanke für Ihre Nachricht. Kurz zum Stand bei «' + thema + '»:\n\n' +
        '1. [Was ist entschieden]\n2. [Was brauche ich von Ihnen, bis wann]\n3. [Nächster Schritt]\n\nWenn das so passt, brauche ich nur ein kurzes Ok.\n\nFreundliche Grüsse\n' + (S.name || '') +
        '\n\n(Entwurf. Du prüfst und sendest selbst.)';
    },
    reise: function (arg) {
      var ziel = (arg || '').trim() || 'die Reise';
      var flug = S.termine.filter(function (x) { return /flug|reise|zug/i.test(x.titel) && x.datum >= heute(); })[0];
      return 'Reiseplan ' + ziel + (flug ? '\nGefunden im Kalender: ' + flug.titel + ', ' + tagRel(flug.datum) + ' ' + flug.von : '') +
        '\n\nVorher\n• Termine vor Ort bestätigen\n• Unterlagen für Meetings aufs Gerät laden\n• Abwesenheit im Kalender eintragen\n• Wer vertritt dich für Dringendes?\n\n' +
        'Packliste kurz\n• Pass/ID, Ladegerät, Adapter\n• Kleidung für Termine und für dich\n• Yogamatte oder Reiseband\n\nVor Ort\n• 20 Minuten nur für dich einplanen\n\nBuchen tust du selbst; ich vergleiche gern Varianten, wenn Nova verbunden ist.';
    },
    entscheid: function (arg) {
      var frage = (arg || '').trim() || '[Entscheid]';
      return 'Entscheid: ' + frage + '\n\n1. Was genau steht zur Wahl? (zwei bis drei Optionen)\n2. Was kostet jede Option: Geld, Zeit, Energie?\n3. Was gewinnt jede Option in einem Jahr?\n' +
        '4. Was ist umkehrbar, was nicht?\n5. Wen betrifft es, wer muss es mittragen?\n\nFaustregel: Umkehrbares schnell entscheiden, Unumkehrbares eine Nacht liegen lassen.\nKörpercheck: drei ruhige Atemzüge, dann jede Option laut aussprechen. Wo wird es weit, wo eng?';
    },
    delegieren: function () {
      var offen = offeneAufgaben().filter(function (a) { return !a.delegiert; });
      var kandidaten = offen.filter(function (a) { return /vergleich|recherch|nachfrag|sammeln|buchen|reserv|organis|offerte|anmeld|beantwort/i.test(a.text) || a.prio === 3; }).slice(0, 6);
      if (!kandidaten.length) return 'Ich sehe gerade nichts, was du gut abgeben kannst. Alles Offene braucht dich selbst.';
      return 'Das kannst du abgeben\n\n' + kandidaten.map(function (a) { return '• ' + a.text + ' (' + bereich(a.bereich).name + ')'; }).join('\n') +
        '\n\nTipp: Aufgabe öffnen und bei «Delegiert an» Nova oder eine Person eintragen. Sie erscheint dann unter «Wartet auf andere».';
    },
    bereich: function (bid) {
      var b = bereich(bid), ps = S.projekte.filter(function (x) { return x.bereich === bid; });
      var offen = S.aufgaben.filter(function (a) { return a.bereich === bid && !a.erledigt; });
      var ueber = offen.filter(function (a) { return a.faellig && a.faellig < heute(); });
      return 'Lage ' + b.name + '\n\n' + ps.length + ' Projekte, ' + offen.length + ' offene Aufgaben' + (ueber.length ? ', ' + ueber.length + ' überfällig' : '') + '.\n\n' +
        ps.map(function (x) { return '• ' + x.name + ': ' + STATUS[x.status] + ', ' + x.fortschritt + '%' + (x.naechster ? '. Weiter: ' + x.naechster : ''); }).join('\n') +
        (ps.some(function (x) { return x.status === 'kritisch'; }) ? '\n\nZuerst das Kritische klären, bevor Neues startet.' : '');
    }
  };

  function kontext() {
    var t = heute();
    return {
      heute: tagLang(t), name: S.name || '', ansicht: S.modus,
      bereiche: S.bereiche.map(function (b) { return b.name + ' (' + (b.art === 'privat' ? 'privat' : 'geschäftlich') + ')'; }),
      projekte: S.projekte.filter(function (x) { return x.status !== 'erledigt'; }).slice(0, 20).map(function (x) { return x.name + ' [' + bereich(x.bereich).name + ', ' + STATUS[x.status] + ', ' + x.fortschritt + '%' + (x.naechster ? ', weiter: ' + x.naechster : '') + ']'; }),
      termine: S.termine.filter(function (x) { return x.datum >= t && x.datum <= iso(plus(new Date(), 7)); }).sort(function (a, b) { return (a.datum + a.von).localeCompare(b.datum + b.von); }).slice(0, 25)
        .map(function (x) { return tagRel(x.datum) + ' ' + x.von + '–' + x.bis + ' ' + x.titel + ' [' + bereich(x.bereich).name + ']'; }),
      aufgaben: offeneAufgaben().slice(0, 30).map(function (a) { return (a.prio === 1 ? '! ' : '') + a.text + ' [' + bereich(a.bereich).name + (a.faellig ? ', ' + tagRel(a.faellig) : '') + (a.delegiert ? ', delegiert an ' + a.delegiert : '') + ']'; })
    };
  }
  var SEELE = 'Du bist Nova, die persönliche Assistentin in der App Polvia von DR Lab. Deine Person führt mehrere Firmen, Projekte und ein Privatleben. ' +
    'Du ordnest, bereitest vor, formulierst Entwürfe und erinnerst. Ruhig, klar, auf Augenhöhe, kurz. Hochdeutsch mit «ss», nie «ß». ' +
    'Du sendest, buchst, kaufst und unterschreibst nichts: Entwürfe ja, Entscheid und Versand bleiben bei ihr. Keine Rechts-, Steuer- oder Medizinberatung. ' +
    'Nutze die Daten aus dem Kontext; erfinde keine Termine oder Zahlen. Wenn etwas fehlt, eine kurze Rückfrage. Keine Markdown-Sternchen, Listen mit «•».';

  function fragServer(text) {
    var verlauf = S.chat.slice(-10).map(function (m) { return { role: m.rolle === 'ich' ? 'user' : 'assistant', content: m.text }; });
    var messages = [{ role: 'system', content: SEELE + '\n\nKontext (aus der App, nur für dich):\n' + JSON.stringify(kontext()) }].concat(verlauf);
    if (!verlauf.length || verlauf[verlauf.length - 1].content !== text) messages.push({ role: 'user', content: text });
    return fetch(addr() + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + g(VK.key, ''), 'X-Nova-App': 'Polvia' },
      body: JSON.stringify({ model: 'sense-engine', messages: messages })
    }).then(function (r) {
      if (r.status === 401) throw new Error('Das Passwort stimmt nicht.');
      if (!r.ok) throw new Error('Server meldet Fehler ' + r.status + '.');
      return r.json();
    }).then(function (j) { return (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '…'; });
  }

  function novaAktion(art, arg, frage) {
    if (UI.view !== 'nova') zeige('nova');
    var label = (AKTIONEN.filter(function (a) { return a[0] === art; })[0] || [0, ''])[1];
    if (art === 'mail' && arg === undefined) { eingabeBlatt('Mail entwerfen', 'Worum geht es? An wen?', function (v) { novaAktion('mail', v, 'Mail entwerfen: ' + v); }); return; }
    if (art === 'reise' && arg === undefined) { eingabeBlatt('Reise planen', 'Wohin und wann?', function (v) { novaAktion('reise', v, 'Reise planen: ' + v); }); return; }
    if (art === 'entscheid' && arg === undefined) { eingabeBlatt('Entscheid abwägen', 'Was ist zu entscheiden?', function (v) { novaAktion('entscheid', v, 'Entscheid abwägen: ' + v); }); return; }
    var q = frage || label;
    sag('ich', q);
    var lokal = LOKAL[art] ? LOKAL[art](arg) : '';
    if (!verbunden()) { setTimeout(function () { sag('nova', lokal, true); }, 350); return; }
    denkt(true);
    fragServer(q + (lokal ? '\n\nHier mein Rohentwurf aus der App, bitte verbessern und konkret machen:\n' + lokal : '')).then(function (a) {
      denkt(false); sag('nova', a, true);
    }, function (e) { denkt(false); sag('nova', lokal + '\n\n(' + e.message + ' Darum die Vorlage aus dem Gerät.)', true); });
  }
  function denkt(an) {
    var box = $('#verlauf'); if (!box) return;
    var d = $('.msg.denkt', box);
    if (an && !d) { d = document.createElement('div'); d.className = 'msg nova denkt'; d.textContent = 'Nova denkt'; box.appendChild(d); }
    if (!an && d) d.remove();
  }

  function novaFrei(text) {
    sag('ich', text);
    if (verbunden()) {
      denkt(true);
      fragServer(text).then(function (a) { denkt(false); sag('nova', a, true); }, function (e) { denkt(false); sag('nova', e.message + ' Ich habe es als Notiz behalten.'); notizAus(text); });
      return;
    }
    var l = text.toLowerCase();
    var art = /zusammenfass|mein tag|heute/.test(l) ? 'tag' : /woche/.test(l) ? 'woche' : /meeting|sitzung|vorbereit/.test(l) ? 'meeting' :
      /mail|schreib|antwort/.test(l) ? 'mail' : /reise|flug|hotel/.test(l) ? 'reise' : /entscheid|soll ich/.test(l) ? 'entscheid' : /abgeben|delegier/.test(l) ? 'delegieren' : '';
    setTimeout(function () {
      if (art) { sag('nova', LOKAL[art](art === 'mail' || art === 'reise' || art === 'entscheid' ? text : undefined), true); return; }
      var r = erfassen(text, true);
      sag('nova', r ? r + '\n\nOhne Verbindung verstehe ich vor allem Aufgaben, Termine und die Knöpfe oben. Mit Server-Verbindung antworte ich frei.' : 'Notiert.');
    }, 300);
  }
  function notizAus(text) {
    S.notizen.push({ id: uid(), bereich: (bereicheSichtbar()[0] || S.bereiche[0]).id, text: text, datum: heute() }); speichern();
  }

  /* ---------- Stimme: vorlesen und diktieren ---------- */
  var audio = null;
  function vorlesen(text) {
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
    if (audio) { try { audio.pause(); } catch (e) {} }
    var sauber = String(text).replace(/[•\[\]]/g, '').replace(/\n+/g, '. ');
    function geraet() {
      if (!('speechSynthesis' in window)) { toast('Vorlesen geht auf diesem Gerät nicht.'); return; }
      var u = new SpeechSynthesisUtterance(sauber); u.lang = 'de-CH'; u.rate = 0.97;
      var vs = speechSynthesis.getVoices().filter(function (v) { return /^de/i.test(v.lang); });
      var v = vs.filter(function (x) { return /Anna|Petra|Helena|Marlene|Vicki/i.test(x.name); })[0] || vs.filter(function (x) { return /CH/i.test(x.lang); })[0] || vs[0];
      if (v) { u.voice = v; u.lang = v.lang; }
      speechSynthesis.speak(u);
    }
    if (!verbunden()) { geraet(); return; }
    audio = audio || new Audio();
    fetch(addr() + '/v1/stimme', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + g(VK.key, ''), 'X-Nova-App': 'Polvia' },
      body: JSON.stringify({ figur: 'nova', text: sauber.slice(0, 900) })
    }).then(function (r) { if (!r.ok || r.status === 204) throw 0; return r.blob(); })
      .then(function (b) { if (!b || b.size < 200) throw 0; audio.src = URL.createObjectURL(b); return audio.play(); })
      .catch(geraet);
  }

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
  function diktat(ziel, knopf, fertig) {
    if (!SR) { toast('Diktieren: bitte das Mikrofon der Tastatur nutzen.'); ziel.focus(); return; }
    if (rec) { rec.stop(); return; }
    rec = new SR(); rec.lang = 'de-CH'; rec.interimResults = true; rec.continuous = false;
    var basis = ziel.value ? ziel.value + ' ' : '';
    knopf.classList.add('an');
    rec.onresult = function (e) {
      var t = ''; for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      ziel.value = basis + t;
    };
    rec.onend = function () { knopf.classList.remove('an'); rec = null; if (fertig && ziel.value.trim()) fertig(); };
    rec.onerror = function () { knopf.classList.remove('an'); rec = null; };
    try { rec.start(); } catch (e) { knopf.classList.remove('an'); rec = null; }
  }

  /* ---------- Schnell erfassen: «Morgen 14 Uhr Call mit Team» ---------- */
  var WOCHENTAGE = { sonntag: 0, montag: 1, dienstag: 2, mittwoch: 3, donnerstag: 4, freitag: 5, samstag: 6 };
  var STICH = [
    [/\b(yoga|kurs|seminar|studio|coaching|retreat)\b/i, /yoga|coaching|seminar/i],
    [/\b(dr ?lab|diego|app|körperkosmos|polvia)\b/i, /dr ?lab/i],
    [/\b(mama|papa|kind|kinder|familie|schule|eltern|geburtstag|zuhause|haushalt|ferien|steuer)\w*/i, /familie|zuhause|privat/i],
    [/\b(arzt|zahnarzt|rolfing|training|massage|lauf|gesundheit|therapie)\w*/i, /gesundheit|ich/i],
    [/\b(board|team|meeting|kunde|lieferant|budget|quartal|firma|büro|präsentation|call|ceo|konzern|vertrieb|kollektion)\w*/i, /konzern|firma/i]
  ];
  function rateBereich(text) {
    for (var i = 0; i < STICH.length; i++) if (STICH[i][0].test(text)) {
      var b = S.bereiche.filter(function (x) { return STICH[i][1].test(x.name); })[0];
      if (b) return b.id;
    }
    var name = S.bereiche.filter(function (x) { return text.toLowerCase().indexOf(x.name.toLowerCase()) >= 0; })[0];
    if (name) return name.id;
    if (UI.view === 'bereiche' && UI.bereich) return UI.bereich;
    return (bereicheSichtbar()[0] || S.bereiche[0]).id;
  }
  function verstehe(roh) {
    var t = ' ' + roh.trim() + ' ', l = t.toLowerCase(), datum = null, von = null, dauer = 60;
    var weg = [];
    function raus(re) { var m = t.match(re); if (m) weg.push(m[0]); return m; }
    var m;
    if ((m = raus(/\s(übermorgen)\s/i))) datum = iso(plus(new Date(), 2));
    else if ((m = raus(/\s(morgen)\s/i))) datum = iso(plus(new Date(), 1));
    else if ((m = raus(/\s(heute|heut)\s/i))) datum = heute();
    else if ((m = raus(/\s(?:am\s+|nächsten\s+|kommenden\s+)?(sonntag|montag|dienstag|mittwoch|donnerstag|freitag|samstag)\s/i))) {
      var ziel = WOCHENTAGE[m[1].toLowerCase()], d = new Date(), diff = (ziel - d.getDay() + 7) % 7;
      datum = iso(plus(d, diff === 0 ? 7 : diff));
    } else if ((m = raus(/\s(?:am\s+)?(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?\s/))) {
      var j = m[3] ? (+m[3] < 100 ? 2000 + (+m[3]) : +m[3]) : new Date().getFullYear();
      var dd = new Date(j, +m[2] - 1, +m[1]);
      if (!m[3] && dd < vonIso(heute())) dd.setFullYear(j + 1);
      datum = iso(dd);
    } else if ((m = raus(/\s(nächste woche)\s/i))) datum = iso(plus(new Date(), 7));
    if ((m = raus(/\s(?:um\s+|ab\s+)?(\d{1,2})[:.](\d{2})(?:\s*uhr)?\s/i))) von = pad(+m[1]) + ':' + m[2];
    else if ((m = raus(/\s(?:um\s+|ab\s+)?(\d{1,2})\s*uhr\s/i))) von = pad(+m[1]) + ':00';
    if ((m = raus(/\s(?:für\s+)?(\d{1,3})\s*(min|minuten)\s/i))) dauer = +m[1];
    else if ((m = raus(/\s(?:für\s+)?(\d(?:[.,]5)?)\s*(h|std|stunden?)\s/i))) dauer = Math.round(parseFloat(m[1].replace(',', '.')) * 60);
    var prio = /\b(wichtig|dringend|sofort)\b|!/i.test(l) ? 1 : 0;
    var deleg = (l.match(/\b(?:an|für)\s+(nova|assistenz)\b|\bnova soll\b|\bdelegier/i) || [])[0];
    var istTermin = !!von || /\b(termin|meeting|call|treffen|lunch|dinner|essen mit|flug|arzt|sitzung|workshop|kurs)\b/i.test(l);
    var text = t;
    weg.forEach(function (w) { text = text.replace(w, ' '); });
    text = text.replace(/\b(wichtig|dringend|sofort)\b|!/gi, ' ').replace(/^\s*(nova,?\s*)?(bitte\s+)?(notier|notiere|erinnere mich( daran)?|merk dir|neue aufgabe|aufgabe|termin)[:,]?\s*/i, ' ')
      .replace(/\b(?:an|für)\s+(nova|assistenz)\b|\bnova soll\b|\bdelegier\w*/gi, ' ').replace(/\s{2,}/g, ' ').trim();
    if (!text) text = roh.trim();
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return { text: text, datum: datum, von: von, dauer: dauer, prio: prio || 2, deleg: deleg ? (/assistenz/i.test(deleg) ? 'Assistenz' : 'Nova') : null, termin: istTermin, bereich: rateBereich(roh) };
  }
  var LETZT = null;
  function erfassen(roh, still) {
    if (!roh || !roh.trim()) return '';
    var v = verstehe(roh), msg;
    if (v.termin) {
      var von = v.von || '09:00';
      var t = { id: uid(), titel: v.text, bereich: v.bereich, datum: v.datum || heute(), von: von, bis: hhmm(minuten(von) + v.dauer), ort: '' };
      S.termine.push(t); LETZT = { art: 'termine', id: t.id };
      var k = konflikte(termineAm(t.datum))[t.id];
      msg = 'Termin: ' + t.titel + ', ' + tagRel(t.datum) + ' ' + t.von + ' · ' + bereich(t.bereich).name + (k ? ' · überschneidet sich' : '');
    } else {
      var a = { id: uid(), text: v.text, bereich: v.bereich, faellig: v.datum, prio: v.prio, erledigt: false, delegiert: v.deleg };
      S.aufgaben.push(a); LETZT = { art: 'aufgaben', id: a.id };
      msg = 'Aufgabe: ' + a.text + (a.faellig ? ', ' + tagRel(a.faellig) : '') + ' · ' + bereich(a.bereich).name + (a.delegiert ? ' → ' + a.delegiert : '');
    }
    speichern(); render();
    if (!still) toast(msg, 'Rückgängig', function () {
      if (!LETZT) return;
      S[LETZT.art] = S[LETZT.art].filter(function (x) { return x.id !== LETZT.id; }); LETZT = null; speichern(); render();
    });
    return msg;
  }

  /* ---------- Blätter (Bottom Sheets) ---------- */
  var blatt = $('#blatt'), blattHg = $('#blattHg');
  function oeffne(html, nachher) {
    blatt.innerHTML = '<div class="griff"></div>' + html;
    blatt.hidden = false; blattHg.hidden = false;
    document.body.style.overflow = 'hidden';
    if (nachher) nachher(blatt);
    var f = $('input[autofocus],textarea[autofocus]', blatt); if (f) setTimeout(function () { f.focus(); }, 250);
  }
  function zu() { blatt.hidden = true; blattHg.hidden = true; blatt.innerHTML = ''; document.body.style.overflow = ''; }
  blattHg.addEventListener('click', zu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !blatt.hidden) zu(); });
  (function () {
    var y0 = null;
    blatt.addEventListener('touchstart', function (e) { y0 = blatt.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
    blatt.addEventListener('touchend', function (e) { if (y0 !== null && e.changedTouches[0].clientY - y0 > 90) zu(); y0 = null; }, { passive: true });
  })();

  function bereichOptionen(sel) {
    return S.bereiche.map(function (b) { return '<option value="' + b.id + '"' + (b.id === sel ? ' selected' : '') + '>' + esc(b.name) + '</option>'; }).join('');
  }
  function projektOptionen(bid, sel) {
    return '<option value="">Kein Projekt</option>' + S.projekte.filter(function (x) { return x.bereich === bid; })
      .map(function (x) { return '<option value="' + x.id + '"' + (x.id === sel ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('');
  }
  function segment(name, werte, sel) {
    return '<div class="segment" data-seg="' + name + '">' + werte.map(function (w) { return '<button type="button" data-w="' + w[0] + '"' + (String(w[0]) === String(sel) ? ' class="an"' : '') + '>' + w[1] + '</button>'; }).join('') + '</div>';
  }
  function segWert(root, name) { var b = $('[data-seg="' + name + '"] .an', root); return b ? b.getAttribute('data-w') : null; }
  blatt.addEventListener('click', function (e) {
    var b = e.target.closest('[data-seg] button'); if (!b) return;
    $$('button', b.parentNode).forEach(function (x) { x.classList.toggle('an', x === b); });
  });

  function aufgabeBlatt(a) {
    var neu = !a;
    a = a || { id: uid(), text: '', bereich: UI.bereich || (bereicheSichtbar()[0] || S.bereiche[0]).id, faellig: heute(), prio: 2, erledigt: false };
    oeffne('<h3>' + (neu ? 'Neue Aufgabe' : 'Aufgabe') + '</h3><form class="form" id="f">' +
      '<label class="feld">Was ist zu tun?<textarea name="text" required ' + (neu ? 'autofocus' : '') + ' style="min-height:70px">' + esc(a.text) + '</textarea></label>' +
      '<div class="zwei"><label class="feld">Bereich<select name="bereich">' + bereichOptionen(a.bereich) + '</select></label>' +
      '<label class="feld">Projekt<select name="projekt">' + projektOptionen(a.bereich, a.projekt) + '</select></label></div>' +
      '<div class="zwei"><label class="feld">Fällig<input type="date" name="faellig" value="' + (a.faellig || '') + '"></label>' +
      '<label class="feld">Delegiert an<input name="delegiert" value="' + esc(a.delegiert || '') + '" placeholder="Nova, Person …"></label></div>' +
      '<div class="feld">Wichtigkeit' + segment('prio', [[1, 'Hoch'], [2, 'Normal'], [3, 'Niedrig']], a.prio) + '</div>' +
      '<div class="knoepfe"><button class="btn haupt" type="submit">Sichern</button>' +
      (neu ? '' : '<button class="btn" type="button" id="aNova">Nova: Hilf mir dabei</button><button class="btn weg" type="button" id="aWeg">Löschen</button>') + '</div></form>',
      function (r) {
        var f = $('#f', r);
        f.bereich.addEventListener('change', function () { f.projekt.innerHTML = projektOptionen(f.bereich.value); });
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          a.text = f.text.value.trim(); if (!a.text) return;
          a.bereich = f.bereich.value; a.projekt = f.projekt.value || null; a.faellig = f.faellig.value || null;
          a.delegiert = f.delegiert.value.trim() || null; a.prio = +segWert(r, 'prio') || 2;
          if (neu) S.aufgaben.push(a);
          speichern(); zu(); render(); toast(neu ? 'Aufgabe angelegt' : 'Gesichert');
        });
        var w = $('#aWeg', r); if (w) w.addEventListener('click', function () { loeschen('aufgaben', a.id, 'Aufgabe gelöscht'); });
        var n = $('#aNova', r); if (n) n.addEventListener('click', function () {
          zu(); zeige('nova');
          var q = 'Hilf mir bei dieser Aufgabe: «' + a.text + '» (' + bereich(a.bereich).name + '). Was sind die ersten drei Schritte?';
          if (verbunden()) novaFrei(q);
          else { sag('ich', q); setTimeout(function () { sag('nova', 'Erste Schritte für «' + a.text + '»\n\n1. In einem Satz festhalten, wann es fertig ist.\n2. Den kleinsten nächsten Schritt machen (10 Minuten).\n3. Wer muss informiert werden oder kann helfen?\n\nWenn du willst, leg ich dir ein Fokusfenster in den Kalender.', true); }, 300); }
        });
      });
  }

  function terminBlatt(t, datum) {
    var neu = !t;
    t = t || { id: uid(), titel: '', bereich: UI.bereich || (bereicheSichtbar()[0] || S.bereiche[0]).id, datum: datum || UI.kalTag || heute(), von: '09:00', bis: '10:00', ort: '' };
    oeffne('<h3>' + (neu ? 'Neuer Termin' : esc(t.titel)) + '</h3><form class="form" id="f">' +
      '<label class="feld">Titel<input name="titel" required value="' + esc(t.titel) + '" ' + (neu ? 'autofocus' : '') + '></label>' +
      '<div class="drei"><label class="feld">Tag<input type="date" name="datum" value="' + t.datum + '" required></label>' +
      '<label class="feld">Von<input type="time" name="von" value="' + t.von + '" required></label>' +
      '<label class="feld">Bis<input type="time" name="bis" value="' + t.bis + '" required></label></div>' +
      '<div class="zwei"><label class="feld">Bereich<select name="bereich">' + bereichOptionen(t.bereich) + '</select></label>' +
      '<label class="feld">Ort<input name="ort" value="' + esc(t.ort || '') + '"></label></div>' +
      '<label class="feld">Notiz<textarea name="notiz" style="min-height:70px">' + esc(t.notiz || '') + '</textarea></label>' +
      '<div class="knoepfe"><button class="btn haupt" type="submit">Sichern</button>' +
      (neu ? '' : '<button class="btn" type="button" id="tPrep">Nova: Meeting vorbereiten</button><button class="btn" type="button" id="tIcs">In Kalender des Telefons</button><button class="btn weg" type="button" id="tWeg">Löschen</button>') + '</div></form>',
      function (r) {
        var f = $('#f', r);
        f.von.addEventListener('change', function () { if (minuten(f.bis.value) <= minuten(f.von.value)) f.bis.value = hhmm(minuten(f.von.value) + 60); });
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          t.titel = f.titel.value.trim(); if (!t.titel) return;
          t.datum = f.datum.value; t.von = f.von.value; t.bis = minuten(f.bis.value) > minuten(f.von.value) ? f.bis.value : hhmm(minuten(f.von.value) + 60);
          t.bereich = f.bereich.value; t.ort = f.ort.value.trim(); t.notiz = f.notiz.value.trim();
          if (neu) S.termine.push(t);
          speichern(); zu(); render();
          toast(konflikte(termineAm(t.datum))[t.id] ? 'Gesichert · überschneidet sich mit einem anderen Termin' : 'Termin gesichert');
        });
        var w = $('#tWeg', r); if (w) w.addEventListener('click', function () { loeschen('termine', t.id, 'Termin gelöscht'); });
        var pr = $('#tPrep', r); if (pr) pr.addEventListener('click', function () { zu(); novaAktion('meeting', t.id, 'Bereite mich vor: ' + t.titel); });
        var ic = $('#tIcs', r); if (ic) ic.addEventListener('click', function () { icsLaden(t); });
      });
  }

  function projektBlatt(x) {
    var neu = !x;
    x = x || { id: uid(), bereich: UI.bereich || S.bereiche[0].id, name: '', status: 'laeuft', fortschritt: 0, naechster: '' };
    oeffne('<h3>' + (neu ? 'Neues Projekt' : esc(x.name)) + '</h3><form class="form" id="f">' +
      '<label class="feld">Name<input name="name" required value="' + esc(x.name) + '" ' + (neu ? 'autofocus' : '') + '></label>' +
      '<label class="feld">Bereich<select name="bereich">' + bereichOptionen(x.bereich) + '</select></label>' +
      '<div class="feld">Status' + segment('status', [['laeuft', 'Läuft'], ['wartet', 'Wartet'], ['kritisch', 'Kritisch'], ['erledigt', 'Erledigt']], x.status) + '</div>' +
      '<label class="feld">Fortschritt <span id="fw">' + x.fortschritt + '%</span><input type="range" name="fortschritt" min="0" max="100" step="5" value="' + x.fortschritt + '" style="padding:0;box-shadow:none;background:none"></label>' +
      '<label class="feld">Nächster Schritt<input name="naechster" value="' + esc(x.naechster || '') + '"></label>' +
      '<div class="knoepfe"><button class="btn haupt" type="submit">Sichern</button>' + (neu ? '' : '<button class="btn weg" type="button" id="pWeg">Löschen</button>') + '</div></form>',
      function (r) {
        var f = $('#f', r);
        f.fortschritt.addEventListener('input', function () { $('#fw', r).textContent = f.fortschritt.value + '%'; });
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          x.name = f.name.value.trim(); if (!x.name) return;
          x.bereich = f.bereich.value; x.status = segWert(r, 'status') || 'laeuft'; x.fortschritt = +f.fortschritt.value; x.naechster = f.naechster.value.trim();
          if (x.status === 'erledigt') x.fortschritt = 100;
          if (neu) S.projekte.push(x);
          speichern(); zu(); render(); toast('Projekt gesichert');
        });
        var w = $('#pWeg', r); if (w) w.addEventListener('click', function () { loeschen('projekte', x.id, 'Projekt gelöscht'); });
      });
  }

  function bereichBlatt(b) {
    var neu = !b;
    b = b || { id: 'b-' + uid(), name: '', art: S.modus === 'privat' ? 'privat' : 'geschaeft', farbe: FARBEN[S.bereiche.length % FARBEN.length] };
    oeffne('<h3>' + (neu ? 'Firma oder Bereich' : esc(b.name)) + '</h3><form class="form" id="f">' +
      '<label class="feld">Name<input name="name" required value="' + esc(b.name) + '" placeholder="z. B. Firma, Stiftung, Familie" ' + (neu ? 'autofocus' : '') + '></label>' +
      '<div class="feld">Art' + segment('art', [['geschaeft', 'Geschäft'], ['privat', 'Privat']], b.art) + '</div>' +
      '<div class="feld">Farbe<div class="farben">' + FARBEN.map(function (c) { return '<button type="button" data-farbe="' + c + '" style="--c:' + c + '"' + (c === b.farbe ? ' class="an"' : '') + ' aria-label="Farbe"></button>'; }).join('') + '</div></div>' +
      '<div class="knoepfe"><button class="btn haupt" type="submit">Sichern</button>' + (neu ? '' : '<button class="btn weg" type="button" id="bWeg">Bereich mit allem Inhalt löschen</button>') + '</div></form>',
      function (r) {
        var farbe = b.farbe;
        $$('[data-farbe]', r).forEach(function (k) { k.addEventListener('click', function () { farbe = k.getAttribute('data-farbe'); $$('[data-farbe]', r).forEach(function (x) { x.classList.toggle('an', x === k); }); }); });
        $('#f', r).addEventListener('submit', function (e) {
          e.preventDefault();
          var n = $('#f', r).name.value.trim(); if (!n) return;
          b.name = n; b.art = segWert(r, 'art') || 'geschaeft'; b.farbe = farbe;
          if (neu) S.bereiche.push(b);
          speichern(); zu(); render(); toast('Gesichert');
        });
        var w = $('#bWeg', r); if (w) w.addEventListener('click', function () {
          if (S.bereiche.length < 2) { toast('Mindestens ein Bereich bleibt.'); return; }
          if (!confirm('«' + b.name + '» mit Projekten, Aufgaben, Terminen und Notizen löschen?')) return;
          ['projekte', 'aufgaben', 'termine', 'notizen'].forEach(function (k) { S[k] = S[k].filter(function (x) { return x.bereich !== b.id; }); });
          S.bereiche = S.bereiche.filter(function (x) { return x.id !== b.id; });
          UI.bereich = null; speichern(); zu(); render(); toast('Bereich gelöscht');
        });
      });
  }

  function notizBlatt(n) {
    var neu = !n;
    n = n || { id: uid(), bereich: UI.bereich || S.bereiche[0].id, text: '', datum: heute() };
    oeffne('<h3>Notiz</h3><form class="form" id="f"><label class="feld">Text<textarea name="text" autofocus>' + esc(n.text) + '</textarea></label>' +
      '<label class="feld">Bereich<select name="bereich">' + bereichOptionen(n.bereich) + '</select></label>' +
      '<div class="knoepfe"><button class="btn haupt" type="submit">Sichern</button><button class="btn" type="button" id="nAufg">Als Aufgabe übernehmen</button>' +
      (neu ? '' : '<button class="btn weg" type="button" id="nWeg">Löschen</button>') + '</div></form>',
      function (r) {
        var f = $('#f', r);
        f.addEventListener('submit', function (e) {
          e.preventDefault(); n.text = f.text.value.trim(); if (!n.text) return; n.bereich = f.bereich.value;
          if (neu) S.notizen.push(n); speichern(); zu(); render(); toast('Notiz gesichert');
        });
        $('#nAufg', r).addEventListener('click', function () {
          var t = f.text.value.trim(); if (!t) return;
          S.aufgaben.push({ id: uid(), text: t.split('\n')[0].slice(0, 140), bereich: f.bereich.value, faellig: null, prio: 2, erledigt: false });
          speichern(); zu(); render(); toast('Als Aufgabe übernommen');
        });
        var w = $('#nWeg', r); if (w) w.addEventListener('click', function () { loeschen('notizen', n.id, 'Notiz gelöscht'); });
      });
  }

  function eingabeBlatt(titel, frage, fertig) {
    oeffne('<h3>' + esc(titel) + '</h3><form class="form" id="f"><label class="feld">' + esc(frage) + '<textarea name="t" autofocus style="min-height:90px"></textarea></label>' +
      '<div class="knoepfe"><button class="btn haupt" type="submit">Weiter</button></div></form>', function (r) {
        $('#f', r).addEventListener('submit', function (e) { e.preventDefault(); var v = $('#f', r).t.value.trim(); if (!v) return; zu(); fertig(v); });
      });
  }

  function loeschen(art, id, msg) {
    var alt = S[art].slice();
    S[art] = S[art].filter(function (x) { return x.id !== id; });
    speichern(); zu(); render();
    toast(msg, 'Rückgängig', function () { S[art] = alt; speichern(); render(); });
  }

  function icsLaden(t) {
    var f = function (d, z) { return d.replace(/-/g, '') + 'T' + z.replace(':', '') + '00'; };
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DR Lab//Polvia//DE', 'BEGIN:VEVENT', 'UID:' + t.id + '@polvia',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z', 'DTSTART:' + f(t.datum, t.von), 'DTEND:' + f(t.datum, t.bis),
      'SUMMARY:' + t.titel.replace(/[,;]/g, ' '), t.ort ? 'LOCATION:' + t.ort.replace(/[,;]/g, ' ') : '', 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n');
    datei(ics, (t.titel || 'termin').replace(/[^\wäöüÄÖÜ-]+/g, '-') + '.ics', 'text/calendar');
  }
  function datei(inhalt, name, typ) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([inhalt], { type: typ }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ---------- Toast ---------- */
  var toastT = null;
  function toast(text, knopf, fn) {
    var el = $('#toast');
    el.innerHTML = '<span>' + esc(text) + '</span>' + (knopf ? '<button type="button">' + esc(knopf) + '</button>' : '');
    el.hidden = false;
    if (knopf) $('button', el).addEventListener('click', function () { el.hidden = true; fn(); });
    clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, knopf ? 5000 : 2400);
  }

  /* ---------- Navigation ---------- */
  function zeige(view) {
    UI.view = view;
    $$('.view').forEach(function (v) { v.hidden = v.id !== 'v-' + view; });
    $$('.leiste button').forEach(function (b) { b.classList.toggle('an', b.getAttribute('data-view') === view); });
    $('#erfassenText').placeholder = view === 'nova' ? 'Frag Nova …' : 'Nova, notier …  z. B. «Morgen 14 Uhr Call Team»';
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    var d = new Date();
    $('#datum').textContent = TAGE[d.getDay()] + ', ' + d.getDate() + '. ' + MONATE[d.getMonth()];
    $('#gruss').textContent = gruss();
    $('#profilBild').innerHTML = S.foto ? '<img src="' + S.foto + '" alt="">' : '<b>' + esc((S.name || '·').charAt(0).toUpperCase()) + '</b>';
    $$('.modus button').forEach(function (b) { b.classList.toggle('an', b.getAttribute('data-modus') === S.modus); });
    var fn = { heute: renderHeute, bereiche: renderBereiche, aufgaben: renderAufgaben, kalender: renderKalender, nova: renderNova }[UI.view];
    fn();
  }

  /* ---------- Klicks ---------- */
  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-view]'))) { UI.bereich = null; zeige(el.getAttribute('data-view')); return; }
    if ((el = e.target.closest('[data-modus]'))) { S.modus = el.getAttribute('data-modus'); UI.filter = 'alle'; UI.bereich = null; speichern(); render(); return; }
    if ((el = e.target.closest('[data-check]'))) {
      var a = S.aufgaben.filter(function (x) { return x.id === el.getAttribute('data-check'); })[0];
      if (!a) return;
      a.erledigt = !a.erledigt; a.erledigtAm = a.erledigt ? heute() : null;
      el.classList.toggle('an', a.erledigt);
      var z = el.closest('.zeile'); if (z) z.classList.toggle('erledigt', a.erledigt);
      speichern();
      if (navigator.vibrate) try { navigator.vibrate(8); } catch (x) {}
      setTimeout(render, 450);
      if (a.erledigt) toast('Erledigt', 'Rückgängig', function () { a.erledigt = false; speichern(); render(); });
      return;
    }
    if ((el = e.target.closest('[data-edit-a]'))) { aufgabeBlatt(S.aufgaben.filter(function (x) { return x.id === el.getAttribute('data-edit-a'); })[0]); return; }
    if ((el = e.target.closest('[data-t]'))) { terminBlatt(S.termine.filter(function (x) { return x.id === el.getAttribute('data-t'); })[0]); return; }
    if ((el = e.target.closest('[data-p]'))) { projektBlatt(projekt(el.getAttribute('data-p'))); return; }
    if ((el = e.target.closest('[data-n]'))) { notizBlatt(S.notizen.filter(function (x) { return x.id === el.getAttribute('data-n'); })[0]); return; }
    if ((el = e.target.closest('[data-b]'))) { UI.bereich = el.getAttribute('data-b'); renderBereiche(); window.scrollTo(0, 0); return; }
    if ((el = e.target.closest('[data-filter]'))) { UI.filter = el.getAttribute('data-filter'); renderAufgaben(); return; }
    if ((el = e.target.closest('[data-tag]'))) { UI.kalTag = el.getAttribute('data-tag'); renderKalender(); return; }
    if ((el = e.target.closest('[data-nova]'))) { novaAktion(el.getAttribute('data-nova')); return; }
    if ((el = e.target.closest('[data-kopie]'))) {
      var m = S.chat[+el.getAttribute('data-kopie')];
      if (m && navigator.clipboard) navigator.clipboard.writeText(m.text).then(function () { toast('Kopiert'); }, function () { toast('Kopieren ging nicht'); });
      return;
    }
    if ((el = e.target.closest('[data-vorlesen]'))) { var mm = S.chat[+el.getAttribute('data-vorlesen')]; if (mm) vorlesen(mm.text); return; }
    if ((el = e.target.closest('[data-act]'))) { aktion(el.getAttribute('data-act')); return; }
  });

  function aktion(a) {
    switch (a) {
      case 'vorlesen': vorlesen((S.name ? gruss() + '. ' : '') + briefingText()); break;
      case 'woche': novaAktion('woche'); break;
      case 'neueAufgabe': aufgabeBlatt(); break;
      case 'neuerTermin': terminBlatt(null, UI.view === 'kalender' ? UI.kalTag : heute()); break;
      case 'neuesProjekt': projektBlatt(); break;
      case 'neueNotiz': notizBlatt(); break;
      case 'neuerBereich': bereichBlatt(); break;
      case 'bereichBearbeiten': bereichBlatt(bereich(UI.bereich)); break;
      case 'bereicheZurueck': UI.bereich = null; renderBereiche(); break;
      case 'bereichNova': var bid = UI.bereich; zeige('nova'); sag('ich', 'Lage ' + bereich(bid).name);
        if (verbunden()) { denkt(true); fragServer('Fasse die Lage im Bereich ' + bereich(bid).name + ' zusammen und nenne die zwei wichtigsten nächsten Schritte.\n\nRohdaten:\n' + LOKAL.bereich(bid)).then(function (x) { denkt(false); sag('nova', x, true); }, function () { denkt(false); sag('nova', LOKAL.bereich(bid), true); }); }
        else setTimeout(function () { sag('nova', LOKAL.bereich(bid), true); }, 300);
        break;
      case 'aufraeumen': S.aufgaben = S.aufgaben.filter(function (x) { return !x.erledigt; }); speichern(); render(); toast('Erledigte gelöscht'); break;
      case 'wocheZurueck': UI.wochenStart = iso(plus(vonIso(UI.wochenStart), -7)); UI.kalTag = UI.wochenStart; renderKalender(); break;
      case 'wocheVor': UI.wochenStart = iso(plus(vonIso(UI.wochenStart), 7)); UI.kalTag = UI.wochenStart; renderKalender(); break;
      case 'kalHeute': UI.kalTag = heute(); UI.wochenStart = wochenStart(UI.kalTag); renderKalender(); break;
      case 'nameAendern': eingabeBlatt('Name', 'Wie darf Nova dich nennen?', function (v) { S.name = v.slice(0, 30); speichern(); render(); }); break;
      case 'verbinden': verbindenBlatt(); break;
      case 'export': datei(JSON.stringify(S, null, 2), 'polvia-sicherung-' + heute() + '.json', 'application/json'); toast('Sicherung erstellt'); break;
      case 'import': importieren(); break;
      case 'beispiel': if (confirm('Beispieldaten laden? Deine jetzigen Daten werden ersetzt. Vorher eine Sicherung herunterladen.')) { var n = S.name; S = beispiel(n); speichern(); render(); toast('Beispieldaten geladen'); } break;
      case 'loeschen': if (confirm('Wirklich alle Daten in diesem Gerät löschen?')) { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); } break;
      case 'datenschutz': oeffne('<h3>Datenschutz</h3><div class="vorlage">Polvia speichert alles nur in diesem Gerät.\n\nOhne Verbindung verlässt nichts das Gerät. Es gibt keine Werbung, keine Analyse und keine fremden Dienste.\n\nWenn du Nova mit deinem eigenen Server verbindest, gehen deine Frage und eine kurze Übersicht (Termine, Aufgaben, Projekte der nächsten Tage) verschlüsselt an diesen Server in der Schweiz. Er speichert keine Daten von dir dauerhaft.\n\nNova sendet, bucht und unterschreibt nie selbst. Entscheide bleiben bei dir.\n\nVerantwortlich: DR Lab, Diego Robert, Zürich.</div>'); break;
    }
  }


  function profilBlatt() {
    oeffne('<h3>Profil</h3><div class="form"><p class="leer" style="padding:0">Dein Bild bleibt nur in diesem Gerät.</p>' +
      '<div class="knoepfe"><button class="btn haupt" type="button" id="fWahl">Foto wählen</button>' +
      (S.foto ? '<button class="btn weg" type="button" id="fWeg">Foto entfernen</button>' : '') +
      '<button class="btn" type="button" id="fName">Name ändern</button></div></div>', function (r) {
        $('#fWahl', r).addEventListener('click', function () {
          var i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
          i.onchange = function () {
            var f = i.files && i.files[0]; if (!f) return;
            var img = new Image(), url = URL.createObjectURL(f);
            img.onload = function () {
              var c = document.createElement('canvas'), n = 240, s = Math.min(img.width, img.height);
              c.width = c.height = n;
              c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, n, n);
              S.foto = c.toDataURL('image/jpeg', 0.85); URL.revokeObjectURL(url); speichern(); zu(); render(); toast('Profilbild gesichert');
            };
            img.src = url;
          };
          i.click();
        });
        var w = $('#fWeg', r); if (w) w.addEventListener('click', function () { delete S.foto; speichern(); zu(); render(); });
        $('#fName', r).addEventListener('click', function () { zu(); aktion('nameAendern'); });
      });
  }

  function verbindenBlatt() {
    var w = verbunden();
    oeffne('<h3>Nova verbinden</h3><form class="form" id="f"><p class="leer" style="padding:0">Mit Verbindung schreibt Nova frei, mit deinem Kontext. Ohne Verbindung arbeitet sie mit Vorlagen im Gerät.</p>' +
      '<label class="feld">Verbindungscode<input name="code" placeholder="NOVA:…" autocomplete="off"></label>' +
      '<div class="zwei"><label class="feld">Server-Adresse<input name="addr" type="url" value="' + esc(addr()) + '" placeholder="https://…"></label>' +
      '<label class="feld">Passwort<input name="key" type="password" placeholder="' + (w ? '••••••••' : '') + '" autocomplete="off"></label></div>' +
      '<div class="knoepfe"><button class="btn haupt" type="submit">Sichern</button>' + (w ? '<button class="btn weg" type="button" id="vTrenn">Verbindung trennen</button>' : '') + '</div></form>',
      function (r) {
        var f = $('#f', r);
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          if (f.code.value.trim()) { if (!codeNehmen(f.code.value)) { toast('Das ist kein gültiger Code.'); return; } }
          else {
            var a = f.addr.value.trim(); if (a && !/^https:\/\//.test(a)) a = 'https://' + a;
            p(VK.addr, a.replace(/\/+$/, '')); if (f.key.value.trim()) p(VK.key, f.key.value.trim());
          }
          zu(); render(); toast(verbunden() ? 'Nova ist verbunden' : 'Es fehlt Adresse oder Passwort');
        });
        var t = $('#vTrenn', r); if (t) t.addEventListener('click', function () { try { localStorage.removeItem(VK.key); } catch (x) {} zu(); render(); toast('Verbindung getrennt'); });
      });
  }

  function importieren() {
    var i = document.createElement('input'); i.type = 'file'; i.accept = 'application/json,.json';
    i.onchange = function () {
      var f = i.files && i.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var d = JSON.parse(r.result);
          if (!d || !Array.isArray(d.bereiche) || !Array.isArray(d.aufgaben)) throw 0;
          ['projekte', 'termine', 'notizen', 'chat'].forEach(function (k) { if (!Array.isArray(d[k])) d[k] = []; });
          S = d; speichern(); render(); toast('Sicherung eingelesen');
        } catch (e) { toast('Diese Datei ist keine Polvia-Sicherung.'); }
      };
      r.readAsText(f);
    };
    i.click();
  }

  /* ---------- Erfassen-Leiste ---------- */
  $('#erfassen').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('#erfassenText'), v = inp.value.trim(); if (!v) return;
    inp.value = ''; inp.blur();
    if (UI.view === 'nova') novaFrei(v); else erfassen(v);
  });
  $('#erfassenMic').addEventListener('click', function () {
    diktat($('#erfassenText'), $('#erfassenMic'), function () { $('#erfassen').requestSubmit ? $('#erfassen').requestSubmit() : $('#erfassen').dispatchEvent(new Event('submit')); });
  });
  $('#profil').addEventListener('click', profilBlatt);

  /* ---------- Start ---------- */
  function start() {
    $('#intro').hidden = true; $('#app').hidden = false;
    zeige(UI.view);
  }
  S = laden();
  if (S) start();
  else {
    $('#intro').hidden = false;
    $('#introStart').addEventListener('click', function () { S = beispiel($('#introName').value.trim()); speichern(); start(); });
    $('#introLeer').addEventListener('click', function () { S = leer($('#introName').value.trim()); speichern(); start(); });
  }
  // Mitternacht oder lange im Hintergrund: Ansicht auffrischen.
  document.addEventListener('visibilitychange', function () { if (!document.hidden && S) render(); });
  setInterval(function () { if (S && !document.hidden && blatt.hidden) render(); }, 5 * 60 * 1000);

  // Für Tests im Browser.
  window.Polvia = { verstehe: function (t) { return verstehe(t); } };
})();
