import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { inEmulator, leegmaken, toestel, wachtTot, opruimen } from './hulp';
import { deelItem, hefTeamOp, joinTeam, maakTeam, verlaatTeam, vernieuwCode, verwijderItem, verwijderLid, verlaatAlleTeams, volgTeams, zetRol, type Ik } from '../../src/online/teamsOnline';
import type { Team } from '../../src/engine/teams';
import { leesTeamTraining } from '../../src/engine/teams';

beforeEach(leegmaken);
afterEach(opruimen);

async function persoon(email: string, naam: string) {
  const v = await toestel(email, naam);
  const ik: Ik = { db: v.db, uid: v.uid, naam };
  let teams: Team[] = [];
  const stop = volgTeams(ik, (l) => (teams = l));
  return { ik, stop, teams: () => teams };
}

describe('teams', () => {
  it('team maken, joinen met de code, verkeerde code geeft een duidelijke melding', async () => {
    const trainer1 = await persoon('test1@example.com', 'Testtrainer 1');
    const trainer2 = await persoon('test2@example.com', 'Testtrainer 2');
    const { id, code } = await maakTeam(trainer1.ik, 'JO11-1');
    expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
    await wachtTot(() => trainer1.teams().length === 1);
    expect(trainer1.teams()[0]).toMatchObject({ id, naam: 'JO11-1', rol: 'beheerder' });
    await expect(joinTeam(trainer2.ik, 'ZZZ999')).rejects.toThrow(/bestaat niet/);
    await expect(joinTeam(trainer2.ik, 'abc')).rejects.toThrow(/6 tekens/);
    // Kleine letters en spaties maken niet uit.
    await joinTeam(trainer2.ik, ` ${code.toLowerCase().slice(0, 3)} ${code.toLowerCase().slice(3)} `);
    await wachtTot(() => trainer2.teams().length === 1 && trainer1.teams()[0]!.leden.length === 2);
    expect(trainer2.teams()[0]).toMatchObject({ naam: 'JO11-1', rol: 'lid' });
    expect(trainer1.teams()[0]!.leden.map((l) => l.naam)).toEqual(['Testtrainer 1', 'Testtrainer 2']);
    // In meerdere teams tegelijk.
    const tweede = await maakTeam(trainer2.ik, 'Keepers');
    await wachtTot(() => trainer2.teams().length === 2);
    expect(trainer2.teams().find((t) => t.id === tweede.id)?.rol).toBe('beheerder');
    trainer1.stop();
    trainer2.stop();
  });

  it('delen: oefening en training; eigen items aanpassen en terugtrekken, niet die van anderen', async () => {
    const trainer1 = await persoon('test1@example.com', 'Testtrainer 1');
    const trainer2 = await persoon('test2@example.com', 'Testtrainer 2');
    const { id, code } = await maakTeam(trainer1.ik, 'JO11-1');
    await joinTeam(trainer2.ik, code);
    const oef = { id: 'eigen-1', naam: 'Rondo', soort: 'veld', categorieen: ['positiespel'], uitleg: '', benodigdheden: [], spelersNodig: 5, keepersNodig: 0, doorwisselbaar: true, coachpunten: [], variaties: { makkelijker: [], moeilijker: [] }, tekening: { veld: { type: 'leeg' }, objecten: [] }, eigen: true };
    await deelItem(trainer1.ik, id, { id: 'eigen-1', soort: 'oefening', naam: 'Rondo', data: JSON.stringify(oef) });
    await deelItem(trainer2.ik, id, { id: 't1', soort: 'training', naam: 'Dinsdag', data: JSON.stringify({ training: { naam: 'Dinsdag', spelers: 10, keepers: 1, oefeningen: ['veld-pt-derde-man', 'eigen-1'] }, eigen: [oef] }) });
    await wachtTot(() => trainer2.teams()[0]?.items.length === 2 && trainer1.teams()[0]?.items.length === 2);
    const training = trainer2.teams()[0]!.items.find((i) => i.soort === 'training')!;
    expect(leesTeamTraining(training)?.training.oefeningen).toEqual(['veld-pt-derde-man', 'eigen-1']);
    expect(trainer2.teams()[0]!.items.find((i) => i.soort === 'oefening')).toMatchObject({ naam: 'Rondo', eigenaarNaam: 'Testtrainer 1' });
    // Testtrainer 2 mag de oefening van Testtrainer 1 niet aanpassen of terugtrekken.
    await expect(deelItem(trainer2.ik, id, { id: 'eigen-1', soort: 'oefening', naam: 'Gekaapt', data: '{}' })).rejects.toThrow();
    await expect(verwijderItem(trainer2.ik, id, 'eigen-1')).rejects.toThrow();
    // Haar eigen training wel aanpassen en terugtrekken.
    await deelItem(trainer2.ik, id, { id: 't1', soort: 'training', naam: 'Dinsdag (nieuw)', data: '{"training":{"naam":"x","spelers":1,"keepers":0,"oefeningen":[]},"eigen":[]}' });
    await wachtTot(() => trainer1.teams()[0]!.items.some((i) => i.naam === 'Dinsdag (nieuw)'));
    await verwijderItem(trainer2.ik, id, 't1');
    await wachtTot(() => trainer1.teams()[0]!.items.length === 1);
    // Beheerder Testtrainer 1 kan items van anderen wel verwijderen.
    await deelItem(trainer2.ik, id, { id: 't2', soort: 'training', naam: 'Donderdag', data: '{"training":{"naam":"x","spelers":1,"keepers":0,"oefeningen":[]},"eigen":[]}' });
    await wachtTot(() => trainer1.teams()[0]!.items.length === 2);
    await verwijderItem(trainer1.ik, id, 't2');
    await wachtTot(() => trainer2.teams()[0]!.items.length === 1);
    trainer1.stop();
    trainer2.stop();
  });

  it('rollen: beheerder maken, lid verwijderen, code vernieuwen; leden kunnen dat niet', async () => {
    const trainer1 = await persoon('test1@example.com', 'Testtrainer 1');
    const trainer2 = await persoon('test2@example.com', 'Testtrainer 2');
    const trainer3 = await persoon('test3@example.com', 'Testtrainer 3');
    const { id, code } = await maakTeam(trainer1.ik, 'JO11-1');
    await joinTeam(trainer2.ik, code);
    await joinTeam(trainer3.ik, code);
    await expect(verwijderLid(trainer2.ik, id, trainer3.ik.uid)).rejects.toThrow();
    await expect(zetRol(trainer2.ik, id, trainer2.ik.uid, 'beheerder')).rejects.toThrow();
    await expect(vernieuwCode(trainer2.ik, id)).rejects.toThrow();
    await zetRol(trainer1.ik, id, trainer2.ik.uid, 'beheerder');
    await wachtTot(() => trainer2.teams()[0]?.rol === 'beheerder');
    // Nieuwe beheerder verwijdert Testtrainer 3: Testtrainer 3 ziet het team niet meer.
    await wachtTot(() => trainer3.teams().length === 1);
    await verwijderLid(trainer2.ik, id, trainer3.ik.uid);
    await wachtTot(() => trainer3.teams().length === 0);
    // Code vernieuwen: de oude werkt niet meer, de nieuwe wel.
    const nieuw = await vernieuwCode(trainer1.ik, id);
    expect(nieuw).not.toBe(code);
    await expect(joinTeam(trainer3.ik, code)).rejects.toThrow(/bestaat niet/);
    await joinTeam(trainer3.ik, nieuw);
    await wachtTot(() => trainer3.teams().length === 1);
    trainer1.stop();
    trainer2.stop();
    trainer3.stop();
  });

  it('verlaten (laatste beheerder: een ander wordt beheerder) en opheffen', { timeout: 90000 }, async () => {
    const trainer1 = await persoon('test1@example.com', 'Testtrainer 1');
    const trainer2 = await persoon('test2@example.com', 'Testtrainer 2');
    const trainer3 = await persoon('test3@example.com', 'Testtrainer 3');
    const { id, code } = await maakTeam(trainer1.ik, 'JO11-1');
    await joinTeam(trainer2.ik, code);
    await joinTeam(trainer3.ik, code);
    await wachtTot(() => trainer3.teams().length === 1 && trainer2.teams().length === 1, 10000, 'joinen');
    // Testtrainer 1 (enige beheerder) gaat weg: Testtrainer 2 (langst lid) wordt beheerder.
    await verlaatTeam(trainer1.ik, id);
    await wachtTot(() => trainer1.teams().length === 0 && trainer2.teams()[0]?.rol === 'beheerder' && trainer2.teams()[0]!.leden.length === 2, 10000, 'opvolger: ' + JSON.stringify([trainer1.teams().length, trainer2.teams()[0]?.rol, trainer2.teams()[0]?.leden.length]));
    // Testtrainer 3 verlaat het team gewoon.
    await verlaatTeam(trainer3.ik, id);
    await wachtTot(() => trainer3.teams().length === 0, 10000, 'verlaten');
    // Testtrainer 2 heft het op.
    await joinTeam(trainer3.ik, code);
    await wachtTot(() => trainer3.teams().length === 1, 10000, 'opnieuw joinen');
    await expect(hefTeamOp(trainer3.ik, id)).rejects.toThrow();
    await hefTeamOp(trainer2.ik, id);
    await wachtTot(() => trainer2.teams().length === 0 && trainer3.teams().length === 0, 10000, 'opheffen');
    await expect(joinTeam(trainer1.ik, code)).rejects.toThrow(/bestaat niet/);
    trainer1.stop();
    trainer2.stop();
    trainer3.stop();
  });

  it('account weg (ook op een nieuw apparaat zonder teamlijst): eigen items weg, laatste lid heft het team op', { timeout: 60000 }, async () => {
    const trainer1 = await persoon('test1@example.com', 'Testtrainer 1');
    const trainer2 = await persoon('test2@example.com', 'Testtrainer 2');
    const a = await maakTeam(trainer1.ik, 'Samen');
    const b = await maakTeam(trainer1.ik, 'Alleen');
    await joinTeam(trainer2.ik, a.code);
    await deelItem(trainer1.ik, a.id, { id: 'van-1', soort: 'oefening', naam: 'Van 1', data: '{}' });
    await deelItem(trainer2.ik, a.id, { id: 'van-2', soort: 'oefening', naam: 'Van 2', data: '{}' });
    trainer1.stop();
    trainer2.stop();
    // Testtrainer 2 op een ander apparaat (geen teamlijst geladen): alleen zijn eigen item weg, het team blijft.
    const ander = await toestel('test2@example.com', 'Testtrainer 2');
    await verlaatAlleTeams({ db: ander.db, uid: ander.uid, naam: 'Testtrainer 2' });
    expect(await inEmulator(`teams/${a.id}/items`)).toEqual(['van-1']);
    expect(await inEmulator(`teams/${a.id}/leden`)).toEqual([trainer1.ik.uid]);
    // Testtrainer 1 is overal de laatste: beide teams helemaal weg (ook codes, leden en items).
    const nieuw = await toestel('test1@example.com', 'Testtrainer 1');
    await verlaatAlleTeams({ db: nieuw.db, uid: nieuw.uid, naam: 'Testtrainer 1' });
    expect(await inEmulator('teams')).toEqual([]);
    expect(await inEmulator('teamCodes')).toEqual([]);
    expect(await inEmulator(`teams/${a.id}/items`)).toEqual([]);
    expect(await inEmulator(`teams/${b.id}/leden`)).toEqual([]);
  });
});
