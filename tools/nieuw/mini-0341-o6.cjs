// 0.34.1: nieuwe oefeningen voor de mini's O6 (de jongsten, tot ±6 jaar): speels, met een verhaaltje, veel balcontacten,
// een keuze en een wedstrijdje. Ideeën 15 en 17 van de gebruiker plus vijf eigen. Draaien: node tools/nieuw/mini-0341-o6.cjs
const { zet } = require('./hulp.cjs');
const { KLEUREN: K, mini, zone, B, miniGoal, pionHoog, leeg, kinderen, rondje, allen, plek, trainer, speler, bal, hoedje, stap } = require('./mini-hulp.cjs');

const O6 = ['mini-3-5'];
const o6 = (o) => mini({ leeftijden: O6, ...o });

/** Kind i (1-based) dribbelt een stukje verder langs de cirkel waarop `kinderen` ze zette (na `al` graden). */
function verder(i, n, c, r, al, graden, duur, start = -90) {
  const h0 = start + (360 * (i - 1)) / n + al;
  const delen = Math.max(2, Math.ceil(Math.abs(graden) / 40));
  const via = [];
  for (let k = 1; k < delen; k++) via.push(plek(c, r + (k % 2 ? 0.4 : -0.2), h0 + (graden * k) / delen));
  return { type: 'dribbel', wie: `a${i}`, via, naar: plek(c, r, h0 + graden), duur };
}

