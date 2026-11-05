import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Synchronisatie, type Instellingen } from '../src/online/sync';
import { lokaleOpslag } from './online/hulp';
import { nieuweEigen } from '../src/eigen/eigen';
import { nieuweTekening } from '../src/editor/editor';
import { nieuweTraining } from '../src/training/training';
import { nieuweClub } from '../src/clubtraining/clubtraining';
import { nieuweOpstelling, nieuwBord } from '../src/wedstrijd/wedstrijd';

/**
 * Volgorde van synchroniseren, stap voor stap (0.31.3). Een nep-Firestore laat de test bepalen wanneer een momentopname binnenkomt
 * en wanneer een schrijfactie bevestigd wordt. Zo zijn de twee soorten fouten exact na te spelen:
 * - een oudere momentopname komt binnen na een nieuwere lokale wijziging (snel achter elkaar aanpassen);
 * - de app gaat dicht voor een schrijfactie de server haalt.
 */

interface Schrijf {
  stappen: { pad: string; data?: Record<string, unknown>; weg?: boolean }[];
  klaar: () => void;
  fout: (e: Error) => void;
}

const nep = vi.hoisted(() => ({
  luisteraars: new Map<string, (s: unknown) => void>(),
  wachtrij: [] as unknown[],
  docs: new Map<string, Record<string, unknown>>(),
}));

vi.mock('firebase/firestore', () => {
  const stuur = (stappen: unknown[]) =>
    new Promise<void>((klaar, fout) => {
      nep.wachtrij.push({ stappen, klaar, fout });
    });
  return {
    collection: (_db: unknown, ...p: string[]) => ({ pad: p.join('/') }),
    doc: (a: { pad?: string }, ...p: string[]) => ({ pad: [...(a?.pad ? [a.pad] : []), ...p].join('/') }),
    onSnapshot: (ref: { pad: string }, _o: unknown, cb: (s: unknown) => void) => {
      nep.luisteraars.set(ref.pad, cb);
      return () => nep.luisteraars.delete(ref.pad);
    },
    setDoc: (ref: { pad: string }, data: unknown) => stuur([{ pad: ref.pad, data }]),
    deleteDoc: (ref: { pad: string }) => stuur([{ pad: ref.pad, weg: true }]),
    writeBatch: () => {
      const stappen: unknown[] = [];
      return {
        set: (ref: { pad: string }, data: unknown) => stappen.push({ pad: ref.pad, data }),
        commit: () => stuur(stappen),
      };
    },
    arrayUnion: (...x: string[]) => ({ erbij: x }),
    arrayRemove: (...x: string[]) => ({ eraf: x }),
  };
});

const IK = 'users/u1';

/** Wat de server met een schrijfactie doet. */
function pasToe(w: Schrijf) {
  for (const s of w.stappen) {
    if (s.weg) {
      nep.docs.delete(s.pad);
      continue;
    }
    const nu = { ...(nep.docs.get(s.pad) ?? {}) };
    for (const [k, v] of Object.entries(s.data ?? {})) {
      const lijst = (nu[k] as string[] | undefined) ?? [];
      const x = v as { erbij?: string[]; eraf?: string[] } | null;
      if (x?.erbij) nu[k] = [...new Set([...lijst, ...x.erbij])];
      else if (x?.eraf) nu[k] = lijst.filter((y) => !x.eraf!.includes(y));
      else nu[k] = v;
    }
    nep.docs.set(s.pad, nu);
  }
}

const meta = { hasPendingWrites: false, fromCache: false };

/** Momentopname van een lijst zoals die nu op de server staat (of een eigen, oudere). */
function lijstStand(col: string) {
  return { docs: [...nep.docs].filter(([p]) => p.startsWith(`${IK}/${col}/`)).map(([, d]) => ({ data: () => d })), metadata: meta };
}
const gebruikerStand = () => ({ data: () => nep.docs.get(IK), metadata: meta });

