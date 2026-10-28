import { describe, expect, it } from 'vitest';
import { herkenOmgeving, kiesScherm } from '../src/engine/platform';
import { alternatieven, HANDMATIG, kiesUitleg, kiesUitlegComputer, sleutelVoor, uitlegVoor, type Sleutel } from '../src/screens/installeren/stappen';
import { chromeLink } from '../src/screens/installeren/Installeren';
import UA_LIJST from '../tools/e2e/useragents.json';

/** Echte user-agents van alle combinaties (0.29.1), gedeeld met de browsertest tools/e2e/installeren.mjs. */
interface Toestel {
  naam: string;
  sleutel: Sleutel;
  ua: string;
  tablet?: boolean;
  mac?: boolean;
  computer?: boolean;
  app?: string;
}
const TOESTELLEN = UA_LIJST.lijst as Toestel[];
const omgevingVan = (x: Toestel) => herkenOmgeving({ ua: x.ua, ...(x.mac ? { platform: 'MacIntel', maxTouchPoints: 5 } : {}) });
const UA = (naam: string) => TOESTELLEN.find((x) => x.naam === naam)!.ua;

describe('installatiescherm of app (kiesScherm)', () => {
  it('geïnstalleerde app toont altijd de app (telefoon, tablet en computer)', () => {
    expect(kiesScherm({ standalone: true, mobiel: true, browserGekozen: false })).toBe('app');
    expect(kiesScherm({ standalone: true, mobiel: false, browserGekozen: false, geinstalleerd: true })).toBe('app');
  });

  it('in de browser: installatiescherm, tenzij gekozen voor de browser (ook op een telefoon, 0.29.1)', () => {
    expect(kiesScherm({ standalone: false, mobiel: true, browserGekozen: false })).toBe('installeren');
    expect(kiesScherm({ standalone: false, mobiel: true, browserGekozen: true })).toBe('app');
    expect(kiesScherm({ standalone: false, mobiel: false, browserGekozen: false })).toBe('installeren-computer');
    expect(kiesScherm({ standalone: false, mobiel: false, browserGekozen: true })).toBe('app');
  });

  it('al geïnstalleerd en de link opent in de browser: "Je hebt de app al"', () => {
    expect(kiesScherm({ standalone: false, mobiel: true, browserGekozen: false, geinstalleerd: true })).toBe('al-geinstalleerd');
    expect(kiesScherm({ standalone: false, mobiel: false, browserGekozen: false, geinstalleerd: true })).toBe('al-geinstalleerd');
    expect(kiesScherm({ standalone: false, mobiel: true, browserGekozen: true, geinstalleerd: true })).toBe('app');
  });
});

describe('toestel en browser herkennen (echte user-agents)', () => {
  it.each(TOESTELLEN.map((x) => [x.naam, x] as const))('%s → juiste stappen', (_, x) => {
    const o = omgevingVan(x);
    expect(sleutelVoor(o, !!x.computer)).toBe(x.sleutel);
    expect(o.mobiel).toBe(!x.computer);
    if (!x.computer) expect(o.tablet).toBe(!!x.tablet);
    if (x.app) expect(o.appNaam).toBe(x.app);
  });

  it('iOS-versie uit de user-agent (iOS 26 meldt zich als 18.6)', () => {
    expect(herkenOmgeving({ ua: UA('iPhone Chrome (iOS 15)') }).iosVersie).toBeCloseTo(15.7);
    expect(herkenOmgeving({ ua: UA('iPhone Safari (iOS 26)') })).toMatchObject({ safariVersie: 26, iosVersie: 18.6 });
  });

  it('een echte Mac (geen aanraakscherm) is een computer, een iPad als Mac niet', () => {
    expect(herkenOmgeving({ ua: UA('Mac Safari'), platform: 'MacIntel', maxTouchPoints: 0 })).toMatchObject({ os: 'anders', mobiel: false, browser: 'safari' });
    expect(herkenOmgeving({ ua: UA('iPad Safari'), platform: 'MacIntel', maxTouchPoints: 5 })).toMatchObject({ os: 'ios', tablet: true });
  });
});

