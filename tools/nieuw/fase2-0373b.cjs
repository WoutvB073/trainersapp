// Fase 2, deel 3, batch 4 (0.37.3), deel b: keepers uit VOORSTEL-OEFENINGEN.md – hoog duiken KH1, KH3, KH4, KH5 en bal verwerken KB1–KB7.
// Draaien: node tools/nieuw/fase2-0373b.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, trainer, speler, bal, pion, pauze, stap, JO, OUD, MIDDEN } = require('./fase2-hulp.cjs');

const keeperVeld = (weergave) => ({ veld: { type: 'half' }, weergave, camera: 'schuin' });
const op = (wie = 'k1') => stap({ type: 'opstaan', wie });
const terug = (van = 'k1', naar = 't1') => stap({ type: 'pass', van, naar, worp: 'onderhands', hoogte: 'grond' });
const gooi = (naar, hoogte, extra = {}) => stap({ type: 'pass', van: 't1', naar, worp: 'onderhands', hoogte, ...extra });

const oefeningen = [
  // KH1. Hoge bal uit de hand van de trainer
  {
    id: 'keeper-hd-hoge-bal-uit-de-hand',
    naam: 'Hoge bal uit de hand van de trainer',
    categorieen: ['hoog-duiken'],
    uitleg:
      'De trainer staat schuin voor het doel en gooit de bal schuin omhoog naast de keeper. De keeper zet af met het been het dichtst bij de bal, gaat met beide handen naar de bal en vangt hem in de vlucht. Landen op de zij, de bal klemmen. Om de beurt naar links en rechts.',
    organisatie: 'Keeper in het midden van het doel, de trainer op 5 m met ballen. Vier ballen per kant, dan wisselen. Met meer keepers: om de beurt.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Afzetten met het dichtste been, het andere been zwaait mee omhoog', 'Handen voor je hoofd, je ziet de bal tot in je handen', 'Landen op je zij: eerst de bal, dan je schouder'],
    variaties: {
      makkelijker: ['Bal minder hoog en dichterbij', 'Duiken op een zachte mat'],
      moeilijker: ['Bal hoger en verder weg', 'De trainer schiet de bal uit de hand'],
    },
    en: {
      naam: 'High ball from the coach’s hands',
      uitleg:
        'The coach stands at an angle in front of the goal and throws the ball up at an angle beside the keeper. The keeper pushes off with the leg nearest the ball, goes to the ball with both hands and catches it in the air. Land on your side and clamp the ball. Left and right in turn.',
      organisatie: 'Keeper in the middle of the goal, the coach 5 m away with balls. Four balls per side, then swap. With more keepers: take turns.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Push off with the nearest leg, swing the other leg up with it', 'Hands in front of your head, watch the ball all the way into your hands', 'Land on your side: ball first, then your shoulder'],
      variaties: {
        makkelijker: ['Ball less high and closer', 'Dive onto a soft mat'],
        moeilijker: ['Ball higher and further away', 'The coach volleys the ball out of the hands'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 12 }),
      objecten: [goal, keeper('k1', 1, 34, 1.6, { kijkrichting: 90 }), trainer(35, 6.6, -90), bal('bal', 35, 6.05, 't1')],
      animatie: [
        pauze(0.5),
        gooi('k1', 2.6, { eindHoogte: 1.7, duikNaar: [31.8, 1.9], duikHoogte: 1.5 }),
        pauze(0.7),
        op(),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.6], start: 0.2 }),
        terug(),
        pauze(0.3),
        gooi('k1', 2.6, { eindHoogte: 1.7, duikNaar: [36.2, 1.9], duikHoogte: 1.5 }),
        pauze(0.7),
        op(),
        pauze(0.4),
      ],
    },
  },

  // KH3. Kruising of hoek
  {
    id: 'keeper-hd-kruising-of-hoek',
    naam: 'Kruising of hoek',
    categorieen: ['hoog-duiken', 'reactie'],
    uitleg:
      'De trainer roept "hoog" of "laag" op het moment dat hij schiet. De keeper beslist pas na het woord: bij "hoog" gaat de bal naar de kruising en tipt hij hem over of om; bij "laag" gaat hij laag naar de hoek. Wie al vóór het woord kiest, gaat vaak de verkeerde kant op. In het voorbeeld eerst hoog, dan laag.',
    organisatie: 'Keeper in het doel, de trainer op 11 m met ballen. Series van vier ballen, de trainer wisselt hoog en laag zonder vaste volgorde.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Wacht in je basishouding tot je het woord hoort', 'Hoog: afzetten en de bovenste hand naar de bal', 'Laag: onderste been opzij en laag over de grond'],
    variaties: {
      makkelijker: ['De trainer roept vóór het schot', 'Alleen naar één kant'],
      moeilijker: ['Ook "midden" (op het lichaam)', 'Twee ballen kort na elkaar'],
    },
    en: {
      naam: 'Top corner or bottom corner',
      uitleg:
        'The coach calls "high" or "low" as they shoot. The keeper only decides after hearing the word: on "high" the ball goes to the top corner and they tip it over or round; on "low" they go low into the corner. Whoever chooses before the word often goes the wrong way. In the example first high, then low.',
      organisatie: 'Keeper in goal, the coach 11 m away with balls. Sets of four balls, the coach mixes high and low in no fixed order.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Wait in your set position until you hear the word', 'High: push off and take the top hand to the ball', 'Low: bottom leg out to the side and low over the ground'],
      variaties: {
        makkelijker: ['The coach calls before the shot', 'Only to one side'],
        moeilijker: ['Also "middle" (at the body)', 'Two balls in quick succession'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -6, breedte: 18, lengte: 22 }),
      objecten: [goal, keeper('k1', 1, 34, 1.5, { kijkrichting: 90, verdedigt: 'g1' }), trainer(34.6, 11.4, -90), bal('b1', 34.6, 10.85, 't1'), bal('b2', 36, 12)],
      animatie: [
        pauze(0.6),
        stap({ type: 'schot', van: 't1', naar: [37.2, 0], worp: 'volley', hoogte: 3, eindHoogte: 2.3, afloop: 'tipt' }),
        pauze(1.6),
        op(),
        stap({ type: 'loop', wie: 't1', naar: [35.6, 11.6], duur: 0.6 }),
        stap({ type: 'schot', van: 't1', naar: [31, 0.3], hoogte: 'grond', afloop: 'vangt', bal: 'b2' }),
        pauze(1.2),
      ],
    },
  },

  // KH4. Tippen om de paal
  {
    id: 'keeper-hd-tippen-om-de-paal',
    naam: 'Tippen om de paal',
    categorieen: ['hoog-duiken'],
    uitleg:
      'De trainer schiet of gooit de bal richting de bovenhoek, vlak bij de paal. De keeper zet af, strekt zijn bovenste hand (de hand aan de kant van de bal) en tikt de bal met zijn vingers om de paal, naast het doel. Vangen lukt daar vaak niet; tippen is veiliger dan stompen omdat de bal dan achter de lijn gaat.',
    organisatie: 'Keeper in het doel, de trainer op 9 m met ballen, iets schuin. Drie ballen per kant.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Bovenste hand, met gestrekte vingers', 'Tik de bal mee in zijn richting, om de paal heen', 'Eerst een stap opzij als de bal ver weg is, dan afzetten'],
    variaties: {
      makkelijker: ['Uit de hand gooien', 'Dichter bij het midden van het doel'],
      moeilijker: ['Harder en dichter bij de paal', 'Na het tippen meteen een tweede bal (de corner)'],
    },
    en: {
      naam: 'Tipping round the post',
      uitleg:
        'The coach shoots or throws the ball towards the top corner, close to the post. The keeper pushes off, stretches the top hand (the hand on the ball side) and tips the ball round the post with the fingers, wide of the goal. Catching often fails there; tipping is safer than punching because the ball goes behind the line.',
      organisatie: 'Keeper in goal, the coach 9 m away with balls, slightly to one side. Three balls per side.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Top hand, with fingers stretched', 'Tip the ball on in its direction, round the post', 'First a step sideways if the ball is far away, then push off'],
      variaties: {
        makkelijker: ['Throw it from the hands', 'Closer to the middle of the goal'],
        moeilijker: ['Harder and closer to the post', 'After the tip, a second ball straight away (the corner)'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -6, breedte: 18, lengte: 20 }),
      objecten: [goal, keeper('k1', 1, 34, 1.5, { kijkrichting: 90, verdedigt: 'g1' }), trainer(33, 9.4, -90), bal('b1', 33, 8.85, 't1'), bal('b2', 34.4, 10)],
      animatie: [
        pauze(0.6),
        stap({ type: 'schot', van: 't1', naar: [37.3, 0], worp: 'volley', hoogte: 2.8, eindHoogte: 2.1, afloop: 'tipt', afloopNaar: [39.6, -1.6] }),
        pauze(1.6),
        op(),
        stap({ type: 'loop', wie: 't1', naar: [35, 9.6], duur: 0.8 }),
        stap({ type: 'schot', van: 't1', naar: [30.7, 0], worp: 'volley', hoogte: 2.8, eindHoogte: 2.1, afloop: 'tipt', afloopNaar: [28.4, -1.6], bal: 'b2' }),
        pauze(1.6),
      ],
    },
  },

  // KH5. Stap, stap, vlucht
  {
    id: 'keeper-hd-stap-stap-vlucht',
    naam: 'Stap, stap, vlucht',
    categorieen: ['hoog-duiken'],
    uitleg:
      'Naast de keeper staat een pion. Hij maakt twee snelle passen zijwaarts langs de pion en zet dan meteen af voor een hoge duik naar de bal die de trainer aangooit. Vangen in de vlucht en landen op de zij. Daarna terug naar het midden en de andere kant op.',
    organisatie: 'Keeper in het midden van het doel, aan elke kant een pion op 1 m. De trainer op 6 m met ballen. Drie ballen per kant.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Twee korte, snelle passen, voeten niet kruisen', 'Na de tweede pas meteen afzetten, niet eerst stilstaan', 'Handen naar de bal, landen op je zij'],
    variaties: {
      makkelijker: ['Eén pas en dan duiken', 'Bal lager'],
      moeilijker: ['Drie passen', 'Bal hoger en verder'],
    },
    en: {
      naam: 'Step, step, dive',
      uitleg:
        'Next to the keeper there is a cone. They take two quick steps sideways past the cone and then push off straight away for a high dive to the ball the coach throws. Catch it in the air and land on your side. Then back to the middle and the other way.',
      organisatie: 'Keeper in the middle of the goal, a cone 1 m to each side. The coach 6 m away with balls. Three balls per side.',
      benodigdheden: ['Goal', '2 cones', 'Balls'],
      coachpunten: ['Two short, quick steps, do not cross your feet', 'Push off straight after the second step, do not stop first', 'Hands to the ball, land on your side'],
      variaties: {
        makkelijker: ['One step and then dive', 'Ball lower'],
        moeilijker: ['Three steps', 'Ball higher and further'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 13 }),
      objecten: [goal, pion('p1', 32.9, 2.6), pion('p2', 35.1, 2.6), keeper('k1', 1, 34, 1.6, { kijkrichting: 90 }), trainer(34, 7.6, -90), bal('bal', 34, 7.05, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [32.4, 1.6], manier: 'zijwaarts', kijk: 90, duur: 0.55 }),
        gooi('k1', 2.4, { eindHoogte: 1.6, duikNaar: [30.4, 1.9], duikHoogte: 1.4 }),
        pauze(0.7),
        op(),
        stap({ type: 'loop', wie: 'k1', naar: [34, 1.6], start: 0.2 }),
        terug(),
        stap({ type: 'loop', wie: 'k1', naar: [35.6, 1.6], manier: 'zijwaarts', kijk: 90, duur: 0.55 }),
        gooi('k1', 2.4, { eindHoogte: 1.6, duikNaar: [37.6, 1.9], duikHoogte: 1.4 }),
        pauze(0.7),
        op(),
        pauze(0.4),
      ],
    },
  },

  // KB1. W-loop en vangen
  {
    id: 'keeper-bv-w-loop-vangen',
    naam: 'W-loop en vangen',
    categorieen: ['bal-verwerken'],
    uitleg:
      'De keeper loopt een W tussen de pionnen: schuin naar voren, schuin terug, weer naar voren en terug. Bij elke punt van de W gooit de trainer een bal, steeds op een andere hoogte: laag (oprapen), op de buik, op de borst en boven het hoofd. Vangen, terug gooien en door.',
    organisatie: 'Vier pionnen in een W vlak voor het doel (2 m diep, 1,5 m uit elkaar). De trainer op 8 m met een bal. Twee rondes, dan de andere kant op.',
    benodigdheden: ['Goal', '4 pionnen', 'Bal'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Kort voor de bal stilstaan, voeten breed', 'Lage bal: één knie naar de grond, handen eronder', 'Hoge bal: handen in een W, ellebogen licht gebogen'],
    variaties: {
      makkelijker: ['Eerst lopen, dan pas de bal', 'Alleen borst- en buikballen'],
      moeilijker: ['Hoger tempo', 'De trainer kiest zelf de hoogte'],
    },
    en: {
      naam: 'W-run and catching',
      uitleg:
        'The keeper runs a W between the cones: forwards at an angle, back at an angle, forwards again and back. At each point of the W the coach throws a ball, each time at a different height: low (scoop it up), at the stomach, at the chest and above the head. Catch it, throw it back and move on.',
      organisatie: 'Four cones in a W shape just in front of the goal (2 m deep, 1.5 m apart). The coach 8 m away with a ball. Two rounds, then the other way.',
      benodigdheden: ['Goal', '4 cones', 'Ball'],
      coachpunten: ['Stand still just before the ball arrives, feet apart', 'Low ball: one knee down, hands underneath', 'High ball: hands in a W, elbows slightly bent'],
      variaties: {
        makkelijker: ['Run first, then the ball', 'Only chest and stomach balls'],
        moeilijker: ['Faster pace', 'The coach chooses the height'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 14 }),
      objecten: [
        goal,
        pion('p1', 32.1, 4.6),
        pion('p2', 33.6, 1.6),
        pion('p3', 35.1, 4.6),
        pion('p4', 36.6, 1.6),
        keeper('k1', 1, 30.8, 1.8, { kijkrichting: 90 }),
        trainer(34, 10.6, -90),
        bal('bal', 34, 10.05, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'k1', naar: [32, 3.9], manier: 'voetenwerk', kijk: 90 }),
        gooi('k1', 'grond'),
        terug(),
        stap({ type: 'loop', wie: 'k1', naar: [33.6, 2.3], manier: 'voetenwerk', kijk: 90 }),
        gooi('k1', 0.9),
        terug(),
        stap({ type: 'loop', wie: 'k1', naar: [35.1, 3.9], manier: 'voetenwerk', kijk: 90 }),
        gooi('k1', 1.35),
        terug(),
        stap({ type: 'loop', wie: 'k1', naar: [36.6, 2.3], manier: 'voetenwerk', kijk: 90 }),
        gooi('k1', 2.1, { eindHoogte: 2 }),
        terug(),
        pauze(0.5),
      ],
    },
  },

  // KB2. Vangen na een draai
  {
    id: 'keeper-bv-vangen-na-draai',
    naam: 'Vangen na een draai',
    categorieen: ['bal-verwerken', 'reactie'],
    uitleg:
      'De keeper staat met zijn rug naar de trainer. Op het teken ("nu!") draait hij om, maar de trainer heeft de bal dan al gegooid. De keeper moet de bal snel zien, zijn voeten zetten en hem vangen: op het lichaam, op de borst of boven het hoofd. Terug gooien, weer omdraaien en de volgende.',
    organisatie: 'Keeper op 2 m voor het doel met zijn rug naar het veld, de trainer op 7 m met ballen. Series van vier ballen op verschillende hoogtes.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Draai snel, en zoek meteen de bal', 'Eerst de voeten neerzetten, dan vangen', 'Vangen met je handen voor je lichaam, niet ernaast'],
    variaties: {
      makkelijker: ['De trainer gooit pas na de draai', 'Alleen borstballen'],
      moeilijker: ['Ballen naast de keeper: stap of duik', 'Draaien over beide schouders, de trainer roept welke'],
    },
    en: {
      naam: 'Catching after turning',
      uitleg:
        'The keeper stands with their back to the coach. On the signal ("now!") they turn round, but the coach has already thrown the ball. The keeper has to pick up the ball quickly, set their feet and catch it: at the body, the chest or above the head. Throw it back, turn away again and the next one.',
      organisatie: 'Keeper 2 m in front of the goal with their back to the pitch, the coach 7 m away with balls. Sets of four balls at different heights.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Turn quickly and find the ball straight away', 'Set your feet first, then catch', 'Catch with your hands in front of your body, not beside it'],
      variaties: {
        makkelijker: ['The coach only throws after the turn', 'Only chest-height balls'],
        moeilijker: ['Balls beside the keeper: step or dive', 'Turn over either shoulder, the coach calls which'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 14 }),
      objecten: [goal, keeper('k1', 1, 34, 2.4, { kijkrichting: -90 }), trainer(34, 9.4, -90), bal('bal', 34, 8.85, 't1')],
      animatie: [
        pauze(0.6),
        stap({ type: 'draai', wie: 'k1', kijk: 90, start: 0.15 }, gooi('k1', 1.4).acties[0]),
        terug(),
        stap({ type: 'draai', wie: 'k1', kijk: -90 }),
        stap({ type: 'draai', wie: 'k1', kijk: 90, start: 0.15 }, gooi('k1', 2, { eindHoogte: 1.9 }).acties[0]),
        terug(),
        pauze(0.4),
      ],
    },
  },

  // KB3. Natte bal: klemmen tegen de borst
  {
    id: 'keeper-bv-klemmen-tegen-de-borst',
    naam: 'Natte bal: klemmen tegen de borst',
    categorieen: ['bal-verwerken'],
    uitleg:
      'Bij een harde of natte bal op het lichaam lukt schoon vangen niet altijd. Dan zet je je borst erachter: de bal komt tegen je borst of buik, en je klemt hem met je armen en handen tegen je aan, zodat hij niet terug het veld in stuitert. De trainer schiet hard recht op de keeper, op buik- en borsthoogte.',
    organisatie: 'Keeper in het doel, de trainer op 9 m met ballen (maak ze eventueel nat). Series van zes ballen.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Je lichaam achter de bal, niet opzij stappen', 'Ellebogen bij elkaar, de bal tegen je borst klemmen', 'Licht voorover, zodat de bal niet terugkaatst'],
    variaties: {
      makkelijker: ['Minder hard', 'Eerst uit de hand gooien'],
      moeilijker: ['Harder en van dichterbij', 'Na het klemmen meteen uitgooien'],
    },
    en: {
      naam: 'Wet ball: clamping it to the chest',
      uitleg:
        'With a hard or wet ball at the body, a clean catch does not always work. Then you get your chest behind it: the ball hits your chest or stomach and you clamp it against you with your arms and hands, so it does not bounce back into play. The coach shoots hard straight at the keeper, at stomach and chest height.',
      organisatie: 'Keeper in goal, the coach 9 m away with balls (wet them if you like). Sets of six balls.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Your body behind the ball, do not step aside', 'Elbows together, clamp the ball to your chest', 'Lean forward slightly so the ball does not rebound'],
      variaties: {
        makkelijker: ['Less hard', 'Throw it from the hands first'],
        moeilijker: ['Harder and from closer in', 'Distribute straight after clamping'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 15 }),
      objecten: [goal, keeper('k1', 1, 34, 1.6, { kijkrichting: 90 }), trainer(34, 9.6, -90), bal('bal', 34, 9.05, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'schot', van: 't1', naar: 'k1', worp: 'volley', hoogte: 1.2, eindHoogte: 1.1 }),
        pauze(0.4),
        terug(),
        stap({ type: 'schot', van: 't1', naar: 'k1', hoogte: 1, eindHoogte: 1.3 }),
        pauze(0.6),
      ],
    },
  },

  // KB4. Stuitbal voor de keeper
  {
    id: 'keeper-bv-stuitbal-opscheppen',
    naam: 'Stuitbal voor de keeper',
    categorieen: ['bal-verwerken'],
    uitleg:
      'De trainer gooit de bal zo dat hij vlak voor de keeper stuit. De keeper gaat met één knie naar de grond, achter de bal, en schept de bal met twee handen van onderen op, tegen zijn borst. Zo kan een verspringende bal niet onder hem door. Daarna de bal terug en de volgende.',
    organisatie: 'Keeper in het doel, de trainer op 6 m met ballen. Series van zes: recht op de keeper en een stukje opzij.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Knie naar de grond, net achter de plek waar de bal stuit', 'Handen naast elkaar onder de bal, pinken tegen elkaar', 'Schep de bal op naar je borst'],
    variaties: {
      makkelijker: ['Rustiger gooien', 'Eerst zonder stuit'],
      moeilijker: ['Bal een stukje opzij: eerst een stap', 'Schieten in plaats van gooien'],
    },
    en: {
      naam: 'Bouncing ball in front of the keeper',
      uitleg:
        'The coach throws the ball so that it bounces just in front of the keeper. The keeper goes down on one knee behind the ball and scoops it up from underneath with both hands, into the chest. That way a ball that changes direction cannot go under them. Then the ball back and the next one.',
      organisatie: 'Keeper in goal, the coach 6 m away with balls. Sets of six: straight at the keeper and a little to one side.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Knee to the ground, just behind where the ball bounces', 'Hands side by side under the ball, little fingers together', 'Scoop the ball up into your chest'],
      variaties: {
        makkelijker: ['Throw more gently', 'Without a bounce first'],
        moeilijker: ['Ball a little to one side: take a step first', 'Kick instead of throw'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 26, y: -3, breedte: 16, lengte: 12 }),
      objecten: [goal, keeper('k1', 1, 34, 1.8, { kijkrichting: 90 }), trainer(34, 7.4, -90), bal('bal', 34, 6.85, 't1')],
      animatie: [
        pauze(0.5),
        gooi('k1', 1.4, { worp: 'bovenhands', stuitOp: [34, 3], vangHoogte: 0.35 }),
        pauze(0.5),
        terug(),
        stap({ type: 'loop', wie: 'k1', naar: [35, 1.9], manier: 'zijwaarts', kijk: 90, duur: 0.5 }),
        gooi('k1', 1.4, { worp: 'bovenhands', stuitOp: [35.2, 3.1], vangHoogte: 0.35 }),
        pauze(0.6),
      ],
    },
  },

  // KB5. Vangen met een stoorzender
  {
    id: 'keeper-bv-stoorzender',
    naam: 'Vangen met een stoorzender',
    categorieen: ['bal-verwerken', 'reactie'],
    uitleg:
      'Een speler loopt vlak voor de keeper langs op het moment dat de trainer schiet. Zo ziet de keeper de bal even niet. Blijf door de speler heen naar de bal kijken, blijf in je basishouding staan en verwerk de bal pas als je hem ziet: vangen, of als dat niet lukt, klemmen of wegtikken.',
    organisatie: 'Keeper in het doel, de trainer op 11 m. Een speler loopt op 4 m voor het doel van de ene paal naar de andere, precies als de trainer schiet. Series van vier, dan wisselt de speler van kant.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 1,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Niet meebewegen met de speler, maar met de bal', 'Laat in je basishouding, gewicht naar voren', 'Twijfel je? Dan wegtikken in plaats van vangen'],
    variaties: {
      makkelijker: ['De speler loopt eerder langs', 'Rustiger schot'],
      moeilijker: ['Twee spelers die kruisen', 'De speler laat de bal soms ook door zijn benen gaan'],
    },
    en: {
      naam: 'Catching with someone blocking the view',
      uitleg:
        'A player runs across just in front of the keeper as the coach shoots. For a moment the keeper cannot see the ball. Keep looking through the player to the ball, stay in your set position and only deal with the ball once you see it: catch it, or if that does not work, clamp it or tip it away.',
      organisatie: 'Keeper in goal, the coach 11 m away. A player runs across 4 m in front of the goal from one post to the other, just as the coach shoots. Sets of four, then the player changes side.',
      benodigdheden: ['Goal', '2 cones', 'Balls'],
      coachpunten: ['Do not move with the player, move with the ball', 'Stay in your set position, weight forward', 'Not sure? Tip it away instead of catching'],
      variaties: {
        makkelijker: ['The player runs across earlier', 'Calmer shot'],
        moeilijker: ['Two players crossing', 'Sometimes the player lets the ball go through their legs too'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 25, y: -3, breedte: 18, lengte: 17 }),
      objecten: [
        goal,
        pion('p1', 29.6, 4.4),
        pion('p2', 38.4, 4.4),
        keeper('k1', 1, 34, 1.6, { kijkrichting: 90, verdedigt: 'g1' }),
        speler('a1', 4, 29.6, 5.6, { kijkrichting: 0 }),
        trainer(34.8, 11.6, -90),
        bal('bal', 34.8, 11.05, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'a1', naar: [38.6, 5.4], manier: 'sprint', duur: 1.4 }, { type: 'schot', van: 't1', naar: [33.4, 0.4], hoogte: 'laag', afloop: 'vangt', vasthouden: true, start: 0.8 }),
        pauze(0.4),
        terug(),
        pauze(1),
      ],
    },
  },

  // KB6. Tien ballen, tien keer vangen
  {
    id: 'keeper-bv-tien-ballen',
    naam: 'Tien ballen, tien keer vangen',
    categorieen: ['bal-verwerken', 'spelletjes'],
    uitleg:
      'Twee keepers staan naast elkaar, een paar meter uit elkaar. De trainer gooit om de beurt een bal naar de een en de ander, op verschillende hoogtes. Elke bal die je in één keer schoon vangt, zonder hem los te laten, telt. Hoeveel van de tien ballen vangen jullie samen? Kunnen jullie het record verbeteren?',
    organisatie: 'Twee keepers op 3 m van elkaar, de trainer op 6 m met ballen (of twee ballen die terug worden gegooid). Rondes van tien ballen per keeper.',
    benodigdheden: ['4 pionnen', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 2,
    leeftijden: ['jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Handen in een W, duimen bijna tegen elkaar', 'Kijk de bal in je handen', 'Na het vangen: de bal tegen je borst'],
    variaties: {
      makkelijker: ['Alleen borstballen', 'Dichterbij'],
      moeilijker: ['Ballen naast de keeper', 'Harder gooien'],
    },
    en: {
      naam: 'Ten balls, ten catches',
      uitleg:
        'Two keepers stand side by side, a few metres apart. The coach throws a ball to one and then the other, at different heights. Every ball you catch cleanly first time, without dropping it, counts. How many of the ten balls do you catch together? Can you beat your record?',
      organisatie: 'Two keepers 3 m apart, the coach 6 m away with balls (or two balls that are thrown back). Rounds of ten balls per keeper.',
      benodigdheden: ['4 cones', 'Balls'],
      coachpunten: ['Hands in a W, thumbs almost touching', 'Watch the ball into your hands', 'After catching: ball to your chest'],
      variaties: {
        makkelijker: ['Only chest-height balls', 'Closer'],
        moeilijker: ['Balls beside the keeper', 'Throw harder'],
      },
    },
    tekening: {
      veld: { type: 'leeg', breedte: 12, lengte: 11 },
      camera: 'schuin',
      objecten: [
        pion('p1', 3.2, 2.4),
        pion('p2', 4.8, 2.4),
        pion('p3', 7.2, 2.4),
        pion('p4', 8.8, 2.4),
        keeper('k1', 1, 4, 3, { kijkrichting: 90 }),
        keeper('k2', 2, 8, 3, { kijkrichting: 90 }),
        trainer(6, 9, -90),
        bal('bal', 6, 8.45, 't1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1.4 }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands', hoogte: 1.2 }),
        stap({ type: 'pass', van: 't1', naar: 'k2', worp: 'onderhands', hoogte: 1.8, eindHoogte: 1.7 }),
        stap({ type: 'pass', van: 'k2', naar: 't1', worp: 'onderhands', hoogte: 1.2 }),
        stap({ type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 0.9 }),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'onderhands', hoogte: 1.2 }),
        pauze(0.5),
      ],
    },
  },

  // KB7. Bal uit de lucht na een lob
  {
    id: 'keeper-bv-lob-achteruit',
    naam: 'Bal uit de lucht na een lob',
    categorieen: ['bal-verwerken', 'voorzetten'],
    uitleg:
      'De keeper staat een paar meter voor zijn doel. De trainer lobt de bal met een hoge boog over hem heen. De keeper draait half open en gaat met kleine passen achteruit (niet achterstevoren rennen), zet af en vangt de bal boven zijn hoofd, voor de doellijn. Lukt vangen niet meer, dan tikt hij hem over de lat.',
    organisatie: 'Keeper op 5 m voor het doel, de trainer op 16 m met ballen. Series van vier lobs, ook eens een stukje opzij.',
    benodigdheden: ['Goal', 'Ballen'],
    spelersNodig: 0,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Half open draaien en met kleine passen terug', 'Blijf de bal zien, niet het doel', 'Vangen op het hoogste punt, voor de lijn'],
    variaties: {
      makkelijker: ['Keeper dichter bij het doel', 'Lob uit de hand gooien'],
      moeilijker: ['Keeper verder voor het doel', 'Lob in de hoek: tippen'],
    },
    en: {
      naam: 'Catching a lob',
      uitleg:
        'The keeper stands a few metres in front of goal. The coach lobs the ball over them with a high arc. The keeper turns half open and moves back with small steps (not running backwards), pushes off and catches the ball above the head, in front of the goal line. If catching is no longer possible, they tip it over the bar.',
      organisatie: 'Keeper 5 m in front of the goal, the coach 16 m away with balls. Sets of four lobs, sometimes a little to the side.',
      benodigdheden: ['Goal', 'Balls'],
      coachpunten: ['Turn half open and move back with small steps', 'Keep your eye on the ball, not the goal', 'Catch at the highest point, in front of the line'],
      variaties: {
        makkelijker: ['Keeper closer to the goal', 'Throw the lob from the hands'],
        moeilijker: ['Keeper further out', 'Lob into the corner: tip it'],
      },
    },
    tekening: {
      ...keeperVeld({ x: 24, y: -6, breedte: 20, lengte: 26 }),
      objecten: [goal, keeper('k1', 1, 34, 5, { kijkrichting: 90 }), trainer(34.6, 16.4, -90), bal('bal', 34.6, 15.85, 't1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'k1', hoogte: 5.5, eindHoogte: 2.3 }, { type: 'loop', wie: 'k1', naar: [34.3, 1.9], manier: 'achteruit', start: 0.25, duur: 1.4 }),
        pauze(0.6),
        stap({ type: 'pass', van: 'k1', naar: 't1', worp: 'bovenhands', hoogte: 2 }),
        pauze(0.4),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('keepers', oefeningen);
