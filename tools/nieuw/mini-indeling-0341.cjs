// 0.34.1: de mini's in O6 (de jongsten, tot ±6 jaar: speels, verhaaltjes, spelvormen) en O7 (±6–7 jaar: echte techniek en duels).
// De opslag blijft gelijk: 'mini-3-5' is O6 en 'mini-5-7' is O7. Deze lijst zegt per oefening welke mini-groep(en) erbij horen; de
// JO-groepen blijven staan. Daarna worden vijf bestaande oefeningen beter gemaakt (in plaats van een bijna gelijke nieuwe).
// Draaien: node tools/nieuw/mini-indeling-0341.cjs
const fs = require('fs');
const path = require('path');

const MAP = path.join(__dirname, '..', '..', 'src', 'data', 'oefeningen', 'veld');
const EN = path.join(__dirname, '..', '..', 'src', 'data', 'en');
const O6 = 'mini-3-5';
const O7 = 'mini-5-7';

// Alleen O6: speelse vormen met een verhaaltje, of te eenvoudig voor O7 (geen keuze, geen duel, weinig techniek).
const ALLEEN_O6 = [
  'veld-mt-pionnen-omgooien',
  'veld-mt-dribbel-en-schiet',
  'veld-mt-hordes-en-schieten',
  'veld-mt-om-de-pop',
  'veld-mt-ladder-en-scoren',
  'veld-mt-brug-en-goal',
  'veld-mt-verkeerslicht',
  'veld-mt-hondje-uitlaten',
  'veld-mt-brandweer',
  'veld-mt-kleurenpoortjes',
  'veld-mt-onder-de-brug',
  'veld-mt-huisjes',
  'veld-mt-door-het-bos',
  'veld-mt-rondje-pion',
  'veld-mt-eieren-rapen',
  'veld-mt-ladder-en-dribbel',
  'veld-mt-poppenslalom',
  'veld-mt-kleurenpionnen',
  'veld-mt-palenpoort',
  'veld-mt-hoedjes-omdraaien',
  'veld-mt-hoedjes-verzamelen',
  'veld-af-kleine-doeltjes',
  'veld-lc-slalom',
  'veld-lc-kleurenreactie',
  'veld-wu-tikkertje-hesjes',
  'veld-wu-spiegelen',
  'veld-wu-overlopertje',
];
// Alleen O7: te moeilijk voor O6.
const ALLEEN_O7 = ['veld-mt-tennisballen-van-de-pion'];
// Nieuw bij O7: techniekoefeningen voor de jeugd die precies O7-techniek zijn (kappen en draaien, passeerbewegingen).
const OOK_O7 = [
  'veld-tq-kappen-draaien',
  'veld-tq-schijnbeweging',
  // 0.34.2: anders heeft O7 geen enkele Loopcoördinatie-oefening (sjabloon Mini Talents + loopcoördinatie). Loopladder, lage hordes,
  // hoepels en pionnen heeft de club.
  'veld-lc-ladder-enkel',
  'veld-lc-ladder-in-uit',
  'veld-lc-lage-hordes',
  'veld-lc-ringen',
  'veld-lc-vallende-pion',
  'veld-lc-hordes-zijwaarts-sprint',
];

const lees = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const schrijf = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
const MINI = [O6, O7];
const volgorde = ['mini-3-5', 'mini-5-7', 'jo8-11', 'jo12-15', 'jo16-19'];

let aangepast = 0;
for (const f of fs.readdirSync(MAP)) {
  const pad = path.join(MAP, f);
  const lijst = lees(pad);
  for (const o of lijst) {
    const voor = JSON.stringify(o.leeftijden);
    const jo = (o.leeftijden ?? []).filter((l) => !MINI.includes(l));
    if (ALLEEN_O6.includes(o.id)) o.leeftijden = [O6, ...jo];
    else if (ALLEEN_O7.includes(o.id)) o.leeftijden = [O7, ...jo];
    else if (OOK_O7.includes(o.id)) o.leeftijden = [...new Set([O7, ...o.leeftijden])].sort((a, b) => volgorde.indexOf(a) - volgorde.indexOf(b));
    if (JSON.stringify(o.leeftijden) !== voor) aangepast += 1;
  }
  schrijf(pad, lijst);
}

