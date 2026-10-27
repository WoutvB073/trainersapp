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

/**
 * Opstelling op het veld met de bank eronder (of ernaast). Slepen met de vinger of muis: speler van de bank op een
 * positie, twee spelers ruilen, speler naar de bank, of een positie zelf verplaatsen. Tikken kan ook: tik een speler en
 * dan een positie (of de bank).
 */
export function OpstellingVeld({ o, opWijzig }: { o: Opstelling; opWijzig?: (o: Opstelling) => void }) {
  const info = spelvorm(o.spelvorm);
  const { breedte: B, lengte: L } = info.veld;
  const m = 2;
  const veldRef = useRef<HTMLDivElement>(null);
  const sleep = useRef<{ bron: Bron; x0: number; y0: number; bezig: boolean } | null>(null);
  const [geest, setGeest] = useState<{ x: number; y: number; tekst: string } | null>(null);
  const [keuze, setKeuze] = useState<Bron | null>(null);
  const bewerkbaar = !!opWijzig;
  const zet = (nieuw: Opstelling) => {
    setKeuze(null);
    if (nieuw !== o) opWijzig?.(nieuw);
  };

  const plekOpVeld = (x: number, y: number): [number, number] | null => {
    const r = veldRef.current?.getBoundingClientRect();
    if (!r) return null;
    // Het veld heeft een rand van m meter rondom.
    const fx = ((x - r.left) / r.width) * (B + 2 * m) - m;
    const fy = ((y - r.top) / r.height) * (L + 2 * m) - m;
    return [fx / B, fy / L];
  };

  const laat = (bron: Bron, x: number, y: number) => {
    const el = document.elementFromPoint(x, y);
    const plekEl = el?.closest<HTMLElement>('[data-plek]');
    const opBank = !!el?.closest('[data-bank]');
    const opVeld = !!el?.closest('[data-veld]');
    const doel = plekEl?.dataset.plek;
    if (bron.naam && doel && doel !== bron.plek) return zet(zetOpPlek(o, bron.naam, doel));
    if (bron.naam && bron.plek && opBank) return zet(naarBank(o, bron.plek));
    if (bron.plek && opVeld && (!doel || doel === bron.plek)) {
      const p = plekOpVeld(x, y);
      if (p) return zet(verplaatsPlek(o, bron.plek, p[0], p[1]));
    }
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
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    sleep.current = { bron, x0: e.clientX, y0: e.clientY, bezig: false };
  };
  const beweeg = (e: React.PointerEvent) => {
    const s = sleep.current;
    if (!s) return;
    if (!s.bezig && Math.hypot(e.clientX - s.x0, e.clientY - s.y0) > 6) s.bezig = true;
    if (s.bezig) {
      const p = s.bron.plek ? o.plekken.find((x) => x.id === s.bron.plek) : undefined;
      setGeest({ x: e.clientX, y: e.clientY, tekst: s.bron.naam ?? String(p?.nummer ?? '') });
    }
  };
  const op = (e: React.PointerEvent) => {
    const s = sleep.current;
    sleep.current = null;
    setGeest(null);
    if (!s) return;
    if (s.bezig) laat(s.bron, e.clientX, e.clientY);
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

  return (
    <div className={`opstelling${bewerkbaar ? ' bewerkbaar' : ''}`}>
      <div className="opst-veld" ref={veldRef} data-veld style={{ aspectRatio: `${B + 2 * m} / ${L + 2 * m}` }} onClick={() => keuze && !keuze.naam && setKeuze(null)}>
        <VeldLijnen B={B} L={L} />
        {o.plekken.map((p) => {
          const bron = { plek: p.id, naam: p.naam };
          return (
            <button
              key={p.id}
              type="button"
              className={`opst-plek${p.naam ? '' : ' leeg'}${gekozen(bron) ? ' gekozen' : ''}${info.keeper && p.nummer === 1 ? ' keeper' : ''}`}
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
      <div className={`opst-bank${keuze?.plek && keuze.naam ? ' doel' : ''}`} data-bank onClick={() => keuze?.plek && keuze.naam && zet(naarBank(o, keuze.plek))}>
        <p className="opst-bank-kop">
          <Icoon naam="spelers" maat={18} />
          {t('Wissels')} <span className="teller-klein">{o.wissels.length}</span>
        </p>
        {o.wissels.length === 0 ? (
          <p className="klein">{bewerkbaar ? t('Sleep een speler hierheen om hem te wisselen.') : t('Geen wissels.')}</p>
        ) : (
          <div className="opst-wissels">
            {o.wissels.map((n) => (
              <span key={n} className={`opst-wissel${gekozen({ naam: n }) ? ' gekozen' : ''}`}>
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
        <div className="opst-geest" style={{ left: geest.x, top: geest.y }} aria-hidden="true">
          {geest.tekst}
        </div>
      )}
    </div>
  );
}
