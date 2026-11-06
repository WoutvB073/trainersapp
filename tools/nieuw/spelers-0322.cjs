// Spelersoefeningen 0.32.2: golven 1 tegen 0, 2 tegen 1, 3 tegen 2; sprinten en stoppen bij de vallende pion; hordes, zijwaarts en
// sprint; achtjes om drie pionnen. Draaien: node tools/nieuw/spelers-0322.cjs
const { zet } = require('./hulp.cjs');
const { speler, trainer, bal, pion, hoedje, horde, pauze, stap } = require('./bouwstenen.cjs');

const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const doeltje = (id, x, y, hoek, breedte = 3) => ({ id, soort: 'klein-goal', x, y, ...(hoek ? { hoek } : {}), breedte });
const tekst = (id, x, y, waarde, breedte = 3) => ({ id, soort: 'tekst', x, y, tekst: waarde, breedte });
const LEEFTIJDEN = ['jo8-11', 'jo12-15', 'jo16-19'];

/** Punten op een boog om (cx, cy), van hoek a naar hoek b in graden (0 = oost, 90 = zuid). */
const boog = (cx, cy, r, a, b, n = 5) => Array.from({ length: n + 1 }, (_, i) => {
  const h = ((a + ((b - a) * i) / n) * Math.PI) / 180;
  return [Math.round((cx + r * Math.cos(h)) * 100) / 100, Math.round((cy + r * Math.sin(h)) * 100) / 100];
});

