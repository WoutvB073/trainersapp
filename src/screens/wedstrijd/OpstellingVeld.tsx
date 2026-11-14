import { useRef, useState } from 'react';
import { spelvorm, naarBank, verplaatsPlek, zetOpPlek, haalWeg, type Opstelling } from '../../wedstrijd/wedstrijd';
import { Icoon } from '../../components/Icoon';
import { t } from '../../i18n/t';

/** Veld in de verhouding van de spelvorm, met lijnen die meeschalen (een klein veld heeft een kleiner strafschopgebied). */
function VeldLijnen({ B, L }: { B: number; L: number }) {
  const m = 2;
  const zestienB = Math.min(40.32, B * 0.6);
  const zestienL = Math.min(16.5, L * 0.16);
  const doelgebiedB = Math.min(18.32, B * 0.27);
  const doelgebiedL = Math.min(5.5, L * 0.055);
  const stip = Math.min(11, L * 0.105);
  const cirkel = Math.min(9.15, B * 0.13);
  const goal = Math.min(7.32, B * 0.18);
  const lijn = { fill: 'none', stroke: '#fff', strokeWidth: Math.max(0.12, B / 300), opacity: 0.9 };
  const helft = (boven: boolean) => {
    const y = (v: number, h = 0) => (boven ? v : L - v - h);
    return (
      <g>
        <rect x={(B - zestienB) / 2} y={y(0, zestienL)} width={zestienB} height={zestienL} {...lijn} />
        <rect x={(B - doelgebiedB) / 2} y={y(0, doelgebiedL)} width={doelgebiedB} height={doelgebiedL} {...lijn} />
        <circle cx={B / 2} cy={boven ? stip : L - stip} r={Math.max(0.2, B / 200)} fill="#fff" />
        <rect x={(B - goal) / 2} y={boven ? -1.4 : L} width={goal} height={1.4} fill="rgba(255,255,255,0.35)" stroke="#fff" strokeWidth={lijn.strokeWidth} />
      </g>
    );
  };
  const strepen = Math.round(L / 7);
  return (
    <svg className="opst-lijnen" viewBox={`${-m} ${-m} ${B + 2 * m} ${L + 2 * m}`} preserveAspectRatio="none" aria-hidden="true">
      <rect x={-m} y={-m} width={B + 2 * m} height={L + 2 * m} fill="var(--gras-1)" />
      {Array.from({ length: strepen }, (_, i) => (i % 2 ? <rect key={i} x={-m} y={(L / strepen) * i} width={B + 2 * m} height={L / strepen} fill="var(--gras-2)" /> : null))}
      <rect x={0} y={0} width={B} height={L} {...lijn} />
      <line x1={0} y1={L / 2} x2={B} y2={L / 2} {...lijn} />
      <circle cx={B / 2} cy={L / 2} r={cirkel} {...lijn} />
      {helft(true)}
      {helft(false)}
    </svg>
  );
}

type Bron = { plek?: string; naam?: string };

/** Waar een versleepte speler terechtkomt als je nu loslaat. */
type Doel = { soort: 'vrij'; x: number; y: number } | { soort: 'plek'; id: string } | { soort: 'bank' } | null;

/** Het ankerpunt van een positie ligt 22 px onder de bovenkant van de knop (zie `.opst-plek` in wedstrijd.css): het midden van het rondje. */
const ANKER = 22;
/** Zo dichtbij (px) klikt een versleepte speler vast op een andere positie (ruilen). Het rondje is 36 px. */
const VANG = 30;
const GRENS = [0.03, 0.97] as const;

/**
 * Opstelling op het veld met de bank eronder (of ernaast). Slepen met de vinger of muis: speler van de bank op een
 * positie, twee spelers ruilen, speler naar de bank, of een positie zelf verplaatsen. Tikken kan ook: tik een speler en
 * dan een positie (of de bank).
 *
 * Sinds 0.35.0 schuift de speler zelf mee (met het punt waar je hem vastpakte) en is wat je ziet precies waar hij landt:
 * los op het veld blijft hij daar staan; komt hij vlak bij een andere positie, dan klikt hij daar zichtbaar op vast (ruilen)
 * en licht die positie op vóór je loslaat. Een wissel klikt altijd vast op de dichtstbijzijnde positie.
 */
