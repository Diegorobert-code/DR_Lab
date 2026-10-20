/* Mama Affe – Bereich als eigenständiges Modul (Stand 19.10.2026)
   Die App selbst ist mama-affe/index.html; dieses Skript baut den ganzen Inhalt.

   Einbinden:
     <link rel="stylesheet" href="../mama-affe/bereich.css">   (sonst lädt das Modul es selbst)
     <div data-mama-affe></div>
     <script src="../mama-affe/bereich.js" defer></script>
   Oder von Hand: MamaAffe.mount(element, {eingebettet:true})

   Alles bleibt auf dem Gerät (localStorage, Schlüssel «mamaaffe.*»). Keine Konten.
   Mit Sense Engine (nova/nova.js, eigener Server) spricht Mama Affe mit ihrer Figurenstimme,
   ohne Server mit der Handystimme. Lern-Zahlen gehen nur mit Häkchen an den Server, nie Texte,
   nie Stimme, nie Bild.
   Rote Linie: Mama Affe ist keine Ärztin. Keine Diagnose, keine Therapie, keine Medikamenten-
   empfehlung. Sie erklärt, ermutigt und zeigt den Weg zu Fachpersonen. */
(function(){
'use strict';
if(window.MamaAffe) return;
const ME = document.currentScript;
const BASE = (ME && ME.src) ? new URL('.', ME.src).href : '';
const FIG = BASE + 'figur.jpg';
const ICON = BASE + 'icon-192.png';
const LINK = p => { try{ return new URL(p, BASE || location.href).href; }catch(e){ return p; } };

function ensureCss(){
  if(document.querySelector('link[data-ma-css]') || [...document.styleSheets].some(s=>{ try{ return /mama-affe\/bereich\.css|(^|\/)bereich\.css/.test(s.href||''); }catch(e){ return false; } })) return;
  const l = document.createElement('link'); l.rel='stylesheet'; l.href = BASE + 'bereich.css'; l.setAttribute('data-ma-css','1');
  document.head.appendChild(l);
}

/* Persönlichkeit für Sense Engine (Nova-Knopf in der App). Ergänzt nova/seelen.js, ohne es zu ändern. */
const SEELE =
  'Du bist Mama Affe, eine warme Orang-Utan-Mutter von DR Lab (Diego Robert, Zürich), mit einem Kompass statt Arztkittel. ' +
  'Du sprichst ruhig, warm und kurz, ohne grosse Versprechen. Schreib Hochdeutsch mit «ss», nie «ß». Höchstens eine Rückfrage aufs Mal. ' +
  'Du begleitest Eltern und Kinder von 1 bis 16: Erziehung, Lernen, Körpergefühl (Affenfüsse, Grounding, Atem), Schlaf. ' +
  'Haltung: Stärken zuerst, kein Defizitbild («lernt anders», «braucht Bewegung», nie «Störung» oder «Problem-Kind»). ' +
  'Jedes Thema beginnst du mit dem grossen Ganzen (Landkarte), dann ein kleiner nächster Schritt. ' +
  'Du fragst wie im Körperkosmos: Was ist gerade? Was braucht es gerade? Was brauchst du? ' +
  'Du bist keine Ärztin: keine Diagnose, keine Therapie, du rätst weder zu noch von Medikamenten ab; du hilfst, Fragen für die Fachperson vorzubereiten. ' +
  'Bei Gefahr, Gewalt, Selbstverletzung oder Krise nennst du sofort 147 (Pro Juventute), 144 (Notruf) und den Elternnotruf 0848 35 45 55. ' +
  'Mit Kindern: ganz kurze Sätze, verspielt, du lobst Mut und Dranbleiben, nicht Klugheit. Du fragst nie nach Adresse, Schule oder Fotos.';
function addSeele(){ try{ if(window.NOVA_SEELEN && !window.NOVA_SEELEN['Mama Affe']) window.NOVA_SEELEN['Mama Affe'] = SEELE; }catch(e){} }

/* ---------- Speicher (nur Gerät) ---------- */
const store = {
  get(k, d){ try{ const v = localStorage.getItem('mamaaffe.'+k); return v===null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('mamaaffe.'+k, JSON.stringify(v)); }catch(e){} },
  del(k){ try{ localStorage.removeItem('mamaaffe.'+k); }catch(e){} }
};
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function dayKey(d){ d = d || new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
const reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------- Daten ---------- */
const AGES = [ {k:'1-3', l:'1–3 J.'}, {k:'3-6', l:'3–6 J.'}, {k:'6-12', l:'6–12 J.'}, {k:'12-16', l:'12–16 J.'} ];
const HELP = [
  {n:'Pro Juventute (für Kinder und Jugendliche)', t:'147', d:'Gratis, rund um die Uhr, auch Chat auf 147.ch'},
  {n:'Elternnotruf', t:'0848 35 45 55', d:'Rund um die Uhr, für Eltern unter Druck'},
  {n:'Sanitätsnotruf', t:'144', d:'Bei Lebensgefahr, Verletzung, akuter Krise'},
  {n:'Tox Info Suisse', t:'145', d:'Wenn etwas verschluckt oder getrunken wurde'},
  {n:'Dargebotene Hand (für dich)', t:'143', d:'Wenn du selbst jemanden zum Reden brauchst'},
  {n:'Polizei', t:'117', d:'Bei Gewalt oder wenn jemand in Gefahr ist'},
  {n:'Opferhilfe Schweiz', t:'142', d:'Nach Gewalt, rund um die Uhr, gratis und vertraulich, auch für Kinder und Eltern'}
];
/* «Was ist heute los?» – Inhalte nach Forschung (zweistein/mama-aff-forschung.md) */
const SITUATIONS = [
 {id:'wut', e:'🌋', l:'Wutanfall',
  behind:'Wut ist ein Gefühl, das zu gross für den kleinen Körper ist. Oft stecken Müdigkeit, Hunger, ein Übergang (aufhören, losgehen) oder ein Nein dahinter.',
  normal:{'1-3':'Mit 1–3 Jahren sind Wutanfälle sehr häufig. Das Hirn für Bremsen reift erst langsam.','3-6':'Mit 3–6 werden sie seltener, kommen aber bei Müdigkeit zurück. Worte für Gefühle helfen jetzt viel.','6-12':'Im Schulalter zeigt sich Wut oft nach einem langen Tag. Das Kind hat sich in der Schule zusammengerissen.','12-16':'Bei Jugendlichen gehört Reizbarkeit oft zur Entwicklung. Wichtig ist, dass die Beziehung hält.'},
  try:'Erst ruhig werden, dann reden: «Du bist ganz wütend. Ich bleibe da.» Wenig Worte, tief ausatmen, später über die Grenze sprechen.',
  body:'Gemeinsam schwer werden wie ein Bär, Füsse in den Boden drücken, lang ausatmen.', bodyGo:'baer',
  when:'Wenn Wut oft mit Verletzungen endet, über Wochen sehr häufig ist oder du selbst nicht mehr kannst: Kinderarzt, Erziehungsberatung oder Elternnotruf.'},
 {id:'schlaf', e:'🌙', l:'Schlaf',
  behind:'Kinder brauchen viel Schlaf und einen gleichen Ablauf am Abend. Bildschirme, Aufregung und spätes Licht machen das Einschlafen schwer.',
  normal:{'1-3':'1–2 Jahre: 11–14 Stunden pro Tag inklusive Mittagsschlaf. Nachts aufwachen kommt noch oft vor.','3-6':'3–5 Jahre: 10–13 Stunden. Ängste in der Nacht sind in diesem Alter häufig.','6-12':'6–12 Jahre: 9–12 Stunden. Ein fester Ablauf hilft mehr als jede Strafe.','12-16':'Jugendliche: 8–10 Stunden. Die innere Uhr verschiebt sich nach hinten, das ist biologisch, nicht faul.'},
  try:'Jeden Abend der gleiche Ablauf mit 4–6 Schritten (Bad, Zähne, Geschichte, Kuscheln, Licht). Bildschirme 1 Stunde vorher weg.',
  body:'Im Bett: Füsse spüren, Bär schläft ein, drei lange Ausatmer.', bodyGo:'baer',
  when:'Lautes Schnarchen mit Atempausen, starke Müdigkeit am Tag oder Ängste über Wochen: Kinderarzt.',
  link:'schlaf'},
 {id:'baby', e:'👶', l:'Baby weint viel',
  behind:'Viel Weinen ist in den ersten Monaten häufig. Es hat oft den Höhepunkt mit 6–8 Wochen und wird bis 3–4 Monate meist besser.',
  normal:{'1-3':'Bei Babys unter 4 Monaten ist viel Weinen am späten Nachmittag und Abend häufig.','3-6':'Dieses Thema gilt vor allem für Babys.','6-12':'Dieses Thema gilt vor allem für Babys.','12-16':'Dieses Thema gilt vor allem für Babys.'},
  try:'Reize weniger machen (dunkel, ruhig), Körperkontakt, Tragen, gleichmässige Bewegung. Und Pausen für dich.',
  body:'Deinen eigenen Atem verlangsamen. Ein ruhiger Körper hilft dem Baby, ruhig zu werden.',
  when:'Sofort zum Kinderarzt oder Notfall, wenn das Baby anders weint als sonst (schrill, schwach), Fieber hat (unter 3 Monaten immer), schlecht trinkt oder apathisch ist. Mütter- und Väterberatung der Gemeinde ist gratis. Ein Schrei- und Schlaf-Protokoll hilft beim Gespräch.',
  sos:true, proto:'weinen'},
 {id:'grenzen', e:'🚧', l:'Grenzen und Nein',
  behind:'Kinder testen Grenzen, weil sie die Welt verstehen wollen. Klare, wenige Regeln geben Sicherheit.',
  normal:{'1-3':'«Nein» ist eines der ersten wichtigen Wörter. Das Kind entdeckt: Ich bin jemand eigenes.','3-6':'Diskutieren und Verhandeln beginnt. Kurze, gleichbleibende Regeln helfen.','6-12':'Fairness wird wichtig. Regeln gemeinsam festlegen wirkt besser als Befehle.','12-16':'Jugendliche brauchen mehr Mitsprache und trotzdem einen Rahmen.'},
  try:'Ein Satz, ruhig wiederholen: «Ich verstehe, dass du willst. Und die Antwort ist nein.» Dann zwei gute Möglichkeiten anbieten. Dazu täglich 5 Minuten «Kind-Zeit»: das Kind bestimmt das Spiel, du machst mit, beschreibst und lobst, ohne Fragen und ohne Anweisungen. So wird das Nein leichter angenommen.',
  body:'Vor dem Nein selbst Füsse spüren, Schultern sinken lassen.', bodyGo:'wurzeln',
  when:'Wenn Konflikte den ganzen Familienalltag bestimmen: Erziehungsberatung (in vielen Gemeinden gratis).'},
 {id:'geschwister', e:'👫', l:'Geschwisterstreit',
  behind:'Streit unter Geschwistern ist normal und ein Übungsfeld für das Leben. Oft geht es um Aufmerksamkeit und Gerechtigkeit.',
  normal:{'1-3':'Kleine Kinder können noch kaum teilen. Das kommt später.','3-6':'Streit um Spielsachen ist sehr häufig.','6-12':'Fairness wird wichtig, Vergleiche tun weh.','12-16':'Jugendliche brauchen eigenen Raum.'},
  try:'Nicht Richterin sein, sondern Moderatorin: «Ihr beide wollt das Gleiche. Was könnt ihr machen?» Jedem Kind jeden Tag 10 Minuten nur für sich.',
  body:'Bei Streit: alle drei lange Ausatmer, dann reden.', bodyGo:'atem',
  when:'Wenn ein Kind dauerhaft Angst vor dem anderen hat oder verletzt wird: Beratung holen.'},
 {id:'hausaufgaben', e:'📚', l:'Hausaufgaben',
  behind:'Nach der Schule ist der Kopf oft voll. Viele Kinder brauchen zuerst Bewegung und das grosse Ganze, bevor sie Details lernen.',
  normal:{'1-3':'In diesem Alter gibt es noch keine Hausaufgaben. Spielen ist Lernen.','3-6':'Im Kindergarten wird gespielt, nicht gebüffelt.','6-12':'Kurze Blöcke (10–15 Min.) mit Bewegungspausen wirken besser als eine lange Sitzung.','12-16':'Selbst planen lernen: planen, tun, zurückschauen.'},
  try:'Zuerst die Landkarte: «Was ist heute alles zu tun?» Dann klein anfangen, kurze Blöcke, nach jedem Block bewegen. Sich selbst abfragen statt nochmals lesen.',
  body:'Vorher 1 Minute ankommen: Füsse spüren, lang ausatmen. Erst ankommen, dann lernen.',
  when:'Wenn Lesen, Schreiben oder Rechnen trotz Üben über Monate sehr schwer bleibt: mit der Lehrperson reden, Schulpsychologischer Dienst oder Logopädie. Farbfolien und «Wundermittel» sind nicht belegt; was hilft, ist kurzes, angepasstes Üben mit Erklärung.',
  link:'schule', proto:'lernen'},
 {id:'bildschirm', e:'📱', l:'Bildschirm',
  behind:'Bildschirme sind spannend gebaut. Kinder können schwer selbst aufhören. Gemeinsame Regeln helfen allen.',
  normal:{'1-3':'Unter 2 Jahren besser kein Bildschirm (WHO). 2–4 Jahre höchstens 1 Stunde, gemeinsam.','3-6':'Kurz und gemeinsam schauen ist besser als allein und lang.','6-12':'Feste Zeiten und bildschirmfreie Orte (Tisch, Schlafzimmer) helfen.','12-16':'Mitreden lassen: gemeinsam einen Familien-Medienplan machen.'},
  try:'Vorher ankündigen: «Noch 5 Minuten, dann ist Schluss.» Zum Schluss etwas Schönes ohne Bildschirm anbieten. Selbst Vorbild sein.',
  body:'Nach dem Bildschirm: Affenfüsse oder Überkreuz-Gehen, damit der Körper wieder ankommt.', bodyGo:'kreuz',
  when:'Wenn Schlaf, Schule oder Freundschaften stark leiden: Beratung holen.'},
 {id:'konzentration', e:'🎢', l:'Mal so, mal so',
  behind:'Kinder haben kein festes Niveau, sondern eine Spannweite. An guten Tagen zeigen sie, was sie können. Müde fallen sie zurück. Beides ist echt.',
  normal:{'1-3':'Mal genial, mal ganz Kind: das ist in diesem Alter ganz normal.','3-6':'Die Bremse im Kopf (Aufmerksamkeit, Impulse) reift langsam bis ins junge Erwachsenenalter.','6-12':'Kurze Aufgaben, sofortige Rückmeldung und Bewegung helfen vielen Kindern.','12-16':'Selbststeuerung lässt sich üben: planen, Fokus-Timer, zurückschauen.'},
  try:'Statt «Konzentrier dich!»: «Wie ist dein Kopf heute? Rakete, Velo oder Schnecke?» Die Aufgabe an den Tag anpassen. Was Eltern am meisten hilft: vorher ankündigen («In 5 Minuten machen wir…»), feste Abläufe, und Gelungenes sofort benennen («Du bist drangeblieben, super»). Das macht den Alltag leichter, ersetzt aber keine Abklärung.',
  body:'Bewegungspause nach jedem Block. Viele Kinder denken besser, wenn der Körper sich bewegt.', bodyGo:'kreuz',
  when:'Wenn Unruhe oder Ablenkbarkeit in Schule UND Familie über Monate stark belasten: Kinderarzt oder Schulpsychologischer Dienst. Mama Affe stellt keine Diagnose.',
  proto:'lernen'},
 {id:'anders', e:'🦄', l:'Lernt anders',
  behind:'Manche Kinder denken anders: zuerst das grosse Ganze, dann die Details. Wenn die Schule nur Details gibt, wird es langweilig oder anstrengend. Das Kind ist nicht doof, es ist so. Oft steckt viel Kraft darin, die noch keinen Platz hatte.',
  normal:{'1-3':'Neugier ist riesig. Das Kind lernt durch Spielen und Forschen.','3-6':'Viele «Warum?»-Fragen: das sind die genialen Momente.','6-12':'Langeweile ist oft ein Zeichen, dass die Aufgabe nicht passt (zu leicht, zu klein, ohne Sinn).','12-16':'Sinn wird wichtig: Wofür lerne ich das?'},
  try:'Stärken zuerst: «Was kannst du besonders gut?» Zuerst die Landkarte zeigen, dann die Details. Und der Satz, den viele als Kind gebraucht hätten: «Du hast eine andere Form von Intelligenz. Du musst zuerst das grosse Ganze sehen, dann kommen die Details von selbst.»',
  body:'Vor dem Lernen kurz bewegen, damit Kopf und Körper ankommen.', bodyGo:'kreuz',
  when:'Wenn Langeweile zu Rückzug oder Traurigkeit führt: mit der Lehrperson und dem Schulpsychologischen Dienst reden.',
  kid:'staerken'},
 {id:'angst', e:'🌀', l:'Ängste und Grübeln',
  behind:'Ängste gehören zum Grosswerden. Manche Kinder haben Gedanken, die immer wiederkommen und sie quälen, oder müssen Dinge immer gleich machen (z. B. waschen, kontrollieren, zählen), damit die Angst kleiner wird. Solche Muster werden oft erst nach Jahren erkannt. Früh hinschauen lohnt sich.',
  normal:{'1-3':'Fremdeln und Trennungsangst sind normal.','3-6':'Angst vor Monstern und der Dunkelheit ist häufig. Rituale helfen.','6-12':'Sorgen um Schule und Freunde kommen. Kurze Rituale sind normal.','12-16':'Grübeln kann zunehmen. Reden hilft.'},
  try:'Zuhören ohne kleinzureden: «Das fühlt sich schwer an. Ich bin da.» Nicht beim Ritual mitmachen müssen, aber freundlich bleiben.',
  body:'Langes Ausatmen, Füsse spüren, ein Satz: «Ich bin hier, jetzt.»', bodyGo:'atem',
  when:'Wenn Gedanken oder Rituale viel Zeit kosten (mehr als eine Stunde am Tag), das Kind sehr leidet oder der Alltag stockt: Kinderarzt oder kinder- und jugendpsychiatrischer Dienst. Das lässt sich gut behandeln, die Familie wird mit einbezogen. Mama Affe stellt keine Diagnose.',
  proto:'angst'},
 {id:'koerpergrenzen', e:'🫶', l:'Mein Körper gehört mir',
  behind:'Kinder lernen über den eigenen Körper: was sich gut anfühlt, was nicht, und dass sie Nein sagen dürfen. Das schützt sie und macht sie stark.',
  normal:{'1-3':'Kleine Kinder zeigen mit dem Körper, was sie wollen. Wegdrehen ist auch ein Nein.','3-6':'Jetzt kann das Kind Worte lernen: «Stopp, das will ich nicht.»','6-12':'Das Kind will mehr Privatsphäre (Bad, Umziehen). Das ist gesund.','12-16':'Der Körper verändert sich. Respekt vor dem Raum der Jugendlichen ist wichtig.'},
  try:'Vor jeder Berührung (auch bei Körperübungen, Kitzeln, Massage): «Darf ich?» Ein Nein gilt sofort. «Dein Körper gehört dir.»',
  body:'Gemeinsam Füsse finden: jeder spürt seine eigenen Füsse. Berührung nur, wenn das Kind Ja sagt.', bodyGo:'wurzeln',
  when:'Wenn ein Kind sich plötzlich stark verändert, Angst vor einer Person hat oder etwas erzählt, das dich beunruhigt: 147 (auch für Eltern), Kinderschutzgruppe des Kinderspitals, Opferberatung. Bei Gefahr 117 oder 144.'},
 {id:'trennung', e:'🏠', l:'Trennung',
  behind:'Eine Trennung verändert alles für das Kind. Es braucht die Sicherheit, dass beide Eltern es lieben und dass es nicht schuld ist.',
  normal:{'1-3':'Kleine Kinder brauchen gleiche Abläufe in beiden Wohnungen.','3-6':'Kinder denken oft, sie seien schuld. Sag deutlich: Du bist nicht schuld.','6-12':'Kinder wollen nicht zwischen den Eltern stehen.','12-16':'Jugendliche wollen mitreden, wo sie wohnen.'},
  try:'«Wir sind beide immer für dich da. Du bist nicht schuld.» Nie schlecht über den anderen Elternteil vor dem Kind reden.',
  body:'Ein gleiches Abendritual in beiden Wohnungen gibt Halt.',
  when:'Familienberatung, Kinder- und Jugendhilfe der Gemeinde.'},
 {id:'teen', e:'💛', l:'Erste Liebe und Rückzug',
  behind:'Jugendliche ziehen sich zurück, um sich selbst zu finden. Das ist gesund. Gleichzeitig brauchen sie Eltern, die da bleiben. Viele holen keine Hilfe, aus Scham oder weil sie denken, sie müssten es allein schaffen.',
  normal:{'1-3':'Dieses Thema gilt vor allem für Jugendliche.','3-6':'Dieses Thema gilt vor allem für Jugendliche.','6-12':'Ab 10–12 beginnt die Pubertät. Gefühle werden stärker.','12-16':'Rückzug, erste Liebe, Stimmungsschwankungen gehören dazu.'},
  try:'Nebenbei reden (im Auto, beim Kochen), nicht verhören. «Ich bin da, wenn du reden willst.» Und ohne Scham über Hilfe reden: «Hilfe holen ist stark.»',
  body:'Für Jugendliche: Sparky (Human Sparks) zeigt Körperübungen für mehr Ruhe.',
  when:'Wenn Rückzug sehr lange dauert, Schlaf und Essen sich stark verändern oder es Gedanken an Selbstverletzung gibt: sofort Hilfe holen (147, Kinderarzt, 144 im Notfall).'}
];
const ALTER = {
 '1-3':{t:'1–3 Jahre: kleine Forscherin, kleiner Forscher',
   g:['Das Kind testet die Welt wie eine Wissenschaftlerin: Hypothesen, ausprobieren, staunen.','«Mal genial, mal ganz Kind»: das Kind kann es, aber noch nicht immer.','Sprache explodiert. Viel reden, benennen, singen.'],
   a:['Geführtes Spiel: das Kind führt, du gibst Rahmen und gute Fragen.','Bildschirm sparsam (unter 2 J. besser keiner). Mama Affe ist in diesem Alter für dich da, nicht fürs Kind.','Füsse barfuss, klettern, balancieren: der Körper lernt mit.']},
 '3-6':{t:'3–6 Jahre: Fragen über Fragen',
   g:['Viele «Warum?»-Fragen: das sind die genialen Momente.','Gefühle bekommen Worte. Fantasie ist riesig.','Die Bremse im Kopf reift langsam.'],
   a:['Den genialen Moment aufgreifen: «Wie bist du darauf gekommen?»','Anstrengung loben, nicht Klugheit: «Du hast lange probiert.»','Kurze Spiele mit Bewegung, höchstens 10 Minuten.']},
 '6-12':{t:'6–12 Jahre: Schule und Freundschaften',
   g:['Lesen, Schreiben, Rechnen werden wichtig (Lehrplan 21).','Fairness und Freundschaften zählen viel.','Unterschiedliche Tagesform ist normal.'],
   a:['Kurze Blöcke, sich selbst abfragen, über Tage verteilen.','Zuerst die Landkarte, dann die Details.','Stärken sichtbar machen, nicht nur Fehler.']},
 '12-16':{t:'12–16 Jahre: sich selbst finden',
   g:['Der Körper verändert sich, die innere Uhr verschiebt sich nach hinten.','Selbststeuerung lässt sich üben: planen, tun, zurückschauen.','Freunde werden oft wichtiger als Eltern.'],
   a:['Mitreden lassen, Rahmen halten.','Nebenbei reden statt verhören.','Schlaf schützen: Handy nachts ausserhalb des Zimmers.']}
};
/* Körper: Kinderübungen (Affenfüsse, Grounding, Gehen) und Übungen für Eltern (leichte Beine).
   Muster aus dem Körperkosmos: Wecken, Öffnen, Loslassen, Bewegen, Nachspüren. */
const BODY = [
 {id:'faecher', e:'🦶', l:'Fächer', d:'Zehen ganz weit spreizen wie ein Fächer. Halten, 1, 2, 3, 4, 5. Lösen. Noch einmal!', s:40},
 {id:'yoga', e:'👣', l:'Zehen-Yoga', d:'Nur die grosse Zehe hebt sich, die kleinen bleiben am Boden. Jetzt umgekehrt: die kleinen hoch, die grosse bleibt unten.', s:45},
 {id:'kino', e:'🎬', l:'Zehen-Kino', d:'Augen zu. Beweg jede Zehe nur in Gedanken, von der grossen bis zur kleinen. Nichts tun, nur vorstellen. So findet dein Kopf die Zehen.', s:30},
 {id:'klavier', e:'🎹', l:'Klavier', d:'Alle Zehen hoch. Jetzt einzeln absetzen, von klein nach gross, wie auf einem Klavier. Erst nur vorstellen, dann mit dem Finger helfen. Was noch nicht einzeln geht, darf mit dem Nachbarn mitgehen.', s:60, hints:true},
 {id:'griff', e:'🐒', l:'Affengriff', d:'Heb mit den Zehen eine Socke oder einen Stift auf und leg ihn in eine Schale. Wie ein Affe! Erst rechts, dann links.', s:60},
 {id:'wurzeln', e:'🌳', l:'Wurzeln', d:'Steh barfuss, Knie weich. Stell dir vor, aus deinen Füssen wachsen Wurzeln tief in den Boden. Spür den Boden.', s:30},
 {id:'kreuz', e:'🚶', l:'Überkreuz-Gehen', d:'Geh langsam durchs Zimmer. Bei jedem Schritt geht die Hand zum anderen Knie: rechte Hand, linkes Knie. Dann linke Hand, rechtes Knie.', s:45},
 {id:'dschungel', e:'🌴', l:'Dschungel-Gang', d:'Wir gehen wie Mama Affe durch den Dschungel: Ferse, Kante, Zeh. Die grosse Zehe drückt ab. Rechter Fuss und linker Arm schwingen zusammen.', s:45},
 {id:'zehenlang', e:'🐾', l:'Lange Zehen', d:'Geh durchs Zimmer und lass die Zehen lang und weit. Nicht krallen! Spür, wie jede Zehe den Boden berührt.', s:30},
 {id:'barfuss', e:'🌾', l:'Barfuss-Pfad', d:'Leg ein Kissen, ein Tuch und ein Brett hintereinander. Geh barfuss darüber. Wie fühlt sich jeder Boden an? Draussen geht es mit Gras, Sand und Holz.', s:45},
 {id:'baer', e:'🐻', l:'Bär und Feder', d:'Werde ganz schwer wie ein schlafender Bär. Alles sinkt nach unten. Und jetzt ganz leicht wie eine Feder. Und wieder schwer.', s:40},
 {id:'loewe', e:'🦁', l:'Kiefer-Löwe', d:'Mund ganz weit auf wie ein gähnender Löwe. Aaah! Jetzt den Kiefer ganz locker hängen lassen.', s:25},
 {id:'baum', e:'🌲', l:'Baum im Wind', d:'Knie weich, und schwing ganz leicht wie ein Baum im Wind. Nur so weit, wie der Boden antwortet.', s:30},
 {id:'becken', e:'🪑', l:'Becken-Schaukel', d:'Setz dich auf einen Stuhl, Füsse am Boden. Schaukel dein Becken ganz sanft vor und zurück, wie ein kleines Boot. Dann still sitzen und spüren.', s:40, ab:'6-12'},
 {id:'atem', e:'🎈', l:'Grosser Atem', d:'Einatmen durch die Nase. Und ganz lang ausatmen, wie wenn du eine Feder wegpustest. Noch zweimal.', s:30},
 /* Für Eltern: Leichte Beine (Wirbelsäule und Beine zusammen) */
 {id:'kippen', e:'🌊', l:'Kippen und Fangen', d:'Aufrecht stehen. Aus den Fussgelenken nach vorne kippen, bis ein Schritt kommen muss. Weich in die Knie fangen, hochdrücken, Oberkörper zum vorderen Bein drehen, zurück. Je Seite fünfmal.', s:60, adult:true},
 {id:'rollen', e:'🐚', l:'Abrollen', d:'Knie weich. Wirbel für Wirbel nach unten rollen, hängen, ausatmen. Wirbel für Wirbel hoch, oben auf die Zehenspitzen.', s:60, adult:true},
 {id:'federn', e:'🪶', l:'Federn', d:'Auf den Fussballen klein federn, Knie weich, Arme locker, Wirbelsäule lang.', s:30, adult:true},
 {id:'pendel', e:'🕰️', l:'Pendelbein', d:'Auf einem Bein stehen, Hand an der Wand. Das andere Bein locker aus der Hüfte pendeln, der Gegenarm schwingt mit. Je Bein zehnmal.', s:60, adult:true},
 {id:'spirale', e:'🌀', l:'Spiralschritt', d:'Langsam gehen. Bei jedem Schritt die Brust zum vorderen Bein drehen. Zehn Schritte, dann stehen, Füsse spüren, lang ausatmen.', s:45, adult:true}
];
const KLAVIER_HILFEN = ['Vorstellung: Augen zu, jede Zehe nur in Gedanken bewegen.','Antippen: die Zehe vorher kurz mit dem Finger berühren. So findet sie das Gehirn.','Festhalten: die anderen Zehen mit der Hand am Boden halten, nur eine darf hoch.','Klein anfangen: zuerst nur grosse und kleine Zehe. Die mittleren kommen später.','Langsam: 1 Millimeter bewusst ist besser als 1 Zentimeter mit allen.','Hand zeigt vor: die Bewegung erst mit den Fingern, dann sofort mit dem Fuss.'];
const RUNS = {
  affenfuesse:{l:'Affenfüsse-Runde', e:'🐒', list:['faecher','yoga','klavier','griff','wurzeln'], af:true},
  grounding:{l:'Grounding-Reihe', e:'🌳', list:['faecher','loewe','baer','dschungel','atem'], phases:['Wecken','Öffnen','Loslassen','Bewegen','Nachspüren']},
  gehen:{l:'Im Gehen üben', e:'🌴', list:['dschungel','zehenlang','kreuz','barfuss','wurzeln']},
  abend:{l:'Ruhig werden', e:'🌙', list:['baer','loewe','atem'] },
  beine:{l:'Leichte Beine', e:'🌊', list:['kippen','rollen','federn','pendel','spirale'], adult:true}
};
const RHYME = 'Zehli-zehli, eins und zwei, Ferse, Kante, Zeh vorbei. Rechter Fuss und linke Hand, so läuft Mama Affe durchs Land. Uga-uga, Wurzel-Bein, Affenfüsse, die sind mein!';
const ANIMALS = [
 {e:'🐻', n:'Bär', m:'Ruhe und Kraft. Heute darfst du langsam sein.', go:'baer'},
 {e:'🦌', n:'Hirsch', m:'Neubeginn. Heute probierst du etwas Neues.', go:'dschungel'},
 {e:'🦅', n:'Adler', m:'Weitblick. Heute schaust du zuerst aufs grosse Ganze.', go:'baum'},
 {e:'🐺', n:'Wolf', m:'Mut. Heute traust du dich etwas.', go:'wurzeln'},
 {e:'🦁', n:'Löwe', m:'Herz. Heute bist du lieb zu dir und anderen.', go:'loewe'},
 {e:'🦧', n:'Orang-Utan', m:'Neugier. Heute kletterst du auf eine neue Idee.', go:'griff'}
];
const RITUAL = [
 {e:'🛁', l:'Waschen oder Bad'}, {e:'🪥', l:'Zähne putzen'}, {e:'👕', l:'Pyjama anziehen'},
 {e:'🦶', l:'Füsse spüren, Bär schläft'}, {e:'📖', l:'Gute-Nacht-Geschichte'}, {e:'🤗', l:'Kuscheln'}, {e:'💡', l:'Licht aus'}
];
const WONDER = [
 'Warum ist der Himmel blau?', 'Wohin geht die Sonne in der Nacht?', 'Warum haben Orang-Utans so lange Arme?',
 'Wie weiss ein Vogel, wohin er fliegen muss?', 'Warum träumen wir?', 'Was wäre, wenn Bäume reden könnten?',
 'Warum ist das Meer salzig?', 'Wie viele Sterne gibt es?', 'Warum müssen wir schlafen?', 'Was macht ein Herz den ganzen Tag?',
 'Warum können Affen mit den Füssen greifen und wir fast nicht?', 'Wie spürt eine Zehe den Boden?'
];
const MIRRORS = [
 'Was gehört nicht mehr zu dir?', 'Was will dich das lehren?', 'Was kommt immer wieder?',
 'Mit wem vergleichst du dich?', 'Wovor fürchtest du dich, und was gibt dir Vertrauen?'
];
const LETTERS = [
 {w:'Affe', e:'🦧'},{w:'Banane', e:'🍌'},{w:'Ei', e:'🥚'},{w:'Fisch', e:'🐟'},{w:'Haus', e:'🏠'},{w:'Igel', e:'🦔'},
 {w:'Katze', e:'🐱'},{w:'Löwe', e:'🦁'},{w:'Mond', e:'🌙'},{w:'Nase', e:'👃'},{w:'Ofen', e:'🔥'},{w:'Rakete', e:'🚀'},
 {w:'Sonne', e:'☀️'},{w:'Tomate', e:'🍅'},{w:'Uhr', e:'⏰'},{w:'Wal', e:'🐳'},{w:'Zebra', e:'🦓'},{w:'Gabel', e:'🍴'},
 {w:'Delfin', e:'🐬'},{w:'Pilz', e:'🍄'}
];
const STRENGTHS = [
 {k:'ideen', e:'💡', l:'Ideen haben'}, {k:'schnell', e:'⚡', l:'Schnell denken'}, {k:'bewegen', e:'🤸', l:'Bewegen'},
 {k:'tiere', e:'🐾', l:'Tiere verstehen'}, {k:'bauen', e:'🧱', l:'Bauen'}, {k:'erzaehlen', e:'🗣️', l:'Erzählen'},
 {k:'helfen', e:'🤝', l:'Helfen'}, {k:'fragen', e:'❓', l:'Fragen stellen'}, {k:'malen', e:'🎨', l:'Malen'},
 {k:'musik', e:'🎵', l:'Musik'}, {k:'lachen', e:'😄', l:'Andere zum Lachen bringen'}, {k:'durchhalten', e:'🧗', l:'Dranbleiben'}
];
const SAETZE = [
 'Du hast eine andere Form von Intelligenz. Zuerst das grosse Ganze, dann kommen die Details.',
 'Du bist nicht doof. Du bist so. Und so ist gut.',
 'Du hast lange probiert. Das ist stark.',
 'Wie bist du darauf gekommen?',
 'Ich bin da, wenn du reden willst.',
 'Du bist nicht schuld.',
 'Dein Körper gehört dir. Darf ich?',
 'Heute ist ein Schnecken-Tag. Das ist in Ordnung.',
 'Hilfe holen ist stark.'
];
const PROTO_ARTEN = [ {k:'schlaf', e:'🌙', l:'Schlaf'}, {k:'weinen', e:'😢', l:'Weinen'}, {k:'wut', e:'🌋', l:'Wut'},
  {k:'angst', e:'🌀', l:'Angst / Ritual'}, {k:'lernen', e:'📚', l:'Lernen'}, {k:'koerper', e:'🦶', l:'Körper'}, {k:'anderes', e:'📝', l:'Anderes'} ];
const ARZT_FRAGEN = [
 'Ist das für das Alter normal?', 'Was können wir zu Hause ausprobieren?', 'Ab wann sollten wir genauer hinschauen?',
 'Wie läuft eine gute Abklärung ab, und wer macht sie?', 'Wie wird die Familie einbezogen?',
 'Was spricht für, was gegen Medikamente? (Frage an die Ärztin. Mama Affe rät weder zu noch ab.)',
 'Wer kann uns noch helfen (Schule, Beratung, Therapie)?'
];

/* Wissen kurz erklärt (Forschung zweistein/mama-aff-forschung.md). Stärken zuerst, keine Diagnose, Weg zu Fachpersonen. */
const WISSEN = [
 {k:'adhs', e:'🎢', l:'Aufmerksamkeit und Unruhe', ganz:'Manche Kinder haben einen Kopf wie ein Radio mit vielen Sendern gleichzeitig. Aufmerksamkeit, Pausen und Bremsen reifen bei ihnen später. Das hat nichts mit Faulheit oder schlechter Erziehung zu tun. Man nennt das manchmal ADHS, abklären können das nur Fachpersonen.',
  staerke:['Viel Energie und Begeisterung','Ideen, die anderen nicht einfallen','Mut, Neues auszuprobieren','Ganz tief drin sein, wenn etwas wirklich interessiert'],
  alltag:['Kurze Aufgaben, dann bewegen (Fokus-Timer im Schulhaus)','Abläufe ankündigen und gleich halten','Gelungenes sofort benennen, Fehler ruhig erklären','Eine Sache nach der anderen, Tisch frei räumen'],
  wann:'Wenn es zuhause, in der Schule und mit Freunden über Monate schwierig ist und das Kind darunter leidet: Kinderärztin, Schulpsychologischer Dienst oder kinder- und jugendpsychiatrischer Dienst. Ob Medikamente passen, entscheidet ihr zusammen mit der Ärztin. Mama Affe rät weder zu noch ab.', sit:'konzentration'},
 {k:'lesen', e:'📖', l:'Lesen und Schreiben fällt schwer', ganz:'Lesen heisst: Buchstaben in Laute übersetzen und schnell zusammenhängen. Bei manchen Kindern braucht dieser Weg viel länger, auch wenn sie klug sind und wunderbar erzählen.',
  staerke:['Erzählen und Fantasie','Bilder, Räume, Bauen','Zusammenhänge sehen'],
  alltag:['Jeden Tag kurz statt einmal lang (Lese-Zimmer: Buchstabe und Laut)','Vorlesen und abwechselnd lesen','Hörbücher zählen auch','Nicht alles rot anstreichen, das Gelungene zeigen'],
  wann:'Wenn das Lesen nach dem ersten Schuljahr kaum vorwärtskommt oder das Kind die Schule meidet: mit der Lehrperson reden, Schulpsychologischer Dienst, Logopädie (über die Schule).', room:'lesen'},
 {k:'rechnen', e:'🔢', l:'Rechnen fällt schwer', ganz:'Zahlen sind für das Gehirn zuerst Mengen: drei Bananen, fünf Finger. Manche Kinder brauchen länger, bis Menge, Zahl und Zeichen zusammenpassen.',
  staerke:['Geduld mit Dingen, die man anfassen kann','Sprache und Erzählen','Kreative Lösungswege'],
  alltag:['Mit Dingen rechnen: Löffel, Steine, Treppenstufen','Punkte statt nur Zahlen (Rechen-Zimmer)','Kleine Schritte, jede Stufe darf wiederholt werden','Im Alltag zählen: einkaufen, backen, Tisch decken'],
  wann:'Wenn Mengen und Zahlen bis 10 auch nach dem ersten Schuljahr unsicher bleiben: Lehrperson, Schulpsychologischer Dienst.', room:'rechnen'},
 {k:'zwang', e:'🌀', l:'Gedanken, die immer wiederkommen', ganz:'Fast alle Kinder haben Rituale und Sorgen. Bei manchen werden daraus Gedanken, die immer wiederkommen und Angst machen, oder Handlungen, die immer gleich sein müssen (waschen, kontrollieren, zählen). Oft weiss das Kind selbst, dass es «komisch» ist, und schämt sich. Es ist nicht verrückt und nicht schuld.',
  staerke:['Sorgfalt und Genauigkeit','Grosses Verantwortungsgefühl','Feine Wahrnehmung'],
  alltag:['Ruhig zuhören, nicht auslachen, nicht schimpfen','Nicht selbst beim Ritual mitmachen müssen, aber freundlich bleiben','Beobachten: wie oft, wie lange, was half (Notiz «Angst / Ritual»)','Zusammen lachen, spielen, sich bewegen'],
  wann:'Wenn Gedanken oder Rituale mehr als eine Stunde am Tag brauchen, das Kind stark leidet oder der Alltag stockt: Kinderärztin oder kinder- und jugendpsychiatrischer Dienst. Es gibt gute Hilfe, und früh ist sie leichter.', sit:'angst', proto:'angst'},
 {k:'gross', e:'🦄', l:'Schnell, gelangweilt, «zu viel»', ganz:'Manche Kinder denken schnell und in grossen Bildern. Läuft der Unterricht in kleinen Schritten, schalten sie ab oder stören. Sie brauchen zuerst das grosse Ganze, dann kommen die Details von selbst. Das ist eine andere Form von Intelligenz.',
  staerke:['Grosse Zusammenhänge sehen','Viele Fragen','Eigene Wege finden'],
  alltag:['Zuerst die Landkarte: worum geht es, wozu braucht man das','Eigene Fragen erlauben (Staun-Zimmer)','Schwierige Aufgaben als Abenteuer anbieten','Mit der Lehrperson über passende Zusatzaufgaben reden'],
  wann:'Wenn das Kind lange unglücklich ist, nicht mehr zur Schule will oder sich zurückzieht: Lehrperson, Schulpsychologischer Dienst.', sit:'anders'},
 {k:'jugend', e:'💛', l:'Was Jugendlichen oft fehlt', ganz:'In der Jugend baut das Gehirn um. Gefühle sind schneller als die Bremse. Jugendliche brauchen mehr Schlaf, als sie bekommen, Bewegung, Zugehörigkeit und Erwachsene, die da bleiben, auch wenn die Tür zu ist.',
  staerke:['Mut und Gerechtigkeitssinn','Eigene Ideen','Tiefe Freundschaften'],
  alltag:['Genug Schlaf, Handy über Nacht nicht im Zimmer','Bewegung und draussen sein','Zuhören, ohne gleich Ratschläge zu geben','Etwas Sinnvolles tun dürfen: Verantwortung, Hobby, kleiner Job','Sagen: «Hilfe holen ist stark.»'],
  wann:'Wenn Rückzug lange dauert, Schlaf und Essen sich stark ändern oder es Gedanken an Selbstverletzung gibt: sofort 147 oder Kinderärztin, bei Gefahr 144.', sit:'teen'}
];
const SIT_KW = {
 wut:['wut','tobt','ausraster','haut ','schlägt um sich','explodiert','zornig'],
 schlaf:['schlaf','schläft','aufwach','ins bett','einschlaf','nachts'],
 baby:['baby','säugling','schreibaby','koliken','weint die ganze','weint viel','stillen'],
 grenzen:['nein sagt','hört nicht','grenze','trotz','regeln','gehorcht'],
 geschwister:['geschwister','bruder','schwester','eifersüchtig'],
 hausaufgaben:['hausaufgabe','aufgaben','prüfung','test ','noten','üben'],
 bildschirm:['handy','bildschirm','tablet','gamen','game','youtube','tiktok','fernseh'],
 konzentration:['konzentr','unruhig','zappel','adhs','vergisst','träumt','ablenk','chaos'],
 anders:['lernt anders','langweil','faul','dumm','doof','hasst die schule','will nicht in die schule','versteht nicht'],
 angst:['angst','grübel','sorge','ritual','zwang','kontrolliert','wäscht','immer wieder','gedanken'],
 koerpergrenzen:['körper gehört','berühr','anfassen','küssen','nackt'],
 trennung:['trennung','scheidung','zwei wohnungen','getrennt','wochenende beim'],
 teen:['verliebt','zieht sich zurück','rückzug','pubertät','teenager','zimmer zu','redet nicht mehr']
};
const KRISE_RE = /(suizid|selbstmord|umbringen|sterben will|will sterben|nicht mehr leben|ritzt|ritzen|verletzt sich|schlägt mich|schlägt mein kind|schlägt uns|gewalt|missbrauch|missbraucht|vergewaltig|geschüttelt|schütteln|bewusstlos|vergiftet|verschluckt|atmet nicht|blutet)/;
const PARENT_TABS = [
 {k:'heute', e:'🧭', l:'Heute'}, {k:'alter', e:'🌱', l:'Alter'}, {k:'fuerdich', e:'🧡', l:'Für dich'},
 {k:'wissen', e:'📖', l:'Wissen'}, {k:'momente', e:'✨', l:'Momente'}, {k:'schlaf', e:'🌙', l:'Schlaf'}, {k:'hilfe', e:'🆘', l:'Hilfe'}
];
const KID_TABS = [
 {k:'schule', e:'🏫', l:'Schule'}, {k:'koerper', e:'🦶', l:'Körper'}, {k:'staerken', e:'💪', l:'Stärken'}, {k:'tier', e:'🐻', l:'Tier'}, {k:'abend', e:'🌙', l:'Abend'}
];
const PROPS = {winkt:'👋', denkt:'💭', jubelt:'⭐', schlaeft:'💤', atmet:'🍃', turnt:'🦶', zeigt:'👉'};

/* KI-Verse: das Schulhaus von Mama Affe in der Nachtwelt (Pinien, Mond, leuchtende Fenster) */
const HOUSE = `<svg class="house" viewBox="0 0 320 120" aria-hidden="true">
 <circle cx="282" cy="24" r="14" fill="#f5d68a" opacity=".9"/>
 <path d="M0 110 Q80 84 160 98 T320 92 V120 H0Z" fill="#1a2552"/>
 <path d="M20 108 l12 -34 l12 34z M42 104 l10 -28 l10 28z M262 104 l12 -36 l12 36z M286 106 l9 -26 l9 26z" fill="#173a3a"/>
 <path d="M110 62 L160 28 L210 62 Z" fill="#e8be5c"/>
 <rect x="118" y="62" width="84" height="44" rx="4" fill="#2b336b" stroke="#e8be5c" stroke-width="2"/>
 <rect class="win" x="128" y="72" width="16" height="14" rx="3" fill="#f5d68a"/>
 <rect class="win" x="176" y="72" width="16" height="14" rx="3" fill="#f5d68a" style="animation-delay:1.3s"/>
 <rect x="152" y="82" width="16" height="24" rx="3" fill="#e9894a"/>
 <text x="160" y="54" text-anchor="middle" font-size="12" fill="#1a1530" font-weight="700">🦧</text>
</svg>`;

/* ================================================================ */
function mount(root, opts){
  opts = opts || {};
  if(!root || root.__ma) return root && root.__ma;
  ensureCss();
  const eingebettet = opts.eingebettet !== undefined ? !!opts.eingebettet : (root.getAttribute('data-mama-affe') !== 'standalone');
  root.classList.add('ma'); if(eingebettet) root.classList.add('eingebettet'); else root.classList.add('voll');
  const stars = Array.from({length:40},()=>`<i style="left:${(Math.random()*100).toFixed(1)}%;top:${(Math.random()*70).toFixed(1)}%;animation-delay:${(Math.random()*3).toFixed(2)}s"></i>`).join('');
  root.innerHTML = `<div class="ma-sky" aria-hidden="true"><div class="moon"></div>${stars}</div><div class="wrap" data-ma-app></div><nav class="tabs hide" data-ma-tabs><div class="in" data-ma-tabsin></div></nav><div class="toast" data-ma-toast role="status" aria-live="polite"></div>`;
  const $ = s => root.querySelector(s);
  const app = $('[data-ma-app]');

  let state = { age: store.get('age', '6-12'), voice: store.get('voice', true), mood: null, kidName: store.get('kidName', '') };
  function toast(t){ const el=$('[data-ma-toast]'); el.textContent=t; el.classList.add('on'); clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('on'),2200); }

  /* ---------- Lernen: Zahlen nur auf dem Gerät ---------- */
  function learn(){ return store.get('learn', {start:dayKey(), lesenOk:0, lesenAll:0, rechnenOk:0, rechnenAll:0, uebungen:0, runden:0, rooms:{}, moods:[], sit:{}, lvl:null}); }
  function learnUp(fn){ const l = learn(); fn(l); store.set('learn', l); }

  /* ---------- Stimme: Figurenstimme über Sense Engine, sonst Handy ---------- */
  let VOICE = null;
  function pickVoice(){
    if(!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    VOICE = vs.find(v=>/de-CH/i.test(v.lang)) || vs.find(v=>/de/i.test(v.lang) && /Anna|Petra|Helena|Marlene|female/i.test(v.name)) || vs.find(v=>/^de/i.test(v.lang)) || null;
  }
  if('speechSynthesis' in window){ pickVoice(); try{ speechSynthesis.addEventListener('voiceschanged', pickVoice); }catch(e){} }
  function say(t){
    if(!state.voice || !t) return;
    const N = window.NovaStimme;
    try{ if(N && N.aktiv && N.aktiv()){ N.sprich(t, {figur:'mama affe'}); return; } }catch(e){}
    if(!('speechSynthesis' in window)) return;
    try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); if(VOICE) u.voice = VOICE; u.lang = VOICE ? VOICE.lang : 'de-CH'; u.rate = .95; u.pitch = 1.1; speechSynthesis.speak(u); }catch(e){}
  }
  function stopSay(){ try{ if(window.NovaStimme) NovaStimme.stopp(); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} }

  /* ---------- Trickfilm-Bühne ---------- */
  /* Posen-Bilder: liegen sie in mama-affe/posen/<pose>.jpg und stehen in posen/posen.json, nimmt die Bühne sie automatisch. */
  const POSEN_BILD = {};
  try{ fetch(BASE+'posen/posen.json', {cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{ ((j&&j.posen)||[]).forEach(n=>{ if(!PROPS[n]) return; const im=new Image(); im.onload=()=>{ POSEN_BILD[n]=im.src; const a=$('[data-ma-actor]'); if(a && a.classList.contains(n)){ const i=a.querySelector('.body img'); if(i) i.src=im.src; } }; im.src=BASE+'posen/'+n+'.jpg'; }); }).catch(()=>{}); }catch(e){}
  const bildFuer = p => POSEN_BILD[p] || FIG;
  function stage(pose, text, sz){
    return `<div class="stage"><div class="actor ${pose}" style="--sz:${sz||170}px" data-ma-actor><div class="glow"></div><div class="shadow"></div><div class="body"><img src="${bildFuer(pose)}" alt="Mama Affe"></div><span class="prop" data-ma-prop>${PROPS[pose]||''}</span></div>
      ${text?`<div class="bubble" data-type="${esc(text)}">${reduced?esc(text):''}</div>`:''}</div>`;
  }
  function pose(p, ms){
    const a = $('[data-ma-actor]'); if(!a) return;
    const old = a.className; a.className = 'actor ' + p; const pr = a.querySelector('[data-ma-prop]'); if(pr) pr.textContent = PROPS[p]||'';
    const im = a.querySelector('.body img'); const oldSrc = im ? im.getAttribute('src') : ''; if(im) im.setAttribute('src', bildFuer(p));
    if(ms){ setTimeout(()=>{ if(a.isConnected){ a.className = old; if(pr) pr.textContent = PROPS[old.replace('actor','').trim()]||''; if(im) im.setAttribute('src', oldSrc); } }, ms); }
  }
  function typeBubbles(){
    if(reduced) return;
    root.querySelectorAll('.bubble[data-type]').forEach(b=>{
      const full = b.getAttribute('data-type'); b.removeAttribute('data-type'); let i = 0;
      b.innerHTML = '<span></span><i class="cur"></i>'; const sp = b.firstChild;
      const t = setInterval(()=>{ if(!b.isConnected){ clearInterval(t); return; } i += 2; sp.textContent = full.slice(0,i); if(i>=full.length){ clearInterval(t); const c=b.querySelector('.cur'); if(c) c.remove(); } }, 22);
      timers.push(t);
    });
  }
  function haptic(p){ try{ if(navigator.vibrate && !reduced) navigator.vibrate(p); }catch(e){} }
  function celebrate(){
    haptic([20,40,20]);
    if(reduced) return;
    const c = document.createElement('div'); c.className='confetti';
    c.innerHTML = Array.from({length:18},()=>`<i style="left:${Math.random()*100}%;animation-delay:${(Math.random()*.6).toFixed(2)}s">${['⭐','🍌','✨','🌟','🦶'][Math.floor(Math.random()*5)]}</i>`).join('');
    root.appendChild(c); setTimeout(()=>c.remove(), 2600);
  }

  /* ---------- Navigation ---------- */
  let mode = store.get('mode', null); // 'eltern' | 'kind' | null
  let view = mode==='kind' ? 'schule' : 'heute';
  function tabs(){
    const nav = $('[data-ma-tabs]'), inn = $('[data-ma-tabsin]');
    if(!mode){ nav.classList.add('hide'); return; }
    nav.classList.remove('hide');
    const list = mode==='eltern' ? PARENT_TABS : KID_TABS;
    inn.innerHTML = list.map(t=>`<button class="${view===t.k||view.startsWith(t.k+':')?'sel':''}" data-go="${t.k}"><span class="e">${t.e}</span>${t.l}</button>`).join('');
  }
  function toTop(){
    if(!eingebettet){ window.scrollTo(0,0); return; }
    try{ const r = root.getBoundingClientRect(); if(r.top < 0) root.scrollIntoView({block:'start'}); }catch(e){}
  }
  function go(v){ stopSay(); clearTimers(); view = v; render(); toTop(); }
  function topBar(title){
    return `<header class="top"><img src="${FIG}" alt=""><div class="t">${esc(title)}</div>
    ${mode==='kind' ? `<button class="iconbtn" data-go="schule" aria-label="Zur Landkarte">🗺️</button>` : ''}
    <button class="iconbtn" data-act="voice" aria-label="Stimme">${state.voice?'🔊':'🔇'}</button>
    ${mode==='kind' ? `<button class="iconbtn hold" data-hold="home" aria-label="Für Eltern lange drücken">🏠<span class="bar"></span></button>` : `<button class="iconbtn" data-act="home" aria-label="Start">🏠</button>`}</header>`;
  }
  const FOOT = `<div class="foot">🧭 Mama Affe ist keine Ärztin. Sie erklärt, ermutigt und zeigt den Weg zu Fachpersonen.<br>Alles bleibt auf deinem Gerät.</div>`;
  let timers = [];
  function clearTimers(){ timers.forEach(t=>{clearInterval(t);clearTimeout(t);}); timers=[]; }
  function later(fn, ms){ const t = setTimeout(fn, ms); timers.push(t); return t; }
  const ageChips = () => `<div class="row ma-alter" style="margin:8px 0">${AGES.map(a=>`<button class="chip ${state.age===a.k?'sel':''}" data-age="${a.k}">${a.l}</button>`).join('')}</div>`;

  /* ---------- Bildschirme Eltern ---------- */
  function vHome(){
    const hour = new Date().getHours();
    const hi = hour<11 ? 'Guten Morgen!' : hour<18 ? 'Hallo!' : 'Guten Abend!';
    const satz = SAETZE[new Date().getDate() % SAETZE.length];
    // Runde 3: kurz, ein klarer erster Schritt. Ton erst nach Tipp auf Mama Affe (kein Ton beim Öffnen).
    return `<div class="scene ma-start">${stage('winkt', hi+' Ich bin Mama Affe. Für wen ist es heute?')}
     <div style="text-align:center"><button class="compass" data-act="obStart">🧭 So begleite ich euch</button></div>
     <div class="grid ma-wahl">
      <button class="tile gross" data-mode="eltern"><span class="e">🧭</span><span class="l">Für Eltern</span><span class="small muted">Was ist heute los?</span></button>
      <button class="tile gross" data-mode="kind"><span class="e">🏫</span><span class="l">Für Kinder</span><span class="small muted">Das Schulhaus</span></button>
     </div>
     <h2 class="ma-h-alter">Wie alt ist dein Kind?</h2>${ageChips()}
     ${state.age==='1-3'?`<p class="small muted">Mit 1–3 Jahren ist Mama Affe vor allem für dich da. Fürs Kind: Füsse, Spiel und Stimme, kaum Bildschirm.</p>`:''}
     <div class="ma-hilfe">
      <button class="btn red block" data-sos="1">💛 Ich kann nicht mehr</button>
      <button class="btn alt block" data-mode="eltern" data-to="hilfe">🆘 Hilfe sofort · 147 · 144 · Elternnotruf</button>
     </div>
     <div class="card soft"><div class="k small muted">Satz des Tages</div><p style="font-weight:700">«${esc(satz)}»</p><button class="chip" data-say="${esc(satz)}">🔊 Vorlesen</button></div>
     ${FOOT}</div>`;
  }
  function vHeute(){
    const l = learn(); const top = Object.entries(l.sit||{}).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>SITUATIONS.find(s=>s.id===x[0])).filter(Boolean);
    return topBar('Was ist heute los?') + `<div class="scene">
     <div class="map"><div class="k">Das grosse Ganze</div>Erst hinschauen, dann handeln. Drei Fragen helfen immer:
     <div class="steps"><span>1. Was ist gerade?</span><span>2. Was braucht es gerade?</span><span>3. Was brauchst du?</span></div></div>
     <div class="card"><h3>💬 Erzähl Mama Affe, was los ist</h3>
      <textarea id="ma-erz" rows="3" maxlength="600" placeholder="z. B. «Mein Sohn tobt jeden Abend beim Zähneputzen»"></textarea>
      <div class="row" style="margin-top:8px"><button class="btn" data-act="erzaehl">🧭 Weiter</button></div>
      <div data-ma-erzout></div>
      <p class="small muted">Dein Text wird nicht gespeichert.</p></div>
     ${ageChips()}
     ${top.length?`<p class="small muted">Oft bei euch: ${top.map(s=>`<button class="chip" data-go="heute:${s.id}">${s.e} ${esc(s.l)}</button>`).join(' ')}</p>`:''}
     <div class="grid">${SITUATIONS.map(s=>`<button class="tile" data-go="heute:${s.id}"><span class="e">${s.e}</span><span class="l">${s.l}</span></button>`).join('')}</div>
     <div class="card soft"><h3>Und du?</h3><p class="muted">Eltern brauchen auch Pausen. Eine Minute atmen hilft, bevor du antwortest.</p>
     <button class="btn alt" data-sos="1">🌬️ 1 Minute für mich</button> <button class="btn alt" data-go="fuerdich">🧡 Für dich</button></div>
     <button class="btn alt block" data-go="wissen">📖 Wissen kurz erklärt: Aufmerksamkeit, Lesen, Rechnen, Grübeln, Jugend</button>${FOOT}</div>`;
  }
  /* Erzählen: ohne Server passende Situation finden, mit Server zusätzlich persönliche Antwort. Text bleibt nur im Arbeitsspeicher. */
  let erzText = '';
  function serverDaten(){ let addr='', key=''; try{ addr=JSON.parse(localStorage.getItem('drlab-hermes-adresse')||'""')||''; key=JSON.parse(localStorage.getItem('drlab-hermes-passwort')||'""')||''; }catch(e){} return {addr:String(addr).trim().replace(/\/+$/,''), key}; }
  function serverBereit(){ const d=serverDaten(); return /^https:\/\//.test(d.addr) && !!d.key && navigator.onLine!==false; }
  function erzaehl(){
    const ta = $('#ma-erz'), out = $('[data-ma-erzout]'); if(!ta || !out) return;
    const text = ta.value.trim(); if(!text){ toast('Schreib zuerst kurz, was los ist.'); ta.focus(); return; }
    erzText = text; const t = ' '+text.toLowerCase()+' ';
    if(KRISE_RE.test(t)){ ta.value=''; erzText=''; go('hilfe'); toast('Das klingt ernst. Hier ist sofort Hilfe.'); later(()=>say('Das klingt ernst. Du musst das nicht allein tragen. Ruf jetzt an.'), 300); return; }
    const sc = Object.keys(SIT_KW).map(id=>({id, n:SIT_KW[id].filter(w=>t.indexOf(w)>-1).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,2);
    const hits = sc.map(x=>SITUATIONS.find(s=>s.id===x.id)).filter(Boolean);
    pose('denkt', 1600);
    out.innerHTML = (hits.length ? `<p style="margin:10px 0 6px">Danke, dass du es mir erzählst. Ich glaube, das passt:</p>${hits.map(s=>`<button class="btn alt block" data-go="heute:${s.id}">${s.e} ${esc(s.l)}</button>`).join('')}`
      : `<p style="margin:10px 0 6px">Danke. Ich habe es noch nicht ganz verstanden. Wähl unten eine Situation, oder schau zuerst die drei Fragen an.</p>`)
      + (serverBereit() ? `<button class="btn block" data-act="kiFrag">🦧 Mama Affe persönlich fragen</button><p class="small muted">Dein Text geht dafür einmal an den DR Lab Server (Sense Engine), ohne Namen.</p><div data-ma-kiout></div>` : '');
    say(hits.length ? 'Danke, dass du es mir erzählst. Schau, das könnte passen.' : 'Danke. Wähl eine Situation, dann schauen wir zusammen.');
  }
  async function kiFrag(btn){
    const out = $('[data-ma-kiout]'); if(!out || !erzText) return;
    btn.disabled = true; out.innerHTML = '<p class="small muted">Mama Affe denkt nach …</p>'; pose('denkt');
    const d = serverDaten(); const alter = (AGES.find(a=>a.k===state.age)||{}).l||'';
    try{
      const r = await fetch(d.addr+'/v1/chat/completions', {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+d.key,'X-Nova-App':'Mama Affe'},
        body: JSON.stringify({model:'sense-engine', messages:[{role:'system', content: SEELE + ' Antworte in höchstens 6 kurzen Sätzen: zuerst das grosse Ganze, dann ein Satz zum Ausprobieren, dann wann Fachpersonen helfen. Alter des Kindes: '+alter+'.'},{role:'user', content: erzText.slice(0,1500)}]})});
      if(!r.ok) throw new Error(r.status);
      const j = await r.json(); const a = String((j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)||'').trim();
      if(!a) throw new Error('leer');
      out.innerHTML = `<div class="card gold"><p style="white-space:pre-wrap;margin:0">${esc(a)}</p><button class="chip" data-say="${esc(a)}">🔊 Vorlesen</button></div>`;
      btn.remove(); pose('zeigt', 1500); learnUp(l=>{ l.ki = (l.ki||0)+1; });
    }catch(e){
      out.innerHTML = '<p class="small muted">Mama Affe erreicht ihren Server gerade nicht. Die Situationen oben helfen trotzdem. Versuch es später nochmals.</p>'; btn.disabled = false;
    }
  }
  /* Wissen kurz erklärt */
  function vWissen(k){
    const w = WISSEN.find(x=>x.k===k);
    if(!w) return topBar('Wissen kurz erklärt') + `<div class="scene">
      ${stage('denkt', 'Erst das grosse Ganze. Dann sehen wir die Stärken. Dann den nächsten Schritt.', 110)}
      <div class="map"><div class="k">Wichtig</div>Das hier ist Wissen, keine Abklärung. Mama Affe stellt keine Diagnose. Sie hilft dir, genau hinzuschauen und gut vorbereitet mit Fachpersonen zu reden.</div>
      <div class="grid">${WISSEN.map(x=>`<button class="tile" data-go="wissen:${x.k}"><span class="e">${x.e}</span><span class="l">${esc(x.l)}</span></button>`).join('')}</div>${FOOT}</div>`;
    learnUp(l=>{ l.wissen = l.wissen||{}; l.wissen[k] = (l.wissen[k]||0)+1; });
    later(()=>say(w.ganz), 400);
    return topBar(w.l) + `<div class="scene">
      <div class="map"><div class="k">${w.e} Das grosse Ganze</div>${esc(w.ganz)}</div>
      <div class="card gold"><h3>💪 Stärken, die oft dazugehören</h3><ul>${w.staerke.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="card"><h3>🌱 Was im Alltag hilft</h3><ul>${w.alltag.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="card"><h3>🧭 Wann Fachpersonen helfen</h3><p>${esc(w.wann)}</p>
       <div class="row"><button class="btn alt" data-go="hilfe">Hilfe-Nummern</button><button class="btn alt" data-go="notiz${w.proto?':'+w.proto:''}">📝 Beobachtung notieren</button></div></div>
      ${w.sit?`<button class="btn block" data-go="heute:${w.sit}">💬 Sätze zum Ausprobieren</button>`:''}
      ${w.room?`<button class="btn block" data-mode="kind" data-to="${w.room}">🏫 Zusammen üben im Schulhaus</button>`:''}
      <button class="btn alt block" data-go="wissen">← Andere Themen</button>${FOOT}</div>`;
  }
  function vSituation(id){
    const s = SITUATIONS.find(x=>x.id===id); if(!s) return vHeute();
    learnUp(l=>{ l.sit = l.sit||{}; l.sit[id] = (l.sit[id]||0)+1; });
    const ageL = AGES.find(a=>a.k===state.age).l;
    later(()=>say(s.behind + ' ' + s.try), 400);
    return topBar(s.l) + `<div class="scene">
     ${stage('denkt', 'Lass uns zuerst aufs grosse Ganze schauen.', 110)}
     <div class="map"><div class="k">${s.e} Das grosse Ganze</div>${esc(s.behind)}</div>
     <div class="card"><h3>🌱 Normal mit ${ageL}</h3><p>${esc(s.normal[state.age])}</p>${ageChips()}</div>
     <div class="card gold"><h3>💬 Ein Satz zum Ausprobieren</h3><p>${esc(s.try)}</p><button class="chip" data-say="${esc(s.try)}">🔊 Nochmal hören</button>
     <p class="small muted">Es gibt mehrere Wege. Du kennst dein Kind am besten, du entscheidest.</p></div>
     <div class="card"><h3>🦶 Mit dem Körper</h3><p>${esc(s.body)}</p>${s.bodyGo?`<button class="btn alt" data-go="uebung:${s.bodyGo}">▶️ Zusammen üben</button>`:''}</div>
     <div class="card"><h3>🧭 Wann Fachpersonen helfen</h3><p>${esc(s.when)}</p>
     <div class="row"><button class="btn alt" data-go="hilfe">Hilfe-Nummern</button><button class="btn alt" data-go="notiz${s.proto?':'+s.proto:''}">📝 Beobachtung notieren</button></div></div>
     ${s.sos?`<button class="btn red block" data-sos="1">💛 Ich kann nicht mehr</button>`:''}
     ${s.link==='schlaf'?`<button class="btn block" data-go="schlaf">🌙 Zum Schlaf-Bereich</button>`:''}
     ${s.link==='schule'?`<button class="btn block" data-mode="kind">🏫 Ins Schulzimmer</button>`:''}
     ${s.kid==='staerken'?`<button class="btn block" data-mode="kind" data-to="staerken">💪 Superkräfte mit dem Kind finden</button>`:''}
     <button class="btn alt block" data-go="heute">← Andere Situation</button>${FOOT}</div>`;
  }
  function vAlter(){
    const a = ALTER[state.age]; const st = store.get('staerken', []);
    return topBar('Altersbegleiter') + `<div class="scene">${ageChips()}
     <h1 style="font-size:1.35rem">${esc(a.t)}</h1>
     <div class="card"><h3>Was sich gerade entwickelt</h3><ul>${a.g.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
     <div class="card gold"><h3>Was hilft</h3><ul>${a.a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
     ${st.length?`<div class="card"><h3>💪 Superkräfte deines Kindes</h3><p>${st.map(k=>{ const s=STRENGTHS.find(x=>x.k===k); return s?`<span class="chip sel" style="display:inline-block;margin:2px">${s.e} ${esc(s.l)}</span>`:''; }).join('')}</p><p class="small muted">Vom Kind selbst gewählt. Stärken zuerst.</p></div>`:''}
     <div class="card soft"><h3>Meine Spannweite</h3><p class="muted">Ein Kind hat kein festes Niveau, sondern ein Band: was an guten Tagen geht und was fast immer klappt. Im Schulzimmer sammelt Mama Affe beides.</p>${spannweite()}</div>${FOOT}</div>`;
  }
  function spannweite(){
    const sp = store.get('span', {});
    const rooms = {lesen:'Lesen', rechnen:'Rechnen', koerper:'Körper'};
    const st = n => `<span class="stars">${'★'.repeat(Math.min(5,n))}${'☆'.repeat(Math.max(0,5-n))}</span>`;
    return '<ul class="clean">' + Object.keys(rooms).map(k=>{ const v = sp[k] || {best:0, usual:0};
      return `<li><b>${rooms[k]}</b><br><span class="small">An guten Tagen: ${st(v.best)} · Fast immer: ${st(v.usual)}</span></li>`; }).join('') + '</ul>';
  }
  function vMomente(){
    const list = store.get('moments', []);
    return topBar('Einstein-Momente') + `<div class="scene">
     <div class="map"><div class="k">Wozu?</div>Kinder sind mal genial, mal ganz Kind. Schreib die genialen Momente auf: einen erstaunlichen Satz, eine Idee, einen Fortschritt.</div>
     <div class="card"><label for="ma-mtext">Was hat dein Kind heute Erstaunliches gesagt oder getan?</label>
     <textarea id="ma-mtext" placeholder="z. B. «Mama, warum hat der Mond kein Licht in sich?»"></textarea>
     <button class="btn block" data-act="addMoment">✨ Speichern</button>
     <p class="small muted">Tipp: Nachfragen statt korrigieren. «Wie bist du darauf gekommen?»</p></div>
     <h2>Gesammelt (${list.length})</h2>
     ${list.length? '<ul class="clean">'+list.slice().reverse().map(m=>`<li><span class="small muted">${esc(m.d)}</span><br>${esc(m.t)}</li>`).join('')+'</ul>' : '<p class="muted">Noch nichts. Der erste Moment kommt bestimmt bald.</p>'}${FOOT}</div>`;
  }
  /* Verlaufsprotokoll + Fragen fürs Gespräch (5a: Beobachtungen sammeln, aufs Gespräch vorbereiten) */
  function vNotiz(art){
    const list = store.get('notes', []);
    const sel = art || store.get('protoArt', 'anderes');
    const since = Date.now() - 7*86400000;
    const week = {}; list.forEach(n=>{ if((n.ts||0) >= since){ week[n.a||'anderes'] = (week[n.a||'anderes']||0) + 1; } });
    return topBar('Beobachten fürs Gespräch') + `<div class="scene">
     <div class="map"><div class="k">Wozu?</div>Wenn du mit Kinderarzt, Lehrperson oder Beratung redest, helfen Beobachtungen mit Datum. Mama Affe bewertet nichts und stellt keine Diagnose.</div>
     <div class="card"><label>Worum geht es?</label>
     <div class="row">${PROTO_ARTEN.map(p=>`<button class="chip ${sel===p.k?'sel':''}" data-proto="${p.k}">${p.e} ${p.l}</button>`).join('')}</div>
     <label for="ma-ndauer">Wie lange? (Minuten, freiwillig)</label><input type="number" id="ma-ndauer" inputmode="numeric" min="0" max="999" placeholder="z. B. 20">
     <label for="ma-ntext">Was hast du beobachtet? Was hat geholfen?</label>
     <textarea id="ma-ntext" placeholder="Was, wann, wie lange, was hat geholfen?"></textarea>
     <button class="btn block" data-act="addNote">📝 Speichern</button></div>
     ${Object.keys(week).length?`<div class="card soft"><h3>Letzte 7 Tage</h3><p>${Object.entries(week).map(([k,n])=>{ const p=PROTO_ARTEN.find(x=>x.k===k)||PROTO_ARTEN[6]; return `${p.e} ${esc(p.l)}: <b>${n}</b>`; }).join(' · ')}</p></div>`:''}
     <div class="card gold"><h3>Fragen, die du mitnehmen kannst</h3><ul>${ARZT_FRAGEN.map(q=>`<li>${esc(q)}</li>`).join('')}</ul>
     <button class="btn alt" data-act="copyQuestions">📋 Fragen kopieren</button></div>
     <h2>Notizen (${list.length})</h2>
     ${list.length? '<ul class="clean">'+list.slice().reverse().map(m=>{ const p = PROTO_ARTEN.find(x=>x.k===m.a); return `<li><span class="small muted">${esc(m.d)}${p?' · '+p.e+' '+esc(p.l):''}${m.min?' · '+esc(m.min)+' Min.':''}</span><br>${esc(m.t)}</li>`; }).join('')+'</ul><button class="btn alt block" data-act="copyNotes">📋 Alle kopieren (fürs Gespräch)</button>' : '<p class="muted">Noch keine Notizen.</p>'}${FOOT}</div>`;
  }
  function vSchlaf(){
    const s = SITUATIONS.find(x=>x.id==='schlaf');
    return topBar('Schlaf') + `<div class="scene">
     ${stage('schlaeft', 'Ein gleicher Weg ins Bett, jeden Abend. Das gibt Halt.', 110)}
     <div class="map"><div class="k">Das grosse Ganze</div>Ein gleicher Ablauf am Abend hilft Kindern, schneller einzuschlafen und seltener aufzuwachen. Je früher begonnen, desto besser.</div>
     <div class="card"><h3>🌱 Wie viel Schlaf?</h3><p>${esc(s.normal[state.age])}</p>${ageChips()}</div>
     <div class="card gold"><h3>Was am besten hilft</h3><ul>
      <li>Jeden Abend der gleiche Ablauf (das Kind hakt im Kinderbereich ab).</li>
      <li>Bildschirme 1 Stunde vorher weg, keine Geräte im Kinderzimmer.</li>
      <li>Tageslicht und Bewegung draussen am Tag.</li>
      <li>Dunkles, ruhiges, eher kühles Zimmer.</li>
      <li>Ab ca. 6 Monaten: müde, aber wach ins Bett legen.</li>
      <li>Es gibt mehrere Wege, auch sanfte. Ihr entscheidet.</li></ul></div>
     <div class="card"><h3>👶 Sicherer Babyschlaf</h3><p>Rückenlage, eigenes Bettchen ohne Kissen, Decken und Kuscheltiere, rauchfrei, nicht zu warm.</p></div>
     <div class="card"><h3>📝 Schrei- und Schlaf-Protokoll</h3><p class="muted">Freiwillig, nur auf diesem Gerät. Hilft beim Gespräch mit der Kinderärztin.</p>
      <div class="row"><button class="btn alt" data-go="notiz:schlaf">🌙 Schlaf notieren</button><button class="btn alt" data-go="notiz:weinen">😢 Weinen notieren</button></div></div>
     <div class="card danger"><h3>Wenn das Baby nicht aufhört zu weinen</h3><p><b>Leg das Baby sicher auf den Rücken ins Bettchen, geh kurz raus, atme durch, ruf jemanden an. Nie schütteln.</b></p>
     <button class="btn red block" data-sos="1">💛 Ich kann nicht mehr</button></div>
     <button class="btn block" data-mode="kind" data-to="abend">🌙 Abendritual fürs Kind öffnen</button>
     <a class="btn alt block" href="${LINK('../schlaf/')}" target="_blank" rel="noopener">🪶 Fias Nest: Schlaf für dich</a>${FOOT}</div>`;
  }
  function vHilfe(){
    return topBar('Hilfe') + `<div class="scene">
     <div class="card gold"><h3>Wenn es eilt</h3><p>Bei Lebensgefahr, Gewalt, Selbstverletzung oder akuter Krise sofort anrufen. Du musst das nicht allein tragen. Hilfe holen ist stark.</p></div>
     <ul class="clean help">${HELP.map(h=>`<li><b>${esc(h.n)}</b><br><a href="tel:${h.t.replace(/\s/g,'')}" style="font-size:1.3rem;font-weight:800">📞 ${esc(h.t)}</a><br><span class="small muted">${esc(h.d)}</span></li>`).join('')}</ul>
     <div class="card soft"><h3>Weitere Stellen (gratis oder günstig)</h3><ul>
      <li>Kinderärztin, Kinderarzt</li><li>Mütter- und Väterberatung der Gemeinde</li><li>Schreibaby-Sprechstunde (über die Kinderärztin)</li><li>Erziehungsberatung, Familienberatung</li>
      <li>Schulpsychologischer Dienst (über die Schule)</li><li>Logopädie, Psychomotorik (über die Schule)</li><li>Kinder- und jugendpsychiatrischer Dienst</li><li>Physiotherapie oder Podologie (bei Schmerzen in Füssen, Knien, Rücken)</li></ul></div>
     <button class="btn alt block" data-go="notiz">📝 Gespräch vorbereiten</button>${FOOT}</div>`;
  }
  /* Für dich: Eltern-Pause, Affenfüsse, leichte Beine, Sätze, Brücken, was Mama Affe sich merkt */
  function vFuerDich(){
    return topBar('Für dich') + `<div class="scene">
     ${stage('atmet', 'Und du? Was brauchst du gerade? Von der KI in den Körper, und vom Körper zurück.', 120)}
     <button class="btn block" data-sos="1">🌬️ 1 Minute atmen mit Mama Affe</button>
     ${afCard()}
     <div class="card"><h3>🌊 Leichte Beine (5 Übungen)</h3><p class="muted small">Wirbelsäule und Beine zusammen. Wand oder Stuhllehne in Reichweite.</p>
      <button class="btn alt block" data-run="beine">▶️ Runde starten</button>
      <button class="btn alt block" data-run="gehen">🌴 Im Gehen üben (auch mit dem Kind)</button></div>
     <div class="card gold"><h3>💬 Sätze, die Kinder stark machen</h3><ul class="clean">${SAETZE.map(s=>`<li class="row" style="justify-content:space-between;flex-wrap:nowrap"><span>«${esc(s)}»</span><button class="chip" data-say="${esc(s)}" aria-label="Vorlesen">🔊</button></li>`).join('')}</ul></div>
     <div class="card"><h3>🫶 Berührung nur mit Ja</h3><p>Bei Körperübungen mit dem Kind: zuerst fragen «Darf ich?». Das Kind darf jederzeit Nein sagen. Meist reicht es, wenn jeder seine eigenen Füsse spürt.</p></div>
     <div class="card soft"><h3>Weitere Figuren für dich</h3>
      <a class="btn alt block" href="${LINK('../humanspark/')}" target="_blank" rel="noopener">⚡ Sparky (Human Sparks): Ruhe für Herz und Körper</a>
      <a class="btn alt block" href="${LINK('../schlaf/')}" target="_blank" rel="noopener">🪶 Fias Nest: Schlaf für Erwachsene</a>
      <a class="btn alt block" href="${LINK('../mondschein/')}" target="_blank" rel="noopener">🦔 Otti (Mondschein): Gute-Nacht-Geschichten</a></div>
     ${memCard()}
     <button class="btn alt block" data-go="notiz">📝 Beobachten fürs Gespräch</button>
     <p class="small muted">Übungen für Beweglichkeit und Körpergefühl, keine Behandlung. Bei Schmerzen, Taubheit oder Verletzungen zuerst Ärztin, Physiotherapie oder Podologie fragen.</p>${FOOT}</div>`;
  }
  /* Affenfüsse-Kalender: 3 Runden pro Tag, Fortschritt der Woche */
  function afCard(kid){
    const af = store.get('af', {}); const today = dayKey(); const n = af[today]||0;
    const days = []; for(let i=6;i>=0;i--){ const d = new Date(); d.setDate(d.getDate()-i); days.push({k:dayKey(d), l:d.toLocaleDateString('de-CH',{weekday:'short'})}); }
    let streak = 0; for(let i=0;i<365;i++){ const d=new Date(); d.setDate(d.getDate()-i); if((af[dayKey(d)]||0)>0) streak++; else if(i>0) break; }
    return `<div class="card gold"><h3>🐒 Affenfüsse-Kalender</h3>
      <p class="small muted">${kid?'Jeden Tag ein bisschen. Drei Runden sind super!':'Wenig, aber jeden Tag: 3× am Tag ca. 3 Minuten, barfuss. Ziel: jede Zehe einzeln bewegen.'}</p>
      <div class="week">${days.map(d=>`<div>${esc(d.l)}<b>${'🐒'.repeat(Math.min(3,af[d.k]||0))||'·'}</b></div>`).join('')}</div>
      <p style="margin-top:8px">Heute: <b>${n} von 3</b>${streak>1?` · ${streak} Tage am Stück 🔥`:''}</p>
      <button class="btn block" data-run="affenfuesse">▶️ Affenfüsse-Runde (5 Übungen)</button>
      <details><summary>🎹 Hilfen fürs Klavier</summary><ol>${KLAVIER_HILFEN.map(h=>`<li>${esc(h)}</li>`).join('')}</ol></details></div>`;
  }
  function memCard(){
    const l = learn(); const af = store.get('af', {}); const afDays = Object.keys(af).filter(k=>af[k]>0).length;
    const fav = Object.entries(l.rooms||{}).sort((a,b)=>b[1]-a[1])[0];
    const roomL = {lesen:'Lese-Zimmer', rechnen:'Rechen-Zimmer', staunen:'Staun-Zimmer', koerper:'Körper-Ecke', staerken:'Stärken-Zimmer'};
    const moods = (l.moods||[]).slice(-7).map(m=>({rakete:'🚀',velo:'🚲',schnecke:'🐌'})[m]||'').join(' ');
    const sit = Object.entries(l.sit||{}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>{ const s=SITUATIONS.find(y=>y.id===x[0]); return s? s.e+' '+s.l : ''; }).filter(Boolean).join(', ');
    const share = store.get('shareOk', false);
    const wis = Object.entries(l.wissen||{}).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>{ const w=WISSEN.find(y=>y.k===x[0]); return w? w.e+' '+w.l : ''; }).filter(Boolean).join(', ');
    return `<div class="card"><h3>🧠 Was Mama Affe sich merkt</h3>
      <ul class="clean small">
       <li>Lesen: ${l.lesenOk} von ${l.lesenAll} Lauten richtig</li>
       <li>Rechnen: ${l.rechnenOk} von ${l.rechnenAll} richtig${l.lvl!=null?` · zuletzt Stufe ${l.lvl+1} (startet dort wieder)`:''}</li>
       <li>Körperübungen: ${l.uebungen} · ganze Runden: ${l.runden} · Affenfüsse-Tage: ${afDays}</li>
       ${fav?`<li>Lieblingszimmer: ${esc(roomL[fav[0]]||fav[0])}</li>`:''}
       ${moods?`<li>Tagesform zuletzt: ${moods}</li>`:''}
       ${sit?`<li>Eure häufigsten Themen: ${esc(sit)}</li>`:''}
       ${wis?`<li>Oft nachgelesen: ${esc(wis)}</li>`:''}
       ${l.ki?`<li>Mama Affe persönlich gefragt: ${l.ki}</li>`:''}
      </ul>
      <p class="small muted">Nur Zahlen, nur auf diesem Gerät. Notizen, Momente und Namen bleiben immer hier. Mama Affe nutzt die Zahlen, um Aufgaben ans Kind anzupassen.</p>
      <label class="cb"><input type="checkbox" data-act="shareOk" ${share?'checked':''}> <span>Ich bin einverstanden, dass Mama Affe diese Lern-Zahlen (ohne Texte, ohne Namen, ohne Stimme oder Bild) an DR Lab weitergibt, damit die App besser wird.</span></label>
      ${share?`<button class="btn alt block" data-act="shareNow">📤 Lern-Zahlen jetzt weitergeben</button>`:''}
      <button class="btn alt block" data-act="forget">🧽 Alles vergessen</button></div>`;
  }

  /* ---------- Kinderbereich ---------- */
  function vSchule(){
    const n = state.kidName ? ', '+state.kidName : '';
    const moodTxt = {rakete:'Rakete 🚀', velo:'Velo 🚲', schnecke:'Schnecke 🐌'};
    if(!state.mood){
      later(()=>say('Hallo'+(state.kidName?' '+state.kidName:'')+'! Willkommen in meinem Schulhaus im KI-Verse. Wie ist dein Kopf heute? Rakete, Velo oder Schnecke?'),400);
      return topBar('Schulhaus') + `<div class="scene">${HOUSE}
       ${stage('winkt', 'Hallo'+n+'! Willkommen in meinem Schulhaus im KI-Verse. Wie ist dein Kopf heute?', 140)}
       <div class="grid3">
        <button class="tile" data-mood="rakete"><span class="e">🚀</span><span class="l">Rakete</span><span class="small muted">voll Energie</span></button>
        <button class="tile" data-mood="velo"><span class="e">🚲</span><span class="l">Velo</span><span class="small muted">gut unterwegs</span></button>
        <button class="tile" data-mood="schnecke"><span class="e">🐌</span><span class="l">Schnecke</span><span class="small muted">langsam heute</span></button>
       </div>
       <div class="card soft"><label for="ma-kname">Wie heisst du? (freiwillig)</label><input type="text" id="ma-kname" value="${esc(state.kidName)}" placeholder="Dein Name" maxlength="30" autocomplete="off"></div>${FOOT}</div>`;
    }
    const teen = state.age==='12-16';
    const l = learn(); const fav = Object.entries(l.rooms||{}).sort((a,b)=>b[1]-a[1])[0];
    const favTxt = fav ? ({lesen:'Letztes Mal warst du oft im Lese-Zimmer.',rechnen:'Du rechnest gern, das merke ich mir.',staunen:'Du staunst gern. Das mag ich.',koerper:'Deine Affenfüsse werden immer geschickter.',staerken:'Du kennst deine Superkräfte.'})[fav[0]]||'' : '';
    const msg = state.mood==='schnecke'?'Wir machen es heute kurz und gemütlich. Das ist gut so.':state.mood==='rakete'?'Super! Zuerst bewegen, dann geht es los.':'Schön, dann lernen wir ganz entspannt.';
    return topBar('Schulhaus') + `<div class="scene">
     ${stage('zeigt', 'Heute bist du '+(state.mood==='velo'?'ein ':'eine ')+moodTxt[state.mood].replace(/ .*/,'')+'. '+msg+(favTxt?' '+favTxt:''), 110)}
     <div class="row" style="justify-content:center"><button class="chip" data-act="resetMood">Anders heute?</button></div>
     <div class="map"><div class="k">🗺️ Die Landkarte vom Schulhaus</div>Zuerst ankommen, dann ein Zimmer wählen. Nach jedem Zimmer machen wir eine Bewegungspause. Du darfst jederzeit hierher zurück (🗺️ oben).
     <div class="steps"><span>1. Ankommen</span><span>2. Zimmer wählen</span><span>3. Bewegen</span><span>4. Stern sammeln</span></div></div>
     <button class="btn block" data-go="ankommen">🌬️ 1. Ankommen (1 Minute)</button>
     <h2>2. Wähl ein Zimmer</h2>
     <div class="grid">
      ${teen?`<button class="tile" data-go="plan"><span class="e">🗓️</span><span class="l">Lernplan</span></button>
      <button class="tile" data-go="fokus"><span class="e">⏱️</span><span class="l">Fokus-Timer</span></button>
      <button class="tile" data-go="erklaer"><span class="e">🗣️</span><span class="l">Erklär es mir</span></button>
      <button class="tile" data-go="spiegel"><span class="e">🪞</span><span class="l">Fünf Spiegel</span></button>`:''}
      <button class="tile" data-go="lesen"><span class="e">🔤</span><span class="l">Lese-Zimmer</span></button>
      <button class="tile" data-go="rechnen"><span class="e">🔢</span><span class="l">Rechen-Zimmer</span></button>
      <button class="tile" data-go="staunen"><span class="e">🔭</span><span class="l">Staun-Zimmer</span></button>
      <button class="tile" data-go="koerper"><span class="e">🦶</span><span class="l">Körper-Ecke</span></button>
      <button class="tile" data-go="staerken"><span class="e">💪</span><span class="l">Superkräfte</span></button>
      <button class="tile" data-go="tier"><span class="e">🐻</span><span class="l">Tier des Tages</span></button>
     </div>
     <p class="small muted">Lesen und Rechnen nach Lehrplan 21: Laute, Zahlen, Einmaleins. Mama Affe passt sich an dich an.</p>${FOOT}</div>`;
  }
  function vAnkommen(){
    let left = 60, phase = 0;
    const t = setInterval(()=>{
      left--; const el = $('#ma-ak-t'); if(!el){ clearInterval(t); return; }
      el.textContent = left;
      if(left % 4 === 0){ phase = 1-phase; const b=$('#ma-ak-b'); if(b) b.classList.toggle('in', phase===1); const l=$('#ma-ak-l'); if(l) l.textContent = phase? 'Einatmen …' : 'Lang ausatmen …'; }
      if(left===40) say('Spür deine Füsse auf dem Boden.');
      if(left===20) say('Lass die Schultern sinken. Lang ausatmen.');
      if(left<=0){ clearInterval(t); say('Schön. Jetzt bist du angekommen.'); toast('Angekommen ✨'); later(()=>go('schule'),1500); }
    },1000);
    timers.push(t);
    later(()=>{ const b=$('#ma-ak-b'); if(b) b.classList.add('in'); say('Erst ankommen, dann lernen. Atme ein. Und lang aus.'); },200);
    return topBar('Ankommen') + `<div class="scene">${stage('atmet','',100)}<div class="card" style="text-align:center">
     <div class="breath" id="ma-ak-b"></div><p id="ma-ak-l" style="font-weight:700">Einatmen …</p>
     <div class="timer" id="ma-ak-t">60</div><p class="muted">Füsse spüren. Lang ausatmen. Erst ankommen, dann lernen.</p>
     <button class="btn alt" data-go="schule">Weiter</button></div></div>`;
  }
  /* Lese-Zimmer: Anfangslaut finden (Buchstabe-Laut-Training) */
  const lese = {n:0, ok:0, cur:null};
  function newLese(){
    const item = LETTERS[Math.floor(Math.random()*LETTERS.length)];
    const right = item.w[0].toUpperCase();
    const pool = 'ABDEFGHIKLMNOPRSTUWZ'.split('').filter(c=>c!==right);
    const opts = [right]; while(opts.length < (state.age==='1-3'||state.age==='3-6' ? 2 : 4)){ const c = pool[Math.floor(Math.random()*pool.length)]; if(!opts.includes(c)) opts.push(c); }
    opts.sort(()=>Math.random()-.5);
    lese.cur = {item, right, opts};
  }
  function blockLen(){ return state.mood==='schnecke' ? 3 : state.mood==='rakete' ? 6 : 5; }
  function vLesen(){
    if(!lese.cur) newLese();
    learnUp(l=>{ if(lese.n===0){ l.rooms=l.rooms||{}; l.rooms.lesen=(l.rooms.lesen||0)+1; } });
    const c = lese.cur;
    later(()=>say('Mit welchem Buchstaben fängt '+c.item.w+' an?'),400);
    return topBar('Lese-Zimmer') + `<div class="scene">
     ${lese.n===0?`<div class="map"><div class="k">🗺️ Das grosse Ganze</div>Jedes Wort ist aus Lauten gebaut, und jeder Laut hat einen Buchstaben. Wer die Laute hört, kann lesen. Wir starten mit dem ersten Laut.</div>`:''}
     ${stage('denkt','',80)}
     <p class="muted small">Aufgabe ${lese.n+1} von ${blockLen()}</p>
     <div class="card" style="text-align:center"><div style="font-size:4.5rem">${c.item.e}</div>
     <p style="font-size:1.4rem;font-weight:800">${esc(c.item.w)}</p><p>Mit welchem Buchstaben fängt es an?</p>
     <button class="chip" data-act="sayWord">🔊 Nochmal hören</button></div>
     <div class="answers">${c.opts.map(o=>`<button data-lese="${o}">${o}</button>`).join('')}</div></div>`;
  }
  /* Rechen-Zimmer: passt sich an (Tempo + Tagesform), mit erklärender Rückmeldung; Stufe bleibt gemerkt */
  const rechnen = {n:0, lvl:null, cur:null, streak:0, missed:false};
  function rLevelStart(){
    const saved = learn().lvl;
    const base = {'1-3':0,'3-6':1,'6-12':2,'12-16':4}[state.age];
    const s = (saved!=null ? saved : base) - (state.mood==='schnecke'?1:0);
    return Math.max(0, Math.min(5, s));
  }
  function newRechnen(){
    if(rechnen.lvl===null) rechnen.lvl = rLevelStart();
    const L = rechnen.lvl; let a,b,op;
    const r = (m,n)=>m+Math.floor(Math.random()*(n-m+1));
    if(L<=0){ a=r(1,3); b=r(1,2); op='+'; }
    else if(L===1){ a=r(1,5); b=r(1,4); op='+'; }
    else if(L===2){ op=Math.random()<.5?'+':'−'; a=r(3,10); b=r(1,a); if(op==='+') b=r(1,10-a>0?10-a:1); }
    else if(L===3){ op=Math.random()<.5?'+':'−'; a=r(8,20); b=r(2,9); if(op==='−'&&b>a) [a,b]=[b,a]; }
    else if(L===4){ op='×'; a=r(2,6); b=r(2,10); }
    else { op=Math.random()<.5?'×':'+'; if(op==='×'){a=r(3,12); b=r(3,12);} else {a=r(20,90); b=r(11,49);} }
    const res = op==='+'?a+b : op==='−'?a-b : a*b;
    const opts = new Set([res]); while(opts.size<4){ const d = res + (Math.floor(Math.random()*7)-3); if(d>=0 && d!==res) opts.add(d); }
    rechnen.cur = {a,b,op,res,opts:[...opts].sort(()=>Math.random()-.5)};
  }
  function dots(a,b,op){
    if(op==='×' || a+b>20) return '';
    if(op==='+') return `<div class="dots">${'<i></i>'.repeat(a)}${'<i class="b"></i>'.repeat(b)}</div>`;
    return `<div class="dots">${'<i></i>'.repeat(a-b)}${'<i class="b" style="opacity:.25"></i>'.repeat(b)}</div>`;
  }
  function vRechnen(){
    if(!rechnen.cur) newRechnen();
    learnUp(l=>{ if(rechnen.n===0){ l.rooms=l.rooms||{}; l.rooms.rechnen=(l.rooms.rechnen||0)+1; } });
    const c = rechnen.cur;
    const spoken = c.op==='+'?'plus':c.op==='−'?'minus':'mal';
    later(()=>say('Wie viel ist '+c.a+' '+spoken+' '+c.b+'?'),400);
    return topBar('Rechen-Zimmer') + `<div class="scene">
     ${rechnen.n===0?`<div class="map"><div class="k">🗺️ Das grosse Ganze</div>Rechnen heisst: Mengen zusammenlegen, wegnehmen oder vervielfachen. Wenn du die Menge siehst, verstehst du die Zahl. Mama Affe passt die Aufgaben an dich an.</div>`:''}
     ${stage('denkt','',80)}
     <p class="muted small">Aufgabe ${rechnen.n+1} von ${blockLen()} · Stufe ${rechnen.lvl+1}</p>
     <div class="card"><div class="q">${c.a} ${c.op} ${c.b} = ?</div>${dots(c.a,c.b,c.op)}</div>
     <div class="answers">${c.opts.map(o=>`<button data-rech="${o}">${o}</button>`).join('')}</div></div>`;
  }
  function explainRechnen(c){
    if(c.op==='+') return `${c.a} und noch ${c.b} dazu: zähl weiter ab ${c.a}. Das gibt ${c.res}.`;
    if(c.op==='−') return `Von ${c.a} nimmst du ${c.b} weg. Es bleiben ${c.res}.`;
    return `${c.a} mal ${c.b} heisst: ${c.b}-mal die ${c.a}. Das gibt ${c.res}.`;
  }
  function vStaunen(){
    learnUp(l=>{ l.rooms=l.rooms||{}; l.rooms.staunen=(l.rooms.staunen||0)+1; });
    const q = WONDER[Math.floor(Math.random()*WONDER.length)];
    later(()=>say(q+' Was denkst du?'),400);
    return topBar('Staun-Zimmer') + `<div class="scene">
     <div class="map"><div class="k">🗺️ Das grosse Ganze</div>Hier gibt es keine falschen Antworten. Forscherinnen und Forscher stellen Fragen, raten, probieren aus und staunen.</div>
     ${stage('denkt', q, 110)}
     <p class="muted" style="text-align:center">Was denkst du? Erzähl es jemandem oder schreib es auf.</p>
     <div class="card soft"><label for="ma-stext">Meine Idee</label><textarea id="ma-stext" placeholder="Ich glaube, …"></textarea>
     <button class="btn block" data-act="saveIdea">✨ Als Einstein-Moment speichern</button>
     <p class="small muted">Für Eltern: Nachfragen statt erklären. «Wie bist du darauf gekommen?»</p></div>
     <button class="btn alt block" data-go="staunen">🔄 Neue Frage</button>
     <button class="btn alt block" data-go="schule">← Zur Landkarte</button></div>`;
  }
  function vKoerper(){
    const kidBody = BODY.filter(b=>!b.adult && (!b.ab || state.age==='6-12' || state.age==='12-16'));
    return topBar('Körper-Ecke') + `<div class="scene">
     ${stage('turnt', 'Orang-Utans greifen mit den Füssen wie mit Händen. Komm, wir wecken deine Affenfüsse!', 120)}
     <div class="map"><div class="k">🗺️ Das grosse Ganze</div>Von der KI in den Körper, und vom Körper zurück. Jede Reihe hat fünf Teile:
     <div class="steps"><span>Wecken</span><span>Öffnen</span><span>Loslassen</span><span>Bewegen</span><span>Nachspüren</span></div></div>
     <button class="btn block" data-run="affenfuesse">🐒 Affenfüsse-Runde (5 Übungen)</button>
     <button class="btn alt block" data-run="grounding">🌳 Grounding-Reihe (Wecken bis Nachspüren)</button>
     <button class="btn alt block" data-run="gehen">🌴 Im Gehen üben: Dschungel-Runde</button>
     ${afCard(true)}
     <h2>Alle Übungen</h2>
     <div class="grid">${kidBody.map(b=>`<button class="tile" data-go="uebung:${b.id}"><span class="e">${b.e}</span><span class="l">${b.l}</span></button>`).join('')}</div>
     <div class="card soft"><h3>🎵 Merkvers in Affensprache</h3><p><i>${esc(RHYME)}</i></p><button class="chip" data-act="rhyme">🔊 Vorsingen</button></div>
     <p class="small muted">Barfuss ist am besten. Nur so weit, wie der Fuss antwortet. Bei Schmerzen aufhören und Eltern fragen.</p>${FOOT}</div>`;
  }
  let bodyRun = null;
  function startRun(k){ const r = RUNS[k]; if(!r) return; bodyRun = {k, i:0, list:r.list}; go('uebung:'+r.list[0]); }
  function vUebung(id){
    const b = BODY.find(x=>x.id===id); if(!b) return mode==='eltern' ? vFuerDich() : vKoerper();
    let left = b.s;
    const R = bodyRun ? RUNS[bodyRun.k] : null;
    const t = setInterval(()=>{ left--; const el=$('#ma-ub-t'); if(!el){clearInterval(t);return;} el.textContent=left;
      if(left<=0){ clearInterval(t); spanAdd('koerper', true); learnUp(l=>{ l.uebungen++; });
        if(bodyRun){ bodyRun.i++;
          if(bodyRun.i<bodyRun.list.length){ say('Super! Weiter geht es.'); pose('jubelt'); later(()=>go('uebung:'+bodyRun.list[bodyRun.i]),1400); }
          else { const done = bodyRun; bodyRun=null; learnUp(l=>{ l.runden++; }); if(RUNS[done.k].af) afAdd();
            pose('jubelt'); celebrate(); say(RUNS[done.k].adult ? 'Schön gemacht. Spür nach, wie leicht deine Beine sind.' : 'Toll gemacht! Deine Affenfüsse werden immer geschickter. Uga uga!'); toast('⭐ Runde geschafft');
            later(()=>go(mode==='eltern'?'fuerdich':'koerper'),2200); } }
        else { pose('jubelt', 1800); say('Gut gemacht!'); toast('⭐ Geschafft'); } } },1000);
    timers.push(t);
    later(()=>say(b.d),400);
    const prog = bodyRun ? `<p class="muted small" style="text-align:center">${esc(R.l)} · Übung ${bodyRun.i+1} von ${bodyRun.list.length}${R.phases?` · <b>${R.phases[bodyRun.i]}</b>`:''}</p>` : '';
    return topBar(b.l) + `<div class="scene">${prog}${stage('turnt','',110)}<div class="card" style="text-align:center"><div style="font-size:3.5rem">${b.e}</div>
     <h1>${esc(b.l)}</h1><p style="font-size:1.1rem">${esc(b.d)}</p><div class="timer" id="ma-ub-t">${b.s}</div>
     <button class="chip" data-say="${esc(b.d)}">🔊 Nochmal</button></div>
     ${b.hints?`<details open><summary>🎹 Hilfen, wenn es noch nicht klappt</summary><ol>${KLAVIER_HILFEN.map(h=>`<li>${esc(h)}</li>`).join('')}</ol></details>`:''}
     ${bodyRun?`<button class="btn alt block" data-act="skip">⏭️ Weiter zur nächsten</button>`:''}
     <button class="btn alt block" data-act="bodyStop">← Zurück</button>
     ${b.adult?'<p class="small muted">Wand oder Stuhllehne in Reichweite. Bei Schmerz in Knie, Rücken oder Hüfte aufhören und eine Fachperson fragen.</p>':''}</div>`;
  }
  function afAdd(){ const af = store.get('af', {}); const k = dayKey(); af[k] = Math.min(3, (af[k]||0)+1); store.set('af', af); }
  /* Superkräfte: Stärken zuerst (Leitidee «sie ist nicht doof, sie ist so») */
  function vStaerken(){
    learnUp(l=>{ l.rooms=l.rooms||{}; l.rooms.staerken=(l.rooms.staerken||0)+1; });
    const st = store.get('staerken', []);
    if(!st.length) later(()=>say('Jedes Kind hat Superkräfte. Welche hast du? Tipp alle an, die passen.'),400);
    return topBar('Superkräfte') + `<div class="scene">
     ${stage(st.length?'jubelt':'zeigt', st.length?'Du bist nicht doof. Du bist so. Und so ist gut. Das sind deine Superkräfte!':'Jedes Kind hat Superkräfte. Welche hast du? Tipp alle an, die passen.', 120)}
     <div class="grid3">${STRENGTHS.map(s=>`<button class="tile ${st.includes(s.k)?'sel':''}" data-strength="${s.k}"><span class="e">${s.e}</span><span class="l small">${esc(s.l)}</span></button>`).join('')}</div>
     <div class="card soft"><p>Manche Köpfe brauchen zuerst das grosse Ganze, dann die Details. Das ist eine andere Form von Intelligenz.</p></div>
     <button class="btn alt block" data-go="schule">← Zur Landkarte</button></div>`;
  }
  function vTier(){
    const today = new Date().toDateString();
    const saved = store.get('animal', null);
    const pick = saved && saved.d===today ? ANIMALS.find(a=>a.n===saved.n) : null;
    return topBar('Tier des Tages') + `<div class="scene">
     <div class="map"><div class="k">Wie fühlst du dich heute?</div>Wähl das Tier, das zu dir passt. Es ist nur ein Bild, und jedes Tier ist gut.</div>
     <div class="grid3">${ANIMALS.map(a=>`<button class="tile ${pick&&pick.n===a.n?'sel':''}" data-animal="${a.n}"><span class="e">${a.e}</span><span class="l">${a.n}</span></button>`).join('')}</div>
     ${pick?`<div class="card gold" style="text-align:center"><div style="font-size:3rem">${pick.e}</div><p style="font-weight:700">${esc(pick.m)}</p>
       <button class="btn alt" data-go="uebung:${pick.go}">▶️ Bewegen wie ${esc(pick.n)}</button></div>`:''}</div>`;
  }
  function vAbend(){
    const today = new Date().toDateString();
    let done = store.get('ritual', {d:today, s:[]}); if(done.d!==today) done = {d:today, s:[]};
    const all = done.s.length===RITUAL.length;
    return topBar('Abendritual') + `<div class="scene">
     ${stage(all?'schlaeft':'atmet', all?'Alles geschafft. Gute Nacht, kleiner Affe.':'Jeden Abend der gleiche Weg ins Bett. Tipp auf jede Karte, wenn du sie geschafft hast.', 110)}
     ${RITUAL.map((r,i)=>`<div class="check ${done.s.includes(i)?'done':''}" data-rit="${i}" role="button" tabindex="0"><span class="e">${r.e}</span><b style="flex:1">${r.l}</b><span>${done.s.includes(i)?'✅':'⬜'}</span></div>`).join('')}
     ${all?`<div class="card gold" style="text-align:center"><p style="font-weight:700">Alles geschafft! Gute Nacht. Jetzt erzählt Otti eine Geschichte.</p>
     <a class="btn block" href="${LINK('../mondschein/')}" target="_blank" rel="noopener">🦔 Zu Otti (Mondschein)</a></div>`:''}
     <button class="btn alt block" data-run="abend">🐻 Ruhig werden: Bär, Löwe, Atem</button>
     <button class="chip" data-act="ritReset">Neu anfangen</button></div>`;
  }
  /* Jugendliche 12–16 */
  function vPlan(){
    const p = store.get('plan', {date:'', topics:''});
    let out = '';
    if(p.date && p.topics){
      const days = Math.max(1, Math.ceil((new Date(p.date) - new Date())/86400000));
      const t = p.topics.split(/\n|,/).map(x=>x.trim()).filter(Boolean);
      const rows = []; const n = Math.min(days, 14);
      for(let i=0;i<n;i++){
        const d = new Date(); d.setDate(d.getDate()+i);
        const learnT = t[i % t.length]; const rev = i>=2 ? t[(i-2) % t.length] : null;
        rows.push(`<li><b>${d.toLocaleDateString('de-CH',{weekday:'short',day:'numeric',month:'numeric'})}</b>: ${esc(learnT)} lernen (15 Min.)${rev?` · ${esc(rev)} selbst abfragen (5 Min.)`:''}</li>`);
      }
      out = `<div class="card gold"><h3>Dein Plan (${days} Tage bis zur Prüfung)</h3><ul class="clean">${rows.join('')}</ul>
      <p class="small muted">Verteilt über Tage und mit Selbstabfrage: so bleibt am meisten hängen.</p></div>`;
    }
    return topBar('Lernplan') + `<div class="scene">
     <div class="map"><div class="k">🗺️ Das grosse Ganze</div>Zuerst alle Themen sehen, dann in kleine Stücke verteilen. Planen, tun, zurückschauen.</div>
     <div class="card"><label for="ma-pdate">Wann ist die Prüfung?</label><input type="date" id="ma-pdate" value="${esc(p.date)}">
     <label for="ma-ptop">Welche Themen? (eins pro Zeile)</label><textarea id="ma-ptop" placeholder="Brüche&#10;Prozent&#10;Gleichungen">${esc(p.topics)}</textarea>
     <button class="btn block" data-act="savePlan">🗓️ Plan machen</button></div>${out}</div>`;
  }
  function vFokus(){
    return topBar('Fokus-Timer') + `<div class="scene">
     <div class="map"><div class="k">So geht es</div>Handy weg, eine Aufgabe, Timer an. Danach bewegen.</div>
     <div class="row" style="justify-content:center">${[10,15,25].map(m=>`<button class="chip" data-focus="${m}">${m} Min.</button>`).join('')}</div>
     <div class="card" style="text-align:center"><div class="timer" id="ma-fk-t">--:--</div><p class="muted" id="ma-fk-l">Wähl eine Zeit.</p></div></div>`;
  }
  function vErklaer(){
    return topBar('Erklär es mir') + `<div class="scene">
     <div class="map"><div class="k">Warum?</div>Wer etwas in eigenen Worten erklären kann, hat es verstanden. Erklär es Mama Affe, als wäre sie neu in deiner Klasse.</div>
     <div class="card"><label for="ma-etop">Thema</label><input type="text" id="ma-etop" placeholder="z. B. Photosynthese">
     <label for="ma-etext">Deine Erklärung</label><textarea id="ma-etext" placeholder="Also, das funktioniert so: …"></textarea></div>
     <div class="card soft"><h3>Check</h3>
     ${['Habe ich gesagt, worum es im Grossen geht?','Habe ich ein Beispiel genannt?','Könnte es ein 10-jähriges Kind verstehen?','Weiss ich, was ich noch nicht weiss?'].map((q,i)=>`<div class="check" data-chk="${i}" role="button" tabindex="0"><span class="e">⬜</span><span>${q}</span></div>`).join('')}</div></div>`;
  }
  function vSpiegel(){
    const q = MIRRORS[Math.floor(Math.random()*MIRRORS.length)];
    return topBar('Fünf Spiegel') + `<div class="scene">
     <div class="map"><div class="k">Für ruhige Momente</div>Eine Frage zum Nachdenken. Du musst sie niemandem zeigen.</div>
     <div class="card gold" style="text-align:center"><div style="font-size:3rem">🪞</div><p style="font-size:1.3rem;font-weight:800">${esc(q)}</p></div>
     <button class="btn alt block" data-go="spiegel">🔄 Andere Frage</button>
     <p class="small muted">Wenn dich etwas sehr belastet: Pro Juventute 147, auch per Chat. Hilfe holen ist stark. Für Körperübungen gibt es Sparky (Human Sparks).</p></div>`;
  }

  /* ---------- Bewegungspause und SOS ---------- */
  function movePause(next){
    const list = BODY.filter(b=>!b.adult && !b.hints);
    const b = list[Math.floor(Math.random()*list.length)];
    const el = document.createElement('div'); el.className='pause';
    el.innerHTML = `<div class="card gold" style="text-align:center">${stage('turnt','',100)}<p class="muted">Bewegungspause, mach mit!</p><div style="font-size:3.4rem">${b.e}</div><h2>${esc(b.l)}</h2><p>${esc(b.d)}</p>
     <div class="timer" data-mp-t>20</div><button class="btn block" data-mp-ok>Weiter</button></div>`;
    root.appendChild(el); say('Bewegungspause! '+b.d);
    let left = 20; const t = setInterval(()=>{ left--; const tt=el.querySelector('[data-mp-t]'); if(tt) tt.textContent=Math.max(0,left); if(left<=0){ clearInterval(t); } },1000);
    el.querySelector('[data-mp-ok]').onclick = ev=>{ ev.stopPropagation(); clearInterval(t); el.remove(); stopSay(); next && next(); };
  }
  function sos(){
    const el = document.createElement('div'); el.className='pause';
    el.innerHTML = `<div class="card gold" style="text-align:center">
     ${stage('atmet','',90)}
     <p style="font-weight:700">Du machst das gut. Es ist zu viel gerade. Das ist menschlich.</p>
     <p><b>Ist ein Baby da? Leg es sicher auf den Rücken ins Bettchen und geh kurz raus. Nie schütteln.</b></p>
     <div class="breath" data-sos-b></div><p data-sos-l style="font-weight:700">Einatmen …</p><div class="timer" data-sos-t>60</div>
     <a class="btn red block" href="tel:0848354555">📞 Elternnotruf 0848 35 45 55</a>
     <a class="btn alt block" href="tel:144">📞 Notfall 144</a>
     <button class="btn alt block" data-sos-x>Schliessen</button></div>`;
    root.appendChild(el);
    say('Du machst das gut. Atme mit mir. Ein. Und lang aus.');
    let left = 60, ph = 1; setTimeout(()=>{ const b=el.querySelector('[data-sos-b]'); if(b) b.classList.add('in'); },100);
    const t = setInterval(()=>{ left--; const tt=el.querySelector('[data-sos-t]'); if(!tt){clearInterval(t);return;} tt.textContent=left;
      if(left%4===0){ ph=1-ph; el.querySelector('[data-sos-b]').classList.toggle('in',ph===1); el.querySelector('[data-sos-l]').textContent = ph?'Einatmen …':'Lang ausatmen …'; }
      if(left<=0){ clearInterval(t); el.querySelector('[data-sos-l]').textContent='Gut. Wenn du magst, ruf jemanden an.'; } },1000);
    el.querySelector('[data-sos-x]').onclick = ev=>{ ev.stopPropagation(); clearInterval(t); el.remove(); stopSay(); };
  }
  function spanAdd(room, ok){
    const sp = store.get('span', {}); const v = sp[room] || {best:0, usual:0, hist:[]};
    v.hist = (v.hist||[]).concat(ok?1:0).slice(-30);
    const recent = v.hist.slice(-10); const rate = recent.reduce((a,b)=>a+b,0)/recent.length;
    v.best = Math.max(v.best, Math.round(rate*5));
    const all = v.hist.reduce((a,b)=>a+b,0)/v.hist.length; v.usual = Math.round(all*5*0.9);
    sp[room] = v; store.set('span', sp);
  }
  /* Lern-Zahlen an Sense Engine (nur mit Häkchen; gleicher Server wie nova.js) */
  function shareNow(){
    const l = learn();
    const zahlen = {lesen:[l.lesenOk,l.lesenAll], rechnen:[l.rechnenOk,l.rechnenAll], stufe:l.lvl, uebungen:l.uebungen, runden:l.runden,
      affenfuesseTage:Object.keys(store.get('af',{})).length, zimmer:l.rooms, tagesform:(l.moods||[]).slice(-14), themen:l.sit, alter:state.age};
    const text = 'Mama Affe Lern-Zahlen: ' + JSON.stringify(zahlen);
    let addr = '', key = '';
    try{ addr = JSON.parse(localStorage.getItem('drlab-hermes-adresse')||'""'); key = JSON.parse(localStorage.getItem('drlab-hermes-passwort')||'""'); }catch(e){}
    if(addr && key){
      fetch(String(addr).replace(/\/$/,'') + '/erfahrung', {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
        body: JSON.stringify({app:'Mama Affe', art:'lernzahlen', frage:text, antwort:''})})
        .then(r=>{ toast(r.ok?'📤 Weitergegeben. Danke!':'Server meldet Fehler '+r.status); })
        .catch(()=>{ copy(text, '📋 Server nicht erreichbar, Zahlen kopiert'); });
    } else copy(text, '📋 Ohne Server: Zahlen kopiert (selbst weitergeben)');
  }
  function copy(txt, ok){ try{ navigator.clipboard.writeText(txt).then(()=>toast(ok||'📋 Kopiert'), ()=>toast('Kopieren geht hier nicht')); }catch(e){ toast('Kopieren geht hier nicht'); } }

  /* ---------- Render ---------- */
  function render(){
    let h = '';
    if(!mode) h = vHome();
    else {
      const [v, arg] = view.split(':');
      const map = {heute: arg? ()=>vSituation(arg) : vHeute, alter:vAlter, fuerdich:vFuerDich, momente:vMomente, notiz:()=>vNotiz(arg), schlaf:vSchlaf, hilfe:vHilfe,
        schule:vSchule, ankommen:vAnkommen, lesen:vLesen, rechnen:vRechnen, staunen:vStaunen, koerper:vKoerper, uebung:()=>vUebung(arg),
        staerken:vStaerken, tier:vTier, abend:vAbend, plan:vPlan, fokus:vFokus, erklaer:vErklaer, spiegel:vSpiegel, wissen:()=>vWissen(arg)};
      h = (map[v] || (mode==='eltern'?vHeute:vSchule))();
    }
    root.classList.toggle('ma-kind', mode==='kind'); // Ruhe-Prinzip im Kinderbereich (bereich.css)
    app.innerHTML = h; tabs(); typeBubbles();
  }
  function setMode(m, to){
    mode = m; store.set('mode', m);
    view = to || (m==='eltern' ? 'heute' : 'schule');
    stopSay(); clearTimers(); render(); toTop();
  }

  /* ---------- Erster Start: kurze Einführung (3 Bilder) ---------- */
  const OB = [
   {p:'winkt', t:'Ich bin Mama Affe', x:'Ein Orang-Utan mit langen Armen und Füssen, die greifen wie Hände. Ich begleite euch beim Grosswerden, von 1 bis 16.'},
   {p:'zeigt', t:'Für Eltern und für Kinder', x:'Eltern finden Rat und Hilfe. Kinder lernen in meinem Schulhaus. Zurück zu den Eltern: Haus-Knopf lange drücken.'},
   {p:'atmet', t:'Ich bin keine Ärztin', x:'Ich erkläre, ermutige und zeige den Weg zu Fachpersonen. Alles bleibt auf diesem Gerät. Wenn es eilt: Hilfe ist immer einen Tipp entfernt.'}
  ];
  let obI = 0, obEl = null;
  function obZeigen(){
    if(!obEl){ obEl = document.createElement('div'); obEl.className = 'pause ma-ob'; obEl.setAttribute('role','dialog'); obEl.setAttribute('aria-label','Einführung'); root.appendChild(obEl); }
    const o = OB[obI];
    obEl.innerHTML = `<div class="card gold" style="text-align:center;max-width:420px">${stage(o.p,'',130)}<h2 style="margin:14px 0 6px">${esc(o.t)}</h2><p>${esc(o.x)}</p>
      <div class="dots">${OB.map((_,i)=>`<i class="${i===obI?'on':''}"></i>`).join('')}</div>
      <button class="btn block" data-act="obWeiter">${obI===OB.length-1?'Los geht es':'Weiter'}</button><button class="btn alt block" data-act="obZu">Überspringen</button></div>`;
  }
  function obWeiter(){ if(obI < OB.length-1){ obI++; obZeigen(); } else obZu(); }
  function obZu(){ store.set('obDone', true); if(obEl){ obEl.remove(); obEl = null; } }

  /* ---------- Ereignisse (nur innerhalb des Bereichs) ---------- */
  root.addEventListener('click', e=>{
    const akt = e.target.closest('[data-ma-actor]');
    if(akt && root.contains(akt)){
      akt.classList.remove('ma-hops'); void akt.offsetWidth; akt.classList.add('ma-hops');
      const b = akt.parentNode && akt.parentNode.querySelector('.bubble'); const txt = b ? b.textContent.trim() : '';
      if(txt) say(txt); haptic(10); return;
    }
    if(e.target.closest('[data-hold]')){ toast('Für Eltern: Haus lange drücken'); return; }
    const t = e.target.closest('button, .check, .tile, input[type=checkbox]'); if(!t || !root.contains(t)) return;
    const d = t.dataset;
    if(d.age){ state.age = d.age; store.set('age', d.age); rechnen.lvl=null; rechnen.cur=null; lese.cur=null; render(); return; }
    if(d.mode){ setMode(d.mode, d.to); return; }
    if(d.go){ if(!d.go.startsWith('uebung:')) bodyRun = null; go(d.go); return; }
    if(d.run){ startRun(d.run); return; }
    if(d.sos){ sos(); return; }
    if(d.say){ say(d.say); return; }
    if(d.proto){ store.set('protoArt', d.proto); root.querySelectorAll('[data-proto]').forEach(b=>b.classList.toggle('sel', b===t)); return; }
    if(d.strength){ let st = store.get('staerken', []); st = st.includes(d.strength) ? st.filter(x=>x!==d.strength) : st.concat(d.strength); store.set('staerken', st);
      const s = STRENGTHS.find(x=>x.k===d.strength); render(); if(st.includes(d.strength)){ say(s.l+'! Das ist eine Superkraft.'); pose('jubelt', 1500); } return; }
    if(d.mood){ const nm = $('#ma-kname'); if(nm){ state.kidName = nm.value.trim().slice(0,30); store.set('kidName', state.kidName); } state.mood = d.mood;
      learnUp(l=>{ l.moods = (l.moods||[]).concat(d.mood).slice(-30); }); rechnen.lvl=null; render();
      say(d.mood==='schnecke'?'Danke, dass du es sagst. Wir machen es heute kurz.':'Super! Zuerst ankommen, dann wählst du ein Zimmer.'); return; }
    if(d.animal){ store.set('animal', {d:new Date().toDateString(), n:d.animal}); render(); const a=ANIMALS.find(x=>x.n===d.animal); say(a.n+'. '+a.m); return; }
    if(d.rit!==undefined){ const today=new Date().toDateString(); let r=store.get('ritual',{d:today,s:[]}); if(r.d!==today) r={d:today,s:[]}; const i=+d.rit;
      r.s = r.s.includes(i)? r.s.filter(x=>x!==i) : r.s.concat(i); store.set('ritual', r); render(); if(r.s.length===RITUAL.length){ celebrate(); say('Alles geschafft! Gute Nacht.'); } return; }
    if(d.chk!==undefined){ t.classList.toggle('done'); t.querySelector('.e').textContent = t.classList.contains('done')?'✅':'⬜'; return; }
    if(d.focus){ clearTimers(); let s = +d.focus*60; const tt=$('#ma-fk-t'), ll=$('#ma-fk-l'); ll.textContent='Eine Aufgabe. Los geht es.'; say('Los geht es. Eine Aufgabe, volle Aufmerksamkeit.');
      const f=()=>{ tt.textContent = String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); };
      f(); const iv=setInterval(()=>{ s--; if(!$('#ma-fk-t')){clearInterval(iv);return;} f(); if(s<=0){ clearInterval(iv); ll.textContent='Geschafft! Jetzt bewegen.'; celebrate(); movePause(); } },1000); timers.push(iv); return; }
    if(d.lese){ const c = lese.cur; if(!c) return; const ok = d.lese===c.right; t.classList.add(ok?'ok':'no'); spanAdd('lesen', ok); learnUp(l=>{ l.lesenAll++; if(ok) l.lesenOk++; });
      if(!ok){ pose('denkt'); say('Fast. Hör genau: '+c.item.w+'. Es beginnt mit '+c.right+'.'); return; }
      lese.n++; lese.ok++; pose('jubelt'); say('Ja! '+c.item.w+' beginnt mit '+c.right+'.');
      later(()=>{ lese.cur=null; if(lese.n>=blockLen()){ lese.n=0; celebrate(); toast('⭐ Stern im Lese-Zimmer'); movePause(()=>go('schule')); } else render(); },1200); return; }
    if(d.rech){ const c = rechnen.cur; if(!c) return; const ok = +d.rech===c.res; t.classList.add(ok?'ok':'no'); spanAdd('rechnen', ok); learnUp(l=>{ l.rechnenAll++; if(ok) l.rechnenOk++; });
      if(!ok){ rechnen.streak=0; if(rechnen.lvl>0 && !rechnen.missed) rechnen.missed=true; else if(rechnen.lvl>0){ rechnen.lvl--; rechnen.missed=false; learnUp(l=>{ l.lvl = rechnen.lvl; }); }
        pose('denkt'); say('Schau mal: '+explainRechnen(c)); toast(explainRechnen(c)); return; }
      rechnen.n++; rechnen.streak++; rechnen.missed=false; pose('jubelt'); say('Richtig! '+explainRechnen(c));
      if(rechnen.streak>=3 && rechnen.lvl<5){ rechnen.lvl++; rechnen.streak=0; toast('Nächste Stufe 🚀'); }
      learnUp(l=>{ l.lvl = rechnen.lvl; });
      later(()=>{ rechnen.cur=null; if(rechnen.n>=blockLen()){ rechnen.n=0; celebrate(); toast('⭐ Stern im Rechen-Zimmer'); movePause(()=>go('schule')); } else render(); },1400); return; }
    switch(d.act){
      case 'voice': state.voice=!state.voice; store.set('voice', state.voice); if(!state.voice) stopSay(); render(); break;
      case 'home': mode=null; store.set('mode', null); view='home'; stopSay(); clearTimers(); render(); toTop(); break;
      case 'resetMood': state.mood=null; render(); break;
      case 'sayWord': if(lese.cur) say(lese.cur.item.w); break;
      case 'rhyme': say(RHYME); break;
      case 'skip': if(bodyRun){ bodyRun.i++; if(bodyRun.i<bodyRun.list.length) go('uebung:'+bodyRun.list[bodyRun.i]); else { bodyRun=null; go(mode==='eltern'?'fuerdich':'koerper'); } } break;
      case 'bodyStop': bodyRun=null; go(mode==='eltern'?'fuerdich':'koerper'); break;
      case 'ritReset': store.set('ritual', {d:new Date().toDateString(), s:[]}); render(); break;
      case 'addMoment': { const v=$('#ma-mtext').value.trim(); if(!v) return; const l=store.get('moments',[]); l.push({d:new Date().toLocaleDateString('de-CH'), t:v}); store.set('moments', l); toast('✨ Gespeichert'); celebrate(); render(); break; }
      case 'saveIdea': { const v=$('#ma-stext').value.trim(); if(!v) return; const l=store.get('moments',[]); l.push({d:new Date().toLocaleDateString('de-CH'), t:'Idee: '+v}); store.set('moments', l); toast('✨ Gespeichert'); pose('jubelt',1500); say('Was für eine Idee! Wie bist du darauf gekommen?'); break; }
      case 'addNote': { const v=$('#ma-ntext').value.trim(); const m=$('#ma-ndauer').value.trim(); if(!v && !m) return; const l=store.get('notes',[]);
        l.push({d:new Date().toLocaleString('de-CH'), ts:Date.now(), a:store.get('protoArt','anderes'), min:m?String(Math.min(999,Math.max(0,parseInt(m,10)||0))):'', t:v}); store.set('notes', l); toast('📝 Gespeichert'); render(); break; }
      case 'copyNotes': { const l=store.get('notes',[]); const txt=l.map(n=>{ const p=PROTO_ARTEN.find(x=>x.k===n.a); return n.d+(p?' ['+p.l+']':'')+(n.min?' '+n.min+' Min.':'')+': '+n.t; }).join('\n'); copy(txt); break; }
      case 'copyQuestions': copy(ARZT_FRAGEN.map(q=>'- '+q).join('\n')); break;
      case 'savePlan': store.set('plan', {date:$('#ma-pdate').value, topics:$('#ma-ptop').value}); render(); break;
      case 'shareOk': store.set('shareOk', !!t.checked); render(); break;
      case 'shareNow': shareNow(); break;
      case 'erzaehl': erzaehl(); break;
      case 'kiFrag': kiFrag(t); break;
      case 'obWeiter': obWeiter(); break;
      case 'obZu': obZu(); break;
      case 'obStart': obI = 0; obZeigen(); break;
      case 'forget': if(window.confirm('Alle Lern-Zahlen, den Affenfüsse-Kalender und die Superkräfte löschen? Notizen und Momente bleiben.')){ ['learn','af','span','staerken','shareOk'].forEach(store.del); rechnen.lvl=null; toast('🧽 Vergessen'); render(); } break;
    }
  });
  root.addEventListener('keydown', e=>{ if((e.key==='Enter'||e.key===' ') && e.target.matches('.check')){ e.preventDefault(); e.target.click(); } });
  /* Kindermodus: Haus-Knopf lange drücken (Elternsperre light) */
  let holdT = null;
  root.addEventListener('pointerdown', e=>{ const b = e.target.closest('[data-hold]'); if(!b) return; e.preventDefault(); const bar=b.querySelector('.bar'); bar.style.transition='width 1.5s linear'; bar.style.width='100%';
    holdT = setTimeout(()=>{ mode=null; store.set('mode', null); view='home'; state.mood=null; stopSay(); clearTimers(); render(); toTop(); },1500); });
  const holdEnd = ()=>{ clearTimeout(holdT); const bar=root.querySelector('[data-hold] .bar'); if(bar){ bar.style.transition='none'; bar.style.width='0'; } };
  ['pointerup','pointercancel'].forEach(ev=>root.addEventListener(ev, holdEnd)); root.addEventListener('pointerleave', holdEnd, true);
  document.addEventListener('drlab-feedback-open', stopSay);
  // Runde 3: Kein Erklär-Overlay beim ersten Öffnen. Die Startseite erklärt sich selbst, «So begleite ich euch» zeigt die Einführung.

  render();
  const api = { go, setMode, stop(){ stopSay(); clearTimers(); } };
  root.__ma = api;
  return api;
}

window.MamaAffe = { mount, version:'2026-10-19' };
function auto(){ addSeele(); document.querySelectorAll('[data-mama-affe]').forEach(el=>mount(el)); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
