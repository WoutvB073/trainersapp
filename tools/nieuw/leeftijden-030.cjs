// 0.30.0: alle ingebouwde oefeningen in leeftijdsgroepen indelen en de categorie 1 tegen 1 toevoegen aan bestaande duels.
// Draaien: node tools/nieuw/leeftijden-030.cjs  (eenmalig; nieuwe oefeningen krijgen hun leeftijden in hun eigen bouwscript).
const fs = require('fs');
const path = require('path');

const MAP = path.join(__dirname, '..', '..', 'src', 'data', 'oefeningen');
const M = ['mini-3-5', 'mini-5-7'];
const A = 'jo8-11';
const B = 'jo12-15';
const C = 'jo16-19';

/** Lijst id's per combinatie van groepen (zonder voorvoegsel `veld-`). */
const VELD = [
  // Mini's: simpel genoeg voor 3,5–7 jaar (naast hun andere groepen).
  [[...M, A], 'sp-piratenspel wu-schatrovers'],
  [[...M, A, B], 'tq-koning-van-het-vak wu-overlopertje wu-tikkertje-hesjes te-kleurenreactie-bal pt-pionnen-omschieten lc-kleurenreactie wu-dribbelen-opdrachten tq-poortjesdribbel sp-uit-het-vak sp-voetgolf'],
  [[...M, A, B, C], 'wu-spiegelen lc-slalom pv-1-1-doeltjes pv-2-2-winnaar-blijft pv-3-3-vier-doeltjes'],
  // JO8–JO11 en ouder.
  [[A, B], 'lc-estafette pt-poortjesspel cv-estafette sp-ludo'],
  [
    [A, B, C],
    'ps-rondo-3-1 wu-passen-en-volgen wu-loopscholing wu-rondo-4-1 wu-lopend-passen cv-circuit-drie-stations ' +
      'tq-balgevoel tq-aannemen-meenemen tq-kappen-draaien tq-schijnbeweging tq-hooghouden tq-aannemen-uit-de-lucht cv-rebounder-doeltjes ' +
      'lc-ladder-enkel lc-ladder-in-uit lc-lage-hordes lc-ringen lc-stokken cv-hordes-sprint-duel ' +
      'pt-driehoek pt-rebounder ' +
      'af-dribbel-afronden af-pass-in-de-loop af-onder-druk af-duel-twee-rijen cv-ladder-slalom-schot af-dribbelrace-1t1 af-wedstrijdje-schieten ' +
      'ps-rondo-4-2 vo-1-1-wegdrukken ' +
      'pv-2-1 pv-3-2-omschakeling pv-4-4-keepers pv-lijnvoetbal cv-1t1-2t1 ps-3-2-poortjes sp-koning-van-het-veld pv-1-1-poortjes pv-wippen-1-1 pv-oplopend-overtal pv-voorsprong ' +
      'sp-voetbaltennis sp-voetvolley sp-latje-trap sp-pannavoetbal',
  ],
  // JO12–JO15 en ouder.
  [
    [B, C],
    'wu-vierhoek-verdediger wu-pentagon-kiezen tq-indraaien tq-aannemen-onder-druk tq-gerichte-aanname-voren tq-vrijlopen-rug-verdediger cv-aanname-lucht-schot ' +
      'lc-t-test pt-y-vorm pt-lange-bal pt-vierhoek-twee-ballen cv-derde-man-afronden pt-y-vorm-varianten ' +
      'af-voorzetten af-afstandsschot cv-kaats-doordiepen cv-draaien-voorzet cv-overlap-voorzet af-kaatsen-verdediger-rug af-schieten-onder-druk af-cutback af-snel-na-balwinst af-golven-na-inworp af-kopballen-voorzet ' +
      'ps-rondo-5-2 ps-4-4-2-jokers ps-5-5-2-jokers ps-eindzone ps-omschakelen ps-door-de-linies cv-rondo-uitbreken ps-rondo-4-2-uitbraak ps-3-3-3-spits ps-5-tegen-3 ps-4-4-doelspelers ps-vier-zones ps-rondo-4-2-wisselen ps-rondo-3-1-plus-1-1 ps-opbouw-4-keeper-2 ps-linies-diepe-spits ' +
      'vo-druk-drie-fases vo-drie-verdedigers vo-pressen-na-balverlies vo-omschakelen-kaatsers ' +
      'pv-5-5-flank pv-scoren-na-kaats pv-2-1-inhalende-verdediger pv-golven pv-1-1-naar-4-4 pv-6-6-verboden-midden pv-5-5-schietzones pv-4-4-wingers pv-2-2-doelspeler pv-mandekking',
  ],
  // Alleen de oudste groep: veel structuur.
  [[C], 'ps-7-tegen-5-opbouw vo-hoog-druk-loont'],
];