// ---------- 1. Golven ----------
const golven = {
  id: 'veld-pv-golven-overtal',
  naam: 'Golven: 1 tegen 0, 2 tegen 1, 3 tegen 2',
  categorieen: ['partijvormen', 'afwerken'],
  uitleg:
    'Een aanval die in drie golven steeds groter wordt, heen en weer over het veld. Speler 1 dribbelt naar voren en schiet vanaf ± 15 m op het doel aan de overkant; verder mag hij niet komen (1 tegen 0). Meteen daarna komen vanaf de kant waarop geschoten is twee aanvallers op, en die spelen 2 tegen 1 tegen de speler die net schoot. Is die bal uit of gescoord, dan komen vanaf de kant waar speler 1 begon nog twee spelers bij en wordt het 3 tegen 2, tot er gescoord wordt of de bal uit is.',
  organisatie:
    'Veld van 24 × 40 m met aan beide kanten een doel. Zonder keepers: kleine goals. Met keepers: E-goals, met aan elke kant een keeper. Aan beide kanten staan de spelers met ballen naast het doel. Daarna sluiten de spelers aan aan de kant waar ze uitkomen.',
  benodigdheden: ['2 kleine goals (met keepers: 2 E-goals)', '4 pionnen', 'Ballen', 'Hesjes'],
  spelersNodig: 5,
  keepersNodig: 0,
  leeftijden: LEEFTIJDEN,
  doorwisselbaar: true,
  coachpunten: ['1 tegen 0: in hoog tempo dribbelen en op tijd schieten, vóór de lijn van 15 m', 'Overtal: dribbel op de verdediger af en speel de vrije man op het juiste moment aan', 'Schakel na elke golf meteen om: wie net aanviel, verdedigt nu'],
  variaties: {
    makkelijker: ['Groter veld, zodat er meer ruimte is', 'Verdediger mag pas starten als de bal over de middenlijn is'],
    moeilijker: ['Na de 3 tegen 2 nog een golf: 4 tegen 3', 'Binnen 8 seconden afronden', 'Kleiner veld'],
  },
  en: {
    naam: 'Waves: 1v0, 2v1, 3v2',
    uitleg:
      'An attack that grows in three waves, back and forth across the pitch. Player 1 dribbles forward and shoots from about 15 m at the goal on the far side, and may not go any further (1v0). Straight after that, two attackers come on from the side that was shot at and play 2v1 against the player who just shot. Once that ball is out or scored, two more players join from the side where player 1 started and it becomes 3v2, until there is a goal or the ball goes out.',
    organisatie:
      'Pitch of 24 × 40 m with a goal at both ends. Without keepers: small goals. With keepers: E-goals, with a keeper at each end. The players stand with balls next to the goal at both ends. Afterwards they join the end where they finish.',
    benodigdheden: ['2 small goals (with keepers: 2 E-goals)', '4 cones', 'Balls', 'Bibs'],
    coachpunten: ['1v0: dribble at high speed and shoot in time, before the 15 m line', 'Overload: dribble at the defender and play the free player at the right moment', 'Switch straight away after each wave: whoever just attacked now defends'],
    variaties: {
      makkelijker: ['Bigger pitch, so there is more space', 'The defender may only start once the ball is over the halfway line'],
      moeilijker: ['After the 3v2 one more wave: 4v3', 'Finish within 8 seconds', 'Smaller pitch'],
    },
  },
  tekening: {
    veld: { type: 'leeg', breedte: 26, lengte: 42 },
    camera: 'schuin',
    objecten: [
      doeltje('gB', 13, 1, 0),
      doeltje('gO', 13, 41, 180),
      pion('p1', 1, 1),
      pion('p2', 25, 1),
      pion('p3', 1, 41),
      pion('p4', 25, 41),
      { id: 'lijn1', soort: 'hoedje', x: 4, y: 15.5, kleur: '#ffd23f' },
      { id: 'lijn2', soort: 'hoedje', x: 22, y: 15.5, kleur: '#ffd23f' },
      speler('a1', 1, 13, 38.5, { kijkrichting: -90 }),
      speler('a2', 2, 7, 40, { kijkrichting: -90 }),
      speler('a3', 3, 19, 40, { kijkrichting: -90 }),
      B('b1', 4, 7, 2, { kijkrichting: 90 }),
      B('b2', 5, 19, 2, { kijkrichting: 90 }),
      bal('bal1', 13, 38, 'a1'),
      bal('bal2', 7, 2.5, 'b1'),
      bal('bal3', 7, 39.5, 'a2'),
    ],
    animatie: [
      pauze(0.3),
      // Golf 1: 1 tegen 0.
      stap({ type: 'dribbel', wie: 'a1', naar: [13.4, 16.6], manier: 'sprint', duur: 3.6 }),
      stap({ type: 'schot', van: 'a1', naar: [13, 1.2], hoogte: 'grond' }),
      // Golf 2: 2 tegen 1, de andere kant op.
      stap(
        { type: 'dribbel', wie: 'b1', naar: [9, 13], manier: 'sprint', duur: 1.9 },
        { type: 'loop', wie: 'b2', naar: [19, 14], manier: 'sprint', duur: 1.9 },
        { type: 'loop', wie: 'a1', naar: [11.4, 20], manier: 'achteruit', duur: 1.7 },
      ),
      stap(
        { type: 'dribbel', wie: 'b1', naar: [9.6, 20.4], duur: 1.3 },
        { type: 'loop', wie: 'b2', naar: [20, 24], manier: 'sprint', duur: 1.5 },
        { type: 'druk', wie: 'a1', op: 'b1', afstand: 2.3, start: 0.1 },
      ),
      stap({ type: 'pass', van: 'b1', naar: 'b2' }),
      stap(
        { type: 'dribbel', wie: 'b2', naar: [17.4, 33], duur: 1.9 },
        { type: 'loop', wie: 'b1', naar: [8.6, 31], manier: 'sprint', duur: 1.9 },
        { type: 'loop', wie: 'a1', naar: [13.2, 30], manier: 'sprint', duur: 1.9 },
      ),
      stap({ type: 'schot', van: 'b2', naar: [13.6, 40.8], hoogte: 'grond' }),
      pauze(0.3),
      // Golf 3: 3 tegen 2, vanaf de kant waar speler 1 begon.
      stap(
        { type: 'dribbel', wie: 'a2', naar: [6.6, 30], manier: 'sprint', duur: 1.9 },
        { type: 'loop', wie: 'a3', naar: [21, 29], manier: 'sprint', duur: 1.9 },
        { type: 'loop', wie: 'a1', naar: [14, 24], manier: 'sprint', duur: 1.6 },
        { type: 'loop', wie: 'b1', naar: [8.4, 23.4], manier: 'sprint', duur: 1.9 },
        { type: 'loop', wie: 'b2', naar: [17.6, 25], manier: 'sprint', duur: 1.9 },
      ),
      stap(
        { type: 'dribbel', wie: 'a2', naar: [6.2, 23], duur: 1.3 },
        { type: 'loop', wie: 'a1', naar: [13, 16.6], manier: 'sprint', duur: 1.3 },
        { type: 'loop', wie: 'a3', naar: [21.6, 21], manier: 'sprint', duur: 1.4 },
        { type: 'druk', wie: 'b1', op: 'a2', afstand: 2.3 },
        { type: 'loop', wie: 'b2', naar: [17, 18.6], manier: 'sprint', duur: 1.4 },
      ),
      stap({ type: 'pass', van: 'a2', naar: 'a1' }),
      stap({ type: 'loop', wie: 'b2', naar: [15.8, 15.4], manier: 'sprint', duur: 0.8 }, { type: 'loop', wie: 'a3', naar: [21.4, 12], manier: 'sprint', duur: 1.2 }, { type: 'dribbel', wie: 'a1', naar: [12.4, 13.4], duur: 0.9 }),
      stap({ type: 'pass', van: 'a1', naar: 'a3' }),
      stap({ type: 'dribbel', wie: 'a3', naar: [18.8, 6.6], duur: 1.1 }, { type: 'loop', wie: 'b2', naar: [16.2, 8.6], manier: 'sprint', duur: 1.1 }),
      stap({ type: 'schot', van: 'a3', naar: [12.4, 1.2], hoogte: 'grond' }),
      pauze(0.8),
    ],
  },
};