/** Alle luisteraars de stand van de server geven. */
function meld() {
  for (const [pad, cb] of [...nep.luisteraars]) cb(pad === IK ? gebruikerStand() : lijstStand(pad.split('/').pop()!));
}

/** Server verwerkt alles wat klaarstaat, bevestigt en meldt. Herhaalt tot het rustig is. */
async function bevestig() {
  for (let i = 0; i < 20; i += 1) {
    const w = nep.wachtrij.splice(0) as Schrijf[];
    if (!w.length && i > 0) return;
    for (const x of w) {
      pasToe(x);
      x.klaar();
    }
    await Promise.resolve();
    await Promise.resolve();
    meld();
    await Promise.resolve();
  }
  throw new Error('Blijft schrijven');
}

/** App dicht: wat nog niet bevestigd is, is weg. */
function appDicht(s: Synchronisatie) {
  s.stop();
  nep.wachtrij.length = 0;
}

async function start(a: ReturnType<typeof lokaleOpslag>) {
  const s = new Synchronisatie({} as never, 'u1', a.doelen);
  s.start();
  meld();
  await bevestig();
  return s;
}

const serverFavorieten = () => [...(((nep.docs.get(IK)?.favorieten as string[] | undefined) ?? []) as string[])].sort();
const serverItem = (col: string, id: string) => {
  const d = nep.docs.get(`${IK}/${col}/${id}`);
  return d ? (JSON.parse(d.data as string) as Record<string, unknown>) : undefined;
};
const inst = (w: Partial<Instellingen>): Instellingen => ({ thema: 'standaard', modus: 'licht', taal: 'auto', aantallen: null, leeftijd: null, gewijzigd: 0, ...w });

beforeEach(() => {
  nep.luisteraars.clear();
  nep.wachtrij.length = 0;
  nep.docs.clear();
});

