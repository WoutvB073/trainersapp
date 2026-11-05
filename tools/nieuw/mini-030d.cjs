// Mini Talents 0.30.0, blok Partijvormen (P1–P15). 2 groepjes per veld, ±10 kinderen per partijveld; animatie meestal 3 tegen 3.
// Draaien: node tools/nieuw/mini-030d.cjs
const { zet } = require('./hulp.cjs');
const { paaltje, pop } = require('./bouwstenen.cjs');
const { KLEUREN: K, mini, zone, B, hoepel, kaatsbord, miniGoal, leeg, trainer, speler, bal, hoedje, stap } = require('./mini-hulp.cjs');

const cat = ['partijvormen'];
const TIEN = 'Twee groepjes per veld: met 10 kinderen 3 tegen 3 met 2 wissels per team, of 5 tegen 5. Te vol? Leg een tweede veldje ernaast of speel met een extra bal. Wissel elke 2 minuten en speel 15 minuten.';
const TIEN_EN = 'Two groups per pitch: with 10 children, 3v3 with 2 subs per team, or 5v5. Too crowded? Set out a second pitch next to it or play with an extra ball. Swap every 2 minutes and play for 15 minutes.';
const VELD = 'Veldje van 16 × 20 m met op beide korte kanten een mini-goaltje.';
const VELD_EN = '16 × 20 m pitch with a mini-goal on both short sides.';

const hoeken = [hoedje('v1', 1, 1), hoedje('v2', 17, 1), hoedje('v3', 1, 21), hoedje('v4', 17, 21)];
const goals = [miniGoal('g1', 9, 1.2), miniGoal('g2', 9, 20.8, 180)];
const teams = [
  speler('a1', 1, 9, 16.4, { kijkrichting: -90 }),
  speler('a2', 2, 4, 13, { kijkrichting: -60 }),
  speler('a3', 3, 14, 13, { kijkrichting: -120 }),
  B('c1', 4, 9.6, 10, { kijkrichting: 90 }),
  B('c2', 5, 5.5, 7.6, { kijkrichting: 90 }),
  B('c3', 6, 12.5, 7.6, { kijkrichting: 90 }),
];
const balA = bal('b1', 9, 15.85, 'a1');
const veld = (...extra) => ({ ...leeg(19, 22), objecten: [zone('vak', 9, 11, 16, 20), ...hoeken, ...extra, ...teams, balA] });

/** Opbouw van de aanval: a1 → a2, a2 dribbelt, a2 → a3 die vrijloopt. Daarna doet a3 de afronding. */
const opbouw = [
  stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'druk', wie: 'c2', op: 'a2', afstand: 2.8, start: 0.2 }, { type: 'loop', wie: 'c1', naar: [8, 10.4], start: 0.3, duur: 1 }, { type: 'loop', wie: 'c3', naar: [11.6, 8.2], start: 0.3, duur: 1 }),
  stap({ type: 'dribbel', wie: 'a2', naar: [4.6, 10.4], duur: 1.2 }, { type: 'druk', wie: 'c2', op: 'a2', afstand: 2.2, manier: 'verdedigend' }, { type: 'loop', wie: 'a3', naar: [14, 10], duur: 1.2 }, { type: 'loop', wie: 'a1', naar: [8.4, 13.4], duur: 1.2 }),
  stap({ type: 'pass', van: 'a2', naar: 'a1' }),
  stap({ type: 'pass', van: 'a1', naar: 'a3' }, { type: 'loop', wie: 'c3', naar: [12, 7.2], duur: 1, start: 0.2 }),
];
const afronden = [
  stap({ type: 'dribbel', wie: 'a3', via: [[15.2, 7.4]], naar: [13.6, 4.6], duur: 1.9 }, { type: 'loop', wie: 'c3', naar: [11.4, 5.4], manier: 'verdedigend', start: 0.4, duur: 1.5 }, { type: 'loop', wie: 'c1', naar: [9.2, 5.6], manier: 'sprint', duur: 1.9 }),
  stap({ type: 'schot', van: 'a3', naar: [9, 0.8] }),
];

