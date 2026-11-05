import { useSyncExternalStore } from 'react';
import { emulatorGekozen, FIREBASE_CONFIG, onlineBeschikbaar } from '../online/config';
import { CODE_TEKENS } from '../online/samenvoegen';
import { online } from './account';
import { t as vt } from '../i18n/t';

/**
 * Korte deellinks (0.31.3): de inhoud staat online onder een willekeurige code, de link is `#/d/<code>`. Lange links werden door
 * WhatsApp afgekapt. Maken lukt ook zonder account (anoniem inloggen, alleen daarvoor). Lezen en maken gaan rechtstreeks via de
 * REST-API, zodat een gedeelde link ook in een ingebouwde browser meteen opent, zonder de Firebase-code te laden. Lukt het niet
 * (geen internet), dan volgt de lange link, die gecomprimeerd is.
 */

/** Soort inhoud: dezelfde letters als de lange links (`#/t/…`, `#/c/…`, `#/o/…`, `#/w/…`). */
export type LinkSoort = 't' | 'c' | 'o' | 'w';
const SOORTEN: readonly string[] = ['t', 'c', 'o', 'w'];

export const CODE_LENGTE = 12;
/** Grens uit firestore.rules. */
export const MAX_LINK = 200000;
const LINK_WACHTTIJD = 6000;

const isSoort = (x: unknown): x is LinkSoort => typeof x === 'string' && SOORTEN.includes(x);
export const isLinkCode = (c: string) => new RegExp(`^[${CODE_TEKENS}]{${CODE_LENGTE}}$`).test(c);

/** Willekeurige code, niet te raden (cryptografisch toeval, zonder verwarrende tekens). */
export function nieuweLinkCode(bytes: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  const grens = 256 - (256 % CODE_TEKENS.length);
  let code = '';
  while (code.length < CODE_LENGTE) {
    for (const b of bytes(CODE_LENGTE * 2)) {
      if (b < grens && code.length < CODE_LENGTE) code += CODE_TEKENS[b % CODE_TEKENS.length];
    }
  }
  return code;
}

export const appAdres = () => `${location.origin}${import.meta.env.BASE_URL}`;
export const korteLink = (code: string) => `${appAdres()}#/d/${code}`; // i18n-ok
export const langeLink = (soort: LinkSoort, code: string) => `${appAdres()}#/${soort}/${code}`; // i18n-ok

/** Deelbericht: de naam op de eerste regel, de link op een eigen regel. */
export const deelTekst = (regel: string, url: string) => `${regel}\n${url}`;

function basis(): string {
  const emulator = emulatorGekozen();
  const host = emulator ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com'; // i18n-ok
  return `${host}/v1/projects/${emulator ? 'demo-toptraining' : FIREBASE_CONFIG?.projectId}/databases/(default)/documents/links`; // i18n-ok
}

function opslag(): Pick<Storage, 'getItem' | 'setItem'> | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

/** Korte links maken kan online. Browsertests op de eigen computer blijven van het echte project af, tenzij ze het vragen. */
function kortMogelijk(): boolean {
  if (!onlineBeschikbaar() || (typeof navigator !== 'undefined' && navigator.onLine === false)) return false;
  const lokaal = typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
  return !lokaal || emulatorGekozen() || opslag()?.getItem('trainersapp.echteLinks') === '1';
}

// ---------- links van dit toestel (intrekken, en dezelfde inhoud niet nog eens opslaan) ----------

export interface EigenLink {
  code: string;
  soort: LinkSoort;
  /** "Circuittraining: MT". */
  regel: string;
  maker: string;
  gemaakt: number;
  vingerafdruk?: string;
}

const EIGEN = 'trainersapp.deellinks';
let eigen: EigenLink[] = (() => {
  try {
    const x = JSON.parse(opslag()?.getItem(EIGEN) ?? '[]') as unknown;
    return Array.isArray(x) ? (x as EigenLink[]).filter((l) => l && typeof l.code === 'string') : [];
  } catch {
    return [];
  }
})();
const luisteraars = new Set<() => void>();

function zetEigen(lijst: EigenLink[]) {
  eigen = lijst;
  try {
    opslag()?.setItem(EIGEN, JSON.stringify(lijst));
  } catch {
    /* vol of geblokkeerd */
  }
  for (const cb of luisteraars) cb();
}

export const eigenLinks = () => eigen;
const abonneer = (cb: () => void) => {
  luisteraars.add(cb);
  return () => luisteraars.delete(cb);
};
export const useEigenLinks = () => useSyncExternalStore(abonneer, eigenLinks, eigenLinks);

async function vingerafdruk(tekst: string): Promise<string | undefined> {
  try {
    const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tekst));
    return [...new Uint8Array(h)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return undefined;
  }
}

async function maak(soort: LinkSoort, data: string, regel: string): Promise<string | null> {
  const afdruk = await vingerafdruk(`${soort}:${data}`);
  const bestaand = afdruk ? eigen.find((l) => l.vingerafdruk === afdruk) : undefined;
  if (bestaand) return bestaand.code;
  const toegang = await (await online()).linkToegang();
  if (!toegang) return null;
  const gemaakt = Date.now();
  for (let poging = 0; poging < 3; poging += 1) {
    const code = nieuweLinkCode();
    const r = await fetch(`${basis()}?documentId=${code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${toegang.token}` }, // i18n-ok
      body: JSON.stringify({ fields: { soort: { stringValue: soort }, data: { stringValue: data }, maker: { stringValue: toegang.uid }, gemaakt: { integerValue: String(gemaakt) } } }),
    });
    if (r.ok) {
      zetEigen([{ code, soort, regel, maker: toegang.uid, gemaakt, ...(afdruk ? { vingerafdruk: afdruk } : {}) }, ...eigen]);
      return code;
    }
    // De code bestond al: een nieuwe proberen.
    if (r.status !== 409) return null;
  }
  return null;
}

