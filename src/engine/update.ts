import { useSyncExternalStore } from 'react';
import { registerSW } from 'virtual:pwa-register';

/**
 * Service worker: maakt de app offline beschikbaar.
 * Een nieuwe versie wordt op de achtergrond opgehaald; de app past hem pas toe na een tik op "Bijwerken".
 */
let nieuweVersie = false;
let bijwerken: ((herladen?: boolean) => Promise<void>) | undefined;
const luisteraars = new Set<() => void>();

export function startServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  bijwerken = registerSW({
    immediate: true,
    onNeedRefresh() {
      nieuweVersie = true;
      luisteraars.forEach((l) => l());
    },
    onRegisteredSW(_url, registratie) {
      if (!registratie) return;
      // Bij terugkomen in de app (en elk uur) kijken of er een nieuwe versie is.
      const kijk = () => {
        if (document.visibilityState === 'visible' && navigator.onLine) void registratie.update();
      };
      document.addEventListener('visibilitychange', kijk);
      setInterval(kijk, 60 * 60 * 1000);
    },
  });
}

export function werkBij(): void {
  void bijwerken?.(true);
}

export function useNieuweVersie(): boolean {
  return useSyncExternalStore(
    (cb) => {
      luisteraars.add(cb);
      return () => luisteraars.delete(cb);
    },
    () => nieuweVersie,
    () => nieuweVersie,
  );
}
