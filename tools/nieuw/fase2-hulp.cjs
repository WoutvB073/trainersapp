// Hulpjes voor de oefeningen van fase 2, deel 3 (0.37.x): de 157 oefeningen uit VOORSTEL-OEFENINGEN.md.
const { goal, keeper, speler, trainer, bal, pion, hoedje, paaltje, pop, horde, pauze, stap, terug, KLEUR } = require('./bouwstenen.cjs');

const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const C = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'C', ...extra });
const zone = (id, x, y, breedte, lengte, kleur) => ({ id, soort: 'zone', x, y, breedte, lengte, ...(kleur ? { kleur } : {}) });
const leeg = (breedte, lengte, camera = 'schuin') => ({ veld: { type: 'leeg', breedte, lengte }, camera });
const doeltje = (id, x, y, hoek = 0, breedte = 3) => ({ id, soort: 'klein-goal', x, y, hoek, breedte });
/** Mini-goaltje zonder net (materiaal van de club voor O6/O7); hoek 0 = opening naar beneden (+y). */
const miniGoal = (id, x, y, hoek = 0) => ({ id, soort: 'klein-goal', x, y, hoek, breedte: 1.5, hoogte: 0.9, lengte: 0.7, zonderNet: true });
const ring = (id, x, y, kleur) => ({ id, soort: 'ring', x, y, ...(kleur ? { kleur } : {}) });
const ladder = (id, x, y, hoek = 0, lengte = 4) => ({ id, soort: 'ladder', x, y, hoek, lengte, breedte: 0.5 });
const stok = (id, x, y, hoek = 0, lengte = 1.2) => ({ id, soort: 'stok', x, y, hoek, lengte });
const kaatsbord = (id, x, y, hoek = 0) => ({ id, soort: 'rebounder', x, y, hoek });
const pionHoog = (id, x, y, kleur) => ({ id, soort: 'pion', x, y, hoogte: 0.7, ...(kleur ? { kleur } : {}) });
const tekst = (id, x, y, waarde, breedte = 4) => ({ id, soort: 'tekst', x, y, tekst: waarde, breedte });

const ALLE = ['mini-3-5', 'mini-5-7', 'jo8-11', 'jo12-15', 'jo16-19'];
const JO = ['jo8-11', 'jo12-15', 'jo16-19'];
const OUD = ['jo12-15', 'jo16-19'];
const MIDDEN = ['jo8-11', 'jo12-15'];
const O6 = ['mini-3-5'];
const O7 = ['mini-5-7'];

const r2 = (v) => Math.round(v * 100) / 100;
const isPunt = (v) => Array.isArray(v) && v.length === 2 && typeof v[0] === 'number';
const hoek = (h) => ((((h + 180) % 360) + 360) % 360) - 180;

/** Alle punten van een tekening omrekenen met `p`; hoeken (kijkrichting, kijk, hoek van materiaal) schuiven `graden` op. */
function omrekenen(t, p, graden = 0) {
  const actie = (a) => {
    const n = { ...a };
    for (const k of ['naar', 'terug', 'stuitOp', 'terugNaar', 'afloopNaar', 'duikNaar', 'stompNaar', 'punt']) if (isPunt(n[k])) n[k] = p(n[k]);
    if (Array.isArray(n.via)) n.via = n.via.map(p);
    if (typeof n.kijk === 'number') n.kijk = hoek(n.kijk + graden);
    return n;
  };
  const stapOm = (s) => {
    if (s.acties) return { ...s, acties: s.acties.map(actie) };
    if (s.herhaal) {
      const waarden = Object.fromEntries(Object.entries(s.herhaal.waarden ?? {}).map(([k, l]) => [k, l.map((v) => (isPunt(v) ? p(v) : Array.isArray(v) && v.every(isPunt) ? v.map(p) : v))]));
      return { herhaal: { ...s.herhaal, waarden, stappen: s.herhaal.stappen.map(stapOm) } };
    }
    return s;
  };
  return {
    ...t,
    objecten: t.objecten.map((o) => {
      const [x, y] = p([o.x, o.y]);
      const n = { ...o, x, y };
      if (o.kijkrichting !== undefined) n.kijkrichting = hoek(o.kijkrichting + graden);
      if (o.hoek !== undefined && graden) n.hoek = hoek(o.hoek + graden);
      // Een vak (zone) een kwartslag gedraaid: breedte en lengte wisselen.
      if (o.soort === 'zone' && Math.abs(Math.abs(graden) - 90) < 0.01) Object.assign(n, { breedte: o.lengte, lengte: o.breedte });
      return n;
    }),
    ...(t.rijen
      ? {
          rijen: t.rijen.map((r) => ({
            ...r,
            ...Object.fromEntries([
              ['x', p([r.x, r.y])[0]],
              ['y', p([r.x, r.y])[1]],
            ]),
            richting: hoek((r.richting ?? 0) + graden),
          })),
        }
      : {}),
    animatie: t.animatie.map(stapOm),
  };
}
/** Draai een tekening om het punt c (met de klok mee in beeld). Zo staan spelers in 3D niet achter elkaar. */
const draai = (t, c, graden) => {
  const h = (graden * Math.PI) / 180;
  return omrekenen(t, ([x, y]) => [r2(c[0] + (x - c[0]) * Math.cos(h) - (y - c[1]) * Math.sin(h)), r2(c[1] + (x - c[0]) * Math.sin(h) + (y - c[1]) * Math.cos(h))], graden);
};

/** Een stap waarin een paar spelers tegelijk een stukje lopen (vrij bewegen in een vak). `lijst` = [[wie, naar, extra?], …]. */
const lopen = (lijst, duur, extra = {}) => stap(...lijst.map(([wie, naar, x = {}]) => ({ type: 'loop', wie, naar, duur, ...extra, ...x })));
const dribbels = (lijst, duur, extra = {}) => stap(...lijst.map(([wie, naar, x = {}]) => ({ type: 'dribbel', wie, naar, duur, ...extra, ...x })));

module.exports = {
  goal,
  keeper,
  speler,
  trainer,
  bal,
  pion,
  hoedje,
  paaltje,
  pop,
  horde,
  pauze,
  stap,
  terug,
  KLEUR,
  B,
  C,
  zone,
  leeg,
  doeltje,
  miniGoal,
  ring,
  ladder,
  stok,
  kaatsbord,
  pionHoog,
  tekst,
  ALLE,
  JO,
  OUD,
  MIDDEN,
  O6,
  O7,
  r2,
  draai,
  omrekenen,
  lopen,
  dribbels,
};
