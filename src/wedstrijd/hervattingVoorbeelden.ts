import type { Punt, Tekening } from '../model/types';
import { Opzet, type Tactiek, type TactiekVersie } from './tactieken';
import { t } from '../i18n/t';

/**
 * Voorbeeldhervattingen (0.29.0): ingestudeerde spelhervattingen, opgezet zoals de voorbeeldtactieken (zelfde
 * voorbeeldscherm, uitleg, 11/8-keuze, eigen bord). Op een half veld met het goal bovenaan; de aftrap op een heel veld.
 * Aanvallend: rood (A) valt het goal aan, blauw (B) verdedigt met keeper. Verdedigend: rood verdedigt met keeper (k1).
 * Rugnummers per positie zoals bij de tactieken (2 rechtsback … 11 linksbuiten); rood kijkt naar boven.
 */

export const HERVATTING_GROEPEN: { id: string; naam: string }[] = [
  { id: 'corners', naam: t('Corners') },
  { id: 'vrije-trappen', naam: t('Vrije trappen') },
  { id: 'inworp-aftrap', naam: t('Inworp en aftrap') },
  { id: 'verdedigen', naam: t('Verdedigen bij standaardsituaties') },
];

const elf = (maak: () => Tekening, muur?: string[]): TactiekVersie => ({ id: '11v11', naam: t('11 tegen 11'), vorm: '11v11', maak, ...(muur ? { muur } : {}) });
const acht = (maak: () => Tekening, muur?: string[]): TactiekVersie => ({ id: '8v8', naam: t('8 tegen 8'), vorm: '8v8', maak, ...(muur ? { muur } : {}) });

/** Muur van `n` spelers op 9,15 m van de bal, op de lijn naar `naar` (meestal de korte paal), iets naar buiten geschoven. */
function muurPlekken(bal: Punt, naar: Punt, n: number, buiten = 0.6, midden = 34): Punt[] {
  const d = Math.hypot(naar[0] - bal[0], naar[1] - bal[1]);
  const u: Punt = [(naar[0] - bal[0]) / d, (naar[1] - bal[1]) / d];
  let p: Punt = [-u[1], u[0]];
  // "Buiten" = weg van het midden van het goal (de muur steekt net buiten de lijn naar de paal uit).
  if (p[0] < 0 !== naar[0] < midden) p = [-p[0], -p[1]];
  const m: Punt = [bal[0] + u[0] * 9.15 + p[0] * buiten, bal[1] + u[1] * 9.15 + p[1] * buiten];
  return Array.from({ length: n }, (_, i) => {
    const o = (i - (n - 1) / 2) * 0.8;
    return [Math.round((m[0] + p[0] * o) * 100) / 100, Math.round((m[1] + p[1] * o) * 100) / 100];
  });
}

// ---------- corners (11 tegen 11: half veld 68 × 52,5; corner vanaf de linker hoekvlag) ----------

/** Wie er bij elke corner achterblijft: rood 6, 5 en 2; blauw 9 voor de counter. */
function achterhoede(o: Opzet) {
  return o.rood(6, 34, 30).rood(5, 16, 42).rood(2, 52, 42).blauw(9, 32, 36);
}

function cornerEerstePaal(): Tekening {
  const o = achterhoede(new Opzet('11v11', 'half'))
    .rood(11, 0.9, 0.9, 30)
    .rood(9, 30.5, 10.5)
    .rood(4, 35.5, 12.5)
    .rood(3, 41.5, 10.5)
    .rood(10, 24, 15)
    .rood(8, 33, 20)
    .rood(7, 46, 17)
    .blauw(1, 34, 1.2)
    .blauw(7, 29.4, 2.2)
    .blauw(4, 28.2, 6.4)
    .blauw(3, 33, 6.4)
    .blauw(6, 37.8, 6.4)
    .blauw(8, 32.4, 9.2)
    .blauw(2, 36.6, 10.6)
    .blauw(5, 43.4, 9.0)
    .blauw(10, 28, 19.5)
    .blauw(11, 6, 6.5)
    .bal('a11');
  // 1. De spits loopt naar de eerste paal, de verre centrale verdediger trekt zijn man mee naar achteren.
  o.loop('a9', [30.6, 4.0], 1, { sprint: true });
  // 2. Hoge corner op de eerste paal, kopbal in de verre hoek.
  o.pass('a11', 'a9', 2, { hoog: true }).pass('a9', [36, -0.3], 2, { goal: true });
  return o.klaar();
}

function korteCorner(): Tekening {
  const o = achterhoede(new Opzet('11v11', 'half'))
    .rood(11, 0.9, 0.9, 30)
    .rood(10, 6, 5, 160)
    .rood(9, 30.5, 10.5)
    .rood(4, 35.5, 12.5)
    .rood(3, 40, 16)
    .rood(8, 28, 21)
    .rood(7, 48, 18)
    .blauw(1, 34, 1.2)
    .blauw(7, 29.4, 2.2)
    .blauw(4, 28.2, 6.4)
    .blauw(3, 33, 6.4)
    .blauw(6, 37.8, 6.4)
    .blauw(8, 32.4, 9.2)
    .blauw(2, 37.8, 12.6)
    .blauw(5, 44, 13)
    .blauw(10, 24, 18)
    .blauw(11, 9, 9)
    .bal('a11');
  // 1. Kort op de 10, 2. die naar binnen dribbelt; 3. voorzet op de inlopende centrale verdediger.
  o.pass('a11', 'a10', 1);
  o.dribbel('a10', [14.5, 9], 2, { via: [[9, 4.4]] }).loop('a3', [35.4, 7.8], 2, { via: [[39.4, 11.6]], sprint: true });
  o.pass('a10', 'a3', 3, { hoog: true }).pass('a3', [36.6, -0.3], 3, { goal: true });
  return o.klaar();
}

function tweedePaal11(): Tekening {
  const o = achterhoede(new Opzet('11v11', 'half'))
    .rood(11, 0.9, 0.9, 30)
    .rood(9, 30.5, 10.5)
    .rood(4, 35.5, 12.5)
    .rood(3, 26, 12)
    .rood(10, 21, 16)
    .rood(8, 33, 20.5)
    .rood(7, 44, 19)
    .blauw(1, 34, 1.2)
    .blauw(7, 29.4, 2.2)
    .blauw(4, 28.2, 6.4)
    .blauw(3, 33, 6.4)
    .blauw(6, 37.8, 6.4)
    .blauw(8, 32.4, 9.2)
    .blauw(2, 36.6, 10.6)
    .blauw(5, 26.4, 9.8)
    .blauw(10, 27, 20)
    .blauw(11, 6, 6.5)
    .bal('a11');
  // 1. De spits trekt naar de eerste paal; de loper start vanaf de rand van de zestien.
  o.loop('a9', [30.6, 4.0], 1, { sprint: true }).loop('a7', [41.6, 9.6], 1, { sprint: true });
  // 2. Hoge bal naar de tweede paal, de loper kopt in.
  o.loop('a7', [39.6, 4.2], 2, { sprint: true }).pass('a11', 'a7', 2, { hoog: true });
  o.pass('a7', [36.6, -0.3], 3, { goal: true });
  return o.klaar();
}

