import type { Lijn, Punt, Tekening, VeldObject } from '../model/types';
import { veldVoorSpelvorm, type Spelvorm } from './wedstrijd';
import { t } from '../i18n/t';

/**
 * Voorbeeldtactieken (0.28.0): kant-en-klare tactiekborden met beide teams, looplijnen met stapnummers en een animatie
 * die meteen afspeelt. Jouw team is rood (A, eigen goal onderaan, valt naar boven aan), de tegenstander blauw (B).
 * Rugnummers per positie: 1 keeper, 2 rechtsback, 3 en 4 centrale verdedigers, 5 linksback, 6 controlerende
 * middenvelder, 8 en 10 middenvelders, 7 rechtsbuiten, 9 spits, 11 linksbuiten. Rood kijkt naar boven, dus "rechts"
 * is voor rood de kant met de grote x; voor blauw (kijkt naar beneden) is dat andersom.
 * De voorbeelden zelf veranderen nooit: opslaan of aanpassen maakt een eigen bord (met `tactiek` = het id, voor de uitleg).
 */

export type TactiekGroep = string;

export const TACTIEK_GROEPEN: { id: TactiekGroep; naam: string }[] = [
  { id: 'druk', naam: t('Druk zetten') },
  { id: 'opbouw', naam: t('Opbouwen') },
  { id: 'aanval', naam: t('Aanvallen en omschakelen') },
];

export interface TactiekVersie {
  /** Kort id, bv. 11v11, 8v8 of een formatie. */
  id: string;
  naam: string;
  vorm: Spelvorm;
  maak: () => Tekening;
  /** Spelers in een muur (spelhervattingen): die mogen dicht naast elkaar staan (± 0,8 m). */
  muur?: string[];
}

export interface Tactiek {
  id: string;
  groep: TactiekGroep;
  naam: string;
  /** Eén regel voor in de lijst. */
  kort: string;
  wat: string;
  wanneer: string;
  /** 2–4 aandachtspunten. */
  punten: string[];
  versies: TactiekVersie[];
}

const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Bouwhulp: spelers neerzetten en lijnen tekenen zoals in de editor (startpunt = waar de speler op dat moment staat).
 * Heel veld (zoals een opgesteld tactiekbord) of half veld met het goal bovenaan (spelhervattingen, 0.29.0); 8 tegen 8 in
 * de veldmaat van die spelvorm (half: 42,5 × 32 m) met een jeugdgoal. Half veld start met de camera achter het goal.
 */
export class Opzet {
  private objecten: VeldObject[];
  private plek = new Map<string, Punt>();
  private lijnen: Lijn[] = [];
  private veld: Tekening;
  constructor(vorm: Spelvorm, type: 'heel' | 'half' = 'heel') {
    if (type === 'heel') this.veld = veldVoorSpelvorm(vorm);
    else {
      const acht = vorm === '8v8';
      const goal: VeldObject = acht ? { id: 'g1', soort: 'goal', x: 21.25, y: 0, breedte: 5, hoogte: 2 } : { id: 'g1', soort: 'goal', x: 34, y: 0 };
      this.veld = { veld: acht ? { type: 'half', breedte: 42.5, lengte: 32 } : { type: 'half' }, camera: 'achter', objecten: [goal], lijnen: [] };
    }
    this.objecten = [...this.veld.objecten];
  }
  private zet(o: VeldObject) {
    this.objecten.push(o);
    this.plek.set(o.id, [o.x, o.y]);
  }
  /** Jouw team (rood). Nummer 1 = keeper. */
  rood(nr: number, x: number, y: number, kijk = -90) {
    if (nr === 1) this.zet({ id: 'k1', soort: 'keeper', nummer: 1, x: r2(x), y: r2(y), kijkrichting: -90 });
    else this.zet({ id: `a${nr}`, soort: 'speler', team: 'A', nummer: nr, x: r2(x), y: r2(y), kijkrichting: kijk });
    return this;
  }
  /** Tegenstander (blauw). Nummer 1 = keeper. */
  blauw(nr: number, x: number, y: number, kijk = 90) {
    if (nr === 1) this.zet({ id: 'k2', soort: 'keeper', nummer: 1, x: r2(x), y: r2(y), kijkrichting: 90 });
    else this.zet({ id: `b${nr}`, soort: 'speler', team: 'B', nummer: nr, x: r2(x), y: r2(y), kijkrichting: kijk });
    return this;
  }
  bal(bij: string) {
    const p = this.plek.get(bij)!;
    this.objecten.push({ id: 'bal1', soort: 'bal', x: p[0], y: p[1], bij });
    return this;
  }
  /** Losse bal op een plek (bv. bij een vrije trap); wie er binnen 1,5 m staat, kan hem spelen. */
  balOp(x: number, y: number) {
    this.objecten.push({ id: 'bal1', soort: 'bal', x: r2(x), y: r2(y) });
    return this;
  }
  /** Startcamera (half veld: standaard achter het goal, zodat de zestien groot in beeld is). */
  camera(c: Tekening['camera']) {
    this.veld = { ...this.veld, camera: c };
    return this;
  }
  /** Waar een speler nu staat (na zijn laatste lijn). */
  waar(id: string): Punt {
    return this.plek.get(id)!;
  }
  private beweeg(soort: 'loop' | 'dribbel', wie: string, naar: Punt, stap: number, via: Punt[] = [], sprint = false) {
    const van = this.plek.get(wie)!;
    this.lijnen.push({ soort, punten: [van, ...via, naar], stap, van: wie, ...(sprint ? { manier: 'sprint' as const } : {}) });
    this.plek.set(wie, naar);
    return this;
  }
  loop(wie: string, naar: Punt, stap: number, x: { via?: Punt[]; sprint?: boolean } = {}) {
    return this.beweeg('loop', wie, naar, stap, x.via, x.sprint);
  }
  dribbel(wie: string, naar: Punt, stap: number, x: { via?: Punt[] } = {}) {
    return this.beweeg('dribbel', wie, naar, stap, x.via);
  }
  /** Pass naar een speler (zijn plek na zijn eigen lijn in dezelfde stap) of schot op een punt (met afloop goal). */
  pass(van: string, naar: string | Punt, stap: number, x: { hoog?: boolean; goal?: boolean; afloop?: 'goal' | 'vangt' | 'naast' } = {}) {
    const begin = this.plek.get(van)!;
    const eind = typeof naar === 'string' ? this.plek.get(naar)! : naar;
    this.lijnen.push({
      soort: 'bal',
      punten: [begin, eind],
      stap,
      van,
      ...(typeof naar === 'string' ? { naar } : {}),
      ...(x.hoog ? { hoogte: 'hoog' as const } : {}),
      ...(x.goal ? { afloop: 'goal' as const } : x.afloop ? { afloop: x.afloop } : {}),
    });
    return this;
  }
  klaar(): Tekening {
    return { ...this.veld, objecten: this.objecten, lijnen: this.lijnen };
  }
}

const elf = (maak: () => Tekening): TactiekVersie => ({ id: '11v11', naam: t('11 tegen 11'), vorm: '11v11', maak });
const acht = (maak: () => Tekening, id = '8v8', naam = t('8 tegen 8')): TactiekVersie => ({ id, naam, vorm: '8v8', maak });

// ---------- opstellingen die vaak terugkomen ----------

