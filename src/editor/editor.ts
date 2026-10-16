import type { Lijn, LijnSoort, ObjectSoort, Punt, Team, Tekening, Uitsnede, VeldObject, VeldType } from '../model/types';
import { HORDE, PERSONEN } from '../model/types';
import { lijnMidden, lijnPunten } from '../model/lijn';
import { maakTijdlijn, standOp } from '../anim/timeline';
import { STANDAARD_MATEN, veldMaten } from '../anim/render2d';

/**
 * Pure editorlogica: een tekening maken en wijzigen. Elke functie geeft een nieuwe tekening terug (de oude blijft
 * ongewijzigd), zodat ongedaan maken simpel is. Het formaat is precies dat van de ingebouwde oefeningen; animatiestappen
 * kunnen er later bij (fase 8).
 */

// ---------- nieuwe tekening ----------

export function nieuweTekening(type: VeldType, breedte?: number, lengte?: number): Tekening {
  const veld = type === 'leeg' ? { type, breedte: breedte ?? 30, lengte: lengte ?? 20 } : { type };
  // Half veld: het goal staat er al; heel veld: aan beide kanten.
  const objecten: VeldObject[] = [];
  if (type !== 'leeg') objecten.push({ id: 'g1', soort: 'goal', x: 34, y: 0 });
  if (type === 'heel') objecten.push({ id: 'g2', soort: 'goal', x: 34, y: 105, hoek: 180 });
  return { veld, camera: 'schuin', objecten, lijnen: [] };
}

// ---------- palet ----------

export type PaletGroep = 'Spelers' | 'Doelen' | 'Materiaal' | 'Vakken en tekst';

export interface PaletItem {
  sleutel: string;
  naam: string;
  groep: PaletGroep;
  maak: (t: Tekening, p: Punt) => VeldObject;
}

const r1 = (v: number) => Math.round(v * 100) / 100;

/** Volgende vrije id met dit voorvoegsel (a1, a2, …). */
export function nieuwId(t: Tekening, voorvoegsel: string): string {
  const ids = new Set(t.objecten.map((o) => o.id));
  let n = 1;
  while (ids.has(`${voorvoegsel}${n}`)) n++;
  return `${voorvoegsel}${n}`;
}

/** Volgend rugnummer voor dit soort persoon (per team bij spelers). */
export function volgendNummer(t: Tekening, soort: ObjectSoort, team?: Team): number {
  const nummers = t.objecten.filter((o) => o.soort === soort && (soort !== 'speler' || o.team === team)).map((o) => o.nummer ?? 0);
  return nummers.length ? Math.max(...nummers) + 1 : 1;
}

const ding =
  (soort: ObjectSoort, voorvoegsel: string, extra: Partial<VeldObject> = {}) =>
  (t: Tekening, p: Punt): VeldObject => ({
    id: nieuwId(t, voorvoegsel),
    soort,
    x: r1(p[0]),
    y: r1(p[1]),
    ...extra,
  });

const speler =
  (team: Team, voorvoegsel: string) =>
  (t: Tekening, p: Punt): VeldObject => ({
    id: nieuwId(t, voorvoegsel),
    soort: 'speler',
    team,
    ...(team === 'J' ? {} : { nummer: volgendNummer(t, 'speler', team) }),
    x: r1(p[0]),
    y: r1(p[1]),
  });

