import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { BAL_R, balInvoer, laagste, maakSkelet, nieuweStaat, persoonInvoer, poseer } from '../src/anim/poppetje';
import { OEFENINGEN, vindOefening } from '../src/data/oefeningen';
import { TEKENING_TEKST } from '../src/data/vertaling';
import engelsVerdedigen from '../src/data/en/veld-verdedigen-omschakelen.json';
import engelsPartijvormen from '../src/data/en/veld-partijvormen.json';
import engelsSpelletjes from '../src/data/en/veld-spelletjes.json';

/** Versie 0.27.0 (deel B): 15 spelersoefeningen (verdedigen en omschakelen, partijvormen, spelletjes). */

const NIEUW: Record<string, { categorieen: string[]; spelers: number; keepers: number }> = {
  'veld-vo-druk-drie-fases': { categorieen: ['verdedigen-omschakelen', 'positiespel'], spelers: 9, keepers: 1 },
  'veld-vo-drie-verdedigers': { categorieen: ['verdedigen-omschakelen', 'partijvormen'], spelers: 6, keepers: 0 },
  'veld-vo-1-1-wegdrukken': { categorieen: ['verdedigen-omschakelen'], spelers: 2, keepers: 0 },
  'veld-vo-hoog-druk-loont': { categorieen: ['verdedigen-omschakelen', 'partijvormen'], spelers: 10, keepers: 2 },
  'veld-vo-pressen-na-balverlies': { categorieen: ['verdedigen-omschakelen', 'partijvormen'], spelers: 10, keepers: 0 },
  'veld-vo-omschakelen-kaatsers': { categorieen: ['verdedigen-omschakelen', 'partijvormen'], spelers: 12, keepers: 2 },
  'veld-pv-1-1-naar-4-4': { categorieen: ['partijvormen'], spelers: 8, keepers: 2 },
  'veld-pv-6-6-verboden-midden': { categorieen: ['partijvormen'], spelers: 12, keepers: 2 },
  'veld-pv-5-5-schietzones': { categorieen: ['partijvormen', 'afwerken'], spelers: 14, keepers: 2 },
  'veld-pv-4-4-wingers': { categorieen: ['partijvormen', 'afwerken'], spelers: 10, keepers: 2 },
  'veld-pv-voorsprong': { categorieen: ['partijvormen'], spelers: 10, keepers: 2 },
  'veld-pv-2-2-doelspeler': { categorieen: ['partijvormen', 'verdedigen-omschakelen'], spelers: 6, keepers: 0 },
  'veld-pv-mandekking': { categorieen: ['partijvormen', 'verdedigen-omschakelen'], spelers: 8, keepers: 0 },
  'veld-sp-ludo': { categorieen: ['spelletjes', 'techniek'], spelers: 4, keepers: 0 },
  'veld-sp-uit-het-vak': { categorieen: ['spelletjes', 'warming-up'], spelers: 6, keepers: 0 },
};

