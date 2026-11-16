// Fase 2, deel 3, batch 2 (0.37.1), deel e: Verdedigen en omschakelen V5, V6, V7, V10, V11, V12 uit VOORSTEL-OEFENINGEN.md.
// Overgeslagen (vrijwel gelijk aan een bestaande oefening): V2 (veld-vo-drie-verdedigers), V3 (veld-af-onder-druk), V4 (veld-pv-3-2-omschakeling),
// V8 (veld-vo-pressen-na-balverlies), V9 (veld-pv-2-1-inhalende-verdediger). Draaien: node tools/nieuw/fase2-0371e.cjs
const { zet } = require('./hulp.cjs');
const { keeper, speler, trainer, bal, pion, hoedje, pauze, stap, B, zone, leeg, doeltje, ring, JO, OUD, MIDDEN, KLEUR } = require('./fase2-hulp.cjs');
const jeugdgoal = (id, x, y, hoek = 0) => ({ id, soort: 'goal', x, y, breedte: 5, hoogte: 2, ...(hoek ? { hoek } : {}) });
const pionHoogKleur = (id, x, y) => ({ id, soort: 'pion', x, y, hoogte: 0.7, kleur: KLEUR.geel });

const oefeningen = [
  // V5. Onderscheppen in de passlijn
  {
    id: 'veld-vo-onderscheppen-passlijn',
    naam: 'Onderscheppen in de passlijn',
    categorieen: ['verdedigen-omschakelen'],
    uitleg:
      'Twee passers spelen de bal naar elkaar; een verdediger staat schuin tussen hen in. Hij leest de pass, stapt er op het goede moment voor en speelt de bal in één keer in het doeltje. Lukt het niet, dan zet hij zich opnieuw neer voor de volgende pass. Na vijf pogingen wisselt de verdediger.',
    organisatie: 'Passers op 12 m van elkaar, de verdediger 3 m opzij van de passlijn. Een klein doeltje op 10 m achter de verdediger. Drie spelers, één bal; om de beurt verdediger.',
    benodigdheden: ['1 klein doeltje', '4 hoedjes', 'Ballen'],
    spelersNodig: 3,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Kijk naar de heupen en de voet van de passer, dan zie je waar de bal heen gaat', 'Wacht op het moment van de pass, stap dan pas in', 'Onderschep met de voet die het dichtst bij het doeltje is'],
    variaties: {
      makkelijker: ['Verdediger staat dichter bij de passlijn', 'Passers spelen zachter'],
      moeilijker: ['De passers mogen een schijnpass maken', 'Twee doeltjes: het doeltje aan de kant van de bal'],
    },
    en: {
      naam: 'Intercepting in the passing lane',
      uitleg:
        'Two passers play the ball to each other; a defender stands to the side between them. They read the pass, step in front at the right moment and play the ball first time into the mini goal. If it does not work, they reset for the next pass. After five attempts, change the defender.',
      organisatie: 'Passers 12 m apart, the defender 3 m to the side of the passing line. A mini goal 10 m behind the defender. Three players, one ball; take turns as defender.',
      benodigdheden: ['1 mini goal', '4 disc cones', 'Balls'],
      coachpunten: ['Watch the passer’s hips and foot to see where the ball is going', 'Wait for the moment of the pass, then step in', 'Intercept with the foot closest to the mini goal'],
      variaties: {
        makkelijker: ['Defender stands closer to the passing line', 'Passers pass more softly'],
        moeilijker: ['The passers may fake a pass', 'Two mini goals: score in the one on the side of the ball'],
      },
    },
    tekening: {
      ...leeg(16, 16),
      objecten: [hoedje('h1', 2, 4.6), hoedje('h2', 14, 4.6), doeltje('g1', 8, 15, 180), speler('a1', 1, 2, 3.6, { kijkrichting: 0 }), speler('a2', 2, 14, 3.6, { kijkrichting: 180 }), B('d', 3, 8.4, 7, { kijkrichting: -90 }), bal('bal', 2.55, 3.6, 'a1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'd', naar: [9, 5.8], start: 0.3, duur: 0.6 }),
        stap({ type: 'loop', wie: 'd', naar: [7.6, 7], duur: 0.8 }),
        // De verdediger leest de pass en stapt ervoor.
        stap({ type: 'pass', van: 'a2', naar: 'a1', onderschept: 'd' }),
        stap({ type: 'schot', van: 'd', naar: [8.3, 14.8], direct: true }),
        pauze(0.8),
      ],
    },
  },

  // V6. De sliding en het blok
  {
    id: 'veld-vo-sliding-blok',
    naam: 'De sliding en het blok',
    categorieen: ['verdedigen-omschakelen', 'een-tegen-een'],
    uitleg:
      'De aanvaller dribbelt naar het doeltje en schiet. De verdediger komt van opzij en blokkeert het schot met een sliding: laag, met je been gestrekt naar de bal en je voet stevig. Daarna de andere kant op. Oefen dit op een zachte ondergrond (gras) en zonder noppen tegen de bal aan.',
    organisatie: 'Vak van 15 × 12 m met een klein doeltje. Tweetallen: de aanvaller dribbelt vanaf 12 m, de verdediger start 4 m opzij. Eerst in wandeltempo, dan op snelheid. Na 4 keer wisselen.',
    benodigdheden: ['1 klein doeltje', '4 hoedjes', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Sliding pas als het schot komt, niet eerder', 'Laag over de grond glijden met het been dat het dichtst bij de bal is', 'Blijf op de bal gericht, nooit op de enkels van de aanvaller'],
    variaties: {
      makkelijker: ['Blokkeren in stand: stap in de baan van de bal en houd je voet stevig', 'Aanvaller schiet zacht'],
      moeilijker: ['Aanvaller mag een schijnschot maken', 'Verdediger start verder weg', 'Na de blok meteen de bal veroveren en wegdribbelen'],
    },
    en: {
      naam: 'Slide and block',
      uitleg:
        'The attacker dribbles towards the mini goal and shoots. The defender comes from the side and blocks the shot with a slide: low, leg stretched towards the ball and foot firm. Then the other way round. Practise this on a soft surface (grass) and never studs-up into the ball.',
      organisatie: '15 × 12 m area with a mini goal. Pairs: the attacker dribbles from 12 m, the defender starts 4 m to the side. Walking pace first, then at speed. Swap after 4 goes.',
      benodigdheden: ['1 mini goal', '4 disc cones', 'Balls'],
      coachpunten: ['Only slide as the shot comes, not before', 'Slide low along the ground with the leg nearest the ball', 'Always go for the ball, never the attacker’s ankles'],
      variaties: {
        makkelijker: ['Block standing up: step into the ball’s path and keep your foot firm', 'Attacker shoots softly'],
        moeilijker: ['The attacker may fake a shot', 'Defender starts further away', 'After the block, win the ball and dribble away'],
      },
    },
    tekening: {
      ...leeg(15, 14),
      objecten: [doeltje('g1', 7.5, 1, 0), hoedje('h1', 1, 13), hoedje('h2', 14, 13), speler('a1', 1, 6, 12, { kijkrichting: -90 }), B('d', 2, 11, 9.6, { kijkrichting: 180 }), bal('bal', 6, 11.45, 'a1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [6.6, 7.6] }, { type: 'loop', wie: 'd', naar: [8.6, 6.4], manier: 'sprint', start: 0.2 }),
        stap({ type: 'schot', van: 'a1', naar: [7.4, 0.8], hoogte: 'grond', blokt: 'd', blokSoort: 'voeten', afloopNaar: [11.6, 5] }),
        pauze(1),
      ],
    },
  },

  // V7. Druk zetten op de terugspeelbal
  {
    id: 'veld-vo-druk-terugspeelbal',
    naam: 'Druk zetten op de terugspeelbal',
    categorieen: ['verdedigen-omschakelen'],
    uitleg:
      'Het rode team bouwt op vanaf de keeper; blauw wacht rustig af. Het sein voor blauw is de pass naar achteren: speelt een middenvelder de bal terug naar een verdediger, dan sprint de spits van blauw er meteen op af, schuin, zodat de pass terug naar de keeper dicht is. De anderen van blauw schuiven mee en zetten hun man vast. Wint blauw de bal, dan scoren ze op het doel.',
    organisatie: 'Op een half veld van 36 × 30 m met een jeugdgoal en keeper. Rood: keeper, drie verdedigers en een middenvelder. Blauw: vier spelers. Na 5 aanvallen wisselen de rollen.',
    benodigdheden: ['Jeugdgoal', '6 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 8,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: vijf tegen vijf met twee middenvelders, of rood mag uitspelen op twee doeltjes op de middenlijn.',
    coachpunten: ['Wacht op het sein: de pass naar achteren, niet eerder', 'Spits: loop schuin aan, zodat de keeper uit beeld is', 'Iedereen tegelijk: als één schuift, schuift het hele team'],
    variaties: {
      makkelijker: ['Rood speelt in wandeltempo', 'Rood heeft één speler minder'],
      moeilijker: ['Rood mag ook lang spelen naar een doelspeler', 'Blauw moet binnen 6 seconden scoren'],
    },
    en: {
      naam: 'Pressing the back pass',
      uitleg:
        'The red team builds up from the keeper; blue waits patiently. Blue’s trigger is the backward pass: when a midfielder plays the ball back to a defender, blue’s striker sprints at them straight away, at an angle, so the pass back to the keeper is closed. The rest of blue push up and lock onto their player. If blue wins the ball, they score on the goal.',
      organisatie: 'On half a pitch, 36 × 30 m, with a youth goal and keeper. Red: keeper, three defenders and a midfielder. Blue: four players. Swap roles after 5 attacks.',
      benodigdheden: ['Youth goal', '6 cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: five against five with two midfielders, or red may score on two mini goals on the halfway line.',
      coachpunten: ['Wait for the trigger: the backward pass, not before', 'Striker: press at an angle so the keeper is shut out', 'All together: when one moves, the whole team moves'],
      variaties: {
        makkelijker: ['Red plays at walking pace', 'Red has one player fewer'],
        moeilijker: ['Red may also play long to a target player', 'Blue must score within 6 seconds'],
      },
    },
    tekening: {
      ...leeg(36, 32),
      objecten: [
        zone('z', 18, 16, 36, 30),
        jeugdgoal('g1', 18, 31, 180),
        keeper('k1', 1, 18, 29.8, { verdedigt: 'g1', kijkrichting: -90 }),
        speler('a4', 4, 9, 25, { kijkrichting: -60 }),
        speler('a3', 3, 18, 26, { kijkrichting: -90 }),
        speler('a2', 2, 29.6, 26, { kijkrichting: -150 }),
        speler('a6', 6, 20, 16, { kijkrichting: 90 }),
        B('b9', 9, 18, 13, { kijkrichting: 90 }),
        B('b7', 7, 8, 12, { kijkrichting: 90 }),
        B('b11', 11, 28, 12, { kijkrichting: 90 }),
        B('b10', 10, 23, 8, { kijkrichting: 90 }),
        bal('bal', 19.6, 16.4, 'a6'),
      ],
      animatie: [
        pauze(0.6),
        // Het sein: terugspelen naar de centrale verdediger.
        stap({ type: 'pass', van: 'a6', naar: 'a3' }, { type: 'loop', wie: 'b9', via: [[16.4, 18]], naar: [16.2, 23.4], manier: 'sprint', start: 0.25 }, { type: 'loop', wie: 'b10', naar: [21.6, 14.6], start: 0.4 }),
        stap(
          { type: 'dribbel', wie: 'a3', naar: [19.4, 25.6], duur: 0.8 },
          { type: 'loop', wie: 'b7', naar: [10.6, 21.4], manier: 'sprint' },
          { type: 'loop', wie: 'b11', naar: [25.2, 21.6], manier: 'sprint' },
          { type: 'loop', wie: 'b9', naar: [17.4, 24.2], duur: 0.8 },
        ),
        // Geen kant op: de pass naar de buitenkant wordt onderschept.
        stap({ type: 'pass', van: 'a3', naar: 'a2', onderschept: 'b11' }),
        stap({ type: 'dribbel', wie: 'b11', naar: [22.6, 25.8], manier: 'sprint' }, { type: 'loop', wie: 'b9', naar: [14.6, 26.6], manier: 'sprint' }),
        stap({ type: 'schot', van: 'b11', naar: [16.6, 31.2], hoogte: 'laag', afloop: 'goal' }),
        pauze(0.8),
      ],
    },
  },

  // V10. Duel in de lucht
  {
    id: 'veld-vo-duel-in-de-lucht',
    naam: 'Duel in de lucht',
    categorieen: ['verdedigen-omschakelen', 'een-tegen-een'],
    uitleg:
      'De trainer gooit de bal hoog tussen twee spelers in. Beide springen om de bal; wie hem raakt, kopt hem naar zijn eigen maatje. Lukt dat, dan is het een punt. Spring vanaf één been, gebruik je armen om hoog te komen (niet om te duwen) en kop de bal met je voorhoofd.',
    organisatie: 'Twee tweetallen, de koppers in het midden, hun maatjes op 8 m aan elke kant. De trainer gooit vanaf 6 m. Na 6 ballen wisselen de koppers met hun maatjes. Vanaf JO17; zachte bal voor wie het nog leert.',
    benodigdheden: ['Ballen', '4 hoedjes', 'Hesjes'],
    spelersNodig: 4,
    keepersNodig: 0,
    leeftijden: ['jo16-19'],
    doorwisselbaar: true,
    coachpunten: ['Neem een aanloopje en spring vanaf één been', 'Armen omhoog voor je balans, niet tegen de tegenstander', 'Ogen open en kop door de bal heen naar je maatje'],
    variaties: {
      makkelijker: ['Eerst zonder tegenstander koppen', 'Lagere worp'],
      moeilijker: ['Kop de bal in een doeltje', 'Bal van opzij, als een voorzet'],
    },
    en: {
      naam: 'Aerial duel',
      uitleg:
        'The coach throws the ball high between two players. Both jump for the ball; whoever wins it heads it to their own partner. If that works, it is a point. Take off from one leg, use your arms to get up (not to push) and head the ball with your forehead.',
      organisatie: 'Two pairs: the headers in the middle, their partners 8 m away on each side. The coach throws from 6 m. After 6 balls the headers swap with their partners. From U17; use a soft ball for players who are still learning.',
      benodigdheden: ['Balls', '4 disc cones', 'Bibs'],
      coachpunten: ['Take a short run-up and jump off one leg', 'Arms up for balance, not against your opponent', 'Eyes open and head through the ball to your partner'],
      variaties: {
        makkelijker: ['Head without an opponent first', 'Lower throw'],
        moeilijker: ['Head the ball into a mini goal', 'Ball from the side, like a cross'],
      },
    },
    tekening: {
      ...leeg(20, 14),
      objecten: [
        trainer(10, 12.4, -90),
        bal('b1', 10, 11.85, 't1'),
        bal('b2', 11, 12.8),
        speler('a1', 1, 9, 5.2, { kijkrichting: 60 }),
        B('b1s', 2, 11, 5.2, { kijkrichting: 120 }),
        speler('a2', 3, 2, 4, { kijkrichting: 0 }),
        B('b2s', 4, 18, 4, { kijkrichting: 180 }),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 't1', naar: 'a1', worp: 'bovenhands', hoogte: 'hoog', eindHoogte: 2.3 }, { type: 'springen', wie: 'b1s', start: 0.9 }),
        stap({ type: 'pass', van: 'a1', naar: 'a2', direct: true, hoogte: 'laag', eindHoogte: 0.6 }),
        stap({ type: 'pak', wie: 't1', bal: 'b2' }, { type: 'loop', wie: 'a1', naar: [9.1, 6], duur: 0.8 }, { type: 'loop', wie: 'b1s', naar: [10.9, 6], duur: 0.8 }),
        stap({ type: 'pass', van: 't1', naar: 'b1s', worp: 'bovenhands', hoogte: 'hoog', eindHoogte: 2.3 }, { type: 'springen', wie: 'a1', start: 0.9 }),
        stap({ type: 'pass', van: 'b1s', naar: 'b2s', direct: true, hoogte: 'laag', eindHoogte: 0.6 }),
        pauze(0.8),
      ],
    },
  },

  // V11. Bewaker van de schat (O7 en JO8–11)
  {
    id: 'veld-vo-bewaker-schat',
    naam: 'Bewaker van de schat',
    categorieen: ['verdedigen-omschakelen', 'een-tegen-een'],
    uitleg:
      'In een hoepel staat een hoge pion: dat is de schat. Jij bent de bewaker. De aanvaller dribbelt om de hoepel heen en probeert de pion om te schieten. Blijf altijd tussen de bal en de pion. Valt de pion om, dan wissel je van rol.',
    organisatie: 'Vak van 10 × 10 m met in het midden een hoepel met een hoge pion. Tweetallen, de aanvaller met bal. Niemand mag in de hoepel komen. Rondes van 45 seconden.',
    benodigdheden: ['1 hoepel', '1 hoge pion', '4 hoedjes', '1 voetbal per tweetal'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: ['mini-5-7', 'jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Kijk naar de bal, niet naar de voeten van de ander', 'Kleine pasjes opzij, blijf tussen bal en schat', 'Laag door je knieën, dan kun je snel bewegen'],
    variaties: {
      makkelijker: ['Grotere hoepel, zodat de bewaker dichterbij kan staan', 'Aanvaller mag alleen zacht schieten'],
      moeilijker: ['Twee pionnen in twee hoepels', 'Twee aanvallers tegen één bewaker'],
    },
    en: {
      naam: 'Guard the treasure',
      uitleg:
        'There is a tall cone in a hoop: that is the treasure. You are the guard. The attacker dribbles round the hoop and tries to knock the cone over with a shot. Always stay between the ball and the cone. If the cone falls, swap roles.',
      organisatie: '10 × 10 m area with a hoop and a tall cone in the middle. Pairs, the attacker with a ball. Nobody may go into the hoop. Rounds of 45 seconds.',
      benodigdheden: ['1 hoop', '1 tall cone', '4 disc cones', '1 ball per pair'],
      coachpunten: ['Watch the ball, not the other player’s feet', 'Small steps sideways, stay between the ball and the treasure', 'Low through your knees so you can move quickly'],
      variaties: {
        makkelijker: ['Bigger hoop, so the guard can stand closer', 'The attacker may only shoot softly'],
        moeilijker: ['Two cones in two hoops', 'Two attackers against one guard'],
      },
    },
    tekening: {
      ...leeg(12, 12),
      objecten: [hoedje('h1', 1, 1), hoedje('h2', 11, 1), hoedje('h3', 1, 11), hoedje('h4', 11, 11), ring('r', 6, 6), pionHoogKleur('p', 6, 6), speler('a1', 1, 6, 10.4, { kijkrichting: -90 }), B('d', 2, 6.2, 7.8, { kijkrichting: 90 }), bal('bal', 6, 9.85, 'a1')],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', via: [[8.6, 10]], naar: [10.2, 7.6], duur: 1.6 }, { type: 'loop', wie: 'd', naar: [7.8, 7.2], manier: 'verdedigend', duur: 1.6 }),
        stap({ type: 'dribbel', wie: 'a1', naar: [9.6, 9.6], duur: 0.9 }, { type: 'loop', wie: 'd', naar: [7.6, 7.8], manier: 'verdedigend', duur: 0.9 }),
        stap({ type: 'dribbel', wie: 'a1', via: [[7, 10.6]], naar: [3.8, 9.6], duur: 1.4, manier: 'sprint' }, { type: 'loop', wie: 'd', naar: [7, 8], manier: 'verdedigend', duur: 1.4 }),
        stap({ type: 'pass', van: 'a1', naar: [5.75, 6.3] }),
        stap({ type: 'valOm', object: 'p', hoek: -40 }),
        pauze(1),
      ],
    },
  },

  // V12. Omschakelen op het fluitje
  {
    id: 'veld-vo-omschakelen-fluitje',
    naam: 'Omschakelen op het fluitje',
    categorieen: ['verdedigen-omschakelen', 'partijvormen'],
    uitleg:
      'Vier tegen vier op twee kleine doeltjes. Op het fluitsignaal laat het team met de bal hem liggen, en speelt de trainer meteen een nieuwe bal in naar het andere team. Wie net aanviel, moet nu meteen verdedigen; wie net verdedigde, valt meteen aan. Wie schakelt het snelst om?',
    organisatie: 'Veld van 25 × 20 m met op elke korte kant een klein doeltje. Twee teams van vier. De trainer staat aan de zijlijn met ballen en fluit om de 20 tot 40 seconden.',
    benodigdheden: ['2 kleine doeltjes', '4 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 8,
    keepersNodig: 0,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Na het fluitje meteen omdraaien: niet eerst kijken wat er gebeurt', 'De dichtstbijzijnde verdediger zet druk, de rest loopt terug achter de bal', 'Aanvallers: speel snel vooruit nu de ander nog niet staat'],
    variaties: {
      makkelijker: ['Het fluitje alleen als de bal stil ligt', 'Drie tegen drie'],
      moeilijker: ['De nieuwe bal komt achter de verdedigers', 'Doelpunt binnen 6 seconden na het fluitje telt dubbel'],
    },
    en: {
      naam: 'Switch on the whistle',
      uitleg:
        'Four against four on two mini goals. On the whistle, the team with the ball leaves it, and the coach immediately plays a new ball in to the other team. Whoever was attacking now has to defend straight away; whoever was defending attacks straight away. Who switches the fastest?',
      organisatie: '25 × 20 m pitch with a mini goal at each short end. Two teams of four. The coach stands on the touchline with balls and whistles every 20 to 40 seconds.',
      benodigdheden: ['2 mini goals', '4 cones', 'Balls', 'Bibs'],
      coachpunten: ['Turn round straight after the whistle: do not watch first', 'The nearest defender presses, the rest recover behind the ball', 'Attackers: play forward quickly while the others are not yet set'],
      variaties: {
        makkelijker: ['Only whistle when the ball is still', 'Three against three'],
        moeilijker: ['The new ball is played in behind the defenders', 'A goal within 6 seconds of the whistle counts double'],
      },
    },
    tekening: {
      ...leeg(22, 28),
      objecten: [
        zone('z', 11, 14, 20, 25),
        doeltje('g1', 11, 1.5, 0),
        doeltje('g2', 11, 26.5, 180),
        trainer(21.6, 14, 180),
        bal('nieuw', 21.05, 14, 't1'),
        speler('a1', 1, 7, 17, { kijkrichting: -90 }),
        speler('a2', 2, 14, 15, { kijkrichting: -90 }),
        speler('a3', 3, 5, 9, { kijkrichting: -60 }),
        speler('a4', 4, 15, 8, { kijkrichting: -120 }),
        B('b1', 5, 9, 12, { kijkrichting: 90 }),
        B('b2', 6, 12.4, 9.6, { kijkrichting: 90 }),
        B('b3', 7, 16.6, 13, { kijkrichting: 90 }),
        B('b4', 8, 11, 20.6, { kijkrichting: -90 }),
        bal('bal', 7.4, 16.6, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'b3', naar: [15.6, 13.4], start: 0.2 }, { type: 'loop', wie: 'a4', naar: [16.2, 6], start: 0.2 }),
        stap({ type: 'pass', van: 'a2', naar: 'a4' }, { type: 'loop', wie: 'b2', naar: [14.2, 8.4], start: 0.2 }),
        // Fluitje: de trainer speelt een nieuwe bal naar blauw.
        stap({ type: 'pass', van: 't1', naar: 'b3' }, { type: 'loop', wie: 'a2', naar: [13, 19], manier: 'sprint', start: 0.2 }, { type: 'loop', wie: 'a1', naar: [9.6, 19.2], manier: 'sprint', start: 0.2 }, { type: 'loop', wie: 'b4', naar: [7.4, 21.8], start: 0.1 }),
        stap({ type: 'dribbel', wie: 'b3', naar: [15, 19.6], manier: 'sprint' }, { type: 'loop', wie: 'a2', naar: [13.6, 21.4], manier: 'sprint' }, { type: 'loop', wie: 'a4', via: [[18, 12]], naar: [17.6, 20], manier: 'sprint' }),
        stap({ type: 'pass', van: 'b3', naar: 'b4' }, { type: 'loop', wie: 'a1', naar: [9.8, 22.2], start: 0.2 }),
        stap({ type: 'schot', van: 'b4', naar: [10.6, 26.8], hoogte: 'grond' }),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
