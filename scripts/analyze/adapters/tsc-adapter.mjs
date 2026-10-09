/* @layer tooling-scripts @kind logic */
import { sh } from './_run.mjs';

const LINE = /^(.+?)\((\d+),\d+\):\s+error\s+(TS\d+):\s+(.*)$/;

const run = async (records, ctx) => {
  const { root, mode } = ctx;
  if (mode === 'diff' && records.length === 0) return [];
  const { stdout } = sh('pnpm exec tsc --noEmit --pretty false', root);
  const out = [];
  for (const raw of stdout.split('\n')) {
    const m = raw.match(LINE);
    if (!m) continue;
    out.push({
      path: m[1].replace(/\\/g, '/'), tool: 'tsc',
      rule: m[3], severity: 'error', line: Number(m[2]), message: m[4],
    });
  }
  return out;
};

const adapter = {
  name: 'tsc',
  appliesTo: (r) => r.lang === 'TypeScript' || r.lang === 'TypeScript-React',
  available: () => true,
  run,
};

export { adapter };
