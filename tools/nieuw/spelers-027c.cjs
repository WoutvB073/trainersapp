// Spelersoefeningen 0.27.0, deel B3 (Spelletjes: 36 en 38). Draaien: node tools/nieuw/spelers-027c.cjs
// #37 (Wie is de beste?) is niet gebouwd: vrijwel gelijk aan veld-sp-koning-van-het-veld.
const { zet } = require('./hulp.cjs');
const { speler, trainer, bal, pion, hoedje, paaltje, pauze, stap } = require('./bouwstenen.cjs');

const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const C = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'C', ...extra });
const J = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'J', ...extra });
const zone = (id, x, y, breedte, lengte, kleur) => ({ id, soort: 'zone', x, y, breedte, lengte, ...(kleur ? { kleur } : {}) });
const tekst = (id, x, y, t) => ({ id, soort: 'tekst', x, y, tekst: t });
const leeg = (breedte, lengte, camera = 'schuin') => ({ veld: { type: 'leeg', breedte, lengte }, camera });
const WIT = '#ffffff';

/** Ludo-bord: 16 hoedjes rond een vierkant van 12 × 12 m (om de 3 m), de vier hoeken in de kleur van een speler. */
function bord() {
  const hoeken = { '3,3': '#e03131', '15,3': '#1c64d8', '15,15': '#f2b705', '3,15': '#8b3fd9' };
  const lijst = [];
  const punten = [];
  for (let x = 3; x <= 15; x += 3) punten.push([x, 3]);
  for (let y = 6; y <= 15; y += 3) punten.push([15, y]);
  for (let x = 12; x >= 3; x -= 3) punten.push([x, 15]);
  for (let y = 12; y >= 6; y -= 3) punten.push([3, y]);
  punten.forEach(([x, y], i) => lijst.push(hoedje(`h${i + 1}`, x, y, hoeken[`${x},${y}`] ?? WIT)));
  return lijst;
}

/** Plek op de cirkel (middelpunt 10,10; straal 4) bij een hoek in graden. */
const rond = (hoek) => [+(10 + 4 * Math.cos((hoek * Math.PI) / 180)).toFixed(2), +(10 + 4 * Math.sin((hoek * Math.PI) / 180)).toFixed(2)];
/** Dribbel een zesde rondje verder (via het tussenpunt). */
const verder = (wie, hoek) => ({ type: 'dribbel', wie, via: [rond(hoek + 30)], naar: rond(hoek + 60), duur: 1.6 });

