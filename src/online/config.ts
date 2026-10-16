import type { FirebaseOptions } from 'firebase/app';

/**
 * Firebase-webconfig van TopTraining. Die is openbaar bedoeld (geen geheim): de beveiliging zit in firestore.rules.
 * Is hij leeg (null), staat online (inloggen, teams) uit en werkt de app gewoon op het apparaat.
 * Dit bestand laadt geen Firebase-code, zodat het startscherm snel blijft.
 */
export const FIREBASE_CONFIG: FirebaseOptions | null = {
  apiKey: 'AIzaSyBTNGgQJhqzfH-1mGaiZ4UHBstTJJf5NGc',
  authDomain: 'toptraining-40a90.firebaseapp.com',
  projectId: 'toptraining-40a90',
  storageBucket: 'toptraining-40a90.firebasestorage.app',
  messagingSenderId: '319089416961',
  appId: '1:319089416961:web:be9050f5285cb08d51d900',
};

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