function tweedePaal8(): Tekening {
  const o = new Opzet('8v8', 'half')
    .rood(11, 0.9, 0.9, 30)
    .rood(9, 19.6, 7.2)
    .rood(3, 24.6, 8)
    .rood(6, 15.6, 9.6)
    .rood(7, 28.5, 12)
    .rood(5, 10, 24)
    .rood(2, 32, 24)
    .blauw(1, 21.25, 1)
    .blauw(7, 17.2, 1.8)
    .blauw(3, 21.4, 4.4)
    .blauw(2, 18.6, 5.6)
    .blauw(5, 25.6, 6.2)
    .blauw(6, 15.2, 7.4)
    .blauw(11, 7, 5.5)
    .blauw(9, 20, 20)
    .bal('a11');
  o.loop('a7', [27.6, 6.4], 1, { sprint: true });
  o.loop('a7', [25.4, 3.0], 2, { sprint: true }).pass('a11', 'a7', 2, { hoog: true });
  o.pass('a7', [22.6, -0.3], 3, { goal: true });
  return o.klaar();
}

function doorkoppen(): Tekening {
  const o = achterhoede(new Opzet('11v11', 'half'))
    .rood(11, 0.9, 0.9, 30)
    .rood(4, 32, 13.5)
    .rood(3, 42, 11)
    .rood(9, 36, 10)
    .rood(10, 25.5, 12.5)
    .rood(8, 31, 21)
    .rood(7, 47, 16)
    .blauw(1, 34, 1.2)
    .blauw(7, 29.4, 2.2)
    .blauw(4, 27.8, 6.2)
    .blauw(3, 33, 6.2)
    .blauw(6, 37.5, 6.2)
    .blauw(2, 35.4, 8.2)
    .blauw(8, 33.8, 11.6)
    .blauw(5, 43.4, 9.2)
    .blauw(10, 27, 19)
    .blauw(11, 6, 6.5)
    .bal('a11');
  // 1. Naar de eerste paal (doorkopper) en de tweede paal (afmaker).
  o.loop('a4', [30.2, 4.4], 1, { via: [[29.4, 9]], sprint: true }).loop('a3', [38.6, 4.2], 1, { sprint: true });
  // 2. Corner op de eerste paal, doorkoppen naar de tweede paal, binnenkoppen.
  o.pass('a11', 'a4', 2, { hoog: true }).pass('a4', 'a3', 2, { hoog: true }).pass('a3', [36.2, -0.3], 2, { goal: true });
  return o.klaar();
}

function rugzak(): Tekening {
  const o = achterhoede(new Opzet('11v11', 'half'))
    .rood(11, 0.9, 0.9, 30)
    .rood(9, 34.4, 14.0)
    .rood(4, 34.4, 16.2)
    .rood(3, 34.4, 18.4)
    .rood(10, 22, 18)
    .rood(8, 43, 21)
    .rood(7, 48, 15)
    .blauw(1, 34, 1.2)
    .blauw(7, 29.4, 2.2)
    .blauw(4, 27.5, 6.2)
    .blauw(3, 33.6, 6.2)
    .blauw(6, 38.4, 6.2)
    .blauw(2, 29, 11.2)
    .blauw(8, 42, 12.4)
    .blauw(5, 45.4, 13.6)
    .blauw(10, 27, 20.5)
    .blauw(11, 6, 6.5)
    .bal('a11');
  // 1. Op het moment van de trap uit elkaar: eerste paal, penaltystip, tweede paal.
  o.loop('a9', [30.6, 4.0], 1, { via: [[32, 12.8]], sprint: true }).loop('a4', [35.6, 10.6], 1, { sprint: true }).loop('a3', [40.4, 4.0], 1, { via: [[40.2, 10]], sprint: true });
  // 2. De bal naar de vrije loper bij de penaltystip.
  o.pass('a11', 'a4', 2, { hoog: true }).pass('a4', [37, -0.3], 2, { goal: true });
  return o.klaar();
}

function randZestien11(): Tekening {
  const o = achterhoede(new Opzet('11v11', 'half'))
    .rood(11, 0.9, 0.9, 30)
    .rood(9, 30, 10.2)
    .rood(4, 35, 11.5)
    .rood(3, 40.5, 10.5)
    .rood(8, 24, 19, -40)
    .rood(10, 20, 26)
    .rood(7, 47, 17)
    .blauw(1, 34, 1.2)
    .blauw(7, 29.4, 2.2)
    .blauw(4, 28, 6.2)
    .blauw(3, 33.8, 6.4)
    .blauw(6, 38.2, 6.2)
    .blauw(8, 32, 8.6)
    .blauw(2, 37.2, 10.6)
    .blauw(5, 42.6, 9.4)
    .blauw(10, 28, 22)
    .blauw(11, 6, 8)
    .bal('a11');
  // 1. De aanvallers lopen het doel in en nemen hun man mee.
  o.loop('a9', [30.2, 4.6], 1, { sprint: true })
    .loop('b8', [32, 3.6], 1)
    .loop('a4', [35.6, 4.6], 1, { sprint: true })
    .loop('b2', [36.8, 7.4], 1)
    .loop('a3', [40.2, 4.4], 1, { sprint: true });
  // 2. Lage bal terug naar de rand van de zestien, direct schieten.
  o.pass('a11', 'a8', 2).pass('a8', [36.8, -0.3], 2, { hoog: true, goal: true });
  return o.klaar();
}

function randZestien8(): Tekening {
  const o = new Opzet('8v8', 'half')
    .rood(11, 0.9, 0.9, 30)
    .rood(9, 19.4, 6.8)
    .rood(3, 23.4, 7.6)
    .rood(6, 13.5, 13.5, -45)
    .rood(7, 28, 10)
    .rood(5, 10, 24)
    .rood(2, 32, 24)
    .blauw(1, 21.25, 1)
    .blauw(7, 17.2, 1.8)
    .blauw(3, 21.6, 4.2)
    .blauw(2, 17.4, 5.6)
    .blauw(5, 25.4, 6.2)
    .blauw(6, 26.6, 8.6)
    .blauw(11, 6, 7.5)
    .blauw(9, 20, 20)
    .bal('a11');
  o.loop('a9', [18.6, 2.8], 1, { sprint: true }).loop('b2', [16.8, 3.8], 1).loop('a3', [23.4, 3.2], 1, { sprint: true });
  o.pass('a11', 'a6', 2).pass('a6', [22.6, -0.3], 2, { hoog: true, goal: true });
  return o.klaar();
}

