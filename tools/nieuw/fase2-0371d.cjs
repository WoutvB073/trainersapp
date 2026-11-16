// Fase 2, deel 3, batch 2 (0.37.1), deel d: Positiespel PS5, PS6, PS8, PS10 uit VOORSTEL-OEFENINGEN.md.
// Overgeslagen (vrijwel gelijk aan een bestaande oefening): PS1 (veld-wu-dubbele-rondo / veld-ps-omschakelen), PS2 (veld-ps-omschakelen),
// PS3 (veld-ps-4-4-2-jokers), PS4 (veld-ps-door-de-linies), PS7 (veld-ps-opbouw-4-keeper-2), PS9 (veld-ps-rondo-3-1).
// Draaien: node tools/nieuw/fase2-0371d.cjs
const { zet } = require('./hulp.cjs');
const { speler, bal, pion, hoedje, pauze, stap, B, C, zone, leeg, JO, OUD, MIDDEN, KLEUR } = require('./fase2-hulp.cjs');
const J = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'J', ...extra });

const oefeningen = [
  // PS5. Rondo met twee kleuren
  {
    id: 'veld-ps-rondo-twee-kleuren',
    naam: 'Rondo met twee kleuren',
    categorieen: ['positiespel', 'warming-up'],
    uitleg:
      'Zes buitenspelers in twee kleuren staan om het vak, om en om rood en blauw. Je mag de bal alleen naar iemand van de andere kleur spelen. De twee jagers in het midden weten dat en proberen de passlijn te lezen. Verovert een jager de bal, dan ruilt hij met wie de bal verloor.',
    organisatie: 'Vak van 12 × 12 m. Zes buitenspelers (3 rood, 3 blauw) en twee jagers in hesjes. Eén bal. Rondes van 2 minuten.',
    benodigdheden: ['4 pionnen', '1 bal', 'Hesjes in 3 kleuren'],
    spelersNodig: 8,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: acht buitenspelers en drie jagers in een groter vak.',
    coachpunten: ['Weet al vóór de bal komt wie van de andere kleur vrij staat', 'Speel weg van de jagers, niet door hen heen', 'Beweeg langs de lijn om een passlijn open te maken'],
    variaties: {
      makkelijker: ['Eén jager', 'Groter vak'],
      moeilijker: ['Alles in één keer', 'De trainer wisselt de regel: alleen naar dezelfde kleur'],
    },
    en: {
      naam: 'Two-colour rondo',
      uitleg:
        'Six outside players in two colours stand round the area, alternating red and blue. You may only pass to someone of the other colour. The two chasers in the middle know this and try to read the passing lane. If a chaser wins the ball, they swap with the player who lost it.',
      organisatie: '12 × 12 m area. Six outside players (3 red, 3 blue) and two chasers in bibs. One ball. Rounds of 2 minutes.',
      benodigdheden: ['4 cones', '1 ball', 'Bibs in 3 colours'],
      meerSpelers: 'With more players: eight outside players and three chasers in a bigger area.',
      coachpunten: ['Before the ball arrives, know who of the other colour is free', 'Play away from the chasers, not through them', 'Move along the line to open up a passing lane'],
      variaties: {
        makkelijker: ['One chaser', 'Bigger area'],
        moeilijker: ['Everything one touch', 'The coach changes the rule: same colour only'],
      },
    },
    tekening: {
      ...leeg(15, 15),
      objecten: [
        zone('z', 7.5, 7.5, 12, 12),
        pion('p1', 1.5, 1.5),
        pion('p2', 13.5, 1.5),
        pion('p3', 1.5, 13.5),
        pion('p4', 13.5, 13.5),
        speler('a1', 1, 4.5, 1.7, { kijkrichting: 90 }),
        B('b1', 2, 10.5, 1.7, { kijkrichting: 90 }),
        speler('a2', 3, 13.3, 7.5, { kijkrichting: 180 }),
        B('b2', 4, 10.5, 13.3, { kijkrichting: -90 }),
        speler('a3', 5, 4.5, 13.3, { kijkrichting: -90 }),
        B('b3', 6, 1.7, 7.5, { kijkrichting: 0 }),
        C('c1', 7, 6.4, 6, { kijkrichting: 90 }),
        C('c2', 8, 8.8, 9, { kijkrichting: -90 }),
        bal('bal', 4.5, 2.25, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'b1' }, { type: 'loop', wie: 'c1', naar: [8.2, 5], start: 0.2 }, { type: 'loop', wie: 'c2', naar: [9.4, 7.6], start: 0.3 }),
        stap({ type: 'pass', van: 'b1', naar: 'a2' }, { type: 'loop', wie: 'c1', naar: [9.6, 6.4], start: 0.2 }, { type: 'loop', wie: 'c2', naar: [8, 9.6], start: 0.3 }),
        stap({ type: 'pass', van: 'a2', naar: 'b2' }, { type: 'loop', wie: 'c2', naar: [8.6, 11], start: 0.2 }, { type: 'loop', wie: 'c1', naar: [7.4, 7], start: 0.3 }),
        stap({ type: 'pass', van: 'b2', naar: 'a3' }, { type: 'loop', wie: 'c2', naar: [6.2, 11.2], start: 0.2 }),
        stap({ type: 'pass', van: 'a3', naar: 'b3' }, { type: 'loop', wie: 'c1', naar: [4.2, 8], start: 0.2 }),
        pauze(0.8),
      ],
    },
  },

  // PS6. 2 tegen 1 in vier vakjes
  {
    id: 'veld-ps-2-1-vier-vakjes',
    naam: '2 tegen 1 in vier vakjes',
    categorieen: ['positiespel'],
    uitleg:
      'Vier vakjes in een vierkant, in elk vakje twee aanvallers tegen één verdediger. Na vijf passes zonder dat de verdediger de bal raakt, speel je de bal door naar het vakje ernaast. Zo gaat de bal het hele vierkant rond. Verovert een verdediger de bal, dan ruilt hij met wie de bal verloor.',
    organisatie: 'Vier vakjes van 7 × 7 m in een vierkant, met 2 m ertussen. In elk vakje twee aanvallers en een verdediger. Eén bal (of twee voor ervaren groepen). Na 4 minuten nieuwe verdedigers.',
    benodigdheden: ['16 hoedjes', '2 ballen', 'Hesjes'],
    spelersNodig: 12,
    keepersNodig: 0,
    leeftijden: ['jo8-11', 'jo12-15'],
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: een vijfde vakje, of drie aanvallers tegen één in elk vakje.',
    coachpunten: ['Sta schuin tegenover elkaar, nooit op één lijn met de verdediger', 'Na je pass meteen een nieuwe hoek zoeken', 'Doorspelen naar het volgende vakje: strak en op de voet'],
    variaties: {
      makkelijker: ['Drie passes in plaats van vijf', 'Grotere vakjes'],
      moeilijker: ['Twee ballen tegelijk', 'Alles in één keer', 'Doorspelen naar het vakje schuin tegenover'],
    },
    en: {
      naam: '2v1 in four boxes',
      uitleg:
        'Four boxes in a square, with two attackers against one defender in each box. After five passes without the defender touching the ball, play the ball on to the next box. That way the ball travels round the whole square. If a defender wins the ball, they swap with the player who lost it.',
      organisatie: 'Four 7 × 7 m boxes in a square, 2 m apart. Two attackers and a defender in each box. One ball (or two for experienced groups). New defenders after 4 minutes.',
      benodigdheden: ['16 disc cones', '2 balls', 'Bibs'],
      meerSpelers: 'With more players: a fifth box, or 3v1 in each box.',
      coachpunten: ['Stand at an angle to each other, never in line with the defender', 'After your pass, look straight away for a new angle', 'Passing on to the next box: firm and to feet'],
      variaties: {
        makkelijker: ['Three passes instead of five', 'Bigger boxes'],
        moeilijker: ['Two balls at once', 'Everything one touch', 'Pass on to the box diagonally opposite'],
      },
    },
    tekening: {
      ...leeg(18, 18),
      objecten: [
        zone('v1', 4.5, 4.5, 7, 7),
        zone('v2', 13.5, 4.5, 7, 7),
        zone('v3', 13.5, 13.5, 7, 7),
        zone('v4', 4.5, 13.5, 7, 7),
        speler('a1', 1, 2.2, 2.6, { kijkrichting: 30 }),
        speler('a2', 2, 6.6, 6.4, { kijkrichting: -150 }),
        B('d1', 3, 5.6, 3, { kijkrichting: 180 }),
        speler('a3', 4, 11.4, 6.6, { kijkrichting: -30 }),
        speler('a4', 5, 15.8, 2.4, { kijkrichting: 150 }),
        B('d2', 6, 12.6, 3.2, { kijkrichting: 0 }),
        speler('a5', 7, 15.8, 11.4, { kijkrichting: 150 }),
        speler('a6', 8, 11.4, 15.8, { kijkrichting: -30 }),
        B('d3', 9, 14.6, 15, { kijkrichting: 180 }),
        speler('a7', 10, 2.4, 11.4, { kijkrichting: 30 }),
        speler('a8', 11, 6.6, 15.6, { kijkrichting: -150 }),
        B('d4', 12, 3.4, 15.2, { kijkrichting: 0 }),
        bal('bal', 2.7, 2.9, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'd1', naar: [5.8, 2.4], start: 0.2, duur: 0.8 }),
        stap({ type: 'pass', van: 'a2', naar: 'a1' }, { type: 'loop', wie: 'a1', naar: [2.6, 6], duur: 0.8 }, { type: 'loop', wie: 'd1', naar: [4.2, 3.4], start: 0.2, duur: 0.8 }),
        stap({ type: 'pass', van: 'a1', naar: 'a2' }, { type: 'loop', wie: 'a2', naar: [6.4, 7.4], duur: 0.8 }),
        // Doorspelen naar het vakje rechts.
        stap({ type: 'pass', van: 'a2', naar: 'a3' }, { type: 'loop', wie: 'd2', naar: [14.4, 6.2], start: 0.3, duur: 0.9 }),
        stap({ type: 'pass', van: 'a3', naar: 'a4' }, { type: 'loop', wie: 'a3', naar: [11.6, 2.8], start: 0.2, duur: 0.9 }),
        stap({ type: 'pass', van: 'a4', naar: 'a3' }, { type: 'loop', wie: 'd2', naar: [14.4, 4.6], start: 0.2, duur: 0.8 }),
        // Door naar het vakje eronder.
        stap({ type: 'pass', van: 'a3', naar: 'a5' }, { type: 'loop', wie: 'd3', naar: [14, 13.2], start: 0.3, duur: 0.9 }),
        pauze(0.8),
      ],
    },
  },

  // PS8. Balbezit met doelgebieden
  {
    id: 'veld-ps-balbezit-hoekvakken',
    naam: 'Balbezit met doelgebieden',
    categorieen: ['positiespel'],
    uitleg:
      'Vier tegen vier plus twee jokers, die altijd met de balbezitter meespelen. In elke hoek van het veld ligt een klein vak. Je scoort een punt als je de bal naar een medespeler speelt die in een hoekvak loopt en hem daar aanneemt. Je mag niet in een hoekvak blijven wachten: kom er pas in als de bal eraan komt.',
    organisatie: 'Vak van 24 × 24 m met in elke hoek een vak van 4 × 4 m. Twee teams van vier en twee jokers. Na een punt houdt het team de bal en speelt het naar een ander hoekvak.',
    benodigdheden: ['16 hoedjes', 'Ballen', 'Hesjes in 3 kleuren'],
    spelersNodig: 10,
    keepersNodig: 0,
    leeftijden: OUD,
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: vijf tegen vijf plus twee jokers in een groter vak.',
    coachpunten: ['Maak het veld groot: altijd iemand breed en diep', 'Loop pas het hoekvak in als de passer kan spelen', 'Na een punt meteen naar de andere kant verplaatsen'],
    variaties: {
      makkelijker: ['Drie jokers', 'Grotere hoekvakken'],
      moeilijker: ['Eén joker', 'Maximaal twee keer raken', 'Alleen een punt na een pass in één keer'],
    },
    en: {
      naam: 'Possession with target corners',
      uitleg:
        'Four against four plus two jokers, who always play with the team in possession. In each corner of the pitch there is a small box. You score a point by passing to a teammate who runs into a corner box and controls the ball there. You may not wait in a corner box: only go in when the ball is coming.',
      organisatie: '24 × 24 m area with a 4 × 4 m box in each corner. Two teams of four and two jokers. After a point the team keeps the ball and plays towards another corner box.',
      benodigdheden: ['16 disc cones', 'Balls', 'Bibs in 3 colours'],
      meerSpelers: 'With more players: five against five plus two jokers in a bigger area.',
      coachpunten: ['Make the pitch big: always someone wide and deep', 'Only run into the corner box when the passer is ready to play', 'After a point, switch to the other side straight away'],
      variaties: {
        makkelijker: ['Three jokers', 'Bigger corner boxes'],
        moeilijker: ['One joker', 'Two touches maximum', 'Only a point after a first-time pass'],
      },
    },
    tekening: {
      ...leeg(26, 26),
      objecten: [
        zone('z', 13, 13, 24, 24),
        zone('h1', 3, 3, 4, 4, KLEUR.geel),
        zone('h2', 23, 3, 4, 4, KLEUR.geel),
        zone('h3', 3, 23, 4, 4, KLEUR.geel),
        zone('h4', 23, 23, 4, 4, KLEUR.geel),
        speler('a1', 1, 9, 18, { kijkrichting: -45 }),
        speler('a2', 2, 17, 15, { kijkrichting: -120 }),
        speler('a3', 3, 7, 9, { kijkrichting: 0 }),
        speler('a4', 4, 18, 8, { kijkrichting: 180 }),
        B('b1', 5, 11, 15, { kijkrichting: 90 }),
        B('b2', 6, 14, 11, { kijkrichting: 90 }),
        B('b3', 7, 9, 12, { kijkrichting: 0 }),
        B('b4', 8, 16, 18.5, { kijkrichting: -90 }),
        J('j1', 9, 3, 13, { kijkrichting: 0 }),
        J('j2', 10, 23, 13, { kijkrichting: 180 }),
        bal('bal', 9.4, 17.6, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'j1' }, { type: 'loop', wie: 'b3', naar: [6.4, 13.4], start: 0.3 }, { type: 'loop', wie: 'a3', naar: [8.4, 6.8], start: 0.2 }),
        stap({ type: 'pass', van: 'j1', naar: 'a3' }, { type: 'loop', wie: 'b2', naar: [11.6, 8.8], start: 0.2 }, { type: 'loop', wie: 'a4', naar: [19, 6], start: 0.2 }),
        stap({ type: 'pass', van: 'a3', naar: 'a2' }, { type: 'loop', wie: 'a2', naar: [16.4, 12.6], duur: 0.8 }, { type: 'loop', wie: 'b4', naar: [17.6, 15.2], start: 0.3 }),
        // Diepte-actie: de vier loopt in het hoekvak rechtsboven en krijgt de bal.
        stap({ type: 'loop', wie: 'a4', naar: [22.4, 3.4], manier: 'sprint' }, { type: 'pass', van: 'a2', naar: 'a4', start: 0.45 }, { type: 'loop', wie: 'b2', naar: [16.6, 7], start: 0.3 }),
        pauze(1),
      ],
    },
  },

  // PS10. Overtal aan de zijkant
  {
    id: 'veld-ps-overtal-zijkant',
    naam: 'Overtal aan de zijkant',
    categorieen: ['positiespel'],
    uitleg:
      'Zes tegen vier op een brede strook. Het team met zes speelt de bal rond en maakt bewust een overtal aan één kant: drie tegen twee langs de zijlijn. Zodra daar een speler vrij staat, speel je hem aan en dribbelt hij over de lijn aan het eind. Verovert het team met vier de bal, dan scoren zij door over de andere lijn te dribbelen.',
    organisatie: 'Strook van 40 × 24 m. Zes tegen vier; elk team scoort door met de bal aan de voet over de lijn van de ander te dribbelen. Na 4 minuten wisselen twee spelers van team.',
    benodigdheden: ['8 pionnen', 'Ballen', 'Hesjes'],
    spelersNodig: 10,
    keepersNodig: 0,
    leeftijden: ['jo16-19'],
    doorwisselbaar: false,
    meerSpelers: 'Met meer spelers: zeven tegen vijf, of een derde team dat na elke aanval inwisselt.',
    coachpunten: ['Trek de verdedigers naar één kant met korte passes', 'Kom met drie spelers samen aan de bal: één diep, één breed, één kort', 'Speel de vrije man aan op het moment dat de verdediger moet kiezen'],
    variaties: {
      makkelijker: ['Zeven tegen vier', 'Bredere strook'],
      moeilijker: ['Zes tegen vijf', 'Maximaal drie keer raken'],
    },
    en: {
      naam: 'Overload on the flank',
      uitleg:
        'Six against four on a wide strip. The team of six moves the ball round and deliberately creates an overload on one side: three against two along the touchline. As soon as a player is free there, play them in and they dribble over the end line. If the team of four wins the ball, they score by dribbling over the other line.',
      organisatie: '40 × 24 m strip. Six against four; each team scores by dribbling over the other team’s line. After 4 minutes two players change teams.',
      benodigdheden: ['8 cones', 'Balls', 'Bibs'],
      meerSpelers: 'With more players: seven against five, or a third team that rotates in after each attack.',
      coachpunten: ['Draw the defenders to one side with short passes', 'Get three players around the ball: one deep, one wide, one short', 'Find the free player at the moment the defender has to choose'],
      variaties: {
        makkelijker: ['Seven against four', 'Wider strip'],
        moeilijker: ['Six against five', 'Three touches maximum'],
      },
    },
    tekening: {
      ...leeg(42, 26),
      objecten: [
        zone('z', 21, 13, 40, 24),
        pion('p1', 1, 1),
        pion('p2', 41, 1),
        pion('p3', 1, 25),
        pion('p4', 41, 25),
        speler('a1', 1, 8, 13, { kijkrichting: 0 }),
        speler('a2', 2, 14, 4, { kijkrichting: 0 }),
        speler('a3', 3, 14, 22, { kijkrichting: 0 }),
        speler('a4', 4, 22, 9, { kijkrichting: 0 }),
        speler('a5', 5, 22, 17.5, { kijkrichting: 0 }),
        speler('a6', 6, 30, 13, { kijkrichting: 180 }),
        B('b1', 7, 19, 13, { kijkrichting: 180 }),
        B('b2', 8, 26, 6, { kijkrichting: 180 }),
        B('b3', 9, 26, 19, { kijkrichting: 180 }),
        B('b4', 10, 33, 16.5, { kijkrichting: 180 }),
        bal('bal', 8.55, 13, 'a1'),
      ],
      animatie: [
        pauze(0.5),
        stap({ type: 'pass', van: 'a1', naar: 'a3' }, { type: 'loop', wie: 'b3', naar: [24, 20.4], start: 0.3 }, { type: 'loop', wie: 'b1', naar: [18, 16.4], start: 0.3 }, { type: 'loop', wie: 'a5', naar: [21, 21.6], start: 0.2 }),
        // Overtal aan de onderkant: drie rode spelers tegen twee blauwe.
        stap({ type: 'pass', van: 'a3', naar: 'a5' }, { type: 'loop', wie: 'a6', naar: [29, 22.6], start: 0.2, manier: 'sprint' }, { type: 'loop', wie: 'b3', naar: [23.4, 19.4], start: 0.3 }, { type: 'loop', wie: 'b4', naar: [32.6, 20.4], start: 0.3 }),
        stap({ type: 'pass', van: 'a5', naar: 'a3', direct: true }, { type: 'loop', wie: 'a3', naar: [17, 22.4], duur: 0.6 }, { type: 'loop', wie: 'b3', naar: [19, 19.8], start: 0.2 }),
        stap({ type: 'pass', van: 'a3', naar: 'a6' }),
        stap({ type: 'dribbel', wie: 'a6', naar: [41.4, 23], manier: 'sprint' }, { type: 'loop', wie: 'b4', naar: [36, 19.4], start: 0.3 }),
        pauze(0.8),
      ],
    },
  },
];

module.exports = { oefeningen };
if (require.main === module) zet('veld', oefeningen);
