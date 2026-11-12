// 0.34.1: nieuwe oefeningen voor de mini's O7 (±6–7 jaar): echte techniek en duels, met een keuze, een wedstrijdje en weinig wachten.
// Ideeën 1, 2, 4–9 en 12 van de gebruiker plus drie eigen. Draaien: node tools/nieuw/mini-0341-o7.cjs
const { zet } = require('./hulp.cjs');
const { pop } = require('./bouwstenen.cjs');
const { draaiKwart, KLEUREN: K, mini, zone, B, kaatsbord, miniGoal, eGoal, pionGroot, leeg, kinderen, rondje, allen, plek, trainer, speler, bal, hoedje, stap } = require('./mini-hulp.cjs');

const O7 = ['mini-5-7'];
const o7 = (o) => mini({ leeftijden: O7, ...o });
const net = (id, doel, x, y) => ({ id, soort: 'doelnet', x, y, breedte: 5, hoogte: 2, doel });

const oefeningen = [
  // Idee 1: dribbelbaan met vier acties
  o7({
    id: 'veld-o7-vier-acties',
    naam: 'Baan met vier acties',
    categorieen: ['techniek'],
    uitleg:
      'Elke pion heeft zijn eigen truc. Bij pion 1 kap je met de binnenkant, bij pion 2 neem je de bal mee met de buitenkant, bij pion 3 trek je hem terug met je zool en bij pion 4 maak je een schaar. Daarna: vol gas door het poortje! Welke baan is het snelst?',
    organisatie:
      'Twee banen van 15 m naast elkaar, 5 m uit elkaar (veld 11 × 17 m). Per baan 4 grote pionnen om de 3 m en aan het eind een poortje van 2 hoedjes (2 m breed). Station van 15 minuten voor 5 kinderen, elk met een bal: 2 of 3 per baan. Je start als je voorganger bij pion 3 is, dus er wacht hooguit één kind per baan. De trainer roept "start!" en telt per baan hoe vaak er iemand door het poortje komt: welke baan heeft er na 2 minuten de meeste? Daarna wisselen de kinderen van baan.',
    benodigdheden: ['8 grote pionnen', '4 hoedjes', '1 voetbal per kind'],
    spelersNodig: 2,
    coachpunten: ['Kleine tikjes vlak voor de pion', 'Na je truc: versnellen!', 'Kijk even op: waar is het poortje?'],
    variaties: {
      makkelijker: ['Bij elke pion dezelfde truc (kap met de binnenkant)', 'Pionnen verder uit elkaar en eerst wandelen'],
      moeilijker: [
        'Alles met je zwakke voet',
        'De trainer roept bij de start welke truc je bij elke pion doet',
        'Na het poortje staat een verdediger: speel 1 tegen 1 naar de lijn',
      ],
    },
    en: {
      naam: 'Four-move lane',
      uitleg:
        'Every cone has its own trick. At cone 1 you chop with the inside of your foot, at cone 2 you take the ball with the outside, at cone 3 you drag it back with your sole and at cone 4 you do a step-over. Then: full speed through the gate! Which lane is fastest?',
      organisatie:
        'Two 15 m lanes side by side, 5 m apart (11 × 17 m area). In each lane 4 big cones every 3 m and at the end a gate of 2 disc cones (2 m wide). 15-minute station for 5 children, each with a ball: 2 or 3 per lane. You go when the child in front of you reaches cone 3, so at most one child waits per lane. The coach calls "go!" and counts how often someone comes through the gate in each lane: which lane has the most after 2 minutes? Then the children swap lanes.',
      benodigdheden: ['8 big cones', '4 disc cones', '1 football per child'],
      coachpunten: ['Small touches just before the cone', 'After your trick: speed up!', 'Look up for a moment: where is the gate?'],
      variaties: {
        makkelijker: ['The same trick at every cone (chop with the inside)', 'Cones further apart and walk first'],
        moeilijker: ['Everything with your weaker foot', 'At the start the coach calls which trick you do at each cone', 'After the gate a defender is waiting: play 1v1 to the line'],
      },
    },
    tekening: (() => {
      const banen = [3, 8];
      const objecten = [
        ...banen.flatMap((c, b) => [13, 10, 7, 4].map((y, i) => pionGroot(`p${b}${i}`, c, y, K.oranje))),
        ...banen.flatMap((c, b) => [hoedje(`h${b}1`, c - 0.9, 1.4, K.geel), hoedje(`h${b}2`, c + 0.9, 1.4, K.geel)]),
        speler('a1', 1, 3, 16, { kijkrichting: -90 }),
        bal('b1', 3, 15.45, 'a1'),
        speler('a2', 2, 8, 16, { kijkrichting: -90 }),
        bal('b2', 8, 15.45, 'a2'),
        speler('a3', 3, 4.2, 17.8, { kijkrichting: -90 }),
        bal('b3', 4.2, 17.25, 'a3'),
        speler('a4', 4, 9.2, 17.8, { kijkrichting: -90 }),
        bal('b4', 9.2, 17.25, 'a4'),
      ];
      const beide = (maak) => stap(maak('a1', 3), maak('a2', 8));
      return {
        ...leeg(11, 19),
        objecten,
        animatie: [
          beide((wie, c) => ({ type: 'dribbel', wie, naar: [c + 0.3, 14.3], duur: 1.2 })),
          beide((wie) => ({ type: 'truc', wie, soort: 'binnenkant', kijk: 180 })),
          beide((wie, c) => ({ type: 'dribbel', wie, via: [[c - 1, 13.5], [c - 1, 12.4]], naar: [c - 0.3, 11.3], duur: 1.8 })),
          beide((wie) => ({ type: 'truc', wie, soort: 'buitenkant', kijk: 0 })),
          beide((wie, c) => ({ type: 'dribbel', wie, via: [[c + 1, 10.5], [c + 1, 9.4]], naar: [c + 0.3, 8.3], duur: 1.8 })),
          beide((wie) => ({ type: 'truc', wie, soort: 'zool', kijk: 180 })),
          beide((wie, c) => ({ type: 'dribbel', wie, via: [[c - 1, 7.5], [c - 1, 6.4]], naar: [c, 5.4], duur: 1.8 })),
          beide((wie) => ({ type: 'schijn', wie, kant: 'links' })),
          stap(
            ...[
              ['a1', 3],
              ['a2', 8],
            ].map(([wie, c]) => ({ type: 'dribbel', wie, via: [[c + 1, 4.6], [c + 0.9, 3.3], [c + 0.2, 2.3]], naar: [c, 0.4], duur: 2.2, manier: 'sprint' })),
            { type: 'dribbel', wie: 'a3', naar: [3, 15.6], duur: 1.4 },
            { type: 'dribbel', wie: 'a4', naar: [8, 15.6], duur: 1.4 },
          ),
        ],
      };
    })(),
  }),

  // Idee 2: aannemen en wegdraaien bij het kaatsbord
  o7({
    id: 'veld-o7-kaatsbord-wegdraaien',
    naam: 'Kaatsen en wegdraaien',
    categorieen: ['techniek'],
    uitleg:
      'Speel de bal tegen het kaatsbord. Luister goed: de trainer roept "links!" of "rechts!". Neem de bal meteen mee naar die kant en ga zo snel je kunt door het poortje. Wie is het eerst door het goede poortje?',
    organisatie:
      'Twee kaatsborden 8 m uit elkaar (veld 16 × 13 m). Bij elk kaatsbord een startplek op 5 m, en links en rechts daarvan een poortje van 2 hoedjes (2 m breed) op 3 m. Station van 15 minuten voor 5 kinderen, elk met een bal: 2 of 3 per kaatsbord. Twee kinderen spelen tegelijk tegen hun kaatsbord. Net voordat de bal terugkomt roept de trainer "links!" of "rechts!". Wie het eerst door het goede poortje is, krijgt een punt. Dribbel buitenom terug: dan is de volgende al aan de beurt.',
    benodigdheden: ['2 kaatsborden', '8 hoedjes', '1 voetbal per kind'],
    spelersNodig: 2,
    coachpunten: ['Kijk naar de bal én luister naar de trainer', 'Neem de bal mee met je eerste tik, niet eerst stilleggen', 'Na het draaien: snel weg!'],
    variaties: {
      makkelijker: ['De trainer roept de kant al voordat je speelt', 'Eerst stilleggen met je zool, dan draaien'],
      moeilijker: [
        'De trainer steekt alleen een arm op, zonder te roepen: goed kijken!',
        'Harder tegen het kaatsbord, dus een snellere bal terug',
        'Een verdediger loopt mee en probeert het poortje dicht te lopen',
      ],
    },
    en: {
      naam: 'Rebound and turn',
      uitleg:
        'Play the ball against the rebounder. Listen carefully: the coach calls "left!" or "right!". Take the ball straight away to that side and go through the gate as fast as you can. Who is first through the right gate?',
      organisatie:
        'Two rebounders 8 m apart (16 × 13 m area). At each rebounder a starting spot 5 m away, with a gate of 2 disc cones (2 m wide) 3 m to the left and to the right of it. 15-minute station for 5 children, each with a ball: 2 or 3 per rebounder. Two children play against their rebounder at the same time. Just before the ball comes back the coach calls "left!" or "right!". The first one through the right gate gets a point. Dribble back round the outside: then the next one is already going.',
      benodigdheden: ['2 rebounders', '8 disc cones', '1 football per child'],
      coachpunten: ['Watch the ball and listen to the coach', 'Take the ball with your first touch, don’t stop it first', 'After the turn: go fast!'],
      variaties: {
        makkelijker: ['The coach calls the side before you play', 'Stop the ball with your sole first, then turn'],
        moeilijker: ['The coach only raises an arm, without calling: watch carefully!', 'Play harder against the rebounder, so the ball comes back faster', 'A defender runs with you and tries to block the gate'],
      },
    },
    tekening: {
      ...leeg(16, 13),
      objecten: [
        kaatsbord('k1', 4, 1.6),
        kaatsbord('k2', 12, 1.6),
        ...[1.2, 6.8, 9.2, 14.8].flatMap((x, i) => [hoedje(`h${i}a`, x, 6.2, i % 2 ? K.blauw : K.rood), hoedje(`h${i}b`, x, 8.2, i % 2 ? K.blauw : K.rood)]),
        trainer(8, 11.8, -90),
        speler('a1', 1, 4, 7.2, { kijkrichting: -90 }),
        bal('b1', 4, 6.65, 'a1'),
        speler('a2', 2, 12, 7.2, { kijkrichting: -90 }),
        bal('b2', 12, 6.65, 'a2'),
        speler('a3', 3, 5.4, 10.4, { kijkrichting: -90 }),
        bal('b3', 5.4, 9.85, 'a3'),
        speler('a4', 4, 13.4, 10.4, { kijkrichting: -90 }),
        bal('b4', 13.4, 9.85, 'a4'),
      ],
      animatie: [
        stap({ type: 'pass', van: 'a1', naar: 'k1', terug: 'a1' }, { type: 'pass', van: 'a2', naar: 'k2', terug: 'a2' }),
        stap({ type: 'truc', wie: 'a1', soort: 'binnenkant', kijk: 180 }, { type: 'truc', wie: 'a2', soort: 'binnenkant', kijk: 180 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [0.4, 7.2], duur: 1.4, manier: 'sprint' }, { type: 'dribbel', wie: 'a2', naar: [8.4, 7.2], duur: 1.4, manier: 'sprint' }),
        stap(
          { type: 'dribbel', wie: 'a1', via: [[0.4, 9.8]], naar: [2.4, 11], duur: 2 },
          { type: 'dribbel', wie: 'a2', via: [[8.6, 9.6]], naar: [10.4, 10.8], duur: 2 },
          { type: 'dribbel', wie: 'a3', naar: [4, 7.2], duur: 1.6 },
          { type: 'dribbel', wie: 'a4', naar: [12, 7.2], duur: 1.6 },
        ),
        stap({ type: 'pass', van: 'a3', naar: 'k1', terug: 'a3' }, { type: 'pass', van: 'a4', naar: 'k2', terug: 'a4' }),
        stap({ type: 'truc', wie: 'a3', soort: 'buitenkant', kijk: 0 }, { type: 'truc', wie: 'a4', soort: 'buitenkant', kijk: 0 }),
        stap({ type: 'dribbel', wie: 'a3', naar: [7.6, 7.2], duur: 1.4, manier: 'sprint' }, { type: 'dribbel', wie: 'a4', naar: [15.6, 7.2], duur: 1.4, manier: 'sprint' }),
      ],
    },
  }),

  // Idee 4: tikken op het hoedje
  o7({
    id: 'veld-o7-tik-het-hoedje',
    naam: 'Tik het hoedje',
    categorieen: ['een-tegen-een'],
    uitleg:
      'Ver weg ligt een hoedje. Schiet je bal ertegen, dan heb je een punt! Maar pas op: de verdediger rent mee. Tikt hij het hoedje eerst met zijn voet aan, of pakt hij je bal af? Dan is het punt voor hem. Schiet je meteen, of dribbel je eerst dichterbij?',
    organisatie:
      'Twee banen van 7 × 12 m naast elkaar, met aan het eind van elke baan 1 hoedje op 10 m van de start. De aanvaller start met de bal, de verdediger 2 m achter hem. De trainer roept "go!". Station van 15 minuten voor 5 kinderen: 2 tweetallen spelen, 1 kind wacht en speelt de volgende beurt tegen de winnaar. Na elke beurt wisselen aanvaller en verdediger.',
    benodigdheden: ['6 hoedjes', '2 voetballen', 'Hesjes'],
    spelersNodig: 2,
    coachpunten: ['Kijk waar de verdediger is: ver weg? Dan meteen schieten!', 'Schiet met je veter of je binnenkant, niet met je teen', 'Verdediger: ren de kortste weg naar het hoedje'],
    variaties: {
      makkelijker: ['De verdediger start 4 m achter je', 'Twee hoedjes naast elkaar: raak er één'],
      moeilijker: ['Het hoedje op 12 m en de verdediger maar 1 m achter je', 'Raken mag alleen met je zwakke voet', 'Twee hoedjes ver uit elkaar: de verdediger kan er maar één beschermen, kies de vrije'],
    },
    en: {
      naam: 'Hit the disc cone',
      uitleg:
        'Far away there is a disc cone. Hit it with your ball and you score a point! But watch out: the defender runs with you. Does the defender touch the disc cone with their foot first, or win your ball? Then the point goes to them. Do you shoot straight away, or dribble closer first?',
      organisatie:
        'Two 7 × 12 m lanes side by side, with 1 disc cone at the end of each lane, 10 m from the start. The attacker starts with the ball, the defender 2 m behind. The coach calls "go!". 15-minute station for 5 children: 2 pairs play, 1 child waits and plays the winner next. After every turn attacker and defender swap.',
      benodigdheden: ['6 disc cones', '2 footballs', 'Bibs'],
      coachpunten: ['See where the defender is: far away? Shoot straight away!', 'Shoot with your laces or the inside of your foot, not your toe', 'Defender: run the shortest way to the disc cone'],
      variaties: {
        makkelijker: ['The defender starts 4 m behind you', 'Two disc cones side by side: hit one of them'],
        moeilijker: ['The disc cone 12 m away and the defender only 1 m behind you', 'You may only hit it with your weaker foot', 'Two disc cones far apart: the defender can only protect one, choose the free one'],
      },
    },
    tekening: {
      ...leeg(17, 14),
      objecten: [
        hoedje('d1', 4, 1.8, K.oranje),
        hoedje('d2', 13, 1.8, K.oranje),
        hoedje('s1', 1.6, 12.6),
        hoedje('s2', 6.4, 12.6),
        hoedje('s3', 10.6, 12.6),
        hoedje('s4', 15.4, 12.6),
        trainer(8.5, 9.4, 0),
        speler('a1', 1, 3.4, 12, { kijkrichting: -90 }),
        bal('b1', 3.4, 11.45, 'a1'),
        B('c1', 2, 5.2, 13.2, { kijkrichting: -90 }),
        speler('a2', 3, 12.4, 12, { kijkrichting: -90 }),
        bal('b2', 12.4, 11.45, 'a2'),
        B('c2', 4, 14.2, 13.2, { kijkrichting: -90 }),
        speler('w1', 5, 8.5, 13.2, { kijkrichting: -90 }),
      ],
      animatie: [
        stap(
          { type: 'dribbel', wie: 'a1', naar: [3.6, 7.4], duur: 1.8, manier: 'sprint' },
          { type: 'loop', wie: 'c1', naar: [5.4, 8.6], manier: 'sprint', start: 0.2, duur: 1.6 },
          { type: 'dribbel', wie: 'a2', naar: [12.8, 7.6], duur: 2 },
          { type: 'loop', wie: 'c2', naar: [14.4, 6.8], manier: 'sprint', duur: 2 },
        ),
        stap(
          { type: 'schot', van: 'a1', naar: [4, 2.25], hoogte: 'grond' },
          { type: 'loop', wie: 'c1', naar: [5.4, 4.6], manier: 'sprint', duur: 1.2 },
          { type: 'dribbel', wie: 'a2', naar: [12.6, 5], duur: 1.2 },
          { type: 'loop', wie: 'c2', naar: [13.6, 2.4], manier: 'sprint', duur: 1.2 },
        ),
        stap({ type: 'keerOm', object: 'd1' }, { type: 'aantikken', wie: 'c2', doel: 'd2', met: 'voet' }),
      ],
    },
  }),

  // Idee 5: spiegel naar de lijn
  o7({
    id: 'veld-o7-spiegel-naar-de-lijn',
    naam: 'Spiegel naar de lijn',
    categorieen: ['een-tegen-een'],
    uitleg:
      'Jij dribbelt langs de lijn en de verdediger loopt mee, net als in een spiegel. Jij kiest het moment! Stop, draai of versnel, en dribbel de bal over de lijn. Lukt het binnen 10 tellen? Punt voor jou!',
    organisatie:
      'Twee banen van 10 × 5 m (veld 12 × 15 m), elk met een lijn van 4 hoedjes langs een lange kant. De verdediger staat tussen de aanvaller en de lijn, 2 m van de aanvaller. Op "go!" van de trainer dribbelt de aanvaller langs de lijn en de verdediger spiegelt mee. De trainer telt hardop tot 10. Station van 15 minuten voor 5 kinderen: 2 tweetallen, 1 kind wacht en wisselt na elke beurt in. Na elke beurt wisselen aanvaller en verdediger.',
    benodigdheden: ['12 hoedjes', '2 voetballen', 'Hesjes'],
    spelersNodig: 2,
    coachpunten: ['Lok de verdediger mee en stop dan ineens', 'Na je stop: meteen versnellen naar de lijn', 'Verdediger: blijf tussen de bal en de lijn'],
    variaties: {
      makkelijker: ['De verdediger loopt alleen en mag niet tikken', 'Je hebt 15 tellen'],
      moeilijker: ['Je hebt maar 5 tellen', 'De bal moet over de lijn stil liggen (zool erop)', 'De verdediger mag de bal ook afpakken en scoren over jouw lijn'],
    },
    en: {
      naam: 'Mirror to the line',
      uitleg:
        'You dribble along the line and the defender moves with you, just like a mirror. You choose the moment! Stop, turn or speed up, and dribble the ball over the line. Can you do it within 10 seconds? A point for you!',
      organisatie:
        'Two 10 × 5 m lanes (12 × 15 m area), each with a line of 4 disc cones along one long side. The defender stands between the attacker and the line, 2 m from the attacker. When the coach calls "go!" the attacker dribbles along the line and the defender mirrors. The coach counts out loud to 10. 15-minute station for 5 children: 2 pairs, 1 child waits and comes in after every turn. After every turn attacker and defender swap.',
      benodigdheden: ['12 disc cones', '2 footballs', 'Bibs'],
      coachpunten: ['Draw the defender with you and then suddenly stop', 'After your stop: speed up to the line straight away', 'Defender: stay between the ball and the line'],
      variaties: {
        makkelijker: ['The defender only walks and may not tackle', 'You have 15 seconds'],
        moeilijker: ['You only have 5 seconds', 'The ball has to stop over the line (sole on it)', 'The defender may also win the ball and score over your line'],
      },
    },
    tekening: (() => {
      // Baan B is baan A een halve slag gedraaid (rond het midden van het veld).
      const d = ([x, y]) => [+(12 - x).toFixed(2), +(15 - y).toFixed(2)];
      const lijn = [1, 4.3, 7.6, 11].map((x, i) => hoedje(`l${i}`, x, 1, K.rood));
      const hoeken = [hoedje('e1', 1, 6), hoedje('e2', 11, 6)];
      const baanB = [...lijn, ...hoeken].map((h) => ({ ...h, id: `${h.id}b`, x: d([h.x, h.y])[0], y: d([h.x, h.y])[1] }));
      const A = [
        [{ type: 'dribbel', wie: 'a1', naar: [7.6, 5], duur: 2.4 }, { type: 'loop', wie: 'c1', naar: [7.6, 3], manier: 'verdedigend', kijk: 90, duur: 2.4 }],
        [{ type: 'truc', wie: 'a1', soort: 'zool', kijk: 180 }, { type: 'loop', wie: 'c1', naar: [8.6, 3], manier: 'verdedigend', kijk: 90, duur: 0.6 }],
        [{ type: 'dribbel', wie: 'a1', via: [[6.2, 4.3]], naar: [5.2, 0.3], duur: 1.6, manier: 'sprint' }, { type: 'loop', wie: 'c1', naar: [7.4, 2.2], manier: 'sprint', start: 0.35, duur: 1.2 }],
      ];
      const spiegel = (a) => {
        const b = { ...a, wie: a.wie === 'a1' ? 'a2' : 'c2' };
        if (b.naar) b.naar = d(b.naar);
        if (b.via) b.via = b.via.map(d);
        if (b.kijk !== undefined) b.kijk = b.kijk === 180 ? 0 : b.kijk === 90 ? -90 : b.kijk + 180;
        return b;
      };
      return draaiKwart({
        ...leeg(12, 15),
        objecten: [
          ...lijn,
          ...hoeken,
          ...baanB,
          trainer(6, 7.5, 180),
          speler('a1', 1, 2, 5, { kijkrichting: 0 }),
          bal('b1', 2.55, 5, 'a1'),
          B('c1', 2, 2, 3, { kijkrichting: 90 }),
          speler('a2', 3, 10, 10, { kijkrichting: 180 }),
          bal('b2', 9.45, 10, 'a2'),
          B('c2', 4, 10, 12, { kijkrichting: -90 }),
          speler('w1', 5, 0.4, 7.5, { kijkrichting: 0 }),
        ],
        animatie: A.map((acties) => stap(...acties, ...acties.map(spiegel))),
      });
    })(),
  }),

  // Idee 6: 1 tegen 1 met twee doeltjes en direct omschakelen
  o7({
    id: 'veld-o7-direct-omschakelen',
    naam: 'Kwijt? Meteen verdedigen!',
    categorieen: ['een-tegen-een'],
    uitleg:
      'Jullie spelen 1 tegen 1. Jij scoort op het ene goaltje, de ander op het andere. Pak je de bal af? Ga meteen scoren! Ben je de bal kwijt, of heb je net gescoord? Dan speelt de trainer meteen een nieuwe bal in naar de ander, en moet jij snel terug om te verdedigen.',
    organisatie:
      'Twee veldjes van 8 × 12 m naast elkaar met op elke korte kant een mini-goaltje. De trainer staat tussen de veldjes met een stapel ballen. Station van 15 minuten voor 5 kinderen: 2 tweetallen spelen, 1 kind wacht en wisselt na 1 minuut in. De trainer roept "nieuwe bal!" en speelt hem meteen in naar wie de bal níet verloor (na een goal: naar de ander). Wie heeft na 1 minuut de meeste goals?',
    benodigdheden: ['4 mini-goaltjes', '8 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 2,
    coachpunten: ['Bal kwijt? Meteen terugrennen!', 'Bal gewonnen? Kijk waar het goaltje is en ga!', 'Zet je lijf tussen de ander en de bal'],
    variaties: {
      makkelijker: ['De trainer wacht 3 tellen met de nieuwe bal', 'Grotere goaltjes (palen 2 m uit elkaar)'],
      moeilijker: ['Op elke kant twee goaltjes: kies het vrije', 'Scoren mag alleen na een actie (kap of schaar)', 'Kleiner veldje (6 × 10 m)'],
    },
    en: {
      naam: 'Lost it? Defend straight away!',
      uitleg:
        'You play 1v1. You score in one mini-goal, the other child in the other one. Do you win the ball? Go and score straight away! Have you lost the ball, or have you just scored? Then the coach plays a new ball straight in to the other child, and you have to get back fast to defend.',
      organisatie:
        'Two 8 × 12 m pitches side by side with a mini-goal on each short side. The coach stands between the pitches with a pile of balls. 15-minute station for 5 children: 2 pairs play, 1 child waits and comes in after 1 minute. The coach calls "new ball!" and plays it straight in to whoever did not lose the ball (after a goal: to the other child). Who has scored the most goals after 1 minute?',
      benodigdheden: ['4 mini-goals', '8 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Lost the ball? Run back straight away!', 'Won the ball? See where the mini-goal is and go!', 'Put your body between the other child and the ball'],
      variaties: {
        makkelijker: ['The coach waits 3 seconds with the new ball', 'Bigger goals (poles 2 m apart)'],
        moeilijker: ['Two mini-goals on each side: choose the free one', 'You may only score after a move (chop or step-over)', 'A smaller pitch (6 × 10 m)'],
      },
    },
    tekening: draaiKwart({
      ...leeg(20, 14),
      objecten: [
        miniGoal('g1', 5, 0.9),
        miniGoal('g2', 5, 13.1, 180),
        miniGoal('g3', 15, 0.9),
        miniGoal('g4', 15, 13.1, 180),
        ...[1, 9, 11, 19].flatMap((x, i) => [hoedje(`h${i}a`, x, 1), hoedje(`h${i}b`, x, 13)]),
        trainer(10, 7, 180),
        bal('b5', 9.45, 7, 't1'),
        speler('w1', 5, 10, 11, { kijkrichting: -90 }),
        speler('a1', 1, 5, 10, { kijkrichting: -90 }),
        bal('b1', 5, 9.45, 'a1'),
        B('c1', 2, 5.4, 5.2, { kijkrichting: 90 }),
        speler('a2', 3, 15, 10, { kijkrichting: -90 }),
        bal('b2', 15, 9.45, 'a2'),
        B('c2', 4, 15.4, 5.2, { kijkrichting: 90 }),
      ],
      animatie: [
        stap(
          { type: 'dribbel', wie: 'a1', naar: [4.6, 7.8], duur: 1.4 },
          { type: 'druk', wie: 'c1', afstand: 2.2, manier: 'verdedigend', duur: 1.4 },
          { type: 'dribbel', wie: 'a2', naar: [14.6, 7.8], duur: 1.4 },
          { type: 'druk', wie: 'c2', afstand: 2.2, manier: 'verdedigend', duur: 1.4 },
        ),
        stap({ type: 'verover', wie: 'c1', van: 'a1' }, { type: 'schijn', wie: 'a2', kant: 'links' }),
        stap(
          { type: 'dribbel', wie: 'c1', via: [[6.4, 8.4]], naar: [5.6, 10.8], duur: 1.8 },
          { type: 'loop', wie: 'a1', naar: [4.2, 9.4], manier: 'sprint', start: 0.3, duur: 1.4 },
          { type: 'dribbel', wie: 'a2', via: [[17.2, 7.2]], naar: [16.6, 3.2], duur: 1.8, manier: 'sprint' },
          { type: 'loop', wie: 'c2', naar: [14.8, 4.4], manier: 'sprint', start: 0.4, duur: 1.4 },
        ),
        stap({ type: 'schot', van: 'c1', naar: [5, 12.75] }, { type: 'schot', van: 'a2', naar: [15.2, 1.25] }),
        stap({ type: 'pass', van: 't1', naar: 'a1' }, { type: 'loop', wie: 'c1', via: [[6.8, 9.6]], naar: [5.4, 7], manier: 'sprint', start: 0.3, duur: 1.6 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [3.6, 7.2], duur: 1.4 }, { type: 'druk', wie: 'c1', afstand: 1.8, manier: 'verdedigend', duur: 1.4 }),
      ],
    }),
  }),

  // Idee 7: 1 tegen 1 reactiepoortjes
  o7({
    id: 'veld-o7-reactiepoortjes',
    naam: 'Reactiepoortjes',
    categorieen: ['een-tegen-een'],
    uitleg:
      'Rond het vak staan vier poortjes: rood, blauw, geel en groen. De trainer roept een kleur. Dribbel zo snel je kunt door dat poortje! De verdediger probeert je tegen te houden. Pakt hij de bal af? Dan mag hij door elk poortje dat hij wil.',
    organisatie:
      'Vak van 12 × 12 m met in het midden van elke kant een poortje van 2 hoedjes in één kleur (2 m breed). Station van 15 minuten voor 5 kinderen: 2 tweetallen spelen tegelijk in het vak, 1 kind wacht en wisselt na elke beurt in. De aanvaller heeft de bal, de verdediger staat 2 m achter hem. De trainer roept een kleur ("rood!"), voor iedereen dezelfde. Door het goede poortje: punt voor de aanvaller. Bal afgepakt en zelf door een poortje: punt voor de verdediger.',
    benodigdheden: ['12 hoedjes', '2 voetballen', 'Hesjes'],
    spelersNodig: 2,
    coachpunten: ['Luister goed en ga meteen', 'Kijk op: welk poortje is het?', 'Houd de bal dicht bij je voet als de verdediger dichtbij is'],
    variaties: {
      makkelijker: ['De verdediger start 4 m achter je', 'De trainer wijst het poortje ook aan'],
      moeilijker: [
        'De trainer roept twee kleuren: kies het poortje waar de verdediger niet staat',
        'De verdediger start naast je in plaats van achter je',
        'Roept de trainer "wissel!", dan geeft de aanvaller de bal aan de verdediger',
      ],
    },
    en: {
      naam: 'Reaction gates',
      uitleg:
        'Around the area there are four gates: red, blue, yellow and green. The coach calls a colour. Dribble through that gate as fast as you can! The defender tries to stop you. Does the defender win the ball? Then they may go through any gate they like.',
      organisatie:
        '12 × 12 m area with a gate of 2 disc cones of one colour (2 m wide) in the middle of each side. 15-minute station for 5 children: 2 pairs play in the area at the same time, 1 child waits and comes in after every turn. The attacker has the ball, the defender stands 2 m behind. The coach calls one colour ("red!"), the same for everyone. Through the right gate: a point for the attacker. Ball won and through a gate yourself: a point for the defender.',
      benodigdheden: ['12 disc cones', '2 footballs', 'Bibs'],
      coachpunten: ['Listen carefully and go straight away', 'Look up: which gate is it?', 'Keep the ball close to your foot when the defender is near'],
      variaties: {
        makkelijker: ['The defender starts 4 m behind you', 'The coach also points at the gate'],
        moeilijker: ['The coach calls two colours: choose the gate where the defender isn’t', 'The defender starts next to you instead of behind you', 'When the coach calls "swap!", the attacker gives the ball to the defender'],
      },
    },
    tekening: {
      ...leeg(15, 15),
      objecten: [
        hoedje('r1', 6, 1, K.rood),
        hoedje('r2', 8, 1, K.rood),
        hoedje('u1', 13, 6, K.blauw),
        hoedje('u2', 13, 8, K.blauw),
        hoedje('y1', 6, 13, K.geel),
        hoedje('y2', 8, 13, K.geel),
        hoedje('n1', 1, 6, K.groen),
        hoedje('n2', 1, 8, K.groen),
        ...[
          [1, 1],
          [13, 1],
          [1, 13],
          [13, 13],
        ].map(([x, y], i) => hoedje(`e${i}`, x, y)),
        trainer(14.4, 14.2, -135),
        speler('w1', 5, 0, 14.2, { kijkrichting: -45 }),
        speler('a1', 1, 4.4, 8.4, { kijkrichting: -90 }),
        bal('b1', 4.4, 7.85, 'a1'),
        B('c1', 2, 2.4, 9.4, { kijkrichting: -60 }),
        speler('a2', 3, 9.6, 8.2, { kijkrichting: -90 }),
        bal('b2', 9.6, 7.65, 'a2'),
        B('c2', 4, 11.8, 6.6, { kijkrichting: 160 }),
      ],
      animatie: [
        stap(
          { type: 'dribbel', wie: 'a1', via: [[5, 5.4]], naar: [6.4, 3.2], duur: 2, manier: 'sprint' },
          { type: 'loop', wie: 'c1', via: [[3.4, 7.2]], naar: [4.8, 5], manier: 'sprint', start: 0.3, duur: 1.7 },
          { type: 'dribbel', wie: 'a2', naar: [9.4, 6.8], duur: 1.2 },
          { type: 'druk', wie: 'c2', afstand: 1.6, manier: 'verdedigend', duur: 1.2 },
        ),
        stap({ type: 'dribbel', wie: 'a1', naar: [7, 0.2], duur: 1.2, manier: 'sprint' }, { type: 'loop', wie: 'c1', naar: [5.8, 2.8], duur: 1.2 }, { type: 'verover', wie: 'c2', van: 'a2' }),
        stap({ type: 'dribbel', wie: 'c2', via: [[12.4, 7.2]], naar: [13.8, 7], duur: 1.6, manier: 'sprint' }, { type: 'loop', wie: 'a2', naar: [10.8, 8.2], start: 0.3, duur: 1.2 }),
      ],
    },
  }),

  // Idee 8: schietduel na een pass van de trainer
  o7({
    id: 'veld-o7-schietduel',
    naam: 'Schietduel',
    categorieen: ['afwerken'],
    uitleg:
      'De trainer speelt een bal tussen jullie in. Ren! Wie de bal het eerst heeft, mag schieten op het grote goal. De ander probeert dat te voorkomen. Door een gat in de hoek: 3 punten. In het net: 1 punt.',
    organisatie:
      'E-goal met een net met open hoeken. De trainer staat op 13 m van het goal, de twee kinderen links en rechts van hem op 4 m afstand van elkaar (veld 16 × 17 m). De trainer roept "go!" en speelt de bal 6 m het veld in. Station van 15 minuten voor 5 kinderen: twee tweetallen om de beurt. Als het ene tweetal schiet, staat het volgende al klaar. Het vijfde kind haalt de ballen uit het goal en wisselt na elke beurt in.',
    benodigdheden: ['1 E-goal', '1 net met open hoeken', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 2,
    coachpunten: ['Ren naar de bal, niet naar de ander', 'Zet je lijf tussen de ander en de bal', 'Kijk naar een gat in de hoek en schiet'],
    variaties: {
      makkelijker: ['De trainer speelt de bal dichter bij het goal', 'Elk schot op het goal telt 1 punt'],
      moeilijker: [
        'De trainer speelt de bal schuin of laat hem stuiteren',
        'Pakt de verdediger de bal af, dan mag hij scoren op een mini-goaltje achter de startlijn',
        'Je moet binnen 3 tellen na het aannemen schieten',
      ],
    },
    en: {
      naam: 'Shooting duel',
      uitleg:
        'The coach plays a ball in between you. Run! Whoever gets the ball first may shoot at the big goal. The other one tries to stop it. Through a hole in a corner: 3 points. In the net: 1 point.',
      organisatie:
        'E-goal with a net with open corners. The coach stands 13 m from the goal, the two children to the left and right of the coach, 4 m apart (16 × 17 m area). The coach calls "go!" and plays the ball 6 m onto the pitch. 15-minute station for 5 children: two pairs take turns. While one pair shoots, the next one is already ready. The fifth child fetches the balls from the goal and comes in after every turn.',
      benodigdheden: ['1 E-goal', '1 net with open corners', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Run to the ball, not to the other child', 'Put your body between the other child and the ball', 'Look for a hole in a corner and shoot'],
      variaties: {
        makkelijker: ['The coach plays the ball closer to the goal', 'Every shot on goal is worth 1 point'],
        moeilijker: ['The coach plays the ball at an angle or lets it bounce', 'If the defender wins the ball, they may score in a mini-goal behind the start line', 'You must shoot within 3 seconds of receiving the ball'],
      },
    },
    tekening: {
      ...leeg(16, 17),
      objecten: [
        eGoal('g1', 8, 1.8),
        net('n1', 'g1', 8, 1.8),
        hoedje('h1', 5.8, 14.4),
        hoedje('h2', 10.2, 14.4),
        hoedje('h3', 4.4, 16.4),
        hoedje('h4', 11.6, 16.4),
        trainer(8, 14.6, -90),
        bal('b1', 8, 14.05, 't1'),
        speler('a1', 1, 5.8, 13.4, { kijkrichting: -90 }),
        B('c1', 2, 10.2, 13.4, { kijkrichting: -90 }),
        speler('a2', 3, 4.4, 15.6, { kijkrichting: -90 }),
        B('c2', 4, 11.6, 15.6, { kijkrichting: -90 }),
        speler('w1', 5, 13.6, 3.4, { kijkrichting: 180 }),
      ],
      animatie: [
        stap(
          { type: 'pass', van: 't1', naar: [8, 8.6], hoogte: 'grond' },
          { type: 'loop', wie: 'a1', naar: [7.6, 9.1], manier: 'sprint', start: 0.3, duur: 1.5 },
          { type: 'loop', wie: 'c1', naar: [9.6, 9.6], manier: 'sprint', start: 0.3, duur: 1.5 },
        ),
        stap({ type: 'pak', wie: 'a1' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [7.2, 5.6], duur: 1.4 }, { type: 'loop', wie: 'c1', naar: [9.2, 6.4], manier: 'sprint', duur: 1.4 }),
        stap({ type: 'schot', van: 'a1', naar: [5.87, 1.3], hoogte: 'laag', eindHoogte: 0.35 }),
        stap(
          { type: 'loop', wie: 'a2', naar: [5.8, 13.4], duur: 1.2 },
          { type: 'loop', wie: 'c2', naar: [10.2, 13.4], duur: 1.2 },
          { type: 'loop', wie: 'a1', via: [[3.2, 8]], naar: [3, 15.4], duur: 2.4, spoor: false },
          { type: 'loop', wie: 'c1', via: [[12.8, 8]], naar: [13, 15.4], duur: 2.4, spoor: false },
        ),
      ],
    },
  }),

  // Idee 9: actie bij de pop en schieten
  o7({
    id: 'veld-o7-pop-actie-schieten',
    naam: 'Actie bij de pop en schieten',
    categorieen: ['afwerken'],
    uitleg:
      'Dribbel naar de pop. Vlak ervoor roept de trainer "links!" of "rechts!". Maak een schaar of een kap en ga aan die kant langs de pop. Schiet dan in een hoek van het goal! Door een gat in de hoek: 3 punten. In het net: 1 punt.',
    organisatie:
      'E-goal met een net met open hoeken. Twee poppen op 7 m voor het goal, 5 m uit elkaar, en twee startplekken op 14 m (veld 16 × 18 m). Station van 15 minuten voor 5 kinderen, elk met een bal: 2 of 3 per startplek. Links en rechts om de beurt: vertrek als de ander bij de pop is. De trainer staat tussen de poppen, roept de kant en telt de punten per rijtje: links tegen rechts.',
    benodigdheden: ['1 E-goal', '1 net met open hoeken', '2 poppen', '2 hoedjes', '1 voetbal per kind'],
    spelersNodig: 2,
    coachpunten: ['Maak je actie vlak voor de pop, niet te vroeg', 'Na de actie: versnellen en meteen schieten', 'Kijk naar het gat, dan pas schieten'],
    variaties: {
      makkelijker: ['Je kiest zelf de kant', 'Elk doelpunt telt'],
      moeilijker: ['Schieten met de voet die het verst van de pop is', 'De trainer roept pas op het laatste moment', 'Na het schot loopt de trainer als verdediger mee naar de volgende'],
    },
    en: {
      naam: 'Move at the mannequin and shoot',
      uitleg:
        'Dribble to the mannequin. Just before it the coach calls "left!" or "right!". Do a step-over or a chop and go past the mannequin on that side. Then shoot into a corner of the goal! Through a hole in a corner: 3 points. In the net: 1 point.',
      organisatie:
        'E-goal with a net with open corners. Two mannequins 7 m in front of the goal, 5 m apart, and two starting spots 14 m away (16 × 18 m area). 15-minute station for 5 children, each with a ball: 2 or 3 per starting spot. Left and right take turns: go when the other child reaches the mannequin. The coach stands between the mannequins, calls the side and counts the points per line: left against right.',
      benodigdheden: ['1 E-goal', '1 net with open corners', '2 mannequins', '2 disc cones', '1 football per child'],
      coachpunten: ['Do your move just before the mannequin, not too early', 'After the move: speed up and shoot straight away', 'Look at the hole first, then shoot'],
      variaties: {
        makkelijker: ['You choose the side yourself', 'Every goal counts'],
        moeilijker: ['Shoot with the foot furthest from the mannequin', 'The coach only calls at the very last moment', 'After the shot the coach runs with the next child as a defender'],
      },
    },
    tekening: {
      ...leeg(16, 18),
      objecten: [
        eGoal('g1', 8, 1.8),
        net('n1', 'g1', 8, 1.8),
        pop('m1', 5.5, 8.5),
        pop('m2', 10.5, 8.5),
        hoedje('s1', 6.9, 16.2),
        hoedje('s2', 9.1, 16.2),
        trainer(8, 10.6, 90),
        speler('a1', 1, 5.5, 15.6, { kijkrichting: -90 }),
        bal('b1', 5.5, 15.05, 'a1'),
        speler('a2', 2, 10.5, 15.6, { kijkrichting: -90 }),
        bal('b2', 10.5, 15.05, 'a2'),
        speler('a3', 3, 4.2, 17.4, { kijkrichting: -90 }),
        bal('b3', 4.2, 16.85, 'a3'),
        speler('a4', 4, 11.8, 17.4, { kijkrichting: -90 }),
        bal('b4', 11.8, 16.85, 'a4'),
      ],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [5.6, 10.1], duur: 2.2 }, { type: 'dribbel', wie: 'a2', naar: [10.5, 13], start: 0.6, duur: 1.6 }),
        stap({ type: 'schijn', wie: 'a1', kant: 'rechts' }, { type: 'dribbel', wie: 'a2', naar: [10.4, 10.1], duur: 1.2 }),
        stap({ type: 'dribbel', wie: 'a1', via: [[4.3, 8.7]], naar: [5, 6.4], duur: 1.4, manier: 'sprint' }, { type: 'truc', wie: 'a2', soort: 'binnenkant', voet: 'links', kijk: 0 }),
        stap({ type: 'schot', van: 'a1', naar: [5.87, 1.3], hoogte: 'laag', eindHoogte: 0.35 }, { type: 'dribbel', wie: 'a2', via: [[11.7, 8.7]], naar: [11, 6.4], duur: 1.4, manier: 'sprint' }),
        stap({ type: 'schot', van: 'a2', naar: [10.13, 1.3], hoogte: 'laag', eindHoogte: 0.35 }, { type: 'dribbel', wie: 'a3', naar: [5.5, 15.6], duur: 1.2 }, { type: 'dribbel', wie: 'a4', naar: [10.5, 15.6], duur: 1.2 }),
      ],
    },
  }),

  // Idee 12: dribbelen in de drukte
  o7({
    id: 'veld-o7-dribbelen-in-de-drukte',
    naam: 'Dribbelen in de drukte',
    categorieen: ['techniek'],
    uitleg:
      'Iedereen dribbelt kriskras door het smalle vak. Hoofd omhoog! De trainer steekt een hoedje op. Rood: roep "rood!" en zet je voet op de bal. Blauw: roep "blauw!" en kap de andere kant op. Steekt hij vingers op? Roep het aantal en tik de bal zo vaak met je zool. Wie is het snelst?',
    organisatie:
      'Smal vak van 8 × 12 m. Station van 15 minuten voor 5 kinderen, elk met een bal. De trainer staat aan de lange kant met een rood en een blauw hoedje en steekt er telkens één op, of een aantal vingers. Wie het eerst goed roept én het goed doet, krijgt een punt. Na 2 minuten even rusten en de punten tellen.',
    benodigdheden: ['6 hoedjes', '1 voetbal per kind'],
    spelersNodig: 3,
    coachpunten: ['Kijk tussen je tikjes door naar de trainer', 'Kleine tikjes, dan bots je niet', 'Zie je ruimte? Daar ga je heen'],
    variaties: {
      makkelijker: ['Een groter vak', 'De trainer roept de kleur er ook bij'],
      moeilijker: ['Een nog smaller vak (6 × 12 m)', 'Meer tekens: geel = draai met de buitenkant, een vuist = schaar', 'Alleen dribbelen met je zwakke voet'],
    },
    en: {
      naam: 'Dribbling in the crowd',
      uitleg:
        'Everyone dribbles all over the narrow area. Head up! The coach holds up a disc cone. Red: call "red!" and put your foot on the ball. Blue: call "blue!" and chop the other way. Does the coach hold up fingers? Call the number and touch the ball that many times with your sole. Who is fastest?',
      organisatie:
        'Narrow 8 × 12 m area. 15-minute station for 5 children, each with a ball. The coach stands on the long side with a red and a blue disc cone and keeps holding one of them up, or a number of fingers. The first one to call it correctly and do it correctly gets a point. After 2 minutes a short rest and count the points.',
      benodigdheden: ['6 disc cones', '1 football per child'],
      coachpunten: ['Between your touches, look at the coach', 'Small touches, then you won’t bump into anyone', 'See some space? Go there'],
      variaties: {
        makkelijker: ['A bigger area', 'The coach also calls the colour'],
        moeilijker: ['An even narrower area (6 × 12 m)', 'More signs: yellow = turn with the outside, a fist = step-over', 'Only dribble with your weaker foot'],
      },
    },
    tekening: (() => {
      const c = [5, 7];
      const r = 2.6;
      const n = 5;
      const graden = 100;
      // Na het rondje: elk kind kapt de andere kant op (terug langs de cirkel).
      const keer = Array.from({ length: n }, (_, i) => ({ type: 'truc', wie: `a${i + 1}`, soort: 'binnenkant', kijk: -90 + (360 * i) / n + graden - 90 }));
      return {
        ...leeg(11, 14),
        objecten: [
          zone('vak', 5, 7, 8, 12),
          hoedje('v1', 1, 1),
          hoedje('v2', 9, 1),
          hoedje('v3', 1, 13),
          hoedje('v4', 9, 13),
          hoedje('rood', 10.2, 6.2, K.rood),
          hoedje('blauw', 10.2, 7.8, K.blauw),
          trainer(10.6, 7, 180),
          ...kinderen(n, c, r),
        ],
        animatie: [
          rondje(n, c, r, -90, graden, 3.2),
          stap({ type: 'pakObject', wie: 't1', object: 'rood' }),
          allen(n, (wie) => ({ type: 'voetOpBal', wie })),
          stap({ type: 'legObject', wie: 't1', object: 'rood', naar: [10.2, 6.2] }),
          stap({ type: 'pakObject', wie: 't1', object: 'blauw' }),
          stap(...keer),
          rondje(n, c, r, -90 + graden, -graden, 3.2),
        ],
      };
    })(),
  }),

  // Eigen 1: kaatsen of zelf gaan
  o7({
    id: 'veld-o7-kaatsen-of-zelf',
    naam: 'Kaatsen of zelf gaan?',
    categorieen: ['een-tegen-een'],
    uitleg:
      'Het kaatsbord is je maatje. Komt de verdediger dichtbij? Speel de bal tegen het kaatsbord en ren langs hem. Blijft hij ver weg? Ga zelf! Scoor in het goaltje. Na een kaats: 2 punten.',
    organisatie:
      'Twee veldjes van 9 × 12 m naast elkaar met een mini-goaltje aan de korte kant en een kaatsbord aan de lange kant, halverwege. Station van 15 minuten voor 5 kinderen: 2 tweetallen, 1 kind wacht en speelt de volgende beurt tegen de winnaar. De aanvaller start met de bal bij de startlijn, de verdediger bij het goaltje. De trainer roept "go!" en telt de punten: een goal na een kaats is 2 punten, een goal na een dribbel 1 punt.',
    benodigdheden: ['2 kaatsborden', '2 mini-goaltjes', '8 hoedjes', '2 voetballen', 'Hesjes'],
    spelersNodig: 2,
    coachpunten: ['Komt hij dichtbij? Kaatsen!', 'Na je pass: rennen langs de andere kant', 'Blijft hij ver weg? Zelf gaan'],
    variaties: {
      makkelijker: ['De verdediger mag alleen lopen', 'Het kaatsbord dichterbij'],
      moeilijker: ['De verdediger mag ook het kaatsbord dichtlopen', 'Scoren mag alleen binnen 8 tellen', 'Een tweede kaatsbord aan de andere kant: kies het vrije'],
    },
    en: {
      naam: 'Rebound or go yourself?',
      uitleg:
        'The rebounder is your teammate. Does the defender come close? Play the ball against the rebounder and run past them. Does the defender stay far away? Go yourself! Score in the mini-goal. After a rebound: 2 points.',
      organisatie:
        'Two 9 × 12 m pitches side by side with a mini-goal on the short side and a rebounder halfway along the long side. 15-minute station for 5 children: 2 pairs, 1 child waits and plays the winner next. The attacker starts with the ball at the start line, the defender at the mini-goal. The coach calls "go!" and counts the points: a goal after a rebound is 2 points, a goal after a dribble is 1 point.',
      benodigdheden: ['2 rebounders', '2 mini-goals', '8 disc cones', '2 footballs', 'Bibs'],
      coachpunten: ['Does the defender come close? Use the rebounder!', 'After your pass: run past on the other side', 'Does the defender stay far away? Go yourself'],
      variaties: {
        makkelijker: ['The defender may only walk', 'The rebounder closer'],
        moeilijker: ['The defender may also block the rebounder', 'You must score within 8 seconds', 'A second rebounder on the other side: choose the free one'],
      },
    },
    tekening: draaiKwart({
      ...leeg(20, 14),
      objecten: [
        miniGoal('g1', 5, 0.9),
        miniGoal('g2', 15, 0.9),
        kaatsbord('k1', 0.9, 7, 90),
        kaatsbord('k2', 19.1, 7, -90),
        ...[0.5, 9.5, 10.5, 19.5].flatMap((x, i) => [hoedje(`h${i}a`, x, 1), hoedje(`h${i}b`, x, 13)]),
        trainer(10, 7, 180),
        speler('w1', 5, 10, 12.4, { kijkrichting: -90 }),
        speler('a1', 1, 5, 12, { kijkrichting: -90 }),
        bal('b1', 5, 11.45, 'a1'),
        B('c1', 2, 5, 7.4, { kijkrichting: 90 }),
        speler('a2', 3, 15, 12, { kijkrichting: -90 }),
        bal('b2', 15, 11.45, 'a2'),
        B('c2', 4, 15, 5.4, { kijkrichting: 90 }),
      ],
      animatie: [
        stap(
          { type: 'dribbel', wie: 'a1', naar: [4.6, 9.6], duur: 1.4 },
          { type: 'loop', wie: 'c1', naar: [4.8, 7.8], manier: 'verdedigend', duur: 1.4 },
          { type: 'dribbel', wie: 'a2', naar: [15.2, 9], duur: 1.4 },
          { type: 'loop', wie: 'c2', naar: [15.2, 6.4], manier: 'verdedigend', duur: 1.4 },
        ),
        stap(
          { type: 'pass', van: 'a1', naar: 'k1', terug: [3.6, 5.4] },
          { type: 'loop', wie: 'a1', via: [[6.8, 8.4], [6.4, 6.4]], naar: [4.2, 5.9], manier: 'sprint', start: 0.3, duur: 2 },
          { type: 'loop', wie: 'c1', naar: [3.8, 7.6], manier: 'verdedigend', start: 0.6, duur: 1 },
          { type: 'schijn', wie: 'a2', kant: 'rechts' },
        ),
        stap(
          { type: 'pak', wie: 'a1' },
          { type: 'dribbel', wie: 'a2', via: [[13.4, 7.6]], naar: [14.2, 3.4], duur: 1.6, manier: 'sprint' },
          { type: 'loop', wie: 'c2', naar: [15.6, 4.6], manier: 'sprint', start: 0.3, duur: 1.2 },
        ),
        stap({ type: 'dribbel', wie: 'a1', naar: [4.6, 3.4], duur: 1.2 }, { type: 'loop', wie: 'c1', naar: [3.4, 6.2], manier: 'sprint', duur: 1.2 }, { type: 'schot', van: 'a2', naar: [15, 1.2] }),
        stap({ type: 'schot', van: 'a1', naar: [5, 1.2] }),
      ],
    }),
  }),

  // Eigen 2: met je rug naar het goal, draaien en scoren
  o7({
    id: 'veld-o7-draaien-en-scoren',
    naam: 'Draaien en scoren',
    categorieen: ['afwerken'],
    uitleg:
      'Je staat met je rug naar het goal. De trainer speelt de bal naar je toe. Kijk even over je schouder: waar is de verdediger? Draai weg naar de andere kant en schiet in een hoek van het goal!',
    organisatie:
      'E-goal met een net met open hoeken. De aanvallers staan op 9 m van het goal, met hun gezicht naar de trainer op 14 m; de verdedigers 2 m achter hen (veld 16 × 17 m). Station van 15 minuten voor 5 kinderen: twee tweetallen, links en rechts om de beurt. Het vijfde kind haalt de ballen en wisselt na elke beurt in. De trainer roept een naam en "draaien!", en speelt in. Door een gat in de hoek: 3 punten, in het net: 1 punt. Na 3 ballen wisselen aanvaller en verdediger.',
    benodigdheden: ['1 E-goal', '1 net met open hoeken', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 2,
    coachpunten: ['Kijk over je schouder voordat de bal er is', 'Draai weg van de verdediger', 'Na het draaien: meteen schieten'],
    variaties: {
      makkelijker: ['De verdediger blijft staan (alleen in de weg)', 'Eerst stilleggen, dan draaien'],
      moeilijker: ['De verdediger mag meteen meedoen', 'Draai met je eerste aanraking', 'De trainer speelt harder of schuin in'],
    },
    en: {
      naam: 'Turn and score',
      uitleg:
        'You stand with your back to the goal. The coach plays the ball to you. Take a quick look over your shoulder: where is the defender? Turn away to the other side and shoot into a corner of the goal!',
      organisatie:
        'E-goal with a net with open corners. The attackers stand 9 m from the goal, facing the coach 14 m away; the defenders stand 2 m behind them (16 × 17 m area). 15-minute station for 5 children: two pairs, left and right take turns. The fifth child fetches the balls and comes in after every turn. The coach calls a name and "turn!", and plays the ball in. Through a hole in a corner: 3 points, in the net: 1 point. After 3 balls attacker and defender swap.',
      benodigdheden: ['1 E-goal', '1 net with open corners', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Look over your shoulder before the ball arrives', 'Turn away from the defender', 'After turning: shoot straight away'],
      variaties: {
        makkelijker: ['The defender stays where they are (only in the way)', 'Stop the ball first, then turn'],
        moeilijker: ['The defender may join in straight away', 'Turn with your first touch', 'The coach plays the ball in harder or at an angle'],
      },
    },
    tekening: {
      ...leeg(16, 17),
      objecten: [
        eGoal('g1', 8, 1.8),
        net('n1', 'g1', 8, 1.8),
        hoedje('h1', 4, 11.4),
        hoedje('h2', 12, 11.4),
        hoedje('h3', 6.8, 15.6),
        hoedje('h4', 9.2, 15.6),
        trainer(8, 15.4, -90),
        bal('b1', 8, 14.85, 't1'),
        bal('b2', 9, 15.8),
        speler('a1', 1, 5.6, 10.4, { kijkrichting: 90 }),
        B('c1', 2, 4.8, 7.8, { kijkrichting: 90 }),
        speler('a2', 3, 10.4, 10.4, { kijkrichting: 90 }),
        B('c2', 4, 11.2, 7.8, { kijkrichting: 90 }),
        speler('w1', 5, 13.8, 14.4, { kijkrichting: -90 }),
      ],
      animatie: [
        stap({ type: 'pass', van: 't1', naar: 'a1' }),
        stap({ type: 'truc', wie: 'a1', soort: 'buitenkant', voet: 'links', kijk: -50 }, { type: 'loop', wie: 'c1', naar: [5.2, 7.4], manier: 'verdedigend', duur: 0.6 }),
        stap({ type: 'dribbel', wie: 'a1', via: [[7, 8.6]], naar: [7.2, 6.2], duur: 1.4, manier: 'sprint' }, { type: 'loop', wie: 'c1', naar: [5.6, 6], manier: 'sprint', start: 0.3, duur: 1.1 }, { type: 'pak', wie: 't1' }),
        stap({ type: 'schot', van: 'a1', naar: [10.13, 1.3], hoogte: 'laag', eindHoogte: 0.35 }, { type: 'pass', van: 't1', naar: 'a2', start: 0.6 }),
        stap({ type: 'truc', wie: 'a2', soort: 'buitenkant', voet: 'rechts', kijk: -130 }, { type: 'loop', wie: 'c2', naar: [10.8, 7.4], manier: 'verdedigend', duur: 0.6 }),
        stap({ type: 'dribbel', wie: 'a2', via: [[9, 8.6]], naar: [8.8, 6.2], duur: 1.4, manier: 'sprint' }, { type: 'loop', wie: 'c2', naar: [10.4, 6], manier: 'sprint', start: 0.3, duur: 1.1 }),
        stap({ type: 'schot', van: 'a2', naar: [5.87, 1.3], hoogte: 'laag', eindHoogte: 0.35 }),
      ],
    },
  }),

  // Eigen 3: passen door poortjes in tweetallen
  o7({
    id: 'veld-o7-poortjespassen',
    naam: 'Poortjespassen',
    categorieen: ['techniek'],
    uitleg:
      'Jullie zijn een tweetal met één bal. Pass naar elkaar door een poortje: dat is een punt! Daarna kies je snel een ander poortje. Twee keer hetzelfde poortje achter elkaar telt niet. Welk tweetal heeft er na 1 minuut de meeste?',
    organisatie:
      'Vak van 13 × 14 m met 6 poortjes van 2 hoedjes (1,5 m breed) verspreid door het vak. Station van 15 minuten voor 5 kinderen: twee tweetallen en één kind dat met de trainer speelt (na elke ronde wisselt iemand). Elk tweetal heeft één bal. De trainer roept "start!" en na 1 minuut "stop!", en iedereen roept hoeveel poortjes hij had.',
    benodigdheden: ['12 hoedjes', '3 voetballen'],
    spelersNodig: 2,
    coachpunten: ['Kijk waar je maatje is en pass dan', 'Bal aannemen en meteen naar het volgende poortje', 'Is het poortje bezet? Kies een vrij poortje'],
    variaties: {
      makkelijker: ['Grotere poortjes (2,5 m)', 'Eerst de bal stilleggen, dan passen'],
      moeilijker: ['Aannemen met één voet en meteen meenemen', 'Alleen met je zwakke voet passen', 'De trainer is een tikker zonder bal die een poortje dicht kan maken'],
    },
    en: {
      naam: 'Gate passing',
      uitleg:
        'You are a pair with one ball. Pass to each other through a gate: that’s a point! Then quickly choose another gate. The same gate twice in a row doesn’t count. Which pair has the most after 1 minute?',
      organisatie:
        '13 × 14 m area with 6 gates of 2 disc cones (1.5 m wide) spread around the area. 15-minute station for 5 children: two pairs and one child who plays with the coach (someone swaps after every round). Each pair has one ball. The coach calls "go!" and after 1 minute "stop!", and everyone calls out how many gates they had.',
      benodigdheden: ['12 disc cones', '3 footballs'],
      coachpunten: ['See where your partner is and then pass', 'Control the ball and go straight to the next gate', 'Is the gate taken? Choose a free gate'],
      variaties: {
        makkelijker: ['Bigger gates (2.5 m)', 'Stop the ball first, then pass'],
        moeilijker: ['Control with one foot and take it with you straight away', 'Only pass with your weaker foot', 'The coach is a tagger without a ball who can close a gate'],
      },
    },
    tekening: (() => {
      const poortjes = [
        [3.5, 4],
        [9.5, 3.5],
        [6.5, 7],
        [3, 10.5],
        [9.5, 10.5],
        [12, 6.5],
      ];
      return draaiKwart({
        ...leeg(13, 14),
        objecten: [
          ...poortjes.flatMap(([x, y], i) => [hoedje(`p${i}a`, x - 0.75, y, i % 2 ? K.blauw : K.geel), hoedje(`p${i}b`, x + 0.75, y, i % 2 ? K.blauw : K.geel)]),
          speler('a1', 1, 3.5, 1.8, { kijkrichting: 90 }),
          bal('b1', 3.5, 2.35, 'a1'),
          speler('a2', 2, 3.5, 6.4, { kijkrichting: -90 }),
          speler('a3', 3, 9.5, 1.4, { kijkrichting: 90 }),
          bal('b3', 9.5, 1.95, 'a3'),
          speler('a4', 4, 9.5, 5.8, { kijkrichting: -90 }),
          trainer(9.5, 8.6, 90),
          speler('a5', 5, 9.5, 12.6, { kijkrichting: -90 }),
          bal('b5', 9.5, 12.05, 'a5'),
        ],
        animatie: [
          stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'pass', van: 'a3', naar: 'a4' }, { type: 'pass', van: 'a5', naar: 't1' }),
          stap(
            { type: 'dribbel', wie: 'a2', naar: [6.5, 9.2], duur: 1.8 },
            { type: 'loop', wie: 'a1', naar: [6.5, 4.8], duur: 1.8 },
            { type: 'dribbel', wie: 'a4', naar: [12, 8.6], duur: 1.8 },
            { type: 'loop', wie: 'a3', naar: [12, 4.4], duur: 1.8 },
          ),
          stap({ type: 'pass', van: 'a2', naar: 'a1' }, { type: 'pass', van: 'a4', naar: 'a3' }, { type: 'pass', van: 't1', naar: 'a5' }),
        ],
      });
    })(),
  }),
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
