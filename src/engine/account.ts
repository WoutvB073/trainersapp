import { useSyncExternalStore } from 'react';

/**
 * Account-status zonder Firebase te laden (de online-module komt pas binnen als je inlogt of al ingelogd was).
 * Ingelogd gebruiken de opslaglagen een eigen plek per account (`trainersapp.u.<uid>.…`): een lokale kopie van je online
 * gegevens, zodat alles ook offline werkt. Uitgelogd: de gegevens van het apparaat (`trainersapp.…`), zoals altijd.
 */
export interface AccountInfo {
  uid: string;
  email: string;
  naam: string;
}

/** Synchronisatie: `uit` (niet ingelogd), `bezig`, `klaar`, `wacht` (wijzigingen nog niet online), `offline`, `fout`. */
export type SyncStatus = 'uit' | 'bezig' | 'klaar' | 'wacht' | 'offline' | 'fout';

export interface OnlineStatus {
  account: AccountInfo | null;
  sync: SyncStatus;
  /** Eerste keer inloggen op dit apparaat: wat er lokaal staat (vraag of het naar het account mag). */
  samenvoegen: { eigen: number; trainingen: number; favorieten: number } | null;
  /** Online-module geladen en Firebase verbonden. */
  verbonden: boolean;
  fout?: string;
}

const ACCOUNT = 'trainersapp.account';

type Opslagplek = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
function opslag(): Opslagplek | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export function bewaardAccount(plek: Opslagplek | undefined = opslag()): AccountInfo | null {
  try {
    const a = JSON.parse(plek?.getItem(ACCOUNT) ?? 'null') as AccountInfo | null;
    return a && typeof a.uid === 'string' ? a : null;
  } catch {
    return null;
  }
}

export function zetBewaardAccount(a: AccountInfo | null, plek: Opslagplek | undefined = opslag()): void {
  try {
    if (a) plek?.setItem(ACCOUNT, JSON.stringify(a));
    else plek?.removeItem(ACCOUNT);
  } catch {
    /* niet erg */
  }
}

/** Opslagsleutel voor deze gegevens: van het apparaat, of van het account dat ingelogd is. */
export function sleutelVoor(basis: string, uid: string | null = bewaardAccount()?.uid ?? null): string {
  return uid ? `trainersapp.u.${uid}.${basis}` : `trainersapp.${basis}`;
}

// ---------- status (voor de schermen) ----------

let status: OnlineStatus = { account: bewaardAccount(), sync: bewaardAccount() ? 'bezig' : 'uit', samenvoegen: null, verbonden: false };
const luisteraars = new Set<() => void>();

export function zetStatus(w: Partial<OnlineStatus>): void {
  status = { ...status, ...w };
  for (const cb of luisteraars) cb();
}

export const huidigeStatus = () => status;

const abonneer = (cb: () => void) => {
  luisteraars.add(cb);
  return () => luisteraars.delete(cb);
};

export function useOnlineStatus(): OnlineStatus {
  return useSyncExternalStore(abonneer, huidigeStatus, huidigeStatus);
}

/** De online-module (Firebase) laden; pas als het nodig is. */
export function online(): Promise<typeof import('../online/online')> {
  return import('../online/online');
}
