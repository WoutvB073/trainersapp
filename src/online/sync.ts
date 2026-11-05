import { arrayRemove, arrayUnion, collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch, type Firestore, type Unsubscribe } from 'firebase/firestore';
import type { EigenOefening } from '../model/types';
import type { Training } from '../training/training';
import type { ClubTraining } from '../clubtraining/clubtraining';
import type { Bord, Opstelling } from '../wedstrijd/wedstrijd';
import type { SyncStatus } from '../engine/account';
import { verzoen, verzoenSet, type Item } from './samenvoegen';

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
  /** Taalkeuze (0.25.0): nl, en of auto. Ontbreekt bij oudere gegevens (= auto). */
  taal?: string;
  aantallen: { spelers: number; keepers: number } | null;
  /** Laatst gekozen leeftijdsgroep (0.30.0). Ontbreekt bij oudere gegevens. */
  leeftijd?: string | null;
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
  /** Wedstrijd (0.18.0): opstellingen en tactiekborden/spelhervattingen. */
  opstellingen?: LijstDoel<Opstelling>;
  /** Clubtrainingen (0.31.0). */
  clubtrainingen?: LijstDoel<ClubTraining>;
  borden?: LijstDoel<Bord>;
  favorieten: FavorietenDoel;
  instellingen: InstellingenDoel;
  bekend: BekendOpslag;
}

type Collectie = 'oefeningen' | 'trainingen' | 'opstellingen' | 'borden' | 'clubtrainingen';