export const PALET: PaletItem[] = [
  {
    sleutel: 'speler-a',
    naam: 'Speler team A',
    groep: 'Spelers',
    maak: speler('A', 'a'),
  },
  {
    sleutel: 'speler-b',
    naam: 'Speler team B',
    groep: 'Spelers',
    maak: speler('B', 'b'),
  },
  { sleutel: 'joker', naam: 'Joker', groep: 'Spelers', maak: speler('J', 'j') },
  {
    sleutel: 'keeper',
    naam: 'Keeper',
    groep: 'Spelers',
    maak: (t, p) => ({
      id: nieuwId(t, 'k'),
      soort: 'keeper',
      nummer: volgendNummer(t, 'keeper'),
      x: r1(p[0]),
      y: r1(p[1]),
    }),
  },
  {
    sleutel: 'trainer',
    naam: 'Trainer',
    groep: 'Spelers',
    maak: ding('trainer', 't'),
  },
  { sleutel: 'bal', naam: 'Bal', groep: 'Spelers', maak: ding('bal', 'bal') },
  {
    sleutel: 'goal',
    naam: 'Groot goal',
    groep: 'Doelen',
    maak: ding('goal', 'g'),
  },
  {
    sleutel: 'jeugdgoal',
    naam: 'Jeugdgoal',
    groep: 'Doelen',
    maak: ding('goal', 'g', { breedte: 5, hoogte: 2 }),
  },
  {
    sleutel: 'klein-goal',
    naam: 'Klein goal',
    groep: 'Doelen',
    maak: ding('klein-goal', 'g'),
  },
  {
    sleutel: 'pion',
    naam: 'Pion',
    groep: 'Materiaal',
    maak: ding('pion', 'p'),
  },
  {
    sleutel: 'hoedje',
    naam: 'Hoedje',
    groep: 'Materiaal',
    maak: ding('hoedje', 'h'),
  },
  {
    sleutel: 'paaltje',
    naam: 'Paaltje',
    groep: 'Materiaal',
    maak: ding('paaltje', 'pa'),
  },
  {
    sleutel: 'stok',
    naam: 'Stok',
    groep: 'Materiaal',
    maak: ding('stok', 's', { lengte: 1.5 }),
  },
  {
    sleutel: 'ladder',
    naam: 'Ladder',
    groep: 'Materiaal',
    maak: ding('ladder', 'l', { lengte: 4, breedte: 0.5 }),
  },
  {
    sleutel: 'horde-laag',
    naam: 'Horde laag',
    groep: 'Materiaal',
    maak: ding('horde', 'ho', { hoogte: HORDE.laag }),
  },
  {
    sleutel: 'horde-hoog',
    naam: 'Horde hoog',
    groep: 'Materiaal',
    maak: ding('horde', 'ho', { hoogte: HORDE.hoog }),
  },
  {
    sleutel: 'ring',
    naam: 'Ring',
    groep: 'Materiaal',
    maak: ding('ring', 'r'),
  },
  {
    sleutel: 'bank',
    naam: 'Bank',
    groep: 'Materiaal',
    maak: ding('bank', 'bk', { breedte: 2.5 }),
  },
  {
    sleutel: 'pop',
    naam: 'Pop / dummy',
    groep: 'Materiaal',
    maak: ding('pop', 'po'),
  },
  {
    sleutel: 'rebounder',
    naam: 'Rebounder',
    groep: 'Materiaal',
    maak: ding('rebounder', 'rb'),
  },
  {
    sleutel: 'net',
    naam: 'Net',
    groep: 'Materiaal',
    maak: ding('net', 'n', { breedte: 6, hoogte: 1 }),
  },
  {
    sleutel: 'lint',
    naam: 'Lint',
    groep: 'Materiaal',
    maak: ding('net', 'n', { breedte: 6, hoogte: 0.5 }),
  },
  {
    sleutel: 'keepersmat',
    naam: 'Keepersmat',
    groep: 'Materiaal',
    maak: ding('keepersmat', 'm', { breedte: 2, lengte: 1 }),
  },
  {
    sleutel: 'landingskussen',
    naam: 'Landingskussen',
    groep: 'Materiaal',
    maak: ding('keepersmat', 'm', { breedte: 2, lengte: 1.5, hoogte: 0.4 }),
  },
  {
    sleutel: 'zone',
    naam: 'Vak / zone',
    groep: 'Vakken en tekst',
    maak: ding('zone', 'z', { breedte: 10, lengte: 10 }),
  },
  {
    sleutel: 'tekst',
    naam: 'Tekst',
    groep: 'Vakken en tekst',
    maak: ding('tekst', 'tx', { tekst: 'Tekst' }),
  },
];

/** Bij welk palet-item hoort dit object (voor de naam in beeld en de benodigdheden)? */
export function paletVan(o: VeldObject): PaletItem | undefined {
  const s = (k: string) => PALET.find((p) => p.sleutel === k);
  switch (o.soort) {
    case 'speler':
      return s(o.team === 'B' ? 'speler-b' : o.team === 'J' ? 'joker' : 'speler-a');
    case 'goal':
      return s((o.breedte ?? 7.32) < 6.5 ? 'jeugdgoal' : 'goal');
    case 'horde':
      return s((o.hoogte ?? HORDE.laag) >= 0.25 ? 'horde-hoog' : 'horde-laag');
    case 'net':
      return s((o.hoogte ?? 1) < 0.8 ? 'lint' : 'net');
    case 'keepersmat':
      return s((o.hoogte ?? 0) >= 0.1 ? 'landingskussen' : 'keepersmat');
    default:
      return s(o.soort);
  }
}

