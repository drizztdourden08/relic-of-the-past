/**
 * @layer tooling-scripts
 * @kind logic
 *
 * ESLint adapter (TS/JS quality: max-lines, func-style, exports-at-end, the
 * AI-writing rules, ...). Full mode lints `.`; diff mode lints only the changed
 * files, in batches: Windows caps a command line at 8191 characters, and a wide
 * changeset used to blow past that and report nothing at all.
 */
import { batchQuoted, sh, toolExists, toRel } from './_run.mjs';

const LANGS = new Set(['TypeScript', 'TypeScript-React', 'JavaScript', 'JavaScript-React']);
const lint = (target, root) => {
  const { stdout } = sh(`npx eslint ${target} -f json`, root);
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
  available: (root) => toolExists('npx eslint', root),
  run,
};

export { adapter };
