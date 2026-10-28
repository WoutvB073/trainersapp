// Spelersoefeningen 0.27.0, deel B2 (Partijvormen: 29–35). Draaien: node tools/nieuw/spelers-027b.cjs
const { zet } = require('./hulp.cjs');
const { keeper, speler, bal, pauze, stap } = require('./bouwstenen.cjs');

const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const J = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'J', ...extra });
const zone = (id, x, y, breedte, lengte, kleur) => ({ id, soort: 'zone', x, y, breedte, lengte, ...(kleur ? { kleur } : {}) });
const doeltje = (id, x, y, hoek, breedte = 3) => ({ id, soort: 'klein-goal', x, y, hoek, breedte });
const jeugdgoal = (id, x, y, hoek = 0) => ({ id, soort: 'goal', x, y, breedte: 5, hoogte: 2, ...(hoek ? { hoek } : {}) });
const tekst = (id, x, y, t) => ({ id, soort: 'tekst', x, y, tekst: t });
const leeg = (breedte, lengte, camera = 'schuin') => ({ veld: { type: 'leeg', breedte, lengte }, camera });
const GEEL = '#ffd23f';
const ROOD = '#e03131';

const oefeningen = [
  // 29. Van 1 tegen 1 naar 4 tegen 4
  {
    id: 'veld-pv-1-1-naar-4-4',
    naam: 'Van 1 tegen 1 naar 4 tegen 4',
    categorieen: ['partijvormen'],
    uitleg:
      'Het begint met een 1 tegen 1 op twee doelen met keepers. Na elk doelpunt of elke bal uit komt er bij beide teams een speler bij: 2 tegen 2, dan 3 tegen 3 en tot slot 4 tegen 4. De keeper van het team dat de goal tegen kreeg (of bij een bal uit: de keeper van het team dat aan de bal komt) brengt de bal meteen weer in het spel. Na een paar minuten 4 tegen 4 begint een nieuwe ronde met een 1 tegen 1.',
    organisatie:
      'Veld van 24 × 32 m met op beide korte zijden een jeugdgoal en een keeper. Per team staan drie spelers klaar naast het veld, ter hoogte van de middenlijn. Reserveballen bij de goals.',
    benodigdheden: ['2 jeugdgoals', '4 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 8,
    keepersNodig: 2,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: door tot 5 tegen 5, of twee velden naast elkaar.',
    coachpunten: [
      '1 tegen 1: durf de aanvaller aan te gaan, met snelheid op de verdediger af',
      'Wie erbij komt: meteen aanspeelbaar zijn of meteen je man oppakken',
      'Met meer spelers: veld groot maken in balbezit, compact bij balverlies',
    ],
    variaties: {
      makkelijker: ['Een doelpunt in de eerste 1 tegen 1 telt dubbel, daarna gewoon', 'Groter veld'],
      moeilijker: ['Er komt alleen een speler bij het team dat de goal tegen kreeg (tijdelijk overtal)', 'Maximaal drie aanrakingen vanaf 3 tegen 3'],
    },
    en: {
      naam: 'From 1v1 to 4v4',
      uitleg:
        'It starts with a 1v1 on two goals with keepers. After every goal or every time the ball goes out, each team adds a player: 2v2, then 3v3 and finally 4v4. The keeper of the team that conceded (or when the ball goes out: the keeper of the team whose ball it is) restarts straight away. After a few minutes of 4v4, a new round starts with a 1v1.',
      organisatie: '24 × 32 m pitch with a youth goal and a keeper at each short end. Three players per team wait beside the pitch, level with the halfway line. Spare balls by the goals.',
      benodigdheden: ['2 youth goals', '4 cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: carry on up to 5v5, or two pitches side by side.',
      coachpunten: [
        '1v1: dare to take on your opponent, run at the defender with pace',
        'When you come on: be available straight away or pick up your player straight away',
        'With more players: make the pitch big in possession, compact after losing the ball',
      ],
      variaties: {
        makkelijker: ['A goal in the first 1v1 counts double, after that normal', 'Bigger pitch'],
        moeilijker: ['Only the team that conceded adds a player (a temporary overload)', 'Three touches maximum from 3v3 onwards'],
      },
    },
    tekening: {
      ...leeg(32, 34),
      objecten: [
        zone('z', 16, 17, 24, 32),
        jeugdgoal('gA', 16, 1),
        jeugdgoal('gB', 16, 33, 180),
        keeper('kA', 1, 16, 2.4, { verdedigt: 'gA' }),
        keeper('kB', 1, 16, 31.6, { verdedigt: 'gB' }),
        speler('a1', 2, 13, 13, { kijkrichting: 90 }),
        B('b1', 2, 15.6, 18.6, { kijkrichting: -90 }),
        speler('a2', 3, 1.8, 13, { kijkrichting: 0 }),
        speler('a3', 4, 1.8, 17, { kijkrichting: 0 }),
        speler('a4', 5, 1.8, 21, { kijkrichting: 0 }),
        B('b2', 3, 30.2, 13, { kijkrichting: 180 }),
        B('b3', 4, 30.2, 17, { kijkrichting: 180 }),
        B('b4', 5, 30.2, 21, { kijkrichting: 180 }),
        bal('bal', 13, 13.55, 'a1'),
        bal('bal2', 18.4, 32.6),
      ],
      animatie: [
        pauze(0.6),
        // 1 tegen 1
        stap({ type: 'dribbel', wie: 'a1', via: [[10.8, 17.4]], naar: [11.6, 22.6] }, { type: 'druk', wie: 'b1', op: 'a1', afstand: 1.9, start: 0.1 }),
        stap({ type: 'schot', van: 'a1', naar: [14.4, 33.3], afloop: 'goal' }),
        // Doelpunt: bij beide teams een speler erbij, de keeper brengt de bal in.
        stap(
          { type: 'loop', wie: 'a2', naar: [8.4, 15], manier: 'sprint' },
          { type: 'loop', wie: 'b2', naar: [23.4, 15.4], manier: 'sprint' },
          { type: 'loop', wie: 'b1', naar: [19.6, 24.4] },
          { type: 'loop', wie: 'a1', naar: [14.6, 17.6] },
          { type: 'pak', wie: 'kB', start: 0.3 },
        ),
        stap({ type: 'pass', van: 'kB', naar: 'b1', worp: 'onderhands', hoogte: 'grond', bal: 'bal2' }),
        stap({ type: 'pass', van: 'b1', naar: 'b2' }, { type: 'druk', wie: 'a1', op: 'b2', afstand: 2.4, start: 0.5 }),
        stap({ type: 'dribbel', wie: 'b2', naar: [21.6, 8.4] }, { type: 'loop', wie: 'a2', naar: [13.4, 8.6], manier: 'sprint', start: 0.2 }),
        stap({ type: 'schot', van: 'b2', naar: [21, -0.4], afloop: 'naast' }),
        // Bal uit: 3 tegen 3.
        stap({ type: 'loop', wie: 'a3', naar: [7.6, 20], manier: 'sprint' }, { type: 'loop', wie: 'b3', naar: [24.4, 12], manier: 'sprint' }),
        pauze(1.0),
      ],
    },
  },

  // 30. 6 tegen 6 met een verboden middenvak
  {
    id: 'veld-pv-6-6-verboden-midden',
    naam: '6 tegen 6 met een verboden middenvak',
    categorieen: ['partijvormen'],
    uitleg:
      'Partij 6 tegen 6 met keepers. In het midden van het veld ligt in de lengte een smalle strook waar niemand mag komen, ook niet om de bal op te halen. De bal mag er wel overheen of doorheen. Zo moet je het spel verplaatsen via de flanken en met lange ballen over de strook. In het voorbeeld speelt rood de linksbuiten aan, die met een lange bal het spel verplaatst naar rechts; de rechtsbuiten geeft de voorzet.',
    organisatie:
      'Veld van 44 × 60 m met op beide korte zijden een jeugdgoal en een keeper. Verboden strook van 8 m breed in het midden, van 12 m tot 48 m (pionnen of een andere kleur hoedjes). Teams met hesjes, rondes van 6 minuten. Wie in de strook komt, geeft de bal aan de tegenstander.',
    benodigdheden: ['2 jeugdgoals', '12 pionnen of hoedjes', 'Ballen', 'Hesjes'],
    spelersNodig: 12,
    keepersNodig: 2,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 7 tegen 7 of 8 tegen 8 op een groter veld, met een bredere strook.',
    coachpunten: [
      'Breed staan: aan beide kanten van de strook iemand aanspeelbaar',
      'De lange bal over de strook: met de wreef, hoog genoeg en op de voet of in de loop',
      'Na de wissel snel doorspelen, voordat de tegenstander kan doorschuiven',
    ],
    variaties: {
      makkelijker: ['Smallere strook (5 m)', 'De bal mag door de strook rollen, ook laag'],
      moeilijker: ['Bredere strook (12 m)', 'De bal moet minstens één keer van flank wisselen voor een doelpunt', 'Maximaal drie aanrakingen'],
    },
    en: {
      naam: '6v6 with a no-go middle strip',
      uitleg:
        'A 6v6 game with keepers. Down the middle of the pitch runs a narrow strip where nobody may go, not even to fetch the ball. The ball may go over or through it. So you have to switch play via the wings and with long balls over the strip. In the example, red plays in the left winger, who switches play to the right with a long ball; the right winger puts in the cross.',
      organisatie:
        '44 × 60 m pitch with a youth goal and a keeper at each short end. No-go strip 8 m wide in the middle, from 12 m to 48 m (cones or a different colour of disc cones). Teams in bibs, 6-minute rounds. Anyone who steps into the strip gives the ball to the other team.',
      benodigdheden: ['2 youth goals', '12 cones or disc cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: 7v7 or 8v8 on a bigger pitch, with a wider strip.',
      coachpunten: [
        'Stay wide: someone available on both sides of the strip',
        'The long ball over the strip: with the laces, high enough, to feet or into a run',
        'After the switch, play on quickly before the opponents can shift across',
      ],
      variaties: {
        makkelijker: ['Narrower strip (5 m)', 'The ball may roll through the strip, low as well'],
        moeilijker: ['Wider strip (12 m)', 'The ball must switch wings at least once before a goal', 'Three touches maximum'],
      },
    },
    tekening: {
      ...leeg(44, 60),
      objecten: [
        zone('verboden', 22, 30, 8, 36, ROOD),
        jeugdgoal('gA', 22, 0.5),
        jeugdgoal('gB', 22, 59.5, 180),
        keeper('kA', 1, 22, 1.9, { verdedigt: 'gA' }),
        keeper('kB', 1, 22, 58.1, { verdedigt: 'gB' }),
        speler('a1', 4, 10, 14, { kijkrichting: 90 }),
        speler('a2', 5, 34, 13, { kijkrichting: 90 }),
        speler('a3', 7, 6, 28, { kijkrichting: 0 }),
        speler('a4', 11, 38.4, 30, { kijkrichting: 180 }),
        speler('a5', 9, 12, 46, { kijkrichting: 90 }),
        speler('a6', 10, 31, 47, { kijkrichting: 90 }),
        B('b1', 7, 10.6, 23, { kijkrichting: -90 }),
        B('b2', 11, 33, 22, { kijkrichting: -90 }),
        B('b3', 4, 11, 38, { kijkrichting: -90 }),
        B('b4', 2, 34.4, 38, { kijkrichting: -90 }),
        B('b5', 5, 14, 52.4, { kijkrichting: -90 }),
        B('b6', 3, 30.4, 52, { kijkrichting: -90 }),
        bal('bal', 10, 14.55, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: 'a3' }, { type: 'druk', wie: 'b1', op: 'a3', afstand: 2.4, start: 0.5 }),
        stap({ type: 'pass', van: 'a3', naar: 'a4', hoogte: 'hoog' }, { type: 'loop', wie: 'b2', naar: [35.4, 26.4], start: 0.6 }),
        stap(
          { type: 'dribbel', wie: 'a4', naar: [39.6, 44] },
          { type: 'druk', wie: 'b4', op: 'a4', afstand: 2.2, start: 0.2 },
          { type: 'loop', wie: 'a6', naar: [25.6, 53.4], manier: 'sprint', start: 0.3 },
          { type: 'loop', wie: 'b6', naar: [27.4, 55.6], start: 0.45 },
          { type: 'loop', wie: 'a5', naar: [16.4, 51], start: 0.3 },
        ),
        stap({ type: 'pass', van: 'a4', naar: 'a6', hoogte: 'hoog', eindHoogte: 0.9 }),
        stap({ type: 'schot', van: 'a6', naar: [23.6, 59.8], afloop: 'goal', direct: true }),
        pauze(1.0),
      ],
    },
  },

  // 31. 5 tegen 5 met schietzones
  {
    id: 'veld-pv-5-5-schietzones',
    naam: '5 tegen 5 met schietzones',
    categorieen: ['partijvormen', 'afwerken'],
    uitleg:
      'Partij 5 tegen 5 met keepers. Scoren mag alleen vanuit de schietzone voor het doel. Vier neutrale spelers staan aan de zijkanten (twee per zijlijn) en spelen mee met het team aan de bal; ze mogen niet scoren en raken de bal maximaal twee keer. Gebruik ze om de schietzone in te komen: speel een neutrale speler aan en loop in.',
    organisatie:
      'Veld van 34 × 48 m met op beide korte zijden een jeugdgoal en een keeper. Voor elk doel een schietzone van 20 × 12 m (hoedjes). Vier neutrale spelers in een eigen kleur op de zijlijnen, op 16 en 32 m. Teams met hesjes, rondes van 5 minuten; wissel de neutralen elke ronde.',
    benodigdheden: ['2 jeugdgoals', '12 hoedjes', '4 pionnen', 'Ballen', 'Hesjes in 3 kleuren'],
    spelersNodig: 14,
    keepersNodig: 2,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 6 tegen 6 met vier neutralen op een groter veld.',
    coachpunten: [
      'Kom de schietzone in met een actie: één-twee met een neutrale speler of een loopactie in de rug',
      'In de zone: snel afronden, in één of twee keer',
      'Verdedigers: houd de schietzone dicht en volg je man als hij invalt',
    ],
    variaties: {
      makkelijker: ['Grotere schietzone (14 m diep)', 'Neutralen mogen drie keer raken'],
      moeilijker: ['In de schietzone alleen in één keer afronden', 'Neutralen in één keer', 'Kleinere schietzone'],
    },
    en: {
      naam: '5v5 with shooting zones',
      uitleg:
        'A 5v5 game with keepers. You may only score from the shooting zone in front of goal. Four neutral players stand on the sides (two per touchline) and play for the team in possession; they may not score and touch the ball twice at most. Use them to get into the shooting zone: play a neutral player in and make your run.',
      organisatie:
        '34 × 48 m pitch with a youth goal and a keeper at each short end. A 20 × 12 m shooting zone in front of each goal (disc cones). Four neutral players in their own colour on the touchlines, at 16 and 32 m. Teams in bibs, 5-minute rounds; change the neutrals every round.',
      benodigdheden: ['2 youth goals', '12 disc cones', '4 cones', 'Balls', 'Bibs in 3 colours'],
      meerSpelers: 'With more players: 6v6 with four neutrals on a bigger pitch.',
      coachpunten: [
        'Get into the shooting zone with an action: a one-two with a neutral player or a run in behind',
        'In the zone: finish quickly, in one or two touches',
        'Defenders: keep the shooting zone closed and follow your player when they make a run',
      ],
      variaties: {
        makkelijker: ['Bigger shooting zone (14 m deep)', 'Neutrals may take three touches'],
        moeilijker: ['In the shooting zone, first-time finishes only', 'Neutrals one touch', 'Smaller shooting zone'],
      },
    },
    tekening: {
      ...leeg(40, 48),
      objecten: [
        zone('veld', 20, 24, 34, 48),
        zone('sA', 20, 6, 20, 12, GEEL),
        zone('sB', 20, 42, 20, 12, GEEL),
        jeugdgoal('gA', 20, 0.5),
        jeugdgoal('gB', 20, 47.5, 180),
        keeper('kA', 1, 20, 1.9, { verdedigt: 'gA' }),
        keeper('kB', 1, 20, 46.1, { verdedigt: 'gB' }),
        J('j1', 12, 1.4, 16, { kijkrichting: 0 }),
        J('j2', 13, 1.4, 32, { kijkrichting: 0 }),
        J('j3', 14, 38.6, 16, { kijkrichting: 180 }),
        J('j4', 15, 38.6, 32, { kijkrichting: 180 }),
        speler('a1', 6, 14, 22, { kijkrichting: 90 }),
        speler('a2', 8, 27, 20, { kijkrichting: 90 }),
        speler('a3', 7, 9.6, 29.4, { kijkrichting: 90 }),
        speler('a4', 9, 25, 32, { kijkrichting: 90 }),
        speler('a5', 4, 20, 12, { kijkrichting: 90 }),
        B('b1', 8, 19, 25.6, { kijkrichting: -90 }),
        B('b2', 6, 29, 27, { kijkrichting: -90 }),
        B('b3', 4, 19.4, 35, { kijkrichting: -90 }),
        B('b4', 5, 28, 39, { kijkrichting: -90 }),
        B('b5', 9, 21.4, 17, { kijkrichting: -90 }),
        bal('bal', 14, 22.55, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: 'j2' }, { type: 'loop', wie: 'a3', via: [[10.6, 33.6]], naar: [14.6, 38.4], manier: 'sprint', start: 0.4 }),
        stap({ type: 'pass', van: 'j2', naar: 'a3', direct: true }, { type: 'druk', wie: 'b3', op: 'a3', afstand: 2.2, manier: 'sprint', start: 0.3 }),
        stap({ type: 'schot', van: 'a3', naar: [17.8, 47.8], afloop: 'goal' }),
        pauze(1.0),
      ],
    },
  },

  // 32. 4 tegen 4 met wingers in de flankzone
  {
    id: 'veld-pv-4-4-wingers',
    naam: '4 tegen 4 met wingers in de flankzone',
    categorieen: ['partijvormen', 'afwerken'],
    uitleg:
      'Partij 4 tegen 4 met keepers in het middenveld. Aan beide zijkanten ligt een flankzone met daarin een vaste winger. De wingers spelen mee met het team aan de bal, blijven altijd in hun zone en mogen daar niet aangevallen worden. Een doelpunt na een voorzet uit de flankzone telt dubbel. In het voorbeeld speelt rood de rechterwinger aan, die doordribbelt en voorzet; de spits kopt raak.',
    organisatie:
      'Veld van 28 × 44 m met aan beide kanten een flankzone van 6 m breed (dus 40 m breed in totaal), op beide korte zijden een jeugdgoal en een keeper. Twee wingers in een eigen kleur. Teams met hesjes, rondes van 5 minuten; wissel de wingers elke ronde.',
    benodigdheden: ['2 jeugdgoals', '8 pionnen', 'Ballen', 'Hesjes in 3 kleuren'],
    spelersNodig: 10,
    keepersNodig: 2,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 5 tegen 5 in het midden, of per team een eigen winger in elke zone (1 tegen 1 op de flank).',
    coachpunten: [
      'Breed spelen: zoek de winger zodra het midden dicht zit',
      'Bij een voorzet: één naar de eerste paal, één naar de tweede paal, één rond de penaltystip',
      'Winger: kijk op voor je voorzet en speel de bal tussen keeper en verdedigers',
    ],
    variaties: {
      makkelijker: ['Ook een doelpunt na een pass van de winger telt dubbel', 'Wingers mogen drie keer raken'],
      moeilijker: ['Een verdediger mag de flankzone in', 'Voorzet alleen in één keer', 'Alleen kopbal of volley na een voorzet telt'],
    },
    en: {
      naam: '4v4 with wingers in the wide zones',
      uitleg:
        'A 4v4 game with keepers in the middle of the pitch. Down each side is a wide zone with a fixed winger in it. The wingers play for the team in possession, always stay in their zone and may not be challenged there. A goal from a cross out of the wide zone counts double. In the example, red plays in the right winger, who dribbles on and crosses; the striker heads it in.',
      organisatie:
        '28 × 44 m pitch with a 6 m wide zone on each side (so 40 m wide in total), a youth goal and a keeper at each short end. Two wingers in their own colour. Teams in bibs, 5-minute rounds; change the wingers every round.',
      benodigdheden: ['2 youth goals', '8 cones', 'Balls', 'Bibs in 3 colours'],
      meerSpelers: 'With more players: 5v5 in the middle, or each team has its own winger in each zone (1v1 on the wing).',
      coachpunten: [
        'Play wide: find the winger as soon as the middle is closed',
        'When the cross comes: one to the near post, one to the far post, one around the penalty spot',
        'Winger: look up before you cross and put the ball between keeper and defenders',
      ],
      variaties: {
        makkelijker: ['A goal after a pass from the winger also counts double', 'Wingers may take three touches'],
        moeilijker: ['One defender may enter the wide zone', 'First-time crosses only', 'Only a header or volley from a cross counts'],
      },
    },
    tekening: {
      ...leeg(40, 44),
      objecten: [
        zone('fL', 3, 22, 6, 44, GEEL),
        zone('fR', 37, 22, 6, 44, GEEL),
        jeugdgoal('gA', 20, 0.5),
        jeugdgoal('gB', 20, 43.5, 180),
        keeper('kA', 1, 20, 1.9, { verdedigt: 'gA' }),
        keeper('kB', 1, 20, 42.1, { verdedigt: 'gB' }),
        J('j1', 11, 3, 21, { kijkrichting: 0 }),
        J('j2', 7, 37, 21, { kijkrichting: 180 }),
        speler('a1', 6, 16, 16, { kijkrichting: 90 }),
        speler('a2', 8, 25, 13.6, { kijkrichting: 90 }),
        speler('a3', 10, 13, 27.4, { kijkrichting: 90 }),
        speler('a4', 9, 24, 29.6, { kijkrichting: 90 }),
        B('b1', 8, 19.4, 20.4, { kijkrichting: -90 }),
        B('b2', 10, 11, 21.4, { kijkrichting: -90 }),
        B('b3', 4, 15.4, 35, { kijkrichting: -90 }),
        B('b4', 5, 26.4, 37, { kijkrichting: -90 }),
        bal('bal', 16.55, 16, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: 'j2' }),
        stap(
          { type: 'dribbel', wie: 'j2', naar: [37, 34.6] },
          { type: 'loop', wie: 'a4', naar: [22.2, 38.6], manier: 'sprint', start: 0.3 },
          { type: 'loop', wie: 'a3', naar: [16.6, 30.4], start: 0.3 },
          { type: 'loop', wie: 'b4', naar: [25.6, 40.2], start: 0.5 },
        ),
        stap({ type: 'pass', van: 'j2', naar: 'a4', hoogte: 'hoog', eindHoogte: 1.9 }),
        stap({ type: 'schot', van: 'a4', naar: [18.6, 43.8], afloop: 'goal', direct: true }),
        pauze(1.0),
      ],
    },
  },

  // 33. Partijspel met voorsprong
  {
    id: 'veld-pv-voorsprong',
    naam: 'Partijspel met voorsprong',
    categorieen: ['partijvormen'],
    uitleg:
      'Een kort partijtje van 5 minuten waarin één team al met 2-0 voor begint. Dat team moet de voorsprong verdedigen; het andere team moet binnen de tijd minstens gelijkmaken. Leer zo hoe je een voorsprong slim vasthoudt (compact staan, de bal in de ploeg houden) en hoe je met een achterstand risico neemt. Variant: het ene team speelt met een man minder, maar staat 1-0 voor.',
    organisatie: 'Veld van 34 × 44 m met op beide korte zijden een jeugdgoal en een keeper. 5 tegen 5 (variant: 5 tegen 4). Rondes van 5 minuten; daarna begint het andere team met de voorsprong.',
    benodigdheden: ['2 jeugdgoals', '4 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 10,
    keepersNodig: 2,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 6 tegen 6 of 7 tegen 7, of twee velden met wedstrijdjes naast elkaar.',
    coachpunten: [
      'Voorsprong: compact staan, de ruimte voor het doel dicht, en na balwinst de bal rustig in de ploeg houden',
      'Achterstand: veld groot maken, snel spelen en durven: een extra speler mee naar voren',
      'Kijk naar de tijd: wat vraagt de stand nu van jouw team?',
    ],
    variaties: {
      makkelijker: ['1-0 voorsprong in plaats van 2-0', 'Langere ronde (8 minuten)'],
      moeilijker: ['3-0 voorsprong, met 3 minuten', 'Het team met de achterstand speelt met een man meer, maar in maximaal twee aanrakingen'],
    },
    en: {
      naam: 'Game with a head start',
      uitleg:
        'A short 5-minute game in which one team starts 2-0 up. That team has to defend the lead; the other team has to at least draw level in time. You learn how to hold on to a lead cleverly (stay compact, keep the ball in the team) and how to take risks when you are behind. Variant: one team plays with a player fewer, but leads 1-0.',
      organisatie: '34 × 44 m pitch with a youth goal and a keeper at each short end. 5v5 (variant: 5v4). 5-minute rounds; then the other team starts with the lead.',
      benodigdheden: ['2 youth goals', '4 cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: 6v6 or 7v7, or two pitches with games side by side.',
      coachpunten: [
        'Leading: stay compact, close the space in front of goal, and after winning the ball keep it calmly in the team',
        'Behind: make the pitch big, play quickly and be brave: an extra player forward',
        'Watch the clock: what does the score ask of your team right now?',
      ],
      variaties: {
        makkelijker: ['1-0 lead instead of 2-0', 'Longer round (8 minutes)'],
        moeilijker: ['3-0 lead with 3 minutes to go', 'The team that is behind plays with a player more, but with two touches maximum'],
      },
    },
    tekening: {
      ...leeg(40, 44),
      objecten: [
        zone('z', 20, 22, 34, 44),
        tekst('stand', 31, 3.4, 'Rood 0 – 2 Blauw'),
        jeugdgoal('gA', 20, 0.5),
        jeugdgoal('gB', 20, 43.5, 180),
        keeper('kA', 1, 20, 1.9, { verdedigt: 'gA' }),
        keeper('kB', 1, 20, 42.1, { verdedigt: 'gB' }),
        speler('a1', 4, 10, 20, { kijkrichting: 0 }),
        speler('a2', 6, 20, 17.6, { kijkrichting: 90 }),
        speler('a3', 7, 30, 24, { kijkrichting: 180 }),
        speler('a4', 10, 12, 25.4, { kijkrichting: 90 }),
        speler('a5', 9, 22, 29, { kijkrichting: 90 }),
        B('b1', 2, 12, 34, { kijkrichting: -90 }),
        B('b2', 4, 20, 35, { kijkrichting: -90 }),
        B('b3', 5, 28, 34, { kijkrichting: -90 }),
        B('b4', 6, 16, 28.6, { kijkrichting: -90 }),
        B('b5', 9, 20, 24, { kijkrichting: -90 }),
        bal('bal', 10.55, 20, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }),
        stap({ type: 'pass', van: 'a2', naar: 'a3' }, { type: 'loop', wie: 'b4', naar: [18.6, 29.4], start: 0.5 }),
        stap({ type: 'dribbel', wie: 'a3', naar: [27, 28.6] }, { type: 'druk', wie: 'b3', op: 'a3', afstand: 2.2, start: 0.2 }),
        stap({ type: 'schot', van: 'a3', naar: [19, 43.7], afloop: 'vangt', vasthouden: true }),
        stap({ type: 'loop', wie: 'b5', naar: [26, 25.6], start: 0.2 }),
        stap({ type: 'pass', van: 'kB', naar: 'b5', worp: 'bovenhands' }),
        stap({ type: 'dribbel', wie: 'b5', naar: [31, 20.4] }, { type: 'druk', wie: 'a3', op: 'b5', afstand: 2.4, start: 0.3 }),
        pauze(1.0),
      ],
    },
  },

  // 34. 2 tegen 2 met een doelspeler
  {
    id: 'veld-pv-2-2-doelspeler',
    naam: '2 tegen 2 met een doelspeler',
    categorieen: ['partijvormen', 'verdedigen-omschakelen'],
    uitleg:
      'Twee tegen twee in een klein vak. Elk team heeft een doelspeler achter de lijn aan de kant waar het naartoe speelt. Krijg je de bal tot bij je doelspeler, dan is dat een punt. De doelspeler kaatst de bal meteen terug naar een medespeler, zodat je team door kan spelen voor het volgende punt. De verdedigers moeten dus steeds opnieuw druk zetten om de bal te veroveren; lukt dat, dan spelen zij naar hun eigen doelspeler aan de andere kant.',
    organisatie:
      'Vak van 14 × 22 m. Op beide korte zijden een doelspeler achter de lijn (hij mag over de hele breedte bewegen). Rondes van 2 minuten; daarna wisselen de doelspelers met een veldspeler.',
    benodigdheden: ['4 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 6,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 3 tegen 3 met doelspelers, of wachtende tweetallen die na elke ronde inwisselen.',
    coachpunten: [
      'Aanvallen: maak het vak groot en speel de doelspeler in zodra de lijn open is',
      'Verdedigen: de één zet druk op de bal, de ander dekt de lijn naar de doelspeler af',
      'Na balverovering meteen omschakelen: kijk waar jouw doelspeler staat',
    ],
    variaties: {
      makkelijker: ['Groter vak', 'Doelspelers mogen twee keer raken'],
      moeilijker: ['Doelspelers in één keer', 'Een punt alleen als de doelspeler de bal terugkaatst op een inlopende speler', 'Kleiner vak'],
    },
    en: {
      naam: '2v2 with a target player',
      uitleg:
        'Two against two in a small area. Each team has a target player behind the line at the end it is attacking. Get the ball to your target player and it’s a point. The target player lays the ball straight back to a teammate, so your team can carry on for the next point. That means the defenders have to keep pressing to win the ball; if they do, they play towards their own target player at the other end.',
      organisatie: '14 × 22 m area. A target player behind the line at each short end (they may move across the full width). 2-minute rounds; then the target players swap with an outfield player.',
      benodigdheden: ['4 cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: 3v3 with target players, or pairs waiting to come on after every round.',
      coachpunten: [
        'Attacking: make the area big and play into the target player as soon as the line is open',
        'Defending: one presses the ball, the other blocks the line to the target player',
        'After winning the ball, switch straight away: look where your target player is',
      ],
      variaties: {
        makkelijker: ['Bigger area', 'Target players may take two touches'],
        moeilijker: ['Target players one touch', 'Only a point when the target player lays it off to a player running in', 'Smaller area'],
      },
    },
    tekening: {
      ...leeg(18, 28),
      objecten: [
        zone('z', 9, 14, 14, 22),
        speler('ta', 1, 9, 1.4, { kijkrichting: 90 }),
        B('tb', 1, 9, 26.6, { kijkrichting: -90 }),
        speler('a1', 2, 6, 20, { kijkrichting: -45 }),
        speler('a2', 3, 12, 14, { kijkrichting: -90 }),
        B('b1', 2, 7, 13.4, { kijkrichting: 90 }),
        B('b2', 3, 11.4, 21, { kijkrichting: 180 }),
        bal('bal', 6.4, 19.6, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'druk', wie: 'b1', op: 'a2', afstand: 1.9, start: 0.4 }),
        stap(
          { type: 'dribbel', wie: 'a2', naar: [13.2, 9.6] },
          { type: 'druk', wie: 'b1', op: 'a2', afstand: 1.8, start: 0.1 },
          { type: 'loop', wie: 'a1', naar: [6.6, 11.2], start: 0.2 },
          { type: 'loop', wie: 'b2', naar: [8.4, 14.4], start: 0.35 },
        ),
        stap({ type: 'pass', van: 'a2', naar: 'ta' }),
        stap({ type: 'pass', van: 'ta', naar: 'a1', direct: true }, { type: 'druk', wie: 'b2', op: 'a1', afstand: 1.7, manier: 'sprint', start: 0.3 }),
        stap({ type: 'verover', wie: 'b2', van: 'a1' }),
        stap({ type: 'dribbel', wie: 'b2', naar: [9.6, 18.4], manier: 'sprint' }, { type: 'druk', wie: 'a1', op: 'b2', afstand: 2, manier: 'sprint', start: 0.3 }),
        stap({ type: 'pass', van: 'b2', naar: 'tb' }),
        pauze(1.0),
      ],
    },
  },

  // 35. Mandekking-partijtje
  {
    id: 'veld-pv-mandekking',
    naam: 'Mandekking-partijtje',
    categorieen: ['partijvormen', 'verdedigen-omschakelen'],
    uitleg:
      'Partij 4 tegen 4 op vier kleine doeltjes, maar iedereen heeft een vaste tegenstander: alleen die mag jij aanvallen en alleen die mag jou aanvallen. Zonder bal draait alles om vrijlopen en je tegenstander afschudden: een loopactie de ene kant op en dan snel de andere kant op (eerst weg, dan kort komen). Als verdediger blijf je tussen je man en je eigen doeltjes en zie je bal en man tegelijk.',
    organisatie: 'Veld van 26 × 34 m met op beide korte zijden twee kleine doeltjes. Maak vaste duo’s met ongeveer even snelle spelers. Teams met hesjes, rondes van 4 minuten; daarna nieuwe duo’s.',
    benodigdheden: ['4 kleine doeltjes', '4 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 8,
    keepersNodig: 0,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: 5 tegen 5 of 6 tegen 6, steeds in vaste duo’s.',
    coachpunten: [
      'Afschudden: eerst je tegenstander meenemen, dan met een snelle draai de andere kant op',
      'Vraag de bal op het moment dat je los bent, niet als je tegenstander er nog tegenaan staat',
      'Verdedigen: tussen man en doel, half gedraaid zodat je bal en man ziet',
    ],
    variaties: {
      makkelijker: ['Eén vrije speler per team zonder vaste tegenstander', 'Groter veld'],
      moeilijker: ['Maximaal drie aanrakingen', 'Scoort jouw tegenstander, dan doe je 5 keer een opdracht (bv. hurkzit)', 'Kleiner veld'],
    },
    en: {
      naam: 'Man-marking game',
      uitleg:
        'A 4v4 game on four mini goals, but everyone has a fixed opponent: only they may challenge you and only you may challenge them. Off the ball it is all about getting free and shaking off your marker: a run one way and then quickly the other way (first away, then come short). As a defender you stay between your player and your own goals and see ball and player at the same time.',
      organisatie: '26 × 34 m pitch with two mini goals at each short end. Make fixed pairs of players with roughly the same pace. Teams in bibs, 4-minute rounds; then new pairs.',
      benodigdheden: ['4 mini goals', '4 cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: 5v5 or 6v6, always in fixed pairs.',
      coachpunten: [
        'Shaking off your marker: take them with you first, then turn sharply the other way',
        'Ask for the ball the moment you are free, not while your opponent is still tight on you',
        'Defending: between player and goal, half-turned so you can see ball and player',
      ],
      variaties: {
        makkelijker: ['One free player per team without a fixed opponent', 'Bigger pitch'],
        moeilijker: ['Three touches maximum', 'If your opponent scores, you do a 5-rep task (e.g. squats)', 'Smaller pitch'],
      },
    },
    tekening: {
      ...leeg(30, 36),
      objecten: [
        zone('z', 15, 18, 26, 34),
        doeltje('t1', 9, 1, 0),
        doeltje('t2', 21, 1, 0),
        doeltje('o1', 9, 35, 180),
        doeltje('o2', 21, 35, 180),
        speler('a1', 4, 15, 26, { kijkrichting: -90 }),
        speler('a2', 6, 8, 16, { kijkrichting: -90 }),
        speler('a3', 7, 22, 15, { kijkrichting: -90 }),
        speler('a4', 9, 15, 10, { kijkrichting: -90 }),
        B('b1', 4, 15, 23.6, { kijkrichting: 90 }),
        B('b2', 6, 8.4, 13.6, { kijkrichting: 90 }),
        B('b3', 7, 21.6, 12.6, { kijkrichting: 90 }),
        B('b4', 9, 15, 7.6, { kijkrichting: 90 }),
        bal('bal', 15, 25.45, 'a1'),
      ],
      animatie: [
        pauze(0.6),
        // Eerst weg (de verdediger mee naar het doel) …
        stap({ type: 'loop', wie: 'a3', naar: [23.4, 10.6] }, { type: 'loop', wie: 'b3', naar: [22.6, 8.2], start: 0.1 }),
        // … dan snel kort komen: los van de verdediger.
        stap({ type: 'loop', wie: 'a3', naar: [26, 17], manier: 'sprint' }, { type: 'loop', wie: 'b3', naar: [24.6, 12.8], start: 0.35 }),
        stap({ type: 'pass', van: 'a1', naar: 'a3' }),
        stap({ type: 'dribbel', wie: 'a3', via: [[27.8, 13.2]], naar: [27.2, 9.2] }, { type: 'druk', wie: 'b3', op: 'a3', afstand: 2.2, start: 0.45 }),
        stap({ type: 'schot', van: 'a3', naar: [21.4, 0.6] }),
        pauze(1.0),
      ],
    },
  },
];

zet('veld', oefeningen);
