// Fase 2, deel 3, batch 2 (0.37.1), deel f: 1 tegen 1 D1, D2, D3, D5, D8, D9 uit VOORSTEL-OEFENINGEN.md.
// Overgeslagen (vrijwel gelijk aan een bestaande oefening): D4 (veld-sp-koning-van-het-veld), D6 (veld-pv-1-1-doeltjes), D7 (veld-o6-haaien-en-visjes).
// Draaien: node tools/nieuw/fase2-0371f.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, speler, trainer, bal, pion, hoedje, pauze, stap, B, zone, leeg, doeltje, miniGoal, ring, JO, OUD, MIDDEN, KLEUR } = require('./fase2-hulp.cjs');
const J = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'J', ...extra });

const oefeningen = [
  // D1. Duel uit de draai
  {
    id: 'veld-een-duel-uit-de-draai',
    naam: 'Duel uit de draai',
    categorieen: ['een-tegen-een'],
    uitleg:
      'Twee spelers staan met hun rug naar elkaar, de bal ligt opzij tussen hen in. Op het teken draaien ze om: wie het eerst bij de bal is, valt aan op het doeltje van de ander; de ander verdedigt. Scoor of verover de bal en scoor zelf. Daarna nieuwe startposities.',
    organisatie: 'Vak van 16 × 12 m met op elke korte kant een klein doeltje. Tweetallen; de trainer legt de bal neer en geeft het teken. Duels van maximaal 15 seconden.',
    benodigdheden: ['2 kleine doeltjes', '4 hoedjes', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Draai over de kant van de bal, dat is het snelst', 'Wie de bal heeft: meteen vooruit, niet eerst afwachten', 'Wie de bal mist: meteen omschakelen en tussen de bal en je doeltje komen'],
    variaties: {
      makkelijker: ['Beginnen met je gezicht naar elkaar', 'Grotere doeltjes'],
      moeilijker: ['Beginnen in zit of buikligging', 'Bal verder weg van beiden', 'Twee doeltjes per kant'],
    },
    en: {
      naam: 'Duel from a turn',
      uitleg:
        'Two players stand back to back, with the ball to the side between them. On the signal they turn: whoever gets to the ball first attacks the other player’s mini goal; the other defends. Score, or win the ball and score yourself. Then new starting positions.',
      organisatie: '16 × 12 m area with a mini goal at each short end. Pairs; the coach places the ball and gives the signal. Duels of up to 15 seconds.',
      benodigdheden: ['2 mini goals', '4 disc cones', 'Balls'],
      coachpunten: ['Turn towards the side of the ball: that is the quickest', 'Whoever has the ball: go forward straight away, do not wait', 'Whoever misses the ball: switch straight away and get between the ball and your goal'],
      variaties: {
        makkelijker: ['Start facing each other', 'Bigger goals'],
        moeilijker: ['Start sitting or lying face down', 'Ball further from both players', 'Two goals at each end'],
      },
    },
    tekening: {
      ...leeg(18, 14),
      objecten: [zone('z', 9, 7, 16, 12), doeltje('g1', 1, 7, -90), doeltje('g2', 17, 7, 90), speler('a1', 1, 8, 6, { kijkrichting: -90 }), B('b1', 2, 10, 6, { kijkrichting: 90 }), trainer(9, 12.4, -90), bal('bal', 9, 9)],
      animatie: [
        pauze(0.8),
        stap({ type: 'draai', wie: 'a1', kijk: 60 }, { type: 'draai', wie: 'b1', kijk: 120, start: 0.12 }),
        stap({ type: 'loop', wie: 'a1', naar: [8.6, 8.6], manier: 'sprint', duur: 0.6 }, { type: 'loop', wie: 'b1', naar: [10.8, 7.6], manier: 'sprint', duur: 0.6 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [11.6, 9.6], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [13.4, 8.2], manier: 'verdedigend' }),
        stap({ type: 'schijn', wie: 'a1', kant: 'links' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [14.6, 10.4], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [14.4, 8], manier: 'verdedigend' }),
        stap({ type: 'schot', van: 'a1', naar: [17.2, 7.4], hoogte: 'grond' }),
        pauze(0.8),
      ],
    },
  },

  // D2. 1 tegen 1 van opzij
  {
    id: 'veld-een-1-1-van-opzij',
    naam: '1 tegen 1 van opzij',
    categorieen: ['een-tegen-een'],
    uitleg:
      'De aanvaller dribbelt vanaf de achterlijn naar voren. De verdediger start van opzij en komt schuin op hem af. De aanvaller kiest: naar binnen snijden voor de verdediger langs, of buitenom versnellen. Scoor in een van de twee doeltjes aan het eind.',
    organisatie: 'Vak van 18 × 14 m met aan het eind twee kleine doeltjes. Rij aanvallers op de achterlijn, rij verdedigers aan de zijkant halverwege. Na je beurt naar de andere rij.',
    benodigdheden: ['2 kleine doeltjes', '6 hoedjes', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Aanvaller: kijk op tijd waar de verdediger vandaan komt', 'Snij naar binnen als hij te snel komt, ga buitenom als hij te laat is', 'Verdediger: niet recht op de bal af, maar schuin, tussen bal en doeltje'],
    variaties: {
      makkelijker: ['Verdediger start verder weg', 'Eén groot doeltje'],
      moeilijker: ['Verdediger start dichterbij', 'Aanvaller moet binnen 6 seconden scoren'],
    },
    en: {
      naam: '1v1 from the side',
      uitleg:
        'The attacker dribbles forward from the end line. The defender starts from the side and comes at them at an angle. The attacker chooses: cut inside in front of the defender, or accelerate round the outside. Score in one of the two mini goals at the end.',
      organisatie: '18 × 14 m area with two mini goals at the far end. Line of attackers on the end line, line of defenders at the side, halfway. After your turn, join the other line.',
      benodigdheden: ['2 mini goals', '6 disc cones', 'Balls'],
      coachpunten: ['Attacker: see in time where the defender is coming from', 'Cut inside if they come too fast, go round the outside if they are too late', 'Defender: not straight at the ball but at an angle, between ball and goal'],
      variaties: {
        makkelijker: ['Defender starts further away', 'One big goal'],
        moeilijker: ['Defender starts closer', 'The attacker must score within 6 seconds'],
      },
    },
    tekening: {
      ...leeg(16, 20),
      objecten: [zone('z', 8, 10, 14, 18), doeltje('g1', 4.5, 1, 0), doeltje('g2', 11.5, 1, 0), hoedje('h1', 1, 19), hoedje('h2', 15, 19), speler('a1', 1, 5, 18, { kijkrichting: -90 }), B('b1', 2, 15, 10, { kijkrichting: 180 }), bal('bal', 5, 17.45, 'a1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [6, 12.4] }, { type: 'loop', wie: 'b1', naar: [9.6, 9.4], manier: 'sprint', start: 0.5 }),
        stap({ type: 'loop', wie: 'b1', naar: [7.8, 9], manier: 'verdedigend', duur: 0.7 }, { type: 'truc', wie: 'a1', soort: 'buitenkant', kijk: -120 }),
        stap({ type: 'dribbel', wie: 'a1', via: [[3.4, 8.6]], naar: [4, 4.4], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [6.2, 6], manier: 'sprint', start: 0.3 }),
        stap({ type: 'schot', van: 'a1', naar: [4.6, 0.8], hoogte: 'grond' }),
        pauze(0.8),
      ],
    },
  },

  // D3. 1 tegen 1 met een tijdklok
  {
    id: 'veld-een-1-1-tijdklok',
    naam: '1 tegen 1 met een tijdklok',
    categorieen: ['een-tegen-een', 'afwerken'],
    uitleg:
      'De aanvaller krijgt de bal en heeft zes tellen om te scoren op het doel met de keeper. De trainer telt hardop af. De verdediger hoeft de bal niet te veroveren: als hij de aanvaller zes tellen ophoudt, wint hij. Zo leert de aanvaller snel te kiezen en leert de verdediger vertragen.',
    organisatie: 'Op een half veld met een keeper. Aanvaller start op 25 m, verdediger op 18 m. De trainer speelt in en telt. Na 4 duels wisselen van rol.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Aanvaller: meteen vooruit en de verdediger laten kiezen', 'Verdediger: niet instappen, laag blijven en meelopen', 'Aanvaller: na je actie meteen schieten, niet nog een keer'],
    variaties: {
      makkelijker: ['Acht tellen', 'Verdediger start verder weg'],
      moeilijker: ['Vier tellen', 'Een tweede verdediger komt na drie tellen mee'],
    },
    en: {
      naam: '1v1 against the clock',
      uitleg:
        'The attacker receives the ball and has six seconds to score on the goal with a keeper. The coach counts down out loud. The defender does not have to win the ball: if they hold the attacker up for six seconds, they win. The attacker learns to choose quickly and the defender learns to delay.',
      organisatie: 'On half a pitch with a keeper. Attacker starts at 25 m, defender at 18 m. The coach plays the ball in and counts. Swap roles after 4 duels.',
      benodigdheden: ['Goal', '4 cones', 'Balls'],
      coachpunten: ['Attacker: go forward straight away and make the defender choose', 'Defender: do not dive in, stay low and track', 'Attacker: shoot straight after your move, not another one'],
      variaties: {
        makkelijker: ['Eight seconds', 'Defender starts further away'],
        moeilijker: ['Four seconds', 'A second defender joins after three seconds'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 20, y: -3, breedte: 28, lengte: 32 },
      camera: 'schuin',
      objecten: [goal, keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }), trainer(28, 27, -60), bal('bal', 28.3, 26.5, 't1'), speler('a1', 9, 33, 25, { kijkrichting: -90 }), B('b1', 4, 35, 17, { kijkrichting: 90 })],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'a1' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [33.6, 20.4] }, { type: 'loop', wie: 'b1', naar: [34.4, 17.6], manier: 'verdedigend', start: 0.2 }),
        stap({ type: 'schijn', wie: 'a1', kant: 'rechts' }, { type: 'loop', wie: 'b1', naar: [35.4, 17.2], manier: 'verdedigend', duur: 0.5 }),
        stap({ type: 'dribbel', wie: 'a1', via: [[31.4, 17.4]], naar: [31.2, 14], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [33.2, 13.6], manier: 'sprint', start: 0.3 }),
        stap({ type: 'schot', van: 'a1', naar: [36.8, 0.4], hoogte: 'laag', afloop: 'goal' }),
        pauze(0.8),
      ],
    },
  },

  // D5. 1 tegen 1 na een lange bal
  {
    id: 'veld-een-1-1-lange-bal',
    naam: '1 tegen 1 na een lange bal',
    categorieen: ['een-tegen-een', 'afwerken'],
    uitleg:
      'De trainer speelt een lange, hoge bal naar de aanvaller. De verdediger staat een paar meter verderop en komt op hem af zodra de bal vertrekt. De aanvaller neemt de bal aan met zijn eerste aanraking weg van de verdediger en speelt dan het 1 tegen 1 uit op het doel met de keeper.',
    organisatie: 'Op een half veld met een keeper. De trainer staat op de middenlijn met ballen, de aanvaller op 26 m, de verdediger op 20 m. Na 4 duels wisselen.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Kijk voor de bal komt waar de verdediger staat', 'Eerste aanraking weg van de druk, de ruimte in', 'Na de aanname meteen de verdediger aanvallen'],
    variaties: {
      makkelijker: ['Bal over de grond', 'Verdediger start verder weg'],
      moeilijker: ['Verdediger start dichterbij', 'Aannemen uit de lucht in één aanraking'],
    },
    en: {
      naam: '1v1 after a long ball',
      uitleg:
        'The coach plays a long, high ball to the attacker. The defender stands a few metres away and comes at them as soon as the ball is played. The attacker takes their first touch away from the defender and then plays out the 1v1 on the goal with a keeper.',
      organisatie: 'On half a pitch with a keeper. The coach stands on the halfway line with balls, the attacker at 26 m, the defender at 20 m. Swap after 4 duels.',
      benodigdheden: ['Goal', '4 cones', 'Balls'],
      coachpunten: ['Before the ball arrives, check where the defender is', 'First touch away from the pressure, into space', 'After the touch, attack the defender straight away'],
      variaties: {
        makkelijker: ['Ball along the ground', 'Defender starts further away'],
        moeilijker: ['Defender starts closer', 'Control out of the air with one touch'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 18, y: -3, breedte: 34, lengte: 56 },
      camera: 'schuin',
      objecten: [goal, keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }), trainer(30, 51, -80), bal('bal', 30.1, 50.45, 't1'), speler('a1', 9, 34, 26, { kijkrichting: 90 }), B('b1', 4, 36.4, 20, { kijkrichting: 90 })],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'a1', hoogte: 'hoog' }, { type: 'loop', wie: 'b1', naar: [35.6, 23.6], start: 0.6 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [31.6, 24.6], duur: 0.7 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [30.4, 16], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [32.8, 15.4], manier: 'sprint', start: 0.3 }),
        stap({ type: 'schot', van: 'a1', naar: [36.6, 0.4], hoogte: 'laag', afloop: 'vangt' }),
        pauze(0.8),
      ],
    },
  },

  // D8. Wie pakt de schat van de trainer? (O6)
  {
    id: 'veld-een-schat-van-de-trainer',
    naam: 'Wie pakt de schat van de trainer?',
    categorieen: ['een-tegen-een'],
    uitleg:
      'De trainer is een piraat en de bal is zijn schat. Hij dribbelt langzaam rond. Probeer samen de bal af te pakken! Heb je hem? Dribbel dan snel naar jullie hoepel. Daarna krijgt de piraat zijn schat terug en mag je het nog eens proberen.',
    organisatie: 'Vak van 12 × 12 m met een hoepel in een hoek. De trainer dribbelt rustig met een voetbal; 5 kinderen zonder bal proberen hem af te pakken. Wie de bal heeft, dribbelt naar de hoepel.',
    benodigdheden: ['4 hoedjes', '1 hoepel', '1 voetbal'],
    spelersNodig: 3,
    keepersNodig: 0,
    leeftijden: ['mini-3-5'],
    doorwisselbaar: true,
    coachpunten: ['Kijk naar de bal, niet naar de trainer', 'Zet je voet ertussen als de bal ver van zijn voet is', 'Samen: kom van verschillende kanten'],
    variaties: {
      makkelijker: ['De trainer dribbelt heel langzaam', 'Groter vak'],
      moeilijker: ['De trainer mag sneller', 'Twee trainers met elk een schat'],
    },
    en: {
      naam: 'Steal the coach’s treasure',
      uitleg:
        'The coach is a pirate and the ball is the treasure. The coach dribbles around slowly. Try to win the ball together! Got it? Then dribble quickly to your hoop. Then the pirate gets the treasure back and you can try again.',
      organisatie: '12 × 12 m area with a hoop in one corner. The coach dribbles slowly with a ball; 5 children without a ball try to win it. Whoever has the ball dribbles to the hoop.',
      benodigdheden: ['4 disc cones', '1 hoop', '1 ball'],
      coachpunten: ['Watch the ball, not the coach', 'Put your foot in when the ball is far from the coach’s foot', 'Together: come from different sides'],
      variaties: {
        makkelijker: ['The coach dribbles very slowly', 'Bigger area'],
        moeilijker: ['The coach may go faster', 'Two coaches, each with a treasure'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [zone('z', 7, 7, 12, 12), hoedje('h1', 1, 1), hoedje('h2', 13, 1), hoedje('h3', 1, 13), hoedje('h4', 13, 13), ring('r', 11.6, 11.6, KLEUR.geel), trainer(6, 6, 0), bal('bal', 6.55, 6, 't1'), speler('a1', 1, 3, 9.6, { kijkrichting: -45 }), speler('a2', 2, 10, 3, { kijkrichting: 135 }), speler('a3', 3, 9.4, 9.8, { kijkrichting: -120 })],
      animatie: [
        pauze(0.5),
        stap(
          { type: 'dribbel', wie: 't1', via: [[7.6, 5]], naar: [8.4, 6.6], duur: 2, manier: 'wandel' },
          { type: 'loop', wie: 'a1', naar: [6.2, 8.4], duur: 2 },
          { type: 'loop', wie: 'a2', naar: [10.4, 5], duur: 2 },
          { type: 'loop', wie: 'a3', naar: [10.2, 8.6], duur: 2 },
        ),
        stap({ type: 'verover', wie: 'a3', van: 't1' }),
        stap({ type: 'dribbel', wie: 'a3', naar: [11, 11], manier: 'sprint' }, { type: 'loop', wie: 'a1', naar: [7.6, 10.6], start: 0.3 }),
        stap({ type: 'voetOpBal', wie: 'a3' }),
        pauze(0.6),
      ],
    },
  },

  // D9. 1 tegen 1 met een meelopende joker
  {
    id: 'veld-een-1-1-joker',
    naam: '1 tegen 1 met een meelopende joker',
    categorieen: ['een-tegen-een'],
    uitleg:
      'Een 1 tegen 1 op een doeltje, met een joker die langs de zijlijn meeloopt. Kom je er niet langs, dan mag je de joker aanspelen; hij kaatst de bal terug in de ruimte achter de verdediger. Daarna moet je zelf scoren. De joker speelt altijd mee met wie de bal heeft.',
    organisatie: 'Vak van 20 × 12 m met een klein doeltje aan elke kant. Joker buiten het vak langs één zijlijn. Duels van maximaal 20 seconden; na drie duels wordt een ander de joker.',
    benodigdheden: ['2 kleine doeltjes', '6 hoedjes', 'Ballen', '1 hesje'],
    spelersNodig: 3,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Eerst zelf proberen, de joker is de uitweg', 'Speel de joker aan als de verdediger dicht op je zit, en sprint meteen weg', 'Joker: kaats in de ruimte, niet in de voeten'],
    variaties: {
      makkelijker: ['Twee jokers, aan beide kanten', 'Groter vak'],
      moeilijker: ['De joker mag maar één keer per duel', 'De kaats moet in één keer'],
    },
    en: {
      naam: '1v1 with a wall-pass joker',
      uitleg:
        'A 1v1 on a mini goal, with a joker running along the touchline. If you cannot get past, you may pass to the joker, who plays it back into the space behind the defender. Then you must score yourself. The joker always plays for whoever has the ball.',
      organisatie: '20 × 12 m area with a mini goal at each end. Joker outside the area along one touchline. Duels of up to 20 seconds; after three duels someone else is the joker.',
      benodigdheden: ['2 mini goals', '6 disc cones', 'Balls', '1 bib'],
      coachpunten: ['Try it yourself first: the joker is the way out', 'Use the joker when the defender is tight on you, and sprint away straight away', 'Joker: lay it off into space, not to feet'],
      variaties: {
        makkelijker: ['Two jokers, one on each side', 'Bigger area'],
        moeilijker: ['The joker may only be used once per duel', 'The return pass must be first time'],
      },
    },
    tekening: {
      ...leeg(22, 16),
      objecten: [zone('z', 11, 7, 20, 12), doeltje('g1', 1, 7, -90), doeltje('g2', 21, 7, 90), speler('a1', 1, 5, 6, { kijkrichting: 0 }), B('b1', 2, 10, 7, { kijkrichting: 180 }), J('j', 3, 8, 14.2, { kijkrichting: -90 }), bal('bal', 5.55, 6, 'a1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [7.6, 7.4] }, { type: 'loop', wie: 'b1', naar: [10, 7.4], manier: 'verdedigend' }),
        stap({ type: 'pass', van: 'a1', naar: 'j' }, { type: 'loop', wie: 'j', naar: [10, 14.2], duur: 0.8 }),
        stap({ type: 'loop', wie: 'a1', via: [[8.4, 10.6]], naar: [13.4, 10.8], manier: 'sprint' }, { type: 'pass', van: 'j', naar: 'a1', direct: true, start: 0.3 }, { type: 'loop', wie: 'b1', naar: [12, 7.4], manier: 'sprint', start: 0.4 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [17.4, 8.6], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [15.4, 6.4], manier: 'sprint' }),
        stap({ type: 'schot', van: 'a1', naar: [21.2, 7.4], hoogte: 'grond' }),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
