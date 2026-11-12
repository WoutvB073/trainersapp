import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, setDoc, writeBatch, type Unsubscribe } from 'firebase/firestore';
import { bewaardAccount, huidigeStatus, sleutelVoor, zetBewaardAccount, zetStatus, type AccountInfo } from '../engine/account';
import { eigenBackend, eigenOefeningen } from '../eigen/opslag';
import { trainingBackend, trainingen } from '../training/opslag';
import { favorieten, favorietenBackend } from '../engine/favorieten';
import { bordBackend, borden, opstellingBackend, opstellingen, spelersnamen } from '../wedstrijd/opslag';
import { clubBackend, clubtrainingen, rooster, roosterBackend } from '../clubtraining/opslag';
import { voorTeamRooster } from '../clubtraining/rooster';
import { clubNaam, metOefeningIds, oefeningIds, voorTeam } from '../clubtraining/clubtraining';
import { bordNaam, namenUitOpstellingen, opstellingNaam } from '../wedstrijd/wedstrijd';
import { abonneerThema, kiesThema, leesKeuze, type Modus, type ThemaId } from '../engine/thema';
import { abonneerTaal, kiesTaal, leesTaalKeuze } from '../i18n/taal';
import { abonneerFilters, huidigeFilters, zetFilters } from '../engine/filters';
import { isLeeftijd } from '../data/leeftijden';
import { teams, type Rol } from '../engine/teams';
import { eigenLinks, vergeetLinks } from '../engine/deellink';
import { voorDelen } from '../eigen/eigen';
import { meeTeNemen } from '../eigen/meenemen';
import type { EigenOefening } from '../model/types';
import { verbind, type Verbinding } from './firebase';
import { Synchronisatie, type Instellingen, type SyncDoelen } from './sync';
import * as T from './teamsOnline';
import { t as vt } from '../i18n/t';

/**
 * Online in de app: inloggen (e-mail en wachtwoord), synchroniseren en teams. Wordt pas geladen als je inlogt of al
 * ingelogd was (src/engine/account.ts → online()).
 */

let v: Verbinding | null = null;
let sync: Synchronisatie | null = null;
let teamsStop: Unsubscribe | null = null;
let eigenStop: (() => void) | null = null;
let namenStop: (() => void) | null = null;
let gestart: Promise<void> | null = null;
let antwoord: ((ja: boolean) => void) | null = null;

// ---------- foutmeldingen ----------

const MELDINGEN: Record<string, string> = {
  'auth/invalid-email': vt('Dit is geen geldig e-mailadres.'),
  'auth/missing-email': vt('Vul je e-mailadres in.'),
  'auth/email-already-in-use': vt('Er bestaat al een account met dit e-mailadres. Log in, of kies "Wachtwoord vergeten".'),
  'auth/weak-password': vt('Kies een wachtwoord van minstens 6 tekens.'),
  'auth/missing-password': vt('Vul je wachtwoord in.'),
  'auth/invalid-credential': vt('E-mailadres of wachtwoord klopt niet.'),
  'auth/wrong-password': vt('Het wachtwoord klopt niet.'),
  'auth/user-not-found': vt('Er is geen account met dit e-mailadres.'),
  'auth/too-many-requests': vt('Te vaak geprobeerd. Wacht even en probeer het opnieuw.'),
  'auth/network-request-failed': vt('Geen internet. Probeer het opnieuw als je verbinding hebt.'),
  'auth/requires-recent-login': vt('Log opnieuw in en probeer het daarna nog eens.'),
  'permission-denied': vt('Dat mag niet (geen toegang).'),
  unavailable: vt('Geen verbinding. Probeer het opnieuw als je internet hebt.'),
};

export function foutTekst(e: unknown): string {
  if (e instanceof T.TeamFout) return e.message;
  const code = (e as { code?: string })?.code ?? '';
  return MELDINGEN[code] ?? ((e as Error)?.message?.startsWith('Online') ? (e as Error).message : vt('Er ging iets mis. Probeer het opnieuw.'));
}

// ---------- starten ----------

