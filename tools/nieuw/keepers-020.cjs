// Nieuwe keeperoefeningen (0.20.0). Draaien: node tools/nieuw/keepers-020.cjs — zet of vervangt ze (op id) in
// src/data/oefeningen/keepers/<eerste categorie>.json. Daarna npm test en tools/e2e/oefeningen.mjs.
const { zet } = require('./hulp.cjs');

const goal = { id: 'g1', soort: 'goal', x: 34, y: 0 };
const keeper = (id, nr, x, y, extra = {}) => ({ id, soort: 'keeper', nummer: nr, x, y, ...extra });
const trainer = (x, y, kijk = -90) => ({ id: 't1', soort: 'trainer', x, y, kijkrichting: kijk });
const bal = (id, x, y, bij) => ({ id, soort: 'bal', x, y, ...(bij ? { bij } : {}) });
const pauze = (duur) => ({ duur, acties: [] });
const stap = (...acties) => ({ acties });
const KLEUR = { rood: '#e03131', blauw: '#1c64d8', geel: '#ffd23f', wit: '#ffffff' };

const oefeningen = [
  // 1. Hordes zijwaarts en hoge duik
  {
    id: 'keeper-hd-hordes-zijwaarts',
    naam: 'Hordes zijwaarts en hoge duik',
    categorieen: ['hoog-duiken'],
    uitleg:
      'De keeper springt zijwaarts over drie lage hordes naast het doel, met zijn gezicht naar het veld. Na de laatste horde maakt hij nog een pasje en duikt hij door naar dezelfde kant, naar een hoog schot van de trainer. Vangen, opstaan, bal terug en de volgende serie naar de andere kant.',
    organisatie: 'Drie hordes van 30 cm op een rij naast het doel, 1 m uit elkaar, 2 m voor de doellijn. Trainer met ballen op 9–10 m. Om de beurt de andere kant op.',
    benodigdheden: ['Goal', '3 lage hordes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Zijwaarts over de hordes: kort grondcontact, knieën hoog, schouders naar het veld', 'Na de laatste horde direct in basishouding: klaar om af te zetten', 'Afzetten met het been aan de balkant, handen voor de bal'],
    variaties: {
      makkelijker: ['Eén of twee hordes', 'Halfhoge bal in plaats van hoog'],
      moeilijker: ['Hogere hordes', 'Trainer kiest pas na de laatste horde de hoek', 'Na de hoge duik nog een lage bal in de andere hoek'],
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 23, y: -3, breedte: 20, lengte: 15 },
      camera: 'schuin',
      objecten: [
        goal,
        { id: 'h1', soort: 'horde', x: 28.2, y: 2.2, hoek: 90, hoogte: 0.3 },
        { id: 'h2', soort: 'horde', x: 29.2, y: 2.2, hoek: 90, hoogte: 0.3 },
        { id: 'h3', soort: 'horde', x: 30.2, y: 2.2, hoek: 90, hoogte: 0.3 },
        keeper('k1', 1, 26.9, 2.2, { kijkrichting: 90 }),
        trainer(34.6, 9.6),
        bal('b1', 34.6, 9.2, 't1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'loop', wie: 'k1', naar: [31.4, 2.2], manier: 'hordes', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', naar: [32.8, 1.9], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 2.4, duikNaar: [36.2, 1.8], duikHoogte: 1.6 }),
        pauze(0.8),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
        pauze(0.6),
      ],
    },
  },

  // 2. Vier kleuren en bal verwerken
  {
    id: 'keeper-bv-vier-kleuren',
    naam: 'Vier kleuren en bal verwerken',
    categorieen: ['bal-verwerken', 'reactie'],
    uitleg:
      'Vier gekleurde hoedjes liggen rond de keeper. De trainer roept een kleur; de keeper tikt dat hoedje aan, komt terug in basishouding en verwerkt meteen een bal van de trainer: laag, op borsthoogte of hoog. Bal terug en direct de volgende kleur. Een paar keer achter elkaar, dan wisselen.',
    organisatie: 'Vier hoedjes (rood, blauw, geel, wit) op 2 m links, rechts, voor en achter het midden van het vak, 3 m voor het doel. Trainer met ballen op 7 m.',
    benodigdheden: ['Goal', '4 gekleurde hoedjes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Na het aantikken eerst stilstaan in basishouding, dan pas de bal', 'Kleine snelle pasjes, niet kruisen', 'Laag schepvangen, borsthoogte kommetje, hoog met de duimen achter de bal'],
    variaties: { makkelijker: ['Trainer wijst de kleur ook aan', 'Alleen ballen op borsthoogte'], moeilijker: ['Twee kleuren achter elkaar roepen', 'Bal komt al terwijl de keeper nog terugloopt', 'Na de bal een korte lage duik'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 26, y: -3, breedte: 16, lengte: 14 },
      camera: 'schuin',
      objecten: [
        goal,
        { id: 'hR', soort: 'hoedje', x: 32, y: 3.4, kleur: KLEUR.rood },
        { id: 'hB', soort: 'hoedje', x: 36, y: 3.4, kleur: KLEUR.blauw },
        { id: 'hG', soort: 'hoedje', x: 34, y: 5.4, kleur: KLEUR.geel },
        { id: 'hW', soort: 'hoedje', x: 34, y: 1.4, kleur: KLEUR.wit },
        keeper('k1', 1, 34, 3.4, { kijkrichting: 90 }),
        trainer(34.8, 10.4),
        bal('b1', 34.8, 10, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [32.65, 3.4], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 3.4], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', hoogte: 'grond' }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 4.75], manier: 'voetenwerk' }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 3.4], manier: 'achteruit' }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1.6, eindHoogte: 1.2 }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
        stap({ type: 'loop', wie: 'k1', naar: [35.35, 3.4], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 3.4], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 2.8, eindHoogte: 2.2 }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
        pauze(0.6),
      ],
    },
  },

  // 3. Vier kleuren en bal voor de stuit
  {
    id: 'keeper-re-kleuren-voor-de-stuit',
    naam: 'Vier kleuren en bal voor de stuit',
    categorieen: ['reactie'],
    uitleg:
      'Zelfde vak met vier gekleurde hoedjes. De keeper tikt de kleuren aan die de trainer roept. Op een onverwacht moment gooit de trainer een bal in het vak; de keeper moet hem pakken voordat hij de grond raakt, desnoods met een duik.',
    organisatie: 'Vier hoedjes op 2 m rond het midden van het vak, 3 m voor het doel. Trainer met ballen op 6–7 m.',
    benodigdheden: ['Goal', '4 gekleurde hoedjes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Blijf tijdens het aantikken naar de trainer kijken', 'Lage zwaartepunt: zo kun je meteen afzetten', 'Liever de bal klemmen met een duik dan hem laten stuiten'],
    variaties: { makkelijker: ['Bal hoger gooien (meer tijd)', 'Trainer roept "nu" vlak voor de worp'], moeilijker: ['Bal mag pas na de tweede kleur komen', 'Worp verder buiten het vak'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 26, y: -3, breedte: 16, lengte: 14 },
      camera: 'schuin',
      objecten: [
        goal,
        { id: 'hR', soort: 'hoedje', x: 32, y: 3.4, kleur: KLEUR.rood },
        { id: 'hB', soort: 'hoedje', x: 36, y: 3.4, kleur: KLEUR.blauw },
        { id: 'hG', soort: 'hoedje', x: 34, y: 5.4, kleur: KLEUR.geel },
        { id: 'hW', soort: 'hoedje', x: 34, y: 1.4, kleur: KLEUR.wit },
        keeper('k1', 1, 34, 3.4, { kijkrichting: 90 }),
        trainer(34.6, 9.6),
        bal('b1', 34.6, 9.2, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [32.65, 3.4], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 3.4], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 2.05], manier: 'achteruit' }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 3.2], manier: 'voetenwerk', duur: 0.5 }, { type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 2.2, eindHoogte: 0.35, duikNaar: [36.1, 4.4], start: 0.2 }),
        pauze(0.6),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
        pauze(0.6),
      ],
    },
  },

  // 4. Pass naast het doel en kort schot
  {
    id: 'keeper-re-pass-naast-doel',
    naam: 'Pass naast het doel en kort schot',
    categorieen: ['reactie'],
    uitleg:
      'Een aangever staat naast het doel en speelt de bal in op de trainer, die op ongeveer 5 m voor het doel staat. De trainer schiet direct, kort bij de keeper: laag, op het lichaam of halfhoog. De keeper moet snel reageren. Na een paar ballen wisselen: de aangever gaat in het doel, de keeper wordt aangever.',
    organisatie: 'Aangever (keeper 2) naast de paal op de doellijn, trainer op 5 m voor het doel, keeper 1 in het doel. Ballen bij de aangever. Met genoeg keepers mogen alle rollen keepers zijn; om de paar ballen schuift iedereen door.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Kijk niet naar de aangever maar naar de trainer: daar komt het schot vandaan', 'Klein en compact staan, handen voor het lichaam', 'Op het moment van het schot stilstaan (gezet), dan reageren'],
    variaties: { makkelijker: ['Trainer op 7 m', 'Trainer neemt de bal eerst aan'], moeilijker: ['Trainer op 4 m', 'Aangever kiest: op de trainer of zelf direct op doel', 'Na de redding nog een rebound van de trainer'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 25, y: -3, breedte: 20, lengte: 14 },
      camera: 'schuin',
      objecten: [goal, keeper('k1', 1, 34, 1.6, { kijkrichting: 90 }), keeper('k2', 2, 40.6, 0.6, { kijkrichting: 150 }), trainer(34.4, 6.8), bal('b1', 40.3, 0.8, 'k2'), bal('b2', 41.4, 0.2), bal('b3', 41.6, 1.2)],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'k2', naar: 't1', worp: 'trap' }),
        stap({ type: 'schot', van: 't1', naar: 'k1', direct: true, hoogte: 'grond', duikNaar: [32.3, 1.9] }),
        pauze(0.5),
        stap({ type: 'opstaan', wie: 'k1' }, { type: 'pak', wie: 'k2', start: 0.2 }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.6], duur: 0.6 }, { type: 'pass', van: 'k1', naar: [38.8, 3.6], worp: 'onderhands', start: 0.7 }),
        stap({ type: 'pass', van: 'k2', naar: 't1', worp: 'trap' }),
        stap({ type: 'schot', van: 't1', naar: 'k1', direct: true, hoogte: 1.4, eindHoogte: 1.2 }),
        pauze(0.6),
        // Doorwisselen: de aangever gaat in het doel, de keeper wordt aangever.
        stap({ type: 'pass', van: 'k1', naar: [39.6, 3.2], worp: 'onderhands' }),
        stap({ type: 'loop', wie: 'k2', via: [[37.6, 0.4]], naar: [34, 1.6] }, { type: 'loop', wie: 'k1', via: [[36.8, 4.6], [39.6, 3.4]], naar: [40.6, 0.6], start: 0.3 }),
        pauze(0.8),
      ],
    },
  },

  // 5. Bal van achter de keeper
  {
    id: 'keeper-re-bal-van-achter',
    naam: 'Bal van achter de keeper',
    categorieen: ['reactie'],
    uitleg:
      'De keeper staat in het doel met zijn gezicht naar het veld. Een aangever staat achter hem op de doellijn en speelt of gooit de bal over (of onder) de keeper door naar een schutter op 5 m. Die schiet meteen van dichtbij. De keeper ziet de bal pas laat en moet snel reageren.',
    organisatie: 'Keeper 1 op 1,5–2 m voor de doellijn, aangever (keeper 2) achter hem op de doellijn, trainer als schutter op 5 m. Ballen bij de aangever. Na een paar ballen doorwisselen.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Niet omkijken naar de aangever: kijk naar de schutter', 'Zodra je de bal ziet: snel gezet staan, gewicht op de voorvoet', 'Klein maken en het lichaam achter de bal'],
    variaties: { makkelijker: ['Schutter neemt de bal eerst aan', 'Schutter op 7 m'], moeilijker: ['Aangever kiest over of onder de keeper door', 'Twee schutters: de aangever kiest welke'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 26, y: -3, breedte: 16, lengte: 13 },
      camera: 'schuin',
      objecten: [goal, keeper('k1', 1, 34, 2.2, { kijkrichting: 90 }), keeper('k2', 2, 35.4, 0.2, { kijkrichting: 90 }), trainer(34.6, 7.4), bal('b1', 35.4, 0.6, 'k2'), bal('b2', 36.6, 0.3)],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'k2', naar: 't1', worp: 'onderhands', hoogte: 'hoog' }),
        stap({ type: 'schot', van: 't1', naar: 'k1', direct: true, hoogte: 'grond', duikNaar: [35.9, 2.3] }),
        pauze(0.5),
        stap({ type: 'opstaan', wie: 'k1' }, { type: 'pak', wie: 'k2', start: 0.2 }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 2.2], duur: 0.6 }),
        stap({ type: 'pass', van: 'k2', naar: 't1', worp: 'bovenhands', hoogte: 'hoog' }),
        stap({ type: 'schot', van: 't1', naar: 'k1', direct: true, hoogte: 1.6, duikNaar: [32.1, 2.1], duikHoogte: 1.1 }),
        pauze(0.6),
        stap({ type: 'opstaan', wie: 'k1' }),
        // Doorwisselen.
        stap({ type: 'loop', wie: 'k2', via: [[37.4, 1.2]], naar: [34, 2.2] }, { type: 'loop', wie: 'k1', via: [[31.6, 1.6]], naar: [33.4, 0.2], start: 0.3 }),
        pauze(0.8),
      ],
    },
  },

  // 6. Midden, voorzet en schot andere kant
  {
    id: 'keeper-bv-midden-voorzet-schot',
    naam: 'Midden, voorzet en schot andere kant',
    categorieen: ['bal-verwerken', 'voorzetten', 'hoog-duiken'],
    uitleg:
      'Eerst gooit de trainer een bal recht op het lichaam van de keeper in het midden. Daarna verschuift de keeper naar de eerste paal voor een lage voorzet van keeper 2 vanaf de zijkant. Opstaan, en meteen schiet de trainer in de andere hoek, hoog of laag. Daarna wisselen de keepers.',
    organisatie: 'Trainer met ballen op 10 m recht voor het doel, keeper 2 met ballen op de rand van de zestien aan de zijkant (± 12 m van de paal). Minimaal 2 keepers.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Bal op het lichaam: achter de bal, kommetje of borstvang', 'Bij de voorzet vóór de eerste paal staan en de bal aanvallen', 'Snel opstaan en opnieuw gezet staan vóór het schot'],
    variaties: { makkelijker: ['Voorzet gooien in plaats van trappen', 'Schot laag'], moeilijker: ['Trainer kiest zelf hoog of laag', 'Voorzet halfhoog', 'Na het schot nog een rebound'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 24, y: -3, breedte: 26, lengte: 17 },
      camera: 'schuin',
      objecten: [goal, keeper('k1', 1, 34, 1.6, { kijkrichting: 90 }), keeper('k2', 2, 46, 8, { kijkrichting: -150 }), trainer(34.4, 10.2), bal('b1', 34.4, 9.8, 't1'), bal('b2', 45.7, 7.8, 'k2'), bal('b3', 35.6, 10.6)],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1.6, eindHoogte: 1.2 }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
        stap({ type: 'loop', wie: 'k1', naar: [37.2, 1.8], manier: 'zijwaarts', kijk: 70 }),
        stap({ type: 'pass', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 'grond', duikNaar: [38.4, 2.4] }),
        pauze(0.4),
        stap({ type: 'opstaan', wie: 'k1' }, { type: 'pak', wie: 't1' }),
        stap({ type: 'loop', wie: 'k1', naar: [34.4, 1.7], duur: 0.7 }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 2.6, duikNaar: [31.5, 1.8], duikHoogte: 1.6 }),
        pauze(0.6),
        stap({ type: 'opstaan', wie: 'k1' }),
        // Doorwisselen.
        stap({ type: 'loop', wie: 'k2', via: [[41, 3.4]], naar: [34, 1.6] }, { type: 'loop', wie: 'k1', via: [[33, 6.6], [40, 10.6]], naar: [46, 8], start: 0.6 }),
        pauze(0.8),
      ],
    },
  },
];

