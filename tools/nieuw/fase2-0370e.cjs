// Fase 2, deel 3, batch 1 (0.37.0), deel e: Techniek T6–T11 uit VOORSTEL-OEFENINGEN.md (alleen balcontrole).
// Draaien: node tools/nieuw/fase2-0370e.cjs
const { zet } = require('./hulp.cjs');
const { speler, trainer, bal, pion, hoedje, pop, paaltje, pauze, stap, B, zone, leeg, kaatsbord, JO, OUD, MIDDEN, O6, KLEUR } = require('./fase2-hulp.cjs');

const oefeningen = [
  // T6. Wegdraaien bij de zijlijn
  {
    id: 'veld-tq-wegdraaien-zijlijn',
    naam: 'Wegdraaien bij de zijlijn',
    categorieen: ['techniek', 'een-tegen-een'],
    uitleg:
      'Je dribbelt naar de zijlijn, een verdediger loopt rustig met je mee. Vlak voor de lijn scherm je de bal af: je lichaam tussen de verdediger en de bal. Dan draai je weg met je zool of je buitenkant en dribbel je de andere kant op, langs de lijn. De verdediger doet alleen mee, hij pakt de bal nog niet af.',
    organisatie: 'Vak van 15 × 12 m; één lange kant is de zijlijn. Tweetallen, de aanvaller met bal. Na 4 keer wisselen van rol. Daarna mag de verdediger echt meedoen.',
    benodigdheden: ['4 pionnen', '1 bal per tweetal', 'Hesjes'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Lichaam tussen bal en verdediger, armen breed', 'Draai weg op het moment dat de verdediger dichtbij komt', 'Na de draai meteen versnellen, weg van de verdediger'],
    variaties: {
      makkelijker: ['Verdediger blijft op 2 m', 'Alleen de zooldraai'],
      moeilijker: ['De verdediger mag de bal afpakken', 'Na het wegdraaien scoren in een doeltje', 'Wegdraaien met je zwakke voet'],
    },
    en: {
      naam: 'Turning away at the touchline',
      uitleg:
        'Dribble towards the touchline while a defender jogs alongside you. Just before the line, shield the ball: your body between the defender and the ball. Then turn away with your sole or the outside of your foot and dribble the other way, along the line. The defender only goes with you and does not win the ball yet.',
      organisatie: '15 × 12 m area; one long side is the touchline. Pairs, the attacker with a ball. Swap roles after 4 goes. Then the defender may challenge for real.',
      benodigdheden: ['4 cones', '1 ball per pair', 'Bibs'],
      coachpunten: ['Body between ball and defender, arms wide', 'Turn away the moment the defender gets close', 'Accelerate straight after the turn, away from the defender'],
      variaties: {
        makkelijker: ['Defender stays 2 m away', 'Sole turn only'],
        moeilijker: ['The defender may win the ball', 'After turning, score in a mini goal', 'Turn away with your weaker foot'],
      },
    },
    tekening: {
      ...leeg(17, 14),
      objecten: [
        zone('z', 8.5, 7, 15, 12),
        pion('p1', 1, 1),
        pion('p2', 16, 1),
        pion('p3', 1, 13),
        pion('p4', 16, 13),
        speler('a1', 1, 4, 7.5, { kijkrichting: 0 }),
        B('b1', 2, 3.2, 10.4, { kijkrichting: 0 }),
        bal('bal', 4.55, 7.5, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [13.4, 7.2] }, { type: 'loop', wie: 'b1', naar: [12, 9.4], start: 0.2 }),
        // Afschermen: de bal aan de kant weg van de verdediger, dan met de zool wegdraaien.
        stap({ type: 'draai', wie: 'a1', kijk: -50 }, { type: 'loop', wie: 'b1', naar: [12.6, 8.9], duur: 0.6 }),
        stap({ type: 'truc', wie: 'a1', soort: 'zool', kijk: -100 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [13.6, 2.4], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [12.2, 4.4], start: 0.25 }),
        pauze(0.8),
      ],
    },
  },

  // T7. Eerste aanraking naar de kleur
  {
    id: 'veld-tq-eerste-aanraking-kleur',
    naam: 'Eerste aanraking naar de kleur',
    categorieen: ['techniek', 'pass-en-trap'],
    uitleg:
      'Vier gekleurde pionnen staan in een kruis om je heen. De trainer speelt de bal in en roept een kleur terwijl de bal onderweg is. Neem de bal met je eerste aanraking mee in de richting van die kleur, dribbel naar de pion en speel de bal terug. Daarna loop je terug naar het midden voor de volgende bal.',
    organisatie: 'Kruis met vier pionnen in vier kleuren op 4 m van het midden. De trainer staat op 8 m met een paar ballen. Eén speler in het midden, de volgende wacht naast de trainer. Series van 6 ballen.',
    benodigdheden: ['4 pionnen in 4 kleuren', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Klaarstaan op je voorvoeten, niet stilstaan op je hakken', 'Luister en kijk: neem de bal mee naar de goede kant', 'Eerste aanraking niet te ver: na twee passen moet je hem weer kunnen spelen'],
    variaties: {
      makkelijker: ['De trainer roept de kleur al vóór de pass', 'Twee pionnen in plaats van vier'],
      moeilijker: ['De trainer wijst in plaats van te roepen', 'Bal halfhoog', 'Kleur roepen die je níet moet nemen'],
    },
    en: {
      naam: 'First touch to the colour',
      uitleg:
        'Four coloured cones stand in a cross around you. The coach plays the ball in and calls a colour while the ball is travelling. Take your first touch towards that colour, dribble to the cone and play the ball back. Then go back to the middle for the next ball.',
      organisatie: 'Cross of four cones in four colours, 4 m from the middle. The coach stands 8 m away with a few balls. One player in the middle, the next waits beside the coach. Sets of 6 balls.',
      benodigdheden: ['4 cones in 4 colours', 'Balls'],
      coachpunten: ['Get set on the balls of your feet, not flat on your heels', 'Listen and look: take the ball towards the right side', 'First touch not too far: after two steps you must be able to play it again'],
      variaties: {
        makkelijker: ['The coach calls the colour before the pass', 'Two cones instead of four'],
        moeilijker: ['The coach points instead of calling', 'Ball at half height', 'Call the colour you must NOT go to'],
      },
    },
    tekening: {
      ...leeg(14, 16),
      objecten: [
        pion('pr', 7, 2, KLEUR.rood),
        pion('pb', 11, 6, KLEUR.blauw),
        pion('pg', 3, 6, KLEUR.geel),
        pion('pw', 7, 10, KLEUR.wit),
        trainer(8.6, 14, -100),
        speler('a1', 1, 7, 6.6, { kijkrichting: 90 }),
        speler('a2', 2, 10.8, 14.2, { kijkrichting: -110 }),
        bal('b1', 8.5, 13.45, 't1'),
        bal('b2', 9.3, 14.9),
      ],
      animatie: [
        pauze(0.5),
        // "Blauw!": eerste aanraking naar rechts.
        stap({ type: 'pass', van: 't1', naar: 'a1' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [8.6, 6.4], duur: 0.55 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [10, 6.8], duur: 0.7 }),
        stap({ type: 'pass', van: 'a1', naar: 't1' }),
        stap({ type: 'loop', wie: 'a1', naar: [7, 6.6], kijk: 90, duur: 1 }),
        // "Geel!": eerste aanraking naar links.
        stap({ type: 'pass', van: 't1', naar: 'a1' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [5.4, 6.4], duur: 0.55 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [4, 6.8], duur: 0.7 }),
        stap({ type: 'pass', van: 'a1', naar: 't1' }),
        pauze(0.8),
      ],
    },
  },

  // T8. Dribbelrace met remmen
  {
    id: 'veld-tq-dribbelrace-remmen',
    naam: 'Dribbelrace met remmen',
    categorieen: ['techniek'],
    uitleg:
      'Twee spelers dribbelen naast elkaar in hun eigen baan. Op het fluitsignaal zetten ze de bal stil met hun zool, draaien om en dribbelen zo snel mogelijk terug achter hun eigen startlijn. Wie het eerst terug is met de bal onder controle, wint.',
    organisatie: 'Twee banen van 15 m naast elkaar, 3 m uit elkaar, met een startlijn van hoedjes. Iedereen een bal. De trainer fluit ergens tussen 6 en 12 m. Wie verliest, doet 5 keer de zooltrek op de plek.',
    benodigdheden: ['8 hoedjes', '1 bal per speler'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: ['jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Dribbel met kleine tikjes, dan kun je meteen remmen', 'Zool bovenop de bal, gewicht op je standbeen', 'Draai over de kant van je zool en versnel meteen'],
    variaties: {
      makkelijker: ['Eerst stilstaan met de voet op de bal, dan pas draaien', 'Wandeltempo'],
      moeilijker: ['De trainer roept ook "links" of "rechts": draai die kant op', 'Remmen met je zwakke voet'],
    },
    en: {
      naam: 'Dribble race with brakes',
      uitleg:
        'Two players dribble side by side, each in their own lane. On the whistle they stop the ball with the sole of their foot, turn and dribble back behind their own start line as fast as possible. Whoever gets back first with the ball under control wins.',
      organisatie: 'Two 15 m lanes side by side, 3 m apart, with a start line of disc cones. A ball each. The coach blows the whistle somewhere between 6 and 12 m. The loser does 5 sole drags on the spot.',
      benodigdheden: ['8 disc cones', '1 ball per player'],
      coachpunten: ['Dribble with small touches so you can brake straight away', 'Sole on top of the ball, weight on your standing leg', 'Turn towards the side of your sole and accelerate straight away'],
      variaties: {
        makkelijker: ['Stand still with your foot on the ball first, then turn', 'Walking pace'],
        moeilijker: ['The coach also calls "left" or "right": turn that way', 'Brake with your weaker foot'],
      },
    },
    tekening: {
      ...leeg(18, 9),
      objecten: [
        ...[1.6, 4.6, 7.6].flatMap((y, i) => [hoedje(`s${i}`, 2.2, y), hoedje(`e${i}`, 16.6, y)]),
        trainer(9, 8.4, -90),
        speler('a1', 1, 1.2, 3.1, { kijkrichting: 0 }),
        B('b1', 2, 1.2, 6.1, { kijkrichting: 0 }),
        bal('b1b', 1.75, 3.1, 'a1'),
        bal('b2b', 1.75, 6.1, 'b1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [10.5, 3.1], duur: 2.6 }, { type: 'dribbel', wie: 'b1', naar: [10, 6.1], duur: 2.6 }),
        stap({ type: 'truc', wie: 'a1', soort: 'zool', kijk: 180 }, { type: 'truc', wie: 'b1', soort: 'zool', kijk: 180, start: 0.15 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [1, 3.1], manier: 'sprint' }, { type: 'dribbel', wie: 'b1', naar: [1.2, 6.1], manier: 'sprint', start: 0.15 }),
        pauze(0.8),
      ],
    },
  },

  // T9. Koppen in tweetallen
  {
    id: 'veld-tq-koppen-tweetallen',
    naam: 'Koppen in tweetallen',
    categorieen: ['techniek'],
    uitleg:
      'In tweetallen op een paar meter van elkaar. De een gooit de bal onderhands aan, de ander kopt hem terug, zodat de gooier hem kan vangen. Eerst uit stand, dan met een aanloopje en een sprong. Tot slot gooit de gooier hoger en kop je in de sprong naar beneden, in de handen van je maatje.',
    organisatie: 'Tweetallen op 4 tot 5 m van elkaar, met een bal. Na 10 kopballen wisselen van rol. Vanaf JO12; zachte bal of een maatje kleiner voor de jongsten van de groep.',
    benodigdheden: ['1 bal per tweetal', 'Hoedjes'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Kop met je voorhoofd, ogen open, mond dicht', 'Kom naar de bal toe en zet af met één been als je springt', 'Kop door de bal naar beneden, in de handen van je maatje'],
    variaties: {
      makkelijker: ['Bal van dichtbij (3 m) aangooien', 'Eerst in kniezit koppen'],
      moeilijker: ['Koppen naar een doeltje of een hoepel', 'Gooier staat schuin: zijwaarts wegkoppen', 'Twee kopballen achter elkaar in de lucht'],
    },
    en: {
      naam: 'Heading in pairs',
      uitleg:
        'In pairs a few metres apart. One throws the ball underarm, the other heads it back so the thrower can catch it. First standing, then with a short run-up and a jump. Finally the thrower serves higher and you head it downwards in the air, into your partner’s hands.',
      organisatie: 'Pairs 4 to 5 m apart, one ball each. Swap roles after 10 headers. From U13; use a soft ball or a smaller size for the youngest in the group.',
      benodigdheden: ['1 ball per pair', 'Disc cones'],
      coachpunten: ['Head with your forehead, eyes open, mouth closed', 'Attack the ball and take off from one leg when you jump', 'Head through the ball downwards, into your partner’s hands'],
      variaties: {
        makkelijker: ['Serve from close range (3 m)', 'Head from kneeling first'],
        moeilijker: ['Head towards a mini goal or a hoop', 'Thrower stands at an angle: head it sideways', 'Two headers in a row in the air'],
      },
    },
    tekening: {
      ...leeg(14, 10),
      objecten: [
        speler('a1', 1, 3, 3, { kijkrichting: 0 }),
        speler('a2', 2, 7.5, 3, { kijkrichting: 180 }),
        speler('a3', 3, 3.5, 7.4, { kijkrichting: 0 }),
        speler('a4', 4, 9, 7.4, { kijkrichting: 180 }),
        bal('b1', 3.55, 3, 'a1'),
        bal('b2', 4.05, 7.4, 'a3'),
      ],
      animatie: [
        pauze(0.5),
        // Uit stand.
        stap({ type: 'pass', van: 'a1', naar: 'a2', worp: 'onderhands', hoogte: 'halfhoog', eindHoogte: 1.65 }),
        stap({ type: 'pass', van: 'a2', naar: 'a1', direct: true, hoogte: 'laag', eindHoogte: 1 }),
        pauze(0.4),
        // In de sprong: hoger aangooien, met een aanloopje.
        stap({ type: 'pass', van: 'a3', naar: 'a4', worp: 'onderhands', hoogte: 'hoog', eindHoogte: 2.25 }, { type: 'loop', wie: 'a4', naar: [7.8, 7.4], start: 0.4, duur: 0.7 }),
        stap({ type: 'pass', van: 'a4', naar: 'a3', direct: true, hoogte: 'laag', eindHoogte: 1 }),
        pauze(0.4),
        stap({ type: 'pass', van: 'a1', naar: 'a2', worp: 'onderhands', hoogte: 'halfhoog', eindHoogte: 1.65 }),
        stap({ type: 'pass', van: 'a2', naar: 'a1', direct: true, hoogte: 'laag', eindHoogte: 1 }),
        pauze(0.8),
      ],
    },
  },

  // T10. Circuit met je andere voet
  {
    id: 'veld-tq-circuit-andere-voet',
    naam: 'Circuit met je andere voet',
    categorieen: ['techniek', 'pass-en-trap'],
    uitleg:
      'Vier stations van een minuut, en alles doe je met je zwakke voet. Station 1: passen tegen het kaatsbord. Station 2: slalom tussen de paaltjes. Station 3: zoolrollen op de plek, de bal heen en weer onder je zool. Station 4: aannemen en meenemen van een bal die terugkomt van het kaatsbord. Na een minuut schuif je door.',
    organisatie: 'Vier stations naast elkaar, elk ± 8 × 6 m: kaatsbord op 4 m, vijf paaltjes op 1,5 m, een vak van 3 × 3 m, een tweede kaatsbord met een poortje. Eén of twee spelers per station, iedereen een bal. 1 minuut per station, 15 seconden om te wisselen.',
    benodigdheden: ['2 kaatsborden', '5 paaltjes', '8 hoedjes', '1 bal per speler'],
    spelersNodig: 4,
    keepersNodig: 0,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Alleen je zwakke voet, ook als het even niet lukt', 'Liever langzaam en goed dan snel en slordig', 'Tel je goede pogingen en probeer het volgende rondje meer'],
    variaties: {
      makkelijker: ['Stations van 2 minuten met minder tempo', 'Om en om met beide voeten'],
      moeilijker: ['Op tijd: hoeveel goede pogingen in een minuut?', 'Kaatsbord verder weg', 'Bij station 4 aannemen in de lucht'],
    },
    en: {
      naam: 'Weak-foot circuit',
      uitleg:
        'Four one-minute stations, and you do everything with your weaker foot. Station 1: passes against the rebounder. Station 2: slalom through the poles. Station 3: sole rolls on the spot, the ball back and forth under your sole. Station 4: receive and take away a ball coming back off the rebounder. After a minute, move on.',
      organisatie: 'Four stations side by side, each about 8 × 6 m: rebounder at 4 m, five poles 1.5 m apart, a 3 × 3 m box, a second rebounder with a gate. One or two players per station, a ball each. 1 minute per station, 15 seconds to change.',
      benodigdheden: ['2 rebounders', '5 poles', '8 disc cones', '1 ball per player'],
      coachpunten: ['Weaker foot only, even when it does not work for a moment', 'Better slow and good than quick and sloppy', 'Count your good attempts and try for more next round'],
      variaties: {
        makkelijker: ['2-minute stations at a lower tempo', 'Alternate both feet'],
        moeilijker: ['Against the clock: how many good attempts in a minute?', 'Rebounder further away', 'At station 4, receive the ball in the air'],
      },
    },
    tekening: {
      ...leeg(34, 10),
      objecten: [
        zone('z1', 4.5, 5, 8, 9),
        zone('z2', 13, 5, 8, 9),
        zone('z3', 21.5, 5, 8, 9),
        zone('z4', 30, 5, 8, 9),
        kaatsbord('k1', 4.5, 1.6, 0),
        ...[2.4, 3.9, 5.4, 6.9, 8.4].map((y, i) => paaltje(`s${i}`, 13, y)),
        ...[[20, 3.5], [23, 3.5], [20, 6.5], [23, 6.5]].map(([x, y], i) => hoedje(`v${i}`, x, y)),
        kaatsbord('k2', 30, 1.6, 0),
        hoedje('g1', 28.6, 7.6),
        hoedje('g2', 31.4, 7.6),
        speler('a1', 1, 4.5, 6, { kijkrichting: -90 }),
        speler('a2', 2, 13.6, 9.4, { kijkrichting: -90 }),
        speler('a3', 3, 21.5, 5.6, { kijkrichting: -90 }),
        speler('a4', 4, 30, 5.6, { kijkrichting: -90 }),
        bal('b1', 4.5, 5.45, 'a1'),
        bal('b2', 13.6, 8.85, 'a2'),
        bal('b3', 21.5, 5.05, 'a3'),
        bal('b4', 30, 5.05, 'a4'),
      ],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'pass', van: 'a1', naar: 'k1', terug: 'a1' },
          { type: 'dribbel', wie: 'a2', via: [[14, 8.4], [12, 6.9], [14, 5.4], [12, 3.9], [14, 2.4]], naar: [13, 1], duur: 4.4, tempo: 'gelijkmatig' },
          { type: 'tiktak', wie: 'a3' },
          { type: 'pass', van: 'a4', naar: 'k2', terug: 'a4' },
        ),
        stap({ type: 'pass', van: 'a1', naar: 'k1', terug: 'a1' }, { type: 'dribbel', wie: 'a4', naar: [29.8, 7.9], duur: 1.2 }, { type: 'truc', wie: 'a3', soort: 'zool', voet: 'links', kijk: 90 }),
        stap({ type: 'pass', van: 'a1', naar: 'k1', terug: 'a1' }, { type: 'dribbel', wie: 'a4', naar: [30, 5.4], duur: 1.4 }, { type: 'truc', wie: 'a3', soort: 'zool', voet: 'links', kijk: -90 }),
        pauze(0.8),
      ],
    },
  },

  // T11. Wasstraat (O6)
  {
    id: 'veld-tq-wasstraat',
    naam: 'Wasstraat',
    categorieen: ['techniek'],
    uitleg:
      'Jij bent een auto en je bal is je auto. Rij door de wasstraat: tussen de poppen door, langs de trainers die met hesjes zwaaien. Houd je bal heel dichtbij, dan komt hij er schoon uit! Rijd daarna buitenom terug en ga nog een keer.',
    organisatie: 'Straat van 2,5 m breed en 10 m lang met aan elke kant twee poppen; twee trainers staan erlangs met een hesje. 5 kinderen met een eigen voetbal rijden achter elkaar door de straat en buitenom terug.',
    benodigdheden: ['4 poppen', '2 hesjes', '4 hoedjes', '1 voetbal per kind'],
    spelersNodig: 3,
    keepersNodig: 0,
    leeftijden: O6,
    doorwisselbaar: true,
    coachpunten: ['Kleine tikjes, de bal blijft dichtbij', 'Kijk waar je heen rijdt', 'Niet tegen de poppen botsen'],
    variaties: {
      makkelijker: ['Straat breder maken', 'Zonder zwaaiende hesjes'],
      moeilijker: ['Straat smaller maken', 'Alleen met je andere voet', 'Halverwege stoppen: voet op de bal'],
    },
    en: {
      naam: 'Car wash',
      uitleg:
        'You are a car and your ball is your car. Drive through the car wash: between the mannequins, past the coaches waving their bibs. Keep your ball really close and it comes out clean! Then drive back round the outside and go again.',
      organisatie: 'A street 2.5 m wide and 10 m long with two mannequins on each side; two coaches stand alongside with a bib. 5 children, each with a ball, drive through the street one after the other and back round the outside.',
      benodigdheden: ['4 mannequins', '2 bibs', '4 disc cones', '1 ball per child'],
      coachpunten: ['Small touches, the ball stays close', 'Look where you are driving', 'Do not bump into the mannequins'],
      variaties: {
        makkelijker: ['Make the street wider', 'Without waving bibs'],
        moeilijker: ['Make the street narrower', 'Only with your other foot', 'Stop halfway: foot on the ball'],
      },
    },
    tekening: {
      ...leeg(16, 11),
      objecten: [
        hoedje('i1', 2, 4.3),
        hoedje('i2', 2, 6.7),
        hoedje('u1', 14, 4.3),
        hoedje('u2', 14, 6.7),
        pop('q1', 5.5, 3.6),
        pop('q2', 10, 3.6),
        pop('q3', 5.5, 7.4),
        pop('q4', 10, 7.4),
        trainer(7.8, 2.2, 90),
        { id: 't2', soort: 'trainer', x: 7.8, y: 8.8, kijkrichting: -90 },
        speler('a1', 1, 1, 5.5, { kijkrichting: 0 }),
        speler('a2', 2, 1, 8.6, { kijkrichting: -45 }),
        speler('a3', 3, 1, 2.4, { kijkrichting: 45 }),
        bal('b1', 1.55, 5.5, 'a1'),
        bal('b2', 1.4, 8.2, 'a2'),
        bal('b3', 1.4, 2.8, 'a3'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [14.6, 5.5], duur: 4.2, tempo: 'gelijkmatig' }, { type: 'dribbel', wie: 'a2', naar: [1.4, 5.5], start: 1.6, duur: 1.4 }),
        stap({ type: 'dribbel', wie: 'a1', via: [[15, 10.3]], naar: [12, 10.5], duur: 1.6 }, { type: 'dribbel', wie: 'a2', naar: [7.5, 5.5], duur: 2.4, tempo: 'gelijkmatig' }),
        stap({ type: 'dribbel', wie: 'a2', naar: [14.6, 5.5], duur: 2.4, tempo: 'gelijkmatig' }, { type: 'dribbel', wie: 'a1', naar: [5, 10.5], duur: 2.4 }, { type: 'dribbel', wie: 'a3', naar: [1.4, 5.5], start: 1, duur: 1.4 }),
        stap({ type: 'dribbel', wie: 'a3', naar: [8, 5.5], duur: 2.4, tempo: 'gelijkmatig' }, { type: 'dribbel', wie: 'a2', via: [[15, 0.7]], naar: [12, 0.5], duur: 2 }),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
