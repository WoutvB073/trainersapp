import { useSyncExternalStore } from 'react';

/**
 * Weergave van de poppetjes in 3D (0.38.0), alleen op dit apparaat (het gaat om de snelheid van het toestel, dus niet
 * meegesynchroniseerd). Drie niveaus, van zwaar naar licht:
 * - realistisch: zonlicht met schaduwen, gras met structuur, lucht, en echtere spelers (shirt, broek, kousen, schoenen, gezicht);
 * - gewoon: de poppetjes van vóór 0.38.0;
 * - eenvoudig: lichtere figuren en een lagere resolutie voor tragere telefoons.
 *
 * KEUZE = wat de gebruiker zelf koos ('realistisch', 'gewoon' of 'eenvoudig'); ontbreekt = automatisch: de app begint met
 * realistisch en zet het niveau zelf lager als 3D niet soepel loopt (AUTO = 'gewoon' of '1' = eenvoudig).
 * Oude waarde van vóór 0.38.0: KEUZE 'normaal' (de gebruiker zette Eenvoudige poppetjes zelf uit) = automatisch, maar nooit
 * vanzelf eenvoudig (zoals toen: dan valt de speler zo nodig terug op 2D).
 */
const KEUZE = 'trainersapp.poppetjes';
const AUTO = 'trainersapp.poppetjesAuto';

type Opslagplek = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type PopNiveau = 'realistisch' | 'gewoon' | 'eenvoudig';
export const POP_NIVEAUS: readonly PopNiveau[] = ['realistisch', 'gewoon', 'eenvoudig'];

export interface PoppetjesStand {
  niveau: PopNiveau;
  /** Kort voor niveau === 'eenvoudig'. */
  eenvoudig: boolean;
  /** Door de app lager gezet (3D liep niet soepel). */
  automatisch: boolean;
  /** De gebruiker koos het niveau zelf. */
  zelf: boolean;
}

const stand = (niveau: PopNiveau, automatisch: boolean, zelf: boolean): PoppetjesStand => ({ niveau, eenvoudig: niveau === 'eenvoudig', automatisch, zelf });

export class PoppetjesInstelling {
  private luisteraars = new Set<() => void>();
  private stand: PoppetjesStand;
  /** Automatisch lager gezet, ook zonder opslag (privévenster): dan geldt het tot de app sluit. */
  private autoGeheugen: string | null = null;

  constructor(private readonly opslag: Opslagplek | undefined) {
    this.stand = this.lees();
  }

  private ruw(): { keuze: string | null; auto: string | null } {
    try {
      if (!this.opslag) return { keuze: null, auto: this.autoGeheugen };
      return { keuze: this.opslag.getItem(KEUZE), auto: this.opslag.getItem(AUTO) ?? this.autoGeheugen };
    } catch {
      return { keuze: null, auto: this.autoGeheugen };
    }
  }

  private lees(): PoppetjesStand {
    const { keuze, auto } = this.ruw();
    if (keuze === 'eenvoudig' || keuze === 'gewoon' || keuze === 'realistisch') return stand(keuze, false, true);
    if (auto === '1' && keuze !== 'normaal') return stand('eenvoudig', true, false);
    if (auto === 'gewoon') return stand('gewoon', true, false);
    return stand('realistisch', false, false);
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
  kies(niveau: PopNiveau) {
    this.autoGeheugen = null;
    try {
      this.opslag?.setItem(KEUZE, niveau);
      this.opslag?.removeItem(AUTO);
    } catch {
      /* niet erg */
    }
    this.melden();
  }

  /** Terug naar automatisch (de app kiest; begint weer met realistisch). */
  automatischKiezen() {
    this.autoGeheugen = null;
    try {
      this.opslag?.removeItem(KEUZE);
      this.opslag?.removeItem(AUTO);
    } catch {
      /* niet erg */
    }
    this.melden();
  }

  /**
   * 3D haperde: zet het niveau automatisch één stap lager (realistisch → gewoon → eenvoudig). Niet als de gebruiker het
   * niveau zelf koos (dan valt de speler zo nodig terug op 2D). Geeft het nieuwe niveau, of null als er niets veranderd is.
   */
  verlaag(): PopNiveau | null {
    const { keuze } = this.ruw();
    if (this.stand.zelf) return null;
    const nu = this.stand.niveau;
    const volgende: PopNiveau | null = nu === 'realistisch' ? 'gewoon' : nu === 'gewoon' && keuze !== 'normaal' ? 'eenvoudig' : null;
    if (!volgende) return null;
    this.autoGeheugen = volgende === 'eenvoudig' ? '1' : 'gewoon';
    try {
      this.opslag?.setItem(AUTO, this.autoGeheugen);
    } catch {
      /* niet erg */
    }
    this.melden();
    return this.stand.niveau === volgende ? volgende : null;
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