describe('lijsten', () => {
  it('maken en meteen weer verwijderen: blijft weg (lege teamtraining die wordt opgeruimd)', async () => {
    const a = lokaleOpslag();
    await start(a);
    a.trainingen.bewaar({ ...nieuweTraining(1, 't1'), naam: 'Weg' });
    a.trainingen.verwijder('t1');
    await bevestig();
    expect(a.trainingen.haal('t1')).toBeUndefined();
    expect(serverItem('trainingen', 't1')).toBeUndefined();
  });

  it('aanpassen en meteen verwijderen: blijft weg', async () => {
    const a = lokaleOpslag();
    await start(a);
    a.trainingen.bewaar({ ...nieuweTraining(1, 't1'), naam: 'Een' });
    await bevestig();
    a.trainingen.bewaar({ ...a.trainingen.haal('t1')!, naam: 'Twee' });
    a.trainingen.verwijder('t1');
    await bevestig();
    expect(a.trainingen.haal('t1')).toBeUndefined();
    expect(serverItem('trainingen', 't1')).toBeUndefined();
  });

  it('verwijderen en meteen weer dezelfde maken (ongedaan maken): blijft bestaan', async () => {
    const a = lokaleOpslag();
    await start(a);
    a.trainingen.bewaar({ ...nieuweTraining(1, 't1'), naam: 'Een' });
    await bevestig();
    const oud = a.trainingen.haal('t1')!;
    a.trainingen.verwijder('t1');
    a.trainingen.bewaar({ ...oud, naam: 'Terug' });
    await bevestig();
    expect(a.trainingen.haal('t1')?.naam).toBe('Terug');
    expect(serverItem('trainingen', 't1')?.naam).toBe('Terug');
  });

  it('een oudere momentopname overschrijft geen nieuwere wijziging', async () => {
    const a = lokaleOpslag();
    await start(a);
    a.clubtrainingen.bewaar({ ...nieuweClub('mini-5-7', 1, 'c1'), naam: 'M' });
    await bevestig();
    const oud = lijstStand('clubtrainingen');
    for (const naam of ['Ma', 'Maa', 'Maan']) {
      a.clubtrainingen.bewaar({ ...a.clubtrainingen.haal('c1')!, naam });
      nep.luisteraars.get(`${IK}/clubtrainingen`)!(oud);
    }
    await bevestig();
    expect(a.clubtrainingen.haal('c1')?.naam).toBe('Maan');
    expect(serverItem('clubtrainingen', 'c1')?.naam).toBe('Maan');
  });

  it.each([
    ['oefeningen', (a: ReturnType<typeof lokaleOpslag>) => a.eigen.bewaar({ ...nieuweEigen(nieuweTekening('leeg'), 'veld', 1, 'eigen-x'), naam: 'Nieuw' }), (a: ReturnType<typeof lokaleOpslag>) => a.eigen.haal('eigen-x'), 'eigen-x'],
    ['trainingen', (a: ReturnType<typeof lokaleOpslag>) => a.trainingen.bewaar({ ...nieuweTraining(1, 'x'), naam: 'Nieuw' }), (a: ReturnType<typeof lokaleOpslag>) => a.trainingen.haal('x'), 'x'],
    ['opstellingen', (a: ReturnType<typeof lokaleOpslag>) => a.opstellingen.bewaar({ ...nieuweOpstelling('8v8', [], 1, 'x'), naam: 'Nieuw' }), (a: ReturnType<typeof lokaleOpslag>) => a.opstellingen.haal('x'), 'x'],
    ['borden', (a: ReturnType<typeof lokaleOpslag>) => a.borden.bewaar(nieuwBord('tactiek', nieuweTekening('leeg'), 'Nieuw', 1, 'x')), (a: ReturnType<typeof lokaleOpslag>) => a.borden.haal('x'), 'x'],
    ['clubtrainingen', (a: ReturnType<typeof lokaleOpslag>) => a.clubtrainingen.bewaar({ ...nieuweClub('mini-5-7', 1, 'x'), naam: 'Nieuw' }), (a: ReturnType<typeof lokaleOpslag>) => a.clubtrainingen.haal('x'), 'x'],
  ] as const)('%s: app dicht voor het online staat, en daarna gaat het alsnog online', async (col, maak, haal, id) => {
    const a = lokaleOpslag();
    const s = await start(a);
    maak(a);
    appDicht(s);
    await start(a);
    expect(haal(a)).toBeDefined();
    expect(serverItem(col, id)).toBeDefined();
  });

  it('verwijderen en app dicht voor het online staat: blijft weg en gaat alsnog weg', async () => {
    const a = lokaleOpslag();
    const s = await start(a);
    a.opstellingen.bewaar({ ...nieuweOpstelling('8v8', [], 1, 'x'), naam: 'Weg' });
    await bevestig();
    a.opstellingen.verwijder('x');
    appDicht(s);
    await start(a);
    expect(a.opstellingen.haal('x')).toBeUndefined();
    expect(serverItem('opstellingen', 'x')).toBeUndefined();
  });
});

describe('afvinklijst van een circuittraining', () => {
  const vink = (a: ReturnType<typeof lokaleOpslag>, k: string) => {
    const c = a.clubtrainingen.haal('c1')!;
    a.clubtrainingen.bewaar({ ...c, afgevinkt: [...c.afgevinkt, k] });
  };
  it('snel afvinken met oude momentopnames ertussen: alles blijft', async () => {
    const a = lokaleOpslag();
    await start(a);
    a.clubtrainingen.bewaar({ ...nieuweClub('mini-5-7', 1, 'c1'), naam: 'Maandag' });
    await bevestig();
    const oud = lijstStand('clubtrainingen');
    for (const k of ['1:pionnen', '1:ballen', '1:hesjes']) {
      vink(a, k);
      nep.luisteraars.get(`${IK}/clubtrainingen`)!(oud);
    }
    await bevestig();
    expect(a.clubtrainingen.haal('c1')?.afgevinkt).toEqual(['1:pionnen', '1:ballen', '1:hesjes']);
    expect(serverItem('clubtrainingen', 'c1')?.afgevinkt).toEqual(['1:pionnen', '1:ballen', '1:hesjes']);
  });
  it('afvinken en app dicht: staat er nog en gaat alsnog online', async () => {
    const a = lokaleOpslag();
    const s = await start(a);
    a.clubtrainingen.bewaar({ ...nieuweClub('mini-5-7', 1, 'c1'), naam: 'Maandag' });
    await bevestig();
    vink(a, '1:pionnen');
    appDicht(s);
    await start(a);
    expect(a.clubtrainingen.haal('c1')?.afgevinkt).toEqual(['1:pionnen']);
    expect(serverItem('clubtrainingen', 'c1')?.afgevinkt).toEqual(['1:pionnen']);
  });
});

