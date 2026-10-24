/* lieder.js – 10 neue Lieder für Kiki (wird über window.KikiLieder an SONGS angehängt; die Liederliste baut sich beim Öffnen neu).
   Melodien gemeinfrei (Volksgut bzw. 18./19. Jahrhundert). Texte: «Kuckuck» ist Volksgut, alle anderen Texte schreibt DR Lab selbst.
   Format wie in index.html: [MIDI-Ton, Silbe, Schläge (1), Atem/Zeilenende (1)]. «eigen» nutzt twinkle(): 6 Zeilen à 7 Silben. */
(function () {
  'use strict';
  var K = window.KikiLieder; if (!K || !K.songs || K.songs.some(function (s) { return s.id === 'kuckuck'; })) return;
  var SONGS = K.songs, twinkle = K.twinkle;
  var neu = [
    { id: 'kuckuck', title: 'Kuckuck, Kuckuck', sub: 'Volkslied · ruft der Frühling', ic: '🐦', bpm: 100, notes: [
      [67, 'Kuk', 2], [64, 'kuck,'], [67, 'Kuk', 2], [64, 'kuck,'], [65, "ruft's"], [64, 'aus'], [62, 'dem'], [60, 'Wald.', 3, 1],
      [62, 'Las'], [62, 'set'], [64, 'uns'], [65, 'sin', 2], [62, 'gen,', 1, 1], [64, 'tan'], [64, 'zen'], [65, 'und'], [67, 'sprin', 2], [64, 'gen!', 1, 1],
      [67, 'Früh', 2], [64, 'ling,'], [67, 'Früh', 2], [64, 'ling'], [65, 'wird'], [64, 'es'], [62, 'nun'], [60, 'bald.', 3]] },
    { id: 'mikrofon', title: 'Kikis Mikrofon', sub: 'Eigenes Lied · kurz und lustig', ic: '🎤', bpm: 110, notes: [
      [64, 'Ki'], [62, 'ki'], [60, 'hat'], [62, 'ein'], [64, 'Mi'], [64, 'kro'], [64, 'fon,', 2, 1],
      [62, 'Mi'], [62, 'kro'], [62, 'fon,', 2, 1], [64, 'Mi'], [67, 'kro'], [67, 'fon,', 2, 1],
      [64, 'Ki'], [62, 'ki'], [60, 'hat'], [62, 'ein'], [64, 'Mi'], [64, 'kro'], [64, 'fon,'],
      [64, 'das'], [62, 'klingt'], [62, 'so'], [64, 'wun'], [62, 'der'], [60, 'schön!', 4]] },
    { id: 'boot', title: 'Ruder, ruder, Boot', sub: 'Eigenes Lied · zum Schaukeln', ic: '🚣', bpm: 96, notes: [
      [60, 'Ru'], [60, 'der,'], [60, 'ru', .75], [62, 'der', .25], [64, 'Boot,', 1, 1],
      [64, 'sanft', .75], [62, 'den', .25], [64, 'Fluss', .75], [65, 'ent', .25], [67, 'lang.', 2, 1],
      [72, 'Hei', 1 / 3], [72, 'di', 1 / 3], [72, 'dei,', 1 / 3], [67, 'hei', 1 / 3], [67, 'di', 1 / 3], [67, 'dei,', 1 / 3],
      [64, 'hei', 1 / 3], [64, 'di', 1 / 3], [64, 'dei,', 1 / 3], [60, 'hei', 1 / 3], [60, 'di', 1 / 3], [60, 'dei,', 1 / 3, 1],
      [67, 'wir', .75], [65, 'sin', .25], [64, 'gen', .75], [62, 'im', .25], [60, 'Kahn.', 2]] },
    { id: 'bruecke', title: 'Über unsre Brücke', sub: 'Eigenes Lied · Melodie aus England', ic: '🌉', bpm: 104, notes: [
      [67, 'Ü', 1.5], [69, 'ber', .5], [67, 'uns'], [65, 're'], [64, 'Brü'], [65, 'cke'], [67, 'gehn,', 2, 1],
      [62, 'gross'], [64, 'und'], [65, 'klein,', 2, 1], [64, 'Hand'], [65, 'in'], [67, 'Hand,', 2, 1],
      [67, 'ü', 1.5], [69, 'ber', .5], [67, 'uns'], [65, 're'], [64, 'Brü'], [65, 'cke'], [67, 'gehn,', 2, 1],
      [62, 'wir', 2], [67, 'sind', 2], [64, 'Freun'], [60, 'de.', 3]] },
    { id: 'bauernhof', title: 'Kiki wohnt am Bauernhof', sub: 'Eigenes Lied · I-a-i-a-o', ic: '🐄', bpm: 112, notes: [
      [60, 'Ki'], [60, 'ki'], [60, 'wohnt'], [55, 'am'], [57, 'Bau'], [57, 'ern'], [55, 'hof,', 2, 1],
      [64, 'I'], [64, 'a'], [62, 'i'], [62, 'a'], [60, 'o!', 3, 1],
      [55, 'und'], [60, 'dort'], [60, 'wohnt'], [60, 'ei'], [55, 'ne'], [57, 'klei'], [57, 'ne'], [55, 'Kuh,', 2, 1],
      [64, 'I'], [64, 'a'], [62, 'i'], [62, 'a'], [60, 'o!', 3, 1],
      [60, 'Ki'], [60, 'ki'], [60, 'wohnt'], [55, 'am'], [57, 'Bau'], [57, 'ern'], [55, 'hof,', 2, 1],
      [64, 'I'], [64, 'a'], [62, 'i'], [62, 'a'], [60, 'o!', 3]] },
    { id: 'putzlied', cat: 'eigen', title: 'Kleine Kreise', sub: 'Kikis Putz-Lied · zum Zähneputzen', ic: '🪥', bpm: 100,
      notes: twinkle(['Klei-ne Krei-se hin und her,', 'Zäh-ne put-zen ist nicht schwer.', 'O-ben, un-ten, hin-ten auch,', 'Ki-ki singt mit vol-lem Bauch.', 'Klei-ne Krei-se hin und her,', 'blitz-e-blank, das freut uns sehr.']) },
    { id: 'regen', cat: 'eigen', title: 'Tropfen tanzen', sub: 'Kikis Regen-Lied', ic: '🌧️', bpm: 104,
      notes: twinkle(['Trop-fen tan-zen auf dem Dach,', 'plit-sche, plat-sche, ganz ge-mach.', 'Pfüt-zen glit-zern wie ein See,', 'Gum-mi-stie-fel, hop-pa-he!', 'Trop-fen tan-zen auf dem Dach,', 'sing mit mir, der Tag ist wach.']) },
    { id: 'freunde', cat: 'eigen', title: 'Hand in Hand', sub: 'Kikis Freunde-Lied', ic: '🤝', bpm: 100,
      notes: twinkle(['Ot-ti, No-va, Fom-pa, ich,', 'sin-gen fröh-lich nur für dich.', 'Hand in Hand und Ohr an Ohr,', 'sin-gen wir im gros-sen Chor.', 'Ot-ti, No-va, Fom-pa, ich,', 'Freun-de sind wie Son-nen-licht.']) },
    { id: 'baer', cat: 'eigen', title: 'Müde ist der kleine Bär', sub: 'Kikis Gute-Nacht-Lied · leise', ic: '🧸', bpm: 84,
      notes: twinkle(['Mü-de ist der klei-ne Bär,', 'Au-gen wer-den lang-sam schwer.', 'Ki-ki summt ein lei-ses Lied,', 'bis der Mond ins Fens-ter sieht.', 'Mü-de ist der klei-ne Bär,', 'schlaf schön, mor-gen sin-gen mehr.']) },
    { id: 'farben', cat: 'eigen', title: 'Rot und gelb und grün und blau', sub: 'Kikis Farben-Lied', ic: '🌈', bpm: 104,
      notes: twinkle(['Rot und gelb und grün und blau,', 'bun-te Far-ben, schau mal, schau!', 'Gelb die Son-ne, blau das Meer,', 'grün der Baum, ich mag ihn sehr.', 'Rot und gelb und grün und blau,', 'Re-gen-bo-gen, schau mal, schau!']) }
  ];
  neu.forEach(function (s) { SONGS.push(s); });
})();
