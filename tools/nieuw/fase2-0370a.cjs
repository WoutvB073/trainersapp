// Fase 2, deel 3, batch 1 (0.37.0), deel a: Warming-up W1–W10 uit VOORSTEL-OEFENINGEN.md. Draaien: node tools/nieuw/fase2-0370a.cjs
const { zet } = require('./hulp.cjs');
const { speler, trainer, bal, pion, hoedje, pauze, stap, B, C, zone, leeg, doeltje, JO, OUD, MIDDEN, O6, KLEUR, lopen, dribbels, draai } = require('./fase2-hulp.cjs');

const oefeningen = [
  // W1. Nummers passen
  {
    id: 'veld-wu-nummers-passen',
    naam: 'Nummers passen',
    categorieen: ['warming-up', 'pass-en-trap'],
    uitleg:
      'Iedereen heeft een nummer en beweegt rustig door het vak. De bal gaat op volgorde rond: 1 speelt naar 2, 2 naar 3, en zo verder tot de laatste weer naar 1 speelt. Wie de bal net heeft gespeeld, loopt meteen naar een nieuwe plek. Na een paar rondes komt er een tweede bal bij, die de andere kant op gaat.',
    organisatie: 'Vak van 20 × 20 m met een pion op elke hoek. 6 tot 8 spelers met een nummer, eerst één bal. Na 2 minuten een tweede bal; na 4 minuten alleen nog in één keer spelen.',
    benodigdheden: ['4 pionnen', '2 ballen', 'Hesjes met nummers (of afspreken)'],
    spelersNodig: 6,
    keepersNodig: 0,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: [
      'Weet waar je volgende nummer is voordat de bal komt',
      'Na je pass meteen weg naar een open plek',
      'Vraag om de bal: roep je nummer of steek je hand op',
    ],
    variaties: {
      makkelijker: ['Stilstaan bij het passen', 'Groter vak'],
      moeilijker: ['Twee ballen tegelijk', 'Alleen in één keer', 'Op het fluitje de volgorde omdraaien'],
    },
    en: {
      naam: 'Passing by numbers',
      uitleg:
        'Everyone has a number and moves around the area at an easy pace. The ball goes round in order: 1 passes to 2, 2 to 3, and so on until the last player passes back to 1. Whoever has just passed moves straight away to a new space. After a few rounds a second ball comes in, going the other way.',
      organisatie: '20 × 20 m area with a cone on each corner. 6 to 8 numbered players, one ball to start. After 2 minutes add a second ball; after 4 minutes one touch only.',
      benodigdheden: ['4 cones', '2 balls', 'Numbered bibs (or agree the numbers)'],
      coachpunten: ['Know where your next number is before the ball arrives', 'After your pass, move away straight into a free space', 'Ask for the ball: call your number or raise your hand'],
      variaties: {
        makkelijker: ['Stand still when passing', 'Bigger area'],
        moeilijker: ['Two balls at once', 'One touch only', 'On the whistle, reverse the order'],
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
        speler('a1', 1, 6, 6, { kijkrichting: 0 }),
        speler('a2', 2, 15, 5, { kijkrichting: 180 }),
        speler('a3', 3, 17, 13, { kijkrichting: -120 }),
        speler('a4', 4, 9, 17, { kijkrichting: -60 }),
        speler('a5', 5, 4, 11, { kijkrichting: 0 }),
        speler('a6', 6, 12, 10, { kijkrichting: -90 }),
        bal('bal', 6.55, 6, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'a3', naar: [16.5, 15.5], duur: 1.4 }, { type: 'loop', wie: 'a5', naar: [4.5, 14], duur: 1.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }, { type: 'loop', wie: 'a1', naar: [7.5, 3.5], duur: 1.4 }, { type: 'loop', wie: 'a6', naar: [11, 8], duur: 1.4 }),
        stap({ type: 'pass', van: 'a3', naar: 'a4' }, { type: 'loop', wie: 'a2', naar: [13.5, 3.5], duur: 1.4 }, { type: 'loop', wie: 'a5', naar: [3.5, 9.5], duur: 1.4 }),
        stap({ type: 'pass', van: 'a4', naar: 'a5' }, { type: 'loop', wie: 'a6', naar: [13, 12], duur: 1.4 }, { type: 'loop', wie: 'a3', naar: [18, 10], duur: 1.4 }),
        stap({ type: 'pass', van: 'a5', naar: 'a6' }, { type: 'loop', wie: 'a4', naar: [10, 18.5], duur: 1.4 }, { type: 'loop', wie: 'a1', naar: [6, 6], duur: 1.4 }),
        stap({ type: 'pass', van: 'a6', naar: 'a1' }),
        pauze(0.8),
      ],
    },
  },

  // W2. Passen en van vak wisselen
  {
    id: 'veld-wu-passen-vak-wisselen',
    naam: 'Passen en van vak wisselen',
    categorieen: ['warming-up', 'pass-en-trap'],
    uitleg:
      'Twee vakken naast elkaar, in elk vak een bal. Je speelt de bal naar een medespeler in je eigen vak en sprint daarna naar het andere vak. Daar zoek je meteen een vrije plek om de bal te vragen. Zo moet je steeds opnieuw kijken waar je kunt aanspelen en waar je vrij kunt staan.',
    organisatie: 'Twee vakken van 14 × 14 m met 6 m ertussen. In elk vak 3 tot 4 spelers en één bal. Sprinten mag alleen langs de buitenkant van de vakken.',
    benodigdheden: ['8 pionnen', '2 ballen'],
    spelersNodig: 6,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: [
      'Kijk al tijdens het sprinten in het nieuwe vak: waar is de bal, waar is ruimte?',
      'Speel strak over de grond en op de goede voet',
      'Kom met een boogje vrij, zodat je open aanneemt',
    ],
    variaties: {
      makkelijker: ['Na de pass naar het andere vak wandelen', 'Meer spelers per vak'],
      moeilijker: ['Maximaal twee keer raken', 'Een verdediger in elk vak', 'De trainer wijst aan naar welk vak je gaat'],
    },
    en: {
      naam: 'Pass and switch boxes',
      uitleg:
        'Two boxes side by side, a ball in each. Pass to a teammate in your own box and then sprint to the other box. There, look straight away for a free space to ask for the ball. That way you constantly have to check where you can pass and where you can get free.',
      organisatie: 'Two 14 × 14 m boxes, 6 m apart. 3 or 4 players and one ball in each box. Players may only sprint round the outside of the boxes.',
      benodigdheden: ['8 cones', '2 balls'],
      coachpunten: [
        'Look into the new box while you are sprinting: where is the ball, where is the space?',
        'Pass firmly along the ground and onto the right foot',
        'Curve your run to get free, so you receive on the half-turn',
      ],
      variaties: {
        makkelijker: ['Walk to the other box after passing', 'More players per box'],
        moeilijker: ['Two touches maximum', 'A defender in each box', 'The coach points to the box you go to'],
      },
    },
    tekening: {
      ...leeg(36, 16),
      objecten: [
        zone('zl', 8, 8, 14, 14),
        zone('zr', 28, 8, 14, 14),
        pion('l1', 1, 1),
        pion('l3', 1, 15),
        pion('r2', 35, 1),
        pion('r4', 35, 15),
        speler('a1', 1, 3, 4, { kijkrichting: 0 }),
        speler('a2', 2, 13, 4, { kijkrichting: 180 }),
        speler('a3', 3, 8, 12, { kijkrichting: -90 }),
        B('b1', 4, 33.5, 3.5, { kijkrichting: 180 }),
        B('b2', 5, 26, 4, { kijkrichting: 0 }),
        B('b3', 6, 30, 13, { kijkrichting: -90 }),
        bal('ba', 3.55, 4, 'a1'),
        bal('bb', 32.95, 3.5, 'b1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'a1', via: [[8, 0.8], [17, 0.8]], naar: [23, 8], manier: 'sprint', start: 0.35, tempo: 'gelijkmatig' }),
        stap({ type: 'pass', van: 'b1', naar: 'b2' }, { type: 'loop', wie: 'b1', via: [[34.5, 15.2], [18, 15.2]], naar: [4, 14], manier: 'sprint', start: 0.35, tempo: 'gelijkmatig' }),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }, { type: 'loop', wie: 'a2', via: [[16, 0.8], [28, 0.8]], naar: [31, 2.5], manier: 'sprint', start: 0.35, tempo: 'gelijkmatig' }),
        stap({ type: 'pass', van: 'b2', naar: 'b3' }, { type: 'loop', wie: 'b2', via: [[18, 6]], naar: [11, 5], manier: 'sprint', start: 0.35, tempo: 'gelijkmatig' }),
        stap({ type: 'pass', van: 'a3', naar: 'b1' }, { type: 'pass', van: 'b3', naar: 'a1', start: 0.2 }),
        pauze(0.8),
      ],
    },
  },

  // W3. Tunneltikkertje met bal (O7 en JO8–11)
  {
    id: 'veld-wu-tunneltikkertje',
    naam: 'Tunneltikkertje met bal',
    categorieen: ['warming-up', 'techniek'],
    uitleg:
      'Iedereen dribbelt met een bal door het vak. Eén kind met een hesje is de tikker en heeft geen bal. Ben je getikt, dan pak je je bal in je handen en ga je wijdbeens staan: je bent een tunnel. Een ander kind kan je bevrijden door zijn bal door je tunnel te spelen en hem aan de andere kant weer op te halen. Na een minuut is er een nieuwe tikker.',
    organisatie: 'Vak van 15 × 15 m met een hoedje op elke hoek. Iedereen een voetbal, de tikker een hesje. Rondes van 1 minuut; wie het langst vrij blijft, wint.',
    benodigdheden: ['4 hoedjes', '1 voetbal per kind', '1 hesje'],
    spelersNodig: 5,
    keepersNodig: 0,
    leeftijden: ['mini-5-7', 'jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Houd je bal dichtbij, dan kun je snel wegdraaien', 'Kijk op: waar is de tikker en wie moet bevrijd worden?', 'Speel zacht door de tunnel en loop er snel omheen'],
    variaties: {
      makkelijker: ['Groter vak', 'Bevrijden mag ook door de getikte aan te tikken'],
      moeilijker: ['Twee tikkers', 'Bevrijden alleen met je linkervoet', 'Kleiner vak'],
    },
    en: {
      naam: 'Tunnel tag with a ball',
      uitleg:
        'Everyone dribbles a ball around the area. One child in a bib is the tagger and has no ball. If you are tagged, pick up your ball and stand with your legs wide apart: you are a tunnel. Another child can free you by passing their ball through your tunnel and collecting it on the other side. After a minute there is a new tagger.',
      organisatie: '15 × 15 m area with a disc cone on each corner. A ball for everyone, a bib for the tagger. Rounds of 1 minute; whoever stays free the longest wins.',
      benodigdheden: ['4 disc cones', '1 ball per child', '1 bib'],
      coachpunten: ['Keep the ball close, so you can turn away quickly', 'Look up: where is the tagger and who needs freeing?', 'Pass gently through the tunnel and run round quickly'],
      variaties: {
        makkelijker: ['Bigger area', 'You may also free someone by tagging them'],
        moeilijker: ['Two taggers', 'Free someone with your left foot only', 'Smaller area'],
      },
    },
    tekening: {
      ...leeg(17, 17),
      objecten: [
        zone('z', 8.5, 8.5, 15, 15),
        hoedje('h1', 1, 1),
        hoedje('h2', 16, 1),
        hoedje('h3', 1, 16),
        hoedje('h4', 16, 16),
        speler('a1', 1, 4, 4, { kijkrichting: 0 }),
        speler('a2', 2, 12, 5, { kijkrichting: 90 }),
        speler('a3', 3, 5, 12, { kijkrichting: -45 }),
        speler('a4', 4, 13, 13, { kijkrichting: 180 }),
        C('c1', 5, 8.5, 9, { kijkrichting: -45 }),
        bal('b1', 4.55, 4, 'a1'),
        bal('b2', 12, 5.55, 'a2'),
        bal('b3', 5.4, 11.6, 'a3'),
        bal('b4', 12.45, 13, 'a4'),
      ],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'dribbel', wie: 'a1', via: [[6, 3]], naar: [8, 3.5], duur: 1.8 },
          { type: 'dribbel', wie: 'a2', via: [[13, 7]], naar: [12.5, 9], duur: 1.8 },
          { type: 'dribbel', wie: 'a3', via: [[4, 10]], naar: [3.5, 8], duur: 1.8 },
          { type: 'dribbel', wie: 'a4', via: [[11, 14]], naar: [9, 13.5], duur: 1.8 },
          { type: 'loop', wie: 'c1', naar: [10, 8.6], manier: 'sprint', duur: 1.8 },
        ),
        // De tikker tikt kind 2: dat staat stil als tunnel (bal in de handen).
        stap({ type: 'loop', wie: 'c1', naar: [11, 8.2], manier: 'sprint', duur: 0.6 }, { type: 'dribbel', wie: 'a1', naar: [10.5, 3.2], duur: 1 }, { type: 'dribbel', wie: 'a3', naar: [4, 6], duur: 1 }, { type: 'dribbel', wie: 'a4', naar: [7, 12.5], duur: 1 }),
        stap({ type: 'loop', wie: 'c1', naar: [8.4, 6], manier: 'sprint', duur: 1.4 }, { type: 'dribbel', wie: 'a1', naar: [12.5, 4.4], duur: 1.2 }),
        // Kind 1 speelt zijn bal door de tunnel en haalt hem aan de andere kant op.
        stap({ type: 'panna', wie: 'a1', door: 'a2', verder: 2.2 }, { type: 'dribbel', wie: 'a4', naar: [5, 14.5], duur: 1.4 }, { type: 'dribbel', wie: 'a3', naar: [3, 3.5], duur: 1.4 }),
        pauze(0.8),
      ],
    },
  },

  // W4. Handbalvoetbal
  {
    id: 'veld-wu-handbalvoetbal',
    naam: 'Handbalvoetbal',
    categorieen: ['warming-up', 'spelletjes'],
    uitleg:
      'Een partijtje met de handen: je gooit de bal naar elkaar en mag niet lopen met de bal in je handen. Scoren kan alleen met een kopbal of een volley uit een worp van een medespeler. Raakt de bal de grond of onderschept de tegenstander hem, dan is de bal voor de andere ploeg. Na een paar minuten speel je op hetzelfde veld gewoon voetbal.',
    organisatie: 'Veld van 24 × 18 m met op elke korte kant een klein doel. Twee ploegen van 3 tot 5. 4 minuten handbalvoetbal, daarna 4 minuten voetbal.',
    benodigdheden: ['2 kleine doelen', '4 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 6,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Vrijlopen in de ruimte, niet naar de bal toe', 'Gooi de bal vóór je medespeler, zodat hij in de loop kan koppen', 'Koppen met je voorhoofd, ogen open en de bal naar beneden'],
    variaties: {
      makkelijker: ['Ook scoren door te gooien', 'Twee keer stuiten mag'],
      moeilijker: ['Maximaal drie seconden de bal vasthouden', 'Alleen scoren met een kopbal'],
    },
    en: {
      naam: 'Handball football',
      uitleg:
        'A small-sided game with your hands: throw the ball to each other, and you may not run while holding it. You can only score with a header or a volley from a teammate’s throw. If the ball hits the ground or the other team intercepts it, the ball goes to the other team. After a few minutes, play normal football on the same pitch.',
      organisatie: '24 × 18 m pitch with a small goal at each short end. Two teams of 3 to 5. 4 minutes of handball football, then 4 minutes of football.',
      benodigdheden: ['2 small goals', '4 cones', 'Balls', 'Bibs'],
      coachpunten: ['Move into space, not towards the ball', 'Throw the ball in front of your teammate so they can head it on the move', 'Head with your forehead, eyes open, and direct the ball downwards'],
      variaties: {
        makkelijker: ['You may also score by throwing', 'Two bounces allowed'],
        moeilijker: ['Hold the ball for three seconds at most', 'Headers only'],
      },
    },
    tekening: draai(
      {
        ...leeg(20, 26),
        objecten: [
          zone('z', 10, 13, 18, 24),
          doeltje('g1', 10, 1, 0),
          doeltje('g2', 10, 25, 180),
          speler('a1', 1, 7, 21, { kijkrichting: -90 }),
          speler('a2', 2, 14, 15, { kijkrichting: -110 }),
          speler('a3', 3, 8, 9, { kijkrichting: -60 }),
          B('b1', 4, 11, 12, { kijkrichting: 90 }),
          B('b2', 5, 5, 6, { kijkrichting: 60 }),
          B('b3', 6, 15, 7, { kijkrichting: 120 }),
          bal('bal', 7, 20.45, 'a1'),
        ],
        animatie: [
          pauze(0.5),
          stap({ type: 'pass', van: 'a1', naar: 'a2', worp: 'bovenhands', hoogte: 'halfhoog', eindHoogte: 1.3 }, { type: 'loop', wie: 'a3', naar: [6.8, 7], start: 0.2 }, { type: 'loop', wie: 'b1', naar: [10.8, 13.8], start: 0.3 }),
          stap({ type: 'loop', wie: 'a2', naar: [13.5, 11], duur: 0.8 }, { type: 'loop', wie: 'b3', naar: [15.5, 8.5], duur: 0.8 }, { type: 'loop', wie: 'b2', naar: [4, 3.8], duur: 0.8 }),
          stap({ type: 'pass', van: 'a2', naar: 'a3', worp: 'bovenhands', hoogte: 'halfhoog', eindHoogte: 1.85 }, { type: 'loop', wie: 'a3', naar: [8, 4.2], start: 0.1, manier: 'sprint' }),
          stap({ type: 'schot', van: 'a3', naar: [9.2, 0.6], direct: true, hoogte: 'laag', eindHoogte: 0.3 }),
          pauze(1),
        ],
      },
      [10, 13],
      -90,
    ),
  },

  // W5. Twee rijen: loopvormen met een pass
  {
    id: 'veld-wu-rijen-loopvormen-pass',
    naam: 'Twee rijen: loopvormen met een pass',
    categorieen: ['warming-up', 'loopcoordinatie'],
    uitleg:
      'Twee rijen staan tegenover elkaar. De voorste van de linkerrij loopt naar het midden met een loopvorm: knieheffen, hakken-billen of zijwaarts. In het midden speelt de voorste van de rechterrij hem de bal toe; hij kaatst in één keer terug en loopt door naar het eind van de rechterrij. Daarna is de volgende aan de beurt, met een andere loopvorm.',
    organisatie: 'Twee rijen op 20 m van elkaar, met een pion in het midden. De rechterrij heeft één bal. Elke ronde een andere loopvorm; na 4 rondes wisselen de rijen van rol.',
    benodigdheden: ['3 pionnen', '1 bal'],
    spelersNodig: 6,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Loopvorm netjes: rechtop, armen mee', 'Voor de pass even kleine pasjes en klaarstaan', 'Kaats met de binnenkant terug in de voeten'],
    variaties: {
      makkelijker: ['Bal aannemen en dan terugspelen', 'Kortere afstand'],
      moeilijker: ['Na het kaatsen een sprint naar de rij', 'Kaatsen met je andere voet', 'De bal komt halfhoog: terugspelen met de wreef of het hoofd'],
    },
    en: {
      naam: 'Two lines: running drills with a pass',
      uitleg:
        'Two lines face each other. The front player of the left line goes to the middle using a running drill: high knees, heel flicks or side steps. In the middle, the front player of the right line passes them the ball; they play it straight back first time and carry on to the back of the right line. Then it is the next player’s turn, with a different running drill.',
      organisatie: 'Two lines 20 m apart, with a cone in the middle. The right line has one ball. A different running drill each round; after 4 rounds the lines swap roles.',
      benodigdheden: ['3 cones', '1 ball'],
      coachpunten: ['Neat running form: upright, arms working', 'Before the pass, short steps and get set', 'Play it back with the inside of the foot, to feet'],
      variaties: {
        makkelijker: ['Control the ball, then play it back', 'Shorter distance'],
        moeilijker: ['After the pass, sprint to the line', 'Play it back with your other foot', 'The ball comes at half height: play it back with your instep or head'],
      },
    },
    tekening: {
      ...leeg(26, 8),
      rijen: [
        { id: 'rL', x: 3, y: 3.2, richting: 180, spelers: ['a1', 'a2', 'a3'] },
        { id: 'rR', x: 23, y: 4.8, richting: 0, spelers: ['b1', 'b2', 'b3'] },
      ],
      objecten: [
        pion('pL', 3, 2),
        pion('pM', 13, 2.6),
        pion('pR', 23, 6),
        speler('a1', 1, 0, 0),
        speler('a2', 2, 0, 0),
        speler('a3', 3, 0, 0),
        speler('b1', 4, 0, 0),
        speler('b2', 5, 0, 0),
        speler('b3', 6, 0, 0),
        bal('bal', 0, 0, 'b1'),
      ],
      animatie: [
        pauze(0.5),
        {
          herhaal: {
            spelers: ['a1', 'a2', 'a3'],
            waarden: { manier: ['kniehef', 'hakbil', 'zijwaarts'] },
            stappen: [
              stap({ type: 'loop', wie: '@', naar: [12, 3.6], manier: '@manier' }),
              stap({ type: 'pass', van: 'b1', naar: '@' }),
              stap({ type: 'pass', van: '@', naar: 'b1', direct: true }),
              stap({ type: 'aansluiten', wie: '@', rij: 'rR' }),
            ],
          },
        },
        pauze(0.6),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