describe('favorieten', () => {
  it('een oudere momentopname haalt een net toegevoegde favoriet niet weg', async () => {
    const a = lokaleOpslag();
    await start(a);
    a.favorieten.wissel('o1');
    nep.luisteraars.get(IK)!({ data: () => ({ favorieten: [] }), metadata: meta });
    expect(a.favorieten.is('o1')).toBe(true);
    await bevestig();
    expect(a.favorieten.is('o1')).toBe(true);
    expect(serverFavorieten()).toEqual(['o1']);
  });

  it('een oudere momentopname zet een net weggehaalde favoriet niet terug', async () => {
    const a = lokaleOpslag();
    await start(a);
    a.favorieten.wissel('o1');
    await bevestig();
    a.favorieten.wissel('o1');
    nep.luisteraars.get(IK)!({ data: () => ({ favorieten: ['o1'] }), metadata: meta });
    expect(a.favorieten.is('o1')).toBe(false);
    await bevestig();
    expect(a.favorieten.is('o1')).toBe(false);
    expect(serverFavorieten()).toEqual([]);
  });

  it('snel aan en uit: de laatste stand blijft, lokaal en online', async () => {
    const a = lokaleOpslag();
    await start(a);
    for (let i = 0; i < 5; i += 1) a.favorieten.wissel('o1');
    a.favorieten.wissel('o2');
    a.favorieten.wissel('o2');
    await bevestig();
    expect(a.favorieten.is('o1')).toBe(true);
    expect(a.favorieten.is('o2')).toBe(false);
    expect(serverFavorieten()).toEqual(['o1']);
  });

  it('toevoegen en app dicht voor het online staat: blijft en gaat alsnog online', async () => {
    const a = lokaleOpslag();
    const s = await start(a);
    a.favorieten.wissel('o1');
    appDicht(s);
    await start(a);
    expect(a.favorieten.is('o1')).toBe(true);
    expect(serverFavorieten()).toEqual(['o1']);
  });

  it('weghalen en app dicht voor het online staat: blijft weg en gaat alsnog weg', async () => {
    const a = lokaleOpslag();
    const s = await start(a);
    a.favorieten.wissel('o1');
    await bevestig();
    a.favorieten.wissel('o1');
    appDicht(s);
    await start(a);
    expect(a.favorieten.is('o1')).toBe(false);
    expect(serverFavorieten()).toEqual([]);
  });

  it('wat op een ander toestel online kwam, komt binnen', async () => {
    const a = lokaleOpslag();
    await start(a);
    nep.docs.set(IK, { ...nep.docs.get(IK), favorieten: ['ander'] });
    meld();
    await bevestig();
    expect(a.favorieten.is('ander')).toBe(true);
  });
});

