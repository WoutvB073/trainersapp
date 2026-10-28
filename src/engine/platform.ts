/**
 * Herkent toestel en browser, zodat het installatiescherm precies de juiste stappen toont.
 * `herkenOmgeving` en `kiesScherm` zijn pure functies (getest in tests/installeren.test.ts).
 * Overgenomen uit IntervalFit en ingekort.
 */

export type Besturingssysteem = 'ios' | 'android' | 'anders';
export type Browser = 'safari' | 'chrome' | 'samsung' | 'firefox' | 'edge' | 'opera' | 'xiaomi' | 'huawei' | 'inapp' | 'anders';

export interface Omgeving {
  os: Besturingssysteem;
  browser: Browser;
  /** Naam van de app met de ingebouwde browser, bv. "WhatsApp". */
  appNaam?: string;
  /** Safari-versie (hoofdnummer) op iPhone/iPad, bv. 26. */
  safariVersie?: number;
  /** iOS-versie op iPhone/iPad, bv. 18.5 (een iPad die zich als Mac voordoet: onbekend). */
  iosVersie?: number;
  tablet: boolean;
  /** Telefoon of tablet. */
  mobiel: boolean;
}

interface Invoer {
  ua: string;
  platform?: string;
  maxTouchPoints?: number;
  grofAanwijzen?: boolean;
}

