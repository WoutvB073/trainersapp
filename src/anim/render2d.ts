import type { LijnSoort, Punt, Team, Tekening, Uitsnede, VeldObject } from '../model/types';
import { HORDE } from '../model/types';
import { PASJES, PASLENGTE, type NetInslag, type ObjectStand, type Stand } from './timeline';

/** Kleuren komen uit CSS-variabelen, zodat clubkleuren (fase 6) ook de animatie kleuren. */
export interface Kleuren {
  gras1: string;
  gras2: string;
  lijn: string;
  teamA: string;
  teamB: string;
  teamC: string;
  joker: string;
  keeper: string;
  keeper2: string;
  keeper3: string;
  trainer: string;
  rugnummer: string;
  spoorBal: string;
  spoorLoop: string;
  spoorDribbel: string;
}

const VAR: Record<keyof Kleuren, string> = {
  gras1: '--gras-1',
  gras2: '--gras-2',
  lijn: '--veldlijn',
  teamA: '--team-a',
  teamB: '--team-b',
  teamC: '--team-c',
  joker: '--joker',
  keeper: '--keeper',
  keeper2: '--keeper-2',
  keeper3: '--keeper-3',
  trainer: '--trainer',
  rugnummer: '--rugnummer',
  spoorBal: '--spoor-bal',
  spoorLoop: '--spoor-loop',
  spoorDribbel: '--spoor-dribbel',
};

export function leesKleuren(el: Element = document.documentElement): Kleuren {
  const stijl = getComputedStyle(el);
  const k = {} as Kleuren;
  for (const [naam, v] of Object.entries(VAR)) k[naam as keyof Kleuren] = stijl.getPropertyValue(v).trim() || '#888';
  return k;
}

export const STANDAARD_MATEN = {
  leeg: { breedte: 30, lengte: 20 },
  half: { breedte: 68, lengte: 52.5 },
  heel: { breedte: 68, lengte: 105 },
} as const;

export function veldMaten(t: Tekening): { breedte: number; lengte: number } {
  const s = STANDAARD_MATEN[t.veld.type];
  return { breedte: t.veld.breedte ?? s.breedte, lengte: t.veld.lengte ?? s.lengte };
}

/** Het stuk veld dat in beeld komt (meters). */
export function uitsnede(t: Tekening): Uitsnede {
  if (t.weergave) return t.weergave;
  const { breedte, lengte } = veldMaten(t);
  const m = t.veld.type === 'leeg' ? 1 : 3;
  return { x: -m, y: -m, breedte: breedte + 2 * m, lengte: lengte + 2 * m };
}

/** Omrekenen meters → pixels. */
interface Beeld {
  ctx: CanvasRenderingContext2D;
  schaal: number;
  ox: number;
  oy: number;
  /** Pixels per CSS-pixel (scherpte). */
  dpr: number;
}

const px = (b: Beeld, p: Punt): Punt => [b.ox + p[0] * b.schaal, b.oy + p[1] * b.schaal];
/** Maat in meters, maar nooit kleiner dan `min` CSS-pixels. */
const maat = (b: Beeld, meter: number, min: number) => Math.max(meter * b.schaal, min * b.dpr);

export interface TekenOpties {
  kleuren: Kleuren;
  dpr: number;
  /** Klein plaatje (lijst): iets kleinere minimummaten. */
  mini?: boolean;
}

