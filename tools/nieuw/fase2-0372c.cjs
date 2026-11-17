// Fase 2, deel 3, batch 3 (0.37.2), deel c: eerder overgeslagen voorstellen die toch anders zijn dan een bestaande oefening
// (correctie van de gebruiker, 17-11-2026): positiespel PS1, PS3, PS4, PS7 en verdedigen V2, V3, V4, V8, V9.
// Draaien: node tools/nieuw/fase2-0372c.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, speler, trainer, bal, pion, pauze, stap, B, zone, leeg, doeltje, JO, OUD, MIDDEN, KLEUR } = require('./fase2-hulp.cjs');

const J = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'J', ...extra });
const jeugdgoal = (id, x, y, hoek = 0) => ({ id, soort: 'goal', x, y, breedte: 5, hoogte: 2, ...(hoek ? { hoek } : {}) });
const halfVeld = (weergave) => ({ veld: { type: 'half' }, weergave, camera: 'schuin' });

const oefeningen = [
  // PS1. Rondo 3 tegen 1 in twee vakken
  {
    id: 'veld-ps-rondo-3-1-twee-vakken',
    naam: 'Rondo 3 tegen 1 in twee vakken',
    categorieen: ['positiespel'],
    uitleg:
      'Drie spelers houden de bal rond tegen één verdediger in het eerste vak. Na vier passes speel je de bal over naar het lege vak ernaast; één speler sprint er alvast naartoe om hem aan te nemen, de andere twee volgen. De verdediger moet mee en gaat in het nieuwe vak weer jagen. Verovert hij de bal, dan ruilt hij met wie de bal verloor.',
    organisatie: 'Twee vakken van 8 × 8 m naast elkaar, 2 m ertussen. Drie aanvallers en één verdediger met een hesje. Na 2 minuten wisselt de verdediger.',
    benodigdheden: ['8 hoedjes', '1 bal', '1 hesje'],
    spelersNodig: 4,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Blijf aanspeelbaar: ga naast de verdediger staan, niet erachter', 'De overstap: één speler is al onderweg voor de bal vertrekt', 'Verdediger: snel overschakelen, meteen het nieuwe vak in'],
    variaties: {
      makkelijker: ['Grotere vakken', 'Na drie passes overspelen'],
      moeilijker: ['Twee aanrakingen', 'Twee verdedigers (3 tegen 2)'],
    },
    en: {
      naam: '3v1 rondo in two boxes',
      uitleg:
        'Three players keep the ball against one defender in the first box. After four passes, play the ball over to the empty box next to it; one player sprints there early to receive it and the other two follow. The defender must follow and starts hunting again in the new box. If the defender wins the ball, they swap with the player who lost it.',
      organisatie: 'Two 8 × 8 m boxes side by side, 2 m apart. Three attackers and one defender in a bib. After 2 minutes the defender changes.',
      benodigdheden: ['8 disc cones', '1 ball', '1 bib'],
      coachpunten: ['Stay available: stand beside the defender, not behind', 'The switch: one player is already on the way before the ball is played', 'Defender: switch quickly, straight into the new box'],
      variaties: {
        makkelijker: ['Bigger boxes', 'Switch after three passes'],
        moeilijker: ['Two touches', 'Two defenders (3v2)'],
      },
    },
    tekening: {
      ...leeg(20, 11),
      objecten: [
        zone('z1', 5, 5.5, 8, 8),
        zone('z2', 15, 5.5, 8, 8),
        speler('a1', 1, 2, 2.6, { kijkrichting: 0 }),
        speler('a2', 2, 8.2, 3.4, { kijkrichting: 180 }),
        speler('a3', 3, 4.6, 8.4, { kijkrichting: -90 }),
        B('b1', 4, 5.2, 4.8, { kijkrichting: 180 }),
        bal('bal', 2.55, 2.6, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'b1', naar: [6.4, 2.4], start: 0.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }, { type: 'loop', wie: 'b1', naar: [5.8, 6.4], start: 0.3 }),
        stap({ type: 'pass', van: 'a3', naar: 'a1' }, { type: 'loop', wie: 'b1', naar: [3.8, 4.2], start: 0.3 }),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'a3', via: [[9.6, 8.4]], naar: [15.4, 6], manier: 'sprint', start: 0.2 }),
        stap(
          { type: 'pass', van: 'a2', naar: 'a3' },
          { type: 'loop', wie: 'a2', via: [[12.6, 9]], naar: [17.8, 8.6], manier: 'sprint', start: 0.3 },
          { type: 'loop', wie: 'a1', via: [[6, 1.4]], naar: [12.6, 1.8], manier: 'sprint', start: 0.2 },
          { type: 'loop', wie: 'b1', naar: [14.4, 4], manier: 'sprint', start: 0.3 },
        ),
        stap({ type: 'pass', van: 'a3', naar: 'a1' }),
        pauze(0.6),
      ],
    },
  },

  // PS3. 3 tegen 3 met vier kaatsers
  {
    id: 'veld-ps-3-3-vier-kaatsers',
    naam: '3 tegen 3 met vier kaatsers',
    categorieen: ['positiespel'],
    uitleg:
      'Drie tegen drie in het vak, met op elke zijde een kaatser. De kaatsers spelen mee met het team dat de bal heeft, maar blijven op hun lijn. Tien passes achter elkaar (de kaatsers tellen mee) is een punt. Verovert het andere team de bal, dan begint het tellen opnieuw, voor hen.',
    organisatie: 'Vak van 16 × 16 m. Twee teams van drie in het vak, vier kaatsers in een andere kleur, één op elke zijde. Rondes van 3 minuten; daarna wisselen twee kaatsers met een team.',
    benodigdheden: ['4 pionnen', 'Ballen', 'Hesjes in 3 kleuren'],
    spelersNodig: 10,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 4 tegen 4 met vier kaatsers, of een tweede vak ernaast.',
    coachpunten: ['Gebruik de kaatsers om de bal te verplaatsen naar de vrije kant', 'Na je pass meteen weer aanspeelbaar worden', 'Kaatser: in één of twee keer, naar de speler die vrij staat'],
    variaties: {
      makkelijker: ['Zes passes is een punt', 'Groter vak'],
      moeilijker: ['Kaatsers spelen in één keer', 'Niet terugspelen naar wie je de bal gaf'],
    },
    en: {
      naam: '3v3 with four wall players',
      uitleg:
        'Three against three in the box, with a wall player on each side. The wall players play for the team in possession but stay on their line. Ten passes in a row (the wall players count too) is a point. If the other team wins the ball, the count starts again, for them.',
      organisatie: '16 × 16 m box. Two teams of three in the box, four wall players in another colour, one on each side. Rounds of 3 minutes; then two wall players swap with a team.',
      benodigdheden: ['4 cones', 'Balls', 'Bibs in 3 colours'],
      meerSpelers: 'With more players: 4v4 with four wall players, or a second box next to it.',
      coachpunten: ['Use the wall players to move the ball to the free side', 'Become available again straight after your pass', 'Wall player: one or two touches, to the player who is free'],
      variaties: {
        makkelijker: ['Six passes is a point', 'Bigger box'],
        moeilijker: ['Wall players play one touch', 'No passing back to the player who passed to you'],
      },
    },
    tekening: {
      ...leeg(20, 20),
      objecten: [
        zone('z', 10, 10, 16, 16),
        J('j1', 1, 10, 1.4, { kijkrichting: 90 }),
        J('j2', 2, 18.6, 10, { kijkrichting: 180 }),
        J('j3', 3, 10, 18.6, { kijkrichting: -90 }),
        J('j4', 4, 1.4, 10, { kijkrichting: 0 }),
        speler('a1', 7, 6, 12.4, { kijkrichting: 180 }),
        speler('a2', 8, 14, 6.6, { kijkrichting: 0 }),
        speler('a3', 10, 7.4, 5.6, { kijkrichting: -90 }),
        B('b1', 7, 9, 14, { kijkrichting: -90 }),
        B('b2', 8, 11.6, 9.4, { kijkrichting: 180 }),
        B('b3', 10, 15.6, 12, { kijkrichting: -90 }),
        bal('bal', 5.45, 12.4, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'a1', naar: 'j4' }, { type: 'druk', wie: 'b1', op: 'a1', afstand: 2.2, start: 0.3 }),
        stap({ type: 'pass', van: 'j4', naar: 'a3', direct: true }, { type: 'druk', wie: 'b2', op: 'a3', afstand: 2.4, start: 0.4 }),
        stap({ type: 'pass', van: 'a3', naar: 'j1' }),
        stap({ type: 'pass', van: 'j1', naar: 'a2', direct: true }, { type: 'druk', wie: 'b3', op: 'a2', afstand: 2.4, start: 0.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'j2' }),
        pauze(0.6),
      ],
    },
  },

  // PS4. Opbouwen door het middenvak
  {
    id: 'veld-ps-opbouw-via-middenvak',
    naam: 'Opbouwen door het middenvak',
    categorieen: ['positiespel'],
    uitleg:
      'Drie zones. Rood heeft drie verdedigers in de eerste zone, één middenvelder in het middenvak en twee aanvallers in de laatste zone. Blauw verdedigt met twee spelers in het middenvak en één in de laatste zone. De bal moet via de middenvelder naar de aanvallers: lukt dat, dan is het een punt. Een lange bal over het middenvak heen telt niet. Iedereen blijft in zijn eigen zone.',
    organisatie: 'Vak van 28 × 36 m in drie zones van 12 m. Rood 6, blauw 3. Na een punt of balverlies begint rood opnieuw achterin. Na 4 minuten wisselen de rollen.',
    benodigdheden: ['12 pionnen', 'Ballen', 'Hesjes in 2 kleuren'],
    spelersNodig: 9,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: twee middenvelders tegen drie in het middenvak, of een extra aanvaller.',
    coachpunten: ['Middenvelder: blijf bewegen tot je vrij staat, en kijk voor de bal komt', 'Verdedigers: speel de bal snel rond tot de middenvelder vrij is', 'Speel in op de voet weg van de verdediger'],
    variaties: {
      makkelijker: ['Twee middenvelders', 'Eén blauwe in het middenvak'],
      moeilijker: ['De middenvelder mag maar twee keer raken', 'Een blauwe mag druk zetten in de eerste zone'],
    },
    en: {
      naam: 'Building up through the middle zone',
      uitleg:
        'Three zones. Red has three defenders in the first zone, one midfielder in the middle zone and two attackers in the last zone. Blue defends with two players in the middle zone and one in the last zone. The ball must go to the attackers via the midfielder: if it does, that is a point. A long ball over the middle zone does not count. Everyone stays in their own zone.',
      organisatie: '28 × 36 m area in three zones of 12 m. Red 6, blue 3. After a point or losing the ball, red starts again at the back. After 4 minutes the roles change.',
      benodigdheden: ['12 cones', 'Balls', 'Bibs in 2 colours'],
      meerSpelers: 'With more players: two midfielders against three in the middle zone, or an extra attacker.',
      coachpunten: ['Midfielder: keep moving until you are free, and check before the ball arrives', 'Defenders: move the ball quickly until the midfielder is free', 'Pass to the foot away from the defender'],
      variaties: {
        makkelijker: ['Two midfielders', 'One blue player in the middle zone'],
        moeilijker: ['The midfielder may only touch it twice', 'One blue player may press in the first zone'],
      },
    },
    tekening: {
      ...leeg(30, 38),
      objecten: [
        zone('z3', 15, 7, 28, 12),
        zone('z2', 15, 19, 28, 12, KLEUR.geel),
        zone('z1', 15, 31, 28, 12),
        speler('a1', 4, 8, 30, { kijkrichting: -90 }),
        speler('a2', 3, 15, 32.4, { kijkrichting: -90 }),
        speler('a3', 2, 22, 30, { kijkrichting: -90 }),
        speler('a4', 8, 13, 18.6, { kijkrichting: 90 }),
        speler('a5', 11, 8, 6, { kijkrichting: 90 }),
        speler('a6', 9, 22, 5.4, { kijkrichting: 90 }),
        B('b1', 6, 9.4, 15.6, { kijkrichting: 90 }),
        B('b2', 8, 19, 15.4, { kijkrichting: 90 }),
        B('b3', 4, 15, 6.6, { kijkrichting: 90 }),
        bal('bal', 15, 31.85, 'a2'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }, { type: 'loop', wie: 'a4', naar: [19.4, 21.4], manier: 'sprint', start: 0.3 }, { type: 'loop', wie: 'b2', naar: [17.4, 18], start: 0.6 }),
        stap({ type: 'pass', van: 'a3', naar: 'a4' }, { type: 'loop', wie: 'b1', naar: [12, 14.6], start: 0.3 }),
        stap({ type: 'pass', van: 'a4', naar: 'a6' }, { type: 'druk', wie: 'b3', op: 'a6', afstand: 2.6, start: 0.4 }),
        stap({ type: 'dribbel', wie: 'a6', naar: [24.6, 3], duur: 0.8 }),
        pauze(0.6),
      ],
    },
  },

  // PS7. Positiespel met de keeper als extra man
  {
    id: 'veld-ps-keeper-extra-man',
    naam: 'Positiespel met de keeper als extra man',
    categorieen: ['positiespel'],
    uitleg:
      'Vijf tegen drie op een helft, met de keeper als vrije man achterin. Rood begint bij de keeper en probeert de bal uit te spelen over de middenlijn: dribbel er met de bal overheen. De keeper mag altijd teruggespeeld worden, zo maak je het altijd zes tegen drie. Verovert blauw de bal, dan mogen ze meteen op het doel scoren.',
    organisatie: 'Op een helft van 40 × 35 m met een doel en keeper. Rood 5 + keeper, blauw 3. Na een punt of een doelpunt begint rood opnieuw bij de keeper. Na 5 minuten wisselen drie spelers van rol.',
    benodigdheden: ['Goal', '6 pionnen', 'Ballen', 'Hesjes in 2 kleuren'],
    spelersNodig: 8,
    keepersNodig: 1,
    keeperVerplicht: true,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Keeper: bied je aan, en speel snel naar de kant waar ruimte is', 'Maak het veld groot: wijd en diep', 'Na een terugspeelbal: de bal snel naar de andere kant'],
    variaties: {
      makkelijker: ['Blauw met twee', 'Groter veld'],
      moeilijker: ['Blauw met vier', 'Maximaal twee aanrakingen'],
    },
    en: {
      naam: 'Positional play with the keeper as an extra player',
      uitleg:
        'Five against three on half a pitch, with the keeper as the free player at the back. Red starts with the keeper and tries to play out over the halfway line: dribble over it with the ball. You may always pass back to the keeper, so it is always six against three. If blue wins the ball, they may shoot at goal straight away.',
      organisatie: 'On a 40 × 35 m half with a goal and keeper. Red 5 + keeper, blue 3. After a point or a goal, red starts again with the keeper. After 5 minutes three players change roles.',
      benodigdheden: ['Goal', '6 cones', 'Balls', 'Bibs in 2 colours'],
      coachpunten: ['Keeper: offer yourself, and play quickly to the side with space', 'Make the pitch big: wide and deep', 'After a back pass: move the ball quickly to the other side'],
      variaties: {
        makkelijker: ['Blue with two', 'Bigger pitch'],
        moeilijker: ['Blue with four', 'Two touches maximum'],
      },
    },
    tekening: {
      ...leeg(44, 38),
      objecten: [
        zone('z', 22, 18, 40, 34),
        jeugdgoal('g1', 22, 1),
        keeper('k1', 1, 22, 2.4, { verdedigt: 'g1' }),
        speler('a1', 4, 12, 7, { kijkrichting: 90 }),
        speler('a2', 3, 32, 7, { kijkrichting: 90 }),
        speler('a3', 6, 22, 15, { kijkrichting: 90 }),
        speler('a4', 7, 6, 22, { kijkrichting: 90 }),
        speler('a5', 11, 38, 22, { kijkrichting: 90 }),
        B('b1', 9, 22, 9, { kijkrichting: -90 }),
        B('b2', 10, 14, 17, { kijkrichting: -90 }),
        B('b3', 7, 30, 18, { kijkrichting: -90 }),
        bal('bal', 22, 2.95, 'k1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 'a1', hoogte: 'grond' }, { type: 'druk', wie: 'b1', op: 'a1', afstand: 2.4, start: 0.5 }),
        stap({ type: 'pass', van: 'a1', naar: 'k1' }, { type: 'druk', wie: 'b1', op: 'k1', afstand: 4, start: 0.4 }),
        stap({ type: 'pass', van: 'k1', naar: 'a2', hoogte: 'grond' }),
        stap({ type: 'pass', van: 'a2', naar: 'a5' }, { type: 'druk', wie: 'b3', op: 'a5', afstand: 2.4, start: 0.5 }, { type: 'loop', wie: 'a3', naar: [27, 24], start: 0.4 }),
        stap({ type: 'pass', van: 'a5', naar: 'a3' }, { type: 'loop', wie: 'b2', naar: [20, 27], manier: 'sprint', start: 0.4 }),
        stap({ type: 'dribbel', wie: 'a3', naar: [28, 36.4], manier: 'sprint' }),
        pauze(0.6),
      ],
    },
  },

  // V2. Rugdekking geven
  {
    id: 'veld-vo-rugdekking',
    naam: 'Rugdekking geven',
    categorieen: ['verdedigen-omschakelen'],
    uitleg:
      'Twee tegen twee. De eerste verdediger zet druk op de bal. De tweede staat schuin achter hem, aan de kant van het doel, en geeft rugdekking: komt de aanvaller langs de eerste verdediger, dan stapt de tweede meteen in. Daarna wisselen de rollen: wie het dichtst bij de bal is, wordt de eerste verdediger. Na balwinst mogen de verdedigers scoren op de pionnen aan de overkant.',
    organisatie: 'Vak van 16 × 20 m. Twee kleine doeltjes achter de verdedigers, een pionnenpoort aan de overkant. Aanvallers beginnen met de bal; duels van 30 seconden. Na 4 aanvallen wisselen.',
    benodigdheden: ['2 kleine doeltjes', '6 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 4,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Eerste verdediger: druk zetten, maar niet instappen', 'Tweede verdediger: schuin achter de eerste, op 2–3 m', 'Praten: "ik dek je" en "ga maar"'],
    variaties: {
      makkelijker: ['Smaller vak', 'Aanvallers mogen maar één kant op'],
      moeilijker: ['Groter vak', 'Derde aanvaller die mag invallen'],
    },
    en: {
      naam: 'Covering your teammate',
      uitleg:
        'Two against two. The first defender presses the ball. The second stands at an angle behind them, on the goal side, and gives cover: if the attacker gets past the first defender, the second steps in straight away. Then the roles change: whoever is closest to the ball becomes the first defender. After winning the ball, the defenders may score through the cone gate on the other side.',
      organisatie: '16 × 20 m area. Two mini goals behind the defenders, a cone gate on the other side. Attackers start with the ball; duels of 30 seconds. Swap after 4 attacks.',
      benodigdheden: ['2 mini goals', '6 cones', 'Balls', 'Bibs'],
      coachpunten: ['First defender: press, but do not dive in', 'Second defender: at an angle behind the first, 2–3 m away', 'Talk: "I’ve got you covered" and "go"'],
      variaties: {
        makkelijker: ['Narrower area', 'Attackers may only go one way'],
        moeilijker: ['Bigger area', 'A third attacker who may join in'],
      },
    },
    tekening: {
      ...leeg(18, 22),
      objecten: [
        zone('z', 9, 11, 16, 20),
        doeltje('g1', 6, 1, 0),
        doeltje('g2', 12, 1, 0),
        pion('p1', 7.6, 21.2),
        pion('p2', 11.4, 21.2),
        speler('a1', 9, 7, 18, { kijkrichting: -90 }),
        speler('a2', 10, 13.4, 17, { kijkrichting: -90 }),
        B('b1', 4, 8.4, 10.6, { kijkrichting: 90 }),
        B('b2', 5, 12, 7.4, { kijkrichting: 90 }),
        bal('bal', 7, 17.45, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap(
          { type: 'dribbel', wie: 'a1', naar: [7.6, 14.2] },
          { type: 'druk', wie: 'b1', op: 'a1', afstand: 2.2, start: 0.2 },
          { type: 'loop', wie: 'b2', naar: [10.4, 9.6], manier: 'verdedigend', start: 0.3 },
          { type: 'loop', wie: 'a2', naar: [14, 13.4], start: 0.3 },
        ),
        stap({ type: 'schijn', wie: 'a1', kant: 'links' }),
        stap({ type: 'dribbel', wie: 'a1', via: [[9.8, 13.4]], naar: [10.2, 11.8], manier: 'sprint', duur: 0.9 }, { type: 'loop', wie: 'b2', naar: [10.4, 10], manier: 'verdedigend', duur: 0.5, start: 0.3 }),
        stap({ type: 'verover', wie: 'b2', van: 'a1' }, { type: 'loop', wie: 'b1', naar: [7.2, 10.4], start: 0.1 }),
        stap({ type: 'dribbel', wie: 'b2', via: [[12.4, 10.6], [12, 15.8]], naar: [10, 19.4], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [8.2, 15], manier: 'sprint', start: 0.3 }),
        pauze(0.6),
      ],
    },
  },

  // V3. Terugverdedigen na balverlies
  {
    id: 'veld-vo-terugverdedigen',
    naam: 'Terugverdedigen na balverlies',
    categorieen: ['verdedigen-omschakelen'],
    uitleg:
      'De trainer speelt de bal diep. De aanvaller start met een paar meter voorsprong; de verdediger sprint van achteren terug. Zijn doel: zo snel mogelijk tussen de bal en het doel komen, en dan pas afremmen en verdedigen. Lukt dat, dan zet hij de aanvaller naar buiten en blokt hij het schot. Daarna wisselen de rollen.',
    organisatie: 'Op een half veld met een keeper. De trainer bij de middenlijn met ballen, de aanvaller op 32 m, de verdediger 4 m achter hem. Na elke aanval wisselen.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Sprint niet naar de bal, maar naar de plek tussen bal en doel', 'Eenmaal ervoor: afremmen, laag, en de aanvaller naar buiten zetten', 'Blokken met je lichaam achter de bal, niet met een losse voet'],
    variaties: {
      makkelijker: ['Verdediger start dichter bij de aanvaller', 'Zonder keeper, op een groot doel'],
      moeilijker: ['Verdediger start verder weg', 'Aanvaller mag ook een medespeler aanspelen'],
    },
    en: {
      naam: 'Recovering after losing the ball',
      uitleg:
        'The coach plays the ball long. The attacker starts a few metres ahead; the defender sprints back from behind. The aim: get between the ball and the goal as quickly as possible, and only then slow down and defend. If that works, the defender forces the attacker wide and blocks the shot. Then the roles change.',
      organisatie: 'On half a pitch with a keeper. The coach at the halfway line with balls, the attacker at 32 m, the defender 4 m behind. Swap after every attack.',
      benodigdheden: ['Goal', '4 cones', 'Balls'],
      coachpunten: ['Do not sprint to the ball, but to the space between ball and goal', 'Once goal-side: slow down, get low and force the attacker wide', 'Block with your body behind the ball, not with a loose foot'],
      variaties: {
        makkelijker: ['Defender starts closer to the attacker', 'No keeper, on a big goal'],
        moeilijker: ['Defender starts further away', 'Attacker may also pass to a teammate'],
      },
    },
    tekening: {
      ...halfVeld({ x: 18, y: -3, breedte: 34, lengte: 46 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        trainer(29, 40, -70),
        bal('bal', 29.2, 39.45, 't1'),
        speler('a1', 9, 34, 32, { kijkrichting: -90 }),
        B('b1', 4, 37.6, 36, { kijkrichting: -90 }),
      ],
      animatie: [
        pauze(0.4),
        stap(
          { type: 'pass', van: 't1', naar: 'a1', start: 0.2 },
          { type: 'loop', wie: 'a1', naar: [33.6, 23], manier: 'sprint' },
          { type: 'loop', wie: 'b1', via: [[37.4, 26]], naar: [35.4, 18.6], manier: 'sprint', start: 0.3 },
        ),
        stap({ type: 'dribbel', wie: 'a1', naar: [31.4, 19.4] }, { type: 'loop', wie: 'b1', naar: [33.2, 16.6], manier: 'verdedigend' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [29.6, 16.2] }, { type: 'loop', wie: 'b1', naar: [31.6, 14.4], manier: 'verdedigend' }),
        stap({ type: 'schot', van: 'a1', naar: [32.4, 0.4], hoogte: 'grond', blokt: 'b1', blokSoort: 'voeten', afloopNaar: [26.6, 9.6] }),
        pauze(0.8),
      ],
    },
  },

  // V4. 3 tegen 2 en meteen 2 tegen 3 terug
  {
    id: 'veld-vo-3-2-en-2-3-terug',
    naam: '3 tegen 2 en meteen 2 tegen 3 terug',
    categorieen: ['verdedigen-omschakelen', 'partijvormen'],
    uitleg:
      'Drie aanvallers spelen tegen twee verdedigers op een doel met keeper. Na het schot (of als de verdedigers de bal veroveren) gaat het meteen de andere kant op: de twee verdedigers vallen aan op het andere doel, en de drie aanvallers moeten zo snel mogelijk terug om te verdedigen. Zo oefen je overtal uitspelen en direct omschakelen.',
    organisatie: 'Vak van 36 × 40 m met twee jeugdgoals en keepers. Drie rood, twee blauw. Na de tweede aanval beginnen de volgende vijf. De keeper speelt de bal na een redding direct uit naar een blauwe speler.',
    benodigdheden: ['2 jeugdgoals', '8 pionnen', 'Ballen', 'Hesjes in 2 kleuren'],
    spelersNodig: 5,
    keepersNodig: 2,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Aanvallers: snel afronden, het overtal duurt maar even', 'Verdedigers na de omschakeling: meteen diep, niet eerst kijken', 'De keeper speelt snel uit: het tempo zit in de eerste pass'],
    variaties: {
      makkelijker: ['Na een redding mag rood eerst rustig terug', 'Kleiner vak'],
      moeilijker: ['Binnen 8 seconden afronden', 'Een derde blauwe speler mag na de omschakeling mee'],
    },
    en: {
      naam: '3v2 and straight back 2v3',
      uitleg:
        'Three attackers play against two defenders on a goal with a keeper. After the shot (or if the defenders win the ball) play goes straight the other way: the two defenders attack the other goal, and the three attackers must get back as quickly as possible to defend. You practise using an overload and switching straight away.',
      organisatie: '36 × 40 m area with two youth goals and keepers. Three red, two blue. After the second attack the next five start. After a save the keeper plays the ball straight out to a blue player.',
      benodigdheden: ['2 youth goals', '8 cones', 'Balls', 'Bibs in 2 colours'],
      coachpunten: ['Attackers: finish quickly, the overload does not last', 'Defenders after the switch: go forward straight away, do not wait', 'The keeper distributes quickly: the tempo is in the first pass'],
      variaties: {
        makkelijker: ['After a save red may first get back calmly', 'Smaller area'],
        moeilijker: ['Finish within 8 seconds', 'A third blue player may join after the switch'],
      },
    },
    tekening: {
      ...leeg(40, 42),
      objecten: [
        zone('z', 20, 21, 36, 40),
        jeugdgoal('gT', 20, 1),
        jeugdgoal('gB', 20, 41, 180),
        keeper('kT', 1, 20, 2.4, { verdedigt: 'gT' }),
        keeper('kB', 1, 20, 39.6, { verdedigt: 'gB' }),
        speler('a1', 7, 13, 20, { kijkrichting: -90 }),
        speler('a2', 9, 20, 18, { kijkrichting: -90 }),
        speler('a3', 11, 27, 20.4, { kijkrichting: -90 }),
        B('b1', 4, 16, 11, { kijkrichting: 90 }),
        B('b2', 5, 24, 10.6, { kijkrichting: 90 }),
        bal('bal', 13, 19.45, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'druk', wie: 'b1', op: 'a2', afstand: 2.6, start: 0.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }, { type: 'loop', wie: 'a3', naar: [27.4, 15.4], manier: 'sprint' }, { type: 'loop', wie: 'b2', naar: [25.2, 9.6], manier: 'verdedigend', start: 0.3 }),
        stap({ type: 'schot', van: 'a3', naar: [21.8, 1.2], hoogte: 'laag', afloop: 'vangt', vasthouden: true }),
        stap({ type: 'loop', wie: 'b2', naar: [31, 9], manier: 'sprint', duur: 1 }, { type: 'loop', wie: 'b1', naar: [11, 16], manier: 'sprint', duur: 1.2 }),
        stap(
          { type: 'pass', van: 'kT', naar: 'b2' },
          { type: 'loop', wie: 'a3', via: [[24, 18]], naar: [24, 28], manier: 'sprint', start: 0.2 },
          { type: 'loop', wie: 'a2', naar: [19, 30], manier: 'sprint', start: 0.1 },
          { type: 'loop', wie: 'a1', naar: [11, 29], manier: 'sprint', start: 0.3 },
        ),
        stap({ type: 'dribbel', wie: 'b2', naar: [30, 24], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [13, 27], manier: 'sprint' }),
        stap({ type: 'pass', van: 'b2', naar: 'b1' }, { type: 'loop', wie: 'a3', naar: [22, 33], manier: 'sprint' }),
        stap({ type: 'schot', van: 'b1', naar: [18.4, 40.8], hoogte: 'laag', afloop: 'vangt' }),
        pauze(0.8),
      ],
    },
  },

  // V8. Vier seconden terugveroveren
  {
    id: 'veld-vo-vier-seconden',
    naam: 'Vier seconden terugveroveren',
    categorieen: ['verdedigen-omschakelen', 'partijvormen'],
    uitleg:
      'Vier tegen vier op twee kleine doeltjes. Verlies je de bal, dan heeft je team vier tellen om hem terug te pakken. De trainer telt hardop af. Lukt het, en scoor je daarna, dan telt je goal dubbel. De spelers het dichtst bij de bal zetten meteen samen druk; de rest sluit de passlijnen.',
    organisatie: 'Vak van 28 × 22 m met op elke korte kant een klein doeltje. Twee teams van vier, de trainer langs de zijlijn. Rondes van 4 minuten.',
    benodigdheden: ['2 kleine doeltjes', '8 hoedjes', 'Ballen', 'Hesjes in 2 kleuren'],
    spelersNodig: 8,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 5 tegen 5 op een groter vak, of wissel elke ronde een team.',
    coachpunten: ['Na balverlies meteen omschakelen: niet balen, maar jagen', 'Met twee tegelijk druk zetten, van twee kanten', 'Lukt het niet binnen vier tellen? Snel terug achter de bal'],
    variaties: {
      makkelijker: ['Zes tellen', 'Een joker die altijd mee verdedigt'],
      moeilijker: ['Drie tellen', 'Na terugveroveren binnen vijf tellen scoren'],
    },
    en: {
      naam: 'Win it back in four seconds',
      uitleg:
        'Four against four on two mini goals. If you lose the ball, your team has four seconds to win it back. The coach counts down out loud. If you succeed and then score, your goal counts double. The players nearest the ball press together straight away; the rest close the passing lanes.',
      organisatie: '28 × 22 m area with a mini goal at each short end. Two teams of four, the coach along the touchline. Rounds of 4 minutes.',
      benodigdheden: ['2 mini goals', '8 disc cones', 'Balls', 'Bibs in 2 colours'],
      meerSpelers: 'With more players: 5v5 in a bigger area, or swap a team every round.',
      coachpunten: ['After losing the ball, switch straight away: do not sulk, hunt', 'Press in twos, from two sides', 'Not within four seconds? Get back behind the ball quickly'],
      variaties: {
        makkelijker: ['Six seconds', 'A joker who always helps defend'],
        moeilijker: ['Three seconds', 'After winning it back, score within five seconds'],
      },
    },
    tekening: {
      ...leeg(32, 24),
      objecten: [
        zone('z', 16, 12, 28, 22),
        doeltje('gT', 16, 1, 0),
        doeltje('gB', 16, 23, 180),
        trainer(30.8, 12, 180),
        speler('a1', 4, 9, 17, { kijkrichting: -60 }),
        speler('a2', 8, 15, 12.6, { kijkrichting: -90 }),
        speler('a3', 7, 23, 16, { kijkrichting: -120 }),
        speler('a4', 9, 18.6, 6, { kijkrichting: -90 }),
        B('b1', 9, 11.4, 9, { kijkrichting: 90 }),
        B('b2', 8, 17.6, 15.6, { kijkrichting: 90 }),
        B('b3', 7, 23.4, 8.6, { kijkrichting: 90 }),
        B('b4', 4, 12, 20.6, { kijkrichting: -90 }),
        bal('bal', 9.3, 16.55, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        // Rood speelt de bal in de voeten van blauw: balverlies.
        stap({ type: 'pass', van: 'a1', naar: 'b2' }),
        stap(
          { type: 'dribbel', wie: 'b2', naar: [18.4, 18.6] },
          { type: 'druk', wie: 'a3', op: 'b2', afstand: 1.7, manier: 'sprint', start: 0.1 },
          { type: 'loop', wie: 'a2', naar: [16.2, 17.2], manier: 'sprint', start: 0.1 },
        ),
        stap({ type: 'verover', wie: 'a2', van: 'b2' }),
        stap({ type: 'pass', van: 'a2', naar: 'a4' }, { type: 'loop', wie: 'b3', naar: [20.4, 5.6], manier: 'sprint', start: 0.3 }),
        stap({ type: 'schot', van: 'a4', naar: [15.4, 0.6], hoogte: 'grond' }),
        pauze(0.8),
      ],
    },
  },

  // V9. Verdedigen in ondertal 2 tegen 3
  {
    id: 'veld-vo-ondertal-2-3',
    naam: 'Verdedigen in ondertal 2 tegen 3',
    categorieen: ['verdedigen-omschakelen'],
    uitleg:
      'Drie aanvallers tegen twee verdedigers. De verdedigers stappen niet in, maar zakken terug en houden de aanvallers op, tot de derde verdediger is teruggesprint: hij start achter de aanvallers. Dan wordt het drie tegen drie. De aanvallers proberen te scoren voor het zover is.',
    organisatie: 'Op een half veld met een keeper. Aanvallers starten op 32 m, de twee verdedigers op 20 m, de derde verdediger 6 m achter de aanvallers. Na elke aanval schuift iedereen een rol door.',
    benodigdheden: ['Goal', '6 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 6,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Niet instappen: terugzakken en tijd winnen', 'Samen het midden dicht, de aanvallers naar buiten', 'Praten: zeg wanneer de derde verdediger er is'],
    variaties: {
      makkelijker: ['Derde verdediger start dichterbij', 'Aanvallers maximaal drie aanrakingen'],
      moeilijker: ['Derde verdediger start verder weg', 'Aanvallers moeten binnen 8 seconden scoren'],
    },
    en: {
      naam: 'Defending outnumbered 2v3',
      uitleg:
        'Three attackers against two defenders. The defenders do not dive in, but drop back and hold the attackers up until the third defender has sprinted back: they start behind the attackers. Then it becomes three against three. The attackers try to score before that happens.',
      organisatie: 'On half a pitch with a keeper. Attackers start at 32 m, the two defenders at 20 m, the third defender 6 m behind the attackers. After each attack everyone moves on one role.',
      benodigdheden: ['Goal', '6 cones', 'Balls', 'Bibs'],
      coachpunten: ['Do not dive in: drop back and buy time', 'Close the middle together and force the attackers wide', 'Talk: say when the third defender is back'],
      variaties: {
        makkelijker: ['Third defender starts closer', 'Attackers three touches maximum'],
        moeilijker: ['Third defender starts further away', 'Attackers must score within 8 seconds'],
      },
    },
    tekening: {
      ...halfVeld({ x: 14, y: -3, breedte: 42, lengte: 46 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        speler('a1', 10, 34, 32, { kijkrichting: -90 }),
        speler('a2', 7, 24, 30, { kijkrichting: -90 }),
        speler('a3', 11, 44, 31, { kijkrichting: -90 }),
        B('b1', 4, 30, 20, { kijkrichting: 90 }),
        B('b2', 5, 38, 20, { kijkrichting: 90 }),
        B('b3', 3, 40, 38, { kijkrichting: -90 }),
        bal('bal', 34, 31.45, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap(
          { type: 'dribbel', wie: 'a1', naar: [34, 26] },
          { type: 'loop', wie: 'b1', naar: [31, 17], manier: 'verdedigend' },
          { type: 'loop', wie: 'b2', naar: [37, 17], manier: 'verdedigend' },
          { type: 'loop', wie: 'b3', via: [[39, 26]], naar: [40, 16], manier: 'sprint', start: 0.2 },
          { type: 'loop', wie: 'a3', naar: [44, 24] },
          { type: 'loop', wie: 'a2', naar: [24, 24] },
        ),
        stap({ type: 'pass', van: 'a1', naar: 'a3' }, { type: 'druk', wie: 'b2', op: 'a3', afstand: 3, manier: 'verdedigend', start: 0.3 }),
        stap({ type: 'dribbel', wie: 'a3', naar: [43, 19.6] }, { type: 'loop', wie: 'b3', naar: [41.4, 15.4], manier: 'verdedigend' }),
        stap({ type: 'schot', van: 'a3', naar: [36.6, 0.5], hoogte: 'laag', afloop: 'vangt' }),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