// ---------- 2. Vallende pion ----------
const LX = 6;
const RX = 14;
const START = 25;
const FINISH = 5;
const poortje = (id, x, y) => [pion(`${id}a`, x - 1.5, y), pion(`${id}b`, x + 1.5, y)];

const vallendePion = {
  id: 'veld-lc-vallende-pion',
  naam: 'Sprinten en stoppen bij de vallende pion',
  categorieen: ['loopcoordinatie'],
  uitleg:
    'Twee banen naast elkaar, elk met een startpoortje en een finishpoortje. In het midden staat de trainer met in elke hand een pion. Twee spelers sprinten tegelijk. Tijdens de sprint laat de trainer één pion vallen: de speler aan die kant remt zo snel mogelijk af en staat stil, de ander sprint door tot de finish.',
  organisatie:
    'Twee banen van 20 m, 8 m uit elkaar, met pionnen als start- en finishpoortje. De trainer staat halverwege in het midden, met het gezicht naar de start, en houdt in elke hand een pion. De spelers staan in twee rijen achter de start. Na hun beurt joggen ze buitenom terug.',
  benodigdheden: ['8 pionnen', '2 pionnen voor de trainer'],
  spelersNodig: 2,
  keepersNodig: 0,
  leeftijden: LEEFTIJDEN,
  doorwisselbaar: true,
  coachpunten: ['Kijk tijdens de sprint naar de handen van de trainer', 'Afremmen: korte pasjes, gewicht naar achteren en laag door de knieën', 'Sta echt stil, met je voeten op schouderbreedte, voordat je weer weggaat'],
  variaties: {
    makkelijker: ['Eerst joggen in plaats van sprinten', 'De trainer roept bij het loslaten de kant'],
    moeilijker: ['Soms laat de trainer geen pion vallen', 'Na het stoppen meteen terugsprinten naar de start', 'Eerst achteruit starten en dan omdraaien'],
  },
  en: {
    naam: 'Sprint and stop at the falling cone',
    uitleg:
      'Two lanes side by side, each with a start gate and a finish gate. In the middle the coach stands with a cone in each hand. Two players sprint at the same time. During the sprint the coach drops one cone: the player on that side brakes as fast as possible and stands still, the other keeps sprinting to the finish.',
    organisatie:
      'Two 20 m lanes, 8 m apart, with cones as start and finish gates. The coach stands halfway in the middle, facing the start, holding a cone in each hand. The players line up in two rows behind the start. After their turn they jog back round the outside.',
    benodigdheden: ['8 cones', '2 cones for the coach'],
    coachpunten: ["Watch the coach's hands during the sprint", 'Braking: short steps, weight back and low through the knees', 'Really stand still, feet shoulder-width apart, before you move off again'],
    variaties: {
      makkelijker: ['Jog first instead of sprinting', 'The coach calls out the side when dropping the cone'],
      moeilijker: ['Sometimes the coach drops no cone', 'After stopping, sprint straight back to the start', 'Start backwards and then turn round'],
    },
  },
  tekening: {
    veld: { type: 'leeg', breedte: 20, lengte: 31 },
    camera: 'schuin',
    objecten: [
      ...poortje('sL', LX, START),
      ...poortje('sR', RX, START),
      ...poortje('fL', LX, FINISH),
      ...poortje('fR', RX, FINISH),
      trainer(10, 15, 90),
      { id: 'hL', soort: 'pion', x: 10.5, y: 15, kleur: '#ffd23f', inHand: { wie: 't1', kant: 'links' } },
      { id: 'hR', soort: 'pion', x: 9.5, y: 15, kleur: '#ffd23f', inHand: { wie: 't1', kant: 'rechts' } },
      speler('a1', 1, LX, START + 0.6, { kijkrichting: -90 }),
      speler('a2', 2, RX, START + 0.6, { kijkrichting: -90 }),
      speler('a3', 3, LX, START + 3, { kijkrichting: -90 }),
      speler('a4', 4, RX, START + 3, { kijkrichting: -90 }),
    ],
    animatie: [
      pauze(0.6),
      stap(
        { type: 'loop', wie: 'a1', naar: [LX, 15.6], manier: 'sprint', duur: 2.6, tempo: 'versnellen' },
        { type: 'loop', wie: 'a1', naar: [LX, 12], manier: 'afremmen', duur: 0.95, start: 2.6 },
        { type: 'losLaten', object: 'hR', hoek: 180, start: 2.05 },
        { type: 'loop', wie: 'a2', naar: [RX, 15.6], manier: 'sprint', duur: 2.6, tempo: 'versnellen' },
        { type: 'loop', wie: 'a2', naar: [RX, FINISH - 1.4], manier: 'sprint', duur: 2, start: 2.6, tempo: 'uitlopen' },
      ),
      pauze(0.4),
      stap({ type: 'loop', wie: 'a1', via: [[LX - 3, 12], [LX - 3, START + 1]], naar: [LX - 3, START + 4.6], spoor: false, duur: 3.6 }, { type: 'loop', wie: 'a2', via: [[RX + 3, FINISH - 1]], naar: [RX + 3, START + 4.6], spoor: false, duur: 4.2 }, { type: 'loop', wie: 'a3', naar: [LX, START + 0.6], duur: 1 }, { type: 'loop', wie: 'a4', naar: [RX, START + 0.6], duur: 1 }),
      pauze(0.4),
    ],
  },
};

