// Verlopen deellinks en anonieme accounts opruimen. Accounts met een e-mailadres blijven altijd staan.
//   node tools/firebase-anoniem-opruimen.cjs --ouder-dan 30 [--proef]   verlopen links, en anonieme accounts van ouder dan 30 dagen zonder links (ook maandelijks via GitHub Actions)
//   node tools/firebase-anoniem-opruimen.cjs <tijd in ms sinds 1970>    gemaakt sinds een browsertest tegen het echte project
// Gebruikt het inloggen van de Firebase-CLI, of in GitHub Actions het serviceaccount (GOOGLE_APPLICATION_CREDENTIALS).
// Toont alleen aantallen: nooit adressen, sleutels of andere instellingen.
const { execFileSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const PROJECT = 'toptraining-40a90';
const DAG = 24 * 60 * 60 * 1000;
const args = process.argv.slice(2);
const proef = args.includes('--proef');
const dagenArg = args.indexOf('--ouder-dan');
const dagen = dagenArg >= 0 ? Number(args[dagenArg + 1]) : null;
const sinds = dagenArg >= 0 ? null : Number(args[0]);
if (!(dagen > 0) && !sinds) {
  console.error('Gebruik: --ouder-dan <dagen> [--proef], of de begintijd van een test.');
  process.exit(2);
}
const lib = path.join(__dirname, '..', 'node_modules', 'firebase-tools', 'lib');
const { requireAuth } = require(path.join(lib, 'requireAuth.js'));
const { Client } = require(path.join(lib, 'apiv2.js'));
const { configstore } = require(path.join(lib, 'configstore.js'));

function accounts() {
  const map = mkdtempSync(path.join(tmpdir(), 'accounts-'));
  const bestand = path.join(map, 'accounts.json');
  try {
    execFileSync(process.execPath, [path.join(lib, 'bin', 'firebase.js'), 'auth:export', bestand, '--format=json', '--project', PROJECT], { stdio: 'ignore' });
    return JSON.parse(readFileSync(bestand, 'utf8')).users ?? [];
  } finally {
    rmSync(map, { recursive: true, force: true });
  }
}

/** Verlopen links weghalen (Firestore TTL kan niet op het gratis abonnement). Geeft terug wie er nog links heeft. */
async function links() {
  const c = new Client({ urlPrefix: 'https://firestore.googleapis.com', apiVersion: 'v1', auth: true });
  const makers = new Set();
  const verlopen = [];
  let pageToken;
  do {
    const queryParams = { pageSize: '300', 'mask.fieldPaths': ['maker', 'verloopt'], ...(pageToken ? { pageToken } : {}) };
    const r = await c.get(`/projects/${PROJECT}/databases/(default)/documents/links`, { queryParams });
    for (const d of r.body.documents ?? []) {
      const einde = Date.parse(d.fields?.verloopt?.timestampValue ?? '');
      if (einde <= Date.now()) verlopen.push(d.name.split('/documents/')[1]);
      else makers.add(d.fields?.maker?.stringValue);
    }
    pageToken = r.body.nextPageToken;
  } while (pageToken);
  console.log(`Verlopen links: ${verlopen.length}`);
  if (!proef) for (const p of verlopen) await c.delete(`/projects/${PROJECT}/databases/(default)/documents/${p}`);
  return makers;
}

(async () => {
  await requireAuth({ user: configstore.get('user'), tokens: configstore.get('tokens') });
  const anoniem = accounts().filter((a) => !a.email && !(a.providerUserInfo ?? []).length);
  let weg;
  if (dagen) {
    const metLinks = await links();
    const grens = Date.now() - dagen * DAG;
    const oud = anoniem.filter((a) => Number(a.createdAt) < grens);
    weg = oud.filter((a) => !metLinks.has(a.localId));
    console.log(`Anonieme accounts: ${anoniem.length}, ouder dan ${dagen} dagen: ${oud.length}, daarvan zonder links: ${weg.length}`);
  } else {
    weg = anoniem.filter((a) => Number(a.createdAt) >= sinds);
    console.log(`Anonieme accounts sinds de start van de test: ${weg.length}`);
  }
  if (!weg.length || proef) return;
  const c = new Client({ urlPrefix: 'https://identitytoolkit.googleapis.com', apiVersion: 'v1', auth: true });
  // Firebase verwijdert er maximaal 1000 per keer.
  for (let i = 0; i < weg.length; i += 1000) await c.post(`/projects/${PROJECT}/accounts:batchDelete`, { localIds: weg.slice(i, i + 1000).map((a) => a.localId), force: true });
  console.log('Verwijderd.');
})().catch((e) => {
  console.error('Opruimen mislukt:', String(e.message).slice(0, 200));
  process.exit(1);
});
