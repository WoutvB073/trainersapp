// Spelersoefeningen 0.33.0: zes techniekoefeningen, Partijspel en Partijspel met kameleon (was de Jokerpartij, zelfde id).
// Draaien: node tools/nieuw/spelers-033.cjs
const { zet } = require('./hulp.cjs');
const { keeper, speler, bal, pion, hoedje, pop, pauze, stap } = require('./bouwstenen.cjs');

const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const tekst = (id, x, y, waarde, breedte = 6) => ({ id, soort: 'tekst', x, y, tekst: waarde, breedte });
const leeg = (breedte, lengte, camera = 'schuin') => ({ veld: { type: 'leeg', breedte, lengte }, camera });
const ALLE = ['mini-3-5', 'mini-5-7', 'jo8-11', 'jo12-15', 'jo16-19'];
const JO = ['jo8-11', 'jo12-15', 'jo16-19'];

/** Vloeiende lijn door de punten (Catmull-Rom), voor bochten zonder hoeken. */
function glad(punten, deel = 3) {
  const uit = [];
  for (let i = 0; i < punten.length - 1; i++) {
    const [p0, p1, p2, p3] = [punten[Math.max(0, i - 1)], punten[i], punten[i + 1], punten[Math.min(punten.length - 1, i + 2)]];
    for (let j = 0; j < deel; j++) {
      const u = j / deel;
      uit.push([0, 1].map((n) => Math.round(50 * (2 * p1[n] + (p2[n] - p0[n]) * u + (2 * p0[n] - 5 * p1[n] + 4 * p2[n] - p3[n]) * u * u + (3 * p1[n] - p0[n] - 3 * p2[n] + p3[n]) * u * u * u)) / 100));
    }
  }
  uit.push(punten.at(-1));
  return uit;
}
/** Dribbel langs een vloeiende lijn. */
const route = (wie, punten, extra = {}) => {
  const pad = glad(punten).slice(1);
  return { type: 'dribbel', wie, via: pad.slice(0, -1), naar: pad.at(-1), ...extra };
};