describe('stappen per combinatie', () => {
  const uitleg = (naam: string) => {
    const x = TOESTELLEN.find((t) => t.naam === naam)!;
    const o = omgevingVan(x);
    return uitlegVoor(sleutelVoor(o, !!x.computer), o);
  };
  const tekst = (n: unknown): string => (Array.isArray(n) ? n.map(tekst).join('') : typeof n === 'object' && n ? tekst((n as { props: { children: unknown } }).props.children) : String(n ?? ''));
  const stappenTekst = (naam: string) => uitleg(naam).stappen.map((s) => tekst(s.tekst));

  it('iPhone Safari: Deel → Zet op beginscherm (iOS 26 eerst •••), met de pijl naar de goede knop', () => {
    expect(uitleg('iPhone Safari (iOS 18)')).toMatchObject({ pijl: 'onder-midden' });
    expect(uitleg('iPhone Safari (iOS 26)').stappen.map((s) => s.icoon)).toEqual(['meer', 'deel', 'plusVierkant', 'schakelaar', 'huis']);
    expect(uitleg('iPhone Safari (iOS 26)').pijl).toBe('onder-rechts');
    expect(uitleg('iPad Safari').pijl).toBe('boven-rechts');
  });

  it('iPhone vanaf iOS 16.4: Chrome, Edge en Firefox krijgen de deelknop-stappen, niet "open in Safari"', () => {
    for (const naam of ['iPhone Chrome', 'iPhone Edge', 'iPhone Firefox', 'iPad Chrome', 'iPad Edge', 'iPad Firefox']) {
      const u = uitleg(naam);
      expect(u.titel, naam).toBe('Zet de app op je beginscherm');
      expect(stappenTekst(naam).join(' '), naam).toContain('Zet op beginscherm');
      expect(u.kopieerLink, naam).toBeFalsy();
    }
    expect(stappenTekst('iPhone Chrome')[0]).toContain('adresbalk');
    expect(uitleg('iPhone Chrome').pijl).toBe('boven-rechts');
    expect(stappenTekst('iPhone Edge')[0]).toBe('Tik onderin op •••.');
    expect(uitleg('iPhone Edge').pijl).toBe('onder-midden');
    expect(stappenTekst('iPhone Firefox')[0]).toBe('Tik rechtsonder op ☰.');
    expect(uitleg('iPhone Firefox').pijl).toBe('onder-rechts');
  });

  it('oudere iOS-versie in een andere browser: "Open in Safari" met Kopieer link', () => {
    for (const naam of ['iPhone Chrome (iOS 15)', 'iPhone Firefox (iOS 16.3)']) {
      expect(uitleg(naam)).toMatchObject({ titel: 'Open deze pagina in Safari', kopieerLink: true });
    }
  });

  it('Android: per browser de eigen menunamen', () => {
    expect(uitleg('Android Chrome')).toMatchObject({ installeerKnop: true, pijl: 'boven-rechts' });
    expect(stappenTekst('Android Chrome')[1]).toBe('Kies App installeren of Toevoegen aan startscherm.');
    expect(stappenTekst('Android Samsung Internet')[1]).toBe('Kies Pagina toevoegen aan en dan Startscherm.');
    expect(uitleg('Android Samsung Internet').pijl).toBe('onder-rechts');
    expect(stappenTekst('Android Edge')[1]).toContain('Toevoegen aan telefoon');
    expect(stappenTekst('Android Firefox')[1]).toContain('Toevoegen aan startscherm');
    expect(stappenTekst('Android Opera')[1]).toContain('Toevoegen aan');
    for (const naam of ['Android Xiaomi', 'Android Huawei', 'Android onbekende browser']) expect(uitleg(naam), naam).toMatchObject({ openInChrome: true, kopieerLink: true });
  });

  it('ingebouwde browser: per app de juiste menuknop, Kopieer link en op Android Openen in Chrome', () => {
    for (const x of TOESTELLEN.filter((t) => t.sleutel.startsWith('inapp'))) {
      const o = omgevingVan(x);
      const u = uitlegVoor(x.sleutel, o);
      expect(u.titel, x.naam).toBe(x.sleutel === 'inapp-ios' ? 'Open deze pagina in Safari' : 'Open deze pagina in Chrome');
      expect(u.kopieerLink, x.naam).toBe(true);
      expect(!!u.openInChrome, x.naam).toBe(x.sleutel === 'inapp-android');
      if (x.app) expect(tekst(u.intro), x.naam).toContain(x.app);
    }
    expect(stappenTekst('iPhone Instagram').slice(0, 2)).toEqual(['Tik op ••• (meestal rechtsboven).', 'Kies Openen in externe browser.']);
    expect(stappenTekst('iPhone WhatsApp').slice(0, 2)).toEqual(['Tik rechtsonder op het kompas-icoon (of op •••).', 'Kies Openen in Safari.']);
    expect(stappenTekst('Android Gmail').slice(0, 2)).toEqual(['Tik op ⋮ (meestal rechtsboven).', 'Kies Openen in Chrome.']);
  });

  it('computer: Chrome/Edge via adresbalk, Safari via Archief, Firefox gewoon in de browser', () => {
    expect(uitleg('Laptop Chrome')).toMatchObject({ installeerKnop: true });
    expect(uitleg('Laptop Chrome').stappen[0]!.icoon).toBe('computer');
    expect(uitleg('Laptop Edge').stappen).toHaveLength(3);
    expect(stappenTekst('Mac Safari')[0]).toBe('Kies in de menubalk Archief → Voeg toe aan Dock.');
    expect(uitleg('Laptop Firefox')).toMatchObject({ titel: 'Gewoon in de browser gebruiken', kopieerLink: true });
    expect(kiesUitlegComputer(herkenOmgeving({ ua: UA('Laptop Firefox') })).titel).toBe('Gewoon in de browser gebruiken');
  });

  it('onbekend toestel: algemene stappen', () => {
    const o = herkenOmgeving({ ua: 'Mozilla/5.0 (Mobile; KaiOS 3.0; rv:84.0) Gecko/84.0 Firefox/84.0' });
    expect(sleutelVoor(o)).toBe('onbekend');
    expect(tekst(kiesUitleg(o).intro)).toContain('Toevoegen aan beginscherm');
  });
});

