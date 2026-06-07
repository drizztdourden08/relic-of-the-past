/* @layer tooling-scripts @kind logic */
/**
 * Project file classifier. Walks the repo, classifies every source file by
 * language, architectural role, and type (Data is one type), and reports line
 * counts. Writes a full CSV and prints summary tables + the oversized (>200
 * code-line) files grouped so data vs logic is obvious.
 *
 * Usage: node scripts/utils/classify-files.mjs
 * Tags (@layer / @kind) in a file header override the heuristics when present.
 */
import fs from 'fs';
import path from 'path';
import { classifyLang, classifyRole, classifyType, readLayerTag } from './classify/rules.mjs';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'release', 'coverage', '.vite', 'out', 'build-output', 'saves', 'test-roms', 'assets', 'temp-scripts']);
const SKIP_REL = ['apps/desktop/public/wasm'];
// Non-source debris / generated artifacts that shouldn't be classified as code.
const SKIP_FILE = /(\.jsonl|\.vcxproj|\.filters|\.sln|\.bmp|\.map|\.csv|package-lock\.json)$/i;
// Vendored / external code we don't author or hold to our standards.
const isVendored = (rel) => rel.startsWith('core/zelda3/') || rel.includes('/third_party/');
const MAX = 200;

const walk = (dir, acc) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.claude') continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || SKIP_REL.some((s) => rel.startsWith(s))) continue;
      walk(full, acc);
    } else if (!SKIP_FILE.test(rel)) {
      acc.push(rel);
    }
  }
  return acc;
};

const codeLineCount = (content) =>
  content.split('\n').filter((l) => l.trim() && !/^\s*(\/\/|\*|\/\*|\*\/)/.test(l)).length;

const analyze = (rel) => {
  const lang = classifyLang(rel);
  const role = classifyRole(rel);
  let raw = 0, code = 0, type = 'asset', source = 'heuristic', layerTag = null;
  if (lang !== 'Binary') {
    const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    raw = content.split('\n').length;
    code = codeLineCount(content);
    ({ type, source } = classifyType(rel, content));
    layerTag = readLayerTag(content);
  }
  return { rel, lang, role, type, source, raw, code, layerTag, vendored: isVendored(rel) };
};

const tally = (rows, key) => {
  const m = new Map();
  for (const r of rows) {
    const k = r[key];
    const e = m.get(k) ?? { files: 0, raw: 0, code: 0 };
    e.files++; e.raw += r.raw; e.code += r.code;
    m.set(k, e);
  }
  return [...m.entries()].sort((a, b) => b[1].code - a[1].code);
};

const printTable = (title, entries) => {
  console.log(`\n=== ${title} ===`);
  console.log('  files  rawLines  codeLines  key');
  for (const [k, e] of entries) {
    console.log(`  ${String(e.files).padStart(5)}  ${String(e.raw).padStart(8)}  ${String(e.code).padStart(9)}  ${k}`);
  }
};

const rows = walk(ROOT, []).map(analyze);

console.log(`Scanned ${rows.length} files (binaries counted, 0 lines).`);
printTable('BY ARCHITECTURAL ROLE', tally(rows, 'role'));
printTable('BY TYPE', tally(rows, 'type'));
printTable('BY LANGUAGE', tally(rows, 'lang'));

const oversized = rows.filter((r) => r.code > MAX && !r.vendored).sort((a, b) => b.code - a.code);
const vendoredOver = rows.filter((r) => r.code > MAX && r.vendored).length;
console.log(`\n=== OVERSIZED — OURS (>${MAX} code lines): ${oversized.length} files (${vendoredOver} more in vendored/, excluded) ===`);
console.log('  codeLines  type          role                      file');
for (const r of oversized) {
  console.log(`  ${String(r.code).padStart(9)}  ${r.type.padEnd(12)}  ${r.role.padEnd(24)}  ${r.rel}`);
}

printTable(`OVERSIZED (OURS) GROUPED BY TYPE`, tally(oversized, 'type'));

const tagged = rows.filter((r) => r.source === 'tag' || r.layerTag).length;
console.log(`\nTagged files: ${tagged}/${rows.length} (untagged use heuristics).`);

const csv = ['path,language,role,type,source,layerTag,rawLines,codeLines,oversized']
  .concat(rows.map((r) => `${r.rel},${r.lang},${r.role},${r.type},${r.source},${r.layerTag ?? ''},${r.raw},${r.code},${r.code > MAX}`))
  .join('\n');
fs.writeFileSync(path.join(ROOT, 'scripts/utils/classification-report.csv'), csv);
console.log('\nFull per-file report → scripts/utils/classification-report.csv');
