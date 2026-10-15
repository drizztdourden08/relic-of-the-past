/* @layer tooling-scripts @kind logic */
import fs from 'fs';
import path from 'path';
import { walkFiles } from '../walk.mjs';

const VAR_REF = /var\(\s*(--[\w-]+)/g;
const CSS_DEF = /(--[\w-]+)\s*:/g;
const TS_OBJ_DEF = /['"`](--[\w-]+)['"`]\s*:/g;
const SET_PROP = /setProperty\(\s*['"`](--[\w-]+)['"`]/g;

let definedCache = null;

const buildDefined = (root) => {
  if (definedCache) return definedCache;
  const defined = new Set();
  for (const rel of walkFiles(root)) {
    if (!/\.(css|ts|tsx|html)$/.test(rel)) continue;
    const content = fs.readFileSync(path.join(root, rel), 'utf8');
    if (rel.endsWith('.css')) {
      for (const m of content.matchAll(CSS_DEF)) defined.add(m[1]);
    } else {
      for (const m of content.matchAll(TS_OBJ_DEF)) defined.add(m[1]);
      for (const m of content.matchAll(SET_PROP)) defined.add(m[1]);
    }
  }
  definedCache = defined;
  return defined;
};

const run = async (records, ctx) => {
  const defined = buildDefined(ctx.root);
  const findings = [];
  for (const r of records) {
    const content = fs.readFileSync(path.join(ctx.root, r.rel), 'utf8');
    const seen = new Set();
    for (const m of content.matchAll(VAR_REF)) {
      const name = m[1];
      if (defined.has(name) || seen.has(name)) continue;
      const after = content[m.index + m[0].length];
      if (after === '$' || after === '{') continue;
      seen.add(name);
      findings.push({
        path: r.rel, tool: 'dead-css-var', rule: 'undefined-var', severity: 'error',
        message: `CSS variable ${name} is referenced but never defined`,
      });
    }
  }
  return findings;
};

const adapter = {
  name: 'dead-css-var',
  appliesTo: (r) => /\.(css|ts|tsx)$/.test(r.rel) && !r.vendored,
  available: () => true,
  run,
};

export { adapter };
