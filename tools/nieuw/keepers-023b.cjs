// Keeperoefeningen 0.23.0, deel 2: bal verwerken en duiken (B11–B24). Draaien: node tools/nieuw/keepers-023b.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, bal, pion, hoedje, paaltje, pop, horde, pauze, stap, terug, KLEUR, keeperVeld } = require('./bouwstenen.cjs');

const gooi = (van, naar, eind = 1.8, extra = {}) => stap({ type: 'pass', van, naar, worp: 'bovenhands', hoogte: eind + 0.5, eindHoogte: eind, ...extra });
const terugGooi = (van, naar) => stap({ type: 'pass', van, naar, worp: 'onderhands', hoogte: 1.6 });
const op = (wie = 'k1') => stap({ type: 'opstaan', wie });
const naar = (x, y, manier = 'voetenwerk', extra = {}) => stap({ type: 'loop', wie: 'k1', naar: [x, y], manier, ...extra });
const wissel = (k1Naar, kxVia, kx, doel = [34, 1.6], k1Via) =>
  stap({ type: 'loop', wie: 'k1', ...(k1Via ? { via: [k1Via] } : {}), naar: k1Naar }, { type: 'loop', wie: kx, via: [kxVia], naar: doel, start: 0.3 });

const oefeningen = [
  // B11 Vier laag, vier hoog
  {
    id: 'keeper-ld-vier-laag-vier-hoog',
    naam: 'Vier laag, vier hoog',
    categorieen: ['laag-duiken', 'bal-verwerken'],
    uitleg:
      'Eerst vier lage ballen, om en om links en rechts: duiken, vangen en de bal vanaf de grond meteen terugspelen naar de trainer, dan opstaan en terug naar het midden. Daarna vier ballen op hoofdhoogte vangen en terugspelen.',
    organisatie: 'Keeper midden in het doel, 1,6 m voor de lijn. Trainer met ballen op 8–9 m.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Lage duik: eerst laag, dan zijwaarts vallen met de handen naar de bal',
      'Vanaf de grond terugspelen: rustig en zuiver, dan pas opstaan',
      'Hoofdhoogte: W-greep, bal even vasthouden',
    ],
    variaties: {
      makkelijker: ['Twee laag, twee hoog', 'Lage ballen rollend'],
      moeilijker: ['Lage ballen verder van de keeper', 'Trainer kiest de kant pas op het laatst', 'Hoge ballen naast het hoofd'],
    },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 13 }),
      objecten: [goal, keeper('k1', 1, 34, 1.6), trainer(34.4, 8.6), bal('b1', 34.4, 8.2, 't1')],
      animatie: [
        pauze(0.4),
        ...[32.2, 35.8, 32.2, 35.8].flatMap((x) => [
          stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'grond', duikNaar: [x, 1.8] }),
          pauze(0.3),
          terugGooi('k1', 't1'),
          op(),
          naar(34, 1.6),
        ]),
        ...[0, 1, 2, 3].flatMap(() => [gooi('t1', 'k1'), pauze(0.25), terugGooi('k1', 't1')]),
        pauze(0.4),
      ],
    },
  },

  // B12 Vangen en laag duiken om de beurt
  {
    id: 'keeper-bv-vangen-laag-om-beurt',
    naam: 'Vangen en laag duiken om de beurt',
    categorieen: ['bal-verwerken', 'laag-duiken'],
    uitleg:
      'De keeper vangt een bal op hoofdhoogte van de trainer en gooit terug. Dan krijgt hij een lage bal rechts van zich van keeper 2: duiken, vangen, opstaan en terug. Opnieuw een bal op hoofdhoogte van de trainer, en dan een lage bal links van zich van keeper 3. Daarna wisselen de keepers door.',
    organisatie: 'Trainer recht voor het doel op 9 m, keeper 2 schuin rechts en keeper 3 schuin links op ± 8 m, elk met een bal.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Na elke bal terug naar het midden en in basishouding', 'Lage bal: niet op de knieën vallen maar op de zij', 'Kijk al naar de volgende aangever terwijl je terugspeelt'],
    variaties: { makkelijker: ['Lage ballen rollen', 'Meer tijd tussen de ballen'], moeilijker: ['Aangevers kiezen de volgorde', 'Lage ballen harder', 'Hoge bal naast het hoofd'] },
    tekening: {
      ...keeperVeld({ x: 23, y: -3, breedte: 22, lengte: 14 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.6),
        trainer(34.4, 9.2),
        keeper('k2', 2, 39.8, 7.6, { kijkrichting: -125 }),
        keeper('k3', 3, 28.2, 7.6, { kijkrichting: -55 }),
        bal('b1', 34.4, 8.8, 't1'),
        bal('b2', 39.55, 7.3, 'k2'),
        bal('b3', 28.45, 7.3, 'k3'),
      ],
      animatie: [
        pauze(0.4),
        gooi('t1', 'k1'),
        pauze(0.25),
        terugGooi('k1', 't1'),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 'grond', duikNaar: [35.8, 1.8] }),
        pauze(0.4),
        op(),
        terug('k1', 'k2'),
        naar(34, 1.6),
        gooi('t1', 'k1'),
        pauze(0.25),
        terugGooi('k1', 't1'),
        stap({ type: 'schot', van: 'k3', naar: 'k1', worp: 'trap', hoogte: 'grond', duikNaar: [32.2, 1.8] }),
        pauze(0.4),
        op(),
        terug('k1', 'k3'),
        pauze(0.3),
        wissel([27.6, 6.2], [31.8, 6.8], 'k3', [34, 1.6], [29.4, 2.0]),
        pauze(0.5),
      ],
    },
  },

  // B13 Drie duiken, drie aangevers
  {
    id: 'keeper-ld-drie-duiken-aangevers',
    naam: 'Drie duiken, drie aangevers',
    categorieen: ['laag-duiken', 'hoog-duiken'],
    uitleg:
      'Drie aangevers, drie duiken direct na elkaar: eerst een lage bal links, dan een halfhoge bal rechts en tot slot een hoge bal rechts. Na elke duik meteen opstaan en terug naar het midden voor de volgende. Daarna wisselt de keeper met een aangever.',
    organisatie: 'Aangevers op 8–9 m: schuin links (keeper), midden (trainer) en schuin rechts (keeper), elk met een bal.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 3,
    doorwisselbaar: true,
    coachpunten: ['Snel opstaan via de knieën, meteen weer in basishouding', 'Halfhoog en hoog: afzetten met het been aan de balkant', 'Handen achter de bal, bal naar je toe klemmen bij de landing'],
    variaties: { makkelijker: ['Twee duiken', 'Meer tijd tussen de ballen'], moeilijker: ['Volgorde door elkaar', 'Ballen verder van de keeper', 'Na de hoge duik nog een lage bal links'] },
    tekening: {
      ...keeperVeld({ x: 23, y: -3, breedte: 22, lengte: 14 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.6),
        keeper('k2', 2, 29.0, 8.4, { kijkrichting: -60 }),
        trainer(34.4, 9.4),
        keeper('k3', 3, 39.4, 8.4, { kijkrichting: -120 }),
        bal('b2', 29.25, 8.1, 'k2'),
        bal('b1', 34.4, 9.0, 't1'),
        bal('b3', 39.15, 8.1, 'k3'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 'grond', duikNaar: [32.2, 1.8] }),
        pauze(0.4),
        op(),
        terug('k1', 'k2'),
        naar(34, 1.6),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1.6, eindHoogte: 1.0, duikNaar: [35.9, 1.6], duikHoogte: 1.0 }),
        pauze(0.5),
        op(),
        terugGooi('k1', 't1'),
        naar(34, 1.6),
        stap({ type: 'schot', van: 'k3', naar: 'k1', worp: 'volley', hoogte: 2.6, eindHoogte: 1.9, duikNaar: [36.0, 1.2], duikHoogte: 1.9 }),
        pauze(0.7),
        op(),
        terugGooi('k1', 'k3'),
        pauze(0.3),
        wissel([39.0, 6.8], [36.6, 6.0], 'k3', [34, 1.6], [37.4, 2.6]),
        pauze(0.5),
      ],
    },
  },

  // B14 Vangen, zijwaarts, om de pion en terug
  {
    id: 'keeper-bv-vangen-volley-pion-afstand',
    naam: 'Vangen, zijwaarts, om de pion en terug',
    categorieen: ['bal-verwerken', 'laag-duiken'],
    uitleg:
      'De keeper vangt een harde bal van de trainer en gooit terug. Dan stapt hij uit naar een volley en vangt die. Zijwaarts naar rechts schept hij een rollende bal op, gooit terug en loopt met een boog om een pion terug het doel in. Daar komt een afstandsschot van keeper 2.',
    organisatie: 'Trainer met ballen op 9 m, pion 3,5 m rechts voor het doel, keeper 2 met een bal op 16 m.',
    benodigdheden: ['Goal', 'Pion', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: [
      'Harde bal: lichaam achter de bal, handen eerst',
      'Rollende bal opscheppen: door de knieën, handen samen achter de bal',
      'Boog om de pion zo klein mogelijk en op tijd terug in basishouding voor het afstandsschot',
    ],
    variaties: { makkelijker: ['Zonder volley', 'Afstandsschot op het lichaam'], moeilijker: ['Afstandsschot halfhoog in de hoek', 'Rollende bal verder weg', 'Volley harder'] },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 22 }),
      objecten: [
        goal,
        pion('p1', 37.6, 3.6),
        keeper('k1', 1, 34, 1.6),
        trainer(37.2, 8.6, -110),
        bal('b1', 37.05, 8.25, 't1'),
        keeper('k2', 2, 33.6, 16.0, { kijkrichting: -90 }),
        bal('b2', 33.6, 15.6, 'k2'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 1.3, eindHoogte: 1.1, snelheid: 16 }),
        pauze(0.25),
        terugGooi('k1', 't1'),
        naar(34, 4.0),
        stap({ type: 'schot', van: 't1', naar: 'k1', worp: 'volley', hoogte: 1.8, eindHoogte: 1.3 }),
        pauze(0.25),
        terugGooi('k1', 't1'),
        stap({ type: 'loop', wie: 'k1', naar: [35.8, 4.0], manier: 'zijwaarts', kijk: 90 }, { type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'grond', start: 0.3 }),
        pauze(0.25),
        terugGooi('k1', 't1'),
        stap({ type: 'loop', wie: 'k1', om: 'p1', kant: 'links', straal: 0.8, naar: [34, 1.6], manier: 'sprint' }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.7], manier: 'voetenwerk', duur: 0.4 }),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 1.5, eindHoogte: 1.0 }),
        pauze(0.4),
        terugGooi('k1', 'k2'),
        pauze(0.4),
      ],
    },
  },

  // B15 Paal tikken en twee poppen
  {
    id: 'keeper-bv-paal-twee-poppen',
    naam: 'Paal tikken en twee poppen',
    categorieen: ['bal-verwerken', 'laag-duiken', 'hoog-duiken'],
    uitleg:
      'De keeper gaat zijwaarts naar de linkerpaal en tikt die aan. Dan terug en een paar meter uit om de hoek te verkleinen: daar vangt hij een bal op hoofdhoogte van de trainer. Daarna een lage bal langs de linker pop (duiken naar links) en een hoge bal langs de rechter pop (hoog duiken naar rechts).',
    organisatie: 'Twee poppen 5,5 m uit elkaar, 4,6 m voor het doel. Trainer met ballen op 10 m, recht voor het doel.',
    benodigdheden: ['Goal', '2 poppen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Hoek verkleinen: op de lijn bal–midden van het doel uitkomen',
      'Bal achter een pop: pas laat zien, dus blijf laag en reageer op de bal',
      'Hoog: afzetten met het been aan de balkant, handen achter de bal',
    ],
    variaties: { makkelijker: ['Zonder poppen', 'Hoge bal halfhoog'], moeilijker: ['Trainer kiest welke pop', 'Na het aantikken direct de lage bal', 'Ballen dichter langs de poppen'] },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 15 }),
      objecten: [goal, pop('pL', 31.2, 4.6), pop('pR', 36.8, 4.6), keeper('k1', 1, 34, 1.4), trainer(34.4, 10.2), bal('b1', 34.4, 9.8, 't1')],
      animatie: [
        pauze(0.4),
        stap({ type: 'loop', wie: 'k1', naar: [30.95, 0.7], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'aantikken', wie: 'k1', punt: [30.34, 0.05] }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 2.6], manier: 'voetenwerk' }),
        gooi('t1', 'k1'),
        pauze(0.25),
        terugGooi('k1', 't1'),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [32.2, 2.4] }),
        pauze(0.4),
        op(),
        terugGooi('k1', 't1'),
        naar(34, 2.4),
        stap({ type: 'schot', van: 't1', naar: 'k1', worp: 'volley', hoogte: 2.6, eindHoogte: 1.9, duikNaar: [35.9, 2.0], duikHoogte: 1.9 }),
        pauze(0.7),
        op(),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // B16 Zigzag vooruit en achteruit
  {
    id: 'keeper-ld-zigzag-voor-achteruit',
    naam: 'Zigzag vooruit en achteruit',
    categorieen: ['laag-duiken', 'hoog-duiken'],
    uitleg:
      'Drie paaltjes staan achter elkaar voor het doel. De keeper zigzagt er vooruit tussendoor en krijgt aan het eind een halfhoge bal naar links: duiken en vangen. Opstaan, bal terug en dan zigzag achteruit terug naar het doel, met het gezicht naar het veld. Daar komt een bal naar rechts: weer duiken.',
    organisatie: 'Drie paaltjes op 1,4 m achter elkaar, vanaf 3 m voor het doel. Trainer met ballen op 13 m.',
    benodigdheden: ['Goal', '3 paaltjes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Kleine snelle pasjes rond de paaltjes, schouders naar de trainer',
      'Achteruit: gewicht op de voorvoeten, niet achteroverleunen',
      'Halfhoog: afzetten en het lijf strekken naar de bal',
    ],
    variaties: { makkelijker: ['Twee paaltjes', 'Ballen laag'], moeilijker: ['Paaltjes dichter op elkaar', 'Trainer kiest de kant pas op het laatst', 'Hoge bal bij de tweede duik'] },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 19 }),
      objecten: [goal, paaltje('q1', 34, 3.0), paaltje('q2', 34, 4.4), paaltje('q3', 34, 5.8), keeper('k1', 1, 34, 1.6), trainer(34.4, 13.2), bal('b1', 34.4, 12.8, 't1')],
      animatie: [
        pauze(0.4),
        stap({
          type: 'loop',
          wie: 'k1',
          via: [
            [34.85, 3.0],
            [33.15, 4.4],
            [34.85, 5.8],
          ],
          naar: [34, 7.0],
          manier: 'voetenwerk',
          kijk: 90,
        }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1.6, eindHoogte: 1.0, duikNaar: [32.2, 7.0], duikHoogte: 1.0 }),
        pauze(0.5),
        op(),
        terugGooi('k1', 't1'),
        naar(34, 7.0),
        stap({
          type: 'loop',
          wie: 'k1',
          via: [
            [33.15, 5.8],
            [34.85, 4.4],
            [33.15, 3.0],
          ],
          naar: [34, 1.6],
          manier: 'achteruit',
        }),
        stap({ type: 'schot', van: 't1', naar: 'k1', worp: 'volley', hoogte: 1.6, eindHoogte: 0.9, duikNaar: [35.9, 1.6], duikHoogte: 0.9 }),
        pauze(0.5),
        op(),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // B17 Skip, lage duik en tussen de palen
  {
    id: 'keeper-ld-skip-duik-tussen-palen',
    naam: 'Skip, lage duik en tussen de palen',
    categorieen: ['laag-duiken', 'bal-verwerken'],
    uitleg:
      'De keeper gaat zijwaarts langs een rij paaltjes, met korte huppelpasjes. Aan het eind krijgt hij een lage bal: duiken en vangen. Opstaan, bal terug, en dan vooruit tussen twee paaltjes door, waar hij een bal op hoofdhoogte vangt.',
    organisatie: 'Drie paaltjes op een rij, 1,6 m uit elkaar, 3,4 m voor het doel. Trainer met ballen op 10 m.',
    benodigdheden: ['Goal', '3 paaltjes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Zijwaarts op de voorvoeten, niet kruisen', 'Na de laatste paal laag blijven: de bal komt direct', 'Tussen de paaltjes door: rechte lijn, stilstaan voor de bal'],
    variaties: { makkelijker: ['Lage bal rollend', 'Zonder huppelpasjes'], moeilijker: ['Lage bal verder weg', 'Bal tussen de paaltjes halfhoog naast het lichaam', 'Twee rondes zonder pauze'] },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 15 }),
      objecten: [goal, paaltje('q1', 31.8, 3.4), paaltje('q2', 33.4, 3.4), paaltje('q3', 35.0, 3.4), keeper('k1', 1, 30.6, 2.6, { kijkrichting: 90 }), trainer(34.4, 10.2), bal('b1', 34.4, 9.8, 't1')],
      animatie: [
        pauze(0.4),
        stap({ type: 'loop', wie: 'k1', naar: [36.0, 2.6], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [37.4, 2.2] }),
        pauze(0.4),
        op(),
        terugGooi('k1', 't1'),
        naar(34.2, 2.4),
        naar(34.2, 4.5),
        gooi('t1', 'k1'),
        pauze(0.25),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // B18 Zijwaarts naar de paal, duiken naar de andere kant
  {
    id: 'keeper-ld-paal-duik-andere-kant',
    naam: 'Zijwaarts naar de paal, duiken naar de andere kant',
    categorieen: ['laag-duiken'],
    uitleg:
      'De keeper gaat zijwaarts naar de linkerpaal en krijgt dan een lage bal naar rechts: duiken, vangen, opstaan en achteruit terug naar het midden. Dan gespiegeld: zijwaarts naar de rechterpaal en duiken naar links. Dat is één ronde; doe er twee.',
    organisatie: 'Keeper midden in het doel, 1,4 m voor de lijn. Trainer met ballen op 9 m.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Bij de paal: stilstaan en zetten voor de bal komt', 'Afzetten met het been aan de duikkant, schuin naar voren duiken', 'Achteruit terug met het gezicht naar het veld'],
    variaties: { makkelijker: ['Minder ver naar de paal', 'Rollende ballen'], moeilijker: ['Bal halfhoog', 'Trainer gooit al terwijl de keeper nog onderweg is', 'Drie rondes achter elkaar'] },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 13 }),
      objecten: [goal, keeper('k1', 1, 34, 1.4), trainer(34.4, 9.2), bal('b1', 34.4, 8.8, 't1')],
      animatie: [
        pauze(0.4),
        ...[
          [31.6, 33.6],
          [36.4, 34.4],
        ].flatMap(([paal, duik]) => [
          stap({ type: 'loop', wie: 'k1', naar: [paal, 1.4], manier: 'zijwaarts', kijk: 90 }),
          stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [duik, 1.7] }),
          pauze(0.4),
          op(),
          terugGooi('k1', 't1'),
          stap({ type: 'loop', wie: 'k1', naar: [34, 1.4], manier: 'achteruit' }),
        ]),
        pauze(0.4),
      ],
    },
  },

  // B19 Rondje om het hoedje
  {
    id: 'keeper-ld-rondje-hoedje',
    naam: 'Rondje om het hoedje',
    categorieen: ['laag-duiken'],
    uitleg:
      'De keeper draait een snel rondje om een hoedje vlak voor hem en krijgt meteen daarna een lage bal: duiken en vangen. Opstaan, terug en opnieuw. In de tweede beurt komt de bal met een stuit.',
    organisatie: 'Hoedje 1 m voor de keeper, 3 m voor het doel. Trainer met ballen op 8 m.',
    benodigdheden: ['Goal', 'Hoedje', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Rondje klein en snel, op de voorvoeten', 'Na het rondje eerst stilstaan in basishouding', 'Stuitbal: niet te vroeg duiken, wacht op de opsprong'],
    variaties: { makkelijker: ['Rondje lopen, dan pauze', 'Rollende bal'], moeilijker: ['Twee rondjes', 'Trainer gooit al tijdens het rondje', 'Ballen verder weg'] },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 12 }),
      objecten: [goal, hoedje('h1', 34, 3.2), keeper('k1', 1, 34, 2.2), trainer(34.4, 8.6), bal('b1', 34.4, 8.2, 't1')],
      animatie: [
        pauze(0.4),
        stap({ type: 'loop', wie: 'k1', om: 'h1', straal: 0.8, naar: [34, 2.2], manier: 'voetenwerk' }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [32.3, 2.2] }),
        pauze(0.4),
        op(),
        terugGooi('k1', 't1'),
        naar(34, 2.2),
        stap({ type: 'loop', wie: 'k1', om: 'h1', kant: 'rechts', straal: 0.8, naar: [34, 2.2], manier: 'voetenwerk' }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 1.0, stuitOp: [35.2, 4.2], eindHoogte: 0.4, duikNaar: [35.7, 2.2] }),
        pauze(0.4),
        op(),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // B20 Halfknielend vangen, pion, hoge duik
  {
    id: 'keeper-hd-halfknie-pion-hoog',
    naam: 'Halfknielend vangen, pion, hoge duik',
    categorieen: ['hoog-duiken', 'bal-verwerken'],
    uitleg:
      'De keeper zit halfknielend voor het doel en vangt een hoge bal van de trainer. Bal terug, opstaan en een pion links van hem aantikken. Dan met drie snelle passen naar rechts en een hoge duik naar een bal in de rechterhoek.',
    organisatie: 'Keeper halfknielend 2 m voor het doel, pion 1 m links van hem. Trainer met ballen op 9 m.',
    benodigdheden: ['Goal', 'Pion', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Halfknielend: rug recht, handen voor het lijf, vangen boven het hoofd',
      'Opstaan en aantikken in één vloeiende beweging',
      'Drie passen, dan afzetten met het rechterbeen en hoog uitstrekken',
    ],
    variaties: {
      makkelijker: ['Bal op borsthoogte', 'Twee passen en een halfhoge duik'],
      moeilijker: ['Knie wisselen: andere knie op de grond', 'Trainer kiest de hoek pas na het aantikken', 'Bal hoog in de verre hoek'],
    },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 13 }),
      objecten: [goal, pion('p1', 33.0, 2.9), keeper('k1', 1, 34, 2.0, { houding: 'halfknie' }), trainer(34.4, 9.2), bal('b1', 34.4, 8.8, 't1')],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 2.0, eindHoogte: 1.5 }),
        pauze(0.3),
        terugGooi('k1', 't1'),
        op(),
        naar(33.7, 2.4, 'voetenwerk', { duur: 0.4 }),
        stap({ type: 'aantikken', wie: 'k1', doel: 'p1' }),
        naar(35.4, 1.9, 'voetenwerk'),
        stap({ type: 'schot', van: 't1', naar: 'k1', worp: 'volley', hoogte: 2.6, eindHoogte: 1.9, duikNaar: [37.0, 1.3], duikHoogte: 1.9 }),
        pauze(0.7),
        op(),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // B21 Hoge hordes, slalom en paal
  {
    id: 'keeper-hd-hordes-slalom-paal',
    naam: 'Hoge hordes, slalom en paal',
    categorieen: ['hoog-duiken'],
    uitleg:
      'De keeper springt over twee hoge hordes, slalomt om twee pionnen en loopt dan achteruit, met het gezicht naar het veld, naar de linkerpaal. Hij tikt de paal aan en duikt meteen hoog naar de andere kant, naar een bal van de trainer.',
    organisatie: 'Parcours voor de linkerkant van het doel: twee hordes van 45 cm, daarachter twee pionnen. Trainer met ballen op 9 m, recht voor het doel.',
    benodigdheden: ['Goal', '2 hoge hordes', '2 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Over de hordes: knieën hoog, armen mee', 'Achteruit naar de paal: kleine pasjes, blijf naar de trainer kijken', 'Na het aantikken eerst zetten, dan krachtig afzetten'],
    variaties: { makkelijker: ['Lage hordes', 'Halfhoge bal'], moeilijker: ['Drie hordes', 'Bal in de verre hoek', 'Trainer gooit al tijdens het aantikken'] },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 16 }),
      objecten: [
        goal,
        horde('h1', 30.0, 9.6, 0, 0.45),
        horde('h2', 30.0, 8.4, 0, 0.45),
        pion('p1', 30.0, 6.8),
        pion('p2', 30.0, 5.4),
        keeper('k1', 1, 30.0, 11.0, { kijkrichting: -90 }),
        trainer(34.6, 9.6),
        bal('b1', 34.6, 9.2, 't1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'loop', wie: 'k1', naar: [30.0, 7.6], manier: 'hordes' }),
        stap({
          type: 'loop',
          wie: 'k1',
          via: [
            [30.85, 6.8],
            [29.15, 5.4],
          ],
          naar: [30.0, 4.4],
          manier: 'voetenwerk',
        }),
        stap({ type: 'loop', wie: 'k1', naar: [30.85, 0.7], manier: 'achteruit' }),
        stap({ type: 'aantikken', wie: 'k1', punt: [30.34, 0.05] }),
        stap({ type: 'schot', van: 't1', naar: 'k1', worp: 'volley', hoogte: 2.6, eindHoogte: 1.9, duikNaar: [32.9, 1.0], duikHoogte: 1.9 }),
        pauze(0.7),
        op(),
        terugGooi('k1', 't1'),
        pauze(0.5),
      ],
    },
  },

  // B22 Kleur roepen en powerduik
  {
    id: 'keeper-hd-kleur-powerduik',
    naam: 'Kleur roepen en powerduik',
    categorieen: ['hoog-duiken', 'reactie'],
    uitleg:
      'Drie gekleurde hoedjes liggen voor het doel. De trainer roept een kleur; de keeper sprint naar dat hoedje, zet krachtig af en duikt hoog naar een bal van de trainer. De volgende kleur roept de trainer al terwijl de keeper nog ligt: opstaan en meteen weer. Drie keer achter elkaar.',
    organisatie: 'Rood links, blauw rechts en geel in het midden, ± 2,5 m voor het doel. Trainer met ballen op 10 m.',
    benodigdheden: ['Goal', '3 gekleurde hoedjes', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Bij het hoedje: laatste pas kort, dan krachtig afzetten', 'Hoog en ver uitstrekken, handen achter de bal', 'Bij de landing de bal klemmen, dan snel opstaan via de knieën'],
    variaties: { makkelijker: ['Twee hoedjes', 'Rustpauze na elke duik'], moeilijker: ['Vier kleuren', 'Trainer roept twee kleuren na elkaar', 'Bal net buiten bereik: tippen in plaats van vangen'] },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 15 }),
      objecten: [
        goal,
        hoedje('hR', 32.0, 3.4, KLEUR.rood),
        hoedje('hB', 36.0, 3.4, KLEUR.blauw),
        hoedje('hG', 34.0, 4.6, KLEUR.geel),
        keeper('k1', 1, 34, 1.6),
        trainer(34.4, 10.2),
        bal('b1', 34.4, 9.8, 't1'),
      ],
      animatie: [
        pauze(0.4),
        ...[
          [32.6, 2.8, 30.9, 2.2, null],
          [35.4, 2.8, 37.1, 2.2, null],
          [34.6, 4.0, 32.8, 4.0, [35.0, 2.4]],
        ].flatMap(([x, y, dx, dy, via], i) => [
          stap({ type: 'loop', wie: 'k1', ...(via ? { via: [via] } : {}), naar: [x, y], manier: 'sprint' }),
          stap({ type: 'schot', van: 't1', naar: 'k1', worp: 'volley', hoogte: 2.6, eindHoogte: 1.9, duikNaar: [dx, dy], duikHoogte: 1.9 }),
          pauze(0.5),
          op(),
          ...(i < 2 ? [terugGooi('k1', 't1')] : [terugGooi('k1', 't1'), pauze(0.4)]),
        ]),
      ],
    },
  },

  // B23 Twee pionnen en achteruit terug
  {
    id: 'keeper-re-pion-voet-achteruit',
    naam: 'Twee pionnen en achteruit terug',
    categorieen: ['reactie', 'laag-duiken'],
    uitleg:
      'Voor de keeper staan een rode en een blauwe pion. De trainer roept een kleur: de keeper loopt naar die pion en tikt hem aan met de voet. Daarna achteruit terug naar het doel, met het gezicht naar het veld, en dan komt er een hard schot: vangen of duiken.',
    organisatie: 'Rode pion links en blauwe pion rechts, 4 m voor het doel en 3 m uit elkaar. Trainer met ballen op 11 m.',
    benodigdheden: ['Goal', '2 gekleurde pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Reageren op de kleur, niet raden', 'Achteruit: kleine pasjes en het gewicht naar voren', 'Op tijd stilstaan voor het schot komt'],
    variaties: {
      makkelijker: ['Trainer wijst de kleur ook aan', 'Schot op het lichaam'],
      moeilijker: ['Drie of vier pionnen', 'Schot al tijdens het achteruitlopen', 'Aantikken met de hand en de voet om en om'],
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 16 }),
      objecten: [goal, pion('pR', 32.5, 4.0, KLEUR.rood), pion('pB', 35.5, 4.0, KLEUR.blauw), keeper('k1', 1, 34, 1.6), trainer(34.4, 11.4), bal('b1', 34.4, 11.0, 't1')],
      animatie: [
        pauze(0.4),
        ...[
          ['pR', 32.9, 3.4, [32.9, 1.7]],
          ['pB', 35.1, 3.4, null],
        ].flatMap(([p, x, y, duik]) => [
          naar(x, y, 'sprint'),
          stap({ type: 'aantikken', wie: 'k1', doel: p, met: 'voet' }),
          stap({ type: 'loop', wie: 'k1', naar: [34, 1.6], manier: 'achteruit' }),
          stap({ type: 'schot', van: 't1', naar: 'k1', ...(duik ? { hoogte: 'grond', duikNaar: duik } : { hoogte: 1.3, eindHoogte: 1.1, snelheid: 16 }) }),
          pauze(0.4),
          ...(duik ? [op()] : []),
          terugGooi('k1', 't1'),
        ]),
        pauze(0.4),
      ],
    },
  },

  // B24 Opstaan vanuit buiklig en de verre paal
  {
    id: 'keeper-hd-buiklig-verre-paal',
    naam: 'Opstaan vanuit buiklig en de verre paal',
    categorieen: ['hoog-duiken', 'reactie'],
    uitleg:
      'De keeper ligt op zijn buik bij de linkerpaal, met zijn hoofd naar het veld. Op een signaal staat hij zo snel mogelijk op, sprint naar de verre paal en valt daar een hoge bal van de trainer aan: in de sprong vangen. Daarna vanaf de andere paal: weer op de buik, opstaan en naar de andere kant, nu met een hoge duik.',
    organisatie: 'Keeper op zijn buik bij de paal. Trainer met ballen op 9 m, recht voor het doel; hij gooit hoog naar de verre paal zodra de keeper opstaat.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Opstaan: handen onder de schouders, in één beweging omhoog',
      'Sprinten met de ogen op de bal',
      'Hoge bal aanvallen: afzetten op één been, de andere knie omhoog, op het hoogste punt vangen',
    ],
    variaties: { makkelijker: ['Beginnen in kniezit', 'Bal lager en dichter bij de keeper'], moeilijker: ['Signaal is een kleur of nummer', 'Beginnen op de rug', 'Bal net onder de lat: tippen'] },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 13 }),
      objecten: [goal, keeper('k1', 1, 31.2, 1.6, { houding: 'buik', kijkrichting: 90 }), trainer(34.4, 9.4), bal('b1', 34.4, 9.0, 't1')],
      animatie: [
        pauze(0.8),
        op(),
        stap({ type: 'loop', wie: 'k1', naar: [36.4, 1.4], manier: 'sprint' }, { type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 3.2, eindHoogte: 2.4, start: 0.2 }),
        pauze(0.4),
        terugGooi('k1', 't1'),
        stap({ type: 'zitten', wie: 'k1', houding: 'buik' }),
        pauze(0.8),
        op(),
        stap(
          { type: 'loop', wie: 'k1', naar: [32.2, 1.5], manier: 'sprint' },
          { type: 'schot', van: 't1', naar: 'k1', worp: 'volley', hoogte: 2.7, eindHoogte: 2.0, duikNaar: [30.9, 1.1], duikHoogte: 2.0, start: 0.6 },
        ),
        pauze(0.7),
        op(),
        terugGooi('k1', 't1'),
        pauze(0.4),
      ],
    },
  },
];

zet('keepers', oefeningen);
