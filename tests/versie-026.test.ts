import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { OEFENINGEN, vindOefening } from '../src/data/oefeningen';
import { CATEGORIEEN } from '../src/data/categorieen';
import { heeftPlaatje } from '../src/components/CategoriePlaatje';
import { EN as en } from '../src/i18n/en';
import { maakTijdlijn, standOp, type Tijdlijn } from '../src/anim/timeline';
import { BAL_R, balInvoer, laagste, maakSkelet, nieuweStaat, persoonInvoer, poseer, type PopStaat, type Skelet } from '../src/anim/poppetje';
import type { Soort } from '../src/model/types';
import engelsAfwerken from '../src/data/en/veld-afwerken.json';
import engelsPositiespel from '../src/data/en/veld-positiespel.json';

/** Versie 0.26.0 (deel A): categorie Verdedigen en omschakelen, plaatjes bij de categorieën, inworp, 20 spelersoefeningen. */

const NIEUW: Record<string, { categorieen: string[]; spelers: number; keepers: number }> = {
  'veld-wu-vierhoek-verdediger': { categorieen: ['warming-up', 'pass-en-trap'], spelers: 5, keepers: 0 },
  'veld-tq-aannemen-onder-druk': { categorieen: ['techniek', 'pass-en-trap'], spelers: 5, keepers: 0 },
  'veld-tq-gerichte-aanname-voren': { categorieen: ['techniek', 'pass-en-trap'], spelers: 3, keepers: 1 },
  'veld-pt-y-vorm-varianten': { categorieen: ['pass-en-trap'], spelers: 7, keepers: 0 },
  'veld-wu-pentagon-kiezen': { categorieen: ['warming-up', 'pass-en-trap'], spelers: 7, keepers: 0 },
  'veld-tq-vrijlopen-rug-verdediger': { categorieen: ['techniek', 'positiespel'], spelers: 4, keepers: 1 },
  'veld-af-schieten-onder-druk': { categorieen: ['afwerken'], spelers: 3, keepers: 1 },
  'veld-af-cutback': { categorieen: ['afwerken'], spelers: 3, keepers: 1 },
  'veld-af-snel-na-balwinst': { categorieen: ['afwerken', 'verdedigen-omschakelen'], spelers: 4, keepers: 1 },
  'veld-af-golven-na-inworp': { categorieen: ['afwerken'], spelers: 5, keepers: 1 },
  'veld-af-kopballen-voorzet': { categorieen: ['afwerken'], spelers: 4, keepers: 1 },
  'veld-af-wedstrijdje-schieten': { categorieen: ['afwerken', 'spelletjes'], spelers: 4, keepers: 1 },
  'veld-ps-5-tegen-3': { categorieen: ['positiespel'], spelers: 8, keepers: 0 },
  'veld-ps-4-4-doelspelers': { categorieen: ['positiespel', 'verdedigen-omschakelen'], spelers: 12, keepers: 0 }, // + 0.27.0
  'veld-ps-vier-zones': { categorieen: ['positiespel'], spelers: 7, keepers: 0 },
  'veld-ps-7-tegen-5-opbouw': { categorieen: ['positiespel'], spelers: 12, keepers: 0 },
  'veld-ps-rondo-4-2-wisselen': { categorieen: ['positiespel', 'warming-up'], spelers: 6, keepers: 0 },
  'veld-ps-rondo-3-1-plus-1-1': { categorieen: ['positiespel', 'partijvormen'], spelers: 4, keepers: 0 },
  'veld-ps-opbouw-4-keeper-2': { categorieen: ['positiespel'], spelers: 6, keepers: 1 },
  'veld-ps-linies-diepe-spits': { categorieen: ['positiespel'], spelers: 8, keepers: 1 },
};

/** Bestaande oefeningen die de nieuwe categorie erbij kregen. */
const ERBIJ = ['veld-pv-3-2-omschakeling', 'veld-ps-omschakelen', 'veld-pv-2-1-inhalende-verdediger', 'veld-af-duel-twee-rijen', 'veld-pv-oplopend-overtal'];

