/**
 * @layer tooling-scripts
 * @kind logic
 *
 * markdownlint adapter (docs quality). Findings are 'warn' by default — docs
 * follow the conventions but don't gate commits on prose style.
 */
import { sh, toolExists } from './_run.mjs';

const LINE = /^(.+?):(\d+)(?::\d+)?\s+(?:\w+\s+)?(MD\d+\/[\w-]+)\s+(.*)$/;

const run = async (records, ctx) => {
  const { root, mode } = ctx;
  const target = mode === 'diff' ? records.map((r) => `"${r.rel}"`).join(' ') : '"**/*.md"';
  if (!target) return [];
  const { stderr, stdout } = sh(`npx markdownlint-cli2 ${target}`, root);
  const out = [];
  for (const raw of `${stdout}\n${stderr}`.split('\n')) {
    const m = raw.match(LINE);
    if (!m) continue;
    out.push({ path: m[1].replace(/\\/g, '/'), tool: 'markdownlint', rule: m[3], severity: 'warn', line: Number(m[2]), message: m[4] });
  }
  return out;
};

const adapter = {
  name: 'markdownlint',
  appliesTo: (r) => r.lang === 'Markdown' && !r.vendored,
  available: (root) => toolExists('npx markdownlint-cli2', root),
  run,
};

export { adapter };