const deel2 = [
  // 7. Inspelen, draaien of kaatsen
  {
    id: 'keeper-1o1-inspelen-draaien-kaatsen',
    naam: 'Inspelen, draaien of kaatsen',
    categorieen: ['een-op-een', 'reactie'],
    uitleg:
      'Keeper 2 staat met de bal schuin voor het doel op ongeveer 15 m en speelt een middenman in die schuin op 5 m staat. De middenman kiest: hij draait en gaat 1 tegen 1 op de keeper af, of hij kaatst terug en de inspeler werkt direct af. De keeper weet niet wat er komt. Na een aantal ballen wisselen de keepers door.',
    organisatie: 'Keeper 1 in het doel, keeper 2 met ballen op ± 15 m schuin voor het doel, middenman (trainer of keeper) op ± 5 m schuin voor het doel. Minimaal 2 keepers en een trainer.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Bij de pass op de middenman al een stap naar voren: klaar voor beide', 'Draait hij: snel uitkomen, laag en breed blokken', 'Kaatst hij: terug, gezet staan voor het schot van verder weg'],
    variaties: { makkelijker: ['Middenman roept wat hij doet', 'Alleen kaatsen'], moeilijker: ['Middenman mag ook zelf direct schieten', 'Een verdediger bij de middenman'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 25, y: -3, breedte: 24, lengte: 20 },
      camera: 'schuin',
      objecten: [goal, keeper('k1', 1, 34.4, 1.6, { kijkrichting: 90, uitkomen: true }), keeper('k2', 2, 43, 13.5, { kijkrichting: -130 }), trainer(38.2, 5.6, -150), bal('b1', 42.8, 13.1, 'k2'), bal('b2', 44.2, 14.2)],
      animatie: [
        pauze(0.5),
        // Optie 1: draaien en 1 tegen 1.
        stap({ type: 'pass', van: 'k2', naar: 't1' }, { type: 'loop', wie: 'k1', naar: [35.4, 2.4], manier: 'voetenwerk', start: 0.3, duur: 0.6 }),
        stap({ type: 'dribbel', wie: 't1', naar: [36.4, 5.2], duur: 0.9 }, { type: 'loop', wie: 'k1', naar: [35.4, 3.4], manier: 'voetenwerk', start: 0.2, duur: 0.6 }),
        stap({ type: 'schot', van: 't1', naar: [33.6, 0], hoogte: 'grond', blokt: 'k1', blokSoort: 'ster', afloopNaar: [31.2, 6.8] }),
        pauze(0.7),
        stap({ type: 'loop', wie: 'k1', naar: [34.4, 1.6], manier: 'achteruit' }, { type: 'loop', wie: 't1', naar: [38.2, 5.6], start: 0.2 }, { type: 'pak', wie: 'k2', start: 0.4 }),
        // Optie 2: kaatsen, de inspeler schiet direct.
        stap({ type: 'pass', van: 'k2', naar: 't1' }, { type: 'loop', wie: 'k2', naar: [41.2, 11.2], start: 0.5, duur: 0.9 }),
        stap({ type: 'pass', van: 't1', naar: 'k2', direct: true }),
        stap({ type: 'schot', van: 'k2', naar: 'k1', direct: true, hoogte: 'grond', duikNaar: [32.2, 1.9] }),
        pauze(0.6),
        stap({ type: 'opstaan', wie: 'k1' }),
        // Doorwisselen: de inspeler gaat in het doel.
        stap({ type: 'loop', wie: 'k2', via: [[37, 8]], naar: [34.4, 1.6] }, { type: 'loop', wie: 'k1', via: [[30.6, 6.6]], naar: [43, 13.5], start: 0.4 }),
        pauze(0.8),
      ],
    },
  },

  // 8. Vijf keuzes van de keeperstrainer
  {
    id: 'keeper-1o1-vijf-keuzes',
    naam: 'Vijf keuzes van de keeperstrainer',
    categorieen: ['een-op-een', 'bal-verwerken', 'hoog-duiken', 'laag-duiken', 'reactie'],
    uitleg:
      'De trainer staat met ballen op het midden van de zestien, links en rechts van hem staat een keeper op 5 à 10 m. De trainer kiest steeds: zelf schieten, de linker of rechter keeper in de voeten aanspelen (die neemt aan en schiet), of een bal in de diepte links of rechts waarop een keeper doorloopt; dan komt de keeper uit voor een 1 tegen 1. Na een paar ballen schuiven de keepers door.',
    organisatie: 'Trainer met ballen op 16 m, keeper 2 en 3 op 7 m links en rechts naast hem, keeper 1 in het doel. Minimaal 3 keepers en een trainer.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Positie steeds op de lijn tussen bal en het midden van het doel', 'Bij elke balcontact van de trainer gezet staan', 'Diepe bal: vroeg beslissen en uitkomen, laag blokken of plukken'],
    variaties: { makkelijker: ['Maar drie keuzes (schieten, links, rechts)', 'Trainer zegt de keuze vooraf'], moeilijker: ['Keepers links en rechts mogen ook direct schieten', 'Twee keuzes kort na elkaar'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 21, y: -3, breedte: 26, lengte: 22 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.6, { kijkrichting: 90, uitkomen: true }),
        keeper('k2', 2, 27, 16.5, { kijkrichting: -60 }),
        keeper('k3', 3, 41, 16.5, { kijkrichting: -120 }),
        trainer(34, 16.8),
        bal('b1', 34, 16.4, 't1'),
        bal('b2', 35.1, 17.4),
        bal('b3', 33, 17.5),
      ],
      animatie: [
        pauze(0.5),
        // Keuze 1: zelf schieten (laag).
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [32, 1.9] }),
        pauze(0.4),
        stap({ type: 'opstaan', wie: 'k1' }, { type: 'pak', wie: 't1' }),
        stap({ type: 'loop', wie: 'k1', naar: [33.2, 2], duur: 0.6 }, { type: 'pass', van: 'k1', naar: [36, 12], worp: 'onderhands', start: 0.7 }),
        // Keuze 2: links in de voeten, keeper 2 schiet (hoog).
        stap({ type: 'pass', van: 't1', naar: 'k2' }),
        stap({ type: 'schot', van: 'k2', naar: 'k1', hoogte: 2.4, duikNaar: [36.3, 1.8], duikHoogte: 1.6 }),
        pauze(0.5),
        stap({ type: 'opstaan', wie: 'k1' }, { type: 'pak', wie: 't1' }),
        stap({ type: 'loop', wie: 'k1', naar: [34.4, 1.8], duur: 0.6 }),
        // Keuze 3: diepe bal rechts, keeper 3 loopt door, 1 tegen 1.
        stap({ type: 'pass', van: 't1', naar: [39.6, 9.2] }, { type: 'loop', wie: 'k3', naar: [39.4, 10.2], manier: 'sprint', start: 0.2 }, { type: 'loop', wie: 'k1', naar: [36.4, 4.6], manier: 'sprint', start: 0.5 }),
        stap({ type: 'schot', van: 'k3', naar: [35.6, 0], hoogte: 'grond', blokt: 'k1', blokSoort: 'knie', afloopNaar: [42.4, 7.2] }),
        pauze(0.8),
        // Doorwisselen: 1 → links, 2 → rechts, 3 → doel.
        stap(
          { type: 'loop', wie: 'k3', via: [[37.2, 5]], naar: [34, 1.6] },
          { type: 'loop', wie: 'k1', via: [[30, 8]], naar: [27, 16.5], start: 0.3 },
          { type: 'loop', wie: 'k2', via: [[33.4, 21]], naar: [41, 16.5], start: 0.1 },
        ),
        pauze(0.8),
      ],
    },
  },
];

