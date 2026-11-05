import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, getDocs, collection, setDoc, updateDoc, writeBatch, type Firestore } from 'firebase/firestore';

// Beveiligingsregels (firestore.rules) tegen de emulator: npm run test:online.
let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-toptraining',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
afterAll(async () => {
  await env.cleanup();
});
beforeEach(async () => {
  await env.clearFirestore();
});

const db = (uid: string | null): Firestore => (uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore()) as unknown as Firestore;

/** Team aanmaken zoals de app dat doet: team, maker als beheerder en de code in één batch. */
async function maakTeam(d: Firestore, uid: string, team = 't1', code = 'ABC234') {
  const b = writeBatch(d);
  b.set(doc(d, 'teams', team), { naam: 'JO11-1', code, maker: uid, gemaakt: 1 });
  b.set(doc(d, 'teams', team, 'leden', uid), { rol: 'beheerder', naam: 'Testtrainer 1', sinds: 1 });
  b.set(doc(d, 'teamCodes', code), { team });
  await b.commit();
}
const join = (d: Firestore, uid: string, code: string, team = 't1') => setDoc(doc(d, 'teams', team, 'leden', uid), { rol: 'lid', naam: 'Testtrainer 2', sinds: 2, code });

describe('eigen gegevens', () => {
  it('alleen je eigen document en eigen oefeningen/trainingen', async () => {
    await assertSucceeds(setDoc(doc(db('a'), 'users', 'a'), { naam: 'Testtrainer A', teams: [], favorieten: ['veld-pt-derde-man'] }));
    await assertSucceeds(setDoc(doc(db('a'), 'users', 'a', 'oefeningen', 'eigen-1'), { data: '{"naam":"x"}', gewijzigd: 1 }));
    await assertSucceeds(setDoc(doc(db('a'), 'users', 'a', 'trainingen', 'x1'), { data: '{}', gewijzigd: 1 }));
    await assertSucceeds(getDoc(doc(db('a'), 'users', 'a', 'oefeningen', 'eigen-1')));
    // Een ander niet: lezen noch schrijven.
    await assertFails(getDoc(doc(db('b'), 'users', 'a')));
    await assertFails(getDoc(doc(db('b'), 'users', 'a', 'oefeningen', 'eigen-1')));
    await assertFails(getDocs(collection(db('b'), 'users', 'a', 'trainingen')));
    await assertFails(setDoc(doc(db('b'), 'users', 'a', 'oefeningen', 'eigen-2'), { data: '{}', gewijzigd: 1 }));
    // Niet ingelogd: niets.
    await assertFails(getDoc(doc(db(null), 'users', 'a')));
    // Alleen bekende velden en collecties.
    await assertFails(setDoc(doc(db('a'), 'users', 'a'), { naam: 'Testtrainer A', admin: true }));
    await assertFails(setDoc(doc(db('a'), 'users', 'a', 'geheim', 'x'), { data: '{}', gewijzigd: 1 }));
    await assertFails(setDoc(doc(db('a'), 'users', 'a', 'oefeningen', 'e'), { data: '', gewijzigd: 1 }));
    await assertSucceeds(deleteDoc(doc(db('a'), 'users', 'a', 'oefeningen', 'eigen-1')));
  });
});

