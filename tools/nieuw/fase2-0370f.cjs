// Fase 2, deel 3, batch 1 (0.37.0), deel f: Spelletjes S2–S5 en S7 uit VOORSTEL-OEFENINGEN.md.
// Overgeslagen (vrijwel gelijk aan een bestaande oefening): S1 (veld-sp-latje-trap), S6 (veld-af-kleine-doeltjes), S8 (veld-mt-eieren-rapen).
// Draaien: node tools/nieuw/fase2-0370f.cjs
const { zet } = require('./hulp.cjs');
const { goal, speler, trainer, bal, pion, hoedje, pauze, stap, B, C, zone, leeg, miniGoal, pionHoog, JO, OUD, MIDDEN, KLEUR, draai } = require('./fase2-hulp.cjs');
const J = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'J', ...extra });

const oefeningen = [
  // S2. Rondje om het doel
  {
    id: 'veld-sp-rondje-om-het-doel',
    naam: 'Rondje om het doel',
    categorieen: ['spelletjes', 'afwerken'],
    uitleg:
      'Iedereen staat in een rij voor het doel, één speler staat erin als keeper. De voorste dribbelt naar de schietlijn en schiet. Daarna rent hij het doel in en wordt hij de nieuwe keeper; de oude keeper sluit achteraan de rij aan. Krijg je als keeper een doelpunt tegen, dan verlies je een leven. Wie heeft na drie levens nog de meeste over?',
    organisatie: 'Op een half veld met een groot doel (of een jeugdgoal). Schietlijn op 14 m. Iedereen begint met drie levens; wie geen levens meer heeft, mag nog wel schieten. Rondes van 5 minuten.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen', '1 keepershesje'],
    spelersNodig: 4,
    keepersNodig: 0,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: [
      'Schiet laag en in de hoek, dat is het moeilijkst voor een keeper',
      'Na je schot meteen sprinten: in het doel wacht de volgende bal',
      'Keeper: klaarstaan op je voorvoeten, handen voor je',
    ],
    variaties: {
      makkelijker: ['Schieten vanaf 10 m', 'Twee levens per keer kwijt? Nee, alleen bij een doelpunt'],
      moeilijker: ['Alleen in één keer schieten na een pass van de trainer', 'Schieten met je zwakke voet', 'Schietlijn op 18 m'],
    },
    en: {
      naam: 'Round the goal',
      uitleg:
        'Everyone stands in a line in front of the goal, with one player in goal as keeper. The front player dribbles to the shooting line and shoots. Then they run into the goal and become the new keeper; the old keeper joins the back of the line. If you concede a goal as keeper, you lose a life. Who has the most lives left out of three?',
      organisatie:
        'On half a pitch with a full-size goal (or a youth goal). Shooting line at 14 m. Everyone starts with three lives; once you are out of lives you can still shoot. Rounds of 5 minutes.',
      benodigdheden: ['Goal', '2 cones', 'Balls', '1 goalkeeper bib'],
      coachpunten: [
        'Shoot low into the corner: that is hardest for a keeper',
        'Sprint straight after your shot: the next ball is waiting in goal',
        'Keeper: get set on the balls of your feet, hands in front of you',
      ],
      variaties: {
        makkelijker: ['Shoot from 10 m', 'Only lose a life for a goal, not for a save that spills'],
        moeilijker: ['Shoot first time only, after a pass from the coach', 'Shoot with your weaker foot', 'Shooting line at 18 m'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 20, y: -3, breedte: 28, lengte: 26 },
      camera: 'schuin',
      rijen: [{ id: 'r1', x: 31, y: 19.5, richting: 120, spelers: ['a1', 'a2', 'a3'] }],
      objecten: [
        goal,
        pion('s1', 27, 14.6),
        pion('s2', 41, 14.6),
        J('k', 4, 34, 1.6, { kijkrichting: 90 }),
        speler('a1', 1, 0, 0),
        speler('a2', 2, 0, 0),
        speler('a3', 3, 0, 0),
        bal('b1', 0, 0, 'a1'),
        bal('b2', 0, 0, 'a2'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [32.6, 15.4] }),
        stap({ type: 'schot', van: 'a1', naar: [37.2, 0.2], hoogte: 'grond' }, { type: 'loop', wie: 'k', naar: [35.4, 1.7], start: 0.15, duur: 0.5, manier: 'zijwaarts', kijk: 90 }),
        // Wie schoot, wordt keeper; de keeper sluit aan.
        stap({ type: 'loop', wie: 'a1', via: [[31.4, 6]], naar: [34, 1.6], manier: 'sprint' }, { type: 'loop', wie: 'k', via: [[38.6, 4]], naar: [40, 12], start: 0.2, spoor: false }),
        stap(
          { type: 'team', wie: 'a1', team: 'J' },
          { type: 'team', wie: 'k', team: 'A' },
          { type: 'draai', wie: 'a1', kijk: 90 },
          { type: 'aansluiten', wie: 'k', rij: 'r1' },
          { type: 'dribbel', wie: 'a2', naar: [34.8, 15.6], start: 2.2 },
        ),
        stap({ type: 'schot', van: 'a2', naar: [31, 0.2], hoogte: 'grond' }, { type: 'loop', wie: 'a1', naar: [32.8, 1.7], start: 0.1, duur: 0.45, manier: 'zijwaarts', kijk: 90 }),
        pauze(0.8),
      ],
    },
  },

  // S3. Voetbalbowlen
  {
    id: 'veld-sp-voetbalbowlen',
    naam: 'Voetbalbowlen',
    categorieen: ['spelletjes', 'pass-en-trap'],
    uitleg:
      'Zes hoge pionnen staan in een driehoek, net als kegels bij het bowlen. Rol de bal met een strakke pass over de grond en probeer zoveel mogelijk pionnen om te krijgen. Elke pion die omvalt is een punt. Daarna zet je ze weer rechtop voor de volgende.',
    organisatie:
      'Driehoek van 6 hoge pionnen (3-2-1), 30 cm uit elkaar. Passlijn op 6 m (O7) tot 8 m (JO8–11). Twee banen naast elkaar, twee of drie kinderen per baan; elk kind twee beurten per ronde.',
    benodigdheden: ['12 hoge pionnen', '4 hoedjes', 'Voetballen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: ['mini-5-7', 'jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Standbeen naast de bal, tenen naar de pionnen', 'Speel met de binnenkant, strak over de grond', 'Mik op de voorste pion, net een beetje opzij'],
    variaties: {
      makkelijker: ['Dichterbij', 'Pionnen verder uit elkaar'],
      moeilijker: ['Met je andere voet', 'Verder weg', 'Eerst de bal aannemen van een maatje en dan in één keer'],
    },
    en: {
      naam: 'Football bowling',
      uitleg:
        'Six tall cones stand in a triangle, like pins at bowling. Roll the ball with a firm pass along the ground and try to knock over as many cones as you can. Every cone that falls is a point. Then stand them up again for the next player.',
      organisatie:
        'Triangle of 6 tall cones (3-2-1), 30 cm apart. Passing line at 6 m (U7) to 8 m (U8–U11). Two lanes side by side, two or three children per lane; each child has two goes per round.',
      benodigdheden: ['12 tall cones', '4 disc cones', 'Balls'],
      coachpunten: ['Standing foot beside the ball, toes pointing at the cones', 'Pass with the inside of your foot, firmly along the ground', 'Aim at the front cone, just slightly to one side'],
      variaties: {
        makkelijker: ['Closer', 'Cones further apart'],
        moeilijker: ['With your other foot', 'Further away', 'Receive the ball from a partner first, then strike it first time'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [
        ...[
          [4, 3.4],
          [3.6, 2.7],
          [4.4, 2.7],
          [3.2, 2],
          [4, 2],
          [4.8, 2],
        ].map(([x, y], i) => pionHoog(`k${i}`, x, y, KLEUR.geel)),
        ...[
          [10, 3.4],
          [9.6, 2.7],
          [10.4, 2.7],
          [9.2, 2],
          [10, 2],
          [10.8, 2],
        ].map(([x, y], i) => pionHoog(`m${i}`, x, y, KLEUR.geel)),
        hoedje('l1', 4, 10.6),
        hoedje('l2', 10, 10.6),
        speler('a1', 1, 4, 11.4, { kijkrichting: -90 }),
        speler('a2', 2, 10, 11.4, { kijkrichting: -90 }),
        bal('b1', 4, 10.85, 'a1'),
        bal('b2', 10, 10.85, 'a2'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: [4.05, 3.95] }, { type: 'pass', van: 'a2', naar: [10.35, 3.95], start: 0.4 }),
        stap(
          { type: 'valOm', object: 'k0', hoek: -80 },
          { type: 'valOm', object: 'k1', hoek: -110, start: 0.1 },
          { type: 'valOm', object: 'k2', hoek: -60, start: 0.12 },
          { type: 'valOm', object: 'k4', hoek: -95, start: 0.25 },
          { type: 'valOm', object: 'm2', hoek: -70, start: 0.4 },
          { type: 'valOm', object: 'm5', hoek: -55, start: 0.55 },
          { type: 'valOm', object: 'm0', hoek: -100, start: 0.42 },
        ),
        pauze(1.4),
      ],
    },
  },

  // S4. Voetbalkegelen in teams
  {
    id: 'veld-sp-voetbalkegelen-teams',
    naam: 'Voetbalkegelen in teams',
    categorieen: ['spelletjes', 'pass-en-trap'],
    uitleg:
      'Elk team staat op zijn eigen helft en heeft vier pionnen achter zich. Je probeert met een pass over de grond de pionnen van de andere ploeg om te spelen, en je beschermt je eigen pionnen door ballen tegen te houden. Je mag niet over de middenlijn. Het team met de laatste pion die nog staat, wint.',
    organisatie:
      'Veld van 20 × 16 m met een middenlijn; vier pionnen op elke achterlijn. Twee teams van 3 tot 4, drie of vier ballen in het spel. Omgevallen pionnen blijven liggen tot het eind van de ronde.',
    benodigdheden: ['8 pionnen', '6 hoedjes', '4 ballen', 'Hesjes'],
    spelersNodig: 6,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Kijk op voor je speelt: waar staat een pion vrij?', 'Strak over de grond, dan is de bal lastig te stoppen', 'Verdedigen: stap achter de bal en houd hem met je zool tegen'],
    variaties: {
      makkelijker: ['Minder ballen in het spel', 'Pionnen dichter bij de middenlijn'],
      moeilijker: ['Alleen in één keer spelen', 'Met je zwakke voet', 'Meer ballen'],
    },
    en: {
      naam: 'Team skittles',
      uitleg:
        'Each team stands in its own half with four cones behind them. Try to knock over the other team’s cones with a pass along the ground, and protect your own cones by stopping their balls. You may not cross the halfway line. The team with the last cone still standing wins.',
      organisatie: '20 × 16 m pitch with a halfway line; four cones on each end line. Two teams of 3 or 4, with three or four balls in play. Fallen cones stay down until the end of the round.',
      benodigdheden: ['8 cones', '6 disc cones', '4 balls', 'Bibs'],
      coachpunten: ['Look up before you pass: where is a cone unprotected?', 'Firm along the ground makes the ball hard to stop', 'Defending: step behind the ball and stop it with your sole'],
      variaties: {
        makkelijker: ['Fewer balls in play', 'Cones closer to the halfway line'],
        moeilijker: ['One touch only', 'Weaker foot', 'More balls'],
      },
    },
    tekening: {
      ...leeg(22, 18),
      objecten: [
        zone('z', 11, 9, 20, 16),
        hoedje('m1', 1, 9),
        hoedje('m2', 11, 9),
        hoedje('m3', 21, 9),
        ...[4, 8.7, 13.3, 18].map((x, i) => pion(`a${i}p`, x, 16.4, KLEUR.rood)),
        ...[4, 8.7, 13.3, 18].map((x, i) => pion(`b${i}p`, x, 1.6, KLEUR.blauw)),
        speler('a1', 1, 5, 13, { kijkrichting: -90 }),
        speler('a2', 2, 11, 12.4, { kijkrichting: -90 }),
        speler('a3', 3, 17, 13, { kijkrichting: -90 }),
        B('b1', 4, 6.2, 5, { kijkrichting: 90 }),
        B('b2', 5, 11.8, 5.6, { kijkrichting: 90 }),
        B('b3', 6, 16.2, 5, { kijkrichting: 90 }),
        bal('ba', 5, 12.45, 'a1'),
        bal('bb', 16.2, 5.55, 'b3'),
      ],
      animatie: [
        pauze(0.5),
        // Rood speelt op de vrije pion; blauw verdedigt een andere.
        stap({ type: 'pass', van: 'a1', naar: [8.7, 2.15] }, { type: 'loop', wie: 'b1', naar: [5.4, 3.6], start: 0.1, duur: 0.8 }),
        stap({ type: 'valOm', object: 'b1p', hoek: -80 }, { type: 'pass', van: 'b3', naar: [13.3, 15.85] }),
        stap({ type: 'loop', wie: 'a2', naar: [12.6, 14.4], manier: 'sprint', duur: 0.7 }),
        stap({ type: 'pak', wie: 'a2' }),
        pauze(1),
      ],
    },
  },

  // S5. Hooghoudwedstrijd met levens
  {
    id: 'veld-sp-hooghouden-levens',
    naam: 'Hooghoudwedstrijd met levens',
    categorieen: ['spelletjes', 'techniek'],
    uitleg:
      'In een kring van vier houden jullie samen de bal hoog. Je mag de bal zo vaak raken als je wilt voordat je hem doorspeelt, maar hij mag de grond niet raken. Laat jij hem vallen, dan verlies je een leven. Wie heeft na vijf minuten de meeste levens over?',
    organisatie: 'Kringen van 4 spelers, ongeveer 5 m doorsnee, één bal per kring. Iedereen begint met drie levens. Met een stuit tussendoor mag in het begin.',
    benodigdheden: ['1 bal per kring', '4 hoedjes per kring'],
    spelersNodig: 4,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Speel de bal zacht en hoog genoeg voor je maatje', 'Eerst zelf controleren, dan doorspelen', 'Blijf op je voorvoeten, klaar om te bewegen'],
    variaties: {
      makkelijker: ['Eén stuit mag altijd', 'Kleinere kring'],
      moeilijker: ['Maximaal twee keer raken', 'Alleen met je zwakke voet en je hoofd', 'Hele kring telt hardop: wie haalt het record?'],
    },
    en: {
      naam: 'Keepy-up challenge with lives',
      uitleg:
        'In a circle of four, keep the ball up together. You may touch the ball as often as you like before passing it on, but it must not touch the ground. If you let it drop, you lose a life. Who has the most lives left after five minutes?',
      organisatie: 'Circles of 4 players, about 5 m across, one ball per circle. Everyone starts with three lives. One bounce in between is allowed at first.',
      benodigdheden: ['1 ball per circle', '4 disc cones per circle'],
      coachpunten: ['Play the ball softly and high enough for your teammate', 'Control it yourself first, then pass it on', 'Stay on the balls of your feet, ready to move'],
      variaties: {
        makkelijker: ['One bounce is always allowed', 'Smaller circle'],
        moeilijker: ['Two touches maximum', 'Weaker foot and head only', 'The whole circle counts out loud: who sets the record?'],
      },
    },
    // Een achtste slag gedraaid, zodat in 3D niemand achter een ander staat.
    tekening: draai(
      {
        ...leeg(10, 10),
        objecten: [
          hoedje('h1', 5, 1.5),
          hoedje('h2', 8.5, 5),
          hoedje('h3', 5, 8.5),
          hoedje('h4', 1.5, 5),
          speler('a1', 1, 5, 2.6, { kijkrichting: 90 }),
          speler('a2', 2, 7.4, 5, { kijkrichting: 180 }),
          speler('a3', 3, 5, 7.4, { kijkrichting: -90 }),
          speler('a4', 4, 2.6, 5, { kijkrichting: 0 }),
          bal('bal', 5, 3.15, 'a1'),
        ],
        animatie: [
          pauze(0.5),
          stap({ type: 'pass', van: 'a1', naar: 'a1', hoogte: 1.1 }),
          stap({ type: 'pass', van: 'a1', naar: 'a2', hoogte: 1.6, eindHoogte: 0.9 }),
          stap({ type: 'pass', van: 'a2', naar: 'a2', hoogte: 1, direct: true }),
          stap({ type: 'pass', van: 'a2', naar: 'a3', hoogte: 1.6, eindHoogte: 1.7 }),
          stap({ type: 'pass', van: 'a3', naar: 'a4', hoogte: 1.4, eindHoogte: 0.8, direct: true }),
          stap({ type: 'pass', van: 'a4', naar: 'a4', hoogte: 1.1, direct: true }),
          stap({ type: 'pass', van: 'a4', naar: 'a1', hoogte: 1.5, eindHoogte: 0.9 }),
          pauze(0.8),
        ],
      },
      [5, 5],
      45,
    ),
  },

  // S7. Chaosvoetbal met vier doeltjes en drie ballen
  {
    id: 'veld-sp-chaosvoetbal',
    naam: 'Chaosvoetbal met vier doeltjes en drie ballen',
    categorieen: ['spelletjes', 'partijvormen'],
    uitleg:
      'Twee teams spelen tegelijk met drie ballen. Elk team verdedigt twee doeltjes en mag scoren in de twee doeltjes van de ander. Overal op het veld gebeurt iets, dus kijk goed om je heen: waar is een bal, waar is een vrij doeltje? Scoor je, dan haal je de bal snel terug en speel je verder.',
    organisatie: 'Veld van 20 × 15 m met op elke korte kant twee mini-goaltjes. Twee teams van 4 tot 5, drie ballen tegelijk in het spel. Rondes van 3 minuten; tel alle doelpunten.',
    benodigdheden: ['4 mini-goaltjes', '4 hoedjes', '3 voetballen', 'Hesjes'],
    spelersNodig: 8,
    keepersNodig: 0,
    leeftijden: ['mini-5-7', 'jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Kijk op: waar is een bal die niemand heeft?', 'Vrij doeltje? Snel dribbelen en scoren', 'Help verdedigen als iemand op jouw doeltje afkomt'],
    variaties: {
      makkelijker: ['Twee ballen', 'Groter veld'],
      moeilijker: ['Vier ballen', 'Scoren alleen na een pass'],
    },
    en: {
      naam: 'Chaos football with four mini goals and three balls',
      uitleg:
        'Two teams play at the same time with three balls. Each team defends two mini goals and can score in the other team’s two. Something is happening everywhere on the pitch, so look around: where is a ball, where is a free goal? When you score, fetch the ball quickly and play on.',
      organisatie: '20 × 15 m pitch with two mini goals at each short end. Two teams of 4 or 5, three balls in play at once. Rounds of 3 minutes; count all the goals.',
      benodigdheden: ['4 mini goals', '4 disc cones', '3 balls', 'Bibs'],
      coachpunten: ['Look up: where is a ball nobody has?', 'Free goal? Dribble quickly and score', 'Help defend when someone comes towards your goal'],
      variaties: {
        makkelijker: ['Two balls', 'Bigger pitch'],
        moeilijker: ['Four balls', 'Score only after a pass'],
      },
    },
    tekening: {
      ...leeg(17, 22),
      objecten: [
        zone('z', 8.5, 11, 15, 20),
        hoedje('h1', 1, 1),
        hoedje('h2', 16, 1),
        hoedje('h3', 1, 21),
        hoedje('h4', 16, 21),
        miniGoal('g1', 4.5, 1.2, 0),
        miniGoal('g2', 12.5, 1.2, 0),
        miniGoal('g3', 4.5, 20.8, 180),
        miniGoal('g4', 12.5, 20.8, 180),
        speler('a1', 1, 4, 13, { kijkrichting: -90 }),
        speler('a2', 2, 12.5, 12, { kijkrichting: -90 }),
        speler('a3', 3, 8.6, 16.5, { kijkrichting: -60 }),
        speler('a4', 4, 14, 17.5, { kijkrichting: -90 }),
        B('b1', 5, 5.5, 8.6, { kijkrichting: 90 }),
        B('b2', 6, 11, 7, { kijkrichting: 90 }),
        B('b3', 7, 8, 4.4, { kijkrichting: 60 }),
        B('b4', 8, 3, 5, { kijkrichting: 90 }),
        bal('x1', 4, 12.45, 'a1'),
        bal('x2', 12.5, 11.45, 'a2'),
        bal('x3', 8.3, 4.9, 'b3'),
      ],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'dribbel', wie: 'a2', via: [[13.5, 8.5]], naar: [13.2, 5.2], manier: 'sprint' },
          { type: 'loop', wie: 'b2', naar: [11.6, 4.6], start: 0.2 },
          { type: 'pass', van: 'a1', naar: 'a3' },
          { type: 'loop', wie: 'b1', naar: [5.2, 10.6], start: 0.1 },
          { type: 'dribbel', wie: 'b3', via: [[7.6, 9]], naar: [6.8, 13.6], manier: 'sprint', start: 0.2 },
          { type: 'loop', wie: 'a4', naar: [12.4, 15.8], start: 0.3 },
        ),
        stap(
          { type: 'schot', van: 'a2', naar: [12.8, 0.9] },
          { type: 'dribbel', wie: 'a3', naar: [10.4, 12], duur: 1 },
          { type: 'dribbel', wie: 'b3', naar: [5.6, 17.4], duur: 1.1 },
          { type: 'loop', wie: 'a1', naar: [3.4, 16.4], manier: 'sprint' },
        ),
        stap({ type: 'schot', van: 'b3', naar: [4.2, 21.1] }, { type: 'pass', van: 'a3', naar: [12.2, 1.5], start: 0.3 }, { type: 'loop', wie: 'b2', naar: [12.6, 2.8], manier: 'sprint' }),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
