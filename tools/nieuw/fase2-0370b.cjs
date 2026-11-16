// Fase 2, deel 3, batch 1 (0.37.0), deel b: Warming-up W6–W10 uit VOORSTEL-OEFENINGEN.md. Draaien: node tools/nieuw/fase2-0370b.cjs
const { zet } = require('./hulp.cjs');
const { speler, trainer, bal, pion, hoedje, pauze, stap, B, C, zone, leeg, JO, OUD, MIDDEN, O6, KLEUR } = require('./fase2-hulp.cjs');

const oefeningen = [
  // W6. Dubbele rondo met doorschuiven
  {
    id: 'veld-wu-dubbele-rondo',
    naam: 'Dubbele rondo met doorschuiven',
    categorieen: ['warming-up', 'positiespel'],
    uitleg:
      'Twee vakken naast elkaar, in elk vak vier tegen één. Na vijf passes zonder dat de verdediger de bal raakt, speelt het team de bal over naar een speler in het andere vak. Wie die lange pass geeft, sprint mee en speelt in het andere vak verder. Zo staan er steeds andere spelers in elk vak en moet iedereen blijven kijken.',
    organisatie: 'Twee vakken van 10 × 10 m met 8 m ertussen. In elk vak vier buitenspelers en een verdediger in een hesje. Verovert de verdediger de bal, dan ruilt hij met wie de bal verloor.',
    benodigdheden: ['8 pionnen', '2 ballen', '2 hesjes'],
    spelersNodig: 10,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: vijf tegen twee in elk vak, of een derde vak erbij.',
    coachpunten: [
      'Speel weg van de verdediger, naar de kant waar hij niet staat',
      'Lange pass strak en vlak, op de voet van de ontvanger',
      'Na de lange pass meteen sprinten: in het andere vak heb je je nodig',
    ],
    variaties: {
      makkelijker: ['Groter vak', 'Pas na drie passes overspelen'],
      moeilijker: ['Alles in één keer', 'Twee verdedigers in elk vak', 'De lange pass moet halfhoog'],
    },
    en: {
      naam: 'Double rondo with rotation',
      uitleg:
        'Two boxes side by side, 4v1 in each. After five passes without the defender touching the ball, the team plays the ball over to a player in the other box. Whoever plays that long pass sprints across and carries on in the other box. That way the players in each box keep changing and everyone has to keep scanning.',
      organisatie: 'Two 10 × 10 m boxes, 8 m apart. Four outside players and a defender in a bib in each box. If the defender wins the ball, they swap with the player who lost it.',
      benodigdheden: ['8 cones', '2 balls', '2 bibs'],
      meerSpelers: 'With more players: 5v2 in each box, or add a third box.',
      coachpunten: [
        'Play away from the defender, to the side where they are not',
        'Long pass firm and flat, onto the receiver’s foot',
        'Sprint straight after the long pass: you are needed in the other box',
      ],
      variaties: {
        makkelijker: ['Bigger box', 'Switch after three passes'],
        moeilijker: ['Everything one touch', 'Two defenders in each box', 'The long pass must be at half height'],
      },
    },
    tekening: {
      ...leeg(32, 14),
      objecten: [
        zone('zl', 7, 7, 10, 10),
        zone('zr', 25, 7, 10, 10),
        speler('a1', 1, 2.5, 7, { kijkrichting: 0 }),
        speler('a2', 2, 7, 2.5, { kijkrichting: 90 }),
        speler('a3', 3, 11.5, 7, { kijkrichting: 180 }),
        speler('a4', 4, 7, 11.5, { kijkrichting: -90 }),
        C('c1', 5, 7.6, 7.6, { kijkrichting: 180 }),
        speler('a5', 6, 20.5, 7, { kijkrichting: 0 }),
        speler('a6', 7, 25, 2.5, { kijkrichting: 90 }),
        speler('a7', 8, 29.5, 7, { kijkrichting: 180 }),
        speler('a8', 9, 25, 11.5, { kijkrichting: -90 }),
        C('c2', 10, 24.4, 6.4, { kijkrichting: 0 }),
        bal('bl', 3.05, 7, 'a1'),
        bal('br', 29.5, 7.55, 'a7'),
      ],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'pass', van: 'a1', naar: 'a2' },
          { type: 'loop', wie: 'c1', naar: [5.6, 5.2], start: 0.2 },
          { type: 'pass', van: 'a7', naar: 'a8', start: 0.2 },
          { type: 'loop', wie: 'c2', naar: [26.6, 8.4], start: 0.3 },
        ),
        stap(
          { type: 'pass', van: 'a2', naar: 'a3' },
          { type: 'loop', wie: 'c1', naar: [8.6, 5.4], start: 0.2 },
          { type: 'pass', van: 'a8', naar: 'a5', start: 0.15 },
          { type: 'loop', wie: 'c2', naar: [23.2, 8.6], start: 0.3 },
        ),
        stap(
          { type: 'pass', van: 'a3', naar: 'a4' },
          { type: 'loop', wie: 'c1', naar: [8.4, 8.8], start: 0.2 },
          { type: 'pass', van: 'a5', naar: 'a6', start: 0.15 },
          { type: 'loop', wie: 'c2', naar: [23.4, 5.4], start: 0.3 },
        ),
        // Vijf passes: de lange pass naar het andere vak, de passer sprint mee.
        stap(
          { type: 'pass', van: 'a4', naar: 'a5' },
          {
            type: 'loop',
            wie: 'a4',
            via: [
              [10, 13.2],
              [17, 13.2],
            ],
            naar: [21.5, 11.5],
            manier: 'sprint',
            start: 0.3,
            tempo: 'gelijkmatig',
          },
          { type: 'loop', wie: 'c1', naar: [7, 9.2], start: 0.1 },
          { type: 'pass', van: 'a6', naar: 'a3', start: 0.6 },
        ),
        stap(
          { type: 'pass', van: 'a3', naar: 'a2' },
          { type: 'pass', van: 'a5', naar: 'a8', start: 0.2 },
          {
            type: 'loop',
            wie: 'a6',
            via: [
              [22, 0.7],
              [12, 0.7],
            ],
            naar: [3.6, 1.1],
            manier: 'sprint',
            start: 0.1,
            tempo: 'gelijkmatig',
          },
        ),
        pauze(0.8),
      ],
    },
  },

  // W7. Balrovers
  {
    id: 'veld-wu-balrovers',
    naam: 'Balrovers',
    categorieen: ['warming-up', 'een-tegen-een'],
    uitleg:
      'Iedereen dribbelt met een bal door het vak. Op het fluitsignaal leggen twee spelers hun bal buiten het vak en worden balrovers: zij proberen in 30 seconden zoveel mogelijk ballen af te pakken en het vak uit te spelen. Wie zijn bal kwijt is, haalt hem op en dribbelt verder. Daarna zijn twee anderen de rovers.',
    organisatie: 'Vak van 20 × 20 m. Iedereen een bal. Rondes van 30 seconden; tel hoeveel ballen de rovers het vak uit spelen.',
    benodigdheden: ['4 pionnen', '1 bal per speler', '2 hesjes'],
    spelersNodig: 6,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Houd je lichaam tussen de rover en je bal', 'Kijk op en dribbel naar de vrije ruimte', 'Rover: kies één speler en dwing hem naar de rand'],
    variaties: {
      makkelijker: ['Eén rover', 'Groter vak'],
      moeilijker: ['Drie rovers', 'Kleiner vak', 'Wie zijn bal kwijt is, wordt ook rover'],
    },
    en: {
      naam: 'Ball robbers',
      uitleg:
        'Everyone dribbles a ball around the area. On the whistle, two players leave their ball outside the area and become robbers: in 30 seconds they try to win as many balls as possible and play them out of the area. If you lose your ball, fetch it and carry on dribbling. Then two others are the robbers.',
      organisatie: '20 × 20 m area. A ball each. Rounds of 30 seconds; count how many balls the robbers play out of the area.',
      benodigdheden: ['4 cones', '1 ball per player', '2 bibs'],
      coachpunten: ['Keep your body between the robber and your ball', 'Look up and dribble into the free space', 'Robber: pick one player and force them to the edge'],
      variaties: {
        makkelijker: ['One robber', 'Bigger area'],
        moeilijker: ['Three robbers', 'Smaller area', 'If you lose your ball, you become a robber too'],
      },
    },
    tekening: {
      ...leeg(22, 22),
      objecten: [
        zone('z', 11, 11, 20, 20),
        pion('p1', 1, 1),
        pion('p2', 21, 1),
        pion('p3', 1, 21),
        pion('p4', 21, 21),
        speler('a1', 1, 5, 5, { kijkrichting: 0 }),
        speler('a2', 2, 15, 6, { kijkrichting: 120 }),
        speler('a3', 3, 6, 16, { kijkrichting: -60 }),
        speler('a4', 4, 16, 15, { kijkrichting: 180 }),
        C('c1', 5, 10, 11, { kijkrichting: 0 }),
        C('c2', 6, 11, 4, { kijkrichting: 90 }),
        bal('b1', 5.55, 5, 'a1'),
        bal('b2', 14.7, 6.5, 'a2'),
        bal('b3', 6.3, 15.5, 'a3'),
        bal('b4', 15.45, 15, 'a4'),
      ],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'dribbel', wie: 'a1', via: [[7, 4]], naar: [9, 5], duur: 1.6 },
          { type: 'dribbel', wie: 'a2', via: [[14.5, 9]], naar: [16, 11], duur: 1.6 },
          { type: 'dribbel', wie: 'a3', via: [[8, 17]], naar: [10, 17.5], duur: 1.6 },
          { type: 'dribbel', wie: 'a4', via: [[17.5, 13]], naar: [18, 10], duur: 1.6 },
          { type: 'loop', wie: 'c1', naar: [13.8, 11.4], manier: 'sprint', duur: 1.6 },
          { type: 'loop', wie: 'c2', naar: [9.8, 6.8], manier: 'sprint', duur: 1.6 },
        ),
        stap(
          { type: 'verover', wie: 'c1', van: 'a2' },
          { type: 'dribbel', wie: 'a1', naar: [6.5, 8.5], duur: 1 },
          { type: 'dribbel', wie: 'a3', naar: [12.5, 16.5], duur: 1 },
          { type: 'loop', wie: 'c2', naar: [7.6, 9.6], duur: 1 },
        ),
        stap(
          { type: 'pass', van: 'c1', naar: [22, 4] },
          { type: 'loop', wie: 'a2', naar: [20.2, 5.4], manier: 'sprint', start: 0.8 },
          { type: 'verover', wie: 'c2', van: 'a1' },
          { type: 'dribbel', wie: 'a4', naar: [18.5, 13.5], duur: 1 },
        ),
        stap(
          { type: 'pass', van: 'c2', naar: [9, 22.8] },
          { type: 'loop', wie: 'a1', via: [[4.4, 11.4]], naar: [7.4, 19.6], manier: 'sprint', start: 0.8 },
          { type: 'loop', wie: 'c1', naar: [13, 13], start: 0.2 },
        ),
        pauze(0.8),
      ],
    },
  },

  // W8. Driehoek op de loop
  {
    id: 'veld-wu-driehoek-op-de-loop',
    naam: 'Driehoek op de loop',
    categorieen: ['warming-up', 'pass-en-trap'],
    uitleg:
      'Drie spelers lopen samen een rondje om drie pionnen. Terwijl ze lopen, gaat de bal de andere kant op rond: je speelt naar de speler die achter je loopt. Zo moet je steeds vrijlopen en de bal in de loop aannemen. Na een paar rondes draait de looprichting om.',
    organisatie: 'Driehoek van drie pionnen met zijden van 10 m. Drie spelers en één bal. Rondes van 1 minuut, daarna de andere kant op.',
    benodigdheden: ['3 pionnen', '1 bal'],
    spelersNodig: 3,
    keepersNodig: 0,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Speel vóór de man, zodat hij niet hoeft in te houden', 'Neem aan in de looprichting en houd tempo', 'Praat: roep de naam van wie de bal krijgt'],
    variaties: {
      makkelijker: ['Wandeltempo', 'Twee keer raken'],
      moeilijker: ['Alles in één keer', 'Een tweede bal erbij', 'Op het fluitje de looprichting omdraaien'],
    },
    en: {
      naam: 'Triangle on the move',
      uitleg:
        'Three players run round three cones together. While they run, the ball goes round the other way: you pass to the player running behind you. That means you have to keep getting free and receive the ball on the move. After a few laps the running direction changes.',
      organisatie: 'Triangle of three cones with 10 m sides. Three players and one ball. Rounds of 1 minute, then the other way round.',
      benodigdheden: ['3 cones', '1 ball'],
      coachpunten: ['Pass in front of the runner so they do not have to slow down', 'Receive in your running direction and keep the tempo', 'Talk: call the name of whoever gets the ball'],
      variaties: {
        makkelijker: ['Walking pace', 'Two touches'],
        moeilijker: ['Everything one touch', 'Add a second ball', 'On the whistle, change running direction'],
      },
    },
    tekening: {
      ...leeg(16, 15),
      objecten: [
        pion('pA', 8, 2.5),
        pion('pB', 13.2, 11.5),
        pion('pC', 2.8, 11.5),
        speler('a1', 1, 9.5, 3.4, { kijkrichting: 60 }),
        speler('a2', 2, 12, 12.6, { kijkrichting: 180 }),
        speler('a3', 3, 3.2, 10, { kijkrichting: -60 }),
        bal('bal', 9.8, 3.9, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        // Lopen met de klok mee om de pionnen, de bal gaat tegen de klok in.
        stap(
          { type: 'pass', van: 'a1', naar: 'a3' },
          { type: 'loop', wie: 'a1', naar: [12.2, 8.4], duur: 1.6 },
          { type: 'loop', wie: 'a2', naar: [6.2, 12.6], duur: 1.6 },
          { type: 'loop', wie: 'a3', naar: [5, 6.4], duur: 1.6 },
        ),
        stap(
          { type: 'pass', van: 'a3', naar: 'a2' },
          { type: 'loop', wie: 'a3', naar: [8.6, 3.6], duur: 1.6 },
          {
            type: 'loop',
            wie: 'a1',
            via: [
              [14.8, 10.6],
              [14.8, 12.6],
            ],
            naar: [12.6, 13.6],
            duur: 1.6,
          },
          { type: 'loop', wie: 'a2', naar: [2.6, 9.6], duur: 1.6 },
        ),
        stap(
          { type: 'pass', van: 'a2', naar: 'a1' },
          { type: 'loop', wie: 'a2', naar: [6.2, 5], duur: 1.6 },
          { type: 'loop', wie: 'a3', naar: [11.8, 7.2], duur: 1.6 },
          { type: 'loop', wie: 'a1', naar: [8.2, 12.6], duur: 1.6 },
        ),
        stap(
          { type: 'pass', van: 'a1', naar: 'a3' },
          { type: 'loop', wie: 'a1', naar: [3.4, 10.4], duur: 1.6 },
          { type: 'loop', wie: 'a2', naar: [9.4, 3.4], duur: 1.6 },
          { type: 'loop', wie: 'a3', naar: [12.6, 11.2], duur: 1.6 },
        ),
        pauze(0.8),
      ],
    },
  },

  // W9. Ballen vangen met je voeten (O6)
  {
    id: 'veld-wu-ballen-vangen-voeten',
    naam: 'Ballen vangen met je voeten',
    categorieen: ['warming-up', 'techniek'],
    uitleg:
      'De trainer rolt steeds een bal het vak in. Ren erheen en stop de bal met je voet bovenop, voordat hij over de lijn rolt. Dan dribbel je hem terug naar de trainer. Lukt het? Dan krijg je een high five!',
    organisatie:
      'Vak van 10 × 10 m met een hoedje op elke hoek. De trainer staat aan één kant met een paar voetballen; 5 kinderen wachten naast hem en gaan om de beurt. Na een paar beurten rolt de trainer twee ballen tegelijk.',
    benodigdheden: ['4 hoedjes', '5 voetballen'],
    spelersNodig: 3,
    keepersNodig: 0,
    leeftijden: O6,
    doorwisselbaar: true,
    coachpunten: ['Kijk naar de bal en ren erheen', 'Zet je voet zachtjes bovenop de bal', 'Dribbel terug met kleine tikjes'],
    variaties: {
      makkelijker: ['De trainer rolt heel langzaam', 'Stoppen met je hand mag ook'],
      moeilijker: ['Twee ballen tegelijk voor twee kinderen', 'Stoppen met je andere voet', 'Daarna in een doeltje schieten'],
    },
    en: {
      naam: 'Catch the ball with your feet',
      uitleg:
        'The coach keeps rolling a ball into the area. Run to it and stop it by putting your foot on top before it rolls over the line. Then dribble it back to the coach. Did it work? High five!',
      organisatie:
        '10 × 10 m area with a disc cone on each corner. The coach stands on one side with a few balls; 5 children wait next to the coach and take turns. After a few turns the coach rolls two balls at once.',
      benodigdheden: ['4 disc cones', '5 balls'],
      coachpunten: ['Watch the ball and run to it', 'Put your foot gently on top of the ball', 'Dribble back with small touches'],
      variaties: {
        makkelijker: ['The coach rolls very slowly', 'Stopping it with your hand is allowed too'],
        moeilijker: ['Two balls at once for two children', 'Stop it with your other foot', 'Then shoot into a mini goal'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [
        zone('z', 7, 6, 10, 10),
        hoedje('h1', 2, 1),
        hoedje('h2', 12, 1),
        hoedje('h3', 2, 11),
        hoedje('h4', 12, 11),
        trainer(7, 12.6, -90),
        speler('a1', 1, 5.4, 12.4, { kijkrichting: -60 }),
        speler('a2', 2, 3.6, 13, { kijkrichting: -90 }),
        speler('a3', 3, 1.6, 13.4, { kijkrichting: -90 }),
        bal('b1', 7, 12.05, 't1'),
        bal('b2', 7.8, 13.3),
        bal('b3', 6.2, 13.3),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: [10, 3.5], worp: 'onderhands', hoogte: 'grond', snelheid: 3.4 }, { type: 'loop', wie: 'a1', naar: [9.8, 4.4], manier: 'sprint', start: 1.6 }),
        stap({ type: 'voetOpBal', wie: 'a1' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [10.6, 11.4] }, { type: 'pak', wie: 't1', bal: 'b2', start: 0.2 }),
        stap({ type: 'pass', van: 't1', naar: [4, 3.5], worp: 'onderhands', hoogte: 'grond', snelheid: 3.4 }, { type: 'loop', wie: 'a2', naar: [4.2, 4.4], manier: 'sprint', start: 1.6 }),
        stap({ type: 'voetOpBal', wie: 'a2' }),
        stap({ type: 'dribbel', wie: 'a2', naar: [5.4, 10.8] }),
        pauze(0.8),
      ],
    },
  },

  // W10. Cirkel met twee kaatsers
  {
    id: 'veld-wu-cirkel-kaatsers',
    naam: 'Cirkel met twee kaatsers',
    categorieen: ['warming-up', 'pass-en-trap'],
    uitleg:
      'Zes spelers staan in een cirkel, twee spelers staan in het midden. Een buitenspeler speelt in op een middenspeler, die in één keer terugkaatst en zich meteen omdraait naar een andere buitenspeler met een bal. De twee in het midden werken tegelijk, elk met een andere buitenspeler. Na een minuut wisselen ze met twee buitenspelers.',
    organisatie: 'Cirkel met een straal van 7 m, zes buitenspelers, waarvan drie met een bal. Twee spelers in het midden. Wisselen na 1 minuut.',
    benodigdheden: ['6 hoedjes', '3 ballen'],
    spelersNodig: 8,
    keepersNodig: 0,
    leeftijden: ['jo8-11', 'jo12-15'],
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: een tweede cirkel, of drie spelers in het midden.',
    coachpunten: ['Kijk voordat je terugkaatst al waar je volgende bal vandaan komt', 'Kaats op de voet terug, met de binnenkant', 'Draai open en loop een paar passen naar de volgende speler'],
    variaties: {
      makkelijker: ['Eén speler in het midden', 'Twee keer raken'],
      moeilijker: ['De buitenspelers spelen halfhoog: kaatsen met de wreef of het hoofd', 'Na het kaatsen eerst om een pion in het midden'],
    },
    en: {
      naam: 'Circle with two lay-off players',
      uitleg:
        'Six players stand in a circle, two players stand in the middle. An outside player passes to a middle player, who lays it off first time and turns straight away to another outside player with a ball. The two in the middle work at the same time, each with a different outside player. After a minute they swap with two outside players.',
      organisatie: 'Circle with a 7 m radius, six outside players, three of them with a ball. Two players in the middle. Swap after 1 minute.',
      benodigdheden: ['6 disc cones', '3 balls'],
      meerSpelers: 'With more players: a second circle, or three players in the middle.',
      coachpunten: [
        'Before laying it off, already check where your next ball is coming from',
        'Lay it off to feet, with the inside of your foot',
        'Open up and take a few steps towards the next player',
      ],
      variaties: {
        makkelijker: ['One player in the middle', 'Two touches'],
        moeilijker: ['The outside players serve at half height: lay it off with your instep or head', 'After the lay-off, first go round a cone in the middle'],
      },
    },
    tekening: {
      ...leeg(18, 18),
      objecten: [
        ...[0, 60, 120, 180, 240, 300].map((h, i) => hoedje(`h${i + 1}`, +(9 + 8 * Math.cos((h * Math.PI) / 180)).toFixed(2), +(9 + 8 * Math.sin((h * Math.PI) / 180)).toFixed(2), KLEUR.geel)),
        ...[0, 60, 120, 180, 240, 300].map((h, i) =>
          speler(`o${i + 1}`, i + 1, +(9 + 7 * Math.cos((h * Math.PI) / 180)).toFixed(2), +(9 + 7 * Math.sin((h * Math.PI) / 180)).toFixed(2), { kijkrichting: h + 180 }),
        ),
        B('m1', 7, 10.4, 9, { kijkrichting: 0 }),
        B('m2', 8, 7.6, 9, { kijkrichting: 180 }),
        bal('b1', 15.45, 9, 'o1'),
        bal('b2', 2.55, 9, 'o4'),
        bal('b3', 5.2, 3.4, 'o5'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'o1', naar: 'm1' }, { type: 'pass', van: 'o4', naar: 'm2', start: 0.1 }),
        stap({ type: 'pass', van: 'm1', naar: 'o1', direct: true }, { type: 'pass', van: 'm2', naar: 'o4', direct: true }),
        stap({ type: 'loop', wie: 'm1', naar: [10.4, 12.2], duur: 0.9 }, { type: 'loop', wie: 'm2', naar: [8.2, 6.4], duur: 0.9 }),
        stap({ type: 'pass', van: 'o5', naar: 'm2' }, { type: 'pass', van: 'o1', naar: 'o2', start: 0.1 }),
        stap({ type: 'pass', van: 'm2', naar: 'o5', direct: true }, { type: 'pass', van: 'o2', naar: 'm1' }),
        stap({ type: 'pass', van: 'm1', naar: 'o2', direct: true }),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
