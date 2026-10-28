import type { Lijn, Punt, Tekening, VeldObject } from '../model/types';
import { formatiePlekken } from './wedstrijd';
import { veldTekening } from './wedstrijd';
import { t } from '../i18n/t';
import { HERVATTINGEN } from './hervattingVoorbeelden';

/**
 * Spelhervattingen: kant-en-klare beginsituaties (half veld, het goal bovenaan; aftrap op een heel veld) en een paar
 * voorbeelden met lijnen. Jouw team is A (rood), de tegenstander B (blauw). Daarna teken je zelf verder in de editor.
 */

const r2 = (v: number) => Math.round(v * 100) / 100;
const hoek = (van: Punt, naar: Punt) => Math.round((Math.atan2(naar[1] - van[1], naar[0] - van[0]) * 180) / Math.PI);
const GOAL: Punt = [34, 0];

function speler(id: string, team: 'A' | 'B', nummer: number, x: number, y: number, kijk: number): VeldObject {
  return { id, soort: 'speler', team, nummer, x: r2(x), y: r2(y), kijkrichting: kijk };
}
const aanval = (id: string, nr: number, p: Punt, kijk = -90) => speler(id, 'A', nr, p[0], p[1], kijk);
const verdediger = (id: string, nr: number, p: Punt, naar: Punt = [34, 30]) => speler(id, 'B', nr, p[0], p[1], hoek(p, naar));
const keeper = (p: Punt = [34, 1.2]): VeldObject => ({ id: 'k1', soort: 'keeper', nummer: 1, x: p[0], y: p[1], kijkrichting: 90 });
const bal = (bij: string, p: Punt): VeldObject => ({ id: 'bal1', soort: 'bal', x: p[0], y: p[1], bij });

function half(objecten: VeldObject[], lijnen: Lijn[] = []): Tekening {
  const t = veldTekening('half');
  return { ...t, objecten: [...t.objecten, ...objecten], lijnen };
}

const spiegel = (p: Punt): Punt => [r2(68 - p[0]), p[1]];
const spiegelKijk = (k: number) => {
  const h = 180 - k;
  return h > 180 ? h - 360 : h;
};

/** Corner: links (vanaf de linker hoekvlag) of rechts (gespiegeld). */
function corner(kant: 'links' | 'rechts'): Tekening {
  const m = (p: Punt) => (kant === 'links' ? p : spiegel(p));
  const k = (h: number) => (kant === 'links' ? h : spiegelKijk(h));
  const nemer: Punt = m([0.9, 0.9]);
  const aanvallers: Punt[] = [
    [30, 13],
    [36, 14],
    [41, 11],
    [26, 9],
    [34, 18],
  ];
  const verdedigers: Punt[] = [
    [31, 1],
    [33, 6],
    [37, 6.5],
    [27.5, 11.5],
    [38, 12.5],
    [34, 16],
  ];
  return half([
    aanval('a1', 1, nemer, k(hoek([0.9, 0.9], [34, 11]))),
    ...aanvallers.map((p, i) => aanval(`a${i + 2}`, i + 2, m(p), k(-120))),
    keeper(m([34, 1.2])),
    ...verdedigers.map((p, i) => verdediger(`b${i + 2}`, i + 2, m(p), m([8, 4]))),
    bal('a1', nemer),
  ]);
}

/** Vrije trap op `afstand` meter van de doellijn, met een muurtje van 4 op 9,15 m. */
function vrijeTrap(afstand: number, x: number): Tekening {
  const balPlek: Punt = [x, afstand];
  const d = Math.hypot(GOAL[0] - x, afstand);
  const u: Punt = [(GOAL[0] - x) / d, -afstand / d];
  const loodrecht: Punt = [-u[1], u[0]];
  const midden: Punt = [x + u[0] * 9.15 + loodrecht[0] * 0.6, afstand + u[1] * 9.15 + loodrecht[1] * 0.6];
  const muur = [-1.2, -0.4, 0.4, 1.2].map((o): Punt => [midden[0] + loodrecht[0] * o, midden[1] + loodrecht[1] * o]);
  const kijkNaarBal = (p: Punt) => hoek(p, balPlek);
  return half([
    aanval('a1', 1, balPlek, hoek(balPlek, GOAL)),
    aanval('a2', 2, [x - 2.4, afstand + 1.4], hoek([x - 2.4, afstand + 1.4], GOAL)),
    aanval('a3', 3, [x < 34 ? 39 : 29, Math.max(7, afstand - 12)]),
    aanval('a4', 4, [x < 34 ? 27 : 31, Math.max(8, afstand - 14)]),
    keeper([r2(34 + (x - 34) * 0.12), 1.2]),
    ...muur.map((p, i) => speler(`b${i + 2}`, 'B', i + 2, p[0], p[1], kijkNaarBal(p))),
    verdediger('b6', 6, [x < 34 ? 41 : 27, Math.max(6.5, afstand - 13)], balPlek),
    verdediger('b7', 7, [x < 34 ? 25 : 43, Math.max(6, afstand - 14)], balPlek),
    bal('a1', balPlek),
  ]);
}

