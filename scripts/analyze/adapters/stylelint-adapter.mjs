/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Stylelint adapter (CSS/SCSS quality). Uses the stylelint Node API rather than
 * the CLI — the CLI's default string formatter pulls a broken transitive dep
 * (table → slice-ansi → astral-regex); the API avoids it.
 */
const run = async (records, ctx) => {
  const { root } = ctx;
  const files = records.map((r) => r.rel);
  if (!files.length) return [];
  let stylelint;
  try { stylelint = (await import('stylelint')).default; } catch { return []; }
  const { results } = await stylelint.lint({ files, cwd: root, formatter: () => '' });
  return results.flatMap((res) =>
    (res.warnings ?? []).map((w) => ({
      path: res.source.replace(/\\/g, '/').replace(`${root.replace(/\\/g, '/')}/`, ''),
      tool: 'stylelint', rule: w.rule ?? 'stylelint',
      severity: w.severity === 'error' ? 'error' : 'warn',
      line: w.line, message: w.text,
    })),
  );
};

const available = async () => {
  try { await import('stylelint'); return true; } catch { return false; }
};

const adapter = {
  name: 'stylelint',
  appliesTo: (r) => (r.lang === 'CSS' || r.lang === 'SCSS') && !r.vendored,
  available,
  run,
};

export { adapter };