/** Tekening een kwartslag draaien: een lang veld met twee goals past dan helemaal in beeld (zie spelers-027b.cjs). */
function draaiKwart(t) {
  const b = t.veld.breedte;
  const p = ([x, y]) => [y, +(b - x).toFixed(2)];
  const objecten = t.objecten.map((o) => {
    const n = { ...o, x: o.y, y: +(b - o.x).toFixed(2) };
    if (o.hoek !== undefined || o.soort === 'goal') n.hoek = (o.hoek ?? 0) - 90;
    if (o.kijkrichting !== undefined) n.kijkrichting = o.kijkrichting - 90;
    if (o.soort === 'zone') Object.assign(n, { breedte: o.lengte, lengte: o.breedte });
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

// ---------- 1. Dribbel naar de pop en een actie ----------
const popActie = {
  id: 'veld-tq-pop-actie',
  naam: 'Dribbel naar de pop en een actie',
  categorieen: ['techniek'],
  uitleg:
    'Dribbel in tempo naar de pop. Maak vlak voor de pop een actie en accelereer daarna met de bal tot de pion achter de pop. Wissel per ronde van actie: de schaar (voet over de bal, de andere kant uit), een passeerbeweging (lijf de ene kant op, met de bal de andere kant op) of de Cruijff-draai (schijnschot, de bal achter je standbeen langs meenemen en wegdraaien).',
  organisatie:
    'Drie banen naast elkaar, 8 m uit elkaar. Per baan een pop 7,5 m na de start en een pion 4,5 m achter de pop. Elke speler heeft een bal. Na de pion dribbel je buitenom terug en sluit je aan. Wissel na elke ronde van baan of van actie.',
  benodigdheden: ['3 poppen', '3 pionnen', '1 bal per speler'],
  spelersNodig: 1,
  keepersNodig: 0,
  leeftijden: JO,
  doorwisselbaar: true,
  coachpunten: ['Begin je actie op 1,5 m van de pop, niet er bovenop', 'Na de actie is het tempo het belangrijkst: eerste twee passen explosief', 'Blijf de bal dicht bij je houden en kijk op'],
  variaties: {
    makkelijker: ['Eerst rustig, zonder te versnellen', 'Pion in plaats van een pop en één actie per ronde'],
    moeilijker: ['De trainer roept vlak voor de pop welke actie je maakt', 'Actie met je andere voet', 'Tijd opnemen tot de pion'],
  },
  en: {
    naam: 'Dribble to the mannequin and make a move',
    uitleg:
      'Dribble at pace to the mannequin. Make a move just before it, then accelerate with the ball to the cone behind the mannequin. Change the move each round: the step-over (foot over the ball, then go the other way), a body feint (body one way, ball the other) or the Cruyff turn (fake shot, drag the ball behind your standing leg and turn away).',
    organisatie:
      'Three lanes side by side, 8 m apart. Per lane a mannequin 7.5 m after the start and a cone 4.5 m behind the mannequin. Every player has a ball. After the cone, dribble back round the outside and rejoin. Change lane or move after each round.',
    benodigdheden: ['3 mannequins', '3 cones', '1 ball per player'],
    coachpunten: ['Start your move 1.5 m from the mannequin, not right on top of it', 'After the move, pace matters most: first two steps explosive', 'Keep the ball close and look up'],
    variaties: {
      makkelijker: ['Slowly at first, without accelerating', 'A cone instead of a mannequin and one move per round'],
      moeilijker: ['The coach calls the move just before the mannequin', 'Make the move with your other foot', 'Time it to the cone'],
    },
  },
  tekening: {
    ...leeg(25, 17),
    objecten: [
      pop('v1', 4.5, 6.5),
      pop('v2', 12.5, 6.5),
      pop('v3', 20.5, 6.5),
      pion('f1', 4.5, 2),
      pion('f2', 12.5, 2),
      pion('f3', 23.6, 12.8),
      tekst('n1', 4.5, 16, 'Schaar', 5),
      tekst('n2', 12.5, 16, 'Passeerbeweging', 5),
      tekst('n3', 20.5, 16, 'Cruijff', 5),
      speler('a1', 1, 4.5, 14, { kijkrichting: -90 }),
      speler('a2', 2, 12.5, 14, { kijkrichting: -90 }),
      speler('a3', 3, 20.5, 14, { kijkrichting: -90 }),
      bal('b1', 4.5, 13.45, 'a1'),
      bal('b2', 12.5, 13.45, 'a2'),
      bal('b3', 20.5, 13.45, 'a3'),
    ],
    animatie: [
      pauze(0.4),
      stap({ type: 'dribbel', wie: 'a1', naar: [4.5, 8.4], duur: 2.4 }, { type: 'dribbel', wie: 'a2', naar: [12.5, 8.4], duur: 2.4 }, { type: 'dribbel', wie: 'a3', naar: [20.5, 8.4], duur: 2.4 }),
      stap({ type: 'schijn', wie: 'a1', kant: 'rechts' }, { type: 'schijn', wie: 'a2', kant: 'links' }, { type: 'truc', wie: 'a3', soort: 'cruijff', voet: 'links', naar: [23.6, 12.8] }),
      stap(
        route('a1', [[4.5, 8.4], [3, 7.4], [2.9, 5.6], [4.3, 3.2]], { manier: 'sprint', duur: 1.5 }),
        route('a2', [[12.5, 8.4], [14, 7.4], [14.1, 5.6], [12.7, 3.2]], { manier: 'sprint', duur: 1.5 }),
        { type: 'dribbel', wie: 'a3', naar: [23.2, 12.1], manier: 'sprint', duur: 1.5 },
      ),
      pauze(0.7),
    ],
  },
};

// ---------- 2. Slalom met de bal ----------
const heen = (x) => [[x, 17], [x - 1, 14], [x + 1, 11.5], [x - 1, 9], [x + 1, 6.5], [x - 1, 4], [x, 2.6]];
const terug = (x) => [[x, 2.6], [x + 1, 4], [x - 1, 6.5], [x + 1, 9], [x - 1, 11.5], [x + 1, 14], [x, 16.4]];
const slalom = {
  id: 'veld-tq-slalom-bal',
  naam: 'Slalom met de bal',
  categorieen: ['techniek'],
  uitleg:
    'Dribbel met de bal in een slalom tussen de pionnen door. Speel per ronde op een andere manier: alleen met de binnenkant, alleen met de buitenkant, of met de zool. Gebruik zowel je linker- als je rechtervoet. Draai bij de laatste pion en kom terug met je andere voet.',
  organisatie: 'Twee banen naast elkaar, 8 m uit elkaar. Per baan 5 pionnen op een rij, 2,5 m uit elkaar. Verdeel de spelers over de banen, ieder met een bal. De volgende start als de vorige bij de derde pion is.',
  benodigdheden: ['10 pionnen', '1 bal per speler'],
  spelersNodig: 1,
  keepersNodig: 0,
  leeftijden: ALLE,
  doorwisselbaar: true,
  coachpunten: ['Veel kleine aanrakingen: de bal blijft dicht bij je voet', 'Kijk tussen de aanrakingen door al naar de volgende pion', 'Laag door de knieën, zet je af na elke bocht'],
  variaties: {
    makkelijker: ['Pionnen verder uit elkaar', 'Eerst lopend, zonder tempo', 'Mini’s: alleen met je beste voet'],
    moeilijker: ['Pionnen dichter bij elkaar', 'Alleen met je zwakke voet', 'Wedstrijdje tussen de banen'],
  },
  en: {
    naam: 'Slalom with the ball',
    uitleg:
      'Dribble the ball in a slalom through the cones. Play it a different way each round: inside only, outside only, or with the sole. Use both your left and your right foot. Turn at the last cone and come back with your other foot.',
    organisatie: 'Two lanes side by side, 8 m apart. Per lane 5 cones in a row, 2.5 m apart. Divide the players over the lanes, each with a ball. The next player starts when the previous one reaches the third cone.',
    benodigdheden: ['10 cones', '1 ball per player'],
    coachpunten: ['Lots of small touches: the ball stays close to your foot', 'Between touches, look ahead to the next cone', 'Low through the knees, push off after each turn'],
    variaties: {
      makkelijker: ['Cones further apart', 'Walking pace at first', 'Minis: only with your best foot'],
      moeilijker: ['Cones closer together', 'Only with your weaker foot', 'Race between the lanes'],
    },
  },
  tekening: {
    ...leeg(18, 20),
    objecten: [
      ...[5, 13].flatMap((x, k) => [14, 11.5, 9, 6.5, 4].map((y, i) => pion(`p${k}${i}`, x, y))),
      speler('a1', 1, 5, 17, { kijkrichting: -90 }),
      speler('a2', 2, 13, 17, { kijkrichting: -90 }),
      bal('b1', 5, 16.45, 'a1'),
      bal('b2', 13, 16.45, 'a2'),
    ],
    animatie: [
      pauze(0.4),
      stap(route('a1', heen(5), { manier: 'jog', duur: 5.2, tempo: 'gelijkmatig' }), route('a2', heen(13), { manier: 'jog', duur: 5.2, tempo: 'gelijkmatig' })),
      stap({ type: 'truc', wie: 'a1', soort: 'zool', kijk: 90 }, { type: 'truc', wie: 'a2', soort: 'zool', voet: 'links', kijk: 90 }),
      stap(route('a1', terug(5), { manier: 'jog', duur: 5.2, tempo: 'gelijkmatig', spoor: false }), route('a2', terug(13), { manier: 'jog', duur: 5.2, tempo: 'gelijkmatig', spoor: false })),
      pauze(0.5),
    ],
  },
};

// ---------- 3. Vierkant van wendingen ----------
const hoek1 = [5, 5];
const hoek2 = [12, 5];
const hoek3 = [12, 12];
const hoek4 = [5, 12];
const wendingen = {
  id: 'veld-tq-vierkant-wendingen',
  naam: 'Vierkant van wendingen',
  categorieen: ['techniek'],
  uitleg:
    'Vier pionnen in een vierkant. Dribbel van pion naar pion en maak bij elke pion een andere wending: met de binnenkant, met de buitenkant, met de zool en de Cruijff-draai. Versnel na elke wending naar de volgende pion. Na een ronde draai je om en ga je de andere kant op.',
  organisatie: 'Vierkant van 9 × 9 m met op elke hoek een pion. Bij grotere groepen meerdere vierkanten. Twee spelers per vierkant, ieder met een bal, op tegenover elkaar liggende hoeken. Ze starten tegelijk en lopen dezelfde kant op.',
  benodigdheden: ['4 pionnen', '1 bal per speler'],
  spelersNodig: 1,
  keepersNodig: 0,
  leeftijden: JO,
  doorwisselbaar: true,
  coachpunten: ['Rem af met kleine pasjes en maak de wending laag door de knieën', 'Neem de bal in één beweging mee in de nieuwe richting', 'Na de wending meteen opkijken en versnellen'],
  variaties: {
    makkelijker: ['Eén soort wending per ronde', 'Kleiner vierkant en rustiger tempo'],
    moeilijker: ['Alles met je zwakke voet', 'De trainer roept de wending', 'Elke ronde een nieuwe volgorde'],
  },
  en: {
    naam: 'Square of turns',
    uitleg:
      'Four cones in a square. Dribble from cone to cone and make a different turn at each one: with the inside, with the outside, with the sole and the Cruyff turn. Accelerate to the next cone after each turn. After a lap, turn round and go the other way.',
    organisatie: 'Square of 9 × 9 m with a cone on each corner. With bigger groups, use more squares. Two players per square, each with a ball, on opposite corners. They start at the same time and go the same way round.',
    benodigdheden: ['4 cones', '1 ball per player'],
    coachpunten: ['Brake with small steps and make the turn low through the knees', 'Take the ball into the new direction in one movement', 'Look up and accelerate straight after the turn'],
    variaties: {
      makkelijker: ['One type of turn per round', 'Smaller square and slower pace'],
      moeilijker: ['Everything with your weaker foot', 'The coach calls the turn', 'A new order each round'],
    },
  },
  tekening: {
    ...leeg(17, 17),
    objecten: [
      pion('p1', 4, 4),
      pion('p2', 13, 4),
      pion('p3', 13, 13),
      pion('p4', 4, 13),
      tekst('n1', 3.2, 2.6, 'Binnenkant', 6),
      tekst('n2', 13.8, 2.6, 'Buitenkant', 6),
      tekst('n3', 13.8, 14.6, 'Zool', 5),
      tekst('n4', 3.2, 14.6, 'Cruijff', 5),
      speler('a1', 1, ...hoek4, { kijkrichting: -90 }),
      speler('a2', 2, ...hoek2, { kijkrichting: 90 }),
      bal('b1', hoek4[0], hoek4[1] - 0.55, 'a1'),
      bal('b2', hoek2[0], hoek2[1] + 0.55, 'a2'),
    ],
    animatie: [
      pauze(0.4),
      stap({ type: 'dribbel', wie: 'a1', naar: hoek1, manier: 'jog', duur: 2 }, { type: 'dribbel', wie: 'a2', naar: hoek3, manier: 'jog', duur: 2 }),
      stap({ type: 'truc', wie: 'a1', soort: 'binnenkant', voet: 'links', kijk: 0 }, { type: 'truc', wie: 'a2', soort: 'zool', kijk: 180 }),
      stap({ type: 'dribbel', wie: 'a1', naar: hoek2, manier: 'jog', duur: 2 }, { type: 'dribbel', wie: 'a2', naar: hoek4, manier: 'jog', duur: 2 }),
      stap({ type: 'truc', wie: 'a1', soort: 'buitenkant', kijk: 90 }, { type: 'truc', wie: 'a2', soort: 'cruijff', voet: 'links', kijk: -90 }),
      stap({ type: 'dribbel', wie: 'a1', naar: hoek3, manier: 'jog', duur: 2 }, { type: 'dribbel', wie: 'a2', naar: hoek1, manier: 'jog', duur: 2 }),
      stap({ type: 'truc', wie: 'a1', soort: 'zool', kijk: 180 }, { type: 'truc', wie: 'a2', soort: 'binnenkant', voet: 'links', kijk: 0 }),
      stap({ type: 'dribbel', wie: 'a1', naar: hoek4, manier: 'jog', duur: 2 }, { type: 'dribbel', wie: 'a2', naar: hoek2, manier: 'jog', duur: 2 }),
      stap({ type: 'truc', wie: 'a1', soort: 'cruijff', voet: 'links', kijk: -90 }, { type: 'truc', wie: 'a2', soort: 'buitenkant', kijk: 90 }),
      pauze(0.4),
    ],
  },
};

// ---------- 4. Tempowisseling ----------
const baan = [5, 11, 17];
const tempo = {
  id: 'veld-tq-tempowisseling',
  naam: 'Tempowisseling',
  categorieen: ['techniek'],
  uitleg: 'Dribbel rustig tot de eerste lijn. Versnel daar zo hard als je kunt tot de volgende lijn, kap de bal en dribbel weer rustig terug. Het gaat om het verschil: eerst echt rustig, dan echt snel.',
  organisatie: 'Drie banen naast elkaar. De eerste lijn ligt 5 m na de start, de tweede lijn 8 m verder. Markeer de lijnen met hoedjes naast de banen. Iedere speler heeft een bal; start per baan om de beurt.',
  benodigdheden: ['8 hoedjes', '1 bal per speler'],
  spelersNodig: 1,
  keepersNodig: 0,
  leeftijden: ALLE,
  doorwisselbaar: true,
  coachpunten: ['Rustig tempo: de bal dicht bij je voet, kijk op', 'Versnellen: speel de bal iets verder voor je uit en maak grote passen', 'Rem af met kleine pasjes voor je kapt'],
  variaties: {
    makkelijker: ['Mini’s: rustig lopen, dan rennen, en bij de lijn stoppen met je voet op de bal', 'Lijnen dichter bij elkaar'],
    moeilijker: ['Versnellen op het signaal van de trainer', 'Kappen met je zwakke voet', 'Na het kappen meteen weer versnellen'],
  },
  en: {
    naam: 'Change of pace',
    uitleg: 'Dribble slowly to the first line. There, accelerate as fast as you can to the next line, chop the ball and dribble back slowly. It is all about the difference: really slow first, then really fast.',
    organisatie: 'Three lanes side by side. The first line is 5 m after the start, the second line 8 m further on. Mark the lines with disc cones next to the lanes. Every player has a ball; each lane starts in turn.',
    benodigdheden: ['8 disc cones', '1 ball per player'],
    coachpunten: ['Slow pace: ball close to your foot, look up', 'Accelerating: play the ball a little further ahead and take big strides', 'Brake with small steps before you chop'],
    variaties: {
      makkelijker: ['Minis: walk, then run, and stop at the line with your foot on the ball', 'Lines closer together'],
      moeilijker: ['Accelerate on the coach’s signal', 'Chop with your weaker foot', 'Accelerate again straight after the chop'],
    },
  },
  tekening: {
    ...leeg(22, 20),
    objecten: [
      ...[2, 8, 14, 20].flatMap((x, i) => [hoedje(`l${i}`, x, 12, '#ffd23f'), hoedje(`m${i}`, x, 4, '#ff7a1a')]),
      ...baan.map((x, i) => speler(`a${i + 1}`, i + 1, x, 17, { kijkrichting: -90 })),
      ...baan.map((x, i) => bal(`b${i + 1}`, x, 16.45, `a${i + 1}`)),
    ],
    animatie: [
      pauze(0.4),
      stap(...baan.map((x, i) => ({ type: 'dribbel', wie: `a${i + 1}`, naar: [x, 12], manier: 'jog', duur: 3, tempo: 'gelijkmatig', start: i * 0.4 }))),
      stap(...baan.map((x, i) => ({ type: 'dribbel', wie: `a${i + 1}`, naar: [x, 4.6], manier: 'sprint', duur: 1.5, tempo: 'versnellen', start: i * 0.4 }))),
      stap(...baan.map((x, i) => ({ type: 'truc', wie: `a${i + 1}`, soort: 'binnenkant', voet: i === 1 ? 'links' : 'rechts', kijk: 90, start: i * 0.4 }))),
      stap(...baan.map((x, i) => ({ type: 'dribbel', wie: `a${i + 1}`, naar: [x, 16.4], manier: 'jog', duur: 4, tempo: 'gelijkmatig', start: i * 0.4, spoor: false }))),
      pauze(0.4),
    ],
  },
};

// ---------- 5. Dribbel en actie tegen een passieve verdediger ----------
const passief = {
  id: 'veld-tq-actie-passieve-verdediger',
  naam: 'Dribbel en actie tegen een passieve verdediger',
  categorieen: ['techniek'],
  uitleg:
    'De verdediger staat stil of loopt alleen mee, en pakt de bal niet af. De dribbelaar gaat op de verdediger af, maakt een actie en gaat er met een versnelling langs tot de lijn. Daarna wissel je van rol. De verdediger laat zich meenemen door de actie, zodat de dribbelaar leert wanneer de actie werkt.',
  organisatie: 'Tweetallen met één bal. Per tweetal een baan van 12 m: de verdediger staat halverwege, de dribbelaar begint aan het eind. Achter de verdediger ligt een lijn van hoedjes. Na vijf keer wisselen.',
  benodigdheden: ['1 bal per tweetal', '4 hoedjes'],
  spelersNodig: 2,
  keepersNodig: 0,
  leeftijden: JO,
  doorwisselbaar: true,
  coachpunten: ['Ga recht op de verdediger af, zodat hij stil moet staan', 'Maak de actie op 1,5 tot 2 m afstand', 'Ga na de actie meteen schuin voorbij de verdediger en versnel'],
  variaties: {
    makkelijker: ['Verdediger staat alleen stil', 'Pop of pion in plaats van een verdediger'],
    moeilijker: ['Verdediger mag een stap maken naar de bal', 'Dribbelaar kiest pas op het laatste moment zijn kant', 'Na de lijn nog 5 m sprinten met de verdediger erachteraan'],
  },
  en: {
    naam: 'Dribble and move against a passive defender',
    uitleg:
      'The defender stands still or only moves along, and does not win the ball. The dribbler goes at the defender, makes a move and gets past with a burst of speed to the line. Then swap roles. The defender goes with the move, so the dribbler learns when it works.',
    organisatie: 'Pairs with one ball. Per pair a 12 m lane: the defender stands halfway, the dribbler starts at the end. Behind the defender is a line of disc cones. Swap after five attempts.',
    benodigdheden: ['1 ball per pair', '4 disc cones'],
    coachpunten: ['Go straight at the defender, so he has to stop', 'Make the move from 1.5 to 2 m away', 'Go past the defender at an angle straight after the move and accelerate'],
    variaties: {
      makkelijker: ['The defender only stands still', 'A mannequin or cone instead of a defender'],
      moeilijker: ['The defender may take one step towards the ball', 'The dribbler chooses a side at the last moment', 'After the line, sprint 5 m more with the defender chasing'],
    },
  },
  tekening: {
    ...leeg(18, 18),
    objecten: [
      hoedje('h1', 2, 3.5, '#ffd23f'),
      hoedje('h2', 9, 3.5, '#ffd23f'),
      hoedje('h3', 16, 3.5, '#ffd23f'),
      B('v1', 3, 5, 8, { kijkrichting: 90 }),
      B('v2', 4, 13, 8, { kijkrichting: 90 }),
      speler('a1', 1, 5, 15, { kijkrichting: -90 }),
      speler('a2', 2, 13, 15, { kijkrichting: -90 }),
      bal('b1', 5, 14.45, 'a1'),
      bal('b2', 13, 14.45, 'a2'),
    ],
    animatie: [
      pauze(0.4),
      stap({ type: 'dribbel', wie: 'a1', naar: [5, 10.4], duur: 2.1 }, { type: 'dribbel', wie: 'a2', naar: [13, 10.4], duur: 2.1 }),
      stap({ type: 'schijn', wie: 'a1', kant: 'rechts' }, { type: 'schijn', wie: 'a2', kant: 'links' }, { type: 'loop', wie: 'v2', naar: [11.6, 8], manier: 'verdedigend', kijk: 90, duur: 0.7 }),
      stap(route('a1', [[5, 10.4], [3.2, 9.4], [2.9, 7.2], [4.2, 4.6], [4.6, 2.6]], { manier: 'sprint', duur: 1.9 }), route('a2', [[13, 10.4], [14.8, 9.4], [15.1, 7.2], [13.8, 4.6], [13.4, 2.6]], { manier: 'sprint', duur: 1.9 })),
      pauze(0.6),
    ],
  },
};

// ---------- 6. Spiegeldribbel ----------
const spiegel = {
  id: 'veld-tq-spiegeldribbel',
  naam: 'Spiegeldribbel in tweetallen',
  categorieen: ['techniek', 'warming-up'],
  uitleg: 'Twee spelers staan tegenover elkaar, ieder met een bal. De voorspeler doet een beweging met de bal voor: dribbelen, kappen, een schaar of de zool. De ander doet hem meteen na, als in een spiegel. Na een minuut wisselen.',
  organisatie: 'Tweetallen op 6 m van elkaar, in een eigen vak van 6 × 10 m. Ieder heeft een bal. Bij een oneven aantal doet de trainer mee.',
  benodigdheden: ['1 bal per speler', '4 hoedjes per tweetal'],
  spelersNodig: 2,
  keepersNodig: 0,
  leeftijden: ALLE,
  doorwisselbaar: true,
  coachpunten: ['Kijk naar je maatje, niet naar de bal', 'Voorspeler: begin rustig en maak het steeds moeilijker', 'Na-doener: blijf zo dicht mogelijk bij de voorspeler'],
  variaties: {
    makkelijker: ['Alleen dribbelen en stilstaan', 'Mini’s: de trainer doet het voor'],
    moeilijker: ['Elke tien seconden wisselen van voorspeler', 'Alleen met je zwakke voet', 'De voorspeler mag ook versnellen'],
  },
  en: {
    naam: 'Mirror dribbling in pairs',
    uitleg: 'Two players face each other, each with a ball. The leader makes a move with the ball: dribbling, chopping, a step-over or using the sole. The other copies it straight away, as in a mirror. Swap after a minute.',
    organisatie: 'Pairs 6 m apart, in their own 6 × 10 m area. Each has a ball. With an odd number the coach joins in.',
    benodigdheden: ['1 ball per player', '4 disc cones per pair'],
    coachpunten: ['Watch your partner, not the ball', 'Leader: start slowly and make it harder and harder', 'Follower: stay as close to the leader as you can'],
    variaties: {
      makkelijker: ['Only dribbling and stopping', 'Minis: the coach shows it'],
      moeilijker: ['Swap leader every ten seconds', 'Only with your weaker foot', 'The leader may accelerate too'],
    },
  },
  tekening: {
    ...leeg(14, 14),
    objecten: [
      hoedje('h1', 4, 2),
      hoedje('h2', 10, 2),
      hoedje('h3', 4, 12),
      hoedje('h4', 10, 12),
      speler('a1', 1, 4, 7, { kijkrichting: 0 }),
      B('a2', 2, 10, 7, { kijkrichting: 180 }),
      bal('b1', 4.55, 7, 'a1'),
      bal('b2', 9.45, 7, 'a2'),
    ],
    animatie: [
      pauze(0.4),
      stap({ type: 'schijn', wie: 'a1', kant: 'links' }, { type: 'schijn', wie: 'a2', kant: 'rechts', start: 0.35 }),
      stap({ type: 'dribbel', wie: 'a1', naar: [4, 4], manier: 'jog', duur: 1.5 }, { type: 'dribbel', wie: 'a2', naar: [10, 4], manier: 'jog', duur: 1.5, start: 0.35 }),
      stap({ type: 'truc', wie: 'a1', soort: 'zool', kijk: 90 }, { type: 'truc', wie: 'a2', soort: 'zool', voet: 'links', kijk: 90, start: 0.35 }),
      stap({ type: 'dribbel', wie: 'a1', naar: [4, 10], manier: 'jog', duur: 2.6, spoor: false }, { type: 'dribbel', wie: 'a2', naar: [10, 10], manier: 'jog', duur: 2.6, start: 0.35, spoor: false }),
      stap({ type: 'truc', wie: 'a1', soort: 'binnenkant', kijk: -90 }, { type: 'truc', wie: 'a2', soort: 'binnenkant', voet: 'links', kijk: -90, start: 0.35 }),
      stap({ type: 'dribbel', wie: 'a1', naar: [4, 7], manier: 'jog', duur: 1.4, spoor: false }, { type: 'dribbel', wie: 'a2', naar: [10, 7], manier: 'jog', duur: 1.4, start: 0.35, spoor: false }),
      stap({ type: 'draai', wie: 'a1', kijk: 0 }, { type: 'draai', wie: 'a2', kijk: 180, start: 0.35 }),
      pauze(0.5),
    ],
  },
};

// ---------- 7. Partijspel ----------
const partijspel = {
  id: 'veld-pv-partijspel',
  naam: 'Partijspel',
  categorieen: ['partijvormen'],
  uitleg:
    'Gewoon een normaal partijtje: twee teams proberen te scoren op het doel van de ander. Te spelen van 4 tegen 4 tot 8 tegen 8. Veldgrootte per aantal spelers: 4 tegen 4 op 30 × 20 m, 5 tegen 5 op 35 × 25 m, 6 tegen 6 op 40 × 30 m, 7 tegen 7 op 50 × 35 m en 8 tegen 8 op 60 × 40 m. Kies keepers op grote goals als je keepers hebt en het afronden en de opbouw wilt oefenen. Kies kleine goals zonder keepers als je geen keepers hebt of als je veel doelpunten en veel balcontact wilt.',
  organisatie: 'Veld met op beide korte kanten een groot goal met een keeper, of zonder keepers een of twee kleine goals. Twee teams in hesjes, ballen bij de trainer. Speel rondes van 5 tot 10 minuten; heb je meer spelers, dan wissel je door of speel je op twee velden.',
  benodigdheden: ['2 grote goals (zonder keepers: 2 of 4 kleine goals)', '4 pionnen', 'Ballen', 'Hesjes'],
  spelersNodig: 8,
  keepersNodig: 2,
  zonderKeepers: true,
  leeftijden: ALLE,
  doorwisselbaar: true,
  coachpunten: ['Speel en beweeg: vraag de bal op een plek waar je vrij staat', 'Maak het veld groot met balbezit, klein zonder de bal', 'Schakel snel om bij balverlies en balwinst'],
  variaties: {
    makkelijker: ['Groter veld of een speler extra (overtal)', 'De trainer speelt mee voor het team met de bal'],
    moeilijker: ['Kleiner veld', 'Maximaal drie keer raken', 'Een doelpunt telt alleen als iedereen over de middenlijn is'],
  },
  en: {
    naam: 'Small-sided game',
    uitleg:
      'Just a normal game: two teams try to score in each other’s goal. Play anything from 4v4 to 8v8. Pitch size per number of players: 4v4 on 30 × 20 m, 5v5 on 35 × 25 m, 6v6 on 40 × 30 m, 7v7 on 50 × 35 m and 8v8 on 60 × 40 m. Choose keepers on full-size goals if you have keepers and want to work on finishing and build-up. Choose small goals without keepers if you have no keepers or want lots of goals and touches.',
    organisatie: 'Pitch with a full-size goal and a keeper at each end, or without keepers one or two small goals. Two teams in bibs, balls with the coach. Play rounds of 5 to 10 minutes; with more players, rotate or use two pitches.',
    benodigdheden: ['2 full-size goals (without keepers: 2 or 4 small goals)', '4 cones', 'Balls', 'Bibs'],
    coachpunten: ['Pass and move: ask for the ball where you are free', 'Make the pitch big in possession, small without the ball', 'Switch quickly when you lose or win the ball'],
    variaties: {
      makkelijker: ['Bigger pitch or an extra player (overload)', 'The coach plays for the team with the ball'],
      moeilijker: ['Smaller pitch', 'Three touches maximum', 'A goal only counts if everyone is over the halfway line'],
    },
  },
  tekening: draaiKwart({
    ...leeg(30, 44),
    objecten: [
      pion('c1', 2, 1),
      pion('c2', 28, 1),
      pion('c3', 2, 43),
      pion('c4', 28, 43),
      { id: 'gA', soort: 'goal', x: 15, y: 0.5, breedte: 5, hoogte: 2 },
      { id: 'gB', soort: 'goal', x: 15, y: 43.5, breedte: 5, hoogte: 2, hoek: 180 },
      keeper('k1', 1, 15, 1.9, { verdedigt: 'gA' }),
      keeper('k2', 1, 15, 42.1, { verdedigt: 'gB' }),
      speler('a1', 4, 7, 31, { kijkrichting: -90 }),
      speler('a2', 6, 15, 27, { kijkrichting: -90 }),
      speler('a3', 7, 23, 24, { kijkrichting: -90 }),
      speler('a4', 9, 14, 15, { kijkrichting: -90 }),
      B('b1', 4, 8, 12, { kijkrichting: 90 }),
      B('b2', 6, 20, 12, { kijkrichting: 90 }),
      B('b3', 7, 11, 21, { kijkrichting: 90 }),
      B('b4', 9, 19, 19, { kijkrichting: 90 }),
      bal('bal', 7, 30.45, 'a1'),
    ],
    animatie: [
      pauze(0.5),
      stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'b3', naar: [12.6, 23.6], start: 0.3 }),
      stap({ type: 'pass', van: 'a2', naar: 'a3' }, { type: 'loop', wie: 'b4', naar: [21, 21.6], start: 0.3 }, { type: 'loop', wie: 'a4', naar: [16, 12.6], manier: 'sprint', start: 0.2 }),
      stap({ type: 'dribbel', wie: 'a3', naar: [25.4, 18] }, { type: 'loop', wie: 'b4', naar: [20.6, 18.6], start: 0.3 }, { type: 'loop', wie: 'a1', naar: [10, 22], manier: 'sprint' }),
      stap({ type: 'pass', van: 'a3', naar: 'a4' }, { type: 'loop', wie: 'b2', naar: [19, 9.6], start: 0.2 }),
      stap({ type: 'dribbel', wie: 'a4', naar: [14.6, 9] }, { type: 'loop', wie: 'b1', naar: [11.6, 7.6], start: 0.2 }),
      stap({ type: 'schot', van: 'a4', naar: [17.3, 0.7], hoogte: 'grond', afloop: 'vangt', duikNaar: [17.1, 1.6], vasthouden: true }),
      pauze(0.5),
      stap({ type: 'loop', wie: 'b1', naar: [6, 12], manier: 'sprint' }, { type: 'loop', wie: 'a4', naar: [15.4, 13], duur: 1.2 }),
      stap({ type: 'pass', van: 'k1', naar: 'b1', worp: 'bovenhands' }),
      stap({ type: 'dribbel', wie: 'b1', naar: [6.4, 20], manier: 'sprint' }, { type: 'loop', wie: 'b3', naar: [13, 31], manier: 'sprint' }, { type: 'loop', wie: 'a1', naar: [8.6, 25], manier: 'sprint', start: 0.3 }),
      stap({ type: 'pass', van: 'b1', naar: 'b3' }),
      stap({ type: 'schot', van: 'b3', naar: [13.2, 43.7], hoogte: 'laag', afloop: 'goal' }),
      pauze(0.9),
    ],
  }),
};

// ---------- 8. Partijspel met kameleon (was: Jokerpartij voor de mini's) ----------
const kameleon = {
  id: 'veld-mt-jokerpartij',
  naam: 'Partijspel met kameleon',
  categorieen: ['partijvormen'],
  uitleg:
    'Een gewoon partijspel met één speler in een andere kleur: de kameleon. Die speelt altijd mee met het team dat de bal heeft. Zo heeft het team met de bal steeds een speler meer. Speel de bal naar de kameleon en loop vrij. Verlies je de bal, dan is de kameleon meteen van de ander.',
  organisatie:
    'Zelfde opzet als Partijspel, met een hesje in een andere kleur voor de kameleon. Mini’s: veldje van 16 × 20 m met op de korte kanten een mini-goaltje, en de trainer kan de kameleon zijn. Daarboven 3 tegen 3 tot 8 tegen 8 plus kameleon, op kleine goals of met keepers op grote goals. Wissel om de 2 minuten van kameleon.',
  benodigdheden: ['2 kleine goals of mini-goaltjes', '4 hoedjes', 'Hesjes in 3 kleuren', 'Voetballen'],
  spelersNodig: 5,
  keepersNodig: 0,
  leeftijden: ALLE,
  doorwisselbaar: true,
  coachpunten: ['Gebruik de kameleon: speel hem aan en loop meteen door', 'Kameleon: sta vrij aan de kant van de bal en speel snel door', 'Schakel snel om: de kameleon wisselt mee'],
  variaties: {
    makkelijker: ['Veld groter', 'Twee kameleons'],
    moeilijker: ['Kameleon mag één keer raken', 'Veld kleiner', 'Kameleon mag niet scoren'],
  },
  en: {
    naam: 'Small-sided game with a chameleon',
    uitleg:
      'A normal game with one player in a different colour: the chameleon. The chameleon always plays with the team that has the ball, so the team in possession always has one extra player. Play the ball to the chameleon and move into space. Lose the ball and the chameleon switches to the other team straight away.',
    organisatie:
      'Same set-up as Small-sided game, with a different-coloured bib for the chameleon. Minis: 16 × 20 m pitch with a mini goal at each short end, and the coach can be the chameleon. Older groups 3v3 to 8v8 plus chameleon, on small goals or with keepers on full-size goals. Change chameleon every 2 minutes.',
    benodigdheden: ['2 small goals or mini goals', '4 disc cones', 'Bibs in 3 colours', 'Footballs'],
    coachpunten: ['Use the chameleon: play to them and keep moving', 'Chameleon: get free on the ball side and play quickly', 'Switch quickly: the chameleon switches too'],
    variaties: {
      makkelijker: ['Bigger pitch', 'Two chameleons'],
      moeilijker: ['Chameleon gets one touch', 'Smaller pitch', 'The chameleon may not score'],
    },
  },
  tekening: {
    ...leeg(19, 22),
    objecten: [
      { id: 'vak', soort: 'zone', x: 9, y: 11, breedte: 16, lengte: 20 },
      hoedje('v1', 1, 1),
      hoedje('v2', 17, 1),
      hoedje('v3', 1, 21),
      hoedje('v4', 17, 21),
      { id: 'g1', soort: 'klein-goal', x: 9, y: 1.2, hoek: 0, breedte: 1.5, hoogte: 0.9, lengte: 0.7, zonderNet: true },
      { id: 'g2', soort: 'klein-goal', x: 9, y: 20.8, hoek: 180, breedte: 1.5, hoogte: 0.9, lengte: 0.7, zonderNet: true },
      speler('j1', 7, 9, 12.4, { team: 'J', kijkrichting: 90 }),
      speler('a1', 1, 9, 16.4, { kijkrichting: -90 }),
      speler('a2', 2, 4, 13, { kijkrichting: -60 }),
      speler('a3', 3, 14, 13, { kijkrichting: -120 }),
      B('c1', 4, 9.6, 10, { kijkrichting: 90 }),
      B('c2', 5, 5.5, 7.6, { kijkrichting: 90 }),
      B('c3', 6, 12.5, 7.6, { kijkrichting: 90 }),
      bal('b1', 9, 15.85, 'a1'),
      bal('b2', 16.6, 8, null),
    ],
    animatie: [
      pauze(0.4),
      stap({ type: 'pass', van: 'a1', naar: 'j1' }, { type: 'loop', wie: 'a1', naar: [6.4, 13.8], start: 0.3, duur: 1 }, { type: 'loop', wie: 'a3', naar: [13, 9.4], duur: 1.2 }, { type: 'loop', wie: 'c3', naar: [12, 6.8], duur: 1.2 }),
      stap({ type: 'pass', van: 'j1', naar: 'a3' }),
      stap({ type: 'dribbel', wie: 'a3', via: [[15.2, 7.4]], naar: [13.6, 4.6], duur: 1.9 }, { type: 'loop', wie: 'c3', naar: [11.4, 5.4], manier: 'verdedigend', start: 0.4, duur: 1.5 }, { type: 'loop', wie: 'c1', naar: [9.2, 5.6], manier: 'sprint', duur: 1.9 }, { type: 'loop', wie: 'j1', naar: [10.4, 11], duur: 1.4 }),
      stap({ type: 'schot', van: 'a3', naar: [9, 0.8] }),
      pauze(0.4),
      // Nieuwe bal voor het andere team: nu speelt de kameleon daarmee mee.
      stap({ type: 'loop', wie: 'c3', naar: [16, 8], manier: 'sprint', duur: 1.1 }),
      stap({ type: 'dribbel', wie: 'c3', naar: [14.5, 12], duur: 1.2 }, { type: 'loop', wie: 'j1', naar: [10, 13], duur: 1.2 }),
      stap({ type: 'pass', van: 'c3', naar: 'j1' }),
      stap({ type: 'loop', wie: 'c3', naar: [14.6, 16.4], manier: 'sprint', duur: 1 }),
      stap({ type: 'pass', van: 'j1', naar: 'c3' }),
      stap({ type: 'dribbel', wie: 'c3', naar: [13, 17.6], duur: 0.7 }),
      stap({ type: 'schot', van: 'c3', naar: [9, 21.2] }),
      pauze(0.8),
    ],
  },
};

zet('veld', [popActie, slalom, wendingen, tempo, passief, spiegel, partijspel, kameleon]);
