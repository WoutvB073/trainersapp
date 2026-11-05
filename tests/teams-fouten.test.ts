import { beforeEach, describe, expect, it, vi } from 'vitest';
import { volgTeams, type Ik } from '../src/online/teamsOnline';

/** Versie 0.31.3: een fout van een luisteraar betekent niet dat je uit het team bent. Nep-Firestore: de test geeft de fouten door. */

const nep = vi.hoisted(() => ({
  doc: new Map<string, (s: unknown) => void>(),
  fout: new Map<string, (e: unknown) => void>(),
  schrijf: [] as { pad: string; data: Record<string, unknown> }[],
}));

vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, ...p: string[]) => ({ pad: p.join('/') }),
  doc: (a: { pad?: string }, ...p: string[]) => ({ pad: [...(a?.pad ? [a.pad] : []), ...p].join('/') }),
  onSnapshot: (ref: { pad: string }, ...rest: unknown[]) => {
    const f = rest.filter((x) => typeof x === 'function') as ((x: unknown) => void)[];
    nep.doc.set(ref.pad, f[0]!);
    if (f[1]) nep.fout.set(ref.pad, f[1]);
    return () => nep.doc.delete(ref.pad);
  },
  setDoc: (ref: { pad: string }, data: Record<string, unknown>) => {
    nep.schrijf.push({ pad: ref.pad, data });
    return Promise.resolve();
  },
  arrayRemove: (...x: string[]) => ({ eraf: x }),
  arrayUnion: (...x: string[]) => ({ erbij: x }),
}));

const ik: Ik = { db: {} as never, uid: 'u1', naam: 'Testtrainer 1' };
const even = () => new Promise((r) => setTimeout(r, 5));
const meta = { hasPendingWrites: false, fromCache: false };

async function inTeam() {
  volgTeams(ik, () => {});
  nep.doc.get('users/u1')!({ data: () => ({ teams: ['t1'] }), metadata: meta });
  await even();
}

beforeEach(() => {
  nep.doc.clear();
  nep.fout.clear();
  nep.schrijf.length = 0;
});

describe('fouten bij het volgen van een team', () => {
  it.each(['internal', 'resource-exhausted', 'unavailable', 'unknown'])('%s: het team blijft in je lijst', async (code) => {
    await inTeam();
    nep.fout.get('teams/t1/items')!({ code });
    nep.fout.get('teams/t1/leden')!({ code });
    nep.fout.get('teams/t1')!({ code });
    await even();
    expect(nep.schrijf).toEqual([]);
  });
  it('geen toegang meer (uit het team gehaald of opgeheven): het team gaat uit je lijst', async () => {
    await inTeam();
    nep.fout.get('teams/t1/items')!({ code: 'permission-denied' });
    await even();
    expect(nep.schrijf).toEqual([{ pad: 'users/u1', data: { teams: { eraf: ['t1'] } } }]);
  });
});
