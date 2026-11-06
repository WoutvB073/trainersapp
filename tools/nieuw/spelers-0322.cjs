// Spelersoefeningen 0.32.2: golven 1 tegen 0, 2 tegen 1, 3 tegen 2; sprinten en stoppen bij de vallende pion; hordes, zijwaarts en
// sprint; achtjes om drie pionnen. Draaien: node tools/nieuw/spelers-0322.cjs
const { zet } = require('./hulp.cjs');
const { keeper, speler, trainer, bal, pion, hoedje, horde, pauze, stap } = require('./bouwstenen.cjs');

const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const doeltje = (id, x, y, hoek, breedte = 3) => ({ id, soort: 'klein-goal', x, y, ...(hoek ? { hoek } : {}), breedte });
const tekst = (id, x, y, waarde, breedte = 3) => ({ id, soort: 'tekst', x, y, tekst: waarde, breedte });
const LEEFTIJDEN = ['jo8-11', 'jo12-15', 'jo16-19'];

/** Punten op een boog om (cx, cy), van hoek a naar hoek b in graden (0 = oost, 90 = zuid). */
const boog = (cx, cy, r, a, b, n = 5) => Array.from({ length: n + 1 }, (_, i) => {
  const h = ((a + ((b - a) * i) / n) * Math.PI) / 180;
  return [Math.round((cx + r * Math.cos(h)) * 100) / 100, Math.round((cy + r * Math.sin(h)) * 100) / 100];
});

/** Tekening een kwartslag draaien: een lang veld met twee goals past dan helemaal in beeld (zie spelers-027b.cjs). */
function draaiKwart(t) {
  const b = t.veld.breedte;
  const p = ([x, y]) => [y, +(b - x).toFixed(2)];
  const objecten = t.objecten.map((o) => {
    const n = { ...o, x: o.y, y: +(b - o.x).toFixed(2) };
    if (o.hoek !== undefined || o.soort === 'goal') n.hoek = (o.hoek ?? 0) - 90;
    if (o.kijkrichting !== undefined) n.kijkrichting = o.kijkrichting - 90;
    return n;
  });
  const actie = (a) => {
    const n = { ...a };
    for (const k of ['naar', 'duikNaar']) if (Array.isArray(a[k]) && typeof a[k][0] === 'number') n[k] = p(a[k]);
    if (a.via) n.via = a.via.map(p);
    return n;
  };
  return { ...t, veld: { ...t.veld, breedte: t.veld.lengte, lengte: b }, objecten, animatie: t.animatie.map((st) => ({ ...st, acties: st.acties.map(actie) })) };
}

