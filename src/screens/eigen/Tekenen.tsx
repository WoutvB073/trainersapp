import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Lijn, LijnSoort, Punt, Tekening, Uitsnede, VeldObject } from '../../model/types';
import { PERSONEN } from '../../model/types';
import { maakTijdlijn, standOp, type Stand } from '../../anim/timeline';
import { lijnPunten } from '../../model/lijn';
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
  plekIn,
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
import { driehoekPunt, editorBegin, heeftLijnAnimatie, isSchotLijn, lijnMeldingen, stapPunt, volgendeStap, type LijnMelding, type Oplossing } from '../../editor/animatie';
import {
  geefBal,
  kandidaten,
  koppelAan,
  lijnBegin,
  lijnEind,
  naarStap,
  sleepLijnVast,
  standBijLijn,
  standVoorStap,
  tekenLijn,
  VASTKLIK_PX,
  wordtLoop,
  type Maten,
  type StandVoor,
} from '../../editor/vastklikken';
import { doelnetUitkomst, heeftKeeperBijGoal } from '../../editor/animatie';
import { metTekening } from '../../eigen/eigen';
import { autoUitsnede } from '../../editor/editor';
import { ga, terug } from '../../router';
import { NietGevonden } from '../NietGevonden';
import { eigenNaam } from './EigenOefeningen';
import { getal, t as vt } from '../../i18n/t';

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
  | { soort: 'handvat'; h: Handvat; id?: string; lijn?: number; stand?: StandVoor }
  | { soort: 'pan'; laatste: Punt }
  | { soort: 'knijp'; afstand: number; midden: Punt }
  | { soort: 'lijn'; van: Punt; scherm: Punt; stand: StandVoor }
  | { soort: 'melding'; lijn: number; begin: Punt }
  | { soort: 'plaats'; begin: Punt; p: Punt };

/** Aanraakmaat in CSS-pixels: zo groot is een vinger ongeveer. */
const VINGER = 22;
/** Een bal die binnen zoveel CSS-pixels van een persoon neergelegd wordt, is van hem (in beeld ligt hij er dan tegenaan). */
const BAL_PX = 24;
/** Kleur van het waarschuwingsdriehoekje (geel, met een donker uitroepteken: lijkt op geen enkele speler). */
const DRIEHOEK_GEEL = '#ffd43b';
const DRIEHOEK_RAND = '#5c4100';
/** Afstand van het draaihandvat tot het object (CSS-pixels). */
const DRAAI_AFSTAND = 30;

const LIJN_NAMEN: Record<LijnSoort, { naam: string; lijn: string; icoon: IcoonNaam }> = {
  bal: { naam: vt('Pass'), lijn: vt('Passlijn'), icoon: 'lijnBal' },
  loop: { naam: vt('Lopen'), lijn: vt('Looplijn'), icoon: 'lijnLoop' },
  dribbel: { naam: vt('Dribbel'), lijn: vt('Dribbellijn'), icoon: 'lijnDribbel' },
};

// i18n-ok (sleutels; de naam staat in GROEP_NAAM)
const GROEPEN: PaletGroep[] = ['Spelers', 'Doelen', 'Materiaal', 'Vakken en tekst'];
const GROEP_NAAM: Record<PaletGroep, string> = { Spelers: vt('Spelers'), Doelen: vt('Doelen'), Materiaal: vt('Materiaal'), 'Vakken en tekst': vt('Vakken en tekst') };

const LOOPWIJZEN: { waarde: Lijn['manier']; naam: string }[] = [
  { waarde: undefined, naam: vt('Normaal') },
  { waarde: 'sprint', naam: vt('Sprint') },
  { waarde: 'zijwaarts', naam: vt('Zijwaarts') },
  { waarde: 'achteruit', naam: vt('Achteruit') },
];
const HOOGTES: { waarde: Lijn['hoogte']; naam: string }[] = [
  { waarde: undefined, naam: vt('Grond') },
  { waarde: 'halfhoog', naam: vt('Halfhoog') },
  { waarde: 'hoog', naam: vt('Hoog') },
];
const HOOGTES_SCHOT: { waarde: Lijn['hoogte']; naam: string }[] = [
  { waarde: 'grond', naam: vt('Over de grond') },
  { waarde: undefined, naam: vt('Laag') },
  { waarde: 'hoog', naam: vt('Hoog') },
];
const AFLOPEN: { waarde: Lijn['afloop']; naam: string }[] = [
  { waarde: 'goal', naam: vt('Goal') },
  { waarde: 'vangt', naam: vt('Keeper vangt') },
  { waarde: 'duikt', naam: vt('Keeper duikt') },
  { waarde: 'naast', naam: vt('Naast') },
];
const WACHTTIJDEN = [0, 0.5, 1, 2];
const komma = (v: number) => getal(v);

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

/** Plek van een object aan het begin (rijen, bal bij een speler). */
const plekBegin =
  (tk: Tekening) =>
  (id: string): Punt | undefined => {
    const st = beginStand(tk).objecten.get(id);
    return st ? [st.x, st.y] : undefined;
  };