/** Een bestaande oefening beter maken: dezelfde id, Nederlands en Engels. */
function verbeter(id, nl, en) {
  for (const f of fs.readdirSync(MAP)) {
    const pad = path.join(MAP, f);
    const lijst = lees(pad);
    const o = lijst.find((x) => x.id === id);
    if (!o) continue;
    Object.assign(o, nl);
    schrijf(pad, lijst);
    // Het Engels staat in het bestand van de categorie waarin de oefening ooit begon: zoek het op.
    const enPad = fs.readdirSync(EN).map((x) => path.join(EN, x)).find((x) => x.includes('veld-') && lees(x)[id]);
    const d = lees(enPad);
    Object.assign(d[id], en);
    schrijf(enPad, d);
    return;
  }
  throw new Error(`niet gevonden: ${id}`);
}

// Idee 3 "Bescherm je bal" = Bal beschermen: nu met punten, wisselen om de 30 seconden en een eruit-tik-regel.
verbeter(
  'veld-mt-bal-beschermen',
  {
    uitleg:
      'De bal is jouw schat! Zet je lijf tussen de ander en de bal. De ander probeert de bal met zijn voet uit het vak te tikken. Houd jij de bal 30 tellen in het vak? Dan krijg je een punt. Is hij eruit? Dan krijgt de ander een punt. Na 30 tellen wisselen jullie.',
    organisatie:
      'Vakjes van 5 × 5 m met 4 hoedjes, twee vakjes naast elkaar. Station van 15 minuten voor 5 kinderen: in elk vakje spelen er twee, één kind wacht en speelt na 30 tellen tegen de winnaar. De trainer telt hardop en roept "wissel!".',
    benodigdheden: ['8 hoedjes', '2 voetballen'],
    coachpunten: ['Je lijf staat tussen de ander en de bal', 'Zachte tikjes met je zool: draai weg van de ander', 'Kijk over je schouder waar de ander is'],
    variaties: {
      makkelijker: ['De ander mag alleen tikken met één voet', 'Groter vakje'],
      moeilijker: ['Kleiner vakje', 'Na 10 tellen mag je ook naar de overkant dribbelen voor een extra punt', 'Met je zwakke voet'],
    },
  },
  {
    uitleg:
      'The ball is your treasure! Put your body between the other child and the ball. The other child tries to knock the ball out of the square with their foot. Do you keep the ball in the square for 30 seconds? You get a point. Is it out? The other child gets a point. After 30 seconds you swap.',
    organisatie:
      'Squares of 5 × 5 m with 4 disc cones, two squares side by side. 15-minute station for 5 children: two play in each square, one child waits and plays the winner after 30 seconds. The coach counts out loud and calls "swap!".',
    benodigdheden: ['8 disc cones', '2 footballs'],
    coachpunten: ['Your body is between the other child and the ball', 'Small touches with your sole: turn away from the other child', 'Look over your shoulder to see where the other child is'],
    variaties: {
      makkelijker: ['The other child may only tap with one foot', 'A bigger square'],
      moeilijker: ['A smaller square', 'After 10 seconds you may also dribble to the far side for an extra point', 'With your weaker foot'],
    },
  },
);

// Idee 10 "Piraten met kleuren" = Piratenspel: nu met kleuren en acties op de roep van de trainer.
verbeter(
  'veld-sp-piratenspel',
  {
    uitleg:
      'Alle kinderen dribbelen met een bal in het vak. Eén of twee piraten (zonder bal) proberen een bal af te pakken en uit het vak te schieten. Wie zijn bal kwijt is, wordt ook piraat. De trainer roept ondertussen acties: "kap!", "zool!" of "schaar!". En roept hij een kleur, dan mogen de piraten met dat hesje even niet tikken. Wie houdt het langst zijn schat (de bal)?',
  },
  {
    uitleg:
      'All the children dribble with a ball in the area. One or two pirates (without a ball) try to win a ball and kick it out of the area. If you lose your ball, you become a pirate too. Meanwhile the coach calls moves: "chop!", "sole!" or "step-over!". And when the coach calls a colour, the pirates in that bib may not tackle for a moment. Who keeps their treasure (the ball) the longest?',
  },
);