/** Firebase verbinden en het inlogstatus volgen (één keer). */
export function startOnline(): Promise<void> {
  if (gestart) return gestart;
  gestart = new Promise<void>((klaar) => {
    try {
      v = verbind();
    } catch (e) {
      zetStatus({ verbonden: false, fout: foutTekst(e), sync: 'uit' });
      klaar();
      return;
    }
    zetStatus({ verbonden: true });
    let eerste = true;
    onAuthStateChanged(v.auth, (user) => {
      // Anoniem is alleen om een deellink te kunnen maken: dat is geen account.
      const p = user && !user.isAnonymous ? opIngelogd(user) : opUitgelogd();
      void p.finally(() => {
        if (eerste) {
          eerste = false;
          klaar();
        }
      });
    });
  });
  return gestart;
}

function verbinding(): Verbinding {
  if (!v) throw new Error('Online opslag is nog niet ingesteld');
  return v;
}

const info = (u: User): AccountInfo => ({ uid: u.uid, email: u.email ?? '', naam: u.displayName || (u.email ?? '').split('@')[0] || vt('Trainer') });

function opslag(): Storage | undefined {
  try {
    return localStorage;
  } catch {
    return undefined;
  }
}

async function opIngelogd(u: User): Promise<void> {
  const a = info(u);
  const vorige = bewaardAccount();
  if (vorige?.uid !== a.uid) {
    // Nieuw op dit apparaat (of een ander account): eerst vragen of de gegevens van het apparaat mee mogen.
    const gekoppeld = opslag()?.getItem(`trainersapp.gekoppeld.${a.uid}`);
    if (!gekoppeld) {
      const aantallen = {
        eigen: eigenBackend(null).laad().length,
        trainingen: trainingBackend(null).laad().length + clubBackend(null).laad().length + roosterBackend(null).laad().length,
        favorieten: favorietenBackend(null).laad().length,
        wedstrijd: opstellingBackend(null).laad().length + bordBackend(null).laad().length,
      };
      if (aantallen.eigen + aantallen.trainingen + aantallen.favorieten + aantallen.wedstrijd > 0) {
        zetStatus({ samenvoegen: aantallen });
        const ja = await new Promise<boolean>((r) => (antwoord = r));
        antwoord = null;
        zetStatus({ samenvoegen: null });
        if (ja) {
          // De gegevens van het apparaat komen in de lokale kopie van het account; de synchronisatie voegt ze samen.
          eigenBackend(a.uid).bewaar(eigenBackend(null).laad());
          trainingBackend(a.uid).bewaar(trainingBackend(null).laad());
          favorietenBackend(a.uid).bewaar(favorietenBackend(null).laad());
          opstellingBackend(a.uid).bewaar(opstellingBackend(null).laad());
          bordBackend(a.uid).bewaar(bordBackend(null).laad());
          clubBackend(a.uid).bewaar(clubBackend(null).laad());
          roosterBackend(a.uid).bewaar(roosterBackend(null).laad());
        }
      }
      opslag()?.setItem(`trainersapp.gekoppeld.${a.uid}`, String(Date.now()));
    }
    zetBewaardAccount(a);
    eigenOefeningen.wisselBackend(eigenBackend(a.uid));
    trainingen.wisselBackend(trainingBackend(a.uid));
    favorieten.wisselBackend(favorietenBackend(a.uid));
    opstellingen.wisselBackend(opstellingBackend(a.uid));
    borden.wisselBackend(bordBackend(a.uid));
    clubtrainingen.wisselBackend(clubBackend(a.uid));
    rooster.wisselBackend(roosterBackend(a.uid));
    teams.wisselAccount(a.uid);
  } else zetBewaardAccount(a);
  zetStatus({ account: a, sync: 'bezig' });
  startSync(a);
}

async function opUitgelogd(): Promise<void> {
  stopSync();
  if (bewaardAccount()) {
    zetBewaardAccount(null);
    eigenOefeningen.wisselBackend(eigenBackend(null));
    trainingen.wisselBackend(trainingBackend(null));
    favorieten.wisselBackend(favorietenBackend(null));
    opstellingen.wisselBackend(opstellingBackend(null));
    borden.wisselBackend(bordBackend(null));
    clubtrainingen.wisselBackend(clubBackend(null));
    rooster.wisselBackend(roosterBackend(null));
    teams.wisselAccount(null);
  }
  zetStatus({ account: null, sync: 'uit', samenvoegen: null });
}

