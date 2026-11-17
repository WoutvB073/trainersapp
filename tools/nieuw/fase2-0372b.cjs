// Fase 2, deel 3, batch 3 (0.37.2), deel b: eerder overgeslagen voorstellen die toch anders zijn dan een bestaande oefening
// (correctie van de gebruiker, 17-11-2026): pass en trap P2, P4, P11, P13 en afwerken A2, A5, A6, A7, A12.
// Draaien: node tools/nieuw/fase2-0372b.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, speler, trainer, bal, pion, hoedje, pop, pauze, stap, B, zone, leeg, ring, JO, OUD, MIDDEN, O6, KLEUR, omrekenen, draai } = require('./fase2-hulp.cjs');

const halfVeld = (weergave) => ({ veld: { type: 'half' }, weergave, camera: 'schuin' });

const oefeningen = [
  // P2. Driehoek met in- en uitdraaien
  {
    id: 'veld-pt-driehoek-in-uitdraaien',
    naam: 'Driehoek met in- en uitdraaien',
    categorieen: ['pass-en-trap'],
    uitleg:
      'Drie spelers in een driehoek. Voor je de bal krijgt, loop je eerst een paar passen weg van de bal en kom je dan kort naar hem toe: zo maak je ruimte. Neem de bal open gedraaid aan, met je eerste aanraking al richting de volgende speler, en speel door. Wie gespeeld heeft, loopt meteen weer weg om opnieuw in te komen.',
    organisatie: 'Driehoek van drie pionnen, zijden van 12 m. Eén speler bij elke pion, één bal. Na 2 minuten de andere kant op (dan draai je met je andere voet open).',
    benodigdheden: ['3 pionnen', '1 bal'],
    spelersNodig: 3,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Eerst weg, dan pas naar de bal: zo kom je vrij', 'Open draaien: je lichaam staat al naar de volgende speler', 'Speel in op de voet waarmee je maatje gaat aannemen'],
    variaties: {
      makkelijker: ['Grotere driehoek', 'Twee aanrakingen mag altijd'],
      moeilijker: ['Een verdediger in het midden', 'Doorspelen in één keer na het indraaien'],
    },
    en: {
      naam: 'Triangle with checking away and in',
      uitleg:
        'Three players in a triangle. Before you receive the ball, first move a few steps away from it and then come short towards it: that creates space. Receive the ball on the half turn, with your first touch already towards the next player, and play on. As soon as you have played, move away again to come in once more.',
      organisatie: 'Triangle of three cones, 12 m sides. One player at each cone, one ball. After 2 minutes go the other way (then you open up with your other foot).',
      benodigdheden: ['3 cones', '1 ball'],
      coachpunten: ['Away first, then towards the ball: that is how you get free', 'Open up: your body already faces the next player', 'Pass to the foot your partner will receive with'],
      variaties: {
        makkelijker: ['Bigger triangle', 'Two touches always allowed'],
        moeilijker: ['A defender in the middle', 'Play on first time after checking in'],
      },
    },
    // Veld iets breder en alles 1 m opzij: speler 2 bleef in 3D niet helemaal in beeld.
    tekening: omrekenen({
      ...leeg(22, 16),
      objecten: [
        pion('pa', 2.2, 10.4),
        pion('pb', 17.8, 10.4),
        pion('pc', 8.4, 1.6),
        speler('a1', 1, 3.4, 12, { kijkrichting: 0 }),
        speler('a2', 2, 16.6, 12, { kijkrichting: 180 }),
        speler('a3', 3, 10, 3.2, { kijkrichting: 90 }),
        bal('bal', 3.95, 12, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'loop', wie: 'a2', naar: [18.2, 14], duur: 0.8 }),
        stap({ type: 'loop', wie: 'a2', naar: [16.2, 11.8], manier: 'sprint', duur: 0.6 }, { type: 'pass', van: 'a1', naar: 'a2', start: 0.15 }, { type: 'loop', wie: 'a3', naar: [11.6, 1.4], start: 0.5, duur: 0.8 }),
        stap({ type: 'loop', wie: 'a3', naar: [10.4, 3.6], manier: 'sprint', duur: 0.6 }, { type: 'pass', van: 'a2', naar: 'a3', start: 0.2 }, { type: 'loop', wie: 'a1', naar: [1.6, 14.2], start: 0.5, duur: 0.8 }),
        stap({ type: 'loop', wie: 'a1', naar: [3.6, 11.8], manier: 'sprint', duur: 0.6 }, { type: 'pass', van: 'a3', naar: 'a1', start: 0.2 }),
        pauze(0.6),
      ],
    }, ([x, y]) => [x + 1, y]),
  },

  // P4. Vierkant met twee ballen tegen de klok
  {
    id: 'veld-pt-vierkant-twee-ballen-klok',
    naam: 'Vierkant met twee ballen tegen de klok',
    categorieen: ['pass-en-trap'],
    uitleg:
      'Zes spelers verdeeld over de vier hoeken van een vierkant: in twee schuin tegenover elkaar liggende hoeken staan er twee. Twee ballen gaan tegelijk rond: pass naar de volgende hoek en volg je bal. De ballen mogen elkaar niet inhalen. Hoeveel passes halen jullie samen in één minuut? Probeer het daarna te verbeteren.',
    organisatie: 'Vierkant van 12 × 12 m met een pion op elke hoek. Zes spelers: twee bij hoek A en C, één bij B en D. Twee ballen bij A en C. Wie volgt, wacht achter de pion tot hij aan de beurt is. De trainer klokt en telt hardop mee.',
    benodigdheden: ['4 pionnen', '2 ballen'],
    spelersNodig: 6,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Neem aan richting de volgende hoek: dan kun je meteen spelen', 'Strak over de grond, op de goede voet', 'Na je pass meteen sprinten, maar achter de pion wachten'],
    variaties: {
      makkelijker: ['Eén bal', 'Groter vierkant'],
      moeilijker: ['Alleen in één keer', 'Op het fluitje de andere kant op'],
    },
    en: {
      naam: 'Square with two balls against the clock',
      uitleg:
        'Six players spread over the four corners of a square: two at each of two diagonally opposite corners. Two balls go round at the same time: pass to the next corner and follow your ball. The balls must not catch each other up. How many passes can you make together in one minute? Then try to beat it.',
      organisatie: '12 × 12 m square with a cone on each corner. Six players: two at corners A and C, one at B and D. Two balls at A and C. Whoever follows waits behind the cone until it is their turn. The coach times and counts out loud.',
      benodigdheden: ['4 cones', '2 balls'],
      coachpunten: ['Receive towards the next corner, so you can play straight away', 'Firm along the ground, to the right foot', 'Sprint straight after your pass, but wait behind the cone'],
      variaties: {
        makkelijker: ['One ball', 'Bigger square'],
        moeilijker: ['One touch only', 'On the whistle, change direction'],
      },
    },
    // Veld 22 × 22 en alles 2 m verschoven: de wachtende spelers bleven in 3D niet in beeld.
    tekening: omrekenen({
      ...leeg(22, 22),
      objecten: [
        zone('z', 9, 9, 12, 12),
        speler('a1', 1, 3, 15, { kijkrichting: 0 }),
        speler('a5', 5, 1.4, 16.6, { kijkrichting: 0 }),
        speler('a2', 2, 15, 15, { kijkrichting: -90 }),
        speler('a3', 3, 15, 3, { kijkrichting: 180 }),
        speler('a6', 6, 16.6, 1.4, { kijkrichting: 180 }),
        speler('a4', 4, 3, 3, { kijkrichting: 90 }),
        bal('b1', 3.55, 15, 'a1'),
        bal('b2', 14.45, 3, 'a3'),
      ],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'pass', van: 'a1', naar: 'a2' },
          { type: 'loop', wie: 'a1', via: [[9, 17]], naar: [16.6, 16.8], manier: 'sprint', start: 0.3 },
          { type: 'pass', van: 'a3', naar: 'a4' },
          { type: 'loop', wie: 'a3', via: [[9, 1]], naar: [1.4, 1.2], manier: 'sprint', start: 0.3 },
          { type: 'loop', wie: 'a5', naar: [3, 15], start: 0.7, duur: 0.8 },
          { type: 'loop', wie: 'a6', naar: [15, 3], start: 0.7, duur: 0.8 },
        ),
        stap(
          { type: 'pass', van: 'a2', naar: 'a6' },
          { type: 'loop', wie: 'a2', via: [[17, 9]], naar: [16.8, 1.4], manier: 'sprint', start: 0.3 },
          { type: 'pass', van: 'a4', naar: 'a5' },
          { type: 'loop', wie: 'a4', via: [[1, 9]], naar: [1.2, 16.6], manier: 'sprint', start: 0.3 },
          { type: 'loop', wie: 'a1', naar: [15, 15], start: 0.9, duur: 0.8 },
          { type: 'loop', wie: 'a3', naar: [3, 3], start: 0.9, duur: 0.8 },
        ),
        stap(
          { type: 'pass', van: 'a6', naar: 'a3' },
          { type: 'loop', wie: 'a6', via: [[9, 1]], naar: [1.4, 1.2], manier: 'sprint', start: 0.3 },
          { type: 'pass', van: 'a5', naar: 'a1' },
          { type: 'loop', wie: 'a5', via: [[9, 17]], naar: [16.6, 16.8], manier: 'sprint', start: 0.3 },
          { type: 'loop', wie: 'a2', naar: [15, 3], start: 0.9, duur: 0.8 },
          { type: 'loop', wie: 'a4', naar: [3, 15], start: 0.9, duur: 0.8 },
        ),
        pauze(0.6),
      ],
    }, ([x, y]) => [x + 2, y + 2]),
  },

  // P11. Tikkie-takkie-estafette
  {
    id: 'veld-pt-tikkie-takkie-estafette',
    naam: 'Tikkie-takkie-estafette',
    categorieen: ['pass-en-trap'],
    uitleg:
      'Twee teams, elk in twee rijen tegenover elkaar. Speel de bal naar de voorste van de rij aan de overkant en sluit daar achteraan aan, buitenlangs. Zo gaat de bal heen en weer. Elk team telt hardop: welk team haalt als eerste 20 goede passes? Een pass die naast gaat, telt niet.',
    organisatie: 'Per team twee rijen op 10 m van elkaar (pionnen), de twee teams 8 m naast elkaar. Drie of meer spelers per team, één bal per team. De trainer geeft het startsein.',
    benodigdheden: ['4 pionnen', '2 ballen', 'Hesjes'],
    spelersNodig: 6,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Neem de bal aan richting de overkant', 'Snel, maar zuiver: een slechte pass kost meer tijd', 'Buitenlangs aansluiten, niet door de rij heen'],
    variaties: {
      makkelijker: ['Rijen dichter bij elkaar', 'Tot 10 passes'],
      moeilijker: ['Alleen in één keer', 'Met je andere voet'],
    },
    en: {
      naam: 'Tiki-taka relay',
      uitleg:
        'Two teams, each in two lines facing each other. Pass the ball to the front player of the line opposite and join the back of that line, round the outside. The ball goes back and forth. Each team counts out loud: which team is first to 20 good passes? A pass that goes wide does not count.',
      organisatie: 'For each team two lines 10 m apart (cones), the two teams 8 m side by side. Three or more players per team, one ball per team. The coach gives the start signal.',
      benodigdheden: ['4 cones', '2 balls', 'Bibs'],
      coachpunten: ['Receive the ball towards the other side', 'Quick but accurate: a bad pass costs more time', 'Join round the outside, not through the line'],
      variaties: {
        makkelijker: ['Lines closer together', 'Up to 10 passes'],
        moeilijker: ['One touch only', 'With your other foot'],
      },
    },
    // Een kwartslag gedraaid: de rijen staan in 3D naast elkaar, niet achter elkaar.
    tekening: omrekenen(
      draai({
      ...leeg(20, 18),
      objecten: [
        speler('a1', 1, 5, 3, { kijkrichting: 90 }),
        speler('a3', 3, 5, 1.2, { kijkrichting: 90 }),
        speler('a2', 2, 5, 13, { kijkrichting: -90 }),
        B('b1', 1, 13, 3, { kijkrichting: 90 }),
        B('b3', 3, 13, 1.2, { kijkrichting: 90 }),
        B('b2', 2, 13, 13, { kijkrichting: -90 }),
        bal('ba', 5, 3.55, 'a1'),
        bal('bb', 13, 3.55, 'b1'),
      ],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'pass', van: 'a1', naar: 'a2' },
          { type: 'loop', wie: 'a1', via: [[6.8, 9], [6.8, 14.6]], naar: [5, 15.2], manier: 'sprint', start: 0.3 },
          { type: 'loop', wie: 'a3', naar: [5, 3], start: 0.6, duur: 0.9 },
          { type: 'pass', van: 'b1', naar: 'b2', start: 0.2 },
          { type: 'loop', wie: 'b1', via: [[14.8, 9], [14.8, 14.6]], naar: [13, 15.2], manier: 'sprint', start: 0.5 },
          { type: 'loop', wie: 'b3', naar: [13, 3], start: 0.8, duur: 0.9 },
        ),
        stap(
          { type: 'pass', van: 'a2', naar: 'a3' },
          { type: 'loop', wie: 'a2', via: [[3.2, 7], [3.2, 1.4]], naar: [5, 0.8], manier: 'sprint', start: 0.3 },
          { type: 'loop', wie: 'a1', naar: [5, 13], start: 0.7, duur: 0.9 },
          { type: 'pass', van: 'b2', naar: 'b3', start: 0.3 },
          { type: 'loop', wie: 'b2', via: [[11.2, 7], [11.2, 1.4]], naar: [13, 0.8], manier: 'sprint', start: 0.6 },
          { type: 'loop', wie: 'b1', naar: [13, 13], start: 0.9, duur: 0.9 },
        ),
        stap({ type: 'pass', van: 'a3', naar: 'a1' }, { type: 'pass', van: 'b3', naar: 'b1', start: 0.2 }),
        pauze(0.6),
      ],
    }, [9, 9], 90),
      ([x, y]) => [x + 1, y],
    ),
  },

  // P13. Rollen naar de hoepel (O6)
  {
    id: 'veld-pt-rollen-naar-de-hoepel',
    naam: 'Rollen naar de hoepel',
    categorieen: ['pass-en-trap'],
    uitleg:
      'Voor je liggen drie hoepels, steeds een stukje verder weg. Speel je bal zo zachtjes dat hij in een hoepel blijft liggen. De gele hoepel is 1 punt, de blauwe 2 punten en de rode, het verst weg, 3 punten. Rolt hij erdoorheen? Dan heb je geen punt. Haal je bal op en probeer het nog eens!',
    organisatie: 'Drie hoepels op 3, 5 en 7 m van de startlijn (hoedjes), een stukje naast elkaar, zodat een bal niet door een andere hoepel rolt. Twee kinderen naast elkaar, ieder met een bal. Ze spelen om de beurt en halen hun bal zelf terug.',
    benodigdheden: ['3 hoepels', '2 hoedjes', 'Voetballen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: O6,
    doorwisselbaar: true,
    coachpunten: ['Zachtjes, met de binnenkant van je voet', 'Kijk eerst naar de hoepel die je kiest', 'Je standbeen naast de bal'],
    variaties: {
      makkelijker: ['Hoepels dichterbij', 'De bal mag ook in de hoepel stoppen met een tweede tikje'],
      moeilijker: ['Met je andere voet', 'Om de beurt een hoepel die de ander kiest'],
    },
    en: {
      naam: 'Roll it into the hoop',
      uitleg:
        'In front of you there are three hoops, each a bit further away. Pass your ball so gently that it stays in a hoop. The yellow hoop is 1 point, the blue one 2 points and the red one, furthest away, 3 points. Does it roll right through? Then you get no point. Fetch your ball and try again!',
      organisatie: 'Three hoops 3, 5 and 7 m from the start line (disc cones), a little apart, so a ball does not roll through another hoop. Two children side by side, each with a ball. They take turns and fetch their own ball.',
      benodigdheden: ['3 hoops', '2 disc cones', 'Footballs'],
      coachpunten: ['Gently, with the inside of your foot', 'First look at the hoop you choose', 'Your standing foot next to the ball'],
      variaties: {
        makkelijker: ['Hoops closer', 'The ball may also stop in the hoop with a second little touch'],
        moeilijker: ['With your other foot', 'Take turns choosing a hoop for each other'],
      },
    },
    tekening: {
      ...leeg(10, 14),
      objecten: [
        hoedje('h1', 2, 11.6),
        hoedje('h2', 8, 11.6),
        ring('r1', 5, 9, KLEUR.geel),
        ring('r2', 2.6, 6.8, KLEUR.blauw),
        ring('r3', 7.6, 4.8, KLEUR.rood),
        speler('a1', 1, 3.4, 12.6, { kijkrichting: -80 }),
        speler('a2', 2, 6.6, 12.6, { kijkrichting: -100 }),
        bal('b1', 3.5, 12.05, 'a1'),
        bal('b2', 6.5, 12.05, 'a2'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: [2.6, 6.8] }),
        pauze(0.5),
        stap({ type: 'pass', van: 'a2', naar: [7.6, 4.8] }),
        pauze(0.5),
        stap({ type: 'loop', wie: 'a1', naar: [3.2, 8] }, { type: 'loop', wie: 'a2', naar: [7.2, 6.2], start: 0.3 }),
        pauze(0.6),
      ],
    },
  },

  // A2. Afronden op de tweede paal
  {
    id: 'veld-af-tweede-paal',
    naam: 'Afronden op de tweede paal',
    categorieen: ['afwerken'],
    uitleg:
      'De buitenspeler dribbelt naar de achterlijn en geeft een lage, harde voorzet achter de verdediging langs, tussen keeper en verdedigers in. De spits loopt naar de eerste paal en trekt zo de aandacht; hij laat de bal lopen. De buitenspeler van de andere kant komt in de rug van de verdediging naar de tweede paal en tikt binnen. Daarna van de andere kant.',
    organisatie: 'Op een half veld met een keeper. Buitenspeler rechts met ballen op 25 m, spits in het midden op 18 m, buitenspeler links op 20 m. Na drie voorzetten wisselen de rollen en komt de voorzet van links.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 3,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Voorzet laag en hard, tussen keeper en verdediging', 'De spits gaat naar de eerste paal en laat hem lopen', 'Tweede paal: laat in je sprint aankomen, en tik in de korte hoek'],
    variaties: {
      makkelijker: ['Voorzet over de grond vanaf de rand van de zestien', 'Zonder keeper'],
      moeilijker: ['Een verdediger die mee terugloopt', 'De spits mag ook zelf afronden: kies op tijd'],
    },
    en: {
      naam: 'Finishing at the far post',
      uitleg:
        'The winger dribbles to the byline and plays a low, hard cross behind the defence, between the keeper and the defenders. The striker runs to the near post to draw attention, and lets the ball run. The winger from the other side comes in behind the defence to the far post and taps it in. Then from the other side.',
      organisatie: 'On half a pitch with a keeper. Right winger with balls at 25 m, striker in the middle at 18 m, left winger at 20 m. After three crosses the roles change and the cross comes from the left.',
      benodigdheden: ['Goal', '4 cones', 'Balls'],
      coachpunten: ['Cross low and hard, between keeper and defence', 'The striker goes to the near post and lets it run', 'Far post: arrive late, at full speed, and tap it into the near corner'],
      variaties: {
        makkelijker: ['Cross along the ground from the edge of the box', 'No keeper'],
        moeilijker: ['A defender tracking back', 'The striker may also finish: decide in time'],
      },
    },
    tekening: {
      ...halfVeld({ x: 12, y: -3, breedte: 50, lengte: 32 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        speler('a1', 7, 52, 22, { kijkrichting: -100 }),
        speler('a2', 9, 35, 18, { kijkrichting: -90 }),
        speler('a3', 11, 20, 20, { kijkrichting: -60 }),
        bal('bal', 51.9, 21.45, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap(
          { type: 'dribbel', wie: 'a1', naar: [50.5, 4.2], duur: 3 },
          { type: 'loop', wie: 'a2', via: [[38, 11]], naar: [38.6, 5.4], manier: 'sprint', start: 1.6 },
          { type: 'loop', wie: 'a3', via: [[24, 10]], naar: [29.8, 4.6], manier: 'sprint', start: 1.4 },
        ),
        stap({ type: 'pass', van: 'a1', naar: 'a3', hoogte: 'grond', snelheid: 17 }),
        stap({ type: 'schot', van: 'a3', naar: [31.6, -0.3], hoogte: 'grond', direct: true, afloop: 'goal' }),
        pauze(1),
      ],
    },
  },

  // A5. Aannemen met de rug naar het doel en schieten
  {
    id: 'veld-af-rug-naar-doel-draaien',
    naam: 'Aannemen met de rug naar het doel en schieten',
    categorieen: ['afwerken', 'een-tegen-een'],
    uitleg:
      'De aangever speelt de bal in de voeten van de spits, die met zijn rug naar het doel staat. Een verdediger komt in zijn rug. De spits kiest: zit de verdediger dicht op hem, dan kaatst hij op de aangever en loopt hij weg voor de terugbal; laat de verdediger ruimte, dan draait hij zelf weg. Binnen drie tellen na de aanname moet hij afronden. In het voorbeeld draait de spits weg.',
    organisatie: 'Op een half veld met een keeper. Aangever op 30 m, spits op 19 m met zijn rug naar het doel, verdediger 2–3 m achter hem. De trainer telt hardop tot drie. Na vier keer wisselen spits en verdediger.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 3,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Kijk over je schouder voor de bal komt: waar staat de verdediger?', 'Ruimte? Draai bij de aanname al weg van de verdediger', 'Dicht op je? Kaats en loop weg voor de terugbal'],
    variaties: {
      makkelijker: ['De verdediger mag eerst alleen volgen', 'Vijf tellen'],
      moeilijker: ['De verdediger mag meteen alles', 'Twee tellen'],
    },
    en: {
      naam: 'Receiving with your back to goal and shooting',
      uitleg:
        'The server plays the ball into the feet of the striker, who has their back to goal. A defender comes in behind them. The striker decides: if the defender is tight, they lay it back to the server and spin away for the return pass; if the defender gives space, they turn on their own. They must finish within three seconds of receiving. In the example the striker turns.',
      organisatie: 'On half a pitch with a keeper. Server at 30 m, striker at 19 m with their back to goal, defender 2–3 m behind. The coach counts out loud to three. After four turns, striker and defender swap.',
      benodigdheden: ['Goal', '4 cones', 'Balls'],
      coachpunten: ['Check over your shoulder before the ball arrives: where is the defender?', 'Space? Turn away from the defender as you receive', 'Tight on you? Lay it off and spin away for the return'],
      variaties: {
        makkelijker: ['At first the defender may only follow', 'Five seconds'],
        moeilijker: ['The defender may do everything straight away', 'Two seconds'],
      },
    },
    tekening: {
      ...halfVeld({ x: 18, y: -3, breedte: 32, lengte: 38 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        speler('a1', 8, 33, 30, { kijkrichting: -90 }),
        speler('a2', 9, 34, 19, { kijkrichting: 90 }),
        B('b1', 4, 35.8, 16.4, { kijkrichting: 90 }),
        bal('bal', 33, 29.45, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'b1', naar: [35.4, 17.2], manier: 'verdedigend', start: 0.4 }),
        stap({ type: 'truc', wie: 'a2', soort: 'buitenkant', voet: 'links', kijk: -120 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [31.4, 15.4], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [33.8, 14.6], manier: 'sprint', start: 0.2 }),
        stap({ type: 'schot', van: 'a2', naar: [31.2, 0.3], hoogte: 'laag', afloop: 'goal' }),
        pauze(0.8),
      ],
    },
  },

  // A6. Voorzet van de achterlijn en koppen
  {
    id: 'veld-af-voorzet-kruislings-koppen',
    naam: 'Voorzet van de achterlijn en koppen',
    categorieen: ['afwerken'],
    uitleg:
      'De buitenspeler dribbelt tot aan de achterlijn en geeft een hoge voorzet. Twee spelers lopen kruislings in: wie links begint, loopt naar de eerste paal; wie rechts begint, naar de tweede. Door het kruisen kan een verdediger ze moeilijk volgen. De speler waar de bal komt, kopt hem naar beneden in de hoek.',
    organisatie: 'Op een half veld met een keeper. Buitenspeler met ballen op 25 m langs de zijlijn, twee spitsen naast elkaar op 18 m. Na drie voorzetten wisselen de rollen; daarna van de andere kant.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 3,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Kruis op tijd, maar niet te vroeg: kom aan als de bal komt', 'Spring vanaf één been en kop met je voorhoofd naar beneden', 'Buitenspeler: kijk op voor je voorzet waar de spitsen zijn'],
    variaties: {
      makkelijker: ['Voorzet uit de hand gooien', 'Zonder keeper'],
      moeilijker: ['Een verdediger die de spitsen volgt', 'Voorzet in één keer na een pass'],
    },
    en: {
      naam: 'Cross from the byline and headers',
      uitleg:
        'The winger dribbles to the byline and plays a high cross. Two players make crossing runs: the one starting on the left runs to the near post, the one starting on the right to the far post. Crossing makes them hard to follow for a defender. The player the ball reaches heads it down into the corner.',
      organisatie: 'On half a pitch with a keeper. Winger with balls at 25 m along the touchline, two strikers side by side at 18 m. After three crosses the roles change; then from the other side.',
      benodigdheden: ['Goal', '4 cones', 'Balls'],
      coachpunten: ['Cross over in time, but not too early: arrive as the ball arrives', 'Take off from one leg and head down with your forehead', 'Winger: look up before you cross to see where the strikers are'],
      variaties: {
        makkelijker: ['Throw the cross from your hands', 'No keeper'],
        moeilijker: ['A defender following the strikers', 'Cross first time after a pass'],
      },
    },
    tekening: {
      ...halfVeld({ x: 14, y: -3, breedte: 46, lengte: 32 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        speler('a1', 7, 54, 24, { kijkrichting: -100 }),
        speler('a2', 9, 30.4, 18, { kijkrichting: -90 }),
        speler('a3', 10, 37.6, 18.4, { kijkrichting: -90 }),
        bal('bal', 53.9, 23.45, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap(
          { type: 'dribbel', wie: 'a1', naar: [52.6, 4.4], duur: 3.2 },
          { type: 'loop', wie: 'a3', via: [[34, 12.4]], naar: [30.4, 6.6], manier: 'sprint', start: 1.2 },
          { type: 'loop', wie: 'a2', via: [[33.2, 14.2]], naar: [37.8, 6], manier: 'sprint', start: 1.9 },
        ),
        stap({ type: 'pass', van: 'a1', naar: 'a3', hoogte: 'hoog', eindHoogte: 1.9 }),
        stap({ type: 'schot', van: 'a3', naar: [31.6, 0.2], afloop: 'goal', direct: true }),
        pauze(1),
      ],
    },
  },

  // A7. Eén-tweetje en schot
  {
    id: 'veld-af-een-tweetje-schot',
    naam: 'Eén-tweetje en schot',
    categorieen: ['afwerken'],
    uitleg:
      'Dribbel op de pop af. Naast de pop staat een kaatser. Speel hem aan als je dichtbij bent, loop langs de pop en krijg de bal terug in je loop. Schiet in één keer vanaf de rand van de zestien, laag in de hoek. De kaatser haalt daarna de bal en wordt de volgende schutter.',
    organisatie: 'Op een half veld met een keeper. Pop op 21 m, kaatser 3 m naast de pop. Rij schutters met ballen op 30 m. Na elk schot schuift iedereen een plek door: schutter wordt kaatser, kaatser sluit aan in de rij.',
    benodigdheden: ['Goal', '1 pop', '2 pionnen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Speel de kaatser pas aan als de pop dichtbij is', 'Na je pass versnellen langs de pop', 'Schieten in één keer: kijk naar de bal, standbeen ernaast'],
    variaties: {
      makkelijker: ['Eerst aannemen, dan schieten', 'Zonder keeper, op een groot doel'],
      moeilijker: ['Een verdediger in plaats van de pop', 'Schieten met je andere voet'],
    },
    en: {
      naam: 'One-two and shot',
      uitleg:
        'Dribble towards the mannequin. Next to it stands a wall player. Pass to them when you get close, run past the mannequin and get the ball back in your stride. Shoot first time from the edge of the box, low into the corner. The wall player then fetches the ball and becomes the next shooter.',
      organisatie: 'On half a pitch with a keeper. Mannequin at 21 m, wall player 3 m beside it. Line of shooters with balls at 30 m. After each shot everyone moves on one place: the shooter becomes the wall player, the wall player joins the line.',
      benodigdheden: ['Goal', '1 mannequin', '2 cones', 'Balls'],
      coachpunten: ['Only pass to the wall player when the mannequin is close', 'After your pass, accelerate past the mannequin', 'Shooting first time: watch the ball, standing foot beside it'],
      variaties: {
        makkelijker: ['Control first, then shoot', 'No keeper, on a big goal'],
        moeilijker: ['A defender instead of the mannequin', 'Shoot with your other foot'],
      },
    },
    tekening: {
      ...halfVeld({ x: 18, y: -3, breedte: 32, lengte: 38 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        pop('pop', 33.4, 21),
        speler('a1', 9, 32, 30, { kijkrichting: -90 }),
        speler('a2', 10, 37, 21.6, { kijkrichting: 180 }),
        bal('bal', 32, 29.45, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'dribbel', wie: 'a1', naar: [33, 24.6] }),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'a1', via: [[34.8, 22.4]], naar: [35.2, 17.6], manier: 'sprint', start: 0.2 }),
        stap({ type: 'pass', van: 'a2', naar: 'a1', direct: true }),
        stap({ type: 'schot', van: 'a1', naar: [31.4, 0.3], hoogte: 'grond', direct: true, afloop: 'goal' }),
        pauze(0.8),
      ],
    },
  },

  // A12. Kanonnen (O6)
  {
    id: 'veld-af-kanonnen',
    naam: 'Kanonnen',
    categorieen: ['afwerken'],
    uitleg:
      'Jullie zijn kanonnen! Schiet je bal zo hard als je kunt in het grote goal. De trainer staat in het goal en doet bij elk doelpunt alsof hij omvalt van de kracht. Haal je bal op en schiet nog een keer. Wie laat de trainer het vaakst omvallen?',
    organisatie: 'Groot doel met de trainer erin. Schietlijn van hoedjes op 7 m. Drie kinderen naast elkaar, ieder met een bal; ze schieten om de beurt. De trainer houdt de bal niet tegen, maar laat zich na elk doelpunt vallen.',
    benodigdheden: ['1 grote goal', '4 hoedjes', 'Voetballen'],
    spelersNodig: 3,
    keepersNodig: 0,
    leeftijden: O6,
    doorwisselbaar: true,
    coachpunten: ['Neem een paar passen aanloop', 'Schiet met je veter, je teen naar beneden', 'Kijk naar de bal als je schiet'],
    variaties: {
      makkelijker: ['Dichterbij', 'De bal stilleggen voor je schiet'],
      moeilijker: ['Verder weg', 'Schieten met je andere voet'],
    },
    en: {
      naam: 'Cannons',
      uitleg:
        'You are cannons! Shoot your ball into the big goal as hard as you can. The coach stands in the goal and pretends to fall over from the power of every goal. Fetch your ball and shoot again. Who can make the coach fall over the most?',
      organisatie: 'Big goal with the coach in it. Shooting line of disc cones at 7 m. Three children side by side, each with a ball; they shoot in turn. The coach does not stop the ball, but drops to the ground after every goal.',
      benodigdheden: ['1 big goal', '4 disc cones', 'Footballs'],
      coachpunten: ['Take a few steps run-up', 'Shoot with your laces, toes pointing down', 'Watch the ball as you shoot'],
      variaties: {
        makkelijker: ['Closer', 'Stop the ball before you shoot'],
        moeilijker: ['Further away', 'Shoot with your other foot'],
      },
    },
    tekening: {
      ...leeg(16, 12),
      objecten: [
        { id: 'g1', soort: 'goal', x: 8, y: 0.5 },
        hoedje('h1', 3, 7.6),
        hoedje('h2', 6.4, 7.6),
        hoedje('h3', 9.6, 7.6),
        hoedje('h4', 13, 7.6),
        trainer(8, 1.6, 90),
        speler('a1', 1, 5, 9, { kijkrichting: -80 }),
        speler('a2', 2, 8, 9.6, { kijkrichting: -90 }),
        speler('a3', 3, 11, 9, { kijkrichting: -100 }),
        bal('b1', 5.1, 8.45, 'a1'),
        bal('b2', 8, 9.05, 'a2'),
        bal('b3', 10.9, 8.45, 'a3'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'schot', van: 'a1', naar: [5.6, 0.2], hoogte: 'laag' }),
        stap({ type: 'zitten', wie: 't1', soort: 'zit', start: 0.1, duur: 0.5 }),
        stap({ type: 'opstaan', wie: 't1' }),
        stap({ type: 'schot', van: 'a3', naar: [10.6, 0.2], hoogte: 'laag' }),
        stap({ type: 'zitten', wie: 't1', soort: 'zit', start: 0.1, duur: 0.5 }),
        stap({ type: 'opstaan', wie: 't1' }),
        pauze(0.6),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
