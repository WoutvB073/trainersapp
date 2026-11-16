// Fase 2, deel 3, batch 1 (0.37.0), deel c: Loopcoördinatie L3–L8 uit VOORSTEL-OEFENINGEN.md (zonder bal).
// L1 en L2 zijn overgeslagen: vrijwel gelijk aan veld-lc-ladder-in-uit en veld-lc-ringen. Draaien: node tools/nieuw/fase2-0370c.cjs
const { zet } = require('./hulp.cjs');
const { speler, trainer, pion, hoedje, paaltje, horde, pauze, stap, B, ring, leeg, JO, OUD, MIDDEN, O6, KLEUR } = require('./fase2-hulp.cjs');

const oefeningen = [
  // L3. Reactiestart op kleur
  {
    id: 'veld-lc-reactiestart-kleur',
    naam: 'Reactiestart op kleur',
    categorieen: ['loopcoordinatie'],
    uitleg:
      'Je staat met je rug naar twee pionnen, een rode en een blauwe, en kijkt naar de trainer. De trainer roept een kleur. Je draait zo snel mogelijk om, sprint naar die pion en tikt hem aan. Daarna jog je terug naar je beginplek voor de volgende kleur. Wie is het eerst bij de pion?',
    organisatie: 'Per speler twee pionnen op 5 m, 3,5 m uit elkaar; de spelers staan met hun rug ernaartoe. De trainer staat voor de spelers. Twee of drie spelers tegelijk, elk met eigen pionnen. Series van 4 starts.',
    benodigdheden: ['4 pionnen in 2 kleuren', 'Hoedjes voor de beginplekken'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Klaarstaan op je voorvoeten, licht door de knieën', 'Draai over de kant van de pion: dat is de kortste weg', 'Eerste passen klein en snel, dan pas groot'],
    variaties: {
      makkelijker: ['Met je gezicht naar de pionnen beginnen', 'De trainer wijst aan in plaats van te roepen'],
      moeilijker: ['De trainer roept de kleur die je níet moet nemen', 'Beginnen vanuit zit of buikligging', 'Drie kleuren'],
    },
    en: {
      naam: 'Colour reaction start',
      uitleg:
        'You stand with your back to two cones, a red one and a blue one, facing the coach. The coach calls a colour. Turn as quickly as possible, sprint to that cone and touch it. Then jog back to your starting spot for the next colour. Who gets to the cone first?',
      organisatie: 'For each player two cones 5 m away, 3.5 m apart; the players stand with their backs to them. The coach stands in front of the players. Two or three players at a time, each with their own cones. Sets of 4 starts.',
      benodigdheden: ['4 cones in 2 colours', 'Disc cones for the starting spots'],
      coachpunten: ['Get set on the balls of your feet, knees slightly bent', 'Turn towards the side of the cone: that is the shortest way', 'First steps short and quick, then lengthen your stride'],
      variaties: {
        makkelijker: ['Start facing the cones', 'The coach points instead of calling'],
        moeilijker: ['The coach calls the colour you must NOT go to', 'Start sitting down or lying face down', 'Three colours'],
      },
    },
    tekening: {
      ...leeg(15, 11),
      objecten: [
        pion('r1', 2, 1.6, KLEUR.rood),
        pion('b1', 5.5, 1.6, KLEUR.blauw),
        pion('r2', 9.5, 1.6, KLEUR.rood),
        pion('b2', 13, 1.6, KLEUR.blauw),
        hoedje('s1', 3.75, 7.4),
        hoedje('s2', 11.25, 7.4),
        speler('a1', 1, 3.75, 6.6, { kijkrichting: 90 }),
        speler('a2', 2, 11.25, 6.6, { kijkrichting: 90 }),
        trainer(7.5, 9.6, -90),
      ],
      animatie: [
        pauze(0.8),
        // "Rood!": omdraaien en sprinten.
        stap({ type: 'draai', wie: 'a1', kijk: -120 }, { type: 'draai', wie: 'a2', kijk: -110, start: 0.08 }),
        stap({ type: 'loop', wie: 'a1', naar: [2.4, 2.6], manier: 'sprint' }, { type: 'loop', wie: 'a2', naar: [9.8, 2.6], manier: 'sprint', start: 0.05 }),
        stap({ type: 'aantikken', wie: 'a1', doel: 'r1' }, { type: 'aantikken', wie: 'a2', doel: 'r2' }),
        stap({ type: 'loop', wie: 'a1', naar: [3.75, 6.6], kijk: 90, manier: 'achteruit' }, { type: 'loop', wie: 'a2', naar: [11.25, 6.6], kijk: 90, manier: 'achteruit' }),
        pauze(0.6),
        // "Blauw!"
        stap({ type: 'draai', wie: 'a1', kijk: -60, start: 0.05 }, { type: 'draai', wie: 'a2', kijk: -70 }),
        stap({ type: 'loop', wie: 'a1', naar: [5.1, 2.6], manier: 'sprint', start: 0.05 }, { type: 'loop', wie: 'a2', naar: [12.6, 2.6], manier: 'sprint' }),
        stap({ type: 'aantikken', wie: 'a1', doel: 'b1' }, { type: 'aantikken', wie: 'a2', doel: 'b2' }),
        stap({ type: 'loop', wie: 'a1', naar: [3.75, 6.6], kijk: 90, manier: 'achteruit' }, { type: 'loop', wie: 'a2', naar: [11.25, 6.6], kijk: 90, manier: 'achteruit' }),
        pauze(0.6),
      ],
    },
  },

  // L4. Vooruit, achteruit, zijwaarts in het vierkant
  {
    id: 'veld-lc-vierkant-looprichtingen',
    naam: 'Vooruit, achteruit, zijwaarts in het vierkant',
    categorieen: ['loopcoordinatie', 'warming-up'],
    uitleg:
      'Je loopt de vier zijden van een vierkant, steeds op een andere manier, en je kijkt de hele tijd dezelfde kant op. Eerst sprint je vooruit, dan schuif je zijwaarts, dan loop je achteruit terug en tot slot schuif je zijwaarts naar je beginpunt. Wissel bij elke hoek zo snel mogelijk van manier.',
    organisatie: 'Vierkant van 6 × 6 m met een pion op elke hoek; twee vierkanten naast elkaar. Eén speler per vierkant, de volgende start als de vorige bij de tweede hoek is. 4 rondes, daarna de andere kant op.',
    benodigdheden: ['8 pionnen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Zijwaarts: voeten niet kruisen, laag blijven', 'Achteruit: kleine passen, gewicht naar voren', 'Bij de hoek kort afremmen en meteen de nieuwe richting op'],
    variaties: {
      makkelijker: ['Kleiner vierkant (4 m)', 'Alles in jogtempo'],
      moeilijker: ['Op het fluitje de looprichting omdraaien', 'Bij elke pion de grond aantikken', 'Groter vierkant (8 m)'],
    },
    en: {
      naam: 'Forwards, backwards, sideways round the square',
      uitleg:
        'You go round the four sides of a square, each side in a different way, facing the same direction the whole time. First sprint forwards, then shuffle sideways, then backpedal and finally shuffle sideways back to your start. Change movement as quickly as possible at every corner.',
      organisatie: '6 × 6 m square with a cone on each corner; two squares side by side. One player per square; the next player starts when the previous one reaches the second corner. 4 laps, then the other way round.',
      benodigdheden: ['8 cones'],
      coachpunten: ['Sideways: do not cross your feet, stay low', 'Backwards: short steps, weight forward', 'Brake briefly at the corner and go straight into the new direction'],
      variaties: {
        makkelijker: ['Smaller square (4 m)', 'Everything at jogging pace'],
        moeilijker: ['On the whistle, reverse direction', 'Touch the ground at each cone', 'Bigger square (8 m)'],
      },
    },
    tekening: {
      ...leeg(19, 10),
      objecten: [
        ...[0, 9].flatMap((d, k) => [pion(`p${k}a`, 1.4 + d, 1.4), pion(`p${k}b`, 8.6 + d, 1.4), pion(`p${k}c`, 8.6 + d, 8.6), pion(`p${k}d`, 1.4 + d, 8.6)]),
        speler('a1', 1, 2.2, 7.8, { kijkrichting: -90 }),
        speler('a2', 2, 11.2, 7.8, { kijkrichting: -90 }),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'a1', naar: [2.2, 2.2], manier: 'sprint' }, { type: 'loop', wie: 'a2', naar: [11.2, 2.2], manier: 'sprint', start: 0.6 }),
        stap({ type: 'loop', wie: 'a1', naar: [7.8, 2.2], manier: 'zijwaarts', kijk: -90 }, { type: 'loop', wie: 'a2', naar: [16.8, 2.2], manier: 'zijwaarts', kijk: -90, start: 0.3 }),
        stap({ type: 'loop', wie: 'a1', naar: [7.8, 7.8], manier: 'achteruit', kijk: -90 }, { type: 'loop', wie: 'a2', naar: [16.8, 7.8], manier: 'achteruit', kijk: -90, start: 0.3 }),
        stap({ type: 'loop', wie: 'a1', naar: [2.2, 7.8], manier: 'zijwaarts', kijk: -90 }, { type: 'loop', wie: 'a2', naar: [11.2, 7.8], manier: 'zijwaarts', kijk: -90, start: 0.3 }),
        pauze(0.8),
      ],
    },
  },

  // L5. Hordes en afremmen in de hoepel
  {
    id: 'veld-lc-hordes-afremmen-hoepel',
    naam: 'Hordes en afremmen in de hoepel',
    categorieen: ['loopcoordinatie'],
    uitleg:
      'Je loopt over drie lage hordes en sprint daarna een paar meter door. Dan rem je af en kom je in één keer tot stilstand in een hoepel: laag door de knieën, voeten op schouderbreedte en in balans. Blijf twee tellen stilstaan, loop dan langs de buitenkant terug en sluit achteraan aan.',
    organisatie: 'Drie lage hordes op 80 cm van elkaar, 3 m daarna een hoepel. Twee banen naast elkaar met een rij van 2 tot 3 spelers. Series van 4 keer per speler.',
    benodigdheden: ['6 lage hordes', '2 hoepels', '2 pionnen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Over de hordes: knie omhoog, kort op de grond', 'Afremmen: laatste passen kort, gewicht naar achteren', 'Stilstaan in balans: niet doorstappen uit de hoepel'],
    variaties: {
      makkelijker: ['Hoepel verder weg, zodat je meer tijd hebt om af te remmen', 'Zonder hordes'],
      moeilijker: ['Na het stilstaan meteen zijwaarts wegsprinten', 'Op één been in de hoepel landen', 'Hogere hordes'],
    },
    en: {
      naam: 'Hurdles and stop in the hoop',
      uitleg:
        'Go over three low hurdles and then sprint a few metres more. Then brake and come to a stop in one go inside a hoop: low through the knees, feet shoulder-width apart and balanced. Hold still for two counts, then walk back round the outside and join the back of the line.',
      organisatie: 'Three low hurdles 80 cm apart, with a hoop 3 m after them. Two lanes side by side, each with a line of 2 or 3 players. Sets of 4 runs per player.',
      benodigdheden: ['6 low hurdles', '2 hoops', '2 cones'],
      coachpunten: ['Over the hurdles: knee up, short ground contact', 'Braking: short last steps, weight back', 'Stop balanced: do not step out of the hoop'],
      variaties: {
        makkelijker: ['Hoop further away, so you have more time to brake', 'Without hurdles'],
        moeilijker: ['After stopping, sprint away sideways straight away', 'Land on one leg in the hoop', 'Higher hurdles'],
      },
    },
    tekening: {
      ...leeg(17, 9),
      rijen: [
        { id: 'r1', x: 2.4, y: 2.6, richting: 180, spelers: ['a1', 'a3'] },
        { id: 'r2', x: 2.4, y: 6.4, richting: 180, spelers: ['a2', 'a4'] },
      ],
      objecten: [
        ...[2.6, 6.4].flatMap((y, k) => [horde(`h${k}a`, 4.4, y, 90, 0.15), horde(`h${k}b`, 5.2, y, 90, 0.15), horde(`h${k}c`, 6, y, 90, 0.15), ring(`r${k}`, 10.6, y, '#ff922b'), pion(`p${k}`, 14.6, y)]),
        speler('a1', 1, 0, 0),
        speler('a2', 2, 0, 0),
        speler('a3', 3, 0, 0),
        speler('a4', 4, 0, 0),
      ],
      animatie: [
        pauze(0.5),
        {
          herhaal: {
            spelers: ['a1', 'a2', 'a3', 'a4'],
            tussen: 2.2,
            waarden: {
              hordes: [[6.8, 2.6], [6.8, 6.4]],
              sprint: [[9.2, 2.6], [9.2, 6.4]],
              hoepel: [[10.6, 2.6], [10.6, 6.4]],
              uit: [[10.6, 1.4], [10.6, 7.6]],
              om: [[[12.4, 0.8]], [[12.4, 8.2]]],
              terug: [[4, 0.8], [4, 8.2]],
              rij: ['r1', 'r2'],
            },
            stappen: [
              stap({ type: 'loop', wie: '@', naar: '@hordes', manier: 'hordes' }),
              stap({ type: 'loop', wie: '@', naar: '@sprint', manier: 'sprint', tempo: 'versnellen' }),
              stap({ type: 'loop', wie: '@', naar: '@hoepel', manier: 'afremmen' }),
              pauze(0.8),
              // Zijwaarts uit de hoepel stappen, dan langs de buitenkant terug.
              stap({ type: 'loop', wie: '@', naar: '@uit', manier: 'zijwaarts', kijk: 0 }),
              stap({ type: 'loop', wie: '@', via: '@om', naar: '@terug', spoor: false }),
              stap({ type: 'aansluiten', wie: '@', rij: '@rij' }),
            ],
          },
        },
        pauze(0.6),
      ],
    },
  },

  // L6. Schaduwsprint
  {
    id: 'veld-lc-schaduwsprint',
    naam: 'Schaduwsprint',
    categorieen: ['loopcoordinatie', 'spelletjes'],
    uitleg:
      'Twee spelers staan naast elkaar in het midden tussen twee lijnen. De ene speler kiest het moment en de kant: hij sprint plotseling naar een van de twee lijnen. De andere reageert en probeert hem te tikken voordat hij over de lijn is. Haalt hij de lijn, dan krijgt hij een punt. Na vijf keer wisselen de rollen.',
    organisatie: 'Twee lijnen van hoedjes 16 m uit elkaar; de tweetallen staan in het midden, 2 m uit elkaar. Twee of drie tweetallen naast elkaar, met genoeg ruimte ertussen.',
    benodigdheden: ['12 hoedjes', 'Hesjes'],
    spelersNodig: 4,
    keepersNodig: 0,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Klaarstaan: op je voorvoeten, kijk naar de heupen van de ander', 'Eerste stap meteen de goede kant op, niet eerst terug', 'Tikker: op zijn schouder of rug, niet duwen'],
    variaties: {
      makkelijker: ['Lijnen dichterbij (12 m)', 'De loper roept "nu" bij de start'],
      moeilijker: ['Een schijnbeweging voor de sprint mag', 'Lijnen verder weg (20 m)', 'De tikker begint zittend'],
    },
    en: {
      naam: 'Shadow sprint',
      uitleg:
        'Two players stand side by side in the middle between two lines. One player chooses the moment and the side: they suddenly sprint to one of the two lines. The other reacts and tries to tag them before they cross the line. If they reach the line, they score a point. After five goes, swap roles.',
      organisatie: 'Two lines of disc cones 16 m apart; the pairs stand in the middle, 2 m apart. Two or three pairs side by side, with plenty of space between them.',
      benodigdheden: ['12 disc cones', 'Bibs'],
      coachpunten: ['Get set: on the balls of your feet, watch the other player’s hips', 'First step straight in the right direction, no step back first', 'Tagger: on the shoulder or back, no pushing'],
      variaties: {
        makkelijker: ['Lines closer (12 m)', 'The runner calls "now" at the start'],
        moeilijker: ['A dummy before the sprint is allowed', 'Lines further apart (20 m)', 'The tagger starts sitting down'],
      },
    },
    tekening: {
      ...leeg(20, 12),
      objecten: [
        ...[1.5, 4, 6.5, 9, 11.5].flatMap((y, i) => (i % 2 ? [] : [])).concat([1.5, 4, 6.5, 9, 11].map((y, i) => hoedje(`l${i}`, 2, y))).concat([1.5, 4, 6.5, 9, 11].map((y, i) => hoedje(`r${i}`, 18, y))),
        speler('a1', 1, 9, 3.5, { kijkrichting: 90 }),
        B('b1', 2, 11, 3.5, { kijkrichting: 90 }),
        speler('a2', 3, 11, 8.5, { kijkrichting: -90 }),
        B('b2', 4, 9, 8.5, { kijkrichting: -90 }),
      ],
      animatie: [
        pauze(0.8),
        stap({ type: 'loop', wie: 'a1', naar: [1.2, 3.5], manier: 'sprint', tempo: 'versnellen' }, { type: 'loop', wie: 'b1', naar: [3.8, 3.5], manier: 'sprint', start: 0.35, tempo: 'versnellen' }),
        pauze(0.4),
        stap({ type: 'loop', wie: 'a2', naar: [18.8, 8.5], manier: 'sprint', tempo: 'versnellen' }, { type: 'loop', wie: 'b2', naar: [16.6, 8.5], manier: 'sprint', start: 0.3, tempo: 'versnellen' }),
        pauze(0.6),
        stap(
          { type: 'loop', wie: 'a1', naar: [9, 3.5], kijk: 90 },
          { type: 'loop', wie: 'b1', naar: [11, 3.5], kijk: 90 },
          { type: 'loop', wie: 'a2', naar: [11, 8.5], kijk: -90 },
          { type: 'loop', wie: 'b2', naar: [9, 8.5], kijk: -90 },
        ),
        pauze(0.6),
      ],
    },
  },

  // L7. Dierenloop (O6)
  {
    id: 'veld-lc-dierenloop',
    naam: 'Dierenloop',
    categorieen: ['loopcoordinatie'],
    uitleg:
      'Welk dier ben jij? Spring als een kikker, loop als een ooievaar met je knieën hoog, schuif opzij als een krab of huppel als een paardje naar de overkant. De trainer roept het dier. Wie is het eerst aan de overkant?',
    organisatie: 'Twee lijnen van hoedjes 8 m uit elkaar. De kinderen staan naast elkaar op de ene lijn, met 2 m ruimte. De trainer roept steeds een ander dier; terug gaat lopend. 5 kinderen, 8 tot 10 keer.',
    benodigdheden: ['8 hoedjes'],
    spelersNodig: 3,
    keepersNodig: 0,
    leeftijden: O6,
    doorwisselbaar: true,
    coachpunten: ['Kikker: met twee voeten tegelijk afzetten en landen', 'Ooievaar: knieën zo hoog als je kunt', 'Krab: opzij schuiven, je voeten tikken niet tegen elkaar'],
    variaties: {
      makkelijker: ['Kortere afstand', 'Alle kinderen hetzelfde dier'],
      moeilijker: ['Halverwege roept de trainer een ander dier', 'Om een pion heen en terug', 'Als een kikker over een lage horde'],
    },
    en: {
      naam: 'Animal walks',
      uitleg:
        'Which animal are you? Jump like a frog, walk like a stork with your knees up high, shuffle sideways like a crab or skip like a pony to the other side. The coach calls the animal. Who reaches the other side first?',
      organisatie: 'Two lines of disc cones 8 m apart. The children stand side by side on one line, 2 m apart. The coach calls a different animal each time; walk back. 5 children, 8 to 10 goes.',
      benodigdheden: ['8 disc cones'],
      coachpunten: ['Frog: push off and land with both feet together', 'Stork: knees as high as you can', 'Crab: shuffle sideways, your feet do not bump into each other'],
      variaties: {
        makkelijker: ['Shorter distance', 'All the children do the same animal'],
        moeilijker: ['Halfway, the coach calls a different animal', 'Round a cone and back', 'Like a frog over a low hurdle'],
      },
    },
    tekening: {
      ...leeg(12, 12),
      objecten: [
        ...[2, 5, 8, 11].map((x, i) => hoedje(`v${i}`, x, 10.4, KLEUR.geel)),
        ...[2, 5, 8, 11].map((x, i) => hoedje(`a${i}h`, x, 2, KLEUR.geel)),
        speler('a1', 1, 3.5, 9.4, { kijkrichting: -90 }),
        speler('a2', 2, 6.5, 9.4, { kijkrichting: -90 }),
        speler('a3', 3, 9.5, 9.4, { kijkrichting: -90 }),
        trainer(11.2, 6.4, 180),
      ],
      animatie: [
        pauze(0.6),
        // Kikker, ooievaar en krab.
        stap(
          { type: 'loop', wie: 'a1', naar: [3.5, 3], manier: 'sprong' },
          { type: 'loop', wie: 'a2', naar: [6.5, 3], manier: 'kniehef' },
          { type: 'loop', wie: 'a3', naar: [9.5, 3], manier: 'zijwaarts', kijk: 180 },
        ),
        pauze(0.5),
        stap({ type: 'loop', wie: 'a1', naar: [3.5, 9.4], manier: 'wandel', kijk: 90 }, { type: 'loop', wie: 'a2', naar: [6.5, 9.4], manier: 'wandel' }, { type: 'loop', wie: 'a3', naar: [9.5, 9.4], manier: 'wandel' }),
        stap({ type: 'draai', wie: 'a1', kijk: -90 }, { type: 'draai', wie: 'a2', kijk: -90 }, { type: 'draai', wie: 'a3', kijk: -90 }),
        // Paardje: iedereen huppelt.
        stap({ type: 'loop', wie: 'a1', naar: [3.5, 3], manier: 'huppel' }, { type: 'loop', wie: 'a2', naar: [6.5, 3], manier: 'huppel' }, { type: 'loop', wie: 'a3', naar: [9.5, 3], manier: 'huppel' }),
        pauze(0.8),
      ],
    },
  },

  // L8. Slalom achteruit
  {
    id: 'veld-lc-slalom-achteruit',
    naam: 'Slalom achteruit',
    categorieen: ['loopcoordinatie'],
    uitleg:
      'Je loopt achteruit door een slalom van paaltjes en kijkt daarbij over je schouder, zodat je ze niet raakt. Na het laatste paaltje draai je om en sprint je naar de pion. Loop langs de buitenkant terug en sluit achteraan aan.',
    organisatie: 'Vijf paaltjes op 2 m van elkaar, 4 m daarna een pion. Eén rij van 3 spelers per slalom; de volgende start als de vorige bij het derde paaltje is.',
    benodigdheden: ['5 paaltjes', '2 pionnen'],
    spelersNodig: 1,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Kleine passen, gewicht op je voorvoeten', 'Kijk om de beurt over je linker- en rechterschouder', 'Omdraaien over de kant van de pion en meteen versnellen'],
    variaties: {
      makkelijker: ['Paaltjes verder uit elkaar (3 m)', 'Achteruit in rechte lijn, zonder slalom'],
      moeilijker: ['Paaltjes dichter bij elkaar', 'De trainer roept "draai" op een willekeurig moment', 'Met bal: na het omdraaien een pass aannemen'],
    },
    en: {
      naam: 'Backwards slalom',
      uitleg:
        'Backpedal through a slalom of poles, looking over your shoulder so you do not hit them. After the last pole, turn round and sprint to the cone. Walk back round the outside and join the back of the line.',
      organisatie: 'Five poles 2 m apart, with a cone 4 m after them. One line of 3 players per slalom; the next player starts when the previous one reaches the third pole.',
      benodigdheden: ['5 poles', '2 cones'],
      coachpunten: ['Short steps, weight on the balls of your feet', 'Look over your left and right shoulder in turn', 'Turn towards the side of the cone and accelerate straight away'],
      variaties: {
        makkelijker: ['Poles further apart (3 m)', 'Backwards in a straight line, no slalom'],
        moeilijker: ['Poles closer together', 'The coach calls "turn" at any moment', 'With a ball: after turning, receive a pass'],
      },
    },
    tekening: {
      ...leeg(20, 7),
      rijen: [{ id: 'r1', x: 2.4, y: 3, richting: 180, spelers: ['a1', 'a2', 'a3'] }],
      objecten: [...[4.5, 6.5, 8.5, 10.5, 12.5].map((x, i) => paaltje(`s${i}`, x, 3)), pion('p1', 17.2, 3), speler('a1', 1, 0, 0), speler('a2', 2, 0, 0), speler('a3', 3, 0, 0)],
      animatie: [
        pauze(0.5),
        {
          herhaal: {
            spelers: ['a1', 'a2', 'a3'],
            tussen: 4.6,
            stappen: [
              stap({ type: 'loop', wie: '@', via: [[4.5, 4.1], [5.5, 3], [6.5, 1.9], [7.5, 3], [8.5, 4.1], [9.5, 3], [10.5, 1.9], [11.5, 3], [12.5, 4.1]], naar: [13.6, 3.2], manier: 'achteruit', kijk: 180, tempo: 'gelijkmatig' }),
              stap({ type: 'draai', wie: '@', kijk: 0 }),
              stap({ type: 'loop', wie: '@', naar: [16.4, 3.4], manier: 'sprint' }),
              stap({ type: 'loop', wie: '@', via: [[17.6, 5.9]], naar: [0.8, 5.9], spoor: false, tempo: 'gelijkmatig' }),
              stap({ type: 'aansluiten', wie: '@', rij: 'r1' }),
            ],
          },
        },
        pauze(0.6),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
