/* geschichten.js – Ottis Abenteuer: 5 Missionen im Mondschein-Wald (Texte, Szenen, Mitmach-Momente).
   Eigene Figuren und Namen. Keine Gewalt, nichts Gruseliges: gelöst wird mit Teamwork, Köpfchen, Freundlichkeit und Mut.
   Pro Bildschirm: bg (Kulisse), otti (Pose aus aura/*.webp), held/figuren (Helden und Freunde), gadget, text,
   bild (leer = gemalte Illustration später hier eintragen, Datei in abenteuer/bilder/), wahl (2 Wege) oder tippen (Mitmach-Spiel).
   Der letzte Bildschirm hat ende:true und lehre. Bildaufträge für Tinko: bildauftraege.md (gleiche Reihenfolge). */
(function () {
  "use strict";

  /* Die Figuren: unsere Freunde und die neuen Helden aus Ottis Welt */
  var FIGUREN = {
    sparky: { e: "🦊", n: "Sparky" },
    kiki: { e: "🐨", n: "Kiki" },
    zahn: { e: "🐐", n: "Zahnböcklein" },
    goldi: { e: "🐶", n: "Goldi" },
    sunny: { e: "🐉", n: "Sunny", blau: true },
    hasi: { e: "🐰", n: "Hasi" },
    /* neue Helden */
    wirbelina: { e: "👧", n: "Wirbelina", held: true, farbe: "#7fd4ff" },
    glimmbot: { e: "🤖", n: "Glimmbot", held: true, farbe: "#ffe066" },
    lunara: { e: "👸", n: "Lunara", held: true, farbe: "#ffb3e6" },
    mimi: { e: "🐱", n: "Mimi", held: true, farbe: "#ffb36b" },
    flocke: { e: "🐈", n: "Flocke" },
    knopf: { e: "🐈‍⬛", n: "Knopf" },
    /* Gäste */
    nuessli: { e: "🐿️", n: "Nüssli" },
    funkel: { e: "⭐", n: "Funkel" },
    voegel: { e: "🐦", n: "Piep-Vögel" },
    wirbel: { e: "🌀", n: "Wolkenwirbel" },
    wolke: { e: "☁️", n: "Wolkenwirbel" }
  };

  var HELDEN = [
    { k: "wirbelina", titel: "Wirbelina", kraft: "spricht mit dem Wind", gadget: "🎐 Windharfe" },
    { k: "glimmbot", titel: "Glimmbot", kraft: "Roboter-Glühwürmchen, leuchtet in allen Farben", gadget: "🗺️ Lichtkarte" },
    { k: "lunara", titel: "Prinzessin Lunara", kraft: "Erfinderin mit dem Lichtsegel-Schiff «Sternsegler»", gadget: "🧲 Stern-Magnet" },
    { k: "mimi", titel: "Kommissarin Mimi", kraft: "Chefin der Samtpfoten-Crew, hört jedes Geräusch", gadget: "🔍 Leucht-Lupe" }
  ];

  var GESCHICHTEN = [
    {
      id: "rettung", titel: "Rettung im Mondschein-Wald", icon: "🚑", farbe: "#ffd27a",
      kurz: "Das Mondschein-Team rettet Nüssli vom hohen Ast.",
      team: ["sparky", "goldi", "sunny", "hasi"],
      screens: [
        { bg: "wald", otti: "winkt", figuren: ["sparky", "goldi", "sunny", "hasi"], gadget: "📡", licht: "alarm", bild: "",
          text: "Piep, piep! Der Rettungs-Ruf blinkt. Otti springt auf. «Mondschein-Team, los geht's!»" },
        { bg: "wald", otti: "idle", held: "nuessli", oben: true, bild: "",
          text: "Oh! Nüssli, das kleine Eichhörnchen, sitzt hoch oben auf einem Ast. Es traut sich nicht hinunter." },
        { bg: "wald", otti: "idle", figuren: ["sparky", "goldi"], bild: "",
          text: "Der grosse Baum ist weit weg. Wie kommt das Team schnell hin?",
          wahl: [
            { t: "🌉 Über die Wackelbrücke", bg: "wald", otti: "lacht", held: "goldi", gadget: "🪢", bild: "",
              text: "Goldi hält das Seil ganz fest. Alle gehen langsam. Wackel, wackel … geschafft!" },
            { t: "🌿 Durch den Farn-Tunnel", bg: "wald", otti: "lacht", held: "sparky", gadget: "👃", bild: "",
              text: "Sparky schnuppert mit seiner Spürnase. «Hier lang!» Der Farn kitzelt an der Nase. Hihi!" }
          ] },
        { bg: "wald", dunkel: true, otti: "idle", figuren: ["sparky", "goldi"], bild: "",
          text: "Unter dem Baum ist es dunkel. Tipp die 5 Leuchtpilze an!",
          tippen: { n: 5, aus: "🍄", an: "🍄", art: "pilz", fertig: "Jetzt leuchtet alles. Alle sehen Nüssli!" } },
        { bg: "wald", otti: "idle", held: "hasi", gadget: "🎒", bild: "",
          text: "Hasi sagt nichts. Hasi zeigt nach oben. Dann holt Hasi ein weiches Kissen-Netz aus dem Rucksack. Gute Idee!" },
        { bg: "wald", otti: "idle", held: "sunny", figuren: ["nuessli"], licht: "funken", bild: "",
          text: "Sunny, der blaue Drache, fliegt ganz sanft hinauf. «Keine Angst, Nüssli. Ich bin bei dir.»" },
        { bg: "wald", otti: "lacht", figuren: ["sunny", "nuessli", "sparky", "goldi", "hasi"], ende: true, bild: "",
          text: "Nüssli kuschelt sich auf Sunnys Rücken. Sunny gleitet langsam hinunter. Alle jubeln!",
          lehre: "Jeder hilft mit dem, was er gut kann. Zusammen sind wir stark." }
      ]
    },
    {
      id: "gluehwurm", titel: "Die Glühwürmchen-Patrouille", icon: "✨", farbe: "#ffe066",
      kurz: "Glimmbot und Otti bringen das Licht in den Wald zurück.",
      team: ["glimmbot", "kiki", "zahn"],
      screens: [
        { bg: "wald", dunkel: true, otti: "idle", bild: "",
          text: "Heute ist der Mondschein-Wald so dunkel. Die Glühwürmchen leuchten nicht mehr. Otti macht grosse Augen." },
        { bg: "wald", dunkel: true, otti: "winkt", held: "glimmbot", gadget: "🗺️", licht: "glimm", bild: "",
          text: "Blink, blink! Da summt Glimmbot heran, das Roboter-Glühwürmchen. «Glühwürmchen-Patrouille, bereit!»" },
        { bg: "wald", dunkel: true, otti: "idle", held: "glimmbot", gadget: "🗺️", bild: "",
          text: "Glimmbot zeigt seine Lichtkarte. «Wir brauchen Mondtau. Dann leuchten alle wieder. Wo suchen wir?»",
          wahl: [
            { t: "🌸 Bei den Mondblumen", bg: "wald", otti: "lacht", held: "kiki", gadget: "🎤", licht: "funken", bild: "",
              text: "Kiki singt ein leises Lied. Die Mondblumen gehen auf. Darin glitzert der Mondtau." },
            { t: "💧 Am Silberbach", bg: "bach", otti: "lacht", held: "zahn", gadget: "💧", bild: "",
              text: "Das Zahnböcklein trippelt über die Steine. Im Bach glitzert der Mondtau wie kleine Perlen." }
          ] },
        { bg: "wald", dunkel: true, otti: "winkt", figuren: ["glimmbot"], gadget: "🫙", bild: "",
          text: "Otti füllt den Mondtau in seine Leuchtflasche. «Jetzt schnell zu den Glühwürmchen!»" },
        { bg: "wald", dunkel: true, otti: "idle", figuren: ["glimmbot"], bild: "",
          text: "Tipp jedes Glühwürmchen an. Dann bekommt es einen Tropfen Mondtau.",
          tippen: { n: 6, aus: "🐛", an: "🐛", art: "wurm", fertig: "Sie leuchten wieder! Gelb, grün und ein bisschen violett." } },
        { bg: "wald", otti: "idle", held: "glimmbot", licht: "glimm", bild: "",
          text: "Ein ganz kleines Glühwürmchen leuchtet noch schwach. Glimmbot setzt sich daneben und teilt sein Licht." },
        { bg: "wald", otti: "lacht", figuren: ["glimmbot", "kiki", "zahn"], licht: "funken", ende: true, bild: "",
          text: "Jetzt strahlen beide. Der ganze Wald glitzert wie ein Sternenhimmel.",
          lehre: "Wenn du dein Licht teilst, wird es nicht weniger. Es wird mehr." }
      ]
    },
    {
      id: "sternsegler", titel: "Lunara und der Sternsegler", icon: "⛵", farbe: "#ffb3e6",
      kurz: "Mit dem Lichtsegel-Schiff zur Wolkeninsel.",
      team: ["lunara", "goldi", "hasi"],
      screens: [
        { bg: "wald", otti: "idle", held: "lunara", gadget: "⛵", licht: "funken", bild: "",
          text: "Ein Licht landet auf der Lichtung. Es ist ein Schiff mit Segeln aus Licht! Prinzessin Lunara winkt." },
        { bg: "wald", otti: "winkt", held: "lunara", figuren: ["goldi", "hasi"], bild: "",
          text: "«Ich bin Lunara. Ich tüftle gern.» Sie zeigt nach oben. «Der kleine Stern Funkel ist vom Himmel gepurzelt!»" },
        { bg: "himmel", otti: "idle", held: "lunara", gadget: "⛵", bild: "",
          text: "Der Sternsegler braucht Sternenkraft. Tipp die 5 Sterne an!",
          tippen: { n: 5, aus: "⭐", an: "⭐", art: "stern", fertig: "Die Segel leuchten. Der Sternsegler hebt ab!" } },
        { bg: "himmel", otti: "lacht", figuren: ["lunara", "goldi", "hasi"], bild: "",
          text: "Welchen Weg fliegen wir zur Wolkeninsel?",
          wahl: [
            { t: "☁️ Durch die Wolkenkissen", bg: "himmel", otti: "lacht", held: "goldi", bild: "",
              text: "Plopp, plopp! Das Schiff hüpft weich durch die Wolken. Goldi wedelt vor Freude." },
            { t: "🌈 Über den Regenbogen", bg: "regenbogen", otti: "lacht", held: "lunara", bild: "",
              text: "Das Schiff gleitet über den Regenbogen. Unten leuchten alle Farben. Otti staunt." }
          ] },
        { bg: "insel", otti: "idle", held: "funkel", klein: true, bild: "",
          text: "Da ist die Wolkeninsel. Funkel sitzt am Rand. Sein Licht ist ganz klein. «Ich finde nicht mehr heim.»" },
        { bg: "insel", otti: "idle", held: "hasi", gadget: "🧲", figuren: ["lunara", "funkel"], bild: "",
          text: "Hasi zeigt auf den Stern-Magneten. Lunara nickt. «Super Idee, Hasi!» Klick! Funkel schwebt sanft an Bord." },
        { bg: "himmel", otti: "lacht", held: "funkel", figuren: ["lunara", "goldi", "hasi"], licht: "funken", ende: true, bild: "",
          text: "Funkel saust zurück an den Himmel und blinkt dreimal: Danke!",
          lehre: "Wer tüftelt und nicht aufgibt, findet einen Weg." }
      ]
    },
    {
      id: "samtpfoten", titel: "Die Samtpfoten-Crew", icon: "🔍", farbe: "#ffb36b",
      kurz: "Ein Detektiv-Fall: Wo ist Kikis Glöckchen?",
      team: ["mimi", "flocke", "knopf", "kiki"],
      screens: [
        { bg: "baumhaus", otti: "idle", held: "kiki", gadget: "🔔", bild: "",
          text: "Oh nein! Kikis goldenes Glöckchen ist weg. Ohne Glöckchen klingt Kikis Abendlied nur halb so schön." },
        { bg: "baumhaus", otti: "lacht", held: "mimi", figuren: ["flocke", "knopf"], gadget: "🔍", bild: "",
          text: "Miau! Drei Kätzchen rollen herein. «Wir sind die Samtpfoten-Crew! Kommissarin Mimi, Flocke und Knopf.»" },
        { bg: "wald", otti: "idle", figuren: ["mimi", "flocke", "knopf"], bild: "",
          text: "Mimis Schnurrhaar-Radar piepst. Hier gibt es Spuren! Tipp die 4 Spuren an.",
          tippen: { n: 4, aus: "🐾", an: "🔍", art: "spur", fertig: "Vier Spuren gefunden! Mimi macht sich Notizen." } },
        { bg: "wald", otti: "idle", held: "mimi", figuren: ["flocke", "knopf"], bild: "",
          text: "Die Spuren gehen in zwei Richtungen. Welcher Spur folgen wir?",
          wahl: [
            { t: "🐾 Den kleinen Krallen", bg: "wald", otti: "idle", held: "flocke", bild: "",
              text: "Flocke schleicht ganz leise. Die kleinen Krallen-Spuren gehen den Baum hinauf." },
            { t: "✨ Der Glitzer-Spur", bg: "wald", otti: "idle", held: "knopf", licht: "funken", bild: "",
              text: "Knopf schnuppert. Die Glitzer-Spur führt zu einem Nest hoch oben im Baum." }
          ] },
        { bg: "wald", otti: "lacht", held: "voegel", oben: true, gadget: "🔔", bild: "",
          text: "Im Nest sitzen drei kleine Vögel. Und mittendrin: das goldene Glöckchen!" },
        { bg: "wald", otti: "idle", held: "mimi", figuren: ["voegel"], bild: "",
          text: "«Wir wollten nur das schöne Klingeln hören», piepsen die Vögel. Mimi lächelt. «Dann fragen wir doch Kiki.»" },
        { bg: "baumhaus", otti: "lacht", held: "kiki", figuren: ["voegel", "mimi", "flocke", "knopf"], gadget: "🎶", ende: true, bild: "",
          text: "Kiki singt ein Lied für alle. Die Vögel dürfen jeden Abend zuhören. Fall gelöst!",
          lehre: "Wer freundlich fragt statt schimpft, findet zusammen eine Lösung." }
      ]
    },
    {
      id: "wolkenwirbel", titel: "Helden und der Wolkenwirbel", icon: "🦸", farbe: "#b484ff",
      kurz: "Das Superhelden-Team beruhigt den Wolkenwirbel.",
      team: ["wirbelina", "glimmbot", "lunara", "kiki", "sunny"],
      screens: [
        { bg: "sturm", otti: "idle", held: "wirbel", oben: true, licht: "wind", bild: "",
          text: "Huiii! Ein grosser Wolkenwirbel dreht sich über dem Mondschein-Wald. Die Blätter tanzen wild herum." },
        { bg: "sturm", otti: "winkt", figuren: ["wirbelina", "glimmbot", "lunara"], licht: "funken", bild: "",
          text: "Otti ruft die Helden. Da kommen Wirbelina, Glimmbot und Prinzessin Lunara. «Helden-Team, los!»" },
        { bg: "sturm", otti: "idle", held: "wirbelina", gadget: "🎐", licht: "wind", bild: "",
          text: "Wirbelina kann mit dem Wind sprechen. Sie hört gut zu. «Der Wolkenwirbel ist nicht böse. Er ist nur ganz aufgeregt.»" },
        { bg: "sturm", otti: "idle", figuren: ["wirbelina", "kiki", "sunny"], bild: "",
          text: "Wie helfen wir ihm, ruhig zu werden?",
          wahl: [
            { t: "🎶 Kiki singt ein Lied", bg: "sturm", otti: "idle", held: "kiki", gadget: "🎤", licht: "glimm", bild: "",
              text: "Kiki singt ganz leise. Glimmbot blinkt im Takt. Der Wolkenwirbel hört zu." },
            { t: "🌬️ Alle atmen tief", bg: "sturm", otti: "idle", held: "sunny", bild: "",
              text: "Alle atmen ein … und langsam wieder aus. Sunny pustet ganz sanft mit. Der Wirbel wird langsamer." }
          ] },
        { bg: "sturm", otti: "idle", figuren: ["wirbelina", "sunny"], bild: "",
          text: "Tipp die 5 kleinen Wirbel an. Jeder wird eine weiche Wolke.",
          tippen: { n: 5, aus: "🌀", an: "☁️", art: "wirbel", fertig: "Alle kleinen Wirbel sind jetzt weiche Wolken." } },
        { bg: "himmel", otti: "lacht", held: "wolke", oben: true, bild: "",
          text: "Der Wolkenwirbel gähnt. Jetzt ist er eine grosse, kuschelige Wolke. «Danke», flüstert er." },
        { bg: "wald", otti: "lacht", figuren: ["wirbelina", "glimmbot", "lunara", "kiki", "sunny"], licht: "funken", ende: true, bild: "",
          text: "Die Sterne kommen wieder heraus. Alle Helden geben sich ein High five.",
          lehre: "Auch ein Sturm wird ruhig, wenn jemand freundlich zuhört." }
      ]
    }
  ];

  window.OTTI_ABENTEUER = { FIGUREN: FIGUREN, HELDEN: HELDEN, GESCHICHTEN: GESCHICHTEN };
})();
