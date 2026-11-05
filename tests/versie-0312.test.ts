import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { leesHash } from '../src/router';
import { leesTeamClub, materiaal, naarCode, nieuweClub, uitCode, uitGedeeldeClub, voorTeam, type ClubTraining } from '../src/clubtraining/clubtraining';
import { oefeningNaarCode, oefeningUitCode, voorDelen } from '../src/eigen/eigen';
import { meeTeNemen } from '../src/eigen/meenemen';
import { eigenOefeningen } from '../src/eigen/opslag';
import { nieuweEigen } from '../src/eigen/eigen';
import { nieuweTekening } from '../src/editor/editor';
import { teams, teamOefeningId, type Team } from '../src/engine/teams';
import { vindOefening } from '../src/data/oefeningen';
import { leesTeamWedstrijd, nieuwBord } from '../src/wedstrijd/wedstrijd';
import { codeUitLink } from '../src/screens/training/onderdelen';
import { EN as en } from '../src/i18n/en';
import { HELP_EN, HELP_NL } from '../src/help/inhoud';

/** Versie 0.31.2: delen met team bij Circuittraining; overal zowel een link als delen met team. */

const eigenOefening = (id: string) => ({ ...nieuweEigen(nieuweTekening('leeg'), 'veld', 1, id), naam: 'Mijn rondo', categorieen: ['techniek'] });

const club = (): ClubTraining => ({
  ...nieuweClub('mini-5-7', 1000, 'c1'),
  naam: 'Maandag',
  datums: ['2026-11-09', '2026-11-11'],
  kinderen: 24,
  groepjes: 6,
  trainers: ['Testtrainer 1'],
  blokken: { techniek: 'eigen-a', partijvormen: 'veld-mt-3-tegen-3' },
  stationTrainers: { 1: 'Testtrainer 1' },
  veldTrainers: { 2: 'Testtrainer 2' },
  afgevinkt: ['1:pionnen'],
});

describe('circuittraining in een team', () => {
  it('heen en terug: alles van het plan komt mee, de afvinklijst niet', () => {
    const o = eigenOefening('eigen-a');
    const g = leesTeamClub(voorTeam(club(), [o]))!;
    expect(g).toMatchObject({ naam: 'Maandag', datums: ['2026-11-09', '2026-11-11'], kinderen: 24, groepjes: 6, leeftijd: 'mini-5-7', trainers: ['Testtrainer 1'], stationTrainers: { 1: 'Testtrainer 1' }, veldTrainers: { 2: 'Testtrainer 2' } });
    expect(g.blokken).toEqual({ techniek: 'eigen-a', partijvormen: 'veld-mt-3-tegen-3' });
    expect(g.eigen?.map((x) => x.id)).toEqual(['eigen-a']);
    expect(voorTeam(club())).not.toContain('afgevinkt');
  });
  it('alleen oefeningen die erin zitten gaan mee', () => {
    expect(leesTeamClub(voorTeam(club(), [eigenOefening('eigen-a'), eigenOefening('eigen-b')]))!.eigen?.map((x) => x.id)).toEqual(['eigen-a']);
  });
  it('kapot of vreemd item: geen crash', () => {
    for (const data of ['', '{', '{}', 'null', '{"club":1}', '{"club":{}}']) expect(leesTeamClub(data)).toBeNull();
    const g = leesTeamClub('{"club":{"blokken":{"techniek":"veld-x","onzin":"y","afwerken":3},"groepjes":99,"kinderen":"veel"},"eigen":[{"id":"kapot"}]}')!;
    expect(g.blokken).toEqual({ techniek: 'veld-x' });
    expect(g).toMatchObject({ groepjes: 8, kinderen: 30, leeftijd: 'mini-5-7' });
    expect(g.eigen).toBeUndefined();
  });
  it('kopiëren: nieuwe eigen circuittraining, met de nieuwe id van een meegekomen oefening', () => {
    const g = leesTeamClub(voorTeam(club(), [eigenOefening('eigen-a')]))!;
    const kopie = uitGedeeldeClub(g, new Map([['eigen-a', 'eigen-nieuw']]), 5000, 'c2');
    expect(kopie).toMatchObject({ id: 'c2', naam: 'Maandag', afgevinkt: [], gemaakt: 5000, gewijzigd: 5000 });
    expect(kopie.blokken).toEqual({ techniek: 'eigen-nieuw', partijvormen: 'veld-mt-3-tegen-3' });
    expect(kopie).not.toHaveProperty('eigen');
  });
  it('materiaal werkt ook op een gedeelde circuittraining', () => {
    const g = leesTeamClub(voorTeam(club()))!;
    const m = materiaal(g, vindOefening);
    expect(m.extra.length).toBeGreaterThan(0);
  });
  it('de deellink blijft werken na het herschrijven van het lezen', () => {
    const c = club();
    const g = uitCode(naarCode(c, [eigenOefening('eigen-a')]))!;
    expect(g).toMatchObject({ naam: 'Maandag', groepjes: 6, kinderen: 24, blokken: c.blokken, stationTrainers: { 1: 'Testtrainer 1' } });
    expect(g.eigen?.[0]).toMatchObject({ id: 'eigen-a', eigen: true });
  });
  it('adressen', () => {
    expect(leesHash('#/team/t1/club/c1')).toEqual({ naam: 'teamclub', id: 't1', item: 'c1' });
    expect(leesHash('#/team/t1/club/c1/station/3')).toEqual({ naam: 'teamclub', id: 't1', item: 'c1', station: 3 });
    expect(leesHash('#/team/t1/club/c1/partij')).toEqual({ naam: 'teamclub', id: 't1', item: 'c1', partij: true });
    expect(leesHash('#/team/t1/training/x')).toEqual({ naam: 'teamtraining', id: 't1', item: 'x' });
  });
});

