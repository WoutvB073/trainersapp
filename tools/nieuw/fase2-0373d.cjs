// Fase 2, deel 3, batch 4 (0.37.3), deel d: keepers uit VOORSTEL-OEFENINGEN.md – 1 op 1 K11–K15, reactie KR1, KR4, KR6 en
// spelletjes KS1–KS5.
// Draaien: node tools/nieuw/fase2-0373d.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, speler, bal, pion, hoedje, horde, pauze, stap, B, zone, leeg, doeltje, kaatsbord, JO, OUD, MIDDEN } = require('./fase2-hulp.cjs');

const keeperVeld = (weergave) => ({ veld: { type: 'half' }, weergave, camera: 'schuin' });
const op = (wie = 'k1') => stap({ type: 'opstaan', wie });
const jeugdgoal = (id, x, y, hoek = 0, hoogte = 2) => ({ id, soort: 'goal', x, y, breedte: 5, hoogte, ...(hoek ? { hoek } : {}) });

const oefeningen = [
  // K11. Uitkomen tot de pion
  {
    id: 'keeper-1o1-uitkomen-tot-pion',
    naam: 'Uitkomen tot de pion',
    categorieen: ['een-op-een'],
    uitleg:
      'Op 5 m voor het doel staat een pion. De aanvaller dribbelt recht op het doel af. De keeper komt uit tot de pion, maar niet verder, en maakt zich daar groot en breed in zijn basishouding. Schiet de aanvaller, dan blokt hij met zijn lichaam. Zo leert de keeper hoe ver hij uit kan komen en dat hij op tijd stil moet staan.',
    organisatie: 'Keeper in het doel, pion op 5 m, aanvaller met ballen op 20 m. Na vier aanvallen wisselen de aanvallers.',
    benodigdheden: ['Goal', '1 pion', 'Ballen'],
    spelersNodig: 1,
    keepersNodig: 1,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Uitkomen als de aanvaller de bal ver voor zich uit speelt', 'Bij de pion stilstaan: voeten breed, armen laag en opzij', 'Blijf staan tot de aanvaller schiet, niet te vroeg duiken'],
    variaties: {
      makkelijker: ['Pion dichter bij het doel', 'Aanvaller langzaam'],
      moeilijker: ['Aanvaller van opzij', 'De aanvaller mag ook om de keeper heen'],
    },
    en: {
      naam: 'Coming out as far as the cone',
      uitleg:
        'There is a cone 5 m in front of the goal. The attacker dribbles straight at goal. The keeper comes out as far as the cone, but no further, and makes themself big and wide in the set position there. If the attacker shoots, they block with their body. The keeper learns how far they can come out and that they have to stop in time.',
      organisatie: 'Keeper in goal, cone at 5 m, attacker with balls at 20 m. After four attacks the attackers change.',
      benodigdheden: ['Goal', '1 cone', 'Balls'],
      coachpunten: ['Come out when the attacker pushes the ball a long way ahead', 'Stop at the cone: feet wide, arms low and out', 'Stay on your feet until the attacker shoots, do not go down too early'],
      variaties: {
        makkelijker: ['Cone closer to the goal', 'Slow attacker'],
        moeilijker: ['Attacker from the side', 'The attacker may also go round the keeper'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 26 }),
      objecten: [goal, pion('p1', 34, 5.6), keeper('k1', 1, 34, 1.5, { verdedigt: 'g1', uitkomen: true }), speler('a1', 9, 34.8, 20, { kijkrichting: -90 }), bal('bal', 34.8, 19.45, 'a1')],
      animatie: [
        pauze(0.4),
        stap({ type: 'dribbel', wie: 'a1', naar: [34.8, 10.6], manier: 'sprint' }, { type: 'loop', wie: 'k1', naar: [34, 4.8], manier: 'voetenwerk', start: 1 }),
        stap({ type: 'schot', van: 'a1', naar: [35.4, 0.4], hoogte: 'laag', blokt: 'k1', blokSoort: 'ster' }),
        pauze(1),
      ],
    },
  },

  // K12. Duel in een smalle baan
  {
    id: 'keeper-1o1-smalle-baan',
    naam: 'Duel in een smalle baan',
    categorieen: ['een-op-een'],
    uitleg:
      'Een 1 tegen 1 in een baan van 15 bij 20 meter met aan het eind een laag doel. De aanvaller dribbelt de baan in. De keeper kiest: uitkomen en de bal pakken als de aanvaller hem te ver voor zich uit speelt, of wachten en zich groot maken. In het voorbeeld speelt de aanvaller de bal te ver vooruit en plukt de keeper hem weg.',
    organisatie: 'Baan van 15 × 20 m (hoedjes) met een jeugdgoal van 1,6 m hoog. Aanvaller start op het andere eind. Duels van maximaal 8 seconden; na vier duels wisselen.',
    benodigdheden: ['1 jeugdgoal', '6 hoedjes', 'Ballen'],
    spelersNodig: 1,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Kies op tijd: uitkomen of wachten, niet half', 'Uitkomen op het moment dat de bal van de voet is', 'Plukken met de handen eerst, je lichaam achter de bal'],
    variaties: {
      makkelijker: ['Smallere baan', 'Aanvaller mag maar drie keer raken'],
      moeilijker: ['Bredere baan', 'Een tweede aanvaller die mee mag'],
    },
    en: {
      naam: 'Duel in a narrow lane',
      uitleg:
        'A 1v1 in a 15 by 20 metre lane with a low goal at the end. The attacker dribbles into the lane. The keeper decides: come out and take the ball if the attacker pushes it too far ahead, or wait and make themself big. In the example the attacker pushes the ball too far ahead and the keeper snatches it.',
      organisatie: '15 × 20 m lane (disc cones) with a youth goal 1.6 m high. The attacker starts at the other end. Duels of up to 8 seconds; swap after four duels.',
      benodigdheden: ['1 youth goal', '6 disc cones', 'Balls'],
      coachpunten: ['Decide in time: come out or wait, not halfway', 'Come out the moment the ball leaves the foot', 'Snatch it hands first, your body behind the ball'],
      variaties: {
        makkelijker: ['Narrower lane', 'Attacker may only touch it three times'],
        moeilijker: ['Wider lane', 'A second attacker who may join in'],
      },
    },
    tekening: {
      ...leeg(17, 23),
      objecten: [
        zone('z', 8.5, 11.5, 15, 20),
        jeugdgoal('g1', 8.5, 1.5, 0, 1.6),
        keeper('k1', 1, 8.5, 2.9, { verdedigt: 'g1', uitkomen: true }),
        speler('a1', 9, 9, 20, { kijkrichting: -90 }),
        bal('bal', 9, 19.45, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'dribbel', wie: 'a1', naar: [9.2, 11.6] }, { type: 'loop', wie: 'k1', naar: [8.6, 5], manier: 'voetenwerk', start: 0.8 }),
        stap({ type: 'pass', van: 'a1', naar: [9, 7.6], hoogte: 'grond' }, { type: 'loop', wie: 'a1', naar: [9.2, 9.8], start: 0.1, duur: 0.6 }),
        stap({ type: 'pluk', wie: 'k1' }),
        pauze(1),
      ],
    },
  },

  // K13. De bal van opzij afpakken
  {
    id: 'keeper-1o1-bal-van-opzij-afpakken',
    naam: 'De bal van opzij afpakken',
    categorieen: ['een-op-een'],
    uitleg:
      'De aanvaller komt op de keeper af en probeert er met een actie omheen te gaan. De keeper blijft laag en dicht bij de aanvaller. Op het moment dat de aanvaller de bal opzij van zijn voet laat gaan, duikt de keeper op de bal, met zijn handen eerst, en pakt hem af voordat de aanvaller er weer bij is.',
    organisatie: 'Keeper in het doel, aanvaller met ballen op 16 m. De aanvaller probeert om de keeper heen te dribbelen en dan te scoren. Na vier keer wisselen.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 1,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Laag blijven, je handen al bij de grond', 'Kijk naar de bal, niet naar de schijnbeweging', 'Duik op de bal zodra hij van de voet is'],
    variaties: {
      makkelijker: ['Aanvaller mag alleen naar één kant', 'Langzaam tempo'],
      moeilijker: ['Aanvaller mag ook schieten', 'Twee acties achter elkaar'],
    },
    en: {
      naam: 'Taking the ball from the side',
      uitleg:
        'The attacker comes at the keeper and tries to go round them with a move. The keeper stays low and close to the attacker. The moment the attacker lets the ball go to the side of their foot, the keeper dives on the ball, hands first, and takes it before the attacker can get to it again.',
      organisatie: 'Keeper in goal, attacker with balls at 16 m. The attacker tries to dribble round the keeper and then score. Swap after four turns.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Stay low, your hands already near the ground', 'Watch the ball, not the feint', 'Dive on the ball as soon as it leaves the foot'],
      variaties: {
        makkelijker: ['Attacker may only go one way', 'Slow pace'],
        moeilijker: ['Attacker may shoot as well', 'Two moves in a row'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 22 }),
      objecten: [goal, keeper('k1', 1, 34, 1.5, { verdedigt: 'g1', uitkomen: true }), speler('a1', 9, 34.6, 16, { kijkrichting: -90 }), bal('bal', 34.6, 15.45, 'a1')],
      animatie: [
        pauze(0.4),
        stap({ type: 'dribbel', wie: 'a1', naar: [34.6, 9.2] }, { type: 'loop', wie: 'k1', naar: [34.2, 5.6], manier: 'voetenwerk', start: 0.7 }),
        stap({ type: 'schijn', wie: 'a1', kant: 'links' }),
        stap({ type: 'pass', van: 'a1', naar: [36.8, 7.2], hoogte: 'grond' }, { type: 'loop', wie: 'a1', naar: [36.4, 9.2], start: 0.2, duur: 0.6 }),
        stap({ type: 'pluk', wie: 'k1' }),
        pauze(1),
      ],
    },
  },

  // K14. Twee aanvallers, één keeper
  {
    id: 'keeper-1o1-twee-aanvallers',
    naam: 'Twee aanvallers, één keeper',
    categorieen: ['een-op-een'],
    uitleg:
      'Twee aanvallers tegen de keeper. De keeper blijft bij de balbezitter en verkleint de hoek. Zodra die de bal breed speelt, schuift de keeper snel door naar de andere aanvaller en zet hij zich voor diens schot: stilstaan op het moment van het schot. Wie te vroeg kiest, staat aan de verkeerde kant.',
    organisatie: 'Keeper in het doel, twee aanvallers op 16 m, 8 m uit elkaar. Na vier aanvallen wisselen de aanvallers van kant.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Bij de balbezitter: hoek klein, maar niet te ver uit', 'Bij de pass: snel en laag doorschuiven, niet rennen', 'Op het moment van het schot sta je stil, in je basishouding'],
    variaties: {
      makkelijker: ['Aanvallers spelen pas na twee tellen breed', 'Aanvallers verder weg'],
      moeilijker: ['Ook een terugpass', 'Een verdediger die terugsprint'],
    },
    en: {
      naam: 'Two attackers, one keeper',
      uitleg:
        'Two attackers against the keeper. The keeper stays with the player on the ball and narrows the angle. As soon as they pass across, the keeper shuffles quickly over to the other attacker and sets for their shot: still at the moment of the shot. Whoever commits too early is on the wrong side.',
      organisatie: 'Keeper in goal, two attackers 16 m out, 8 m apart. After four attacks the attackers change sides.',
      benodigdheden: ['Goal', '2 cones', 'Balls'],
      coachpunten: ['With the player on the ball: narrow the angle, but not too far out', 'On the pass: shuffle across quickly and low, do not run', 'At the moment of the shot you are still, in your set position'],
      variaties: {
        makkelijker: ['Attackers pass across only after two seconds', 'Attackers further away'],
        moeilijker: ['Also a pass back', 'A defender sprinting back'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 22, y: -3, breedte: 24, lengte: 22 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        speler('a1', 9, 30, 16, { kijkrichting: -80 }),
        speler('a2', 10, 38.4, 16.4, { kijkrichting: -100 }),
        bal('bal', 30.1, 15.45, 'a1'),
      ],
      animatie: [
        pauze(0.4),
        stap({ type: 'dribbel', wie: 'a1', naar: [31.4, 10] }, { type: 'loop', wie: 'a2', naar: [37.6, 10.6] }, { type: 'loop', wie: 'k1', naar: [33, 3.4], manier: 'voetenwerk', start: 0.6 }),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'k1', naar: [35, 3.4], manier: 'zijwaarts', kijk: 90, start: 0.15 }),
        stap({ type: 'schot', van: 'a2', naar: [36.4, 0.3], hoogte: 'grond', afloop: 'vangt', direct: true }),
        pauze(1),
      ],
    },
  },

  // K15. Wie is het eerst bij de bal?
  {
    id: 'keeper-1o1-wie-eerst-bij-de-bal',
    naam: 'Wie is het eerst bij de bal?',
    categorieen: ['een-op-een'],
    uitleg:
      'De trainer staat naast het doel en rolt de bal de ruimte in, tussen de keeper en de aanvaller. De keeper kiest meteen: is hij eerder bij de bal, dan komt hij uit en pakt hem; is de aanvaller eerder, dan blijft hij voor zijn doel en verdedigt hij het doel. In het voorbeeld komt de bal dichter bij de keeper: uitkomen en pakken. Daarna dichter bij de aanvaller: blijven en redden.',
    organisatie: 'Keeper in het doel, aanvaller op 18 m, de trainer naast de paal met ballen. De trainer varieert hoe ver hij de bal rolt.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 1,
    keepersNodig: 1,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Kies meteen, niet halverwege nog twijfelen', 'Uitkomen: sprinten en met je handen eerst op de bal', 'Blijven: snel terug in je basishouding, het schot komt'],
    variaties: {
      makkelijker: ['Aanvaller start verder weg', 'Bal langzamer'],
      moeilijker: ['Aanvaller start dichterbij', 'Bal halfhoog: vangen of stompen'],
    },
    en: {
      naam: 'Who gets to the ball first?',
      uitleg:
        'The coach stands beside the goal and rolls the ball into the space between the keeper and the attacker. The keeper decides straight away: if they will get there first, they come out and take it; if the attacker will, they stay in front of goal and defend it. In the example the ball goes closer to the keeper: come out and take it. Then closer to the attacker: stay and save.',
      organisatie: 'Keeper in goal, attacker at 18 m, the coach beside the post with balls. The coach varies how far the ball is rolled.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Decide straight away, no doubts halfway', 'Coming out: sprint and get to the ball hands first', 'Staying: quickly back into your set position, the shot is coming'],
      variaties: {
        makkelijker: ['Attacker starts further away', 'Slower ball'],
        moeilijker: ['Attacker starts closer', 'Ball at mid-height: catch or punch'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 22, lengte: 24 }),
      objecten: [goal, keeper('k1', 1, 34, 1.5, { verdedigt: 'g1', uitkomen: true }), trainer(39, 0.8, 120), bal('b1', 38.7, 1.2, 't1'), bal('b2', 39.9, 1.5), speler('a1', 9, 33, 18, { kijkrichting: -90 })],
      animatie: [
        pauze(0.4),
        stap({ type: 'pass', van: 't1', naar: [35, 6.6], hoogte: 'grond' }, { type: 'loop', wie: 'k1', naar: [34.6, 5.4], manier: 'sprint', start: 0.3 }, { type: 'loop', wie: 'a1', naar: [34, 11.6], manier: 'sprint', start: 0.3 }),
        stap({ type: 'pluk', wie: 'k1' }),
        pauze(0.6),
        op(),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands', hoogte: 'grond' }, { type: 'loop', wie: 'a1', naar: [32, 18], start: 0.2 }),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.5], duur: 1.2 }),
        stap({ type: 'pass', van: 't1', naar: [33.6, 12], hoogte: 'grond', bal: 'b2' }, { type: 'loop', wie: 'a1', naar: [33.4, 12.8], manier: 'sprint', start: 0.4 }),
        stap({ type: 'schot', van: 'a1', naar: [31.8, 0.3], hoogte: 'grond', afloop: 'vangt' }),
        pauze(1),
      ],
    },
  },

  // KR1. Bal tegen het kaatsbord en redden
  {
    id: 'keeper-re-schuin-kaatsbord',
    naam: 'Bal tegen het kaatsbord en redden',
    categorieen: ['reactie'],
    uitleg:
      'Voor het doel staat een kaatsbord, schuin gedraaid. De trainer schiet de bal tegen het bord; de bal kaatst van richting naar het doel. De keeper ziet pas laat waar de bal heen gaat en moet snel reageren: vangen, duiken of wegtikken.',
    organisatie: 'Kaatsbord op 6 m voor het doel, schuin gedraaid. De trainer met ballen op 10 m, schuin naast het bord. Series van vijf; daarna het bord de andere kant op draaien.',
    benodigdheden: ['Goal', '1 kaatsbord', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Kijk naar het bord, niet naar de trainer', 'Klein en snel in je basishouding, gewicht op de voorvoeten', 'Reageer met je handen eerst'],
    variaties: {
      makkelijker: ['Bord verder van het doel', 'Rustiger schieten'],
      moeilijker: ['Bord dichterbij', 'Twee borden, de trainer kiest'],
    },
    en: {
      naam: 'Rebounder deflections',
      uitleg:
        'In front of the goal there is a rebounder, turned at an angle. The coach shoots the ball against the rebounder; the ball changes direction towards the goal. The keeper only sees late where the ball is going and has to react quickly: catch, dive or tip it away.',
      organisatie: 'Rebounder 6 m in front of the goal, turned at an angle. The coach with balls 10 m out, to one side of the rebounder. Sets of five; then turn the rebounder the other way.',
      benodigdheden: ['Goal', '1 rebounder', 'Balls'],
      coachpunten: ['Watch the rebounder, not the coach', 'Small and quick in your set position, weight on the balls of your feet', 'React hands first'],
      variaties: {
        makkelijker: ['Rebounder further from the goal', 'Calmer shots'],
        moeilijker: ['Rebounder closer', 'Two rebounders, the coach chooses'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 20, lengte: 18 }),
      objecten: [goal, kaatsbord('kb', 36.4, 6.2, 150), keeper('k1', 1, 34, 1.5, { kijkrichting: 90 }), trainer(40, 11.6, -120), bal('bal', 39.7, 11.1, 't1')],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 't1', naar: 'kb', terug: 'k1', terugHoogte: 'grond', duikNaar: [32.6, 2] }),
        pauze(0.8),
        op(),
        pauze(0.4),
      ],
    },
  },

  // KR4. Liggen, bal, liggen, bal
  {
    id: 'keeper-re-liggen-bal-liggen',
    naam: 'Liggen, bal, liggen, bal',
    categorieen: ['reactie'],
    uitleg:
      'De keeper ligt op zijn buik voor het doel. Op het teken komt hij zo snel mogelijk overeind en staat hij in zijn basishouding voor de bal die de trainer op zijn lichaam gooit: vangen, terug gooien en meteen weer gaan liggen. Zo een paar keer achter elkaar, steeds snel omhoog.',
    organisatie: 'Keeper 2 m voor het doel, de trainer op 6 m met een bal. Series van vier, dan rust.',
    benodigdheden: ['Goal', 'Bal'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Omhoog via je handen en één knie, niet eerst op je knieën zitten', 'Eerst staan, dan vangen', 'Kijk de bal al aan terwijl je opstaat'],
    variaties: {
      makkelijker: ['Beginnen in kniezit', 'De trainer wacht tot de keeper staat'],
      moeilijker: ['Beginnen op je rug', 'Bal naast de keeper: na het opstaan duiken'],
    },
    en: {
      naam: 'Down, ball, down, ball',
      uitleg:
        'The keeper lies face down in front of the goal. On the signal they get up as quickly as possible and stand in the set position for the ball the coach throws at their body: catch it, throw it back and lie down again straight away. Several times in a row, always up quickly.',
      organisatie: 'Keeper 2 m in front of the goal, the coach 6 m away with a ball. Sets of four, then rest.',
      benodigdheden: ['Goal', 'Ball'],
      coachpunten: ['Get up via your hands and one knee, do not sit on your knees first', 'Stand first, then catch', 'Already watch the ball while you get up'],
      variaties: {
        makkelijker: ['Start kneeling', 'The coach waits until the keeper is standing'],
        moeilijker: ['Start lying on your back', 'Ball beside the keeper: dive after getting up'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 27, y: -3, breedte: 14, lengte: 12 }),
      objecten: [goal, keeper('k1', 1, 34, 2.4, { kijkrichting: 90, houding: 'buik' }), trainer(34, 8.4, -90), bal('bal', 34, 7.85, 't1')],
      animatie: [
        pauze(0.6),
        op(),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1.3 }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands', hoogte: 1.2 }),
        stap({ type: 'zitten', wie: 'k1', houding: 'buik' }),
        pauze(0.5),
        op(),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1 }),
        pauze(0.6),
      ],
    },
  },

  // KR6. Schot van dichtbij na een pass opzij
  {
    id: 'keeper-re-pass-opzij-schot',
    naam: 'Schot van dichtbij na een pass opzij',
    categorieen: ['reactie', 'een-op-een'],
    uitleg:
      'Een schutter op 12 m speelt de bal breed naar een tweede schutter op 6 m schuin voor het doel. De keeper verplaatst zich snel mee, maar staat stil in zijn basishouding op het moment dat de tweede schutter schiet. Daarna reageren: vangen, duiken of blokken.',
    organisatie: 'Keeper in het doel, schutter 1 op 12 m in het midden, schutter 2 op 6 m schuin. Na vier ballen wisselen de schutters; daarna van de andere kant.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Verplaatsen met kleine pasjes, zijwaarts, niet kruisen', 'Op tijd stilstaan: het schot komt snel', 'Van dichtbij: laag blijven, handen naast je lichaam'],
    variaties: {
      makkelijker: ['Schutter 2 neemt eerst aan', 'Schutter 2 verder weg'],
      moeilijker: ['Schutter 2 mag ook terugleggen', 'Twee schutters breed, schutter 1 kiest'],
    },
    en: {
      naam: 'Close-range shot after a pass across',
      uitleg:
        'A shooter 12 m out plays the ball across to a second shooter 6 m out at an angle to the goal. The keeper moves across quickly, but is still in the set position at the moment the second shooter shoots. Then react: catch, dive or block.',
      organisatie: 'Keeper in goal, shooter 1 at 12 m in the middle, shooter 2 at 6 m at an angle. After four balls the shooters swap; then from the other side.',
      benodigdheden: ['Goal', '2 cones', 'Balls'],
      coachpunten: ['Move with small steps, sideways, do not cross your feet', 'Set in time: the shot comes quickly', 'Close range: stay low, hands beside your body'],
      variaties: {
        makkelijker: ['Shooter 2 controls it first', 'Shooter 2 further away'],
        moeilijker: ['Shooter 2 may also lay it back', 'Two shooters wide, shooter 1 chooses'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 22, lengte: 18 }),
      objecten: [goal, keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }), speler('a1', 9, 34.4, 12, { kijkrichting: -90 }), speler('a2', 10, 39.4, 6.4, { kijkrichting: -150 }), bal('bal', 34.4, 11.45, 'a1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'k1', naar: [35.4, 1.8], manier: 'zijwaarts', kijk: 90, start: 0.2, duur: 0.7 }),
        stap({ type: 'schot', van: 'a2', naar: [36.6, 0.4], hoogte: 'laag', afloop: 'vangt', direct: true }),
        pauze(1),
      ],
    },
  },

  // KS1. Keeperstennis
  {
    id: 'keeper-sp-keeperstennis',
    naam: 'Keeperstennis',
    categorieen: ['spelletjes'],
    uitleg:
      'Twee keepers, elk in een vak, met een "net" van lage hordes ertussen. Je gooit de bal over het net; hij moet in het vak van de ander stuiten. De ander vangt de bal na de stuit en gooit meteen terug. Stuit hij buiten het vak, valt hij in het net of vang je hem niet na één stuit, dan is het een punt voor de ander.',
    organisatie: 'Twee vakken van 5 × 5 m, met drie hordes ertussen als net. Spelen tot 7 punten, daarna wisselen van vak.',
    benodigdheden: ['3 hordes', '8 hoedjes', '1 bal'],
    spelersNodig: 0,
    keepersNodig: 2,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Gooi naar de plek waar de ander niet staat', 'Vang de bal na de stuit voor je lichaam', 'Snel terug in de basishouding na je worp'],
    variaties: {
      makkelijker: ['Grotere vakken', 'De bal mag twee keer stuiten'],
      moeilijker: ['Kleinere vakken', 'Alleen met je zwakke hand gooien'],
    },
    en: {
      naam: 'Keeper tennis',
      uitleg:
        'Two keepers, each in a box, with a "net" of low hurdles between them. You throw the ball over the net; it must bounce in the other player’s box. The other keeper catches the ball after the bounce and throws it straight back. If it bounces outside the box, hits the net or is not caught after one bounce, it is a point for the other keeper.',
      organisatie: 'Two 5 × 5 m boxes with three hurdles between them as a net. Play to 7 points, then change boxes.',
      benodigdheden: ['3 hurdles', '8 disc cones', '1 ball'],
      coachpunten: ['Throw to where the other keeper is not', 'Catch the ball after the bounce in front of your body', 'Back into the set position quickly after your throw'],
      variaties: {
        makkelijker: ['Bigger boxes', 'The ball may bounce twice'],
        moeilijker: ['Smaller boxes', 'Throw with your weaker hand only'],
      },
    },
    tekening: {
      ...leeg(14, 8),
      objecten: [
        zone('z1', 3.9, 4, 5, 5),
        zone('z2', 10.1, 4, 5, 5),
        horde('h1', 7, 2.4, 90),
        horde('h2', 7, 4, 90),
        horde('h3', 7, 5.6, 90),
        keeper('k1', 1, 3.2, 4, { kijkrichting: 0 }),
        keeper('k2', 2, 10.8, 4, { kijkrichting: 180 }),
        bal('bal', 3.75, 4, 'k1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'k1', naar: 'k2', worp: 'onderhands', hoogte: 1.8, stuitOp: [9.6, 5.2] }, { type: 'loop', wie: 'k2', naar: [10.4, 5.4], manier: 'zijwaarts', kijk: 180, start: 0.2, duur: 0.6 }),
        stap({ type: 'pass', van: 'k2', naar: 'k1', worp: 'onderhands', hoogte: 1.8, stuitOp: [4.6, 2.6] }, { type: 'loop', wie: 'k1', naar: [3.6, 2.6], manier: 'zijwaarts', kijk: 0, start: 0.2, duur: 0.6 }),
        stap({ type: 'pass', van: 'k1', naar: 'k2', worp: 'onderhands', hoogte: 1.8, stuitOp: [9.4, 2.6] }, { type: 'loop', wie: 'k2', naar: [10.4, 2.4], manier: 'zijwaarts', kijk: 180, start: 0.2, duur: 0.8 }),
        pauze(0.6),
      ],
    },
  },

  // KS2. Vier doeltjes, één keeper
  {
    id: 'keeper-sp-vier-doeltjes-een-keeper',
    naam: 'Vier doeltjes, één keeper',
    categorieen: ['spelletjes', 'reactie'],
    uitleg:
      'De keeper verdedigt vier mini-goaltjes die in een vierkant staan, met de openingen naar buiten. Twee schutters spelen de bal rond buiten het vierkant en schieten op een goaltje naar keuze. De keeper moet blijven bewegen, de bal volgen en kiezen welk goaltje hij afdekt. Na tien schoten wisselen.',
    organisatie: 'Vier mini-goaltjes in een vierkant van 5 × 5 m, met de openingen naar buiten. Twee schutters met ballen op 6 m van het vierkant. Tien schoten per keeper.',
    benodigdheden: ['4 mini-goaltjes', '4 hoedjes', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Blijf tussen de bal en het dichtstbijzijnde goaltje', 'Kleine snelle pasjes, nooit stilstaan', 'Op het moment van het schot: basishouding'],
    variaties: {
      makkelijker: ['Drie goaltjes', 'Schutters verder weg'],
      moeilijker: ['Drie schutters', 'Schieten in één keer'],
    },
    en: {
      naam: 'Four goals, one keeper',
      uitleg:
        'The keeper defends four mini goals standing in a square, facing outwards. Two shooters move the ball round outside the square and shoot at any goal. The keeper has to keep moving, follow the ball and choose which goal to cover. Swap after ten shots.',
      organisatie: 'Four mini goals in a 5 × 5 m square, facing outwards. Two shooters with balls 6 m from the square. Ten shots per keeper.',
      benodigdheden: ['4 mini goals', '4 disc cones', 'Balls'],
      coachpunten: ['Stay between the ball and the nearest goal', 'Small quick steps, never stand still', 'At the moment of the shot: set position'],
      variaties: {
        makkelijker: ['Three goals', 'Shooters further away'],
        moeilijker: ['Three shooters', 'First-time shots'],
      },
    },
    tekening: {
      ...leeg(20, 20),
      objecten: [
        doeltje('gN', 10, 7.5, 180, 2),
        doeltje('gS', 10, 12.5, 0, 2),
        doeltje('gW', 7.5, 10, 90, 2),
        doeltje('gE', 12.5, 10, -90, 2),
        keeper('k1', 1, 10, 15, { kijkrichting: 90 }),
        speler('a1', 9, 4, 17, { kijkrichting: -40 }),
        speler('a2', 10, 16.6, 15.4, { kijkrichting: -140 }),
        bal('bal', 4.45, 16.7, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'k1', naar: [14.4, 13.6], manier: 'zijwaarts', kijk: 45, start: 0.4 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [17, 11.4], duur: 0.8 }, { type: 'loop', wie: 'k1', naar: [14.8, 11.6], manier: 'voetenwerk', kijk: 0, start: 0.2 }),
        stap({ type: 'schot', van: 'a2', naar: 'k1', hoogte: 'grond', duikNaar: [14.8, 9.6] }),
        pauze(1),
      ],
    },
  },

  // KS3. Vangen om punten
  {
    id: 'keeper-sp-vangen-om-punten',
    naam: 'Vangen om punten',
    categorieen: ['spelletjes', 'bal-verwerken'],
    uitleg:
      'Twee keepers, om de beurt in het doel. De trainer schiet tien ballen. Een schone vangbal is twee punten, een bal die je klemt (tegen je lijf of de grond) één punt, en een bal die je loslaat nul. Wie heeft na tien ballen de meeste punten? De andere keeper telt mee en haalt de ballen terug.',
    organisatie: 'Keeper in het doel, de trainer op 9 m met ballen, de tweede keeper naast het doel. Na tien ballen wisselen.',
    benodigdheden: ['Goal', '10 ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Liever klemmen dan loslaten', 'Handen achter de bal, lichaam erachter', 'Na het vangen meteen tegen je borst'],
    variaties: {
      makkelijker: ['Rustiger schieten', 'Alleen op het lichaam'],
      moeilijker: ['Harder en naast de keeper', 'Loslaten kost een punt'],
    },
    en: {
      naam: 'Catching for points',
      uitleg:
        'Two keepers, taking turns in goal. The coach shoots ten balls. A clean catch is two points, a ball you clamp (against your body or the ground) one point, and a ball you drop zero. Who has the most points after ten balls? The other keeper keeps count and fetches the balls.',
      organisatie: 'Keeper in goal, the coach 9 m away with balls, the second keeper beside the goal. Swap after ten balls.',
      benodigdheden: ['Goal', '10 balls'],
      coachpunten: ['Better to clamp it than to drop it', 'Hands behind the ball, body behind it', 'After catching, straight to your chest'],
      variaties: {
        makkelijker: ['Calmer shots', 'Only at the body'],
        moeilijker: ['Harder and beside the keeper', 'Dropping it costs a point'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 22, lengte: 15 }),
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.6, { kijkrichting: 90 }),
        keeper('k2', 2, 40.6, 1.8, { kijkrichting: 150 }),
        trainer(34, 9.6, -90),
        bal('b1', 34, 9.05, 't1'),
        bal('b2', 35.2, 10.2),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 1.2, eindHoogte: 1.2 }),
        pauze(0.4),
        stap({ type: 'pass', van: 'k1', naar: 'k2', worp: 'onderhands', hoogte: 'grond' }),
        stap({ type: 'loop', wie: 't1', naar: [35.2, 9.4], duur: 0.6 }),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 'grond', duikNaar: [32.2, 2.2], bal: 'b2' }),
        pauze(0.8),
      ],
    },
  },

  // KS5. Penaltyduel tussen keepers
  {
    id: 'keeper-sp-penaltyduel',
    naam: 'Penaltyduel tussen keepers',
    categorieen: ['spelletjes'],
    uitleg:
      'Twee keepers nemen om de beurt een penalty op elkaar. De keeper in het doel probeert de aanloop te lezen en blijft zo lang mogelijk staan: wie te vroeg kiest, ligt verkeerd. Na elke penalty wisselen de keepers van rol. Wie na vijf penalty’s de meeste heeft gestopt, wint.',
    organisatie: 'Groot doel, bal op de penaltystip. Twee keepers; een derde keeper of de trainer haalt de ballen. Vijf penalty’s per keeper.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Blijf staan tot de voet de bal raakt', 'Kijk naar de heupen en het standbeen van de schutter', 'Dan explosief naar één kant, naar voren duiken'],
    variaties: {
      makkelijker: ['Penalty op 9 m', 'De schutter mag niet hard schieten'],
      moeilijker: ['De schutter mag stoppen in de aanloop', 'Na een redding nog een rebound'],
    },
    en: {
      naam: 'Penalty duel between keepers',
      uitleg:
        'Two keepers take turns to take a penalty against each other. The keeper in goal tries to read the run-up and stays up as long as possible: whoever chooses too early goes the wrong way. After every penalty the keepers swap roles. Whoever has saved the most after five penalties wins.',
      organisatie: 'Full-size goal, ball on the penalty spot. Two keepers; a third keeper or the coach fetches the balls. Five penalties per keeper.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Stay up until the foot strikes the ball', 'Watch the shooter’s hips and standing leg', 'Then explode to one side, diving forwards'],
      variaties: {
        makkelijker: ['Penalty from 9 m', 'The shooter may not shoot hard'],
        moeilijker: ['The shooter may stop during the run-up', 'After a save, a rebound as well'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 24, y: -3, breedte: 20, lengte: 19 }),
      objecten: [goal, keeper('k1', 1, 34, 0.9, { verdedigt: 'g1', kijkrichting: 90 }), keeper('k2', 2, 32.4, 13.4, { kijkrichting: -70 }), bal('bal', 34, 11)],
      animatie: [
        pauze(0.6),
        stap({ type: 'loop', wie: 'k2', naar: [33.6, 11.7], duur: 1 }),
        stap({ type: 'schot', van: 'k2', naar: [37, 0.4], worp: 'voet', hoogte: 'laag', afloop: 'vangt' }),
        pauze(1.2),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('keepers', oefeningen);
