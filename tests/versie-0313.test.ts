import { describe, expect, it } from 'vitest';
import { namenUitOpstellingen, nieuweOpstelling } from '../src/wedstrijd/wedstrijd';
import { spelersnamen } from '../src/wedstrijd/opslag';
import { verzoen } from '../src/online/samenvoegen';

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
