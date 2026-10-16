import { collection, deleteDoc, doc, onSnapshot, setDoc, type Firestore, type Unsubscribe } from 'firebase/firestore';
import type { EigenOefening } from '../model/types';
import type { Training } from '../training/training';
import type { SyncStatus } from '../engine/account';
import { nieuwste, verzoen, verzoenSet, type Item } from './samenvoegen';

/**
 * Synchroniseren van eigen oefeningen, trainingen, favorieten en instellingen tussen de lokale opslag en Firestore.
 * De lokale opslag blijft de bron voor de schermen (werkt ook offline); dit houdt hem gelijk met online.
 * Wat er de vorige keer gesynchroniseerd is (`bekend`) wordt bewaard, zodat ook wijzigingen die je offline deed (en
 * de app daarna sloot) bij de volgende keer online meegaan.
 */

export interface LijstDoel<T> {
  lijst(): T[];
  vervangAlles(lijst: T[]): void;
  abonneer(cb: () => void): () => void;
}

export interface FavorietenDoel {
  alle(): ReadonlySet<string>;
  vervangAlles(ids: readonly string[]): void;
  abonneer(cb: () => void): () => void;
}

export interface Instellingen {
  thema: string;
  modus: string;
  aantallen: { spelers: number; keepers: number } | null;
  gewijzigd: number;
}

export interface InstellingenDoel {
  lees(): Instellingen;
  zet(i: Instellingen): void;
  abonneer(cb: () => void): () => void;
}

/** Waar de "laatst gesynchroniseerd"-stand bewaard wordt (per account). */
export interface BekendOpslag {
  lees<T>(naam: string, standaard: T): T;
  zet(naam: string, waarde: unknown): void;
}

export interface SyncDoelen {
  eigen: LijstDoel<EigenOefening>;
  trainingen: LijstDoel<Training>;
  favorieten: FavorietenDoel;
  instellingen: InstellingenDoel;
  bekend: BekendOpslag;
}

type Collectie = 'oefeningen' | 'trainingen';

