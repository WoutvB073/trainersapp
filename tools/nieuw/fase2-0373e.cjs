// Fase 2, deel 3, batch 4 (0.37.3), deel e: keepers met nieuwe bouwstenen – KW3 (keepers in teamhesjes), KS4, KH2 (duik over een
// liggende keeper), KR3 (wijdbeens, bal tussen de benen door), KR5 (gekleurde ballen, bal in elke hand), KV4 (effect), KR2 (twee tennisballen).
// Draaien: node tools/nieuw/fase2-0373e.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, speler, bal, hoedje, pauze, stap, zone, leeg, doeltje, JO, OUD, MIDDEN, KLEUR } = require('./fase2-hulp.cjs');

const keeperVeld = (weergave) => ({ veld: { type: 'half' }, weergave, camera: 'schuin' });
const op = (wie = 'k1') => stap({ type: 'opstaan', wie });

const oefeningen = [
  // KW3. Handbal met keepers
  {
    id: 'keeper-wu-handbal',
    naam: 'Handbal met keepers',
    categorieen: ['warming-up', 'spelletjes'],
    uitleg:
      'Twee tegen twee met de handen op twee kleine doeltjes. Met de bal lopen mag niet: je gooit en vangt, en wie geen bal heeft loopt zich vrij. Scoren mag alleen met een stuit: de bal moet vóór het doeltje de grond raken. Zo oefen je vangen, werpen en kijken in een spel.',
    organisatie: 'Vak van 20 × 12 m met op elke korte kant een klein doeltje. Twee keepers per team in hesjes. Rondes van 3 minuten; wie scoort, krijgt de bal niet terug: de ander begint.',
    benodigdheden: ['2 kleine doeltjes', '4 hoedjes', '1 bal', 'Hesjes in 2 kleuren'],
    spelersNodig: 0,
    keepersNodig: 4,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Vangen met twee handen, de bal meteen tegen je borst', 'Kijk eerst waar je maatje vrij staat, dan gooien', 'Stuitbal naar de hoek, laag en hard'],
    variaties: {
      makkelijker: ['Ook zonder stuit scoren', 'Groter vak'],
      moeilijker: ['Alleen met je zwakke hand gooien', 'Na drie passes pas scoren'],
    },
    en: {
      naam: 'Handball for keepers',
      uitleg:
        'Two against two with your hands, on two mini goals. You may not run with the ball: you throw and catch, and whoever has no ball moves into space. You can only score with a bounce: the ball must hit the ground in front of the goal. You practise catching, throwing and looking up in a game.',
      organisatie: '20 × 12 m area with a mini goal at each short end. Two keepers per team in bibs. Rounds of 3 minutes; whoever scores does not get the ball back: the other team starts.',
      benodigdheden: ['2 mini goals', '4 disc cones', '1 ball', 'Bibs in 2 colours'],
      coachpunten: ['Catch with two hands, ball straight to your chest', 'First see where your partner is free, then throw', 'Bounce it into the corner, low and hard'],
      variaties: {
        makkelijker: ['Goals without a bounce count too', 'Bigger area'],
        moeilijker: ['Throw with your weaker hand only', 'Only score after three passes'],
      },
    },
    tekening: {
      ...leeg(22, 14),
      objecten: [
        zone('z', 11, 7, 20, 12),
        doeltje('gW', 1, 7, -90, 2),
        doeltje('gE', 21, 7, 90, 2),
        keeper('k1', 1, 8, 5.4, { team: 'A', kijkrichting: 0 }),
        keeper('k2', 2, 12.4, 9.4, { team: 'A', kijkrichting: 0 }),
        keeper('k3', 3, 14.6, 5.4, { team: 'B', kijkrichting: 180 }),
        keeper('k4', 4, 17.4, 8.6, { team: 'B', kijkrichting: 180 }),
        bal('bal', 8.55, 5.4, 'k1'),
      ],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'pass', van: 'k1', naar: 'k2', worp: 'bovenhands', hoogte: 1.4 },
          { type: 'loop', wie: 'k1', naar: [15.8, 3.6], manier: 'sprint', start: 0.6 },
          { type: 'loop', wie: 'k3', naar: [14.4, 7.6], start: 0.5 },
        ),
        stap({ type: 'pass', van: 'k2', naar: 'k1', worp: 'bovenhands', hoogte: 1.6 }, { type: 'loop', wie: 'k4', naar: [18.6, 6.6], start: 0.3 }),
        stap({ type: 'schot', van: 'k1', naar: [21.3, 7.6], worp: 'bovenhands', stuitOp: [19.4, 6.2] }),
        pauze(0.8),
      ],
    },
  },

  // KS4. Trefbal voor keepers
  {
    id: 'keeper-sp-trefbal',
    naam: 'Trefbal voor keepers',
    categorieen: ['spelletjes'],
    uitleg:
      'Twee keepers staan elk in een vak, tegenover elkaar. Om de beurt gooi je de bal onderhands en laag naar de ander: raak je hem onder de knie, dan is het een punt. Vangt de ander de bal, dan is het een redding en geen punt. Wie heeft het eerst vijf punten?',
    organisatie: 'Twee vakken van 5 × 6 m op 2 m van elkaar. Je blijft in je eigen vak. Spelen tot vijf punten, dan een nieuwe ronde.',
    benodigdheden: ['8 hoedjes', '1 bal'],
    spelersNodig: 0,
    keepersNodig: 2,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Gooi laag en hard, naar de voeten', 'Verdedigen: laag blijven, handen al bij de grond', 'Vang de bal met twee handen, of stap opzij'],
    variaties: {
      makkelijker: ['Raken onder de heup telt', 'Vakken verder uit elkaar'],
      moeilijker: ['Alleen met je zwakke hand', 'Twee ballen tegelijk'],
    },
    en: {
      naam: 'Dodgeball for keepers',
      uitleg:
        'Two keepers each stand in a box, facing each other. In turn you throw the ball underarm and low at the other keeper: hit them below the knee and it is a point. If the other keeper catches the ball, it is a save and no point. Who gets to five points first?',
      organisatie: 'Two 5 × 6 m boxes, 2 m apart. You stay in your own box. Play to five points, then a new round.',
      benodigdheden: ['8 disc cones', '1 ball'],
      coachpunten: ['Throw low and hard, at the feet', 'Defending: stay low, hands already near the ground', 'Catch the ball with two hands, or step aside'],
      variaties: {
        makkelijker: ['Hitting below the hip counts', 'Boxes further apart'],
        moeilijker: ['Weaker hand only', 'Two balls at once'],
      },
    },
    tekening: {
      ...leeg(14, 9),
      objecten: [zone('z1', 3.5, 4.5, 5, 6), zone('z2', 10.5, 4.5, 5, 6), keeper('k1', 1, 3.6, 4.5, { kijkrichting: 0 }), keeper('k2', 2, 10.4, 4.5, { kijkrichting: 180 }), bal('bal', 4.15, 4.5, 'k1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'k1', naar: 'k2', worp: 'onderhands', hoogte: 0.5, eindHoogte: 0.35 }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k2', naar: 'k1', worp: 'onderhands', hoogte: 0.5, eindHoogte: 0.3, terug: [1.4, 6.6] }),
        pauze(1),
      ],
    },
  },

  // KH2. Over de liggende keeper
  {
    id: 'keeper-hd-over-de-liggende-keeper',
    naam: 'Over de liggende keeper',
    categorieen: ['hoog-duiken'],
    uitleg:
      'Een tweede keeper ligt op zijn buik naast de keeper. De trainer gooit een hoge bal schuin over hem heen. De keeper zet krachtig af, duikt over de liggende keeper heen naar de bal, vangt hem in de vlucht en landt op zijn zij. Zo leer je hoog en ver af te zetten in plaats van opzij te vallen. Daarna wisselen de keepers.',
    organisatie: 'Keeper in het doel, de tweede keeper ligt 2 m naast hem (op zijn buik, armen bij het lijf). De trainer op 6 m met ballen. Drie ballen, dan wisselen; daarna de andere kant op.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Afzetten met het been het dichtst bij de bal, krachtig omhoog', 'Je lichaam gaat over de keeper heen, niet ernaast', 'Liggende keeper: stil liggen, armen bij je lijf'],
    variaties: {
      makkelijker: ['Een pion of horde in plaats van een keeper', 'Bal lager'],
      moeilijker: ['De liggende keeper zit op zijn knieën', 'Bal verder in de hoek'],
    },
    en: {
      naam: 'Over the lying keeper',
      uitleg:
        'A second keeper lies face down beside the keeper. The coach throws a high ball at an angle over them. The keeper pushes off powerfully, dives over the lying keeper to the ball, catches it in the air and lands on their side. You learn to push off high and far instead of falling sideways. Then the keepers swap.',
      organisatie: 'Keeper in goal, the second keeper lying 2 m beside them (face down, arms by the body). The coach 6 m away with balls. Three balls, then swap; then the other way.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Push off with the leg nearest the ball, powerfully upwards', 'Your body goes over the keeper, not beside them', 'Lying keeper: lie still, arms by your body'],
      variaties: {
        makkelijker: ['A cone or hurdle instead of a keeper', 'Lower ball'],
        moeilijker: ['The lying keeper kneels', 'Ball further into the corner'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 12 }),
      objecten: [goal, keeper('k1', 1, 34, 1.8, { kijkrichting: 90 }), keeper('k2', 2, 32.1, 2.5, { kijkrichting: 90, houding: 'buik' }), trainer(34.6, 7, -100), bal('bal', 34.5, 6.45, 't1')],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 2.6, eindHoogte: 1.6, duikNaar: [30.2, 2.2], duikHoogte: 1.4, duikOver: 'k2' }),
        pauze(0.8),
        op(),
        pauze(0.4),
      ],
    },
  },

  // KR3. Schot door de benen van een speler
  {
    id: 'keeper-re-door-de-benen',
    naam: 'Schot door de benen van een speler',
    categorieen: ['reactie'],
    uitleg:
      'Een speler staat wijdbeens 3 m voor de keeper. De trainer schiet laag: soms tussen de benen van de speler door, soms er net langs. De keeper ziet de bal pas laat en moet in zijn basishouding blijven tot hij weet waar de bal heen gaat: dan vangen of duiken.',
    organisatie: 'Keeper in het doel, de speler wijdbeens op 3 m (gezicht naar de trainer), de trainer op 10 m met ballen. Series van vijf; na elke serie wisselt de speler.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 1,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Kijk tussen de benen door naar de bal, niet naar de speler', 'Blijf laag in je basishouding, gewicht naar voren', 'Late bal: handen eerst, kort reageren'],
    variaties: {
      makkelijker: ['Speler verder van het doel', 'Alleen tussen de benen door'],
      moeilijker: ['Speler dichterbij', 'De speler mag de bal ook met een voet van richting veranderen'],
    },
    en: {
      naam: 'Shot through a player’s legs',
      uitleg:
        'A player stands with legs apart 3 m in front of the keeper. The coach shoots low: sometimes between the player’s legs, sometimes just past them. The keeper only sees the ball late and has to stay in the set position until they know where it is going: then catch or dive.',
      organisatie: 'Keeper in goal, the player with legs apart at 3 m (facing the coach), the coach 10 m away with balls. Sets of five; after each set the player changes.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Look through the legs at the ball, not at the player', 'Stay low in your set position, weight forward', 'Late ball: hands first, react quickly'],
      variaties: {
        makkelijker: ['Player further from the goal', 'Only through the legs'],
        moeilijker: ['Player closer', 'The player may also deflect the ball with a foot'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 16 }),
      objecten: [goal, keeper('k1', 1, 34, 1.5, { verdedigt: 'g1', kijkrichting: 90 }), speler('a1', 4, 34.3, 4.6, { kijkrichting: 90 }), trainer(34.6, 11, -90), bal('b1', 34.6, 10.45, 't1'), bal('b2', 35.7, 11.6)],
      animatie: [
        stap({ type: 'wijdbeens', wie: 'a1', duur: 7.5 }, { type: 'loop', wie: 't1', naar: [34.6, 11], duur: 0.6 }),
        stap({ type: 'schot', van: 't1', naar: [33.8, 0.4], hoogte: 'grond', afloop: 'vangt', vasthouden: true, onderdoor: 'a1' }),
        pauze(0.5),
        stap({ type: 'loop', wie: 't1', naar: [35.4, 12.1], duur: 0.6 }),
        stap({ type: 'schot', van: 't1', naar: [37, 0.4], hoogte: 'grond', afloop: 'vangt', bal: 'b2' }),
        pauze(1.2),
      ],
    },
  },

  // KR5. Kleur van de bal
  {
    id: 'keeper-re-kleur-van-de-bal',
    naam: 'Kleur van de bal',
    categorieen: ['reactie'],
    uitleg:
      'De trainer houdt in elke hand een bal: een rode en een gele. Hij gooit ze tegelijk, de een links en de ander rechts naast de keeper, en roept op het moment van de worp één kleur. De keeper duikt naar de bal met die kleur en laat de andere gaan. In het voorbeeld roept de trainer "rood".',
    organisatie: 'Keeper in het doel, de trainer op 6 m met ballen in twee kleuren (of twee ballen met verschillende hesjes eromheen). Series van vier, de trainer roept steeds een andere kleur.',
    benodigdheden: ['Goal', 'Ballen in 2 kleuren'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Wacht op het woord, kies dan meteen', 'Handen eerst naar de bal met de goede kleur', 'Laat de andere bal echt gaan, ook al komt hij dichtbij'],
    variaties: {
      makkelijker: ['De trainer roept vóór de worp', 'Ballen dichter bij de keeper'],
      moeilijker: ['Drie kleuren', 'De trainer roept de kleur die je níet moet pakken'],
    },
    en: {
      naam: 'Colour of the ball',
      uitleg:
        'The coach holds a ball in each hand: a red one and a yellow one. They throw both at the same time, one to the left and one to the right of the keeper, and call one colour as they throw. The keeper dives for the ball of that colour and lets the other one go. In the example the coach calls "red".',
      organisatie: 'Keeper in goal, the coach 6 m away with balls in two colours (or two balls with different bibs wrapped round them). Sets of four, the coach calls a different colour each time.',
      benodigdheden: ['Goal', 'Balls in 2 colours'],
      coachpunten: ['Wait for the word, then choose straight away', 'Hands first to the ball of the right colour', 'Really let the other ball go, even if it comes close'],
      variaties: {
        makkelijker: ['The coach calls before the throw', 'Balls closer to the keeper'],
        moeilijker: ['Three colours', 'The coach calls the colour you must NOT take'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 12 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.6, { kijkrichting: 90, verdedigt: 'g1' }),
        trainer(34, 6.6, -90),
        bal('rood', 33.8, 6.05, 't1', { kleur: KLEUR.rood, hand: 'links' }),
        bal('geel', 34.2, 6.05, 't1', { kleur: KLEUR.geel, hand: 'rechts' }),
      ],
      animatie: [
        pauze(0.6),
        stap(
          { type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1, eindHoogte: 0.6, duikNaar: [31.8, 2.1], duikHoogte: 0.5, bal: 'rood' },
          { type: 'pass', van: 't1', naar: [36.4, 0.3], worp: 'onderhands', hoogte: 1, bal: 'geel' },
        ),
        pauze(0.9),
        op(),
        pauze(0.4),
      ],
    },
  },

  // KV4. Indraaiend en uitdraaiend
  {
    id: 'keeper-vz-indraaiend-uitdraaiend',
    naam: 'Indraaiend en uitdraaiend',
    categorieen: ['voorzetten'],
    uitleg:
      'De buitenspeler geeft om de beurt een indraaiende voorzet (die met een boog naar het doel toe draait) en een uitdraaiende (die van het doel af draait). Bij een indraaiende bal staat de keeper iets dieper in zijn doel en komt hij kort uit; bij een uitdraaiende bal staat hij verder voor zijn doel en komt hij ver uit. Zie aan de aanloop en de voet van de buitenspeler welke het wordt.',
    organisatie: 'Keeper in het doel, de buitenspeler met ballen op 18 m langs de zijlijn. Series van zes voorzetten, om en om; daarna van de andere kant.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 1,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Indraaiend: kort uitkomen, de bal komt naar je toe', 'Uitdraaiend: ver uitkomen, de bal draait van je weg', 'Kijk naar de voet en de aanloop van de buitenspeler'],
    variaties: {
      makkelijker: ['Eerst alleen indraaiend', 'Voorzetten uit de hand met een boog'],
      moeilijker: ['De buitenspeler kiest zelf', 'Een aanvaller in de zestien'],
    },
    en: {
      naam: 'Inswinging and outswinging crosses',
      uitleg:
        'The winger alternates an inswinging cross (curling towards the goal) and an outswinging one (curling away from it). For an inswinger the keeper stands a little deeper and comes out a short way; for an outswinger they stand further off the line and come out a long way. Read from the winger’s run-up and foot which one is coming.',
      organisatie: 'Keeper in goal, the winger with balls 18 m out along the touchline. Sets of six crosses, alternating; then from the other side.',
      benodigdheden: ['Goal', '2 cones', 'Balls'],
      coachpunten: ['Inswinger: come out a short way, the ball comes towards you', 'Outswinger: come out a long way, the ball curls away from you', 'Watch the winger’s foot and run-up'],
      variaties: {
        makkelijker: ['Inswingers only at first', 'Crosses thrown with an arc'],
        moeilijker: ['The winger chooses', 'An attacker in the box'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 22, y: -3, breedte: 34, lengte: 22 }),
      objecten: [goal, keeper('k1', 1, 34.4, 1.4, { verdedigt: 'g1', uitkomen: true }), speler('a1', 7, 52, 13, { kijkrichting: -150 }), bal('b1', 51.5, 12.75, 'a1'), bal('b2', 52.8, 14)],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: [36.4, 3.6], hoogte: 'hoog', effect: 2.4, uitkomen: 'k1' }),
        pauze(0.6),
        stap({ type: 'pass', van: 'k1', naar: [44, 10], worp: 'onderhands', hoogte: 'grond' }, { type: 'loop', wie: 'a1', naar: [52.6, 13.6], duur: 0.6 }),
        stap({ type: 'loop', wie: 'k1', naar: [34.6, 2.6], duur: 1 }),
        stap({ type: 'pass', van: 'a1', naar: [35, 7.8], hoogte: 'hoog', effect: -2.4, uitkomen: 'k1', bal: 'b2' }),
        pauze(1),
      ],
    },
  },

  // KR2. Twee tennisballen
  {
    id: 'keeper-re-twee-tennisballen',
    naam: 'Twee tennisballen',
    categorieen: ['reactie'],
    uitleg:
      'De trainer houdt in elke hand een tennisbal, met gestrekte armen op schouderhoogte. Hij laat ze tegelijk vallen. De keeper staat een paar meter verderop en moet ze allebei vangen voordat ze voor de tweede keer de grond raken: snel starten, laag gaan en met elke hand een bal pakken.',
    organisatie: 'De trainer en de keeper staan 3 m van elkaar. Series van vijf; gaat het goed, dan een stap verder weg.',
    benodigdheden: ['2 tennisballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Op de voorvoeten staan, klaar om te starten', 'Kijk naar de handen van de trainer, niet naar zijn gezicht', 'Laag gaan, je handen naar de ballen'],
    variaties: {
      makkelijker: ['Eén tennisbal', 'Dichterbij'],
      moeilijker: ['Verder weg', 'De trainer laat ze na elkaar vallen, met een korte pauze'],
    },
    en: {
      naam: 'Two tennis balls',
      uitleg:
        'The coach holds a tennis ball in each hand, arms stretched out at shoulder height. They drop both at the same time. The keeper stands a few metres away and must catch both before they hit the ground a second time: quick start, get low and take a ball with each hand.',
      organisatie: 'The coach and the keeper stand 3 m apart. Sets of five; if it goes well, take a step further away.',
      benodigdheden: ['2 tennis balls'],
      coachpunten: ['Stand on the balls of your feet, ready to go', 'Watch the coach’s hands, not their face', 'Get low, hands to the balls'],
      variaties: {
        makkelijker: ['One tennis ball', 'Closer'],
        moeilijker: ['Further away', 'The coach drops them one after the other, with a short pause'],
      },
    },
    tekening: {
      ...leeg(12, 10),
      objecten: [
        trainer(4.6, 5, 0),
        bal('ta', 5.1, 4.8, 't1', { variant: 'tennisbal', hand: 'links' }),
        bal('tb', 5.1, 5.2, 't1', { variant: 'tennisbal', hand: 'rechts' }),
        keeper('k1', 1, 8, 5, { kijkrichting: 180 }),
      ],
      animatie: [
        pauze(0.7),
        stap(
          { type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 0.05, stuitOp: [5.5, 4.7], eindHoogte: 0.4, bal: 'ta' },
          { type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 0.05, stuitOp: [5.5, 5.3], eindHoogte: 0.4, bal: 'tb' },
          { type: 'loop', wie: 'k1', naar: [6.6, 5], manier: 'sprint', start: 0.1, duur: 0.45 },
        ),
        pauze(1),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('keepers', oefeningen);
