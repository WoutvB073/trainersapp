// Spelersoefeningen 0.27.0, deel B1 (Verdedigen en omschakelen: 22–26 en 28). Draaien: node tools/nieuw/spelers-027a.cjs
// #27 (Druk zetten of balbezit) is niet gebouwd: vrijwel gelijk aan veld-ps-4-4-doelspelers (0.26.0).
const { zet } = require('./hulp.cjs');
const { goal, keeper, speler, bal, pion, hoedje, pauze, stap } = require('./bouwstenen.cjs');

const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const C = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'C', ...extra });
const J = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'J', ...extra });
const zone = (id, x, y, breedte, lengte, kleur) => ({ id, soort: 'zone', x, y, breedte, lengte, ...(kleur ? { kleur } : {}) });
const doeltje = (id, x, y, hoek, breedte = 3) => ({ id, soort: 'klein-goal', x, y, hoek, breedte });
const jeugdgoal = (id, x, y, hoek = 0) => ({ id, soort: 'goal', x, y, breedte: 5, hoogte: 2, ...(hoek ? { hoek } : {}) });
const leeg = (breedte, lengte, camera = 'schuin') => ({ veld: { type: 'leeg', breedte, lengte }, camera });
const GEEL = '#ffd23f';
const BLAUW = '#1c64d8';