export const ZONE_KLEUREN = ['#ffd23f', '#3fa9f5', '#ff5a5f', '#ffffff', '#ff922b', '#8ce99a'];

// ---------- vormen (aanraken, handvatten) ----------

const isPersoon = (o: VeldObject) => PERSONEN.includes(o.soort);

/** Rechthoek in de eigen assen van het object (x0..x1, y0..y1), of een cirkel. */
export interface ObjectVorm {
  rechthoek?: [number, number, number, number];
  straal?: number;
}

export function objectVorm(o: VeldObject): ObjectVorm {
  switch (o.soort) {
    case 'speler':
    case 'keeper':
    case 'trainer':
      return { straal: 0.5 };
    case 'bal':
      return { straal: 0.25 };
    case 'pion':
      return { straal: 0.28 };
    case 'hoedje':
      return { straal: 0.22 };
    case 'paaltje':
      return { straal: 0.12 };
    case 'ring':
      return { straal: 0.4 };
    case 'pop':
      return { straal: 0.3 };
    case 'goal':
    case 'klein-goal': {
      const groot = o.soort === 'goal';
      const b = (o.breedte ?? (groot ? 7.32 : 3)) / 2;
      return { rechthoek: [-b, b, -(o.lengte ?? (groot ? 2 : 1.2)), 0.15] };
    }
    case 'tekst': {
      const w = Math.max(1.2, (o.tekst?.length ?? 4) * 0.62) / 2;
      return { rechthoek: [-w, w, -0.7, 0.7] };
    }
    default: {
      const [b, l] = afmetingen(o);
      return { rechthoek: [-b / 2, b / 2, -l / 2, l / 2] };
    }
  }
}

/** Breedte (eigen x-as) en lengte (eigen y-as) in meters, zoals 2D ze tekent. */
export function afmetingen(o: VeldObject): [number, number] {
  switch (o.soort) {
    case 'zone':
      return [o.breedte ?? 10, o.lengte ?? 10];
    case 'ladder':
      return [o.breedte ?? 0.5, o.lengte ?? 4];
    case 'horde':
      return [o.breedte ?? 0.8, 0.2];
    case 'stok':
      return [o.lengte ?? 1.5, 0.12];
    case 'bank':
      return [o.breedte ?? 2.5, 0.4];
    case 'rebounder':
      return [o.breedte ?? 1.2, 0.35];
    case 'net':
      return [o.breedte ?? 6, 0.25];
    case 'muurtje':
      return [o.breedte ?? 2.4, 0.5];
    case 'keepersmat':
      return [o.breedte ?? 2, o.lengte ?? 1];
    case 'kooi':
      return [o.breedte ?? 7, o.lengte ?? 5];
    default:
      return [0.5, 0.5];
  }
}

/** Welke maten je met het handvat kunt veranderen. */
export function maatBaar(o: VeldObject): 'breedte-lengte' | 'lengte' | 'breedte' | null {
  switch (o.soort) {
    case 'zone':
    case 'keepersmat':
    case 'kooi':
      return 'breedte-lengte';
    case 'ladder':
    case 'stok':
      return 'lengte';
    case 'net':
    case 'bank':
    case 'muurtje':
      return 'breedte';
    default:
      return null;
  }
}

/** Kan dit object draaien? (Personen draaien hun kijkrichting.) */
export function draaiBaar(o: VeldObject): boolean {
  return !['bal', 'pion', 'hoedje', 'paaltje', 'ring', 'pop', 'tekst'].includes(o.soort);
}

/** Punt in de eigen assen van het object. */
export function lokaal(o: VeldObject, p: Punt): Punt {
  const a = (-(o.hoek ?? 0) * Math.PI) / 180;
  const dx = p[0] - o.x;
  const dy = p[1] - o.y;
  return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
}

/** Van eigen assen terug naar het veld. */
export function wereld(o: VeldObject, q: Punt): Punt {
  const a = ((o.hoek ?? 0) * Math.PI) / 180;
  return [o.x + q[0] * Math.cos(a) - q[1] * Math.sin(a), o.y + q[0] * Math.sin(a) + q[1] * Math.cos(a)];
}

