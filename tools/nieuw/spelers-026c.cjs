// Spelersoefeningen 0.26.0, deel A4 (14–21, positiespel). Draaien: node tools/nieuw/spelers-026c.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, speler, bal, pion, hoedje, pauze, stap } = require('./bouwstenen.cjs');

const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const zone = (id, x, y, breedte, lengte, kleur) => ({ id, soort: 'zone', x, y, breedte, lengte, ...(kleur ? { kleur } : {}) });
const doeltje = (id, x, y, hoek, breedte = 3) => ({ id, soort: 'klein-goal', x, y, hoek, breedte });
const leeg = (breedte, lengte, camera = 'schuin') => ({ veld: { type: 'leeg', breedte, lengte }, camera });
const BLAUW = '#1c64d8';

const oefeningen = [
  // 14. Positiespel 5 tegen 3
  {
    id: 'veld-ps-5-tegen-3',
    naam: 'Positiespel 5 tegen 3',
    categorieen: ['positiespel'],
    uitleg:
      'Vijf spelers houden de bal in het vak tegen drie verdedigers. Tien keer achter elkaar rondspelen is een punt. Veroveren de verdedigers de bal, dan proberen ze hem over een van de korte zijden te dribbelen: lukt dat, dan is het punt voor hen. Daarna begint het overtal opnieuw.',
    organisatie: 'Vak van 16 × 22 m. Vijf spelers in één kleur, drie verdedigers in hesjes. Rondes van 3 minuten; daarna wisselen drie spelers van rol.',
    benodigdheden: ['4 pionnen', 'Ballen', '3 hesjes'],
    spelersNodig: 8,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 6 tegen 3 in een groter vak, of een tweede vak met dezelfde vorm.',
    coachpunten: ['Maak het vak groot: breed en diep, nooit twee spelers op één lijn', 'Speel naar de speler die het verst van een verdediger staat', 'Verdedigers: samen schuiven, één zet druk en de anderen sluiten de passlijnen'],
    variaties: {
      makkelijker: ['Groter vak (20 × 26 m)', 'Acht passes is een punt'],
      moeilijker: ['Maximaal twee aanrakingen', 'Kleiner vak', 'Verdedigers scoren al door de bal over een zijlijn te spelen'],
    },
    en: {
      naam: 'Possession 5v3',
      uitleg:
        'Five players keep the ball in the area against three defenders. Ten passes in a row is a point. If the defenders win the ball, they try to dribble it over one of the short sides: if they manage it, the point is theirs. Then the overload starts again.',
      organisatie: '16 × 22 m area. Five players in one colour, three defenders in bibs. 3-minute rounds; then three players swap roles.',
      benodigdheden: ['4 cones', 'Balls', '3 bibs'],
      meerSpelers: 'With more players: 6v3 in a bigger area, or a second area with the same game.',
      coachpunten: ['Make the area big: wide and deep, never two players in a line', 'Pass to the player furthest from a defender', 'Defenders: shift together, one presses and the others close the passing lanes'],
      variaties: {
        makkelijker: ['Bigger area (20 × 26 m)', 'Eight passes is a point'],
        moeilijker: ['Two touches maximum', 'Smaller area', 'The defenders already score by playing the ball over a touchline'],
      },
    },
    tekening: {
      ...leeg(20, 26),
      objecten: [
        zone('z', 10, 13, 16, 22),
        pion('p1', 2, 2),
        pion('p2', 18, 2),
        pion('p3', 2, 24),
        pion('p4', 18, 24),
        speler('a1', 1, 5, 6, { kijkrichting: 0 }),
        speler('a2', 2, 15, 6, { kijkrichting: 180 }),
        speler('a3', 3, 4.5, 17, { kijkrichting: -30 }),
        speler('a4', 4, 15.5, 19, { kijkrichting: -120 }),
        speler('a5', 5, 10, 13, { kijkrichting: -90 }),
        B('d1', 6, 8, 10),
        B('d2', 7, 12, 15.5),
        B('d3', 8, 10, 21.5, { kijkrichting: -90 }),
        bal('bal', 5.55, 6, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'druk', wie: 'd1', op: 'a2', afstand: 2, start: 0.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'a4' }, { type: 'dek', wie: 'd2', tussen: ['a4', 'a5'], start: 0.3 }),
        stap({ type: 'pass', van: 'a4', naar: 'a3' }, { type: 'druk', wie: 'd3', op: 'a3', afstand: 2, start: 0.4 }),
        stap({ type: 'pass', van: 'a3', naar: 'a5' }, { type: 'loop', wie: 'd1', naar: [8.4, 8.6], start: 0.2 }),
        stap({ type: 'pass', van: 'a5', naar: 'a1', onderschept: 'd1' }),
        stap({ type: 'dribbel', wie: 'd1', naar: [8.6, 1.2] }, { type: 'druk', wie: 'a5', op: 'd1', afstand: 2, manier: 'sprint', start: 0.2 }),
        pauze(1.0),
      ],
    },
  },

  // 15. Positiespel 4 tegen 4 met doelspelers
  {
    id: 'veld-ps-4-4-doelspelers',
    naam: 'Positiespel 4 tegen 4 met doelspelers',
    categorieen: ['positiespel'],
    uitleg:
      'Vier tegen vier in het vak. Elk team heeft twee doelspelers achter de lijnen: één aan elke kant. Speel je de bal van je ene doelspeler via je teamgenoten naar je andere doelspeler, dan is dat een punt. De speler die de laatste pass gaf, wisselt meteen met die doelspeler: hij gaat achter de lijn staan en de doelspeler komt het vak in.',
    organisatie: 'Vak van 18 × 26 m. Aan beide korte zijden staan twee doelspelers achter de lijn, één van elk team. Rondes van 4 minuten.',
    benodigdheden: ['4 pionnen', 'Ballen', 'Hesjes in 2 kleuren'],
    spelersNodig: 12,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 5 tegen 5 met doelspelers in een groter vak, of een neutrale joker in het vak.',
    coachpunten: ['Doelspeler: kort je lijn op en neer bewegen, zodat je aanspeelbaar blijft', 'In het vak: speel de doelspeler pas in als je ervoor staat, niet met je rug ernaar', 'Na de wissel meteen meedoen: de nieuwe speler moet direct aanspeelbaar zijn'],
    variaties: {
      makkelijker: ['Doelspelers mogen ook binnen het vak lopen', 'Elke pass naar een doelspeler is een punt'],
      moeilijker: ['Doelspelers in één keer', 'Een punt alleen als iedereen in het vak de bal heeft gehad', 'Kleiner vak'],
    },
    en: {
      naam: 'Possession 4v4 with target players',
      uitleg:
        'Four against four in the area. Each team has two target players behind the lines: one at each end. Get the ball from one of your target players, through your teammates, to your other target player and it’s a point. The player who made the last pass swaps straight away with that target player: they go behind the line and the target player comes into the area.',
      organisatie: '18 × 26 m area. At both short ends, two target players stand behind the line, one from each team. 4-minute rounds.',
      benodigdheden: ['4 cones', 'Balls', 'Bibs in 2 colours'],
      meerSpelers: 'With more players: 5v5 with target players in a bigger area, or a neutral joker in the area.',
      coachpunten: ['Target player: shuffle along your line so you stay available', 'In the area: only play into the target player once you are facing them, not with your back to them', 'Join in straight after the swap: the new player has to be available immediately'],
      variaties: {
        makkelijker: ['Target players may also move inside the area', 'Every pass to a target player is a point'],
        moeilijker: ['Target players one touch', 'Only a point once everyone in the area has had the ball', 'Smaller area'],
      },
    },
    tekening: {
      ...leeg(22, 34),
      objecten: [
        zone('z', 11, 17, 18, 26),
        speler('ta1', 1, 8, 2.4, { kijkrichting: 90 }),
        speler('ta2', 2, 14, 31.6, { kijkrichting: -90 }),
        B('tb1', 3, 14, 2.4, { kijkrichting: 90 }),
        B('tb2', 4, 8, 31.6, { kijkrichting: -90 }),
        speler('a1', 5, 6, 9, { kijkrichting: 60 }),
        speler('a2', 6, 16, 12, { kijkrichting: 150 }),
        speler('a3', 7, 7, 21, { kijkrichting: -30 }),
        speler('a4', 8, 15, 25, { kijkrichting: -100 }),
        B('b1', 9, 9, 13.4),
        B('b2', 10, 12.6, 18),
        B('b3', 11, 10, 25.4),
        B('b4', 12, 5, 15),
        bal('bal', 8, 2.95, 'ta1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'ta1', naar: 'a1' }, { type: 'druk', wie: 'b4', op: 'a1', afstand: 2.2, start: 0.4 }),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'druk', wie: 'b2', op: 'a2', afstand: 2.2, start: 0.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'a4' }, { type: 'druk', wie: 'b3', op: 'a4', afstand: 2.2, start: 0.5 }),
        stap({ type: 'pass', van: 'a4', naar: 'ta2' }),
        stap({ type: 'dribbel', wie: 'ta2', naar: [11, 28.6] }, { type: 'loop', wie: 'a4', naar: [16.6, 31.6], start: 0.2 }),
        pauze(1.0),
      ],
    },
  },

  // 16. Positiespel met vier zones
  {
    id: 'veld-ps-vier-zones',
    naam: 'Positiespel met vier zones',
    categorieen: ['positiespel'],
    uitleg:
      'Het vak is verdeeld in vier gelijke zones. Het team met de bal (vier spelers, één per zone) probeert de bal in alle vier de zones te krijgen: lukt dat zonder balverlies, dan is het een punt. Drie verdedigers mogen overal komen. De balbezitters mogen van zone wisselen, zolang er in elke zone iemand blijft.',
    organisatie: 'Vak van 24 × 24 m in vier zones van 12 × 12 m (andere kleur hoedjes of pionnen). Vier spelers tegen drie verdedigers. Rondes van 3 minuten.',
    benodigdheden: ['9 pionnen of hoedjes', 'Ballen', '3 hesjes'],
    spelersNodig: 7,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 5 tegen 3 met een joker die overal mag komen, of 6 tegen 4 in een groter vak.',
    coachpunten: ['Kijk vóór de aanname al welke zone nog ontbreekt', 'Verplaats de bal naar de zone waar de verdedigers het verst vandaan zijn', 'Verdedigers: één zone dichtzetten is vaak genoeg'],
    variaties: {
      makkelijker: ['Twee verdedigers', 'Een punt na drie zones'],
      moeilijker: ['Zones in een vaste volgorde (rondje)', 'Maximaal twee aanrakingen', 'Vier verdedigers'],
    },
    en: {
      naam: 'Possession with four zones',
      uitleg:
        'The area is split into four equal zones. The team in possession (four players, one per zone) tries to get the ball into all four zones: do it without losing the ball and it’s a point. Three defenders can go anywhere. The players in possession may switch zones, as long as there is always someone in every zone.',
      organisatie: '24 × 24 m area in four 12 × 12 m zones (marked with different coloured disc cones or cones). Four players against three defenders. 3-minute rounds.',
      benodigdheden: ['9 cones or disc cones', 'Balls', '3 bibs'],
      meerSpelers: 'With more players: 5v3 with a joker who can go anywhere, or 6v4 in a bigger area.',
      coachpunten: ['Before your first touch, check which zone is still missing', 'Move the ball to the zone furthest from the defenders', 'Defenders: shutting off one zone is often enough'],
      variaties: {
        makkelijker: ['Two defenders', 'A point after three zones'],
        moeilijker: ['Zones in a fixed order (round the square)', 'Two touches maximum', 'Four defenders'],
      },
    },
    tekening: {
      ...leeg(26, 26),
      objecten: [
        zone('z1', 7, 7, 12, 12),
        zone('z2', 19, 7, 12, 12, BLAUW),
        zone('z3', 19, 19, 12, 12),
        zone('z4', 7, 19, 12, 12, BLAUW),
        speler('a1', 1, 6, 6, { kijkrichting: 0 }),
        speler('a2', 2, 19.5, 5, { kijkrichting: 90 }),
        speler('a3', 3, 20, 20, { kijkrichting: 180 }),
        speler('a4', 4, 6, 20, { kijkrichting: -90 }),
        B('d1', 5, 12, 9.4),
        B('d2', 6, 14.4, 15),
        B('d3', 7, 9, 15),
        bal('bal', 6.55, 6, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'druk', wie: 'd1', op: 'a2', afstand: 2.2, start: 0.45 }),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }, { type: 'druk', wie: 'd2', op: 'a3', afstand: 2.2, start: 0.45 }),
        stap({ type: 'pass', van: 'a3', naar: 'a4' }, { type: 'druk', wie: 'd3', op: 'a4', afstand: 2.2, start: 0.45 }),
        stap({ type: 'pass', van: 'a4', naar: 'a1' }, { type: 'loop', wie: 'd1', naar: [11, 9], start: 0.3 }),
        pauze(1.0),
      ],
    },
  },

  // 17. Positiespel 7 tegen 5
  {
    id: 'veld-ps-7-tegen-5-opbouw',
    naam: 'Positiespel 7 tegen 5 met opbouwstructuur',
    categorieen: ['positiespel'],
    uitleg:
      'Zeven tegen vijf met een vaste opbouw: twee centrale verdedigers, twee backs breed, twee middenvelders en een spits aan de overkant. Het overtal bouwt op van achteren en probeert de spits te bereiken: elke pass in de voeten van de spits is een punt. Vaste afspraak: eerst de verdedigers en backs gebruiken om de tegenstander te laten schuiven, dan via een middenvelder naar voren.',
    organisatie: 'Vak van 40 × 36 m. Centrale verdedigers op de achterlijn, backs aan de zijkanten op 12 m, middenvelders op 16 m, spits op 30 m. Vijf tegenstanders in hesjes. Na een punt of balverlies begint de bal weer bij een centrale verdediger.',
    benodigdheden: ['4 pionnen', 'Ballen', '5 hesjes'],
    spelersNodig: 12,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: een keeper achter de centrale verdedigers (8 tegen 5), of een tweede spits tegen een extra verdediger.',
    coachpunten: ['Breedte en diepte houden: backs op de lijn, middenvelders tussen de tegenstanders', 'De bal verplaatsen tot er een middenvelder vrij staat, dan pas naar voren', 'Middenvelder: half gedraaid aannemen, zodat je de spits meteen ziet'],
    variaties: {
      makkelijker: ['Vier tegenstanders', 'Backs mogen niet worden aangevallen'],
      moeilijker: ['Maximaal twee aanrakingen', 'Na balwinst scoren de tegenstanders op twee kleine doeltjes', 'Zes tegenstanders'],
    },
    en: {
      naam: 'Possession 7v5 with a build-up structure',
      uitleg:
        'Seven against five with a fixed build-up shape: two centre-backs, two full-backs out wide, two midfielders and a striker at the far end. The overload builds from the back and tries to reach the striker: every pass into the striker’s feet is a point. Fixed agreement: first use the centre-backs and full-backs to make the opponents shift, then go forwards through a midfielder.',
      organisatie: '40 × 36 m area. Centre-backs on the back line, full-backs on the sides at 12 m, midfielders at 16 m, striker at 30 m. Five opponents in bibs. After a point or losing the ball, the ball starts again with a centre-back.',
      benodigdheden: ['4 cones', 'Balls', '5 bibs'],
      meerSpelers: 'With more players: a keeper behind the centre-backs (8v5), or a second striker against an extra defender.',
      coachpunten: ['Keep width and depth: full-backs on the line, midfielders between the opponents', 'Move the ball until a midfielder is free, only then go forwards', 'Midfielder: receive half-turned so you can see the striker straight away'],
      variaties: {
        makkelijker: ['Four opponents', 'The full-backs may not be pressed'],
        moeilijker: ['Two touches maximum', 'After winning the ball, the opponents score on two mini goals', 'Six opponents'],
      },
    },
    tekening: {
      ...leeg(40, 36),
      objecten: [
        zone('z', 20, 18, 38, 34),
        pion('p1', 1, 1),
        pion('p2', 39, 1),
        pion('p3', 1, 35),
        pion('p4', 39, 35),
        speler('c1', 4, 14, 4, { kijkrichting: 90 }),
        speler('c2', 5, 26, 4, { kijkrichting: 90 }),
        speler('f1', 2, 4, 12, { kijkrichting: 60 }),
        speler('f2', 3, 36, 12, { kijkrichting: 120 }),
        speler('m1', 6, 15, 16, { kijkrichting: 60 }),
        speler('m2', 8, 25, 16, { kijkrichting: 120 }),
        speler('s', 9, 20, 30, { kijkrichting: -90 }),
        B('b1', 10, 17, 9),
        B('b2', 11, 23, 9),
        B('b3', 12, 10, 18),
        B('b4', 14, 30, 18),
        B('b5', 15, 20, 22),
        bal('bal', 14, 4.55, 'c1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'c1', naar: 'c2' }, { type: 'druk', wie: 'b2', op: 'c2', afstand: 2.4, start: 0.5 }),
        stap({ type: 'pass', van: 'c2', naar: 'f2' }, { type: 'druk', wie: 'b4', op: 'f2', afstand: 2.6, start: 0.5 }, { type: 'loop', wie: 'b1', naar: [21, 9.4], start: 0.4 }),
        stap({ type: 'pass', van: 'f2', naar: 'm2' }, { type: 'loop', wie: 'b5', naar: [22.4, 20.4], start: 0.4 }),
        stap({ type: 'pass', van: 'm2', naar: 'm1' }),
        stap({ type: 'pass', van: 'm1', naar: 's' }),
        pauze(1.0),
      ],
    },
  },

  // 18. Rondo 4 tegen 2 met wisselende posities
  {
    id: 'veld-ps-rondo-4-2-wisselen',
    naam: 'Rondo 4 tegen 2 met wisselende posities',
    categorieen: ['positiespel', 'warming-up'],
    uitleg:
      'Een rondo 4 tegen 2, maar de buitenspelers blijven niet op hun plek: na elke pass wisselt de passer van plek met de buitenspeler naast hem die de bal niet kreeg. De passer loopt buitenom, de ander binnendoor. Zo moet iedereen steeds opnieuw kijken waar de aanspeelpunten zijn.',
    organisatie: 'Vierkant van 10 × 10 m. Vier buitenspelers op de zijden, twee verdedigers met hesjes in het midden. Wie de bal verliest, ruilt met de verdediger die hem won.',
    benodigdheden: ['4 pionnen', '1 bal', '2 hesjes'],
    spelersNodig: 6,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met 7 spelers: een middenman erbij (5 tegen 2). Met meer: een tweede rondo.',
    coachpunten: ['Na je pass meteen wisselen, buitenom en snel', 'Wie binnendoor loopt: niet door de passlijn, kijk eerst waar de bal is', 'De ontvanger kijkt vóór de aanname al waar zijn medespelers nu staan'],
    variaties: {
      makkelijker: ['Wisselen om de twee passes', 'Groter vierkant (12 m)'],
      moeilijker: ['Maximaal twee aanrakingen', 'De passer kiest zelf met wie hij wisselt', 'Kleiner vierkant (8 m)'],
    },
    en: {
      naam: '4v2 rondo with rotating positions',
      uitleg:
        'A 4v2 rondo, but the outside players don’t stay put: after every pass, the passer swaps places with the outside player next to them who didn’t receive the ball. The passer goes round the outside, the other player cuts inside. That way everyone keeps having to look where the passing options are.',
      organisatie: '10 × 10 m square. Four outside players on the sides, two defenders in bibs in the middle. Whoever loses the ball swaps with the defender who won it.',
      benodigdheden: ['4 cones', '1 ball', '2 bibs'],
      meerSpelers: 'With 7 players: add a middle player (5v2). With more: a second rondo.',
      coachpunten: ['Swap straight after your pass, round the outside and quickly', 'If you cut inside: don’t run through the passing lane, check where the ball is first', 'The receiver checks where their teammates are now before the first touch'],
      variaties: {
        makkelijker: ['Swap every two passes', 'Bigger square (12 m)'],
        moeilijker: ['Two touches maximum', 'The passer chooses who to swap with', 'Smaller square (8 m)'],
      },
    },
    tekening: {
      ...leeg(16, 16),
      objecten: [
        pion('p1', 3, 3),
        pion('p2', 13, 3),
        pion('p3', 3, 13),
        pion('p4', 13, 13),
        speler('a1', 1, 8, 3.6, { kijkrichting: 90 }),
        speler('a2', 2, 12.4, 8, { kijkrichting: 180 }),
        speler('a3', 3, 8, 12.4, { kijkrichting: -90 }),
        speler('a4', 4, 3.6, 8, { kijkrichting: 0 }),
        B('d1', 5, 9.4, 9.6),
        B('d2', 6, 6.6, 6.8),
        bal('bal', 8, 4.15, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        stap(
          { type: 'pass', van: 'a1', naar: 'a2' },
          { type: 'druk', wie: 'd1', op: 'a2', afstand: 2, start: 0.4 },
          { type: 'loop', wie: 'a1', via: [[3, 1.4], [1.4, 3]], naar: [3.6, 8], start: 0.35 },
          { type: 'loop', wie: 'a4', via: [[5.2, 5.0]], naar: [8, 3.6], start: 0.35 },
        ),
        stap(
          { type: 'pass', van: 'a2', naar: 'a3' },
          { type: 'druk', wie: 'd1', op: 'a3', afstand: 2, start: 0.45 },
          { type: 'loop', wie: 'a2', via: [[14.6, 3], [13, 1.4]], naar: [8, 3.6], start: 0.35 },
          { type: 'loop', wie: 'a4', via: [[10.8, 5.0]], naar: [12.4, 8], start: 0.35 },
        ),
        stap({ type: 'pass', van: 'a3', naar: 'a1' }, { type: 'druk', wie: 'd2', op: 'a1', afstand: 2, start: 0.45 }),
        pauze(1.0),
      ],
    },
  },

  // 19. Rondo 3 tegen 1 plus een 1 tegen 1
  {
    id: 'veld-ps-rondo-3-1-plus-1-1',
    naam: 'Rondo 3 tegen 1 plus een 1 tegen 1',
    categorieen: ['positiespel', 'partijvormen'],
    uitleg:
      'Drie spelers houden de bal in een driehoek tegen één verdediger. Verovert de verdediger de bal, dan wordt het meteen een 1 tegen 1: hij valt aan op het kleine doeltje, en de speler die de bal verloor moet hem verdedigen. Daarna wisselen ze van rol en begint het rondo opnieuw.',
    organisatie: 'Driehoek met zijden van 9 m (hoedjes). Klein doeltje 8 m van de driehoek. Drie spelers en één verdediger met een hesje.',
    benodigdheden: ['3 hoedjes', '1 klein doeltje', 'Ballen', '1 hesje'],
    spelersNodig: 4,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: twee driehoeken met elk een doeltje, of 4 tegen 1 in een vierkant.',
    coachpunten: ['Rondo: twee aanspeelmogelijkheden geven, de bal in één of twee keer', 'Na balverlies meteen omschakelen: jij verdedigt het doeltje', 'Verdediger: na de balwinst meteen naar het doeltje dribbelen, niet eerst kijken'],
    variaties: {
      makkelijker: ['Grotere driehoek', 'Verdediger mag alleen onderscheppen'],
      moeilijker: ['Maximaal twee aanrakingen', 'Na balwinst valt de verdediger aan op twee doeltjes (keuze)', 'Doeltje verder weg'],
    },
    en: {
      naam: '3v1 rondo plus a 1v1',
      uitleg:
        'Three players keep the ball in a triangle against one defender. If the defender wins the ball, it immediately becomes a 1v1: they attack the mini goal, and the player who lost the ball has to defend it. Then they swap roles and the rondo starts again.',
      organisatie: 'Triangle with 9 m sides (disc cones). Mini goal 8 m from the triangle. Three players and one defender in a bib.',
      benodigdheden: ['3 disc cones', '1 mini goal', 'Balls', '1 bib'],
      meerSpelers: 'With more players: two triangles, each with a mini goal, or 4v1 in a square.',
      coachpunten: ['Rondo: give two passing options, the ball in one or two touches', 'After losing the ball, switch straight away: you defend the goal', 'Defender: after winning it, dribble straight at the goal, don’t look round first'],
      variaties: {
        makkelijker: ['Bigger triangle', 'The defender may only intercept'],
        moeilijker: ['Two touches maximum', 'After winning it, the defender attacks two mini goals (choice)', 'Goal further away'],
      },
    },
    tekening: {
      ...leeg(18, 24),
      objecten: [
        hoedje('h1', 4, 4),
        hoedje('h2', 13, 4),
        hoedje('h3', 8.5, 11.8),
        doeltje('dg', 8.5, 20.5, 180),
        speler('a1', 1, 4.8, 4.6, { kijkrichting: 0 }),
        speler('a2', 2, 12.2, 4.6, { kijkrichting: 150 }),
        speler('a3', 3, 8.5, 11, { kijkrichting: -90 }),
        B('d', 4, 8.5, 7),
        bal('bal', 5.35, 4.6, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'druk', wie: 'd', op: 'a2', afstand: 2.2, start: 0.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'a3', onderschept: 'd' }),
        stap({ type: 'dribbel', wie: 'd', via: [[11.6, 13]], naar: [9.6, 16.4] }, { type: 'loop', wie: 'a3', naar: [5.6, 12.6], start: 0.1 }, { type: 'druk', wie: 'a2', op: 'd', afstand: 1.8, manier: 'sprint', start: 0.15 }),
        stap({ type: 'schot', van: 'd', naar: [8.5, 21] }),
        pauze(1.0),
      ],
    },
  },

  // 20. Opbouw met 4 + keeper tegen 2
  {
    id: 'veld-ps-opbouw-4-keeper-2',
    naam: 'Opbouw met 4 + keeper tegen 2',
    categorieen: ['positiespel'],
    uitleg:
      'De keeper begint met de bal. Twee centrale verdedigers en twee middenvelders bouwen samen met de keeper op tegen twee aanvallers van de tegenstander. Ze scoren door de bal in een van de twee kleine doeltjes op de middenlijn te spelen of te dribbelen. Veroveren de aanvallers de bal, dan mogen ze meteen op het grote doel scoren.',
    organisatie: 'Vak van 40 × 32 m met een groot doel en keeper aan de ene kant en twee kleine doeltjes op de andere lijn (16 m uit elkaar). Centrale verdedigers breed op 6 m, middenvelders op 15 m, twee aanvallers in hesjes.',
    benodigdheden: ['Goal', '2 kleine doeltjes', '4 pionnen', 'Ballen', '2 hesjes'],
    spelersNodig: 6,
    keepersNodig: 1,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: twee backs erbij (6 + keeper tegen 3), of een derde aanvaller.',
    coachpunten: ['Centrale verdedigers: breed uit elkaar, zodat de aanvallers niet allebei kunnen afschermen', 'Keeper: speel de vrije verdediger in, op zijn verste voet', 'Middenvelder: vrijlopen in de rug van de aanvallers en half gedraaid aannemen'],
    variaties: {
      makkelijker: ['Eén aanvaller', 'Aanvallers mogen de keeper niet storen'],
      moeilijker: ['Drie aanvallers', 'Binnen 10 seconden een doeltje', 'Keeper speelt alleen met de voet'],
    },
    en: {
      naam: 'Build-up with 4 + keeper against 2',
      uitleg:
        'The keeper starts with the ball. Two centre-backs and two midfielders build up together with the keeper against two opposing attackers. They score by passing or dribbling the ball into one of the two mini goals on the halfway line. If the attackers win the ball, they can shoot at the big goal straight away.',
      organisatie: '40 × 32 m area with a full-size goal and keeper at one end and two mini goals on the other line (16 m apart). Centre-backs wide at 6 m, midfielders at 15 m, two attackers in bibs.',
      benodigdheden: ['Goal', '2 mini goals', '4 cones', 'Balls', '2 bibs'],
      meerSpelers: 'With more players: add two full-backs (6 + keeper against 3), or a third attacker.',
      coachpunten: ['Centre-backs: split wide so the attackers can’t screen both', 'Keeper: pass to the free defender, onto their far foot', 'Midfielder: get free behind the attackers and receive half-turned'],
      variaties: {
        makkelijker: ['One attacker', 'The attackers may not press the keeper'],
        moeilijker: ['Three attackers', 'Score in a mini goal within 10 seconds', 'The keeper may only use their feet'],
      },
    },
    tekening: {
      ...leeg(40, 34),
      objecten: [
        { id: 'g1', soort: 'goal', x: 20, y: 0 },
        doeltje('d1', 12, 32, 180),
        doeltje('d2', 28, 32, 180),
        keeper('k1', 1, 20, 1.5),
        speler('c1', 4, 10, 6, { kijkrichting: 90 }),
        speler('c2', 5, 30, 6, { kijkrichting: 90 }),
        speler('m1', 6, 14, 15, { kijkrichting: -90 }),
        speler('m2', 8, 26, 15, { kijkrichting: -90 }),
        B('s1', 9, 17, 10.4, { kijkrichting: -90 }),
        B('s2', 10, 23, 10.4, { kijkrichting: -90 }),
        bal('bal', 20, 1.95, 'k1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'k1', naar: 'c2', hoogte: 'grond' }, { type: 'druk', wie: 's2', op: 'c2', afstand: 2.4, start: 0.6 }, { type: 'loop', wie: 's1', naar: [19.4, 11.4], start: 0.5 }),
        stap({ type: 'pass', van: 'c2', naar: 'm2' }, { type: 'loop', wie: 'm1', naar: [15.4, 19.6], start: 0.2 }),
        stap({ type: 'dribbel', wie: 'm2', naar: [26.4, 22.6] }, { type: 'loop', wie: 's1', naar: [22, 16], manier: 'sprint', start: 0.3 }),
        stap({ type: 'schot', van: 'm2', naar: [28, 32.6] }),
        pauze(1.0),
      ],
    },
  },

  // 21. Door de linies naar een diepe spits
  {
    id: 'veld-ps-linies-diepe-spits',
    naam: 'Door de linies naar een diepe spits',
    categorieen: ['positiespel'],
    uitleg:
      'Twee centrale verdedigers bouwen op en moeten de bal via het middenvak naar de spits krijgen. In het middenvak spelen twee middenvelders tegen twee tegenstanders. De centrale verdedigers verplaatsen de bal tot er een middenvelder vrij staat; die draait open en speelt de spits diep, die het duel met zijn verdediger aangaat en afrondt.',
    organisatie: 'Op een half veld, in drie zones: achterzone (40–50 m) met twee centrale verdedigers, middenvak (26–40 m) met 2 tegen 2, voorzone met de spits tegen één verdediger en een keeper. Spelers blijven in hun eigen zone, alleen de bal gaat door de linies.',
    benodigdheden: ['Goal', '8 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 8,
    keepersNodig: 1,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 3 tegen 2 in het middenvak, of een tweede spits in de voorzone.',
    coachpunten: ['Centrale verdedigers: de bal snel verplaatsen tot de lijn naar een middenvelder open is', 'Middenvelder: in het gat tussen de tegenstanders staan en open draaien', 'Spits: loopactie op het moment dat de middenvelder opkijkt, diep in de ruimte'],
    variaties: {
      makkelijker: ['Eén tegenstander in het middenvak', 'Spits zonder verdediger'],
      moeilijker: ['Middenvelder moet in één keer doorspelen', 'Een tegenstander mag vanuit het middenvak terug verdedigen', 'Binnen 10 seconden afronden'],
    },
    en: {
      naam: 'Through the lines to a striker in behind',
      uitleg:
        'Two centre-backs build up and have to get the ball through the middle zone to the striker. In the middle zone, two midfielders play against two opponents. The centre-backs move the ball until a midfielder is free; they open up and play the striker in behind, who takes on their defender and finishes.',
      organisatie: 'On half a pitch, in three zones: back zone (40–50 m) with two centre-backs, middle zone (26–40 m) with 2v2, front zone with the striker against one defender and a keeper. Players stay in their own zone, only the ball goes through the lines.',
      benodigdheden: ['Goal', '8 cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: 3v2 in the middle zone, or a second striker in the front zone.',
      coachpunten: ['Centre-backs: move the ball quickly until the line to a midfielder opens', 'Midfielder: stand in the gap between the opponents and open up', 'Striker: make your run as the midfielder looks up, deep into the space'],
      variaties: {
        makkelijker: ['One opponent in the middle zone', 'Striker without a defender'],
        moeilijker: ['The midfielder must play it on first time', 'An opponent from the middle zone may track back', 'Finish within 10 seconds'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 16, y: -3, breedte: 38, lengte: 56 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        zone('zm', 34, 33, 34, 14, BLAUW),
        speler('c1', 4, 28, 46, { kijkrichting: -90 }),
        speler('c2', 5, 40, 46, { kijkrichting: -90 }),
        speler('m1', 6, 29.5, 33, { kijkrichting: 90 }),
        speler('m2', 8, 38, 34, { kijkrichting: 90 }),
        B('x1', 10, 37, 37.5, { kijkrichting: 90 }),
        B('x2', 11, 33.5, 30.5, { kijkrichting: 90 }),
        speler('s', 9, 36, 22, { kijkrichting: -90 }),
        B('v', 3, 31, 17, { kijkrichting: 90 }),
        bal('bal', 28, 45.45, 'c1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'c1', naar: 'c2' }, { type: 'loop', wie: 'x1', naar: [38.4, 37], start: 0.4 }),
        stap({ type: 'pass', van: 'c2', naar: 'm1' }, { type: 'loop', wie: 'x2', naar: [32.4, 30.6], start: 0.6 }),
        stap({ type: 'dribbel', wie: 'm1', naar: [29.2, 30.8] }, { type: 'loop', wie: 's', via: [[38.2, 15]], naar: [34.4, 9.6], manier: 'sprint', start: 0.2 }),
        stap({ type: 'pass', van: 'm1', naar: 's' }, { type: 'loop', wie: 'v', naar: [32.4, 11.6], manier: 'sprint', start: 0.4 }),
        stap({ type: 'dribbel', wie: 's', naar: [35, 7.6] }),
        stap({ type: 'schot', van: 's', naar: [31.2, -0.3], afloop: 'goal' }),
        pauze(1.0),
      ],
    },
  },
];

zet('veld', oefeningen);