/** Geel waarschuwingsdriehoekje met een uitroepteken (schermpixels). */
function tekenDriehoek(ctx: CanvasRenderingContext2D, [x, y]: Punt, dpr: number) {
  const h = 22 * dpr;
  const b = 25 * dpr;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 4 * dpr;
  ctx.beginPath();
  ctx.moveTo(x, y - h * 0.6);
  ctx.lineTo(x + b / 2, y + h * 0.4);
  ctx.lineTo(x - b / 2, y + h * 0.4);
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.fillStyle = DRIEHOEK_GEEL;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2 * dpr;
  ctx.strokeStyle = DRIEHOEK_RAND;
  ctx.stroke();
  ctx.fillStyle = DRIEHOEK_RAND;
  ctx.font = `800 ${Math.round(14 * dpr)}px Inter Variable, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', x, y + h * 0.08); // i18n-ok
  ctx.restore();
}

/**
 * Waar de editor zijn tekening vandaan haalt en bewaart. Eigen oefeningen en tactiekborden gebruiken dezelfde editor.
 */
export interface EditorBron {
  /** Tekening bij het openen. */
  tekening: Tekening;
  naam: () => string;
  /** Bewaren (de editor geeft de tekening zonder uitsnede; die wordt vanzelf bepaald). */
  bewaar: (t: Tekening) => void;
  /** Waar Terug heen gaat. */
  ouder: string;
  /** Knop rechtsboven (bv. "Gegevens"). */
  verder: { label: string; naar: string };
  /** Knop om alle lijnen in één keer te wissen (tactiekbord). */
  wissen?: boolean;
  /** Spelers een naam kunnen geven (tactiekbord). */
  namen?: boolean;
}

export function Tekenen({ id }: { id: string }) {
  const o = useEigenOefening(id);
  // Alleen de eerste versie gebruiken; daarna houdt de editor zelf de tekening bij.
  const [start] = useState(o);
  const bron = useMemo<EditorBron | null>(
    () =>
      start
        ? {
            tekening: start.tekening,
            naam: () => eigenNaam(eigenOefeningen.haal(start.id) ?? start),
            bewaar: (t) => eigenOefeningen.bewaar(metTekening(eigenOefeningen.haal(start.id) ?? start, t)),
            ouder: '/eigen',
            verder: { label: vt('Gegevens'), naar: `/eigen/${start.id}/gegevens` },
          }
        : null,
    [start],
  );
  if (!bron) return <NietGevonden />;
  return <Editor bron={bron} />;
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
    if (o.soort === 'tekst') o.tekst = vt('Abc');
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

/** Tekening met de uitsnede die bij de inhoud past (voor afspelen en bewaren). */
const metUitsnede = (t: Tekening) => {
  const weergave = autoUitsnede(t);
  const uit: Tekening = { ...t };
  if (weergave) uit.weergave = weergave;
  else delete uit.weergave;
  return uit;
};

export function Editor({ bron }: { bron: EditorBron }) {
  const start = bron;
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
  /** Spelers waar de lijn die je nu tekent aan vastzit (oplichtende ring). */
  const ringen = useRef<Punt[]>([]);
  const [koppelVraag, setKoppelVraag] = useState<number | null>(null);
  const gebaar = useRef<Gebaar | null>(null);
  const vingers = useRef(new Map<number, Punt>());
  const kleuren = useMemo(() => leesKleuren(), []);
  const t = gesch.nu;
  const meldingen = useMemo(() => lijnMeldingen(t), [t]);
  // Vaste tekening voor de speler (anders bouwt 3D bij elke herteken opnieuw op).
  const speelTekening = useMemo(() => metUitsnede(t), [t]);
  const meldingenRef = useRef<LijnMelding[]>(meldingen);
  meldingenRef.current = meldingen;

  // ---------- opslaan (even wachten, en zeker bij weggaan) ----------
  const bewaard = useRef<Tekening>(start.tekening);
  const opslaan = useCallback(() => {
    if (bewaard.current === gesch.nu) return;
    bewaard.current = gesch.nu;
    bron.bewaar(gesch.nu);
  }, [gesch, bron]);
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
  /** Vastklikken: ± 40 px op het scherm (minstens 1 m vanaf de rand), en precies raken. */
  const maten = useCallback((): Maten => ({ marge: Math.max(meter(VASTKLIK_PX), 1), klein: meter(VINGER) }), [meter]);
  /** Afstand in CSS-pixels tussen een schermpunt en een punt op het veld. */
  const schermAfstand = useCallback(
    (cx: number, cy: number, p: Punt) => {
      const c = canvasRef.current!;
      const r = c.getBoundingClientRect();
      const { schaal, ox, oy, dpr } = transform();
      return Math.hypot(r.left + (ox + p[0] * schaal) / dpr - cx, r.top + (oy + p[1] * schaal) / dpr - cy);
    },
    [transform],
  );
  /** Lijn waarvan je het gele driehoekje (of met `nummer` het stapnummer) raakt, of -1. */
  const raakTeken = (cx: number, cy: number, soort: 'driehoek' | 'nummer'): number => {
    const tk = gesch.nu;
    const m = meldingenRef.current;
    let beste = -1;
    let d = soort === 'driehoek' ? 20 : 14;
    (tk.lijnen ?? []).forEach((l, i) => {
      if (!l.stap) return;
      if (soort === 'driehoek' && !m.some((x) => x.lijn === i)) return;
      const a = schermAfstand(cx, cy, soort === 'driehoek' ? driehoekPunt(l, plekBegin(tk)) : stapPunt(l, plekBegin(tk)));
      if (a <= d) {
        d = a;
        beste = i;
      }
    });
    return beste;
  };

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

    // Ringen om de speler(s) waar de lijn die je nu tekent of versleept aan vastzit.
    for (const p of ringen.current) {
      const [x, y] = px(p);
      const r = Math.max(0.75 * schaal, 10 * dpr) + 7 * dpr;
      ctx.save();
      ctx.shadowColor = 'rgba(255, 212, 59, 0.9)';
      ctx.shadowBlur = 10 * dpr;
      ctx.lineWidth = 3.5 * dpr;
      ctx.strokeStyle = '#ffe066';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.5 * dpr;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.arc(x, y, r + 2.5 * dpr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Stapnummers: wit rondje op elke lijn. Een lijn met een melding krijgt daarnaast een geel driehoekje (geen rondje:
    // dat leek op een speler).
    (tk.lijnen ?? []).forEach((l, i) => {
      if (!l.stap) return;
      const [x, y] = px(stapPunt(l, plekBegin(tk)));
      const kleur = '#0f6b3a';
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 3 * dpr;
      ctx.beginPath();
      ctx.arc(x, y, 10 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2.5 * dpr;
      ctx.strokeStyle = kleur;
      ctx.stroke();
      ctx.fillStyle = kleur;
      ctx.font = `700 ${Math.round(12 * dpr)}px Inter Variable, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(l.stap), x, y + 0.5 * dpr);
      ctx.restore();
      if (meldingenRef.current.some((m) => m.lijn === i)) tekenDriehoek(ctx, px(driehoekPunt(l, plekBegin(tk))), dpr);
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
        // Een eind dat aan een speler vastzit, heeft geen handvat (je pakt dan de speler): geen wit rondje over hem heen.
        if (!l.van) handvat(h.begin, 'rond');
        if (!l.naar) handvat(h.eind, 'rond');
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
      ringen.current = [];
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

    // 0. Een geel driehoekje gaat voor alles (ook als er een speler of pion onder ligt): tik = uitleg en oplossing.
    const dh = raakTeken(e.clientX, e.clientY, 'driehoek');
    if (dh >= 0) {
      gebaar.current = { soort: 'melding', lijn: dh, begin: [e.clientX, e.clientY] };
      return;
    }

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
        // Het dichtstbijzijnde handvat (bij een korte lijn liggen ze dicht bij elkaar).
        let beste: { k: 'midden' | 'begin' | 'eind'; d: number } | undefined;
        for (const k of ['midden', 'begin', 'eind'] as const) {
          // Een eind dat aan een speler vastzit: dan pak je de speler (de lijn gaat mee).
          if ((k === 'begin' && l.van) || (k === 'eind' && l.naar)) continue;
          // Met een lijngereedschap teken je vanaf het eind van de vorige lijn een nieuwe; alleen het buigpunt is te pakken.
          if (k !== 'midden' && gereedschap.soort !== 'kies') continue;
          const d = Math.hypot(h[k][0] - p[0], h[k][1] - p[1]);
          if (d < marge && (!beste || d < beste.d)) beste = { k, d };
        }
        if (beste) {
          gesch.begin();
          gebaar.current = { soort: 'handvat', h: beste.k, lijn: sel.index, stand: standBijLijn(tk, sel.index) };
          return;
        }
      }
    }
    // 2. Gereedschap.
    if (gereedschap.soort === 'plaats') {
      gebaar.current = { soort: 'plaats', begin: [e.clientX, e.clientY], p };
      return;
    }
    if (gereedschap.soort === 'lijn') {
      const stand = standVoorStap(tk, volgendeStap(tk));
      gebaar.current = { soort: 'lijn', van: p, scherm: [e.clientX, e.clientY], stand };
      const k = tekenLijn(tk, gereedschap.lijn, p, p, maten(), stand);
      concept.current = k.lijn;
      ringen.current = k.begin.wie ? [k.begin.punt] : [];
      teken();
      return;
    }
    // 3. Kiezen en slepen. Een stapnummer gaat voor (anders pak je de pion of speler die eronder ligt).
    const nr = raakTeken(e.clientX, e.clientY, 'nummer');
    if (nr >= 0) {
      setSelectie({ soort: 'lijn', index: nr });
      gebaar.current = null;
      return;
    }
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
          const h = g.h as 'begin' | 'midden' | 'eind';
          if (g.stand && h !== 'midden') {
            const l = gesch.nu.lijnen?.[g.lijn];
            const m = maten();
            gesch.vervang(sleepLijnVast(gesch.nu, g.lijn, h, p, m, g.stand));
            // Ring om de speler waar dit eind nu aan vastklikt.
            const nieuw = gesch.nu.lijnen?.[g.lijn];
            const vast = l && (h === 'begin' ? !!lijnBegin(l.soort, p, m, g.stand, false).wie : !!lijnEind(gesch.nu, l.soort, p, m, g.stand, l.van).ontvanger || !!nieuw?.naar);
            const pts = nieuw && lijnPunten(nieuw, plekIn(gesch.nu));
            ringen.current = vast && pts ? [h === 'begin' ? pts[0]! : pts[pts.length - 1]!] : [];
          } else gesch.vervang(sleepLijn(gesch.nu, g.lijn, h, p, marge));
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
        const k = tekenLijn(gesch.nu, gereedschap.lijn, g.van, p, maten(), g.stand);
        concept.current = k.lijn;
        const pts = lijnPunten(k.lijn, plekIn(gesch.nu));
        ringen.current = [...(k.begin.wie ? [pts[0]!] : []), ...(k.eind.ontvanger || k.lijn.naar ? [pts[pts.length - 1]!] : [])];
        teken();
        return;
      }
      case 'plaats':
        g.p = p;
        return;
      case 'melding':
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
    ringen.current = [];
    const p = naarVeld(e.clientX, e.clientY);
    switch (g.soort) {
      case 'sleep':
        if (g.bewogen) {
          const o = gesch.nu.objecten.find((x) => x.id === g.id);
          if (o?.soort === 'bal') gesch.vervang(lagBalNeer(gesch.nu, o.id, meter(BAL_PX)));
          gesch.klaar();
        }
        break;
      case 'handvat':
        gesch.klaar();
        break;
      case 'lijn': {
        concept.current = null;
        // Getekend (de vinger is echt verschoven), niet alleen getikt.
        if (gereedschap.soort === 'lijn' && Math.hypot(e.clientX - g.scherm[0], e.clientY - g.scherm[1]) > 14) {
          const k = tekenLijn(gesch.nu, gereedschap.lijn, g.van, p, maten(), g.stand);
          const [a, b] = [k.lijn.punten[0]!, k.lijn.punten[k.lijn.punten.length - 1]!];
          if (Math.hypot(a[0] - b[0], a[1] - b[1]) > meter(14) || k.lijn.naar) {
            gesch.zet(voegLijnToe(gesch.nu, { ...k.lijn, stap: volgendeStap(gesch.nu) }));
            const index = (gesch.nu.lijnen?.length ?? 1) - 1;
            setSelectie({ soort: 'lijn', index });
            // Niet bij een speler begonnen (en geen balbezitter): meteen vragen bij wie hij hoort.
            if (!k.begin.wie) setKoppelVraag(index);
          }
        }
        break;
      }
      case 'melding':
        if (Math.hypot(e.clientX - g.begin[0], e.clientY - g.begin[1]) < 12) openMelding(g.lijn);
        break;
      case 'plaats':
        if (Math.hypot(e.clientX - g.begin[0], e.clientY - g.begin[1]) < 10 && gereedschap.soort === 'plaats') {
          const o = gereedschap.item.maak(gesch.nu, p);
          gesch.zet(voegToe(gesch.nu, o, meter(BAL_PX)));
          setSelectie({ soort: 'object', id: o.id });
        }
        break;
    }
    ververs();
  };

  /** Tik op een geel driehoekje of de waarschuwing: niet vast → kies een speler; anders de opties met de uitleg. */
  const openMelding = (i: number) => {
    setSelectie({ soort: 'lijn', index: i });
    if (lijnMeldingen(gesch.nu).some((m) => m.lijn === i && m.los)) setKoppelVraag(i);
    else setOpties(true);
  };

  /** Een oplossing uit een melding uitvoeren (één tik). */
  const voerUit = (i: number, o: Oplossing) => {
    switch (o.soort) {
      case 'kies-speler':
        setSelectie({ soort: 'lijn', index: i });
        setOpties(false);
        setKoppelVraag(i);
        return;
      case 'wordt-loop':
        zet(wordtLoop(gesch.nu, i));
        return;
      case 'na-stap':
        zet(naarStap(gesch.nu, i, o.stap));
        return;
      case 'geef-bal':
        zet(geefBal(gesch.nu, o.wie, o.bal));
        return;
      case 'toon':
        setOpties(false);
        setDrieD(false);
        openMelding(o.lijn);
        return;
    }
  };

  const opAnnuleer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    vingers.current.delete(e.pointerId);
    if (gebaar.current?.soort === 'sleep' || gebaar.current?.soort === 'handvat') gesch.annuleer();
    gebaar.current = null;
    concept.current = null;
    ringen.current = [];
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
      driehoekPunt: (i: number) => {
        const l = gesch.nu.lijnen?.[i];
        return l ? driehoekPunt(l, plekBegin(gesch.nu)) : null;
      },
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
    ga(bron.verder.naar);
  };
  const lijnenWissen = () => {
    if (!t.lijnen?.length) return;
    zet({ ...gesch.nu, lijnen: [] });
    setSelectie(null);
  };

  const kiesGereedschap = (g: Gereedschap) => {
    setGereedschap(g);
    if (g.soort !== 'kies') setSelectie(null);
  };

  const naam = bron.naam();
  const plaatsNaam = gereedschap.soort === 'plaats' ? gereedschap.item.naam : gereedschap.soort === 'lijn' ? LIJN_NAMEN[gereedschap.lijn].lijn : '';

  return (
    <div className="editor">
      <header className="editor-kop">
        <button
          className="kop-terug"
          aria-label={vt('Terug')}
          onClick={() => {
            opslaan();
            terug(bron.ouder);
          }}
        >
          <Icoon naam="terug" maat={26} />
        </button>
        <h1 className="editor-titel">{naam}</h1>
        <button className="editor-knop" onClick={ongedaan} disabled={!gesch.kanTerug} aria-label={vt('Ongedaan maken')} title={vt('Ongedaan maken')}>
          <Icoon naam="ongedaan" />
        </button>
        <button className="editor-knop" onClick={herdoen} disabled={!gesch.kanVooruit} aria-label={vt('Opnieuw')} title={vt('Opnieuw')}>
          <Icoon naam="herdoen" />
        </button>
        <button className="editor-knop editor-afspelen" onClick={() => setDrieD(true)} aria-label={vt('Afspelen')} title={vt('Afspelen (2D en 3D)')}>
          <Icoon naam="afspelen" />
        </button>
        {bron.wissen && (
          <button className="editor-knop" onClick={lijnenWissen} disabled={!t.lijnen?.length} aria-label={vt('Lijnen wissen')} title={vt('Alle lijnen wissen')}>
            <Icoon naam="gum" />
          </button>
        )}
        <button className="knop knop-primair editor-gegevens" onClick={naarGegevens}>
          {bron.verder.label}
          <Icoon naam="verder" maat={18} />
        </button>
      </header>

      <div className="editor-vak" ref={vakRef}>
        <canvas
          ref={canvasRef}
          className="editor-canvas"
          role="application"
          aria-label={vt('Tekenveld: tik om te kiezen, sleep om te verplaatsen, twee vingers om te zoomen')}
          onPointerDown={opNeer}
          onPointerMove={opBeweeg}
          onPointerUp={opOp}
          onPointerCancel={opAnnuleer}
          onContextMenu={(e) => e.preventDefault()}
        />
        {beginMelding ? (
          <button className="editor-melding editor-melding-knop" onClick={() => setBeginMelding(undefined)}>
            {beginMelding} <span className="editor-melding-weg">{vt('OK')}</span>
          </button>
        ) : (
          animatie && <div className="editor-melding">{vt('Met animatie. Verschuif je iets, dan wordt het een tekening zonder animatie.')}</div>
        )}
        {hint && !animatie && t.objecten.length === 0 && <div className="editor-melding">{vt('Kies onderin wat je wilt toevoegen en tik op het veld. Twee vingers (of het muiswiel): zoomen.')}</div>}
        <div className="editor-onder">
          {meldingen.length > 0 && <Waarschuwing meldingen={meldingen} tekening={t} open={openMelding} voerUit={voerUit} />}
          {plaatsNaam && (
            <div className="editor-plaats" role="status">
              <span>
                <strong>{plaatsNaam}</strong> – {gereedschap.soort === 'lijn' ? vt('Begin bij een speler en sleep naar waar hij heen gaat.') : vt('tik op het veld')}
              </span>
              <button className="icoon-knop" aria-label={vt('Klaar met plaatsen')} onClick={() => kiesGereedschap({ soort: 'kies' })}>
                <Icoon naam="kruis" maat={18} />
              </button>
            </div>
          )}
        </div>
        <button className="editor-heel" onClick={heelVeld} aria-label={vt('Heel veld in beeld')} title={vt('Heel veld in beeld')}>
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
                    aria-label={vt('Lager nummer')}
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
                  <output aria-label={vt('Nummer')}>{gekozen.nummer}</output>
                  <button
                    aria-label={vt('Hoger nummer')}
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
              {bron.namen && (gekozen.soort === 'speler' || gekozen.soort === 'keeper') && (
                <input
                  className="editor-tekst"
                  value={gekozen.naam ?? ''}
                  maxLength={20}
                  placeholder={vt('Naam')}
                  aria-label={vt('Naam van de speler')}
                  onChange={(e) => {
                    const naam = e.target.value;
                    const nieuw = zetObject(t, gekozen.id, { naam: naam || undefined });
                    // Een naam invullen zet het tonen van namen aan.
                    zet(naam ? { ...nieuw, namen: true } : nieuw);
                  }}
                />
              )}
              {gekozen.soort === 'tekst' && (
                <input className="editor-tekst" value={gekozen.tekst ?? ''} maxLength={30} aria-label={vt('Tekst')} onChange={(e) => zet(zetObject(t, gekozen.id, { tekst: e.target.value }))} />
              )}
              {gekozen.soort === 'zone' && (
                <span className="editor-kleuren" role="group" aria-label={vt('Kleur')}>
                  {[undefined, ...ZONE_KLEUREN].map((k) => (
                    <button
                      key={k ?? 'geen'}
                      className={`kleur${gekozen.kleur === k ? ' aan' : ''}`}
                      style={{ background: k ?? 'transparent' }}
                      aria-label={k ? vt('Kleur {k}', { k }) : vt('Geen kleur')}
                      onClick={() => metToestemming(() => zet(zetObject(gesch.nu, gekozen.id, { kleur: k })))}
                    />
                  ))}
                </span>
              )}
              {draaiBaar(gekozen) && (
                <button
                  className="icoon-knop"
                  aria-label={vt('Draai 45 graden')}
                  title={vt('Draai 45°')}
                  onClick={() => metToestemming(() => zet(draai(gesch.nu, gekozen.id, ((isPersoon(gekozen) ? (gekozen.kijkrichting ?? -90) : (gekozen.hoek ?? 0)) as number) + 45)))}
                >
                  <Icoon naam="draai" maat={20} />
                </button>
              )}
              <button
                className="icoon-knop"
                aria-label={vt('Kopiëren')}
                title={vt('Kopiëren')}
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
              <span className="editor-nummer editor-stap" aria-label={vt('Stapnummer')}>
                <span className="editor-stap-label">{vt('Stap')}</span>
                <button
                  aria-label={vt('Lager stapnummer')}
                  disabled={(gekozenLijn.stap ?? 1) <= 1}
                  onClick={() => zet(zetLijn(t, sel.index, { ...gekozenLijn, stap: Math.max(1, (gekozenLijn.stap ?? 1) - 1) }))}
                >
                  <Icoon naam="min" maat={16} />
                </button>
                <output aria-label={vt('Stap')}>{gekozenLijn.stap ?? '–'}</output>
                <button aria-label={vt('Hoger stapnummer')} onClick={() => zet(zetLijn(t, sel.index, { ...gekozenLijn, stap: Math.min(30, (gekozenLijn.stap ?? 0) + 1) }))}>
                  <Icoon naam="plus" maat={16} />
                </button>
              </span>
              <span className="editor-lijnsoorten" role="group" aria-label={vt('Soort lijn')}>
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
                {meldingen.some((m) => m.lijn === sel.index) ? vt('! Opties') : vt('Opties')}
              </button>
            </>
          )}
          <button className="icoon-knop gevaar" aria-label={vt('Verwijderen')} title={vt('Verwijderen')} onClick={weg}>
            <Icoon naam="prullenbak" maat={20} />
          </button>
        </div>
      )}

      <nav className="editor-balk" aria-label={vt('Gereedschap')}>
        <button className={gereedschap.soort === 'kies' ? 'aan' : ''} aria-pressed={gereedschap.soort === 'kies'} onClick={() => kiesGereedschap({ soort: 'kies' })}>
          <Icoon naam="wijzer" />
          <span>{vt('Kiezen')}</span>
        </button>
        <button className={gereedschap.soort === 'plaats' ? 'aan' : ''} aria-pressed={gereedschap.soort === 'plaats'} onClick={() => setPaletOpen(true)}>
          <Icoon naam="plus" />
          <span>{vt('Toevoegen')}</span>
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
          <div className="paneel" role="dialog" aria-label={vt('Toevoegen')} onClick={(e) => e.stopPropagation()}>
            <div className="paneel-kop">
              <h2>{vt('Toevoegen')}</h2>
              <button className="icoon-knop" aria-label={vt('Sluiten')} onClick={() => setPaletOpen(false)}>
                <Icoon naam="kruis" />
              </button>
            </div>
            {GROEPEN.map((g) => (
              <section key={g} className="palet-groep">
                <h3>{GROEP_NAAM[g]}</h3>
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
          <div className="paneel paneel-groot" role="dialog" aria-label={vt('Afspelen')}>
            <div className="paneel-kop">
              <h2>{heeftLijnAnimatie(t) || animatie ? vt('Afspelen') : vt('Bekijken')}</h2>
              <button className="icoon-knop" aria-label={vt('Sluiten')} onClick={() => setDrieD(false)}>
                <Icoon naam="kruis" />
              </button>
            </div>
            <AnimatieSpeler tekening={speelTekening} />
            {!heeftLijnAnimatie(t) && !animatie && (
              <p className="editor-uitleg">{vt('Nog geen animatie: teken lijnen (pass, lopen, dribbel). Elke lijn krijgt een stapnummer; zo speelt de oefening af.')}</p>
            )}
            {heeftLijnAnimatie(t) && (
              <label className="editor-schakel">
                <input type="checkbox" checked={!!t.herhaalRij} onChange={() => zet({ ...t, herhaalRij: !t.herhaalRij })} />
                <span>
                  <strong>{vt('Herhaal voor de volgende spelers in de rij')}</strong>
                  <span className="klein">{vt('Zet de andere spelers vlak achter de eerste speler (zonder eigen lijnen). Iedereen doet het patroon na elkaar en sluit daarna achteraan aan.')}</span>
                </span>
              </label>
            )}
            {meldingen.length > 0 && (
              <ul className="editor-meldingen">
                {meldingen.map((m, i) => (
                  <li key={i} className={m.soort === 'fout' ? 'fout' : ''}>
                    {m.lijn >= 0 ? (
                      <strong>
                        {vt('Stap')} {t.lijnen?.[m.lijn]?.stap ?? '?'}:{' '}
                      </strong>
                    ) : null}
                    {m.los ? vt('Deze lijn zit niet vast aan een speler.') : m.tekst}
                    <OplossingKnoppen melding={m} voerUit={voerUit} />
                  </li>
                ))}
              </ul>
            )}
            <button className="knop knop-primair knop-breed" onClick={() => setDrieD(false)}>
              <Icoon naam="potlood" maat={18} />
              {vt('Terug naar tekenen')}
            </button>
          </div>
        </div>
      )}

      {opties && gekozenLijn && sel?.soort === 'lijn' && (
        <div className="paneel-achter" onClick={() => setOpties(false)}>
          <div className="paneel" role="dialog" aria-label={vt('Opties van de lijn')} onClick={(e) => e.stopPropagation()}>
            <div className="paneel-kop">
              <h2>
                {gekozenLijn.soort === 'bal' ? (isSchotLijn(t, gekozenLijn) ? vt('Schot') : vt('Pass')) : gekozenLijn.soort === 'loop' ? vt('Looplijn') : vt('Dribbel')}{' '}
                {vt('– stap {n}', { n: gekozenLijn.stap ?? '–' })}
              </h2>
              <button className="icoon-knop" aria-label={vt('Sluiten')} onClick={() => setOpties(false)}>
                <Icoon naam="kruis" />
              </button>
            </div>
            {meldingen.filter((m) => m.lijn === sel.index).length > 0 && (
              <ul className="editor-meldingen">
                {meldingen
                  .filter((m) => m.lijn === sel.index)
                  .map((m, i) => (
                    <li key={i} className={m.soort === 'fout' ? 'fout' : ''}>
                      {m.soort === 'fout' ? vt('Doet niet mee: ') : vt('Let op: ')}
                      {m.los ? vt('Deze lijn zit niet vast aan een speler.') : m.tekst}
                      <OplossingKnoppen melding={m} voerUit={voerUit} />
                    </li>
                  ))}
              </ul>
            )}
            {gekozenLijn.soort === 'loop' && (
              <section className="optie-groep">
                <h3>{vt('Loopwijze')}</h3>
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
                <p className="klein">{vt('Over een ladder, horde of ring loopt hij vanzelf met voetenwerk of sprongen.')}</p>
              </section>
            )}
            {gekozenLijn.soort === 'bal' && (
              <section className="optie-groep">
                <h3>{vt('Hoogte van de bal')}</h3>
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
                <h3>{vt('Doelnet')}</h3>
                <p className="melding-goed doelnet-uitkomst" role="status">
                  {doelnetUitkomst(t, gekozenLijn) === 'gat' ? vt('Raak: de bal gaat door het gat het goal in.') : vt('De bal raakt het net en kaatst terug.')}
                </p>
                <p className="klein">{vt('Mik in een hoek: laag of over de grond voor de onderste gaten, hoog voor de bovenste. Daartussen kaatst de bal terug.')}</p>
              </section>
            )}
            {isSchotLijn(t, gekozenLijn) && !doelnetUitkomst(t, gekozenLijn) && (
              <section className="optie-groep">
                <h3>{vt('Afloop van het schot')}</h3>
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
                {!heeftKeeperBijGoal(t) && <p className="klein">{vt('Zet een keeper in het goal: die kiest dan vanzelf positie en vangt of duikt.')}</p>}
              </section>
            )}
            <section className="optie-groep">
              <h3>{vt('Wachten vóór deze stap')}</h3>
              <div className="chips">
                {WACHTTIJDEN.map((w) => (
                  <button key={w} className={(gekozenLijn.wacht ?? 0) === w ? 'aan' : ''} onClick={() => zet(zetLijn(t, sel.index, { ...gekozenLijn, wacht: w || undefined }))}>
                    {w ? `${komma(w)} s` : vt('Niet')}
                  </button>
                ))}
              </div>
            </section>
            <section className="optie-groep">
              <label className="editor-schakel">
                <input type="checkbox" checked={!!t.herhaalRij} onChange={() => zet({ ...t, herhaalRij: !t.herhaalRij })} />
                <span>
                  <strong>{vt('Herhaal voor de volgende spelers in de rij')}</strong>
                  <span className="klein">{vt('Geldt voor de hele oefening.')}</span>
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
                  {vt('Recht maken')}
                </button>
              ) : (
                <span />
              )}
              <button className="knop knop-primair" onClick={() => setOpties(false)}>
                {vt('Klaar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {koppelVraag !== null && t.lijnen?.[koppelVraag] && (
        <KoppelMenu
          tekening={t}
          lijn={koppelVraag}
          kleuren={kleuren}
          kies={(id) => {
            zet(koppelAan(gesch.nu, koppelVraag, id));
            setSelectie({ soort: 'lijn', index: koppelVraag });
            setKoppelVraag(null);
          }}
          weg={() => {
            zet(verwijderLijn(gesch.nu, koppelVraag));
            setSelectie(null);
            setKoppelVraag(null);
          }}
          sluit={() => setKoppelVraag(null)}
        />
      )}

      {vraag && (
        <div className="paneel-achter">
          <div className="paneel paneel-vraag" role="alertdialog" aria-label={vt('Animatie laten vervallen?')}>
            <h2>{vt('Animatie laten vervallen?')}</h2>
            <p>{vt('Deze oefening is een kopie met animatie. Als je iets verschuift, draait of weghaalt, wordt het een tekening zonder animatie. Iedereen blijft op zijn beginplek staan.')}</p>
            <div className="knoppenrij">
              <button
                className="knop knop-primair"
                onClick={() => {
                  vraag();
                  setVraag(null);
                }}
              >
                {vt('Ja, aanpassen')}
              </button>
              <button className="knop" onClick={() => setVraag(null)}>
                {vt('Annuleren')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Tekst op de knop van een oplossing. */
function oplossingLabel(o: Oplossing): string {
  switch (o.soort) {
    case 'kies-speler':
      return vt('Kies een speler');
    case 'wordt-loop':
      return vt('Maak er een looplijn van');
    case 'na-stap':
      return vt('Zet in stap {n}', { n: o.stap });
    case 'geef-bal':
      return o.bal ? vt('Leg de bal bij {w}', { w: o.naam }) : vt('Geef {w} een bal', { w: o.naam });
    case 'toon':
      return vt('Naar stap {n}', { n: o.stap });
  }
}

/** Knoppen die een melding oplossen; `max` = alleen de eerste (onderin, zodat de balk klein blijft). */
function OplossingKnoppen({ melding, voerUit, max }: { melding: LijnMelding; voerUit: (lijn: number, o: Oplossing) => void; max?: number }) {
  if (!melding.oplossingen?.length || melding.lijn < 0) return null;
  return (
    <span className="editor-oplossingen">
      {melding.oplossingen.slice(0, max).map((o) => (
        <button key={o.soort} className="knop editor-oplossing" onClick={() => voerUit(melding.lijn, o)}>
          {oplossingLabel(o)}
        </button>
      ))}
    </span>
  );
}

/** Geel driehoekje met uitroepteken (zoals op het veld). */
const Driehoek = () => (
  <svg className="editor-driehoek" width="22" height="20" viewBox="0 0 22 20" aria-hidden="true">
    <path d="M11 1.6 L20.4 18.4 H1.6 Z" fill={DRIEHOEK_GEEL} stroke={DRIEHOEK_RAND} strokeWidth="1.8" strokeLinejoin="round" />
    <rect x="10" y="6.6" width="2" height="6.4" rx="1" fill={DRIEHOEK_RAND} />
    <circle cx="11" cy="15.4" r="1.25" fill={DRIEHOEK_RAND} />
  </svg>
);

/**
 * Waarschuwing onderin: de echte reden in gewone taal, met een knop die het oplost. Lijnen die niet aan een speler
 * vastzitten gaan voor (tik = kies een speler).
 */
function Waarschuwing({ meldingen, tekening, open, voerUit }: { meldingen: LijnMelding[]; tekening: Tekening; open: (lijn: number) => void; voerUit: (lijn: number, o: Oplossing) => void }) {
  const los = meldingen.filter((m) => m.los);
  const klasse = 'editor-waarschuwing';
  if (los.length) {
    return (
      <button className={`${klasse} editor-waarschuwing-knop`} onClick={() => open(los[0]!.lijn)}>
        <Driehoek />
        <span>
          {los.length === 1
            ? vt('Deze lijn zit niet vast aan een speler. Tik om een speler te kiezen.')
            : vt('{n} lijnen zitten niet vast aan een speler. Tik om een speler te kiezen.', { n: los.length })}
        </span>
      </button>
    );
  }
  const m = meldingen.find((x) => x.soort === 'fout') ?? meldingen[0]!;
  const stap = m.lijn >= 0 ? tekening.lijnen?.[m.lijn]?.stap : undefined;
  const lijnen = new Set(meldingen.map((x) => x.lijn)).size;
  return (
    <div className={klasse} role="status">
      <Driehoek />
      <span className="editor-waarschuwing-tekst">
        {m.lijn >= 0 ? (
          <button className="editor-waarschuwing-uitleg" onClick={() => open(m.lijn)}>
            <strong>{m.soort === 'fout' ? vt('Stap {n}:', { n: stap ?? '?' }) : vt('Let op bij stap {n}:', { n: stap ?? '?' })}</strong> {m.tekst}
          </button>
        ) : (
          m.tekst
        )}
        {lijnen > 1 && <span className="editor-waarschuwing-meer"> {vt('(en nog {n})', { n: lijnen - 1 })}</span>}
      </span>
      <OplossingKnoppen melding={m} voerUit={voerUit} max={1} />
    </div>
  );
}

/** Kleur van het poppetje in het keuzemenu (zoals op het veld). */
function popKleur(o: VeldObject, k: ReturnType<typeof leesKleuren>): string {
  if (o.soort === 'keeper') return k.keeper;
  if (o.soort === 'trainer') return k.trainer;
  return o.team === 'B' ? k.teamB : o.team === 'J' ? k.joker : k.teamA;
}

/** "Bij welke speler hoort deze lijn?": de spelers in de buurt van het begin van de lijn om op te tikken. */
function KoppelMenu({
  tekening,
  lijn,
  kleuren,
  kies,
  weg,
  sluit,
}: {
  tekening: Tekening;
  lijn: number;
  kleuren: ReturnType<typeof leesKleuren>;
  kies: (id: string) => void;
  weg: () => void;
  sluit: () => void;
}) {
  const lijst = useMemo(() => kandidaten(tekening, lijn), [tekening, lijn]);
  return (
    <div className="paneel-achter koppel-achter" onClick={sluit}>
      <div className="paneel koppel-menu" role="dialog" aria-label={vt('Bij welke speler hoort deze lijn?')} onClick={(e) => e.stopPropagation()}>
        <div className="paneel-kop">
          <h2>{vt('Bij welke speler hoort deze lijn?')}</h2>
          <button className="icoon-knop" aria-label={vt('Sluiten')} onClick={sluit}>
            <Icoon naam="kruis" />
          </button>
        </div>
        {lijst.length ? (
          <div className="koppel-lijst">
            {lijst.map((k) => {
              const o = tekening.objecten.find((x) => x.id === k.id)!;
              return (
                <button key={k.id} className="koppel-keuze" onClick={() => kies(k.id)}>
                  <span className="koppel-pop" style={{ background: popKleur(o, kleuren), color: kleuren.rugnummer }}>
                    {o.nummer ?? ''}
                  </span>
                  <span className="koppel-naam">
                    {k.naam}
                    {k.metBal && <span className="koppel-bal">{vt('heeft de bal')}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="klein">{vt('Er staan nog geen spelers op het veld. Zet eerst spelers neer via Toevoegen.')}</p>
        )}
        <div className="knoppenrij">
          <button className="knop" onClick={weg}>
            {vt('Lijn weghalen')}
          </button>
          <button className="knop" onClick={sluit}>
            {vt('Later')}
          </button>
        </div>
      </div>
    </div>
  );
}
