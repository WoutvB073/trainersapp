// Zoekt teksten in de broncode die (nog) niet via t() lopen. Gebruikt door tests/vertaling.test.ts en los:
//   node tools/i18n/scan.mjs            → lijst per bestand
//   node tools/i18n/scan.mjs --sleutels → alle t('…')-sleutels zonder Engelse vertaling
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const WORTEL = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '../..');
const SRC = path.join(WORTEL, 'src');

/** Bestanden zonder app-tekst voor de gebruiker (animatie-rekenwerk, online plumbing, data, vertalingen zelf). */
const OVERSLAAN = [
  /^i18n[\\/]/,
  /^help[\\/]inhoud\.ts$/,
  /^anim[\\/](timeline|poppetje|fysiek|doelnet|render3d|weergave)\.ts$/,
  /^online[\\/](firebase|config|samenvoegen)\.ts$/,
  /\.d\.ts$/,
  /^data[\\/]oefeningen\.ts$/,
];

/** Functies waarvan de tekstargumenten al vertaald worden of geen tekst voor de gebruiker zijn. */
const VERTAALT = new Set(['t', 'vt', 'tIn', 'zin', 'aantal', 'meervoud']);
const GEEN_TEKST = new Set([
  'querySelector',
  'querySelectorAll',
  'closest',
  'getItem',
  'setItem',
  'removeItem',
  'addEventListener',
  'removeEventListener',
  'dispatchEvent',
  'Event',
  'CustomEvent',
  'createElement',
  'getContext',
  'require',
  'import',
  'matchMedia',
  'getPropertyValue',
  'setProperty',
  'classList',
  'toggle',
  'add',
  'remove',
  'contains',
  'startsWith',
  'endsWith',
  'includes',
  'split',
  'replace',
  'join',
  'localeCompare',
  'test',
  'match',
  'Error',
  'TekeningFout',
  'console.log',
  'warn',
  'error',
  'log',
  'fetch',
  'collection',
  'doc',
  'where',
  'orderBy',
  'sleutelVoor',
]);

