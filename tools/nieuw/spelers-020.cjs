// Nieuwe spelersoefeningen (0.20.0). Draaien: node tools/nieuw/spelers-020.cjs — zet of vervangt ze (op id) in
// src/data/oefeningen/veld/<eerste categorie>.json. Daarna npm test en tools/e2e/nieuw.mjs.
const { zet } = require('./hulp.cjs');

const sp = (id, team, nummer, x, y, kijk) => ({ id, soort: 'speler', team, nummer, x, y, ...(kijk !== undefined ? { kijkrichting: kijk } : {}) });
const bal = (id, x, y, bij) => ({ id, soort: 'bal', x, y, ...(bij ? { bij } : {}) });
const pion = (id, x, y) => ({ id, soort: 'pion', x, y });
const klein = (id, x, y, hoek = 0) => ({ id, soort: 'klein-goal', x, y, ...(hoek ? { hoek } : {}) });
const pauze = (duur) => ({ duur, acties: [] });
const stap = (...acties) => ({ acties });

const oefeningen = [
  // 1. 1 tegen 1 door de poortjes
  {
    id: 'veld-pv-1-1-poortjes',
    naam: '1 tegen 1 door de poortjes',
    categorieen: ['partijvormen'],
    uitleg:
      'Aan beide uiteinden staat een klein goaltje met een poortje ervoor. A speelt de bal over naar B en gaat meteen verdedigen. B moet eerst door één van de poortjes dribbelen en mag daarna op beide goaltjes scoren. Na je beurt sluit je aan bij de andere rij.',
    organisatie: 'Vak van 20 × 26 m met aan de korte kanten een klein goaltje en 4 m ervoor een poortje van 2,5 m. Twee rijen op de middenlijn, aan beide zijlijnen; de rij links heeft de ballen.',
    benodigdheden: ['2 kleine goaltjes', '4 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 2,
    keepersNodig: 0,
    doorwisselbaar: true,
    coachpunten: ['Aanvaller: kies snel een poortje en neem de bal mee in de looprichting', 'Verdediger: snel aansluiten, de korte weg naar het poortje dicht', 'Na het poortje: kijk welk goaltje open is'],
    variaties: { makkelijker: ['Bredere poortjes', 'Verdediger start een tel later'], moeilijker: ['Na het poortje alleen scoren op het verste goaltje', 'Pass over de grond in de lucht: eerst aannemen onder druk'] },
    tekening: {
      veld: { type: 'leeg', breedte: 22, lengte: 27 },
      camera: 'schuin',
      objecten: [
        klein('kg1', 11, 0.8),
        klein('kg2', 11, 26.2, 180),
        pion('p1', 9.7, 5.2),
        pion('p2', 12.3, 5.2),
        pion('p3', 9.7, 21.8),
        pion('p4', 12.3, 21.8),
        sp('a1', 'A', 1, 0, 0),
        sp('a2', 'A', 2, 0, 0),
        sp('b1', 'B', 3, 0, 0),
        sp('b2', 'B', 4, 0, 0),
        bal('bal1', 1.6, 13.5, 'a1'),
        bal('bal2', 1.6, 13.5, 'a2'),
      ],
      rijen: [
        { id: 'rA', x: 1.2, y: 13.5, richting: 180, spelers: ['a1', 'a2'] },
        { id: 'rB', x: 20.8, y: 13.5, richting: 0, spelers: ['b1', 'b2'] },
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'a1', naar: 'b1' }),
        stap({ type: 'dribbel', wie: 'b1', naar: [14.2, 9.6] }, { type: 'loop', wie: 'a1', naar: [8.4, 12.4], manier: 'sprint', start: 0.1 }),
        stap({ type: 'dribbel', wie: 'b1', via: [[11.2, 6.8]], naar: [11, 3.6], manier: 'sprint' }, { type: 'druk', wie: 'a1', op: 'b1', afstand: 2, start: 0.2 }),
        stap({ type: 'schot', van: 'b1', naar: [11.5, 0.2] }),
        pauze(0.3),
        stap({ type: 'loop', wie: 'b1', naar: [7.4, 4] }, { type: 'loop', wie: 'a1', naar: [14.2, 8.6] }),
        stap({ type: 'aansluiten', wie: 'a1', rij: 'rB' }, { type: 'aansluiten', wie: 'b1', rij: 'rA' }),
        // Volgende beurt: nu door het andere poortje.
        stap({ type: 'pass', van: 'a2', naar: 'b2' }),
        stap({ type: 'dribbel', wie: 'b2', naar: [14.2, 17.4] }, { type: 'loop', wie: 'a2', naar: [8.4, 14.6], manier: 'sprint', start: 0.1 }),
        stap({ type: 'dribbel', wie: 'b2', via: [[11.2, 20.2]], naar: [11, 23.4], manier: 'sprint' }, { type: 'druk', wie: 'a2', op: 'b2', afstand: 2, start: 0.2 }),
        stap({ type: 'schot', van: 'b2', naar: [10.5, 26.8] }),
        pauze(0.8),
      ],
    },
  },

  // 2. Wippen en 1 tegen 1
  {
    id: 'veld-pv-wippen-1-1',
    naam: 'Wippen en 1 tegen 1',
    categorieen: ['partijvormen'],
    uitleg:
      'Klein veldje met twee kleine goaltjes. A staat op de middenlijn met de bal, B bij zijn eigen goaltje. A speelt B rustig in; B probeert de bal direct over A heen in het goaltje van A te wippen (punt). Meteen daarna speelt de trainer vanaf de zijkant een tweede bal in en spelen ze 1 tegen 1.',
    organisatie: 'Veldje van 16 × 22 m met aan beide korte kanten een klein goaltje. A op de middenlijn, B bij zijn goaltje, trainer met ballen langs de zijlijn op de middenlijn.',
    benodigdheden: ['2 kleine goaltjes', 'Ballen', 'Hesjes'],
    spelersNodig: 2,
    keepersNodig: 0,
    doorwisselbaar: true,
    coachpunten: ['Wippen: standbeen naast de bal, onder de bal door met de wreef, kort uithalen', 'A: na de pass niet te dicht op B gaan staan', 'Bij de tweede bal: wie is er het eerst?'],
    variaties: { makkelijker: ['Wippen met de bal eerst aannemen', 'Groter goaltje'], moeilijker: ['Wippen alleen met het zwakke been', 'Trainer speelt de tweede bal in de voeten van A'] },
    tekening: {
      veld: { type: 'leeg', breedte: 18, lengte: 23 },
      camera: 'schuin',
      objecten: [
        klein('kgA', 9, 0.8),
        klein('kgB', 9, 22.2, 180),
        sp('a1', 'A', 1, 9, 11, 90),
        sp('b1', 'B', 2, 9, 19.6, -90),
        { id: 't1', soort: 'trainer', x: 17.6, y: 12, kijkrichting: 180 },
        bal('bal1', 9, 11.4, 'a1'),
        bal('bal2', 17.2, 12, 't1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'a1', naar: 'b1' }),
        stap({ type: 'schot', van: 'b1', naar: [9.3, 0.3], hoogte: 'hoog', direct: true }),
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: [10.6, 15.2] }, { type: 'loop', wie: 'b1', naar: [10.4, 16.2], manier: 'sprint', start: 0.2 }, { type: 'loop', wie: 'a1', naar: [9.4, 13.2], manier: 'sprint', start: 0.4 }),
        stap({ type: 'dribbel', wie: 'b1', naar: [11.6, 12.2] }, { type: 'druk', wie: 'a1', op: 'b1', afstand: 1.9 }),
        stap({ type: 'schijn', wie: 'b1', kant: 'links' }),
        stap({ type: 'dribbel', wie: 'b1', via: [[12.8, 8.4]], naar: [10.8, 4.6], manier: 'sprint' }, { type: 'druk', wie: 'a1', op: 'b1', afstand: 2.2, start: 0.3 }),
        stap({ type: 'schot', van: 'b1', naar: [8.6, 0.3] }),
        pauze(0.8),
      ],
    },
  },

  // 3. Oplopend overtal: 1v1, 2v1, 3v2, 3v3
  {
    id: 'veld-pv-oplopend-overtal',
    naam: 'Oplopend overtal: 1v1, 2v1, 3v2, 3v3',
    categorieen: ['partijvormen'],
    uitleg:
      'Eén doorlopende actie. De trainer speelt aanvaller 1 in: 1 tegen 1. Dan komt er van de ene kant een aanvaller bij (2 tegen 1), daarna van de andere kant nog een aanvaller en een verdediger (3 tegen 2). Met een zesde speler komt er ook nog een tweede verdediger bij: 3 tegen 3. De aanvallers proberen te scoren voordat de verdediging compleet is.',
    organisatie: 'Vak van 30 × 30 m met een goal (zonder keeper of met keeper). Aanvaller 1 tegenover verdediger 1 in het midden, de bijkomers op de zijlijnen. Trainer met ballen achter de aanvallers.',
    benodigdheden: ['Goal (of klein goal)', 'Ballen', 'Hesjes', '4 pionnen'],
    spelersNodig: 5,
    keepersNodig: 0,
    doorwisselbaar: true,
    coachpunten: ['Aanvallers: snel spelen, het overtal gebruiken voordat de volgende verdediger er is', 'Bijkomers: diep starten en breed blijven', 'Verdedigers: tijd winnen, de middenweg dicht'],
    variaties: { makkelijker: ['Bijkomers starten eerder', 'Verdediger 2 komt pas na 5 tellen'], moeilijker: ['Met de zesde speler direct 3 tegen 3', 'Na balverovering mogen de verdedigers op twee kleine goaltjes counteren'] },
    tekening: {
      veld: { type: 'leeg', breedte: 30, lengte: 32 },
      camera: 'schuin',
      objecten: [
        { id: 'g1', soort: 'goal', x: 15, y: 0.5, breedte: 5, hoogte: 2 },
        sp('a1', 'A', 1, 15, 22, -90),
        sp('b1', 'B', 2, 15, 12, 90),
        sp('a2', 'A', 3, 2, 18, 0),
        sp('a3', 'A', 4, 28, 18, 180),
        sp('b2', 'B', 5, 28, 8, 180),
        { id: 't1', soort: 'trainer', x: 15, y: 30.5, kijkrichting: -90 },
        bal('bal1', 15, 30.1, 't1'),
      ],
      animatie: [
        pauze(0.3),
        stap({ type: 'pass', van: 't1', naar: 'a1' }),
        // 1 tegen 1
        stap({ type: 'dribbel', wie: 'a1', naar: [15, 17.6] }, { type: 'druk', wie: 'b1', op: 'a1', afstand: 2.2 }),
        // 2 tegen 1: aanvaller 2 komt van links
        stap({ type: 'loop', wie: 'a2', naar: [7.6, 15], manier: 'sprint' }, { type: 'dribbel', wie: 'a1', naar: [16.8, 18.2], start: 0.2 }),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'b1', naar: [11.6, 12.4], start: 0.2 }),
        // 3 tegen 2: aanvaller 3 en verdediger 2 komen van rechts
        stap({ type: 'dribbel', wie: 'a2', naar: [9.4, 11.6] }, { type: 'loop', wie: 'a3', naar: [22, 11.6], manier: 'sprint' }, { type: 'loop', wie: 'b2', naar: [19.8, 7.4], manier: 'sprint' }, { type: 'loop', wie: 'a1', naar: [15.4, 12.6], manier: 'sprint' }, { type: 'druk', wie: 'b1', op: 'a2', afstand: 2.1 }),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }),
        stap({ type: 'dribbel', wie: 'a3', naar: [20.6, 7.8] }, { type: 'druk', wie: 'b2', op: 'a3', afstand: 2.2 }),
        stap({ type: 'pass', van: 'a3', naar: 'a1' }, { type: 'loop', wie: 'a1', naar: [15.6, 7], manier: 'sprint' }),
        stap({ type: 'schot', van: 'a1', naar: [16.2, 0.1], direct: true }),
        pauze(0.9),
      ],
    },
  },

  // 4. 2 tegen 1 met inhalende verdediger
  {
    id: 'veld-pv-2-1-inhalende-verdediger',
    naam: '2 tegen 1 met inhalende verdediger',
    categorieen: ['partijvormen'],
    uitleg:
      'Aan beide kanten staan twee kleine goaltjes. Verdediger 1 staat tussen zijn goaltjes en speelt een van de twee aanvallers in die bij de andere goaltjes staan. Op het moment van de pass rent verdediger 2 vanaf de zijlijn om een goaltje heen en verdedigt in de rug. Spelen de aanvallers het 2 tegen 1 niet snel uit, dan wordt het 2 tegen 2.',
    organisatie: 'Vak van 22 × 28 m met aan beide korte kanten twee kleine goaltjes. Verdediger 1 tussen zijn goaltjes, de aanvallers bij de andere goaltjes, verdediger 2 op de zijlijn naast de aanvallers.',
    benodigdheden: ['4 kleine goaltjes', 'Ballen', 'Hesjes'],
    spelersNodig: 4,
    keepersNodig: 0,
    doorwisselbaar: true,
    coachpunten: ['Aanvallers: snel naar voren, de verdediger laten kiezen en dan afspelen', 'Verdediger 1: tijd winnen tot je teamgenoot er is', 'Verdediger 2: kortste weg terug, in de rug van de balbezitter'],
    variaties: { makkelijker: ['Verdediger 2 start later', 'Groter vak'], moeilijker: ['Verdediger 2 start dichterbij', 'Aanvallers maximaal 3 balcontacten per persoon'] },
    tekening: {
      veld: { type: 'leeg', breedte: 22, lengte: 29 },
      camera: 'schuin',
      objecten: [
        klein('kB1', 6, 0.8),
        klein('kB2', 16, 0.8),
        klein('kA1', 6, 28.2, 180),
        klein('kA2', 16, 28.2, 180),
        sp('b1', 'B', 1, 11, 2.6, 90),
        sp('a1', 'A', 2, 6, 25.4, -90),
        sp('a2', 'A', 3, 16, 25.4, -90),
        sp('b2', 'B', 4, 21.4, 26.4, 180),
        bal('bal1', 11, 3, 'b1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'b1', naar: 'a1' }, { type: 'loop', wie: 'b2', via: [[19.4, 30.2], [12.6, 30.2]], naar: [11.6, 26.2], manier: 'sprint', start: 0.1 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [8.4, 17], manier: 'sprint' }, { type: 'loop', wie: 'a2', naar: [15.2, 16.4], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [10.6, 10.8], manier: 'sprint' }, { type: 'loop', wie: 'b2', naar: [11.2, 21.2], manier: 'sprint' }),
        stap({ type: 'druk', wie: 'b1', op: 'a1', afstand: 2.4 }, { type: 'loop', wie: 'a2', naar: [15.6, 12.6], manier: 'sprint' }, { type: 'loop', wie: 'b2', naar: [12.2, 16], manier: 'sprint' }),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }),
        stap({ type: 'dribbel', wie: 'a2', naar: [15.8, 4.6], manier: 'sprint' }, { type: 'druk', wie: 'b2', op: 'a2', afstand: 2.3 }),
        stap({ type: 'schot', van: 'a2', naar: [16.4, 0.3] }),
        pauze(0.8),
      ],
    },
  },
];