export function OpstellingVeld({ o, opWijzig }: { o: Opstelling; opWijzig?: (o: Opstelling) => void }) {
  const info = spelvorm(o.spelvorm);
  const { breedte: B, lengte: L } = info.veld;
  const m = 2;
  const veldRef = useRef<HTMLDivElement>(null);
  const bankRef = useRef<HTMLDivElement>(null);
  const sleep = useRef<{ bron: Bron; x0: number; y0: number; dx: number; dy: number; bezig: boolean; doel: Doel } | null>(null);
  const [geest, setGeest] = useState<{ x: number; y: number; bron: Bron; doel: Doel } | null>(null);
  const [keuze, setKeuze] = useState<Bron | null>(null);
  const bewerkbaar = !!opWijzig;
  const zet = (nieuw: Opstelling) => {
    setKeuze(null);
    if (nieuw !== o) opWijzig?.(nieuw);
  };

  /** Schermpunt → plek op het veld (0–1). Het veld heeft een rand van m meter rondom. */
  const naarVeld = (r: DOMRect, x: number, y: number): [number, number] => [(((x - r.left) / r.width) * (B + 2 * m) - m) / B, (((y - r.top) / r.height) * (L + 2 * m) - m) / L];
  /** Plek op het veld (0–1) → schermpunt. */
  const naarScherm = (r: DOMRect, fx: number, fy: number): [number, number] => [r.left + ((m + fx * B) / (B + 2 * m)) * r.width, r.top + ((m + fy * L) / (L + 2 * m)) * r.height];

  /**
   * Waar komt de speler als je nu loslaat, en waar teken je hem dus? (x, y) is het ankerpunt van de meeschuivende speler. Dezelfde
   * uitkomst wordt getekend én bij het loslaten gebruikt: wat je ziet is wat er gebeurt.
   */
  const bepaal = (bron: Bron, x: number, y: number, px: number, py: number): { doel: Doel; x: number; y: number } => {
    const r = veldRef.current?.getBoundingClientRect();
    const b = bankRef.current?.getBoundingClientRect();
    const binnen = (q: DOMRect | undefined, a: number, c: number) => !!q && a >= q.left && a <= q.right && c >= q.top && c <= q.bottom;
    // Naar de bank: alleen een speler die op een positie staat.
    if (bron.plek && bron.naam && binnen(b, px, py)) return { doel: { soort: 'bank' }, x, y };
    if (!r || !(binnen(r, x, y) || binnen(r, px, py))) return { doel: null, x, y };
    // Dichtstbijzijnde andere positie.
    let beste: { id: string; d: number; sx: number; sy: number } | null = null;
    for (const p of o.plekken) {
      if (p.id === bron.plek) continue;
      const [sx, sy] = naarScherm(r, p.x, p.y);
      const d = Math.hypot(sx - x, sy - y);
      if (!beste || d < beste.d) beste = { id: p.id, d, sx, sy };
    }
    // Een wissel klikt altijd vast op de dichtstbijzijnde positie; een speler op het veld alleen als hij er vlakbij komt.
    if (bron.naam && beste && (!bron.plek || beste.d <= VANG)) return { doel: { soort: 'plek', id: beste.id }, x: beste.sx, y: beste.sy };
    if (!bron.plek) return { doel: null, x, y };
    // Vrij neerzetten, binnen het veld.
    const [fx, fy] = naarVeld(r, x, y);
    const kx = Math.max(GRENS[0], Math.min(GRENS[1], fx));
    const ky = Math.max(GRENS[0], Math.min(GRENS[1], fy));
    const [sx, sy] = naarScherm(r, kx, ky);
    return { doel: { soort: 'vrij', x: kx, y: ky }, x: sx, y: sy };
  };

  const laat = (bron: Bron, doel: Doel) => {
    if (doel?.soort === 'plek' && bron.naam) return zet(zetOpPlek(o, bron.naam, doel.id));
    if (doel?.soort === 'bank' && bron.plek) return zet(naarBank(o, bron.plek));
    if (doel?.soort === 'vrij' && bron.plek) return zet(verplaatsPlek(o, bron.plek, doel.x, doel.y));
    setKeuze(null);
  };

  const tik = (bron: Bron) => {
    if (!keuze) return setKeuze(bron);
    if (keuze.plek && keuze.plek === bron.plek) return setKeuze(null);
    if (keuze.naam && bron.plek) return zet(zetOpPlek(o, keuze.naam, bron.plek));
    if (keuze.plek && bron.naam && !bron.plek) return zet(zetOpPlek(o, bron.naam, keuze.plek));
    setKeuze(bron);
  };

  const neer = (bron: Bron) => (e: React.PointerEvent) => {
    if (!bewerkbaar || e.button > 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture?.(e.pointerId);
    // Het ankerpunt van wat je vastpakt: bij een positie het midden van het rondje, bij een wissel het midden van het naamlabel.
    const r = el.getBoundingClientRect();
    const ax = r.left + r.width / 2;
    const ay = bron.plek ? r.top + ANKER : r.top + r.height / 2;
    sleep.current = { bron, x0: e.clientX, y0: e.clientY, dx: e.clientX - ax, dy: e.clientY - ay, bezig: false, doel: null };
  };
  const beweeg = (e: React.PointerEvent) => {
    const s = sleep.current;
    if (!s) return;
    if (!s.bezig && Math.hypot(e.clientX - s.x0, e.clientY - s.y0) > 6) s.bezig = true;
    if (s.bezig) {
      const uit = bepaal(s.bron, e.clientX - s.dx, e.clientY - s.dy, e.clientX, e.clientY);
      s.doel = uit.doel;
      setGeest({ x: uit.x, y: uit.y, bron: s.bron, doel: uit.doel });
    }
  };
  const op = (e: React.PointerEvent) => {
    const s = sleep.current;
    sleep.current = null;
    setGeest(null);
    if (!s) return;
    if (s.bezig) laat(s.bron, bepaal(s.bron, e.clientX - s.dx, e.clientY - s.dy, e.clientX, e.clientY).doel);
    else tik(s.bron);
  };
  const annuleer = () => {
    sleep.current = null;
    setGeest(null);
  };
  const handlers = (bron: Bron) =>
    bewerkbaar
      ? {
          onPointerDown: neer(bron),
          onPointerMove: beweeg,
          onPointerUp: op,
          onPointerCancel: annuleer,
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              tik(bron);
            }
          },
        }
      : {};
  const gekozen = (b: Bron) => !!keuze && keuze.plek === b.plek && keuze.naam === b.naam;
  const doelPlek = geest?.doel?.soort === 'plek' ? geest.doel.id : undefined;
  const naarDeBank = geest?.doel?.soort === 'bank';
  const versleept = geest ? o.plekken.find((p) => p.id === geest.bron.plek) : undefined;
  const doelVan = doelPlek ? o.plekken.find((p) => p.id === doelPlek) : undefined;
  /** Wat er gebeurt als je nu loslaat (staat boven de meeschuivende speler). */
  const uitleg = !geest
    ? ''
    : naarDeBank
      ? t('Naar de wissels')
      : doelVan?.naam
        ? geest.bron.plek
          ? t('Ruilen met {naam}', { naam: doelVan.naam })
          : t('In plaats van {naam}', { naam: doelVan.naam })
        : doelVan
          ? t('Op positie {nummer}', { nummer: doelVan.nummer })
          : '';

  return (
    <div className={`opstelling${bewerkbaar ? ' bewerkbaar' : ''}${geest ? ' sleept' : ''}`}>
      <div className="opst-veld" ref={veldRef} data-veld style={{ aspectRatio: `${B + 2 * m} / ${L + 2 * m}` }} onClick={() => keuze && !keuze.naam && setKeuze(null)}>
        <VeldLijnen B={B} L={L} />
        {o.plekken.map((p) => {
          const bron = { plek: p.id, naam: p.naam };
          return (
            <button
              key={p.id}
              type="button"
              className={`opst-plek${p.naam ? '' : ' onbezet'}${gekozen(bron) ? ' gekozen' : ''}${info.keeper && p.nummer === 1 ? ' keeper' : ''}${geest?.bron.plek === p.id ? ' versleept' : ''}${doelPlek === p.id ? ' doel' : ''}`}
              data-plek={p.id}
              style={{ left: `${((m + p.x * B) / (B + 2 * m)) * 100}%`, top: `${((m + p.y * L) / (L + 2 * m)) * 100}%` }}
              aria-label={p.naam ? t('{naam} (positie {nummer})', { naam: p.naam, nummer: p.nummer }) : t('Positie {nummer} (leeg)', { nummer: p.nummer })}
              {...handlers(bron)}
            >
              <span className="opst-nr">{p.nummer}</span>
              {p.naam && <span className="opst-naam">{p.naam}</span>}
            </button>
          );
        })}
      </div>
      <div
        className={`opst-bank${(keuze?.plek && keuze.naam) || naarDeBank ? ' doel' : ''}`}
        ref={bankRef}
        data-bank
        onClick={() => keuze?.plek && keuze.naam && zet(naarBank(o, keuze.plek))}
      >
        <p className="opst-bank-kop">
          <Icoon naam="spelers" maat={18} />
          {t('Wissels')} <span className="teller-klein">{o.wissels.length}</span>
        </p>
        {o.wissels.length === 0 ? (
          <p className="klein">{bewerkbaar ? t('Sleep een speler hierheen om hem te wisselen.') : t('Geen wissels.')}</p>
        ) : (
          <div className="opst-wissels">
            {o.wissels.map((n) => (
              <span key={n} className={`opst-wissel${gekozen({ naam: n }) ? ' gekozen' : ''}${geest && !geest.bron.plek && geest.bron.naam === n ? ' versleept' : ''}`}>
                <button type="button" className="opst-wissel-naam" data-naam={n} aria-label={t('{n} (wissel)', { n })} {...handlers({ naam: n })}>
                  {n}
                </button>
                {bewerkbaar && (
                  <button type="button" className="opst-wissel-weg" aria-label={t('{n} uit de opstelling halen', { n })} onClick={(e) => (e.stopPropagation(), zet(haalWeg(o, n)))}>
                    <Icoon naam="kruis" maat={14} />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
      {keuze && (
        <p className="opst-hint" role="status">
          {keuze.naam && !keuze.plek
            ? t('Tik op een positie voor {naam}.', { naam: keuze.naam })
            : keuze.naam
              ? t('Tik op een andere positie om te ruilen, of op de wissels.')
              : t('Tik op een wissel om hem hier neer te zetten.')}
        </p>
      )}
      {geest && (
        <div
          className={`opst-plek opst-geest${geest.doel ? '' : ' kan-niet'}${versleept && !versleept.naam ? ' onbezet' : ''}${info.keeper && versleept?.nummer === 1 ? ' keeper' : ''}`}
          style={{ left: geest.x, top: geest.y }}
          data-doel={geest.doel?.soort ?? 'geen'}
          aria-hidden="true"
        >
          {uitleg && <span className="opst-geest-uitleg">{uitleg}</span>}
          <span className="opst-nr">{versleept ? versleept.nummer : (doelVan?.nummer ?? '')}</span>
          {geest.bron.naam && <span className="opst-naam">{geest.bron.naam}</span>}
        </div>
      )}
    </div>
  );
}
