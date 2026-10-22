/* Grafik-Feinschliff (g9): feine Linien-Icons statt Emojis in Kartentiteln, weiche Bild-Ladezustände.
   Ändert keine Funktion: nur Darstellung. Das Emoji bleibt als Text erhalten, wenn es kein passendes Icon gibt.
   <script src="grafik.js" data-modus="svg|weich" defer></script>
   svg   = bekannte Emojis werden zu feinen Linien-Icons im weichen Rahmen
   weich = Emojis bleiben (Kinder-Apps), stehen aber in einem runden, weichen Rahmen */
(function () {
  'use strict';
  if (window.__g9) return; window.__g9 = 1;
  var me = document.currentScript;
  var MODUS = (me && me.getAttribute('data-modus')) || 'svg';
  var NICHT = (me && me.getAttribute('data-nicht')) || '';
  var AUCH = (me && me.getAttribute('data-auch')) || ''; // Elemente, die nur ein Emoji enthalten: Inhalt wird zum Linien-Icon
  var NS = 'http://www.w3.org/2000/svg';
  document.documentElement.classList.add('g9');

  // 24er-Raster, 1.7er Linie, runde Enden. Mehrere Pfade mit | getrennt; c:x,y,r = Kreis; r:x,y,w,h,rx = Rechteck; p = gefüllter Punkt
  var I = {
    funken: 'M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z|M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z',
    balken: 'M4 20h16|M7.5 16.5v-5|M12 16.5V7|M16.5 16.5v-8',
    mond: 'M19.5 14.6A8 8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1z',
    geschenk: 'r:3.5,8,17,4,1.2|M5 12v7.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V12|M12 8v12|M12 8C10.6 5 7 4.6 7 6.8 7 8 9 8 12 8zm0 0c1.4-3 5-3.4 5-1.2C17 8 15 8 12 8z',
    herz: 'M12 19.5s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7 2.3c0 5.3-7 9.6-7 9.6z',
    tuer: 'M6.5 20V4.8a.8.8 0 0 1 .8-.8h9.4a.8.8 0 0 1 .8.8V20|M4 20h16|p:14.5,12.5,1',
    notiz: 'M4.5 19.5h4l10-10a2.1 2.1 0 0 0-3-3l-10 10z|M13.5 8.5l2.9 2.9',
    zzz: 'M5 5.5h5.5l-5.5 6h5.5|M13.5 12h5l-5 6.5h5',
    tasse: 'M5 9h11v4.5A5.5 5.5 0 0 1 10.5 19h0A5.5 5.5 0 0 1 5 13.5z|M16 10.5h1.2a2.3 2.3 0 0 1 0 4.6H16|M9 3.5c-.8 1 .8 1.7 0 2.8|M12.3 3.5c-.8 1 .8 1.7 0 2.8',
    buch: 'M12 6.5C10 5 7 4.6 4 5v13.2c3-.4 6 0 8 1.4 2-1.4 5-1.8 8-1.4V5c-3-.4-6 0-8 1.5z|M12 6.5v13',
    regler: 'M6 4v7.5|M6 15.5V20|M12 4v1.5|M12 9.5V20|M18 4v9|M18 17v3|c:6,13.5,2|c:12,7.5,2|c:18,15,2',
    wellen: 'M3 9.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0|M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
    wecker: 'c:12,13,7|M12 9.5V13l2.5 1.6|M4.5 5.5l3-2.3|M19.5 5.5l-3-2.3',
    sanduhr: 'M7 3.5h10|M7 20.5h10|M8.2 3.5v3c0 1.6 1 2.7 3.8 5.5 2.8-2.8 3.8-3.9 3.8-5.5v-3|M8.2 20.5v-3c0-1.6 1-2.7 3.8-5.5 2.8 2.8 3.8 3.9 3.8 5.5v3',
    nebel: 'M3.5 8.5h13|M7.5 12.5h13|M3.5 16.5h13',
    koffer: 'r:4,7.5,16,12.5,2|M9 7.5V5.6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.9|M9 11v5.5|M15 11v5.5',
    rucksack: 'M6 10.5a6 6 0 0 1 12 0v8.7a.8.8 0 0 1-.8.8H6.8a.8.8 0 0 1-.8-.8z|M10 4.6V4.2a2 2 0 0 1 4 0v.4|M9 14h6v3.2H9z',
    ringe: 'c:12,12,8.5|c:12,12,4.8|p:12,12,1.3',
    uhr: 'c:12,12,8.5|M12 7.5V12l3 2',
    bluete: 'c:12,12,2|M12 9.8C10.2 6.8 12 4 12 4s1.8 2.8 0 5.8z|M12 9.8C10.2 6.8 12 4 12 4s1.8 2.8 0 5.8z@72|M12 9.8C10.2 6.8 12 4 12 4s1.8 2.8 0 5.8z@144|M12 9.8C10.2 6.8 12 4 12 4s1.8 2.8 0 5.8z@216|M12 9.8C10.2 6.8 12 4 12 4s1.8 2.8 0 5.8z@288',
    stuhl: 'M8 3.5v9.5|M8 13h9|M8 13v7.5|M17 13v7.5|M8 3.5c3 .2 5.2.8 7 2',
    thermo: 'M10 14.3V5.2a2 2 0 0 1 4 0v9.1a4 4 0 1 1-4 0z|M12 9.5v7',
    ausweis: 'r:3,5,18,14,2|c:8.5,11,2|M5.6 16.2c.6-1.4 1.6-2 2.9-2s2.3.6 2.9 2|M14 10h4|M14 13.5h3',
    pfote: 'c:6.8,10.2,1.6|c:10,6.4,1.6|c:14,6.4,1.6|c:17.2,10.2,1.6|M12 12c-2.5 0-5 3-5 5.5 0 1.5 1.3 2 2.5 2 1 0 1.6-.6 2.5-.6s1.5.6 2.5.6c1.2 0 2.5-.5 2.5-2 0-2.5-2.5-5.5-5-5.5z',
    lupe: 'c:10.8,10.8,6.3|M20 20l-4.6-4.6',
    hut: 'M2.5 9.5L12 5l9.5 4.5L12 14z|M6.5 11.6V16c1.5 1.4 3.5 2 5.5 2s4-.6 5.5-2v-4.4|M21.5 9.5V15',
    laut: 'M4 9.5h3.5L12 6v12l-4.5-3.5H4z|M15.5 9a4 4 0 0 1 0 6|M18.2 6.4a7.6 7.6 0 0 1 0 11.2',
    aehre: 'M12 21V8|M12 12.5c-2.6 0-4-1.5-4-4 2.6 0 4 1.5 4 4zm0 0c2.6 0 4-1.5 4-4-2.6 0-4 1.5-4 4z|M12 17c-2.6 0-4-1.5-4-4 2.6 0 4 1.5 4 4zm0 0c2.6 0 4-1.5 4-4-2.6 0-4 1.5-4 4z|M12 8c-1.6-1-2-2.4-1.4-4.2 1.6.9 2 2.4 1.4 4.2z|M12 8c1.6-1 2-2.4 1.4-4.2-1.6.9-2 2.4-1.4 4.2z',
    blatt: 'M5 19C5 10.5 10 5 19 5c0 9-5.5 14-14 14z|M5 19l8.5-8.5',
    teller: 'c:12.5,12,6|c:12.5,12,3.2|M3.5 4v4.3A1.5 1.5 0 0 0 5 9.8V20|M21.5 20V4c-1.6 1-2.6 3-2.6 6.2h2.6',
    regenbogen: 'M3 17.5a9 9 0 0 1 18 0|M6.5 17.5a5.5 5.5 0 0 1 11 0|M10 17.5a2 2 0 0 1 4 0',
    rad: 'c:12,12,8.5|c:12,12,2|M12 3.5V10|M12 14v6.5|M3.5 12H10|M14 12h6.5|M6 6l4.6 4.6|M13.4 13.4L18 18|M18 6l-4.6 4.6|M10.6 13.4L6 18',
    kompass: 'c:12,12,8.5|M15.4 8.6l-2 4.8-4.8 2 2-4.8z',
    kamera: 'M4 8.6A1.6 1.6 0 0 1 5.6 7h2.1l1.5-2.2h5.6L16.3 7h2.1A1.6 1.6 0 0 1 20 8.6v9a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.6z|c:12,13,3.4',
    schloss: 'r:5,11,14,9,2|M8 11V8a4 4 0 0 1 8 0v3|p:12,15.5,1.1',
    brief: 'r:3.5,6,17,12,2|M4.2 7.5L12 13l7.8-5.5',
    blase: 'M5.2 5h13.6a1.7 1.7 0 0 1 1.7 1.7v7.8a1.7 1.7 0 0 1-1.7 1.7H11l-4.5 3.4v-3.4H5.2a1.7 1.7 0 0 1-1.7-1.7V6.7A1.7 1.7 0 0 1 5.2 5z',
    telefon: 'M6.7 3.8h2.6l1.4 4-2 1.3a10.6 10.6 0 0 0 6.2 6.2l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A15.2 15.2 0 0 1 4.7 6a2 2 0 0 1 2-2.2z',
    klappe: 'r:3.5,9.5,17,10.5,1.6|M3.6 9.4l15.3-4.1.8 3|M8.4 8.1l2 2.6|M13.4 6.8l2 2.6',
    stern: 'M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z',
    birne: 'M9.5 17.5h5|M10.3 20.5h3.4|M12 3.5a5.8 5.8 0 0 0-3.4 10.5c.6.5.9 1.1.9 1.8v.2h5v-.2c0-.7.3-1.3.9-1.8A5.8 5.8 0 0 0 12 3.5z',
    wuerfel: 'r:4,4,16,16,3.5|p:8.5,8.5,1.2|p:15.5,8.5,1.2|p:12,12,1.2|p:8.5,15.5,1.2|p:15.5,15.5,1.2',
    zahn: 'M12 6.2C10.6 4.8 8.8 4 7.2 4.4 4.6 5 4 7.8 4.8 10.6c.5 1.8 1 3 1.3 5 .3 2.2.8 4.4 2.1 4.4 1.6 0 1.5-4.6 3.8-4.6s2.2 4.6 3.8 4.6c1.3 0 1.8-2.2 2.1-4.4.3-2 .8-3.2 1.3-5 .8-2.8.2-5.6-2.4-6.2-1.6-.4-3.4.4-4.8 1.8z',
    flamme: 'M12 20.5c3.6 0 6-2.4 6-5.8 0-3.9-3-6-3.6-9.6-1.8 1.3-3 3.5-3 5.3-1-.6-1.6-1.7-1.8-2.8C7.6 9.3 6 11.8 6 14.7c0 3.4 2.4 5.8 6 5.8z',
    sonne: 'c:12,12,3.8|M12 3v2|M12 19v2|M3 12h2|M19 12h2|M5.6 5.6L7 7|M17 17l1.4 1.4|M5.6 18.4L7 17|M17 7l1.4-1.4',
    glocke: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z|M10 20.5a2 2 0 0 0 4 0',
    kalender: 'r:4,5.5,16,14.5,2|M4 10h16|M8.5 3.5v4|M15.5 3.5v4',
    haus: 'M4 11l8-6.5 8 6.5|M6 9.5V20h12V9.5|M10 20v-5.5h4V20',
    kopfhoerer: 'M4.5 16v-3.5a7.5 7.5 0 0 1 15 0V16|r:3.5,14.5,4,6,1.6|r:16.5,14.5,4,6,1.6',
    tropfen: 'M12 3.8s6 6.4 6 10.4a6 6 0 0 1-12 0c0-4 6-10.4 6-10.4z',
    apfel: 'M12 7.5c-1.6-1-5.6-1.4-6.6 2.3-.9 3.3.9 9.7 4.2 9.7 1.1 0 1.4-.5 2.4-.5s1.3.5 2.4.5c3.3 0 5.1-6.4 4.2-9.7-1-3.7-5-3.3-6.6-2.3z|M12 7.5c0-2 1-3.4 2.6-4',
    pinsel: 'M14.5 4.5l5 5-7.5 7.5-5-5z|M7 12l-2.6 2.6c-1.1 1.1-.9 3.6-.4 5.4 1.8.5 4.3.7 5.4-.4L12 17',
    menschen: 'c:9,8,3|M3.5 19.5c.5-3.2 2.7-5 5.5-5s5 1.8 5.5 5|c:16.5,9,2.4|M15.5 14.6c2.6-.3 4.6 1.2 5 4.4',
    kind: 'c:12,7,3.2|M6.5 20c.4-3.6 2.6-6 5.5-6s5.1 2.4 5.5 6',
    gehirn: 'M9.5 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 5 1.5V5.5a2.5 2.5 0 0 0-2-1z|M14.5 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-5 1.5',
    wind: 'M3 9h11a3 3 0 1 0-3-3|M3 13h15a3 3 0 1 1-3 3|M3 17h6',
    pflanze: 'M12 20.5V11|M12 13c0-3.5-2.5-5.5-6.5-5.5 0 3.5 2.5 5.5 6.5 5.5z|M12 11c0-3.5 2.2-6 6.5-6 0 3.8-2.4 6-6.5 6z',
    figur: 'c:12,5.5,2|M12 8v7|M12 15l-3.5 5.5|M12 15l3.5 5.5|M6.5 11l5.5-2 5.5 2',
    karte: 'r:3.5,5,17,14,2.5|M3.5 9.5h17',
    tafel: 'r:3.5,4.5,17,11.5,1.6|M12 16v4|M8.5 20.5h7',
    welle: 'M3 12c2.2-3 4.4-3 6.6 0s4.4 3 6.6 0 3.6-2.6 4.8-1.5',
    blitz: 'M13 3L5.5 13.5H12L11 21l7.5-10.5H12z',
    schild: 'M12 3.5l7 2.8v5.2c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6.3z',
    ziel: 'c:12,12,8.5|c:12,12,4.8|p:12,12,1.6',
    ballon: 'M12 15.5c3 0 5.5-3 5.5-6.3a5.5 5.5 0 0 0-11 0c0 3.3 2.5 6.3 5.5 6.3z|M12 15.5l-1 1.6h2zM12 17.1c0 1.4-1.2 1.9-1.2 3.4',
    nest: 'M3.5 12.5h17c0 4.2-3.8 7-8.5 7s-8.5-2.8-8.5-7z|M6.5 15.6l11-1.8|M8 17.8l8.5-2|c:10,9.8,2.3|c:14.4,10,2',
    sonnewolke: 'c:9,9,3|M9 3.2v1.3|M3.2 9h1.3|M4.9 4.9l.9.9|M13.1 4.9l-.9.9|M8.5 20h9a3.4 3.4 0 0 0 .4-6.8 5 5 0 0 0-9.5 1.1 2.9 2.9 0 0 0 .1 5.7z',
    aufgang: 'M3.5 17.5h17|M7 17.5a5 5 0 0 1 10 0|M12 6.5V9|M5.3 10.3l1.6 1.6|M18.7 10.3l-1.6 1.6|M8 21h8',
    laterne: 'r:6.5,6.5,11,11.5,4.5|M12 3.5v3|M10 18v2.5h4V18|M6.8 12.2h10.4',
    ohr: 'M7.5 9.5a4.7 4.7 0 0 1 9.4 0c0 3-2.6 3.9-3.4 6.3-.6 1.9-1.6 4-3.8 4A3 3 0 0 1 6.8 17|M10.4 9.9a1.9 1.9 0 0 1 3.7.4c0 1.3-1.1 1.7-1.7 2.6',
    kerze: 'r:8.5,10.5,7,10,1.5|M12 10.5V8.6|M12 8.2c-1.4-1-1.4-2.7 0-4.6 1.4 1.9 1.4 3.6 0 4.6z',
    trommel: 'M4 8.5c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z|M4 8.5v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7|M6.5 11.3L9 18|M17.5 11.3L15 18|M12 11.5v7',
    fuss: 'M9 21c-2 0-3.2-1.5-3.2-3.5 0-2.4 1.5-3.7 1.5-6.4 0-2.2-.5-3.4-.5-4.9A2.6 2.6 0 0 1 9.4 3.5c2.2 0 3 2.2 3 5 0 2.6-.9 4-.9 6.2 0 1.7 1.5 2.4 1.5 3.8 0 1.6-1.8 2.5-4 2.5z|p:15.3,5.4,1.2|p:17.4,7.4,1|p:18.5,9.9,.9|p:18.8,12.4,.8',
    kolben: 'M9.5 3.5h5|M10.5 3.5v6.2L5.5 18.2a1.5 1.5 0 0 0 1.3 2.3h10.4a1.5 1.5 0 0 0 1.3-2.3l-5-8.5V3.5|M7.6 14.6h8.8',
    korb: 'M3.5 10.5h17l-1.8 8.7a1.5 1.5 0 0 1-1.5 1.3H6.8a1.5 1.5 0 0 1-1.5-1.3z|M7.5 10.5l3-6|M16.5 10.5l-3-6|M9 13.8v3.6|M12 13.8v3.6|M15 13.8v3.6',
    feder: 'M19.5 4.5C12 4.5 6.5 9 6.5 16.5v1h1C15 17.5 19.5 12 19.5 4.5z|M4.5 19.5l10.5-10.5|M9.5 14.5h4.6|M12.3 11.6h3.4',
    lunge: 'M12 4v6.5|M12 10.5c-1 0-2-.8-2-.8|M12 10.5c1 0 2-.8 2-.8|M9.3 8C6.8 8 4.5 11.6 4.5 16c0 2.2 1.2 3.5 3 3.5 2.2 0 2.5-1.7 2.5-4V8.7a.7.7 0 0 0-.7-.7z|M14.7 8c2.5 0 4.8 3.6 4.8 8 0 2.2-1.2 3.5-3 3.5-2.2 0-2.5-1.7-2.5-4V8.7a.7.7 0 0 1 .7-.7z'
  };
  var E = {
    '✨': 'funken', '🌟': 'funken', '💫': 'funken',
    '📊': 'balken', '📈': 'balken',
    '🌙': 'mond', '🌒': 'mond', '🌛': 'mond', '🌜': 'mond', '🌘': 'mond', '🌖': 'mond',
    '🎁': 'geschenk', '💛': 'herz', '❤️': 'herz', '🧡': 'herz', '💚': 'herz', '💙': 'herz', '💜': 'herz', '🤍': 'herz', '💗': 'herz',
    '🚪': 'tuer', '📝': 'notiz', '✏️': 'notiz', '✍️': 'notiz', '😴': 'zzz', '💤': 'zzz', '☕': 'tasse', '🍵': 'tasse',
    '📖': 'buch', '📒': 'buch', '📚': 'buch', '📕': 'buch', '📘': 'buch', '📗': 'buch', '📓': 'buch',
    '🎚️': 'regler', '🎛️': 'regler', '🌊': 'wellen', '⏰': 'wecker', '⏳': 'sanduhr', '⌛': 'sanduhr', '🌫️': 'nebel',
    '🧳': 'koffer', '🎒': 'rucksack', '⭕': 'ringe', '🕐': 'uhr', '🕰️': 'uhr', '⏱️': 'uhr', '⏲️': 'uhr', '🕒': 'uhr',
    '🌸': 'bluete', '🌼': 'bluete', '🌺': 'bluete', '🪑': 'stuhl', '🌡️': 'thermo', '🪪': 'ausweis', '🐾': 'pfote',
    '🔍': 'lupe', '🔎': 'lupe', '🎓': 'hut', '🔊': 'laut', '🔈': 'laut', '🔉': 'laut', '🎵': 'laut', '🎶': 'laut',
    '🌾': 'aehre', '🌿': 'blatt', '🍃': 'blatt', '🍀': 'blatt', '🍽': 'teller', '🍽️': 'teller', '🌈': 'regenbogen',
    '🎡': 'rad', '🧭': 'kompass', '📸': 'kamera', '📷': 'kamera', '🔒': 'schloss', '🔐': 'schloss',
    '💌': 'brief', '✉️': 'brief', '📩': 'brief', '📬': 'brief', '💬': 'blase', '🗨️': 'blase', '🗣️': 'blase',
    '📞': 'telefon', '☎️': 'telefon', '📱': 'telefon', '🎬': 'klappe', '🎞️': 'klappe', '⭐': 'stern',
    '💡': 'birne', '🎲': 'wuerfel', '🦷': 'zahn', '🔥': 'flamme', '☀️': 'sonne', '🌞': 'sonne', '🌅': 'aufgang', '🌄': 'aufgang',
    '🔔': 'glocke', '📅': 'kalender', '🗓️': 'kalender', '📆': 'kalender', '🏠': 'haus', '🏡': 'haus',
    '🎧': 'kopfhoerer', '💧': 'tropfen', '🍎': 'apfel', '🍏': 'apfel', '🎨': 'pinsel', '👪': 'menschen', '👨‍👩‍👧': 'menschen',
    '🧒': 'kind', '🧠': 'gehirn', '🌬️': 'wind', '🌱': 'pflanze', '🪴': 'pflanze', '🧘': 'figur', '🤸': 'figur', '🏃': 'figur',
    '🗺️': 'karte', '🎯': 'ziel', '⚡': 'blitz', '🛡️': 'schild', '🎈': 'ballon', '🖼️': 'tafel', '🪺': 'nest', '🌤️': 'sonnewolke', '⛅': 'sonnewolke', '🏮': 'laterne', '👂': 'ohr', '🕯️': 'kerze', '🥁': 'trommel', '🦶': 'fuss', '🧪': 'kolben', '🧺': 'korb', '🪶': 'feder', '🫁': 'lunge', '🫶': 'herz', '📺': 'tafel', '🖥️': 'tafel'
  };
  var RE = /^\s*((?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|⃣|\p{Emoji_Modifier}|‍(?:\p{Extended_Pictographic}))*)\s*/u;

  function svg(name) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '1.7'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
    I[name].split('|').forEach(function (t) {
      var el, k = t.slice(0, 2), w = t.slice(2).split(',').map(Number);
      if (k === 'c:') { el = document.createElementNS(NS, 'circle'); el.setAttribute('cx', w[0]); el.setAttribute('cy', w[1]); el.setAttribute('r', w[2]); }
      else if (k === 'p:') { el = document.createElementNS(NS, 'circle'); el.setAttribute('cx', w[0]); el.setAttribute('cy', w[1]); el.setAttribute('r', w[2]); el.setAttribute('fill', 'currentColor'); el.setAttribute('stroke', 'none'); }
      else if (k === 'r:') { el = document.createElementNS(NS, 'rect'); el.setAttribute('x', w[0]); el.setAttribute('y', w[1]); el.setAttribute('width', w[2]); el.setAttribute('height', w[3]); el.setAttribute('rx', w[4] || 0); }
      else { var d = t.split('@'); el = document.createElementNS(NS, 'path'); el.setAttribute('d', d[0]); if (d[1]) el.setAttribute('transform', 'rotate(' + d[1] + ' 12 12)'); }
      s.appendChild(el);
    });
    return s;
  }
  function norm(e) { return e.replace(/️/g, ''); }
  function iconFuer(emo) {
    var n = E[emo] || E[norm(emo)] || E[norm(emo) + '️'];
    return n && I[n] ? n : null;
  }
  function badge(emo, klein) {
    var b = document.createElement('span');
    b.className = 'g9-ico' + (klein ? ' g9-ico-k' : '');
    b.setAttribute('aria-hidden', 'true');
    var n = MODUS === 'svg' ? iconFuer(emo) : null;
    if (n) { b.appendChild(svg(n)); b.setAttribute('data-g9', n); }
    else { b.classList.add('g9-emo'); b.textContent = emo; }
    return b;
  }
  function ausgeschlossen(el) { return NICHT && el.closest(NICHT); }

  function titel(h) {
    if (h.querySelector(':scope > .g9-ico') || ausgeschlossen(h)) return;
    var n = h.firstChild;
    while (n && n.nodeType === 3 && !n.data.trim()) n = n.nextSibling;
    if (!n) return;
    if (n.nodeType === 3) {
      var m = n.data.match(RE);
      if (!m || m[0].length >= n.data.length) return; // nur Emoji: nichts anfassen
      n.data = n.data.slice(m[0].length);
      h.insertBefore(badge(m[1]), n);
      h.classList.add('g9-mit-ico');
    } else if (n.nodeType === 1 && n.tagName === 'SPAN' && !n.children.length && n.nextSibling) {
      var t = n.textContent.trim(), m2 = t.match(RE);
      if (!m2 || m2[0].trim() !== t) return;
      var b = badge(m2[1]); h.replaceChild(b, n); h.classList.add('g9-mit-ico');
    }
  }
  function listenEmo(sp) {
    if (sp.classList.contains('g9-ico') || ausgeschlossen(sp)) return;
    var t = sp.textContent.trim(), m = t.match(RE);
    if (!m || m[0].trim() !== t) return;
    var b = badge(m[1], true); sp.parentNode.replaceChild(b, sp);
  }

  function inhalt(el) {
    if (el.querySelector(':scope > svg') || ausgeschlossen(el)) return;
    if (el.children.length || el.__g9i === el.textContent) return;
    var t = el.textContent.trim(), m = t.match(RE);
    var n = m && m[0].trim() === t && MODUS === 'svg' ? iconFuer(m[1]) : null;
    if (!n) { el.__g9i = el.textContent; return; }
    el.__g9i = null;
    // Das Emoji bleibt als (unsichtbarer) Text drin, falls ein Skript den Text liest
    var weg = document.createElement('span'); weg.className = 'g9-weg'; weg.textContent = el.textContent;
    el.textContent = ''; el.appendChild(svg(n)); el.appendChild(weg);
    el.classList.add('g9-ico-inhalt'); el.setAttribute('data-g9', n);
    if (!el.hasAttribute('aria-hidden') && !el.hasAttribute('aria-label')) el.setAttribute('aria-hidden', 'true');
  }

  // Bilder: weicher Platzhalter beim Laden, sanftes Einblenden
  function bild(img) {
    if (img.__g9) return; img.__g9 = 1;
    if (img.closest('.g9-ohne-lade')) return;
    if (!(img.complete && img.naturalWidth)) {
      img.classList.add('g9-laedt');
      var fertig = function () { img.classList.remove('g9-laedt'); if (img.naturalWidth) { img.classList.add('g9-da'); setTimeout(function () { img.classList.remove('g9-da'); }, 700); } };
      img.addEventListener('load', fertig, { once: true });
      img.addEventListener('error', function () { img.classList.remove('g9-laedt'); }, { once: true });
    }
  }

  var SEL_T = 'h2, h3';
  var SEL_L = '.r7-was li button > span[aria-hidden="true"]:first-child';
  function lauf() {
    geplant = 0;
    var i, l;
    l = document.querySelectorAll(SEL_T); for (i = 0; i < l.length; i++) titel(l[i]);
    l = document.querySelectorAll(SEL_L); for (i = 0; i < l.length; i++) listenEmo(l[i]);
    if (AUCH) { l = document.querySelectorAll(AUCH); for (i = 0; i < l.length; i++) inhalt(l[i]); }
    l = document.images; for (i = 0; i < l.length; i++) bild(l[i]);
  }
  var geplant = 0;
  function planen() { if (!geplant) { geplant = 1; setTimeout(function () { requestAnimationFrame(lauf); }, 120); } }

  function start() {
    document.documentElement.classList.add('g9');
    lauf();
    try { new MutationObserver(planen).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
