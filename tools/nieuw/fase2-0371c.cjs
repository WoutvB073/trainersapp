// Fase 2, deel 3, batch 2 (0.37.1), deel c: Afwerken A3, A4, A8, A9, A10 uit VOORSTEL-OEFENINGEN.md.
// Overgeslagen (vrijwel gelijk aan een bestaande oefening): A2 (veld-af-voorzetten), A5 (veld-af-kaatsen-verdediger-rug),
// A6 (veld-af-kopballen-voorzet), A7 (veld-cv-kaats-doordiepen), A11 (veld-mt-hoekenjacht), A12 (veld-o6-au).
// Draaien: node tools/nieuw/fase2-0371c.cjs
const { zet } = require('./hulp.cjs');
const { goal, keeper, speler, trainer, bal, pion, hoedje, pauze, stap, zone, leeg, JO, OUD, MIDDEN, KLEUR } = require('./fase2-hulp.cjs');
const jeugdgoal = (id, x, y, hoek = 0) => ({ id, soort: 'goal', x, y, breedte: 5, hoogte: 2, ...(hoek ? { hoek } : {}) });

const oefeningen = [
  // A3. Volley na een aangooi
  {
    id: 'veld-af-volley-aangooi',
    naam: 'Volley na een aangooi',
    categorieen: ['afwerken'],
    uitleg:
      'De aangever staat naast het doel en gooit de bal met een boogje voor je. Je loopt in en schiet de bal uit de lucht op doel, zonder hem eerst aan te nemen. Eerst uit stand vanaf de stip, daarna in de loop. Haal je bal op en sluit achteraan aan.',
    organisatie: 'Op een half veld met een keeper. Aangever op 10 m schuin naast het doel, rij schutters op 18 m. De aangever heeft een stapeltje ballen. Na 6 schoten wisselt de aangever.',
    benodigdheden: ['Goal', '2 pionnen', 'Ballen'],
    spelersNodig: 3,
    keepersNodig: 1,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Houd je ogen op de bal tot je hem raakt', 'Knie over de bal en enkel gestrekt, dan blijft hij laag', 'Raak de bal op kniehoogte, niet te vroeg'],
    variaties: {
      makkelijker: ['Bal eerst één keer laten stuiten (halve volley)', 'Dichterbij'],
      moeilijker: ['Bal van verder weg en hoger', 'Om en om links en rechts', 'Een verdediger loopt mee'],
    },
    en: {
      naam: 'Volley from a throw',
      uitleg:
        'The server stands beside the goal and throws the ball in a loop in front of you. Run in and shoot the ball out of the air at goal, without controlling it first. First standing from the penalty spot, then on the move. Collect your ball and join the back of the line.',
      organisatie: 'On half a pitch with a keeper. Server 10 m out to the side of the goal, line of shooters at 18 m. The server has a pile of balls. Change server after 6 shots.',
      benodigdheden: ['Goal', '2 cones', 'Balls'],
      coachpunten: ['Keep your eyes on the ball until you strike it', 'Knee over the ball and ankle locked, so it stays low', 'Strike the ball at knee height, not too early'],
      variaties: {
        makkelijker: ['Let it bounce once first (half-volley)', 'Closer in'],
        moeilijker: ['Ball from further away and higher', 'Left and right foot alternately', 'A defender tracks you'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 22, y: -3, breedte: 26, lengte: 26 },
      camera: 'schuin',
      rijen: [{ id: 'r1', x: 36, y: 18.5, richting: 70, spelers: ['a1', 'a2', 'a3'] }],
      objecten: [goal, keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }), trainer(26.5, 9.5, 0), bal('b1', 27.05, 9.5, 't1'), bal('b2', 25.6, 10.2), speler('a1', 9, 0, 0), speler('a2', 10, 0, 0), speler('a3', 11, 0, 0)],
      animatie: [
        pauze(0.5),
        stap({ type: 'loop', wie: 'a1', naar: [34.6, 12], duur: 1.4 }, { type: 'pass', van: 't1', naar: 'a1', worp: 'onderhands', hoogte: 'halfhoog', eindHoogte: 0.6, start: 0.7 }),
        stap({ type: 'schot', van: 'a1', naar: [31.4, 0.3], direct: true, hoogte: 'laag', afloop: 'goal' }),
        stap({ type: 'pak', wie: 't1', bal: 'b2' }, { type: 'aansluiten', wie: 'a1', rij: 'r1' }),
        stap({ type: 'loop', wie: 'a2', naar: [34.2, 11.6], duur: 1.4 }, { type: 'pass', van: 't1', naar: 'a2', worp: 'onderhands', hoogte: 'halfhoog', eindHoogte: 0.6, start: 0.7 }),
        stap({ type: 'schot', van: 'a2', naar: [36.6, 0.4], direct: true, hoogte: 'laag', afloop: 'vangt' }),
        pauze(0.8),
      ],
    },
  },

  // A4. Schieten in drie zones
  {
    id: 'veld-af-schieten-drie-zones',
    naam: 'Schieten in drie zones',
    categorieen: ['afwerken', 'spelletjes'],
    uitleg:
      'Voor het doel liggen drie zones naast en achter elkaar: dichtbij, middel en ver. Hoe verder weg je schiet, hoe meer een doelpunt waard is: 1, 2 of 3 punten. Elke speler kiest zelf uit welke zone hij schiet. Dribbel de zone in, schiet en haal je bal op. Wie heeft na tien schoten de meeste punten?',
    organisatie: 'Op een half veld met een keeper. Drie zones van 6 m diep: 8–14 m, 14–20 m en 20–26 m. Rij op 30 m, iedereen een bal. Na tien schoten de punten tellen.',
    benodigdheden: ['Goal', '8 hoedjes', 'Ballen'],
    spelersNodig: 3,
    keepersNodig: 1,
    leeftijden: MIDDEN,
    doorwisselbaar: true,
    coachpunten: ['Durf te kiezen: ver is meer waard, dichtbij is makkelijker', 'Kijk op voordat je schiet: waar staat de keeper?', 'Raak de bal met je wreef en houd hem laag'],
    variaties: {
      makkelijker: ['Kleinere zones, dichter bij het doel', 'Zonder keeper of met een klein doel'],
      moeilijker: ['Een verdediger loopt mee vanaf de rij', 'Alleen in één keer na een pass'],
    },
    en: {
      naam: 'Shooting from three zones',
      uitleg:
        'In front of goal there are three zones one behind the other: close, middle and far. The further out you shoot from, the more a goal is worth: 1, 2 or 3 points. Each player chooses which zone to shoot from. Dribble into the zone, shoot and collect your ball. Who has the most points after ten shots?',
      organisatie: 'On half a pitch with a keeper. Three zones, each 6 m deep: 8–14 m, 14–20 m and 20–26 m. Line at 30 m, a ball each. Count the points after ten shots.',
      benodigdheden: ['Goal', '8 disc cones', 'Balls'],
      coachpunten: ['Dare to choose: far is worth more, close is easier', 'Look up before you shoot: where is the keeper?', 'Strike with your instep and keep it low'],
      variaties: {
        makkelijker: ['Smaller zones, closer to goal', 'No keeper, or a small goal'],
        moeilijker: ['A defender chases from the line', 'Only first time after a pass'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 18, y: -3, breedte: 32, lengte: 36 },
      camera: 'schuin',
      rijen: [{ id: 'r1', x: 34, y: 30, richting: 80, spelers: ['a1', 'a2', 'a3'] }],
      objecten: [
        goal,
        keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }),
        zone('z1', 34, 11, 20, 6, KLEUR.groen),
        zone('z2', 34, 17, 20, 6, KLEUR.geel),
        zone('z3', 34, 23, 20, 6, '#ff922b'),
        speler('a1', 7, 0, 0),
        speler('a2', 8, 0, 0),
        speler('a3', 9, 0, 0),
        bal('b1', 0, 0, 'a1'),
        bal('b2', 0, 0, 'a2'),
        bal('b3', 0, 0, 'a3'),
      ],
      animatie: [
        pauze(0.5),
        {
          herhaal: {
            spelers: ['a1', 'a2', 'a3'],
            tussen: 4.6,
            waarden: {
              zone: [
                [30.4, 21.6],
                [37.2, 12.6],
                [33.8, 16.4],
              ],
              doel: [
                [31.2, 0.3],
                [37.4, 0.3],
                [36.6, 0.5],
              ],
              afloop: ['goal', 'goal', 'vangt'],
              terug: [
                [24, 24],
                [44, 24],
                [24, 24],
              ],
            },
            stappen: [
              stap({ type: 'dribbel', wie: '@', naar: '@zone' }),
              stap({ type: 'schot', van: '@', naar: '@doel', hoogte: 'laag', afloop: '@afloop' }),
              stap({ type: 'loop', wie: '@', naar: '@terug', spoor: false }),
              stap({ type: 'aansluiten', wie: '@', rij: 'r1' }),
            ],
          },
        },
        pauze(0.6),
      ],
    },
  },

  // A8. Afronden na een dribbel van opzij
  {
    id: 'veld-af-dribbel-van-opzij',
    naam: 'Afronden na een dribbel van opzij',
    categorieen: ['afwerken'],
    uitleg:
      'Je start op de flank, dribbelt schuin naar binnen en schiet met de binnenkant van je voet in de verre hoek: de bal draait om de keeper heen. Eerst vanaf links met je rechtervoet, daarna vanaf rechts met je linkervoet. Haal je bal op en sluit aan bij de andere rij.',
    organisatie: 'Op een half veld met een keeper. Twee rijen op de flanken, op 22 m van het doel en 14 m opzij. Iedereen een bal; om en om vanaf links en rechts.',
    benodigdheden: ['Goal', '4 pionnen', 'Ballen'],
    spelersNodig: 4,
    keepersNodig: 1,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Dribbel naar binnen tot je het doel open voor je hebt', 'Binnenkant van je voet, buig de bal om de keeper heen', 'Mik op de verre paal: mist hij, dan komt de bal nog voor het doel'],
    variaties: {
      makkelijker: ['Dichterbij beginnen', 'Schieten mag met de wreef'],
      moeilijker: ['Een verdediger loopt mee', 'Na een schijnbeweging naar binnen', 'Schieten met je zwakke voet'],
    },
    en: {
      naam: 'Finishing after cutting in from the side',
      uitleg:
        'You start on the wing, dribble diagonally inside and shoot with the inside of your foot into the far corner: the ball curls round the keeper. First from the left with your right foot, then from the right with your left foot. Collect your ball and join the other line.',
      organisatie: 'On half a pitch with a keeper. Two lines on the wings, 22 m from goal and 14 m to the side. A ball each; alternate left and right.',
      benodigdheden: ['Goal', '4 cones', 'Balls'],
      coachpunten: ['Dribble inside until the goal opens up in front of you', 'Inside of your foot, curl the ball round the keeper', 'Aim at the far post: if you miss, the ball is still in front of goal'],
      variaties: {
        makkelijker: ['Start closer in', 'You may shoot with your instep'],
        moeilijker: ['A defender tracks you', 'Cut inside after a dummy', 'Shoot with your weaker foot'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 12, y: -3, breedte: 44, lengte: 30 },
      camera: 'schuin',
      rijen: [
        { id: 'rL', x: 20, y: 22, richting: 160, spelers: ['a1', 'a3'] },
        { id: 'rR', x: 48, y: 22, richting: 20, spelers: ['a2', 'a4'] },
      ],
      objecten: [goal, keeper('k1', 1, 34, 1.5, { verdedigt: 'g1' }), pion('pl', 19.4, 23.4), pion('pr', 48.6, 23.4), speler('a1', 11, 0, 0), speler('a3', 10, 0, 0), speler('a2', 7, 0, 0), speler('a4', 9, 0, 0), bal('b1', 0, 0, 'a1'), bal('b2', 0, 0, 'a2')],
      animatie: [
        pauze(0.5),
        stap({ type: 'dribbel', wie: 'a1', via: [[22.6, 17]], naar: [27.6, 13.6] }),
        stap({ type: 'schot', van: 'a1', naar: [37.4, 0.4], hoogte: 'laag', afloop: 'goal' }),
        stap({ type: 'loop', wie: 'a1', via: [[30, 18]], naar: [50, 26], spoor: false }, { type: 'dribbel', wie: 'a2', via: [[45.4, 17]], naar: [40.4, 13.6], start: 0.6 }),
        stap({ type: 'schot', van: 'a2', naar: [30.6, 0.4], hoogte: 'laag', afloop: 'vangt' }, { type: 'aansluiten', wie: 'a1', rij: 'rR' }),
        pauze(0.8),
      ],
    },
  },

  // A9. Twee doelen, één schutter
  {
    id: 'veld-af-twee-doelen-een-schutter',
    naam: 'Twee doelen, één schutter',
    categorieen: ['afwerken'],
    uitleg:
      'Twee doelen met elk een keeper staan tegenover elkaar. De trainer staat aan de zijkant en speelt de bal in op de schutter in het midden. Terwijl de bal onderweg is roept hij op welk doel je moet schieten. Neem de bal aan, draai naar dat doel en schiet. Daarna is de volgende aan de beurt.',
    organisatie: 'Twee jeugdgoals op 30 m van elkaar, elk met een keeper. De trainer staat halverwege aan de zijkant met ballen; de schutters wachten naast hem. Series van 6 ballen.',
    benodigdheden: ['2 jeugdgoals', '4 pionnen', 'Ballen'],
    spelersNodig: 2,
    keepersNodig: 2,
    leeftijden: OUD,
    doorwisselbaar: true,
    coachpunten: ['Sta half open, zodat je beide doelen kunt zien', 'Eerste aanraking al in de richting van het goede doel', 'Snel schieten: binnen twee aanrakingen'],
    variaties: {
      makkelijker: ['De trainer roept het doel al vóór de pass', 'Bal over de grond'],
      moeilijker: ['Een verdediger in het midden', 'Bal halfhoog', 'In één keer schieten'],
    },
    en: {
      naam: 'Two goals, one shooter',
      uitleg:
        'Two goals with a keeper each face each other. The coach stands at the side and plays the ball in to the shooter in the middle. While the ball is travelling, the coach calls which goal to shoot at. Control the ball, turn to that goal and shoot. Then it is the next player’s turn.',
      organisatie: 'Two youth goals 30 m apart, each with a keeper. The coach stands halfway at the side with balls; the shooters wait next to the coach. Sets of 6 balls.',
      benodigdheden: ['2 youth goals', '4 cones', 'Balls'],
      coachpunten: ['Stand half-turned so you can see both goals', 'First touch already towards the right goal', 'Shoot quickly: within two touches'],
      variaties: {
        makkelijker: ['The coach calls the goal before the pass', 'Ball along the ground'],
        moeilijker: ['A defender in the middle', 'Ball at half height', 'Shoot first time'],
      },
    },
    tekening: {
      ...leeg(24, 32),
      objecten: [
        jeugdgoal('g1', 12, 1),
        jeugdgoal('g2', 12, 31, 180),
        keeper('k1', 1, 12, 2.2, { verdedigt: 'g1' }),
        keeper('k2', 1, 12, 29.8, { verdedigt: 'g2', kijkrichting: -90 }),
        trainer(22, 16, 180),
        speler('a1', 9, 10.6, 16, { kijkrichting: 0 }),
        speler('a2', 10, 22.4, 19, { kijkrichting: 180 }),
        bal('b1', 21.45, 16, 't1'),
        bal('b2', 22.6, 14.6),
      ],
      animatie: [
        pauze(0.5),
        // "Boven!"
        stap({ type: 'pass', van: 't1', naar: 'a1' }),
        stap({ type: 'dribbel', wie: 'a1', naar: [11.2, 13.4], duur: 0.6 }),
        stap({ type: 'schot', van: 'a1', naar: [13.6, 1], hoogte: 'laag', afloop: 'goal' }),
        stap({ type: 'loop', wie: 'a1', via: [[16, 15]], naar: [21, 20.5], spoor: false }, { type: 'loop', wie: 'a2', via: [[17, 18.6]], naar: [11, 16], start: 0.2 }, { type: 'pak', wie: 't1', bal: 'b2', start: 0.4 }),
        // "Onder!"
        stap({ type: 'pass', van: 't1', naar: 'a2' }),
        stap({ type: 'dribbel', wie: 'a2', naar: [11.4, 18.6], duur: 0.6 }),
        stap({ type: 'schot', van: 'a2', naar: [10.4, 31], hoogte: 'laag', afloop: 'vangt' }),
        pauze(0.8),
      ],
    },
  },

  // A10. Penaltykoning
  {
    id: 'veld-af-penaltykoning',
    naam: 'Penaltykoning',
    categorieen: ['afwerken', 'spelletjes'],
    uitleg:
      'Iedereen neemt om de beurt een penalty. Scoor je, dan blijf je in het spel. Mis je of houdt de keeper hem tegen, dan ga jij in het doel en wordt de keeper schutter. Wie aan het eind de meeste penalty’s heeft benut, is de penaltykoning.',
    organisatie: 'Op een half veld met een groot doel (of een jeugdgoal op 9 m). Rij achter de penaltystip, één bal per speler. De keeper wisselt steeds; een echte keeper mag de hele tijd blijven staan.',
    benodigdheden: ['Goal', 'Ballen', '1 keepershesje'],
    spelersNodig: 3,
    keepersNodig: 1,
    leeftijden: JO,
    doorwisselbaar: true,
    coachpunten: ['Kies je hoek vóór de aanloop en verander niet meer', 'Kijk naar de bal als je trapt, niet naar de keeper', 'Keeper: blijf zo lang mogelijk staan en duik pas als de bal geraakt wordt'],
    variaties: {
      makkelijker: ['Dichterbij (7 m)', 'Een klein doel zonder keeper'],
      moeilijker: ['Alleen met je zwakke voet', 'Na een sprint van 10 m meteen de penalty', 'Hoek vooraf aanwijzen'],
    },
    en: {
      naam: 'Penalty king',
      uitleg:
        'Everyone takes a penalty in turn. If you score, you stay in. If you miss or the keeper saves it, you go in goal and the keeper becomes a shooter. Whoever has scored the most penalties at the end is the penalty king.',
      organisatie: 'On half a pitch with a full-size goal (or a youth goal at 9 m). Line behind the penalty spot, one ball per player. The keeper keeps changing; a real goalkeeper may stay in goal the whole time.',
      benodigdheden: ['Goal', 'Balls', '1 goalkeeper bib'],
      coachpunten: ['Choose your corner before the run-up and do not change it', 'Watch the ball as you strike it, not the keeper', 'Keeper: stay on your feet as long as possible and only dive when the ball is struck'],
      variaties: {
        makkelijker: ['Closer (7 m)', 'A small goal with no keeper'],
        moeilijker: ['Weaker foot only', 'Sprint 10 m, then take the penalty straight away', 'Point to your corner beforehand'],
      },
    },
    tekening: {
      veld: { type: 'half' },
      weergave: { x: 22, y: -3, breedte: 24, lengte: 22 },
      camera: 'achter',
      rijen: [{ id: 'r1', x: 31.6, y: 15, richting: 110, spelers: ['a1', 'a2', 'a3'] }],
      objecten: [goal, keeper('k1', 1, 34, 0.6, { verdedigt: 'g1' }), speler('a1', 7, 0, 0), speler('a2', 9, 0, 0), speler('a3', 10, 0, 0), bal('b1', 0, 0, 'a1'), bal('b2', 0, 0, 'a2'), bal('b3', 0, 0, 'a3')],
      animatie: [
        pauze(0.5),
        {
          herhaal: {
            spelers: ['a1', 'a2', 'a3'],
            waarden: {
              doel: [
                [37.2, 0.3],
                [31, 0.4],
                [30.8, 0.3],
              ],
              afloop: ['goal', 'vangt', 'goal'],
            },
            stappen: [
              stap({ type: 'dribbel', wie: '@', via: [[32.6, 12.8]], naar: [33.7, 11.7], duur: 1.4 }),
              stap({ type: 'schot', van: '@', naar: '@doel', hoogte: 'laag', afloop: '@afloop', afloopNaar: [27.5, 6] }),
              pauze(0.4),
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