/** Blauw bouwt op vanaf de keeper in een 1-4-3-3 (11 tegen 11). */
function blauwOpbouw433(o: Opzet) {
  return o
    .blauw(1, 34, 3)
    .blauw(2, 7, 22)
    .blauw(3, 25, 12)
    .blauw(4, 43, 12)
    .blauw(5, 61, 22)
    .blauw(6, 34, 27)
    .blauw(8, 22, 33)
    .blauw(10, 46, 33)
    .blauw(7, 4, 46)
    .blauw(11, 61, 45)
    .blauw(9, 35, 55);
}

// ---------- druk zetten ----------

function hoogDruk11(): Tekening {
  const o = blauwOpbouw433(new Opzet('11v11'))
    .rood(1, 34, 101)
    .rood(2, 57, 64)
    .rood(3, 42, 67)
    .rood(4, 26, 67)
    .rood(5, 11, 64)
    .rood(6, 34, 46)
    .rood(8, 42, 38)
    .rood(10, 26, 38)
    .rood(7, 51, 26)
    .rood(9, 35, 21)
    .rood(11, 17, 26)
    .bal('k2');
  // 1. De keeper speelt de rechter centrale verdediger in; de spits loopt schuin aan (de weg naar de andere kant dicht).
  o.pass('k2', 'b3', 1).loop('a9', [28.4, 14.2], 1, { via: [[33, 17]] }).loop('a11', [19, 22], 1).loop('a7', [50, 20], 1);
  // 2. De bal gaat naar de back: de buitenspeler zet druk, de middenvelders schuiven door, de verdediging schuift op.
  o.pass('b3', 'b2', 2)
    .loop('a11', [10.4, 25.6], 2, { sprint: true })
    .loop('a10', [23, 36.4], 2)
    .loop('a6', [32, 40], 2)
    .loop('a8', [38, 34], 2)
    .loop('a5', [9.5, 52], 2)
    .loop('a4', [24, 57], 2)
    .loop('a3', [39, 58], 2)
    .loop('a2', [52, 58], 2);
  // 3. De pass langs de lijn wordt onderschept door de linksback, de spits sluit de weg terug af.
  o.loop('a5', [7.6, 41.5], 3, { sprint: true }).pass('b2', 'a5', 3).loop('a9', [20, 16], 3);
  o.dribbel('a5', [12, 36], 4);
  return o.klaar();
}

function hoogDruk8(): Tekening {
  const o = new Opzet('8v8')
    .blauw(1, 21.25, 2.5)
    .blauw(2, 5, 14)
    .blauw(3, 21, 8.5)
    .blauw(5, 37.5, 14)
    .blauw(7, 9.5, 27.5)
    .blauw(6, 21, 22)
    .blauw(11, 34, 28)
    .blauw(9, 23, 37)
    .rood(1, 21.25, 61.5)
    .rood(2, 35, 41)
    .rood(3, 21, 45)
    .rood(5, 6, 38)
    .rood(7, 31, 20)
    .rood(6, 21, 29)
    .rood(11, 12, 20)
    .rood(9, 22, 15)
    .bal('k2');
  o.pass('k2', 'b3', 1).loop('a9', [23.6, 11.4], 1, { via: [[24.2, 13]] }).loop('a11', [11, 17.6], 1);
  o.pass('b3', 'b2', 2)
    .loop('a11', [7.6, 16.8], 2, { sprint: true })
    .loop('a6', [19, 24.6], 2)
    .loop('a7', [32, 25], 2)
    .loop('a5', [5.6, 32], 2)
    .loop('a3', [18.5, 35.5], 2)
    .loop('a2', [33, 36], 2);
  o.loop('a5', [6.6, 23.6], 3, { sprint: true }).pass('b2', 'a5', 3);
  o.dribbel('a5', [10, 20], 4);
  return o.klaar();
}

function middenblok(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(3, 26, 14)
    .blauw(4, 42, 14)
    .blauw(2, 6, 26)
    .blauw(5, 62, 26)
    .blauw(6, 34, 30)
    .blauw(8, 24, 40)
    .blauw(10, 44, 39)
    .blauw(7, 8, 48)
    .blauw(11, 60, 46)
    .blauw(9, 36, 60)
    .rood(1, 34, 100)
    .rood(9, 30, 44)
    .rood(10, 40, 44)
    .rood(11, 16, 56)
    .rood(8, 28, 57)
    .rood(6, 40, 57)
    .rood(7, 52, 56)
    .rood(5, 14, 68)
    .rood(4, 27, 69)
    .rood(3, 41, 69)
    .rood(2, 54, 68)
    .bal('b3');
  // 1. Bal naar links: het hele blok schuift mee naar de balkant.
  o.pass('b3', 'b2', 1);
  const schuif = (dx: number, stap: number) => {
    for (const [id, x, y] of [
      ['a9', 30, 44],
      ['a10', 40, 44],
      ['a11', 16, 56],
      ['a8', 28, 57],
      ['a6', 40, 57],
      ['a7', 52, 56],
      ['a5', 14, 68],
      ['a4', 27, 69],
      ['a3', 41, 69],
      ['a2', 54, 68],
    ] as [string, number, number][])
      o.loop(id, [x + dx, y], stap);
  };
  schuif(-6, 1);
  // 2–3. Terug via de 6 naar de andere kant: het blok schuift helemaal mee naar rechts.
  o.pass('b2', 'b6', 2);
  o.pass('b6', 'b5', 3);
  schuif(5, 3);
  // 4–5. De bal komt over de middenlijn: nu pas druk.
  o.pass('b5', 'b11', 4);
  o.dribbel('b11', [61, 51], 5)
    .loop('a7', [58.4, 55.6], 5, { sprint: true })
    .loop('a2', [61, 60.6], 5, { sprint: true })
    .loop('a6', [52, 53], 5)
    .loop('a10', [50, 44], 5);
  return o.klaar();
}

function laagBlok(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(3, 26, 50)
    .blauw(4, 42, 50)
    .blauw(6, 30, 56)
    .blauw(2, 8, 70)
    .blauw(5, 60, 70)
    .blauw(8, 24, 72)
    .blauw(10, 44, 72)
    .blauw(7, 10, 84)
    .blauw(11, 58, 82)
    .blauw(9, 34, 87.5)
    .rood(1, 34, 101)
    .rood(5, 20, 93.5)
    .rood(4, 29, 94)
    .rood(3, 39, 94)
    .rood(2, 48, 93.5)
    .rood(11, 18, 85)
    .rood(8, 28, 84)
    .rood(6, 40, 84)
    .rood(7, 50, 85)
    .rood(10, 34, 76)
    .rood(9, 36, 61)
    .bal('b6');
  // 1. Bal naar rechts: beide linies schuiven samen, de 10 zet de balbezitter onder druk.
  o.pass('b6', 'b10', 1).loop('a10', [41, 74.6], 1);
  for (const [id, x, y] of [
    ['a11', 22, 85],
    ['a8', 31.5, 84],
    ['a6', 44, 83],
    ['a7', 54, 84],
    ['a5', 24, 93.5],
    ['a4', 33, 94],
    ['a3', 43, 94],
    ['a2', 52, 93],
  ] as [string, number, number][])
    o.loop(id, [x, y], 1);
  // 2. Bal op de flank: de buitenspeler zet druk, de back dekt af.
  o.pass('b10', 'b11', 2).loop('a7', [56, 85.4], 2).loop('a2', [55, 91.4], 2);
  // 3–5. De voorzet wordt weggekopt naar de spits die hoog bleef: counter.
  o.pass('b11', 'a3', 3, { hoog: true });
  o.pass('a3', 'a9', 4, { hoog: true });
  o.dribbel('a9', [50, 48], 5, { via: [[44, 57]] });
  return o.klaar();
}

