/* @layer tooling-scripts @kind logic */
import fs from 'fs';
import path from 'path';

const extOf = (p) => (p.toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1] || '';

const wrap = (p, body) => {
  const e = extOf(p);
  if (['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'c', 'h', 'cpp', 'hpp', 'css', 'scss'].includes(e)) return `/* ${body} */`;
  if (e === 'md') return `<!-- ${body} -->`;
  if (e === 'bat') return `REM ${body}`;
  if (['sh', 'ps1', 'yml', 'yaml', 'toml'].includes(e) || path.basename(p) === 'Makefile') return `# ${body}`;
  return null;
};

const writeTags = (root, records) => {
  let written = 0, skipped = 0;
  for (const r of records) {
    if (r.vendored || r.lang === 'Binary' || r.tagSource === 'header') { skipped++; continue; }
    const line = wrap(r.rel, `@layer ${r.layer} @kind ${r.kind}`);
    if (!line) { skipped++; continue; }

    const abs = path.join(root, r.rel);
    const content = fs.readFileSync(abs, 'utf8');
    if (/@layer\s+[a-z-]+/i.test(content.slice(0, 1200))) { skipped++; continue; }

    const lines = content.split('\n');
    const at = lines[0]?.startsWith('#!') ? 1 : 0;
    lines.splice(at, 0, line);
    fs.writeFileSync(abs, lines.join('\n'));
    written++;
  }
  return { written, skipped };
};

export { writeTags };