// ---------- 1. Golven ----------
const golven = {
  id: 'veld-pv-golven-overtal',
  naam: 'Golven: 1 tegen 0, 2 tegen 1, 3 tegen 2',
  categorieen: ['partijvormen', 'afwerken'],
  uitleg:
    'Een aanval die in drie golven steeds groter wordt, heen en weer over het veld. Speler 1 dribbelt naar voren en schiet vanaf ± 15 m op het doel aan de overkant; verder mag hij niet komen (1 tegen 0). Meteen daarna komen vanaf de kant waarop geschoten is twee aanvallers op, en die spelen 2 tegen 1 tegen de speler die net schoot. Is die bal uit of gescoord, dan komen vanaf de kant waar speler 1 begon nog twee spelers bij en wordt het 3 tegen 2, tot er gescoord wordt of de bal uit is.',
  organisatie:
    'Veld van 24 × 40 m met aan beide kanten een E-goal en een keeper. Zonder keepers: kleine goals. Aan beide kanten staan de spelers met ballen naast het doel. Daarna sluiten de spelers aan aan de kant waar ze uitkomen.',
  benodigdheden: ['2 E-goals (zonder keepers: 2 kleine goals)', '4 pionnen', 'Ballen', 'Hesjes'],
  spelersNodig: 5,
  keepersNodig: 2,
  zonderKeepers: true,
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
      'Pitch of 24 × 40 m with an E-goal and a keeper at both ends. Without keepers: small goals. The players stand with balls next to the goal at both ends. Afterwards they join the end where they finish.',
    benodigdheden: ['2 E-goals (without keepers: 2 small goals)', '4 cones', 'Balls', 'Bibs'],
    coachpunten: ['1v0: dribble at high speed and shoot in time, before the 15 m line', 'Overload: dribble at the defender and play the free player at the right moment', 'Switch straight away after each wave: whoever just attacked now defends'],
    variaties: {
      makkelijker: ['Bigger pitch, so there is more space', 'The defender may only start once the ball is over the halfway line'],
      moeilijker: ['After the 3v2 one more wave: 4v3', 'Finish within 8 seconds', 'Smaller pitch'],
    },
  },
  tekening: draaiKwart({
    veld: { type: 'leeg', breedte: 26, lengte: 42 },
    camera: 'schuin',
    objecten: [
      { id: 'gB', soort: 'goal', x: 13, y: 0.5, breedte: 5, hoogte: 2 },
      { id: 'gO', soort: 'goal', x: 13, y: 41.5, breedte: 5, hoogte: 2, hoek: 180 },
      keeper('k1', 1, 13, 1.9, { verdedigt: 'gB' }),
      keeper('k2', 1, 13, 40.1, { verdedigt: 'gO' }),
      pion('p1', 1, 1),
      pion('p2', 25, 1),
      pion('p3', 1, 41),
      pion('p4', 25, 41),
      { id: 'lijn1', soort: 'hoedje', x: 4, y: 15.5, kleur: '#ffd23f' },
      { id: 'lijn2', soort: 'hoedje', x: 22, y: 15.5, kleur: '#ffd23f' },
      speler('a1', 1, 13, 38.5, { kijkrichting: -90 }),
      speler('a2', 2, 9, 37.5, { kijkrichting: -90 }),
      speler('a3', 3, 17, 37.5, { kijkrichting: -90 }),
      B('b1', 4, 9, 4.5, { kijkrichting: 90 }),
      B('b2', 5, 17, 4.5, { kijkrichting: 90 }),
      bal('bal1', 13, 38, 'a1'),
      bal('bal2', 9, 5, 'b1'),
      bal('bal3', 9, 37, 'a2'),
    ],
    animatie: [
      pauze(0.3),
      // Golf 1: 1 tegen 0.
      stap({ type: 'dribbel', wie: 'a1', naar: [13.4, 16.6], manier: 'sprint', duur: 3.6 }),
      stap({ type: 'schot', van: 'a1', naar: [15, 0.8], hoogte: 'grond', afloop: 'vangt', duikNaar: [14.9, 1.6] }),
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
      stap({ type: 'schot', van: 'b2', naar: [11.2, 41.3], hoogte: 'laag', afloop: 'goal' }),
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
      stap({ type: 'schot', van: 'a3', naar: [11.2, 0.8], hoogte: 'grond', afloop: 'vangt', duikNaar: [11.3, 1.6], vasthouden: true }),
      pauze(0.8),
    ],
  }),
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

// ---------- 4. Achtjes om drie pionnen (tekening 25) ----------
// De route is overgetrokken van de tekening: punten in hokjes van het stippenpapier, ten opzichte van de middelste pion van het station
// (x naar rechts, y naar de start). Per station twee stukken, met een pijl aan het eind, zoals op de tekening.
// De stations zijn iets groter dan op papier en de tussenruimtes iets kleiner, zodat de route op een telefoon goed leesbaar is.
const CEL = 2;
const CX = 9.5;
const M3 = 7.7;
const M2 = M3 + 9.5;
const M1 = M2 + 9.5;
const STARTY = M1 + 9.5;
const FINISHY = M3 - 2.5 * CEL;
const FINISHX = CX + 3.2 * CEL;
const STUKKEN = [
  { my: M1, toon: true, pijl: 'start', punten: [[0, 5.1], [0, 4.75], [0, 4], [0, 3.3], [0, 2.6]] },
  { my: M1, punten: [[0, 2]] },
  { my: M1, toon: true, pijl: 's1a', punten: [[0, 1.45], [-0.12, 0.9], [-0.42, 0.3], [-0.44, -0.2], [-0.1, -0.62], [0.3, -0.68], [0.97, -0.52], [1.7, -0.55], [2.42, -0.7], [2.72, -1.2], [2.45, -1.68], [1.9, -1.72], [1.48, -1.44], [1.38, -1.08]] },
  { my: M1, toon: true, pijl: 's1b', punten: [[0.91, -0.12], [0.67, 0.12], [0.3, 0.38], [-0.06, 0.44], [-0.42, 0.38], [-0.75, 0.12], [-1.39, -0.15], [-2.06, -0.38], [-2.38, -0.66], [-2.45, -1.02], [-2.3, -1.4], [-2.06, -1.62], [-1.76, -1.9]] },
  { my: M2, toon: true, pijl: 's2a', punten: [[-0.45, 1.58], [-0.06, 1.06], [0.24, 0.6], [0.44, 0.1], [0.3, -0.32], [0, -0.46], [-0.42, -0.36], [-0.97, -0.22], [-1.58, -0.2], [-2.06, -0.39], [-2.4, -0.76], [-2.46, -1.15], [-2.3, -1.42], [-2, -1.5], [-1.64, -1.33], [-1.21, -0.94], [-0.97, -0.64]] },
  { my: M2, toon: true, pijl: 's2b', punten: [[-0.67, 0], [-0.42, 0.27], [-0.12, 0.44], [0.24, 0.48], [0.67, 0.39], [1.15, 0.18], [1.64, -0.15], [2.06, -0.48], [2.4, -0.92], [2.32, -1.35], [2.06, -1.62], [1.57, -1.97]] },
  { my: M3, toon: true, pijl: 's3a', punten: [[0.46, 0.62], [0.45, 0.25], [0.3, -0.2], [0, -0.44], [-0.4, -0.45], [-1.2, -0.43], [-1.7, -0.45], [-2.13, -0.55], [-2.43, -0.86], [-2.5, -1.2], [-2.3, -1.5], [-2.03, -1.63], [-1.76, -1.54], [-1.48, -1.23], [-1.3, -0.8]] },
  { my: M3, toon: true, pijl: 's3b', punten: [[-0.93, -0.05], [-0.74, 0.24], [-0.52, 0.4], [-0.15, 0.44], [0.4, 0.3], [1.02, -0.02], [1.7, -0.42], [2.3, -0.7]] },
  { my: M3, punten: [[2.75, -1.1], [3.05, -1.8], [3.2, -2.5], [3.2, -3.1]] },
];
const afgerond = (p) => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100];
const veldPunt = (my) => ([x, y]) => [CX + x * CEL, my + y * CEL];
const lengte = (pad) => pad.slice(1).reduce((som, p, i) => som + Math.hypot(p[0] - pad[i][0], p[1] - pad[i][1]), 0);

