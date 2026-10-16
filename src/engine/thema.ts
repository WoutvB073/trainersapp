import { useSyncExternalStore } from 'react';

/**
 * Clubkleuren en licht/donker. De kleuren van de app (koppen, knoppen, badges, tegels) komen uit CSS-variabelen die hier
 * per thema en modus worden gezet. Het veld en de teamkleuren in de animaties staan in thema.css en veranderen nooit:
 * die moeten in elk thema duidelijk blijven.
 */

export type ThemaId = 'standaard' | 'rood' | 'blauw' | 'geel' | 'groen' | 'oranje' | 'paars' | 'zwart';
export type Modus = 'licht' | 'donker' | 'auto';

/** Kleuren die per clubkleur verschillen. */
interface ThemaKleuren {
  /** Kopbalk, hoofdknoppen, gekozen chips. */
  primair: string;
  /** Tekst en iconen op `primair`. */
  opPrimair: string;
  /** De themakleur als tekst of icoon op de achtergrond of een kaart (moet daar leesbaar zijn). */
  primairTekst: string;
  /** Lichte tint (badges, gekozen tegels) en de tekst daarop. */
  primairLicht: string;
  primairDonker: string;
  /** Tweede kleur: focusrand, knop in een melding. */
  accent: string;
  opAccent: string;
  accentLicht: string;
}

export interface Thema {
  id: ThemaId;
  naam: string;
  licht: ThemaKleuren;
  donker: ThemaKleuren;
}

export const THEMAS: Thema[] = [
  {
    id: 'standaard',
    naam: 'Groen (standaard)',
    licht: { primair: '#0f6b3a', opPrimair: '#ffffff', primairTekst: '#0f6b3a', primairLicht: '#e3f2e8', primairDonker: '#0a5229', accent: '#c2410c', opAccent: '#ffffff', accentLicht: '#fff0e6' },
    donker: { primair: '#16733f', opPrimair: '#ffffff', primairTekst: '#6fd59a', primairLicht: '#1d3a29', primairDonker: '#b8f0cf', accent: '#ff9a5c', opAccent: '#1a0f08', accentLicht: '#3a2418' },
  },
  {
    id: 'rood',
    naam: 'Rood-wit',
    licht: { primair: '#c8102e', opPrimair: '#ffffff', primairTekst: '#b00e28', primairLicht: '#fde8eb', primairDonker: '#8f0b20', accent: '#1f3a5f', opAccent: '#ffffff', accentLicht: '#e8eef6' },
    donker: { primair: '#b40f29', opPrimair: '#ffffff', primairTekst: '#ff8f9f', primairLicht: '#3d1a20', primairDonker: '#ffd0d7', accent: '#9cc0f0', opAccent: '#0c1726', accentLicht: '#1d2a3d' },
  },
  {
    id: 'blauw',
    naam: 'Blauw-wit',
    licht: { primair: '#1b4fbf', opPrimair: '#ffffff', primairTekst: '#1b4fbf', primairLicht: '#e5edfb', primairDonker: '#133a8c', accent: '#b45309', opAccent: '#ffffff', accentLicht: '#fef3e2' },
    donker: { primair: '#2556c4', opPrimair: '#ffffff', primairTekst: '#93b4ff', primairLicht: '#1a2742', primairDonker: '#d4e1ff', accent: '#ffb547', opAccent: '#1f1405', accentLicht: '#3a2c14' },
  },
  {
    id: 'geel',
    naam: 'Geel-zwart',
    licht: { primair: '#ffd100', opPrimair: '#141414', primairTekst: '#6e5600', primairLicht: '#fff6cc', primairDonker: '#4f3e00', accent: '#141414', opAccent: '#ffd100', accentLicht: '#ececec' },
    donker: { primair: '#ffd100', opPrimair: '#141414', primairTekst: '#ffd84d', primairLicht: '#3a3210', primairDonker: '#fff1b3', accent: '#ffd100', opAccent: '#141414', accentLicht: '#2e2e2e' },
  },
  {
    id: 'groen',
    naam: 'Groen-wit (fris)',
    // Fris lichtgroen met donkere tekst (duidelijk anders dan het standaard donkergroen).
    licht: { primair: '#3fd07a', opPrimair: '#0b2614', primairTekst: '#15803d', primairLicht: '#e3f9ec', primairDonker: '#0f5f2d', accent: '#0369a1', opAccent: '#ffffff', accentLicht: '#e0f2fe' },
    donker: { primair: '#3fd07a', opPrimair: '#0b2614', primairTekst: '#74e3a4', primairLicht: '#163826', primairDonker: '#c6f6d8', accent: '#7dd3fc', opAccent: '#06202e', accentLicht: '#10303f' },
  },
  {
    id: 'oranje',
    naam: 'Oranje',
    licht: { primair: '#c2410c', opPrimair: '#ffffff', primairTekst: '#b23c0b', primairLicht: '#ffedd5', primairDonker: '#8a2f09', accent: '#1f2a33', opAccent: '#ffffff', accentLicht: '#e9eef1' },
    donker: { primair: '#c2410c', opPrimair: '#ffffff', primairTekst: '#ffa066', primairLicht: '#3d2414', primairDonker: '#ffe0c7', accent: '#a9bccf', opAccent: '#101820', accentLicht: '#1f2a33' },
  },
  {
    id: 'paars',
    naam: 'Paars',
    licht: { primair: '#6d28d9', opPrimair: '#ffffff', primairTekst: '#6d28d9', primairLicht: '#efe7fd', primairDonker: '#4c1d95', accent: '#c2410c', opAccent: '#ffffff', accentLicht: '#fff0e6' },
    donker: { primair: '#7c3aed', opPrimair: '#ffffff', primairTekst: '#c4a8ff', primairLicht: '#2b1f47', primairDonker: '#e9ddff', accent: '#ff9a5c', opAccent: '#1a0f08', accentLicht: '#3a2418' },
  },
  {
    id: 'zwart',
    naam: 'Zwart-goud',
    licht: { primair: '#161616', opPrimair: '#f2c14e', primairTekst: '#161616', primairLicht: '#f8edcc', primairDonker: '#5c4500', accent: '#8a6400', opAccent: '#ffffff', accentLicht: '#fbf3dc' },
    donker: { primair: '#f2c14e', opPrimair: '#161616', primairTekst: '#f2c14e', primairLicht: '#3a2f12', primairDonker: '#fbe6ad', accent: '#f2c14e', opAccent: '#161616', accentLicht: '#2b2617' },
  },
];