const oefeningen = [
  // 36. Ludo met de bal
  {
    id: 'veld-sp-ludo',
    naam: 'Ludo met de bal',
    categorieen: ['spelletjes', 'techniek'],
    uitleg:
      'Een bordspel op het veld. Rond een vierkant liggen 16 hoedjes: dat is het bord. Elke speler begint bij de hoek in zijn eigen kleur. Om de beurt gooi je met de dobbelsteen (of trek je een kaartje met een getal). Dat getal verdien je met een opdracht: bij 1 of 2 hoog houden (5 keer), bij 3 of 4 de slalom door de paaltjes in het midden, bij 5 of 6 een pass door het poortje en de bal weer ophalen. Lukt de opdracht, dan zet je zoveel stappen (hoedjes) vooruit als je gooide; lukt hij niet, dan blijf je staan. Kom je op het hoedje van een ander, dan moet die terug naar zijn eigen hoek. Wie het eerst helemaal rond is, wint.',
    organisatie:
      'Vierkant van 12 × 12 m met om de 3 m een hoedje (16 hoedjes, de vier hoeken in een eigen kleur). In het midden een slalom van vier paaltjes; naast het bord een poortje van twee hoedjes op 6 m. De trainer staat met de dobbelsteen aan de zijkant. Iedereen een bal.',
    benodigdheden: ['16 hoedjes (4 in een eigen kleur)', '4 paaltjes', '2 hoedjes voor het poortje', 'Dobbelsteen of kaartjes 1–6', 'Ballen'],
    spelersNodig: 4,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: speel in tweetallen per kleur (om de beurt de opdracht), of leg een tweede bord neer.',
    coachpunten: [
      'Hooghouden: rustig, de bal laag houden en met de wreef raken',
      'Slalom: kleine tikjes, de bal dicht bij je voet, met binnen- en buitenkant',
      'Pass door het poortje: standbeen naast de bal en met de binnenkant',
    ],
    variaties: {
      makkelijker: ['Hooghouden met een stuit ertussen', 'Bij een mislukte opdracht toch één stap vooruit'],
      moeilijker: ['Hooghouden 10 keer, alleen met je zwakke voet', 'Slalom op tijd: binnen 10 seconden', 'Poortje kleiner of verder weg'],
    },
    en: {
      naam: 'Ludo with the ball',
      uitleg:
        'A board game on the pitch. Around a square lie 16 disc cones: that is the board. Each player starts at the corner in their own colour. Take turns to roll the dice (or draw a card with a number). You earn that number with a task: on 1 or 2, keep the ball up (5 times); on 3 or 4, the slalom through the poles in the middle; on 5 or 6, a pass through the gate and fetch the ball back. If you complete the task, you move that many steps (disc cones) forward; if not, you stay where you are. Land on someone else’s disc cone and they have to go back to their own corner. The first to get all the way round wins.',
      organisatie:
        '12 × 12 m square with a disc cone every 3 m (16 disc cones, the four corners each in their own colour). In the middle a slalom of four poles; next to the board a gate of two disc cones 6 m away. The coach stands at the side with the dice. Everyone has a ball.',
      benodigdheden: ['16 disc cones (4 in their own colour)', '4 poles', '2 disc cones for the gate', 'Dice or cards 1–6', 'Balls'],
      meerSpelers: 'With more players: play in pairs per colour (taking turns at the task), or set out a second board.',
      coachpunten: [
        'Keepy-ups: stay calm, keep the ball low and use your laces',
        'Slalom: small touches, the ball close to your foot, with the inside and outside',
        'Pass through the gate: standing foot next to the ball and use the inside of your foot',
      ],
      variaties: {
        makkelijker: ['Keepy-ups with a bounce in between', 'One step forward even when a task fails'],
        moeilijker: ['10 keepy-ups, weaker foot only', 'Slalom against the clock: within 10 seconds', 'Smaller gate or further away'],
      },
    },
    tekening: {
      ...leeg(18, 20),
      objecten: [
        ...bord(),
        paaltje('s1', 9, 6),
        paaltje('s2', 9, 8),
        paaltje('s3', 9, 10),
        paaltje('s4', 9, 12),
        tekst('dob', 12.4, 18.6, 'dobbelsteen'),
        trainer(9, 18.2, -90),
        speler('p1', 1, 2.2, 2.2, { kijkrichting: 45 }),
        B('p2', 2, 15.8, 2.2, { kijkrichting: 135 }),
        C('p3', 3, 15.8, 15.8, { kijkrichting: -135 }),
        J('p4', 4, 2.2, 15.8, { kijkrichting: -45 }),
        bal('b1', 2.6, 2.6, 'p1'),
        bal('b2', 15.4, 2.6, 'p2'),
      ],
      animatie: [
        pauze(0.6),
        // Rood gooit 2: hooghouden en dan twee hoedjes verder.
        stap({ type: 'grondtik', wie: 't1' }),
        stap({ type: 'pass', van: 'p1', naar: 'p1', hoogte: 1.1, bal: 'b1' }),
        stap({ type: 'pass', van: 'p1', naar: 'p1', hoogte: 0.9, bal: 'b1' }),
        stap({ type: 'pass', van: 'p1', naar: 'p1', hoogte: 1.1, bal: 'b1' }),
        stap({ type: 'dribbel', wie: 'p1', via: [[4.5, 2]], naar: [9, 2.1] }),
        // Blauw gooit 3: slalom door de paaltjes en dan drie hoedjes verder.
        stap({ type: 'grondtik', wie: 't1' }),
        stap({
          type: 'dribbel',
          wie: 'p2',
          via: [
            [13.6, 1.8],
            [13.4, 4.4],
            [10, 5],
          ],
          naar: [10.1, 6],
        }),
        stap({
          type: 'dribbel',
          wie: 'p2',
          via: [
            [8, 7.9],
            [10, 9.9],
          ],
          naar: [8, 12],
        }),
        stap({
          type: 'dribbel',
          wie: 'p2',
          via: [
            [9, 13.6],
            [12.6, 13.5],
            [15.8, 13.5],
          ],
          naar: [15.8, 12],
        }),
        pauze(1.0),
      ],
    },
  },

  // 38. Uit het vak rennen
  {
    id: 'veld-sp-uit-het-vak',
    naam: 'Uit het vak rennen',
    categorieen: ['spelletjes', 'warming-up'],
    uitleg:
      'Iedereen dribbelt met een eigen bal door het vak. De trainer roept een kleur (de kleur van je hesje) of een nummer. Alleen de spelers die bij die kleur of dat nummer horen, dribbelen zo snel mogelijk het vak uit naar een van de pionnen buiten het vak. De rest blijft gewoon dribbelen en moet uitkijken voor de spelers die naar buiten sprinten. Wie als eerste bij een pion is met de bal onder controle, krijgt een punt; daarna dribbel je weer het vak in.',
    organisatie: 'Vak van 14 × 14 m met 2 m buiten elke zijde een pion. Iedereen een bal; twee of drie hesjeskleuren en elke speler een nummer. Speel blokjes van 2 minuten met korte rustpauzes.',
    benodigdheden: ['4 pionnen voor het vak', '4 pionnen buiten het vak', 'Ballen', 'Hesjes in 2–3 kleuren'],
    spelersNodig: 6,
    keepersNodig: 0,
    doorwisselbaar: true,
    coachpunten: [
      'Tijdens het dribbelen: hoofd omhoog, zodat je de ruimte en de anderen ziet',
      'Bij jouw kleur: eerst een kleine tik opzij, dan met grote tikken versnellen',
      'Kies de pion waar de weg naartoe vrij is, niet altijd de dichtstbijzijnde',
    ],
    variaties: {
      makkelijker: ['Zonder bal (lopend)', 'Groter vak, minder spelers tegelijk'],
      moeilijker: ['De trainer roept een som (2 + 3 = nummer 5)', 'Alleen dribbelen met je zwakke voet', 'Bij de pion een opdracht: om de pion heen en terug het vak in'],
    },
    en: {
      naam: 'Out of the box',
      uitleg:
        'Everyone dribbles around the area with their own ball. The coach calls a colour (the colour of your bib) or a number. Only the players with that colour or number dribble out of the area as fast as they can to one of the cones outside it. Everyone else keeps dribbling and has to watch out for the players sprinting out. The first to reach a cone with the ball under control gets a point; then you dribble back into the area.',
      organisatie: '14 × 14 m area with a cone 2 m outside each side. Everyone has a ball; two or three bib colours and every player has a number. Play 2-minute blocks with short rests.',
      benodigdheden: ['4 cones for the area', '4 cones outside the area', 'Balls', 'Bibs in 2–3 colours'],
      coachpunten: [
        'While dribbling: head up, so you can see the space and the others',
        'When your colour is called: a small touch to the side first, then speed up with bigger touches',
        'Pick the cone with a clear path to it, not always the nearest one',
      ],
      variaties: {
        makkelijker: ['Without a ball (running)', 'Bigger area, fewer players at a time'],
        moeilijker: ['The coach calls a sum (2 + 3 = number 5)', 'Dribble with your weaker foot only', 'A task at the cone: round the cone and back into the area'],
      },
    },
    tekening: {
      ...leeg(20, 20),
      objecten: [
        zone('z', 10, 10, 14, 14),
        pion('p1', 10, 1),
        pion('p2', 19, 10),
        pion('p3', 10, 19),
        pion('p4', 1, 10),
        trainer(17.8, 1.8, 135),
        speler('a1', 1, ...rond(30), { kijkrichting: 120 }),
        B('b1', 2, ...rond(90), { kijkrichting: 180 }),
        speler('a2', 3, ...rond(150), { kijkrichting: 240 }),
        B('b2', 4, ...rond(210), { kijkrichting: 300 }),
        speler('a3', 5, ...rond(270), { kijkrichting: 0 }),
        B('b3', 6, ...rond(330), { kijkrichting: 60 }),
        bal('ba1', rond(30)[0] - 0.4, rond(30)[1] + 0.4, 'a1'),
        bal('bb1', rond(90)[0] - 0.55, rond(90)[1], 'b1'),
        bal('ba2', rond(150)[0] - 0.4, rond(150)[1] - 0.4, 'a2'),
        bal('bb2', rond(210)[0] + 0.4, rond(210)[1] - 0.4, 'b2'),
        bal('ba3', rond(270)[0] + 0.55, rond(270)[1], 'a3'),
        bal('bb3', rond(330)[0] + 0.4, rond(330)[1] + 0.4, 'b3'),
      ],
      animatie: [
        pauze(0.4),
        stap(verder('a1', 30), verder('b1', 90), verder('a2', 150), verder('b2', 210), verder('a3', 270), verder('b3', 330)),
        stap(verder('a1', 90), verder('b1', 150), verder('a2', 210), verder('b2', 270), verder('a3', 330), verder('b3', 30)),
        // De trainer roept "blauw": blauw dribbelt het vak uit, rood dribbelt door.
        stap(
          { type: 'dribbel', wie: 'b1', naar: [1.9, 9.8], manier: 'sprint' },
          { type: 'dribbel', wie: 'b2', naar: [18.1, 9.8], manier: 'sprint' },
          { type: 'dribbel', wie: 'b3', naar: [10.4, 18.1], manier: 'sprint' },
          verder('a1', 150),
          verder('a2', 270),
          verder('a3', 30),
        ),
        pauze(1.0),
      ],
    },
  },
];

zet('veld', oefeningen);
