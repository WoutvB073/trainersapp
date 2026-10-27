import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, query, setDoc, updateDoc, writeBatch, type CollectionReference, type Firestore, type Unsubscribe } from 'firebase/firestore';
import type { Rol, Team, TeamItem, TeamLid } from '../engine/teams';
import { isGeldigeCode, nieuweCode, normaliseerCode } from './samenvoegen';
import { t as vt, vergelijk } from '../i18n/t';

/**
 * Teams in Firestore (zie firestore.rules voor wat wie mag). Alle functies krijgen de database en wie je bent mee,
 * zodat ze ook in tests met twee accounts werken.
 */
export interface Ik {
  db: Firestore;
  uid: string;
  naam: string;
}

export class TeamFout extends Error {}

const teamPad = (db: Firestore, id: string) => doc(db, 'teams', id);
const lidPad = (db: Firestore, team: string, uid: string) => doc(db, 'teams', team, 'leden', uid);
const itemPad = (db: Firestore, team: string, item: string) => doc(db, 'teams', team, 'items', item);

/** Team aanmaken: jij bent beheerder en krijgt een code (bij een botsing een nieuwe code). */
export async function maakTeam(ik: Ik, naam: string, toeval: () => number = Math.random): Promise<{ id: string; code: string }> {
  const schoon = naam.trim().slice(0, 60);
  if (!schoon) throw new TeamFout(vt('Geef het team een naam'));
  for (let poging = 0; poging < 6; poging++) {
    const id = doc(collection(ik.db, 'teams')).id;
    const code = nieuweCode(toeval);
    const b = writeBatch(ik.db);
    b.set(teamPad(ik.db, id), { naam: schoon, code, maker: ik.uid, gemaakt: Date.now() });
    b.set(lidPad(ik.db, id, ik.uid), { rol: 'beheerder', naam: ik.naam, sinds: Date.now() });
    b.set(doc(ik.db, 'teamCodes', code), { team: id });
    try {
      await b.commit();
    } catch {
      // Waarschijnlijk bestond de code al: opnieuw met een andere code.
      continue;
    }
    await setDoc(doc(ik.db, 'users', ik.uid), { teams: arrayUnion(id) }, { merge: true });
    return { id, code };
  }
  throw new TeamFout(vt('Team aanmaken lukte niet. Probeer het nog eens.'));
}

/** Team joinen met een code. */
export async function joinTeam(ik: Ik, invoer: string): Promise<string> {
  const code = normaliseerCode(invoer);
  if (!isGeldigeCode(code)) throw new TeamFout(vt('Een teamcode heeft 6 tekens (letters en cijfers)'));
  const c = await getDoc(doc(ik.db, 'teamCodes', code));
  if (!c.exists()) throw new TeamFout(vt('Deze code bestaat niet (meer). Vraag de beheerder om de nieuwe code.'));
  const team = (c.data() as { team: string }).team;
  const bestaand = await getDoc(lidPad(ik.db, team, ik.uid)).catch(() => null);
  if (!bestaand?.exists()) await setDoc(lidPad(ik.db, team, ik.uid), { rol: 'lid', naam: ik.naam, sinds: Date.now(), code });
  await setDoc(doc(ik.db, 'users', ik.uid), { teams: arrayUnion(team) }, { merge: true });
  return team;
}

/** Team verlaten. Ben je de laatste beheerder, dan wordt het langst zittende andere lid beheerder. */
export async function verlaatTeam(ik: Ik, team: string): Promise<void> {
  const leden = await haalLeden(ik.db, team);
  const ikZelf = leden.find((l) => l.uid === ik.uid);
  const anderen = leden.filter((l) => l.uid !== ik.uid);
  // De laatste die vertrekt: het team (met code en items) helemaal opruimen.
  if (!anderen.length && ikZelf?.rol === 'beheerder') return hefTeamOp(ik, team);
  if (ikZelf?.rol === 'beheerder' && !anderen.some((l) => l.rol === 'beheerder') && anderen.length) {
    const opvolger = [...anderen].sort((a, b) => a.sinds - b.sinds)[0]!;
    await updateDoc(lidPad(ik.db, team, opvolger.uid), { rol: 'beheerder' });
  }
  await deleteDoc(lidPad(ik.db, team, ik.uid));
  await setDoc(doc(ik.db, 'users', ik.uid), { teams: arrayRemove(team) }, { merge: true });
}