function terugspeelbal11(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(3, 25, 16)
    .blauw(4, 43, 16)
    .blauw(2, 8, 28)
    .blauw(5, 60, 28)
    .blauw(6, 34, 30)
    .blauw(8, 24, 40)
    .blauw(10, 44, 40)
    .blauw(7, 8, 50)
    .blauw(11, 60, 50)
    .blauw(9, 36, 58)
    .rood(1, 34, 100)
    .rood(9, 33, 36)
    .rood(7, 50, 38)
    .rood(11, 18, 38)
    .rood(10, 27, 46)
    .rood(8, 41, 46)
    .rood(6, 34, 54)
    .rood(5, 12, 62)
    .rood(4, 27, 66)
    .rood(3, 41, 66)
    .rood(2, 56, 62)
    .bal('b3');
  // 1. Terugspeelbal naar de keeper = het signaal: iedereen schuift door, elke korte optie gedekt.
  o.pass('b3', 'k2', 1)
    .loop('a9', [33.5, 8], 1, { via: [[28.6, 24]], sprint: true })
    .loop('a11', [26.6, 19.4], 1, { sprint: true })
    .loop('a7', [42, 19.6], 1, { sprint: true })
    .loop('a10', [32, 33.6], 1, { sprint: true })
    .loop('a8', [41, 38], 1)
    .loop('a5', [10, 32], 1, { sprint: true })
    .loop('a2', [58, 32], 1, { sprint: true })
    .loop('a6', [30, 47], 1)
    .loop('a4', [28, 54], 1)
    .loop('a3', [40, 52], 1);
  // 2. De keeper moet lang; de centrale verdediger wint de kopbal.
  o.pass('k2', 'a3', 2, { hoog: true });
  o.pass('a3', 'a8', 3);
  return o.klaar();
}

function terugspeelbal8(): Tekening {
  const o = new Opzet('8v8')
    .blauw(1, 21.25, 2.5)
    .blauw(2, 5, 15)
    .blauw(3, 21, 11)
    .blauw(5, 37.5, 15)
    .blauw(7, 6, 28)
    .blauw(6, 21, 24)
    .blauw(11, 36.5, 28)
    .blauw(9, 21, 38)
    .rood(1, 21.25, 61.5)
    .rood(5, 8, 44)
    .rood(3, 21, 46)
    .rood(2, 34.5, 44)
    .rood(11, 9, 32)
    .rood(6, 21, 33.5)
    .rood(7, 33, 32)
    .rood(9, 23.5, 20)
    .bal('b3');
  o.pass('b3', 'k2', 1)
    .loop('a9', [23.6, 6.2], 1, { sprint: true })
    .loop('a11', [7.5, 18.8], 1, { sprint: true })
    .loop('a7', [35.4, 19], 1, { sprint: true })
    .loop('a6', [21.6, 27.4], 1, { sprint: true })
    .loop('a3', [18.4, 41.2], 1)
    .loop('a5', [7, 35], 1)
    .loop('a2', [35, 36], 1);
  o.pass('k2', 'a3', 2, { hoog: true });
  o.pass('a3', 'a6', 3);
  return o.klaar();
}

function fuik(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(3, 26, 18)
    .blauw(4, 42, 18)
    .blauw(5, 60, 28)
    .blauw(6, 34, 32)
    .blauw(2, 8, 34)
    .blauw(8, 24, 38)
    .blauw(10, 46, 42)
    .blauw(7, 6, 52)
    .blauw(9, 34, 56)
    .blauw(11, 60, 52)
    .rood(1, 34, 100)
    .rood(9, 31, 25)
    .rood(11, 15, 27)
    .rood(7, 50, 32)
    .rood(10, 26, 47)
    .rood(6, 34, 50)
    .rood(8, 42, 46)
    .rood(5, 12, 61)
    .rood(4, 27, 65)
    .rood(3, 41, 65)
    .rood(2, 56, 61)
    .bal('b3');
  // 1. De spits loopt van binnen aan: de bal kan alleen naar de zijlijn.
  o.pass('b3', 'b2', 1).loop('a9', [27.6, 22.6], 1);
  // 2. De fuik: van achteren (buitenspeler), van voren (back) en van binnen (middenvelder); de rest dekt de korte passes.
  o.loop('a11', [8.8, 30.6], 2, { sprint: true })
    .loop('a5', [8.6, 38.4], 2, { sprint: true })
    .loop('a10', [11.6, 35.6], 2, { sprint: true })
    .loop('a9', [20, 27], 2)
    .loop('a6', [25.4, 44.6], 2)
    .loop('a8', [36, 40], 2)
    .loop('a4', [22, 56], 2)
    .loop('a3', [38, 60.4], 2)
    .loop('a2', [48, 58], 2);
  // 3. Ingesloten: de pass langs de lijn wordt onderschept.
  o.pass('b2', 'a5', 3);
  o.pass('a5', 'a10', 4);
  return o.klaar();
}

function tegenpressing11(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(2, 12, 14)
    .blauw(3, 27, 11)
    .blauw(4, 41, 11)
    .blauw(5, 56, 14)
    .blauw(6, 33, 24)
    .blauw(8, 22, 25)
    .blauw(10, 46, 25)
    .blauw(7, 8, 32)
    .blauw(11, 60, 32)
    .blauw(9, 36, 46)
    .rood(1, 34, 100)
    .rood(9, 34, 20)
    .rood(11, 14, 22)
    .rood(7, 54, 22)
    .rood(10, 26, 30)
    .rood(8, 42, 30)
    .rood(6, 34, 40)
    .rood(5, 10, 40)
    .rood(2, 58, 40)
    .rood(4, 26, 52)
    .rood(3, 42, 52)
    .bal('a10');
  // 1. Balverlies: de pass op de spits wordt onderschept.
  o.loop('b6', [30.4, 24.7], 1).pass('a10', 'b6', 1);
  // 2. Meteen vijf man om de bal; de rest dekt de diepe passes.
  o.loop('a10', [27.6, 25.6], 2, { sprint: true })
    .loop('a9', [32.4, 22.2], 2, { sprint: true })
    .loop('a8', [33.4, 27.6], 2, { sprint: true })
    .loop('a11', [26.6, 21.4], 2, { sprint: true })
    .loop('a6', [31, 30.4], 2, { sprint: true })
    .loop('a3', [38.4, 49], 2)
    .loop('a5', [12, 34.6], 2)
    .loop('a2', [56, 34.6], 2)
    .loop('a7', [48.6, 24], 2);
  // 3. Heroverd binnen een paar seconden, meteen door naar de spits.
  o.pass('b6', 'a10', 3);
  o.pass('a10', 'a9', 4);
  return o.klaar();
}

