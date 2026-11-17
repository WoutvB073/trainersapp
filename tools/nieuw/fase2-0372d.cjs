// Fase 2, deel 3, batch 3 (0.37.2), deel d: eerder overgeslagen voorstellen die toch anders zijn dan een bestaande oefening
// (correctie van de gebruiker, 17-11-2026): 1 tegen 1 D6, D7 en partijvormen PV1, PV6, PV9.
// Draaien: node tools/nieuw/fase2-0372d.cjs
const { zet } = require('./hulp.cjs');
const { keeper, speler, bal, hoedje, pauze, stap, B, C, zone, leeg, doeltje, miniGoal, JO, OUD, MIDDEN, O7, KLEUR } = require('./fase2-hulp.cjs');

const jeugdgoal = (id, x, y, hoek = 0) => ({ id, soort: 'goal', x, y, breedte: 5, hoogte: 2, ...(hoek ? { hoek } : {}) });

// PV6: vier veldjes naast elkaar; per veldje een 2 tegen 2 met één doelpunt.
const VELDJES = [5, 15, 25, 35];
const WINT = ['A', 'B', 'A', 'B'];
const veldObjecten = VELDJES.flatMap((cx, k) => [
  zone(`v${k}`, cx, 8, 8, 12),
  miniGoal(`gt${k}`, cx, 2),
  miniGoal(`gb${k}`, cx, 14, 180),
  speler(`r${k}1`, 1, cx - 1.8, 10, { kijkrichting: -60 }),
  speler(`r${k}2`, 2, cx + 2, 7.6, { kijkrichting: -100 }),
  B(`b${k}1`, 1, cx + 1.8, 4.2, { kijkrichting: 120 }),
  B(`b${k}2`, 2, cx - 2, 6.6, { kijkrichting: 80 }),
  bal(`bal${k}`, WINT[k] === 'A' ? cx - 1.5 : cx + 1.5, WINT[k] === 'A' ? 9.5 : 4.7, WINT[k] === 'A' ? `r${k}1` : `b${k}1`),
]);
const veldActies = VELDJES.flatMap((cx, k) => {
  const s = k * 0.25;
  return WINT[k] === 'A'
    ? [
        { type: 'pass', van: `r${k}1`, naar: `r${k}2`, start: s },
        { type: 'schot', van: `r${k}2`, naar: [cx + 0.3, 1.6], hoogte: 'grond', start: s + 1.5 },
      ]
    : [
        { type: 'pass', van: `b${k}1`, naar: `b${k}2`, start: s },
        { type: 'schot', van: `b${k}2`, naar: [cx - 0.3, 14.4], hoogte: 'grond', start: s + 1.5 },
      ];
});
// Vaste pijlen: winnaars een veldje naar links (boven langs), verliezers een veldje naar rechts (onder langs).
const doorschuiven = VELDJES.slice(0, 3).flatMap((cx, k) => [
  { soort: 'loop', punten: [[VELDJES[k + 1] - 2, 0.7], [cx + 2, 0.7]] },
  { soort: 'loop', punten: [[cx + 2, 15.4], [VELDJES[k + 1] - 2, 15.4]] },
]);

