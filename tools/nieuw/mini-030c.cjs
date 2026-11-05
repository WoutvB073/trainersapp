// Mini Talents 0.30.0, blok Afwerken (A1–A15). Draaien: node tools/nieuw/mini-030c.cjs
const { zet } = require('./hulp.cjs');
const { pop, horde } = require('./bouwstenen.cjs');
const { KLEUREN: K, mini, hoepel, kaatsbord, miniGoal, eGoal, pionHoog, pionGroot, tennisbal, leeg, trainer, speler, bal, hoedje, stap } = require('./mini-hulp.cjs');

const ORG = 'Voor 5 kinderen: zet de oefening twee keer naast elkaar neer, zodat er maximaal 2–3 in een rij staan. Speel 15 minuten.';
const ORG_EN = 'For 5 children: set the drill up twice side by side, so there are at most 2–3 in a line. Play for 15 minutes.';
const cat = ['afwerken'];

/** Drie kinderen met een bal in een rij; de eerste twee doen de oefening (de derde schuift door). */
const rijKinderen = (metBal = true) => [1, 2, 3].flatMap((i) => [speler(`a${i}`, i, 0, 0), ...(metBal ? [bal(`b${i}`, 0, 0, `a${i}`)] : [])]);
const rij = (x, y) => [{ id: 'r1', x, y, richting: 60, spelers: ['a1', 'a2', 'a3'] }];
/** Herhaling voor de eerste twee uit de rij, met aansluiten aan het eind; `om` = eerst daarheen, buiten de baan om. */
const beurt = (stappen, waarden, om) => [
  {
    herhaal: {
      spelers: ['a1', 'a2'],
      stappen: [...stappen, ...(om ? [{ acties: [{ type: 'loop', wie: '@', naar: om, duur: 1.4, spoor: false }] }] : []), { acties: [{ type: 'aansluiten', wie: '@', rij: 'r1' }] }],
      ...(waarden ? { waarden } : {}),
    },
  },
];