// ---------- 3. Hordes, zijwaarts en sprint ----------
const hordesBaan = (k, x, naarBuiten) => {
  const zijX = [1, 2, 3].map((i) => x + naarBuiten * i);
  return {
    objecten: [
      ...[15, 14, 13].map((y, i) => ({ id: `${k}v${i}`, soort: 'horde', x, y, hoogte: 0.25 })),
      ...zijX.map((hx, i) => ({ id: `${k}z${i}`, soort: 'horde', x: hx, y: 10.8, hoek: 90, hoogte: 0.25 })),
    ],
    eindX: x + naarBuiten * 4,
  };
};
const bL = hordesBaan('l', 9, -1);
const bR = hordesBaan('r', 15, 1);
const hordesZijwaarts = {
  id: 'veld-lc-hordes-zijwaarts-sprint',
  naam: 'Hordes, zijwaarts en sprint',
  categorieen: ['loopcoordinatie'],
  uitleg:
    'Wedstrijdje tussen twee spelers, elk in een eigen baan. Eerst recht vooruit over de lage hordes, dan zijwaarts voetenwerk over drie lage hordes (in de linkerbaan naar links, in de rechterbaan naar rechts), en daarna recht vooruit sprinten naar de finish. Wie is er het eerst?',
  organisatie:
    'Twee banen naast elkaar. Per baan: 3 lage hordes achter elkaar, op 1 m afstand, dan 3 lage hordes of pionnen zijwaarts naar buiten, en 9 m verder een finishpoortje. De spelers staan in twee rijen achter de eerste horde en lopen na hun beurt buitenom terug.',
  benodigdheden: ['12 lage hordes (of 6 hordes en 6 pionnen)', '4 pionnen'],
  spelersNodig: 2,
  keepersNodig: 0,
  leeftijden: LEEFTIJDEN,
  doorwisselbaar: true,
  coachpunten: ['Over de hordes: knieën hoog en snelle, korte contacten', 'Zijwaarts: neus vooruit, laag blijven en de voeten niet kruisen', 'Na de laatste horde meteen versnellen: eerste passen klein en krachtig'],
  variaties: {
    makkelijker: ['Pionnen in plaats van hordes', 'Eerst zonder wedstrijdje, op techniek'],
    moeilijker: ['Na het zijwaartse stuk een bal aannemen en afwerken', 'De trainer roept tijdens de hordes links of rechts', 'Start op een signaal met de rug naar de hordes'],
  },
  en: {
    naam: 'Hurdles, sideways and sprint',
    uitleg:
      'A race between two players, each in their own lane. First straight ahead over the low hurdles, then sideways footwork over three low hurdles (to the left in the left lane, to the right in the right lane), and then sprint straight ahead to the finish. Who gets there first?',
    organisatie:
      'Two lanes side by side. Per lane: 3 low hurdles in a row, 1 m apart, then 3 low hurdles or cones sideways to the outside, and 9 m further on a finish gate. The players line up in two rows behind the first hurdle and go back round the outside after their turn.',
    benodigdheden: ['12 low hurdles (or 6 hurdles and 6 cones)', '4 cones'],
    coachpunten: ['Over the hurdles: knees high and quick, short contacts', "Sideways: nose forward, stay low and don't cross your feet", 'Accelerate straight after the last hurdle: first steps small and powerful'],
    variaties: {
      makkelijker: ['Cones instead of hurdles', 'No race at first, focus on technique'],
      moeilijker: ['After the sideways part, receive a ball and finish', 'The coach calls left or right during the hurdles', 'Start on a signal with your back to the hurdles'],
    },
  },
  tekening: {
    veld: { type: 'leeg', breedte: 24, lengte: 22 },
    camera: 'schuin',
    objecten: [
      ...bL.objecten,
      ...bR.objecten,
      ...poortje('fL', bL.eindX, 2),
      ...poortje('fR', bR.eindX, 2),
      speler('a1', 1, 9, 17, { kijkrichting: -90 }),
      speler('a2', 2, 15, 17, { kijkrichting: -90 }),
      speler('a3', 3, 9, 19.6, { kijkrichting: -90 }),
      speler('a4', 4, 15, 19.6, { kijkrichting: -90 }),
    ],
    animatie: [
      pauze(0.4),
      stap({ type: 'loop', wie: 'a1', naar: [9, 12], manier: 'hordes' }, { type: 'loop', wie: 'a2', naar: [15, 12], manier: 'hordes' }),
      stap({ type: 'loop', wie: 'a1', via: [[8.6, 10.8]], naar: [bL.eindX + 0.4, 10.8], manier: 'voetenwerk', kijk: -90 }, { type: 'loop', wie: 'a2', via: [[15.4, 10.8]], naar: [bR.eindX - 0.4, 10.8], manier: 'voetenwerk', kijk: -90 }),
      stap({ type: 'loop', wie: 'a1', naar: [bL.eindX, 0.6], manier: 'sprint', duur: 1.9 }, { type: 'loop', wie: 'a2', naar: [bR.eindX, 0.6], manier: 'sprint', duur: 2.05 }),
      pauze(0.4),
      stap({ type: 'loop', wie: 'a3', naar: [9, 17], duur: 0.9 }, { type: 'loop', wie: 'a4', naar: [15, 17], duur: 0.9 }),
      pauze(0.3),
    ],
  },
};

