// Fase 2, deel 3, batch 4 (0.37.3), deel a: keepers uit VOORSTEL-OEFENINGEN.md – warming-up KW1, KW4, KW5 en laag duiken KL2–KL6.
// KL1 (★ Zit, sta op en duik) staat al sinds 0.35.0 in de app.
// Draaien: node tools/nieuw/fase2-0373a.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, bal, pion, hoedje, pauze, stap, leeg, stok, JO, OUD, MIDDEN } = require('./fase2-hulp.cjs');

const keeperVeld = (weergave) => ({ veld: { type: 'half' }, weergave, camera: 'schuin' });
const op = (wie = 'k1') => stap({ type: 'opstaan', wie });
const terug = (van = 'k1', naar = 't1') => stap({ type: 'pass', van, naar, worp: 'onderhands', hoogte: 'grond' });

const oefeningen = [
  // KW1. Vangen in de loop om vier pionnen
  {
    id: 'keeper-wu-vangen-vier-pionnen',
    naam: 'Vangen in de loop om vier pionnen',
    categorieen: ['warming-up'],
    uitleg:
      'Vier pionnen in een klein vierkant voor het doel. De keeper beweegt langs de zijden: zijwaarts, naar voren en achteruit, steeds met zijn gezicht naar de trainer. Bij elke pion gooit de trainer een bal: vangen, terug gooien en meteen door naar de volgende pion. Na twee rondes de andere kant op.',
    organisatie: 'Vierkant van 4 × 4 m vlak voor het doel, de trainer met een bal op 9 m. Vier ballen per ronde, twee rondes per kant.',
    benodigdheden: ['Goal', '4 pionnen', 'Bal'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Kleine snelle pasjes, voeten niet kruisen bij zijwaarts', 'Bij het vangen even stil: beide voeten aan de grond', 'Handen al klaar voor de bal komt'],
    variaties: {
      makkelijker: ['Groter vierkant, rustiger tempo', 'Alleen ballen op borsthoogte'],
      moeilijker: ['Ballen op wisselende hoogte', 'Twee trainers die om de beurt gooien'],
    },
    en: {
      naam: 'Catching on the move round four cones',
      uitleg:
        'Four cones in a small square in front of the goal. The keeper moves along the sides: sideways, forwards and backwards, always facing the coach. At each cone the coach throws a ball: catch it, throw it back and move straight on to the next cone. After two rounds, go the other way.',
      organisatie: '4 × 4 m square just in front of the goal, the coach with a ball at 9 m. Four balls per round, two rounds each way.',
      benodigdheden: ['Goal', '4 cones', 'Ball'],
      coachpunten: ['Small quick steps, do not cross your feet when moving sideways', 'Still for a moment as you catch: both feet on the ground', 'Hands ready before the ball arrives'],
      variaties: {
        makkelijker: ['Bigger square, calmer pace', 'Only balls at chest height'],
        moeilijker: ['Balls at different heights', 'Two coaches throwing in turn'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 16 }),
      objecten: [
        goal,
        pion('p1', 31.6, 2.4),
        pion('p2', 36.4, 2.4),
        pion('p3', 36.4, 7.2),
        pion('p4', 31.6, 7.2),
        keeper('k1', 1, 32.4, 3.2, { kijkrichting: 90 }),
        trainer(35.8, 12, -100),
        bal('bal', 35.7, 11.45, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [35.6, 3.2], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1.3 }),
        terug(),
        stap({ type: 'loop', wie: 'k1', naar: [35.6, 6.4], manier: 'voetenwerk', kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1.6 }),
        terug(),
        stap({ type: 'loop', wie: 'k1', naar: [32.4, 6.4], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 0.9 }),
        terug(),
        stap({ type: 'loop', wie: 'k1', naar: [32.4, 3.2], manier: 'achteruit', kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1.4 }),
        terug(),
        pauze(0.5),
      ],
    },
  },

  // KW4. Pass, pass, vang
  {
    id: 'keeper-wu-pass-pass-vang',
    naam: 'Pass, pass, vang',
    categorieen: ['warming-up', 'passing'],
    uitleg:
      'De trainer speelt de bal laag in. De keeper speelt hem in één keer met de binnenkant van zijn voet terug, schuift een stukje op en doet dat nog een keer. De derde bal gooit de trainer door de lucht: die vangt de keeper. Zo wisselen voeten en handen elkaar af, en blijft de keeper steeds in beweging.',
    organisatie: 'Keeper in het doel, de trainer op 8 m met een bal. Series van drie ballen (pass, pass, vang); na elke serie schuift de keeper naar de andere kant van het doel.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Passen: standbeen naast de bal, enkel vast', 'Na de pass meteen weer in de basishouding', 'Vangen: handen in een W achter de bal'],
    variaties: {
      makkelijker: ['Eerst aannemen, dan passen', 'Ballen rustiger'],
      moeilijker: ['Passen met je andere voet', 'De derde bal halfhoog naast je: duiken'],
    },
    en: {
      naam: 'Pass, pass, catch',
      uitleg:
        'The coach plays the ball in low. The keeper passes it straight back first time with the inside of the foot, shuffles across a little and does it again. The coach throws the third ball through the air, and the keeper catches it. Feet and hands alternate, and the keeper keeps moving.',
      organisatie: 'Keeper in goal, the coach 8 m away with a ball. Sets of three balls (pass, pass, catch); after each set the keeper shuffles to the other side of the goal.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Passing: standing foot next to the ball, ankle locked', 'Straight back into the set position after the pass', 'Catching: hands in a W behind the ball'],
      variaties: {
        makkelijker: ['Control first, then pass', 'Calmer balls'],
        moeilijker: ['Pass with your other foot', 'The third ball at mid-height beside you: dive'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 15 }),
      objecten: [goal, keeper('k1', 1, 33, 1.8, { kijkrichting: 90 }), trainer(35.8, 9.6, -100), bal('bal', 35.7, 9.05, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1', hoogte: 'grond' }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'voet', direct: true }),
        stap({ type: 'loop', wie: 'k1', naar: [34.6, 1.9], manier: 'zijwaarts', kijk: 90, duur: 0.7 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', hoogte: 'grond' }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'voet', direct: true }),
        stap({ type: 'loop', wie: 'k1', naar: [33.4, 2.4], manier: 'voetenwerk', kijk: 90, duur: 0.6 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1.5 }),
        terug(),
        pauze(0.5),
      ],
    },
  },

  // KW5. Spiegelen op de doellijn
  {
    id: 'keeper-wu-spiegelen',
    naam: 'Spiegelen op de doellijn',
    categorieen: ['warming-up'],
    uitleg:
      'Twee keepers staan tegenover elkaar, elk op een lijn. De ene bepaalt: hij schuift zijwaarts heen en weer en verandert onverwacht van richting. De ander volgt hem als een spiegelbeeld en blijft recht tegenover hem. Op het teken van de trainer gooit die een bal naar de volger: vangen en terug. Daarna wisselen de rollen.',
    organisatie: 'Twee lijnen van hoedjes van 8 m lang, 4 m uit elkaar. De trainer staat aan de zijkant met een bal. Rondes van 30 seconden.',
    benodigdheden: ['8 hoedjes', 'Bal'],
    spelersNodig: 0,
    keepersNodig: 2,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['In de basishouding blijven: knieën licht gebogen, gewicht op de voorvoeten', 'Kijk naar de heupen van de ander, niet naar zijn voeten', 'Op het teken: eerst stilstaan, dan vangen'],
    variaties: {
      makkelijker: ['Kortere lijnen', 'De leider beweegt rustiger'],
      moeilijker: ['Ook naar voren en achteruit', 'De bal kan naar allebei'],
    },
    en: {
      naam: 'Mirroring on the line',
      uitleg:
        'Two keepers face each other, each on a line. One leads: they shuffle sideways and suddenly change direction. The other follows like a mirror image and stays directly opposite. On the coach’s signal, the coach throws a ball to the follower: catch it and throw it back. Then the roles change.',
      organisatie: 'Two lines of disc cones 8 m long and 4 m apart. The coach stands at the side with a ball. Rounds of 30 seconds.',
      benodigdheden: ['8 disc cones', 'Ball'],
      coachpunten: ['Stay in the set position: knees slightly bent, weight on the balls of your feet', 'Watch the other keeper’s hips, not their feet', 'On the signal: first stand still, then catch'],
      variaties: {
        makkelijker: ['Shorter lines', 'The leader moves more calmly'],
        moeilijker: ['Also forwards and backwards', 'The ball can go to either keeper'],
      },
    },
    tekening: {
      ...leeg(14, 12),
      objecten: [
        hoedje('h1', 4, 2),
        hoedje('h2', 4, 10),
        hoedje('h3', 8, 2),
        hoedje('h4', 8, 10),
        keeper('k1', 1, 4, 6, { kijkrichting: 0 }),
        keeper('k2', 2, 8, 6, { kijkrichting: 180 }),
        trainer(11.4, 9.6, -150),
        bal('bal', 11, 9.25, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [4, 3.4], manier: 'zijwaarts', kijk: 0 }, { type: 'loop', wie: 'k2', naar: [8, 3.6], manier: 'zijwaarts', kijk: 180, start: 0.2 }),
        stap({ type: 'loop', wie: 'k1', naar: [4, 8.4], manier: 'zijwaarts', kijk: 0 }, { type: 'loop', wie: 'k2', naar: [8, 8.2], manier: 'zijwaarts', kijk: 180, start: 0.2 }),
        stap({ type: 'loop', wie: 'k1', naar: [4, 5.6], manier: 'zijwaarts', kijk: 0 }, { type: 'loop', wie: 'k2', naar: [8, 5.8], manier: 'zijwaarts', kijk: 180, start: 0.2 }),
        stap({ type: 'pass', van: 't1', naar: 'k2', worp: 'onderhands', hoogte: 1.4 }),
        stap({ type: 'pass', van: 'k2', naar: 't1', worp: 'onderhands', hoogte: 1.2 }),
        pauze(0.5),
      ],
    },
  },

  // KL2. Duiken door het poortje
  {
    id: 'keeper-ld-door-het-poortje',
    naam: 'Duiken door het poortje',
    categorieen: ['laag-duiken'],
    uitleg:
      'Schuin voor de keeper staat aan elke kant een poortje van twee pionnen. De trainer gooit de bal laag net voorbij het poortje. De keeper duikt door het poortje heen naar voren op de bal, niet opzij of naar achteren. Zo leer je de hoek kleiner te maken terwijl je duikt. Daarna de andere kant.',
    organisatie: 'Keeper in het midden van het doel, aan beide kanten een poortje van 1,4 m schuin voor hem. De trainer op 8 m met ballen. Vier ballen per kant.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Eerste stap schuin naar voren, door het poortje', 'Handen eerst naar de bal, de bal tegen de grond klemmen', 'Snel opstaan en terug naar het midden'],
    variaties: {
      makkelijker: ['Breder poortje', 'Duiken uit kniezit'],
      moeilijker: ['Poortje verder weg', 'De trainer kiest pas op het laatste moment de kant'],
    },
    en: {
      naam: 'Diving through the gate',
      uitleg:
        'At an angle in front of the keeper there is a gate of two cones on each side. The coach throws the ball low just past the gate. The keeper dives forwards through the gate onto the ball, not sideways or backwards. You learn to close the angle while you dive. Then the other side.',
      organisatie: 'Keeper in the middle of the goal, a 1.4 m gate at an angle in front on both sides. The coach 8 m away with balls. Four balls per side.',
      benodigdheden: ['Goal', '4 cones', 'Balls'],
      coachpunten: ['First step forwards at an angle, through the gate', 'Hands to the ball first, pin it to the ground', 'Get up quickly and back to the middle'],
      variaties: {
        makkelijker: ['Wider gate', 'Dive from a kneeling position'],
        moeilijker: ['Gate further away', 'The coach picks the side at the last moment'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 15 }),
      objecten: [
        goal,
        pion('p1', 32.2, 2.1),
        pion('p2', 32.9, 3.3),
        pion('p3', 35.8, 2.1),
        pion('p4', 35.1, 3.3),
        keeper('k1', 1, 34, 1.6, { kijkrichting: 90, verdedigt: 'g1' }),
        trainer(34.6, 9.4, -90),
        bal('bal', 34.6, 8.85, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 0.4, duikNaar: [31.4, 3.6], duikHoogte: 0.3 }),
        pauze(0.6),
        op(),
        stap({ type: 'loop', wie: 'k1', via: [[33.2, 4.2]], naar: [34, 1.6], start: 0.2 }),
        terug(),
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 0.4, duikNaar: [36.6, 3.6], duikHoogte: 0.3 }),
        pauze(0.6),
        op(),
        pauze(0.5),
      ],
    },
  },

  // KL3. Lage bal na een stap over de stok
  {
    id: 'keeper-ld-stap-over-de-stok',
    naam: 'Lage bal na een stap over de stok',
    categorieen: ['laag-duiken'],
    uitleg:
      'Naast de keeper ligt een stok op de grond. Hij stapt zijwaarts over de stok, zonder hem te raken, en duikt meteen laag naar de bal die de trainer in de hoek gooit. Opstaan, terug over de stok en de volgende bal naar de andere kant.',
    organisatie: 'Twee stokken op de grond, 1 m links en rechts van het midden van het doel. De trainer op 9 m met ballen. Drie ballen per kant.',
    benodigdheden: ['Goal', '2 stokken', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Kleine snelle stappen over de stok, knieën omhoog', 'Na de stap meteen afzetten met het been aan de duikkant', 'Laag blijven: de duik gaat vlak over de grond'],
    variaties: {
      makkelijker: ['Eerst een pauze na de stap', 'Bal dichterbij'],
      moeilijker: ['Twee stappen over twee stokken', 'Bal verder in de hoek'],
    },
    en: {
      naam: 'Low ball after a step over the stick',
      uitleg:
        'Next to the keeper a stick lies on the ground. They step sideways over the stick without touching it and immediately dive low to the ball the coach throws into the corner. Get up, back over the stick and the next ball to the other side.',
      organisatie: 'Two sticks on the ground, 1 m left and right of the middle of the goal. The coach 9 m away with balls. Three balls per side.',
      benodigdheden: ['Goal', '2 sticks', 'Balls'],
      coachpunten: ['Small quick steps over the stick, knees up', 'After the step, push off straight away with the leg on the diving side', 'Stay low: the dive goes flat over the ground'],
      variaties: {
        makkelijker: ['A pause after the step first', 'Ball closer'],
        moeilijker: ['Two steps over two sticks', 'Ball further into the corner'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 15 }),
      objecten: [goal, stok('s1', 33, 1.8, 90), stok('s2', 35, 1.8, 90), keeper('k1', 1, 34, 1.8, { kijkrichting: 90, verdedigt: 'g1' }), trainer(34, 10, -90), bal('bal', 34, 9.45, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [31.9, 1.8], manier: 'voetenwerk', kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 0.3, duikNaar: [30.6, 2.3], duikHoogte: 0.25 }),
        pauze(0.6),
        op(),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.8], manier: 'voetenwerk', kijk: 90, start: 0.2 }),
        terug(),
        stap({ type: 'loop', wie: 'k1', naar: [36.1, 1.8], manier: 'voetenwerk', kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 0.3, duikNaar: [37.4, 2.3], duikHoogte: 0.25 }),
        pauze(0.6),
        op(),
        pauze(0.4),
      ],
    },
  },

  // KL4. Twee ballen kort na elkaar aan één kant
  {
    id: 'keeper-ld-twee-ballen-een-kant',
    naam: 'Twee ballen kort na elkaar aan één kant',
    categorieen: ['laag-duiken'],
    uitleg:
      'Een meter naast de paal ligt een bal stil. De trainer gooit een lage bal naar dezelfde kant. De keeper duikt, vangt en legt de bal weg, staat meteen op en duikt dan op de stilliggende bal die een meter verderop ligt. Snel opstaan is hier het belangrijkst.',
    organisatie: 'Keeper in het midden van het doel, één bal stil naast de paal. De trainer op 8 m met ballen. Twee series per kant.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Na de eerste bal: leg hem opzij en sta op via je knie', 'Kijk al naar de tweede bal terwijl je opstaat', 'Ook de tweede duik naar voren, niet achteruit'],
    variaties: {
      makkelijker: ['Tweede bal dichterbij', 'Even rust tussen de twee ballen'],
      moeilijker: ['De trainer gooit de tweede bal ook', 'Tweede bal aan de andere kant'],
    },
    en: {
      naam: 'Two balls in quick succession on one side',
      uitleg:
        'A metre beside the post a ball lies still. The coach throws a low ball to the same side. The keeper dives, catches and puts the ball down, gets straight up and then dives on the still ball a metre further on. Getting up quickly is what matters most here.',
      organisatie: 'Keeper in the middle of the goal, one ball still beside the post. The coach 8 m away with balls. Two sets per side.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['After the first ball: put it aside and get up via your knee', 'Already look at the second ball while you get up', 'The second dive also goes forwards, not backwards'],
      variaties: {
        makkelijker: ['Second ball closer', 'A short rest between the two balls'],
        moeilijker: ['The coach throws the second ball too', 'Second ball on the other side'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 15 }),
      objecten: [goal, keeper('k1', 1, 34, 1.8, { kijkrichting: 90 }), trainer(34.8, 9.4, -90), bal('b1', 34.8, 8.85, 't1'), bal('b2', 30.3, 1.4)],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 0.35, duikNaar: [32.2, 2.6], duikHoogte: 0.3 }),
        pauze(0.4),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: [33, 4.2], worp: 'onderhands', hoogte: 'grond', bal: 'b1' }),
        stap({ type: 'pluk', wie: 'k1', bal: 'b2' }),
        pauze(0.8),
        op(),
        pauze(0.4),
      ],
    },
  },

  // KL5. Rollen en klemmen
  {
    id: 'keeper-ld-rollen-klemmen',
    naam: 'Rollen en klemmen',
    categorieen: ['laag-duiken'],
    uitleg:
      'De trainer rolt de bal zacht een stukje naast de keeper. De keeper laat zich op zijn zij vallen, met zijn handen achter de bal: één hand erachter, één erop. Hij klemt de bal tegen de grond en trekt zijn bovenste knie ervoor, zodat de bal niet meer weg kan. Om de beurt naar links en rechts.',
    organisatie: 'Keeper op de doellijn of op een zachte ondergrond, de trainer op 4 m. Eerst vanuit kniezit, daarna staand. Vier ballen per kant.',
    benodigdheden: ['Goal (of 2 pionnen)', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: ['jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Op je zij vallen, niet op je buik of rug', 'Eén hand achter de bal, één erop', 'Bovenste knie omhoog, voor de bal'],
    variaties: {
      makkelijker: ['Vanuit kniezit', 'Bal rustiger'],
      moeilijker: ['Bal verder weg', 'Na het klemmen meteen opstaan en een tweede bal'],
    },
    en: {
      naam: 'Roll and clamp',
      uitleg:
        'The coach rolls the ball gently a little to one side of the keeper. The keeper drops onto their side with their hands behind the ball: one hand behind it, one on top. They pin the ball to the ground and bring the top knee up in front of it, so the ball cannot escape. Left and right in turn.',
      organisatie: 'Keeper on the goal line or on soft ground, the coach 4 m away. First from kneeling, then standing. Four balls per side.',
      benodigdheden: ['Goal (or 2 cones)', 'Balls'],
      coachpunten: ['Fall onto your side, not your stomach or back', 'One hand behind the ball, one on top', 'Top knee up, in front of the ball'],
      variaties: {
        makkelijker: ['From kneeling', 'Calmer ball'],
        moeilijker: ['Ball further away', 'After clamping, get up straight away for a second ball'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 27, y: -3, breedte: 14, lengte: 11 }),
      objecten: [goal, keeper('k1', 1, 34, 1.8, { kijkrichting: 90 }), trainer(35.6, 6.4, -110), bal('bal', 35.4, 5.9, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'grond', duikNaar: [32.8, 2.1], duikHoogte: 0.15 }),
        pauze(0.8),
        op(),
        terug(),
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'grond', duikNaar: [35.2, 2.1], duikHoogte: 0.15 }),
        pauze(0.8),
        op(),
        pauze(0.4),
      ],
    },
  },

  // KL6. Lage duik na een schijnschot
  {
    id: 'keeper-ld-na-schijnschot',
    naam: 'Lage duik na een schijnschot',
    categorieen: ['laag-duiken', 'reactie'],
    uitleg:
      'De trainer dribbelt op het doel af, doet alsof hij schiet, neemt de bal achter zijn standbeen mee en schiet dan laag in de andere hoek. De keeper blijft staan in zijn basishouding tot de bal echt weg is: wie op het schijnschot al duikt, ligt verkeerd. Dan pas duiken, naar de goede kant.',
    organisatie: 'Keeper in het doel, de trainer met ballen op 14 m; hij dribbelt tot ± 10 m. Om de beurt een echt schot en een schijnschot, zodat de keeper niet kan raden.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Blijf staan tot de bal van de voet is', 'Gewicht op je voorvoeten, zodat je naar beide kanten kunt', 'Kijk naar de bal, niet naar het lichaam van de schutter'],
    variaties: {
      makkelijker: ['Schijnschot zonder doordribbelen, rustig schot', 'Alleen naar één kant'],
      moeilijker: ['Een tweede schijnschot', 'Schot van dichterbij'],
    },
    en: {
      naam: 'Low dive after a dummy shot',
      uitleg:
        'The coach dribbles towards goal, pretends to shoot, drags the ball behind their standing leg and then shoots low into the other corner. The keeper stays in the set position until the ball has really gone: whoever dives on the dummy is on the wrong foot. Only then dive, to the right side.',
      organisatie: 'Keeper in goal, the coach with balls 14 m out; they dribble to about 10 m. A real shot and a dummy in turn, so the keeper cannot guess.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Stay put until the ball has left the foot', 'Weight on the balls of your feet, so you can go either way', 'Watch the ball, not the shooter’s body'],
      variaties: {
        makkelijker: ['Dummy without dribbling on, calm shot', 'Only to one side'],
        moeilijker: ['A second dummy', 'Shot from closer in'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 20 }),
      objecten: [goal, keeper('k1', 1, 34, 1.5, { kijkrichting: 90, verdedigt: 'g1' }), trainer(35, 14, -90), bal('bal', 35, 13.45, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 't1', naar: [35, 10.4] }),
        stap({ type: 'truc', wie: 't1', soort: 'cruijff', naar: [33.2, 9.6] }),
        stap({ type: 'schot', van: 't1', naar: [31.6, 0.3], hoogte: 'grond', afloop: 'vangt' }),
        pauze(1.2),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('keepers', oefeningen);