/** Alle teams waar ik in zit (van de server, niet uit de lokale lijst). */
export async function mijnTeams(ik: Ik): Promise<string[]> {
  const u = await getDoc(doc(ik.db, 'users', ik.uid));
  const ids = (u.data()?.teams as string[] | undefined) ?? [];
  return ids.filter((x) => typeof x === 'string');
}

/** Account weg: mijn gedeelde items uit elk team, dan het team verlaten (de laatste heft het op). */
export async function verlaatAlleTeams(ik: Ik): Promise<void> {
  for (const team of await mijnTeams(ik)) {
    const t = await getDoc(teamPad(ik.db, team)).catch(() => null);
    if (!t?.exists()) {
      await setDoc(doc(ik.db, 'users', ik.uid), { teams: arrayRemove(team) }, { merge: true });
      continue;
    }
    const items = await eenmalig(collection(ik.db, 'teams', team, 'items'));
    for (const d of items.docs) if ((d.data() as { eigenaar?: string }).eigenaar === ik.uid) await deleteDoc(d.ref);
    await verlaatTeam(ik, team);
  }
}

/** Team opheffen (beheerder): items, leden, code en team weg; jezelf als laatste. */
export async function hefTeamOp(ik: Ik, team: string): Promise<void> {
  const t = await getDoc(teamPad(ik.db, team));
  if (!t.exists()) throw new TeamFout(vt('Team niet gevonden'));
  const code = (t.data() as { code: string }).code;
  const items = await eenmalig(collection(ik.db, 'teams', team, 'items'));
  const leden = await eenmalig(collection(ik.db, 'teams', team, 'leden'));
  let b = writeBatch(ik.db);
  let n = 0;
  const voegToe = async (f: () => void) => {
    f();
    if (++n >= 400) {
      await b.commit();
      b = writeBatch(ik.db);
      n = 0;
    }
  };
  for (const d of items.docs) await voegToe(() => b.delete(d.ref));
  for (const d of leden.docs) if (d.id !== ik.uid) await voegToe(() => b.delete(d.ref));
  await b.commit();
  const b2 = writeBatch(ik.db);
  b2.delete(doc(ik.db, 'teamCodes', code));
  b2.delete(teamPad(ik.db, team));
  await b2.commit();
  await deleteDoc(lidPad(ik.db, team, ik.uid));
  await setDoc(doc(ik.db, 'users', ik.uid), { teams: arrayRemove(team) }, { merge: true });
}

/** Nieuwe code (beheerder): de oude werkt daarna niet meer. */
export async function vernieuwCode(ik: Ik, team: string, toeval: () => number = Math.random): Promise<string> {
  const t = await getDoc(teamPad(ik.db, team));
  const oud = (t.data() as { code: string }).code;
  for (let poging = 0; poging < 6; poging++) {
    const code = nieuweCode(toeval);
    const b = writeBatch(ik.db);
    b.update(teamPad(ik.db, team), { code });
    b.delete(doc(ik.db, 'teamCodes', oud));
    b.set(doc(ik.db, 'teamCodes', code), { team });
    try {
      await b.commit();
      return code;
    } catch {
      continue;
    }
  }
  throw new TeamFout(vt('Nieuwe code maken lukte niet'));
}

export const zetRol = (ik: Ik, team: string, uid: string, rol: Rol) => updateDoc(lidPad(ik.db, team, uid), { rol });
export const verwijderLid = (ik: Ik, team: string, uid: string) => deleteDoc(lidPad(ik.db, team, uid));

/** Iets delen met het team (of je eigen gedeelde item bijwerken). */
export async function deelItem(ik: Ik, team: string, item: { id: string; soort: TeamItem['soort']; naam: string; data: string }): Promise<void> {
  await setDoc(itemPad(ik.db, team, item.id), {
    soort: item.soort,
    data: item.data,
    naam: (item.naam || vt('Zonder naam')).slice(0, 120),
    eigenaar: ik.uid,
    eigenaarNaam: ik.naam,
    gewijzigd: Date.now(),
  });
}

/** Terugtrekken (eigen item) of verwijderen (beheerder). */
export const verwijderItem = (ik: Ik, team: string, item: string) => deleteDoc(itemPad(ik.db, team, item));

/**
 * Eenmalig lezen als aparte query (met een limit): niet dezelfde als die van een luisteraar. Na vertrekken en meteen
 * opnieuw joinen in dezelfde app bleef een gewone getDocs op dezelfde lijst anders hangen (gezien met de emulator).
 */
