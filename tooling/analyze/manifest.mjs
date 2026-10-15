/* @layer tooling-scripts @kind logic */
import fs from 'fs';
import path from 'path';

const stripJsonc = (s) => s.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');

const REGEX_SPECIALS = '.+?^${}()|[]\\';

const starToken = (glob, i) => {
  if (glob[i + 1] !== '*') return { text: '[^/]*', next: i + 1 };
  return { text: '.*', next: glob[i + 2] === '/' ? i + 3 : i + 2 };
};

const globToken = (glob, i) => {
  const c = glob[i];
  if (c === '*') return starToken(glob, i);
  if (REGEX_SPECIALS.includes(c)) return { text: `\\${c}`, next: i + 1 };
  return { text: c, next: i + 1 };
};

const globToRegex = (glob) => {
  let re = '^';
  let i = 0;
  while (i < glob.length) {
    const { text, next } = globToken(glob, i);
    re += text;
    i = next;
  }
  return new RegExp(`${re}$`);
};

const loadManifest = (root) => {
  const file = path.join(root, 'tooling/analyze/file-tags.jsonc');
  const raw = JSON.parse(stripJsonc(fs.readFileSync(file, 'utf8')));
  return Object.entries(raw).map(([glob, tag]) => ({ re: globToRegex(glob), tag }));
};

const matchManifest = (manifest, rel) => {
  let merged = {};
  for (const { re, tag } of manifest) if (re.test(rel)) merged = { ...merged, ...tag };
  return merged;
};

export { loadManifest, matchManifest };