/** Keepers: nooit mini's. Deze vanaf JO8 (zonder voorvoegsel `keeper-`); de rest vanaf JO12. */
const KEEPERS_VANAF_JO8 =
  'wu-ladder-borstbal wu-voetenwerk-vierkant wu-driehoek wu-grondoefeningen wu-twee-ballen wu-zijwaarts-blijven-vangen wu-drie-aangevers wu-tennisballen-vangen sp-kleurenpion ' +
  'bv-vier-kleuren bv-vangen-laag-om-beurt bv-stuitballen bv-midden-voorzet-schot ' +
  'ld-voetenwerk-lange-duik ld-kniezit-hurkzit-stand ld-rondje-hoedje ld-twee-aangevers sp-duik-op-de-bal ' +
  'ps-terugspeelbal ps-uittrap-handen ps-doeltrap ps-uitworpen ' +
  're-rebounder re-reactiebal sp-valbal ' +
  'sp-keepersoorlog sp-keepersvolleybal sp-keepersrondo sp-keepersoorlog-een-goal sp-vier-doeltjes sp-twee-tegen-twee-twee-doelen sp-een-op-een-competitie';

/** Bestaande 1-tegen-1-oefeningen krijgen de nieuwe categorie erbij. */
const EEN_TEGEN_EEN = 'pv-1-1-doeltjes pv-1-1-poortjes pv-wippen-1-1 af-duel-twee-rijen vo-1-1-wegdrukken cv-hordes-sprint-duel'.split(' ').map((x) => `veld-${x}`);

const veld = new Map();
for (const [groepen, ids] of VELD) for (const id of ids.split(/\s+/)) {
  if (veld.has(`veld-${id}`)) throw new Error(`dubbel: ${id}`);
  veld.set(`veld-${id}`, groepen);
}
const jong = new Set(KEEPERS_VANAF_JO8.split(/\s+/).map((x) => `keeper-${x}`));

/** Leeftijden direct na `keepersNodig`, zodat het bestand leesbaar blijft. */
const metLeeftijden = (o, leeftijden) => {
  const uit = {};
  for (const [k, v] of Object.entries(o)) {
    if (k === 'leeftijden') continue;
    uit[k] = v;
    if (k === 'keepersNodig') uit.leeftijden = leeftijden;
  }
  return uit;
};

const gebruikt = new Set();
for (const map of ['veld', 'keepers']) {
  for (const f of fs.readdirSync(path.join(MAP, map))) {
    const pad = path.join(MAP, map, f);
    const lijst = JSON.parse(fs.readFileSync(pad, 'utf8')).map((o) => {
      if (o.leeftijden && o.leeftijden.every((l) => M.includes(l))) return o; // alleen mini's (eigen bouwscript of Snelle schutter)
      const groepen = map === 'veld' ? veld.get(o.id) : jong.has(o.id) ? [A, B, C] : [B, C];
      if (!groepen) throw new Error(`geen leeftijd: ${o.id}`);
      gebruikt.add(o.id);
      const nieuw = metLeeftijden(o, groepen);
      if (EEN_TEGEN_EEN.includes(o.id) && !nieuw.categorieen.includes('een-tegen-een')) nieuw.categorieen = [...nieuw.categorieen, 'een-tegen-een'];
      return nieuw;
    });
    fs.writeFileSync(pad, JSON.stringify(lijst, null, 2) + '\n');
  }
}
for (const id of [...veld.keys(), ...[...jong]]) if (!gebruikt.has(id)) throw new Error(`bestaat niet: ${id}`);
console.log(`${gebruikt.size} oefeningen ingedeeld`);