export function tekenScene(
  ctx: CanvasRenderingContext2D,
  breedtePx: number,
  hoogtePx: number,
  tekening: Tekening,
  stand: Stand,
  opties: TekenOpties,
): void {
  const u = uitsnede(tekening);
  const schaal = Math.min(breedtePx / u.breedte, hoogtePx / u.lengte);
  const b: Beeld = {
    ctx,
    schaal,
    ox: (breedtePx - u.breedte * schaal) / 2 - u.x * schaal,
    oy: (hoogtePx - u.lengte * schaal) / 2 - u.y * schaal,
    dpr: opties.dpr * (opties.mini ? 0.75 : 1),
  };
  const k = opties.kleuren;

  tekenGras(b, breedtePx, hoogtePx, k);
  tekenLijnen(b, tekening, k);

  const objecten = tekening.objecten;
  const onder: VeldObject['soort'][] = ['zone', 'kooi', 'keepersmat', 'ladder', 'stok', 'horde', 'ring', 'hoedje', 'pion', 'paaltje', 'bank', 'muurtje', 'pop', 'rebounder', 'klein-goal', 'goal', 'net'];
  for (const soort of onder) for (const o of objecten) if (o.soort === soort) tekenMateriaal(b, o, stand.net.find((n) => n.id === o.id));

  for (const l of tekening.lijnen ?? []) tekenPolylijn(b, l.soort, l.punten, k, true);
  for (const s of stand.sporen) {
    if (s.soort === 'loop' && s.manier && PASJES.includes(s.manier)) tekenPasjes(b, s.punten, k, s.klaar, PASLENGTE[s.manier] ?? 0.45);
    else tekenPolylijn(b, s.soort, s.punten, k, s.klaar);
  }

  // Keepernummers alleen als er meer dan één keeper is.
  const meerKeepers = objecten.filter((o) => o.soort === 'keeper').length > 1;
  for (const o of objecten) {
    if (o.soort !== 'speler' && o.soort !== 'keeper' && o.soort !== 'trainer') continue;
    const s = stand.objecten.get(o.id);
    if (s) tekenPersoon(b, o, s, k, meerKeepers);
  }
  // Een bal bij een persoon komt aan de rand van het poppetje te liggen, niet over het rugnummer.
  const personen: Punt[] = [];
  for (const o of objecten) {
    if (o.soort !== 'speler' && o.soort !== 'keeper' && o.soort !== 'trainer') continue;
    const s = stand.objecten.get(o.id);
    if (s && s.houding === 'staan') personen.push(px(b, [s.x, s.y]));
  }
  for (const o of objecten) {
    if (o.soort !== 'bal') continue;
    const s = stand.objecten.get(o.id);
    if (s) tekenBal(b, s, personen, o.variant);
  }
  for (const o of objecten) if (o.soort === 'tekst') tekenTekst(b, o);
}

/** Platte dingen die in 3D gewoon op het gras liggen (geen eigen 3D-vorm). */
export const PLAT: readonly VeldObject['soort'][] = ['zone', 'keepersmat'];

/** Keepersmat met een hoogte vanaf 0,1 m = landingskussen (in 3D een echt kussen). */
export const isKussen = (o: VeldObject) => o.soort === 'keepersmat' && (o.hoogte ?? 0) >= 0.1;

/**
 * Gras, veldlijnen en platte materialen voor de 3D-grasmat (textuur). `gebied` = welk stuk veld (meters)
 * op het canvas komt; het canvas wordt helemaal gevuld.
 */
export function tekenGrasmat(ctx: CanvasRenderingContext2D, breedtePx: number, hoogtePx: number, tekening: Tekening, gebied: Uitsnede, kleuren: Kleuren): void {
  const schaal = breedtePx / gebied.breedte;
  // dpr heel klein: in een textuur gelden de echte maten in meters, geen minimale pixelmaten.
  const b: Beeld = { ctx, schaal, ox: -gebied.x * schaal, oy: -gebied.y * schaal, dpr: 0.01 };
  tekenGras(b, breedtePx, hoogtePx, kleuren);
  tekenLijnen(b, tekening, kleuren);
  for (const soort of PLAT) for (const o of tekening.objecten) if (o.soort === soort && !isKussen(o)) tekenMateriaal(b, o);
}

/** Kleur van een persoon (team, keeper, trainer). */
export function persoonKleur(o: VeldObject, k: Kleuren, team: Team | undefined = o.team): string {
  // Meerdere keepers: elk nummer een eigen tint (1 standaard, 2 donkerder, 3 lichter).
  if (o.soort === 'keeper') return o.nummer === 2 ? k.keeper2 : o.nummer === 3 ? k.keeper3 : k.keeper;
  if (o.soort === 'trainer') return k.trainer;
  return team === 'B' ? k.teamB : team === 'C' ? k.teamC : team === 'J' ? k.joker : k.teamA;
}

