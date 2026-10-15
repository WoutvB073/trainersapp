import { describe, expect, it } from 'vitest';
import { herkenOmgeving, kiesScherm } from '../src/engine/platform';
import { kiesUitleg, kiesUitlegComputer } from '../src/screens/installeren/stappen';

const UA = {
  iphoneSafari18:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  iphoneSafari26:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.7339.101 Mobile/15E148 Safari/604.1',
  iphoneWhatsApp:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/25.20.0',
  ipadAlsMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  samsung:
    'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-A515F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
  androidTablet:
    'Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  desktopChrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  desktopEdge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
  desktopFirefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0',
};

describe('installatiescherm of app (kiesScherm)', () => {
  it('geïnstalleerde app toont altijd de app (telefoon, tablet en computer)', () => {
    expect(kiesScherm({ standalone: true, mobiel: true, browserGekozen: false })).toBe('app');
    expect(kiesScherm({ standalone: true, mobiel: false, browserGekozen: false })).toBe('app');
  });

  it('telefoon/tablet in de browser: alleen het installatiescherm, ook met een eerdere keuze', () => {
    expect(kiesScherm({ standalone: false, mobiel: true, browserGekozen: false })).toBe('installeren');
    expect(kiesScherm({ standalone: false, mobiel: true, browserGekozen: true })).toBe('installeren');
  });

  it('computer in de browser: uitleg, tenzij gekozen voor de browser', () => {
    expect(kiesScherm({ standalone: false, mobiel: false, browserGekozen: false })).toBe('installeren-computer');
    expect(kiesScherm({ standalone: false, mobiel: false, browserGekozen: true })).toBe('app');
  });
});

describe('toestel en browser herkennen', () => {
  it('iPhone Safari met versie', () => {
    expect(herkenOmgeving({ ua: UA.iphoneSafari18 })).toMatchObject({ os: 'ios', browser: 'safari', safariVersie: 18, mobiel: true, tablet: false });
    expect(herkenOmgeving({ ua: UA.iphoneSafari26 }).safariVersie).toBe(26);
  });

  it('iPhone met Chrome en ingebouwde browser van WhatsApp', () => {
    expect(herkenOmgeving({ ua: UA.iphoneChrome }).browser).toBe('chrome');
    expect(herkenOmgeving({ ua: UA.iphoneWhatsApp })).toMatchObject({ browser: 'inapp', appNaam: 'WhatsApp' });
  });

  it('iPad die zich voordoet als Mac telt als tablet', () => {
    expect(herkenOmgeving({ ua: UA.ipadAlsMac, platform: 'MacIntel', maxTouchPoints: 5 })).toMatchObject({ os: 'ios', tablet: true, mobiel: true });
    // Een echte Mac (geen aanraakscherm) is een computer.
    expect(herkenOmgeving({ ua: UA.macSafari, platform: 'MacIntel', maxTouchPoints: 0 })).toMatchObject({ os: 'anders', mobiel: false, browser: 'safari' });
  });

  it('Android: telefoon, tablet, Chrome en Samsung Internet', () => {
    expect(herkenOmgeving({ ua: UA.androidChrome })).toMatchObject({ os: 'android', browser: 'chrome', mobiel: true, tablet: false });
    expect(herkenOmgeving({ ua: UA.androidTablet })).toMatchObject({ tablet: true, mobiel: true });
    expect(herkenOmgeving({ ua: UA.samsung }).browser).toBe('samsung');
  });

  it('computers', () => {
    expect(herkenOmgeving({ ua: UA.desktopChrome })).toMatchObject({ os: 'anders', browser: 'chrome', mobiel: false });
    expect(herkenOmgeving({ ua: UA.desktopEdge }).browser).toBe('edge');
    expect(herkenOmgeving({ ua: UA.desktopFirefox }).browser).toBe('firefox');
  });
});

describe('juiste uitleg per toestel', () => {
  const uitleg = (ua: string, extra = {}) => kiesUitleg(herkenOmgeving({ ua, ...extra }));

  it('iPhone Safari: deelknop → Zet op beginscherm, met pijl', () => {
    const oud = uitleg(UA.iphoneSafari18);
    expect(oud.titel).toBe('Zet de app op je beginscherm');
    expect(oud.stappen[0]!.icoon).toBe('deel');
    expect(oud.pijl).toBe('onder-midden');
    const nieuw = uitleg(UA.iphoneSafari26);
    expect(nieuw.stappen.map((s) => s.icoon)).toEqual(['meer', 'deel', 'plusVierkant', 'schakelaar', 'huis']);
    expect(nieuw.pijl).toBe('onder-rechts');
    expect(uitleg(UA.ipadAlsMac, { platform: 'MacIntel', maxTouchPoints: 5 }).pijl).toBe('boven-rechts');
  });

  it('iPhone met een andere browser: openen in Safari met kopieerknop', () => {
    const u = uitleg(UA.iphoneChrome);
    expect(u.titel).toBe('Open deze pagina in Safari');
    expect(u.kopieerLink).toBe(true);
  });

  it('ingebouwde browser: openen in Safari/Chrome', () => {
    expect(uitleg(UA.iphoneWhatsApp).titel).toBe('Open deze pagina in Safari');
  });

  it('Android Chrome: installatieknop als die kan, anders menu ⋮', () => {
    const u = uitleg(UA.androidChrome);
    expect(u.installeerKnop).toBe(true);
    expect(u.stappen[0]!.icoon).toBe('puntjes');
    expect(u.pijl).toBe('boven-rechts');
  });

  it('computer: Chrome/Edge via adresbalk, Firefox via andere browser', () => {
    const chrome = kiesUitlegComputer(herkenOmgeving({ ua: UA.desktopChrome }));
    expect(chrome.installeerKnop).toBe(true);
    expect(chrome.stappen[0]!.icoon).toBe('computer');
    expect(kiesUitlegComputer(herkenOmgeving({ ua: UA.desktopEdge })).stappen).toHaveLength(3);
    expect(kiesUitlegComputer(herkenOmgeving({ ua: UA.desktopFirefox })).titel).toBe('Installeren via Chrome of Edge');
  });
});
