import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { disableNetwork, enableNetwork } from 'firebase/firestore';
import { leegmaken, lokaleOpslag, synchroniseer, toestel, wachtTot, opruimen } from './hulp';
import { nieuweEigen } from '../../src/eigen/eigen';
import { nieuweTekening } from '../../src/editor/editor';
import { nieuweTraining } from '../../src/training/training';

beforeEach(leegmaken);
afterEach(opruimen);

const oefening = (id: string, naam: string, nu = Date.now()) => ({ ...nieuweEigen(nieuweTekening('leeg'), 'veld', nu, id), naam, categorieen: ['techniek'] });

describe('synchroniseren tussen twee toestellen (zelfde account)', () => {
  it('oefeningen, trainingen, favorieten en instellingen komen op het andere toestel', async () => {
    const tel = await toestel('test1@example.com');
    const lap = await toestel('test1@example.com');
    const a = lokaleOpslag();
    const b = lokaleOpslag();
    const statusA: string[] = [];
    const statusB: string[] = [];
    const sa = synchroniseer(tel, a, (x) => statusA.push(x));
    const sb = synchroniseer(lap, b, (x) => statusB.push(x));
    a.eigen.bewaar(oefening('eigen-1', 'Mijn rondo'));
    a.trainingen.bewaar({ ...nieuweTraining(1, 't1'), naam: 'Dinsdag', oefeningen: ['eigen-1'] });
    a.favorieten.wissel('veld-pt-derde-man');
    a.zetInstellingen({ thema: 'rood', modus: 'donker', aantallen: { spelers: 8, keepers: 1 } });
    await wachtTot(() => b.eigen.haal('eigen-1')?.naam === 'Mijn rondo' && b.trainingen.haal('t1')?.naam === 'Dinsdag' && b.favorieten.is('veld-pt-derde-man') && b.instellingen().thema === 'rood');
    // En daarna komt het tot rust: geen eindeloos opnieuw schrijven (status 'klaar' op beide toestellen).
    await wachtTot(() => statusA.at(-1) === 'klaar' && statusB.at(-1) === 'klaar', 10000, 'status klaar');
    const aantal = statusA.length;
    await new Promise((r) => setTimeout(r, 1500));
    expect(statusA.length - aantal).toBeLessThanOrEqual(1);
    expect(b.instellingen()).toMatchObject({ modus: 'donker', aantallen: { spelers: 8, keepers: 1 } });

    // Aanpassen op de laptop → telefoon; verwijderen op de telefoon → laptop.
    b.eigen.bewaar({ ...b.eigen.haal('eigen-1')!, naam: 'Rondo 4 tegen 2' });
    await wachtTot(() => a.eigen.haal('eigen-1')?.naam === 'Rondo 4 tegen 2');
    a.trainingen.verwijder('t1');
    a.favorieten.wissel('veld-pt-derde-man');
    await wachtTot(() => !b.trainingen.haal('t1') && !b.favorieten.is('veld-pt-derde-man'));
    sa.stop();
    sb.stop();
  });

  it('offline wijzigen en daarna synchroniseren: niets kwijt', async () => {
    const tel = await toestel('test1@example.com');
    const lap = await toestel('test1@example.com');
    const a = lokaleOpslag();
    const b = lokaleOpslag();
    const sa = synchroniseer(tel, a);
    const sb = synchroniseer(lap, b);
    a.eigen.bewaar(oefening('eigen-1', 'Een'));
    a.eigen.bewaar(oefening('eigen-2', 'Twee'));
    await wachtTot(() => b.eigen.lijst().length === 2);

    // Telefoon offline: nieuwe training, oefening 1 aanpassen, oefening 2 weg.
    await disableNetwork(tel.db);
    a.trainingen.bewaar({ ...nieuweTraining(1, 'offline'), naam: 'Gemaakt zonder internet' });
    a.eigen.bewaar({ ...a.eigen.haal('eigen-1')!, naam: 'Een (offline aangepast)', gewijzigd: Date.now() });
    a.eigen.verwijder('eigen-2');
    // Intussen op de laptop (online): een nieuwe oefening.
    b.eigen.bewaar(oefening('eigen-3', 'Drie van de laptop'));
    await new Promise((r) => setTimeout(r, 600));
    expect(b.trainingen.haal('offline')).toBeUndefined();

    // Weer online: alles komt samen.
    await enableNetwork(tel.db);
    await wachtTot(() => !!b.trainingen.haal('offline') && b.eigen.haal('eigen-1')?.naam === 'Een (offline aangepast)' && !b.eigen.haal('eigen-2') && !!a.eigen.haal('eigen-3'));
    expect(a.eigen.lijst().map((o) => o.id).sort()).toEqual(['eigen-1', 'eigen-3']);
    sa.stop();
    sb.stop();
  });

  it('wijzigingen terwijl de app dicht was gaan mee bij de volgende start', async () => {
    const tel = await toestel('test1@example.com');
    const lap = await toestel('test1@example.com');
    const a = lokaleOpslag();
    const b = lokaleOpslag();
    let sa = synchroniseer(tel, a);
    const sb = synchroniseer(lap, b);
    a.eigen.bewaar(oefening('eigen-1', 'Een'));
    await wachtTot(() => !!b.eigen.haal('eigen-1'));
    sa.stop();
    // App dicht: lokaal verwijderd en een nieuwe toegevoegd.
    a.eigen.verwijder('eigen-1');
    a.eigen.bewaar(oefening('eigen-9', 'Negen'));
    sa = synchroniseer(tel, a);
    await wachtTot(() => !b.eigen.haal('eigen-1') && !!b.eigen.haal('eigen-9'));
    sa.stop();
    sb.stop();
  });

  it('eerste keer inloggen op een apparaat met eigen gegevens: samenvoegen zonder dubbelingen', async () => {
    const oud = await toestel('test1@example.com');
    const o = lokaleOpslag();
    const so = synchroniseer(oud, o);
    o.eigen.bewaar(oefening('eigen-1', 'Al online'));
    o.favorieten.wissel('veld-pt-derde-man');
    await new Promise((r) => setTimeout(r, 800));
    so.stop();
    // Nieuw apparaat met eigen spullen (en één favoriet die ook al online stond).
    const nieuw = await toestel('test1@example.com');
    const n = lokaleOpslag();
    n.eigen.bewaar(oefening('eigen-2', 'Van dit apparaat'));
    n.favorieten.wissel('veld-pt-derde-man');
    n.favorieten.wissel('keeper-sp-keepersrondo');
    const sn = synchroniseer(nieuw, n);
    await wachtTot(() => n.eigen.lijst().length === 2 && n.favorieten.alle().size === 2);
    expect([...n.favorieten.alle()].sort()).toEqual(['keeper-sp-keepersrondo', 'veld-pt-derde-man']);
    // En online staat nu alles: een derde toestel krijgt beide oefeningen.
    const derde = await toestel('test1@example.com');
    const d = lokaleOpslag();
    const sd = synchroniseer(derde, d);
    await wachtTot(() => d.eigen.lijst().length === 2);
    sn.stop();
    sd.stop();
  });

  it('een ander account ziet niets van mij', async () => {
    const trainer1 = await toestel('test1@example.com');
    const ander = await toestel('test4@example.com');
    const a = lokaleOpslag();
    const b = lokaleOpslag();
    const sa = synchroniseer(trainer1, a);
    const sb = synchroniseer(ander, b);
    a.eigen.bewaar(oefening('eigen-1', 'Geheim'));
    await new Promise((r) => setTimeout(r, 1000));
    expect(b.eigen.lijst()).toEqual([]);
    sa.stop();
    sb.stop();
  });
});
