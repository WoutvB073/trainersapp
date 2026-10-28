// Spelersoefeningen 0.26.0, deel A3 (7, 8, 10–13; 9 bestaat al als "Kaats en schieten van afstand"). Draaien: node tools/nieuw/spelers-026b.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, speler, bal, pion, pauze, stap } = require('./bouwstenen.cjs');

const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const zone = (id, x, y, breedte, lengte, kleur) => ({ id, soort: 'zone', x, y, breedte, lengte, ...(kleur ? { kleur } : {}) });
const half = (weergave) => ({ veld: { type: 'half' }, weergave, camera: 'schuin' });
const kp = () => keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' });

const oefeningen = [
  // 7. Schieten onder druk
  {
    id: 'veld-af-schieten-onder-druk',
    naam: 'Schieten onder druk',
    categorieen: ['afwerken'],
    uitleg:
      'De aanvaller staat op de rand van de zestien met een verdediger 3 m achter zich. De aangever speelt de bal vanaf de zijkant in; op dat moment sprint de verdediger erop af om het schot te blokken. De aanvaller moet snel afronden: met de eerste aanraking klaarleggen en schieten. Wie een tikje te veel neemt, wordt ingehaald en verliest de bal.',
    organisatie:
      'Aanvaller op 19 m recht voor het doel, verdediger 3 m achter hem. Aangever met ballen rechts op 18 m van het doel en 12 m opzij. Keeper in het doel. Na twee ballen wisselen aanvaller en verdediger.',
    benodigdheden: ['Goal', 'Ballen', '1 hesje'],
    spelersNodig: 3,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Vóór de bal komt al weten welke hoek je kiest',
      'Eerste aanraking schuin naar voren, de bal ligt dan meteen goed om te schieten',
      'Snel en laag: liever een snel schot dan een mooi schot',
    ],
    variaties: {
      makkelijker: ['Verdediger start 5 m erachter', 'Aanvaller mag twee keer raken voor het schot'],
      moeilijker: ['Schieten in één keer', 'Verdediger start naast de aanvaller', 'Pass komt halfhoog: aannemen uit de lucht'],
    },
    en: {
      naam: 'Shooting under pressure',
      uitleg:
        'The attacker stands on the edge of the box with a defender 3 m behind them. The server plays the ball in from the side; at that moment the defender sprints in to block the shot. The attacker has to finish quickly: set it up with the first touch and shoot. Take one touch too many and the defender catches up and wins the ball.',
      organisatie:
        'Attacker at 19 m straight in front of goal, defender 3 m behind them. Server with balls on the right, 18 m from goal and 12 m to the side. Keeper in goal. Attacker and defender swap after two balls.',
      benodigdheden: ['Goal', 'Balls', '1 bib'],
      coachpunten: [
        'Know which corner you’re going for before the ball arrives',
        'First touch diagonally forwards, so the ball is set up to shoot straight away',
        'Quick and low: a quick shot beats a pretty one',
      ],
      variaties: {
        makkelijker: ['The defender starts 5 m behind', 'The attacker may take two touches before shooting'],
        moeilijker: ['First-time shots', 'The defender starts alongside the attacker', 'The pass comes in at mid-height: control it out of the air'],
      },
    },
    tekening: {
      ...half({ x: 20, y: -3, breedte: 30, lengte: 28 }),
      objecten: [
        goal,
        kp(),
        speler('a', 9, 34, 19, { kijkrichting: -60 }),
        B('d', 4, 30.8, 22.4, { kijkrichting: -90 }),
        speler('s', 7, 46, 18, { kijkrichting: 180 }),
        bal('b1', 45.45, 18, 's'),
        bal('b2', 46.8, 18.8),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 's', naar: 'a' }, { type: 'druk', wie: 'd', op: 'a', afstand: 1.7, manier: 'sprint', start: 0.35 }),
        stap({ type: 'dribbel', wie: 'a', naar: [33.2, 17.6], duur: 0.45 }),
        stap({ type: 'schot', van: 'a', naar: [30.9, -0.3], afloop: 'goal' }),
        pauze(0.4),
        stap({ type: 'loop', wie: 'a', naar: [34, 19] }, { type: 'loop', wie: 'd', naar: [30.8, 22.4] }, { type: 'pak', wie: 's', bal: 'b2', start: 0.4 }),
        // Tweede bal: te veel aanrakingen, de verdediger is er.
        stap({ type: 'pass', van: 's', naar: 'a', bal: 'b2' }, { type: 'druk', wie: 'd', op: 'a', afstand: 1.7, manier: 'sprint', start: 0.35 }),
        stap({ type: 'dribbel', wie: 'a', naar: [32.6, 17.2] }),
        stap({ type: 'dribbel', wie: 'a', naar: [31.2, 16.4] }, { type: 'verover', wie: 'd', van: 'a', start: 0.3 }),
        pauze(1.0),
      ],
    },
  },

  // 8. Cutback en afronden
  {
    id: 'veld-af-cutback',
    naam: 'Cutback en afronden',
    categorieen: ['afwerken'],
    uitleg:
      'De buitenspeler dribbelt langs de zijkant tot vlak bij de achterlijn. Twee spelers lopen in: de eerste naar de eerste paal (hij trekt de keeper en verdedigers mee), de tweede blijft iets hangen en komt rond de penaltystip. De buitenspeler legt de bal terug (cutback) op de inloper bij de stip, die in één keer afrondt.',
    organisatie: 'Op een half veld. Buitenspeler met ballen rechts op 26 m van het doel, twee aanvallers centraal op 20–26 m. Keeper in het doel. Na elke actie doordraaien, ook van de linkerkant.',
    benodigdheden: ['Goal', 'Ballen', '2 hoedjes'],
    spelersNodig: 3,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Buitenspeler: tot bijna de achterlijn, dan opkijken en de bal terugleggen over de grond',
      'Inloper bij de stip: niet te vroeg, kom aan als de bal onderweg is',
      'Eerste paal: hard inlopen, zo maak je ruimte achter je',
    ],
    variaties: {
      makkelijker: ['Buitenspeler legt de bal stil terug', 'Inloper mag eerst aannemen'],
      moeilijker: ['Een verdediger in de zestien', 'Buitenspeler kiest: cutback of voorzet op de eerste paal', 'Afronden met het zwakke been'],
    },
    en: {
      naam: 'Cutback and finish',
      uitleg:
        'The wide player dribbles down the flank to just short of the byline. Two players attack the box: the first to the near post (dragging the keeper and defenders with them), the second holds back slightly and arrives around the penalty spot. The wide player cuts the ball back to the runner at the spot, who finishes first time.',
      organisatie: 'On half a pitch. Wide player with balls on the right, 26 m from goal, two attackers centrally at 20–26 m. Keeper in goal. Rotate after each go, also from the left.',
      benodigdheden: ['Goal', 'Balls', '2 disc cones'],
      coachpunten: [
        'Wide player: go almost to the byline, then look up and cut it back along the ground',
        'Runner at the spot: don’t arrive too early, get there as the ball is travelling',
        'Near post: attack it hard, that creates space behind you',
      ],
      variaties: {
        makkelijker: ['The wide player cuts it back gently', 'The runner may control it first'],
        moeilijker: ['A defender in the box', 'The wide player chooses: cutback or cross to the near post', 'Finish with your weaker foot'],
      },
    },
    tekening: {
      ...half({ x: 20, y: -3, breedte: 42, lengte: 32 }),
      objecten: [
        goal,
        kp(),
        speler('w', 7, 54, 26, { kijkrichting: -100 }),
        speler('n', 9, 30, 21, { kijkrichting: -70 }),
        speler('r', 10, 37, 26, { kijkrichting: -90 }),
        bal('b1', 53.9, 25.45, 'w'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'dribbel', wie: 'w', naar: [53, 4.2] }, { type: 'loop', wie: 'n', naar: [37.2, 5.2], manier: 'sprint', start: 1.0 }, { type: 'loop', wie: 'r', naar: [36.2, 14.6], start: 1.4 }),
        stap({ type: 'pass', van: 'w', naar: 'r' }, { type: 'loop', wie: 'r', naar: [35.8, 12.6], start: 0.1 }),
        stap({ type: 'schot', van: 'r', naar: [31.2, -0.3], afloop: 'goal', direct: true }),
        pauze(1.0),
      ],
    },
  },

  // 10. Snel afronden na balwinst
  {
    id: 'veld-af-snel-na-balwinst',
    naam: 'Snel afronden na balwinst',
    categorieen: ['afwerken', 'verdedigen-omschakelen'],
    uitleg:
      'In het middenvak spelen twee verdedigers de bal rond. Twee aanvallers zetten druk en proberen de bal te veroveren. Lukt dat, dan moeten ze binnen 8 seconden scoren op het grote doel; de verdedigers sprinten terug om dat te voorkomen. Geslaagd binnen de tijd = een punt.',
    organisatie:
      'Op een half veld. Middenvak van 30 × 14 m op 23–37 m van het doel. Twee verdedigers (hesjes) met de bal in het vak, twee aanvallers erbij. Keeper in het doel. De trainer telt hardop tot 8.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen', '2 hesjes'],
    spelersNodig: 4,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Druk zetten samen: één op de bal, de ander op de passlijn',
      'Na de balwinst: eerste aanraking vooruit, niet eerst omkijken',
      'Snel naar doel en de tweede man meenemen: 2 tegen de keeper voordat de verdedigers terug zijn',
    ],
    variaties: {
      makkelijker: ['10 seconden de tijd', 'Verdedigers mogen niet terugsprinten'],
      moeilijker: ['6 seconden', 'Drie verdedigers tegen twee aanvallers', 'Na een doelpunt meteen opnieuw: de verdedigers krijgen een nieuwe bal'],
    },
    en: {
      naam: 'Quick finish after winning the ball',
      uitleg:
        'Two defenders pass the ball around in the middle zone. Two attackers press and try to win it. If they do, they have to score on the big goal within 8 seconds; the defenders sprint back to stop them. Done in time = a point.',
      organisatie:
        'On half a pitch. 30 × 14 m middle zone, 23–37 m from goal. Two defenders (bibs) with the ball in the zone, two attackers with them. Keeper in goal. The coach counts to 8 out loud.',
      benodigdheden: ['Goal', '4 cones', 'Balls', '2 bibs'],
      coachpunten: [
        'Press together: one on the ball, the other on the passing lane',
        'After winning it: first touch forwards, don’t look back first',
        'Get to goal quickly and take your teammate with you: 2 against the keeper before the defenders get back',
      ],
      variaties: {
        makkelijker: ['10 seconds', 'The defenders may not sprint back'],
        moeilijker: ['6 seconds', 'Three defenders against two attackers', 'After a goal, go again straight away: the defenders get a new ball'],
      },
    },
    tekening: {
      ...half({ x: 14, y: -3, breedte: 40, lengte: 44 }),
      objecten: [
        goal,
        kp(),
        zone('z', 34, 30, 30, 14),
        B('v1', 4, 27, 31, { kijkrichting: 0 }),
        B('v2', 5, 41, 31, { kijkrichting: 180 }),
        speler('a1', 9, 31, 35.4, { kijkrichting: -90 }),
        speler('a2', 10, 37.5, 26.5, { kijkrichting: 90 }),
        bal('b1', 27.55, 31, 'v1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'v1', naar: 'v2' }, { type: 'druk', wie: 'a2', op: 'v2', afstand: 2.2, manier: 'sprint', start: 0.3 }, { type: 'loop', wie: 'a1', naar: [32.4, 33.6], start: 0.3 }),
        stap({ type: 'pass', van: 'v2', naar: 'v1', onderschept: 'a1' }),
        stap(
          { type: 'dribbel', wie: 'a1', naar: [33.6, 19.4] },
          { type: 'loop', wie: 'a2', naar: [39.8, 15.8], manier: 'sprint', start: 0.1 },
          { type: 'loop', wie: 'v1', naar: [30.4, 21.4], manier: 'sprint', start: 0.5 },
          { type: 'loop', wie: 'v2', naar: [43.6, 22], manier: 'sprint', start: 0.6 },
        ),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }),
        stap({ type: 'schot', van: 'a2', naar: [31.0, -0.3], afloop: 'goal' }),
        pauze(1.0),
      ],
    },
  },

  // 11. Aanvallen in golven na een inworp
  {
    id: 'veld-af-golven-na-inworp',
    naam: 'Aanvallen in golven na een inworp',
    categorieen: ['afwerken'],
    uitleg:
      'Inworp aan de zijkant, ter hoogte van de zestien. De ontvanger komt kort, neemt aan en dribbelt richting de achterlijn. Intussen komen de aanvallers in golven de zestien in: eerst twee spelers naar de eerste en de tweede paal, daarna een derde speler die achter hen blijft en rond de rand van de zestien aankomt. De ontvanger kiest de vrije man; in het voorbeeld legt hij terug op de derde loper, die afrondt.',
    organisatie:
      'Op een half veld. Ingooier op de rechterzijlijn op 22 m van de achterlijn, ontvanger 6 m binnen het veld. Twee aanvallers op 24–28 m (eerste golf), een derde op 32 m (tweede golf). Keeper in het doel. Na elke aanval doordraaien.',
    benodigdheden: ['Goal', 'Ballen', '2 hoedjes (ingooiplek)'],
    spelersNodig: 5,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Ingooier: twee handen, de bal achter het hoofd en beide voeten op de grond; gooi op de voet of borst van de ontvanger',
      'Eerste golf: verdeel de palen, niet allebei naar dezelfde plek',
      'Tweede golf: blijf achter de bal en kom laat; de terugleg is vaak de beste kans',
    ],
    variaties: {
      makkelijker: ['Ontvanger mag een voorzet uit stilstand geven', 'Zonder tweede golf'],
      moeilijker: ['Twee verdedigers in de zestien', 'Ontvanger moet binnen 4 seconden de bal afgeven', 'Ingooier loopt mee en wordt de derde golf'],
    },
    en: {
      naam: 'Attacking in waves after a throw-in',
      uitleg:
        'Throw-in on the flank, level with the box. The receiver comes short, controls the ball and dribbles towards the byline. Meanwhile the attackers arrive in the box in waves: first two players to the near and far post, then a third player who stays behind them and arrives around the edge of the box. The receiver picks the free player; in the example they cut it back to the third runner, who finishes.',
      organisatie:
        'On half a pitch. Thrower on the right touchline, 22 m from the byline, receiver 6 m infield. Two attackers at 24–28 m (first wave), a third at 32 m (second wave). Keeper in goal. Rotate after each attack.',
      benodigdheden: ['Goal', 'Balls', '2 disc cones (throw-in spot)'],
      coachpunten: [
        'Thrower: two hands, ball behind your head and both feet on the ground; throw to the receiver’s feet or chest',
        'First wave: split the posts, don’t both go to the same place',
        'Second wave: stay behind the ball and arrive late; the cutback is often the best chance',
      ],
      variaties: {
        makkelijker: ['The receiver may cross from standing', 'No second wave'],
        moeilijker: ['Two defenders in the box', 'The receiver must release the ball within 4 seconds', 'The thrower joins in and becomes the second wave'],
      },
    },
    tekening: {
      ...half({ x: 21, y: -3, breedte: 52, lengte: 38 }),
      objecten: [
        goal,
        kp(),
        speler('t', 2, 67.6, 22, { kijkrichting: 180 }),
        speler('r', 7, 61.4, 24.4, { kijkrichting: 0 }),
        speler('a1', 9, 42, 25, { kijkrichting: -100 }),
        speler('a2', 11, 33, 27.5, { kijkrichting: -90 }),
        speler('a3', 8, 46, 32, { kijkrichting: -120 }),
        bal('b1', 67.05, 22, 't'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'loop', wie: 'r', naar: [62.4, 22.6] }),
        stap({ type: 'pass', van: 't', naar: 'r', worp: 'inworp', hoogte: 1.8, eindHoogte: 0.4 }),
        stap(
          { type: 'dribbel', wie: 'r', naar: [61.2, 7.2] },
          { type: 'loop', wie: 'a1', naar: [38.6, 5.4], manier: 'sprint', start: 0.8 },
          { type: 'loop', wie: 'a2', naar: [30.4, 7.6], manier: 'sprint', start: 0.9 },
          { type: 'loop', wie: 'a3', naar: [42.6, 16.4], start: 1.2 },
        ),
        stap({ type: 'pass', van: 'r', naar: 'a3' }, { type: 'loop', wie: 'a3', naar: [41.8, 15.4], start: 0.1 }),
        stap({ type: 'schot', van: 'a3', naar: [31.0, -0.3], afloop: 'goal', direct: true }),
        pauze(1.0),
      ],
    },
  },

  // 12. Kopballen na een voorzet
  {
    id: 'veld-af-kopballen-voorzet',
    naam: 'Kopballen na een voorzet',
    categorieen: ['afwerken'],
    uitleg:
      'Voorzetten van beide kanten, om en om. Twee spitsen lopen in met een afgesproken looplijn: de één naar de eerste paal, de ander naar de tweede. Eerst een voorzet van rechts op de eerste paal, daarna een voorzet van links op de tweede paal. De spits kopt de bal naar beneden, in de hoek.',
    organisatie:
      'Op een half veld. Buitenspelers met ballen links en rechts op 18 m van de achterlijn en 24 m opzij van het midden. Twee spitsen centraal op 22–24 m. Keeper in het doel. Na een paar voorzetten wisselen de spitsen van looplijn.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 4,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: [
      'Looplijn met een bocht: eerst weg van de paal, dan erop af',
      'Afzetten op één been, met het voorhoofd raken en de ogen open',
      'Kop de bal naar beneden: een stuitende bal is voor een keeper het lastigst',
    ],
    variaties: {
      makkelijker: ['Voorzet met de hand gooien', 'Spitsen staan al op hun plek'],
      moeilijker: ['Een verdediger springt mee', 'Buitenspelers geven de voorzet in de loop', 'Een derde loper naar de rand van de zestien voor de tweede bal'],
    },
    en: {
      naam: 'Headers from crosses',
      uitleg:
        'Crosses from both sides, in turn. Two strikers attack the box with an agreed run: one to the near post, the other to the far post. First a cross from the right to the near post, then a cross from the left to the far post. The striker heads the ball down into the corner.',
      organisatie:
        'On half a pitch. Wide players with balls on the left and right, 18 m from the byline and 24 m from the centre. Two strikers centrally at 22–24 m. Keeper in goal. After a few crosses, the strikers swap runs.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: [
        'Curve your run: first away from the post, then attack it',
        'Take off from one foot, head it with your forehead, eyes open',
        'Head it down: a bouncing ball is the hardest for a keeper',
      ],
      variaties: {
        makkelijker: ['Throw the cross in by hand', 'The strikers start in position'],
        moeilijker: ['A defender jumps with you', 'The wide players cross on the run', 'A third runner to the edge of the box for the second ball'],
      },
    },
    tekening: {
      ...half({ x: 2, y: -3, breedte: 64, lengte: 34 }),
      objecten: [
        goal,
        kp(),
        speler('wr', 7, 58, 18, { kijkrichting: 180 }),
        speler('wl', 11, 10, 18, { kijkrichting: 0 }),
        speler('s1', 9, 37, 22, { kijkrichting: -90 }),
        speler('s2', 10, 31, 24, { kijkrichting: -90 }),
        bal('b1', 57.45, 18, 'wr'),
        bal('b2', 10.55, 18, 'wl'),
      ],
      animatie: [
        pauze(0.6),
        stap(
          { type: 'dribbel', wie: 'wr', naar: [55, 13] },
          { type: 'loop', wie: 's1', via: [[40.2, 15]], naar: [38.4, 6.2], manier: 'sprint', start: 0.6 },
          { type: 'loop', wie: 's2', naar: [30.2, 9.4], start: 0.7 },
        ),
        stap({ type: 'pass', van: 'wr', naar: 's1', hoogte: 'hoog', eindHoogte: 1.9 }),
        stap({ type: 'schot', van: 's1', naar: [36.4, 0.2], afloop: 'goal', direct: true }),
        pauze(0.4),
        stap({ type: 'loop', wie: 's1', naar: [38, 22] }, { type: 'loop', wie: 's2', naar: [32, 24] }),
        stap(
          { type: 'dribbel', wie: 'wl', naar: [13, 13] },
          { type: 'loop', wie: 's2', via: [[28.4, 16]], naar: [29.2, 9.6], start: 0.4 },
          { type: 'loop', wie: 's1', via: [[41.4, 14]], naar: [38.8, 6.8], manier: 'sprint', start: 0.6 },
        ),
        stap({ type: 'pass', van: 'wl', naar: 's1', hoogte: 'hoog', eindHoogte: 1.9, bal: 'b2' }),
        stap({ type: 'schot', van: 's1', naar: [36.8, 0.2], afloop: 'goal', direct: true }),
        pauze(1.0),
      ],
    },
  },

  // 13. Wedstrijdje schieten
  {
    id: 'veld-af-wedstrijdje-schieten',
    naam: 'Wedstrijdje schieten',
    categorieen: ['afwerken', 'spelletjes'],
    uitleg:
      'Twee teams staan in een rij naast elkaar op 18 m en schieten om de beurt op doel. Een doelpunt is een punt; laag in de hoek (onder kniehoogte en dicht bij de paal) is twee punten. Na je schot haal je je bal op en sluit je achteraan je rij aan. Welk team heeft na vijf rondes de meeste punten?',
    organisatie: 'Twee rijen met ballen op 18 m van het doel, 6 m uit elkaar. Keeper in het doel. De trainer houdt de stand bij.',
    benodigdheden: ['Goal', '1 bal per speler', '4 hoedjes', 'Hesjes voor één team'],
    spelersNodig: 4,
    keepersNodig: 1,
    doorwisselbaar: true,
    coachpunten: ['Plaatsen gaat voor kracht: laag in de hoek is het moeilijkst voor de keeper', 'Standbeen naast de bal, knie boven de bal', 'Kies vóór je aanloop al je hoek en houd je eraan'],
    variaties: {
      makkelijker: ['Schieten vanaf 14 m', 'Hoek-punten ook voor halfhoog'],
      moeilijker: ['Vanaf 20 m', 'Eerst een kaats met de trainer, dan in één keer schieten', 'Alleen het zwakke been'],
    },
    en: {
      naam: 'Shooting competition',
      uitleg:
        'Two teams queue side by side at 18 m and take turns to shoot at goal. A goal is a point; low into the corner (below knee height and close to the post) is two points. After your shot, fetch your ball and join the back of your queue. Which team has the most points after five rounds?',
      organisatie: 'Two queues with balls 18 m from goal, 6 m apart. Keeper in goal. The coach keeps the score.',
      benodigdheden: ['Goal', '1 ball per player', '4 disc cones', 'Bibs for one team'],
      coachpunten: [
        'Placement beats power: low into the corner is hardest for the keeper',
        'Standing foot next to the ball, knee over the ball',
        'Pick your corner before your run-up and stick to it',
      ],
      variaties: {
        makkelijker: ['Shoot from 14 m', 'Corner points for mid-height too'],
        moeilijker: ['From 20 m', 'First a one-two with the coach, then shoot first time', 'Weaker foot only'],
      },
    },
    tekening: {
      ...half({ x: 20, y: -3, breedte: 28, lengte: 28 }),
      objecten: [
        goal,
        kp(),
        speler('a1', 7, 31, 18, { kijkrichting: -80 }),
        speler('a2', 9, 31, 20.4, { kijkrichting: -80 }),
        B('b1', 8, 37, 18, { kijkrichting: -100 }),
        B('b2', 10, 37, 20.4, { kijkrichting: -100 }),
        bal('ba1', 31.1, 17.45, 'a1'),
        bal('ba2', 31.1, 19.85, 'a2'),
        bal('bb1', 36.9, 17.45, 'b1'),
        bal('bb2', 36.9, 19.85, 'b2'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'schot', van: 'a1', naar: [30.9, 0.2], hoogte: 'grond', afloop: 'goal' }),
        stap({ type: 'loop', wie: 'a1', via: [[27.4, 12]], naar: [27.6, 22.6] }, { type: 'loop', wie: 'a2', naar: [31, 18], start: 0.4 }),
        stap({ type: 'schot', van: 'b1', naar: 'k1', afloop: 'vangt' }),
        stap({ type: 'loop', wie: 'b1', via: [[40.6, 12]], naar: [40.4, 22.6] }, { type: 'loop', wie: 'b2', naar: [37, 18], start: 0.4 }),
        stap({ type: 'schot', van: 'a2', naar: [36.2, 0.2], hoogte: 1.6, afloop: 'goal' }),
        stap({ type: 'schot', van: 'b2', naar: [37.1, 0.2], hoogte: 'grond', afloop: 'goal' }),
        pauze(1.0),
      ],
    },
  },
];

zet('veld', oefeningen);
