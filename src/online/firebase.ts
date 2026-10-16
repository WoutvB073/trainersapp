import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { connectAuthEmulator, indexedDBLocalPersistence, initializeAuth, inMemoryPersistence, type Auth } from 'firebase/auth';
import { emulatorGekozen, FIREBASE_CONFIG } from './config';
import { connectFirestoreEmulator, initializeFirestore, memoryLocalCache, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore';

/** Firebase-verbinding (config: ./config.ts). Emulator voor tests: zie emulatorGekozen. */
const EMULATOR_CONFIG: FirebaseOptions = { apiKey: 'demo-sleutel', authDomain: 'demo-toptraining.firebaseapp.com', projectId: 'demo-toptraining', appId: 'demo-app' };

export interface Verbinding {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  emulator: boolean;
}

let enkel: Verbinding | null = null;

/**
 * Verbinding maken. In de app één keer (`naam` leeg); in tests mag je er meerdere maken (twee toestellen nadoen).
 * In de browser bewaart Firestore een kopie in IndexedDB: offline lezen en schrijven werkt, wijzigingen gaan mee
 * zodra er weer internet is.
 */
export function verbind(opties: { emulator?: boolean; naam?: string } = {}): Verbinding {
  if (!opties.naam && enkel) return enkel;
  const emulator = opties.emulator ?? emulatorGekozen();
  const config = emulator ? EMULATOR_CONFIG : FIREBASE_CONFIG;
  if (!config) throw new Error('Online opslag is nog niet ingesteld');
  const app = initializeApp(config, opties.naam);
  const browser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
  const auth = initializeAuth(app, { persistence: browser ? indexedDBLocalPersistence : inMemoryPersistence });
  const db = initializeFirestore(app, {
    localCache: browser ? persistentLocalCache({ tabManager: persistentMultipleTabManager() }) : memoryLocalCache(),
  });
  if (emulator) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  const v = { app, auth, db, emulator };
  if (!opties.naam) enkel = v;
  return v;
}
