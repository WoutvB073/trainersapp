import { describe, expect, it } from 'vitest';
import { OEFENINGEN } from '../src/data/oefeningen';
import { filterOefeningen, GEEN_FILTERS } from '../src/engine/filters';
import { kandidaten } from '../src/training/genereren';
import { keeperNodig, kiesbaar, zonderKeeperMogelijk } from '../src/training/training';

/** Versie 0.29.1 (deel 2): filter op aantal keepers. Afwerken kan altijd (net of trainer); partijen op grote doelen niet. */

const veld = OEFENINGEN.filter((o) => o.soort === 'veld');
const groteDoelen = (id: string) => veld.find((o) => o.id === id)!.tekening.objecten.filter((x) => x.soort === 'goal').length;

/** De indeling zoals afgesproken: met keeper maar die is niet nodig, en waar hij wel nodig is. */
const KEEPER_NODIG = [
  'veld-pv-4-4-keepers',
  'veld-pv-5-5-flank',
  'veld-pv-1-1-naar-4-4',
  'veld-pv-6-6-verboden-midden',
  'veld-pv-5-5-schietzones',
  'veld-pv-4-4-wingers',
  'veld-pv-voorsprong',
  'veld-vo-hoog-druk-loont',
  'veld-vo-omschakelen-kaatsers',
  'veld-ps-opbouw-4-keeper-2',
];

describe('keeper nodig of niet', () => {
  it('alleen partijvormen op twee grote doelen en de opbouw met de keeper hebben echt een keeper nodig', () => {
    const nodig = veld.filter((o) => keeperNodig(o)).map((o) => o.id);
    expect(nodig.sort()).toEqual([...KEEPER_NODIG].sort());
    for (const id of KEEPER_NODIG.filter((i) => i !== 'veld-ps-opbouw-4-keeper-2')) expect(groteDoelen(id), id).toBe(2);
  });
  it('alle overige spelersoefeningen met een keeper kunnen ook zonder (net of trainer in het doel)', () => {
    const optioneel = veld.filter((o) => o.keepersNodig > 0 && !KEEPER_NODIG.includes(o.id));
    expect(optioneel.length).toBeGreaterThan(25);
    for (const o of optioneel) expect(zonderKeeperMogelijk(o), o.id).toBe(true);
  });
  it('keeperoefeningen blijven werken zoals nu', () => {
    for (const o of OEFENINGEN.filter((x) => x.soort === 'keeper')) expect(keeperNodig(o), o.id).toBe(o.keepersNodig > 0);
    expect(kiesbaar(OEFENINGEN, 'keeper', undefined, 6, 0)).toHaveLength(0);
  });
});

describe('6 spelers en 0 keepers', () => {
  const lijst = filterOefeningen(OEFENINGEN, { ...GEEN_FILTERS, aantallen: { spelers: 6, keepers: 0 } }, new Set()).map((o) => o.id);
  it('bibliotheek: alle afwerkvormen (tot 6 spelers) staan erbij', () => {
    const afwerken = veld.filter((o) => o.categorieen.includes('afwerken') && o.spelersNodig <= 6 && !KEEPER_NODIG.includes(o.id));
    expect(afwerken.length).toBeGreaterThan(20);
    for (const o of afwerken) expect(lijst, o.id).toContain(o.id);
  });
  it('partijvormen op grote doelen niet, op minidoeltjes wel', () => {
    for (const id of KEEPER_NODIG) expect(lijst, id).not.toContain(id);
    const mini = veld.filter((o) => o.categorieen.includes('partijvormen') && o.keepersNodig === 0 && o.spelersNodig <= 6);
    expect(mini.length).toBeGreaterThan(5);
    for (const o of mini) expect(lijst, o.id).toContain(o.id);
  });
  it('Training maken (kiezen) en Training genereren gebruiken dezelfde regel', () => {
    const kiezen = kiesbaar(OEFENINGEN, 'veld', 'afwerken', 6, 0).map((o) => o.id);
    const genereren = kandidaten({ soort: 'veld', categorie: 'afwerken' }, { alle: OEFENINGEN, spelers: 6, keepers: 0 }).map((o) => o.id);
    expect(genereren).toEqual(kiezen);
    expect(kiezen).toContain('veld-af-afstandsschot');
    expect(kiezen).toContain('veld-pv-2-1');
    const partij = kandidaten({ soort: 'veld', categorie: 'partijvormen' }, { alle: OEFENINGEN, spelers: 12, keepers: 0 }).map((o) => o.id);
    expect(partij).not.toContain('veld-pv-4-4-keepers');
    expect(partij).toContain('veld-pv-3-3-vier-doeltjes');
  });
});