function tegenpressing8(): Tekening {
  const o = new Opzet('8v8')
    .blauw(1, 21.25, 2.5)
    .blauw(2, 8, 9)
    .blauw(3, 21.25, 7)
    .blauw(5, 34.5, 9)
    .blauw(7, 6, 22)
    .blauw(6, 21, 16)
    .blauw(11, 36, 22)
    .blauw(9, 24, 34)
    .rood(1, 21.25, 61.5)
    .rood(9, 21, 12.5)
    .rood(11, 8, 18)
    .rood(7, 34, 18)
    .rood(6, 21, 24)
    .rood(5, 8, 32)
    .rood(3, 21, 37)
    .rood(2, 34, 32)
    .bal('a6');
  o.loop('b6', [21.2, 18.2], 1).pass('a6', 'b6', 1);
  o.loop('a6', [20.4, 21.6], 2, { sprint: true })
    .loop('a9', [22, 15.2], 2, { sprint: true })
    .loop('a11', [17.4, 18.6], 2, { sprint: true })
    .loop('a7', [24.8, 19.6], 2, { sprint: true })
    .loop('a3', [23, 30.6], 2)
    .loop('a5', [8, 27], 2)
    .loop('a2', [35, 27], 2);
  o.pass('b6', 'a11', 3);
  o.pass('a11', 'a9', 4);
  return o.klaar();
}

// ---------- opbouwen ----------

function opbouwKeeper11(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(3, 27, 40)
    .blauw(4, 41, 40)
    .blauw(2, 8, 45)
    .blauw(5, 60, 45)
    .blauw(6, 34, 60)
    .blauw(8, 22, 62)
    .blauw(10, 46, 62)
    .blauw(7, 14, 76)
    .blauw(11, 54, 76)
    .blauw(9, 34, 74)
    .rood(1, 34, 101)
    .rood(4, 27, 96)
    .rood(3, 41, 96)
    .rood(5, 14, 84)
    .rood(2, 54, 84)
    .rood(6, 34, 79)
    .rood(10, 26, 68)
    .rood(8, 42, 68)
    .rood(11, 8, 55)
    .rood(9, 34, 52)
    .rood(7, 60, 55)
    .bal('k1');
  // 1. Uitwaaieren: centrale verdedigers naar de zijkant van de zestien, backs hoog en breed, de 6 komt kort.
  o.loop('a4', [15, 92], 1).loop('a3', [53, 92], 1).loop('a5', [5, 70], 1).loop('a2', [63, 70], 1).loop('a6', [35, 85], 1);
  // 2. Keeper naar de centrale verdediger; de buitenspeler van blauw komt drukzetten.
  o.pass('k1', 'a4', 2).loop('b7', [16, 87], 2);
  // 3–5. Naar de 6, die opendraait en de middenvelder vindt.
  o.pass('a4', 'a6', 3).loop('b9', [33, 79.4], 3);
  o.dribbel('a6', [39, 79], 4);
  o.pass('a6', 'a8', 5);
  return o.klaar();
}

function opbouwKeeper8(): Tekening {
  const o = new Opzet('8v8')
    .blauw(1, 21.25, 2.5)
    .blauw(2, 8, 20)
    .blauw(3, 21.25, 18)
    .blauw(5, 34.5, 20)
    .blauw(7, 9, 35)
    .blauw(6, 21, 34)
    .blauw(11, 33.5, 35)
    .blauw(9, 21, 47)
    .rood(1, 21.25, 61.5)
    .rood(4, 16, 59)
    .rood(3, 26.5, 59)
    .rood(11, 8, 48)
    .rood(7, 34.5, 48)
    .rood(6, 21, 52)
    .rood(9, 16, 30)
    .rood(10, 27, 30)
    .bal('k1');
  o.loop('a4', [8.5, 56], 1).loop('a3', [34, 56], 1).loop('a11', [3, 40], 1).loop('a7', [39.5, 40], 1).loop('a6', [22, 54.4], 1);
  o.pass('k1', 'a4', 2).loop('b7', [9.5, 51.4], 2);
  o.pass('a4', 'a6', 3).loop('b9', [20.6, 50.6], 3);
  o.dribbel('a6', [26, 50.6], 4);
  o.pass('a6', 'a10', 5);
  return o.klaar();
}

function opbouwDrie(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(2, 8, 42)
    .blauw(3, 27, 44)
    .blauw(4, 41, 44)
    .blauw(5, 60, 42)
    .blauw(7, 12, 66)
    .blauw(8, 26, 60)
    .blauw(6, 40, 60)
    .blauw(11, 56, 66)
    .blauw(9, 28, 76)
    .blauw(10, 40, 76)
    .rood(1, 34, 101)
    .rood(4, 27, 90)
    .rood(3, 41, 90)
    .rood(6, 34, 80.5)
    .rood(5, 10, 82)
    .rood(2, 58, 82)
    .rood(10, 26, 68)
    .rood(8, 42, 68)
    .rood(11, 8, 55)
    .rood(9, 34, 52)
    .rood(7, 60, 55)
    .bal('k1');
  // 1. De 6 zakt in tussen de centrale verdedigers, die uit elkaar gaan; de backs schuiven op.
  o.loop('a6', [34, 91.5], 1)
    .loop('a4', [20, 88], 1)
    .loop('a3', [48, 88], 1)
    .loop('a5', [6, 70], 1)
    .loop('a2', [62, 70], 1)
    .loop('b9', [27, 82], 1)
    .loop('b10', [41, 82], 1);
  // 2–5. Drie tegen twee: de vrije centrale verdediger dribbelt in en speelt de middenvelder aan.
  o.pass('k1', 'a6', 2);
  o.pass('a6', 'a3', 3).loop('b10', [45, 84.4], 3);
  o.dribbel('a3', [50, 78], 4);
  o.pass('a3', 'a8', 5);
  return o.klaar();
}

function opbouwDerdeMan(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(2, 8, 40)
    .blauw(3, 28, 38)
    .blauw(4, 42, 38)
    .blauw(5, 60, 40)
    .blauw(7, 12, 60)
    .blauw(8, 28, 56)
    .blauw(6, 40, 56)
    .blauw(11, 56, 62)
    .blauw(10, 28, 70)
    .blauw(9, 38, 72)
    .rood(1, 34, 101)
    .rood(4, 26, 86)
    .rood(3, 42, 86)
    .rood(2, 60, 76)
    .rood(5, 8, 76)
    .rood(6, 34, 76)
    .rood(8, 46, 64)
    .rood(10, 24, 62)
    .rood(7, 62, 52)
    .rood(9, 34, 44)
    .rood(11, 6, 52)
    .bal('a3');
  // 1. Centrale verdediger naar de back; de middenvelder komt kort.
  o.pass('a3', 'a2', 1).loop('a8', [49, 67], 1).loop('b11', [58, 70.6], 1);
  // 2. De back kaatst meteen op de middenvelder.
  o.pass('a2', 'a8', 2);
  // 3. De middenvelder vindt de buitenspeler in de diepte (derde man).
  o.loop('a7', [61, 30], 3, { via: [[64, 40]], sprint: true }).pass('a8', 'a7', 3);
  o.dribbel('a7', [56, 18], 4);
  return o.klaar();
}

function langeBal(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(2, 12, 42)
    .blauw(3, 27.5, 44)
    .blauw(4, 40.5, 43.5)
    .blauw(5, 56, 42)
    .blauw(6, 34, 57.5)
    .blauw(8, 24, 62)
    .blauw(10, 46, 62)
    .blauw(7, 12, 66)
    .blauw(11, 56, 66)
    .blauw(9, 34, 72)
    .rood(1, 34, 100)
    .rood(9, 34, 48)
    .rood(10, 27, 59)
    .rood(8, 41, 59)
    .rood(6, 34, 66)
    .rood(11, 10, 52)
    .rood(7, 58, 52)
    .rood(4, 26, 88)
    .rood(3, 42, 88)
    .rood(5, 8, 78)
    .rood(2, 60, 78)
    .bal('k1');
  // 1. Lange bal op de spits; de middenvelders sluiten aan voor de tweede bal.
  o.pass('k1', 'a9', 1, { hoog: true }).loop('a10', [27.4, 51.6], 1).loop('a8', [40.6, 51.6], 1);
  // 2. De spits kopt in één keer terug op de aansluitende middenvelder.
  o.pass('a9', 'a10', 2);
  // 3. De spits draait in de diepte en krijgt de bal terug.
  o.loop('a9', [34, 34], 3, { via: [[33, 41.5]], sprint: true }).pass('a10', 'a9', 3);
  return o.klaar();
}

