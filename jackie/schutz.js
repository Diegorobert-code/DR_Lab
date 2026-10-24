/* Jacky Roberts · Schutzraum «Wenn es zuhause nicht sicher ist»
   Grundsatz: Die gefährlichste Person sieht vielleicht das Handy.
   - Ohne Konto, ohne Anmeldung, ohne Netz (feste Texte, keine KI, keine Server-Anfrage).
   - Speichert NICHTS: kein localStorage, kein Verlauf, keine Lern-Zahlen. Eingaben leben nur im Arbeitsspeicher.
     Auch die gewählte Sprache wird nicht gespeichert (sie kommt aus der Spracheinstellung des Geräts).
   - Schnellausstieg: ein Knopf oben rechts (kein Schütteln, Entscheid Diego 14.10.), Escape am Computer.
     Ersetzt die Seite sofort durch ein Rezept (location.replace), «Zurück» führt nicht in den Hilfebereich.
   - Notrufe 117/144/112 ein Tipp, kein Zwischenschritt.
   - Sprachen: Deutsch, Français, Italiano, English (Runde 2, 19.10.). Einfache Sprache, die Nummern sind in
     allen Sprachen gleich. Übersetzungen vor Release fachlich prüfen lassen.
   Nummern Stand Oktober 2026 (Konzept apps/jackie/konzept-frauenhilfe-2026-10-14.md), vor Release neu prüfen.
   Ausland-Nummern (Seite «Nicht in der Schweiz?») ebenfalls vor Release prüfen. */
