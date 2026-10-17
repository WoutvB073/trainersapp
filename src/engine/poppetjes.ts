import { useSyncExternalStore } from 'react';

/**
 * Instelling "Eenvoudige poppetjes" (3D): lichtere figuren en een lagere resolutie voor tragere telefoons.
 * Alleen op dit apparaat (het gaat om de snelheid van het toestel, dus niet meegesynchroniseerd).
 * - KEUZE: wat de gebruiker zelf koos ('eenvoudig' of 'normaal'); ontbreekt = nog niet gekozen.
 * - AUTO: de app heeft ze zelf aangezet omdat 3D haperde (alleen als de gebruiker niet zelf 'normaal' koos).
 */
const KEUZE = 'trainersapp.poppetjes';
const AUTO = 'trainersapp.poppetjesAuto';

type Opslagplek = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface PoppetjesStand {
  eenvoudig: boolean;
  /** Door de app aangezet (3D liep niet soepel). */
  automatisch: boolean;
}

export class PoppetjesInstelling {
  private luisteraars = new Set<() => void>();
  private stand: PoppetjesStand;

  constructor(private readonly opslag: Opslagplek | undefined) {
    this.stand = this.lees();
  }

  private lees(): PoppetjesStand {
    let keuze: string | null = null;
    let auto: string | null = null;
    try {
      keuze = this.opslag?.getItem(KEUZE) ?? null;
      auto = this.opslag?.getItem(AUTO) ?? null;
    } catch {
      /* geen opslag */
    }
    if (keuze === 'eenvoudig') return { eenvoudig: true, automatisch: false };
    if (keuze === 'normaal') return { eenvoudig: false, automatisch: false };
    return auto === '1' ? { eenvoudig: true, automatisch: true } : { eenvoudig: false, automatisch: false };
  }

  get = () => this.stand;

  abonneer = (f: () => void) => {
    this.luisteraars.add(f);
    return () => this.luisteraars.delete(f);
  };

  private melden() {
    this.stand = this.lees();
    for (const f of this.luisteraars) f();
  }

  /** De gebruiker kiest zelf (Instellingen). */
  kies(eenvoudig: boolean) {
    try {
      this.opslag?.setItem(KEUZE, eenvoudig ? 'eenvoudig' : 'normaal');
      this.opslag?.removeItem(AUTO);
    } catch {
      /* niet erg */
    }
    this.melden();
  }

  /**
   * 3D haperde met de gewone poppetjes: zet ze automatisch op eenvoudig. Niet als de gebruiker zelf 'normaal'
   * koos (dan valt de speler zo nodig terug op 2D). Geeft true als er iets veranderd is.
   */
  automatisch(): boolean {
    let keuze: string | null = null;
    try {
      keuze = this.opslag?.getItem(KEUZE) ?? null;
    } catch {
      /* geen opslag */
    }
    if (keuze || this.stand.eenvoudig) return false;
    try {
      this.opslag?.setItem(AUTO, '1');
    } catch {
      /* niet erg */
    }
    this.melden();
    return this.stand.eenvoudig;
  }
}

function opslag(): Opslagplek | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export const poppetjes = new PoppetjesInstelling(opslag());

export function usePoppetjes(): PoppetjesStand {
  return useSyncExternalStore(poppetjes.abonneer, poppetjes.get, poppetjes.get);
}
