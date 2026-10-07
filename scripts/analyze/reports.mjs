/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Design-system enforcement reports. Reads scripts/analyze/report.json (run
 * `npm run analyze -- --json` first; the npm `report*` scripts do this) and
 * prints the raw-HTML (R11), structure (R12), and token (R13) findings.
 * Usage: node scripts/analyze/reports.mjs [html|structure|tokens|all]
 */
import fs from 'fs';
import path from 'path';

const report = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts/analyze/report.json'), 'utf8'));
const which = process.argv[2] ?? 'all';

const F = report.findings;
const sel = {
  html: F.filter((f) => f.tool === 'eslint' && f.rule === 'local/no-raw-html'),
  structure: F.filter((f) => f.tool === 'structure-policy'),
  tokens: F.filter((f) => f.tool === 'stylelint' && (f.rule === 'color-no-hex' || f.rule === 'color-named')),
};

const byFile = (list) => {
  const m = new Map();
  for (const f of list) m.set(f.path, (m.get(f.path) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1]);
};

const section = (title, list, topN = 15) => {
  console.log(`\n=== ${title}: ${list.length} findings across ${new Set(list.map((f) => f.path)).size} files ===`);
  for (const [file, n] of byFile(list).slice(0, topN)) console.log(`  ${String(n).padStart(4)}  ${file}`);
  if (byFile(list).length > topN) console.log(`  ... ${byFile(list).length - topN} more files`);
};

if (which === 'html' || which === 'all') section('R11  Raw HTML outside primitives (warn → error)', sel.html);
if (which === 'structure' || which === 'all') section('R12  Component-structure violations (warn → error)', sel.structure, 40);
if (which === 'tokens' || which === 'all') section('R13  Non-token colors in component CSS (warn → error)', sel.tokens);

if (which === 'all') {
  console.log(`\n── Totals ──  raw-HTML: ${sel.html.length}   structure: ${sel.structure.length}   tokens: ${sel.tokens.length}`);
}