/** Antwoord op "Gegevens van dit apparaat naar je account?". */
export function beantwoordSamenvoegen(ja: boolean): void {
  antwoord?.(ja);
}

// ---------- synchroniseren ----------

function instellingenDoel(uid: string): SyncDoelen['instellingen'] {
  const sleutel = sleutelVoor('instellingenGewijzigd', uid);
  let bezig = false;
  const onthouden = () => JSON.stringify([huidigeFilters().aantallen, huidigeFilters().leeftijd]);
  let vorigeAantallen = onthouden();
  const lees = (): Instellingen => {
    const k = leesKeuze();
    return { thema: k.thema, modus: k.modus, taal: leesTaalKeuze(), aantallen: huidigeFilters().aantallen, leeftijd: huidigeFilters().leeftijd, gewijzigd: Number(opslag()?.getItem(sleutel) ?? 0) };
  };
  return {
    lees,
    zet(i) {
      bezig = true;
      try {
        kiesThema({ thema: i.thema as ThemaId, modus: i.modus as Modus });
        zetFilters({ aantallen: i.aantallen, leeftijd: isLeeftijd(i.leeftijd) ? i.leeftijd : null });
        // Andere taal van een ander apparaat: de app laadt opnieuw in die taal.
        if (i.taal === 'nl' || i.taal === 'en' || i.taal === 'auto') {
          if (i.taal !== leesTaalKeuze()) {
            opslag()?.setItem(sleutel, String(i.gewijzigd));
            kiesTaal(i.taal);
          }
        }
        vorigeAantallen = onthouden();
        opslag()?.setItem(sleutel, String(i.gewijzigd));
      } finally {
        bezig = false;
      }
    },
    abonneer(cb) {
      const gewijzigd = () => {
        if (bezig) return;
        opslag()?.setItem(sleutel, String(Date.now()));
        cb();
      };
      const a = abonneerThema(gewijzigd);
      const c = abonneerTaal(gewijzigd);
      const b = abonneerFilters(() => {
        const nu = onthouden();
        if (nu === vorigeAantallen) return;
        vorigeAantallen = nu;
        gewijzigd();
      });
      return () => {
        a();
        b();
        c();
      };
    },
  };
}

function startSync(a: AccountInfo) {
  stopSync();
  const { db } = verbinding();
  const doelen: SyncDoelen = {
    eigen: eigenOefeningen,
    trainingen,
    opstellingen,
    borden,
    clubtrainingen,
    rooster,
    favorieten,
    instellingen: instellingenDoel(a.uid),
    bekend: {
      lees<X>(naam: string, standaard: X): X {
        try {
          return (JSON.parse(opslag()?.getItem(sleutelVoor(`sync.${naam}`, a.uid)) ?? 'null') as X) ?? standaard;
        } catch {
          return standaard;
        }
      },
      zet(naam, waarde) {
        try {
          opslag()?.setItem(sleutelVoor(`sync.${naam}`, a.uid), JSON.stringify(waarde));
        } catch {
          /* vol */
        }
      },
    },
  };
  // Naam en e-mail in het eigen document (voor teams).
  void setDoc(doc(db, 'users', a.uid), { naam: a.naam, email: a.email }, { merge: true }).catch(() => {});
  sync = new Synchronisatie(db, a.uid, doelen, (s) => zetStatus({ sync: s }));
  sync.start();
  teamsStop = T.volgTeams({ db, uid: a.uid, naam: a.naam }, (lijst) => {
    teams.zet(lijst);
    werkGedeeldeBij();
  });
  // Eigen oefening aangepast die je in een team deelt: het team krijgt de nieuwe versie.
  eigenStop = eigenOefeningen.abonneer(werkGedeeldeBij);
  // Nieuw toestel: de spelerslijst staat niet online, maar de namen in je opstellingen wel.
  const vulNamen = () => spelersnamen.vulAanAls(namenUitOpstellingen(opstellingen.lijst()));
  namenStop = opstellingen.abonneer(vulNamen);
  vulNamen();
}