describe('categorie Verdedigen en omschakelen', () => {
  it('bestaat bij de spelers, vóór Partijvormen, met een Engelse naam', () => {
    const ids = CATEGORIEEN.veld.map((c) => c.id);
    expect(ids).toContain('verdedigen-omschakelen');
    expect(ids.indexOf('verdedigen-omschakelen')).toBe(ids.indexOf('partijvormen') - 1);
    expect(en['Verdedigen en omschakelen']).toBe('Defending & transition');
    expect(en['Druk zetten, de bal veroveren en snel omschakelen']).toBeTruthy();
  });
  it('elke categorie (spelers en keepers) heeft een eigen plaatje', () => {
    for (const soort of ['veld', 'keeper'] as Soort[]) for (const c of CATEGORIEEN[soort]) expect(heeftPlaatje(soort, c.id), `${soort}/${c.id}`).toBe(true);
  });
  it('bestaande oefeningen met omschakelen hebben de categorie erbij gekregen (achteraan, het bestand blijft gelijk)', () => {
    for (const id of ERBIJ) {
      const o = vindOefening(id)!;
      expect(o, id).toBeTruthy();
      expect(o.categorieen.at(-1), id).toBe('verdedigen-omschakelen');
      expect(o.categorieen[0], id).not.toBe('verdedigen-omschakelen');
    }
  });
});

describe('nieuwe spelersoefeningen 0.26.0', () => {
  const engels: Record<string, { naam: string; uitleg: string }> = { ...engelsAfwerken, ...engelsPositiespel } as never;
  for (const [id, verwacht] of Object.entries(NIEUW)) {
    it(id, () => {
      const o = OEFENINGEN.find((x) => x.id === id)!;
      expect(o, id).toBeTruthy();
      expect(o.soort).toBe('veld');
      expect(o.categorieen).toEqual(verwacht.categorieen);
      expect(o.spelersNodig).toBe(verwacht.spelers);
      expect(o.keepersNodig).toBe(verwacht.keepers);
      expect(o.coachpunten.length).toBeGreaterThanOrEqual(2);
      expect(o.coachpunten.length).toBeLessThanOrEqual(4);
      expect(o.variaties.makkelijker.length).toBeGreaterThan(0);
      expect(o.variaties.moeilijker.length).toBeGreaterThan(0);
      expect(o.tekening.animatie?.length).toBeGreaterThan(2);
      expect(typeof o.doorwisselbaar).toBe('boolean');
      if (!o.doorwisselbaar) expect(o.meerSpelers).toMatch(/^Met (meer|\d+) spelers/);
      // Eigen woorden: geen namen van websites of clubs.
      const tekst = JSON.stringify(o);
      expect(tekst).not.toMatch(/https?:|www\.|\.nl\b|\.com\b|youtube|instagram|academy|tiki|barça|ajax/i);
      // Tegelijk in het Engels.
      if (o.categorieen[0] === 'afwerken' || o.categorieen[0] === 'positiespel') expect(engels[id]?.naam, id).toBeTruthy();
    });
  }
  it('#9 Afstandsschot na een kaats is niet opnieuw gebouwd (bestaat al als Kaats en schieten van afstand)', () => {
    expect(vindOefening('veld-af-afstandsschot')).toBeTruthy();
    expect(OEFENINGEN.filter((o) => /afstandsschot/i.test(o.id))).toHaveLength(1);
  });
});

/** Poseert één persoon over de hele tijdlijn. */
function speel(tl: Tijdlijn, id: string, elk: (tt: number, sk: Skelet, staat: PopStaat) => void) {
  const sk = maakSkelet();
  const staat = nieuweStaat();
  const soort = tl.objecten.get(id)!.soort as 'keeper' | 'speler' | 'trainer';
  const ballen = [...tl.objecten.values()].filter((o) => o.soort === 'bal').map((o) => o.id);
  const n = Math.round(tl.duur * 30);
  for (let i = 0; i <= n; i++) {
    const tt = i / 30;
    const s = standOp(tl, tt);
    const st = s.objecten.get(id)!;
    poseer(sk, staat, { s: st, soort, t: tt, dtEcht: 1 / 30, dtAnim: 1 / 30, sprong: i === 0, zaad: 0.3, ...persoonInvoer(id, soort, st, s, balInvoer(s, ballen, BAL_R)) });
    elk(tt, sk, staat);
  }
}