/** Vloeiende lijn door alle punten (Catmull-Rom); geeft ook aan welke stukjes van de lijn bij welk stuk horen. */
function vloeiend(stukken, deel = 2) {
  const punten = stukken.flatMap((k) => k.punten.map(veldPunt(k.my)));
  const pad = [];
  for (let i = 0; i < punten.length - 1; i++) {
    const [p0, p1, p2, p3] = [punten[Math.max(0, i - 1)], punten[i], punten[i + 1], punten[Math.min(punten.length - 1, i + 2)]];
    for (let j = 0; j < deel; j++) {
      const u = j / deel;
      pad.push(afgerond([0, 1].map((n) => 0.5 * (2 * p1[n] + (p2[n] - p0[n]) * u + (2 * p0[n] - 5 * p1[n] + 4 * p2[n] - p3[n]) * u * u + (3 * p1[n] - p0[n] - 3 * p2[n] + p3[n]) * u * u * u))));
    }
  }
  pad.push(afgerond(punten.at(-1)));
  let begin = 0;
  const delen = stukken.map((k) => {
    const van = begin * deel;
    begin += k.punten.length;
    return { ...k, pad: pad.slice(van, (begin - 1) * deel + 1) };
  });
  return { pad, delen };
}
const { pad: heleRoute, delen } = vloeiend(STUKKEN);
const beginPunt = heleRoute[0];
const eind = heleRoute.at(-1);
const SNELHEID = 4;
const routeDuur = lengte(heleRoute) / SNELHEID;
const tot = (naam) => heleRoute.slice(0, heleRoute.indexOf(delen.find((k) => k.pijl === naam).pad[0]) + 1);
// Tijd waarop speler 1 bij station 2 is: vast tempo, na een korte aanloop (AANLOOP in timeline.ts).
const bijStation2 = routeDuur * ((lengte(tot('s2a')) / lengte(heleRoute)) * 0.94 + 0.03);
const route2 = tot('s2a').slice(0, -1);
const lijnen = delen.filter((k) => k.toon).map((k) => ({ soort: 'loop', punten: k.pad }));
const stationPionnen = (k, my, kleur) => [[-2, -1], [0, 0], [2, -1]].map(([x, y], i) => ({ ...pion(`${k}${i}`, CX + x * CEL, my + y * CEL, kleur), hoogte: 0.45 }));
const cijfer = (id, my, x, y, waarde) => tekst(id, CX + x * CEL, my + y * CEL, waarde, 11);

