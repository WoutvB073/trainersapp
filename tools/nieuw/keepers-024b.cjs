// Keeperoefeningen 0.24.0, deel 2: passing (C8–C19). Draaien: node tools/nieuw/keepers-024b.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, bal, pion, hoedje, pop, pauze, stap, terug, KLEUR, keeperVeld } = require('./bouwstenen.cjs');

const terugGooi = (van, naar) => stap({ type: 'pass', van, naar, worp: 'onderhands', hoogte: 1.6 });
const op = (wie = 'k1') => stap({ type: 'opstaan', wie });
const naar = (x, y, manier = 'voetenwerk', extra = {}) => stap({ type: 'loop', wie: 'k1', naar: [x, y], manier, ...extra });
const doeltje = (id, x, y, hoek = 180, breedte = 2) => ({ id, soort: 'klein-goal', x, y, hoek, breedte });
const voet = (van, naar, extra = {}) => stap({ type: 'pass', van, naar, worp: 'voet', ...extra });

const oefeningen = [
  // C8 Terugspeelbal naar het geroepen doeltje
  {
    id: 'keeper-ps-terugspeelbal-geroepen-doeltje',
    naam: 'Terugspeelbal naar het geroepen doeltje',
    categorieen: ['passing', 'reactie'],
    uitleg:
      'Op ± 18 m staan drie minidoeltjes, elk met een gekleurd hoedje ervoor. De trainer speelt een terugspeelbal naar de keeper. Terwijl de keeper de bal aanneemt, roept de trainer een kleur, en de keeper speelt de bal zo snel mogelijk in dat doeltje. Daarna de volgende bal en een andere kleur.',
    organisatie: 'Drie minidoeltjes op een rij op 18 m (links rood, midden geel, rechts blauw). Trainer met ballen schuin voor het doel op 10 m.',
    benodigdheden: ['Goal', '3 minidoeltjes', '3 gekleurde hoedjes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Aanname uit de voet: de bal meteen klaarleggen voor de pass', 'Na de kleur: kijken, dan pas spelen', 'Strak over de grond, met de binnenkant voet'],
    variaties: {
      makkelijker: ['Trainer roept de kleur vóór de pass', 'Doeltjes dichterbij'],
      moeilijker: ['In één keer spelen', 'Een speler zet druk na de aanname', 'Kleur pas op het laatst roepen'],
    },
    tekening: {
      ...keeperVeld({ x: 20, y: -3, breedte: 28, lengte: 25 }),
      objecten: [
        goal,
        doeltje('dR', 26.0, 19.0),
        doeltje('dG', 34.0, 20.0),
        doeltje('dB', 42.0, 19.0),
        hoedje('hR', 26.0, 17.6, KLEUR.rood),
        hoedje('hG', 34.0, 18.6, KLEUR.geel),
        hoedje('hB', 42.0, 17.6, KLEUR.blauw),
        keeper('k1', 1, 34, 2.4),
        trainer(38.6, 9.6, -115),
        bal('b1', 38.45, 9.25, 't1'),
        bal('b2', 39.2, 10.2),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1' }),
        pauze(0.3),
        voet('k1', [42.0, 19.3]),
        stap({ type: 'pak', wie: 't1', bal: 'b2', duur: 0.2 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', bal: 'b2' }),
        pauze(0.3),
        voet('k1', [26.0, 19.3], { bal: 'b2' }),
        pauze(1.0),
      ],
    },
  },

  // C9 Meevoetballende keeper: wegwerken en terug
  {
    id: 'keeper-ps-wegwerken-en-terug',
    naam: 'Meevoetballende keeper: wegwerken en terug',
    categorieen: ['passing', 'reactie'],
    uitleg:
      'De trainer slaat een lange bal over de verdediging. De keeper sprint uit naar de rand van het strafschopgebied en werkt de bal daar weg met het hoofd. Daarna loopt hij achteruit, met het gezicht naar het veld, terug naar zijn doel, waar keeper 2 meteen een schot geeft.',
    organisatie: 'Trainer met ballen op 35 m van het doel, keeper 2 met een bal schuin rechts op 15 m. Buiten het strafschopgebied mag de keeper de bal niet pakken.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Vroeg beslissen: gaan of blijven', 'Wegwerken ver en naar de zijkant, met hoofd of voet', 'Achteruit terug met kleine snelle pasjes, op tijd stilstaan voor het schot'],
    variaties: {
      makkelijker: ['Lange bal over de grond (wegtrappen)', 'Schot pas als de keeper in het doel staat'],
      moeilijker: ['Een aanvaller gaat ook op de bal af', 'Schot al tijdens het teruglopen (lob)', 'Lange bal met effect'],
    },
    tekening: {
      ...keeperVeld({ x: 18, y: -3, breedte: 32, lengte: 43 }),
      objecten: [goal, keeper('k1', 1, 34, 2.0), trainer(33.6, 35.0), keeper('k2', 2, 40.8, 15.4, { kijkrichting: -110 }), bal('b1', 33.6, 34.65, 't1'), bal('b2', 40.55, 15.1, 'k2')],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1', hoogte: 'hoog', eindHoogte: 1.7 }, { type: 'loop', wie: 'k1', naar: [34.2, 14.4], manier: 'sprint' }),
        stap({ type: 'pass', van: 'k1', naar: [24.0, 26.0], worp: 'voet', direct: true, hoogte: 4 }),
        stap({ type: 'loop', wie: 'k1', naar: [34.6, 2.6], manier: 'achteruit' }),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 1.3, eindHoogte: 1.0 }),
        pauze(0.3),
        terugGooi('k1', 'k2'),
        pauze(0.5),
      ],
    },
  },

  // C10 Uitspelen onder druk in minidoeltjes
  {
    id: 'keeper-ps-uitspelen-druk-minidoeltjes',
    naam: 'Uitspelen onder druk in minidoeltjes',
    categorieen: ['passing', 'een-op-een'],
    uitleg:
      'De keeper krijgt de bal van de trainer. Meteen zetten twee keepers druk. Hij moet de bal in een van drie minidoeltjes spelen (links, midden of rechts). Lukt dat niet en verovert een van de twee de bal, dan volgt direct een counter op zijn doel, die hij moet verdedigen.',
    organisatie: 'Drie minidoeltjes op ± 20 m: links, midden en rechts. Twee keepers als drukzetters op 12 m. Trainer met ballen naast het doel.',
    benodigdheden: ['Goal', '3 minidoeltjes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Voor de bal komt al kijken waar de ruimte is', 'Aanname weg van de druk', 'Na balverlies meteen terug in het doel en zetten'],
    variaties: { makkelijker: ['Eén drukzetter', 'Drukzetters starten verder weg'], moeilijker: ['In één keer spelen', 'Doeltjes kleiner', 'Drukzetters mogen meteen schieten na balverovering'] },
    tekening: {
      ...keeperVeld({ x: 16, y: -3, breedte: 36, lengte: 26 }),
      objecten: [
        goal,
        doeltje('d1', 22.0, 18.0, 135),
        doeltje('d2', 34.0, 21.0, 180),
        doeltje('d3', 46.0, 18.0, -135),
        keeper('k1', 1, 34, 2.6),
        trainer(39.6, 0.8, 160),
        keeper('k2', 2, 29.6, 12.0, { kijkrichting: -90 }),
        keeper('k3', 3, 38.6, 12.0, { kijkrichting: -90 }),
        bal('b1', 39.3, 1.0, 't1'),
        bal('b2', 40.4, 1.4),
      ],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'pass', van: 't1', naar: 'k1' },
          { type: 'loop', wie: 'k2', naar: [32.8, 6.4], manier: 'sprint', start: 0.4 },
          { type: 'loop', wie: 'k3', naar: [37.2, 6.4], manier: 'sprint', start: 0.4 },
        ),
        voet('k1', [22.6, 17.4]),
        pauze(0.6),
        stap({ type: 'loop', wie: 'k2', naar: [29.6, 12.0] }, { type: 'loop', wie: 'k3', naar: [38.6, 12.0] }, { type: 'pak', wie: 't1', bal: 'b2' }),
        // Tweede bal: de pass wordt onderschept → counter.
        stap(
          { type: 'pass', van: 't1', naar: 'k1', bal: 'b2' },
          { type: 'loop', wie: 'k2', naar: [32.8, 6.4], manier: 'sprint', start: 0.4 },
          { type: 'loop', wie: 'k3', naar: [37.2, 6.4], manier: 'sprint', start: 0.4 },
        ),
        voet('k1', [42.4, 14.0], { bal: 'b2', onderschept: 'k3' }),
        stap({ type: 'dribbel', wie: 'k3', naar: [38.4, 9.4] }, { type: 'loop', wie: 'k1', naar: [34.6, 1.8], manier: 'achteruit', start: 0.1 }),
        stap({ type: 'schot', van: 'k3', naar: 'k1', hoogte: 'grond', duikNaar: [32.9, 1.8] }),
        pauze(0.6),
        op(),
        pauze(0.4),
      ],
    },
  },

  // C11 Scannen, uitspelen en 1 op 1
  {
    id: 'keeper-ps-scannen-uitspelen-1op1',
    naam: 'Scannen, uitspelen en 1 op 1',
    categorieen: ['passing', 'een-op-een', 'reactie'],
    uitleg:
      'De keeper kijkt eerst over zijn schouder (scannen) en speelt de bal dan tussen twee poppen door naar keeper 2, die meteen op doel schiet. De keeper verwerkt dat schot. Direct daarna komt de trainer met een bal op hem af: een 1 op 1, waarin hij blokt.',
    organisatie: 'Twee poppen 2,5 m uit elkaar op 9 m. Keeper 2 op 18 m achter de opening. Trainer met een bal schuin rechts op 14 m.',
    benodigdheden: ['Goal', '2 poppen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Scannen voor je de bal hebt: waar is de opening?', 'Na de pass meteen terug en zetten voor het schot', '1 op 1: kort uitkomen, klein en breed, blokken'],
    variaties: {
      makkelijker: ['Opening breder', 'Trainer wacht tot de keeper staat'],
      moeilijker: ['Opening smaller', 'Trainer begint te dribbelen tijdens het schot', 'Keeper 2 mag ook terugleggen op de trainer'],
    },
    tekening: {
      ...keeperVeld({ x: 20, y: -3, breedte: 28, lengte: 25 }),
      objecten: [
        goal,
        pop('pL', 32.8, 9.0),
        pop('pR', 35.3, 9.0),
        keeper('k1', 1, 34, 2.4),
        keeper('k2', 2, 34.0, 18.4, { kijkrichting: -90 }),
        trainer(41.4, 14.0, -120),
        bal('b1', 34.0, 2.8, 'k1'),
        bal('b3', 41.15, 13.7, 't1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'draai', wie: 'k1', kijk: 30, duur: 0.4 }),
        stap({ type: 'draai', wie: 'k1', kijk: 90, duur: 0.3 }),
        voet('k1', 'k2'),
        stap({ type: 'schot', van: 'k2', naar: 'k1', hoogte: 1.2, eindHoogte: 1.0 }),
        pauze(0.3),
        stap({ type: 'pass', van: 'k1', naar: [28.0, 10.0], worp: 'onderhands', hoogte: 'grond' }, { type: 'dribbel', wie: 't1', naar: [37.6, 6.8], start: 0.2 }),
        stap({ type: 'loop', wie: 'k1', naar: [35.0, 4.2], manier: 'voetenwerk' }),
        stap({ type: 'schot', van: 't1', naar: [35.4, 0], hoogte: 0.5, blokt: 'k1', blokSoort: 'ster', afloopNaar: [41.0, 4.0] }),
        pauze(1.0),
      ],
    },
  },

  // C12 Uitspelen naar de hoek en terug
  {
    id: 'keeper-ps-uitspelen-hoek-tweede-bal',
    naam: 'Uitspelen naar de hoek en terug',
    categorieen: ['passing', 'laag-duiken'],
    uitleg:
      'De keeper speelt de bal uit naar een aangever schuin rechts aan de rand van het strafschopgebied. Die neemt aan en schiet; de keeper heeft zich intussen neergezet voor een schot vanuit die schuine hoek. De andere keeper komt mee voor een eventuele tweede bal: laat de keeper de bal los, dan moet hij die meteen ook nog pakken.',
    organisatie: 'Aangever (keeper 2) schuin rechts op 16 m, keeper 3 op 12 m voor het doel als naloper. Trainer speelt de eerste bal in naar de keeper.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: [
      'Uitspelen en meteen terug naar je positie: op de lijn bal–midden van het doel',
      'Schot vanuit de hoek: korte hoek dicht, maar niet te ver naar de paal',
      'Bal klemmen of ver wegwerken, nooit voor de voeten van de naloper',
    ],
    variaties: { makkelijker: ['Zonder naloper', 'Aangever neemt eerst rustig aan'], moeilijker: ['Aangever schiet direct', 'Naloper mag de keeper hinderen', 'Schoten ook halfhoog'] },
    tekening: {
      ...keeperVeld({ x: 17, y: -3, breedte: 37, lengte: 23 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 2.4),
        trainer(30.2, 8.0, -60),
        keeper('k2', 2, 46.4, 15.4, { kijkrichting: -135 }),
        keeper('k3', 3, 37.4, 12.2, { kijkrichting: -100 }),
        bal('b1', 30.35, 7.7, 't1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: 'k1' }),
        pauze(0.2),
        voet('k1', 'k2'),
        stap({ type: 'loop', wie: 'k1', naar: [36.0, 1.9], manier: 'voetenwerk' }, { type: 'dribbel', wie: 'k2', naar: [44.8, 13.4] }),
        stap({ type: 'schot', van: 'k2', naar: 'k1', hoogte: 'grond', duikNaar: [37.4, 1.5] }, { type: 'loop', wie: 'k3', naar: [38.6, 5.4], manier: 'sprint', start: 0.2 }),
        pauze(0.5),
        op(),
        terugGooi('k1', 'k2'),
        stap({ type: 'loop', wie: 'k3', naar: [37.4, 12.2] }),
        pauze(0.4),
      ],
    },
  },

  // C13 Terugspeelbal, draaien en schot
  {
    id: 'keeper-ps-terugspeelbal-draaien-schot',
    naam: 'Terugspeelbal, draaien en schot',
    categorieen: ['passing', 'laag-duiken'],
    uitleg:
      'Keeper 2 speelt een terugspeelbal; keeper 3 zet meteen druk. De keeper neemt aan, draait weg van de druk en speelt de bal naar de trainer. De trainer stapt opzij en schiet direct op doel: de keeper zet zich snel neer en duikt.',
    organisatie: 'Keeper 2 schuin links op 14 m, keeper 3 als drukzetter recht voor het doel op 10 m, trainer schuin rechts op 12 m.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Aannemen naar de open kant, weg van de drukzetter', 'Na de pass meteen terug naar het midden van het doel', 'Laag schot: laag blijven en zijwaarts vallen'],
    variaties: {
      makkelijker: ['Drukzetter loopt alleen mee', 'Trainer schiet op het lichaam'],
      moeilijker: ['Drukzetter mag de bal veroveren', 'In één keer doorspelen', 'Trainer schiet in de verre hoek'],
    },
    tekening: {
      ...keeperVeld({ x: 18, y: -3, breedte: 32, lengte: 19 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 3.0),
        keeper('k2', 2, 26.0, 13.2, { kijkrichting: -50 }),
        keeper('k3', 3, 34.6, 10.2, { kijkrichting: -90 }),
        trainer(42.4, 11.6, -130),
        bal('b2', 26.25, 12.9, 'k2'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'k2', naar: 'k1' }, { type: 'loop', wie: 'k3', naar: [33.8, 5.4], manier: 'sprint', start: 0.5 }),
        stap({ type: 'dribbel', wie: 'k1', naar: [36.0, 2.6] }),
        voet('k1', 't1'),
        stap({ type: 'dribbel', wie: 't1', naar: [41.2, 12.4] }, { type: 'loop', wie: 'k1', naar: [35.2, 1.8], manier: 'voetenwerk' }, { type: 'loop', wie: 'k3', naar: [31.4, 8.6], start: 0.3 }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [33.5, 1.6] }),
        pauze(0.5),
        op(),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // C14 Aannemen en wegdraaien van de pop
  {
    id: 'keeper-ps-aannemen-wegdraaien-pop',
    naam: 'Aannemen en wegdraaien van de pop',
    categorieen: ['passing'],
    uitleg:
      'Naast de keeper staat een pop als tegenstander. De trainer speelt een bal in: laag, met een stuit of halfhoog. De keeper neemt aan, draait weg van de pop en speelt de bal in een klein doeltje opzij. Drie ballen, steeds een andere hoogte.',
    organisatie: 'Keeper 5,6 m voor het doel met een pop 1,2 m rechts van hem. Klein doeltje links op 8 m. Trainer met ballen recht voor het doel op 15 m.',
    benodigdheden: ['Goal', 'Pop', 'Klein doeltje', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Voor de aanname al weten waar je heen draait', 'Eerste aanraking weg van de pop', 'Halfhoge bal: dij of wreef, bal dood laten vallen'],
    variaties: { makkelijker: ['Alleen lage ballen', 'Pop verder weg'], moeilijker: ['Een echte tegenstander in plaats van de pop', 'Doeltje kiezen op roepen van de trainer', 'In twee aanrakingen'] },
    tekening: {
      ...keeperVeld({ x: 20, y: -3, breedte: 28, lengte: 21 }),
      objecten: [goal, pop('p1', 35.2, 5.6), doeltje('d1', 26.0, 6.0, -90), keeper('k1', 1, 34, 5.6), trainer(34.4, 15.4), bal('b1', 34.4, 15.05, 't1'), bal('b2', 35.0, 15.9), bal('b3', 33.8, 16.0)],
      animatie: [
        pauze(0.4),
        ...[
          ['b1', {}],
          ['b2', { worp: 'onderhands', hoogte: 1.2, stuitOp: [34.1, 8.6], eindHoogte: 0.4 }],
          ['b3', { worp: 'onderhands', hoogte: 1.6, eindHoogte: 0.8 }],
        ].flatMap(([b, extra], i) => [
          ...(i > 0 ? [stap({ type: 'pak', wie: 't1', bal: b, duur: 0.2 })] : []),
          stap({ type: 'pass', van: 't1', naar: 'k1', bal: b, ...extra }),
          stap({ type: 'dribbel', wie: 'k1', naar: [32.6, 6.2] }),
          voet('k1', [26.3, 6.0], { bal: b }),
          naar(34, 5.6),
        ]),
        pauze(0.5),
      ],
    },
  },

  // C15 Uitkomen en in één keer passen
  {
    id: 'keeper-ps-uitkomen-een-keer-passen',
    naam: 'Uitkomen en in één keer passen',
    categorieen: ['passing', 'warming-up'],
    uitleg:
      'Naast elke paal staat een pion. De trainer speelt een bal in de ruimte tussen de linkerpion en de paal; de keeper komt uit en speelt de bal in één keer door naar de keeper op de linkerflank. Daarna hetzelfde aan de rechterkant. Tot slot een centrale bal: aannemen en terugspelen naar de trainer.',
    organisatie: 'Twee pionnen 3 m voor het doel, elk 2,6 m binnen de paal. Keepers op beide flanken op ± 15 m, trainer centraal op 14 m.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Uitkomen op tijd: de bal tegemoet gaan', 'In één keer passen: open lichaamshouding naar de flank', 'Centrale bal: aanname uit de voet, dan pas terugspelen'],
    variaties: { makkelijker: ['Eerst aannemen, dan passen', 'Ballen rustiger'], moeilijker: ['Met de zwakke voet', 'Een drukzetter vanaf de trainer', 'Flankkeepers bewegen: in de loop aanspelen'] },
    tekening: {
      ...keeperVeld({ x: 16, y: -3, breedte: 36, lengte: 20 }),
      objecten: [
        goal,
        pion('pL', 32.9, 3.0),
        pion('pR', 35.1, 3.0),
        keeper('k1', 1, 34, 1.4),
        trainer(34.4, 14.0),
        keeper('k2', 2, 22.4, 14.6, { kijkrichting: -40 }),
        keeper('k3', 3, 45.8, 14.6, { kijkrichting: -140 }),
        bal('b1', 34.4, 13.65, 't1'),
        bal('b2', 35.0, 14.6),
        bal('b3', 33.8, 14.7),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: [31.4, 3.6] }, { type: 'loop', wie: 'k1', naar: [31.6, 3.2], manier: 'voetenwerk', start: 0.3 }),
        voet('k1', 'k2', { direct: true }),
        naar(34, 1.4),
        stap({ type: 'pak', wie: 't1', bal: 'b2', duur: 0.2 }),
        stap({ type: 'pass', van: 't1', naar: [36.6, 3.6], bal: 'b2' }, { type: 'loop', wie: 'k1', naar: [36.4, 3.2], manier: 'voetenwerk', start: 0.3 }),
        voet('k1', 'k3', { direct: true, bal: 'b2' }),
        naar(34, 1.4),
        stap({ type: 'pak', wie: 't1', bal: 'b3', duur: 0.2 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', bal: 'b3' }),
        pauze(0.3),
        voet('k1', 't1', { bal: 'b3' }),
        pauze(0.6),
      ],
    },
  },

  // C16 Lange bal en lange worp
  {
    id: 'keeper-ps-lange-bal-lange-worp',
    naam: 'Lange bal en lange worp',
    categorieen: ['passing'],
    uitleg:
      'De trainer speelt de keeper aan. Die neemt aan en trapt de bal lang en hoog naar keeper 2 op ± 35 m. Keeper 2 vangt de bal en speelt hem met een lange zwaaiworp terug naar de keeper. Daarna wisselen ze van rol.',
    organisatie: 'Keeper 1 in het doel, keeper 2 op ± 35 m. Trainer met ballen naast het doel.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Lange trap: standbeen naast de bal, door de bal heen trappen', 'Vangen op het hoogste punt, niet afwachten', 'Lange worp: arm gestrekt, gewicht van achter naar voren'],
    variaties: {
      makkelijker: ['Afstand 25 m', 'Bal eerst stilleggen'],
      moeilijker: ['Bal in één keer lang trappen', 'Keeper 2 moet de bal in een vak vangen', 'Worp op de voet in plaats van in de handen'],
    },
    tekening: {
      ...keeperVeld({ x: 22, y: -3, breedte: 24, lengte: 47 }),
      objecten: [goal, keeper('k1', 1, 34, 3.0), trainer(39.6, 1.2, 160), keeper('k2', 2, 35.6, 36.0, { kijkrichting: -90 }), bal('b1', 39.3, 1.35, 't1')],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: 'k1' }),
        pauze(0.3),
        voet('k1', 'k2', { hoogte: 'hoog', eindHoogte: 1.8 }),
        pauze(0.3),
        stap({ type: 'pass', van: 'k2', naar: 'k1', worp: 'zwaai', hoogte: 6, eindHoogte: 1.6 }),
        pauze(0.8),
      ],
    },
  },

  // C17 Drie poorten, roterende dropkicks
  {
    id: 'keeper-ps-drie-poorten-dropkicks',
    naam: 'Drie poorten, roterende dropkicks',
    categorieen: ['passing', 'warming-up'],
    uitleg:
      'Drie poorten van pionnen staan in een driehoek. In elke poort staat een keeper. De keeper met de bal trapt een dropkick naar de volgende poort en sluit daarna aan bij de derde poort, achter de keeper die daar staat. De vanger trapt de bal door en doet hetzelfde. Zo schuift iedereen na elke actie een poort op en staat er altijd iemand klaar om te vangen.',
    organisatie: 'Driehoek met zijden van ± 18 m, poorten van 2 m breed. Eén bal (later twee).',
    benodigdheden: ['6 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Dropkick: bal laten vallen en raken net als hij de grond raakt', 'Mikken op de borst van de vanger', 'Na de trap meteen doorlopen naar de volgende poort'],
    variaties: { makkelijker: ['Volley in plaats van dropkick', 'Kleinere driehoek'], moeilijker: ['Twee ballen tegelijk', 'Bal in de loop vangen', 'Grotere driehoek'] },
    tekening: {
      veld: { type: 'leeg', breedte: 30, lengte: 26 },
      camera: 'schuin',
      objecten: [
        pion('a1', 6.0, 20.0),
        pion('a2', 8.0, 20.0),
        pion('b1', 22.0, 20.0),
        pion('b2', 24.0, 20.0),
        pion('c1', 14.0, 5.0),
        pion('c2', 16.0, 5.0),
        keeper('k1', 1, 7.0, 20.0, { kijkrichting: 0 }),
        keeper('k2', 2, 23.0, 20.0, { kijkrichting: -120 }),
        keeper('k3', 3, 15.0, 5.0, { kijkrichting: 120 }),
        bal('b', 7.35, 20.0, 'k1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 'k2', worp: 'dropkick', hoogte: 3, eindHoogte: 1.3 }),
        stap({ type: 'loop', wie: 'k1', via: [[10.6, 6.0]], naar: [15.0, 2.6] }, { type: 'pass', van: 'k2', naar: 'k3', worp: 'dropkick', hoogte: 3, eindHoogte: 1.3, start: 0.4 }),
        stap({
          type: 'loop',
          wie: 'k2',
          via: [
            [21.6, 21.8],
            [8.6, 21.8],
          ],
          naar: [7.0, 20.0],
        }),
        stap({ type: 'pass', van: 'k3', naar: 'k2', worp: 'dropkick', hoogte: 3, eindHoogte: 1.3 }),
        stap({ type: 'loop', wie: 'k3', naar: [23.0, 20.0] }, { type: 'loop', wie: 'k1', naar: [15.0, 5.0], start: 0.6 }),
        pauze(0.8),
      ],
    },
  },

  // C18 Lezen wat de verdediger doet
  {
    id: 'keeper-ps-lezen-verdediger',
    naam: 'Lezen wat de verdediger doet',
    categorieen: ['passing'],
    uitleg:
      'Een pop speelt verdediger tussen de keeper en een aanspeelpunt. Is de verdediger ingezakt (de pop staat dicht bij het doel, de lijn naar de medespeler is vrij), dan speelt de keeper een harde lage pass. Dekt hij door (de pop staat vlak voor de medespeler), dan speelt de keeper halfhoog over de pop heen. Beide situaties staan naast elkaar: links ingezakt, rechts doorgedekt.',
    organisatie: 'Links een pop op 7 m schuin voor het doel met een keeper op 18 m; rechts een pop op 14 m vlak voor een keeper op 19 m. Trainer met ballen speelt de keeper aan.',
    benodigdheden: ['Goal', '2 poppen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: [
      'Eerst kijken waar de verdediger staat, dan pas kiezen',
      'Lage pass: strak en over de grond, langs de pop',
      'Over de pop heen: onder de bal, met gevoel, net achter de pop laten landen',
    ],
    variaties: {
      makkelijker: ['De trainer zegt welke situatie het is', 'Meer afstand tussen pop en medespeler'],
      moeilijker: ['Een echte verdediger die zelf kiest', 'In één keer spelen', 'Medespeler beweegt'],
    },
    tekening: {
      ...keeperVeld({ x: 16, y: -3, breedte: 36, lengte: 26 }),
      objecten: [
        goal,
        pop('pIn', 28.6, 7.0),
        pop('pDoor', 40.4, 14.0),
        keeper('k1', 1, 34, 3.0),
        keeper('k2', 2, 26.2, 18.2, { kijkrichting: -70 }),
        keeper('k3', 3, 41.6, 19.4, { kijkrichting: -100 }),
        trainer(39.8, 1.0, 160),
        bal('b1', 39.5, 1.15, 't1'),
        bal('b2', 40.4, 1.6),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1' }),
        pauze(0.3),
        voet('k1', 'k2', { snelheid: 15 }),
        pauze(0.4),
        stap({ type: 'pak', wie: 't1', bal: 'b2', duur: 0.2 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', bal: 'b2' }),
        pauze(0.3),
        voet('k1', 'k3', { bal: 'b2', hoogte: 3.2, eindHoogte: 0.6 }),
        pauze(0.8),
      ],
    },
  },

  // C19 Uitspelen onder druk en dan lang
  {
    id: 'keeper-ps-uitspelen-druk-dan-lang',
    naam: 'Uitspelen onder druk en dan lang',
    categorieen: ['passing'],
    uitleg:
      'Eerste bal: de keeper krijgt de bal terwijl keeper 2 druk zet, en speelt snel en kort uit naar keeper 3 in het doeltje op de flank. Tweede bal: zonder druk. De keeper neemt aan, draait zijn lichaam open naar het veld en speelt de bal ver uit naar keeper 4 in het verre doeltje.',
    organisatie: 'Twee doeltjes met een keeper erin: één op de flank op ± 18 m, één ver weg op ± 35 m. Keeper 2 zet druk vanaf 12 m. Trainer met ballen naast het doel.',
    benodigdheden: ['Goal', '2 doeltjes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 4,
    doorwisselbaar: true,
    coachpunten: ['Onder druk: één aanname en snel weg, niet dribbelen', 'Zonder druk: lichaam open, kijken, en dan pas lang', 'Lange bal: door de bal heen trappen, op de borst van de ontvanger'],
    variaties: { makkelijker: ['Drukzetter loopt alleen mee', 'Lange doeltje dichterbij'], moeilijker: ['Drukzetter mag veroveren', 'Lange bal over de grond', 'Keeper kiest zelf: kort of lang'] },
    tekening: {
      ...keeperVeld({ x: 18, y: -3, breedte: 32, lengte: 45 }),
      objecten: [
        goal,
        doeltje('dK', 22.0, 18.0, 135),
        doeltje('dL', 42.0, 37.0, -160),
        keeper('k1', 1, 34, 3.0),
        keeper('k2', 2, 34.6, 12.0, { kijkrichting: -90 }),
        keeper('k3', 3, 22.8, 17.2, { kijkrichting: -50 }),
        keeper('k4', 4, 41.6, 36.0, { kijkrichting: -100 }),
        trainer(39.8, 1.0, 160),
        bal('b1', 39.5, 1.15, 't1'),
        bal('b2', 40.4, 1.6),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: 'k1' }, { type: 'loop', wie: 'k2', naar: [34.6, 5.6], manier: 'sprint', start: 0.3 }),
        voet('k1', 'k3'),
        stap({ type: 'loop', wie: 'k2', naar: [34.6, 12.0] }, { type: 'pak', wie: 't1', bal: 'b2' }),
        stap({ type: 'pass', van: 't1', naar: 'k1', bal: 'b2' }),
        stap({ type: 'draai', wie: 'k1', kijk: 70, duur: 0.4 }),
        voet('k1', 'k4', { bal: 'b2', hoogte: 'hoog', eindHoogte: 1.2 }),
        pauze(1.0),
      ],
    },
  },
];

zet('keepers', oefeningen);
