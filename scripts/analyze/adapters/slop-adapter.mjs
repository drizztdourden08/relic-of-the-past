/**
 * @layer tooling-scripts
 * @kind logic
 *
 * AI-writing gate for every language the other adapters miss: C, CSS, shell,
 * batch, YAML, JSON, XML, Make. TS/JS go through ESLint (local/no-em-dash and
 * friends) and Markdown through the markdownlint custom rules, so both are
 * skipped here to keep one finding per hit.
 *
 * Findings are errors, so they gate `analyze:ci` the same way ESLint findings do.
 * Vendored files are left out; core/zelda3 is upstream code we do not rewrite.
 *
 * Escape hatch: put `slop-ok` in a comment on the same line.
 */
import fs from 'fs';
import path from 'path';
import { DEFAULT_ALLOW, RULE_BY_GROUP, findSlop } from '../../lint/slop-patterns.mjs';
import { classifyLines } from '../../lint/slop-line-kind.mjs';

const LINTED_ELSEWHERE = new Set([
  'TypeScript', 'TypeScript-React', 'JavaScript', 'JavaScript-React', 'Markdown', 'Binary',
]);
// Generated output and binary-ish payloads have no prose to fix.
const SKIP_KIND = new Set(['generated', 'asset']);
// Character patterns are safe anywhere; word patterns need prose around them.
const CHARS = ['dash', 'punct'];
const ALL = ['dash', 'punct', 'prose'];
const OPT_OUT = /slop-ok/;

// Text this repo does not author, so a fix here is either wrong or discarded.
// .claude/ is re-rendered from the private claude-config repo; the font notice is
// the foundry's wording; gradlew ships with Gradle; report.json is this harness
// quoting its own findings back. The private-vault paths are deliberately absent:
// they are linted and fixed here, then pushed back to the vault.
const NOT_OURS = [
  /^\.claude\//,
  /^apps\/web\/src\/ui\/design-system\/fonts\//,
  /^apps\/mobile\/android\/gradlew/,
  /^scripts\/analyze\/report\.json$/,
];
const notOurs = (rel) => NOT_OURS.some((re) => re.test(rel.replace(/\\/g, '/')));

const findingsFor = (rel, lang, text) => {
  const lines = text.split('\n');
  const kinds = classifyLines(text, lang);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (OPT_OUT.test(lines[i])) continue;
    const groups = kinds[i] === 'other' ? CHARS : ALL;
    for (const hit of findSlop(lines[i], { allow: DEFAULT_ALLOW, groups })) {
      out.push({
        path: rel,
        tool: 'slop',
        rule: RULE_BY_GROUP[hit.group],
        severity: 'error',
        line: i + 1,
        message: hit.message,
      });
    }
  }
  return out;
};

const run = async (records, ctx) =>
  records.flatMap((r) => {
    if (notOurs(r.rel)) return [];
    let text;
    try { text = fs.readFileSync(path.join(ctx.root, r.rel), 'utf8'); } catch { return []; }
    if (text.includes('\0')) return [];
    return findingsFor(r.rel, r.lang, text);
  });

const adapter = {
  name: 'slop',
  appliesTo: (r) => !LINTED_ELSEWHERE.has(r.lang) && !SKIP_KIND.has(r.kind) && !r.vendored,
  available: () => true,
  run,
};

export { adapter };