/** Afstand van een punt tot het object (0 = erop). */
export function afstandTotObject(o: VeldObject, p: Punt): number {
  const v = objectVorm(o);
  if (v.straal !== undefined) return Math.max(0, Math.hypot(p[0] - o.x, p[1] - o.y) - v.straal);
  const [x0, x1, y0, y1] = v.rechthoek!;
  const q = lokaal(o, p);
  const dx = Math.max(x0 - q[0], 0, q[0] - x1);
  const dy = Math.max(y0 - q[1], 0, q[1] - y1);
  return Math.hypot(dx, dy);
}

/** Volgorde van boven naar onder (wat bovenop ligt, pak je eerst). */
const LAAG: Partial<Record<ObjectSoort, number>> = {
  tekst: 0,
  bal: 1,
  speler: 2,
  keeper: 2,
  trainer: 2,
  pion: 3,
  hoedje: 3,
  paaltje: 3,
  ring: 3,
  pop: 3,
  zone: 9,
  keepersmat: 8,
  kooi: 8,
};

/**
 * Welk object raak je op punt p? `marge` in meters (vinger/muis: een klein object is zo toch goed te pakken).
 * Bij twee kandidaten wint wat bovenop ligt, daarna wat het dichtst bij is.
 */
export function raakObject(t: Tekening, p: Punt, marge: number): VeldObject | undefined {
  let beste: { o: VeldObject; laag: number; d: number } | undefined;
  for (const o of t.objecten) {
    const d = afstandTotObject(o, p);
    if (d > marge) continue;
    const laag = LAAG[o.soort] ?? 5;
    // Grote vlakken (zone) alleen als je er echt in tikt.
    if (laag >= 8 && d > 0) continue;
    if (!beste || laag < beste.laag || (laag === beste.laag && d < beste.d)) beste = { o, laag, d };
  }
  return beste?.o;
}

const afstandTotLijnstuk = (p: Punt, a: Punt, b: Punt) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy || 1;
  const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return Math.hypot(p[0] - (a[0] + dx * u), p[1] - (a[1] + dy * u));
};

/** Plek van een object (voor lijnen die eraan vastzitten). */
export const plekIn =
  (t: Tekening) =>
  (id: string): Punt | undefined => {
    const o = t.objecten.find((x) => x.id === id);
    if (!o) return undefined;
    if (o.soort === 'bal' && o.bij) {
      const h = t.objecten.find((x) => x.id === o.bij);
      if (h) return [h.x, h.y];
    }
    return [o.x, o.y];
  };

/** Index van de lijn die je raakt, of -1. */
export function raakLijn(t: Tekening, p: Punt, marge: number): number {
  const lijnen = t.lijnen ?? [];
  let beste = -1;
  let bestD = marge;
  lijnen.forEach((l, i) => {
    const pts = lijnPunten(l, plekIn(t));
    for (let j = 1; j < pts.length; j++) {
      const d = afstandTotLijnstuk(p, pts[j - 1]!, pts[j]!);
      if (d <= bestD) {
        bestD = d;
        beste = i;
      }
    }
  });
  return beste;
}

// ---------- handvatten ----------

export type Handvat = 'draai' | 'maat' | 'begin' | 'midden' | 'eind';

/** Plek van de handvatten van een geselecteerd object (meters). `extra` = afstand voor het draaihandvat. */
export function objectHandvatten(o: VeldObject, extra: number): Partial<Record<Handvat, Punt>> {
  const uit: Partial<Record<Handvat, Punt>> = {};
  const v = objectVorm(o);
  if (draaiBaar(o)) {
    if (isPersoon(o)) {
      // Personen: handvat in de kijkrichting.
      const a = ((o.kijkrichting ?? -90) * Math.PI) / 180;
      const r = (v.straal ?? 0.5) + extra;
      uit.draai = [o.x + Math.cos(a) * r, o.y + Math.sin(a) * r];
    } else {
      const y0 = v.rechthoek ? v.rechthoek[2] : -(v.straal ?? 0.5);
      uit.draai = wereld(o, [0, y0 - extra]);
    }
  }
  const m = maatBaar(o);
  if (m && v.rechthoek) {
    const [, x1, , y1] = v.rechthoek;
    uit.maat = wereld(o, [m === 'lengte' ? 0 : x1, m === 'breedte' ? 0 : y1]);
  }
  return uit;
}

