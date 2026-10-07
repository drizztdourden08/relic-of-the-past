/**
 * @layer tooling-scripts
 * @kind logic
 *
 * markdownlint adapter (docs quality). Built-in MD### findings are 'warn': docs
 * follow the conventions but do not gate commits on prose style. The repo's own
 * ROTP### rules (the AI-writing gate, scripts/lint/markdown-rules/) are 'error'
 * and do gate, matching the ESLint side.
 */
import { batchQuoted, sh, toolExists } from './_run.mjs';

const LINE = /^(.+?):(\d+)(?::\d+)?\s+(?:\w+\s+)?((?:MD|ROTP)\d+\/[\w-]+)\s+(.*)$/;
const GATING = /^ROTP\d+\//;

const run = async (records, ctx) => {
  const { root, mode } = ctx;
  // --no-globs in diff mode: without it the config's "**/*.md" is added back and
  // every doc in the repo is linted just to have its findings filtered out again.
  if (!records.length) return [];
  const targets = mode === 'diff'
    ? batchQuoted(records.map((r) => r.rel)).map((b) => `--no-globs ${b}`)
    : ['"**/*.md"'];
  const lines = targets.flatMap((t) => {
    const { stderr, stdout } = sh(`npx markdownlint-cli2 ${t}`, root);
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
  available: (root) => toolExists('npx markdownlint-cli2', root),
  run,
};

export { adapter };
