// Keeperoefeningen 0.23.0, deel 3: reactie (B25–B30). Draaien: node tools/nieuw/keepers-023c.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, bal, hoedje, pop, horde, pauze, stap, terug, KLEUR, keeperVeld } = require('./bouwstenen.cjs');

const terugGooi = (van, naar) => stap({ type: 'pass', van, naar, worp: 'onderhands', hoogte: 1.6 });
const op = (wie = 'k1') => stap({ type: 'opstaan', wie });
const naar = (x, y, manier = 'voetenwerk', extra = {}) => stap({ type: 'loop', wie: 'k1', naar: [x, y], manier, ...extra });

const oefeningen = [
  // B25 Kleurvolgorde, hordes en vallende bal
  {
    id: 'keeper-re-kleurvolgorde-vallende-bal',
    naam: 'Kleurvolgorde, hordes en vallende bal',
    categorieen: ['reactie', 'laag-duiken'],
    uitleg:
      'De trainer roept drie kleuren; de keeper tikt de hoedjes in die volgorde aan en springt daarna over twee lage hordes naar voren. Daar staat hij met zijn rug naar het doel tegenover de trainer, die met gestrekte armen twee ballen vasthoudt. De trainer laat er één vallen en de keeper duikt naar die kant om de bal te pakken voordat hij voor de tweede keer stuit.',
    organisatie: 'Drie gekleurde hoedjes voor het doel, twee lage hordes daarachter. Trainer 3–4 m voor het eind van de hordes, met in elke hand een bal.',
    benodigdheden: ['Goal', '3 gekleurde hoedjes', '2 lage hordes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Onthoud de volgorde en kijk niet steeds naar de trainer', 'Na de hordes meteen laag in basishouding', 'Reageer op de bal, niet op de armen van de trainer'],
    variaties: { makkelijker: ['Twee kleuren', 'Trainer roept welke bal hij loslaat'], moeilijker: ['Vier kleuren', 'Trainer dichterbij', 'Bal mag niet eens één keer stuiten'] },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 17 }),
      objecten: [
        goal,
        hoedje('hR', 31.8, 3.2, KLEUR.rood),
        hoedje('hB', 36.2, 3.2, KLEUR.blauw),
        hoedje('hG', 36.2, 5.0, KLEUR.geel),
        horde('h1', 34, 5.6, 0, 0.15),
        horde('h2', 34, 6.8, 0, 0.15),
        keeper('k1', 1, 34, 1.6),
        trainer(34.2, 11.2),
        bal('b1', 34.2, 10.85, 't1'),
      ],
      animatie: [
        pauze(0.6),
        naar(32.4, 2.6, 'sprint'),
        stap({ type: 'aantikken', wie: 'k1', doel: 'hR' }),
        naar(35.6, 2.6, 'sprint'),
        stap({ type: 'aantikken', wie: 'k1', doel: 'hB' }),
        naar(35.5, 4.6, 'voetenwerk'),
        stap({ type: 'aantikken', wie: 'k1', doel: 'hG' }),
        naar(34, 4.5, 'voetenwerk'),
        naar(34, 7.7, 'hordes'),
        stap({ type: 'loop', wie: 'k1', naar: [34, 7.9], manier: 'voetenwerk', duur: 0.4 }),
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 0.3, stuitOp: [35.0, 10.2], eindHoogte: 0.3, duikNaar: [35.2, 9.0] }),
        pauze(0.5),
        op(),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // B26 Dropkick tussen de poppen
  {
    id: 'keeper-re-dropkick-poppen',
    naam: 'Dropkick tussen de poppen',
    categorieen: ['reactie'],
    uitleg:
      'Twee poppen staan voor het doel met een opening ertussen. De trainer trapt vanaf de rand van het strafschopgebied een dropkick tussen de poppen door. Soms gaat de bal rechtdoor, soms raakt hij een pop en verandert hij van richting: de keeper wacht af en reageert op de echte baan van de bal.',
    organisatie: 'Twee poppen 2,8 m uit elkaar, 6 m voor het doel. Trainer met ballen op 16 m.',
    benodigdheden: ['Goal', '2 poppen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Niet te vroeg kiezen: blijf staan tot je de baan ziet', 'Laag zwaartepunt, gewicht op de voorvoeten', 'Afgeketste bal: kort en snel reageren, handen eerst'],
    variaties: { makkelijker: ['Poppen verder uit elkaar', 'Trainer gooit in plaats van trapt'], moeilijker: ['Poppen dichter bij het doel', 'Drie poppen', 'Trainer trapt harder'] },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 22 }),
      objecten: [goal, pop('pL', 32.6, 6.0), pop('pR', 35.4, 6.0), keeper('k1', 1, 34, 1.6), trainer(34.0, 16.0), bal('b1', 34.0, 15.6, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'schot', van: 't1', naar: 'k1', worp: 'dropkick', hoogte: 1.2, eindHoogte: 1.0 }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'bovenhands', hoogte: 3.2 }),
        pauze(0.3),
        stap({ type: 'pass', van: 't1', naar: 'pR', worp: 'dropkick', hoogte: 0.6, terug: 'k1', duikNaar: [35.7, 1.9] }),
        pauze(0.5),
        op(),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'bovenhands', hoogte: 3.2 }),
        pauze(0.3),
        stap({ type: 'schot', van: 't1', naar: 'k1', worp: 'dropkick', hoogte: 1.4, eindHoogte: 0.9, duikNaar: [33.0, 1.6], duikHoogte: 0.9 }),
        pauze(0.5),
        op(),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'bovenhands', hoogte: 3.2 }),
        pauze(0.4),
      ],
    },
  },

  // B27 Rebounder of zijkant
  {
    id: 'keeper-re-rebounder-zijkant',
    naam: 'Rebounder of zijkant',
    categorieen: ['reactie', 'een-op-een'],
    uitleg:
      'De trainer kiest steeds wat er gebeurt. Of hij speelt de bal tegen de rebounder voor het doel, die hem op doel kaatst: de keeper reageert en vangt. Of hij speelt de bal naar een keeper aan de zijkant, die meteen op een minidoeltje gaat: de keeper sprint ernaartoe en blokt het schot. Daarna wisselen de keepers door.',
    organisatie:
      'Rebounder 6,5 m voor het doel. Minidoeltje rechts naast het doel, 8 m van het midden. Trainer met ballen op 11 m, een keeper aan de rechterkant op ± 9 m en een keeper links die de ballen terugbrengt.',
    benodigdheden: ['Goal', 'Rebounder', 'Minidoeltje', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Lees de trainer: kijk naar zijn houding en de bal', 'Kaatsbal: kort reageren, handen naar de bal', '1 op 1: snel naar het doeltje, dan klein en breed staan en blokken'],
    variaties: {
      makkelijker: ['Trainer zegt wat hij gaat doen', 'Minidoeltje dichterbij'],
      moeilijker: ['Keeper aan de zijkant mag ook dribbelen', 'Twee minidoeltjes', 'Trainer schiet direct na de kaatsbal nog een keer'],
    },
    tekening: {
      ...keeperVeld({ x: 23, y: -3, breedte: 24, lengte: 17 }),
      objecten: [
        goal,
        { id: 'rb', soort: 'rebounder', x: 34, y: 6.5, breedte: 1.6 },
        { id: 'kg', soort: 'klein-goal', x: 42.0, y: 2.6, breedte: 2.5 },
        keeper('k1', 1, 34, 1.6),
        trainer(33.0, 11.0),
        keeper('k2', 2, 42.2, 9.4, { kijkrichting: -150 }),
        keeper('k3', 3, 27.6, 8.4, { kijkrichting: -40 }),
        bal('b1', 33.0, 10.6, 't1'),
        bal('b2', 33.6, 11.4),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'rb', terug: 'k1', terugHoogte: 'laag' }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 'k3', worp: 'onderhands', hoogte: 2 }),
        stap({ type: 'pak', wie: 't1', bal: 'b2' }),
        stap({ type: 'pass', van: 't1', naar: 'k2' }, { type: 'loop', wie: 'k1', naar: [41.0, 4.6], manier: 'sprint', start: 0.4 }),
        stap({ type: 'dribbel', wie: 'k2', naar: [42.2, 7.4] }),
        stap({ type: 'schot', van: 'k2', naar: [42.4, 2.6], hoogte: 0.5, blokt: 'k1', blokSoort: 'ster', afloopNaar: [37.8, 7.8] }),
        pauze(1.0),
      ],
    },
  },

  // B28 Draaisprong en blokken met de voeten vooruit
  {
    id: 'keeper-re-draaisprong-voetenblok',
    naam: 'Draaisprong en blokken met de voeten vooruit',
    categorieen: ['reactie', 'een-op-een', 'laag-duiken'],
    uitleg:
      'De keeper staat met zijn rug naar het veld. Op een signaal maakt hij een draaisprong van 180°, stapt uit naar de trainer die met de bal op hem afkomt en blokt het schot glijdend met de voeten vooruit. Opstaan, achteruit terug in het doel en dan gooit de trainer een tweede bal naar een kant die de keeper niet weet: duiken en vangen.',
    organisatie: 'Keeper 2 m voor de doellijn, rug naar het veld. Trainer met twee ballen op 8 m.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Draaisprong: landen in basishouding, meteen naar de bal kijken',
      'Blok met de voeten vooruit: laag naar de bal glijden, benen gesloten, handen naast je',
      'Achteruit terug met het gezicht naar het veld',
    ],
    variaties: {
      makkelijker: ['Zonder draaisprong (gewoon omdraaien)', 'Trainer rolt de bal in plaats van schieten'],
      moeilijker: ['Signaal pas op het laatst', 'Tweede bal hoog', 'Trainer mag ook om de keeper heen dribbelen'],
    },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 13 }),
      objecten: [goal, keeper('k1', 1, 34, 2.0, { kijkrichting: -90 }), trainer(34.4, 8.4), bal('b1', 34.4, 8.05, 't1'), bal('b2', 35.4, 9.0)],
      animatie: [
        pauze(0.8),
        stap({ type: 'draai', wie: 'k1', naar: 't1', sprong: true }),
        stap({ type: 'dribbel', wie: 't1', naar: [34.4, 6.8] }, { type: 'loop', wie: 'k1', naar: [34.2, 4.0], manier: 'voetenwerk', start: 0.1 }),
        stap({ type: 'schot', van: 't1', naar: [34.0, 0], hoogte: 'grond', blokt: 'k1', blokSoort: 'voeten', afloopNaar: [37.8, 6.2] }),
        pauze(0.6),
        stap({ type: 'loop', wie: 'k1', naar: [34, 2.0], manier: 'achteruit' }, { type: 'loop', wie: 't1', naar: [34.6, 8.6], start: 0.2 }),
        stap({ type: 'pak', wie: 't1', bal: 'b2' }),
        pauze(0.3),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'grond', duikNaar: [32.3, 2.1] }),
        pauze(0.5),
        op(),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // B29 Stuitbal, schuin en op het lichaam
  {
    id: 'keeper-re-stuitbal-schuin-lichaam',
    naam: 'Stuitbal, schuin en op het lichaam',
    categorieen: ['reactie', 'bal-verwerken'],
    uitleg:
      'De keeper gaat net voorbij de rechterpaal en pakt daar een stuitbal van de trainer. Bal terug, dan de hoek dichtzetten tegen een schuin schot van keeper 2. Tot slot terug naar het midden van het doel voor een hard schot op het lichaam. Daarna wisselen de keepers.',
    organisatie: 'Trainer met ballen op 10 m recht voor het doel, keeper 2 schuin rechts op ± 9 m.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: [
      'Stuitbal: lichaam achter de bal, klemmen tegen de borst',
      'Hoek dichtzetten: op de lijn bal–midden van het doel, niet te ver naar de paal',
      'Hard schot op het lichaam: niet terugdeinzen, de bal naar je toe halen',
    ],
    variaties: {
      makkelijker: ['Stuitbal hoger laten opspringen', 'Schoten minder hard'],
      moeilijker: ['Schuin schot naar de korte hoek', 'Laatste schot net naast het lichaam', 'Tempo hoger: geen pauze tussen de ballen'],
    },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 22, lengte: 14 }),
      objecten: [goal, keeper('k1', 1, 34, 1.6), trainer(34.4, 10.2), keeper('k2', 2, 41.4, 8.4, { kijkrichting: -125 }), bal('b1', 34.4, 9.8, 't1'), bal('b2', 41.15, 8.1, 'k2')],
      animatie: [
        pauze(0.4),
        naar(38.4, 2.0, 'voetenwerk'),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 1.2, stuitOp: [38.0, 4.6], eindHoogte: 0.9 }),
        pauze(0.3),
        terugGooi('k1', 't1'),
        naar(36.4, 2.2, 'voetenwerk'),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 1.2, eindHoogte: 0.9 }),
        pauze(0.3),
        terug('k1', 'k2'),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.8], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 1.3, eindHoogte: 1.1, snelheid: 18 }),
        pauze(0.3),
        terugGooi('k1', 't1'),
        pauze(0.3),
        stap({ type: 'loop', wie: 'k1', via: [[38.4, 2.6]], naar: [40.6, 6.8] }, { type: 'loop', wie: 'k2', via: [[37.8, 6.6]], naar: [34, 1.6], start: 0.3 }),
        pauze(0.5),
      ],
    },
  },

  // B30 Cutback verdedigen
  {
    id: 'keeper-vz-cutback',
    naam: 'Cutback verdedigen',
    categorieen: ['voorzetten', 'reactie', 'laag-duiken'],
    uitleg:
      'Eerst een lage bal van de trainer: duiken, vangen en opstaan. Intussen staat keeper 2 met de bal bij de achterlijn; de keeper gaat naar de eerste paal. Keeper 2 legt de bal terug naar de trainer, die inmiddels bij de penaltystip staat: de keeper past snel zijn positie aan en verwerkt het schot.',
    organisatie: 'Trainer met ballen op 9 m, keeper 2 met een bal op de achterlijn rechts, 8 m naast het doel. Na een paar keer wisselen de keepers.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Bij de eerste paal: niets tussen de paal en jou door', 'Teruggelegde bal: meteen een paar meter mee naar het midden en zetten', 'Op tijd stilstaan, dan pas reageren op het schot'],
    variaties: {
      makkelijker: ['Zonder de eerste duik', 'Trainer neemt de bal eerst aan'],
      moeilijker: ['Keeper 2 kiest: kort voorzetten of terugleggen', 'Trainer schiet in één keer', 'Een tegenstander bij de eerste paal'],
    },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 22, lengte: 14 }),
      objecten: [goal, keeper('k1', 1, 34, 1.6), trainer(34.4, 9.0), keeper('k2', 2, 42.4, 0.9, { kijkrichting: 150 }), bal('b1', 34.4, 8.6, 't1'), bal('b2', 42.05, 1.1, 'k2')],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'grond', duikNaar: [32.3, 1.8] }),
        pauze(0.4),
        op(),
        terugGooi('k1', 't1'),
        stap({ type: 'loop', wie: 'k1', naar: [36.9, 1.0], manier: 'sprint' }, { type: 'loop', wie: 't1', naar: [35.4, 10.6], start: 0.2 }),
        stap({ type: 'pass', van: 'k2', naar: [35.6, 9.4], worp: 'voet' }, { type: 'loop', wie: 'k1', naar: [35.2, 1.9], manier: 'voetenwerk', start: 0.4 }),
        stap({ type: 'loop', wie: 't1', naar: [35.6, 9.8], duur: 0.5 }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [36.8, 1.6] }),
        pauze(0.5),
        op(),
        terugGooi('k1', 't1'),
        pauze(0.5),
      ],
    },
  },
];

zet('keepers', oefeningen);
