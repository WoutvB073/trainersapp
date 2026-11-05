// Mini Talents 0.30.0, blok Techniek (T1–T17). Draaien: node tools/nieuw/mini-030a.cjs
const { zet } = require('./hulp.cjs');
const { paaltje, pop, horde, pion, pauze } = require('./bouwstenen.cjs');
const { KLEUREN: K, mini, B, hoepel, kaatsbord, pionHoog, pionGroot, tennisbal, leeg, vak, plek, stopBij, kinderen, rondje, allen, trainer, speler, bal, hoedje, stap } = require('./mini-hulp.cjs');

const C = [7, 7];
const R = 3.2;
const VIJF = 'voor 5 kinderen';

const oefeningen = [
  // T1
  mini({
    id: 'veld-mt-verkeerslicht',
    naam: 'Verkeerslicht',
    categorieen: ['techniek'],
    uitleg:
      'Jullie zijn auto’s en de bal is je auto. Bij groen rijd je rond: dribbelen maar! Bij oranje zet je je voet op de bal. Bij rood ga je op je bal zitten. Goed luisteren, hoor!',
    organisatie: `Vak van 12 × 12 m met een hoedje op elke hoek, ${VIJF}, ieder een bal. De trainer staat aan de zijkant en roept groen, oranje of rood. Speel 15 minuten met korte rondes en af en toe een drankpauze.`,
    benodigdheden: ['4 hoedjes', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Bal dicht bij je voet', 'Kijk op: waar is de trainer?'],
    variaties: {
      makkelijker: ['Alleen groen en rood', 'Trainer doet de opdracht voor'],
      moeilijker: ['Blauw erbij: draai om', 'De trainer roept steeds sneller'],
    },
    en: {
      naam: 'Traffic light',
      uitleg: 'You are cars and the ball is your car. On green you drive around: dribble! On orange you put your foot on the ball. On red you sit on your ball. Listen carefully!',
      organisatie: '12 × 12 m area with a disc cone on each corner, for 5 children, each with a ball. The coach stands at the side and calls green, orange or red. Play for 15 minutes in short rounds with the odd drinks break.',
      benodigdheden: ['4 disc cones', '1 football per child'],
      coachpunten: ['Keep the ball close to your foot', 'Look up: where is the coach?'],
      variaties: {
        makkelijker: ['Only green and red', 'The coach shows each task first'],
        moeilijker: ['Add blue: turn around', 'The coach calls faster and faster'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [...vak(12, 12), trainer(7, 13.6, -90), ...kinderen(4, C, R)],
      animatie: [
        rondje(4, C, R, -90, 100, 3),
        allen(4, (w) => ({ type: 'voetOpBal', wie: w, duur: 1.4 })),
        rondje(4, C, R, 10, 100, 3, { spoor: false }),
        allen(4, (w) => ({ type: 'zitten', wie: w, houding: 'op-bal' })),
        pauze(1.2),
        allen(4, (w) => ({ type: 'opstaan', wie: w })),
        rondje(4, C, R, 110, 60, 2, { spoor: false }),
      ],
    },
  }),

  // T2
  mini({
    id: 'veld-mt-hondje-uitlaten',
    naam: 'Hondje uitlaten',
    categorieen: ['techniek'],
    uitleg:
      'Je bal is je hondje. Laat hem niet weglopen: hij blijft dicht bij je! Roept de trainer "zit", dan zet je je voet op de bal. Bij "draai om" ga je de andere kant op. Bij "rennen" loop je samen met je hondje iets sneller.',
    organisatie: `Vak van 12 × 12 m met een hoedje op elke hoek, ${VIJF}, ieder een bal. De trainer roept de commando’s. Speel 15 minuten; laat de kinderen ook zelf een commando bedenken.`,
    benodigdheden: ['4 hoedjes', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Kleine tikjes: je hondje blijft bij je'],
    variaties: {
      makkelijker: ['Alleen "zit" en "rennen"', 'Wandelen in plaats van rennen'],
      moeilijker: ['"Pootje": bal met je andere voet tikken', 'Twee commando’s achter elkaar'],
    },
    en: {
      naam: 'Walking the dog',
      uitleg: 'Your ball is your dog. Don’t let it run away: it stays close to you! When the coach calls "sit", put your foot on the ball. On "turn around" you go the other way. On "run" you and your dog go a bit faster.',
      organisatie: '12 × 12 m area with a disc cone on each corner, for 5 children, each with a ball. The coach calls the commands. Play for 15 minutes; let the children think of a command too.',
      benodigdheden: ['4 disc cones', '1 football per child'],
      coachpunten: ['Small touches: your dog stays close'],
      variaties: {
        makkelijker: ['Only "sit" and "run"', 'Walk instead of running'],
        moeilijker: ['"Paw": touch the ball with your other foot', 'Two commands in a row'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [...vak(12, 12), trainer(7, 13.6, -90), ...kinderen(4, C, R)],
      animatie: [
        rondje(4, C, R, -90, 90, 3.2, { manier: 'wandel' }),
        allen(4, (w) => ({ type: 'voetOpBal', wie: w, duur: 1.3 })),
        allen(4, (w, i) => ({ type: 'draai', wie: w, kijk: 180 + (360 * i) / 4 + 90 })),
        rondje(4, C, R, 0, -90, 3.2, { manier: 'wandel', spoor: false }),
        rondje(4, C, R, -90, -80, 1.9, { spoor: false }),
      ],
    },
  }),

  // T3
  mini({
    id: 'veld-mt-brandweer',
    naam: 'Brandweer',
    categorieen: ['techniek'],
    uitleg: 'Jullie zijn brandweermensen en rijden rustig door de stad. Roept de trainer "brand!", dan rijd je zo snel als je kunt naar een hoepel en stop je je bal erin. Wie staat er het eerst stil?',
    organisatie: `Vak van 12 × 12 m met 5 hoepels aan de randen, ${VIJF}, ieder een bal. Iedereen dribbelt vrij. Op "brand!" stopt ieder de bal in een hoepel. Speel 15 minuten in korte rondes.`,
    benodigdheden: ['5 hoepels', '4 hoedjes', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Stop de bal met je voetzool'],
    variaties: {
      makkelijker: ['Hoepels dichterbij', 'Wandelen naar de hoepel'],
      moeilijker: ['Eén hoepel minder dan kinderen', 'Roep een kleur hoepel'],
    },
    en: {
      naam: 'Fire brigade',
      uitleg: 'You are firefighters driving calmly through the town. When the coach shouts "fire!", drive as fast as you can to a hoop and stop your ball in it. Who is the first to stand still?',
      organisatie: '12 × 12 m area with 5 hoops around the edges, for 5 children, each with a ball. Everyone dribbles freely. On "fire!" each child stops their ball in a hoop. Play for 15 minutes in short rounds.',
      benodigdheden: ['5 hoops', '4 disc cones', '1 football per child'],
      coachpunten: ['Stop the ball with the sole of your foot'],
      variaties: {
        makkelijker: ['Hoops closer by', 'Walk to the hoop'],
        moeilijker: ['One hoop fewer than children', 'Call a hoop colour'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [...vak(12, 12), hoepel('h1', 7, 1.9, K.rood), hoepel('h2', 12.1, 7, K.blauw), hoepel('h3', 7, 12.1, K.geel), hoepel('h4', 1.9, 7, K.groen), trainer(10, 13.4, -110), ...kinderen(4, C, 2.6, -45)],
      animatie: [
        rondje(4, C, 2.6, -45, 90, 3),
        stap(
          { type: 'dribbel', wie: 'a1', naar: stopBij(plek(C, 2.6, 45), [12.1, 7]), manier: 'sprint' },
          { type: 'dribbel', wie: 'a2', naar: stopBij(plek(C, 2.6, 135), [7, 12.1]), manier: 'sprint' },
          { type: 'dribbel', wie: 'a3', naar: stopBij(plek(C, 2.6, 225), [1.9, 7]), manier: 'sprint' },
          { type: 'dribbel', wie: 'a4', naar: stopBij(plek(C, 2.6, 315), [7, 1.9]), manier: 'sprint' },
        ),
        allen(4, (w) => ({ type: 'voetOpBal', wie: w, duur: 1.4 })),
      ],
    },
  }),

  // T4
  mini({
    id: 'veld-mt-kleurenpoortjes',
    naam: 'Kleurenpoortjes',
    categorieen: ['techniek'],
    uitleg: 'Overal staan poortjes in mooie kleuren. Dribbel maar rond. Roept de trainer "rood", dan ga je met je bal door een rood poortje. Daarna luister je weer: welke kleur komt nu?',
    organisatie: `Vak van 12 × 12 m met 4 poortjes van hoedjes (2 m breed), elk poortje een eigen kleur, ${VIJF}, ieder een bal. De trainer roept een kleur. Speel 15 minuten.`,
    benodigdheden: ['8 hoedjes in 4 kleuren', '4 hoedjes voor de hoeken', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Kijk op: waar is jouw kleur?', 'Bal dicht bij je voet door het poortje'],
    variaties: {
      makkelijker: ['Twee kleuren', 'Poortjes breder'],
      moeilijker: ['De trainer roept twee kleuren achter elkaar', 'Poortjes smaller'],
    },
    en: {
      naam: 'Colour gates',
      uitleg: 'There are gates in lovely colours everywhere. Dribble around. When the coach calls "red", take your ball through a red gate. Then listen again: which colour is next?',
      organisatie: '12 × 12 m area with 4 gates of disc cones (2 m wide), each gate its own colour, for 5 children, each with a ball. The coach calls a colour. Play for 15 minutes.',
      benodigdheden: ['8 disc cones in 4 colours', '4 disc cones for the corners', '1 football per child'],
      coachpunten: ['Look up: where is your colour?', 'Keep the ball close through the gate'],
      variaties: {
        makkelijker: ['Two colours', 'Wider gates'],
        moeilijker: ['The coach calls two colours in a row', 'Narrower gates'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [
        ...vak(12, 12),
        hoedje('r1', 6, 3, K.rood),
        hoedje('r2', 8, 3, K.rood),
        hoedje('l1', 11, 6, K.blauw),
        hoedje('l2', 11, 8, K.blauw),
        hoedje('g1', 6, 11, K.geel),
        hoedje('g2', 8, 11, K.geel),
        hoedje('n1', 3, 6, K.groen),
        hoedje('n2', 3, 8, K.groen),
        trainer(10.4, 13.4, -110),
        speler('a1', 1, 6.2, 6, { kijkrichting: -70 }),
        speler('a2', 2, 8.8, 7.2, { kijkrichting: -135 }),
        speler('a3', 3, 5, 8.8, { kijkrichting: 0 }),
        bal('b1', 6.4, 5.5, 'a1'),
        bal('b2', 8.4, 6.8, 'a2'),
        bal('b3', 5.5, 8.8, 'a3'),
      ],
      animatie: [
        // Rood: om de beurt door het rode poortje. Blauw: door het poortje rechts.
        stap({ type: 'dribbel', wie: 'a1', via: [[7, 4]], naar: [7, 1.8], duur: 2 }, { type: 'dribbel', wie: 'a2', naar: [7, 5.4], duur: 2 }, { type: 'dribbel', wie: 'a3', naar: [8.6, 8.8], duur: 2 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [10.2, 1.8], duur: 1.6 }, { type: 'dribbel', wie: 'a2', via: [[7, 3.2]], naar: [7, 1.8], duur: 1.9 }, { type: 'dribbel', wie: 'a3', via: [[10, 7]], naar: [12.3, 7], duur: 2 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [4.2, 1.8], duur: 1.6 }, { type: 'dribbel', wie: 'a3', naar: [12.3, 10], duur: 1.6 }),
      ],
    },
  }),

  // T5
  mini({
    id: 'veld-mt-onder-de-brug',
    naam: 'Onder de brug',
    categorieen: ['techniek'],
    uitleg: 'De horde is een brug. Dribbel ernaartoe en rol je bal er zachtjes onderdoor. Stap zelf over de brug heen en neem je bal weer mee. Lukt het zonder de brug te raken?',
    organisatie: 'Drie banen naast elkaar, in elke baan een hoge horde en op 5 m een pion als start. Voor 5 kinderen, ieder een bal, maximaal 2 per baan. Na de horde dribbel je buitenom terug. Speel 15 minuten.',
    benodigdheden: ['3 hordes', '3 grote pionnen', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Zacht tikken, dan rolt de bal rustig onder de brug'],
    variaties: {
      makkelijker: ['Een lage bal met de hand onder de brug rollen', 'Horde dichtbij de start'],
      moeilijker: ['Twee bruggen achter elkaar', 'Met je andere voet'],
    },
    en: {
      naam: 'Under the bridge',
      uitleg: 'The hurdle is a bridge. Dribble to it and gently roll your ball underneath. Step over the bridge yourself and take your ball with you again. Can you do it without touching the bridge?',
      organisatie: 'Three lanes side by side, each with a high hurdle and a cone as the start 5 m away. For 5 children, each with a ball, at most 2 per lane. After the hurdle, dribble back around the outside. Play for 15 minutes.',
      benodigdheden: ['3 hurdles', '3 large cones', '1 football per child'],
      coachpunten: ['Tap it softly so the ball rolls calmly under the bridge'],
      variaties: {
        makkelijker: ['Roll the ball under the bridge by hand', 'Hurdle closer to the start'],
        moeilijker: ['Two bridges in a row', 'Use your other foot'],
      },
    },
    tekening: {
      ...leeg(12, 11),
      objecten: [
        horde('h1', 2.5, 5, 0),
        horde('h2', 6, 5, 0),
        horde('h3', 9.5, 5, 0),
        pionGroot('p1', 3.4, 9.6),
        pionGroot('p2', 6.9, 9.6),
        pionGroot('p3', 10.4, 9.6),
        speler('a1', 1, 2.5, 9.6, { kijkrichting: -90 }),
        speler('a2', 2, 6, 9.6, { kijkrichting: -90 }),
        speler('a3', 3, 9.5, 9.6, { kijkrichting: -90 }),
        bal('b1', 2.5, 9, 'a1'),
        bal('b2', 6, 9, 'a2'),
        bal('b3', 9.5, 9, 'a3'),
      ],
      animatie: [
        allen(3, (w, i) => ({ type: 'dribbel', wie: w, naar: [[2.5, 6, 9.5][i], 6.8], duur: 2.2, manier: 'wandel' })),
        allen(3, (w, i) => ({ type: 'pass', van: w, naar: [[2.5, 6, 9.5][i], 3.4], onderdoor: `h${i + 1}` })),
        allen(3, (w, i) => ({ type: 'loop', wie: w, naar: [[2.5, 6, 9.5][i], 4], manier: 'hordes', duur: 1.5 })),
        allen(3, (w) => ({ type: 'pak', wie: w })),
        allen(3, (w, i) => ({ type: 'dribbel', wie: w, naar: [[1, 4.5, 8][i], 2.2], duur: 1.3 })),
      ],
    },
  }),

  // T6
  mini({
    id: 'veld-mt-huisjes',
    naam: 'Huisjes',
    categorieen: ['techniek'],
    uitleg: 'Elke hoepel is een huisje. Dribbel lekker rond. Roept de trainer "naar huis!", dan breng je je bal naar een huisje. Maar let op: steeds verdwijnt er een huisje. Dan moet je samen een huisje delen!',
    organisatie: `Vak van 12 × 12 m met 5 hoepels verspreid, ${VIJF}, ieder een bal. Na elke ronde pakt de trainer een hoepel weg, tot er 2 over zijn. Daarna begin je opnieuw. Speel 15 minuten.`,
    benodigdheden: ['5 hoepels', '4 hoedjes', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Kijk op: welk huisje is vrij?', 'Samen delen is goed'],
    variaties: {
      makkelijker: ['Elk kind houdt zijn eigen huisje', 'Wandelen'],
      moeilijker: ['Pak sneller hoepels weg', 'Eerst een rondje om de hoepel en dan erin'],
    },
    en: {
      naam: 'Little houses',
      uitleg: 'Every hoop is a little house. Dribble around. When the coach calls "go home!", take your ball to a house. But watch out: a house disappears each time. Then you have to share a house!',
      organisatie: '12 × 12 m area with 5 hoops spread out, for 5 children, each with a ball. After each round the coach takes one hoop away, until 2 are left. Then start again. Play for 15 minutes.',
      benodigdheden: ['5 hoops', '4 disc cones', '1 football per child'],
      coachpunten: ['Look up: which house is free?', 'Sharing is good'],
      variaties: {
        makkelijker: ['Each child keeps their own house', 'Walk'],
        moeilijker: ['Take hoops away faster', 'First a lap around the hoop, then in'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [...vak(12, 12), hoepel('h1', 3.6, 3.6, K.rood), hoepel('h2', 10.4, 3.6, K.blauw), hoepel('h3', 10.4, 10.4, K.geel), hoepel('h4', 3.6, 10.4, K.groen), trainer(7, 13.5, -90), ...kinderen(4, C, 2.2, -90)],
      animatie: [
        rondje(4, C, 2.2, -90, 80, 2.4),
        // Naar huis: de bal in de hoepel. Kind 1 → blauw, 2 → geel, 3 → groen, 4 → rood.
        stap(
          { type: 'dribbel', wie: 'a1', naar: stopBij(plek(C, 2.2, -10), [10.4, 3.6]), duur: 1.8 },
          { type: 'dribbel', wie: 'a2', naar: stopBij(plek(C, 2.2, 80), [10.4, 10.4]), duur: 1.8 },
          { type: 'dribbel', wie: 'a3', naar: stopBij(plek(C, 2.2, 170), [3.6, 10.4]), duur: 1.8 },
          { type: 'dribbel', wie: 'a4', naar: stopBij(plek(C, 2.2, 260), [3.6, 3.6]), duur: 1.8 },
        ),
        allen(4, (w) => ({ type: 'voetOpBal', wie: w, duur: 1 })),
        // Iedereen dribbelt weer; de trainer haalt het gele huisje weg.
        stap(
          { type: 'dribbel', wie: 'a1', naar: [8.6, 5], duur: 1.8 },
          { type: 'dribbel', wie: 'a2', naar: [8.4, 8.8], duur: 1.8 },
          { type: 'dribbel', wie: 'a3', naar: [5.2, 8.8], duur: 1.8 },
          { type: 'dribbel', wie: 'a4', naar: [5.2, 5], duur: 1.8 },
          { type: 'loop', wie: 't1', naar: [10.4, 11.5], duur: 1.8 },
        ),
        stap({ type: 'pakObject', wie: 't1', object: 'h3' }),
        stap({ type: 'loop', wie: 't1', naar: [12, 12.2], duur: 1 }, { type: 'dribbel', wie: 'a2', naar: stopBij([8.4, 8.8], [3.6, 10.4], 0.85), duur: 2.2 }, { type: 'dribbel', wie: 'a3', naar: [3, 9.6], duur: 1 }),
        stap({ type: 'legObject', wie: 't1', object: 'h3', naar: [12.6, 12.8] }),
      ],
    },
  }),

  // T7
  mini({
    id: 'veld-mt-door-het-bos',
    naam: 'Door het bos',
    categorieen: ['techniek'],
    uitleg: 'De pionnen zijn bomen in het bos. Dribbel tussen de bomen door, kris-kras. Pas op: je mag geen boom raken! Hoeveel bomen kom je langs?',
    organisatie: `Vak van 12 × 12 m met 9 pionnen kris-kras (± 3 m uit elkaar), ${VIJF}, ieder een bal. Iedereen dribbelt tegelijk: niemand staat te wachten. Speel 15 minuten in korte rondes.`,
    benodigdheden: ['9 grote pionnen', '4 hoedjes', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Kleine tikjes tussen de bomen', 'Kijk waar je heen gaat'],
    variaties: {
      makkelijker: ['Minder bomen, meer ruimte', 'Wandelen'],
      moeilijker: ['Meer bomen dichter bij elkaar', 'Alleen met je andere voet'],
    },
    en: {
      naam: 'Through the forest',
      uitleg: 'The cones are trees in the forest. Dribble in and out between the trees. Careful: you mustn’t touch a tree! How many trees can you pass?',
      organisatie: '12 × 12 m area with 9 cones spread out (about 3 m apart), for 5 children, each with a ball. Everyone dribbles at the same time: nobody is waiting. Play for 15 minutes in short rounds.',
      benodigdheden: ['9 large cones', '4 disc cones', '1 football per child'],
      coachpunten: ['Small touches between the trees', 'Look where you are going'],
      variaties: {
        makkelijker: ['Fewer trees, more space', 'Walk'],
        moeilijker: ['More trees closer together', 'Use only your other foot'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [
        ...vak(12, 12),
        ...[[3.5, 3.5], [7, 2.8], [10.5, 3.5], [3, 7], [7, 7], [11, 7], [3.5, 10.5], [7, 11.2], [10.5, 10.5]].map(([x, y], i) => pionGroot(`p${i + 1}`, x, y, i % 2 ? K.blauw : K.oranje)),
        speler('a1', 1, 2, 2, { kijkrichting: 0 }),
        speler('a2', 2, 12, 2, { kijkrichting: 90 }),
        speler('a3', 3, 12, 12, { kijkrichting: 180 }),
        speler('a4', 4, 2, 12, { kijkrichting: -90 }),
        bal('b1', 2.55, 2, 'a1'),
        bal('b2', 12, 2.55, 'a2'),
        bal('b3', 11.45, 12, 'a3'),
        bal('b4', 2, 11.45, 'a4'),
      ],
      animatie: [
        stap(
          { type: 'dribbel', wie: 'a1', via: [[5.2, 2.2], [5.2, 5], [8.8, 5]], naar: [8.8, 2], duur: 6, manier: 'wandel' },
          { type: 'dribbel', wie: 'a2', via: [[12.1, 5.2], [9, 5.4], [9, 8.8]], naar: [12, 8.8], duur: 6, manier: 'wandel' },
          { type: 'dribbel', wie: 'a3', via: [[8.8, 12], [8.8, 9], [5.2, 9]], naar: [5.2, 12], duur: 6, manier: 'wandel' },
          { type: 'dribbel', wie: 'a4', via: [[1.9, 8.8], [5, 8.8], [5, 5.2]], naar: [2, 5.2], duur: 6, manier: 'wandel' },
        ),
      ],
    },
  }),

  // T8
  mini({
    id: 'veld-mt-tik-tak',
    naam: 'Tik-tak',
    categorieen: ['techniek'],
    uitleg: 'Je voeten zijn een klok: tik-tak, tik-tak! Tik de bal zachtjes van je ene voet naar je andere voet. Doe de trainer maar na. Lukt het stilstaand? Probeer het dan al lopend!',
    organisatie: `Kinderen op een rij tegenover de trainer, 2 m uit elkaar, ieder een bal. Eerst stilstaand de trainer nadoen, daarna lopend over 6 m. ${VIJF}; niemand wacht. Speel 15 minuten met pauzes.`,
    benodigdheden: ['2 hoedjes', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Tik met de binnenkant van je voet', 'Zachtjes: de bal blijft tussen je voeten'],
    variaties: {
      makkelijker: ['Eerst bal stil, voet erop om en om', 'Kleinere, zachte bal'],
      moeilijker: ['Tellen: wie haalt er 10?', 'Sneller lopen met tik-tak'],
    },
    en: {
      naam: 'Tick-tock',
      uitleg: 'Your feet are a clock: tick-tock, tick-tock! Tap the ball gently from one foot to the other. Copy the coach. Can you do it standing still? Then try it while walking!',
      organisatie: 'Children in a line facing the coach, 2 m apart, each with a ball. First copy the coach standing still, then walking over 6 m. For 5 children; nobody waits. Play for 15 minutes with breaks.',
      benodigdheden: ['2 disc cones', '1 football per child'],
      coachpunten: ['Tap with the inside of your foot', 'Softly: the ball stays between your feet'],
      variaties: {
        makkelijker: ['First a still ball, feet on it in turns', 'A smaller, softer ball'],
        moeilijker: ['Count: who can get to 10?', 'Walk faster while doing tick-tock'],
      },
    },
    tekening: {
      ...leeg(12, 10),
      objecten: [
        hoedje('h1', 1, 8.6),
        hoedje('h2', 11, 8.6),
        trainer(6, 1.4, 90),
        ...[2.2, 4.7, 7.2, 9.7].flatMap((x, i) => [speler(`a${i + 1}`, i + 1, x, 8.6, { kijkrichting: -90 }), bal(`b${i + 1}`, x, 8.05, `a${i + 1}`)]),
      ],
      animatie: [
        allen(4, (w) => ({ type: 'tiktak', wie: w, duur: 3 })),
        stap(...[2.2, 4.7, 7.2, 9.7].flatMap((x, i) => [{ type: 'tiktak', wie: `a${i + 1}`, duur: 4 }, { type: 'dribbel', wie: `a${i + 1}`, naar: [x, 4.2], duur: 4, manier: 'wandel', spoor: false }])),
      ],
    },
  }),

  // T9
  mini({
    id: 'veld-mt-rondje-pion',
    naam: 'Rondje pion',
    categorieen: ['techniek'],
    uitleg: 'We doen een wedstrijdje! Dribbel zo snel je kunt naar de pion, draai eromheen en kom terug. Tik het volgende kind aan: dan mag die. Welk rijtje is het eerst klaar?',
    organisatie: 'Twee rijtjes van 2–3 kinderen, 3 m uit elkaar, elk een pion op 6 m. Ieder een bal. Het volgende kind start als de eerste terug is. Speel 15 minuten, met steeds een nieuw wedstrijdje.',
    benodigdheden: ['2 grote pionnen', '2 hoedjes', '1 voetbal per kind'],
    spelersNodig: 2,
    coachpunten: ['Rustig om de pion heen, de bal blijft dichtbij'],
    variaties: {
      makkelijker: ['Pion dichterbij', 'Geen wedstrijdje: iedereen op zijn eigen tempo'],
      moeilijker: ['Om twee pionnen', 'Links en rechts om de pion'],
    },
    en: {
      naam: 'Round the cone',
      uitleg: 'Let’s have a race! Dribble as fast as you can to the cone, go around it and come back. Tag the next child: now it’s their turn. Which line finishes first?',
      organisatie: 'Two lines of 2–3 children, 3 m apart, each with a cone 6 m away. Everyone has a ball. The next child starts when the first is back. Play for 15 minutes, with a new race each time.',
      benodigdheden: ['2 large cones', '2 disc cones', '1 football per child'],
      coachpunten: ['Go calmly around the cone, keep the ball close'],
      variaties: {
        makkelijker: ['Cone closer', 'No race: everyone at their own pace'],
        moeilijker: ['Around two cones', 'Go left and right around the cone'],
      },
    },
    tekening: {
      ...leeg(10, 12),
      objecten: [
        pionGroot('p1', 2.5, 2.4, K.rood),
        pionGroot('p2', 7.5, 2.4, K.blauw),
        hoedje('h1', 1, 8.8),
        hoedje('h2', 9, 8.8),
        speler('a1', 1, 0, 0),
        speler('a2', 2, 0, 0),
        B('c1', 3, 0, 0),
        B('c2', 4, 0, 0),
        bal('b1', 0, 0, 'a1'),
        bal('b2', 0, 0, 'a2'),
        bal('b3', 0, 0, 'c1'),
        bal('b4', 0, 0, 'c2'),
      ],
      rijen: [
        { id: 'r1', x: 2.5, y: 9.2, richting: 90, spelers: ['a1', 'a2'] },
        { id: 'r2', x: 7.5, y: 9.2, richting: 90, spelers: ['c1', 'c2'] },
      ],
      animatie: [
        {
          tegelijk: [
            [{ herhaal: { spelers: ['a1', 'a2'], stappen: [{ acties: [{ type: 'dribbel', wie: '@', om: 'p1', naar: [4.2, 8], duur: 4.4 }] }, { acties: [{ type: 'aansluiten', wie: '@', rij: 'r1' }] }] } }],
            [{ herhaal: { spelers: ['c1', 'c2'], stappen: [{ acties: [{ type: 'dribbel', wie: '@', om: 'p2', kant: 'rechts', naar: [5.8, 8], duur: 4.9 }] }, { acties: [{ type: 'aansluiten', wie: '@', rij: 'r2' }] }] } }],
          ],
        },
      ],
    },
  }),

  // T10
  mini({
    id: 'veld-mt-eieren-rapen',
    naam: 'Eieren rapen',
    categorieen: ['techniek'],
    uitleg: 'Op de pionnen liggen eieren: dat zijn de tennisballen. Dribbel met je bal naar een pion, pak een ei en dribbel ermee naar je eigen hoepel. Leg het ei voorzichtig in je nestje. Wie heeft de meeste eieren?',
    organisatie: `Vak van 12 × 12 m, in het midden 6 hoge pionnen met een tennisbal erop, aan de rand voor ieder kind een hoepel. ${VIJF}, ieder een bal. Eén ei per keer. Speel 15 minuten; leg de eieren steeds opnieuw neer.`,
    benodigdheden: ['6 hoge pionnen', '6 tennisballen', '5 hoepels', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Je bal blijft bij je, ook met een ei in je hand'],
    variaties: {
      makkelijker: ['Geen bal: alleen de eieren rapen', 'Pionnen dichterbij'],
      moeilijker: ['Pionnen verder weg', 'Tegen de klok: 1 minuut'],
    },
    en: {
      naam: 'Collecting eggs',
      uitleg: 'There are eggs on the cones: they are the tennis balls. Dribble your ball to a cone, pick up an egg and dribble with it to your own hoop. Put the egg carefully in your nest. Who has the most eggs?',
      organisatie: '12 × 12 m area with 6 tall cones in the middle, each with a tennis ball on top, and a hoop for each child at the edge. For 5 children, each with a ball. One egg at a time. Play for 15 minutes; keep putting the eggs back.',
      benodigdheden: ['6 tall cones', '6 tennis balls', '5 hoops', '1 football per child'],
      coachpunten: ['Your ball stays with you, even with an egg in your hand'],
      variaties: {
        makkelijker: ['No ball: just collect the eggs', 'Cones closer'],
        moeilijker: ['Cones further away', 'Against the clock: 1 minute'],
      },
    },
    tekening: {
      ...leeg(14, 14, 'schuin'),
      objecten: [
        pionHoog('p1', 5, 5.5),
        pionHoog('p2', 9, 5.5),
        pionHoog('p3', 7, 8.5),
        tennisbal('e1', 5, 5.5, 0.76),
        tennisbal('e2', 9, 5.5, 0.76),
        tennisbal('e3', 7, 8.5, 0.76),
        hoepel('h1', 2, 2, K.rood),
        hoepel('h2', 12, 2, K.blauw),
        hoepel('h3', 7, 12.6, K.geel),
        speler('a1', 1, 2.6, 3.4, { kijkrichting: 45 }),
        speler('a2', 2, 11.4, 3.4, { kijkrichting: 135 }),
        speler('a3', 3, 8.6, 12, { kijkrichting: -110 }),
        bal('b1', 3, 3.8, 'a1'),
        bal('b2', 11, 3.8, 'a2'),
        bal('b3', 8.4, 11.5, 'a3'),
      ],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [4.4, 5.1], duur: 1.8 }, { type: 'dribbel', wie: 'a2', naar: [9.6, 5.1], duur: 1.8 }, { type: 'dribbel', wie: 'a3', naar: [7.4, 9.2], duur: 2.2 }),
        stap({ type: 'pakObject', wie: 'a1', object: 'e1' }, { type: 'pakObject', wie: 'a2', object: 'e2' }, { type: 'pakObject', wie: 'a3', object: 'e3' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [2.7, 2.7], duur: 2 }, { type: 'dribbel', wie: 'a2', naar: [11.3, 2.7], duur: 2 }, { type: 'dribbel', wie: 'a3', naar: [7.8, 11.8], duur: 2.2 }),
        stap({ type: 'legObject', wie: 'a1', object: 'e1', naar: [2, 2] }, { type: 'legObject', wie: 'a2', object: 'e2', naar: [12, 2] }, { type: 'legObject', wie: 'a3', object: 'e3', naar: [7, 12.6] }),
      ],
    },
  }),

  // T11
  mini({
    id: 'veld-mt-ladder-en-dribbel',
    naam: 'Ladder en dribbel',
    categorieen: ['techniek'],
    uitleg: 'Eerst zonder bal door de ladder: kleine snelle stapjes! Aan het eind ligt jouw bal. Pak hem met je voet en dribbel om de hoge pion terug. Wie is er weer klaar?',
    organisatie: 'Twee banen naast elkaar: een loopladder, 1 m verder een bal per kind en na 4 m een hoge pion. Voor 5 kinderen, maximaal 2–3 per rij. Na de pion dribbel je terug en leg je de bal neer voor het volgende kind. Speel 15 minuten.',
    benodigdheden: ['2 loopladders', '2 hoge pionnen', '2 voetballen'],
    spelersNodig: 2,
    coachpunten: ['Kleine stapjes in de ladder', 'Rustig om de pion'],
    variaties: {
      makkelijker: ['Elk vakje één stap, wandelend', 'Korte ladder'],
      moeilijker: ['Twee voetjes in elk vakje', 'Links en rechts om de pion'],
    },
    en: {
      naam: 'Ladder and dribble',
      uitleg: 'First go through the ladder without a ball: small, quick steps! Your ball is waiting at the end. Take it with your foot and dribble around the tall cone and back. Who has finished?',
      organisatie: 'Two lanes side by side: a speed ladder, 1 m further on a ball, and 4 m after that a tall cone. For 5 children, at most 2–3 per line. After the cone, dribble back and leave the ball for the next child. Play for 15 minutes.',
      benodigdheden: ['2 speed ladders', '2 tall cones', '2 footballs'],
      coachpunten: ['Small steps in the ladder', 'Go calmly around the cone'],
      variaties: {
        makkelijker: ['One step in each box, walking', 'A shorter ladder'],
        moeilijker: ['Two feet in each box', 'Go left and right around the cone'],
      },
    },
    tekening: {
      ...leeg(10, 15),
      objecten: [
        { id: 'l1', soort: 'ladder', x: 2.6, y: 10.2, lengte: 3 },
        { id: 'l2', soort: 'ladder', x: 7.4, y: 10.2, lengte: 3 },
        bal('b1', 2.6, 7.6),
        bal('b2', 7.4, 7.6),
        pionHoog('p1', 2.6, 2.6),
        pionHoog('p2', 7.4, 2.6),
        speler('a1', 1, 2.6, 12.6, { kijkrichting: -90 }),
        B('c1', 2, 7.4, 12.6, { kijkrichting: -90 }),
      ],
      animatie: [
        stap({ type: 'loop', wie: 'a1', naar: [2.6, 8.2], manier: 'voetenwerk', duur: 3 }, { type: 'loop', wie: 'c1', naar: [7.4, 8.2], manier: 'voetenwerk', duur: 3 }),
        stap({ type: 'pak', wie: 'a1', bal: 'b1' }, { type: 'pak', wie: 'c1', bal: 'b2' }),
        stap({ type: 'dribbel', wie: 'a1', om: 'p1', naar: [4, 7.6], duur: 4.2 }, { type: 'dribbel', wie: 'c1', om: 'p2', kant: 'rechts', naar: [6, 7.6], duur: 4.2 }),
      ],
    },
  }),

  // T12
  mini({
    id: 'veld-mt-poppenslalom',
    naam: 'Poppenslalom',
    categorieen: ['techniek'],
    uitleg: 'Daar staan grote poppen. Dribbel om de poppen heen, eerst langs de ene kant en dan langs de andere kant, net als een slang. Raak ze niet aan!',
    organisatie: 'Twee banen met elk 3 poppen op 2,5 m van elkaar. Voor 5 kinderen, ieder een bal, maximaal 2–3 per rij. Terug dribbel je buitenom. Speel 15 minuten.',
    benodigdheden: ['6 poppen', '2 hoedjes', '1 voetbal per kind'],
    spelersNodig: 2,
    coachpunten: ['Kleine tikjes, met beide voeten'],
    variaties: {
      makkelijker: ['Twee poppen, verder uit elkaar', 'Wandelen'],
      moeilijker: ['Poppen dichter bij elkaar', 'Alleen met je andere voet'],
    },
    en: {
      naam: 'Mannequin slalom',
      uitleg: 'Look at those big mannequins. Dribble around them, first past one side and then the other, like a snake. Don’t touch them!',
      organisatie: 'Two lanes, each with 3 mannequins 2.5 m apart. For 5 children, each with a ball, at most 2–3 per line. Dribble back around the outside. Play for 15 minutes.',
      benodigdheden: ['6 mannequins', '2 disc cones', '1 football per child'],
      coachpunten: ['Small touches, with both feet'],
      variaties: {
        makkelijker: ['Two mannequins, further apart', 'Walk'],
        moeilijker: ['Mannequins closer together', 'Use only your other foot'],
      },
    },
    tekening: {
      ...leeg(12, 13),
      objecten: [
        pop('m1', 3, 8.5),
        pop('m2', 3, 6),
        pop('m3', 3, 3.5),
        pop('m4', 9, 8.5),
        pop('m5', 9, 6),
        pop('m6', 9, 3.5),
        hoedje('h1', 3, 11.8),
        hoedje('h2', 9, 11.8),
        speler('a1', 1, 3, 11.2, { kijkrichting: -90 }),
        B('c1', 2, 9, 11.2, { kijkrichting: -90 }),
        bal('b1', 3, 10.65, 'a1'),
        bal('b2', 9, 10.65, 'c1'),
      ],
      animatie: [
        stap(
          { type: 'dribbel', wie: 'a1', via: [[1.8, 8.5], [4.2, 6], [1.8, 3.5]], naar: [3, 1.6], duur: 7, manier: 'wandel' },
          { type: 'dribbel', wie: 'c1', via: [[10.2, 8.5], [7.8, 6], [10.2, 3.5]], naar: [9, 1.6], duur: 7, manier: 'wandel' },
        ),
      ],
    },
  }),

  // T13
  mini({
    id: 'veld-mt-kaatsbordpassjes',
    naam: 'Kaatsbordpassjes',
    categorieen: ['techniek'],
    uitleg: 'Speel de bal tegen het kaatsbord. Hij komt terug! Stop hem met de onderkant van je voet. Tel maar mee: wie haalt er 5?',
    organisatie: 'Per 2 kinderen een kaatsbord; ieder kind 3 m van het bord, naast elkaar of om de beurt. Voor 5 kinderen 3 kaatsborden. Speel 15 minuten; wissel steeds van voet.',
    benodigdheden: ['3 kaatsborden', '3 hoedjes', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Stop de bal met je voetzool', 'Rustig: zacht spelen'],
    variaties: {
      makkelijker: ['Dichter bij het bord', 'De bal stilleggen en dan pas spelen'],
      moeilijker: ['Verder van het bord', 'Tot 10 tellen'],
    },
    en: {
      naam: 'Rebound board passes',
      uitleg: 'Play the ball against the rebound board. It comes back! Stop it with the bottom of your foot. Count along: who can get to 5?',
      organisatie: 'One rebound board for every 2 children; each child 3 m from the board, side by side or taking turns. For 5 children, 3 rebound boards. Play for 15 minutes; keep changing foot.',
      benodigdheden: ['3 rebound boards', '3 disc cones', '1 football per child'],
      coachpunten: ['Stop the ball with the sole of your foot', 'Stay calm: play it softly'],
      variaties: {
        makkelijker: ['Closer to the board', 'Stop the ball first, then play it'],
        moeilijker: ['Further from the board', 'Count to 10'],
      },
    },
    tekening: {
      ...leeg(12, 9),
      objecten: [
        kaatsbord('k1', 2.5, 2),
        kaatsbord('k2', 6, 2),
        kaatsbord('k3', 9.5, 2),
        hoedje('h1', 1.4, 6.4),
        hoedje('h2', 4.9, 6.4),
        hoedje('h3', 8.4, 6.4),
        speler('a1', 1, 2.5, 6.4, { kijkrichting: -90 }),
        speler('a2', 2, 6, 6.4, { kijkrichting: -90 }),
        speler('a3', 3, 9.5, 6.4, { kijkrichting: -90 }),
        bal('b1', 2.5, 5.85, 'a1'),
        bal('b2', 6, 5.85, 'a2'),
        bal('b3', 9.5, 5.85, 'a3'),
      ],
      animatie: [
        allen(3, (w, i) => ({ type: 'pass', van: w, naar: `k${i + 1}`, terug: w })),
        allen(3, (w) => ({ type: 'voetOpBal', wie: w, duur: 1 })),
        allen(3, (w, i) => ({ type: 'pass', van: w, naar: `k${i + 1}`, terug: w })),
        allen(3, (w) => ({ type: 'voetOpBal', wie: w, duur: 1 })),
      ],
    },
  }),

  // T14
  mini({
    id: 'veld-mt-kleurenpionnen',
    naam: 'Kleurenpionnen',
    categorieen: ['techniek'],
    uitleg: 'Overal staan pionnen in vrolijke kleuren. Roept de trainer "geel", dan dribbel je naar een gele pion en tik je die aan met je bal. Daarna kom je terug in het midden. Welke kleur komt nu?',
    organisatie: `Vak van 12 × 12 m met 4 hoge pionnen in 4 kleuren op de zijden (hoedjes kan ook), ${VIJF}, ieder een bal in het midden. De trainer roept een kleur. Speel 15 minuten.`,
    benodigdheden: ['4 hoge pionnen in 4 kleuren', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Kijk op en luister goed', 'De bal blijft dicht bij je'],
    variaties: {
      makkelijker: ['Twee kleuren', 'Pionnen dichterbij'],
      moeilijker: ['Twee kleuren achter elkaar', 'Tik aan met je andere voet'],
    },
    en: {
      naam: 'Colour cones',
      uitleg: 'There are brightly coloured cones everywhere. When the coach calls "yellow", dribble to a yellow cone and touch it with your ball. Then come back to the middle. Which colour is next?',
      organisatie: '12 × 12 m area with 4 tall cones in 4 colours on the sides (disc cones work too), for 5 children, each with a ball in the middle. The coach calls a colour. Play for 15 minutes.',
      benodigdheden: ['4 tall cones in 4 colours', '1 football per child'],
      coachpunten: ['Look up and listen carefully', 'Keep the ball close to you'],
      variaties: {
        makkelijker: ['Two colours', 'Cones closer'],
        moeilijker: ['Two colours in a row', 'Touch it with your other foot'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [
        pionHoog('p1', 7, 2, K.rood),
        pionHoog('p2', 12, 7, K.blauw),
        pionHoog('p3', 7, 12, K.geel),
        pionHoog('p4', 2, 7, K.groen),
        trainer(10, 13, -110),
        speler('a1', 1, 6, 6, { kijkrichting: -80 }),
        speler('a2', 2, 8.6, 7, { kijkrichting: -110 }),
        speler('a3', 3, 6, 8.4, { kijkrichting: -70 }),
        bal('b1', 6.1, 5.45, 'a1'),
        bal('b2', 8.4, 6.5, 'a2'),
        bal('b3', 6.2, 7.9, 'a3'),
      ],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', via: [[5.6, 2.8]], naar: [6.2, 2.1], duur: 2.6 }, { type: 'dribbel', wie: 'a2', via: [[8.4, 2.8]], naar: [7.8, 2.1], duur: 2.6 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [5.4, 6.4], duur: 2 }, { type: 'dribbel', wie: 'a2', naar: [8.6, 7], duur: 2 }, { type: 'dribbel', wie: 'a3', via: [[3.6, 8.4]], naar: stopBij([3.6, 8.4], [2.2, 7.2], 0.72), duur: 2.2 }),
      ],
    },
  }),

  // T15
  mini({
    id: 'veld-mt-palenpoort',
    naam: 'Palenpoort',
    categorieen: ['techniek'],
    uitleg: 'Twee palen maken samen een tunnel. Dribbel door de tunnel, draai je om en kom weer terug door de tunnel. Hoe vaak lukt het zonder de palen te raken?',
    organisatie: `Drie tunnels van 2 palen (1,5 m breed), per tunnel 1–2 kinderen, ieder een bal. ${VIJF}. Na de tunnel draai je op 2 m en kom je terug. Speel 15 minuten.`,
    benodigdheden: ['6 palen', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Draai met de bal aan je voet'],
    variaties: {
      makkelijker: ['Tunnel breder', 'Wandelen'],
      moeilijker: ['Tunnel smaller', 'Draai met je andere voet'],
    },
    en: {
      naam: 'Pole tunnel',
      uitleg: 'Two poles make a tunnel. Dribble through the tunnel, turn around and come back through it. How many times can you do it without touching the poles?',
      organisatie: 'Three tunnels of 2 poles (1.5 m wide), with 1–2 children per tunnel, each with a ball. For 5 children. After the tunnel, turn 2 m further on and come back. Play for 15 minutes.',
      benodigdheden: ['6 poles', '1 football per child'],
      coachpunten: ['Turn with the ball at your foot'],
      variaties: {
        makkelijker: ['A wider tunnel', 'Walk'],
        moeilijker: ['A narrower tunnel', 'Turn with your other foot'],
      },
    },
    tekening: {
      ...leeg(12, 10),
      objecten: [
        ...[2.5, 6, 9.5].flatMap((x, i) => [paaltje(`q${i}a`, x - 0.85, 5), paaltje(`q${i}b`, x + 0.85, 5)]),
        ...[2.5, 6, 9.5].flatMap((x, i) => [speler(`a${i + 1}`, i + 1, x, 8, { kijkrichting: -90 }), bal(`b${i + 1}`, x, 7.45, `a${i + 1}`)]),
      ],
      animatie: [
        allen(3, (w, i) => ({ type: 'dribbel', wie: w, naar: [[2.5, 6, 9.5][i], 2.6], duur: 2.6 })),
        allen(3, (w) => ({ type: 'draai', wie: w, kijk: 90, duur: 0.7 })),
        allen(3, (w, i) => ({ type: 'dribbel', wie: w, naar: [[2.5, 6, 9.5][i], 8], duur: 2.6 })),
      ],
    },
  }),

  // T16
  mini({
    id: 'veld-mt-hoedjes-omdraaien',
    naam: 'Hoedjes omdraaien',
    categorieen: ['techniek'],
    uitleg: 'We spelen met twee teams. Team rood draait de hoedjes op hun kop. Team blauw draait ze weer terug. Dribbel met je bal naar een hoedje en draai het om. Wie heeft er na 1 minuut de meeste?',
    organisatie: `Vak van 12 × 12 m met 10 hoedjes verspreid: de helft staat op zijn kop. ${VIJF}: 2 tegen 3, ieder een bal; de trainer helpt het kleinste team. Rondes van 1 minuut, tellen en opnieuw. Speel 15 minuten.`,
    benodigdheden: ['10 hoedjes', 'Hesjes', '1 voetbal per kind'],
    spelersNodig: 2,
    coachpunten: ['Bal mee, niet laten liggen', 'Kijk op: waar is een hoedje?'],
    variaties: {
      makkelijker: ['Zonder bal, gewoon lopen', 'Minder hoedjes'],
      moeilijker: ['Alleen omdraaien met je voet', 'Rondes van 30 seconden'],
    },
    en: {
      naam: 'Flipping disc cones',
      uitleg: 'We play in two teams. Team red turns the disc cones upside down. Team blue turns them back. Dribble your ball to a disc cone and flip it. Who has the most after 1 minute?',
      organisatie: '12 × 12 m area with 10 disc cones spread out: half of them are upside down. For 5 children: 2 against 3, each with a ball; the coach helps the smaller team. Rounds of 1 minute, count and start again. Play for 15 minutes.',
      benodigdheden: ['10 disc cones', 'Bibs', '1 football per child'],
      coachpunten: ['Take your ball with you, don’t leave it', 'Look up: where is a disc cone?'],
      variaties: {
        makkelijker: ['No ball, just running', 'Fewer disc cones'],
        moeilijker: ['Flip them using only your foot', 'Rounds of 30 seconds'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [
        ...vak(12, 12),
        hoedje('o1', 4, 4, K.rood),
        hoedje('o2', 10, 4, K.rood),
        hoedje('o3', 4, 10, K.rood),
        hoedje('o4', 10, 10, K.rood),
        speler('a1', 1, 2.4, 2.4, { kijkrichting: 45 }),
        speler('a2', 2, 11.6, 11.6, { kijkrichting: -135 }),
        B('c1', 3, 11.6, 2.4, { kijkrichting: 135 }),
        B('c2', 4, 2.4, 11.6, { kijkrichting: -45 }),
        bal('b1', 2.8, 2.8, 'a1'),
        bal('b2', 11.2, 11.2, 'a2'),
        bal('b3', 11.2, 2.8, 'c1'),
        bal('b4', 2.8, 11.2, 'c2'),
      ],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [3.4, 3.4], duur: 1 }, { type: 'dribbel', wie: 'a2', naar: [10.6, 10.6], duur: 1 }),
        stap({ type: 'keerOm', wie: 'a1', object: 'o1' }, { type: 'keerOm', wie: 'a2', object: 'o4' }),
        stap(
          { type: 'dribbel', wie: 'a1', via: [[6, 2.6]], naar: [9.4, 3.4], duur: 3 },
          { type: 'dribbel', wie: 'a2', via: [[8, 11.4]], naar: [4.6, 10.6], duur: 3 },
          { type: 'dribbel', wie: 'c1', via: [[10.8, 6], [6, 5.6]], naar: [4.6, 4.6], duur: 3 },
          { type: 'dribbel', wie: 'c2', via: [[3.2, 8], [8, 8.4]], naar: [9.4, 9.4], duur: 3 },
        ),
        stap({ type: 'keerOm', wie: 'a1', object: 'o2' }, { type: 'keerOm', wie: 'a2', object: 'o3' }, { type: 'keerOm', wie: 'c1', object: 'o1' }, { type: 'keerOm', wie: 'c2', object: 'o4' }),
      ],
    },
  }),

  // T17
  mini({
    id: 'veld-mt-hoedjes-verzamelen',
    naam: 'Hoedjes verzamelen',
    categorieen: ['techniek'],
    uitleg: 'Overal liggen hoedjes. Dribbel naar een hoedje, pak het op en breng het naar je eigen hoepel. Heb je er veel? Dan breng je ze één voor één weer terug!',
    organisatie: `Vak van 12 × 12 m met 12 hoedjes verspreid, aan de rand voor ieder kind een hoepel. ${VIJF}, ieder een bal. Eerst alle hoedjes verzamelen, daarna één voor één terugbrengen. Speel 15 minuten.`,
    benodigdheden: ['12 hoedjes', '5 hoepels', '1 voetbal per kind'],
    spelersNodig: 1,
    coachpunten: ['Bal aan je voet, hoedje in je hand'],
    variaties: {
      makkelijker: ['Zonder bal', 'Hoedjes dichter bij de hoepel'],
      moeilijker: ['Alleen hoedjes van jouw kleur', 'Tegen de klok'],
    },
    en: {
      naam: 'Collecting disc cones',
      uitleg: 'There are disc cones everywhere. Dribble to a disc cone, pick it up and take it to your own hoop. Got lots of them? Then take them back one at a time!',
      organisatie: '12 × 12 m area with 12 disc cones spread out and a hoop for each child at the edge. For 5 children, each with a ball. First collect all the disc cones, then take them back one at a time. Play for 15 minutes.',
      benodigdheden: ['12 disc cones', '5 hoops', '1 football per child'],
      coachpunten: ['Ball at your foot, disc cone in your hand'],
      variaties: {
        makkelijker: ['No ball', 'Disc cones closer to the hoop'],
        moeilijker: ['Only disc cones in your colour', 'Against the clock'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [
        hoedje('o1', 5, 5, K.rood),
        hoedje('o2', 9, 5, K.blauw),
        hoedje('o3', 7, 9, K.geel),
        hoepel('h1', 2, 2, K.rood),
        hoepel('h2', 12, 2, K.blauw),
        hoepel('h3', 7, 12.6, K.geel),
        speler('a1', 1, 2.6, 3.2, { kijkrichting: 45 }),
        speler('a2', 2, 11.4, 3.2, { kijkrichting: 135 }),
        speler('a3', 3, 8.8, 12, { kijkrichting: -110 }),
        bal('b1', 3, 3.6, 'a1'),
        bal('b2', 11, 3.6, 'a2'),
        bal('b3', 8.6, 11.5, 'a3'),
      ],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [4.4, 4.6], duur: 1.8 }, { type: 'dribbel', wie: 'a2', naar: [9.6, 4.6], duur: 1.8 }, { type: 'dribbel', wie: 'a3', naar: [7.5, 9.7], duur: 2.2 }),
        stap({ type: 'pakObject', wie: 'a1', object: 'o1' }, { type: 'pakObject', wie: 'a2', object: 'o2' }, { type: 'pakObject', wie: 'a3', object: 'o3' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [2.7, 2.7], duur: 2 }, { type: 'dribbel', wie: 'a2', naar: [11.3, 2.7], duur: 2 }, { type: 'dribbel', wie: 'a3', naar: [7.9, 11.8], duur: 2.2 }),
        stap({ type: 'legObject', wie: 'a1', object: 'o1', naar: [2, 2] }, { type: 'legObject', wie: 'a2', object: 'o2', naar: [12, 2] }, { type: 'legObject', wie: 'a3', object: 'o3', naar: [7, 12.6] }),
      ],
    },
  }),
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
