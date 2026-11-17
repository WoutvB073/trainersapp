// Fase 2, deel 3, batch 3 (0.37.2), deel a: eerder overgeslagen voorstellen die toch anders zijn dan een bestaande oefening
// (correctie van de gebruiker, 17-11-2026): L2, T1, T5, T13, S6, S8.
// Draaien: node tools/nieuw/fase2-0372a.cjs
const { zet } = require('./hulp.cjs');
const { speler, trainer, bal, pion, hoedje, pop, pauze, stap, B, zone, leeg, miniGoal, ring, MIDDEN, O6, O7, KLEUR } = require('./fase2-hulp.cjs');
const ORANJE = '#ff922b';

const oefeningen = [
  // L2. Hoepelhinkelbaan (O6, O7)
  {
    id: 'veld-lc-hoepelhinkelbaan',
    naam: 'Hoepelhinkelbaan',
    categorieen: ['loopcoordinatie'],
    uitleg:
      'Spring door de hoepelbaan! In de gele hoepels hinkel je op één voet. In de blauwe hoepels spring je met twee voeten tegelijk. Bij de oranje hoepels spring je kruislings: om en om links en rechts. Na de laatste hoepel ren je zo snel als je kunt naar de pion.',
    organisatie: 'Een baan van 9 hoepels: 3 gele op een rij, 2 blauwe en 4 oranje om en om links en rechts. Een pion 3 m na de laatste hoepel. Rij van hooguit 3 kinderen; met meer kinderen een tweede baan ernaast.',
    benodigdheden: ['9 hoepels', '1 pion'],
    spelersNodig: 1,
    keepersNodig: 0,
    leeftijden: [...O6, ...O7],
    doorwisselbaar: true,
    coachpunten: ['Land zacht, op je voorvoet', 'Je armen helpen mee', 'Na de laatste hoepel meteen versnellen'],
    variaties: {
      makkelijker: ['Minder hoepels', 'Hinkelen op je sterkste been'],
      moeilijker: ['Hinkelen op je andere been', 'Op het teken van de trainer van richting veranderen na de baan'],
    },
    en: {
      naam: 'Hoop hopscotch',
      uitleg:
        'Jump through the hoop track! In the yellow hoops you hop on one foot. In the blue hoops you jump with both feet together. At the orange hoops you jump across: left and right in turn. After the last hoop, run to the cone as fast as you can.',
      organisatie: 'A track of 9 hoops: 3 yellow in a row, 2 blue and 4 orange alternating left and right. A cone 3 m after the last hoop. Lines of no more than 3 children; with more children, set up a second track next to it.',
      benodigdheden: ['9 hoops', '1 cone'],
      coachpunten: ['Land softly, on the balls of your feet', 'Your arms help you', 'Speed up straight after the last hoop'],
      variaties: {
        makkelijker: ['Fewer hoops', 'Hop on your stronger leg'],
        moeilijker: ['Hop on your other leg', 'On the coach’s signal, change direction after the track'],
      },
    },
    tekening: {
      ...leeg(19, 8),
      objecten: [
        ring('r1', 5, 4, KLEUR.geel),
        ring('r2', 5.9, 4, KLEUR.geel),
        ring('r3', 6.8, 4, KLEUR.geel),
        ring('r4', 7.9, 4, KLEUR.blauw),
        ring('r5', 9, 4, KLEUR.blauw),
        ring('r6', 10.1, 3.45, ORANJE),
        ring('r7', 11, 4.55, ORANJE),
        ring('r8', 11.9, 3.45, ORANJE),
        ring('r9', 12.8, 4.55, ORANJE),
        pion('p1', 16.4, 4),
        speler('a1', 1, 0, 0),
        speler('a2', 2, 0, 0),
        speler('a3', 3, 0, 0),
      ],
      rijen: [{ id: 'rij', x: 3.4, y: 4, richting: 180, spelers: ['a1', 'a2', 'a3'] }],
      animatie: [
        {
          herhaal: {
            spelers: ['a1', 'a2', 'a3'],
            tussen: 2.8,
            stappen: [
              stap({ type: 'loop', wie: '@', via: [[5, 4], [5.9, 4], [6.8, 4], [7.9, 4], [9, 4], [10.1, 3.45], [11, 4.55], [11.9, 3.45], [12.8, 4.55]], naar: [13.7, 4.1], manier: 'sprong' }),
              stap({ type: 'loop', wie: '@', naar: [15.6, 4], manier: 'sprint' }),
              stap({ type: 'loop', wie: '@', via: [[16.4, 6.2]], naar: [5, 6.2], spoor: false }),
              stap({ type: 'aansluiten', wie: '@', rij: 'rij' }),
            ],
          },
        },
      ],
    },
  },

  // T1. Kapwedstrijd op de lijn
  {
    id: 'veld-tq-kapwedstrijd-lijn',
    naam: 'Kapwedstrijd op de lijn',
    categorieen: ['techniek'],
    uitleg:
      'Twee spelers dribbelen naast elkaar heen en weer tussen twee lijnen op 5 meter. Op elke lijn maak je een kap: de bal moet precies op de lijn van richting veranderen. Wie maakt in 30 tellen de meeste kappen? Wissel van kap: binnenkant, buitenkant, zool.',
    organisatie: 'Twee lijnen van hoedjes op 5 m van elkaar, met per speler een eigen baan (3–4 m breed). Tweetallen naast elkaar; de trainer telt 30 seconden af, elke speler telt hardop zijn eigen kappen. Daarna 30 seconden rust.',
    benodigdheden: ['6 hoedjes', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Kleine aanrakingen vlak voor de lijn, dan stop je hem precies', 'Na de kap meteen versnellen', 'Gebruik beide voeten en verschillende kappen'],
    variaties: {
      makkelijker: ['Lijnen op 7 m', 'Elke kap telt, ook net naast de lijn'],
      moeilijker: ['Alleen je zwakke voet', 'Elke kap een andere soort'],
    },
    en: {
      naam: 'Cut-back race on the line',
      uitleg:
        'Two players dribble side by side back and forth between two lines 5 metres apart. On each line you make a cut: the ball must change direction exactly on the line. Who makes the most cuts in 30 seconds? Vary your cut: inside, outside, sole.',
      organisatie: 'Two lines of disc cones 5 m apart, with a lane for each player (3–4 m wide). Pairs side by side; the coach counts down 30 seconds and each player counts their own cuts out loud. Then 30 seconds of rest.',
      benodigdheden: ['6 disc cones', 'Balls'],
      coachpunten: ['Small touches just before the line, so you can stop it exactly', 'Speed up straight after the cut', 'Use both feet and different cuts'],
      variaties: {
        makkelijker: ['Lines 7 m apart', 'Every cut counts, even just off the line'],
        moeilijker: ['Weaker foot only', 'A different cut every time'],
      },
    },
    tekening: {
      ...leeg(12, 9),
      objecten: [
        hoedje('h1', 2.5, 2),
        hoedje('h2', 6.5, 2),
        hoedje('h3', 10.5, 2),
        hoedje('h4', 2.5, 7),
        hoedje('h5', 6.5, 7),
        hoedje('h6', 10.5, 7),
        speler('a1', 1, 4.5, 7.6, { kijkrichting: -90 }),
        B('b1', 2, 8.5, 7.6, { kijkrichting: -90 }),
        bal('ba', 4.5, 7.05, 'a1'),
        bal('bb', 8.5, 7.05, 'b1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [4.5, 2.6], manier: 'sprint' }, { type: 'dribbel', wie: 'b1', naar: [8.5, 2.7], manier: 'sprint' }),
        stap({ type: 'truc', wie: 'a1', soort: 'binnenkant', kijk: 90 }, { type: 'truc', wie: 'b1', soort: 'zool', kijk: 90, start: 0.1 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [4.5, 6.4], manier: 'sprint' }, { type: 'dribbel', wie: 'b1', naar: [8.5, 6.4], manier: 'sprint' }),
        stap({ type: 'truc', wie: 'a1', soort: 'buitenkant', kijk: -90 }, { type: 'truc', wie: 'b1', soort: 'binnenkant', voet: 'links', kijk: -90 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [4.5, 2.6], manier: 'sprint' }, { type: 'dribbel', wie: 'b1', naar: [8.5, 2.6], manier: 'sprint' }),
        stap({ type: 'truc', wie: 'a1', soort: 'zool', kijk: 90 }, { type: 'truc', wie: 'b1', soort: 'buitenkant', kijk: 90 }),
        pauze(0.6),
      ],
    },
  },

  // T5. Kiezen bij de pop
  {
    id: 'veld-tq-kiezen-bij-de-pop',
    naam: 'Kiezen bij de pop',
    categorieen: ['techniek'],
    uitleg:
      'Dribbel in tempo naar de pop. De trainer staat een paar meter achter de pop en steekt op het laatste moment zijn linker- of rechterarm op. Aan die kant ga je met een actie langs de pop, bijvoorbeeld een schaar of een passeerbeweging, en daarna versnel je. Kijk dus tijdens het dribbelen op naar de trainer.',
    organisatie: 'Pop in het midden, de trainer 4–5 m erachter. Rij spelers met een bal op 7 m van de pop. De trainer steekt pas een arm op als de speler 2–3 m voor de pop is. Na de actie dribbel je buitenom terug.',
    benodigdheden: ['1 pop', '2 pionnen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Kijk op naar de trainer terwijl je dribbelt', 'Maak je actie pas vlak voor de pop', 'Na de actie meteen versnellen'],
    variaties: {
      makkelijker: ['De trainer steekt zijn arm eerder op', 'Zonder actie: alleen de goede kant kiezen'],
      moeilijker: ['De trainer wacht tot het allerlaatste moment', 'Elke keer een andere actie'],
    },
    en: {
      naam: 'Choose at the mannequin',
      uitleg:
        'Dribble at speed towards the mannequin. The coach stands a few metres behind it and, at the last moment, raises their left or right arm. Go past the mannequin on that side with a move, such as a step-over or a body feint, and then accelerate. So look up at the coach while you dribble.',
      organisatie: 'Mannequin in the middle, the coach 4–5 m behind it. Line of players with a ball 7 m from the mannequin. The coach only raises an arm when the player is 2–3 m from the mannequin. After the move, dribble back round the outside.',
      benodigdheden: ['1 mannequin', '2 cones', 'Balls'],
      coachpunten: ['Look up at the coach while you dribble', 'Make your move just before the mannequin', 'Accelerate straight after the move'],
      variaties: {
        makkelijker: ['The coach raises an arm earlier', 'No move: just choose the right side'],
        moeilijker: ['The coach waits until the very last moment', 'A different move every time'],
      },
    },
    tekening: {
      ...leeg(10, 20),
      objecten: [
        pop('pop', 5, 10),
        trainer(5, 5.6, 90),
        pion('s1', 3.6, 17.2),
        pion('s2', 6.4, 17.2),
        speler('a1', 1, 5, 17, { kijkrichting: -90 }),
        speler('a2', 2, 5, 18.8, { kijkrichting: -90 }),
        bal('b1', 5, 16.45, 'a1'),
        bal('b2', 5, 18.25, 'a2'),
      ],
      animatie: [
        pauze(0.5),
        // De trainer steekt zijn linkerarm op: voor de speler is dat de rechterkant.
        stap({ type: 'dribbel', wie: 'a1', naar: [5, 12.6] }, { type: 'teken', wie: 't1', kant: 'links', start: 0.9, duur: 1.6 }),
        stap({ type: 'schijn', wie: 'a1', kant: 'links' }),
        stap({ type: 'dribbel', wie: 'a1', via: [[6.5, 10.2]], naar: [7.2, 7.6], manier: 'sprint' }, { type: 'dribbel', wie: 'a2', naar: [5, 17], duur: 0.8, start: 0.4 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [5, 12.6] }, { type: 'teken', wie: 't1', kant: 'rechts', start: 0.9, duur: 1.6 }, { type: 'loop', wie: 'a1', via: [[8.6, 9]], naar: [8.6, 15], spoor: false }),
        stap({ type: 'schijn', wie: 'a2', kant: 'rechts' }),
        stap({ type: 'dribbel', wie: 'a2', via: [[3.5, 10.2]], naar: [2.8, 7.6], manier: 'sprint' }),
        pauze(0.6),
      ],
    },
  },

  // T13. Buitenkant-slalom op tijd (O7, JO8–11)
  {
    id: 'veld-tq-buitenkant-slalom-tijd',
    naam: 'Buitenkant-slalom op tijd',
    categorieen: ['techniek'],
    uitleg:
      'Dribbel een slalom tussen de pionnen door en raak de bal alleen met de buitenkant van je voet. Na de laatste pion dribbel je door de finish. De trainer klokt je tijd: kun je de volgende keer sneller, zonder dat je een pion raakt?',
    organisatie: 'Zes pionnen op een rij, 2 m uit elkaar, met een finish van twee hoedjes 3 m na de laatste pion. De trainer staat bij de finish met een stopwatch. Terug langs de buitenkant, met de andere voet de volgende keer.',
    benodigdheden: ['6 pionnen', '2 hoedjes', 'Ballen'],
    spelersNodig: 1,
    keepersNodig: 0,
    leeftijden: ['mini-5-7', 'jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Kleine tikjes met de buitenkant, de bal blijft dicht bij je voet', 'Kijk af en toe op naar de volgende pion', 'Rechts om de pion: rechtervoet; links: linkervoet'],
    variaties: {
      makkelijker: ['Pionnen verder uit elkaar', 'Binnen- en buitenkant mag'],
      moeilijker: ['Pionnen dichter bij elkaar', 'Alleen je zwakke voet'],
    },
    en: {
      naam: 'Outside-foot slalom against the clock',
      uitleg:
        'Dribble a slalom between the cones and touch the ball only with the outside of your foot. After the last cone, dribble through the finish. The coach times you: can you be quicker next time, without touching a cone?',
      organisatie: 'Six cones in a row, 2 m apart, with a finish of two disc cones 3 m after the last cone. The coach stands at the finish with a stopwatch. Go back round the outside, and use the other foot next time.',
      benodigdheden: ['6 cones', '2 disc cones', 'Balls'],
      coachpunten: ['Small touches with the outside, keep the ball close to your foot', 'Look up now and then at the next cone', 'Right of the cone: right foot; left: left foot'],
      variaties: {
        makkelijker: ['Cones further apart', 'Inside and outside allowed'],
        moeilijker: ['Cones closer together', 'Weaker foot only'],
      },
    },
    tekening: {
      ...leeg(21, 8),
      objecten: [
        pion('p1', 5, 4),
        pion('p2', 7, 4),
        pion('p3', 9, 4),
        pion('p4', 11, 4),
        pion('p5', 13, 4),
        pion('p6', 15, 4),
        hoedje('f1', 18, 2.8),
        hoedje('f2', 18, 5.2),
        trainer(19.4, 6.2, -150),
        speler('a1', 1, 2.6, 4, { kijkrichting: 0 }),
        speler('a2', 2, 1.2, 5.6, { kijkrichting: 0 }),
        bal('b1', 3.15, 4, 'a1'),
        bal('b2', 1.75, 5.6, 'a2'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', via: [[5, 5.1], [7, 2.9], [9, 5.1], [11, 2.9], [13, 5.1], [15, 2.9]], naar: [17.2, 4], tempo: 'gelijkmatig' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [19, 4], manier: 'sprint', duur: 0.6 }),
        stap({ type: 'voetOpBal', wie: 'a1' }, { type: 'dribbel', wie: 'a2', naar: [2.6, 4], duur: 1 }),
        pauze(0.6),
      ],
    },
  },

  // S6. Doelpuntenestafette (O7, JO8–11)
  {
    id: 'veld-sp-doelpuntenestafette',
    naam: 'Doelpuntenestafette',
    categorieen: ['spelletjes', 'afwerken'],
    uitleg:
      'Twee teams in een rij, iedereen met een bal. Op het teken dribbelt de voorste naar de schietlijn en schiet op het mini-goaltje van zijn team. Raak? Haal je bal niet op, maar ren terug en tik de volgende aan: die mag pas dan vertrekken. Mis je, dan haal je eerst je bal en probeer je het opnieuw. Welk team heeft als eerste iedereen laten scoren?',
    organisatie: 'Twee banen naast elkaar, 6 m uit elkaar. Start op 13 m van het mini-goaltje, schietlijn van hoedjes op 5 m. Rijen van 2 tot 4 kinderen, ieder met een bal. Na elke ronde de ballen samen ophalen.',
    benodigdheden: ['2 mini-goaltjes', '6 hoedjes', 'Voetballen'],
    spelersNodig: 4,
    keepersNodig: 0,
    leeftijden: ['mini-5-7', 'jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Snel dribbelen, maar rustig schieten', 'Kijk naar het goaltje voor je schiet', 'Aantikken met je hand, dan pas vertrekken'],
    variaties: {
      makkelijker: ['Schietlijn dichterbij', 'Grotere goaltjes'],
      moeilijker: ['Schieten met je andere voet', 'Om een pion heen dribbelen voor de schietlijn'],
    },
    en: {
      naam: 'Goal relay',
      uitleg:
        'Two teams in a line, everyone with a ball. On the signal the first child dribbles to the shooting line and shoots at their team’s mini goal. Scored? Leave your ball, run back and tag the next child: only then may they go. Missed? Get your ball first and try again. Which team is first to have everyone score?',
      organisatie: 'Two lanes side by side, 6 m apart. Start 13 m from the mini goal, shooting line of disc cones at 5 m. Lines of 2 to 4 children, each with a ball. Collect the balls together after each round.',
      benodigdheden: ['2 mini goals', '6 disc cones', 'Footballs'],
      coachpunten: ['Dribble quickly, but shoot calmly', 'Look at the goal before you shoot', 'Tag with your hand, only then go'],
      variaties: {
        makkelijker: ['Shooting line closer', 'Bigger goals'],
        moeilijker: ['Shoot with your other foot', 'Dribble round a cone before the shooting line'],
      },
    },
    tekening: {
      ...leeg(16, 17),
      objecten: [
        miniGoal('gA', 5, 1.4),
        miniGoal('gB', 11, 1.4),
        hoedje('h1', 2.6, 6.4),
        hoedje('h2', 8, 6.4),
        hoedje('h3', 13.4, 6.4),
        hoedje('s1', 2.6, 14),
        hoedje('s2', 8, 14),
        hoedje('s3', 13.4, 14),
        speler('a1', 1, 0, 0),
        speler('a2', 2, 0, 0),
        B('b1', 1, 0, 0),
        B('b2', 2, 0, 0),
        bal('ba1', 0, 0, 'a1'),
        bal('ba2', 0, 0, 'a2'),
        bal('bb1', 0, 0, 'b1'),
        bal('bb2', 0, 0, 'b2'),
      ],
      rijen: [
        { id: 'rA', x: 5, y: 14.6, richting: 90, spelers: ['a1', 'a2'] },
        { id: 'rB', x: 11, y: 14.6, richting: 90, spelers: ['b1', 'b2'] },
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [5, 7.2], manier: 'sprint' }, { type: 'dribbel', wie: 'b1', naar: [11, 7.2], manier: 'sprint', start: 0.15 }),
        stap({ type: 'schot', van: 'a1', naar: [5.3, 1.1], hoogte: 'grond' }, { type: 'schot', van: 'b1', naar: [10.7, 1.1], hoogte: 'grond', start: 0.2 }),
        stap({ type: 'loop', wie: 'a1', naar: [6.6, 14.4], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [12.6, 14.4], manier: 'sprint', start: 0.2 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [5, 7.2], manier: 'sprint' }, { type: 'aansluiten', wie: 'a1', rij: 'rA', start: 0.6 }, { type: 'dribbel', wie: 'b2', naar: [11, 7.2], manier: 'sprint', start: 0.3 }, { type: 'aansluiten', wie: 'b1', rij: 'rB', start: 0.9 }),
        stap({ type: 'schot', van: 'a2', naar: [4.7, 1.1], hoogte: 'grond' }, { type: 'schot', van: 'b2', naar: [11.3, 1.1], hoogte: 'grond', start: 0.3 }),
        pauze(0.8),
      ],
    },
  },

  // S8. Ballen in de mand (O6)
  {
    id: 'veld-sp-ballen-in-de-mand',
    naam: 'Ballen in de mand',
    categorieen: ['spelletjes'],
    uitleg:
      'In het midden liggen veel ballen. Elk team heeft aan zijn kant een mand: twee hoepels. Op het teken ren je naar het midden, pak een bal met je voeten en dribbel hem naar jullie mand. Leg hem stil in een hoepel, zonder je handen! Dan haal je de volgende. Welk team heeft de meeste ballen in de mand als het midden leeg is?',
    organisatie: 'Vak van 16 × 12 m met in het midden een vak van 4 × 4 m vol ballen (meer ballen dan kinderen). Aan elke korte kant twee hoepels als mand. Twee teams van 2 tot 4 kinderen. Daarna de ballen terug en nog een keer.',
    benodigdheden: ['4 hoepels', '8 hoedjes', 'Voetballen', 'Hesjes'],
    spelersNodig: 4,
    keepersNodig: 0,
    leeftijden: O6,
    doorwisselbaar: true,
    coachpunten: ['Kleine tikjes, de bal blijft bij je voet', 'Kijk waar je loopt: er zijn meer kinderen', 'Stop de bal met je voet in de hoepel'],
    variaties: {
      makkelijker: ['Mand dichter bij het midden', 'Grotere mand (drie hoepels)'],
      moeilijker: ['Alleen met je andere voet', 'Je mag ook een bal uit de mand van het andere team halen'],
    },
    en: {
      naam: 'Balls in the basket',
      uitleg:
        'There are lots of balls in the middle. Each team has a basket on its side: two hoops. On the signal, run to the middle, take a ball with your feet and dribble it to your basket. Stop it in a hoop, without using your hands! Then fetch the next one. Which team has the most balls in its basket when the middle is empty?',
      organisatie: '16 × 12 m area with a 4 × 4 m box full of balls in the middle (more balls than children). Two hoops as a basket at each short end. Two teams of 2 to 4 children. Then put the balls back and play again.',
      benodigdheden: ['4 hoops', '8 disc cones', 'Footballs', 'Bibs'],
      coachpunten: ['Small touches, keep the ball at your foot', 'Look where you are going: there are other children', 'Stop the ball in the hoop with your foot'],
      variaties: {
        makkelijker: ['Basket closer to the middle', 'Bigger basket (three hoops)'],
        moeilijker: ['Other foot only', 'You may also take a ball from the other team’s basket'],
      },
    },
    tekening: {
      ...leeg(18, 14),
      objecten: [
        zone('z', 9, 7, 16, 12),
        zone('m', 9, 7, 4, 4, KLEUR.geel),
        ring('rA1', 1.9, 5.6, KLEUR.rood),
        ring('rA2', 1.9, 8.4, KLEUR.rood),
        ring('rB1', 16.1, 5.6, KLEUR.blauw),
        ring('rB2', 16.1, 8.4, KLEUR.blauw),
        speler('a1', 1, 4, 5, { kijkrichting: 0 }),
        speler('a2', 2, 4, 9, { kijkrichting: 0 }),
        B('b1', 1, 14, 5, { kijkrichting: 180 }),
        B('b2', 2, 14, 9, { kijkrichting: 180 }),
        bal('m1', 8, 6),
        bal('m2', 8, 8),
        bal('m3', 10, 6),
        bal('m4', 10, 8),
        bal('m5', 9, 7),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'a1', naar: [7.4, 6], manier: 'sprint' }, { type: 'loop', wie: 'a2', naar: [7.4, 8], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [10.6, 6], manier: 'sprint' }, { type: 'loop', wie: 'b2', naar: [10.6, 8], manier: 'sprint' }),
        stap(
          { type: 'dribbel', wie: 'a1', naar: [2.5, 5.6] },
          { type: 'dribbel', wie: 'a2', naar: [2.5, 8.4], start: 0.2 },
          { type: 'dribbel', wie: 'b1', naar: [15.5, 5.6], start: 0.1 },
          { type: 'dribbel', wie: 'b2', naar: [15.5, 8.4], start: 0.3 },
        ),
        stap({ type: 'voetOpBal', wie: 'a1' }, { type: 'voetOpBal', wie: 'a2' }, { type: 'voetOpBal', wie: 'b1' }, { type: 'voetOpBal', wie: 'b2' }),
        stap({ type: 'loop', wie: 'a1', naar: [7.6, 6.6], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [10.4, 7.4], manier: 'sprint', start: 0.2 }),
        pauze(0.6),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