/** Instellingen in een vaste vorm (Firestore geeft velden in een andere volgorde terug). */
function vast(i: Instellingen | undefined): Instellingen | undefined {
  if (!i) return undefined;
  const a = i.aantallen ? { spelers: Number(i.aantallen.spelers), keepers: Number(i.aantallen.keepers) } : null;
  return { thema: String(i.thema), modus: String(i.modus), taal: String(i.taal ?? 'auto'), aantallen: a, leeftijd: i.leeftijd ?? null, gewijzigd: Number(i.gewijzigd) || 0 };
}
/** Wat de gebruiker koos, zonder de tijd. */
const inhoud = (i: Instellingen) => JSON.stringify({ ...i, gewijzigd: 0 });

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
    if (this.doelen.opstellingen) this.koppelLijst('opstellingen', this.doelen.opstellingen);
    if (this.doelen.borden) this.koppelLijst('borden', this.doelen.borden);
    if (this.doelen.clubtrainingen) this.koppelLijst('clubtrainingen', this.doelen.clubtrainingen);
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
    if (this.vanServer.size < this.aantalBronnen() || [...this.vanServer.values()].some((v) => !v)) return this.opStatus('bezig');
    this.opStatus('klaar');
  }

  /** Lijsten + het gebruikersdocument. */
  private aantalBronnen(): number {
    return 3 + (this.doelen.opstellingen ? 1 : 0) + (this.doelen.borden ? 1 : 0) + (this.doelen.clubtrainingen ? 1 : 0);
  }

  private koppelLijst<T extends Item>(col: Collectie, doel: LijstDoel<T>) {
    const pad = collection(this.db, 'users', this.uid, col);
    let online: T[] | null = null;
    /**
     * Schrijfacties die Firestore nog niet bevestigd heeft: per item de versie die wij stuurden (null = verwijderd) en wat er
     * het laatst zeker online stond. Zo lang iets hier staat:
     * - telt onze eigen versie, want een momentopname kan ouder zijn (anders verdwijnen letters tijdens het typen);
     * - blijft `bekend` op de oude stand, want als de schrijfactie de server nooit haalt (app dicht), moet hij de volgende keer
     *   opnieuw, en mag een item dat online ontbreekt niet als "online verwijderd" gelden.
     */
    const onderweg = new Map<string, { versie: T | null; bekend: string | undefined }>();
    const metOnderweg = (lijst: T[]): T[] => [...lijst.filter((y) => !onderweg.has(y.id)), ...[...onderweg.values()].flatMap((o) => (o.versie ? [o.versie] : []))];
    const leesBekend = () => this.doelen.bekend.lees<Record<string, string>>(col, {});
    const zetBekend = (bekend: Record<string, string>, id: string, waarde: string | undefined) => {
      if (waarde === undefined) delete bekend[id];
      else bekend[id] = waarde;
    };
    const stuur = (id: string, versie: T | null, oud: string | undefined, schrijf: () => Promise<void>) => {
      const bevestigd = onderweg.get(id)?.bekend ?? oud;
      const ik = { versie, bekend: bevestigd };
      onderweg.set(id, ik);
      const klaar = () => {
        const nu = versie ? JSON.stringify(versie) : undefined;
        const volgende = onderweg.get(id);
        if (volgende === ik) {
          onderweg.delete(id);
          const bekend = { ...leesBekend() };
          zetBekend(bekend, id, nu);
          this.doelen.bekend.zet(col, bekend);
        } else if (volgende) volgende.bekend = nu;
      };
      // Geweigerd (regels): niet eindeloos opnieuw proberen, dan wint wat online staat.
      void schrijf().then(klaar, () => {
        klaar();
        this.zetFout();
      });
    };
    const verwerk = () => {
      if (!online) return;
      const oudBekend = leesBekend();
      // Vergelijken met wat wij het laatst stuurden, zodat ook een wijziging daarna als "lokaal veranderd" telt.
      const vergelijk = { ...oudBekend };
      for (const [id, o] of onderweg) zetBekend(vergelijk, id, o.versie ? JSON.stringify(o.versie) : undefined);
      const v = verzoen(doel.lijst(), vergelijk, online);
      const bekend = { ...v.bekend };
      for (const [id, o] of onderweg) zetBekend(bekend, id, o.bekend);
      for (const x of v.schrijf) zetBekend(bekend, x.id, onderweg.get(x.id)?.bekend ?? oudBekend[x.id]);
      for (const id of v.verwijder) zetBekend(bekend, id, onderweg.get(id)?.bekend ?? oudBekend[id]);
      this.doelen.bekend.zet(col, bekend);
      if (v.lokaalVeranderd) this.toepassen(() => doel.vervangAlles(v.lokaal));
      for (const x of v.schrijf) {
        online = [...online.filter((y) => y.id !== x.id), x];
        stuur(x.id, x, oudBekend[x.id], () => setDoc(doc(pad, x.id), { data: JSON.stringify(x), gewijzigd: x.gewijzigd }));
      }
      for (const id of v.verwijder) {
        online = online.filter((y) => y.id !== id);
        stuur(id, null, oudBekend[id], () => deleteDoc(doc(pad, id)));
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
        const vanServer = this.vanServer.get(col) || !snap.metadata.fromCache;
        this.wacht.set(col, snap.metadata.hasPendingWrites);
        this.vanServer.set(col, vanServer);
        // Pas beslissen als de server iets gezegd heeft: een lege of halve cache betekent niet dat iets online weg is.
        if (vanServer) {
          online = metOnderweg(lijst);
          verwerk();
        }
        this.meldStatus();
      },
      () => this.zetFout(),
    );
    const uitLokaal = doel.abonneer(() => {
      if (!this.bezigMetToepassen) verwerk();
    });
    this.stoppers.push(uit, uitLokaal);
  }

  /**
   * Eén waarde naar Firestore sturen. Zolang `plek.wacht` gevuld is, telt die eigen versie; wat er als bevestigd bewaard wordt
   * (`bewaar`) verandert pas na de bevestiging. Zie `onderweg` in koppelLijst.
   */
  private stuurWaarde<V>(plek: { wacht: V | null }, versie: V, bewaar: (v: V) => void, schrijf: () => Promise<void>) {
    plek.wacht = versie;
    const klaar = () => {
      bewaar(versie);
      if (plek.wacht === versie) plek.wacht = null;
    };
    // Geweigerd (regels): niet eindeloos opnieuw proberen, dan wint wat online staat.
    void schrijf().then(klaar, () => {
      klaar();
      this.zetFout();
    });
  }

  private koppelGebruiker() {
    const pad = doc(this.db, 'users', this.uid);
    let data: { favorieten?: string[]; instellingen?: Instellingen } | null = null;
    const favorieten: { wacht: string[] | null } = { wacht: null };
    const instellingen: { wacht: Instellingen | null } = { wacht: null };
    const bekend = this.doelen.bekend;

    const verwerkFavorieten = () => {
      // Per oefening kijken wie er iets aan veranderde. Terwijl we schrijven is onze eigen versie de vergelijking.
      const vorige = favorieten.wacht ?? bekend.lees<string[]>('favorieten', []);
      const online = favorieten.wacht ?? data?.favorieten ?? [];
      const v = verzoenSet([...this.doelen.favorieten.alle()], vorige, online);
      if (v.lokaalVeranderd) this.toepassen(() => this.doelen.favorieten.vervangAlles(v.lokaal));
      if (!v.onlineVeranderd) {
        if (!favorieten.wacht) bekend.zet('favorieten', v.lokaal);
        return;
      }
      // Alleen het verschil sturen: een hele lijst zou overschrijven wat een ander toestel intussen deed.
      const erbij = v.online.filter((x) => !online.includes(x));
      const eraf = online.filter((x) => !v.online.includes(x));
      this.stuurWaarde(
        favorieten,
        v.online,
        (w) => bekend.zet('favorieten', w),
        () => {
          const b = writeBatch(this.db);
          if (erbij.length) b.set(pad, { favorieten: arrayUnion(...erbij) }, { merge: true });
          if (eraf.length) b.set(pad, { favorieten: arrayRemove(...eraf) }, { merge: true });
          return b.commit();
        },
      );
    };

    const verwerkInstellingen = () => {
      const lokaal = vast(this.doelen.instellingen.lees())!;
      const online = vast(instellingen.wacht ?? data?.instellingen);
      const stuur = (i: Instellingen) =>
        this.stuurWaarde(
          instellingen,
          i,
          (w) => bekend.zet('instellingen', inhoud(w)),
          () => setDoc(pad, { instellingen: i }, { merge: true }),
        );
      if (!online) return stuur(lokaal);
      if (inhoud(lokaal) === inhoud(online)) {
        if (!instellingen.wacht) bekend.zet('instellingen', inhoud(online));
        return;
      }
      // De nieuwste wint; bij gelijke tijd online, zodat twee toestellen niet eindeloos tegen elkaar blijven schrijven. Alleen een
      // wijziging hier zonder nieuwe tijd (online is nog zoals de vorige keer) wint ook als de tijd niet hoger is.
      const vorige = instellingen.wacht ? inhoud(instellingen.wacht) : bekend.lees<string | undefined>('instellingen', undefined);
      const alleenHier = vorige !== undefined && inhoud(lokaal) !== vorige && inhoud(online) === vorige;
      if (lokaal.gewijzigd <= online.gewijzigd && !alleenHier) {
        // Eerst bewaren: een andere taal laadt de app opnieuw.
        bekend.zet('instellingen', inhoud(online));
        this.toepassen(() => this.doelen.instellingen.zet(online));
        return;
      }
      // Gewijzigd zonder nieuwe tijd (bijvoorbeeld net na het opstarten): nu alsnog een tijd, die de andere toestellen overnemen.
      if (lokaal.gewijzigd > online.gewijzigd) return stuur(lokaal);
      const nieuw = { ...lokaal, gewijzigd: Math.max(Date.now(), online.gewijzigd + 1) };
      this.toepassen(() => this.doelen.instellingen.zet(nieuw));
      stuur(nieuw);
    };

    const verwerk = () => {
      if (!data) return;
      verwerkFavorieten();
      verwerkInstellingen();
    };
    const uit = onSnapshot(
      pad,
      { includeMetadataChanges: true },
      (snap) => {
        const vanServer = this.vanServer.get('gebruiker') || !snap.metadata.fromCache;
        this.wacht.set('gebruiker', snap.metadata.hasPendingWrites);
        this.vanServer.set('gebruiker', vanServer);
        // De eerste stand op een nieuw toestel is alleen onze eigen naam en e-mail: daarop beslissen zou de instellingen online
        // overschrijven met de standaardwaarden van dit toestel.
        if (vanServer) {
          data = (snap.data() as typeof data) ?? {};
          verwerk();
        }
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
