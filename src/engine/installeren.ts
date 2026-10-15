import { useSyncExternalStore } from 'react';

/** Chrome/Edge (Android en computer): het uitgestelde installatieverzoek, voor een eigen "Installeren"-knop. */
type InstallatieVerzoek = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let verzoek: InstallatieVerzoek | null = null;
let geinstalleerd = false;
const luisteraars = new Set<() => void>();
const meld = () => luisteraars.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    verzoek = e as InstallatieVerzoek;
    meld();
  });
  window.addEventListener('appinstalled', () => {
    verzoek = null;
    geinstalleerd = true;
    meld();
  });
}

interface Staat {
  kanVragen: boolean;
  geinstalleerd: boolean;
}
let momentopname: Staat = { kanVragen: false, geinstalleerd: false };
const lees = () => {
  if (momentopname.kanVragen !== !!verzoek || momentopname.geinstalleerd !== geinstalleerd) {
    momentopname = { kanVragen: !!verzoek, geinstalleerd };
  }
  return momentopname;
};

export function useInstallatie(): Staat {
  return useSyncExternalStore(
    (cb) => {
      luisteraars.add(cb);
      return () => luisteraars.delete(cb);
    },
    lees,
    lees,
  );
}

export async function vraagInstallatie(): Promise<boolean> {
  if (!verzoek) return false;
  const e = verzoek;
  verzoek = null;
  meld();
  await e.prompt();
  return (await e.userChoice).outcome === 'accepted';
}
