// Fase 2, deel 3, batch 2 (0.37.1), deel a: Pass en trap P3, P5–P10, P12, P14 uit VOORSTEL-OEFENINGEN.md.
// Overgeslagen (vrijwel gelijk aan een bestaande oefening): P2 (veld-pt-driehoek + veld-tq-indraaien), P4 (veld-pt-vierhoek-twee-ballen),
// P11 (veld-wu-passen-en-volgen), P13 (veld-mt-hoepelpass). Draaien: node tools/nieuw/fase2-0371a.cjs
const { zet } = require('./hulp.cjs');
const { speler, bal, pion, hoedje, horde, pauze, stap, B, zone, leeg, kaatsbord, JO, OUD, MIDDEN, KLEUR, draai } = require('./fase2-hulp.cjs');

const zeshoek = [0, 60, 120, 180, 240, 300].map((h) => [+(10 + 6.5 * Math.cos((h * Math.PI) / 180)).toFixed(2), +(9 + 6.5 * Math.sin((h * Math.PI) / 180)).toFixed(2)]);

const oefeningen = [
  // P3. Lange lijn: korte en lange pass
  {
    id: 'veld-pt-lange-lijn-kort-lang',
    naam: 'Lange lijn: korte en lange pass',
    categorieen: ['pass-en-trap'],
    uitleg:
      'Vier spelers staan op één lijn. De buitenste speelt kort in op zijn buurman, krijgt de bal terug en speelt dan de lange bal over de middelste twee heen naar de speler aan de andere kant. Die doet hetzelfde de andere kant op. Na een paar keer wisselen de buitenste en de middelste spelers van plek.',
    organisatie: 'Vier pionnen op één lijn: de buitenste op 25 m van elkaar, de middelste twee op 8 m van de buitenste. Vier spelers, één bal. Na 2 minuten de plekken ruilen.',
    benodigdheden: ['4 pionnen', '2 ballen'],
    spelersNodig: 4,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Korte pass strak en op de goede voet, zodat de kaats in één keer kan', 'Lange bal: standbeen naast de bal, raak hem onder het midden met je wreef', 'Ontvanger: kijk de bal in en neem hem zacht aan'],
    variaties: {
      makkelijker: ['Kortere lange bal (18 m)', 'Lange bal mag over de grond'],
      moeilijker: ['Lange bal in één keer na de kaats', 'Middelste spelers bewegen tussen de buitenste in', 'Aannemen uit de lucht in één aanraking'],
    },
    en: {
      naam: 'Long line: short and long pass',
      uitleg:
        'Four players stand on one line. The outside player plays a short pass into the player next to them, gets it back and then plays the long ball over the two in the middle to the player at the other end. They do the same back the other way. After a few goes, the outside and middle players swap places.',
      organisatie: 'Four cones in one line: the outside two 25 m apart, the middle two 8 m from the outside ones. Four players, one ball. Swap places after 2 minutes.',
      benodigdheden: ['4 cones', '2 balls'],
      coachpunten: ['Short pass firm and onto the right foot so the lay-off can be first time', 'Long ball: standing foot beside the ball, strike under the middle with your instep', 'Receiver: watch the ball in and cushion it'],
      variaties: {
        makkelijker: ['Shorter long ball (18 m)', 'The long ball may go along the ground'],
        moeilijker: ['Long ball first time after the lay-off', 'The middle players move between the outside ones', 'Receive out of the air with one touch'],
      },
    },
    tekening: {
      ...leeg(30, 8),
      objecten: [
        pion('p1', 2.4, 3),
        pion('p2', 10.4, 2.6),
        pion('p3', 19.6, 5.4),
        pion('p4', 27.6, 5),
        speler('a1', 1, 2.4, 4, { kijkrichting: 0 }),
        speler('a2', 2, 10.4, 3.6, { kijkrichting: 180 }),
        speler('a3', 3, 19.6, 4.4, { kijkrichting: 0 }),
        speler('a4', 4, 27.6, 4, { kijkrichting: 180 }),
        bal('bal', 2.95, 4, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }),
        stap({ type: 'pass', van: 'a2', naar: 'a1', direct: true }),
        stap({ type: 'pass', van: 'a1', naar: 'a4', hoogte: 'hoog' }),
        pauze(0.3),
        stap({ type: 'pass', van: 'a4', naar: 'a3' }),
        stap({ type: 'pass', van: 'a3', naar: 'a4', direct: true }),
        stap({ type: 'pass', van: 'a4', naar: 'a1', hoogte: 'hoog' }),
        pauze(0.8),
      ],
    },
  },

  // P5. Passen door het bewegende poortje
  {
    id: 'veld-pt-bewegend-poortje',
    naam: 'Passen door het bewegende poortje',
    categorieen: ['pass-en-trap'],
    uitleg:
      'Twee spelers zijn samen een poortje: ze lopen naast elkaar, op 2 m van elkaar, rustig door het vak. De anderen passen in tweetallen door het poortje heen. Elke goede pass door het poortje is een punt. Omdat het poortje beweegt, moet je goed kijken en het juiste moment kiezen.',
    organisatie: 'Vak van 20 × 20 m. Eén poortje van twee spelers in hesjes; de rest in tweetallen met één bal. Rondes van 1,5 minuut; daarna wordt een ander tweetal het poortje.',
    benodigdheden: ['4 pionnen', '1 bal per tweetal', '2 hesjes'],
    spelersNodig: 6,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Kijk waar het poortje heen loopt en speel op het goede moment', 'Pass strak over de grond, met de binnenkant', 'Na je pass meteen bewegen naar een nieuwe plek'],
    variaties: {
      makkelijker: ['Poortje staat stil', 'Breder poortje (3 m)'],
      moeilijker: ['Twee poortjes', 'Poortje loopt sneller', 'Alleen in één keer passen'],
    },
    en: {
      naam: 'Passing through the moving gate',
      uitleg:
        'Two players together are a gate: they walk side by side, 2 m apart, slowly around the area. The others pass through the gate in pairs. Every good pass through the gate is a point. Because the gate moves, you have to watch carefully and pick the right moment.',
      organisatie: '20 × 20 m area. One gate of two players in bibs; the rest in pairs with one ball. Rounds of 1.5 minutes; then another pair becomes the gate.',
      benodigdheden: ['4 cones', '1 ball per pair', '2 bibs'],
      coachpunten: ['Watch where the gate is going and pass at the right moment', 'Pass firmly along the ground with the inside of the foot', 'After your pass, move straight away to a new space'],
      variaties: {
        makkelijker: ['The gate stands still', 'Wider gate (3 m)'],
        moeilijker: ['Two gates', 'The gate walks faster', 'One-touch passes only'],
      },
    },
    // Een kwartslag gedraaid: zo staan de twee spelers van het poortje in 3D naast elkaar (niet achter elkaar).
    tekening: draai({
      ...leeg(22, 22),
      objecten: [
        zone('z', 11, 11, 20, 20),
        pion('c1', 1, 1),
        pion('c2', 21, 1),
        pion('c3', 1, 21),
        pion('c4', 21, 21),
        B('g1', 5, 11, 9, { kijkrichting: -90 }),
        B('g2', 6, 11, 11, { kijkrichting: -90 }),
        speler('a1', 1, 4, 14, { kijkrichting: 0 }),
        speler('a2', 2, 18, 14, { kijkrichting: 180 }),
        speler('a3', 3, 4, 6, { kijkrichting: 0 }),
        speler('a4', 4, 18, 6, { kijkrichting: 180 }),
        bal('b1', 4.55, 14, 'a1'),
        bal('b2', 4.55, 6, 'a3'),
      ],
      animatie: [
        pauze(0.5),
        // Het poortje loopt omlaag; tweetal 1 past erdoor.
        stap({ type: 'loop', wie: 'g1', naar: [11, 13], manier: 'wandel', duur: 2.2 }, { type: 'loop', wie: 'g2', naar: [11, 15], manier: 'wandel', duur: 2.2 }, { type: 'pass', van: 'a1', naar: 'a2', start: 1.4 }),
        // Het poortje loopt omhoog; tweetal 2 past erdoor, tweetal 1 zoekt een nieuwe plek.
        stap(
          { type: 'loop', wie: 'g1', naar: [11, 5], manier: 'wandel', duur: 4 },
          { type: 'loop', wie: 'g2', naar: [11, 7], manier: 'wandel', duur: 4 },
          { type: 'pass', van: 'a3', naar: 'a4', start: 3.2 },
          { type: 'dribbel', wie: 'a2', naar: [17, 17.5], duur: 1.6 },
          { type: 'loop', wie: 'a1', naar: [5, 17.5], duur: 1.6 },
        ),
        stap({ type: 'loop', wie: 'g1', naar: [11, 14.5], manier: 'wandel', duur: 4.4 }, { type: 'loop', wie: 'g2', naar: [11, 16.5], manier: 'wandel', duur: 4.4 }, { type: 'pass', van: 'a2', naar: 'a1', start: 3.6 }),
        pauze(0.8),
      ],
    }, [11, 11], 90),
  },

  // P6. Kaats en wissel van kant
  {
    id: 'veld-pt-kaats-wissel-van-kant',
    naam: 'Kaats en wissel van kant',
    categorieen: ['pass-en-trap', 'positiespel'],
    uitleg:
      'De verdediger speelt de bal in op de spits, die kort komt. De spits kaatst in één keer op de middenvelder, en die verlegt het spel met een lange pass naar de buitenspeler aan de andere kant. De buitenspeler neemt de bal in de loop mee. Daarna begint het opnieuw, met de bal de andere kant op.',
    organisatie: 'Op een helft: verdediger op 30 m, middenvelder op 22 m, spits op 14 m, twee buitenspelers breed op 20 m. Vijf spelers, twee ballen. Na 4 keer schuift iedereen een plek door.',
    benodigdheden: ['6 pionnen', '2 ballen'],
    spelersNodig: 5,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Spits: kom kort op het moment dat de verdediger opkijkt', 'Kaats op de voet die van de spits af wijst', 'Middenvelder: open staan, zodat je in één beweging kunt verleggen'],
    variaties: {
      makkelijker: ['Middenvelder mag de bal eerst aannemen', 'Buitenspelers dichterbij'],
      moeilijker: ['Een passieve verdediger in de rug van de spits', 'Verleggen in één keer', 'Buitenspeler rondt af op een doel'],
    },
    en: {
      naam: 'Lay-off and switch',
      uitleg:
        'The defender plays the ball into the striker, who comes short. The striker lays it off first time to the midfielder, who switches play with a long pass to the winger on the other side. The winger takes the ball on the run. Then it starts again, with the ball going the other way.',
      organisatie: 'On half a pitch: defender at 30 m, midfielder at 22 m, striker at 14 m, two wingers wide at 20 m. Five players, two balls. After 4 goes everyone moves on one position.',
      benodigdheden: ['6 cones', '2 balls'],
      coachpunten: ['Striker: come short the moment the defender looks up', 'Lay it off onto the foot furthest from the striker', 'Midfielder: stay open so you can switch in one movement'],
      variaties: {
        makkelijker: ['The midfielder may control the ball first', 'Wingers closer in'],
        moeilijker: ['A passive defender behind the striker', 'Switch first time', 'The winger finishes on a goal'],
      },
    },
    tekening: {
      ...leeg(28, 26),
      objecten: [
        pion('pv', 15.6, 24.6),
        pion('pm', 9.8, 16.2),
        pion('ps', 17.2, 5.4),
        pion('pl', 2, 13),
        pion('pr', 26, 13),
        speler('v', 4, 14, 23.4, { kijkrichting: -90 }),
        speler('m', 8, 11.4, 15.6, { kijkrichting: -60 }),
        speler('s', 9, 15.6, 6, { kijkrichting: 90 }),
        speler('l', 11, 3, 12, { kijkrichting: 0 }),
        speler('r', 7, 25, 12, { kijkrichting: 180 }),
        bal('b1', 14, 22.85, 'v'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 's', naar: [15, 9.6], duur: 1 }, { type: 'pass', van: 'v', naar: 's', start: 0.4 }),
        stap({ type: 'pass', van: 's', naar: 'm', direct: true }, { type: 'loop', wie: 'r', naar: [24.6, 15], start: 0.2, duur: 1.2 }),
        stap({ type: 'pass', van: 'm', naar: 'r', hoogte: 'halfhoog' }, { type: 'loop', wie: 'r', naar: [23.4, 9], start: 0.3, manier: 'sprint' }),
        stap({ type: 'dribbel', wie: 'r', naar: [22, 5], duur: 1.2 }, { type: 'loop', wie: 's', naar: [15.6, 6], duur: 1.2 }),
        pauze(0.8),
      ],
    },
  },

  // P7. Zeshoek met de klok mee en tegen
  {
    id: 'veld-pt-zeshoek-richting',
    naam: 'Zeshoek met de klok mee en tegen',
    categorieen: ['pass-en-trap', 'warming-up'],
    uitleg:
      'Zes spelers staan bij zes pionnen in een zeshoek. De bal gaat in één keer rond naar de buurman, met de klok mee. Op het fluitsignaal draait de richting om: wie de bal dan krijgt, speelt hem terug de andere kant op. Blijf klaarstaan, want de bal kan van twee kanten komen.',
    organisatie: 'Zeshoek met zijden van ± 6,5 m, een pion op elke hoek. Zes spelers, één bal; na een minuut een tweede bal erbij. De trainer fluit om de richting te wisselen.',
    benodigdheden: ['6 pionnen', '2 ballen'],
    spelersNodig: 6,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Open staan naar beide buren, zodat je beide kanten op kunt', 'Speel met de voet die het verst van de bal is', 'Op het fluitje meteen omschakelen'],
    variaties: {
      makkelijker: ['Twee keer raken', 'Grotere zeshoek'],
      moeilijker: ['Twee ballen, die tegen elkaar in gaan', 'Na je pass van plek wisselen met je buurman'],
    },
    en: {
      naam: 'Hexagon clockwise and anticlockwise',
      uitleg:
        'Six players stand at six cones in a hexagon. The ball goes round first time to the next player, clockwise. On the whistle the direction changes: whoever gets the ball then plays it back the other way. Stay ready, because the ball can come from either side.',
      organisatie: 'Hexagon with sides of about 6.5 m, a cone on each corner. Six players, one ball; after a minute add a second ball. The coach whistles to change direction.',
      benodigdheden: ['6 cones', '2 balls'],
      coachpunten: ['Stay open to both neighbours so you can go either way', 'Play with the foot furthest from the ball', 'Switch straight away on the whistle'],
      variaties: {
        makkelijker: ['Two touches', 'Bigger hexagon'],
        moeilijker: ['Two balls going opposite ways', 'After your pass, swap places with your neighbour'],
      },
    },
    tekening: {
      ...leeg(20, 18),
      objecten: [
        ...zeshoek.map(([x, y], i) => pion(`p${i}`, +(10 + (x - 10) * 1.15).toFixed(2), +(9 + (y - 9) * 1.15).toFixed(2))),
        ...zeshoek.map(([x, y], i) => speler(`a${i}`, i + 1, x, y, { kijkrichting: Math.round((Math.atan2(9 - y, 10 - x) * 180) / Math.PI) })),
        bal('bal', +(zeshoek[0][0] - 0.55).toFixed(2), zeshoek[0][1], 'a0'),
      ],
      animatie: [
        pauze(0.5),
        ...[1, 2, 3, 4, 5].map((i) => stap({ type: 'pass', van: `a${i - 1}`, naar: `a${i}`, direct: i > 1 })),
        // Fluitje: de andere kant op.
        ...[4, 3, 2].map((i) => stap({ type: 'pass', van: `a${i + 1}`, naar: `a${i}`, direct: true })),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