function opbouw8(formatie: '1-3-2-2' | '1-3-3-1'): Tekening {
  const o = new Opzet('8v8')
    .blauw(1, 21.25, 2.5)
    .blauw(2, 8, 14)
    .blauw(3, 21.25, 14)
    .blauw(5, 34.5, 14)
    .blauw(7, 8, 30)
    .blauw(6, 21.25, 32)
    .blauw(11, 34.5, 30)
    .rood(1, 21.25, 61.5)
    .rood(5, 6, 52)
    .rood(3, 21.25, 55)
    .rood(2, 36.5, 52);
  if (formatie === '1-3-2-2') {
    o.blauw(9, 21.25, 44).rood(6, 15, 42).rood(8, 27.5, 42).rood(9, 14, 26).rood(10, 28.5, 26).bal('k1');
    // Keeper naar de buitenste verdediger, door naar de middenvelder, die de spits vindt; de tweede spits gaat diep.
    o.pass('k1', 'a5', 1).loop('b7', [7, 46.6], 1);
    o.pass('a5', 'a6', 2).loop('b9', [18.6, 40.4], 2);
    o.loop('a9', [13, 30.4], 3).pass('a6', 'a9', 3).loop('a10', [30, 15], 3, { sprint: true });
    o.pass('a9', 'a10', 4);
  } else {
    o.blauw(9, 24, 48).rood(11, 6, 38).rood(6, 21.25, 43.5).rood(7, 36.5, 38).rood(9, 21.25, 24).bal('k1');
    // Keeper naar de centrale verdediger, breed naar rechts, schuin terug naar binnen naar de 6, die de spits vindt.
    o.pass('k1', 'a3', 1).loop('b9', [22.8, 50.8], 1);
    o.pass('a3', 'a2', 2);
    o.pass('a2', 'a6', 3).loop('a9', [14, 29.4], 3);
    o.pass('a6', 'a9', 4);
  }
  return o.klaar();
}

// ---------- aanvallen en omschakelen ----------

function overlap11(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(5, 59, 24)
    .blauw(4, 44, 16)
    .blauw(3, 30, 16)
    .blauw(2, 10, 20)
    .blauw(11, 52, 40)
    .blauw(10, 44, 28)
    .blauw(6, 34, 30)
    .blauw(8, 24, 28)
    .blauw(7, 12, 36)
    .blauw(9, 38, 54)
    .rood(1, 34, 100)
    .rood(7, 58, 32)
    .rood(2, 60, 48)
    .rood(8, 44, 39)
    .rood(9, 34, 20)
    .rood(11, 12, 25)
    .rood(10, 28, 34)
    .rood(6, 34, 46)
    .rood(3, 42, 62)
    .rood(4, 26, 62)
    .rood(5, 10, 50)
    .bal('a7');
  // 1. De buitenspeler komt met de bal naar binnen, de back loopt buitenom.
  o.dribbel('a7', [50, 26], 1).loop('b5', [53, 22], 1).loop('a2', [63.5, 32], 1, { sprint: true });
  // 2. Bal in de loop van de back; de aanvallers gaan de zestien in.
  o.loop('a2', [64, 16], 2, { sprint: true })
    .pass('a7', 'a2', 2)
    .loop('a9', [38, 9], 2)
    .loop('a11', [27, 10], 2)
    .loop('a10', [33, 14.6], 2);
  // 3–4. Voorzet op de eerste paal, kopbal.
  o.pass('a2', 'a9', 3, { hoog: true });
  o.pass('a9', [31.5, -0.3], 4, { goal: true });
  return o.klaar();
}

function overlap8(): Tekening {
  const o = new Opzet('8v8')
    .blauw(1, 21.25, 2.5)
    .blauw(5, 37, 14)
    .blauw(3, 21.25, 10)
    .blauw(2, 6, 13)
    .blauw(11, 32, 28)
    .blauw(6, 19, 22)
    .blauw(7, 10, 28)
    .blauw(9, 24, 40)
    .rood(1, 21.25, 61.5)
    .rood(7, 36, 24)
    .rood(2, 38, 38)
    .rood(9, 21, 14)
    .rood(11, 7, 18)
    .rood(6, 21, 28)
    .rood(3, 21, 45)
    .rood(5, 6, 40)
    .bal('a7');
  o.dribbel('a7', [30, 19], 1).loop('b5', [33.2, 14.6], 1).loop('a2', [40, 24], 1, { sprint: true });
  o.loop('a2', [40.5, 10], 2, { sprint: true })
    .pass('a7', 'a2', 2)
    .loop('a9', [24.5, 6], 2, { via: [[25, 11]] })
    .loop('a11', [16, 7], 2);
  o.pass('a2', 'a9', 3, { hoog: true });
  o.pass('a9', [20, -0.3], 4, { goal: true });
  return o.klaar();
}

function underlap(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(5, 60, 22)
    .blauw(4, 46, 18)
    .blauw(3, 30, 16)
    .blauw(2, 10, 20)
    .blauw(11, 56, 36)
    .blauw(10, 40, 30)
    .blauw(6, 32, 28)
    .blauw(8, 22, 30)
    .blauw(7, 12, 36)
    .blauw(9, 38, 54)
    .rood(1, 34, 100)
    .rood(7, 63, 30)
    .rood(8, 46, 40)
    .rood(2, 58, 50)
    .rood(9, 34, 18)
    .rood(11, 10, 24)
    .rood(10, 28, 36)
    .rood(6, 34, 48)
    .rood(3, 42, 62)
    .rood(4, 26, 62)
    .rood(5, 10, 50)
    .bal('a7');
  // 1. De buitenspeler blijft breed; de middenvelder loopt binnendoor, tussen back en centrale verdediger, en krijgt de bal.
  o.loop('a8', [53, 16], 1, { via: [[52, 30]], sprint: true }).pass('a7', 'a8', 1).loop('a9', [40, 8], 1);
  // 2–3. Lage voorzet op de eerste paal, afronden.
  o.pass('a8', 'a9', 2);
  o.pass('a9', [37, -0.3], 3, { goal: true });
  return o.klaar();
}

function wisselKant(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(2, 10, 14)
    .blauw(3, 22, 12)
    .blauw(4, 34, 12)
    .blauw(5, 46, 14)
    .blauw(7, 14, 30)
    .blauw(8, 22, 24)
    .blauw(6, 30, 30)
    .blauw(10, 38, 24)
    .blauw(11, 46, 30)
    .blauw(9, 28, 50)
    .rood(1, 34, 100)
    .rood(5, 6, 40)
    .rood(10, 20, 36)
    .rood(11, 8, 22)
    .rood(6, 32, 46)
    .rood(4, 24, 60)
    .rood(3, 44, 60)
    .rood(8, 40, 34)
    .rood(2, 60, 46)
    .rood(7, 62, 24)
    .rood(9, 30, 18)
    .bal('a5');
  // 1–2. De tegenstander staat op links: via de 6 snel naar de vrije rechtsback.
  o.pass('a5', 'a6', 1);
  o.pass('a6', 'a2', 2).loop('b5', [54, 18], 2).loop('b11', [54, 34], 2);
  // 3–4. Langs de lijn naar de buitenspeler, die de ruimte in dribbelt.
  o.pass('a2', 'a7', 3);
  o.dribbel('a7', [60, 12], 4).loop('b5', [56.6, 14.6], 4);
  return o.klaar();
}