const oefeningen = [
  // A1
  mini({
    id: 'veld-mt-pionnen-omgooien',
    naam: 'Pionnen omgooien',
    categorieen: cat,
    uitleg: 'Daar staan hoge pionnen. Sta achter de lijn en schiet ze om! Boem, daar gaat er een. De trainer zet ze snel weer neer. Hoeveel schiet jij er om?',
    organisatie: `5 hoge pionnen op een rij, schietlijn op 5 m. Alle kinderen schieten tegelijk, ieder met een bal, en halen de bal zelf op. De trainer zet de pionnen terug. Voor 5 kinderen; niemand wacht. Speel 15 minuten.`,
    benodigdheden: ['5 hoge pionnen', '2 hoedjes', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Kijk naar de bal als je schiet'],
    variaties: {
      makkelijker: ['Dichterbij', 'Grote pionnen'],
      moeilijker: ['Verder weg', 'Met je andere voet'],
    },
    en: {
      naam: 'Knock over the cones',
      uitleg: 'Look at those tall cones. Stand behind the line and knock them over! Boom, there goes one. The coach quickly stands them up again. How many can you knock over?',
      organisatie: '5 tall cones in a row, shooting line 5 m away. All the children shoot at the same time, each with a ball, and fetch their own ball. The coach stands the cones back up. For 5 children; nobody waits. Play for 15 minutes.',
      benodigdheden: ['5 tall cones', '2 disc cones', '1 football per child'],
      coachpunten: ['Look at the ball when you shoot'],
      variaties: {
        makkelijker: ['Closer', 'Large cones'],
        moeilijker: ['Further away', 'Use your other foot'],
      },
    },
    tekening: {
      ...leeg(12, 10),
      objecten: [
        pionHoog('p1', 3, 2, K.rood),
        pionHoog('p2', 6, 2, K.blauw),
        pionHoog('p3', 9, 2, K.geel),
        hoedje('h1', 1, 7.4),
        hoedje('h2', 11, 7.4),
        trainer(1.2, 3.2, 0),
        ...[3, 6, 9].flatMap((x, i) => [speler(`a${i + 1}`, i + 1, x, 8, { kijkrichting: -90 }), bal(`b${i + 1}`, x, 7.45, `a${i + 1}`)]),
      ],
      animatie: [
        stap(...[3, 6, 9].map((x, i) => ({ type: 'schot', van: `a${i + 1}`, naar: [x, 2.35], hoogte: 'grond' }))),
        stap({ type: 'valOm', object: 'p1', hoek: -90 }, { type: 'valOm', object: 'p2', hoek: -90 }, { type: 'valOm', object: 'p3', hoek: -90 }),
        stap({ type: 'loop', wie: 't1', naar: [3.8, 3.2], duur: 1.2 }),
        stap({ type: 'zetOp', wie: 't1', object: 'p1' }),
        stap({ type: 'loop', wie: 't1', naar: [6.8, 3.2], duur: 1 }),
        stap({ type: 'zetOp', wie: 't1', object: 'p2' }),
      ],
    },
  }),

  // A2
  mini({
    id: 'veld-mt-dribbel-en-schiet',
    naam: 'Dribbel en schiet',
    categorieen: cat,
    uitleg: 'Dribbel door het poortje, kijk naar het goaltje en schiet! Zit hij erin? Haal je bal op en sluit achter aan.',
    organisatie: `Poortje van 2 hoedjes (2 m breed) op 5 m van de start, mini-goaltje 5 m verder. ${ORG}`,
    benodigdheden: ['1 mini-goaltje', '2 hoedjes', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Bal dicht bij je voet', 'Kijk op voor je schiet'],
    variaties: {
      makkelijker: ['Dichter bij het goaltje', 'Poortje breder'],
      moeilijker: ['Poortje smaller', 'Met je andere voet schieten'],
    },
    en: {
      naam: 'Dribble and shoot',
      uitleg: 'Dribble through the gate, look at the mini-goal and shoot! Did it go in? Fetch your ball and join the back of the line.',
      organisatie: `Gate of 2 disc cones (2 m wide) 5 m from the start, mini-goal 5 m further on. ${ORG_EN}`,
      benodigdheden: ['1 mini-goal', '2 disc cones', '1 football per child'],
      coachpunten: ['Keep the ball close to your foot', 'Look up before you shoot'],
      variaties: {
        makkelijker: ['Closer to the mini-goal', 'A wider gate'],
        moeilijker: ['A narrower gate', 'Shoot with your other foot'],
      },
    },
    tekening: {
      ...leeg(10, 15),
      objecten: [miniGoal('g1', 5, 1.2), hoedje('h1', 4, 7.2), hoedje('h2', 6, 7.2), ...rijKinderen()],
      rijen: rij(5, 11),
      animatie: beurt([{ acties: [{ type: 'dribbel', wie: '@', naar: [5, 4.4], duur: 3 }] }, { acties: [{ type: 'schot', van: '@', naar: [5, 0.8] }] }], undefined, [8.6, 5]),
    },
  }),

  // A3
  mini({
    id: 'veld-mt-ballen-van-de-pion',
    naam: 'Ballen van de pion',
    categorieen: cat,
    uitleg: 'In het doel liggen ballen op pionnen. Mik goed en schiet ze eraf! Valt de bal van de pion? Dan heb je hem geraakt.',
    organisatie: `E-goal met 3 grote pionnen op de doellijn, op elke pion een bal. Schietlijn op 6 m. De trainer legt de ballen terug. ${ORG}`,
    benodigdheden: ['1 E-goal', '3 grote pionnen', '3 voetballen voor op de pion', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Mik op de pion', 'Niet te hard: goed richten'],
    variaties: {
      makkelijker: ['Dichterbij', 'Meer pionnen'],
      moeilijker: ['Verder weg', 'Eerst dribbelen, dan schieten'],
    },
    en: {
      naam: 'Balls off the cones',
      uitleg: 'There are balls on cones in the goal. Aim carefully and shoot them off! Did the ball fall off the cone? Then you hit it.',
      organisatie: `E-goal with 3 large cones on the goal line, a ball on each cone. Shooting line 6 m away. The coach puts the balls back. ${ORG_EN}`,
      benodigdheden: ['1 E-goal', '3 large cones', '3 footballs for the cones', '1 football per child'],
      coachpunten: ['Aim at the cone', 'Not too hard: aim well'],
      variaties: {
        makkelijker: ['Closer', 'More cones'],
        moeilijker: ['Further away', 'Dribble first, then shoot'],
      },
    },
    tekening: {
      ...leeg(12, 13),
      objecten: [
        eGoal('g1', 6, 1.8),
        ...[4.4, 6, 7.6].flatMap((x, i) => [pionGroot(`p${i + 1}`, x, 1.4), { ...bal(`e${i + 1}`, x, 1.4), opHoogte: 0.56 }]),
        ...rijKinderen(),
      ],
      rijen: rij(6, 8),
      animatie: beurt(
        [
          { acties: [{ type: 'schot', van: '@', naar: '@doel', hoogte: 0.5, eindHoogte: 0.4 }] },
          { acties: [{ type: 'valOm', object: '@ei', naar: '@weg' }] },
        ],
        { doel: [[4.4, 1.8], [7.6, 1.8]], ei: ['e1', 'e3'], weg: [[4.2, 0.7], [7.8, 0.7]] },
      ),
    },
  }),

  // A4
  mini({
    id: 'veld-mt-hoekenjacht',
    naam: 'Hoekenjacht',
    categorieen: cat,
    uitleg: 'In het doel hangt een net met gaten in de hoeken. Schiet je door een gat? Dan krijg je 3 punten! Raak je het net? Dan krijg je 1 punt. Wie heeft de meeste punten?',
    organisatie: `E-goal met een net met open hoeken. Schietlijn op 6 m. Door een hoek = 3 punten, ergens anders in het doel = 1 punt. ${ORG}`,
    benodigdheden: ['1 E-goal', '1 net met open hoeken', '2 hoedjes', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Kijk naar de hoek en mik'],
    variaties: {
      makkelijker: ['Dichterbij', 'Bal stil leggen en rustig schieten'],
      moeilijker: ['Verder weg', 'Alleen de lage hoeken tellen'],
    },
    en: {
      naam: 'Corner hunt',
      uitleg: 'There’s a net in the goal with holes in the corners. Do you shoot through a hole? You get 3 points! Do you hit the net? You get 1 point. Who has the most points?',
      organisatie: `E-goal with a net with open corners. Shooting line 6 m away. Through a corner = 3 points, anywhere else in the goal = 1 point. ${ORG_EN}`,
      benodigdheden: ['1 E-goal', '1 net with open corners', '2 disc cones', '1 football per child'],
      coachpunten: ['Look at the corner and aim'],
      variaties: {
        makkelijker: ['Closer', 'Place the ball and shoot calmly'],
        moeilijker: ['Further away', 'Only the low corners count'],
      },
    },
    tekening: {
      ...leeg(12, 13),
      objecten: [eGoal('g1', 6, 1.8), { id: 'n1', soort: 'doelnet', x: 6, y: 1.8, breedte: 5, hoogte: 2, doel: 'g1' }, hoedje('h1', 1.5, 8), hoedje('h2', 10.5, 8), ...rijKinderen()],
      rijen: rij(6, 8),
      animatie: [
        stap({ type: 'schot', van: 'a1', naar: [8.13, 1.3], hoogte: 'laag', eindHoogte: 0.35 }),
        stap({ type: 'aansluiten', wie: 'a1', rij: 'r1' }),
        stap({ type: 'schot', van: 'a2', naar: [6.5, 1.8], raakt: 'net', eindHoogte: 0.9, terugNaar: [6.3, 4.6] }),
        stap({ type: 'aansluiten', wie: 'a2', rij: 'r1' }),
      ],
    },
  }),

  // A5
  mini({
    id: 'veld-mt-slalom-en-scoren',
    naam: 'Slalom en scoren',
    categorieen: cat,
    uitleg: 'Dribbel als een slang langs de pionnen. Bij de laatste pion kijk je op en schiet je op het goaltje. Goal!',
    organisatie: `3 pionnen op 2 m van elkaar, mini-goaltje 4 m na de laatste pion. ${ORG}`,
    benodigdheden: ['1 mini-goaltje', '3 grote pionnen', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Kleine tikjes om de pionnen'],
    variaties: {
      makkelijker: ['Twee pionnen', 'Dichter bij het goaltje'],
      moeilijker: ['Meer pionnen', 'Schieten met je andere voet'],
    },
    en: {
      naam: 'Slalom and score',
      uitleg: 'Dribble past the cones like a snake. At the last cone, look up and shoot at the mini-goal. Goal!',
      organisatie: `3 cones 2 m apart, mini-goal 4 m after the last cone. ${ORG_EN}`,
      benodigdheden: ['1 mini-goal', '3 large cones', '1 football per child'],
      coachpunten: ['Small touches around the cones'],
      variaties: {
        makkelijker: ['Two cones', 'Closer to the mini-goal'],
        moeilijker: ['More cones', 'Shoot with your other foot'],
      },
    },
    tekening: {
      ...leeg(10, 16),
      objecten: [miniGoal('g1', 5, 1.2), pionGroot('p1', 5, 10), pionGroot('p2', 5, 8), pionGroot('p3', 5, 6), ...rijKinderen()],
      rijen: rij(5, 12.4),
      animatie: beurt([
        { acties: [{ type: 'dribbel', wie: '@', via: [[3.9, 10], [6.1, 8], [3.9, 6]], naar: [5, 4.2], duur: 5, manier: 'wandel' }] },
        { acties: [{ type: 'schot', van: '@', naar: [5, 0.8] }] },
      ], undefined, [8.6, 5]),
    },
  }),

  // A6
  mini({
    id: 'veld-mt-kleurendoel',
    naam: 'Kleurendoel',
    categorieen: cat,
    uitleg: 'Bij elk goaltje ligt een gekleurd hoedje. Dribbel maar! Roept de trainer "rood", dan schiet je op het goaltje met het rode hoedje. Goed luisteren!',
    organisatie: `Twee mini-goaltjes op 5 m van elkaar, bij elk goaltje een hoedje in een eigen kleur. De kinderen dribbelen 7 m ervoor; de trainer roept een kleur. ${ORG}`,
    benodigdheden: ['2 mini-goaltjes', '2 hoedjes in 2 kleuren', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Kijk op en luister', 'Bal klaarleggen en dan schieten'],
    variaties: {
      makkelijker: ['De trainer wijst ook', 'Dichterbij'],
      moeilijker: ['Drie goaltjes', 'De trainer roept pas laat'],
    },
    en: {
      naam: 'Colour goal',
      uitleg: 'There’s a coloured disc cone by each mini-goal. Dribble! When the coach calls "red", shoot at the mini-goal with the red disc cone. Listen carefully!',
      organisatie: `Two mini-goals 5 m apart, each with a disc cone in its own colour. The children dribble 7 m in front of them; the coach calls a colour. ${ORG_EN}`,
      benodigdheden: ['2 mini-goals', '2 disc cones in 2 colours', '1 football per child'],
      coachpunten: ['Look up and listen', 'Set the ball and then shoot'],
      variaties: {
        makkelijker: ['The coach points as well', 'Closer'],
        moeilijker: ['Three mini-goals', 'The coach calls later'],
      },
    },
    tekening: {
      ...leeg(12, 13),
      objecten: [miniGoal('g1', 3.5, 1.2), miniGoal('g2', 8.5, 1.2), hoedje('h1', 4.8, 1.4, K.rood), hoedje('h2', 9.8, 1.4, K.blauw), trainer(11, 8, 180), ...rijKinderen()],
      rijen: rij(6, 9.4),
      animatie: beurt(
        [
          { acties: [{ type: 'dribbel', wie: '@', naar: '@plek', duur: 2.6 }] },
          { acties: [{ type: 'schot', van: '@', naar: '@doel' }] },
        ],
        { plek: [[4.2, 5], [7.8, 5]], doel: [[3.5, 0.8], [8.5, 0.8]] },
      ),
    },
  }),

  // A7
  mini({
    id: 'veld-mt-poortjesschieten',
    naam: 'Poortjesschieten',
    categorieen: cat,
    uitleg: 'Daar staan drie poortjes. Het brede poortje is makkelijk: 1 punt. Het smalle poortje is moeilijk: 3 punten! Welk poortje kies jij?',
    organisatie: `3 poortjes van hoedjes op een lijn (2 m, 1,5 m en 1 m breed), schietlijn op 5 m. Breed = 1 punt, smal = 3 punten. ${ORG}`,
    benodigdheden: ['6 hoedjes', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Zachtjes en goed mikken'],
    variaties: {
      makkelijker: ['Poortjes breder', 'Dichterbij'],
      moeilijker: ['Poortjes smaller', 'Met je andere voet'],
    },
    en: {
      naam: 'Gate shooting',
      uitleg: 'There are three gates. The wide gate is easy: 1 point. The narrow gate is hard: 3 points! Which gate will you choose?',
      organisatie: `3 gates of disc cones in a line (2 m, 1.5 m and 1 m wide), shooting line 5 m away. Wide = 1 point, narrow = 3 points. ${ORG_EN}`,
      benodigdheden: ['6 disc cones', '1 football per child'],
      coachpunten: ['Softly, and aim well'],
      variaties: {
        makkelijker: ['Wider gates', 'Closer'],
        moeilijker: ['Narrower gates', 'Use your other foot'],
      },
    },
    tekening: {
      ...leeg(12, 11),
      objecten: [hoedje('h1', 1.4, 2, K.geel), hoedje('h2', 3.4, 2, K.geel), hoedje('h3', 5.2, 2, K.blauw), hoedje('h4', 6.7, 2, K.blauw), hoedje('h5', 8.8, 2, K.rood), hoedje('h6', 9.8, 2, K.rood), ...rijKinderen()],
      rijen: rij(6, 7),
      animatie: beurt([{ acties: [{ type: 'schot', van: '@', naar: '@doel', hoogte: 'grond' }] }], { doel: [[2.4, 0.8], [9.3, 0.8]] }),
    },
  }),

  // A8
  mini({
    id: 'veld-mt-aannemen-en-schieten',
    naam: 'Aannemen en schieten',
    categorieen: cat,
    uitleg: 'De trainer speelt de bal naar je toe. Stop de bal met je voet. Kijk naar het goaltje en schiet! Scoren maar.',
    organisatie: `Trainer op 5 m opzij met de ballen, kind op 6 m van het mini-goaltje. ${ORG}`,
    benodigdheden: ['1 mini-goaltje', '2 hoedjes', 'Voetballen'],
    spelersNodig: 1,
    coachpunten: ['Eerst stilleggen, dan schieten'],
    variaties: {
      makkelijker: ['De trainer rolt de bal met de hand', 'Dichter bij het goaltje'],
      moeilijker: ['In één keer schieten', 'De bal komt van de andere kant'],
    },
    en: {
      naam: 'Control and shoot',
      uitleg: 'The coach plays the ball to you. Stop the ball with your foot. Look at the mini-goal and shoot! Time to score.',
      organisatie: `Coach 5 m to the side with the balls, child 6 m from the mini-goal. ${ORG_EN}`,
      benodigdheden: ['1 mini-goal', '2 disc cones', 'Footballs'],
      coachpunten: ['Stop it first, then shoot'],
      variaties: {
        makkelijker: ['The coach rolls the ball by hand', 'Closer to the mini-goal'],
        moeilijker: ['Shoot first time', 'The ball comes from the other side'],
      },
    },
    tekening: {
      ...leeg(12, 12),
      objecten: [miniGoal('g1', 5, 1.2), hoedje('h1', 1, 7), hoedje('h2', 8, 5.4), trainer(10.2, 7, 180), bal('b1', 9.65, 7, 't1'), bal('b2', 10.4, 8, undefined), ...rijKinderen(false)],
      rijen: rij(5, 7),
      animatie: [
        stap({ type: 'pass', van: 't1', naar: 'a1' }),
        stap({ type: 'schot', van: 'a1', naar: [5, 0.8] }),
        stap({ type: 'aansluiten', wie: 'a1', rij: 'r1' }, { type: 'pak', wie: 't1', bal: 'b2' }),
        stap({ type: 'pass', van: 't1', naar: 'a2' }),
        stap({ type: 'schot', van: 'a2', naar: [5, 0.8] }),
      ],
    },
  }),

  // A9
  mini({
    id: 'veld-mt-kaatsen-en-schieten',
    naam: 'Kaatsen en schieten',
    categorieen: cat,
    uitleg: 'Speel de bal tegen het kaatsbord. Hij komt terug! Neem hem aan en schiet op het goaltje.',
    organisatie: `Kaatsbord schuin op 4 m, mini-goaltje op 7 m. ${ORG}`,
    benodigdheden: ['1 kaatsbord', '1 mini-goaltje', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Stop de bal voor je schiet'],
    variaties: {
      makkelijker: ['Dichter bij het kaatsbord', 'De trainer rolt de bal in'],
      moeilijker: ['In één keer schieten', 'Met je andere voet'],
    },
    en: {
      naam: 'Rebound and shoot',
      uitleg: 'Play the ball against the rebound board. It comes back! Control it and shoot at the mini-goal.',
      organisatie: `Rebound board at an angle 4 m away, mini-goal 7 m away. ${ORG_EN}`,
      benodigdheden: ['1 rebound board', '1 mini-goal', '1 football per child'],
      coachpunten: ['Stop the ball before you shoot'],
      variaties: {
        makkelijker: ['Closer to the rebound board', 'The coach rolls the ball in'],
        moeilijker: ['Shoot first time', 'Use your other foot'],
      },
    },
    tekening: {
      ...leeg(12, 12),
      objecten: [kaatsbord('k1', 2.4, 4.6, 65), miniGoal('g1', 7, 1.2), ...rijKinderen()],
      rijen: rij(6.4, 7),
      animatie: beurt([
        { acties: [{ type: 'pass', van: '@', naar: 'k1', terug: '@' }] },
        { acties: [{ type: 'schot', van: '@', naar: [7, 0.8] }] },
      ]),
    },
  }),

  // A10
  mini({
    id: 'veld-mt-hoepelpass',
    naam: 'Hoepelpass',
    categorieen: cat,
    uitleg: 'Speel de bal zachtjes zodat hij in de hoepel blijft liggen. Loop ernaartoe. Nu mag je één keer schieten op het goaltje. Raak?',
    organisatie: `Hoepel op 4 m van de start, mini-goaltje 5 m verder. ${ORG}`,
    benodigdheden: ['1 hoepel', '1 mini-goaltje', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Zachtjes spelen'],
    variaties: {
      makkelijker: ['Hoepel dichterbij', 'Grotere hoepel of twee hoepels'],
      moeilijker: ['Hoepel verder weg', 'Met je andere voet'],
    },
    en: {
      naam: 'Hoop pass',
      uitleg: 'Play the ball gently so that it stays in the hoop. Walk over to it. Now you get one shot at the mini-goal. A hit?',
      organisatie: `Hoop 4 m from the start, mini-goal 5 m further on. ${ORG_EN}`,
      benodigdheden: ['1 hoop', '1 mini-goal', '1 football per child'],
      coachpunten: ['Play it softly'],
      variaties: {
        makkelijker: ['Hoop closer', 'A bigger hoop or two hoops'],
        moeilijker: ['Hoop further away', 'Use your other foot'],
      },
    },
    tekening: {
      ...leeg(10, 14),
      objecten: [hoepel('h1', 5, 6, K.geel), miniGoal('g1', 5, 1.2), ...rijKinderen()],
      rijen: rij(5, 10),
      animatie: beurt([
        { acties: [{ type: 'pass', van: '@', naar: [5, 6] }] },
        { acties: [{ type: 'loop', wie: '@', naar: [5, 6.7], duur: 1.4 }] },
        { acties: [{ type: 'pak', wie: '@' }] },
        { acties: [{ type: 'schot', van: '@', naar: [5, 0.8] }] },
      ]),
    },
  }),

  // A11
  mini({
    id: 'veld-mt-hordes-en-schieten',
    naam: 'Hordes en schieten',
    categorieen: cat,
    uitleg: 'Spring als een kikker over de drie hordes. Daarna geeft de trainer je een bal. Schiet hem in het goaltje!',
    organisatie: `3 lage hordes op 1,5 m van elkaar, trainer opzij met de ballen, mini-goaltje op 5 m na de laatste horde. ${ORG}`,
    benodigdheden: ['3 hordes', '1 mini-goaltje', 'Voetballen'],
    spelersNodig: 1,
    coachpunten: ['Spring op twee voeten', 'Kijk naar de bal'],
    variaties: {
      makkelijker: ['Twee hordes', 'De trainer legt de bal klaar'],
      moeilijker: ['Op één been', 'In één keer schieten'],
    },
    en: {
      naam: 'Hurdles and shoot',
      uitleg: 'Jump over the three hurdles like a frog. Then the coach gives you a ball. Shoot it into the mini-goal!',
      organisatie: `3 low hurdles 1.5 m apart, coach to the side with the balls, mini-goal 5 m after the last hurdle. ${ORG_EN}`,
      benodigdheden: ['3 hurdles', '1 mini-goal', 'Footballs'],
      coachpunten: ['Jump on two feet', 'Look at the ball'],
      variaties: {
        makkelijker: ['Two hurdles', 'The coach sets the ball ready'],
        moeilijker: ['On one leg', 'Shoot first time'],
      },
    },
    tekening: {
      ...leeg(12, 15),
      objecten: [horde('o1', 5, 10, 0, 0.15), horde('o2', 5, 8.5, 0, 0.15), horde('o3', 5, 7, 0, 0.15), miniGoal('g1', 5, 1.2), trainer(9.6, 5, 180), bal('b1', 9.05, 5, 't1'), bal('b2', 10, 6, undefined), ...rijKinderen(false)],
      rijen: rij(5, 11.8),
      animatie: [
        stap({ type: 'loop', wie: 'a1', naar: [5, 5.4], manier: 'hordes', duur: 3.6 }),
        stap({ type: 'pass', van: 't1', naar: 'a1' }),
        stap({ type: 'schot', van: 'a1', naar: [5, 0.8] }),
        stap({ type: 'loop', wie: 'a1', naar: [7.6, 7.4], duur: 1.3, spoor: false }, { type: 'pak', wie: 't1', bal: 'b2' }),
        stap({ type: 'aansluiten', wie: 'a1', rij: 'r1' }),
        stap({ type: 'loop', wie: 'a2', naar: [5, 5.4], manier: 'hordes', duur: 3.6 }),
        stap({ type: 'pass', van: 't1', naar: 'a2' }),
        stap({ type: 'schot', van: 'a2', naar: [5, 0.8] }),
      ],
    },
  }),

  // A12
  mini({
    id: 'veld-mt-om-de-pop',
    naam: 'Om de pop',
    categorieen: cat,
    uitleg: 'Dribbel om de pop heen. Kijk op: daar is het doel. Schiet maar!',
    organisatie: `Pop op 5 m van de start, mini-goaltje 5 m erachter. ${ORG}`,
    benodigdheden: ['1 pop', '1 mini-goaltje', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Rustig om de pop, dan schieten'],
    variaties: {
      makkelijker: ['Pop dichterbij', 'Bal stil leggen voor het schot'],
      moeilijker: ['Linksom en rechtsom', 'Met je andere voet'],
    },
    en: {
      naam: 'Around the mannequin',
      uitleg: 'Dribble around the mannequin. Look up: there’s the goal. Shoot!',
      organisatie: `Mannequin 5 m from the start, mini-goal 5 m behind it. ${ORG_EN}`,
      benodigdheden: ['1 mannequin', '1 mini-goal', '1 football per child'],
      coachpunten: ['Calmly around the mannequin, then shoot'],
      variaties: {
        makkelijker: ['Mannequin closer', 'Stop the ball before the shot'],
        moeilijker: ['Go left and right around it', 'Use your other foot'],
      },
    },
    tekening: {
      ...leeg(10, 14),
      objecten: [pop('m1', 5, 6.4), miniGoal('g1', 5, 1.2), ...rijKinderen()],
      rijen: rij(5, 10.4),
      animatie: beurt([
        { acties: [{ type: 'dribbel', wie: '@', via: [[3.8, 7]], naar: [4.4, 4], duur: 3.4 }] },
        { acties: [{ type: 'schot', van: '@', naar: [5, 0.8] }] },
      ], undefined, [8.6, 5]),
    },
  }),

  // A13
  mini({
    id: 'veld-mt-ladder-en-scoren',
    naam: 'Ladder en scoren',
    categorieen: cat,
    uitleg: 'Ga met snelle voetjes door de loopladder. Bij de pion ligt je bal. Pak hem en schiet op het goaltje!',
    organisatie: `Loopladder, 1 m verder een pion met de ballen, mini-goaltje op 5 m. ${ORG}`,
    benodigdheden: ['1 loopladder', '1 grote pion', '1 mini-goaltje', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Kleine stapjes, dan rustig schieten'],
    variaties: {
      makkelijker: ['Korte ladder', 'Dichter bij het goaltje'],
      moeilijker: ['Zijwaarts door de ladder', 'Met je andere voet'],
    },
    en: {
      naam: 'Ladder and score',
      uitleg: 'Go through the speed ladder with quick feet. Your ball is by the cone. Take it and shoot at the mini-goal!',
      organisatie: `Speed ladder, 1 m further on a cone with the balls, mini-goal 5 m away. ${ORG_EN}`,
      benodigdheden: ['1 speed ladder', '1 large cone', '1 mini-goal', '1 football per child'],
      coachpunten: ['Small steps, then shoot calmly'],
      variaties: {
        makkelijker: ['A short ladder', 'Closer to the mini-goal'],
        moeilijker: ['Sideways through the ladder', 'Use your other foot'],
      },
    },
    tekening: {
      ...leeg(10, 15),
      objecten: [{ id: 'l1', soort: 'ladder', x: 5, y: 9, lengte: 3 }, pionGroot('p1', 3.4, 5.8), bal('b1', 5, 6), bal('b2', 5.8, 5.2), miniGoal('g1', 5, 1.2), ...rijKinderen(false)],
      rijen: rij(5, 11.2),
      animatie: beurt(
        [
          { acties: [{ type: 'loop', wie: '@', naar: '@plek', manier: 'voetenwerk', duur: 3 }] },
          { acties: [{ type: 'pak', wie: '@', bal: '@bal' }] },
          { acties: [{ type: 'schot', van: '@', naar: [5, 0.8] }] },
        ],
        { plek: [[5, 6.6], [5.2, 5.8]], bal: ['b1', 'b2'] },
        [8.6, 5],
      ),
    },
  }),

  // A14
  mini({
    id: 'veld-mt-tennisballen-van-de-pion',
    naam: 'Tennisballen van de pion',
    categorieen: cat,
    uitleg: 'In het doel staan hoge pionnen met een tennisbal erop. Dat is moeilijk! Mik goed en schiet de tennisbal eraf.',
    organisatie: `E-goal met 3 hoge pionnen op de doellijn, op elke pion een tennisbal. Schietlijn op 5 m. De trainer legt de ballen terug. ${ORG}`,
    benodigdheden: ['1 E-goal', '3 hoge pionnen', '3 tennisballen', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Kijk naar de pion en schiet recht vooruit'],
    variaties: {
      makkelijker: ['Dichterbij', 'Voetbal in plaats van tennisbal'],
      moeilijker: ['Verder weg', 'Eerst dribbelen'],
    },
    en: {
      naam: 'Tennis balls off the cones',
      uitleg: 'There are tall cones in the goal with a tennis ball on top. That’s hard! Aim carefully and shoot the tennis ball off.',
      organisatie: `E-goal with 3 tall cones on the goal line, a tennis ball on each cone. Shooting line 5 m away. The coach puts the balls back. ${ORG_EN}`,
      benodigdheden: ['1 E-goal', '3 tall cones', '3 tennis balls', '1 football per child'],
      coachpunten: ['Look at the cone and shoot straight ahead'],
      variaties: {
        makkelijker: ['Closer', 'A football instead of a tennis ball'],
        moeilijker: ['Further away', 'Dribble first'],
      },
    },
    tekening: {
      ...leeg(12, 12),
      objecten: [eGoal('g1', 6, 1.8), ...[4.4, 6, 7.6].flatMap((x, i) => [pionHoog(`p${i + 1}`, x, 1.4), tennisbal(`e${i + 1}`, x, 1.4, 0.76)]), ...rijKinderen()],
      rijen: rij(6, 7),
      animatie: beurt(
        [
          { acties: [{ type: 'schot', van: '@', naar: '@doel', hoogte: 0.8, eindHoogte: 0.6 }] },
          { acties: [{ type: 'valOm', object: '@ei', naar: '@weg' }] },
        ],
        { doel: [[4.4, 1.8], [7.6, 1.8]], ei: ['e1', 'e3'], weg: [[4.1, 0.6], [7.9, 0.6]] },
      ),
    },
  }),

  // A15
  mini({
    id: 'veld-mt-brug-en-goal',
    naam: 'Brug en goal',
    categorieen: cat,
    uitleg: 'Speel de bal zachtjes onder de brug door. Stap zelf over de brug heen. Pak je bal en schiet in het goaltje!',
    organisatie: `Hoge horde op 4 m van de start, mini-goaltje op 5 m na de horde. ${ORG}`,
    benodigdheden: ['1 horde', '1 mini-goaltje', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Zachtjes onder de brug, hard op doel'],
    variaties: {
      makkelijker: ['Bal met de hand onder de brug rollen', 'Dichter bij het goaltje'],
      moeilijker: ['Twee bruggen', 'Met je andere voet'],
    },
    en: {
      naam: 'Bridge and goal',
      uitleg: 'Play the ball gently under the bridge. Step over the bridge yourself. Take your ball and shoot into the mini-goal!',
      organisatie: `High hurdle 4 m from the start, mini-goal 5 m after the hurdle. ${ORG_EN}`,
      benodigdheden: ['1 hurdle', '1 mini-goal', '1 football per child'],
      coachpunten: ['Softly under the bridge, hard at the goal'],
      variaties: {
        makkelijker: ['Roll the ball under the bridge by hand', 'Closer to the mini-goal'],
        moeilijker: ['Two bridges', 'Use your other foot'],
      },
    },
    tekening: {
      ...leeg(10, 15),
      objecten: [horde('o1', 5, 7, 0), miniGoal('g1', 5, 1.2), ...rijKinderen()],
      rijen: rij(5, 11),
      animatie: beurt([
        { acties: [{ type: 'dribbel', wie: '@', naar: [5, 8.8], duur: 1.4 }] },
        { acties: [{ type: 'pass', van: '@', naar: [5, 5.4], onderdoor: 'o1' }] },
        { acties: [{ type: 'loop', wie: '@', naar: [5, 6], manier: 'hordes', duur: 1.6 }] },
        { acties: [{ type: 'pak', wie: '@' }] },
        { acties: [{ type: 'schot', van: '@', naar: [5, 0.8] }] },
      ], undefined, [8.6, 5]),
    },
  }),
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
