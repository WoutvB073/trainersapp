// Fase 2, deel 3, batch 1 (0.37.0), deel d: Techniek T2–T4 en T6–T11 uit VOORSTEL-OEFENINGEN.md (alleen balcontrole).
// Overgeslagen (vrijwel gelijk aan een bestaande oefening): T1 (veld-tq-kappen-draaien), T5 (veld-tq-pop-actie), T13 (veld-tq-slalom-bal).
// Draaien: node tools/nieuw/fase2-0370d.cjs
const { zet } = require('./hulp.cjs');
const { speler, trainer, bal, pion, hoedje, pop, paaltje, pauze, stap, B, zone, leeg, kaatsbord, JO, OUD, MIDDEN, O6, KLEUR } = require('./fase2-hulp.cjs');

const oefeningen = [
  // T2. Acht met binnen- en buitenkant
  {
    id: 'veld-tq-acht-binnen-buitenkant',
    naam: 'Acht met binnen- en buitenkant',
    categorieen: ['techniek'],
    uitleg:
      'Je dribbelt een acht om twee pionnen. Eerst speel je alleen met de buitenkant van je voet, dan alleen met de binnenkant. Houd de bal dicht bij je voet en kijk tussendoor op. Daarna doe je het op tijd: hoeveel achten lukken er in 30 seconden?',
    organisatie: 'Per speler twee pionnen op 4 m van elkaar. Iedereen een bal, twee of meer spelers naast elkaar. Rondes van 30 seconden: buitenkant, binnenkant, dan vrij op tijd.',
    benodigdheden: ['2 pionnen per speler', '1 bal per speler'],
    spelersNodig: 1,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Veel kleine aanrakingen in de bocht', 'Buitenkant: tenen naar binnen, enkel vast', 'Kijk op als je tussen de pionnen door gaat'],
    variaties: {
      makkelijker: ['Pionnen verder uit elkaar', 'Mag met binnen- en buitenkant door elkaar'],
      moeilijker: ['Alleen je zwakke voet', 'Pionnen dichter bij elkaar (3 m)', 'Op tijd tegen een ander'],
    },
    en: {
      naam: 'Figure of eight with inside and outside',
      uitleg:
        'Dribble a figure of eight round two cones. First use only the outside of your foot, then only the inside. Keep the ball close to your foot and look up in between. Then go against the clock: how many figures of eight can you do in 30 seconds?',
      organisatie: 'Two cones 4 m apart for each player. A ball each, two or more players side by side. Rounds of 30 seconds: outside, inside, then free against the clock.',
      benodigdheden: ['2 cones per player', '1 ball per player'],
      coachpunten: ['Lots of small touches in the turn', 'Outside: toes in, ankle locked', 'Look up as you go between the cones'],
      variaties: {
        makkelijker: ['Cones further apart', 'Inside and outside mixed'],
        moeilijker: ['Weaker foot only', 'Cones closer together (3 m)', 'Against the clock, against a partner'],
      },
    },
    tekening: {
      ...leeg(15, 11),
      objecten: [
        pion('p1', 5, 3),
        pion('p2', 10, 3),
        pion('p3', 5, 8),
        pion('p4', 10, 8),
        speler('a1', 1, 7.5, 1.8, { kijkrichting: 0 }),
        speler('a2', 2, 7.5, 6.8, { kijkrichting: 180 }),
        bal('b1', 8.05, 1.8, 'a1'),
        bal('b2', 6.95, 6.8, 'a2'),
      ],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'dribbel', wie: 'a1', via: [[10, 1.7], [11.4, 3], [10, 4.3], [7.5, 3.8], [5, 1.7], [3.6, 3], [5, 4.3]], naar: [7.5, 2.2], duur: 7, tempo: 'gelijkmatig' },
          { type: 'dribbel', wie: 'a2', via: [[5, 6.7], [3.6, 8], [5, 9.3], [7.5, 8.8], [10, 6.7], [11.4, 8], [10, 9.3]], naar: [7.5, 7.2], duur: 7, tempo: 'gelijkmatig' },
        ),
        pauze(0.8),
      ],
    },
  },

  // T3. Aannemen op de halve draai
  {
    id: 'veld-tq-aannemen-halve-draai',
    naam: 'Aannemen op de halve draai',
    categorieen: ['techniek', 'pass-en-trap'],
    uitleg:
      'De bal komt van opzij. Je staat half open en neemt hem aan met je verste voet, achter je standbeen langs, in één beweging de andere kant op. Zo draai je weg van een denkbeeldige tegenstander. Dribbel door het poortje, speel de bal terug naar de aangever en sluit achteraan aan.',
    organisatie: 'Aangever op 7 m opzij van de ontvanger. Een poortje van twee hoedjes schuin achter de ontvanger, aan de andere kant. Rij van 2 tot 3 ontvangers. Na 6 keer wisselt de aangever.',
    benodigdheden: ['3 hoedjes', '1 bal'],
    spelersNodig: 3,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Sta half open, zodat je de bal én het poortje ziet', 'Laat de bal komen en neem hem mee met de binnenkant van je verste voet', 'Na de aanname meteen versnellen door het poortje'],
    variaties: {
      makkelijker: ['Bal eerst stilleggen en dan meenemen', 'Groter poortje'],
      moeilijker: ['Een passieve verdediger in de rug', 'Bal halfhoog aangooien', 'Na het poortje in één keer terugspelen'],
    },
    en: {
      naam: 'Receiving on the half-turn',
      uitleg:
        'The ball comes from the side. You stand half-turned and receive it with your far foot, behind your standing leg, taking it the other way in one movement. That way you turn away from an imaginary opponent. Dribble through the gate, pass the ball back to the server and join the back of the line.',
      organisatie: 'Server 7 m to the side of the receiver. A gate of two disc cones diagonally behind the receiver, on the other side. Line of 2 or 3 receivers. Change server after 6 goes.',
      benodigdheden: ['3 disc cones', '1 ball'],
      coachpunten: ['Stand half-turned so you see the ball and the gate', 'Let the ball come and take it with the inside of your far foot', 'After the touch, accelerate straight through the gate'],
      variaties: {
        makkelijker: ['Stop the ball first, then take it away', 'Bigger gate'],
        moeilijker: ['A passive defender behind you', 'Serve at half height', 'After the gate, pass back first time'],
      },
    },
    tekening: {
      ...leeg(16, 12),
      rijen: [{ id: 'r1', x: 8, y: 9.4, richting: 60, spelers: ['a2', 'a3'] }],
      objecten: [
        hoedje('s', 6.6, 7.2, KLEUR.geel),
        hoedje('g1', 10.35, 2.45),
        hoedje('g2', 12.05, 3.95),
        speler('a1', 1, 1.6, 6, { kijkrichting: 0 }),
        speler('a2', 2, 0, 0),
        speler('a3', 3, 0, 0),
        bal('bal', 2.15, 6, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        {
          herhaal: {
            spelers: ['a2', 'a3'],
            stappen: [
              stap({ type: 'loop', wie: '@', naar: [8, 6.7], kijk: -150, duur: 0.9 }, { type: 'pass', van: 'a1', naar: '@', start: 0.5 }),
              stap({ type: 'truc', wie: '@', soort: 'cruijff', naar: [11.6, 2.6] }),
              stap({ type: 'dribbel', wie: '@', naar: [12.6, 1.6], manier: 'sprint' }),
              stap({ type: 'pass', van: '@', naar: 'a1' }),
              stap({ type: 'aansluiten', wie: '@', rij: 'r1' }),
            ],
          },
        },
        pauze(0.6),
      ],
    },
  },

  // T4. Hooghoudparcours
  {
    id: 'veld-tq-hooghoudparcours',
    naam: 'Hooghoudparcours',
    categorieen: ['techniek'],
    uitleg:
      'Houd de bal hoog terwijl je rustig door drie poortjes loopt. Valt de bal op de grond, dan begin je opnieuw bij het laatste poortje dat je gehaald hebt. Wie komt zonder fouten bij het eind?',
    organisatie: 'Baan met drie poortjes van hoedjes, 2,5 m uit elkaar. Twee of meer banen naast elkaar; iedereen een bal. Wedstrijdje: wie haalt het eind met de minste fouten?',
    benodigdheden: ['8 hoedjes', '1 bal per speler'],
    spelersNodig: 1,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Raak de bal met je wreef, enkel gestrekt', 'Lage, zachte aanrakingen: dan houd je hem dichtbij', 'Kleine pasjes tussen de aanrakingen door'],
    variaties: {
      makkelijker: ['Na elke aanraking mag de bal één keer stuiten', 'Bal uit de hand laten vallen bij elk poortje'],
      moeilijker: ['Om en om links en rechts', 'Ook dij en hoofd gebruiken', 'Poortjes verder uit elkaar'],
    },
    en: {
      naam: 'Juggling course',
      uitleg:
        'Keep the ball up while you walk slowly through three gates. If the ball hits the ground, start again at the last gate you reached. Who gets to the end without a mistake?',
      organisatie: 'Lane with three gates of disc cones, 2.5 m apart. Two or more lanes side by side; a ball each. Competition: who reaches the end with the fewest mistakes?',
      benodigdheden: ['8 disc cones', '1 ball per player'],
      coachpunten: ['Strike the ball with your instep, ankle locked', 'Low, soft touches keep the ball close', 'Small steps in between the touches'],
      variaties: {
        makkelijker: ['The ball may bounce once after every touch', 'Drop the ball from your hands at each gate'],
        moeilijker: ['Left and right alternately', 'Use thigh and head too', 'Gates further apart'],
      },
    },
    tekening: {
      ...leeg(14, 10),
      objecten: [
        ...[4, 6.5, 9].flatMap((x, i) => [hoedje(`g${i}a`, x, 1.6), hoedje(`g${i}b`, x, 3.8), hoedje(`h${i}a`, x, 6.2), hoedje(`h${i}b`, x, 8.4)]),
        speler('a1', 1, 2, 2.7, { kijkrichting: 0 }),
        speler('a2', 2, 2, 7.3, { kijkrichting: 0 }),
        bal('b1', 2.55, 2.7, 'a1'),
        bal('b2', 2.55, 7.3, 'a2'),
      ],
      animatie: [
        pauze(0.5),
        ...[3.1, 4.2, 5.3, 6.4, 7.5, 8.6, 9.7, 10.8].map((x, i) =>
          stap(
            { type: 'pass', van: 'a1', naar: 'a1', hoogte: i % 2 ? 0.9 : 1.1 },
            { type: 'loop', wie: 'a1', naar: [x, 2.7], manier: 'wandel', duur: 0.9 },
            { type: 'pass', van: 'a2', naar: 'a2', hoogte: i % 2 ? 1.1 : 0.9, start: 0.15 },
            { type: 'loop', wie: 'a2', naar: [x - 0.4, 7.3], manier: 'wandel', duur: 0.9, start: 0.15 },
          ),
        ),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