function inworp(): Tekening {
  const nemer: Punt = [0.3, 30];
  return half([
    aanval('a1', 1, nemer, 0),
    aanval('a2', 2, [6, 26], 180),
    aanval('a3', 3, [5, 36], 180),
    aanval('a4', 4, [12, 31], 180),
    verdediger('b2', 2, [5, 28.5], nemer),
    verdediger('b3', 3, [7, 34], nemer),
    verdediger('b4', 4, [13, 27], nemer),
    bal('a1', nemer),
  ]);
}

/** Doeltrap: jouw keeper bij zijn eigen goal (bovenaan), opbouwen tegen een tegenstander die druk zet. */
function doeltrap(): Tekening {
  const k: VeldObject = { id: 'k1', soort: 'keeper', nummer: 1, x: 30, y: 5.5, kijkrichting: 90 };
  return half([
    k,
    aanval('a2', 2, [14, 14], 90),
    aanval('a3', 3, [27, 16], 90),
    aanval('a4', 4, [41, 16], 90),
    aanval('a5', 5, [54, 14], 90),
    aanval('a6', 6, [34, 28], 90),
    aanval('a7', 7, [20, 34], 90),
    aanval('a8', 8, [48, 34], 90),
    verdediger('b9', 9, [34, 18.5], [30, 5.5]),
    verdediger('b10', 10, [22, 22], [27, 16]),
    verdediger('b11', 11, [46, 22], [41, 16]),
    verdediger('b8', 8, [34, 38], [34, 28]),
    bal('k1', [30, 5.5]),
  ]);
}

/** Aftrap: heel veld, beide teams 1-4-3-3 in hun eigen helft, tegenstanders buiten de middencirkel. */
function aftrap(): Tekening {
  const t = veldTekening('heel');
  const objecten: VeldObject[] = [...t.objecten];
  const plekken = formatiePlekken('11v11', '1-4-3-3');
  const y = (v: number) => 53.5 + ((v - 0.3) / 0.64) * 50;
  for (const p of plekken) {
    const pos: Punt = [r2(p.x * 68), r2(y(p.y))];
    if (p.nummer === 1) objecten.push({ id: 'k1', soort: 'keeper', nummer: 1, x: pos[0], y: Math.min(pos[1], 103.5), kijkrichting: -90 });
    else objecten.push(aanval(`a${p.nummer}`, p.nummer, pos));
  }
  for (const p of plekken) {
    let pos: Punt = [r2(p.x * 68), r2(105 - y(p.y))];
    // Buiten de middencirkel (9,15 m).
    if (Math.hypot(pos[0] - 34, pos[1] - 52.5) < 9.6) pos = [pos[0], r2(52.5 - Math.sqrt(Math.max(0, 9.6 ** 2 - (pos[0] - 34) ** 2)))];
    if (p.nummer === 1) objecten.push({ id: 'k2', soort: 'keeper', nummer: 2, x: pos[0], y: Math.max(pos[1], 1.5), kijkrichting: 90 });
    else objecten.push(speler(`b${p.nummer}`, 'B', p.nummer, pos[0], pos[1], 90));
  }
  // De middelste spits neemt de aftrap.
  const spits = objecten.find((o) => o.id === 'a10')!;
  spits.x = 34;
  spits.y = 53.1;
  objecten.push({ id: 'bal1', soort: 'bal', x: 34, y: 53.1, bij: 'a10' });
  return { ...t, objecten };
}

export interface Situatie {
  id: string;
  naam: string;
  maak: () => Tekening;
}

/** Beginsituaties om zelf de lijnen bij te tekenen. */
export const SITUATIES: Situatie[] = [
  { id: 'corner-links', naam: t('Corner links'), maak: () => corner('links') },
  { id: 'corner-rechts', naam: t('Corner rechts'), maak: () => corner('rechts') },
  { id: 'vrije-trap-18', naam: t('Vrije trap 18 m'), maak: () => vrijeTrap(18, 34) },
  { id: 'vrije-trap-25', naam: t('Vrije trap 25 m'), maak: () => vrijeTrap(25, 28) },
  { id: 'vrije-trap-30', naam: t('Vrije trap 30 m'), maak: () => vrijeTrap(30, 41) },
  { id: 'inworp', naam: t('Inworp'), maak: inworp },
  { id: 'doeltrap', naam: t('Doeltrap / uittrap'), maak: doeltrap },
  { id: 'aftrap', naam: t('Aftrap'), maak: aftrap },
];

export interface Voorbeeld extends Situatie {
  uitleg: string;
}

/**
 * De voorbeelden die meteen afspelen staan sinds 0.29.0 in de bibliotheek (`hervattingVoorbeelden.ts`, met uitleg en
 * 8-tegen-8-versies). Deze drie (de eerste voorbeelden) blijven hier beschikbaar onder dezelfde id's.
 */
export const VOORBEELDEN: Voorbeeld[] = ['corner-eerste-paal', 'korte-corner', 'vrije-trap-kaats'].map((id) => {
  const x = HERVATTINGEN.find((h) => h.id === id)!;
  return { id, naam: x.naam, uitleg: x.kort, maak: x.versies[0]!.maak };
});
