import { describe, expect, it } from 'vitest';
import { namenUitOpstellingen, nieuweOpstelling } from '../src/wedstrijd/wedstrijd';
import { spelersnamen } from '../src/wedstrijd/opslag';
import { verzoen } from '../src/online/samenvoegen';
import { leesHash } from '../src/router';
import { CODE_LENGTE, deelTekst, isLinkCode, nieuweLinkCode } from '../src/engine/deellink';
import { naarBase64Url, naarCode, uitBase64Url, uitCode } from '../src/training/training';
import { naarCode as clubNaarCode, nieuweClub, uitCode as clubUitCode } from '../src/clubtraining/clubtraining';
import { oefeningNaarCode, oefeningUitCode, nieuweEigen, voorDelen } from '../src/eigen/eigen';
import { nieuwBord, uitWedstrijdCode, wedstrijdCode } from '../src/wedstrijd/wedstrijd';
import { nieuweTekening } from '../src/editor/editor';
import { linkDoel } from '../src/screens/training/onderdelen';
import { EN as en } from '../src/i18n/en';

/** Versie 0.31.3: wat buiten de synchronisatie om of tussen twee toestellen kwijt kon raken. */

describe('spelerslijst op een nieuw toestel', () => {
  const opstelling = (namen: string[]) => ({ ...nieuweOpstelling('8v8', namen, 1, 'o1'), naam: 'Zaterdag' });
  it('namen komen uit de opstellingen, van een positie en van de bank, zonder dubbele', () => {
    const o = opstelling(['Testspeler 1', 'Testspeler 2']);
    expect(namenUitOpstellingen([o]).sort()).toEqual(['Testspeler 1', 'Testspeler 2']);
    const metBank = { ...o, wissels: ['Testspeler 3', 'Testspeler 1'] };
    expect(namenUitOpstellingen([metBank, o]).sort()).toEqual(['Testspeler 1', 'Testspeler 2', 'Testspeler 3']);
  });
  it('een nieuwe lijst vult zich één keer; een leeggemaakte lijst blijft leeg', () => {
    spelersnamen.vulAanAls([]);
    expect(spelersnamen.lijst()).toEqual([]);
    spelersnamen.vulAanAls(['Testspeler 1']);
    expect(spelersnamen.lijst()).toEqual(['Testspeler 1']);
    spelersnamen.zet([]);
    spelersnamen.vulAanAls(['Testspeler 1']);
    expect(spelersnamen.lijst()).toEqual([]);
  });
});

describe('op twee plekken veranderd', () => {
  it('zelfde tijd, andere inhoud: elk toestel kiest dezelfde winnaar', () => {
    const b = { x: 1 } as const;
    const a = { id: 'i', gewijzigd: 5, naam: 'A' };
    const c = { id: 'i', gewijzigd: 5, naam: 'C' };
    const bekend = { i: JSON.stringify({ id: 'i', gewijzigd: 1, naam: 'Oud', ...b }) };
    expect(verzoen([a], bekend, [c]).lokaal).toEqual(verzoen([c], bekend, [a]).lokaal);
  });
});

