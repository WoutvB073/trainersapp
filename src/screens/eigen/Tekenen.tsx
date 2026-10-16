import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { EigenOefening, Lijn, LijnSoort, Punt, Tekening, Uitsnede, VeldObject } from '../../model/types';
import { PERSONEN } from '../../model/types';
import { maakTijdlijn, standOp, type Stand } from '../../anim/timeline';
import { leesKleuren, tekenScene, uitsnede } from '../../anim/render2d';
import { AnimatieSpeler } from '../../anim/AnimatieSpeler';
import { Icoon, type IcoonNaam } from '../../components/Icoon';
import {
  draai,
  draaiBaar,
  Geschiedenis,
  heeftAnimatie,
  kopieer,
  lagBalNeer,
  lijnHandvatten,
  maatNaar,
  nieuweLijn,
  objectHandvatten,
  objectVorm,
  PALET,
  paletVan,
  raakLijn,
  raakObject,
  sleepLijn,
  verplaats,
  verwijder,
  verwijderLijn,
  voegLijnToe,
  voegToe,
  zetLijn,
  zetObject,
  ZONE_KLEUREN,
  bevries,
  type Handvat,
  type PaletGroep,
  type PaletItem,
} from '../../editor/editor';
import { eigenOefeningen, useEigenOefening } from '../../eigen/opslag';
import { editorBegin, heeftLijnAnimatie, isSchotLijn, lijnMeldingen, stapPunt, volgendeStap, type LijnMelding } from '../../editor/animatie';
import { doelnetUitkomst, heeftKeeperBijGoal } from '../../editor/animatie';
import { metTekening } from '../../eigen/eigen';
import { ga, terug } from '../../router';
import { NietGevonden } from '../NietGevonden';
import { eigenNaam } from './EigenOefeningen';

type Gereedschap = { soort: 'kies' } | { soort: 'plaats'; item: PaletItem } | { soort: 'lijn'; lijn: LijnSoort };
type Selectie = { soort: 'object'; id: string } | { soort: 'lijn'; index: number } | null;

type Gebaar =
  | {
      soort: 'sleep';
      id: string;
      verschil: Punt;
      begin: Punt;
      bewogen: boolean;
    }
  | { soort: 'handvat'; h: Handvat; id?: string; lijn?: number }
  | { soort: 'pan'; laatste: Punt }
  | { soort: 'knijp'; afstand: number; midden: Punt }
  | { soort: 'lijn'; van: Punt }
  | { soort: 'plaats'; begin: Punt; p: Punt };

/** Aanraakmaat in CSS-pixels: zo groot is een vinger ongeveer. */
const VINGER = 22;
/** Afstand van het draaihandvat tot het object (CSS-pixels). */
const DRAAI_AFSTAND = 30;

const LIJN_NAMEN: Record<LijnSoort, { naam: string; icoon: IcoonNaam }> = {
  bal: { naam: 'Pass', icoon: 'lijnBal' },
  loop: { naam: 'Lopen', icoon: 'lijnLoop' },
  dribbel: { naam: 'Dribbel', icoon: 'lijnDribbel' },
};

const GROEPEN: PaletGroep[] = ['Spelers', 'Doelen', 'Materiaal', 'Vakken en tekst'];

const LOOPWIJZEN: { waarde: Lijn['manier']; naam: string }[] = [
  { waarde: undefined, naam: 'Normaal' },
  { waarde: 'sprint', naam: 'Sprint' },
  { waarde: 'zijwaarts', naam: 'Zijwaarts' },
  { waarde: 'achteruit', naam: 'Achteruit' },
];
const HOOGTES: { waarde: Lijn['hoogte']; naam: string }[] = [
  { waarde: undefined, naam: 'Grond' },
  { waarde: 'halfhoog', naam: 'Halfhoog' },
  { waarde: 'hoog', naam: 'Hoog' },
];
const HOOGTES_SCHOT: { waarde: Lijn['hoogte']; naam: string }[] = [
  { waarde: 'grond', naam: 'Over de grond' },
  { waarde: undefined, naam: 'Laag' },
  { waarde: 'hoog', naam: 'Hoog' },
];
const AFLOPEN: { waarde: Lijn['afloop']; naam: string }[] = [
  { waarde: 'goal', naam: 'Goal' },
  { waarde: 'vangt', naam: 'Keeper vangt' },
  { waarde: 'duikt', naam: 'Keeper duikt' },
  { waarde: 'naast', naam: 'Naast' },
];
const WACHTTIJDEN = [0, 0.5, 1, 2];
const komma = (v: number) => String(v).replace('.', ',');

const isPersoon = (o: VeldObject) => PERSONEN.includes(o.soort);

/** Stand van de tekening bij het begin (rijen, bal bij een speler); onthouden per tekening. */
const standen = new WeakMap<Tekening, Stand>();
function beginStand(t: Tekening): Stand {
  let s = standen.get(t);
  if (!s) {
    s = standOp(maakTijdlijn(t), 0);
    standen.set(t, s);
  }
  return s;
}

export function Tekenen({ id }: { id: string }) {
  const o = useEigenOefening(id);
  // Alleen de eerste versie gebruiken; daarna houdt de editor zelf de tekening bij.
  const [start] = useState(o);
  if (!start) return <NietGevonden />;
  return <Editor start={start} />;
}

