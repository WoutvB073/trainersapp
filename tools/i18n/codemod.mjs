// Eenmalig (0.25.0): zet de teksten die scan.mjs vindt in t(…) en voegt de import toe.
//   node tools/i18n/codemod.mjs [bestand-filter]
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { onvertaald } from './scan.mjs';

const filter = process.argv[2];
const per = new Map();
for (const x of onvertaald(true)) {
  if (filter && !x.bestand.includes(filter)) continue;
  per.set(x.pad, [...(per.get(x.pad) ?? []), x]);
}

const lit = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;

for (const [pad, lijst] of per) {
  let bron = fs.readFileSync(pad, 'utf8');
  const edits = [];
  for (const { node, sf } of lijst) {
    const start = node.getStart(sf);
    const eind = node.getEnd();
    if (ts.isJsxText(node)) {
      const tekst = node.getText(sf);
      const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(tekst);
      const kern = m[2].replace(/\s+/g, ' ');
      edits.push({ start, eind, nieuw: `${m[1]}{t(${lit(kern)})}${m[3]}` });
    } else if (ts.isTemplateExpression(node)) {
      let tekst = node.head.text;
      const vars = [];
      node.templateSpans.forEach((sp, i) => {
        const e = sp.expression.getText(sf);
        const naam = /^[a-zA-Z_]\w*$/.test(e) ? e : /^[\w.]+\.(\w+)$/.test(e) ? e.match(/\.(\w+)$/)[1] : `w${i}`;
        vars.push([naam, e]);
        tekst += `{${naam}}` + sp.literal.text;
      });
      const uniek = new Map(vars);
      const obj = [...uniek].map(([n, e]) => (n === e ? n : `${n}: ${e}`)).join(', ');
      edits.push({ start, eind, nieuw: `t(${lit(tekst)}, { ${obj} })` });
    } else {
      const ouder = node.parent;
      const tekst = node.text;
      // JSX-attribuut zonder accolades: title="…" → title={t('…')}
      if (ts.isJsxAttribute(ouder)) edits.push({ start, eind, nieuw: `{t(${lit(tekst)})}` });
      else edits.push({ start, eind, nieuw: `t(${lit(tekst)})` });
    }
  }
  // Geneste teksten (een tekst binnen een andere) pas in een volgende ronde.
  const buiten = edits.filter((e) => !edits.some((o) => o !== e && o.start <= e.start && o.eind >= e.eind));
  edits.length = 0;
  edits.push(...buiten);
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) bron = bron.slice(0, e.start) + e.nieuw + bron.slice(e.eind);
  if (!/import \{[^}]*\bt\b[^}]*\} from '[./]+i18n\/t'/.test(bron)) {
    const rel = path.relative(path.dirname(pad), path.resolve('src/i18n/t')).replace(/\\/g, '/');
    const imp = `import { t } from '${rel.startsWith('.') ? rel : './' + rel}';\n`;
    // Na de laatste import-regel.
    const regels = bron.split('\n');
    let laatste = -1;
    for (let i = 0; i < regels.length; i++) if (/^import .* from '.*';$/.test(regels[i]) || /^\} from '.*';$/.test(regels[i])) laatste = i;
    regels.splice(laatste + 1, 0, imp.trimEnd());
    bron = regels.join('\n');
  }
  fs.writeFileSync(pad, bron);
  console.log(`${path.relative('src', pad)}: ${edits.length}`);
}
