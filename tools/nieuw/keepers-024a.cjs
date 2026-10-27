// Keeperoefeningen 0.24.0, deel 1: voorzetten (C1–C7). Draaien: node tools/nieuw/keepers-024a.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, bal, pop, horde, pauze, stap, terug, keeperVeld } = require('./bouwstenen.cjs');

const terugGooi = (van, naar) => stap({ type: 'pass', van, naar, worp: 'onderhands', hoogte: 1.6 });
const op = (wie = 'k1') => stap({ type: 'opstaan', wie });
const naar = (x, y, manier = 'voetenwerk', extra = {}) => stap({ type: 'loop', wie: 'k1', naar: [x, y], manier, ...extra });
const voorzet = (van, punt, extra = {}) => stap({ type: 'pass', van, naar: punt, worp: 'bovenhands', hoogte: 'hoog', uitkomen: 'k1', ...extra });

const oefeningen = [
  // C1 Wegstompen en daarna de hoek dichtzetten
  {
    id: 'keeper-vz-stompen-hoek-dichtzetten',
    naam: 'Wegstompen en daarna de hoek dichtzetten',
    categorieen: ['voorzetten', 'een-op-een'],
    uitleg:
      'Vanaf links komt een hoge bal voor het doel. De keeper komt uit, stompt hem met twee vuisten weg en landt. Meteen daarna verkleint hij de hoek tegen een schutter die schuin voor het doel staat en verwerkt diens schot. Dan hetzelfde vanaf de andere kant.',
    organisatie:
      'Trainer met ballen links op de hoek van het doelgebied (± 10 m opzij), een keeper rechts als tweede voorzetter. Een derde keeper is schutter, schuin voor het doel op ± 9 m, en wisselt van kant.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: [
      'Stompen: twee vuisten tegen elkaar, ver en hoog weg, liefst naar de zijkant',
      'Na de landing meteen positie kiezen: op de lijn bal–midden van het doel',
      'Stilstaan op het moment van het schot',
    ],
    variaties: {
      makkelijker: ['Voorzet lager en zachter', 'Schutter wacht tot de keeper staat'],
      moeilijker: ['Schutter schiet direct na de landing', 'Een tegenstander springt mee bij de voorzet', 'Stompen met één vuist'],
    },
    tekening: {
      ...keeperVeld({ x: 20, y: -3, breedte: 28, lengte: 16 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.6),
        trainer(24.6, 6.4, -20),
        keeper('k3', 3, 43.4, 6.4, { kijkrichting: -160 }),
        keeper('k2', 2, 38.6, 9.2, { kijkrichting: -110 }),
        bal('b1', 24.95, 6.3, 't1'),
        bal('b3', 43.05, 6.3, 'k3'),
        bal('b2', 38.5, 8.85, 'k2'),
        bal('b4', 39.4, 9.7),
      ],
      animatie: [
        pauze(0.5),
        voorzet('t1', [34.6, 3.6], { stompNaar: [30.0, 13.0] }),
        pauze(0.3),
        naar(35.6, 2.6),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 1.0, eindHoogte: 0.8 }),
        pauze(0.3),
        terug('k1', 'k2'),
        stap({ type: 'loop', wie: 'k2', naar: [29.4, 9.2] }, { type: 'loop', wie: 'k1', naar: [34, 1.6], manier: 'voetenwerk', start: 0.3 }),
        voorzet('k3', [33.4, 3.6], { stompNaar: [38.4, 13.4] }),
        pauze(0.3),
        naar(32.4, 2.6),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 1.0, eindHoogte: 0.8 }),
        pauze(0.3),
        terug('k1', 'k2'),
        pauze(0.5),
      ],
    },
  },

  // C2 Hordes en hoge bal claimen
  {
    id: 'keeper-vz-hordes-hoge-bal-claimen',
    naam: 'Hordes en hoge bal claimen',
    categorieen: ['voorzetten', 'warming-up'],
    uitleg:
      'De keeper springt zijwaarts over twee lage hordes naar de linkerpaal en claimt daar een hoge bal van de trainer: afzetten op één been, de knie omhoog en de bal op het hoogste punt vangen. Bal terug, zijwaarts terug over de hordes naar de rechterpaal en daar hetzelfde.',
    organisatie: 'Twee lage hordes naast elkaar midden voor het doel, 2,2 m van de doellijn. Trainer met ballen op 9 m.',
    benodigdheden: ['Goal', '2 lage hordes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Over de hordes: kort grondcontact, gezicht naar het veld',
      'Claimen: afzetten op één been, de andere knie omhoog ter bescherming',
      'Vangen op het hoogste punt, bal meteen tegen de borst',
    ],
    variaties: { makkelijker: ['Zonder hordes', 'Bal lager gooien'], moeilijker: ['Drie hordes', 'Trainer kiest de kant pas tijdens de hordes', 'Een tegenstander springt mee'] },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 13 }),
      objecten: [goal, horde('h1', 33.4, 2.2, 90, 0.15), horde('h2', 34.6, 2.2, 90, 0.15), keeper('k1', 1, 35.9, 2.2, { kijkrichting: 90 }), trainer(34.4, 9.4), bal('b1', 34.4, 9.0, 't1')],
      animatie: [
        pauze(0.5),
        naar(32.1, 2.2, 'hordes', { kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 3.4, eindHoogte: 2.4 }),
        pauze(0.4),
        terugGooi('k1', 't1'),
        naar(35.9, 2.2, 'hordes', { kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 3.4, eindHoogte: 2.4 }),
        pauze(0.4),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // C3 Meelezen met de andere keeper
  {
    id: 'keeper-vz-meelezen-andere-keeper',
    naam: 'Meelezen met de andere keeper',
    categorieen: ['voorzetten', 'reactie'],
    uitleg:
      'Een tweede keeper springt met een bal in zijn handen zijwaarts over hordes voor het doel en kiest zelf een kant. De keeper in het doel leest mee en schuift mee, vangt de bal die de tweede keeper hem toegooit en rolt terug. Daarna komt er een hoge bal van de trainer vanaf de zijkant, die hij claimt.',
    organisatie: 'Drie lage hordes naast elkaar op 8 m van het doel. Trainer met ballen rechts op de zijkant van het doelgebied.',
    benodigdheden: ['Goal', '3 lage hordes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: [
      'Blijf op de lijn bal–midden van het doel terwijl de ander beweegt',
      'Kleine pasjes, op tijd stilstaan voor de worp',
      'Na het terugrollen meteen kijken waar de voorzet vandaan komt',
    ],
    variaties: {
      makkelijker: ['Twee hordes', 'Tweede keeper gooit pas als hij stilstaat'],
      moeilijker: ['Tweede keeper trapt in plaats van gooit', 'Voorzet direct na de worp', 'Tweede keeper mag ook terugspringen (schijnbeweging)'],
    },
    tekening: {
      ...keeperVeld({ x: 22, y: -3, breedte: 24, lengte: 15 }),
      objecten: [
        goal,
        horde('h1', 32.8, 8.4, 90, 0.15),
        horde('h2', 34.0, 8.4, 90, 0.15),
        horde('h3', 35.2, 8.4, 90, 0.15),
        keeper('k1', 1, 34, 1.6),
        keeper('k2', 2, 36.6, 8.4, { kijkrichting: -90 }),
        trainer(43.4, 5.8, -160),
        bal('b2', 36.6, 8.05, 'k2'),
        bal('b1', 43.05, 5.7, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k2', naar: [31.4, 8.4], manier: 'hordes', kijk: -90 }, { type: 'loop', wie: 'k1', naar: [33.0, 1.7], manier: 'zijwaarts', kijk: 90, start: 0.5 }),
        stap({ type: 'pass', van: 'k2', naar: 'k1', worp: 'onderhands', hoogte: 1.8, eindHoogte: 1.2 }),
        pauze(0.3),
        terugGooi('k1', 'k2'),
        naar(34, 1.8),
        voorzet('t1', [34.4, 3.8]),
        pauze(0.4),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // C4 Hoge bal claimen en de schutter horen
  {
    id: 'keeper-vz-claimen-schutter-horen',
    naam: 'Hoge bal claimen en de schutter horen',
    categorieen: ['voorzetten', 'reactie'],
    uitleg:
      'De keeper claimt een hoge bal van de trainer en gooit hem terug. Tijdens die worp roept de trainer wie er gaat schieten: hijzelf, keeper 2 of keeper 3. De keeper moet zich snel opnieuw neerzetten tegenover die schutter en het schot verwerken.',
    organisatie: 'Trainer links op de zijkant van het doelgebied, keeper 2 recht voor het doel op 12 m en keeper 3 schuin rechts op 9 m, elk met een bal.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Claimen op het hoogste punt, daarna rustig maar snel teruggooien', 'Luister tijdens je worp al naar de naam', 'Eerst positie, dan stilstaan, dan pas reageren'],
    variaties: {
      makkelijker: ['Trainer roept voor de voorzet al wie schiet', 'Schoten op het lichaam'],
      moeilijker: ['Schutter schiet direct na het roepen', 'Ook laag in de hoek', 'Vier schutters'],
    },
    tekening: {
      ...keeperVeld({ x: 20, y: -3, breedte: 28, lengte: 17 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.6),
        trainer(24.4, 6.0, -20),
        keeper('k2', 2, 34.4, 12.2, { kijkrichting: -90 }),
        keeper('k3', 3, 40.8, 9.0, { kijkrichting: -125 }),
        bal('b1', 24.75, 5.9, 't1'),
        bal('b2', 34.4, 11.85, 'k2'),
        bal('b3', 40.55, 8.7, 'k3'),
      ],
      animatie: [
        pauze(0.5),
        voorzet('t1', [33.4, 3.8]),
        pauze(0.3),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'bovenhands', hoogte: 2.4 }, { type: 'loop', wie: 'k1', naar: [35.2, 2.2], manier: 'voetenwerk', start: 0.9 }),
        stap({ type: 'schot', van: 'k3', naar: 'k1', worp: 'trap', hoogte: 'grond', duikNaar: [36.8, 1.8] }),
        pauze(0.5),
        op(),
        terug('k1', 'k3'),
        pauze(0.5),
      ],
    },
  },

  // C5 Voorzet, uitworp en doorspelen
  {
    id: 'keeper-vz-voorzet-uitworp-doorspelen',
    naam: 'Voorzet, uitworp en doorspelen',
    categorieen: ['voorzetten', 'passing'],
    uitleg:
      'Vanaf de rechterkant komt een voorzet, die de keeper claimt. Hij gooit meteen uit naar de trainer in het midden, die de bal over de grond terugkaatst. De keeper speelt hem in één keer met de voet door naar de keeper op de andere flank.',
    organisatie: 'Keeper 2 met ballen rechts op de hoek van het doelgebied, trainer centraal op 14 m, keeper 3 links op de flank op ± 18 m.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: [
      'Na het claimen meteen kijken: waar is de trainer vrij?',
      'Uitgooien: strak en op de voet of borst',
      'In één keer doorspelen: eerst kijken waar de bal heen moet, standbeen naast de bal',
    ],
    variaties: { makkelijker: ['Aannemen en dan doorspelen', 'Voorzet lager'], moeilijker: ['Doorspelen met de zwakke voet', 'Trainer kiest welke flank', 'Een speler zet druk na de terugkaats'] },
    tekening: {
      ...keeperVeld({ x: 16, y: -3, breedte: 34, lengte: 25 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.6),
        keeper('k2', 2, 43.6, 6.2, { kijkrichting: -160 }),
        trainer(34.4, 14.0),
        keeper('k3', 3, 24.6, 16.4, { kijkrichting: -45 }),
        bal('b2', 43.25, 6.1, 'k2'),
      ],
      animatie: [
        pauze(0.5),
        voorzet('k2', [34.0, 3.8]),
        pauze(0.3),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'zwaai', hoogte: 1.4 }),
        stap({ type: 'pass', van: 't1', naar: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 'k3', worp: 'voet', direct: true }),
        pauze(1.0),
      ],
    },
  },

  // C6 Circuit: stompen, hordes en lob
  {
    id: 'keeper-vz-circuit-stompen-hordes-lob',
    naam: 'Circuit: stompen, hordes en lob',
    categorieen: ['voorzetten', 'laag-duiken', 'reactie'],
    uitleg:
      'Een circuit met vier onderdelen achter elkaar. De keeper stompt een hoge bal weg, springt zijwaarts over twee hordes, maakt een draaisprong (een hele draai in de lucht) en krijgt dan een lage bal: duiken en vangen. Tot slot komt er een lob door de opening tussen twee poppen, die hij moet lezen en klemmen.',
    organisatie: 'Trainer links voor de voorzet, twee hordes rechts voor het doel, keeper 2 schuin rechts voor de lage bal, keeper 3 op 15 m achter twee poppen (opening 2,4 m) voor de lob.',
    benodigdheden: ['Goal', '2 hordes', '2 poppen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Stompen hoog en ver, landen in balans', 'Na de draaisprong meteen de bal zoeken', 'Lob: een paar pasjes terug, op het hoogste punt vangen'],
    variaties: { makkelijker: ['Zonder draaisprong', 'Lob lager'], moeilijker: ['Lob of lage bal: keeper 3 kiest', 'Hogere hordes', 'Alles zonder pauze'] },
    tekening: {
      ...keeperVeld({ x: 20, y: -3, breedte: 28, lengte: 21 }),
      objecten: [
        goal,
        horde('h1', 35.6, 3.6, 90, 0.15),
        horde('h2', 36.8, 3.6, 90, 0.15),
        pop('pL', 32.6, 9.0),
        pop('pR', 35.0, 9.0),
        keeper('k1', 1, 34, 1.6),
        trainer(24.4, 6.0, -20),
        keeper('k2', 2, 41.4, 9.6, { kijkrichting: -125 }),
        keeper('k3', 3, 33.8, 15.6, { kijkrichting: -90 }),
        bal('b1', 24.75, 5.9, 't1'),
        bal('b2', 41.15, 9.3, 'k2'),
        bal('b3', 33.8, 15.25, 'k3'),
      ],
      animatie: [
        pauze(0.5),
        voorzet('t1', [34.2, 3.6], { stompNaar: [27.8, 12.0] }),
        naar(34.4, 3.6, 'voetenwerk', { duur: 0.4 }),
        naar(38.0, 3.6, 'hordes', { kijk: 90 }),
        stap({ type: 'draai', wie: 'k1', kijk: -90, sprong: true }),
        stap({ type: 'draai', wie: 'k1', kijk: 90, sprong: true }),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 'grond', duikNaar: [36.3, 3.6] }),
        pauze(0.4),
        op(),
        terug('k1', 'k2'),
        naar(34.0, 3.0),
        stap({ type: 'pass', van: 'k3', naar: 'k1', worp: 'bovenhands', hoogte: 4.2, eindHoogte: 2.3 }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 'k3', worp: 'bovenhands', hoogte: 4.0 }),
        pauze(0.5),
      ],
    },
  },

  // C7 Eén hand, stompen en de paal
  {
    id: 'keeper-vz-een-hand-stompen-paal',
    naam: 'Eén hand, stompen en de paal',
    categorieen: ['voorzetten', 'laag-duiken', 'reactie'],
    uitleg:
      'De keeper zit in kniezit met een stilliggende bal vlak voor zich. Op een teken tikt hij die met één hand weg. Dan staat hij op en stompt een hoge bal van de trainer naar voren weg. Tot slot gaat hij naar de rechterpaal voor een laag schot van keeper 2 in de korte hoek.',
    organisatie: 'Keeper in kniezit 2,4 m voor het doel, een bal 0,5 m rechts voor hem. Trainer met ballen op 9 m, keeper 2 schuin rechts op 8 m.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Wegtikken: vlakke hand, de bal ver opzij weg', 'Stompen naar voren: armen strekken, vuisten achter de bal', 'Bij de paal: korte hoek dicht, laag blijven'],
    variaties: {
      makkelijker: ['Wegtikken zonder kniezit (gehurkt)', 'Hoge bal minder hoog'],
      moeilijker: ['Stuitbal voor het stompen', 'Laag schot direct na de landing', 'Wegtikken met de zwakke hand'],
    },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 15 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 2.4, { houding: 'kniezit', kijkrichting: 90 }),
        bal('b0', 33.78, 2.9),
        trainer(34.4, 9.4),
        keeper('k2', 2, 40.6, 8.0, { kijkrichting: -125 }),
        bal('b1', 34.4, 9.0, 't1'),
        bal('b2', 40.35, 7.7, 'k2'),
      ],
      animatie: [
        pauze(0.8),
        stap({ type: 'pass', van: 'k1', naar: [30.6, 5.4], bal: 'b0', worp: 'tik' }),
        pauze(0.3),
        op(),
        stap({ type: 'pass', van: 't1', naar: [34.2, 3.4], worp: 'bovenhands', hoogte: 3.0, eindHoogte: 2.2, uitkomen: 'k1', stompNaar: [34.6, 13.0], vuisten: 2 }),
        pauze(0.3),
        naar(36.6, 1.4, 'voetenwerk'),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 'grond', duikNaar: [37.3, 0.9] }),
        pauze(0.5),
        op(),
        terug('k1', 'k2'),
        pauze(0.5),
      ],
    },
  },
];

zet('keepers', oefeningen);