function diepte11(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(2, 12, 20)
    .blauw(3, 28, 20)
    .blauw(4, 40, 21)
    .blauw(5, 56, 20)
    .blauw(6, 34, 34)
    .blauw(8, 22, 36)
    .blauw(10, 46, 32)
    .blauw(7, 12, 42)
    .blauw(11, 58, 42)
    .blauw(9, 36, 58)
    .rood(1, 34, 100)
    .rood(10, 32, 42)
    .rood(9, 38, 24.5)
    .rood(11, 10, 26)
    .rood(7, 60, 26)
    .rood(8, 46, 40)
    .rood(6, 30, 54)
    .rood(4, 26, 66)
    .rood(3, 42, 66)
    .rood(5, 10, 56)
    .rood(2, 58, 56)
    .bal('a10');
  // 1. De middenvelder neemt de bal mee en heft zijn hoofd op.
  o.dribbel('a10', [32, 38.6], 1);
  // 2. Op dat moment loopt de spits schuin in de rug van de verdediger: steekpass.
  o.loop('a9', [31, 11], 2, { sprint: true }).pass('a10', 'a9', 2);
  o.pass('a9', [37, -0.3], 3, { goal: true });
  return o.klaar();
}

function diepte8(): Tekening {
  const o = new Opzet('8v8')
    .blauw(1, 21.25, 2.5)
    .blauw(2, 8, 12)
    .blauw(3, 19, 11)
    .blauw(5, 32, 12)
    .blauw(7, 9, 24)
    .blauw(6, 22, 22)
    .blauw(11, 34, 25)
    .blauw(9, 23, 40)
    .rood(1, 21.25, 61.5)
    .rood(6, 21, 30)
    .rood(9, 27, 16.5)
    .rood(11, 7, 18)
    .rood(7, 36, 18)
    .rood(5, 7, 40)
    .rood(3, 21, 45)
    .rood(2, 36, 40)
    .bal('a6');
  o.dribbel('a6', [17, 28], 1);
  o.loop('a9', [21, 5], 2, { sprint: true }).pass('a6', 'a9', 2);
  o.pass('a9', [22.8, -0.3], 3, { goal: true });
  return o.klaar();
}

function counter11(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(10, 42, 64)
    .blauw(9, 34, 76)
    .blauw(7, 12, 70)
    .blauw(11, 58, 72)
    .blauw(8, 24, 58)
    .blauw(6, 34, 52)
    .blauw(2, 10, 44)
    .blauw(5, 58, 46)
    .blauw(3, 28, 38)
    .blauw(4, 42, 38)
    .rood(1, 34, 100)
    .rood(6, 37, 70)
    .rood(10, 26, 64)
    .rood(8, 46, 72)
    .rood(9, 34, 58)
    .rood(11, 12, 62)
    .rood(7, 56, 60)
    .rood(4, 28, 84)
    .rood(3, 40, 84)
    .rood(5, 12, 82)
    .rood(2, 56, 82)
    .bal('b10');
  // 1. Balverovering op eigen helft.
  o.loop('a6', [38.6, 69.2], 1).pass('b10', 'a6', 1);
  // 2. Meteen vooruit: de spits diep, de buitenspelers breed.
  o.pass('a6', 'a10', 2)
    .loop('a9', [38, 36], 2, { via: [[40, 52]], sprint: true })
    .loop('a7', [62, 40], 2, { sprint: true })
    .loop('a11', [14, 42], 2, { sprint: true });
  // 3–6. De middenvelder dribbelt op, steekpass op de spits, afronden.
  o.dribbel('a10', [30, 48], 3).loop('a9', [36, 25], 3, { sprint: true });
  o.pass('a10', 'a9', 4);
  o.dribbel('a9', [36, 15], 5);
  o.pass('a9', [37.5, -0.3], 6, { goal: true });
  return o.klaar();
}

function counter8(): Tekening {
  const o = new Opzet('8v8')
    .blauw(1, 21.25, 2.5)
    .blauw(6, 24, 38)
    .blauw(9, 20, 48)
    .blauw(7, 8, 42)
    .blauw(11, 35, 44)
    .blauw(2, 8, 26)
    .blauw(3, 21, 22)
    .blauw(5, 35, 26)
    .rood(1, 21.25, 61.5)
    .rood(6, 22, 44)
    .rood(3, 21, 54)
    .rood(5, 8, 52)
    .rood(2, 35, 52)
    .rood(11, 10, 36)
    .rood(7, 32, 36)
    .rood(9, 21, 30)
    .bal('b6');
  o.loop('a6', [22.2, 42.6], 1).pass('b6', 'a6', 1);
  o.pass('a6', 'a7', 2)
    .loop('a9', [15, 12], 2, { via: [[16, 24]], sprint: true })
    .loop('a11', [4, 24], 2, { sprint: true });
  o.dribbel('a7', [30, 22], 3);
  o.pass('a7', 'a9', 4);
  o.pass('a9', [20, -0.3], 5, { goal: true });
  return o.klaar();
}

function terugleggen(): Tekening {
  const o = new Opzet('11v11')
    .blauw(1, 34, 3)
    .blauw(5, 58, 22)
    .blauw(4, 40, 16)
    .blauw(3, 28, 14)
    .blauw(2, 12, 16)
    .blauw(11, 54, 38)
    .blauw(10, 40, 28)
    .blauw(6, 26, 24)
    .blauw(8, 20, 32)
    .blauw(7, 10, 38)
    .blauw(9, 38, 54)
    .rood(1, 34, 100)
    .rood(7, 60, 30)
    .rood(9, 36, 20)
    .rood(10, 30, 33)
    .rood(11, 12, 24)
    .rood(8, 46, 36)
    .rood(6, 34, 46)
    .rood(2, 60, 50)
    .rood(3, 42, 62)
    .rood(4, 26, 62)
    .rood(5, 10, 50)
    .bal('a7');
  // 1. De buitenspeler gaat tot de achterlijn.
  o.dribbel('a7', [62, 4], 1).loop('b5', [60, 8.4], 1);
  // 2. De spits trekt naar de eerste paal en neemt zijn man mee; de inloper komt rond de penaltystip.
  o.loop('a9', [41, 6], 2, { sprint: true }).loop('b4', [44, 7.2], 2).loop('a10', [33, 12.4], 2, { sprint: true });
  // 3–4. Terugleggen en in één keer afronden.
  o.pass('a7', 'a10', 3);
  o.pass('a10', [30.8, -0.3], 4, { goal: true });
  return o.klaar();
}

// ---------- de bibliotheek ----------