describe('nieuwe spelersoefeningen 0.27.0', () => {
  const engels: Record<string, { naam: string }> = { ...engelsVerdedigen, ...engelsPartijvormen, ...engelsSpelletjes } as never;
  for (const [id, verwacht] of Object.entries(NIEUW)) {
    it(id, () => {
      const o = OEFENINGEN.find((x) => x.id === id)!;
      expect(o, id).toBeTruthy();
      expect(o.soort).toBe('veld');
      expect(o.categorieen).toEqual(verwacht.categorieen);
      expect(o.spelersNodig).toBe(verwacht.spelers);
      expect(o.keepersNodig).toBe(verwacht.keepers);
      expect(o.coachpunten.length).toBeGreaterThanOrEqual(2);
      expect(o.coachpunten.length).toBeLessThanOrEqual(4);
      expect(o.variaties.makkelijker.length).toBeGreaterThan(0);
      expect(o.variaties.moeilijker.length).toBeGreaterThan(0);
      expect(o.tekening.animatie?.length).toBeGreaterThan(2);
      if (!o.doorwisselbaar) expect(o.meerSpelers).toMatch(/^Met (meer|\d+) spelers/);
      // Eigen woorden: geen namen van websites, apps of clubs.
      expect(JSON.stringify(o)).not.toMatch(/https?:|www\.|\.nl\b|\.com\b|youtube|instagram|academy|tiki|barça|ajax/i);
      expect(engels[id]?.naam, id).toBeTruthy();
      // Tekst-labels in de tekening hebben een Engelse versie.
      for (const x of o.tekening.objecten) if (x.soort === 'tekst') expect(TEKENING_TEKST[x.tekst!], x.tekst).toBeTruthy();
    });
  }

  it('#27 is niet opnieuw gebouwd: de bestaande 4 tegen 4 met doelspelers kreeg de categorie Verdedigen en omschakelen', () => {
    const o = vindOefening('veld-ps-4-4-doelspelers')!;
    expect(o.categorieen).toEqual(['positiespel', 'verdedigen-omschakelen']);
    expect(o.coachpunten.some((c) => /druk/i.test(c))).toBe(true);
    expect(OEFENINGEN.filter((x) => /doelspelers/.test(x.naam) && /4 tegen 4/.test(x.naam))).toHaveLength(1);
  });

  it('#37 is niet gebouwd (gelijk aan Koning van het veld)', () => {
    expect(vindOefening('veld-sp-koning-van-het-veld')).toBeTruthy();
    expect(OEFENINGEN.some((x) => /wie is de beste/i.test(x.naam))).toBe(false);
  });

  it('Verdedigen en omschakelen heeft nu een eigen bestand en genoeg oefeningen', () => {
    const lijst = OEFENINGEN.filter((x) => x.soort === 'veld' && x.categorieen.includes('verdedigen-omschakelen'));
    expect(lijst.length).toBeGreaterThanOrEqual(15);
    expect(OEFENINGEN.filter((x) => x.categorieen[0] === 'verdedigen-omschakelen')).toHaveLength(6);
  });
});

/** Gemiddelde heuphoogte, laagste punt en armbreedte van een speler die 3 m terugzakt met een bepaalde loopwijze. */
function terugzakken(manier: 'verdedigend' | 'achteruit') {
  const tl = maakTijdlijn({
    veld: { type: 'leeg', breedte: 12, lengte: 12 },
    objecten: [{ id: 'd', soort: 'speler', x: 6, y: 4, kijkrichting: -90 }],
    animatie: [{ acties: [{ type: 'loop', wie: 'd', naar: [7, 7], manier, kijk: -100 }] }],
  });
  const sk = maakSkelet();
  const staat = nieuweStaat();
  let heup = 0;
  let n = 0;
  let laag = Infinity;
  let armen = 0;
  for (let i = 0; i <= Math.round(tl.duur * 30); i++) {
    const tt = i / 30;
    const s = standOp(tl, tt);
    const st = s.objecten.get('d')!;
    poseer(sk, staat, { s: st, soort: 'speler', t: tt, dtEcht: 1 / 30, dtAnim: 1 / 30, sprong: i === 0, zaad: 0.3, ...persoonInvoer('d', 'speler', st, s, balInvoer(s, [], BAL_R)) });
    laag = Math.min(laag, laagste(sk));
    if (tt > tl.duur * 0.3 && tt < tl.duur * 0.7) {
      heup += sk.bekken.getWorldPosition(new Vector3()).y;
      armen += sk.pols[0].getWorldPosition(new Vector3()).distanceTo(sk.pols[1].getWorldPosition(new Vector3()));
      n++;
    }
  }
  return { heup: heup / n, laag, armen: armen / n, duur: tl.duur };
}

describe('bouwsteen: verdedigende houding (1 tegen 1)', () => {
  const v = terugzakken('verdedigend');
  const a = terugzakken('achteruit');
  it('laag door de knieën: de heupen zakken duidelijk verder dan bij gewoon achteruitlopen', () => {
    expect(a.heup - v.heup).toBeGreaterThan(0.08);
  });
  it('armen iets opzij voor het evenwicht, en de voeten blijven op de grond', () => {
    expect(v.armen).toBeGreaterThan(a.armen);
    expect(v.laag).toBeGreaterThan(-0.01);
  });
  it('kleine pasjes: terugzakken gaat rustiger dan achteruitlopen', () => {
    expect(v.duur).toBeGreaterThan(a.duur);
  });
  it('wordt gebruikt bij 1 tegen 1 verdedigen en de eerste verdediger', () => {
    for (const id of ['veld-vo-1-1-wegdrukken', 'veld-vo-drie-verdedigers']) expect(JSON.stringify(vindOefening(id)!.tekening.animatie)).toContain('"verdedigend"');
  });
});