describe('korte deellinks', () => {
  const ADRES = 'https://woutvb073.github.io/trainersapp/';
  it('elke soort link is kort en eindigt op de code, met alleen URL-veilige tekens', () => {
    for (let i = 0; i < 200; i += 1) {
      const code = nieuweLinkCode();
      const link = `${ADRES}#/d/${code}`;
      expect(link.length).toBeLessThanOrEqual(60);
      expect(code).toHaveLength(CODE_LENGTE);
      expect(isLinkCode(code)).toBe(true);
      // WhatsApp, iMessage, mail en Telegram stoppen een link bij spaties en leestekens aan het eind: die zitten er niet in.
      expect(link).toMatch(/^https:\/\/[a-z0-9./]+#\/d\/[A-Z2-9]+$/);
    }
  });
  it('codes zijn willekeurig en zonder verwarrende tekens', () => {
    const codes = new Set(Array.from({ length: 2000 }, () => nieuweLinkCode()));
    expect(codes.size).toBe(2000);
    for (const c of codes) expect(c).not.toMatch(/[01OIL]/);
  });
  it('ongeldige codes worden niet opgevraagd', () => {
    for (const c of ['', 'ABC', 'ABCDEFGHJKM', 'ABCDEFGHJKMNP', 'abcdefghjkmn', 'ABCDEFGHJKM0', 'ABCDEFGHJK/N']) expect(isLinkCode(c)).toBe(false);
  });
  it('het deelbericht: de naam, dan de link op een eigen regel', () => {
    expect(deelTekst('Circuittraining: MT', `${ADRES}#/d/AB12CD34EF56`)).toBe(`Circuittraining: MT\n${ADRES}#/d/AB12CD34EF56`);
  });
  it('adressen, ook op stationniveau', () => {
    expect(leesHash('#/d/ABCDEFGHJKMN')).toEqual({ naam: 'link', code: 'ABCDEFGHJKMN' });
    expect(leesHash('#/d/ABCDEFGHJKMN/station/3')).toEqual({ naam: 'link', code: 'ABCDEFGHJKMN', station: 3 });
    expect(leesHash('#/d/ABCDEFGHJKMN/partij')).toEqual({ naam: 'link', code: 'ABCDEFGHJKMN', partij: true });
  });
  it('een afgekapte link geeft de melding, geen "pagina bestaat niet"', () => {
    for (const h of ['#/c/', '#/c', '#/d/', '#/t/', '#/o/', '#/w/']) expect(leesHash(h)).toEqual({ naam: 'link-fout' });
  });
  it('een geplakte link werkt, kort of lang', () => {
    expect(linkDoel(`Circuittraining: MT\n${ADRES}#/d/ABCDEFGHJKMN`, 't')).toBe('/d/ABCDEFGHJKMN');
    expect(linkDoel(`${ADRES}#/c/eyJ2IjoxfQ`, 'w')).toBe('/c/eyJ2IjoxfQ');
    expect(linkDoel('ABCDEFGHJKMN', 'w')).toBe('/d/ABCDEFGHJKMN');
    expect(linkDoel('hallo', 't')).toBeNull();
  });
  it('de melding staat er ook in het Engels', () => {
    expect(en['Deze link is niet compleet of bestaat niet meer. Vraag de afzender om hem opnieuw te sturen.']).toMatch(/incomplete/);
    expect(en['Zet {app} op je beginscherm']).toBe('Add {app} to your home screen');
  });
});

describe('lange link als terugval', () => {
  const eigen = (id: string) => ({ ...nieuweEigen(nieuweTekening('leeg'), 'veld', 1, id), naam: 'Rondo met vier poortjes', uitleg: 'Vier tegen twee in een vak van twaalf bij twaalf meter met wisselende poortjes.', categorieen: ['techniek'] });
  const c = { ...nieuweClub('mini-5-7', 1, 'c1'), naam: 'Maandag', trainers: ['Testtrainer 1', 'Testtrainer 2'], blokken: { techniek: 'eigen-a', 'een-tegen-een': 'veld-mt-over-de-rivier', afwerken: 'veld-mt-pionnen-omgooien', partijvormen: 'veld-mt-3-tegen-3' } };
  const oud = (x: string) => Buffer.from(x, 'utf8').toString('base64url');
  it('alleen URL-veilige tekens, zonder /, + of =', () => {
    for (const code of [clubNaarCode(c, [eigen('eigen-a')]), naarCode({ naam: 'Dinsdag', spelers: 8, keepers: 1, oefeningen: ['veld-af-cutback'] }), oefeningNaarCode(voorDelen(eigen('eigen-a'))), wedstrijdCode({ soort: 'bord', bord: nieuwBord('tactiek', nieuweTekening('heel'), 'Corner', 1, 'b1') })]) {
      expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });
  it('gecomprimeerd: duidelijk korter dan de oude link', () => {
    const tekst = JSON.stringify({ v: 1, o: voorDelen(eigen('eigen-a')) });
    const nieuw = naarBase64Url(tekst);
    expect(nieuw.startsWith('z')).toBe(true);
    expect(nieuw.length).toBeLessThan(oud(tekst).length * 0.75);
    expect(uitBase64Url(nieuw)).toBe(tekst);
  });
  it('heen en terug, ook met accenten', () => {
    const t = 'Coördinatie – één tegen één 😀 '.repeat(20);
    expect(uitBase64Url(naarBase64Url(t))).toBe(t);
    expect(uitBase64Url(naarBase64Url('a'))).toBe('a');
  });
  it('alle soorten zijn weer te lezen', () => {
    expect(clubUitCode(clubNaarCode(c, [eigen('eigen-a')]))?.naam).toBe('Maandag');
    expect(uitCode(naarCode({ naam: 'Dinsdag', spelers: 8, keepers: 1, oefeningen: ['veld-af-cutback'] }))?.naam).toBe('Dinsdag');
    expect(oefeningUitCode(oefeningNaarCode(voorDelen(eigen('eigen-a'))))?.naam).toBe('Rondo met vier poortjes');
    expect(uitWedstrijdCode(wedstrijdCode({ soort: 'bord', bord: nieuwBord('tactiek', nieuweTekening('heel'), 'Corner', 1, 'b1') }))).toMatchObject({ soort: 'bord' });
  });
  it('oude, niet gecomprimeerde links blijven werken', () => {
    expect(uitCode(oud(JSON.stringify({ v: 1, n: 'Dinsdag', s: 8, k: 1, o: ['v:af-cutback'] })))).toMatchObject({ naam: 'Dinsdag', oefeningen: ['veld-af-cutback'] });
    expect(clubUitCode(oud(JSON.stringify({ v: 1, n: 'Maandag', d: [], l: 'mini-5-7', k: 30, g: 6, t: [], b: ['v:mt-tik-tak', '', '', ''], s: {}, f: {} })))).toMatchObject({ naam: 'Maandag' });
    expect(oefeningUitCode(oud(JSON.stringify({ v: 1, o: voorDelen(eigen('eigen-a')) })))?.id).toBe('eigen-a');
  });
  it('een afgekapte code geeft geen fout maar "geen link"', () => {
    const code = clubNaarCode(c, [eigen('eigen-a')]);
    expect(clubUitCode(code.slice(0, 40))).toBeNull();
    expect(clubUitCode('z')).toBeNull();
    expect(uitCode('zzzz')).toBeNull();
    expect(oefeningUitCode(code.slice(0, 10))).toBeNull();
    expect(uitWedstrijdCode('zabc')).toBeNull();
  });
});