/** Kleuren die alleen van licht/donker afhangen (achtergrond, tekst, badges, waarschuwingen). */
const BASIS: Record<'licht' | 'donker', Record<string, string>> = {
  licht: {
    '--achtergrond': '#f4f7f5',
    '--kaart': '#ffffff',
    '--tekst': '#15211b',
    '--tekst-2': '#4f5e56',
    '--rand': '#dbe3de',
    '--makkelijker': '#1c7c54',
    '--op-makkelijker': '#ffffff',
    '--makkelijker-licht': '#e5f5ec',
    '--moeilijker': '#c2410c',
    '--op-moeilijker': '#ffffff',
    '--moeilijker-licht': '#fdeee4',
    '--combi': '#5b3fd0',
    '--op-combi': '#ffffff',
    '--combi-licht': '#eeeafd',
    '--eigen': '#8a5a00',
    '--eigen-licht': '#fff4cc',
    '--waarschuwing': '#a33a05',
    '--waarschuwing-licht': '#fff4e6',
    '--fout': '#a51d1d',
    '--fout-licht': '#fff0f0',
    '--legenda-bal': '#15211b',
    '--legenda-loop': '#c79100',
    '--legenda-dribbel': '#15211b',
    '--schaduw': '0 1px 2px rgb(16 40 26 / 0.06), 0 4px 14px rgb(16 40 26 / 0.07)',
  },
  donker: {
    '--achtergrond': '#0f1411',
    '--kaart': '#1a211d',
    '--tekst': '#e9efeb',
    '--tekst-2': '#a9b6af',
    '--rand': '#323d37',
    '--makkelijker': '#4cc38a',
    '--op-makkelijker': '#0b1a12',
    '--makkelijker-licht': '#173326',
    '--moeilijker': '#ff9a5c',
    '--op-moeilijker': '#1a0f08',
    '--moeilijker-licht': '#3a2418',
    '--combi': '#ab9cff',
    '--op-combi': '#151033',
    '--combi-licht': '#2a2450',
    '--eigen': '#ffd76a',
    '--eigen-licht': '#3a3010',
    '--waarschuwing': '#ffb38a',
    '--waarschuwing-licht': '#3a2418',
    '--fout': '#ff9b9b',
    '--fout-licht': '#3d1a1a',
    '--legenda-bal': '#e9efeb',
    '--legenda-loop': '#ffd23f',
    '--legenda-dribbel': '#e9efeb',
    '--schaduw': '0 1px 2px rgb(0 0 0 / 0.4), 0 4px 14px rgb(0 0 0 / 0.35)',
  },
};

