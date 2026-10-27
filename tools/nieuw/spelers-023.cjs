// Spelersoefening 0.23.0 (A4). Draaien: node tools/nieuw/spelers-023.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, speler, bal, paaltje, pauze, stap } = require('./bouwstenen.cjs');

const oefeningen = [
  {
    id: 'veld-af-dribbelrace-1t1',
    naam: 'Dribbelrace, afronden en 1 tegen 1',
    categorieen: ['afwerken'],
    uitleg:
      'Twee spelers starten tegelijk met een bal aan een dribbelparcours: een slalom om de paaltjes. Het rechterparcours is bewust iets langer. Wie het eerst klaar is, schiet direct op doel en draait zich dan om om de ander, die net later klaar is, in een 1 tegen 1 te verdedigen. Na afloop wisselen de spelers van parcours.',
    organisatie: 'Twee slaloms van paaltjes op ± 20 m van het doel: links drie paaltjes, rechts vier (iets verder weg). Spelers in twee rijen met elk een bal. Keeper in het doel.',
    benodigdheden: ['Goal', '7 paaltjes', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Dribbelen met kleine tikjes, bal dicht aan de voet',
      'Na het schot meteen omschakelen: tussen de aanvaller en het doel komen',
      'Aanvaller: tempo maken en schieten zodra er ruimte is',
    ],
    variaties: {
      makkelijker: ['Parcoursen even lang', 'Verdediger mag pas na een teken van de trainer'],
      moeilijker: ['Langere slalom met kappen en draaien', 'Twee tegen één: de eerste twee die klaar zijn spelen samen', 'Schot binnen 3 seconden na het parcours'],
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 18, y: -3, breedte: 32, lengte: 33 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        paaltje('q1', 28, 23.6),
        paaltje('q2', 28, 21.6),
        paaltje('q3', 28, 19.6),
        paaltje('r1', 40, 25.6),
        paaltje('r2', 40, 23.4),
        paaltje('r3', 40, 21.2),
        paaltje('r4', 40, 19.0),
        speler('a1', 7, 28, 26.0, { kijkrichting: -90 }),
        speler('a2', 9, 40, 28.0, { kijkrichting: -90, team: 'B' }),
        bal('b1', 28, 25.6, 'a1'),
        bal('b2', 40, 27.6, 'a2'),
      ],
      animatie: [
        pauze(0.6),
        stap(
          {
            type: 'dribbel',
            wie: 'a1',
            via: [
              [28.85, 23.6],
              [27.15, 21.6],
              [28.85, 19.6],
            ],
            naar: [29.4, 17.4],
          },
          {
            type: 'dribbel',
            wie: 'a2',
            via: [
              [40.85, 25.6],
              [39.15, 23.4],
              [40.85, 21.2],
            ],
            naar: [39.15, 19.0],
          },
        ),
        stap({ type: 'schot', van: 'a1', naar: [31.4, -0.4], afloop: 'goal' }, { type: 'dribbel', wie: 'a2', naar: [38.6, 16.2] }),
        stap({ type: 'loop', wie: 'a1', naar: [35.4, 12.2], manier: 'sprint' }, { type: 'dribbel', wie: 'a2', naar: [37.6, 14.4], start: 0.2 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [36.6, 10.6] }, { type: 'druk', wie: 'a1', op: 'a2', afstand: 2.3 }),
        stap({ type: 'schot', van: 'a2', naar: [35.6, 0.3], afloop: 'vangt' }),
        pauze(1.0),
      ],
    },
  },
];

zet('veld', oefeningen);