describe('nieuw toestel en opstarten zonder gegevens van de server', () => {
  /** De app schrijft bij opstarten eerst naam en e-mail: de eerste momentopname bevat dan alleen dat. */
  const alleenNaam = { data: () => ({ naam: 'Testtrainer 1', email: 'test1@example.com' }), metadata: { hasPendingWrites: true, fromCache: true } };

  it('de eerste stand met alleen naam en e-mail overschrijft de instellingen online niet', async () => {
    nep.docs.set(IK, { instellingen: inst({ thema: 'rood', taal: 'en', gewijzigd: 100 }), favorieten: ['o1'] });
    const a = lokaleOpslag();
    new Synchronisatie({} as never, 'u1', a.doelen).start();
    nep.luisteraars.get(IK)!(alleenNaam);
    expect(nep.wachtrij).toEqual([]);
    // Gezien met de emulator: ook "niet uit de cache" kan nog alleen onze eigen schrijfactie zijn.
    nep.luisteraars.get(IK)!({ ...alleenNaam, metadata: { hasPendingWrites: true, fromCache: false } });
    expect(nep.wachtrij).toEqual([]);
    meld();
    await bevestig();
    expect(a.instellingen()).toMatchObject({ thema: 'rood', taal: 'en' });
    expect(a.favorieten.is('o1')).toBe(true);
    expect(nep.docs.get(IK)?.instellingen).toMatchObject({ thema: 'rood', taal: 'en' });
  });

  it('eerste keer samenvoegen: favorieten van het toestel komen erbij, die online blijven', async () => {
    nep.docs.set(IK, { favorieten: ['online'] });
    const a = lokaleOpslag();
    a.favorieten.wissel('toestel');
    new Synchronisatie({} as never, 'u1', a.doelen).start();
    nep.luisteraars.get(IK)!(alleenNaam);
    await bevestig();
    meld();
    await bevestig();
    expect([...a.favorieten.alle()].sort()).toEqual(['online', 'toestel']);
    expect(serverFavorieten()).toEqual(['online', 'toestel']);
  });

  it('opstarten zonder internet met een lege cache: lijsten en favorieten blijven staan', async () => {
    const a = lokaleOpslag();
    const s = await start(a);
    a.trainingen.bewaar({ ...nieuweTraining(1, 't1'), naam: 'Blijft' });
    a.favorieten.wissel('o1');
    await bevestig();
    appDicht(s);
    new Synchronisatie({} as never, 'u1', a.doelen).start();
    const leeg = { hasPendingWrites: false, fromCache: true };
    nep.luisteraars.get(`${IK}/trainingen`)!({ docs: [], metadata: leeg });
    nep.luisteraars.get(IK)!({ data: () => undefined, metadata: leeg });
    expect(a.trainingen.haal('t1')?.naam).toBe('Blijft');
    expect(a.favorieten.is('o1')).toBe(true);
    expect(nep.wachtrij).toEqual([]);
  });

  it('een oudere stand die later binnenkomt (standaardwaarden van een nieuw toestel) wint niet', async () => {
    const a = lokaleOpslag();
    await start(a);
    a.zetInstellingen({ thema: 'rood' }, 100);
    await bevestig();
    nep.docs.set(IK, { ...nep.docs.get(IK), instellingen: inst({ gewijzigd: 0 }) });
    meld();
    await bevestig();
    expect(a.instellingen().thema).toBe('rood');
    expect(nep.docs.get(IK)?.instellingen).toMatchObject({ thema: 'rood' });
  });
});