const goal = { id: 'g1', soort: 'goal', x: 34, y: 0 };
const keeper = { id: 'k1', soort: 'keeper', nummer: 1, x: 34, y: 1.5, verdedigt: 'g1' };

const deel2 = [
  // 5. Rondo 4 tegen 2 met uitbraak
  {
    id: 'veld-ps-rondo-4-2-uitbraak',
    naam: 'Rondo 4 tegen 2 met uitbraak',
    categorieen: ['positiespel', 'afwerken'],
    uitleg:
      'Rondo 4 tegen 2 in een vak voor het doel. Na 8 passes zonder balverlies wordt de spits in de diepte gestuurd; hij rondt af op de keeper. Winnen de verdedigers de bal, dan mogen zij scoren op een mini-goal achter het vak.',
    organisatie: 'Vak van 10 × 10 m op ± 28 m van het doel, mini-goal 4 m achter het vak. De spits wacht schuin voor het vak, aan de kant van het doel. Groot doel met keeper.',
    benodigdheden: ['Goal', '1 mini-goal', '4 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 7,
    keepersNodig: 1,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: twee rondo’s naast elkaar die om de beurt de spits aanspelen, of twee spitsen.',
    coachpunten: ['Rondo: open staan, de bal over de grond en in één of twee keer', 'Steekpass in de loop van de spits, niet op zijn voeten', 'Spits: op het juiste moment starten (niet te vroeg), afronden in de hoek'],
    variaties: { makkelijker: ['Na 5 passes de spits', 'Rondo 5 tegen 2'], moeilijker: ['Rondo 4 tegen 3', 'Een verdediger mag de spits volgen'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 20, y: -3, breedte: 28, lengte: 43 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper,
        { id: 'z1', soort: 'zone', x: 34, y: 28, breedte: 10, lengte: 10 },
        klein('mg', 34, 37.4, 180),
        sp('a1', 'A', 7, 29, 28, 0),
        sp('a2', 'A', 8, 34, 23.4, 90),
        sp('a3', 'A', 10, 39, 28, 180),
        sp('a4', 'A', 6, 34, 32.6, -90),
        sp('a9', 'A', 9, 38.2, 17.6, 90),
        sp('b1', 'B', 4, 32.4, 26.6),
        sp('b2', 'B', 5, 35.8, 29.6),
        bal('bal1', 29.4, 28, 'a1'),
      ],
      animatie: [
        pauze(0.3),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'b1', naar: [32.6, 25.6], start: 0.2 }),
        stap({ type: 'pass', van: 'a2', naar: 'a3', direct: true }, { type: 'loop', wie: 'b2', naar: [36.8, 27.8], start: 0.2 }),
        stap({ type: 'pass', van: 'a3', naar: 'a4' }, { type: 'loop', wie: 'b1', naar: [33.6, 28.6], start: 0.2 }),
        stap({ type: 'pass', van: 'a4', naar: 'a1', direct: true }, { type: 'loop', wie: 'b2', naar: [35.4, 30.6], start: 0.2 }),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'b1', naar: [32.4, 26.2], start: 0.2 }),
        // De spits start, steekpass in de diepte.
        stap({ type: 'loop', wie: 'a9', naar: [36.2, 12.8], manier: 'sprint' }, { type: 'pass', van: 'a2', naar: 'a9', start: 0.35 }),
        stap({ type: 'dribbel', wie: 'a9', naar: [35.4, 9.6] }),
        stap({ type: 'schot', van: 'a9', naar: [31.4, -0.5], afloop: 'goal' }),
        pauze(1),
      ],
    },
  },

  // 6. Golven: 1v1, 2v1, 3v2
  {
    id: 'veld-pv-golven',
    naam: 'Golven: 1v1, 2v1, 3v2',
    categorieen: ['partijvormen', 'afwerken'],
    uitleg:
      'Aanvallen in losse golven die steeds groter worden: eerst 1 tegen 1, dan 2 tegen 1, dan 3 tegen 2, steeds op het doel met keeper. Na elke golf lopen de spelers terug en schuiven de volgende door. Anders dan bij het oplopend overtal (één doorlopende actie) begint elke golf opnieuw vanaf de startlijn.',
    organisatie: 'Startlijn op 30 m van het doel, verdedigers op 18 m. Groot doel met keeper. Aanvallers en verdedigers schuiven na elke golf door.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 5,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Snel naar voren en de verdediger laten kiezen', 'In overtal: de vrije man op het juiste moment aanspelen', 'Verdedigers: vertragen, de middenweg dicht en samenwerken'],
    variaties: { makkelijker: ['Verdedigers starten verder weg', 'Alleen 1 tegen 1 en 2 tegen 1'], moeilijker: ['Na elke golf direct de volgende (geen rust)', 'Verdedigers mogen na balverovering scoren op twee kleine goaltjes'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 18, y: -3, breedte: 32, lengte: 37 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper,
        sp('a1', 'A', 7, 34, 30, -90),
        sp('a2', 'A', 9, 28, 31, -90),
        sp('a3', 'A', 11, 40, 31, -90),
        sp('b1', 'B', 4, 34, 18, 90),
        sp('b2', 'B', 5, 30.6, 17.4, 90),
        bal('bal1', 34, 29.6, 'a1'),
        bal('bal2', 28.4, 31, 'a2'),
        bal('bal3', 26.6, 31.4),
      ],
      animatie: [
        pauze(0.3),
        // Golf 1: 1 tegen 1.
        stap({ type: 'dribbel', wie: 'a1', naar: [34.4, 22] }, { type: 'druk', wie: 'b1', op: 'a1', afstand: 2.3, start: 0.3 }),
        stap({ type: 'schijn', wie: 'a1', kant: 'links' }),
        stap({ type: 'dribbel', wie: 'a1', via: [[38.4, 17.8]], naar: [36.6, 12.4], manier: 'sprint' }, { type: 'druk', wie: 'b1', op: 'a1', afstand: 2.4, start: 0.3 }),
        stap({ type: 'schot', van: 'a1', naar: [31.2, -0.5], afloop: 'goal' }),
        pauze(0.4),
        // Terug; golf 2: 2 tegen 1.
        stap({ type: 'loop', wie: 'a1', via: [[43, 20]], naar: [43, 31] }, { type: 'loop', wie: 'b1', naar: [24.4, 15.6] }),
        stap({ type: 'dribbel', wie: 'a2', naar: [30, 22] }, { type: 'loop', wie: 'a3', naar: [39.6, 21.4], manier: 'sprint' }, { type: 'druk', wie: 'b2', op: 'a2', afstand: 2.4, start: 0.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }),
        stap({ type: 'dribbel', wie: 'a3', naar: [37.4, 13] }, { type: 'loop', wie: 'b2', naar: [33.2, 15.4], start: 0.2 }),
        stap({ type: 'schot', van: 'a3', naar: [31.6, -0.5], afloop: 'vangt' }),
        pauze(0.4),
        // Terug; golf 3: 3 tegen 2.
        stap({ type: 'loop', wie: 'a2', via: [[24, 24]], naar: [27.4, 32.6] }, { type: 'loop', wie: 'a3', via: [[44, 18]], naar: [40, 31] }, { type: 'loop', wie: 'b2', naar: [30.6, 17.4] }, { type: 'loop', wie: 'b1', via: [[28.6, 11.8], [34.6, 12.6]], naar: [37, 18] }, { type: 'pass', van: 'k1', naar: [44.6, 24], worp: 'onderhands' }),
        stap({ type: 'pak', wie: 'a2' }),
        stap({ type: 'dribbel', wie: 'a2', naar: [29.6, 23.6] }, { type: 'loop', wie: 'a1', naar: [35, 22.8], manier: 'sprint' }, { type: 'loop', wie: 'a3', naar: [41.2, 22.4], manier: 'sprint' }, { type: 'druk', wie: 'b2', op: 'a2', afstand: 2.4, start: 0.3 }),
        stap({ type: 'pass', van: 'a2', naar: 'a1' }, { type: 'loop', wie: 'b1', naar: [35.4, 19.4], start: 0.2 }),
        stap({ type: 'pass', van: 'a1', naar: 'a3', direct: true }),
        stap({ type: 'dribbel', wie: 'a3', naar: [39.6, 14.6] }),
        stap({ type: 'schot', van: 'a3', naar: [36.6, -0.5], afloop: 'goal' }),
        pauze(0.9),
      ],
    },
  },

  // 7. Kaatsen met verdediger in de rug
  {
    id: 'veld-af-kaatsen-verdediger-rug',
    naam: 'Kaatsen met verdediger in de rug',
    categorieen: ['afwerken'],
    uitleg:
      'De spits staat met een verdediger in zijn rug. Hij krijgt de bal van de aangever en kaatst direct terug, draait weg van zijn verdediger, krijgt de bal in de diepte en rondt af op de keeper.',
    organisatie: 'Spits op 19 m van het doel met de verdediger vlak achter zich, aangever met ballen op 30 m. Groot doel met keeper. Na elke actie wisselen de rollen.',
    benodigdheden: ['Goal', 'Ballen', 'Hesjes'],
    spelersNodig: 3,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Spits: eerst contact maken met de verdediger, dan pas de bal vragen', 'Kaatsen in één keer, over de grond, terug in de voeten', 'Wegdraaien naar de kant waar de verdediger niet staat, en versnellen'],
    variaties: { makkelijker: ['Verdediger speelt half mee', 'Spits mag de bal eerst aannemen'], moeilijker: ['Verdediger mag vol meedoen', 'Afronden binnen 3 tellen na de steekpass'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 22, y: -3, breedte: 24, lengte: 37 },
      camera: 'schuin',
      objecten: [goal, keeper, sp('a9', 'A', 9, 34, 19, 90), sp('b4', 'B', 4, 33.4, 17.2, 90), sp('a6', 'A', 6, 34.6, 30.4, -90), bal('bal1', 34.6, 30, 'a6')],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'a6', naar: 'a9' }),
        stap({ type: 'pass', van: 'a9', naar: 'a6', direct: true }),
        stap({ type: 'loop', wie: 'a9', via: [[37, 19.4]], naar: [38.8, 13.8], manier: 'sprint' }, { type: 'pass', van: 'a6', naar: 'a9', start: 0.55 }, { type: 'loop', wie: 'b4', naar: [35.4, 14.2], manier: 'sprint', start: 0.35 }),
        stap({ type: 'dribbel', wie: 'a9', naar: [38.4, 9.8], manier: 'sprint' }, { type: 'druk', wie: 'b4', op: 'a9', afstand: 2.2 }),
        stap({ type: 'schot', van: 'a9', naar: [31.6, -0.5], afloop: 'goal' }),
        pauze(1),
      ],
    },
  },

  // 8. Positiespel 3 tegen 3 + 3 naar de spits
  {
    id: 'veld-ps-3-3-3-spits',
    naam: 'Positiespel 3 tegen 3 + 3 naar de spits',
    categorieen: ['positiespel', 'afwerken'],
    uitleg:
      'Drie teams van drie in een vak. Het team met de bal speelt samen met het neutrale team (6 tegen 3) tegen het derde team. Na 6 passes mag de bal in de spits, die buiten het vak staat en afrondt op de keeper. Verliest een team de bal, dan wordt het team dat de bal verovert het balbezittende team.',
    organisatie: 'Vak van 16 × 16 m op ± 22 m van het doel. Drie teams van drie in verschillende hesjes, spits tussen het vak en het doel. Groot doel met keeper.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen', '3 kleuren hesjes'],
    spelersNodig: 10,
    keepersNodig: 1,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 4 tegen 4 + 4, of twee spitsen die om de beurt mogen.',
    coachpunten: ['Breed en diep staan: het vak groot maken', 'Kijk voor je de bal krijgt: waar is de vrije man, waar is de spits?', 'Spits: in beweging blijven en vrij lopen op het moment van de zesde pass'],
    variaties: { makkelijker: ['Na 4 passes de spits', 'Neutrale spelers mogen niet verdedigd worden'], moeilijker: ['Maximaal twee balcontacten', 'Een verdediger bij de spits'] },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 21, y: -3, breedte: 26, lengte: 44 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper,
        { id: 'z1', soort: 'zone', x: 34, y: 30, breedte: 16, lengte: 16 },
        sp('a1', 'A', 2, 27.4, 24.2, 30),
        sp('a2', 'A', 3, 40.6, 24.2, 150),
        sp('a3', 'A', 4, 34, 36.8, -90),
        sp('c1', 'C', 5, 34, 23, 90),
        sp('c2', 'C', 6, 40.8, 32.4, 180),
        sp('c3', 'C', 7, 27.2, 32.4, 0),
        sp('b1', 'B', 8, 33.4, 28.4, -90),
        sp('b2', 'B', 9, 37.2, 30.4, -90),
        sp('b3', 'B', 10, 30.4, 30.6, -90),
        sp('a9', 'A', 11, 38.2, 14.4, 90),
        bal('bal1', 40.4, 24.6, 'a2'),
      ],
      animatie: [
        pauze(0.3),
        stap({ type: 'pass', van: 'a2', naar: 'c2' }, { type: 'loop', wie: 'b2', naar: [38.2, 29.6], start: 0.2 }),
        stap({ type: 'pass', van: 'c2', naar: 'a3' }, { type: 'loop', wie: 'b2', naar: [36.6, 32.6], start: 0.2 }),
        stap({ type: 'pass', van: 'a3', naar: 'c3' }, { type: 'loop', wie: 'b3', naar: [29.6, 31.6], start: 0.2 }),
        stap({ type: 'pass', van: 'c3', naar: 'a1' }, { type: 'loop', wie: 'b3', naar: [29.4, 27.6], start: 0.2 }),
        stap({ type: 'pass', van: 'a1', naar: 'c1' }, { type: 'loop', wie: 'b1', naar: [32.4, 25.6], start: 0.2 }),
        stap({ type: 'pass', van: 'c1', naar: 'a2' }, { type: 'loop', wie: 'b1', naar: [37.2, 26.6], start: 0.2 }, { type: 'loop', wie: 'a9', naar: [37, 16.4], start: 0.2 }),
        // Zes passes: nu de spits.
        stap({ type: 'pass', van: 'a2', naar: 'a9' }),
        stap({ type: 'dribbel', wie: 'a9', naar: [36, 11.6] }),
        stap({ type: 'schot', van: 'a9', naar: [37, -0.5], afloop: 'goal' }),
        pauze(1),
      ],
    },
  },
];

zet('veld', [...oefeningen, ...deel2]);
