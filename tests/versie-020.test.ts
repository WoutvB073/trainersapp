import { describe, expect, it } from 'vitest';
import { OEFENINGEN, vindOefening } from '../src/data/oefeningen';
import { maakTijdlijn, standOp } from '../src/anim/timeline';

const opId = (id: string) => OEFENINGEN.find((o) => o.id === id);

describe('0.20.0 nieuwe oefeningen', () => {
  it('keepers: met de opgegeven categorieën', () => {
    const verwacht: Record<string, string[]> = {
      'keeper-hd-hordes-zijwaarts': ['hoog-duiken'],
      'keeper-bv-vier-kleuren': ['bal-verwerken', 'reactie'],
      'keeper-re-kleuren-voor-de-stuit': ['reactie'],
      'keeper-re-pass-naast-doel': ['reactie'],
      'keeper-re-bal-van-achter': ['reactie'],
      'keeper-bv-midden-voorzet-schot': ['bal-verwerken', 'voorzetten', 'hoog-duiken', 'laag-duiken'],
      'keeper-1o1-inspelen-draaien-kaatsen': ['een-op-een', 'reactie'],
      'keeper-1o1-vijf-keuzes': ['een-op-een', 'bal-verwerken', 'hoog-duiken', 'laag-duiken', 'reactie'],
      'keeper-ld-ladder-dubbele-duik': ['laag-duiken', 'hoog-duiken'],
      'keeper-ps-terugspeelbal-hoge-bal': ['passing', 'voorzetten'],
      'keeper-re-drie-schutters-nummers': ['reactie', 'bal-verwerken', 'laag-duiken', 'hoog-duiken'],
      'keeper-vz-claimen-uitgooien-terug': ['voorzetten', 'passing', 'bal-verwerken', 'laag-duiken'],
      'keeper-wu-grondoefeningen': ['warming-up'],
    };
    for (const [id, cats] of Object.entries(verwacht)) {
      const o = opId(id);
      expect(o, id).toBeDefined();
      expect([...o!.categorieen].sort(), id).toEqual([...cats].sort());
      expect(o!.coachpunten.length, id).toBeGreaterThanOrEqual(2);
      expect(o!.coachpunten.length, id).toBeLessThanOrEqual(4);
    }
    // Minimaal aantal keepers (de trainer telt niet mee).
    expect(opId('keeper-bv-midden-voorzet-schot')!.keepersNodig).toBe(2);
    expect(opId('keeper-1o1-inspelen-draaien-kaatsen')!.keepersNodig).toBe(2);
    expect(opId('keeper-1o1-vijf-keuzes')!.keepersNodig).toBe(3);
  });

  it('keepers met meer keepers laten het doorwisselen zien (de keeper in het doel wisselt)', () => {
    for (const o of OEFENINGEN.filter((x) => x.id.startsWith('keeper-') && x.keepersNodig >= 2 && ['keeper-re-pass-naast-doel', 'keeper-re-bal-van-achter', 'keeper-bv-midden-voorzet-schot', 'keeper-1o1-inspelen-draaien-kaatsen', 'keeper-1o1-vijf-keuzes', 'keeper-ld-ladder-dubbele-duik', 'keeper-vz-claimen-uitgooien-terug'].includes(x.id))) {
      const tl = maakTijdlijn(o.tekening);
      const eind = standOp(tl, tl.duur);
      // Op de beginplek van keeper 1 (in het doel) staat aan het eind een andere keeper.
      const k1 = o.tekening.objecten.find((x) => x.id === 'k1')!;
      const plek = k1.y < 2.6 ? [k1.x, k1.y] : [34, 1.6];
      const daar = [...eind.objecten.entries()].filter(([id, s]) => id.startsWith('k') && Math.hypot(s.x - plek[0]!, s.y - plek[1]!) < 1).map(([id]) => id);
      expect(daar.length, o.id).toBe(1);
      expect(daar[0], o.id).not.toBe('k1');
    }
  });

  it('grondoefeningen: één oefening, zittend, eerst grond tikken (echt zichtbaar), daarna knieën opgetrokken zonder op te staan', () => {
    const o = opId('keeper-wu-grondoefeningen')!;
    expect(o.naam).toBe('Grondoefeningen');
    const tl = maakTijdlijn(o.tekening);
    let tikMax = 0;
    let zitMin = 1;
    const soorten = new Set<string>();
    for (let t = 0.7; t <= tl.duur; t += 0.05) {
      const s = standOp(tl, t).objecten.get('k1')!;
      tikMax = Math.max(tikMax, s.tik);
      zitMin = Math.min(zitMin, s.zit);
      soorten.add(s.zitSoort ?? '');
    }
    expect(tikMax).toBeGreaterThan(0.95);
    expect(zitMin).toBeGreaterThan(0.95);
    expect([...soorten].sort()).toEqual(['zit', 'zit-opgetrokken']);
    // De drie losse oefeningen staan in het archief (oude trainingen en links blijven werken).
    for (const id of ['keeper-wu-zit-tikken-vangen', 'keeper-wu-zit-drie-hoogtes', 'keeper-wu-zit-knieen-opgetrokken']) {
      expect(opId(id), id).toBeUndefined();
      expect(vindOefening(id)?.verwijderd, id).toBe(true);
    }
  });

  it('oplopend overtal op twee kleine goaltjes', () => {
    const o = opId('veld-pv-oplopend-overtal')!;
    expect(o.tekening.objecten.filter((x) => x.soort === 'klein-goal')).toHaveLength(2);
    expect(o.tekening.objecten.some((x) => x.soort === 'goal')).toBe(false);
    expect(o.benodigdheden).toContain('2 kleine goaltjes');
  });

  it('spelers: met de opgegeven categorieën', () => {
    const verwacht: Record<string, string[]> = {
      'veld-pv-1-1-poortjes': ['partijvormen'],
      'veld-pv-wippen-1-1': ['partijvormen'],
      'veld-pv-oplopend-overtal': ['partijvormen'],
      'veld-pv-2-1-inhalende-verdediger': ['partijvormen'],
      'veld-ps-rondo-4-2-uitbraak': ['positiespel', 'afwerken'],
      'veld-pv-golven': ['partijvormen', 'afwerken'],
      'veld-af-kaatsen-verdediger-rug': ['afwerken'],
      'veld-ps-3-3-3-spits': ['positiespel', 'afwerken'],
    };
    for (const [id, cats] of Object.entries(verwacht)) {
      const o = opId(id);
      expect(o, id).toBeDefined();
      expect(o!.categorieen, id).toEqual(cats);
    }
    expect(opId('veld-pv-1-1-poortjes')).toMatchObject({ spelersNodig: 2, doorwisselbaar: true });
    expect(opId('veld-pv-oplopend-overtal')!.spelersNodig).toBe(5);
    expect(opId('veld-pv-2-1-inhalende-verdediger')!.spelersNodig).toBe(4);
  });
});
