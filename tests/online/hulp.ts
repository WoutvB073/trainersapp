import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import type { ClubTraining } from '../../src/clubtraining/clubtraining';
import { deleteApp } from 'firebase/app';
import { terminate } from 'firebase/firestore';
import { verbind, type Verbinding } from '../../src/online/firebase';
import { Synchronisatie, type Instellingen, type SyncDoelen } from '../../src/online/sync';
import { apparaatEigenBackend, EigenStore } from '../../src/eigen/opslag';
import { apparaatBackend, TrainingStore } from '../../src/training/opslag';
import { apparaatFavorieten, FavorietenStore } from '../../src/engine/favorieten';
import { apparaatLijst, LijstStore } from '../../src/wedstrijd/opslag';
import type { Bord, Opstelling } from '../../src/wedstrijd/wedstrijd';

const PROJECT = 'demo-toptraining';

/**
 * De Firestore-emulator verstuurt soms twee berichten tegelijk over één Listen-stream, waardoor ze door elkaar lopen (de frame-kop
 * staat dan dubbel). De gRPC-client leest daarna inhoud als lengte: "Received message larger than max (203557642 vs 4194304)".
 * De SDK wacht dan de maximale tijd voor hij opnieuw verbindt, langer dan een test duurt. Alleen tests die daardoor vastlopen
 * krijgen een herkansing (zie vitest.online.config.ts); elke andere fout telt meteen. De app zelf gebruikt geen gRPC maar WebChannel.
 */
export const KAPOT_BERICHT = 'kapot gRPC-bericht van de emulator';
let kapotBericht = false;
/** Voor bij een test: herkansing als de emulator tijdens deze poging haperde. Ook een schrijfactie die hij dan dubbel krijgt, telt mee. */
export const HERKANSING = { count: 4, condition: () => kapotBericht };
const consoleFout = console.error;
console.error = (...a: unknown[]) => {
  if (a.some((x) => /Received message larger than max|Response message parsing error|Application error processing RPC/.test(String(x)))) kapotBericht = true;
  consoleFout(...a);
};

/** Emulator leegmaken (accounts en database). */
export async function leegmaken(): Promise<void> {
  kapotBericht = false;
  await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
}

/** Wat er in de emulator in een collectie staat (als beheerder gelezen, buiten de regels om): de document-id's. */
export async function inEmulator(pad: string): Promise<string[]> {
  const r = await fetch(`http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents/${pad}?pageSize=300`, { headers: { Authorization: 'Bearer owner' } });
  const j = (await r.json()) as { documents?: { name: string }[] };
  return (j.documents ?? []).map((d) => d.name.split('/').pop()!);
}

let teller = 0;
const open: Verbinding[] = [];

const lopend: Synchronisatie[] = [];

/** Alle verbindingen van deze test sluiten (anders blijven ze de emulator belasten). */
export async function opruimen(): Promise<void> {
  // Ook na een mislukte test: eerst de luisteraars stoppen, anders volgen er losse fouten over een gesloten verbinding.
  for (const s of lopend.splice(0)) s.stop();
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
  const opstellingen = new LijstStore<Opstelling>(apparaatLijst(plek, 'opstellingen'));
  const borden = new LijstStore<Bord>(apparaatLijst(plek, 'borden'));
  const clubtrainingen = new LijstStore<ClubTraining>(apparaatLijst(plek, 'clubtrainingen'));
  let inst: Instellingen = { thema: 'standaard', modus: 'licht', aantallen: null, gewijzigd: 0 };
  const instLuisteraars = new Set<() => void>();
  const bekend = new Map<string, unknown>();
  const doelen: SyncDoelen = {
    eigen,
    trainingen,
    opstellingen,
    borden,
    clubtrainingen,
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
    opstellingen,
    borden,
    clubtrainingen,
    doelen,
    instellingen: () => inst,
    /** Instelling lokaal wijzigen (zoals de app dat doet). */
    zetInstellingen(w: Partial<Instellingen>, tijd = Date.now()) {
      inst = { ...inst, ...w, gewijzigd: tijd };
      for (const cb of instLuisteraars) cb();
    },
  };
}

export function synchroniseer(v: Verbinding & { uid: string }, opslag: ReturnType<typeof lokaleOpslag>, opStatus?: (s: string) => void) {
  const s = new Synchronisatie(v.db, v.uid, opslag.doelen, opStatus);
  s.start();
  lopend.push(s);
  return s;
}

/** Wachten tot iets klopt (synchroniseren gaat via de emulator, dat duurt even). */
export async function wachtTot(f: () => boolean, ms = 10000, wat = ""): Promise<void> {
  const eind = Date.now() + ms;
  while (Date.now() < eind) {
    if (f()) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`Wachten duurde te lang${wat ? `: ${wat}` : ''}${kapotBericht ? ` (${KAPOT_BERICHT})` : ''}`);
}