/** Instellingen in een vaste vorm (Firestore geeft velden in een andere volgorde terug). */
function vast(i: Instellingen | undefined): Instellingen | undefined {
  if (!i) return undefined;
  const a = i.aantallen ? { spelers: Number(i.aantallen.spelers), keepers: Number(i.aantallen.keepers) } : null;
  return { thema: String(i.thema), modus: String(i.modus), aantallen: a, gewijzigd: Number(i.gewijzigd) || 0 };
}
const gelijk = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export class Synchronisatie {
  private stoppers: (() => void)[] = [];
  private bezigMetToepassen = false;
  private wacht = new Map<string, boolean>();
  private vanServer = new Map<string, boolean>();
  private fout = false;

  constructor(
    private db: Firestore,
    private uid: string,
    private doelen: SyncDoelen,
    private opStatus: (s: SyncStatus) => void = () => {},
  ) {}

  start(): void {
    this.koppelLijst('oefeningen', this.doelen.eigen);
    this.koppelLijst('trainingen', this.doelen.trainingen);
    this.koppelGebruiker();
    if (typeof window !== 'undefined') {
      const melden = () => this.meldStatus();
      window.addEventListener('online', melden);
      window.addEventListener('offline', melden);
      this.stoppers.push(() => {
        window.removeEventListener('online', melden);
        window.removeEventListener('offline', melden);
      });
    }
    this.meldStatus();
  }

  stop(): void {
    for (const s of this.stoppers) s();
    this.stoppers = [];
  }

  /** Lokale wijziging toepassen zonder dat die zelf weer een synchronisatie start. */
  private toepassen(f: () => void) {
    this.bezigMetToepassen = true;
    try {
      f();
    } finally {
      this.bezigMetToepassen = false;
    }
  }

  private meldStatus() {
    if (this.fout) return this.opStatus('fout');
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return this.opStatus('offline');
    if ([...this.wacht.values()].some(Boolean)) return this.opStatus('wacht');
    if (this.vanServer.size < 3 || [...this.vanServer.values()].some((v) => !v)) return this.opStatus('bezig');
    this.opStatus('klaar');
  }

  private koppelLijst<T extends Item>(col: Collectie, doel: LijstDoel<T>) {
    const pad = collection(this.db, 'users', this.uid, col);
    let online: T[] | null = null;
    const verwerk = () => {
      if (!online) return;
      const bekend = this.doelen.bekend.lees<Record<string, string>>(col, {});
      const v = verzoen(doel.lijst(), bekend, online);
      this.doelen.bekend.zet(col, v.bekend);
      if (v.lokaalVeranderd) this.toepassen(() => doel.vervangAlles(v.lokaal));
      for (const x of v.schrijf) {
        online = [...online.filter((y) => y.id !== x.id), x];
        void setDoc(doc(pad, x.id), { data: JSON.stringify(x), gewijzigd: x.gewijzigd }).catch(() => this.zetFout());
      }
      for (const id of v.verwijder) {
        online = online.filter((y) => y.id !== id);
        void deleteDoc(doc(pad, id)).catch(() => this.zetFout());
      }
    };
    const uit: Unsubscribe = onSnapshot(
      pad,
      { includeMetadataChanges: true },
      (snap) => {
        const lijst: T[] = [];
        for (const d of snap.docs) {
          try {
            lijst.push(JSON.parse(d.data().data as string) as T);
          } catch {
            /* kapot document: overslaan */
          }
        }
        online = lijst;
        this.wacht.set(col, snap.metadata.hasPendingWrites);
        this.vanServer.set(col, this.vanServer.get(col) || !snap.metadata.fromCache);
        verwerk();
        this.meldStatus();
      },
      () => this.zetFout(),
    );
    const uitLokaal = doel.abonneer(() => {
      if (!this.bezigMetToepassen) verwerk();
    });
    this.stoppers.push(uit, uitLokaal);
  }

  private koppelGebruiker() {
    const pad = doc(this.db, 'users', this.uid);
    let data: { favorieten?: string[]; instellingen?: Instellingen } | null = null;
    const verwerk = () => {
      if (!data) return;
      // Favorieten: per oefening kijken wie er iets aan veranderde.
      const bekendFav = this.doelen.bekend.lees<string[]>('favorieten', []);
      const v = verzoenSet([...this.doelen.favorieten.alle()], bekendFav, data.favorieten ?? []);
      this.doelen.bekend.zet('favorieten', v.lokaal);
      if (v.lokaalVeranderd) this.toepassen(() => this.doelen.favorieten.vervangAlles(v.lokaal));
      const w: Record<string, unknown> = {};
      if (v.onlineVeranderd) w.favorieten = v.online;
      // Instellingen: de nieuwste wint.
      const lokaal = vast(this.doelen.instellingen.lees())!;
      const online = vast(data.instellingen);
      const beste = nieuwste(lokaal, online)!;
      if (!gelijk(beste, lokaal)) this.toepassen(() => this.doelen.instellingen.zet(beste));
      else if (!gelijk(online, lokaal)) w.instellingen = lokaal;
      if (Object.keys(w).length) {
        data = { ...data, ...w };
        void setDoc(pad, w, { merge: true }).catch(() => this.zetFout());
      }
    };
    const uit = onSnapshot(
      pad,
      { includeMetadataChanges: true },
      (snap) => {
        data = (snap.data() as typeof data) ?? {};
        this.wacht.set('gebruiker', snap.metadata.hasPendingWrites);
        this.vanServer.set('gebruiker', this.vanServer.get('gebruiker') || !snap.metadata.fromCache);
        verwerk();
        this.meldStatus();
      },
      () => this.zetFout(),
    );
    const uitFav = this.doelen.favorieten.abonneer(() => {
      if (!this.bezigMetToepassen) verwerk();
    });
    const uitInst = this.doelen.instellingen.abonneer(() => {
      if (!this.bezigMetToepassen) verwerk();
    });
    this.stoppers.push(uit, uitFav, uitInst);
  }

  private zetFout() {
    this.fout = true;
    this.meldStatus();
  }
}
