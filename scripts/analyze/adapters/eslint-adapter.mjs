/* @layer tooling-scripts @kind logic */
import { batchQuoted, sh, toolExists, toRel } from './_run.mjs';

const LANGS = new Set(['TypeScript', 'TypeScript-React', 'JavaScript', 'JavaScript-React']);
const lint = (target, root) => {
  const { stdout } = sh(`pnpm exec eslint ${target} -f json --no-warn-ignored`, root);
  const start = stdout.indexOf('[');
  if (start < 0) return [];
  try { return JSON.parse(stdout.slice(start)); } catch { return []; }
};

const run = async (records, ctx) => {
  const { root, mode } = ctx;
  const targets = mode === 'diff' ? batchQuoted(records.map((r) => r.rel)) : ['.'];
  const results = targets.flatMap((t) => lint(t, root));
  return results.flatMap((res) =>
    (res.messages ?? []).map((m) => ({
      path: toRel(res.filePath, root), tool: 'eslint',
      rule: m.ruleId ?? 'eslint', severity: m.severity === 2 ? 'error' : 'warn',
      line: m.line, message: m.message,
    })),
  );
};

const adapter = {
  name: 'eslint',
  appliesTo: (r) => LANGS.has(r.lang) && !r.vendored,
  available: (root) => toolExists('pnpm exec eslint', root),
  run,
};

export { adapter };
