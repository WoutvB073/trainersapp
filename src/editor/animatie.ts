import type { Actie, AnimatieStap, BalActie, BalHoogte, BeweegActie, Lijn, Manier, Punt, Rij, Stap, Tekening, VeldObject } from '../model/types';
import { PERSONEN } from '../model/types';
import { lijnPunten } from '../model/lijn';
import { maakTijdlijn, standOp, TekeningFout, type Tijdlijn } from '../anim/timeline';
import { fysiekeMeldingen } from '../anim/fysiek';
import { lokaal, wereld } from './editor';
import { doelnetGaten, goalMaten, netVan } from '../anim/doelnet';

/**
 * Animatie uit de editor: de getekende lijnen met een stapnummer worden gewone animatiestappen voor de bestaande
 * tijdlijn (er is geen tweede animatielogica).
 * - Looplijn: de speler loopt langs de lijn (over een ladder/horde/ring vanzelf met voetenwerk/hordes/huppelen).
 * - Dribbellijn: de speler dribbelt met de bal langs de lijn.
 * - Ballijn naar een speler: pass (de ontvanger loopt de bal een stukje tegemoet en neemt hem aan).
 * - Ballijn naar een goal: schot; de keeper bij dat goal reageert vanzelf (vangen, duiken, te laat).
 * - Ballijn naar een rebounder, pop, bank of muurtje: de bal kaatst terug naar de passeerder.
 * - Ballijn naar een leeg stuk veld: de bal rolt daarheen (wie er later met een dribbel begint, pakt hem op).
 * Lijnen met hetzelfde nummer gebeuren tegelijk. Wat niet kan (pass zonder bal), wordt overgeslagen met een melding.
 */

export interface LijnMelding {
  /** Index in `tekening.lijnen` (-1 = algemene melding). */
  lijn: number;
  tekst: string;
  /** `fout`: de lijn doet niet mee in de animatie; `let op`: hij doet mee, maar is in het echt lastig (fysieke check). */
  soort: 'fout' | 'let op';
}

export interface Omzetting {
  /** Afspeelbare tekening: objecten (keepers verdedigen hun goal), animatiestappen, eventueel een rij. */
  tekening: Tekening;
  meldingen: LijnMelding[];
  /** Per animatiestap (zonder herhaling): welke lijnen erin zitten. */
  stapLijnen: number[][];
}