const IN_APP: [RegExp, string][] = [
  [/WhatsApp/i, 'WhatsApp'],
  [/Instagram/, 'Instagram'],
  // Messenger vóór Facebook: Messenger zet ook FBAN/FB_IAB in de user-agent.
  [/Messenger|MESSENGER|Orca-Android/, 'Messenger'],
  [/FBAN|FBAV|FB_IAB|FBIOS|\[FB/, 'Facebook'],
  [/musical_ly|BytedanceWebview|TikTok/i, 'TikTok'],
  [/Snapchat/, 'Snapchat'],
  [/LinkedInApp/, 'LinkedIn'],
  [/Twitter|TwitterAndroid/, 'X'],
  [/Telegram/i, 'Telegram'],
  [/\bGmail\b|GoogleMail/i, 'Gmail'], // i18n-ok
  [/Outlook-(iOS|Android)|\bOutlook\//i, 'Outlook'], // i18n-ok
];

export function herkenOmgeving({ ua, platform = '', maxTouchPoints = 0, grofAanwijzen = false }: Invoer): Omgeving {
  const iPadOS = platform === 'MacIntel' && maxTouchPoints > 1; // iPad doet zich voor als Mac
  const ios = /iPhone|iPad|iPod/.test(ua) || iPadOS;
  const android = /Android/i.test(ua);
  const os: Besturingssysteem = ios ? 'ios' : android ? 'android' : 'anders';
  const tablet = /iPad/.test(ua) || iPadOS || (android && !/Mobile/.test(ua)) || /Tablet/i.test(ua);
  const mobiel = ios || android || /Mobi|Tablet/i.test(ua) || (maxTouchPoints > 1 && grofAanwijzen);

  const inApp = IN_APP.find(([re]) => re.test(ua));
  let browser: Browser;
  let appNaam: string | undefined;
  if (inApp) {
    browser = 'inapp';
    appNaam = inApp[1];
  } else if (android && /; wv\)/.test(ua)) {
    browser = 'inapp';
  } else if (ios) {
    if (/CriOS/.test(ua)) browser = 'chrome';
    else if (/FxiOS/.test(ua)) browser = 'firefox';
    else if (/EdgiOS/.test(ua)) browser = 'edge';
    else if (/OPiOS|OPT\//.test(ua)) browser = 'opera';
    else if (/GSA\/|DuckDuckGo|YaBrowser|Brave/.test(ua)) browser = 'anders';
    else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = 'safari';
    else browser = 'inapp'; // geen "Safari/" = ingebouwde browser van een onbekende app
  } else if (/SamsungBrowser/.test(ua)) browser = 'samsung';
  else if (/MiuiBrowser|XiaoMi\/MiuiBrowser|Mint Browser/i.test(ua)) browser = 'xiaomi';
  else if (/HuaweiBrowser|HuaweiBrowser\//i.test(ua)) browser = 'huawei';
  else if (/Edg(A|e)?\//.test(ua)) browser = 'edge';
  else if (/OPR\/|Opera/.test(ua)) browser = 'opera';
  else if (/Firefox\//.test(ua)) browser = 'firefox';
  else if (/UCBrowser|VivoBrowser|HeyTapBrowser|OppoBrowser|YaBrowser|DuckDuckGo|Silk\//.test(ua)) browser = 'anders';
  else if (/Chrome\//.test(ua)) browser = 'chrome';
  else if (/Safari\//.test(ua)) browser = 'safari';
  else browser = 'anders';

  const v = ios && browser === 'safari' ? /Version\/(\d+)/.exec(ua) : null;
  const iv = ios ? /OS (\d+)[_.](\d+)/.exec(ua) : null;
  return {
    os,
    browser,
    ...(appNaam ? { appNaam } : {}),
    ...(v ? { safariVersie: Number(v[1]) } : {}),
    ...(iv ? { iosVersie: Number(iv[1]) + Number(iv[2]) / 10 } : {}),
    tablet,
    mobiel,
  };
}

export type Scherm = 'app' | 'installeren' | 'installeren-computer' | 'al-geinstalleerd';

/**
 * Wat tonen we?
 * - Geïnstalleerd (vanaf het beginscherm): altijd de app.
 * - Eerder gekozen voor "Gewoon in de browser gebruiken" (telefoon, tablet of computer, 0.29.1): de app.
 * - De app is al geïnstalleerd, maar de link opent in de browser: "Je hebt de app al" (met "toch in de browser").
 * - Anders het installatiescherm (op de computer met de uitleg voor de computer).
 */
export function kiesScherm({ standalone, mobiel, browserGekozen, geinstalleerd = false }: { standalone: boolean; mobiel: boolean; browserGekozen: boolean; geinstalleerd?: boolean }): Scherm {
  if (standalone || browserGekozen) return 'app';
  if (geinstalleerd) return 'al-geinstalleerd';
  return mobiel ? 'installeren' : 'installeren-computer';
}

export const omgeving: Omgeving =
  typeof navigator === 'undefined'
    ? { os: 'anders', browser: 'anders', tablet: false, mobiel: false }
    : herkenOmgeving({
        ua: navigator.userAgent,
        platform: navigator.platform,
        maxTouchPoints: navigator.maxTouchPoints,
        grofAanwijzen: typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches,
      });

/** Draait de app als geïnstalleerde app (vanaf het beginscherm / als app-venster)? */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.matchMedia?.('(display-mode: minimal-ui)').matches ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

const KEUZE = 'trainersapp.browserGekozen';
const GEINSTALLEERD = 'trainersapp.geinstalleerd';

/**
 * Is de app op dit toestel al eens als app geopend of geïnstalleerd (0.29.1)? Op Android en de computer delen browser en
 * app dezelfde opslag; op de iPhone niet (daar zie je dit scherm dus niet).
 */
export function alGeinstalleerd(): boolean {
  try {
    return localStorage.getItem(GEINSTALLEERD) === '1';
  } catch {
    return false;
  }
}

export function zetGeinstalleerd(aan: boolean): void {
  try {
    if (aan) localStorage.setItem(GEINSTALLEERD, '1');
    else localStorage.removeItem(GEINSTALLEERD);
  } catch {
    /* niet erg */
  }
}

/** Eerder gekozen voor "Gewoon in de browser gebruiken" (telefoon, tablet of computer)? */
export function browserGekozen(): boolean {
  try {
    return localStorage.getItem(KEUZE) === '1';
  } catch {
    return false;
  }
}

export function zetBrowserGekozen(aan: boolean): void {
  try {
    if (aan) localStorage.setItem(KEUZE, '1');
    else localStorage.removeItem(KEUZE);
  } catch {
    /* niet erg: dan vragen we het de volgende keer opnieuw */
  }
}
