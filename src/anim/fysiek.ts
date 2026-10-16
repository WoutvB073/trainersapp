import type { Actie, Punt, Stap, Tekening, VeldObject } from '../model/types';
import { HORDE } from '../model/types';
import { maakTijdlijn, standOp, type Tijdlijn } from './timeline';

/**
 * Fysieke controle van een oefening: kan dit in het echt?
 * - Een bal over de grond of laag mag niet door of over ladders, hordes, ringen, stokken, pionnen, paaltjes, poppen,
 *   banken, rebounders, muurtjes, netten of de boarding van een kooi (behalve als hij er bewust tegenaan gespeeld wordt).
 * - Een hoge bal mag wel over lage dingen, maar niet door een net of lint en niet via de zijkant of achterkant een goal in.
 * - Een bal gaat niet dwars door een speler die hem niet speelt of krijgt.
 * - Spelers lopen niet door materiaal; door een ladder, over hordes, door ringen en over stokken alleen met een passende
 *   loopwijze (voetenwerk, hordes, springen, huppelen, kniehef).
 * Geeft een lijst met fouten (leeg = alles klopt). Puur rekenwerk op de tijdlijn.
 */

const BAL_R = 0.11;
const LIJF = 0.22;
const STAP = 0.03;
const PARCOURS_MANIEREN = ['voetenwerk', 'hordes', 'sprong', 'huppel', 'kniehef', 'zijwaarts'];

/** Punt in de eigen assen van een object (gedraaid met `hoek`). */
function lokaal(o: VeldObject, p: Punt): Punt {
  const a = (-(o.hoek ?? 0) * Math.PI) / 180;
  const dx = p[0] - o.x;
  const dy = p[1] - o.y;
  return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
}

interface Vorm {
  /** Halve maten (rechthoek in eigen assen) of straal (cirkel). */
  rechthoek?: [number, number];
  straal?: number;
  /** Hoogte van het ding (een bal eronder of erdoorheen botst). */
  hoogte: number;
  /** Lijn die je niet over mag (net, boarding): eigen x-as van -l tot l. */
  lijn?: number;
}

/** Vormen van het materiaal (zoals ze in 2D en 3D getekend worden). */
function vormen(o: VeldObject): Vorm[] {
  switch (o.soort) {
    case 'ladder':
      return [{ rechthoek: [(o.breedte ?? 0.5) / 2, (o.lengte ?? 4) / 2], hoogte: 0.06 }];
    case 'horde':
      return [{ rechthoek: [(o.breedte ?? 0.8) / 2, 0.06], hoogte: o.hoogte ?? HORDE.laag }];
    case 'stok':
      return [{ rechthoek: [(o.lengte ?? 1.5) / 2, 0.04], hoogte: 0.06 }];
    case 'ring':
      return [{ straal: 0.35, hoogte: 0.04 }];
    case 'pion':
      return [{ straal: 0.14, hoogte: 0.3 }];
    case 'paaltje':
      return [{ straal: 0.05, hoogte: o.hoogte ?? 1.5 }];
    case 'pop':
      return [{ straal: 0.25, hoogte: 1.8 }];
    case 'bank':
      return [{ rechthoek: [(o.breedte ?? 2.5) / 2, 0.16], hoogte: 0.45 }];
    case 'rebounder':
      return [{ rechthoek: [(o.breedte ?? 1.2) / 2, 0.15], hoogte: 0.9 }];
    case 'muurtje':
      return [{ rechthoek: [(o.breedte ?? 2.4) / 2, 0.2], hoogte: 1.8 }];
    case 'net':
      return [{ lijn: (o.breedte ?? 6) / 2, hoogte: o.hoogte ?? 1 }];
    default:
      return [];
  }
}

/** Afstand van een punt (eigen assen) tot een vorm (0 = erin). */
function afstandTot(v: Vorm, q: Punt): number {
  if (v.straal !== undefined) return Math.max(0, Math.hypot(q[0], q[1]) - v.straal);
  if (v.rechthoek) {
    const dx = Math.max(0, Math.abs(q[0]) - v.rechthoek[0]);
    const dy = Math.max(0, Math.abs(q[1]) - v.rechthoek[1]);
    return Math.hypot(dx, dy);
  }
  return Infinity;
}

/** Alle acties, ook binnen herhalingen en tegelijk-stappen. */
function alleActies(stappen: Stap[]): Actie[] {
  return stappen.flatMap((st) => ('acties' in st ? st.acties : 'herhaal' in st ? alleActies(st.herhaal.stappen) : st.tegelijk.flatMap(alleActies)));
}

const PERSONEN = ['speler', 'keeper', 'trainer'];
const r2 = (x: number) => x.toFixed(1);

/** Eén fysieke fout: technische tekst (tests), begrijpelijke uitleg (editor), tijdstip en wie de bal speelt of loopt. */
export interface FysiekeMelding {
  tekst: string;
  uitleg: string;
  t: number;
  wie?: string;
}

