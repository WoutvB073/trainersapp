import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { haalLink, isVerlopen, LINK_DAGEN, moetVerlengen } from '../src/engine/deellink';

/** Versie 0.32.1: links verlopen als ze 180 dagen niet geopend zijn; openen verlengt de termijn. */

const DAG = 24 * 60 * 60 * 1000;
const nu = Date.now();
const code = (i: number) => `ABCDEFGHJK${'MNPQRSTUVW'[i]}Z`;
const antwoord = (verloopt?: number) =>
  new Response(JSON.stringify({ fields: { soort: { stringValue: 'c' }, data: { stringValue: 'zABC' }, ...(verloopt ? { verloopt: { timestampValue: new Date(verloopt).toISOString() } } : {}) } }), { status: 200 });

afterEach(() => vi.unstubAllGlobals());

function nepFetch(r: () => Response) {
  const f = vi.fn(async (_url: string, init?: RequestInit) => (init?.method === 'PATCH' ? new Response('{}') : r()));
  vi.stubGlobal('fetch', f);
  return f;
}
const verlengingen = (f: ReturnType<typeof nepFetch>) => f.mock.calls.filter(([, init]) => init?.method === 'PATCH');

describe('verlopen links', () => {
  it('termijn', () => {
    expect(LINK_DAGEN).toBe(180);
    expect(isVerlopen(nu - 1, nu)).toBe(true);
    expect(isVerlopen(nu + 1, nu)).toBe(false);
    expect(isVerlopen(undefined, nu)).toBe(false);
  });
  it('verlengen hooguit één keer per dag, en ook bij links zonder einddatum', () => {
    expect(moetVerlengen(nu + 180 * DAG, nu)).toBe(false);
    expect(moetVerlengen(nu + 179.5 * DAG, nu)).toBe(false);
    expect(moetVerlengen(nu + 178 * DAG, nu)).toBe(true);
    expect(moetVerlengen(undefined, nu)).toBe(true);
  });
  it('een verlopen link geeft de melding, ook als Firestore hem nog niet heeft opgeruimd', async () => {
    const f = nepFetch(() => antwoord(Date.now() - DAG));
    expect(await haalLink(code(0))).toBe('weg');
    expect(verlengingen(f)).toHaveLength(0);
  });
  it('openen verlengt de termijn tot 180 dagen vanaf nu, alleen dat veld', async () => {
    const f = nepFetch(() => antwoord(Date.now() + 100 * DAG));
    expect(await haalLink(code(1))).toEqual({ soort: 'c', code: 'zABC' });
    const [v] = verlengingen(f);
    expect(v![0]).toContain('updateMask.fieldPaths=verloopt');
    expect(v![0]).toContain('currentDocument.exists=true');
    const einde = Date.parse((JSON.parse(v![1]!.body as string) as { fields: { verloopt: { timestampValue: string } } }).fields.verloopt.timestampValue);
    expect(Math.abs(einde - (Date.now() + 180 * DAG))).toBeLessThan(5000);
  });
  it('net verlengd: geen nieuwe schrijfactie', async () => {
    const f = nepFetch(() => antwoord(Date.now() + 179.9 * DAG));
    await haalLink(code(2));
    expect(verlengingen(f)).toHaveLength(0);
  });
  it('link van vóór 0.32.1 zonder einddatum: werkt en krijgt er een', async () => {
    const f = nepFetch(() => antwoord());
    expect(await haalLink(code(3))).toEqual({ soort: 'c', code: 'zABC' });
    expect(verlengingen(f)).toHaveLength(1);
  });
  it('TTL staat in de instellingen op het juiste veld', () => {
    const x = JSON.parse(readFileSync('firestore.indexes.json', 'utf8')) as { fieldOverrides: { collectionGroup: string; fieldPath: string; ttl: boolean }[] };
    expect(x.fieldOverrides).toContainEqual(expect.objectContaining({ collectionGroup: 'links', fieldPath: 'verloopt', ttl: true }));
  });
});