/** Korte code voor deze inhoud, of null als dat niet lukt (dan de lange link). */
export async function maakLink(soort: LinkSoort, data: string, regel: string): Promise<string | null> {
  if (!kortMogelijk() || new TextEncoder().encode(data).length > MAX_LINK) return null;
  const tijd = new Promise<null>((klaar) => setTimeout(() => klaar(null), LINK_WACHTTIJD));
  return Promise.race([maak(soort, data, regel).catch(() => null), tijd]);
}

/** Link intrekken. Lukt alleen met het account (of de anonieme sessie) dat hem maakte; geeft anders false. */
export async function trekLinkIn(l: EigenLink): Promise<boolean> {
  const toegang = await (await online()).linkToegang(false);
  if (toegang?.uid !== l.maker) return false;
  const r = await fetch(`${basis()}/${l.code}`, { method: 'DELETE', headers: { Authorization: `Bearer ${toegang.token}` } }); // i18n-ok
  if (!r.ok && r.status !== 404) throw new Error(`Link intrekken: ${r.status}`);
  zetEigen(eigen.filter((x) => x.code !== l.code));
  return true;
}

/** Account weg: deze links zijn al verwijderd. */
export const vergeetLinks = (codes: readonly string[]) => zetEigen(eigen.filter((l) => !codes.includes(l.code)));

// ---------- openen ----------

export interface LinkInhoud {
  soort: LinkSoort;
  code: string;
}
export type Opgehaald = LinkInhoud | 'weg' | 'geen-verbinding';

/** Laatst geopende links, zodat een trainer ze op het veld ook zonder bereik nog ziet. */
const KOPIEEN = 'trainersapp.linkkopieen';
const MAX_KOPIEEN = 5;
const geopend = new Map<string, LinkInhoud>();

function leesKopieen(): Record<string, LinkInhoud> {
  try {
    return (JSON.parse(opslag()?.getItem(KOPIEEN) ?? '{}') as Record<string, LinkInhoud>) ?? {};
  } catch {
    return {};
  }
}

function zetKopieen(k: Record<string, LinkInhoud>) {
  try {
    opslag()?.setItem(KOPIEEN, JSON.stringify(k));
  } catch {
    /* vol of geblokkeerd: dan alleen zolang de pagina open is */
  }
}

/** Inhoud van een korte link. Wat ingetrokken is, verdwijnt ook uit de kopieën. */
export async function haalLink(code: string): Promise<Opgehaald> {
  if (!isLinkCode(code)) return 'weg';
  const al = geopend.get(code);
  if (al) return al;
  try {
    const r = await fetch(`${basis()}/${code}`, { cache: 'no-store' });
    if (r.status === 404 || r.status === 403) {
      const { [code]: _weg, ...rest } = leesKopieen();
      void _weg;
      zetKopieen(rest);
      return 'weg';
    }
    if (!r.ok) throw new Error(String(r.status));
    const d = (await r.json()) as { fields?: { soort?: { stringValue?: string }; data?: { stringValue?: string } } };
    const soort = d.fields?.soort?.stringValue;
    const data = d.fields?.data?.stringValue;
    if (!isSoort(soort) || !data) return 'weg';
    const inhoud = { soort, code: data };
    geopend.set(code, inhoud);
    zetKopieen(Object.fromEntries([...Object.entries(leesKopieen()).filter(([k]) => k !== code), [code, inhoud] as const].slice(-MAX_KOPIEEN)));
    return inhoud;
  } catch {
    return leesKopieen()[code] ?? 'geen-verbinding';
  }
}

// ---------- delen ----------

export interface DeelPaneelStand {
  /** Link wordt gemaakt. */
  bezig: boolean;
  titel?: string;
  tekst?: string;
}

let paneel: DeelPaneelStand | null = null;
const paneelLuisteraars = new Set<() => void>();
export function zetDeelPaneel(p: DeelPaneelStand | null) {
  paneel = p;
  for (const cb of paneelLuisteraars) cb();
}
const abonneerPaneel = (cb: () => void) => {
  paneelLuisteraars.add(cb);
  return () => paneelLuisteraars.delete(cb);
};
export const useDeelPaneel = () => useSyncExternalStore(abonneerPaneel, () => paneel, () => paneel);

/**
 * Inhoud delen: korte link maken (anders de lange), dan het deelmenu van de telefoon of kopiëren. Het maken duurt even, en dan mag
 * een browser het deelmenu soms niet meer openen zonder nieuwe tik: daarvoor is er het paneel met een eigen knop.
 */
export async function deelInhoud(d: { soort: LinkSoort; code: string; titel: string; regel: string }): Promise<string> {
  zetDeelPaneel({ bezig: true });
  const kort = await maakLink(d.soort, d.code, d.regel);
  const tekst = deelTekst(d.regel, kort ? korteLink(kort) : langeLink(d.soort, d.code));
  if (navigator.share) {
    try {
      await navigator.share({ title: d.titel, text: tekst });
      zetDeelPaneel(null);
      return '';
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        zetDeelPaneel(null);
        return '';
      }
    }
  }
  try {
    await navigator.clipboard.writeText(tekst);
    zetDeelPaneel(null);
    return vt('Link gekopieerd');
  } catch {
    zetDeelPaneel({ bezig: false, titel: d.titel, tekst });
    return '';
  }
}