const deel3 = [
  // 9. Zijwaartse ladder en dubbele duik
  {
    id: 'keeper-ld-ladder-dubbele-duik',
    naam: 'Zijwaartse ladder en dubbele duik',
    categorieen: ['laag-duiken', 'hoog-duiken'],
    uitleg:
      'De keeper gaat zijwaarts door een loopladder voor het doel, terug in het doel, en duikt naar een lage bal die de trainer links van hem gooit. Opstaan, en meteen een hoge bal van keeper 2 aan de rechterkant. Daarna wisselen de keepers.',
    organisatie: 'Loopladder dwars voor het doel op 4,5 m. Trainer met ballen op 10 m links voor het doel, keeper 2 met ballen op 10 m rechts. Minimaal 2 keepers.',
    benodigdheden: ['Goal', 'Loopladder', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Ladder: kleine snelle pasjes, schouders naar het veld', 'Terug in het doel eerst gezet staan, dan pas de bal', 'Lage duik schuin naar voren; hoge duik: afzetten met het been aan de balkant'],
    variaties: { makkelijker: ['Zonder ladder', 'Beide ballen laag'], moeilijker: ['Ladder met twee voeten per vak (in-in-uit-uit)', 'Trainer en keeper 2 kiezen zelf de volgorde'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 25, y: -3, breedte: 18, lengte: 15.5 },
      camera: 'schuin',
      objecten: [
        goal,
        { id: 'l1', soort: 'ladder', x: 34, y: 4.6, hoek: 90, breedte: 0.5, lengte: 4 },
        keeper('k1', 1, 31.4, 4.6, { kijkrichting: 90 }),
        keeper('k2', 2, 37.6, 10.2, { kijkrichting: -105 }),
        trainer(30.8, 10.2, -75),
        bal('b1', 30.9, 9.8, 't1'),
        bal('b2', 37.5, 9.8, 'k2'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'loop', wie: 'k1', naar: [36.6, 4.6], manier: 'voetenwerk', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', via: [[37.2, 2.6]], naar: [34, 1.6] }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'laag', duikNaar: [31.9, 1.9] }),
        pauze(0.4),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.6], duur: 0.6 }, { type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands', hoogte: 1.6, start: 0.7 }),
        stap({ type: 'pass', van: 'k2', naar: 'k1', worp: 'bovenhands', hoogte: 2.8, duikNaar: [36.2, 1.8], duikHoogte: 1.6 }),
        pauze(0.6),
        stap({ type: 'opstaan', wie: 'k1' }),
        // Doorwisselen: keeper 2 in het doel (links om de ladder), keeper 1 naar de plek van keeper 2 (rechts om).
        stap({ type: 'loop', wie: 'k2', via: [[30.4, 7], [30.4, 3]], naar: [34, 1.6] }, { type: 'loop', wie: 'k1', via: [[38.8, 3], [39.2, 7.8]], naar: [37.6, 10.2], start: 0.2 }),
        pauze(0.8),
      ],
    },
  },

  // 10. Terugspeelbal en hoge bal claimen
  {
    id: 'keeper-ps-terugspeelbal-hoge-bal',
    naam: 'Terugspeelbal en hoge bal claimen',
    categorieen: ['passing', 'voorzetten'],
    uitleg:
      'De trainer speelt een terugspeelbal op de keeper. De keeper neemt aan en speelt de bal door een poortje op de flank. Direct daarna gooit de trainer een hoge bal voor het doel; de keeper komt uit en pakt hem op het hoogste punt.',
    organisatie: 'Poortje van twee pionnen (3 m breed) op de flank op 18 m van het doel. Trainer met twee ballen op 14 m schuin voor het doel.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Aannemen met de voet die van de trainer af wijst, open draaien', 'Doorspelen met de binnenkant: hard en vlak door het poortje', 'Na de pass meteen terug in positie, de hoge bal op het hoogste punt pakken (knie omhoog)'],
    variaties: { makkelijker: ['Breder poortje', 'Hoge bal pas na een tel'], moeilijker: ['Terugspeelbal met druk van een aanvaller', 'Doorspelen met het zwakke been', 'Hoge bal met een tegenstander die meespringt'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 26, y: -3, breedte: 34, lengte: 20 },
      camera: 'schuin',
      objecten: [
        goal,
        { id: 'p1', soort: 'pion', x: 52, y: 9.1 },
        { id: 'p2', soort: 'pion', x: 52, y: 12.1 },
        keeper('k1', 1, 34, 1.8, { kijkrichting: 90, verdedigt: 'g1', uitkomen: true }),
        trainer(38.4, 14, -110),
        bal('b1', 38.3, 13.6, 't1'),
        bal('b2', 39.4, 14.5),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: [57.6, 12.9], worp: 'voet' }),
        stap({ type: 'pak', wie: 't1' }),
        stap({ type: 'pass', van: 't1', naar: [35.2, 6.2], worp: 'bovenhands', hoogte: 'hoog', uitkomen: 'k1' }),
        pauze(0.6),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
        pauze(0.8),
      ],
    },
  },

  // 11. Drie schutters met nummers
  {
    id: 'keeper-re-drie-schutters-nummers',
    naam: 'Drie schutters met nummers',
    categorieen: ['reactie', 'bal-verwerken', 'laag-duiken', 'hoog-duiken'],
    uitleg:
      'Drie aangevers met een nummer staan op een boog voor het doel. De trainer roept een nummer en die aangever schiet direct. De keeper moet steeds snel opnieuw positie kiezen: op de lijn tussen de bal en het midden van het doel, en gezet staan voordat het schot komt.',
    organisatie: 'Drie aangevers (spelers of keepers) met ballen op een boog van ± 11 m: links, midden en rechts. Trainer naast het doel. De aangevers mogen ook keepers of de trainer zijn.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 3,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Bij elk nummer met kleine pasjes naar de goede positie', 'Gezet staan op het moment van het schot', 'Lage bal: schuin naar voren duiken; hoge bal: afzetten en de bal in de handen'],
    variaties: { makkelijker: ['Aangevers gooien in plaats van schieten', 'Trainer roept het nummer eerder'], moeilijker: ['Twee nummers achter elkaar', 'Aangevers verplaatsen na elk schot'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 23, y: -3, breedte: 22, lengte: 17 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper('k1', 1, 34, 2, { kijkrichting: 90 }),
        { id: 'a1', soort: 'speler', team: 'A', nummer: 1, x: 26.6, y: 8.2, kijkrichting: -40 },
        { id: 'a2', soort: 'speler', team: 'A', nummer: 2, x: 34, y: 11.4, kijkrichting: -90 },
        { id: 'a3', soort: 'speler', team: 'A', nummer: 3, x: 41.4, y: 8.2, kijkrichting: -140 },
        trainer(43.4, 1.2, 160),
        bal('b1', 26.9, 7.9, 'a1'),
        bal('b2', 34, 11, 'a2'),
        bal('b3', 41.1, 7.9, 'a3'),
      ],
      animatie: [
        pauze(0.6),
        // "Drie!"
        stap({ type: 'loop', wie: 'k1', naar: [35.1, 1.9], manier: 'zijwaarts', kijk: 105, duur: 0.6 }),
        stap({ type: 'schot', van: 'a3', naar: 'k1', hoogte: 'grond', duikNaar: [36.7, 2.1] }),
        pauze(0.4),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 'a3', worp: 'onderhands' }),
        // "Eén!"
        stap({ type: 'loop', wie: 'k1', naar: [32.9, 1.9], manier: 'zijwaarts', kijk: 75, duur: 0.8 }),
        stap({ type: 'schot', van: 'a1', naar: 'k1', hoogte: 2.2, duikNaar: [31.4, 1.9], duikHoogte: 1.4 }),
        pauze(0.4),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 'a1', worp: 'onderhands' }),
        // "Twee!"
        stap({ type: 'loop', wie: 'k1', naar: [34, 2.1], manier: 'zijwaarts', kijk: 90, duur: 0.6 }),
        stap({ type: 'schot', van: 'a2', naar: 'k1', hoogte: 1.2, eindHoogte: 1 }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 'a2', worp: 'onderhands' }),
        pauze(0.6),
      ],
    },
  },

  // 12. Voorzet claimen, uitgooien en terug
  {
    id: 'keeper-vz-claimen-uitgooien-terug',
    naam: 'Voorzet claimen, uitgooien en terug',
    categorieen: ['voorzetten', 'passing', 'bal-verwerken', 'laag-duiken'],
    uitleg:
      'Keeper 2 geeft een hoge voorzet vanaf de flank. De keeper komt uit, vangt de bal op het hoogste punt en gooit hem meteen uit in een zone op de andere flank. Daarna achteruit terug in het doel, waar de trainer een laag schot geeft. Daarna wisselen de keepers.',
    organisatie: 'Keeper 2 met ballen op de flank (± 18 m van het doel), zone van 8 × 8 m op de andere flank op ± 25 m, trainer met ballen op 14 m voor het doel. Minimaal 2 keepers.',
    benodigdheden: ['Goal', '4 pionnen (zone)', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Op tijd starten en de bal op het hoogste punt pakken', 'Na het vangen meteen kijken: snel uitgooien (zwaaiworp) de zone in', 'Achteruit terug met de schouders naar het veld; gezet staan voor het schot'],
    variaties: { makkelijker: ['Voorzet gooien in plaats van trappen', 'Zone dichterbij'], moeilijker: ['Een tegenstander springt mee bij de voorzet', 'Twee zones: de trainer roept welke', 'Schot direct als de keeper nog terugloopt'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 12, y: -3, breedte: 44, lengte: 31 },
      camera: 'schuin',
      objecten: [
        goal,
        { id: 'z1', soort: 'zone', x: 16, y: 24, breedte: 8, lengte: 8, kleur: '#3fa9f5' },
        keeper('k1', 1, 34, 1.6, { kijkrichting: 90, verdedigt: 'g1', uitkomen: true }),
        keeper('k2', 2, 51, 9, { kijkrichting: -170 }),
        trainer(35.6, 14, -100),
        bal('b1', 50.6, 9, 'k2'),
        bal('b2', 35.5, 13.6, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'k2', naar: [35.4, 5.8], worp: 'trap', hoogte: 'hoog', uitkomen: 'k1' }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: [16.6, 23.4], worp: 'zwaai', hoogte: 'halfhoog' }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.6], manier: 'achteruit' }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [31.9, 1.9] }),
        pauze(0.6),
        stap({ type: 'opstaan', wie: 'k1' }),
        // Doorwisselen.
        stap({ type: 'loop', wie: 'k2', via: [[42, 3.2]], naar: [34, 1.6] }, { type: 'loop', wie: 'k1', via: [[36, 6.8], [44, 11.6]], naar: [51, 9], start: 0.5 }),
        pauze(0.8),
      ],
    },
  },
];

