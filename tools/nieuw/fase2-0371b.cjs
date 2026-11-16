// Fase 2, deel 3, batch 2 (0.37.1), deel b: Pass en trap P8, P9, P10, P12, P14 uit VOORSTEL-OEFENINGEN.md.
// Draaien: node tools/nieuw/fase2-0371b.cjs
const { zet } = require('./hulp.cjs');
const { speler, bal, pion, hoedje, horde, pauze, stap, B, zone, leeg, kaatsbord, JO, OUD, MIDDEN, KLEUR } = require('./fase2-hulp.cjs');

const oefeningen = [
  // P8. Passen met de wreef over 20 meter
  {
    id: 'veld-pt-wreef-20-meter',
    naam: 'Passen met de wreef over 20 meter',
    categorieen: ['pass-en-trap'],
    uitleg:
      'In tweetallen op 20 m van elkaar. Speel de bal strak over de grond met je wreef naar je maatje. Bij de ontvanger staat een poortje van twee pionnen: komt de bal er tussendoor, dan is het een punt. De ontvanger neemt aan en speelt op dezelfde manier terug. Welk tweetal heeft na twee minuten de meeste punten?',
    organisatie: 'Tweetallen op 20 m, bij elke speler een poortje van 2 m. Twee of meer tweetallen naast elkaar, 4 m uit elkaar. Rondes van 2 minuten; om de ronde met je andere voet.',
    benodigdheden: ['4 pionnen per tweetal', '1 bal per tweetal'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Standbeen naast de bal, knie over de bal', 'Raak het midden van de bal met je wreef, enkel gestrekt', 'Zwaai door in de richting van je maatje, dan blijft de bal laag'],
    variaties: {
      makkelijker: ['15 m', 'Breder poortje'],
      moeilijker: ['25 m', 'Smaller poortje', 'Aannemen en terugspelen in twee aanrakingen'],
    },
    en: {
      naam: 'Driven passes over 20 metres',
      uitleg:
        'In pairs, 20 m apart. Drive the ball firmly along the ground with your instep to your partner. At the receiver there is a gate of two cones: if the ball goes through, it is a point. The receiver controls it and plays it back the same way. Which pair has the most points after two minutes?',
      organisatie: 'Pairs 20 m apart, with a 2 m gate at each player. Two or more pairs side by side, 4 m apart. Rounds of 2 minutes; every other round with your other foot.',
      benodigdheden: ['4 cones per pair', '1 ball per pair'],
      coachpunten: ['Standing foot beside the ball, knee over the ball', 'Strike the middle of the ball with your instep, ankle locked', 'Follow through towards your partner and the ball stays low'],
      variaties: {
        makkelijker: ['15 m', 'Wider gate'],
        moeilijker: ['25 m', 'Narrower gate', 'Control and play back in two touches'],
      },
    },
    tekening: {
      ...leeg(26, 10),
      objecten: [
        ...[3, 7].flatMap((y, k) => [pion(`l${k}a`, 3, y - 1), pion(`l${k}b`, 3, y + 1), pion(`r${k}a`, 23, y - 1), pion(`r${k}b`, 23, y + 1)]),
        speler('a1', 1, 1.6, 3, { kijkrichting: 0 }),
        speler('a2', 2, 24.4, 3, { kijkrichting: 180 }),
        speler('a3', 3, 1.6, 7, { kijkrichting: 0 }),
        speler('a4', 4, 24.4, 7, { kijkrichting: 180 }),
        bal('b1', 2.15, 3, 'a1'),
        bal('b2', 23.85, 7, 'a4'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2', snelheid: 13 }, { type: 'pass', van: 'a4', naar: 'a3', snelheid: 13, start: 0.4 }),
        pauze(0.3),
        stap({ type: 'pass', van: 'a2', naar: 'a1', snelheid: 13 }, { type: 'pass', van: 'a3', naar: 'a4', snelheid: 13, start: 0.3 }),
        pauze(0.8),
      ],
    },
  },

  // P9. Halve volley uit de hand
  {
    id: 'veld-pt-halve-volley-hand',
    naam: 'Halve volley uit de hand',
    categorieen: ['pass-en-trap', 'techniek'],
    uitleg:
      'In tweetallen op 8 m van elkaar. Laat de bal uit je handen vallen en trap hem op het moment dat hij de grond raakt strak naar je maatje. Je maatje neemt de bal aan, pakt hem op en doet hetzelfde terug. Zo oefen je de goede timing en een stevige enkel.',
    organisatie: 'Tweetallen op 8 m, met één bal. Twee of meer tweetallen naast elkaar. Na 10 keer de afstand vergroten tot 12 m.',
    benodigdheden: ['1 bal per tweetal', '4 hoedjes'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Laat de bal recht naar beneden vallen, niet gooien', 'Raak hem precies op het moment dat hij de grond raakt', 'Enkel gestrekt en over de bal heen, dan blijft hij laag'],
    variaties: {
      makkelijker: ['Eerst één stuit, dan trappen', 'Dichterbij'],
      moeilijker: ['Ontvanger neemt uit de lucht aan zonder stuit', 'Met je zwakke voet', 'Op een doeltje mikken'],
    },
    en: {
      naam: 'Half-volley from the hands',
      uitleg:
        'In pairs, 8 m apart. Drop the ball from your hands and strike it firmly to your partner just as it hits the ground. Your partner controls it, picks it up and does the same back. This trains good timing and a firm ankle.',
      organisatie: 'Pairs 8 m apart, one ball each. Two or more pairs side by side. After 10 goes, increase the distance to 12 m.',
      benodigdheden: ['1 ball per pair', '4 disc cones'],
      coachpunten: ['Drop the ball straight down, do not throw it', 'Strike it exactly as it hits the ground', 'Ankle locked and over the ball, so it stays low'],
      variaties: {
        makkelijker: ['Let it bounce once, then strike it', 'Closer'],
        moeilijker: ['The receiver controls it out of the air without a bounce', 'With your weaker foot', 'Aim at a mini goal'],
      },
    },
    tekening: {
      ...leeg(14, 10),
      objecten: [
        hoedje('h1', 2, 2.2),
        hoedje('h2', 12, 2.2),
        hoedje('h3', 2, 7.8),
        hoedje('h4', 12, 7.8),
        speler('a1', 1, 2.6, 3, { kijkrichting: 0 }),
        speler('a2', 2, 11.4, 3, { kijkrichting: 180 }),
        speler('a3', 3, 2.6, 7, { kijkrichting: 0 }),
        speler('a4', 4, 11.4, 7, { kijkrichting: 180 }),
        bal('b1', 3.15, 3, 'a1'),
        bal('b2', 10.85, 7, 'a4'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2', worp: 'dropkick', hoogte: 'laag', eindHoogte: 0.9 }, { type: 'pass', van: 'a4', naar: 'a3', worp: 'dropkick', hoogte: 'laag', eindHoogte: 0.9, start: 0.6 }),
        pauze(0.6),
        stap({ type: 'pass', van: 'a2', naar: 'a1', worp: 'dropkick', hoogte: 'laag', eindHoogte: 0.9 }, { type: 'pass', van: 'a3', naar: 'a4', worp: 'dropkick', hoogte: 'laag', eindHoogte: 0.9, start: 0.6 }),
        pauze(0.8),
      ],
    },
  },

  // P10. Passen onder de horde door (O7 en JO8–11)
  {
    id: 'veld-pt-onder-de-horde',
    naam: 'Passen onder de horde door',
    categorieen: ['pass-en-trap'],
    uitleg:
      'Twee kinderen spelen de bal naar elkaar onder een horde door. Raakt de bal de horde niet, dan is het een punt. Speel zacht en precies, met de binnenkant van je voet. Welk tweetal heeft de meeste punten?',
    organisatie: 'Tweetallen op 6 m van elkaar met een hoge horde in het midden. Twee of drie tweetallen naast elkaar. Rondes van 1 minuut; om de ronde met je andere voet.',
    benodigdheden: ['1 horde per tweetal', '1 voetbal per tweetal', '4 hoedjes per tweetal'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: ['mini-5-7', 'jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Speel met de binnenkant, voet dwars', 'Kijk naar de horde en dan naar de bal', 'Stop de bal met je zool voor je terugspeelt'],
    variaties: {
      makkelijker: ['Dichterbij (4 m)', 'Hogere horde'],
      moeilijker: ['Lagere horde', 'In één keer terugspelen', 'Verder weg (8 m)'],
    },
    en: {
      naam: 'Passing under the hurdle',
      uitleg:
        'Two children pass the ball to each other under a hurdle. If the ball does not touch the hurdle, it is a point. Pass gently and accurately with the inside of your foot. Which pair has the most points?',
      organisatie: 'Pairs 6 m apart with a tall hurdle in the middle. Two or three pairs side by side. Rounds of 1 minute; every other round with your other foot.',
      benodigdheden: ['1 hurdle per pair', '1 ball per pair', '4 disc cones per pair'],
      coachpunten: ['Pass with the inside of your foot, foot sideways on', 'Look at the hurdle, then at the ball', 'Stop the ball with your sole before passing back'],
      variaties: {
        makkelijker: ['Closer (4 m)', 'Taller hurdle'],
        moeilijker: ['Lower hurdle', 'Pass back first time', 'Further away (8 m)'],
      },
    },
    tekening: {
      ...leeg(12, 10),
      objecten: [
        horde('h1', 6, 3, 0, 0.3),
        horde('h2', 6, 7.4, 0, 0.3),
        speler('a1', 1, 3, 3, { kijkrichting: 0 }),
        speler('a2', 2, 9, 3, { kijkrichting: 180 }),
        speler('a3', 3, 3, 7.4, { kijkrichting: 0 }),
        speler('a4', 4, 9, 7.4, { kijkrichting: 180 }),
        bal('b1', 3.55, 3, 'a1'),
        bal('b2', 8.45, 7.4, 'a4'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2', onderdoor: 'h1' }, { type: 'pass', van: 'a4', naar: 'a3', onderdoor: 'h2', start: 0.5 }),
        stap({ type: 'voetOpBal', wie: 'a2' }, { type: 'voetOpBal', wie: 'a3' }),
        stap({ type: 'pass', van: 'a2', naar: 'a1', onderdoor: 'h1' }, { type: 'pass', van: 'a3', naar: 'a4', onderdoor: 'h2', start: 0.4 }),
        pauze(0.8),
      ],
    },
  },

  // P12. Kaatsbordtennis
  {
    id: 'veld-pt-kaatsbordtennis',
    naam: 'Kaatsbordtennis',
    categorieen: ['pass-en-trap', 'spelletjes'],
    uitleg:
      'Twee spelers, één kaatsbord. Je speelt om de beurt tegen het kaatsbord, net als bij squash: na jouw pass moet je maatje de bal terugspelen, en daarna jij weer. Lukt het de ander niet om de bal binnen het vak terug te spelen, dan krijg jij een punt. Wie heeft het eerst er vijf?',
    organisatie: 'Kaatsbord met een vak van 6 × 5 m ervoor. Twee spelers, één bal. Je mag de bal één keer raken om hem stil te leggen, dan moet je spelen.',
    benodigdheden: ['1 kaatsbord', '4 hoedjes', '1 bal'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Speel strak en schuin, dan is het lastig voor de ander', 'Na je pass meteen ruimte maken voor je maatje', 'Klaarstaan op je voorvoeten, de bal kan alle kanten op komen'],
    variaties: {
      makkelijker: ['Twee keer raken mag', 'Groter vak'],
      moeilijker: ['Alles in één keer', 'Om en om links en rechts', 'Twee tegen twee'],
    },
    en: {
      naam: 'Rebounder tennis',
      uitleg:
        'Two players, one rebounder. You take turns playing against the rebounder, like squash: after your pass your partner must play the ball back, then you again. If the other player cannot play the ball back within the box, you win a point. Who gets to five first?',
      organisatie: 'Rebounder with a 6 × 5 m box in front of it. Two players, one ball. You may take one touch to stop the ball, then you must play.',
      benodigdheden: ['1 rebounder', '4 disc cones', '1 ball'],
      coachpunten: ['Play firmly and at an angle, so it is hard for the other player', 'After your pass, make room for your partner straight away', 'Stay on the balls of your feet: the ball can come from any angle'],
      variaties: {
        makkelijker: ['Two touches allowed', 'Bigger box'],
        moeilijker: ['Everything one touch', 'Left and right foot alternately', 'Two against two'],
      },
    },
    tekening: {
      ...leeg(12, 10),
      objecten: [
        kaatsbord('k1', 6, 1.4, 0),
        hoedje('h1', 3, 3),
        hoedje('h2', 9, 3),
        hoedje('h3', 3, 8),
        hoedje('h4', 9, 8),
        speler('a1', 1, 4.2, 6.6, { kijkrichting: -80 }),
        B('b1', 2, 7.8, 6.6, { kijkrichting: -100 }),
        bal('bal', 4.3, 6.05, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'k1', terug: 'b1' }, { type: 'loop', wie: 'a1', naar: [3.6, 7.2], start: 0.4, duur: 0.8 }),
        stap({ type: 'pass', van: 'b1', naar: 'k1', terug: 'a1', direct: true }, { type: 'loop', wie: 'b1', naar: [8.4, 7.4], start: 0.3, duur: 0.8 }),
        stap({ type: 'pass', van: 'a1', naar: 'k1', terug: 'b1', direct: true }, { type: 'loop', wie: 'a1', naar: [4.6, 6.4], start: 0.3, duur: 0.8 }),
        stap({ type: 'pass', van: 'b1', naar: 'k1', terug: 'a1', direct: true }),
        pauze(0.8),
      ],
    },
  },

  // P14. Passen en doorlopen in de H-vorm
  {
    id: 'veld-pt-h-vorm',
    naam: 'Passen en doorlopen in de H-vorm',
    categorieen: ['pass-en-trap'],
    uitleg:
      'De pionnen staan in de vorm van een H. De bal gaat van de rij linksboven via de twee spelers in het midden naar de speler rechtsboven: inspelen, kaatsen, doorspelen. Iedereen loopt zijn bal achterna en neemt de volgende plek in. Rechtsboven dribbelt met de bal buitenom terug naar de rij, en dan begint de volgende ronde.',
    organisatie: 'Twee rijen pionnen van 16 m met in het midden twee pionnen op 6 m van elkaar. Zes spelers: twee in de rij linksboven, één bij elke middelste pion, één rechtsboven en één rechtsonder als reserve. Twee ballen; na 3 minuten de andere kant op.',
    benodigdheden: ['6 pionnen', '2 ballen'],
    spelersNodig: 6,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Loop je bal achterna, maar sta niet in de weg van de volgende pass', 'Middelste spelers: half open staan, zodat je de bal kunt doorspelen in de looprichting', 'Timing: vraag de bal pas als de passer klaar is'],
    variaties: {
      makkelijker: ['Twee keer raken', 'Kortere afstanden'],
      moeilijker: ['Alles in één keer', 'Twee ballen tegelijk, van beide kanten', 'Aan het eind een schot op een doel'],
    },
    en: {
      naam: 'Pass and follow in an H shape',
      uitleg:
        'The cones are laid out in the shape of an H. The ball goes from the top-left line through the two players in the middle to the player at the top right: play in, lay off, play on. Everyone follows their pass and takes the next position. The top-right player dribbles back round the outside to the line, and then the next round starts.',
      organisatie: 'Two lines of cones 16 m long with two cones in the middle, 6 m apart. Six players: two in the top-left line, one at each middle cone, one at the top right and one at the bottom right as a spare. Two balls; after 3 minutes go the other way.',
      benodigdheden: ['6 cones', '2 balls'],
      coachpunten: ['Follow your pass, but do not get in the way of the next pass', 'Middle players: stand half-turned so you can play the ball on in the running direction', 'Timing: only ask for the ball when the passer is ready'],
      variaties: {
        makkelijker: ['Two touches', 'Shorter distances'],
        moeilijker: ['Everything one touch', 'Two balls at once, from both sides', 'Finish with a shot on goal'],
      },
    },
    tekening: {
      ...leeg(24, 16),
      rijen: [{ id: 'rL', x: 3, y: 3.4, richting: 150, spelers: ['a1', 'a5'] }],
      objecten: [
        pion('pa', 3, 2.2),
        pion('pb', 3, 13.8),
        pion('pc', 9, 8),
        pion('pd', 15, 8),
        pion('pe', 21, 2.2),
        pion('pf', 21, 13.8),
        speler('a1', 1, 0, 0),
        speler('a5', 5, 0, 0),
        speler('a2', 2, 9, 9.2, { kijkrichting: -120 }),
        speler('a3', 3, 15, 9.2, { kijkrichting: 180 }),
        speler('a4', 4, 21, 3.4, { kijkrichting: 180 }),
        speler('a6', 6, 21, 12.6, { kijkrichting: -90 }),
        bal('bal', 0, 0, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'a1', naar: [6.2, 6.4], start: 0.4, duur: 1.4 }),
        stap({ type: 'pass', van: 'a2', naar: 'a3', direct: true }, { type: 'loop', wie: 'a2', naar: [12.4, 10.6], start: 0.2, duur: 1.2 }, { type: 'loop', wie: 'a1', naar: [9, 9.2], start: 0.3, duur: 1 }),
        stap({ type: 'pass', van: 'a3', naar: 'a4', direct: true }, { type: 'loop', wie: 'a3', naar: [18, 6.2], start: 0.2, duur: 1.2 }, { type: 'loop', wie: 'a2', naar: [15, 9.2], start: 0.3, duur: 1 }),
        stap({ type: 'dribbel', wie: 'a4', via: [[23, 0.8], [12, 0.6]], naar: [1.6, 0.8], tempo: 'gelijkmatig' }, { type: 'loop', wie: 'a3', naar: [21, 3.4], start: 0.6, duur: 1 }),
        stap({ type: 'aansluiten', wie: 'a4', rij: 'rL' }),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
