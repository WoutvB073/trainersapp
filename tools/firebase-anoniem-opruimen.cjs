// Anonieme accounts opruimen die sinds een bepaald moment zijn gemaakt (die maakt de browsertest voor deellinks in het echte project).
// Accounts met een e-mailadres blijven altijd staan. Gebruikt het inloggen van de Firebase-CLI.
// Gebruik: node tools/firebase-anoniem-opruimen.cjs <tijd in ms sinds 1970>
const { execFileSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const PROJECT = 'toptraining-40a90';
const sinds = Number(process.argv[2]);
if (!sinds) {
  console.error('Geef de begintijd van de test mee.');
  process.exit(2);
}
const lib = path.join(__dirname, '..', 'node_modules', 'firebase-tools', 'lib');
const { requireAuth } = require(path.join(lib, 'requireAuth.js'));
const { Client } = require(path.join(lib, 'apiv2.js'));
const { configstore } = require(path.join(lib, 'configstore.js'));

(async () => {
  const map = mkdtempSync(path.join(tmpdir(), 'accounts-'));
  const bestand = path.join(map, 'accounts.json');
  let accounts;
  try {
    execFileSync(process.execPath, [path.join(lib, 'bin', 'firebase.js'), 'auth:export', bestand, '--format=json', '--project', PROJECT], { stdio: 'ignore' });
    accounts = JSON.parse(readFileSync(bestand, 'utf8')).users ?? [];
  } finally {
    rmSync(map, { recursive: true, force: true });
  }
  const weg = accounts.filter((a) => !a.email && !(a.providerUserInfo ?? []).length && Number(a.createdAt) >= sinds).map((a) => a.localId);
  console.log(`Anonieme accounts sinds de start van de test: ${weg.length}`);
  if (!weg.length) return;
  await requireAuth({ user: configstore.get('user'), tokens: configstore.get('tokens') });
  const c = new Client({ urlPrefix: 'https://identitytoolkit.googleapis.com', apiVersion: 'v1', auth: true });
  await c.post(`/projects/${PROJECT}/accounts:batchDelete`, { localIds: weg, force: true });
  console.log('Verwijderd.');
})().catch((e) => {
  console.error('Opruimen mislukt:', e.message.slice(0, 200));
  process.exit(1);
});