// 13. Grondoefeningen voor de warming-up: de keeper zit op zijn billen.
const grond = (id, naam, houding, uitleg, coach, variaties, worpen) => ({
  id,
  naam,
  categorieen: ['warming-up'],
  uitleg,
  organisatie: 'Keeper zit op zijn billen op het gras, de trainer (of een andere keeper) staat met een bal op 3–4 m. Na 6–8 ballen wisselen of de volgende vorm.',
  benodigdheden: ['1 bal per tweetal'],
  spelersNodig: 0,
  keepersNodig: 1,
  doorwisselbaar: true,
  coachpunten: coach,
  variaties,
  tekening: {
    veld: { type: 'leeg', breedte: 10, lengte: 9 },
    camera: 'schuin',
    objecten: [keeper('k1', 1, 5, 2.8, { kijkrichting: 90, houding }), trainer(5, 6.6, -90), bal('b1', 5, 6.2, 't1')],
    animatie: [
      pauze(0.6),
      ...worpen.flatMap((w) => [
        pauze(w.wacht ?? 0.4),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: w.worp ?? 'onderhands', hoogte: w.hoogte, eindHoogte: w.eind }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands', hoogte: 0.9 }),
      ]),
      pauze(0.6),
    ],
  },
});

const deel4 = [
  grond(
    'keeper-wu-zit-tikken-vangen',
    'Zittend: grond tikken en vangen',
    'zit',
    'De keeper zit op zijn billen met de benen gestrekt. Voor elke bal tikt hij met beide handen achter zich de grond aan en komt hij snel terug; de trainer gooit en de keeper vangt op borsthoogte en gooit terug.',
    ['Na het tikken meteen de handen voor het lichaam (W-vorm)', 'Vangen met de vingers, de bal naar de borst trekken', 'Rug recht, buikspieren aan'],
    { makkelijker: ['Zonder grond tikken', 'Zachter en dichterbij'], moeilijker: ['Bal net naast het lichaam', 'Trainer gooit al terwijl de keeper nog tikt'] },
    [{ hoogte: 1.3, eind: 0.75, wacht: 0.9 }, { hoogte: 1.3, eind: 0.75, wacht: 0.9 }, { hoogte: 1.3, eind: 0.75, wacht: 0.9 }],
  ),
  grond(
    'keeper-wu-zit-drie-hoogtes',
    'Zittend vangen op drie hoogtes',
    'zit',
    'De keeper zit met gestrekte benen. De trainer gooit om de beurt op borsthoogte, boven het hoofd en laag naast het lichaam. Vangen, klemmen en teruggooien.',
    ['Borsthoogte: kommetje of borstvang', 'Boven het hoofd: W-vorm met de duimen achter de bal, armen gestrekt', 'Laag: handen naar de bal, pinken tegen elkaar'],
    { makkelijker: ['Alleen borsthoogte en hoog', 'Trainer zegt de hoogte vooraf'], moeilijker: ['Harder en sneller achter elkaar', 'Na elke bal achterover rollen en terugkomen'] },
    [{ hoogte: 1.3, eind: 0.75 }, { hoogte: 2, eind: 1.35, worp: 'bovenhands' }, { hoogte: 0.5, eind: 0.2 }],
  ),
  grond(
    'keeper-wu-zit-knieen-opgetrokken',
    'Zittend met opgetrokken knieën',
    'zit-opgetrokken',
    'De keeper zit met de knieën opgetrokken en de voeten plat op de grond. De trainer gooit laag, op borsthoogte en hoog; de keeper vangt en gooit terug. Zo traint hij vangen met een stevige romp.',
    ['Voeten plat, knieën blijven omhoog', 'Bij de hoge bal niet achterover vallen: buikspieren aan', 'Vangen voor het lichaam, niet ernaast'],
    { makkelijker: ['Handen op de grond achter je tussen de ballen door', 'Alleen borsthoogte'], moeilijker: ['Voeten van de grond (balanceren op de billen)', 'Ballen links en rechts van het lichaam'] },
    [{ hoogte: 0.6, eind: 0.35 }, { hoogte: 1.3, eind: 0.8 }, { hoogte: 2, eind: 1.35, worp: 'bovenhands' }],
  ),
];

zet('keepers', [...oefeningen, ...deel2, ...deel3, ...deel4]);