const isPersoon = (o: VeldObject | undefined): o is VeldObject => !!o && PERSONEN.includes(o.soort);
const afstand = (a: Punt, b: Punt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const r2 = (v: number) => Math.round(v * 100) / 100;
const rond = (p: Punt): Punt => [r2(p[0]), r2(p[1])];

/** Lijnen die meedoen in de animatie. */
export const heeftLijnAnimatie = (t: Tekening) => !t.animatie?.length && (t.lijnen ?? []).some((l) => (l.stap ?? 0) > 0);

/** Volgend stapnummer voor een nieuwe lijn. */
export function volgendeStap(t: Tekening): number {
  return Math.max(0, ...(t.lijnen ?? []).map((l) => l.stap ?? 0)) + 1;
}

const BIJ = 1.5;

/** Afmetingen van een goal (zoals de renderer). */
function goalMaat(g: VeldObject) {
  const groot = g.soort === 'goal';
  return { B: g.breedte ?? (groot ? 7.32 : 3), D: g.lengte ?? (groot ? 2 : 1.2) };
}

/** Ligt dit punt in of vlak voor een goal? */
function goalBij(goals: VeldObject[], p: Punt): VeldObject | undefined {
  for (const g of goals) {
    const { B, D } = goalMaat(g);
    const q = lokaal(g, p);
    if (Math.abs(q[0]) < B / 2 + 1.5 && q[1] > -D - 0.6 && q[1] < 2.2) return g;
  }
  return undefined;
}

/** Waar het schot heen gaat: net achter de doellijn, binnen de palen (of er net naast). */
function schotDoel(g: VeldObject, p: Punt, afloop: Lijn['afloop']): Punt {
  const { B } = goalMaat(g);
  const q = lokaal(g, p);
  const kant = Math.sign(q[0]) || 1;
  let lx = Math.max(-(B / 2 - 0.35), Math.min(B / 2 - 0.35, q[0]));
  if (afloop === 'duikt') lx = kant * Math.max(Math.abs(lx), B / 2 - 0.7);
  if (afloop === 'naast') lx = kant * (B / 2 + 1);
  return rond(wereld(g, [lx, -0.3]));
}

/**
 * Schot op een goal met een doelnet. De hoogte van de lijn kiest de rij gaten (standaard/grond = laag, hoog = hoog;
 * halfhoog = midden, daar zit geen gat). Eindigt de lijn in een hoek, dan gaat de bal door het gat het goal in;
 * anders kaatst hij terug van het net, richting de schutter.
 */
export function doelnetSchot(g: VeldObject, eind: Punt, hoogte: Lijn['hoogte'], van: Punt): { naar: Punt; eindHoogte: number; hoogte: BalHoogte; terugNaar?: Punt } {
  const { B, H } = goalMaten(g);
  const q = lokaal(g, eind);
  const rij = hoogte === 'hoog' ? 'hoog' : hoogte === 'halfhoog' ? 'midden' : 'laag';
  const gat = doelnetGaten(B, H).find((x) => x.rij === rij && Math.sign(q[0]) === Math.sign(x.x) && Math.abs(q[0]) >= Math.abs(x.x) - (x.r + 0.6));
  const boog: BalHoogte = rij === 'hoog' ? 'halfhoog' : 'laag';
  if (gat) return { naar: rond(wereld(g, [gat.x, -0.6])), eindHoogte: Math.round(gat.h * 0.9 * 100) / 100, hoogte: boog };
  const lx = Math.max(-(B / 2 - 0.3), Math.min(B / 2 - 0.3, q[0]));
  const raak = wereld(g, [lx, 0.15]);
  const h = rij === 'hoog' ? H - 0.45 : rij === 'midden' ? H * 0.5 : 0.45;
  const d = afstand(raak, van) || 1;
  const terug = Math.max(3, Math.min(7, d * 0.4));
  return { naar: rond(raak), eindHoogte: Math.round(h * 100) / 100, hoogte: boog, terugNaar: rond([raak[0] + ((van[0] - raak[0]) / d) * terug, raak[1] + ((van[1] - raak[1]) / d) * terug]) };
}

/** Wordt er over een parcoursding gelopen? Dan de bijpassende loopwijze. */
function parcoursManier(objecten: VeldObject[], pad: Punt[]): Manier | undefined {
  let uit: Manier | undefined;
  for (const o of objecten) {
    if (o.soort !== 'ladder' && o.soort !== 'horde' && o.soort !== 'ring' && o.soort !== 'stok') continue;
    const half: Punt =
      o.soort === 'ladder' ? [(o.breedte ?? 0.5) / 2, (o.lengte ?? 4) / 2] : o.soort === 'horde' ? [(o.breedte ?? 0.8) / 2, 0.15] : o.soort === 'stok' ? [(o.lengte ?? 1.5) / 2, 0.12] : [0.4, 0.4];
    for (let i = 1; i < pad.length; i++) {
      const [a, b] = [pad[i - 1]!, pad[i]!];
      const n = Math.max(2, Math.ceil(afstand(a, b) / 0.15));
      for (let j = 0; j <= n; j++) {
        const q = lokaal(o, [a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n]);
        if (Math.abs(q[0]) <= half[0] + 0.1 && Math.abs(q[1]) <= half[1] + 0.1) {
          const m: Manier = o.soort === 'ladder' ? 'voetenwerk' : o.soort === 'ring' ? 'huppel' : 'hordes';
          // Ladder gaat voor (voetenwerk), daarna hordes.
          if (!uit || m === 'voetenwerk') uit = m;
        }
      }
    }
  }
  return uit;
}

/** Een gebogen lijn heeft 25 punten: een paar tussenpunten is genoeg voor de beweging. */
function tussenpunten(pad: Punt[]): Punt[] {
  const midden = pad.slice(1, -1);
  if (midden.length <= 6) return midden.map(rond);
  const uit: Punt[] = [];
  for (let i = 4; i < pad.length - 1; i += 4) uit.push(rond(pad[i]!));
  return uit;
}

const persoonNaam = (o: VeldObject, alle: VeldObject[]) =>
  o.soort === 'keeper'
    ? alle.filter((x) => x.soort === 'keeper').length > 1 && o.nummer
      ? `Keeper ${o.nummer}`
      : 'De keeper'
    : o.soort === 'trainer'
      ? 'De trainer'
      : o.nummer
        ? `Speler ${o.nummer}`
        : o.team === 'J'
          ? 'De joker'
          : 'Deze speler';

const hoogteVan = (l: Lijn, schot: boolean): BalHoogte => {
  if (schot) return l.hoogte === 'hoog' ? 'halfhoog' : l.hoogte === 'halfhoog' ? 'laag' : l.hoogte === 'grond' ? 'grond' : 'laag';
  return l.hoogte ?? 'grond';
};

/** Lijnen → animatie. */
export function lijnenNaarAnimatie(t: Tekening): Omzetting {
  const lijnen = t.lijnen ?? [];
  const meldingen: LijnMelding[] = [];
  const fout = (lijn: number, tekst: string) => meldingen.push({ lijn, tekst, soort: 'fout' });

  // Keepers verdedigen het goal waar ze bij staan (dan kiezen ze vanzelf positie en reageren ze op schoten).
  const goals = t.objecten.filter((o) => o.soort === 'goal' || o.soort === 'klein-goal');
  const objecten: VeldObject[] = t.objecten.map((o) => {
    if (o.soort !== 'keeper' || o.verdedigt) return o;
    let beste: VeldObject | undefined;
    for (const g of goals) if (afstand([g.x, g.y], [o.x, o.y]) < 9 && (!beste || afstand([g.x, g.y], [o.x, o.y]) < afstand([beste.x, beste.y], [o.x, o.y]))) beste = g;
    return beste ? { ...o, verdedigt: beste.id } : o;
  });
  const opId = new Map(objecten.map((o) => [o.id, o]));
  const personen = objecten.filter(isPersoon);
  const keeperVan = (g: VeldObject) => objecten.find((o) => o.soort === 'keeper' && o.verdedigt === g.id);

  // Wat we bijhouden terwijl we de stappen aflopen: waar iedereen staat en wie welke bal heeft.
  const plek = new Map<string, Punt>(personen.map((o) => [o.id, [o.x, o.y]]));
  const houder = new Map<string, string | null>();
  const losPlek = new Map<string, Punt>();
  for (const b of objecten.filter((o) => o.soort === 'bal')) {
    if (b.bij && isPersoon(opId.get(b.bij))) houder.set(b.id, b.bij);
    else {
      houder.set(b.id, null);
      losPlek.set(b.id, [b.x, b.y]);
    }
  }
  const balVan = (id: string) => [...houder.entries()].find(([, h]) => h === id)?.[0];
  const losseBal = (p: Punt) => [...losPlek.entries()].find(([b, q]) => houder.get(b) === null && afstand(p, q) < BIJ)?.[0];
  /** Persoon die op (of vlakbij) dit punt staat. */
  const persoonBij = (p: Punt, plekken: Map<string, Punt> = plek, behalve?: string) => {
    let beste: string | undefined;
    let d = BIJ;
    for (const [id, q] of plekken) {
      if (id === behalve) continue;
      const a = afstand(p, q);
      if (a < d) {
        d = a;
        beste = id;
      }
    }
    return beste;
  };
  const materiaalBij = (p: Punt) => objecten.find((o) => (o.soort === 'rebounder' || o.soort === 'pop' || o.soort === 'bank' || o.soort === 'muurtje') && afstand(p, [o.x, o.y]) < 1.4);

  const nummers = [...new Set(lijnen.map((l) => l.stap ?? 0).filter((n) => n > 0))].sort((a, b) => a - b);
  const stappen: AnimatieStap[] = [];
  const stapLijnen: number[][] = [];
  let eersteSpeler: string | undefined;
  let uitkomen = false;

  for (const nr of nummers) {
    const groep = lijnen.map((l, i) => ({ l, i })).filter((x) => x.l.stap === nr);
    const acties: Actie[] = [];
    const inStap: number[] = [];
    const wacht = Math.max(0, ...groep.map((x) => x.l.wacht ?? 0));
    const nu = new Map(plek); // plekken aan het begin van de stap
    const bewegers = new Set<string>();
    const ontvangt = new Set<string>();
    /** Ontvangers die de bal een stukje tegemoet lopen (mogen hem daarna wel in één keer doorspelen). */
    const tegemoetLopers = new Set<string>();

    // Waar de lijn echt begint: bij de speler waar hij aan vastzit, of bij wie er op dat moment staat.
    const wieBegint = (l: Lijn, pad: Punt[]) => {
      if (l.van && isPersoon(opId.get(l.van))) return l.van;
      return persoonBij(pad[0]!, nu);
    };

    // 1. Lopen en dribbelen.
    for (const { l, i } of groep) {
      if (l.soort === 'bal') continue;
      const pad = lijnPunten(l, (id) => opId.get(id) && [opId.get(id)!.x, opId.get(id)!.y]);
      const wie = wieBegint(l, pad);
      if (!wie) {
        fout(i, l.soort === 'loop' ? 'Deze looplijn begint niet bij een speler' : 'Deze dribbel begint niet bij een speler');
        continue;
      }
      const o = opId.get(wie)!;
      if (bewegers.has(wie)) {
        fout(i, `${persoonNaam(o, objecten)} loopt in deze stap al: geef deze lijn een ander nummer`);
        continue;
      }
      const naar = rond(l.naar && opId.get(l.naar) ? [opId.get(l.naar)!.x, opId.get(l.naar)!.y] : pad[pad.length - 1]!);
      const via = tussenpunten(pad);
      if (l.soort === 'dribbel') {
        const bal = balVan(wie) ?? losseBal(nu.get(wie)!);
        if (!bal) {
          fout(i, `${persoonNaam(o, objecten)} heeft hier geen bal om mee te dribbelen`);
          continue;
        }
        houder.set(bal, wie);
        losPlek.delete(bal);
      }
      const parcours = parcoursManier(objecten, [nu.get(wie)!, ...via, naar]);
      const manier: Manier | undefined = parcours ?? (l.manier as Manier | undefined);
      const a: BeweegActie = { type: l.soort === 'dribbel' ? 'dribbel' : 'loop', wie, naar };
      if (via.length) a.via = via;
      if (manier) a.manier = manier;
      acties.push(a);
      inStap.push(i);
      bewegers.add(wie);
      plek.set(wie, naar);
      eersteSpeler ??= wie;
      // Dribbelen richting een goal met een keeper: die mag uitkomen.
      if (l.soort === 'dribbel' && goals.some((g) => keeperVan(g) && afstand(naar, [g.x, g.y]) < 18)) uitkomen = true;
    }

    // 2. Ballijnen. Eerst wie de bal al heeft, dan wie hem in deze stap krijgt (doorspelen in één keer).
    const ballijnen = groep.filter((x) => x.l.soort === 'bal');
    const gedaan = new Set<number>();
    for (let ronde = 0; ronde < ballijnen.length + 1; ronde++) {
      for (const { l, i } of ballijnen) {
        if (gedaan.has(i)) continue;
        const pad = lijnPunten(l, (id) => opId.get(id) && [opId.get(id)!.x, opId.get(id)!.y]);
        const wie = wieBegint(l, pad);
        if (!wie) {
          gedaan.add(i);
          fout(i, 'Deze ballijn begint niet bij een speler');
          continue;
        }
        const o = opId.get(wie)!;
        let bal = balVan(wie) ?? losseBal(nu.get(wie)!);
        if (!bal) {
          // Misschien krijgt hij hem nog in deze stap (dan in één keer doorspelen): volgende ronde opnieuw proberen.
          if (ronde < ballijnen.length) continue;
          gedaan.add(i);
          fout(i, `${persoonNaam(o, objecten)} heeft de bal niet: eerst moet hij hem krijgen (geef deze lijn een hoger nummer dan de pass naar hem)`);
          continue;
        }
        gedaan.add(i);
        if (bewegers.has(wie)) {
          fout(i, `${persoonNaam(o, objecten)} loopt of dribbelt in deze stap ook: geef de ballijn een hoger nummer`);
          continue;
        }
        const eind = pad[pad.length - 1]!;
        const direct = ontvangt.has(wie) || undefined;
        // Doel: vastgemaakt aan een persoon, iemand die daar (aan het eind van deze stap) staat, een goal, materiaal of een plek.
        let ontvanger = l.naar && isPersoon(opId.get(l.naar)) ? l.naar : persoonBij(eind, plek, wie);
        let goal = goalBij(goals, eind);
        // Een lijn het goal in die aan de keeper vastzit, is toch een schot.
        if (ontvanger && goal && keeperVan(goal)?.id === ontvanger) ontvanger = undefined;
        if (ontvanger) goal = undefined;
        let a: BalActie;
        if (ontvanger) {
          const ont = opId.get(ontvanger)!;
          a = { type: 'pass', van: wie, naar: ontvanger };
          // De ontvanger loopt de bal een stukje tegemoet (als hij in deze stap niet zelf al loopt).
          const p = plek.get(ontvanger)!;
          const van = nu.get(wie)!;
          const d = afstand(p, van);
          if (!bewegers.has(ontvanger) && !tegemoetLopers.has(ontvanger) && ont.soort !== 'keeper' && d > 5) {
            const tegemoet = rond([p[0] + ((van[0] - p[0]) / d) * 0.8, p[1] + ((van[1] - p[1]) / d) * 0.8]);
            acties.unshift({ type: 'loop', wie: ontvanger, naar: tegemoet, start: 0.15, duur: 0.6, spoor: false });
            tegemoetLopers.add(ontvanger);
            plek.set(ontvanger, tegemoet);
          }
          houder.set(bal, ontvanger);
          ontvangt.add(ontvanger);
        } else if (goal && netVan(objecten, goal) && l.afloop !== 'naast') {
          // Doelnet: door een gat het goal in, of terugkaatsen van het net.
          const s = doelnetSchot(goal, eind, l.hoogte, nu.get(wie)!);
          a = { type: 'schot', van: wie, naar: s.naar, eindHoogte: s.eindHoogte, hoogte: s.hoogte };
          if (s.terugNaar) Object.assign(a, { raakt: 'net', terugNaar: s.terugNaar });
          houder.set(bal, null);
          losPlek.set(bal, s.terugNaar ?? s.naar);
        } else if (goal) {
          const keeper = keeperVan(goal);
          const afloop = l.afloop ?? (keeper ? 'vangt' : 'goal');
          a = { type: 'schot', van: wie, naar: schotDoel(goal, eind, afloop) };
          if (keeper) a.afloop = afloop === 'duikt' ? 'vangt' : afloop;
          // Gevangen: de keeper heeft de bal; anders ligt hij los (in het goal of ernaast).
          if (keeper && (afloop === 'vangt' || afloop === 'duikt')) houder.set(bal, keeper.id);
          else {
            houder.set(bal, null);
            losPlek.set(bal, a.naar as Punt);
          }
        } else {
          const muur = materiaalBij(eind);
          if (muur) {
            a = { type: 'pass', van: wie, naar: muur.id, terug: wie };
            houder.set(bal, wie);
          } else {
            a = { type: 'pass', van: wie, naar: rond(eind) };
            houder.set(bal, null);
            losPlek.set(bal, rond(eind));
          }
        }
        const h = hoogteVan(l, a.type === 'schot');
        if ((h !== 'grond' || a.type === 'schot') && a.eindHoogte === undefined) a.hoogte = h;
        if (direct) a.direct = true;
        acties.push(a);
        inStap.push(i);
        eersteSpeler ??= wie;
        void bal;
        bal = undefined;
      }
    }

    if (!acties.length) continue;
    if (wacht > 0) stappen.push({ duur: r2(wacht), acties: [] });
    stappen.push({ acties });
    stapLijnen.push(inStap);
  }

  // Keeper mag uitkomen als er op hem af gedribbeld wordt.
  const objectenUit = uitkomen ? objecten.map((o) => (o.soort === 'keeper' && o.verdedigt ? { ...o, uitkomen: true } : o)) : objecten;

  const basis: Tekening = {
    ...t,
    objecten: objectenUit,
    lijnen: lijnen.filter((l) => !(l.stap ?? 0)),
    animatie: stappen.length ? [{ duur: 0.4, acties: [] }, ...stappen] : undefined,
  };
  delete basis.herhaalRij;
  if (!basis.lijnen!.length) delete basis.lijnen;
  if (!basis.animatie) delete basis.animatie;

  let tekening = basis;
  if (t.herhaalRij && stappen.length) {
    const h = herhaalVoorRij(basis, stappen, eersteSpeler);
    if (typeof h === 'string') meldingen.push({ lijn: -1, tekst: h, soort: 'fout' });
    else tekening = h;
  }
  // Laatste controle: kan de tijdlijn het afspelen? (Zo niet: geen animatie, wel een melding.)
  try {
    maakTijdlijn(tekening);
  } catch (e) {
    meldingen.push({ lijn: -1, tekst: e instanceof TekeningFout ? `Afspelen lukt niet: ${e.message}` : 'Afspelen lukt niet', soort: 'fout' });
    tekening = { ...basis, animatie: undefined };
    delete tekening.animatie;
  }
  return { tekening, meldingen, stapLijnen };
}

/**
 * Herhalen voor de rij: de spelers die (van hetzelfde team, zonder eigen lijnen) achter de eerste speler staan, vormen
 * een rij. Het patroon wordt een herhaling met `@` voor de speler van dat moment; daarna sluit hij achteraan aan.
 * Heeft de eerste speler een bal, dan krijgt elke speler in de rij er ook een.
 */
function herhaalVoorRij(t: Tekening, stappen: AnimatieStap[], eerste: string | undefined): Tekening | string {
  const o = eerste ? t.objecten.find((x) => x.id === eerste) : undefined;
  if (!o || o.soort !== 'speler') return 'Herhalen voor de rij: de eerste lijn moet bij een speler beginnen';
  const gebruikt = new Set<string>();
  for (const s of stappen)
    for (const a of s.acties) {
      if ('wie' in a && a.wie) gebruikt.add(a.wie);
      if ('van' in a && typeof a.van === 'string') gebruikt.add(a.van);
      if ('naar' in a && typeof a.naar === 'string') gebruikt.add(a.naar);
    }
  // De rij: steeds de dichtstbijzijnde speler van hetzelfde team (zonder eigen lijnen) binnen 3 m van de vorige.
  const vrij = t.objecten.filter((x) => x.soort === 'speler' && (x.team ?? 'A') === (o.team ?? 'A') && !gebruikt.has(x.id));
  const rij = [o];
  for (;;) {
    const laatste = rij[rij.length - 1]!;
    const volgende = vrij
      .filter((x) => !rij.includes(x))
      .map((x) => ({ x, d: afstand([x.x, x.y], [laatste.x, laatste.y]) }))
      .filter((v) => v.d < 3)
      .sort((a, b) => a.d - b.d)[0];
    if (!volgende) break;
    rij.push(volgende.x);
  }
  if (rij.length < 2) return 'Herhalen voor de rij: zet de volgende spelers vlak achter de eerste speler (binnen 3 m), zonder eigen lijnen';
  const afstanden = rij.slice(1).map((x, i) => afstand([x.x, x.y], [rij[i]!.x, rij[i]!.y]));
  const tweede = rij[1]!;
  const r: Rij = {
    id: 'rij',
    x: o.x,
    y: o.y,
    richting: Math.round((Math.atan2(tweede.y - o.y, tweede.x - o.x) * 180) / Math.PI),
    afstand: r2(Math.max(1.5, Math.min(3, afstanden.reduce((a, b) => a + b, 0) / afstanden.length))),
    spelers: rij.map((x) => x.id),
  };
  const vervang = (id: string) => (id === o.id ? '@' : id);
  const patroon: AnimatieStap[] = stappen.map((s) => ({
    ...s,
    acties: s.acties.map((a) => {
      const b = { ...a } as Record<string, unknown>;
      for (const k of ['wie', 'van', 'naar', 'terug']) if (typeof b[k] === 'string') b[k] = vervang(b[k] as string);
      return b as unknown as Actie;
    }),
  }));
  patroon.push({ acties: [{ type: 'aansluiten', wie: '@', rij: r.id }] });
  // Ballen: had de eerste speler een bal, dan iedereen in de rij.
  const objecten = [...t.objecten];
  if (objecten.some((b) => b.soort === 'bal' && b.bij === o.id)) {
    for (const x of rij.slice(1)) {
      if (objecten.some((b) => b.soort === 'bal' && b.bij === x.id)) continue;
      objecten.push({ id: `bal-${x.id}`, soort: 'bal', x: x.x, y: x.y, bij: x.id });
    }
  }
  const herhaal: Stap = { herhaal: { spelers: r.spelers, stappen: patroon } };
  return { ...t, objecten, rijen: [...(t.rijen ?? []), r], animatie: [{ duur: 0.4, acties: [] }, herhaal] };
}

// ---------- meldingen bij de lijnen (ook de fysieke check) ----------

/**
 * Meldingen per lijn: wat niet kan (overgeslagen) en wat in het echt niet klopt (fysieke check: bal door een speler of
 * door materiaal, door een ladder lopen). Blokkeert niets.
 */
export function lijnMeldingen(t: Tekening): LijnMelding[] {
  if (!heeftLijnAnimatie(t)) return [];
  const o = lijnenNaarAnimatie({ ...t, herhaalRij: false });
  const uit = [...o.meldingen];
  if (t.herhaalRij) uit.push(...lijnenNaarAnimatie(t).meldingen.filter((m) => m.lijn === -1));
  const stappen = o.tekening.animatie ?? [];
  if (!stappen.length) return dedup(uit);
  let tl: Tijdlijn;
  try {
    tl = maakTijdlijn(o.tekening);
  } catch {
    return dedup(uit);
  }
  // Tijdvak per animatiestap (de eerste stap is de korte pauze; wachtstappen hebben geen lijnen).
  const eindes: number[] = [];
  for (let k = 1; k <= stappen.length; k++) {
    try {
      eindes.push(maakTijdlijn({ ...o.tekening, animatie: stappen.slice(0, k) }).duur);
    } catch {
      eindes.push(Infinity);
    }
  }
  const lijnStappen = stappen.map(() => [] as number[]);
  let j = 0;
  stappen.forEach((s, k) => {
    if ('acties' in s && s.acties.length) lijnStappen[k] = o.stapLijnen[j++] ?? [];
  });
  const lijnen = t.lijnen ?? [];
  for (const m of fysiekeMeldingen(o.tekening, tl)) {
    const k = eindes.findIndex((e) => m.t <= e + 0.05);
    // Zoek terug naar de laatste stap met lijnen (een bal die nog rolt na de stap).
    let kk = k;
    while (kk > 0 && !lijnStappen[kk]?.length) kk--;
    const kandidaten = lijnStappen[kk] ?? [];
    if (!kandidaten.length) continue;
    const ballijn = /bal/i.test(m.tekst.slice(0, 4));
    const wieVan = (i: number) => {
      const l = lijnen[i]!;
      return l.van ?? '';
    };
    const passend = kandidaten.filter((i) => (ballijn ? lijnen[i]!.soort === 'bal' : lijnen[i]!.soort !== 'bal'));
    const opWie = passend.find((i) => m.wie && wieVan(i) === m.wie) ?? passend[0] ?? kandidaten[0]!;
    uit.push({ lijn: opWie, tekst: m.uitleg, soort: 'let op' });
  }
  return dedup(uit);
}

function dedup(l: LijnMelding[]): LijnMelding[] {
  const gezien = new Set<string>();
  return l.filter((m) => {
    const k = `${m.lijn}|${m.tekst}`;
    if (gezien.has(k)) return false;
    gezien.add(k);
    return true;
  });
}

// ---------- afspelen ----------

const cache = new WeakMap<Tekening, Tekening>();

/**
 * De tekening zoals hij afgespeeld wordt: met lijnen met stapnummers omgezet naar animatiestappen. Ingebouwde
 * oefeningen en tekeningen zonder genummerde lijnen blijven zoals ze zijn. Overal gebruikt waar een oefening speelt
 * (bibliotheek, Training maken, trainingsmodus, gedeelde link, editor).
 */
export function afspeelTekening(t: Tekening): Tekening {
  if (!heeftLijnAnimatie(t)) return t;
  let uit = cache.get(t);
  if (!uit) {
    uit = lijnenNaarAnimatie(t).tekening;
    cache.set(t, uit);
  }
  return uit;
}

// ---------- kopie van een ingebouwde oefening: animatie → lijnen ----------

const LOOP_VELDEN = new Set(['type', 'wie', 'naar', 'via', 'manier', 'start', 'duur', 'spoor', 'kijk']);
const BAL_VELDEN = new Set(['type', 'van', 'naar', 'hoogte', 'hoog', 'afloop', 'direct', 'snelheid', 'start', 'duur', 'terug', 'eindHoogte', 'bal']);

/**
 * Een bestaande animatie (kopie van een ingebouwde oefening) omzetten naar lijnen met stapnummers, zodat je hem in de
 * editor kunt aanpassen. Lukt alleen bij gewone stappen met lopen, dribbelen, passen en schieten (geen rijen, herhalingen
 * of keeperacties zoals duiken naar een punt). Geeft de nieuwe tekening, of de reden waarom het niet kan.
 */
export function animatieNaarLijnen(t: Tekening): { tekening: Tekening } | { reden: string } {
  const stappen = t.animatie ?? [];
  if (!stappen.length) return { reden: 'Er is geen animatie' };
  if (t.rijen?.length) return { reden: 'De spelers staan in een rij' };
  for (const s of stappen) {
    if (!('acties' in s)) return { reden: 'De animatie herhaalt stappen of speelt reeksen tegelijk af' };
    for (const a of s.acties) {
      if (a.type === 'loop' || a.type === 'dribbel') {
        if (Object.keys(a).some((k) => !LOOP_VELDEN.has(k))) return { reden: 'Er zit een bijzondere beweging in (bv. om een pion draaien)' };
      } else if (a.type === 'pass' || a.type === 'schot') {
        if (Object.keys(a).some((k) => !BAL_VELDEN.has(k))) return { reden: 'Er zit een bijzondere bal- of keeperactie in (bv. duiken, uitkomen, blokken)' };
        if (a.afloop && a.afloop !== 'goal' && a.afloop !== 'vangt' && a.afloop !== 'naast') return { reden: 'De keeper stompt of tipt de bal' };
        if (a.terug !== undefined && (a.terug !== a.van || typeof a.naar !== 'string')) return { reden: 'Er kaatst een bal naar iemand anders' };
      } else return { reden: `Er zit een actie in die je nog niet kunt tekenen (${a.type})` };
    }
  }
  let tl: Tijdlijn;
  try {
    tl = maakTijdlijn(t);
  } catch {
    return { reden: 'De animatie kan niet worden afgespeeld' };
  }
  void tl;
  // Begintijd van elke stap (voor de plekken van de spelers op dat moment).
  const begin = (k: number) => (k === 0 ? 0 : maakTijdlijn({ ...t, animatie: stappen.slice(0, k) }).duur);
  const standBij = (k: number) => standOp(maakTijdlijn(t), begin(k));
  const opId = new Map(t.objecten.map((o) => [o.id, o]));
  const lijnen: Lijn[] = [...(t.lijnen ?? []).filter((l) => !(l.stap ?? 0))];
  const vast = (id: string, p: Punt) => {
    const o = opId.get(id);
    return !!o && afstand([o.x, o.y], p) < 0.3;
  };
  let nr = 0;
  let wacht = 0;
  stappen.forEach((s, k) => {
    const st = s as AnimatieStap;
    if (!st.acties.length) {
      // Pauze: wachttijd voor de volgende stap (de korte pauze aan het begin niet).
      if (k > 0) wacht += st.duur ?? 0;
      return;
    }
    nr++;
    const nu = standBij(k);
    const na = standBij(k + 1 < stappen.length ? k + 1 : k);
    const eindStand = k + 1 < stappen.length ? na : standOp(maakTijdlijn(t), maakTijdlijn(t).duur);
    const plekNu = (id: string): Punt => {
      const o = nu.objecten.get(id)!;
      return rond([o.x, o.y]);
    };
    const plekNa = (id: string): Punt => {
      const o = eindStand.objecten.get(id)!;
      return rond([o.x, o.y]);
    };
    for (const a of st.acties) {
      const l: Lijn = { soort: 'loop', punten: [], stap: nr };
      if (a.type === 'loop' || a.type === 'dribbel') {
        const p0 = plekNu(a.wie);
        l.soort = a.type === 'dribbel' ? 'dribbel' : 'loop';
        l.punten = [p0, ...(a.via ?? []).map(rond), rond(a.naar)];
        if (vast(a.wie, p0)) l.van = a.wie;
        if (a.manier === 'sprint' || a.manier === 'zijwaarts' || a.manier === 'achteruit') l.manier = a.manier;
      } else if (a.type === 'pass' || a.type === 'schot') {
        const p0 = plekNu(a.van);
        l.soort = 'bal';
        let eind: Punt;
        if (typeof a.naar === 'string') {
          const o = opId.get(a.naar)!;
          const mens = PERSONEN.includes(o.soort);
          eind = mens ? plekNa(a.naar) : rond([o.x, o.y]);
          if (mens && vast(a.naar, eind)) l.naar = a.naar;
        } else eind = rond(a.naar);
        l.punten = [p0, eind];
        if (vast(a.van, p0)) l.van = a.van;
        const h = a.hoogte ?? (a.hoog ? 'hoog' : undefined);
        if (a.type === 'schot') {
          if (h === 'grond') l.hoogte = 'grond';
          else if (h === 'halfhoog' || h === 'hoog') l.hoogte = 'hoog';
          if (a.afloop) l.afloop = a.afloop as Lijn['afloop'];
        } else if (h === 'halfhoog' || h === 'hoog') l.hoogte = h;
        else if (typeof h === 'number') l.hoogte = h > 2 ? 'hoog' : 'halfhoog';
      }
      if (wacht > 0) l.wacht = r2(wacht);
      lijnen.push(l);
    }
    wacht = 0;
  });
  const uit: Tekening = { ...t, lijnen };
  delete uit.animatie;
  // Controle: speelt het weer af zonder fouten?
  const terug = lijnenNaarAnimatie(uit);
  if (terug.meldingen.some((m) => m.soort === 'fout')) return { reden: terug.meldingen.find((m) => m.soort === 'fout')!.tekst };
  return { tekening: uit };
}

// ---------- hulp voor de editor ----------

/** Plek van het stapnummer: op 30% van de lijn (het buigpunt-handvat zit in het midden). */
export function stapPunt(l: Lijn, plek?: (id: string) => Punt | undefined): Punt {
  const p = lijnPunten(l, plek);
  const lengtes = [0];
  for (let i = 1; i < p.length; i++) lengtes.push(lengtes[i - 1]! + afstand(p[i - 1]!, p[i]!));
  const doel = lengtes[lengtes.length - 1]! * 0.3;
  for (let i = 1; i < p.length; i++) {
    if (lengtes[i]! >= doel) {
      const u = (doel - lengtes[i - 1]!) / Math.max(1e-6, lengtes[i]! - lengtes[i - 1]!);
      return [p[i - 1]![0] + (p[i]![0] - p[i - 1]![0]) * u, p[i - 1]![1] + (p[i]![1] - p[i - 1]![1]) * u];
    }
  }
  return p[0]!;
}

/** Is deze ballijn een schot (eindigt hij in of vlak voor een goal)? Dan kun je de afloop kiezen. */
export function isSchotLijn(t: Tekening, l: Lijn): boolean {
  if (l.soort !== 'bal') return false;
  const goals = t.objecten.filter((o) => o.soort === 'goal' || o.soort === 'klein-goal');
  const p = lijnPunten(l, (id) => {
    const o = t.objecten.find((x) => x.id === id);
    return o && [o.x, o.y];
  });
  const naar = l.naar ? t.objecten.find((o) => o.id === l.naar) : undefined;
  if (naar && naar.soort !== 'keeper') return false;
  return !!goalBij(goals, p[p.length - 1]!);
}

/** Schot op een goal met een doelnet: gaat de bal door een gat of kaatst hij terug? (null = geen doelnet) */
export function doelnetUitkomst(t: Tekening, l: Lijn): 'gat' | 'net' | null {
  if (!isSchotLijn(t, l)) return null;
  const goals = t.objecten.filter((o) => o.soort === 'goal' || o.soort === 'klein-goal');
  const p = lijnPunten(l, (id) => {
    const o = t.objecten.find((x) => x.id === id);
    return o && [o.x, o.y];
  });
  const g = goalBij(goals, p[p.length - 1]!);
  if (!g || !netVan(t.objecten, g) || l.afloop === 'naast') return null;
  return doelnetSchot(g, p[p.length - 1]!, l.hoogte, p[0]!).terugNaar ? 'net' : 'gat';
}

/** Staat er een keeper bij een goal (dan reageert hij op schoten)? */
export function heeftKeeperBijGoal(t: Tekening): boolean {
  const goals = t.objecten.filter((o) => o.soort === 'goal' || o.soort === 'klein-goal');
  return t.objecten.some((k) => k.soort === 'keeper' && (k.verdedigt || goals.some((g) => afstand([g.x, g.y], [k.x, k.y]) < 9)));
}

/**
 * Begintekening voor de editor. Een kopie met animatie wordt (als het kan) lijnen met stapnummers. Lijnen uit een eerdere
 * versie zonder nummers krijgen nummers op volgorde. Met een korte uitleg voor in beeld.
 */
export function editorBegin(t: Tekening): { tekening: Tekening; melding?: string } {
  if (t.animatie?.length) {
    const r = animatieNaarLijnen(t);
    if ('tekening' in r) return { tekening: r.tekening, melding: 'De animatie is omgezet naar lijnen met stapnummers. Tik op een lijn om hem aan te passen.' };
    return { tekening: t, melding: `Deze animatie kan niet worden omgezet naar lijnen (${r.reden.charAt(0).toLowerCase()}${r.reden.slice(1)}). Verschuif je iets, dan vervalt de animatie.` };
  }
  const l = t.lijnen ?? [];
  if (l.length && !l.some((x) => x.stap)) return { tekening: { ...t, lijnen: l.map((x, i) => ({ ...x, stap: i + 1 })) } };
  return { tekening: t };
}