describe('bouwsteen: inworp', () => {
  const tl = maakTijdlijn({
    veld: { type: 'leeg', breedte: 20, lengte: 16 },
    objecten: [
      { id: 'w', soort: 'speler', x: 0.6, y: 8, kijkrichting: 0 },
      { id: 'r', soort: 'speler', x: 9, y: 8, kijkrichting: 180 },
      { id: 'b', soort: 'bal', x: 1.15, y: 8, bij: 'w' },
    ],
    animatie: [{ duur: 0.4, acties: [] }, { acties: [{ type: 'pass', van: 'w', naar: 'r', bal: 'b', worp: 'inworp', hoogte: 1.8, eindHoogte: 0.4 }] }, { duur: 0.5, acties: [] }],
  });
  const vlucht = tl.balEvents.get('b')!.find((e) => e.soort === 'vlucht')!;
  const balOp = (tt: number) => {
    const b = standOp(tl, tt).objecten.get('b')!;
    return new Vector3(b.x, b.hoogte + BAL_R, b.y);
  };
  it('de bal gaat boven het hoofd weg (± 1,8 m, midden ± 1,95 m)', () => {
    const h = standOp(tl, vlucht.t0 + 0.01).objecten.get('b')!.hoogte;
    expect(h).toBeGreaterThan(1.6);
    expect(h).toBeLessThan(2.4);
  });
  it('de bal zit tussen beide handen, gaat achter het hoofd langs en de voeten blijven op de grond', () => {
    let verste = 0;
    let tussen: [number, number] = [Infinity, 0];
    let achter = Infinity;
    let laatste = new Vector3();
    let hoogsteVoet = 0;
    let min = Infinity;
    speel(tl, 'w', (tt, sk, staat) => {
      min = Math.min(min, laagste(sk));
      if (tt < vlucht.t0 + 0.05) for (const i of [0, 1] as const) hoogsteVoet = Math.max(hoogsteVoet, sk.enkel[i].getWorldPosition(new Vector3()).y);
      if (tt > vlucht.t0 - 0.6 && tt < vlucht.t0 && staat.balInHand > 0.5 && staat.hand.y > 1.3) {
        // Boven het hoofd ligt de bal in 3D tussen de handen (staat.hand): elke pols vlak bij de bal.
        const p = [sk.pols[0].getWorldPosition(new Vector3()), sk.pols[1].getWorldPosition(new Vector3())] as const;
        for (const q of p) verste = Math.max(verste, q.distanceTo(staat.hand));
        tussen = [Math.min(tussen[0], p[0].distanceTo(p[1])), Math.max(tussen[1], p[0].distanceTo(p[1]))];
        // Achter het hoofd: de bal komt achter de schouders (x kleiner dan de werper, die naar +x kijkt).
        if (staat.hand.y > 1.7) achter = Math.min(achter, staat.hand.x - 0.6);
        laatste = staat.hand.clone();
      }
    });
    // Echt twee handen, aan weerszijden van de bal (doorsnede 0,28 m).
    expect(tussen[0]).toBeGreaterThan(0.2);
    expect(tussen[1]).toBeLessThan(0.42);
    expect(verste).toBeLessThan(0.25);
    expect(achter).toBeLessThan(0);
    expect(laatste.y).toBeGreaterThan(1.75);
    expect(laatste.distanceTo(balOp(vlucht.t0))).toBeLessThan(0.6);
    expect(hoogsteVoet).toBeLessThan(0.2);
    expect(min).toBeGreaterThan(-0.01);
  });
});
