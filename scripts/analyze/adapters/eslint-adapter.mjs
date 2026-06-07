/**
 * @layer tooling-scripts
 * @kind logic
 *
 * ESLint adapter (TS/JS quality: max-lines, func-style, exports-at-end, …).
 * Full mode lints `.`; diff mode lints only the changed files.
 */
import { sh, toolExists, toRel } from './_run.mjs';

const LANGS = new Set(['TypeScript', 'TypeScript-React', 'JavaScript', 'JavaScript-React']);

const run = async (records, ctx) => {
  const { root, mode } = ctx;
  const target = mode === 'diff'
    ? records.map((r) => `"${r.rel}"`).join(' ')
    : '.';
  if (!target) return [];
  const { stdout } = sh(`npx eslint ${target} -f json`, root);
  const start = stdout.indexOf('[');
  if (start < 0) return [];
  let results;
  try { results = JSON.parse(stdout.slice(start)); } catch { return []; }
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