/** Lijkt dit op tekst die een gebruiker leest? */
export function isTekst(s) {
  const kaal = s.replace(/\$\{[^}]*\}/g, ' ').trim();
  if (!/[a-zA-Zà-ÿ]{2}/.test(kaal)) return false;
  if (/^[a-z0-9_.:/#?=&-]+$/i.test(kaal) && !/^[A-Z][a-zà-ÿ]+$/.test(kaal)) {
    // Eén "woord" zonder spaties: id, pad, css-klasse … behalve een los woord met hoofdletter ("Training").
    return false;
  }
  if (/^[a-z][a-z0-9-]*( [a-z][a-z0-9-]*)*$/.test(kaal) && kaal.includes('-')) return false; // css-klassen
  if (/^(M|L|C|Q|A|H|V|Z|m|l|c|q|a|h|v|z)[\d\s.,-]/.test(kaal)) return false; // svg-paden
  if (/^(rgba?|hsla?|var|url|translate|rotate|scale|matrix)\(/.test(kaal)) return false;
  if (/^#[0-9a-f]{3,8}$/i.test(kaal)) return false;
  if (/[0-9]+px|px [A-Za-z"]|sans-serif|rgba?[(]|[.]json$/.test(kaal)) return false; // lettertype, schaduw, bestandsnaam
  if (
    /^(Instagram|Facebook|Messenger|Snapchat|TikTok|LinkedIn|Twitter|WhatsApp|Line|Telegram|Safari|Chrome|Firefox|Edge|Samsung Internet|Android|iPhone|iPad|iOS|Mac|Windows|Google|Apple|TopTraining)$/.test(
      kaal,
    )
  )
    return false; // namen
  return true;
}

function bestanden(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? bestanden(p) : /\.(ts|tsx)$/.test(d.name) ? [p] : [];
  });
}

/** Letterlijke teksten in een argument: een tekst, of een keuze (a ? 'x' : 'y') tussen teksten. */
function letterlijk(a) {
  if (!a) return null;
  if (ts.isParenthesizedExpression(a)) return letterlijk(a.expression);
  if (ts.isStringLiteralLike(a)) return [a.text];
  if (ts.isConditionalExpression(a)) {
    const x = letterlijk(a.whenTrue);
    const y = letterlijk(a.whenFalse);
    return x && y ? [...x, ...y] : null;
  }
  return null;
}

function naamVan(expr) {
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
  return '';
}

/** Teksten die niet vertaald worden: { bestand, regel, tekst }[] */
export function onvertaald(metNodes = false) {
  const uit = [];
  for (const bestand of bestanden(SRC)) {
    const rel = path.relative(SRC, bestand);
    if (OVERSLAAN.some((r) => r.test(rel))) continue;
    const bron = fs.readFileSync(bestand, 'utf8');
    const sf = ts.createSourceFile(bestand, bron, ts.ScriptTarget.Latest, true, bestand.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const regels = bron.split('\n');
    const meld = (node, tekst) => {
      const r = sf.getLineAndCharacterOfPosition(node.getStart()).line;
      if (/i18n-ok/.test(regels[r] ?? '') || /i18n-ok/.test(regels[r - 1] ?? '')) return;
      uit.push({ bestand: rel.replace(/\\/g, '/'), regel: r + 1, tekst: tekst.trim().slice(0, 90), ...(metNodes ? { node, sf, pad: bestand } : {}) });
    };
    const bezoek = (node, binnenT) => {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
      if (ts.isTypeNode(node) || ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) return;
      if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
        const n = naamVan(node.expression);
        if (VERTAALT.has(n) || GEEN_TEKST.has(n)) {
          // Alleen de argumenten zelf overslaan; dieper genest (bv. callbacks) wel bekijken.
          for (const a of node.arguments ?? []) if (!(letterlijk(a) || ts.isTemplateExpression(a))) bezoek(a, binnenT);
          return;
        }
      }
      if (ts.isJsxText(node)) {
        if (/[a-zA-Zà-ÿ]{2}/.test(node.text)) meld(node, node.text);
        return;
      }
      if (ts.isJsxAttribute(node)) {
        const naam = node.name.getText();
        const tekstAttr = ['aria-label', 'title', 'placeholder', 'alt', 'label', 'titel', 'tekst', 'melding', 'uitleg', 'knop', 'naam', 'sub'].includes(naam);
        if (!tekstAttr) {
          // className, key, href … : geen tekst; wel expressies erin bekijken (bv. {t('…')} niet nodig).
          if (
            node.initializer &&
            ts.isJsxExpression(node.initializer) &&
            node.initializer.expression &&
            !ts.isStringLiteralLike(node.initializer.expression) &&
            !ts.isTemplateExpression(node.initializer.expression)
          )
            bezoek(node.initializer.expression, binnenT);
          return;
        }
      }
      if (
        ts.isPropertyAssignment(node) &&
        ts.isIdentifier(node.name) &&
        ['className', 'id', 'soort', 'naam_id', 'icoon', 'type', 'kleur', 'modus', 'thema', 'key', 'groep', 'sleutel'].includes(node.name.text)
      )
        return;
      if (ts.isElementAccessExpression(node)) return;
      if (
        ts.isBinaryExpression(node) &&
        [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(node.operatorToken.kind)
      )
        return;
      if (ts.isCaseClause(node)) {
        node.statements.forEach((s) => bezoek(s, binnenT));
        return;
      }
      if (ts.isStringLiteral(node) && node.parent && (ts.isPropertyAssignment(node.parent) || ts.isPropertySignature(node.parent)) && node.parent.name === node) return; // sleutel van een object
      if (ts.isStringLiteralLike(node) || ts.isTemplateExpression(node)) {
        const tekst = ts.isTemplateExpression(node) ? node.getText().slice(1, -1) : node.text;
        if (isTekst(tekst) && /\s/.test(tekst.trim()) ? true : /^[A-Z][a-zà-ÿ]{2,}/.test(tekst.trim()) && isTekst(tekst)) meld(node, tekst);
        if (ts.isTemplateExpression(node)) node.templateSpans.forEach((s) => bezoek(s.expression, binnenT));
        return;
      }
      ts.forEachChild(node, (c) => bezoek(c, binnenT));
    };
    bezoek(sf, false);
  }
  return uit;
}

/** Alle t('…')/aantal(…)-sleutels in de broncode. */
export function sleutels() {
  const uit = new Set();
  for (const bestand of bestanden(SRC)) {
    const rel = path.relative(SRC, bestand);
    if (/^i18n[\\/]/.test(rel)) continue;
    const bron = fs.readFileSync(bestand, 'utf8');
    const sf = ts.createSourceFile(bestand, bron, ts.ScriptTarget.Latest, true, bestand.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const bezoek = (node) => {
      if (ts.isCallExpression(node)) {
        const n = naamVan(node.expression);
        const args = n === 't' || n === 'vt' || n === 'zin' || n === 'tIn' ? [node.arguments[n === 'tIn' ? 1 : 0]] : n === 'aantal' || n === 'meervoud' ? [node.arguments[1], node.arguments[2]] : [];
        for (const a of args) for (const x of letterlijk(a) ?? []) uit.add(x);
      }
      ts.forEachChild(node, bezoek);
    };
    bezoek(sf);
  }
  return [...uit];
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  if (process.argv.includes('--sleutels')) {
    const { EN } = await import(new URL('../../src/i18n/en-data.mjs', import.meta.url)).catch(() => ({ EN: {} }));
    for (const s of sleutels()) if (!(s in EN)) console.log(JSON.stringify(s));
  } else {
    const lijst = onvertaald();
    const per = new Map();
    for (const x of lijst) per.set(x.bestand, [...(per.get(x.bestand) ?? []), x]);
    for (const [b, xs] of [...per].sort((a, b) => b[1].length - a[1].length)) {
      console.log(`== ${b} (${xs.length})`);
      if (process.argv.includes('-v')) for (const x of xs) console.log(`  ${x.regel}: ${x.tekst}`);
    }
    console.log(`totaal ${lijst.length}`);
  }
}
