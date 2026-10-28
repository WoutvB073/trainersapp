import { describe, expect, it } from 'vitest';
import { alleOefeningen, ARCHIEF, OEFENINGEN, oefeningenVan, vindOefening } from '../src/data/oefeningen';
import { naarCode, uitCode, benodigdheden } from '../src/training/training';
import { genereer, kandidaten } from '../src/training/genereren';
import { apparaatFavorieten, FavorietenStore } from '../src/engine/favorieten';
import { CATEGORIEEN } from '../src/data/categorieen';

const geheugen = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
};

/** De oefeningen die in 0.19.0 uit de bibliotheek gingen. */
const WEG = [
  'veld-af-een-tegen-keeper',
  'veld-sp-bankjesvoetbal',
  'veld-sp-opruimen',
  'veld-pt-derde-man',
  'veld-pt-pass-in-de-loop',
  'veld-kaatsen-en-afwerken',
  'veld-af-rebound',
  'veld-af-kleine-doeltjes',
  'keeper-hd-kniezit-kussen',
  'keeper-hd-afzet-landing',
  'keeper-re-via-de-pop',
  'keeper-wu-balgewenning',
  'keeper-hd-rouleren-hoge-hoek',
  'keeper-bv-hoge-ballen-sprong',
  'keeper-bv-kommetje',
  'keeper-bv-kruispas-vangen',
  'keeper-hd-kruispas-hoge-duik',
  'keeper-cv-kruispas-vangen-zwaaiworp',
  'keeper-sp-lummelen',
  'keeper-sp-mikken-in-de-hoepel',
  'keeper-hd-tippen-om-de-paal',
  'keeper-1o1-uitlopen-afremmen',
  'keeper-wu-tweetallen-drie-hoogtes',
];

describe('A4 oefeningen uit de bibliotheek', () => {
  it('niet meer in de bibliotheek, niet meer te kiezen of te genereren', () => {
    expect(ARCHIEF.map((o) => o.id)).toEqual(expect.arrayContaining(WEG));
    const ids = new Set(OEFENINGEN.map((o) => o.id));
    for (const id of WEG) expect(ids.has(id), id).toBe(false);
    const lijst = new Set(alleOefeningen().map((o) => o.id));
    for (const id of WEG) expect(lijst.has(id), id).toBe(false);
    for (const soort of ['veld', 'keeper'] as const) for (const c of CATEGORIEEN[soort]) for (const o of oefeningenVan(soort, c.id)) expect(o.verwijderd).toBeFalsy();
    // Geen bank meer bij de spelers en geen landingskussen meer bij de keepers.
    expect(OEFENINGEN.some((o) => o.tekening.objecten.some((x) => x.soort === 'bank'))).toBe(false);
    expect(OEFENINGEN.some((o) => o.tekening.objecten.some((x) => x.soort === 'keepersmat' && (x.hoogte ?? 0) >= 0.1))).toBe(false);
    // Genereren kiest ze nooit.
    for (const c of CATEGORIEEN.keeper) expect(kandidaten({ soort: 'keeper', categorie: c.id }, { alle: alleOefeningen(), spelers: 20, keepers: 6 }).some((o) => WEG.includes(o.id))).toBe(false);
    const g = genereer(CATEGORIEEN.veld.map((c) => ({ soort: 'veld' as const, categorie: c.id })), { alle: alleOefeningen(), spelers: 20, keepers: 2, favorieten: new Set(WEG), recent: new Map(), toeval: Math.random });
    expect(g.keuzes.some((k) => k && WEG.includes(k))).toBe(false);
  });

  it('opgeslagen trainingen, deellinks en favorieten tonen ze nog (met inhoud en melding), niets wordt stil overgeslagen', () => {
    for (const id of WEG) {
      const o = vindOefening(id);
      expect(o, id).toBeDefined();
      expect(o!.verwijderd).toBe(true);
      expect(o!.naam.length).toBeGreaterThan(3);
      expect(o!.uitleg.length).toBeGreaterThan(10);
      expect(o!.tekening.objecten.length).toBeGreaterThan(0);
    }
    // Een gedeelde training (link) van vóór 0.19.0 met een weggehaalde oefening.
    const code = naarCode({ naam: 'Oud', spelers: 8, keepers: 1, oefeningen: ['veld-pt-derde-man', 'keeper-bv-kommetje', OEFENINGEN[0]!.id] });
    const terug = uitCode(code)!;
    const gevonden = terug.oefeningen.map((id) => vindOefening(id));
    expect(gevonden.every(Boolean)).toBe(true);
    expect(gevonden.map((o) => !!o!.verwijderd)).toEqual([true, true, false]);
    // Benodigdheden tellen ze nog mee.
    expect(benodigdheden(gevonden.map((o) => o!)).length).toBeGreaterThan(0);
    // Favorieten: blijven gewoon bewaard.
    const favs = new FavorietenStore(apparaatFavorieten(geheugen()));
    favs.wissel('keeper-sp-lummelen');
    expect(favs.is('keeper-sp-lummelen')).toBe(true);
  });
});