export const TACTIEKEN: Tactiek[] = [
  {
    id: 'hoog-druk-433',
    groep: 'druk',
    naam: t('Hoog druk zetten in een 1-4-3-3'),
    kort: t('De bal naar één kant dwingen en bij de zijlijn veroveren'),
    wat: t('De spits loopt schuin aan, zodat de bal naar één kant moet. De buitenspelers sluiten de backs af, de middenvelders schuiven door op hun man en de verdediging schuift mee op tot de middenlijn. De pass langs de lijn wordt onderschept.'),
    wanneer: t('Als de tegenstander vanaf de keeper wil opbouwen en jullie de bal hoog willen veroveren, bijvoorbeeld na een doeltrap of als je moet scoren.'),
    punten: [
      t('Spits: in een boog aanlopen, zodat de pass terug of naar de andere kant dicht is'),
      t('Buitenspelers: eerst tussen centrale verdediger en back, pas druk als de bal naar de back gaat'),
      t('Achteraan: mee opschuiven, anders ontstaat er een gat tussen de linies'),
    ],
    versies: [elf(hoogDruk11), acht(hoogDruk8)],
  },
  {
    id: 'middenblok-442',
    groep: 'druk',
    naam: t('Middenblok in een 1-4-4-2'),
    kort: t('Compact op eigen helft, druk vanaf de middenlijn'),
    wat: t('Het team staat compact rond de middenlijn: van spits tot laatste man maximaal ongeveer 30 meter. Wisselt de bal van kant, dan schuift het hele blok mee. Pas als de bal over de middenlijn komt, gaat het team druk zetten.'),
    wanneer: t('Tegen een tegenstander die goed opbouwt, als je energie wilt sparen of een voorsprong wilt vasthouden.'),
    punten: [
      t('Kleine afstanden tussen de linies: niemand kan tussen de linies aangespeeld worden'),
      t('Het hele blok schuift samen mee naar de balkant, de verre kant mag open'),
      t('Het signaal is de middenlijn: dan de dichtstbijzijnde op de bal en de rest dekt af'),
    ],
    versies: [elf(middenblok)],
  },
  {
    id: 'laag-blok',
    groep: 'druk',
    naam: t('Laag blok'),
    kort: t('Twee linies van vier rond de zestien, één spits hoog'),
    wat: t('Twee linies van vier staan dicht bij elkaar rond de zestien, zodat er geen ruimte achter of tussen de linies is. Eén spits blijft hoog: na balwinst is hij het aanspeelpunt voor de counter.'),
    wanneer: t('Tegen een sterkere tegenstander, met een voorsprong in de slotfase of als je op de counter wilt spelen.'),
    punten: [
      t('Linies op 8–10 meter van elkaar, samen schuiven naar de balkant'),
      t('Voorzetten: elke speler in de zestien heeft een man of een zone'),
      t('Na balwinst meteen de hoge spits zoeken, die de bal vasthoudt tot er hulp komt'),
    ],
    versies: [elf(laagBlok)],
  },
  {
    id: 'druk-terugspeelbal',
    groep: 'druk',
    naam: t('Druk op de terugspeelbal naar de keeper'),
    kort: t('Bij een terugspeelbal schuift het hele team door'),
    wat: t('Speelt de tegenstander de bal terug naar zijn keeper, dan is dat het signaal: het hele team schuift naar voren en elke korte optie wordt gedekt. De keeper moet lang spelen, en die lange bal wint jouw verdediging.'),
    wanneer: t('Tegen een team dat graag kort opbouwt, zeker als de keeper niet goed met de voet is.'),
    punten: [
      t('Iedereen tegelijk: als één speler niet doorschuift, is daar de vrije man'),
      t('De spits loopt zo aan dat de keeper niet terug kan naar de verdediger die net speelde'),
      t('Achteraan opschuiven en klaarstaan voor de lange bal'),
    ],
    versies: [elf(terugspeelbal11), acht(terugspeelbal8)],
  },
  {
    id: 'fuik-flank',
    groep: 'druk',
    naam: t('De fuik op de flank'),
    kort: t('De bal naar de zijlijn sturen en met drie insluiten'),
    wat: t('De bal wordt bewust naar de zijlijn gestuurd. Daar sluiten drie spelers de balbezitter in: van voren, van binnen en van achteren. De rest zet de korte passes dicht, zodat de tegenstander nergens heen kan.'),
    wanneer: t('Tegen backs die weinig opties hebben of graag langs de lijn spelen.'),
    punten: [
      t('De zijlijn is je extra verdediger: stuur de bal naar buiten, nooit naar binnen'),
      t('Pas insluiten als de bal onderweg is naar de back, dan snel en tegelijk'),
      t('Wie niet insluit, staat in de passlijnen naar binnen en naar achteren'),
    ],
    versies: [elf(fuik)],
  },
  {
    id: 'tegenpressing',
    groep: 'druk',
    naam: t('Tegenpressing na balverlies'),
    kort: t('Meteen met vier of vijf om de bal'),
    wat: t('Na balverlies zitten meteen vier of vijf spelers om de bal, terwijl de rest de diepe passes dekt. De tegenstander krijgt geen tijd om op te kijken en de bal is binnen een paar seconden heroverd.'),
    wanneer: t('Als je met veel spelers rond de bal aanvalt; dan sta je na balverlies al dichtbij.'),
    punten: [
      t('Niet balen, meteen schakelen: de eerste twee seconden zijn het belangrijkst'),
      t('De dichtstbijzijnde op de bal, de anderen sluiten de korte opties'),
      t('Achteraan de diepe bal en de spits van de tegenstander dekken'),
    ],
    versies: [elf(tegenpressing11), acht(tegenpressing8)],
  },
  {
    id: 'opbouw-keeper',
    groep: 'opbouw',
    naam: t('Opbouw vanaf de keeper'),
    kort: t('Uitwaaieren en via de centrale verdediger naar de 6'),
    wat: t('De centrale verdedigers waaieren uit tot de zijkant van de zestien, de backs gaan hoog en breed en de 6 komt kort. De keeper speelt een centrale verdediger in, die de 6 vindt; de 6 draait open en speelt vooruit.'),
    wanneer: t('Bij een doeltrap of een bal in handen van de keeper, als de tegenstander niet met veel spelers druk zet.'),
    punten: [
      t('Ruimte maken: hoe breder de verdedigers, hoe moeilijker druk zetten wordt'),
      t('De 6: half gedraaid aannemen, kijk eerst over je schouder'),
      t('Komt er druk, dan kan de keeper altijd terug worden aangespeeld'),
    ],
    versies: [elf(opbouwKeeper11), acht(opbouwKeeper8)],
  },
  {
    id: 'opbouw-met-drie',
    groep: 'opbouw',
    naam: t('Opbouw met drie: de 6 zakt in'),
    kort: t('Drie tegen twee in de opbouw'),
    wat: t('De 6 zakt in tussen de centrale verdedigers, die daardoor breder kunnen staan; de backs schuiven op. Tegen twee spitsen heb je zo drie tegen twee: de vrije verdediger dribbelt in en speelt het middenveld aan.'),
    wanneer: t('Tegen een tegenstander die met twee spitsen druk zet.'),
    punten: [
      t('De 6 zakt pas in als de tegenstander met twee druk zet'),
      t('De vrije man dribbelt in tot er een tegenstander op hem afkomt, dan pas passen'),
      t('Backs hoog en breed, zodat de middenvelders ruimte hebben'),
    ],
    versies: [elf(opbouwDrie)],
  },
  {
    id: 'opbouw-derde-man',
    groep: 'opbouw',
    naam: t('Opbouw via de back en de derde man'),
    kort: t('Back, kaats op de middenvelder, buitenspeler diep'),
    wat: t('De centrale verdediger speelt de back aan, die in één keer kaatst op de middenvelder. Die vindt de buitenspeler, die al in de diepte loopt: de derde man.'),
    wanneer: t('Als de tegenstander de back druk zet en de ruimte achter zijn verdediging open laat.'),
    punten: [
      t('Snel spelen: de back kaatst in één keer, anders sluit de tegenstander het af'),
      t('De buitenspeler start zijn loopactie op het moment dat de back de bal kaatst'),
      t('De middenvelder komt kort en neemt open aan, met zicht op de diepte'),
    ],
    versies: [elf(opbouwDerdeMan)],
  },
  {
    id: 'lange-bal-tweede-bal',
    groep: 'opbouw',
    naam: t('Lange bal op de spits en de tweede bal'),
    kort: t('Lang op de spits, de middenvelders sluiten aan'),
    wat: t('De keeper of een verdediger speelt lang op de spits, die de bal doorkopt of kaatst. De middenvelders sluiten op tijd aan om de tweede bal te winnen en het spel snel te verplaatsen.'),
    wanneer: t('Tegen hoge druk, op een slecht veld of met een sterke spits.'),
    punten: [
      t('Middenvelders vooraf al dichtbij de spits, niet pas als de bal in de lucht is'),
      t('Spits: in één keer terug op een aansluitende speler, niet proberen aan te nemen'),
      t('Na de kaats meteen de diepte zoeken'),
    ],
    versies: [elf(langeBal)],
  },
  {
    id: 'opbouw-8v8',
    groep: 'opbouw',
    naam: t('Opbouw in 8 tegen 8'),
    kort: t('Twee varianten: 1-3-2-2 en 1-3-3-1'),
    wat: t('Twee manieren om in 8 tegen 8 op te bouwen. In de 1-3-2-2 gaat de bal via de buitenste verdediger naar een middenvelder, die de komende spits vindt terwijl de andere spits diep gaat. In de 1-3-3-1 gaat de bal breed en daarna schuin terug naar binnen naar de 6, die de spits vindt.'),
    wanneer: t('Bij elke doeltrap of bal in handen van de keeper in 8 tegen 8.'),
    punten: [
      t('Breed en diep staan: gebruik het hele veld'),
      t('Kijk voor je aanneemt al waar de vrije man staat'),
      t('Spitsen: één komt kort, de ander gaat diep'),
    ],
    versies: [acht(() => opbouw8('1-3-2-2'), '1-3-2-2', '1-3-2-2'), acht(() => opbouw8('1-3-3-1'), '1-3-3-1', '1-3-3-1')],
  },
  {
    id: 'overlap-flank',
    groep: 'aanval',
    naam: t('Overlap op de flank'),
    kort: t('Buitenspeler naar binnen, de back buitenom'),
    wat: t('De buitenspeler komt met de bal naar binnen en neemt zijn tegenstander mee. De back loopt buitenom, krijgt de bal in de loop en geeft de voorzet.'),
    wanneer: t('Als de buitenspeler van de tegenstander niet met de back meeloopt.'),
    punten: [
      t('Buitenspeler: dribbel naar binnen, zodat je tegenstander met je meegaat'),
      t('Back: start op tijd en roep, zodat de buitenspeler weet dat je komt'),
      t('Voorzet: eerste paal, tweede paal en rond de penaltystip bezet'),
    ],
    versies: [elf(overlap11), acht(overlap8)],
  },
  {
    id: 'underlap',
    groep: 'aanval',
    naam: t('Underlap'),
    kort: t('Binnendoor tussen back en centrale verdediger'),
    wat: t('De buitenspeler blijft breed en houdt de back van de tegenstander bij zich. De middenvelder (of back) loopt binnendoor, tussen back en centrale verdediger, en krijgt de bal in de diepte; daarna een lage voorzet.'),
    wanneer: t('Als de back van de tegenstander breed bij jouw buitenspeler staat en het gat naar de centrale verdediger groot is.'),
    punten: [
      t('Buitenspeler: breed blijven, zodat het gat open blijft'),
      t('Loper: schuin naar binnen starten, op het moment dat de buitenspeler opkijkt'),
      t('Lage voorzet, voor de keeper langs'),
    ],
    versies: [elf(underlap)],
  },
  {
    id: 'wisselen-van-kant',
    groep: 'aanval',
    naam: t('Wisselen van kant'),
    kort: t('Snel naar de vrije flank'),
    wat: t('De tegenstander schuift naar de balkant. In twee of drie snelle passes (of één lange bal) gaat de bal naar de vrije flank, waar de back en de buitenspeler ruimte hebben.'),
    wanneer: t('Als de tegenstander compact naar één kant schuift en de andere flank leeg laat.'),
    punten: [
      t('Snel spelen: in één of twee keer, anders schuift de tegenstander mee'),
      t('De verre kant blijft breed staan, ook als de bal ver weg is'),
      t('Na de wissel meteen de ruimte in dribbelen of doorspelen'),
    ],
    versies: [elf(wisselKant)],
  },
  {
    id: 'diepte-achter-verdediging',
    groep: 'aanval',
    naam: t('Diepte achter de verdediging'),
    kort: t('Schuine loopactie en steekpass'),
    wat: t('De spits loopt schuin in de rug van de verdediger, op het moment dat de middenvelder zijn hoofd opheft. De middenvelder geeft de steekpass in de loop.'),
    wanneer: t('Tegen een hoge verdediging met veel ruimte achter de laatste lijn.'),
    punten: [
      t('Timing: starten als de middenvelder opkijkt, niet eerder (buitenspel)'),
      t('Schuin lopen, dan blijf je makkelijker onside en zie je de bal'),
      t('Steekpass in de loop, niet op de voet'),
    ],
    versies: [elf(diepte11), acht(diepte8)],
  },
  {
    id: 'counter',
    groep: 'aanval',
    naam: t('Counter na balwinst'),
    kort: t('Snel vooruit met drie of vier spelers'),
    wat: t('Na balverovering op eigen helft gaat het team snel vooruit met drie of vier spelers. Lopers maken het veld breed en diep, de balbezitter dribbelt op en kiest de juiste pass; binnen ongeveer 10 seconden een afronding.'),
    wanneer: t('Na balwinst als de tegenstander met veel spelers is opgekomen.'),
    punten: [
      t('Eerste pass vooruit, niet eerst omkijken'),
      t('Lopers: één diep, twee breed, zodat de verdediging uit elkaar moet'),
      t('Afronden binnen ongeveer 10 seconden, voordat de tegenstander terug is'),
    ],
    versies: [elf(counter11), acht(counter8)],
  },
  {
    id: 'terugleggen-achterlijn',
    groep: 'aanval',
    naam: t('Terugleggen vanaf de achterlijn'),
    kort: t('Tot de achterlijn en terug op de inloper'),
    wat: t('De buitenspeler komt tot de achterlijn en legt de bal terug op de inloper rond de penaltystip. De spits trekt naar de eerste paal en neemt zijn man mee, zodat de ruimte voor de inloper vrij komt.'),
    wanneer: t('Als de verdediging ver terugzakt naar de doellijn.'),
    punten: [
      t('Buitenspeler: tot de achterlijn, dan kijken en laag terugleggen'),
      t('Spits: hard naar de eerste paal, je man gaat mee'),
      t('Inloper: laat komen en in één keer afronden'),
    ],
    versies: [elf(terugleggen)],
  },
];

export const vindTactiek = (id: string | undefined) => (id ? TACTIEKEN.find((x) => x.id === id) : undefined);
