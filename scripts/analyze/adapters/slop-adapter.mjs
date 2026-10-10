/* @layer tooling-scripts @kind logic */
import fs from 'fs';
import path from 'path';
import { DEFAULT_ALLOW, RULE_BY_GROUP, findSlop } from '@drizztdourden08/brock-lint-config/slop-patterns';
import { classifyLines } from '@drizztdourden08/brock-lint-config/slop-line-kind';

const ALLOW = [...DEFAULT_ALLOW, 'enhanced'];

const LINTED_ELSEWHERE = new Set([
  'TypeScript', 'TypeScript-React', 'JavaScript', 'JavaScript-React', 'Markdown', 'Binary',
]);
const SKIP_KIND = new Set(['generated', 'asset']);
const CHARS = ['dash', 'punct'];
const ALL = ['dash', 'punct', 'prose'];
const OPT_OUT = /slop-ok/;

const NOT_OURS = [
  /^\.claude\//,
  /^apps\/web\/src\/fonts\//,
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
    for (const hit of findSlop(lines[i], { allow: ALLOW, groups })) {
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