/** Alle CSS-variabelen voor dit thema in deze modus. */
export function themaVariabelen(id: ThemaId, donker: boolean): Record<string, string> {
  const t = THEMAS.find((x) => x.id === id) ?? THEMAS[0]!;
  const k = donker ? t.donker : t.licht;
  return {
    ...BASIS[donker ? 'donker' : 'licht'],
    '--primair': k.primair,
    '--op-primair': k.opPrimair,
    '--primair-tekst': k.primairTekst,
    '--primair-licht': k.primairLicht,
    '--primair-donker': k.primairDonker,
    '--accent': k.accent,
    '--op-accent': k.opAccent,
    '--accent-licht': k.accentLicht,
  };
}

// ---------- contrast (WCAG) ----------

function lum(hex: string): number {
  const h = hex.replace('#', '');
  const v =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** Contrastverhouding (1–21) tussen twee kleuren. */
export function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
}

// ---------- keuze onthouden en toepassen ----------

export interface ThemaKeuze {
  thema: ThemaId;
  modus: Modus;
}

const SLEUTEL = 'trainersapp.thema';
const STANDAARD: ThemaKeuze = { thema: 'standaard', modus: 'licht' };

type Opslagplek = Pick<Storage, 'getItem' | 'setItem'>;

function opslag(): Opslagplek | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export function leesKeuze(plek: Opslagplek | undefined = opslag()): ThemaKeuze {
  try {
    const x = JSON.parse(plek?.getItem(SLEUTEL) ?? 'null') as Partial<ThemaKeuze> | null;
    const thema = THEMAS.some((t) => t.id === x?.thema) ? x!.thema! : STANDAARD.thema;
    const modus = x?.modus === 'donker' || x?.modus === 'auto' || x?.modus === 'licht' ? x.modus : STANDAARD.modus;
    return { thema, modus };
  } catch {
    return { ...STANDAARD };
  }
}

export function bewaarKeuze(k: ThemaKeuze, plek: Opslagplek | undefined = opslag()): void {
  try {
    plek?.setItem(SLEUTEL, JSON.stringify(k));
  } catch {
    /* niet erg */
  }
}

/** Is het nu donker? (Automatisch = wat de telefoon of computer zegt.) */
export function isDonker(modus: Modus): boolean {
  if (modus === 'auto') return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
  return modus === 'donker';
}

let huidig: ThemaKeuze = STANDAARD;
const luisteraars = new Set<() => void>();

/** Thema toepassen op de pagina (vóór de eerste weergave aanroepen, dan is er geen kleurflits). */
export function pasThemaToe(k: ThemaKeuze = leesKeuze()): void {
  huidig = k;
  if (typeof document === 'undefined') return;
  const donker = isDonker(k.modus);
  const root = document.documentElement;
  for (const [naam, waarde] of Object.entries(themaVariabelen(k.thema, donker))) root.style.setProperty(naam, waarde);
  root.dataset.theme = k.thema;
  root.dataset.modus = donker ? 'donker' : 'licht';
  root.style.colorScheme = donker ? 'dark' : 'light';
  // Kleur van de statusbalk/titelbalk (Android, installatie op de computer).
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', themaVariabelen(k.thema, donker)['--primair']!);
  for (const cb of luisteraars) cb();
}

export function kiesThema(k: ThemaKeuze): void {
  bewaarKeuze(k);
  pasThemaToe(k);
}

// Automatisch: meeschakelen als de telefoon van licht naar donker gaat.
if (typeof matchMedia !== 'undefined') {
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (huidig.modus === 'auto') pasThemaToe(huidig);
  });
}

const abonneer = (cb: () => void) => {
  luisteraars.add(cb);
  return () => luisteraars.delete(cb);
};
const nu = () => huidig;

/** Luisteren naar themawijzigingen (synchronisatie). */
export const abonneerThema = abonneer;

export function useThema(): ThemaKeuze {
  return useSyncExternalStore(abonneer, nu, nu);
}
