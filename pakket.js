// Verhuizing van TopTraining (woutvb073.github.io/trainersapp) naar TopTrainer (app.toptrainerapp.com), 0.39.0.
// Gedeeld door de doorstuurpagina op het oude adres (verhuis/verhuis.js) en de nieuwe app (src/verhuis/ontvang.ts).
// Geen Firebase-code: alleen standaard browserfuncties (WebCrypto, CompressionStream), zodat de oude pagina klein blijft.
//
// Een pakket = alle opslagsleutels `trainersapp.…` van het oude adres als JSON, ingepakt (deflate-raw) en versleuteld met
// AES-256-GCM. De sleutel gaat nooit naar de server: hij staat alleen in de link (`#/verhuis/<id>.<sleutel>`) en in een cookie.
// Zie PLAN-TOPTRAINER.md, "Verhuizing van de lokale gegevens".

/** Sleutels die niet meegaan: test-instellingen, de installatiekeuze van dit adres en de verhuizing zelf. */
export const NIET_MEE = [
  /^trainersapp\.(testEditor|testCamera|emulator|echteLinks|3dAltijd)$/,
  /^trainersapp\.(geinstalleerd|browserGekozen)$/,
  /^trainersapp\.verhuis/,
];

/** Alle sleutels van de app die mee moeten (`opslag` = localStorage of een nep-opslag in de tests). */
export function verzamel(opslag) {
  const uit = {};
  for (let i = 0; i < opslag.length; i += 1) {
    const k = opslag.key(i);
    if (!k || !k.startsWith('trainersapp.') || NIET_MEE.some((r) => r.test(k))) continue;
    const v = opslag.getItem(k);
    if (v != null) uit[k] = v;
  }
  return uit;
}

// ---------- base64url ----------

export function naarBase64Url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 0x8000)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function uitBase64Url(tekst) {
  const s = atob(tekst.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (tekst.length % 4)) % 4));
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i += 1) b[i] = s.charCodeAt(i);
  return b;
}

// ---------- codes ----------

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Id van 22 tekens (± 131 bits toeval): niet te raden. */
export function nieuwId() {
  const b = crypto.getRandomValues(new Uint8Array(22));
  return Array.from(b, (x) => LETTERS[x % 62]).join('');
}

export const isId = (id) => typeof id === 'string' && /^[A-Za-z0-9]{22}$/.test(id);

/** `<id>.<sleutel>` uit een link of cookie; `null` als het er niet als een verhuiscode uitziet. */
export function leesCode(tekst) {
  const m = /^([A-Za-z0-9]{22})\.([A-Za-z0-9_-]{43})$/.exec(tekst ?? '');
  return m ? { id: m[1], sleutel: m[2] } : null;
}

// ---------- inpakken en versleutelen ----------

async function stroom(bytes, soort) {
  const s = new Blob([bytes]).stream().pipeThrough(soort);
  return new Uint8Array(await new Response(s).arrayBuffer());
}

/** Inpakken + versleutelen. Geeft de versleutelde tekst (base64url), de sleutel (base64url) en hoe het ingepakt is. */
export async function pak(gegevens) {
  const json = new TextEncoder().encode(JSON.stringify({ v: 1, gemaakt: Date.now(), opslag: gegevens }));
  const z = typeof CompressionStream === 'function' ? 'deflate-raw' : 'geen';
  const klein = z === 'deflate-raw' ? await stroom(json, new CompressionStream('deflate-raw')) : json;
  const ruw = crypto.getRandomValues(new Uint8Array(32));
  const sleutel = await crypto.subtle.importKey('raw', ruw, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const geheim = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sleutel, klein));
  const alles = new Uint8Array(iv.length + geheim.length);
  alles.set(iv, 0);
  alles.set(geheim, iv.length);
  return { data: naarBase64Url(alles), sleutel: naarBase64Url(ruw), z };
}

