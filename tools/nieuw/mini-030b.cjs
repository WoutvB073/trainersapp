// Mini Talents 0.30.0, blok 1 tegen 1 (D1–D15). Draaien: node tools/nieuw/mini-030b.cjs
const { zet } = require('./hulp.cjs');
const { paaltje, pop, pauze } = require('./bouwstenen.cjs');
const { KLEUREN: K, mini, zone, B, hoepel, kaatsbord, miniGoal, pionGroot, pionHoog, leeg, trainer, speler, bal, hoedje, stap } = require('./mini-hulp.cjs');

const WACHT = 'Voor 5 kinderen: twee spelen tegen elkaar, de anderen wachten in twee rijtjes (maximaal 2 per rij) en zijn na 20 seconden aan de beurt. Speel 15 minuten.';
const WACHT_EN = 'For 5 children: two play each other, the others wait in two short lines (at most 2 per line) and go next after 20 seconds. Play for 15 minutes.';
const cat = ['een-tegen-een'];

/** Twee wachtende kinderen naast het vak. */
const wachtend = (x1, y1, x2, y2) => [speler('w1', 3, x1, y1, { kijkrichting: -90 }), B('w2', 4, x2, y2, { kijkrichting: -90 })];

const oefeningen = [
  // D1
  mini({
    id: 'veld-mt-over-de-rivier',
    naam: 'Over de rivier',
    categorieen: cat,
    uitleg: 'Daar stroomt een rivier met een krokodil! Dribbel met je bal naar de overkant. De krokodil mag alleen in de rivier blijven. Kom je langs de krokodil? Dan ben je veilig aan de overkant.',
    organisatie: `Vak van 10 × 12 m met in het midden een strook van 2 m: de rivier. De verdediger blijft in de rivier. Aanvallers starten om de beurt aan één kant. ${WACHT}`,
    benodigdheden: ['8 hoedjes', 'Hesjes', '1 voetbal per kind'],
    spelersNodig: 2,
    coachpunten: ['Kijk waar de krokodil is en ga de andere kant op'],
    variaties: {
      makkelijker: ['Rivier smaller', 'Krokodil loopt alleen'],
      moeilijker: ['Twee krokodillen', 'Vak smaller'],
    },
    en: {
      naam: 'Across the river',
      uitleg: 'There is a river with a crocodile in it! Dribble your ball to the other side. The crocodile has to stay in the river. Can you get past the crocodile? Then you are safe on the other side.',
      organisatie: `10 × 12 m area with a 2 m strip across the middle: the river. The defender stays in the river. Attackers take turns starting from one side. ${WACHT_EN}`,
      benodigdheden: ['8 disc cones', 'Bibs', '1 football per child'],
      coachpunten: ['See where the crocodile is and go the other way'],
      variaties: {
        makkelijker: ['A narrower river', 'The crocodile only walks'],
        moeilijker: ['Two crocodiles', 'A narrower area'],
      },
    },
    tekening: {
      ...leeg(12, 14),
      objecten: [
        zone('rivier', 6, 7, 10, 2, K.blauw),
        hoedje('h1', 1, 1),
        hoedje('h2', 11, 1),
        hoedje('h3', 1, 13),
        hoedje('h4', 11, 13),
        B('c1', 2, 6, 7, { kijkrichting: 90 }),
        speler('a1', 1, 3.4, 12, { kijkrichting: -90 }),
        speler('a2', 3, 8.6, 12, { kijkrichting: -90 }),
        bal('b1', 3.4, 11.45, 'a1'),
        bal('b2', 8.6, 11.45, 'a2'),
      ],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', via: [[3.2, 9.4], [2, 7]], naar: [3, 2.2], duur: 4.6 }, { type: 'loop', wie: 'c1', naar: [4, 7], manier: 'verdedigend', start: 1, duur: 1.4 }),
        stap({ type: 'dribbel', wie: 'a2', via: [[8.8, 9.4], [10, 7]], naar: [9, 2.2], duur: 4.6 }, { type: 'loop', wie: 'c1', naar: [8, 7], manier: 'verdedigend', start: 0.8, duur: 1.8 }),
      ],
    },
  }),

  // D2
  mini({
    id: 'veld-mt-poortjesduel',
    naam: 'Poortjesduel',
    categorieen: cat,
    uitleg: 'Jullie spelen samen met één bal. Aan elke kant staan twee poortjes. Dribbel met de bal door een poortje van de ander: dan heb je een punt! Krijg je de bal? Dan ga jij scoren.',
    organisatie: `Klein vak van 8 × 10 m met aan beide korte kanten 2 poortjes van hoedjes (1,5 m breed). ${WACHT}`,
    benodigdheden: ['8 hoedjes', '2 voetballen'],
    spelersNodig: 2,
    coachpunten: ['Kies het poortje waar de ander niet staat'],
    variaties: {
      makkelijker: ['Poortjes breder', 'Verdediger begint verder weg'],
      moeilijker: ['Poortjes smaller', 'Eén poortje per kant'],
    },
    en: {
      naam: 'Gate duel',
      uitleg: 'You play together with one ball. There are two gates on each side. Dribble the ball through one of the other child’s gates: that’s a point! Do you get the ball? Then you go and score.',
      organisatie: `Small 8 × 10 m area with 2 gates of disc cones (1.5 m wide) on both short sides. ${WACHT_EN}`,
      benodigdheden: ['8 disc cones', '2 footballs'],
      coachpunten: ['Choose the gate where the other child isn’t'],
      variaties: {
        makkelijker: ['Wider gates', 'The defender starts further away'],
        moeilijker: ['Narrower gates', 'One gate on each side'],
      },
    },
    tekening: {
      ...leeg(10, 12),
      objecten: [
        ...[[2.1, 1.5], [3.6, 1.5], [6.4, 1.5], [7.9, 1.5], [2.1, 10.5], [3.6, 10.5], [6.4, 10.5], [7.9, 10.5]].map(([x, y], i) => hoedje(`h${i + 1}`, x, y, i < 4 ? K.blauw : K.rood)),
        speler('a1', 1, 5, 8.6, { kijkrichting: -90 }),
        B('c1', 2, 6.2, 4.4, { kijkrichting: 100 }),
        bal('b1', 5, 8.05, 'a1'),
      ],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [4.6, 6.6], duur: 1.2 }, { type: 'druk', wie: 'c1', afstand: 2.2, manier: 'verdedigend', duur: 1.2 }),
        stap({ type: 'schijn', wie: 'a1', kant: 'links' }),
        stap({ type: 'dribbel', wie: 'a1', via: [[7, 5.4]], naar: [7.15, 0.8], duur: 2.8, manier: 'sprint' }, { type: 'loop', wie: 'c1', naar: [5.2, 2.6], manier: 'sprint', start: 0.3, duur: 1.8 }),
      ],
    },
  }),

  // D3
  mini({
    id: 'veld-mt-wie-eerst',
    naam: 'Wie eerst?',
    categorieen: cat,
    uitleg: 'Sta klaar in je rijtje naast de trainer. De trainer rolt de bal het veld in. Ren! Wie het eerst bij de bal is, gaat scoren op het goaltje. De ander probeert dat te voorkomen.',
    organisatie: `Twee rijtjes links en rechts naast de trainer, een mini-goaltje op 10 m. De trainer rolt de bal 5 m het veld in. ${WACHT}`,
    benodigdheden: ['1 mini-goaltje', '2 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 2,
    coachpunten: ['Zet je lijf tussen de ander en de bal'],
    variaties: {
      makkelijker: ['Bal dichter bij het goaltje', 'De ander start iets later'],
      moeilijker: ['De trainer rolt schuin', 'Twee goaltjes om uit te kiezen'],
    },
    en: {
      naam: 'Who’s first?',
      uitleg: 'Get ready in your line next to the coach. The coach rolls the ball onto the pitch. Run! The first one to the ball goes and scores in the mini-goal. The other one tries to stop them.',
      organisatie: `Two lines left and right of the coach, a mini-goal 10 m away. The coach rolls the ball 5 m onto the pitch. ${WACHT_EN}`,
      benodigdheden: ['1 mini-goal', '2 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Put your body between the other child and the ball'],
      variaties: {
        makkelijker: ['Ball closer to the mini-goal', 'The other child starts a little later'],
        moeilijker: ['The coach rolls it at an angle', 'Two mini-goals to choose from'],
      },
    },
    tekening: {
      ...leeg(12, 13),
      objecten: [
        miniGoal('g1', 6, 1.2),
        hoedje('h1', 3, 11.8),
        hoedje('h2', 9, 11.8),
        trainer(6, 11.4, -90),
        speler('a1', 1, 3.6, 11, { kijkrichting: -90 }),
        B('c1', 2, 8.4, 11, { kijkrichting: -90 }),
        bal('b1', 6, 10.85, 't1'),
      ],
      animatie: [
        stap(
          { type: 'pass', van: 't1', naar: [5.6, 6.6], worp: 'onderhands', hoogte: 'grond' },
          { type: 'loop', wie: 'a1', naar: [5.3, 7.2], manier: 'sprint', start: 0.3, duur: 1.7 },
          { type: 'loop', wie: 'c1', naar: [7.6, 6.6], manier: 'sprint', start: 0.3, duur: 1.7 },
        ),
        stap({ type: 'pak', wie: 'a1' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [5.6, 3.8], duur: 1.6 }, { type: 'loop', wie: 'c1', naar: [7.5, 3.6], manier: 'sprint', duur: 1.6 }),
        stap({ type: 'schot', van: 'a1', naar: [6, 0.9] }),
      ],
    },
  }),

  // D4
  mini({
    id: 'veld-mt-nummerduel',
    naam: 'Nummerduel',
    categorieen: cat,
    uitleg: 'Iedereen krijgt een nummer. Luister goed! Roept de trainer jouw nummer, dan ren je het veld in. Je speelt 1 tegen 1 met de ander die hetzelfde nummer heeft. Scoor op het goaltje!',
    organisatie: `Veldje van 10 × 12 m met op beide korte kanten een mini-goaltje. De kinderen zitten aan de zijkanten, verdeeld over twee kanten. De trainer roept een nummer en rolt de bal in. ${WACHT}`,
    benodigdheden: ['2 mini-goaltjes', '4 hoedjes', 'Hesjes', '2 voetballen'],
    spelersNodig: 2,
    coachpunten: ['Goed luisteren: ben jij aan de beurt?', 'Durf naar de bal te gaan'],
    variaties: {
      makkelijker: ['Kleurtjes in plaats van nummers', 'Kleiner veldje'],
      moeilijker: ['Twee nummers: 2 tegen 2', 'De trainer gooit de bal hoger'],
    },
    en: {
      naam: 'Number duel',
      uitleg: 'Everyone gets a number. Listen carefully! When the coach calls your number, run onto the pitch. You play 1v1 against the other child with the same number. Score in the mini-goal!',
      organisatie: `10 × 12 m pitch with a mini-goal on both short sides. The children sit along the sides, split over two sides. The coach calls a number and rolls the ball in. ${WACHT_EN}`,
      benodigdheden: ['2 mini-goals', '4 disc cones', 'Bibs', '2 footballs'],
      coachpunten: ['Listen carefully: is it your turn?', 'Be brave and go for the ball'],
      variaties: {
        makkelijker: ['Colours instead of numbers', 'A smaller pitch'],
        moeilijker: ['Two numbers: 2v2', 'The coach throws the ball higher'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [
        miniGoal('g1', 7, 1.2),
        miniGoal('g2', 7, 12.8, 180),
        hoedje('h1', 2, 1),
        hoedje('h2', 12, 1),
        hoedje('h3', 2, 13),
        hoedje('h4', 12, 13),
        trainer(12.6, 3, 150),
        speler('a1', 1, 1.2, 5, { kijkrichting: 0 }),
        speler('a2', 2, 1.2, 7, { kijkrichting: 0 }),
        speler('a3', 3, 1.2, 9, { kijkrichting: 0 }),
        B('c1', 1, 12.8, 5.6, { kijkrichting: 180 }),
        B('c2', 2, 12.8, 7.4, { kijkrichting: 180 }),
        B('c3', 3, 12.8, 9.2, { kijkrichting: 180 }),
        bal('b1', 12.1, 3.2, 't1'),
      ],
      animatie: [
        stap(
          { type: 'pass', van: 't1', naar: [7, 6.6], worp: 'onderhands', hoogte: 'grond' },
          { type: 'loop', wie: 'a2', naar: [6.4, 7], manier: 'sprint', start: 0.2, duur: 1.9 },
          { type: 'loop', wie: 'c2', naar: [9, 7.2], manier: 'sprint', start: 0.2, duur: 1.9 },
        ),
        stap({ type: 'pak', wie: 'a2' }),
        stap({ type: 'dribbel', wie: 'a2', via: [[5.6, 5]], naar: [6.6, 3.4], duur: 2 }, { type: 'loop', wie: 'c2', naar: [8.6, 3.6], manier: 'sprint', duur: 2 }),
        stap({ type: 'schot', van: 'a2', naar: [7, 0.9] }),
      ],
    },
  }),

  // D5
  mini({
    id: 'veld-mt-staart-pakken',
    naam: 'Staart pakken',
    categorieen: cat,
    uitleg: 'Stop een hesje achter in je broek: dat is je staart. Dribbel met je bal weg en pas goed op je staart. De ander probeert je staart te pakken. Is hij gepakt? Dan wisselen jullie!',
    organisatie: `Vak van 10 × 10 m, per tweetal één hesje en één bal. Na elke gepakte staart wisselen. Er kunnen meer tweetallen tegelijk spelen; bij 5 kinderen doet de trainer mee. Speel 15 minuten.`,
    benodigdheden: ['Hesjes', '4 hoedjes', '1 voetbal per tweetal'],
    spelersNodig: 2,
    coachpunten: ['Blijf bewegen en houd de ander in de gaten'],
    variaties: {
      makkelijker: ['Staart pakken zonder bal', 'Groter vak'],
      moeilijker: ['Pakker heeft ook een bal', 'Kleiner vak'],
    },
    en: {
      naam: 'Catch the tail',
      uitleg: 'Tuck a bib into the back of your shorts: that’s your tail. Dribble your ball away and look after your tail. The other child tries to grab it. Got it? Then you swap!',
      organisatie: '10 × 10 m area, one bib and one ball per pair. Swap after every tail is caught. Several pairs can play at once; with 5 children the coach joins in. Play for 15 minutes.',
      benodigdheden: ['Bibs', '4 disc cones', '1 football per pair'],
      coachpunten: ['Keep moving and keep an eye on the other child'],
      variaties: {
        makkelijker: ['Catch the tail without a ball', 'A bigger area'],
        moeilijker: ['The catcher has a ball too', 'A smaller area'],
      },
    },
    tekening: {
      ...leeg(12, 12),
      objecten: [
        hoedje('h1', 1, 1),
        hoedje('h2', 11, 1),
        hoedje('h3', 1, 11),
        hoedje('h4', 11, 11),
        speler('a1', 1, 4, 8, { kijkrichting: -45 }),
        B('c1', 2, 2.2, 9.6, { kijkrichting: -45 }),
        bal('b1', 4.4, 7.6, 'a1'),
        { id: 's1', soort: 'hesje', x: 4, y: 8, drager: 'a1', kleur: K.geel },
      ],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', via: [[6.4, 5.4]], naar: [8.6, 5.2], duur: 3, spoor: true }, { type: 'loop', wie: 'c1', via: [[4.4, 7]], naar: [7.2, 5.6], duur: 3 }),
        stap({ type: 'pakObject', wie: 'c1', object: 's1' }),
        pauze(0.6),
      ],
    },
  }),

  // D6
  mini({
    id: 'veld-mt-pion-omschieten',
    naam: 'Pion omschieten',
    categorieen: cat,
    uitleg: 'Jij hebt een eigen pion en de ander ook. Bescherm je pion! Probeer met de bal de pion van de ander om te schieten. Valt hij om? Dan heb je een punt.',
    organisatie: `Twee hoge pionnen op 10 m van elkaar, elk kind verdedigt zijn eigen pion. Na een punt zet de ander de pion terug. ${WACHT}`,
    benodigdheden: ['2 hoge pionnen', '4 hoedjes', '2 voetballen'],
    spelersNodig: 2,
    coachpunten: ['Schiet als je vrij staat'],
    variaties: {
      makkelijker: ['Grotere pion', 'Pionnen dichterbij'],
      moeilijker: ['Pionnen verder weg', 'Eerst langs de ander dribbelen'],
    },
    en: {
      naam: 'Knock down the cone',
      uitleg: 'You have your own cone and so does the other child. Protect your cone! Try to knock over the other child’s cone with the ball. Did it fall? That’s a point.',
      organisatie: `Two tall cones 10 m apart, each child defends their own cone. After a point, the other child stands the cone back up. ${WACHT_EN}`,
      benodigdheden: ['2 tall cones', '4 disc cones', '2 footballs'],
      coachpunten: ['Shoot when you’re free'],
      variaties: {
        makkelijker: ['A bigger cone', 'Cones closer together'],
        moeilijker: ['Cones further apart', 'Dribble past the other child first'],
      },
    },
    tekening: {
      ...leeg(10, 13),
      objecten: [pionHoog('p1', 5, 11.6, K.rood), pionHoog('p2', 5, 1.4, K.blauw), speler('a1', 1, 4, 9, { kijkrichting: -90 }), B('c1', 2, 5.6, 4.6, { kijkrichting: 90 }), bal('b1', 4, 8.45, 'a1')],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [3, 6], duur: 1.8 }, { type: 'loop', wie: 'c1', naar: [5.6, 5.2], manier: 'verdedigend', duur: 1.2 }),
        stap({ type: 'schot', van: 'a1', naar: [5, 1.75], hoogte: 'grond' }),
        stap({ type: 'valOm', object: 'p2', hoek: -80 }),
        stap({ type: 'loop', wie: 'c1', naar: [5.9, 2.2], duur: 1.7 }),
        stap({ type: 'zetOp', wie: 'c1', object: 'p2' }),
      ],
    },
  }),

  // D7
  mini({
    id: 'veld-mt-rug-tegen-rug',
    naam: 'Rug tegen rug',
    categorieen: cat,
    uitleg: 'Ga met je rug tegen de rug van de ander staan. De trainer gooit de bal. Draai je snel om en ren naar de bal! Wie hem heeft, probeert te scoren op het goaltje.',
    organisatie: `Twee kinderen rug tegen rug op 6 m voor een mini-goaltje. De trainer staat ernaast en gooit de bal in. ${WACHT}`,
    benodigdheden: ['1 mini-goaltje', '2 hoedjes', 'Voetballen'],
    spelersNodig: 2,
    coachpunten: ['Snel omdraaien en kijken waar de bal is'],
    variaties: {
      makkelijker: ['Trainer roept "nu!"', 'Bal dichterbij gooien'],
      moeilijker: ['Bal hoger gooien', 'Zitten in plaats van staan'],
    },
    en: {
      naam: 'Back to back',
      uitleg: 'Stand with your back against the other child’s back. The coach throws the ball. Turn around quickly and run to the ball! Whoever gets it tries to score in the mini-goal.',
      organisatie: `Two children back to back, 6 m in front of a mini-goal. The coach stands to one side and throws the ball in. ${WACHT_EN}`,
      benodigdheden: ['1 mini-goal', '2 disc cones', 'Footballs'],
      coachpunten: ['Turn quickly and see where the ball is'],
      variaties: {
        makkelijker: ['The coach calls "now!"', 'Throw the ball closer'],
        moeilijker: ['Throw the ball higher', 'Sit down instead of standing'],
      },
    },
    tekening: {
      ...leeg(12, 11),
      objecten: [miniGoal('g1', 6, 1), hoedje('h1', 3.8, 7.4), hoedje('h2', 8.2, 7.4), trainer(10.4, 7, 180), speler('a1', 1, 5.7, 7, { kijkrichting: 180 }), B('c1', 2, 6.3, 7, { kijkrichting: 0 }), bal('b1', 9.85, 7, 't1')],
      animatie: [
        pauze(0.7),
        stap({ type: 'pass', van: 't1', naar: [7.4, 4.2], worp: 'onderhands', hoogte: 1.2 }, { type: 'draai', wie: 'a1', naar: 't1', start: 0.5 }, { type: 'draai', wie: 'c1', naar: 't1', start: 0.5 }),
        stap({ type: 'loop', wie: 'a1', naar: [6.9, 4.7], manier: 'sprint', duur: 1.1 }, { type: 'loop', wie: 'c1', naar: [8.8, 5.2], manier: 'sprint', duur: 1.1 }),
        stap({ type: 'pak', wie: 'a1' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [6.2, 3], duur: 1.2 }, { type: 'loop', wie: 'c1', naar: [8.2, 3], manier: 'sprint', duur: 1.2 }),
        stap({ type: 'schot', van: 'a1', naar: [6, 0.7] }),
      ],
    },
  }),

  // D8
  mini({
    id: 'veld-mt-bal-beschermen',
    naam: 'Bal beschermen',
    categorieen: cat,
    uitleg: 'De bal is jouw schat. Zet je lijf ertussen en houd de bal 20 tellen bij je! De ander probeert de bal weg te tikken. Lukt het? Tel mee: 1, 2, 3 …',
    organisatie: `Klein vak van 5 × 5 m. De trainer telt tot 20; daarna wisselen. ${WACHT}`,
    benodigdheden: ['4 hoedjes', '1 voetbal'],
    spelersNodig: 2,
    coachpunten: ['Je lijf staat tussen de ander en de bal'],
    variaties: {
      makkelijker: ['Tot 10 tellen', 'Vak groter'],
      moeilijker: ['Vak kleiner', 'Tot 30 tellen'],
    },
    en: {
      naam: 'Shield the ball',
      uitleg: 'The ball is your treasure. Put your body in the way and keep the ball for 20 seconds! The other child tries to knock it away. Can you do it? Count along: 1, 2, 3 …',
      organisatie: `Small 5 × 5 m area. The coach counts to 20, then swap. ${WACHT_EN}`,
      benodigdheden: ['4 disc cones', '1 football'],
      coachpunten: ['Your body is between the other child and the ball'],
      variaties: {
        makkelijker: ['Count to 10', 'A bigger area'],
        moeilijker: ['A smaller area', 'Count to 30'],
      },
    },
    tekening: {
      ...leeg(8, 8, 'schuin'),
      objecten: [zone('vak', 4, 4, 5, 5), hoedje('h1', 1.5, 1.5), hoedje('h2', 6.5, 1.5), hoedje('h3', 1.5, 6.5), hoedje('h4', 6.5, 6.5), speler('a1', 1, 3.4, 4.6, { kijkrichting: 180 }), B('c1', 2, 5.2, 4.6, { kijkrichting: 180 }), bal('b1', 2.85, 4.6, 'a1')],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [3, 3.2], duur: 1.4, manier: 'wandel' }, { type: 'loop', wie: 'c1', naar: [4.7, 3.8], manier: 'verdedigend', duur: 1.4 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [3.6, 2.4], duur: 1.2, manier: 'wandel' }, { type: 'loop', wie: 'c1', naar: [4.6, 4], manier: 'verdedigend', duur: 1.2 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [2.6, 3.4], duur: 1.4, manier: 'wandel' }, { type: 'loop', wie: 'c1', naar: [4.4, 3.4], manier: 'verdedigend', duur: 1.4 }),
      ],
    },
  }),

  // D9
  mini({
    id: 'veld-mt-achtervolging',
    naam: 'Achtervolging',
    categorieen: cat,
    uitleg: 'Dribbel zo snel je kunt naar het goaltje en scoor. Pas op: de ander start 2 meter achter je en probeert je in te halen. Wie is het snelst?',
    organisatie: `Mini-goaltje op 10 m, de aanvaller start 2 m voor de verdediger. Daarna wisselen ze. ${WACHT}`,
    benodigdheden: ['1 mini-goaltje', '2 hoedjes', 'Voetballen'],
    spelersNodig: 2,
    coachpunten: ['Kijk op voor je schiet'],
    variaties: {
      makkelijker: ['Aanvaller start verder voor', 'Goaltje dichterbij'],
      moeilijker: ['Verdediger start dichterbij', 'Verder van het goaltje'],
    },
    en: {
      naam: 'The chase',
      uitleg: 'Dribble as fast as you can to the mini-goal and score. Careful: the other child starts 2 metres behind you and tries to catch you. Who is fastest?',
      organisatie: `Mini-goal 10 m away, the attacker starts 2 m in front of the defender. Then they swap. ${WACHT_EN}`,
      benodigdheden: ['1 mini-goal', '2 disc cones', 'Footballs'],
      coachpunten: ['Look up before you shoot'],
      variaties: {
        makkelijker: ['The attacker starts further ahead', 'Mini-goal closer'],
        moeilijker: ['The defender starts closer', 'Further from the mini-goal'],
      },
    },
    tekening: {
      ...leeg(10, 14),
      objecten: [miniGoal('g1', 5, 1.2), hoedje('h1', 4, 11), hoedje('h2', 6.4, 13), speler('a1', 1, 5, 11, { kijkrichting: -90 }), B('c1', 2, 5.8, 13, { kijkrichting: -90 }), bal('b1', 5, 10.45, 'a1')],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [5, 4.4], duur: 3.2, manier: 'sprint' }, { type: 'loop', wie: 'c1', via: [[6.8, 9]], naar: [6.6, 4.8], duur: 3.2, manier: 'sprint' }),
        stap({ type: 'schot', van: 'a1', naar: [5, 0.9] }),
      ],
    },
  }),

  // D10
  mini({
    id: 'veld-mt-koning-in-het-vak',
    naam: 'Koning in het vak',
    categorieen: cat,
    uitleg: 'Dit vak is jouw koninkrijk. Dribbel de bal over de lijn van de ander en stop hem daar: dan heb je een punt! Na elk punt komt er een nieuw tweetal in het vak.',
    organisatie: `Klein vak van 6 × 8 m. Punt als je de bal achter de lijn van de ander stopt. Na elk punt een nieuw tweetal. ${WACHT}`,
    benodigdheden: ['4 hoedjes', '2 voetballen'],
    spelersNodig: 2,
    coachpunten: ['Stop de bal met je voetzool'],
    variaties: {
      makkelijker: ['Vak breder', 'Verdediger begint achter de lijn'],
      moeilijker: ['Vak smaller', 'Alleen scoren met je andere voet'],
    },
    en: {
      naam: 'King in the area',
      uitleg: 'This area is your kingdom. Dribble the ball over the other child’s line and stop it there: that’s a point! After each point, a new pair comes into the area.',
      organisatie: `Small 6 × 8 m area. A point when you stop the ball behind the other child’s line. A new pair after every point. ${WACHT_EN}`,
      benodigdheden: ['4 disc cones', '2 footballs'],
      coachpunten: ['Stop the ball with the sole of your foot'],
      variaties: {
        makkelijker: ['A wider area', 'The defender starts behind the line'],
        moeilijker: ['A narrower area', 'Only score with your other foot'],
      },
    },
    tekening: {
      ...leeg(10, 12),
      objecten: [zone('vak', 5, 6, 6, 8), hoedje('h1', 2, 2), hoedje('h2', 8, 2), hoedje('h3', 2, 10), hoedje('h4', 8, 10), speler('a1', 1, 5, 9, { kijkrichting: -90 }), B('c1', 2, 6.2, 4, { kijkrichting: 100 }), bal('b1', 5, 8.45, 'a1'), ...wachtend(1, 7, 9, 7)],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [4.6, 7], duur: 1.3 }, { type: 'druk', wie: 'c1', afstand: 2.2, manier: 'verdedigend', duur: 1.3 }),
        stap({ type: 'schijn', wie: 'a1', kant: 'rechts' }),
        stap({ type: 'dribbel', wie: 'a1', via: [[3, 5.4]], naar: [3.2, 2.2], duur: 2.4, manier: 'sprint' }, { type: 'loop', wie: 'c1', naar: [4.8, 3.2], manier: 'sprint', duur: 1.8 }),
        stap({ type: 'voetOpBal', wie: 'a1', duur: 1.2 }),
      ],
    },
  }),

  // D11
  mini({
    id: 'veld-mt-paalduel',
    naam: 'Paalduel',
    categorieen: cat,
    uitleg: 'Jij hebt een paal en de ander ook. Pas op je paal! Probeer met de bal de paal van de ander te raken. Raak? Dan heb je een punt.',
    organisatie: `Twee palen of poppen op 8 m van elkaar in een vak van 8 × 10 m. Elk kind verdedigt zijn eigen paal. ${WACHT}`,
    benodigdheden: ['2 palen of 2 poppen', '4 hoedjes', '2 voetballen'],
    spelersNodig: 2,
    coachpunten: ['Kijk waar de paal staat en mik goed'],
    variaties: {
      makkelijker: ['Pop in plaats van paal', 'Dichterbij'],
      moeilijker: ['Verder weg', 'Alleen raken na een dribbel langs de ander'],
    },
    en: {
      naam: 'Pole duel',
      uitleg: 'You have a pole and so does the other child. Look after your pole! Try to hit the other child’s pole with the ball. A hit? That’s a point.',
      organisatie: `Two poles or mannequins 8 m apart in an 8 × 10 m area. Each child defends their own pole. ${WACHT_EN}`,
      benodigdheden: ['2 poles or 2 mannequins', '4 disc cones', '2 footballs'],
      coachpunten: ['See where the pole is and aim carefully'],
      variaties: {
        makkelijker: ['A mannequin instead of a pole', 'Closer'],
        moeilijker: ['Further away', 'Only hit it after dribbling past the other child'],
      },
    },
    tekening: {
      ...leeg(10, 12),
      objecten: [pop('m1', 5, 10), pop('m2', 5, 2), hoedje('h1', 1, 1), hoedje('h2', 9, 1), hoedje('h3', 1, 11), hoedje('h4', 9, 11), speler('a1', 1, 3.6, 8, { kijkrichting: -80 }), B('c1', 2, 6.4, 4.4, { kijkrichting: 100 }), bal('b1', 3.7, 7.45, 'a1')],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [3.2, 5.2], duur: 1.8 }, { type: 'loop', wie: 'c1', naar: [5.8, 3.6], manier: 'verdedigend', duur: 1.4 }),
        stap({ type: 'pass', van: 'a1', naar: 'm2', terug: [2.6, 3] }),
        pauze(0.5),
      ],
    },
  }),

  // D12
  mini({
    id: 'veld-mt-kaatsbordstart',
    naam: 'Kaatsbordstart',
    categorieen: cat,
    uitleg: 'Speel de bal tegen het kaatsbord. Komt hij terug? Dan komt de ander vanaf de zijkant op je af. Dribbel langs en scoor in het goaltje!',
    organisatie: `Kaatsbord op 4 m van de aanvaller, mini-goaltje achter hem op 7 m. De verdediger start aan de zijkant op 5 m. ${WACHT}`,
    benodigdheden: ['1 kaatsbord', '1 mini-goaltje', '2 hoedjes', 'Voetballen'],
    spelersNodig: 2,
    coachpunten: ['Neem de bal goed aan en kijk op'],
    variaties: {
      makkelijker: ['Verdediger start later', 'Goaltje dichterbij'],
      moeilijker: ['Verdediger start dichterbij', 'Bal in één keer meenemen'],
    },
    en: {
      naam: 'Rebound board start',
      uitleg: 'Play the ball against the rebound board. Does it come back? Then the other child comes at you from the side. Dribble past and score in the mini-goal!',
      organisatie: `Rebound board 4 m from the attacker, mini-goal 7 m behind them. The defender starts at the side, 5 m away. ${WACHT_EN}`,
      benodigdheden: ['1 rebound board', '1 mini-goal', '2 disc cones', 'Footballs'],
      coachpunten: ['Control the ball well and look up'],
      variaties: {
        makkelijker: ['The defender starts later', 'Mini-goal closer'],
        moeilijker: ['The defender starts closer', 'Take the ball with your first touch'],
      },
    },
    tekening: {
      ...leeg(12, 14),
      objecten: [kaatsbord('k1', 6, 1.4), miniGoal('g1', 6, 12.6, 180), hoedje('h1', 5, 5.4), hoedje('h2', 11, 5.4), speler('a1', 1, 6, 5.4, { kijkrichting: -90 }), B('c1', 2, 11, 6, { kijkrichting: 180 }), bal('b1', 6, 4.85, 'a1')],
      animatie: [
        stap({ type: 'pass', van: 'a1', naar: 'k1', terug: 'a1' }, { type: 'loop', wie: 'c1', naar: [8.8, 6.4], start: 1.1, duur: 1.2, manier: 'verdedigend' }),
        stap({ type: 'draai', wie: 'a1', kijk: 90 }),
        stap({ type: 'dribbel', wie: 'a1', via: [[4.6, 7.6]], naar: [5.4, 10.2], duur: 2.6 }, { type: 'loop', wie: 'c1', naar: [7.6, 10.2], manier: 'sprint', duur: 2.6 }),
        stap({ type: 'schot', van: 'a1', naar: [6, 12.9] }),
      ],
    },
  }),

  // D13
  mini({
    id: 'veld-mt-hoepelkasteel',
    naam: 'Hoepelkasteel',
    categorieen: cat,
    uitleg: 'Je hoepel is je kasteel. Pas er goed op! Dribbel naar het kasteel van de ander en leg de bal stil in de hoepel. Dan heb je het kasteel veroverd!',
    organisatie: `Twee hoepels op 8 m van elkaar in een vak van 8 × 10 m. Elk kind verdedigt zijn hoepel. ${WACHT}`,
    benodigdheden: ['2 hoepels', '4 hoedjes', '2 voetballen'],
    spelersNodig: 2,
    coachpunten: ['Stop de bal in de hoepel met je voetzool'],
    variaties: {
      makkelijker: ['Hoepels dichterbij', 'Verdediger staat stil'],
      moeilijker: ['Hoepels verder weg', 'Twee hoepels per kind'],
    },
    en: {
      naam: 'Hoop castle',
      uitleg: 'Your hoop is your castle. Guard it well! Dribble to the other child’s castle and stop the ball in the hoop. Then you have captured the castle!',
      organisatie: `Two hoops 8 m apart in an 8 × 10 m area. Each child defends their hoop. ${WACHT_EN}`,
      benodigdheden: ['2 hoops', '4 disc cones', '2 footballs'],
      coachpunten: ['Stop the ball in the hoop with the sole of your foot'],
      variaties: {
        makkelijker: ['Hoops closer', 'The defender stands still'],
        moeilijker: ['Hoops further apart', 'Two hoops per child'],
      },
    },
    tekening: {
      ...leeg(10, 12),
      objecten: [hoepel('h1', 5, 10, K.rood), hoepel('h2', 5, 2, K.blauw), hoedje('c1h', 1, 1), hoedje('c2h', 9, 1), hoedje('c3h', 1, 11), hoedje('c4h', 9, 11), speler('a1', 1, 5, 8, { kijkrichting: -90 }), B('c1', 2, 5.6, 4.2, { kijkrichting: 90 }), bal('b1', 5, 7.45, 'a1')],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [4.4, 6.4], duur: 1.2 }),
        stap({ type: 'schijn', wie: 'a1', kant: 'rechts' }),
        stap({ type: 'dribbel', wie: 'a1', via: [[3, 4.4]], naar: [4.56, 2.44], duur: 2.6 }, { type: 'loop', wie: 'c1', naar: [6.4, 3.2], manier: 'verdedigend', duur: 2.2 }),
        stap({ type: 'voetOpBal', wie: 'a1', duur: 1.2 }),
      ],
    },
  }),

  // D14
  mini({
    id: 'veld-mt-ladderstart',
    naam: 'Ladderstart',
    categorieen: cat,
    uitleg: 'Klaar voor de start? Ga allebei door de loopladder met kleine stapjes. Aan het eind rolt de trainer de bal in. Wie is er het eerst? Speel 1 tegen 1 op het goaltje!',
    organisatie: `Twee loopladders naast elkaar, 2 m uit elkaar, mini-goaltje op 7 m. De trainer rolt de bal in als de kinderen uit de ladder komen. ${WACHT}`,
    benodigdheden: ['2 loopladders', '1 mini-goaltje', 'Voetballen'],
    spelersNodig: 2,
    coachpunten: ['Snelle voetjes in de ladder'],
    variaties: {
      makkelijker: ['Korte ladder', 'Bal dichterbij rollen'],
      moeilijker: ['Zijwaarts door de ladder', 'Twee goaltjes'],
    },
    en: {
      naam: 'Ladder start',
      uitleg: 'Ready to go? Both of you go through the speed ladder with small steps. At the end, the coach rolls the ball in. Who gets there first? Play 1v1 on the mini-goal!',
      organisatie: `Two speed ladders side by side, 2 m apart, mini-goal 7 m away. The coach rolls the ball in as the children come out of the ladder. ${WACHT_EN}`,
      benodigdheden: ['2 speed ladders', '1 mini-goal', 'Footballs'],
      coachpunten: ['Quick feet in the ladder'],
      variaties: {
        makkelijker: ['A short ladder', 'Roll the ball closer'],
        moeilijker: ['Go through the ladder sideways', 'Two mini-goals'],
      },
    },
    tekening: {
      ...leeg(12, 15),
      objecten: [
        { id: 'l1', soort: 'ladder', x: 4.4, y: 11.4, lengte: 3 },
        { id: 'l2', soort: 'ladder', x: 7.6, y: 11.4, lengte: 3 },
        miniGoal('g1', 6, 1.2),
        trainer(10.6, 8.6, 180),
        speler('a1', 1, 4.4, 13.6, { kijkrichting: -90 }),
        B('c1', 2, 7.6, 13.6, { kijkrichting: -90 }),
        bal('b1', 10.05, 8.6, 't1'),
      ],
      animatie: [
        stap({ type: 'loop', wie: 'a1', naar: [4.4, 9.4], manier: 'voetenwerk', duur: 3 }, { type: 'loop', wie: 'c1', naar: [7.6, 9.4], manier: 'voetenwerk', duur: 3 }),
        stap({ type: 'pass', van: 't1', naar: [5.6, 6.4], worp: 'onderhands', hoogte: 'grond' }, { type: 'loop', wie: 'a1', naar: [5, 7], manier: 'sprint', duur: 1.2 }, { type: 'loop', wie: 'c1', naar: [7.4, 6.6], manier: 'sprint', duur: 1.2 }),
        stap({ type: 'pak', wie: 'a1' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [5.6, 3.6], duur: 1.6 }, { type: 'loop', wie: 'c1', naar: [7.6, 3.6], manier: 'sprint', duur: 1.6 }),
        stap({ type: 'schot', van: 'a1', naar: [6, 0.9] }),
      ],
    },
  }),

  // D15
  mini({
    id: 'veld-mt-tussen-de-poppen',
    naam: 'Tussen de poppen',
    categorieen: cat,
    uitleg: 'Twee poppen staan als een poort. Dribbel langs de ander en ga tussen de poppen door. Lukt het? Dan heb je gewonnen!',
    organisatie: `Twee poppen op 3 m van elkaar als poort, de verdediger staat 4 m ervoor. De aanvaller start op 8 m. ${WACHT}`,
    benodigdheden: ['2 poppen', '2 hoedjes', 'Voetballen'],
    spelersNodig: 2,
    coachpunten: ['Maak een schijnbeweging en ga dan snel'],
    variaties: {
      makkelijker: ['Poppen verder uit elkaar', 'Verdediger loopt alleen'],
      moeilijker: ['Poppen dichter bij elkaar', 'Verdediger start dichter bij de aanvaller'],
    },
    en: {
      naam: 'Between the mannequins',
      uitleg: 'Two mannequins make a gate. Dribble past the other child and go between the mannequins. Can you do it? Then you’ve won!',
      organisatie: `Two mannequins 3 m apart as a gate, the defender 4 m in front of it. The attacker starts 8 m away. ${WACHT_EN}`,
      benodigdheden: ['2 mannequins', '2 disc cones', 'Footballs'],
      coachpunten: ['Do a feint, then go quickly'],
      variaties: {
        makkelijker: ['Mannequins further apart', 'The defender only walks'],
        moeilijker: ['Mannequins closer together', 'The defender starts closer to the attacker'],
      },
    },
    tekening: {
      ...leeg(10, 13),
      objecten: [pop('m1', 3.5, 2), pop('m2', 6.5, 2), hoedje('h1', 4, 11), hoedje('h2', 6, 11), speler('a1', 1, 5, 10.4, { kijkrichting: -90 }), B('c1', 2, 6, 6, { kijkrichting: 100 }), bal('b1', 5, 9.85, 'a1')],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [5, 8.6], duur: 1.2 }),
        stap({ type: 'schijn', wie: 'a1', kant: 'links' }),
        stap({ type: 'dribbel', wie: 'a1', via: [[7, 7], [7.2, 5]], naar: [5, 1.4], duur: 3.4 }, { type: 'loop', wie: 'c1', naar: [5.4, 5], manier: 'verdedigend', duur: 1.4 }),
      ],
    },
  }),
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