function afschermen(): Tekening {
  const o = achterhoede(new Opzet('11v11', 'half'))
    .rood(11, 0.9, 0.9, 30)
    .rood(9, 32.4, 3.0, -150)
    .rood(4, 37, 12)
    .rood(3, 42, 10.5)
    .rood(10, 27, 12)
    .rood(8, 34, 20)
    .rood(7, 47, 16)
    .blauw(1, 34, 1.2)
    .blauw(7, 29.4, 2.2)
    .blauw(4, 28, 6.4)
    .blauw(3, 33.2, 6.8)
    .blauw(6, 38.4, 6.2)
    .blauw(2, 38.6, 10.2)
    .blauw(5, 43.2, 8.6)
    .blauw(8, 28, 9.8)
    .blauw(10, 29, 19)
    .blauw(11, 6, 6.5)
    .bal('a11');
  // 1. De spits blijft voor de keeper staan; de loper komt naar de korte kant van het doelgebied.
  o.loop('a4', [34.6, 4.8], 1, { sprint: true });
  // 2. De bal gaat net over de afschermer heen, de loper kopt in.
  o.pass('a11', 'a4', 2, { hoog: true }).pass('a4', [35.8, -0.3], 2, { goal: true });
  return o.klaar();
}

// ---------- vrije trappen ----------

/** Rood en blauw rond een centrale vrije trap (bal op 22 m): lopers bij de zestien en wie achterblijft. */
function vrijeTrapRest(o: Opzet, metSpits = true) {
  if (metSpits) o.rood(9, 40, 12);
  return o
    .rood(4, 44.5, 16)
    .rood(3, 26, 12.5)
    .rood(7, 51, 21)
    .rood(11, 18, 21)
    .rood(6, 34, 34)
    .rood(2, 56, 42)
    .rood(5, 12, 42)
    .blauw(4, 39.4, 9.6)
    .blauw(5, 44.6, 13.4)
    .blauw(2, 26.6, 10)
    .blauw(3, 30, 6.8)
    .blauw(11, 49.4, 19.2)
    .blauw(9, 34, 39);
}

const MUUR_22 = muurPlekken([34, 22], [30.34, 0], 4);

function overstapje(): Tekening {
  const o = new Opzet('11v11', 'half').rood(10, 32.3, 23.6, -60).rood(8, 34.6, 26.2);
  vrijeTrapRest(o).blauw(1, 34, 1.2);
  MUUR_22.forEach((p, i) => o.blauw([6, 8, 10, 7][i]!, p[0], p[1], 95));
  o.balOp(34, 22);
  // 1. De eerste speler loopt over de bal heen; 2. de tweede neemt aanloop en schiet direct.
  o.loop('a10', [36.6, 20.2], 1, { via: [[34, 22]] });
  o.loop('a8', [34.2, 22.8], 2, { sprint: true });
  o.pass('a8', [37.2, -0.3], 3, { goal: true });
  return o.klaar();
}

function spelerInMuur(): Tekening {
  const o = new Opzet('11v11', 'half').rood(10, 34.2, 22.8, -90).rood(8, 31, 24.5);
  vrijeTrapRest(o, false).blauw(1, 34, 1.2);
  // De muur staat iets verder naar buiten; de eigen speler sluit hem aan de binnenkant af.
  const muur = muurPlekken([34, 22], [30.34, 0], 4, 1.2);
  muur.forEach((p, i) => o.blauw([6, 8, 10, 7][i]!, p[0], p[1], 95));
  const binnen: Punt = [2 * muur[0]![0] - muur[1]![0], 2 * muur[0]![1] - muur[1]![1]];
  o.rood(9, binnen[0], binnen[1], 90);
  o.balOp(34, 22);
  // 1. Op het moment van het schot stapt de eigen speler weg: 2. door het gat naar de korte hoek.
  o.loop('a9', [36.4, 13.4], 1, { sprint: true });
  o.pass('a10', [32.4, -0.3], 2, { goal: true });
  return o.klaar();
}

const MUUR_BREED = muurPlekken([30, 23], [30.34, 0], 4);

function breedLeggen11(): Tekening {
  const o = new Opzet('11v11', 'half')
    .rood(10, 30, 23.6, -90)
    .rood(8, 34.6, 22.6, -100)
    .rood(9, 40, 12)
    .rood(4, 45, 16)
    .rood(3, 24.5, 12)
    .rood(7, 51, 21)
    .rood(11, 17, 22)
    .rood(6, 34, 34)
    .rood(2, 56, 42)
    .rood(5, 12, 42)
    .blauw(1, 34, 1.2)
    .blauw(4, 39.4, 9.6)
    .blauw(5, 45.6, 13.4)
    .blauw(2, 25.2, 9.8)
    .blauw(3, 29.8, 6.6)
    .blauw(11, 49.4, 19.2)
    .blauw(9, 34, 39);
  MUUR_BREED.forEach((p, i) => o.blauw([6, 8, 10, 7][i]!, p[0], p[1], 90));
  o.bal('a10');
  // De nemer tikt de bal breed naast de muur, de medespeler schiet in één keer.
  o.pass('a10', 'a8', 1).pass('a8', [37.2, -0.3], 1, { goal: true });
  return o.klaar();
}

const MUUR_BREED8 = muurPlekken([18, 15.5], [18.75, 0], 3, 0.6, 21.25);

function breedLeggen8(): Tekening {
  const o = new Opzet('8v8', 'half')
    .rood(10, 17.8, 16.4, -90)
    .rood(8, 22.4, 15.2, -100)
    .rood(9, 13, 6)
    .rood(3, 27, 8)
    .rood(6, 11, 14)
    .rood(5, 10, 24)
    .rood(2, 32, 24)
    .blauw(1, 21.25, 1.5)
    .blauw(2, 13.4, 3.4)
    .blauw(5, 27.4, 5.4)
    .blauw(3, 23.6, 5.4)
    .blauw(9, 20, 25);
  MUUR_BREED8.forEach((p, i) => o.blauw([7, 6, 11][i]!, p[0], p[1], 90));
  o.bal('a10');
  o.pass('a10', 'a8', 1).pass('a8', [23.2, -0.3], 1, { goal: true });
  return o.klaar();
}

function vanDeZijkant(): Tekening {
  const bal: Punt = [8, 18];
  const muur = muurPlekken(bal, [34, 0], 2, 0);
  const o = new Opzet('11v11', 'half')
    .rood(11, 7.4, 18.8, -40)
    .rood(4, 32, 15)
    .rood(3, 40, 13)
    .rood(9, 35, 11.4)
    .rood(8, 30, 21.5)
    .rood(10, 22, 24)
    .rood(7, 48, 18)
    .rood(6, 34, 32)
    .rood(2, 54, 42)
    .rood(5, 16, 40)
    .blauw(1, 34, 1.2)
    .blauw(4, 28.4, 6.6)
    .blauw(3, 33, 6.6)
    .blauw(6, 37.2, 7.4)
    .blauw(2, 34, 13.4)
    .blauw(8, 37, 9.8)
    .blauw(5, 41.8, 11.6)
    .blauw(10, 27.5, 19.6)
    .blauw(9, 34, 38);
  muur.forEach((p, i) => o.blauw([7, 11][i]!, p[0], p[1], 150));
  o.balOp(bal[0], bal[1]);
  // 1. Lopers naar de eerste en tweede paal, een speler blijft op de rand voor de tweede bal.
  o.loop('a4', [30.4, 5.6], 1, { sprint: true }).loop('a9', [34.6, 7.6], 1, { sprint: true }).loop('a3', [39.4, 5.4], 1, { sprint: true }).loop('a8', [28.6, 18], 1);
  // 2. Voorzet op de tweede paal, kopbal.
  o.pass('a11', 'a3', 2, { hoog: true }).pass('a3', [35.8, -0.3], 2, { goal: true });
  return o.klaar();
}