const oefeningen = [
  // Idee 15: haaien en visjes met bal
  o6({
    id: 'veld-o6-haaien-en-visjes',
    naam: 'Haaien en visjes',
    categorieen: ['een-tegen-een'],
    uitleg:
      'Jullie zijn visjes en de bal is je visje-staart. In de zee zwemt een haai! Roept de trainer "zwem!", dan dribbel je naar de overkant. De haai probeert je bal weg te tikken. Ben je hem kwijt? Dan word jij ook een haai. Welk visje blijft het langst over?',
    organisatie:
      'Vak van 10 × 13 m: in het midden de zee (10 × 9 m), aan beide kanten een strand van 2 m waar je veilig bent. Station van 15 minuten voor 5 kinderen: 4 visjes met een bal en 1 haai met een hesje (eerst mag de trainer de haai zijn). De trainer roept "zwem!" en dan dribbelen alle visjes tegelijk. Is er nog één visje over? Dan heeft dat visje gewonnen en begint een nieuwe ronde met een andere haai. Iedereen krijgt zijn bal meteen terug.',
    benodigdheden: ['8 hoedjes', 'Hesjes', '1 voetbal per kind'],
    spelersNodig: 3,
    coachpunten: ['Kijk waar de haai is en zwem waar hij niet is', 'Houd je bal dichtbij als de haai komt', 'Haai: kijk welke bal ver van zijn voet is'],
    variaties: {
      makkelijker: ['De haai loopt alleen (niet rennen)', 'De trainer is de haai en tikt niet te hard'],
      moeilijker: ['Twee haaien tegelijk', 'Een smallere zee (7 m)', 'Aan de overkant stop je de bal met je zool op de lijn, anders telt het niet'],
    },
    en: {
      naam: 'Sharks and little fish',
      uitleg:
        'You are little fish and the ball is your tail. There is a shark in the sea! When the coach calls "swim!", dribble to the other side. The shark tries to knock your ball away. Have you lost it? Then you become a shark too. Which little fish lasts the longest?',
      organisatie:
        '10 × 13 m area: in the middle the sea (10 × 9 m), at both ends a 2 m beach where you are safe. 15-minute station for 5 children: 4 little fish with a ball and 1 shark in a bib (to start with the coach can be the shark). The coach calls "swim!" and then all the fish dribble at the same time. Is there only one fish left? Then that fish has won and a new round starts with another shark. Everyone gets their ball back straight away.',
      benodigdheden: ['8 disc cones', 'Bibs', '1 football per child'],
      coachpunten: ['See where the shark is and swim where the shark isn’t', 'Keep your ball close when the shark comes', 'Shark: look for a ball that is far from its owner’s foot'],
      variaties: {
        makkelijker: ['The shark only walks (no running)', 'The coach is the shark and doesn’t tackle too hard'],
        moeilijker: ['Two sharks at the same time', 'A narrower sea (7 m)', 'On the other side you have to stop the ball on the line with your sole, or it doesn’t count'],
      },
    },
    tekening: {
      ...leeg(11, 15),
      objecten: [
        zone('zee', 5.5, 7.5, 10, 9, K.blauw),
        ...[
          [0.5, 1],
          [10.5, 1],
          [0.5, 3],
          [10.5, 3],
          [0.5, 12],
          [10.5, 12],
          [0.5, 14],
          [10.5, 14],
        ].map(([x, y], i) => hoedje(`h${i}`, x, y)),
        trainer(11.6, 5.6, 180),
        B('c1', 5, 5.5, 7, { kijkrichting: 90 }),
        ...[1.8, 4.1, 6.4, 8.7].flatMap((x, i) => [speler(`a${i + 1}`, i + 1, x, 13.2, { kijkrichting: -90 }), bal(`b${i + 1}`, x, 12.65, `a${i + 1}`)]),
      ],
      animatie: [
        stap(
          { type: 'dribbel', wie: 'a1', naar: [1.8, 9.0], duur: 1.8 },
          { type: 'dribbel', wie: 'a2', naar: [4.1, 9.4], duur: 1.8 },
          { type: 'dribbel', wie: 'a3', naar: [6.4, 9.6], duur: 1.8 },
          { type: 'dribbel', wie: 'a4', naar: [8.7, 9.6], duur: 1.8 },
          { type: 'loop', wie: 'c1', naar: [6.6, 7.6], manier: 'verdedigend', duur: 1.8 },
        ),
        stap(
          { type: 'dribbel', wie: 'a1', naar: [1.6, 5.6], duur: 1.4 },
          { type: 'dribbel', wie: 'a2', via: [[3.6, 7.8]], naar: [3.4, 5.8], duur: 1.4 },
          { type: 'dribbel', wie: 'a4', via: [[9.8, 8]], naar: [9.4, 5.6], duur: 1.4 },
          { type: 'dribbel', wie: 'a3', naar: [6.2, 8.8], duur: 1 },
          { type: 'druk', wie: 'c1', op: 'a3', afstand: 1.7, manier: 'verdedigend', duur: 1 },
        ),
        stap(
          { type: 'verover', wie: 'c1', van: 'a3' },
          { type: 'dribbel', wie: 'a1', naar: [1.8, 1.8], duur: 1.6 },
          { type: 'dribbel', wie: 'a2', naar: [3.6, 1.9], duur: 1.6 },
          { type: 'dribbel', wie: 'a4', naar: [9, 1.8], duur: 1.6 },
        ),
        stap({ type: 'pass', van: 'c1', naar: [11.4, 10.6] }, { type: 'team', wie: 'a3', team: 'B', start: 0.4 }),
        stap({ type: 'loop', wie: 'a3', naar: [3.8, 7.4], duur: 1.4 }),
      ],
    },
  }),

  // Idee 17: Au! – schieten op de schenen van de trainer
  o6({
    id: 'veld-o6-au',
    naam: 'Au!',
    categorieen: ['afwerken'],
    uitleg:
      'De trainer wandelt door het vak. Dribbel naar hem toe en schiet zachtjes tegen zijn schenen. Raak? Dan roept hij "au!" en springt hij op. Je hebt een punt! Je mag ook een hoge pion omschieten. Wie heeft de meeste punten?',
    organisatie:
      'Vak van 12 × 12 m met 3 hoge pionnen aan de rand. Station van 15 minuten voor 5 kinderen, elk met een bal (liefst een kleine bal, maat 3). De trainer draagt scheenbeschermers en loopt rustig rond. Elk kind telt zijn eigen punten: trainer geraakt is 1 punt, een pion om is 2 punten. De trainer roept "au!", springt op, speelt de bal terug en zet omgevallen pionnen weer neer. Na 2 minuten: wie heeft de meeste punten?',
    benodigdheden: ['3 hoge pionnen', '4 hoedjes', '1 voetbal per kind'],
    spelersNodig: 2,
    coachpunten: ['Dribbel dichtbij en schiet dan zacht', 'Kijk eerst: waar staat de trainer?', 'Schiet met de binnenkant van je voet'],
    variaties: {
      makkelijker: ['De trainer staat stil', 'Groter vak, met meer pionnen om te raken'],
      moeilijker: ['De trainer loopt sneller en draait weg', 'Alleen raken met je andere voet', 'Raken mag alleen van achter een lijn van hoedjes op 4 m'],
    },
    en: {
      naam: 'Ouch!',
      uitleg:
        'The coach walks around the area. Dribble up to the coach and shoot softly against their shins. A hit? Then the coach calls "ouch!" and jumps. You get a point! You may also knock over a tall cone. Who has the most points?',
      organisatie:
        '12 × 12 m area with 3 tall cones on the edge. 15-minute station for 5 children, each with a ball (preferably a small ball, size 3). The coach wears shin pads and walks around calmly. Every child counts their own points: hitting the coach is 1 point, knocking over a cone is 2 points. The coach calls "ouch!", jumps, plays the ball back and puts fallen cones back up. After 2 minutes: who has the most points?',
      benodigdheden: ['3 tall cones', '4 disc cones', '1 football per child'],
      coachpunten: ['Dribble close and then shoot softly', 'Look first: where is the coach?', 'Shoot with the inside of your foot'],
      variaties: {
        makkelijker: ['The coach stands still', 'A bigger area, with more cones to hit'],
        moeilijker: ['The coach walks faster and turns away', 'You may only hit with your other foot', 'You may only shoot from behind a line of disc cones 4 m away'],
      },
    },
    tekening: (() => {
      const c = [6.5, 6.5];
      const r = 4.2;
      const n = 5;
      const p3 = plek(c, 5.6, -90);
      return {
        ...leeg(13, 13),
        objecten: [
          hoedje('v1', 0.5, 0.5),
          hoedje('v2', 12.5, 0.5),
          hoedje('v3', 0.5, 12.5),
          hoedje('v4', 12.5, 12.5),
          pionHoog('p1', ...plek(c, 5.6, 30), K.oranje),
          pionHoog('p2', ...plek(c, 5.6, 150), K.oranje),
          pionHoog('p3', ...p3, K.oranje),
          trainer(6.5, 6.5, 0),
          ...kinderen(n, c, r),
        ],
        animatie: [
          rondje(n, c, r, -90, 50, 2.2),
          stap({ type: 'loop', wie: 't1', naar: [7.6, 6], duur: 1.2 }, verder(3, n, c, r, 50, 25, 1.2), verder(4, n, c, r, 50, 25, 1.2)),
          stap({ type: 'pass', van: 'a2', naar: 't1', hoogte: 'grond' }, { type: 'schot', van: 'a1', naar: [p3[0] + 0.15, p3[1] + 0.4], hoogte: 'grond', start: 0.4 }),
          stap({ type: 'springen', wie: 't1' }, { type: 'valOm', object: 'p3', hoek: -100 }),
          stap({ type: 'pass', van: 't1', naar: 'a2' }, verder(3, n, c, r, 75, 30, 1.4), verder(4, n, c, r, 75, 20, 1.4)),
        ],
      };
    })(),
  }),

  // Eigen 1: kamer opruimen
  o6({
    id: 'veld-o6-kamer-opruimen',
    naam: 'Kamer opruimen',
    categorieen: ['afwerken'],
    uitleg:
      'Wat een rommel in jullie kamer! Schiet alle ballen naar de kamer van de trainer. Maar de trainer is ook aan het opruimen: hij schiet ze terug! Roept de trainer "stop!", dan tellen we: in welke kamer liggen de minste ballen?',
    organisatie:
      'Twee kamers van 9 × 8 m naast elkaar (veld 10 × 17 m), met een middenlijn. De kinderen in de ene kamer, de trainer in de andere. Station van 15 minuten voor 5 kinderen met 8–10 ballen. De trainer roept "opruimen!" en na 1 minuut "stop!". Pak een bal, dribbel naar de middenlijn en schiet hem naar de andere kamer, waar de trainer niet staat. Wie het meeste opruimt, mag de volgende ronde "stop!" roepen.',
    benodigdheden: ['6 hoedjes', '10 voetballen'],
    spelersNodig: 2,
    coachpunten: ['Kijk waar de trainer niet staat en schiet daarheen', 'Dribbel eerst naar de lijn, dan schieten', 'Snel de volgende bal pakken!'],
    variaties: {
      makkelijker: ['De trainer schiet maar af en toe terug', 'Een smallere kamer van de trainer, dus dichterbij'],
      moeilijker: ['Twee teams tegen elkaar (2 tegen 3), zonder trainer', 'Schieten alleen met je andere voet', 'Eerst de bal stilleggen met je zool, dan pas schieten'],
    },
    en: {
      naam: 'Tidy your room',
      uitleg:
        'What a mess in your room! Shoot all the balls into the coach’s room. But the coach is tidying up too: the coach shoots them back! When the coach calls "stop!", we count: which room has the fewest balls?',
      organisatie:
        'Two 9 × 8 m rooms side by side (10 × 17 m area), with a halfway line. The children are in one room, the coach in the other. 15-minute station for 5 children with 8–10 balls. The coach calls "tidy up!" and after 1 minute "stop!". Take a ball, dribble to the halfway line and shoot it into the other room, where the coach isn’t standing. Whoever tidies up the most may call "stop!" next round.',
      benodigdheden: ['6 disc cones', '10 footballs'],
      coachpunten: ['Look where the coach isn’t and shoot there', 'Dribble to the line first, then shoot', 'Quickly get the next ball!'],
      variaties: {
        makkelijker: ['The coach only shoots back now and then', 'A narrower room for the coach, so it’s closer'],
        moeilijker: ['Two teams against each other (2 v 3), without the coach', 'Only shoot with your other foot', 'Stop the ball with your sole first, then shoot'],
      },
    },
    tekening: {
      ...leeg(10, 17),
      objecten: [
        zone('k1', 5, 4.5, 9, 7.5, K.geel),
        zone('k2', 5, 12.5, 9, 7.5, K.blauw),
        hoedje('h1', 0.5, 0.8),
        hoedje('h2', 9.5, 0.8),
        hoedje('h3', 0.5, 8.5, K.rood),
        hoedje('h4', 9.5, 8.5, K.rood),
        hoedje('h5', 0.5, 16.2),
        hoedje('h6', 9.5, 16.2),
        trainer(6.8, 5.6, 90),
        bal('b6', 6.6, 6.7),
        bal('b7', 2.4, 6.2),
        speler('a1', 1, 2, 12.4, { kijkrichting: -90 }),
        bal('b1', 2, 11.85, 'a1'),
        speler('a2', 2, 5, 12.6, { kijkrichting: -90 }),
        bal('b2', 5, 12.05, 'a2'),
        speler('a3', 3, 8, 12.4, { kijkrichting: -90 }),
        bal('b3', 8, 11.85, 'a3'),
        speler('a4', 4, 3.5, 15.2, { kijkrichting: -90 }),
        bal('b4', 3.5, 14.65, 'a4'),
        speler('a5', 5, 6.5, 15.2, { kijkrichting: -90 }),
        bal('b5', 6.5, 14.65, 'a5'),
      ],
      animatie: [
        stap(
          { type: 'dribbel', wie: 'a1', naar: [2, 10.4], duur: 1.2 },
          { type: 'dribbel', wie: 'a2', naar: [5, 10.4], duur: 1.2 },
          { type: 'dribbel', wie: 'a3', naar: [8, 10.4], duur: 1.2 },
          { type: 'dribbel', wie: 'a4', naar: [3.5, 13.4], duur: 1.2 },
          { type: 'dribbel', wie: 'a5', naar: [6.5, 13.4], duur: 1.2 },
        ),
        stap(
          { type: 'pass', van: 'a1', naar: [2.2, 3.4] },
          { type: 'pass', van: 'a2', naar: [4.2, 2.6] },
          { type: 'pass', van: 'a3', naar: [8.4, 3.2] },
          { type: 'pak', wie: 't1' },
        ),
        stap(
          { type: 'pass', van: 't1', naar: [5.8, 14.2] },
          { type: 'loop', wie: 'a1', naar: [0.9, 12], duur: 1.4 },
          { type: 'loop', wie: 'a3', naar: [9.2, 12.2], duur: 1.4 },
          { type: 'dribbel', wie: 'a4', naar: [2.6, 10.6], duur: 1.4 },
          { type: 'dribbel', wie: 'a5', naar: [7.2, 10.6], duur: 1.4 },
        ),
        stap(
          { type: 'pass', van: 'a4', naar: [3, 4.6] },
          { type: 'pass', van: 'a5', naar: [8.6, 6.4] },
          { type: 'loop', wie: 'a2', naar: [5.2, 13.4], duur: 1.4 },
          { type: 'loop', wie: 't1', naar: [4.6, 3.2], duur: 1.4 },
        ),
        stap({ type: 'pak', wie: 'a2' }, { type: 'pak', wie: 't1' }),
        stap({ type: 'pass', van: 't1', naar: 'a1' }, { type: 'dribbel', wie: 'a2', naar: [5, 10.6], duur: 1.4 }),
      ],
    },
  }),

  // Eigen 2: de draak bewaakt de doeltjes
  o6({
    id: 'veld-o6-doeltjesjagers',
    naam: 'Draak bij de doeltjes',
    categorieen: ['afwerken'],
    uitleg:
      'Er staan vier doeltjes en de trainer is een draak. Bij het doeltje waar de draak staat, mag je niet scoren! Dribbel naar een doeltje waar de draak niet is en scoor. Pak je bal en zoek een ander doeltje. Hoeveel goals maak jij?',
    organisatie:
      'Vak van 14 × 12 m met twee mini-goaltjes aan elke korte kant. Station van 15 minuten voor 5 kinderen, elk met een bal. De trainer is de draak: hij loopt van doeltje naar doeltje en brult "dicht!" bij het doeltje waar hij staat. Elk kind telt zijn eigen goals; twee keer achter elkaar in hetzelfde doeltje telt niet. Na 1 minuut: wie heeft de meeste?',
    benodigdheden: ['4 mini-goaltjes', '4 hoedjes', '1 voetbal per kind'],
    spelersNodig: 2,
    coachpunten: ['Kijk op: waar is de draak?', 'Ga naar het doeltje dat open is', 'Dichtbij komen en dan zacht schieten'],
    variaties: {
      makkelijker: ['De draak blijft bij één doeltje staan', 'Groter doeltjes, of scoren vanaf dichtbij'],
      moeilijker: ['Twee draken: een kind wordt ook draak (zonder bal)', 'Scoren alleen na een kap', 'De draak mag ook een bal afpakken: dan eerst 5 tikjes met je zool voor je hem terugkrijgt'],
    },
    en: {
      naam: 'Dragon at the goals',
      uitleg:
        'There are four mini-goals and the coach is a dragon. You may not score in the goal where the dragon is standing! Dribble to a goal where the dragon isn’t and score. Get your ball and find another goal. How many goals do you score?',
      organisatie:
        '14 × 12 m area with two mini-goals on each short side. 15-minute station for 5 children, each with a ball. The coach is the dragon: the dragon walks from goal to goal and roars "closed!" at the goal where they stand. Every child counts their own goals; the same goal twice in a row doesn’t count. After 1 minute: who has the most?',
      benodigdheden: ['4 mini-goals', '4 disc cones', '1 football per child'],
      coachpunten: ['Look up: where is the dragon?', 'Go to the goal that is open', 'Get close and then shoot softly'],
      variaties: {
        makkelijker: ['The dragon stays at one goal', 'Bigger goals, or score from close by'],
        moeilijker: ['Two dragons: one child becomes a dragon too (without a ball)', 'You may only score after a chop', 'The dragon may also win a ball: then 5 sole touches first before you get it back'],
      },
    },
    tekening: (() => {
      const c = [7, 6];
      const r = 2.6;
      const n = 5;
      return {
        ...leeg(14, 12),
        objecten: [
          miniGoal('g1', 4, 0.9),
          miniGoal('g2', 10, 0.9),
          miniGoal('g3', 4, 11.1, 180),
          miniGoal('g4', 10, 11.1, 180),
          hoedje('v1', 0.5, 0.5),
          hoedje('v2', 13.5, 0.5),
          hoedje('v3', 0.5, 11.5),
          hoedje('v4', 13.5, 11.5),
          trainer(3.6, 2.2, 90),
          ...kinderen(n, c, r),
        ],
        animatie: [
          rondje(n, c, r, -90, 60, 2.4),
          stap(
            { type: 'dribbel', wie: 'a1', naar: [9.8, 3.1], duur: 1.4 },
            { type: 'dribbel', wie: 'a2', naar: [9.6, 9.1], duur: 1.4 },
            { type: 'dribbel', wie: 'a3', naar: [4.6, 9.2], duur: 1.4 },
            { type: 'dribbel', wie: 'a4', via: [[3.2, 6.6]], naar: [2.6, 5.2], duur: 1.4 },
            { type: 'dribbel', wie: 'a5', naar: [7, 4.6], duur: 1.4 },
            { type: 'loop', wie: 't1', naar: [4.6, 2.2], duur: 1.4 },
          ),
          stap({ type: 'schot', van: 'a1', naar: [10, 1.25] }, { type: 'schot', van: 'a2', naar: [10, 10.75] }, { type: 'schot', van: 'a3', naar: [4, 10.75] }),
          stap({ type: 'loop', wie: 't1', naar: [7, 2.2], duur: 1.4 }, { type: 'dribbel', wie: 'a4', naar: [3.6, 3.4], duur: 1.4 }, { type: 'dribbel', wie: 'a5', naar: [7.6, 6.4], duur: 1.4 }),
          stap({ type: 'schot', van: 'a4', naar: [4, 1.25] }),
        ],
      };
    })(),
  }),

  // Eigen 3: bevroren (tikkertje met bal)
  o6({
    id: 'veld-o6-bevroren',
    naam: 'Bevroren!',
    categorieen: ['techniek'],
    uitleg:
      'De trainer is de ijskoning. Iedereen dribbelt rond met een bal. Tikt de ijskoning je aan? Dan ben je bevroren: zet je voet op de bal en sta stil. Een vriendje kan je ontdooien door een rondje om je heen te dribbelen. Lukt het de ijskoning om iedereen te bevriezen?',
    organisatie:
      'Vak van 12 × 12 m. Station van 15 minuten voor 5 kinderen, elk met een bal. De trainer (zonder bal) is de ijskoning en roept "bevroren!" als hij iemand aantikt. Na 1 minuut telt de trainer hoeveel kinderen er bevroren staan. Daarna mag een kind de ijskoning zijn.',
    benodigdheden: ['4 hoedjes', 'Hesjes', '1 voetbal per kind'],
    spelersNodig: 3,
    coachpunten: ['Houd je bal dichtbij, dan ben je snel weg', 'Kijk op: waar is de ijskoning?', 'Help een vriendje: dribbel een rondje om hem heen'],
    variaties: {
      makkelijker: ['De ijskoning loopt alleen', 'Ontdooien met een high five'],
      moeilijker: ['Twee ijskoningen', 'Ontdooien door de bal tussen de benen van je vriendje door te spelen', 'Bevroren? Doe 5 tik-takjes, dan ben je weer vrij'],
    },
    en: {
      naam: 'Frozen!',
      uitleg:
        'The coach is the ice king. Everyone dribbles around with a ball. Does the ice king tag you? Then you are frozen: put your foot on the ball and stand still. A friend can unfreeze you by dribbling a circle around you. Can the ice king freeze everyone?',
      organisatie:
        '12 × 12 m area. 15-minute station for 5 children, each with a ball. The coach (without a ball) is the ice king and calls "frozen!" when tagging someone. After 1 minute the coach counts how many children are frozen. Then a child may be the ice king.',
      benodigdheden: ['4 disc cones', 'Bibs', '1 football per child'],
      coachpunten: ['Keep your ball close, then you can get away fast', 'Look up: where is the ice king?', 'Help a friend: dribble a circle around them'],
      variaties: {
        makkelijker: ['The ice king only walks', 'Unfreeze with a high five'],
        moeilijker: ['Two ice kings', 'Unfreeze by passing the ball between your friend’s legs', 'Frozen? Do 5 tic-tac touches and you are free again'],
      },
    },
    tekening: (() => {
      const c = [6.5, 6.5];
      const r = 3.4;
      const n = 5;
      // Na het rondje staat kind 2 hier; kind 3 dribbelt er een rondje omheen.
      const a2 = plek(c, r, -90 + 72 + 70);
      const om = [180, 120, 60, 0, -60, -120].map((h) => plek(a2, 1.95, h));
      return {
        ...leeg(13, 13),
        objecten: [hoedje('v1', 0.5, 0.5), hoedje('v2', 12.5, 0.5), hoedje('v3', 0.5, 12.5), hoedje('v4', 12.5, 12.5), trainer(11.6, 8.2, 180), ...kinderen(n, c, r)],
        animatie: [
          stap(...rondje(n, c, r, -90, 70, 2.6).acties, { type: 'loop', wie: 't1', naar: [a2[0] + 1.6, a2[1] + 0.9], manier: 'sprint', duur: 2.6 }),
          stap({ type: 'voetOpBal', wie: 'a2', duur: 1.6 }, { type: 'loop', wie: 't1', naar: [11.8, 5.8], start: 0.3, duur: 1.6 }, { type: 'dribbel', wie: 'a1', naar: [10.6, 3.2], duur: 1.6 }),
          stap(
            { type: 'voetOpBal', wie: 'a2', duur: 4 },
            { type: 'dribbel', wie: 'a3', via: om.slice(0, 5), naar: om[5], duur: 4 },
            { type: 'dribbel', wie: 'a4', naar: [2.2, 7.6], duur: 2 },
            { type: 'dribbel', wie: 'a5', naar: [6.4, 1.8], duur: 2 },
          ),
          stap({ type: 'dribbel', wie: 'a2', naar: [9.6, 11.4], duur: 1.4 }, { type: 'dribbel', wie: 'a3', naar: [5.6, 8.4], duur: 1.4 }, { type: 'loop', wie: 't1', naar: [8.8, 5.6], duur: 1.4 }),
        ],
      };
    })(),
  }),

  // Eigen 4: ruilen!
  o6({
    id: 'veld-o6-ruilen',
    naam: 'Ruilen!',
    categorieen: ['techniek'],
    uitleg:
      'Iedereen dribbelt rond met een bal. Roept de trainer "ruilen!", dan speel je jouw bal naar een vriendje en krijg je zijn bal terug. Daarna dribbel je weer verder. Hoe vaak kunnen jullie samen ruilen in 1 minuut?',
    organisatie:
      'Vak van 12 × 12 m. Station van 15 minuten voor 5 kinderen, elk met een bal; de trainer doet mee met een eigen bal, zodat iedereen een maatje heeft. De trainer roept "ruilen!" en telt hardop hoe vaak het lukt. Na 1 minuut: halen jullie de volgende keer meer?',
    benodigdheden: ['4 hoedjes', '1 voetbal per kind'],
    spelersNodig: 2,
    coachpunten: ['Kijk eerst naar je vriendje, dan pas spelen', 'Zachte pass met de binnenkant', 'Stop de bal die je krijgt met je voet'],
    variaties: {
      makkelijker: ['Eerst stilstaan, dan ruilen', 'Rollen met je voet in plaats van passen'],
      moeilijker: ['Ruil alleen met iemand met een ander hesje', 'Na het ruilen meteen een kap maken', 'De trainer roept een nummer: alleen die twee ruilen, de rest zet de voet op de bal'],
    },
    en: {
      naam: 'Swap!',
      uitleg:
        'Everyone dribbles around with a ball. When the coach calls "swap!", you pass your ball to a friend and get their ball back. Then you carry on dribbling. How many times can you swap together in 1 minute?',
      organisatie:
        '12 × 12 m area. 15-minute station for 5 children, each with a ball; the coach joins in with a ball too, so everyone has a partner. The coach calls "swap!" and counts out loud how often it works. After 1 minute: can you get more next time?',
      benodigdheden: ['4 disc cones', '1 football per child'],
      coachpunten: ['Look at your friend first, then pass', 'A soft pass with the inside of your foot', 'Stop the ball you get with your foot'],
      variaties: {
        makkelijker: ['Stand still first, then swap', 'Roll it with your foot instead of passing'],
        moeilijker: ['Only swap with someone in a different bib', 'Do a chop straight after swapping', 'The coach calls a number: only those two swap, the rest put their foot on the ball'],
      },
    },
    tekening: (() => {
      const c = [6, 6.5];
      const r = 3.1;
      const n = 5;
      return {
        ...leeg(12, 13),
        objecten: [hoedje('v1', 0.5, 0.5), hoedje('v2', 11.5, 0.5), hoedje('v3', 0.5, 12.5), hoedje('v4', 11.5, 12.5), trainer(8.8, 1.6, 180), bal('b6', 8.25, 1.6, 't1'), ...kinderen(n, c, r)],
        animatie: [
          rondje(n, c, r, -90, 60, 2.4),
          stap(
            { type: 'pass', van: 'a1', naar: 'a2' },
            { type: 'pass', van: 'a2', naar: 'a1' },
            { type: 'pass', van: 'a3', naar: 'a4' },
            { type: 'pass', van: 'a4', naar: 'a3' },
            { type: 'pass', van: 'a5', naar: 't1' },
            { type: 'pass', van: 't1', naar: 'a5' },
          ),
          rondje(n, c, r, -30, 60, 2.4),
        ],
      };
    })(),
  }),

  // Eigen 5: pinguïnrace
  o6({
    id: 'veld-o6-pinguinrace',
    naam: 'Pinguïnrace',
    categorieen: ['techniek'],
    uitleg:
      'Jullie zijn pinguïns en de bal is je ei. Waggel met kleine tik-takjes (binnenkant links, binnenkant rechts) naar de middenlijn. Kijk naar de trainer! Rood hoedje: de ijsbeer komt! Draai om en dribbel snel terug naar huis. Blauw hoedje: dribbel snel naar de overkant. Wie is het eerst veilig?',
    organisatie:
      'Vak van 12 × 11 m met een startlijn, een middenlijn op 5 m en een overkant op 10 m, elk gemaakt met 2 hoedjes. Station van 15 minuten voor 5 kinderen naast elkaar, elk met een bal: iedereen doet tegelijk mee. De trainer staat aan de zijkant, steekt een rood of een blauw hoedje op en roept erbij "ijsbeer!" of "overkant!". Wie het eerst veilig is, krijgt een punt.',
    benodigdheden: ['8 hoedjes', '1 voetbal per kind'],
    spelersNodig: 2,
    coachpunten: ['Kleine tikjes tussen je voeten, net een pinguïn', 'Kijk op naar de trainer', 'Draaien met je zool en dan snel weg'],
    variaties: {
      makkelijker: ['Alleen het blauwe hoedje: altijd naar de overkant', 'Wandelen in plaats van rennen'],
      moeilijker: ['Een groen hoedje erbij: stoppen met je voet op de bal', 'Tik-tak met je hoofd omhoog, zonder naar de bal te kijken', 'Terug naar huis met je andere voet'],
    },
    en: {
      naam: 'Penguin race',
      uitleg:
        'You are penguins and the ball is your egg. Waddle with small tic-tac touches (inside left, inside right) to the middle line. Look at the coach! Red disc cone: the polar bear is coming! Turn round and dribble home fast. Blue disc cone: dribble fast to the other side. Who is safe first?',
      organisatie:
        '12 × 11 m area with a start line, a middle line at 5 m and a far side at 10 m, each made with 2 disc cones. 15-minute station for 5 children side by side, each with a ball: everyone plays at the same time. The coach stands at the side, holds up a red or a blue disc cone and calls "polar bear!" or "other side!". Whoever is safe first gets a point.',
      benodigdheden: ['8 disc cones', '1 football per child'],
      coachpunten: ['Small touches between your feet, just like a penguin', 'Look up at the coach', 'Turn with your sole and then go fast'],
      variaties: {
        makkelijker: ['Only the blue disc cone: always to the other side', 'Walk instead of running'],
        moeilijker: ['Add a green disc cone: stop with your foot on the ball', 'Tic-tac with your head up, without looking at the ball', 'Back home with your other foot'],
      },
    },
    tekening: (() => {
      const xs = [1.6, 3.8, 6, 8.2, 10.4];
      return {
        ...leeg(14, 12),
        objecten: [
          ...[11.2, 6.2, 1.2].flatMap((y, i) => [hoedje(`l${i}a`, 0.3, y), hoedje(`l${i}b`, 11.7, y)]),
          hoedje('rood', 12.9, 5.6, K.rood),
          hoedje('blauw', 12.9, 7.2, K.blauw),
          trainer(13.2, 6.4, 180),
          ...xs.flatMap((x, i) => [speler(`a${i + 1}`, i + 1, x, 11.2, { kijkrichting: -90 }), bal(`b${i + 1}`, x, 10.65, `a${i + 1}`)]),
        ],
        animatie: [
          stap(...xs.flatMap((x, i) => [{ type: 'tiktak', wie: `a${i + 1}`, duur: 3.2 }, { type: 'dribbel', wie: `a${i + 1}`, naar: [x, 6.8], duur: 3.2, manier: 'wandel' }])),
          stap({ type: 'pakObject', wie: 't1', object: 'rood' }),
          allen(5, (wie) => ({ type: 'truc', wie, soort: 'zool', kijk: 90 })),
          stap(...xs.map((x, i) => ({ type: 'dribbel', wie: `a${i + 1}`, naar: [x, 11.6], duur: 2.2, manier: 'sprint' }))),
        ],
      };
    })(),
  }),
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
