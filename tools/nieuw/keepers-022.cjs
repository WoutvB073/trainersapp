// Keeperoefeningen 0.22.0: aangepast (zelfde id) en nieuw. Draaien: node tools/nieuw/keepers-022.cjs — zet of vervangt
// ze (op id) in src/data/oefeningen/keepers/<eerste categorie>.json. Weghalen gaat met tools/nieuw/archiveer.cjs.
const { zet } = require('./hulp.cjs');

const goal = { id: 'g1', soort: 'goal', x: 34, y: 0 };
const keeper = (id, nr, x, y, extra = {}) => ({ id, soort: 'keeper', nummer: nr, x, y, ...extra });
const trainer = (x, y, kijk = -90) => ({ id: 't1', soort: 'trainer', x, y, kijkrichting: kijk });
const bal = (id, x, y, bij) => ({ id, soort: 'bal', x, y, ...(bij ? { bij } : {}) });
const pion = (id, x, y) => ({ id, soort: 'pion', x, y });
const pauze = (duur) => ({ duur, acties: [] });
const stap = (...acties) => ({ acties });
const terug = (van, naar) => stap({ type: 'pass', van, naar, worp: 'onderhands', hoogte: 'grond' });

const oefeningen = [
  // A2.1 Ballen met een stuit → combinatievorm
  {
    id: 'keeper-bv-stuitballen',
    naam: 'Zijwaarts, stuitbal en lage bal',
    categorieen: ['bal-verwerken', 'laag-duiken'],
    uitleg:
      'De keeper gaat zijwaarts langs twee pionnen naar de andere kant van het doel. Daar gooit de trainer een bal met een stuit op hem af: de keeper pakt hem achter de stuit, rolt hem terug en krijgt direct een lage bal naar de andere kant, waar hij naartoe duikt. Opstaan, terugrollen en de volgende serie de andere kant op.',
    organisatie: 'Twee pionnen 3 m uit elkaar, 3,4 m voor de doellijn. De keeper begint naast de linkerpion; de trainer staat met ballen op 9–10 m.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Zijwaarts met kleine pasjes, voeten niet kruisen, schouders naar de trainer',
      'Stuitbal: lichaam achter de bal, handen laag en de bal tegen je borst klemmen',
      'Na het terugrollen meteen weer in basishouding: de lage bal komt direct',
    ],
    variaties: {
      makkelijker: ['Stuitbal hoger laten opspringen', 'Lage bal pas na een korte pauze'],
      moeilijker: ['Pionnen verder uit elkaar', 'Trainer kiest pas op het laatst de kant van de lage bal', 'Stuitbal harder en dichter bij de keeper laten stuiten'],
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 25, y: -3, breedte: 18, lengte: 15 },
      camera: 'schuin',
      objecten: [goal, pion('p1', 32.5, 3.4), pion('p2', 35.5, 3.4), keeper('k1', 1, 31.8, 2.6, { kijkrichting: 90 }), trainer(34.6, 10.2), bal('b1', 34.6, 9.8, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [36.1, 2.6], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'bovenhands', hoogte: 1.2, stuitOp: [35.9, 5.0], eindHoogte: 0.9 }),
        pauze(0.4),
        terug('k1', 't1'),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'grond', duikNaar: [33.9, 2.2] }),
        pauze(0.6),
        stap({ type: 'opstaan', wie: 'k1' }),
        terug('k1', 't1'),
        stap({ type: 'loop', wie: 'k1', naar: [36.1, 2.6], manier: 'zijwaarts', kijk: 90 }),
        pauze(0.5),
      ],
    },
  },

  // A2.2 Laag duiken: kniezit, hurkzit, stand (samengevoegd, nieuw id; de drie losse gaan naar het archief)
  {
    id: 'keeper-ld-kniezit-hurkzit-stand',
    naam: 'Laag duiken: kniezit, hurkzit, stand',
    categorieen: ['laag-duiken', 'warming-up'],
    uitleg:
      'Opbouwend laag duiken in drie beginhoudingen: eerst vanuit kniezit, dan vanuit hurkzit en tot slot vanuit stand. Per serie: een lage bal naar de ene kant (duiken en vangen), opstaan, de bal terugrollen, een sprint om de pion en terug naar het doel, en direct een tweede lage bal naar de andere kant.',
    organisatie: 'Keeper midden in het doel, 1,7 m voor de doellijn. Pion 5 m voor het doel, iets naar links. Trainer met ballen op 9 m. Elke houding een paar keer, dan de volgende.',
    benodigdheden: ['Goal', 'Pion', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Vallen op de zij, niet op de buik of de ellebogen', 'Handen eerst naar de bal: één hand achter, één hand bovenop', 'Na de sprint eerst stil in basishouding, dan pas de tweede bal'],
    variaties: {
      makkelijker: ['Alleen de kniezit en de hurkzit', 'Zonder sprint om de pion'],
      moeilijker: ['Bal verder van de keeper', 'Tweede bal halfhoog', 'Pion verder weg: minder tijd om in positie te komen'],
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 25, y: -3, breedte: 18, lengte: 15 },
      camera: 'schuin',
      objecten: [goal, pion('p1', 32.6, 5.2), keeper('k1', 1, 34, 1.7, { houding: 'kniezit' }), trainer(35.6, 9.4), bal('b1', 35.6, 9.0, 't1')],
      animatie: ['kniezit', 'hurkzit', 'staan'].flatMap((houding, i) => [
        ...(i === 0 ? [pauze(0.6)] : houding === 'staan' ? [pauze(0.4)] : [stap({ type: 'zitten', wie: 'k1', houding }), pauze(0.3)]),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'grond', duikNaar: [35.7, 1.9] }),
        pauze(0.5),
        stap({ type: 'opstaan', wie: 'k1' }),
        terug('k1', 't1'),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.7], manier: 'sprint', om: 'p1', kant: 'rechts', straal: 0.8 }),
        pauze(0.2),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'grond', duikNaar: [32.3, 1.9] }),
        pauze(0.5),
        stap({ type: 'opstaan', wie: 'k1' }),
        terug('k1', 't1'),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.7], manier: 'voetenwerk' }),
      ]),
    },
  },

  // A2.3 Reflexen: schoten van korte afstand → met de rug naar de trainer, omdraaien op een teken
  {
    id: 'keeper-re-korte-afstand',
    naam: 'Reflexen: omdraaien en schot van dichtbij',
    categorieen: ['reactie'],
    uitleg:
      'De keeper staat met zijn rug naar de trainer, met zijn gezicht naar het doel. Op een teken draait hij om en krijgt hij meteen een schot van dichtbij rond zijn lichaam: links of rechts op heuphoogte, laag naast hem of op borsthoogte. Vangen, terugrollen, weer omdraaien en de volgende.',
    organisatie: 'Keeper 2 m voor de doellijn, rug naar het veld. Trainer met een paar ballen op 5–6 m. Het teken is een roep of een klap.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Snel omdraaien op de voorvoeten en meteen in basishouding',
      'Eerst de bal zien, dan reageren: handen vóór het lichaam',
      'Bal van dichtbij: niet terugdeinzen, naar de bal toe bewegen',
    ],
    variaties: {
      makkelijker: ['Trainer wacht na het teken een tel', 'Schoten alleen op het lichaam'],
      moeilijker: ['Handen voor de ogen en pas op het teken wegnemen', 'Trainer dichterbij (4 m)', 'Twee ballen kort na elkaar'],
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 26, y: -3, breedte: 16, lengte: 12 },
      camera: 'schuin',
      objecten: [goal, keeper('k1', 1, 34, 2.0, { kijkrichting: -90 }), trainer(34.4, 7.4), bal('b1', 34.4, 7.0, 't1')],
      animatie: [
        pauze(0.8),
        stap({ type: 'draai', wie: 'k1', naar: 't1' }, { type: 'schot', van: 't1', naar: 'k1', hoogte: 1.0, eindHoogte: 0.9, start: 0.25 }),
        pauze(0.4),
        terug('k1', 't1'),
        stap({ type: 'draai', wie: 'k1', kijk: -90, duur: 0.6 }),
        pauze(0.8),
        stap({ type: 'draai', wie: 'k1', naar: 't1' }, { type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [32.9, 2.1], start: 0.25 }),
        pauze(0.5),
        stap({ type: 'opstaan', wie: 'k1' }),
        terug('k1', 't1'),
        stap({ type: 'loop', wie: 'k1', naar: [34, 2.0], manier: 'voetenwerk' }),
        stap({ type: 'draai', wie: 'k1', kijk: -90, duur: 0.6 }),
        pauze(0.8),
        stap({ type: 'draai', wie: 'k1', naar: 't1' }, { type: 'schot', van: 't1', naar: 'k1', hoogte: 1.5, eindHoogte: 1.3, start: 0.25 }),
        pauze(0.4),
        terug('k1', 't1'),
        pauze(0.4),
      ],
    },
  },

  // A2.4 Spreidsprong: kaatsen, dan 1 op 1 en blokken
  {
    id: 'keeper-1o1-spreidsprong',
    naam: 'Spreidsprong: kaatsen en dan 1 op 1',
    categorieen: ['een-op-een'],
    uitleg:
      'Keeper en trainer staan allebei schuin aan de zijkant van het doel en kaatsen de bal een paar keer heen en weer (de keeper met de voet). Op een gegeven moment neemt de trainer de bal vooruit aan en gaat hij op het doel af: nu is het 1 op 1. De keeper komt kort uit, zet zich en blokt het schot met een spreidsprong.',
    organisatie: 'Keeper schuin voor de rechterpaal, 2–3 m uit het doel. Trainer schuin op 9–10 m. Na 2–4 keer kaatsen kiest de trainer zelf het moment.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Kaatsen met de binnenkant voet, daarna meteen terug in basishouding',
      'Als de trainer vooruit aanneemt: kort uitkomen, dan stilstaan en zetten',
      'Spreidsprong: armen en benen wijd, zo groot mogelijk maken, ogen open',
    ],
    variaties: {
      makkelijker: ['Trainer roept "nu" als hij vooruit aanneemt', 'Trainer begint verder weg (meer tijd)'],
      moeilijker: ['Trainer mag ook afdraaien en schieten in de verre hoek', 'Kaatsen met wisselende voet en tempo'],
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 26, y: -3, breedte: 20, lengte: 16 },
      camera: 'schuin',
      objecten: [goal, keeper('k1', 1, 36.6, 2.6, { kijkrichting: 55 }), trainer(41.2, 10.4, -120), bal('b1', 41.0, 10.05, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'voet' }),
        stap({ type: 'pass', van: 't1', naar: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'voet' }),
        stap({ type: 'dribbel', wie: 't1', naar: [38.9, 6.4] }, { type: 'loop', wie: 'k1', naar: [37.4, 3.7], manier: 'voetenwerk', start: 0.3 }),
        stap({ type: 'schot', van: 't1', naar: [36.4, 0], hoogte: 0.6, blokt: 'k1', blokSoort: 'ster', afloopNaar: [42.5, 4.5] }),
        pauze(1.2),
      ],
    },
  },

  // A3.1 Drie pionnen en de korte hoek
  {
    id: 'keeper-ld-drie-pionnen-korte-hoek',
    naam: 'Drie pionnen en de korte hoek',
    categorieen: ['laag-duiken', 'hoog-duiken'],
    uitleg:
      'Keeper en trainer staan allebei schuin van het doel. De keeper staat tussen een pion en de paal; naast hem staan drie pionnen, aan de kant weg van de paal. Hij tikt pion 1 aan en duikt meteen terug in de korte hoek (de trainer kiest laag of hoog). Opstaan, bal terug, dan pion 2 aantikken en duiken, en tot slot pion 3. Hoe verder de pion, hoe verder de duik.',
    organisatie: 'Drie pionnen op 0,9 m van elkaar op een lijn naast de keeper, 0,7 m voor zijn looplijn; de eerste 1 m van de paal. Trainer schuin op 8–9 m, aan de kant van de korte hoek.',
    benodigdheden: ['Goal', '3 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Na het aantikken eerst zetten (basishouding), dan pas duiken',
      'Afzetten met het been aan de kant van de paal, schuin naar voren duiken',
      'Korte hoek is de eerste zorg: niets tussen de paal en jou door',
    ],
    variaties: {
      makkelijker: ['Alleen lage ballen', 'Twee pionnen in plaats van drie'],
      moeilijker: ['Pionnen verder uit elkaar', 'Trainer roept de pion: de keeper moet die aantikken', 'Afwisselend laag en hoog zonder aankondiging'],
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 26, y: -3, breedte: 20, lengte: 14 },
      camera: 'schuin',
      objecten: [goal, pion('p1', 35.9, 2.4), pion('p2', 35.0, 2.4), pion('p3', 34.1, 2.4), keeper('k1', 1, 36.8, 1.7, { kijkrichting: 60 }), trainer(40.8, 8.6, -115), bal('b1', 40.6, 8.25, 't1')],
      animatie: [
        pauze(0.5),
        ...[
          ['p1', 35.9, 'grond', null],
          ['p2', 35.0, 1.6, 1.4],
          ['p3', 34.1, 'grond', null],
        ].flatMap(([p, x, hoogte, duikHoogte], i) => [
          stap({ type: 'loop', wie: 'k1', naar: [x, 1.7], manier: 'zijwaarts', kijk: 60 }),
          stap({ type: 'aantikken', wie: 'k1', doel: p }),
          stap({ type: 'loop', wie: 'k1', naar: [x + 0.55, 1.55], manier: 'voetenwerk', duur: 0.4 }),
          stap({
            type: 'schot',
            van: 't1',
            naar: 'k1',
            ...(typeof hoogte === 'number' ? { hoogte, eindHoogte: duikHoogte } : { hoogte }),
            duikNaar: [37.1, 0.8],
            ...(duikHoogte ? { duikHoogte } : {}),
          }),
          pauze(0.5),
          stap({ type: 'opstaan', wie: 'k1' }),
          terug('k1', 't1'),
          ...(i < 2 ? [stap({ type: 'loop', wie: 'k1', naar: [36.8, 1.7], manier: 'voetenwerk' })] : [pauze(0.6)]),
        ]),
      ],
    },
  },

  // A3.2 Horde heen en terug: volley en hoog schot
  {
    id: 'keeper-hd-horde-volley-hoog',
    naam: 'Horde heen en terug: volley en hoog schot',
    categorieen: ['hoog-duiken', 'bal-verwerken'],
    uitleg:
      'De keeper staat midden in het doel. Hij springt zijwaarts over een horde naar één kant en direct terug, en krijgt dan een volley op het lichaam: vangen en teruggooien. Daarna nog een keer over de horde en terug, en dan komt er een hoog schot in die kant van het doel: hoog duiken en vangen.',
    organisatie: 'Lage horde 1,2 m naast het midden van het doel, 1,8 m voor de doellijn. Trainer met ballen op 9–10 m. Om de beurt de horde links en rechts.',
    benodigdheden: ['Goal', 'Lage horde', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Over de horde: kort grondcontact, knieën hoog, schouders naar de trainer',
      'Na de horde meteen in basishouding: de bal komt direct',
      'Hoge duik: afzetten met het been aan de balkant, handen achter de bal',
    ],
    variaties: {
      makkelijker: ['Volley en hoge bal gooien in plaats van trappen', 'Halfhoge bal in plaats van hoog'],
      moeilijker: ['Twee keer heen en terug voor elke bal', 'Hogere horde', 'Trainer kiest pas op het laatst de hoek van het hoge schot'],
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 25, y: -3, breedte: 18, lengte: 15 },
      camera: 'schuin',
      objecten: [goal, { id: 'h1', soort: 'horde', x: 35.2, y: 1.8, hoek: 90, hoogte: 0.3 }, keeper('k1', 1, 34, 1.8, { kijkrichting: 90 }), trainer(34.4, 10.2), bal('b1', 34.4, 9.8, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [36.3, 1.8], manier: 'hordes', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', naar: [34.1, 1.8], manier: 'hordes', kijk: 90 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'volley', hoogte: 1.6, eindHoogte: 1.1 }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
        stap({ type: 'loop', wie: 'k1', naar: [36.3, 1.8], manier: 'hordes', kijk: 90 }),
        stap({ type: 'loop', wie: 'k1', naar: [34.1, 1.8], manier: 'hordes', kijk: 90 }),
        stap({ type: 'schot', van: 't1', naar: 'k1', worp: 'volley', hoogte: 2.6, eindHoogte: 2.0, duikNaar: [36.2, 1.0], duikHoogte: 1.9 }),
        pauze(0.8),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands' }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.8], manier: 'voetenwerk' }),
        pauze(0.5),
      ],
    },
  },

  // A3.3 Schuin, midden, schuin: ballen op het lichaam
  {
    id: 'keeper-bv-schuin-midden-schuin',
    naam: 'Schuin, midden, schuin: ballen op het lichaam',
    categorieen: ['bal-verwerken'],
    uitleg:
      'De keeper begint midden in het doel. Hij komt schuin uit naar de linkerkant en krijgt een schot op het lichaam: vangen en terugrollen. Dan naar het midden voor een schot op het lichaam van de trainer recht voor het doel: vangen en terugrollen. Tot slot schuin uit naar de rechterkant voor een bal op het lichaam van de keeper daar: vangen en terugrollen. Daarna wisselen de keepers door.',
    organisatie:
      'Schutters op ± 9 m: links schuin (keeper), recht voor het doel (trainer) en rechts schuin (keeper), elk met een paar ballen. Met twee keepers neemt de trainer ook de bal van één kant voor zijn rekening.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: [
      'Uitkomen op de lijn bal–midden van het doel, dan stilstaan bij het schot',
      'Bal op het lichaam: lichaam achter de bal, kommetje met de handen',
      'Terugrollen en meteen naar de volgende positie: blijf met je gezicht naar het veld',
    ],
    variaties: {
      makkelijker: ['Ballen gooien in plaats van schieten', 'Meer tijd tussen de ballen'],
      moeilijker: ['Harder en iets naast het lichaam', 'Schutters kiezen zelf de volgorde', 'Na de laatste bal nog een lage bal in de andere hoek'],
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 22, y: -3, breedte: 24, lengte: 16 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.4, { kijkrichting: 90 }),
        keeper('k2', 2, 27.6, 8.6, { kijkrichting: -40 }),
        trainer(34.6, 10.2),
        keeper('k3', 3, 40.4, 8.6, { kijkrichting: -140 }),
        bal('b2', 27.9, 8.3, 'k2'),
        bal('b1', 34.6, 9.8, 't1'),
        bal('b3', 40.1, 8.3, 'k3'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [32.4, 3.0], manier: 'voetenwerk' }),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 1.2, eindHoogte: 0.9 }),
        pauze(0.4),
        terug('k1', 'k2'),
        stap({ type: 'loop', wie: 'k1', naar: [34.1, 2.4], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 1.2, eindHoogte: 1.0 }),
        pauze(0.4),
        terug('k1', 't1'),
        stap({ type: 'loop', wie: 'k1', naar: [35.8, 3.0], manier: 'voetenwerk' }),
        stap({ type: 'schot', van: 'k3', naar: 'k1', worp: 'trap', hoogte: 1.2, eindHoogte: 0.9 }),
        pauze(0.4),
        terug('k1', 'k3'),
        pauze(0.3),
        // Doorwisselen: k1 neemt de plek van k3 over, k3 gaat het doel in.
        stap({ type: 'loop', wie: 'k1', via: [[39.2, 3.0]], naar: [40.0, 7.0] }, { type: 'loop', wie: 'k3', via: [[36.6, 6.6]], naar: [34, 1.4], start: 0.3 }),
        pauze(0.6),
      ],
    },
  },

  // A3.4 Schuin uit, dan twee lage ballen
  {
    id: 'keeper-bv-schuin-twee-lage',
    naam: 'Schuin uit, dan twee lage ballen',
    categorieen: ['bal-verwerken', 'laag-duiken'],
    uitleg:
      'Vanuit het midden komt de keeper schuin uit naar rechts en vangt hij een schot op het lichaam van de trainer. Meteen daarna krijgt hij van een tweede keeper een lage bal links van zich, richting het midden van het doel: duiken en vangen. Opstaan, terugrollen, positie kiezen aan de linkerkant en dan nog een lage bal van de keeper aan de andere kant in de korte hoek links. Daarna wisselen de keepers door.',
    organisatie: 'Trainer schuin rechts op ± 9 m, een keeper recht voor het doel op ± 11 m en een keeper schuin links op ± 9 m, elk met ballen. Met twee keepers neemt de trainer ook de laatste bal.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    doorwisselbaar: true,
    coachpunten: [
      'Uitkomen: kleine pasjes, stilstaan op het moment van het schot',
      'Lage bal: zijwaarts vallen met de handen eerst naar de bal',
      'Na het opstaan meteen positie kiezen voor de korte hoek',
    ],
    variaties: {
      makkelijker: ['Lage ballen gooien in plaats van trappen', 'Meer tijd na het opstaan'],
      moeilijker: ['Lage ballen harder en verder van de keeper', 'Schutters wisselen de volgorde', 'Eerste bal halfhoog naast het lichaam'],
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 22, y: -3, breedte: 24, lengte: 17 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.4, { kijkrichting: 90 }),
        trainer(40.6, 8.8, -135),
        keeper('k2', 2, 34.8, 11.2, { kijkrichting: -90 }),
        keeper('k3', 3, 27.4, 8.8, { kijkrichting: -45 }),
        bal('b1', 40.35, 8.5, 't1'),
        bal('b2', 34.8, 10.85, 'k2'),
        bal('b3', 27.7, 8.5, 'k3'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [35.9, 3.0], manier: 'voetenwerk' }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 1.2, eindHoogte: 1.0 }),
        pauze(0.3),
        terug('k1', 't1'),
        stap({ type: 'schot', van: 'k2', naar: 'k1', worp: 'trap', hoogte: 'grond', duikNaar: [34.2, 2.6] }),
        pauze(0.5),
        stap({ type: 'opstaan', wie: 'k1' }),
        terug('k1', 'k2'),
        stap({ type: 'loop', wie: 'k1', naar: [32.4, 1.9], manier: 'zijwaarts', kijk: 70 }),
        stap({ type: 'schot', van: 'k3', naar: 'k1', worp: 'trap', hoogte: 'grond', duikNaar: [31.0, 1.1] }),
        pauze(0.5),
        stap({ type: 'opstaan', wie: 'k1' }),
        terug('k1', 'k3'),
        pauze(0.3),
        // Doorwisselen: k1 neemt de plek van k3 over, k3 gaat het doel in.
        stap({ type: 'loop', wie: 'k1', via: [[28.4, 2.8]], naar: [27.9, 7.2] }, { type: 'loop', wie: 'k3', via: [[31.6, 6.8]], naar: [34, 1.4], start: 0.3 }),
        pauze(0.6),
      ],
    },
  },
];

zet('keepers', oefeningen);