function stopSync() {
  sync?.stop();
  sync = null;
  teamsStop?.();
  teamsStop = null;
  eigenStop?.();
  eigenStop = null;
  namenStop?.();
  namenStop = null;
}

function ik(): T.Ik {
  const a = huidigeStatus().account;
  if (!a) throw new Error('Online: niet ingelogd');
  return { db: verbinding().db, uid: a.uid, naam: a.naam };
}

function werkGedeeldeBij() {
  const a = huidigeStatus().account;
  if (!a) return;
  for (const t of teams.lijst()) {
    for (const it of t.items) {
      if (it.eigenaar !== a.uid || it.soort !== 'oefening') continue;
      const o = eigenOefeningen.haal(it.id);
      if (!o) continue;
      const data = JSON.stringify(voorDelen(o));
      if (data !== it.data) void T.deelItem(ik(), t.id, { id: o.id, soort: 'oefening', naam: o.naam, data }).catch(() => {});
    }
  }
}

// ---------- account ----------

export async function maakAccount(naam: string, email: string, wachtwoord: string): Promise<void> {
  await startOnline();
  const { auth, db } = verbinding();
  const schoon = naam.trim().slice(0, 60);
  if (!schoon) throw new T.TeamFout(vt('Vul je naam in (die zien je teamgenoten).'));
  const c = await createUserWithEmailAndPassword(auth, email.trim(), wachtwoord);
  await updateProfile(c.user, { displayName: schoon });
  await setDoc(doc(db, 'users', c.user.uid), { naam: schoon, email: email.trim() }, { merge: true });
  // De status volgt via onAuthStateChanged; de naam pas na updateProfile: opnieuw doorgeven.
  if (huidigeStatus().account?.uid === c.user.uid) {
    const a = info(c.user);
    zetBewaardAccount(a);
    zetStatus({ account: a });
  }
}

export async function inloggen(email: string, wachtwoord: string): Promise<void> {
  await startOnline();
  await signInWithEmailAndPassword(verbinding().auth, email.trim(), wachtwoord);
}

export async function uitloggen(): Promise<void> {
  await startOnline();
  await signOut(verbinding().auth);
}

/** Toegang voor deellinks: je account, en anders een anonieme sessie (`maak` = die zo nodig aanmaken). */
export async function linkToegang(maak = true): Promise<{ token: string; uid: string } | null> {
  await startOnline();
  const { auth } = verbinding();
  const u = auth.currentUser ?? (maak ? (await signInAnonymously(auth)).user : null);
  return u ? { token: await u.getIdToken(), uid: u.uid } : null;
}

export async function wachtwoordVergeten(email: string): Promise<void> {
  await startOnline();
  await sendPasswordResetEmail(verbinding().auth, email.trim());
}

/** Account verwijderen met al je online gegevens (je teams verlaat je; als laatste lid wordt het team opgeheven). */
export async function verwijderAccount(wachtwoord: string): Promise<void> {
  await startOnline();
  const { auth, db } = verbinding();
  const u = auth.currentUser;
  if (!u?.email) throw new Error('Online: niet ingelogd');
  await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, wachtwoord));
  const mij = ik();
  stopSync();
  // Teams van de server (de lokale lijst kan op een nieuw apparaat nog leeg zijn).
  await T.verlaatAlleTeams(mij);
  // Deellinks die je op dit toestel maakte (een lijst opvragen kan niet, dat staan de regels niet toe).
  const links = eigenLinks().filter((l) => l.maker === u.uid).map((l) => l.code);
  for (const code of links) await deleteDoc(doc(db, 'links', code)).catch(() => {});
  vergeetLinks(links);
  for (const col of ['oefeningen', 'trainingen', 'opstellingen', 'borden', 'clubtrainingen', 'rooster']) {
    const s = await getDocs(collection(db, 'users', u.uid, col));
    const b = writeBatch(db);
    s.docs.forEach((d) => b.delete(d.ref));
    await b.commit();
  }
  const b = writeBatch(db);
  b.delete(doc(db, 'users', u.uid));
  await b.commit();
  await deleteUser(u);
  // Lokale kopie van dit account weg (de gegevens van het apparaat zelf blijven).
  const plek = opslag();
  if (plek) {
    for (const k of Object.keys(plek)) if (k.startsWith(`trainersapp.u.${u.uid}.`) || k === `trainersapp.gekoppeld.${u.uid}`) plek.removeItem(k);
  }
  await opUitgelogd();
}