describe('teams', () => {
  it('team aanmaken: alleen met jezelf als beheerder en een geldige code, in één keer', async () => {
    await assertSucceeds(maakTeam(db('a'), 'a'));
    // Code met verwarrende tekens (0, O, 1, I) mag niet.
    await assertFails(maakTeam(db('a'), 'a', 't2', 'ABC0O1'));
    // Iemand anders als maker invullen mag niet.
    const dc = db('c');
    const b = writeBatch(dc);
    b.set(doc(dc, 'teams', 't3'), { naam: 'X', code: 'XYZ234', maker: 'a', gemaakt: 1 });
    b.set(doc(dc, 'teams', 't3', 'leden', 'c'), { rol: 'beheerder', naam: 'C', sinds: 1 });
    b.set(doc(dc, 'teamCodes', 'XYZ234'), { team: 't3' });
    await assertFails(b.commit());
    // Een bestaande code overnemen kan niet (update van teamCodes is niet toegestaan).
    await assertFails(maakTeam(db('c'), 'c', 't4', 'ABC234'));
    // Jezelf beheerder maken van een bestaand team kan niet.
    await assertFails(setDoc(doc(db('c'), 'teams', 't1', 'leden', 'c'), { rol: 'beheerder', naam: 'C', sinds: 1 }));
  });

  it('joinen met de juiste code; niet-leden zien niets', async () => {
    await maakTeam(db('a'), 'a');
    // Code opzoeken mag (get), alle codes opvragen niet (list).
    await assertSucceeds(getDoc(doc(db('b'), 'teamCodes', 'ABC234')));
    await assertFails(getDocs(collection(db('b'), 'teamCodes')));
    // Niet-lid: team en items niet te lezen.
    await assertFails(getDoc(doc(db('b'), 'teams', 't1')));
    await assertFails(getDocs(collection(db('b'), 'teams', 't1', 'items')));
    // Verkeerde code: niet.
    await assertFails(join(db('b'), 'b', 'ZZZ999'));
    // Iemand anders laten joinen: niet.
    await assertFails(setDoc(doc(db('b'), 'teams', 't1', 'leden', 'x'), { rol: 'lid', naam: 'X', sinds: 1, code: 'ABC234' }));
    await assertSucceeds(join(db('b'), 'b', 'ABC234'));
    await assertSucceeds(getDoc(doc(db('b'), 'teams', 't1')));
    await assertSucceeds(getDocs(collection(db('b'), 'teams', 't1', 'leden')));
    // Een lid kan zichzelf geen beheerder maken.
    await assertFails(updateDoc(doc(db('b'), 'teams', 't1', 'leden', 'b'), { rol: 'beheerder' }));
  });

  it('gedeelde items: delen, eigen items aanpassen en terugtrekken, niet die van anderen', async () => {
    await maakTeam(db('a'), 'a');
    await join(db('b'), 'b', 'ABC234');
    const item = (eigenaar: string) => ({ soort: 'oefening', data: '{"naam":"Rondo"}', naam: 'Rondo', eigenaar, eigenaarNaam: 'B', gewijzigd: 1 });
    await assertSucceeds(setDoc(doc(db('b'), 'teams', 't1', 'items', 'i1'), item('b')));
    // Namens een ander delen: niet.
    await assertFails(setDoc(doc(db('b'), 'teams', 't1', 'items', 'i2'), item('a')));
    // Iedereen in het team kan het lezen.
    await assertSucceeds(getDoc(doc(db('a'), 'teams', 't1', 'items', 'i1')));
    // Eigen item aanpassen: ja; andermans item aanpassen: nee (ook niet als beheerder).
    await assertSucceeds(updateDoc(doc(db('b'), 'teams', 't1', 'items', 'i1'), { data: '{"naam":"Rondo 2"}', gewijzigd: 2 }));
    await assertFails(updateDoc(doc(db('a'), 'teams', 't1', 'items', 'i1'), { data: '{"naam":"Weg"}', gewijzigd: 3 }));
    await assertSucceeds(setDoc(doc(db('a'), 'teams', 't1', 'items', 'i3'), item('a')));
    // Lid b kan het item van beheerder a niet verwijderen; a (beheerder) kan dat van b wel.
    await assertFails(deleteDoc(doc(db('b'), 'teams', 't1', 'items', 'i3')));
    await assertSucceeds(deleteDoc(doc(db('a'), 'teams', 't1', 'items', 'i1')));
    // Niet-lid kan niet delen.
    await assertFails(setDoc(doc(db('c'), 'teams', 't1', 'items', 'i4'), item('c')));
  });

  it('gedeelde circuittraining: zelfde rechten als de andere items, en verder niets ruimer', async () => {
    await maakTeam(db('a'), 'a');
    await join(db('b'), 'b', 'ABC234');
    const item = (eigenaar: string, soort = 'clubtraining') => ({ soort, data: '{"club":{"blokken":{}},"eigen":[]}', naam: 'Maandag', eigenaar, eigenaarNaam: 'Testtrainer', gewijzigd: 1 });
    // Delen door een lid: ja. Namens een ander of als niet-lid: nee.
    await assertSucceeds(setDoc(doc(db('b'), 'teams', 't1', 'items', 'c1'), item('b')));
    await assertFails(setDoc(doc(db('b'), 'teams', 't1', 'items', 'c2'), item('a')));
    await assertFails(setDoc(doc(db('c'), 'teams', 't1', 'items', 'c3'), item('c')));
    // Lezen: leden wel, anderen niet.
    await assertSucceeds(getDoc(doc(db('a'), 'teams', 't1', 'items', 'c1')));
    await assertFails(getDoc(doc(db('c'), 'teams', 't1', 'items', 'c1')));
    // Aanpassen: alleen de eigenaar, ook geen beheerder.
    await assertSucceeds(updateDoc(doc(db('b'), 'teams', 't1', 'items', 'c1'), { naam: 'Dinsdag', gewijzigd: 2 }));
    await assertFails(updateDoc(doc(db('a'), 'teams', 't1', 'items', 'c1'), { naam: 'Weg', gewijzigd: 3 }));
    // Terugtrekken door de eigenaar.
    await assertSucceeds(deleteDoc(doc(db('b'), 'teams', 't1', 'items', 'c1')));
    // Lid verwijdert niet wat een ander deelde; de beheerder wel.
    await assertSucceeds(setDoc(doc(db('a'), 'teams', 't1', 'items', 'c4'), item('a')));
    await assertFails(deleteDoc(doc(db('b'), 'teams', 't1', 'items', 'c4')));
    await assertSucceeds(setDoc(doc(db('b'), 'teams', 't1', 'items', 'c5'), item('b')));
    await assertSucceeds(deleteDoc(doc(db('a'), 'teams', 't1', 'items', 'c5')));
    // Andere soorten en extra velden blijven verboden.
    await assertFails(setDoc(doc(db('b'), 'teams', 't1', 'items', 'c6'), item('b', 'circuittraining')));
    await assertFails(setDoc(doc(db('b'), 'teams', 't1', 'items', 'c7'), { ...item('b'), extra: 1 }));
    // De grens van 500 KB geldt ook hier.
    await assertFails(setDoc(doc(db('b'), 'teams', 't1', 'items', 'c8'), { ...item('b'), data: 'x'.repeat(500001) }));
    await assertSucceeds(setDoc(doc(db('b'), 'teams', 't1', 'items', 'c9'), { ...item('b'), data: 'x'.repeat(500000) }));
  });

  it('deellinks: lezen met de code, geen lijst, aanmaken op eigen naam met een grens, intrekken alleen door de maker', async () => {
    const CODE = 'ABCDEFGHJKMN';
    const link = (maker: string) => ({ soort: 'c', data: 'zABC', maker, gemaakt: 1 });
    // Aanmaken kan alleen ingelogd (ook anoniem) en op eigen naam.
    await assertFails(setDoc(doc(db(null), 'links', CODE), link('a')));
    await assertFails(setDoc(doc(db('a'), 'links', CODE), link('b')));
    await assertSucceeds(setDoc(doc(db('a'), 'links', CODE), link('a')));
    // Lezen kan iedereen die de code kent, ook niet ingelogd. Een lijst opvragen niet, ook niet als maker.
    await assertSucceeds(getDoc(doc(db(null), 'links', CODE)));
    await assertSucceeds(getDoc(doc(db('b'), 'links', CODE)));
    await assertFails(getDocs(collection(db(null), 'links')));
    await assertFails(getDocs(collection(db('a'), 'links')));
    // Wijzigen kan niemand, ook de maker niet; een bestaande code overschrijven dus ook niet.
    await assertFails(updateDoc(doc(db('a'), 'links', CODE), { data: 'zXYZ' }));
    await assertFails(updateDoc(doc(db('b'), 'links', CODE), { data: 'zXYZ' }));
    await assertFails(setDoc(doc(db('a'), 'links', CODE), link('a')));
    await assertFails(setDoc(doc(db('b'), 'links', CODE), link('b')));
    // Intrekken: alleen de maker.
    await assertFails(deleteDoc(doc(db(null), 'links', CODE)));
    await assertFails(deleteDoc(doc(db('b'), 'links', CODE)));
    await assertSucceeds(deleteDoc(doc(db('a'), 'links', CODE)));
    // Grens, velden, soort en vorm van de code.
    await assertFails(setDoc(doc(db('a'), 'links', 'ABCDEFGHJKMP'), { ...link('a'), data: 'x'.repeat(200001) }));
    await assertSucceeds(setDoc(doc(db('a'), 'links', 'ABCDEFGHJKMQ'), { ...link('a'), data: 'x'.repeat(200000) }));
    await assertFails(setDoc(doc(db('a'), 'links', 'ABCDEFGHJKMR'), { ...link('a'), extra: 1 }));
    await assertFails(setDoc(doc(db('a'), 'links', 'ABCDEFGHJKMS'), { ...link('a'), soort: 'x' }));
    await assertFails(setDoc(doc(db('a'), 'links', 'ABCDEFGHJKMT'), { ...link('a'), data: '' }));
    await assertFails(setDoc(doc(db('a'), 'links', 'kort'), link('a')));
    await assertFails(setDoc(doc(db('a'), 'links', 'abcdefghjkmn'), link('a')));
  });

  it('rollen: beheerders verwijderen leden, maken beheerders, vernieuwen de code; leden niet', async () => {
    await maakTeam(db('a'), 'a');
    await join(db('b'), 'b', 'ABC234');
    await join(db('c'), 'c', 'ABC234');
    // Lid b mag c niet verwijderen en de naam/code niet wijzigen.
    await assertFails(deleteDoc(doc(db('b'), 'teams', 't1', 'leden', 'c')));
    await assertFails(updateDoc(doc(db('b'), 'teams', 't1'), { naam: 'Gekaapt' }));
    // Beheerder a maakt b beheerder.
    await assertSucceeds(updateDoc(doc(db('a'), 'teams', 't1', 'leden', 'b'), { rol: 'beheerder' }));
    // Nu kan b c verwijderen.
    await assertSucceeds(deleteDoc(doc(db('b'), 'teams', 't1', 'leden', 'c')));
    // Code vernieuwen: team.code + oude code weg + nieuwe code, in één keer.
    const d = db('a');
    const batch = writeBatch(d);
    batch.update(doc(d, 'teams', 't1'), { code: 'NEW234' });
    batch.delete(doc(d, 'teamCodes', 'ABC234'));
    batch.set(doc(d, 'teamCodes', 'NEW234'), { team: 't1' });
    await assertSucceeds(batch.commit());
    // Met de oude code joinen lukt niet meer.
    await assertFails(join(db('c'), 'c', 'ABC234'));
    await assertSucceeds(join(db('c'), 'c', 'NEW234'));
    // De maker veranderen kan niet.
    await assertFails(updateDoc(doc(db('a'), 'teams', 't1'), { maker: 'b' }));
  });

  it('verlaten en opheffen', async () => {
    await maakTeam(db('a'), 'a');
    await join(db('b'), 'b', 'ABC234');
    await setDoc(doc(db('b'), 'teams', 't1', 'items', 'i1'), { soort: 'training', data: '{}', naam: 'Dinsdag', eigenaar: 'b', eigenaarNaam: 'B', gewijzigd: 1 });
    // Lid kan het team niet opheffen.
    await assertFails(deleteDoc(doc(db('b'), 'teams', 't1')));
    // Lid verlaat zelf het team; daarna geen toegang meer.
    await assertSucceeds(deleteDoc(doc(db('b'), 'teams', 't1', 'leden', 'b')));
    await assertFails(getDoc(doc(db('b'), 'teams', 't1')));
    // Beheerder heft op: items, leden, code, team, tot slot zichzelf.
    const d = db('a');
    await assertSucceeds(deleteDoc(doc(d, 'teams', 't1', 'items', 'i1')));
    await assertSucceeds(deleteDoc(doc(d, 'teamCodes', 'ABC234')));
    await assertSucceeds(deleteDoc(doc(d, 'teams', 't1')));
    await assertSucceeds(deleteDoc(doc(d, 'teams', 't1', 'leden', 'a')));
  });
});