const oefeningen = [
  // D6. Vier doeltjes in het kruis
  {
    id: 'veld-een-vier-doeltjes-kruis',
    naam: 'Vier doeltjes in het kruis',
    categorieen: ['een-tegen-een'],
    uitleg:
      'Eén tegen één in een vierkant met in het midden van elke zijde een doeltje. Rood verdedigt de doeltjes boven en links, blauw die van onder en rechts. Je scoort in een van de twee doeltjes van de ander. Omdat de doeltjes om een hoek liggen, kun je met één actie van richting wisselen: kijk welk doeltje open ligt.',
    organisatie: 'Vierkant van 14 × 14 m met vier kleine doeltjes, één in het midden van elke zijde. Duels van 45 seconden; na een doelpunt begint de ander met de bal in het midden. Wachtende tweetallen naast het vak.',
    benodigdheden: ['4 kleine doeltjes', '4 hoedjes', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Laat de verdediger kiezen welk doeltje hij dekt, en ga naar het andere', 'Een kap of draai brengt je in één keer naar het andere doeltje', 'Verdediger: sta tussen de bal en beide doeltjes in'],
    variaties: {
      makkelijker: ['Groter vierkant', 'Grotere doeltjes'],
      moeilijker: ['Kleiner vierkant', 'Een goal telt pas na een actie'],
    },
    en: {
      naam: 'Four goals in a cross',
      uitleg:
        'One against one in a square with a mini goal in the middle of each side. Red defends the top and left goals, blue the bottom and right ones. You score in either of the other player’s two goals. Because the goals are round a corner, one move lets you change direction: see which goal is open.',
      organisatie: '14 × 14 m square with four mini goals, one in the middle of each side. Duels of 45 seconds; after a goal the other player starts with the ball in the middle. Waiting pairs beside the square.',
      benodigdheden: ['4 mini goals', '4 disc cones', 'Balls'],
      coachpunten: ['Let the defender choose which goal to cover, and go for the other one', 'A cut or turn takes you to the other goal in one go', 'Defender: stand between the ball and both goals'],
      variaties: {
        makkelijker: ['Bigger square', 'Bigger goals'],
        moeilijker: ['Smaller square', 'A goal only counts after a move'],
      },
    },
    tekening: {
      ...leeg(16, 16),
      objecten: [
        zone('z', 8, 8, 14, 14),
        doeltje('gN', 8, 1, 0, 2),
        doeltje('gS', 8, 15, 180, 2),
        doeltje('gW', 1, 8, -90, 2),
        doeltje('gE', 15, 8, 90, 2),
        speler('a1', 1, 6, 6.6, { kijkrichting: 45 }),
        B('b1', 2, 9.6, 10.2, { kijkrichting: -135 }),
        bal('bal', 6.4, 7, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [6.8, 9.2] }, { type: 'loop', wie: 'b1', naar: [8.2, 11.4], manier: 'verdedigend' }),
        stap({ type: 'schijn', wie: 'a1', kant: 'rechts' }),
        stap({ type: 'dribbel', wie: 'a1', via: [[9, 8.4]], naar: [12, 7.8], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [10.6, 10.2], manier: 'verdedigend', start: 0.3 }),
        stap({ type: 'schot', van: 'a1', naar: [15.3, 8.2], hoogte: 'grond' }),
        pauze(0.8),
      ],
    },
  },

  // D7. Krokodillenrivier met twee oevers (O7)
  {
    id: 'veld-een-krokodillenrivier-twee-oevers',
    naam: 'Krokodillenrivier met twee oevers',
    categorieen: ['een-tegen-een'],
    uitleg:
      'Er stromen twee rivieren achter elkaar, en in elke rivier woont een krokodil. Dribbel met je bal door de eerste rivier zonder dat de krokodil hem pakt, en dan door de tweede. Kom je langs allebei, dan mag je scoren in het goaltje! De krokodillen blijven in hun eigen rivier. Pakt een krokodil je bal, dan ruil je met hem.',
    organisatie: 'Baan van 12 × 20 m met twee rivieren van 4 m breed (hoedjes), met 3 m oever ertussen. In elke rivier een krokodil met een hesje. Aan het eind een mini-goaltje. De kinderen gaan om de beurt, ieder met een bal.',
    benodigdheden: ['1 mini-goaltje', '10 hoedjes', 'Voetballen', '2 hesjes'],
    spelersNodig: 3,
    keepersNodig: 0,
    leeftijden: O7,
    doorwisselbaar: true,
    coachpunten: ['Dribbel de krokodil voorbij aan de kant waar hij níet staat', 'Na de rivier even rustig: kijk waar de tweede krokodil is', 'Krokodil: blijf in je rivier, laag door je knieën'],
    variaties: {
      makkelijker: ['Smallere rivieren', 'De krokodil mag alleen lopen'],
      moeilijker: ['Bredere rivieren', 'Twee krokodillen in de tweede rivier'],
    },
    en: {
      naam: 'Crocodile river with two banks',
      uitleg:
        'There are two rivers, one after the other, and a crocodile lives in each one. Dribble your ball through the first river without the crocodile taking it, and then through the second. Get past both and you may score in the little goal! The crocodiles stay in their own river. If a crocodile takes your ball, you swap with it.',
      organisatie: 'A 12 × 20 m lane with two rivers 4 m wide (disc cones) and a 3 m bank between them. A crocodile in a bib in each river. A mini goal at the end. The children go in turn, each with a ball.',
      benodigdheden: ['1 mini goal', '10 disc cones', 'Footballs', '2 bibs'],
      coachpunten: ['Dribble past the crocodile on the side where it is not', 'After the river, slow down for a moment: see where the second crocodile is', 'Crocodile: stay in your river, low with bent knees'],
      variaties: {
        makkelijker: ['Narrower rivers', 'The crocodile may only walk'],
        moeilijker: ['Wider rivers', 'Two crocodiles in the second river'],
      },
    },
    tekening: {
      ...leeg(12, 22),
      objecten: [
        zone('r1', 6, 15, 10, 4, KLEUR.blauw),
        zone('r2', 6, 8, 10, 4, KLEUR.blauw),
        miniGoal('g1', 6, 1.4),
        speler('a1', 1, 6, 20, { kijkrichting: -90 }),
        B('k1', 2, 5, 15, { kijkrichting: 90 }),
        B('k2', 3, 7, 8, { kijkrichting: 90 }),
        bal('bal', 6, 19.45, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [6, 18.4] }, { type: 'loop', wie: 'k1', naar: [6.2, 15.8], manier: 'verdedigend' }),
        stap({ type: 'schijn', wie: 'a1', kant: 'rechts' }, { type: 'loop', wie: 'k1', naar: [6.8, 15.6], manier: 'verdedigend', duur: 0.5 }),
        stap({ type: 'dribbel', wie: 'a1', via: [[3.4, 15.6]], naar: [3.8, 11.8], manier: 'sprint' }, { type: 'loop', wie: 'k1', naar: [5.2, 14.8], manier: 'verdedigend', start: 0.2 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [5.4, 11.2] }, { type: 'loop', wie: 'k2', naar: [5.8, 8.8], manier: 'verdedigend' }),
        stap({ type: 'dribbel', wie: 'a1', via: [[8.4, 8.6]], naar: [8, 5], manier: 'sprint' }, { type: 'loop', wie: 'k2', naar: [6.4, 7.4], manier: 'verdedigend', start: 0.3 }),
        stap({ type: 'schot', van: 'a1', naar: [6.2, 1.0], hoogte: 'grond' }),
        pauze(0.8),
      ],
    },
  },

  // PV1. 4 tegen 4 met drie teams
  {
    id: 'veld-pv-4-4-drie-teams',
    naam: '4 tegen 4 met drie teams',
    categorieen: ['partijvormen'],
    uitleg:
      'Drie teams van vier. Twee teams spelen 4 tegen 4 met keepers; het derde team wacht naast het veld. Wie een goal tegen krijgt, gaat er meteen uit en het wachtende team komt er direct in: de keeper speelt meteen een nieuwe bal in. Zo staat er altijd druk op en is er bijna geen pauze.',
    organisatie: 'Vak van 30 × 36 m met twee jeugdgoals en keepers. Drie teams van vier in hesjes; het wachtende team staat naast het veld bij de middenlijn. Speel 15 minuten; elk team telt zijn goals.',
    benodigdheden: ['2 jeugdgoals', '8 pionnen', 'Ballen', 'Hesjes in 3 kleuren'],
    spelersNodig: 12,
    keepersNodig: 2,
    leeftijden: JO,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: drie teams van vijf op een groter veld, of vier teams en twee velden.',
    coachpunten: ['Na een goal: snel wisselen, het nieuwe team begint meteen', 'Het wachtende team kijkt mee: hoe speelt het team dat blijft?', 'Durf af te ronden: een goal houdt je team in het veld'],
    variaties: {
      makkelijker: ['Het nieuwe team krijgt de bal', 'Groter veld'],
      moeilijker: ['Ook na 2 minuten zonder goal gaat het team met de minste kansen eruit', 'Maximaal drie aanrakingen'],
    },
    en: {
      naam: '4v4 with three teams',
      uitleg:
        'Three teams of four. Two teams play 4v4 with keepers; the third team waits beside the pitch. Whoever concedes a goal comes off at once and the waiting team comes straight on: the keeper plays a new ball in straight away. There is always pressure and hardly any break.',
      organisatie: '30 × 36 m area with two youth goals and keepers. Three teams of four in bibs; the waiting team stands beside the pitch at the halfway line. Play for 15 minutes; each team counts its goals.',
      benodigdheden: ['2 youth goals', '8 cones', 'Balls', 'Bibs in 3 colours'],
      meerSpelers: 'With more players: three teams of five on a bigger pitch, or four teams and two pitches.',
      coachpunten: ['After a goal: change quickly, the new team starts straight away', 'The waiting team watches: how does the team that stays on play?', 'Dare to finish: a goal keeps your team on'],
      variaties: {
        makkelijker: ['The new team gets the ball', 'Bigger pitch'],
        moeilijker: ['After 2 minutes without a goal, the team with fewer chances also comes off', 'Three touches maximum'],
      },
    },
    tekening: {
      ...leeg(48, 40),
      objecten: [
        zone('z', 23, 20, 30, 36),
        jeugdgoal('gT', 23, 2),
        jeugdgoal('gB', 23, 38, 180),
        keeper('kT', 1, 23, 3.4, { verdedigt: 'gT' }),
        keeper('kB', 1, 23, 36.6, { verdedigt: 'gB' }),
        speler('a1', 4, 16, 26, { kijkrichting: -60 }),
        speler('a2', 8, 30, 24, { kijkrichting: -90 }),
        speler('a3', 10, 18, 14, { kijkrichting: -90 }),
        speler('a4', 9, 28, 12, { kijkrichting: -90 }),
        B('b1', 6, 20, 20, { kijkrichting: 90 }),
        B('b2', 8, 33, 19, { kijkrichting: 90 }),
        B('b3', 4, 18, 9, { kijkrichting: 90 }),
        B('b4', 3, 26, 7, { kijkrichting: 90 }),
        C('c1', 4, 3, 10, { kijkrichting: 0 }),
        C('c2', 6, 3, 14, { kijkrichting: 0 }),
        C('c3', 8, 3, 18, { kijkrichting: 0 }),
        C('c4', 9, 3, 22, { kijkrichting: 0 }),
        bal('bal', 16.3, 25.5, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'druk', wie: 'b2', op: 'a2', afstand: 2.4, start: 0.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'a4' }, { type: 'loop', wie: 'b1', naar: [22, 16], start: 0.3 }),
        stap({ type: 'dribbel', wie: 'a4', naar: [32, 9] }, { type: 'loop', wie: 'b4', naar: [27, 6.4], manier: 'verdedigend', start: 0.2 }),
        stap({ type: 'schot', van: 'a4', naar: [24.8, 1.8], hoogte: 'laag', afloop: 'goal' }),
        pauze(0.4),
        // Blauw kreeg de goal tegen: eruit (naar rechts). Groen komt er direct in (van links).
        stap(
          { type: 'loop', wie: 'b1', naar: [44, 22] },
          { type: 'loop', wie: 'b2', naar: [44, 18] },
          { type: 'loop', wie: 'b3', naar: [44, 13] },
          { type: 'loop', wie: 'b4', via: [[33, 4.6]], naar: [44, 5] },
          { type: 'loop', wie: 'c1', naar: [20, 8], manier: 'sprint', start: 0.6 },
          { type: 'loop', wie: 'c2', naar: [14, 12.6], manier: 'sprint', start: 0.6 },
          { type: 'loop', wie: 'c3', naar: [13, 19], manier: 'sprint', start: 0.6 },
          { type: 'loop', wie: 'c4', naar: [12, 25], manier: 'sprint', start: 0.6 },
        ),
        pauze(0.8),
      ],
    },
  },

  // PV6. Toernooi 2 tegen 2 op vier veldjes (O7, JO8–11)
  {
    id: 'veld-pv-toernooi-2-2-vier-veldjes',
    naam: 'Toernooi 2 tegen 2 op vier veldjes',
    categorieen: ['partijvormen'],
    uitleg:
      'Vier veldjes naast elkaar, op elk veldje een wedstrijdje 2 tegen 2 van twee minuten. Daarna schuiven de winnaars een veldje op naar links, de verliezers een veldje naar rechts. Wie op het veldje helemaal links wint, blijft daar staan: dat is het kampioensveld. Bij gelijkspel beslist een penalty.',
    organisatie: 'Vier veldjes van 8 × 12 m naast elkaar, 2 m ertussen, elk met twee mini-goaltjes. Tweetallen in hesjes; met 8 kinderen speel je op twee veldjes, met 16 op alle vier. De trainer fluit begin en eind.',
    benodigdheden: ['8 mini-goaltjes', '16 hoedjes', 'Voetballen', 'Hesjes'],
    spelersNodig: 8,
    keepersNodig: 0,
    leeftijden: ['mini-5-7', 'jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Samen spelen: pass als je maatje vrij staat', 'Na het fluitje snel doorschuiven, het volgende potje begint meteen', 'Goed verliezen en goed winnen: geef elkaar een hand'],
    variaties: {
      makkelijker: ['Wedstrijdjes van drie minuten', 'Grotere goaltjes'],
      moeilijker: ['Wedstrijdjes van één minuut', 'Een goal telt pas na een pass'],
    },
    en: {
      naam: '2v2 tournament on four pitches',
      uitleg:
        'Four little pitches side by side, with a two-minute 2v2 game on each. Then the winners move one pitch to the left and the losers one pitch to the right. Whoever wins on the pitch furthest left stays there: that is the champions’ pitch. If it is a draw, a penalty decides.',
      organisatie: 'Four 8 × 12 m pitches side by side, 2 m apart, each with two mini goals. Pairs in bibs; with 8 children you play on two pitches, with 16 on all four. The coach blows the whistle to start and stop.',
      benodigdheden: ['8 mini goals', '16 disc cones', 'Footballs', 'Bibs'],
      coachpunten: ['Play together: pass when your partner is free', 'After the whistle, move on quickly, the next game starts straight away', 'Win well and lose well: shake hands'],
      variaties: {
        makkelijker: ['Three-minute games', 'Bigger goals'],
        moeilijker: ['One-minute games', 'A goal only counts after a pass'],
      },
    },
    tekening: {
      ...leeg(40, 16.4, 'boven'),
      objecten: veldObjecten,
      lijnen: doorschuiven,
      animatie: [pauze(0.5), stap(...veldActies), pauze(1.2)],
    },
  },

  // PV9. Partij met een schietlijn
  {
    id: 'veld-pv-schietlijn',
    naam: 'Partij met een schietlijn',
    categorieen: ['partijvormen', 'afwerken'],
    uitleg:
      'Partijspel 4 tegen 4 met keepers. Voor elk doel ligt een schietlijn op 12 meter: scoren mag alleen van achter die lijn. Een goal van dichterbij telt niet. Zo leer je schieten van afstand, en leer je als verdediger dat je ook ver van je doel al druk moet zetten.',
    organisatie: 'Vak van 32 × 44 m met twee jeugdgoals en keepers. Schietlijn van pionnen op 12 m van elk doel. Twee teams van vier. Rondes van 6 minuten.',
    benodigdheden: ['2 jeugdgoals', '8 pionnen', 'Ballen', 'Hesjes in 2 kleuren'],
    spelersNodig: 8,
    keepersNodig: 2,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Kijk op voor je schiet: is er ruimte, schiet dan meteen', 'Laag en hard, in de hoek', 'Verdedigers: zet al bij de schietlijn druk op de bal'],
    variaties: {
      makkelijker: ['Schietlijn op 9 m', 'Een goal van dichtbij telt ook, een goal van ver dubbel'],
      moeilijker: ['Schietlijn op 15 m', 'Alleen in één keer schieten telt'],
    },
    en: {
      naam: 'Game with a shooting line',
      uitleg:
        'A 4v4 game with keepers. In front of each goal there is a shooting line at 12 metres: you may only score from behind that line. A goal from closer in does not count. You learn to shoot from distance, and as a defender you learn that you have to press even far from your goal.',
      organisatie: '32 × 44 m area with two youth goals and keepers. Shooting line of cones 12 m from each goal. Two teams of four. Rounds of 6 minutes.',
      benodigdheden: ['2 youth goals', '8 cones', 'Balls', 'Bibs in 2 colours'],
      coachpunten: ['Look up before you shoot: if there is space, shoot straight away', 'Low and hard, into the corner', 'Defenders: press the ball already at the shooting line'],
      variaties: {
        makkelijker: ['Shooting line at 9 m', 'A goal from close in counts too, one from distance counts double'],
        moeilijker: ['Shooting line at 15 m', 'Only first-time shots count'],
      },
    },
    tekening: {
      ...leeg(36, 44),
      objecten: [
        zone('z', 18, 22, 32, 42),
        zone('sT', 18, 7.5, 32, 13, KLEUR.rood),
        zone('sB', 18, 36.5, 32, 13, KLEUR.rood),
        jeugdgoal('gT', 18, 1),
        jeugdgoal('gB', 18, 43, 180),
        keeper('kT', 1, 18, 2.4, { verdedigt: 'gT' }),
        keeper('kB', 1, 18, 41.6, { verdedigt: 'gB' }),
        speler('a1', 4, 10, 30, { kijkrichting: -60 }),
        speler('a2', 8, 22, 24, { kijkrichting: -90 }),
        speler('a3', 10, 8, 18, { kijkrichting: -90 }),
        speler('a4', 9, 27, 16, { kijkrichting: -90 }),
        B('b1', 6, 13, 20, { kijkrichting: 90 }),
        B('b2', 8, 19, 17.4, { kijkrichting: 90 }),
        B('b3', 7, 28, 22.4, { kijkrichting: 90 }),
        B('b4', 4, 11, 11, { kijkrichting: 90 }),
        bal('bal', 10.3, 29.5, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'druk', wie: 'b3', op: 'a2', afstand: 2.4, start: 0.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'a4' }),
        stap({ type: 'dribbel', wie: 'a4', naar: [24, 14.4] }, { type: 'druk', wie: 'b2', op: 'a4', afstand: 2.6, start: 0.2 }),
        stap({ type: 'schot', van: 'a4', naar: [16.4, 0.8], hoogte: 'laag', afloop: 'goal' }),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
