/**
 * @layer tooling-scripts
 * @kind logic
 *
 * TypeScript typecheck adapter. tsc is project-wide, so it always runs the full
 * program; the facade filters findings to the changed set in diff mode.
 */
import { sh } from './_run.mjs';

const LINE = /^(.+?)\((\d+),\d+\):\s+error\s+(TS\d+):\s+(.*)$/;

const run = async (_records, ctx) => {
  const { root } = ctx;
  const { stdout } = sh('npx tsc --noEmit --pretty false', root);
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