// ---------- 4. Achtjes om drie pionnen ----------
const L = 6;
const M = 11;
const Rr = 16;
const S1 = 27;
const S2 = 18;
const S3 = 9;
const R = 2;
const STARTY = 34.5;
const stationPionnen = (k, y, kleur) => [L, M, Rr].map((x, i) => ({ ...pion(`${k}${i}`, x, y, kleur), hoogte: 0.45 }));
const gat = (a, b) => (a + b) / 2;
const lengte = (pad) => pad.slice(1).reduce((som, p, i) => som + Math.hypot(p[0] - pad[i][0], p[1] - pad[i][1]), 0);

const beginPunt = [gat(M, Rr), STARTY + 0.7];
// Station 1: uit de pionnen komen (tussen midden en rechts door), rechts om de rechter pion, weer tussen de twee door.
const route1 = [[gat(M, Rr), S1 + 1.6], [gat(M, Rr), S1 - 0.6], ...boog(Rr, S1, 2.5, 195, 515, 10), [gat(M, Rr), S1 + 0.5], [gat(M, Rr), S1 - 1.8]];
// Station 2: rechts om de middelste, links af, om de linker pion, tussen midden en links door, rechts om de rechter pion.
const route2 = [[gat(M, Rr), S2 + 1.6], [gat(M, Rr), S2 - 0.4], ...boog(M, S2, 2.5, 320, 250, 3), ...boog(L, S2, R, 290, 90, 8), [gat(L, M), S2 + 1], [gat(L, M), S2 - 1.2], [M, S2 - 2.2], ...boog(Rr, S2, R, 250, 340, 4), [Rr + 3, S2 - 0.3], [Rr + 3.2, S2 - 1.6], [Rr + 2.4, S2 - 3]];
// Station 3: rechts om de middelste, links om de linker, achterlangs de middelste, rechts om de rechter.
const route3 = [[gat(M, Rr), S3 + 1.6], [gat(M, Rr), S3 - 0.4], ...boog(M, S3, 2.5, 320, 250, 3), ...boog(L, S3, R, 290, 90, 8), [M, S3 + 2.2], ...boog(Rr, S3, R, 110, 0, 4), [Rr + 2, S3 - 2], [M + 1, 4.6], [M, 3.4]];
const eind = [M, 0.8];
const heleRoute = [beginPunt, ...route1, ...route2, ...route3, eind];
const SNELHEID = 4.5;
const routeDuur = lengte(heleRoute) / SNELHEID;
// Tijd waarop speler 1 bij station 2 is: vast tempo, na een korte aanloop (AANLOOP in timeline.ts).
const deel = lengte([beginPunt, ...route1, route2[0]]) / lengte(heleRoute);
const bijStation2 = routeDuur * (deel * 0.94 + 0.03);
const lijn = (...pad) => ({ soort: 'loop', punten: pad });

