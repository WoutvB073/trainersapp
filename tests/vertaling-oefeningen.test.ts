import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ARCHIEF, OEFENINGEN } from '../src/data/oefeningen';
import { TEKENING_TEKST, vertaal, type Vertalingen } from '../src/data/vertaling';
import type { Oefening } from '../src/model/types';
import { benodigdheden } from '../src/training/training';
import { EN as EN_APP } from '../src/i18n/en';
import { HELP_EN } from '../src/help/inhoud';
import { nederlands } from './nl-woorden';

/**
 * 0.25.0: elke ingebouwde oefening (ook in het archief) heeft een volledige Engelse versie in src/data/en/. Faalt als
 * een oefening of een tekst ontbreekt, als er een lijst een andere lengte heeft, of als er Nederlands in staat.
 */
const MAP = path.resolve(__dirname, '../src/data/en');
const EN: Vertalingen = Object.assign({}, ...fs.readdirSync(MAP).map((f) => JSON.parse(fs.readFileSync(path.join(MAP, f), 'utf8'))));

/** Alle Engelse teksten van een oefening onder elkaar. */
function teksten(o: Oefening): string[] {
  return [o.naam, o.uitleg, o.organisatie ?? '', o.meerSpelers ?? '', ...o.benodigdheden, ...o.coachpunten, ...o.variaties.makkelijker, ...o.variaties.moeilijker, ...(o.onderdelen ?? [])];
}

/** Woorden die in Engelse oefenteksten wel mogen en in de NL-lijst staan (namen van spelvormen). */
const UITZONDERING = /\b(Dutch)\b/g;

describe('vertaling: ingebouwde oefeningen', () => {
  const alle = [...OEFENINGEN, ...ARCHIEF];
  it('elke oefening heeft een Engelse versie', () => {
    expect(alle.filter((o) => !EN[o.id]).map((o) => o.id)).toEqual([]);
  });
  it('geen vertalingen van oefeningen die niet bestaan', () => {
    const ids = new Set(alle.map((o) => o.id));
    expect(Object.keys(EN).filter((id) => !ids.has(id))).toEqual([]);
  });
  it('dezelfde velden en even lange lijsten als in het Nederlands', () => {
    const fout: string[] = [];
    for (const o of alle) {
      const e = EN[o.id];
      if (!e) continue;
      const lengte = (naam: string, a?: unknown[], b?: unknown[]) => (a?.length ?? -1) !== (b?.length ?? -1) && fout.push(`${o.id}: ${naam}`);
      if (!e.naam?.trim() || !e.uitleg?.trim()) fout.push(`${o.id}: naam/uitleg`);
      if (!!o.organisatie !== !!e.organisatie) fout.push(`${o.id}: organisatie`);
      if (!!o.meerSpelers !== !!e.meerSpelers) fout.push(`${o.id}: meerSpelers`);
      lengte('benodigdheden', o.benodigdheden, e.benodigdheden);
      lengte('coachpunten', o.coachpunten, e.coachpunten);
      lengte('makkelijker', o.variaties.makkelijker, e.variaties?.makkelijker);
      lengte('moeilijker', o.variaties.moeilijker, e.variaties?.moeilijker);
      if (o.onderdelen || e.onderdelen) lengte('onderdelen', o.onderdelen, e.onderdelen);
    }
    expect(fout).toEqual([]);
  });
  it('er staat geen Nederlands in de Engelse oefeningen', () => {
    const fout: string[] = [];
    for (const o of alle) {
      const e = EN[o.id];
      if (!e) continue;
      for (const s of teksten(vertaal(o, e))) {
        const w = nederlands(s.replace(UITZONDERING, ''));
        if (w) fout.push(`${o.id}: "${w}" in "${s.slice(0, 80)}"`);
      }
    }
    expect(fout).toEqual([]);
  });
  it('de Engelse tekst is echt anders dan de Nederlandse (niet vergeten te vertalen)', () => {
    const fout: string[] = [];
    for (const o of alle) {
      const e = EN[o.id];
      if (!e) continue;
      if (e.uitleg === o.uitleg) fout.push(`${o.id}: uitleg`);
      e.coachpunten.forEach((c, i) => c === o.coachpunten[i] && fout.push(`${o.id}: coachpunt ${i + 1}`));
    }
    expect(fout).toEqual([]);
  });
  it('tekst-labels in de tekeningen hebben een vertaling', () => {
    const labels = new Set(alle.flatMap((o) => o.tekening.objecten.map((x) => x.tekst).filter((t): t is string => !!t && /[a-z]{2}/i.test(t))));
    expect([...labels].filter((l) => !TEKENING_TEKST[l])).toEqual([]);
  });
  it('vertalen verandert de tekening niet (op tekst-labels na) en laat het origineel heel', () => {
    const o = OEFENINGEN[0]!;
    const kopie = structuredClone(o);
    const v = vertaal(o, EN[o.id]);
    expect(o).toEqual(kopie);
    expect(v.tekening.animatie).toBe(o.tekening.animatie);
    expect(v.id).toBe(o.id);
    expect(v.categorieen).toBe(o.categorieen);
  });
  it('klaarzetten in het Engels voegt enkelvoud en meervoud samen ("1 cone" + "4 cones" = 4 cones)', () => {
    const o = (id: string, b: string[]) => ({ ...OEFENINGEN[0]!, id, naam: id, benodigdheden: b });
    const lijst = benodigdheden([o('a', ['1 cone', '2 balls', '1 goal']), o('b', ['4 cones', '1 ball', 'Bibs', '3 low hurdles'])], 'en').map((x) => x.tekst);
    expect(lijst).toEqual(['2 balls', 'Bibs', '4 cones', '1 goal', '3 low hurdles']);
  });
  it('woordkeus 0.25.1: "Games" en "wide block", nergens meer "Fun games" of "star jump"', () => {
    const alles = [JSON.stringify(EN), JSON.stringify(EN_APP), JSON.stringify(HELP_EN)].join(' ');
    expect(alles).not.toMatch(/fun games|star[ -]?jumps?/i);
    expect(EN_APP['Spelletjes']).toBe('Games');
    expect(EN['keeper-1o1-spreidsprong']!.naam).toMatch(/^Wide block:/);
  });
});