(function () {
  'use strict';
  var app = function () { return window.JackieApp || null; };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var tl = function (n) { return '<a href="tel:' + String(n).replace(/\s/g, '') + '">' + n + '</a>'; };

  /* ---------- Sprache (nur im Arbeitsspeicher) ---------- */
  var SPRACHEN = [['de', 'Deutsch'], ['fr', 'Français'], ['it', 'Italiano'], ['en', 'English']];
  var lang = (function () {
    try { var l = String((navigator.languages && navigator.languages[0]) || navigator.language || 'de').slice(0, 2).toLowerCase(); return /^(fr|it|en)$/.test(l) ? l : 'de'; } catch (e) { return 'de'; }
  })();

  /* ---------- Texte ---------- */
  var T = {
    de: {
      titel: 'Wenn es zuhause nicht sicher ist', exit: 'Verlassen ✕', exitAria: 'Seite sofort verlassen', weiter: 'Weiter',
      akut: 'Akute Gefahr?', akutRuf: '117 anrufen', sprache: 'Sprache',
      satz: 'Ich bin da. Du entscheidest, was du tust. Meine Schuhe bringen dich nicht weg von allem, sondern zur nächsten sicheren Tür.',
      fuss: 'Ohne Konto. Ohne Anmeldung. Diese Seiten speichern nichts und funktionieren auch ohne Internet.<br>Jacky ersetzt keine Beratung. Die Fachstellen gehen den Weg mit dir.',
      zurueck: 'Zurück zum Familienalltag',
      tabs: { sofort: 'Sofort', check: 'Bin ich betroffen?', hilfe: 'Hilfe finden', plan: 'Sicherheitsplan', tasche: 'Notfalltasche', rechte: 'Deine Rechte', kinder: 'Kinder', angehoerige: 'Für Angehörige', selbst: 'Angst, selbst zu schlagen', ausland: 'Nicht in der Schweiz?' },
      anrufliste: 'Der Anruf steht danach in deiner Anrufliste. Lösche ihn, wenn das für dich sicherer ist.',
      beratung: 'Lass dich beraten: ' + tl('142') + ' Opferhilfe, rund um die Uhr, gratis und vertraulich.',
      geprueft: 'Nummern geprüft: Oktober 2026.',
      n117: ['Polizei', 'Gewalt, Drohung, jemand ist in Gefahr'], n144: ['Sanität', 'Verletzung, Atemnot, Bewusstlosigkeit'], n112: ['Euronotruf', 'Europaweit'],
      n142: ['Opferhilfe Schweiz', 'Gratis, vertraulich, auch für Angehörige. Kein Notruf.'], n143: ['Die Dargebotene Hand', 'Anonym, wenn alles zu viel ist'],
      n147: ['Pro Juventute', 'Für Kinder und Jugendliche, Tag und Nacht'], eltern: ['Elternnotruf', '24 Stunden, für Eltern in Krisen'],
      introH: 'Du bist nicht allein.', introP: 'Du entscheidest, was du tust. Hier sind Menschen, die dir zuhören und helfen, gratis und vertraulich.',
      hGefahr: 'Jetzt in Gefahr', hReden: 'Reden, rund um die Uhr',
      stummT: 'Wenn du nicht sprechen kannst',
      stumm: ['Ruf 117 trotzdem an. Wenn es geht, sag leise nur deine Adresse.', 'Bitte eine Nachbarin, eine Freundin oder jemanden in der Nähe, für dich anzurufen.', 'Zeig das stille Handzeichen (unten). Viele Menschen kennen es.', 'Mach ein Codewort mit einer Vertrauensperson ab. Wenn du es schickst, ruft sie die Polizei.'],
      zeichenT: 'Das stille Handzeichen «Signal for Help»', zeichenP: 'Hand zeigen, Daumen in die Handfläche legen, Finger darüber schliessen. Wer es sieht, kann für dich Hilfe holen.',
      zeichen: ['1 · Hand zeigen', '2 · Daumen einklappen', '3 · Finger schliessen'],
      fhT: 'Frauenhaus', fhP: 'Frauenhäuser nehmen dich und deine Kinder auf, auch mitten in der Nacht. Die Adressen sind geheim, damit du dort sicher bist. Die Opferhilfe (' + tl('142') + ') vermittelt dir einen Platz.',
      checkIntro: 'Sechs kurze Fragen. Es gibt kein richtig oder falsch. Nichts wird gespeichert.', frage: function (i, n) { return 'Frage ' + i + ' von ' + n; },
      opts: { ja: 'Ja', manchmal: 'Manchmal', nein: 'Nein', weiss: 'Ich weiss nicht' }, eineZurueck: 'Eine Frage zurück',
      fragen: ['Hast du manchmal Angst vor deinem Partner, deiner Partnerin, deinem Ex oder jemandem zuhause?', 'Wirst du beschimpft, kleingemacht oder vor anderen lächerlich gemacht?', 'Kontrolliert jemand dein Handy, dein Geld oder mit wem du dich triffst?', 'Wurdest du gestossen, geschlagen, gewürgt oder festgehalten?', 'Wirst du zu Sex oder sexuellen Handlungen gedrängt oder gezwungen?', 'Droht dir jemand, deinen Kindern, deinen Tieren, oder damit, sich selbst etwas anzutun?'],
      keinT: 'Danke, dass du hingeschaut hast.', keinP: 'Aus deinen Antworten lese ich keine Gewalt heraus. Wenn du dir trotzdem Sorgen machst, ist das Grund genug, mit jemandem zu reden. Dein Gefühl zählt.',
      jaT: 'Was du beschreibst, kann Gewalt sein.', jaP: '<p>Gewalt hat viele Formen: Worte, Kontrolle, Geld, Drohungen, Schläge, Sex gegen deinen Willen. <b>Du bist nicht schuld.</b> Niemand hat das Recht, dir Angst zu machen.</p><p>Du musst heute nichts entscheiden. Reden hilft, und es kostet nichts.</p>',
      ernstT: 'Das ist ernst.', ernstP: 'Schläge, Würgen und Drohungen sind gefährlich, auch wenn man danach nichts sieht. Nach einem Würgen bitte ärztlich anschauen lassen. Wenn du jetzt in Gefahr bist: ' + tl('117') + '.',
      n142kurz: 'Rund um die Uhr, gratis, vertraulich', planBtn: 'Sicherheitsplan ansehen', nochmals: 'Nochmals', keineDiagnose: 'Dieses Ergebnis ist keine Diagnose und wird nicht gespeichert.',
      ohT: 'Opferhilfe – der erste Anruf', ohP: 'Die Opferhilfe berät dich gratis und vertraulich, auch ohne Anzeige bei der Polizei. Sie hilft dir weiter: Frauenhaus, Ärztin, Anwältin, Geld für das Nötigste.', ohSub: '24 Stunden, ganze Schweiz',
      fh2P: 'Ein sicherer Ort für dich und deine Kinder. Die Adressen sind geheim. Den Platz vermittelt dir die Opferhilfe (142) oder die Polizei (117).',
      alleT: 'Für alle Menschen', alleP: 'Die Opferhilfe ist für alle da: egal welches Geschlecht, welche Liebe, welche Herkunft, welche Sprache. Auch wenn du keinen Pass oder keine geregelte Aufenthaltsbewilligung hast, darfst du anrufen. Frag nach, was in deiner Lage möglich ist.',
      kantonT: 'Beratung in deinem Kanton', kantonP: 'Jeder Kanton hat Opferberatungsstellen. Das offizielle Verzeichnis:', kantonLink: 'opferhilfe-schweiz.ch · Beratungsstellen nach Kanton', verlauf: 'Eine Website bleibt im Browser-Verlauf. Lösche ihn danach, wenn nötig.',
      sexT: 'Sexuelle Gewalt (Zürich)', sexName: 'Frauenberatung sexuelle Gewalt', sexSub: 'Kantonal anerkannte Beratung, Bürozeiten',
      zuvielT: 'Wenn alles zu viel ist', n143tag: 'Anonym, Tag und Nacht',
      planIntro: 'Schritt für Schritt, in deinem Tempo. <b>Nichts davon wird gespeichert.</b> Wenn du die Seite schliesst, ist alles weg. Du kannst ihn ausdrucken und sicher aufbewahren.',
      plan: [
        ['Wer hilft mir?', 'Eine Person, der du vertraust: Freundin, Nachbarin, Schwester, Kollegin.', 'Name und Nummer (auswendig oder auf Papier)'],
        ['Unser Codewort', 'Ein harmloses Wort. Wenn du es schickst oder sagst, ruft sie die Polizei.', 'z. B. «Hast du noch Mehl?»'],
        ['Wohin kann ich gehen?', 'Zu einer Vertrauensperson, ins Frauenhaus (über 142) oder an einen belebten Ort.', 'Ort'],
        ['Mein Weg nach draussen', 'Welche Tür, welcher Ausgang? Bei Streit eher weg von Küche und Bad, dort gibt es harte Kanten und Messer.', 'Weg'],
        ['Was ich mitnehme', 'Ausweise, Geld, Medikamente, Handy und Ladekabel. Siehe Notfalltasche.'],
        ['Meine Kinder', 'Ein sicherer Raum, ein Satz für den Notfall: «Lauf zu Frau …» oder «Ruf 117». Kinder nie zwischen euch stellen.'],
        ['Meine Tiere', 'Wer könnte sie aufnehmen? Manche Frauenhäuser helfen auch dabei, frag bei 142.'],
        ['Mein Handy', 'Standort-Freigaben und geteilte Konten prüfen, Code ändern, Anrufliste und Verlauf löschen, wenn nötig.']
      ],
      druck: 'Ausdrucken', leeren: 'Alles leeren',
      taschIntro: 'Eine kleine Tasche, die bereit ist. Am sichersten bei einer Vertrauensperson. Die Häkchen werden nicht gespeichert.',
      tasche: ['Ausweis, Pass, Aufenthaltsbewilligung', 'Krankenkassenkarte', 'Medikamente und Rezepte', 'Bargeld, Bankkarte', 'Handy und Ladekabel', 'Haus- und Autoschlüssel', 'Wichtige Nummern auf Papier', 'Kopien: Mietvertrag, Geburtsurkunden, Familienbüchlein', 'Arztberichte, Fotos, Nachrichten als Beweis', 'Kleider für zwei Tage', 'Für die Kinder: Lieblingskuscheltier, Schulsachen'],
      bereit: function (n, t) { return n + ' von ' + t + ' bereit.'; },
      rechteIntro: 'Kurz und allgemein für die Schweiz. Das ist keine Rechtsberatung. Was in deinem Fall gilt, sagt dir eine Beratungsstelle.',
      rechte: [
        ['Beratung ohne Anzeige', 'Die Opferhilfe berät dich gratis und vertraulich. Du musst dafür keine Anzeige machen.'],
        ['Hilfe bei Kosten', 'Die Opferhilfe kann helfen, wenn Kosten anfallen: Unterkunft, Ärztin, Therapie, Anwältin. Frag nach, was in deinem Fall möglich ist.'],
        ['Wegweisung und Kontaktverbot', 'Die Polizei kann eine gewalttätige Person für einige Tage aus der Wohnung weisen. Ein Gericht kann Kontakt- und Annäherungsverbote anordnen. Die Regeln sind je nach Kanton verschieden.'],
        ['Die Polizei ermittelt oft von sich aus', 'Viele Formen von Gewalt in der Partnerschaft verfolgt die Polizei auch ohne deine Anzeige. Lass dich vorher beraten, wenn du unsicher bist.'],
        ['Spuren sichern', 'Lass Verletzungen ärztlich festhalten, auch wenn du (noch) keine Anzeige willst. Bewahre Nachrichten und Fotos an einem sicheren Ort auf.'],
        ['Aufenthalt', 'Ist deine Aufenthaltsbewilligung an die Ehe gebunden? Für Betroffene von häuslicher Gewalt gibt es besondere Regeln. Bitte lass dich beraten, bevor du etwas entscheidest.']
      ],
      kinderT: 'Kinder erleben Gewalt mit', kinderP: 'Auch wenn sie nicht selbst geschlagen werden, spüren Kinder Angst und Streit. Das ist nicht deine Schuld. Hilfe für dich ist auch Hilfe für sie.',
      kinderHilfT: 'Was Kindern hilft', kinderHilf: ['Ein sicherer Raum und ein Satz für den Notfall.', 'Ihnen sagen: «Es ist nicht deine Schuld.»', 'Sie nie als Botin oder Bote zwischen euch schicken.'],
      n142kinder: 'Berät auch Kinder und Eltern', n117kind: 'Wenn ein Kind in Gefahr ist',
      angIntro: 'Du machst dir Sorgen um eine Freundin, Schwester, Tochter oder Nachbarin?',
      angT: 'So hilfst du, ohne sie zu gefährden', ang: ['Zuhören und glauben. Sag: «Ich bin da. Du bist nicht schuld.»', 'Nicht drängen. Sie entscheidet, wann und wie.', 'Die Person, die Gewalt ausübt, nicht selbst zur Rede stellen. Das kann es gefährlicher machen.', 'Ein Codewort anbieten und erreichbar bleiben.', 'Keine Nachrichten über Gewalt auf ihr Handy schicken. Lieber persönlich reden.'],
      auchT: 'Auch du darfst Hilfe holen', auchP: 'Die Opferhilfe berät auch Angehörige.', n142ang: 'Gratis, vertraulich', akutT: 'Bei akuter Gefahr', n117ang: 'Ruf an, wenn du Schreie oder Schläge hörst',
      selbstIntro: 'Du hast Angst, die Kontrolle zu verlieren und jemandem wehzutun? Dass du hier nachschaust, ist ein mutiger erster Schritt. Hilfe holen ist stark.',
      selbstJetztT: 'Jetzt, in diesem Moment', selbstJetzt: ['Geh aus dem Raum, bevor etwas passiert. Sag nur: «Ich brauche fünf Minuten.»', 'Atme langsam aus, länger als ein. Halte die Hände unter kaltes Wasser.', 'Leg das Handy weg. Schreib keine Nachricht, solange du wütend bist.', 'Sind Kinder da: Ruf jemanden an, der kommen kann, bis du ruhig bist.'],
      selbstRedenT: 'Reden, anonym', n143selbst: 'Hört dir zu, ohne zu urteilen. Tag und Nacht.', elternSelbst: 'Wenn du Angst hast, deinem Kind wehzutun',
      selbstBerT: 'Beratung gegen Gewalt', selbstBerP: 'In vielen Kantonen gibt es Beratungen und Lernprogramme für Menschen, die Gewalt ausüben oder Angst davor haben. Die Dargebotene Hand (' + tl('143') + ') hilft dir, eine Stelle in deiner Nähe zu finden.',
      selbstGefahrT: 'Ist jemand in Gefahr?', n117selbst: 'Sofort anrufen, auch wenn du es selbst bist, der Angst macht',
      auslandIntro: 'Bist du gerade nicht in der Schweiz? Die Nummer ' + tl('112') + ' hilft in ganz Europa. Diese Nummern gelten nur im jeweiligen Land.',
      land: { de: 'Deutschland', at: 'Österreich', fr: 'Frankreich', it: 'Italien', es: 'Spanien' },
      polizei: 'Polizei', notruf: 'Notruf', hDe: 'Hilfetelefon Gewalt gegen Frauen, 24 h, viele Sprachen', hAt: 'Frauenhelpline gegen Gewalt, 24 h', hFr: 'Violences Femmes Info', hIt: 'Antiviolenza e stalking, 24 h', hEs: 'Hilfe bei Gewalt gegen Frauen, 24 h',
      stand: 'Stand Oktober 2026.'
    },

    fr: {
      titel: 'Quand la maison n’est pas sûre', exit: 'Quitter ✕', exitAria: 'Quitter la page tout de suite', weiter: 'Continuer',
      akut: 'Danger immédiat ?', akutRuf: 'Appeler le 117', sprache: 'Langue',
      satz: 'Je suis là. C’est toi qui décides. Mes chaussures ne t’emmènent pas loin de tout, mais vers la prochaine porte sûre.',
      fuss: 'Sans compte. Sans inscription. Ces pages n’enregistrent rien et fonctionnent aussi sans internet.<br>Jacky ne remplace pas une consultation. Les services spécialisés font le chemin avec toi.',
      zurueck: 'Retour au quotidien',
      tabs: { sofort: 'Tout de suite', check: 'Suis-je concernée ?', hilfe: 'Trouver de l’aide', plan: 'Plan de sécurité', tasche: 'Sac d’urgence', rechte: 'Tes droits', kinder: 'Enfants', angehoerige: 'Pour les proches', selbst: 'Peur de frapper moi-même', ausland: 'Pas en Suisse ?' },
      anrufliste: 'L’appel reste ensuite dans ta liste d’appels. Efface-le si c’est plus sûr pour toi.',
      beratung: 'Demande conseil : ' + tl('142') + ' Aide aux victimes, jour et nuit, gratuit et confidentiel.',
      geprueft: 'Numéros vérifiés : octobre 2026.',
      n117: ['Police', 'Violence, menace, quelqu’un est en danger'], n144: ['Ambulance', 'Blessure, difficulté à respirer, perte de connaissance'], n112: ['Numéro d’urgence européen', 'Dans toute l’Europe'],
      n142: ['Aide aux victimes Suisse', 'Gratuit, confidentiel, aussi pour les proches. Pas un numéro d’urgence.'], n143: ['La Main Tendue', 'Anonyme, quand tout devient trop lourd'],
      n147: ['Pro Juventute', 'Pour les enfants et les jeunes, jour et nuit'], eltern: ['Elternnotruf (en allemand)', '24 heures, pour les parents en crise'],
      introH: 'Tu n’es pas seule.', introP: 'C’est toi qui décides. Ici, il y a des personnes qui t’écoutent et t’aident, gratuitement et en toute confidentialité.',
      hGefahr: 'En danger maintenant', hReden: 'Parler, jour et nuit',
      stummT: 'Si tu ne peux pas parler',
      stumm: ['Appelle quand même le 117. Si possible, dis seulement ton adresse, à voix basse.', 'Demande à une voisine, une amie ou une personne proche d’appeler pour toi.', 'Montre le signe de la main silencieux (ci-dessous). Beaucoup de gens le connaissent.', 'Convenez d’un mot code avec une personne de confiance. Si tu l’envoies, elle appelle la police.'],
      zeichenT: 'Le signe silencieux « Signal for Help »', zeichenP: 'Montrer la main, plier le pouce dans la paume, refermer les doigts dessus. La personne qui le voit peut chercher de l’aide pour toi.',
      zeichen: ['1 · Montrer la main', '2 · Plier le pouce', '3 · Fermer les doigts'],
      fhT: 'Foyer pour femmes', fhP: 'Les foyers accueillent toi et tes enfants, même au milieu de la nuit. Les adresses sont secrètes pour que tu y sois en sécurité. L’Aide aux victimes (' + tl('142') + ') te trouve une place.',
      checkIntro: 'Six questions courtes. Il n’y a pas de bonne ou de mauvaise réponse. Rien n’est enregistré.', frage: function (i, n) { return 'Question ' + i + ' sur ' + n; },
      opts: { ja: 'Oui', manchmal: 'Parfois', nein: 'Non', weiss: 'Je ne sais pas' }, eineZurueck: 'Question précédente',
      fragen: ['As-tu parfois peur de ton partenaire, de ta partenaire, de ton ex ou de quelqu’un à la maison ?', 'Est-ce qu’on t’insulte, te rabaisse ou se moque de toi devant les autres ?', 'Est-ce que quelqu’un contrôle ton téléphone, ton argent ou les personnes que tu vois ?', 'As-tu été poussée, frappée, étranglée ou retenue de force ?', 'Est-ce qu’on te pousse ou te force à avoir des relations sexuelles ?', 'Est-ce que quelqu’un te menace, toi, tes enfants, tes animaux, ou menace de se faire du mal ?'],
      keinT: 'Merci d’avoir pris le temps de regarder.', keinP: 'Dans tes réponses, je ne vois pas de violence. Si tu es quand même inquiète, c’est une raison suffisante pour en parler à quelqu’un. Ton ressenti compte.',
      jaT: 'Ce que tu décris peut être de la violence.', jaP: '<p>La violence a beaucoup de formes : des mots, du contrôle, l’argent, des menaces, des coups, du sexe contre ta volonté. <b>Ce n’est pas ta faute.</b> Personne n’a le droit de te faire peur.</p><p>Tu n’as rien à décider aujourd’hui. Parler aide, et c’est gratuit.</p>',
      ernstT: 'C’est grave.', ernstP: 'Les coups, l’étranglement et les menaces sont dangereux, même si on ne voit rien après. Après un étranglement, fais-toi examiner par un médecin. Si tu es en danger maintenant : ' + tl('117') + '.',
      n142kurz: 'Jour et nuit, gratuit, confidentiel', planBtn: 'Voir le plan de sécurité', nochmals: 'Recommencer', keineDiagnose: 'Ce résultat n’est pas un diagnostic et n’est pas enregistré.',
      ohT: 'Aide aux victimes – le premier appel', ohP: 'L’Aide aux victimes te conseille gratuitement et en toute confidentialité, même sans plainte à la police. Elle t’aide pour la suite : foyer, médecin, avocate, argent pour l’essentiel.', ohSub: '24 heures, toute la Suisse',
      fh2P: 'Un lieu sûr pour toi et tes enfants. Les adresses sont secrètes. L’Aide aux victimes (142) ou la police (117) te trouve une place.',
      alleT: 'Pour tout le monde', alleP: 'L’Aide aux victimes est là pour tout le monde : quel que soit ton genre, ton amour, ton origine, ta langue. Même sans passeport ou sans permis de séjour réglé, tu peux appeler. Demande ce qui est possible dans ta situation.',
      kantonT: 'Conseil dans ton canton', kantonP: 'Chaque canton a des centres de consultation pour les victimes. La liste officielle :', kantonLink: 'opferhilfe-schweiz.ch · centres par canton', verlauf: 'Un site web reste dans l’historique du navigateur. Efface-le ensuite si nécessaire.',
      sexT: 'Violence sexuelle (Zurich)', sexName: 'Frauenberatung sexuelle Gewalt', sexSub: 'Centre reconnu du canton de Zurich, heures de bureau',
      zuvielT: 'Quand tout devient trop lourd', n143tag: 'Anonyme, jour et nuit',
      planIntro: 'Pas à pas, à ton rythme. <b>Rien n’est enregistré.</b> Quand tu fermes la page, tout disparaît. Tu peux l’imprimer et le garder en lieu sûr.',
      plan: [
        ['Qui m’aide ?', 'Une personne de confiance : une amie, une voisine, une sœur, une collègue.', 'Nom et numéro (par cœur ou sur papier)'],
        ['Notre mot code', 'Un mot banal. Si tu l’envoies ou le dis, elle appelle la police.', 'p. ex. « Tu as encore de la farine ? »'],
        ['Où puis-je aller ?', 'Chez une personne de confiance, dans un foyer (par le 142) ou dans un lieu où il y a du monde.', 'Lieu'],
        ['Mon chemin vers la sortie', 'Quelle porte, quelle sortie ? Pendant une dispute, évite la cuisine et la salle de bain : il y a des coins durs et des couteaux.', 'Chemin'],
        ['Ce que je prends', 'Papiers, argent, médicaments, téléphone et chargeur. Voir le sac d’urgence.'],
        ['Mes enfants', 'Une pièce sûre, une phrase pour l’urgence : « Cours chez Madame … » ou « Appelle le 117 ». Ne jamais mettre les enfants entre vous.'],
        ['Mes animaux', 'Qui pourrait les accueillir ? Certains foyers aident aussi pour cela, demande au 142.'],
        ['Mon téléphone', 'Vérifier le partage de position et les comptes partagés, changer le code, effacer la liste d’appels et l’historique si nécessaire.']
      ],
      druck: 'Imprimer', leeren: 'Tout effacer',
      taschIntro: 'Un petit sac prêt à partir. Le plus sûr : chez une personne de confiance. Les coches ne sont pas enregistrées.',
      tasche: ['Carte d’identité, passeport, permis de séjour', 'Carte d’assurance maladie', 'Médicaments et ordonnances', 'Argent liquide, carte bancaire', 'Téléphone et chargeur', 'Clés de la maison et de la voiture', 'Numéros importants sur papier', 'Copies : bail, actes de naissance, livret de famille', 'Rapports médicaux, photos, messages comme preuves', 'Vêtements pour deux jours', 'Pour les enfants : doudou préféré, affaires d’école'],
      bereit: function (n, t) { return n + ' sur ' + t + ' prêts.'; },
      rechteIntro: 'En bref et en général pour la Suisse. Ce n’est pas un conseil juridique. Ce qui vaut dans ton cas, un centre de consultation te le dira.',
      rechte: [
        ['Conseil sans plainte', 'L’Aide aux victimes te conseille gratuitement et en toute confidentialité. Tu n’as pas besoin de porter plainte.'],
        ['Aide pour les frais', 'L’Aide aux victimes peut aider pour certains frais : logement, médecin, thérapie, avocate. Demande ce qui est possible dans ton cas.'],
        ['Expulsion et interdiction de contact', 'La police peut expulser une personne violente du logement pour quelques jours. Un tribunal peut interdire le contact et l’approche. Les règles varient selon le canton.'],
        ['La police enquête souvent d’elle-même', 'Beaucoup de formes de violence dans le couple sont poursuivies par la police même sans ta plainte. Demande conseil avant, si tu n’es pas sûre.'],
        ['Garder des traces', 'Fais constater les blessures par un médecin, même si tu ne veux pas (encore) porter plainte. Garde les messages et les photos dans un endroit sûr.'],
        ['Séjour', 'Ton permis de séjour dépend de ton mariage ? Il existe des règles spéciales pour les victimes de violence domestique. Demande conseil avant de décider quoi que ce soit.']
      ],
      kinderT: 'Les enfants vivent aussi la violence', kinderP: 'Même s’ils ne sont pas frappés eux-mêmes, les enfants sentent la peur et les disputes. Ce n’est pas ta faute. T’aider, c’est aussi les aider.',
      kinderHilfT: 'Ce qui aide les enfants', kinderHilf: ['Une pièce sûre et une phrase pour l’urgence.', 'Leur dire : « Ce n’est pas ta faute. »', 'Ne jamais les envoyer comme messagers entre vous.'],
      n142kinder: 'Conseille aussi les enfants et les parents', n117kind: 'Si un enfant est en danger',
      angIntro: 'Tu t’inquiètes pour une amie, une sœur, une fille ou une voisine ?',
      angT: 'Aider sans la mettre en danger', ang: ['Écouter et la croire. Dis : « Je suis là. Ce n’est pas ta faute. »', 'Ne pas la presser. C’est elle qui décide quand et comment.', 'Ne pas confronter toi-même la personne violente. Cela peut rendre la situation plus dangereuse.', 'Proposer un mot code et rester joignable.', 'Ne pas envoyer de messages sur la violence sur son téléphone. Plutôt parler en personne.'],
      auchT: 'Toi aussi, tu peux demander de l’aide', auchP: 'L’Aide aux victimes conseille aussi les proches.', n142ang: 'Gratuit, confidentiel', akutT: 'En cas de danger immédiat', n117ang: 'Appelle si tu entends des cris ou des coups',
      selbstIntro: 'Tu as peur de perdre le contrôle et de faire du mal à quelqu’un ? Venir lire ceci est un premier pas courageux. Demander de l’aide, c’est être fort.',
      selbstJetztT: 'Maintenant, tout de suite', selbstJetzt: ['Sors de la pièce avant que quelque chose arrive. Dis seulement : « J’ai besoin de cinq minutes. »', 'Expire lentement, plus longtemps que tu inspires. Mets tes mains sous l’eau froide.', 'Pose ton téléphone. N’écris pas de message tant que tu es en colère.', 'S’il y a des enfants : appelle quelqu’un qui peut venir, jusqu’à ce que tu sois calme.'],
      selbstRedenT: 'Parler, de façon anonyme', n143selbst: 'T’écoute sans juger. Jour et nuit.', elternSelbst: 'Si tu as peur de faire du mal à ton enfant (en allemand)',
      selbstBerT: 'Conseil contre la violence', selbstBerP: 'Dans beaucoup de cantons, il existe des consultations et des programmes pour les personnes qui exercent de la violence ou qui ont peur de le faire. La Main Tendue (' + tl('143') + ') t’aide à trouver un service près de chez toi.',
      selbstGefahrT: 'Quelqu’un est en danger ?', n117selbst: 'Appelle tout de suite, même si c’est toi qui fais peur',
      auslandIntro: 'Tu n’es pas en Suisse en ce moment ? Le ' + tl('112') + ' aide dans toute l’Europe. Ces numéros ne marchent que dans le pays indiqué.',
      land: { de: 'Allemagne', at: 'Autriche', fr: 'France', it: 'Italie', es: 'Espagne' },
      polizei: 'Police', notruf: 'Urgences', hDe: 'Hilfetelefon, violence contre les femmes, 24 h, plusieurs langues', hAt: 'Frauenhelpline contre la violence, 24 h', hFr: 'Violences Femmes Info', hIt: 'Antiviolenza e stalking, 24 h', hEs: 'Aide en cas de violence contre les femmes, 24 h',
      stand: 'État : octobre 2026.'
    },

    it: {
      titel: 'Quando a casa non sei al sicuro', exit: 'Esci ✕', exitAria: 'Lascia subito la pagina', weiter: 'Avanti',
      akut: 'Pericolo immediato?', akutRuf: 'Chiama il 117', sprache: 'Lingua',
      satz: 'Sono qui. Decidi tu cosa fare. Le mie scarpe non ti portano lontano da tutto, ma alla prossima porta sicura.',
      fuss: 'Senza account. Senza registrazione. Queste pagine non salvano niente e funzionano anche senza internet.<br>Jacky non sostituisce una consulenza. I servizi specializzati fanno la strada con te.',
      zurueck: 'Torna alla vita di tutti i giorni',
      tabs: { sofort: 'Subito', check: 'Mi riguarda?', hilfe: 'Trovare aiuto', plan: 'Piano di sicurezza', tasche: 'Borsa d’emergenza', rechte: 'I tuoi diritti', kinder: 'Bambini', angehoerige: 'Per familiari e amici', selbst: 'Paura di colpire io', ausland: 'Non in Svizzera?' },
      anrufliste: 'Dopo, la chiamata resta nell’elenco delle chiamate. Cancellala, se per te è più sicuro.',
      beratung: 'Chiedi consiglio: ' + tl('142') + ' Aiuto alle vittime, giorno e notte, gratis e confidenziale.',
      geprueft: 'Numeri verificati: ottobre 2026.',
      n117: ['Polizia', 'Violenza, minaccia, qualcuno è in pericolo'], n144: ['Ambulanza', 'Ferite, difficoltà a respirare, perdita di coscienza'], n112: ['Numero d’emergenza europeo', 'In tutta Europa'],
      n142: ['Aiuto alle vittime Svizzera', 'Gratis, confidenziale, anche per i familiari. Non è un numero d’emergenza.'], n143: ['Telefono Amico', 'Anonimo, quando tutto è troppo'],
      n147: ['Pro Juventute', 'Per bambini e giovani, giorno e notte'], eltern: ['Elternnotruf (in tedesco)', '24 ore, per genitori in crisi'],
      introH: 'Non sei sola.', introP: 'Decidi tu cosa fare. Qui ci sono persone che ti ascoltano e ti aiutano, gratis e in modo confidenziale.',
      hGefahr: 'In pericolo adesso', hReden: 'Parlare, giorno e notte',
      stummT: 'Se non puoi parlare',
      stumm: ['Chiama comunque il 117. Se puoi, di’ solo il tuo indirizzo, a bassa voce.', 'Chiedi a una vicina, a un’amica o a qualcuno vicino di chiamare per te.', 'Mostra il segnale silenzioso con la mano (sotto). Molte persone lo conoscono.', 'Concorda una parola in codice con una persona di fiducia. Se la mandi, lei chiama la polizia.'],
      zeichenT: 'Il segnale silenzioso «Signal for Help»', zeichenP: 'Mostrare la mano, piegare il pollice nel palmo, chiudere le dita sopra. Chi lo vede può cercare aiuto per te.',
      zeichen: ['1 · Mostrare la mano', '2 · Piegare il pollice', '3 · Chiudere le dita'],
      fhT: 'Casa delle donne', fhP: 'Le case protette accolgono te e i tuoi bambini, anche in piena notte. Gli indirizzi sono segreti, così lì sei al sicuro. L’Aiuto alle vittime (' + tl('142') + ') ti trova un posto.',
      checkIntro: 'Sei domande brevi. Non ci sono risposte giuste o sbagliate. Niente viene salvato.', frage: function (i, n) { return 'Domanda ' + i + ' di ' + n; },
      opts: { ja: 'Sì', manchmal: 'A volte', nein: 'No', weiss: 'Non lo so' }, eineZurueck: 'Domanda precedente',
      fragen: ['Hai a volte paura del tuo partner, della tua partner, del tuo ex o di qualcuno in casa?', 'Ti insultano, ti sminuiscono o ti prendono in giro davanti agli altri?', 'Qualcuno controlla il tuo telefono, i tuoi soldi o chi incontri?', 'Sei stata spinta, picchiata, strangolata o tenuta ferma con la forza?', 'Ti spingono o ti costringono ad avere rapporti sessuali?', 'Qualcuno minaccia te, i tuoi bambini, i tuoi animali, o minaccia di farsi del male?'],
      keinT: 'Grazie di aver guardato con attenzione.', keinP: 'Dalle tue risposte non vedo violenza. Se però sei preoccupata, è un motivo sufficiente per parlarne con qualcuno. Quello che senti conta.',
      jaT: 'Quello che descrivi può essere violenza.', jaP: '<p>La violenza ha molte forme: parole, controllo, soldi, minacce, botte, sesso contro la tua volontà. <b>Non è colpa tua.</b> Nessuno ha il diritto di farti paura.</p><p>Oggi non devi decidere niente. Parlare aiuta, ed è gratis.</p>',
      ernstT: 'È una cosa seria.', ernstP: 'Botte, strangolamento e minacce sono pericolosi, anche se dopo non si vede niente. Dopo uno strangolamento fatti visitare da un medico. Se sei in pericolo adesso: ' + tl('117') + '.',
      n142kurz: 'Giorno e notte, gratis, confidenziale', planBtn: 'Vedi il piano di sicurezza', nochmals: 'Ricomincia', keineDiagnose: 'Questo risultato non è una diagnosi e non viene salvato.',
      ohT: 'Aiuto alle vittime – la prima chiamata', ohP: 'L’Aiuto alle vittime ti consiglia gratis e in modo confidenziale, anche senza denuncia alla polizia. Ti aiuta ad andare avanti: casa protetta, medico, avvocata, soldi per il necessario.', ohSub: '24 ore, tutta la Svizzera',
      fh2P: 'Un posto sicuro per te e i tuoi bambini. Gli indirizzi sono segreti. Il posto te lo trova l’Aiuto alle vittime (142) o la polizia (117).',
      alleT: 'Per tutte le persone', alleP: 'L’Aiuto alle vittime è per tutti: qualunque sia il tuo genere, chi ami, da dove vieni, la tua lingua. Anche senza passaporto o senza permesso di soggiorno regolare puoi chiamare. Chiedi cosa è possibile nella tua situazione.',
      kantonT: 'Consulenza nel tuo cantone', kantonP: 'Ogni cantone ha centri di consulenza per le vittime. L’elenco ufficiale:', kantonLink: 'opferhilfe-schweiz.ch · centri per cantone', verlauf: 'Un sito resta nella cronologia del browser. Poi cancellala, se serve.',
      sexT: 'Violenza sessuale (Zurigo)', sexName: 'Frauenberatung sexuelle Gewalt', sexSub: 'Consulenza riconosciuta dal Canton Zurigo, orari d’ufficio',
      zuvielT: 'Quando tutto è troppo', n143tag: 'Anonimo, giorno e notte',
      planIntro: 'Passo dopo passo, con i tuoi tempi. <b>Niente viene salvato.</b> Quando chiudi la pagina, tutto sparisce. Puoi stamparlo e tenerlo in un posto sicuro.',
      plan: [
        ['Chi mi aiuta?', 'Una persona di fiducia: un’amica, una vicina, una sorella, una collega.', 'Nome e numero (a memoria o su carta)'],
        ['La nostra parola in codice', 'Una parola innocua. Se la mandi o la dici, lei chiama la polizia.', 'p. es. «Hai ancora della farina?»'],
        ['Dove posso andare?', 'Da una persona di fiducia, in una casa protetta (tramite il 142) o in un luogo con tanta gente.', 'Luogo'],
        ['La mia via d’uscita', 'Quale porta, quale uscita? Durante una lite stai lontana da cucina e bagno: ci sono spigoli duri e coltelli.', 'Via'],
        ['Cosa porto con me', 'Documenti, soldi, medicine, telefono e caricatore. Vedi borsa d’emergenza.'],
        ['I miei bambini', 'Una stanza sicura, una frase per l’emergenza: «Corri dalla signora …» o «Chiama il 117». Non mettere mai i bambini in mezzo.'],
        ['I miei animali', 'Chi potrebbe tenerli? Alcune case protette aiutano anche in questo, chiedi al 142.'],
        ['Il mio telefono', 'Controllare la condivisione della posizione e gli account condivisi, cambiare il codice, cancellare chiamate e cronologia se serve.']
      ],
      druck: 'Stampa', leeren: 'Cancella tutto',
      taschIntro: 'Una piccola borsa pronta. Il posto più sicuro: da una persona di fiducia. Le spunte non vengono salvate.',
      tasche: ['Carta d’identità, passaporto, permesso di soggiorno', 'Tessera della cassa malati', 'Medicine e ricette', 'Contanti, carta bancaria', 'Telefono e caricatore', 'Chiavi di casa e dell’auto', 'Numeri importanti su carta', 'Copie: contratto d’affitto, atti di nascita, libretto di famiglia', 'Referti medici, foto, messaggi come prove', 'Vestiti per due giorni', 'Per i bambini: peluche preferito, cose per la scuola'],
      bereit: function (n, t) { return n + ' di ' + t + ' pronti.'; },
      rechteIntro: 'In breve e in generale per la Svizzera. Non è una consulenza legale. Cosa vale nel tuo caso te lo dice un centro di consulenza.',
      rechte: [
        ['Consulenza senza denuncia', 'L’Aiuto alle vittime ti consiglia gratis e in modo confidenziale. Non devi fare una denuncia.'],
        ['Aiuto per le spese', 'L’Aiuto alle vittime può aiutare con alcune spese: alloggio, medico, terapia, avvocata. Chiedi cosa è possibile nel tuo caso.'],
        ['Allontanamento e divieto di contatto', 'La polizia può allontanare dall’alloggio una persona violenta per alcuni giorni. Un tribunale può vietare il contatto e l’avvicinamento. Le regole cambiano da cantone a cantone.'],
        ['La polizia indaga spesso da sola', 'Molte forme di violenza nella coppia vengono perseguite dalla polizia anche senza la tua denuncia. Se non sei sicura, chiedi prima consiglio.'],
        ['Conservare le prove', 'Fai documentare le ferite da un medico, anche se (ancora) non vuoi fare denuncia. Tieni messaggi e foto in un posto sicuro.'],
        ['Soggiorno', 'Il tuo permesso di soggiorno dipende dal matrimonio? Per le vittime di violenza domestica ci sono regole speciali. Chiedi consiglio prima di decidere qualcosa.']
      ],
      kinderT: 'Anche i bambini vivono la violenza', kinderP: 'Anche se non vengono picchiati, i bambini sentono la paura e le liti. Non è colpa tua. Aiutare te è anche aiutare loro.',
      kinderHilfT: 'Cosa aiuta i bambini', kinderHilf: ['Una stanza sicura e una frase per l’emergenza.', 'Dire loro: «Non è colpa tua.»', 'Non usarli mai come messaggeri tra di voi.'],
      n142kinder: 'Consiglia anche bambini e genitori', n117kind: 'Se un bambino è in pericolo',
      angIntro: 'Sei preoccupata per un’amica, una sorella, una figlia o una vicina?',
      angT: 'Aiutare senza metterla in pericolo', ang: ['Ascoltare e crederle. Di’: «Sono qui. Non è colpa tua.»', 'Non insistere. Decide lei quando e come.', 'Non affrontare tu la persona violenta. Può rendere tutto più pericoloso.', 'Proporre una parola in codice e restare raggiungibile.', 'Non mandare messaggi sulla violenza al suo telefono. Meglio parlare di persona.'],
      auchT: 'Anche tu puoi chiedere aiuto', auchP: 'L’Aiuto alle vittime consiglia anche familiari e amici.', n142ang: 'Gratis, confidenziale', akutT: 'In caso di pericolo immediato', n117ang: 'Chiama se senti urla o colpi',
      selbstIntro: 'Hai paura di perdere il controllo e di fare male a qualcuno? Guardare qui è un primo passo coraggioso. Chiedere aiuto è un segno di forza.',
      selbstJetztT: 'Adesso, in questo momento', selbstJetzt: ['Esci dalla stanza prima che succeda qualcosa. Di’ solo: «Ho bisogno di cinque minuti.»', 'Espira lentamente, più a lungo di quanto inspiri. Metti le mani sotto l’acqua fredda.', 'Metti via il telefono. Non scrivere messaggi finché sei arrabbiato.', 'Se ci sono bambini: chiama qualcuno che possa venire, finché sei calmo.'],
      selbstRedenT: 'Parlare, in modo anonimo', n143selbst: 'Ti ascolta senza giudicare. Giorno e notte.', elternSelbst: 'Se hai paura di fare male a tuo figlio (in tedesco)',
      selbstBerT: 'Consulenza contro la violenza', selbstBerP: 'In molti cantoni ci sono consulenze e programmi per chi esercita violenza o ha paura di farlo. Il Telefono Amico (' + tl('143') + ') ti aiuta a trovare un servizio vicino a te.',
      selbstGefahrT: 'Qualcuno è in pericolo?', n117selbst: 'Chiama subito, anche se sei tu a fare paura',
      auslandIntro: 'In questo momento non sei in Svizzera? Il ' + tl('112') + ' aiuta in tutta Europa. Questi numeri funzionano solo nel paese indicato.',
      land: { de: 'Germania', at: 'Austria', fr: 'Francia', it: 'Italia', es: 'Spagna' },
      polizei: 'Polizia', notruf: 'Emergenza', hDe: 'Hilfetelefon, violenza contro le donne, 24 h, molte lingue', hAt: 'Frauenhelpline contro la violenza, 24 h', hFr: 'Violences Femmes Info', hIt: 'Antiviolenza e stalking, 24 h', hEs: 'Aiuto per violenza contro le donne, 24 h',
      stand: 'Stato: ottobre 2026.'
    },

    en: {
      titel: 'When home is not safe', exit: 'Exit ✕', exitAria: 'Leave this page right now', weiter: 'Continue',
      akut: 'In danger right now?', akutRuf: 'Call 117', sprache: 'Language',
      satz: 'I am here. You decide what to do. My shoes do not take you away from everything, but to the next safe door.',
      fuss: 'No account. No sign-up. These pages save nothing and also work without internet.<br>Jacky does not replace counselling. The support services walk the way with you.',
      zurueck: 'Back to family life',
      tabs: { sofort: 'Right now', check: 'Is this me?', hilfe: 'Find help', plan: 'Safety plan', tasche: 'Emergency bag', rechte: 'Your rights', kinder: 'Children', angehoerige: 'For friends & family', selbst: 'Afraid I might hurt someone', ausland: 'Not in Switzerland?' },
      anrufliste: 'The call will stay in your call list. Delete it if that is safer for you.',
      beratung: 'Get advice: ' + tl('142') + ' Victim Support, day and night, free and confidential.',
      geprueft: 'Numbers checked: October 2026.',
      n117: ['Police', 'Violence, threats, someone is in danger'], n144: ['Ambulance', 'Injury, trouble breathing, unconscious'], n112: ['European emergency number', 'All over Europe'],
      n142: ['Victim Support Switzerland', 'Free, confidential, also for family and friends. Not an emergency number.'], n143: ['Die Dargebotene Hand', 'Anonymous, when everything is too much'],
      n147: ['Pro Juventute', 'For children and young people, day and night'], eltern: ['Elternnotruf (in German)', '24 hours, for parents in crisis'],
      introH: 'You are not alone.', introP: 'You decide what to do. Here are people who listen and help you, free and confidential.',
      hGefahr: 'In danger now', hReden: 'Talk, day and night',
      stummT: 'If you cannot speak',
      stumm: ['Call 117 anyway. If you can, quietly say only your address.', 'Ask a neighbour, a friend or someone nearby to call for you.', 'Show the silent hand signal (below). Many people know it.', 'Agree on a code word with someone you trust. If you send it, they call the police.'],
      zeichenT: 'The silent hand signal “Signal for Help”', zeichenP: 'Show your hand, tuck your thumb into your palm, fold your fingers over it. Whoever sees it can get help for you.',
      zeichen: ['1 · Show your hand', '2 · Tuck in your thumb', '3 · Fold your fingers'],
      fhT: 'Women’s shelter', fhP: 'Shelters take in you and your children, even in the middle of the night. The addresses are secret so you are safe there. Victim Support (' + tl('142') + ') will find you a place.',
      checkIntro: 'Six short questions. There is no right or wrong. Nothing is saved.', frage: function (i, n) { return 'Question ' + i + ' of ' + n; },
      opts: { ja: 'Yes', manchmal: 'Sometimes', nein: 'No', weiss: 'I don’t know' }, eineZurueck: 'Previous question',
      fragen: ['Are you sometimes afraid of your partner, your ex or someone at home?', 'Are you insulted, put down or made fun of in front of others?', 'Does someone control your phone, your money or who you meet?', 'Have you been pushed, hit, choked or held down?', 'Are you pressured or forced into sex or sexual acts?', 'Does someone threaten you, your children, your pets, or threaten to hurt themselves?'],
      keinT: 'Thank you for taking a look.', keinP: 'From your answers I do not see violence. If you are still worried, that is reason enough to talk to someone. Your feeling counts.',
      jaT: 'What you describe can be violence.', jaP: '<p>Violence has many forms: words, control, money, threats, hitting, sex against your will. <b>It is not your fault.</b> No one has the right to make you afraid.</p><p>You do not have to decide anything today. Talking helps, and it is free.</p>',
      ernstT: 'This is serious.', ernstP: 'Hitting, choking and threats are dangerous, even if nothing shows afterwards. After being choked, please see a doctor. If you are in danger now: ' + tl('117') + '.',
      n142kurz: 'Day and night, free, confidential', planBtn: 'See the safety plan', nochmals: 'Start again', keineDiagnose: 'This result is not a diagnosis and is not saved.',
      ohT: 'Victim Support – the first call', ohP: 'Victim Support advises you for free and in confidence, even without reporting to the police. They help with the next steps: shelter, doctor, lawyer, money for the basics.', ohSub: '24 hours, all of Switzerland',
      fh2P: 'A safe place for you and your children. The addresses are secret. Victim Support (142) or the police (117) will find you a place.',
      alleT: 'For everyone', alleP: 'Victim Support is there for everyone: whatever your gender, who you love, where you come from, what language you speak. Even without a passport or a regular residence permit, you may call. Ask what is possible in your situation.',
      kantonT: 'Advice in your canton', kantonP: 'Every canton has victim support centres. The official list:', kantonLink: 'opferhilfe-schweiz.ch · centres by canton', verlauf: 'A website stays in your browser history. Delete it afterwards if needed.',
      sexT: 'Sexual violence (Zurich)', sexName: 'Frauenberatung sexuelle Gewalt', sexSub: 'Recognised by the canton of Zurich, office hours',
      zuvielT: 'When everything is too much', n143tag: 'Anonymous, day and night',
      planIntro: 'Step by step, at your own pace. <b>None of this is saved.</b> When you close the page, it is all gone. You can print it and keep it somewhere safe.',
      plan: [
        ['Who helps me?', 'Someone you trust: a friend, a neighbour, a sister, a colleague.', 'Name and number (by heart or on paper)'],
        ['Our code word', 'A harmless word. If you send or say it, they call the police.', 'e.g. “Do you still have some flour?”'],
        ['Where can I go?', 'To someone you trust, to a shelter (through 142) or to a busy public place.', 'Place'],
        ['My way out', 'Which door, which exit? During a fight, stay away from the kitchen and bathroom: there are hard edges and knives.', 'Way'],
        ['What I take with me', 'ID, money, medicine, phone and charger. See the emergency bag.'],
        ['My children', 'A safe room, one sentence for emergencies: “Run to Mrs …” or “Call 117”. Never put children between you.'],
        ['My pets', 'Who could take them in? Some shelters help with this too, ask at 142.'],
        ['My phone', 'Check location sharing and shared accounts, change your passcode, delete call list and history if needed.']
      ],
      druck: 'Print', leeren: 'Clear all',
      taschIntro: 'A small bag that is ready. Safest with someone you trust. The ticks are not saved.',
      tasche: ['ID card, passport, residence permit', 'Health insurance card', 'Medicine and prescriptions', 'Cash, bank card', 'Phone and charger', 'House and car keys', 'Important numbers on paper', 'Copies: rental contract, birth certificates, family record book', 'Medical reports, photos, messages as evidence', 'Clothes for two days', 'For the children: favourite cuddly toy, school things'],
      bereit: function (n, t) { return n + ' of ' + t + ' ready.'; },
      rechteIntro: 'Short and general for Switzerland. This is not legal advice. A support centre can tell you what applies in your case.',
      rechte: [
        ['Advice without reporting', 'Victim Support advises you for free and in confidence. You do not have to report anything to the police.'],
        ['Help with costs', 'Victim Support can help with some costs: housing, doctor, therapy, lawyer. Ask what is possible in your case.'],
        ['Removal order and contact ban', 'The police can order a violent person to leave the home for a few days. A court can ban contact and approach. The rules differ from canton to canton.'],
        ['The police often act on their own', 'Many forms of violence between partners are prosecuted by the police even without your report. If you are unsure, get advice first.'],
        ['Keep evidence', 'Have injuries recorded by a doctor, even if you do not want to report (yet). Keep messages and photos in a safe place.'],
        ['Residence', 'Is your residence permit tied to your marriage? There are special rules for people affected by domestic violence. Please get advice before you decide anything.']
      ],
      kinderT: 'Children live through violence too', kinderP: 'Even if they are not hit themselves, children feel the fear and the fighting. It is not your fault. Help for you is help for them too.',
      kinderHilfT: 'What helps children', kinderHilf: ['A safe room and one sentence for emergencies.', 'Telling them: “It is not your fault.”', 'Never using them as messengers between you.'],
      n142kinder: 'Also advises children and parents', n117kind: 'If a child is in danger',
      angIntro: 'Are you worried about a friend, sister, daughter or neighbour?',
      angT: 'How to help without putting her at risk', ang: ['Listen and believe her. Say: “I am here. It is not your fault.”', 'Do not push. She decides when and how.', 'Do not confront the violent person yourself. It can make things more dangerous.', 'Offer a code word and stay reachable.', 'Do not send messages about the violence to her phone. Better to talk in person.'],
      auchT: 'You can get help too', auchP: 'Victim Support also advises family and friends.', n142ang: 'Free, confidential', akutT: 'In immediate danger', n117ang: 'Call if you hear screams or blows',
      selbstIntro: 'Are you afraid of losing control and hurting someone? Looking here is a brave first step. Asking for help is strong.',
      selbstJetztT: 'Right now, in this moment', selbstJetzt: ['Leave the room before anything happens. Just say: “I need five minutes.”', 'Breathe out slowly, longer than you breathe in. Hold your hands under cold water.', 'Put your phone away. Do not write messages while you are angry.', 'If children are there: call someone who can come until you are calm.'],
      selbstRedenT: 'Talk, anonymously', n143selbst: 'Listens without judging. Day and night.', elternSelbst: 'If you are afraid of hurting your child (in German)',
      selbstBerT: 'Counselling against violence', selbstBerP: 'Many cantons have counselling and programmes for people who use violence or are afraid they might. Die Dargebotene Hand (' + tl('143') + ') helps you find a service near you.',
      selbstGefahrT: 'Is someone in danger?', n117selbst: 'Call right away, even if you are the one causing fear',
      auslandIntro: 'Not in Switzerland right now? ' + tl('112') + ' helps all over Europe. These numbers only work in the country shown.',
      land: { de: 'Germany', at: 'Austria', fr: 'France', it: 'Italy', es: 'Spain' },
      polizei: 'Police', notruf: 'Emergency', hDe: 'Hilfetelefon, violence against women, 24 h, many languages', hAt: 'Frauenhelpline against violence, 24 h', hFr: 'Violences Femmes Info', hIt: 'Antiviolenza e stalking, 24 h', hEs: 'Help with violence against women, 24 h',
      stand: 'As of October 2026.'
    }
  };
  var t = function () { return T[lang] || T.de; };

  /* ---------- Schnellausstieg ---------- */
  function verlassen() {
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
    try { if (window.NovaStimme) NovaStimme.stopp(); } catch (e) {}
    // Inhalt sofort weg (nicht nur verstecken), dann harmlose Seite ohne neuen Verlaufseintrag.
    var s = $('vSchutz'); if (s) s.innerHTML = '';
    document.title = "Jacky Roberts – Rezepte";
    document.body.className = 'jk-weg';
    document.body.innerHTML = '<div style="min-height:100vh;background:#fffaf2"></div>';
    try { location.replace('rezept.html'); } catch (e) { location.href = 'rezept.html'; }
  }
  window.jackieVerlassen = verlassen;
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('im-schutz')) verlassen();
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#jkExit')) { e.preventDefault(); verlassen(); }
  }, true);

  /* App-Umschalter: Hilfe-Inhalt verdecken, sobald die App in den Hintergrund geht. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && document.body.classList.contains('im-schutz')) {
      var c = $('jkCover'); if (c) c.classList.add('on');
    }
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#jkCoverGo')) { var c = $('jkCover'); if (c) c.classList.remove('on'); }
  });

  /* ---------- Bausteine ---------- */
  function anrufliste() { return '<p class="sz-hint">' + esc(t().anrufliste) + '</p>'; }
  function ruf(nr, tel, name, sub, notruf) {
    return '<a class="sz-call' + (notruf ? ' notruf' : '') + '" href="tel:' + tel + '"><span><b>' + esc(name) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span><strong>' + esc(nr) + '</strong></a>';
  }
  function rufN(nr, paar, sub, notruf) { return ruf(nr, nr.replace(/\s/g, ''), paar[0], sub === undefined ? paar[1] : sub, notruf); }
  function karte(titel, inner, cls) { return '<div class="sz-card' + (cls ? ' ' + cls : '') + '">' + (titel ? '<h3>' + esc(titel) + '</h3>' : '') + inner + '</div>'; }
  function liste(a) { return '<ul class="sz-list">' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
  function p(x) { return '<p>' + x + '</p>'; }
  function beratung() { return '<p class="sz-weiter">' + t().beratung + '</p>'; }
  var TUER = '<svg class="sz-tuer" viewBox="0 0 120 150" aria-hidden="true"><defs><radialGradient id="szGlow" cx="50%" cy="55%" r="60%"><stop offset="0" stop-color="#ffe7a3" stop-opacity=".95"/><stop offset="1" stop-color="#f2c14e" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="80" rx="58" ry="70" fill="url(#szGlow)"/><path d="M30 140V48a30 30 0 0 1 60 0v92z" fill="#1b2a63" stroke="#f2c14e" stroke-width="3"/><path d="M38 140V52a22 22 0 0 1 44 0v88z" fill="#f6d98a"/><circle cx="74" cy="98" r="3.5" fill="#a8792a"/><path d="M18 140h84" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/></svg>';

  /* ---------- Seiten ---------- */
  var SEITEN = ['sofort', 'check', 'hilfe', 'plan', 'tasche', 'rechte', 'kinder', 'angehoerige', 'selbst', 'ausland'];

  function seiteSofort() {
    var x = t();
    return '<div class="sz-intro">' + TUER + '<div><h2>' + esc(x.introH) + '</h2><p>' + esc(x.introP) + '</p></div></div>' +
      '<h3 class="sz-h">' + esc(x.hGefahr) + '</h3>' +
      rufN('117', x.n117, undefined, true) + rufN('144', x.n144, undefined, true) + rufN('112', x.n112, undefined, true) +
      '<h3 class="sz-h">' + esc(x.hReden) + '</h3>' +
      rufN('142', x.n142) + rufN('143', x.n143) + anrufliste() +
      karte(x.stummT, liste(x.stumm)) +
      karte(x.zeichenT, handzeichen() + '<p class="sz-klein">' + esc(x.zeichenP) + '</p>') +
      karte(x.fhT, p(x.fhP));
  }

  function handzeichen() {
    var cap = t().zeichen;
    var hand = function (stufe) {
      var finger = stufe === 3
        ? '<rect x="22" y="40" width="56" height="24" rx="12" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/>'
        : '<rect x="24" y="10" width="11" height="40" rx="5.5" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/><rect x="37" y="4" width="11" height="46" rx="5.5" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/><rect x="50" y="6" width="11" height="44" rx="5.5" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/><rect x="63" y="14" width="11" height="36" rx="5.5" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/>';
      var daumen = stufe === 1
        ? '<rect x="4" y="48" width="26" height="12" rx="6" transform="rotate(-35 17 54)" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/>'
        : '<rect x="30" y="56" width="30" height="11" rx="5.5" fill="#e9bf98" stroke="#7a4b2a" stroke-width="2.5"/>';
      return '<svg viewBox="0 0 100 110" aria-hidden="true"><rect x="22" y="44" width="56" height="58" rx="18" fill="#f6d2b0" stroke="#7a4b2a" stroke-width="2.5"/>' + (stufe === 3 ? '' : daumen) + finger + (stufe === 3 ? daumen : '') + '</svg>';
    };
    return '<div class="sz-hand">' + [1, 2, 3].map(function (k) { return '<figure>' + hand(k) + '<figcaption>' + esc(cap[k - 1]) + '</figcaption></figure>'; }).join('') + '</div>';
  }

  /* Bin ich betroffen? – nichts wird gespeichert, Ergebnis nur auf dem Bildschirm */
  var FRAGEN = [{ art: 'angst' }, { art: 'psychisch' }, { art: 'kontrolle' }, { art: 'koerper', ernst: true }, { art: 'sexuell' }, { art: 'drohung', ernst: true }];
  var antworten = [];
  function seiteCheck() {
    var x = t(), i = antworten.length;
    if (i >= FRAGEN.length) return checkErgebnis();
    return '<p class="sz-klein">' + esc(x.checkIntro) + '</p>' +
      '<div class="sz-prog"><i style="width:' + Math.round(i / FRAGEN.length * 100) + '%"></i></div>' +
      karte(x.frage(i + 1, FRAGEN.length), '<p class="sz-frage">' + esc(x.fragen[i]) + '</p>' +
        '<div class="sz-opts">' + ['ja', 'manchmal', 'nein', 'weiss'].map(function (k) { return '<button type="button" data-ant="' + k + '">' + esc(x.opts[k]) + '</button>'; }).join('') + '</div>') +
      (i > 0 ? '<button type="button" class="sz-link" data-ant="zurueck">' + esc(x.eineZurueck) + '</button>' : '');
  }
  function checkErgebnis() {
    var x = t(), ja = [], ernst = false;
    antworten.forEach(function (a, k) { if (a === 'ja' || a === 'manchmal') { ja.push(FRAGEN[k].art); if (FRAGEN[k].ernst) ernst = true; } });
    var html = '';
    if (!ja.length) html += karte(x.keinT, p(esc(x.keinP)));
    else {
      html += karte(x.jaT, x.jaP, 'gold');
      if (ernst) html += karte(x.ernstT, p(x.ernstP), 'rot');
    }
    html += rufN('142', x.n142, x.n142kurz) + anrufliste();
    html += '<div class="sz-row"><button type="button" class="sz-btn" data-geh="plan">' + esc(x.planBtn) + '</button><button type="button" class="sz-btn soft" data-ant="neu">' + esc(x.nochmals) + '</button></div>';
    html += '<p class="sz-klein">' + esc(x.keineDiagnose) + '</p>';
    return html;
  }

  function seiteHilfe() {
    var x = t();
    return karte(x.ohT, p(esc(x.ohP)) + rufN('142', x.n142, x.ohSub)) +
      karte(x.fhT, p(esc(x.fh2P))) +
      karte(x.alleT, p(esc(x.alleP)) + rufN('142', x.n142, x.n142kurz)) +
      karte(x.kantonT, p(esc(x.kantonP)) + '<a class="sz-web" href="https://www.opferhilfe-schweiz.ch" target="_blank" rel="noopener noreferrer">' + esc(x.kantonLink) + '</a><p class="sz-klein">' + esc(x.verlauf) + '</p>') +
      karte(x.sexT, ruf('044 291 46 46', '0442914646', x.sexName, x.sexSub)) +
      karte(x.zuvielT, rufN('143', x.n143, x.n143tag) + ruf('0848 35 45 55', '0848354555', x.eltern[0], x.eltern[1])) +
      anrufliste() + '<p class="sz-klein">' + esc(x.geprueft) + '</p>';
  }

  /* Sicherheitsplan: Felder nur im Arbeitsspeicher, Ausdrucken möglich */
  var planWerte = {};
  function seitePlan() {
    var x = t();
    var html = '<p class="sz-klein">' + x.planIntro + '</p>';
    x.plan.forEach(function (s, k) {
      html += '<div class="sz-card sz-step"><span class="sz-nr">' + (k + 1) + '</span><div><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p>' +
        (s[2] ? '<input type="text" class="sz-in" data-plan="' + k + '" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(s[2]) + '" value="' + esc(planWerte[k] || '') + '">' : '') + '</div></div>';
    });
    html += '<div class="sz-row"><button type="button" class="sz-btn" data-druck="1">' + esc(x.druck) + '</button><button type="button" class="sz-btn soft" data-planleer="1">' + esc(x.leeren) + '</button></div>' + beratung();
    return html;
  }

  var taschePack = {};
  function packZahl() { return Object.keys(taschePack).filter(function (k) { return taschePack[k]; }).length; }
  function seiteTasche() {
    var x = t();
    var html = '<p class="sz-klein">' + esc(x.taschIntro) + '</p><div class="sz-card">';
    x.tasche.forEach(function (s, k) {
      html += '<label class="sz-check"><input type="checkbox" data-tasche="' + k + '"' + (taschePack[k] ? ' checked' : '') + '><span>' + esc(s) + '</span></label>';
    });
    html += '</div><p class="sz-klein" id="szTascheZahl">' + esc(x.bereit(packZahl(), x.tasche.length)) + '</p>' + beratung();
    return html;
  }

  function seiteRechte() {
    var x = t();
    return '<p class="sz-klein">' + esc(x.rechteIntro) + '</p>' + x.rechte.map(function (r) { return karte(r[0], p(esc(r[1]))); }).join('') + beratung();
  }

  function seiteKinder() {
    var x = t();
    return karte(x.kinderT, p(esc(x.kinderP))) + karte(x.kinderHilfT, liste(x.kinderHilf)) +
      rufN('147', x.n147) + rufN('142', x.n142, x.n142kinder) + rufN('117', x.n117, x.n117kind, true) + anrufliste();
  }

  function seiteAngehoerige() {
    var x = t();
    return '<p class="sz-klein">' + esc(x.angIntro) + '</p>' + karte(x.angT, liste(x.ang)) +
      karte(x.auchT, p(esc(x.auchP)) + rufN('142', x.n142, x.n142ang)) +
      karte(x.akutT, rufN('117', x.n117, x.n117ang, true)) + anrufliste();
  }

  /* Neu (Runde 2): «Ich habe Angst, selbst gewalttätig zu werden» – nur feste Wege, keine Bewertung */
  function seiteSelbst() {
    var x = t();
    return '<p class="sz-klein">' + esc(x.selbstIntro) + '</p>' +
      karte(x.selbstJetztT, liste(x.selbstJetzt), 'gold') +
      karte(x.selbstRedenT, rufN('143', x.n143, x.n143selbst) + ruf('0848 35 45 55', '0848354555', x.eltern[0], x.elternSelbst) + rufN('147', x.n147)) +
      karte(x.selbstBerT, p(x.selbstBerP)) +
      karte(x.selbstGefahrT, rufN('117', x.n117, x.n117selbst, true)) + anrufliste();
  }

  /* Neu (Runde 2): Länderversion für Ferien und Grenzgängerinnen. Nummern vor Release prüfen. */
  var AUSLAND = [
    ['de', '🇩🇪', [['110', 'polizei'], ['116 016', 'hDe']]],
    ['at', '🇦🇹', [['133', 'polizei'], ['0800 222 555', 'hAt']]],
    ['fr', '🇫🇷', [['17', 'polizei'], ['3919', 'hFr']]],
    ['it', '🇮🇹', [['112', 'notruf'], ['1522', 'hIt']]],
    ['es', '🇪🇸', [['112', 'notruf'], ['016', 'hEs']]]
  ];
  function seiteAusland() {
    var x = t();
    return '<p class="sz-klein">' + x.auslandIntro + '</p>' +
      AUSLAND.map(function (l) {
        return karte(l[1] + ' ' + x.land[l[0]], l[2].map(function (n, k) { return ruf(n[0], n[0].replace(/\s/g, ''), x[n[1]], '', k === 0); }).join(''));
      }).join('') + anrufliste() + '<p class="sz-klein">' + esc(x.stand) + '</p>';
  }

  var RENDER = { sofort: seiteSofort, check: seiteCheck, hilfe: seiteHilfe, plan: seitePlan, tasche: seiteTasche, rechte: seiteRechte, kinder: seiteKinder, angehoerige: seiteAngehoerige, selbst: seiteSelbst, ausland: seiteAusland };
  var aktuell = 'sofort';

  function knoepfe() {
    var x = t(), e = $('jkExit'), c = $('jkCoverGo');
    if (e) { e.textContent = x.exit; e.setAttribute('aria-label', x.exitAria); }
    if (c) c.textContent = x.weiter;
  }
  function gerueste() {
    var box = $('vSchutz'); if (!box) return null;
    if (box.dataset.lang !== lang) {
      var x = t();
      box.setAttribute('lang', lang);
      box.setAttribute('aria-label', x.titel);
      box.innerHTML =
        '<div class="sz-akut"><b>' + esc(x.akut) + '</b> <a href="tel:117">' + esc(x.akutRuf) + '</a></div>' +
        '<div class="sz-sprache" role="group" aria-label="' + esc(x.sprache) + '">' + SPRACHEN.map(function (s) { return '<button type="button" data-lang="' + s[0] + '" lang="' + s[0] + '"' + (s[0] === lang ? ' class="an" aria-pressed="true"' : ' aria-pressed="false"') + '>' + s[1] + '</button>'; }).join('') + '</div>' +
        '<div class="sz-kopf"><img src="figur.jpg" alt="" class="sz-jackie"><div><span class="sz-eyebrow">' + esc(x.titel) + '</span><p class="sz-satz">' + esc(x.satz) + '</p></div></div>' +
        '<nav class="sz-tabs" aria-label="' + esc(x.titel) + '">' + SEITEN.map(function (s) { return '<button type="button" data-sz="' + s + '">' + esc(x.tabs[s]) + '</button>'; }).join('') + '</nav>' +
        '<div id="szInhalt" class="sz-inhalt" aria-live="polite"></div>' +
        '<p class="sz-fuss">' + x.fuss + '</p>' +
        '<button type="button" class="sz-zurueck" data-home>' + esc(x.zurueck) + '</button>';
      box.dataset.lang = lang;
      knoepfe();
    }
    if (!box.dataset.bereit) {
      box.dataset.bereit = '1';
      box.addEventListener('click', klick);
      box.addEventListener('input', eingabe);
      box.addEventListener('change', eingabe);
    }
    return box;
  }
  function zeige(id) {
    aktuell = RENDER[id] ? id : 'sofort';
    var box = gerueste(); if (!box) return;
    $('szInhalt').innerHTML = RENDER[aktuell]();
    box.querySelectorAll('.sz-tabs button').forEach(function (b) {
      var an = b.dataset.sz === aktuell; b.classList.toggle('an', an); b.setAttribute('aria-current', an ? 'page' : 'false');
      if (an && b.scrollIntoView) try { b.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {}
    });
  }
  function klick(e) {
    var b = e.target.closest('button,a'); if (!b) return;
    if (b.dataset.lang) { if (T[b.dataset.lang]) { lang = b.dataset.lang; zeige(aktuell); } return; }
    if (b.dataset.sz) { zeige(b.dataset.sz); window.scrollTo(0, 0); return; }
    if (b.dataset.geh) { zeige(b.dataset.geh); window.scrollTo(0, 0); return; }
    if (b.dataset.ant) {
      if (b.dataset.ant === 'zurueck') antworten.pop();
      else if (b.dataset.ant === 'neu') antworten = [];
      else antworten.push(b.dataset.ant);
      zeige('check'); return;
    }
    if (b.dataset.druck) { try { window.print(); } catch (x) {} return; }
    if (b.dataset.planleer) { planWerte = {}; zeige('plan'); return; }
  }
  function eingabe(e) {
    var f = e.target;
    if (f.dataset.plan !== undefined) planWerte[f.dataset.plan] = f.value;
    if (f.dataset.tasche !== undefined) {
      taschePack[f.dataset.tasche] = f.checked;
      var z = $('szTascheZahl'); if (z) z.textContent = t().bereit(packZahl(), t().tasche.length);
    }
  }

  /* Gefahrenwörter, die direkt in den Schutzraum führen (Gewalt zuhause, Drohung, Waffen), DE/FR/IT/EN */
  var W = {
    de: ['schlägt mich', 'schlug mich', 'hat mich geschlagen', 'mich geschlagen', 'schlägt uns', 'tritt mich', 'würgt', 'gewürgt', 'würgen',
      'droht mir', 'bedroht mich', 'droht uns', 'bedroht uns', 'mit dem messer', 'mit einem messer', 'pistole', 'umbringen', 'bringt mich um', 'mich töten',
      'vergewaltig', 'zum sex gezwungen', 'zwingt mich', 'sperrt mich ein', 'eingesperrt', 'häusliche gewalt', 'gewalt zuhause',
      'gewalt zu hause', 'angst vor meinem mann', 'angst vor meinem partner', 'angst vor meinem freund', 'angst vor ihm', 'angst vor meinem ex',
      'stalkt', 'stalking', 'verfolgt mich', 'frauenhaus', 'opferhilfe'],
    fr: ['me frappe', "m'a frappée", "m'a frappé", 'me bat ', 'me battre', 'me menace', 'menace de me tuer', 'va me tuer', "m'étrangle", 'étranglée', 'étranglé',
      'violence conjugale', 'violences conjugales', 'violence domestique', 'violences domestiques', 'foyer pour femmes', "peur de mon mari", 'peur de mon conjoint', 'peur de mon copain', 'peur de lui',
      "m'a violée", 'me force', "m'enferme", 'aide aux victimes'],
    it: ['mi picchia', 'mi ha picchiata', 'mi ha picchiato', 'mi minaccia', 'minaccia di uccidermi', 'mi uccide', 'mi strangola', 'strangolata',
      'violenza domestica', 'casa delle donne', 'casa protetta', 'paura di mio marito', 'paura del mio partner', 'paura di lui', 'mi ha violentata', 'mi costringe', 'mi chiude in casa', 'aiuto alle vittime'],
    en: ['hits me', 'beats me', 'threatens me', 'threatened me', 'going to kill me', 'will kill me', 'choked me', 'chokes me', 'strangled',
      'domestic violence', 'domestic abuse', "women's shelter", 'women shelter', 'afraid of my husband', 'afraid of my partner', 'afraid of my boyfriend', 'scared of my husband', 'scared of my partner',
      'raped me', 'forces me', 'locks me in', 'victim support']
  };

  window.JackieSchutz = {
    open: function (id, sprache) {
      if (sprache && T[sprache]) lang = sprache;
      var a = app();
      zeige(id || 'sofort');
      if (a) a.show('vSchutz'); else { var b = $('vSchutz'); if (b) b.classList.remove('hide'); }
    },
    gefahr: function (text) { return !!window.JackieSchutz.gefahrSprache(text); },
    // Welche Sprache hat das Gefahrenwort? So öffnet der Schutzraum gleich in der Sprache der Frau.
    gefahrSprache: function (text) {
      var s = ' ' + String(text || '').toLowerCase().replace(/[’`´]/g, "'").replace(/[.,!?;:«»"“”()]/g, ' ').replace(/\s+/g, ' ') + ' ';
      var treffer = null;
      ['de', 'fr', 'it', 'en'].some(function (l) { if (W[l].some(function (w) { return s.indexOf(w) > -1; })) { treffer = l; return true; } return false; });
      return treffer;
    },
    sprachen: SPRACHEN.map(function (s) { return s[0]; }),
    vergessen: function () { antworten = []; planWerte = {}; taschePack = {}; var s = $('szInhalt'); if (s) s.innerHTML = ''; }
  };
})();
