// Hulpjes voor de Mini Talents-oefeningen (0.30.0): station met ±5 kinderen, kleine vakken, materiaal zoals bij de club.
const { speler, trainer, bal, hoedje, stap } = require('./bouwstenen.cjs');

const MINI = ['mini-3-5', 'mini-5-7'];
const KLEUREN = { rood: '#e03131', blauw: '#1c64d8', geel: '#ffd23f', groen: '#2fb344', oranje: '#ff7a1a' };

/** Vaste velden voor elke mini-oefening; zonder keepers en doorwisselbaar tenzij anders opgegeven. */
const mini = (o) => ({ keepersNodig: 0, leeftijden: MINI, doorwisselbaar: true, ...o });

const zone = (id, x, y, breedte, lengte, kleur) => ({ id, soort: 'zone', x, y, breedte, lengte, ...(kleur ? { kleur } : {}) });
const B = (id, nr, x, y, extra = {}) => speler(id, nr, x, y, { team: 'B', ...extra });
const hoepel = (id, x, y, kleur) => ({ id, soort: 'ring', x, y, ...(kleur ? { kleur } : {}) });
const kaatsbord = (id, x, y, hoek = 0) => ({ id, soort: 'rebounder', x, y, hoek });
/** Mini-goaltje zonder net; hoek 0 = opening naar beneden (+y). */
const miniGoal = (id, x, y, hoek = 0) => ({ id, soort: 'klein-goal', x, y, hoek, breedte: 1.5, hoogte: 0.9, lengte: 0.7, zonderNet: true });
const eGoal = (id, x, y, hoek = 0) => ({ id, soort: 'goal', x, y, hoek, breedte: 5, hoogte: 2, lengte: 1.5 });
const pionHoog = (id, x, y, kleur) => ({ id, soort: 'pion', x, y, hoogte: 0.7, ...(kleur ? { kleur } : {}) });
const pionGroot = (id, x, y, kleur) => ({ id, soort: 'pion', x, y, hoogte: 0.45, ...(kleur ? { kleur } : {}) });
const pionKlein = (id, x, y, kleur) => ({ id, soort: 'pion', x, y, hoogte: 0.2, ...(kleur ? { kleur } : {}) });
/** Tennisbal die op een pion ligt. */
const tennisbal = (id, x, y, opHoogte = 0.36) => ({ id, soort: 'bal', x, y, variant: 'tennisbal', opHoogte });
const leeg = (breedte, lengte, camera = 'schuin') => ({ veld: { type: 'leeg', breedte, lengte }, camera });

/** Vak van b × l met een hoedje op elke hoek, met 1 m rand eromheen (midden op b/2 + 1, l/2 + 1). */
function vak(b, l) {
  const x0 = 1;
  const y0 = 1;
  return [zone('vak', x0 + b / 2, y0 + l / 2, b, l), hoedje('vh1', x0, y0), hoedje('vh2', x0 + b, y0), hoedje('vh3', x0, y0 + l), hoedje('vh4', x0 + b, y0 + l)];
}

const plek = (c, r, hoek) => [+(c[0] + r * Math.cos((hoek * Math.PI) / 180)).toFixed(2), +(c[1] + r * Math.sin((hoek * Math.PI) / 180)).toFixed(2)];

/** n kinderen met een eigen bal op een cirkel; ze kijken in de draairichting. */
function kinderen(n, c, r, start = -90, nummers = 1) {
  const lijst = [];
  for (let i = 0; i < n; i++) {
    const hoek = start + (360 * i) / n;
    const [x, y] = plek(c, r, hoek);
    const k = hoek + 90;
    lijst.push(speler(`a${i + 1}`, nummers + i, x, y, { kijkrichting: k }));
    const [bx, by] = [x + 0.55 * Math.cos((k * Math.PI) / 180), y + 0.55 * Math.sin((k * Math.PI) / 180)];
    lijst.push(bal(`b${i + 1}`, +bx.toFixed(2), +by.toFixed(2), `a${i + 1}`));
  }
  return lijst;
}

/** Iedereen dribbelt een stuk rond (vrij dribbelen in het vak): `graden` verder langs de cirkel, met een golfje erin. */
function rondje(n, c, r, start, graden, duur, extra = {}) {
  const acties = [];
  const delen = Math.max(2, Math.ceil(Math.abs(graden) / 40));
  for (let i = 0; i < n; i++) {
    const h0 = start + (360 * i) / n;
    const via = [];
    for (let k = 1; k < delen; k++) via.push(plek(c, r + (k % 2 ? 0.5 : -0.3), h0 + (graden * k) / delen));
    acties.push({ type: 'dribbel', wie: `a${i + 1}`, via, naar: plek(c, r, h0 + graden), duur, ...extra });
  }
  return stap(...acties);
}

/** Waar je stopt om de bal (0,55 m voor je) op `doel` te leggen als je van `van` komt. */
function stopBij(van, doel, afstand = 0.62) {
  const d = Math.hypot(doel[0] - van[0], doel[1] - van[1]);
  return [+(doel[0] - ((doel[0] - van[0]) / d) * afstand).toFixed(2), +(doel[1] - ((doel[1] - van[1]) / d) * afstand).toFixed(2)];
}

/**
 * Tekening een kwartslag draaien (0.34.1, zoals draaiKwart in spelers-027b.cjs): (x, y) → (y, breedte − x), hoeken −90.
 * Zo staan aanvaller en verdediger in 3D (Schuin) naast elkaar in plaats van achter elkaar.
 */
function draaiKwart(t) {
  const b = t.veld.breedte;
  const p = ([x, y]) => [y, +(b - x).toFixed(2)];
  const isPunt = (v) => Array.isArray(v) && typeof v[0] === 'number';
  const objecten = t.objecten.map((o) => {
    const n = { ...o, x: o.y, y: +(b - o.x).toFixed(2) };
    if (o.hoek !== undefined) n.hoek = o.hoek - 90;
    if (o.kijkrichting !== undefined) n.kijkrichting = o.kijkrichting - 90;
    if (o.soort === 'zone') Object.assign(n, { breedte: o.lengte, lengte: o.breedte });
    return n;
  });
  const actie = (a) => {
    const n = { ...a };
    for (const k of ['naar', 'terug', 'terugNaar', 'afloopNaar', 'stuitOp', 'duikNaar', 'stompNaar', 'punt']) if (isPunt(a[k])) n[k] = p(a[k]);
    if (a.via) n.via = a.via.map(p);
    if (a.kijk !== undefined) n.kijk = a.kijk - 90;
    return n;
  };
  return { ...t, veld: { ...t.veld, breedte: t.veld.lengte, lengte: b }, objecten, animatie: t.animatie.map((st) => ({ ...st, acties: st.acties.map(actie) })) };
}

/** Dezelfde actie voor de eerste n kinderen. */
const allen = (n, maak) => stap(...Array.from({ length: n }, (_, i) => maak(`a${i + 1}`, i)));

module.exports = { draaiKwart, MINI, KLEUREN, mini, zone, B, hoepel, kaatsbord, miniGoal, eGoal, pionHoog, pionGroot, pionKlein, tennisbal, leeg, vak, plek, stopBij, kinderen, rondje, allen, trainer, speler, bal, hoedje, stap };