function snelNemen11(): Tekening {
  const o = new Opzet('11v11', 'half')
    .rood(8, 40.6, 40.8, -110)
    .rood(9, 33, 24)
    .rood(7, 54, 26)
    .rood(11, 12, 26)
    .rood(10, 26, 33)
    .rood(6, 34, 44)
    .rood(4, 26, 50)
    .rood(3, 42, 50)
    .rood(2, 58, 44)
    .rood(5, 8, 44)
    .blauw(1, 34, 1.2)
    .blauw(2, 14, 20)
    .blauw(3, 27, 19)
    .blauw(4, 39, 19)
    .blauw(5, 54, 20)
    .blauw(6, 43, 33)
    .blauw(8, 30, 30)
    .blauw(10, 46, 30)
    .blauw(7, 18, 34)
    .blauw(11, 50, 38)
    .blauw(9, 30, 46);
  o.balOp(40, 40);
  // 1. De tegenstander stelt zich nog op; de nemer speelt meteen diep, de spits loopt in de rug van de verdediging.
  o.loop('b6', [42.6, 36.8], 1).loop('b8', [33, 31], 1).loop('a9', [34, 8], 1, { sprint: true }).pass('a8', 'a9', 1);
  o.pass('a9', [31.5, -0.3], 2, { goal: true });
  return o.klaar();
}

function snelNemen8(): Tekening {
  const o = new Opzet('8v8', 'half')
    .rood(8, 24.6, 24.8, -110)
    .rood(9, 17, 15)
    .rood(7, 33, 17)
    .rood(11, 9, 18)
    .rood(6, 15, 26)
    .rood(3, 21, 30.5)
    .rood(2, 31, 28)
    .blauw(1, 21.25, 1)
    .blauw(2, 9, 12)
    .blauw(3, 22.5, 11)
    .blauw(5, 34, 12)
    .blauw(7, 14, 22)
    .blauw(6, 25, 19)
    .blauw(11, 30, 22)
    .blauw(9, 25, 30.5);
  o.balOp(24, 24);
  o.loop('b6', [24.6, 20.4], 1).loop('b7', [16, 21], 1).loop('a9', [18.6, 4.4], 1, { sprint: true }).pass('a8', 'a9', 1);
  o.pass('a9', [22.6, -0.3], 2, { goal: true });
  return o.klaar();
}

const VRIJE_TRAP_KAATS = muurPlekken([30, 25], [34, 0], 4);

function vrijeTrapKaats(): Tekening {
  const o = new Opzet('11v11', 'half')
    .rood(10, 30, 25, -100)
    .rood(8, 26.5, 20.5, 45)
    .rood(9, 40, 12)
    .rood(3, 24, 10)
    .rood(4, 45, 15)
    .rood(7, 52, 22)
    .rood(11, 16, 20)
    .rood(6, 34, 35)
    .rood(2, 56, 42)
    .rood(5, 12, 42)
    .blauw(1, 34, 1.2)
    .blauw(4, 39, 10.2)
    .blauw(2, 23.4, 7.8)
    .blauw(5, 46, 13)
    .blauw(11, 50.6, 20.4)
    .blauw(3, 35, 9)
    .blauw(9, 34, 41);
  VRIJE_TRAP_KAATS.forEach((p, i) => o.blauw([6, 8, 10, 7][i]!, p[0], p[1], 100));
  o.bal('a10');
  // 1. Opzij leggen, 2. langs de muur lopen, 3. terugkaatsen, 4. schot in de verre hoek.
  o.pass('a10', 'a8', 1);
  o.loop('a10', [27, 16.6], 2, { sprint: true });
  o.pass('a8', 'a10', 3);
  o.pass('a10', [36, -0.3], 4, { goal: true });
  return o.klaar();
}

// ---------- inworp en aftrap ----------

function langeInworp(): Tekening {
  const o = achterhoede(new Opzet('11v11', 'half'))
    .rood(11, 0.3, 15, 0)
    .rood(4, 30.5, 13.5)
    .rood(3, 41, 12)
    .rood(9, 35, 11)
    .rood(10, 13, 25)
    .rood(8, 34, 21)
    .rood(7, 48, 18)
    .blauw(1, 34, 1.2)
    .blauw(7, 29.4, 2.2)
    .blauw(4, 26, 6.8)
    .blauw(3, 32, 6.6)
    .blauw(6, 37.4, 6.6)
    .blauw(2, 35.8, 9.0)
    .blauw(8, 32.4, 11.8)
    .blauw(5, 43, 10)
    .blauw(10, 27, 19)
    .blauw(11, 14.5, 22.6)
    .bal('a11');
  // 1. Lopers naar de eerste en tweede paal.
  o.loop('a4', [28.6, 6.6], 1, { sprint: true }).loop('a3', [38.6, 4.6], 1, { sprint: true });
  // 2. Lange inworp op de eerste paal, doorkoppen, binnenkoppen.
  o.pass('a11', 'a4', 2, { hoog: true }).pass('a4', 'a3', 2, { hoog: true }).pass('a3', [36.4, -0.3], 2, { goal: true });
  return o.klaar();
}

function inworpKaats11(): Tekening {
  const o = new Opzet('11v11', 'half')
    .camera('schuin')
    .rood(5, 0.3, 34, 0)
    .rood(11, 5.5, 29, 160)
    .rood(10, 16, 30)
    .rood(9, 30, 16)
    .rood(8, 36, 28)
    .rood(7, 58, 22)
    .rood(6, 30, 40)
    .rood(4, 24, 48)
    .rood(3, 42, 48)
    .rood(2, 58, 40)
    .blauw(1, 34, 1.2)
    .blauw(7, 7.4, 26.8)
    .blauw(2, 4.4, 39)
    .blauw(8, 15, 25)
    .blauw(6, 26, 26)
    .blauw(3, 28, 12)
    .blauw(4, 40, 12)
    .blauw(5, 54, 16)
    .blauw(10, 40, 26)
    .blauw(11, 55, 30)
    .blauw(9, 30, 46)
    .bal('a5');
  // 1. Inworp naar de buitenspeler, die meteen terugkaatst op de ingooier.
  o.pass('a5', 'a11', 1).pass('a11', 'a5', 1);
  // 2. De ingooier draait open en speelt de middenvelder aan.
  o.dribbel('a5', [7.4, 35.6], 2);
  o.pass('a5', 'a10', 3);
  return o.klaar();
}

