import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { disableNetwork, doc, enableNetwork, getDoc, setDoc, terminate } from 'firebase/firestore';
import { HERKANSING, leegmaken, lokaleOpslag, synchroniseer, toestel, wachtTot, opruimen } from './hulp';
import { nieuweEigen } from '../../src/eigen/eigen';
import { nieuweTekening } from '../../src/editor/editor';
import { nieuweTraining } from '../../src/training/training';
import { nieuweClub } from '../../src/clubtraining/clubtraining';
import { nieuweOpstelling, nieuwBord, vulAan } from '../../src/wedstrijd/wedstrijd';
import { VOORBEELDEN } from '../../src/wedstrijd/hervattingen';

beforeEach(leegmaken);
afterEach(opruimen);

const oefening = (id: string, naam: string, nu = Date.now()) => ({ ...nieuweEigen(nieuweTekening('leeg'), 'veld', nu, id), naam, categorieen: ['techniek'] });

describe('synchroniseren tussen twee toestellen (zelfde account)', { retry: HERKANSING }, () => {
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

  it('een schrijfactie die de server nooit haalde, gaat niet verloren (app dicht vlak na het maken)', async () => {
    const tel = await toestel('test1@example.com');
    const lap = await toestel('test1@example.com');
    const a = lokaleOpslag();
    const b = lokaleOpslag();
    const sa = synchroniseer(tel, a);
    const sb = synchroniseer(lap, b);
    a.eigen.bewaar(oefening('eigen-1', 'Een'));
    await wachtTot(() => b.eigen.lijst().length === 1, 10000, 'eerste oefening');

    // Nieuw bord en een aanpassing, maar de app gaat dicht voor het de server haalt (in de test: geheugen, dus ook niet bewaard).
    await disableNetwork(tel.db);
    a.borden.bewaar(nieuwBord('tactiek', nieuweTekening('leeg'), 'Net gemaakt', Date.now(), 'b1'));
    a.eigen.bewaar({ ...a.eigen.haal('eigen-1')!, naam: 'Een (aangepast)', gewijzigd: Date.now() });
    await new Promise((r) => setTimeout(r, 200));
    sa.stop();
    await terminate(tel.db);

    // Opnieuw opstarten met dezelfde lokale opslag: alles is er nog en gaat alsnog online.
    const tel2 = await toestel('test1@example.com');
    const sa2 = synchroniseer(tel2, a);
    await wachtTot(() => !!b.borden.haal('b1') && b.eigen.haal('eigen-1')?.naam === 'Een (aangepast)', 10000, 'alsnog online');
    expect(a.borden.haal('b1')?.naam).toBe('Net gemaakt');
    expect(a.eigen.haal('eigen-1')?.naam).toBe('Een (aangepast)');
    sa2.stop();
    sb.stop();
  });

  it('snel typen: wat Firestore nog over een oudere versie meldt, overschrijft de nieuwste niet', async () => {
    const tel = await toestel('test1@example.com');
    const lap = await toestel('test1@example.com');
    const a = lokaleOpslag();
    const b = lokaleOpslag();
    const sa = synchroniseer(tel, a);
    const sb = synchroniseer(lap, b);
    const c = { ...nieuweClub('mini-5-7', 1, 'c1'), naam: 'M' };
    a.clubtrainingen.bewaar(c);
    await wachtTot(() => !!b.clubtrainingen.haal('c1'), 10000, 'circuittraining');
    const naam = 'Maandagavond op het hoofdveld';
    for (let i = 1; i <= naam.length; i += 1) {
      a.clubtrainingen.bewaar({ ...a.clubtrainingen.haal('c1')!, naam: naam.slice(0, i), gewijzigd: Date.now() });
      expect(a.clubtrainingen.haal('c1')!.naam).toBe(naam.slice(0, i));
      await new Promise((r) => setTimeout(r, i % 3));
    }
    await wachtTot(() => b.clubtrainingen.haal('c1')?.naam === naam, 10000, 'hele naam op het andere toestel');
    expect(a.clubtrainingen.haal('c1')!.naam).toBe(naam);
    sa.stop();
    sb.stop();
  });

  it('favorieten op twee toestellen tegelijk: niets overschrijft de ander (ook niet offline)', async () => {
    const tel = await toestel('test1@example.com');
    const lap = await toestel('test1@example.com');
    const a = lokaleOpslag();
    const b = lokaleOpslag();
    const sa = synchroniseer(tel, a);
    const sb = synchroniseer(lap, b);
    a.favorieten.wissel('samen');
    await wachtTot(() => b.favorieten.is('samen'), 10000, 'eerste favoriet');

    // Telefoon offline: favoriet erbij. Intussen op de laptop ook een.
    await disableNetwork(tel.db);
    a.favorieten.wissel('van-telefoon');
    a.favorieten.wissel('samen');
    b.favorieten.wissel('van-laptop');
    await new Promise((r) => setTimeout(r, 800));
    await enableNetwork(tel.db);
    await wachtTot(() => a.favorieten.is('van-laptop') && b.favorieten.is('van-telefoon') && !b.favorieten.is('samen'), 10000, 'beide favorieten op beide toestellen');
    await new Promise((r) => setTimeout(r, 800));
    for (const x of [a, b]) expect([...x.favorieten.alle()].sort()).toEqual(['van-laptop', 'van-telefoon']);
    sa.stop();
    sb.stop();
  });

  it('instellingen met dezelfde tijd op twee toestellen: ze worden het eens en blijven niet schrijven', async () => {
    const tel = await toestel('test1@example.com');
    const lap = await toestel('test1@example.com');
    const a = lokaleOpslag();
    const b = lokaleOpslag();
    // Vóór het inloggen op elk toestel iets anders gekozen: geen tijd, dus allebei 0.
    a.doelen.instellingen.zet({ ...a.instellingen(), thema: 'rood' });
    b.doelen.instellingen.zet({ ...b.instellingen(), thema: 'blauw' });
    const statusA: string[] = [];
    const sa = synchroniseer(tel, a, (x) => statusA.push(x));
    const sb = synchroniseer(lap, b);
    await wachtTot(() => a.instellingen().thema === b.instellingen().thema, 10000, 'zelfde thema');
    await new Promise((r) => setTimeout(r, 1000));
    const aantal = statusA.length;
    const stand = [a.instellingen().thema, b.instellingen().thema];
    await new Promise((r) => setTimeout(r, 1500));
    expect(stand[0]).toBe(stand[1]);
    expect(a.instellingen().thema).toBe(b.instellingen().thema);
    expect(statusA.length - aantal).toBeLessThanOrEqual(1);
    sa.stop();
    sb.stop();
  });

  it('nieuw toestel dat eerst naam en e-mail schrijft (zoals de app): instellingen en favorieten online blijven', async () => {
    const tel = await toestel('test1@example.com');
    const a = lokaleOpslag();
    const sa = synchroniseer(tel, a);
    a.favorieten.wissel('veld-pt-derde-man');
    a.zetInstellingen({ thema: 'rood', modus: 'donker', taal: 'en', aantallen: { spelers: 8, keepers: 1 }, leeftijd: 'jo8-11' });
    await wachtTot(() => a.favorieten.is('veld-pt-derde-man'), 2000);
    await new Promise((r) => setTimeout(r, 1000));
    sa.stop();
    await terminate(tel.db);

    // Alleen dit nieuwe toestel is nog actief: niemand zet de instellingen terug.
    const lap = await toestel('test1@example.com');
    const b = lokaleOpslag();
    await setDoc(doc(lap.db, 'users', lap.uid), { naam: 'Testtrainer 1', email: 'test1@example.com' }, { merge: true });
    const sb = synchroniseer(lap, b);
    await new Promise((r) => setTimeout(r, 1500));
    expect(b.instellingen()).toMatchObject({ thema: 'rood', modus: 'donker', taal: 'en', aantallen: { spelers: 8, keepers: 1 }, leeftijd: 'jo8-11' });
    expect(b.favorieten.is('veld-pt-derde-man')).toBe(true);
    sb.stop();
  });

  it('nieuw toestel, schrijfactie nog onderweg bij de eerste momentopname: de instellingen online blijven', async () => {
    const tel = await toestel('test1@example.com');
    const a = lokaleOpslag();
    const sa = synchroniseer(tel, a);
    a.zetInstellingen({ thema: 'rood', taal: 'en' });
    await new Promise((r) => setTimeout(r, 1000));
    sa.stop();
    await terminate(tel.db);

    const lap = await toestel('test1@example.com');
    const b = lokaleOpslag();
    // Niet wachten: zo doet de app het ook (de schrijfactie is nog onderweg als de luisteraar start).
    void setDoc(doc(lap.db, 'users', lap.uid), { naam: 'Testtrainer 1', email: 'test1@example.com' }, { merge: true });
    const sb = synchroniseer(lap, b);
    await new Promise((r) => setTimeout(r, 1500));
    expect(b.instellingen()).toMatchObject({ thema: 'rood', taal: 'en' });
    const d = await getDoc(doc(lap.db, 'users', lap.uid));
    expect((d.data() as { instellingen?: { thema?: string } }).instellingen?.thema).toBe('rood');
    sb.stop();
  });

  it('nieuw toestel: alles komt binnen, ook de afvinklijst en de instellingen', async () => {
    const tel = await toestel('test1@example.com');
    const a = lokaleOpslag();
    const sa = synchroniseer(tel, a);
    a.eigen.bewaar(oefening('eigen-1', 'Een'));
    a.trainingen.bewaar({ ...nieuweTraining(1, 't1'), naam: 'Dinsdag' });
    a.clubtrainingen.bewaar({ ...nieuweClub('mini-5-7', 1, 'c1'), naam: 'Maandag', afgevinkt: ['1:pionnen'] });
    a.opstellingen.bewaar({ ...nieuweOpstelling('8v8', ['Testspeler'], 1, 'o1'), naam: 'Zaterdag' });
    a.borden.bewaar(nieuwBord('tactiek', nieuweTekening('leeg'), 'Corner', 1, 'b1'));
    a.favorieten.wissel('veld-pt-derde-man');
    a.zetInstellingen({ thema: 'rood', modus: 'donker', taal: 'en', aantallen: { spelers: 8, keepers: 1 }, leeftijd: 'jo8-11' });
    await new Promise((r) => setTimeout(r, 1000));

    const lap = await toestel('test1@example.com');
    const b = lokaleOpslag();
    const sb = synchroniseer(lap, b);
    await wachtTot(() => b.eigen.lijst().length === 1 && b.trainingen.lijst().length === 1 && b.clubtrainingen.lijst().length === 1 && b.opstellingen.lijst().length === 1 && b.borden.lijst().length === 1 && b.favorieten.is('veld-pt-derde-man') && b.instellingen().thema === 'rood', 10000, 'alles op het nieuwe toestel');
    expect(b.clubtrainingen.haal('c1')?.afgevinkt).toEqual(['1:pionnen']);
    expect(b.instellingen()).toMatchObject({ modus: 'donker', taal: 'en', aantallen: { spelers: 8, keepers: 1 }, leeftijd: 'jo8-11' });
    sa.stop();
    sb.stop();
  });

  it('eerste keer samenvoegen: wat op het toestel staat en wat online staat blijven allebei', async () => {
    const tel = await toestel('test1@example.com');
    const a = lokaleOpslag();
    const sa = synchroniseer(tel, a);
    a.eigen.bewaar(oefening('eigen-online', 'Online'));
    a.trainingen.bewaar({ ...nieuweTraining(1, 't-online'), naam: 'Online' });
    a.clubtrainingen.bewaar({ ...nieuweClub('mini-5-7', 1, 'c-online'), naam: 'Online' });
    a.favorieten.wissel('fav-online');
    await new Promise((r) => setTimeout(r, 1000));
    sa.stop();

    // Nieuw toestel met eigen spullen in de lokale kopie (zo laat de app ze achter na "Ja, meenemen").
    const lap = await toestel('test1@example.com');
    const b = lokaleOpslag();
    b.eigen.bewaar(oefening('eigen-toestel', 'Toestel'));
    b.trainingen.bewaar({ ...nieuweTraining(1, 't-toestel'), naam: 'Toestel' });
    b.clubtrainingen.bewaar({ ...nieuweClub('mini-5-7', 1, 'c-toestel'), naam: 'Toestel' });
    b.opstellingen.bewaar({ ...nieuweOpstelling('8v8', [], 1, 'o-toestel'), naam: 'Toestel' });
    b.borden.bewaar(nieuwBord('tactiek', nieuweTekening('leeg'), 'Toestel', 1, 'b-toestel'));
    b.favorieten.wissel('fav-toestel');
    const sb = synchroniseer(lap, b);
    await wachtTot(() => b.eigen.lijst().length === 2 && b.trainingen.lijst().length === 2 && b.clubtrainingen.lijst().length === 2 && b.favorieten.is('fav-online') && b.favorieten.is('fav-toestel'), 10000, 'samengevoegd op het toestel');
    await new Promise((r) => setTimeout(r, 800));

    // Een derde toestel ziet alles.
    const derde = await toestel('test1@example.com');
    const c = lokaleOpslag();
    const sc = synchroniseer(derde, c);
    await wachtTot(() => c.eigen.lijst().length === 2 && c.trainingen.lijst().length === 2 && c.clubtrainingen.lijst().length === 2 && c.opstellingen.lijst().length === 1 && c.borden.lijst().length === 1 && c.favorieten.is('fav-online') && c.favorieten.is('fav-toestel'), 10000, 'alles online');
    sb.stop();
    sc.stop();
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

  it('clubtrainingen komen op het andere toestel, ook de afvinklijst', { timeout: 30000 }, async () => {
    const tel = await toestel('test1@example.com', 'Testtrainer 1');
    const lap = await toestel('test1@example.com', 'Testtrainer 1');
    const a = lokaleOpslag();
    const b = lokaleOpslag();
    const sa = synchroniseer(tel, a);
    const sb = synchroniseer(lap, b);
    a.clubtrainingen.bewaar({ ...nieuweClub('mini-5-7', 1000, 'c1'), naam: 'Maandag', afgevinkt: ['1:hoedje'] });
    await wachtTot(() => b.clubtrainingen.haal('c1')?.naam === 'Maandag', 15000, 'clubtraining naar het andere toestel');
    expect(b.clubtrainingen.haal('c1')!.afgevinkt).toEqual(['1:hoedje']);
    b.clubtrainingen.verwijder('c1');
    await wachtTot(() => !a.clubtrainingen.haal('c1'), 15000, 'verwijderen');
    sa.stop();
    sb.stop();
  });

  it('opstellingen en tactiekborden (wedstrijd) komen op het andere toestel', { timeout: 30000 }, async () => {
    const tel = await toestel('test1@example.com', 'Testtrainer 1');
    const lap = await toestel('test1@example.com', 'Testtrainer 1');
    const a = lokaleOpslag();
    const b = lokaleOpslag();
    const sa = synchroniseer(tel, a);
    const sb = synchroniseer(lap, b);
    const o = { ...vulAan(nieuweOpstelling('8v8', ['Speler A', 'Speler B', 'Speler C'], 1, 'o1')), naam: 'Zaterdag' };
    a.opstellingen.bewaar(o);
    a.borden.bewaar(nieuwBord('hervatting', VOORBEELDEN[0]!.maak(), 'Corner', 1, 'b1'));
    await wachtTot(() => b.opstellingen.haal('o1')?.naam === 'Zaterdag' && b.borden.haal('b1')?.naam === 'Corner', 15000, 'wedstrijd naar het andere toestel');
    expect(b.opstellingen.haal('o1')!.plekken.filter((p) => p.naam)).toHaveLength(3);
    expect(b.borden.haal('b1')!.tekening.lijnen).toHaveLength(3);
    // Verwijderen gaat ook mee.
    b.borden.verwijder('b1');
    await wachtTot(() => !a.borden.haal('b1'), 15000, 'verwijderen');
    sa.stop();
    sb.stop();
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
