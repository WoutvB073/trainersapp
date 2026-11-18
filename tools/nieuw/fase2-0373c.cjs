// Fase 2, deel 3, batch 4 (0.37.3), deel c: keepers uit VOORSTEL-OEFENINGEN.md – voorzetten KV1, KV2, KV5, KV6 en passing KP1–KP6.
// Draaien: node tools/nieuw/fase2-0373c.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, speler, bal, pion, pop, pauze, stap, B, zone, leeg, JO, OUD, MIDDEN } = require('./fase2-hulp.cjs');

const keeperVeld = (weergave) => ({ veld: { type: 'half' }, weergave, camera: 'schuin' });

const oefeningen = [
  // KV1. Voorzet uit de hand aan de eerste paal
  {
    id: 'keeper-vz-eerste-paal-uit-de-hand',
    naam: 'Voorzet uit de hand aan de eerste paal',
    categorieen: ['voorzetten'],
    uitleg:
      'De trainer staat aan de zijkant van het doelgebied en gooit de bal hoog voor het doel, richting de eerste paal. De keeper start in het midden van het doel, stapt uit naar de bal en vangt hem op het hoogste punt, voor de eerste paal. Met een worp kun je de bal precies plaatsen: zo leert de keeper rustig zijn eerste stappen te zetten.',
    organisatie: 'Keeper in het midden van het doel, de trainer op 10 m opzij met ballen. Vier ballen van de ene kant, dan van de andere kant.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Eerst een stap naar voren en opzij, dan pas springen', 'Afzetten op één been, de andere knie omhoog', 'Vangen voor je hoofd, ellebogen licht gebogen'],
    variaties: {
      makkelijker: ['Lager gooien', 'Dichter bij de keeper'],
      moeilijker: ['Ballen ook naar het midden en de tweede paal', 'Een tweede keeper springt mee'],
    },
    en: {
      naam: 'Thrown cross to the near post',
      uitleg:
        'The coach stands beside the six-yard box and throws the ball high in front of the goal, towards the near post. The keeper starts in the middle of the goal, steps out to the ball and catches it at the highest point, in front of the near post. A throw lets you place the ball exactly, so the keeper learns to take the first steps calmly.',
      organisatie: 'Keeper in the middle of the goal, the coach 10 m to the side with balls. Four balls from one side, then from the other.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['First a step forward and to the side, then jump', 'Take off on one leg, the other knee up', 'Catch in front of your head, elbows slightly bent'],
      variaties: {
        makkelijker: ['Throw lower', 'Closer to the keeper'],
        moeilijker: ['Balls to the middle and far post too', 'A second keeper jumps as well'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 24, lengte: 14 }),
      objecten: [goal, keeper('k1', 1, 34, 1.5, { verdedigt: 'g1', uitkomen: true }), trainer(44, 4.4, 180), bal('b1', 43.45, 4.4, 't1'), bal('b2', 44.6, 5.4)],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 't1', naar: [37, 2.8], worp: 'bovenhands', hoogte: 'hoog', uitkomen: 'k1' }),
        pauze(0.6),
        stap({ type: 'pass', van: 'k1', naar: [40, 9], worp: 'onderhands', hoogte: 'grond' }),
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: [36.4, 3.6], worp: 'bovenhands', hoogte: 'hoog', uitkomen: 'k1', bal: 'b2' }),
        pauze(0.8),
      ],
    },
  },

  // KV2. Roepen: "los" of "weg"
  {
    id: 'keeper-vz-roepen-los-of-weg',
    naam: 'Roepen: "los" of "weg"',
    categorieen: ['voorzetten'],
    uitleg:
      'Een verdediger staat in de zestien. Bij elke voorzet roept de keeper hard wat er gebeurt. "Keeper!" of "los": de keeper komt en vangt, de verdediger maakt ruimte. "Weg": de bal is te ver voor de keeper, de verdediger kopt hem weg. De keeper beslist en roept, de verdediger luistert. In het voorbeeld eerst "keeper", dan "weg".',
    organisatie: 'Keeper in het doel, een verdediger op 6 m, de trainer met ballen aan de zijkant op 18 m. Voorzetten op wisselende afstand. Na zes ballen wisselt de verdediger.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 1,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Roep vroeg en hard, één woord', 'Kies: is de bal in jouw gebied, kom dan en ga ervoor', 'Verdediger: bij "keeper" opzij, bij "weg" vol voor de bal'],
    variaties: {
      makkelijker: ['Voorzetten uit de hand', 'Eerst alleen ballen voor de keeper'],
      moeilijker: ['Een aanvaller erbij', 'Ook lage voorzetten'],
    },
    en: {
      naam: 'Calling: "keeper" or "away"',
      uitleg:
        'A defender stands in the box. With every cross the keeper calls loudly what is happening. "Keeper!": the keeper comes and catches, the defender makes room. "Away": the ball is too far for the keeper, the defender heads it clear. The keeper decides and calls, the defender listens. In the example first "keeper", then "away".',
      organisatie: 'Keeper in goal, a defender at 6 m, the coach with balls at the side, 18 m out. Crosses at varying distances. After six balls the defender changes.',
      benodigdheden: ['Goal', '2 cones', 'Balls'],
      coachpunten: ['Call early and loudly, one word', 'Decide: if the ball is in your area, come and go for it', 'Defender: on "keeper" step aside, on "away" go all out for the ball'],
      variaties: {
        makkelijker: ['Crosses from the hands', 'Only balls for the keeper at first'],
        moeilijker: ['Add an attacker', 'Low crosses too'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 22, y: -3, breedte: 34, lengte: 22 }),
      objecten: [goal, keeper('k1', 1, 34, 1.5, { verdedigt: 'g1', uitkomen: true }), speler('a1', 4, 34.6, 6.8, { kijkrichting: 0 }), trainer(52, 10, 180), bal('b1', 51.45, 10, 't1'), bal('b2', 52.6, 11.2)],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 't1', naar: [35.2, 4.4], hoogte: 'hoog', uitkomen: 'k1' }, { type: 'loop', wie: 'a1', naar: [37.6, 8.4], start: 0.6 }),
        pauze(0.6),
        stap({ type: 'pass', van: 'k1', naar: [44, 12], worp: 'onderhands', hoogte: 'grond' }, { type: 'loop', wie: 'a1', naar: [34.4, 9.8], start: 0.3 }),
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: 'a1', hoogte: 'hoog', eindHoogte: 1.9, bal: 'b2' }),
        stap({ type: 'pass', van: 'a1', naar: [30, 22], hoogte: 'halfhoog', direct: true }),
        pauze(1),
      ],
    },
  },

  // KV5. Lage voorzet onderscheppen
  {
    id: 'keeper-vz-lage-voorzet-onderscheppen',
    naam: 'Lage voorzet onderscheppen',
    categorieen: ['voorzetten', 'laag-duiken'],
    uitleg:
      'De buitenspeler dribbelt tot bij de achterlijn en geeft een harde, lage voorzet tussen keeper en verdediging door. De spits loopt in naar de eerste paal. De keeper stapt uit en duikt naar voren, voor de spits, en pakt de bal voordat die erbij is. Te laat? Dan blijft hij staan en maakt hij zich groot voor het schot.',
    organisatie: 'Keeper in het doel, buitenspeler met ballen op 20 m langs de zijlijn, spits op 14 m. Na drie voorzetten wisselen de spelers; daarna van de andere kant.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Bij de achterlijn: één stap richting de eerste paal', 'Duik naar voren, de bal in, niet achteruit', 'Kies: kun je de bal pakken, ga dan helemaal'],
    variaties: {
      makkelijker: ['Voorzet over de grond, rustig', 'Zonder spits'],
      moeilijker: ['Spits start dichterbij', 'Ook de cutback naar de penaltystip'],
    },
    en: {
      naam: 'Intercepting a low cross',
      uitleg:
        'The winger dribbles to the byline and plays a hard, low cross between keeper and defence. The striker runs in to the near post. The keeper steps out and dives forward, in front of the striker, and takes the ball before the striker gets there. Too late? Then stay on your feet and make yourself big for the shot.',
      organisatie: 'Keeper in goal, winger with balls 20 m out along the touchline, striker at 14 m. After three crosses the players change; then from the other side.',
      benodigdheden: ['Goal', '2 cones', 'Balls'],
      coachpunten: ['At the byline: one step towards the near post', 'Dive forwards, into the ball, not backwards', 'Decide: if you can get the ball, go all the way'],
      variaties: {
        makkelijker: ['Cross along the ground, calmly', 'No striker'],
        moeilijker: ['Striker starts closer', 'Also the cutback to the penalty spot'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 22, y: -3, breedte: 34, lengte: 26 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        speler('a1', 7, 51, 20, { kijkrichting: -100 }),
        speler('a2', 9, 34, 14, { kijkrichting: -90 }),
        bal('bal', 50.9, 19.45, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'dribbel', wie: 'a1', naar: [49.4, 4.6], duur: 2.6 }, { type: 'loop', wie: 'a2', via: [[36.6, 9]], naar: [37.6, 5.6], manier: 'sprint', start: 1.5 }),
        stap({ type: 'loop', wie: 'k1', naar: [35.4, 1.8], duur: 0.4 }),
        stap({ type: 'pass', van: 'a1', naar: 'k1', hoogte: 'grond', duikNaar: [38.4, 3.2], duikHoogte: 0.25 }),
        pauze(0.9),
        stap({ type: 'opstaan', wie: 'k1' }),
        pauze(0.4),
      ],
    },
  },

  // KV6. Corner met drukte voor de goal
  {
    id: 'keeper-vz-corner-drukte',
    naam: 'Corner met drukte voor de goal',
    categorieen: ['voorzetten'],
    uitleg:
      'Een corner, met drie poppen en twee spelers in en rond het doelgebied. De keeper zoekt zijn weg erdoorheen naar de bal: hij kiest een looplijn langs de poppen, zet af op één been en stompt de bal weg (of vangt hem als het kan). De spelers mogen springen en hinderen, niet duwen.',
    organisatie: 'Keeper in het doel, drie poppen in het doelgebied, twee spelers (eerst passief, daarna half actief). De trainer neemt corners van beide kanten. Series van vijf.',
    benodigdheden: ['Goal', '3 poppen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    leeftijden: ['jo16-19'],
    doorwisselbaar: true,
    coachpunten: ['Kies je looplijn al terwijl de bal komt', 'Twijfel je tussen vangen en stompen? Stompen', 'Stomp hoog en ver, naar de zijkant'],
    variaties: {
      makkelijker: ['Twee poppen en geen spelers', 'Corner uit de hand'],
      moeilijker: ['Spelers vol actief', 'Een speler vlak voor de keeper'],
    },
    en: {
      naam: 'Corner with a crowded box',
      uitleg:
        'A corner, with three mannequins and two players in and around the six-yard box. The keeper finds a way through to the ball: they choose a path past the mannequins, take off on one leg and punch the ball away (or catch it if possible). The players may jump and get in the way, but not push.',
      organisatie: 'Keeper in goal, three mannequins in the six-yard box, two players (passive at first, then half active). The coach takes corners from both sides. Sets of five.',
      benodigdheden: ['Goal', '3 mannequins', 'Balls'],
      coachpunten: ['Choose your path while the ball is coming', 'In doubt between catching and punching? Punch', 'Punch high and far, towards the side'],
      variaties: {
        makkelijker: ['Two mannequins and no players', 'Corner thrown from the hands'],
        moeilijker: ['Players fully active', 'A player right in front of the keeper'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 20, y: -7, breedte: 51, lengte: 25 }),
      objecten: [
        goal,
        pop('p1', 36.6, 2.6),
        pop('p2', 31.4, 3.6),
        pop('p3', 38.4, 5.4),
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1', uitkomen: true }),
        B('a1', 9, 33.4, 7.4, { kijkrichting: -90 }),
        B('a2', 4, 37, 8.6, { kijkrichting: -90 }),
        trainer(67.4, 0.6, 160),
        bal('bal', 66.9, 0.8, 't1'),
      ],
      animatie: [
        pauze(0.6),
        stap(
          { type: 'pass', van: 't1', naar: [34.8, 5.4], hoogte: 'hoog', uitkomen: 'k1', stompNaar: [26, 16], vuisten: 2 },
          { type: 'springen', wie: 'a1', start: 1.5 },
        ),
        pauze(1.6),
      ],
    },
  },

  // KP1. Uittrap naar het doelwit
  {
    id: 'keeper-ps-uittrap-doelwit',
    naam: 'Uittrap naar het doelwit',
    categorieen: ['passing'],
    uitleg:
      'De bal ligt in het doelgebied. De keeper neemt een korte aanloop en trapt hem vanaf de grond hoog en ver naar een vak op 25 meter. Elke bal die in het vak stuit is een punt. Wie heeft na tien trappen de meeste punten? Wissel af: het vak in het midden en op de flank.',
    organisatie: 'Keeper in het doelgebied met tien ballen. Vak van 10 × 10 m op 25 m (pionnen). Een tweede keeper of trainer haalt de ballen terug.',
    benodigdheden: ['Goal', '4 pionnen', '10 ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Schuine aanloop, standbeen naast de bal', 'Raak de bal onder het midden met je wreef', 'Doortrekken in de richting van het vak'],
    variaties: {
      makkelijker: ['Vak op 18 m', 'Groter vak'],
      moeilijker: ['Vak op 30 m', 'Kleiner vak, of een speler die de bal in het vak moet aannemen'],
    },
    en: {
      naam: 'Kicking to a target',
      uitleg:
        'The ball is in the six-yard box. The keeper takes a short run-up and kicks it from the ground high and long to a box 25 metres away. Every ball that bounces in the box is a point. Who has the most points after ten kicks? Alternate: the box in the middle and on the wing.',
      organisatie: 'Keeper in the six-yard box with ten balls. A 10 × 10 m box 25 m away (cones). A second keeper or the coach brings the balls back.',
      benodigdheden: ['Goal', '4 cones', '10 balls'],
      coachpunten: ['Run up at an angle, standing foot next to the ball', 'Strike under the middle of the ball with your laces', 'Follow through towards the box'],
      variaties: {
        makkelijker: ['Box at 18 m', 'Bigger box'],
        moeilijker: ['Box at 30 m', 'Smaller box, or a player who has to control the ball in the box'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 16, y: -3, breedte: 36, lengte: 36 }),
      objecten: [goal, zone('z', 34, 27, 10, 10), keeper('k1', 1, 31.6, 3.4, { kijkrichting: 70 }), bal('b1', 32.6, 5.2), bal('b2', 36.4, 5.2)],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [32.1, 4.6], duur: 0.6 }),
        stap({ type: 'pass', van: 'k1', naar: [34, 27.4], worp: 'trap', hoogte: 'hoog', bal: 'b1' }),
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [35.9, 4.6], duur: 1.4 }),
        stap({ type: 'pass', van: 'k1', naar: [32.6, 25.8], worp: 'trap', hoogte: 'hoog', bal: 'b2' }),
        pauze(1),
      ],
    },
  },

  // KP2. Aannemen links, spelen rechts
  {
    id: 'keeper-ps-aannemen-links-spelen-rechts',
    naam: 'Aannemen links, spelen rechts',
    categorieen: ['passing'],
    uitleg:
      'De terugspeelbal komt van links. De keeper neemt hem aan met zijn linkervoet, opzij en weg van het doel, en speelt hem met zijn rechtervoet door het poortje naar de back aan de overkant. Daarna komt de bal van rechts: aannemen met rechts, spelen met links. Zo train je beide voeten.',
    organisatie: 'Keeper in het doel, de trainer met ballen links op 14 m, een poortje van pionnen rechts op 18 m (en andersom). Vijf ballen per kant.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Open staan: je ziet de bal én het poortje', 'Aanname opzij, nooit voor het doel langs', 'Na de aanname meteen spelen, met je andere voet'],
    variaties: {
      makkelijker: ['Twee aanrakingen extra', 'Groter poortje'],
      moeilijker: ['In één keer met de andere voet', 'Een aanvaller die druk zet'],
    },
    en: {
      naam: 'Control with your left, pass with your right',
      uitleg:
        'The back pass comes from the left. The keeper controls it with the left foot, to the side and away from goal, and plays it with the right foot through the gate to the full-back on the other side. Then the ball comes from the right: control with the right, pass with the left. You train both feet.',
      organisatie: 'Keeper in goal, the coach with balls on the left 14 m out, a gate of cones on the right 18 m out (and the other way round). Five balls per side.',
      benodigdheden: ['Goal', '4 cones', 'Balls'],
      coachpunten: ['Stand open: you see the ball and the gate', 'Control it to the side, never across the goal', 'Play straight after controlling it, with your other foot'],
      variaties: {
        makkelijker: ['Two extra touches', 'Bigger gate'],
        moeilijker: ['First time with the other foot', 'An attacker who presses'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 12, y: -3, breedte: 46, lengte: 26 }),
      objecten: [goal, pion('p1', 47.3, 18.2), pion('p2', 48.7, 17), keeper('k1', 1, 34, 2.4, { kijkrichting: 90 }), trainer(24, 13, -30), bal('bal', 24.5, 12.7, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1', hoogte: 'grond' }),
        stap({ type: 'dribbel', wie: 'k1', naar: [35.6, 3.4], duur: 0.7 }),
        stap({ type: 'pass', van: 'k1', naar: [50.4, 19.9], worp: 'voet', hoogte: 'grond' }),
        pauze(1),
      ],
    },
  },

  // KP3. Uitworp over de eerste linie
  {
    id: 'keeper-ps-uitworp-over-de-linie',
    naam: 'Uitworp over de eerste linie',
    categorieen: ['passing'],
    uitleg:
      'De trainer schiet op de keeper. Zodra hij de bal vangt, start de middenvelder zijn loopactie. De keeper gooit de bal bovenhands over de twee poppen (de eerste linie van de tegenstander) heen, in de loop van de middenvelder, zodat die hem meteen kan meenemen. Snel, maar zuiver.',
    organisatie: 'Keeper in het doel, twee poppen op 14 m, de middenvelder 6 m achter de poppen. De trainer met ballen op 11 m opzij. Na vier worpen naar de andere kant.',
    benodigdheden: ['Goal', '2 poppen', 'Ballen'],
    spelersNodig: 1,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Na het vangen meteen kijken: waar loopt de middenvelder?', 'Bovenhands: arm gestrekt, de bal over je schouder', 'Gooi voor de speler uit, in zijn loop'],
    variaties: {
      makkelijker: ['Rollen in plaats van gooien, zonder poppen', 'Middenvelder dichterbij'],
      moeilijker: ['Middenvelder verder weg', 'Twee middenvelders: gooi naar de vrije'],
    },
    en: {
      naam: 'Throwing out over the first line',
      uitleg:
        'The coach shoots at the keeper. As soon as they catch the ball, the midfielder starts their run. The keeper throws the ball overarm over the two mannequins (the opponents’ first line) into the midfielder’s stride, so they can take it on straight away. Quick, but accurate.',
      organisatie: 'Keeper in goal, two mannequins at 14 m, the midfielder 6 m behind the mannequins. The coach with balls 11 m out to the side. After four throws, the other side.',
      benodigdheden: ['Goal', '2 mannequins', 'Balls'],
      coachpunten: ['After catching, look straight away: where is the midfielder running?', 'Overarm: arm straight, the ball over your shoulder', 'Throw ahead of the player, into their stride'],
      variaties: {
        makkelijker: ['Roll instead of throw, without mannequins', 'Midfielder closer'],
        moeilijker: ['Midfielder further away', 'Two midfielders: throw to the free one'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 18, y: -3, breedte: 36, lengte: 32 }),
      objecten: [goal, pop('p1', 30, 14), pop('p2', 36, 14.4), keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }), speler('a1', 8, 32, 21, { kijkrichting: -90 }), trainer(38, 11, -110), bal('bal', 37.8, 10.5, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'schot', van: 't1', naar: [34.6, 0.6], hoogte: 'laag', afloop: 'vangt', vasthouden: true }),
        stap({ type: 'loop', wie: 'a1', naar: [24, 22.6], manier: 'sprint' }, { type: 'pass', van: 'k1', naar: 'a1', worp: 'bovenhands', hoogte: 'halfhoog', start: 0.4 }),
        pauze(1),
      ],
    },
  },

  // KP4. Driehoek met de centrale verdedigers
  {
    id: 'keeper-ps-driehoek-centrale-verdedigers',
    naam: 'Driehoek met de centrale verdedigers',
    categorieen: ['passing'],
    uitleg:
      'De keeper en de twee centrale verdedigers vormen een driehoek, met de keeper als punt achterin. Een spits zet lichte druk op de bal. Speelt de spits de ene verdediger vast, dan speelt die terug op de keeper, en de keeper verlegt het spel meteen naar de andere verdediger. Zo bouw je rustig op en speel je de spits uit.',
    organisatie: 'Op een half veld: keeper in het doel, twee centrale verdedigers op 14 m, wijd uit elkaar. Eén spits zet druk (eerst rustig). Na vijf keer verleggen wisselt de spits.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 3,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Keeper: altijd aanspeelbaar, schuif mee met de bal', 'Aanname met de voet weg van de spits', 'Verdedigers: breed staan, open naar de keeper'],
    variaties: {
      makkelijker: ['De spits mag alleen lopen', 'Twee aanrakingen voor de keeper'],
      moeilijker: ['Twee spitsen', 'De keeper in één keer'],
    },
    en: {
      naam: 'Triangle with the centre-backs',
      uitleg:
        'The keeper and the two centre-backs form a triangle, with the keeper as the point at the back. A striker puts light pressure on the ball. If the striker closes down one defender, that defender plays it back to the keeper, who switches play straight away to the other defender. You build up calmly and play round the striker.',
      organisatie: 'On half a pitch: keeper in goal, two centre-backs 14 m out and wide apart. One striker presses (calmly at first). After five switches the striker changes.',
      benodigdheden: ['Goal', '4 cones', 'Balls'],
      coachpunten: ['Keeper: always available, move with the ball', 'Control with the foot away from the striker', 'Defenders: stay wide, open to the keeper'],
      variaties: {
        makkelijker: ['The striker may only walk', 'Two touches for the keeper'],
        moeilijker: ['Two strikers', 'The keeper one touch'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 14, y: -3, breedte: 40, lengte: 26 }),
      objecten: [goal, keeper('k1', 1, 34, 3, { kijkrichting: 90 }), speler('a1', 4, 24, 12, { kijkrichting: 0 }), speler('a2', 3, 44, 12.4, { kijkrichting: 180 }), B('b1', 9, 32, 18, { kijkrichting: -90 }), bal('bal', 24.5, 12, 'a1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'druk', wie: 'b1', op: 'a1', afstand: 3.2, start: 0.2 }),
        stap({ type: 'pass', van: 'a1', naar: 'k1' }, { type: 'loop', wie: 'k1', naar: [32.6, 3.6], duur: 0.8 }),
        stap({ type: 'pass', van: 'k1', naar: 'a2', worp: 'voet' }, { type: 'loop', wie: 'b1', naar: [34, 13], start: 0.5 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [45, 18] }),
        pauze(0.6),
      ],
    },
  },

  // KP5. Rollen naar het poortje (JO8–11)
  {
    id: 'keeper-ps-rollen-naar-poortje',
    naam: 'Rollen naar het poortje',
    categorieen: ['passing'],
    uitleg:
      'Twee keepers staan tegenover elkaar met een poortje van twee pionnen in het midden. Rol de bal onderhands door het poortje naar je maatje: laag door je knieën, de bal rolt over de grond. Lukt het, dan doet de ontvanger een stap achteruit, zodat het steeds een meter verder wordt.',
    organisatie: 'Poortje van 1,5 m breed. De keepers beginnen op 5 m van het poortje en gaan na elke goede worp een meter achteruit, tot 12 m.',
    benodigdheden: ['2 pionnen', '1 bal'],
    spelersNodig: 0,
    keepersNodig: 2,
    leeftijden: ['jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Stap uit met het andere been dan je werparm', 'Laat de bal vlak bij de grond los', 'Je hand wijst na het rollen naar je maatje'],
    variaties: {
      makkelijker: ['Breder poortje', 'Dichterbij blijven'],
      moeilijker: ['Smaller poortje', 'Met je andere hand'],
    },
    en: {
      naam: 'Rolling through the gate',
      uitleg:
        'Two keepers face each other with a gate of two cones in the middle. Roll the ball underarm through the gate to your partner: low with bent knees, the ball rolling along the ground. If it works, the receiver takes a step back, so it gets a metre further each time.',
      organisatie: 'Gate 1.5 m wide. The keepers start 5 m from the gate and take a metre step back after every good roll, up to 12 m.',
      benodigdheden: ['2 cones', '1 ball'],
      coachpunten: ['Step out with the leg opposite your throwing arm', 'Release the ball close to the ground', 'After rolling, your hand points at your partner'],
      variaties: {
        makkelijker: ['Wider gate', 'Stay closer'],
        moeilijker: ['Narrower gate', 'With your other hand'],
      },
    },
    tekening: {
      ...leeg(18, 8),
      objecten: [pion('p1', 9, 3.2), pion('p2', 9, 4.8), keeper('k1', 1, 4, 4, { kijkrichting: 0 }), keeper('k2', 2, 14, 4, { kijkrichting: 180 }), bal('bal', 4.55, 4, 'k1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'k1', naar: 'k2', worp: 'onderhands', hoogte: 'grond' }),
        stap({ type: 'loop', wie: 'k2', naar: [15, 4], manier: 'achteruit', kijk: 180, duur: 0.8 }),
        stap({ type: 'pass', van: 'k2', naar: 'k1', worp: 'onderhands', hoogte: 'grond' }),
        stap({ type: 'loop', wie: 'k1', naar: [3, 4], manier: 'achteruit', kijk: 0, duur: 0.8 }),
        stap({ type: 'pass', van: 'k1', naar: 'k2', worp: 'onderhands', hoogte: 'grond' }),
        pauze(0.5),
      ],
    },
  },

  // KP6. Chip over de spits
  {
    id: 'keeper-ps-chip-over-de-spits',
    naam: 'Chip over de spits',
    categorieen: ['passing'],
    uitleg:
      'Een verdediger speelt de bal terug op de keeper; de spits zet meteen druk van voren en sluit de lage pass af. De keeper tilt de bal met een korte wip over de spits heen naar de middenvelder die erachter vrijstaat. Raak de bal laag onder het midden, met weinig kracht maar veel lift.',
    organisatie: 'Op een half veld: keeper in het doel, verdediger op 14 m opzij, spits op 12 m, middenvelder 8 m achter de spits. Na vier keer wisselt de spits.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    leeftijden: ['jo16-19'],
    doorwisselbaar: true,
    coachpunten: ['Kijk voor de bal komt waar de spits en de middenvelder staan', 'Wippen: teen onder de bal, korte beweging', 'Niet te hard: de middenvelder moet hem kunnen aannemen'],
    variaties: {
      makkelijker: ['De spits blijft staan', 'Eerst aannemen, dan wippen'],
      moeilijker: ['In één keer wippen', 'Een tweede spits die de middenvelder dekt'],
    },
    en: {
      naam: 'Chip over the striker',
      uitleg:
        'A defender plays the ball back to the keeper; the striker presses straight away from the front and blocks the low pass. The keeper lifts the ball with a short chip over the striker to the midfielder free behind them. Strike low under the middle of the ball, with little power but lots of lift.',
      organisatie: 'On half a pitch: keeper in goal, defender 14 m out to the side, striker at 12 m, midfielder 8 m behind the striker. After four turns the striker changes.',
      benodigdheden: ['Goal', '4 cones', 'Balls'],
      coachpunten: ['Before the ball arrives, look where the striker and the midfielder are', 'Chipping: toe under the ball, short movement', 'Not too hard: the midfielder must be able to control it'],
      variaties: {
        makkelijker: ['The striker stands still', 'Control first, then chip'],
        moeilijker: ['Chip first time', 'A second striker marking the midfielder'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 16, y: -3, breedte: 36, lengte: 28 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 2.4, { kijkrichting: 90 }),
        speler('a1', 4, 25, 13, { kijkrichting: 0 }),
        speler('a2', 8, 35.6, 21, { kijkrichting: -90 }),
        B('b1', 9, 34.6, 13, { kijkrichting: -90 }),
        bal('bal', 25.5, 13, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'k1' }, { type: 'loop', wie: 'b1', naar: [34.2, 7.4], manier: 'sprint', start: 0.4 }),
        stap({ type: 'pass', van: 'k1', naar: 'a2', worp: 'voet', hoogte: 'halfhoog' }),
        pauze(1),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('keepers', oefeningen);