/** Klein plaatje van een palet-item (zelfde tekenwerk als het veld). */
function PaletPlaatje({ item }: { item: PaletItem }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = 64 * dpr;
    c.height = 48 * dpr;
    const leeg: Tekening = {
      veld: { type: 'leeg', breedte: 1, lengte: 1 },
      objecten: [],
    };
    const o = item.maak(leeg, [0, 0]);
    if (o.soort === 'tekst') o.tekst = 'Abc';
    const v = objectVorm(o);
    const [x0, x1, y0, y1] = v.rechthoek ?? [-(v.straal ?? 0.5), v.straal ?? 0.5, -(v.straal ?? 0.5), v.straal ?? 0.5];
    const marge = Math.max(x1 - x0, y1 - y0) * 0.18 + 0.4;
    const t: Tekening = {
      ...leeg,
      objecten: [o],
      weergave: {
        x: x0 - marge,
        y: y0 - marge,
        breedte: x1 - x0 + 2 * marge,
        lengte: y1 - y0 + 2 * marge,
      },
    };
    tekenScene(c.getContext('2d')!, c.width, c.height, t, beginStand(t), {
      kleuren: leesKleuren(),
      dpr,
      mini: true,
    });
  }, [item]);
  return <canvas ref={ref} className="palet-plaatje" aria-hidden="true" />;
}