export function lijnHandvatten(t: Tekening, l: Lijn): Record<'begin' | 'midden' | 'eind', Punt> {
  const pts = lijnPunten(l, plekIn(t));
  return {
    begin: pts[0]!,
    midden: lijnMidden(l, plekIn(t)),
    eind: pts[pts.length - 1]!,
  };
}

// ---------- wijzigen ----------

const metObjecten = (t: Tekening, objecten: VeldObject[]): Tekening => ({
  ...t,
  objecten,
});

export function voegToe(t: Tekening, o: VeldObject): Tekening {
  const uit = metObjecten(t, [...t.objecten, o]);
  return o.soort === 'bal' ? koppelBal(uit, o.id) : uit;
}

export function zetObject(t: Tekening, id: string, w: Partial<VeldObject>): Tekening {
  return metObjecten(
    t,
    t.objecten.map((o) => (o.id === id ? { ...o, ...w } : o)),
  );
}

const KOPPEL = 0.8;

/** Een bal die vlak bij een persoon ligt, is van die persoon (hij beweegt mee); ver weg weer los. */
function koppelBal(t: Tekening, id: string): Tekening {
  const bal = t.objecten.find((o) => o.id === id);
  if (!bal || bal.soort !== 'bal') return t;
  const plek = plekIn(t)(id)!;
  let dichtst: VeldObject | undefined;
  let d = KOPPEL;
  for (const o of t.objecten) {
    if (!isPersoon(o)) continue;
    const a = Math.hypot(o.x - plek[0], o.y - plek[1]);
    if (a < d) {
      d = a;
      dichtst = o;
    }
  }
  // Al bezet door een andere bal: dan niet koppelen.
  if (dichtst && t.objecten.some((o) => o.soort === 'bal' && o.id !== id && o.bij === dichtst!.id)) dichtst = undefined;
  if (dichtst?.id === bal.bij) return t;
  const { bij: _weg, ...los } = bal;
  void _weg;
  const nieuw: VeldObject = dichtst ? { ...los, bij: dichtst.id, x: r1(dichtst.x), y: r1(dichtst.y) } : { ...los, x: r1(plek[0]), y: r1(plek[1]) };
  return metObjecten(
    t,
    t.objecten.map((o) => (o.id === id ? nieuw : o)),
  );
}

/** Verplaatsen. Een bal koppelt aan of los van een persoon; een persoon neemt zijn bal mee. */
export function verplaats(t: Tekening, id: string, p: Punt): Tekening {
  const o = t.objecten.find((x) => x.id === id);
  if (!o) return t;
  let uit = zetObject(t, id, { x: r1(p[0]), y: r1(p[1]) });
  if (o.soort === 'bal') {
    if (o.bij) {
      // Ver genoeg van de houder weggesleept: los.
      const h = t.objecten.find((x) => x.id === o.bij);
      if (h && Math.hypot(h.x - p[0], h.y - p[1]) > KOPPEL) {
        uit = metObjecten(
          uit,
          uit.objecten.map((x) => {
            if (x.id !== id) return x;
            const { bij: _b, ...rest } = x;
            void _b;
            return rest;
          }),
        );
      } else return t;
    }
    return uit;
  }
  return uit;
}

/** Na het loslaten van een bal: koppelen aan een persoon als hij er vlakbij ligt. */
export function lagBalNeer(t: Tekening, id: string): Tekening {
  return koppelBal(t, id);
}

export function draai(t: Tekening, id: string, hoek: number): Tekening {
  const o = t.objecten.find((x) => x.id === id);
  if (!o) return t;
  const h = Math.round((((hoek % 360) + 540) % 360) - 180);
  return zetObject(t, id, isPersoon(o) ? { kijkrichting: h } : { hoek: h });
}

/** Nieuwe maat vanuit het handvat op punt p (symmetrisch rond het midden). */
export function maatNaar(t: Tekening, id: string, p: Punt): Tekening {
  const o = t.objecten.find((x) => x.id === id);
  const m = o && maatBaar(o);
  if (!o || !m) return t;
  const q = lokaal(o, p);
  const b = Math.max(0.5, Math.min(110, r1(Math.abs(q[0]) * 2)));
  const l = Math.max(0.5, Math.min(110, r1(Math.abs(q[1]) * 2)));
  if (m === 'breedte-lengte') return zetObject(t, id, { breedte: b, lengte: l });
  if (m === 'breedte') return zetObject(t, id, { breedte: b });
  // Stok: lengte langs de eigen x-as; ladder: langs de y-as.
  return zetObject(t, id, { lengte: o.soort === 'stok' ? b : l });
}

