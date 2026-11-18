// Fase 2, deel 3, batch 4 (0.37.3), deel f: keepers met nieuwe bouwstenen – KW2 (bal om het lichaam en klappen) en KV3 (stootkussen).
// Draaien: node tools/nieuw/fase2-0373f.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, bal, hoedje, pauze, stap, leeg, MIDDEN } = require('./fase2-hulp.cjs');

const oefeningen = [
  // KW2. Bal om je lichaam en vangen
  {
    id: 'keeper-wu-bal-om-je-lichaam',
    naam: 'Bal om je lichaam en vangen',
    categorieen: ['warming-up'],
    uitleg:
      'Elke keeper heeft een eigen bal. Draai de bal van hand tot hand om je middel, twee keer rond, en daarna voorovergebogen om je knieën. Gooi de bal dan recht omhoog, klap in je handen terwijl hij in de lucht is, en vang hem op het hoogste punt, met je armen gestrekt boven je hoofd. Daarna de andere kant op draaien.',
    organisatie: 'Iedere keeper met een bal, op een eigen plek met wat ruimte eromheen. Series van een halve minuut: om het middel, om de knieën, opgooien en vangen. Drie series, dan wisselen van draairichting.',
    benodigdheden: ['1 bal per keeper', 'Hoedjes'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['De bal steeds met je vingers, niet met je handpalmen', 'Kijk de bal na het klappen weer in je handen', 'Vangen op het hoogste punt: handen in een W, armen bijna gestrekt'],
    variaties: {
      makkelijker: ['Zonder klappen', 'Alleen om het middel'],
      moeilijker: ['Twee of drie keer klappen', 'Om één been, in een achtje'],
    },
    en: {
      naam: 'Ball round your body and catch',
      uitleg:
        'Every keeper has their own ball. Pass the ball from hand to hand round your waist, twice round, and then, bending forward, round your knees. Then throw the ball straight up, clap your hands while it is in the air and catch it at the highest point, arms stretched above your head. Then go the other way round.',
      organisatie: 'Each keeper with a ball, in their own spot with some space around it. Sets of half a minute: round the waist, round the knees, throw up and catch. Three sets, then change direction.',
      benodigdheden: ['1 ball per keeper', 'Disc cones'],
      coachpunten: ['Handle the ball with your fingers, not your palms', 'After clapping, watch the ball back into your hands', 'Catch at the highest point: hands in a W, arms almost straight'],
      variaties: {
        makkelijker: ['No clapping', 'Only round the waist'],
        moeilijker: ['Clap two or three times', 'Round one leg, in a figure of eight'],
      },
    },
    tekening: {
      ...leeg(8, 8),
      objecten: [hoedje('h1', 2, 2), hoedje('h2', 6, 2), hoedje('h3', 2, 6), hoedje('h4', 6, 6), keeper('k1', 1, 4, 4.2, { kijkrichting: 90 }), bal('bal', 4, 4.75, 'k1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'omLijf', wie: 'k1', om: 'middel', rondes: 2 }),
        stap({ type: 'omLijf', wie: 'k1', om: 'benen', rondes: 2, duur: 2.4 }),
        pauze(0.3),
        stap({ type: 'pass', van: 'k1', naar: 'k1', worp: 'onderhands', hoogte: 3.2, eindHoogte: 2.1 }, { type: 'klap', wie: 'k1', start: 0.75 }),
        pauze(0.8),
      ],
    },
  },
  // KV3. Hoge bal met een schild
  {
    id: 'keeper-vz-hoge-bal-stootkussen',
    naam: 'Hoge bal met een schild',
    categorieen: ['voorzetten'],
    uitleg:
      'Een trainer gooit een hoge bal voor het doel. Een tweede trainer staat naast de keeper met een stootkussen en duwt hem licht op het moment dat hij omhoog gaat. De keeper zet af op één been, brengt zijn andere knie omhoog (dat beschermt hem en maakt ruimte) en vangt de bal op het hoogste punt, sterk in de lucht ondanks het duwtje.',
    organisatie: 'Keeper in het doel, de trainer met het stootkussen naast hem, een tweede trainer of keeper gooit vanaf 8 m opzij. Duw licht en alleen tegen schouder en heup, nooit tegen een keeper in de lucht van achteren. Series van vijf.',
    benodigdheden: ['Goal', '1 stootkussen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: ['jo16-19'],
    doorwisselbaar: true,
    coachpunten: ['Afzetten op één been, de andere knie omhoog', 'Je lichaam sterk maken: romp aanspannen, ellebogen licht naar buiten', 'Vangen op het hoogste punt, voor je hoofd'],
    variaties: {
      makkelijker: ['Eerst zonder duwen, alleen het kussen ernaast', 'Lagere bal'],
      moeilijker: ['Iets steviger duwen', 'Na het vangen meteen uitgooien'],
    },
    en: {
      naam: 'High ball with a tackle shield',
      uitleg:
        'A coach throws a high ball in front of the goal. A second coach stands beside the keeper with a tackle shield and gives a light push as the keeper goes up. The keeper takes off on one leg, brings the other knee up (which protects them and creates space) and catches the ball at the highest point, strong in the air despite the push.',
      organisatie: 'Keeper in goal, the coach with the tackle shield beside them, a second coach or keeper throws from 8 m to the side. Push lightly and only against shoulder and hip, never from behind against a keeper in the air. Sets of five.',
      benodigdheden: ['Goal', '1 tackle shield', 'Balls'],
      coachpunten: ['Take off on one leg, the other knee up', 'Make your body strong: brace your core, elbows slightly out', 'Catch at the highest point, in front of your head'],
      variaties: {
        makkelijker: ['No pushing at first, just the shield beside you', 'Lower ball'],
        moeilijker: ['Push a little harder', 'Distribute straight after catching'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 25, y: -3, breedte: 22, lengte: 14 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1', uitkomen: true }),
        { id: 't1', soort: 'trainer', x: 34.4, y: 5.8, kijkrichting: -30 },
        { id: 'sk', soort: 'stootkussen', x: 34.7, y: 5.6, drager: 't1' },
        { id: 't2', soort: 'trainer', x: 42, y: 6.4, kijkrichting: 180 },
        bal('bal', 41.45, 6.4, 't2'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 't2', naar: [34.8, 3.4], worp: 'bovenhands', hoogte: 'hoog', uitkomen: 'k1' }, { type: 'loop', wie: 't1', naar: [36.15, 4.75], start: 0.75, duur: 0.35 }),
        stap({ type: 'loop', wie: 't1', naar: [34.4, 5.8], duur: 0.6 }),
        pauze(0.6),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('keepers', oefeningen);