// Idee 11 "Funino 3 tegen 3 op vier goaltjes" = 3 tegen 3 op vier doeltjes: nu met de Funino-regels en de mini's erbij.
verbeter(
  'veld-pv-3-3-vier-doeltjes',
  {
    uitleg:
      'Elk team verdedigt twee kleine doeltjes in de hoeken en valt aan op de twee doeltjes van de tegenstander. Speel aan één kant om de tegenstander te lokken, en verplaats dan snel naar het doeltje dat vrij ligt. Scoren mag alleen in de scoorzone: het laatste stuk van het veld voor de doeltjes.',
  },
  {
    uitleg:
      'Each team defends two small goals in the corners and attacks the two goals of the other team. Play on one side to draw the opponents, then switch quickly to the goal that is open. You may only score from the scoring zone: the last part of the pitch in front of the goals.',
  },
);

// Idee 16 "Hoepeleilanden" = Huisjes: nu met de zool en telkens een hoepel minder (samen delen, niemand valt af).
verbeter(
  'veld-mt-huisjes',
  {
    uitleg:
      'Elke hoepel is een eilandje. Dribbel lekker rond in de zee. Roept de trainer "eiland!", dan dribbel je naar een hoepel en stop je de bal erin met je zool. Telkens haalt de trainer een eilandje weg. Dan moet je samen een eiland delen: niemand valt af! Wie staat er het eerst stil?',
  },
  {
    uitleg:
      'Each hoop is a little island. Dribble around in the sea. When the coach calls "island!", dribble to a hoop and stop the ball in it with your sole. Each time the coach takes an island away. Then you have to share an island: nobody is out! Who stops first?',
  },
);

// Idee 13 "Dierendribbel" lijkt op Hondje uitlaten: de dieren erbij als variant.
verbeter(
  'veld-mt-hondje-uitlaten',
  {
    variaties: {
      makkelijker: ['Alleen "zit" en "rennen"', 'Wandelen in plaats van rennen'],
      moeilijker: ['"Pootje": bal met je andere voet tikken', 'Twee commando’s achter elkaar', 'Andere dieren: "olifant" (heel zachte tikjes), "kangoeroe" (zool op de bal en stoppen), "raket" (zo snel als je kunt)'],
    },
  },
  {
    variaties: {
      makkelijker: ['Only "sit" and "run"', 'Walk instead of running'],
      moeilijker: ['"Paw": touch the ball with your other foot', 'Two commands in a row', 'Other animals: "elephant" (very soft touches), "kangaroo" (sole on the ball and stop), "rocket" (as fast as you can)'],
    },
  },
);

// Idee 14 "Volg de kapitein" = Spiegeldribbel: het verhaaltje van de kapitein voor de jongsten.
verbeter(
  'veld-tq-spiegeldribbel',
  {
    variaties: {
      makkelijker: ['Alleen dribbelen en stilstaan', 'Mini’s: "Volg de kapitein": de kapitein doet iets voor met de bal en de matroos doet het na'],
      moeilijker: ['Elke tien seconden wisselen van voorspeler', 'Alleen met je zwakke voet', 'De voorspeler mag ook versnellen'],
    },
  },
  {
    variaties: {
      makkelijker: ['Only dribbling and stopping', 'Minis: "Follow the captain": the captain does something with the ball and the sailor copies it'],
      moeilijker: ['Swap leader every ten seconds', 'Only with your weaker foot', 'The leader may accelerate too'],
    },
  },
);

console.log(`${aangepast} oefeningen ingedeeld, 6 verbeterd`);