const achtjes = {
  id: 'veld-lc-achtjes-drie-pionnen',
  naam: 'Achtjes om drie pionnen',
  categorieen: ['loopcoordinatie'],
  uitleg:
    'Vanaf het startpoortje sprint je recht vooruit naar het eerste station. Daar staan drie pionnen naast elkaar en loop je een vaste route. Station 1: tussen de pionnen uitkomen, rechts om de rechter pion heen, tussen de twee pionnen door en door naar het volgende station. Station 2: rechts om de middelste pion, links afslaan, om de linker pion heen, tussen de middelste en linker pion door en rechts om de rechter pion. Station 3: rechts om de middelste pion, links om de linker pion, achterlangs de middelste pion en rechts om de rechter pion. Daarna sprint je naar de finish.',
  organisatie:
    'Startpoortje, drie stations na elkaar en een finish, over ongeveer 33 m. Elk station heeft drie pionnen met 5 m ertussen (links, midden, rechts); de stations liggen 9 m uit elkaar. De nummers op het plaatje geven de volgorde per station. De volgende speler start als de vorige bij station 2 is.',
  benodigdheden: ['9 pionnen in 3 kleuren', '4 pionnen'],
  spelersNodig: 1,
  keepersNodig: 0,
  leeftijden: LEEFTIJDEN,
  doorwisselbaar: true,
  coachpunten: ['Blijf dicht om de pion heen: kort draaien, laag door de knieën', 'Binnenvoet dicht bij de pion, kijk al naar de volgende pion', 'Tussen de stations versnellen en voor de draai pas afremmen'],
  variaties: {
    makkelijker: ['Eerst joggend de route leren', 'Alleen station 1 en 2'],
    moeilijker: ['Met bal aan de voet', 'Twee spelers tegelijk, 5 seconden na elkaar', 'Tijd opnemen en proberen te verbeteren'],
  },
  en: {
    naam: 'Figure-of-eights round three cones',
    uitleg:
      'From the start gate, sprint straight ahead to the first station. There are three cones side by side and you run a fixed route. Station 1: come out between the cones, go right round the right cone, through between the two cones and on to the next station. Station 2: right round the middle cone, turn left, round the left cone, through between the middle and left cones and right round the right cone. Station 3: right round the middle cone, left round the left cone, behind the middle cone and right round the right cone. Then sprint to the finish.',
    organisatie:
      'Start gate, three stations in a row and a finish, over about 33 m. Each station has three cones 5 m apart (left, middle, right); the stations are 9 m apart. The numbers in the picture show the order at each station. The next player starts when the previous one reaches station 2.',
    benodigdheden: ['9 cones in 3 colours', '4 cones'],
    coachpunten: ['Stay tight round the cone: turn short, low through the knees', 'Inside foot close to the cone, already look at the next cone', 'Accelerate between the stations and only brake just before the turn'],
    variaties: {
      makkelijker: ['Learn the route at a jog first', 'Stations 1 and 2 only'],
      moeilijker: ['With a ball at your feet', 'Two players at once, 5 seconds apart', 'Time it and try to improve'],
    },
  },
  tekening: {
    veld: { type: 'leeg', breedte: 24, lengte: 37 },
    camera: 'boven',
    lijnen: [lijn(beginPunt, ...route1), lijn(route1.at(-1), ...route2), lijn(route2.at(-1), ...route3, eind)],
    objecten: [
      ...poortje('st', gat(M, Rr), STARTY),
      ...poortje('fi', M, 2.2),
      ...stationPionnen('s1', S1, '#ffd23f'),
      ...stationPionnen('s2', S2, '#1c64d8'),
      ...stationPionnen('s3', S3, '#e03131'),
      tekst('n1', 4.6, S1 - 3.2, 'Station 1', 11),
      tekst('n2', 4.6, S2 - 3.2, 'Station 2', 11),
      tekst('n3', 4.6, S3 - 3.2, 'Station 3', 11),
      ...[[12.3, S1 + 1.7], [Rr + 3.4, S1], [12.3, S1 - 1.7]].map(([x, y], i) => tekst(`r1${i}`, x, y, String(i + 1), 8)),
      ...[[14.7, S2 + 1.3], [L - 3.2, S2], [gat(L, M), S2 + 2.5], [Rr + 4.6, S2 + 0.4]].map(([x, y], i) => tekst(`r2${i}`, x, y, String(i + 1), 8)),
      ...[[12.3, S3 + 0.9], [L - 3.2, S3], [M, S3 + 3.4], [Rr + 3.4, S3]].map(([x, y], i) => tekst(`r3${i}`, x, y, String(i + 1), 8)),
      speler('a1', 1, beginPunt[0], beginPunt[1], { kijkrichting: -90 }),
      speler('a2', 2, beginPunt[0] + 2, beginPunt[1] + 0.3, { kijkrichting: -90 }),
    ],
    animatie: [
      pauze(0.4),
      stap(
        { type: 'loop', wie: 'a1', via: heleRoute.slice(1, -1), naar: eind, manier: 'sprint', duur: routeDuur, tempo: 'gelijkmatig', spoor: false },
        { type: 'loop', wie: 'a2', via: [beginPunt, ...route1.slice(0, -1)], naar: route1.at(-1), manier: 'sprint', duur: lengte([beginPunt, ...route1]) / SNELHEID + 0.5, start: bijStation2, tempo: 'gelijkmatig', spoor: false },
      ),
      pauze(0.6),
    ],
  },
};

zet('veld', [golven, vallendePion, hordesZijwaarts, achtjes]);