describe('A5 categorieën', () => {
  const plat = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const opNaam = (naam: string, soort: 'veld' | 'keeper') =>
    OEFENINGEN.find((o) => o.soort === soort && plat(o.naam) === plat(naam)) ?? OEFENINGEN.find((o) => o.soort === soort && plat(o.naam).startsWith(plat(naam) + ' '))!;

  it('zoals opgegeven (precies deze categorieën, de eerste is de hoofdcategorie)', () => {
    const spelers: Record<string, string[]> = {
      'Rondo 4 tegen 1': ['warming-up'],
      'Duel om de bal: 1 tegen 1 naar doel': ['afwerken', 'partijvormen', 'verdedigen-omschakelen'], // + 0.26.0
      'Eindzonespel 4 tegen 4': ['positiespel', 'partijvormen'],
      'Koning van het veld': ['partijvormen'],
      'Lijnvoetbal 4 tegen 4': ['partijvormen'],
      Hooghouden: ['techniek'],
      'Rondo 3 tegen 1 in de driehoek': ['warming-up', 'positiespel'],
      'Latje-trap': ['spelletjes'],
      'Pionnen omschieten': ['spelletjes', 'pass-en-trap'],
      'Voetbaltennis 2 tegen 2': ['spelletjes'],
      'Voetvolley 1 tegen 1': ['spelletjes'],
      'Tikkertje met hesje': ['warming-up', 'spelletjes'],
      Schatrovers: ['warming-up', 'spelletjes'],
      Overlopertje: ['warming-up', 'spelletjes'],
      Piratenspel: ['techniek', 'warming-up', 'spelletjes'],
      'Koning van het vak': ['techniek', 'warming-up', 'spelletjes'],
      'Coördinatie-estafette': ['loopcoordinatie'],
      'Kleurenreactie in tweetallen': ['loopcoordinatie'],
      'Kleurenreactie met bal': ['techniek', 'spelletjes'],
    };
    const keepers: Record<string, string[]> = {
      'Draaien en laag duiken': ['laag-duiken', 'reactie'],
      'Reactiebal in tweetallen': ['reactie'],
      'Valbal: vangen voor de tweede stuit': ['reactie', 'warming-up', 'een-op-een'],
      'Keepersvolleybal over het net': ['spelletjes'],
      'Steekpass: eerder bij de bal dan de aanvaller': ['een-op-een'],
      'Werpen en vangen in de driehoek': ['warming-up'],
      Keepersoorlog: ['spelletjes'],
      Keepersrondo: ['spelletjes', 'warming-up'],
      'Duik op de losse bal': ['laag-duiken', 'reactie'],
      'Vangen en snel uitgooien in de loop': ['passing', 'bal-verwerken'],
    };
    for (const [n, c] of Object.entries(spelers)) expect(opNaam(n, 'veld')?.categorieen, n).toEqual(c);
    for (const [n, c] of Object.entries(keepers)) expect(opNaam(n, 'keeper')?.categorieen, n).toEqual(c);
    // De kleurenreactie zonder bal heeft echt geen bal, die met bal wel.
    expect(opNaam('Kleurenreactie in tweetallen', 'veld').tekening.objecten.some((o) => o.soort === 'bal')).toBe(false);
    expect(opNaam('Kleurenreactie met bal', 'veld').tekening.objecten.filter((o) => o.soort === 'bal')).toHaveLength(2);
  });

  it('spelers-oefeningen zonder bal horen bij Loopcoördinatie, niet bij Spelletjes of Techniek (behalve de opgegeven tikspelletjes)', () => {
    const uitzondering = ['Tikkertje met hesje', 'Overlopertje'];
    for (const o of OEFENINGEN) {
      if (o.soort !== 'veld' || o.tekening.objecten.some((x) => x.soort === 'bal') || uitzondering.includes(o.naam)) continue;
      expect(o.categorieen, o.naam).toContain('loopcoordinatie');
      expect(o.categorieen.includes('spelletjes') || o.categorieen.includes('techniek'), o.naam).toBe(false);
    }
  });
});