const achtjes = {
  id: 'veld-lc-achtjes-drie-pionnen',
  naam: 'Achtjes om drie pionnen',
  categorieen: ['loopcoordinatie'],
  uitleg:
    'Vanaf het startpoortje sprint je recht vooruit naar het eerste station. Elk station heeft drie pionnen in een V: de middelste staat het dichtst bij de start. Per station loop je twee stukken; de nummers 1 en 2 bij de pijlen geven de volgorde aan. Station 1: links langs de middelste pion en rechts om de rechter pion (1), dan terug tussen de twee pionnen door, achter de middelste langs en links om de linker pion (2). Station 2: rechts om de middelste pion, links afslaan en om de linker pion (1), dan tussen de linker en middelste pion door, achter de middelste langs en rechts om de rechter pion (2). Station 3: rechts om de middelste pion en links om de linker pion (1), dan achter de middelste langs en rechts om de rechter pion (2). Daarna sprint je naar de finish.',
  organisatie:
    'Startpoortje, drie stations na elkaar en een finish, over ongeveer 35 m. Per station drie pionnen in een V: links en rechts 8 m uit elkaar, de middelste 2 m dichter bij de start. De stations liggen 9,5 m uit elkaar, het eerste 9,5 m na de start. De volgende speler start als de vorige bij station 2 is.',
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
      'From the start gate, sprint straight ahead to the first station. Each station has three cones in a V: the middle one is closest to the start. At each station you run two parts; the numbers 1 and 2 by the arrows show the order. Station 1: left of the middle cone and right round the right cone (1), then back through between the two cones, behind the middle cone and left round the left cone (2). Station 2: right round the middle cone, turn left and round the left cone (1), then through between the left and middle cones, behind the middle cone and right round the right cone (2). Station 3: right round the middle cone and left round the left cone (1), then behind the middle cone and right round the right cone (2). Then sprint to the finish.',
    organisatie:
      'Start gate, three stations in a row and a finish, over about 35 m. Per station three cones in a V: left and right 8 m apart, the middle one 2 m closer to the start. The stations are 9.5 m apart, the first 9.5 m after the start. The next player starts when the previous one reaches station 2.',
    benodigdheden: ['9 cones in 3 colours', '4 cones'],
    coachpunten: ['Stay tight round the cone: turn short, low through the knees', 'Inside foot close to the cone, already look at the next cone', 'Accelerate between the stations and only brake just before the turn'],
    variaties: {
      makkelijker: ['Learn the route at a jog first', 'Stations 1 and 2 only'],
      moeilijker: ['With a ball at your feet', 'Two players at once, 5 seconds apart', 'Time it and try to improve'],
    },
  },
  tekening: {
    veld: { type: 'leeg', breedte: 19, lengte: 41 },
    camera: 'boven',
    lijnen,
    objecten: [
      ...poortje('st', CX, STARTY),
      ...poortje('fi', FINISHX, FINISHY),
      ...stationPionnen('s1', M1, '#ffd23f'),
      ...stationPionnen('s2', M2, '#1c64d8'),
      ...stationPionnen('s3', M3, '#e03131'),
      tekst('nStart', CX + 4.6, STARTY, 'Start', 10),
      tekst('nFinish', FINISHX - 4.6, FINISHY, 'Finish', 10),
      tekst('n1', 2.5, M1 + 0.2, 'Station 1', 11),
      tekst('n2', 2.5, M2 + 0.2, 'Station 2', 11),
      tekst('n3', 2.5, M3 + 0.2, 'Station 3', 11),
      cijfer('c1a', M1, 1.05, -1.2, '1'),
      cijfer('c1b', M1, -2.25, -2.3, '2'),
      cijfer('c2a', M2, -0.45, -1, '1'),
      cijfer('c2b', M2, 1.95, -2.35, '2'),
      cijfer('c3a', M3, -0.75, -1.05, '1'),
      cijfer('c3b', M3, 2.6, -0.25, '2'),
      speler('a1', 1, beginPunt[0], beginPunt[1], { kijkrichting: -90 }),
      speler('a2', 2, CX, STARTY + 2.5, { kijkrichting: -90 }),
    ],
    animatie: [
      pauze(0.4),
      stap(
        { type: 'loop', wie: 'a1', via: heleRoute.slice(1, -1), naar: eind, manier: 'sprint', duur: routeDuur, tempo: 'gelijkmatig', spoor: false },
        { type: 'loop', wie: 'a2', via: [beginPunt, ...route2.slice(1, -1)], naar: route2.at(-1), manier: 'sprint', duur: lengte([[CX, STARTY + 2.5], ...route2]) / SNELHEID + 0.6, start: bijStation2, tempo: 'gelijkmatig', spoor: false },
      ),
      pauze(0.6),
    ],
  },
};

zet('veld', [golven, vallendePion, hordesZijwaarts, achtjes]);