/** Kleur met doorzichtigheid (voor een gekleurde zone). Werkt met #rgb, #rrggbb en rgb(…). */
export function doorzichtig(kleur: string, alpha: number): string {
  const h = kleur.trim();
  if (h.startsWith('#')) {
    const v = h.length === 4 ? h.slice(1).split('').map((c) => c + c).join('') : h.slice(1, 7);
    const n = parseInt(v, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  }
  return h;
}

// ---------- veld ----------

function tekenGras(b: Beeld, w: number, h: number, k: Kleuren) {
  const { ctx } = b;
  ctx.fillStyle = k.gras1;
  ctx.fillRect(0, 0, w, h);
  // Maaibanen van 5 m.
  ctx.fillStyle = k.gras2;
  const baan = 5 * b.schaal;
  for (let m = Math.floor(-b.oy / b.schaal / 5) * 5; b.oy + m * b.schaal < h; m += 5) {
    if ((((m / 5) % 2) + 2) % 2 === 0) ctx.fillRect(0, b.oy + m * b.schaal, w, baan);
  }
}

function tekenLijnen(b: Beeld, t: Tekening, k: Kleuren) {
  if (t.veld.type === 'leeg') return;
  const { ctx } = b;
  const { breedte: B, lengte: L } = veldMaten(t);
  ctx.save();
  ctx.strokeStyle = k.lijn;
  ctx.fillStyle = k.lijn;
  ctx.lineWidth = maat(b, 0.12, 1.5);
  ctx.globalAlpha = 0.9;

  const rect = (x: number, y: number, w: number, h: number) => {
    const [a, c] = [px(b, [x, y]), px(b, [x + w, y + h])];
    ctx.strokeRect(a[0], a[1], c[0] - a[0], c[1] - a[1]);
  };
  const boog = (cx: number, cy: number, r: number, van: number, tot: number) => {
    const c = px(b, [cx, cy]);
    ctx.beginPath();
    ctx.arc(c[0], c[1], r * b.schaal, van, tot);
    ctx.stroke();
  };
  const stip = (x: number, y: number) => {
    const c = px(b, [x, y]);
    ctx.beginPath();
    ctx.arc(c[0], c[1], maat(b, 0.2, 1.5), 0, Math.PI * 2);
    ctx.fill();
  };

  rect(0, 0, B, L);
  const m = B / 2;
  // Aan de kant van het goal bovenaan (y = 0).
  const helft = (gespiegeld: boolean) => {
    const y = (v: number) => (gespiegeld ? L - v : v);
    const r = (x: number, y0: number, w: number, h: number) => rect(x, gespiegeld ? L - y0 - h : y0, w, h);
    r(m - 20.16, 0, 40.32, 16.5);
    r(m - 9.16, 0, 18.32, 5.5);
    stip(m, y(11));
    // Boog van de zestien: het deel van de cirkel (r = 9,15 rond de stip) buiten het strafschopgebied.
    const a = Math.acos(5.5 / 9.15);
    if (gespiegeld) boog(m, L - 11, 9.15, -Math.PI / 2 - a, -Math.PI / 2 + a);
    else boog(m, 11, 9.15, Math.PI / 2 - a, Math.PI / 2 + a);
    // Hoekschopbogen.
    if (gespiegeld) {
      boog(0, L, 1, -Math.PI / 2, 0);
      boog(B, L, 1, Math.PI, Math.PI * 1.5);
    } else {
      boog(0, 0, 1, 0, Math.PI / 2);
      boog(B, 0, 1, Math.PI / 2, Math.PI);
    }
  };
  helft(false);
  if (t.veld.type === 'heel') {
    helft(true);
    const a = px(b, [0, L / 2]);
    const c = px(b, [B, L / 2]);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.stroke();
    boog(m, L / 2, 9.15, 0, Math.PI * 2);
    stip(m, L / 2);
  } else {
    // Half veld: middenlijn is de onderkant, met de halve middencirkel.
    boog(m, L, 9.15, Math.PI, Math.PI * 2);
    stip(m, L);
  }
  ctx.restore();
}

// ---------- materiaal ----------

function metDraaiing(b: Beeld, o: VeldObject, teken: (ctx: CanvasRenderingContext2D) => void) {
  const { ctx } = b;
  const c = px(b, [o.x, o.y]);
  ctx.save();
  ctx.translate(c[0], c[1]);
  ctx.rotate(((o.hoek ?? 0) * Math.PI) / 180);
  teken(ctx);
  ctx.restore();
}

function tekenMateriaal(b: Beeld, o: VeldObject, inslag?: NetInslag) {
  const { ctx } = b;
  const s = b.schaal;
  const lijn = maat(b, 0.1, 1.2);
  switch (o.soort) {
    case 'goal':
    case 'klein-goal': {
      const w = (o.breedte ?? (o.soort === 'goal' ? 7.32 : 3)) * s;
      const d = maat(b, o.lengte ?? (o.soort === 'goal' ? 2 : 1.2), 6);
      metDraaiing(b, o, (c) => {
        // Net achter de doellijn (naar -y), lat/palen op de lijn.
        c.fillStyle = 'rgba(255,255,255,0.18)';
        c.fillRect(-w / 2, -d, w, d);
        c.strokeStyle = 'rgba(255,255,255,0.45)';
        c.lineWidth = Math.max(1, lijn * 0.5);
        const stap = Math.max(4 * b.dpr, 0.5 * s);
        c.beginPath();
        for (let x = -w / 2 + stap; x < w / 2; x += stap) {
          c.moveTo(x, -d);
          c.lineTo(x, 0);
        }
        for (let y = -d + stap; y < 0; y += stap) {
          c.moveTo(-w / 2, y);
          c.lineTo(w / 2, y);
        }
        c.stroke();
        c.strokeStyle = '#ffffff';
        c.lineWidth = maat(b, 0.12, 1.5);
        c.strokeRect(-w / 2, -d, w, d);
        c.lineWidth = maat(b, 0.24, 3);
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(-w / 2, 0);
        c.lineTo(w / 2, 0);
        c.stroke();
        // Bal in het net: de achterkant bolt even uit op de plek van de bal.
        if (inslag && inslag.sterkte > 0.02) {
          const h = ((o.hoek ?? 0) * Math.PI) / 180;
          const lx = ((inslag.x - o.x) * Math.cos(h) + (inslag.y - o.y) * Math.sin(h)) * s;
          const bol = inslag.sterkte * 0.7 * s;
          const breed = 1.1 * s;
          c.beginPath();
          c.moveTo(-w / 2, -d);
          for (let x = -w / 2; x <= w / 2; x += Math.max(2, w / 40)) c.lineTo(x, -d - bol * Math.exp(-((x - lx) ** 2) / (breed * breed)));
          c.lineTo(w / 2, -d);
          c.closePath();
          c.fillStyle = 'rgba(255,255,255,0.35)';
          c.fill();
          c.strokeStyle = '#ffffff';
          c.lineWidth = maat(b, 0.08, 1.2);
          c.stroke();
        }
      });
      break;
    }
    case 'pion': {
      const c = px(b, [o.x, o.y]);
      const r = maat(b, 0.28, 5);
      ctx.fillStyle = o.kleur ?? '#ff7a1a';
      ctx.beginPath();
      ctx.arc(c[0], c[1], r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = Math.max(1, lijn * 0.6);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(c[0], c[1], r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'hoedje': {
      const c = px(b, [o.x, o.y]);
      const r = maat(b, 0.22, 4);
      ctx.fillStyle = o.kleur ?? '#ffd23f';
      ctx.beginPath();
      ctx.arc(c[0], c[1], r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.arc(c[0], c[1], r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'paaltje': {
      const c = px(b, [o.x, o.y]);
      const r = maat(b, 0.1, 3);
      ctx.fillStyle = o.kleur ?? '#ffd23f';
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = Math.max(1, lijn * 0.5);
      ctx.beginPath();
      ctx.arc(c[0], c[1], r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'ring': {
      const c = px(b, [o.x, o.y]);
      ctx.strokeStyle = o.kleur ?? '#3fa9f5';
      ctx.lineWidth = maat(b, 0.06, 2);
      ctx.beginPath();
      ctx.arc(c[0], c[1], maat(b, 0.35, 6), 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'zone': {
      const w = (o.breedte ?? 10) * s;
      const h = (o.lengte ?? 10) * s;
      metDraaiing(b, o, (c) => {
        // Gekleurd vak: doorzichtig vlak met een rand in dezelfde kleur.
        c.fillStyle = o.kleur ? doorzichtig(o.kleur, 0.32) : 'rgba(255,255,255,0.12)';
        c.fillRect(-w / 2, -h / 2, w, h);
        c.strokeStyle = o.kleur ? doorzichtig(o.kleur, 0.95) : 'rgba(255,255,255,0.8)';
        // Gekleurd vak: volle rand in de kleur zelf (de vulling mengt met het gras).
        c.lineWidth = o.kleur ? maat(b, 0.18, 2.2) : maat(b, 0.08, 1.2);
        if (!o.kleur) c.setLineDash([6 * b.dpr, 4 * b.dpr]);
        c.strokeRect(-w / 2, -h / 2, w, h);
      });
      break;
    }
    case 'ladder': {
      const w = (o.breedte ?? 0.5) * s;
      const h = (o.lengte ?? 4) * s;
      metDraaiing(b, o, (c) => {
        c.strokeStyle = o.kleur ?? '#ffd23f';
        c.lineWidth = maat(b, 0.05, 1.5);
        c.strokeRect(-w / 2, -h / 2, w, h);
        c.beginPath();
        for (let y = -h / 2 + 0.45 * s; y < h / 2; y += 0.45 * s) {
          c.moveTo(-w / 2, y);
          c.lineTo(w / 2, y);
        }
        c.stroke();
      });
      break;
    }
    case 'horde': {
      const w = (o.breedte ?? 0.8) * s;
      // Hoge horde (vanaf 25 cm): dikkere lat, zodat laag en hoog ook van boven te onderscheiden zijn.
      const hoog = (o.hoogte ?? HORDE.laag) >= 0.25;
      metDraaiing(b, o, (c) => {
        c.strokeStyle = o.kleur ?? (hoog ? '#e8590c' : '#ff922b');
        c.lineWidth = maat(b, hoog ? 0.13 : 0.08, hoog ? 3.5 : 2.5);
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(-w / 2, 0);
        c.lineTo(w / 2, 0);
        c.moveTo(-w / 2, -0.15 * s);
        c.lineTo(-w / 2, 0.15 * s);
        c.moveTo(w / 2, -0.15 * s);
        c.lineTo(w / 2, 0.15 * s);
        c.stroke();
      });
      break;
    }
    case 'stok': {
      const l = (o.lengte ?? 1.5) * s;
      metDraaiing(b, o, (c) => {
        c.strokeStyle = o.kleur ?? '#f5f5f5';
        c.lineWidth = maat(b, 0.05, 2);
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(-l / 2, 0);
        c.lineTo(l / 2, 0);
        c.stroke();
      });
      break;
    }
    case 'muurtje': {
      const n = Math.max(2, Math.round((o.breedte ?? 2.4) / 0.6));
      const r = maat(b, 0.28, 4);
      metDraaiing(b, o, (c) => {
        c.fillStyle = o.kleur ?? '#9aa5ad';
        c.strokeStyle = 'rgba(0,0,0,0.4)';
        c.lineWidth = Math.max(1, lijn * 0.5);
        for (let i = 0; i < n; i++) {
          const x = (i - (n - 1) / 2) * r * 2;
          c.beginPath();
          c.arc(x, 0, r, 0, Math.PI * 2);
          c.fill();
          c.stroke();
        }
      });
      break;
    }
    case 'net': {
      // Voetvolleynet / lint: twee paaltjes met een band ertussen (van boven gezien).
      const w = (o.breedte ?? 6) * s;
      metDraaiing(b, o, (c) => {
        c.strokeStyle = 'rgba(255,255,255,0.55)';
        c.lineWidth = maat(b, 0.18, 4);
        c.beginPath();
        c.moveTo(-w / 2, 0);
        c.lineTo(w / 2, 0);
        c.stroke();
        c.strokeStyle = '#ffffff';
        c.lineWidth = maat(b, 0.05, 1.5);
        c.setLineDash([3 * b.dpr, 2 * b.dpr]);
        c.stroke();
        c.setLineDash([]);
        c.fillStyle = '#2b2b2b';
        for (const x of [-w / 2, w / 2]) {
          c.beginPath();
          c.arc(x, 0, maat(b, 0.1, 3), 0, Math.PI * 2);
          c.fill();
        }
      });
      break;
    }
    case 'bank': {
      const w = (o.breedte ?? 2.5) * s;
      const d = maat(b, 0.32, 5);
      metDraaiing(b, o, (c) => {
        c.fillStyle = o.kleur ?? '#b07a45';
        c.strokeStyle = 'rgba(0,0,0,0.45)';
        c.lineWidth = Math.max(1, lijn * 0.5);
        c.fillRect(-w / 2, -d / 2, w, d);
        c.strokeRect(-w / 2, -d / 2, w, d);
      });
      break;
    }
    case 'kooi': {
      // Pannakooi: lage boarding rond het vak.
      const w = (o.breedte ?? 7) * s;
      const h = (o.lengte ?? 5) * s;
      metDraaiing(b, o, (c) => {
        c.fillStyle = 'rgba(255,255,255,0.08)';
        c.fillRect(-w / 2, -h / 2, w, h);
        c.strokeStyle = o.kleur ?? '#2f5d8c';
        c.lineWidth = maat(b, 0.16, 4);
        c.strokeRect(-w / 2, -h / 2, w, h);
      });
      break;
    }
    case 'rebounder': {
      const w = (o.breedte ?? 1.2) * s;
      const d = maat(b, 0.3, 4);
      metDraaiing(b, o, (c) => {
        c.fillStyle = 'rgba(255,255,255,0.3)';
        c.fillRect(-w / 2, -d, w, d);
        c.strokeStyle = o.kleur ?? '#3a3a3a';
        c.lineWidth = maat(b, 0.06, 2);
        c.strokeRect(-w / 2, -d, w, d);
      });
      break;
    }
    case 'pop': {
      // Pop/dummy van boven: oranje ovaal met donkere rand.
      metDraaiing(b, o, (c) => {
        c.fillStyle = o.kleur ?? '#e98b2a';
        c.strokeStyle = 'rgba(0,0,0,0.55)';
        c.lineWidth = maat(b, 0.05, 1.5);
        c.beginPath();
        c.ellipse(0, 0, 0.3 * s, 0.2 * s, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      });
      break;
    }
    case 'keepersmat': {
      const w = (o.breedte ?? 2) * s;
      const h = (o.lengte ?? 1) * s;
      metDraaiing(b, o, (c) => {
        c.fillStyle = o.kleur ?? '#2f6fd6';
        c.globalAlpha = 0.85;
        c.fillRect(-w / 2, -h / 2, w, h);
        if (isKussen(o)) {
          // Landingskussen: dikke rand, zodat je ziet dat het een kussen is.
          c.globalAlpha = 1;
          c.strokeStyle = 'rgba(10,30,70,0.7)';
          c.lineWidth = maat(b, 0.12, 2.5);
          c.strokeRect(-w / 2, -h / 2, w, h);
        }
      });
      break;
    }
    default:
      break;
  }
}

// ---------- lijnen / sporen ----------

function lijnKleur(soort: LijnSoort, k: Kleuren) {
  return soort === 'bal' ? k.spoorBal : soort === 'loop' ? k.spoorLoop : k.spoorDribbel;
}

function tekenPolylijn(b: Beeld, soort: LijnSoort, punten: Punt[], k: Kleuren, pijl: boolean) {
  if (punten.length < 2) return;
  const { ctx } = b;
  const p = punten.map((q) => px(b, q));
  const dikte = maat(b, 0.14, 2);
  ctx.save();
  ctx.strokeStyle = lijnKleur(soort, k);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = dikte;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  if (soort === 'dribbel') {
    // Golflijn: zijwaartse uitwijking met een vaste golflengte, aan begin en eind naar nul.
    const golf = Math.max(1.4 * b.schaal, 12 * b.dpr);
    const amp = Math.max(0.3 * b.schaal, 3 * b.dpr);
    ctx.moveTo(p[0]![0], p[0]![1]);
    let afgelegd = 0;
    for (let i = 1; i < p.length; i++) {
      const [a, c] = [p[i - 1]!, p[i]!];
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      if (len < 0.5) continue;
      const [nx, ny] = [-(c[1] - a[1]) / len, (c[0] - a[0]) / len];
      const n = Math.max(2, Math.ceil(len / (2 * b.dpr)));
      for (let j = 1; j <= n; j++) {
        const f = j / n;
        const d = afgelegd + len * f;
        const demp = Math.min(1, d / golf, (len - len * f + 1) / (golf * 0.5));
        const w = Math.sin((d / golf) * Math.PI * 2) * amp * Math.max(0, demp);
        ctx.lineTo(a[0] + (c[0] - a[0]) * f + nx * w, a[1] + (c[1] - a[1]) * f + ny * w);
      }
      afgelegd += len;
    }
  } else {
    if (soort === 'loop') ctx.setLineDash([dikte * 2.2, dikte * 2.2]);
    ctx.moveTo(p[0]![0], p[0]![1]);
    for (const q of p.slice(1)) ctx.lineTo(q[0], q[1]);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  if (pijl) {
    const a = p[p.length - 2]!;
    const c = p[p.length - 1]!;
    const hoek = Math.atan2(c[1] - a[1], c[0] - a[0]);
    const l = dikte * 4;
    ctx.beginPath();
    ctx.moveTo(c[0], c[1]);
    ctx.lineTo(c[0] - l * Math.cos(hoek - 0.45), c[1] - l * Math.sin(hoek - 0.45));
    ctx.lineTo(c[0] - l * Math.cos(hoek + 0.45), c[1] - l * Math.sin(hoek + 0.45));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ---------- personen, bal, tekst ----------

/** Losse pasjes (voetenwerk, hordes, kniehef, sprongen): om en om links en rechts van de lijn. */
function tekenPasjes(b: Beeld, punten: Punt[], k: Kleuren, pijl: boolean, paslengte: number) {
  if (punten.length < 2) return;
  const { ctx } = b;
  const p = punten.map((q) => px(b, q));
  const stap = Math.max(paslengte * b.schaal, 5 * b.dpr);
  const opzij = Math.max(0.13 * b.schaal, 2.2 * b.dpr);
  const r = Math.max(0.07 * b.schaal, 1.6 * b.dpr);
  ctx.save();
  ctx.fillStyle = k.spoorLoop;
  ctx.globalAlpha = 0.95;
  let tot = stap / 2;
  let n = 0;
  for (let i = 1; i < p.length; i++) {
    const [a, c] = [p[i - 1]!, p[i]!];
    const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
    if (len < 0.01) continue;
    const [ux, uy] = [(c[0] - a[0]) / len, (c[1] - a[1]) / len];
    while (tot <= len) {
      const kant = n % 2 === 0 ? 1 : -1;
      const x = a[0] + ux * tot - uy * opzij * kant;
      const y = a[1] + uy * tot + ux * opzij * kant;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.4, r, Math.atan2(uy, ux), 0, Math.PI * 2);
      ctx.fill();
      tot += stap;
      n++;
    }
    tot -= len;
  }
  ctx.restore();
  // Pijlpunt aan het eind, zoals bij de andere lijnen.
  if (pijl) tekenPolylijn(b, 'loop', [lerpPunt(punten.at(-2)!, punten.at(-1)!, 0.97), punten.at(-1)!], k, true);
}

const lerpPunt = (a: Punt, c: Punt, u: number): Punt => [a[0] + (c[0] - a[0]) * u, a[1] + (c[1] - a[1]) * u];

function tekenPersoon(b: Beeld, o: VeldObject, s: ObjectStand, k: Kleuren, keeperNummer = false) {
  const { ctx } = b;
  const c = px(b, [s.x, s.y]);
  // In kniezit of hurkzit iets kleiner (lager bij de grond).
  const r = maat(b, 0.75, 10) * (1 - 0.15 * s.zit);
  const kleur = persoonKleur(o, k, s.team);
  ctx.save();
  ctx.translate(c[0], c[1]);

  // Kleine pasjes zichtbaar maken: twee voetjes die om en om naar voren gaan.
  if (s.manier && PASJES.includes(s.manier) && s.snelheid > 0.3 && s.houding === 'staan') {
    const h = (s.hoek * Math.PI) / 180;
    const [fx, fy] = [Math.cos(h), Math.sin(h)];
    const sw = Math.sin(s.fase);
    ctx.fillStyle = 'rgba(20,20,20,0.75)';
    for (const kant of [1, -1]) {
      const voor = sw * kant * r * 0.75;
      ctx.beginPath();
      ctx.ellipse(fx * voor - fy * kant * r * 0.5, fy * voor + fx * kant * r * 0.5, r * 0.32, r * 0.22, h, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Schaduw (verder weg als hij in de lucht hangt: hoge duik of sprong)
  const lucht = s.zweef + s.sprong * 0.45;
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(r * (0.12 + lucht * 0.6), r * (0.18 + lucht * 0.6), r * (s.houding === 'duik' ? 1.7 : 1.02), r * 1.02, s.houding === 'duik' ? (s.duikHoek * Math.PI) / 180 : 0, 0, Math.PI * 2);
  ctx.fill();
  const keeper = o.soort === 'keeper';

  ctx.fillStyle = kleur;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.5 * b.dpr, r * 0.16);
  if (s.houding === 'duik') {
    // Liggend in de duikrichting: langgerekte vorm.
    ctx.save();
    ctx.rotate((s.duikHoek * Math.PI) / 180);
    ctx.beginPath();
    ctx.roundRect(-r * 1.55, -r * 0.82, r * 3.1, r * 1.64, r * 0.82);
    ctx.fill();
    ctx.stroke();
    // Handschoenen gestrekt naar de bal.
    if (keeper) for (const y of [-0.38, 0.38]) handschoen(ctx, r * 1.75, r * y, r, b);
    ctx.restore();
  } else {
    // Kijkrichting: klein puntje aan de rand.
    const h = (s.hoek * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(Math.cos(h) * r * 1.42, Math.sin(h) * r * 1.42);
    ctx.lineTo(Math.cos(h + 0.6) * r * 0.95, Math.sin(h + 0.6) * r * 0.95);
    ctx.lineTo(Math.cos(h - 0.6) * r * 0.95, Math.sin(h - 0.6) * r * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (keeper) {
      // Handschoenen voor het lijf (basishouding); bij het vangen naar voren en bij elkaar.
      const v = Math.max(s.vang, s.stomp ? Math.sin(Math.PI * s.stomp.u) : 0);
      // Blokken: handen wijd opzij (stervorm of knieblok).
      const blok = s.blok ? Math.sin(Math.PI * Math.min(1, s.blok.u)) : 0;
      const breed = Math.max((0.75 - 0.45 * v) * (s.vangHoogte >= 1.6 && v > 0 ? 0.8 : 1), 0.75 + 0.85 * blok);
      const ver = r * (1.0 + 0.4 * v);
      for (const k of [-1, 1]) handschoen(ctx, Math.cos(h + k * breed) * ver, Math.sin(h + k * breed) * ver, r, b);
    }
  }

  const label = o.soort === 'trainer' ? 'T' : o.nummer !== undefined ? String(o.nummer) : '';
  if (label && keeper) {
    // Keeper: klein nummer in een badge naast het poppetje (niet erop), alleen bij meer keepers.
    if (keeperNummer) {
      const bx = r * 1.05;
      const by = -r * 1.05;
      const br = r * 0.52;
      ctx.fillStyle = kleur;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, br * 0.22);
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.round(br * 1.35)}px "Barlow Condensed", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, bx, by + br * 0.06);
    }
  } else if (label) {
    ctx.fillStyle = k.rugnummer;
    ctx.font = `700 ${Math.round(r * (label.length > 1 ? 1.0 : 1.15))}px "Barlow Condensed", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Donker randje: leesbaar op elke shirtkleur (ook geel).
    ctx.lineWidth = Math.max(1, r * 0.16);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.strokeText(label, 0, r * 0.06);
    ctx.fillText(label, 0, r * 0.06);
  }
  ctx.restore();
}

/** Keepershandschoen: klein wit rondje met een donker randje. */
function handschoen(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, b: Beeld) {
  ctx.save();
  ctx.fillStyle = '#f4f4f4';
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = Math.max(1, b.dpr * 0.9);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function tekenBal(b: Beeld, s: ObjectStand, personen: Punt[], variant?: VeldObject['variant']) {
  const { ctx } = b;
  let c = px(b, [s.x, s.y]);
  const r = maat(b, 0.3, 4.5) * (1 + s.hoogte * 0.09);
  if (s.hoogte < 0.3) {
    const minimaal = maat(b, 0.75, 10) + r * 0.55;
    for (const p of personen) {
      const dx = c[0] - p[0];
      const dy = c[1] - p[1];
      const d = Math.hypot(dx, dy);
      if (d >= minimaal) continue;
      // Geleidelijk wegduwen (continu), zodat de bal niet verspringt bij een pass.
      c = d < 0.01 ? [p[0], p[1] + minimaal] : [p[0] + (dx / d) * minimaal, p[1] + (dy / d) * minimaal];
    }
  }
  if (s.hoogte > 0.05) {
    const d = s.hoogte * 0.35 * b.schaal;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.arc(c[0] + d, c[1] + d, maat(b, 0.3, 4.5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = variant === 'tennisbal' ? '#d4e83a' : variant === 'reactiebal' ? '#ffd23f' : '#ffffff';
  ctx.strokeStyle = '#1b1b1b';
  ctx.lineWidth = Math.max(1.2 * b.dpr, r * 0.22);
  ctx.beginPath();
  ctx.arc(c[0], c[1], r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1b1b1b';
  ctx.beginPath();
  ctx.arc(c[0], c[1], r * 0.38, 0, Math.PI * 2);
  ctx.fill();
}

function tekenTekst(b: Beeld, o: VeldObject) {
  if (!o.tekst) return;
  const { ctx } = b;
  const c = px(b, [o.x, o.y]);
  ctx.save();
  ctx.font = `700 ${Math.round(maat(b, 1.2, 12))}px "Barlow Condensed", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3 * b.dpr;
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.strokeText(o.tekst, c[0], c[1]);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(o.tekst, c[0], c[1]);
  ctx.restore();
}
