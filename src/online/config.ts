import type { FirebaseOptions } from 'firebase/app';

/**
 * Firebase-webconfig van TopTraining. Die is openbaar bedoeld (geen geheim): de beveiliging zit in firestore.rules.
 * Zolang hij leeg is, staat online (inloggen, teams) uit en werkt de app gewoon op het apparaat.
 * Dit bestand laadt geen Firebase-code, zodat het startscherm snel blijft.
 */
export const FIREBASE_CONFIG: FirebaseOptions | null = null;

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