/** Kopie iets verschoven, met een nieuwe id (en een nieuw nummer bij personen). */
export function kopieer(t: Tekening, id: string): { tekening: Tekening; id: string } {
  const o = t.objecten.find((x) => x.id === id);
  if (!o) return { tekening: t, id };
  const voorvoegsel = id.replace(/\d+$/, '') || 'o';
  const nieuw: VeldObject = {
    ...o,
    id: nieuwId(t, voorvoegsel),
    x: r1(o.x + 1.5),
    y: r1(o.y + 1.5),
  };
  delete nieuw.bij;
  if (o.nummer !== undefined) nieuw.nummer = volgendNummer(t, o.soort, o.team);
  delete nieuw.verdedigt;
  return { tekening: voegToe(t, nieuw), id: nieuw.id };
}

/** Weghalen. Een bal van deze persoon blijft liggen; lijnen die eraan vastzaten, blijven op hun plek. */
export function verwijder(t: Tekening, id: string): Tekening {
  const plek = plekIn(t);
  const o = t.objecten.find((x) => x.id === id);
  if (!o) return t;
  const objecten = t.objecten
    .filter((x) => x.id !== id)
    .map((x) => {
      if (x.bij !== id) return x;
      const { bij: _b, ...rest } = x;
      void _b;
      return { ...rest, x: r1(o.x), y: r1(o.y + 0.55) };
    });
  const lijnen = (t.lijnen ?? []).map((l) => losVan(l, id, plek));
  return { ...t, objecten, lijnen };
}

function losVan(l: Lijn, id: string, plek: (id: string) => Punt | undefined): Lijn {
  if (l.van !== id && l.naar !== id) return l;
  const pts = lijnPunten({ ...l, bocht: undefined }, plek);
  const uit: Lijn = {
    ...l,
    punten: [pts[0]!, ...l.punten.slice(1, -1), pts[pts.length - 1]!],
  };
  if (l.van === id) delete uit.van;
  if (l.naar === id) delete uit.naar;
  return uit;
}

// ---------- lijnen ----------

/** Persoon (of bal) waar een lijnpunt aan vast kan: binnen de marge. */
export function vastPunt(t: Tekening, p: Punt, marge: number): VeldObject | undefined {
  // Een persoon gaat voor (ook als zijn bal ervoor ligt): de lijn hoort bij de speler, de bal gaat toch met hem mee.
  let beste: VeldObject | undefined;
  let d = marge;
  for (const o of t.objecten) {
    if (!isPersoon(o)) continue;
    const a = afstandTotObject(o, p);
    if (a <= d) {
      d = a;
      beste = o;
    }
  }
  if (beste) return beste;
  const o = raakObject(t, p, marge);
  return o?.soort === 'bal' && !o.bij ? o : undefined;
}

export function nieuweLijn(t: Tekening, soort: LijnSoort, van: Punt, naar: Punt, marge: number): Lijn {
  const a = vastPunt(t, van, marge);
  const b = vastPunt(t, naar, marge);
  const l: Lijn = {
    soort,
    punten: [
      [r1(van[0]), r1(van[1])],
      [r1(naar[0]), r1(naar[1])],
    ],
  };
  if (a) l.van = a.id;
  if (b && b.id !== a?.id) l.naar = b.id;
  return l;
}

export function voegLijnToe(t: Tekening, l: Lijn): Tekening {
  return { ...t, lijnen: [...(t.lijnen ?? []), l] };
}

export function zetLijn(t: Tekening, i: number, l: Lijn): Tekening {
  return { ...t, lijnen: (t.lijnen ?? []).map((x, j) => (j === i ? l : x)) };
}

export function verwijderLijn(t: Tekening, i: number): Tekening {
  return { ...t, lijnen: (t.lijnen ?? []).filter((_, j) => j !== i) };
}

