import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { leesHash } from '../src/router';
import { uitCode as uitClubCode } from '../src/clubtraining/clubtraining';
import { uitCode } from '../src/training/training';
import { sleutelVoor } from '../src/engine/account';
import { EN as en } from '../src/i18n/en';
import { HELP_EN, HELP_NL } from '../src/help/inhoud';
// @ts-expect-error -- los Node-script zonder typen
import { sleutels } from '../tools/i18n/scan.mjs';

/** Versie 0.31.1: nieuwe namen (Teamtraining, Circuittraining). Adressen, opslag en links blijven hetzelfde. */

/** Links van vóór 0.31.3: niet gecomprimeerd. */
const naarBase64Url = (tekst: string) => Buffer.from(tekst, 'utf8').toString('base64url');

const OUD_NL = /\bClubtraining|\bclubtraining|\bTraining maken\b|\bMijn trainingen\b|\bTraining genereren\b/;
const OUD_EN = /\b[Cc]lub session|\bPlan a session\b|\bMy sessions\b|\bGenerate a session\b/;

describe('oude namen zijn weg', () => {
  it('niet in de teksten van de app', () => {
    for (const k of sleutels() as string[]) expect(k).not.toMatch(OUD_NL);
    for (const v of Object.values(en)) expect(v).not.toMatch(OUD_EN);
    // Doorzoekt alle bronbestanden: onder volle belasting duurt dat langer dan de standaard 5 seconden.
  }, 30000);
  it('niet in de Help', () => {
    for (const o of HELP_NL) expect([o.titel, ...o.tekst, ...(o.laatZien ?? []).map((k) => k.tekst)].join(' ')).not.toMatch(OUD_NL);
    for (const o of HELP_EN) expect([o.titel, ...o.tekst, ...(o.laatZien ?? []).map((k) => k.tekst)].join(' ')).not.toMatch(OUD_EN);
  });
  it('de nieuwe namen hebben Engels', () => {
    expect(en.Teamtraining).toBe('Team session');
    expect(en.Circuittraining).toBe('Circuit session');
    expect(en['Teamtraining maken']).toBe('Plan a team session');
    expect(en['Mijn teamtrainingen']).toBe('My team sessions');
  });
});

describe('oude adressen, links en gegevens werken nog', () => {
  it('adressen in de app', () => {
    expect(leesHash('#/club')).toEqual({ naam: 'club-lijst' });
    expect(leesHash('#/club/abc')).toEqual({ naam: 'club', id: 'abc' });
    expect(leesHash('#/club/abc/plan')).toEqual({ naam: 'club-plan', id: 'abc' });
    expect(leesHash('#/trainingen')).toEqual({ naam: 'trainingen' });
    expect(leesHash('#/training/abc')).toEqual({ naam: 'training', id: 'abc' });
    expect(leesHash('#/help/club')).toEqual({ naam: 'help', onderwerp: 'club' });
  });
  it('een link naar een clubtraining uit 0.31.0 opent gewoon', () => {
    const code = naarBase64Url(JSON.stringify({ v: 1, n: 'Maandag', d: ['2026-11-09', '2026-11-11'], l: 'mini-5-7', k: 30, g: 6, t: ['Testtrainer 1'], b: ['v:mt-tik-tak', '', '', 'v:mt-3-tegen-3'], s: {}, f: {} }));
    expect(leesHash(`#/c/${code}`)).toEqual({ naam: 'club-gedeeld', code });
    expect(leesHash(`#/c/${code}/station/2`)).toEqual({ naam: 'club-gedeeld', code, station: 2 });
    expect(uitClubCode(code)).toMatchObject({ naam: 'Maandag', groepjes: 6, blokken: { techniek: 'veld-mt-tik-tak', partijvormen: 'veld-mt-3-tegen-3' } });
  });
  it('een oude trainingslink opent gewoon', () => {
    const code = naarBase64Url(JSON.stringify({ v: 1, n: 'Dinsdag', s: 8, k: 1, o: ['v:af-cutback'] }));
    expect(leesHash(`#/t/${code}`)).toEqual({ naam: 'gedeeld', code });
    expect(uitCode(code)).toMatchObject({ naam: 'Dinsdag', oefeningen: ['veld-af-cutback'] });
  });
  it('opslagsleutels en online-collecties blijven gelijk', () => {
    expect(sleutelVoor('clubtrainingen', null)).toBe('trainersapp.clubtrainingen');
    expect(sleutelVoor('trainingen', null)).toBe('trainersapp.trainingen');
    expect(readFileSync('firestore.rules', 'utf8')).toContain("'trainingen', 'opstellingen', 'borden', 'clubtrainingen'");
  });
});