describe('eigen oefening delen via een link', () => {
  it('heen en terug', () => {
    const o = eigenOefening('eigen-a');
    const code = oefeningNaarCode(voorDelen(o));
    expect(leesHash(`#/o/${code}`)).toEqual({ naam: 'oefening-gedeeld', code });
    expect(oefeningUitCode(code)).toMatchObject({ id: 'eigen-a', naam: 'Mijn rondo', eigen: true });
    expect(codeUitLink(`https://x.nl/trainersapp/#/o/${code}`, 'o')).toBe(code);
  });
  it('een kapotte link of iets anders dan een eigen oefening', () => {
    expect(oefeningUitCode('kapot')).toBeNull();
    expect(oefeningUitCode(oefeningNaarCode({ id: 'veld-af-cutback' } as never))).toBeNull();
  });
});

describe('wat de ontvanger niet heeft, gaat mee', () => {
  const team = (id: string, item: string): Team => ({
    id,
    naam: 'JO9',
    code: 'ABC234',
    maker: 'a',
    rol: 'lid',
    leden: [],
    items: [{ id: item, soort: 'oefening', naam: 'Team rondo', data: JSON.stringify(eigenOefening(item)), eigenaar: 'a', eigenaarNaam: 'Testtrainer 1', gewijzigd: 1 }],
  });
  beforeEach(() => {
    teams.zet([team('t1', 'eigen-x')]);
    eigenOefeningen.importeer([eigenOefening('eigen-m')]);
  });
  it('eigen oefeningen en oefeningen uit een team; ingebouwde niet', () => {
    const id = teamOefeningId('t1', 'eigen-x');
    const { eigen, nieuwId } = meeTeNemen(['veld-mt-3-tegen-3', 'eigen-m', id, 'eigen-m']);
    expect(eigen.map((o) => o.id).sort()).toEqual(['eigen-m', 'eigen-x']);
    expect(eigen.every((o) => !o.team)).toBe(true);
    expect(nieuwId(id)).toBe('eigen-x');
    expect(nieuwId('veld-mt-3-tegen-3')).toBe('veld-mt-3-tegen-3');
  });
  it('met hetzelfde team delen: die oefening hebben de leden al', () => {
    const id = teamOefeningId('t1', 'eigen-x');
    const { eigen, nieuwId } = meeTeNemen([id], 't1');
    expect(eigen).toEqual([]);
    expect(nieuwId(id)).toBe(id);
    expect(meeTeNemen([id], 't2').eigen.map((o) => o.id)).toEqual(['eigen-x']);
  });
});

describe('borden uit een team', () => {
  it('eigen bord uit een voorbeeldtactiek houdt zijn uitleg en soort', () => {
    const b = { ...nieuwBord('hervatting', nieuweTekening('leeg'), 'Corner kort'), tactiek: 'corner-kort' };
    const x = leesTeamWedstrijd('bord', JSON.stringify(b));
    expect(x).toMatchObject({ soort: 'bord', bord: { naam: 'Corner kort', soort: 'hervatting', tactiek: 'corner-kort' } });
  });
  it('gewoon bord en kapot item', () => {
    const b = nieuwBord('tactiek', nieuweTekening('leeg'), 'Druk');
    const x = leesTeamWedstrijd('bord', JSON.stringify(b));
    expect(x).toMatchObject({ bord: { soort: 'tactiek' } });
    expect(x).not.toHaveProperty('bord.tactiek');
    expect(leesTeamWedstrijd('bord', '{')).toBeNull();
  });
});

describe('overal beide manieren van delen', () => {
  const lees = (f: string) => readFileSync(`src/screens/${f}`, 'utf8');
  it('elk scherm heeft een link en Delen met team', () => {
    expect(lees('training/TrainingBewerk.tsx')).toMatch(/soort="training"/);
    expect(lees('club/ClubBewerk.tsx')).toMatch(/soort="clubtraining"/);
    expect(lees('club/ClubBewerk.tsx')).toMatch(/clubLink\(/);
    expect(lees('OefeningDetail.tsx')).toMatch(/soort="oefening"/);
    expect(lees('OefeningDetail.tsx')).toMatch(/DeelOefeningKnop/);
    expect(lees('wedstrijd/Wedstrijd.tsx')).toMatch(/soort="opstelling"/);
    expect(lees('wedstrijd/Wedstrijd.tsx')).toMatch(/soort="bord"/);
  });
  it('de regels kennen het nieuwe soort, en alleen dat is erbij', () => {
    expect(readFileSync('firestore.rules', 'utf8')).toContain("soort in ['oefening', 'training', 'opstelling', 'bord', 'clubtraining']");
  });
  it('Help en Engels', () => {
    const tekst = (l: typeof HELP_NL) => l.flatMap((o) => o.tekst).join(' ');
    expect(tekst(HELP_NL)).toMatch(/circuittraining, eigen oefening, opstelling, tactiekbord of spelhervatting kies je \*\*Delen met team\*\*/);
    expect(tekst(HELP_EN)).toMatch(/circuit session, your own drill, line-up, tactics board or set piece, choose \*\*Share with team\*\*/);
    expect(en['Kopiëren naar mijn circuittrainingen']).toBe('Copy to my circuit sessions');
    expect(en['Gedeelde circuittrainingen']).toBe('Shared circuit sessions');
  });
});