/** Handvat van een lijn verslepen: begin/eind (opnieuw vastmaken of los) of het buigpunt. */
export function sleepLijn(t: Tekening, i: number, h: 'begin' | 'midden' | 'eind', p: Punt, marge: number): Tekening {
  const l = t.lijnen?.[i];
  if (!l) return t;
  const q: Punt = [r1(p[0]), r1(p[1])];
  if (h === 'midden') {
    // Bijna recht: geen bocht.
    const { begin, eind } = lijnHandvatten(t, { ...l, bocht: undefined });
    const recht = afstandTotLijnstuk(q, begin, eind) < 0.25;
    const uit = { ...l };
    if (recht) delete uit.bocht;
    else uit.bocht = q;
    return zetLijn(t, i, uit);
  }
  const vast = vastPunt(t, q, marge);
  const uit: Lijn = { ...l, punten: [...l.punten] };
  if (h === 'begin') {
    uit.punten[0] = q;
    if (vast && vast.id !== l.naar) uit.van = vast.id;
    else delete uit.van;
  } else {
    uit.punten[uit.punten.length - 1] = q;
    if (vast && vast.id !== l.van) uit.naar = vast.id;
    else delete uit.naar;
  }
  return zetLijn(t, i, uit);
}

// ---------- ongedaan maken ----------

/** Geschiedenis voor ongedaan maken / opnieuw. Tijdens slepen: `begin`, dan `vervang`, dan `klaar` (één stap). */
export class Geschiedenis<T> {
  private terugStapel: T[] = [];
  private vooruitStapel: T[] = [];
  private basis: T | null = null;

  constructor(
    public nu: T,
    private max = 100,
  ) {}

  zet(nieuw: T): void {
    if (nieuw === this.nu) return;
    this.terugStapel.push(this.nu);
    if (this.terugStapel.length > this.max) this.terugStapel.shift();
    this.vooruitStapel = [];
    this.nu = nieuw;
  }

  begin(): void {
    this.basis = this.nu;
  }

  vervang(nieuw: T): void {
    this.nu = nieuw;
  }

  klaar(): void {
    if (this.basis !== null && this.basis !== this.nu) {
      this.terugStapel.push(this.basis);
      if (this.terugStapel.length > this.max) this.terugStapel.shift();
      this.vooruitStapel = [];
    }
    this.basis = null;
  }

  /** Slepen afgebroken: terug naar hoe het was. */
  annuleer(): void {
    if (this.basis !== null) this.nu = this.basis;
    this.basis = null;
  }

  get kanTerug(): boolean {
    return this.terugStapel.length > 0;
  }

  get kanVooruit(): boolean {
    return this.vooruitStapel.length > 0;
  }

  terug(): T {
    const vorige = this.terugStapel.pop();
    if (vorige !== undefined) {
      this.vooruitStapel.push(this.nu);
      this.nu = vorige;
    }
    return this.nu;
  }

  vooruit(): T {
    const volgende = this.vooruitStapel.pop();
    if (volgende !== undefined) {
      this.terugStapel.push(this.nu);
      this.nu = volgende;
    }
    return this.nu;
  }
}

// ---------- benodigdheden ----------

const BENODIGD: Record<string, [string, string]> = {
  goal: ['groot goal', 'grote goals'],
  jeugdgoal: ['jeugdgoal', 'jeugdgoals'],
  'klein-goal': ['klein goal', 'kleine goals'],
  pion: ['pion', 'pionnen'],
  hoedje: ['hoedje', 'hoedjes'],
  paaltje: ['paaltje', 'paaltjes'],
  stok: ['stok', 'stokken'],
  ladder: ['loopladder', 'loopladders'],
  'horde-laag': ['lage horde', 'lage hordes'],
  'horde-hoog': ['hoge horde', 'hoge hordes'],
  ring: ['ring', 'ringen'],
  bank: ['bank', 'banken'],
  pop: ['pop', 'poppen'],
  rebounder: ['rebounder', 'rebounders'],
  net: ['net', 'netten'],
  lint: ['lint', 'linten'],
  keepersmat: ['keepersmat', 'keepersmatten'],
  landingskussen: ['landingskussen', 'landingskussens'],
  bal: ['bal', 'ballen'],
};