function Editor({ start }: { start: EigenOefening }) {
  const [begin] = useState(() => editorBegin(start.tekening));
  const [gesch] = useState(() => new Geschiedenis<Tekening>(begin.tekening));
  const [beginMelding, setBeginMelding] = useState(begin.melding);
  const [opties, setOpties] = useState(false);
  const [, setVersie] = useState(0);
  const ververs = useCallback(() => setVersie((v) => v + 1), []);
  const [selectie, setSelectie] = useState<Selectie>(null);
  const [gereedschap, setGereedschap] = useState<Gereedschap>({
    soort: 'kies',
  });
  const [paletOpen, setPaletOpen] = useState(false);
  const [drieD, setDrieD] = useState(false);
  const [vraag, setVraag] = useState<null | (() => void)>(null);
  const [hint, setHint] = useState(true);

  const vakRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beeld = useRef<Uitsnede>(uitsnede({ ...start.tekening, weergave: undefined }));
  const concept = useRef<Lijn | null>(null);
  const gebaar = useRef<Gebaar | null>(null);
  const vingers = useRef(new Map<number, Punt>());
  const kleuren = useMemo(() => leesKleuren(), []);
  const t = gesch.nu;
  const meldingen = useMemo(() => lijnMeldingen(t), [t]);
  // Vaste tekening voor de speler (anders bouwt 3D bij elke herteken opnieuw op).
  const speelTekening = useMemo(() => metTekening(start, t).tekening, [start, t]);
  const meldingenRef = useRef<LijnMelding[]>(meldingen);
  meldingenRef.current = meldingen;

  // ---------- opslaan (even wachten, en zeker bij weggaan) ----------
  const opslaan = useCallback(() => {
    const nu = eigenOefeningen.haal(start.id) ?? start;
    if (nu.tekening === gesch.nu) return;
    eigenOefeningen.bewaar(metTekening(nu, gesch.nu));
  }, [gesch, start]);
  useEffect(() => {
    const id = window.setTimeout(opslaan, 400);
    return () => window.clearTimeout(id);
  });
  useEffect(() => () => opslaan(), [opslaan]);

  // Pagina mag niet meeschuiven tijdens het tekenen.
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.classList.add('editor-open');
    return () => html.classList.remove('editor-open');
  }, []);

  // ---------- omrekenen scherm ↔ veld ----------
  const transform = useCallback(() => {
    const c = canvasRef.current!;
    const v = beeld.current;
    const schaal = Math.min(c.width / v.breedte, c.height / v.lengte);
    return {
      schaal,
      ox: (c.width - v.breedte * schaal) / 2 - v.x * schaal,
      oy: (c.height - v.lengte * schaal) / 2 - v.y * schaal,
      dpr: c.width / Math.max(1, c.clientWidth),
    };
  }, []);
  const naarVeld = useCallback(
    (cx: number, cy: number): Punt => {
      const c = canvasRef.current!;
      const r = c.getBoundingClientRect();
      const { schaal, ox, oy, dpr } = transform();
      return [((cx - r.left) * dpr - ox) / schaal, ((cy - r.top) * dpr - oy) / schaal];
    },
    [transform],
  );
  /** Meters die bij een aantal CSS-pixels horen. */
  const meter = useCallback(
    (cssPx: number) => {
      const { schaal, dpr } = transform();
      return (cssPx * dpr) / schaal;
    },
    [transform],
  );

  // ---------- tekenen ----------
  const teken = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !c.width) return;
    const ctx = c.getContext('2d')!;
    let tk = gesch.nu;
    if (concept.current) tk = voegLijnToe(tk, concept.current);
    const scene: Tekening = { ...tk, weergave: beeld.current };
    tekenScene(ctx, c.width, c.height, scene, beginStand(tk), {
      kleuren,
      dpr: transform().dpr,
    });

    // Selectie en handvatten.
    const { schaal, ox, oy, dpr } = transform();
    const px = (p: Punt): Punt => [ox + p[0] * schaal, oy + p[1] * schaal];

    // Stapnummers: rondje op elke lijn (oranje = let op, rood = doet niet mee).
    const plekBegin = (id: string): Punt | undefined => {
      const st = beginStand(tk).objecten.get(id);
      return st ? [st.x, st.y] : undefined;
    };
    (tk.lijnen ?? []).forEach((l, i) => {
      if (!l.stap) return;
      const [x, y] = px(stapPunt(l, plekBegin));
      const m = meldingenRef.current.filter((x) => x.lijn === i);
      const kleur = m.some((x) => x.soort === 'fout') ? '#c92a2a' : m.length ? '#e8590c' : '#0f6b3a';
      const rr = 10 * dpr;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 3 * dpr;
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.fillStyle = m.length ? kleur : '#ffffff';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2.5 * dpr;
      ctx.strokeStyle = kleur;
      ctx.stroke();
      ctx.fillStyle = m.length ? '#ffffff' : kleur;
      ctx.font = `700 ${Math.round(12 * dpr)}px Inter Variable, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(m.length ? `${l.stap}!` : String(l.stap), x, y + 0.5 * dpr);
      ctx.restore();
    });
    const handvat = (p: Punt, vorm: 'rond' | 'vierkant' | 'ruit', icoon?: boolean) => {
      const [x, y] = px(p);
      const r = 10 * dpr;
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f6b3a';
      ctx.lineWidth = 2.5 * dpr;
      ctx.beginPath();
      if (vorm === 'rond') ctx.arc(x, y, r, 0, Math.PI * 2);
      else if (vorm === 'vierkant') ctx.rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7);
      else {
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y);
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
      if (icoon) {
        // Draaipijltje.
        ctx.beginPath();
        ctx.arc(x, y, r * 0.5, -Math.PI * 0.9, Math.PI * 0.4);
        ctx.stroke();
      }
      ctx.restore();
    };
    const sel = selectieRef.current;
    if (sel?.soort === 'object') {
      const o = tk.objecten.find((x) => x.id === sel.id);
      if (o) {
        const st = beginStand(tk).objecten.get(o.id);
        const pos: Punt = st ? [st.x, st.y] : [o.x, o.y];
        const v = objectVorm(o);
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 * dpr;
        ctx.setLineDash([6 * dpr, 4 * dpr]);
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 3 * dpr;
        const [cx, cy] = px(pos);
        if (v.straal !== undefined) {
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(v.straal * schaal, 9 * dpr) + 5 * dpr, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const [x0, x1, y0, y1] = v.rechthoek!;
          const m = 4 * dpr;
          ctx.translate(cx, cy);
          ctx.rotate(((o.hoek ?? 0) * Math.PI) / 180);
          ctx.strokeRect(x0 * schaal - m, y0 * schaal - m, (x1 - x0) * schaal + 2 * m, (y1 - y0) * schaal + 2 * m);
        }
        ctx.restore();
        const h = objectHandvatten({ ...o, x: pos[0], y: pos[1] }, meter(DRAAI_AFSTAND));
        if (h.draai) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,255,0.8)';
          ctx.lineWidth = 1.5 * dpr;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(...px(h.draai));
          ctx.stroke();
          ctx.restore();
          handvat(h.draai, 'rond', true);
        }
        if (h.maat) handvat(h.maat, 'vierkant');
      }
    } else if (sel?.soort === 'lijn') {
      const l = tk.lijnen?.[sel.index];
      if (l) {
        const h = lijnHandvatten(tk, l);
        handvat(h.begin, 'rond');
        handvat(h.eind, 'rond');
        handvat(h.midden, 'ruit');
      }
    }
  }, [gesch, kleuren, transform, meter]);

  const selectieRef = useRef<Selectie>(null);
  selectieRef.current = selectie;

  // Maat van het canvas volgt het vak.
  useLayoutEffect(() => {
    const vak = vakRef.current;
    const c = canvasRef.current;
    if (!vak || !c) return;
    const zet = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      c.width = Math.round(vak.clientWidth * dpr);
      c.height = Math.round(vak.clientHeight * dpr);
      teken();
    };
    zet();
    const ro = new ResizeObserver(zet);
    ro.observe(vak);
    void document.fonts?.ready.then(teken);
    return () => ro.disconnect();
  }, [teken]);

  useEffect(() => {
    teken();
  });

  // ---------- wijzigen ----------
  const animatie = heeftAnimatie(t);
  /** Iets wijzigen in een geanimeerde kopie: eerst vragen of de animatie mag vervallen. */
  const metToestemming = (doe: () => void) => {
    if (!heeftAnimatie(gesch.nu)) return doe();
    setVraag(() => () => {
      gesch.zet(bevries(gesch.nu));
      doe();
      ververs();
    });
  };
  const zet = (nieuw: Tekening) => {
    gesch.zet(nieuw);
    ververs();
  };

  // ---------- aanwijzen ----------
  const opNeer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    c.setPointerCapture(e.pointerId);
    vingers.current.set(e.pointerId, [e.clientX, e.clientY]);
    setHint(false);
    if (vingers.current.size === 2) {
      // Tweede vinger: zoomen en schuiven; wat de eerste vinger deed, gaat niet door.
      if (gebaar.current?.soort === 'sleep' || gebaar.current?.soort === 'handvat') gesch.annuleer();
      concept.current = null;
      const [a, b] = [...vingers.current.values()] as [Punt, Punt];
      gebaar.current = {
        soort: 'knijp',
        afstand: Math.hypot(a[0] - b[0], a[1] - b[1]),
        midden: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
      };
      ververs();
      return;
    }
    if (vingers.current.size > 2) return;
    const p = naarVeld(e.clientX, e.clientY);
    const marge = meter(VINGER);
    const tk = gesch.nu;

    // 1. Handvatten van wat geselecteerd is.
    const sel = selectieRef.current;
    if (sel?.soort === 'object') {
      const o = tk.objecten.find((x) => x.id === sel.id);
      const st = o && beginStand(tk).objecten.get(o.id);
      if (o) {
        const h = objectHandvatten(st ? { ...o, x: st.x, y: st.y } : o, meter(DRAAI_AFSTAND));
        for (const k of ['draai', 'maat'] as const) {
          const q = h[k];
          if (q && Math.hypot(q[0] - p[0], q[1] - p[1]) < marge) {
            if (heeftAnimatie(tk)) return metToestemming(() => undefined);
            gesch.begin();
            gebaar.current = { soort: 'handvat', h: k, id: o.id };
            return;
          }
        }
      }
    } else if (sel?.soort === 'lijn') {
      const l = tk.lijnen?.[sel.index];
      if (l) {
        const h = lijnHandvatten(tk, l);
        for (const k of ['midden', 'begin', 'eind'] as const) {
          // Een eind dat aan een speler vastzit: dan pak je de speler (de lijn gaat mee).
          if ((k === 'begin' && l.van) || (k === 'eind' && l.naar)) continue;
          // Met een lijngereedschap teken je vanaf het eind van de vorige lijn een nieuwe; alleen het buigpunt is te pakken.
          if (k !== 'midden' && gereedschap.soort !== 'kies') continue;
          if (Math.hypot(h[k][0] - p[0], h[k][1] - p[1]) < marge) {
            gesch.begin();
            gebaar.current = { soort: 'handvat', h: k, lijn: sel.index };
            return;
          }
        }
      }
    }
    // 2. Gereedschap.
    if (gereedschap.soort === 'plaats') {
      gebaar.current = { soort: 'plaats', begin: [e.clientX, e.clientY], p };
      return;
    }
    if (gereedschap.soort === 'lijn') {
      gebaar.current = { soort: 'lijn', van: p };
      concept.current = nieuweLijn(tk, gereedschap.lijn, p, p, marge);
      return;
    }
    // 3. Kiezen en slepen.
    const o = raakObject(tk, p, marge);
    if (o) {
      setSelectie({ soort: 'object', id: o.id });
      const st = beginStand(tk).objecten.get(o.id);
      const plek: Punt = o.soort === 'bal' && st ? [st.x, st.y] : [o.x, o.y];
      gebaar.current = {
        soort: 'sleep',
        id: o.id,
        verschil: [plek[0] - p[0], plek[1] - p[1]],
        begin: [e.clientX, e.clientY],
        bewogen: false,
      };
      return;
    }
    const li = raakLijn(tk, p, marge);
    if (li >= 0) {
      setSelectie({ soort: 'lijn', index: li });
      gebaar.current = null;
      return;
    }
    setSelectie(null);
    gebaar.current = { soort: 'pan', laatste: [e.clientX, e.clientY] };
  };

  const opBeweeg = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!vingers.current.has(e.pointerId)) return;
    vingers.current.set(e.pointerId, [e.clientX, e.clientY]);
    const g = gebaar.current;
    if (!g) return;
    const p = naarVeld(e.clientX, e.clientY);
    const marge = meter(VINGER);
    switch (g.soort) {
      case 'knijp': {
        if (vingers.current.size < 2) return;
        const [a, b] = [...vingers.current.values()] as [Punt, Punt];
        const afstand = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const midden: Punt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const voor = naarVeld(...g.midden);
        zoom(g.afstand / Math.max(1, afstand), voor);
        // Schuiven met het midden van de twee vingers.
        const na = naarVeld(...midden);
        beeld.current = {
          ...beeld.current,
          x: beeld.current.x + (voor[0] - na[0]),
          y: beeld.current.y + (voor[1] - na[1]),
        };
        g.afstand = afstand;
        g.midden = midden;
        teken();
        return;
      }
      case 'pan': {
        const a = naarVeld(...g.laatste);
        beeld.current = {
          ...beeld.current,
          x: beeld.current.x - (p[0] - a[0]),
          y: beeld.current.y - (p[1] - a[1]),
        };
        g.laatste = [e.clientX, e.clientY];
        teken();
        return;
      }
      case 'sleep': {
        if (!g.bewogen) {
          if (Math.hypot(e.clientX - g.begin[0], e.clientY - g.begin[1]) < 6) return;
          if (heeftAnimatie(gesch.nu)) {
            gebaar.current = null;
            metToestemming(() => undefined);
            return;
          }
          gesch.begin();
          g.bewogen = true;
        }
        gesch.vervang(verplaats(gesch.nu, g.id, [p[0] + g.verschil[0], p[1] + g.verschil[1]]));
        teken();
        return;
      }
      case 'handvat': {
        if (g.lijn !== undefined) {
          gesch.vervang(sleepLijn(gesch.nu, g.lijn, g.h as 'begin' | 'midden' | 'eind', p, marge));
        } else if (g.id) {
          const o = gesch.nu.objecten.find((x) => x.id === g.id)!;
          if (g.h === 'draai') {
            const graden = (Math.atan2(p[1] - o.y, p[0] - o.x) * 180) / Math.PI;
            // Personen: kijkrichting; materiaal: het handvat zit aan de "bovenkant" (−y).
            const hoek = isPersoon(o) ? graden : graden + 90;
            gesch.vervang(draai(gesch.nu, o.id, Math.round(hoek / 15) * 15));
          } else gesch.vervang(maatNaar(gesch.nu, o.id, p));
        }
        teken();
        return;
      }
      case 'lijn': {
        if (gereedschap.soort !== 'lijn') return;
        concept.current = nieuweLijn(gesch.nu, gereedschap.lijn, g.van, p, marge);
        teken();
        return;
      }
      case 'plaats':
        g.p = p;
        return;
    }
  };

  const opOp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    vingers.current.delete(e.pointerId);
    const g = gebaar.current;
    if (!g) return;
    if (g.soort === 'knijp') {
      // Pas weer iets doen als alle vingers los zijn.
      if (vingers.current.size === 0) gebaar.current = null;
      return;
    }
    gebaar.current = null;
    const p = naarVeld(e.clientX, e.clientY);
    switch (g.soort) {
      case 'sleep':
        if (g.bewogen) {
          const o = gesch.nu.objecten.find((x) => x.id === g.id);
          if (o?.soort === 'bal') gesch.vervang(lagBalNeer(gesch.nu, o.id));
          gesch.klaar();
        }
        break;
      case 'handvat':
        gesch.klaar();
        break;
      case 'lijn': {
        const l = concept.current;
        concept.current = null;
        if (l) {
          const [a, b] = [l.punten[0]!, l.punten[l.punten.length - 1]!];
          if (Math.hypot(a[0] - b[0], a[1] - b[1]) > meter(14)) {
            gesch.zet(voegLijnToe(gesch.nu, { ...l, stap: volgendeStap(gesch.nu) }));
            setSelectie({
              soort: 'lijn',
              index: (gesch.nu.lijnen?.length ?? 1) - 1,
            });
          }
        }
        break;
      }
      case 'plaats':
        if (Math.hypot(e.clientX - g.begin[0], e.clientY - g.begin[1]) < 10 && gereedschap.soort === 'plaats') {
          const o = gereedschap.item.maak(gesch.nu, p);
          gesch.zet(voegToe(gesch.nu, o));
          setSelectie({ soort: 'object', id: o.id });
        }
        break;
    }
    ververs();
  };

  const opAnnuleer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    vingers.current.delete(e.pointerId);
    if (gebaar.current?.soort === 'sleep' || gebaar.current?.soort === 'handvat') gesch.annuleer();
    gebaar.current = null;
    concept.current = null;
    ververs();
  };

  /** In- of uitzoomen rond een punt van het veld. */
  const zoom = (factor: number, rond: Punt) => {
    const v = beeld.current;
    const vol = uitsnede({ ...gesch.nu, weergave: undefined });
    const max = Math.max(vol.breedte, vol.lengte) * 1.6;
    const f = Math.min(Math.max(factor, 4 / Math.min(v.breedte, v.lengte)), max / Math.max(v.breedte, v.lengte));
    beeld.current = {
      x: rond[0] - (rond[0] - v.x) * f,
      y: rond[1] - (rond[1] - v.y) * f,
      breedte: v.breedte * f,
      lengte: v.lengte * f,
    };
  };

  // Alleen voor de browsertests: veld ↔ scherm omrekenen en de tekening uitlezen.
  useEffect(() => {
    let test = false;
    try {
      test = localStorage.getItem('trainersapp.testEditor') === '1';
    } catch {
      /* geen opslag */
    }
    if (!test) return;
    const w = window as unknown as Record<string, unknown>;
    w.__editor = {
      naarScherm: (p: Punt) => {
        const c = canvasRef.current!;
        const r = c.getBoundingClientRect();
        const { schaal, ox, oy, dpr } = transform();
        return [r.left + (ox + p[0] * schaal) / dpr, r.top + (oy + p[1] * schaal) / dpr];
      },
      tekening: () => gesch.nu,
      beeld: () => beeld.current,
      meldingen: () => lijnMeldingen(gesch.nu),
      stapPunt: (i: number) => {
        const l = gesch.nu.lijnen?.[i];
        if (!l) return null;
        const st = beginStand(gesch.nu);
        return stapPunt(l, (id) => {
          const o = st.objecten.get(id);
          return o ? [o.x, o.y] : undefined;
        });
      },
      handvatten: () => {
        const sel = selectieRef.current;
        if (sel?.soort === 'object') {
          const o = gesch.nu.objecten.find((x) => x.id === sel.id);
          return o ? objectHandvatten(o, meter(DRAAI_AFSTAND)) : {};
        }
        if (sel?.soort === 'lijn') {
          const l = gesch.nu.lijnen?.[sel.index];
          return l ? lijnHandvatten(gesch.nu, l) : {};
        }
        return {};
      },
    };
    return () => {
      delete w.__editor;
    };
  });

  // Muiswiel: zoomen rond de muis (zonder dat de pagina scrolt).
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const wiel = (e: WheelEvent) => {
      e.preventDefault();
      zoom(Math.exp(e.deltaY * 0.0015), naarVeld(e.clientX, e.clientY));
      teken();
    };
    c.addEventListener('wheel', wiel, { passive: false });
    return () => c.removeEventListener('wheel', wiel);
  });

  const heelVeld = () => {
    beeld.current = uitsnede({ ...gesch.nu, weergave: undefined });
    teken();
  };

  // ---------- knoppen ----------
  const sel = selectie;
  const gekozen = sel?.soort === 'object' ? t.objecten.find((o) => o.id === sel.id) : undefined;
  const gekozenLijn = sel?.soort === 'lijn' ? t.lijnen?.[sel.index] : undefined;

  const ongedaan = () => {
    gesch.terug();
    setSelectie(null);
    ververs();
  };
  const herdoen = () => {
    gesch.vooruit();
    setSelectie(null);
    ververs();
  };
  const weg = () => {
    if (gekozen) metToestemming(() => zet(verwijder(gesch.nu, gekozen.id)));
    else if (sel?.soort === 'lijn') zet(verwijderLijn(gesch.nu, sel.index));
    setSelectie(null);
  };

  // Toetsenbord (laptop): Delete, Ctrl+Z, Ctrl+Y.
  useEffect(() => {
    const toets = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea')) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        ongedaan();
      } else if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        herdoen();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectieRef.current) {
          e.preventDefault();
          weg();
        }
      } else if (e.key === 'Escape') {
        setGereedschap({ soort: 'kies' });
        setSelectie(null);
      }
    };
    window.addEventListener('keydown', toets);
    return () => window.removeEventListener('keydown', toets);
  });

  const naarGegevens = () => {
    opslaan();
    ga(`/eigen/${start.id}/gegevens`);
  };

  const kiesGereedschap = (g: Gereedschap) => {
    setGereedschap(g);
    if (g.soort !== 'kies') setSelectie(null);
  };

  const naam = eigenNaam(eigenOefeningen.haal(start.id) ?? start);
  const plaatsNaam = gereedschap.soort === 'plaats' ? gereedschap.item.naam : gereedschap.soort === 'lijn' ? `${LIJN_NAMEN[gereedschap.lijn].naam}lijn` : '';

  return (
    <div className="editor">
      <header className="editor-kop">
        <button
          className="kop-terug"
          aria-label="Terug"
          onClick={() => {
            opslaan();
            terug('/eigen');
          }}
        >
          <Icoon naam="terug" maat={26} />
        </button>
        <h1 className="editor-titel">{naam}</h1>
        <button className="editor-knop" onClick={ongedaan} disabled={!gesch.kanTerug} aria-label="Ongedaan maken" title="Ongedaan maken">
          <Icoon naam="ongedaan" />
        </button>
        <button className="editor-knop" onClick={herdoen} disabled={!gesch.kanVooruit} aria-label="Opnieuw" title="Opnieuw">
          <Icoon naam="herdoen" />
        </button>
        <button className="editor-knop editor-afspelen" onClick={() => setDrieD(true)} aria-label="Afspelen" title="Afspelen (2D en 3D)">
          <Icoon naam="afspelen" />
        </button>
        <button className="knop knop-primair editor-gegevens" onClick={naarGegevens}>
          Gegevens
          <Icoon naam="verder" maat={18} />
        </button>
      </header>

      <div className="editor-vak" ref={vakRef}>
        <canvas
          ref={canvasRef}
          className="editor-canvas"
          role="application"
          aria-label="Tekenveld: tik om te kiezen, sleep om te verplaatsen, twee vingers om te zoomen"
          onPointerDown={opNeer}
          onPointerMove={opBeweeg}
          onPointerUp={opOp}
          onPointerCancel={opAnnuleer}
          onContextMenu={(e) => e.preventDefault()}
        />
        {beginMelding ? (
          <button className="editor-melding editor-melding-knop" onClick={() => setBeginMelding(undefined)}>
            {beginMelding} <span className="editor-melding-weg">OK</span>
          </button>
        ) : (
          animatie && <div className="editor-melding">Met animatie. Verschuif je iets, dan wordt het een tekening zonder animatie.</div>
        )}
        {meldingen.length > 0 && (
          <div className={`editor-waarschuwing${plaatsNaam ? ' hoger' : ''}`} role="status">
            <Icoon naam="info" maat={16} />
            {meldingen.some((m) => m.soort === 'fout')
              ? `${meldingen.filter((m) => m.soort === 'fout').length === 1 ? 'Eén lijn doet' : `${meldingen.filter((m) => m.soort === 'fout').length} lijnen doen`} niet mee: tik op het rode nummer`
              : 'Let op: tik op het oranje nummer'}
          </div>
        )}
        {hint && !animatie && t.objecten.length === 0 && <div className="editor-melding">Kies onderin wat je wilt toevoegen en tik op het veld. Twee vingers (of het muiswiel): zoomen.</div>}
        {plaatsNaam && (
          <div className="editor-plaats" role="status">
            <span>
              <strong>{plaatsNaam}</strong> – {gereedschap.soort === 'lijn' ? 'sleep over het veld (vanaf een speler zit hij eraan vast)' : 'tik op het veld'}
            </span>
            <button className="icoon-knop" aria-label="Klaar met plaatsen" onClick={() => kiesGereedschap({ soort: 'kies' })}>
              <Icoon naam="kruis" maat={18} />
            </button>
          </div>
        )}
        <button className="editor-heel" onClick={heelVeld} aria-label="Heel veld in beeld" title="Heel veld in beeld">
          <Icoon naam="kompas" maat={20} />
        </button>
      </div>

      {(gekozen || gekozenLijn) && (
        <div className="editor-eigenschappen">
          {gekozen && (
            <>
              <span className="editor-naam">{paletVan(gekozen)?.naam ?? gekozen.soort}</span>
              {gekozen.nummer !== undefined && (
                <span className="editor-nummer">
                  <button
                    aria-label="Lager nummer"
                    onClick={() =>
                      zet(
                        zetObject(t, gekozen.id, {
                          nummer: Math.max(0, (gekozen.nummer ?? 1) - 1),
                        }),
                      )
                    }
                  >
                    <Icoon naam="min" maat={16} />
                  </button>
                  <output aria-label="Nummer">{gekozen.nummer}</output>
                  <button
                    aria-label="Hoger nummer"
                    onClick={() =>
                      zet(
                        zetObject(t, gekozen.id, {
                          nummer: Math.min(99, (gekozen.nummer ?? 0) + 1),
                        }),
                      )
                    }
                  >
                    <Icoon naam="plus" maat={16} />
                  </button>
                </span>
              )}
              {gekozen.soort === 'tekst' && (
                <input className="editor-tekst" value={gekozen.tekst ?? ''} maxLength={30} aria-label="Tekst" onChange={(e) => zet(zetObject(t, gekozen.id, { tekst: e.target.value }))} />
              )}
              {gekozen.soort === 'zone' && (
                <span className="editor-kleuren" role="group" aria-label="Kleur">
                  {[undefined, ...ZONE_KLEUREN].map((k) => (
                    <button
                      key={k ?? 'geen'}
                      className={`kleur${gekozen.kleur === k ? ' aan' : ''}`}
                      style={{ background: k ?? 'transparent' }}
                      aria-label={k ? `Kleur ${k}` : 'Geen kleur'}
                      onClick={() => metToestemming(() => zet(zetObject(gesch.nu, gekozen.id, { kleur: k })))}
                    />
                  ))}
                </span>
              )}
              {draaiBaar(gekozen) && (
                <button
                  className="icoon-knop"
                  aria-label="Draai 45 graden"
                  title="Draai 45°"
                  onClick={() => metToestemming(() => zet(draai(gesch.nu, gekozen.id, ((isPersoon(gekozen) ? (gekozen.kijkrichting ?? -90) : (gekozen.hoek ?? 0)) as number) + 45)))}
                >
                  <Icoon naam="draai" maat={20} />
                </button>
              )}
              <button
                className="icoon-knop"
                aria-label="Kopiëren"
                title="Kopiëren"
                onClick={() => {
                  const k = kopieer(gesch.nu, gekozen.id);
                  zet(k.tekening);
                  setSelectie({ soort: 'object', id: k.id });
                }}
              >
                <Icoon naam="kopieer" maat={20} />
              </button>
            </>
          )}
          {gekozenLijn && sel?.soort === 'lijn' && (
            <>
              <span className="editor-nummer editor-stap" aria-label="Stapnummer">
                <span className="editor-stap-label">Stap</span>
                <button
                  aria-label="Lager stapnummer"
                  disabled={(gekozenLijn.stap ?? 1) <= 1}
                  onClick={() => zet(zetLijn(t, sel.index, { ...gekozenLijn, stap: Math.max(1, (gekozenLijn.stap ?? 1) - 1) }))}
                >
                  <Icoon naam="min" maat={16} />
                </button>
                <output aria-label="Stap">{gekozenLijn.stap ?? '–'}</output>
                <button aria-label="Hoger stapnummer" onClick={() => zet(zetLijn(t, sel.index, { ...gekozenLijn, stap: Math.min(30, (gekozenLijn.stap ?? 0) + 1) }))}>
                  <Icoon naam="plus" maat={16} />
                </button>
              </span>
              <span className="editor-lijnsoorten" role="group" aria-label="Soort lijn">
                {(['bal', 'loop', 'dribbel'] as const).map((s) => (
                  <button
                    key={s}
                    className={gekozenLijn.soort === s ? 'aan' : ''}
                    aria-pressed={gekozenLijn.soort === s}
                    aria-label={LIJN_NAMEN[s].naam}
                    title={LIJN_NAMEN[s].naam}
                    onClick={() => zet(zetLijn(t, sel.index, { ...gekozenLijn, soort: s }))}
                  >
                    <Icoon naam={LIJN_NAMEN[s].icoon} maat={20} />
                  </button>
                ))}
              </span>
              <button className={`knop editor-klein${meldingen.some((m) => m.lijn === sel.index) ? ' editor-let-op' : ''}`} onClick={() => setOpties(true)}>
                {meldingen.some((m) => m.lijn === sel.index) ? '! Opties' : 'Opties'}
              </button>
            </>
          )}
          <button className="icoon-knop gevaar" aria-label="Verwijderen" title="Verwijderen" onClick={weg}>
            <Icoon naam="prullenbak" maat={20} />
          </button>
        </div>
      )}

      <nav className="editor-balk" aria-label="Gereedschap">
        <button className={gereedschap.soort === 'kies' ? 'aan' : ''} aria-pressed={gereedschap.soort === 'kies'} onClick={() => kiesGereedschap({ soort: 'kies' })}>
          <Icoon naam="wijzer" />
          <span>Kiezen</span>
        </button>
        <button className={gereedschap.soort === 'plaats' ? 'aan' : ''} aria-pressed={gereedschap.soort === 'plaats'} onClick={() => setPaletOpen(true)}>
          <Icoon naam="plus" />
          <span>Toevoegen</span>
        </button>
        {(['bal', 'loop', 'dribbel'] as const).map((s) => {
          const aan = gereedschap.soort === 'lijn' && gereedschap.lijn === s;
          return (
            <button key={s} className={aan ? 'aan' : ''} aria-pressed={aan} onClick={() => kiesGereedschap(aan ? { soort: 'kies' } : { soort: 'lijn', lijn: s })}>
              <Icoon naam={LIJN_NAMEN[s].icoon} />
              <span>{LIJN_NAMEN[s].naam}</span>
            </button>
          );
        })}
      </nav>

      {paletOpen && (
        <div className="paneel-achter" onClick={() => setPaletOpen(false)}>
          <div className="paneel" role="dialog" aria-label="Toevoegen" onClick={(e) => e.stopPropagation()}>
            <div className="paneel-kop">
              <h2>Toevoegen</h2>
              <button className="icoon-knop" aria-label="Sluiten" onClick={() => setPaletOpen(false)}>
                <Icoon naam="kruis" />
              </button>
            </div>
            {GROEPEN.map((g) => (
              <section key={g} className="palet-groep">
                <h3>{g}</h3>
                <div className="palet">
                  {PALET.filter((p) => p.groep === g).map((p) => (
                    <button
                      key={p.sleutel}
                      className="palet-item"
                      onClick={() => {
                        kiesGereedschap({ soort: 'plaats', item: p });
                        setPaletOpen(false);
                      }}
                    >
                      <PaletPlaatje item={p} />
                      <span>{p.naam}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {drieD && (
        <div className="paneel-achter editor-3d">
          <div className="paneel paneel-groot" role="dialog" aria-label="Afspelen">
            <div className="paneel-kop">
              <h2>{heeftLijnAnimatie(t) || animatie ? 'Afspelen' : 'Bekijken'}</h2>
              <button className="icoon-knop" aria-label="Sluiten" onClick={() => setDrieD(false)}>
                <Icoon naam="kruis" />
              </button>
            </div>
            <AnimatieSpeler tekening={speelTekening} />
            {!heeftLijnAnimatie(t) && !animatie && <p className="editor-uitleg">Nog geen animatie: teken lijnen (pass, lopen, dribbel). Elke lijn krijgt een stapnummer; zo speelt de oefening af.</p>}
            {heeftLijnAnimatie(t) && (
              <label className="editor-schakel">
                <input type="checkbox" checked={!!t.herhaalRij} onChange={() => zet({ ...t, herhaalRij: !t.herhaalRij })} />
                <span>
                  <strong>Herhaal voor de volgende spelers in de rij</strong>
                  <span className="klein">Zet de andere spelers vlak achter de eerste speler (zonder eigen lijnen). Iedereen doet het patroon na elkaar en sluit daarna achteraan aan.</span>
                </span>
              </label>
            )}
            {meldingen.length > 0 && (
              <ul className="editor-meldingen">
                {meldingen.map((m, i) => (
                  <li key={i} className={m.soort === 'fout' ? 'fout' : ''}>
                    {m.lijn >= 0 ? <strong>Stap {t.lijnen?.[m.lijn]?.stap ?? '?'}: </strong> : null}
                    {m.tekst}
                  </li>
                ))}
              </ul>
            )}
            <button className="knop knop-primair knop-breed" onClick={() => setDrieD(false)}>
              <Icoon naam="potlood" maat={18} />
              Terug naar tekenen
            </button>
          </div>
        </div>
      )}

      {opties && gekozenLijn && sel?.soort === 'lijn' && (
        <div className="paneel-achter" onClick={() => setOpties(false)}>
          <div className="paneel" role="dialog" aria-label="Opties van de lijn" onClick={(e) => e.stopPropagation()}>
            <div className="paneel-kop">
              <h2>
                {gekozenLijn.soort === 'bal' ? (isSchotLijn(t, gekozenLijn) ? 'Schot' : 'Pass') : gekozenLijn.soort === 'loop' ? 'Looplijn' : 'Dribbel'} – stap {gekozenLijn.stap ?? '–'}
              </h2>
              <button className="icoon-knop" aria-label="Sluiten" onClick={() => setOpties(false)}>
                <Icoon naam="kruis" />
              </button>
            </div>
            {meldingen.filter((m) => m.lijn === sel.index).length > 0 && (
              <ul className="editor-meldingen">
                {meldingen
                  .filter((m) => m.lijn === sel.index)
                  .map((m, i) => (
                    <li key={i} className={m.soort === 'fout' ? 'fout' : ''}>
                      {m.soort === 'fout' ? 'Doet niet mee: ' : 'Let op: '}
                      {m.tekst}
                    </li>
                  ))}
              </ul>
            )}
            {gekozenLijn.soort === 'loop' && (
              <section className="optie-groep">
                <h3>Loopwijze</h3>
                <div className="chips">
                  {LOOPWIJZEN.map((w) => (
                    <button
                      key={w.naam}
                      className={gekozenLijn.manier === w.waarde ? 'aan' : ''}
                      aria-pressed={gekozenLijn.manier === w.waarde}
                      onClick={() => zet(zetLijn(t, sel.index, { ...gekozenLijn, manier: w.waarde }))}
                    >
                      {w.naam}
                    </button>
                  ))}
                </div>
                <p className="klein">Over een ladder, horde of ring loopt hij vanzelf met voetenwerk of sprongen.</p>
              </section>
            )}
            {gekozenLijn.soort === 'bal' && (
              <section className="optie-groep">
                <h3>Hoogte van de bal</h3>
                <div className="chips">
                  {(isSchotLijn(t, gekozenLijn) ? HOOGTES_SCHOT : HOOGTES).map((w) => (
                    <button
                      key={w.naam}
                      className={gekozenLijn.hoogte === w.waarde || (!isSchotLijn(t, gekozenLijn) && w.waarde === undefined && gekozenLijn.hoogte === 'grond') ? 'aan' : ''}
                      onClick={() => zet(zetLijn(t, sel.index, { ...gekozenLijn, hoogte: w.waarde }))}
                    >
                      {w.naam}
                    </button>
                  ))}
                </div>
              </section>
            )}
            {doelnetUitkomst(t, gekozenLijn) && (
              <section className="optie-groep">
                <h3>Doelnet</h3>
                <p className="melding-goed doelnet-uitkomst" role="status">
                  {doelnetUitkomst(t, gekozenLijn) === 'gat' ? 'Raak: de bal gaat door het gat het goal in.' : 'De bal raakt het net en kaatst terug.'}
                </p>
                <p className="klein">Mik in een hoek: laag of over de grond voor de onderste gaten, hoog voor de bovenste. Daartussen kaatst de bal terug.</p>
              </section>
            )}
            {isSchotLijn(t, gekozenLijn) && !doelnetUitkomst(t, gekozenLijn) && (
              <section className="optie-groep">
                <h3>Afloop van het schot</h3>
                <div className="chips">
                  {AFLOPEN.map((w) => {
                    const nu = gekozenLijn.afloop ?? (heeftKeeperBijGoal(t) ? 'vangt' : 'goal');
                    return (
                      <button key={w.naam} className={nu === w.waarde ? 'aan' : ''} aria-pressed={nu === w.waarde} onClick={() => zet(zetLijn(t, sel.index, { ...gekozenLijn, afloop: w.waarde }))}>
                        {w.naam}
                      </button>
                    );
                  })}
                </div>
                {!heeftKeeperBijGoal(t) && <p className="klein">Zet een keeper in het goal: die kiest dan vanzelf positie en vangt of duikt.</p>}
              </section>
            )}
            <section className="optie-groep">
              <h3>Wachten vóór deze stap</h3>
              <div className="chips">
                {WACHTTIJDEN.map((w) => (
                  <button key={w} className={(gekozenLijn.wacht ?? 0) === w ? 'aan' : ''} onClick={() => zet(zetLijn(t, sel.index, { ...gekozenLijn, wacht: w || undefined }))}>
                    {w ? `${komma(w)} s` : 'Niet'}
                  </button>
                ))}
              </div>
            </section>
            <section className="optie-groep">
              <label className="editor-schakel">
                <input type="checkbox" checked={!!t.herhaalRij} onChange={() => zet({ ...t, herhaalRij: !t.herhaalRij })} />
                <span>
                  <strong>Herhaal voor de volgende spelers in de rij</strong>
                  <span className="klein">Geldt voor de hele oefening.</span>
                </span>
              </label>
            </section>
            <div className="knoppenrij">
              {gekozenLijn.bocht ? (
                <button
                  className="knop"
                  onClick={() => {
                    const { bocht: _b, ...recht } = gekozenLijn;
                    void _b;
                    zet(zetLijn(t, sel.index, recht));
                  }}
                >
                  Recht maken
                </button>
              ) : (
                <span />
              )}
              <button className="knop knop-primair" onClick={() => setOpties(false)}>
                Klaar
              </button>
            </div>
          </div>
        </div>
      )}

      {vraag && (
        <div className="paneel-achter">
          <div className="paneel paneel-vraag" role="alertdialog" aria-label="Animatie laten vervallen?">
            <h2>Animatie laten vervallen?</h2>
            <p>Deze oefening is een kopie met animatie. Als je iets verschuift, draait of weghaalt, wordt het een tekening zonder animatie. Iedereen blijft op zijn beginplek staan.</p>
            <div className="knoppenrij">
              <button
                className="knop knop-primair"
                onClick={() => {
                  vraag();
                  setVraag(null);
                }}
              >
                Ja, aanpassen
              </button>
              <button className="knop" onClick={() => setVraag(null)}>
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