function eenmalig(c: CollectionReference) {
  return getDocs(query(c, limit(5000)));
}

async function haalLeden(db: Firestore, team: string): Promise<TeamLid[]> {
  const s = await eenmalig(collection(db, 'teams', team, 'leden'));
  return s.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<TeamLid, 'uid'>) }));
}

/**
 * Alle teams van deze gebruiker volgen (team, leden, items). Geeft steeds de hele lijst door. Een team waar je niet meer
 * in zit (verwijderd of opgeheven) haalt hij uit je lijst.
 */
export function volgTeams(ik: Ik, opLijst: (teams: Team[]) => void, opFout: () => void = () => {}): Unsubscribe {
  // Luisteraars nooit starten of stoppen binnen een callback van Firestore (dan kan een lopende schrijfactie blijven
  // hangen of verloren gaan, gezien met de emulator): altijd net erna.
  let gestopt = false;
  const later = (f: () => void) =>
    setTimeout(() => {
      if (!gestopt) f();
    }, 0);
  const per = new Map<string, { stop: Unsubscribe[]; team?: Omit<Team, 'leden' | 'items' | 'rol'>; leden: TeamLid[]; items: TeamItem[] }>();
  const melden = () => {
    const lijst: Team[] = [];
    for (const [id, x] of per) {
      if (!x.team) continue;
      const ikLid = x.leden.find((l) => l.uid === ik.uid);
      if (!ikLid) continue;
      lijst.push({ ...x.team, id, rol: ikLid.rol, leden: [...x.leden].sort((a, b) => a.sinds - b.sinds), items: [...x.items].sort((a, b) => b.gewijzigd - a.gewijzigd) });
    }
    opLijst(lijst.sort((a, b) => vergelijk(a.naam, b.naam)));
  };
  const weg = (id: string, ookUitLijst: boolean) => {
    const x = per.get(id);
    x?.stop.forEach((s) => s());
    per.delete(id);
    if (ookUitLijst) void setDoc(doc(ik.db, 'users', ik.uid), { teams: arrayRemove(id) }, { merge: true }).catch(() => {});
    melden();
  };
  const volg = (id: string) => {
    const x: { stop: Unsubscribe[]; team?: Omit<Team, 'leden' | 'items' | 'rol'>; leden: TeamLid[]; items: TeamItem[] } = { stop: [], leden: [], items: [] };
    per.set(id, x);
    const nietMeer = () => later(() => weg(id, true));
    x.stop.push(
      onSnapshot(
        teamPad(ik.db, id),
        (s) => {
          // Alleen op gegevens van de server besluiten dat het team weg is (de cache kan nog leeg zijn).
          if (!s.exists()) return s.metadata.fromCache ? undefined : nietMeer();
          const d = s.data() as { naam: string; code: string; maker: string };
          x.team = { id, naam: d.naam, code: d.code, maker: d.maker };
          melden();
        },
        nietMeer,
      ),
      onSnapshot(
        collection(ik.db, 'teams', id, 'leden'),
        (s) => {
          x.leden = s.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<TeamLid, 'uid'>) }));
          if (!x.leden.some((l) => l.uid === ik.uid)) return s.metadata.fromCache ? undefined : nietMeer();
          melden();
        },
        nietMeer,
      ),
      onSnapshot(
        collection(ik.db, 'teams', id, 'items'),
        (s) => {
          x.items = s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TeamItem, 'id'>) }));
          melden();
        },
        nietMeer,
      ),
    );
  };
  // Alleen op door de server bevestigde stand reageren: luisteraars starten op een nog niet bevestigde schrijfactie
  // kan die schrijfactie laten verloren gaan (gezien met de emulator).
  const uitGebruiker = onSnapshot(
    doc(ik.db, 'users', ik.uid),
    { includeMetadataChanges: true },
    (s) => {
      if (s.metadata.hasPendingWrites) return;
      const ids = new Set(((s.data() as { teams?: string[] } | undefined)?.teams ?? []) as string[]);
      later(() => {
        for (const id of [...per.keys()]) if (!ids.has(id)) weg(id, false);
        for (const id of ids) if (!per.has(id)) volg(id);
        melden();
      });
      melden();
    },
    opFout,
  );
  return () => {
    gestopt = true;
    uitGebruiker();
    for (const id of [...per.keys()]) weg(id, false);
  };
}