/** Voorstel voor de benodigdheden uit wat er getekend is, bv. ["6 pionnen", "1 groot goal", "2 ballen", "Hesjes"]. */
export function benodigdhedenUit(t: Tekening): string[] {
  const tel = new Map<string, number>();
  for (const o of t.objecten) {
    const p = paletVan(o);
    if (p && BENODIGD[p.sleutel]) tel.set(p.sleutel, (tel.get(p.sleutel) ?? 0) + 1);
  }
  const uit: string[] = [];
  for (const p of PALET) {
    const n = tel.get(p.sleutel);
    if (!n) continue;
    const [een, meer] = BENODIGD[p.sleutel]!;
    uit.push(`${n} ${n === 1 ? een : meer}`);
  }
  // Twee teams of jokers: hesjes.
  const teams = new Set(t.objecten.filter((o) => o.soort === 'speler').map((o) => o.team ?? 'A'));
  if (teams.size > 1) uit.push('Hesjes');
  return uit;
}

/** Aantal spelers en keepers in de tekening (voorstel voor "nodig"). */
export function telPersonen(t: Tekening): { spelers: number; keepers: number } {
  return {
    spelers: t.objecten.filter((o) => o.soort === 'speler').length,
    keepers: t.objecten.filter((o) => o.soort === 'keeper').length,
  };
}

// ---------- animatie ----------

export const heeftAnimatie = (t: Tekening) => (t.animatie?.length ?? 0) > 0;

/**
 * Van een geanimeerde oefening (kopie van een ingebouwde) een stilstaande tekening maken: iedereen op zijn plek aan
 * het begin van de animatie (ook spelers in een rij), zonder animatiestappen.
 */
export function bevries(t: Tekening): Tekening {
  if (!heeftAnimatie(t) && !t.rijen?.length) return t;
  const tl = maakTijdlijn(t);
  const s = standOp(tl, 0);
  const objecten = t.objecten.map((o) => {
    const st = s.objecten.get(o.id);
    if (!st) return o;
    const uit: VeldObject = { ...o, x: r1(st.x), y: r1(st.y) };
    if (isPersoon(o)) uit.kijkrichting = Math.round(st.hoek);
    if (o.soort === 'bal') {
      // Wie de bal aan het begin heeft.
      const e = tl.balEvents.get(o.id)?.[0];
      if (e?.soort === 'vast' && e.t0 <= 0.01 && e.houder) uit.bij = e.houder;
      else delete uit.bij;
    }
    return uit;
  });
  const { animatie: _a, rijen: _r, ...rest } = t;
  void _a;
  void _r;
  return { ...rest, objecten };
}

// ---------- uitsnede ----------

/**
 * Stuk veld dat in de oefening in beeld komt: bij een half of heel veld rond wat er getekend is (met wat ruimte),
 * bij een leeg veld het hele veld.
 */
export function autoUitsnede(t: Tekening): Uitsnede | undefined {
  if (t.veld.type === 'leeg' || !t.objecten.length) return undefined;
  const { breedte, lengte } = veldMaten(t);
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const neem = (p: Punt) => {
    x0 = Math.min(x0, p[0]);
    y0 = Math.min(y0, p[1]);
    x1 = Math.max(x1, p[0]);
    y1 = Math.max(y1, p[1]);
  };
  for (const o of t.objecten) {
    const v = objectVorm(o);
    if (v.rechthoek) {
      const [a, b, c, d] = v.rechthoek;
      for (const q of [
        [a, c],
        [b, c],
        [a, d],
        [b, d],
      ] as Punt[])
        neem(wereld(o, q));
    } else neem([o.x, o.y]);
  }
  for (const l of t.lijnen ?? []) for (const p of lijnPunten(l, plekIn(t))) neem(p);
  const marge = 4;
  x0 = Math.max(-3, x0 - marge);
  y0 = Math.max(-3, y0 - marge);
  x1 = Math.min(breedte + 3, x1 + marge);
  y1 = Math.min(lengte + 3, y1 + marge);
  // Niet kleiner dan 16 × 16 m (anders wordt alles reusachtig).
  const groei = (a: number, b: number, min: number, max: number): [number, number] => {
    if (b - a >= min) return [a, b];
    const m = (a + b) / 2;
    return [Math.max(-3, Math.min(m - min / 2, max + 3 - min)), Math.min(max + 3, Math.max(m + min / 2, -3 + min))];
  };
  [x0, x1] = groei(x0, x1, 16, breedte);
  [y0, y1] = groei(y0, y1, 16, lengte);
  const vol = STANDAARD_MATEN[t.veld.type];
  if (x1 - x0 >= vol.breedte && y1 - y0 >= (t.veld.lengte ?? vol.lengte)) return undefined;
  return { x: r1(x0), y: r1(y0), breedte: r1(x1 - x0), lengte: r1(y1 - y0) };
}