function inworpKaats8(): Tekening {
  const o = new Opzet('8v8', 'half')
    .camera('schuin')
    .rood(5, 0.3, 24, 0)
    .rood(11, 5.5, 19, 160)
    .rood(6, 16, 20)
    .rood(9, 21, 8)
    .rood(7, 34, 14)
    .rood(3, 21, 28)
    .rood(2, 34, 26)
    .blauw(1, 21.25, 1)
    .blauw(7, 7.4, 16.8)
    .blauw(2, 4.4, 28.6)
    .blauw(6, 16, 15)
    .blauw(3, 21, 4.6)
    .blauw(5, 32, 10)
    .blauw(11, 36, 20)
    .blauw(9, 25, 23)
    .bal('a5');
  o.pass('a5', 'a11', 1).pass('a11', 'a5', 1);
  o.dribbel('a5', [7.4, 25.6], 2);
  o.pass('a5', 'a6', 3);
  return o.klaar();
}

function inworpRug(): Tekening {
  const o = new Opzet('11v11', 'half')
    .camera('schuin')
    .rood(2, 67.7, 30, 180)
    .rood(7, 62, 24)
    .rood(8, 57, 27)
    .rood(9, 40, 14)
    .rood(10, 46, 30)
    .rood(11, 18, 18)
    .rood(6, 36, 36)
    .rood(4, 28, 46)
    .rood(3, 44, 46)
    .rood(5, 10, 40)
    .blauw(1, 34, 1.2)
    .blauw(5, 61, 22.4)
    .blauw(11, 55.6, 24.8)
    .blauw(4, 42, 10.4)
    .blauw(3, 30, 12)
    .blauw(2, 16, 15)
    .blauw(10, 47, 26)
    .blauw(6, 38, 30)
    .blauw(8, 26, 26)
    .blauw(7, 14, 30)
    .blauw(9, 32, 44)
    .bal('a2');
  // 1. De buitenspeler komt kort en neemt zijn man mee.
  o.loop('a7', [64.6, 29], 1).loop('b5', [62.4, 27.2], 1);
  // 2. In zijn rug loopt de middenvelder de ruimte in en krijgt de inworp.
  o.loop('a8', [64, 17], 2, { sprint: true }).pass('a2', 'a8', 2);
  // 3–4. Voorzet op de spits, die afrondt.
  o.loop('a9', [37.6, 7.4], 3, { sprint: true }).pass('a8', 'a9', 3);
  o.pass('a9', [35.6, -0.3], 4, { goal: true });
  return o.klaar();
}

function aftrap11(): Tekening {
  const o = new Opzet('11v11')
    .rood(1, 34, 103.5)
    .rood(2, 58, 70)
    .rood(3, 42, 76)
    .rood(4, 26, 76)
    .rood(5, 10, 70)
    .rood(6, 34, 63)
    .rood(8, 44, 59)
    .rood(10, 24, 59)
    .rood(7, 60, 55)
    .rood(11, 8, 55)
    .rood(9, 34, 53.1)
    .blauw(1, 34, 1.5)
    .blauw(2, 10, 30)
    .blauw(3, 26, 22)
    .blauw(4, 42, 22)
    .blauw(5, 58, 30)
    .blauw(6, 34, 38)
    .blauw(8, 24, 44)
    .blauw(10, 44, 44)
    .blauw(7, 14, 48)
    .blauw(11, 54, 48)
    .blauw(9, 34, 42.6)
    .bal('a9');
  // 1. Aftrap terug naar de 6; de linksbuiten start al langs de lijn.
  o.pass('a9', 'a6', 1).loop('a11', [5.5, 38], 1, { sprint: true });
  // 2. De 6 speelt meteen lang naar de flank, in de loop van de buitenspeler; de spits gaat mee naar voren.
  o.loop('a11', [5, 26], 2, { sprint: true })
    .pass('a6', 'a11', 2, { hoog: true })
    .loop('a9', [29, 36], 2, { via: [[31, 46]], sprint: true });
  // 3–4. Voorzet op de spits die doorliep, kopbal.
  o.loop('a9', [30, 12], 3, { sprint: true }).dribbel('a11', [7, 16], 3);
  o.pass('a11', 'a9', 4, { hoog: true }).pass('a9', [35.5, -0.3], 4, { goal: true });
  return o.klaar();
}

function aftrap8(): Tekening {
  const o = new Opzet('8v8')
    .rood(1, 21.25, 62.5)
    .rood(2, 35, 46)
    .rood(3, 21, 48)
    .rood(5, 7, 46)
    .rood(7, 34, 37)
    .rood(6, 21, 40)
    .rood(11, 8, 37)
    .rood(9, 21.25, 32.6)
    .blauw(1, 21.25, 1.5)
    .blauw(2, 7, 14)
    .blauw(3, 21.25, 12)
    .blauw(5, 35.5, 14)
    .blauw(7, 7, 24)
    .blauw(6, 21.25, 21)
    .blauw(11, 35.5, 24)
    .blauw(9, 21.25, 26)
    .bal('a9');
  o.pass('a9', 'a6', 1).loop('a11', [4, 26], 1, { sprint: true });
  o.loop('a11', [4, 19], 2, { sprint: true }).pass('a6', 'a11', 2, { hoog: true }).loop('a9', [26, 22], 2, { sprint: true });
  o.loop('a9', [22, 6.4], 3, { sprint: true });
  o.pass('a11', 'a9', 4, { hoog: true }).pass('a9', [22.8, -0.3], 4, { goal: true });
  return o.klaar();
}

// ---------- verdedigen bij standaardsituaties (rood verdedigt het goal bovenaan) ----------

function zonedekking11(): Tekening {
  const o = new Opzet('11v11', 'half')
    .rood(1, 34, 1.2)
    .rood(2, 38.8, 1.8)
    .rood(5, 27.8, 6.2)
    .rood(4, 31.8, 6.2)
    .rood(3, 35.8, 6.2)
    .rood(6, 39.8, 6.2)
    .rood(8, 30, 11.6)
    .rood(10, 37.4, 11.6)
    .rood(7, 26, 17)
    .rood(9, 34, 30)
    .rood(11, 52, 30)
    .blauw(11, 67.1, 0.9, 150)
    .blauw(9, 29, 14.4, -90)
    .blauw(4, 33.8, 14.6, -90)
    .blauw(3, 38.6, 15, -90)
    .blauw(8, 43, 12.6, -90)
    .blauw(10, 34, 20.5, -90)
    .blauw(7, 21, 18, -90)
    .blauw(6, 46, 22, -90)
    .blauw(2, 24, 38, -90)
    .blauw(5, 44, 38, -90)
    .bal('b11');
  // 1. De aanvallers lopen in; de zones blijven staan.
  o.loop('b4', [33.6, 8.6], 1, { sprint: true }).loop('b3', [39.4, 9.0], 1, { sprint: true }).loop('b9', [27.4, 9.2], 1, { sprint: true }).loop('b8', [42.6, 8.6], 1, { sprint: true });
  // 2. De corner komt in de zone van de centrale verdediger, die hem wegkopt naar de spits.
  o.pass('b11', 'a3', 2, { hoog: true }).pass('a3', 'a11', 2, { hoog: true });
  return o.klaar();
}

