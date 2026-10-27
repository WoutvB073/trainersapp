// Keeperoefeningen 0.23.0, deel 1: A3.5 en de warming-ups (B1–B10). Draaien: node tools/nieuw/keepers-023a.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, bal, pion, hoedje, paaltje, pauze, stap, terug, KLEUR, keeperVeld } = require('./bouwstenen.cjs');

const leeg = (breedte, lengte) => ({ veld: { type: 'leeg', breedte, lengte }, camera: 'schuin' });

const oefeningen = [
  // A3.5 Slalom, pion aantikken en duiken
  {
    id: 'keeper-hd-slalom-pion-duiken',
    naam: 'Slalom, pion aantikken en duiken',
    categorieen: ['hoog-duiken', 'laag-duiken'],
    uitleg:
      'De keeper slalomt tussen vier paaltjes voor het doel door, komt het doel in en tikt aan de ene kant een pion aan. Meteen daarna duikt hij naar de andere kant, naar een hoge bal van de trainer. Opstaan, bal terug en dan dezelfde slalom de andere kant op: de pion aan die kant aantikken en duiken naar de andere kant, nu laag.',
    organisatie: 'Vier paaltjes op een rij, 1,4 m uit elkaar, 4,6 m voor de doellijn. Twee pionnen in het doel, 2,2 m voor de lijn en 1,5 m binnen elke paal. Trainer met ballen op 10 m.',
    benodigdheden: ['Goal', '4 paaltjes', '2 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Slalom met kleine pasjes, schouders naar de trainer', 'Na het aantikken eerst zetten, dan pas afzetten', 'Hoge duik: afzetten met het been aan de balkant; lage duik: zijwaarts vallen, handen eerst'],
    variaties: { makkelijker: ['Zonder slalom: alleen aantikken en duiken', 'Bal halfhoog in plaats van hoog'], moeilijker: ['Trainer kiest pas na het aantikken hoog of laag', 'Paaltjes dichter op elkaar', 'Twee keer aantikken voor de duik'] },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 16 }),
      objecten: [
        goal,
        paaltje('q1', 32.2, 4.6),
        paaltje('q2', 33.6, 4.6),
        paaltje('q3', 35.0, 4.6),
        paaltje('q4', 36.4, 4.6),
        pion('pL', 31.8, 2.2),
        pion('pR', 36.2, 2.2),
        keeper('k1', 1, 37.8, 4.6, { kijkrichting: 90 }),
        trainer(34.4, 10.4),
        bal('b1', 34.4, 10.0, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', via: [[36.4, 3.7], [35.0, 5.5], [33.6, 3.7], [32.2, 5.5]], naar: [31.2, 4.6], manier: 'voetenwerk', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', naar: [32.5, 2.2], manier: 'voetenwerk' }),
        stap({ type: 'aantikken', wie: 'k1', doel: 'pL' }),
        stap({ type: 'schot', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 2.4, eindHoogte: 1.7, duikNaar: [34.6, 1.6], duikHoogte: 1.7 }),
        pauze(0.7),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands', hoogte: 1.8 }),
        stap({ type: 'loop', wie: 'k1', naar: [30.8, 4.6], manier: 'voetenwerk' }),
        stap({ type: 'loop', wie: 'k1', via: [[32.2, 3.7], [33.6, 5.5], [35.0, 3.7], [36.4, 5.5]], naar: [37.4, 4.6], manier: 'voetenwerk', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', naar: [35.5, 2.2], manier: 'voetenwerk' }),
        stap({ type: 'aantikken', wie: 'k1', doel: 'pR' }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [33.5, 1.8] }),
        pauze(0.6),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands', hoogte: 1.8 }),
        pauze(0.4),
      ],
    },
  },

  // B1 Twee ballen tegelijk
  {
    id: 'keeper-wu-twee-ballen',
    naam: 'Twee ballen tegelijk',
    categorieen: ['warming-up'],
    uitleg:
      'Drie keepers staan in een driehoek, elk met een eigen bal, en er gaat één extra bal rond. Wie de extra bal krijgt, gooit eerst zijn eigen bal hoog op, vangt intussen de extra bal, speelt die door naar de volgende keeper en vangt dan zijn eigen bal weer voordat die de grond raakt. Zo gaat het rond.',
    organisatie: 'Driehoek van ± 6 m tussen de keepers. Elke keeper heeft een bal; de vierde bal gaat rond. Na een paar rondes de andere kant op.',
    benodigdheden: ['4 ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Eigen bal recht en hoog genoeg omhoog: dan heb je tijd', 'Ogen eerst op de bal die aankomt, daarna weer omhoog', 'Rustig doorspelen: liever een goede worp dan een snelle'],
    variaties: { makkelijker: ['Eigen bal laten stuiten voor je hem vangt', 'Met twee keepers en zonder doorspelen'], moeilijker: ['Extra bal met een stuit of op de voet', 'Twee extra ballen tegelijk rond', 'Eigen bal lager opgooien'] },
    tekening: {
      ...leeg(18, 16),
      objecten: [
        keeper('k1', 1, 5, 9, { kijkrichting: -20 }),
        keeper('k2', 2, 13, 9, { kijkrichting: -160 }),
        keeper('k3', 3, 9, 3.5, { kijkrichting: 90 }),
        bal('b1', 5, 9, 'k1'),
        bal('b2', 13, 9, 'k2'),
        bal('bx', 9, 3.5, 'k3'),
        bal('b3', 9.4, 3.0),
      ],
      animatie: [
        pauze(0.4),
        stap(
          { type: 'pass', van: 'k1', naar: 'k1', bal: 'b1', worp: 'onderhands', hoogte: 6 },
          { type: 'pass', van: 'k3', naar: 'k1', bal: 'bx', worp: 'onderhands', hoogte: 1.6, eindHoogte: 1.2, start: 0.35 },
          { type: 'pass', van: 'k1', naar: 'k2', bal: 'bx', worp: 'onderhands', hoogte: 1.6, eindHoogte: 1.2, start: 1.2 },
        ),
        stap({ type: 'pak', wie: 'k3', bal: 'b3' }),
        stap(
          { type: 'pass', van: 'k2', naar: 'k2', bal: 'b2', worp: 'onderhands', hoogte: 6 },
          { type: 'pass', van: 'k3', naar: 'k3', bal: 'b3', worp: 'onderhands', hoogte: 6, start: 0.8 },
          { type: 'pass', van: 'k2', naar: 'k3', bal: 'bx', worp: 'onderhands', hoogte: 1.6, eindHoogte: 1.2, start: 0.9 },
          { type: 'pass', van: 'k3', naar: [9.0, 2.6], bal: 'bx', worp: 'onderhands', hoogte: 'grond', start: 1.9 },
        ),
        pauze(0.6),
      ],
    },
  },

  // B2 Rasterloop en lage duik
  {
    id: 'keeper-wu-rasterloop-lage-duik',
    naam: 'Rasterloop en lage duik',
    categorieen: ['warming-up', 'laag-duiken'],
    uitleg:
      'Vier pionnen vormen een vierkant voor het doel. De keeper gaat zijwaarts en vooruit door het raster naar de linkerkant en vangt daar een bal op hoofdhoogte van de trainer. Die gooit hij door naar keeper 2 aan de rechterkant. Dan zijwaarts terug naar het midden van het raster, waar hij een lage bal van keeper 2 krijgt: duiken en vangen.',
    organisatie: 'Vier pionnen in een vierkant van 3 × 1,8 m, 3 m voor het doel. Trainer op 10 m, keeper 2 schuin rechts op ± 8 m. Daarna wisselen de keepers.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Zijwaarts: voeten niet kruisen, gezicht naar het veld', 'Bal op hoofdhoogte: handen in een W, ellebogen licht gebogen', 'Lage duik: eerst laag zakken, dan zijwaarts vallen met de handen naar de bal'],
    variaties: { makkelijker: ['Zonder raster: alleen vangen en de lage bal', 'Lage bal rollend in plaats van getrapt'], moeilijker: ['Raster groter', 'Lage bal verder van de keeper', 'Na de duik nog een bal op hoofdhoogte'] },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 15 }),
      objecten: [
        goal,
        pion('p1', 32.5, 3.0),
        pion('p2', 35.5, 3.0),
        pion('p3', 32.5, 4.8),
        pion('p4', 35.5, 4.8),
        keeper('k1', 1, 34, 2.1, { kijkrichting: 90 }),
        trainer(33.6, 10.6),
        keeper('k2', 2, 40.6, 8.2, { kijkrichting: -130 }),
        bal('b1', 33.6, 10.2, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [31.8, 2.1], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', naar: [31.8, 3.9], manier: 'voetenwerk' }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 2.4, eindHoogte: 1.8 }),
        pauze(0.3),
        stap({ type: 'pass', van: 'k1', naar: 'k2', bal: 'b1', worp: 'bovenhands', hoogte: 2.6 }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 3.9], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 'grond', duikNaar: [33.0, 3.9] }),
        pauze(0.6),
        stap({ type: 'opstaan', wie: 'k1' }),
        terug('k1', 'k2'),
        pauze(0.5),
      ],
    },
  },

  // B3 Zijwaarts blijven bewegen en vangen
  {
    id: 'keeper-wu-zijwaarts-blijven-vangen',
    naam: 'Zijwaarts blijven bewegen en vangen',
    categorieen: ['warming-up', 'bal-verwerken'],
    uitleg:
      'De keeper schuift steeds zijwaarts heen en weer tussen twee hoedjes. De trainer gooit op het moment dat hij wil een bal links of rechts van het midden: de keeper vangt hem, gooit terug en schuift meteen verder. Drie rondes na elkaar: eerst ballen op hoofdhoogte, dan ballen met een stuit en tot slot ballen op buikhoogte.',
    organisatie: 'Twee hoedjes 3 m uit elkaar, 2 m voor de doellijn. Trainer met ballen op 7 m. Per ronde ± 6 ballen.',
    benodigdheden: ['Goal', '2 hoedjes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Blijf bewegen, maar sta stil op het moment dat de bal komt', 'Gezicht en schouders naar de trainer, niet wegdraaien', 'Stuitbal: lichaam achter de bal en de bal tegen je borst klemmen'],
    variaties: { makkelijker: ['Hoedjes dichter bij elkaar', 'Trainer gooit pas als de keeper stilstaat'], moeilijker: ['Trainer gooit ook naast de keeper (korte duik)', 'Harder en vanaf dichterbij', 'Hoogtes door elkaar'] },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 12 }),
      objecten: [goal, hoedje('h1', 32.5, 2.0), hoedje('h2', 35.5, 2.0), keeper('k1', 1, 34, 2.0, { kijkrichting: 90 }), trainer(34.4, 8.6), bal('b1', 34.4, 8.2, 't1')],
      animatie: [
        pauze(0.4),
        ...[
          { eindHoogte: 1.8, hoogte: 2.4, x: 33.1 },
          { stuit: true, x: 34.9 },
          { eindHoogte: 0.9, hoogte: 1.4, x: 33.1 },
        ].flatMap((v) => [
          stap({ type: 'loop', wie: 'k1', naar: [v.x, 2.0], manier: 'zijwaarts', kijk: 90 }),
          stap(
            v.stuit
              ? { type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 1.1, stuitOp: [v.x, 4.2], eindHoogte: 0.9 }
              : { type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: v.hoogte, eindHoogte: v.eindHoogte },
          ),
          pauze(0.3),
          stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
          stap({ type: 'loop', wie: 'k1', naar: [v.x < 34 ? 35.0 : 33.0, 2.0], manier: 'zijwaarts', kijk: 90 }),
        ]),
        pauze(0.4),
      ],
    },
  },

  // B4 Drie aangevers op een rij
  {
    id: 'keeper-wu-drie-aangevers',
    naam: 'Drie aangevers op een rij',
    categorieen: ['warming-up', 'bal-verwerken'],
    uitleg:
      'Drie aangevers staan naast elkaar voor het doel. De keeper stapt opzij naar de linker aangever, vangt een bal op hoofdhoogte en speelt hem terug. Dan terug naar het midden voor de bal van de middelste aangever, en tot slot opzij naar rechts. Daarna wisselt een aangever met de keeper.',
    organisatie: 'Aangevers op 8 m van het doel en 3,5 m uit elkaar (trainer in het midden, keepers links en rechts). Keeper 2 m voor de doellijn.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Eén grote stap opzij en stilstaan voor de bal komt', 'Bal op hoofdhoogte: duimen achter de bal, bal even vasthouden', 'Na het terugspelen meteen klaar voor de volgende'],
    variaties: { makkelijker: ['Ballen op borsthoogte', 'Aangevers dichter bij het doel'], moeilijker: ['Aangevers kiezen zelf de volgorde', 'Hoogtes door elkaar', 'Harder gooien of schieten'] },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 14 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 2.2, { kijkrichting: 90 }),
        keeper('k2', 2, 30.5, 8.2, { kijkrichting: -80 }),
        trainer(34.2, 8.6),
        keeper('k3', 3, 37.9, 8.2, { kijkrichting: -100 }),
        bal('b2', 30.6, 7.85, 'k2'),
        bal('b1', 34.2, 8.2, 't1'),
        bal('b3', 37.8, 7.85, 'k3'),
      ],
      animatie: [
        pauze(0.5),
        ...[
          ['k2', 32.6],
          ['t1', 34.0],
          ['k3', 35.4],
        ].flatMap(([wie, x]) => [
          stap({ type: 'loop', wie: 'k1', naar: [x, 2.2], manier: 'zijwaarts', kijk: 90 }),
          stap({ type: 'pass', van: wie, naar: 'k1', worp: 'bovenhands', hoogte: 2.3, eindHoogte: 1.8 }),
          pauze(0.3),
          stap({ type: 'pass', van: 'k1', naar: wie, worp: 'onderhands' }),
        ]),
        pauze(0.3),
        stap({ type: 'loop', wie: 'k1', via: [[37.4, 3.4]], naar: [38.6, 6.8] }, { type: 'loop', wie: 'k3', via: [[35.8, 5.6]], naar: [34, 2.2], start: 0.3 }),
        pauze(0.5),
      ],
    },
  },

  // B5 Sprint met tennisballen, dan vangen
  {
    id: 'keeper-wu-tennisballen-vangen',
    naam: 'Sprint met tennisballen, dan vangen',
    categorieen: ['warming-up', 'bal-verwerken'],
    uitleg:
      'Bij een pion liggen tennisballen. De keeper brengt ze een voor een naar een tweede pion, sprint daarna door een poortje van twee paaltjes en vangt direct een harde bal op hoofdhoogte van de trainer. De volgende keeper begint als de vorige halverwege is.',
    organisatie: 'Pion A met 2 tennisballen en pion B 4 m verder. Poortje (2 paaltjes, 2 m breed) 4 m voor het doel. Trainer op 9 m voor het doel.',
    benodigdheden: ['Goal', '2 pionnen', '2 paaltjes', 'Tennisballen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Bij de pion door de knieën om de tennisbal te pakken, niet bukken met gestrekte benen', 'Na het poortje afremmen en in basishouding voor de bal komt', 'Harde bal: handen voor het lijf, bal naar je toe halen'],
    variaties: { makkelijker: ['Eén tennisbal', 'Bal op borsthoogte'], moeilijker: ['Drie tennisballen', 'Trainer gooit al terwijl de keeper nog in het poortje is', 'Na het vangen een lage duik'] },
    tekening: {
      ...keeperVeld({ x: 22, y: -3, breedte: 22, lengte: 16 }),
      objecten: [
        goal,
        pion('pA', 27.0, 10.0),
        pion('pB', 27.0, 6.0),
        paaltje('q1', 32.0, 4.0),
        paaltje('q2', 34.0, 4.0),
        bal('tb1', 27.7, 10.3, null, { variant: 'tennisbal' }),
        bal('tb2', 27.6, 10.6, null, { variant: 'tennisbal' }),
        bal('tb3', 27.7, 11.9, null, { variant: 'tennisbal' }),
        keeper('k1', 1, 27.8, 9.4, { kijkrichting: -90 }),
        keeper('k2', 2, 25.6, 11.4, { kijkrichting: 0 }),
        trainer(33.4, 9.6),
        bal('b1', 33.4, 9.2, 't1'),
        bal('b2', 33.8, 9.9),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pak', wie: 'k1', bal: 'tb1' }),
        stap({ type: 'loop', wie: 'k1', naar: [27.7, 6.6], manier: 'sprint' }),
        stap({ type: 'pass', van: 'k1', naar: [27.6, 6.3], bal: 'tb1', worp: 'onderhands', hoogte: 'grond' }),
        stap({ type: 'loop', wie: 'k1', naar: [27.8, 9.6], manier: 'sprint' }),
        stap({ type: 'pak', wie: 'k1', bal: 'tb2' }, { type: 'loop', wie: 'k2', naar: [26.2, 11.4], start: 0.2 }),
        stap({ type: 'loop', wie: 'k1', naar: [27.9, 6.8], manier: 'sprint' }),
        stap({ type: 'pass', van: 'k1', naar: [27.7, 6.5], bal: 'tb2', worp: 'onderhands', hoogte: 'grond' }, { type: 'pak', wie: 'k2', bal: 'tb3', start: 0.2 }),
        stap({ type: 'loop', wie: 'k1', via: [[30.4, 5.6], [33.0, 4.8]], naar: [33.0, 3.0], manier: 'sprint' }, { type: 'loop', wie: 'k2', via: [[28.4, 11.1]], naar: [27.9, 9.5], manier: 'sprint', start: 0.3 }),
        stap({ type: 'loop', wie: 'k1', naar: [33.2, 2.2], manier: 'voetenwerk', duur: 0.5 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 2.2, eindHoogte: 1.8, snelheid: 14 }),
        pauze(0.4),
        terug('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // B6 Laddersprongen en voetpass
  {
    id: 'keeper-wu-ladder-voetpass',
    naam: 'Laddersprongen en voetpass',
    categorieen: ['warming-up', 'passing'],
    uitleg:
      'De keeper vangt een bal op hoofdhoogte van de trainer en gooit terug. Dan zijwaarts door de ladder, met in elk vak één voet. Aan het eind krijgt hij een lage pass van keeper 2 aan de andere kant, die hij direct met de binnenkant voet terugspeelt. Daarna door de ladder terug.',
    organisatie: 'Ladder dwars voor het doel, 3 m van de doellijn. Trainer voor het linkeruiteinde op 8 m, keeper 2 voor het rechteruiteinde op 8 m.',
    benodigdheden: ['Goal', 'Ladder', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['In de ladder op de voorvoeten en snel, gezicht naar het veld', 'Voetpass: standbeen naast de bal, enkel vast, binnenkant voet', 'Na de pass meteen weer in basishouding'],
    variaties: { makkelijker: ['Ladder lopen in plaats van springen', 'Bal laten stilleggen en dan pas terugspelen'], moeilijker: ['Pass met de andere voet terug', 'Twee voeten per vak', 'Na de voetpass een bal op hoofdhoogte van keeper 2'] },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 14 }),
      objecten: [
        goal,
        { id: 'l1', soort: 'ladder', x: 34, y: 3.0, hoek: 90, lengte: 4, breedte: 0.5 },
        keeper('k1', 1, 31.2, 2.3, { kijkrichting: 90 }),
        trainer(31.0, 8.6),
        keeper('k2', 2, 37.2, 8.6, { kijkrichting: -90 }),
        bal('b1', 31.0, 8.2, 't1'),
        bal('b2', 37.2, 8.25, 'k2'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 2.3, eindHoogte: 1.8 }),
        pauze(0.3),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
        stap({ type: 'loop', wie: 'k1', naar: [31.6, 3.0], manier: 'voetenwerk', duur: 0.4 }),
        stap({ type: 'loop', wie: 'k1', naar: [36.4, 3.0], manier: 'voetenwerk', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', naar: [36.8, 3.3], manier: 'voetenwerk', duur: 0.4 }),
        stap({ type: 'pass', van: 'k2', naar: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 'k2', worp: 'voet', direct: true }),
        stap({ type: 'loop', wie: 'k1', naar: [36.4, 3.0], manier: 'voetenwerk', duur: 0.4 }),
        stap({ type: 'loop', wie: 'k1', naar: [31.6, 3.0], manier: 'voetenwerk', kijk: 90 }),
        pauze(0.5),
      ],
    },
  },

  // B7 Zijwaarts, uitschieten en afremmen
  {
    id: 'keeper-wu-zijwaarts-uitschieten',
    naam: 'Zijwaarts, uitschieten en afremmen',
    categorieen: ['warming-up', 'bal-verwerken'],
    uitleg:
      'De keeper gaat een paar keer zijwaarts heen en weer tussen twee pionnen. Op een teken sprint hij 5 m vooruit, remt hard af en staat stil in basishouding. Dan gooit de trainer een bal op wisselende hoogte: vangen, terug en achteruit terug naar de pionnen.',
    organisatie: 'Twee pionnen 3 m uit elkaar, 2 m voor de doellijn. Trainer met ballen op 11 m.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Afremmen met kleine pasjes en lage heupen, niet doorlopen', 'Eerst stilstaan, dan pas vangen', 'Achteruit terug met het gezicht naar het veld'],
    variaties: { makkelijker: ['Kortere sprint (3 m)', 'Altijd op borsthoogte'], moeilijker: ['Trainer gooit al tijdens het afremmen', 'Na het vangen een lage duik naar links of rechts', 'Sprint schuin naar voren'] },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 16 }),
      objecten: [goal, pion('p1', 32.5, 2.4), pion('p2', 35.5, 2.4), keeper('k1', 1, 33.2, 1.7, { kijkrichting: 90 }), trainer(34.4, 12.0), bal('b1', 34.4, 11.6, 't1')],
      animatie: [
        pauze(0.4),
        ...[
          [1.8, 2.4],
          [0.9, 1.4],
        ].flatMap(([eind, hoog]) => [
          stap({ type: 'loop', wie: 'k1', naar: [34.8, 1.7], manier: 'zijwaarts', kijk: 90 }),
          stap({ type: 'loop', wie: 'k1', naar: [33.2, 1.7], manier: 'zijwaarts', kijk: 90 }),
          stap({ type: 'loop', wie: 'k1', naar: [34.0, 6.8], manier: 'sprint' }),
          stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: hoog, eindHoogte: eind }),
          pauze(0.3),
          stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
          stap({ type: 'loop', wie: 'k1', naar: [33.2, 1.7], manier: 'achteruit' }),
        ]),
        pauze(0.4),
      ],
    },
  },

  // B8 Voet, uitstappen en vangen
  {
    id: 'keeper-wu-voet-uitstappen-vangen',
    naam: 'Voet, uitstappen en vangen',
    categorieen: ['warming-up', 'passing'],
    uitleg:
      'De trainer speelt een lage bal naar de keeper, die hem in één keer met de voet terugspeelt. Dan stapt de keeper 3–4 m uit en vangt hij een bal op hoofd-, borst- of buikhoogte. Bal terug, terug in het doel en de volgende. Na een paar keer wisselen de twee keepers.',
    organisatie: 'Keeper 1 in het doel, keeper 2 wacht naast het doel. Trainer met ballen op 10 m.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: ['Voetpass: eerst kijken, dan zuiver terugspelen met de binnenkant', 'Uitstappen: kort en krachtig, stilstaan voor de bal', 'Hoogte bepaalt de handen: W-greep, kommetje of schepvangen'],
    variaties: { makkelijker: ['Bal eerst aannemen, dan terugspelen', 'Altijd op borsthoogte'], moeilijker: ['Terugspelen met de zwakke voet', 'Trainer gooit al terwijl de keeper uitstapt', 'Uitstappen schuin naar links of rechts'] },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 15 }),
      objecten: [goal, keeper('k1', 1, 34, 1.8, { kijkrichting: 90 }), keeper('k2', 2, 39.6, 1.4, { kijkrichting: 150 }), trainer(34.4, 10.6), bal('b1', 34.4, 10.2, 't1')],
      animatie: [
        pauze(0.4),
        ...[
          [1.8, 2.4],
          [1.1, 1.6],
        ].flatMap(([eind, hoog]) => [
          stap({ type: 'pass', van: 't1', naar: 'k1' }),
          stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'voet', direct: true }),
          stap({ type: 'loop', wie: 'k1', naar: [34, 5.2], manier: 'voetenwerk' }),
          stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: hoog, eindHoogte: eind }),
          pauze(0.3),
          stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
          stap({ type: 'loop', wie: 'k1', naar: [34, 1.8], manier: 'achteruit' }),
        ]),
        stap({ type: 'loop', wie: 'k1', via: [[36.6, 2.6]], naar: [39.6, 2.9] }, { type: 'loop', wie: 'k2', via: [[37.0, 0.8]], naar: [34, 1.8], start: 0.2 }),
        pauze(0.6),
      ],
    },
  },

  // B9 Kleurenpion pakken in de groep
  {
    id: 'keeper-sp-kleurenpion',
    naam: 'Kleurenpion pakken in de groep',
    categorieen: ['warming-up', 'spelletjes'],
    uitleg:
      'Rond de groep staat een cirkel van gekleurde pionnen. De keepers bewegen door de cirkel en gooien elkaar ballen toe. Roept de trainer een kleur, dan sprint iedereen naar een pion van die kleur. Wie het laatst is, doet een kleine opdracht (bijvoorbeeld drie keer opstaan uit buiklig). Dan verder met gooien.',
    organisatie: 'Cirkel van ± 12 m met zes pionnen in drie kleuren (elke kleur twee keer). Vier keepers met twee ballen in de cirkel.',
    benodigdheden: ['6 gekleurde pionnen', '2 ballen'],
    spelersNodig: 0,
    keepersNodig: 4,
    doorwisselbaar: true,
    coachpunten: ['Blijf bewegen en kijk rond: waar is de bal, waar zijn de pionnen?', 'Na de kleur meteen reageren, niet eerst kijken wat de anderen doen', 'Vangen met twee handen, ook in beweging'],
    variaties: { makkelijker: ['Twee kleuren', 'Lopen in plaats van sprinten'], moeilijker: ['Trainer roept twee kleuren na elkaar', 'Met drie ballen', 'Pion aantikken met de hand en terug naar het midden'] },
    tekening: {
      ...leeg(20, 18),
      objecten: [
        pion('pr1', 10, 3, KLEUR.rood),
        pion('pb1', 15.2, 6, KLEUR.blauw),
        pion('pg1', 15.2, 12, KLEUR.geel),
        pion('pr2', 10, 15, KLEUR.rood),
        pion('pb2', 4.8, 12, KLEUR.blauw),
        pion('pg2', 4.8, 6, KLEUR.geel),
        keeper('k1', 1, 8, 7, { kijkrichting: 0 }),
        keeper('k2', 2, 12, 7, { kijkrichting: 180 }),
        keeper('k3', 3, 8, 11, { kijkrichting: 0 }),
        keeper('k4', 4, 12, 11, { kijkrichting: 180 }),
        trainer(18.6, 9, 180),
        bal('b1', 8.35, 7, 'k1'),
        bal('b2', 7.65, 11, 'k3'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 'k2', worp: 'onderhands', hoogte: 1.6, eindHoogte: 1.2 }, { type: 'pass', van: 'k3', naar: 'k4', worp: 'onderhands', hoogte: 1.6, eindHoogte: 1.2 }),
        stap({ type: 'pass', van: 'k2', naar: 'k3', worp: 'onderhands', hoogte: 1.8, eindHoogte: 1.2 }, { type: 'pass', van: 'k4', naar: 'k1', worp: 'onderhands', hoogte: 1.8, eindHoogte: 1.2 }),
        pauze(0.4),
        // Trainer roept "rood": iedereen naar een rode pion (twee keepers per pion, aan weerszijden).
        stap(
          { type: 'loop', wie: 'k1', naar: [9.2, 3.0], manier: 'sprint' },
          { type: 'loop', wie: 'k2', naar: [10.8, 3.0], manier: 'sprint' },
          { type: 'loop', wie: 'k3', naar: [9.2, 15.0], manier: 'sprint' },
          { type: 'loop', wie: 'k4', naar: [10.8, 15.0], manier: 'sprint' },
        ),
        pauze(0.6),
        stap(
          { type: 'loop', wie: 'k1', naar: [8, 7] },
          { type: 'loop', wie: 'k2', naar: [12, 7] },
          { type: 'loop', wie: 'k3', naar: [8, 11] },
          { type: 'loop', wie: 'k4', naar: [12, 11] },
        ),
        stap({ type: 'pass', van: 'k3', naar: 'k2', worp: 'onderhands', hoogte: 1.8, eindHoogte: 1.2 }, { type: 'pass', van: 'k1', naar: 'k4', worp: 'onderhands', hoogte: 1.8, eindHoogte: 1.2 }),
        pauze(0.6),
      ],
    },
  },

  // B10 Stompen terwijl je eigen bal in de lucht hangt
  {
    id: 'keeper-sp-stompen-eigen-bal',
    naam: 'Stompen terwijl je eigen bal in de lucht hangt',
    categorieen: ['warming-up', 'spelletjes'],
    uitleg:
      'De keeper gooit zijn eigen bal hoog op. Terwijl die in de lucht hangt, krijgt hij ballen van links, uit het midden en van rechts, die hij met twee vuisten terugstompt naar de gooier. Daarna vangt hij zijn eigen bal voordat die de grond raakt. Lukt het, dan de volgende keer lager opgooien.',
    organisatie: 'Drie gooiers in een halve cirkel op 4–5 m (trainer in het midden, twee keepers opzij), elk met een bal.',
    benodigdheden: ['4 ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Eigen bal recht en hoog omhoog, dan meteen naar de eerste gooier kijken', 'Stompen met twee vuisten tegen elkaar, armen strekken naar de bal', 'Op tijd terugkijken naar je eigen bal'],
    variaties: { makkelijker: ['Twee gooiers', 'Eigen bal mag één keer stuiten'], moeilijker: ['Gooiers kiezen zelf de volgorde', 'Stompen met één vuist', 'Eigen bal lager opgooien'] },
    tekening: {
      ...leeg(16, 14),
      objecten: [
        keeper('k1', 1, 8, 5, { kijkrichting: 90 }),
        keeper('k2', 2, 4.2, 8.2, { kijkrichting: -40 }),
        trainer(8.2, 9.8),
        keeper('k3', 3, 12, 8.2, { kijkrichting: -140 }),
        bal('b0', 8, 5, 'k1'),
        bal('b2', 4.5, 7.95, 'k2'),
        bal('b1', 8.2, 9.4, 't1'),
        bal('b3', 11.7, 7.95, 'k3'),
      ],
      animatie: [
        pauze(0.4),
        stap(
          { type: 'pass', van: 'k1', naar: 'k1', bal: 'b0', worp: 'onderhands', hoogte: 9.5 },
          { type: 'pass', van: 'k2', naar: [7.4, 5.6], bal: 'b2', worp: 'bovenhands', hoogte: 2.2, eindHoogte: 1.9, uitkomen: 'k1', stompNaar: [4.4, 7.6], start: 0.3 },
          { type: 'pass', van: 't1', naar: [8.1, 5.8], bal: 'b1', worp: 'bovenhands', hoogte: 2.2, eindHoogte: 1.9, uitkomen: 'k1', stompNaar: [8.4, 9.2], start: 0.8 },
          { type: 'pass', van: 'k3', naar: [8.6, 5.6], bal: 'b3', worp: 'bovenhands', hoogte: 2.2, eindHoogte: 1.9, uitkomen: 'k1', stompNaar: [11.8, 7.6], start: 1.3 },
        ),
        pauze(0.8),
      ],
    },
  },
];

zet('keepers', oefeningen);
