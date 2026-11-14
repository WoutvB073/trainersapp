// Fase 1 van de volgende stap: vijf uitgewerkte oefeningen uit VOORSTEL-OEFENINGEN.md (T12, P1, A1, V1 en KL1), als voorbeeld van de
// kwaliteit. Draaien: node tools/nieuw/volgende-stap-a.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, speler, trainer, bal, pion, hoedje, pauze, stap } = require('./bouwstenen.cjs');

const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const zone = (id, x, y, breedte, lengte, kleur) => ({ id, soort: 'zone', x, y, breedte, lengte, ...(kleur ? { kleur } : {}) });
const leeg = (breedte, lengte, camera = 'schuin') => ({ veld: { type: 'leeg', breedte, lengte }, camera });
const JO = ['jo8-11', 'jo12-15', 'jo16-19'];
const OUD = ['jo12-15', 'jo16-19'];
const GEEL = '#ffd23f';
const r2 = (v) => Math.round(v * 100) / 100;
/** Hoek tussen −180 en 180 graden. */
const hoek = (h) => ((((h + 180) % 360) + 360) % 360) - 180;
const isPunt = (v) => Array.isArray(v) && v.length === 2 && typeof v[0] === 'number';

/** Alle punten van een tekening omrekenen met `p`; hoeken (kijkrichting, kijk) schuiven `graden` op. */
function omrekenen(t, p, graden = 0) {
  const actie = (a) => {
    const n = { ...a };
    for (const k of ['naar', 'terug', 'stuitOp', 'terugNaar', 'afloopNaar', 'duikNaar', 'stompNaar']) if (isPunt(n[k])) n[k] = p(n[k]);
    if (Array.isArray(n.via)) n.via = n.via.map(p);
    if (typeof n.kijk === 'number') n.kijk = hoek(n.kijk + graden);
    return n;
  };
  return {
    ...t,
    objecten: t.objecten.map((o) => {
      const [x, y] = p([o.x, o.y]);
      return { ...o, x, y, ...(o.kijkrichting !== undefined ? { kijkrichting: hoek(o.kijkrichting + graden) } : {}) };
    }),
    animatie: t.animatie.map((s) => (s.acties ? { ...s, acties: s.acties.map(actie) } : s)),
  };
}
/** Draai om het punt c (met de klok mee in beeld). Zo staan spelers in 3D niet achter elkaar. */
/** Schaal vanaf de rand van 1 m (vak kleiner of groter maken). */
function schaal(t, fx, fy) {
  const n = omrekenen(t, ([x, y]) => [r2(1 + (x - 1) * fx), r2(1 + (y - 1) * fy)]);
  return { ...n, objecten: n.objecten.map((o) => (o.soort === 'zone' ? { ...o, breedte: r2(o.breedte * fx), lengte: r2(o.lengte * fy) } : o)) };
}
const draai = (t, c, graden) => {
  const h = (graden * Math.PI) / 180;
  return omrekenen(t, ([x, y]) => [r2(c[0] + (x - c[0]) * Math.cos(h) - (y - c[1]) * Math.sin(h)), r2(c[1] + (x - c[0]) * Math.sin(h) + (y - c[1]) * Math.cos(h))], graden);
};