function zonedekking8(): Tekening {
  const o = new Opzet('8v8', 'half')
    .rood(1, 21.25, 1)
    .rood(7, 25.6, 1.6)
    .rood(3, 17.6, 4.2)
    .rood(6, 21.4, 4.4)
    .rood(2, 25.2, 4.8)
    .rood(5, 19, 8.6)
    .rood(11, 14, 9)
    .rood(9, 21, 20)
    .blauw(7, 41.6, 0.9, 150)
    .blauw(9, 17, 11.5, -90)
    .blauw(3, 22.4, 11.6, -90)
    .blauw(6, 27.4, 10, -90)
    .blauw(11, 31, 13, -90)
    .blauw(5, 21, 24, -90)
    .blauw(2, 10, 22, -90)
    .bal('b7');
  o.loop('b3', [21.6, 7.4], 1, { sprint: true }).loop('b9', [16, 7.4], 1, { sprint: true });
  o.pass('b7', 'a6', 2, { hoog: true }).pass('a6', 'a9', 2, { hoog: true });
  return o.klaar();
}

function mandekking(): Tekening {
  const o = new Opzet('11v11', 'half')
    .rood(1, 34, 1.2)
    .rood(2, 29.4, 2.2)
    .rood(4, 30.6, 10.8)
    .rood(3, 35.4, 11.6)
    .rood(5, 39.4, 10.4)
    .rood(6, 26.6, 12.6)
    .rood(8, 34, 17.6)
    .rood(10, 43, 15.8)
    .rood(7, 6, 9)
    .rood(9, 34, 30)
    .rood(11, 20, 28)
    .blauw(11, 0.9, 0.9, 30)
    .blauw(9, 30, 13, -90)
    .blauw(4, 35, 14, -90)
    .blauw(3, 40, 12.8, -90)
    .blauw(8, 26, 15, -90)
    .blauw(10, 34, 20, -90)
    .blauw(6, 44, 18.2, -90)
    .blauw(7, 10, 13, -90)
    .blauw(2, 24, 38, -90)
    .blauw(5, 44, 38, -90)
    .bal('b11');
  // 1. Elke aanvaller loopt in, zijn vaste tegenstander loopt mee (goalside).
  o.loop('b9', [30.8, 5.8], 1, { sprint: true })
    .loop('a4', [31.8, 3.9], 1, { sprint: true })
    .loop('b4', [36, 6.6], 1, { sprint: true })
    .loop('a3', [36.6, 4.6], 1, { sprint: true })
    .loop('b3', [39.6, 5.8], 1, { sprint: true })
    .loop('a5', [39.9, 3.6], 1, { sprint: true })
    .loop('b8', [27.4, 7.8], 1, { sprint: true })
    .loop('a6', [27.6, 5.6], 1, { sprint: true });
  // 2. De corner: de keeper komt en vangt.
  o.pass('b11', 'k1', 2, { hoog: true });
  return o.klaar();
}

function muurOpstellen(): Tekening {
  const bal: Punt = [40, 22];
  const muur = muurPlekken(bal, [37.66, 0], 4);
  const o = new Opzet('11v11', 'half')
    .rood(1, 34, 1.2)
    .rood(9, 40.4, 18.6, 90)
    .rood(4, 31.2, 9.8)
    .rood(3, 27.2, 7.4)
    .rood(5, 35.2, 6.0)
    .rood(6, 46.6, 9.6)
    .rood(11, 30, 34);
  // De muur komt van iets verder weg aanlopen op aanwijzing van de keeper.
  const muurIds = ['a7', 'a8', 'a10', 'a2'];
  muur.forEach((p, i) => o.rood([7, 8, 10, 2][i]!, p[0] + 0.4, p[1] + 3.2, 90));
  o.blauw(10, 38.6, 23.8, -90)
    .blauw(8, 40.6, 23.2, -100)
    .blauw(9, 32, 12, -90)
    .blauw(4, 28, 9.6, -90)
    .blauw(3, 36, 8.4, -90)
    .blauw(6, 46, 12, -90)
    .blauw(7, 22, 18, -90)
    .blauw(11, 54, 18, -90)
    .blauw(2, 26, 36, -90)
    .blauw(5, 46, 36, -90)
    .balOp(bal[0], bal[1]);
  // 1. De muur gaat staan op 9,15 m (korte hoek dicht), één speler blijft voor de bal.
  muurIds.forEach((id, i) => o.loop(id, muur[i]!, 1));
  // 2. Het schot gaat over de muur naar de lange hoek: daar staat de keeper.
  o.pass('b8', [33.2, -0.3], 2, { hoog: true, afloop: 'vangt' });
  return o.klaar();
}

// ---------- de bibliotheek ----------

const MUUR_IDS = ['b6', 'b8', 'b10', 'b7'];