const oefeningen = [
  // 22. Druk zetten in drie fases
  {
    id: 'veld-vo-druk-drie-fases',
    naam: 'Druk zetten in drie fases',
    categorieen: ['verdedigen-omschakelen', 'positiespel'],
    uitleg:
      'Drie teams van drie. Rood speelt de bal rond in het vak, blauw zet druk en geel rust. Blauw zet in drie fases druk: eerst passief (meelopen en de passlijnen dichtzetten, niet ingrijpen), dan mag blauw onderscheppen, en tot slot volledig druk. Verovert blauw de bal of geeft de trainer een seintje, dan valt blauw meteen aan op het grote doel: 3 tegen 2 tegen twee spelers van rood en de keeper. Daarna draaien de rollen door: blauw speelt rond, geel zet druk, rood rust.',
    organisatie:
      'Op een half veld. Vak van 16 × 14 m rond 38 m van het doel; keeper in het doel. Rood (3) in het vak, blauw (3) erbij, geel (3) rust naast het vak. Elke fase ± 1 minuut; na een aanval begint de volgende ronde in het vak.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen', 'Hesjes in 3 kleuren'],
    spelersNodig: 9,
    keepersNodig: 1,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: drie teams van vier (4 tegen 3 op het doel), of een groter vak.',
    coachpunten: [
      'Passief druk zetten is ook werken: blijf tussen bal en doel en sluit de korte passlijn',
      'Volledig druk: de dichtstbijzijnde zet druk, de anderen schuiven mee en sluiten de passlijnen',
      'Na balwinst meteen de diepte in: binnen een paar seconden een doelpoging',
    ],
    variaties: {
      makkelijker: ['Groter vak, zodat rood makkelijker rondspeelt', 'Bij de aanval verdedigt maar één speler van rood'],
      moeilijker: ['Kleiner vak', 'De aanval moet binnen 8 seconden afgerond zijn', 'Rood mag na balverlies met alle drie terug verdedigen'],
    },
    en: {
      naam: 'Pressing in three phases',
      uitleg:
        'Three teams of three. Red keeps the ball in the area, blue presses and yellow rests. Blue presses in three phases: first passively (track the play and close the passing lanes, no tackling), then blue may intercept, and finally full pressure. If blue wins the ball or the coach gives a signal, blue attacks the big goal straight away: 3v2 against two red players and the keeper. Then the roles rotate: blue keeps the ball, yellow presses, red rests.',
      organisatie:
        'On half a pitch. 16 × 14 m area about 38 m from goal; keeper in goal. Red (3) in the area, blue (3) with them, yellow (3) resting next to the area. Each phase about 1 minute; after an attack the next round starts in the area.',
      benodigdheden: ['Goal', '4 cones', 'Balls', 'Bibs in 3 colours'],
      meerSpelers: 'With more players: three teams of four (4v3 on goal), or a bigger area.',
      coachpunten: [
        'Passive pressing is still work: stay between ball and goal and close the short passing lane',
        'Full pressure: the nearest player presses, the others shift across and close the passing lanes',
        'After winning the ball go forward straight away: an attempt on goal within a few seconds',
      ],
      variaties: {
        makkelijker: ['Bigger area, so red can keep the ball more easily', 'Only one red player defends the attack'],
        moeilijker: ['Smaller area', 'The attack must be finished within 8 seconds', 'After losing the ball, all three red players may defend'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 15, y: -3, breedte: 44, lengte: 57 },
      camera: 'schuin',
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        zone('z', 34, 38, 16, 14),
        speler('a1', 2, 28, 43.5, { kijkrichting: 0 }),
        speler('a2', 3, 40, 43.5, { kijkrichting: 180 }),
        speler('a3', 4, 34, 33, { kijkrichting: 90 }),
        B('b1', 5, 30.6, 38.6, { kijkrichting: 90 }),
        B('b2', 6, 37.6, 38.6, { kijkrichting: 90 }),
        B('b3', 7, 34, 41.2, { kijkrichting: -90 }),
        C('c1', 8, 47.5, 34, { kijkrichting: 180 }),
        C('c2', 9, 48, 38, { kijkrichting: 180 }),
        C('c3', 10, 47.5, 42, { kijkrichting: 180 }),
        bal('bal', 28.55, 43.5, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        // Fase 1: passief meelopen.
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'b2', naar: [41.4, 40.4], start: 0.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }, { type: 'loop', wie: 'b3', naar: [36.4, 37.8], start: 0.5 }),
        // Fase 3: volledig druk, blauw onderschept.
        stap({ type: 'pass', van: 'a3', naar: 'a1', onderschept: 'b1' }, { type: 'loop', wie: 'b3', naar: [36, 34.4], manier: 'sprint', start: 0.1 }),
        stap(
          { type: 'dribbel', wie: 'b1', naar: [29.6, 27], manier: 'sprint' },
          { type: 'loop', wie: 'b3', via: [[37.6, 31]], naar: [38.4, 22.6], manier: 'sprint', start: 0.2 },
          { type: 'loop', wie: 'b2', naar: [46, 25.4], manier: 'sprint', start: 0.3 },
          { type: 'loop', wie: 'a3', naar: [33.4, 19.6], manier: 'sprint', start: 0.15 },
          { type: 'druk', wie: 'a1', op: 'b1', afstand: 2.4, manier: 'sprint', start: 0.25 },
        ),
        stap({ type: 'pass', van: 'b1', naar: 'b3' }),
        stap({ type: 'schot', van: 'b3', naar: [37.4, -0.3], afloop: 'goal' }),
        pauze(1.0),
      ],
    },
  },

  // 23. Eerste, tweede en derde verdediger
  {
    id: 'veld-vo-drie-verdedigers',
    naam: 'Eerste, tweede en derde verdediger',
    categorieen: ['verdedigen-omschakelen', 'partijvormen'],
    uitleg:
      'Drie tegen drie, met de nadruk op de taken van de verdedigers. De eerste verdediger zet druk op de bal. De tweede dekt hem af: schuin achter hem, zodat hij kan ingrijpen als de aanvaller erlangs komt. De derde staat in balans aan de verre kant, iets dieper, en houdt de ruimte achter de verdediging en zijn eigen man in de gaten. Wordt de bal doorgespeeld, dan wisselen de rollen meteen: wie het dichtst bij de nieuwe balbezitter staat, wordt de eerste verdediger. Na balwinst mogen de verdedigers scoren op de twee doeltjes aan de overkant.',
    organisatie:
      'Vak van 26 × 32 m met op beide korte zijden twee kleine doeltjes. Rood valt aan (bal), blauw verdedigt. Na 5 aanvallen wisselen de rollen. De trainer zet het spel even stil om de posities te laten zien.',
    benodigdheden: ['4 kleine doeltjes', '4 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 6,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 4 tegen 4 (twee dekkers, één in balans), of wissel elke ronde een nieuw drietal in.',
    coachpunten: [
      'Eerste verdediger: snel aanlopen, laatste meters afremmen en de aanvaller naar buiten sturen',
      'Tweede verdediger: 3–4 m schuin achter de eerste, aan de kant waar de aanvaller naartoe wil',
      'Derde verdediger: in balans, iets dieper en naar binnen, met bal en man in beeld',
      'Bij elke pass praten: wie neemt de bal, wie dekt af?',
    ],
    variaties: {
      makkelijker: ['Aanvallers spelen eerst in wandeltempo', 'Smaller vak (20 m)'],
      moeilijker: ['Aanvallers scoren al door over de lijn te dribbelen', 'Een vierde aanvaller als joker', 'Na balwinst binnen 6 seconden scoren'],
    },
    en: {
      naam: 'First, second and third defender',
      uitleg:
        'Three against three, with the focus on the defenders’ jobs. The first defender presses the ball. The second covers: diagonally behind them, ready to step in if the attacker gets past. The third keeps the balance on the far side, a little deeper, watching the space behind the defence and their own player. When the ball is passed on, the roles change straight away: whoever is closest to the new ball carrier becomes the first defender. After winning the ball, the defenders can score on the two mini goals at the other end.',
      organisatie:
        '26 × 32 m area with two mini goals at each short end. Red attacks (with the ball), blue defends. Swap roles after 5 attacks. The coach freezes play now and then to show the positions.',
      benodigdheden: ['4 mini goals', '4 cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: 4v4 (two covering, one in balance), or bring in a new three every round.',
      coachpunten: [
        'First defender: close down quickly, slow down for the last few metres and show the attacker outside',
        'Second defender: 3–4 m diagonally behind the first, on the side the attacker wants to go',
        'Third defender: in balance, a little deeper and narrower, with ball and player in view',
        'Talk with every pass: who takes the ball, who covers?',
      ],
      variaties: {
        makkelijker: ['Attackers start at walking pace', 'Narrower area (20 m)'],
        moeilijker: ['Attackers already score by dribbling over the line', 'A fourth attacker as a joker', 'After winning the ball, score within 6 seconds'],
      },
    },
    tekening: {
      ...leeg(26, 32),
      objecten: [
        doeltje('t1', 8, 1, 0),
        doeltje('t2', 18, 1, 0),
        doeltje('o1', 8, 31, 180),
        doeltje('o2', 18, 31, 180),
        speler('a1', 1, 4.5, 11, { kijkrichting: 60 }),
        speler('a2', 2, 13, 9, { kijkrichting: 90 }),
        speler('a3', 3, 21.5, 11, { kijkrichting: 120 }),
        B('b1', 4, 5.6, 13.6, { kijkrichting: -90 }),
        B('b2', 5, 9.6, 17, { kijkrichting: -110 }),
        B('b3', 6, 15.8, 20, { kijkrichting: -110 }),
        bal('bal', 4.8, 11.5, 'a1'),
      ],
      animatie: [
        pauze(1.0),
        stap(
          { type: 'pass', van: 'a1', naar: 'a2' },
          { type: 'loop', wie: 'b2', naar: [13, 11.4], start: 0.3 },
          { type: 'loop', wie: 'b1', naar: [8.4, 15.4], start: 0.4 },
          { type: 'loop', wie: 'b3', naar: [17.6, 15.4], start: 0.4 },
        ),
        pauze(0.8),
        stap(
          { type: 'pass', van: 'a2', naar: 'a3' },
          { type: 'loop', wie: 'b3', naar: [19.6, 13.2], start: 0.3 },
          { type: 'loop', wie: 'b2', naar: [16.4, 16.6], start: 0.4 },
          { type: 'loop', wie: 'b1', naar: [10.4, 19.6], start: 0.4 },
        ),
        pauze(0.8),
        stap({ type: 'dribbel', wie: 'a3', naar: [23.6, 15.6] }, { type: 'loop', wie: 'b3', naar: [21.6, 16.4], manier: 'verdedigend', kijk: -60, start: 0.1 }),
        stap({ type: 'verover', wie: 'b3', van: 'a3' }),
        stap({ type: 'pass', van: 'b3', naar: 'b2' }),
        stap({ type: 'dribbel', wie: 'b2', naar: [17, 5.4], manier: 'sprint' }, { type: 'loop', wie: 'a2', naar: [13.4, 4.6], manier: 'sprint', start: 0.3 }),
        stap({ type: 'schot', van: 'b2', naar: [18.4, 0.6] }),
        pauze(1.0),
      ],
    },
  },

  // 24. 1 tegen 1 verdedigen: de aanvaller wegdrukken
  {
    id: 'veld-vo-1-1-wegdrukken',
    naam: '1 tegen 1 verdedigen: de aanvaller wegdrukken',
    categorieen: ['verdedigen-omschakelen'],
    uitleg:
      'De verdediger speelt de bal naar de aanvaller aan de overkant en komt er meteen op af. De laatste meters remt hij af en zakt hij door de knieën in een zijwaartse houding, net naast de lijn naar het midden. Zo laat hij alleen de buitenkant open en drukt hij de aanvaller weg naar de zijlijn. Hij blijft op een armlengte en stapt pas in als de aanvaller de bal te ver voor zich uit speelt. De aanvaller scoort door met de bal over de lijn achter de verdediger te dribbelen.',
    organisatie: 'Strook van 12 × 20 m. Verdedigers in een rij met ballen bij de scoorlijn, aanvallers in een rij aan de overkant. Na elke actie sluit je aan bij de andere rij.',
    benodigdheden: ['6 pionnen of hoedjes', 'Ballen', 'Hesjes'],
    spelersNodig: 2,
    keepersNodig: 0,
    doorwisselbaar: true,
    coachpunten: [
      'Snel aanlopen terwijl de bal onderweg is, de laatste meters kleine pasjes',
      'Zijwaarts staan, laag door de knieën: de binnenkant dicht, de buitenkant open',
      'Kijk naar de bal, niet naar de schijnbewegingen',
      'Pas inspringen bij een slechte aanraking: anders blijven sturen',
    ],
    variaties: {
      makkelijker: ['Smallere strook (8 m), zodat sturen makkelijker is', 'Aanvaller alleen in wandel- of dribbeltempo'],
      moeilijker: ['Bredere strook (16 m)', 'Aanvaller mag ook scoren op een klein doeltje', 'Verdediger begint 3 m verder weg'],
    },
    en: {
      naam: '1v1 defending: showing the attacker away',
      uitleg:
        'The defender passes the ball to the attacker at the other end and closes them down straight away. For the last few metres they slow down and drop into a side-on stance, just off the line to the middle. That leaves only the outside open and shows the attacker away towards the touchline. They stay an arm’s length away and only step in when the attacker pushes the ball too far ahead. The attacker scores by dribbling the ball over the line behind the defender.',
      organisatie: '12 × 20 m channel. Defenders in a queue with balls at the scoring line, attackers in a queue at the other end. After each go, join the other queue.',
      benodigdheden: ['6 cones or disc cones', 'Balls', 'Bibs'],
      coachpunten: [
        'Close down fast while the ball is travelling, short steps for the last few metres',
        'Stand side-on, knees bent: inside closed, outside open',
        'Watch the ball, not the feints',
        'Only step in after a poor touch: otherwise keep showing them away',
      ],
      variaties: {
        makkelijker: ['Narrower channel (8 m), so showing the attacker away is easier', 'Attacker at walking or dribbling pace only'],
        moeilijker: ['Wider channel (16 m)', 'The attacker may also score in a mini goal', 'Defender starts 3 m further away'],
      },
    },
    tekening: {
      ...leeg(18, 26),
      objecten: [
        zone('z', 9, 13, 12, 20),
        hoedje('h1', 3, 23, GEEL),
        hoedje('h2', 15, 23, GEEL),
        speler('a', 1, 9, 4.6, { kijkrichting: 90 }),
        speler('a2', 3, 7, 1.4, { kijkrichting: 90 }),
        B('d', 2, 9, 21.2, { kijkrichting: -90 }),
        B('d2', 4, 11.4, 24.6, { kijkrichting: -90 }),
        bal('bal', 9, 20.65, 'd'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'd', naar: 'a' }, { type: 'loop', wie: 'd', naar: [8.6, 10.6], manier: 'sprint', start: 0.25, duur: 1.8 }),
        stap({ type: 'dribbel', wie: 'a', naar: [10.6, 7.8] }, { type: 'loop', wie: 'd', naar: [9.2, 11.4], manier: 'verdedigend', kijk: -40, start: 0.1 }),
        stap({ type: 'dribbel', wie: 'a', via: [[12.6, 10.6]], naar: [13.2, 13.4] }, { type: 'loop', wie: 'd', via: [[10.6, 13.2]], naar: [11.4, 15.4], manier: 'verdedigend', kijk: -25, start: 0.15 }),
        stap({ type: 'dribbel', wie: 'a', naar: [13.6, 15.8], duur: 0.5 }),
        stap({ type: 'verover', wie: 'd', van: 'a' }),
        stap({ type: 'dribbel', wie: 'd', naar: [9.4, 19.2] }, { type: 'loop', wie: 'a', naar: [12.6, 17.4], start: 0.3 }),
        pauze(1.0),
      ],
    },
  },

  // 25. Hoog druk zetten loont
  {
    id: 'veld-vo-hoog-druk-loont',
    naam: 'Hoog druk zetten loont',
    categorieen: ['verdedigen-omschakelen', 'partijvormen'],
    uitleg:
      'Partij 5 tegen 5 met keepers op een veld in drie vakken. Een doelpunt is meer waard naarmate je de bal hoger op het veld veroverde: bal veroverd in het laatste vak (bij het doel van de tegenstander) en gescoord = 3 punten, veroverd in het middenvak = 2 punten, veroverd op eigen helft = 1 punt. Zo loont het om meteen druk te zetten. In het voorbeeld zet rood druk op de opbouw van blauw en onderschept een terugspeelbal vlak voor het doel: 3 punten.',
    organisatie: 'Veld van 36 × 48 m in drie vakken van 16 m (hoedjes of pionnen), met op beide korte zijden een jeugdgoal en een keeper. Teams met hesjes, rondes van 5 minuten.',
    benodigdheden: ['2 jeugdgoals', '8 pionnen of hoedjes', 'Ballen', 'Hesjes'],
    spelersNodig: 10,
    keepersNodig: 2,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 6 tegen 6 of 7 tegen 7 op een groter veld.',
    coachpunten: [
      'Druk zetten als team: de voorste zet druk, de rest schuift mee en sluit de korte passlijnen',
      'Loer op de terugspeelbal: die is vaak zacht en voorspelbaar',
      'Na balwinst hoog op het veld: meteen afronden, niet eerst omkijken',
    ],
    variaties: {
      makkelijker: ['Keeper mag niet onder druk gezet worden', 'Groter veld'],
      moeilijker: ['Maximaal drie aanrakingen', 'Een doelpunt na balverovering in het laatste vak telt alleen binnen 10 seconden', 'Kleiner veld'],
    },
    en: {
      naam: 'High pressing pays off',
      uitleg:
        'A 5v5 game with keepers on a pitch split into three zones. A goal is worth more the higher up the pitch you won the ball: won in the last zone (near the opponents’ goal) and scored = 3 points, won in the middle zone = 2 points, won in your own half = 1 point. That way it pays to press straight away. In the example, red presses blue’s build-up and intercepts a back pass just in front of goal: 3 points.',
      organisatie: '36 × 48 m pitch split into three 16 m zones (disc cones or cones), with a youth goal and a keeper at each short end. Teams in bibs, 5-minute rounds.',
      benodigdheden: ['2 youth goals', '8 cones or disc cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: 6v6 or 7v7 on a bigger pitch.',
      coachpunten: [
        'Press as a team: the front player presses, the rest shift across and close the short passing lanes',
        'Watch for the back pass: it is often soft and predictable',
        'After winning the ball high up the pitch: finish straight away, don’t look round first',
      ],
      variaties: {
        makkelijker: ['The keeper may not be pressed', 'Bigger pitch'],
        moeilijker: ['Three touches maximum', 'A goal after winning the ball in the last zone only counts within 10 seconds', 'Smaller pitch'],
      },
    },
    tekening: {
      ...leeg(36, 48),
      objecten: [
        zone('z1', 18, 8, 36, 16),
        zone('z2', 18, 24, 36, 16, GEEL),
        zone('z3', 18, 40, 36, 16),
        jeugdgoal('gA', 18, 0.5),
        jeugdgoal('gB', 18, 47.5, 180),
        keeper('kA', 1, 18, 1.9, { verdedigt: 'gA' }),
        keeper('kB', 1, 18, 46.1, { verdedigt: 'gB' }),
        B('b1', 4, 10, 40.5, { kijkrichting: 0 }),
        B('b2', 5, 26, 40.5, { kijkrichting: 180 }),
        B('b3', 6, 18, 33.4, { kijkrichting: 90 }),
        B('b4', 7, 6, 27, { kijkrichting: 90 }),
        B('b5', 9, 30, 24, { kijkrichting: 90 }),
        speler('a1', 9, 14.6, 34.4, { kijkrichting: 90 }),
        speler('a2', 10, 23.4, 35.6, { kijkrichting: 90 }),
        speler('a3', 8, 18, 28.6, { kijkrichting: 90 }),
        speler('a4', 7, 9, 22, { kijkrichting: 90 }),
        speler('a5', 6, 26, 18, { kijkrichting: 90 }),
        bal('bal', 25.45, 40.5, 'b2'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'b2', naar: 'b3' }, { type: 'loop', wie: 'a3', naar: [19.8, 31.6], manier: 'sprint', start: 0.35 }, { type: 'loop', wie: 'a2', naar: [22.6, 37.2], start: 0.4 }),
        stap({ type: 'pass', van: 'b3', naar: 'b1', onderschept: 'a1' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [15.4, 41.6], manier: 'sprint' }, { type: 'druk', wie: 'b1', op: 'a1', afstand: 2, manier: 'sprint', start: 0.2 }),
        stap({ type: 'schot', van: 'a1', naar: [16.6, 47.7], afloop: 'goal' }),
        pauze(1.0),
      ],
    },
  },

  // 26. Pressen na balverlies
  {
    id: 'veld-vo-pressen-na-balverlies',
    naam: 'Pressen na balverlies',
    categorieen: ['verdedigen-omschakelen', 'partijvormen'],
    uitleg:
      'Partij 5 tegen 5 op vier kleine doeltjes. Verlies je de bal, dan heb je 5 seconden om hem terug te winnen: lukt dat, dan krijgt je team een bonuspunt (en mag je meteen proberen te scoren). De trainer telt hardop af. In het voorbeeld onderschept blauw een pass, maar twee spelers van rood zetten meteen samen druk, winnen de bal terug en rood scoort.',
    organisatie:
      'Veld van 30 × 40 m met op beide korte zijden twee kleine doeltjes, 12 m uit elkaar. Teams met hesjes, rondes van 4 minuten. Doelpunt = 1 punt, bal binnen 5 seconden terug = 1 bonuspunt.',
    benodigdheden: ['4 kleine doeltjes', '4 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 10,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 6 tegen 6 op een groter veld, of een joker die altijd met het balbezittende team meedoet.',
    coachpunten: [
      'Na balverlies niet balen maar meteen druk: de dichtstbijzijnde gaat direct op de bal',
      'Met twee of drie tegelijk druk zetten, de rest sluit de korte passlijnen af',
      'Lukt het niet binnen 5 seconden: snel terug achter de bal en compact staan',
    ],
    variaties: {
      makkelijker: ['8 seconden om de bal terug te winnen', 'Groter veld'],
      moeilijker: ['3 seconden', 'Het andere team scoort al door de bal 5 keer rond te spelen', 'Maximaal twee aanrakingen'],
    },
    en: {
      naam: 'Counter-pressing after losing the ball',
      uitleg:
        'A 5v5 game on four mini goals. If you lose the ball, you have 5 seconds to win it back: manage it and your team gets a bonus point (and can try to score straight away). The coach counts down out loud. In the example, blue intercepts a pass, but two red players press together straight away, win the ball back and red scores.',
      organisatie: '30 × 40 m pitch with two mini goals at each short end, 12 m apart. Teams in bibs, 4-minute rounds. Goal = 1 point, ball back within 5 seconds = 1 bonus point.',
      benodigdheden: ['4 mini goals', '4 cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: 6v6 on a bigger pitch, or a joker who always plays for the team in possession.',
      coachpunten: [
        'After losing the ball, no sulking but press straight away: the nearest player goes straight to the ball',
        'Press in twos or threes, the rest close the short passing lanes',
        'If it doesn’t work within 5 seconds: get back behind the ball quickly and stay compact',
      ],
      variaties: {
        makkelijker: ['8 seconds to win the ball back', 'Bigger pitch'],
        moeilijker: ['3 seconds', 'The other team already scores by keeping the ball for 5 passes', 'Two touches maximum'],
      },
    },
    tekening: {
      ...leeg(30, 40),
      weergave: { x: -2, y: -1, breedte: 34, lengte: 46 },
      objecten: [
        zone('z', 15, 20, 28, 38),
        doeltje('t1', 9, 1, 0),
        doeltje('t2', 21, 1, 0),
        doeltje('o1', 9, 39, 180),
        doeltje('o2', 21, 39, 180),
        speler('a1', 4, 15, 26, { kijkrichting: -120 }),
        speler('a2', 6, 6, 18, { kijkrichting: -45 }),
        speler('a3', 8, 24, 16, { kijkrichting: -90 }),
        speler('a4', 10, 13.4, 9.6, { kijkrichting: -90 }),
        speler('a5', 2, 16, 33, { kijkrichting: -90 }),
        B('b1', 6, 10.8, 21.6, { kijkrichting: 90 }),
        B('b2', 8, 20, 21.4, { kijkrichting: 90 }),
        B('b3', 10, 17.4, 13.6, { kijkrichting: 90 }),
        B('b4', 4, 7, 9, { kijkrichting: 90 }),
        B('b5', 2, 24, 7, { kijkrichting: 90 }),
        bal('bal', 14.7, 25.5, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: 'a2', onderschept: 'b1' }),
        stap(
          { type: 'dribbel', wie: 'b1', naar: [8.4, 25.6] },
          { type: 'loop', wie: 'a2', naar: [5.8, 26.4], manier: 'sprint', start: 0.1 },
          { type: 'druk', wie: 'a1', op: 'b1', afstand: 2, manier: 'sprint', start: 0.15 },
        ),
        stap({ type: 'verover', wie: 'a1', van: 'b1' }),
        stap({ type: 'pass', van: 'a1', naar: 'a3' }, { type: 'loop', wie: 'b2', naar: [21.6, 14.6], manier: 'sprint', start: 0.3 }),
        stap({ type: 'dribbel', wie: 'a3', naar: [22.6, 6.4] }, { type: 'druk', wie: 'b5', op: 'a3', afstand: 2.2, start: 0.3 }),
        stap({ type: 'schot', van: 'a3', naar: [21.2, 0.6] }),
        pauze(1.0),
      ],
    },
  },

  // 28. Omschakelen met kaatsers
  {
    id: 'veld-vo-omschakelen-kaatsers',
    naam: 'Omschakelen met kaatsers',
    categorieen: ['verdedigen-omschakelen', 'partijvormen'],
    uitleg:
      'Partij 5 tegen 5 met keepers en twee neutrale kaatsers op de zijlijnen. De kaatsers spelen mee met het team aan de bal en mogen de bal maximaal twee keer raken. Een gewoon doelpunt is 1 punt. Scoor je binnen 10 seconden nadat je de bal veroverde, dan is het 2 punten, en komt de assist dan van een kaatser, 3 punten. In het voorbeeld onderschept rood, speelt meteen de kaatser aan en die legt in één keer af op een inlopende speler.',
    organisatie:
      'Veld van 36 × 46 m met op beide korte zijden een jeugdgoal en een keeper. Op het midden van elke zijlijn een kaatser (eigen kleur). Teams met hesjes, rondes van 5 minuten; wissel de kaatsers elke ronde.',
    benodigdheden: ['2 jeugdgoals', '4 pionnen', 'Ballen', 'Hesjes in 3 kleuren'],
    spelersNodig: 12,
    keepersNodig: 2,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 6 tegen 6 met kaatsers, of vier kaatsers (twee per zijlijn).',
    coachpunten: [
      'Na balwinst eerst vooruit kijken: is de kaatser vrij, dan meteen aanspelen',
      'Na de pass naar de kaatser direct de diepte in lopen',
      'Het team dat de bal verliest: meteen terug achter de bal en de middenas dichtzetten',
    ],
    variaties: {
      makkelijker: ['Kaatsers mogen drie keer raken', '15 seconden voor de extra punten'],
      moeilijker: ['Kaatsers in één keer', '8 seconden voor de extra punten', 'Doelpunt alleen na een pass van een kaatser'],
    },
    en: {
      naam: 'Transition with bounce players',
      uitleg:
        'A 5v5 game with keepers and two neutral bounce players on the touchlines. The bounce players play for the team in possession and may touch the ball twice at most. A normal goal is 1 point. Score within 10 seconds of winning the ball and it’s 2 points, and if the assist then comes from a bounce player, 3 points. In the example, red intercepts, plays straight into the bounce player, who lays it off first time to a player running through.',
      organisatie:
        '36 × 46 m pitch with a youth goal and a keeper at each short end. A bounce player (own colour) halfway along each touchline. Teams in bibs, 5-minute rounds; change the bounce players every round.',
      benodigdheden: ['2 youth goals', '4 cones', 'Balls', 'Bibs in 3 colours'],
      meerSpelers: 'With more players: 6v6 with bounce players, or four bounce players (two per touchline).',
      coachpunten: [
        'After winning the ball, look forward first: if the bounce player is free, play it in straight away',
        'After the pass to the bounce player, run in behind straight away',
        'The team that loses the ball: get back behind the ball immediately and close the middle',
      ],
      variaties: {
        makkelijker: ['Bounce players may take three touches', '15 seconds for the extra points'],
        moeilijker: ['Bounce players one touch', '8 seconds for the extra points', 'Goals only count after a pass from a bounce player'],
      },
    },
    tekening: {
      ...leeg(40, 46),
      objecten: [
        zone('z', 20, 23, 36, 46),
        jeugdgoal('gA', 20, 0.5),
        jeugdgoal('gB', 20, 45.5, 180),
        keeper('kA', 1, 20, 1.9, { verdedigt: 'gA' }),
        keeper('kB', 1, 20, 44.1, { verdedigt: 'gB' }),
        J('j1', 11, 1, 23, { kijkrichting: 0 }),
        J('j2', 12, 39, 23, { kijkrichting: 180 }),
        B('b1', 4, 16, 30, { kijkrichting: -45 }),
        B('b2', 6, 26, 21, { kijkrichting: -90 }),
        B('b3', 8, 9, 19, { kijkrichting: -90 }),
        B('b4', 10, 20, 13, { kijkrichting: -90 }),
        B('b5', 2, 28, 35, { kijkrichting: -90 }),
        speler('a1', 6, 20.8, 25.8, { kijkrichting: 90 }),
        speler('a2', 8, 13, 12, { kijkrichting: 90 }),
        speler('a3', 10, 27, 13.4, { kijkrichting: 90 }),
        speler('a4', 9, 12, 29.4, { kijkrichting: 90 }),
        speler('a5', 4, 12.5, 40, { kijkrichting: -90 }),
        bal('bal', 16.4, 29.6, 'b1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'b1', naar: 'b2', onderschept: 'a1' }),
        stap(
          { type: 'pass', van: 'a1', naar: 'j2' },
          { type: 'loop', wie: 'a4', via: [[13.4, 33]], naar: [17, 37.6], manier: 'sprint', start: 0.15 },
          { type: 'loop', wie: 'b5', naar: [24, 39.4], manier: 'sprint', start: 0.3 },
        ),
        stap({ type: 'pass', van: 'j2', naar: 'a4', direct: true }),
        stap({ type: 'schot', van: 'a4', naar: [21.4, 45.8], afloop: 'goal', direct: true }),
        pauze(1.0),
      ],
    },
  },
];

zet('veld', oefeningen);