/** Naam van materiaal in een zin ("de ladder"). */
const NAAM: Partial<Record<VeldObject['soort'], string>> = {
  ladder: 'de ladder',
  horde: 'een horde',
  stok: 'een stok',
  ring: 'een ring',
  pion: 'een pion',
  paaltje: 'een paaltje',
  pop: 'een pop',
  bank: 'een bank',
  rebounder: 'de rebounder',
  muurtje: 'het muurtje',
  net: 'het net of lint',
  kooi: 'de boarding',
  goal: 'het goal',
  'klein-goal': 'het goal',
};

export function fysiekeFouten(tekening: Tekening, tl: Tijdlijn = maakTijdlijn(tekening)): string[] {
  return fysiekeMeldingen(tekening, tl).map((m) => m.tekst);
}

export function fysiekeMeldingen(tekening: Tekening, tl: Tijdlijn = maakTijdlijn(tekening)): FysiekeMelding[] {
  const fouten = new Map<string, FysiekeMelding>();
  const persoonNaam = (id: string) => {
    const o = tekening.objecten.find((x) => x.id === id);
    if (!o) return id;
    if (o.soort === 'keeper') return o.nummer && tekening.objecten.filter((x) => x.soort === 'keeper').length > 1 ? `keeper ${o.nummer}` : 'de keeper';
    if (o.soort === 'trainer') return 'de trainer';
    return o.nummer ? `speler ${o.nummer}` : 'een speler';
  };
  const naam = (o: VeldObject) => NAAM[o.soort] ?? o.soort;
  const meld = (tekst: string, t: number, uitleg: string, wie?: string) => {
    if (!fouten.has(tekst)) fouten.set(tekst, { tekst, t, uitleg, wie });
  };
  const materiaal = tekening.objecten.filter((o) => vormen(o).length || o.soort === 'kooi');
  const goals = tekening.objecten.filter((o) => o.soort === 'goal' || o.soort === 'klein-goal');
  const personen = tekening.objecten.filter((o) => PERSONEN.includes(o.soort)).map((o) => o.id);
  const panna = new Set(alleActies(tekening.animatie ?? []).flatMap((a) => (a.type === 'panna' ? [a.wie + '>' + a.door] : [])));

  // ---------- ballen ----------
  for (const [bal, lijst] of tl.balEvents) {
    for (const e of lijst) {
      if (e.soort !== 'vlucht' || e.t1 - e.t0 < 0.05) continue;
      // Materiaal waar de bal bewust tegenaan gaat of vanaf terugkaatst (rebounder, pop, bank, muurtje).
      const doelwit = new Set(materiaal.filter((o) => Math.hypot(e.naar[0] - o.x, e.naar[1] - o.y) < 0.9 || Math.hypot(e.van[0] - o.x, e.van[1] - o.y) < 0.9).map((o) => o.id));
      let vorige: { p: Punt; h: number } | undefined;
      for (let t = e.t0 + 0.02; t < e.t1 - 0.02; t += STAP) {
        const s = standOp(tl, t);
        const b = s.objecten.get(bal)!;
        if (b.houder) continue;
        const p: Punt = [b.x, b.y];
        const h = b.hoogte;
        for (const o of materiaal) {
          if (doelwit.has(o.id)) continue;
          if (o.soort === 'kooi') {
            // Boarding van 0,5 m: niet laag eroverheen.
            const q = lokaal(o, p);
            const w = (o.breedte ?? 7) / 2;
            const l = (o.lengte ?? 5) / 2;
            const binnen = Math.abs(q[0]) < w && Math.abs(q[1]) < l;
            if (vorige) {
              const qv = lokaal(o, vorige.p);
              const was = Math.abs(qv[0]) < w && Math.abs(qv[1]) < l;
              if (was !== binnen && h < 0.6) meld(`bal ${bal} gaat laag over de boarding van ${o.id} (t=${r2(t)})`, t, 'De bal gaat laag over de boarding', e.passeerder);
            }
            continue;
          }
          for (const v of vormen(o)) {
            const q = lokaal(o, p);
            if (v.lijn !== undefined) {
              // Net/lint: bij het oversteken hoog genoeg.
              if (vorige && Math.abs(q[0]) < v.lijn + BAL_R) {
                const qv = lokaal(o, vorige.p);
                if (Math.sign(qv[1]) !== Math.sign(q[1]) && Math.min(h, vorige.h) < v.hoogte + 0.05) meld(`bal ${bal} gaat door ${o.id} (${o.soort}) op ${h.toFixed(2)} m (t=${r2(t)})`, t, `De bal gaat door ${naam(o)} (te laag)`, e.passeerder);
              }
              continue;
            }
            if (afstandTot(v, q) < BAL_R && h < v.hoogte + BAL_R) meld(`bal ${bal} gaat door/over ${o.id} (${o.soort}) op ${h.toFixed(2)} m (t=${r2(t)})`, t, `De bal gaat door of laag over ${naam(o)}`, e.passeerder);
          }
        }
        // Goal: alleen via de opening erin.
        for (const g of goals) {
          const groot = g.soort === 'goal';
          const B = (g.breedte ?? (groot ? 7.32 : 3)) / 2;
          const D = g.lengte ?? (groot ? 2 : 1.2);
          const H = g.hoogte ?? (groot ? 2.44 : 1);
          // Eigen assen: x langs de lijn, y het veld in (opening naar +y bij hoek 0).
          const q = lokaal(g, p);
          const binnen = Math.abs(q[0]) < B && q[1] < 0 && q[1] > -D && h < H;
          if (binnen && vorige) {
            const qv = lokaal(g, vorige.p);
            const wasBinnen = Math.abs(qv[0]) < B && qv[1] < 0 && qv[1] > -D && vorige.h < H;
            const viaOpening = qv[1] >= 0 && Math.abs(qv[0]) < B + 0.15;
            if (!wasBinnen && !viaOpening) meld(`bal ${bal} gaat door het net van ${g.id} (zij- of achterkant, t=${r2(t)})`, t, 'De bal gaat via de zij- of achterkant het goal in', e.passeerder);
          }
        }
        // Spelers die de bal niet spelen of krijgen.
        if (h < 1.8) {
          for (const id of personen) {
            if (id === e.passeerder || id === e.daarna) continue;
            const ps = s.objecten.get(id)!;
            // Liggend, of bewust tussen de benen door (panna).
            if (ps.liggen > 0.3 || panna.has(`${e.passeerder}>${id}`)) continue;
            if (Math.hypot(ps.x - p[0], ps.y - p[1]) < LIJF + BAL_R - 0.03) meld(`bal ${bal} gaat door ${id} heen (t=${r2(t)})`, t, `De bal gaat dwars door ${persoonNaam(id)} heen`, e.passeerder ?? undefined);
          }
        }
        vorige = { p, h };
      }
    }
  }

  // ---------- spelers door materiaal ----------
  const vorigePlek = new Map<string, Punt>();
  for (let t = 0; t <= tl.duur; t += 0.05) {
    const s = standOp(tl, t);
    for (const id of personen) {
      const ps = s.objecten.get(id)!;
      const p: Punt = [ps.x, ps.y];
      const vp = vorigePlek.get(id);
      vorigePlek.set(id, p);
      if (ps.liggen > 0.2) continue;
      const parcours = !!ps.manier && PARCOURS_MANIEREN.includes(ps.manier);
      for (const o of materiaal) {
        if (o.soort === 'kooi') {
          if (!vp) continue;
          const w = (o.breedte ?? 7) / 2;
          const l = (o.lengte ?? 5) / 2;
          const q = lokaal(o, p);
          const qv = lokaal(o, vp);
          if (Math.abs(q[0]) < w && Math.abs(q[1]) < l) {
            if (!(Math.abs(qv[0]) < w && Math.abs(qv[1]) < l)) meld(`${id} loopt door de boarding van ${o.id} (t=${r2(t)})`, t, `${persoonNaam(id)} loopt door de boarding`, id);
          } else if (Math.abs(qv[0]) < w && Math.abs(qv[1]) < l) meld(`${id} loopt door de boarding van ${o.id} (t=${r2(t)})`, t, `${persoonNaam(id)} loopt door de boarding`, id);
          continue;
        }
        for (const v of vormen(o)) {
          const q = lokaal(o, p);
          if (v.lijn !== undefined) {
            if (vp && Math.abs(q[0]) < v.lijn) {
              const qv = lokaal(o, vp);
              if (Math.sign(qv[1]) !== Math.sign(q[1])) meld(`${id} loopt door ${o.id} (${o.soort}, t=${r2(t)})`, t, `${persoonNaam(id)} loopt door ${naam(o)}`, id);
            }
            continue;
          }
          const d = afstandTot(v, q);
          if (o.soort === 'ladder' || o.soort === 'horde' || o.soort === 'ring' || o.soort === 'stok') {
            if (d < LIJF * 0.6 && !parcours) meld(`${id} staat/loopt in ${o.id} (${o.soort}) zonder parcours-loopwijze (t=${r2(t)})`, t, `${persoonNaam(id)} loopt door ${naam(o)} zonder voetenwerk of sprongen`, id);
          } else if (o.soort !== 'pion' && o.soort !== 'paaltje' && d < LIJF) {
            // Pionnen en paaltjes controleert de afstandstest al (0,5 m).
            meld(`${id} loopt door ${o.id} (${o.soort}, t=${r2(t)})`, t, `${persoonNaam(id)} loopt door ${naam(o)}`, id);
          }
        }
      }
    }
  }
  return [...fouten.values()];
}
