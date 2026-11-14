import type { FirebaseOptions } from 'firebase/app';

/**
 * Firebase-webconfig van TopTraining. Die is openbaar bedoeld (geen geheim): de beveiliging zit in firestore.rules.
 * Is hij leeg (null), staat online (inloggen, teams) uit en werkt de app gewoon op het apparaat.
 * Dit bestand laadt geen Firebase-code, zodat het startscherm snel blijft.
 */
const ECHT: FirebaseOptions = {
  apiKey: 'AIzaSyBTNGgQJhqzfH-1mGaiZ4UHBstTJJf5NGc',
  authDomain: 'toptraining-40a90.firebaseapp.com',
  projectId: 'toptraining-40a90',
  storageBucket: 'toptraining-40a90.firebasestorage.app',
  messagingSenderId: '319089416961',
  appId: '1:319089416961:web:be9050f5285cb08d51d900',
};

/**
 * In de voorbeeldversie (`VITE_VOORBEELD=1`, zie src/engine/voorbeeld.ts) staat online uit: geen inloggen, geen synchronisatie en geen
 * korte deellinks. Zo kan de voorbeeldlink de echte gegevens in Firestore niet raken; alles blijft op het toestel.
 */
export const FIREBASE_CONFIG: FirebaseOptions | null = import.meta.env.VITE_VOORBEELD === '1' ? null : ECHT;

/** Tests: de lokale Firebase-emulator (localStorage `trainersapp.emulator` = '1'). */
export function emulatorGekozen(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('trainersapp.emulator') === '1';
  } catch {
    return false;
  }
}

/** Is online (inloggen, teams) beschikbaar in deze versie? */
export const onlineBeschikbaar = () => !!FIREBASE_CONFIG || emulatorGekozen();
