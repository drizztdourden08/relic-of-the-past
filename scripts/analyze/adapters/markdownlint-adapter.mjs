/* @layer tooling-scripts @kind logic */
import { batchQuoted, sh, toolExists } from './_run.mjs';

const LINE = /^(.+?):(\d+)(?::\d+)?\s+(?:\w+\s+)?((?:MD|ROTP)\d+\/[\w-]+)\s+(.*)$/;
const GATING = /^ROTP\d+\//;

const run = async (records, ctx) => {
  const { root, mode } = ctx;
  if (!records.length) return [];
  const targets = mode === 'diff'
    ? batchQuoted(records.map((r) => r.rel)).map((b) => `--no-globs ${b}`)
    : ['"**/*.md"'];
  const lines = targets.flatMap((t) => {
    const { stderr, stdout } = sh(`pnpm exec markdownlint-cli2 ${t}`, root);
    return `${stdout}\n${stderr}`.split('\n');
  });
  const out = [];
  for (const raw of lines) {
    const m = raw.match(LINE);
    if (!m) continue;
    out.push({
      path: m[1].replace(/\\/g, '/'), tool: 'markdownlint', rule: m[3],
      severity: GATING.test(m[3]) ? 'error' : 'warn', line: Number(m[2]), message: m[4],
    });
  }
  return out;
};

const adapter = {
  name: 'markdownlint',
  appliesTo: (r) => r.lang === 'Markdown' && !r.vendored,
  available: (root) => toolExists('pnpm exec markdownlint-cli2', root),
  run,
};

export { adapter };
