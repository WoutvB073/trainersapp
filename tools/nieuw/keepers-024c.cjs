// Keeperoefeningen 0.24.0, deel 3: 1 op 1 en spelletjes (C20–C26). Draaien: node tools/nieuw/keepers-024c.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, bal, pop, pauze, stap, keeperVeld } = require('./bouwstenen.cjs');

const terugGooi = (van, naar) => stap({ type: 'pass', van, naar, worp: 'onderhands', hoogte: 1.6 });
const op = (wie = 'k1') => stap({ type: 'opstaan', wie });
const doeltje = (id, x, y, hoek = 180, breedte = 3) => ({ id, soort: 'klein-goal', x, y, hoek, breedte });
const trainer2 = (x, y, kijk = -90) => ({ ...trainer(x, y, kijk), id: 't2' });

const oefeningen = [
  // C20 Uitstappen, vangen en de stilliggende bal lezen
  {
    id: 'keeper-1op1-stilliggende-bal-lezen',
    naam: 'Uitstappen, vangen en de stilliggende bal lezen',
    categorieen: ['een-op-een', 'reactie'],
    uitleg:
      'De keeper stapt uit en vangt een bal van de trainer, en rolt die opzij weg. Op 8 m liggen twee ballen stil, links en rechts. De trainer sprint naar een van de twee en schiet meteen. De keeper leest welke bal het wordt, komt vroeg uit en gaat de trainer met een duik met de voeten vooruit tegemoet.',
    organisatie: 'Twee stilliggende ballen 7 m uit elkaar op 8 m van het doel. Trainer op 12 m met een eerste bal.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Lezen: aan de looprichting van de trainer zie je welke bal het wordt',
      'Vroeg vertrekken, de trainer mag de bal niet rustig klaarleggen',
      'Voeten vooruit: laag, breed en met de handen naast het lichaam',
    ],
    variaties: {
      makkelijker: ['Trainer loopt in plaats van te sprinten', 'Ballen dichter bij het doel'],
      moeilijker: ['Drie stilliggende ballen', 'Trainer mag ook passeren in plaats van schieten', 'Eerste bal halfhoog of met een stuit'],
    },
    tekening: {
      ...keeperVeld({ x: 22, y: -3, breedte: 24, lengte: 19 }),
      objecten: [goal, keeper('k1', 1, 34, 1.6), trainer(34.4, 12.0), bal('b1', 34.4, 11.65, 't1'), bal('b2', 30.6, 8.2), bal('b3', 37.6, 8.2)],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [34, 3.0], manier: 'voetenwerk' }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1.2, eindHoogte: 1.0 }),
        pauze(0.2),
        stap({ type: 'pass', van: 'k1', naar: [27.6, 4.4], worp: 'onderhands', hoogte: 'grond' }),
        stap({ type: 'loop', wie: 't1', naar: [37.6, 8.75], manier: 'sprint' }, { type: 'loop', wie: 'k1', naar: [36.0, 5.2], manier: 'sprint', start: 0.35 }),
        stap({ type: 'pak', wie: 't1', bal: 'b3', duur: 0.15 }),
        stap({ type: 'schot', van: 't1', naar: [35.4, 0], hoogte: 'grond', blokt: 'k1', blokSoort: 'voeten', afloopNaar: [41.6, 5.2] }),
        pauze(0.6),
        op(),
        pauze(0.4),
      ],
    },
  },

  // C21 Hoek dichtlopen, nieuwe hoek
  {
    id: 'keeper-1op1-hoek-dichtlopen-nieuwe-hoek',
    naam: 'Hoek dichtlopen, nieuwe hoek',
    categorieen: ['een-op-een'],
    uitleg:
      'De trainer dribbelt schuin van rechts op het doel af. De keeper komt uit en loopt de hoek dicht. Vlak voor het schot legt de trainer de bal breed op keeper 2, die van links komt: de keeper moet meteen een nieuwe hoek kiezen. Hij beslist zelf: blokken, de bal aan de voet klemmen of duiken.',
    organisatie: 'Trainer met ballen schuin rechts op 15 m, keeper 2 schuin links op 12 m.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: [
      'Uitkomen op de lijn bal–midden van het doel',
      'Bij de breedtepass: snel opzij en opnieuw zetten, niet doorlopen',
      'Bal dichtbij en aan de voet: klemmen; bal net weg: blokken; schot op afstand: duiken',
    ],
    variaties: {
      makkelijker: ['Trainer kiest altijd de breedtepass', 'Keeper 2 neemt eerst aan'],
      moeilijker: ['Trainer kiest zelf: schieten of breed leggen', 'Keeper 2 mag direct schieten', 'Van beide kanten'],
    },
    tekening: {
      ...keeperVeld({ x: 20, y: -3, breedte: 28, lengte: 21 }),
      objecten: [goal, keeper('k1', 1, 34, 1.6), trainer(42.0, 14.6, -120), keeper('k2', 2, 26.4, 12.2, { kijkrichting: -60 }), bal('b1', 41.8, 14.3, 't1')],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'dribbel', wie: 't1', naar: [39.4, 8.6] },
          { type: 'loop', wie: 'k1', naar: [36.0, 3.4], manier: 'voetenwerk', start: 0.3 },
          { type: 'loop', wie: 'k2', naar: [28.4, 9.8], start: 0.4 },
        ),
        stap({ type: 'pass', van: 't1', naar: 'k2' }, { type: 'loop', wie: 'k1', naar: [33.0, 3.2], manier: 'voetenwerk', start: 0.2 }),
        stap({ type: 'dribbel', wie: 'k2', naar: [30.0, 7.4] }),
        stap({ type: 'schot', van: 'k2', naar: 'k1', hoogte: 'grond', duikNaar: [32.0, 4.2] }),
        pauze(0.6),
        op(),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // C22 Keeper met verdediger
  {
    id: 'keeper-1op1-keeper-met-verdediger',
    naam: 'Keeper met verdediger',
    categorieen: ['een-op-een', 'reactie'],
    uitleg:
      'De trainer dribbelt als aanvaller op het doel af. Keeper 2 speelt verdediger: hij gaat erop af en probeert het schot te blokken. De keeper blijft in zijn doel, verschuift mee met de bal en houdt rekening met een schot langs de verdediger. Eerste aanval: de verdediger blokt. Tweede aanval: de trainer schiet langs hem heen en de keeper duikt.',
    organisatie: 'Trainer met ballen op 18 m, keeper 2 als verdediger op 10 m.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: [
      'Coachen: zeg de verdediger welke kant hij moet dichtzetten',
      'Blijf op je lijn en zet je bij elk moment dat de aanvaller kan schieten',
      'Schot langs de verdediger: laat late reactie niet verrassen, kijk langs hem heen',
    ],
    variaties: {
      makkelijker: ['Verdediger blijft staan', 'Aanvaller schiet alleen laag'],
      moeilijker: ['Verdediger mag ook de bal veroveren', 'Tweede aanvaller voor de terugleg', 'Aanvaller mag de verdediger passeren en 1 op 1 gaan'],
    },
    tekening: {
      ...keeperVeld({ x: 22, y: -3, breedte: 24, lengte: 24 }),
      objecten: [goal, keeper('k1', 1, 34, 1.6), keeper('k2', 2, 36.4, 10.2, { kijkrichting: 90 }), trainer(40.4, 18.4, -105), bal('b1', 40.3, 18.05, 't1'), bal('b2', 41.6, 19.2)],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'dribbel', wie: 't1', naar: [38.6, 13.4] },
          { type: 'loop', wie: 'k2', naar: [37.6, 10.6], start: 0.3 },
          { type: 'loop', wie: 'k1', naar: [34.6, 1.8], manier: 'voetenwerk', start: 0.3 },
        ),
        stap({ type: 'schot', van: 't1', naar: [35.2, 0], hoogte: 0.4, blokt: 'k2', blokSoort: 'ster', afloopNaar: [42.0, 10.0] }),
        pauze(0.5),
        stap({ type: 'loop', wie: 't1', naar: [41.6, 19.75] }, { type: 'loop', wie: 'k2', naar: [36.4, 10.2] }, { type: 'loop', wie: 'k1', naar: [34, 1.6], manier: 'voetenwerk' }),
        stap({ type: 'pak', wie: 't1', bal: 'b2', duur: 0.15 }),
        stap(
          { type: 'dribbel', wie: 't1', naar: [39.8, 14.0] },
          { type: 'loop', wie: 'k2', naar: [40.4, 11.4], start: 0.3 },
          { type: 'loop', wie: 'k1', naar: [34.8, 1.8], manier: 'voetenwerk', start: 0.3 },
        ),
        stap({ type: 'schot', van: 't1', naar: 'k1', bal: 'b2', hoogte: 'grond', duikNaar: [32.6, 1.6] }),
        pauze(0.6),
        op(),
        pauze(0.4),
      ],
    },
  },

  // C23 Uitspelen, dan hoek verkleinen
  {
    id: 'keeper-1op1-uitspelen-hoek-verkleinen',
    naam: 'Uitspelen, dan hoek verkleinen',
    categorieen: ['een-op-een', 'passing'],
    uitleg:
      'De keeper speelt de bal uit naar keeper 2, die als aanvaller om een pop heen dribbelt en op het doel afgaat. De keeper komt uit, verkleint de hoek en blokt. Daarna loopt hij snel terug, want de trainer schiet van ver: de keeper zet zich en duikt.',
    organisatie: 'Pop op 12 m recht voor het doel, keeper 2 schuin links op 16 m. Trainer met een bal schuin rechts op 20 m.',
    benodigdheden: ['Goal', 'Pop', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: [
      'Uitspelen strak en op de voet van de aanvaller',
      'Uitkomen zolang de aanvaller de bal niet onder controle heeft; zetten als hij gaat schieten',
      'Na de redding: achteruit terug met het gezicht naar het veld',
    ],
    variaties: {
      makkelijker: ['Aanvaller dribbelt rustiger', 'Afstandsschot pas als de keeper staat'],
      moeilijker: ['Aanvaller mag ook om de keeper heen', 'Afstandsschot hoog in de hoek', 'Trainer schiet al tijdens het teruglopen'],
    },
    tekening: {
      ...keeperVeld({ x: 20, y: -3, breedte: 28, lengte: 26 }),
      objecten: [
        goal,
        pop('p1', 34, 12.0),
        keeper('k1', 1, 34, 2.0),
        keeper('k2', 2, 28.4, 16.2, { kijkrichting: -40 }),
        trainer(40.4, 20.4, -110),
        bal('b1', 34.0, 2.4, 'k1'),
        bal('b2', 40.3, 20.05, 't1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 'k2', worp: 'voet' }),
        stap({ type: 'dribbel', wie: 'k2', via: [[32.6, 14.6]], naar: [36.0, 13.6] }),
        stap({ type: 'dribbel', wie: 'k2', naar: [36.0, 9.4] }, { type: 'loop', wie: 'k1', naar: [35.0, 4.6], manier: 'voetenwerk', start: 0.3 }),
        stap({ type: 'schot', van: 'k2', naar: [35.4, 0], hoogte: 0.5, blokt: 'k1', blokSoort: 'ster', afloopNaar: [41.6, 5.6] }),
        pauze(0.3),
        stap({ type: 'loop', wie: 'k1', naar: [34.4, 1.8], manier: 'achteruit' }, { type: 'loop', wie: 'k2', naar: [29.8, 10.4] }),
        pauze(0.2),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [32.6, 2.2] }),
        pauze(0.6),
        op(),
        pauze(0.4),
      ],
    },
  },

  // C24 Keepersspel met vier doeltjes
  {
    id: 'keeper-sp-vier-doeltjes',
    naam: 'Keepersspel met vier doeltjes',
    categorieen: ['spelletjes', 'een-op-een'],
    uitleg:
      'Vier doeltjes in een vierkant. Twee keepers verdedigen elk een eigen doeltje, tegenover elkaar. Bij de andere twee doeltjes staat een aangever. Een aangever schiet op een van de keepers. Vangt die de bal, dan gaat hij meteen in de counter op de overkant: met een worp of een trap op het doeltje van de andere keeper. Een gevangen bal en een redding tellen; elk doelpunt is een punt voor de schutter. Na een paar minuten wisselen de keepers en de aangevers van rol.',
    organisatie: 'Vierkant van 22 × 22 m, in het midden van elke zijde een doeltje van 3 m. Keepers in de doeltjes noord en zuid, aangevers bij de doeltjes oost en west.',
    benodigdheden: ['4 doeltjes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 4,
    doorwisselbaar: true,
    coachpunten: [
      'Klein doeltje: blijf vlak voor je lijn, dan heb je alles binnen bereik',
      'Na het vangen: kijken en snel spelen, de andere keeper staat nog niet',
      'Counter strak en laag, of met een boog als de keeper ver voor zijn doeltje staat',
    ],
    variaties: { makkelijker: ['Grotere doeltjes', 'Counter alleen met de hand'], moeilijker: ['Aangevers spelen ook elkaar aan voor het schot', 'Counter alleen met de voet', 'Kleinere doeltjes'] },
    tekening: {
      veld: { type: 'leeg', breedte: 26, lengte: 26 },
      camera: 'schuin',
      objecten: [
        doeltje('dZ', 13, 2.0, 0),
        doeltje('dN', 13, 24.0, 180),
        doeltje('dW', 2.0, 13, -90),
        doeltje('dO', 24.0, 13, 90),
        keeper('k1', 1, 13, 3.4, { kijkrichting: 90 }),
        keeper('k2', 2, 13, 22.6, { kijkrichting: -90 }),
        keeper('k3', 3, 3.6, 13.6, { kijkrichting: 0 }),
        keeper('k4', 4, 22.4, 12.4, { kijkrichting: 180 }),
        bal('b1', 3.95, 13.6, 'k3'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'schot', van: 'k3', naar: 'k1', worp: 'trap', hoogte: 1.0, eindHoogte: 0.9 }),
        pauze(0.2),
        stap({ type: 'pass', van: 'k1', naar: [12.0, 23.6], worp: 'bovenhands', hoogte: 1.6, eindHoogte: 0.5, duikNaar: [12.0, 22.8], duikHoogte: 0.5 }),
        pauze(0.5),
        op('k2'),
        stap({ type: 'pass', van: 'k2', naar: 'k4', worp: 'onderhands', hoogte: 1.6 }),
        pauze(0.3),
        stap({ type: 'schot', van: 'k4', naar: 'k2', worp: 'trap', hoogte: 0.8, eindHoogte: 0.7 }),
        pauze(0.2),
        stap({ type: 'pass', van: 'k2', naar: [14.0, 2.6], worp: 'dropkick', hoogte: 2.6, eindHoogte: 0.6, duikNaar: [14.2, 3.2], duikHoogte: 0.5 }),
        pauze(0.6),
        op('k1'),
        pauze(0.4),
      ],
    },
  },

  // C25 Twee tegen twee, twee doelen
  {
    id: 'keeper-sp-twee-tegen-twee-twee-doelen',
    naam: 'Twee tegen twee, twee doelen',
    categorieen: ['spelletjes', 'een-op-een'],
    uitleg:
      'Twee doelen tegenover elkaar, in elk doel een keeper. Twee trainers zijn de aanvallers: ze combineren en gaan samen op een van de doelen af. Na een redding zet de keeper de volgende aanval op door de bal naar een van de trainers te gooien, en dan gaan die op het andere doel af. Welke keeper krijgt de minste doelpunten tegen?',
    organisatie: 'Twee doelen op ± 30 m van elkaar (of twee kleine doelen van 5 m). Trainers met ballen in het midden.',
    benodigdheden: ['2 goals', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Meeverschuiven met de bal, ook bij een pass tussen de aanvallers', 'Zetten op het moment van schieten', 'Na de redding: snel en precies opbouwen, op de voet van de trainer'],
    variaties: {
      makkelijker: ['Eén aanvaller', 'Aanvallers spelen maximaal één keer over'],
      moeilijker: ['Na de redding meteen de counter (direct doorspelen)', 'Ook kopballen na een voorzet', 'Kleinere afstand tussen de doelen'],
    },
    tekening: {
      veld: { type: 'leeg', breedte: 30, lengte: 34 },
      camera: 'schuin',
      objecten: [
        { id: 'g1', soort: 'goal', x: 15, y: 1, breedte: 6, hoogte: 2 },
        { id: 'g2', soort: 'goal', x: 15, y: 33, hoek: 180, breedte: 6, hoogte: 2 },
        keeper('k1', 1, 15, 2.4, { kijkrichting: 90 }),
        keeper('k2', 2, 15, 31.6, { kijkrichting: -90 }),
        trainer(11.6, 17.0, -80),
        trainer2(18.6, 18.0, -100),
        bal('b1', 11.65, 16.65, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 't1', naar: [12.4, 12.0] }, { type: 'loop', wie: 't2', naar: [18.0, 11.0], start: 0.2 }),
        stap({ type: 'pass', van: 't1', naar: 't2' }, { type: 'loop', wie: 'k1', naar: [15.6, 2.6], manier: 'voetenwerk', start: 0.3 }),
        stap({ type: 'dribbel', wie: 't2', naar: [17.4, 8.0] }),
        stap({ type: 'schot', van: 't2', naar: 'k1', hoogte: 'grond', duikNaar: [13.6, 2.4] }),
        pauze(0.5),
        op(),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'bovenhands', hoogte: 2.4 }, { type: 'draai', wie: 't1', kijk: 90, duur: 0.4 }, { type: 'draai', wie: 't2', kijk: 90, duur: 0.4 }),
        stap({ type: 'dribbel', wie: 't1', naar: [13.0, 20.0] }, { type: 'loop', wie: 't2', naar: [18.4, 22.0], start: 0.2 }),
        stap({ type: 'pass', van: 't1', naar: 't2' }, { type: 'loop', wie: 'k2', naar: [15.8, 31.4], manier: 'voetenwerk', start: 0.3 }),
        stap({ type: 'dribbel', wie: 't2', naar: [17.6, 25.8] }, { type: 'loop', wie: 'k2', naar: [16.2, 29.4], manier: 'voetenwerk', start: 0.3 }),
        stap({ type: 'schot', van: 't2', naar: [17.0, 33], hoogte: 0.5, blokt: 'k2', blokSoort: 'ster', afloopNaar: [23.0, 28.0] }),
        pauze(1.0),
      ],
    },
  },

  // C26 Eén-op-één-competitie
  {
    id: 'keeper-sp-een-op-een-competitie',
    naam: 'Eén-op-één-competitie',
    categorieen: ['spelletjes', 'een-op-een'],
    uitleg:
      'Eén keeper staat in het doel, de andere keepers zijn om de beurt aanvaller. De aanvaller speelt de trainer aan, die kaatst de bal met een steekpass in de ruimte. De aanvaller gaat 1 op 1 op het doel af. Na een ronde staat de keeper met de meeste tegendoelpunten weer in het doel.',
    organisatie: 'Aanvallers met ballen op 22 m, trainer op 16 m. Eén keeper in het doel.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: [
      'Bij de steekpass al vertrekken: de bal is het moment om ruimte te winnen',
      'Aanvaller heeft de bal aan de voet: zetten, klein en breed, en blokken',
      'Als aanvaller: tempo houden en de keeper laten kiezen',
    ],
    variaties: {
      makkelijker: ['Trainer speelt de bal op de voet', 'Aanvaller moet binnen 5 s schieten'],
      moeilijker: ['Steekpass ook door de lucht', 'Een tweede aanvaller sprint mee voor de terugleg', 'Doelpunt telt dubbel na een passeeractie'],
    },
    tekening: {
      ...keeperVeld({ x: 20, y: -3, breedte: 28, lengte: 28 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.8),
        trainer(37.2, 16.0, -150),
        keeper('k2', 2, 30.8, 22.4, { kijkrichting: -60 }),
        keeper('k3', 3, 29.0, 23.6, { kijkrichting: -60 }),
        bal('b1', 31.05, 22.1, 'k2'),
        bal('b2', 29.25, 23.3, 'k3'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'k2', naar: 't1' }),
        stap({ type: 'pass', van: 't1', naar: [34.0, 12.0], direct: true }, { type: 'loop', wie: 'k2', naar: [33.4, 13.0], manier: 'sprint', start: 0.1 }),
        stap({ type: 'dribbel', wie: 'k2', naar: [34.6, 8.0] }, { type: 'loop', wie: 'k1', naar: [34.4, 4.6], manier: 'voetenwerk', start: 0.2 }),
        stap({ type: 'schot', van: 'k2', naar: [32.8, 0], hoogte: 'grond', blokt: 'k1', blokSoort: 'knie', afloopNaar: [27.4, 6.0] }),
        pauze(0.4),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.8], manier: 'achteruit' }, { type: 'loop', wie: 'k2', naar: [27.0, 10.6] }),
        stap({ type: 'pass', van: 'k3', naar: 't1', bal: 'b2' }),
        stap({ type: 'pass', van: 't1', naar: [35.4, 11.4], direct: true, bal: 'b2' }, { type: 'loop', wie: 'k3', naar: [34.6, 12.6], manier: 'sprint', start: 0.1 }),
        stap({ type: 'dribbel', wie: 'k3', naar: [35.6, 7.6] }, { type: 'loop', wie: 'k1', naar: [34.6, 4.4], manier: 'voetenwerk', start: 0.2 }),
        stap({ type: 'schot', van: 'k3', naar: [37.0, 0], hoogte: 'grond', blokt: 'k1', blokSoort: 'voeten', afloopNaar: [41.4, 5.0] }),
        pauze(0.8),
      ],
    },
  },
];

zet('keepers', oefeningen);