const spelers = [
  // T12. Kruis: aannemen en opendraaien
  {
    id: 'veld-tq-kruis-opendraaien',
    naam: 'Kruis: aannemen en opendraaien',
    categorieen: ['techniek', 'pass-en-trap'],
    uitleg:
      'Vier kinderen staan op de punten van een kruis, één kind staat in het midden. De bal komt van een punt naar het midden. Het kind in het midden vraagt om de bal, neemt hem aan met het lichaam half open en draait met de eerste aanraking naar de volgende punt. Daar speelt het de bal heen. Die punt speelt meteen weer in op het midden, en zo gaat de bal het hele kruis rond. Na een rondje wisselt het midden: wie de laatste bal krijgt, dribbelt naar het midden.',
    organisatie:
      'Kruis met vier hoedjes op 5 m van het midden; in het midden een vakje van 3 × 3 m. Eén kind per punt, één in het midden, één bal. Na elk rondje een nieuw kind in het midden; na een paar rondjes de andere kant op draaien.',
    benodigdheden: ['8 hoedjes', '1 bal'],
    spelersNodig: 5,
    keepersNodig: 0,
    leeftijden: ['mini-5-7', 'jo8-11'],
    doorwisselbaar: true,
    coachpunten: [
      'Kijk over je schouder voordat de bal komt: waar moet hij heen?',
      'Sta half open, dan zie je de bal en de volgende punt tegelijk',
      'Neem aan met je verste voet en draai in dezelfde beweging mee',
      'Speel de bal strak over de grond in de voeten',
    ],
    variaties: {
      makkelijker: ['Kleiner kruis (4 m)', 'Twee keer raken mag: eerst stilleggen, dan draaien'],
      moeilijker: ['De andere kant op draaien, dus aannemen met je andere voet', 'De trainer roept een kleur: daar gaat de bal heen', 'In het midden maximaal twee aanrakingen'],
    },
    en: {
      naam: 'Cross: receive and open up',
      uitleg:
        'Four children stand on the points of a cross, one child stands in the middle. The ball comes from a point into the middle. The child in the middle asks for the ball, receives it half-turned and turns with the first touch towards the next point. That is where the ball goes. That point plays straight back into the middle, and so the ball travels all the way round the cross. After one lap the middle changes: whoever gets the last ball dribbles into the middle.',
      organisatie:
        'Cross with four disc cones 5 m from the middle; a 3 × 3 m box in the middle. One child per point, one in the middle, one ball. A new child in the middle after every lap; after a few laps go round the other way.',
      benodigdheden: ['8 disc cones', '1 ball'],
      coachpunten: [
        'Look over your shoulder before the ball arrives: where does it need to go?',
        'Stand half-turned, so you can see the ball and the next point at the same time',
        'Receive with your far foot and turn in the same movement',
        'Play the ball firmly along the ground to feet',
      ],
      variaties: {
        makkelijker: ['Smaller cross (4 m)', 'Two touches allowed: stop the ball first, then turn'],
        moeilijker: ['Go round the other way, so receive with your other foot', 'The coach calls a colour: that is where the ball goes', 'No more than two touches in the middle'],
      },
    },
    tekening: draai(
      {
        ...leeg(14, 14),
        objecten: [
          hoedje('hn', 7, 0.9, GEEL),
          hoedje('he', 13.1, 7, GEEL),
          hoedje('hs', 7, 13.1, GEEL),
          hoedje('hw', 0.9, 7, GEEL),
          hoedje('m1', 5.7, 5.7),
          hoedje('m2', 8.3, 5.7),
          hoedje('m3', 5.7, 8.3),
          hoedje('m4', 8.3, 8.3),
          speler('n', 1, 7, 2, { kijkrichting: 90 }),
          speler('e', 2, 12, 7, { kijkrichting: 180 }),
          speler('s', 3, 7, 12, { kijkrichting: -90 }),
          speler('w', 4, 2, 7, { kijkrichting: 0 }),
          speler('m', 5, 7, 7, { kijkrichting: -90 }),
          bal('bal', 7, 2.55, 'n'),
        ],
        animatie: [
          pauze(0.5),
          // Van noord naar het midden, opendraaien naar oost.
          stap({ type: 'loop', wie: 'm', naar: [7, 6.3], duur: 0.5 }, { type: 'pass', van: 'n', naar: 'm', start: 0.15 }),
          stap({ type: 'dribbel', wie: 'm', naar: [7.9, 6.7], duur: 0.7 }),
          stap({ type: 'pass', van: 'm', naar: 'e' }),
          // Oost speelt terug, opendraaien naar zuid.
          stap({ type: 'loop', wie: 'm', naar: [7.8, 7], duur: 0.4, kijk: 0 }, { type: 'pass', van: 'e', naar: 'm', start: 0.15 }),
          stap({ type: 'dribbel', wie: 'm', naar: [7.3, 7.9], duur: 0.7 }),
          stap({ type: 'pass', van: 'm', naar: 's' }),
          // Zuid speelt terug, opendraaien naar west.
          stap({ type: 'loop', wie: 'm', naar: [7, 7.8], duur: 0.4, kijk: 90 }, { type: 'pass', van: 's', naar: 'm', start: 0.15 }),
          stap({ type: 'dribbel', wie: 'm', naar: [6.1, 7.3], duur: 0.7 }),
          stap({ type: 'pass', van: 'm', naar: 'w' }),
          // West speelt terug, opendraaien naar noord.
          stap({ type: 'loop', wie: 'm', naar: [6.2, 7], duur: 0.4, kijk: 180 }, { type: 'pass', van: 'w', naar: 'm', start: 0.15 }),
          stap({ type: 'dribbel', wie: 'm', naar: [6.7, 6.1], duur: 0.7 }),
          stap({ type: 'pass', van: 'm', naar: 'n' }),
          // Wissel: noord dribbelt naar het midden, het midden neemt de punt over.
          stap({ type: 'dribbel', wie: 'n', via: [[8.6, 4.2]], naar: [7, 6.6] }, { type: 'loop', wie: 'm', via: [[5.4, 4.2]], naar: [7, 2], start: 0.2 }),
          stap({ type: 'draai', wie: 'm', kijk: 90 }),
          pauze(0.8),
        ],
      },
      [7, 7],
      45,
    ),
  },

  // P1. Ruit met de derde man
  {
    id: 'veld-pt-ruit-derde-man',
    naam: 'Ruit met de derde man',
    categorieen: ['pass-en-trap'],
    uitleg:
      'Vier spelers in een ruit. De onderste speler speelt de bal in op de bovenste, die kort komt. Die kaatst in één keer af op de speler aan de zijkant, die naar binnen is gekomen. Intussen sprint de speler aan de andere zijkant als derde man de diepte in, achter de kaatser langs, en krijgt de diepe bal in de loop. Bovenaan draait het patroon om en gaat de bal op dezelfde manier terug naar beneden. Iedereen schuift door: de kaatser neemt de vrijgekomen zijkant over.',
    organisatie:
      'Ruit van 18 m lang en 12 m breed, met een pion op elke punt. Eén speler per punt, één bal. De bal gaat heen en weer; na een paar minuten de andere zijkant de diepte in laten gaan, zodat iedereen met beide voeten speelt.',
    benodigdheden: ['4 pionnen', 'Ballen'],
    spelersNodig: 4,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: [
      'Kom kort op het moment dat de passer opkijkt, niet eerder',
      'Kaats in één keer en op de goede voet: de bal mag niet stilliggen',
      'Derde man: start op de kaats, dan krijg je de bal in de loop',
      'Speel de diepe bal voor de man, zodat hij niet hoeft in te houden',
    ],
    variaties: {
      makkelijker: ['Kleinere ruit', 'Twee aanrakingen bij het kaatsen', 'Eerst in wandeltempo, zodat iedereen de looplijnen kent'],
      moeilijker: ['Alles in één aanraking', 'Een pop of een passieve verdediger in de rug van de kaatser', 'Twee ballen tegelijk: één begint onder, één boven'],
    },
    en: {
      naam: 'Diamond with the third man',
      uitleg:
        'Four players in a diamond. The bottom player plays the ball into the top player, who comes short. They lay it off first time to the player on the side, who has come inside. Meanwhile the player on the other side sprints forward as the third man, round the back of the player who laid it off, and receives the through ball in their stride. At the top the pattern turns round and the ball goes back down the same way. Everyone rotates: the player who laid it off takes over the free side.',
      organisatie:
        'Diamond 18 m long and 12 m wide, with a cone on each point. One player per point, one ball. The ball goes back and forth; after a few minutes let the other side make the forward run, so everyone uses both feet.',
      benodigdheden: ['4 cones', 'Balls'],
      coachpunten: [
        'Come short the moment the passer looks up, not before',
        'Lay it off first time and onto the right foot: the ball must not stop',
        'Third man: go on the lay-off, so you get the ball in your stride',
        'Play the through ball in front of the runner, so they do not have to slow down',
      ],
      variaties: {
        makkelijker: ['Smaller diamond', 'Two touches for the lay-off', 'At walking pace first, so everyone knows the runs'],
        moeilijker: ['Everything one touch', 'A mannequin or passive defender behind the player laying it off', 'Two balls at once: one starts at the bottom, one at the top'],
      },
    },
    tekening: {
      ...leeg(20, 24),
      objecten: [
        pion('po', 10, 22.2),
        pion('pl', 2.8, 12),
        pion('pr', 17.2, 12),
        pion('pb', 10, 1.8),
        speler('a1', 1, 10, 21, { kijkrichting: -90 }),
        speler('a2', 2, 4, 12, { kijkrichting: 0 }),
        speler('a3', 3, 10, 3, { kijkrichting: 90 }),
        speler('a4', 4, 16, 12, { kijkrichting: 180 }),
        bal('bal', 10, 20.45, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        // Naar boven: 1 speelt 3 in, 3 kaatst op 2, 4 gaat als derde man diep.
        stap({ type: 'loop', wie: 'a3', naar: [10, 8.6], duur: 1.0 }, { type: 'pass', van: 'a1', naar: 'a3', start: 0.3 }, { type: 'loop', wie: 'a2', naar: [6.8, 12.8], start: 0.5, duur: 0.8 }),
        stap({ type: 'pass', van: 'a3', naar: 'a2', direct: true }, { type: 'loop', wie: 'a4', via: [[15.4, 7.2]], naar: [10.8, 3.4], manier: 'sprint', tempo: 'gelijkmatig' }),
        stap({ type: 'pass', van: 'a2', naar: 'a4', direct: true }, { type: 'loop', wie: 'a3', naar: [16, 12], start: 0.1 }),
        stap({ type: 'dribbel', wie: 'a4', naar: [10, 3], duur: 0.6 }, { type: 'loop', wie: 'a2', naar: [4, 12], kijk: 0 }),
        stap({ type: 'truc', wie: 'a4', soort: 'zool', kijk: 90 }, { type: 'draai', wie: 'a3', kijk: 180 }),
        pauze(0.3),
        // Naar beneden: 4 speelt 1 in, 1 kaatst op 3, 2 gaat als derde man diep.
        stap({ type: 'loop', wie: 'a1', naar: [10, 15.4], duur: 1.0 }, { type: 'pass', van: 'a4', naar: 'a1', start: 0.3 }, { type: 'loop', wie: 'a3', naar: [13.2, 11.2], start: 0.5, duur: 0.8 }),
        stap({ type: 'pass', van: 'a1', naar: 'a3', direct: true }, { type: 'loop', wie: 'a2', via: [[4.6, 16.8]], naar: [9.2, 20.6], manier: 'sprint', tempo: 'gelijkmatig' }),
        stap({ type: 'pass', van: 'a3', naar: 'a2', direct: true }, { type: 'loop', wie: 'a1', naar: [4, 12], start: 0.1 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [10, 21], duur: 0.6 }, { type: 'loop', wie: 'a3', naar: [16, 12], kijk: 180 }),
        stap({ type: 'truc', wie: 'a2', soort: 'zool', kijk: -90 }, { type: 'draai', wie: 'a1', kijk: 0 }),
        pauze(0.8),
      ],
    },
  },

  // A1. Schot, rebound en intikken
  {
    id: 'veld-af-schot-rebound-intikken',
    naam: 'Schot, rebound en intikken',
    categorieen: ['afwerken'],
    uitleg:
      'Twee rijen: een schietrij recht voor het doel en een rij schuin opzij. De eerste speler dribbelt aan en schiet laag en hard op doel. Op het moment van het schot sprint de speler uit de andere rij richting doel. De keeper keert de bal en de tweede speler tikt de rebound binnen. Komt de bal van de paal of blijft hij los liggen, dan is dat ook een rebound: altijd doorlopen tot de bal in het net ligt of de keeper hem vast heeft. Daarna wissel je van rij.',
    organisatie:
      'Op een half veld met een keeper. Schietrij op 20 m recht voor het doel (iedereen een bal), tweede rij op 14 m schuin opzij. Schieten vanaf ± 16 m. Na je beurt sluit je aan bij de andere rij; haal eerst je bal op.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: [
      'Schutter: schiet laag en in de verre hoek, dan valt de rebound vaak voor het doel',
      'Loper: start op het moment van het schot, niet pas als de bal terugkomt',
      'Loop door tot voor het doel en reken op de rebound, ook als het schot goed lijkt',
      'Tik rustig binnen met de binnenkant: plaatsen is genoeg',
    ],
    variaties: {
      makkelijker: ['Schieten van dichterbij (12 m)', 'Komt er geen rebound, dan rolt de trainer een tweede bal voor het doel'],
      moeilijker: ['Een verdediger loopt mee met de tweede speler', 'De rebound moet in één keer worden afgerond', 'Ook de schutter loopt door: twee spelers op de rebound'],
    },
    en: {
      naam: 'Shot, rebound and tap-in',
      uitleg:
        'Two lines: a shooting line straight in front of goal and a line off to one side. The first player dribbles forward and shoots low and hard at goal. The moment the shot is taken, the player from the other line sprints towards goal. The keeper saves the ball and the second player taps in the rebound. If the ball comes back off the post or stays loose, that is a rebound too: always follow in until the ball is in the net or the keeper has it. Then swap lines.',
      organisatie:
        'On half a pitch with a keeper. Shooting line 20 m straight in front of goal (a ball each), second line 14 m out and off to one side. Shoot from about 16 m. After your turn, join the other line; collect your ball first.',
      benodigdheden: ['Goal', '2 cones', 'Balls'],
      coachpunten: [
        'Shooter: shoot low and across goal, so the rebound often drops in front of goal',
        'Runner: go the moment the shot is taken, not when the ball comes back',
        'Follow in all the way and expect the rebound, even when the shot looks good',
        'Tap in calmly with the inside of the foot: placement is enough',
      ],
      variaties: {
        makkelijker: ['Shoot from closer in (12 m)', 'If there is no rebound, the coach rolls a second ball in front of goal'],
        moeilijker: ['A defender tracks the second player', 'The rebound must be finished first time', 'The shooter follows in too: two players on the rebound'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 20, y: -3, breedte: 30, lengte: 30 },
      camera: 'schuin',
      rijen: [
        { id: 'rS', x: 30, y: 20, richting: 115, spelers: ['a1', 'a3'] },
        { id: 'rL', x: 43.5, y: 16.6, richting: 35, spelers: ['a2', 'a4'] },
      ],
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        pion('ps', 31.4, 20.8),
        pion('pr', 45.2, 15.2),
        speler('a1', 9, 0, 0),
        speler('a3', 10, 0, 0),
        speler('a2', 7, 0, 0),
        speler('a4', 11, 0, 0),
        bal('b1', 0, 0, 'a1'),
        bal('b2', 0, 0, 'a3'),
      ],
      animatie: [
        pauze(0.5),
        {
          herhaal: {
            spelers: ['a1', 'a3'],
            tussen: 5.2,
            waarden: {
              loper: ['a2', 'a4'],
              // Eerst keert de keeper de bal naar de zijkant, daarna naar het midden: de loper is er steeds bij.
              doel: [
                [36.6, -0.2],
                [31.4, -0.2],
              ],
              weg: [
                [37.6, 6.4],
                [34.4, 6.8],
              ],
              plek: [
                [38.2, 7.2],
                [35, 7.6],
              ],
              intik: [
                [31.8, -0.3],
                [36.8, -0.3],
              ],
            },
            stappen: [
              stap({ type: 'dribbel', wie: '@', naar: [30.6, 16.6], duur: 1.1 }),
              stap(
                { type: 'schot', van: '@', naar: '@doel', hoogte: 'grond', afloop: 'stompt', afloopNaar: '@weg', snelheid: 22 },
                { type: 'loop', wie: '@loper', naar: '@plek', manier: 'sprint', tempo: 'versnellen', start: 0.3 },
              ),
              stap({ type: 'schot', van: '@loper', naar: '@intik', hoogte: 'grond', afloop: 'goal', direct: true }),
              pauze(0.4),
              // Wisselen van rij: de schutter wordt loper, de loper gaat buitenom naar de schietrij.
              stap({ type: 'aansluiten', wie: '@', rij: 'rL' }, { type: 'loop', wie: '@loper', naar: [26.4, 11], spoor: false }),
              stap({ type: 'aansluiten', wie: '@loper', rij: 'rS' }),
            ],
          },
        },
        pauze(0.6),
      ],
    },
  },

  // V1. Kantelen als blok
  {
    id: 'veld-vo-kantelen-blok',
    naam: 'Kantelen als blok',
    categorieen: ['verdedigen-omschakelen'],
    uitleg:
      'Drie aanvallers spelen de bal breed heen en weer. Vier verdedigers verdedigen samen drie poortjes en bewegen als één blok mee met de bal: ze kantelen. De verdediger het dichtst bij de bal stapt uit en zet druk, de speler naast hem geeft rugdekking (schuin achter hem) en de twee anderen schuiven naar binnen, zodat de afstanden klein blijven. Gaat de bal naar de andere kant, dan schuift het hele blok mee terwijl de bal onderweg is. De aanvallers scoren door de bal door een poortje te passen; onderscheppen de verdedigers de bal, dan is het punt voor hen.',
    organisatie:
      'Vak van 28 × 18 m. Op de ene lange zijde drie poortjes van 2,5 m, daarvoor vier verdedigers op een lijn met ± 5 m tussenruimte. Drie aanvallers aan de overkant: links, midden en rechts. Eerst spelen de aanvallers alleen breed, zodat de verdedigers het schuiven oefenen; daarna mogen ze door een poortje passen. Na 2 minuten wisselen.',
    benodigdheden: ['6 pionnen', '4 hoedjes', 'Ballen', 'Hesjes'],
    spelersNodig: 7,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: vier aanvallers tegen vier verdedigers, of wissel om de twee minuten een nieuw viertal verdedigers in.',
    coachpunten: [
      'Schuif terwijl de bal onderweg is, niet pas als hij aankomt',
      'De dichtstbijzijnde zet druk, de speler ernaast staat schuin achter hem (rugdekking)',
      'Houd ongeveer 5 meter tussen elkaar: nooit een pass tussen twee verdedigers door',
      'De verste verdediger laat zijn kant los en schuift naar binnen',
    ],
    variaties: {
      makkelijker: ['De aanvallers spelen in wandeltempo en houden de bal steeds even stil', 'Alleen breed spelen, nog niet scoren'],
      moeilijker: [
        'Een vierde aanvaller tussen de verdedigers en de poortjes',
        'De aanvallers mogen ook door een poortje dribbelen',
        'Na balwinst scoren de verdedigers op een doeltje aan de overkant',
      ],
    },
    en: {
      naam: 'Shifting as a block',
      uitleg:
        'Three attackers move the ball from side to side. Four defenders protect three gates together and move with the ball as one block: they shift across. The defender nearest the ball steps out and presses, the player next to them covers (diagonally behind) and the other two tuck inside, so the distances stay small. When the ball goes to the other side, the whole block shifts while the ball is travelling. The attackers score by passing the ball through a gate; if the defenders intercept, the point is theirs.',
      organisatie:
        '28 × 18 m area. Three 2.5 m gates on one long side, with four defenders in a line in front of them, about 5 m apart. Three attackers on the other side: left, centre and right. At first the attackers only play from side to side, so the defenders practise shifting; then they may pass through a gate. Swap after 2 minutes.',
      benodigdheden: ['6 cones', '4 disc cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: four attackers against four defenders, or bring in a new back four every two minutes.',
      coachpunten: [
        'Shift while the ball is travelling, not when it arrives',
        'The nearest player presses, the player next to them stands diagonally behind (cover)',
        'Keep about 5 metres between you: never a pass between two defenders',
        'The far-side defender leaves their side and tucks inside',
      ],
      variaties: {
        makkelijker: ['The attackers play at walking pace and stop the ball each time', 'Side to side only, no scoring yet'],
        moeilijker: [
          'A fourth attacker between the defenders and the gates',
          'The attackers may also dribble through a gate',
          'After winning the ball the defenders score in a mini goal at the other end',
        ],
      },
    },
    tekening: {
      ...leeg(30, 20),
      ...schaal(
        {
          objecten: [
            zone('z', 18, 11, 34, 20),
            hoedje('h1', 1, 1),
            hoedje('h2', 35, 1),
            hoedje('h3', 1, 21),
            hoedje('h4', 35, 21),
            pion('g1a', 6.5, 1),
            pion('g1b', 9.5, 1),
            pion('g2a', 16.5, 1),
            pion('g2b', 19.5, 1),
            pion('g3a', 26.5, 1),
            pion('g3b', 29.5, 1),
            // Verdedigers (blauw) kijken naar de aanvallers: de rechtsback (2) staat links in beeld.
            B('d2', 2, 9, 8.4, { kijkrichting: 90 }),
            B('d3', 3, 15, 8, { kijkrichting: 90 }),
            B('d4', 4, 21, 8, { kijkrichting: 90 }),
            B('d5', 5, 27, 8.4, { kijkrichting: 90 }),
            speler('a11', 11, 5, 17, { kijkrichting: -70 }),
            speler('a10', 10, 18, 18.4, { kijkrichting: -90 }),
            speler('a7', 7, 31, 17, { kijkrichting: -110 }),
            bal('bal', 18, 17.85, 'a10'),
          ],
          animatie: [
            pauze(0.6),
            // Bal naar links: het blok kantelt naar links.
            stap(
              { type: 'pass', van: 'a10', naar: 'a11' },
              { type: 'loop', wie: 'd2', naar: [6.2, 13.4], manier: 'sprint', start: 0.1 },
              { type: 'loop', wie: 'd3', naar: [10.8, 10.6], start: 0.1 },
              { type: 'loop', wie: 'd4', naar: [16, 9.4], start: 0.15 },
              { type: 'loop', wie: 'd5', naar: [21.2, 9], start: 0.2 },
            ),
            stap({ type: 'draai', wie: 'd2', naar: 'a11' }, { type: 'draai', wie: 'd3', naar: 'a11' }, { type: 'draai', wie: 'd4', naar: 'a11' }, { type: 'draai', wie: 'd5', naar: 'a11' }),
            pauze(0.5),
            // Terug naar het midden: het blok staat weer vlak en compact, de centrale verdediger stapt uit.
            stap(
              { type: 'pass', van: 'a11', naar: 'a10' },
              { type: 'loop', wie: 'd2', naar: [10.6, 10.2], manier: 'achteruit', start: 0.1 },
              { type: 'loop', wie: 'd3', naar: [16.6, 13.2], start: 0.1 },
              { type: 'loop', wie: 'd4', naar: [21.4, 10.6], start: 0.15 },
              { type: 'loop', wie: 'd5', naar: [26, 9.4], start: 0.2 },
            ),
            stap({ type: 'draai', wie: 'd2', naar: 'a10' }, { type: 'draai', wie: 'd3', naar: 'a10' }, { type: 'draai', wie: 'd4', naar: 'a10' }, { type: 'draai', wie: 'd5', naar: 'a10' }),
            pauze(0.4),
            // Bal naar rechts: het blok kantelt naar rechts.
            stap(
              { type: 'pass', van: 'a10', naar: 'a7' },
              { type: 'loop', wie: 'd5', naar: [29.8, 13.4], manier: 'sprint', start: 0.1 },
              { type: 'loop', wie: 'd4', naar: [25.2, 10.6], start: 0.1 },
              { type: 'loop', wie: 'd3', naar: [20, 9.4], manier: 'achteruit', start: 0.15 },
              { type: 'loop', wie: 'd2', naar: [14.8, 9], start: 0.2 },
            ),
            stap({ type: 'draai', wie: 'd2', naar: 'a7' }, { type: 'draai', wie: 'd3', naar: 'a7' }, { type: 'draai', wie: 'd4', naar: 'a7' }, { type: 'draai', wie: 'd5', naar: 'a7' }),
            pauze(0.5),
            // De pass naar het poortje wordt onderschept door de rugdekking.
            stap({ type: 'pass', van: 'a7', naar: [18.6, 1.2], onderschept: 'd4' }),
            pauze(1.0),
          ],
        },
        28 / 34,
        18 / 20,
      ),
    },
  },
];

const keepers = [
  // KL1. Zit, sta op en duik
  {
    id: 'keeper-ld-zit-sta-duik',
    naam: 'Zit, sta op en duik',
    categorieen: ['laag-duiken', 'reactie'],
    uitleg:
      'De keeper zit op de grond met zijn gezicht naar de trainer, benen gestrekt. Op het teken van de trainer staat hij zo snel mogelijk op. Zodra hij staat, rolt de trainer de bal laag naast hem: de keeper duikt en pakt de bal. Hij rolt de bal terug, gaat weer zitten en krijgt de volgende bal aan de andere kant. Zo oefent hij snel overeind komen en meteen klaarstaan voor de volgende bal.',
    organisatie: 'Bij het doel. De keeper zit 2 m voor de doellijn, de trainer staat op 7 m met een paar ballen. Series van 6 ballen, om en om links en rechts, daarna rust of een andere keeper.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: [
      'Kom omhoog zonder je handen op de grond te zetten: voeten onder je lichaam en opdrukken',
      'Kijk tijdens het opstaan al naar de bal',
      'Eerst in je keepershouding, dan pas duiken: op je voorvoeten en met je handen voor je',
      'Duik schuin naar voren op de bal en pak hem met twee handen',
    ],
    variaties: {
      makkelijker: ['Begin vanuit kniezit', 'De trainer wacht tot de keeper helemaal klaarstaat'],
      moeilijker: ['Begin liggend op je buik', 'De trainer rolt de bal al terwijl de keeper opstaat', 'Na de eerste bal meteen een tweede naar de andere hoek'],
    },
    en: {
      naam: 'Sit, get up and dive',
      uitleg:
        'The keeper sits on the ground facing the coach, legs straight. On the coach’s signal the keeper gets up as quickly as possible. As soon as they are up, the coach rolls the ball low to one side: the keeper dives and holds the ball. They roll the ball back, sit down again and get the next ball on the other side. This trains getting up quickly and being set for the next ball straight away.',
      organisatie:
        'At the goal. The keeper sits 2 m in front of the goal line, the coach stands 7 m away with a few balls. Sets of 6 balls, alternating left and right, then a rest or another keeper.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: [
        'Get up without putting your hands on the ground: feet under your body and push up',
        'Watch the ball while you are getting up',
        'Set position first, then dive: on the balls of your feet with your hands in front of you',
        'Dive forward at an angle onto the ball and take it with two hands',
      ],
      variaties: {
        makkelijker: ['Start from kneeling', 'The coach waits until the keeper is fully set'],
        moeilijker: ['Start lying face down', 'The coach rolls the ball while the keeper is still getting up', 'After the first ball, a second one straight to the other corner'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 25, y: -3, breedte: 18, lengte: 15 },
      camera: 'schuin',
      objecten: [goal, keeper('k1', 1, 34, 2.2, { houding: 'zit', kijkrichting: 90 }), trainer(34, 9.4, -90), bal('b1', 34, 8.85, 't1'), bal('b2', 35.3, 10.1), bal('b3', 32.8, 10.2)],
      animatie: [
        pauze(0.7),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'grond', duikNaar: [36.1, 2.7] }),
        pauze(0.5),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands', hoogte: 'grond' }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 2.2], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'zitten', wie: 'k1', houding: 'zit' }),
        pauze(0.5),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 'grond', duikNaar: [31.9, 2.7] }),
        pauze(0.5),
        stap({ type: 'opstaan', wie: 'k1' }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands', hoogte: 'grond' }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 2.2], manier: 'zijwaarts', kijk: 90 }),
        stap({ type: 'zitten', wie: 'k1', houding: 'zit' }),
        pauze(0.6),
      ],
    },
  },
];

zet('veld', spelers);
zet('keepers', keepers);
