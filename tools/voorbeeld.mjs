// Voorbeeldversie (fase 1 van de volgende stap): bouwt de app met VITE_VOORBEELD=1 in voorbeeld/trainersapp en zet hem op een
// Firebase Hosting-voorbeeldkanaal: een eigen adres dat vanzelf verloopt. De echte app (GitHub Pages) en het live-kanaal van Firebase
// Hosting blijven ongemoeid, en in deze build staat online uit (zie src/online/config.ts), dus Firestore wordt niet geraakt.
// Gebruik: node tools/voorbeeld.mjs build         alleen bouwen (map voorbeeld/)
//          node tools/voorbeeld.mjs zet [dagen]   bouwen en online zetten (standaard 30 dagen, het maximum)
//          node tools/voorbeeld.mjs bekijk [poort] de gebouwde voorbeeldversie lokaal bekijken (standaard poort 4185)
//          node tools/voorbeeld.mjs weg           het voorbeeldkanaal verwijderen
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KANAAL = 'volgende-stap';
const PROJECT = 'live';
const wortel = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env, VITE_VOORBEELD: '1' };
const node = (args, opties = {}) => spawnSync(process.execPath, args, { cwd: wortel, env, encoding: 'utf8', ...opties });

function bouw() {
  const tsc = node([path.join('node_modules', 'typescript', 'bin', 'tsc'), '--noEmit'], { stdio: 'inherit' });
  if (tsc.status !== 0) process.exit(tsc.status ?? 1);
  const vite = node([path.join('node_modules', 'vite', 'bin', 'vite.js'), 'build'], { stdio: 'inherit' });
  if (vite.status !== 0) process.exit(vite.status ?? 1);
  // Controle: in de voorbeeld-build mag de Firebase-config van het echte project niet zitten (online staat uit).
  const map = path.join(wortel, 'voorbeeld', 'trainersapp', 'assets');
  const metConfig = fs.readdirSync(map).filter((f) => f.endsWith('.js') && fs.readFileSync(path.join(map, f), 'utf8').includes('toptraining-40a90'));
  if (metConfig.length) {
    console.error(`FOUT: de voorbeeld-build bevat nog Firebase-config (${metConfig.join(', ')}). Niet online gezet.`);
    process.exit(1);
  }
  console.log('Voorbeeld gebouwd in voorbeeld/trainersapp (online staat uit).');
}

/** Firebase-CLI met --json; toont alleen wat nodig is (adres en einddatum), nooit de rest van de uitvoer. */
function firebase(args) {
  const r = node([path.join('tools', 'firebase.mjs'), ...args, '--project', PROJECT, '--json'], { stdio: ['ignore', 'pipe', 'pipe'] });
  const uit = `${r.stdout ?? ''}`;
  const adres = [...uit.matchAll(/"url":\s*"(https:\/\/[^"]+)"/g)].map((m) => m[1]);
  const tot = /"expireTime":\s*"([^"]+)"/.exec(uit)?.[1];
  const fout = /"error":\s*"([^"]+)"/.exec(uit)?.[1] ?? /"message":\s*"([^"]+)"/.exec(uit)?.[1];
  return { ok: r.status === 0 && /"status":\s*"success"/.test(uit), adres, tot, fout };
}

const wat = process.argv[2] ?? 'build';
if (wat === 'build') bouw();
else if (wat === 'zet') {
  const dagen = Math.min(30, Math.max(1, Number(process.argv[3] ?? 30)));
  bouw();
  const r = firebase(['hosting:channel:deploy', KANAAL, '--expires', `${dagen}d`]);
  if (!r.ok || !r.adres.length) {
    console.error(`Online zetten is niet gelukt${r.fout ? `: ${r.fout}` : '.'}`);
    process.exit(1);
  }
  console.log(`Testlink: ${r.adres[0]}/trainersapp/`);
  if (r.tot) console.log(`Werkt tot: ${new Date(r.tot).toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short' })}`);
} else if (wat === 'bekijk') {
  // De gebouwde voorbeeldversie lokaal bekijken (http://localhost:<poort>/trainersapp/), bv. voor de browsertests.
  const poort = process.argv[3] ?? '4185';
  const r = node([path.join('node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', poort, '--strictPort'], { stdio: 'inherit' });
  process.exit(r.status ?? 0);
} else if (wat === 'weg') {
  const r = firebase(['hosting:channel:delete', KANAAL, '--force']);
  console.log(r.ok ? 'Het voorbeeldkanaal is verwijderd.' : `Verwijderen is niet gelukt${r.fout ? `: ${r.fout}` : '.'}`);
  process.exit(r.ok ? 0 : 1);
} else {
  console.error('Gebruik: node tools/voorbeeld.mjs build | zet [dagen] | bekijk [poort] | weg');
  process.exit(1);
}
