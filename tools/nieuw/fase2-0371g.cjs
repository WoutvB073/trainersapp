// Fase 2, deel 3, batch 2 (0.37.1), deel g: partijvormen PV2, PV3, PV4, PV7, PV8, PV10 uit VOORSTEL-OEFENINGEN.md.
// Overgeslagen (vrijwel gelijk aan een bestaande oefening): PV1 (veld-pv-2-2-winnaar-blijft), PV5 (veld-ps-eindzone),
// PV6 (veld-sp-koning-van-het-veld en veld-pv-2-2-winnaar-blijft), PV9 (veld-pv-5-5-schietzones).
// Draaien: node tools/nieuw/fase2-0371g.cjs
const { zet } = require('./hulp.cjs');
const { keeper, speler, trainer, bal, hoedje, pauze, stap, B, zone, leeg, miniGoal, JO, OUD, MIDDEN, O6, O7 } = require('./fase2-hulp.cjs');
const jeugdgoal = (id, x, y, hoek = 0) => ({ id, soort: 'goal', x, y, breedte: 5, hoogte: 2, ...(hoek ? { hoek } : {}) });

const oefeningen = [
  // PV2. Partij met een goal in het midden
  {
    id: 'veld-pv-goal-in-het-midden',
    naam: 'Partij met een goal in het midden',
    categorieen: ['partijvormen'],
    uitleg:
      'In het midden van het vak staat één goal zonder net, met een keeper die voor iedereen keept. Je mag aan beide kanten scoren. Pakt de keeper de bal, dan rolt hij hem naar de zijkant en het team dat hem krijgt valt aan. Speel snel om het goal heen: de keeper kan niet aan twee kanten tegelijk staan.',
    organisatie: 'Vak van 28 × 28 m met in het midden een goal zonder net (twee hoge pionnen of vlaggen kan ook). 3 tegen 3 en een neutrale keeper. Rondes van 4 minuten, daarna een andere keeper.',
    benodigdheden: ['1 jeugdgoal zonder net (of 2 vlaggen)', '4 pionnen', 'Ballen', 'Hesjes in 2 kleuren'],
    spelersNodig: 6,
    keepersNodig: 1,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Kijk waar de keeper staat en speel naar de andere kant', 'Na balverlies: meteen druk, het goal is overal dichtbij', 'Schiet snel, voor de keeper kan omdraaien'],
    variaties: {
      makkelijker: ['Groter goal', 'Overtal voor het team met de bal (een joker)'],
      moeilijker: ['Scoren alleen na een pass', 'Twee goals in het midden'],
    },
    en: {
      naam: 'Game with a goal in the middle',
      uitleg:
        'In the middle of the area there is one goal without a net, with a keeper who plays for everyone. You can score from both sides. When the keeper gets the ball, they roll it out to the side and the team that gets it attacks. Move the ball quickly around the goal: the keeper cannot be on both sides at once.',
      organisatie: '28 × 28 m area with a goal without a net in the middle (two tall cones or flags also work). 3v3 and a neutral keeper. Rounds of 4 minutes, then another keeper.',
      benodigdheden: ['1 youth goal without a net (or 2 flags)', '4 cones', 'Balls', 'Bibs in 2 colours'],
      coachpunten: ['See where the keeper is and play to the other side', 'After losing the ball: press straight away, the goal is always close', 'Shoot quickly, before the keeper can turn round'],
      variaties: {
        makkelijker: ['Bigger goal', 'Overload for the team in possession (a joker)'],
        moeilijker: ['Only score after a pass', 'Two goals in the middle'],
      },
    },
    tekening: {
      ...leeg(30, 30),
      objecten: [
        zone('z', 15, 15, 28, 28),
        { id: 'gM', soort: 'goal', x: 15, y: 15, breedte: 4, hoogte: 2, lengte: 0.05, zonderNet: true },
        keeper('k', 1, 15, 16.4, { kijkrichting: 90, verdedigt: 'gM' }),
        speler('a1', 7, 8, 25, { kijkrichting: 0 }),
        speler('a2', 9, 21, 24, { kijkrichting: 180 }),
        speler('a3', 10, 6, 18, { kijkrichting: 0 }),
        B('b1', 4, 12, 21, { kijkrichting: 90 }),
        B('b2', 7, 25.5, 18, { kijkrichting: 180 }),
        B('b3', 9, 10, 7, { kijkrichting: 90 }),
        bal('bal', 8.55, 25, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'b1', naar: [16, 21.2], start: 0.4 }),
        stap({ type: 'dribbel', wie: 'a2', naar: [19, 20] }, { type: 'loop', wie: 'b1', naar: [16.2, 21.4], manier: 'verdedigend', duur: 0.6 }),
        stap({ type: 'schot', van: 'a2', naar: [14.4, 15.2], hoogte: 'laag', afloop: 'vangt', vasthouden: true }),
        stap({ type: 'loop', wie: 'k', naar: [15.6, 17.4], duur: 0.7 }),
        stap({ type: 'pass', van: 'k', naar: 'b2' }),
        stap({ type: 'dribbel', wie: 'b2', via: [[24, 12]], naar: [19, 10.4], manier: 'sprint' }, { type: 'loop', wie: 'a2', naar: [22.4, 14.6], manier: 'sprint', start: 0.5 }, { type: 'draai', wie: 'k', kijk: -60, start: 0.8 }),
        stap({ type: 'schot', van: 'b2', naar: [15.8, 14.9] }),
        pauze(0.8),
      ],
    },
  },

  // PV3. 5 tegen 5 met maximaal drie aanrakingen
  {
    id: 'veld-pv-5-5-drie-aanrakingen',
    naam: '5 tegen 5 met maximaal drie aanrakingen',
    categorieen: ['partijvormen'],
    uitleg:
      'Gewoon partijspel 5 tegen 5 met keepers, maar je mag de bal hooguit drie keer raken. Raak je hem vaker, dan krijgt de tegenstander een vrije trap. Een goal uit één aanraking telt dubbel. Zo moet iedereen vooruit kijken voor de bal komt.',
    organisatie: 'Vak van 40 × 44 m met twee jeugdgoals en keepers. 5 tegen 5. Rondes van 6 minuten. De trainer telt hardop mee bij twijfel.',
    benodigdheden: ['2 jeugdgoals', '8 pionnen', 'Ballen', 'Hesjes in 2 kleuren'],
    spelersNodig: 10,
    keepersNodig: 2,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Kijk over je schouder voor de bal komt: dan weet je wat je gaat doen', 'Bied je aan, zodat je medespeler altijd iemand kan aanspelen', 'Kies je eerste aanraking zo dat je meteen verder kunt'],
    variaties: {
      makkelijker: ['Vier aanrakingen', 'Een joker die vrij mag spelen'],
      moeilijker: ['Twee aanrakingen', 'Scoren alleen uit één aanraking'],
    },
    en: {
      naam: '5v5 with a maximum of three touches',
      uitleg:
        'A normal 5v5 game with keepers, but you may touch the ball no more than three times. Touch it more and the other team gets a free kick. A first-time goal counts double. Everyone has to look ahead before the ball arrives.',
      organisatie: '40 × 44 m area with two youth goals and keepers. 5v5. Rounds of 6 minutes. The coach counts out loud when in doubt.',
      benodigdheden: ['2 youth goals', '8 cones', 'Balls', 'Bibs in 2 colours'],
      coachpunten: ['Check over your shoulder before the ball arrives: then you know what to do', 'Offer yourself, so your teammate always has a pass', 'Take your first touch so that you can carry on straight away'],
      variaties: {
        makkelijker: ['Four touches', 'A joker with unlimited touches'],
        moeilijker: ['Two touches', 'Only first-time goals count'],
      },
    },
    tekening: {
      ...leeg(40, 44),
      objecten: [
        zone('z', 20, 22, 34, 44),
        jeugdgoal('gA', 20, 0.5),
        jeugdgoal('gB', 20, 43.5, 180),
        keeper('kA', 1, 20, 1.9, { verdedigt: 'gA' }),
        keeper('kB', 1, 20, 42.1, { verdedigt: 'gB' }),
        speler('a1', 4, 12, 12, { kijkrichting: -90 }),
        speler('a2', 7, 29, 19, { kijkrichting: 180 }),
        speler('a3', 8, 17, 21, { kijkrichting: -90 }),
        speler('a4', 11, 10, 28, { kijkrichting: 90 }),
        speler('a5', 9, 22, 30, { kijkrichting: -90 }),
        B('b1', 4, 14, 34, { kijkrichting: -90 }),
        B('b2', 5, 23, 34, { kijkrichting: -90 }),
        B('b3', 7, 31, 27, { kijkrichting: -90 }),
        B('b4', 8, 21, 23, { kijkrichting: -90 }),
        B('b5', 9, 19, 11, { kijkrichting: 180 }),
        bal('bal', 20, 2.45, 'kA'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'kA', naar: 'a1' }, { type: 'druk', wie: 'b5', op: 'a1', afstand: 2.4, start: 0.4 }),
        stap({ type: 'pass', van: 'a1', naar: 'a3' }),
        stap({ type: 'pass', van: 'a3', naar: 'a2', direct: true }, { type: 'druk', wie: 'b3', op: 'a2', afstand: 3, start: 0.3 }),
        stap({ type: 'pass', van: 'a2', naar: 'a5' }, { type: 'loop', wie: 'a4', naar: [17, 31.5], manier: 'sprint' }),
        stap({ type: 'pass', van: 'a5', naar: 'a4', direct: true }),
        stap({ type: 'schot', van: 'a4', naar: [18.4, 43.7], direct: true, afloop: 'goal' }),
        pauze(0.8),
      ],
    },
  },

  // PV4. Overtal in de aanval 4 tegen 3
  {
    id: 'veld-pv-overtal-4-3',
    naam: 'Overtal in de aanval 4 tegen 3',
    categorieen: ['partijvormen'],
    uitleg:
      'Partij 4 tegen 4 met keepers, maar het team zonder bal speelt met drie: één verdediger wacht achter zijn eigen doellijn. Verovert zijn team de bal, dan komt hij het veld in en gaat er bij de tegenstander juist iemand achter de eigen doellijn staan. Zo is de aanval altijd 4 tegen 3 en leer je het overtal uitspelen.',
    organisatie: 'Vak van 28 × 34 m met twee jeugdgoals en keepers. 4 tegen 4. Elke keer dat de bal wisselt, gaat de speler die het verst van de bal staat achter zijn doellijn. Rondes van 5 minuten.',
    benodigdheden: ['2 jeugdgoals', '8 pionnen', 'Ballen', 'Hesjes in 2 kleuren'],
    spelersNodig: 8,
    keepersNodig: 2,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Aanvallers: zoek de vrije man, er is er altijd één', 'Speel de verdediger vast voor je de pass geeft', 'Verdedigers: houd de bal voor je en sluit het midden'],
    variaties: {
      makkelijker: ['Groter vak', 'Twee verdedigers wachten (4 tegen 2)'],
      moeilijker: ['Kleiner vak', 'Binnen 10 seconden scoren'],
    },
    en: {
      naam: 'Attacking overload 4v3',
      uitleg:
        'A 4v4 game with keepers, but the team without the ball plays with three: one defender waits behind their own goal line. When their team wins the ball, they come onto the pitch and someone from the other team goes behind their own goal line. The attack is always 4v3, and you learn to make the most of the overload.',
      organisatie: '28 × 34 m area with two youth goals and keepers. 4v4. Each time possession changes, the player furthest from the ball goes behind their goal line. Rounds of 5 minutes.',
      benodigdheden: ['2 youth goals', '8 cones', 'Balls', 'Bibs in 2 colours'],
      coachpunten: ['Attackers: find the free player, there is always one', 'Commit the defender before you pass', 'Defenders: keep the ball in front of you and close the middle'],
      variaties: {
        makkelijker: ['Bigger area', 'Two defenders wait (4v2)'],
        moeilijker: ['Smaller area', 'Score within 10 seconds'],
      },
    },
    tekening: {
      ...leeg(30, 38),
      objecten: [
        zone('z', 15, 19, 28, 34),
        jeugdgoal('gT', 15, 2),
        jeugdgoal('gB', 15, 36, 180),
        keeper('kT', 1, 15, 3.4, { verdedigt: 'gT' }),
        keeper('kB', 1, 15, 34.6, { verdedigt: 'gB' }),
        speler('a1', 4, 8, 31, { kijkrichting: -90 }),
        speler('a2', 8, 21, 26, { kijkrichting: 180 }),
        speler('a3', 7, 6, 17, { kijkrichting: -90 }),
        speler('a4', 9, 19, 11, { kijkrichting: -90 }),
        B('b1', 2, 8, 12, { kijkrichting: 90 }),
        B('b2', 4, 13, 9, { kijkrichting: 90 }),
        B('b3', 8, 23, 18, { kijkrichting: 90 }),
        B('b4', 5, 8, 0.8, { kijkrichting: 90 }),
        bal('bal', 15, 34.05, 'kB'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'kB', naar: 'a1', hoogte: 'laag' }),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }),
        stap({ type: 'dribbel', wie: 'a2', naar: [20, 20.6] }, { type: 'druk', wie: 'b3', op: 'a2', afstand: 2.4, start: 0.3 }),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }, { type: 'druk', wie: 'b1', op: 'a3', afstand: 2.4, start: 0.4 }),
        stap({ type: 'pass', van: 'a3', naar: 'a4' }, { type: 'loop', wie: 'b2', naar: [16.4, 7.4], manier: 'sprint', start: 0.4 }),
        stap({ type: 'schot', van: 'a4', naar: [17, 1.6], afloop: 'goal' }),
        pauze(0.4),
        stap({ type: 'loop', wie: 'b4', naar: [10.6, 6.6], manier: 'sprint' }, { type: 'loop', wie: 'a1', naar: [9, 37.2], manier: 'sprint' }),
        pauze(0.8),
      ],
    },
  },

  // PV7. 3 tegen 3 met keepers die wisselen
  {
    id: 'veld-pv-3-3-scorer-keept',
    naam: '3 tegen 3 met keepers die wisselen',
    categorieen: ['partijvormen'],
    uitleg:
      'Twee teams van vier: drie spelen in het veld en één staat op doel. Wie scoort, wordt meteen de keeper van zijn eigen team en de keeper komt het veld in. Zo keept iedereen eens en wil iedereen scoren. De keeper mag de bal met zijn handen pakken.',
    organisatie: 'Vak van 20 × 28 m met twee jeugdgoals. Twee teams van vier. Na een goal begint de keeper die er net in staat met een uitrol. Rondes van 6 minuten.',
    benodigdheden: ['2 jeugdgoals', '4 hoedjes', 'Ballen', 'Hesjes in 2 kleuren'],
    spelersNodig: 8,
    keepersNodig: 0,
    leeftijden: ['jo8-11'],
    doorwisselbaar: true,
    coachpunten: ['Wissel snel na een goal, het spel gaat meteen door', 'Ook als keeper: rol de bal snel uit naar een vrije medespeler', 'Durf te schieten, ook van verder weg'],
    variaties: {
      makkelijker: ['Grotere goals', 'Een joker die met het aanvallende team meedoet'],
      moeilijker: ['Scoren alleen na een pass', 'De keeper mag alleen met de voeten'],
    },
    en: {
      naam: '3v3 with swapping keepers',
      uitleg:
        'Two teams of four: three play on the pitch and one is in goal. Whoever scores immediately becomes their own team’s keeper, and the keeper comes out onto the pitch. Everyone keeps goal at some point and everyone wants to score. The keeper may use their hands.',
      organisatie: '20 × 28 m area with two youth goals. Two teams of four. After a goal, the keeper who has just gone in goal restarts with a roll-out. Rounds of 6 minutes.',
      benodigdheden: ['2 youth goals', '4 disc cones', 'Balls', 'Bibs in 2 colours'],
      coachpunten: ['Swap quickly after a goal, the game carries on straight away', 'As keeper too: roll the ball out quickly to a free teammate', 'Dare to shoot, also from further out'],
      variaties: {
        makkelijker: ['Bigger goals', 'A joker who plays for the attacking team'],
        moeilijker: ['Only score after a pass', 'The keeper may only use their feet'],
      },
    },
    tekening: {
      ...leeg(22, 30),
      objecten: [
        zone('z', 11, 15, 20, 28),
        jeugdgoal('gT', 11, 1),
        jeugdgoal('gB', 11, 29, 180),
        hoedje('h1', 1, 1),
        hoedje('h2', 21, 1),
        hoedje('h3', 1, 29),
        hoedje('h4', 21, 29),
        speler('a1', 7, 6, 20, { kijkrichting: 0 }),
        speler('a2', 9, 15, 16, { kijkrichting: -90 }),
        speler('a3', 10, 9, 12, { kijkrichting: -90 }),
        speler('a4', 1, 11, 27.6, { kijkrichting: -90 }),
        B('b1', 7, 10, 14.2, { kijkrichting: 90 }),
        B('b2', 9, 17, 7, { kijkrichting: 90 }),
        B('b3', 10, 4, 6, { kijkrichting: 90 }),
        B('b4', 1, 11, 2.4, { kijkrichting: 90 }),
        bal('bal', 6.55, 20, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }),
        stap({ type: 'dribbel', wie: 'a2', naar: [15.4, 10.6] }, { type: 'loop', wie: 'b2', naar: [15.6, 7.6], manier: 'verdedigend' }, { type: 'loop', wie: 'a3', naar: [8.5, 8.4] }),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }),
        stap({ type: 'schot', van: 'a3', naar: [9.2, 0.8], afloop: 'goal' }),
        pauze(0.4),
        stap({ type: 'loop', wie: 'a3', via: [[6.4, 14], [8.6, 22]], naar: [11, 27.6], manier: 'sprint' }, { type: 'loop', wie: 'a4', naar: [15, 21], manier: 'sprint' }),
        pauze(0.8),
      ],
    },
  },

  // PV8. Twee tegen de trainer (O6, O7)
  {
    id: 'veld-pv-twee-tegen-de-trainer',
    naam: 'Twee tegen de trainer',
    categorieen: ['partijvormen'],
    uitleg:
      'Jullie zijn met z’n tweeën en spelen samen tegen de trainer. Scoor in het goaltje! Komt de trainer op je af? Speel de bal dan naar je maatje. Na een goal begint het andere kind met de bal.',
    organisatie: 'Vak van 12 × 12 m met een mini-goaltje aan één kant. Twee kinderen met een bal tegen de trainer. Na drie goals of een minuut is het volgende tweetal aan de beurt.',
    benodigdheden: ['1 mini-goaltje', '4 hoedjes', 'Voetballen'],
    spelersNodig: 2,
    keepersNodig: 0,
    leeftijden: [...O6, ...O7],
    doorwisselbaar: true,
    coachpunten: ['Komt de trainer naar je toe? Pass!', 'Maatje: ga een stukje opzij staan, zodat de bal bij je kan komen', 'Dicht bij het goaltje: schieten'],
    variaties: {
      makkelijker: ['De trainer loopt heel langzaam', 'Groter goaltje'],
      moeilijker: ['Pas scoren als jullie allebei de bal hebben gehad', 'Twee goaltjes, de trainer kiest welke hij verdedigt'],
    },
    en: {
      naam: 'Two against the coach',
      uitleg:
        'There are two of you, playing together against the coach. Score in the little goal! Is the coach coming at you? Then pass to your buddy. After a goal, the other child starts with the ball.',
      organisatie: '12 × 12 m area with a mini goal at one end. Two children with a ball against the coach. After three goals or one minute, the next pair has a go.',
      benodigdheden: ['1 mini goal', '4 disc cones', 'Footballs'],
      coachpunten: ['Is the coach coming at you? Pass!', 'Buddy: move a little to the side, so the ball can reach you', 'Close to the goal: shoot'],
      variaties: {
        makkelijker: ['The coach walks very slowly', 'Bigger goal'],
        moeilijker: ['Only score once you have both had the ball', 'Two goals, the coach chooses which one to defend'],
      },
    },
    tekening: {
      ...leeg(14, 14),
      objecten: [
        zone('z', 7, 7, 12, 12),
        miniGoal('g1', 7, 1.4),
        hoedje('h1', 1, 1),
        hoedje('h2', 13, 1),
        hoedje('h3', 1, 13),
        hoedje('h4', 13, 13),
        trainer(7, 6, 90),
        speler('a1', 1, 4.4, 12, { kijkrichting: -90 }),
        speler('a2', 2, 10, 11.4, { kijkrichting: -90 }),
        bal('bal', 4.4, 11.45, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', naar: [5.2, 8.8] }, { type: 'loop', wie: 't1', naar: [5.8, 7], manier: 'verdedigend', start: 0.3 }, { type: 'loop', wie: 'a2', naar: [10, 9] }),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }),
        stap({ type: 'dribbel', wie: 'a2', naar: [8.8, 4.6] }, { type: 'loop', wie: 't1', naar: [7.2, 6.6], manier: 'verdedigend', start: 0.3 }),
        stap({ type: 'schot', van: 'a2', naar: [7.3, 1], hoogte: 'grond' }),
        pauze(0.8),
      ],
    },
  },

  // PV10. 6 tegen 6 met vaste zones
  {
    id: 'veld-pv-6-6-vaste-zones',
    naam: '6 tegen 6 met vaste zones',
    categorieen: ['partijvormen', 'positiespel'],
    uitleg:
      'Het veld is verdeeld in drie zones. In elke zone spelen twee tegen twee: verdedigers tegen aanvallers en middenvelders tegen middenvelders. Iedereen blijft in zijn eigen zone, maar één speler mag met de bal mee naar de volgende zone. Zo maak je vooruit een man meer en leer je wanneer je doorschuift.',
    organisatie: 'Vak van 40 × 60 m met twee goals en keepers, verdeeld in drie zones van 20 m. Per team twee verdedigers, twee middenvelders en twee aanvallers. Na balverlies gaat de doorgeschoven speler meteen terug. Rondes van 6 minuten.',
    benodigdheden: ['2 goals', '12 pionnen', 'Ballen', 'Hesjes in 2 kleuren'],
    spelersNodig: 12,
    keepersNodig: 2,
    leeftijden: ['jo16-19'],
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 7 tegen 7 met drie middenvelders, of wissel elke ronde een speler per zone.',
    coachpunten: ['Schuif door als je met de bal ruimte voor je hebt, dan maak je een man meer', 'Na balverlies: de doorgeschoven speler sprint meteen terug', 'Verdedigers in overtal: houd de bal voor je en wacht op hulp'],
    variaties: {
      makkelijker: ['Twee spelers mogen doorschuiven', 'Bredere zones'],
      moeilijker: ['Doorschuiven alleen met een pass, niet dribbelend', 'Scoren binnen 5 seconden na het doorschuiven'],
    },
    en: {
      naam: '6v6 with fixed zones',
      uitleg:
        'The pitch is split into three zones. In each zone it is two against two: defenders against attackers and midfielders against midfielders. Everyone stays in their own zone, but one player may go forward with the ball into the next zone. That creates an extra player going forward, and you learn when to step up.',
      organisatie: '40 × 60 m area with two goals and keepers, split into three zones of 20 m. Each team has two defenders, two midfielders and two attackers. After losing the ball, the player who stepped up goes straight back. Rounds of 6 minutes.',
      benodigdheden: ['2 goals', '12 cones', 'Balls', 'Bibs in 2 colours'],
      meerSpelers: 'With more players: 7v7 with three midfielders, or swap one player per zone each round.',
      coachpunten: ['Step up when you have space ahead with the ball: that makes an extra player', 'After losing the ball: the player who stepped up sprints straight back', 'Defenders when outnumbered: keep the ball in front of you and wait for help'],
      variaties: {
        makkelijker: ['Two players may step up', 'Wider zones'],
        moeilijker: ['Only step up with a pass, not by dribbling', 'Score within 5 seconds of stepping up'],
      },
    },
    tekening: {
      ...leeg(44, 60),
      objecten: [
        zone('z1', 22, 10, 40, 20),
        zone('z2', 22, 30, 40, 20),
        zone('z3', 22, 50, 40, 20),
        jeugdgoal('gA', 22, 0.5),
        jeugdgoal('gB', 22, 59.5, 180),
        keeper('kA', 1, 22, 1.9, { verdedigt: 'gA' }),
        keeper('kB', 1, 22, 58.1, { verdedigt: 'gB' }),
        speler('a1', 4, 14, 12, { kijkrichting: 90 }),
        speler('a2', 3, 30, 12, { kijkrichting: 90 }),
        speler('a3', 6, 12, 28, { kijkrichting: -90 }),
        speler('a4', 8, 28, 31, { kijkrichting: 180 }),
        speler('a5', 9, 16, 46, { kijkrichting: 90 }),
        speler('a6', 11, 31, 46, { kijkrichting: 90 }),
        B('b1', 4, 14, 52, { kijkrichting: -90 }),
        B('b2', 3, 24, 52, { kijkrichting: -90 }),
        B('b3', 6, 16, 22, { kijkrichting: 90 }),
        B('b4', 8, 33, 36, { kijkrichting: -90 }),
        B('b5', 9, 20, 16, { kijkrichting: -90 }),
        B('b6', 11, 34, 8, { kijkrichting: -90 }),
        bal('bal', 22, 2.45, 'kA'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'kA', naar: 'a1' }, { type: 'druk', wie: 'b5', op: 'a1', afstand: 2.4, start: 0.4 }),
        stap({ type: 'pass', van: 'a1', naar: 'a3' }, { type: 'druk', wie: 'b3', op: 'a3', afstand: 2.2, start: 0.4 }),
        stap({ type: 'pass', van: 'a3', naar: 'a4' }),
        stap({ type: 'dribbel', wie: 'a4', naar: [26, 42.6], manier: 'sprint' }, { type: 'loop', wie: 'b4', naar: [29.4, 38.8], manier: 'sprint', start: 0.2 }, { type: 'loop', wie: 'b2', naar: [25, 47.4], manier: 'verdedigend', start: 0.5 }),
        stap({ type: 'pass', van: 'a4', naar: [32, 51.6] }, { type: 'loop', wie: 'a6', naar: [32, 51.6], manier: 'sprint' }, { type: 'loop', wie: 'b1', naar: [20, 51], start: 0.3 }),
        stap({ type: 'schot', van: 'a6', naar: [24, 59.7], hoogte: 'laag', afloop: 'goal' }),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
