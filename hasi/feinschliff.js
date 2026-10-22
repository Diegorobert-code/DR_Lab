/* feinschliff.js – grafischer Feinschliff (Runde g9, 22.10.2026)
   Ändert keine Funktion. Macht nur drei Dinge, rein optisch:
   1. Emojis in Bedien-Elementen (Knöpfe, Überschriften, Kachel-Symbole) werden als feine
      Linien-Icons (inline SVG) gezeigt. Das Emoji bleibt für Vorlesehilfen unsichtbar im Text,
      textContent bleibt also gleich.
   2. Bilder, die noch laden, zeigen einen ruhigen Platzhalter und blenden danach weich ein.
   3. Leere Zustände («Noch kein …») bekommen ein kleines Symbol und eine ruhige Fläche.
   Bewegung nur ohne «Bewegung reduzieren». */
(function () {
  'use strict';
  if (window.__feinschliff) return; window.__feinschliff = true;
  var CFG = {scope:"h2,.r7-btn,.btn,.r6-k,#fbBtn,.fb-panel button,.r7-knopf,.r7-schalter,.e,nav a,.r8w-alb",skip:"[class*=nova],.sp-ton,.sp-mic,.r6-sais-e,#nda-sperre,.jk-schloss,.chip,.tinko,.glocke,.requisit,.r7-s-i,.r8-tuete-stempel,.pant-em,.r6-emo,.r4-emo,.r6-geschenk",scroller:""};
  var P = {"chat":"<path d=\"M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.9-.9L3 20.5l1.5-4.6A8.5 8.5 0 1 1 21 11.5z\"/>","phone":"<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z\"/>","atem":"<circle cx=\"9\" cy=\"14.5\" r=\"5\"/><circle cx=\"17\" cy=\"7\" r=\"3\"/><circle cx=\"18.5\" cy=\"17\" r=\"1.6\"/>","book":"<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20\"/>","speaker":"<path d=\"M11 5L6 9H2v6h4l5 4z\"/><path d=\"M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14\"/>","mute":"<path d=\"M11 5L6 9H2v6h4l5 4z\"/><path d=\"M22 9l-6 6M16 9l6 6\"/>","bell":"<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\"/><path d=\"M10.3 21a1.9 1.9 0 0 0 3.4 0\"/>","bellOff":"<path d=\"M8.7 3A6 6 0 0 1 18 8c0 2.9.5 4.9 1.1 6.3M17 17H3s3-2 3-9c0-.6.1-1.1.2-1.6M10.3 21a1.9 1.9 0 0 0 3.4 0M2 2l20 20\"/>","sos":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M14.8 9.2l3.6-3.6M5.6 18.4l3.6-3.6\"/>","sun":"<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4\"/>","leaf":"<path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z\"/><path d=\"M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12\"/>","card":"<rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2.5\"/><path d=\"M2 10h20M6 15h4\"/>","calendar":"<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2.5\"/><path d=\"M16 2v4M8 2v4M3 10h18\"/>","vibrate":"<rect x=\"7\" y=\"4\" width=\"10\" height=\"16\" rx=\"2\"/><path d=\"M3 9v6M21 9v6\"/>","moon":"<path d=\"M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z\"/>","mic":"<rect x=\"9\" y=\"2\" width=\"6\" height=\"12\" rx=\"3\"/><path d=\"M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8\"/>","clipboard":"<rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/>","mail":"<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2.5\"/><path d=\"M22 6.5l-10 7-10-7\"/>","undo":"<path d=\"M9 14L4 9l5-5\"/><path d=\"M4 9h10.5a5.5 5.5 0 0 1 0 11H11\"/>","image":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2.5\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"M21 15l-3.1-3.1a2 2 0 0 0-2.8 0L6 21\"/>","thought":"<path d=\"M7 17a4 4 0 0 1-.6-8 5.5 5.5 0 0 1 10.6-1A4.5 4.5 0 0 1 17.5 17z\"/><circle cx=\"6\" cy=\"20.5\" r=\"1\"/>","film":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2.5\"/><path d=\"M7 3v18M17 3v18M3 7.5h4M3 12h18M3 16.5h4M17 7.5h4M17 16.5h4\"/>","share":"<path d=\"M12 15V3M7 8l5-5 5 5\"/><path d=\"M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4\"/>","download":"<path d=\"M12 3v12M7 10l5 5 5-5\"/><path d=\"M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4\"/>","lock":"<rect x=\"4\" y=\"11\" width=\"16\" height=\"10\" rx=\"2\"/><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"/>","school":"<path d=\"M22 10L12 5 2 10l10 5z\"/><path d=\"M6 12v5c3 2 9 2 12 0v-5M22 10v5\"/>","ring":"<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><circle cx=\"12\" cy=\"12\" r=\"4.5\"/>","sliders":"<path d=\"M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6\"/>","pencil":"<path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z\"/>","eraser":"<path d=\"M7 21h13\"/><path d=\"M5.5 13.5l7-7a2.1 2.1 0 0 1 3 0l3 3a2.1 2.1 0 0 1 0 3L12.5 19H9z\"/>","camera":"<path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z\"/><circle cx=\"12\" cy=\"13\" r=\"3.5\"/>","package":"<path d=\"M21 8l-9-5-9 5v8l9 5 9-5z\"/><path d=\"M3 8l9 5 9-5M12 13v8M7.5 5.5l9 5\"/>","zap":"<path d=\"M13 2L3 14h9l-1 8 10-12h-9z\"/>","jar":"<path d=\"M7 2.5h10v3H7z\"/><path d=\"M6.5 5.5h11A1.5 1.5 0 0 1 19 7v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V7a1.5 1.5 0 0 1 1.5-1.5z\"/><path d=\"M5 11h14\"/>","cup":"<path d=\"M17 8h1a4 4 0 0 1 0 8h-1\"/><path d=\"M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z\"/><path d=\"M7 2v2.5M11 2v2.5M15 2v2.5\"/>","bulb":"<path d=\"M9 18h6M10 22h4\"/><path d=\"M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z\"/>","search":"<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M21 21l-4.3-4.3\"/>","coin":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M14.8 9.2A3 3 0 0 0 12 7.6c-1.7 0-3 .9-3 2.1 0 2.8 6 1.4 6 4.3 0 1.2-1.3 2.1-3 2.1a3 3 0 0 1-2.8-1.6M12 6v1.6M12 16.4V18\"/>","handshake":"<path d=\"M11 17l2 2a1.4 1.4 0 0 0 2-2\"/><path d=\"M14 14l2.5 2.5a1.4 1.4 0 0 0 2-2l-3.9-3.9a2 2 0 0 0-2.8 0l-.9.9a1.4 1.4 0 0 1-2-2l2.8-2.8a3.5 3.5 0 0 1 4-.7l.4.2a3.6 3.6 0 0 0 2.1.3L21 6\"/><path d=\"M21 3l1 11h-2M3 3L2 14l6.5 6.5a1.4 1.4 0 0 0 2-2M3 4h8\"/>","chart":"<path d=\"M3 3v18h18\"/><path d=\"M8 17v-5M13 17V8M18 17v-9\"/>","play":"<path d=\"M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z\"/>","medal":"<circle cx=\"12\" cy=\"15\" r=\"6\"/><path d=\"M8.5 10.2L6 2h4l2 5 2-5h4l-2.5 8.2M12 12.5v5\"/>","folder":"<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z\"/>","target":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>","gift":"<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7\"/><path d=\"M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5\"/>","bag":"<path d=\"M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z\"/><path d=\"M3 6h18M16 10a4 4 0 0 1-8 0\"/>","basket":"<path d=\"M5 11l4-7M19 11l-4-7\"/><path d=\"M2 11h20l-1.8 8.1A2.4 2.4 0 0 1 17.9 21H6.1a2.4 2.4 0 0 1-2.3-1.9z\"/><path d=\"M9 15v2M15 15v2\"/>","cake":"<path d=\"M20 21v-9a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9M4 16c1.3 0 2-1 4-1s2.7 1 4 1 2-1 4-1 2.7 1 4 1M2 21h20M7 7V5M12 7V5M17 7V5\"/>","heart":"<path d=\"M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z\"/>","scale":"<path d=\"M12 3v18M7 21h10M5 7h14\"/><path d=\"M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z\"/>","toolbox":"<rect x=\"2\" y=\"8\" width=\"20\" height=\"12\" rx=\"2\"/><path d=\"M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M2 13h20M10 13v2h4v-2\"/>","compass":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z\"/>","wrench":"<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z\"/>","sign":"<path d=\"M12 3v18M9 21h6M5 5.5h11l2.5 2.5L16 10.5H5zM19 12.5H8l-2.5 2.5L8 17.5h11z\"/>","pill":"<path d=\"M10.5 20.5a5 5 0 0 1-7-7l10-10a5 5 0 0 1 7 7z\"/><path d=\"M8.5 8.5l7 7\"/>","alarm":"<circle cx=\"12\" cy=\"13\" r=\"8\"/><path d=\"M12 9v4l2 2M5 3L2 6M22 6l-3-3\"/>","clock":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>","drop":"<path d=\"M12 2.7l5.7 5.7a8 8 0 1 1-11.3 0z\"/>","walk":"<circle cx=\"13\" cy=\"4\" r=\"2\"/><path d=\"M9.5 21l2.2-6.5 3.3 3V21M7 12.5l2.5-4 4-.5 3 3.5 2.5 1M11.7 14.5L13 8\"/>","door":"<path d=\"M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17\"/><path d=\"M3 21h18\"/><path d=\"M15 12h.01\" stroke-width=\"2.6\"/>","flower":"<circle cx=\"12\" cy=\"8\" r=\"2.5\"/><path d=\"M12 5.5a2.5 2.5 0 1 1 2.4 1.8 2.5 2.5 0 1 1-.9 3 2.5 2.5 0 1 1-3 0 2.5 2.5 0 1 1-.9-3A2.5 2.5 0 1 1 12 5.5z\"/><path d=\"M12 13v9M12 18c-2.5 0-4-1.2-4.5-3.5M12 19.5c2.5 0 4-1.2 4.5-3.5\"/>","music":"<path d=\"M9 18V5l12-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"16\" r=\"3\"/>","headphones":"<path d=\"M3 18v-6a9 9 0 0 1 18 0v6\"/><path d=\"M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z\"/>","user":"<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/>","users":"<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2 21a7 7 0 0 1 14 0\"/><path d=\"M16 4.2a3.5 3.5 0 0 1 0 7.6M22 21a7 7 0 0 0-4-6.3\"/>","store":"<path d=\"M3 9l1.5-5h15L21 9M4 9v11h16V9M9 20v-5h6v5\"/><path d=\"M3 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3\"/>","flame":"<path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3a2.5 2.5 0 0 0 2.5 2.3z\"/>","star":"<path d=\"M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z\"/>","sparkles":"<path d=\"M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z\"/><path d=\"M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z\"/>","home":"<path d=\"M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><path d=\"M9 22V12h6v10\"/>","pin":"<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>","check":"<path d=\"M20 6L9 17l-5-5\"/>","x":"<path d=\"M18 6L6 18M6 6l12 12\"/>","warn":"<path d=\"M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z\"/><path d=\"M12 9v4M12 17h.01\"/>","info":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 16v-4M12 8h.01\"/>","refresh":"<path d=\"M21 12a9 9 0 1 1-2.6-6.4L21 8\"/><path d=\"M21 3v5h-5\"/>","plus":"<path d=\"M12 5v14M5 12h14\"/>","trash":"<path d=\"M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6\"/>","receipt":"<path d=\"M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2z\"/><path d=\"M8 8h8M8 12h8M8 16h5\"/>","tag":"<path d=\"M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\"1.2\"/>","globe":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18\"/>","smile":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01\"/>","cards":"<rect x=\"3\" y=\"6\" width=\"12\" height=\"15\" rx=\"2\"/><path d=\"M9 3h10a2 2 0 0 1 2 2v12\"/>","wave":"<path d=\"M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8\"/><path d=\"M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15\"/>","inbox":"<path d=\"M22 12h-6l-2 3h-4l-2-3H2\"/><path d=\"M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z\"/>","chevron":"<path d=\"M9 6l6 6-6 6\"/>","carrot":"<path d=\"M2.3 21.7s9.9-3.6 12.9-6.6a4.5 4.5 0 0 0-6.4-6.4c-3 3-6.5 13-6.5 13z\"/><path d=\"M8.6 14l-2-2M10 17.5l-2.3-2.3M16 8l5-5M16 13c1.6.2 3.3-.6 5-2.6-2-1.4-3.7-1.6-5.4-.6M11 8c-.2-1.6.6-3.3 2.6-5 1.4 2 1.6 3.7.6 5.4\"/>","kind":"<circle cx=\"12\" cy=\"8\" r=\"4.5\"/><path d=\"M10.2 8.2h.01M13.8 8.2h.01M10.6 10c.8.5 2 .5 2.8 0M6 21a6 6 0 0 1 12 0\"/>","puzzle":"<path d=\"M19.4 14.6a2.4 2.4 0 1 0 0-3.2V8a1 1 0 0 0-1-1h-3.4a2.4 2.4 0 1 0-3.2 0H8.4a1 1 0 0 0-1 1v3.4a2.4 2.4 0 1 0 0 3.2V18a1 1 0 0 0 1 1h3.4a2.4 2.4 0 1 1 3.2 0h3.4a1 1 0 0 0 1-1z\"/>"};
  var M = {"💬":"chat","🗨":"chat","📞":"phone","☎":"phone","📱":"vibrate","🫧":"atem","📔":"book","📓":"book","📒":"book","📖":"book","📚":"book","🔊":"speaker","🔈":"speaker","🔉":"speaker","🔇":"mute","🔕":"bellOff","🔔":"bell","🛎":"bell","🆘":"sos","☀":"sun","🌞":"sun","🌿":"leaf","🍃":"leaf","🌱":"leaf","🍂":"leaf","💳":"card","📅":"calendar","📆":"calendar","🗓":"calendar","📳":"vibrate","🌙":"moon","🎙":"mic","🎤":"mic","📋":"clipboard","✉":"mail","💌":"mail","📧":"mail","↩":"undo","🖼":"image","💭":"thought","🎞":"film","🎬":"film","📤":"share","📥":"download","⬇":"download","💾":"download","🔒":"lock","🔐":"lock","🎓":"school","⭕":"ring","🎚":"sliders","📝":"pencil","✍":"pencil","✏":"pencil","✎":"pencil","🧽":"eraser","📷":"camera","📸":"camera","📦":"package","⚡":"zap","🫙":"jar","☕":"cup","🍵":"cup","💡":"bulb","🔍":"search","🔎":"search","🪙":"coin","🤝":"handshake","📊":"chart","📈":"chart","▶":"play","🏅":"medal","🏆":"medal","🗂":"folder","📁":"folder","🎯":"target","🎁":"gift","🛍":"bag","🧺":"basket","🛒":"basket","🎂":"cake","♡":"heart","❤":"heart","💛":"heart","💗":"heart","💖":"heart","⚖":"scale","🧰":"toolbox","🧭":"compass","🔧":"wrench","🪧":"sign","💊":"pill","⏰":"alarm","🕰":"clock","⏱":"clock","🕐":"clock","💧":"drop","🚶":"walk","🚪":"door","🌹":"flower","🌷":"flower","🌸":"flower","🌼":"flower","🎵":"music","🎶":"music","🎧":"headphones","🙋":"user","👤":"user","👪":"users","👥":"users","🏪":"store","🔥":"flame","⭐":"star","☆":"star","✨":"sparkles","🏠":"home","📍":"pin","✅":"check","✔":"check","❌":"x","✖":"x","⚠":"warn","ℹ":"info","🔄":"refresh","➕":"plus","🗑":"trash","🧾":"receipt","🏷":"tag","🌍":"globe","😄":"smile","😊":"smile","🃏":"cards","👋":"wave","🥕":"carrot","🧒":"kind","👶":"kind","🧩":"puzzle"};
  var d = document;
  var EMO = /^(\s*)((?:\p{Extended_Pictographic}|[←-⇿☀-➿])[︎️]?[\u{1F3FB}-\u{1F3FF}]?(?:‍(?:\p{Extended_Pictographic}|[♀♂])[︎️]?)*)[  ]*/u;
  var NS = 'http://www.w3.org/2000/svg';

  function icon(name) {
    var s = d.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
    s.setAttribute('class', 'fs-ic fs-ic-' + name);
    s.innerHTML = P[name];
    return s;
  }
  function basis(cl) { return Array.from(cl.replace(/[︎️‍♀♂]|[\u{1F3FB}-\u{1F3FF}]/gu, ''))[0]; }

  function ersterText(el) {
    var w = d.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      if (!n.data.trim()) continue;
      var p = n.parentNode;
      if (p && p.closest && p.closest('.fs-emo,svg,script,style')) return null;
      return n;
    }
    return null;
  }
  /* Eine Gruppe (gleiche Eltern) bleibt einheitlich: hat ein Geschwister ein Emoji ohne passendes
     Linien-Icon, bleiben alle Emojis dieser Gruppe wie sie sind. */
  function gruppeOk(el) {
    var p = el.parentElement; if (!p) return true;
    if (p.__fsG === lauf.n) return p.__fsOk;
    var ok = true;
    for (var i = 0; i < p.children.length && ok; i++) {
      var k = p.children[i]; if (k === el || k.tagName !== el.tagName) continue;
      var n = ersterText(k), m = n && EMO.exec(n.data);
      if (m && !M[basis(m[2])]) ok = false;
    }
    p.__fsG = lauf.n; p.__fsOk = ok; return ok;
  }
  function tausch(el) {
    if (CFG.skip && el.closest(CFG.skip)) return;
    var n = ersterText(el); if (!n) return;
    var m = EMO.exec(n.data); if (!m) return;
    var name = M[basis(m[2])]; if (!name || !P[name]) return;
    if (!gruppeOk(el)) return;
    var rest = n.data.slice(m[0].length);
    var sr = d.createElement('span'); sr.className = 'fs-emo'; sr.textContent = m[2] + (rest ? ' ' : '');
    var par = n.parentNode;
    par.insertBefore(icon(name), n);
    par.insertBefore(sr, n);
    if (rest) n.data = rest; else par.removeChild(n);
    el.classList.add(rest ? 'fs-mit-ic' : 'fs-nur-ic');
  }

  /* Bilder: Platzhalter beim Laden, weich einblenden */
  function bild(img) {
    if (img.__fs) return; img.__fs = 1;
    if (img.complete && img.naturalWidth) return;
    img.classList.add('fs-lade');
    function fertig() { img.classList.remove('fs-lade'); if (img.naturalWidth) img.classList.add('fs-da'); }
    img.addEventListener('load', fertig, { once: true });
    img.addEventListener('error', function () { img.classList.remove('fs-lade'); }, { once: true });
  }

  /* Leere Zustände */
  var LEER = /^(Noch (kein|keine|nichts|leer)|Keine? .{0,40}(noch|bisher|gespeichert|eingetragen)|Hier ist noch nichts)/;
  function leer(el) {
    if (el.__fsLeer || el.children.length > 3) return;
    if (CFG.leerSkip && el.closest(CFG.leerSkip)) return;
    var t = (el.textContent || '').trim();
    if (t.length < 12 || t.length > 220 || !LEER.test(t)) return;
    if (el.closest('button,a,label,select,option,summary,h1,h2,h3,[contenteditable]')) return;
    for (var i = 0; i < el.children.length; i++) if (!/^(B|I|EM|STRONG|SPAN|BR|SMALL)$/.test(el.children[i].tagName)) return;
    var pr = el.parentElement && el.parentElement.getBoundingClientRect(), er = el.getBoundingClientRect();
    if (!er.width || (pr && er.width < pr.width * 0.6)) return;
    el.__fsLeer = 1;
    var cs = getComputedStyle(el);
    if (cs.display === 'inline' || cs.position === 'absolute' || cs.position === 'fixed') return;
    var hatBox = parseFloat(cs.borderTopWidth) > 0 || (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent');
    if (hatBox) return; /* schon eigens gestaltet: so lassen */
    el.classList.add('fs-leer'); /* nur eine Klasse, der DOM bleibt unverändert */
  }
  function nochLeer(el) {
    if (LEER.test((el.textContent || '').trim())) return;
    el.classList.remove('fs-leer'); el.__fsLeer = 0;
  }

  /* Waagrecht scrollende Reihen mit Tastatur erreichbar machen */
  function scroller(el) {
    if (el.hasAttribute('tabindex') || el.scrollWidth <= el.clientWidth + 2) return;
    if (el.querySelector('a[href],button,input,select,textarea,[tabindex]')) return;
    el.setAttribute('tabindex', '0');
    if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) { el.setAttribute('role', 'region'); el.setAttribute('aria-label', CFG.scrollerLabel || 'Bilder, waagrecht blättern'); }
  }
  var LEER_SEL = 'p,div,li,span.leer,small';
  function lauf() {
    plan = 0; lauf.n = (lauf.n || 0) + 1;
    try {
      if (CFG.scope) d.querySelectorAll(CFG.scope).forEach(tausch);
      d.querySelectorAll('img').forEach(bild);
      d.querySelectorAll('.fs-leer').forEach(nochLeer);
      if (CFG.leer !== false) d.querySelectorAll(LEER_SEL).forEach(function (el) { if (!el.__fsLeer && el.firstChild) leer(el); });
      if (CFG.scroller) d.querySelectorAll(CFG.scroller).forEach(scroller);
    } catch (e) {}
  }
  var plan = 0;
  function bald() { if (!plan) plan = (window.requestAnimationFrame || setTimeout)(lauf); }
  function start() {
    lauf();
    try { new MutationObserver(bald).observe(d.body, { childList: true, subtree: true, characterData: true }); } catch (e) {}
    setTimeout(lauf, 1200);
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();
})();