export const HERVATTINGEN: Tactiek[] = [
  {
    id: 'corner-eerste-paal',
    groep: 'corners',
    naam: t('Corner op de eerste paal'),
    kort: t('Hoog op de eerste paal, kopbal in de verre hoek'),
    wat: t('De spits loopt vanaf de penaltystip naar de eerste paal en komt voor zijn man. De corner komt hoog op hem en hij kopt de bal in de verre hoek.'),
    wanneer: t('Tegen een tegenstander die de eerste paal niet goed bezet, of met een sterke koppende spits.'),
    punten: [t('Laat starten: pas lopen als de nemer zijn hand opsteekt of aanloopt'), t('Voor je man komen, de bal met je voorhoofd de andere kant op sturen'), t('Corner hard en hoog, net boven de eerste paal')],
    versies: [elf(cornerEerstePaal)],
  },
  {
    id: 'korte-corner',
    groep: 'corners',
    naam: t('Korte corner'),
    kort: t('Kort, naar binnen dribbelen en voorzetten'),
    wat: t('De corner gaat kort naar een medespeler, die naar binnen dribbelt en zo een betere hoek heeft. Hij zet voor op een centrale verdediger die vanaf de rand van de zestien inloopt.'),
    wanneer: t('Als de tegenstander maar één speler bij de korte corner zet, of als de keeper hoge corners goed plukt.'),
    punten: [t('Snel uitvoeren, voordat een tweede tegenstander naar buiten komt'), t('Naar binnen dribbelen geeft een betere hoek voor de voorzet'), t('De inloper start pas als de dribbelaar opkijkt')],
    versies: [elf(korteCorner)],
  },
  {
    id: 'corner-tweede-paal',
    groep: 'corners',
    naam: t('Corner op de tweede paal'),
    kort: t('Hoge bal naar de verre paal, inloper kopt in'),
    wat: t('De spits trekt naar de eerste paal en neemt de aandacht mee. De corner gaat hoog naar de verre paal, waar een loper vanaf de rand van de zestien inloopt en inkopt.'),
    wanneer: t('Als de tegenstander zich op de eerste paal concentreert en de verre paal vrij laat.'),
    punten: [t('De loper start vanaf de rand van de zestien, met snelheid'), t('De bal hoog en ver, achter de laatste verdediger'), t('Inkoppen naar beneden, richting de eerste paal')],
    versies: [elf(tweedePaal11), acht(tweedePaal8)],
  },
  {
    id: 'corner-doorkoppen',
    groep: 'corners',
    naam: t('Corner doorkoppen'),
    kort: t('Eerste paal doorkoppen, tweede paal afmaken'),
    wat: t('Een speler loopt naar de eerste paal en kopt de bal door naar de tweede paal. Daar kopt of tikt een medespeler de bal binnen.'),
    wanneer: t('Tegen een team met een keeper die snel uitkomt of veel spelers op de eerste paal.'),
    punten: [t('Doorkopper: niet hard koppen, de bal alleen van richting veranderen'), t('Afmaker op de tweede paal: verwacht de bal altijd'), t('Corner laag genoeg om op de eerste paal te raken')],
    versies: [elf(doorkoppen)],
  },
  {
    id: 'corner-rugzak',
    groep: 'corners',
    naam: t('Corner rugzak'),
    kort: t('Drie op een rij, uit elkaar bij de trap'),
    wat: t('Drie spelers staan achter elkaar. Op het moment van de trap lopen ze uit elkaar: naar de eerste paal, naar de penaltystip en naar de tweede paal. De bal gaat naar de loper die vrij komt.'),
    wanneer: t('Tegen mandekking: de verdedigers raken elkaar kwijt als de rij uit elkaar loopt.'),
    punten: [t('Precies tegelijk uit elkaar, op het moment dat de nemer de bal raakt'), t('Spreek vooraf af wie waarheen loopt'), t('De nemer kijkt wie er vrij is en kiest die loper')],
    versies: [elf(rugzak)],
  },
  {
    id: 'corner-rand-zestien',
    groep: 'corners',
    naam: t('Corner naar de rand van de zestien'),
    kort: t('Lage bal terug, direct schieten'),
    wat: t('De aanvallers lopen het doel in en nemen hun man mee. De corner gaat laag terug naar een speler aan de rand van de zestien, die direct schiet.'),
    wanneer: t('Tegen een tegenstander die met veel spelers voor het doel staat en de rand van de zestien vergeet.'),
    punten: [t('Lopers: echt het doel in, zodat je man mee moet'), t('De bal hard en laag over de grond'), t('Schutter: in één keer, over de spelers heen naar de hoek')],
    versies: [elf(randZestien11), acht(randZestien8)],
  },
  {
    id: 'corner-afschermen',
    groep: 'corners',
    naam: t('Corner met afschermen van de keeper'),
    kort: t('Spits voor de keeper, bal net over hem heen'),
    wat: t('Een aanvaller gaat voor de keeper staan en blijft staan, zodat die niet kan uitkomen. De corner gaat net over hem heen naar de korte kant van het doelgebied, waar een loper inkopt.'),
    wanneer: t('Tegen een keeper die graag uitkomt en hoge ballen plukt.'),
    punten: [t('De afschermer blijft staan en houdt zijn armen bij zich (geen overtreding)'), t('Corner net over de afschermer, niet te dicht bij de keeper'), t('De loper komt laat en hard naar de korte kant')],
    versies: [elf(afschermen)],
  },
  {
    id: 'vrije-trap-kaats',
    groep: 'vrije-trappen',
    naam: t('Vrije trap via een kaats'),
    kort: t('Opzij, langs de muur en terug'),
    wat: t('De nemer legt de bal opzij op een medespeler, loopt langs het muurtje en krijgt de bal terug. Hij schiet in de verre hoek.'),
    wanneer: t('Als de muur de directe weg naar het doel dichtzet en er naast de muur ruimte is.'),
    punten: [t('Opzij leggen en meteen gaan: de muur draait niet mee'), t('De kaats in één keer, voor de voeten van de loper'), t('Schot laag in de verre hoek')],
    versies: [elf(vrijeTrapKaats, MUUR_IDS)],
  },
  {
    id: 'vrije-trap-overstapje',
    groep: 'vrije-trappen',
    naam: t('Vrije trap met een overstapje'),
    kort: t('De eerste loopt over de bal, de tweede schiet'),
    wat: t('De eerste speler neemt aanloop en loopt over de bal heen. De muur en de keeper reageren op hem; meteen daarna schiet de tweede speler direct.'),
    wanneer: t('Bij een vrije trap recht voor het doel, met twee spelers die goed kunnen schieten.'),
    punten: [t('De eerste speler echt doen alsof hij schiet'), t('Weinig tijd tussen overstappen en schieten'), t('Schot over of langs de muur, naar de hoek van de keeper weg')],
    versies: [elf(overstapje, MUUR_IDS)],
  },
  {
    id: 'vrije-trap-speler-in-muur',
    groep: 'vrije-trappen',
    naam: t('Vrije trap met een speler in de muur'),
    kort: t('Eigen speler stapt weg: schot door het gat'),
    wat: t('Een eigen speler staat aan het eind van de muur. Op het moment van het schot stapt hij weg, zodat er een gat ontstaat waar de bal door kan.'),
    wanneer: t('Als de muur goed staat en de keeper de rest van het doel afdekt.'),
    punten: [t('Wegstappen op het moment dat de nemer aanloopt, niet eerder'), t('Schot laag en hard door het gat'), t('Na het schot meteen inlopen voor een rebound')],
    versies: [elf(spelerInMuur, [...MUUR_IDS, 'a9'])],
  },
  {
    id: 'vrije-trap-breed',
    groep: 'vrije-trappen',
    naam: t('Vrije trap breed leggen'),
    kort: t('Breed naast de muur, in één keer schieten'),
    wat: t('De nemer tikt de bal kort en breed naast de muur. Een medespeler die daar klaarstaat, schiet in één keer.'),
    wanneer: t('Als de muur de korte hoek dichtzet en de keeper daarachter staat.'),
    punten: [t('De tik breed en zacht, zodat de schutter hem in één keer kan raken'), t('Schutter: lichaam over de bal, naar de verre hoek'), t('De muur mag pas komen als de bal gespeeld is')],
    versies: [elf(breedLeggen11, MUUR_IDS), acht(breedLeggen8, ['b7', 'b6', 'b11'])],
  },
  {
    id: 'vrije-trap-zijkant',
    groep: 'vrije-trappen',
    naam: t('Vrije trap vanaf de zijkant'),
    kort: t('Voorzet met lopers naar beide palen'),
    wat: t('Een vrije trap vanaf de zijkant van de zestien wordt een voorzet. Lopers gaan naar de eerste en de tweede paal; één speler blijft op de rand voor de tweede bal.'),
    wanneer: t('Bij een overtreding naast de zestien, te schuin om direct te schieten.'),
    punten: [t('Lopers starten pas als de nemer aanloopt'), t('Voorzet tussen keeper en verdedigers, met effect van het doel af'), t('Iemand op de rand van de zestien voor de tweede bal')],
    versies: [elf(vanDeZijkant, ['b7', 'b11'])],
  },
  {
    id: 'vrije-trap-snel',
    groep: 'vrije-trappen',
    naam: t('Vrije trap snel nemen'),
    kort: t('Meteen diep, voordat de tegenstander staat'),
    wat: t('De nemer speelt de bal meteen in de diepte, terwijl de tegenstander zich nog opstelt. Een loper gaat in de rug van de verdediging en rondt af.'),
    wanneer: t('Na een overtreding op het middenveld, als de tegenstander nog niet georganiseerd is.'),
    punten: [t('De bal moet stil liggen en op de juiste plek'), t('Loper en nemer kijken elkaar aan: één signaal is genoeg'), t('Steekpass in de loop, achter de laatste lijn')],
    versies: [elf(snelNemen11), acht(snelNemen8)],
  },
  {
    id: 'lange-inworp',
    groep: 'inworp-aftrap',
    naam: t('Lange inworp in de zestien'),
    kort: t('Op de eerste paal, doorkoppen'),
    wat: t('Een lange inworp gaat de zestien in, naar de eerste paal. Daar wordt de bal doorgekopt naar de tweede paal, waar een medespeler binnenkopt.'),
    wanneer: t('Bij een inworp dicht bij de zestien, met een speler die ver kan ingooien.'),
    punten: [t('Ingooien met twee handen achter het hoofd, beide voeten aan de grond'), t('De bal hoog en strak, niet in een boogje'), t('Iemand op de tweede paal en iemand voor de tweede bal')],
    versies: [elf(langeInworp)],
  },
  {
    id: 'inworp-kaats',
    groep: 'inworp-aftrap',
    naam: t('Inworp met een kaats terug'),
    kort: t('Kort ingooien, terugkaatsen, opendraaien'),
    wat: t('De inworp gaat kort naar een medespeler, die de bal meteen terugkaatst op de ingooier. Die staat nu vrij en draait open met het spel voor zich.'),
    wanneer: t('Bij elke inworp op het middenveld, als de tegenstander alle spelers bij de lijn dekt.'),
    punten: [t('Inworp op de voeten (of het hoofd), zodat hij in één keer terug kan'), t('De ingooier stapt na de inworp meteen het veld in'), t('Opendraaien en het spel verleggen')],
    versies: [elf(inworpKaats11), acht(inworpKaats8)],
  },
  {
    id: 'inworp-loop-in-de-rug',
    groep: 'inworp-aftrap',
    naam: t('Inworp met een loop in de rug'),
    kort: t('Eén komt kort, de ander loopt in zijn rug'),
    wat: t('Een medespeler komt kort en neemt zijn tegenstander mee. Een tweede speler loopt in zijn rug de vrije ruimte in en krijgt de inworp.'),
    wanneer: t('Bij een inworp op de helft van de tegenstander, als die strak dekt.'),
    punten: [t('De korte loper vraagt echt om de bal, anders gaat zijn man niet mee'), t('De tweede loper start pas als de eerste zijn man heeft meegenomen'), t('Ingooien in de loop, voor de speler uit')],
    versies: [elf(inworpRug)],
  },
  {
    id: 'aftrap',
    groep: 'inworp-aftrap',
    naam: t('Ingestudeerde aftrap'),
    kort: t('Terug naar de 6, lang naar de flank'),
    wat: t('De aftrap gaat terug naar de 6, die de bal meteen lang naar de flank speelt. Daar is de buitenspeler al ingelopen; hij zet voor op de spits, die met de aftrap mee naar voren is gegaan.'),
    wanneer: t('Bij elke aftrap, om meteen druk op de tegenstander te zetten.'),
    punten: [t('De buitenspeler start op het fluitsignaal, niet eerder (dan staat hij buitenspel)'), t('De 6 speelt in één keer, de tegenstander staat nog'), t('Spits mee naar voren voor de voorzet')],
    versies: [elf(aftrap11), acht(aftrap8)],
  },
  {
    id: 'corner-zonedekking',
    groep: 'verdedigen',
    naam: t('Corner verdedigen met zonedekking'),
    kort: t('Vaste zones op de lijn van het doelgebied'),
    wat: t('De verdedigers staan in vaste zones: op de lijn van het doelgebied, een tweede rij ervoor en één speler bij de eerste paal. Komt de bal in jouw zone, dan kop je hem weg, het liefst naar een medespeler die hoog staat.'),
    wanneer: t('Tegen teams met veel lopers en sterke koppers: je hoeft niet mee te lopen, je verdedigt de ruimte.'),
    punten: [t('Je zone is je verantwoordelijkheid: aanvallen op de bal, niet wachten'), t('Wegkoppen hoog en breed, weg van het doel'), t('Na het wegkoppen meteen samen naar voren')],
    versies: [elf(zonedekking11), acht(zonedekking8)],
  },
  {
    id: 'corner-mandekking',
    groep: 'verdedigen',
    naam: t('Corner verdedigen met mandekking'),
    kort: t('Elke verdediger een vaste tegenstander'),
    wat: t('Elke verdediger heeft een vaste tegenstander en loopt met hem mee, steeds tussen hem en het doel. Eén speler staat bij de eerste paal. In het voorbeeld komt de keeper en vangt de bal.'),
    wanneer: t('Tegen teams met één of twee sterke koppers die je vast wilt zetten.'),
    punten: [t('Altijd tussen je man en het doel blijven'), t('Bal en man zien, half gedraaid'), t('Keeper roept luid "keeper" als hij komt')],
    versies: [elf(mandekking)],
  },
  {
    id: 'muur-opstellen',
    groep: 'verdedigen',
    naam: t('Muur opstellen bij een vrije trap'),
    kort: t('Korte hoek dicht, één speler bij de bal'),
    wat: t('De keeper bepaalt waar de muur staat: de muur zet de korte hoek dicht, op 9,15 meter, en de keeper staat zelf in de lange hoek. Eén speler staat bij de bal tegen een snelle uitvoering; de rest dekt de lopers.'),
    wanneer: t('Bij elke vrije trap binnen schietafstand.'),
    punten: [t('De keeper roept de muur op zijn plek, de buitenste staat net buiten de lijn naar de paal'), t('Eén speler voor de bal tot de muur staat'), t('De rest: lopers dekken en niet wegspringen bij het schot')],
    versies: [elf(muurOpstellen, ['a7', 'a8', 'a10', 'a2'])],
  },
];