describe('Lukt het niet? en Andere browser of telefoon', () => {
  const telefoon = TOESTELLEN.filter((x) => !x.computer);
  it('elke telefoon/tablet heeft andere mogelijke stappen', () => {
    for (const x of telefoon) expect(alternatieven(x.sleutel, omgevingVan(x)).length, x.naam).toBeGreaterThan(0);
  });
  it('iPhone-browsers: als laatste redmiddel Safari; Android: Chrome', () => {
    const o = omgevingVan(TOESTELLEN.find((x) => x.naam === 'iPhone Chrome')!);
    expect(alternatieven('ios-chrome', o).map((a) => a.titel)).toContain('Open deze pagina in Safari');
    const a = omgevingVan(TOESTELLEN.find((x) => x.naam === 'Android Firefox')!);
    expect(alternatieven('android-firefox', a)[0]!.openInChrome).toBe(true);
  });
  it('in de keuzelijst staat elke combinatie met eigen stappen, zonder dubbele', () => {
    const sleutels = HANDMATIG.flatMap((g) => g.keuzes.map((k) => k.sleutel));
    expect(new Set(sleutels).size).toBe(sleutels.length);
    for (const s of [
      'ios-safari-26',
      'ios-safari',
      'ios-chrome',
      'ios-edge',
      'ios-firefox',
      'inapp-ios',
      'android-chrome',
      'android-samsung',
      'android-firefox',
      'android-edge',
      'android-opera',
      'android-anders',
      'inapp-android',
      'computer-chrome',
      'computer-edge',
      'computer-safari',
      'computer-firefox',
    ])
      expect(sleutels).toContain(s);
  });
});

describe('Android: link direct in Chrome openen', () => {
  it('intent-link naar Chrome met dezelfde pagina als terugval', () => {
    const l = chromeLink('https://woutvb073.github.io/trainersapp/?x=1');
    expect(l).toBe(
      'intent://woutvb073.github.io/trainersapp/?x=1#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=https%3A%2F%2Fwoutvb073.github.io%2Ftrainersapp%2F%3Fx%3D1;end',
    );
  });
});