/** Ontsleutelen + uitpakken. Gooit een fout als de sleutel niet klopt of het pakket beschadigd is. */
export async function uitpak(data, sleutelTekst, z) {
  const alles = uitBase64Url(data);
  const sleutel = await crypto.subtle.importKey('raw', uitBase64Url(sleutelTekst), 'AES-GCM', false, ['decrypt']);
  const klein = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: alles.subarray(0, 12) }, sleutel, alles.subarray(12)));
  const json = z === 'deflate-raw' ? await stroom(klein, new DecompressionStream('deflate-raw')) : klein;
  const x = JSON.parse(new TextDecoder().decode(json));
  if (!x || x.v !== 1 || typeof x.opslag !== 'object') throw new Error('Onbekend pakket');
  return x;
}

// ---------- Firestore (REST, zonder Firebase-code) ----------

/** Een pakket past niet altijd in één document (max. 1 MB): dan in delen van dit aantal tekens. */
export const DEEL = 900000;

/** Documenten: het eerste heet `<id>`, de volgende `<id>-2` … `<id>-9`. */
export const deelId = (id, i) => (i === 0 ? id : `${id}-${i + 1}`);

/** Adressen voor Firestore en anoniem inloggen (echt project of emulator). */
export function adressen({ projectId, apiKey, emulator }) {
  return emulator
    ? {
        aanmelden: `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
        documenten: `http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents/verhuizingen`,
      }
    : {
        aanmelden: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
        documenten: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/verhuizingen`,
      };
}

/** Pakket online zetten (oude adres). Geeft de code `<id>.<sleutel>` en tot wanneer hij geldig is. */
export async function zetKlaar(gegevens, config, dagen = 30) {
  const a = adressen(config);
  const p = await pak(gegevens);
  const aan = await fetch(a.aanmelden, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
  if (!aan.ok) throw new Error(`aanmelden ${aan.status}`);
  const { idToken, localId } = await aan.json();
  const id = nieuwId();
  const delen = [];
  for (let i = 0; i < p.data.length; i += DEEL) delen.push(p.data.slice(i, i + DEEL));
  if (delen.length > 9) throw new Error('te groot');
  const tot = Date.now() + dagen * 86400000;
  for (let i = 0; i < delen.length; i += 1) {
    const fields = {
      data: { stringValue: delen[i] },
      z: { stringValue: p.z },
      maker: { stringValue: localId },
      gemaakt: { integerValue: String(Date.now()) },
      verloopt: { timestampValue: new Date(tot).toISOString() },
      ...(i === 0 ? { delen: { integerValue: String(delen.length) } } : {}),
    };
    const r = await fetch(`${a.documenten}?documentId=${deelId(id, i)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ fields }),
    });
    if (!r.ok) throw new Error(`opslaan ${r.status}`);
  }
  return { code: `${id}.${p.sleutel}`, tot };
}

/** Pakket ophalen en openen (nieuwe adres). Geeft de opslagsleutels van het oude adres, of `null` als het pakket er niet (meer) is. */
export async function haalOp(code, config) {
  const c = leesCode(code);
  if (!c) return null;
  const a = adressen(config);
  const haal = async (id) => {
    const r = await fetch(`${a.documenten}/${id}`, { cache: 'no-store' });
    if (r.status === 404 || r.status === 403) return null;
    if (!r.ok) throw new Error(`ophalen ${r.status}`);
    return (await r.json()).fields ?? null;
  };
  const eerste = await haal(c.id);
  if (!eerste) return null;
  const verloopt = Date.parse(eerste.verloopt?.timestampValue ?? '');
  if (Number.isFinite(verloopt) && verloopt < Date.now()) return null;
  const aantal = Number(eerste.delen?.integerValue ?? 1);
  let data = eerste.data?.stringValue ?? '';
  for (let i = 1; i < aantal; i += 1) {
    const f = await haal(deelId(c.id, i));
    if (!f) return null;
    data += f.data?.stringValue ?? '';
  }
  const x = await uitpak(data, c.sleutel, eerste.z?.stringValue ?? 'geen');
  return x.opslag;
}
