/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Loads the file-tags.jsonc manifest and matches paths against its globs. All
 * matching entries merge (later keys win). Highest-precedence tag source; see classify.mjs.
 */
import fs from 'fs';
import path from 'path';

// Whole-line `//` comments only: globs contain `/*` and `*/` (e.g. `**/*.json`), so
// block-comment stripping would corrupt them.
const stripJsonc = (s) => s.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');

const globToRegex = (glob) => {
  let re = '^';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') { re += '.*'; i++; if (glob[i + 1] === '/') i++; }
      else re += '[^/]*';
    } else if ('.+?^${}()|[]\\'.includes(c)) re += '\\' + c;
    else re += c;
  }
  return new RegExp(re + '$');
};

const loadManifest = (root) => {
  const file = path.join(root, 'scripts/analyze/file-tags.jsonc');
  const raw = JSON.parse(stripJsonc(fs.readFileSync(file, 'utf8')));
  return Object.entries(raw).map(([glob, tag]) => ({ re: globToRegex(glob), tag }));
};

const matchManifest = (manifest, rel) => {
  let merged = {};
  for (const { re, tag } of manifest) if (re.test(rel)) merged = { ...merged, ...tag };
  return merged;
};

export { loadManifest, matchManifest };
