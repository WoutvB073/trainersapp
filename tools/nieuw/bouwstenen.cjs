// Gedeelde bouwstenen voor de bouwscripts van oefeningen (objecten en stappen).
const goal = { id: 'g1', soort: 'goal', x: 34, y: 0 };
const keeper = (id, nr, x, y, extra = {}) => ({ id, soort: 'keeper', nummer: nr, x, y, ...extra });
const speler = (id, nr, x, y, extra = {}) => ({ id, soort: 'speler', team: 'A', nummer: nr, x, y, ...extra });
const trainer = (x, y, kijk = -90) => ({ id: 't1', soort: 'trainer', x, y, kijkrichting: kijk });
const bal = (id, x, y, bij, extra = {}) => ({ id, soort: 'bal', x, y, ...(bij ? { bij } : {}), ...extra });
const pion = (id, x, y, kleur) => ({ id, soort: 'pion', x, y, ...(kleur ? { kleur } : {}) });
const hoedje = (id, x, y, kleur) => ({ id, soort: 'hoedje', x, y, ...(kleur ? { kleur } : {}) });
const paaltje = (id, x, y) => ({ id, soort: 'paaltje', x, y });
const pop = (id, x, y) => ({ id, soort: 'pop', x, y });
const horde = (id, x, y, hoek = 90, hoogte = 0.3) => ({ id, soort: 'horde', x, y, hoek, hoogte });
const pauze = (duur) => ({ duur, acties: [] });
const stap = (...acties) => ({ acties });
/** Bal terugrollen (onderhands over de grond). */
const terug = (van, naar, extra = {}) => stap({ type: 'pass', van, naar, worp: 'onderhands', hoogte: 'grond', ...extra });
const KLEUR = { rood: '#e03131', blauw: '#1c64d8', geel: '#ffd23f', groen: '#2fb344', wit: '#ffffff' };
/** Standaard voor een keeperoefening bij het doel. */
const keeperVeld = (weergave, camera = 'schuin') => ({ veld: { type: 'half' }, weergave, camera });

module.exports = { goal, keeper, speler, trainer, bal, pion, hoedje, paaltje, pop, horde, pauze, stap, terug, KLEUR, keeperVeld };