// ---------- teams ----------

export const maakTeam = (naam: string) => T.maakTeam(ik(), naam);
export const joinTeam = (code: string) => T.joinTeam(ik(), code);
export const verlaatTeam = (team: string) => T.verlaatTeam(ik(), team);
export const hefTeamOp = (team: string) => T.hefTeamOp(ik(), team);
export const vernieuwCode = (team: string) => T.vernieuwCode(ik(), team);
export const zetRol = (team: string, uid: string, rol: Rol) => T.zetRol(ik(), team, uid, rol);
export const verwijderLid = (team: string, uid: string) => T.verwijderLid(ik(), team, uid);
export const verwijderItem = (team: string, item: string) => T.verwijderItem(ik(), team, item);

/** Opstelling of tactiekbord delen (in zijn geheel). */
export function deelWedstrijd(team: string, soort: 'opstelling' | 'bord', id: string): Promise<void> {
  if (soort === 'opstelling') {
    const x = opstellingen.haal(id);
    if (!x) throw new T.TeamFout(vt('Opstelling niet gevonden'));
    return T.deelItem(ik(), team, { id, soort, naam: opstellingNaam(x), data: JSON.stringify(x) });
  }
  const x = borden.haal(id);
  if (!x) throw new T.TeamFout(vt('Tactiekbord niet gevonden'));
  return T.deelItem(ik(), team, { id, soort, naam: bordNaam(x), data: JSON.stringify(x) });
}

export function deelOefening(team: string, o: EigenOefening): Promise<void> {
  return T.deelItem(ik(), team, { id: o.id, soort: 'oefening', naam: o.naam, data: JSON.stringify(voorDelen(o)) });
}

/**
 * Teamtraining delen: met de eigen oefeningen erin (en oefeningen uit een ander team, als kopie), zoals bij een deellink.
 */
export function deelTraining(team: string, trainingId: string): Promise<void> {
  const t = trainingen.haal(trainingId);
  if (!t) throw new T.TeamFout(vt('Teamtraining niet gevonden'));
  const { eigen, nieuwId } = meeTeNemen(t.oefeningen, team);
  const data = { training: { naam: t.naam, datum: t.datum, spelers: t.spelers, keepers: t.keepers, ...(t.leeftijd ? { leeftijd: t.leeftijd } : {}), oefeningen: t.oefeningen.map(nieuwId) }, eigen };
  return T.deelItem(ik(), team, { id: t.id, soort: 'training', naam: t.naam || vt('Teamtraining'), data: JSON.stringify(data) });
}

/** Het trainersrooster met een team delen (0.34.0): een ander kan het bekijken en overnemen. Eén item per eigenaar. */
export function deelRooster(team: string): Promise<void> {
  return T.deelItem(ik(), team, { id: `rooster-${ik().uid}`, soort: 'rooster', naam: vt('Trainersrooster'), data: voorTeamRooster(rooster.lijst()) });
}

/** Circuittraining delen (0.31.2): ook hier gaan oefeningen mee die de teamleden niet hebben. Nog eens delen = bijwerken. */
export function deelClub(team: string, id: string): Promise<void> {
  const c = clubtrainingen.haal(id);
  if (!c) throw new T.TeamFout(vt('Circuittraining niet gevonden'));
  const { eigen, nieuwId } = meeTeNemen(oefeningIds(c), team);
  return T.deelItem(ik(), team, { id, soort: 'clubtraining', naam: clubNaam(c), data: voorTeam({ ...c, onderdelen: metOefeningIds(c, nieuwId) }, eigen) });
}
