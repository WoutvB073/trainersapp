// Alleen lezen: wat staat er in het echte Firebase-project? Telt accounts (via de CLI-export, adressen worden gemaskeerd getoond) en
// documenten per collectie. Gebruikt het inloggen van de Firebase-CLI. Na testen tegen het echte project moet er alleen nog het eigen
// account van de gebruiker staan, met wat daarbij hoort (ook teams die dat account zelf gemaakt heeft): geen @example.com, en geen teams
// of teamcodes van een testaccount of een account dat niet meer bestaat.
// Gebruik: node tools/firebase-leeg.cjs
const { execFileSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const PROJECT = 'toptraining-40a90';
const lib = path.join(__dirname, '..', 'node_modules', 'firebase-tools', 'lib');
const { requireAuth } = require(path.join(lib, 'requireAuth.js'));
const { Client } = require(path.join(lib, 'apiv2.js'));

const masker = (e) => (e ?? '(geen e-mail)').replace(/^(.).*(@.*)$/, '$1***$2');

(async () => {
  // Accounts.
  const map = mkdtempSync(path.join(tmpdir(), 'accounts-'));
  const bestand = path.join(map, 'accounts.json');
  let accounts;
  try {
    execFileSync(process.execPath, [path.join(lib, 'bin', 'firebase.js'), 'auth:export', bestand, '--format=json', '--project', PROJECT], { stdio: 'ignore' });
    accounts = JSON.parse(readFileSync(bestand, 'utf8')).users ?? [];
  } finally {
    rmSync(map, { recursive: true, force: true });
  }
  console.log(`Accounts: ${accounts.length}`);
  for (const a of accounts) console.log(`  ${masker(a.email)}`);
  const test = accounts.filter((a) => /@example\.com$/i.test(a.email ?? ''));

  // Firestore.
  const { configstore } = require(path.join(lib, 'configstore.js'));
  await requireAuth({ user: configstore.get('user'), tokens: configstore.get('tokens') });
  const c = new Client({ urlPrefix: 'https://firestore.googleapis.com', apiVersion: 'v1', auth: true });
  const basis = `/projects/${PROJECT}/databases/(default)/documents`;
  const collecties = async (pad) => (await c.post(`${basis}${pad}:listCollectionIds`, { pageSize: 100 })).body.collectionIds ?? [];
  const documenten = async (pad) => {
    const uit = [];
    let pageToken;
    do {
      const r = await c.get(`${basis}${pad}`, { queryParams: { pageSize: '300', ...(pageToken ? { pageToken } : {}) } });
      uit.push(...(r.body.documents ?? []));
      pageToken = r.body.nextPageToken;
    } while (pageToken);
    return uit;
  };
  const idVan = (d) => d.name.split('/').pop();
  const echt = accounts.filter((a) => !/@example\.com$/i.test(a.email ?? '')).map((a) => a.localId);
  const top = await collecties('');
  console.log(`Collecties: ${top.join(', ') || '(geen)'}`);
  const telling = {};
  for (const col of top) {
    const docs = await documenten(`/${col}`);
    telling[col] = docs;
    console.log(`  ${col}: ${docs.length} document(en)`);
    if (col === 'users')
      for (const id of docs.map(idVan)) {
        const sub = await collecties(`/users/${id}`);
        const delen = [];
        for (const s of sub) delen.push(`${s} ${(await documenten(`/users/${id}/${s}`)).length}`);
        const hoort = accounts.some((a) => a.localId === id);
        console.log(`    ${id.slice(0, 4)}… ${hoort ? 'hoort bij een account' : 'ZONDER ACCOUNT'}: ${delen.join(', ') || 'geen eigen gegevens'}`);
      }
  }
  const wees = (telling.users ?? []).map(idVan).filter((id) => !accounts.some((a) => a.localId === id));
  const teams = telling.teams ?? [];
  const vreemd = teams.filter((d) => !echt.includes(d.fields?.maker?.stringValue));
  const eigenTeams = teams.filter((d) => !vreemd.includes(d)).map(idVan);
  const codes = (telling.teamCodes ?? []).filter((d) => !eigenTeams.includes(d.fields?.team?.stringValue));
  console.log(`Teams van het eigen account: ${eigenTeams.length} (niet aangeraakt)`);
  const fout = [];
  if (test.length) fout.push(`${test.length} testaccount(s) over`);
  const anoniem = accounts.filter((a) => !a.email);
  console.log(`Anonieme accounts: ${anoniem.length}`);
  if ((telling.links ?? []).length) fout.push(`${telling.links.length} deellink(s) over`);
  if (anoniem.length) fout.push(`${anoniem.length} anoniem(e) account(s) over`);
  if (vreemd.length) fout.push(`${vreemd.length} team(s) over`);
  if (codes.length) fout.push(`${codes.length} teamcode(s) over`);
  if (wees.length) fout.push(`${wees.length} gebruikersdocument(en) zonder account`);
  console.log(fout.length ? `NIET LEEG: ${fout.join(', ')}` : 'Leeg op het eigen account na.');
  process.exit(fout.length ? 1 : 0);
})().catch((e) => {
  console.error('Controle mislukt:', e.message, e.context?.body ? JSON.stringify(e.context.body).slice(0, 300) : '');
  process.exit(2);
});
