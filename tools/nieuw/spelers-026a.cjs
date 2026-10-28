// Spelersoefeningen 0.26.0, deel A2 (1–6). Draaien: node tools/nieuw/spelers-026a.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, speler, bal, pion, pop, pauze, stap } = require('./bouwstenen.cjs');

const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const zone = (id, x, y, breedte, lengte, kleur) => ({ id, soort: 'zone', x, y, breedte, lengte, ...(kleur ? { kleur } : {}) });

const oefeningen = [
  // 1. Vierhoek met een verdediger erbij
  {
    id: 'veld-wu-vierhoek-verdediger',
    naam: 'Vierhoek met een verdediger erbij',
    categorieen: ['warming-up', 'pass-en-trap'],
    uitleg:
      'Vier spelers staan op de hoeken van een vierhoek en spelen de bal langs de zijden rond. In het midden staat een verdediger die steeds meer doet: eerst loopt hij alleen mee (passief), dan zet hij half druk en houdt hij afstand, en tot slot zet hij volle druk. Zo gaat de warming-up vanzelf over in passen onder druk.',
    organisatie: 'Vierhoek van 12 × 12 m met een pion op elke hoek. Vier spelers op de hoeken, één verdediger met een hesje in het midden. Elke fase ± 1 minuut; daarna een nieuwe verdediger.',
    benodigdheden: ['4 pionnen', '1 bal', '1 hesje'],
    spelersNodig: 5,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: een tweede vierhoek ernaast, of wissel na elke fase een buitenspeler met een wachtende speler.',
    coachpunten: [
      'Aannemen met de voet die het verst van de bal is, in de richting van de volgende hoek',
      'Pass langs de buitenkant van de vierhoek, weg van de verdediger',
      'Bij volle druk: twee aanrakingen, de tweede meteen weg',
    ],
    variaties: {
      makkelijker: ['Grotere vierhoek (15 m)', 'Verdediger blijft langer passief'],
      moeilijker: ['Na de volle druk: één aanraking', 'Een tweede verdediger erbij', 'Verovert de verdediger de bal, dan ruilt hij met de speler die hem verloor'],
    },
    en: {
      naam: 'Passing square with a defender',
      uitleg:
        'Four players stand on the corners of a square and pass the ball round the sides. A defender in the middle does more and more: first they just jog along (passive), then they put on half pressure and keep their distance, and finally they press at full speed. That way the warm-up turns naturally into passing under pressure.',
      organisatie: '12 × 12 m square with a cone on each corner. Four players on the corners, one defender in a bib in the middle. Each phase about 1 minute; then a new defender.',
      benodigdheden: ['4 cones', '1 ball', '1 bib'],
      meerSpelers: 'With more players: a second square next to it, or swap an outside player with a waiting player after each phase.',
      coachpunten: [
        'Receive with your back foot, in the direction of the next corner',
        'Pass along the outside of the square, away from the defender',
        'Under full pressure: two touches, the second one gets rid of it',
      ],
      variaties: {
        makkelijker: ['Bigger square (15 m)', 'The defender stays passive for longer'],
        moeilijker: ['After the full-pressure phase: one touch', 'Add a second defender', 'If the defender wins the ball, they swap with the player who lost it'],
      },
    },
    tekening: {
      veld: { type: 'leeg', breedte: 18, lengte: 18 },
      camera: 'schuin',
      objecten: [
        zone('z1', 9, 9, 12, 12),
        pion('p1', 3, 3),
        pion('p2', 15, 3),
        pion('p3', 3, 15),
        pion('p4', 15, 15),
        speler('a1', 1, 4.2, 4.2, { kijkrichting: 45 }),
        speler('a2', 2, 13.8, 4.2, { kijkrichting: 135 }),
        speler('a3', 3, 4.2, 13.8, { kijkrichting: -45 }),
        speler('a4', 4, 13.8, 13.8, { kijkrichting: -135 }),
        B('d1', 5, 9, 9),
        bal('bal', 4.6, 4.6, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        // Passief: de verdediger loopt alleen mee.
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'd1', naar: [10, 7.6], start: 0.3 }),
        stap({ type: 'pass', van: 'a2', naar: 'a4' }, { type: 'loop', wie: 'd1', naar: [10.6, 9.6], start: 0.3 }),
        // Half: druk zetten maar afstand houden.
        stap({ type: 'pass', van: 'a4', naar: 'a3' }, { type: 'druk', wie: 'd1', op: 'a3', afstand: 3.2, start: 0.5 }),
        stap({ type: 'pass', van: 'a3', naar: 'a1' }, { type: 'druk', wie: 'd1', op: 'a1', afstand: 3.2, start: 0.5 }),
        // Vol: sprinten en dicht op de balbezitter.
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'druk', wie: 'd1', op: 'a2', afstand: 1.7, manier: 'sprint', start: 0.5 }),
        stap({ type: 'pass', van: 'a2', naar: 'a4' }, { type: 'druk', wie: 'd1', op: 'a4', afstand: 1.7, manier: 'sprint', start: 0.55 }),
        stap({ type: 'pass', van: 'a4', naar: 'a3' }, { type: 'druk', wie: 'd1', op: 'a3', afstand: 1.7, manier: 'sprint', start: 0.55 }),
        pauze(0.8),
      ],
    },
  },

  // 2. Aannemen onder druk
  {
    id: 'veld-tq-aannemen-onder-druk',
    naam: 'Aannemen onder druk',
    categorieen: ['techniek', 'pass-en-trap'],
    uitleg:
      'De aangever speelt de bal in op de ontvanger. Tegelijk komt een verdediger van opzij op hem af. De ontvanger neemt de bal met zijn eerste aanraking mee weg van de druk en speelt hem door het poortje aan die kant naar een medespeler. Daarna komt de verdediger van de andere kant en draait de ontvanger de andere kant op.',
    organisatie:
      'Aangever met ballen op 10 m voor de ontvanger. Achter de ontvanger twee poortjes van 4 m (links en rechts) met daarachter een medespeler. Verdediger begint 6 m opzij van de ontvanger. Na een paar ballen doordraaien.',
    benodigdheden: ['4 pionnen', 'Ballen', '1 hesje'],
    spelersNodig: 5,
    keepersNodig: 0,
    doorwisselbaar: true,
    coachpunten: [
      'Vóór de bal komt: kijk waar de verdediger vandaan komt',
      'Eerste aanraking weg van de druk, met de voet die het verst van de verdediger is',
      'Na de aanname meteen opkijken en doorspelen',
    ],
    variaties: {
      makkelijker: ['Verdediger start verder weg', 'Bredere poortjes'],
      moeilijker: ['Verdediger mag kiezen van welke kant hij komt', 'Doorspelen in maximaal twee aanrakingen', 'De pass komt door de lucht'],
    },
    en: {
      naam: 'Receiving under pressure',
      uitleg:
        'The server plays the ball in to the receiver. At the same time a defender closes them down from the side. The receiver takes their first touch away from the pressure and plays the ball through the gate on that side to a teammate. Then the defender comes from the other side and the receiver turns the other way.',
      organisatie:
        'Server with balls 10 m in front of the receiver. Behind the receiver, two 4 m gates (left and right) with a teammate beyond each. The defender starts 6 m to the side of the receiver. Rotate after a few balls.',
      benodigdheden: ['4 cones', 'Balls', '1 bib'],
      coachpunten: [
        'Before the ball arrives: check where the defender is coming from',
        'First touch away from the pressure, with the foot furthest from the defender',
        'Look up straight after the first touch and play it on',
      ],
      variaties: {
        makkelijker: ['The defender starts further away', 'Wider gates'],
        moeilijker: ['The defender chooses which side to come from', 'Play it on in two touches maximum', 'The pass comes in the air'],
      },
    },
    tekening: {
      veld: { type: 'leeg', breedte: 20, lengte: 24 },
      camera: 'schuin',
      objecten: [
        pion('g1', 2.5, 5),
        pion('g2', 6.5, 5),
        pion('g3', 13.5, 5),
        pion('g4', 17.5, 5),
        speler('p', 1, 10, 21, { kijkrichting: -90 }),
        speler('r', 2, 10, 11, { kijkrichting: 90 }),
        speler('t1', 3, 4, 1.6, { kijkrichting: 90 }),
        speler('t2', 4, 16, 1.6, { kijkrichting: 90 }),
        B('d', 5, 16.5, 14, { kijkrichting: 180 }),
        bal('b1', 10, 20.6, 'p'),
        bal('b2', 11, 21.8),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'p', naar: 'r' }, { type: 'druk', wie: 'd', op: 'r', afstand: 1.7, manier: 'sprint', start: 0.25 }),
        stap({ type: 'dribbel', wie: 'r', naar: [7.6, 9.4] }),
        stap({ type: 'pass', van: 'r', naar: 't1' }),
        stap({ type: 'loop', wie: 'd', via: [[9.5, 16.5]], naar: [3.5, 14], start: 0.2 }, { type: 'loop', wie: 'r', naar: [10, 11], start: 0.2 }, { type: 'pak', wie: 'p', bal: 'b2', start: 0.4 }),
        stap({ type: 'pass', van: 'p', naar: 'r', bal: 'b2' }, { type: 'druk', wie: 'd', op: 'r', afstand: 1.7, manier: 'sprint', start: 0.25 }),
        stap({ type: 'dribbel', wie: 'r', naar: [12.4, 9.4] }),
        stap({ type: 'pass', van: 'r', naar: 't2' }),
        pauze(0.8),
      ],
    },
  },

  // 3. Gerichte aanname naar voren
  {
    id: 'veld-tq-gerichte-aanname-voren',
    naam: 'Gerichte aanname naar voren',
    categorieen: ['techniek', 'pass-en-trap'],
    uitleg:
      'De verdediger speelt de middenvelder in, die met zijn rug naar het doel staat en een tegenstander (pop) in zijn rug heeft. De middenvelder neemt de bal aan op het open been en draait met die eerste aanraking naar voren, weg van de pop. Daarna speelt hij meteen de spits in, die afrondt.',
    organisatie:
      'Op een half veld. Verdediger met ballen op 44 m van het doel, middenvelder op 32 m met een pop schuin achter zich, spits op 22 m. Keeper in het doel. Na elke actie doordraaien: verdediger → middenvelder → spits → verdediger.',
    benodigdheden: ['Goal', '1 pop', 'Ballen'],
    spelersNodig: 3,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Vóór de aanname over je schouder kijken: waar staat de pop, waar is de spits?',
      'Half gedraaid staan en aannemen met het achterste been',
      'De eerste aanraking gaat al naar voren: geen extra tikje nodig',
    ],
    variaties: {
      makkelijker: ['Zonder pop', 'Eerst aannemen, dan draaien'],
      moeilijker: ['Een echte tegenstander in plaats van de pop', 'Spits in één keer aanspelen na de draai', 'Pass van de verdediger door de lucht'],
    },
    en: {
      naam: 'Directional first touch forwards',
      uitleg:
        'The defender plays the ball into the midfielder, who has their back to goal and an opponent (mannequin) behind them. The midfielder receives on the open side and turns forwards with that first touch, away from the mannequin. Then they play straight into the striker, who finishes.',
      organisatie:
        'On half a pitch. Defender with balls 44 m from goal, midfielder at 32 m with a mannequin diagonally behind them, striker at 22 m. Keeper in goal. Rotate after each go: defender → midfielder → striker → defender.',
      benodigdheden: ['Goal', '1 mannequin', 'Balls'],
      coachpunten: [
        'Check over your shoulder before receiving: where is the mannequin, where is the striker?',
        'Stand half-turned and receive on your back foot',
        'Your first touch already goes forwards: no extra touch needed',
      ],
      variaties: {
        makkelijker: ['No mannequin', 'Control first, then turn'],
        moeilijker: ['A real opponent instead of the mannequin', 'Play the striker in first time after the turn', 'The defender’s pass comes in the air'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 18, y: -3, breedte: 32, lengte: 50 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        pop('pop', 32.4, 29.2),
        speler('c', 4, 30, 44, { kijkrichting: -80 }),
        speler('m', 8, 34, 32, { kijkrichting: 100 }),
        speler('s', 9, 40, 22, { kijkrichting: 120 }),
        bal('b1', 30.1, 43.45, 'c'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'c', naar: 'm' }),
        stap({ type: 'dribbel', wie: 'm', naar: [35.8, 29.8] }),
        stap({ type: 'pass', van: 'm', naar: 's' }),
        stap({ type: 'dribbel', wie: 's', naar: [38.6, 15.4] }),
        stap({ type: 'schot', van: 's', naar: [31.2, -0.3], afloop: 'goal' }),
        pauze(1.0),
      ],
    },
  },

  // 4. Y-vorm met varianten
  {
    id: 'veld-pt-y-vorm-varianten',
    naam: 'Y-vorm met varianten',
    categorieen: ['pass-en-trap'],
    uitleg:
      'De Y-vorm, drie keer met een andere afloop. Variant 1, overlap: de starter speelt de kaatser in, krijgt de bal terug, speelt naar links en loopt buitenom de linkerspeler, die hem in zijn loop terugspeelt. Variant 2, derde man: de kaatser legt de bal meteen opzij naar links, de starter sprint langs de kaatser de diepte in en krijgt de bal als derde man. Variant 3, lange bal: kaats terug en dan meteen een lange bal naar de eindspeler. Elke variant eindigt bij de eindspeler bovenin de Y.',
    organisatie:
      'Starters met ballen onderaan de Y (34 m), kaatser op 24 m, links en rechts een speler op 16 m (6 m opzij), eindspeler bovenin op 4 m. Pionnen bij de kaatser en de spelers links en rechts. Na elke actie schuift iedereen een plek door.',
    benodigdheden: ['3 pionnen', 'Ballen'],
    spelersNodig: 7,
    keepersNodig: 0,
    doorwisselbaar: true,
    coachpunten: [
      'Kaatser: eerst van de pion weg, dan kort komen en in één keer spelen',
      'Overlap en derde man: pas starten als de bal onderweg is, dan vol versnellen',
      'Lange bal: standbeen naast de bal, door de bal heen trappen en de eindspeler op de borst of voet zoeken',
    ],
    variaties: {
      makkelijker: ['Elke variant apart oefenen, een paar keer achter elkaar', 'Twee aanrakingen per speler'],
      moeilijker: ['Alles in één keer', 'De trainer roept pas tijdens de eerste pass welke variant', 'Rechts in plaats van links, of om en om'],
    },
    en: {
      naam: 'Y-shape with variations',
      uitleg:
        'The Y-shape, three times with a different finish. Variation 1, overlap: the starter passes into the lay-off player, gets it back, plays to the left and runs round the outside of the left-hand player, who plays it back into their path. Variation 2, third man: the lay-off player knocks it straight out to the left, the starter sprints past the lay-off player in behind and gets the ball as the third man. Variation 3, long ball: lay-off back and then a long ball straight to the end player. Every variation ends with the end player at the top of the Y.',
      organisatie:
        'Starters with balls at the bottom of the Y (34 m), lay-off player at 24 m, a player left and right at 16 m (6 m to the side), end player at the top at 4 m. Cones by the lay-off player and the left and right players. After each go, everyone moves on one spot.',
      benodigdheden: ['3 cones', 'Balls'],
      coachpunten: [
        'Lay-off player: move away from the cone first, then come short and play it first time',
        'Overlap and third man: only go once the ball is travelling, then accelerate flat out',
        'Long ball: standing foot next to the ball, strike through it and aim for the end player’s chest or feet',
      ],
      variaties: {
        makkelijker: ['Practise each variation separately a few times in a row', 'Two touches per player'],
        moeilijker: ['Everything one-touch', 'The coach only calls the variation during the first pass', 'Right instead of left, or alternate'],
      },
    },
    tekening: {
      veld: { type: 'leeg', breedte: 24, lengte: 38 },
      camera: 'schuin',
      objecten: [
        pion('pb', 12, 23.2),
        pion('pc', 5.2, 15.2),
        pion('pd', 18.8, 15.2),
        speler('a1', 1, 12, 32, { kijkrichting: -90 }),
        speler('a2', 2, 12, 34.2, { kijkrichting: -90 }),
        speler('a3', 3, 12, 36.4, { kijkrichting: -90 }),
        speler('b', 4, 12, 24.2, { kijkrichting: 90 }),
        speler('c', 5, 6, 16, { kijkrichting: 60 }),
        speler('d', 6, 18, 16, { kijkrichting: 120 }),
        speler('e', 7, 12, 4.5, { kijkrichting: 90 }),
        bal('b1', 12, 31.45, 'a1'),
        bal('b2', 13.1, 34.4),
        bal('b3', 13.1, 36.6),
      ],
      animatie: [
        pauze(0.6),
        // Variant 1: overlap.
        stap({ type: 'pass', van: 'a1', naar: 'b' }),
        stap({ type: 'pass', van: 'b', naar: 'a1', direct: true }),
        stap({ type: 'pass', van: 'a1', naar: 'c' }),
        stap({
          type: 'loop',
          wie: 'a1',
          via: [
            [8.5, 19.5],
            [2.6, 17.5],
          ],
          naar: [3.2, 11],
          manier: 'sprint',
        }),
        stap({ type: 'pass', van: 'c', naar: 'a1' }),
        stap({ type: 'pass', van: 'a1', naar: 'e' }, { type: 'pak', wie: 'a2', bal: 'b2', start: 0.3 }),
        stap({ type: 'pass', van: 'e', naar: [17.5, 2.5] }, { type: 'loop', wie: 'a1', naar: [1.8, 6.5], start: 0.2 }, { type: 'dribbel', wie: 'a2', naar: [12, 32] }),
        // Variant 2: derde man.
        stap({ type: 'pass', van: 'a2', naar: 'b' }),
        stap({ type: 'pass', van: 'b', naar: 'c', direct: true }, { type: 'loop', wie: 'a2', via: [[15, 27]], naar: [12.6, 17], manier: 'sprint', start: 0.1 }),
        stap({ type: 'pass', van: 'c', naar: 'a2' }),
        stap({ type: 'pass', van: 'a2', naar: 'e' }, { type: 'pak', wie: 'a3', bal: 'b3', start: 0.3 }),
        stap({ type: 'pass', van: 'e', naar: [6.5, 2.5] }, { type: 'loop', wie: 'a2', naar: [21, 10], start: 0.2 }, { type: 'dribbel', wie: 'a3', naar: [12, 32] }),
        // Variant 3: lange bal.
        stap({ type: 'pass', van: 'a3', naar: 'b' }),
        stap({ type: 'pass', van: 'b', naar: 'a3', direct: true }),
        stap({ type: 'pass', van: 'a3', naar: 'e', hoogte: 'hoog', eindHoogte: 1.2 }),
        pauze(1.0),
      ],
    },
  },

  // 5. Pentagon passen en kiezen
  {
    id: 'veld-wu-pentagon-kiezen',
    naam: 'Pentagon: passen en kiezen',
    categorieen: ['warming-up', 'pass-en-trap'],
    uitleg:
      'Vijf pionnen in een vijfhoek, met twee ballen tegelijk in het spel. Je speelt de bal naar een speler bij een andere pion en kiest daarna zelf naar welke pion je loopt: je sluit daar achteraan aan. Loop altijd buitenom, zodat je niet door de passlijnen gaat. Omdat er twee ballen rondgaan, moet je steeds kijken waar de andere bal is.',
    organisatie: 'Vijfhoek met een pion op elke hoek, ± 13 m tussen de pionnen. Bij twee pionnen staan twee spelers (daar beginnen de ballen), bij de andere één. Minstens 7 spelers.',
    benodigdheden: ['5 pionnen', '2 ballen'],
    spelersNodig: 7,
    keepersNodig: 0,
    doorwisselbaar: true,
    coachpunten: [
      'Vóór je de bal krijgt al kijken: naar wie speel je, en waar is de andere bal?',
      'Pass op de voet waar je medespeler mee wil aannemen',
      'Na je pass meteen kiezen en vertrekken, buitenom',
    ],
    variaties: {
      makkelijker: ['Eén bal', 'Altijd naar de pion waar je naartoe speelde'],
      moeilijker: ['In twee aanrakingen', 'Een derde bal erbij', 'Na de pass sprinten in plaats van joggen'],
    },
    en: {
      naam: 'Pentagon: pass and choose',
      uitleg:
        'Five cones in a pentagon, with two balls in play at the same time. You pass to a player at another cone and then choose for yourself which cone to run to: you join the back of the queue there. Always run round the outside so you don’t cut through the passing lanes. Because two balls are going round, you have to keep checking where the other ball is.',
      organisatie: 'Pentagon with a cone on each corner, about 13 m between the cones. Two players at two of the cones (where the balls start), one at each of the others. At least 7 players.',
      benodigdheden: ['5 cones', '2 balls'],
      coachpunten: [
        'Look before you receive: who will you pass to, and where is the other ball?',
        'Pass to the foot your teammate wants to receive on',
        'Choose and go straight after your pass, round the outside',
      ],
      variaties: {
        makkelijker: ['One ball', 'Always run to the cone you passed to'],
        moeilijker: ['Two touches', 'Add a third ball', 'Sprint after your pass instead of jogging'],
      },
    },
    tekening: {
      veld: { type: 'leeg', breedte: 24, lengte: 24 },
      camera: 'schuin',
      objecten: [
        pion('c1', 12, 19),
        pion('c2', 5.34, 14.16),
        pion('c3', 7.89, 6.34),
        pion('c4', 16.11, 6.34),
        pion('c5', 18.66, 14.16),
        speler('p1', 1, 12, 20.2, { kijkrichting: -90 }),
        speler('q1', 6, 12, 22.2, { kijkrichting: -90 }),
        speler('p2', 2, 4.2, 14.53, { kijkrichting: -18 }),
        speler('q2', 7, 2.3, 15.15, { kijkrichting: -18 }),
        speler('p3', 3, 7.18, 5.37, { kijkrichting: 54 }),
        speler('p4', 4, 16.82, 5.37, { kijkrichting: 126 }),
        speler('p5', 5, 19.8, 14.53, { kijkrichting: 198 }),
        bal('ba', 12, 19.65, 'p1'),
        bal('bb', 4.72, 14.36, 'p2'),
      ],
      animatie: [
        pauze(0.6),
        stap(
          { type: 'pass', van: 'p1', naar: 'p3' },
          { type: 'pass', van: 'p2', naar: 'p4', start: 0.15 },
          { type: 'loop', wie: 'p1', via: [[18.17, 20.49]], naar: [21.7, 15.15], start: 0.3 },
          { type: 'loop', wie: 'p2', via: [[2.01, 8.76]], naar: [6.0, 3.75], start: 0.35 },
          { type: 'loop', wie: 'q1', naar: [12, 20.2], start: 0.7 },
          { type: 'loop', wie: 'q2', naar: [4.2, 14.53], start: 0.8 },
        ),
        stap(
          { type: 'pass', van: 'p3', naar: 'q1' },
          { type: 'pass', van: 'p4', naar: 'p5', start: 0.15 },
          { type: 'loop', wie: 'p3', via: [[2.01, 8.76]], naar: [2.3, 15.15], start: 0.3 },
          { type: 'loop', wie: 'p4', via: [[12, 1.5]], naar: [6.0, 3.75], start: 1.0 },
          { type: 'loop', wie: 'p2', naar: [7.18, 5.37], start: 1.0 },
        ),
        stap({ type: 'pass', van: 'q1', naar: 'q2' }, { type: 'pass', van: 'p5', naar: 'p2', start: 0.15 }),
        pauze(0.8),
      ],
    },
  },

  // 6. Vrijlopen uit de rug van de verdediger
  {
    id: 'veld-tq-vrijlopen-rug-verdediger',
    naam: 'Vrijlopen uit de rug van de verdediger',
    categorieen: ['techniek', 'positiespel'],
    uitleg:
      'De middenvelder staat in de rug van een verdediger, waar de centrale verdediger hem niet kan aanspelen. Hij maakt zich vrij door opzij uit de rug van de verdediger te stappen, op het moment dat de centrale verdediger opkijkt. Hij krijgt de bal, draait open naar voren en speelt de spits diep, die met een loopactie in de ruimte achter de laatste lijn komt en afrondt.',
    organisatie:
      'Op een half veld. Centrale verdediger met ballen op 44 m van het doel, verdediger (hesje) op 33 m, middenvelder vlak achter hem, spits schuin rechts op 22 m. Keeper in het doel. Na elke actie doordraaien.',
    benodigdheden: ['Goal', 'Ballen', '1 hesje'],
    spelersNodig: 4,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Vrijlopen op het juiste moment: als de passer opkijkt, niet eerder',
      'Uit de rug van de verdediger naar de kant waar hij je niet ziet',
      'Openingdraaien met de eerste aanraking en meteen diep kijken',
    ],
    variaties: {
      makkelijker: ['Verdediger blijft staan', 'Spits staat al vrij'],
      moeilijker: ['Verdediger mag volgen en druk zetten', 'Diepe bal in één keer na de draai', 'Een tweede verdediger bij de spits'],
    },
    en: {
      naam: 'Getting free from behind the defender',
      uitleg:
        'The midfielder stands behind a defender, where the centre-back can’t pass to them. They get free by stepping out to the side from behind the defender, at the moment the centre-back looks up. They receive the ball, open up to face forwards and play the striker in behind, who makes a run into the space behind the last line and finishes.',
      organisatie:
        'On half a pitch. Centre-back with balls 44 m from goal, defender (bib) at 33 m, midfielder right behind them, striker diagonally to the right at 22 m. Keeper in goal. Rotate after each go.',
      benodigdheden: ['Goal', 'Balls', '1 bib'],
      coachpunten: [
        'Get free at the right moment: when the passer looks up, not before',
        'Step out from behind the defender to the side where they can’t see you',
        'Open up with your first touch and look in behind straight away',
      ],
      variaties: {
        makkelijker: ['The defender stands still', 'The striker is already free'],
        moeilijker: ['The defender may follow and press', 'Through ball first time after the turn', 'A second defender on the striker'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 18, y: -3, breedte: 32, lengte: 50 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        speler('c', 4, 34, 44, { kijkrichting: -90 }),
        B('d', 6, 34, 33.2, { kijkrichting: 90 }),
        speler('m', 8, 34, 30.6, { kijkrichting: 90 }),
        speler('s', 9, 41, 22, { kijkrichting: -110 }),
        bal('b1', 34, 43.45, 'c'),
      ],
      animatie: [
        pauze(0.8),
        stap({ type: 'loop', wie: 'm', naar: [29.6, 33.6], manier: 'sprint' }, { type: 'loop', wie: 'd', naar: [32.4, 33.4], start: 0.5 }),
        stap({ type: 'pass', van: 'c', naar: 'm' }),
        stap({ type: 'dribbel', wie: 'm', naar: [29.2, 31.2] }, { type: 'loop', wie: 's', naar: [39.6, 18.6], start: 0.3 }),
        stap({ type: 'pass', van: 'm', naar: [36.4, 11.4] }, { type: 'loop', wie: 's', naar: [36.6, 12.0], manier: 'sprint', start: 0.05 }),
        stap({ type: 'dribbel', wie: 's', naar: [35.4, 8.4] }),
        stap({ type: 'schot', van: 's', naar: [31.4, -0.3], afloop: 'goal' }),
        pauze(1.0),
      ],
    },
  },
];

zet('veld', oefeningen);
