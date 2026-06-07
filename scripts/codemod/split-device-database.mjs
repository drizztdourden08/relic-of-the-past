/* Throwaway codemod: partition DEVICE_DATABASE entries into per-vendor chunks. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const src = resolve(root, 'shared/input/device-database.ts');
const outDir = resolve(root, 'shared/input/data/devices');
mkdirSync(outDir, { recursive: true });

const text = readFileSync(src, 'utf8');

// Grab everything between the array open and close.
const decl = text.indexOf('DEVICE_DATABASE: DeviceDatabaseEntry[] = [');
const start = text.indexOf('[', text.indexOf('= [', decl));
const end = text.indexOf('\n];', start);
const body = text.slice(start + 1, end);

// Each entry is a single line ending in "},". Keep raw lines verbatim.
const entryLines = body
  .split('\n')
  .map((l) => l.replace(/\s+$/, ''))
  .filter((l) => l.trim().length > 0);

// Pull the name out of each entry line.
const nameOf = (line) => {
  const m = line.match(/name:\s*"((?:[^"\\]|\\.)*)"/);
  if (!m) throw new Error('no name in entry: ' + line.slice(0, 80));
  return m[1];
};

const buckets = { EIGHTBITDO: [], SONY: [], MICROSOFT: [], NINTENDO: [], MISC: [] };

const classify = (name) => {
  const n = name.toLowerCase();
  if (n.startsWith('8bit')) return 'EIGHTBITDO';
  if (/(playstation|dualshock|dualsense|sony|\bps[345]\b|\bps3\b|\bps4\b|\bps5\b)/.test(n)) return 'SONY';
  if (/(xbox|microsoft)/.test(n)) return 'MICROSOFT';
  if (/(switch|joy-?con|gamecube|\bwii\b|nintendo|pro controller)/.test(n)) return 'NINTENDO';
  return 'MISC';
};

for (const line of entryLines) {
  const bucket = classify(nameOf(line));
  buckets[bucket].push(line.trimStart());
}

const fileFor = { EIGHTBITDO: '8bitdo', SONY: 'sony', MICROSOFT: 'microsoft', NINTENDO: 'nintendo', MISC: 'misc' };

const header = (count) =>
  `/* @layer shared-input @kind data */\n` +
  `// Auto-generated device-database chunk. Source: SDL_GameControllerDB.\n` +
  `// ${count} entries. Do not edit by hand.\n\n` +
  `import type { DeviceDatabaseEntry } from '../../types';\n\n`;

let total = 0;
for (const [bucket, lines] of Object.entries(buckets)) {
  total += lines.length;
  const fname = fileFor[bucket];
  const out =
    header(lines.length) +
    `const ${bucket}: DeviceDatabaseEntry[] = [\n` +
    lines.map((l) => '  ' + l).join('\n') +
    `\n];\n\n` +
    `export { ${bucket} };\n`;
  writeFileSync(resolve(outDir, `${fname}.data.ts`), out, 'utf8');
  console.log(`${bucket} (${fname}.data.ts): ${lines.length}`);
}
console.log('TOTAL', total);