const oefeningen = [
  // P1
  mini({
    id: 'veld-mt-2-tegen-2',
    naam: '2 tegen 2 op mini-goaltjes',
    categorieen: cat,
    uitleg: 'Jullie spelen met z’n tweeën tegen twee anderen. Help elkaar! Dribbel, speel de bal naar je maatje en scoor in het goaltje van de ander.',
    organisatie: `Veldje van 12 × 16 m met op beide korte kanten een mini-goaltje. Twee groepjes per veld: met 10 kinderen 2 tegen 2 op twee veldjes naast elkaar en 2 kinderen wisselen door. Wissel elke 2 minuten en speel 15 minuten.`,
    benodigdheden: ['2 mini-goaltjes per veldje', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Kijk waar je maatje staat'],
    variaties: {
      makkelijker: ['Veldje groter', 'Trainer speelt mee'],
      moeilijker: ['Eerst een pass, dan pas scoren', 'Veldje kleiner'],
    },
    en: {
      naam: '2v2 on mini-goals',
      uitleg: 'You play in twos against two others. Help each other! Dribble, pass to your teammate and score in the other team’s mini-goal.',
      organisatie: '12 × 16 m pitch with a mini-goal on both short sides. Two groups per pitch: with 10 children, 2v2 on two pitches side by side and 2 children rotate in. Swap every 2 minutes and play for 15 minutes.',
      benodigdheden: ['2 mini-goals per pitch', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['See where your teammate is'],
      variaties: {
        makkelijker: ['A bigger pitch', 'The coach joins in'],
        moeilijker: ['Pass first, then score', 'A smaller pitch'],
      },
    },
    tekening: {
      ...leeg(14, 18),
      objecten: [
        zone('vak', 7, 9, 12, 16),
        miniGoal('g1', 7, 1.2),
        miniGoal('g2', 7, 16.8, 180),
        speler('a1', 1, 4.6, 13.6, { kijkrichting: -80 }),
        speler('a2', 2, 10, 11, { kijkrichting: -120 }),
        B('c1', 3, 5.6, 8.4, { kijkrichting: 100 }),
        B('c2', 4, 9.2, 6.4, { kijkrichting: 90 }),
        bal('b1', 4.7, 13.05, 'a1'),
      ],
      animatie: [
        stap({ type: 'dribbel', wie: 'a1', naar: [4.4, 11], duur: 1.3 }, { type: 'druk', wie: 'c1', op: 'a1', afstand: 2.3, manier: 'verdedigend' }),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'c2', naar: [9, 7.4], duur: 0.8 }),
        stap({ type: 'dribbel', wie: 'a2', via: [[11.2, 8.4]], naar: [9.8, 4.4], duur: 2 }, { type: 'loop', wie: 'c2', naar: [7.6, 4.4], manier: 'sprint', duur: 2 }),
        stap({ type: 'schot', van: 'a2', naar: [7.2, 0.9] }),
      ],
    },
  }),

  // P2
  mini({
    id: 'veld-mt-3-tegen-3',
    naam: '3 tegen 3 op mini-goaltjes',
    categorieen: cat,
    uitleg: 'Twee teams van drie. Speel de bal naar elkaar en scoor in het goaltje van de ander. Sta niet allemaal bij de bal: zoek een lege plek!',
    organisatie: `${VELD} ${TIEN}`,
    benodigdheden: ['2 mini-goaltjes', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Zoek een lege plek', 'Kijk op voor je speelt'],
    variaties: {
      makkelijker: ['Trainer speelt mee voor de ploeg met de bal', 'Veldje groter'],
      moeilijker: ['Punt alleen na twee passes', 'Veldje kleiner'],
    },
    en: {
      naam: '3v3 on mini-goals',
      uitleg: 'Two teams of three. Pass to each other and score in the other team’s mini-goal. Don’t all stand by the ball: find an empty space!',
      organisatie: `${VELD_EN} ${TIEN_EN}`,
      benodigdheden: ['2 mini-goals', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Find an empty space', 'Look up before you play'],
      variaties: {
        makkelijker: ['The coach plays for the team with the ball', 'A bigger pitch'],
        moeilijker: ['A point only after two passes', 'A smaller pitch'],
      },
    },
    tekening: { ...veld(...goals), animatie: [...opbouw, ...afronden] },
  }),

  // P3
  mini({
    id: 'veld-mt-4-goaltjes',
    naam: '4 goaltjes',
    categorieen: cat,
    uitleg: 'Aan elke kant staan twee goaltjes. Scoor in één van de goaltjes van de ander. Staat er iemand voor het ene goaltje? Ga dan naar het andere!',
    organisatie: `Veldje van 16 × 20 m met 2 mini-goaltjes per korte kant, 8 m uit elkaar. ${TIEN}`,
    benodigdheden: ['4 mini-goaltjes', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Kijk naar het vrije goaltje'],
    variaties: {
      makkelijker: ['Goaltjes verder uit elkaar', 'Trainer speelt mee'],
      moeilijker: ['Scoren in het andere goaltje dan de vorige keer', 'Veldje kleiner'],
    },
    en: {
      naam: '4 mini-goals',
      uitleg: 'There are two mini-goals on each side. Score in one of the other team’s mini-goals. Is someone standing in front of one? Then go to the other one!',
      organisatie: `16 × 20 m pitch with 2 mini-goals on each short side, 8 m apart. ${TIEN_EN}`,
      benodigdheden: ['4 mini-goals', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Look for the free mini-goal'],
      variaties: {
        makkelijker: ['Mini-goals further apart', 'The coach joins in'],
        moeilijker: ['Score in a different mini-goal from last time', 'A smaller pitch'],
      },
    },
    tekening: {
      ...veld(miniGoal('g1', 5, 1.2), miniGoal('g2', 13, 1.2), miniGoal('g3', 5, 20.8, 180), miniGoal('g4', 13, 20.8, 180)),
      animatie: [...opbouw, stap({ type: 'dribbel', wie: 'a3', naar: [14, 5.4], duur: 1.5 }, { type: 'druk', wie: 'c3', op: 'a3', afstand: 2.3, manier: 'verdedigend' }), stap({ type: 'schot', van: 'a3', naar: [13, 0.8] })],
    },
  }),

  // P4
  mini({
    id: 'veld-mt-poortjespartij',
    naam: 'Poortjespartij',
    categorieen: cat,
    uitleg: 'Geen goaltjes vandaag, maar poortjes! Dribbel met de bal door een poortje aan de kant van de ander. Dat is een punt.',
    organisatie: `Veldje van 16 × 20 m met op elke korte kant 2 poortjes van hoedjes (2 m breed). Scoren door door een poortje te dribbelen. ${TIEN}`,
    benodigdheden: ['8 hoedjes voor de poortjes', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Bal dicht bij je voet door het poortje'],
    variaties: {
      makkelijker: ['Poortjes breder', 'Meer poortjes'],
      moeilijker: ['Poortjes smaller', 'Eén poortje per kant'],
    },
    en: {
      naam: 'Gate game',
      uitleg: 'No mini-goals today, but gates! Dribble the ball through a gate on the other team’s side. That’s a point.',
      organisatie: `16 × 20 m pitch with 2 gates of disc cones (2 m wide) on each short side. Score by dribbling through a gate. ${TIEN_EN}`,
      benodigdheden: ['8 disc cones for the gates', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Keep the ball close through the gate'],
      variaties: {
        makkelijker: ['Wider gates', 'More gates'],
        moeilijker: ['Narrower gates', 'One gate on each side'],
      },
    },
    tekening: {
      ...veld(...[[4, 2.4], [6, 2.4], [12, 2.4], [14, 2.4], [4, 19.6], [6, 19.6], [12, 19.6], [14, 19.6]].map(([x, y], i) => hoedje(`p${i + 1}`, x, y, i < 4 ? K.blauw : K.rood))),
      animatie: [...opbouw, stap({ type: 'dribbel', wie: 'a3', via: [[14.4, 6]], naar: [13, 1.6], duur: 2.4 }, { type: 'druk', wie: 'c3', op: 'a3', afstand: 2.3, manier: 'verdedigend' })],
    },
  }),

  // P5
  mini({
    id: 'veld-mt-twee-ballen',
    naam: 'Twee ballen',
    categorieen: cat,
    uitleg: 'Oei, er zijn twee ballen in het spel! Beide teams kunnen tegelijk scoren. Goed opletten: waar zijn de ballen?',
    organisatie: `${VELD} Partij met 2 ballen tegelijk; gaat er een uit, dan legt de trainer een nieuwe in. ${TIEN}`,
    benodigdheden: ['2 mini-goaltjes', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Kijk op: waar is de andere bal?'],
    variaties: {
      makkelijker: ['Veldje groter', 'Eerst met één bal'],
      moeilijker: ['Drie ballen', 'Veldje kleiner'],
    },
    en: {
      naam: 'Two balls',
      uitleg: 'Oh no, there are two balls in play! Both teams can score at the same time. Pay attention: where are the balls?',
      organisatie: `${VELD_EN} A game with 2 balls at once; if one goes out, the coach puts a new one in. ${TIEN_EN}`,
      benodigdheden: ['2 mini-goals', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Look up: where is the other ball?'],
      variaties: {
        makkelijker: ['A bigger pitch', 'Start with one ball'],
        moeilijker: ['Three balls', 'A smaller pitch'],
      },
    },
    tekening: {
      ...veld(...goals, bal('b2', 9.6, 10.55, 'c1')),
      animatie: [
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'pass', van: 'c1', naar: 'c3', start: 0.2 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [4.6, 8], duur: 1.8 }, { type: 'dribbel', wie: 'c3', naar: [13, 14.4], duur: 2 }, { type: 'loop', wie: 'c2', naar: [2.8, 5.4], duur: 1.4 }, { type: 'loop', wie: 'a3', naar: [6.6, 15.2], duur: 1.8 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [7, 4.2], duur: 1.3 }, { type: 'dribbel', wie: 'c3', naar: [10.6, 17.8], duur: 1.3 }),
        stap({ type: 'schot', van: 'a2', naar: [9, 0.8] }, { type: 'schot', van: 'c3', naar: [9, 21.2] }),
      ],
    },
  }),

  // P6
  mini({
    id: 'veld-mt-bal-in-de-zone',
    naam: 'Bal in de zone',
    categorieen: cat,
    uitleg: 'Aan het eind van het veld is een zone. Dribbel de bal erin en zet je voet erop: stilleggen! Dan heb je een punt.',
    organisatie: `Veldje van 16 × 20 m met op beide korte kanten een eindzone van 3 m (hoedjes). Scoren door de bal in de eindzone stil te leggen. ${TIEN}`,
    benodigdheden: ['8 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Stop de bal met je voetzool'],
    variaties: {
      makkelijker: ['Zone groter', 'Trainer speelt mee'],
      moeilijker: ['Zone kleiner', 'Eerst een pass in de zone'],
    },
    en: {
      naam: 'Ball in the zone',
      uitleg: 'There’s a zone at the end of the pitch. Dribble the ball into it and put your foot on it: stop it! That’s a point.',
      organisatie: `16 × 20 m pitch with a 3 m end zone on both short sides (disc cones). Score by stopping the ball in the end zone. ${TIEN_EN}`,
      benodigdheden: ['8 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Stop the ball with the sole of your foot'],
      variaties: {
        makkelijker: ['A bigger zone', 'The coach joins in'],
        moeilijker: ['A smaller zone', 'A pass into the zone first'],
      },
    },
    tekening: {
      ...veld(zone('z1', 9, 2.5, 16, 3, K.blauw), zone('z2', 9, 19.5, 16, 3, K.rood)),
      animatie: [...opbouw, stap({ type: 'dribbel', wie: 'a3', via: [[15, 7]], naar: [14, 3], duur: 2.4 }, { type: 'loop', wie: 'c3', naar: [11.6, 4.6], manier: 'verdedigend', start: 0.4, duur: 1.8 }), stap({ type: 'voetOpBal', wie: 'a3', duur: 1.2 })],
    },
  }),

  // P7
  mini({
    id: 'veld-mt-jokerpartij',
    naam: 'Jokerpartij',
    categorieen: cat,
    uitleg: 'De trainer speelt mee als joker: hij helpt altijd het team dat de bal heeft. Speel de bal naar de trainer en loop vrij. Je krijgt hem terug!',
    organisatie: `${VELD} De trainer speelt mee voor de ploeg die de bal heeft. ${TIEN}`,
    benodigdheden: ['2 mini-goaltjes', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Speel en loop meteen door'],
    variaties: {
      makkelijker: ['Veldje groter', 'Twee jokers'],
      moeilijker: ['Joker mag één keer raken', 'Veldje kleiner'],
    },
    en: {
      naam: 'Joker game',
      uitleg: 'The coach joins in as the joker: they always help the team with the ball. Pass to the coach and run into space. You’ll get it back!',
      organisatie: `${VELD_EN} The coach plays for the team with the ball. ${TIEN_EN}`,
      benodigdheden: ['2 mini-goals', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Pass and keep moving'],
      variaties: {
        makkelijker: ['A bigger pitch', 'Two jokers'],
        moeilijker: ['The joker gets one touch', 'A smaller pitch'],
      },
    },
    tekening: {
      ...veld(...goals, trainer(9, 12.4, 90)),
      animatie: [
        stap({ type: 'pass', van: 'a1', naar: 't1' }, { type: 'loop', wie: 'a1', naar: [6.4, 13.8], start: 0.3, duur: 1 }, { type: 'loop', wie: 'a3', naar: [13, 9.4], duur: 1.2 }, { type: 'loop', wie: 'c3', naar: [12, 6.8], duur: 1.2 }),
        stap({ type: 'pass', van: 't1', naar: 'a3' }),
        ...afronden,
      ],
    },
  }),

  // P8
  mini({
    id: 'veld-mt-geen-uitbal',
    naam: 'Geen uitbal',
    categorieen: cat,
    uitleg: 'Gaat de bal uit? Geen tijd om te wachten! De trainer gooit meteen een nieuwe bal in. Snel erheen en doorspelen.',
    organisatie: `${VELD} De trainer staat aan de zijkant met een stapel ballen en gooit meteen een nieuwe in als de bal uit is. ${TIEN}`,
    benodigdheden: ['2 mini-goaltjes', '4 hoedjes', 'Hesjes', 'Veel voetballen'],
    spelersNodig: 4,
    coachpunten: ['Blijf bewegen en kijk naar de trainer'],
    variaties: {
      makkelijker: ['Bal bij een team in de voeten gooien', 'Veldje groter'],
      moeilijker: ['Bal in de vrije ruimte gooien', 'Veldje kleiner'],
    },
    en: {
      naam: 'No throw-ins',
      uitleg: 'Did the ball go out? No time to wait! The coach throws in a new ball straight away. Get there quickly and keep playing.',
      organisatie: `${VELD_EN} The coach stands at the side with a pile of balls and throws in a new one as soon as the ball goes out. ${TIEN_EN}`,
      benodigdheden: ['2 mini-goals', '4 disc cones', 'Bibs', 'Lots of footballs'],
      coachpunten: ['Keep moving and look at the coach'],
      variaties: {
        makkelijker: ['Throw the ball to a team’s feet', 'A bigger pitch'],
        moeilijker: ['Throw the ball into free space', 'A smaller pitch'],
      },
    },
    tekening: {
      ...veld(...goals, trainer(18.2, 8, 180), bal('b2', 17.65, 8, 't1')),
      animatie: [
        stap({ type: 'pass', van: 'a1', naar: [0.2, 13.6] }, { type: 'loop', wie: 'a3', naar: [13.4, 9.6], start: 0.6, duur: 1.2 }),
        stap({ type: 'pass', van: 't1', naar: 'a3', worp: 'onderhands', hoogte: 'grond' }, { type: 'loop', wie: 'c3', naar: [12, 7.2], duur: 1 }),
        ...afronden,
      ],
    },
  }),

  // P9
  mini({
    id: 'veld-mt-dribbelgoal',
    naam: 'Dribbelgoal telt dubbel',
    categorieen: cat,
    uitleg: 'Scoor je na een dribbel langs een tegenstander? Dan telt je goal dubbel: 2 punten! Durf maar te dribbelen.',
    organisatie: `${VELD} Goal na een dribbel langs een tegenstander = 2 punten, andere goals 1 punt. ${TIEN}`,
    benodigdheden: ['2 mini-goaltjes', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Durf te dribbelen, ook als het misgaat'],
    variaties: {
      makkelijker: ['Elke dribbel telt', 'Verdedigers mogen alleen lopen'],
      moeilijker: ['Dribbel langs twee tegenstanders = 3 punten', 'Veldje kleiner'],
    },
    en: {
      naam: 'Dribble goals count double',
      uitleg: 'Do you score after dribbling past an opponent? Then your goal counts double: 2 points! Be brave and dribble.',
      organisatie: `${VELD_EN} A goal after dribbling past an opponent = 2 points, other goals 1 point. ${TIEN_EN}`,
      benodigdheden: ['2 mini-goals', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Be brave and dribble, even if it goes wrong'],
      variaties: {
        makkelijker: ['Every dribble counts', 'Defenders can only walk'],
        moeilijker: ['Past two opponents = 3 points', 'A smaller pitch'],
      },
    },
    tekening: {
      ...veld(...goals),
      animatie: [
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'c1', naar: [7.8, 11], duur: 1 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [4.4, 10.6], duur: 1.2 }, { type: 'druk', wie: 'c2', op: 'a2', afstand: 2.1, manier: 'verdedigend' }),
        stap({ type: 'schijn', wie: 'a2', kant: 'rechts' }),
        stap({ type: 'dribbel', wie: 'a2', via: [[3, 8]], naar: [6.4, 4.4], duur: 2.2, manier: 'sprint' }, { type: 'loop', wie: 'c2', naar: [7.4, 6.8], manier: 'sprint', start: 0.4, duur: 1.6 }),
        stap({ type: 'schot', van: 'a2', naar: [9, 0.8] }),
      ],
    },
  }),

  // P10
  mini({
    id: 'veld-mt-mini-toernooi',
    naam: 'Mini-toernooi',
    categorieen: cat,
    uitleg: 'We houden een toernooi! Jullie spelen een potje van 3 minuten. Daarna fluit de trainer en krijg je een nieuwe tegenstander. Welk team wint de meeste potjes?',
    organisatie: 'Twee veldjes van 12 × 16 m naast elkaar, op elke korte kant een mini-goaltje. Vier teams: met 10 kinderen 2 teams van 3 en 2 teams van 2. Potjes van 3 minuten, daarna van tegenstander wisselen. Speel 15 minuten.',
    benodigdheden: ['4 mini-goaltjes', '8 hoedjes', 'Hesjes in 4 kleuren', '2 voetballen'],
    spelersNodig: 4,
    coachpunten: ['Samen winnen, samen verliezen'],
    variaties: {
      makkelijker: ['Eén veldje met 2 teams', 'Potjes van 2 minuten'],
      moeilijker: ['Winnaar schuift een veldje op', 'Potjes van 4 minuten'],
    },
    en: {
      naam: 'Mini tournament',
      uitleg: 'We’re having a tournament! You play a game for 3 minutes. Then the coach blows the whistle and you get a new opponent. Which team wins the most games?',
      organisatie: 'Two 12 × 16 m pitches side by side, each with a mini-goal on both short sides. Four teams: with 10 children, 2 teams of 3 and 2 teams of 2. Games of 3 minutes, then change opponent. Play for 15 minutes.',
      benodigdheden: ['4 mini-goals', '8 disc cones', 'Bibs in 4 colours', '2 footballs'],
      coachpunten: ['Win together, lose together'],
      variaties: {
        makkelijker: ['One pitch with 2 teams', 'Games of 2 minutes'],
        moeilijker: ['The winner moves up a pitch', 'Games of 4 minutes'],
      },
    },
    tekening: {
      ...leeg(28, 18),
      objecten: [
        zone('v1', 7.5, 9, 12, 16),
        zone('v2', 20.5, 9, 12, 16),
        miniGoal('g1', 7.5, 1.2),
        miniGoal('g2', 7.5, 16.8, 180),
        miniGoal('g3', 20.5, 1.2),
        miniGoal('g4', 20.5, 16.8, 180),
        speler('a1', 1, 4.6, 12.4, { kijkrichting: -80 }),
        speler('a2', 2, 10.4, 10.6, { kijkrichting: -110 }),
        B('c1', 3, 6, 7.4, { kijkrichting: 90 }),
        B('c2', 4, 9.6, 5.8, { kijkrichting: 90 }),
        speler('a3', 5, 17.6, 12.4, { kijkrichting: -80, team: 'C' }),
        speler('a4', 6, 23.4, 10.6, { kijkrichting: -110, team: 'C' }),
        speler('c3', 7, 19, 7.4, { kijkrichting: 90, team: 'J' }),
        speler('c4', 8, 22.6, 5.8, { kijkrichting: 90, team: 'J' }),
        bal('b1', 4.7, 11.85, 'a1'),
        bal('b2', 17.7, 11.85, 'a3'),
      ],
      animatie: [
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'pass', van: 'a3', naar: 'a4' }, { type: 'loop', wie: 'c2', naar: [9, 7], duur: 1 }, { type: 'loop', wie: 'c4', naar: [22, 7], duur: 1 }),
        stap({ type: 'dribbel', wie: 'a2', via: [[11.4, 8.4]], naar: [10.2, 4.4], duur: 2 }, { type: 'dribbel', wie: 'a4', via: [[24.4, 8.4]], naar: [23.2, 4.4], duur: 2 }, { type: 'loop', wie: 'c2', naar: [8, 4.4], manier: 'sprint', duur: 2 }, { type: 'loop', wie: 'c4', naar: [21, 4.4], manier: 'sprint', duur: 2 }),
        stap({ type: 'schot', van: 'a2', naar: [7.7, 0.9] }, { type: 'schot', van: 'a4', naar: [20.7, 0.9] }),
      ],
    },
  }),

  // P11
  mini({
    id: 'veld-mt-poppenpartij',
    naam: 'Poppenpartij',
    categorieen: cat,
    uitleg: 'In het veld staan poppen. Ze doen niets, maar je moet er wel omheen! Dribbel langs de poppen en scoor.',
    organisatie: `${VELD} In het veld staan 4 poppen die je moet omspelen. ${TIEN}`,
    benodigdheden: ['2 mini-goaltjes', '4 poppen', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Kijk op: waar staan de poppen?'],
    variaties: {
      makkelijker: ['Twee poppen', 'Veldje groter'],
      moeilijker: ['Zes poppen', 'Pass langs een pop telt dubbel'],
    },
    en: {
      naam: 'Mannequin game',
      uitleg: 'There are mannequins on the pitch. They don’t do anything, but you have to go around them! Dribble past the mannequins and score.',
      organisatie: `${VELD_EN} There are 4 mannequins on the pitch that you have to play around. ${TIEN_EN}`,
      benodigdheden: ['2 mini-goals', '4 mannequins', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Look up: where are the mannequins?'],
      variaties: {
        makkelijker: ['Two mannequins', 'A bigger pitch'],
        moeilijker: ['Six mannequins', 'A pass past a mannequin counts double'],
      },
    },
    tekening: {
      ...veld(...goals, pop('m1', 6.4, 12.6), pop('m2', 11.8, 11.8), pop('m3', 3, 7.4), pop('m4', 15, 5)),
      animatie: [
        stap({ type: 'pass', van: 'a1', naar: 'a3' }, { type: 'loop', wie: 'c3', naar: [12.8, 8.8], duur: 1 }, { type: 'loop', wie: 'c1', naar: [8.4, 9.4], duur: 1 }),
        stap({ type: 'dribbel', wie: 'a3', via: [[15, 10.4]], naar: [13.8, 7.2], duur: 2 }, { type: 'druk', wie: 'c3', op: 'a3', afstand: 2.2, manier: 'verdedigend' }),
        stap({ type: 'dribbel', wie: 'a3', naar: [11.4, 4.4], duur: 1.4 }, { type: 'loop', wie: 'c1', naar: [9.4, 5.2], manier: 'sprint', duur: 1.4 }),
        stap({ type: 'schot', van: 'a3', naar: [9, 0.8] }),
      ],
    },
  }),

  // P12
  mini({
    id: 'veld-mt-paaltjesvoetbal',
    naam: 'Paaltjesvoetbal',
    categorieen: cat,
    uitleg: 'Geen goaltje, maar een paal! Raak de paal van de tegenstander met de bal. Raak? Punt! Mik maar goed.',
    organisatie: `Veldje van 16 × 20 m met op beide korte kanten een paal in het midden, 2 m van de lijn. Scoren door de paal van de tegenstander te raken. ${TIEN}`,
    benodigdheden: ['2 palen', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Mik op de paal, dicht erbij is makkelijker'],
    variaties: {
      makkelijker: ['Pop in plaats van paal', 'Twee palen per kant'],
      moeilijker: ['Punt alleen van buiten een vak', 'Veldje kleiner'],
    },
    en: {
      naam: 'Pole football',
      uitleg: 'No mini-goal, but a pole! Hit the other team’s pole with the ball. A hit? A point! Aim carefully.',
      organisatie: `16 × 20 m pitch with a pole in the middle of both short sides, 2 m from the line. Score by hitting the other team’s pole. ${TIEN_EN}`,
      benodigdheden: ['2 poles', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Aim at the pole; getting close makes it easier'],
      variaties: {
        makkelijker: ['A mannequin instead of a pole', 'Two poles on each side'],
        moeilijker: ['A point only from outside an area', 'A smaller pitch'],
      },
    },
    tekening: {
      ...veld(paaltje('q1', 9, 3), paaltje('q2', 9, 19)),
      animatie: [...opbouw, stap({ type: 'dribbel', wie: 'a3', naar: [12.6, 6.6], duur: 1.4 }, { type: 'druk', wie: 'c3', op: 'a3', afstand: 2.2, manier: 'verdedigend' }), stap({ type: 'schot', van: 'a3', naar: [9.1, 3.05], hoogte: 'grond' })],
    },
  }),

  // P13
  mini({
    id: 'veld-mt-kaatsbordpartij',
    naam: 'Kaatsbordpartij',
    categorieen: cat,
    uitleg: 'Aan de zijkant staan kaatsborden. Ze zijn je medespelers! Speel de bal ertegen en loop erachteraan. Zo kom je langs de ander.',
    organisatie: `${VELD} Op elke lange kant een kaatsbord halverwege; die mag je als medespeler gebruiken. ${TIEN}`,
    benodigdheden: ['2 mini-goaltjes', '2 kaatsborden', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Speel tegen het bord en loop meteen door'],
    variaties: {
      makkelijker: ['Kaatsbord dichterbij', 'Vier kaatsborden'],
      moeilijker: ['Goal na een kaats telt dubbel', 'Veldje kleiner'],
    },
    en: {
      naam: 'Rebound board game',
      uitleg: 'There are rebound boards at the side. They’re your teammates! Play the ball against one and run after it. That’s how you get past the other team.',
      organisatie: `${VELD_EN} A rebound board halfway along each long side; you can use them as a teammate. ${TIEN_EN}`,
      benodigdheden: ['2 mini-goals', '2 rebound boards', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Play it against the board and keep moving'],
      variaties: {
        makkelijker: ['Rebound board closer', 'Four rebound boards'],
        moeilijker: ['A goal after a rebound counts double', 'A smaller pitch'],
      },
    },
    tekening: {
      ...veld(...goals, kaatsbord('k1', 1.2, 10, 90), kaatsbord('k2', 16.8, 10, -90)),
      animatie: [
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'druk', wie: 'c2', op: 'a2', afstand: 2.6, start: 0.2 }),
        stap({ type: 'pass', van: 'a2', naar: 'k1', terug: [5.4, 8.2] }, { type: 'loop', wie: 'a2', naar: [5, 9.4], duur: 1 }, { type: 'loop', wie: 'c2', naar: [7, 9.6], duur: 1 }),
        stap({ type: 'pak', wie: 'a2' }),
        stap({ type: 'dribbel', wie: 'a2', naar: [6.6, 4.4], duur: 1.6 }, { type: 'loop', wie: 'c2', naar: [8.8, 5.6], manier: 'sprint', duur: 1.6 }),
        stap({ type: 'schot', van: 'a2', naar: [9, 0.8] }),
      ],
    },
  }),

  // P14
  mini({
    id: 'veld-mt-hoepelgoal',
    naam: 'Hoepelgoal',
    categorieen: cat,
    uitleg: 'Achter de lijn liggen hoepels. Dribbel erheen en leg de bal stil in de hoepel. Dan heb je een goal!',
    organisatie: `Veldje van 16 × 20 m met achter elke korte lijn 3 hoepels. Scoren door de bal in een hoepel van de ander stil te leggen. ${TIEN}`,
    benodigdheden: ['6 hoepels', '4 hoedjes', 'Hesjes', 'Voetballen'],
    spelersNodig: 4,
    coachpunten: ['Stop de bal met je voetzool in de hoepel'],
    variaties: {
      makkelijker: ['Meer hoepels', 'Punt ook als de bal alleen de hoepel raakt'],
      moeilijker: ['Eén hoepel per kant', 'Eerst een pass'],
    },
    en: {
      naam: 'Hoop goal',
      uitleg: 'There are hoops behind the line. Dribble over and stop the ball in a hoop. That’s a goal!',
      organisatie: `16 × 20 m pitch with 3 hoops behind each short line. Score by stopping the ball in one of the other team’s hoops. ${TIEN_EN}`,
      benodigdheden: ['6 hoops', '4 disc cones', 'Bibs', 'Footballs'],
      coachpunten: ['Stop the ball in the hoop with the sole of your foot'],
      variaties: {
        makkelijker: ['More hoops', 'A point even if the ball only touches the hoop'],
        moeilijker: ['One hoop on each side', 'A pass first'],
      },
    },
    tekening: {
      ...veld(...[4, 9, 14].flatMap((x, i) => [hoepel(`h${i + 1}`, x, 0.4, K.blauw), hoepel(`k${i + 1}`, x, 21.6, K.rood)])),
      animatie: [...opbouw, stap({ type: 'dribbel', wie: 'a3', via: [[15, 6]], naar: [14, 1.02], duur: 3 }, { type: 'loop', wie: 'c3', naar: [11.6, 3], manier: 'verdedigend', start: 0.4, duur: 2.2 }), stap({ type: 'voetOpBal', wie: 'a3', duur: 1.2 })],
    },
  }),

  // P15
  mini({
    id: 'veld-mt-ballenregen',
    naam: 'Ballenregen',
    categorieen: cat,
    uitleg: 'Het regent ballen! De trainer gooit steeds een nieuwe bal in het veld. Welk team maakt in 2 minuten de meeste goals?',
    organisatie: `${VELD} De trainer gooit steeds nieuwe ballen in, ook als er nog een bal in het spel is. Rondes van 2 minuten, tel de goals. ${TIEN}`,
    benodigdheden: ['2 mini-goaltjes', '4 hoedjes', 'Hesjes', 'Veel voetballen'],
    spelersNodig: 4,
    coachpunten: ['Kijk op: waar komt de volgende bal?'],
    variaties: {
      makkelijker: ['Minder ballen', 'Veldje groter'],
      moeilijker: ['De trainer gooit sneller', 'Veldje kleiner'],
    },
    en: {
      naam: 'Raining balls',
      uitleg: 'It’s raining balls! The coach keeps throwing a new ball onto the pitch. Which team scores the most goals in 2 minutes?',
      organisatie: `${VELD_EN} The coach keeps throwing in new balls, even if another ball is still in play. Rounds of 2 minutes, count the goals. ${TIEN_EN}`,
      benodigdheden: ['2 mini-goals', '4 disc cones', 'Bibs', 'Lots of footballs'],
      coachpunten: ['Look up: where is the next ball coming from?'],
      variaties: {
        makkelijker: ['Fewer balls', 'A bigger pitch'],
        moeilijker: ['The coach throws faster', 'A smaller pitch'],
      },
    },
    tekening: {
      ...veld(...goals, trainer(18.2, 11, 180), bal('b2', 17.65, 11, 't1'), bal('b3', 18.4, 12.2)),
      animatie: [
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'pass', van: 't1', naar: 'c3', worp: 'onderhands', hoogte: 'grond', start: 0.4 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [6, 6], duur: 2 }, { type: 'dribbel', wie: 'c3', naar: [11.4, 16.6], duur: 2.4 }, { type: 'loop', wie: 'c2', naar: [3.8, 5.6], duur: 1.4 }, { type: 'pak', wie: 't1', bal: 'b3', start: 0.6 }),
        stap({ type: 'schot', van: 'a2', naar: [9, 0.8] }, { type: 'schot', van: 'c3', naar: [9, 21.2] }, { type: 'pass', van: 't1', naar: 'a3', worp: 'onderhands', hoogte: 'grond', start: 0.3 }),
      ],
    },
  }),
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
