import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { deleteApp } from 'firebase/app';
import { terminate } from 'firebase/firestore';
import { verbind, type Verbinding } from '../../src/online/firebase';
import { Synchronisatie, type Instellingen, type SyncDoelen } from '../../src/online/sync';
import { apparaatEigenBackend, EigenStore } from '../../src/eigen/opslag';
import { apparaatBackend, TrainingStore } from '../../src/training/opslag';
import { apparaatFavorieten, FavorietenStore } from '../../src/engine/favorieten';

const PROJECT = 'demo-toptraining';

/** Emulator leegmaken (accounts en database). */
export async function leegmaken(): Promise<void> {
  await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
}

let teller = 0;
const open: Verbinding[] = [];

/** Alle verbindingen van deze test sluiten (anders blijven ze de emulator belasten). */
export async function opruimen(): Promise<void> {
  for (const v of open.splice(0)) {
    await terminate(v.db).catch(() => {});
    await deleteApp(v.app).catch(() => {});
  }
}

/** Een "toestel": eigen Firebase-verbinding, ingelogd (account wordt zo nodig gemaakt). */
export async function toestel(email: string, naam = email.split('@')[0]!): Promise<Verbinding & { uid: string; naam: string }> {
  const v = verbind({ emulator: true, naam: `toestel-${++teller}` });
  open.push(v);
  let uid: string;
  try {
    const c = await createUserWithEmailAndPassword(v.auth, email, 'geheim123');
    await updateProfile(c.user, { displayName: naam });
    uid = c.user.uid;
  } catch {
    uid = (await signInWithEmailAndPassword(v.auth, email, 'geheim123')).user.uid;
  }
  return { ...v, uid, naam };
}

const geheugen = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, w: string) => void data.set(k, w), removeItem: (k: string) => void data.delete(k) };
};

/** Lokale opslag van een toestel (in het geheugen) met synchronisatie. */
export function lokaleOpslag() {
  const plek = geheugen();
  const eigen = new EigenStore(apparaatEigenBackend(plek));
  const trainingen = new TrainingStore(apparaatBackend(plek));
  const favorieten = new FavorietenStore(apparaatFavorieten(plek));
  let inst: Instellingen = { thema: 'standaard', modus: 'licht', aantallen: null, gewijzigd: 0 };
  const instLuisteraars = new Set<() => void>();
  const bekend = new Map<string, unknown>();
  const doelen: SyncDoelen = {
    eigen,
    trainingen,
    favorieten,
    instellingen: {
      lees: () => inst,
      zet: (i) => {
        inst = i;
      },
      abonneer: (cb) => {
        instLuisteraars.add(cb);
        return () => instLuisteraars.delete(cb);
      },
    },
    bekend: {
      lees: <T>(naam: string, standaard: T) => (bekend.has(naam) ? (bekend.get(naam) as T) : standaard),
      zet: (naam, w) => void bekend.set(naam, w),
    },
  };
  return {
    eigen,
    trainingen,
    favorieten,
    doelen,
    instellingen: () => inst,
    /** Instelling lokaal wijzigen (zoals de app dat doet). */
    zetInstellingen(w: Partial<Instellingen>) {
      inst = { ...inst, ...w, gewijzigd: Date.now() };
      for (const cb of instLuisteraars) cb();
    },
  };
}

export function synchroniseer(v: Verbinding & { uid: string }, opslag: ReturnType<typeof lokaleOpslag>, opStatus?: (s: string) => void) {
  const s = new Synchronisatie(v.db, v.uid, opslag.doelen, opStatus);
  s.start();
  return s;
}

/** Wachten tot iets klopt (synchroniseren gaat via de emulator, dat duurt even). */
export async function wachtTot(f: () => boolean, ms = 10000, wat = ""): Promise<void> {
  const eind = Date.now() + ms;
  while (Date.now() < eind) {
    if (f()) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`Wachten duurde te lang${wat ? `: ${wat}` : ''}`);
}