describe('instellingen (taal, thema, aantallen, leeftijd)', () => {
  it('snel achter elkaar wijzigen met oude momentopnames ertussen: de laatste blijft', async () => {
    const a = lokaleOpslag();
    await start(a);
    a.zetInstellingen({ thema: 'rood' }, 10);
    await bevestig();
    const oud = gebruikerStand();
    const oudeData = oud.data();
    let tijd = 20;
    for (const thema of ['blauw', 'geel', 'paars']) {
      a.zetInstellingen({ thema, taal: 'en', aantallen: { spelers: 8, keepers: 1 }, leeftijd: 'jo8-11' }, tijd);
      tijd += 1;
      nep.luisteraars.get(IK)!({ data: () => oudeData, metadata: meta });
    }
    await bevestig();
    expect(a.instellingen()).toMatchObject({ thema: 'paars', taal: 'en', aantallen: { spelers: 8, keepers: 1 }, leeftijd: 'jo8-11' });
    expect(nep.docs.get(IK)?.instellingen).toMatchObject({ thema: 'paars', taal: 'en' });
  });

  it('wijzigen en app dicht voor het online staat: blijft en gaat alsnog online', async () => {
    const a = lokaleOpslag();
    const s = await start(a);
    a.zetInstellingen({ thema: 'rood', leeftijd: 'mini-5-7' });
    appDicht(s);
    await start(a);
    expect(a.instellingen()).toMatchObject({ thema: 'rood', leeftijd: 'mini-5-7' });
    expect(nep.docs.get(IK)?.instellingen).toMatchObject({ thema: 'rood', leeftijd: 'mini-5-7' });
  });

  it('twee wijzigingen in dezelfde milliseconde: de laatste blijft', async () => {
    const a = lokaleOpslag();
    await start(a);
    a.zetInstellingen({ thema: 'rood' }, 500);
    await bevestig();
    a.zetInstellingen({ thema: 'blauw' }, 501);
    a.zetInstellingen({ thema: 'geel' }, 501);
    await bevestig();
    expect(a.instellingen().thema).toBe('geel');
    expect(nep.docs.get(IK)?.instellingen).toMatchObject({ thema: 'geel' });
  });

  it('gelijke tijd, andere inhoud, nog nooit gesynchroniseerd: online wint en er wordt niet teruggeschreven', async () => {
    const a = lokaleOpslag();
    nep.docs.set(IK, { instellingen: inst({ thema: 'blauw', gewijzigd: 0 }) });
    a.doelen.instellingen.zet(inst({ thema: 'rood', gewijzigd: 0 }));
    const s = new Synchronisatie({} as never, 'u1', a.doelen);
    s.start();
    meld();
    expect(nep.wachtrij).toEqual([]);
    expect(a.instellingen().thema).toBe('blauw');
  });

  it('gewijzigd terwijl de synchronisatie nog niet liep (opstarten): de wijziging wint en gaat online', async () => {
    const a = lokaleOpslag();
    const s = await start(a);
    a.zetInstellingen({ thema: 'rood' }, 100);
    await bevestig();
    appDicht(s);
    // Bijvoorbeeld in de eerste seconde na het openen: wel opgeslagen, maar zonder nieuwe tijd.
    a.doelen.instellingen.zet({ ...a.instellingen(), thema: 'blauw' });
    await start(a);
    expect(a.instellingen().thema).toBe('blauw');
    expect(nep.docs.get(IK)?.instellingen).toMatchObject({ thema: 'blauw' });
    expect((nep.docs.get(IK)?.instellingen as Instellingen).gewijzigd).toBeGreaterThan(100);
  });

  it('gewijzigd terwijl de synchronisatie niet liep, en op een ander toestel ook: de nieuwste wint', async () => {
    const a = lokaleOpslag();
    const s = await start(a);
    a.zetInstellingen({ thema: 'rood' }, 100);
    await bevestig();
    appDicht(s);
    a.doelen.instellingen.zet({ ...a.instellingen(), thema: 'blauw', gewijzigd: 300 });
    nep.docs.set(IK, { ...nep.docs.get(IK), instellingen: inst({ thema: 'geel', gewijzigd: 200 }) });
    await start(a);
    expect(a.instellingen().thema).toBe('blauw');
    expect(nep.docs.get(IK)?.instellingen).toMatchObject({ thema: 'blauw' });
  });

  it('een nieuwere stand van een ander toestel komt binnen', async () => {
    const a = lokaleOpslag();
    await start(a);
    a.zetInstellingen({ thema: 'rood' }, 100);
    await bevestig();
    nep.docs.set(IK, { ...nep.docs.get(IK), instellingen: inst({ thema: 'blauw', gewijzigd: 200 }) });
    meld();
    await bevestig();
    expect(a.instellingen().thema).toBe('blauw');
  });
});
